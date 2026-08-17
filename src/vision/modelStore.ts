import { openDB } from 'idb'
import type { ModelRecord } from './modelCatalog'

function db() {
  return openDB('mensajes-vivos', 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('settings')) database.createObjectStore('settings', { keyPath: 'key' })
    },
  })
}

export async function getDbStatus(): Promise<ModelRecord | null> {
  const row = (await (await db()).get('settings', 'vision-model')) as ModelRecord | undefined
  return row ?? null
}

export async function saveModelRecord(record: ModelRecord) {
  await (await db()).put('settings', record)
}

export type CachedPhotoIndex = {
  key: string
  modelId: string
  files: string[]
  vectors: number[][]
}

export async function loadPhotoIndexCache(): Promise<CachedPhotoIndex | null> {
  const row = (await (await db()).get('settings', 'visual-index-v1')) as CachedPhotoIndex | undefined
  return row ?? null
}

export async function savePhotoIndexCache(record: CachedPhotoIndex) {
  await (await db()).put('settings', record)
}

export type { ModelRecord } from './modelCatalog'
