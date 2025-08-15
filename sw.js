self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('mm-v1').then((cache) => {
      return cache.addAll([
        'index.html',
        'style.css',
        'app.js',
        'manifest.json',
        'assets/icon-180.png',
        'assets/icon-bat.png',
        'assets/icon-spidey.png'
      ]);
    })
  );
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== 'mm-v1') {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
