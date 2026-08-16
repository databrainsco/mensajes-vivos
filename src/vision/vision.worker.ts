import type { AnalyzeContext, DeviceCapabilities, VisionResult } from '../types'
import { DemoLocalVisionModel } from './DemoLocalVisionModel'
import { ClipLocalVisionModel } from './ClipLocalVisionModel'

const demo = new DemoLocalVisionModel()
let clip: ClipLocalVisionModel | null = null
let useClip = false
let busy = false
let clipLoadError: string | null = null

self.onmessage = async (ev: MessageEvent) => {
  const { id, type, payload } = ev.data as {
    id: number
    type: string
    payload?: AnalyzeContext & {
      width?: number
      height?: number
      image?: ImageData
      clip?: boolean
    }
  }
  try {
    if (type === 'load') {
      useClip = Boolean(payload?.clip)
      clipLoadError = null
      await demo.loadModel()
      if (useClip) {
        try {
          clip = new ClipLocalVisionModel()
          await clip.loadModel()
        } catch (error) {
          clipLoadError = String(error)
          useClip = false
          clip = null
        }
      }
      self.postMessage({ id, ok: true, clip: useClip, clipLoadError })
      return
    }
    if (type === 'caps') {
      const model = useClip && clip ? clip : demo
      const caps: DeviceCapabilities = await model.getDeviceCapabilities()
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
      busy = true
      const input =
        payload?.image ??
        ({ width: payload?.width ?? 320, height: payload?.height ?? 240 } as HTMLCanvasElement)
      let result: VisionResult
      try {
        if (useClip && clip) {
          result = await clip.analyzeImage(input, payload)
        } else {
          result = await demo.analyzeImage(input, payload)
        }
      } catch (error) {
        // Si CLIP falla en tiempo de ejecución, cae a heurística local.
        result = await demo.analyzeImage(input, payload)
        result.advertencias = [
          ...(result.advertencias ?? []),
          `CLIP no pudo analizar esta toma (${String(error)}). Se usó el respaldo local.`,
        ]
      }
      busy = false
      self.postMessage({ id, ok: true, result, clip: useClip })
      return
    }
  } catch (error) {
    busy = false
    self.postMessage({ id, ok: false, error: String(error) })
  }
}
