// Metas personales (CONTRACT.md §21 bis): objetivos que se miden SOLOS
// contra lo que ya registras — cero apuntes extra. Principios:
//  - Sin XP propio (economía cerrada; cumplirlas alimenta logros).
//  - Sin fechas límite ni cuentas atrás: el horizonte es etiqueta, no reloj.
//  - La meta de peso corporal es informativa como la báscula: se mide sobre
//    la media de 7 registros y JAMÁS genera mensajes de alejamiento.
// Forma: estado.metas = [{ id, tipo: 'marca'|'peso'|'sesiones', ejercicioId?,
//   objetivo, inicial, horizonte, creadaEl, cumplidaEl }]

import { historicoEjercicio } from './motor.js'

export const HORIZONTES = [
  ['corto', 'Corto plazo'],
  ['medio', 'Medio plazo'],
  ['largo', 'Largo plazo'],
]

// Peso de referencia: media de los últimos 7 registros (o los que haya).
export function pesoReferencia(estado) {
  const pesos = estado.cuerpo.pesos
  if (!pesos.length) return null
  const ultimos = pesos.slice(-7)
  return Math.round((ultimos.reduce((s, p) => s + p.kg, 0) / ultimos.length) * 10) / 10
}

export function medidaDeMeta(estado, meta) {
  if (meta.tipo === 'sesiones') return 'sesiones'
  if (meta.tipo === 'peso') return 'kg'
  const ej = estado.ejercicios.find((x) => x.id === meta.ejercicioId)
  const medida = ej ? ej.medida : 'peso_reps'
  return medida === 'reps' ? 'reps' : medida === 'tiempo' ? 'min' : 'kg'
}

export function valorActualDeMeta(estado, meta) {
  if (meta.tipo === 'sesiones') return estado.progreso.contadores.sesionesTotales
  if (meta.tipo === 'peso') return pesoReferencia(estado)
  const h = historicoEjercicio(estado, meta.ejercicioId)
  const ej = estado.ejercicios.find((x) => x.id === meta.ejercicioId)
  const medida = ej ? ej.medida : 'peso_reps'
  if (medida === 'reps') return h.mejorReps
  if (medida === 'tiempo') return h.mejorMinutos
  return h.mejorPesoKg
}

// { actual, pct 0-100, cumplida }. Sin datos aún: actual null y pct 0.
export function estadoDeMeta(estado, meta) {
  const actual = valorActualDeMeta(estado, meta)
  if (actual == null) return { actual: null, pct: 0, cumplida: false }
  const haciaAbajo = meta.objetivo < meta.inicial
  const cumplida = haciaAbajo ? actual <= meta.objetivo : actual >= meta.objetivo
  const rango = meta.objetivo - meta.inicial
  let pct = rango === 0 ? (cumplida ? 100 : 0) : Math.round(((actual - meta.inicial) / rango) * 100)
  pct = Math.max(0, Math.min(100, pct))
  if (cumplida) pct = 100
  return { actual, pct, cumplida }
}

export function nombreDeMeta(estado, meta) {
  const unidad = medidaDeMeta(estado, meta)
  const objetivo = String(meta.objetivo).replace('.', ',')
  if (meta.tipo === 'sesiones') return `${objetivo} sesiones totales`
  if (meta.tipo === 'peso') return `Peso corporal a ${objetivo} kg`
  const ej = estado.ejercicios.find((x) => x.id === meta.ejercicioId)
  return `${ej ? ej.nombre : meta.ejercicioId} a ${objetivo} ${unidad}`
}

// Ids de metas cuya condición ya se cumple y aún no están selladas.
export function metasRecienCumplidas(estado) {
  return (estado.metas || [])
    .filter((m) => !m.cumplidaEl && estadoDeMeta(estado, m).cumplida)
    .map((m) => m.id)
}

// La meta activa más cerca de cumplirse (para el susurro de Home).
export function metaMasCercana(estado) {
  const activas = (estado.metas || []).filter((m) => !m.cumplidaEl)
  if (!activas.length) return null
  let mejor = null
  for (const m of activas) {
    const st = estadoDeMeta(estado, m)
    if (!mejor || st.pct > mejor.st.pct) mejor = { meta: m, st }
  }
  return mejor
}
