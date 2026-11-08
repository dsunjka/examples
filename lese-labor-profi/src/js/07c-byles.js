/* ===== BYLES-Formate: Blitz-Lesen (BYLET-F), Daumen-Check (BYLET-P), BYLES-Fahrplan =====
   Abläufe nach der öffentlichen Elterninformation zu BYLES (Schuljahr 2026/27). Alle Wörter, Sätze und
   Aussagen sind eigene Übungsinhalte – keine Originalaufgaben. */

/* ---------- Fahrplan: die vier Stationen der 4. Klasse ---------- */
const BYLES_STATIONEN = [
  { k: 'p', nr: 1, modul: 'BYLET-P', name: 'Daumen-Check', sym: '👍', farbe: 'var(--m-schreiben)',
    was: 'Du liest acht Sätze über dich und das Lesen, zum Beispiel „Lesen macht mir Spaß.“ Mit vier Daumen zeigst du, wie sehr das für dich stimmt.',
    tipp: 'Hier gibt es kein Richtig oder Falsch. Antworte ehrlich – so, wie es für dich wirklich ist.' },
  { k: 'f', nr: 2, modul: 'BYLET-F', name: 'Blitz-Lesen', sym: '⚡', farbe: 'var(--m-tempo)',
    was: 'Ein Wort oder ein Satz blitzt kurz auf. Danach tippst du unter vier Bildern das passende an. Von Stufe zu Stufe blitzt es kürzer.',
    tipp: 'Schau genau in die Mitte des Rahmens, bevor es aufblitzt. Für die Bilder hast du so viel Zeit, wie du brauchst.' },
  { k: 'v', nr: 3, modul: 'BYLET-V', name: 'Geschichte in vier Teilen', sym: '📖', farbe: 'var(--m-lesen)',
    was: 'Du liest eine Geschichte in vier Abschnitten. Nach jedem Abschnitt beantwortest du vier Fragen, am Ende noch vier Fragen zur ganzen Geschichte.',
    tipp: 'Lies jeden Abschnitt ganz in Ruhe. Bei den letzten vier Fragen darfst du in allen Abschnitten nachlesen.' },
  { k: 'd', nr: 4, modul: 'BYLET-D', name: 'Lesen im Internet', sym: '🌐', farbe: 'var(--m-digital)',
    was: 'Du siehst Suchmaschinen, Webseiten, Chats und Apps und beantwortest Fragen dazu, was dort steht und wie man sie richtig nutzt.',
    tipp: 'Achte auf den Hinweis unter der Frage: „Hier ist eine Antwort richtig.“ oder „Hier sind mehrere Antworten richtig.“' },
];
const bylesStand = (p = P()) => (p && p.byles) || {};
const heuteGeschafft = (k, p = P()) => { const t = bylesStand(p)[k]; return !!t && heute(new Date(t)) === heute(); };
function bylesMerke(k) {
  const p = P(); if (!p) return;
  p.byles = { ...bylesStand(p), [k]: Date.now() };
}
function vGeschichten() { return REG.module.lesen.gruppen.filter((gid) => REG.gruppen[gid].daten.format === 'bylet-v'); }
function stationAktion(s, klein = true) {
  const k = klein ? ' knopf-klein' : '';
  if (s.k === 'p') return `<button type="button" class="knopf${k}" data-act="daumen-start">Daumen-Check starten</button>`;
  if (s.k === 'f') return `<button type="button" class="knopf${k}" data-act="blitz-start" ${blitzBereit() ? '' : 'disabled'}>Blitz-Lesen starten</button>`;
  if (s.k === 'v') {
    const g = vGeschichten();
    return g.length ? g.map((gid, i) => `<button type="button" class="knopf${k}${i ? ' knopf-zweit' : ''}" data-act="pruef-intro" data-art="lesev-${esc(gid)}">${esc(REG.gruppen[gid].titel)}</button>`).join('') : '<span class="leise klein">Noch keine Geschichte im Labor.</span>';
  }
  return `<button type="button" class="knopf${k} knopf-signal" data-act="pruef-intro" data-art="digital" ${REG.module.digital.items.length ? '' : 'disabled'}>BYLET-D-Prüfung</button>`;
}
function viewByles() {
  const p = P(), stand = bylesStand(p);
  const heuteZahl = BYLES_STATIONEN.filter((s) => heuteGeschafft(s.k, p)).length;
  const stationen = BYLES_STATIONEN.map((s) => {
    const t = stand[s.k], fertig = heuteGeschafft(s.k, p);
    return `<li class="station${fertig ? ' fertig' : ''}" style="--farbe:${s.farbe}">
      <span class="labor-symbol station-planet" aria-hidden="true"><span class="station-sym">${s.sym}</span></span>
      <div class="station-inhalt"><span class="station-nr">Station ${s.nr} · ${esc(s.modul)}</span><h2>${esc(s.name)}</h2>
        <p>${esc(s.was)}</p><p class="station-tipp"><b>Profi-Tipp:</b> ${esc(s.tipp)}</p>
        <p class="klein ${fertig ? 'station-ok' : 'leise'}">${fertig ? '✓ Heute geschafft' : t ? `Zuletzt geübt: ${datumLesbar(t)}` : 'Noch nicht geübt'}</p>
        <div class="zeile">${stationAktion(s)}</div></div></li>`;
  }).join('');
  return {
    titel: 'BYLES-Fahrplan',
    html: `<div class="modul-kopf" style="--farbe:var(--gold)"><span class="labor-symbol">${icon('fahne')}</span><div><h1>Dein BYLES-Fahrplan</h1><p>So läuft der Bayerische Lesetest in der 4. Klasse ab – und so übst du jede Station.</p></div></div>
      <div class="info-box" style="--farbe:var(--gold)"><p><b>BYLES</b> heißt Bayerisches Lesescreening. Du machst es in der Schule am Tablet oder Computer. In der 4. Klasse gibt es <b>vier Stationen</b> – immer in dieser Reihenfolge. Lese-Labor PROFI ist nicht der echte Test: Hier übst du mit eigenen Aufgaben im gleichen Stil.</p></div>
      <section class="karte generalprobe" aria-label="Generalprobe">
        <div><h2>Generalprobe ${heuteZahl === 4 ? '🏆' : '🚀'}</h2><p>${heuteZahl === 4 ? 'Stark! Du hast heute alle vier Stationen geschafft – genau wie am echten Testtag.' : 'Schaffst du alle vier Stationen an einem Tag? Dann bist du bereit für den Testtag.'}</p></div>
        <div class="generalprobe-punkte" role="img" aria-label="Heute ${heuteZahl} von 4 Stationen geschafft">${BYLES_STATIONEN.map((s) => `<i class="${heuteGeschafft(s.k, p) ? 'voll' : ''}">${s.nr}</i>`).join('')}</div>
      </section>
      <ol class="stationen">${stationen}</ol>
      <section class="karte" style="display:grid;gap:10px"><h2 style="font-size:1.2rem">Tipps für den Testtag</h2>
        <ul style="margin:0;padding-left:20px;display:grid;gap:6px;line-height:1.5"><li>Schlaf gut und iss vorher eine Brotzeit. Ein wacher Kopf liest besser.</li><li>Lies jede Frage bis zum Ende – und den kleinen Hinweis darunter.</li><li>Bist du unsicher? Lies im Text nach, statt zu raten.</li><li>Bleib ruhig, wenn etwas schwer ist. Das geht allen so – mach einfach mit der nächsten Aufgabe weiter.</li></ul></section>`,
  };
}
/** Hinweis auf Ergebnisseiten der vier Stationen: geschafft – und was als Nächstes kommt. */
function fahrplanBanner(k) {
  const s = BYLES_STATIONEN.find((x) => x.k === k); if (!s || !P()) return '';
  const offen = BYLES_STATIONEN.filter((x) => !heuteGeschafft(x.k));
  const naechste = offen.find((x) => x.nr > s.nr) || offen[0];
  return `<section class="fahrplan-banner" aria-label="BYLES-Fahrplan"><span class="fahrplan-sym" aria-hidden="true">${s.sym}</span>
    <div><b>BYLES-Fahrplan: Station ${s.nr} geschafft!</b><p>${naechste ? `Nächste Station: ${naechste.nr} · ${esc(naechste.name)} (${esc(naechste.modul)})` : 'Alle vier Stationen heute geschafft – Generalprobe bestanden! 🏆'}</p></div>
    <button type="button" class="knopf knopf-klein knopf-zweit" data-nav="byles">Zum Fahrplan</button></section>`;
}

