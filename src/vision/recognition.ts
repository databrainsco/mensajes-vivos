import type { ObjectType, PieceCard, VerificationState, VisionResult } from '../types'
import { PIECES } from '../demo/packageData'
import { REJECT_LABELS } from './labels'

export type Rank = { label: string; score: number }

export type ClipFamily =
  | 'stone_statue'
  | 'carved_disk'
  | 'colossal_head'
  | 'relief'
  | 'mask'
  | 'codex'
  | 'glyph'
  | 'painted_deity'
  | 'ceramic'
  | 'instrument'
  | 'architecture'
  | 'artifact'

export const FAMILY_META: Record<
  ClipFamily,
  { clip: string; tipo: ObjectType; titulo: string; texto: string; specific: boolean }
> = {
  stone_statue: {
    clip: 'a large carved stone statue of a Mexican museum deity, jaguar or warrior',
    tipo: 'escultura',
    titulo: 'Escultura de piedra',
    texto: 'Parece una escultura de piedra del México antiguo. Aún no se afirma cuál pieza es.',
    specific: true,
  },
  carved_disk: {
    clip: 'a large circular carved Aztec stone disk or calendar monument',
    tipo: 'escultura',
    titulo: 'Disco o monolito circular',
    texto: 'Parece un monolito circular tallado. Aún no se afirma cuál pieza es.',
    specific: true,
  },
  colossal_head: {
    clip: 'an Olmec colossal basalt head with helmet-like headdress',
    tipo: 'escultura',
    titulo: 'Cabeza colosal',
    texto: 'Parece una cabeza de piedra monumental. Aún no se afirma cuál pieza es.',
    specific: true,
  },
  relief: {
    clip: 'a carved Maya or Mexican stone relief, stela or temple panel with figures',
    tipo: 'relieve',
    titulo: 'Relieve o estela',
    texto: 'Parece un relieve o estela. Aún no se afirma el monumento concreto.',
    specific: false,
  },
  mask: {
    clip: 'a pre-Hispanic Mexican stone or jade mosaic funerary mask',
    tipo: 'mascara',
    titulo: 'Máscara',
    texto: 'Parece una máscara del México antiguo. Aún no se afirma cuál es.',
    specific: true,
  },
  codex: {
    clip: 'a pre-Hispanic Mexican painted pictographic codex manuscript page',
    tipo: 'codice',
    titulo: 'Códice pictográfico',
    texto: 'Parece un códice o lámina pictográfica. No se afirma qué manuscrito es.',
    specific: false,
  },
  glyph: {
    clip: 'a single Aztec or Maya calendar glyph symbol, not a full manuscript page',
    tipo: 'glifo',
    titulo: 'Glifo',
    texto: 'Parece un glifo o signo calendárico. No se afirma cuál signo es.',
    specific: false,
  },
  painted_deity: {
    clip: 'a painted Aztec or Maya god figure in a colorful codex illustration',
    tipo: 'deidad',
    titulo: 'Deidad en pictografía',
    texto: 'Parece la imagen de una deidad. No se afirma cuál dios es.',
    specific: false,
  },
  ceramic: {
    clip: 'a pre-Hispanic Mexican clay urn, vase, brazier or small figurine',
    tipo: 'vasija',
    titulo: 'Cerámica',
    texto: 'Parece cerámica del México antiguo. Aún no se afirma la pieza.',
    specific: false,
  },
  instrument: {
    clip: 'a pre-Hispanic Mexican wooden drum, clay flute or conch trumpet',
    tipo: 'instrumento',
    titulo: 'Instrumento musical',
    texto: 'Parece un instrumento musical de tradición antigua de México.',
    specific: true,
  },
  architecture: {
    clip: 'a Mexican archaeological stepped pyramid or temple ruin',
    tipo: 'arquitectura',
    titulo: 'Arquitectura',
    texto: 'Parece arquitectura arqueológica de México. Aún no se afirma el edificio.',
    specific: true,
  },
  artifact: {
    clip: 'a Mexican archaeological tool such as a metate grinding stone or obsidian blade',
    tipo: 'objeto_desconocido',
    titulo: 'Artefacto',
    texto: 'Parece un artefacto arqueológico. No hay ficha concreta todavía.',
    specific: false,
  },
}

