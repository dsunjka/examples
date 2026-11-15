#!/usr/bin/env node
// Rendert je Visual-Typ ein Standbild aus examples.json (oder aus einem Filmskript) nach out/stills/.
//   node stills.mjs                     → alle Beispiele aus examples.json
//   node stills.mjs zahn uhr            → nur diese Typen
//   node stills.mjs --film films/x.json → ein Bild pro Beat eines Films (ohne Ton, geschätzte Dauer)
//   --at 0.9   Zeitpunkt als Anteil der Sprechzeit (Standard 0.9)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {prepareAssets} from './prepare.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};
const atFrac = Number(opt('--at', 0.9));
const filmFile = opt('--film', null);
const names = args.filter((a, i) => !a.startsWith('--') && !['--at', '--film'].includes(args[i - 1]));
const browserExecutable = process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const fps = 24;
const estimateDur = (say) => Math.max(1.5, String(say || '').split(/\s+/).filter(Boolean).length / 2.4 + 0.3);

let film = {id: 'stills', title: 'Die Kraft der Zehn', icon: '🌰', accent: '#ff8a3d'};
let jobs = [];
if (filmFile) {
  const f = JSON.parse(fs.readFileSync(filmFile, 'utf8'));
  film = {id: f.id, title: f.title, icon: f.icon, accent: f.accent, subject: f.subject};
  jobs = f.beats.map((b, i) => [`${f.id}-${String(i).padStart(2, '0')}-${b.visual.type}`, b]);
} else {
  const ex = JSON.parse(fs.readFileSync(path.join(HERE, 'examples.json'), 'utf8'));
  jobs = Object.entries(ex).filter(([k]) => !names.length || names.includes(k));
}
prepareAssets();
const outDir = path.join(HERE, 'out', 'stills');
fs.mkdirSync(outDir, {recursive: true});
console.log('Bündeln …');
const serveUrl = await bundle({entryPoint: path.join(HERE, 'src', 'index.ts'), publicDir: path.join(HERE, 'public')});
for (const [name, beat] of jobs) {
  const dur = estimateDur(beat.say);
  const inputProps = {film, fps, beats: [beat]};
  const comp = await selectComposition({serveUrl, id: 'FloExplainer', inputProps, browserExecutable, chromiumOptions: {gl: 'swangle'}, logLevel: 'error'});
  const frame = Math.min(comp.durationInFrames - 1, Math.round(0.3 * fps + atFrac * dur * fps));
  const output = path.join(outDir, `${name}.png`);
  await renderStill({composition: comp, serveUrl, inputProps, frame, output, browserExecutable, chromiumOptions: {gl: 'swangle'}, logLevel: 'error'});
  console.log(output);
}
