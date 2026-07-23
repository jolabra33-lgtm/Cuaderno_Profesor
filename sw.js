// sw.js — hace que la suite funcione sin conexión.
//
// Cómo funciona: la PRIMERA vez que se abre con wifi/datos (o simplemente la
// primera vez que se abre, si ya has seguido tutoria/vendor/LEEME.txt), este
// Service Worker guarda en una caché local todos los archivos de la app. A
// partir de ese momento, cada archivo se sirve primero desde esa caché
// (funciona sin conexión) y se actualiza en segundo plano si hay red.
//
// Nota: este Service Worker solo se activa cuando la app se abre a través de
// un servidor (http/https), como GitHub Pages. Si abres el archivo suelto
// haciendo doble clic (file://), el navegador no permite Service Workers —
// pero el hub principal, y Tutoría si has vendorizado sus librerías, siguen
// funcionando sin conexión de todas formas, porque no dependen de recursos
// externos.
//
// Si actualizas los archivos de la app en el futuro, sube también este archivo
// cambiando el número de CACHE_NAME (v1 -> v2, etc.) para que se descargue la
// versión nueva en vez de seguir sirviendo la antigua desde caché.

const CACHE_NAME = 'geohist-suite-v50';

// El "esqueleto" de las dos apps: HTML, manifest e iconos.
const APP_SHELL = [
  './',
  './index.html',
  './guia.html',
  './manifest.json',
  './icons/icon-32.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './tutoria/',
  './tutoria/index.html',
  './tutoria/manifest.json',
  './tutoria/icon-192.png',
  './tutoria/icon-512.png'
];

// Librerías vendorizadas que Tutoría necesita para los gráficos y la vista
// previa de PDF (ver tutoria/vendor/LEEME.txt). Son opcionales: si no las
// has descargado, simplemente no se cachean y esas dos funciones concretas
// no estarán disponibles sin conexión (el resto de la app sí).
const OPTIONAL_ASSETS = [
  './tutoria/vendor/chart.umd.min.js',
  './tutoria/vendor/pdf.min.js',
  './tutoria/vendor/pdf.worker.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // El esqueleto de la app: si esto falla (p. ej. se movió un archivo),
    // preferimos que falle la instalación y se note el problema.
    await cache.addAll(APP_SHELL);

    // Recursos opcionales: se intentan uno a uno SIN romper la instalación
    // si alguno no existe (p. ej. si todavía no has seguido el LEEME.txt).
    await Promise.all(OPTIONAL_ASSETS.map(async url => {
      try {
        const resp = await fetch(url);
        if (resp && resp.status === 200) await cache.put(url, resp);
      } catch (e) { /* no está descargado; no pasa nada */ }
    }));

    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);

    // Siempre se intenta también la red en segundo plano, para tener la
    // versión más reciente guardada de cara a la próxima vez.
    const networkFetch = fetch(event.request).then(resp => {
      if (resp && (resp.status === 200 || resp.type === 'opaque')) {
        cache.put(event.request, resp.clone());
      }
      return resp;
    }).catch(() => null);

    if (cached) return cached;           // sin esperar a la red: rápido y funciona offline
    const fromNetwork = await networkFetch;
    if (fromNetwork) return fromNetwork;
    return new Response('Sin conexión y todavía no hay una copia guardada de este archivo.', {
      status: 503, statusText: 'Offline'
    });
  })());
});
