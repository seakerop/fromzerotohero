import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { borrarBaseDeDatos, cargarEstado, guardarEstado } from '../../src/db/db.js'

// Regresión del fallo de «Borrar todos los datos»: la conexión permanente
// bloqueaba deleteDatabase y el volcado al ocultar podía resucitar los datos.

describe('borrarBaseDeDatos', () => {
  it('borra de verdad aunque la conexión estuviera abierta, y deja el módulo inerte', async () => {
    await guardarEstado({ perfil: { apodo: 'Zero' }, progreso: { xp: 42 } })
    expect(await cargarEstado()).not.toBeNull()

    // No se cierra la conexión a mano: borrarBaseDeDatos debe encargarse.
    await borrarBaseDeDatos()

    // Tras el borrado no queda nada…
    expect(await cargarEstado()).toBeNull()

    // …y cualquier escritura tardía (p. ej. el volcado de pagehide) es inerte.
    await guardarEstado({ perfil: { apodo: 'Fantasma' } })
    expect(await cargarEstado()).toBeNull()
  })
})
