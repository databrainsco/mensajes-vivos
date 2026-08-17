import photos from './museumPhotos.json' with { type: 'json' }

export interface MuseumPhoto {
  pieceId: string
  file: string
  commons: string
  credit: string
}

export const MUSEUM_PHOTOS = photos as MuseumPhoto[]

export function photoPublicPath(file: string) {
  return `packages/mna-sala-mexica/images/index/${file}`
}

export function indexedPieceIds() {
  return [...new Set(MUSEUM_PHOTOS.map((p) => p.pieceId))]
}
