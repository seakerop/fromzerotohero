import { describe, expect, it } from 'vitest'
import { recalibrarBaseline } from '../../src/engine/baseline.js'
import { META_PASOS_DEFECTO, metaPasosDe, tramosDePasos, xpPasosParcial } from '../../src/engine/xp.js'

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

  it('sin baseline utilizable la meta de pasos cae al valor por defecto', () => {
    expect(metaPasosDe({ baseline: { pasosDia: 0 }, ajustes: {} })).toBe(META_PASOS_DEFECTO)
    expect(metaPasosDe({ baseline: { pasosDia: null }, ajustes: {} })).toBe(META_PASOS_DEFECTO)
    expect(metaPasosDe({})).toBe(META_PASOS_DEFECTO)
    // Derivada del baseline (+25 %, redondeo a 500) y acotada entre 4k y 15k.
    expect(metaPasosDe({ baseline: { pasosDia: 4000 }, ajustes: {} })).toBe(5000)
    expect(metaPasosDe({ baseline: { pasosDia: 200 }, ajustes: {} })).toBe(4000)
    expect(metaPasosDe({ baseline: { pasosDia: 40000 }, ajustes: {} })).toBe(15000)
    // La meta propia manda; una basura en ajustes no rompe nada.
    expect(metaPasosDe({ baseline: { pasosDia: 4000 }, ajustes: { metaPasos: 12000 } })).toBe(12000)
    expect(metaPasosDe({ baseline: { pasosDia: 4000 }, ajustes: { metaPasos: 'mucho' } })).toBe(5000)
  })

  it('los pasos no pagan por valores imposibles', () => {
    expect(xpPasosParcial(0, 5000)).toBe(0)
    expect(xpPasosParcial(-500, 5000)).toBe(0)
    expect(xpPasosParcial(NaN, 5000)).toBe(0)
    expect(tramosDePasos(5000, 0)).toBe(2) // meta inválida → la de por defecto
  })
})
