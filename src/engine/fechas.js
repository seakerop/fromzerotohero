// Fechas con corte de día a las 04:00 (CONTRACT.md §5).
// Clave de día: 'YYYY-MM-DD'. Nadie fuera de aquí llama a toISOString().

const MS_DIA = 86400000
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function pad2(n) {
  return String(n).padStart(2, '0')
}

function partes(clave) {
  const [a, m, d] = clave.split('-').map(Number)
  return { a, m, d }
}

function aUTC(clave) {
  const { a, m, d } = partes(clave)
  return Date.UTC(a, m - 1, d)
}

function claveDesdeUTC(ms) {
  const f = new Date(ms)
  return `${f.getUTCFullYear()}-${pad2(f.getUTCMonth() + 1)}-${pad2(f.getUTCDate())}`
}

// Clave del día con corte a las 04:00: una sesión a la 01:30 del martes
// cuenta como lunes.
export function claveDia(d = new Date()) {
  const t = new Date(d.getTime() - 4 * 60 * 60 * 1000)
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}

// Semana ISO ('2026-W29'): lunes primer día; la semana 1 es la del primer jueves.
export function claveSemana(clave) {
  const { a, m, d } = partes(clave)
  const fecha = new Date(Date.UTC(a, m - 1, d))
  const dia = fecha.getUTCDay() || 7
  fecha.setUTCDate(fecha.getUTCDate() + 4 - dia) // jueves de esa semana
  const anio = fecha.getUTCFullYear()
  const inicio = Date.UTC(anio, 0, 1)
  const semana = Math.ceil(((fecha.getTime() - inicio) / MS_DIA + 1) / 7)
  return `${anio}-W${pad2(semana)}`
}

// Día ISO de la semana: 1=lunes … 7=domingo.
export function diaISO(clave) {
  const { a, m, d } = partes(clave)
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay() || 7
}

// Días de claveA a claveB (positivo si claveB es posterior).
export function diasEntre(claveA, claveB) {
  return Math.round((aUTC(claveB) - aUTC(claveA)) / MS_DIA)
}

export function sumarDias(clave, n) {
  return claveDesdeUTC(aUTC(clave) + n * MS_DIA)
}

// Para UI: '21 jul' (es-ES).
export function formatearFecha(clave) {
  const { m, d } = partes(clave)
  return `${d} ${MESES_CORTOS[m - 1]}`
}
