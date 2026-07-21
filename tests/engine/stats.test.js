import { describe, it, expect } from 'vitest'
import { crearEstadoInicial, aplicar, statsActuales } from '../../src/engine/motor.js'

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

describe('stats iniciales del onboarding', () => {
  it('derivan de experiencia, pasos y días de ejercicio', () => {
    const s = statsActuales(estadoBase())
    expect(s).toEqual({ fuerza: 12, resistencia: 10, constancia: 10 })
  })

  it('fuerza0: ninguna 5, algo 12, habitual 20', () => {
    expect(statsActuales(estadoBase('2026-07-20', { experiencia: 'ninguna' })).fuerza).toBe(5)
    expect(statsActuales(estadoBase('2026-07-20', { experiencia: 'habitual' })).fuerza).toBe(20)
  })

  it('resistencia0 por tramos de pasos', () => {
    expect(statsActuales(estadoBase('2026-07-20', { pasosDia: 2999 })).resistencia).toBe(5)
    expect(statsActuales(estadoBase('2026-07-20', { pasosDia: 3000 })).resistencia).toBe(10)
    expect(statsActuales(estadoBase('2026-07-20', { pasosDia: 6000 })).resistencia).toBe(16)
    expect(statsActuales(estadoBase('2026-07-20', { pasosDia: 9999 })).resistencia).toBe(16)
    expect(statsActuales(estadoBase('2026-07-20', { pasosDia: 10000 })).resistencia).toBe(22)
  })

  it('constancia0 por días de ejercicio actuales', () => {
    expect(statsActuales(estadoBase('2026-07-20', { diasEjercicioSemana: 0 })).constancia).toBe(5)
    expect(statsActuales(estadoBase('2026-07-20', { diasEjercicioSemana: 2 })).constancia).toBe(10)
    expect(statsActuales(estadoBase('2026-07-20', { diasEjercicioSemana: 4 })).constancia).toBe(16)
    expect(statsActuales(estadoBase('2026-07-20', { diasEjercicioSemana: 6 })).constancia).toBe(22)
  })
})

describe('derivación desde contadores', () => {
  it('fuerza = fuerza0 + floor(sesiones/2) + PRs', () => {
    const e = estadoBase()
    e.progreso.contadores.sesionesTotales = 5
    e.progreso.contadores.prsTotales = 2
    expect(statsActuales(e).fuerza).toBe(12 + 2 + 2)
  })

  it('resistencia = resistencia0 + floor(diasPasosSobreBaseline/5)', () => {
    const e = estadoBase()
    e.progreso.contadores.diasPasosSobreBaseline = 12
    expect(statsActuales(e).resistencia).toBe(10 + 2)
  })

  it('constancia = constancia0 + semanas perfectas + floor(rachaMejor/7)', () => {
    const e = estadoBase()
    e.progreso.contadores.semanasPerfectasClaves = ['2026-W28', '2026-W29', '2026-W30']
    e.progreso.rachaMejor = 15
    expect(statsActuales(e).constancia).toBe(10 + 3 + 2)
  })

  it('resistencia0 usa los pasos del onboarding, no el baseline recalibrado', () => {
    const e = estadoBase()
    e.baseline.pasosDia = 12000 // recalibraciones posteriores no cambian el punto de partida
    expect(statsActuales(e).resistencia).toBe(10)
  })

  it('tope 99 en las tres stats', () => {
    const e = estadoBase()
    e.progreso.contadores.sesionesTotales = 500
    e.progreso.contadores.prsTotales = 200
    e.progreso.contadores.diasPasosSobreBaseline = 5000
    e.progreso.contadores.semanasPerfectasClaves = Array.from({ length: 120 }, (_, i) => `w${i}`)
    e.progreso.rachaMejor = 1000
    expect(statsActuales(e)).toEqual({ fuerza: 99, resistencia: 99, constancia: 99 })
  })
})
