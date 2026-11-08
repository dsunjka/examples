#!/usr/bin/env node
// Baut Lese-Labor PROFI zu einer einzigen, eigenständigen HTML-Datei.
//   node tools/build.mjs            → dist/lese-labor-profi.html (vollständige Seite, offline nutzbar)
//                                     dist/artifact.html          (Fassung für die Claude-Artifact-Vorschau)
// Prüft dabei alle Inhaltsdateien in src/inhalte/ (siehe CONTENT-SPEC.md).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pruefeInhalte } from './inhalte-pruefen.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => join(ROOT, 'src', p);
const lies = (p) => readFileSync(p, 'utf8');

// ---------- Inhalte zusammenführen ----------
const inhaltDir = src('inhalte');
const MIT_TEST = process.argv.includes('--mit-test');
const testDir = join(ROOT, 'tests', 'fixtures');
const dateien = (existsSync(inhaltDir) ? readdirSync(inhaltDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort().map((f) => join(inhaltDir, f)) : [])
  .concat(MIT_TEST && existsSync(testDir) ? readdirSync(testDir).filter((f) => f.endsWith('.json')).sort().map((f) => join(testDir, f)) : []);
const INHALT = { digital: [], lesen: [], rechtschreibung: { themen: [], diktate: [] }, grammatik: { themen: [] }, schreiben: { themen: [], auftraege: [] }, tempo: { saetze: [] } };
const pakete = [];
for (const pfad of dateien) {
  const f = pfad.split(/[\\/]/).pop();
  let d;
  try { d = JSON.parse(lies(pfad)); } catch (e) { console.error(`✗ ${f}: kein gültiges JSON – ${e.message}`); process.exitCode = 1; continue; }
  pakete.push({ datei: f, daten: d });
  switch (d.modul) {
    case 'digital': if (d.fall) INHALT.digital.push(d.fall); break;
    case 'lesen': INHALT.lesen.push(...(d.texte || [])); break;
    case 'rechtschreibung': INHALT.rechtschreibung.themen.push(...(d.themen || [])); INHALT.rechtschreibung.diktate.push(...(d.diktate || [])); break;
    case 'grammatik': INHALT.grammatik.themen.push(...(d.themen || [])); break;
    case 'schreiben': INHALT.schreiben.themen.push(...(d.themen || [])); INHALT.schreiben.auftraege.push(...(d.auftraege || [])); break;
    case 'tempo': INHALT.tempo.saetze.push(...(d.saetze || [])); break;
    default: console.error(`✗ ${f}: unbekanntes modul "${d.modul}"`); process.exitCode = 1;
  }
}
INHALT.digital.sort((a, b) => (a.nummer || 0) - (b.nummer || 0));

const befunde = pruefeInhalte(pakete);
const fehler = befunde.filter((b) => b.stufe === 'fehler');
for (const b of befunde) console[b.stufe === 'fehler' ? 'error' : 'warn'](`${b.stufe === 'fehler' ? '✗' : '!'} ${b.datei} · ${b.ort}: ${b.text}`);
if (fehler.length) { console.error(`\n${fehler.length} Fehler in den Inhalten.`); process.exitCode = 1; }

const zaehl = {
  faelle: INHALT.digital.length, digitalFragen: INHALT.digital.reduce((s, f) => s + (f.items || []).length, 0),
  texte: INHALT.lesen.length, leseFragen: INHALT.lesen.reduce((s, t) => s + (t.items || []).length, 0),
  rsThemen: INHALT.rechtschreibung.themen.length, grThemen: INHALT.grammatik.themen.length, scThemen: INHALT.schreiben.themen.length,
  diktate: INHALT.rechtschreibung.diktate.length, auftraege: INHALT.schreiben.auftraege.length, tempo: INHALT.tempo.saetze.length,
};
zaehl.aufgaben = zaehl.digitalFragen + zaehl.leseFragen + [INHALT.rechtschreibung, INHALT.grammatik, INHALT.schreiben].reduce((s, m) => s + m.themen.reduce((x, t) => x + (t.items || []).length, 0), 0);

// ---------- Code zusammensetzen ----------
const jsDir = src('js');
const js = readdirSync(jsDir).filter((f) => f.endsWith('.js')).sort().map((f) => `/* ---- ${f} ---- */\n` + lies(join(jsDir, f))).join('\n');
const sicherJSON = JSON.stringify(INHALT).replace(/<\//g, '<\\/').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const schriftDatei = src('schrift/fredoka-latin.woff2');
const schriftCSS = existsSync(schriftDatei)
  ? `/* Fredoka – Copyright 2016 The Fredoka Project Authors, SIL Open Font License 1.1 (src/schrift/OFL-Fredoka.txt) */\n@font-face { font-family: "Fredoka"; font-style: normal; font-weight: 300 700; font-display: swap; src: url(data:font/woff2;base64,${readFileSync(schriftDatei).toString('base64')}) format("woff2"); }`
  : '';
const css = lies(src('styles.css')).replace('/*@SCHRIFT@*/', schriftCSS);
const kopf = lies(src('kopf.html')).trim();
const koerper = lies(src('koerper.html')).trim();
const skripte = `<script>window.LL_INHALT=${sicherJSON};</script>\n<script>\n(function(){'use strict';\n${js}\n})();\n</script>`;

const fragment = `${kopf}\n<style>\n${css}\n</style>\n${koerper}\n${skripte}\n`;
const iconPng = existsSync(src('icon-180.png')) ? readFileSync(src('icon-180.png')).toString('base64') : '';
const iconSvg = existsSync(src('icon.svg')) ? encodeURIComponent(lies(src('icon.svg')).trim()) : '';
const reset = ':root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,-apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
const standalone = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Lese-Labor">
<meta name="theme-color" content="#170b3a">
<meta name="robots" content="noindex">
${iconPng ? `<link rel="apple-touch-icon" href="data:image/png;base64,${iconPng}">` : ''}
${iconSvg ? `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${iconSvg}">` : ''}
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; font-src data:; form-action 'none'; base-uri 'none'">
<style>${reset}</style>
${kopf}
<style>
${css}
</style>
</head>
<body>
${koerper}
${skripte}
</body>
</html>
`;
const zielArg = process.argv.find((a) => a.startsWith('--ziel='));
const ZIEL = zielArg ? zielArg.slice(7) : MIT_TEST ? join(ROOT, 'tests', 'build') : join(ROOT, 'dist');
mkdirSync(ZIEL, { recursive: true });
writeFileSync(join(ZIEL, 'lese-labor-profi.html'), standalone);
writeFileSync(join(ZIEL, 'artifact.html'), fragment);
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';
console.log(`✓ gebaut nach ${ZIEL}${MIT_TEST ? ' (mit Testdaten)' : ''}: lese-labor-profi.html (${kb(standalone)}), artifact.html (${kb(fragment)})`);
console.log(`  Inhalte: ${zaehl.faelle} Fälle/${zaehl.digitalFragen} Fragen · ${zaehl.texte} Texte/${zaehl.leseFragen} Fragen · Themen RS ${zaehl.rsThemen}, GR ${zaehl.grThemen}, SC ${zaehl.scThemen} · ${zaehl.diktate} Diktate · ${zaehl.auftraege} Schreibaufträge · ${zaehl.tempo} Tempo-Sätze · ${zaehl.aufgaben} Aufgaben insgesamt`);
