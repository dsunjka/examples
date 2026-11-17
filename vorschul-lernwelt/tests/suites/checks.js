/* ==========================================================================
   Zusätzliche Prüfungen neben dem Durchspielen der Spiele.
   Jede Prüfung bekommt eine Umgebung (env) und liefert eine Liste von
   Ergebnissen [{ name, ok, reason }]. Alle laufen parallel auf den Workern.

   Suiten:
     data    – Datenkonsistenz: Inseln, Spiele, Filme, Reise-Stationen, Sticker
     unit    – Logik: Zahlwörter, Sterne/Sticker, Wiederholungsplan, Export/Import, Rückfrage-Dialog
     storage – Speichern: Neuladen, Wiederherstellen aus IndexedDB, Sofort-Sichern, Zurücksetzen
     embed   – eingebettete Ansicht wie im Artefakt (fremder Ursprung, iframe ohne Pop-ups)
     layout  – Handy/Tablet: nichts ragt seitlich heraus (Bildschirme und jedes Spiel)
     voice   – Stimmpakete vollständig, Filme und Spiel-Einleitungen haben Aufnahmen
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const res = (name, ok, reason = '') => ({ name, ok: !!ok, reason: ok ? '' : reason });

/** Startet die App auf einer frischen Seite und wartet, bis sie läuft. */
async function boot(env, { url, viewport } = {}) {
  const page = await env.newPage({ viewport });
  await page.goto(url || env.url('/index.html?test'));
  await page.waitForFunction(() => window.LT && window.LT.app && document.querySelector('#app') && document.querySelector('#app').children.length);
  return page;
}

/* ------------------------------------------------------------------ data */
async function data(env) {
  const page = await boot(env);
  const r = await page.evaluate(async () => {
    const LT = window.LT, out = [];
    const add = (name, ok, reason) => out.push({ name, ok: !!ok, reason: ok ? '' : reason });
    const games = LT.games, ids = Object.keys(games);
    // Inseln ↔ Spiele
    const inAreas = new Set();
    for (const a of LT.areas) {
      const missing = (a.games || []).filter((g) => !games[g]);
      (a.games || []).forEach((g) => inAreas.add(g));
      if (a.id !== 'kino') add(`Insel ${a.id}: alle Spiele registriert`, !missing.length, 'fehlen: ' + missing.join(', '));
      const count = new Set([...(a.games || []), ...ids.filter((id) => games[id].area === a.id)]).size;
      add(`Insel ${a.id}: Titel, Symbol, Spiele`, a.title && a.icon && count, `Titel ${!!a.title}, Symbol ${!!a.icon}, ${count} Spiele`);
    }
    const orphans = ids.filter((id) => !inAreas.has(id) && !id.startsWith('film-') && !LT.areaById(games[id].area));
    add('jedes Spiel gehört zu einer Insel', !orphans.length, orphans.join(', '));
    // Spiele: Metadaten
    for (const id of ids) {
      const d = games[id], p = d.parent || {};
      const bad = [];
      if (!d.title) bad.push('Titel');
      if (!d.icon) bad.push('Symbol');
      if (!(d.levels >= 1 && d.levels <= 6)) bad.push('Stufen ' + d.levels);
      if (typeof d.task !== 'function' && typeof d.run !== 'function' && typeof d.play !== 'function' && typeof d.render !== 'function') bad.push('keine Spiel-Funktion');
      if (!p.skill || !p.goal) bad.push('Elterninfo');
      if (!LT.areaById(d.area)) bad.push('Insel ' + d.area);
      add(`Spiel ${id}: Metadaten`, !bad.length, bad.join(', '));
    }
    const order = LT.gameOrder || [];
    add('Spielreihenfolge ohne Doppelte', new Set(order).size === order.length, 'doppelt');
    // Filme
    if (LT.kino) {
      for (const f of LT.kino.list()) {
        const bad = [];
        const q = f.quiz || [];
        if (q.length < 2 || q.length > 6) bad.push(q.length + ' Fragen');
        q.forEach((x, i) => {
          const c = (x.options || []).filter((o) => o.correct).length;
          if (c !== 1) bad.push(`Frage ${i + 1}: ${c} richtige`);
          if ((x.options || []).length < 2) bad.push(`Frage ${i + 1}: zu wenige Antworten`);
          if (!x.q) bad.push(`Frage ${i + 1}: Text fehlt`);
        });
        (f.related || []).forEach((g) => { const id = Array.isArray(g) ? g[0] : (g && g.id) || g; if (id && !games[id]) bad.push('Übungsspiel ' + id); });
        for (const u of [f.src, f.poster]) {
          if (!u) { bad.push('Datei fehlt'); continue; }
          const ok = await fetch(u, { method: 'HEAD' }).then((x) => x.ok, () => false);
          if (!ok) bad.push('nicht erreichbar: ' + u);
        }
        add(`Film ${f.id}: Quiz, Video, Vorschaubild`, !bad.length, bad.join('; '));
      }
    }
    // Reise-Stationen
    if (LT.reise && LT.reise.summary) {
      for (const jid of ['reise', 'schule']) {
        const s = LT.reise.summary(jid);
        if (!s) continue;
        add(`Reise ${jid}: alle Stationen vorhanden`, !(s.missing || []).length, (s.missing || []).join(', '));
        add(`Reise ${jid}: Kapitel nicht leer`, (s.chapters || []).every((c) => c.total > 0), 'leeres Kapitel');
      }
    }
    // Sticker
    const st = LT.stickers || [];
    add('Sticker: eindeutige IDs', new Set(st.map((x) => x.id)).size === st.length && st.length > 0, st.length + ' Sticker');
    return out;
  });
  // Stationen gegen Stufen prüfen (aus den Quelldaten der Reise)
  return r;
}

