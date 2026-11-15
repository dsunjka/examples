#!/usr/bin/env node
// Rendert einen Erklärfilm mit Flo end-to-end.
//
//   node render.mjs <films/<id>.json | id> [--fps 24] [--preview] [--crf 30] [--no-lint] [--keep]
//
// 1. Sprechtexte → TTS-Jobs (Stimme "juergen", tools/tts_generate.py), Cache in public/narr/<id>/
// 2. Lautheit angleichen + Stille abschneiden (wie der Pack-Schritt der App), Sätze je Beat verbinden
// 3. Dauern + Mund-Hüllkurve → Remotion-Props, Beat-Zeiten → public/narr/<id>/timing.json
// 4. Remotion-Render 960x540 (Zwischenstufe), 5. Endkodierung nach videos/<id>.mp4 + Poster videos/<id>.jpg
//
// Umgebung: VIDEO_CONCURRENCY (Remotion-Tabs, Standard 2), TTS_THREADS (Standard 2),
//           TTS_PYTHON (Standard /tmp/claude-0/tts-venv/bin/python), VIDEO_NICE (Standard 19).
import {execFileSync, spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareAssets} from './prepare.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const VOICE = 'juergen';
const PY = process.env.TTS_PYTHON || '/tmp/claude-0/tts-venv/bin/python';
const NICE = String(process.env.VIDEO_NICE ?? 19);
const CONC = String(process.env.VIDEO_CONCURRENCY || 2);
const SR = 24000;
// muss zu src/FloExplainer.tsx (layoutBeats) passen
const LEAD = 0.3;
const GAP = 0.32; // Pause zwischen Sätzen innerhalb eines Beats (s)

