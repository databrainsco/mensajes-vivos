import data from './clipIndex.json' with { type: 'json' }

export type ClipIndex = {
  model: string
  dim: number
  photos: Array<{ pieceId: string; file: string; view?: string; embedding: number[] }>
  texts: Array<{ id: string; kind: string; family?: string; pieceId?: string; embedding: number[] }>
}

export const CLIP_INDEX = data as ClipIndex
