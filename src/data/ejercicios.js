// Biblioteca seed de ejercicios (CONTRACT.md §15). Ids en kebab-case estables.
// Medidas: 'peso_reps' (kg × reps), 'reps' (solo repeticiones),
// 'tiempo' (minutos, guardados en el campo reps de la serie).

export const GRUPOS = [
  { id: 'pecho', nombre: 'Pecho' },
  { id: 'espalda', nombre: 'Espalda' },
  { id: 'hombro', nombre: 'Hombro' },
  { id: 'biceps', nombre: 'Bíceps' },
  { id: 'triceps', nombre: 'Tríceps' },
  { id: 'pierna', nombre: 'Pierna' },
  { id: 'gluteo', nombre: 'Glúteo' },
  { id: 'core', nombre: 'Core' },
  { id: 'cardio', nombre: 'Cardio' },
]

function ej(id, nombre, grupo, medida) {
  return { id, nombre, grupo, medida, personalizado: false }
}

export const EJERCICIOS_SEED = [
  // Pecho
  ej('press-banca', 'Press banca', 'pecho', 'peso_reps'),
  ej('press-inclinado-mancuernas', 'Press inclinado mancuernas', 'pecho', 'peso_reps'),
  ej('aperturas-polea', 'Aperturas en polea', 'pecho', 'peso_reps'),
  ej('fondos', 'Fondos', 'pecho', 'peso_reps'),
  ej('flexiones', 'Flexiones', 'pecho', 'reps'),
  // Espalda
  ej('dominadas', 'Dominadas', 'espalda', 'reps'),
  ej('jalon-al-pecho', 'Jalón al pecho', 'espalda', 'peso_reps'),
  ej('remo-con-barra', 'Remo con barra', 'espalda', 'peso_reps'),
  ej('remo-con-mancuerna', 'Remo con mancuerna', 'espalda', 'peso_reps'),
  ej('remo-polea-baja', 'Remo en polea baja', 'espalda', 'peso_reps'),
  ej('peso-muerto', 'Peso muerto', 'espalda', 'peso_reps'),
  // Hombro
  ej('press-militar', 'Press militar', 'hombro', 'peso_reps'),
  ej('press-hombro-mancuernas', 'Press hombro mancuernas', 'hombro', 'peso_reps'),
  ej('elevaciones-laterales', 'Elevaciones laterales', 'hombro', 'peso_reps'),
  ej('pajaros', 'Pájaros', 'hombro', 'peso_reps'),
  ej('face-pull', 'Face pull', 'hombro', 'peso_reps'),
  // Bíceps
  ej('curl-barra', 'Curl con barra', 'biceps', 'peso_reps'),
  ej('curl-mancuernas', 'Curl con mancuernas', 'biceps', 'peso_reps'),
  ej('curl-martillo', 'Curl martillo', 'biceps', 'peso_reps'),
  // Tríceps
  ej('press-frances', 'Press francés', 'triceps', 'peso_reps'),
  ej('extension-triceps-polea', 'Extensión de tríceps en polea', 'triceps', 'peso_reps'),
  ej('press-cerrado', 'Press cerrado', 'triceps', 'peso_reps'),
  // Pierna
  ej('sentadilla', 'Sentadilla', 'pierna', 'peso_reps'),
  ej('prensa', 'Prensa', 'pierna', 'peso_reps'),
  ej('zancadas', 'Zancadas', 'pierna', 'peso_reps'),
  ej('extension-cuadriceps', 'Extensión de cuádriceps', 'pierna', 'peso_reps'),
  ej('curl-femoral', 'Curl femoral', 'pierna', 'peso_reps'),
  ej('peso-muerto-rumano', 'Peso muerto rumano', 'pierna', 'peso_reps'),
  ej('gemelos', 'Gemelos', 'pierna', 'peso_reps'),
  // Glúteo
  ej('hip-thrust', 'Hip thrust', 'gluteo', 'peso_reps'),
  ej('patada-de-gluteo', 'Patada de glúteo', 'gluteo', 'peso_reps'),
  // Core
  ej('plancha', 'Plancha', 'core', 'tiempo'),
  ej('crunch-en-polea', 'Crunch en polea', 'core', 'peso_reps'),
  ej('elevaciones-de-piernas', 'Elevaciones de piernas', 'core', 'reps'),
  ej('rueda-abdominal', 'Rueda abdominal', 'core', 'reps'),
  // Cardio
  ej('cinta', 'Cinta', 'cardio', 'tiempo'),
  ej('eliptica', 'Elíptica', 'cardio', 'tiempo'),
  ej('bici-estatica', 'Bici estática', 'cardio', 'tiempo'),
  ej('remo-maquina', 'Remo máquina', 'cardio', 'tiempo'),
]
