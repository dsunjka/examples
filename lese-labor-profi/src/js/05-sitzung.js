/* ===== Sitzung: Training, Mission, Fehler-Kiste und Prüfungen ===== */
let SITZ = null;
let uhrTimer = null;
let wakeLock = null;
const istPruefung = () => SITZ && SITZ.art === 'pruefung';

function starteSitzung(cfg) {
  const ids = (cfg.ids || []).filter((id) => REG.items[id]);
  if (!ids.length) { toast('Für diesen Bereich gibt es noch keine Aufgaben.'); return; }
  SITZ = {
    id: Date.now().toString(36), art: cfg.art || 'training', titel: cfg.titel || 'Training', pruefArt: cfg.pruefArt || null,
    ids, index: 0, antworten: {}, perms: {}, versuche: {}, tipp: {}, phase: {}, ergebnis: {}, erste: {}, markiert: {},
    zeitLimit: cfg.zeitMin ? cfg.zeitMin * 60 : 0, verbraucht: 0, browser: {}, marker: {}, ui: { chip: null },
    quelleGross: false, markerAn: false, zurueck: cfg.zurueck || { name: 'start' }, offen: {}, punkte: 0, gestartet: Date.now(),
    zeitVerborgen: !E().timerZeigen,
  };
  for (const id of ids) {
    const it = REG.items[id].it;
    SITZ.perms[id] = neuePerm(it);
    SITZ.antworten[id] = leereAntwort(it, SITZ.perms[id]);
    SITZ.phase[id] = 'edit';
  }
  if (istPruefung()) sitzungMerken(true);
  zeige('sitzung');
}
function sitzungFortsetzen() {
  const p = P(); if (!p || !p.laufend) return;
  const ids = (Array.isArray(p.laufend.ids) ? p.laufend.ids : []).filter((id) => REG.items[id]);
  if (!ids.length) { sitzungVerwerfen(); toast('Diese Prüfung passt nicht mehr zu den Aufgaben und wurde verworfen.', 3600); render(); return; }
  SITZ = p.laufend;
  SITZ.ids = ids;
  SITZ.perms = SITZ.perms || {}; SITZ.antworten = SITZ.antworten || {}; SITZ.markiert = SITZ.markiert || {}; SITZ.offen = SITZ.offen || {};
  for (const id of SITZ.ids) {
    const it = REG.items[id].it;
    SITZ.perms[id] = sicherePerm(it, SITZ.perms[id]);
    SITZ.antworten[id] = sichereAntwort(it, SITZ.antworten[id], SITZ.perms[id]);
  }
  SITZ.ui = { chip: null };
  if (SITZ.art === 'pruefung' && SITZ.zeitLimit && SITZ.verbraucht >= SITZ.zeitLimit) { SITZ.verbraucht = SITZ.zeitLimit; auswerten(); return; }
  SITZ.index = clamp(SITZ.index || 0, 0, SITZ.ids.length - 1);
  zeige('sitzung');
}
function sitzungMerken(sofort = false) {
  if (!SITZ || !istPruefung() || SITZ.abgegeben) return;
  const p = P(); if (!p) return;
  p.laufend = SITZ;
  speichern(sofort);
}
function sitzungVerwerfen() { const p = P(); if (p) { delete p.laufend; speichern(true); } }

/* ---------- Darstellung ---------- */
const aktId = () => SITZ.ids[SITZ.index];
const aktIt = () => REG.items[aktId()].it;
function quellArt(id) { const g = gruppeVon(id); return g ? g.art : null; }

