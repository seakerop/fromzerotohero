// Economía de XP (CONTRACT.md §8, tabla cerrada). El XP sale SIEMPRE de
// acciones; nada aquí mira el valor del peso corporal ni su variación.

import { claveSemana } from './fechas.js'

export const XP_TABLA = {
  sesionBase: 50,
  porSerie: 5,
  maxSeriesConXp: 20,
  maxSesionesConXpDia: 2,
  pr: 40,
  maxPrsConXpSesion: 3,
  // Pasos: escalonado por esfuerzo real (120 pasos no valen lo mismo que
  // 10.000). El acto de registrar sigue sumando algo, pero poco.
  pasosRegistro: 4,
  pasosPorTramo: 6, // cada cuarto de tu meta diaria (los 3 primeros)
  pasosMetaDiaria: 12, // completar la barra
  pasosMillaExtra: 8, // 1,5× tu meta
  peso: 10,
  medidas: 15,
  foto: 15,
  semanaPerfecta: 60,
}

// Meta de pasos por defecto cuando no hay baseline utilizable. 8.000 y no
// 10.000 a propósito: el beneficio en salud se aplana ahí y una meta
// inalcanzable desmotiva (los 10.000 vienen de un anuncio japonés de 1965).
export const META_PASOS_DEFECTO = 8000
export const TRAMOS_PASOS = 4

// Motivos canónicos del xpLog: texto corto de UI y a la vez clave de
// deduplicación (el motor mira xpLog para no cobrar dos veces).
export const MOTIVOS = {
  SESION: 'Sesión completada',
  PASOS: 'Pasos registrados',
  PASOS_BONUS: 'Pasos sobre tu base',
  PESO: 'Peso registrado',
  MEDIDAS: 'Medidas registradas',
  FOTO: 'Foto de progreso',
  SEMANA_PERFECTA: 'Semana perfecta',
}

export function xpSesion(numSeriesHechas) {
  const series = Math.min(numSeriesHechas, XP_TABLA.maxSeriesConXp)
  return XP_TABLA.sesionBase + XP_TABLA.porSerie * series
}

// Meta diaria de pasos: la que el usuario haya puesto en ajustes o, si no,
// una derivada de SU baseline (un 25 % más de lo que ya camina, redondeado a
// 500). Meta relativa a cada uno, como todo en esta app.
export function metaPasosDe(estado) {
  const puesta = estado && estado.ajustes ? estado.ajustes.metaPasos : null
  if (Number.isFinite(puesta) && puesta >= 1000) return puesta
  const base = estado && estado.baseline ? estado.baseline.pasosDia : 0
  if (!Number.isFinite(base) || base <= 0) return META_PASOS_DEFECTO
  const sugerida = Math.round((base * 1.25) / 500) * 500
  return Math.min(15000, Math.max(4000, sugerida))
}

// Cuartos de la meta alcanzados (0-4): lo que llena la barra.
export function tramosDePasos(pasos, meta) {
  const m = Number.isFinite(meta) && meta > 0 ? meta : META_PASOS_DEFECTO
  if (!Number.isFinite(pasos) || pasos <= 0) return 0
  return Math.min(TRAMOS_PASOS, Math.floor((pasos * TRAMOS_PASOS) / m))
}

// XP acumulable del día bajo MOTIVOS.PASOS: registrar + los tres primeros
// cuartos + la milla extra. El cuarto final lo paga la meta (PASOS_BONUS).
// Se cobra por DIFERENCIA con lo ya cobrado hoy, así corregir al alza suma
// lo que falte y corregir a la baja nunca quita XP ya ganado.
export function xpPasosParcial(pasos, meta) {
  if (!Number.isFinite(pasos) || pasos <= 0) return 0
  const m = Number.isFinite(meta) && meta > 0 ? meta : META_PASOS_DEFECTO
  let xp = XP_TABLA.pasosRegistro
  xp += Math.min(TRAMOS_PASOS - 1, tramosDePasos(pasos, m)) * XP_TABLA.pasosPorTramo
  if (pasos >= m * 1.5) xp += XP_TABLA.pasosMillaExtra
  return xp
}

export function yaCobradoDia(xpLog, fecha, motivo) {
  return xpLog.some((e) => e.fecha === fecha && e.motivo === motivo)
}

export function xpCobradoDia(xpLog, fecha, motivo) {
  return xpLog.reduce((s, e) => (e.fecha === fecha && e.motivo === motivo ? s + e.cantidad : s), 0)
}

export function yaCobradoSemana(xpLog, fecha, motivo) {
  const semana = claveSemana(fecha)
  return xpLog.some((e) => e.motivo === motivo && claveSemana(e.fecha) === semana)
}
