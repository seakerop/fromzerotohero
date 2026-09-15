/* Service worker de FromZeroToHero (CONTRACT.md §19).
   Estrategia: navegaciones network-first con fallback offline al index cacheado;
   el resto de assets cache-first con caching en runtime. */

const CACHE = 'fzth-v2'

const PRECACHE = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'favicon.svg',
  'iconos/icono-180.png',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/icono-512-maskable.png',
]

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(nombres.filter((nombre) => nombre !== CACHE).map((nombre) => caches.delete(nombre)))
      )
      .then(() => self.clients.claim())
  )
})

function guardarEnCache(peticion, respuesta) {
  const copia = respuesta.clone()
  caches.open(CACHE).then((cache) => cache.put(peticion, copia))
}

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request
  if (peticion.method !== 'GET') return

  const url = new URL(peticion.url)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return
  if (url.origin !== self.location.origin) return

  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          if (respuesta.ok) {
            guardarEnCache(peticion, respuesta)
            // Refresca también el fallback offline: sin esto, el precache del
            // primer install serviría un index viejo tras cada deploy.
            const copia = respuesta.clone()
            caches.open(CACHE).then((cache) => cache.put('index.html', copia))
          }
          return respuesta
        })
        .catch(() =>
          caches
            .match('index.html', { ignoreSearch: true })
            .then((cacheado) => cacheado || caches.match('.', { ignoreSearch: true }))
        )
    )
    return
  }

  evento.respondWith(
    caches.match(peticion).then((cacheado) => {
      if (cacheado) return cacheado
      return fetch(peticion).then((respuesta) => {
        if (respuesta.ok) guardarEnCache(peticion, respuesta)
        return respuesta
      })
    })
  )
})
