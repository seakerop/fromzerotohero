import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { cargarEstado, guardarEstado, migrar } from '../../src/db/db.js'

function estadoCompleto() {
  return {
    version: 1,
    perfil: {
      apodo: 'Emilio', edad: 31, alturaCm: 178,
      objetivo: 'perder', experiencia: 'algo', creadoEl: '2026-07-20',
    },
    baseline: {
      pasosDia: 4000, diasEjercicioSemana: 2, pesoInicialKg: 96.5,
      historial: [{ fecha: '2026-07-20', pasosDia: 4000 }],
      ultimaRecalibracion: '2026-07-20',
    },
    ajustes: { diasPlanificados: [1, 3, 5], descansoSeg: 90 },
    progreso: {
      xp: 165,
      logros: { primer_paso: '2026-07-20' },
      contadores: {
        sesionesTotales: 1, prsTotales: 0,
        diasPasosSobreBaseline: 2, semanasPerfectasClaves: [],
      },
      rachaMejor: 1,
      xpLog: [{ fecha: '2026-07-20', cantidad: 25, motivo: 'Personaje creado' }],
    },
    ejercicios: [
      { id: 'press-banca', nombre: 'Press banca', grupo: 'pecho', medida: 'peso_reps', personalizado: false },
    ],
    rutinas: [
      {
        id: 'r1', nombre: 'Torso / Pierna',
        dias: [{
          id: 'd1', nombre: 'Torso',
          ejercicios: [{ ejercicioId: 'press-banca', seriesObjetivo: 3, repsObjetivo: 8, pesoObjetivoKg: 60 }],
        }],
      },
    ],
    sesiones: [
      {
        id: 's1', fecha: '2026-07-20', rutinaId: 'r1', diaId: 'd1', nombreDia: 'Torso',
        iniciadaEn: 1789000000000, duracionSeg: 3120,
        ejercicios: [{ ejercicioId: 'press-banca', series: [{ pesoKg: 60, reps: 8 }] }],
        xpGanado: 110, prs: [],
      },
    ],
    sesionActiva: null,
    pasos: [{ fecha: '2026-07-20', pasos: 5200, fuente: 'manual' }],
    cuerpo: {
      pesos: [{ fecha: '2026-07-20', kg: 96.5 }],
      medidas: [{ fecha: '2026-07-20', cinturaCm: 104, pechoCm: null, brazoCm: null, musloCm: null, caderaCm: null }],
      fotos: [{ id: 'f1', fecha: '2026-07-20', tipo: 'frente' }],
    },
  }
}

describe('cargarEstado / guardarEstado', () => {
  it('devuelve null si nunca se guardó nada', async () => {
    expect(await cargarEstado()).toBeNull()
  })

  it('roundtrip: lo guardado se recupera idéntico', async () => {
    const estado = estadoCompleto()
    await guardarEstado(estado)
    expect(await cargarEstado()).toEqual(estadoCompleto())
  })

  it('guardar de nuevo sobrescribe la clave v1 (última gana)', async () => {
    const estado = estadoCompleto()
    estado.progreso.xp = 999
    await guardarEstado(estado)
    const cargado = await cargarEstado()
    expect(cargado.progreso.xp).toBe(999)
  })

  it('la sesión activa sobrevive al guardado (cerrar la app no la pierde)', async () => {
    const estado = estadoCompleto()
    estado.sesionActiva = {
      iniciadaEn: 1789000123456, rutinaId: 'r1', diaId: 'd1', nombreDia: 'Torso',
      ejercicios: [{ ejercicioId: 'press-banca', series: [{ pesoKg: 62.5, reps: 8, hecha: true }] }],
    }
    await guardarEstado(estado)
    const cargado = await cargarEstado()
    expect(cargado.sesionActiva).toEqual(estado.sesionActiva)
  })

  it('cargarEstado aplica migrar() a estados guardados parciales', async () => {
    await guardarEstado({ progreso: { xp: 42 } })
    const cargado = await cargarEstado()
    expect(cargado.progreso.xp).toBe(42)
    expect(cargado.progreso.contadores.sesionesTotales).toBe(0)
    expect(cargado.ajustes.descansoSeg).toBe(90)
    expect(cargado.sesiones).toEqual([])
  })
})

describe('migrar', () => {
  it('sobre {} devuelve todos los campos del modelo con defaults', () => {
    const estado = migrar({})
    expect(estado.version).toBe(1)
    expect(estado.perfil).toBeNull()
    expect(estado.baseline).toEqual({
      pasosDia: 4000, diasEjercicioSemana: 0, pesoInicialKg: null,
      historial: [], ultimaRecalibracion: null,
    })
    expect(estado.ajustes).toEqual({ diasPlanificados: [], descansoSeg: 90 })
    expect(estado.progreso).toEqual({
      xp: 0, logros: {},
      contadores: { sesionesTotales: 0, prsTotales: 0, diasPasosSobreBaseline: 0, semanasPerfectasClaves: [] },
      rachaMejor: 0, xpLog: [],
    })
    expect(estado.ejercicios).toEqual([])
    expect(estado.rutinas).toEqual([])
    expect(estado.sesiones).toEqual([])
    expect(estado.sesionActiva).toBeNull()
    expect(estado.pasos).toEqual([])
    expect(estado.cuerpo).toEqual({ pesos: [], medidas: [], fotos: [] })
  })

  it('un estado completo pasa intacto', () => {
    expect(migrar(estadoCompleto())).toEqual(estadoCompleto())
  })

  it('rellena defaults sobre un estado parcial sin destruir lo presente', () => {
    const estado = migrar({
      perfil: { apodo: 'Zero' },
      progreso: { xp: 500 },
      sesiones: estadoCompleto().sesiones,
      cuerpo: { pesos: [{ fecha: '2026-07-19', kg: 97 }] },
    })
    expect(estado.perfil.apodo).toBe('Zero')
    expect(estado.perfil.experiencia).toBe('ninguna')
    expect(estado.progreso.xp).toBe(500)
    expect(estado.progreso.contadores.prsTotales).toBe(0)
    expect(estado.sesiones).toHaveLength(1)
    expect(estado.cuerpo.pesos[0].kg).toBe(97)
    expect(estado.cuerpo.medidas).toEqual([])
    expect(estado.baseline.pasosDia).toBe(4000)
  })

  it('conserva campos desconocidos (extensión de versiones futuras)', () => {
    const estado = migrar({
      pulso: [{ fecha: '2026-07-20', ppm: 62 }],
      baseline: { pasosDia: 6000, fuentePasos: 'healthkit' },
      pasos: [{ fecha: '2026-07-20', pasos: 8000, fuente: 'healthkit' }],
    })
    expect(estado.pulso).toEqual([{ fecha: '2026-07-20', ppm: 62 }])
    expect(estado.baseline.fuentePasos).toBe('healthkit')
    expect(estado.baseline.pasosDia).toBe(6000)
    expect(estado.pasos[0].fuente).toBe('healthkit')
  })

  it('acepta cualquier cosa que no sea un objeto y devuelve el modelo entero', () => {
    for (const bruto of [null, undefined, 'texto', 7, ['lista']]) {
      const estado = migrar(bruto)
      expect(estado.version).toBe(1)
      expect(estado.perfil).toBeNull()
      expect(estado.cuerpo.fotos).toEqual([])
    }
  })

  it('no muta el objeto de entrada', () => {
    const bruto = { progreso: { xp: 10 }, perfil: { apodo: 'Zero' } }
    const copia = structuredClone(bruto)
    migrar(bruto)
    expect(bruto).toEqual(copia)
  })
})
