self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A minimal fetch event handler to satisfy PWA requirements.
  // It just falls back to network.
  event.respondWith(fetch(event.request).catch(() => {
    // If offline, maybe return an offline page or just let it fail
    return new Response('Você está offline.', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }));
});
