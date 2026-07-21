import { describe, it, expect } from 'vitest'
import { crearEstadoInicial, aplicar, calcularRacha } from '../../src/engine/motor.js'

// Julio de 2026: lunes 20, miércoles 22, viernes 24, lunes 27.

function estadoBase(hoy = '2026-07-20', extra = {}) {
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
    ...extra,
  })
  return aplicar(inicial, { tipo: 'perfil_creado', hoy }).estado
}

function sesionSimple() {
  return {
    rutinaId: null,
    diaId: null,
    nombreDia: 'Entreno libre',
    iniciadaEn: 1780000000000,
    duracionSeg: 1800,
    ejercicios: [
      { ejercicioId: 'press-banca', series: [{ pesoKg: 60, reps: 8, hecha: true }] },
    ],
  }
}

function conSesiones(fechas, extra = {}) {
  let e = estadoBase('2026-07-20', extra)
  for (const hoy of fechas) {
    e = aplicar(e, { tipo: 'sesion_completada', hoy, sesion: sesionSimple() }).estado
  }
  return e
}

describe('calcularRacha', () => {
  it('sin sesiones la racha es 0', () => {
    expect(calcularRacha(estadoBase(), '2026-07-20')).toBe(0)
  })

  it('sin días planificados la racha es 0 aunque haya sesiones', () => {
    const e = conSesiones(['2026-07-20', '2026-07-22'])
    e.ajustes.diasPlanificados = []
    expect(calcularRacha(e, '2026-07-22')).toBe(0)
  })

  it('cuenta los días planificados cumplidos', () => {
    const e = conSesiones(['2026-07-20', '2026-07-22'])
    expect(calcularRacha(e, '2026-07-22')).toBe(2)
  })

  it('el día en curso planificado y sin sesión aún NO rompe', () => {
    const e = conSesiones(['2026-07-20', '2026-07-22'])
    expect(calcularRacha(e, '2026-07-24')).toBe(2) // viernes en curso, se salta
  })

  it('descansar (días no planificados) no rompe', () => {
    const e = conSesiones(['2026-07-20', '2026-07-22', '2026-07-24'])
    expect(calcularRacha(e, '2026-07-26')).toBe(3) // fin de semana neutro
    expect(calcularRacha(e, '2026-07-27')).toBe(3) // lunes en curso sin sesión aún
  })

  it('el primer día planificado pasado sin sesión corta la cuenta', () => {
    const e = conSesiones(['2026-07-20', '2026-07-22'])
    expect(calcularRacha(e, '2026-07-25')).toBe(0) // el viernes 24 quedó vacío
  })

  it('se puede romper y rehacer', () => {
    const e = conSesiones(['2026-07-20', '2026-07-24']) // miércoles 22 perdido
    expect(calcularRacha(e, '2026-07-24')).toBe(1)
  })

  it('cambiar diasPlanificados recalcula la racha', () => {
    const e = conSesiones(['2026-07-20', '2026-07-22'])
    e.ajustes.diasPlanificados = [2, 4] // martes y jueves
    expect(calcularRacha(e, '2026-07-24')).toBe(0) // el jueves 23 quedó vacío
  })

  it('la racha cruza semanas', () => {
    const e = conSesiones(['2026-07-20', '2026-07-22', '2026-07-24', '2026-07-27'])
    expect(calcularRacha(e, '2026-07-27')).toBe(4)
  })
})

describe('racha al completar sesión (vía aplicar)', () => {
  it('emite resultado racha solo si creció, y va el último', () => {
    let e = estadoBase()
    const r1 = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesionSimple() })
    const racha1 = r1.resultados.find((r) => r.tipo === 'racha')
    expect(racha1).toEqual({ tipo: 'racha', dias: 1 })
    expect(r1.resultados[r1.resultados.length - 1].tipo).toBe('racha')
  })

  it('una sesión en día no planificado no emite resultado racha', () => {
    const e = estadoBase()
    const r = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-21', sesion: sesionSimple() })
    expect(r.resultados.some((x) => x.tipo === 'racha')).toBe(false)
  })

  it('rachaMejor guarda el máximo histórico y no baja al romperse la racha', () => {
    let e = conSesiones(['2026-07-20', '2026-07-22', '2026-07-24'])
    expect(e.progreso.rachaMejor).toBe(3)
    // Se pierde el lunes 27; se vuelve el miércoles 29.
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-29', sesion: sesionSimple() }).estado
    expect(calcularRacha(e, '2026-07-29')).toBe(1)
    expect(e.progreso.rachaMejor).toBe(3)
  })
})
