import type { ObjectType, PieceCard } from '../types'

export type PieceDraft = Omit<PieceCard, 'historia' | 'curiosidades' | 'enlaces'>

const MNA: [number, number] = [-99.1863, 19.426]
const ZOCALO: [number, number] = [-99.1332, 19.4326]

function wiki(q: string) {
  return `https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`
}
function inah(q: string) {
  return `https://mediateca.inah.gob.mx/islandora_74/search/${encodeURIComponent(q)}`
}
function mexicana(q: string) {
  return `https://mexicana.cultura.gob.mx/es/repositorio/busqueda?q=${encodeURIComponent(q)}`
}

export function coordsForCulture(cultura: string): [number, number] {
  const c = cultura.toLowerCase()
  if (c.includes('maya')) return [-89.62, 20.68]
  if (c.includes('olmeca')) return [-94.57, 17.75]
  if (c.includes('teotihua')) return [-98.843, 19.692]
  if (c.includes('zapoteca')) return [-96.767, 17.044]
  if (c.includes('mixteca')) return [-97.35, 17.27]
  if (c.includes('purépecha') || c.includes('purepecha')) return [-101.574, 19.628]
  if (c.includes('tolteca')) return [-99.342, 20.064]
  if (c.includes('golfo')) return [-96.446, 20.475]
  if (c.includes('occidente') || c.includes('nayarit') || c.includes('colima') || c.includes('jalisco')) {
    return [-103.73, 19.24]
  }
  if (c.includes('tlaxcal')) return [-98.237, 19.319]
  return ZOCALO
}

const TIPO_CURIOS: Record<ObjectType, string[]> = {
  escultura: [
    'Varias esculturas monumentales del centro de México reaparecieron en obras urbanas de los siglos XVIII y XX.',
    'La piedra (andesita, basalto o tezontle) se labraba con herramientas de piedra más dura y abrasivos.',
  ],
  relieve: [
    'Los relieves se leían en un orden ritual: no son “adornos”, son relato en piedra.',
    'En estelas y dinteles mayas, imagen y glifo se complementan: una sin el otro pierde fechas y nombres.',
  ],
  codice: [
    'Un códice se despliega como biombo. No se hojea como un libro europeo.',
    'El soporte suele ser amate o piel; los colores (rojo, azul, negro, amarillo) tienen valor simbólico.',
  ],
  glifo: [
    'El tonalpohualli combina 20 signos con 13 numerales: 260 combinaciones.',
    'Un glifo puede ser día, nombre de persona o lugar: el contexto de la lámina decide la lectura.',
  ],
  deidad: [
    'En la pictografía, se identifica al dios por atributos (máscara, atavío, color), no por un retrato realista.',
    'Una misma deidad puede tener varios aspectos: lluvia, viento, guerra o maíz cambian el disfraz.',
  ],
  vasija: [
    'La cerámica pintada o efigie a menudo salía de contextos funerarios u ofrendas, no solo de la cocina.',
    'Forma y decoración indican taller, región y a veces un ritual concreto.',
  ],
  instrumento: [
    'Teponaztli y huéhuetl aparecen juntos en crónicas y códices: eran la pareja rítmica ceremonial.',
    'Hoy se escuchan réplicas arqueomusicales; el timbre original dependía de madera, parche y uso.',
  ],
  arquitectura: [
    'Pirámides y templos se ampliaban en capas: debajo de un edificio suele haber otro más antiguo.',
    'La orientación solar y las escalinatas organizaban fiestas y calendarios, no solo la circulación.',
  ],
  mascara: [
    'Las máscaras de piedra o mosaico de jade cubrían el rostro del muerto o se usaban en ritual.',
    'Concha, obsidiana y turquesa marcaban ojos y dientes: no son “maquillaje”, son cosmología.',
  ],
  figurilla: [
    'Las figurillas aparecen en casas y ofrendas: el ritual no ocurría solo en templos monumentales.',
    'Rostros esquemáticos (Teotihuacan, Occidente) no buscan retrato individual.',
  ],
  objeto_desconocido: [
    'Objetos cotidianos como el metate sostienen la misma civilización que las esculturas de templo.',
    'La obsidiana de yacimientos del Eje Neovolcánico viajaba cientos de kilómetros por intercambio.',
  ],
}

