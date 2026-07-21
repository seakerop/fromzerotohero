// Stats derivadas (CONTRACT.md §10): 5 a 99, recalculadas siempre desde
// perfil + baseline + contadores. Nada se almacena aparte.

const FUERZA_INICIAL = { ninguna: 5, algo: 12, habitual: 20 }

function resistenciaInicial(pasosDia) {
  if (pasosDia < 3000) return 5
  if (pasosDia < 6000) return 10
  if (pasosDia < 10000) return 16
  return 22
}

function constanciaInicial(diasSemana) {
  if (diasSemana <= 0) return 5
  if (diasSemana <= 2) return 10
  if (diasSemana <= 4) return 16
  return 22
}

export function statsActuales(estado) {
  const { perfil, baseline, progreso } = estado
  const c = progreso.contadores
  // Los pasos del onboarding son la primera entrada del historial del baseline.
  const pasos0 = baseline.historial?.[0]?.pasosDia ?? baseline.pasosDia
  const fuerza0 = FUERZA_INICIAL[perfil.experiencia] ?? 5

  const fuerza = Math.min(99, fuerza0 + Math.floor(c.sesionesTotales / 2) + c.prsTotales)
  const resistencia = Math.min(
    99,
    resistenciaInicial(pasos0) + Math.floor(c.diasPasosSobreBaseline / 5)
  )
  const constancia = Math.min(
    99,
    constanciaInicial(baseline.diasEjercicioSemana) +
      c.semanasPerfectasClaves.length +
      Math.floor(progreso.rachaMejor / 7)
  )
  return { fuerza, resistencia, constancia }
}
