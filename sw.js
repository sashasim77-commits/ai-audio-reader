/* =====================================================
   AI Audio Reader - Service Worker
   ===================================================== */

importScripts('./version.js');

const APP_VERSION = self.APP_VERSION || 'dev';
const CACHE_VERSION = self.CACHE_VERSION || `air-${APP_VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './version.js',
  './icons/icon.svg',
];

self.addEventListener('install', event => {
  console.log(`[SW] Installing ${APP_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  console.log(`[SW] Activating ${APP_VERSION}...`);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.startsWith('blob:')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
