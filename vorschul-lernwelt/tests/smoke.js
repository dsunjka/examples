#!/usr/bin/env node
/* ==========================================================================
   Automatischer Rauchtest: spielt JEDES Spiel auf JEDER Stufe einmal durch.

   Aufruf (im Ordner vorschul-lernwelt):
     node tests/smoke.js                      # alle Spiele, alle Stufen
     node tests/smoke.js --game=zaehlen,reime # nur bestimmte Spiele
     node tests/smoke.js --level=1            # nur Stufe 1
     node tests/smoke.js --shots=/tmp/shots   # Screenshots je Spiel/Stufe
     node tests/smoke.js --app                # zusätzlich Menüs, Flos Reise, Forscherbuch, Elternbereich prüfen
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
    // Flos Reise: Bildschirm öffnen, Einleitung schließen, eine Station spielen, zurück zur Reise
    if (await page.evaluate(() => !!window.LT.reise)) {
      const tap = async (sel) => page.evaluate((s) => { const n = document.querySelector(s); if (n) n.dispatchEvent(new MouseEvent('click', { bubbles: true })); return !!n; }, sel);
      const check = (cond, msg) => { if (!cond) errors.push({ type: 'reise', text: msg }); };
      const playToEnd = async () => {
        const t0 = Date.now();
        while (Date.now() - t0 < TIMEOUT) {
          const st = await page.evaluate(() => window.LT.test.state());
          if (st.ended) return true;
          if (st.hasMark) await tap('[data-test-correct]');
          else if (st.hasSolver) await page.evaluate(() => window.LT.test.solve());
          await page.waitForTimeout(50);
        }
        return false;
      };
      // Einleitung gilt erst als gesehen, wenn sie erscheint: sofort verlassen → beim nächsten Mal wieder da
      await page.evaluate(() => { window.LT.reise.show(); window.LT.app.showHome(); });
      await page.waitForTimeout(400);
      check(await page.evaluate(() => !(window.LT.store.get('reise', {}).intros || {}).wald), 'Reise: Einleitung als gesehen gespeichert, obwohl nie gezeigt');
      await page.evaluate(() => window.LT.reise.show());
      await page.waitForTimeout(400);
      check(await page.$('.reise-screen .reise-station.current'), 'Reise: keine aktuelle Station');
      check(await tap('.reise-intro [data-test-station]'), 'Reise: Kapitel-Einleitung fehlt');
      await page.waitForTimeout(150);
      await snap('reise');
      const before = await page.evaluate(() => window.LT.reise.summary().done);
      await tap('.reise-station.current');
      await page.waitForFunction(() => window.LT.test.state().game, null, { timeout: 5000 });
      const stationLevel = await page.evaluate(() => window.LT.engine.current.level);
      await playToEnd();
      // „Nochmal“ am Rundenende: feste Stationsstufe bleibt erhalten
      check(await tap('.round-end .btn.btn-primary'), 'Reise: Nochmal-Knopf fehlt');
      await page.waitForFunction(() => window.LT.test.state().game && !window.LT.test.state().ended, null, { timeout: 5000 }).catch(() => {});
      check(await page.evaluate((lv) => !!window.LT.engine.current && window.LT.engine.current.level === lv && window.LT.engine.current.opts.level === lv, stationLevel), 'Reise: Nochmal hat die Stationsstufe verloren');
      await playToEnd();
      check(await tap('.round-end .btn:not(.btn-primary)'), 'Reise: Rundenende nicht erreicht');
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => ({ done: window.LT.reise.summary().done, screen: window.LT.app.screen }));
      check(after.screen === 'reise', 'Reise: nach dem Spiel nicht zur Reise zurückgekehrt (' + after.screen + ')');
      check(after.done === before + 1, 'Reise: Station nicht als geschafft gespeichert');
      await snap('reise-after');
      // Geschaffte Station nochmal spielen (erst Ansage, dann Start)
      check(await tap('.reise-station.done'), 'Reise: geschaffte Station fehlt');
      await page.waitForFunction(() => window.LT.test.state().game, null, { timeout: 3000 }).catch(() => {});
      check(await page.evaluate(() => window.LT.app.screen !== 'reise' && !!window.LT.test.state().game), 'Reise: geschaffte Station startet nicht erneut');
      await page.evaluate(() => { window.LT.engine.stop(); window.LT.reise.show(); });
      await page.waitForTimeout(200);
      // Kapitel-Schatzkiste mit Bonus-Sticker
      const stickers = await page.evaluate(() => window.LT.progress.profile.stickers.length);
      await page.evaluate(() => { window.LT.reise.test.completeChapter(0); window.LT.reise.show(); });
      await page.waitForTimeout(200);
      check(await tap('.reise-chest.ready'), 'Reise: Schatzkiste nicht bereit');
      await page.waitForSelector('.reise-chest-overlay [data-test-station]', { timeout: 3000 }).catch(() => {});
      await snap('reise-chest');
      check(await tap('.reise-chest-overlay [data-test-station]'), 'Reise: Schatzkisten-Knopf fehlt');
      await page.waitForTimeout(300);
      const full = await page.evaluate((n) => n >= window.LT.stickers.length, stickers);
      check(full || (await page.evaluate(() => window.LT.progress.profile.stickers.length)) === stickers + 1, 'Reise: kein Bonus-Sticker');
      check(await page.$('.reise-intro'), 'Reise: neues Kapitel nicht enthüllt');
      await tap('.reise-intro [data-test-station]');
      await page.evaluate(() => window.LT.reise.reset());
    }
    // Forscherbuch (Startseite und Forscherwelt-Insel)
    if (await page.evaluate(() => !!(window.LT.wissen && window.LT.wissen.showBook))) {
      const tap = async (sel) => page.evaluate((s) => { const n = document.querySelector(s); if (n) n.dispatchEvent(new MouseEvent('click', { bubbles: true })); return !!n; }, sel);
      const check = (cond, msg) => { if (!cond) errors.push({ type: 'buch', text: msg }); };
      const counter = () => page.evaluate(() => { const c = document.querySelector('.wz-book-screen .wz-counter'); return c ? c.textContent.replace(/\s+/g, ' ').trim() : ''; });
      const expected = () => page.evaluate(() => window.LT.wissen.cardCount() + ' von ' + window.LT.wissen.totalCards());
      // Mit leerer Sammlung starten (die Spiel-Tests vorher haben schon Karten gesammelt)
      const savedCards = await page.evaluate(() => { const c = window.LT.store.get('wissenKarten', {}); window.LT.store.set('wissenKarten', {}); return c; });
      await page.evaluate(() => window.LT.app.showHome());
      await page.waitForTimeout(150);
      check(await tap('.book-cta'), 'Buch: Knopf auf der Startseite fehlt');
      await page.waitForTimeout(300);
      check(await page.$('.wz-book-screen'), 'Buch: Bildschirm fehlt (Startseite)');
      check(await page.evaluate(() => window.LT.app.screen === 'book'), 'Buch: Bildschirm nicht als book markiert');
      check((await counter()).endsWith(await expected()), 'Buch: Kartenzähler stimmt nicht');
      await snap('forscherbuch');
      // gesammelte Karte: groß anzeigen und schließen
      await page.evaluate(() => { window.LT.wissen.addCard('w-sinne', 0); window.LT.app.openBook(window.LT.app.showHome); });
      await page.waitForTimeout(250);
      check((await counter()).endsWith(await expected()), 'Buch: Kartenzähler nach neuer Karte falsch');
      check(await tap('.wz-mini-card.owned'), 'Buch: gesammelte Karte fehlt');
      await page.waitForTimeout(150);
      check(await page.$('.wz-card-overlay'), 'Buch: Karten-Overlay öffnet nicht');
      await tap('.wz-card-overlay .wz-ov-ok');
      await page.waitForTimeout(400);
      check(!(await page.$('.wz-card-overlay')), 'Buch: Karten-Overlay schließt nicht');
      // fehlende Karte: Reise aus dem Buch spielen, Zurück landet wieder im Buch
      check(await tap('.wz-mini-card.missing'), 'Buch: fehlende Karte fehlt');
      await page.waitForTimeout(150);
      check(await page.$('.wz-card-overlay'), 'Buch: Overlay für fehlende Karte öffnet nicht');
      if (await tap('.wz-card-overlay .wz-ov-play')) {
        await page.waitForFunction(() => window.LT.test.state().game, null, { timeout: 3000 }).catch(() => {});
        check(await page.evaluate(() => !!window.LT.test.state().game), 'Buch: Spiel startet nicht aus dem Buch');
        await tap('.game-screen .btn-round[aria-label="Zurück"]');
        await page.waitForTimeout(400);
        check(await page.evaluate(() => window.LT.app.screen === 'book' && !!document.querySelector('.wz-book-screen')), 'Buch: nach Zurück nicht im Forscherbuch');
      } else check(false, 'Buch: Spielen-Knopf fehlt');
      await page.evaluate(() => { document.querySelectorAll('.overlay').forEach((o) => o.remove()); });
      // Knopf auf der Forscherwelt-Insel
      if (await page.evaluate(() => !!window.LT.areaById('wissen'))) {
        await page.evaluate(() => window.LT.app.showArea('wissen'));
        await page.waitForTimeout(150);
        check(await tap('.area-book-row .btn'), 'Buch: Knopf auf der Forscherwelt-Insel fehlt');
        await page.waitForTimeout(300);
        check(await page.$('.wz-book-screen'), 'Buch: Bildschirm fehlt (Insel)');
      }
      await page.evaluate((c) => window.LT.store.set('wissenKarten', c), savedCards);
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
    console.log(`${errs.length ? '❌' : '✅'} App-Bildschirme (Start, Inseln, Flos Reise, Forscherbuch, Album, Elternbereich)`);
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
