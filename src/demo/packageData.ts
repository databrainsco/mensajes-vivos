import type { PackageManifest, PieceCard, Room, Venue, ObjectType, VisualElement } from '../types'

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
  { id: 'sala-maya', nombre: 'Sala Maya', piezas: 40, audios: 8 },
  { id: 'sala-olmecas', nombre: 'Sala Culturas del Golfo', piezas: 25, audios: 4 },
  { id: 'sala-teotihuacan', nombre: 'Sala Teotihuacan', piezas: 30, audios: 5 },
]

const MNA = {
  etiqueta: 'Museo Nacional de Antropología, Ciudad de México',
  certeza: 'exacta' as const,
  coordinates: [-99.1863, 19.426] as [number, number],
}

function emb(seed: number): number[] {
  return Array.from({ length: 8 }, (_, i) => ((seed * (i + 3) * 17) % 100) / 100)
}

function piece(input: {
  id: string
  nombre: string
  nombre_alternativo?: string
  cultura: string
  periodo: string
  tipo_objeto: ObjectType
  clip_label: string
  sala: string
  inventario?: string
  resumen: string
  texto_narracion: string
  elementos?: VisualElement[]
  simbolos?: PieceCard['simbolos']
  animales?: PieceCard['animales']
  instrumentos?: PieceCard['instrumentos']
  hallazgo: PieceCard['lugares']['hallazgo']
  elaboracion?: PieceCard['lugares']['elaboracion']
  representado?: PieceCard['lugares']['representado']
  resguardo?: PieceCard['lugares']['resguardo']
  fuentes?: PieceCard['fuentes']
  narracion?: string
  lamina_secuencia?: string[]
  seed: number
}): PieceCard {
  return {
    id: input.id,
    nombre: input.nombre,
    nombre_alternativo: input.nombre_alternativo,
    cultura: input.cultura,
    periodo: input.periodo,
    tipo_objeto: input.tipo_objeto,
    clip_label: input.clip_label,
    sala: input.sala,
    inventario: input.inventario,
    resumen: input.resumen,
    texto_narracion: input.texto_narracion,
    elementos: input.elementos ?? [],
    simbolos: input.simbolos ?? [],
    animales: input.animales ?? [],
    instrumentos: input.instrumentos ?? [],
    lugares: {
      resguardo: input.resguardo ?? MNA,
      hallazgo: input.hallazgo,
      elaboracion: input.elaboracion,
      representado: input.representado,
    },
    fuentes: input.fuentes ?? [
      { titulo: 'Ficha educativa del paquete cultural', procedencia: 'Mensajes Vivos · guía local' },
    ],
    narracion: input.narracion,
    lamina_secuencia: input.lamina_secuencia,
    embedding: emb(input.seed),
  }
}

