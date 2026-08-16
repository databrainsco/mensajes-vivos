import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, ObjectType, VisionResult } from '../types'
import { PIECES } from '../demo/packageData'
import { VISION_MODEL } from './modelCatalog'

type Classifier = {
  (image: ImageData, options: { candidate_labels: string[] }): Promise<Array<{ label: string; score: number }>>
  dispose?: () => Promise<void>
}

function asImageData(image: ImageBitmap | ImageData | HTMLCanvasElement): ImageData {
  if (typeof ImageData !== 'undefined' && image instanceof ImageData) return image
  throw new Error('Se requiere ImageData para el modelo CLIP')
}

export class ClipLocalVisionModel implements LocalVisionModel {
  private classifier: Classifier | null = null
  readonly kind = 'clip' as const

  async loadModel() {
    if (this.classifier) return
    const { pipeline, env } = await import('@huggingface/transformers')
    env.useBrowserCache = true
    env.allowLocalModels = false
    this.classifier = (await pipeline('zero-shot-image-classification', VISION_MODEL.hfId, {
      dtype: 'q8',
    })) as unknown as Classifier
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
    const data = asImageData(image)
    return [data.width / 512, data.height / 512]
  }

  async analyzeImage(
    image: ImageBitmap | ImageData | HTMLCanvasElement,
    context?: AnalyzeContext,
  ): Promise<VisionResult> {
    await this.loadModel()
    const labels =
      context?.indoorCues && context.indoorCues.length > 0
        ? context.indoorCues
        : PIECES.map((p) => `${p.nombre}. ${p.tipo_objeto} de cultura ${p.cultura}`)
    const ranked = await this.classifier!(asImageData(image), { candidate_labels: labels })
    const top = ranked[0]
    const piece = PIECES.find((p) => top?.label.toLowerCase().includes(p.nombre.toLowerCase().slice(0, 8)))
    const score = top?.score ?? 0

    if (!piece || score < 0.22) {
      return {
        tipo_objeto: 'objeto_desconocido',
        identificacion: { nombre: null, confianza: score, estado: 'descripcion_visual' },
        cultura: null,
        periodo: null,
        elementos: [],
        instrumentos: [],
        alternativas: ranked.slice(0, 3).map((r) => ({ nombre: r.label, confianza: r.score })),
        advertencias: ['Modelo CLIP local. Sin coincidencia suficiente con las fichas del paquete.'],
        descripcion_visible: 'Veo una escena, pero no hay una ficha local lo bastante cercana.',
        embedding: [score],
        simulation: false,
      }
    }

    const estado = score >= 0.4 ? 'confirmada_por_paquete' : 'identificacion_probable'
    return {
      tipo_objeto: piece.tipo_objeto as ObjectType,
      identificacion: { nombre: piece.nombre, confianza: score, estado },
      cultura: null,
      periodo: null,
      elementos: piece.elementos,
      instrumentos: [],
      alternativas: ranked.slice(1, 3).map((r) => ({ nombre: r.label, confianza: r.score })),
      advertencias: ['Identidad tomada de la ficha local. CLIP solo ordena coincidencias visuales en el teléfono.'],
      descripcion_visible: `Escena compatible con ${piece.tipo_objeto}.`,
      indoor_cues: { sala: piece.sala, inventario: piece.inventario },
      embedding: [score],
      simulation: false,
    }
  }

  async releaseResources() {
    await this.classifier?.dispose?.()
    this.classifier = null
  }
}
