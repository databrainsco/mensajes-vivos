import type { PackageManifest, PieceCard, Room, Venue } from '../types'

export const MNA_VENUE: Venue = {
  id: 'mna',
  nombre: 'Museo Nacional de Antropología',
  tipo: 'museo',
  nearMeters: 250,
  geofence: {
    type: 'Polygon',
    coordinates: [[
      [-99.1892, 19.4278],
      [-99.1836, 19.4278],
      [-99.1836, 19.4242],
      [-99.1892, 19.4242],
      [-99.1892, 19.4278],
    ]],
  },
}

export const ROOMS: Room[] = [
  { id: 'sala-mexica', nombre: 'Sala Mexica', piezas: 85, audios: 18 },
]

export const PIECES: PieceCard[] = [
  {
    id: 'coatlicue',
    nombre: 'Coatlicue',
    nombre_alternativo: 'Coatlicue mayor',
    cultura: 'Mexica',
    periodo: 'Posclásico tardío',
    tipo_objeto: 'escultura',
    sala: 'Sala Mexica',
    inventario: '10-1029',
    resumen:
      'Escultura monumental de andesita que representa a Coatlicue. La ficha local resume lo documentado en el acervo del museo; no sustituye la cédula de sala.',
    elementos: [
      { tipo: 'figura', nombre: 'serpientes entrelazadas', confianza: 0.9 },
      { tipo: 'adorno', nombre: 'collar de manos y corazones', confianza: 0.86 },
    ],
    instrumentos: [],
    animales: [],
    simbolos: [
      { id: 'serpiente', titulo: 'Serpientes', texto: 'El faldellín de serpientes es un atributo iconográfico asociado a Coatlicue en las fuentes coloniales y en la propia escultura.' },
      { id: 'collar', titulo: 'Collar', texto: 'El collar de manos, corazones y cráneos se describe en la ficha museográfica; su lectura ritual sigue siendo objeto de estudio.' },
    ],
    lugares: {
      resguardo: {
        etiqueta: 'Museo Nacional de Antropología, Ciudad de México',
        certeza: 'exacta',
        coordinates: [-99.1863, 19.426],
      },
      hallazgo: {
        etiqueta: 'Plaza Mayor (Zócalo), Ciudad de México, 1790',
        certeza: 'exacta',
        coordinates: [-99.1332, 19.4326],
        nota: 'Hallazgo documentado durante obras en la Plaza Mayor en 1790.',
      },
      elaboracion: {
        etiqueta: 'Área mexica del Altiplano central (región aproximada)',
        certeza: 'aproximada',
        nota: 'La región de talla se indica como área cultural, no como un punto único.',
        coordinates: [-99.14, 19.43],
      },
    },
    fuentes: [
      {
        titulo: 'Ficha de sala (demostración precargada)',
        procedencia: 'Paquete local mna-sala-mexica · datos de demostración etiquetados',
      },
      {
        titulo: 'Referencia de hallazgo 1790',
        procedencia: 'Síntesis educativa a partir de la historiografía del hallazgo en la Plaza Mayor',
      },
    ],
    narracion: 'narrations/coatlicue.wav',
    embedding: [0.92, 0.11, 0.08, 0.71, 0.22, 0.05, 0.64, 0.18],
  },
  {
    id: 'ocelotl-cuauhxicalli',
    nombre: 'Océlotl Cuauhxicalli',
    nombre_alternativo: 'Cuauhxicalli en forma de ocelote',
    cultura: 'Mexica',
    periodo: 'Posclásico tardío',
    tipo_objeto: 'escultura',
    sala: 'Sala Mexica',
    inventario: '10-220916',
    resumen:
      'Recipiente ritual en forma de jaguar. La función de cuauhxicalli se toma de la ficha del paquete, no de una inferencia libre del modelo.',
    elementos: [
      { tipo: 'animal', nombre: 'jaguar', confianza: 0.98 },
    ],
    instrumentos: [],
    animales: [
      {
        nombre: 'jaguar',
        especie: 'Panthera onca',
        audio: 'sounds/animals/jaguar.wav',
        nota: 'Sonido natural de referencia: jaguar. La escultura no producía este sonido.',
      },
    ],
    simbolos: [
      { id: 'cuauhxicalli', titulo: 'Cuauhxicalli', texto: 'Vasija o recipiente asociado a ofrendas; la identificación funcional procede de la ficha verificada del paquete.' },
      { id: 'ocelotl', titulo: 'Océlotl', texto: 'El animal representado es un jaguar (océlotl). La especie se afirma solo porque la ficha y la forma coinciden.' },
    ],
    lugares: {
      resguardo: {
        etiqueta: 'Museo Nacional de Antropología, Ciudad de México',
        certeza: 'exacta',
        coordinates: [-99.1863, 19.426],
      },
      hallazgo: {
        etiqueta: 'Recinto sagrado de Tenochtitlan (área del Centro Histórico)',
        certeza: 'aproximada',
        coordinates: [-99.131, 19.435],
        nota: 'Ubicación histórica no confirmada como un pin único; el mapa muestra una zona aproximada del recinto.',
      },
    },
    fuentes: [
      {
        titulo: 'Ficha de sala (demostración precargada)',
        procedencia: 'Paquete local mna-sala-mexica · datos de demostración etiquetados',
      },
    ],
    narracion: 'narrations/ocelotl.wav',
    embedding: [0.12, 0.94, 0.08, 0.21, 0.77, 0.15, 0.09, 0.62],
  },
  {
    id: 'xolotl-fejervary',
    nombre: 'Xólotl en el Códice Fejérváry-Mayer',
    nombre_alternativo: 'Lámina con deidad de rasgos caninos',
    cultura: 'Tradición pictórica del Posclásico (atribución discutida)',
    periodo: 'Posclásico',
    tipo_objeto: 'codice',
    sala: 'Sala Mexica (lámina de referencia en el paquete)',
    resumen:
      'La lámina muestra una figura con rasgos caninos asociada a Xólotl en la literatura del códice. No se identifican instrumentos musicales en esta escena.',
    elementos: [
      { tipo: 'deidad', nombre: 'rasgos caninos', confianza: 0.88 },
    ],
    instrumentos: [],
    animales: [
      {
        nombre: 'xoloitzcuintle (referencia contemporánea)',
        audio: 'sounds/animals/xolo.wav',
        nota: 'Xólotl presenta rasgos caninos. El audio corresponde a un xoloitzcuintle contemporáneo y no representa la voz de la deidad.',
      },
    ],
    simbolos: [
      { id: 'canino', titulo: 'Rasgos caninos', texto: 'La asociación con Xólotl se basa en la iconografía publicada del códice, no en una identificación facial de personas.' },
      { id: 'aztlan', titulo: 'Aztlán / origen', texto: 'No se coloca un pin definitivo. Cuando una región es discutida, el mapa muestra propuestas o un área aproximada.' },
    ],
    lugares: {
      resguardo: {
        etiqueta: 'World Museum, Liverpool (manuscrito Fejérváry-Mayer)',
        certeza: 'exacta',
        coordinates: [-2.981, 53.403],
      },
      hallazgo: {
        etiqueta: 'Procedencia exacta desconocida',
        certeza: 'desconocida',
        nota: 'Ubicación histórica no confirmada. El mapa representa propuestas o una región aproximada.',
      },
      elaboracion: {
        etiqueta: 'Mesoamérica occidental / Mixteca-Puebla (propuestas)',
        certeza: 'propuestas_multiples',
        nota: 'La región de elaboración es debatida. Se muestran áreas propuestas, no un punto único.',
      },
      representado: {
        etiqueta: 'Aztlán (lugar representado; no localizado de forma unívoca)',
        certeza: 'propuestas_multiples',
        nota: 'Aztlán no se marca con un pin definitivo.',
      },
    },
    fuentes: [
      {
        titulo: 'Códice Fejérváry-Mayer (facsímil / ficha de demostración)',
        procedencia: 'Paquete local · resguardo actual: World Museum, Liverpool',
      },
    ],
    narracion: 'narrations/xolotl.wav',
    lamina_secuencia: ['portada', 'lamina-xolotl', 'lamina-siguiente'],
    embedding: [0.18, 0.22, 0.91, 0.14, 0.12, 0.73, 0.21, 0.08],
  },
]

