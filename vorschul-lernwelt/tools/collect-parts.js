#!/usr/bin/env node
/* Sammelt Satzteile und Wörter, aus denen LT.voice.findChunks Sätze ohne
   eigene Aufnahme zusammensetzt (z. B. „Die letzte Zahl sagt uns,“ + „fünf“ + „Frösche.“).

   Quellen: die gesammelten Sätze (collect-speech.js), alle deutschen
   Zeichenketten im Programmcode und die Zahlwörter 0–100.
   Ausgabe: { "Text": ["parts"] } – nur Stücke, für die es noch KEINE Aufnahme gibt.

   Aufruf: node tools/collect-parts.js --in=a.json,b.json --out=parts.json
   danach: build-voice.js jobs/pack wie gewohnt (Paket „parts“). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const ROOT = path.resolve(__dirname, '..');

const sandbox = { window: { LT: {} }, navigator: {}, document: {}, setTimeout, Promise, Math, String, RegExp };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/core/voice.js'), 'utf8').replace('const LT = window.LT;', 'const LT = window.LT; var navigator = {};'), sandbox);
const LT = sandbox.window.LT;
const V = LT.voice;
// vorhandene Aufnahmen (Index) laden
let map = {};
LT.voiceIndex = (d) => { map = d.map || {}; };
sandbox.LT = LT;
if (fs.existsSync(path.join(ROOT, 'js/voice/index.js'))) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/voice/index.js'), 'utf8'), sandbox);
V.map = map;

const out = new Map(); // bare key → Text
function add(text) {
  text = String(text).replace(/[„“"»«()]/g, '').replace(/\s+/g, ' ').trim();
  if (!/[A-Za-zÄÖÜäöüß]/.test(text) || text.length > 80) return;
  if (V.lookup(text)) return; // schon aufgenommen (mit irgendeinem Satzzeichen)
  const bare = V.key(text.replace(/[.!?…,:;]+$/, ''));
  if (!out.has(bare)) out.set(bare, text);
}
const WORD = /[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*/g;

// 1) Satzteile und Wörter der gesammelten Sätze
let n = 0;
for (const f of String(args.in || '').split(',').filter(Boolean)) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const utt of Array.isArray(data) ? data : Object.keys(data)) {
    for (const s of V.split(utt)) {
      n++;
      const t = s.replace(/\s+[–-]\s+/g, ', ');
      const clauses = t.match(/[^,:;]+[,:;]?/g) || [t];
      if (clauses.length > 1) clauses.forEach((c) => add(c.trim()));
      (t.match(WORD) || []).forEach(add);
    }
  }
}
// 2) Deutsche Wörter aus Zeichenketten im Code (Daten wie Tiernamen, Mehrzahlformen …)
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'voice') walk(p, acc); } else if (e.name.endsWith('.js')) acc.push(p);
  }
  return acc;
}
for (const file of walk(path.join(ROOT, 'js'), [])) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
    const lit = (m[1] || m[2] || m[3] || '').replace(/\$\{[^}]*\}/g, ' ');
    const natural = /\s/.test(lit.trim()) || /^[A-ZÄÖÜ][a-zäöüß]+$/.test(lit) || /[äöüß]/i.test(lit);
    if (!natural || /[{}<>=/#]|^\.|--|\bcss\b/.test(lit)) continue;
    (lit.match(WORD) || []).forEach(add);
  }
}
// 3) Zahlwörter
for (let i = 0; i <= 100; i++) add(V.numWord(i));

const res = {};
for (const t of out.values()) res[t] = ['parts'];
fs.writeFileSync(args.out || 'parts.json', JSON.stringify(res));
console.log(`${n} Sätze geprüft → ${out.size} neue Teile/Wörter`);
