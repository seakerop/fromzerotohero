// Recalibración del baseline de pasos (CONTRACT.md §11). SOLO HACIA ARRIBA,
// suave (25% de la diferencia) y con tope del 15% por recalibración. Una mala
// semana no baja nada, no quita nada y no genera mensajes.

import { diasEntre, sumarDias } from './fechas.js'

const DIAS_ENTRE_EVALUACIONES = 7
const VENTANA_DIAS = 28
const MIN_REGISTROS = 7
const FACTOR_SUBIDA = 0.25
const TOPE_SUBIDA = 1.15

// Muta el estado de trabajo que le pasa el motor (ya clonado). Silencioso:
// no produce resultados ni XP.
export function recalibrarBaseline(estado, hoy) {
  const b = estado.baseline
  if (!b.ultimaRecalibracion) {
    // Estados migrados/importados sin fecha: se ancla hoy y se evalúa en 7 días.
    b.ultimaRecalibracion = hoy
    return estado
  }
  if (diasEntre(b.ultimaRecalibracion, hoy) < DIAS_ENTRE_EVALUACIONES) return estado

  b.ultimaRecalibracion = hoy // clave de día de la última evaluación

  const desde = sumarDias(hoy, -(VENTANA_DIAS - 1))
  const registros = estado.pasos.filter((p) => p.fecha >= desde && p.fecha <= hoy)
  if (registros.length < MIN_REGISTROS) return estado

  const media = registros.reduce((s, p) => s + p.pasos, 0) / registros.length
  if (media <= b.pasosDia) return estado

  const propuesto = b.pasosDia + Math.round(FACTOR_SUBIDA * (media - b.pasosDia))
  const nuevo = Math.min(propuesto, Math.round(b.pasosDia * TOPE_SUBIDA))
  if (nuevo <= b.pasosDia) return estado

  b.pasosDia = nuevo
  b.historial.push({ fecha: hoy, pasosDia: nuevo })
  return estado
}
