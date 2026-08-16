import type { AnalyzeContext, DeviceCapabilities, VisionResult } from '../types'
import { DemoLocalVisionModel } from './DemoLocalVisionModel'

const model = new DemoLocalVisionModel()
let busy = false

self.onmessage = async (ev: MessageEvent) => {
  const { id, type, payload } = ev.data as {
    id: number
    type: string
    payload?: AnalyzeContext & { width?: number; height?: number; image?: ImageData }
  }
  try {
    if (type === 'load') {
      await model.loadModel()
      self.postMessage({ id, ok: true })
      return
    }
    if (type === 'caps') {
      const caps: DeviceCapabilities = await model.getDeviceCapabilities()
      self.postMessage({ id, ok: true, caps })
      return
    }
    if (type === 'release') {
      await model.releaseResources()
      busy = false
      self.postMessage({ id, ok: true })
      return
    }
    if (type === 'analyze') {
      if (busy) {
        self.postMessage({ id, ok: false, error: 'busy' })
        return
      }
      busy = true
      const input = payload?.image ?? ({ width: payload?.width ?? 320, height: payload?.height ?? 240 } as HTMLCanvasElement)
      const result: VisionResult = await model.analyzeImage(input, payload)
      busy = false
      self.postMessage({ id, ok: true, result })
      return
    }
  } catch (error) {
    busy = false
    self.postMessage({ id, ok: false, error: String(error) })
  }
}