function renderSitzung() {
  const app = $('#app');
  const art = quellArt(aktId());
  const mitQuelle = art === 'fall' || art === 'text';
  app.innerHTML = `<div class="sitzung">
    <header class="sitzung-kopf" id="sitzung-kopf"></header>
    <div class="arbeit ${mitQuelle ? '' : 'ohne-quelle'} ${SITZ.quelleGross && mitQuelle ? 'quelle-gross' : ''}" id="arbeit">
      ${mitQuelle ? `<section class="quelle-spalte" aria-label="Quelle"><div class="quellen-leiste" id="quellen-leiste"></div><div class="quelle-flaeche ${SITZ.markerAn ? 'marker-an' : ''}" id="quelle"></div></section>` : ''}
      <section class="aufgabe-spalte" id="aufgabe-spalte" aria-label="Aufgabe"><div class="aufgabe-innen" id="aufgabe"></div></section>
    </div>${mitQuelle ? '<button type="button" class="springen" id="springen" data-act="s-springen">Zur Aufgabe ↓</button>' : ''}</div>`;
  SITZ._gruppe = null;
  zeichneKopf();
  zeichneQuelle();
  zeichneAufgabe();
  starteUhr();
}
function springenAktualisieren() {
  const b = $('#springen'), a = $('#aufgabe-spalte'); if (!b || !a) return;
  const q = $('.quelle-spalte');
  const unten = q ? q.getBoundingClientRect().bottom < window.innerHeight * 0.55 : a.getBoundingClientRect().top < window.innerHeight * 0.45;
  b.textContent = unten ? 'Zur Quelle ↑' : 'Zur Aufgabe ↓';
  b.dataset.ziel = unten ? 'quelle' : 'aufgabe';
}
window.addEventListener('scroll', () => { if (SITZ) springenAktualisieren(); }, { passive: true });
function zeichneKopf() {
  const kopf = $('#sitzung-kopf'); if (!kopf) return;
  const n = SITZ.ids.length, g = gruppeVon(aktId()), mod = MODUL[REG.items[aktId()].modul];
  const unter = `Aufgabe ${SITZ.index + 1} von ${n}${g ? ' · ' + (g.art === 'fall' ? `Fall ${g.daten.nummer}: ` : '') + g.titel : ''}`;
  const punkte = SITZ.ids.map((id, i) => {
    let cls = i === SITZ.index ? 'aktuell' : '';
    if (istPruefung()) { if (antwortStand(REG.items[id].it, SITZ.antworten[id]) !== 'leer') cls += ' beantwortet'; if (SITZ.markiert[id]) cls += ' markiert'; }
    else if (SITZ.ergebnis[id]) cls += ' s-' + SITZ.ergebnis[id];
    return `<button type="button" class="navi-punkt ${cls}" data-act="s-gehe" data-i="${i}" aria-label="Aufgabe ${i + 1}${SITZ.markiert[id] ? ', markiert' : ''}" ${i === SITZ.index ? 'aria-current="step"' : ''}>${i + 1}</button>`;
  }).join('');
  kopf.innerHTML = `
    <button type="button" class="rund-knopf" data-act="s-beenden" aria-label="${istPruefung() ? 'Prüfung unterbrechen' : 'Training beenden'}">${icon('zurueck')}</button>
    <div class="sitzung-titel"><b>${esc(SITZ.titel)}</b><span>${esc(unter)}</span></div>
    ${istPruefung() && SITZ.zeitLimit ? `<button type="button" class="uhr${SITZ.zeitLimit - SITZ.verbraucht <= 300 ? ' knapp' : ''}" id="uhr" data-act="s-uhr" aria-label="Restzeit">${icon('uhr')}<span>${SITZ.zeitVerborgen ? 'Zeit' : zeitLesbar(SITZ.zeitLimit - SITZ.verbraucht)}</span></button>` : ''}
    <div class="navi-punkte" role="navigation" aria-label="Aufgaben">${punkte}</div>
    ${istPruefung() ? `<button type="button" class="knopf knopf-klein knopf-signal" data-act="s-abgeben">Abgeben</button>` : `<span class="punkte-chip" title="In diesem Training gesammelt">${icon('kolben')}+${SITZ.punkte}</span>`}`;
  kopf.style.setProperty('--farbe', mod.farbe);
}
function zeichneQuelle() {
  const id = aktId(), g = gruppeVon(id);
  const leiste = $('#quellen-leiste'); if (!leiste || !g) return;
  if (SITZ._gruppe === g.id) return;
  SITZ._gruppe = g.id;
  const titel = g.art === 'fall' ? `Fall ${g.daten.nummer}: ${g.daten.quellenart || 'Quelle'}` : `${g.daten.textsorte || 'Text'}: ${g.titel}`;
  leiste.innerHTML = `<span class="titel">${esc(titel)}</span>
    <button type="button" class="werkzeug" data-act="q-marker" aria-pressed="${SITZ.markerAn}" title="Textmarker">${icon('marker')}<span>Markieren</span></button>
    <button type="button" class="werkzeug" data-act="q-loeschen" title="Markierungen löschen">Löschen</button>
    <button type="button" class="werkzeug" data-act="q-gross" aria-pressed="${SITZ.quelleGross}" title="Quelle groß anzeigen">${icon('gross')}<span>${SITZ.quelleGross ? 'Aufgabe zeigen' : 'Groß'}</span></button>`;
  zeichneQuellinhalt(true);
}
function zeichneQuellinhalt(nachOben = false) {
  const q = $('#quelle'); if (!q) return;
  const g = gruppeVon(aktId()); if (!g) return;
  q.innerHTML = g.art === 'fall' ? renderGeraet(g.id) : renderLesetext(g.id);
  markerVorbereiten(q);
  if (nachOben) q.scrollTop = 0;
}
function zeichneAufgabe() {
  const box = $('#aufgabe'); if (!box) return;
  const id = aktId(), info = REG.items[id], it = info.it, g = gruppeVon(id), mod = MODUL[info.modul];
  const a = SITZ.antworten[id], phase = SITZ.phase[id] || 'edit';
  const pruef = istPruefung();
  const loesungZeigen = !pruef && (phase === 'fertig' || phase === 'loesung');
  const gesperrt = !pruef && phase !== 'edit';
  let kopf = '';
  if (g && g.art === 'fall') {
    const ersteDesFalls = SITZ.ids.findIndex((x) => REG.items[x].gruppe === g.id) === SITZ.index;
    const offen = SITZ.offen[g.id] != null ? SITZ.offen[g.id] : ersteDesFalls;
    kopf = `<details class="auftrag" data-gruppe="${esc(g.id)}" ${offen ? 'open' : ''}><summary>Dein Auftrag – Fall ${esc(g.daten.nummer)}: ${esc(g.titel)}</summary><p>${rich(g.daten.einleitung)}</p></details>`;
  } else if (g && g.art === 'text' && g.daten.einleitung) {
    kopf = `<details class="auftrag" data-gruppe="${esc(g.id)}" ${SITZ.offen[g.id] ? 'open' : ''}><summary>Worum geht es?</summary><p>${rich(g.daten.einleitung)}</p></details>`;
  } else if (g && g.art === 'thema' && !pruef) {
    const ersteDesThemas = SITZ.ids.findIndex((x) => REG.items[x].gruppe === g.id) === SITZ.index;
    const offen = SITZ.offen[g.id] != null ? SITZ.offen[g.id] : (ersteDesThemas && SITZ.art === 'training');
    kopf = `<details class="auftrag" data-gruppe="${esc(g.id)}" ${offen ? 'open' : ''}><summary>Merkkasten: ${esc(g.titel)}</summary>${renderMerkkasten(g.daten, mod.farbe, { ohneTitel: true })}</details>`;
  }
  const erg = loesungZeigen ? bewerte(it, a) : null;
  let rm = '';
  if (!pruef && phase !== 'edit') {
    const r = phase === 'fertig' ? rueckmeldung(it, { status: 'richtig' }) : rueckmeldung(it, SITZ._letzteErg && SITZ._letzteErg.id === id ? SITZ._letzteErg.erg : bewerte(it, a), { versuch: SITZ.versuche[id] || 1, zeigeLoesung: phase === 'loesung' });
    const pkt = SITZ._letztePunkte && SITZ._letztePunkte.id === id ? SITZ._letztePunkte.n : 0;
    rm = `<div class="rueckmeldung ${phase === 'loesung' ? 'l' : r.cls} ${phase === 'fertig' ? 'feier' : ''}" role="status">
      <b>${phase === 'loesung' ? 'So ist es richtig:' : esc(r.titel)}</b>
      ${phase === 'nochmal' && r.text ? `<p>${esc(r.text)}</p>` : ''}
      ${loesungZeigen ? `<p>${rich(it.erklaerung)}</p>` : ''}
      ${loesungZeigen && pkt ? `<p class="klein leise">+${plural(pkt, 'Laborpunkt', 'Laborpunkte')}</p>` : ''}</div>`;
  }
  const tipp = !pruef && SITZ.tipp[id] && it.tipp ? `<div class="tipp-box" role="note"><b>Tipp:</b><span>${rich(it.tipp)}</span></div>` : '';
  const leer = antwortStand(it, a) === 'leer';
  const letzte = SITZ.index === SITZ.ids.length - 1;
  let aktionen;
  if (pruef) {
    aktionen = `<button type="button" class="knopf knopf-zweit" data-act="s-zurueck" ${SITZ.index === 0 ? 'disabled' : ''}>${icon('zurueck')}Zurück</button>
      <button type="button" class="knopf knopf-geist" data-act="s-markieren" aria-pressed="${!!SITZ.markiert[id]}">${icon('fahne')}${SITZ.markiert[id] ? 'Markiert' : 'Später ansehen'}</button>
      <span class="rechts">${letzte ? `<button type="button" class="knopf knopf-signal" data-act="s-abgeben">Abgeben</button>` : `<button type="button" class="knopf" data-act="s-weiter">Weiter${icon('vor')}</button>`}</span>`;
  } else if (phase === 'edit') {
    aktionen = `${it.tipp && !SITZ.tipp[id] ? `<button type="button" class="knopf knopf-zweit" data-act="s-tipp">💡 Tipp</button>` : ''}
      <span class="rechts"><button type="button" class="knopf" data-act="s-pruefen" id="pruefen-knopf" ${leer ? 'disabled' : ''}>Prüfen</button></span>`;
  } else if (phase === 'nochmal') {
    aktionen = `<button type="button" class="knopf knopf-geist" data-act="s-loesung">Lösung zeigen</button>
      ${it.tipp && !SITZ.tipp[id] ? `<button type="button" class="knopf knopf-zweit" data-act="s-tipp">💡 Tipp</button>` : ''}
      <span class="rechts"><button type="button" class="knopf" data-act="s-nochmal">${icon('neu')}Nochmal versuchen</button></span>`;
  } else {
    aktionen = `<span class="rechts"><button type="button" class="knopf" data-act="s-weiter">${letzte ? 'Fertig' : 'Weiter'}${icon('vor')}</button></span>`;
  }
  const komp = it.kompetenz ? kompetenzLabel(info.modul, it.kompetenz) : (g ? g.titel : '');
  box.innerHTML = `${kopf}
    <article class="frage-karte ${gesperrt ? 'gesperrt' : ''}" style="--farbe:${mod.farbe}" aria-labelledby="frage-${esc(id)}">
      <div class="frage-meta"><span class="etikett etikett-farbe">${esc(mod.titel)}${komp ? ' · ' + esc(komp) : ''}</span><span class="etikett">${esc(TYP_NAME[it.typ] || '')}</span>${stufeHTML(it.stufe || 1)}</div>
      <p class="frage-text" id="frage-${esc(id)}">${rich(it.frage)}</p>
      ${it.vorgabe ? `<p class="frage-vorgabe">${rich(it.vorgabe)}</p>` : ''}
      <p class="hinweis-typ">${esc(TYP_HINWEIS[it.typ] || '')}</p>
      <div class="antwort" id="antwort">${renderAntwortflaeche(it, a, SITZ.perms[id], loesungZeigen ? 'loesung' : 'edit', SITZ.ui, gesperrt)}</div>
      ${tipp}${rm}
      <div class="aktionen">${aktionen}</div>
    </article>`;
  if (erg && phase === 'fertig') { /* bereits gefeiert */ }
}
function zeichneAntwortNeu() {
  const id = aktId(), it = aktIt();
  const el = $('#antwort'); if (!el) return;
  const f = document.activeElement && el.contains(document.activeElement) ? document.activeElement : null;
  let merk = f ? ['act', 'i', 'z', 's', 'g', 'k'].map((k) => (f.dataset[k] != null ? `[data-${k}="${f.dataset[k]}"]` : '')).join('') : '';
  let ausweich = '';
  if (f && (f.dataset.act === 'hoch' || f.dataset.act === 'runter')) {
    const ziel = Number(f.dataset.k) + (f.dataset.act === 'hoch' ? -1 : 1);
    merk = `[data-act="${f.dataset.act}"][data-k="${ziel}"]`;
    ausweich = `[data-act="${f.dataset.act === 'hoch' ? 'runter' : 'hoch'}"][data-k="${ziel}"]`;
  }
  el.innerHTML = renderAntwortflaeche(it, SITZ.antworten[id], SITZ.perms[id], 'edit', SITZ.ui);
  if (merk) {
    let neu = el.querySelector(merk);
    if ((!neu || neu.disabled) && ausweich) neu = el.querySelector(ausweich);
    if (neu) { try { neu.focus({ preventScroll: true }); } catch (e) { neu.focus(); } }
  }
  const k = $('#pruefen-knopf'); if (k) k.disabled = antwortStand(it, SITZ.antworten[id]) === 'leer';
  if (istPruefung()) { zeichneKopf(); sitzungMerken(); }
}

