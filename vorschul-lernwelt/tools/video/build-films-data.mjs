#!/usr/bin/env node
// Baut js/data/films.js (für die App, Schema siehe Kopf von js/games/kino/_shared.js) und tools/video/speech-texts.json (für die Sprach-Pipeline)
// aus allen tools/video/films/*.json. Dateien/IDs, die mit "_" beginnen, werden übersprungen.
//   node build-films-data.mjs
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const ORDER = ['kraft-der-zehn', 'ueber-die-zehn', 'verdoppeln', 'uhrzeit', 'geld', 'silben', 'wort-schreiben', 'satz-zug', 'schulweg', 'igel-winter', 'schwimmen-sinken', 'zaehne'];
const FPS = 24;

const estimateDur = (say) => Math.max(1.5, String(say || '').split(/\s+/).filter(Boolean).length / 2.4 + 0.3);
const estimateFilm = (beats) =>
  beats.reduce((a, b, i) => a + 0.3 + estimateDur(b.say) + (b.pause ?? (b.visual?.type === 'title' ? 0.9 : 0.7)) + (i === beats.length - 1 ? 1 : 0), 0);
const probe = (file) => {
  try {
    return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());
  } catch {
    return null;
  }
};

const files = fs.readdirSync(path.join(HERE, 'films')).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
const films = [];
const problems = [];
for (const f of files) {
  const film = JSON.parse(fs.readFileSync(path.join(HERE, 'films', f), 'utf8'));
  const id = film.id || path.basename(f, '.json');
  if (id.startsWith('_')) continue;
  if (id !== path.basename(f, '.json')) problems.push(`${f}: id "${id}" passt nicht zum Dateinamen`);
  const mp4 = path.join(ROOT, 'videos', `${id}.mp4`);
  const timingFile = path.join(HERE, 'public', 'narr', id, 'timing.json');
  const timing = fs.existsSync(timingFile) ? JSON.parse(fs.readFileSync(timingFile, 'utf8')) : null;
  const ready = fs.existsSync(mp4);
  const duration = Math.round((ready && probe(mp4)) || (timing && timing.total) || estimateFilm(film.beats || []));
  const quiz = (film.quiz || []).map((q, qi) => {
    const item = {
      q: q.q,
      options: (q.options || []).map((o) => ({text: o.text, say: o.say ?? o.text, correct: !!o.correct})),
      explain: q.explain,
      model: q.model,
    };
    if (q.hint) item.hint = q.hint;
    if (q.key) item.key = q.key;
    if (typeof q.beat === 'number' && timing && timing.beats[q.beat]) item.at = timing.beats[q.beat].start;
    if (item.options.filter((o) => o.correct).length !== 1) problems.push(`${id}: Quizfrage ${qi + 1} braucht genau eine richtige Antwort`);
    return item;
  });
  films.push({
    id,
    title: film.title,
    icon: film.icon,
    subject: film.subject,
    src: `videos/${id}.mp4`,
    poster: `videos/${id}.jpg`,
    duration,
    ready,
    related: film.related || [],
    parent: film.parent || '',
    intro: film.intro || '',
    quiz,
  });
}
const rank = (id) => (ORDER.includes(id) ? ORDER.indexOf(id) : 100);
films.sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));

if (!films.length && !process.argv.includes('--force')) {
  console.log('Keine Filme in films/ (ohne _-Testfilme) – js/data/films.js bleibt unverändert (--force schreibt eine leere Liste).');
  process.exit(0);
}
const js =
  '/* Erklärfilme mit Flo – automatisch erzeugt von tools/video/build-films-data.mjs. Nicht von Hand bearbeiten. */\n' +
  '(function () {\n  window.LT = window.LT || {};\n  window.LT.films = ' +
  JSON.stringify(films, null, 2).replace(/\n/g, '\n  ') +
  ';\n})();\n';
fs.writeFileSync(path.join(ROOT, 'js', 'data', 'films.js'), js);

// Gesprochene App-Texte (Intro + Quiz) für tools/build-voice.js
const speech = {};
const add = (t, id) => {
  if (!t || typeof t !== 'string') return;
  const k = t.trim();
  if (!k) return;
  speech[k] = speech[k] || [];
  if (!speech[k].includes('film-' + id)) speech[k].push('film-' + id);
};
for (const film of films) {
  add(film.intro, film.id);
  for (const q of film.quiz) {
    add(q.q, film.id);
    q.options.forEach((o) => add(o.say, film.id));
    add(q.explain, film.id);
    add(q.model, film.id);
  }
}
fs.writeFileSync(path.join(HERE, 'speech-texts.json'), JSON.stringify(speech, null, 1) + '\n');

console.log(`${films.length} Filme → js/data/films.js (${films.filter((f) => f.ready).length} gerendert), ${Object.keys(speech).length} Sprechtexte → tools/video/speech-texts.json`);
if (problems.length) {
  console.error('Hinweise:\n  - ' + problems.join('\n  - '));
  process.exitCode = 1;
}
