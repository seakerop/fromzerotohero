// Regla de fusión de los pasos que llegan solos (Apple Salud / Health
// Connect). Pura y testeable: la lectura del móvil vive en src/salud/.

// Si la sincronización se repite varias veces al día, solo actualiza cuando
// el dato cambia, y nunca pisa un registro manual que ya sea mayor (por
// ejemplo, si dejaste el móvil en casa y apuntaste los pasos del reloj).
export function debeImportarPasos(registroExistente, pasos) {
  if (!Number.isFinite(pasos) || pasos <= 0) return false
  if (!registroExistente) return true
  if (registroExistente.fuente === 'auto') return pasos !== registroExistente.pasos
  return pasos > registroExistente.pasos
}
