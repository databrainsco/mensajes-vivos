import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, VisionResult } from '../types'
import { VISION_MODEL } from './modelCatalog'
import { MUSEUM_PHOTOS, photoPublicPath } from '../demo/visualIndex'
import { loadPhotoIndexCache, savePhotoIndexCache } from './modelStore'
import { decidePhotoIndex, l2Normalize, rankPhotoIndex } from './photoIndex'
import { isRejectLabel, REJECT_LABELS } from './labels'
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

type TensorLike = { data: ArrayLike<number>; dims: number[] }
type ClipModel = {
  (inputs: Record<string, unknown>): Promise<{
    image_embeds?: TensorLike
    logits_per_image?: TensorLike
  }>
  dispose?: () => Promise<void>
}

function softmax(logits: number[]) {
  const max = Math.max(...logits)
  const exps = logits.map((x) => Math.exp(x - max))
  const sum = exps.reduce((a, b) => a + b, 0) || 1
  return exps.map((x) => x / sum)
}

function vecFromTensor(t: TensorLike) {
  const dim = t.dims[t.dims.length - 1] ?? t.data.length
  return l2Normalize(Array.from(t.data).slice(0, dim))
}

function photoUrl(file: string) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return new URL(`${base}${photoPublicPath(file)}`, self.location.origin).href
}

export class ClipLocalVisionModel implements LocalVisionModel {
  private model: ClipModel | null = null
  private processor: ((image: unknown) => Promise<Record<string, unknown>>) | null = null
  private tokenizer: ((texts: string[], opts: Record<string, unknown>) => Record<string, unknown>) | null = null
  private index: Array<{ pieceId: string; file: string; embedding: number[] }> = []
  readonly kind = 'clip' as const

  async loadModel() {
    if (this.model) return
    const { AutoProcessor, AutoTokenizer, CLIPModel, env } = await import('@huggingface/transformers')
    env.useBrowserCache = true
    env.allowLocalModels = false
    try {
      if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.proxy = false
    } catch {
      // ignore
    }
    const [tokenizer, processor, model] = await Promise.all([
      AutoTokenizer.from_pretrained(VISION_MODEL.hfId),
      AutoProcessor.from_pretrained(VISION_MODEL.hfId),
      CLIPModel.from_pretrained(VISION_MODEL.hfId, { dtype: 'q8' }),
    ])
    this.tokenizer = tokenizer as unknown as ClipLocalVisionModel['tokenizer']
    this.processor = processor as unknown as ClipLocalVisionModel['processor']
    this.model = model as unknown as ClipModel
    await this.ensurePhotoIndex()
  }

  private async ensurePhotoIndex() {
    const files = MUSEUM_PHOTOS.map((p) => p.file)
    const cached = await loadPhotoIndexCache().catch(() => null)
    if (cached?.modelId === VISION_MODEL.id && cached.files.join('|') === files.join('|') && cached.vectors.length === files.length) {
      this.index = MUSEUM_PHOTOS.map((photo, i) => ({
        pieceId: photo.pieceId,
        file: photo.file,
        embedding: cached.vectors[i] ?? [],
      })).filter((e) => e.embedding.length > 8)
      if (this.index.length) return
    }

    const { RawImage } = await import('@huggingface/transformers')
    const vectors: number[][] = []
    this.index = []
    for (const photo of MUSEUM_PHOTOS) {
      try {
        const image = await RawImage.read(photoUrl(photo.file))
        const embedding = await this.embedRaw(image)
        this.index.push({ pieceId: photo.pieceId, file: photo.file, embedding })
        vectors.push(embedding)
      } catch {
        vectors.push([])
      }
    }
    const ok = this.index.filter((e) => e.embedding.length > 0)
    this.index = ok
    if (ok.length) {
      await savePhotoIndexCache({
        key: 'visual-index-v1',
        modelId: VISION_MODEL.id,
        files,
        vectors: files.map((file) => ok.find((e) => e.file === file)?.embedding ?? []),
      }).catch(() => undefined)
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
    const { RawImage } = await import('@huggingface/transformers')
    if (typeof ImageData !== 'undefined' && image instanceof ImageData) {
      return this.embedRaw(new RawImage(image.data, image.width, image.height, 4))
    }
    return [0]
  }

  private async classifyLabels(image: unknown, labels: string[]): Promise<Rank[]> {
    const texts = labels.map((label) => `a photo of ${label}`)
    const textInputs = this.tokenizer!(texts, { padding: true, truncation: true })
    const imageInputs = await this.processor!(image)
    const out = await this.model!({ ...textInputs, ...imageInputs })
    const logits = out.logits_per_image ? Array.from(out.logits_per_image.data) : []
    const probs = softmax(logits)
    return labels
      .map((label, i) => ({ label, score: probs[i] ?? 0 }))
      .sort((a, b) => b.score - a.score)
  }

  async analyzeImage(
    image: ImageBitmap | ImageData | HTMLCanvasElement,
    _context?: AnalyzeContext,
  ): Promise<VisionResult> {
    await this.loadModel()
    const { RawImage } = await import('@huggingface/transformers')
    if (!(typeof ImageData !== 'undefined' && image instanceof ImageData)) {
      return unknownResult(0, 'Formato de imagen no soportado para CLIP')
    }
    const input = new RawImage(image.data, image.width, image.height, 4)

    if (this.index.length) {
      const query = await this.embedRaw(input)
      const ranked = rankPhotoIndex(query, this.index)
      const photoHit = decidePhotoIndex(ranked)
      if (photoHit.kind === 'piece') {
        const rejectCheck = await this.classifyLabels(input, [
          'a pre-Hispanic Mexican museum artifact or sculpture',
          ...REJECT_LABELS,
        ])
        if (isRejectLabel(rejectCheck[0]?.label ?? '')) {
          return unknownResult(rejectCheck[0].score, 'La escena parece moderna o irrelevante, no una pieza del acervo.')
        }
        return pieceResult(
          photoHit.piece,
          photoHit.score,
          photoHit.alts.map((a) => ({ label: a.pieceId, score: a.score })),
          'photo',
        )
      }
    }

    const familyRanked = await this.classifyLabels(input, familyAndRejectLabels())
    const familyDecision = decideFamily(familyRanked)
    if (familyDecision.kind !== 'family') {
      return unknownResult(familyDecision.score, familyDecision.reason)
    }
    const members = piecesInFamily(familyDecision.family)
    if (members.length === 0) return familyResult(familyDecision.family, familyDecision.score)
    const pieceRanked = await this.classifyLabels(input, members.map((p) => p.clip_label))
    const pieceDecision = decidePiece(pieceRanked, familyDecision.family)
    if (pieceDecision.kind !== 'piece') {
      return familyResult(familyDecision.family, familyDecision.score, pieceDecision.reason)
    }
    return pieceResult(pieceDecision.piece, pieceDecision.score, pieceDecision.alts)
  }

  async releaseResources() {
    await this.model?.dispose?.()
    this.model = null
    this.processor = null
    this.tokenizer = null
    this.index = []
  }
}
