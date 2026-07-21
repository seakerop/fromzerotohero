import { describe, it, expect } from 'vitest'
import {
  crearEstadoInicial,
  aplicar,
  nivelDesdeXp,
  statsActuales,
  calcularRacha,
  historicoEjercicio,
  volumenSemanal,
  progresoEjercicio,
  pesosConMedia,
} from '../../src/engine/motor.js'
import { EJERCICIOS_SEED } from '../../src/data/ejercicios.js'

function respuestas(hoy = '2026-07-20', extra = {}) {
  return {
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
  }
}

function estadoBase(hoy = '2026-07-20', extra = {}) {
  const inicial = crearEstadoInicial(respuestas(hoy, extra))
  return aplicar(inicial, { tipo: 'perfil_creado', hoy }).estado
}

function sesionCon(ejercicios, extra = {}) {
  return {
    rutinaId: null,
    diaId: null,
    nombreDia: 'Entreno libre',
    iniciadaEn: 1780000000000,
    duracionSeg: 3600,
    ejercicios: ejercicios.map(([ejercicioId, series]) => ({
      ejercicioId,
      series: series.map(([pesoKg, reps, hecha = true]) => ({ pesoKg, reps, hecha })),
    })),
    ...extra,
  }
}

function congelar(obj) {
  Object.freeze(obj)
  for (const valor of Object.values(obj)) {
    if (valor && typeof valor === 'object' && !Object.isFrozen(valor)) congelar(valor)
  }
  return obj
}

describe('crearEstadoInicial', () => {
  it('crea el estado completo del contrato', () => {
    const e = crearEstadoInicial(respuestas())
    expect(e.version).toBe(1)
    expect(e.perfil).toEqual({
      apodo: 'Emilio', edad: 31, alturaCm: 178, objetivo: 'ambos',
      experiencia: 'algo', creadoEl: '2026-07-20',
    })
    expect(e.baseline).toEqual({
      pasosDia: 4000,
      diasEjercicioSemana: 2,
      pesoInicialKg: 96.5,
      historial: [{ fecha: '2026-07-20', pasosDia: 4000 }],
      ultimaRecalibracion: '2026-07-20',
    })
    expect(e.ajustes).toEqual({ diasPlanificados: [1, 3, 5], descansoSeg: 90 })
    expect(e.progreso.xp).toBe(0)
    expect(e.progreso.logros).toEqual({})
    expect(e.progreso.contadores).toEqual({
      sesionesTotales: 0,
      prsTotales: 0,
      diasPasosSobreBaseline: 0,
      semanasPerfectasClaves: [],
    })
    expect(e.progreso.rachaMejor).toBe(0)
    expect(e.progreso.xpLog).toEqual([])
    expect(e.ejercicios).toEqual(EJERCICIOS_SEED)
    expect(e.ejercicios).not.toBe(EJERCICIOS_SEED) // copia, no referencia
    expect(e.rutinas).toEqual([])
    expect(e.sesiones).toEqual([])
    expect(e.sesionActiva).toBeNull()
    expect(e.pasos).toEqual([])
    // El peso del onboarding arranca la gráfica; no da XP (xpLog vacío).
    expect(e.cuerpo.pesos).toEqual([{ fecha: '2026-07-20', kg: 96.5 }])
    expect(e.cuerpo.medidas).toEqual([])
    expect(e.cuerpo.fotos).toEqual([])
  })

  it('la biblioteca seed trae ~38 ejercicios y los 3 tipos de medida', () => {
    expect(EJERCICIOS_SEED.length).toBeGreaterThanOrEqual(38)
    const medidas = new Set(EJERCICIOS_SEED.map((x) => x.medida))
    expect(medidas).toEqual(new Set(['peso_reps', 'reps', 'tiempo']))
    const ids = EJERCICIOS_SEED.map((x) => x.id)
    expect(new Set(ids).size).toBe(ids.length) // ids únicos
    for (const id of ['press-banca', 'sentadilla', 'peso-muerto', 'dominadas', 'plancha', 'hip-thrust']) {
      expect(ids).toContain(id)
    }
  })

  it('ordena y depura los días planificados', () => {
    const e = crearEstadoInicial(respuestas('2026-07-20', { diasPlanificados: [5, 1, 3, 5, 9] }))
    expect(e.ajustes.diasPlanificados).toEqual([1, 3, 5])
  })
})

