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

// Vacía el store completo: al importar una copia se reemplaza TODO el estado,
// así que los blobs anteriores quedarían huérfanos ocupando sitio para siempre.
export async function borrarTodasLasFotos() {
  await enTransaccion(STORE_FOTOS, 'readwrite', (store) => store.clear())
}

// --- Fotos en la copia de seguridad (base64) ---
// Antes el export las excluía y cambiar de móvil las perdía para siempre.

const TROZO = 0x8000

export async function serializarFotos(metadatos) {
  const salida = []
  for (const m of metadatos || []) {
    const blob = await cargarFoto(m.id)
    if (!blob) continue
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let bin = ''
    for (let i = 0; i < bytes.length; i += TROZO) {
      bin += String.fromCharCode(...bytes.subarray(i, i + TROZO))
    }
    salida.push({ id: m.id, fecha: m.fecha, tipo: m.tipo, mime: blob.type || 'image/jpeg', datos: btoa(bin) })
  }
  return salida
}

// Restaura las fotos de una copia y devuelve los metadatos con sus ids nuevos
// (para escribirlos en estado.cuerpo.fotos).
export async function restaurarFotos(serializadas) {
  const metadatos = []
  for (const f of serializadas || []) {
    if (!f || typeof f.datos !== 'string' || !f.fecha) continue
    let bytes
    try {
      const bin = atob(f.datos)
      bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    } catch {
      continue // una foto corrupta no tumba el import
    }
    const blob = new Blob([bytes], { type: f.mime || 'image/jpeg' })
    const id = await guardarFoto({ fecha: f.fecha, tipo: f.tipo || 'frente', blob })
    metadatos.push({ id, fecha: f.fecha, tipo: f.tipo || 'frente' })
  }
  return metadatos
}