/* ---------- Blitz-Lesen (Format BYLET-F) ---------- */
const BLITZ_TEILE = {
  woerter: { name: 'Wörter', stufen: [1200, 900, 700, 520, 400, 300, 220], uebungMs: 1500, einfach: (x) => x.silben === 2, komplex: (x) => x.silben >= 3 },
  saetze: { name: 'Sätze', stufen: [4200, 3400, 2800, 2300, 1900, 1500], uebungMs: 5000, einfach: (x) => !x.komplex, komplex: (x) => !!x.komplex },
};
let BLITZ = null, blitzLeseTimer = null;
const blitzInhalt = () => INHALT.blitz || { woerter: [], saetze: [] };
const blitzText = (x) => x.wort || x.satz || '';
function blitzBereit() { const b = blitzInhalt(); return (b.woerter || []).length >= 8 && (b.saetze || []).length >= 8; }
function blitzBest(p = P(), teil = 'w') { const l = (p && p.blitz) || []; return l.length ? Math.max(...l.map((x) => x[teil] || 0)) : null; }
function blitzKarteHTML() {
  const p = P(), l = (p.blitz || []).slice(-6), bw = blitzBest(p, 'w'), bs = blitzBest(p, 's');
  return `<section class="karte blitz-karte" style="display:grid;gap:14px;--farbe:var(--m-tempo)">
    <div class="zeile-zwischen"><h2 style="font-size:1.25rem">⚡ Blitz-Lesen</h2><span class="etikett etikett-farbe">wie BYLET-F</span></div>
    <p style="line-height:1.5">Ein Wort oder ein Satz blitzt kurz auf. Dann tippst du das passende Bild an. Jede Stufe blitzt kürzer: <b>7 Wort-Stufen</b> und <b>6 Satz-Stufen</b> mit je 5 Aufgaben.</p>
    <ul style="margin:0;padding-left:20px;display:grid;gap:4px;line-height:1.5"><li>Für die Bilder hast du keine Zeitvorgabe.</li><li>Bei 3 Fehlern in einer Stufe ist der Teil zu Ende – dann ist das deine Stufe.</li><li>Zuerst kommen 2 Übungsaufgaben.</li></ul>
    <div class="fakten">${bw != null ? `<span class="fakt">Beste Wort-Stufe: ${bw}/7</span><span class="fakt">Beste Satz-Stufe: ${bs}/6</span>` : '<span class="fakt">Noch nicht geübt</span>'}</div>
    ${l.length ? `<div class="tabelle-scroll"><table class="verlauf-tabelle"><thead><tr><th>Datum</th><th>Wörter</th><th>Sätze</th></tr></thead><tbody>${l.slice().reverse().map((x) => `<tr><td>${datumLesbar(x.datum)}</td><td>Stufe ${x.w}/7</td><td>Stufe ${x.s}/6</td></tr>`).join('')}</tbody></table></div>` : ''}
    <button type="button" class="knopf" data-act="blitz-start" ${blitzBereit() ? '' : 'disabled'}>Blitz-Lesen starten</button></section>`;
}
function blitzZiehen(teil, genutzt) {
  const T = BLITZ_TEILE[teil], pool = (blitzInhalt()[teil] || []).filter((x) => x && blitzText(x) && x.bild);
  const frei = (f, n) => {
    let kand = mische(pool.filter((x) => f(x) && !genutzt.has(x.id)));
    if (kand.length < n) kand = kand.concat(mische(pool.filter((x) => f(x) && !kand.includes(x))));
    if (kand.length < n) kand = kand.concat(mische(pool.filter((x) => !kand.includes(x))));
    const wahl = kand.slice(0, n); wahl.forEach((x) => genutzt.add(x.id)); return wahl;
  };
  return mische(frei(T.einfach, 3).concat(frei(T.komplex, 2)));
}
function blitzAufgabe(x) {
  const bilder = mische([{ ...x.bild, ok: true }].concat((x.ablenker || []).slice(0, 3).map((a) => ({ ...a, ok: false }))));
  return { x, bilder };
}
function blitzStart() {
  if (!blitzBereit()) { toast('Für das Blitz-Lesen fehlen noch Inhalte.'); return; }
  BLITZ = { teile: ['woerter', 'saetze'], t: 0, phase: 'bereit', genutzt: new Set(), erg: { woerter: { stufe: 0, richtig: 0, gesamt: 0 }, saetze: { stufe: 0, richtig: 0, gesamt: 0 } }, fehlerListe: [] };
  zeige('blitz-lauf');
}
const blitzTeil = () => BLITZ.teile[BLITZ.t];
function blitzStopp() { clearTimeout(blitzLeseTimer); blitzLeseTimer = null; }
function blitzSpaeter(fn, ms) { blitzStopp(); const b = BLITZ; blitzLeseTimer = setTimeout(() => { if (BLITZ === b && ANSICHT.name === 'blitz-lauf') fn(); }, ms); }
function renderBlitzLauf(ganz = true) {
  if (!BLITZ) { zeige('tempo'); return; }
  const teil = blitzTeil(), T = BLITZ_TEILE[teil];
  const imLauf = ['fix', 'zeigen', 'wahl', 'rueck'].includes(BLITZ.phase) && !BLITZ.uebung;
  const unter = BLITZ.uebung ? 'Übung' : imLauf ? `Stufe ${BLITZ.stufe + 1} von ${T.stufen.length} · Aufgabe ${Math.min(BLITZ.k, 4) + 1} von 5` : `Teil ${BLITZ.t + 1} von 2`;
  const geschafft = BLITZ.uebung || ['bereit', 'los'].includes(BLITZ.phase) ? 0 : BLITZ.phase === 'teil-ende' ? BLITZ.erg[teil].stufe : BLITZ.stufe;
  const stufen = T.stufen.map((_, i) => `<i class="${i < geschafft ? 'voll' : ''}${i === BLITZ.stufe && imLauf ? ' jetzt' : ''}">${i + 1}</i>`).join('');
  const buehne = $('#blitz-buehne');
  if (!ganz && buehne && buehne.dataset.teil === teil) {
    // nur die Bühne tauschen: der Kopf bleibt ruhig stehen
    buehne.innerHTML = blitzBuehneHTML();
    const u = $('#blitz-unter'); if (u) u.textContent = unter;
    const s = $('.blitz-stufen'); if (s) s.innerHTML = stufen;
  } else {
    $('#app').innerHTML = `<div class="sitzung blitz-sitzung">
    <header class="sitzung-kopf" style="--farbe:var(--m-tempo)"><button type="button" class="rund-knopf" data-act="blitz-abbruch" aria-label="Blitz-Lesen beenden">${icon('zurueck')}</button>
      <div class="sitzung-titel"><b>Blitz-Lesen · ${T.name}</b><span id="blitz-unter">${esc(unter)}</span></div>
      <div class="blitz-stufen" aria-hidden="true">${stufen}</div></header>
    <div class="blitz-buehne ${teil}" id="blitz-buehne" data-teil="${teil}">${blitzBuehneHTML()}</div></div>`;
  }
  if (BLITZ.phase === 'wahl') { const b = $('.bild-wahl'); if (b) try { b.focus({ preventScroll: true }); } catch (e) { /* egal */ } }
}
function blitzBuehneHTML() {
  const teil = blitzTeil(), T = BLITZ_TEILE[teil], a = BLITZ.aufgabe;
  switch (BLITZ.phase) {
    case 'bereit': return `<div class="blitz-info"><span class="blitz-gross" aria-hidden="true">${teil === 'woerter' ? '🔤' : '📝'}</span><h1>Teil ${BLITZ.t + 1}: ${T.name}</h1>
      <p>${teil === 'woerter' ? 'Gleich blitzt ein Wort auf.' : 'Gleich blitzt ein Satz auf. Lies ihn bis zum Ende!'} Danach tippst du das Bild an, das dazu passt.</p>
      <p class="leise">Schau auf den Stern ✦ in der Mitte – dort erscheint ${teil === 'woerter' ? 'das Wort' : 'der Satz'}.</p>
      <button type="button" class="knopf" data-act="blitz-uebung">Übung starten</button></div>`;
    case 'los': return `<div class="blitz-info"><span class="blitz-gross" aria-hidden="true">🚀</span><h1>Bereit?</h1><p>Jetzt geht es richtig los: ${T.stufen.length} Stufen, jede ein bisschen schneller.</p><button type="button" class="knopf knopf-signal" data-act="blitz-los">Los!</button></div>`;
    case 'fix': return `<div class="blitz-rahmen"><span class="blitz-fix" aria-hidden="true">✦</span></div>`;
    case 'zeigen': return `<div class="blitz-rahmen"><p class="bl-wort" id="bl-wort">${esc(blitzText(a.x))}</p></div>`;
    case 'wahl': case 'rueck': {
      const r = BLITZ.phase === 'rueck' ? BLITZ.letzte : null;
      return `<div class="blitz-rahmen leer">${r ? (r.ok ? '<p class="blitz-rueck ok">✓ Richtig!</p>' : `<p class="blitz-rueck nein">Da stand: <b>${esc(blitzText(a.x))}</b></p>`) : `<p class="leise">Welches Bild passt?</p>`}</div>
        <div class="bild-raster" role="group" aria-label="Welches Bild passt?">${a.bilder.map((b, i) => `<button type="button" class="bild-wahl${r && b.ok ? ' ok' : ''}${r && r.i === i && !b.ok ? ' nein' : ''}" data-act="blitz-wahl" data-i="${i}" aria-label="${esc(b.name || 'Bild ' + (i + 1))}" ${r ? 'disabled' : ''}><span class="bild-emoji">${esc(b.e)}</span><span class="bild-nr" aria-hidden="true">${i + 1}</span></button>`).join('')}</div>`;
    }
    case 'stufe': return `<div class="blitz-info"><span class="blitz-gross" aria-hidden="true">⚡</span><h1>Stufe ${BLITZ.stufe} geschafft!</h1><p>Jetzt blitzt es noch ein bisschen kürzer.</p></div>`;
    case 'teil-ende': {
      const e = BLITZ.erg[teil];
      return `<div class="blitz-info"><span class="blitz-gross" aria-hidden="true">${e.stufe === T.stufen.length ? '🏆' : '⭐'}</span><h1>${T.name}: Stufe ${e.stufe} von ${T.stufen.length}</h1>
        <p>${e.stufe === T.stufen.length ? 'Alle Stufen geschafft – Blitz-Auge!' : e.stufe ? 'Gut gemacht! Bei der nächsten Stufe war es noch zu schnell.' : 'Das war noch sehr schnell. Mit Übung schaffst du die erste Stufe!'}</p>
        ${BLITZ.t === 0 ? '<button type="button" class="knopf" data-act="blitz-teil2">Weiter mit den Sätzen</button>' : '<button type="button" class="knopf" data-act="blitz-fertig">Zum Ergebnis</button>'}</div>`;
    }
    default: return '';
  }
}
function blitzUebung() {
  const teil = blitzTeil();
  BLITZ.uebung = true; BLITZ.k = 0; BLITZ.stufe = 0;
  const pool = mische((blitzInhalt()[teil] || []).filter((x) => BLITZ_TEILE[teil].einfach(x)));
  BLITZ.uebungItems = pool.slice(0, 2); BLITZ.uebungItems.forEach((x) => BLITZ.genutzt.add(x.id));
  blitzNaechste();
}
function blitzLos() {
  BLITZ.uebung = false; BLITZ.stufe = 0; BLITZ.k = 0; BLITZ.fehler = 0;
  BLITZ.items = blitzZiehen(blitzTeil(), BLITZ.genutzt);
  bildschirmWach(true);
  blitzNaechste();
}
function blitzNaechste() {
  const x = BLITZ.uebung ? BLITZ.uebungItems[BLITZ.k] : BLITZ.items[BLITZ.k];
  if (!x) { blitzStufeEnde(); return; }
  BLITZ.aufgabe = blitzAufgabe(x);
  BLITZ.phase = 'fix'; renderBlitzLauf(false);
  const T = BLITZ_TEILE[blitzTeil()], ms = BLITZ.uebung ? T.uebungMs : T.stufen[BLITZ.stufe];
  blitzSpaeter(() => {
    BLITZ.phase = 'zeigen'; renderBlitzLauf(false);
    blitzSpaeter(() => { BLITZ.phase = 'wahl'; renderBlitzLauf(false); }, ms);
  }, 700);
}
function blitzWahl(i) {
  if (!BLITZ || BLITZ.phase !== 'wahl') return;
  const b = BLITZ.aufgabe.bilder[i]; if (!b) return;
  const ok = !!b.ok;
  BLITZ.letzte = { ok, i };
  BLITZ.phase = 'rueck'; renderBlitzLauf(false);
  if (ok) { const el = $(`.bild-wahl[data-i="${i}"]`); glitzer(el, { anzahl: 12, weite: 90 }); ton('richtig'); } else { wackeln($('.bild-raster')); ton('falsch'); }
  if (!BLITZ.uebung) {
    const e = BLITZ.erg[blitzTeil()]; e.gesamt++;
    if (ok) e.richtig++; else { BLITZ.fehler++; BLITZ.fehlerListe.push({ text: blitzText(BLITZ.aufgabe.x), richtig: BLITZ.aufgabe.x.bild, gewaehlt: b }); }
  }
  blitzSpaeter(() => {
    BLITZ.k++;
    if (!BLITZ.uebung && BLITZ.fehler >= 3) { blitzTeilEnde(); return; }
    if (BLITZ.uebung && BLITZ.k >= BLITZ.uebungItems.length) { BLITZ.phase = 'los'; renderBlitzLauf(false); return; }
    if (!BLITZ.uebung && BLITZ.k >= 5) { blitzStufeEnde(); return; }
    blitzNaechste();
  }, ok ? 650 : 1700);
}
function blitzStufeEnde() {
  const T = BLITZ_TEILE[blitzTeil()];
  BLITZ.erg[blitzTeil()].stufe = BLITZ.stufe + 1;
  if (BLITZ.stufe + 1 >= T.stufen.length) { blitzTeilEnde(); return; }
  BLITZ.stufe++; BLITZ.k = 0; BLITZ.fehler = 0;
  BLITZ.items = blitzZiehen(blitzTeil(), BLITZ.genutzt);
  BLITZ.phase = 'stufe'; renderBlitzLauf(false);
  glitzer($('.blitz-info h1'), { anzahl: 20 });
  blitzSpaeter(blitzNaechste, 1500);
}
function blitzTeilEnde() {
  blitzStopp(); bildschirmWach(false);
  BLITZ.phase = 'teil-ende'; renderBlitzLauf(false);
  if (BLITZ.erg[blitzTeil()].stufe >= 3) glitzer($('.blitz-info h1'), { anzahl: 24, gross: true });
}
function blitzTeil2() { BLITZ.t = 1; BLITZ.phase = 'bereit'; BLITZ.stufe = 0; renderBlitzLauf(); }
function blitzFertig() {
  blitzStopp(); bildschirmWach(false);
  if (!BLITZ) { zeige('tempo'); return; }
  const p = P(), e = BLITZ.erg;
  const eintrag = { datum: Date.now(), w: e.woerter.stufe, s: e.saetze.stufe, richtig: e.woerter.richtig + e.saetze.richtig, gesamt: e.woerter.gesamt + e.saetze.gesamt };
  const bisher = { w: blitzBest(p, 'w'), s: blitzBest(p, 's') };
  if (p) { p.blitz = (p.blitz || []).concat(eintrag).slice(-60); bylesMerke('f'); punkteDazu((eintrag.w + eintrag.s) * 3); merkeTag(); speichern(true); }
  pruefeAbzeichen();
  const fehler = BLITZ.fehlerListe.slice(0, 12);
  BLITZ = null;
  zeige('blitz-ergebnis', { eintrag, bisher, fehler });
}
function blitzAbbruch() { blitzStopp(); bildschirmWach(false); BLITZ = null; zeige('tempo'); }
function viewBlitzErgebnis(param) {
  if (!param) return viewTempo();
  const { eintrag: x, bisher, fehler } = param;
  const neuW = bisher.w != null && x.w > bisher.w, neuS = bisher.s != null && x.s > bisher.s;
  return {
    titel: 'Blitz-Lesen – Ergebnis', schmal: true,
    html: `<section class="karte ergebnis-kopf">${ringSVG(x.w + x.s, 13)}
      <div style="display:grid;gap:8px">${sterneHTML((x.w / 7 + x.s / 6) / 2)}<h1 class="titel-urkunde">${neuW || neuS ? 'Neuer Bestwert! ⚡' : 'Blitz-Lesen geschafft!'}</h1>
      <p>Wörter: <b>Stufe ${x.w} von 7</b>${neuW ? ' (neu!)' : ''} · Sätze: <b>Stufe ${x.s} von 6</b>${neuS ? ' (neu!)' : ''}</p>
      <p class="leise">${x.richtig} von ${x.gesamt} Bildern richtig gewählt.</p>
      <div class="zeile"><button type="button" class="knopf" data-act="blitz-start">Nochmal</button><button type="button" class="knopf knopf-zweit" data-nav="tempo">Zur Übersicht</button></div></div></section>
      ${fahrplanBanner('f')}
      ${fehler.length ? `<section class="karte" style="display:grid;gap:10px"><h2 style="font-size:1.15rem">Hier war es zu schnell</h2>
        <ul class="blitz-fehler">${fehler.map((f) => `<li><span>${esc(f.text)}</span><span class="blitz-fehler-bild" role="img" aria-label="richtig: ${esc(f.richtig.name || '')}">${esc(f.richtig.e)}</span><span class="leise klein">du: <span role="img" aria-label="${esc(f.gewaehlt.name || '')}">${esc(f.gewaehlt.e)}</span></span></li>`).join('')}</ul>
        <p class="klein leise">Tipp: Bei ähnlichen Wörtern wie „Biene“ und „Birne“ entscheidet ein einziger Buchstabe. Lies jedes Wort bis zum letzten Buchstaben.</p></section>` : ''}`,
  };
}

