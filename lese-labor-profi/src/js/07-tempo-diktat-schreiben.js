/* ===== Lese-Tempo, Diktat und Schreib-Werkstatt ===== */

/* ---------- Lese-Tempo ---------- */
const TEMPO_UEBUNG = [{ t: 'Ein Hund kann bellen.', r: true }, { t: 'Die Sonne ist kalt und dunkel.', r: false }, { t: 'Im Winter kann es schneien.', r: true }];
let TEMPO = null, tempoTimer = null;
function viewTempo() {
  const p = P(), saetze = (INHALT.tempo || {}).saetze || [];
  const letzte = p.tempo.slice(-10), best = tempoBest(p);
  const maxT = Math.max(10, ...letzte.map(tempoWert));
  const dauer = E().tempoDauer;
  return {
    titel: 'Lese-Tempo',
    html: `<div class="modul-kopf" style="--farbe:var(--m-tempo)"><span class="labor-symbol">${icon('tempo')}</span><div><h1>Lese-Tempo</h1><p>Zwei Trainings für flüssiges Lesen: <b>Blitz-Lesen</b> wie im BYLET-F und der <b>Satz-Check</b> gegen die Uhr.</p></div></div>
      <div class="start-raster" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))">
        ${blitzKarteHTML()}
        <section class="karte" style="display:grid;gap:14px">
          <h2 style="font-size:1.25rem">✓ Satz-Check</h2><p style="line-height:1.5">Lies jeden Satz so schnell und genau du kannst. Stimmt er? Dann tippe <b>„stimmt“</b>. Ist er Unsinn? Dann tippe <b>„stimmt nicht“</b>.</p>
          <ul style="margin:0;padding-left:20px;display:grid;gap:4px;line-height:1.5"><li>Du hast <b>${dauer / 60} ${dauer === 60 ? 'Minute' : 'Minuten'}</b> Zeit.</li><li>Die Sätze werden langsam länger.</li><li>Nicht raten! Falsche Antworten werden abgezogen.</li><li>Zuerst kommen 3 Übungssätze.</li></ul>
          <div class="fakten"><span class="fakt">${saetze.length} Sätze im Labor</span>${best != null ? `<span class="fakt">Dein Bestwert: ${best}</span>` : ''}</div>
          <button type="button" class="knopf" data-act="tempo-start" ${saetze.length ? '' : 'disabled'}>Satz-Check starten</button>
        </section>
        <section class="karte" style="display:grid;gap:12px;--farbe:var(--m-tempo)"><h2 style="font-size:1.2rem">Satz-Check: deine letzten Ergebnisse</h2>
          ${letzte.length ? `<div class="mini-diagramm" role="img" aria-label="Tempo-Werte der letzten Tests">${letzte.map((t) => `<div style="height:${Math.max(6, pct(tempoWert(t), maxT))}%" title="${datumLesbar(t.datum)}"><span>${tempoWert(t)}</span></div>`).join('')}</div>
          <div class="tabelle-scroll"><table class="verlauf-tabelle"><thead><tr><th>Datum</th><th>Richtig</th><th>Falsch</th><th>Tempo-Wert</th></tr></thead><tbody>${letzte.slice().reverse().map((t) => `<tr><td>${datumLesbar(t.datum)}</td><td>${t.richtig}</td><td>${t.falsch}</td><td><b>${tempoWert(t)}</b></td></tr>`).join('')}</tbody></table></div>` : '<p class="leise">Noch kein Test gemacht. Probiere es aus!</p>'}
          <p class="klein leise">Der Tempo-Wert ist: richtige minus falsche Sätze. Vergleiche dich mit dir selbst – jedes Mal ein bisschen besser!</p></section>
      </div>`,
  };
}
function tempoWert(t) { return Math.max(0, (Number(t.richtig) || 0) - (Number(t.falsch) || 0)); }
function tempoBest(p) {
  if (!p) return null;
  const m = p.tempo.length ? Math.max(...p.tempo.map(tempoWert)) : null;
  return p.tempoRekord != null || m != null ? Math.max(p.tempoRekord || 0, m || 0) : null;
}
function tempoStart() {
  const saetze = (INHALT.tempo || {}).saetze || [];
  const n = saetze.length, drittel = Math.ceil(n / 3);
  const reihe = [0, 1, 2].flatMap((b) => mische(saetze.slice(b * drittel, (b + 1) * drittel)));
  TEMPO = { phase: 'uebung', uebung: TEMPO_UEBUNG.slice(), saetze: reihe, i: 0, richtig: 0, falsch: 0, fehler: [], dauer: E().tempoDauer, rest: E().tempoDauer, rueck: null };
  zeige('tempo-lauf');
}
function renderTempoLauf() {
  if (!TEMPO) { zeige('tempo'); return; }
  const app = $('#app');
  const uebung = TEMPO.phase === 'uebung';
  const satz = uebung ? TEMPO.uebung[TEMPO.i] : TEMPO.saetze[TEMPO.i];
  if (!satz) { tempoEnde(); return; }
  app.innerHTML = `<div class="sitzung">
    <header class="sitzung-kopf"><button type="button" class="rund-knopf" data-act="tempo-abbruch" aria-label="Test abbrechen">${icon('zurueck')}</button>
      <div class="sitzung-titel"><b>Lese-Tempo</b><span>${uebung ? `Übungssatz ${TEMPO.i + 1} von ${TEMPO.uebung.length}` : `Satz ${TEMPO.i + 1}`}</span></div>
      ${uebung ? '' : `<span class="uhr" id="tempo-uhr">${icon('uhr')}<span>${zeitLesbar(TEMPO.rest)}</span></span>`}</header>
    <div class="tempo-buehne">
      ${uebung ? '' : `<div class="zeitbalken" aria-hidden="true"><i id="tempo-balken" style="width:${pct(TEMPO.rest, TEMPO.dauer)}%"></i></div>`}
      <p class="tempo-satz" id="tempo-satz" aria-live="polite">${esc(satz.t)}</p>
      <div class="tempo-knoepfe"><button type="button" class="tempo-knopf ja" data-act="tempo-antwort" data-r="1"><span aria-hidden="true">✓</span>stimmt</button><button type="button" class="tempo-knopf nein" data-act="tempo-antwort" data-r="0"><span aria-hidden="true">✗</span>stimmt nicht</button></div>
      <p class="leise" id="tempo-rueck" style="min-height:1.5em">${uebung && TEMPO.rueck ? esc(TEMPO.rueck) : uebung ? 'Übung: Hier bekommst du eine Rückmeldung.' : ''}</p>
    </div></div>`;
}
function tempoAntwort(r) {
  if (!TEMPO) return;
  const uebung = TEMPO.phase === 'uebung';
  const satz = uebung ? TEMPO.uebung[TEMPO.i] : TEMPO.saetze[TEMPO.i];
  if (!satz) return;
  const ok = (r === 1) === !!satz.r;
  if (uebung) {
    TEMPO.rueck = ok ? 'Richtig!' : `Nicht ganz: Der Satz ${satz.r ? 'stimmt' : 'stimmt nicht'}.`;
    TEMPO.i++;
    if (TEMPO.i >= TEMPO.uebung.length) {
      TEMPO.phase = 'start';
      $('#app').innerHTML = `<div class="sitzung"><div class="tempo-buehne"><h1 style="font-size:2rem">Bereit?</h1><p class="leise">${esc(TEMPO.rueck)} Jetzt geht es richtig los. Die Uhr läuft ${TEMPO.dauer / 60} ${TEMPO.dauer === 60 ? 'Minute' : 'Minuten'}.</p><button type="button" class="knopf knopf-signal" data-act="tempo-los" style="min-width:220px">Los!</button><button type="button" class="knopf knopf-geist" data-act="tempo-abbruch">Abbrechen</button></div></div>`;
      return;
    }
    renderTempoLauf();
    return;
  }
  if (ok) TEMPO.richtig++; else { TEMPO.falsch++; TEMPO.fehler.push(satz); }
  TEMPO.i++;
  const s = TEMPO.saetze[TEMPO.i];
  if (!s) { tempoEnde(); return; }
  const el = $('#tempo-satz'); if (el) { el.textContent = s.t; if (fxStufe() !== 'aus') { el.classList.remove('neu'); void el.offsetWidth; el.classList.add('neu'); } }
  const kopf = $('.sitzung-titel span'); if (kopf) kopf.textContent = `Satz ${TEMPO.i + 1}`;
}
function tempoLos() {
  TEMPO.phase = 'lauf'; TEMPO.i = 0; TEMPO.start = Date.now();
  renderTempoLauf();
  bildschirmWach(true);
  clearInterval(tempoTimer);
  tempoTimer = setInterval(() => {
    if (!TEMPO || TEMPO.phase !== 'lauf') { clearInterval(tempoTimer); return; }
    TEMPO.rest = Math.max(0, TEMPO.dauer - Math.round((Date.now() - TEMPO.start) / 1000));
    const u = $('#tempo-uhr span'); if (u) u.textContent = zeitLesbar(TEMPO.rest);
    const b = $('#tempo-balken'); if (b) b.style.width = pct(TEMPO.rest, TEMPO.dauer) + '%';
    if (TEMPO.rest <= 0) tempoEnde();
  }, 250);
}
function tempoStopp() { clearInterval(tempoTimer); tempoTimer = null; bildschirmWach(false); }
function tempoEnde() {
  tempoStopp();
  if (!TEMPO || TEMPO.phase !== 'lauf') { zeige('tempo'); return; }
  TEMPO.phase = 'ende';
  const p = P();
  const verstrichen = Math.max(1, Math.min(TEMPO.dauer, Math.round((Date.now() - TEMPO.start) / 1000)));
  const erg = { datum: Date.now(), richtig: TEMPO.richtig, falsch: TEMPO.falsch, dauer: verstrichen, gelesen: TEMPO.i };
  const bisher = tempoBest(p);
  if (p) { p.tempo.push(erg); if (p.tempo.length > 60) p.tempo = p.tempo.slice(-60); p.tempoRekord = Math.max(p.tempoRekord || 0, tempoWert(erg)); punkteDazu(Math.round(tempoWert(erg) / 2)); merkeTag(); speichern(true); }
  pruefeAbzeichen();
  zeige('tempo-ergebnis', { erg, fehler: TEMPO.fehler.slice(), bisher });
}
function viewTempoErgebnis(param) {
  if (!param) return viewTempo();
  const { erg, fehler } = param;
  const best = param.bisher != null ? param.bisher : null;
  const wert = tempoWert(erg), proMin = (erg.richtig / (Math.max(1, erg.dauer) / 60)).toFixed(1).replace('.', ',');
  return {
    titel: 'Lese-Tempo – Ergebnis', schmal: true,
    html: `<section class="karte ergebnis-kopf">${ringSVG(erg.richtig, Math.max(erg.gelesen, 1))}
      <div style="display:grid;gap:8px"><h1 class="titel-urkunde">${best != null && wert > best ? 'Neuer Bestwert! 🚀' : 'Geschafft!'}</h1>
      <p>Du hast <b>${erg.gelesen}</b> Sätze gelesen: <b>${erg.richtig}</b> richtig, <b>${erg.falsch}</b> falsch.</p>
      <p>Tempo-Wert: <b>${wert}</b> · ${proMin} richtige Sätze pro Minute${best != null ? ` · bisheriger Bestwert: ${best}` : ''}</p>
      <div class="zeile"><button type="button" class="knopf" data-act="tempo-start">Nochmal</button><button type="button" class="knopf knopf-zweit" data-nav="tempo">Zur Übersicht</button></div></div></section>
      ${erg.falsch > erg.richtig / 4 ? `<section class="info-box" style="--farbe:var(--signal)"><b>Genauigkeit vor Tempo</b><p>Du hattest viele falsche Antworten. Sie werden vom Tempo-Wert abgezogen – raten lohnt sich nicht. Lies jeden Satz bis zum Ende.</p></section>` : ''}
      ${fehler.length ? `<section class="karte" style="display:grid;gap:10px"><h2 style="font-size:1.15rem">Diese Sätze hast du falsch beurteilt</h2><ul style="margin:0;padding-left:20px;display:grid;gap:6px">${fehler.map((s) => `<li>${esc(s.t)} <b>→ ${s.r ? 'stimmt' : 'stimmt nicht'}</b></li>`).join('')}</ul><p class="klein leise">Tipp: Lies genau bis zum Ende des Satzes – manchmal steckt der Unsinn im letzten Wort.</p></section>` : ''}`,
  };
}

