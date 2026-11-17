/* Kleiner statischer Webserver für die Tests (http statt file://, damit
   localStorage, IndexedDB und eingebettete Ansichten wie im echten Betrieb
   funktionieren). Erreichbar über localhost UND 127.0.0.1 – zwei
   verschiedene Ursprünge für den iframe-Test. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};

module.exports = function serve(root, extra = {}) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (extra[url]) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(typeof extra[url] === 'function' ? extra[url](req) : extra[url]);
    }
    const file = path.join(root, url === '/' ? 'index.html' : url);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404); return res.end(); }
      const headers = { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'content-length': st.size };
      // Videos: einfache Range-Unterstützung (Browser fragt Teilstücke an)
      const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
      if (range) {
        const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : st.size - 1;
        res.writeHead(206, Object.assign(headers, { 'content-range': `bytes ${start}-${end}/${st.size}`, 'content-length': end - start + 1, 'accept-ranges': 'bytes' }));
        return fs.createReadStream(file, { start, end }).pipe(res);
      }
      res.writeHead(200, headers);
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).pipe(res);
    });
  });
  return new Promise((resolve) => server.listen(0, '0.0.0.0', () => resolve({ server, port: server.address().port })));
};
