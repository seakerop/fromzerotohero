import { describe, expect, it } from 'vitest'
import { aplicar, crearEstadoInicial } from '../../src/engine/motor.js'
import {
  estadoDeMeta,
  metaMasCercana,
  metasRecienCumplidas,
  nombreDeMeta,
  pesoReferencia,
} from '../../src/engine/metas.js'
import { ejerciciosDistintos, evaluarLogros, volumenTotal } from '../../src/engine/logros.js'

function estadoBase(hoy = '2026-07-20') {
  const inicial = crearEstadoInicial({
    apodo: 'Emilio', edad: 31, alturaCm: 178, pesoKg: 96.5, objetivo: 'ambos',
    experiencia: 'algo', pasosDia: 4000, diasEjercicioSemana: 2,
    diasPlanificados: [1, 3, 5], hoy,
  })
  return aplicar(inicial, { tipo: 'perfil_creado', hoy }).estado
}

function sesionCon(pesoKg, reps = 8, ejercicioId = 'press-banca') {
  return {
    rutinaId: null, diaId: null, nombreDia: 'Libre', iniciadaEn: 1780000000000,
    duracionSeg: 1800,
    ejercicios: [{ ejercicioId, series: [{ pesoKg, reps, hecha: true }] }],
  }
}

const metaMarca = (objetivo, inicial = 0) => ({
  id: 'm1', tipo: 'marca', ejercicioId: 'press-banca', objetivo, inicial,
  horizonte: 'medio', creadaEl: '2026-07-20', cumplidaEl: null,
})

describe('metas de marca en ejercicio', () => {
  it('mide contra el mejor peso levantado y calcula el porcentaje', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesionCon(60) }).estado
    const st = estadoDeMeta(e, metaMarca(100))
    expect(st.actual).toBe(60)
    expect(st.pct).toBe(60)
    expect(st.cumplida).toBe(false)
  })

  it('se cumple al alcanzar el objetivo y clava el 100%', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesionCon(100) }).estado
    const st = estadoDeMeta(e, metaMarca(100))
    expect(st.cumplida).toBe(true)
    expect(st.pct).toBe(100)
    expect(metasRecienCumplidas({ ...e, metas: [metaMarca(100)] })).toEqual(['m1'])
    expect(metasRecienCumplidas({ ...e, metas: [{ ...metaMarca(100), cumplidaEl: '2026-07-20' }] })).toEqual([])
  })

  it('sin historial no hay datos y el porcentaje respeta el punto de partida', () => {
    const e = estadoBase()
    expect(estadoDeMeta(e, metaMarca(100)).actual).toBe(null)
    let e2 = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesionCon(70) }).estado
    // meta creada cuando ya levantaba 60: de 60 a 100, ir por 70 es el 25 %
    expect(estadoDeMeta(e2, metaMarca(100, 60)).pct).toBe(25)
  })
})

describe('meta de peso corporal (informativa, media de 7)', () => {
  it('funciona hacia abajo y hacia arriba sin juicio', () => {
    const e = estadoBase()
    e.cuerpo.pesos = [{ fecha: '2026-07-20', kg: 96 }]
    expect(pesoReferencia(e)).toBe(96)
    const bajar = { id: 'p1', tipo: 'peso', objetivo: 90, inicial: 96, horizonte: 'largo', creadaEl: '2026-07-20', cumplidaEl: null }
    expect(estadoDeMeta(e, bajar).pct).toBe(0)
    e.cuerpo.pesos = [{ fecha: '2026-07-20', kg: 93 }]
    expect(estadoDeMeta(e, bajar).pct).toBe(50)
    e.cuerpo.pesos = [{ fecha: '2026-07-20', kg: 89.5 }]
    expect(estadoDeMeta(e, bajar).cumplida).toBe(true)

    const subir = { ...bajar, id: 'p2', objetivo: 75, inicial: 70 }
    e.cuerpo.pesos = [{ fecha: '2026-07-20', kg: 72 }]
    expect(estadoDeMeta(e, subir).pct).toBe(40)
    expect(estadoDeMeta(e, subir).cumplida).toBe(false)
  })

  it('la media usa los últimos 7 registros', () => {
    const e = estadoBase()
    e.cuerpo.pesos = Array.from({ length: 10 }, (_, i) => ({ fecha: `2026-07-${10 + i}`, kg: i < 3 ? 100 : 91 }))
    expect(pesoReferencia(e)).toBe(91)
  })
})

