// Kopiert die App-Schrift (Andika, OFL) nach public/fonts, damit Remotion sie lokal laden kann.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export function prepareAssets() {
  const src = path.join(HERE, '..', '..', 'assets', 'fonts');
  const dst = path.join(HERE, 'public', 'fonts');
  fs.mkdirSync(dst, {recursive: true});
  for (const f of ['andika-400.woff2', 'andika-700.woff2', 'OFL.txt']) {
    const s = path.join(src, f), d = path.join(dst, f);
    if (fs.existsSync(s) && (!fs.existsSync(d) || fs.statSync(d).size !== fs.statSync(s).size)) fs.copyFileSync(s, d);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) prepareAssets();
