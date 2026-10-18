// Registro del service worker (CONTRACT.md §19).
// Solo en producción: en dev el SW estorba a Vite y a la recarga en caliente.

export function registrarSW() {
  // En la app nativa los archivos ya van dentro: el service worker sobra
  // y podría servir una versión vieja.
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    // Ruta relativa: la app puede vivir en una subruta (GitHub Pages).
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      // Sin SW la app funciona igual; solo se pierde el modo offline.
      console.warn('No se pudo registrar el service worker:', error)
    })
  })
}
