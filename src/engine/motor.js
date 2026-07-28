// Fachada del motor de juego (CONTRACT.md §7). PURO: sin efectos, sin
// Date.now() interno; aplicar() devuelve SIEMPRE un estado nuevo.

import { EJERCICIOS_SEED } from '../data/ejercicios.js'
import { logroPorId } from '../data/logros.js'
import { claveSemana, diaISO, sumarDias } from './fechas.js'
import { nivelDesdeXp } from './niveles.js'
import { diasDeAccion, etapaArbol } from './arbol.js'
import { e1rm, detectarPRs } from './prs.js'
import { calcularRacha } from './racha.js'
import { recalibrarBaseline } from './baseline.js'
import { evaluarLogros } from './logros.js'
import {
  MOTIVOS,
  XP_TABLA,
  xpSesion,
  xpBonusPasos,
  yaCobradoDia,
  yaCobradoSemana,
} from './xp.js'

export { nivelDesdeXp } from './niveles.js'
export { statsActuales } from './stats.js'
export { calcularRacha } from './racha.js'
export { diasDeAccion, etapaArbol, siguienteEtapaArbol } from './arbol.js'

// ---------------------------------------------------------------- estado

export function crearEstadoInicial(respuestas) {
  const {
    apodo,
    edad,
    alturaCm,
    pesoKg,
    objetivo,
    experiencia,
    pasosDia,
    diasEjercicioSemana,
    diasPlanificados,
    hoy,
  } = respuestas

  const plan = [...new Set(diasPlanificados || [])]
    .filter((d) => d >= 1 && d <= 7)
    .sort((a, b) => a - b)

  return {
    version: 1,
    perfil: { apodo, edad, alturaCm, objetivo, experiencia, creadoEl: hoy },
    baseline: {
      pasosDia,
      diasEjercicioSemana,
      pesoInicialKg: pesoKg,
      historial: [{ fecha: hoy, pasosDia }],
      ultimaRecalibracion: hoy,
    },
    ajustes: { diasPlanificados: plan, descansoSeg: 90 },
    progreso: {
      xp: 0,
      logros: {},
      contadores: {
        sesionesTotales: 0,
        prsTotales: 0,
        diasPasosSobreBaseline: 0,
        semanasPerfectasClaves: [],
      },
      rachaMejor: 0,
      xpLog: [],
    },
    ejercicios: EJERCICIOS_SEED.map((e) => ({ ...e })),
    rutinas: [],
    sesiones: [],
    sesionActiva: null,
    pasos: [],
    cuerpo: {
      pesos: [{ fecha: hoy, kg: pesoKg }], // punto de partida de la gráfica; sin XP
      medidas: [],
      fotos: [],
    },
  }
}

// ---------------------------------------------------------------- aplicar

export function aplicar(estado, evento) {
  const e = structuredClone(estado)

  if (evento.tipo === 'tick_diario') {
    recalibrarBaseline(e, evento.hoy)
    return { estado: e, resultados: [] }
  }

  const xpAntes = e.progreso.xp
  const etapaArbolAntes = etapaArbol(diasDeAccion(e))
  const acc = { xp: [], pr: [], racha: null, sinEfecto: false }

  switch (evento.tipo) {
    case 'perfil_creado':
      break // solo evalúa logros (primer_paso)
    case 'sesion_completada':
      aplicarSesion(e, evento, acc)
      break
    case 'pasos':
      aplicarPasos(e, evento, acc)
      break
    case 'peso':
      aplicarPeso(e, evento, acc)
      break
    case 'medidas':
      aplicarMedidas(e, evento, acc)
      break
    case 'foto':
      aplicarFoto(e, evento, acc)
      break
    default:
      return { estado: e, resultados: [] }
  }

  if (acc.sinEfecto) return { estado: e, resultados: [] }

  const fechaEvento = evento.hoy || evento.fecha
  const logros = cobrarLogros(e, fechaEvento)

  const resultados = [...acc.xp, ...acc.pr, ...logros]
  const nivelAntes = nivelDesdeXp(xpAntes).nivel
  const detalle = nivelDesdeXp(e.progreso.xp)
  if (detalle.nivel > nivelAntes) {
    resultados.push({ tipo: 'nivel', nivel: detalle.nivel, etapa: detalle.etapa })
  }
  if (acc.racha) resultados.push(acc.racha)

  const etapaArbolAhora = etapaArbol(diasDeAccion(e))
  if (etapaArbolAhora.id !== etapaArbolAntes.id) {
    resultados.push({ tipo: 'arbol', etapa: etapaArbolAhora })
  }

  return { estado: e, resultados }
}

