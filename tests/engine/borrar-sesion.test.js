import { describe, expect, it } from 'vitest'
import { aplicar, borrarSesion, crearEstadoInicial } from '../../src/engine/motor.js'

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

function estadoConSesion() {
  const inicial = crearEstadoInicial(RESPUESTAS)
  const { estado } = aplicar(inicial, {
    tipo: 'sesion_completada',
    hoy: '2026-07-20',
    sesion: {
      fecha: '2026-07-20',
      rutinaId: null,
      diaId: null,
      nombreDia: 'Entreno libre',
      iniciadaEn: 1000,
      duracionSeg: 1800,
      ejercicios: [
        { ejercicioId: 'press-banca', series: [{ pesoKg: 40, reps: 8, hecha: true }, { pesoKg: 40, reps: 8, hecha: true }] },
      ],
    },
  })
  return estado
}

describe('borrarSesion', () => {
  it('quita la sesión, resta su XP y decrementa contadores; los logros se quedan', () => {
    const e = estadoConSesion()
    const sesion = e.sesiones[0]
    expect(e.progreso.contadores.sesionesTotales).toBe(1)
    expect(e.progreso.logros.cruzar_umbral).toBeTruthy()

    const despues = borrarSesion(e, sesion.id)
    expect(despues.sesiones).toHaveLength(0)
    expect(despues.progreso.contadores.sesionesTotales).toBe(0)
    expect(despues.progreso.xp).toBe(e.progreso.xp - sesion.xpGanado)
    // Lo celebrado no se descelebra: sin castigos retroactivos.
    expect(despues.progreso.logros.cruzar_umbral).toBeTruthy()
    expect(despues.progreso.rachaMejor).toBe(e.progreso.rachaMejor)
  })

  it('nunca deja el XP ni los contadores por debajo de 0', () => {
    const e = estadoConSesion()
    const sesion = e.sesiones[0]
    e.progreso.xp = 10 // menos que el XP de la sesión
    const despues = borrarSesion(e, sesion.id)
    expect(despues.progreso.xp).toBe(0)
    expect(despues.progreso.contadores.prsTotales).toBe(0)
  })

  it('con un id inexistente devuelve el estado intacto y no muta la entrada', () => {
    const e = estadoConSesion()
    const copia = structuredClone(e)
    const despues = borrarSesion(e, 'no-existe')
    expect(despues.sesiones).toHaveLength(1)
    expect(e).toEqual(copia)
  })
})