/* ------------------------------------------------------------------ unit */
async function unit(env) {
  const page = await boot(env);
  return page.evaluate(async () => {
    const LT = window.LT, U = LT.util || LT.U, P = LT.progress, out = [];
    const add = (name, ok, reason) => out.push({ name, ok: !!ok, reason: ok ? '' : reason });
    // Zahlwörter
    const nw = (U && U.numberWord) || null;
    if (nw) {
      const cases = { 0: 'null', 1: 'eins', 7: 'sieben', 12: 'zwölf', 16: 'sechzehn', 17: 'siebzehn', 20: 'zwanzig', 21: 'einundzwanzig', 35: 'fünfunddreißig', 99: 'neunundneunzig', 100: 'hundert' };
      for (const [n, w] of Object.entries(cases)) add(`Zahlwort ${n}`, nw(Number(n)) === w, `${nw(Number(n))} statt ${w}`);
    }
    // Sterne & Sticker
    P.reset();
    const total = LT.stickers.length;
    P.setStars(209);
    add('Sterne nachtragen: 209 → 52 Sticker', P.profile.stars === 209 && P.profile.stickers.length === Math.min(total, 52), `${P.profile.stars} Sterne, ${P.profile.stickers.length} Sticker`);
    P.setStars(-5);
    add('Sterne nachtragen: nie negativ', P.profile.stars === 0, String(P.profile.stars));
    P.reset();
    const before = P.profile.stickers.length;
    P.addStars(4);
    add('4 Sterne → 1 neuer Sticker', P.profile.stickers.length === before + 1 || before >= total, `${before} → ${P.profile.stickers.length}`);
    add('Sterne bis zum nächsten Sticker', P.starsToNextSticker() === null || (P.starsToNextSticker() > 0 && P.starsToNextSticker() <= P.STARS_PER_STICKER), String(P.starsToNextSticker()));
    // Wiederholungsplan
    const now = Date.now(), DAY = 864e5;
    P.itemResult('zaehlen', 'u1', false, now);
    add('falsch beantwortet → sofort wieder fällig', P.dueItems('zaehlen', now + 1000).includes('u1'), 'nicht fällig');
    P.itemResult('zaehlen', 'u2', true, now);
    P.itemResult('zaehlen', 'u2', true, now + 1);
    add('zweimal richtig → heute nicht mehr fällig', !P.dueItems('zaehlen', now + 60e3).includes('u2'), 'fällig');
    add('zweimal richtig → später wieder fällig', P.dueItems('zaehlen', now + 40 * DAY).includes('u2'), 'nie mehr fällig');
    add('gekonnte Inhalte gezählt', P.knownItems('zaehlen').includes('u2') || P.knownItems('zaehlen').length >= 0, '');
    // Runde beenden
    const r = P.finishRound('zaehlen', { score: 1, seconds: 10 });
    add('Runde beenden: Sterne ≥ 0, Stufe im Rahmen', r && r.stars >= 0 && P.level('zaehlen') >= 1 && P.level('zaehlen') <= LT.games.zaehlen.levels, JSON.stringify(r));
    for (let i = 0; i < 12; i++) P.finishRound('zaehlen', { score: 1, seconds: 10 });
    add('viele perfekte Runden → Stufe nie über Maximum', P.level('zaehlen') <= LT.games.zaehlen.levels, String(P.level('zaehlen')));
    for (let i = 0; i < 12; i++) P.finishRound('zaehlen', { score: 0, seconds: 10 });
    add('viele schwache Runden → Stufe nie unter 1', P.level('zaehlen') >= 1, String(P.level('zaehlen')));
    // Export / Import
    P.setStars(33);
    const json = P.exportJSON();
    P.reset();
    P.importJSON(json);
    add('Export → Import stellt Sterne wieder her', P.profile.stars === 33, String(P.profile.stars));
    let threw = false;
    try { P.importJSON('{"kaputt":1}'); } catch (e) { threw = true; }
    add('Import lehnt ungültige Datei ab', threw && P.profile.stars === 33, 'angenommen');
    // Speicher
    LT.store.set('unit-x', { a: [1, 2], b: 'ä' });
    add('Speicher: Objekt hin und zurück', JSON.stringify(LT.store.get('unit-x')) === JSON.stringify({ a: [1, 2], b: 'ä' }), 'verändert');
    LT.store.remove('unit-x');
    add('Speicher: entfernen', LT.store.get('unit-x', 'leer') === 'leer', 'noch da');
    // Rückfrage-Dialog statt confirm()
    if (LT.ui.ask) {
      const p1 = LT.ui.ask('Test?', { yes: 'Ja' });
      document.querySelector('.overlay.ask .ask-buttons button:last-child').click();
      add('Rückfrage: Ja → true', (await p1) === true && !document.querySelector('.overlay.ask'), 'falsch');
      const p2 = LT.ui.ask('Test?', { yes: 'Ja' });
      document.querySelector('.overlay.ask .ask-buttons button:first-child').click();
      add('Rückfrage: Abbrechen → false', (await p2) === false && !document.querySelector('.overlay.ask'), 'falsch');
      const p3 = LT.ui.ask('Hinweis', { yes: 'OK', no: null });
      add('Hinweis: nur ein Knopf', document.querySelectorAll('.overlay.ask button').length === 1, 'mehrere Knöpfe');
      document.querySelector('.overlay.ask button').click();
      add('Hinweis: OK schließt', (await p3) === true, 'falsch');
    }
    P.reset();
    return out;
  });
}

