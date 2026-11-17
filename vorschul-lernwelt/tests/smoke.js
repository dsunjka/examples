#!/usr/bin/env node
/* ==========================================================================
   Automatische Tests der Lernwelt.

   Aufruf (im Ordner vorschul-lernwelt):
     node tests/smoke.js                      # alles (parallel)
     node tests/smoke.js --suite=games,data   # nur bestimmte Suiten
     node tests/smoke.js --game=zaehlen,reime # nur bestimmte Spiele (Suite games)
     node tests/smoke.js --level=1            # nur Stufe 1
     node tests/smoke.js --repeat=3           # jede Stufe mehrfach (Zufallsdaten!)
     node tests/smoke.js --workers=6          # Anzahl paralleler Browser-Seiten
     node tests/smoke.js --real               # echte Mausklicks statt Klicks im Seitenkontext (langsamer)
     node tests/smoke.js --shots=/tmp/shots   # Screenshots je Spiel/Stufe (setzt --real)
     node tests/smoke.js --json=ergebnis.json # Ergebnisse als JSON

   Suiten: games (jedes Spiel auf jeder Stufe), app (Menüs, Reise, Kino,
   Forscherbuch, Elternbereich), data, unit, storage, embed, layout, voice
   (siehe tests/suites/checks.js). --app wird noch akzeptiert (alter Aufruf).

   Funktionsweise: Die App läuft mit ?test. Dann markiert ctx.choices die
   richtige Kachel mit [data-test-correct]; Spiele mit eigener Bedienung
   markieren selbst oder registrieren einen Auto-Löser (ctx.testSolve).
   ========================================================================== */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');
const serve = require('./lib/server');
const checks = require('./suites/checks');
const appSuite = require('./suites/app');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);
const ROOT = path.resolve(__dirname, '..');
const TIMEOUT = Number(args.timeout || 45000);
const ALL_SUITES = ['games', 'app', 'data', 'unit', 'storage', 'embed', 'layout', 'voice'];
const suites = args.suite ? String(args.suite).split(',') : args.game || args.level ? ['games'].concat(args.app ? ['app'] : []) : ALL_SUITES;
const REAL = !!(args.real || args.shots);
const WORKERS = Math.max(1, Number(args.workers || Math.min(6, Math.max(2, os.cpus().length))));
const VIEW = { width: Number(args.w || 1180), height: Number(args.h || 820) };

const t00 = Date.now();
const fmt = (ms) => (ms / 1000).toFixed(1) + ' s';