/* ---------- Aktionen ---------- */
function antwortAktion(act, ds) {
  if (!SITZ || SITZ.abgegeben || ANSICHT.name !== 'sitzung') return;
  const id = aktId(), it = aktIt();
  if (!istPruefung() && SITZ.phase[id] !== 'edit') return;
  SITZ.antworten[id] = aendereAntwort(it, SITZ.antworten[id], act, ds, SITZ.ui);
  if (act === 'eingabe') { const k = $('#pruefen-knopf'); if (k) k.disabled = antwortStand(it, SITZ.antworten[id]) === 'leer'; if (istPruefung()) { zeichneKopf(); sitzungMerken(); } return; }
  zeichneAntwortNeu();
}
function gehe(i) {
  if (!SITZ) return;
  i = clamp(i, 0, SITZ.ids.length - 1);
  if (i === SITZ.index) return;
  SITZ.ui.chip = null;
  const alteGruppe = REG.items[aktId()].gruppe;
  const alteArt = quellArt(aktId());
  SITZ.index = i;
  const neueArt = quellArt(aktId());
  const mitQ = (a) => a === 'fall' || a === 'text';
  if (mitQ(alteArt) !== mitQ(neueArt)) { renderSitzung(); }
  else {
    zeichneKopf();
    if (REG.items[aktId()].gruppe !== alteGruppe) zeichneQuelle();
    zeichneAufgabe();
    const sp = $('#aufgabe-spalte'); if (sp) sp.scrollTop = 0;
    if (window.innerWidth <= 900) { const a = $('#aufgabe-spalte'); if (a && mitQ(neueArt)) a.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0); }
  }
  sitzungMerken();
}
function pruefen() {
  const id = aktId(), it = aktIt(), a = SITZ.antworten[id];
  if (antwortStand(it, a) === 'leer') return;
  const erg = bewerte(it, a);
  const v = (SITZ.versuche[id] = (SITZ.versuche[id] || 0) + 1);
  if (v === 1) SITZ.erste[id] = erg.status;
  SITZ._letzteErg = { id, erg };
  if (erg.status === 'richtig') {
    const sauber = v === 1 && !SITZ.tipp[id];
    SITZ.phase[id] = 'fertig';
    abschliessen(id, 'richtig', sauber);
  } else if (v < 2) {
    SITZ.phase[id] = 'nochmal';
  } else {
    SITZ.phase[id] = 'loesung';
    abschliessen(id, erg.status === 'leer' ? 'falsch' : erg.status, false);
  }
  zeichneAufgabe(); zeichneKopf();
  const rm = $('.rueckmeldung'); if (rm && rm.scrollIntoView) rm.scrollIntoView({ block: 'nearest', behavior: sanft() });
}
function abschliessen(id, status, sauber) {
  if (SITZ.ergebnis[id]) return;
  SITZ.ergebnis[id] = status === 'richtig' ? (sauber ? 'r' : 'h') : status === 'teilweise' ? 't' : 'f';
  const n = notiereErgebnis(id, status, { sauber });
  SITZ.punkte += n;
  SITZ._letztePunkte = { id, n };
  if (SITZ.art === 'mission') { const p = P(); if (p && p.mission && !p.mission.erledigt.includes(id)) p.mission.erledigt.push(id); missionPruefen(); }
  pruefeAbzeichen();
}
/** Bonus für die vollständig erledigte Tagesmission (egal, wie die Sitzung beendet wird). */
function missionPruefen() {
  const p = P();
  if (!p || !p.mission || p.mission.erledigt.length < p.mission.ids.length || p.missionGeschafft === p.mission.datum) return;
  p.missionGeschafft = p.mission.datum;
  punkteDazu(30);
  if (SITZ && SITZ.art === 'mission') SITZ.punkte += 30;
  speichern();
  toast('Tagesmission geschafft! +30 Laborpunkte');
}
function loesungZeigen() {
  const id = aktId(), it = aktIt();
  SITZ.phase[id] = 'loesung';
  const erste = SITZ.erste[id] || bewerte(it, SITZ.antworten[id]).status;
  abschliessen(id, erste === 'richtig' ? 'falsch' : erste === 'leer' ? 'falsch' : erste, false);
  zeichneAufgabe(); zeichneKopf();
}
function tippZeigen() {
  const id = aktId(), it = aktIt();
  SITZ.tipp[id] = true;
  const g = gruppeVon(id);
  const mitSeite = !!(it.tippSeite && g && g.art === 'fall');
  if (mitSeite) {
    fallNavigiere(g.id, it.tippSeite);
    const q = $('#quelle .geraet'); if (q) { q.classList.remove('ziel-blitz'); void q.offsetWidth; q.classList.add('ziel-blitz'); }
  }
  zeichneAufgabe();
  // Im Hochformat liegt die Quelle oberhalb: dorthin scrollen, damit der Seitenwechsel zu sehen ist.
  const qs = $('.quelle-spalte');
  if (mitSeite && qs && window.innerWidth <= 900 && qs.getBoundingClientRect().top < 0) {
    qs.scrollIntoView({ block: 'start', behavior: sanft() });
    setTimeout(springenAktualisieren, 400);
  }
}
function weiter() {
  if (SITZ.index < SITZ.ids.length - 1) { gehe(SITZ.index + 1); return; }
  if (istPruefung()) { abgebenFragen(); return; }
  trainingFertig();
}

