// Baut ../../vendor/three.min.js – ein klassisches Skript (IIFE), das window.THREE setzt.
// Aufruf: cd tools/three && npm install && npm run build
import { build } from 'esbuild';
import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync(new URL('./node_modules/three/package.json', import.meta.url)));
await build({
  entryPoints: [new URL('./entry.js', import.meta.url).pathname],
  bundle: true, minify: true, format: 'iife', target: ['es2019'], legalComments: 'eof',
  banner: { js: `/* three.js r${pkg.version.split('.')[1]} (MIT, https://threejs.org) – gebündelt für die Lernwelt (tools/three) */` },
  outfile: new URL('../../vendor/three.min.js', import.meta.url).pathname,
});
console.log('vendor/three.min.js gebaut (three ' + pkg.version + ')');
