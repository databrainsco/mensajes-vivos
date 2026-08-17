import { PIECES } from '../demo/packageData'

export const REJECT_LABELS = [
  'a modern printed book cover or textbook',
  'a laptop computer or phone screen displaying a website',
  'an unrelated everyday modern object',
  'a person selfie or contemporary portrait photo',
  'a blurry dark empty scene with no artifact',
] as const

export function pieceClipLabels() {
  return PIECES.map((p) => p.clip_label)
}

export function allClipLabels() {
  return pieceClipLabels()
}

export function pieceForClipLabel(label: string) {
  return PIECES.find((p) => p.clip_label === label) ?? null
}

export function isRejectLabel(label: string) {
  return (REJECT_LABELS as readonly string[]).includes(label)
}
