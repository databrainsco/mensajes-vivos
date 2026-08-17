import type { AnalyzeContext, DeviceCapabilities, VisionResult } from '../types'

export function downscaleCanvas(source: HTMLCanvasElement | HTMLVideoElement, max = 256): HTMLCanvasElement {
  const w = 'videoWidth' in source ? source.videoWidth : source.width
  const h = 'videoHeight' in source ? source.videoHeight : source.height
  const scale = Math.min(1, max / Math.max(w, h || 1))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w * scale))
  canvas.height = Math.max(1, Math.round(h * scale))
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** Recorte central del visor, como el recuadro de Google Lens. Reutiliza el canvas. */
export function drawViewfinder(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  max = 256,
  ratio = 0.62,
): HTMLCanvasElement {
  const vw = video.videoWidth
  const vh = video.videoHeight
  const side = Math.min(vw, vh) * ratio
  const sx = (vw - side) / 2
  const sy = (vh - side) / 2
  if (canvas.width !== max || canvas.height !== max) {
    canvas.width = max
    canvas.height = max
  }
  canvas.getContext('2d', { willReadFrequently: true })?.drawImage(video, sx, sy, side, side, 0, 0, max, max)
  return canvas
}

export function viewfinderCanvas(video: HTMLVideoElement, max = 256, ratio = 0.62): HTMLCanvasElement {
  return drawViewfinder(document.createElement('canvas'), video, max, ratio)
}

export function estimateBrightness(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d')
  if (!ctx) return 0
  const { data } = ctx.getImageData(0, 0, Math.min(32, canvas.width), Math.min(32, canvas.height))
  let sum = 0
  for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3
  return sum / (data.length / 4) / 255
}

export function frameSignature(canvas: HTMLCanvasElement): number[] {
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  const sample = ctx.getImageData(0, 0, 8, 8).data
  const out: number[] = []
  for (let i = 0; i < sample.length; i += 4) out.push((sample[i] + sample[i + 1] + sample[i + 2]) / 3)
  return out
}

export function signaturesClose(a: number[], b: number[], maxDelta = 12) {
  if (a.length !== b.length || !a.length) return false
  let acc = 0
  for (let i = 0; i < a.length; i++) acc += Math.abs(a[i] - b[i])
  return acc / a.length < maxDelta
}

export class VisionClient {
  private worker: Worker | null = null
  private seq = 0
  private pending = new Map<number, (v: unknown) => void>()

  private ensure() {
    if (!this.worker) {
      this.worker = new Worker(new URL('./vision.worker.ts', import.meta.url), { type: 'module' })
      this.worker.onmessage = (ev: MessageEvent) => {
        const { id } = ev.data as { id: number }
        const fn = this.pending.get(id)
        if (fn) {
          this.pending.delete(id)
          fn(ev.data)
        }
      }
      this.worker.onerror = (err) => {
        for (const [id, fn] of this.pending) {
          this.pending.delete(id)
          fn({ id, ok: false, error: err.message || 'worker error' })
        }
      }
    }
    return this.worker
  }

  private call(type: string, payload?: unknown, timeoutMs = 20000, transfer?: Transferable[]): Promise<Record<string, unknown>> {
    const id = ++this.seq
    const worker = this.ensure()
    return new Promise((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error('timeout')), timeoutMs)
      this.pending.set(id, (v) => {
        window.clearTimeout(t)
        resolve(v as Record<string, unknown>)
      })
      worker.postMessage({ id, type, payload }, transfer ?? [])
    })
  }

  async load(clip = false) {
    const res = await this.call('load', { clip }, clip ? 120000 : 20000)
    if (!res.ok) throw new Error(String(res.error ?? 'load failed'))
    return {
      clip: Boolean(res.clip),
      clipLoadError: res.clipLoadError ? String(res.clipLoadError) : null,
    }
  }

  async caps(): Promise<DeviceCapabilities> {
    const res = await this.call('caps')
    return res.caps as DeviceCapabilities
  }

  async analyze(context: AnalyzeContext & { width: number; height: number; image?: ImageData }): Promise<VisionResult> {
    const transfer: Transferable[] = []
    if (context.image?.data?.buffer) transfer.push(context.image.data.buffer)
    const res = await this.call('analyze', context, 20000, transfer)
    if (!res.ok) throw new Error(String(res.error ?? 'analyze failed'))
    return res.result as VisionResult
  }

  async release() {
    try {
      await this.call('release', undefined, 5000)
    } catch {
      // ignore
    }
    this.worker?.terminate()
    this.worker = null
  }
}
