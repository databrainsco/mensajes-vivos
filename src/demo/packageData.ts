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
    periodo: 'Posclásico tardío (hacia 1400–1521)',
    tipo_objeto: 'escultura',
    sala: 'Sala Mexica',
    inventario: '10-1029',
    resumen:
      'Escultura monumental de andesita que representa a Coatlicue, deidad asociada a la tierra y a la fertilidad en la tradición mexica. Mide más de dos metros y medio. En la parte superior, dos serpientes enfrentadas forman un rostro; el cuerpo lleva un collar de manos, corazones y un cráneo, y un faldellín de serpientes entrelazadas.',
    texto_narracion:
      'Coatlicue. Escultura mexica del Posclásico tardío, tallada en andesita. Se conserva en el Museo Nacional de Antropología, en la Sala Mexica. Fue hallada en 1790 en la Plaza Mayor de la Ciudad de México, el antiguo Zócalo. Muestra a Coatlicue con un collar de manos y corazones, un cráneo al centro y un faldellín de serpientes. Es una de las piezas más importantes del acervo mexica del museo.',
    elementos: [
      { tipo: 'figura', nombre: 'serpientes entrelazadas', confianza: 0.9 },
      { tipo: 'adorno', nombre: 'collar de manos y corazones', confianza: 0.86 },
    ],
    instrumentos: [],
    animales: [],
    simbolos: [
      {
        id: 'serpiente',
        titulo: 'Faldellín de serpientes',
        texto: 'El faldellín de serpientes es un atributo iconográfico asociado a Coatlicue en las fuentes coloniales y en la propia escultura.',
      },
      {
        id: 'collar',
        titulo: 'Collar de manos y corazones',
        texto: 'El collar de manos, corazones y cráneos se describe en las fichas museográficas; su lectura ritual sigue siendo objeto de estudio.',
      },
      {
        id: 'rostro',
        titulo: 'Rostro de serpientes',
        texto: 'Dos cabezas de serpiente enfrentadas forman el rostro de la figura, un recurso frecuente en la escultura mexica monumental.',
      },
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
      { titulo: 'Ficha de sala · Museo Nacional de Antropología', procedencia: 'Paquete local Sala Mexica' },
      { titulo: 'Hallazgo de 1790 en la Plaza Mayor', procedencia: 'Historiografía del hallazgo colonial' },
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
      'Recipiente ritual de piedra en forma de jaguar o ocelote (océlotl). Los cuauhxicalli servían en contextos ceremoniales mexicas como vasos para ofrendas. La pieza se resguarda en la Sala Mexica del Museo Nacional de Antropología.',
    texto_narracion:
      'Océlotl Cuauhxicalli. Escultura mexica del Posclásico tardío en forma de jaguar. Es un recipiente ritual, un cuauhxicalli, asociado a ofrendas en el mundo mexica. Se conserva en el Museo Nacional de Antropología, Sala Mexica. El animal representado es el jaguar, llamado ocelotl en náhuatl. El lugar de hallazgo se sitúa de forma aproximada en el recinto sagrado de Tenochtitlan, en el Centro Histórico de la Ciudad de México.',
    elementos: [{ tipo: 'animal', nombre: 'jaguar', confianza: 0.98 }],
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
      {
        id: 'cuauhxicalli',
        titulo: 'Cuauhxicalli',
        texto: 'Vasija o recipiente asociado a ofrendas en contextos rituales mexicas, según la ficha del museo.',
      },
      {
        id: 'ocelotl',
        titulo: 'Océlotl',
        texto: 'El animal representado es un jaguar. En náhuatl se le llama ocelotl.',
      },
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
      { titulo: 'Ficha de sala · Museo Nacional de Antropología', procedencia: 'Paquete local Sala Mexica' },
    ],
    narracion: 'narrations/ocelotl.wav',
    embedding: [0.12, 0.94, 0.08, 0.21, 0.77, 0.15, 0.09, 0.62],
  },
  {
    id: 'xolotl-fejervary',
    nombre: 'Xólotl en el Códice Fejérváry-Mayer',
    nombre_alternativo: 'Lámina con deidad de rasgos caninos',
    cultura: 'Tradición pictórica del Posclásico',
    periodo: 'Posclásico',
    tipo_objeto: 'codice',
    sala: 'Referencia de códice en el paquete',
    resumen:
      'Lámina del Códice Fejérváry-Mayer con una figura de rasgos caninos asociada a Xólotl en la literatura del manuscrito. El códice se conserva hoy en el World Museum de Liverpool. La procedencia exacta del manuscrito es desconocida y su región de elaboración se discute entre varias propuestas.',
    texto_narracion:
      'Xólotl en el Códice Fejérváry-Mayer. Se trata de una lámina pictórica del Posclásico. La figura muestra rasgos caninos y se asocia a Xólotl en los estudios del códice. El manuscrito se resguarda en el World Museum de Liverpool. No se conoce con certeza el lugar exacto de origen. Tampoco hay instrumentos musicales documentados en esta escena.',
    elementos: [{ tipo: 'deidad', nombre: 'rasgos caninos', confianza: 0.88 }],
    instrumentos: [],
    animales: [
      {
        nombre: 'xoloitzcuintle',
        audio: 'sounds/animals/xolo.wav',
        nota: 'Xólotl presenta rasgos caninos. El audio es de un xoloitzcuintle contemporáneo; no representa la voz de la deidad.',
      },
    ],
    simbolos: [
      {
        id: 'canino',
        titulo: 'Rasgos caninos',
        texto: 'La asociación con Xólotl se basa en la iconografía publicada del códice.',
      },
      {
        id: 'aztlan',
        titulo: 'Procedencia y Aztlán',
        texto: 'La procedencia exacta del códice es desconocida. Cuando una región es discutida, el mapa muestra propuestas, no un pin definitivo.',
      },
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
        nota: 'La región de elaboración es debatida.',
      },
      representado: {
        etiqueta: 'Aztlán (lugar representado; no localizado de forma unívoca)',
        certeza: 'propuestas_multiples',
        nota: 'Aztlán no se marca con un pin definitivo.',
      },
    },
    fuentes: [
      {
        titulo: 'Códice Fejérváry-Mayer',
        procedencia: 'Resguardo actual: World Museum, Liverpool',
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
  ocelotl: 'Jaguar. El término náhuatl se usa según la ficha de la pieza.',
  xolotl: 'Deidad asociada a rasgos caninos en la tradición pictórica.',
}

export const LICENSES: Record<string, string> = {
  datos: 'Datos de demostración precargados para Mensajes Vivos. No sustituyen cédulas oficiales.',
  audio_jaguar: 'Tono de referencia. Clasificado como sonido natural de referencia.',
  audio_xolo: 'Tono de referencia contemporáneo. No es la voz de una deidad.',
  audio_teponaztli: 'Tono de referencia. Categoría: réplica arqueomusical.',
}
