/* App-Bildschirme: Start, Inseln, Flos Reise Teil 1 und 2, Kino, Forscherbuch,
   Album, Elternbereich. Läuft in einer eigenen, frischen Seite. */
const path = require('path');

module.exports = async function appSuite({ page, errors, URL, args, TIMEOUT }) {
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
    // Teil 2 „Schulabenteuer“: nach Teil 1 frei, eigener Bildschirm, Umschalter
    check(await page.evaluate(() => !window.LT.reise.schoolUnlocked() && window.LT.reise.defaultJourney() === 'reise'), 'Reise: Teil 2 ohne Freischaltung offen');
    await page.evaluate(() => { window.LT.reise.test.completePart1(); window.LT.reise.show({ journey: 'schule' }); });
    await page.waitForTimeout(300);
    check(await page.evaluate(() => window.LT.reise.schoolUnlocked() && window.LT.reise.defaultJourney() === 'schule'), 'Reise: Teil 2 nach Teil 1 nicht frei');
    check(await page.$('.reise-screen.is-schule .reise-parts'), 'Reise: Teil-2-Bildschirm oder Umschalter fehlt');
    await tap('.reise-intro [data-test-station]');
    await page.waitForTimeout(150);
    await snap('reise-teil2');
    check(await tap('.reise-part[data-journey="reise"]'), 'Reise: Umschalter Teil 1 fehlt');
    await page.waitForTimeout(200);
    check(await page.evaluate(() => document.querySelector('.reise-screen').dataset.journey === 'reise'), 'Reise: Umschalten auf Teil 1 klappt nicht');
    // Teil 2: alle Stationen vorhanden, 8–9 je Kapitel; Film-Station spielen, dann Schul-Station starten
    const t2 = await page.evaluate(() => { const s = window.LT.reise.summary('schule'); return { missing: s.missing, sizes: s.chapters.map((c) => c.total) }; });
    check(!t2.missing.length, 'Reise Teil 2: fehlende Spiele ' + t2.missing.join(', '));
    check(t2.sizes.every((n) => n >= 8 && n <= 9), 'Reise Teil 2: Kapitelgrößen ' + t2.sizes.join('/'));
    await page.evaluate(() => window.LT.reise.show({ journey: 'schule' }));
    await page.waitForTimeout(300);
    await tap('.reise-intro [data-test-station]');
    await page.waitForTimeout(150);
    const filmKey = await page.evaluate(() => { const n = document.querySelector('.reise-screen.is-schule .reise-station.current'); return n ? n.dataset.key : null; });
    check(filmKey && filmKey.startsWith('film-'), 'Reise Teil 2: erste Station ist kein Film (' + filmKey + ')');
    await tap('.reise-station.current');
    await page.waitForFunction(() => window.LT.test.state().game, null, { timeout: 5000 }).catch(() => {});
    check(await page.evaluate(() => (window.LT.test.state().game || '').startsWith('film-') && !!document.querySelector('.kino-player')), 'Reise Teil 2: Film-Station startet keinen Film');
    check(await playToEnd(), 'Reise Teil 2: Film-Station hängt');
    await tap('.round-end .btn:not(.btn-primary)');
    await page.waitForTimeout(300);
    check(await page.evaluate((k) => window.LT.app.screen === 'reise' && !!document.querySelector(`.reise-station.done[data-key="${k}"]`), filmKey), 'Reise Teil 2: Film-Station nicht geschafft oder nicht zurück');
    const k1Key = await page.evaluate(() => { const n = document.querySelector('.reise-station.current'); return n ? n.dataset.key : null; });
    await tap('.reise-station.current');
    await page.waitForFunction(() => window.LT.test.state().game, null, { timeout: 5000 }).catch(() => {});
    check(await page.evaluate((k) => { const st = window.LT.test.state(); const [g, lv] = k.split('@'); return st.game === g && window.LT.engine.current.level === Number(lv); }, k1Key || '@'), 'Reise Teil 2: Schul-Station startet nicht auf ihrer Stufe (' + k1Key + ')');
    await page.evaluate(() => window.LT.engine.stop());
    await page.evaluate(() => { window.LT.reise.reset(); window.LT.app.showHome(); });
  }
  // Flos Kino: Insel mit Kinokarten
  if (await page.evaluate(() => !!(window.LT.kino && window.LT.areaById('kino') && window.LT.kino.list().length))) {
    await page.evaluate(() => window.LT.app.showArea('kino'));
    await page.waitForTimeout(150);
    if (!(await page.$('.kino-ticket'))) errors.push({ type: 'kino', text: 'Kino: keine Kinokarten auf der Insel' });
    if (await page.evaluate(() => /\*/.test(document.querySelector('.kino-ticket').textContent))) errors.push({ type: 'kino', text: 'Kino: Sternchen im Filmtitel sichtbar' });
    await page.evaluate(() => document.querySelector('.kino-ticket').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForFunction(() => window.LT.test.state().game, null, { timeout: 5000 }).catch(() => {});
    if (!(await page.evaluate(() => (window.LT.test.state().game || '').startsWith('film-') && !!document.querySelector('.kino-player')))) errors.push({ type: 'kino', text: 'Kino: Kinokarte startet keinen Film' });
    await page.evaluate(() => { window.LT.engine.stop(); window.LT.app.showHome(); });
  }
  // Startseite: Schul-Reihe sichtbar; Tagesabenteuer ohne Schulspiele/Filme, solange die Schule nicht frei ist
  if (await page.evaluate(() => !!window.LT.areaById('mathe1'))) {
    await page.evaluate(() => { window.LT.progress.profile.adventure = null; window.LT.app.showHome(); });
    await page.waitForTimeout(150);
    if (!(await page.$('.school-section'))) errors.push({ type: 'schule', text: 'Startseite: Schul-Reihe fehlt' });
    const bad = await page.evaluate(() => { const LT = window.LT; if (LT.app.schoolUnlocked()) return []; return (LT.progress.profile.adventure || { games: [] }).games.filter((id) => { const a = LT.areaById(LT.games[id].area); return a && (a.grade === 1 || a.id === 'kino'); }); });
    if (bad.length) errors.push({ type: 'schule', text: 'Tagesabenteuer enthält Schulspiele für Vorschulkinder: ' + bad.join(', ') });
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
};