describe('meta de sesiones y la más cercana', () => {
  it('cuenta sesiones totales desde el punto de partida', () => {
    let e = estadoBase()
    for (const dia of ['2026-07-20', '2026-07-22', '2026-07-24', '2026-07-27']) {
      e = aplicar(e, { tipo: 'sesion_completada', hoy: dia, sesion: sesionCon(40) }).estado
    }
    const meta = { id: 's1', tipo: 'sesiones', objetivo: 10, inicial: 0, horizonte: 'corto', creadaEl: '2026-07-20', cumplidaEl: null }
    expect(estadoDeMeta(e, meta)).toMatchObject({ actual: 4, pct: 40, cumplida: false })

    e.metas = [meta, metaMarca(41, 0)]
    expect(metaMasCercana(e).meta.id).toBe('m1') // 40/41 ≈ 97 % gana a 40 %
    expect(nombreDeMeta(e, meta)).toBe('10 sesiones totales')
    expect(nombreDeMeta(e, metaMarca(100))).toBe('Press banca a 100 kg')
  })
})

describe('logros nuevos (tanda 2)', () => {
  it('volumenTotal y ejerciciosDistintos solo cuentan series hechas', () => {
    const e = estadoBase()
    e.sesiones = [
      { fecha: '2026-07-20', ejercicios: [{ ejercicioId: 'press-banca', series: [{ pesoKg: 100, reps: 10, hecha: true }, { pesoKg: 100, reps: 10, hecha: false }] }] },
      { fecha: '2026-07-22', ejercicios: [{ ejercicioId: 'sentadilla', series: [{ pesoKg: 0, reps: 10, hecha: true }] }] },
    ]
    expect(volumenTotal(e)).toBe(1000)
    expect(ejerciciosDistintos(e)).toBe(2)
  })

  it('diez_toneladas, forjador, pacto_sellado y primera_meta se evalúan', () => {
    const e = estadoBase()
    e.sesiones = [{ fecha: '2026-07-20', ejercicios: [{ ejercicioId: 'peso-muerto', series: [{ pesoKg: 400, reps: 25, hecha: true }] }] }]
    expect(evaluarLogros(e)).toContain('diez_toneladas')
    expect(evaluarLogros(e)).not.toContain('cien_toneladas')

    e.ejercicios = [...e.ejercicios, { id: 'mi-ej', nombre: 'Mi ejercicio', grupo: 'core', medida: 'reps', personalizado: true }]
    e.pacto = { nombre: 'Javi', selladoEl: '2026-07-20' }
    e.metas = [{ ...metaMarca(50), cumplidaEl: '2026-07-21' }]
    const ids = evaluarLogros(e)
    expect(ids).toContain('forjador')
    expect(ids).toContain('pacto_sellado')
    expect(ids).toContain('primera_meta')
    expect(ids).not.toContain('cinco_metas')
  })

  it('el motor cobra primera_meta con el siguiente evento tras sellar la meta', () => {
    let e = estadoBase()
    e.metas = [{ ...metaMarca(50), cumplidaEl: '2026-07-21' }]
    const { estado, resultados } = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-21', sesion: sesionCon(50) })
    const logros = resultados.filter((r) => r.tipo === 'logro').map((r) => r.logro.id)
    expect(logros).toContain('primera_meta')
    expect(estado.progreso.logros.primera_meta).toBe('2026-07-21')
  })
})
