// Rutinas recomendadas para gente MUY novata, por días/semana. Programación
// conservadora y estándar para principiantes: ejercicios compuestos, 3 series,
// rangos amables y progresión doble. Tono honesto: sin promesas mágicas.
// Todos los ejercicioId existen en EJERCICIOS_SEED (hay test que lo vigila).

export const GUIA_NOVATO = [
  'Técnica primero: las primeras semanas el peso da igual, aprender el gesto lo es todo (toca ⓘ en cualquier ejercicio).',
  'Cada músculo al menos DOS veces por semana: por eso estas rutinas reparten el trabajo como lo reparten.',
  'Progresión doble: cuando completes todas las series en lo alto del rango (p. ej. 3×12), sube el peso un poco (2-10%) y vuelve a 3×8.',
  'Máquinas y pesos libres construyen el mismo músculo: usa lo que te dé confianza.',
  'Descansa 2-3 min en los grandes (sentadilla, press, remo) y 1-2 min en el resto.',
  'Más días no es mejor: el músculo crece cuando descansas. La última palabra la tiene tu cuerpo: si algo duele (no agujetas), cámbialo.',
]

function pl(ejercicioId, seriesObjetivo, repsObjetivo) {
  return { ejercicioId, seriesObjetivo, repsObjetivo }
}

