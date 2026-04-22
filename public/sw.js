// Service worker minimal : sert /openmoji/*.svg depuis le cache.
// Le téléchargement massif se fait côté app (avec progression), ici on se contente
// de servir depuis le cache quand une requête arrive.
const CACHE = 'emoji-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = req.url
  if (!url.includes('/openmoji/') || !url.endsWith('.svg')) return

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(hit => {
        if (hit) return hit
        return fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone())
          return res
        }).catch(() => hit || Response.error())
      })
    )
  )
})

// Permet à l'app de vider le cache
self.addEventListener('message', event => {
  if (event.data === 'clear-cache') {
    caches.delete(CACHE)
  }
})
