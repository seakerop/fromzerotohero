import { describe, it, expect } from 'vitest'
import { XP_SUBIR, NIVEL_MAX } from '../../src/data/niveles.js'
import { ETAPAS, etapaDeNivel } from '../../src/data/etapas.js'
import { nivelDesdeXp } from '../../src/engine/niveles.js'

describe('tabla de niveles', () => {
  it('tiene 24 escalones y suma 18.410 hasta el nivel 25', () => {
    expect(XP_SUBIR).toHaveLength(24)
    expect(XP_SUBIR.reduce((a, b) => a + b, 0)).toBe(18410)
    expect(NIVEL_MAX).toBe(25)
  })

  it('coincide con la tabla literal del contrato en sus extremos', () => {
    expect(XP_SUBIR[0]).toBe(100)
    expect(XP_SUBIR[11]).toBe(465)
    expect(XP_SUBIR[23]).toBe(2490)
  })
})

describe('nivelDesdeXp', () => {
  it('con 0 XP: nivel 1, etapa zero, progreso 0', () => {
    const d = nivelDesdeXp(0)
    expect(d.nivel).toBe(1)
    expect(d.etapa.id).toBe('zero')
    expect(d.xpEnNivel).toBe(0)
    expect(d.xpParaSubir).toBe(100)
    expect(d.progreso).toBe(0)
  })

  it('justo bajo el umbral sigue en el nivel', () => {
    expect(nivelDesdeXp(99).nivel).toBe(1)
    expect(nivelDesdeXp(99).progreso).toBeCloseTo(0.99)
  })

  it('en el umbral exacto sube', () => {
    const d = nivelDesdeXp(100)
    expect(d.nivel).toBe(2)
    expect(d.etapa.id).toBe('llamada')
    expect(d.xpEnNivel).toBe(0)
    expect(d.xpParaSubir).toBe(115)
  })

  it('acumula bien varios niveles', () => {
    const d = nivelDesdeXp(214) // 100 + 114
    expect(d.nivel).toBe(2)
    expect(d.xpEnNivel).toBe(114)
    expect(nivelDesdeXp(495).nivel).toBe(5) // 100+115+130+150
    expect(nivelDesdeXp(495).etapa.id).toBe('umbral')
  })

  it('nivel 25 es el tope: xpParaSubir null, progreso 1, y el XP sigue acumulándose', () => {
    expect(nivelDesdeXp(18409).nivel).toBe(24)
    const tope = nivelDesdeXp(18410)
    expect(tope.nivel).toBe(25)
    expect(tope.etapa.id).toBe('hero')
    expect(tope.xpParaSubir).toBeNull()
    expect(tope.progreso).toBe(1)
    const pasado = nivelDesdeXp(20000)
    expect(pasado.nivel).toBe(25)
    expect(pasado.xpEnNivel).toBe(1590)
  })
})

describe('etapas del viaje del héroe', () => {
  it('cubren los 25 niveles sin huecos', () => {
    expect(ETAPAS).toHaveLength(7)
    for (let nivel = 1; nivel <= 25; nivel++) {
      expect(etapaDeNivel(nivel)).toBeTruthy()
    }
  })

  it('asigna la etapa correcta en los bordes', () => {
    expect(etapaDeNivel(1).id).toBe('zero')
    expect(etapaDeNivel(2).id).toBe('llamada')
    expect(etapaDeNivel(4).id).toBe('llamada')
    expect(etapaDeNivel(5).id).toBe('umbral')
    expect(etapaDeNivel(8).id).toBe('umbral')
    expect(etapaDeNivel(9).id).toBe('pruebas')
    expect(etapaDeNivel(13).id).toBe('pruebas')
    expect(etapaDeNivel(14).id).toBe('caverna')
    expect(etapaDeNivel(18).id).toBe('caverna')
    expect(etapaDeNivel(19).id).toBe('renacido')
    expect(etapaDeNivel(24).id).toBe('renacido')
    expect(etapaDeNivel(25).id).toBe('hero')
  })

  it('cada etapa lleva su lema', () => {
    for (const etapa of ETAPAS) {
      expect(etapa.lema.length).toBeGreaterThan(10)
    }
  })
})
