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
      'Variantes: agarre supino (chin-up, más bíceps y algo más fácil) o neutro',
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
      'Variante Pendlay: la barra apoya en el suelo entre repeticiones, torso a 90°',
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
      'Con barra recta o Z: la Z alivia las muñecas',
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
      'Con barra, cuerda (abre abajo) o a un brazo: misma técnica',
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
      'Tumbado, sentado o de pie: la que tenga tu gym vale igual',
    ],
    error: 'Levantar la cadera para ayudarte con la lumbar.',
  },
  'peso-muerto-rumano': {
    musculos: 'Femoral y glúteo',
    claves: [
      'Piernas casi rectas; la cadera va HACIA ATRÁS',
      'Baja hasta sentir el estirón del femoral, espalda neutra',
      'La barra baja pegada a las piernas',
      'También con mancuernas: misma bisagra',
    ],
    error: 'Doblar mucho las rodillas y convertirlo en peso muerto normal.',
  },
  gemelos: {
    musculos: 'Gemelo y sóleo',
    claves: [
      'Sube a la punta del todo y aguanta 1-2 segundos',
      'Baja hasta estirar por debajo del escalón',
      'De pie en máquina, en multipower o en la prensa: mismo gesto',
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
  // --- Tanda 4 (2026-09): pecho/espalda/hombro con otro material ---
  'press-inclinado-barra': {
    musculos: 'Pecho superior, hombro anterior y tríceps',
    claves: [
      'Banco a 30-45°; la barra baja a la parte alta del pecho',
      'Escápulas juntas y pies firmes, como en el press plano',
    ],
    error: 'Bajar la barra al cuello: ahí no protege ni el pecho ni el hombro.',
  },
  'press-mancuernas': {
    musculos: 'Pecho, tríceps y hombro anterior',
    claves: [
      'Mancuernas a la altura del pecho, muñecas rectas',
      'Sube en arco hasta casi juntarlas arriba',
      'Recorrido algo más largo que con barra: baja con control',
    ],
    error: 'Chocar las mancuernas arriba con rebote: se pierde tensión y bailan los hombros.',
  },
  'press-declinado': {
    musculos: 'Pecho inferior y tríceps',
    claves: [
      'Piernas bien enganchadas al banco declinado',
      'La barra baja a la parte baja del pecho, recorrido corto y controlado',
    ],
    error: 'Soltar la barra hacia la cara al fatigarte: pide ayuda para sacarla del soporte.',
  },
  'aperturas-mancuernas': {
    musculos: 'Pecho (aislamiento)',
    claves: [
      'Codos ligeramente flexionados y FIJOS todo el recorrido',
      'Baja hasta sentir el estiramiento, sin hundir los codos de más',
      'Cierra como abrazando un árbol, sin chocar arriba',
    ],
    error: 'Bajar demasiado profundo con peso alto: el hombro paga el estirón.',
  },
  'remo-en-maquina': {
    musculos: 'Dorsal, romboides y bíceps',
    claves: [
      'Pecho apoyado en el soporte: quieto durante toda la serie',
      'Lleva los codos atrás y junta las escápulas al final',
    ],
    error: 'Despegar el pecho del soporte para mover más peso con impulso.',
  },
  'remo-t-bar': {
    musculos: 'Dorsal, romboides y lumbar (isométrico)',
    claves: [
      'Espalda plana e inclinada ~45°, rodillas semiflexionadas',
      'Tira de la barra al abdomen y junta las escápulas',
      'Variante: en máquina con pecho apoyado, misma idea con menos lumbar',
    ],
    error: 'Redondear la espalda y dar tirones con todo el cuerpo.',
  },
  'pullover-polea': {
    musculos: 'Dorsal (aislamiento) y tríceps (isométrico)',
    claves: [
      'Brazos casi rectos, codos fijos: baja la barra en arco hasta el muslo',
      'Inclínate un poco hacia delante y siente el dorsal estirar arriba',
    ],
    error: 'Doblar los codos y convertirlo en una extensión de tríceps.',
  },
  'press-arnold': {
    musculos: 'Hombro completo (anterior y lateral)',
    claves: [
      'Empieza con las palmas hacia ti y gira al subir hasta mirar al frente',
      'Gira suave y continuo: la rotación es el ejercicio, no un adorno',
    ],
    error: 'Meter tanto peso que el giro desaparece: entonces es un press normal a medias.',
  },
  'elevaciones-frontales': {
    musculos: 'Hombro anterior',
    claves: [
      'Sube hasta la altura del hombro, no más',
      'Codos ligeramente flexionados, torso quieto',
      'Suele bastar poco peso: el press ya trabaja mucho el deltoides anterior',
    ],
    error: 'Balancear el cuerpo para subir un peso que no toca.',
  },
  'remo-al-menton': {
    musculos: 'Hombro lateral y trapecio',
    claves: [
      'Agarre más ancho que los hombros y codos SIEMPRE por encima de la barra',
      'Sube solo hasta el pecho: más arriba no aporta',
    ],
    error: 'Agarre estrecho y barra hasta la barbilla: el hombro queda pinzado. Si molesta, elevaciones laterales.',
  },
  'cargada-press': {
    musculos: 'Cuerpo completo: pierna, cadera, hombro y core',
    claves: [
      'Dos tiempos: cargada limpia al pecho, pausa, y press estricto',
      'La barra sube pegada al cuerpo; la cadera hace el trabajo, no el brazo',
      'Técnica antes que peso: es de los que más castigan hacerlo mal',
    ],
    error: 'Empezar con peso sin dominar la cargada: la barra acaba lejos y la lumbar lo nota.',
  },
  // --- Tanda 4: brazo ---
  'curl-predicador': {
    musculos: 'Bíceps (aislamiento estricto)',
    claves: [
      'Axilas bien apoyadas en el banco Scott, sin despegar los codos',
      'Baja hasta casi estirar, sin bloquear de golpe',
      'Con barra recta o Z: la Z alivia las muñecas',
    ],
    error: 'Soltar la bajada a plomo: ahí es donde más se lesiona el bíceps.',
  },
  'curl-concentrado': {
    musculos: 'Bíceps (aislamiento)',
    claves: [
      'Sentado, codo apoyado contra la cara interna del muslo',
      'Sube lento, aprieta arriba un segundo, baja más lento',
    ],
    error: 'Ayudarse con el hombro: si el codo se despega del muslo, es trampa.',
  },
  'curl-polea': {
    musculos: 'Bíceps',
    claves: [
      'La polea mantiene tensión TODO el recorrido, aprovéchalo: baja lento',
      'Codos pegados al cuerpo, muñecas rectas',
    ],
    error: 'Alejarse de la polea y remar con el cuerpo.',
  },
  'curl-arana': {
    musculos: 'Bíceps (cabeza corta)',
    claves: [
      'Pecho apoyado en banco inclinado, brazos colgando verticales',
      'El brazo cuelga libre: imposible hacer trampa con el cuerpo',
    ],
    error: 'Acortar el recorrido abajo: estira del todo en cada repetición.',
  },
  'extension-sobre-cabeza': {
    musculos: 'Tríceps (cabeza larga)',
    claves: [
      'Mancuerna a dos manos por detrás de la cabeza, codos apuntando al techo',
      'Codos cerrados y quietos: solo se mueve el antebrazo',
      'También en polea baja de espaldas, misma idea',
    ],
    error: 'Abrir los codos como alas: pierde el tríceps y sufre el hombro.',
  },
  'patada-triceps': {
    musculos: 'Tríceps (aislamiento)',
    claves: [
      'Torso inclinado, brazo paralelo al suelo y codo FIJO',
      'Estira del todo atrás y aguanta un segundo',
      'Peso ligero: es de sentir, no de cargar',
    ],
    error: 'Dejar caer el codo y balancear la mancuerna con el hombro.',
  },
  // --- Tanda 4: antebrazo ---
  'curl-muneca': {
    musculos: 'Antebrazo (flexores o extensores)',
    claves: [
      'Antebrazos apoyados en el muslo o banco, solo se mueve la muñeca',
      'Palmas arriba = flexores; palmas abajo = extensores (menos peso)',
      'Recorrido corto y lento, muchas repeticiones',
    ],
    error: 'Mover el codo para ayudar: el antebrazo trabaja solo con la muñeca.',
  },
  'paseo-granjero': {
    musculos: 'Antebrazo (agarre), trapecio y core',
    claves: [
      'Peso serio a los costados, hombros atrás y torso erguido',
      'Pasos cortos y firmes; anota kg y pasos (reps = pasos)',
    ],
    error: 'Encorvarse con la carga: camina alto, como si no pesara.',
  },
  'dead-hang': {
    musculos: 'Antebrazo (agarre), hombro y espalda (descompresión)',
    claves: [
      'Cuélgate de la barra con agarre firme y hombros activos (no orejas)',
      'Empieza con 20-30 segundos; el agarre mejora rápido',
    ],
    error: 'Colgarse totalmente muerto con los hombros en las orejas: activa ligeramente el hombro.',
  },
  // --- Tanda 4: pierna y glúteo ---
  'sentadilla-frontal': {
    musculos: 'Cuádriceps, glúteo y core (torso más vertical)',
    claves: [
      'Barra apoyada en los hombros delanteros, codos ALTOS todo el rato',
      'El torso se mantiene mucho más vertical que en la trasera',
      'Agarre limpio o de brazos cruzados, el que permita codos altos',
    ],
    error: 'Dejar caer los codos: la barra rueda y la espalda redondea.',
  },
  'sentadilla-hack': {
    musculos: 'Cuádriceps (dominante) y glúteo',
    claves: [
      'Espalda y cadera pegadas al respaldo todo el recorrido',
      'Baja profundo con control; los pies algo adelantados en la plataforma',
    ],
    error: 'Despegar la cadera del respaldo al bajar profundo.',
  },
  'step-up': {
    musculos: 'Cuádriceps y glúteo (unilateral)',
    claves: [
      'Cajón a la altura de la rodilla o algo menos',
      'Sube empujando con la pierna del cajón, no con impulso de la de abajo',
      'Baja con control: la bajada también cuenta',
    ],
    error: 'Impulsarse con la pierna del suelo: la de arriba se queda sin trabajo.',
  },
  'sissy-squat': {
    musculos: 'Cuádriceps (aislamiento, mucho estiramiento)',
    claves: [
      'Talones elevados, rodillas van muy adelante A PROPÓSITO',
      'Cuerpo en línea recta de rodilla a cabeza, inclinado atrás',
      'Avanzado: empieza agarrado a un soporte y con poco recorrido',
    ],
    error: 'Hacerlo con rodillas molestas o sin progresión: es exigente para el tendón.',
  },
  'peso-muerto-sumo': {
    musculos: 'Glúteo, aductores, cuádriceps y espalda',
    claves: [
      'Postura MUY ancha, puntas de los pies hacia fuera',
      'Rodillas siguen la dirección de los pies; torso más vertical que el convencional',
      'La barra sube pegada, rozando las piernas',
    ],
    error: 'Dejar que las rodillas se metan hacia dentro al empujar.',
  },
  'buenos-dias': {
    musculos: 'Femoral, glúteo y lumbar',
    claves: [
      'Barra en la espalda como en sentadilla, rodillas semiflexionadas',
      'Cadera atrás y torso adelante con espalda PLANA, hasta notar el femoral',
      'Peso muy conservador: la palanca es larguísima',
    ],
    error: 'Redondear la espalda o cargar como si fuera una sentadilla.',
  },
  'nordic-curl': {
    musculos: 'Femoral (excéntrico, muy exigente)',
    claves: [
      'Tobillos bien anclados, cae hacia delante FRENANDO con el femoral',
      'Empuja con las manos para volver: la bajada es el ejercicio',
      'Pocas repeticiones bien hechas; agujetas serias garantizadas al empezar',
    ],
    error: 'Doblar la cadera para hacerlo más fácil: cuerpo recto de rodilla a cabeza.',
  },
  'gemelos-sentado': {
    musculos: 'Sóleo (el gemelo profundo)',
    claves: [
      'Rodilla a 90°: sentado trabaja el sóleo, de pie el gemelo grande',
      'Pausa abajo con el talón profundo, sube hasta la punta',
    ],
    error: 'Rebotar rápido sin recorrido: el sóleo pide series lentas y completas.',
  },
  'saltos-cajon': {
    musculos: 'Pierna completa (potencia)',
    claves: [
      'Cajón moderado: aterriza suave con todo el pie y rodillas alineadas',
      'BAJA del cajón andando, no de un salto',
      'Calidad sobre cantidad: pocas repeticiones explosivas',
    ],
    error: 'Cajón demasiado alto: los shins pagan el fallo. Sube de altura poco a poco.',
  },
  'empuje-trineo': {
    musculos: 'Pierna completa, glúteo y core (sin fase excéntrica)',
    claves: [
      'Brazos firmes en el trineo, torso inclinado en línea con la pierna de empuje',
      'Pasos potentes y completos; apunta kg y metros (reps = metros)',
      'Casi sin agujetas: no hay fase de frenado',
    ],
    error: 'Pasos cortitos y rápidos sin extender la cadera: empuja, no trotes.',
  },
  thrusters: {
    musculos: 'Cuerpo completo: sentadilla frontal + press en un gesto',
    claves: [
      'Sentadilla frontal completa y, al subir, el impulso remata el press',
      'Un solo movimiento fluido, no dos ejercicios pegados',
      'Con barra o mancuernas; la técnica de la frontal manda',
    ],
    error: 'Cortar la sentadilla a media bajada cuando llega el cansancio.',
  },
  'kettlebell-swing': {
    musculos: 'Glúteo, femoral y core (potencia de cadera)',
    claves: [
      'Es una BISAGRA de cadera, no una sentadilla: cadera atrás y latigazo adelante',
      'Los brazos no levantan: la cadera lanza la pesa hasta el pecho',
      'Espalda plana siempre; glúteo apretado arriba',
    ],
    error: 'Levantar la pesa con los hombros haciendo una elevación frontal cansada.',
  },
  // --- Tanda 4: core ---
  'plancha-lateral': {
    musculos: 'Oblicuos y hombro',
    claves: [
      'Apoyo bajo el hombro: sobre el antebrazo, o sobre la mano (variante alta)',
      'Cuerpo en línea recta de pies a cabeza; cadera ALTA: es lo primero que cae',
      'Mismo tiempo por lado',
    ],
    error: 'Dejar caer la cadera y aguantar por aguantar: cuando cae, se acabó la serie.',
  },
  'giro-ruso': {
    musculos: 'Oblicuos',
    claves: [
      'Torso atrás ~45°, espalda recta (no redondeada)',
      'Gira el TORSO, no solo los brazos: las manos solo acompañan',
      'Con un disco o mancuerna en las manos es más difícil',
      'Pies apoyados lo hace más fácil; elevados, más difícil',
    ],
    error: 'Girar rapidísimo solo con los brazos con la espalda hecha una C.',
  },
  'press-pallof': {
    musculos: 'Core completo (anti-rotación)',
    claves: [
      'De lado a la polea: empuja el agarre al frente y AGUANTA recto',
      'El ejercicio es resistir el giro, no moverse',
      'Aguanta 2-3 segundos con brazos estirados, vuelve y repite',
    ],
    error: 'Dejar que el torso rote hacia la polea: si giras, baja el peso.',
  },
  'dead-bug': {
    musculos: 'Core profundo (control lumbar)',
    claves: [
      'Tumbado, lumbar PEGADA al suelo todo el rato',
      'Extiende brazo y pierna contrarios lento, sin que la lumbar se arquee',
      'Si la lumbar se despega, acorta el recorrido',
    ],
    error: 'Hacerlo rápido arqueando la espalda: es un ejercicio de control, no de reps.',
  },
  'hollow-hold': {
    musculos: 'Core completo (isométrico)',
    claves: [
      'Lumbar pegada al suelo, piernas y hombros en el aire',
      'Cuanto más lejos brazos y piernas, más difícil: regula la palanca',
      'Acumula tiempo en tandas cortas y limpias',
    ],
    error: 'Arquear la lumbar por estirar demasiado antes de tiempo.',
  },
  'elevaciones-colgado': {
    musculos: 'Core inferior y agarre',
    claves: [
      'Colgado de la barra sin balanceo: sube las rodillas al pecho',
      'Versión avanzada: piernas rectas hasta la horizontal',
      'Baja con control, sin péndulo',
    ],
    error: 'Balancearse y subir las piernas con la inercia del columpio.',
  },
  // --- Tanda 4: cardio de máquinas y sogas ---
  'ski-erg': {
    musculos: 'Cardio de tirón: dorsal, tríceps y core',
    claves: [
      'Tirón de brazos Y bisagra de cadera a la vez, como esquiar',
      'Ritmo sostenido; el core conecta brazos y piernas',
    ],
    error: 'Tirar solo con los brazos con las piernas rígidas: la cadera también rema.',
  },
  'assault-bike': {
    musculos: 'Cardio de cuerpo completo (brazos y piernas)',
    claves: [
      'Empuja y tira también con los brazos: la mitad del trabajo es suya',
      'Brutal para intervalos cortos; regula, sube de ritmo muy rápido',
    ],
    error: 'Salir a tope el primer minuto: esta máquina pasa factura como ninguna.',
  },
  'cuerda-batalla': {
    musculos: 'Hombro, brazo, core y cardio',
    claves: [
      'Rodillas semiflexionadas y core firme: el latigazo sale del cuerpo, no solo del brazo',
      'Olas continuas y amplias; intervalos cortos (20-40 s)',
    ],
    error: 'Ponerse rígido de pie y agitar solo las muñecas.',
  },
}

export function fichaDeEjercicio(id) {
  return FICHAS_EJERCICIOS[id] || null
}