export const PLANTILLAS = [
  // ---------- 2 días ----------
  {
    id: 'fb-ab-clasico',
    nombre: 'Full body A/B',
    diasSemana: 2,
    resumen: 'Todo el cuerpo en cada sesión, dos versiones que se alternan.',
    porQue:
      'Con 2 días a la semana, tocar cada músculo dos veces es la mejor inversión: nada de dividir por grupos. Dos sesiones distintas para no aburrirse, con empuje, tirón y pierna repartidos en ambas.',
    consejo: 'Alterna A y B. Si una semana solo puedes ir un día, no pasa nada: haz la que toque.',
    dias: [
      {
        nombre: 'Full body A',
        ejercicios: [
          pl('sentadilla-goblet', 3, 10),
          pl('press-banca', 3, 8),
          pl('remo-polea-baja', 3, 10),
          pl('peso-muerto-rumano', 3, 10),
          pl('elevaciones-laterales', 3, 12),
          pl('plancha', 3, 1),
        ],
      },
      {
        nombre: 'Full body B',
        ejercicios: [
          pl('prensa', 3, 10),
          pl('press-pecho-maquina', 3, 10),
          pl('jalon-al-pecho', 3, 10),
          pl('press-hombro-mancuernas', 3, 10),
          pl('curl-femoral', 3, 10),
          pl('curl-barra', 3, 10),
        ],
      },
    ],
  },
  {
    id: 'fb-maquinas',
    nombre: 'Full body en máquinas',
    diasSemana: 2,
    resumen: 'Todo en máquinas, con la misma ciencia detrás.',
    porQue:
      'Los estudios que comparan máquinas y pesos libres encuentran el mismo crecimiento muscular: no es la opción "de mentira", es una opción. Las máquinas guían el recorrido, así que toda tu atención va a esforzarte. Ideal si el gimnasio te resulta nuevo o las barras aún imponen.',
    consejo: 'Ajusta SIEMPRE el asiento antes de cada máquina (hay una clave en cada ficha ⓘ). La prensa se repite en ambos días a propósito: así las piernas trabajan dos veces por semana.',
    dias: [
      {
        nombre: 'Máquinas A',
        ejercicios: [
          pl('prensa', 3, 12),
          pl('press-pecho-maquina', 3, 10),
          pl('remo-polea-baja', 3, 12),
          pl('curl-femoral', 3, 12),
          pl('crunch-en-polea', 3, 12),
        ],
      },
      {
        nombre: 'Máquinas B',
        ejercicios: [
          pl('prensa', 3, 12),
          pl('jalon-al-pecho', 3, 10),
          pl('press-hombro-maquina', 3, 10),
          pl('contractor', 3, 12),
          pl('gemelos', 3, 15),
        ],
      },
    ],
  },

  // ---------- 3 días ----------
  {
    id: 'fb-abc',
    nombre: 'Full body A/B/C',
    diasSemana: 3,
    resumen: 'La rutina de novato por excelencia. Si dudas, esta.',
    porQue:
      'Tres sesiones de cuerpo completo con un día de descanso entre medias: cada músculo se trabaja 3 veces por semana con volumen fácil de recuperar. Es la estructura con la que más rápido progresa un principiante.',
    consejo: 'Ideal L-X-V (o similar con un día libre entre sesiones). Rota A→B→C y vuelta a empezar.',
    dias: [
      {
        nombre: 'Full body A',
        ejercicios: [
          pl('sentadilla', 3, 8),
          pl('press-banca', 3, 8),
          pl('remo-polea-baja', 3, 10),
          pl('elevaciones-laterales', 3, 12),
          pl('plancha', 3, 1),
        ],
      },
      {
        nombre: 'Full body B',
        ejercicios: [
          pl('prensa', 3, 10),
          pl('press-hombro-mancuernas', 3, 10),
          pl('jalon-al-pecho', 3, 10),
          pl('curl-femoral', 3, 10),
          pl('curl-mancuernas', 3, 10),
        ],
      },
      {
        nombre: 'Full body C',
        ejercicios: [
          pl('sentadilla-goblet', 3, 10),
          pl('press-inclinado-mancuernas', 3, 10),
          pl('remo-con-mancuerna', 3, 10),
          pl('face-pull', 3, 12),
          pl('extension-triceps-polea', 3, 10),
          pl('hiperextensiones', 3, 12),
        ],
      },
    ],
  },
  {
    id: 'tpf-3',
    nombre: 'Torso / Pierna / Full body',
    diasSemana: 3,
    resumen: 'Un día de torso, uno de pierna y uno de repaso completo.',
    porQue:
      'Alternativa a la A/B/C con sesiones más enfocadas, manteniendo lo importante: cada músculo se trabaja al menos dos veces por semana (con 3 días, dividir en empuje/tirón/pierna dejaría cada grupo en una sola vez, y la evidencia favorece la frecuencia doble).',
    consejo: 'Funciona en cualquier orden; deja el Full body para el día que llegues con menos energía.',
    dias: [
      {
        nombre: 'Torso',
        ejercicios: [
          pl('press-banca', 3, 8),
          pl('remo-polea-baja', 3, 10),
          pl('press-hombro-mancuernas', 3, 10),
          pl('jalon-al-pecho', 3, 10),
          pl('extension-triceps-polea', 2, 12),
        ],
      },
      {
        nombre: 'Pierna',
        ejercicios: [
          pl('sentadilla', 3, 8),
          pl('peso-muerto-rumano', 3, 10),
          pl('prensa', 3, 10),
          pl('gemelos', 3, 15),
          pl('plancha', 3, 1),
        ],
      },
      {
        nombre: 'Full body',
        ejercicios: [
          pl('sentadilla-goblet', 3, 12),
          pl('press-inclinado-mancuernas', 3, 10),
          pl('remo-con-mancuerna', 3, 10),
          pl('curl-femoral', 3, 12),
          pl('elevaciones-laterales', 3, 12),
          pl('curl-barra', 2, 12),
        ],
      },
    ],
  },

  // ---------- 4 días ----------
  {
    id: 'torso-pierna',
    nombre: 'Torso / Pierna ×2',
    diasSemana: 4,
    resumen: 'El estándar de oro de 4 días: dos de torso, dos de pierna.',
    porQue:
      'Cada mitad del cuerpo se entrena dos veces por semana con sesiones cortas y centradas. Es la división de 4 días más probada que existe, y crece contigo durante años.',
    consejo: 'Ideal en pares: L-M y J-V, con el miércoles y el finde libres.',
    dias: [
      {
        nombre: 'Torso A',
        ejercicios: [
          pl('press-banca', 3, 8),
          pl('remo-polea-baja', 3, 10),
          pl('press-hombro-mancuernas', 3, 10),
          pl('jalon-al-pecho', 3, 10),
          pl('curl-barra', 2, 12),
          pl('extension-triceps-polea', 2, 12),
        ],
      },
      {
        nombre: 'Pierna A',
        ejercicios: [
          pl('sentadilla', 3, 8),
          pl('curl-femoral', 3, 10),
          pl('prensa', 3, 10),
          pl('gemelos', 3, 15),
          pl('plancha', 3, 1),
        ],
      },
      {
        nombre: 'Torso B',
        ejercicios: [
          pl('press-inclinado-mancuernas', 3, 10),
          pl('remo-con-mancuerna', 3, 10),
          pl('elevaciones-laterales', 3, 12),
          pl('face-pull', 3, 12),
          pl('curl-martillo', 2, 12),
          pl('press-frances', 2, 12),
        ],
      },
      {
        nombre: 'Pierna B',
        ejercicios: [
          pl('peso-muerto-rumano', 3, 8),
          pl('zancadas', 3, 10),
          pl('extension-cuadriceps', 3, 12),
          pl('hip-thrust', 3, 10),
          pl('elevaciones-de-piernas', 3, 12),
        ],
      },
    ],
  },
  {
    id: 'etp-full',
    nombre: 'Empuje / Tirón / Pierna + Full body',
    diasSemana: 4,
    resumen: 'Los tres patrones y un cuarto día suave de repaso.',
    porQue:
      'Como el Empuje/Tirón/Pierna de 3 días, con un cuarto día de cuerpo completo más ligero que añade frecuencia sin machacar. Bien si te apetece pisar el gym un día más "fácil".',
    consejo: 'El día Full body es el flexible: si la semana se complica, es el que se cae primero sin drama.',
    dias: [
      {
        nombre: 'Empuje',
        ejercicios: [
          pl('press-banca', 3, 8),
          pl('press-hombro-mancuernas', 3, 10),
          pl('aperturas-polea', 3, 12),
          pl('extension-triceps-polea', 3, 10),
        ],
      },
      {
        nombre: 'Tirón',
        ejercicios: [
          pl('jalon-al-pecho', 3, 10),
          pl('remo-polea-baja', 3, 10),
          pl('face-pull', 3, 12),
          pl('curl-barra', 3, 10),
        ],
      },
      {
        nombre: 'Pierna',
        ejercicios: [
          pl('sentadilla', 3, 8),
          pl('prensa', 3, 10),
          pl('curl-femoral', 3, 10),
          pl('gemelos', 3, 15),
        ],
      },
      {
        nombre: 'Full body suave',
        ejercicios: [
          pl('sentadilla-goblet', 3, 12),
          pl('press-pecho-maquina', 3, 12),
          pl('remo-con-mancuerna', 3, 12),
          pl('plancha', 3, 1),
        ],
      },
    ],
  },

  // ---------- 5 días ----------
  {
    id: 'tp-full-5',
    nombre: 'Torso / Pierna ×2 + Full body',
    diasSemana: 5,
    resumen: 'El Torso/Pierna de siempre con un quinto día de repaso.',
    porQue:
      'Aviso honesto: para empezar, 5 días NO son mejores que 3-4 — el músculo crece al recuperarte. Pero si el gym te da vida y quieres ir, esta estructura reparte el trabajo sin freírte: cuatro días serios y uno suave.',
    consejo: 'El quinto día es opcional de corazón: si llega el viernes y estás molido, descansa. La racha lo entiende si ajustas tus días planificados.',
    dias: [
      {
        nombre: 'Torso A',
        ejercicios: [
          pl('press-banca', 3, 8),
          pl('remo-polea-baja', 3, 10),
          pl('press-hombro-mancuernas', 3, 10),
          pl('jalon-al-pecho', 3, 10),
          pl('curl-barra', 2, 12),
        ],
      },
      {
        nombre: 'Pierna A',
        ejercicios: [
          pl('sentadilla', 3, 8),
          pl('curl-femoral', 3, 10),
          pl('prensa', 3, 10),
          pl('gemelos', 3, 15),
        ],
      },
      {
        nombre: 'Torso B',
        ejercicios: [
          pl('press-inclinado-mancuernas', 3, 10),
          pl('remo-con-mancuerna', 3, 10),
          pl('elevaciones-laterales', 3, 12),
          pl('face-pull', 3, 12),
          pl('press-frances', 2, 12),
        ],
      },
      {
        nombre: 'Pierna B',
        ejercicios: [
          pl('peso-muerto-rumano', 3, 8),
          pl('zancadas', 3, 10),
          pl('hip-thrust', 3, 10),
          pl('elevaciones-de-piernas', 3, 12),
        ],
      },
      {
        nombre: 'Full body suave',
        ejercicios: [
          pl('sentadilla-goblet', 3, 12),
          pl('press-pecho-maquina', 3, 12),
          pl('jalon-estrecho', 3, 12),
          pl('plancha', 3, 1),
        ],
      },
    ],
  },
  {
    id: 'etp-tp-5',
    nombre: 'Empuje / Tirón / Pierna + Torso / Pierna',
    diasSemana: 5,
    resumen: 'Los tres patrones y un refuerzo de torso y pierna.',
    porQue:
      'Mezcla las dos divisiones clásicas: cada músculo se toca dos veces por semana con variedad de ejercicios. Para novatos con cinco días LIBRES de verdad y ganas de variedad.',
    consejo: 'Deja al menos un día de descanso real a la semana. Dormir es entrenar.',
    dias: [
      {
        nombre: 'Empuje',
        ejercicios: [
          pl('press-banca', 3, 8),
          pl('press-hombro-mancuernas', 3, 10),
          pl('aperturas-polea', 3, 12),
          pl('extension-triceps-polea', 3, 10),
        ],
      },
      {
        nombre: 'Tirón',
        ejercicios: [
          pl('jalon-al-pecho', 3, 10),
          pl('remo-con-barra', 3, 8),
          pl('face-pull', 3, 12),
          pl('curl-mancuernas', 3, 10),
        ],
      },
      {
        nombre: 'Pierna',
        ejercicios: [
          pl('sentadilla', 3, 8),
          pl('prensa', 3, 10),
          pl('curl-femoral', 3, 10),
          pl('gemelos', 3, 15),
        ],
      },
      {
        nombre: 'Torso',
        ejercicios: [
          pl('press-inclinado-mancuernas', 3, 10),
          pl('remo-polea-baja', 3, 10),
          pl('elevaciones-laterales', 3, 12),
          pl('curl-martillo', 2, 12),
          pl('press-frances', 2, 12),
        ],
      },
      {
        nombre: 'Pierna y core',
        ejercicios: [
          pl('peso-muerto-rumano', 3, 8),
          pl('zancadas-bulgaras', 3, 10),
          pl('hip-thrust', 3, 10),
          pl('plancha', 3, 1),
          pl('elevaciones-de-piernas', 3, 12),
        ],
      },
    ],
  },
]

export function plantillasPorDias(dias) {
  return PLANTILLAS.filter((p) => p.diasSemana === dias)
}