function darXp(e, acc, fecha, cantidad, motivo) {
  e.progreso.xp += cantidad
  e.progreso.xpLog.push({ fecha, cantidad, motivo })
  acc.xp.push({ tipo: 'xp', cantidad, motivo })
}

// El XP de un logro va DENTRO del resultado 'logro' (no como 'xp' aparte),
// pero suma a progreso.xp y deja entrada en xpLog. Se itera hasta que no
// caigan más (un logro puede desbloquear otro, p. ej. 'hero' por su XP).
function cobrarLogros(e, fecha) {
  const resultados = []
  let nuevos = evaluarLogros(e)
  while (nuevos.length > 0) {
    for (const id of nuevos) {
      const logro = logroPorId(id)
      e.progreso.logros[id] = fecha
      e.progreso.xp += logro.xp
      e.progreso.xpLog.push({ fecha, cantidad: logro.xp, motivo: `Logro: ${logro.nombre}` })
      resultados.push({ tipo: 'logro', logro })
    }
    nuevos = evaluarLogros(e)
  }
  return resultados
}

// -------------------------------------------------------------- handlers

function aplicarSesion(e, evento, acc) {
  const hoy = evento.hoy
  const bruta = evento.sesion || {}

  // Filtra series no hechas y ejercicios sin series; guarda series limpias.
  const ejerciciosHechos = (bruta.ejercicios || [])
    .map((ej) => ({
      ejercicioId: ej.ejercicioId,
      series: (ej.series || [])
        .filter((s) => s.hecha !== false)
        .map((s) => ({ pesoKg: s.pesoKg, reps: s.reps })),
    }))
    .filter((ej) => ej.series.length > 0)

  const totalSeries = ejerciciosHechos.reduce((n, ej) => n + ej.series.length, 0)
  if (totalSeries === 0) {
    acc.sinEfecto = true // no se guarda nada y resultados = []
    return
  }

  const rachaAntes = calcularRacha(e, hoy)

  // PRs contra el histórico ANTERIOR a esta sesión.
  const prs = detectarPRs(e, ejerciciosHechos)
  const prsConXp = prs.slice(0, XP_TABLA.maxPrsConXpSesion)

  // Tope: máx 2 sesiones con XP al día.
  const sesionesHoy = e.sesiones.filter((s) => s.fecha === hoy).length
  const xpDeSesion = sesionesHoy < XP_TABLA.maxSesionesConXpDia ? xpSesion(totalSeries) : 0
  const xpDePrs = prsConXp.length * XP_TABLA.pr
  const xpGanado = xpDeSesion + xpDePrs

  const sesion = {
    // sesiones.length solo crece: el sufijo hace el id único y determinista
    id: `ses-${e.sesiones.length + 1}-${bruta.iniciadaEn ?? hoy}`,
    fecha: hoy,
    rutinaId: bruta.rutinaId ?? null,
    diaId: bruta.diaId ?? null,
    nombreDia: bruta.nombreDia || 'Entreno libre',
    iniciadaEn: bruta.iniciadaEn ?? null,
    duracionSeg: bruta.duracionSeg ?? 0,
    ejercicios: ejerciciosHechos,
    xpGanado,
    prs: prs.map((p) => p.ejercicioId),
  }
  insertarPorFecha(e.sesiones, sesion)
  e.sesionActiva = null

  e.progreso.contadores.sesionesTotales += 1
  e.progreso.contadores.prsTotales += prs.length

  e.progreso.xp += xpGanado
  if (xpDeSesion > 0) {
    e.progreso.xpLog.push({ fecha: hoy, cantidad: xpDeSesion, motivo: MOTIVOS.SESION })
  }
  for (const p of prsConXp) {
    e.progreso.xpLog.push({ fecha: hoy, cantidad: XP_TABLA.pr, motivo: `PR: ${p.nombre}` })
  }
  if (xpGanado > 0) {
    acc.xp.push({ tipo: 'xp', cantidad: xpGanado, motivo: MOTIVOS.SESION })
  }

  if (esSemanaPerfecta(e, hoy)) {
    e.progreso.contadores.semanasPerfectasClaves.push(claveSemana(hoy))
    darXp(e, acc, hoy, XP_TABLA.semanaPerfecta, MOTIVOS.SEMANA_PERFECTA)
  }

  for (const p of prs) {
    acc.pr.push({ tipo: 'pr', ejercicioId: p.ejercicioId, nombre: p.nombre, detalle: p.detalle })
  }

  const rachaNueva = calcularRacha(e, hoy)
  if (rachaNueva > e.progreso.rachaMejor) e.progreso.rachaMejor = rachaNueva
  if (rachaNueva > rachaAntes) acc.racha = { tipo: 'racha', dias: rachaNueva }
}