/* ---------- Uhr ---------- */
function starteUhr() {
  if (!istPruefung()) { stoppeUhr(); return; }
  bildschirmWach(true);
  if (uhrTimer) return;
  uhrTimer = setInterval(() => {
    if (!SITZ || !istPruefung() || SITZ.abgegeben) { stoppeUhr(); return; }
    if (document.visibilityState !== 'visible' || $('.dialog-huelle')) return;
    SITZ.verbraucht++;
    const u = $('#uhr span');
    if (SITZ.zeitLimit) {
      const rest = SITZ.zeitLimit - SITZ.verbraucht;
      if (u && !SITZ.zeitVerborgen) u.textContent = zeitLesbar(rest);
      const uhr = $('#uhr'); if (uhr) uhr.classList.toggle('knapp', rest <= 300);
      if (rest === 300) toast('Noch 5 Minuten!');
      if (rest <= 0) { zeitAbgelaufen(); return; }
    }
    if (SITZ.verbraucht % 5 === 0) sitzungMerken();
  }, 1000);
}
function stoppeUhr() { if (uhrTimer) clearInterval(uhrTimer); uhrTimer = null; bildschirmWach(false); }
let wachGewuenscht = false;
async function bildschirmWach(an) {
  wachGewuenscht = an;
  try {
    if (an && 'wakeLock' in navigator && !wakeLock && document.visibilityState === 'visible') {
      const lock = await navigator.wakeLock.request('screen');
      if (!wachGewuenscht) { lock.release(); return; }
      wakeLock = lock;
      lock.addEventListener('release', () => { if (wakeLock === lock) wakeLock = null; });
    }
    if (!an && wakeLock) { const lock = wakeLock; wakeLock = null; await lock.release(); }
  } catch (e) { wakeLock = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && wachGewuenscht && !wakeLock) bildschirmWach(true); });
