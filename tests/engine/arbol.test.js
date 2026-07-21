import { describe, expect, it } from 'vitest'
import { ETAPAS_ARBOL, etapaArbol, siguienteEtapaArbol } from '../../src/data/arbol.js'
import { diasDeAccion } from '../../src/engine/arbol.js'
import { aplicar, crearEstadoInicial } from '../../src/engine/motor.js'

const RESPUESTAS = {
  apodo: 'Test',
  edad: 30,
  alturaCm: 175,
  pesoKg: 85,
  objetivo: 'ambos',
  experiencia: 'algo',
  pasosDia: 4500,
  diasEjercicioSemana: 2,
  diasPlanificados: [1, 3, 5],
  hoy: '2026-07-20',
}

describe('catálogo de etapas del árbol', () => {
  it('tiene 15 etapas con ids únicos y umbrales estrictamente crecientes', () => {
    expect(ETAPAS_ARBOL).toHaveLength(15)
    expect(new Set(ETAPAS_ARBOL.map((e) => e.id)).size).toBe(15)
    expect(ETAPAS_ARBOL[0].dias).toBe(0)
    for (let i = 1; i < ETAPAS_ARBOL.length; i++) {
      expect(ETAPAS_ARBOL[i].dias).toBeGreaterThan(ETAPAS_ARBOL[i - 1].dias)
    }
  })

  it('el ritmo es lento: la última etapa exige más de un año de días de acción', () => {
    expect(ETAPAS_ARBOL[ETAPAS_ARBOL.length - 1].dias).toBeGreaterThanOrEqual(450)
    expect(ETAPAS_ARBOL[ETAPAS_ARBOL.length - 2].dias).toBeGreaterThanOrEqual(365)
  })

  it('etapaArbol resuelve por umbral', () => {
    expect(etapaArbol(0).id).toBe('semilla')
    expect(etapaArbol(2).id).toBe('semilla')
    expect(etapaArbol(3).id).toBe('despertar')
    expect(etapaArbol(14).id).toBe('brote')
    expect(etapaArbol(364).id).toBe('venerable')
    expect(etapaArbol(365).id).toBe('heroe')
    expect(etapaArbol(9999).id).toBe('leyenda')
  })

  it('siguienteEtapaArbol devuelve la próxima o null en la cima', () => {
    expect(siguienteEtapaArbol(0).id).toBe('despertar')
    expect(siguienteEtapaArbol(449).id).toBe('leyenda')
    expect(siguienteEtapaArbol(450)).toBeNull()
  })
})

describe('diasDeAccion', () => {
  it('cuenta días únicos entre sesiones, pasos y pesos', () => {
    const e = crearEstadoInicial(RESPUESTAS) // día 1: peso inicial de 2026-07-20
    expect(diasDeAccion(e)).toBe(1)
    e.pasos.push({ fecha: '2026-07-20', pasos: 5000, fuente: 'manual' }) // mismo día
    expect(diasDeAccion(e)).toBe(1)
    e.pasos.push({ fecha: '2026-07-21', pasos: 5000, fuente: 'manual' })
    e.sesiones.push({ id: 's1', fecha: '2026-07-22', ejercicios: [] })
    expect(diasDeAccion(e)).toBe(3)
  })
})

describe('resultado arbol en aplicar', () => {
  it('emite arbol al cruzar umbral y no lo repite en el mismo día', () => {
    let e = crearEstadoInicial(RESPUESTAS) // 1 día de acción
    let r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-21', pasos: 5000, fuente: 'manual' })
    expect(r.resultados.find((x) => x.tipo === 'arbol')).toBeUndefined() // 2 días

    r = aplicar(r.estado, { tipo: 'peso', fecha: '2026-07-22', kg: 84.6 })
    const arbol = r.resultados.find((x) => x.tipo === 'arbol')
    expect(arbol).toBeDefined() // 3 días → despertar
    expect(arbol.etapa.id).toBe('despertar')
    expect(r.resultados[r.resultados.length - 1].tipo).toBe('arbol') // va el último

    // Reeditar el dato del mismo día no vuelve a anunciar etapa.
    const r2 = aplicar(r.estado, { tipo: 'peso', fecha: '2026-07-22', kg: 84.4 })
    expect(r2.resultados.find((x) => x.tipo === 'arbol')).toBeUndefined()
  })

  it('tick_diario nunca hace crecer el árbol', () => {
    const e = crearEstadoInicial(RESPUESTAS)
    const { resultados } = aplicar(e, { tipo: 'tick_diario', hoy: '2026-09-01' })
    expect(resultados).toHaveLength(0)
  })
})
