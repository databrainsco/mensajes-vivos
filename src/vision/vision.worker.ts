import type { AnalyzeContext, DeviceCapabilities, LocalVisionModel, VisionResult } from '../types'
import { DemoLocalVisionModel } from './DemoLocalVisionModel'
import { ClipLocalVisionModel } from './ClipLocalVisionModel'

const demo = new DemoLocalVisionModel()
let clip: ClipLocalVisionModel | null = null
let useClip = false
let busy = false

function active(): LocalVisionModel {
  return useClip && clip ? clip : demo
}

self.onmessage = async (ev: MessageEvent) => {
  const { id, type, payload } = ev.data as {
    id: number
    type: string
    payload?: AnalyzeContext & { width?: number; height?: number; image?: ImageData; clip?: boolean }
  }
  try {
    if (type === 'load') {
      useClip = Boolean(payload?.clip)
      if (useClip) {
        clip = new ClipLocalVisionModel()
        await clip.loadModel()
      } else {
        await demo.loadModel()
      }
      self.postMessage({ id, ok: true, clip: useClip })
      return
    }
    if (type === 'caps') {
      const caps: DeviceCapabilities = await active().getDeviceCapabilities()
      self.postMessage({ id, ok: true, caps })
      return
    }
    if (type === 'release') {
      await clip?.releaseResources()
      await demo.releaseResources()
      busy = false
      self.postMessage({ id, ok: true })
      return
    }
    if (type === 'analyze') {
      if (busy) {
        self.postMessage({ id, ok: false, error: 'busy' })
        return
      }
      if (!useClip) {
        self.postMessage({ id, ok: false, error: 'needs-model' })
        return
      }
      busy = true
      const input = payload?.image ?? ({ width: payload?.width ?? 320, height: payload?.height ?? 240 } as HTMLCanvasElement)
      const result: VisionResult = await active().analyzeImage(input, payload)
      busy = false
      self.postMessage({ id, ok: true, result })
      return
    }
  } catch (error) {
    busy = false
    self.postMessage({ id, ok: false, error: String(error) })
  }
}