async function zeitAbgelaufen() {
  stoppeUhr();
  SITZ.verbraucht = SITZ.zeitLimit; // Ablauf festhalten, falls neu geladen wird, bevor der Dialog bestätigt ist
  sitzungMerken(true);
  await dialog({ titel: 'Die Zeit ist um!', text: 'Deine Prüfung wird jetzt ausgewertet. Alle Antworten, die du gegeben hast, zählen.', knoepfe: [{ label: 'Zur Auswertung', wert: true }] });
  auswerten();
}
async function abgebenFragen() {
  let leer = 0, teil = 0, mark = 0;
  for (const id of SITZ.ids) {
    const s = antwortStand(REG.items[id].it, SITZ.antworten[id]);
    if (s === 'leer') leer++; else if (s === 'teil') teil++;
    if (SITZ.markiert[id]) mark++;
  }
  const teile = [];
  if (leer) teile.push(`${plural(leer, 'Aufgabe ist', 'Aufgaben sind')} noch nicht beantwortet`);
  if (teil) teile.push(`${plural(teil, 'Aufgabe ist', 'Aufgaben sind')} nur teilweise beantwortet`);
  if (mark) teile.push(`${plural(mark, 'Aufgabe hast', 'Aufgaben hast')} du zum späteren Ansehen markiert`);
  const ok = await dialog({
    titel: 'Prüfung abgeben?',
    text: teile.length ? teile.join('. ') + '. Danach kannst du nichts mehr ändern.' : 'Du hast alle Aufgaben beantwortet. Danach kannst du nichts mehr ändern.',
    knoepfe: [{ label: 'Weiterarbeiten', wert: false, stil: 'knopf-zweit' }, { label: 'Jetzt abgeben', wert: true, stil: 'knopf-signal' }],
  });
  if (ok) auswerten();
}

