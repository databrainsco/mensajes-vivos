import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, ObjectType, VisionResult } from '../types'
import { VISION_MODEL } from './modelCatalog'
import { allClipLabels, isRejectLabel, pieceForClipLabel } from './labels'

type Rank = { label: string; score: number }

type Classifier = {
  (image: unknown, labels: string[], options?: { hypothesis_template?: string }): Promise<Rank[]>
  dispose?: () => Promise<void>
}

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
    advertencias: [reason],
    descripcion_visible:
      'No hay una coincidencia clara con el catálogo de culturas de México. Acerca una escultura, relieve, códice, glifo, vasija o instrumento del acervo.',
    embedding: [score],
    simulation: false,
  }
}

/**
 * Con muchas etiquetas, CLIP reparte probabilidad: se compara pieza vs rechazo
 * y el margen entre las mejores piezas, no un umbral absoluto alto.
 */
function decide(ranked: Rank[]) {
  const pieces = ranked.filter((r) => !isRejectLabel(r.label))
  const rejects = ranked.filter((r) => isRejectLabel(r.label))
  const topPiece = pieces[0]
  const secondPiece = pieces[1]
  const topReject = rejects[0]

  if (!topPiece) return { kind: 'unknown' as const, score: 0, reason: 'Sin candidatas del catálogo.' }

  const score = topPiece.score
  const rejectScore = topReject?.score ?? 0
  const marginPieces = score - (secondPiece?.score ?? 0)
  const marginReject = score - rejectScore

  if (rejectScore >= score) {
    return {
      kind: 'unknown' as const,
      score,
      reason: 'La escena parece un objeto moderno, libro o pantalla, no una pieza del catálogo.',
    }
  }
  // Con catálogo amplio el softmax se diluye: priorizar márgenes relativos.
  if (marginReject < 0.02) {
    return {
      kind: 'unknown' as const,
      score,
      reason: 'No se distingue con claridad de una escena ajena al patrimonio.',
    }
  }
  if (score < 0.04) {
    return { kind: 'unknown' as const, score, reason: 'Confianza demasiado baja para proponer una ficha.' }
  }
  if (marginPieces < 0.012 && marginReject < 0.05) {
    return {
      kind: 'unknown' as const,
      score,
      reason: 'Varias fichas del catálogo quedan empatadas; no se afirma una identidad.',
    }
  }

  const piece = pieceForClipLabel(topPiece.label)
  if (!piece) return { kind: 'unknown' as const, score, reason: 'Etiqueta sin ficha local.' }

  const confirm = marginPieces >= 0.04 && marginReject >= 0.06
  return {
    kind: 'match' as const,
    piece,
    score,
    estado: confirm ? ('confirmada_por_paquete' as const) : ('identificacion_probable' as const),
    alts: pieces.slice(1, 4),
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
    const decision = decide(ranked)

    if (decision.kind === 'unknown') {
      return unknownResult(decision.score, decision.reason)
    }

    const { piece, score, estado, alts } = decision
    return {
      tipo_objeto: piece.tipo_objeto as ObjectType,
      identificacion: { nombre: piece.nombre, confianza: score, estado },
      cultura: piece.cultura,
      periodo: piece.periodo,
      elementos: piece.elementos,
      instrumentos: [],
      alternativas: alts.map((r) => ({
        nombre: pieceForClipLabel(r.label)?.nombre ?? r.label,
        confianza: r.score,
      })),
      advertencias:
        estado === 'identificacion_probable'
          ? ['Identificación probable. Revisa la ficha antes de aceptarla como certeza.']
          : [],
      descripcion_visible: `${piece.tipo_objeto} · ${piece.cultura}`,
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