/* ---------- Daumen-Check (Format BYLET-P) ---------- */
const DAUMEN_SAETZE = [
  { t: 'Lesen macht mir Spaß.', sym: '📚', art: 'lust' },
  { t: 'In meiner Freizeit lese ich auch, wenn es niemand von mir verlangt.', sym: '🛋️', art: 'lust' },
  { t: 'Ich freue mich, wenn ich ein neues Buch oder Heft bekomme.', sym: '🎁', art: 'lust' },
  { t: 'Auch lange Texte kann ich gut verstehen.', sym: '📜', art: 'koennen' },
  { t: 'Wenn ich vorlese, klappt das gut.', sym: '🗣️', art: 'koennen' },
  { t: 'Wichtige Stellen in einem Text finde ich schnell.', sym: '🔍', art: 'koennen' },
  { t: 'Wenn ein Text schwierig ist, gebe ich nicht so schnell auf.', sym: '💪', art: 'koennen' },
  { t: 'Ich glaube, ich bin eine gute Leserin oder ein guter Leser.', sym: '⭐', art: 'koennen' },
];
const DAUMEN_STUFEN = [
  { w: 3, name: 'Stimmt genau', cls: 'd1' }, { w: 2, name: 'Stimmt eher', cls: 'd2' },
  { w: 1, name: 'Stimmt eher nicht', cls: 'd3' }, { w: 0, name: 'Stimmt gar nicht', cls: 'd4' },
];
let DAUMEN = null;
function daumenStart() { DAUMEN = { i: 0, antworten: [] }; zeige('daumen'); }
function viewDaumen() {
  if (!DAUMEN) DAUMEN = { i: 0, antworten: [] };
  if (DAUMEN.fertig) return daumenErgebnis();
  const s = DAUMEN_SAETZE[DAUMEN.i], wahl = DAUMEN.antworten[DAUMEN.i];
  return {
    titel: 'Daumen-Check', schmal: true,
    html: `<section class="karte daumen-karte" aria-labelledby="daumen-satz">
      <div class="zeile-zwischen"><span class="etikett etikett-farbe" style="--farbe:var(--m-schreiben)">Daumen-Check · wie BYLET-P</span><span class="klein leise">Satz ${DAUMEN.i + 1} von ${DAUMEN_SAETZE.length}</span></div>
      <div class="daumen-fort" aria-hidden="true">${DAUMEN_SAETZE.map((_, i) => `<i class="${i < DAUMEN.i ? 'voll' : i === DAUMEN.i ? 'jetzt' : ''}"></i>`).join('')}</div>
      <div class="daumen-satz-zeile"><p class="daumen-satz" id="daumen-satz">${esc(s.t)}</p><span class="daumen-sym" aria-hidden="true">${s.sym}</span></div>
      <div class="daumen-linie" aria-hidden="true"></div>
      <div class="daumen-wahl" role="radiogroup" aria-labelledby="daumen-satz">${DAUMEN_STUFEN.map((d) => `<button type="button" class="daumen-knopf ${d.cls}" role="radio" aria-checked="${wahl === d.w}" data-act="daumen-wahl" data-w="${d.w}"><span class="daumen-hand" aria-hidden="true">${d.w >= 2 ? '👍' : '👎'}</span><span class="daumen-name">${d.name}</span></button>`).join('')}</div>
      <p class="klein leise" style="text-align:center">Hier gibt es kein Richtig oder Falsch. Antworte so, wie es für dich stimmt.</p>
      <div class="aktionen">${DAUMEN.i ? '<button type="button" class="knopf knopf-zweit" data-act="daumen-zurueck">Zurück</button>' : '<button type="button" class="knopf knopf-zweit" data-nav="byles">Abbrechen</button>'}<span class="rechts"><button type="button" class="knopf" data-act="daumen-weiter" ${wahl == null ? 'disabled' : ''}>Weiter</button></span></div>
    </section>`,
  };
}
function daumenWahl(w) {
  if (!DAUMEN || DAUMEN.fertig) return;
  DAUMEN.antworten[DAUMEN.i] = w;
  $$('.daumen-knopf').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.w) === w)));
  const weiter = $('[data-act="daumen-weiter"]'); if (weiter) weiter.disabled = false;
}
function daumenWeiter() {
  if (!DAUMEN || DAUMEN.antworten[DAUMEN.i] == null) return;
  if (DAUMEN.i < DAUMEN_SAETZE.length - 1) { DAUMEN.i++; render(); fokus('.daumen-satz'); return; }
  DAUMEN.fertig = true;
  const p = P(); if (p) { bylesMerke('p'); punkteDazu(10); merkeTag(); speichern(true); }
  pruefeAbzeichen();
  render();
  glitzer($('.ergebnis-kopf h1'), { anzahl: 22 });
}
function daumenErgebnis() {
  // Die Antworten werden bewusst NICHT gespeichert – sie bleiben nur für diese Rückmeldung im Speicher.
  const a = DAUMEN.antworten, mittel = (art) => { const w = DAUMEN_SAETZE.map((s, i) => (s.art === art ? a[i] : null)).filter((x) => x != null); return w.length ? sum(w) / w.length : 0; };
  const lust = mittel('lust'), koennen = mittel('koennen');
  const tipps = [];
  if (lust < 1.5) tipps.push('Lesen macht mehr Spaß, wenn das Thema dich interessiert: Comics, Witzebücher, Tierlexika, Rätselhefte oder Zeitschriften zählen auch!');
  else tipps.push('Schön, dass du gern liest! Probier doch mal etwas Neues aus: ein Sachbuch, ein Gedicht oder eine Geschichte aus einem anderen Land.');
  if (koennen < 1.5) tipps.push('Lesen ist wie Sport: Jeden Tag ein bisschen macht dich stärker. Die Tagesmission und das Lese-Labor helfen dir dabei.');
  else tipps.push('Du traust dir beim Lesen viel zu – super! Im Lese-Labor findest du extra knifflige Fragen.');
  return {
    titel: 'Daumen-Check', schmal: true,
    html: `<section class="karte ergebnis-kopf"><span class="daumen-gross" aria-hidden="true">👍</span>
      <div style="display:grid;gap:8px"><h1 class="titel-urkunde">Danke fürs Mitmachen!</h1>
      <p>Beim Daumen-Check gibt es kein Richtig oder Falsch – im echten Test genauso. Wichtig ist nur, dass du ehrlich antwortest.</p>
      <p class="klein leise">Deine Antworten werden nicht gespeichert.</p>
      <div class="zeile"><button type="button" class="knopf" data-nav="byles">Zum Fahrplan</button><button type="button" class="knopf knopf-zweit" data-act="daumen-start">Nochmal</button></div></div></section>
      ${fahrplanBanner('p')}
      <section class="karte" style="display:grid;gap:10px"><h2 style="font-size:1.15rem">Zwei Ideen für dich</h2><ul style="margin:0;padding-left:20px;display:grid;gap:6px;line-height:1.5">${tipps.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`,
  };
}
