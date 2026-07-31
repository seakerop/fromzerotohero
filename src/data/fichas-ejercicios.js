// Fichas de técnica de la biblioteca: músculos, 2-3 claves y el error típico.
// Guías GENERALES de técnica comúnmente aceptadas — no sustituyen a un
// entrenador; ante dolor (no agujetas), parar y consultar. Tono sobrio.

export const FICHAS_EJERCICIOS = {
  // --- Pecho ---
  'press-banca': {
    musculos: 'Pecho, tríceps y hombro anterior',
    claves: [
      'Escápulas juntas y pies firmes en el suelo',
      'Baja la barra con control hasta rozar el pecho',
      'Muñecas rectas sobre los codos',
    ],
    error: 'Rebotar la barra en el pecho o despegar el culo del banco.',
  },
  'press-inclinado-mancuernas': {
    musculos: 'Pecho superior, hombro anterior y tríceps',
    claves: [
      'Banco a 30-45°: más inclinación es ya hombro',
      'Baja hasta sentir estiramiento en el pecho, sin forzar',
      'Sube en arco cerrando ligeramente al final',
    ],
    error: 'Convertirlo en press de hombro por inclinar demasiado el banco.',
  },
  'aperturas-polea': {
    musculos: 'Pecho (aislamiento)',
    claves: [
      'Codos ligeramente flexionados y FIJOS todo el recorrido',
      'Abre hasta estirar el pecho, cierra como abrazando un árbol',
    ],
    error: 'Meter tanto peso que se convierte en un press con los codos.',
  },
  fondos: {
    musculos: 'Pecho inferior, tríceps y hombro',
    claves: [
      'Inclínate hacia delante para cargar el pecho',
      'Baja hasta que el hombro quede a la altura del codo, no más',
    ],
    error: 'Bajar demasiado profundo con los hombros enrollados: ahí sufre el hombro.',
  },
  flexiones: {
    musculos: 'Pecho, tríceps y core',
    claves: [
      'Cuerpo en tabla: glúteo apretado, sin arquear la lumbar',
      'Codos a ~45° del cuerpo, no pegados ni en cruz',
      'Pecho a un puño del suelo en cada repetición',
    ],
    error: 'Recortar el recorrido y dejar caer la cadera.',
  },
  'press-pecho-maquina': {
    musculos: 'Pecho, tríceps y hombro anterior',
    claves: [
      'Ajusta el asiento: los agarres a la altura del pecho',
      'Espalda apoyada; empuja sin bloquear los codos de golpe',
    ],
    error: 'Asiento mal ajustado: si empujas a la altura del cuello, trabaja mal y molesta el hombro.',
  },
  contractor: {
    musculos: 'Pecho (aislamiento)',
    claves: [
      'Codos ligeramente flexionados, cierra con el pecho, no con las manos',
      'Aguanta un segundo el cierre y abre con control',
    ],
    error: 'Abrir más de lo que el hombro permite cómodo buscando "estirar".',
  },

  // --- Espalda ---
  dominadas: {
    musculos: 'Dorsal, bíceps y trapecio',
    claves: [
      'Cuelga en activo: hombros lejos de las orejas',
      'Pecho hacia la barra, no barbilla estirada',
      'Baja completo y con control',
    ],
    error: 'Medias repeticiones balanceándose (kipping sin querer).',
  },
  'jalon-al-pecho': {
    musculos: 'Dorsal y bíceps',
    claves: [
      'Tira de los CODOS hacia el bolsillo trasero',
      'Torso casi vertical, pecho alto; la barra baja a la clavícula',
    ],
    error: 'Tumbarse hacia atrás y hacer remo con impulso.',
  },
  'remo-con-barra': {
    musculos: 'Dorsal, romboides, trapecio y lumbar (isométrico)',
    claves: [
      'Bisagra de cadera, espalda neutra y firme',
      'Lleva la barra al ombligo, codos pegados',
    ],
    error: 'Redondear la lumbar o dar tirones con todo el cuerpo.',
  },
  'remo-con-mancuerna': {
    musculos: 'Dorsal y romboides (unilateral)',
    claves: [
      'Apoya mano y rodilla en el banco, espalda como una mesa',
      'Tira del codo hacia la cadera, no hacia el hombro',
    ],
    error: 'Rotar el torso para subir más peso.',
  },
  'remo-polea-baja': {
    musculos: 'Espalda media, dorsal y bíceps',
    claves: [
      'Torso quieto a 90°: solo se mueven los brazos',
      'Junta las escápulas al final de cada repetición',
    ],
    error: 'Mecerse adelante y atrás usando la lumbar de motor.',
  },
  'peso-muerto': {
    musculos: 'Cadena posterior completa: glúteo, femoral, lumbar y agarre',
    claves: [
      'Barra pegada a las espinillas, espalda neutra SIEMPRE',
      'Empuja el suelo con las piernas, no tires con la espalda',
      'Bloquea arriba con glúteo, sin hiperextender la lumbar',
    ],
    error: 'Redondear la espalda baja al despegar. Con este, técnica antes que kilos, siempre.',
  },
  'jalon-estrecho': {
    musculos: 'Dorsal (fibras bajas) y bíceps',
    claves: [
      'Agarre estrecho neutro; codos por delante del cuerpo',
      'Lleva el agarre al pecho alto con el torso estable',
    ],
    error: 'Convertirlo en un balanceo lumbar cuando pesa mucho.',
  },
  hiperextensiones: {
    musculos: 'Lumbar, glúteo y femoral',
    claves: [
      'Sube hasta la línea del cuerpo, NO más arriba',
      'Movimiento lento; aprieta el glúteo arriba',
    ],
    error: 'Hiperextender arriba con impulso: la lumbar lo paga.',
  },

  // --- Hombro ---
  'press-militar': {
    musculos: 'Hombro, tríceps y core',
    claves: [
      'Glúteo y abdomen apretados: el cuerpo es una columna',
      'La barra sube pegada a la cara; la cabeza pasa "a través" al final',
    ],
    error: 'Arquear la lumbar para empujar con el pecho.',
  },
  'press-hombro-mancuernas': {
    musculos: 'Hombro y tríceps',
    claves: [
      'Codos ligeramente por delante del cuerpo, no en cruz total',
      'Sube sin chocar las mancuernas arriba',
    ],
    error: 'Bajar solo hasta las orejas: el recorrido útil llega a la barbilla.',
  },
  'elevaciones-laterales': {
    musculos: 'Hombro lateral',
    claves: [
      'Peso LIGERO y codos ligeramente flexionados',
      'Sube hasta la horizontal, como sirviendo dos jarras',
    ],
    error: 'Dar tirones con el trapecio y subir por encima del hombro.',
  },
  pajaros: {
    musculos: 'Hombro posterior y espalda alta',
    claves: [
      'Torso inclinado y quieto; abre con los codos, no con las manos',
      'Peso ligero: este músculo no mueve kilos, mueve salud de hombro',
    ],
    error: 'Levantarse con cada repetición usando la lumbar.',
  },
  'face-pull': {
    musculos: 'Hombro posterior, rotadores y trapecio medio',
    claves: [
      'Cuerda a la cara con los codos ALTOS',
      'Termina como sacando "doble bíceps": rotación externa',
    ],
    error: 'Tirar bajo y recto convirtiéndolo en un remo cualquiera.',
  },
  'press-hombro-maquina': {
    musculos: 'Hombro y tríceps',
    claves: [
      'Asiento ajustado: agarres a la altura de las orejas',
      'Empuja sin encoger los hombros hacia las orejas',
    ],
    error: 'Empezar con los agarres demasiado bajos y forzar el arranque.',
  },
  encogimientos: {
    musculos: 'Trapecio superior',
    claves: [
      'Hombros hacia las orejas, aguanta 1 segundo, baja lento',
      'Brazos como cuerdas: no doblan los codos',
    ],
    error: 'Rodar los hombros en círculo: sube y baja recto.',
  },

  // --- Bíceps ---
  'curl-barra': {
    musculos: 'Bíceps',
    claves: [
      'Codos pegados al cuerpo y QUIETOS',
      'Baja completo y controlado: la bajada es media ganancia',
    ],
    error: 'Balancear el cuerpo y subir los codos al final.',
  },
  'curl-mancuernas': {
    musculos: 'Bíceps',
    claves: [
      'Gira la muñeca al subir (supinación): meñique hacia arriba',
      'Alterna o simultáneo, pero sin columpio',
    ],
    error: 'Acortar el recorrido cuando llega el cansancio.',
  },
  'curl-martillo': {
    musculos: 'Bíceps, braquial y antebrazo',
    claves: [
      'Agarre neutro (martillo) todo el recorrido',
      'Codos fijos; sube hasta arriba sin girar',
    ],
    error: 'Convertirlo en impulso de hombro con pesos grandes.',
  },

  // --- Tríceps ---
  'press-frances': {
    musculos: 'Tríceps (cabeza larga)',
    claves: [
      'Codos apuntando al techo, quietos y cerrados',
      'Baja la barra/mancuerna hacia la frente o detrás, con control',
    ],
    error: 'Abrir los codos y convertirlo en un press raro.',
  },
  'extension-triceps-polea': {
    musculos: 'Tríceps',
    claves: [
      'Codos pegados al cuerpo como si llevaras un periódico bajo el brazo',
      'Extiende del todo y aguanta el bloqueo un instante',
    ],
    error: 'Ayudarse con el hombro dejando que los codos se adelanten.',
  },
  'press-cerrado': {
    musculos: 'Tríceps y pecho',
    claves: [
      'Agarre a la anchura de los hombros, no más estrecho',
      'Codos pegados al cuerpo al bajar',
    ],
    error: 'Agarrar demasiado cerrado: castiga las muñecas sin dar nada.',
  },

  // --- Pierna ---
  sentadilla: {
    musculos: 'Cuádriceps, glúteo y core',
    claves: [
      'Pies a la anchura de hombros, puntas algo abiertas',
      'Rodillas siguen la dirección de los pies',
      'Baja al menos hasta el paralelo con la espalda neutra',
    ],
    error: 'Que las rodillas se metan hacia dentro al subir.',
  },
  prensa: {
    musculos: 'Cuádriceps y glúteo',
    claves: [
      'Baja hasta donde la lumbar se mantenga PEGADA al respaldo',
      'Empuja con toda la planta, no con las puntas',
    ],
    error: 'Bajar tanto que el culo se despega y la lumbar se redondea.',
  },
  zancadas: {
    musculos: 'Cuádriceps, glúteo y estabilidad',
    claves: [
      'Paso largo; la rodilla trasera baja casi al suelo',
      'Torso erguido, mirada al frente',
    ],
    error: 'Pasos cortos que empujan la rodilla delantera muy adelante.',
  },
  'extension-cuadriceps': {
    musculos: 'Cuádriceps (aislamiento)',
    claves: [
      'Extiende del todo y aguanta arriba un segundo',
      'Baja lento: no dejes caer la placa',
    ],
    error: 'Dar patadas con impulso en vez de extender con control.',
  },
  'curl-femoral': {
    musculos: 'Femoral (isquiotibiales)',
    claves: [
      'Cadera pegada al banco/asiento todo el tiempo',
      'Sube con control y baja aún más lento',
    ],
    error: 'Levantar la cadera para ayudarte con la lumbar.',
  },
  'peso-muerto-rumano': {
    musculos: 'Femoral y glúteo',
    claves: [
      'Piernas casi rectas; la cadera va HACIA ATRÁS',
      'Baja hasta sentir el estirón del femoral, espalda neutra',
      'La barra baja pegada a las piernas',
    ],
    error: 'Doblar mucho las rodillas y convertirlo en peso muerto normal.',
  },
  gemelos: {
    musculos: 'Gemelo y sóleo',
    claves: [
      'Sube a la punta del todo y aguanta 1-2 segundos',
      'Baja hasta estirar por debajo del escalón',
    ],
    error: 'Rebotar rápido sin recorrido: los gemelos piden pausas.',
  },
  'zancadas-bulgaras': {
    musculos: 'Cuádriceps, glúteo y estabilidad (unilateral)',
    claves: [
      'Pie trasero apoyado en banco; el peso va en la pierna delantera',
      'Baja vertical, torso ligeramente inclinado adelante',
    ],
    error: 'Ponerse tan lejos o tan cerca del banco que todo tambalea: ajusta la distancia antes de cargar peso.',
  },
  'sentadilla-goblet': {
    musculos: 'Cuádriceps, glúteo y core',
    claves: [
      'Mancuerna/pesa pegada al pecho, codos dentro de las rodillas abajo',
      'Perfecta para aprender el patrón de sentadilla',
    ],
    error: 'Dejar que el peso te venza hacia delante.',
  },
  'zancada-inversa': {
    musculos: 'Glúteo y cuádriceps, con menos estrés de rodilla',
    claves: [
      'El paso va hacia ATRÁS; el peso se queda en la pierna delantera',
      'Empuja con el talón delantero para volver',
    ],
    error: 'Impulsarte con la pierna trasera en vez de trabajar la delantera.',
  },
  'aductores-maquina': {
    musculos: 'Aductores (cara interna del muslo)',
    claves: [
      'Ajusta la apertura a un estiramiento cómodo, no máximo',
      'Cierra con control y vuelve lento',
    ],
    error: 'Abrir de más el primer día: los aductores se resienten fácil.',
  },

  // --- Glúteo ---
  'hip-thrust': {
    musculos: 'Glúteo mayor y femoral',
    claves: [
      'Espalda alta apoyada en el banco, barbilla recogida',
      'Sube hasta la línea recta rodilla-cadera-hombro y APRIETA arriba',
    ],
    error: 'Hiperextender la lumbar arriba en vez de apretar el glúteo.',
  },
  'patada-de-gluteo': {
    musculos: 'Glúteo (aislamiento)',
    claves: [
      'Patada atrás y arriba con la rodilla algo flexionada',
      'Aprieta al final; el torso no se arquea',
    ],
    error: 'Convertirlo en un latigazo de lumbar.',
  },
  'abductores-maquina': {
    musculos: 'Glúteo medio (cara externa)',
    claves: [
      'Abre con control y aguanta un segundo abierto',
      'Torso ligeramente inclinado adelante lo enfoca mejor',
    ],
    error: 'Rebotar las placas con medias repeticiones rápidas.',
  },

  // --- Core ---
  plancha: {
    musculos: 'Core completo',
    claves: [
      'Glúteo y abdomen apretados: cuerpo en línea recta',
      'Mejor 3×30-45 s perfectos que 3 minutos temblando roto',
    ],
    error: 'Cadera caída o culo en pico: la línea es la técnica.',
  },
  'crunch-en-polea': {
    musculos: 'Recto abdominal',
    claves: [
      'De rodillas, enrolla la columna llevando codos a los muslos',
      'El movimiento sale del abdomen, no de la cadera',
    ],
    error: 'Tirar con los brazos manteniendo la espalda recta.',
  },
  'elevaciones-de-piernas': {
    musculos: 'Abdomen inferior y flexores de cadera',
    claves: [
      'Lumbar pegada al suelo (o colgado, sin balanceo)',
      'Baja las piernas solo hasta donde la lumbar no se despegue',
    ],
    error: 'Balancearse para subir las piernas con impulso.',
  },
  'rueda-abdominal': {
    musculos: 'Core completo (anti-extensión)',
    claves: [
      'Glúteo apretado y pelvis recogida ANTES de rodar',
      'Llega solo hasta donde controles la lumbar',
    ],
    error: 'Rodar de más y arquear la lumbar: gana recorrido con semanas.',
  },

  // --- Cardio ---
  cinta: {
    musculos: 'Cardio general',
    claves: ['Con inclinación del 1-2% imita mejor la calle', 'Camina rápido con cuesta: cardio amable con las rodillas'],
    error: 'Agarrarse a la máquina con la cuesta puesta: se pierde el trabajo.',
  },
  eliptica: {
    musculos: 'Cardio de bajo impacto, cuerpo completo',
    claves: ['Usa también los brazos, no solo las piernas', 'Resistencia suficiente para que no sea inercia'],
    error: 'Pedalear por inercia mirando el móvil a resistencia 1.',
  },
  'bici-estatica': {
    musculos: 'Cardio, cuádriceps',
    claves: ['Sillín a la altura de la cadera de pie', 'Con la pierna extendida abajo, rodilla LIGERAMENTE flexionada'],
    error: 'Sillín bajo: rodillas sufriendo en cada pedalada.',
  },
  'remo-maquina': {
    musculos: 'Cardio de cuerpo completo, espalda',
    claves: ['Orden: piernas → torso → brazos, y al revés al volver', 'La fuerza sale de las piernas (60%), no de los brazos'],
    error: 'Tirar solo con los brazos con la espalda redondeada.',
  },
  cuerda: {
    musculos: 'Cardio, gemelos y coordinación',
    claves: ['Saltos pequeños, muñecas girando, codos cerca del cuerpo', 'Empieza por intervalos: 30 s cuerda / 30 s descanso'],
    error: 'Saltar altísimo: gasta el doble y aguanta la mitad.',
  },
  escaleras: {
    musculos: 'Cardio, glúteo y cuádriceps',
    claves: ['Postura erguida, apoya la planta entera del pie', 'Las manos rozan la barandilla, no cargan tu peso'],
    error: 'Colgarse de la barandilla: el peso lo llevan las piernas.',
  },

  // --- En casa y calistenia ---
  'sentadilla-aire': {
    musculos: 'Cuádriceps, glúteo y movilidad',
    claves: [
      'Igual que con barra: pies a la anchura de hombros, rodillas siguiendo los pies',
      'Baja al menos al paralelo; brazos al frente de contrapeso',
      'Cuando 3×20 sea fácil, pasa a zancadas o búlgaras',
    ],
    error: 'Hacerlas rápido a medias: lento y profundo vale el doble.',
  },
  'zancadas-sin-peso': {
    musculos: 'Cuádriceps, glúteo y equilibrio',
    claves: [
      'Paso largo, rodilla trasera casi al suelo, torso erguido',
      'Alterna piernas; el número de la serie es por pierna',
    ],
    error: 'Pasos cortos con la rodilla delantera pasadísima de la punta del pie.',
  },
  'puente-gluteo': {
    musculos: 'Glúteo y femoral',
    claves: [
      'Tumbado, talones cerca del culo: sube la cadera apretando el glúteo',
      'Arriba, línea recta rodilla-cadera-hombro; aguanta 1-2 segundos',
      'Más difícil: a una pierna',
    ],
    error: 'Empujar con la lumbar arqueando en vez de apretar el glúteo.',
  },
  'flexiones-inclinadas': {
    musculos: 'Pecho, tríceps y core',
    claves: [
      'Manos en mesa, encimera o pared: cuanto más alto el apoyo, más fácil',
      'Cuerpo en tabla siempre, codos a ~45°',
      'Cuando 3×12 sea fácil, baja el apoyo (silla → suelo)',
    ],
    error: 'Doblar la cadera: es una flexión, no una reverencia.',
  },
  'pike-flexiones': {
    musculos: 'Hombro y tríceps',
    claves: [
      'En V invertida (culo arriba), la cabeza baja HACIA el suelo entre las manos',
      'Es el press de hombro de la calistenia: codos hacia atrás, no en cruz',
    ],
    error: 'Convertirla en flexión normal por miedo a cargar el hombro: mantén la V.',
  },
  'fondos-silla': {
    musculos: 'Tríceps y pecho inferior',
    claves: [
      'Manos al borde de una silla firme, piernas estiradas al frente',
      'Baja hasta codos a 90°, hombros LEJOS de las orejas',
      'Más fácil: rodillas dobladas; más difícil: pies en otra silla',
    ],
    error: 'Bajar de más con los hombros encogidos: ahí protesta el hombro.',
  },
  'remo-invertido': {
    musculos: 'Espalda, bíceps y agarre',
    claves: [
      'Bajo una mesa robusta o barra baja: cuerpo en tabla, tira del pecho hacia el borde',
      'Cuanto más horizontal tu cuerpo, más difícil',
      'Es EL tirón de casa: la espalda no se entrena sola con flexiones',
    ],
    error: 'Dar tirones con la cadera en vez de tirar con la espalda.',
  },
  abdominales: {
    musculos: 'Recto abdominal',
    claves: [
      'Enrolla la columna despacio: los hombros despegan, la lumbar se queda',
      'Manos en el pecho o sienes, nunca tirando del cuello',
    ],
    error: 'Tirarse del cuello y subir entero como una tabla.',
  },
  superman: {
    musculos: 'Lumbar, glúteo y espalda alta',
    claves: [
      'Boca abajo, despega brazos y piernas A LA VEZ, sin prisa',
      'Aguanta 1-2 segundos arriba mirando al suelo',
    ],
    error: 'Levantar la cabeza mirando al frente: cuello sufriendo gratis.',
  },
  burpees: {
    musculos: 'Cardio de cuerpo completo',
    claves: [
      'Ritmo constante vale más que velocidad: técnica limpia en cada bajada',
      'Versión suave: sin salto y sin flexión, solo bajar-apoyar-subir',
    ],
    error: 'Dejar caer la cadera en la parte de flexión cuando llega el cansancio.',
  },
  escaladores: {
    musculos: 'Core, hombro y cardio',
    claves: [
      'Posición de tabla firme: la cadera NO rebota',
      'Rodillas al pecho alternando; el número de la serie es por pierna',
    ],
    error: 'Hacerlos a toda velocidad con el culo en alto: tabla primero, ritmo después.',
  },
}

export function fichaDeEjercicio(id) {
  return FICHAS_EJERCICIOS[id] || null
}
