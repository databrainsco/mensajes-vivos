import { PIECES } from '../demo/packageData'

/** Etiquetas en inglés: CLIP responde mejor así. El índice coincide con PIECES. */
export const CLIP_LABELS = [
  'Aztec stone sculpture of Coatlicue goddess with snakes and skull necklace',
  'Aztec stone jaguar sculpture ritual vessel Cuauhxicalli ocelot',
  'Mesoamerican painted codex page with Xolotl dog-headed deity',
] as const

export function pieceForClipLabel(label: string) {
  const idx = CLIP_LABELS.findIndex((l) => l === label)
  if (idx >= 0) return PIECES[idx]
  const lower = label.toLowerCase()
  return (
    PIECES.find((p) => lower.includes(p.nombre.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').slice(0, 6))) ??
    null
  )
}

export function pieceLabels() {
  return [...CLIP_LABELS]
}
