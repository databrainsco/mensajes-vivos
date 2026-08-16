import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, VisionResult } from '../types'

function isImageData(image: ImageBitmap | ImageData | HTMLCanvasElement): image is ImageData {
  return typeof ImageData !== 'undefined' && image instanceof ImageData
}

/**
 * Respaldo sin CLIP: nunca inventa una identidad de pieza.
 */
export class DemoLocalVisionModel implements LocalVisionModel {
  private loaded = false
  readonly kind = 'simulation' as const

  async loadModel() {
    await new Promise((r) => setTimeout(r, 120))
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
    const w = 'width' in image ? image.width : 0
    const h = 'height' in image ? image.height : 0
    return [w / 400, h / 400]
  }

  async analyzeImage(
    image: ImageBitmap | ImageData | HTMLCanvasElement,
    _context?: AnalyzeContext,
  ): Promise<VisionResult> {
    if (!this.loaded) await this.loadModel()
    const embedding = await this.generateEmbedding(image)
    const bright = isImageData(image)
      ? image.data.reduce((s, v, i) => (i % 4 < 3 ? s + v : s), 0) / ((image.data.length / 4) * 3) / 255
      : 0.5

    return {
      tipo_objeto: 'objeto_desconocido',
      identificacion: { nombre: null, confianza: 0, estado: 'descripcion_visual' },
      cultura: null,
      periodo: null,
      elementos: [{ tipo: 'escena', nombre: bright < 0.2 ? 'escena oscura' : 'escena visible', confianza: 0.4 }],
      instrumentos: [],
      alternativas: [],
      advertencias: [
        'Sin modelo CLIP no se propone una pieza. Descarga el modelo en Guías.',
        'No se inventa una identidad.',
      ],
      descripcion_visible: 'Descripción visual solamente. Descarga el modelo local para intentar reconocer una ficha.',
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
