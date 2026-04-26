const CACHE_NAME = 'ar7-v15';
const SHELL = [
  '/Fitness-Program/',
  '/Fitness-Program/index.html',
  '/Fitness-Program/manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=IBM+Plex+Mono:wght@300;400&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Cache-first for app shell; network-first for everything else
  const isShell = SHELL.some(url => e.request.url.endsWith(url) || e.request.url === url);
  if (isShell) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      }))
    );
  } else {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});
