// Evaluación de logros (CONTRACT.md §14). El catálogo vive en data/logros.js;
// aquí solo las condiciones sobre el estado. Ninguna condición mira el valor
// del peso corporal ni su variación.

import { LOGROS } from '../data/logros.js'
import { NIVEL_MAX } from '../data/niveles.js'
import { diasDeAccion } from './arbol.js'
import { diasEntre, diaISO, sumarDias } from './fechas.js'
import { nivelDesdeXp } from './niveles.js'
import { MOTIVOS } from './xp.js'

// Lunes de una semana ISO 'YYYY-Www' (el 4 de enero siempre cae en la W01).
function lunesDeSemana(claveSem) {
  const [anio, semana] = claveSem.split('-W').map(Number)
  const cuatroEnero = `${anio}-01-04`
  const lunesW1 = sumarDias(cuatroEnero, -(diaISO(cuatroEnero) - 1))
  return sumarDias(lunesW1, (semana - 1) * 7)
}

function haySemanasConsecutivas(claves, cuantas) {
  if (claves.length < cuantas) return false
  const lunes = [...new Set(claves)].map(lunesDeSemana).sort()
  let seguidas = 1
  for (let i = 1; i < lunes.length; i++) {
    seguidas = diasEntre(lunes[i - 1], lunes[i]) === 7 ? seguidas + 1 : 1
    if (seguidas >= cuantas) return true
  }
  return false
}

// Días naturales consecutivos con pasos ≥ baseline del momento: exactamente
// los días con bonus de pasos en el xpLog (se apunta una vez por día).
function hayDiasSeguidosSobreBase(estado, cuantos) {
  const fechas = [
    ...new Set(
      estado.progreso.xpLog.filter((e) => e.motivo === MOTIVOS.PASOS_BONUS).map((e) => e.fecha)
    ),
  ].sort()
  if (fechas.length < cuantos) return false
  let seguidos = 1
  for (let i = 1; i < fechas.length; i++) {
    seguidos = diasEntre(fechas[i - 1], fechas[i]) === 1 ? seguidos + 1 : 1
    if (seguidos >= cuantos) return true
  }
  return false
}

// Sesión tras ≥7 días sin entrenar (con ≥1 sesión previa): entre dos sesiones
// en fechas A y B hay B−A−1 días sin entrenar, luego B−A ≥ 8.
function huboRetorno(estado) {
  const s = estado.sesiones
  return s.some((sesion, i) => i > 0 && diasEntre(s[i - 1].fecha, sesion.fecha) >= 8)
}

// Kilos totales movidos: suma peso × reps de las series HECHAS de todas las
// sesiones guardadas (las series a peso 0 no aportan).
export function volumenTotal(estado) {
  let kg = 0
  for (const s of estado.sesiones) {
    for (const ej of s.ejercicios) {
      for (const se of ej.series) {
        if (se.hecha && se.pesoKg > 0) kg += se.pesoKg * se.reps
      }
    }
  }
  return kg
}

// Ejercicios distintos con al menos una serie hecha en alguna sesión.
export function ejerciciosDistintos(estado) {
  const ids = new Set()
  for (const s of estado.sesiones) {
    for (const ej of s.ejercicios) {
      if (ej.series.some((se) => se.hecha)) ids.add(ej.ejercicioId)
    }
  }
  return ids.size
}

function metasCumplidas(estado) {
  return (estado.metas || []).filter((m) => m.cumplidaEl).length
}

const CONDICIONES = {
  primer_paso: (e) => Boolean(e.perfil),
  cruzar_umbral: (e) => e.progreso.contadores.sesionesTotales >= 1,
  diez_pruebas: (e) => e.progreso.contadores.sesionesTotales >= 10,
  veinticinco_batallas: (e) => e.progreso.contadores.sesionesTotales >= 25,
  cincuenta_gestas: (e) => e.progreso.contadores.sesionesTotales >= 50,
  primera_semana: (e) => e.progreso.contadores.semanasPerfectasClaves.length >= 1,
  mes_camino: (e) => haySemanasConsecutivas(e.progreso.contadores.semanasPerfectasClaves, 4),
  mas_fuerte: (e) => e.progreso.contadores.prsTotales >= 1,
  rompe_limites: (e) => e.progreso.contadores.prsTotales >= 10,
  el_retorno: (e) => huboRetorno(e),
  imparable: (e) => e.progreso.rachaMejor >= 10,
  camino_diario: (e) => hayDiasSeguidosSobreBase(e, 7),
  el_espejo: (e) => e.cuerpo.fotos.length >= 1,
  cronista: (e) => diasDeAccion(e) >= 30,
  hero: (e) => nivelDesdeXp(e.progreso.xp).nivel >= NIVEL_MAX,
  cien_gestas: (e) => e.progreso.contadores.sesionesTotales >= 100,
  racha_25: (e) => e.progreso.rachaMejor >= 25,
  racha_50: (e) => e.progreso.rachaMejor >= 50,
  pr_25: (e) => e.progreso.contadores.prsTotales >= 25,
  pr_50: (e) => e.progreso.contadores.prsTotales >= 50,
  estacion_entera: (e) => diasDeAccion(e) >= 90,
  vuelta_al_sol: (e) => diasDeAccion(e) >= 365,
  diez_toneladas: (e) => volumenTotal(e) >= 10000,
  cien_toneladas: (e) => volumenTotal(e) >= 100000,
  arsenal: (e) => ejerciciosDistintos(e) >= 15,
  maestro_armas: (e) => ejerciciosDistintos(e) >= 30,
  forjador: (e) => e.ejercicios.some((x) => x.personalizado),
  pacto_sellado: (e) => Boolean(e.pacto && e.pacto.nombre),
  primera_meta: (e) => metasCumplidas(e) >= 1,
  cinco_metas: (e) => metasCumplidas(e) >= 5,
}

// Ids de logros cuya condición se cumple y aún no están conseguidos,
// en el orden del catálogo.
export function evaluarLogros(estado) {
  return LOGROS.filter(
    (l) => !estado.progreso.logros[l.id] && CONDICIONES[l.id](estado)
  ).map((l) => l.id)
}
