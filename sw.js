/* =====================================================
   AI Audio Reader — Service Worker v4
   skipWaiting on install → page controls reload timing
   ===================================================== */

const CACHE_VERSION = 'air-v4';
const ASSETS = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json', '/icons/icon.svg'];

// Install: pre-cache assets + activate immediately (no waiting)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Take control instantly
});

// Activate: clean up old caches + claim all clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first strategy for app shell, fallback to cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.url.startsWith('blob:')) return;

  e.respondWith(
    fetch(e.request)
      .then(networkRes => {
        if (networkRes.ok) {
          const clone = networkRes.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(e.request, clone));
        }
        return networkRes;
      })
      .catch(() => caches.match(e.request))
  );
});
