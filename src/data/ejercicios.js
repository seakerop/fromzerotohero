// Biblioteca seed de ejercicios (CONTRACT.md §15). Ids en kebab-case estables.
// Medidas: 'peso_reps' (kg × reps), 'reps' (solo repeticiones),
// 'tiempo' (minutos, guardados en el campo reps de la serie).
// `equipo` = material principal, para filtrar por lo que tienes disponible.

export const GRUPOS = [
  { id: 'pecho', nombre: 'Pecho' },
  { id: 'espalda', nombre: 'Espalda' },
  { id: 'hombro', nombre: 'Hombro' },
  { id: 'biceps', nombre: 'Bíceps' },
  { id: 'triceps', nombre: 'Tríceps' },
  { id: 'antebrazo', nombre: 'Antebrazo' },
  { id: 'pierna', nombre: 'Pierna' },
  { id: 'gluteo', nombre: 'Glúteo' },
  { id: 'core', nombre: 'Core' },
  { id: 'cardio', nombre: 'Cardio' },
]

export const EQUIPAMIENTO = [
  { id: 'barra', nombre: 'Barra' },
  { id: 'mancuerna', nombre: 'Mancuerna' },
  { id: 'polea', nombre: 'Polea' },
  { id: 'maquina', nombre: 'Máquina' },
  { id: 'corporal', nombre: 'Peso corporal' },
]

function ej(id, nombre, grupo, medida, equipo) {
  return { id, nombre, grupo, medida, equipo, personalizado: false }
}

