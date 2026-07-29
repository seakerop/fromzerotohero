// Exportar e importar el estado como JSON (CONTRACT.md §6).
// Las fotos NO viajan en el archivo: sus blobs viven en IndexedDB y el export
// deja `cuerpo.fotos` vacío (la UI avisa de ello).

import { migrar } from './db.js'

function esObjeto(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

// Devuelve un JSON legible {app:'fzth', version, exportadoEl, estado}.
// `exportadoEl` lo pasa el caller; si no lo pasa, se usa el instante actual.
export function exportarJSON(estado, exportadoEl = new Date().toISOString()) {
  const limpio = migrar(estado)
  const sinFotos = { ...limpio, cuerpo: { ...limpio.cuerpo, fotos: [] } }
  return JSON.stringify(
    { app: 'fzth', version: sinFotos.version, exportadoEl, estado: sinFotos },
    null,
    2
  )
}

// Valida el texto de una copia y devuelve el estado ya migrado.
// Lanza Error con mensaje claro en español si el archivo no es válido.
export function importarJSON(texto) {
  let envoltorio
  try {
    envoltorio = JSON.parse(texto)
  } catch {
    throw new Error('El archivo no es un JSON válido. ¿Seguro que es una copia exportada desde la app?')
  }

  if (!esObjeto(envoltorio) || envoltorio.app !== 'fzth') {
    throw new Error('Este archivo no es una copia de FromZeroToHero: falta la marca de la app.')
  }
  if (envoltorio.version !== 1) {
    throw new Error('La copia usa una versión de datos que esta app no entiende (se esperaba la versión 1).')
  }
  if (!esObjeto(envoltorio.estado)) {
    throw new Error('La copia no contiene un estado válido.')
  }

  const bruto = envoltorio.estado
  for (const campo of ['ejercicios', 'rutinas', 'sesiones', 'pasos']) {
    if (bruto[campo] != null && !Array.isArray(bruto[campo])) {
      throw new Error(`Los datos de la copia están dañados: «${campo}» debería ser una lista.`)
    }
  }
  for (const campo of ['perfil', 'baseline', 'ajustes', 'progreso', 'cuerpo']) {
    if (bruto[campo] != null && !esObjeto(bruto[campo])) {
      throw new Error(`Los datos de la copia están dañados: «${campo}» no tiene la forma esperada.`)
    }
  }

  const estado = migrar(bruto)
  if (!estado.perfil || typeof estado.perfil.apodo !== 'string' || !estado.perfil.apodo.trim()) {
    throw new Error('La copia no contiene ningún personaje: falta el perfil del héroe.')
  }
  return estado
}

// Copia completa: igual que exportarJSON pero con las fotos serializadas en
// base64 (las prepara db/fotos.serializarFotos) en el campo `fotos`.
export function exportarJSONConFotos(estado, fotosSerializadas, exportadoEl = new Date().toISOString()) {
  const limpio = migrar(estado)
  const sinBlobs = { ...limpio, cuerpo: { ...limpio.cuerpo, fotos: [] } }
  // Sin sangrado: con fotos en base64 el pretty-print duplicaría megas en
  // memoria (y en disco) para nada.
  return JSON.stringify({
    app: 'fzth',
    version: sinBlobs.version,
    exportadoEl,
    estado: sinBlobs,
    fotos: fotosSerializadas,
  })
}

// Lee una copia y devuelve { estado, fotos }. Las copias antiguas (sin campo
// `fotos`) siguen siendo válidas: fotos = [].
export function importarCopia(texto) {
  const estado = importarJSON(texto)
  let fotos = []
  try {
    const envoltorio = JSON.parse(texto)
    if (Array.isArray(envoltorio.fotos)) {
      fotos = envoltorio.fotos.filter((f) => f && typeof f.datos === 'string' && f.fecha)
    }
  } catch {
    fotos = []
  }
  return { estado, fotos }
}
