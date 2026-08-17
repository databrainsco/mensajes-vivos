import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, VisionResult } from '../types'
import { VISION_MODEL } from './modelCatalog'
import { CLIP_INDEX } from '../demo/clipIndex'
import {
  decidePhotoIndex,
  decidePieceText,
  decideTextGate,
  l2Normalize,
  mergePhotoRanks,
  photoIsClear,
  rankPhotoIndex,
  rankPieceTexts,
  rankTextIndex,
} from './photoIndex'
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

/** Recorte alto del fotograma (cara/torso), segundo encuadre del híbrido. */
export function upperCropImageData(src: ImageData, ratio = 0.72): ImageData {
  const side = Math.max(32, Math.floor(Math.min(src.width, src.height) * ratio))
  const sx = Math.floor((src.width - side) / 2)
  const sy = Math.floor(Math.max(0, (src.height - side) * 0.15))
  const out = new ImageData(side, side)
  for (let y = 0; y < side; y++) {
    const srcRow = (sy + y) * src.width + sx
    const dstRow = y * side
    for (let x = 0; x < side; x++) {
      const si = (srcRow + x) * 4
      const di = (dstRow + x) * 4
      out.data[di] = src.data[si]
      out.data[di + 1] = src.data[si + 1]
      out.data[di + 2] = src.data[si + 2]
      out.data[di + 3] = src.data[si + 3]
    }
  }
  return out
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

  private async embedData(image: ImageData): Promise<number[]> {
    return this.embedRaw(new this.RawImage!(image.data, image.width, image.height, 4))
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
      return this.embedData(image)
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

    const queryFull = await this.embedData(image)
    const textHits = rankTextIndex(queryFull, CLIP_INDEX.texts)
    const gate = decideTextGate(textHits)
    if (gate.kind === 'reject') {
      return unknownResult(gate.score, 'La escena parece moderna o irrelevante, no una pieza del acervo.')
    }

    let photoHits = rankPhotoIndex(queryFull, CLIP_INDEX.photos)
    let queryBest = queryFull

    if (!photoIsClear(photoHits)) {
      const fullTop = photoHits[0]?.score ?? 0
      const crop = upperCropImageData(image)
      const queryCrop = await this.embedData(crop)
      const cropHits = rankPhotoIndex(queryCrop, CLIP_INDEX.photos)
      photoHits = mergePhotoRanks(photoHits, cropHits)
      if ((cropHits[0]?.score ?? 0) > fullTop) queryBest = queryCrop
    }

    const photo = decidePhotoIndex(photoHits)
    if (photo.kind === 'piece') {
      return pieceResult(
        photo.piece,
        photo.score,
        photo.alts.map((a) => ({ label: a.pieceId, score: a.score })),
        'photo',
      )
    }

    const candidates = new Set(photoHits.slice(0, 6).map((h) => h.pieceId))
    const textRanked = rankPieceTexts(queryBest, CLIP_INDEX.texts)
    const textDecision = decidePieceText(textRanked, candidates.size ? candidates : undefined)
    if (textDecision.kind === 'piece') {
      // La escala imagen–texto (~0.25–0.35) no es comparable a foto–foto (~0.7).
      const shown = Math.min(0.9, Math.max(0.7, textDecision.score * 2.45))
      return pieceResult(
        textDecision.piece,
        shown,
        textDecision.alts.map((a) => ({ label: a.pieceId, score: a.score })),
        'text',
      )
    }
    if (photo.kind === 'family') {
      return familyResult(photo.family, photo.score)
    }
    if (textDecision.kind === 'family') {
      return familyResult(textDecision.family, textDecision.score)
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
