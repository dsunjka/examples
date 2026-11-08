// Strukturprüfung aller Inhaltspakete (siehe CONTENT-SPEC.md).
// Rückgabe: Liste von Befunden { stufe: 'fehler'|'hinweis', datei, ort, text }.
const KLASSEN = new Set('w-kopf w-logo w-menue aktiv w-inhalt w-fuss w-spalten w-karte w-kasten w-kasten--info w-kasten--warnung w-kasten--tipp w-bild w-tabelle w-knopf w-marke w-klein w-datum w-autor w-werbung w-werbung-label s-suchfeld s-filter s-anzahl s-treffer s-url s-titel s-text s-info s-anzeige s-anzeige-label p-beitrag p-kopf p-avatar p-name p-konto p-zeit p-haken p-text p-bild p-leiste p-kommentar c-gruppe c-verlauf c-nachricht c-ich c-absender c-text c-zeit c-hinweis m-liste m-eintrag m-neu m-von m-betreff m-vorschau m-datum m-mail m-kopfzeilen m-text m-anhang m-warnung a-reiter a-kachel a-gross a-symbol a-zeile a-raster a-zelle a-fahrt a-hinweis'.split(' '));
const TAGS = new Set('h1 h2 h3 h4 p ul ol li strong em b i small span div a button br hr table thead tbody tr th td dl dt dd details summary time caption'.split(' '));
const TYPEN = new Set(['single', 'multi', 'matrix', 'luecke', 'markieren', 'zuordnen', 'reihenfolge', 'eingabe']);
const KOMP = {
  digital: ['finden', 'navigieren', 'verknuepfen', 'bewerten'], lesen: ['entnehmen', 'schliessen', 'reflektieren'],
  rechtschreibung: ['mitsprechen', 'nachdenken', 'merken', 'zeichen'], grammatik: ['wortarten', 'wortbildung', 'zeitformen', 'satzglieder', 'faelle'],
  schreiben: ['planen', 'formulieren', 'ueberarbeiten'],
};
const INLINE_OK = /<(?!\/?(?:b|i)>)[^>]*>/;

