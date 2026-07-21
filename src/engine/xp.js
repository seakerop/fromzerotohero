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
  pasos: 10,
  pasosSobreBase: 15,
  pasosMuySobreBase: 25,
  peso: 10,
  medidas: 15,
  foto: 15,
  semanaPerfecta: 60,
}

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

// Bonus por pasos respecto al baseline: el mayor aplicable, no ambos.
export function xpBonusPasos(pasos, baselinePasos) {
  if (baselinePasos > 0 && pasos >= baselinePasos * 1.5) return XP_TABLA.pasosMuySobreBase
  if (pasos >= baselinePasos) return XP_TABLA.pasosSobreBase
  return 0
}

export function yaCobradoDia(xpLog, fecha, motivo) {
  return xpLog.some((e) => e.fecha === fecha && e.motivo === motivo)
}

export function yaCobradoSemana(xpLog, fecha, motivo) {
  const semana = claveSemana(fecha)
  return xpLog.some((e) => e.motivo === motivo && claveSemana(e.fecha) === semana)
}
