/* =====================================================
   AI Audio Reader — Service Worker v5
   ===================================================== */

const CACHE_VERSION = 'air-v5';
const ASSETS = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json', '/icons/icon.svg'];

// Install: cache assets + activate immediately without waiting for old tabs
self.addEventListener('install', e => {
  console.log('[SW] Installing v5...');
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Don't wait — take control immediately
});

// Activate: wipe old caches + claim all open clients right away
self.addEventListener('activate', e => {
  console.log('[SW] Activating v5, cleaning old caches...');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Message: explicit SKIP_WAITING from the page (belt-and-suspenders)
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING received — calling skipWaiting()');
    self.skipWaiting();
  }
});

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.url.startsWith('blob:')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          caches.open(CACHE_VERSION).then(c => c.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
