import { describe, expect, it } from 'vitest'
import { recalibrarBaseline } from '../../src/engine/baseline.js'
import { xpBonusPasos } from '../../src/engine/xp.js'

// Fijaciones de la review 2026-07-28: el motor debe tolerar estados
// migrados/importados parciales sin reventar ni regalar XP.

describe('robustez ante estados migrados o parciales', () => {
  it('recalibrarBaseline con ultimaRecalibracion null se autorrepara sin lanzar', () => {
    const estado = {
      baseline: { pasosDia: 4000, historial: [], ultimaRecalibracion: null },
      pasos: [],
    }
    const salida = recalibrarBaseline(estado, '2026-07-29')
    expect(salida.baseline.ultimaRecalibracion).toBe('2026-07-29')
    expect(salida.baseline.pasosDia).toBe(4000)
  })

  it('sin baseline real (0) no hay bonus de pasos: superar cero no es superar nada', () => {
    expect(xpBonusPasos(0, 0)).toBe(0)
    expect(xpBonusPasos(12000, 0)).toBe(0)
    expect(xpBonusPasos(12000, null)).toBe(0)
    expect(xpBonusPasos(6000, 4000)).toBe(25)
    expect(xpBonusPasos(4500, 4000)).toBe(15)
  })
})
