import { describe, expect, it } from 'vitest'
import { debeImportarPasos } from '../../src/engine/pasosAuto.js'

describe('pasos que llegan de Salud', () => {
  it('importa cuando no hay nada apuntado ese día', () => {
    expect(debeImportarPasos(null, 4200)).toBe(true)
    expect(debeImportarPasos(undefined, 4200)).toBe(true)
  })

  it('ignora recuentos imposibles', () => {
    expect(debeImportarPasos(null, 0)).toBe(false)
    expect(debeImportarPasos(null, -5)).toBe(false)
    expect(debeImportarPasos(null, NaN)).toBe(false)
  })

  it('actualiza lo que ya vino de Salud solo si cambia', () => {
    expect(debeImportarPasos({ pasos: 7000, fuente: 'auto' }, 7000)).toBe(false)
    expect(debeImportarPasos({ pasos: 7000, fuente: 'auto' }, 7400)).toBe(true)
    expect(debeImportarPasos({ pasos: 7000, fuente: 'auto' }, 6800)).toBe(true)
  })

  it('respeta un registro manual mayor y mejora uno menor', () => {
    expect(debeImportarPasos({ pasos: 9000, fuente: 'manual' }, 7000)).toBe(false)
    expect(debeImportarPasos({ pasos: 5000, fuente: 'manual' }, 7000)).toBe(true)
  })
})
