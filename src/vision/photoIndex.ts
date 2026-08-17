import { PIECES } from '../demo/packageData'
import { familyOf, type ClipFamily } from './recognition'

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
  | { kind: 'family'; family: ClipFamily; score: number }
  | { kind: 'piece'; piece: (typeof PIECES)[number]; score: number; alts: IndexHit[] }

function pieceById(id: string) {
  return PIECES.find((p) => p.id === id)
}

/** Si Coatlicue y la cabeza olmeca empatan, no se afirma la cabeza. */
function familyWhenTied(topId: string, secondId: string | undefined): ClipFamily {
  const top = pieceById(topId)
  const second = secondId ? pieceById(secondId) : undefined
  const a = top ? familyOf(top) : 'stone_statue'
  const b = second ? familyOf(second) : a
  if (a === b) return a
  if (a === 'colossal_head' || b === 'colossal_head') return 'stone_statue'
  return 'stone_statue'
}

export function decidePhotoIndex(ranked: IndexHit[]): PhotoDecision {
  const top = ranked[0]
  const second = ranked[1]
  if (!top) return { kind: 'none', score: 0, reason: 'Índice vacío.' }
  const margin = top.score - (second?.score ?? 0)
  const piece = pieceById(top.pieceId)
  const minMargin = top.score >= 0.88 ? 0.025 : 0.04
  if (piece && top.score >= 0.74 && margin >= minMargin) {
    return { kind: 'piece', piece, score: top.score, alts: ranked.slice(1, 4) }
  }
  if (piece && top.score >= 0.5) {
    return {
      kind: 'family',
      family: margin < 0.04 ? familyWhenTied(top.pieceId, second?.pieceId) : familyOf(piece),
      score: top.score,
    }
  }
  return { kind: 'none', score: top.score, reason: 'Ninguna foto de referencia supera el umbral.' }
}
