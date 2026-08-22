const CACHE_NAME = 'thecapi11-app-v1';
const APP_SHELL = [
  './',
  './vestuario-pedidos.html',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  const request = event.request;
  const isAppNavigation = request.mode === 'navigate';
  event.respondWith(
    fetch(request, {cache:'no-store'})
      .then((response) => {
        if(response.ok && new URL(request.url).origin === self.location.origin){
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || (isAppNavigation ? caches.match('./vestuario-pedidos.html') : Response.error());
      })
  );
});
