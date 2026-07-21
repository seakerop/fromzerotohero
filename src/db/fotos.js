// Fotos de progreso: los blobs viven en el store `fotos` de IndexedDB y el
// estado solo guarda metadatos { id, fecha, tipo } (CONTRACT.md §6).

import { enTransaccion } from './db.js'

const STORE_FOTOS = 'fotos'

function generarId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `foto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// Guarda el blob de una foto y devuelve el id para referenciarla en el estado.
export async function guardarFoto({ fecha, tipo, blob }) {
  const id = generarId()
  await enTransaccion(STORE_FOTOS, 'readwrite', (store) => store.put({ id, fecha, tipo, blob }))
  return id
}

// Recupera el blob de una foto, o null si no existe.
export async function cargarFoto(id) {
  const registro = await enTransaccion(STORE_FOTOS, 'readonly', (store) => store.get(id))
  return registro && registro.blob != null ? registro.blob : null
}

// Borra una foto. Si el id no existe, no pasa nada.
export async function borrarFoto(id) {
  await enTransaccion(STORE_FOTOS, 'readwrite', (store) => store.delete(id))
}
