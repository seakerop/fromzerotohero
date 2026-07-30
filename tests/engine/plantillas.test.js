import { describe, expect, it } from 'vitest'
import { EJERCICIOS_SEED } from '../../src/data/ejercicios.js'
import { GUIA_NOVATO, PLANTILLAS, plantillasPorDias } from '../../src/data/plantillas-rutinas.js'

describe('plantillas de rutinas para novatos', () => {
  it('todos los ejercicios de todas las plantillas existen en el seed', () => {
    const ids = new Set(EJERCICIOS_SEED.map((e) => e.id))
    for (const p of PLANTILLAS) {
      for (const dia of p.dias) {
        for (const ej of dia.ejercicios) {
          expect(ids.has(ej.ejercicioId), `${p.id} → ${ej.ejercicioId}`).toBe(true)
        }
      }
    }
  })

  it('hay al menos 2 opciones por cada frecuencia de 2 a 5 días', () => {
    for (const dias of [2, 3, 4, 5]) {
      const opciones = plantillasPorDias(dias)
      expect(opciones.length).toBeGreaterThanOrEqual(2)
      for (const p of opciones) expect(p.dias.length).toBe(dias)
    }
  })

  it('cada plantilla trae explicación, consejo y objetivos completos', () => {
    for (const p of PLANTILLAS) {
      expect(p.porQue.length).toBeGreaterThan(40)
      expect(p.consejo.length).toBeGreaterThan(10)
      for (const dia of p.dias) {
        expect(dia.ejercicios.length).toBeGreaterThanOrEqual(4)
        for (const ej of dia.ejercicios) {
          expect(ej.seriesObjetivo).toBeGreaterThanOrEqual(2)
          expect(ej.repsObjetivo).toBeGreaterThanOrEqual(1)
        }
      }
    }
    expect(GUIA_NOVATO.length).toBeGreaterThanOrEqual(4)
  })
})