/* ---------- Auswertung ---------- */
function auswerten() {
  if (!SITZ || SITZ.abgegeben) return;
  SITZ.abgegeben = true;
  stoppeUhr();
  const details = {};
  let punkte = 0;
  for (const id of SITZ.ids) {
    const it = REG.items[id].it, erg = bewerte(it, SITZ.antworten[id]);
    const st = erg.status === 'richtig' ? 'r' : erg.status === 'teilweise' ? 't' : erg.status === 'leer' ? 'leer' : 'f';
    details[id] = st;
    if (st === 'r') punkte++;
    if (st !== 'leer') notiereErgebnis(id, erg.status === 'richtig' ? 'richtig' : erg.status === 'teilweise' ? 'teilweise' : 'falsch', { sauber: true });
  }
  const p = P();
  const eintrag = {
    sid: SITZ.id, art: SITZ.pruefArt || 'test', titel: SITZ.titel, datum: Date.now(), punkte, max: SITZ.ids.length,
    dauer: SITZ.zeitLimit ? Math.min(SITZ.verbraucht, SITZ.zeitLimit) : SITZ.verbraucht, zeitLimit: SITZ.zeitLimit, ids: SITZ.ids, details, antworten: SITZ.antworten, perms: SITZ.perms,
  };
  if (p) {
    if (eintrag.art === 'gross') p.grossZaehler = (p.grossZaehler != null ? p.grossZaehler : p.pruefungen.filter((x) => x.art === 'gross').length) + 1;
    p.pruefungen.push(eintrag);
    if (p.pruefungen.length > 40) p.pruefungen = p.pruefungen.slice(-40);
    punkteDazu(punkte * 3);
    delete p.laufend;
    speichern(true);
  }
  pruefeAbzeichen();
  SITZ = null;
  zeige('ergebnis', { index: p ? p.pruefungen.length - 1 : -1, eintrag });
}
function trainingFertig() {
  stoppeUhr();
  const p = P();
  if (SITZ.art === 'mission') missionPruefen();
  pruefeAbzeichen();
  const fertig = SITZ;
  SITZ = null;
  zeige('zusammenfassung', { sitz: fertig });
}
async function sitzungBeenden() {
  if (istPruefung() && SITZ.zeitLimit && SITZ.verbraucht >= SITZ.zeitLimit) { auswerten(); return true; }
  if (istPruefung()) {
    const w = await dialog({ titel: 'Prüfung unterbrechen?', text: 'Deine Antworten und die Zeit werden gespeichert. Du kannst später auf der Startseite weitermachen.', knoepfe: [{ label: 'Weiterarbeiten', wert: false, stil: 'knopf-zweit' }, { label: 'Unterbrechen', wert: true }] });
    if (!w) return false;
    sitzungMerken(true);
  } else {
    const offen = SITZ.ids.filter((id) => !SITZ.ergebnis[id]).length;
    if (offen && Object.keys(SITZ.ergebnis).length === 0 && SITZ.ids.length > 1) {
      // nichts gelöst: ohne Rückfrage zurück
    } else if (offen) {
      const w = await dialog({ titel: 'Training beenden?', text: `Noch ${plural(offen, 'Aufgabe ist', 'Aufgaben sind')} offen. Was du schon gelöst hast, ist gespeichert.`, knoepfe: [{ label: 'Weiterüben', wert: false, stil: 'knopf-zweit' }, { label: 'Beenden', wert: true }] });
      if (!w) return false;
    }
  }
  stoppeUhr();
  const z = SITZ.zurueck || { name: 'start' };
  SITZ = null;
  zeige(z.name, z.param);
  return true;
}

