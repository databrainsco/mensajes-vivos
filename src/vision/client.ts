import type { AnalyzeContext, DeviceCapabilities, VisionResult } from '../types'

export function downscaleCanvas(source: HTMLCanvasElement | HTMLVideoElement, max = 384): HTMLCanvasElement {
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

export function estimateBrightness(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d')
  if (!ctx) return 0
  const { data } = ctx.getImageData(0, 0, Math.min(32, canvas.width), Math.min(32, canvas.height))
  let sum = 0
  for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3
  return sum / (data.length / 4) / 255
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
    const res = await this.call('load', { clip }, clip ? 240000 : 20000)
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
    const res = await this.call('analyze', context, 60000, transfer)
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