type Extra = Partial<Pick<PieceCard, 'historia' | 'curiosidades' | 'enlaces' | 'simbolos' | 'texto_narracion'>>

const EXTRA: Record<string, Extra> = {
  coatlicue: {
    historia:
      'Coatlicue, “la de la falda de serpientes”, es madre de Huitzilopochtli en el relato del Cerro Coatepec. La escultura monumental de andesita se halló en 1790 al empedrar la Plaza Mayor; el virreinato la volvió a enterrar por temor y más tarde se recuperó para el museo. Hoy se lee en la Sala Mexica: dos serpientes forman el rostro decapitado, el collar lleva manos, corazones y un cráneo, y el faldellín es un nudo de serpientes.',
    curiosidades: [
      'Mide más de 2.5 m. No es un “ídolo genérico”: cada atributo corresponde al mito de su muerte y al nacimiento de Huitzilopochtli.',
      'Durante décadas permaneció oculta. El redescubrimiento moderno cambió cómo se entendía la escultura mexica monumental.',
      'El inventario 10-1029 del MNA es una de las piezas más visitadas de México.',
    ],
    enlaces: [
      { titulo: 'Coatlicue (Wikipedia)', url: wiki('Coatlicue escultura'), nota: 'Contexto histórico y mito' },
      { titulo: 'Museo Nacional de Antropología', url: 'https://www.mna.inah.gob.mx/', nota: 'Resguardo actual' },
      { titulo: 'Mediateca INAH', url: inah('Coatlicue'), nota: 'Fichas e imágenes de archivo' },
    ],
  },
  'piedra-del-sol': {
    historia:
      'La Piedra del Sol, de basalto, se desenterró el 17 de diciembre de 1790 cerca de la catedral. Pasó años empotrada en la torre oeste antes de llegar al museo. Al centro se lee un rostro solar (asociado a Tonatiuh) y alrededor los soles o eras, signos de días y la banda de estrellas. El nombre popular “calendario azteca” es moderno: es un monumento cosmológico, no un almanaque de pared.',
    curiosidades: [
      'Mide unos 3.6 m de diámetro y pesa más de 20 toneladas.',
      'El glifo central se ha leído como Tonatiuh o como la Tierra; el debate sigue abierto en la investigación.',
      'Su fama masiva nació en el siglo XIX, cuando se volvió emblema de la nación.',
    ],
    enlaces: [
      { titulo: 'Piedra del Sol (Wikipedia)', url: wiki('Piedra del Sol'), nota: 'Historia del hallazgo' },
      { titulo: 'MNA · INAH', url: 'https://www.mna.inah.gob.mx/', nota: 'Sala Mexica' },
      { titulo: 'Mexicana', url: mexicana('Piedra del Sol'), nota: 'Acervo digital de cultura' },
    ],
  },
  coyolxauhqui: {
    historia:
      'El 28 de febrero de 1978, electricistas hallaron el disco al pie del Templo Mayor. Coyolxauhqui aparece desmembrada: el mito cuenta que Huitzilopochtli la venció al nacer. El relieve se lee como relato fundacional del templo, no como retrato anatómico. Se resguarda en el Museo del Templo Mayor, a metros del hallazgo.',
    curiosidades: [
      'El hallazgo accidental relanzó la arqueología del recinto sagrado de Tenochtitlan.',
      'Campanas en las mejillas explican el nombre: “la de los cascabeles pintados en la cara”.',
      'Estaba colocada al pie de la escalera hacia Huitzilopochtli: quien subía “pisaba” el mito.',
    ],
    enlaces: [
      { titulo: 'Museo del Templo Mayor', url: 'https://www.templomayor.inah.gob.mx/', nota: 'Resguardo y zona' },
      { titulo: 'Coyolxauhqui (Wikipedia)', url: wiki('Coyolxauhqui'), nota: 'Mito e iconografía' },
    ],
  },
  'ocelotl-cuauhxicalli': {
    historia:
      'El cuauhxicalli (“vaso del águila”) recibía ofrendas en rituales mexicas. Esta pieza toma la forma de ocelote: el jaguar es fuerza nocturna y de guerra. Se asocia al recinto de Tenochtitlan y hoy se exhibe en la Sala Mexica del MNA.',
    curiosidades: [
      'Ocelote y águila forman el par de órdenes militares mexicas: cuāuhocēlōtl.',
      'La cavidad dorsal no es un “adorno”: es el recipiente ritual.',
    ],
  },
  'tlaloc-monolito': {
    historia:
      'El gran monolito asociado a Tláloc se trasladó al MNA en 1964 entre lluvia torrencial, un episodio que la ciudad todavía cuenta. Los ojos anulares y los colmillos son el “rostro de lluvia” del Altiplano. Se exhibe en el entorno del museo.',
    curiosidades: [
      'El traslado nocturno por Paseo de la Reforma se volvió leyenda urbana: cayó un aguacero.',
      'Hay debate sobre si representa a Tláloc o a una deidad femenina del agua; la ficha de sala usa la asociación tradicional.',
    ],
  },
  'cabeza-olmeca': {
    historia:
      'Las cabezas colosales olmecas (Preclásico, Golfo) son retratos de gobernantes con tocado-casco, labradas en basalto traído desde muchos kilómetros. Cada una es única. El tipo se documenta en San Lorenzo, La Venta y Tres Zapotes.',
    curiosidades: [
      'Algunas superan las 20 toneladas. El basalto no afloraba junto al taller: hubo transporte fluvial y humano.',
      'No son “dioses anónimos”: el tocado identifica linajes o equipos de juego.',
    ],
    enlaces: [
      { titulo: 'Cabeza colosal olmeca', url: wiki('Cabeza colosal olmeca'), nota: 'Sitios y cronología' },
      { titulo: 'MNA', url: 'https://www.mna.inah.gob.mx/', nota: 'Sala Culturas del Golfo' },
    ],
  },
  'pakal-tapa': {
    historia:
      'La lápida del sarcófago de K’inich Janaab’ Pakal, en Palenque, muestra al gobernante en el eje del árbol del mundo. Fue documentada en el Templo de las Inscripciones. La lectura jeroglífica nombra a Pakal y su linaje; no es un “astronauta”, es cosmología maya clásica.',
    curiosidades: [
      'El sarcófago permanece en Palenque; lo que circula en museos y libros son calcos, réplicas y fotografías.',
      'El “árbol” es el eje que une inframundo, tierra y cielo.',
    ],
    enlaces: [
      { titulo: 'Pakal el Grande', url: wiki('K\'inich Janaab\' Pakal'), nota: 'Dinastía de Palenque' },
      { titulo: 'Zona de Palenque (INAH)', url: 'https://www.inah.gob.mx/', nota: 'Sitio de hallazgo' },
    ],
  },
  'codice-borbonico': {
    historia:
      'El Códice Borbónico es un tonalámatl: cuenta de 260 días con deidades y treceñas. Se conserva en París (Biblioteca de la Asamblea Nacional), pero es una de las claves para leer el calendario nahua. Las láminas se recorren como camino ritual, no como novela.',
    curiosidades: [
      'El nombre “Borbónico” viene de su resguardo francés, no de un autor mexica.',
      'Sirve para identificar dioses por su atavío en otras pinturas y esculturas.',
    ],
    enlaces: [
      { titulo: 'Códice Borbónico', url: wiki('Códice Borbónico'), nota: 'Láminas y procedencia' },
      { titulo: 'Mexicana', url: mexicana('Códice Borbónico'), nota: 'Reproducciones' },
    ],
  },
  'codice-mendoza': {
    historia:
      'El Códice Mendoza se pintó hacia 1541 por tlacuilos indígenas con glosas en español. Abre con la fundación de Tenochtitlan (águila sobre nopal), sigue conquistas y cierra con tributos y vida cotidiana. Hoy está en la Bodleian Library de Oxford; las copias circulan en México.',
    curiosidades: [
      'Iba destinado a Carlos V; el barco fue tomado y el manuscrito acabó en Inglaterra.',
      'Las listas de tributo son un mapa económico del imperio mexica.',
    ],
    enlaces: [
      { titulo: 'Códice Mendoza', url: wiki('Códice Mendoza'), nota: 'Estructura y viaje del manuscrito' },
      { titulo: 'Bodleian (ficha)', url: 'https://digital.bodleian.ox.ac.uk/', nota: 'Resguardo actual' },
    ],
  },
  'codice-dresde': {
    historia:
      'El Códice de Dresde es uno de los pocos códices mayas prehispánicos conservados. Contiene tablas de Venus, eclipses y almanaques. Se resguarda en la SLUB de Dresde; su contenido habla del cielo y el ritual del área maya de México y la península.',
    curiosidades: [
      'Sobrevivió los bombardeos de 1945 con daños de agua; se restauró después.',
      'Las tablas de Venus permitieron a los mayas prever apariciones del planeta.',
    ],
    enlaces: [
      { titulo: 'Códice de Dresde', url: wiki('Códice de Dresde'), nota: 'Astronomía maya' },
    ],
  },
  'piramide-sol-teotihuacan': {
    historia:
      'La Pirámide del Sol organiza la Calzada de los Muertos en Teotihuacan. Se construyó en el periodo Clásico sobre un túnel y ofrendas. No hay un “rey” retratado en la fachada: Teotihuacan habla con talud-tablero, orientación y escala.',
    curiosidades: [
      'Es una de las pirámides de mayor volumen en el México antiguo.',
      'Debajo hay un túnel hacia un recinto que evoca el inframundo.',
    ],
    enlaces: [
      { titulo: 'Teotihuacan (INAH)', url: 'https://www.inah.gob.mx/', nota: 'Zona arqueológica' },
      { titulo: 'Pirámide del Sol', url: wiki('Pirámide del Sol'), nota: 'Arquitectura' },
    ],
  },
  'castillo-chichen': {
    historia:
      'El Castillo de Chichén Itzá, dedicado a Kukulkán, combina escalinatas, números calendáricos y la sombra serpentiforme de los equinoccios. Es arquitectura maya del Posclásico en Yucatán, resguardada como zona arqueológica.',
    curiosidades: [
      '91 escalones por lado más la plataforma superior suman 365, lectura calendárica frecuente.',
      'En el equinoccio, los triángulos de sombra bajan por la alfarda norte como cuerpo de serpiente.',
    ],
    enlaces: [
      { titulo: 'Chichén Itzá', url: wiki('Chichén Itzá'), nota: 'Sitio y conservación' },
      { titulo: 'INAH Yucatán', url: 'https://www.inah.gob.mx/', nota: 'Visita y normas' },
    ],
  },
  'templo-mayor': {
    historia:
      'El Templo Mayor de Tenochtitlan era una pirámide doble: Tláloc al norte y Huitzilopochtli al sur. Se amplió en etapas superpuestas. Tras 1521 quedó bajo el centro colonial; la arqueología urbana lo devolvió a la vista desde 1978.',
    curiosidades: [
      'Cada ampliación “enterraba” ofrendas de la etapa anterior: un archivo en capas.',
      'El Museo del Templo Mayor explica las ofrendas halladas in situ.',
    ],
    enlaces: [
      { titulo: 'Museo y zona del Templo Mayor', url: 'https://www.templomayor.inah.gob.mx/', nota: 'Hallazgo y resguardo' },
    ],
  },
  teponaztli: {
    historia:
      'El teponaztli es un tambor de madera con dos lengüetas que dan dos alturas. Acompañaba danza, guerra y fiesta. Aparece en códices junto al huéhuetl. Los ejemplares de museo son piezas arqueológicas; el sonido que se ofrece en la app es réplica, no la voz del objeto original.',
    curiosidades: [
      'Las lengüetas se afinan al adelgazar la madera: es un instrumento de carpintería precisa.',
      'A veces el cuerpo es un animal o un personaje recostado.',
    ],
  },
  metate: {
    historia:
      'El metate, con su mano, muele nixtamal. Está en casas de casi todo el México antiguo y en la cocina indígena posterior. No es “menor” frente a los monolitos: sin maíz procesado no hay fiesta ni templo.',
    curiosidades: [
      'La nixtamalización (cal) libera niacina y hace comestible el maíz como base de dieta.',
      'Hay metates rituales con efigies; la forma llana es la más común.',
    ],
  },
}

