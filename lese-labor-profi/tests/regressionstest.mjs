#!/usr/bin/env node
// Regressionstests für behobene Fehler (aus Code-Review und explorativem Test).
//   node tests/regressionstest.mjs [pfad-zur-html]
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { starteServer, profilAnlegen, aktuellesItem, beantworte } from './hilfen.mjs';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATEI = resolve(process.argv[2] || join(ROOT, 'dist', 'lese-labor-profi.html'));
if (!existsSync(DATEI)) { console.error('Datei fehlt:', DATEI); process.exit(2); }
const { server, url: URL } = await starteServer(DATEI);
const browser = await chromium.launch();
let ok = 0, fehler = 0;
const check = (bed, text) => { if (bed) ok++; else { fehler++; console.log('  ✗ ' + text); } };
const KEY = 'lese-labor-profi:v1';

async function seite(vorher) {
  const ctx = await browser.newContext({ ...devices['iPad Pro 11 landscape'] });
  const page = await ctx.newPage();
  page.fehlerliste = [];
  page.on('pageerror', (e) => page.fehlerliste.push(e.message));
  if (vorher) await page.addInitScript(vorher, KEY);
  await page.goto(URL);
  return page;
}
const gespeichert = async (page) => { await page.waitForTimeout(350); return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY); };
async function erwachseneOeffnen(page) {
  await page.click('[data-nav="erwachsene"]');
  const f = await page.textContent('label[for="gate-antwort"]');
  const [, a, b] = f.match(/(\d+) × (\d+)/);
  await page.fill('#gate-antwort', String(a * b));
  await page.click('#gate-form button[type=submit]');
  await page.waitForSelector('#import-code');
}

