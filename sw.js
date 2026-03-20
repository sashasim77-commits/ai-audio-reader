/* =====================================================
   AI Audio Reader — Service Worker v3
   Network-first for app shell, with update prompt
   ===================================================== */

const CACHE_VERSION = 'air-v3';
const ASSETS = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json', '/icons/icon.svg'];

// Install: pre-cache assets, do NOT skipWaiting automatically
// (we want to prompt the user first)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
  // Don't call skipWaiting() here — wait for user confirmation
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Message: allow main page to trigger skipWaiting (on user consent)
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Fetch: network-first strategy for app shell, fallback to cache
self.addEventListener('fetch', e => {
  // Skip non-GET, blob URLs, chrome-extension, etc.
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.url.startsWith('blob:')) return;

  e.respondWith(
    fetch(e.request)
      .then(networkRes => {
        // Update cache with fresh response
        if (networkRes.ok) {
          const clone = networkRes.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(e.request, clone));
        }
        return networkRes;
      })
      .catch(() => caches.match(e.request)) // offline fallback
  );
});
