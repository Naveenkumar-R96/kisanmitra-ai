// frontend/public/sw.js
const CACHE_NAME    = 'kisanmitra-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Always network for API calls
  if (url.pathname.startsWith('/api')) {
    e.respondWith(
      fetch(request)
        .then(res => {
          // Cache successful API responses for offline use
          if (res.ok && request.method === 'GET') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache first for static assets
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return res;
      });
    })
  );
});

// Push notifications
self.addEventListener('push', (e) => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'KisanMitra AI', {
      body:  data.body  || 'New farm advisory available',
      icon:  '/kisan-icon.png',
      badge: '/kisan-icon.png',
      data:  { url: data.url || '/' },
      actions: [
        { action: 'open',    title: 'View'    },
        { action: 'dismiss', title: 'Dismiss' },
      ]
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.openWindow(e.notification.data?.url || '/')
  );
});