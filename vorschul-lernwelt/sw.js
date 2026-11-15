/* ==========================================================================
   Service Worker – macht die Lernwelt offline nutzbar (wenn sie über
   http(s) ausgeliefert wird, z. B. GitHub Pages). Beim Installieren wird
   index.html gelesen und alle darin verlinkten Dateien werden gespeichert.
   ========================================================================== */
const CACHE = 'lernwelt-v3';
const MEDIA = 'lernwelt-media-v1'; // Erklärfilme (videos/*): erst beim ersten Ansehen gespeichert, bleibt über Versionen erhalten
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
      await Promise.all(keys.filter((k) => k !== CACHE && k !== MEDIA).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

/**
 * Erklärfilme und Plakate (videos/*.mp4|jpg): Cache zuerst, sonst Netz.
 * Nicht vorab gespeichert (groß!), sondern beim ersten Abruf vollständig
 * geladen und abgelegt. Range-Anfragen (Video-Spulen) werden aus der
 * gespeicherten Datei als 206 beantwortet; cache.put kann keine 206-Antworten
 * speichern, darum wird beim ersten Mal die ganze Datei ohne Range geholt.
 */
async function mediaResponse(req) {
  const cache = await caches.open(MEDIA);
  const url = new URL(req.url);
  const key = url.origin + url.pathname;
  let res = await cache.match(key);
  if (!res) {
    try {
      const full = await fetch(key, { credentials: 'same-origin' });
      if (!full || !full.ok || full.status !== 200) return full || new Response('', { status: 404 });
      await cache.put(key, full.clone());
      res = full;
    } catch (e) {
      return fetch(req).catch(() => new Response('Offline', { status: 503 }));
    }
  }
  const range = req.headers.get('range');
  if (!range) return res;
  const buf = await res.clone().arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const size = buf.byteLength;
  let start = m[1] ? parseInt(m[1], 10) : 0;
  let end = m[2] ? parseInt(m[2], 10) : size - 1;
  if (!m[1] && m[2]) { start = Math.max(0, size - parseInt(m[2], 10)); end = size - 1; }
  if (start >= size || start > end) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

// Stale-while-revalidate: sofort aus dem Speicher, im Hintergrund aktualisieren
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (/\/videos\/[^/]+\.(?:mp4|webm|jpe?g|png|webp|vtt)$/i.test(new URL(req.url).pathname)) {
    event.respondWith(mediaResponse(req));
    return;
  }
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok && res.status === 200) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      return cached || (await network) || new Response('Offline', { status: 503 });
    })()
  );
});
