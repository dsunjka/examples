#!/usr/bin/env node
/* ==========================================================================
   Automatischer Rauchtest: spielt JEDES Spiel auf JEDER Stufe einmal durch.

   Aufruf (im Ordner vorschul-lernwelt):
     node tests/smoke.js                      # alle Spiele, alle Stufen
     node tests/smoke.js --game=zaehlen,reime # nur bestimmte Spiele
     node tests/smoke.js --level=1            # nur Stufe 1
     node tests/smoke.js --shots=/tmp/shots   # Screenshots je Spiel/Stufe
     node tests/smoke.js --app                # zusätzlich Menüs/Elternbereich prüfen
     node tests/smoke.js --repeat=3           # jede Stufe mehrfach (Zufallsdaten!)

   Funktionsweise: Die App läuft mit ?test. Dann markiert ctx.choices die
   richtige Kachel mit [data-test-correct]; Spiele mit eigener Bedienung
   markieren selbst oder registrieren einen Auto-Löser (ctx.testSolve).
   ========================================================================== */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);
const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html') + '?test';
const TIMEOUT = Number(args.timeout || 45000);

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: Number(args.w || 1180), height: Number(args.h || 820) } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push({ type: 'pageerror', text: String(e && e.stack ? e.stack : e) }));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push({ type: 'console.' + m.type(), text: m.text() });
  });
  page.on('requestfailed', (r) => errors.push({ type: 'requestfailed', text: r.url() }));

  await page.goto(URL);
  await page.waitForFunction(() => window.LT && window.LT.test && window.LT.games);
  const all = await page.evaluate(() => window.LT.gameOrder.map((id) => ({ id, levels: window.LT.games[id].levels, type: window.LT.games[id].type, area: window.LT.games[id].area })));
  const wanted = args.game ? String(args.game).split(',') : null;
  const games = wanted ? all.filter((g) => wanted.includes(g.id)) : all;
  if (wanted) {
    const missing = wanted.filter((w) => !all.find((g) => g.id === w));
    if (missing.length) console.log('⚠️  Nicht registriert:', missing.join(', '));
  }
  if (args.shots) fs.mkdirSync(args.shots, { recursive: true });

  const results = [];
  const repeat = Number(args.repeat || 1);
  for (const g of games) {
    const levels = args.level ? [Number(args.level)].filter((l) => l <= g.levels) : Array.from({ length: g.levels }, (_, i) => i + 1);
    for (const level of levels) {
      for (let r = 0; r < repeat; r++) {
        const errStart = errors.length;
        const t0 = Date.now();
        let ok = false;
        let reason = '';
        let shot = false;
        let steps = 0;
        try {
          const started = await page.evaluate(([id, lv]) => window.LT.test.start(id, lv), [g.id, level]);
          if (!started) throw new Error('start() fehlgeschlagen');
          let idle = 0;
          while (Date.now() - t0 < TIMEOUT) {
            const st = await page.evaluate(() => window.LT.test.state());
            if (st.ended) { ok = true; break; }
            if (args.shots && !shot && steps === 1) {
              await page.waitForTimeout(150);
              await page.screenshot({ path: path.join(args.shots, `${g.id}-L${level}.png`) });
              shot = true;
            }
            if (st.hasMark) {
              const loc = page.locator('[data-test-correct]').first();
              try {
                await loc.click({ timeout: 1500 });
                steps++;
                idle = 0;
              } catch (e) {
                // evtl. verdeckt/animiert – per JS klicken
                await page.evaluate(() => { const n = document.querySelector('[data-test-correct]'); if (n) n.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
                steps++;
              }
            } else if (st.hasSolver) {
              await page.evaluate(() => window.LT.test.solve());
              steps++;
              idle = 0;
            } else {
              idle++;
            }
            await page.waitForTimeout(st.hasMark || st.hasSolver ? 60 : 40);
            if (idle > 400) { reason = 'Keine Markierung/kein Löser gefunden (Spiel hängt?)'; break; }
          }
          if (!ok && !reason) reason = 'Zeitüberschreitung';
        } catch (e) {
          reason = String(e.message || e);
        }
        const errs = errors.slice(errStart).filter((e) => !/favicon/.test(e.text));
        if (errs.length && ok) { ok = false; reason = 'Fehler in der Konsole'; }
        results.push({ id: g.id, level, ok, reason, ms: Date.now() - t0, steps, errors: errs });
        const mark = ok ? '✅' : '❌';
        console.log(`${mark} ${g.id.padEnd(18)} Stufe ${level}  ${String(Date.now() - t0).padStart(6)} ms  ${steps} Schritte ${reason ? '– ' + reason : ''}`);
        errs.slice(0, 5).forEach((e) => console.log('     ↳', e.type, e.text.split('\n').slice(0, 3).join(' | ')));
        await page.evaluate(() => window.LT.engine.stop());
        if (!ok) {
          // für den nächsten Test sauber neu laden
          await page.goto(URL);
          await page.waitForFunction(() => window.LT && window.LT.test);
        }
      }
    }
  }

  if (args.app) {
    const errStart = errors.length;
    await page.goto(URL);
    await page.waitForFunction(() => window.LT && window.LT.app);
    const shotsDir = args.shots || null;
    const snap = async (name) => shotsDir && page.screenshot({ path: path.join(shotsDir, `app-${name}.png`) });
    await page.evaluate(() => window.LT.app.showHome());
    await page.waitForTimeout(200);
    await snap('home');
    for (const a of await page.evaluate(() => window.LT.areas.map((x) => x.id))) {
      await page.evaluate((id) => window.LT.app.showArea(id), a);
      await page.waitForTimeout(150);
      await snap('area-' + a);
    }
    await page.evaluate(() => window.LT.app.showAlbum());
    await page.waitForTimeout(150);
    await snap('album');
    await page.evaluate(() => window.LT.app.parentGate(() => window.LT.app.showParents()));
    const answer = await page.getAttribute('.overlay.gate', 'data-answer');
    for (const ch of answer) await page.click(`.keypad button:text-is("${ch}")`);
    await page.click('.keypad button:text-is("OK")');
    await page.waitForSelector('.parents');
    for (const tab of ['overview', 'progress', 'settings', 'didactics', 'help']) {
      await page.evaluate((t) => window.LT.app.showParents(t), tab);
      await page.waitForTimeout(120);
      await snap('parents-' + tab);
    }
    const errs = errors.slice(errStart).filter((e) => !/favicon/.test(e.text));
    results.push({ id: 'app-screens', level: 0, ok: errs.length === 0, reason: errs.length ? 'Fehler in der Konsole' : '', errors: errs });
    console.log(`${errs.length ? '❌' : '✅'} App-Bildschirme (Start, Inseln, Album, Elternbereich)`);
    errs.slice(0, 8).forEach((e) => console.log('     ↳', e.type, e.text.split('\n').slice(0, 3).join(' | ')));
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} bestanden.`);
  if (args.json) fs.writeFileSync(args.json, JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