// Semana perfecta (§8): al completar sesión, si hoy ≥ último día planificado
// de su semana ISO y todos los días planificados de esa semana tienen sesión.
// Requiere ≥2 días planificados/semana; se premia una vez por semana ISO.
function esSemanaPerfecta(e, hoy) {
  const plan = e.ajustes.diasPlanificados
  if (plan.length < 2) return false
  const semana = claveSemana(hoy)
  if (e.progreso.contadores.semanasPerfectasClaves.includes(semana)) return false
  if (diaISO(hoy) < Math.max(...plan)) return false
  const lunes = sumarDias(hoy, -(diaISO(hoy) - 1))
  const fechas = new Set(e.sesiones.map((s) => s.fecha))
  return plan.every((d) => fechas.has(sumarDias(lunes, d - 1)))
}

function aplicarPasos(e, evento, acc) {
  const { fecha, pasos } = evento
  reemplazarPorFecha(e.pasos, { fecha, pasos, fuente: evento.fuente || 'manual' })

  if (!yaCobradoDia(e.progreso.xpLog, fecha, MOTIVOS.PASOS)) {
    darXp(e, acc, fecha, XP_TABLA.pasos, MOTIVOS.PASOS)
  }
  const bonus = xpBonusPasos(pasos, e.baseline.pasosDia)
  if (bonus > 0 && !yaCobradoDia(e.progreso.xpLog, fecha, MOTIVOS.PASOS_BONUS)) {
    e.progreso.contadores.diasPasosSobreBaseline += 1
    darXp(e, acc, fecha, bonus, MOTIVOS.PASOS_BONUS)
  }
}

function aplicarPeso(e, evento, acc) {
  const { fecha, kg } = evento
  reemplazarPorFecha(e.cuerpo.pesos, { fecha, kg })
  // El XP premia el acto de registrar, JAMÁS el valor ni su variación.
  if (!yaCobradoDia(e.progreso.xpLog, fecha, MOTIVOS.PESO)) {
    darXp(e, acc, fecha, XP_TABLA.peso, MOTIVOS.PESO)
  }
}

function aplicarMedidas(e, evento, acc) {
  const { fecha, medidas } = evento
  reemplazarPorFecha(e.cuerpo.medidas, { fecha, ...medidas })
  if (!yaCobradoSemana(e.progreso.xpLog, fecha, MOTIVOS.MEDIDAS)) {
    darXp(e, acc, fecha, XP_TABLA.medidas, MOTIVOS.MEDIDAS)
  }
}

function aplicarFoto(e, evento, acc) {
  e.cuerpo.fotos.push({ id: evento.fotoId, fecha: evento.fecha, tipo: evento.fotoTipo })
  if (!yaCobradoSemana(e.progreso.xpLog, evento.fecha, MOTIVOS.FOTO)) {
    darXp(e, acc, evento.fecha, XP_TABLA.foto, MOTIVOS.FOTO)
  }
}

// Mantiene la lista ordenada por fecha ascendente; misma fecha: reemplaza.
function reemplazarPorFecha(lista, item) {
  const i = lista.findIndex((x) => x.fecha === item.fecha)
  if (i >= 0) {
    lista[i] = item
    return
  }
  insertarPorFecha(lista, item)
}

function insertarPorFecha(lista, item) {
  let i = lista.length
  while (i > 0 && lista[i - 1].fecha > item.fecha) i--
  lista.splice(i, 0, item)
}

// Borra una sesión registrada por error. Filosofía: neto cero, sin castigo y
// sin farmeo — se resta el XP que dio (suelo 0) y se decrementan contadores,
// pero los logros ya celebrados y rachaMejor se quedan (nunca se quitan), y
// el xpLog conserva su historia. Puro: devuelve estado nuevo.
export function borrarSesion(estado, sesionId) {
  const e = structuredClone(estado)
  const i = e.sesiones.findIndex((s) => s.id === sesionId)
  if (i === -1) return e
  const [sesion] = e.sesiones.splice(i, 1)
  e.progreso.xp = Math.max(0, e.progreso.xp - (sesion.xpGanado || 0))
  const c = e.progreso.contadores
  c.sesionesTotales = Math.max(0, c.sesionesTotales - 1)
  c.prsTotales = Math.max(0, c.prsTotales - (sesion.prs ? sesion.prs.length : 0))
  return e
}

// ------------------------------------------------------------- selectores