const FAMILY_BY_ID: Record<string, ClipFamily> = {
  coatlicue: 'stone_statue',
  'ocelotl-cuauhxicalli': 'stone_statue',
  'tlaloc-monolito': 'stone_statue',
  chacmool: 'stone_statue',
  'atlantes-tula': 'stone_statue',
  xiuhcoatl: 'stone_statue',
  'xipe-totec': 'stone_statue',
  mictlantecuhtli: 'stone_statue',
  'ehecatl-quetzalcoatl': 'stone_statue',
  xochipilli: 'stone_statue',
  huehueteotl: 'stone_statue',
  'quetzalcoatl-estatua': 'stone_statue',
  'piedra-del-sol': 'carved_disk',
  coyolxauhqui: 'carved_disk',
  'piedra-de-tenochtitlan': 'carved_disk',
  'piedra-de-tlizoc': 'carved_disk',
  'malinalco-temalacatl': 'carved_disk',
  'cabeza-olmeca': 'colossal_head',
  'serpiente-emplumada': 'relief',
  'pakal-tapa': 'relief',
  'estela-maya': 'relief',
  'dintel-yaxchilan': 'relief',
  'tablero-palenque': 'relief',
  'estela-zapoteca': 'relief',
  tzompantli: 'relief',
  'yugo-hacha-palma': 'relief',
  'mascara-teotihuacan': 'mask',
  'mascara-funeraria-maya': 'mask',
  'codice-fejervary': 'codex',
  'codice-borbonico': 'codex',
  'codice-mendoza': 'codex',
  'codice-borgia': 'codex',
  'codice-nuttall': 'codex',
  'codice-dresde': 'codex',
  'codice-madrid': 'codex',
  'codice-florentino': 'codex',
  'codice-vaticano-b': 'codex',
  'lienzo-tlaxcala': 'codex',
  'codice-selden': 'codex',
  'glifo-ollin': 'glyph',
  'glifo-cipactli': 'glyph',
  'glifo-calli': 'glyph',
  'glifo-tochtli': 'glyph',
  'glifo-acatl': 'glyph',
  'glifo-tecpatl': 'glyph',
  'glifo-coatl': 'glyph',
  'glifo-mazatl': 'glyph',
  'glifo-nahui-ollin': 'glyph',
  'glifo-maya-kin': 'glyph',
  'glifo-maya-ahau': 'glyph',
  'glifo-atl': 'glyph',
  huitzilopochtli: 'painted_deity',
  tezcatlipoca: 'painted_deity',
  chalchiuhtlicue: 'painted_deity',
  cihuacoatl: 'painted_deity',
  tonatiuh: 'painted_deity',
  chaac: 'painted_deity',
  kukulkan: 'painted_deity',
  cocijo: 'painted_deity',
  'urna-zapoteca': 'ceramic',
  'vasija-maya': 'ceramic',
  'penate-teotihuacan': 'ceramic',
  'incensario-teotihuacan': 'ceramic',
  'brasero-mexica': 'ceramic',
  'tlaloc-vasija': 'ceramic',
  'urnas-mayas': 'ceramic',
  'penate-mixteco': 'ceramic',
  'tumba-shaft-occidente': 'ceramic',
  teponaztli: 'instrument',
  huehuetl: 'instrument',
  'caracol-quiquiztli': 'instrument',
  'flauta-barro': 'instrument',
  chicahuaztli: 'instrument',
  'piramide-sol-teotihuacan': 'architecture',
  'castillo-chichen': 'architecture',
  'templo-mayor': 'architecture',
  metate: 'artifact',
  'pelota-hule': 'artifact',
  'espejo-obsidiana': 'artifact',
  'navaja-obsidiana': 'artifact',
  'purepecha-hacha': 'artifact',
  'cenote-ofrenda': 'artifact',
}

const TIPO_FALLBACK: Record<ObjectType, ClipFamily> = {
  escultura: 'stone_statue',
  relieve: 'relief',
  codice: 'codex',
  vasija: 'ceramic',
  instrumento: 'instrument',
  arquitectura: 'architecture',
  deidad: 'painted_deity',
  glifo: 'glyph',
  mascara: 'mask',
  figurilla: 'ceramic',
  objeto_desconocido: 'artifact',
}