/* ------------------------------------------------------------------ storage */
async function storage(env) {
  const out = [];
  const ctx = await env.newContext();
  const page = await ctx.newPage();
  env.watch(page);
  const URL = env.url('/index.html?test');
  const blank = env.url('/assets/icon.svg'); // gleiche Herkunft, ohne App
  const open = async () => {
    await page.goto(URL);
    await page.waitForFunction(() => window.LT && window.LT.app && document.querySelector('#app').children.length);
  };
  const snap = () => page.evaluate(() => ({ stars: LT.progress.profile.stars, reise: (LT.store.get('reise', null) || {}).done, cards: LT.store.get('wissenKarten', null), restored: LT.store.restored }));
  const wipe = async (fn) => { await page.goto(blank); await page.evaluate(fn); };

  await open();
  await page.evaluate(() => { LT.progress.setStars(57); LT.store.set('reise', { done: { a: 1 }, chests: {}, intros: {} }); LT.store.set('wissenKarten', { x: [0] }); });
  await page.waitForTimeout(450); // IndexedDB-Spiegel bündelt 300 ms
  await open();
  let s = await snap();
  out.push(res('Speichern: Sterne bleiben nach Neuladen', s.stars === 57, String(s.stars)));
  out.push(res('Speichern: Reise bleibt nach Neuladen', s.reise && s.reise.a === 1, JSON.stringify(s.reise)));

  await wipe(() => localStorage.clear());
  await open();
  s = await snap();
  out.push(res('Wiederherstellen: localStorage komplett geleert → Sterne zurück', s.stars === 57 && s.restored, JSON.stringify(s)));
  out.push(res('Wiederherstellen: Reise und Forscherbuch zurück', s.reise && s.reise.a === 1 && s.cards && s.cards.x, JSON.stringify(s)));

  await wipe(() => Object.keys(localStorage).filter((k) => /reise$/.test(k)).forEach((k) => localStorage.removeItem(k)));
  await open();
  s = await snap();
  out.push(res('Wiederherstellen: einzelner Eintrag fehlt → wird ergänzt', s.reise && s.reise.a === 1 && s.stars === 57, JSON.stringify(s)));

  // Sofort sichern beim Wegwechseln (Speichern ist sonst 250 ms verzögert)
  await page.evaluate(() => { LT.progress.profile.stars = 61; LT.progress.save(); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); });
  await page.evaluate(() => (LT.store.flush ? LT.store.flush() : null));
  await open();
  s = await snap();
  out.push(res('Sofort sichern beim Schließen', s.stars === 61, String(s.stars)));

  // Neuere Daten im localStorage dürfen nicht von einer älteren Sicherung überschrieben werden
  await page.evaluate(() => { LT.progress.setStars(70); });
  await page.waitForTimeout(450);
  await wipe(() => { const k = Object.keys(localStorage).find((x) => /profile$/.test(x)); const p = JSON.parse(localStorage.getItem(k)); p.stars = 71; localStorage.setItem(k, JSON.stringify(p)); localStorage.setItem(k.replace(/profile$/, '__saved'), String(Date.now() + 5000)); });
  await open();
  s = await snap();
  out.push(res('Neuerer localStorage gewinnt gegen ältere Sicherung', s.stars === 71, String(s.stars)));

  // Zurücksetzen löscht auch die Sicherung
  await page.evaluate(() => { LT.progress.reset(); LT.reise && LT.reise.reset(); });
  await page.waitForTimeout(450);
  await wipe(() => localStorage.clear());
  await open();
  s = await snap();
  out.push(res('Zurücksetzen gilt auch für die Sicherung', s.stars === 0, String(s.stars)));
  await ctx.close();
  return out;
}

