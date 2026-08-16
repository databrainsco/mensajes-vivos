import { PIECES } from '../demo/packageData'

/** Etiquetas positivas: índice 0..n-1 = PIECES. */
export const CLIP_LABELS = [
  'stone Aztec sculpture of Coatlicue goddess with snake skirt in a museum',
  'stone Aztec jaguar sculpture Cuauhxicalli ocelot vessel in a museum',
  'pre-Hispanic painted codex page with Xolotl dog-headed deity',
] as const

/** Etiquetas de rechazo: si ganan, no hay identificación. */
export const REJECT_LABELS = [
  'a modern printed book cover',
  'a laptop or phone screen',
  'an unrelated everyday object',
  'a person or selfie',
  'blurry or empty scene',
] as const

export function allClipLabels() {
  return [...CLIP_LABELS, ...REJECT_LABELS]
}

export function pieceForClipLabel(label: string) {
  const idx = CLIP_LABELS.findIndex((l) => l === label)
  if (idx >= 0) return PIECES[idx]
  return null
}

export function isRejectLabel(label: string) {
  return (REJECT_LABELS as readonly string[]).includes(label)
}
