import { describe, it, expect } from 'vitest'
import { crearEstadoInicial, aplicar } from '../../src/engine/motor.js'

// Julio de 2026: lunes 20, miércoles 22 (semana W30); lunes 27 (W31).

function estadoBase(hoy = '2026-07-20', extra = {}) {
  const inicial = crearEstadoInicial({
    apodo: 'Emilio',
    edad: 31,
    alturaCm: 178,
    pesoKg: 96.5,
    objetivo: 'ambos',
    experiencia: 'algo',
    pasosDia: 4000,
    diasEjercicioSemana: 2,
    diasPlanificados: [1, 3, 5],
    hoy,
    ...extra,
  })
  return aplicar(inicial, { tipo: 'perfil_creado', hoy }).estado
}

function sesionConSeries(numSeries, ejercicioId = 'press-banca') {
  const series = Array.from({ length: numSeries }, () => ({ pesoKg: 60, reps: 8, hecha: true }))
  return {
    rutinaId: null,
    diaId: null,
    nombreDia: 'Entreno libre',
    iniciadaEn: 1780000000000,
    duracionSeg: 3600,
    ejercicios: [{ ejercicioId, series }],
  }
}

function xpDe(resultados, motivo) {
  return resultados.filter((r) => r.tipo === 'xp' && r.motivo === motivo)
}

describe('sesión completada', () => {
  it('da 50 + 5 por serie hecha', () => {
    const e = estadoBase()
    const { estado, resultados } = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionConSeries(6),
    })
    const xp = xpDe(resultados, 'Sesión completada')
    expect(xp).toHaveLength(1)
    expect(xp[0].cantidad).toBe(50 + 5 * 6)
    expect(estado.sesiones[0].xpGanado).toBe(80)
  })

  it('tope de 20 series con XP (150 en total)', () => {
    const e = estadoBase()
    const { estado } = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionConSeries(25),
    })
    expect(estado.sesiones[0].xpGanado).toBe(150)
  })

  it('máximo 2 sesiones con XP al día; la tercera no cobra pero sí cuenta', () => {
    let e = estadoBase()
    const hoy = '2026-07-20'
    e = aplicar(e, { tipo: 'sesion_completada', hoy, sesion: sesionConSeries(2) }).estado
    e = aplicar(e, { tipo: 'sesion_completada', hoy, sesion: sesionConSeries(2) }).estado
    const antes = e.progreso.xp
    const r3 = aplicar(e, { tipo: 'sesion_completada', hoy, sesion: sesionConSeries(2) })
    expect(r3.estado.progreso.xp).toBe(antes)
    expect(r3.resultados.some((r) => r.tipo === 'xp')).toBe(false)
    expect(r3.estado.sesiones).toHaveLength(3)
    expect(r3.estado.sesiones[2].xpGanado).toBe(0)
    expect(r3.estado.progreso.contadores.sesionesTotales).toBe(3)
  })
})