export const PIECES: PieceCard[] = [
  piece({
    seed: 11,
    id: 'coatlicue',
    nombre: 'Coatlicue',
    nombre_alternativo: 'Coatlicue mayor',
    cultura: 'Mexica',
    periodo: 'Posclásico tardío',
    tipo_objeto: 'escultura',
    clip_label: 'monumental Aztec stone sculpture of Coatlicue goddess with snake skirt and skull necklace in museum',
    sala: 'Sala Mexica',
    inventario: '10-1029',
    resumen:
      'Escultura monumental de andesita de Coatlicue. Dos serpientes forman el rostro; lleva collar de manos, corazones y cráneo, y faldellín de serpientes.',
    texto_narracion:
      'Coatlicue. Escultura mexica del Posclásico tardío en andesita. Se conserva en la Sala Mexica del Museo Nacional de Antropología. Fue hallada en 1790 en la Plaza Mayor de la Ciudad de México. Muestra un collar de manos y corazones y un faldellín de serpientes.',
    elementos: [
      { tipo: 'figura', nombre: 'serpientes entrelazadas', confianza: 0.9 },
      { tipo: 'adorno', nombre: 'collar de manos y corazones', confianza: 0.86 },
    ],
    simbolos: [
      { id: 'serpiente', titulo: 'Faldellín de serpientes', texto: 'Atributo iconográfico asociado a Coatlicue.' },
      { id: 'collar', titulo: 'Collar', texto: 'Manos, corazones y cráneo descritos en las fichas de sala.' },
    ],
    hallazgo: {
      etiqueta: 'Plaza Mayor (Zócalo), Ciudad de México, 1790',
      certeza: 'exacta',
      coordinates: [-99.1332, 19.4326],
    },
    narracion: 'narrations/coatlicue.wav',
  }),
  piece({
    seed: 22,
    id: 'piedra-del-sol',
    nombre: 'Piedra del Sol',
    nombre_alternativo: 'Calendario azteca',
    cultura: 'Mexica',
    periodo: 'Posclásico tardío',
    tipo_objeto: 'escultura',
    clip_label: 'Aztec Sun Stone calendar circular carved basalt disk with Tonatiuh face in museum',
    sala: 'Sala Mexica',
    resumen:
      'Monolito circular de basalto con la imagen de Tonatiuh al centro y glifos de los soles o eras. Es uno de los símbolos más reconocidos del México antiguo.',
    texto_narracion:
      'Piedra del Sol. Monolito mexica de basalto. Se conoce también como Calendario azteca. Al centro aparece el rostro de Tonatiuh. Se exhibe en el Museo Nacional de Antropología. Fue hallada en la Ciudad de México a finales del siglo XVIII.',
    elementos: [
      { tipo: 'glifo', nombre: 'rostro solar central', confianza: 0.92 },
      { tipo: 'relieve', nombre: 'anillos calendáricos', confianza: 0.9 },
    ],
    simbolos: [
      { id: 'tonatiuh', titulo: 'Tonatiuh', texto: 'El rostro central se asocia al Sol y a la era actual en la tradición mexica.' },
      { id: 'eras', titulo: 'Soles o eras', texto: 'Los glifos alrededor aluden a las eras mitológicas del tiempo mexica.' },
    ],
    hallazgo: {
      etiqueta: 'Ciudad de México, 1790',
      certeza: 'exacta',
      coordinates: [-99.14, 19.43],
    },
  }),
  piece({
    seed: 33,
    id: 'coyolxauhqui',
    nombre: 'Coyolxauhqui',
    nombre_alternativo: 'Disco de Coyolxauhqui',
    cultura: 'Mexica',
    periodo: 'Posclásico tardío',
    tipo_objeto: 'relieve',
    clip_label: 'Aztec stone relief disk of dismembered goddess Coyolxauhqui found at Templo Mayor',
    sala: 'Museo del Templo Mayor / referencia MNA',
    resumen:
      'Relieve circular que representa a Coyolxauhqui desmembrada. Fue hallado al pie del Templo Mayor de Tenochtitlan en 1978.',
    texto_narracion:
      'Coyolxauhqui. Relieve mexica en piedra. Representa a la diosa lunar desmembrada. Se halló en 1978 junto al Templo Mayor de Tenochtitlan, en el Centro Histórico de la Ciudad de México.',
    elementos: [{ tipo: 'figura', nombre: 'cuerpo desmembrado', confianza: 0.9 }],
    simbolos: [
      { id: 'luna', titulo: 'Coyolxauhqui', texto: 'Deidad asociada a la Luna en la mitología mexica; el relieve narra su derrota por Huitzilopochtli.' },
    ],
    hallazgo: {
      etiqueta: 'Templo Mayor, Ciudad de México, 1978',
      certeza: 'exacta',
      coordinates: [-99.1317, 19.4346],
    },
    resguardo: {
      etiqueta: 'Museo del Templo Mayor, Ciudad de México',
      certeza: 'exacta',
      coordinates: [-99.1315, 19.4348],
    },
  }),
  piece({
    seed: 44,
    id: 'ocelotl-cuauhxicalli',
    nombre: 'Océlotl Cuauhxicalli',
    nombre_alternativo: 'Cuauhxicalli en forma de ocelote',
    cultura: 'Mexica',
    periodo: 'Posclásico tardío',
    tipo_objeto: 'escultura',
    clip_label: 'Aztec stone jaguar sculpture ritual vessel Cuauhxicalli ocelot in museum',
    sala: 'Sala Mexica',
    inventario: '10-220916',
    resumen:
      'Recipiente ritual de piedra en forma de jaguar (océlotl). Los cuauhxicalli se usaban en contextos ceremoniales mexicas.',
    texto_narracion:
      'Océlotl Cuauhxicalli. Escultura mexica en forma de jaguar. Es un recipiente ritual. Se conserva en la Sala Mexica del Museo Nacional de Antropología.',
    elementos: [{ tipo: 'animal', nombre: 'jaguar', confianza: 0.98 }],
    animales: [
      {
        nombre: 'jaguar',
        especie: 'Panthera onca',
        audio: 'sounds/animals/jaguar.wav',
        nota: 'Sonido natural de referencia: jaguar. La escultura no producía este sonido.',
      },
    ],
    simbolos: [
      { id: 'cuauhxicalli', titulo: 'Cuauhxicalli', texto: 'Recipiente asociado a ofrendas rituales.' },
      { id: 'ocelotl', titulo: 'Océlotl', texto: 'Jaguar en náhuatl.' },
    ],
    hallazgo: {
      etiqueta: 'Recinto sagrado de Tenochtitlan (zona aproximada)',
      certeza: 'aproximada',
      coordinates: [-99.131, 19.435],
    },
    narracion: 'narrations/ocelotl.wav',
  }),
  piece({
    seed: 55,
    id: 'tlaloc-monolito',
    nombre: 'Monolito de Tláloc',
    cultura: 'Mexica / tradición del Altiplano',
    periodo: 'Posclásico',
    tipo_objeto: 'escultura',
    clip_label: 'giant Aztec stone monolith of rain god Tlaloc with goggle eyes outside museum',
    sala: 'Exterior / acervo MNA',
    resumen:
      'Escultura monumental asociada a Tláloc, deidad de la lluvia. Se caracteriza por ojos anulares y rasgos faciales estilizados.',
    texto_narracion:
      'Monolito de Tláloc. Escultura de gran formato asociada al dios de la lluvia. Se vincula al acervo del Museo Nacional de Antropología en la Ciudad de México.',
    elementos: [{ tipo: 'figura', nombre: 'ojos anulares', confianza: 0.88 }],
    simbolos: [
      { id: 'lluvia', titulo: 'Tláloc', texto: 'Deidad de la lluvia y la fertilidad agrícola en el Altiplano central.' },
    ],
    hallazgo: {
      etiqueta: 'Cuenca de México (referencia regional)',
      certeza: 'aproximada',
      coordinates: [-99.1, 19.4],
    },
  }),
  piece({
    seed: 66,
    id: 'chacmool',
    nombre: 'Chacmool',
    cultura: 'Tolteca / Maya / tradición mesoamericana',
    periodo: 'Posclásico',
    tipo_objeto: 'escultura',
    clip_label: 'Mesoamerican Chacmool reclining stone figure holding a bowl on its stomach',
    sala: 'Salas del Posclásico',
    resumen:
      'Figura reclinada que sostiene un recipiente sobre el abdomen. Aparece en contextos toltecas, mayas y mexicas con variantes regionales.',
    texto_narracion:
      'Chacmool. Escultura mesoamericana de una figura reclinada con un recipiente sobre el vientre. Se encuentra en varios sitios del Posclásico, incluidos Tula y Chichén Itzá.',
    elementos: [{ tipo: 'figura', nombre: 'personaje reclinado', confianza: 0.9 }],
    simbolos: [
      { id: 'ofrenda', titulo: 'Recipiente', texto: 'El cuenco sobre el abdomen se asocia a ofrendas en contextos rituales.' },
    ],
    hallazgo: {
      etiqueta: 'Tradición mesoamericana del Posclásico (varios sitios)',
      certeza: 'propuestas_multiples',
    },
  }),
  piece({
    seed: 77,
    id: 'atlantes-tula',
    nombre: 'Atlantes de Tula',
    cultura: 'Tolteca',
    periodo: 'Posclásico temprano',
    tipo_objeto: 'escultura',
    clip_label: 'Toltec Atlantean warrior columns of Tula tall stone figures with weapons',
    sala: 'Sala Tolteca / zona arqueológica',
    resumen:
      'Columnas antropomorfas de guerreros toltecas en Tula, Hidalgo. Llevan atavíos militares y sostenían la cubierta de un templo.',
    texto_narracion:
      'Atlantes de Tula. Esculturas toltecas de guerreros en piedra. Se encuentran en la zona arqueológica de Tula, en Hidalgo. Representan figuras erguidas con atributos militares.',
    elementos: [{ tipo: 'figura', nombre: 'guerrero erguido', confianza: 0.9 }],
    simbolos: [
      { id: 'guerrero', titulo: 'Guerrero tolteca', texto: 'Atavío militar característico del arte de Tula.' },
    ],
    hallazgo: {
      etiqueta: 'Tula, Hidalgo',
      certeza: 'exacta',
      coordinates: [-99.34, 20.06],
    },
    resguardo: {
      etiqueta: 'Zona arqueológica de Tula / acervos asociados',
      certeza: 'exacta',
      coordinates: [-99.34, 20.06],
    },
  }),
  piece({
    seed: 88,
    id: 'cabeza-olmeca',
    nombre: 'Cabeza colosal olmeca',
    cultura: 'Olmeca',
    periodo: 'Preclásico',
    tipo_objeto: 'escultura',
    clip_label: 'Olmec colossal stone head with helmet-like headdress carved basalt',
    sala: 'Sala Culturas del Golfo',
    resumen:
      'Escultura monumental de basalto con rostro humano y tocado. Las cabezas colosales son emblema del arte olmeca del Golfo de México.',
    texto_narracion:
      'Cabeza colosal olmeca. Escultura de basalto del Preclásico. Representa un rostro con tocado. Procede de la región del Golfo de México, con hallazgos en sitios como San Lorenzo y La Venta.',
    elementos: [{ tipo: 'figura', nombre: 'rostro monumental', confianza: 0.93 }],
    simbolos: [
      { id: 'tocado', titulo: 'Tocado', texto: 'El casco o tocado es un rasgo distintivo de las cabezas colosales.' },
    ],
    hallazgo: {
      etiqueta: 'Costa del Golfo de México (San Lorenzo, La Venta u otros)',
      certeza: 'propuestas_multiples',
      coordinates: [-94.5, 17.8],
    },
  }),
  piece({
    seed: 99,
    id: 'mascara-teotihuacan',
    nombre: 'Máscara teotihuacana',
    cultura: 'Teotihuacana',
    periodo: 'Clásico',
    tipo_objeto: 'escultura',
    clip_label: 'Teotihuacan stone funerary mask with geometric face and shell eyes',
    sala: 'Sala Teotihuacan',
    resumen:
      'Máscara de piedra con rasgos geométricos, frecuente en contextos funerarios teotihuacanos. A menudo incorpora incrustaciones.',
    texto_narracion:
      'Máscara teotihuacana. Pieza de piedra del periodo Clásico. Muestra un rostro de formas geométricas. Se asocia a Teotihuacan, en el Estado de México.',
    elementos: [{ tipo: 'figura', nombre: 'rostro geométrico', confianza: 0.88 }],
    simbolos: [
      { id: 'mascara', titulo: 'Máscara', texto: 'Objeto ritual y funerario característico del arte teotihuacano.' },
    ],
    hallazgo: {
      etiqueta: 'Teotihuacan y región central (según pieza)',
      certeza: 'aproximada',
      coordinates: [-98.87, 19.69],
    },
  }),
  piece({
    seed: 101,
    id: 'serpiente-emplumada',
    nombre: 'Serpiente emplumada',
    nombre_alternativo: 'Quetzalcóatl / Kukulkán (representación)',
    cultura: 'Teotihuacana / tradición mesoamericana',
    periodo: 'Clásico–Posclásico',
    tipo_objeto: 'relieve',
    clip_label: 'Mesoamerican feathered serpent Quetzalcoatl carved stone relief temple decoration',
    sala: 'Sala Teotihuacan / zonas arqueológicas',
    resumen:
      'Motivo de serpiente con plumas, asociado a Quetzalcóatl en el centro de México y a Kukulkán en el área maya. Aparece en fachadas y relieves templarios.',
    texto_narracion:
      'Serpiente emplumada. Motivo mesoamericano que combina serpiente y plumas. Se vincula a Quetzalcóatl y a Kukulkán. Se observa en Teotihuacan, Tula, Chichén Itzá y otros sitios.',
    elementos: [{ tipo: 'animal', nombre: 'serpiente emplumada', confianza: 0.9 }],
    simbolos: [
      { id: 'quetzalcoatl', titulo: 'Quetzalcóatl', texto: 'Deidad y símbolo cultural de amplia difusión en Mesoamérica.' },
    ],
    hallazgo: {
      etiqueta: 'Varios sitios mesoamericanos',
      certeza: 'propuestas_multiples',
    },
  }),
  piece({
    seed: 112,
    id: 'pakal-tapa',
    nombre: 'Lápida de Pakal',
    nombre_alternativo: 'Tapa del sarcófago de K’inich Janaab’ Pakal',
    cultura: 'Maya',
    periodo: 'Clásico tardío',
    tipo_objeto: 'relieve',
    clip_label: 'Maya Palenque Pakal sarcophagus lid carved with king ascending world tree',
    sala: 'Sala Maya',
    resumen:
      'Relieve de la tapa del sarcófago de Pakal en Palenque. Muestra al gobernante en relación con el árbol del mundo y elementos cósmicos mayas.',
    texto_narracion:
      'Lápida de Pakal. Relieve maya del Clásico tardío. Formaba la tapa del sarcófago de K’inich Janaab’ Pakal en Palenque, Chiapas. Representa al gobernante junto al árbol del mundo.',
    elementos: [{ tipo: 'figura', nombre: 'gobernante y árbol del mundo', confianza: 0.9 }],
    simbolos: [
      { id: 'arbol', titulo: 'Árbol del mundo', texto: 'Eje cósmico frecuente en la iconografía maya clásica.' },
    ],
    hallazgo: {
      etiqueta: 'Templo de las Inscripciones, Palenque, Chiapas',
      certeza: 'exacta',
      coordinates: [-92.046, 17.484],
    },
    resguardo: {
      etiqueta: 'Zona arqueológica de Palenque / réplicas y referencias museísticas',
      certeza: 'exacta',
      coordinates: [-92.046, 17.484],
    },
  }),
  piece({
    seed: 123,
    id: 'estela-maya',
    nombre: 'Estela maya',
    cultura: 'Maya',
    periodo: 'Clásico',
    tipo_objeto: 'relieve',
    clip_label: 'Maya limestone stela tall carved monument with ruler and hieroglyphic inscriptions',
    sala: 'Sala Maya',
    resumen:
      'Monumento vertical de piedra con la imagen de un gobernante y textos jeroglíficos. Las estelas registraban fechas y eventos dinásticos.',
    texto_narracion:
      'Estela maya. Monumento tallado del periodo Clásico. Suele mostrar a un gobernante acompañado de inscripciones. Ejemplos importantes proceden de ciudades como Copán, Tikal y Yaxchilán.',
    elementos: [
      { tipo: 'figura', nombre: 'gobernante', confianza: 0.85 },
      { tipo: 'glifo', nombre: 'inscripciones', confianza: 0.85 },
    ],
    simbolos: [
      { id: 'glifos', titulo: 'Jeroglíficos', texto: 'Escritura maya que registra fechas, nombres y eventos.' },
    ],
    hallazgo: {
      etiqueta: 'Área maya (varios sitios)',
      certeza: 'propuestas_multiples',
      coordinates: [-90.5, 17.2],
    },
  }),
  piece({
    seed: 134,
    id: 'urna-zapoteca',
    nombre: 'Urna zapoteca',
    cultura: 'Zapoteca',
    periodo: 'Clásico',
    tipo_objeto: 'vasija',
    clip_label: 'Zapotec ceramic funerary urn with seated deity figure from Oaxaca',
    sala: 'Sala Oaxaca',
    resumen:
      'Urna funeraria de cerámica con figura sedente, característica de Monte Albán y la tradición zapoteca de Oaxaca.',
    texto_narracion:
      'Urna zapoteca. Vasija funeraria de cerámica del Clásico. Suele mostrar una figura sedente con tocado elaborado. Se asocia a Monte Albán y a la cultura zapoteca en Oaxaca.',
    elementos: [{ tipo: 'figura', nombre: 'personaje sedente', confianza: 0.86 }],
    simbolos: [
      { id: 'urna', titulo: 'Urna funeraria', texto: 'Contenedor ceremonial vinculado a contextos de enterramiento.' },
    ],
    hallazgo: {
      etiqueta: 'Valle de Oaxaca / Monte Albán (según ejemplar)',
      certeza: 'aproximada',
      coordinates: [-96.77, 17.04],
    },
  }),
  piece({
    seed: 145,
    id: 'codice-fejervary',
    nombre: 'Xólotl en el Códice Fejérváry-Mayer',
    nombre_alternativo: 'Códice Fejérváry-Mayer',
    cultura: 'Tradición pictórica del Posclásico',
    periodo: 'Posclásico',
    tipo_objeto: 'codice',
    clip_label: 'pre-Hispanic Mesoamerican painted codex page with dog-headed deity Xolotl',
    sala: 'Referencia de códice',
    resumen:
      'Lámina del Códice Fejérváry-Mayer con figura de rasgos caninos asociada a Xólotl. El manuscrito se conserva en Liverpool.',
    texto_narracion:
      'Xólotl en el Códice Fejérváry-Mayer. Lámina pictórica del Posclásico. La figura tiene rasgos caninos. El códice se resguarda en el World Museum de Liverpool. Su procedencia exacta es desconocida.',
    elementos: [{ tipo: 'deidad', nombre: 'rasgos caninos', confianza: 0.88 }],
    animales: [
      {
        nombre: 'xoloitzcuintle',
        audio: 'sounds/animals/xolo.wav',
        nota: 'Rasgos caninos de Xólotl. El audio es de un xoloitzcuintle contemporáneo.',
      },
    ],
    simbolos: [
      { id: 'canino', titulo: 'Rasgos caninos', texto: 'Asociación iconográfica con Xólotl.' },
    ],
    hallazgo: {
      etiqueta: 'Procedencia exacta desconocida',
      certeza: 'desconocida',
    },
    resguardo: {
      etiqueta: 'World Museum, Liverpool',
      certeza: 'exacta',
      coordinates: [-2.981, 53.403],
    },
    narracion: 'narrations/xolotl.wav',
    lamina_secuencia: ['portada', 'lamina-xolotl', 'lamina-siguiente'],
  }),
  piece({
    seed: 156,
    id: 'codice-borbonico',
    nombre: 'Códice Borbónico',
    cultura: 'Mexica / tradición del Altiplano',
    periodo: 'Posclásico / colonial temprano',
    tipo_objeto: 'codice',
    clip_label: 'Aztec Codex Borbonicus painted screenfold manuscript with tonalamatl calendar deities',
    sala: 'Referencia de códice',
    resumen:
      'Códice calendárico con secciones del tonalámatl. Conserva pintura tradicional del centro de México y se asocia al periodo de contacto.',
    texto_narracion:
      'Códice Borbónico. Manuscrito pictórico del centro de México. Incluye el tonalámatl, el calendario de 260 días. Se conserva en la Biblioteca de la Asamblea Nacional de Francia.',
    elementos: [{ tipo: 'glifo', nombre: 'calendario pictórico', confianza: 0.85 }],
    simbolos: [
      { id: 'tonalamatl', titulo: 'Tonalámatl', texto: 'Libro calendárico usado en la tradición nahua.' },
    ],
    hallazgo: {
      etiqueta: 'Centro de México (procedencia discutida)',
      certeza: 'aproximada',
    },
    resguardo: {
      etiqueta: 'Bibliothèque de l’Assemblée nationale, París',
      certeza: 'exacta',
      coordinates: [2.318, 48.86],
    },
  }),
  piece({
    seed: 167,
    id: 'teponaztli',
    nombre: 'Teponaztli',
    cultura: 'Mexica / Mesoamérica',
    periodo: 'Posclásico',
    tipo_objeto: 'instrumento',
    clip_label: 'pre-Hispanic wooden slit drum teponaztli Aztec musical instrument',
    sala: 'Instrumentos / Sala Mexica',
    resumen:
      'Tambor de madera con lengüetas que se golpean con baquetas. Fue un instrumento central en la música ceremonial mexica.',
    texto_narracion:
      'Teponaztli. Instrumento musical de madera. Es un tambor de lengüeta usado en ceremonias del México antiguo. Se documenta en fuentes mexicas y en piezas arqueológicas.',
    elementos: [{ tipo: 'instrumento', nombre: 'tambor de lengüeta', confianza: 0.9 }],
    instrumentos: [
      {
        nombre: 'teponaztli',
        categoria: 'replica_arqueomusical',
        audio: 'sounds/instruments/teponaztli.wav',
        fuente: 'Paquete local',
        nota: 'Réplica arqueomusical de referencia. No es necesariamente la pieza original.',
      },
    ],
    simbolos: [
      { id: 'musica', titulo: 'Música ritual', texto: 'El teponaztli acompañaba danzas y ceremonias.' },
    ],
    hallazgo: {
      etiqueta: 'Tradición del Altiplano y otras regiones',
      certeza: 'propuestas_multiples',
    },
  }),
  piece({
    seed: 178,
    id: 'huehuetl',
    nombre: 'Huéhuetl',
    cultura: 'Mexica / Mesoamérica',
    periodo: 'Posclásico',
    tipo_objeto: 'instrumento',
    clip_label: 'Aztec upright wooden drum huehuetl cylindrical percussion instrument',
    sala: 'Instrumentos / Sala Mexica',
    resumen:
      'Tambor vertical de madera, a menudo con membrana. Se tocaba junto al teponaztli en contextos ceremoniales.',
    texto_narracion:
      'Huéhuetl. Tambor vertical del México antiguo. Se usaba en música ceremonial mexica, con frecuencia junto al teponaztli.',
    elementos: [{ tipo: 'instrumento', nombre: 'tambor vertical', confianza: 0.88 }],
    simbolos: [
      { id: 'tambor', titulo: 'Tambor', texto: 'Percusión de memorias rituales documentadas en códices y crónicas.' },
    ],
    hallazgo: {
      etiqueta: 'Tradición del Altiplano',
      certeza: 'aproximada',
    },
  }),
  piece({
    seed: 189,
    id: 'vasija-maya',
    nombre: 'Vasija policroma maya',
    cultura: 'Maya',
    periodo: 'Clásico',
    tipo_objeto: 'vasija',
    clip_label: 'Maya polychrome ceramic vase with painted figures and glyphs',
    sala: 'Sala Maya',
    resumen:
      'Vasija de cerámica pintada con escenas cortesanas o mitológicas y, a veces, textos jeroglíficos.',
    texto_narracion:
      'Vasija policroma maya. Cerámica del Clásico con pintura narrativa. Puede mostrar gobernantes, dioses o rituales, a veces con glifos.',
    elementos: [{ tipo: 'figura', nombre: 'escena pintada', confianza: 0.84 }],
    simbolos: [
      { id: 'pintura', titulo: 'Narrativa pictórica', texto: 'Las vasijas mayas cuentan historias de la corte y del mito.' },
    ],
    hallazgo: {
      etiqueta: 'Área maya (varios sitios)',
      certeza: 'propuestas_multiples',
    },
  }),
  piece({
    seed: 190,
    id: 'metate',
    nombre: 'Metate',
    cultura: 'Mesoamérica (uso cotidiano)',
    periodo: 'Preclásico–Posclásico',
    tipo_objeto: 'objeto_desconocido',
    clip_label: 'Mesoamerican stone metate grinding slab with mano roller for maize',
    sala: 'Vida cotidiana',
    resumen:
      'Piedra de moler usada para nixtamal y otros alimentos. Es uno de los objetos más extendidos de la vida cotidiana mesoamericana.',
    texto_narracion:
      'Metate. Piedra de moler del México antiguo y de la tradición indígena posterior. Se usaba para preparar maíz y otros alimentos.',
    elementos: [{ tipo: 'objeto', nombre: 'piedra de moler', confianza: 0.85 }],
    simbolos: [
      { id: 'maiz', titulo: 'Maíz', texto: 'El metate está ligado a la alimentación basada en el maíz.' },
    ],
    hallazgo: {
      etiqueta: 'Ampliamente distribuido en Mesoamérica',
      certeza: 'propuestas_multiples',
    },
  }),
  piece({
    seed: 201,
    id: 'penate-teotihuacan',
    nombre: 'Figurilla teotihuacana',
    cultura: 'Teotihuacana',
    periodo: 'Clásico',
    tipo_objeto: 'escultura',
    clip_label: 'Teotihuacan small ceramic figurine with triangular face and geometric dress',
    sala: 'Sala Teotihuacan',
    resumen:
      'Figurilla de cerámica con rostro triangular y atavío esquemático, frecuente en ofrendas y contextos domésticos de Teotihuacan.',
    texto_narracion:
      'Figurilla teotihuacana. Pequeña escultura de cerámica del Clásico. Muestra un rostro triangular y formas geométricas típicas de Teotihuacan.',
    elementos: [{ tipo: 'figura', nombre: 'figurilla esquemática', confianza: 0.82 }],
    simbolos: [
      { id: 'ofrenda', titulo: 'Ofrenda', texto: 'Muchas figurillas aparecen en contextos rituales y domésticos.' },
    ],
    hallazgo: {
      etiqueta: 'Teotihuacan',
      certeza: 'aproximada',
      coordinates: [-98.87, 19.69],
    },
  }),
]

