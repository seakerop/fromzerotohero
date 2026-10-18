// Trae a la app los pasos de hoy y de ayer desde Salud. Devuelve cuántos
// días ha actualizado. Fuera de la app nativa, o sin haber conectado Salud
// en Ajustes, no hace absolutamente nada.

import { claveDia, sumarDias } from '../engine/fechas.js'
import { debeImportarPasos } from '../engine/pasosAuto.js'
import { esNativo, pasosDelDia } from './salud.js'

export async function sincronizarPasosSalud(estado, aplicarEvento) {
  if (!esNativo() || !estado || !estado.perfil) return 0
  if (!estado.ajustes || estado.ajustes.saludConectada !== true) return 0
  const hoy = claveDia()
  let cambios = 0
  for (const fecha of [sumarDias(hoy, -1), hoy]) {
    let pasos = null
    try {
      pasos = await pasosDelDia(fecha)
    } catch {
      pasos = null // Salud puede negarse sin avisar: se deja como está
    }
    if (pasos == null) continue
    const existente = (estado.pasos || []).find((p) => p.fecha === fecha)
    if (!debeImportarPasos(existente, pasos)) continue
    aplicarEvento({ tipo: 'pasos', fecha, pasos, fuente: 'auto' })
    cambios += 1
  }
  return cambios
}