// ---------- Argumente ----------
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const target = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a));
if (!target) {
  console.error('Aufruf: node render.mjs <films/<id>.json | id> [--fps 24] [--preview] [--crf 30] [--no-lint] [--keep]');
  process.exit(2);
}
const fps = Number(opt('--fps', 24));
const preview = flag('--preview');
let crf = Number(opt('--crf', 30));
const filmFile = fs.existsSync(target) ? path.resolve(target) : path.join(HERE, 'films', target.replace(/\.json$/, '') + '.json');
const film = JSON.parse(fs.readFileSync(filmFile, 'utf8'));
const id = film.id || path.basename(filmFile, '.json');
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0).padStart(4)}s]`, ...a);

// ---------- Prüfen ----------
const VTYPES = [...fs.readFileSync(path.join(HERE, 'src/visuals/index.ts'), 'utf8').matchAll(/^\s{2}([a-z]+): \{comp:/gm)].map((m) => m[1]);
const problems = [];
if (!Array.isArray(film.beats) || !film.beats.length) problems.push('beats fehlt oder ist leer');
(film.beats || []).forEach((b, i) => {
  if (!b.say || typeof b.say !== 'string') problems.push(`Beat ${i}: "say" fehlt`);
  if (!b.visual || !VTYPES.includes(b.visual.type)) problems.push(`Beat ${i}: unbekannter visual.type "${b.visual && b.visual.type}" (erlaubt: ${VTYPES.join(', ')})`);
  if (!flag('--no-lint') && b.say) {
    const bad = b.say.match(/[0-9+=€<>%/§&*#@]|\s[-–—]\s|\s-\s/g);
    if (bad) problems.push(`Beat ${i}: Sprechtext nicht TTS-freundlich (${[...new Set(bad)].join(' ')}): "${b.say}"`);
  }
});
if (problems.length) {
  console.error('Filmskript ' + filmFile + ':\n  - ' + problems.join('\n  - '));
  process.exit(1);
}

// ---------- Texte zerlegen (gleiche Satz-Regel wie js/core/voice.js) ----------
const SPLIT_RE = /[^.!?…]+[.!?…]+["“”»«)]*|[^.!?…]+$/g;
const splitSentences = (t) => (String(t).replace(/\s+/g, ' ').trim().match(SPLIT_RE) || []).map((s) => s.trim()).filter(Boolean);
const ttsText = (s) => s.replace(/…/g, '...').replace(/\s[–—-]\s/g, ', ').replace(/[„“”"»«]/g, '').trim();
const hash = (s) => crypto.createHash('sha1').update(VOICE + '|' + s).digest('hex').slice(0, 10);

const narrDir = path.join(HERE, 'public', 'narr', id);
const outDir = path.join(HERE, 'out');
fs.mkdirSync(narrDir, {recursive: true});
fs.mkdirSync(outDir, {recursive: true});
prepareAssets();

const beats = film.beats.map((b, i) => {
  const sentences = splitSentences(b.say).map((s) => {
    const tts = ttsText(s);
    const h = hash(tts);
    return {text: s, tts, wav: path.join(narrDir, `${i}-${h}.wav`), norm: path.join(narrDir, `${i}-${h}.norm.wav`)};
  });
  return {...b, sentences};
});

// ---------- 1. TTS ----------
const jobs = [];
for (const b of beats) for (const s of b.sentences) if (!fs.existsSync(s.wav)) jobs.push([s.tts, s.wav]);
if (jobs.length) {
  const jf = path.join(outDir, `${id}.tts-jobs.json`);
  fs.writeFileSync(jf, JSON.stringify(jobs, null, 1));
  log(`TTS: ${jobs.length} Sätze (Stimme ${VOICE}) …`);
  const r = spawnSync('nice', ['-n', NICE, PY, path.join(ROOT, 'tools', 'tts_generate.py'), '--jobs', jf, '--voice', VOICE], {
    stdio: 'inherit',
    env: {...process.env, TTS_THREADS: process.env.TTS_THREADS || '2'},
  });
  if (r.status !== 0) {
    console.error('TTS fehlgeschlagen');
    process.exit(1);
  }
} else log('TTS: alles im Cache');

// ---------- 2. Normalisieren (wie tools/build-voice.js pack, aber 24 kHz WAV) ----------
for (const b of beats) {
  for (const s of b.sentences) {
    if (fs.existsSync(s.norm)) continue;
    const det = spawnSync('ffmpeg', ['-hide_banner', '-i', s.wav, '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
    const mean = parseFloat((det.match(/mean_volume: (-?[\d.]+)/) || [])[1] || '-20');
    const peak = parseFloat((det.match(/max_volume: (-?[\d.]+)/) || [])[1] || '-1');
    const gain = Math.min(-19 - mean, -1 - peak).toFixed(2);
    execFileSync('ffmpeg', [
      '-loglevel', 'error', '-y', '-i', s.wav, '-af',
      `silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12,areverse,volume=${gain}dB`,
      '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', s.norm,
    ]);
  }
}

// PCM lesen / schreiben
const readPcm = (file) => execFileSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-f', 's16le', '-ac', '1', '-ar', String(SR), '-'], {maxBuffer: 1 << 28});
const wavHeader = (bytes) => {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + bytes, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(bytes, 40);
  return h;
};

// ---------- 3. Beat-Audio, Dauer, Hüllkurve ----------
const propsBeats = [];
for (const [i, b] of beats.entries()) {
  const key = hash(b.sentences.map((s) => s.tts).join('|'));
  const beatWav = path.join(narrDir, `beat-${i}-${key}.wav`);
  const parts = [];
  b.sentences.forEach((s, j) => {
    if (j > 0) parts.push(Buffer.alloc(Math.round(GAP * SR) * 2));
    parts.push(readPcm(s.norm));
  });
  const pcm = Buffer.concat(parts);
  if (!fs.existsSync(beatWav)) fs.writeFileSync(beatWav, Buffer.concat([wavHeader(pcm.length), pcm]));
  const n = pcm.length / 2;
  const dur = n / SR;
  // Hüllkurve: RMS je Frame → 0..1
  const win = Math.round(SR / fps);
  const env = [];
  for (let f = 0; f * win < n; f++) {
    let sum = 0;
    const a = f * win, z = Math.min(n, a + win);
    for (let k = a; k < z; k++) {
      const x = pcm.readInt16LE(k * 2) / 32768;
      sum += x * x;
    }
    env.push(Math.sqrt(sum / Math.max(1, z - a)));
  }
  const sorted = [...env].sort((x, y) => x - y);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1;
  const envN = env.map((x) => {
    const y = Math.min(1, x / ref);
    return y < 0.12 ? 0 : Math.round(y * 100) / 100;
  });
  const {sentences, ...rest} = b;
  propsBeats.push({...rest, audio: `narr/${id}/beat-${i}-${key}.wav`, dur: Math.round(dur * 1000) / 1000, env: envN});
}

// Zeiten wie layoutBeats() in src/FloExplainer.tsx
let from = 0;
const timing = propsBeats.map((b, i) => {
  const pause = b.pause ?? (b.visual?.type === 'title' ? 0.9 : 0.7);
  const extra = i === propsBeats.length - 1 ? 1.0 : 0;
  const lead = Math.round(LEAD * fps);
  const frames = lead + Math.ceil((b.dur + pause + extra) * fps);
  const t = {beat: i, start: +(from / fps).toFixed(2), speechStart: +((from + lead) / fps).toFixed(2), dur: b.dur, end: +((from + frames) / fps).toFixed(2), type: b.visual.type};
  from += frames;
  return t;
});
const totalSec = from / fps;
fs.writeFileSync(path.join(narrDir, 'timing.json'), JSON.stringify({id, fps, total: +totalSec.toFixed(2), beats: timing}, null, 1));
log(`Narration: ${propsBeats.length} Beats, Film ≈ ${totalSec.toFixed(1)} s`);

const props = {
  film: {id, title: film.title, icon: film.icon, accent: film.accent || '#ff8a3d', subject: film.subject},
  fps,
  beats: propsBeats,
};
const propsFile = path.join(outDir, `${id}.props.json`);
fs.writeFileSync(propsFile, JSON.stringify(props));

// ---------- 4. Remotion ----------
const raw = path.join(outDir, `${id}.raw.mp4`);
const tR = Date.now();
log(`Remotion-Render (Concurrency ${CONC}${preview ? ', Vorschau halbe Größe' : ''}) …`);
const rr = spawnSync('nice', ['-n', NICE, 'npx', 'remotion', 'render', 'src/index.ts', 'FloExplainer', raw, `--props=${propsFile}`, `--concurrency=${CONC}`, '--log=error', ...(preview ? ['--scale=0.5'] : [])], {
  cwd: HERE,
  stdio: 'inherit',
});
if (rr.status !== 0) {
  console.error('Remotion-Render fehlgeschlagen');
  process.exit(1);
}
const renderSec = (Date.now() - tR) / 1000;

// ---------- 5. Endkodierung + Poster ----------
const videosDir = preview ? outDir : path.join(ROOT, 'videos');
fs.mkdirSync(videosDir, {recursive: true});
const mp4 = path.join(videosDir, preview ? `${id}.preview.mp4` : `${id}.mp4`);
const budget = Math.max(600 * 1024, (3 * 1024 * 1024 * totalSec) / 90); // ≤ 3 MB pro 90 s
const encode = (q) =>
  execFileSync('nice', ['-n', NICE, 'ffmpeg', '-loglevel', 'error', '-y', '-i', raw,
    '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', String(q), '-pix_fmt', 'yuv420p', '-profile:v', 'main',
    '-color_range', 'tv', '-r', String(fps), '-g', String(fps * 4),
    '-c:a', 'aac', '-ac', '1', '-ar', '44100', '-b:a', '64k', '-movflags', '+faststart', mp4]);
encode(crf);
for (let tries = 0; tries < 3 && !preview && fs.statSync(mp4).size > budget; tries++) {
  crf += 3;
  log(`zu groß (${(fs.statSync(mp4).size / 1048576).toFixed(2)} MB) → crf ${crf}`);
  encode(crf);
}
if (!preview) {
  const ti = Math.max(0, propsBeats.findIndex((b) => b.visual.type === 'title'));
  const tb = timing[ti];
  const at = Math.min(tb.end - 0.15, tb.speechStart + 2.6);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(at), '-i', mp4, '-frames:v', '1', '-vf', 'scale=640:360', '-q:v', '5', path.join(videosDir, `${id}.jpg`)]);
}
if (!flag('--keep')) fs.rmSync(raw, {force: true});

const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).toString());
const size = fs.statSync(mp4).size;
log(`fertig: ${path.relative(ROOT, mp4)}  Dauer ${dur.toFixed(1)} s  Größe ${(size / 1048576).toFixed(2)} MB (${Math.round(size / 1024 / dur)} kB/s, crf ${crf})  Remotion ${renderSec.toFixed(0)} s, gesamt ${((Date.now() - t0) / 1000).toFixed(0)} s`);
