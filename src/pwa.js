// Registro del service worker (CONTRACT.md §19).
// Solo en producción: en dev el SW estorba a Vite y a la recarga en caliente.

export function registrarSW() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      // Sin SW la app funciona igual; solo se pierde el modo offline.
      console.warn('No se pudo registrar el service worker:', error)
    })
  })
}
