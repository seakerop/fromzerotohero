// Nivel a partir del XP acumulado (CONTRACT.md §9).

import { XP_SUBIR, NIVEL_MAX } from '../data/niveles.js'
import { etapaDeNivel } from '../data/etapas.js'

export function nivelDesdeXp(xp) {
  let nivel = 1
  let restante = Math.max(0, xp)
  for (const coste of XP_SUBIR) {
    if (nivel >= NIVEL_MAX || restante < coste) break
    restante -= coste
    nivel += 1
  }
  const etapa = etapaDeNivel(nivel)
  if (nivel >= NIVEL_MAX) {
    return { nivel: NIVEL_MAX, etapa, xpEnNivel: restante, xpParaSubir: null, progreso: 1 }
  }
  const xpParaSubir = XP_SUBIR[nivel - 1]
  return { nivel, etapa, xpEnNivel: restante, xpParaSubir, progreso: restante / xpParaSubir }
}
