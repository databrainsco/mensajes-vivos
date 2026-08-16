import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, VisionResult } from '../types'
import { PIECES } from '../demo/packageData'
import { retrieveCandidates } from '../packages/catalog'

function sceneFromPixels(image: ImageData): (typeof PIECES)[number] | null {
  const { data } = image
  let sum = 0
  let sumSq = 0
  let red = 0
  const n = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    const l = (data[i] + data[i + 1] + data[i + 2]) / 3
    sum += l
    sumSq += l * l
    red += data[i]
  }
  const mean = sum / n / 255
  const variance = sumSq / n / (255 * 255) - mean * mean
  const redness = red / n / 255
  if (variance < 0.004) return null
  if (redness > 0.42 && mean > 0.38) return PIECES[2]
  if (mean < 0.34) return PIECES[1]
  return PIECES[0]
}

function isImageData(image: ImageBitmap | ImageData | HTMLCanvasElement): image is ImageData {
  return typeof ImageData !== 'undefined' && image instanceof ImageData
}

function embeddingFromImage(image: ImageBitmap | ImageData | HTMLCanvasElement): number[] {
  if (!isImageData(image)) {
    const w = 'width' in image ? image.width : 8
    const h = 'height' in image ? image.height : 8
    return [w / 400, h / 400, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]
  }
  const { data, width, height } = image
  const cells = 8
  const out = new Array<number>(cells).fill(0)
  const counts = new Array<number>(cells).fill(0)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 765
      const bucket = Math.min(cells - 1, Math.floor((x / width) * 4) + Math.floor((y / height) * 2) * 4)
      out[bucket] += lum
      counts[bucket] += 1
    }
  }
  return out.map((v, i) => (counts[i] ? v / counts[i] : 0))
}

/**
 * Adaptador de demostración. Nunca debe presentarse como un modelo real.
 */
export class DemoLocalVisionModel implements LocalVisionModel {
  private loaded = false
  readonly kind = 'simulation' as const

  async loadModel() {
    await new Promise((r) => setTimeout(r, 200))
    this.loaded = true
  }

  async getDeviceCapabilities(): Promise<DeviceCapabilities> {
    const webgpu = typeof navigator !== 'undefined' && 'gpu' in navigator
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    return {
      webgpu,
      wasm: typeof WebAssembly !== 'undefined',
      recommendedModel: memory && memory <= 4 ? 'small' : 'full',
      memoryHintMb: memory ? memory * 1024 : null,
    }
  }

  async generateEmbedding(image: ImageBitmap | ImageData | HTMLCanvasElement): Promise<number[]> {
    return embeddingFromImage(image)
  }

  async analyzeImage(
    image: ImageBitmap | ImageData | HTMLCanvasElement,
    context?: AnalyzeContext,
  ): Promise<VisionResult> {
    if (!this.loaded) await this.loadModel()
    void context
    const pixels = isImageData(image) ? image : null
    const scene = pixels ? sceneFromPixels(pixels) : null
    const embedding = scene?.embedding ?? (await this.generateEmbedding(image))
    const hits = retrieveCandidates(PIECES, embedding, 3)
    const best = scene ? { piece: scene, score: 0.9 } : hits[0]
    const score = best?.score ?? 0

    if (!best || score < 0.72) {
      return {
        tipo_objeto: 'objeto_desconocido',
        identificacion: { nombre: null, confianza: score, estado: 'descripcion_visual' },
        cultura: null,
        periodo: null,
        elementos: [{ tipo: 'figura', nombre: 'forma visible en la escena', confianza: 0.4 }],
        instrumentos: [],
        alternativas: [],
        advertencias: ['Simulación local. No es un resultado de un modelo multimodal real.'],
        descripcion_visible: 'Mantén la pieza frente a la cámara. Aún no hay una identificación concreta.',
        embedding,
        simulation: true,
      }
    }

    const demo = best.piece
    const probable = score < 0.84
    return {
      tipo_objeto: demo.tipo_objeto,
      identificacion: {
        nombre: demo.nombre,
        confianza: score,
        estado: probable ? 'identificacion_probable' : 'confirmada_por_paquete',
      },
      cultura: null,
      periodo: null,
      elementos: demo.elementos,
      instrumentos: [],
      alternativas: hits.slice(1).map((h) => ({ nombre: h.piece.nombre, confianza: h.score })),
      advertencias: ['Simulación local. El reconocimiento visual definitivo requiere un modelo multimodal real.'],
      descripcion_visible: `Escena compatible con ${demo.tipo_objeto}.`,
      indoor_cues: { museo: 'Museo Nacional de Antropología', sala: demo.sala, inventario: demo.inventario },
      embedding,
      simulation: true,
    }
  }

  async releaseResources() {
    this.loaded = false
  }
}

let singleton: DemoLocalVisionModel | null = null

export function getLocalVisionModel(): LocalVisionModel {
  if (!singleton) singleton = new DemoLocalVisionModel()
  return singleton
}
