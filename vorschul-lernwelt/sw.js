/* ==========================================================================
   Service Worker – macht die Lernwelt offline nutzbar (wenn sie über
   http(s) ausgeliefert wird, z. B. GitHub Pages). Beim Installieren wird
   index.html gelesen und alle darin verlinkten Dateien werden gespeichert.
   ========================================================================== */
const CACHE = 'lernwelt-v1';
const BASE = ['./', './index.html', './manifest.webmanifest', './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png', './assets/fonts/andika-400.woff2', './assets/fonts/andika-700.woff2'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(BASE);
      try {
        const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
        const urls = Array.from(html.matchAll(/(?:src|href)="([^"#?]+\.(?:js|css))"/g)).map((m) => './' + m[1]);
        await Promise.all(urls.map((u) => cache.add(u).catch(() => null)));
      } catch (e) {
        /* offline beim Installieren – dann eben beim nächsten Mal */
      }
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Stale-while-revalidate: sofort aus dem Speicher, im Hintergrund aktualisieren
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      return cached || (await network) || new Response('Offline', { status: 503 });
    })()
  );
});