/* ---------- Ergebnisansichten ---------- */
function ringSVG(wert, max, farbe = 'var(--akzent)') {
  const r = 60, u = 2 * Math.PI * r, anteil = max ? wert / max : 0;
  return `<svg class="ring" viewBox="0 0 150 150" role="img" aria-label="${wert} von ${max} Punkten"><circle class="spur" cx="75" cy="75" r="${r}"/><circle class="wert" cx="75" cy="75" r="${r}" style="stroke:${farbe}" stroke-dasharray="${u.toFixed(1)}" stroke-dashoffset="${(u * (1 - anteil)).toFixed(1)}"/><text x="75" y="72" text-anchor="middle" font-size="34">${wert}</text><text x="75" y="98" text-anchor="middle" font-size="15" style="fill:var(--tinte-2)">von ${max}</text></svg>`;
}
function urteil(anteil) {
  if (anteil >= 0.9) return 'Lese-Labor-PROFI! Hervorragend gearbeitet.';
  if (anteil >= 0.75) return 'Sehr stark! Du bist richtig gut vorbereitet.';
  if (anteil >= 0.55) return 'Gute Grundlage! Übe gezielt deine schwächsten Bereiche.';
  if (anteil >= 0.35) return 'Du bist auf dem Weg. Die Fehler-Kiste hilft dir weiter.';
  return 'Jeder Profi fängt klein an. Übe zuerst im Training mit Tipps.';
}
function balkenZeilen(gruppen) {
  return `<div class="balken-liste">${gruppen.map((g) => `<div class="balken-zeile"><span>${esc(g.label)}</span><div class="balken" style="--farbe:${g.farbe || 'var(--akzent)'}"><i style="width:${pct(g.ok, g.n)}%"></i></div><b>${g.ok}/${g.n}</b></div>`).join('')}</div>`;
}
function auswertungNach(ids, details) {
  const nachKomp = {}, nachGruppe = {};
  for (const id of ids) {
    const info = REG.items[id]; if (!info) continue;
    const ok = details[id] === 'r' ? 1 : 0;
    const k = info.modul + ':' + (info.it.kompetenz || '-');
    const kk = nachKomp[k] || (nachKomp[k] = { label: info.it.kompetenz ? kompetenzLabel(info.modul, info.it.kompetenz) : MODUL[info.modul].titel, ok: 0, n: 0, farbe: MODUL[info.modul].farbe, modul: info.modul });
    kk.ok += ok; kk.n++;
    const g = REG.gruppen[info.gruppe];
    const gg = nachGruppe[info.gruppe] || (nachGruppe[info.gruppe] = { label: g.art === 'fall' ? `Fall ${g.daten.nummer}: ${g.titel}` : g.titel, ok: 0, n: 0, farbe: MODUL[info.modul].farbe });
    gg.ok += ok; gg.n++;
  }
  return { komp: Object.values(nachKomp), gruppen: Object.values(nachGruppe) };
}
function reviewListe(ids, antworten, perms, details) {
  return `<div class="review-liste">${ids.map((id, i) => {
    const info = REG.items[id]; if (!info) return '';
    const it = info.it, st = ['r', 't', 'f', 'leer'].includes(details[id]) ? details[id] : 'leer', g = REG.gruppen[info.gruppe];
    const sym = st === 'r' ? '✓' : st === 't' ? '½' : st === 'leer' ? '–' : '✗';
    const perm = sicherePerm(it, perms && perms[id]);
    const a = sichereAntwort(it, antworten ? antworten[id] : undefined, perm);
    return `<details class="review"><summary><span class="status-icon ${st}" aria-label="${st === 'r' ? 'richtig' : st === 't' ? 'teilweise' : st === 'leer' ? 'nicht beantwortet' : 'falsch'}">${sym}</span><span><b>${i + 1}.</b> ${rich(it.frage)}</span><span class="leise klein">${esc(g ? (g.art === 'fall' ? 'Fall ' + g.daten.nummer : g.titel) : '')}</span></summary>
      <div class="inhalt">${it.vorgabe ? `<p class="frage-vorgabe">${rich(it.vorgabe)}</p>` : ''}<div class="gesperrt">${renderAntwortflaeche(it, a, perm, 'loesung', {})}</div><div class="rueckmeldung l"><b>Erklärung</b><p>${rich(it.erklaerung)}</p></div></div></details>`;
  }).join('')}</div>`;
}
