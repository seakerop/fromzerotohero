// Racha inteligente (CONTRACT.md §12): solo cuentan los días planificados;
// descansar no rompe. El día en curso sin sesión se salta (no rompe).

import { diaISO, sumarDias } from './fechas.js'

const LIMITE_BUSQUEDA_DIAS = 730

export function calcularRacha(estado, hoy) {
  const plan = estado.ajustes?.diasPlanificados || []
  if (plan.length === 0) return 0
  const fechasConSesion = new Set(estado.sesiones.map((s) => s.fecha))
  let racha = 0
  let clave = hoy
  for (let i = 0; i < LIMITE_BUSQUEDA_DIAS; i++) {
    if (plan.includes(diaISO(clave))) {
      if (fechasConSesion.has(clave)) {
        racha += 1
      } else if (clave !== hoy) {
        break // primer día planificado pasado sin sesión: corta la cuenta
      }
      // hoy planificado y aún sin sesión: se salta, no rompe
    }
    clave = sumarDias(clave, -1)
  }
  return racha
}
