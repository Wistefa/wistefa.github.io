const CACHE = 'rezepte-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
);
self.addEventListener('activate', e =>
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
);
self.addEventListener('fetch', e => {
  if (e.request.url.includes('cdnjs') || e.request.url.includes('unpkg') ||
      e.request.url.includes('fonts.googleapis') || e.request.url.includes('openstreetmap')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
