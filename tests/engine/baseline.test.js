import { describe, it, expect } from 'vitest'
import { crearEstadoInicial, aplicar } from '../../src/engine/motor.js'
import { sumarDias } from '../../src/engine/fechas.js'

function estadoBase(hoy = '2026-06-01') {
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

function conPasos(estado, desde, dias, pasos) {
  let e = estado
  for (let i = 0; i < dias; i++) {
    e = aplicar(e, { tipo: 'pasos', fecha: sumarDias(desde, i), pasos, fuente: 'manual' }).estado
  }
  return e
}

describe('recalibración del baseline (tick_diario)', () => {
  it('no evalúa antes de 7 días desde la última recalibración', () => {
    let e = conPasos(estadoBase(), '2026-06-01', 7, 8000)
    const r = aplicar(e, { tipo: 'tick_diario', hoy: '2026-06-05' })
    expect(r.estado.baseline.pasosDia).toBe(4000)
    expect(r.estado.baseline.ultimaRecalibracion).toBe('2026-06-01')
    expect(r.resultados).toEqual([])
  })

  it('sube suave: baseline + 25% de la diferencia con la media', () => {
    let e = conPasos(estadoBase(), '2026-06-01', 7, 6000)
    const r = aplicar(e, { tipo: 'tick_diario', hoy: '2026-06-08' })
    expect(r.estado.baseline.pasosDia).toBe(4500) // 4000 + 0,25 × 2000
    expect(r.estado.baseline.ultimaRecalibracion).toBe('2026-06-08')
    expect(r.estado.baseline.historial).toEqual([
      { fecha: '2026-06-01', pasosDia: 4000 },
      { fecha: '2026-06-08', pasosDia: 4500 },
    ])
    expect(r.resultados).toEqual([]) // silenciosa: sin XP ni mensajes
  })

  it('tope del 15% por recalibración', () => {
    let e = conPasos(estadoBase(), '2026-06-01', 7, 20000)
    const r = aplicar(e, { tipo: 'tick_diario', hoy: '2026-06-08' })
    expect(r.estado.baseline.pasosDia).toBe(4600) // round(4000 × 1,15)
  })

  it('JAMÁS baja: con media por debajo no pasa nada (ni mensaje)', () => {
    let e = conPasos(estadoBase(), '2026-06-01', 7, 2000)
    const r = aplicar(e, { tipo: 'tick_diario', hoy: '2026-06-08' })
    expect(r.estado.baseline.pasosDia).toBe(4000)
    expect(r.estado.baseline.historial).toHaveLength(1)
    expect(r.estado.baseline.ultimaRecalibracion).toBe('2026-06-08') // la evaluación sí se apunta
    expect(r.resultados).toEqual([])
  })

  it('exige al menos 7 registros en los últimos 28 días', () => {
    let e = conPasos(estadoBase(), '2026-06-01', 5, 9000)
    const r = aplicar(e, { tipo: 'tick_diario', hoy: '2026-06-08' })
    expect(r.estado.baseline.pasosDia).toBe(4000)
    expect(r.estado.baseline.historial).toHaveLength(1)
  })

  it('los registros fuera de la ventana de 28 días no cuentan', () => {
    let e = conPasos(estadoBase('2026-01-01'), '2026-01-01', 7, 12000)
    const r = aplicar(e, { tipo: 'tick_diario', hoy: '2026-03-01' })
    expect(r.estado.baseline.pasosDia).toBe(4000)
  })

  it('recalibraciones sucesivas van componiendo, siempre hacia arriba', () => {
    let e = conPasos(estadoBase(), '2026-06-01', 7, 6000)
    e = aplicar(e, { tipo: 'tick_diario', hoy: '2026-06-08' }).estado // 4500
    e = conPasos(e, '2026-06-08', 7, 6000)
    e = aplicar(e, { tipo: 'tick_diario', hoy: '2026-06-15' }).estado
    // media de 14 registros de 6000 = 6000 → 4500 + round(0,25 × 1500) = 4875 ≤ tope 5175
    expect(e.baseline.pasosDia).toBe(4875)
    expect(e.baseline.historial.map((h) => h.pasosDia)).toEqual([4000, 4500, 4875])
    // Una mala racha después no revierte nada.
    e = conPasos(e, '2026-06-15', 7, 500)
    e = aplicar(e, { tipo: 'tick_diario', hoy: '2026-06-22' }).estado
    expect(e.baseline.pasosDia).toBe(4875)
  })
})
