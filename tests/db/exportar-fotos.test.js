import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { exportarJSONConFotos, importarCopia, importarJSON } from '../../src/db/exportar.js'
import { cargarFoto, guardarFoto, restaurarFotos, serializarFotos } from '../../src/db/fotos.js'

const ESTADO_MINIMO = { perfil: { apodo: 'Zero' }, progreso: { xp: 5 } }

describe('fotos en la copia de seguridad', () => {
  it('serializa y restaura una foto conservando bytes, fecha y tipo', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 1, 2, 3, 250])
    const blob = new Blob([bytes], { type: 'image/png' })
    const id = await guardarFoto({ fecha: '2026-07-20', tipo: 'frente', blob })

    const serializadas = await serializarFotos([{ id, fecha: '2026-07-20', tipo: 'frente' }])
    expect(serializadas).toHaveLength(1)
    expect(serializadas[0].mime).toBe('image/png')

    const metadatos = await restaurarFotos(serializadas)
    expect(metadatos).toHaveLength(1)
    expect(metadatos[0].fecha).toBe('2026-07-20')
    const restaurada = await cargarFoto(metadatos[0].id)
    const vuelta = new Uint8Array(await restaurada.arrayBuffer())
    expect([...vuelta]).toEqual([...bytes])
  })

  it('exportarJSONConFotos + importarCopia hacen el viaje completo', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' })
    const id = await guardarFoto({ fecha: '2026-07-21', tipo: 'lado', blob })
    const serializadas = await serializarFotos([{ id, fecha: '2026-07-21', tipo: 'lado' }])

    const texto = exportarJSONConFotos(ESTADO_MINIMO, serializadas, '2026-07-21')
    const { estado, fotos } = importarCopia(texto)
    expect(estado.perfil.apodo).toBe('Zero')
    expect(estado.cuerpo.fotos).toEqual([]) // los metadatos definitivos los pone restaurarFotos
    expect(fotos).toHaveLength(1)
    expect(fotos[0].tipo).toBe('lado')
  })

  it('las copias antiguas (sin campo fotos) siguen entrando con fotos vacías', () => {
    const texto = JSON.stringify({ app: 'fzth', version: 1, exportadoEl: 'x', estado: ESTADO_MINIMO })
    const { estado, fotos } = importarCopia(texto)
    expect(estado.perfil.apodo).toBe('Zero')
    expect(fotos).toEqual([])
    expect(importarJSON(texto).perfil.apodo).toBe('Zero')
  })

  it('una foto corrupta se salta sin tumbar la restauración', async () => {
    const metadatos = await restaurarFotos([
      { fecha: '2026-07-22', tipo: 'frente', datos: '¡esto no es base64 válido!' },
    ])
    expect(metadatos).toEqual([])
  })
})
