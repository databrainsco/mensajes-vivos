import { getDbStatus, saveModelRecord, type ModelRecord } from './modelStore'
import { VISION_MODEL } from './modelCatalog'

export type ModelProgress = { loaded: number; total: number; file: string; paused: boolean }

let abort = false
let paused = false

export function pauseModelDownload(value: boolean) {
  paused = value
}

export function abortModelDownload() {
  abort = true
}

export async function getInstalledModel(): Promise<ModelRecord | null> {
  return getDbStatus()
}

export async function downloadVisionModel(onProgress: (p: ModelProgress) => void): Promise<void> {
  abort = false
  paused = false
  const { env, pipeline } = await import('@huggingface/transformers')
  env.allowLocalModels = false
  env.useBrowserCache = true

  const pipe = await pipeline('zero-shot-image-classification', VISION_MODEL.hfId, {
    dtype: 'q8',
    progress_callback: (info: {
      status?: string
      file?: string
      progress?: number
      loaded?: number
      total?: number
    }) => {
      if (abort) throw new Error('aborted')
      if (info.status === 'progress' && info.total) {
        onProgress({
          loaded: info.loaded ?? 0,
          total: info.total,
          file: info.file ?? 'modelo',
          paused,
        })
      }
    },
  })

  while (paused && !abort) await new Promise((r) => setTimeout(r, 200))
  if (abort) throw new Error('aborted')

  const disposable = pipe as { dispose?: () => Promise<void> }
  if (disposable.dispose) await disposable.dispose()
  await saveModelRecord({
    key: 'vision-model',
    id: VISION_MODEL.id,
    ready: true,
    installedAt: new Date().toISOString(),
  })
}

export async function deleteVisionModel() {
  const keys = await caches.keys()
  for (const key of keys) {
    if (/huggingface|transformers|onnx|clip/i.test(key)) await caches.delete(key)
  }
  await saveModelRecord({ key: 'vision-model', id: VISION_MODEL.id, ready: false })
}