// Pasos escalonados (CONTRACT §8): con baseline 4000 la meta derivada es
// 5000 (4000 × 1,25). Tramos de 1250 pasos; 4 + 6 por cada uno de los tres
// primeros cuartos, 12 al completar la barra y 8 por la milla extra (7500).
describe('pasos escalonados por esfuerzo', () => {
  it('caminar poco suma poco: 120 pasos solo pagan el acto de registrar', () => {
    const e = estadoBase()
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 120, fuente: 'manual' })
    expect(xpDe(r.resultados, 'Pasos registrados')[0].cantidad).toBe(4)
    expect(xpDe(r.resultados, 'Pasos sobre tu base')).toHaveLength(0)
    expect(r.estado.pasos).toEqual([{ fecha: '2026-07-20', pasos: 120, fuente: 'manual' }])
  })

  it('cada cuarto de la meta suma más que el anterior tramo', () => {
    const e = estadoBase()
    const xpCon = (pasos) =>
      aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos, fuente: 'manual' }).estado.progreso.xp -
      e.progreso.xp
    expect(xpCon(120)).toBe(4) // sin tramos
    expect(xpCon(1250)).toBe(10) // 1 tramo
    expect(xpCon(2500)).toBe(16) // 2 tramos
    expect(xpCon(3750)).toBe(22) // 3 tramos
    expect(xpCon(5000)).toBe(34) // barra completa: +12
    expect(xpCon(7500)).toBe(42) // milla extra: +8 (tope diario)
    expect(xpCon(30000)).toBe(42) // no se puede farmear más allá del tope
  })

  it('completar la barra marca el día y cuenta para camino_diario', () => {
    const e = estadoBase()
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 5200, fuente: 'manual' })
    expect(xpDe(r.resultados, 'Pasos sobre tu base')[0].cantidad).toBe(12)
    expect(r.estado.progreso.contadores.diasPasosSobreBaseline).toBe(1)
  })

  it('corregir al alza cobra solo la diferencia; a la baja no retira nada', () => {
    const inicial = estadoBase()
    const partida = inicial.progreso.xp
    let e = aplicar(inicial, { tipo: 'pasos', fecha: '2026-07-20', pasos: 1250, fuente: 'manual' }).estado
    expect(e.progreso.xp - partida).toBe(10)

    const subida = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 5000, fuente: 'manual' })
    expect(subida.estado.progreso.xp - partida).toBe(34) // 10 + 12 de tramos + 12 de meta
    expect(xpDe(subida.resultados, 'Pasos registrados')[0].cantidad).toBe(12)

    const bajada = aplicar(subida.estado, { tipo: 'pasos', fecha: '2026-07-20', pasos: 500, fuente: 'manual' })
    expect(bajada.estado.progreso.xp - partida).toBe(34)
    expect(bajada.resultados).toEqual([])
    expect(bajada.estado.pasos[0].pasos).toBe(500)
    expect(bajada.estado.progreso.contadores.diasPasosSobreBaseline).toBe(1)
  })

  it('la meta de ajustes manda sobre la derivada del baseline', () => {
    const e = { ...estadoBase() }
    e.ajustes = { ...e.ajustes, metaPasos: 10000 }
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 5000, fuente: 'manual' })
    // 5000 de 10000: dos tramos, sin premio de meta
    expect(r.estado.progreso.xp - e.progreso.xp).toBe(16)
    expect(r.estado.progreso.contadores.diasPasosSobreBaseline).toBe(0)
  })
})

describe('peso corporal: XP por el ACTO de registrar, jamás por el valor', () => {
  it('registrar peso da 10 XP, una vez al día', () => {
    const e = estadoBase()
    const r = aplicar(e, { tipo: 'peso', fecha: '2026-07-21', kg: 96 })
    expect(xpDe(r.resultados, 'Peso registrado')[0].cantidad).toBe(10)
  })

  it('reeditar el peso del día no vuelve a cobrar', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'peso', fecha: '2026-07-21', kg: 96 }).estado
    const r = aplicar(e, { tipo: 'peso', fecha: '2026-07-21', kg: 95 })
    expect(r.resultados).toEqual([])
    expect(r.estado.cuerpo.pesos.find((p) => p.fecha === '2026-07-21').kg).toBe(95)
  })

  it('subir mucho, bajar mucho o repetir kilos da EXACTAMENTE el mismo XP', () => {
    let e = estadoBase()
    const deltas = []
    const casos = [
      { fecha: '2026-07-21', kg: 99.5 }, // sube
      { fecha: '2026-07-22', kg: 90 }, // baja mucho
      { fecha: '2026-07-23', kg: 90 }, // igual
    ]
    for (const caso of casos) {
      const antes = e.progreso.xp
      const r = aplicar(e, { tipo: 'peso', ...caso })
      e = r.estado
      deltas.push(e.progreso.xp - antes)
      // Solo los resultados de XP: el árbol puede crecer por el nuevo día de
      // acción, pero eso no toca el XP y no depende del valor de la báscula.
      const soloXp = r.resultados.filter((x) => x.tipo === 'xp')
      expect(soloXp.map((x) => [x.tipo, x.cantidad, x.motivo])).toEqual([
        ['xp', 10, 'Peso registrado'],
      ])
    }
    expect(deltas).toEqual([10, 10, 10])
  })

  it('ninguna entrada del xpLog nace del valor del peso', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'peso', fecha: '2026-07-21', kg: 120 }).estado
    e = aplicar(e, { tipo: 'peso', fecha: '2026-07-22', kg: 70 }).estado
    const motivos = e.progreso.xpLog.map((x) => x.motivo)
    expect(motivos.filter((m) => m !== 'Peso registrado')).toEqual(['Logro: El primer paso'])
  })
})

