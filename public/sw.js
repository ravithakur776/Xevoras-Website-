/**
 * XEVORAS — PROGRESSIVE WEB APP SERVICE WORKER
 * Version: 2.1.0
 * 
 * Provides offline resilience, instant cached app shell rendering,
 * and high-speed background prefetching for the mobile app experience.
 */

const CACHE_NAME = 'xevoras-atelier-v2.1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/brand/logo.png',
  '/brand/xevoras-emblem-gold.jpg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
];

// 1. Install & Pre-cache Critical App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA: Some static assets failed to pre-cache (safe to proceed):', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate & Purge Legacy Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Strategy: Network First for Navigations & APIs, Cache First for Static Assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET, internal, or admin API requests
  if (req.method !== 'GET' || url.pathname.startsWith('/api/admin') || url.pathname.startsWith('/admin')) {
    return;
  }

  // HTML Page Navigation: Network First with Offline Fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          // Clone and update cache
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('<h1>XEVORAS — Offline Mode</h1><p>Please check your connection.</p>', {
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }

  // Static Assets (Images, Fonts, Scripts): Cache First with Background Revalidation
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/media/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/brand/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(req).then((fresh) => {
            if (fresh && fresh.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, fresh));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: Fetch directly
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