export const MANIFEST: PackageManifest = {
  id: 'mna-sala-mexica',
  version: '1.0.0',
  venueId: 'mna',
  venueName: 'Museo Nacional de Antropología',
  roomName: 'Sala Mexica',
  checksum: 'demo-sha256-mna-sala-mexica-v1',
  signature: 'demo-unsigned-local-package',
  demo: true,
  stats: { piezas: 85, audios: 18, mapa: true },
  levels: {
    esencial: {
      bytes: 8_000_000,
      label: 'Fichas, miniaturas y mapa',
      files: ['manifest.json', 'venue.json', 'rooms.json', 'pieces.json', 'maps/venue.geojson'],
    },
    sonoro: {
      bytes: 18_000_000,
      label: 'Añade animales e instrumentos',
      files: ['sounds/animals/', 'sounds/instruments/'],
    },
    completo: {
      bytes: 42_000_000,
      label: 'Añade imágenes y narraciones',
      files: ['images/', 'narrations/', 'embeddings.bin'],
    },
  },
}

export const GLOSSARY: Record<string, string> = {
  cuauhxicalli: 'Recipiente ritual documentado en fuentes mexicas y en fichas museográficas.',
  ocelotl: 'Jaguar. El término náhuatl se usa aquí según la ficha de la pieza.',
  xolotl: 'Deidad asociada a rasgos caninos en la tradición pictórica; no se afirma una “voz” original.',
}

export const LICENSES: Record<string, string> = {
  datos: 'Datos de demostración precargados para Mensajes Vivos. No sustituyen cédulas oficiales.',
  audio_jaguar: 'Tono de referencia generado para la demostración. Clasificado como sonido natural de referencia (simulado).',
  audio_xolo: 'Tono de referencia generado para la demostración. No es la voz de una deidad.',
  audio_teponaztli: 'Tono de referencia. Categoría: réplica arqueomusical (simulación local).',
}
