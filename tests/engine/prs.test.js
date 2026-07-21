import { describe, it, expect } from 'vitest'
import { e1rm } from '../../src/engine/prs.js'
import { crearEstadoInicial, aplicar } from '../../src/engine/motor.js'

function estadoBase(hoy = '2026-07-20') {
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
  })
  return aplicar(inicial, { tipo: 'perfil_creado', hoy }).estado
}

function sesionCon(ejercicios) {
  return {
    rutinaId: null,
    diaId: null,
    nombreDia: 'Entreno libre',
    iniciadaEn: 1780000000000,
    duracionSeg: 3600,
    ejercicios: ejercicios.map(([ejercicioId, series]) => ({
      ejercicioId,
      series: series.map(([pesoKg, reps]) => ({ pesoKg, reps, hecha: true })),
    })),
  }
}

describe('e1rm (Epley, redondeo a 0,5 kg)', () => {
  it('calcula peso × (1 + reps/30)', () => {
    expect(e1rm(100, 1)).toBe(103.5)
    expect(e1rm(60, 8)).toBe(76)
    expect(e1rm(60, 10)).toBe(80)
    expect(e1rm(62.5, 5)).toBe(73)
  })

  it('solo vale con 1 ≤ reps ≤ 12', () => {
    expect(e1rm(100, 0)).toBeNull()
    expect(e1rm(100, 13)).toBeNull()
    expect(e1rm(100, 20)).toBeNull()
    expect(e1rm(100, 12)).toBe(140)
  })
})

describe('detección de PRs al completar sesión', () => {
  it('la primera sesión de un ejercicio fija el listón y NO es PR', () => {
    const e = estadoBase()
    const r = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8], [60, 8], [60, 8]]]]),
    })
    expect(r.resultados.some((x) => x.tipo === 'pr')).toBe(false)
    expect(r.estado.sesiones[0].prs).toEqual([])
    expect(r.estado.progreso.contadores.prsTotales).toBe(0)
  })

  it('superar el mejor peso histórico es PR (+40 XP dentro del xpGanado)', () => {
    let e = estadoBase()
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8]]]]),
    }).estado
    const r = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-22',
      sesion: sesionCon([['press-banca', [[62.5, 5]]]]),
    })
    const pr = r.resultados.find((x) => x.tipo === 'pr')
    expect(pr).toEqual({
      tipo: 'pr',
      ejercicioId: 'press-banca',
      nombre: 'Press banca',
      detalle: '62,5 kg × 5',
    })
    const sesion = r.estado.sesiones[1]
    expect(sesion.prs).toEqual(['press-banca'])
    expect(sesion.xpGanado).toBe(50 + 5 * 1 + 40)
    expect(r.estado.progreso.contadores.prsTotales).toBe(1)
    expect(r.resultados.some((x) => x.tipo === 'logro' && x.logro.id === 'mas_fuerte')).toBe(true)
  })

  it('superar el mejor e1RM histórico también es PR aunque el peso no suba', () => {
    let e = estadoBase()
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8]]]]), // e1RM 76
    }).estado
    const r = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-22',
      sesion: sesionCon([['press-banca', [[60, 10]]]]), // e1RM 80
    })
    const pr = r.resultados.find((x) => x.tipo === 'pr')
    expect(pr.detalle).toBe('60 kg × 10')
  })

  it('series con reps > 12 no generan e1RM: sin superar peso no hay PR', () => {
    let e = estadoBase()
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8]]]]),
    }).estado
    const r = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-22',
      sesion: sesionCon([['press-banca', [[55, 20]]]]),
    })
    expect(r.resultados.some((x) => x.tipo === 'pr')).toBe(false)
  })

  it('los ejercicios de solo reps o tiempo nunca generan PR', () => {
    let e = estadoBase()
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['flexiones', [[0, 10]]], ['plancha', [[0, 2]]]]),
    }).estado
    const r = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-22',
      sesion: sesionCon([['flexiones', [[0, 20]]], ['plancha', [[0, 5]]]]),
    })
    expect(r.resultados.some((x) => x.tipo === 'pr')).toBe(false)
    expect(r.estado.progreso.contadores.prsTotales).toBe(0)
  })

  it('máx 1 PR por ejercicio y sesión aunque varias series batan el récord', () => {
    let e = estadoBase()
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8]]]]),
    }).estado
    const r = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-22',
      sesion: sesionCon([['press-banca', [[65, 5], [70, 3], [67.5, 4]]]]),
    })
    expect(r.resultados.filter((x) => x.tipo === 'pr')).toHaveLength(1)
    expect(r.resultados.find((x) => x.tipo === 'pr').detalle).toBe('70 kg × 3')
  })

  it('máx 3 PRs con XP por sesión (el cuarto celebra pero no cobra)', () => {
    const cuatro = ['press-banca', 'sentadilla', 'remo-con-barra', 'press-militar']
    let e = estadoBase()
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon(cuatro.map((id) => [id, [[50, 5]]])),
    }).estado
    const r = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-22',
      sesion: sesionCon(cuatro.map((id) => [id, [[60, 5]]])),
    })
    expect(r.resultados.filter((x) => x.tipo === 'pr')).toHaveLength(4)
    const sesion = r.estado.sesiones[1]
    expect(sesion.prs).toHaveLength(4)
    expect(sesion.xpGanado).toBe(50 + 5 * 4 + 3 * 40) // solo 3 PRs cobran
    expect(r.estado.progreso.contadores.prsTotales).toBe(4)
  })
})
