/**
 * Service Worker for patipat.org
 * Provides offline support and caching for better performance
 */

const CACHE_NAME = 'patipat-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install (critical resources)
const PRECACHE_ASSETS = [
  '/',
  '/css/style.css',
  '/js/journal.js',
  OFFLINE_URL
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching critical assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // HTML pages - network first, cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Try cache, then offline page
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  if (
    request.url.includes('/css/') ||
    request.url.includes('/js/') ||
    request.url.includes('/images/') ||
    request.url.includes('/fonts/')
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version, update cache in background
            fetch(request).then((response) => {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            });
            return cachedResponse;
          }
          // Not in cache, fetch and cache
          return fetch(request).then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          });
        })
    );
    return;
  }

  // Default - network first
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});