describe('aplicar es puro e inmutable', () => {
  const eventos = [
    { tipo: 'perfil_creado', hoy: '2026-07-20' },
    {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8], [60, 8]]]]),
    },
    { tipo: 'pasos', fecha: '2026-07-20', pasos: 6000, fuente: 'manual' },
    { tipo: 'peso', fecha: '2026-07-20', kg: 95 },
    { tipo: 'medidas', fecha: '2026-07-20', medidas: { cinturaCm: 100 } },
    { tipo: 'foto', fecha: '2026-07-20', fotoId: 'f1', fotoTipo: 'frente' },
    { tipo: 'tick_diario', hoy: '2026-08-01' },
  ]

  for (const evento of eventos) {
    it(`no muta el estado de entrada con '${evento.tipo}'`, () => {
      const e = estadoBase()
      const foto = JSON.stringify(e)
      congelar(e) // cualquier mutación lanzaría en modo estricto
      const { estado } = aplicar(e, evento)
      expect(JSON.stringify(e)).toBe(foto)
      expect(estado).not.toBe(e)
    })
  }

  it('un evento desconocido devuelve estado equivalente y sin resultados', () => {
    const e = estadoBase()
    const { estado, resultados } = aplicar(e, { tipo: 'meteorito', hoy: '2026-07-20' })
    expect(resultados).toEqual([])
    expect(estado).toEqual(e)
    expect(estado).not.toBe(e)
  })
})

describe('sesion_completada: filtrado y resultados', () => {
  it('filtra series no hechas y ejercicios vacíos; guarda series limpias', () => {
    const e = estadoBase()
    const { estado } = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([
        ['press-banca', [[60, 8, true], [60, 8, false], [62.5, 6, true]]],
        ['sentadilla', [[80, 5, false]]],
      ]),
    })
    const sesion = estado.sesiones[0]
    expect(sesion.ejercicios).toEqual([
      { ejercicioId: 'press-banca', series: [{ pesoKg: 60, reps: 8 }, { pesoKg: 62.5, reps: 6 }] },
    ])
    expect(sesion.xpGanado).toBe(50 + 5 * 2)
    expect(sesion.fecha).toBe('2026-07-20')
    expect(sesion.id).toBeTruthy()
    expect(sesion.nombreDia).toBe('Entreno libre')
  })

  it('si todas las series quedan sin hacer no guarda nada y resultados = []', () => {
    const e = estadoBase()
    const { estado, resultados } = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8, false]]]]),
    })
    expect(resultados).toEqual([])
    expect(estado.sesiones).toEqual([])
    expect(estado.progreso.contadores.sesionesTotales).toBe(0)
    expect(estado.progreso.xp).toBe(e.progreso.xp)
  })

  it('limpia sesionActiva al completar', () => {
    const e = estadoBase()
    e.sesionActiva = { iniciadaEn: 1, rutinaId: null, diaId: null, nombreDia: 'Torso', ejercicios: [] }
    const { estado } = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8]]]]),
    })
    expect(estado.sesionActiva).toBeNull()
  })

  it('los resultados salen en el orden del contrato: xp, pr, logro, nivel, racha', () => {
    let e = estadoBase()
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([['press-banca', [[60, 8], [60, 8], [60, 8]]]]),
    }).estado
    // Miércoles planificado, con PR, con logro (mas_fuerte), cruza nivel y crece la racha.
    const { resultados } = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-22',
      sesion: sesionCon([['press-banca', [[70, 8], [70, 8], [70, 8]]]]),
    })
    expect(resultados.map((r) => r.tipo)).toEqual(['xp', 'pr', 'logro', 'nivel', 'racha'])
    expect(resultados[0].motivo).toBe('Sesión completada')
    expect(resultados[0].cantidad).toBe(65 + 40) // sesión + PR dentro del mismo resultado
    expect(resultados[2].logro.id).toBe('mas_fuerte')
  })
})

