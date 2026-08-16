export type ObjectType =
  | 'escultura'
  | 'codice'
  | 'relieve'
  | 'vasija'
  | 'instrumento'
  | 'arquitectura'
  | 'objeto_desconocido'

export type VerificationState =
  | 'confirmada_por_paquete'
  | 'identificacion_probable'
  | 'descripcion_visual'

export type PackageLevel = 'esencial' | 'sonoro' | 'completo'

export type SoundCategory =
  | 'grabacion_original'
  | 'replica_arqueomusical'
  | 'reconstruccion_digital'
  | 'instrumento_moderno_comparable'
  | 'sonido_natural_referencia'
  | 'sonido_desconocido'

export type LocationKind =
  | 'usuario'
  | 'resguardo'
  | 'hallazgo'
  | 'elaboracion'
  | 'representado'

export interface VisualElement {
  tipo: string
  nombre: string
  confianza: number
}

export interface Identification {
  nombre: string | null
  confianza: number
  estado: VerificationState
}

export interface VisionResult {
  tipo_objeto: ObjectType
  identificacion: Identification
  cultura: string | null
  periodo: string | null
  elementos: VisualElement[]
  instrumentos: VisualElement[]
  alternativas: Array<{ nombre: string; confianza: number }>
  advertencias: string[]
  descripcion_visible: string
  indoor_cues?: {
    museo?: string
    sala?: string
    inventario?: string
    cedula?: string
  }
  embedding: number[]
  simulation: boolean
}

export interface DeviceCapabilities {
  webgpu: boolean
  wasm: boolean
  recommendedModel: 'full' | 'small'
  memoryHintMb: number | null
}

export interface AnalyzeContext {
  packageId?: string
  roomHint?: string
  indoorCues?: string[]
}

export interface LocalVisionModel {
  loadModel(): Promise<void>
  analyzeImage(image: ImageBitmap | ImageData | HTMLCanvasElement, context?: AnalyzeContext): Promise<VisionResult>
  generateEmbedding(image: ImageBitmap | ImageData | HTMLCanvasElement): Promise<number[]>
  releaseResources(): Promise<void>
  getDeviceCapabilities(): Promise<DeviceCapabilities>
}

export interface PieceCard {
  id: string
  nombre: string
  nombre_alternativo?: string
  cultura: string
  periodo: string
  tipo_objeto: ObjectType
  resumen: string
  sala: string
  inventario?: string
  elementos: VisualElement[]
  instrumentos: Array<{
    nombre: string
    categoria: SoundCategory
    audio?: string
    fuente: string
    nota: string
  }>
  animales: Array<{
    nombre: string
    especie?: string
    audio?: string
    nota: string
  }>
  simbolos: Array<{ id: string; titulo: string; texto: string }>
  lugares: {
    resguardo: GeoPlace
    hallazgo: GeoPlace
    elaboracion?: GeoPlace
    representado?: GeoPlace
  }
  fuentes: Array<{ titulo: string; procedencia: string; url?: string }>
  narracion?: string
  lamina_secuencia?: string[]
  embedding: number[]
}

export interface GeoPlace {
  etiqueta: string
  certeza: 'exacta' | 'aproximada' | 'propuestas_multiples' | 'desconocida'
  nota?: string
  coordinates?: [number, number]
  region?: GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.FeatureCollection
}

export interface Venue {
  id: string
  nombre: string
  tipo: 'museo' | 'zona_arqueologica'
  geofence: GeoJSON.Polygon
  nearMeters: number
}

export interface Room {
  id: string
  nombre: string
  piezas: number
  audios: number
}

export interface PackageManifest {
  id: string
  version: string
  venueId: string
  venueName: string
  roomName: string
  checksum: string
  signature: string
  demo: boolean
  levels: Record<PackageLevel, { bytes: number; label: string; files: string[] }>
  stats: { piezas: number; audios: number; mapa: boolean }
}

export interface InstalledPackage {
  id: string
  level: PackageLevel
  manifest: PackageManifest
  pieces: PieceCard[]
  venue: Venue
  rooms: Room[]
  maps: { venue: GeoJSON.FeatureCollection; discovery: GeoJSON.FeatureCollection }
  glossary: Record<string, string>
  licenses: Record<string, string>
  installedAt: string
}

export interface Discovery {
  id: string
  savedAt: string
  pieceId?: string
  vision: VisionResult
  captureDataUrl?: string
}

export interface PrivacySettings {
  locationEnabled: boolean
  cameraOnly: boolean
  vibrateOnMatch: boolean
  dismissedGeofences: string[]
  introSeen: boolean
}
