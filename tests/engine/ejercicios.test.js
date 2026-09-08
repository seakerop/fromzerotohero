import { describe, expect, it } from 'vitest'
import { EJERCICIOS_SEED, EQUIPAMIENTO, GRUPOS } from '../../src/data/ejercicios.js'
import { FICHAS_EJERCICIOS } from '../../src/data/fichas-ejercicios.js'
import { PROMPTS } from '../../scripts/prompts-imagenes.mjs'

// Guardián de coherencia del catálogo: cada ejercicio del seed debe tener
// grupo y equipo válidos, ficha de técnica y prompt de dibujo — y viceversa.
describe('catálogo de ejercicios', () => {
  const idsSeed = new Set(EJERCICIOS_SEED.map((e) => e.id))
  const grupos = new Set(GRUPOS.map((g) => g.id))
  const equipos = new Set(EQUIPAMIENTO.map((e) => e.id))
  const medidas = new Set(['peso_reps', 'reps', 'tiempo'])

  it('ids únicos y campos válidos en todo el seed', () => {
    expect(idsSeed.size).toBe(EJERCICIOS_SEED.length)
    for (const e of EJERCICIOS_SEED) {
      expect(grupos.has(e.grupo), `${e.id} → grupo ${e.grupo}`).toBe(true)
      expect(equipos.has(e.equipo), `${e.id} → equipo ${e.equipo}`).toBe(true)
      expect(medidas.has(e.medida), `${e.id} → medida ${e.medida}`).toBe(true)
      expect(e.personalizado).toBe(false)
    }
  })

  it('todo ejercicio del seed tiene ficha de técnica completa', () => {
    for (const e of EJERCICIOS_SEED) {
      const ficha = FICHAS_EJERCICIOS[e.id]
      expect(ficha, `falta ficha de ${e.id}`).toBeTruthy()
      expect(ficha.musculos.length).toBeGreaterThan(3)
      expect(ficha.claves.length).toBeGreaterThanOrEqual(2)
      expect(ficha.error.length).toBeGreaterThan(10)
    }
  })

  it('fichas y prompts de dibujo no tienen huérfanos y cubren el seed', () => {
    for (const id of Object.keys(FICHAS_EJERCICIOS)) {
      expect(idsSeed.has(id), `ficha huérfana: ${id}`).toBe(true)
    }
    const idsPrompts = new Set(PROMPTS.map((p) => p.id))
    expect(idsPrompts.size).toBe(PROMPTS.length)
    for (const e of EJERCICIOS_SEED) {
      expect(idsPrompts.has(e.id), `falta prompt de dibujo de ${e.id}`).toBe(true)
    }
    for (const id of idsPrompts) {
      expect(idsSeed.has(id), `prompt huérfano: ${id}`).toBe(true)
    }
  })
})