/* ---------- Sprachausgabe ---------- */
function deutscheStimmen() {
  try { return speechSynthesis.getVoices().filter((v) => /^de(-|_|$)/i.test(v.lang)); } catch (e) { return []; }
}
function sprachausgabeOk() { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'; }
function sprich(texte) {
  if (!sprachausgabeOk()) return false;
  try {
    speechSynthesis.cancel();
    const st = deutscheStimmen(), wahl = st.find((v) => v.name === E().stimme) || st.find((v) => /de-DE/i.test(v.lang)) || st[0];
    for (const t of [].concat(texte)) {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = (wahl && wahl.lang) || 'de-DE'; if (wahl) u.voice = wahl;
      u.rate = Number(E().sprechTempo) || 0.85;
      speechSynthesis.speak(u);
    }
    return true;
  } catch (e) { return false; }
}

/* ---------- Diktat ---------- */
let DIKTAT = null;
function fehlerwortDiktat() {
  const p = P(), alle = ((INHALT.rechtschreibung || {}).diktate || []).flatMap((d) => d.woerter);
  const woerter = (p ? p.fehlerwoerter : []).slice(-10).map((w) => alle.find((x) => x.wort === w) || { wort: w, satz: w });
  return { id: '__fehler', titel: 'Meine Fehlerwörter', woerter };
}
function diktatStart(id, modus) {
  const d = id === '__fehler' ? fehlerwortDiktat() : ((INHALT.rechtschreibung || {}).diktate || []).find((x) => x.id === id);
  if (!d || !d.woerter.length) return;
  DIKTAT = { id, titel: d.titel, woerter: mische(d.woerter), i: 0, modus: modus || (sprachausgabeOk() ? 'hoer' : 'blitz'), ergebnisse: [], phase: 'start', korrektur: false, eingabe: '' };
  zeige('diktat');
}
function viewDiktat() {
  if (!DIKTAT) return viewModul('rechtschreibung');
  const D = DIKTAT, w = D.woerter[D.i], n = D.woerter.length;
  const farbe = 'var(--m-rechtschreibung)';
  if (D.phase === 'ende') {
    const ok = D.ergebnisse.filter((x) => x.ok).length;
    const falsch = D.ergebnisse.filter((x) => !x.ok);
    return {
      titel: 'Diktat – Ergebnis', schmal: true,
      html: `<section class="karte ergebnis-kopf">${ringSVG(ok, n)}<div style="display:grid;gap:8px"><h1 class="titel-urkunde">${ok === n ? 'Fehlerfrei – Diktat-Meister!' : 'Diktat geschafft!'}</h1><p>${ok} von ${n} Wörtern sofort richtig geschrieben.</p>
        <div class="zeile">${D.id !== '__fehler' || P().fehlerwoerter.length ? `<button type="button" class="knopf" data-act="diktat" data-id="${esc(D.id)}">Nochmal</button>` : '<span class="leise">Keine Fehlerwörter mehr – super!</span>'}<button type="button" class="knopf knopf-zweit" data-nav="rechtschreibung">Zum Rechtschreib-Labor</button></div></div></section>
        ${falsch.length ? `<section class="karte" style="display:grid;gap:10px"><h2 style="font-size:1.15rem">Übe diese Wörter</h2><div class="beispiele">${falsch.map((x) => `<span><b>${esc(x.wort)}</b> (du: ${esc(x.eingabe)})</span>`).join('')}</div></section>` : ''}`,
    };
  }
  const sprache = sprachausgabeOk();
  const kopf = `<div class="modul-kopf" style="--farbe:${farbe}"><span class="labor-symbol">${icon('lautsprecher')}</span><div><h1>${esc(D.titel)}</h1><p>Wort ${D.i + 1} von ${n} · ${D.modus === 'hoer' ? 'Hör-Diktat' : 'Blitz-Diktat'}</p></div></div>`;
  if (D.phase === 'start') {
    return {
      titel: 'Diktat', schmal: true,
      html: `${kopf}<section class="karte" style="display:grid;gap:14px">
        <h2 style="font-size:1.2rem">Wähle deine Diktat-Art</h2>
        <div class="gruppen">
          <article class="gruppe-karte" style="--farbe:${farbe}"><h3>🎧 Hör-Diktat</h3><p>Das Gerät liest dir jedes Wort und einen Satz vor. Du schreibst das Wort.</p><button type="button" class="knopf knopf-klein" data-act="diktat-modus" data-modus="hoer" ${sprache ? '' : 'disabled'}>Hör-Diktat starten</button>${sprache ? '' : '<p class="klein leise">Auf diesem Gerät gibt es keine Sprachausgabe.</p>'}</article>
          <article class="gruppe-karte" style="--farbe:${farbe}"><h3>⚡ Blitz-Diktat</h3><p>Das Wort blitzt ${E().blitzSek} Sekunden auf. Merke es dir genau und schreibe es dann.</p><button type="button" class="knopf knopf-klein" data-act="diktat-modus" data-modus="blitz">Blitz-Diktat starten</button></article>
        </div>
        <p class="hinweis-datenschutz">${icon('stern')}<span>Autokorrektur ist ausgeschaltet – du schreibst ganz allein. Achte auf Groß- und Kleinschreibung.</span></p></section>`,
    };
  }
  const letztes = D.ergebnisse[D.i];
  let rueck = '';
  if (D.phase === 'geprueft' && letztes) {
    rueck = letztes.ok ? `<div class="rueckmeldung r feier" role="status"><b>Richtig geschrieben!</b></div>`
      : `<div class="rueckmeldung f" role="status"><b>Nicht ganz.</b><div class="vergleich" aria-label="Vergleich deiner Schreibung">${vergleichHTML(letztes.eingabe, w.wort)}</div><p>Richtig ist: <b style="font-size:1.3rem">${esc(w.wort)}</b></p>${D.korrektur ? '<p>Schreibe das Wort jetzt einmal richtig ab.</p>' : ''}</div>`;
  }
  return {
    titel: 'Diktat', schmal: true,
    html: `${kopf}<section class="karte diktat-karte">
      ${D.modus === 'hoer' ? `<div class="zeile" style="justify-content:center"><button type="button" class="knopf" data-act="diktat-hoeren">${icon('lautsprecher')}Wort anhören</button><button type="button" class="knopf knopf-zweit" data-act="diktat-satz">Satz anhören</button></div>`
        : `<p class="blitz-wort" id="blitz-wort" aria-live="polite">${D.phase === 'blitz' ? esc(w.wort) : D.phase === 'geprueft' ? '' : '???'}</p>${D.phase === 'bereit' ? `<button type="button" class="knopf" data-act="diktat-blitz">Wort zeigen</button>` : ''}`}
      <form id="diktat-form" style="display:grid;gap:12px;width:min(480px,100%)">
        <label for="diktat-eingabe" class="unsichtbar">Dein Wort</label>
        <input class="eingabe" type="text" id="diktat-eingabe" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="${D.korrektur ? 'Jetzt richtig abschreiben' : 'Schreibe hier'}" ${D.phase === 'blitz' || D.phase === 'bereit' || (D.phase === 'geprueft' && !D.korrektur) ? 'disabled' : ''}>
        ${D.phase === 'geprueft' && !D.korrektur ? `<button type="button" class="knopf" data-act="diktat-weiter">${D.i + 1 < n ? 'Nächstes Wort' : 'Ergebnis ansehen'}${icon('vor')}</button>` : `<button type="submit" class="knopf" ${D.phase === 'blitz' ? 'disabled' : ''}>${D.korrektur ? 'Abschreiben prüfen' : 'Prüfen'}</button>`}
      </form>${rueck}</section>`,
  };
}
function diktatNachRender() {
  const inp = $('#diktat-eingabe');
  if (inp && !inp.disabled && !(DIKTAT && DIKTAT.phase === 'geprueft' && !DIKTAT.korrektur)) setTimeout(() => inp.focus(), 60);
}
function diktatPruefen(wert) {
  const D = DIKTAT; if (!D || D.phase === 'ende') return;
  const darf = D.korrektur || (D.modus === 'hoer' && D.phase === 'hoer') || (D.modus === 'blitz' && D.phase === 'schreiben');
  if (!darf) { if (D.modus === 'blitz' && D.phase === 'bereit') toast('Tippe zuerst auf „Wort zeigen“.'); return; }
  const w = D.woerter[D.i];
  const g = normEingabe(wert);
  if (!g) return;
  if (D.korrektur) {
    if (g === w.wort) { D.korrektur = false; toast('Gut abgeschrieben!'); }
    else toast('Noch nicht genau gleich. Schau Buchstabe für Buchstabe.');
    zeige('diktat'); return;
  }
  const ok = g === w.wort;
  D.ergebnisse[D.i] = { wort: w.wort, eingabe: g, ok };
  D.phase = 'geprueft';
  if (!ok) { D.korrektur = true; const p = P(); if (p && !p.fehlerwoerter.includes(w.wort)) p.fehlerwoerter.push(w.wort); }
  else {
    punkteDazu(2);
    const p = P();
    if (p && D.id === '__fehler') p.fehlerwoerter = p.fehlerwoerter.filter((x) => x !== w.wort);
  }
  merkeTag(); speichern();
  zeige('diktat');
  if (ok) { glitzer($('.rueckmeldung') || $('#diktat-eingabe'), { anzahl: 20 }); ton('richtig'); } else { wackeln($('.diktat-karte')); ton('falsch'); }
}
function diktatWeiter() {
  const D = DIKTAT;
  D.i++;
  if (D.i >= D.woerter.length) {
    D.phase = 'ende';
    const ok = D.ergebnisse.filter((x) => x.ok).length;
    const p = P();
    if (p && D.id !== '__fehler') { const alt = p.diktate[D.id]; p.diktate[D.id] = { best: Math.max(ok, alt ? alt.best : 0), letzte: ok, datum: Date.now() }; speichern(true); }
    pruefeAbzeichen();
    zeige('diktat'); return;
  }
  D.phase = D.modus === 'hoer' ? 'hoer' : 'bereit';
  zeige('diktat');
  if (D.modus === 'hoer') diktatVorlesen();
}
function diktatVorlesen(nurSatz = false) {
  const w = DIKTAT.woerter[DIKTAT.i];
  if (!sprich(nurSatz ? [w.satz] : [w.wort, w.satz, w.wort])) toast('Die Sprachausgabe funktioniert hier leider nicht. Nutze das Blitz-Diktat.');
}
let blitzTimer = null;
function diktatBlitz() {
  const d = DIKTAT;
  d.phase = 'blitz';
  zeige('diktat');
  clearTimeout(blitzTimer);
  blitzTimer = setTimeout(() => { if (DIKTAT === d && d.phase === 'blitz' && ANSICHT.name === 'diktat') { d.phase = 'schreiben'; zeige('diktat'); } }, (Number(E().blitzSek) || 3) * 1000);
}
function diktatVerlassen() {
  clearTimeout(blitzTimer); blitzTimer = null;
  if (DIKTAT && DIKTAT.phase === 'blitz') DIKTAT.phase = 'bereit';
  try { if (sprachausgabeOk()) speechSynthesis.cancel(); } catch (e) { /* egal */ }
}
/** Buchstabenvergleich (Levenshtein-Pfad) für die Fehleranzeige. */
function vergleichHTML(ist, soll) {
  const a = Array.from(ist), b = Array.from(soll), m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const out = []; let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { out.unshift(a[i - 1] === b[j - 1] ? `<span class="ok">${esc(a[i - 1])}</span>` : `<span class="nein">${esc(a[i - 1])}</span>`); i--; j--; }
    else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { out.unshift(`<span class="nein">${esc(a[i - 1])}</span>`); i--; }
    else { out.unshift(`<span class="fehlt" title="fehlt">_</span>`); j--; }
  }
  return out.join('');
}

