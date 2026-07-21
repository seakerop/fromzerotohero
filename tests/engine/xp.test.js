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

describe('pasos', () => {
  it('registrar pasos da 10 XP, una vez al día', () => {
    const e = estadoBase()
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 3000, fuente: 'manual' })
    expect(xpDe(r.resultados, 'Pasos registrados')[0].cantidad).toBe(10)
    expect(r.estado.pasos).toEqual([{ fecha: '2026-07-20', pasos: 3000, fuente: 'manual' }])
  })

  it('reeditar los pasos del día actualiza el dato SIN volver a cobrar', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 3000, fuente: 'manual' }).estado
    const antes = e.progreso.xp
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 3500, fuente: 'manual' })
    expect(r.estado.pasos).toEqual([{ fecha: '2026-07-20', pasos: 3500, fuente: 'manual' }])
    expect(r.estado.progreso.xp).toBe(antes)
    expect(r.resultados).toEqual([])
  })

  it('pasos ≥ baseline añaden +15', () => {
    const e = estadoBase() // baseline 4000
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 4000, fuente: 'manual' })
    expect(xpDe(r.resultados, 'Pasos registrados')[0].cantidad).toBe(10)
    expect(xpDe(r.resultados, 'Pasos sobre tu base')[0].cantidad).toBe(15)
    expect(r.estado.progreso.contadores.diasPasosSobreBaseline).toBe(1)
  })

  it('pasos ≥ 1,5× baseline añaden +25 (el mayor, no ambos)', () => {
    const e = estadoBase()
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 6000, fuente: 'manual' })
    const bonus = xpDe(r.resultados, 'Pasos sobre tu base')
    expect(bonus).toHaveLength(1)
    expect(bonus[0].cantidad).toBe(25)
  })

  it('si el día pasa de debajo a encima de la base al reeditar, el bonus se cobra una sola vez', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 3000, fuente: 'manual' }).estado
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 5000, fuente: 'manual' })
    expect(r.resultados.map((x) => x.motivo)).toEqual(['Pasos sobre tu base'])
    expect(r.estado.progreso.contadores.diasPasosSobreBaseline).toBe(1)
    const r2 = aplicar(r.estado, { tipo: 'pasos', fecha: '2026-07-20', pasos: 9000, fuente: 'manual' })
    expect(r2.resultados).toEqual([])
    expect(r2.estado.progreso.contadores.diasPasosSobreBaseline).toBe(1)
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
