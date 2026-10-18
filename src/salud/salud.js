// Puente con Apple Salud (iPhone/Apple Watch) y Health Connect (Android).
// Solo hace algo dentro de la app nativa; en la web todo dice "no
// disponible" y la app sigue funcionando igual que siempre. El plugin se
// carga con import dinámico para no meterlo en el paquete de la web.

const DIA_MS = 86400000
const HORA_CORTE = 4 // el día de la app empieza a las 04:00 (CONTRACT §5)

export function esNativo() {
  try {
    return Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
  } catch {
    return false
  }
}

let cache = null
async function plugin() {
  if (!esNativo()) return null
  if (!cache) {
    const mod = await import('@capgo/capacitor-health')
    cache = mod.Health
  }
  return cache
}

export async function saludDisponible() {
  const Health = await plugin()
  if (!Health) return { disponible: false, motivo: 'web' }
  try {
    const r = await Health.isAvailable()
    return { disponible: Boolean(r && r.available), motivo: r && r.reason }
  } catch (e) {
    return { disponible: false, motivo: e && e.message }
  }
}

// Abre la hoja de permisos del sistema. En iOS, Salud NUNCA confirma si
// concedió la LECTURA (lo oculta a propósito), así que el "sí" que
// devolvemos es solo que la hoja se cerró sin error.
export async function pedirPermisoPasos() {
  const Health = await plugin()
  if (!Health) return false
  try {
    await Health.requestAuthorization({ read: ['steps'] })
    return true
  } catch {
    return false
  }
}

// [inicio, fin) de un día de la app: de las 04:00 a las 04:00 del siguiente,
// en hora local, para que cuadre con el corte de día del motor.
function rangoDeDia(clave) {
  const [a, m, d] = String(clave).split('-').map(Number)
  const inicio = new Date(a, m - 1, d, HORA_CORTE, 0, 0, 0)
  return { inicio: inicio.toISOString(), fin: new Date(inicio.getTime() + DIA_MS).toISOString() }
}

// Pasos totales de ese día de la app, o null si Salud no da nada (sin
// permiso, sin datos o fuera de la app nativa).
export async function pasosDelDia(clave) {
  const Health = await plugin()
  if (!Health) return null
  const { inicio, fin } = rangoDeDia(clave)
  const r = await Health.queryAggregated({
    dataType: 'steps',
    startDate: inicio,
    endDate: fin,
    bucket: 'day',
    aggregation: 'sum',
  })
  const muestras = (r && r.samples) || []
  if (!muestras.length) return null
  const total = muestras.reduce((s, x) => s + (Number(x.value) || 0), 0)
  if (!Number.isFinite(total) || total <= 0) return null
  return Math.round(total)
}