describe('selectores', () => {
  function estadoConHistorial() {
    let e = estadoBase()
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionCon([
        ['press-banca', [[60, 8], [60, 8]]],
        ['flexiones', [[0, 12]]],
        ['plancha', [[0, 2]]],
      ]),
    }).estado
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-22',
      sesion: sesionCon([
        ['press-banca', [[62.5, 5], [60, 10]]],
        ['flexiones', [[0, 15]]],
        ['plancha', [[0, 3]]],
      ]),
    }).estado
    return e
  }

  it('historicoEjercicio: killer feature de la última vez + mejores marcas', () => {
    const e = estadoConHistorial()
    const h = historicoEjercicio(e, 'press-banca')
    expect(h.vecesHecho).toBe(2)
    expect(h.ultimaVez.fecha).toBe('2026-07-22')
    expect(h.ultimaVez.series).toEqual([{ pesoKg: 62.5, reps: 5 }, { pesoKg: 60, reps: 10 }])
    expect(h.mejorPesoKg).toBe(62.5)
    expect(h.mejor1rmKg).toBe(80) // 60 × 10
    expect(h.serie1rm).toEqual({ pesoKg: 60, reps: 10 })
    expect(h.mejorReps).toBeNull()
    expect(h.mejorMinutos).toBeNull()
  })

  it('historicoEjercicio con medidas reps y tiempo', () => {
    const e = estadoConHistorial()
    const flex = historicoEjercicio(e, 'flexiones')
    expect(flex.mejorReps).toBe(15)
    expect(flex.mejorPesoKg).toBeNull()
    const plancha = historicoEjercicio(e, 'plancha')
    expect(plancha.mejorMinutos).toBe(3)
  })

  it('historicoEjercicio de un ejercicio nunca hecho', () => {
    const h = historicoEjercicio(estadoBase(), 'sentadilla')
    expect(h).toEqual({
      vecesHecho: 0,
      ultimaVez: null,
      mejorPesoKg: null,
      mejor1rmKg: null,
      mejorReps: null,
      mejorMinutos: null,
      serie1rm: null,
    })
  })

  it('volumenSemanal suma solo peso_reps, por semana ISO', () => {
    let e = estadoConHistorial() // W30: 60×8 + 60×8 + 62,5×5 + 60×10 = 1872,5 kg
    e = aplicar(e, {
      tipo: 'sesion_completada',
      hoy: '2026-07-27',
      sesion: sesionCon([['press-banca', [[60, 8]]]]),
    }).estado
    expect(volumenSemanal(e)).toEqual([
      { semana: '2026-W30', kg: 1872.5 },
      { semana: '2026-W31', kg: 480 },
    ])
  })

  it('progresoEjercicio da la serie temporal por sesión', () => {
    const e = estadoConHistorial()
    expect(progresoEjercicio(e, 'press-banca')).toEqual([
      { fecha: '2026-07-20', mejorPesoKg: 60, e1rmKg: 76 },
      { fecha: '2026-07-22', mejorPesoKg: 62.5, e1rmKg: 80 },
    ])
    expect(progresoEjercicio(e, 'flexiones')).toEqual([
      { fecha: '2026-07-20', mejorPesoKg: null, e1rmKg: null, mejorReps: 12 },
      { fecha: '2026-07-22', mejorPesoKg: null, e1rmKg: null, mejorReps: 15 },
    ])
    expect(progresoEjercicio(e, 'plancha')[1].mejorMinutos).toBe(3)
  })

  it('pesosConMedia: media móvil de los últimos 7 REGISTROS, null hasta tenerlos', () => {
    const e = estadoBase()
    e.cuerpo.pesos = [100, 99, 98, 97, 96, 95, 94, 93].map((kg, i) => ({
      fecha: `2026-08-${String(i + 1).padStart(2, '0')}`,
      kg,
    }))
    const serie = pesosConMedia(e)
    expect(serie[0]).toEqual({ fecha: '2026-08-01', kg: 100, media7: null })
    expect(serie[5].media7).toBeNull()
    expect(serie[6]).toEqual({ fecha: '2026-08-07', kg: 94, media7: 97 })
    expect(serie[7]).toEqual({ fecha: '2026-08-08', kg: 93, media7: 96 })
  })

  it('los reexports de la fachada funcionan', () => {
    const e = estadoBase()
    expect(nivelDesdeXp(e.progreso.xp).nivel).toBe(1)
    expect(statsActuales(e).fuerza).toBe(12)
    expect(calcularRacha(e, '2026-07-20')).toBe(0)
  })
})