function defaultLinks(nombre: string): NonNullable<PieceCard['enlaces']> {
  const q = nombre
  return [
    { titulo: `Buscar “${q}” en Wikipedia`, url: wiki(q), nota: 'Enciclopedia de contexto' },
    { titulo: 'Mediateca INAH', url: inah(q), nota: 'Fotografías y fichas de acervo' },
    { titulo: 'Mexicana · Cultura', url: mexicana(q), nota: 'Repositorio de la Secretaría de Cultura' },
    { titulo: 'Museo Nacional de Antropología', url: 'https://www.mna.inah.gob.mx/', nota: 'Museo de referencia del catálogo' },
  ]
}

function defaultSimbolos(card: PieceDraft): PieceCard['simbolos'] {
  if (card.simbolos.length) return card.simbolos
  return [
    {
      id: 'cultura',
      titulo: card.cultura,
      texto: `Tradición ${card.cultura}, periodo ${card.periodo}. Los rasgos visibles se leen con fichas de esa escuela, no con nombres inventados.`,
    },
    {
      id: 'tipo',
      titulo: card.tipo_objeto.replace('_', ' '),
      texto: `Se trata de un(a) ${card.tipo_objeto.replace('_', ' ')} del acervo cultural de México. La identidad concreta exige coincidir con una ficha.`,
    },
  ]
}

