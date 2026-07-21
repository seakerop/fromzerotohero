import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { exportarJSON, importarJSON } from '../../src/db/exportar.js'
import { migrar } from '../../src/db/db.js'

function estadoCompleto() {
  return migrar({
    perfil: {
      apodo: 'Emilio', edad: 31, alturaCm: 178,
      objetivo: 'ambos', experiencia: 'algo', creadoEl: '2026-07-20',
    },
    baseline: {
      pasosDia: 4000, diasEjercicioSemana: 2, pesoInicialKg: 96.5,
      historial: [{ fecha: '2026-07-20', pasosDia: 4000 }],
      ultimaRecalibracion: '2026-07-20',
    },
    ajustes: { diasPlanificados: [1, 3, 5], descansoSeg: 90 },
    progreso: {
      xp: 165, logros: { primer_paso: '2026-07-20' },
      contadores: { sesionesTotales: 1, prsTotales: 0, diasPasosSobreBaseline: 2, semanasPerfectasClaves: [] },
      rachaMejor: 1,
      xpLog: [{ fecha: '2026-07-20', cantidad: 25, motivo: 'Personaje creado' }],
    },
    ejercicios: [{ id: 'press-banca', nombre: 'Press banca', grupo: 'pecho', medida: 'peso_reps', personalizado: false }],
    sesiones: [{
      id: 's1', fecha: '2026-07-20', rutinaId: null, diaId: null, nombreDia: 'Entreno libre',
      iniciadaEn: 1789000000000, duracionSeg: 1800,
      ejercicios: [{ ejercicioId: 'press-banca', series: [{ pesoKg: 60, reps: 8 }] }],
      xpGanado: 90, prs: [],
    }],
    pasos: [{ fecha: '2026-07-20', pasos: 5200, fuente: 'manual' }],
    cuerpo: {
      pesos: [{ fecha: '2026-07-20', kg: 96.5 }],
      medidas: [],
      fotos: [{ id: 'f1', fecha: '2026-07-20', tipo: 'frente' }],
    },
  })
}

describe('exportarJSON', () => {
  it('produce un JSON legible con el envoltorio {app, version, exportadoEl, estado}', () => {
    const texto = exportarJSON(estadoCompleto(), '2026-07-20T10:00:00.000Z')
    expect(texto).toContain('\n  ')
    const envoltorio = JSON.parse(texto)
    expect(envoltorio.app).toBe('fzth')
    expect(envoltorio.version).toBe(1)
    expect(envoltorio.exportadoEl).toBe('2026-07-20T10:00:00.000Z')
    expect(envoltorio.estado.perfil.apodo).toBe('Emilio')
  })

  it('usa el exportadoEl que pasa el caller', () => {
    const envoltorio = JSON.parse(exportarJSON(estadoCompleto(), '2026-07-20'))
    expect(envoltorio.exportadoEl).toBe('2026-07-20')
  })

  it('no incluye fotos (los blobs se quedan en el dispositivo)', () => {
    const estado = estadoCompleto()
    expect(estado.cuerpo.fotos).toHaveLength(1)
    const envoltorio = JSON.parse(exportarJSON(estado, '2026-07-20'))
    expect(envoltorio.estado.cuerpo.fotos).toEqual([])
    expect(JSON.parse(exportarJSON(estado, '2026-07-20')).estado.cuerpo.pesos).toHaveLength(1)
  })
})

describe('importarJSON', () => {
  it('roundtrip: exportar e importar conserva el estado (sin fotos)', () => {
    const estado = estadoCompleto()
    const importado = importarJSON(exportarJSON(estado, '2026-07-20'))
    expect(importado).toEqual({ ...estado, cuerpo: { ...estado.cuerpo, fotos: [] } })
  })

  it('migra estados parciales rellenando defaults', () => {
    const texto = JSON.stringify({ app: 'fzth', version: 1, exportadoEl: '2026-07-20', estado: { progreso: { xp: 9 } } })
    const importado = importarJSON(texto)
    expect(importado.progreso.xp).toBe(9)
    expect(importado.progreso.contadores.sesionesTotales).toBe(0)
    expect(importado.ejercicios).toEqual([])
    expect(importado.perfil).toBeNull()
  })

  it('texto que no es JSON lanza con mensaje claro en español', () => {
    expect(() => importarJSON('esto no es una copia')).toThrow(/JSON válido/)
  })

  it('JSON sin la marca de la app lanza', () => {
    expect(() => importarJSON('{}')).toThrow(/FromZeroToHero/)
    expect(() => importarJSON('[1,2,3]')).toThrow(/FromZeroToHero/)
    expect(() => importarJSON(JSON.stringify({ app: 'otra', version: 1, estado: {} }))).toThrow(/FromZeroToHero/)
  })

  it('versión desconocida lanza', () => {
    expect(() => importarJSON(JSON.stringify({ app: 'fzth', version: 99, estado: {} }))).toThrow(/versión/)
    expect(() => importarJSON(JSON.stringify({ app: 'fzth', estado: {} }))).toThrow(/versión/)
  })

  it('sin estado, o con estado que no es un objeto, lanza', () => {
    expect(() => importarJSON(JSON.stringify({ app: 'fzth', version: 1 }))).toThrow(/estado válido/)
    expect(() => importarJSON(JSON.stringify({ app: 'fzth', version: 1, estado: 'nada' }))).toThrow(/estado válido/)
  })

  it('colecciones con forma imposible lanzan (no se descartan en silencio)', () => {
    const conSesionesRotas = JSON.stringify({ app: 'fzth', version: 1, estado: { sesiones: 'rotas' } })
    expect(() => importarJSON(conSesionesRotas)).toThrow(/dañados.*sesiones/)
    const conPerfilRoto = JSON.stringify({ app: 'fzth', version: 1, estado: { perfil: 'Emilio' } })
    expect(() => importarJSON(conPerfilRoto)).toThrow(/dañados.*perfil/)
  })
})
