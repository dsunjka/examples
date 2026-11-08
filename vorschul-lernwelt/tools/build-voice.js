#!/usr/bin/env node
/* Baut die natürliche Vorlesestimme.

   Schritt 1 – Aufträge erzeugen (Sätze → TTS-Jobs):
     node tools/build-voice.js jobs --in=a.json,b.json --wav=/pfad/wav --out=jobs.json
     (a.json … stammen von tools/collect-speech.js: { "Text": ["spiel-id", …] })
   Schritt 2 – Aufnahmen erzeugen:
     python tools/tts_generate.py --jobs jobs.json --voice juergen
   Schritt 3 – Pakete schreiben (WAV → MP3 → js/voice/*.js):
     node tools/build-voice.js pack --in=… --wav=/pfad/wav --voice=juergen [--kbps=32]

   Satz-Zerlegung und Hash kommen direkt aus js/core/voice.js (identisch zur App). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const args = Object.fromEntries(process.argv.slice(3).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const mode = process.argv[2];
const ROOT = path.resolve(__dirname, '..');

// voice.js in einer Mini-Sandbox laden, um split/key/hash 1:1 zu verwenden
const sandbox = { window: { LT: {} }, navigator: {}, document: {}, setTimeout, Promise, Math, String, RegExp };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/core/voice.js'), 'utf8').replace("const LT = window.LT;", 'const LT = window.LT; var navigator = {};'), sandbox);
const V = sandbox.window.LT.voice;

// Sätze sammeln: key → { text (Original-Schreibweise), games:Set }
const sentences = new Map();
for (const f of String(args.in || '').split(',').filter(Boolean)) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  const entries = Array.isArray(data) ? data.map((t) => [t, []]) : Object.entries(data);
  for (const [utt, games] of entries) {
    for (const s of V.split(utt)) {
      if (!/[A-Za-zÄÖÜäöüß0-9]/.test(s)) continue;
      const k = V.key(s);
      const e = sentences.get(k) || { text: s, games: new Set() };
      games.forEach((g) => e.games.add(g));
      sentences.set(k, e);
    }
  }
}
const GAMES = new Set();
for (const e of sentences.values()) for (const g of e.games) if (g !== 'app' && g !== '?') GAMES.add(g);
// nur in den App-Bildschirmen → kleines Paket „app“ (wird beim Start geladen), nur in einem Spiel → dessen Paket, sonst „common“
const packOf = (e) => (e.games.size === 1 ? Array.from(e.games)[0] : 'common');

const WAV = path.resolve(args.wav || path.join(ROOT, 'tools/.wav'));
const wavPath = (k) => path.join(WAV, V.hash(k) + '.wav');

if (mode === 'jobs') {
  const jobs = Array.from(sentences.entries()).map(([k, e]) => [ttsText(e.text), wavPath(k)]);
  fs.writeFileSync(args.out || 'jobs.json', JSON.stringify(jobs));
  const chars = jobs.reduce((n, j) => n + j[0].length, 0);
  console.log(`${jobs.length} Sätze, ${chars} Zeichen (≈ ${(chars / 14 / 3600).toFixed(1)} h Audio). Fehlend: ${jobs.filter((j) => !fs.existsSync(j[1])).length}`);
} else if (mode === 'pack') {
  const kbps = Number(args.kbps || 24);
  const rate = Number(args.rate || 16000);
  const outDir = path.join(ROOT, 'js/voice');
  fs.mkdirSync(outDir, { recursive: true });
  const packs = {};
  const map = {};
  let missing = 0;
  let n = 0;
  const cache = path.join(WAV, `mp3-${rate}-${kbps}`);
  fs.mkdirSync(cache, { recursive: true });
  for (const [k, e] of sentences) {
    const wav = wavPath(k);
    if (!fs.existsSync(wav)) { missing++; continue; }
    const h = V.hash(k);
    const mp3 = path.join(cache, h + '.mp3');
    if (!fs.existsSync(mp3)) {
      // Stille am Anfang/Ende kürzen, Mono-MP3 (16 kHz reicht für Sprache)
      // Lautstärke angleichen: mittlere Lautheit auf −19 dB, Spitzen höchstens −1 dB
      const det = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-i', wav, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
      const mean = Number((det.match(/mean_volume:\s*(-?[\d.]+)/) || [])[1] || -19);
      const peak = Number((det.match(/max_volume:\s*(-?[\d.]+)/) || [])[1] || -1);
      const gain = Math.min(-19 - mean, -1 - peak).toFixed(2);
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-af',
        `silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12,areverse,volume=${gain}dB`,
        '-ac', '1', '-ar', String(rate), '-b:a', kbps + 'k', mp3]);
    }
    const p = packOf(e);
    (packs[p] = packs[p] || {})[h] = fs.readFileSync(mp3).toString('base64');
    map[h] = p;
    if (++n % 500 === 0) console.log(n, 'kodiert');
  }
  for (const f of fs.readdirSync(outDir)) if (f.endsWith('.js')) fs.unlinkSync(path.join(outDir, f));
  let total = 0;
  for (const [p, clips] of Object.entries(packs)) {
    const js = `/* Aufnahmen „${p}“ – erzeugt von tools/build-voice.js (Stimme: ${args.voice || 'juergen'}, Kyutai Pocket TTS, CC-BY-4.0) */\nLT.voicePack(${JSON.stringify(p)}, ${JSON.stringify(clips)});\n`;
    fs.writeFileSync(path.join(outDir, p + '.js'), js);
    total += js.length;
  }
  const info = { voice: args.voice || 'juergen', model: 'Kyutai Pocket TTS', packs: Object.keys(packs).sort(), count: n };
  fs.writeFileSync(path.join(outDir, 'index.js'), `/* Verzeichnis der Aufnahmen: Satz-Hash → Paket. Erzeugt von tools/build-voice.js */\nLT.voiceIndex(${JSON.stringify({ info, map })});\n`);
  console.log(`${n} Aufnahmen in ${Object.keys(packs).length} Paketen, ${(total / 1048576).toFixed(1)} MB. Ohne Aufnahme: ${missing}`);
} else {
  console.log('Modus: jobs | pack');
}

/** Text fürs Sprachmodell leicht anpassen (die App-Schlüssel bleiben unverändert). */
function ttsText(t) {
  return t
    .replace(/…/g, '...')
    .replace(/\s*–\s*/g, ', ')
    .replace(/["“”»«]/g, '');
}