export function enrichPiece(card: PieceDraft): PieceCard {
  const extra = EXTRA[card.id]
  const resguardo = {
    ...card.lugares.resguardo,
    coordinates: card.lugares.resguardo.coordinates ?? MNA,
    nota:
      card.lugares.resguardo.nota ??
      `Hoy se resguarda o se toma como referencia de exhibición en ${card.lugares.resguardo.etiqueta}. Confirma sala y cédula en el recinto.`,
  }
  const hallazgoBase = card.lugares.hallazgo
  const hallazgo = {
    ...hallazgoBase,
    coordinates:
      hallazgoBase.coordinates ??
      (hallazgoBase.certeza === 'desconocida' ? undefined : coordsForCulture(card.cultura)),
    nota:
      hallazgoBase.nota ??
      (hallazgoBase.certeza === 'desconocida'
        ? 'El lugar de hallazgo no está documentado con certeza. No se inventa un punto exacto en el mapa.'
        : hallazgoBase.certeza === 'exacta'
          ? `Se documenta el hallazgo en ${hallazgoBase.etiqueta}.`
          : `El hallazgo se sitúa de forma aproximada en ${hallazgoBase.etiqueta}. El mapa muestra una región, no un clavo topográfico.`),
  }

  const historia =
    extra?.historia ??
    `${card.nombre} pertenece a la tradición ${card.cultura} (${card.periodo}). ${card.resumen} ` +
      `Se resguarda en ${resguardo.etiqueta}. ` +
      (hallazgo.certeza === 'desconocida'
        ? 'El sitio de hallazgo no está fijado con certeza en las fuentes usadas aquí.'
        : `El hallazgo se asocia a ${hallazgo.etiqueta}.`)

  const curiosidades = extra?.curiosidades?.length
    ? extra.curiosidades
    : TIPO_CURIOS[card.tipo_objeto]

  const enlaces = extra?.enlaces?.length ? extra.enlaces : defaultLinks(card.nombre)
  const fuentes =
    card.fuentes.length && !card.fuentes[0].titulo.includes('paquete cultural')
      ? card.fuentes
      : [
          { titulo: 'Museo Nacional de Antropología', procedencia: 'INAH', url: 'https://www.mna.inah.gob.mx/' },
          { titulo: 'Mediateca INAH', procedencia: 'Instituto Nacional de Antropología e Historia', url: inah(card.nombre) },
          { titulo: extra?.enlaces?.[0]?.titulo ?? `Wikipedia: ${card.nombre}`, procedencia: 'Enciclopedia de consulta', url: wiki(card.nombre) },
          { titulo: 'Mexicana', procedencia: 'Secretaría de Cultura', url: mexicana(card.nombre) },
        ]

  const texto_narracion =
    extra?.texto_narracion ??
    (card.texto_narracion.length > card.resumen.length + 20
      ? card.texto_narracion
      : historia)

  return {
    ...card,
    texto_narracion,
    historia,
    curiosidades,
    enlaces: [
      ...enlaces,
      ...defaultLinks(card.nombre).filter((l) => !enlaces.some((e) => e.url === l.url)),
    ].slice(0, 6),
    simbolos: extra?.simbolos ?? defaultSimbolos(card),
    fuentes,
    lugares: {
      ...card.lugares,
      resguardo,
      hallazgo,
    },
  }
}
