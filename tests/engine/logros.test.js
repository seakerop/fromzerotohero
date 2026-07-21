import { describe, it, expect } from 'vitest'
import { LOGROS, logroPorId } from '../../src/data/logros.js'
import { crearEstadoInicial, aplicar } from '../../src/engine/motor.js'
import { sumarDias } from '../../src/engine/fechas.js'

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

function idsDeLogros(resultados) {
  return resultados.filter((r) => r.tipo === 'logro').map((r) => r.logro.id)
}

describe('catálogo', () => {
  it('tiene los 15 logros del contrato con XP exacto', () => {
    const esperado = {
      primer_paso: 25, cruzar_umbral: 30, diez_pruebas: 50, veinticinco_batallas: 75,
      cincuenta_gestas: 150, primera_semana: 30, mes_camino: 100, mas_fuerte: 40,
      rompe_limites: 80, el_retorno: 60, imparable: 60, camino_diario: 50,
      el_espejo: 25, cronista: 50, hero: 200,
    }
    expect(LOGROS.map((l) => l.id)).toEqual(Object.keys(esperado))
    for (const l of LOGROS) {
      expect(l.xp).toBe(esperado[l.id])
      expect(l.nombre.length).toBeGreaterThan(2)
      expect(l.descripcion.length).toBeGreaterThan(10)
      expect(l.icono.length).toBeGreaterThan(0)
    }
    expect(logroPorId('el_retorno').descripcion).toBe(
      'Todos los héroes tropiezan. Volver es lo que te hace uno de ellos.'
    )
    expect(logroPorId('no-existe')).toBeNull()
  })
})

describe('el XP del logro va DENTRO del resultado logro', () => {
  it('primer_paso: un único resultado de tipo logro, sin resultado xp aparte', () => {
    const hoy = '2026-07-20'
    const inicial = crearEstadoInicial({
      apodo: 'Emilio', edad: 31, alturaCm: 178, pesoKg: 96.5, objetivo: 'ambos',
      experiencia: 'algo', pasosDia: 4000, diasEjercicioSemana: 2,
      diasPlanificados: [1, 3, 5], hoy,
    })
    expect(inicial.progreso.xp).toBe(0)
    expect(inicial.progreso.logros).toEqual({})
    const { estado, resultados } = aplicar(inicial, { tipo: 'perfil_creado', hoy })
    expect(resultados).toHaveLength(1)
    expect(resultados[0].tipo).toBe('logro')
    expect(resultados[0].logro.id).toBe('primer_paso')
    expect(resultados[0].logro.xp).toBe(25)
    expect(estado.progreso.xp).toBe(25) // sí suma al total
    expect(estado.progreso.logros.primer_paso).toBe(hoy)
    expect(estado.progreso.xpLog).toEqual([
      { fecha: hoy, cantidad: 25, motivo: 'Logro: El primer paso' },
    ])
  })

  it('cada logro se concede una sola vez', () => {
    let e = estadoBase()
    const r1 = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesionSimple() })
    expect(idsDeLogros(r1.resultados)).toContain('cruzar_umbral')
    const r2 = aplicar(r1.estado, { tipo: 'sesion_completada', hoy: '2026-07-22', sesion: sesionSimple() })
    expect(idsDeLogros(r2.resultados)).not.toContain('cruzar_umbral')
  })
})

describe('logros de sesiones', () => {
  it('diez_pruebas cae con la décima sesión', () => {
    let e = estadoBase()
    let ultimos = []
    for (let i = 0; i < 10; i++) {
      const r = aplicar(e, {
        tipo: 'sesion_completada',
        hoy: sumarDias('2026-07-20', i),
        sesion: sesionSimple(),
      })
      e = r.estado
      ultimos = idsDeLogros(r.resultados)
      if (i < 9) expect(ultimos).not.toContain('diez_pruebas')
    }
    expect(ultimos).toContain('diez_pruebas')
    expect(e.progreso.logros.diez_pruebas).toBeTruthy()
  })

  it('veinticinco_batallas y cincuenta_gestas dependen del contador', () => {
    const e = estadoBase()
    e.progreso.contadores.sesionesTotales = 50
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 100, fuente: 'manual' })
    const ids = idsDeLogros(r.resultados)
    expect(ids).toContain('veinticinco_batallas')
    expect(ids).toContain('cincuenta_gestas')
  })
})

describe('el_retorno: volver tras ≥7 días sin entrenar', () => {
  it('con 7 días vacíos entre sesiones se concede', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-01', sesion: sesionSimple() }).estado
    const r = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-09', sesion: sesionSimple() })
    expect(idsDeLogros(r.resultados)).toContain('el_retorno')
  })

  it('con solo 6 días vacíos no se concede', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-01', sesion: sesionSimple() }).estado
    const r = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-08', sesion: sesionSimple() })
    expect(idsDeLogros(r.resultados)).not.toContain('el_retorno')
  })

  it('requiere al menos una sesión previa: la primera sesión no es un retorno', () => {
    const r = aplicar(estadoBase(), {
      tipo: 'sesion_completada',
      hoy: '2026-07-20',
      sesion: sesionSimple(),
    })
    expect(idsDeLogros(r.resultados)).not.toContain('el_retorno')
  })
})