export const MANIFEST: PackageManifest = {
  id: 'mna-sala-mexica',
  version: '1.1.0',
  venueId: 'mna',
  venueName: 'Museo Nacional de Antropología',
  roomName: 'Guía ampliada Mesoamérica',
  checksum: 'demo-sha256-mesoamerica-v1',
  signature: 'demo-unsigned-local-package',
  demo: true,
  stats: { piezas: PIECES.length, audios: 18, mapa: true },
  levels: {
    esencial: {
      bytes: 12_000_000,
      label: 'Fichas, miniaturas y mapa',
      files: ['manifest.json', 'venue.json', 'rooms.json', 'pieces.json', 'maps/venue.geojson'],
    },
    sonoro: {
      bytes: 22_000_000,
      label: 'Añade animales e instrumentos',
      files: ['sounds/animals/', 'sounds/instruments/'],
    },
    completo: {
      bytes: 48_000_000,
      label: 'Añade imágenes y narraciones',
      files: ['images/', 'narrations/', 'embeddings.bin'],
    },
  },
}

export const GLOSSARY: Record<string, string> = {
  cuauhxicalli: 'Recipiente ritual documentado en fuentes mexicas.',
  ocelotl: 'Jaguar.',
  xolotl: 'Deidad de rasgos caninos en la tradición pictórica.',
  teponaztli: 'Tambor de lengüeta de madera.',
  huehuetl: 'Tambor vertical.',
  chacmool: 'Figura reclinada con recipiente sobre el abdomen.',
}

export const LICENSES: Record<string, string> = {
  datos: 'Datos educativos del paquete. No sustituyen cédulas oficiales de museo.',
  audio_jaguar: 'Sonido natural de referencia.',
  audio_xolo: 'Referencia contemporánea. No es la voz de una deidad.',
  audio_teponaztli: 'Réplica arqueomusical de referencia.',
}