describe('medidas y fotos: 15 XP, 1 por semana ISO', () => {
  it('medidas cobran una vez por semana', () => {
    let e = estadoBase()
    const r1 = aplicar(e, { tipo: 'medidas', fecha: '2026-07-20', medidas: { cinturaCm: 100 } })
    expect(xpDe(r1.resultados, 'Medidas registradas')[0].cantidad).toBe(15)
    const r2 = aplicar(r1.estado, { tipo: 'medidas', fecha: '2026-07-22', medidas: { cinturaCm: 99.5 } })
    expect(r2.resultados).toEqual([]) // misma semana W30
    expect(r2.estado.cuerpo.medidas).toHaveLength(2)
    const r3 = aplicar(r2.estado, { tipo: 'medidas', fecha: '2026-07-27', medidas: { cinturaCm: 99 } })
    expect(xpDe(r3.resultados, 'Medidas registradas')[0].cantidad).toBe(15) // W31
  })

  it('fotos cobran una vez por semana (la primera además da el logro El espejo)', () => {
    let e = estadoBase()
    const r1 = aplicar(e, { tipo: 'foto', fecha: '2026-07-20', fotoId: 'f1', fotoTipo: 'frente' })
    expect(xpDe(r1.resultados, 'Foto de progreso')[0].cantidad).toBe(15)
    expect(r1.resultados.find((x) => x.tipo === 'logro').logro.id).toBe('el_espejo')
    const r2 = aplicar(r1.estado, { tipo: 'foto', fecha: '2026-07-22', fotoId: 'f2', fotoTipo: 'lado' })
    expect(r2.resultados).toEqual([])
    expect(r2.estado.cuerpo.fotos).toHaveLength(2)
  })
})

describe('semana perfecta', () => {
  function sesion() {
    return sesionConSeries(3)
  }

  it('se premia con 60 al cerrar todos los días planificados de la semana', () => {
    let e = estadoBase('2026-07-20', { diasPlanificados: [1, 3] })
    const r1 = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesion() })
    expect(xpDe(r1.resultados, 'Semana perfecta')).toHaveLength(0) // aún queda el miércoles
    const r2 = aplicar(r1.estado, { tipo: 'sesion_completada', hoy: '2026-07-22', sesion: sesion() })
    expect(xpDe(r2.resultados, 'Semana perfecta')[0].cantidad).toBe(60)
    expect(r2.estado.progreso.contadores.semanasPerfectasClaves).toEqual(['2026-W30'])
    expect(r2.resultados.some((x) => x.tipo === 'logro' && x.logro.id === 'primera_semana')).toBe(true)
  })

  it('no se premia dos veces la misma semana ISO', () => {
    let e = estadoBase('2026-07-20', { diasPlanificados: [1, 3] })
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesion() }).estado
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-22', sesion: sesion() }).estado
    const r = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-23', sesion: sesion() })
    expect(xpDe(r.resultados, 'Semana perfecta')).toHaveLength(0)
    expect(r.estado.progreso.contadores.semanasPerfectasClaves).toEqual(['2026-W30'])
  })

  it('requiere al menos 2 días planificados por semana', () => {
    let e = estadoBase('2026-07-20', { diasPlanificados: [1] })
    const r = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesion() })
    expect(xpDe(r.resultados, 'Semana perfecta')).toHaveLength(0)
    expect(r.estado.progreso.contadores.semanasPerfectasClaves).toEqual([])
  })

  it('no se premia antes del último día planificado aunque falten sesiones por delante', () => {
    let e = estadoBase('2026-07-20', { diasPlanificados: [1, 3, 5] })
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesion() }).estado
    const r = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-22', sesion: sesion() })
    expect(xpDe(r.resultados, 'Semana perfecta')).toHaveLength(0) // el viernes aún no llegó
  })
})
