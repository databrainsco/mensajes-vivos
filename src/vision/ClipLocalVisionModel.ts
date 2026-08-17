import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, VisionResult } from '../types'
import { VISION_MODEL } from './modelCatalog'
import { CLIP_INDEX } from '../demo/clipIndex'
import { decidePhotoIndex, l2Normalize, rankPhotoIndex, rankTextIndex, decideTextGate } from './photoIndex'
import { familyResult, pieceResult, unknownResult } from './recognition'

type TensorLike = { data: ArrayLike<number>; dims: number[] }
type VisionModel = {
  (inputs: Record<string, unknown>): Promise<{ image_embeds?: TensorLike }>
  dispose?: () => Promise<void>
}

function vecFromTensor(t: TensorLike) {
  const dim = t.dims[t.dims.length - 1] ?? t.data.length
  return l2Normalize(Array.from(t.data).slice(0, dim))
}

type RawImageCtor = new (data: Uint8ClampedArray | Uint8Array, width: number, height: number, channels: number) => unknown

export class ClipLocalVisionModel implements LocalVisionModel {
  private model: VisionModel | null = null
  private processor: ((image: unknown) => Promise<Record<string, unknown>>) | null = null
  private RawImage: RawImageCtor | null = null
  readonly kind = 'clip' as const

  async loadModel() {
    if (this.model) return
    const { AutoProcessor, CLIPVisionModelWithProjection, RawImage, env } = await import('@huggingface/transformers')
    this.RawImage = RawImage as unknown as RawImageCtor
    env.useBrowserCache = true
    env.allowLocalModels = false
    try {
      if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.proxy = false
    } catch {
      // ignore
    }
    const webgpu = typeof navigator !== 'undefined' && 'gpu' in navigator
    this.processor = (await AutoProcessor.from_pretrained(VISION_MODEL.hfId)) as unknown as ClipLocalVisionModel['processor']
    try {
      this.model = (await CLIPVisionModelWithProjection.from_pretrained(VISION_MODEL.hfId, {
        dtype: webgpu ? 'fp16' : 'q8',
        device: webgpu ? 'webgpu' : 'wasm',
      })) as unknown as VisionModel
    } catch {
      this.model = (await CLIPVisionModelWithProjection.from_pretrained(VISION_MODEL.hfId, {
        dtype: 'q8',
      })) as unknown as VisionModel
    }
  }

  private async embedRaw(image: unknown): Promise<number[]> {
    const inputs = await this.processor!(image)
    const out = await this.model!(inputs)
    if (!out.image_embeds) throw new Error('CLIP no devolvió image_embeds')
    return vecFromTensor(out.image_embeds)
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
    await this.loadModel()
    if (typeof ImageData !== 'undefined' && image instanceof ImageData) {
      return this.embedRaw(new this.RawImage!(image.data, image.width, image.height, 4))
    }
    return [0]
  }

  async analyzeImage(
    image: ImageBitmap | ImageData | HTMLCanvasElement,
    _context?: AnalyzeContext,
  ): Promise<VisionResult> {
    await this.loadModel()
    if (!(typeof ImageData !== 'undefined' && image instanceof ImageData)) {
      return unknownResult(0, 'Formato de imagen no soportado para CLIP')
    }
    const query = await this.embedRaw(new this.RawImage!(image.data, image.width, image.height, 4))

    const textHits = rankTextIndex(query, CLIP_INDEX.texts)
    const gate = decideTextGate(textHits)
    if (gate.kind === 'reject') {
      return unknownResult(gate.score, 'La escena parece moderna o irrelevante, no una pieza del acervo.')
    }

    const photoHits = rankPhotoIndex(query, CLIP_INDEX.photos)
    const photo = decidePhotoIndex(photoHits)
    if (photo.kind === 'piece') {
      return pieceResult(
        photo.piece,
        photo.score,
        photo.alts.map((a) => ({ label: a.pieceId, score: a.score })),
        'photo',
      )
    }
    if (photo.kind === 'family') {
      return familyResult(photo.family, photo.score)
    }
    return unknownResult(photo.score, photo.reason)
  }

  async releaseResources() {
    await this.model?.dispose?.()
    this.model = null
    this.processor = null
    this.RawImage = null
  }
}
