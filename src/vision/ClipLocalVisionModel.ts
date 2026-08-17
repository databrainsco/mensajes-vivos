import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, VisionResult } from '../types'
import { VISION_MODEL } from './modelCatalog'
import {
  decideFamily,
  decidePiece,
  familyAndRejectLabels,
  familyResult,
  pieceResult,
  piecesInFamily,
  unknownResult,
  type Rank,
} from './recognition'

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
    const input = await toModelInput(image)

    const familyRanked = await this.classifier!(input, familyAndRejectLabels(), {
      hypothesis_template: 'a photo of {}',
    })
    const familyDecision = decideFamily(familyRanked)
    if (familyDecision.kind !== 'family') {
      return unknownResult(familyDecision.score, familyDecision.reason)
    }

    const members = piecesInFamily(familyDecision.family)
    if (members.length === 0) {
      return familyResult(familyDecision.family, familyDecision.score)
    }

    const pieceRanked = await this.classifier!(
      input,
      members.map((p) => p.clip_label),
      { hypothesis_template: 'a photo of {}' },
    )
    const pieceDecision = decidePiece(pieceRanked, familyDecision.family)
    if (pieceDecision.kind !== 'piece') {
      return familyResult(familyDecision.family, familyDecision.score, pieceDecision.reason)
    }

    return pieceResult(pieceDecision.piece, pieceDecision.score, pieceDecision.alts)
  }

  async releaseResources() {
    await this.classifier?.dispose?.()
    this.classifier = null
  }
}