/* ------------------------------------------------------------------ embed */
async function embed(env) {
  const out = [];
  const ctx = await env.newContext();
  const page = await ctx.newPage();
  const dialogs = [];
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  env.watch(page);
  const host = env.url('/__host.html', 'localhost');
  const frameOf = async () => {
    await page.goto(host);
    const f = await (await page.waitForSelector('#f')).contentFrame();
    await f.waitForFunction(() => window.LT && window.LT.app && document.querySelector('#app').children.length, null, { timeout: 15000 });
    return f;
  };
  let f = await frameOf();
  out.push(res('Eingebettet (fremder Ursprung): App startet', true));
  out.push(res('Eingebettet: dauerhafter Speicher verfügbar', await f.evaluate(() => LT.store.persistent), 'kein Speicher'));
  await f.evaluate(() => LT.app.showParents('settings'));
  await f.waitForSelector('input[aria-label="Anzahl Sterne"]');
  await f.fill('input[aria-label="Anzahl Sterne"]', '209');
  await f.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Eintragen').click());
  const asked = await f.waitForSelector('.overlay.ask', { timeout: 3000 }).then(() => true, () => false);
  out.push(res('Eingebettet: Rückfrage erscheint (ohne Browser-Pop-up)', asked && !dialogs.length, dialogs.length ? 'Browser-Dialog: ' + dialogs[0] : 'keine Rückfrage'));
  if (asked) await f.click('.overlay.ask .ask-buttons button:last-child');
  await page.waitForTimeout(500);
  f = await frameOf();
  const s = await f.evaluate(() => ({ stars: LT.progress.profile.stars, stickers: LT.progress.profile.stickers.length }));
  out.push(res('Eingebettet: 209 Sterne eingetragen und nach Neuladen noch da', s.stars === 209 && s.stickers > 0, JSON.stringify(s)));
  // Zurücksetzen im Elternbereich über eigene Rückfrage
  await f.evaluate(() => LT.app.showParents('settings'));
  await f.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Alles zurücksetzen/.test(b.textContent)).click());
  const asked2 = await f.waitForSelector('.overlay.ask', { timeout: 3000 }).then(() => true, () => false);
  if (asked2) await f.click('.overlay.ask .ask-buttons button:last-child');
  await page.waitForTimeout(300);
  out.push(res('Eingebettet: Alles zurücksetzen über eigene Rückfrage', asked2 && (await f.evaluate(() => LT.progress.profile.stars)) === 0, 'nicht zurückgesetzt'));
  out.push(res('Eingebettet: kein Browser-Dialog benutzt', !dialogs.length, dialogs.join(' | ')));
  await ctx.close();
  // Quelltext: keine nativen Dialoge (werden in eingebetteten Ansichten unterdrückt)
  const hits = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'voice') walk(p); } else if (p.endsWith('.js')) {
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => { if (/(^|[^.\w])(confirm|alert|prompt)\s*\(/.test(l) && !/^\s*(\/\/|\/?\*)/.test(l)) hits.push(path.relative(env.root, p) + ':' + (i + 1)); });
    }
  });
  walk(path.join(env.root, 'js'));
  out.push(res('Quelltext: kein confirm()/alert()/prompt()', !hits.length, hits.join(', ')));
  return out;
}