export function pruefeInhalte(pakete) {
  const out = [];
  const alleIds = new Map();
  const gruppenIds = new Map();
  const add = (stufe, datei, ort, text) => out.push({ stufe, datei, ort, text });
  const pruefeText = (datei, ort, feld, wert) => {
    if (typeof wert !== 'string') return;
    if (INLINE_OK.test(wert)) add('fehler', datei, ort, `${feld}: nur <b> und <i> erlaubt`);
    if (/\s{2,}/.test(wert.replace(/\n/g, ' '))) add('hinweis', datei, ort, `${feld}: doppelte Leerzeichen`);
    if (/"[^"]*"/.test(wert) && !/data-/.test(wert)) add('hinweis', datei, ort, `${feld}: gerade Anführungszeichen statt „…“`);
  };
  const gruppe = (datei, id) => {
    if (!id || !/^[a-z0-9-]+$/.test(id)) add('fehler', datei, String(id), 'ungültige Gruppen-ID');
    if (gruppenIds.has(id)) add('fehler', datei, id, `Gruppen-ID doppelt (auch in ${gruppenIds.get(id)})`);
    gruppenIds.set(id, datei);
  };
  const pruefeItem = (datei, modul, it, extra = {}) => {
    const ort = it && it.id ? it.id : '(ohne id)';
    if (!it || typeof it !== 'object') { add('fehler', datei, ort, 'Item ist kein Objekt'); return; }
    if (!it.id || !/^[a-z0-9-]+$/.test(it.id)) add('fehler', datei, ort, 'ungültige ID');
    if (alleIds.has(it.id)) add('fehler', datei, ort, `ID doppelt (auch in ${alleIds.get(it.id)})`);
    alleIds.set(it.id, datei);
    if (!TYPEN.has(it.typ)) { add('fehler', datei, ort, `unbekannter typ "${it.typ}"`); return; }
    for (const f of ['frage', 'tipp', 'erklaerung']) { if (!it[f] || typeof it[f] !== 'string') add('fehler', datei, ort, `${f} fehlt`); else pruefeText(datei, ort, f, it[f]); }
    if (![1, 2, 3].includes(it.stufe)) add('fehler', datei, ort, 'stufe muss 1, 2 oder 3 sein');
    if (it.kompetenz && KOMP[modul] && !KOMP[modul].includes(it.kompetenz)) add('fehler', datei, ort, `kompetenz "${it.kompetenz}" passt nicht zu ${modul}`);
    const o = it.optionen || [], nr = o.filter((x) => x.richtig === true).length;
    switch (it.typ) {
      case 'single': if (o.length < 3 || nr !== 1) add('fehler', datei, ort, `single: 3–4 Optionen, genau 1 richtig (jetzt ${o.length}/${nr})`); break;
      case 'multi': if (o.length < 4 || nr < 2 || nr >= o.length) add('fehler', datei, ort, `multi: 4–6 Optionen, 2+ richtig, nicht alle (jetzt ${o.length}/${nr})`); break;
      case 'matrix': { const a = it.aussagen || []; if (a.length < 3 || a.every((x) => x.richtig) || a.every((x) => !x.richtig)) add('fehler', datei, ort, 'matrix: mind. 3 Aussagen, beide Spalten vertreten'); if (it.spalten && it.spalten.length !== 2) add('fehler', datei, ort, 'matrix: spalten braucht genau 2 Einträge'); break; }
      case 'luecke': { const g = (it.teile || []).filter((t) => t.wahl); if (!g.length) add('fehler', datei, ort, 'luecke ohne Lücke'); for (const t of g) { if (!(Number.isInteger(t.loesung) && t.loesung >= 0 && t.loesung < t.wahl.length)) add('fehler', datei, ort, 'luecke: loesung ungültig'); if (new Set(t.wahl).size !== t.wahl.length) add('fehler', datei, ort, 'luecke: doppelte Wahl'); } break; }
      case 'markieren': { const te = it.teile || [], z = te.filter((t) => t.ziel).length, tap = te.filter((t) => !t.fix).length; if (!z || z >= tap) add('fehler', datei, ort, 'markieren: mind. 1 Ziel, nicht alle Teile'); if (te.some((t) => typeof t.t !== 'string' || !t.t)) add('fehler', datei, ort, 'markieren: Teil ohne Text'); break; }
      case 'zuordnen': { const gr = it.gruppen || [], el = it.elemente || []; if (gr.length < 2 || el.length < 3 || el.some((e) => !(Number.isInteger(e.g) && e.g >= 0 && e.g < gr.length))) add('fehler', datei, ort, 'zuordnen: Gruppen/Elemente ungültig'); break; }
      case 'reihenfolge': if ((it.reihe || []).length < 3) add('fehler', datei, ort, 'reihenfolge: mind. 3 Elemente'); if (new Set(it.reihe || []).size !== (it.reihe || []).length) add('fehler', datei, ort, 'reihenfolge: doppelte Elemente'); break;
      case 'eingabe': if (!(it.loesungen || []).length || (it.loesungen || []).some((l) => !String(l).trim())) add('fehler', datei, ort, 'eingabe: loesungen fehlen'); break;
    }
    if (it.tippSeite && extra.seiten && !extra.seiten.has(it.tippSeite)) add('fehler', datei, ort, `tippSeite "${it.tippSeite}" existiert nicht`);
  };

  for (const { datei, daten: d } of pakete) {
    if (d.modul === 'digital') {
      const f = d.fall;
      if (!f) { add('fehler', datei, '-', 'fall fehlt'); continue; }
      gruppe(datei, f.id);
      if (!Number.isInteger(f.nummer) || f.nummer < 1) add('fehler', datei, f.id, 'nummer muss eine positive Ganzzahl sein');
      const seiten = new Set((f.seiten || []).map((s) => s.id));
      if (!seiten.has(f.startseite)) add('fehler', datei, f.id, 'startseite existiert nicht');
      const erreichbar = new Set([f.startseite]);
      let neu = true;
      while (neu) { neu = false; for (const s of f.seiten || []) if (erreichbar.has(s.id)) for (const m of String(s.html).matchAll(/data-ziel="([^"]+)"/g)) if (!erreichbar.has(m[1])) { erreichbar.add(m[1]); neu = true; } }
      for (const s of f.seiten || []) {
        if (!erreichbar.has(s.id)) add('fehler', datei, s.id, 'Seite von der Startseite aus nicht erreichbar');
        for (const m of String(s.html).matchAll(/data-ziel="([^"]+)"/g)) if (!seiten.has(m[1])) add('fehler', datei, s.id, `data-ziel "${m[1]}" existiert nicht`);
        for (const m of String(s.html).matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/).filter(Boolean)) if (!KLASSEN.has(c)) add('hinweis', datei, s.id, `unbekannte Klasse "${c}" (wird entfernt)`);
        for (const m of String(s.html).matchAll(/<\s*([a-zA-Z0-9]+)/g)) if (!TAGS.has(m[1].toLowerCase())) add('fehler', datei, s.id, `unerlaubtes Tag <${m[1]}>`);
        if (/style=|<script|<img|href="http/i.test(s.html)) add('fehler', datei, s.id, 'style/script/img/externe Links verboten');
      }
      const ks = (f.items || []).map((i) => i.kompetenz).sort().join(',');
      if (ks !== 'bewerten,finden,navigieren,verknuepfen') add('hinweis', datei, f.id, `Kompetenzen nicht je einmal: ${ks}`);
      for (const it of f.items || []) pruefeItem(datei, 'digital', it, { seiten });
    } else if (d.modul === 'lesen') {
      for (const t of d.texte || []) {
        gruppe(datei, t.id);
        if ((t.format === 'bylet-v') !== !!(t.text && Array.isArray(t.text.abschnitte))) add('fehler', datei, t.id, 'format "bylet-v" und text.abschnitte gehören zusammen');
        if (t.format === 'bylet-v') {
          // Geschichte in vier Abschnitten (BYLET-V-Format): je 4 Fragen nach jedem Abschnitt, 4 zum Gesamttext
          const ab = (t.text && t.text.abschnitte) || [];
          if (ab.length !== 4) add('fehler', datei, t.id, `bylet-v: genau 4 Abschnitte nötig (jetzt ${ab.length})`);
          ab.forEach((a, i) => {
            if (!(a && (a.absaetze || []).length)) add('fehler', datei, t.id, `Abschnitt ${i + 1} ohne absaetze`);
            for (const x of (a && a.absaetze) || []) pruefeText(datei, t.id, `Abschnitt ${i + 1}`, x);
            const w = ((a && a.absaetze) || []).join(' ').split(/\s+/).filter(Boolean).length;
            if (w < 90 || w > 200) add('hinweis', datei, t.id, `Abschnitt ${i + 1}: ${w} Wörter (empfohlen 120–170)`);
          });
          const its = t.items || [];
          if (its.length !== 20) add('fehler', datei, t.id, `bylet-v: genau 20 Fragen nötig (jetzt ${its.length})`);
          its.forEach((it, i) => {
            const soll = i < 16 ? Math.floor(i / 4) + 1 : 0;
            if (it.abschnitt !== soll) add('fehler', datei, it.id || t.id, `abschnitt muss ${soll} sein (Reihenfolge: 4×A1, 4×A2, 4×A3, 4×A4, 4× gesamt)`);
            if (it.typ !== 'single' || (it.optionen || []).length !== 4) add('fehler', datei, it.id || t.id, 'bylet-v: nur single mit genau 4 Optionen');
          });
        } else if (!t.text || (!(t.text.absaetze || []).length && !(t.text.strophen || []).length)) add('fehler', datei, t.id, 'Text ohne absaetze/strophen');
        for (const a of (t.text && t.text.absaetze) || []) pruefeText(datei, t.id, 'absatz', a);
        for (const it of t.items || []) pruefeItem(datei, 'lesen', it);
      }
    } else if (['rechtschreibung', 'grammatik', 'schreiben'].includes(d.modul)) {
      for (const th of d.themen || []) {
        gruppe(datei, th.id);
        if (!th.wissen || !th.wissen.merksatz) add('fehler', datei, th.id, 'wissen.merksatz fehlt');
        for (const it of th.items || []) pruefeItem(datei, d.modul, it);
      }
      for (const dk of d.diktate || []) {
        gruppe(datei, dk.id);
        for (const w of dk.woerter || []) if (!String(w.satz).includes(w.wort)) add('fehler', datei, dk.id, `Satz enthält „${w.wort}“ nicht exakt`);
      }
      for (const a of d.auftraege || []) {
        gruppe(datei, a.id);
        for (const f of ['auftrag', 'planung', 'woerter', 'checkliste']) if (!a[f] || (Array.isArray(a[f]) && !a[f].length)) add('fehler', datei, a.id, `${f} fehlt`);
        if (!(a.minWoerter > 0)) add('fehler', datei, a.id, 'minWoerter fehlt');
      }
    } else if (d.modul === 'blitz') {
      // Blitz-Lesen (BYLET-F-Format): Bild + 3 Ablenker, alles Emoji
      const graph = (s) => { try { return [...new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(String(s))].length; } catch (e) { return [...String(s)].length; } };
      const pruefeBlitz = (x, art) => {
        const ort = (x && x.id) || '(ohne id)';
        if (!x || typeof x !== 'object') { add('fehler', datei, ort, 'Eintrag ist kein Objekt'); return; }
        if (!x.id || !/^[a-z0-9-]+$/.test(x.id)) add('fehler', datei, ort, 'ungültige ID');
        if (alleIds.has(x.id)) add('fehler', datei, ort, `ID doppelt (auch in ${alleIds.get(x.id)})`); else alleIds.set(x.id, datei);
        const text = art === 'wort' ? x.wort : x.satz;
        if (typeof text !== 'string' || !text.trim()) add('fehler', datei, ort, `${art} fehlt`);
        const bilder = [x.bild].concat(x.ablenker || []);
        if ((x.ablenker || []).length !== 3) add('fehler', datei, ort, 'genau 3 Ablenker nötig');
        if (bilder.some((b) => !b || typeof b.e !== 'string' || !b.e.trim() || typeof b.name !== 'string' || !b.name.trim())) add('fehler', datei, ort, 'Bild ohne e/name');
        if (new Set(bilder.map((b) => b && b.e)).size !== bilder.length) add('fehler', datei, ort, 'doppeltes Bild in einer Aufgabe');
        if (new Set(bilder.map((b) => b && b.name)).size !== bilder.length) add('fehler', datei, ort, 'doppelter Bildname in einer Aufgabe');
        if (art === 'wort') { if (![2, 3, 4].includes(x.silben)) add('fehler', datei, ort, 'silben muss 2, 3 oder 4 sein'); if (bilder.some((b) => b && graph(b.e) !== 1)) add('fehler', datei, ort, 'Wort-Bilder: genau ein Emoji'); }
        else { if (typeof x.komplex !== 'boolean') add('fehler', datei, ort, 'komplex fehlt'); if (x.komplex && !/,/.test(x.satz || '')) add('hinweis', datei, ort, 'komplexer Satz ohne Komma?'); if (bilder.some((b) => b && (graph(b.e) < 1 || graph(b.e) > 5))) add('fehler', datei, ort, 'Satz-Bilder: 1–5 Emoji'); }
        for (const b of bilder) if (b && /[\u{1F3FB}-\u{1F3FF}]/u.test(b.e)) add('fehler', datei, ort, 'keine Hauttöne');
        if (art === 'satz' && bilder.every((b) => b && typeof b.e === 'string')) {
          // Ohne Lesen lösbar? Das Zielbild darf nicht das „Mehrheitsbild“ sein (Ablenker im 2×2-Schema bauen).
          const teile = bilder.map((b) => { try { return [...new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(b.e)].map((s) => s.segment); } catch (e) { return [...b.e]; } });
          if (new Set(teile.map((x) => x.length)).size === 1) {
            const wert = teile.map((x) => x.reduce((s, e, i) => s + teile.filter((o) => o[i] === e).length, 0));
            const max = Math.max(...wert);
            if (wert[0] === max && wert.filter((w) => w === max).length === 1) add('fehler', datei, ort, 'Zielbild ist das Mehrheitsbild – ohne Lesen lösbar (Ablenker im 2×2-Schema bauen)');
          }
        }
      };
      for (const w of d.woerter || []) pruefeBlitz(w, 'wort');
      for (const s of d.saetze || []) pruefeBlitz(s, 'satz');
      const ok = (x) => x && typeof x === 'object';
      const w2 = (d.woerter || []).filter((x) => ok(x) && x.silben === 2).length, w3 = (d.woerter || []).filter((x) => ok(x) && x.silben >= 3).length;
      const s1 = (d.saetze || []).filter((x) => ok(x) && !x.komplex).length, s2 = (d.saetze || []).filter((x) => ok(x) && x.komplex).length;
      if (w2 < 23 || w3 < 16) add('hinweis', datei, 'woerter', `wenig Wörter für 7 Stufen ohne Wiederholung (${w2} zweisilbig, ${w3} dreisilbig)`);
      if (s1 < 20 || s2 < 14) add('hinweis', datei, 'saetze', `wenig Sätze für 6 Stufen ohne Wiederholung (${s1} einfach, ${s2} komplex)`);
    } else if (d.modul === 'tempo') {
      const s = d.saetze || [];
      if (s.some((x) => typeof x.t !== 'string' || typeof x.r !== 'boolean')) add('fehler', datei, 'saetze', 'Satz ohne t/r');
      const wahr = s.filter((x) => x.r).length;
      if (Math.abs(wahr - s.length / 2) > s.length * 0.1) add('hinweis', datei, 'saetze', `wahr/falsch unausgeglichen (${wahr}/${s.length})`);
    }
  }
  return out;
}
