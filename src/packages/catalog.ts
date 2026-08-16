import type { InstalledPackage, PackageLevel, PieceCard } from '../types'
import { GLOSSARY, LICENSES, MANIFEST, MNA_VENUE, PIECES, ROOMS } from '../demo/packageData'
import { putFile, savePackage } from './db'

export interface DownloadProgress {
  loaded: number
  total: number
  paused: boolean
}

const FILE_LIST = [
  'sounds/animals/jaguar.wav',
  'sounds/animals/xolo.wav',
  'sounds/instruments/teponaztli.wav',
  'narrations/coatlicue.wav',
  'narrations/ocelotl.wav',
  'narrations/xolotl.wav',
]

export function createVenueMaps(): InstalledPackage['maps'] {
  return {
    venue: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { kind: 'resguardo', label: MNA_VENUE.nombre },
          geometry: { type: 'Point', coordinates: [-99.1863, 19.426] },
        },
      ],
    },
    discovery: {
      type: 'FeatureCollection',
      features: PIECES.flatMap((p) => {
        const feats: GeoJSON.Feature[] = []
        if (p.lugares.hallazgo.coordinates) {
          feats.push({
            type: 'Feature',
            properties: { kind: 'hallazgo', label: p.lugares.hallazgo.etiqueta, piece: p.id, certeza: p.lugares.hallazgo.certeza },
            geometry: { type: 'Point', coordinates: p.lugares.hallazgo.coordinates },
          })
        }
        return feats
      }),
    },
  }
}

export async function downloadDemoPackage(
  level: PackageLevel,
  onProgress: (p: DownloadProgress) => void,
  signal: { paused: boolean; aborted: boolean },
): Promise<InstalledPackage> {
  const files = FILE_LIST.filter((f) => {
    if (level === 'esencial') return false
    if (level === 'sonoro') return f.startsWith('sounds/')
    return true
  })
  const total = files.length || 1
  let loaded = 0
  onProgress({ loaded, total, paused: false })

  for (const file of files) {
    while (signal.paused && !signal.aborted) {
      onProgress({ loaded, total, paused: true })
      await new Promise((r) => setTimeout(r, 200))
    }
    if (signal.aborted) throw new Error('aborted')
    const url = `${import.meta.env.BASE_URL}packages/mna-sala-mexica/${file}`
    const res = await fetch(url)
    const blob = await res.blob()
    await putFile(`mna-sala-mexica/${file}`, blob)
    loaded += 1
    onProgress({ loaded, total, paused: false })
  }

  const pkg: InstalledPackage = {
    id: MANIFEST.id,
    level,
    manifest: MANIFEST,
    pieces: PIECES,
    venue: MNA_VENUE,
    rooms: ROOMS,
    maps: createVenueMaps(),
    glossary: GLOSSARY,
    licenses: LICENSES,
    installedAt: new Date().toISOString(),
  }
  await savePackage(pkg)
  return pkg
}

export function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0
  let na = 0
  let nb = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

export function retrieveCandidates(pieces: PieceCard[], embedding: number[], k = 3) {
  return [...pieces]
    .map((p) => ({ piece: p, score: cosineSimilarity(embedding, p.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}

export function mergeWithCard(
  visualName: string | null,
  score: number,
  card: PieceCard | undefined,
): { estado: 'confirmada_por_paquete' | 'identificacion_probable' | 'descripcion_visual'; nombre: string | null } {
  if (card && visualName && namesClose(visualName, card.nombre) && score >= 0.82) {
    return { estado: 'confirmada_por_paquete', nombre: card.nombre }
  }
  if (visualName && score < 0.82) {
    return { estado: 'identificacion_probable', nombre: visualName }
  }
  if (visualName && !card) {
    return { estado: 'identificacion_probable', nombre: visualName }
  }
  return { estado: 'descripcion_visual', nombre: null }
}

export function namesClose(a: string, b: string) {
  const n = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  return n(a).includes(n(b).slice(0, 8)) || n(b).includes(n(a).slice(0, 8))
}