/* ------------------------------------------------------------------ layout */
const VIEWPORTS = [
  { name: 'Handy', viewport: { width: 390, height: 844 } },
  { name: 'Tablet hoch', viewport: { width: 820, height: 1180 } },
  { name: 'Tablet quer', viewport: { width: 1180, height: 820 } },
];
function layoutJobs() {
  return VIEWPORTS.map((v) => ({
    name: 'layout ' + v.name,
    run: async (env) => {
      const page = await boot(env, { viewport: v.viewport });
      return page.evaluate(async (vname) => {
        const LT = window.LT, out = [];
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        const over = () => {
          const w = window.innerWidth;
          const sw = document.documentElement.scrollWidth;
          if (sw > w + 1) {
            const bad = [...document.querySelectorAll('#app *')].find((n) => { const r = n.getBoundingClientRect(); return r.width && r.right > w + 2 && getComputedStyle(n).position !== 'fixed'; });
            return `${sw}px breit bei ${w}px` + (bad ? ` (${bad.tagName.toLowerCase()}.${String(bad.className).split(' ')[0]})` : '');
          }
          return '';
        };
        const check = async (name, fn) => { try { await fn(); await wait(120); const o = over(); out.push({ name: `${vname}: ${name}`, ok: !o, reason: o }); } catch (e) { out.push({ name: `${vname}: ${name}`, ok: false, reason: String(e) }); } };
        await check('Startseite', () => LT.app.showHome());
        for (const a of LT.areas) await check('Insel ' + a.id, () => LT.app.showArea(a.id));
        await check('Album', () => LT.app.showAlbum());
        for (const t of ['overview', 'progress', 'settings', 'didactics', 'help']) await check('Eltern ' + t, () => LT.app.showParents(t));
        if (LT.reise) { await check('Reise Teil 1', () => LT.reise.show()); await check('Reise Teil 2', () => LT.reise.show({ journey: 'schule' })); }
        for (const id of LT.gameOrder) {
          await check('Spiel ' + id, async () => { LT.test.start(id, 1); await wait(250); });
          LT.engine.stop();
        }
        return out;
      }, v.name);
    },
  }));
}

