export const VISION_MODEL = {
  id: 'clip-vit-base-patch32',
  hfId: 'Xenova/clip-vit-base-patch32',
  name: 'Modelo de visión CLIP',
  bytes: 92_000_000,
  label: 'Se descarga una vez (~92 MB) y queda en este teléfono. Las fotos no salen del dispositivo.',
}

export interface ModelRecord {
  key: string
  id: string
  ready: boolean
  installedAt?: string
}

export function modelCacheName(id: string) {
  return `mensajes-vivos-model-${id}`
}