try {
  console.log('• Import: manipulierter Sicherungscode führt keinen Code aus');
  {
    const page = await seite();
    const boese = '<img src=x onerror="window.__xss=1"><details open ontoggle="window.__xss=2"></details>';
    const daten = { app: 'lese-labor-profi', v: 1, profile: { pboese: { id: 'pboese', name: boese, avatar: boese, punkte: boese, pruefungen: [{ art: 'digital', titel: boese, punkte: boese, max: boese, ids: ['d1-1'], details: { 'd1-1': '"><img src=x onerror=window.__xss=3>' } }], tempo: [{ richtig: boese, falsch: 1 }], diktate: { 'dk-merk': { best: boese } } } } };
    const code = 'LLP1:' + Buffer.from(JSON.stringify(daten), 'utf8').toString('base64');
    await erwachseneOeffnen(page);
    await page.fill('#import-code', code);
    await page.click('[data-act="import"]');
    await page.click('[data-nav="start"]');
    await page.waitForTimeout(300);
    await page.click('[data-nav="fortschritt"]').catch(() => {});
    await page.waitForTimeout(300);
    check(!(await page.evaluate(() => window.__xss)), 'Import-XSS wird ausgeführt');
    const d = await gespeichert(page);
    check(d.profile.pboese && d.profile.pboese.punkte === 0, 'Punkte wurden nicht als Zahl bereinigt');
    check(d.profile.pboese && d.profile.pboese.pruefungen[0].details['d1-1'] === 'leer', 'Prüfungsstatus wurde nicht bereinigt');
    await page.context().close();
  }

  console.log('• Speicher: beschädigter Speicher wird gesichert und gemeldet');
  {
    const page = await seite((k) => { if (!sessionStorage.getItem('x')) { localStorage.setItem(k, '{kaputt'); sessionStorage.setItem('x', '1'); } });
    await page.waitForSelector('#profil-form');
    check(await page.isVisible('.banner'), 'keine Warnung bei beschädigtem Speicher');
    const backup = await page.evaluate(() => Object.keys(localStorage).some((k) => k.includes(':defekt-')));
    check(backup, 'keine Sicherungskopie des beschädigten Speichers');
    await page.context().close();
  }

  console.log('• Diktat: geprüftes Wort lässt sich nicht erneut werten');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.click('.labor-karte[data-nav="rechtschreibung"]');
    await page.click('[data-act="diktat"]');
    await page.click('[data-act="diktat-modus"][data-modus="blitz"]');
    await page.click('[data-act="diktat-blitz"]');
    const wort = (await page.textContent('#blitz-wort')).trim();
    await page.waitForSelector('#diktat-eingabe:not([disabled])', { timeout: 8000 });
    await page.fill('#diktat-eingabe', wort + 'x'); await page.press('#diktat-eingabe', 'Enter');
    await page.fill('#diktat-eingabe', wort); await page.press('#diktat-eingabe', 'Enter');
    const punkteVorher = (await gespeichert(page)).profile[(await gespeichert(page)).aktivesProfil].punkte;
    check(await page.isDisabled('#diktat-eingabe'), 'Eingabefeld nach dem Prüfen noch aktiv');
    await page.evaluate(() => document.querySelector('#diktat-form').requestSubmit());
    await page.waitForTimeout(200);
    const d = await gespeichert(page);
    check(d.profile[d.aktivesProfil].punkte === punkteVorher, 'erneutes Abschicken bringt Punkte');
    check(!(await page.isVisible('.rueckmeldung.r')), 'falsches Wort wurde nachträglich als richtig gewertet');
    await page.context().close();
  }

  console.log('• Eintippen: Enter im zweiten Versuch springt nicht zur nächsten Aufgabe');
  {
    const page = await seite();
    await profilAnlegen(page);
    const ziel = await page.evaluate(() => { for (const m of ['rechtschreibung', 'grammatik']) for (const th of window.LL_INHALT[m].themen) { const i = th.items.findIndex((x) => x.typ === 'eingabe'); if (i >= 0) return { m, id: th.id, i }; } return null; });
    if (ziel) {
      await page.click(`.labor-karte[data-nav="${ziel.m}"]`);
      await page.click(`[data-act="training-gruppe"][data-g="${ziel.id}"]`);
      for (let n = 0; n < ziel.i; n++) await page.click(`[data-act="s-gehe"][data-i="${n + 1}"]`).catch(() => {});
      await page.click(`[data-act="s-gehe"][data-i="${ziel.i}"]`);
      const it = await aktuellesItem(page);
      check(it && it.typ === 'eingabe', 'Eintipp-Aufgabe nicht gefunden');
      await page.fill('input.eingabe', 'falschfalsch');
      await page.press('input.eingabe', 'Enter');
      check(await page.isVisible('[data-act="s-nochmal"]'), 'kein zweiter Versuch angeboten');
      check(await page.getAttribute('input.eingabe', 'readonly') !== null, 'Eingabefeld im Zustand „Nochmal“ nicht gesperrt');
      await page.press('input.eingabe', 'Enter');
      const nach = await aktuellesItem(page);
      check(nach && nach.id === it.id, 'Enter im Zustand „Nochmal“ springt zur nächsten Aufgabe');
      check(await page.isVisible('[data-act="s-pruefen"]'), 'Enter öffnet den zweiten Versuch nicht');
    }
    await page.context().close();
  }

  console.log('• Schreib-Werkstatt: schnelles Verlassen speichert Text und Notizen');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.click('.labor-karte[data-nav="schreiben"]');
    await page.click('[data-act="schreibauftrag"]');
    await page.fill('#notiz-0', 'Meine Notiz');
    await page.fill('#schreibfeld', 'Es war einmal ein Drache.');
    await page.click('[data-nav="start"]');
    const d = await gespeichert(page);
    const t = Object.values(d.profile[d.aktivesProfil].texte)[0] || {};
    check(t.text === 'Es war einmal ein Drache.', 'Text beim schnellen Verlassen verloren');
    check((t.notizen || [])[0] === 'Meine Notiz', 'Notiz beim schnellen Verlassen verloren');
    await page.context().close();
  }

  console.log('• Tagesmission: Bonus auch beim Verlassen über den Zurück-Pfeil');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.click('[data-act="mission"]');
    for (let n = 0; n < 12; n++) {
      const it = await aktuellesItem(page); if (!it) break;
      await beantworte(page, it, true);
      await page.click('[data-act="s-pruefen"]');
      if (!(await page.$('.rueckmeldung.r'))) await page.click('[data-act="s-loesung"]').catch(() => {});
      const weiter = await page.$('[data-act="s-weiter"]');
      if (!weiter || (await weiter.textContent()).includes('Fertig')) break;
      await weiter.click();
    }
    await page.click('[data-act="s-beenden"]');
    if (await page.isVisible('.dialog')) await page.click('.dialog [data-dlg="1"]');
    const d = await gespeichert(page);
    check(!!d.profile[d.aktivesProfil].missionGeschafft, 'Missionsbonus ging beim Verlassen verloren');
    await page.context().close();
  }

  console.log('• Prüfung: unterbrochene Prüfung wird nicht ungefragt überschrieben; leere Abgabe ohne Punkte');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.click('.pruefung-band [data-act="pruef-intro"]');
    await page.click('[data-act="pruef-los"]');
    const it = await aktuellesItem(page); await beantworte(page, it, true);
    await page.click('[data-act="s-beenden"]'); await page.click('.dialog [data-dlg="1"]');
    await page.click('[data-nav="start"]');
    await page.click('.pruefung-band [data-act="pruef-intro"]');
    await page.click('[data-act="pruef-los"]');
    check(await page.isVisible('.dialog'), 'keine Rückfrage vor dem Überschreiben');
    await page.click('.dialog [data-dlg="0"]');
    check(!!(await gespeichert(page)).profile[(await gespeichert(page)).aktivesProfil].laufend, 'unterbrochene Prüfung trotz Abbrechen verloren');
    await page.click('[data-act="pruef-los"]');
    await page.click('.dialog [data-dlg="2"]');
    await page.waitForSelector('#uhr');
    const vorher = (await gespeichert(page)).profile[(await gespeichert(page)).aktivesProfil].punkte;
    await page.click('.sitzung-kopf [data-act="s-abgeben"]'); await page.click('.dialog [data-dlg="1"]');
    await page.waitForSelector('.ergebnis-kopf');
    const d = await gespeichert(page), p = d.profile[d.aktivesProfil];
    check(p.punkte === vorher, `leere Abgabe bringt Punkte (${vorher} → ${p.punkte})`);
    check(Object.keys(p.items).length <= 1, 'leere Abgabe verändert den Aufgabenstand');
    await page.keyboard.press('Space');
    check(p.pruefungen.length === 1, 'Prüfung nicht gespeichert');
    await page.context().close();
  }

  console.log('• Fall 2: Menüpunkte der Website lesbar');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.click('.labor-karte[data-nav="digital"]');
    await page.click('[data-act="training-gruppe"][data-g="fall2"]');
    const farben = await page.$$eval('.web .w-menue a:not(.aktiv), .web .w-menue button:not(.aktiv)', (els) => els.map((e) => { const c = getComputedStyle(e); return [c.color, c.backgroundColor]; }));
    check(farben.length > 0, 'keine Menüpunkte gefunden');
    check(farben.every(([c, b]) => c !== 'rgb(255, 255, 255)' || b !== 'rgba(0, 0, 0, 0)'), 'Menüpunkte weiß auf transparentem (weißem) Grund');
    await page.context().close();
  }
} catch (e) {
  fehler++;
  console.log('  ✗ Testabbruch: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${fehler ? '✗' : '✓'} ${ok} Regressionsprüfungen bestanden, ${fehler} fehlgeschlagen`);
process.exit(fehler ? 1 : 0);