export function familyOf(piece: PieceCard): ClipFamily {
  return FAMILY_BY_ID[piece.id] ?? TIPO_FALLBACK[piece.tipo_objeto]
}

export function piecesInFamily(family: ClipFamily): PieceCard[] {
  return PIECES.filter((p) => familyOf(p) === family)
}

export function familyClipLabels() {
  return (Object.keys(FAMILY_META) as ClipFamily[]).map((id) => FAMILY_META[id].clip)
}

export function familyAndRejectLabels() {
  return [...familyClipLabels(), ...REJECT_LABELS]
}

export function familyFromClip(label: string): ClipFamily | null {
  const hit = (Object.keys(FAMILY_META) as ClipFamily[]).find((id) => FAMILY_META[id].clip === label)
  return hit ?? null
}

function sorted(ranked: Rank[]) {
  return [...ranked].sort((a, b) => b.score - a.score)
}

export function decideFamily(ranked: Rank[]) {
  const list = sorted(ranked)
  const families = list.filter((r) => !REJECT_LABELS.includes(r.label as (typeof REJECT_LABELS)[number]))
  const rejects = list.filter((r) => REJECT_LABELS.includes(r.label as (typeof REJECT_LABELS)[number]))
  const top = families[0]
  const second = families[1]
  const reject = rejects[0]
  if (!top) return { kind: 'unknown' as const, score: 0, reason: 'Sin tipo reconocible.' }

  const score = top.score
  const rejectScore = reject?.score ?? 0
  const marginReject = score - rejectScore
  const marginFamily = score - (second?.score ?? 0)

  if (rejectScore >= score || marginReject < 0.04) {
    return {
      kind: 'unknown' as const,
      score,
      reason: 'La toma no se distingue de una escena moderna o irrelevante.',
    }
  }
  if (score < 0.12) {
    return { kind: 'unknown' as const, score, reason: 'No hay un tipo de objeto claro.' }
  }
  if (marginFamily < 0.025) {
    return {
      kind: 'unknown' as const,
      score,
      reason: 'Varios tipos de objeto quedan empatados; no se afirma ficha.',
    }
  }

  const family = familyFromClip(top.label)
  if (!family) return { kind: 'unknown' as const, score, reason: 'Tipo sin catálogo.' }

  return { kind: 'family' as const, family, score, margin: marginFamily, marginReject }
}

export function decidePiece(ranked: Rank[], family: ClipFamily) {
  const list = sorted(ranked)
  const top = list[0]
  const second = list[1]
  if (!top) {
    return { kind: 'family_only' as const, score: 0, reason: 'Sin candidatas dentro del tipo.' }
  }

  const piece = PIECES.find((p) => p.clip_label === top.label) ?? null
  const score = top.score
  const margin = score - (second?.score ?? 0)
  const meta = FAMILY_META[family]
  const minMargin = meta.specific ? 0.06 : 0.1
  const minScore = meta.specific ? 0.22 : 0.32

  if (!piece || familyOf(piece) !== family) {
    return { kind: 'family_only' as const, score, reason: 'La candidata no pertenece a este tipo.' }
  }
  if (score < minScore || margin < minMargin) {
    return {
      kind: 'family_only' as const,
      score,
      reason: 'El tipo es probable, pero no hay margen para afirmar una ficha.',
    }
  }

  return {
    kind: 'piece' as const,
    piece,
    score,
    estado: 'identificacion_probable' as VerificationState,
    alts: list.slice(1, 4),
  }
}

export function unknownResult(score: number, reason: string): VisionResult {
  return {
    tipo_objeto: 'objeto_desconocido',
    identificacion: { nombre: null, confianza: score, estado: 'descripcion_visual' },
    cultura: null,
    periodo: null,
    elementos: [],
    instrumentos: [],
    alternativas: [],
    advertencias: [reason],
    descripcion_visible:
      'No hay coincidencia clara. Acerca una pieza del acervo y mantén el encuadre un momento.',
    embedding: [score],
    simulation: false,
  }
}

