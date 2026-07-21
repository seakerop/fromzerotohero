import { describe, it, expect } from 'vitest'
import {
  claveDia,
  claveSemana,
  diaISO,
  diasEntre,
  sumarDias,
  formatearFecha,
} from '../../src/engine/fechas.js'

describe('claveDia (corte a las 04:00)', () => {
  it('una sesión a la 01:30 del martes cuenta como lunes', () => {
    expect(claveDia(new Date(2026, 6, 21, 1, 30))).toBe('2026-07-20')
  })

  it('a las 03:59 todavía es el día anterior', () => {
    expect(claveDia(new Date(2026, 6, 21, 3, 59))).toBe('2026-07-20')
  })

  it('a las 04:00 ya es el día nuevo', () => {
    expect(claveDia(new Date(2026, 6, 21, 4, 0))).toBe('2026-07-21')
  })

  it('mediodía es el día natural', () => {
    expect(claveDia(new Date(2026, 6, 21, 12, 0))).toBe('2026-07-21')
  })

  it('cruza el borde de año: 1 de enero a las 02:00 es 31 de diciembre', () => {
    expect(claveDia(new Date(2026, 0, 1, 2, 0))).toBe('2025-12-31')
  })
})

describe('claveSemana (semana ISO, lunes primer día)', () => {
  it('20 de julio de 2026 (lunes) es la semana 30', () => {
    expect(claveSemana('2026-07-20')).toBe('2026-W30')
  })

  it('toda la semana comparte clave', () => {
    expect(claveSemana('2026-07-26')).toBe('2026-W30') // domingo
    expect(claveSemana('2026-07-27')).toBe('2026-W31') // lunes siguiente
  })

  it('el 1 de enero de 2026 (jueves) es la W01 de 2026', () => {
    expect(claveSemana('2026-01-01')).toBe('2026-W01')
  })

  it('el 29 de diciembre de 2025 (lunes) ya pertenece a 2026-W01', () => {
    expect(claveSemana('2025-12-29')).toBe('2026-W01')
  })

  it('2026 tiene 53 semanas: el 31 de diciembre es 2026-W53', () => {
    expect(claveSemana('2026-12-31')).toBe('2026-W53')
  })

  it('el 1 de enero de 2027 (viernes) sigue en 2026-W53', () => {
    expect(claveSemana('2027-01-01')).toBe('2026-W53')
  })
})

describe('diaISO', () => {
  it('1 = lunes … 7 = domingo', () => {
    expect(diaISO('2026-07-20')).toBe(1)
    expect(diaISO('2026-07-23')).toBe(4)
    expect(diaISO('2026-07-26')).toBe(7)
  })
})

describe('diasEntre y sumarDias', () => {
  it('cuenta días con signo', () => {
    expect(diasEntre('2026-07-20', '2026-07-25')).toBe(5)
    expect(diasEntre('2026-07-25', '2026-07-20')).toBe(-5)
    expect(diasEntre('2026-07-20', '2026-07-20')).toBe(0)
  })

  it('atraviesa el cambio de hora sin desviarse (UTC interno)', () => {
    expect(diasEntre('2026-03-28', '2026-03-30')).toBe(2)
    expect(diasEntre('2026-10-24', '2026-10-26')).toBe(2)
  })

  it('sumarDias cruza mes y año', () => {
    expect(sumarDias('2026-07-31', 1)).toBe('2026-08-01')
    expect(sumarDias('2026-01-01', -1)).toBe('2025-12-31')
    expect(sumarDias('2026-07-20', 0)).toBe('2026-07-20')
    expect(sumarDias('2026-02-28', 1)).toBe('2026-03-01')
  })

  it('sumarDias y diasEntre son inversas', () => {
    const clave = '2026-07-20'
    expect(diasEntre(clave, sumarDias(clave, 45))).toBe(45)
  })
})

describe('formatearFecha', () => {
  it('formatea para UI en es-ES', () => {
    expect(formatearFecha('2026-07-21')).toBe('21 jul')
    expect(formatearFecha('2026-01-05')).toBe('5 ene')
    expect(formatearFecha('2026-12-31')).toBe('31 dic')
  })
})