export const EJERCICIOS_SEED = [
  // Pecho
  ej('press-banca', 'Press banca', 'pecho', 'peso_reps', 'barra'),
  ej('press-inclinado-mancuernas', 'Press inclinado mancuernas', 'pecho', 'peso_reps', 'mancuerna'),
  ej('aperturas-polea', 'Aperturas en polea', 'pecho', 'peso_reps', 'polea'),
  ej('fondos', 'Fondos', 'pecho', 'peso_reps', 'corporal'),
  ej('flexiones', 'Flexiones', 'pecho', 'reps', 'corporal'),
  // Espalda
  ej('dominadas', 'Dominadas', 'espalda', 'reps', 'corporal'),
  ej('jalon-al-pecho', 'Jalón al pecho', 'espalda', 'peso_reps', 'maquina'),
  ej('remo-con-barra', 'Remo con barra', 'espalda', 'peso_reps', 'barra'),
  ej('remo-con-mancuerna', 'Remo con mancuerna', 'espalda', 'peso_reps', 'mancuerna'),
  ej('remo-polea-baja', 'Remo en polea baja', 'espalda', 'peso_reps', 'polea'),
  ej('peso-muerto', 'Peso muerto', 'espalda', 'peso_reps', 'barra'),
  // Hombro
  ej('press-militar', 'Press militar', 'hombro', 'peso_reps', 'barra'),
  ej('press-hombro-mancuernas', 'Press hombro mancuernas', 'hombro', 'peso_reps', 'mancuerna'),
  ej('elevaciones-laterales', 'Elevaciones laterales', 'hombro', 'peso_reps', 'mancuerna'),
  ej('pajaros', 'Pájaros', 'hombro', 'peso_reps', 'mancuerna'),
  ej('face-pull', 'Face pull', 'hombro', 'peso_reps', 'polea'),
  // Bíceps
  ej('curl-barra', 'Curl con barra', 'biceps', 'peso_reps', 'barra'),
  ej('curl-mancuernas', 'Curl con mancuernas', 'biceps', 'peso_reps', 'mancuerna'),
  ej('curl-martillo', 'Curl martillo', 'biceps', 'peso_reps', 'mancuerna'),
  // Tríceps
  ej('press-frances', 'Press francés', 'triceps', 'peso_reps', 'barra'),
  ej('extension-triceps-polea', 'Extensión de tríceps en polea', 'triceps', 'peso_reps', 'polea'),
  ej('press-cerrado', 'Press cerrado', 'triceps', 'peso_reps', 'barra'),
  // Pierna
  ej('sentadilla', 'Sentadilla', 'pierna', 'peso_reps', 'barra'),
  ej('prensa', 'Prensa', 'pierna', 'peso_reps', 'maquina'),
  ej('zancadas', 'Zancadas', 'pierna', 'peso_reps', 'mancuerna'),
  ej('extension-cuadriceps', 'Extensión de cuádriceps', 'pierna', 'peso_reps', 'maquina'),
  ej('curl-femoral', 'Curl femoral', 'pierna', 'peso_reps', 'maquina'),
  ej('peso-muerto-rumano', 'Peso muerto rumano', 'pierna', 'peso_reps', 'barra'),
  ej('gemelos', 'Gemelos', 'pierna', 'peso_reps', 'maquina'),
  // Glúteo
  ej('hip-thrust', 'Hip thrust', 'gluteo', 'peso_reps', 'barra'),
  ej('patada-de-gluteo', 'Patada de glúteo', 'gluteo', 'peso_reps', 'polea'),
  // Core
  ej('plancha', 'Plancha', 'core', 'tiempo', 'corporal'),
  ej('crunch-en-polea', 'Crunch en polea', 'core', 'peso_reps', 'polea'),
  ej('elevaciones-de-piernas', 'Elevaciones de piernas', 'core', 'reps', 'corporal'),
  ej('rueda-abdominal', 'Rueda abdominal', 'core', 'reps', 'corporal'),
  // Cardio
  ej('cinta', 'Cinta', 'cardio', 'tiempo', 'maquina'),
  ej('eliptica', 'Elíptica', 'cardio', 'tiempo', 'maquina'),
  ej('bici-estatica', 'Bici estática', 'cardio', 'tiempo', 'maquina'),
  ej('remo-maquina', 'Remo máquina', 'cardio', 'tiempo', 'maquina'),
  // Tanda 2 (2026-07): máquinas habituales y básicos que faltaban. Los
  // personajes existentes los reciben por merge al arrancar (App.jsx).
  ej('press-pecho-maquina', 'Press de pecho en máquina', 'pecho', 'peso_reps', 'maquina'),
  ej('contractor', 'Contractor (peck deck)', 'pecho', 'peso_reps', 'maquina'),
  ej('jalon-estrecho', 'Jalón agarre estrecho', 'espalda', 'peso_reps', 'maquina'),
  ej('hiperextensiones', 'Hiperextensiones', 'espalda', 'reps', 'corporal'),
  ej('press-hombro-maquina', 'Press de hombro en máquina', 'hombro', 'peso_reps', 'maquina'),
  ej('encogimientos', 'Encogimientos de trapecio', 'hombro', 'peso_reps', 'mancuerna'),
  ej('zancadas-bulgaras', 'Zancadas búlgaras', 'pierna', 'peso_reps', 'mancuerna'),
  ej('sentadilla-goblet', 'Sentadilla goblet', 'pierna', 'peso_reps', 'mancuerna'),
  ej('zancada-inversa', 'Zancada inversa', 'pierna', 'peso_reps', 'mancuerna'),
  ej('aductores-maquina', 'Aductores en máquina', 'pierna', 'peso_reps', 'maquina'),
  ej('abductores-maquina', 'Abductores en máquina', 'gluteo', 'peso_reps', 'maquina'),
  ej('cuerda', 'Saltar a la cuerda', 'cardio', 'tiempo', 'corporal'),
  ej('escaleras', 'Escaleras (stairmaster)', 'cardio', 'tiempo', 'maquina'),
  // Tanda 3 (2026-08): entrenar EN CASA y calistenia, sin material o con
  // barra de dominadas. Llegan por merge a bibliotecas existentes.
  ej('sentadilla-aire', 'Sentadilla sin peso', 'pierna', 'reps', 'corporal'),
  ej('zancadas-sin-peso', 'Zancadas sin peso', 'pierna', 'reps', 'corporal'),
  ej('puente-gluteo', 'Puente de glúteo', 'gluteo', 'reps', 'corporal'),
  ej('flexiones-inclinadas', 'Flexiones inclinadas (apoyo alto)', 'pecho', 'reps', 'corporal'),
  ej('pike-flexiones', 'Flexiones pike (hombro)', 'hombro', 'reps', 'corporal'),
  ej('fondos-silla', 'Fondos en silla o banco', 'triceps', 'reps', 'corporal'),
  ej('remo-invertido', 'Remo invertido (mesa o barra baja)', 'espalda', 'reps', 'corporal'),
  ej('abdominales', 'Abdominales (crunch)', 'core', 'reps', 'corporal'),
  ej('superman', 'Superman (lumbar)', 'espalda', 'reps', 'corporal'),
  ej('burpees', 'Burpees', 'cardio', 'reps', 'corporal'),
  ej('escaladores', 'Escaladores (mountain climbers)', 'core', 'reps', 'corporal'),
  // Tanda 4 (2026-09): lo que usa el 95% de la gente en un gym — básicos con
  // otro material, accesorios habituales, antebrazo y core variado. Las
  // variantes menores (barra Z, agarres, sentado/de pie) viven en las fichas,
  // no como entradas aparte.
  ej('press-inclinado-barra', 'Press inclinado con barra', 'pecho', 'peso_reps', 'barra'),
  ej('press-mancuernas', 'Press plano con mancuernas', 'pecho', 'peso_reps', 'mancuerna'),
  ej('press-declinado', 'Press declinado', 'pecho', 'peso_reps', 'barra'),
  ej('aperturas-mancuernas', 'Aperturas con mancuernas', 'pecho', 'peso_reps', 'mancuerna'),
  ej('remo-en-maquina', 'Remo en máquina (palanca)', 'espalda', 'peso_reps', 'maquina'),
  ej('remo-t-bar', 'Remo T-bar', 'espalda', 'peso_reps', 'barra'),
  ej('pullover-polea', 'Pullover en polea', 'espalda', 'peso_reps', 'polea'),
  ej('press-arnold', 'Press Arnold', 'hombro', 'peso_reps', 'mancuerna'),
  ej('elevaciones-frontales', 'Elevaciones frontales', 'hombro', 'peso_reps', 'mancuerna'),
  ej('remo-al-menton', 'Remo al mentón', 'hombro', 'peso_reps', 'barra'),
  ej('cargada-press', 'Cargada y press', 'hombro', 'peso_reps', 'barra'),
  ej('curl-predicador', 'Curl predicador (Scott)', 'biceps', 'peso_reps', 'barra'),
  ej('curl-concentrado', 'Curl concentrado', 'biceps', 'peso_reps', 'mancuerna'),
  ej('curl-polea', 'Curl en polea baja', 'biceps', 'peso_reps', 'polea'),
  ej('curl-arana', 'Curl araña', 'biceps', 'peso_reps', 'mancuerna'),
  ej('extension-sobre-cabeza', 'Extensión sobre la cabeza', 'triceps', 'peso_reps', 'mancuerna'),
  ej('patada-triceps', 'Patada de tríceps', 'triceps', 'peso_reps', 'mancuerna'),
  ej('curl-muneca', 'Curl de muñeca', 'antebrazo', 'peso_reps', 'barra'),
  ej('paseo-granjero', 'Paseo del granjero (farmer walk)', 'antebrazo', 'peso_reps', 'mancuerna'),
  ej('dead-hang', 'Colgarse de la barra (dead hang)', 'antebrazo', 'tiempo', 'corporal'),
  ej('sentadilla-frontal', 'Sentadilla frontal', 'pierna', 'peso_reps', 'barra'),
  ej('sentadilla-hack', 'Sentadilla hack', 'pierna', 'peso_reps', 'maquina'),
  ej('step-up', 'Step-up al cajón', 'pierna', 'peso_reps', 'mancuerna'),
  ej('sissy-squat', 'Sissy squat', 'pierna', 'reps', 'corporal'),
  ej('peso-muerto-sumo', 'Peso muerto sumo', 'pierna', 'peso_reps', 'barra'),
  ej('buenos-dias', 'Buenos días', 'pierna', 'peso_reps', 'barra'),
  ej('nordic-curl', 'Nordic curl', 'pierna', 'reps', 'corporal'),
  ej('gemelos-sentado', 'Gemelos sentado', 'pierna', 'peso_reps', 'maquina'),
  ej('saltos-cajon', 'Saltos al cajón', 'pierna', 'reps', 'corporal'),
  ej('empuje-trineo', 'Empuje de trineo (sled)', 'pierna', 'peso_reps', 'maquina'),
  ej('thrusters', 'Thrusters', 'pierna', 'peso_reps', 'barra'),
  ej('kettlebell-swing', 'Kettlebell swing', 'gluteo', 'peso_reps', 'mancuerna'),
  ej('plancha-lateral', 'Plancha lateral', 'core', 'tiempo', 'corporal'),
  ej('giro-ruso', 'Giro ruso (russian twist)', 'core', 'reps', 'corporal'),
  ej('press-pallof', 'Press Pallof', 'core', 'peso_reps', 'polea'),
  ej('dead-bug', 'Dead bug', 'core', 'reps', 'corporal'),
  ej('hollow-hold', 'Hollow hold', 'core', 'tiempo', 'corporal'),
  ej('elevaciones-colgado', 'Elevaciones de piernas colgado', 'core', 'reps', 'corporal'),
  ej('ski-erg', 'Ski erg', 'cardio', 'tiempo', 'maquina'),
  ej('assault-bike', 'Assault bike', 'cardio', 'tiempo', 'maquina'),
  ej('cuerda-batalla', 'Cuerda de batalla', 'cardio', 'tiempo', 'maquina'),
]
