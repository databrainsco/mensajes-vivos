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

export type TextHit = { id: string; kind: string; family?: string; score: number }

export function rankTextIndex(
  query: number[],
  entries: Array<{ id: string; kind: string; family?: string; embedding: number[] }>,
): TextHit[] {
  return entries
    .map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      family: entry.family,
      score: cosine(query, entry.embedding),
    }))
    .sort((a, b) => b.score - a.score)
}

export type TextGate =
  | { kind: 'reject'; score: number }
  | { kind: 'keep'; score: number; family?: string; familyScore: number }

export function decideTextGate(ranked: TextHit[]): TextGate {
  const reject = ranked.find((r) => r.kind === 'reject')
  const keep = ranked.find((r) => r.kind !== 'reject')
  if (!keep) return { kind: 'reject', score: reject?.score ?? 0 }
  if (reject && reject.score >= keep.score) {
    return { kind: 'reject', score: reject.score }
  }
  const family = ranked.find((r) => r.kind === 'family')
  return {
    kind: 'keep',
    score: keep.score,
    family: family?.family,
    familyScore: family?.score ?? keep.score,
  }
}

export type PhotoDecision =
  | { kind: 'none'; score: number; reason: string }
  | { kind: 'piece'; piece: (typeof PIECES)[number]; score: number; alts: IndexHit[] }

export function decidePhotoIndex(ranked: IndexHit[]): PhotoDecision {
  const top = ranked[0]
  const second = ranked[1]
  if (!top) return { kind: 'none', score: 0, reason: 'Índice vacío.' }
  const margin = top.score - (second?.score ?? 0)
  if (top.score < 0.7) {
    return { kind: 'none', score: top.score, reason: 'Ninguna foto de referencia supera el umbral.' }
  }
  if (margin < 0.028 && top.score < 0.82) {
    return { kind: 'none', score: top.score, reason: 'Varias fotos de museo quedan empatadas.' }
  }
  const piece = PIECES.find((p) => p.id === top.pieceId)
  if (!piece) return { kind: 'none', score: top.score, reason: 'Foto sin ficha.' }
  return { kind: 'piece', piece, score: top.score, alts: ranked.slice(1, 4) }
}
