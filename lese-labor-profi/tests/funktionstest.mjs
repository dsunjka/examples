#!/usr/bin/env node
// Automatischer Funktionstest für Lese-Labor PROFI (Playwright, iPad-Emulation).
//   node tests/funktionstest.mjs [pfad-zur-html]   (Standard: dist/lese-labor-profi.html)
// Startet einen kleinen lokalen Server, klickt alle Hauptfunktionen durch und meldet Fehler.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { profilAnlegen, aktuellesItem, beantworte } from './hilfen.mjs';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATEI = resolve(process.argv[2] || join(ROOT, 'dist', 'lese-labor-profi.html'));
const SHOTS = process.env.SHOTS || '';
if (!existsSync(DATEI)) { console.error('Datei fehlt:', DATEI); process.exit(2); }

const server = createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(readFileSync(DATEI)); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL = `http://127.0.0.1:${server.address().port}/`;

let fehler = 0, ok = 0;
const check = (bed, text) => { if (bed) { ok++; } else { fehler++; console.log('  ✗ ' + text); } };
const schritt = (t) => console.log('• ' + t);

const browser = await chromium.launch();
async function neueSeite(device = 'iPad Pro 11 landscape', vorher) {
  const ctx = await browser.newContext({ ...devices[device] });
  const page = await ctx.newPage();
  page.fehlerliste = [];
  page.on('pageerror', (e) => page.fehlerliste.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.fehlerliste.push('console: ' + m.text()); });
  page.on('dialog', (d) => { page.fehlerliste.push('nativer Dialog: ' + d.message()); d.dismiss(); });
  if (vorher) await page.addInitScript(vorher);
  await page.goto(URL);
  return page;
}
const shot = async (page, name) => { if (SHOTS) { mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: join(SHOTS, name + '.png') }); } };
async function keinUeberlauf(page, wo) {
  const w = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  check(w.s <= w.c + 1, `${wo}: waagerechter Überlauf (${w.s} > ${w.c})`);
}
try {
  /* ---------- 1. Profil & Start ---------- */
  schritt('Profil anlegen, Startseite');
  let page = await neueSeite();
  check(await page.isVisible('#profil-form'), 'Profilformular fehlt');
  await shot(page, '01-profil');
  await profilAnlegen(page);
  check(await page.isVisible('.labor-karte'), 'Laborkarten fehlen');
  await keinUeberlauf(page, 'Start quer');
  await shot(page, '02-start');

  /* ---------- 2. Training mit allen Itemtypen ---------- */
  schritt('Training: alle Aufgabentypen richtig lösen');
  const typenGesehen = new Set();
  for (const modul of ['digital', 'lesen', 'rechtschreibung', 'grammatik', 'schreiben']) {
    await page.click('[data-nav="start"]');
    const karte = await page.$(`.labor-karte[data-nav="${modul}"]:not([disabled])`);
    if (!karte) continue;
    await karte.click();
    await page.waitForSelector('.modul-kopf');
    await keinUeberlauf(page, `Modulseite ${modul}`);
    await page.click('[data-act="training-gruppe"]');
    await page.waitForSelector('.frage-karte');
    for (let n = 0; n < 12; n++) {
      const it = await aktuellesItem(page);
      if (!it) break;
      typenGesehen.add(it.typ);
      await beantworte(page, it, true);
      await page.click('[data-act="s-pruefen"]');
      const r = await page.$('.rueckmeldung.r');
      check(!!r, `${modul} ${it.id} (${it.typ}): richtige Antwort nicht als richtig erkannt`);
      if (!r) { await page.click('[data-act="s-loesung"]').catch(() => {}); }
      const weiter = await page.$('[data-act="s-weiter"]');
      if (!weiter) break;
      const fertig = (await weiter.textContent()).includes('Fertig');
      await weiter.click();
      if (fertig) break;
    }
    await page.waitForSelector('.ergebnis-kopf');
    check((await page.textContent('.titel-urkunde')).length > 0, `${modul}: Zusammenfassung fehlt`);
    await keinUeberlauf(page, `Zusammenfassung ${modul}`);
  }
  console.log('  Typen getestet:', [...typenGesehen].join(', '));

  /* ---------- 2b. Jede Aufgabe aller Gruppen über die Oberfläche lösbar ---------- */
  schritt('Alle Aufgaben aller Fälle, Texte und Themen richtig lösen');
  {
    let geloest = 0, gesamt = 0;
    for (const modul of ['digital', 'lesen', 'rechtschreibung', 'grammatik', 'schreiben']) {
      await page.click('[data-nav="start"]');
      if (!(await page.$(`.labor-karte[data-nav="${modul}"]:not([disabled])`))) continue;
      await page.click(`.labor-karte[data-nav="${modul}"]`);
      const anzahl = (await page.$$('[data-act="training-gruppe"]')).length;
      for (let g = 0; g < anzahl; g++) {
        await page.click('[data-nav="start"]');
        await page.click(`.labor-karte[data-nav="${modul}"]`);
        await (await page.$$('[data-act="training-gruppe"]'))[g].click();
        await page.waitForSelector('.frage-karte');
        for (let n = 0; n < 20; n++) {
          const it = await aktuellesItem(page);
          if (!it) break;
          gesamt++;
          await beantworte(page, it, true);
          await page.click('[data-act="s-pruefen"]');
          if (await page.$('.rueckmeldung.r')) geloest++;
          else { check(false, `${it.id} (${it.typ}) lässt sich nicht richtig lösen`); await page.click('[data-act="s-loesung"]').catch(() => {}); }
          const weiter = await page.$('[data-act="s-weiter"]');
          if (!weiter) break;
          const fertig = (await weiter.textContent()).includes('Fertig');
          await weiter.click();
          if (fertig) break;
        }
        await page.waitForSelector('.ergebnis-kopf');
      }
    }
    console.log(`  ${geloest} von ${gesamt} Aufgaben über die Oberfläche richtig gelöst`);
    check(geloest === gesamt && gesamt > 0, 'nicht alle Aufgaben lösbar');
  }

  /* ---------- 3. Falsch-Pfad, Tipp, Lösung ---------- */
  schritt('Training: falsche Antwort, Tipp, zweiter Versuch, Lösung');
  await page.click('[data-nav="start"]');
  await page.click('.labor-karte[data-nav="digital"]');
  await page.click('[data-act="training-gruppe"]');
  await page.waitForSelector('.frage-karte');
  let it = await aktuellesItem(page);
  check(await page.isVisible('[data-act="s-tipp"]'), 'Tipp-Knopf fehlt');
  await page.click('[data-act="s-tipp"]');
  check(await page.isVisible('.tipp-box'), 'Tipp wird nicht angezeigt');
  await beantworte(page, it, false);
  await page.click('[data-act="s-pruefen"]');
  check(await page.isVisible('.rueckmeldung.f, .rueckmeldung.t'), 'falsche Antwort nicht erkannt');
  check(await page.isVisible('[data-act="s-nochmal"]'), 'Nochmal-Knopf fehlt');
  await page.click('[data-act="s-nochmal"]');
  await page.click('[data-act="s-pruefen"]');
  check(await page.isVisible('.rueckmeldung.l'), 'nach dem 2. Fehlversuch keine Lösung');
  check((await page.$$('.opt.ok, .opt.fehlt, .matrix-zeile.ok, .matrix-zeile.nein, .luecke.ok, .tok.fehlt, .chip.ok, .reihe-el.ok')).length > 0, 'Lösung wird nicht markiert');

  /* ---------- 4. Simulierter Browser und Textmarker ---------- */
  schritt('Simulierter Browser: Links, Zurück, Textmarker, Groß-Ansicht');
  const vorher = await page.getAttribute('.web', 'data-seite');
  const link = await page.$(`.quelle-flaeche [data-ziel]:not([data-ziel="${vorher}"])`);
  check(!!link, 'kein Link in der Quelle');
  if (link) {
    const ziel = await link.getAttribute('data-ziel');
    await link.click();
    check((await page.getAttribute('.web', 'data-seite')) === ziel, 'Link öffnet die Zielseite nicht');
    await page.click('[data-act="b-zurueck"]');
    check((await page.getAttribute('.web', 'data-seite')) === vorher, 'Zurück-Knopf funktioniert nicht');
  }
  await page.click('[data-act="q-marker"]');
  const absatz = await page.$('.quelle-flaeche [data-tm]');
  if (absatz) { await absatz.click(); check(await absatz.evaluate((e) => e.classList.contains('tm')), 'Textmarker markiert nicht'); }
  await page.click('[data-act="q-marker"]');
  await page.click('[data-act="q-gross"]');
  check(await page.isVisible('.arbeit.quelle-gross'), 'Groß-Ansicht fehlt');
  await page.click('[data-act="q-gross"]');
  await shot(page, '03-training');
  const ext = await page.$('.quelle-flaeche [data-extern]');
  if (ext) { await ext.click(); check(await page.isVisible('#toast'), 'externer Link zeigt keinen Hinweis'); }

  /* ---------- 5. Prüfung inkl. Unterbrechen und Fortsetzen ---------- */
  schritt('BYLET-D-Prüfung: beantworten, markieren, unterbrechen, neu laden, fortsetzen, abgeben');
  page.once('dialog', () => {});
  await page.click('[data-act="s-beenden"]');
  if (await page.isVisible('.dialog')) await page.click('.dialog [data-dlg="1"]');
  await page.click('[data-nav="start"]');
  await page.click('.pruefung-band [data-act="pruef-intro"]');
  await page.waitForSelector('[data-act="pruef-los"]');
  await keinUeberlauf(page, 'Prüfungsstart');
  await page.click('[data-act="pruef-los"]');
  await page.waitForSelector('#uhr');
  const anzahl = (await page.$$('.navi-punkt')).length;
  let soll = 0;
  for (let n = 0; n < anzahl; n++) {
    const item = await aktuellesItem(page);
    const richtig = n % 3 !== 2;
    if (n !== 1) { await beantworte(page, item, richtig); if (richtig) soll++; }
    if (n === 4) await page.click('[data-act="s-markieren"]');
    if (n === 5) {
      await page.click('[data-act="s-beenden"]');
      await page.click('.dialog [data-dlg="1"]');
      await page.reload();
      await page.waitForSelector('[data-act="laufend-weiter"]');
      await page.click('[data-act="laufend-weiter"]');
      await page.waitForSelector('#uhr');
      check((await page.$$('.navi-punkt.beantwortet')).length >= 4, 'Antworten nach Neuladen verloren');
      check((await page.$$('.navi-punkt.markiert')).length === 1, 'Markierung nach Neuladen verloren');
    }
    if (n < anzahl - 1) await page.click('[data-act="s-weiter"]');
  }
  await page.click('.sitzung-kopf [data-act="s-abgeben"]');
  check((await page.textContent('.dialog')).includes('nicht beantwortet'), 'Abgabe-Dialog nennt unbeantwortete Aufgaben nicht');
  await page.click('.dialog [data-dlg="1"]');
  await page.waitForSelector('.ergebnis-kopf');
  const ringText = await page.textContent('.ring text');
  check(Number(ringText) === soll, `Prüfungsergebnis falsch: ${ringText} statt ${soll}`);
  check((await page.$$('.review')).length === anzahl, 'Lösungsliste unvollständig');
  check((await page.$$('.balken-zeile')).length >= 4, 'Kompetenzbalken fehlen');
  await keinUeberlauf(page, 'Ergebnis');
  await shot(page, '04-ergebnis');

  /* ---------- 6. Zeitablauf ---------- */
  schritt('Prüfung: Zeitablauf wertet automatisch aus');
  {
    const p2 = await neueSeite('iPad Pro 11 landscape');
    await p2.clock.install();
    await p2.reload();
    await profilAnlegen(p2, 'Zeittest');
    await p2.click('.pruefung-band [data-act="pruef-intro"]');
    await p2.click('[data-act="pruef-los"]');
    await p2.waitForSelector('#uhr');
    await p2.clock.runFor(41 * 60 * 1000);
    await p2.waitForSelector('.dialog', { timeout: 5000 }).catch(() => {});
    check((await p2.textContent('.dialog').catch(() => '')).includes('Zeit ist um'), 'kein Zeitablauf-Dialog');
    await p2.click('.dialog [data-dlg="0"]').catch(() => {});
    await p2.waitForSelector('.ergebnis-kopf', { timeout: 5000 }).catch(() => {});
    check(await p2.isVisible('.ergebnis-kopf'), 'nach Zeitablauf keine Auswertung');
    check(p2.fehlerliste.length === 0, 'Fehler (Zeittest): ' + p2.fehlerliste.join(' | '));
    await p2.context().close();
  }

  /* ---------- 7. Lese-Tempo ---------- */
  schritt('Lese-Tempo: Übung, Test, Ergebnis');
  {
    const p3 = await neueSeite('iPad Pro 11 landscape');
    await p3.clock.install();
    await p3.reload();
    await profilAnlegen(p3, 'Tempo');
    await p3.click('.labor-karte[data-nav="tempo"]');
    await p3.click('[data-act="tempo-start"]');
    for (let i = 0; i < 3; i++) await p3.click('[data-act="tempo-antwort"][data-r="1"]');
    await p3.click('[data-act="tempo-los"]');
    for (let i = 0; i < 3; i++) await p3.click('[data-act="tempo-antwort"][data-r="1"]');
    await p3.clock.runFor(181 * 1000);
    await p3.waitForSelector('.ergebnis-kopf', { timeout: 5000 }).catch(() => {});
    check(await p3.isVisible('.ergebnis-kopf'), 'Tempo: kein Ergebnis nach Zeitablauf');
    await keinUeberlauf(p3, 'Tempo-Ergebnis');
    check(p3.fehlerliste.length === 0, 'Fehler (Tempo): ' + p3.fehlerliste.join(' | '));
    await p3.context().close();
  }

  /* ---------- 8. Diktat (Blitz) ---------- */
  schritt('Diktat: Blitz-Diktat mit Fehlerkorrektur');
  await page.click('[data-nav="start"]');
  if (await page.$('.labor-karte[data-nav="rechtschreibung"]:not([disabled])')) {
    await page.click('.labor-karte[data-nav="rechtschreibung"]');
    const dk = await page.$('[data-act="diktat"]');
    if (dk) {
      await dk.click();
      await page.click('[data-act="diktat-modus"][data-modus="blitz"]');
      const runden = await page.evaluate(() => window.LL_INHALT.rechtschreibung.diktate[0].woerter.length);
      for (let i = 0; i < runden; i++) {
        await page.click('[data-act="diktat-blitz"]');
        const wort = (await page.textContent('#blitz-wort')).trim();
        await page.waitForSelector('#diktat-eingabe:not([disabled])', { timeout: 8000 });
        if (i === 0) {
          await page.fill('#diktat-eingabe', wort + 'x'); await page.click('#diktat-form button[type=submit]');
          check(await page.isVisible('.vergleich'), 'Diktat: Fehlervergleich fehlt');
          await page.fill('#diktat-eingabe', wort); await page.click('#diktat-form button[type=submit]');
        } else { await page.fill('#diktat-eingabe', wort); await page.click('#diktat-form button[type=submit]'); }
        await page.click('[data-act="diktat-weiter"]');
      }
      check(await page.isVisible('.ergebnis-kopf'), 'Diktat: kein Ergebnis');
    }
  }

  /* ---------- 9. Schreib-Werkstatt ---------- */
  schritt('Schreib-Werkstatt: schreiben, Schreib-Check, Wortspeicher, fertig');
  await page.click('[data-nav="start"]');
  if (await page.$('.labor-karte[data-nav="schreiben"]:not([disabled])')) {
    await page.click('.labor-karte[data-nav="schreiben"]');
    const sa = await page.$('[data-act="schreibauftrag"]');
    if (sa) {
      await sa.click();
      await page.fill('#schreibfeld', 'Der Drache\n\nDann ging ich los. Dann sah ich einen Drachen. Dann lief ich weg. dann war alles gut und der Drache war lieb und der Drache war groß und der Drache flog weg');
      await page.click('[data-act="wort-einfuegen"]');
      await page.click('[data-act="schreib-check"]');
      const analyse = await page.textContent('#schreib-analyse');
      check(analyse.includes('Satzanfänge'), 'Schreib-Check erkennt Satzanfänge nicht');
      check(analyse.includes('Satzschlusszeichen'), 'Schreib-Check erkennt fehlendes Satzzeichen nicht');
      await page.click('[data-act="schreib-fertig"]');
      await keinUeberlauf(page, 'Schreib-Werkstatt');
      await page.waitForTimeout(500);
      await page.reload();
      await page.click('[data-act="schreibauftrag"]');
      await page.waitForSelector('#schreibfeld');
      check((await page.inputValue('#schreibfeld')).includes('Drache'), 'Text nach Neuladen verloren');
    }
  }

  /* ---------- 10. Labor-Buch, Erwachsene, Sichern ---------- */
  schritt('Labor-Buch, Erwachsenen-Bereich, Einstellungen, Sichern/Wiederherstellen, Löschen');
  await page.click('[data-nav="fortschritt"]');
  check(await page.isVisible('.abzeichen-raster'), 'Labor-Buch: Abzeichen fehlen');
  check((await page.$$('.verlauf-tabelle tbody tr')).length >= 1, 'Labor-Buch: Prüfung fehlt in der Tabelle');
  await page.click('[data-act="pruefung-ansehen"]');
  check(await page.isVisible('.ergebnis-kopf'), 'alte Prüfung lässt sich nicht ansehen');
  await page.click('[data-nav="erwachsene"]');
  const frage = await page.textContent('label[for="gate-antwort"]');
  const [, a, b] = frage.match(/(\d+) × (\d+)/);
  await page.fill('#gate-antwort', String(a * b));
  await page.click('#gate-form button[type=submit]');
  await page.waitForSelector('#schrift');
  await page.selectOption('#schrift', 'gross');
  check((await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--gross'))).trim() === '1.12', 'Schriftgröße wird nicht angewendet');
  await page.click('[data-act="export-zeigen"]');
  const code = await page.inputValue('#export-code');
  check(code.startsWith('LLP1:'), 'Sicherungscode fehlt');
  await page.click('[data-act="alles-loeschen"]');
  await page.click('.dialog [data-dlg="1"]');
  await page.waitForSelector('#profil-form');
  check(await page.evaluate(() => !JSON.parse(localStorage.getItem('lese-labor-profi:v1')).aktivesProfil), 'Löschen hat nicht alles gelöscht');
  await page.click('[data-nav="erwachsene"]');
  const f2 = await page.textContent('label[for="gate-antwort"]');
  const [, c, d] = f2.match(/(\d+) × (\d+)/);
  await page.fill('#gate-antwort', String(c * d));
  await page.click('#gate-form button[type=submit]');
  await page.fill('#import-code', code);
  await page.click('[data-act="import"]');
  await page.click('[data-nav="start"]');
  check(await page.isVisible('.held'), 'Wiederherstellen hat das Profil nicht zurückgebracht');
  check(Number(await page.textContent('.punkte-chip')) > 0, 'Punkte nach Wiederherstellen verloren');
  check(page.fehlerliste.length === 0, 'Fehler im Hauptdurchlauf: ' + page.fehlerliste.join(' | '));

  /* ---------- 11. Layout auf anderen Geräten ---------- */
  schritt('Layout: iPad hochkant, iPad mini, Handy; Dunkelmodus');
  for (const dev of ['iPad Pro 11', 'iPad Mini', 'iPhone 13']) {
    const p = await neueSeite(dev);
    await profilAnlegen(p, 'Layout');
    await keinUeberlauf(p, `${dev} Start`);
    await p.click('.labor-karte[data-nav="digital"]').catch(() => {});
    await p.click('[data-act="training-gruppe"]').catch(() => {});
    await p.waitForSelector('.frage-karte').catch(() => {});
    await keinUeberlauf(p, `${dev} Training`);
    await shot(p, `05-${dev.replace(/\s+/g, '-')}`);
    check(p.fehlerliste.length === 0, `Fehler (${dev}): ` + p.fehlerliste.join(' | '));
    await p.context().close();
  }
  {
    const ctx = await browser.newContext({ ...devices['iPad Pro 11 landscape'], colorScheme: 'dark' });
    const p = await ctx.newPage(); await p.goto(URL); await profilAnlegen(p, 'Dunkel');
    const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(bg !== 'rgb(243, 246, 250)', 'Dunkelmodus wird nicht angewendet');
    await shot(p, '06-dunkel');
    await ctx.close();
  }

  /* ---------- BYLES-Formate ---------- */
  schritt('BYLES-Fahrplan und Daumen-Check (BYLET-P-Format)');
  {
    const p = await neueSeite();
    await profilAnlegen(p, 'Fahrplan');
    check(await p.isVisible('.fahrplan-band'), 'Startseite ohne BYLES-Fahrplan');
    await p.click('.fahrplan-band');
    check(await p.$$eval('.station', (s) => s.length) === 4, 'Fahrplan hat nicht 4 Stationen');
    const reihe = await p.$$eval('.station-nr', (s) => s.map((x) => x.textContent.replace(/.*·\s*/, '').trim()).join(','));
    check(reihe === 'BYLET-P,BYLET-F,BYLET-V,BYLET-D', 'Stationen nicht in Test-Reihenfolge: ' + reihe);
    await keinUeberlauf(p, 'Fahrplan');
    await shot(p, '07-fahrplan');
    await p.click('[data-act="daumen-start"]');
    check(await p.isDisabled('[data-act="daumen-weiter"]'), 'Daumen-Check: Weiter ohne Auswahl möglich');
    check(await p.$$eval('.daumen-knopf', (b) => b.length) === 4, 'Daumen-Check: nicht 4 Daumen');
    for (let i = 0; i < 8; i++) {
      await p.click(`.daumen-knopf[data-w="${(i * 3) % 4}"]`);
      check(await p.getAttribute(`.daumen-knopf[data-w="${(i * 3) % 4}"]`, 'aria-checked') === 'true', `Daumen-Check: Auswahl ${i + 1} nicht markiert`);
      if (i === 3) { await p.click('[data-act="daumen-zurueck"]'); check((await p.textContent('.zeile-zwischen .klein')).includes('3 von 8'), 'Daumen-Check: Zurück geht nicht'); await p.click('[data-act="daumen-weiter"]'); await p.click(`.daumen-knopf[data-w="${(i * 3) % 4}"]`); }
      await p.click('[data-act="daumen-weiter"]');
    }
    check(await p.isVisible('.fahrplan-banner'), 'Daumen-Check: kein Fahrplan-Hinweis am Ende');
    const d = await p.evaluate(() => { const x = JSON.parse(localStorage.getItem('lese-labor-profi:v1')); return x.profile[x.aktivesProfil]; });
    check(d.byles && d.byles.p > 0, 'Daumen-Check wird im Fahrplan nicht vermerkt');
    check(!JSON.stringify(d).includes('daumen') && !('antworten' in (d.byles || {})), 'Daumen-Check-Antworten werden gespeichert');
    check(p.fehlerliste.length === 0, 'Fehler (Fahrplan/Daumen): ' + p.fehlerliste.join(' | '));
    await p.context().close();
  }

  schritt('Blitz-Lesen (BYLET-F-Format): Übung, Stufen, Abbruch nach 3 Fehlern, Ergebnis');
  {
    const p = await neueSeite();
    await profilAnlegen(p, 'Blitz');
    await p.click('.labor-karte[data-nav="tempo"]');
    await p.click('.blitz-karte [data-act="blitz-start"]');
    const inhalt = await p.evaluate(() => window.LL_INHALT.blitz);
    const alle = [...inhalt.woerter, ...inhalt.saetze];
    const aufgabe = async (richtig) => {
      const el = await p.waitForSelector('#bl-wort', { timeout: 7000 });
      const text = (await el.textContent()).trim();
      await p.waitForSelector('.bild-wahl:not([disabled])', { timeout: 9000 });
      check(!(await p.$('#bl-wort')), 'Blitz-Lesen: Wort bleibt bei der Bildauswahl sichtbar');
      const x = alle.find((y) => (y.wort || y.satz) === text);
      const labels = await p.$$eval('.bild-wahl', (bs) => bs.map((b) => b.getAttribute('aria-label')));
      check(labels.length === 4 && new Set(labels).size === 4, 'Blitz-Lesen: nicht 4 verschiedene Bilder');
      let i = labels.indexOf(x.bild.name); if (!richtig) i = (i + 1) % 4;
      await p.click(`.bild-wahl[data-i="${i}"]`);
      await p.waitForTimeout(richtig ? 760 : 1820);
    };
    const t0 = Date.now();
    await p.click('[data-act="blitz-uebung"]'); await aufgabe(true); await aufgabe(true);
    await p.click('[data-act="blitz-los"]');
    for (let s = 0; s < 2; s++) { for (let k = 0; k < 5; k++) await aufgabe(true); await p.waitForTimeout(1600); }
    await aufgabe(false); await aufgabe(true); await aufgabe(false); await aufgabe(false);
    await p.waitForSelector('[data-act="blitz-teil2"]', { timeout: 4000 });
    check((await p.textContent('.blitz-info h1')).includes('Stufe 2 von 7'), 'Blitz-Lesen: Stufe nach 3 Fehlern falsch');
    await shot(p, '08-blitz-teilende');
    await p.click('[data-act="blitz-teil2"]'); await p.click('[data-act="blitz-uebung"]'); await aufgabe(true); await aufgabe(true);
    await p.click('[data-act="blitz-los"]');
    // Tastatur 1–4 wählt Bilder
    await p.waitForSelector('#bl-wort'); await p.waitForSelector('.bild-wahl:not([disabled])');
    await p.keyboard.press('1'); check(await p.isVisible('.blitz-rueck'), 'Blitz-Lesen: Taste 1 wählt kein Bild');
    await p.waitForTimeout(1820);
    for (let k = 0; k < 3; k++) await aufgabe(false).catch(() => {});
    await p.waitForSelector('[data-act="blitz-fertig"]', { timeout: 8000 });
    await p.click('[data-act="blitz-fertig"]');
    check((await p.textContent('.ergebnis-kopf')).includes('Stufe 2 von 7'), 'Blitz-Ergebnis zeigt Wort-Stufe nicht');
    check(await p.isVisible('.fahrplan-banner'), 'Blitz-Ergebnis ohne Fahrplan-Hinweis');
    const d = await p.evaluate(() => { const x = JSON.parse(localStorage.getItem('lese-labor-profi:v1')); return x.profile[x.aktivesProfil]; });
    check(d.blitz && d.blitz.length === 1 && d.blitz[0].w === 2 && d.byles.f > 0, 'Blitz-Ergebnis nicht gespeichert');
    await p.click('[data-nav="tempo"]');
    check((await p.textContent('.blitz-karte')).includes('Beste Wort-Stufe: 2/7'), 'Lese-Tempo zeigt den Blitz-Bestwert nicht');
    // Abbrechen mitten im Lauf hinterlässt keine laufenden Zeitgeber
    await p.click('.blitz-karte [data-act="blitz-start"]'); await p.click('[data-act="blitz-uebung"]');
    await p.click('[data-act="blitz-abbruch"]'); await p.waitForTimeout(2500);
    check((await p.evaluate(() => location.hash)) === '#tempo' && await p.isVisible('.blitz-karte'), 'Blitz-Abbruch springt nicht zurück');
    check(p.fehlerliste.length === 0, 'Fehler (Blitz-Lesen): ' + p.fehlerliste.join(' | '));
    console.log(`  Blitz-Lauf in ${Math.round((Date.now() - t0) / 1000)} s`);
    await p.context().close();
  }

  schritt('BYLET-V-Probe: Abschnitte als Reiter, Sperren, Auswertung nach Abschnitten');
  {
    const p = await neueSeite();
    await profilAnlegen(p, 'Geschichte');
    await p.click('.labor-karte[data-nav="lesen"]');
    const karten = await p.$$('[data-act="pruef-intro"][data-art^="lesev-"]');
    check(karten.length >= 2, 'Lese-Labor ohne BYLET-V-Proben');
    await karten[0].click(); await p.click('[data-act="pruef-los"]');
    const reiter = () => p.$$eval('.reiter', (r) => r.map((x) => (x.disabled ? 'x' : x.classList.contains('aktiv') ? '*' : '-')).join(''));
    check(await reiter() === '*xxx', 'Abschnitt 1: Reiter falsch ' + await reiter());
    for (let i = 0; i < 20; i++) {
      const it = await aktuellesItem(p);
      if (i === 4) check(await reiter() === '-*xx', 'Abschnitt 2: Reiter falsch ' + await reiter());
      if (i === 12) check(await reiter() === '---*', 'Abschnitt 4: Reiter falsch ' + await reiter());
      if (i === 16) { check(!(await reiter()).includes('x'), 'Gesamtfragen: Abschnitte gesperrt'); await p.click('.reiter[data-n="2"]'); check((await p.textContent('.abschnitt-kopf .unter')).includes('Abschnitt 2 von 4'), 'Reiter 2 öffnet nicht'); }
      await beantworte(p, it, i % 4 !== 1);
      if (i < 19) await p.click('[data-act="s-weiter"]');
    }
    await p.click('[data-act="s-gehe"][data-i="1"]');
    check(await reiter() === '*xxx', 'Zurückspringen zu Frage 2 sperrt Abschnitte nicht wieder');
    await p.click('.sitzung-kopf [data-act="s-abgeben"]'); await p.click('.dialog [data-dlg="1"]');
    await p.waitForSelector('.ergebnis-kopf');
    const t = await p.textContent('#inhalt');
    check(t.includes('Nach Abschnitten') && t.includes('Ganze Geschichte') && t.includes('15 von 20'), 'Auswertung nach Abschnitten fehlt oder Punkte falsch');
    check(await p.isVisible('.fahrplan-banner'), 'V-Probe ohne Fahrplan-Hinweis');
    check(p.fehlerliste.length === 0, 'Fehler (V-Probe): ' + p.fehlerliste.join(' | '));
    await p.context().close();
  }

  schritt('BYLES auf dem Handy: Fahrplan, Daumen, Blitz-Bilder ohne Überlauf');
  {
    const p = await neueSeite('iPhone 13');
    await profilAnlegen(p, 'Handy');
    await p.click('.fahrplan-band'); await keinUeberlauf(p, 'Fahrplan Handy');
    await p.click('[data-act="daumen-start"]'); await keinUeberlauf(p, 'Daumen Handy');
    await p.click('.kopf [data-nav="start"]'); await p.click('.labor-karte[data-nav="tempo"]'); await p.click('.blitz-karte [data-act="blitz-start"]'); await p.click('[data-act="blitz-uebung"]');
    await p.waitForSelector('.bild-wahl:not([disabled])', { timeout: 6000 }); await keinUeberlauf(p, 'Blitz-Bilder Handy');
    await shot(p, '09-blitz-handy');
    check(p.fehlerliste.length === 0, 'Fehler (Handy BYLES): ' + p.fehlerliste.join(' | '));
    await p.context().close();
  }
} catch (e) {
  fehler++;
  console.log('  ✗ Testabbruch: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${fehler ? '✗' : '✓'} ${ok} Prüfungen bestanden, ${fehler} fehlgeschlagen`);
process.exit(fehler ? 1 : 0);