/* ---------- Schreib-Werkstatt ---------- */
const STOPPWOERTER = new Set('mein meine meinen meinem meiner meines dein deine deinen deinem deiner deines sein seine seinen seinem seiner seines ihre ihren ihrem ihrer ihres unser unsere unseren unserem unserer unseres euer eure euren eurem eurer eures der die das den dem des ein eine einen einem einer und oder aber ich du er sie es wir ihr mir mich dir dich ihm ihn uns euch sich ist war sind waren hat hatte haben hatten wird wurde nicht auch dann da mit von zu im in am an auf aus bei für nach so wie als wenn weil dass noch schon sehr ganz mal man was wer wo nur doch ja nein'.split(' '));
function viewSchreibauftrag(id) {
  const a = ((INHALT.schreiben || {}).auftraege || []).find((x) => x.id === id);
  if (!a) return viewModul('schreiben');
  const p = P(), st = p.texte[id] || { text: '', notizen: [], check: [] };
  return {
    titel: a.titel,
    html: `<div class="modul-kopf" style="--farbe:var(--m-schreiben)"><span class="labor-symbol">${icon('schreiben')}</span><div><h1>${esc(a.titel)}</h1><p>${esc(a.textsorte)} · mindestens ${a.minWoerter} Wörter</p></div></div>
    <div class="schreib-raster">
      <div style="display:grid;gap:14px;min-width:0">
        <section class="karte" style="display:grid;gap:10px"><h2 style="font-size:1.1rem">Dein Auftrag</h2>${a.impuls ? `<p class="impuls" aria-hidden="true">${esc(a.impuls)}</p>` : ''}<p style="line-height:1.55">${rich(a.auftrag)}</p></section>
        <details class="karte" open><summary>1. Planen</summary><div style="display:grid;gap:10px;margin-top:10px">${a.planung.map((f, i) => `<div class="feld"><label for="notiz-${i}">${esc(f)}</label><input type="text" class="notiz-feld" id="notiz-${i}" data-notiz="${i}" value="${esc((st.notizen || [])[i] || '')}" autocomplete="off" autocorrect="off" spellcheck="false"></div>`).join('')}</div></details>
        <section class="karte" style="display:grid;gap:10px"><h2 style="font-size:1.1rem">Wortspeicher</h2><p class="klein leise">Tippe ein Wort an, um es an der Schreibstelle einzufügen.</p><div class="wortspeicher">${a.woerter.map((w) => `<button type="button" data-act="wort-einfuegen" data-wort="${esc(w)}">${esc(w)}</button>`).join('')}</div></section>
      </div>
      <div style="display:grid;gap:14px;min-width:0">
        <section class="karte" style="display:grid;gap:10px"><div class="zeile-zwischen"><h2 style="font-size:1.1rem">2. Schreiben</h2><span class="klein"><span class="zaehler" id="wort-zaehler">0</span> / ${a.minWoerter} Wörter</span></div>
          <label for="schreibfeld" class="unsichtbar">Dein Text</label>
          <textarea class="schreibfeld" id="schreibfeld" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="Schreibe hier deinen Text. Er wird automatisch gespeichert.">${esc(st.text || '')}</textarea>
          <div class="zeile"><button type="button" class="knopf" data-act="schreib-check">Schreib-Check</button><button type="button" class="knopf knopf-zweit" data-act="text-kopieren">Text kopieren</button></div>
          <div id="schreib-analyse"></div></section>
        <section class="karte" style="display:grid;gap:10px"><h2 style="font-size:1.1rem">3. Überarbeiten: Prüfe selbst</h2>
          <ul class="check-liste">${a.checkliste.map((c, i) => `<li><label><input type="checkbox" data-check="${i}" ${(st.check || [])[i] ? 'checked' : ''}><span>${esc(c)}</span></label></li>`).join('')}</ul>
          <button type="button" class="knopf knopf-signal" data-act="schreib-fertig">${st.fertig ? 'Wieder als fertig speichern' : 'Mein Text ist fertig'}</button></section>
      </div></div>`,
  };
}
let schreibAuftragId = null, schreibTimer = null;
function schreibNachRender() {
  schreibAuftragId = ANSICHT.param;
  const feld = $('#schreibfeld'); if (!feld) return;
  { const n = feld.value.length; try { feld.setSelectionRange(n, n); } catch (e) { /* egal */ } }
  const zaehle = () => { const z = $('#wort-zaehler'); if (z) z.textContent = String(woerterIn(feld.value).length); };
  zaehle();
  const spaeter = () => { clearTimeout(schreibTimer); schreibTimer = setTimeout(schreibSpeichern, 400); };
  feld.addEventListener('input', () => { zaehle(); spaeter(); });
  $$('[data-notiz]').forEach((el) => el.addEventListener('input', spaeter));
  $$('[data-check]').forEach((el) => el.addEventListener('change', schreibSpeichern));
}
/** Beim Verlassen der Schreib-Ansicht sofort speichern, solange die Felder noch da sind. */
function schreibVerlassen() { schreibSpeichern(); speichern(true); }
function schreibSpeichern() {
  clearTimeout(schreibTimer); schreibTimer = null;
  const p = P(); if (!p || !schreibAuftragId || !$('#schreibfeld') || ANSICHT.name !== 'schreibauftrag') return;
  const st = p.texte[schreibAuftragId] || (p.texte[schreibAuftragId] = {});
  const feld = $('#schreibfeld'); if (feld) st.text = feld.value;
  st.notizen = $$('[data-notiz]').map((el) => el.value);
  st.check = $$('[data-check]').map((el) => el.checked);
  st.datum = Date.now();
  speichern();
}
function woerterIn(text) { return String(text).match(/[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*/g) || []; }
function schreibAnalyse(text, auftrag) {
  const out = [];
  const woerter = woerterIn(text);
  const PUNKT = '\u2024'; // Ersatzpunkt für Abkürzungen und Ordnungszahlen
  const roh = String(text).replace(/\n+/g, ' ')
    .replace(/\b(?:z\.\s?B|u\.\s?a|d\.\s?h|usw|bzw|ca|etc|Nr|vgl|evtl|ggf|Std|Min|Hr|Fr|Dr)\.(?=\s+[a-zäöüß0-9])/g, (m) => m.replace(/\./g, PUNKT))
    .replace(/(\d)\.(?=\s+[a-zäöüß0-9])/g, '$1' + PUNKT);
  const saetze = (roh.match(/[^.!?]+[.!?]+["“”»«]?|[^.!?]+$/g) || [])
    .map((s) => s.trim().split(PUNKT).join('.'))
    // „…!“, rief Mia. – der nachgestellte Begleitsatz gehört zum vorigen Satz
    .reduce((alle, s) => { if (alle.length && /^,/.test(s)) alle[alle.length - 1] += ' ' + s; else alle.push(s); return alle; }, [])
    .filter((s) => woerterIn(s).length);
  const erz = /erz[äa]hlung/i.test(auftrag.textsorte);
  const brief = /brief|e-?mail/i.test(auftrag.textsorte);
  const gut = (t) => out.push({ gut: true, t }), tipp = (t) => out.push({ gut: false, t });
  if (woerter.length >= auftrag.minWoerter) gut(`Dein Text hat ${woerter.length} Wörter – lang genug.`);
  else tipp(`Dein Text hat ${woerter.length} Wörter. Ziel: mindestens ${auftrag.minWoerter}. Was könntest du noch genauer beschreiben?`);
  const anf = {};
  for (const s of saetze) { const w = woerterIn(s)[0]; if (w) { const k = w.toLowerCase(); anf[k] = (anf[k] || 0) + 1; } }
  const wieder = Object.entries(anf).filter(([w, n]) => n >= 3 || (['dann', 'und', 'da'].includes(w) && n >= 2)).sort((a, b) => b[1] - a[1]);
  if (saetze.length >= 3) {
    if (wieder.length) tipp(`Satzanfänge: ${wieder.map(([w, n]) => `„${w[0].toUpperCase() + w.slice(1)}“ (${n}×)`).join(', ')}. Probiere andere Anfänge: ${erz ? 'Plötzlich, Kurz darauf, Am Abend, Zum Glück' : 'Zuerst, Danach, Anschließend, Außerdem, Zum Schluss'} …`);
    else gut('Deine Satzanfänge sind abwechslungsreich.');
  }
  const anzahl = {}, schreibung = {};
  for (const w of woerter) { const k = w.toLowerCase(); if (k.length >= 4 && !STOPPWOERTER.has(k)) { anzahl[k] = (anzahl[k] || 0) + 1; if (!schreibung[k] || /^[A-ZÄÖÜ]/.test(w)) schreibung[k] = w; } }
  const oft = Object.entries(anzahl).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (oft.length) tipp(`Diese Wörter kommen oft vor: ${oft.map(([w, n]) => `„${schreibung[w]}“ (${n}×)`).join(', ')}. Ersetze manche durch ein anderes Wort oder ein Pronomen.`);
  else if (woerter.length > 30) gut('Du wiederholst kaum Wörter.');
  const klein = saetze.filter((s) => /^[„"»“«]?[a-zäöüß]/.test(s)).slice(0, 3);
  if (klein.length) tipp(`Diese Sätze beginnen klein: ${klein.map((s) => `„${s.slice(0, 24)}…“`).join(', ')}. Satzanfänge schreibt man groß.`);
  const lang = saetze.filter((s) => woerterIn(s).length > 25);
  if (lang.length) tipp(`${plural(lang.length, 'Satz ist', 'Sätze sind')} sehr lang (über 25 Wörter). Teile lange Sätze auf.`);
  let ende = text.trim();
  // Im Brief stehen Grußformel und Name am Schluss ohne Satzzeichen.
  if (brief) ende = ende.replace(/\n[^\n]*(?:gr(?:u|ü|ue)(?:ß|ss)|liebe|herzlich|tschüss|bis bald)[^\n]*(?:\n[^\n]*){0,2}\s*$/i, '').trim();
  if (ende && !/[.!?…"“”»«]\s*$/.test(ende)) tipp('Am Ende fehlt ein Satzschlusszeichen (. ! ?).');
  const rede = (text.match(/[„"»“«]/g) || []).length;
  if (erz) { if (rede) gut('Du benutzt wörtliche Rede – das macht die Erzählung lebendig.'); else if (woerter.length > 40) tipp('Probiere wörtliche Rede: Lass deine Figuren sprechen („…“).'); }
  const absaetze = text.split(/\n\s*\n/).filter((x) => x.trim()).length;
  if (woerter.length > 80 && absaetze < 2) tipp('Gliedere deinen Text in Absätze (Leerzeile zwischen Einleitung, Hauptteil und Schluss).');
  else if (absaetze >= 3) gut(`Dein Text hat ${absaetze} Absätze – übersichtlich gegliedert.`);
  return out;
}
function schreibCheck() {
  const a = ((INHALT.schreiben || {}).auftraege || []).find((x) => x.id === schreibAuftragId);
  const feld = $('#schreibfeld'); if (!a || !feld) return;
  const erg = schreibAnalyse(feld.value, a);
  $('#schreib-analyse').innerHTML = `<h3 style="font-size:1rem;margin:6px 0 8px">Schreib-Check</h3><ul class="analyse">${erg.map((e) => `<li class="${e.gut ? 'gut' : 'tipp'}"><i aria-hidden="true">${e.gut ? '✓' : '!'}</i><span>${esc(e.t)}</span></li>`).join('')}</ul><p class="klein leise" style="margin-top:8px">Der Schreib-Check zählt nur. Ob dein Text spannend und verständlich ist, prüfst du mit der Liste unten – oder lies ihn jemandem vor.</p>`;
}
function schreibFertig() {
  schreibSpeichern();
  const a = ((INHALT.schreiben || {}).auftraege || []).find((x) => x.id === schreibAuftragId);
  const p = P(), st = p.texte[schreibAuftragId];
  const n = woerterIn(st.text || '').length;
  if (n < Math.round(a.minWoerter * 0.6)) { toast(`Dein Text ist noch sehr kurz (${n} Wörter). Schreib noch ein bisschen weiter!`, 3400); return; }
  const neu = !st.fertig;
  st.fertig = true; st.fertigDatum = Date.now();
  if (neu) punkteDazu(40);
  merkeTag(); speichern(true);
  pruefeAbzeichen();
  if (neu) { sternenregen(36); ton('fanfare'); }
  toast(neu ? 'Super! Dein Text ist fertig. +40 Laborpunkte' : 'Gespeichert.');
}
async function textKopieren(text) {
  try { await navigator.clipboard.writeText(text); toast('Kopiert!'); }
  catch (e) { toast('Kopieren klappt hier nicht. Markiere den Text und kopiere ihn selbst.'); }
}

/* ---------- Datei speichern (Sicherung) ---------- */
let downloadsNS;
async function downloadsVerfuegbar() {
  if (window.claude && typeof window.claude.use === 'function') {
    try { if (downloadsNS === undefined) downloadsNS = await window.claude.use('downloads'); } catch (e) { downloadsNS = null; }
    return !!downloadsNS;
  }
  return true; // eigenständige Datei: normaler Download
}
async function sicherungAlsDatei() {
  const code = sicherungsCode(), name = `lese-labor-profi-sicherung-${heute()}.txt`;
  const codeZeigen = () => { const f = $('#export-feld'), t = $('#export-code'); if (f && t) { t.value = code; f.hidden = false; } };
  try {
    if (window.claude && typeof window.claude.use === 'function') {
      if (!downloadsNS) { codeZeigen(); toast('Speichern als Datei ist hier nicht möglich. Kopiere den Code.'); return; }
      const r = await downloadsNS.save({ filename: name, data: code });
      if (r && r.status === 'saved') { merkeSicherung(); toast('Sicherung gespeichert.'); }
      else { codeZeigen(); toast('Die Datei wurde nicht gespeichert. Du kannst den Code kopieren.'); }
      return;
    }
    const url = URL.createObjectURL(new Blob([code], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    merkeSicherung(); codeZeigen();
    toast('Falls kein Download startet: Kopiere den Code unten.', 3600);
  } catch (e) {
    codeZeigen();
    toast(e && e.code === 'declined' ? 'Speichern abgebrochen.' : 'Die Datei wurde nicht gespeichert. Du kannst den Code kopieren.');
  }
}
