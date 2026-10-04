// Service worker Editor Gandul — agar editor bisa dibuka offline.
// Naikkan angka versi jika ingin memaksa cache dibuang.
const CACHE = 'editor-gandul-v2';
const FILES = ['./', './editor-gandul.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('editor-gandul-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache dulu (cepat & offline), sambil memperbarui cache di latar belakang bila online.
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(hit => {
      const net = fetch(r, { cache: 'no-cache' }).then(res => {
        if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
