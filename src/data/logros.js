// Catálogo de logros (CONTRACT.md §14, tabla cerrada). La evaluación de
// condiciones vive en src/engine/logros.js.

export const LOGROS = [
  {
    id: 'primer_paso',
    nombre: 'El primer paso',
    descripcion: 'Has forjado tu personaje. Todo viaje empieza con un paso.',
    icono: '👣',
    xp: 25,
  },
  {
    id: 'cruzar_umbral',
    nombre: 'Cruzar el umbral',
    descripcion: 'Tu primera sesión completada. La puerta ya queda atrás.',
    icono: '🚪',
    xp: 30,
  },
  {
    id: 'diez_pruebas',
    nombre: 'Diez pruebas',
    descripcion: '10 sesiones completadas. El camino empieza a reconocerte.',
    icono: '🛡️',
    xp: 50,
  },
  {
    id: 'veinticinco_batallas',
    nombre: 'Veinticinco batallas',
    descripcion: '25 sesiones completadas. Esto ya es costumbre de héroe.',
    icono: '⚔️',
    xp: 75,
  },
  {
    id: 'cincuenta_gestas',
    nombre: 'Cincuenta gestas',
    descripcion: '50 sesiones completadas. Que lo canten los bardos.',
    icono: '🏆',
    xp: 150,
  },
  {
    id: 'primera_semana',
    nombre: 'La primera semana',
    descripcion: 'Una semana perfecta: cada día planificado, cumplido.',
    icono: '📅',
    xp: 30,
  },
  {
    id: 'mes_camino',
    nombre: 'Un mes en el camino',
    descripcion: '4 semanas perfectas seguidas. Un mes entero de palabra cumplida.',
    icono: '🌙',
    xp: 100,
  },
  {
    id: 'mas_fuerte',
    nombre: 'Más fuerte que ayer',
    descripcion: 'Tu primer PR. Más fuerte que ayer, literalmente.',
    icono: '💪',
    xp: 40,
  },
  {
    id: 'rompe_limites',
    nombre: 'Rompelímites',
    descripcion: '10 PRs. Los límites eran solo sugerencias.',
    icono: '💥',
    xp: 80,
  },
  {
    id: 'el_retorno',
    nombre: 'El retorno',
    descripcion: 'Todos los héroes tropiezan. Volver es lo que te hace uno de ellos.',
    icono: '🌅',
    xp: 60,
  },
  {
    id: 'imparable',
    nombre: 'Imparable',
    descripcion: 'Racha de 10 días planificados. Nada te frena.',
    icono: '🔥',
    xp: 60,
  },
  {
    id: 'camino_diario',
    nombre: 'El camino se hace andando',
    descripcion: '7 días seguidos moviéndote por encima de tu base.',
    icono: '🥾',
    xp: 50,
  },
  {
    id: 'el_espejo',
    nombre: 'El espejo',
    descripcion: 'Tu primera foto de progreso. Las historias se cuentan por capítulos.',
    icono: '🪞',
    xp: 25,
  },
  {
    id: 'cronista',
    nombre: 'El cronista',
    descripcion: '30 días con algún registro. Tu leyenda se escribe a diario.',
    icono: '📜',
    xp: 50,
  },
  {
    id: 'hero',
    nombre: 'Hero',
    descripcion: 'Nivel 25. Has vuelto con el elixir: tú eres la leyenda.',
    icono: '👑',
    xp: 200,
  },
]

export function logroPorId(id) {
  return LOGROS.find((l) => l.id === id) || null
}