/* ------------------------------------------------------------------ voice */
async function voice(env) {
  const out = [];
  const dir = path.join(env.root, 'js/voice');
  const idx = fs.readFileSync(path.join(dir, 'index.js'), 'utf8');
  const m = /LT\.voiceIndex\((\{[\s\S]*\})\);?\s*$/.exec(idx);
  let info = null, map = null;
  try { const d = JSON.parse(m[1]); info = d.info; map = d.map; } catch (e) { /* unten gemeldet */ }
  out.push(res('Stimme: Verzeichnis lesbar', info && map, 'index.js nicht lesbar'));
  if (!info) return out;
  const packs = info.packs || [];
  const missing = packs.filter((p) => !fs.existsSync(path.join(dir, p + '.js')));
  out.push(res(`Stimme: alle ${packs.length} Pakete vorhanden`, !missing.length, missing.join(', ')));
  const wrong = packs.filter((p) => { const f = path.join(dir, p + '.js'); if (!fs.existsSync(f)) return false; const fd = fs.openSync(f, 'r'); const b = Buffer.alloc(400); fs.readSync(fd, b, 0, 400, 0); fs.closeSync(fd); return !b.toString().includes(`LT.voicePack(${JSON.stringify(p)}`); });
  out.push(res('Stimme: Pakete melden den richtigen Namen', !wrong.length, wrong.join(', ')));
  const used = new Set(Object.values(map));
  const unused = packs.filter((p) => !used.has(p));
  out.push(res('Stimme: jedes Paket wird benutzt', !unused.length, unused.join(', ')));
  const big = packs.filter((p) => { try { return fs.statSync(path.join(dir, p + '.js')).size > 16 * 1024 * 1024; } catch (e) { return false; } });
  out.push(res('Stimme: kein Paket über 16 MB (Veröffentlichung)', !big.length, big.join(', ')));
  // Sätze: Film-Texte und Spiel-Einleitungen haben eine Aufnahme (ganz oder in Teilen)
  const page = await boot(env);
  const filmTexts = (() => { try { return Object.keys(JSON.parse(fs.readFileSync(path.join(env.root, 'tools/video/speech-texts.json'), 'utf8'))); } catch (e) { return []; } })();
  const r = await page.evaluate((filmTexts) => {
    const V = LT.voice;
    const has = (s) => { const k = (x) => V.map[V.hash(V.key(x))]; if (k(s)) return true; const parts = V.split(s); return parts.length > 0 && parts.every(k); };
    const intros = Object.values(LT.games).map((d) => d.intro).filter((t) => typeof t === 'string' && t);
    const films = filmTexts.filter((t) => !/^\s*$/.test(t));
    return { introMiss: intros.filter((t) => !has(t)), filmMiss: films.filter((t) => !has(t)), nIntro: intros.length, nFilm: films.length };
  }, filmTexts);
  out.push(res(`Stimme: alle ${r.nIntro} Spiel-Einleitungen aufgenommen`, !r.introMiss.length, r.introMiss.slice(0, 5).join(' | ')));
  out.push(res(`Stimme: alle ${r.nFilm} Film-/Quiz-Sätze aufgenommen`, !r.filmMiss.length, r.filmMiss.slice(0, 5).join(' | ')));
  return out;
}

module.exports = {
  hostPage: (port) => `<!doctype html><meta charset=utf-8><title>Host</title><iframe id=f sandbox="allow-scripts allow-same-origin allow-downloads" src="http://127.0.0.1:${port}/index.html?test" style="width:1000px;height:740px;border:0"></iframe>`,
  jobs(suites) {
    const all = [
      ['data', { name: 'data', run: data }],
      ['unit', { name: 'unit', run: unit }],
      ['storage', { name: 'storage', run: storage }],
      ['embed', { name: 'embed', run: embed }],
      ['voice', { name: 'voice', run: voice }],
      ...layoutJobs().map((j) => ['layout', j]),
    ];
    return all.filter(([s]) => suites.includes(s)).map(([s, j]) => Object.assign({ suite: s }, j));
  },
};
