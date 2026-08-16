import { describe, expect, it } from 'vitest'
import { classifyGeofence } from '../src/geo/geofence'
import { MNA_VENUE, PIECES } from '../src/demo/packageData'
import { cosineSimilarity, mergeWithCard, retrieveCandidates } from '../src/packages/catalog'
import { DemoLocalVisionModel } from '../src/vision/DemoLocalVisionModel'
import { deletePackage, getPackage, savePackage } from '../src/packages/db'
import { createVenueMaps } from '../src/packages/catalog'
import type { InstalledPackage } from '../src/types'

describe('geocercas', () => {
  it('detecta interior del MNA', () => {
    const hit = classifyGeofence({ lat: 19.426, lng: -99.1863 }, MNA_VENUE.geofence, MNA_VENUE.nearMeters)
    expect(hit.status).toBe('inside')
  })
  it('detecta cercanía', () => {
    const hit = classifyGeofence({ lat: 19.4285, lng: -99.1863 }, MNA_VENUE.geofence, 400)
    expect(['near', 'inside']).toContain(hit.status)
  })
  it('marca fuera', () => {
    const hit = classifyGeofence({ lat: 19.0, lng: -99.0 }, MNA_VENUE.geofence, 250)
    expect(hit.status).toBe('outside')
  })
})

describe('embeddings', () => {
  it('recupera la ficha correcta', () => {
    const hits = retrieveCandidates(PIECES, PIECES[1].embedding)
    expect(hits[0].piece.id).toBe('ocelotl-cuauhxicalli')
    expect(cosineSimilarity(PIECES[1].embedding, hits[0].piece.embedding)).toBeGreaterThan(0.99)
  })
  it('confirma solo con coincidencia alta', () => {
    const ok = mergeWithCard('Océlotl Cuauhxicalli', 0.94, PIECES[1])
    expect(ok.estado).toBe('confirmada_por_paquete')
    const weak = mergeWithCard('Océlotl Cuauhxicalli', 0.4, PIECES[1])
    expect(weak.estado).toBe('identificacion_probable')
    const none = mergeWithCard(null, 0.1, undefined)
    expect(none.estado).toBe('descripcion_visual')
    expect(none.nombre).toBeNull()
  })
})

describe('audio e incertidumbre', () => {
  it('no inventa audio de instrumento si no hay archivo', () => {
    const coatlicue = PIECES[0]
    expect(coatlicue.instrumentos).toHaveLength(0)
  })
  it('marca procedencia incierta de Xólotl', () => {
    const x = PIECES[2]
    expect(x.lugares.hallazgo.certeza).toBe('desconocida')
    expect(x.lugares.elaboracion?.certeza).toBe('propuestas_multiples')
    expect(x.lugares.representado?.certeza).toBe('propuestas_multiples')
    expect(x.instrumentos).toHaveLength(0)
  })
})

describe('adaptador demo', () => {
  it('se identifica como simulación', async () => {
    const model = new DemoLocalVisionModel()
    await model.loadModel()
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const result = await model.analyzeImage(canvas, { indoorCues: ['coatlicue'] })
    expect(result.simulation).toBe(true)
    expect(result.cultura).toBeNull()
    await model.releaseResources()
  })
})

describe('IndexedDB paquetes', () => {
  it('guarda y elimina un paquete', async () => {
    const pkg: InstalledPackage = {
      id: 'mna-sala-mexica',
      level: 'esencial',
      manifest: {
        id: 'mna-sala-mexica',
        version: '1.0.0',
        venueId: 'mna',
        venueName: 'MNA',
        roomName: 'Sala Mexica',
        checksum: 'x',
        signature: 'x',
        demo: true,
        levels: {
          esencial: { bytes: 1, label: '', files: [] },
          sonoro: { bytes: 1, label: '', files: [] },
          completo: { bytes: 1, label: '', files: [] },
        },
        stats: { piezas: 3, audios: 0, mapa: true },
      },
      pieces: PIECES,
      venue: MNA_VENUE,
      rooms: [],
      maps: createVenueMaps(),
      glossary: {},
      licenses: {},
      installedAt: new Date().toISOString(),
    }
    await savePackage(pkg)
    expect((await getPackage('mna-sala-mexica'))?.id).toBe('mna-sala-mexica')
    await deletePackage('mna-sala-mexica')
    expect(await getPackage('mna-sala-mexica')).toBeUndefined()
  })
})