export function familyResult(family: ClipFamily, score: number, reason?: string): VisionResult {
  const meta = FAMILY_META[family]
  return {
    tipo_objeto: meta.tipo,
    identificacion: { nombre: null, confianza: score, estado: 'descripcion_visual' },
    cultura: null,
    periodo: null,
    elementos: [],
    instrumentos: [],
    alternativas: [],
    advertencias: [reason ?? 'Se reconoce el tipo, no la ficha concreta.'],
    descripcion_visible: meta.texto,
    embedding: [score],
    simulation: false,
    via: 'text',
  }
}

export function pieceResult(
  piece: PieceCard,
  score: number,
  alts: Rank[],
  source: 'photo' | 'text' = 'text',
): VisionResult {
  return {
    tipo_objeto: piece.tipo_objeto,
    identificacion: {
      nombre: piece.nombre,
      confianza: score,
      estado: 'identificacion_probable',
    },
    cultura: piece.cultura,
    periodo: piece.periodo,
    elementos: piece.elementos,
    instrumentos: [],
    alternativas: alts.map((r) => ({
      nombre: PIECES.find((p) => p.clip_label === r.label || p.id === r.label)?.nombre ?? r.label,
      confianza: r.score,
    })),
    advertencias:
      source === 'photo'
        ? ['Coincidencia con foto de referencia local. Las fotos no salen del teléfono.']
        : ['Identificación probable. Revisa la ficha antes de aceptarla como certeza.'],
    descripcion_visible: `${piece.tipo_objeto} · ${piece.cultura}`,
    indoor_cues: { sala: piece.sala, inventario: piece.inventario },
    embedding: [score],
    simulation: false,
    via: source,
  }
}

export function resultKey(v: VisionResult): string {
  if (v.identificacion.nombre) return `p:${v.identificacion.nombre}`
  if (v.tipo_objeto !== 'objeto_desconocido') return `f:${v.tipo_objeto}`
  return 'n'
}

export function familyOnly(v: VisionResult): VisionResult {
  if (!v.identificacion.nombre) return v
  return {
    ...v,
    identificacion: { nombre: null, confianza: v.identificacion.confianza, estado: 'descripcion_visual' },
    cultura: null,
    periodo: null,
    alternativas: [],
    advertencias: ['Se espera otra toma igual antes de abrir una ficha.'],
    descripcion_visible: v.descripcion_visible,
  }
}

/**
 * No afirma una ficha con un solo fotograma. Evita el salto Coatlicue/Xólotl.
 */
export function stabilizeScan(
  historyKeys: string[],
  incoming: VisionResult,
  displayed: VisionResult | null,
): { historyKeys: string[]; displayed: VisionResult } {
  const key = resultKey(incoming)
  const history = [...historyKeys, key].slice(-4)
  const instant =
    incoming.via === 'photo' &&
    Boolean(incoming.identificacion.nombre) &&
    incoming.identificacion.confianza >= 0.72
  const agreed =
    instant || (history.length >= 2 && history[history.length - 1] === history[history.length - 2])

  if (agreed) {
    const triple = history.length >= 3 && history.slice(-3).every((k) => k === key)
    if (triple && incoming.identificacion.nombre) {
      return {
        historyKeys: history,
        displayed: {
          ...incoming,
          identificacion: { ...incoming.identificacion, estado: 'confirmada_por_paquete' },
        },
      }
    }
    return { historyKeys: history, displayed: incoming }
  }

  if (incoming.identificacion.nombre) {
    const shownKey = displayed ? resultKey(displayed) : ''
    if (displayed?.identificacion.nombre && history.includes(shownKey)) {
      return { historyKeys: history, displayed }
    }
    return { historyKeys: history, displayed: familyOnly(incoming) }
  }

  if (displayed?.identificacion.nombre) {
    const named = resultKey(displayed)
    const lost = history.slice(-2).every((k) => k !== named)
    if (!lost) return { historyKeys: history, displayed }
  }

  if (displayed && resultKey(displayed).startsWith('f:') && key === 'n') {
    const familyKey = resultKey(displayed)
    const lost = history.slice(-2).every((k) => k !== familyKey)
    if (!lost) return { historyKeys: history, displayed }
  }

  return { historyKeys: history, displayed: incoming }
}
