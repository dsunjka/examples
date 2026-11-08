#!/usr/bin/env node
/* Sammelt ALLE Sätze, die die App sprechen kann: spielt jedes Spiel auf jeder
   Stufe mehrfach (mit gelegentlichen Fehlversuchen für Hilfe-Texte) und
   zeichnet LT.speech.say sowie Vorlese-Texte der Kacheln auf.
   Aufruf: node tools/collect-speech.js --repeat=20 --out=tools/speech-texts.json */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html') + '?test';
const REPEAT = Number(args.repeat || 10);
const OUT = path.resolve(args.out || path.join(ROOT, 'tools/speech-texts.json'));

const HOOK = () => {
  window.__said = window.__said || new Set();
  const norm = (t) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  const add = (t) => { t = norm(t); if (t) window.__said.add(t); };
  const S = window.LT.speech;
  if (!S.__hooked) {
    const orig = S.say.bind(S);
    S.say = (t, o) => { add(t); return orig(t, o); };
    S.__hooked = true;
    const origTile = window.LT.ui.tile;
    window.LT.ui.tile = function (c, o) { if (o && o.say) add(o.say); return origTile.apply(this, arguments); };
  }
};

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage();
  const load = async () => { await page.goto(URL); await page.waitForFunction(() => window.LT && window.LT.test && window.LT.games); await page.evaluate(HOOK); };
  await load();
  // Ergebnis: { "Text": ["spiel-id", ...] } – damit die Aufnahmen später je Spiel gepackt werden können
  const all = new Map(Object.entries(fs.existsSync(OUT) && args.merge ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}));
  const save = () => fs.writeFileSync(OUT, JSON.stringify(Object.fromEntries(Array.from(all.entries()).sort())));
  const games = await page.evaluate(() => window.LT.gameOrder.map((id) => ({ id, levels: window.LT.games[id].levels })));
  const wanted = args.game ? String(args.game).split(',') : null;
  const flush = async (tag) => {
    for (const t of await page.evaluate(() => { const a = Array.from(window.__said); window.__said.clear(); return a; })) {
      const g = all.get(t) || [];
      if (!g.includes(tag)) g.push(tag);
      all.set(t, g);
    }
  };
  for (const g of games.filter((x) => !wanted || wanted.includes(x.id))) {
    const before = all.size;
    for (let lv = 1; lv <= g.levels; lv++) {
      for (let r = 0; r < REPEAT; r++) {
        try {
          await page.evaluate(([id, l]) => window.LT.test.start(id, l), [g.id, lv]);
          const t0 = Date.now();
          let idle = 0;
          while (Date.now() - t0 < 40000) {
            const st = await page.evaluate(() => window.LT.test.state());
            if (st.ended) break;
            if (st.hasMark) {
              // manchmal erst falsch tippen (Hilfe-/Fehlertexte), bis zu 2×
              const wrongs = r % 2 === 0 ? Math.floor(Math.random() * 3) : 0;
              for (let w = 0; w < wrongs; w++) {
                await page.evaluate(() => {
                  const mark = document.querySelector('[data-test-correct]');
                  const box = mark && mark.parentElement;
                  const cands = box ? Array.from(box.children).filter((n) => n !== mark && n.tagName === 'BUTTON' && !n.classList.contains('is-wrong')) : [];
                  if (cands.length) cands[Math.floor(Math.random() * cands.length)].click();
                });
                await page.waitForTimeout(120);
              }
              await page.evaluate(() => { const n = document.querySelector('[data-test-correct]'); if (n) n.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
              idle = 0;
            } else if (st.hasSolver) { await page.evaluate(() => window.LT.test.solve()); idle = 0; } else idle++;
            await page.waitForTimeout(50);
            if (idle > 300) break;
          }
          await page.evaluate(() => window.LT.engine.stop());
        } catch (e) { await load(); }
      }
    }
    await flush(g.id);
    console.log(`${g.id.padEnd(18)} +${all.size - before} (gesamt ${all.size})`);
    save();
  }
  // App-Bildschirme (Start, Welten, Album, Pause …)
  await page.evaluate(() => { window.LT.app.showHome(); });
  for (const a of await page.evaluate(() => window.LT.areas.map((x) => x.id))) { await page.evaluate((id) => window.LT.app.showArea(id), a); await page.waitForTimeout(80); }
  await page.evaluate(() => { window.LT.app.showAlbum(); });
  await page.waitForTimeout(80);
  // Bewegungspausen (zufällige Übung) mehrfach, Zeitlimit, Startbildschirm
  for (let i = 0; i < 40; i++) { await page.evaluate(() => { window.LT.app.showPause(() => {}); document.querySelectorAll('.overlay').forEach((o) => o.remove()); }); }
  await page.evaluate(() => { try { window.LT.app.showLimit(); } catch (e) {} document.querySelectorAll('.overlay').forEach((o) => o.remove()); });
  await page.evaluate(() => {
    const LT = window.LT;
    const say = (t) => LT.speech.say(t);
    // Texte aus app.js mit Platzhaltern – für alle möglichen Werte
    for (let n = 1; n <= LT.stickers.length + 10; n++) say(`Du hast schon ${n} Sticker gesammelt!`);
    LT.stickers.forEach((st) => { say(st.name); say(`Hurra! Du hast das Tagesabenteuer geschafft! Du bekommst einen Bonus-Sticker: ${st.name}!`); });
    LT.areas.forEach((a) => { say(a.hello); say(a.hello + ' Tippe auf ein Spiel!'); });
    say('Hallo! Ich bin Flo, der Fuchs. Schön, dass du da bist! Wohin wollen wir heute reisen?');
    say('Hurra! Du hast das Tagesabenteuer geschafft!');
  });
  await page.evaluate(() => { const b = document.querySelector('.splash .btn'); if (b) b.click(); });
  await page.waitForTimeout(80);
  await flush('app');
  save();
  console.log('Gesamt:', all.size, 'Zeichen:', Array.from(all.keys()).join(' ').length);
  await browser.close();
})();