(async () => {
  const { server, port } = await serve(ROOT, { '/__host.html': () => checks.hostPage(port) });
  const url = (p, host = 'localhost') => `http://${host}:${port}${p}`;
  const URL = url('/index.html?test');
  const browser = await chromium.launch();

  /* Fehler pro Seite sammeln */
  const watch = (page, errors) => {
    page.on('pageerror', (e) => errors.push({ type: 'pageerror', text: String(e && e.stack ? e.stack : e) }));
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') errors.push({ type: 'console.' + m.type(), text: m.text() });
    });
    page.on('requestfailed', (r) => { if (!/\.mp4($|\?)/.test(r.url())) errors.push({ type: 'requestfailed', text: r.url() + ' ' + ((r.failure() && r.failure().errorText) || '') }); });
    page.on('response', (r) => { if (r.status() >= 400 && !/favicon|sw\.js/.test(r.url())) errors.push({ type: 'http ' + r.status(), text: r.url() }); });
  };
  const relevant = (errs) => errs.filter((e) => !/favicon|sw\.js|ERR_ABORTED/.test(e.text));

  /* Spiele ermitteln */
  let games = [];
  if (suites.includes('games')) {
    const ctx = await browser.newContext({ viewport: VIEW });
    const p = await ctx.newPage();
    await p.goto(URL);
    await p.waitForFunction(() => window.LT && window.LT.test && window.LT.games);
    const all = await p.evaluate(() => window.LT.gameOrder.map((id) => ({ id, levels: window.LT.games[id].levels })));
    await ctx.close();
    const wanted = args.game ? String(args.game).split(',') : null;
    games = wanted ? all.filter((g) => wanted.includes(g.id)) : all;
    if (wanted) {
      const missing = wanted.filter((w) => !all.find((g) => g.id === w));
      if (missing.length) console.log('⚠️  Nicht registriert:', missing.join(', '));
    }
  }
  if (args.shots) fs.mkdirSync(args.shots, { recursive: true });

  /* Aufgabenliste: lange Prüfungen zuerst, dann die Spiele (gleichmäßig verteilt) */
  const queue = [];
  if (suites.includes('app')) queue.push({ kind: 'check', suite: 'app', name: 'app', run: null });
  for (const j of checks.jobs(suites)) queue.push(Object.assign({ kind: 'check' }, j));
  const repeat = Number(args.repeat || 1);
  for (const g of games) {
    const levels = args.level ? [Number(args.level)].filter((l) => l <= g.levels) : Array.from({ length: g.levels }, (_, i) => i + 1);
    for (const level of levels) for (let r = 0; r < repeat; r++) queue.push({ kind: 'game', id: g.id, level });
  }

  const results = [];
  const print = (r) => {
    const mark = r.ok ? '✅' : '❌';
    if (r.kind === 'game') console.log(`${mark} ${r.id.padEnd(18)} Stufe ${r.level}  ${String(r.ms).padStart(6)} ms  ${r.steps} Schritte ${r.reason ? '– ' + r.reason : ''}`);
    else console.log(`${mark} [${r.suite}] ${r.name}${r.reason ? ' – ' + r.reason : ''}`);
    (r.errors || []).slice(0, 5).forEach((e) => console.log('     ↳', e.type, e.text.split('\n').slice(0, 3).join(' | ')));
  };
  const push = (r) => { results.push(r); if (!args.quiet || !r.ok) print(r); };

  /* Ein Spiel durchspielen – schnell im Seitenkontext oder mit echten Klicks */
  async function playGame(page, errors, job) {
    const errStart = errors.length;
    const t0 = Date.now();
    let ok = false, reason = '', steps = 0;
    try {
      const started = await page.evaluate(([id, lv]) => window.LT.test.start(id, lv), [job.id, job.level]);
      if (!started) throw new Error('start() fehlgeschlagen');
      if (!REAL) {
        const r = await page.evaluate(async (timeout) => {
          const t0 = performance.now();
          const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
          let steps = 0, idle = 0;
          while (performance.now() - t0 < timeout) {
            const st = window.LT.test.state();
            if (st.ended) return { ok: true, steps };
            if (st.hasMark) {
              const n = document.querySelector('[data-test-correct]');
              if (n) {
                // wie ein echter Finger: pointerdown/-up, dann click
                const o = { bubbles: true, cancelable: true, composed: true };
                n.dispatchEvent(new PointerEvent('pointerdown', o));
                n.dispatchEvent(new PointerEvent('pointerup', o));
                n.dispatchEvent(new MouseEvent('click', o));
              }
              steps++; idle = 0;
              await sleep(25);
            } else if (st.hasSolver) {
              window.LT.test.solve();
              steps++; idle = 0;
              await sleep(25);
            } else {
              idle++;
              if (idle > 1200) return { ok: false, steps, reason: 'Keine Markierung/kein Löser gefunden (Spiel hängt?)' };
              await sleep(10);
            }
          }
          return { ok: false, steps, reason: 'Zeitüberschreitung' };
        }, TIMEOUT);
        ok = r.ok; steps = r.steps; reason = r.reason || '';
      } else {
        let idle = 0, shot = false;
        while (Date.now() - t0 < TIMEOUT) {
          const st = await page.evaluate(() => window.LT.test.state());
          if (st.ended) { ok = true; break; }
          if (args.shots && !shot && steps === 1) {
            await page.waitForTimeout(150);
            await page.screenshot({ path: path.join(args.shots, `${job.id}-L${job.level}.png`) });
            shot = true;
          }
          if (st.hasMark) {
            try {
              await page.locator('[data-test-correct]').first().click({ timeout: 1500 });
            } catch (e) {
              await page.evaluate(() => { const n = document.querySelector('[data-test-correct]'); if (n) n.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
            }
            steps++; idle = 0;
          } else if (st.hasSolver) {
            await page.evaluate(() => window.LT.test.solve());
            steps++; idle = 0;
          } else idle++;
          await page.waitForTimeout(st.hasMark || st.hasSolver ? 60 : 40);
          if (idle > 400) { reason = 'Keine Markierung/kein Löser gefunden (Spiel hängt?)'; break; }
        }
        if (!ok && !reason) reason = 'Zeitüberschreitung';
      }
    } catch (e) {
      reason = String(e.message || e);
    }
    const errs = relevant(errors.slice(errStart));
    if (errs.length && ok) { ok = false; reason = 'Fehler in der Konsole'; }
    await page.evaluate(() => window.LT.engine.stop()).catch(() => {});
    return { kind: 'game', id: job.id, level: job.level, ok, reason, ms: Date.now() - t0, steps, errors: errs };
  }

  /* Worker: je eigener Browser-Kontext, holt sich Aufgaben aus der Schlange */
  async function worker() {
    let ctx = null, page = null, errors = [];
    const fresh = async () => {
      if (ctx) await ctx.close().catch(() => {});
      ctx = await browser.newContext({ viewport: VIEW });
      page = await ctx.newPage();
      errors = [];
      watch(page, errors);
      await page.goto(URL);
      await page.waitForFunction(() => window.LT && window.LT.test);
    };
    for (let job = queue.shift(); job; job = queue.shift()) {
      if (job.kind === 'game') {
        if (!page) await fresh();
        const r = await playGame(page, errors, job);
        push(r);
        if (!r.ok) await fresh(); // für den nächsten Test sauber neu laden
        continue;
      }
      // Prüfungen: eigene, frische Kontexte
      const t0 = Date.now();
      const contexts = [];
      const checkErrors = [];
      const env = {
        root: ROOT, port, url,
        newContext: async (opts = {}) => { const c = await browser.newContext(Object.assign({ viewport: VIEW }, opts)); contexts.push(c); return c; },
        newPage: async (opts = {}) => { const c = await env.newContext(opts.viewport ? { viewport: opts.viewport } : {}); const p = await c.newPage(); watch(p, checkErrors); return p; },
        watch: (p) => watch(p, checkErrors),
      };
      try {
        if (job.suite === 'app') {
          const p = await env.newPage();
          await appSuite({ page: p, errors: checkErrors, URL, args, TIMEOUT });
          const errs = relevant(checkErrors);
          push({ kind: 'check', suite: 'app', name: 'App-Bildschirme (Start, Inseln, Flos Reise Teil 1 und 2, Kino, Forscherbuch, Album, Elternbereich)', ok: !errs.length, reason: errs.length ? 'Fehler in der Konsole' : '', errors: errs });
        } else {
          const list = await job.run(env);
          for (const r of list) push(Object.assign({ kind: 'check', suite: job.suite }, r));
          const errs = relevant(checkErrors);
          push({ kind: 'check', suite: job.suite, name: `${job.name}: keine Fehler in der Konsole`, ok: !errs.length, reason: errs.length ? errs.length + ' Fehler' : '', errors: errs });
        }
      } catch (e) {
        push({ kind: 'check', suite: job.suite, name: job.name, ok: false, reason: String(e && e.message ? e.message : e).split('\n')[0] });
      }
      for (const c of contexts) await c.close().catch(() => {});
      if (args.verbose) console.log(`   (${job.name}: ${fmt(Date.now() - t0)})`);
    }
    if (ctx) await ctx.close().catch(() => {});
  }

  await Promise.all(Array.from({ length: WORKERS }, worker));
  await browser.close();
  server.close();

  const failed = results.filter((r) => !r.ok);
  const bySuite = {};
  results.forEach((r) => { const s = r.kind === 'game' ? 'games' : r.suite; bySuite[s] = bySuite[s] || [0, 0]; bySuite[s][0]++; if (!r.ok) bySuite[s][1]++; });
  console.log('\n' + Object.entries(bySuite).map(([s, [n, f]]) => `${s}: ${n - f}/${n}`).join(' · '));
  if (failed.length) { console.log('\nFehlgeschlagen:'); failed.forEach(print); }
  console.log(`\n${results.length - failed.length}/${results.length} bestanden in ${fmt(Date.now() - t00)} (${WORKERS} parallel).`);
  if (args.json) fs.writeFileSync(args.json, JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
