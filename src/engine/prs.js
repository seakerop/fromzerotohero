// PRs y 1RM estimado (CONTRACT.md §13). Solo ejercicios 'peso_reps' generan
// PRs; la primera sesión de un ejercicio fija el listón y NO es PR.

// Epley: peso × (1 + reps/30), redondeado a 0,5 kg. Válido con 1 ≤ reps ≤ 12.
export function e1rm(pesoKg, reps) {
  if (!Number.isFinite(pesoKg) || !Number.isFinite(reps)) return null
  if (reps < 1 || reps > 12) return null
  return Math.round(pesoKg * (1 + reps / 30) * 2) / 2
}

export function formatearKg(kg) {
  return String(kg).replace('.', ',')
}

function mejoresHistoricos(sesiones, ejercicioId) {
  let mejorPesoKg = null
  let mejor1rmKg = null
  let vistas = 0
  for (const sesion of sesiones) {
    let aparece = false
    for (const ej of sesion.ejercicios) {
      if (ej.ejercicioId !== ejercicioId) continue
      aparece = true
      for (const serie of ej.series) {
        if (mejorPesoKg === null || serie.pesoKg > mejorPesoKg) mejorPesoKg = serie.pesoKg
        const r = e1rm(serie.pesoKg, serie.reps)
        if (r !== null && (mejor1rmKg === null || r > mejor1rmKg)) mejor1rmKg = r
      }
    }
    if (aparece) vistas += 1
  }
  return { mejorPesoKg, mejor1rmKg, vistas }
}

// Detecta los PRs de una sesión CONTRA el histórico previo (estado sin la
// sesión de hoy). Máx 1 PR por ejercicio. Devuelve, en el orden de la sesión:
// [{ ejercicioId, nombre, detalle }] con detalle tipo '62,5 kg × 5'.
export function detectarPRs(estado, ejerciciosSesion) {
  const prs = []
  const procesados = new Set()
  for (const ej of ejerciciosSesion) {
    if (procesados.has(ej.ejercicioId)) continue
    procesados.add(ej.ejercicioId)
    const def = estado.ejercicios.find((x) => x.id === ej.ejercicioId)
    if (!def || def.medida !== 'peso_reps') continue

    const historico = mejoresHistoricos(estado.sesiones, ej.ejercicioId)
    if (historico.vistas === 0) continue // primera sesión: fija el listón, no es PR

    // Series de hoy de este ejercicio (puede aparecer más de una vez).
    const seriesHoy = ejerciciosSesion
      .filter((x) => x.ejercicioId === ej.ejercicioId)
      .flatMap((x) => x.series)

    let seriePeso = null
    let serie1rm = null
    let mejor1rmHoy = null
    for (const serie of seriesHoy) {
      if (
        !seriePeso ||
        serie.pesoKg > seriePeso.pesoKg ||
        (serie.pesoKg === seriePeso.pesoKg && serie.reps > seriePeso.reps)
      ) {
        seriePeso = serie
      }
      const r = e1rm(serie.pesoKg, serie.reps)
      if (r !== null && (mejor1rmHoy === null || r > mejor1rmHoy)) {
        mejor1rmHoy = r
        serie1rm = serie
      }
    }

    const superaPeso =
      seriePeso !== null && historico.mejorPesoKg !== null && seriePeso.pesoKg > historico.mejorPesoKg
    const supera1rm =
      mejor1rmHoy !== null && historico.mejor1rmKg !== null && mejor1rmHoy > historico.mejor1rmKg
    if (!superaPeso && !supera1rm) continue

    const serie = superaPeso ? seriePeso : serie1rm
    prs.push({
      ejercicioId: ej.ejercicioId,
      nombre: def.nombre,
      detalle: `${formatearKg(serie.pesoKg)} kg × ${serie.reps}`,
    })
  }
  return prs
}