export function historicoEjercicio(estado, ejercicioId) {
  const def = estado.ejercicios.find((x) => x.id === ejercicioId)
  const medida = def ? def.medida : 'peso_reps'

  let vecesHecho = 0
  let ultimaVez = null
  let mejorPesoKg = null
  let mejor1rmKg = null
  let mejorReps = null
  let mejorMinutos = null
  let serie1rm = null

  for (const sesion of estado.sesiones) {
    const series = []
    for (const ej of sesion.ejercicios) {
      if (ej.ejercicioId === ejercicioId) series.push(...ej.series)
    }
    if (series.length === 0) continue
    vecesHecho += 1
    ultimaVez = { fecha: sesion.fecha, series: series.map((s) => ({ ...s })) }
    for (const serie of series) {
      if (medida === 'peso_reps') {
        if (mejorPesoKg === null || serie.pesoKg > mejorPesoKg) mejorPesoKg = serie.pesoKg
        const r = e1rm(serie.pesoKg, serie.reps)
        if (r !== null && (mejor1rmKg === null || r > mejor1rmKg)) {
          mejor1rmKg = r
          serie1rm = { pesoKg: serie.pesoKg, reps: serie.reps }
        }
      } else if (medida === 'reps') {
        if (mejorReps === null || serie.reps > mejorReps) mejorReps = serie.reps
      } else if (medida === 'tiempo') {
        if (mejorMinutos === null || serie.reps > mejorMinutos) mejorMinutos = serie.reps
      }
    }
  }

  return { vecesHecho, ultimaVez, mejorPesoKg, mejor1rmKg, mejorReps, mejorMinutos, serie1rm }
}

// Σ pesoKg × reps de ejercicios 'peso_reps', por semana ISO ascendente.
export function volumenSemanal(estado) {
  const medidaDe = new Map(estado.ejercicios.map((e) => [e.id, e.medida]))
  const porSemana = new Map()
  for (const sesion of estado.sesiones) {
    const semana = claveSemana(sesion.fecha)
    let kg = porSemana.get(semana) || 0
    for (const ej of sesion.ejercicios) {
      if (medidaDe.get(ej.ejercicioId) !== 'peso_reps') continue
      for (const serie of ej.series) kg += serie.pesoKg * serie.reps
    }
    porSemana.set(semana, kg)
  }
  return [...porSemana.entries()]
    .map(([semana, kg]) => ({ semana, kg: Math.round(kg * 10) / 10 }))
    .sort((a, b) => (a.semana < b.semana ? -1 : a.semana > b.semana ? 1 : 0))
}

// Serie temporal por sesión. Para 'peso_reps': mejor peso y e1RM; para
// 'reps'/'tiempo' añade mejorReps/mejorMinutos (mejorPesoKg y e1rmKg a null).
export function progresoEjercicio(estado, ejercicioId) {
  const def = estado.ejercicios.find((x) => x.id === ejercicioId)
  const medida = def ? def.medida : 'peso_reps'
  const salida = []
  for (const sesion of estado.sesiones) {
    const series = []
    for (const ej of sesion.ejercicios) {
      if (ej.ejercicioId === ejercicioId) series.push(...ej.series)
    }
    if (series.length === 0) continue
    if (medida === 'peso_reps') {
      let mejorPesoKg = null
      let e1rmKg = null
      for (const serie of series) {
        if (mejorPesoKg === null || serie.pesoKg > mejorPesoKg) mejorPesoKg = serie.pesoKg
        const r = e1rm(serie.pesoKg, serie.reps)
        if (r !== null && (e1rmKg === null || r > e1rmKg)) e1rmKg = r
      }
      salida.push({ fecha: sesion.fecha, mejorPesoKg, e1rmKg })
    } else {
      const mejor = Math.max(...series.map((s) => s.reps))
      salida.push(
        medida === 'reps'
          ? { fecha: sesion.fecha, mejorPesoKg: null, e1rmKg: null, mejorReps: mejor }
          : { fecha: sesion.fecha, mejorPesoKg: null, e1rmKg: null, mejorMinutos: mejor }
      )
    }
  }
  return salida
}

// Peso corporal con media móvil de los últimos 7 REGISTROS (no días);
// media7 null hasta tener 7 registros.
export function pesosConMedia(estado) {
  const pesos = estado.cuerpo.pesos
  return pesos.map((p, i) => {
    if (i < 6) return { fecha: p.fecha, kg: p.kg, media7: null }
    const ventana = pesos.slice(i - 6, i + 1)
    const media = ventana.reduce((s, x) => s + x.kg, 0) / 7
    return { fecha: p.fecha, kg: p.kg, media7: Math.round(media * 10) / 10 }
  })
}
