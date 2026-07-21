import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { borrarFoto, cargarFoto, guardarFoto } from '../../src/db/fotos.js'

describe('fotos', () => {
  it('roundtrip: guardarFoto devuelve un id y cargarFoto recupera el blob', async () => {
    const blob = new Blob(['contenido de la foto'], { type: 'text/plain' })
    const id = await guardarFoto({ fecha: '2026-07-20', tipo: 'frente', blob })
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    const cargado = await cargarFoto(id)
    expect(cargado).not.toBeNull()
    expect(await cargado.text()).toBe('contenido de la foto')
  })

  it('cada foto recibe un id distinto', async () => {
    const a = await guardarFoto({ fecha: '2026-07-20', tipo: 'frente', blob: new Blob(['a']) })
    const b = await guardarFoto({ fecha: '2026-07-20', tipo: 'lado', blob: new Blob(['b']) })
    expect(a).not.toBe(b)
    expect(await (await cargarFoto(a)).text()).toBe('a')
    expect(await (await cargarFoto(b)).text()).toBe('b')
  })

  it('cargarFoto devuelve null si el id no existe', async () => {
    expect(await cargarFoto('no-existe')).toBeNull()
  })

  it('borrarFoto elimina el blob', async () => {
    const id = await guardarFoto({ fecha: '2026-07-20', tipo: 'espalda', blob: new Blob(['adiós']) })
    expect(await cargarFoto(id)).not.toBeNull()
    await borrarFoto(id)
    expect(await cargarFoto(id)).toBeNull()
  })

  it('borrarFoto con un id inexistente no lanza', async () => {
    await expect(borrarFoto('fantasma')).resolves.toBeUndefined()
  })
})
