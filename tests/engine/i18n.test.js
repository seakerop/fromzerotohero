import { describe, expect, it } from 'vitest'
import { EJERCICIOS_SEED, EQUIPAMIENTO, GRUPOS } from '../../src/data/ejercicios.js'
import { FICHAS_EJERCICIOS } from '../../src/data/fichas-ejercicios.js'
import { LOGROS } from '../../src/data/logros.js'
import { ETAPAS } from '../../src/data/etapas.js'
import { ETAPAS_ARBOL } from '../../src/data/arbol.js'
import { PLANTILLAS, GUIA_NOVATO, EQUIPOS } from '../../src/data/plantillas-rutinas.js'
import { SUPLEMENTOS } from '../../src/data/suplementos.js'
import { MOMENTOS_ARBOL, MENSAJES_ESTACION } from '../../src/components/Avatar.jsx'
import { EQUIPAMIENTO_EN, EQUIPOS_EN, GRUPOS_EN, NOMBRES_EN } from '../../src/i18n/en/ejercicios.en.js'
import { FICHAS_EN_A } from '../../src/i18n/en/fichas-a.en.js'
import { FICHAS_EN_B } from '../../src/i18n/en/fichas-b.en.js'
import { ETAPAS_EN, GUIA_NOVATO_EN, LOGROS_EN } from '../../src/i18n/en/logros-etapas.en.js'
import { ETAPAS_ARBOL_EN, MENSAJES_ESTACION_EN, MOMENTOS_EN } from '../../src/i18n/en/arbol.en.js'
import { PLANTILLAS_EN } from '../../src/i18n/en/plantillas.en.js'
import { SUPLEMENTOS_EN } from '../../src/i18n/en/suplementos.en.js'

const FICHAS_EN = { ...FICHAS_EN_A, ...FICHAS_EN_B }

// Guardián del inglés: el español es el canon y el inglés lo cubre ENTERO.
// Si mañana entra un ejercicio/logro/momento sin traducción, esto grita.
describe('cobertura del catálogo en inglés', () => {
  it('todo ejercicio del seed tiene nombre y ficha en inglés', () => {
    for (const e of EJERCICIOS_SEED) {
      expect(NOMBRES_EN[e.id], `nombre EN de ${e.id}`).toBeTruthy()
      const ficha = FICHAS_EN[e.id]
      expect(ficha, `ficha EN de ${e.id}`).toBeTruthy()
      expect(ficha.claves.length, `claves EN de ${e.id}`).toBe(FICHAS_EJERCICIOS[e.id].claves.length)
      expect(ficha.error.length).toBeGreaterThan(5)
    }
    for (const id of Object.keys(NOMBRES_EN)) {
      expect(EJERCICIOS_SEED.some((e) => e.id === id), `nombre EN huérfano: ${id}`).toBe(true)
    }
    for (const g of GRUPOS) expect(GRUPOS_EN[g.id], `grupo EN ${g.id}`).toBeTruthy()
    for (const e of EQUIPAMIENTO) expect(EQUIPAMIENTO_EN[e.id], `equipamiento EN ${e.id}`).toBeTruthy()
    for (const [id] of EQUIPOS) expect(EQUIPOS_EN[id], `equipo EN ${id}`).toBeTruthy()
  })

  it('logros, etapas y guía cubiertos', () => {
    for (const l of LOGROS) {
      expect(LOGROS_EN[l.id], `logro EN ${l.id}`).toBeTruthy()
      expect(LOGROS_EN[l.id].nombre.length).toBeGreaterThan(2)
      expect(LOGROS_EN[l.id].descripcion.length).toBeGreaterThan(10)
    }
    for (const e of ETAPAS) {
      expect(ETAPAS_EN[e.id], `etapa EN ${e.id}`).toBeTruthy()
      expect(ETAPAS_EN[e.id].lema.length).toBeGreaterThan(5)
    }
    expect(GUIA_NOVATO_EN.length).toBe(GUIA_NOVATO.length)
  })

  it('el árbol entero susurra en inglés', () => {
    for (const e of ETAPAS_ARBOL) expect(ETAPAS_ARBOL_EN[e.id], `etapa árbol EN ${e.id}`).toBeTruthy()
    for (const m of MOMENTOS_ARBOL) {
      const trad = MOMENTOS_EN[m.dia]
      expect(trad, `momento EN día ${m.dia}`).toBeTruthy()
      expect(trad.mensaje.length).toBeGreaterThan(5)
      expect(trad.etiqueta.length).toBeGreaterThan(2)
    }
    for (const estacion of Object.keys(MENSAJES_ESTACION)) {
      expect(MENSAJES_ESTACION_EN[estacion], `estación EN ${estacion}`).toBeTruthy()
    }
  })

  it('plantillas y suplementos cubiertos', () => {
    for (const p of PLANTILLAS) {
      const trad = PLANTILLAS_EN[p.id]
      expect(trad, `plantilla EN ${p.id}`).toBeTruthy()
      expect(trad.dias.length, `días EN de ${p.id}`).toBe(p.dias.length)
      expect(trad.porQue.length).toBeGreaterThan(40)
    }
    for (const s of SUPLEMENTOS) {
      const trad = SUPLEMENTOS_EN[s.id]
      expect(trad, `suplemento EN ${s.id}`).toBeTruthy()
      for (const campo of ['nombre', 'que', 'dosis', 'cuando', 'ojo']) {
        expect(typeof trad[campo], `${s.id}.${campo} EN`).toBe('string')
      }
    }
  })
})
