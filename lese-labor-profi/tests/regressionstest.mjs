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

  /* ---------- Testrunde 2 ---------- */
  console.log('• Prüfung: Zurück-Geste während „Die Zeit ist um!“ umgeht das Zeitlimit nicht');
  {
    const page = await seite();
    await page.clock.install();
    await page.reload();
    await profilAnlegen(page);
    await page.click('.labor-karte[data-nav="rechtschreibung"]');
    await page.click('[data-act="pruef-intro"]');
    await page.click('[data-act="pruef-los"]');
    await page.waitForSelector('#uhr');
    await page.clock.runFor(21 * 60 * 1000);
    await page.waitForSelector('.dialog');
    await page.goBack().catch(() => {});
    await page.waitForTimeout(300);
    const text = await page.textContent('.dialog').catch(() => '');
    check(text.includes('Zeit ist um'), `Zurück-Geste ersetzt den Zeitablauf-Dialog („${text.slice(0, 40)}“)`);
    await page.click('.dialog [data-dlg="0"]').catch(() => {});
    await page.waitForSelector('.ergebnis-kopf', { timeout: 5000 }).catch(() => {});
    check(await page.isVisible('.ergebnis-kopf'), 'nach Zeitablauf keine Auswertung');
    await page.context().close();
  }

  console.log('• Wertung: Raten (überall dieselbe Spalte) ergibt nicht „Fast!“');
  {
    const page = await seite();
    await profilAnlegen(page);
    const ziel = await page.evaluate(() => { for (const t of window.LL_INHALT.lesen) { const it = t.items.find((x) => x.typ === 'matrix' && x.aussagen.some((a) => a.richtig) && x.aussagen.some((a) => !a.richtig)); if (it) return { g: t.id, id: it.id, i: t.items.indexOf(it) }; } return null; });
    await page.click('.labor-karte[data-nav="lesen"]');
    await page.click(`[data-act="training-gruppe"][data-g="${ziel.g}"]`);
    await page.click(`[data-act="s-gehe"][data-i="${ziel.i}"]`).catch(() => {});
    const n = (await page.$$('.matrix-zeile')).length;
    for (let z = 0; z < n; z++) await page.click(`.mx-knopf[data-z="${z}"][data-s="0"]`);
    await page.click('[data-act="s-pruefen"]');
    check(await page.isVisible('.rueckmeldung.f'), 'gleichförmige Antwort wird als „Fast!“ gewertet');
    await page.context().close();
  }

  console.log('• Darstellung: Lücke und Wortteile, Satzzeichen und Wort bleiben zusammen');
  {
    const page = await seite();
    await profilAnlegen(page);
    const ziel = await page.evaluate(() => { for (const th of window.LL_INHALT.rechtschreibung.themen) { const i = th.items.findIndex((x) => x.typ === 'luecke' && x.teile.some((t, k) => t.wahl && x.teile[k - 1] && !x.teile[k - 1].wahl && /\S$/.test(x.teile[k - 1].t || ''))); if (i >= 0) return { g: th.id, i }; } return null; });
    if (ziel) {
      await page.click('.labor-karte[data-nav="rechtschreibung"]');
      await page.click(`[data-act="training-gruppe"][data-g="${ziel.g}"]`);
      await page.click(`[data-act="s-gehe"][data-i="${ziel.i}"]`).catch(() => {});
      check(await page.$('.wort-gruppe select.luecke') !== null, 'Lücke ist nicht mit dem angrenzenden Wortteil gruppiert');
    }
    await page.context().close();
  }

  console.log('• Schreib-Check: wörtliche Rede, Abkürzungen, E-Mail-Schluss');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.click('.labor-karte[data-nav="schreiben"]');
    await page.click('[data-act="schreibauftrag"][data-id="sa-fantasie"]');
    await page.fill('#schreibfeld', '„Komm schnell her!“, rief Mia. „Wohin denn?“, fragte Tom. „Zum alten Baum!“, rief Mia. „Was ist dort?“, fragte Tom. „Ein Nest!“, rief Mia. Wir sahen z. B. drei Eier am 3. oder 4. Tag.');
    await page.click('[data-act="schreib-check"]');
    const a = await page.textContent('#schreib-analyse');
    check(!a.includes('„Rief“'), 'nachgestellter Redebegleitsatz wird als Satzanfang gezählt');
    check(!a.includes('beginnen klein'), 'Abkürzung oder Ordnungszahl wird als Satzende gewertet');
    await page.click('[data-nav="start"]'); await page.click('.labor-karte[data-nav="schreiben"]');
    await page.click('[data-act="schreibauftrag"][data-id="sa-brief"]');
    await page.fill('#schreibfeld', 'Sehr geehrte Frau Kaya,\n\nich wünsche mir einen Trinkbrunnen. Vielen Dank!\n\nMit freundlichen Grüßen\nLena Huber');
    await page.click('[data-act="schreib-check"]');
    check(!(await page.textContent('#schreib-analyse')).includes('Satzschlusszeichen'), 'E-Mail mit Grußformel bekommt den Satzzeichen-Hinweis');
    await page.context().close();
  }

  console.log('• Wortspeicher: Einfügen am Textende in einem wieder geöffneten Text');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.click('.labor-karte[data-nav="schreiben"]');
    await page.click('[data-act="schreibauftrag"]');
    await page.fill('#schreibfeld', 'Am Anfang war es still.');
    await page.click('[data-nav="start"]'); await page.click('.labor-karte[data-nav="schreiben"]');
    await page.click('[data-act="schreibauftrag"]');
    const wort = await page.getAttribute('[data-act="wort-einfuegen"]', 'data-wort');
    await page.click('[data-act="wort-einfuegen"]');
    const v = await page.inputValue('#schreibfeld');
    check(v.startsWith('Am Anfang') && v.trim().endsWith(wort), `Wort nicht am Textende eingefügt („${v.slice(0, 40)}“)`);
    await page.context().close();
  }

  console.log('• Mehrere Tabs: ein unveränderter alter Tab überschreibt nichts');
  {
    const ctx = await browser.newContext({ ...devices['iPad Pro 11 landscape'] });
    const a = await ctx.newPage(); await a.goto(URL); await profilAnlegen(a, 'TabA');
    const b = await ctx.newPage(); await b.goto(URL); await b.waitForSelector('.held');
    await a.click('.labor-karte[data-nav="digital"]'); await a.click('[data-act="training-gruppe"]');
    const it = await aktuellesItem(a); await beantworte(a, it, true); await a.click('[data-act="s-pruefen"]');
    await a.waitForTimeout(400);
    const vorher = await a.evaluate((k) => localStorage.getItem(k), KEY);
    await b.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    const nachher = await a.evaluate((k) => localStorage.getItem(k), KEY);
    check(vorher === nachher, 'unveränderter zweiter Tab überschreibt den neueren Stand');
    await ctx.close();
  }

  console.log('• Dialoge, Import, Löschen, Umbenennen, Sicherung');
  {
    const page = await seite();
    await profilAnlegen(page, 'Alt');
    await erwachseneOeffnen(page);
    await page.click('[data-act="alles-loeschen"]');
    await page.waitForTimeout(80);
    check((await page.evaluate(() => document.activeElement && document.activeElement.textContent)) === 'Abbrechen', 'Dialog fokussiert nicht den sicheren Knopf');
    await page.keyboard.press('Escape');
    await page.click('[data-act="export-zeigen"]');
    check(!(await page.textContent('#letzte-sicherung')).includes('noch nie'), '„Letzte Sicherung“ nicht aktualisiert');
    const code = await page.inputValue('#export-code');
    await page.fill('#import-code', code);
    await page.click('[data-act="import"]');
    check((await page.textContent('.dialog').catch(() => '')).includes('ersetzen'), 'keine Rückfrage beim Ersetzen eines vorhandenen Profils');
    await page.click('.dialog [data-dlg="0"]');
    await page.fill('[data-act="profil-name"]', 'Neu');
    await page.click('[data-nav="start"]');
    check((await page.textContent('.held h1')).includes('Neu'), 'Umbenennung nicht sofort sichtbar');
    await page.evaluate((k) => localStorage.setItem(k + ':defekt-1', 'alt'), KEY);
    await erwachseneOeffnen(page);
    await page.click('[data-act="alles-loeschen"]');
    await page.click('.dialog [data-dlg="1"]');
    await page.waitForSelector('#profil-form');
    check(!(await page.evaluate(() => Object.keys(localStorage).some((x) => x.includes(':defekt-')))), 'Sicherungskopien bleiben nach „Alles löschen“');
    await page.context().close();
  }

  console.log('• Einstellungen: Schriftgröße wirkt auf Fragen und Antworten; Datei-Import per Tastatur erreichbar');
  {
    const page = await seite();
    await profilAnlegen(page);
    const groesse = async () => {
      await page.click('[data-nav="start"]'); await page.click('.labor-karte[data-nav="digital"]'); await page.click('[data-act="training-gruppe"]');
      const px = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.frage-text')).fontSize));
      await page.click('[data-act="s-beenden"]'); if (await page.isVisible('.dialog')) await page.click('.dialog [data-dlg="1"]');
      return px;
    };
    const normal = await groesse();
    await erwachseneOeffnen(page);
    check(await page.$('button[data-act="datei-waehlen"]') !== null, '„Datei wählen“ ist kein Knopf');
    await page.selectOption('#schrift', 'sehrgross');
    const gross = await groesse();
    check(gross > normal * 1.15, `Schriftgröße wirkt nicht auf die Frage (${normal}px → ${gross}px)`);
    await page.context().close();
  }

  console.log('• Lese-Tempo: Bestwert bleibt auch nach vielen Tests erhalten');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.waitForTimeout(400);
    await page.evaluate((k) => {
      const d = JSON.parse(localStorage.getItem(k)); const p = d.profile[d.aktivesProfil];
      p.tempo = Array.from({ length: 60 }, (_, i) => ({ datum: Date.now() - i * 1000, richtig: 10, falsch: 0, dauer: 180, gelesen: 10 }));
      p.tempoRekord = 47; localStorage.setItem(k, JSON.stringify(d));
    }, KEY);
    await page.reload();
    await page.click('.labor-karte[data-nav="tempo"]');
    check((await page.textContent('#inhalt')).includes('Dein Bestwert: 47'), 'Tempo-Rekord geht verloren');
    await page.context().close();
  }

  const doppelteIds = (page) => page.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); return ids.filter((x, i) => ids.indexOf(x) !== i); });
  async function trainingStarten(page, modul = 'rechtschreibung') {
    await page.click(`.labor-karte[data-nav="${modul}"]`);
    await page.click('[data-act="training-gruppe"]');
    await page.waitForSelector('.frage-text');
  }
  async function richtigPruefen(page) {
    const it = await aktuellesItem(page); await beantworte(page, it, true);
    await page.click('[data-act="s-pruefen"]');
  }

  console.log('• Effekte: keine doppelten IDs, Effekt-Stufe im Erwachsenen-Bereich bedienbar');
  {
    const page = await seite();
    await profilAnlegen(page);
    check((await doppelteIds(page)).length === 0, 'Startseite hat doppelte IDs: ' + (await doppelteIds(page)).join(', '));
    await erwachseneOeffnen(page);
    check((await doppelteIds(page)).length === 0, 'Erwachsenen-Bereich hat doppelte IDs: ' + (await doppelteIds(page)).join(', '));
    const frei = await page.evaluate(() => { const s = document.getElementById('effekte'); const r = s.getBoundingClientRect(); s.scrollIntoView({ block: 'center' }); const r2 = s.getBoundingClientRect(); return getComputedStyle(s).position !== 'fixed' && r.width < 700 && document.elementFromPoint(r2.left + r2.width / 2, r2.top + r2.height / 2) === s; });
    check(frei, 'Auswahl „Effekte“ ist verdeckt oder als Vollbild-Ebene gestylt');
    await page.selectOption('#effekte', 'aus');
    check(await page.evaluate(() => document.documentElement.classList.contains('fx-aus')), 'Effekt-Stufe „aus“ wirkt nicht');
    await page.selectOption('#effekte', 'sanft');
    check(await page.evaluate(() => document.documentElement.classList.contains('fx-sanft')), 'Effekt-Stufe „sanft“ wirkt nicht');
    check(await page.getAttribute('#fx-ebene', 'aria-hidden') === 'true', 'Effekt-Ebene ist für Bildschirmleser nicht verborgen');
    await page.context().close();
  }

  console.log('• Effekte: Glitzer und Münzflug im sichtbaren Bereich, Combo, Reise-Leiste, Toast lässt Taps durch');
  {
    const page = await seite();
    await profilAnlegen(page);
    await trainingStarten(page);
    check(await page.evaluate(() => document.documentElement.classList.contains('in-sitzung')), 'Sitzung setzt die Klasse in-sitzung nicht');
    check(await page.isVisible('.sitzung-kopf .reise'), 'Reise-Leiste fehlt im Sitzungskopf');
    check((await doppelteIds(page)).length === 0, 'Sitzung hat doppelte IDs: ' + (await doppelteIds(page)).join(', '));
    await richtigPruefen(page);
    const wolke = await page.waitForSelector('#fx-ebene .glitzer-wolke', { state: 'attached', timeout: 2000 }).catch(() => null);
    check(!!wolke, 'kein Glitzer nach richtiger Antwort');
    if (wolke) {
      const pos = await wolke.evaluate((el) => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: innerWidth, h: innerHeight }));
      check(pos.x > 0 && pos.x < pos.w && pos.y > 0 && pos.y < pos.h, `Glitzer außerhalb des Bildschirms (${Math.round(pos.x)}, ${Math.round(pos.y)})`);
    }
    check(!!(await page.$('#fx-ebene .punkte-flug.zum-chip')), 'Punkte fliegen nicht zum Punkte-Chip');
    const abz = await page.waitForSelector('#fx-ebene .abzeichen-neu', { state: 'attached', timeout: 2500 }).catch(() => null);
    check(!!abz, 'Abzeichen „Erster Versuch“ wird nicht groß gezeigt');
    await page.waitForTimeout(150);
    check((await page.textContent('#sr-meldung')).includes('Erster Versuch'), 'Abzeichen wird dem Bildschirmleser nicht angesagt');
    check(await page.$eval('#toast', (t) => getComputedStyle(t).pointerEvents) === 'none', 'Toast fängt Taps ab');
    await page.click('[data-act="s-weiter"]');
    await richtigPruefen(page);
    await page.waitForTimeout(200);
    const combo = await page.$('.sitzung-kopf .combo');
    check(!!combo && (await combo.textContent()).includes('2'), 'Combo-Anzeige nach zwei richtigen Antworten fehlt');
    await page.waitForTimeout(3500);
    check(await page.$$eval('#fx-ebene > *', (e) => e.length) === 0, 'Effekt-Ebene wird nicht aufgeräumt');
    await page.context().close();
  }

  console.log('• Handy: Belohnungs-Effekte lassen die Seite nie seitlich überstehen (kein Heraus-Zoomen)');
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await ctx.newPage();
    await page.goto(URL);
    await profilAnlegen(page);
    await trainingStarten(page, 'grammatik');
    let maxBreite = 0, maxScroll = 0;
    for (let k = 0; k < 3; k++) {
      await richtigPruefen(page);
      for (let i = 0; i < 16; i++) {
        const m = await page.evaluate(() => [window.innerWidth, document.documentElement.scrollWidth]);
        maxBreite = Math.max(maxBreite, m[0]); maxScroll = Math.max(maxScroll, m[1]);
        await page.waitForTimeout(100);
      }
      const r = await page.$eval('.rueckmeldung', (el) => { const b = el.getBoundingClientRect(); return b.top < innerHeight && b.bottom > 0; });
      check(r, `Rückmeldung nach dem Prüfen nicht im Bild (Aufgabe ${k + 1})`);
      await page.click('[data-act="s-weiter"]');
      await page.waitForTimeout(300);
    }
    check(maxBreite <= 390 && maxScroll <= 391, `Seite steht seitlich über (Fensterbreite ${maxBreite}, Inhaltsbreite ${maxScroll})`);
    await ctx.close();
  }

  console.log('• Feier-Warteschlange: Level-up und Abzeichen erscheinen nacheinander, nie übereinander');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.waitForTimeout(400);
    await page.evaluate((k) => { const d = JSON.parse(localStorage.getItem(k)); d.profile[d.aktivesProfil].punkte = 148; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
    await page.reload();
    await trainingStarten(page);
    await richtigPruefen(page);
    let beide = 0, sahLevel = false, sahAbz = false;
    for (let i = 0; i < 80; i++) {
      const s = await page.evaluate(() => [!!document.querySelector('#fx-ebene .levelup'), !!document.querySelector('#fx-ebene .abzeichen-neu')]);
      if (s[0] && s[1]) beide++; if (s[0]) sahLevel = true; if (s[1]) sahAbz = true;
      await page.waitForTimeout(100);
    }
    check(sahLevel && sahAbz, `Level-up (${sahLevel}) oder Abzeichen (${sahAbz}) wurde nicht gezeigt`);
    check(beide === 0, 'Level-up und Abzeichen liegen übereinander');
    await page.context().close();
  }

  console.log('• Effekte „aus“: kein Glitzer, Abzeichen als ruhige Meldung; Dialog pausiert den Hintergrund; Boss-Intro');
  {
    const page = await seite();
    await profilAnlegen(page);
    await page.waitForTimeout(400);
    await page.evaluate((k) => { const d = JSON.parse(localStorage.getItem(k)); d.einstellungen.effekte = 'aus'; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
    await page.reload();
    await trainingStarten(page);
    await richtigPruefen(page);
    await page.waitForTimeout(1600);
    check(!(await page.$('#fx-ebene .glitzer-wolke, #fx-ebene .abzeichen-neu, #fx-ebene .punkte-flug')), 'Bei „aus“ erscheinen trotzdem Effekte');
    check((await page.isVisible('#toast')) && (await page.textContent('#toast')).includes('Erster Versuch'), 'Bei „aus“ fehlt die ruhige Abzeichen-Meldung');
    await page.click('[data-act="s-beenden"]'); if (await page.isVisible('.dialog')) await page.click('.dialog [data-dlg="1"]');
    await page.click('[data-nav="start"]').catch(() => {});
    await page.click('.pruefung-band [data-act="pruef-intro"]');
    check(await page.isVisible('.karte.boss-intro .boss-label'), 'Prüfungsstart ohne Boss-Intro');
    await page.click('[data-act="pruef-los"]');
    await page.click('.sitzung-kopf [data-act="s-abgeben"]');
    await page.waitForSelector('.dialog');
    check(await page.evaluate(() => document.documentElement.classList.contains('dialog-offen')), 'Dialog pausiert den Hintergrund nicht');
    await page.click('.dialog [data-dlg="0"]');
    check(!(await page.evaluate(() => document.documentElement.classList.contains('dialog-offen'))), 'Hintergrund bleibt nach dem Dialog pausiert');
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
