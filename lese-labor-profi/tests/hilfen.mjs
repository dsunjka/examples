// Gemeinsame Helfer für die Playwright-Tests von Lese-Labor PROFI.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

/** Kleiner lokaler Server, der immer die angegebene HTML-Datei ausliefert. */
export async function starteServer(datei) {
  const server = createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(readFileSync(datei)); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

export async function profilAnlegen(page, name = 'Testkind') {
  await page.fill('#profil-name', name);
  await page.click('#profil-form button[type=submit]');
  await page.waitForSelector('.held');
}

/** Liest das Item der aktuell angezeigten Aufgabe aus den eingebetteten Inhalten. */
export async function aktuellesItem(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.frage-text'); if (!el) return null;
    const id = el.id.replace(/^frage-/, '');
    const I = window.LL_INHALT, alle = [];
    for (const f of I.digital) alle.push(...f.items);
    for (const t of I.lesen) alle.push(...t.items);
    for (const m of ['rechtschreibung', 'grammatik', 'schreiben']) for (const th of I[m].themen) alle.push(...th.items);
    return alle.find((x) => x.id === id) || null;
  });
}

const ohneTags = (s) => String(s).replace(/<[^>]+>/g, '').trim();

/** Beantwortet die aktuelle Aufgabe richtig (oder absichtlich falsch). */
export async function beantworte(page, it, richtig = true) {
  switch (it.typ) {
    case 'single': {
      const i = it.optionen.findIndex((o) => (richtig ? o.richtig : !o.richtig));
      await page.click(`.opt[data-i="${i}"]`); break;
    }
    case 'multi': {
      const idx = it.optionen.map((o, i) => (o.richtig ? i : -1)).filter((i) => i >= 0);
      const wahl = richtig ? idx : [it.optionen.findIndex((o) => !o.richtig)];
      for (const i of wahl) await page.click(`.opt[data-i="${i}"]`);
      break;
    }
    case 'matrix': for (let z = 0; z < it.aussagen.length; z++) { const s = (it.aussagen[z].richtig ? 0 : 1) ^ (richtig ? 0 : 1); await page.click(`.mx-knopf[data-z="${z}"][data-s="${s}"]`); } break;
    case 'luecke': { let g = 0; for (const t of it.teile) if (t.wahl) { const w = richtig ? t.loesung : (t.loesung + 1) % t.wahl.length; await page.selectOption(`select[data-g="${g}"]`, String(w)); g++; } break; }
    case 'markieren': {
      const ziele = it.teile.map((t, k) => (t.ziel ? k : -1)).filter((k) => k >= 0);
      const nicht = it.teile.map((t, k) => (!t.ziel && !t.fix ? k : -1)).filter((k) => k >= 0);
      for (const k of richtig ? ziele : nicht.slice(0, 1)) await page.click(`.tok[data-i="${k}"]`);
      break;
    }
    case 'zuordnen': for (let e = 0; e < it.elemente.length; e++) { const g = richtig ? it.elemente[e].g : (it.elemente[e].g + 1) % it.gruppen.length; await page.click(`.chip[data-i="${e}"]`); await page.click(`.zu-gruppe[data-g="${g}"]`); } break;
    case 'reihenfolge': {
      const soll = it.reihe.map(ohneTags);
      for (let runde = 0; runde < 40; runde++) {
        const ist = await page.$$eval('.reihe-text', (els) => els.map((e) => e.textContent.trim()));
        const k = ist.findIndex((t, i) => t !== soll[i]);
        if (k < 0) break;
        const j = ist.indexOf(soll[k]);
        await page.click(`.reihe-knoepfe button[data-act="hoch"][data-k="${j}"]`);
      }
      if (!richtig) await page.click('.reihe-knoepfe button[data-act="runter"][data-k="0"]');
      break;
    }
    case 'eingabe': await page.fill('input.eingabe', richtig ? it.loesungen[0] : 'xyz'); break;
  }
}
