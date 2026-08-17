import { PIECES } from '../demo/packageData'

export function l2Normalize(values: number[]) {
  let n = 0
  for (const x of values) n += x * x
  n = Math.sqrt(n) || 1
  return values.map((x) => x / n)
}

export function cosine(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length)
  let dot = 0
  for (let i = 0; i < n; i++) dot += a[i] * b[i]
  return dot
}

export type IndexHit = { pieceId: string; score: number }

export function rankPhotoIndex(query: number[], entries: Array<{ pieceId: string; embedding: number[] }>): IndexHit[] {
  const best = new Map<string, number>()
  for (const entry of entries) {
    const score = cosine(query, entry.embedding)
    const prev = best.get(entry.pieceId) ?? -1
    if (score > prev) best.set(entry.pieceId, score)
  }
  return [...best.entries()]
    .map(([pieceId, score]) => ({ pieceId, score }))
    .sort((a, b) => b.score - a.score)
}

export function decidePhotoIndex(ranked: IndexHit[]) {
  const top = ranked[0]
  const second = ranked[1]
  if (!top) return { kind: 'none' as const, score: 0, reason: 'Índice vacío.' }
  const margin = top.score - (second?.score ?? 0)
  if (top.score < 0.7) {
    return { kind: 'none' as const, score: top.score, reason: 'Ninguna foto de referencia supera el umbral.' }
  }
  if (margin < 0.028 && top.score < 0.82) {
    return { kind: 'none' as const, score: top.score, reason: 'Varias fotos de museo quedan empatadas.' }
  }
  const piece = PIECES.find((p) => p.id === top.pieceId)
  if (!piece) return { kind: 'none' as const, score: top.score, reason: 'Foto sin ficha.' }
  return { kind: 'piece' as const, piece, score: top.score, alts: ranked.slice(1, 4) }
}