describe('imparable: racha de 10 días planificados', () => {
  it('cae al llegar la racha a 10', () => {
    let e = estadoBase('2026-07-20', { diasPlanificados: [1, 2, 3, 4, 5, 6, 7] })
    let ids = []
    for (let i = 0; i < 10; i++) {
      const r = aplicar(e, {
        tipo: 'sesion_completada',
        hoy: sumarDias('2026-07-20', i),
        sesion: sesionSimple(),
      })
      e = r.estado
      ids = idsDeLogros(r.resultados)
      if (i < 9) expect(ids).not.toContain('imparable')
    }
    expect(ids).toContain('imparable')
  })
})

describe('camino_diario: 7 días naturales seguidos con pasos ≥ baseline', () => {
  it('cae en el séptimo día consecutivo', () => {
    let e = estadoBase()
    let ids = []
    for (let i = 0; i < 7; i++) {
      const r = aplicar(e, {
        tipo: 'pasos',
        fecha: sumarDias('2026-07-20', i),
        pasos: 5000,
        fuente: 'manual',
      })
      e = r.estado
      ids = idsDeLogros(r.resultados)
      if (i < 6) expect(ids).not.toContain('camino_diario')
    }
    expect(ids).toContain('camino_diario')
  })

  it('un hueco reinicia la cuenta', () => {
    let e = estadoBase()
    for (let i = 0; i < 6; i++) {
      e = aplicar(e, {
        tipo: 'pasos', fecha: sumarDias('2026-07-01', i), pasos: 5000, fuente: 'manual',
      }).estado
    }
    // hueco el 7 de julio; tres días más por encima de la base
    for (let i = 0; i < 3; i++) {
      e = aplicar(e, {
        tipo: 'pasos', fecha: sumarDias('2026-07-08', i), pasos: 5000, fuente: 'manual',
      }).estado
    }
    expect(e.progreso.logros.camino_diario).toBeUndefined()
  })

  it('los días por debajo de la base no cuentan para la cadena', () => {
    let e = estadoBase()
    for (let i = 0; i < 7; i++) {
      e = aplicar(e, {
        tipo: 'pasos', fecha: sumarDias('2026-07-01', i), pasos: 1000, fuente: 'manual',
      }).estado
    }
    expect(e.progreso.logros.camino_diario).toBeUndefined()
  })
})

describe('cronista: 30 días distintos con algún registro', () => {
  it('cuenta sesiones, pasos y peso; cae en el día 30', () => {
    let e = estadoBase() // el peso inicial del onboarding ya marca el día 1
    let ids = []
    for (let i = 0; i < 29; i++) {
      const r = aplicar(e, {
        tipo: 'pasos',
        fecha: sumarDias('2026-07-21', i),
        pasos: 100,
        fuente: 'manual',
      })
      e = r.estado
      ids = idsDeLogros(r.resultados)
      if (i < 28) expect(ids).not.toContain('cronista')
    }
    expect(ids).toContain('cronista')
  })

  it('varios registros del mismo día cuentan como un solo día', () => {
    let e = estadoBase()
    e = aplicar(e, { tipo: 'pasos', fecha: '2026-07-20', pasos: 100, fuente: 'manual' }).estado
    e = aplicar(e, { tipo: 'peso', fecha: '2026-07-20', kg: 96 }).estado
    e = aplicar(e, { tipo: 'sesion_completada', hoy: '2026-07-20', sesion: sesionSimple() }).estado
    expect(e.progreso.logros.cronista).toBeUndefined()
  })
})

describe('mes_camino: 4 semanas perfectas ISO consecutivas', () => {
  it('cae con 4 claves consecutivas', () => {
    const e = estadoBase()
    e.progreso.contadores.semanasPerfectasClaves = ['2026-W27', '2026-W28', '2026-W29', '2026-W30']
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-26', pasos: 100, fuente: 'manual' })
    expect(idsDeLogros(r.resultados)).toContain('mes_camino')
  })

  it('cuenta bien al cruzar el año (2026 tiene 53 semanas)', () => {
    const e = estadoBase()
    e.progreso.contadores.semanasPerfectasClaves = ['2026-W52', '2026-W53', '2027-W01', '2027-W02']
    const r = aplicar(e, { tipo: 'pasos', fecha: '2027-01-15', pasos: 100, fuente: 'manual' })
    expect(idsDeLogros(r.resultados)).toContain('mes_camino')
  })

  it('semanas sueltas no lo activan', () => {
    const e = estadoBase()
    e.progreso.contadores.semanasPerfectasClaves = ['2026-W25', '2026-W27', '2026-W28', '2026-W29']
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-26', pasos: 100, fuente: 'manual' })
    expect(idsDeLogros(r.resultados)).not.toContain('mes_camino')
  })
})

describe('hero: alcanzar el nivel 25', () => {
  it('se concede al cruzar el umbral y encadena con el resultado de nivel', () => {
    const e = estadoBase()
    e.progreso.xp = 18400
    const r = aplicar(e, { tipo: 'pasos', fecha: '2026-07-21', pasos: 100, fuente: 'manual' })
    expect(idsDeLogros(r.resultados)).toContain('hero')
    const nivel = r.resultados.find((x) => x.tipo === 'nivel')
    expect(nivel.nivel).toBe(25)
    expect(nivel.etapa.id).toBe('hero')
    expect(r.estado.progreso.xp).toBe(18400 + 10 + 200)
  })
})
