import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, ObjectType, VisionResult } from '../types'
import { VISION_MODEL } from './modelCatalog'
import { allClipLabels, isRejectLabel, pieceForClipLabel } from './labels'

type Classifier = {
  (
    image: unknown,
    labels: string[],
    options?: { hypothesis_template?: string },
  ): Promise<Array<{ label: string; score: number }>>
  dispose?: () => Promise<void>
}

/** Umbrales altos: CLIP siempre ordena etiquetas; sin margen se inventa. */
const MIN_SCORE = 0.72
const MIN_MARGIN = 0.12
const CONFIRM_SCORE = 0.82

async function toModelInput(image: ImageBitmap | ImageData | HTMLCanvasElement): Promise<unknown> {
  const { RawImage } = await import('@huggingface/transformers')
  if (typeof ImageData !== 'undefined' && image instanceof ImageData) {
    return new RawImage(image.data, image.width, image.height, 4)
  }
  if (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) {
    const ctx = image.getContext('2d')
    if (!ctx) throw new Error('canvas sin contexto')
    const data = ctx.getImageData(0, 0, image.width, image.height)
    return new RawImage(data.data, data.width, data.height, 4)
  }
  throw new Error('Formato de imagen no soportado para CLIP')
}

function unknownResult(score: number, reason: string): VisionResult {
  return {
    tipo_objeto: 'objeto_desconocido',
    identificacion: { nombre: null, confianza: score, estado: 'descripcion_visual' },
    cultura: null,
    periodo: null,
    elementos: [],
    instrumentos: [],
    alternativas: [],
    advertencias: [reason, 'No se inventa una identidad sin evidencia suficiente.'],
    descripcion_visible: 'No puedo identificar una pieza del paquete local. Apunta a Coatlicue, Océlotl Cuauhxicalli o la lámina de Xólotl.',
    embedding: [score],
    simulation: false,
  }
}

export class ClipLocalVisionModel implements LocalVisionModel {
  private classifier: Classifier | null = null
  readonly kind = 'clip' as const

  async loadModel() {
    if (this.classifier) return
    const { pipeline, env } = await import('@huggingface/transformers')
    env.useBrowserCache = true
    env.allowLocalModels = false
    try {
      if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.proxy = false
    } catch {
      // ignore
    }
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
    const w = 'width' in image ? image.width : 0
    const h = 'height' in image ? image.height : 0
    return [w / 512, h / 512]
  }

  async analyzeImage(
    image: ImageBitmap | ImageData | HTMLCanvasElement,
    _context?: AnalyzeContext,
  ): Promise<VisionResult> {
    await this.loadModel()
    const labels = allClipLabels()
    const input = await toModelInput(image)
    const ranked = await this.classifier!(input, labels, {
      hypothesis_template: 'a photo of {}',
    })
    const top = ranked[0]
    const second = ranked[1]
    const score = top?.score ?? 0
    const margin = score - (second?.score ?? 0)

    if (!top || isRejectLabel(top.label)) {
      return unknownResult(score, 'La escena parece un libro, pantalla u objeto ajeno al paquete.')
    }

    const piece = pieceForClipLabel(top.label)
    if (!piece || score < MIN_SCORE || margin < MIN_MARGIN) {
      return unknownResult(
        score,
        `Confianza insuficiente (${Math.round(score * 100)}%, margen ${Math.round(margin * 100)}%).`,
      )
    }

    const estado = score >= CONFIRM_SCORE && margin >= 0.18 ? 'confirmada_por_paquete' : 'identificacion_probable'
    return {
      tipo_objeto: piece.tipo_objeto as ObjectType,
      identificacion: { nombre: piece.nombre, confianza: score, estado },
      cultura: null,
      periodo: null,
      elementos: piece.elementos,
      instrumentos: [],
      alternativas: ranked
        .slice(1, 4)
        .filter((r) => !isRejectLabel(r.label))
        .map((r) => ({ nombre: pieceForClipLabel(r.label)?.nombre ?? r.label, confianza: r.score })),
      advertencias:
        estado === 'identificacion_probable'
          ? ['Identificación probable, no confirmada. Revisa la ficha antes de tomarla como hecho.']
          : ['Identidad tomada de la ficha local tras coincidencia alta con CLIP.'],
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
