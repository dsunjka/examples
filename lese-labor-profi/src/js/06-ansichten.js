/* ===== Ansichten: Profile, Start, Labore, Prüfungen, Ergebnisse, Labor-Buch ===== */
let ANSICHT = { name: 'start', param: null };
const HASH_ANSICHTEN = new Set(['start', 'digital', 'lesen', 'tempo', 'rechtschreibung', 'grammatik', 'schreiben', 'fortschritt', 'erwachsene', 'info', 'profile']);
let erwachseneOffen = false;

const VERLAUF_ANSICHTEN = new Set(['sitzung', 'tempo-lauf', 'diktat']);
let verlaufGesetzt = false;
function zeige(name, param = null) {
  const alt = ANSICHT.name;
  if (alt === 'sitzung' && name !== 'sitzung') stoppeUhr();
  if (alt === 'tempo-lauf' && name !== 'tempo-lauf') tempoStopp();
  if (alt === 'schreibauftrag') schreibVerlassen();
  if (alt === 'diktat' && name !== 'diktat') diktatVerlassen();
  if (!['erwachsene', 'info'].includes(name)) erwachseneOffen = false;
  ANSICHT = { name, param };
  if (VERLAUF_ANSICHTEN.has(name) && !verlaufGesetzt) {
    // Eigener Verlaufseintrag: Die Zurück-Geste von Safari beendet dann die Übung statt die App zu verlassen.
    try {
      if (!(history.state && history.state.lese)) history.pushState({ lese: name }, '', location.href);
      verlaufGesetzt = true;
    } catch (e) { /* Rahmen erlaubt es nicht */ }
  }
  if (!VERLAUF_ANSICHTEN.has(name)) verlaufGesetzt = false;
  render();
  if (HASH_ANSICHTEN.has(name)) {
    const h = '#' + name;
    if (location.hash !== h) { try { history.replaceState(history.state, '', h); } catch (e) { /* Rahmen erlaubt es nicht */ } }
  }
}
function render() {
  const app = $('#app');
  if (!P() && !['profile', 'info', 'erwachsene'].includes(ANSICHT.name)) ANSICHT = { name: 'profile', param: null };
  const n = ANSICHT.name;
  if (n === 'sitzung') { if (SITZ) { renderSitzung(); window.scrollTo(0, 0); return; } ANSICHT = { name: 'start', param: null }; }
  if (n === 'tempo-lauf') { renderTempoLauf(); return; }
  const views = {
    profile: viewProfile, start: viewStart, digital: () => viewModul('digital'), lesen: () => viewModul('lesen'),
    rechtschreibung: () => viewModul('rechtschreibung'), grammatik: () => viewModul('grammatik'), schreiben: () => viewModul('schreiben'),
    tempo: viewTempo, 'pruefung-start': viewPruefungStart, ergebnis: viewErgebnis, zusammenfassung: viewZusammenfassung,
    fortschritt: viewFortschritt, erwachsene: viewErwachsene, info: viewInfo, diktat: viewDiktat, schreibauftrag: viewSchreibauftrag,
    'tempo-ergebnis': viewTempoErgebnis,
  };
  const f = views[ANSICHT.name] || viewStart;
  const { titel = '', html = '', schmal = false } = f(ANSICHT.param) || {};
  app.innerHTML = kopfHTML(titel) + `<main class="seite ${schmal ? 'seite-schmal' : ''}" id="inhalt">${html}</main>`;
  window.scrollTo(0, 0);
  nachRender();
  const haupt = $('#inhalt');
  if (haupt && !haupt.contains(document.activeElement)) { haupt.setAttribute('tabindex', '-1'); try { haupt.focus({ preventScroll: true }); } catch (e) { /* egal */ } }
}
function nachRender() {
  if (ANSICHT.name === 'diktat') diktatNachRender();
  if (ANSICHT.name === 'schreibauftrag') schreibNachRender();
  if (ANSICHT.name === 'erwachsene') erwachseneNachRender();
  effekteNachRender();
}
function kopfHTML(titel) {
  const p = P();
  return `<header class="kopf"><div class="kopf-innen">
    <button type="button" class="marke" data-nav="start" aria-label="Zur Startseite">${icon('kolben')}<span class="marke-name"><span class="lang">Lese-Labor</span><span class="stempel">PROFI</span></span></button>
    <div class="kopf-titel">${esc(titel)}</div>
    <div class="kopf-rechts">
      ${p ? `<button type="button" class="punkte-chip" data-nav="fortschritt" aria-label="Laborpunkte – zum Labor-Buch">${icon('kolben')}${p.punkte}</button>
      <button type="button" class="rund-knopf" data-nav="profile" aria-label="Profil wechseln (${esc(p.name)})">${esc(p.avatar)}</button>` : ''}
      <button type="button" class="rund-knopf" data-nav="erwachsene" aria-label="Einstellungen für Erwachsene">${icon('zahnrad')}</button>
    </div></div></header>`;
}

/* ---------- Profile ---------- */
let neuProfilAvatar = AVATARE[0];
function viewProfile() {
  const liste = Object.values(DB.profile);
  return {
    titel: 'Wer forscht heute?', schmal: true,
    html: `<section class="willkommen">
      ${speicherWarnung ? `<div class="banner" role="alert">⚠️ ${esc(speicherWarnung)}</div>` : ''}
      <h1>Lese-Labor <span class="stempel">PROFI</span></h1>
      <p class="leise">Dein Deutsch-Labor für die 4. Klasse: Internetseiten prüfen, Texte knacken, Rechtschreibung und Grammatik trainieren.</p>
      ${liste.length ? `<div class="profil-liste">${liste.map((p) => `<button type="button" class="profil-karte" data-act="profil-wahl" data-id="${esc(p.id)}" aria-pressed="${p.id === DB.aktivesProfil}"><span class="ava" aria-hidden="true">${esc(p.avatar)}</span>${esc(p.name)}<small>${p.punkte} Punkte</small></button>`).join('')}</div>` : ''}
      <form class="karte" id="profil-form" style="width:min(520px,100%);display:grid;gap:14px">
        <h2 style="font-size:1.2rem">${liste.length ? 'Neues Profil anlegen' : 'Los geht’s!'}</h2>
        <div class="feld"><label for="profil-name">Dein Spitzname (freiwillig)</label><input type="text" id="profil-name" maxlength="24" autocomplete="off" placeholder="z. B. Lesefuchs"></div>
        <div class="feld"><span style="font-weight:700;font-size:.95rem">Wähle dein Labor-Tier</span><div class="ava-wahl">${AVATARE.map((a) => `<button type="button" data-act="ava" data-ava="${a}" aria-pressed="${a === neuProfilAvatar}" aria-label="Tier ${a}">${a}</button>`).join('')}</div></div>
        <button type="submit" class="knopf">Labor betreten</button>
        <p class="hinweis-datenschutz">${icon('schloss')}<span>Keine Anmeldung nötig. Dein Name und dein Fortschritt bleiben nur auf diesem Gerät gespeichert.</span></p>
      </form>
      <p class="klein leise">Neues Gerät? <button type="button" class="knopf knopf-geist knopf-klein" data-nav="erwachsene">Fortschritt mit Sicherungscode wiederherstellen</button></p></section>`,
  };
}

/* ---------- Start ---------- */
function kolbenSVG(anteil) {
  const f = clamp(anteil, 0, 1), yTop = 137 - Math.max(0.06, f) * 82;
  return `<svg class="kolben-gross" viewBox="0 0 128 150" role="img" aria-label="Lern-Kolben: ${Math.round(f * 100)} Prozent aller Aufgaben gemeistert">
    <defs><clipPath id="kolben-innen"><path d="M57 11 V53 L19 128 Q15.5 136 25.5 137.5 H102.5 Q112.5 136 109 128 L71 53 V11 Z"/></clipPath></defs>
    <g clip-path="url(#kolben-innen)"><rect class="fluessig" x="0" y="${yTop.toFixed(1)}" width="128" height="${(150 - yTop).toFixed(1)}"/>
      <circle class="blase" cx="50" cy="128" r="3.5"/><circle class="blase" cx="70" cy="131" r="2.5"/><circle class="blase" cx="84" cy="127" r="3"/></g>
    <path class="glas" d="M49 9 H79 M55 9 V52 L16.5 127 Q12 138 25 140.5 H103 Q116 138 111.5 127 L73 52 V9"/>
    <path class="skala" d="M44 84 h9 M36 100 h9 M28 116 h9"/>
    <path class="funkeln" d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" transform="translate(16 46)"/>
    <path class="funkeln" d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" transform="translate(112 70)"/>
    <path class="funkeln" d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" transform="translate(98 22)"/></svg>`;
}
function laufendBanner() {
  const p = P(); if (!p || !p.laufend) return '';
  const l = p.laufend, ids = (Array.isArray(l.ids) ? l.ids : []).filter((id) => REG.items[id]);
  if (!ids.length) return '';
  const beantw = ids.filter((id) => antwortStand(REG.items[id].it, sichereAntwort(REG.items[id].it, (l.antworten || {})[id], sicherePerm(REG.items[id].it, (l.perms || {})[id]))) !== 'leer').length;
  return `<div class="banner" role="status"><span>⏸️ Du hast „${esc(l.titel)}“ angefangen: ${beantw} von ${ids.length} beantwortet${l.zeitLimit ? `, noch ${zeitLesbar(Number(l.zeitLimit) - Number(l.verbraucht || 0))} Minuten` : ''}.</span>
    <span class="zeile" style="margin-left:auto"><button type="button" class="knopf knopf-klein" data-act="laufend-weiter">Weitermachen</button><button type="button" class="knopf knopf-klein knopf-zweit" data-act="laufend-verwerfen">Verwerfen</button></span></div>`;
}
function viewStart() {
  const p = P(), g = gesamtStand(), lv = level(p.punkte), m = tagesMission();
  const missionFertig = m && m.erledigt.length >= m.ids.length;
  const kiste = fehlerKiste().length;
  const bylet = p.pruefungen.filter((x) => x.art === 'digital');
  const besteBylet = bylet.length ? Math.max(...bylet.map((x) => x.punkte)) : null;
  const karten = MODULE.map((mod) => {
    let fuss;
    if (mod.id === 'tempo') {
      const best = tempoBest(p);
      fuss = `<div class="labor-fuss"><span>${best != null ? `Bester Tempo-Wert: ${best}` : 'Noch kein Test'}</span></div>`;
    } else {
      const s = modulStand(mod.id);
      fuss = `<div class="labor-fuss"><div class="balken"><i style="width:${pct(s.gemeistert, s.gesamt)}%"></i></div><span>${s.gemeistert}/${s.gesamt}</span></div>`;
    }
    return `<button type="button" class="labor-karte" data-nav="${mod.id}" style="--farbe:${mod.farbe}" ${modulHatInhalt(mod.id) ? '' : 'disabled'}>
      <span class="labor-symbol">${icon(mod.icon)}</span><h3>${esc(mod.titel)}</h3><p>${esc(mod.kurz)}</p>${fuss}</button>`;
  }).join('');
  return {
    titel: 'Labor-Übersicht',
    html: `${laufendBanner()}${!speicherOk ? `<div class="banner">⚠️ Dieser Browser erlaubt gerade kein Speichern (z. B. privater Modus). Sichere deinen Fortschritt im Erwachsenen-Bereich mit einem Code.</div>` : ''}
    <div class="start-raster">
      <section class="karte held" aria-label="Dein Labor">
        <div class="held-oben">
          <div class="avatar-orb" aria-hidden="true">${esc(p.avatar)}</div>
          <div style="min-width:0"><p class="leise">Hallo,</p><h1>${esc(p.name)}</h1>
            <p class="level">Level ${lv.nr} · ${esc(lv.name)}</p></div>
          ${kolbenSVG(g.prozent / 100)}
        </div>
        <div class="xp">
          <div class="xp-zeile"><span>${plural(p.punkte, 'Laborpunkt', 'Laborpunkte')}</span><span>${lv.bis ? `Noch ${plural(lv.bis - p.punkte, 'Laborpunkt', 'Laborpunkte')} bis „${esc(lv.naechsterName)}“` : 'Höchstes Level erreicht!'}</span></div>
          <div class="xp-balken" role="img" aria-label="Fortschritt zum nächsten Level: ${lv.bis ? pct(p.punkte - lv.ab, lv.bis - lv.ab) : 100} Prozent"><i style="width:${lv.bis ? Math.max(3, pct(p.punkte - lv.ab, lv.bis - lv.ab)) : 100}%"></i></div>
        </div>
        <div class="kennzahlen">
          <div class="kennzahl"><b>${g.gemeistert}</b><span>von ${g.gesamt} gemeistert</span></div>
          <div class="kennzahl"><b>${serie()}</b><span>${serie() === 1 ? 'Tag' : 'Tage'} in Folge</span></div>
          <div class="kennzahl"><b>${Object.keys(p.abzeichen).length}</b><span>Abzeichen</span></div>
        </div>
        ${m && m.ids.length ? `<div class="mission">
          <div class="zeile-zwischen"><h3>🎯 Tagesmission</h3><span class="klein leise">${m.erledigt.length}/${m.ids.length}</span></div>
          <p class="klein">${missionFertig ? 'Geschafft! Morgen wartet eine neue Mission.' : '10 gemischte Aufgaben aus allen Laboren – mit deinen Fehlern von gestern.'}</p>
          <div class="mission-punkte" aria-hidden="true">${m.ids.map((id) => `<i class="${m.erledigt.includes(id) ? 'voll' : ''}"></i>`).join('')}</div>
          ${missionFertig ? '' : `<button type="button" class="knopf" data-act="mission">${m.erledigt.length ? 'Mission fortsetzen' : 'Mission starten'}</button>`}
        </div>` : ''}
      </section>
      <div style="display:grid;gap:14px;min-width:0">
        ${modulHatInhalt('digital') ? `<div class="pruefung-band"><span class="labor-symbol">${icon('uhr')}</span>
          <div><span class="boss-label">BOSS-LEVEL</span><h3>BYLET-D-Prüfung</h3><p class="klein leise">${REG.module.digital.gruppen.length} Fälle · ${REG.module.digital.items.length} Fragen · ${E().zeitDigital ? E().zeitDigital + ' Minuten' : 'ohne Zeitlimit'}${besteBylet != null ? ` · Bestwert ${besteBylet}/${REG.module.digital.items.length}` : ''}</p></div>
          <button type="button" class="knopf knopf-signal" data-act="pruef-intro" data-art="digital">Prüfung</button></div>` : ''}
        <div class="labore">${karten}</div>
        <div class="schnell-liste">
          <button type="button" class="schnell" data-act="fehler-kiste" ${kiste ? '' : 'disabled'}><b>${icon('kiste', '')} Fehler-Kiste ${kiste ? `<span class="zahl-blase">${kiste}</span>` : ''}</b><span>${kiste ? 'Übe die Aufgaben, die noch nicht geklappt haben.' : 'Leer – super!'}</span></button>
          <button type="button" class="schnell" data-act="pruef-intro" data-art="gross"><b>Großer Deutsch-Check</b><span>${grosserCheckAnzahl()} gemischte Aufgaben aus allen Laboren</span></button>
          <button type="button" class="schnell" data-nav="fortschritt"><b>Mein Labor-Buch</b><span>Fortschritt, Prüfungen und Abzeichen</span></button>
        </div>
      </div>
    </div>
    <p class="klein leise" style="text-align:center">Keine Werbung · keine Anmeldung · alles bleibt auf diesem Gerät · <button type="button" class="knopf knopf-geist knopf-klein" data-nav="info">Infos für Eltern und Lehrkräfte</button></p>`,
  };
}

/* ---------- Labor-Seiten ---------- */
const MODUL_INFO = {
  digital: `<p><b>BYLET-D</b> heißt „Leseverständnis im digitalen Kontext“. In der 4. Klasse schaust du dir Internetseiten an – Suchmaschinen, Websites, Chats, Mails und Apps – und beantwortest Fragen dazu.</p>
    <ul><li>Lies zuerst den <b>Auftrag</b> genau. Wonach suchst du?</li><li>Tippe Links, Menüs und Reiter an. Mit dem Zurück-Pfeil kommst du zurück.</li><li>Achte auf <b>Anzeige</b> oder <b>Werbung</b>, auf Datum, Absender und Quelle.</li><li>Bei <b>Mehrfachauswahl</b> prüfst du jede Antwort einzeln: stimmt sie oder nicht?</li><li>Mit dem <b>Textmarker</b> kannst du wichtige Stellen markieren.</li></ul>`,
  lesen: `<p>Hier liest du Sachtexte, Geschichten, Gedichte, Anleitungen und Meinungstexte. Die Fragen sind wie im Lesetest: Manche Antworten stehen direkt im Text, für andere musst du mitdenken.</p>
    <ul><li>Lies die Frage zuerst, dann den Text.</li><li>Die kleinen Zahlen zeigen die Absätze. Fragen beziehen sich manchmal darauf.</li><li>Markiere Schlüsselwörter mit dem Textmarker.</li></ul>`,
  rechtschreibung: `<p>Rechtschreib-Profis kennen Strategien: <b>Mitsprechen</b> (Silben schwingen), <b>Nachdenken</b> (verlängern, ableiten, Artikelprobe) und <b>Merken</b> (Merkwörter). Jedes Thema beginnt mit einem Merkkasten.</p>`,
  grammatik: `<p>Hier untersuchst du Sprache wie im Labor: Wortarten bestimmen, Zeitformen bilden, Satzglieder umstellen und die vier Fälle erfragen.</p>`,
  schreiben: `<p>Gute Texte werden geplant, geschrieben und überarbeitet. Übe die einzelnen Schritte und schreibe dann eigene Texte mit Schreib-Check.</p>`,
};
function gruppeKarte(gid, mod) {
  const g = REG.gruppen[gid], d = g.daten;
  const nr = g.art === 'fall' ? `Fall ${d.nummer} · ${d.quellenart || ''}` : g.art === 'text' ? d.textsorte || 'Text' : (KOMPETENZEN[mod.id] || {})[d.kompetenz] || 'Thema';
  const beschr = g.art === 'thema' ? d.kurz : g.art === 'fall' ? d.einleitung : d.einleitung;
  const kurzText = String(beschr || '').replace(/<[^>]+>/g, '');
  const geschafft = g.items.filter((id) => itemStatus(id) === 'r').length;
  return `<article class="gruppe-karte" style="--farbe:${mod.farbe}">
    <span class="nr">${esc(nr)}</span><h3>${esc(g.titel)}</h3>
    <p>${esc(kurzText.length > 150 ? kurzText.slice(0, 147) + '…' : kurzText)}</p>
    <div class="zeile-zwischen"><div class="punkte-reihe" aria-label="${geschafft} von ${g.items.length} gemeistert">${g.items.map((id) => `<i class="status-punkt s-${itemStatus(id)}"></i>`).join('')}</div><span class="klein leise">${geschafft}/${g.items.length}</span></div>
    <button type="button" class="knopf knopf-klein" data-act="training-gruppe" data-g="${esc(gid)}">${geschafft === g.items.length ? 'Wiederholen' : geschafft || g.items.some((id) => itemStatus(id) !== 'neu') ? 'Weiterüben' : 'Trainieren'}</button>
  </article>`;
}
function pruefKarte(art, titel, n, min, beschr) {
  const p = P(), alt = p.pruefungen.filter((x) => x.art === art);
  const best = alt.length ? Math.max(...alt.map((x) => x.punkte)) : null;
  return `<article class="pruef-karte"><h3>${esc(titel)}</h3><p class="klein">${esc(beschr)}</p>
    <div class="fakten"><span class="fakt">${n} Aufgaben</span><span class="fakt">${icon('uhr')}${min ? min + ' Min.' : 'ohne Zeit'}</span>${best != null ? `<span class="fakt">Bestwert ${best}/${n}</span>` : ''}</div>
    <button type="button" class="knopf knopf-signal knopf-klein" data-act="pruef-intro" data-art="${esc(art)}">Prüfung starten</button></article>`;
}
function viewModul(id) {
  const mod = MODUL[id], s = modulStand(id);
  const gruppen = REG.module[id].gruppen;
  let pruef = '';
  if (id === 'digital') pruef = pruefKarte('digital', 'BYLET-D-Prüfung', REG.module.digital.items.length, E().zeitDigital, 'Alle Fälle hintereinander, ohne Tipps, mit Zeit – wie im echten Test.');
  if (id === 'lesen') { const c = leseChecks(); pruef = c.map((x) => pruefKarte(x.art, x.titel, x.ids.length, E().zeitLesen, x.beschr)).join(''); }
  if (['rechtschreibung', 'grammatik', 'schreiben'].includes(id)) { const t = modulTest(id); pruef = pruefKarte('test-' + id, mod.titel.replace('-Labor', '').replace('Schreib-Werkstatt', 'Schreib') + '-Test', t.length, E().zeitTest, 'Gemischte Aufgaben aus allen Themen, jedes Mal neu zusammengestellt.'); }
  let extra = '';
  if (id === 'rechtschreibung' && ((INHALT.rechtschreibung || {}).diktate || []).length) {
    extra = `<h2 class="abschnitt-titel">Wort-Diktat</h2><div class="gruppen">${INHALT.rechtschreibung.diktate.map((d) => {
      const st = P().diktate[d.id];
      return `<article class="gruppe-karte" style="--farbe:${mod.farbe}"><span class="nr">Diktat</span><h3>${esc(d.titel)}</h3><p>${d.woerter.length} Wörter${st ? ` · Bestwert ${st.best}/${d.woerter.length}` : ''}</p><button type="button" class="knopf knopf-klein" data-act="diktat" data-id="${esc(d.id)}">Diktat starten</button></article>`;
    }).join('')}${P().fehlerwoerter.length ? `<article class="gruppe-karte" style="--farbe:var(--m-kiste)"><span class="nr">Fehlerwörter</span><h3>Meine Fehlerwörter</h3><p>${plural(P().fehlerwoerter.length, 'Wort', 'Wörter')} aus deinen Diktaten. Schreibst du ein Wort richtig, verschwindet es aus der Liste.</p><div class="beispiele">${P().fehlerwoerter.slice(-10).map((w) => `<span>${esc(w)}</span>`).join('')}</div><button type="button" class="knopf knopf-klein" data-act="diktat" data-id="__fehler">Fehlerwörter üben</button></article>` : ''}</div>`;
  }
  if (id === 'schreiben' && ((INHALT.schreiben || {}).auftraege || []).length) {
    extra = `<h2 class="abschnitt-titel">Schreibaufträge mit Schreib-Check</h2><div class="gruppen">${INHALT.schreiben.auftraege.map((a) => {
      const st = P().texte[a.id];
      return `<article class="gruppe-karte" style="--farbe:${mod.farbe}"><span class="nr">${esc(a.textsorte)}</span><h3>${esc(a.titel)} <span aria-hidden="true">${esc(a.impuls || '')}</span></h3><p>${esc(a.auftrag.length > 140 ? a.auftrag.slice(0, 137) + '…' : a.auftrag)}</p><p class="klein leise">${st && st.fertig ? '✓ fertig geschrieben' : st && st.text ? 'angefangen' : 'noch nicht begonnen'}</p><button type="button" class="knopf knopf-klein" data-act="schreibauftrag" data-id="${esc(a.id)}">${st && st.text ? 'Weiterschreiben' : 'Schreiben'}</button></article>`;
    }).join('')}</div>`;
  }
  return {
    titel: mod.titel,
    html: `${laufendBanner()}<div class="modul-kopf" style="--farbe:${mod.farbe}"><span class="labor-symbol">${icon(mod.icon)}</span><div><h1>${esc(mod.titel)}</h1><p>${esc(mod.kurz)}</p></div></div>
      <div class="info-box" style="--farbe:${mod.farbe}">${MODUL_INFO[id] || ''}</div>
      <div class="zeile-zwischen"><h2 class="abschnitt-titel">Training · ${s.gemeistert} von ${s.gesamt} gemeistert</h2>
        <button type="button" class="knopf knopf-zweit knopf-klein" data-act="training-modul" data-m="${id}">Gemischt üben</button></div>
      <div class="gruppen">${gruppen.map((gid) => gruppeKarte(gid, mod)).join('')}</div>
      ${extra}
      ${pruef ? `<h2 class="abschnitt-titel">Prüfen</h2><div class="pruef-karten">${pruef}</div>` : ''}`,
  };
}

/* ---------- Prüfungen definieren ---------- */
function leseChecks() {
  const g = REG.module.lesen.gruppen;
  if (!g.length) return [];
  const halb = Math.ceil(g.length / 2);
  const teile = g.length > 3 ? [g.slice(0, halb), g.slice(halb)] : [g];
  return teile.map((t, i) => ({ art: i === 0 ? 'lesen-a' : 'lesen-b', titel: `Lese-Check ${i === 0 ? 'A' : 'B'}`, ids: t.flatMap((gid) => REG.gruppen[gid].items), beschr: 'Texte: ' + t.map((gid) => REG.gruppen[gid].titel).join(', ') }));
}
function modulTest(modul, proThema = 2) {
  const out = [];
  for (const gid of REG.module[modul].gruppen) out.push(...mische(REG.gruppen[gid].items).slice(0, proThema));
  return out;
}
function grosserCheckAnzahl() {
  const n = (m, k) => Math.min(k, REG.module[m].items.length);
  const erste = (m) => (REG.module[m].gruppen.length ? REG.gruppen[REG.module[m].gruppen[0]].items.length : 0);
  return erste('digital') + erste('lesen') + n('rechtschreibung', 4) + n('grammatik', 4) + n('schreiben', 3);
}
function grosserCheck() {
  const p = P(), anz = p.grossZaehler != null ? p.grossZaehler : p.pruefungen.filter((x) => x.art === 'gross').length;
  const ids = [];
  const fg = REG.module.digital.gruppen; if (fg.length) ids.push(...REG.gruppen[fg[anz % fg.length]].items);
  const tg = REG.module.lesen.gruppen; if (tg.length) ids.push(...REG.gruppen[tg[anz % tg.length]].items);
  const zieh = (m, n) => mische(REG.module[m].items).slice(0, n);
  ids.push(...zieh('rechtschreibung', 4), ...zieh('grammatik', 4), ...zieh('schreiben', 3));
  return ids;
}
function pruefConfig(art) {
  if (art === 'digital') return { art, titel: 'BYLET-D-Prüfung', ids: REG.module.digital.items.slice(), zeitMin: E().zeitDigital, modul: 'digital' };
  if (art === 'lesen-a' || art === 'lesen-b') { const c = leseChecks().find((x) => x.art === art); return c ? { art, titel: c.titel, ids: c.ids, zeitMin: E().zeitLesen, modul: 'lesen' } : null; }
  if (art.startsWith('test-')) { const m = art.slice(5); return { art, titel: MODUL[m].titel.replace('-Labor', '').replace('Schreib-Werkstatt', 'Schreib') + '-Test', ids: modulTest(m), zeitMin: E().zeitTest, modul: m }; }
  if (art === 'gross') return { art, titel: 'Großer Deutsch-Check', ids: grosserCheck(), zeitMin: E().zeitGross, modul: null };
  return null;
}
function viewPruefungStart(cfg) {
  if (!cfg) return viewStart();
  const digital = cfg.ids.some((id) => REG.items[id] && REG.items[id].modul === 'digital');
  return {
    titel: cfg.titel, schmal: true,
    html: `<section class="karte" style="display:grid;gap:16px">
      <div class="modul-kopf" style="--farbe:var(--signal)"><span class="labor-symbol">${icon('uhr')}</span><div><h1>${esc(cfg.titel)}</h1><p>Zeig, was du kannst!</p></div></div>
      <div class="fakten"><span class="fakt">${cfg.ids.length} Aufgaben</span><span class="fakt">${icon('uhr')}${cfg.zeitMin ? cfg.zeitMin + ' Minuten' : 'ohne Zeitlimit'}</span><span class="fakt">keine Tipps</span><span class="fakt">Auswertung am Ende</span></div>
      <div class="info-box"><ul>
        <li>Oben siehst du die Nummern aller Aufgaben. Du kannst hin- und herspringen.</li>
        <li>Bist du unsicher? Tippe auf <b>„Später ansehen“</b>. Die Aufgabe bekommt dann einen orangen Punkt.</li>
        <li>Bei <b>Mehrfachauswahl</b> sind mehrere Antworten richtig. Nur die ganz richtige Auswahl bringt einen Punkt.</li>
        ${digital ? '<li>In den Internetseiten kannst du Links, Menüs und Reiter antippen. Mit dem Zurück-Pfeil kommst du zurück.</li>' : ''}
        <li>Du kannst die Prüfung unterbrechen. Die Zeit läuft nur, solange sie geöffnet ist.</li>
        <li>Erst am Ende siehst du, was richtig war – mit Erklärungen.</li></ul></div>
      <label class="schalter"><input type="checkbox" id="uhr-zeigen" ${E().timerZeigen ? 'checked' : ''}><span>Uhr während der Prüfung anzeigen</span></label>
      <div class="aktionen"><button type="button" class="knopf knopf-zweit" data-act="zurueck-modul" data-m="${esc(cfg.modul || 'start')}">Zurück</button><span class="rechts"><button type="button" class="knopf knopf-signal" data-act="pruef-los">Prüfung starten</button></span></div>
    </section>`,
  };
}

/* ---------- Ergebnis & Zusammenfassung ---------- */
function viewErgebnis(param) {
  const e = param && param.eintrag; if (!e) return viewStart();
  const anteil = e.max ? e.punkte / e.max : 0;
  const ausw = auswertungNach(e.ids, e.details);
  const schwach = ausw.komp.filter((k) => k.n > 0).sort((a, b) => a.ok / a.n - b.ok / b.n)[0];
  const falsch = e.ids.filter((id) => e.details[id] !== 'r' && REG.items[id]);
  return {
    titel: 'Auswertung',
    html: `<section class="karte ergebnis-kopf">${ringSVG(e.punkte, e.max)}
      <div style="display:grid;gap:8px;min-width:0"><p class="leise">${esc(e.titel)} · ${datumLesbar(e.datum)}</p>${sterneHTML(anteil)}<h1 class="titel-urkunde">${esc(urteil(anteil))}</h1>
        <p>${e.punkte} von ${e.max} Aufgaben ganz richtig (${pct(e.punkte, e.max)} %) · Zeit: ${zeitLesbar(e.dauer)}${e.zeitLimit ? ` von ${zeitLesbar(e.zeitLimit)}` : ''}</p>
        <div class="zeile">${falsch.length ? `<button type="button" class="knopf" data-act="training-ids" data-ids="${esc(falsch.join(','))}" data-titel="Fehler aus der Prüfung">Fehler üben</button>` : ''}<button type="button" class="knopf knopf-zweit" data-act="pruef-intro" data-art="${esc(e.art)}">Nochmal</button><button type="button" class="knopf knopf-geist" data-nav="start">Zur Übersicht</button></div></div></section>
      <div class="start-raster" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr))">
        <section class="karte" style="display:grid;gap:12px"><h2 style="font-size:1.15rem">Nach Kompetenzen</h2>${balkenZeilen(ausw.komp)}</section>
        <section class="karte" style="display:grid;gap:12px"><h2 style="font-size:1.15rem">Nach ${e.art === 'digital' ? 'Fällen' : 'Bereichen'}</h2>${balkenZeilen(ausw.gruppen)}</section>
      </div>
      ${schwach && schwach.ok < schwach.n ? `<section class="info-box" style="--farbe:var(--signal)"><b>Dein nächster Schritt</b><p>Am meisten Übung braucht gerade: <b>${esc(schwach.label)}</b> (${schwach.ok} von ${schwach.n} richtig). Übe die Fehler im Training – dort bekommst du Tipps und Erklärungen.</p></section>` : ''}
      <section class="karte" style="display:grid;gap:12px"><h2 style="font-size:1.15rem">Alle Aufgaben mit Lösung</h2>${reviewListe(e.ids, e.antworten, e.perms, e.details)}</section>`,
  };
}
function viewZusammenfassung(param) {
  const s = param && param.sitz; if (!s) return viewStart();
  const werte = s.ids.map((id) => s.ergebnis[id]);
  const r = werte.filter((x) => x === 'r').length, h = werte.filter((x) => x === 'h').length, f = werte.filter((x) => x === 't' || x === 'f').length;
  const details = Object.fromEntries(s.ids.map((id) => [id, s.ergebnis[id] === 'h' ? 'r' : s.ergebnis[id] || 'leer']));
  const nochmal = s.ids.filter((id) => s.ergebnis[id] !== 'r');
  const z = s.zurueck || { name: 'start' };
  return {
    titel: 'Training geschafft',
    html: `<section class="karte ergebnis-kopf">${ringSVG(r, s.ids.length)}
      <div style="display:grid;gap:8px;min-width:0"><p class="leise">${esc(s.titel)}</p>${sterneHTML(s.ids.length ? (r + h) / s.ids.length : 0)}<h1 class="titel-urkunde">${r === s.ids.length ? 'Alles sofort richtig – Profi-Arbeit!' : 'Training geschafft!'}</h1>
        <p>${r} sofort richtig · ${h} mit Hilfe · ${f} noch üben · <b>+${s.punkte} Laborpunkte</b></p>
        <div class="zeile">${nochmal.length ? `<button type="button" class="knopf" data-act="training-ids" data-ids="${esc(nochmal.join(','))}" data-titel="${esc(s.titel)} – Wiederholung">Diese ${nochmal.length} nochmal</button>` : ''}
          <button type="button" class="knopf knopf-zweit" data-nav="${esc(z.name)}">Weiter</button></div></div></section>
      <section class="karte" style="display:grid;gap:12px"><h2 style="font-size:1.15rem">Deine Aufgaben</h2>${reviewListe(s.ids, s.antworten, s.perms, details)}</section>`,
  };
}

/* ---------- Labor-Buch ---------- */
function viewFortschritt() {
  const p = P(), lv = level(p.punkte), g = gesamtStand();
  const modKarten = MODULE.filter((m) => m.id !== 'tempo' && modulHatInhalt(m.id)).map((m) => {
    const s = modulStand(m.id), komp = {};
    for (const id of REG.module[m.id].items) {
      const k = REG.items[id].it.kompetenz || REG.items[id].gruppe;
      const e = komp[k] || (komp[k] = { label: REG.items[id].it.kompetenz ? kompetenzLabel(m.id, k) : REG.gruppen[k].titel, ok: 0, n: 0, farbe: m.farbe });
      e.n++; if (itemStatus(id) === 'r') e.ok++;
    }
    return `<section class="karte" style="display:grid;gap:12px;--farbe:${m.farbe}"><div class="zeile-zwischen"><h2 style="font-size:1.1rem">${esc(m.titel)}</h2><span class="klein leise">${s.gemeistert}/${s.gesamt} gemeistert</span></div>${balkenZeilen(Object.values(komp))}</section>`;
  }).join('');
  const pr = p.pruefungen.slice().reverse();
  const tempo = p.tempo.slice(-12);
  const maxT = Math.max(10, ...tempo.map(tempoWert));
  const tage = []; const d = new Date(); d.setDate(d.getDate() - 27);
  for (let i = 0; i < 28; i++) { tage.push(heute(d)); d.setDate(d.getDate() + 1); }
  return {
    titel: 'Mein Labor-Buch',
    html: `<section class="karte modul-kopf" style="--farbe:var(--akzent)"><span class="labor-symbol" style="font-size:2rem">${esc(p.avatar)}</span>
      <div style="display:grid;gap:6px"><h1>${esc(p.name)}s Labor-Buch</h1><p>Level ${lv.nr}: <b>${esc(lv.name)}</b> · ${plural(p.punkte, 'Laborpunkt', 'Laborpunkte')} · ${g.gemeistert} von ${g.gesamt} Aufgaben gemeistert</p>
      ${lv.bis ? `<div class="balken"><i style="width:${pct(p.punkte - lv.ab, lv.bis - lv.ab)}%"></i></div>` : ''}</div></section>
      <div class="start-raster" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))">${modKarten}</div>
      <section class="karte" style="display:grid;gap:12px"><h2 style="font-size:1.1rem">Prüfungen</h2>
        ${pr.length ? `<div class="tabelle-scroll"><table class="verlauf-tabelle"><thead><tr><th>Datum</th><th>Prüfung</th><th>Punkte</th><th>Zeit</th><th></th></tr></thead><tbody>${pr.map((x, i) => `<tr><td>${datumLesbar(x.datum)}</td><td>${esc(x.titel)}</td><td><b>${x.punkte}/${x.max}</b></td><td>${zeitLesbar(x.dauer)}</td><td><button type="button" class="knopf knopf-geist knopf-klein" data-act="pruefung-ansehen" data-i="${p.pruefungen.length - 1 - i}">Ansehen</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="leise">Noch keine Prüfung. Probiere die BYLET-D-Prüfung aus!</p>'}</section>
      <div class="start-raster" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))">
        <section class="karte" style="display:grid;gap:12px;--farbe:var(--m-tempo)"><h2 style="font-size:1.1rem">Lese-Tempo (Tempo-Wert)</h2>
          ${tempo.length ? `<div class="mini-diagramm" role="img" aria-label="Letzte Ergebnisse im Lese-Tempo">${tempo.map((t) => `<div style="height:${Math.max(6, pct(tempoWert(t), maxT))}%" title="${datumLesbar(t.datum)}"><span>${tempoWert(t)}</span></div>`).join('')}</div>` : '<p class="leise">Noch kein Tempo-Test.</p>'}</section>
        <section class="karte" style="display:grid;gap:12px"><h2 style="font-size:1.1rem">Übungstage (letzte 4 Wochen)</h2>
          <div class="kalender" role="img" aria-label="${p.tage.filter((t) => tage.includes(t)).length} Übungstage in den letzten 4 Wochen">${tage.map((t) => `<i class="${p.tage.includes(t) ? 'an' : ''}" title="${t}"></i>`).join('')}</div>
          <p class="klein leise">${plural(serie(), 'Tag', 'Tage')} in Folge · ${plural(p.tage.length, 'Übungstag', 'Übungstage')} insgesamt</p></section>
      </div>
      <section class="karte" style="display:grid;gap:12px"><h2 style="font-size:1.1rem">Abzeichen · ${Object.keys(p.abzeichen).length} von ${ABZEICHEN.length}</h2>
        <div class="abzeichen-raster">${ABZEICHEN.map((a) => `<div class="abzeichen ${p.abzeichen[a.id] ? 'hat' : ''}"><span class="sym" aria-hidden="true">${a.sym}</span><b>${esc(a.name)}</b><span>${esc(a.text)}</span>${p.abzeichen[a.id] ? `<span>✓ ${datumLesbar(p.abzeichen[a.id])}</span>` : ''}</div>`).join('')}</div></section>`,
  };
}

/* ---------- Erwachsene ---------- */
let gateAufgabe = null;
function viewErwachsene() {
  if (!erwachseneOffen) {
    if (!gateAufgabe) { const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4); gateAufgabe = { a, b }; }
    return {
      titel: 'Für Erwachsene', schmal: true,
      html: `<form class="karte" id="gate-form" style="display:grid;gap:14px;max-width:460px;margin:0 auto;width:100%"><h1 style="font-size:1.4rem">Bereich für Eltern und Lehrkräfte</h1>
        <p class="leise">Hier gibt es Einstellungen, Profile und das Sichern des Fortschritts.</p>
        <div class="feld"><label for="gate-antwort">Was ist ${gateAufgabe.a} × ${gateAufgabe.b}?</label><input type="number" inputmode="numeric" id="gate-antwort" autocomplete="off"></div>
        <div class="aktionen"><button type="button" class="knopf knopf-zweit" data-nav="start">Zurück</button><span class="rechts"><button type="submit" class="knopf">Öffnen</button></span></div></form>`,
    };
  }
  const e = E();
  const sel = (id, werte, akt, fmt) => `<select id="${id}" data-einst="${id}">${werte.map((w) => `<option value="${w}" ${String(w) === String(akt) ? 'selected' : ''}>${fmt(w)}</option>`).join('')}</select>`;
  const min = (w) => (Number(w) ? `${w} Minuten` : 'ohne Zeitlimit');
  const schalter = (id, label, wert) => `<label class="schalter"><input type="checkbox" data-einst="${id}" ${wert ? 'checked' : ''}><span>${label}</span></label>`;
  return {
    titel: 'Für Erwachsene',
    html: `<div class="start-raster" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))">
      <section class="karte" style="display:grid;gap:14px"><h2 style="font-size:1.2rem">Prüfungen</h2>
        <div class="feld"><label for="zeitDigital">BYLET-D-Prüfung</label>${sel('zeitDigital', [30, 40, 50, 60, 0], e.zeitDigital, min)}</div>
        <div class="feld"><label for="zeitLesen">Lese-Check</label>${sel('zeitLesen', [20, 30, 40, 0], e.zeitLesen, min)}</div>
        <div class="feld"><label for="zeitTest">Rechtschreib-, Grammatik-, Schreib-Test</label>${sel('zeitTest', [15, 20, 30, 0], e.zeitTest, min)}</div>
        <div class="feld"><label for="zeitGross">Großer Deutsch-Check</label>${sel('zeitGross', [30, 45, 60, 0], e.zeitGross, min)}</div>
        ${schalter('timerZeigen', 'Uhr während Prüfungen anzeigen', e.timerZeigen)}
        <div class="feld"><label for="tempoDauer">Lese-Tempo-Test</label>${sel('tempoDauer', [60, 120, 180], e.tempoDauer, (w) => `${w / 60} ${w === 60 ? 'Minute' : 'Minuten'}`)}</div>
        <div class="feld"><label for="blitzSek">Blitz-Diktat: Wort sichtbar für</label>${sel('blitzSek', [2, 3, 5], e.blitzSek, (w) => `${w} Sekunden`)}</div>
      </section>
      <section class="karte" style="display:grid;gap:14px"><h2 style="font-size:1.2rem">Darstellung & Vorlesen</h2>
        <div class="feld"><label for="schrift">Schriftgröße</label>${sel('schrift', ['normal', 'gross', 'sehrgross'], e.schrift, (w) => ({ normal: 'Normal', gross: 'Groß', sehrgross: 'Sehr groß' })[w])}</div>
        <div class="feld"><label for="effekte">Effekte und Animationen</label>${sel('effekte', ['voll', 'sanft', 'aus'], e.effekte, (w) => ({ voll: 'Volle Pracht (Glitzer, Sternschnuppen)', sanft: 'Sanft (wenig Bewegung)', aus: 'Aus (ganz ruhig)' })[w])}</div>
        ${schalter('toene', 'Töne bei richtigen Antworten und Level-up', e.toene)}
        ${schalter('weit', 'Weiter Zeilenabstand in Lesetexten (Lesehilfe)', e.weit)}
        <div class="feld"><label for="stimme">Vorlesestimme für das Diktat</label><select id="stimme" data-einst="stimme"><option value="">Automatisch (Deutsch)</option></select></div>
        <div class="feld"><label for="sprechTempo">Vorlesetempo</label>${sel('sprechTempo', [0.7, 0.85, 1], e.sprechTempo, (w) => ({ 0.7: 'Langsam', 0.85: 'Ruhig', 1: 'Normal' })[w])}</div>
        <button type="button" class="knopf knopf-zweit knopf-klein" data-act="stimme-test">${icon('lautsprecher')}Stimme testen</button>
      </section>
      <section class="karte" style="display:grid;gap:14px;grid-column:1/-1"><h2 style="font-size:1.2rem">Übersicht aller Profile auf diesem Gerät</h2>
        ${Object.keys(DB.profile).length ? `<div class="tabelle-scroll"><table class="verlauf-tabelle"><thead><tr><th>Profil</th><th>Gemeistert</th>${MODULE.filter((m) => m.id !== 'tempo' && modulHatInhalt(m.id)).map((m) => `<th>${esc(m.titel.replace('-Labor', '').replace('Schreib-Werkstatt', 'Schreiben'))}</th>`).join('')}<th>BYLET-D (beste)</th><th>Tempo (beste)</th><th>Zuletzt</th></tr></thead><tbody>${Object.values(DB.profile).map((p) => {
          const g = gesamtStand(p), by = p.pruefungen.filter((x) => x.art === 'digital'), tm = p.tempo;
          return `<tr><td>${esc(p.avatar)} ${esc(p.name)}</td><td><b>${g.prozent} %</b></td>${MODULE.filter((m) => m.id !== 'tempo' && modulHatInhalt(m.id)).map((m) => { const s = modulStand(m.id, p); return `<td>${s.gemeistert}/${s.gesamt}</td>`; }).join('')}<td>${by.length ? Math.max(...by.map((x) => x.punkte)) + '/' + by[0].max : '–'}</td><td>${tm.length ? tempoBest(p) : '–'}</td><td>${p.tage.length ? esc(p.tage[p.tage.length - 1].split('-').reverse().join('.')) : '–'}</td></tr>`;
        }).join('')}</tbody></table></div>` : '<p class="leise">Noch keine Profile.</p>'}
      </section>
      <section class="karte" style="display:grid;gap:14px"><h2 style="font-size:1.2rem">Profile</h2>
        ${Object.values(DB.profile).map((p) => `<div class="zeile"><span style="font-size:1.6rem">${esc(p.avatar)}</span><input type="text" class="notiz-feld" style="flex:1;min-width:120px" value="${esc(p.name)}" data-act="profil-name" data-id="${esc(p.id)}" aria-label="Name von ${esc(p.name)}" maxlength="24"><span class="klein leise">${p.punkte} P.</span><button type="button" class="knopf knopf-geist knopf-klein" data-act="profil-loeschen" data-id="${esc(p.id)}">Löschen</button></div>`).join('')}
        <button type="button" class="knopf knopf-zweit knopf-klein" data-nav="profile">Neues Profil</button>
      </section>
      <section class="karte" style="display:grid;gap:14px"><h2 style="font-size:1.2rem">Fortschritt sichern</h2>
        <p class="klein leise">Der Fortschritt liegt nur in diesem Browser. Safari kann gespeicherte Daten von Websites löschen, die einige Tage nicht geöffnet wurden. Eine App auf dem Home-Bildschirm hat außerdem einen eigenen, getrennten Speicher. Sichern Sie den Fortschritt deshalb regelmäßig, z. B. vor den Ferien.</p>
        ${!speicherOk ? '<p class="banner">⚠️ Dieser Browser kann gerade nicht speichern (Speicher voll oder privater Modus).</p>' : ''}
        <p class="klein" id="letzte-sicherung"><b>Letzte Sicherung:</b> ${DB.letzteSicherung ? datumLesbar(DB.letzteSicherung) : 'noch nie'}</p>
        <div class="zeile"><button type="button" class="knopf knopf-klein" data-act="export-zeigen">Sicherungscode erstellen</button><button type="button" class="knopf knopf-zweit knopf-klein" data-act="export-datei" id="export-datei" hidden>Als Datei speichern</button></div>
        <div class="feld" id="export-feld" hidden><label for="export-code">Sicherungscode</label><textarea id="export-code" readonly></textarea><button type="button" class="knopf knopf-zweit knopf-klein" data-act="export-kopieren">Kopieren</button></div>
        <div class="feld"><label for="import-code">Sicherungscode einfügen</label><textarea id="import-code" placeholder="LLP1:…" autocomplete="off" spellcheck="false"></textarea></div>
        <div class="zeile"><button type="button" class="knopf knopf-zweit knopf-klein" data-act="import">Wiederherstellen</button><button type="button" class="knopf knopf-geist knopf-klein" data-act="datei-waehlen">Datei wählen</button><input type="file" id="import-datei" accept=".txt,.json,text/plain,application/json" hidden></div>
        <hr style="border:0;border-top:1px solid var(--linie);width:100%">
        <button type="button" class="knopf knopf-gefahr knopf-klein" data-act="alles-loeschen">Alle Daten auf diesem Gerät löschen</button>
      </section></div>
      <p style="text-align:center"><button type="button" class="knopf knopf-geist" data-nav="info">Infos zu BYLET, Lehrplan und Datenschutz</button></p>`,
  };
}
function erwachseneNachRender() {
  const s = $('#stimme');
  if (s && 'speechSynthesis' in window) {
    const fuell = () => {
      const st = deutscheStimmen();
      s.innerHTML = '<option value="">Automatisch (Deutsch)</option>' + st.map((v) => `<option value="${esc(v.name)}" ${v.name === E().stimme ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('');
    };
    fuell();
    try { speechSynthesis.onvoiceschanged = fuell; } catch (e) { /* egal */ }
  }
  const d = $('#export-datei');
  if (d) downloadsVerfuegbar().then((ok) => { d.hidden = !ok; });
  const g = $('#gate-antwort'); if (g) setTimeout(() => g.focus(), 50);
}

/* ---------- Info ---------- */
function viewInfo() {
  return {
    titel: 'Infos für Eltern und Lehrkräfte', schmal: true,
    html: `<section class="karte" style="display:grid;gap:14px;line-height:1.55">
      <h1 style="font-size:1.6rem">Über Lese-Labor PROFI</h1>
      <p>Lese-Labor PROFI ist ein Übungsprogramm für Deutsch in der 4. Jahrgangsstufe in Bayern. Schwerpunkt ist die anspruchsvolle Vorbereitung auf den Bayerischen Lesetest, besonders auf <b>BYLET-D</b> („Leseverständnis im digitalen Kontext“).</p>
      <h2 style="font-size:1.15rem">Was ist BYLET?</h2>
      <p>Seit dem Schuljahr 2024/2025 können bayerische Grundschulen das digitale Bayerische Lesescreening (BYLES) über die Plattform eddipuls nutzen. Dabei kommt der Bayerische Lesetest (BYLET) zum Einsatz: BYLET-F prüft die Leseflüssigkeit, BYLET-V das Leseverständnis und BYLET-D das Leseverständnis im digitalen Kontext. In der 4. Klasse kommen alle diese Teile vor. Bei BYLET-D sehen die Kinder Bilder von Internetseiten, etwa Suchmaschinen und sozialen Netzwerken, und beantworten Fragen dazu, wie man die Seiten nutzt und was darauf steht.</p>
      <p class="info-box" style="--farbe:var(--signal)">Lese-Labor PROFI ist <b>kein offizielles Angebot</b> und enthält <b>keine Originalaufgaben</b> des Tests. Alle Fälle, Texte und Aufgaben sind eigene Übungsaufgaben im Stil der Testbereiche. Alle Websites, Apps, Personen und Vereine sind erfunden.</p>
      <h2 style="font-size:1.15rem">Die Labore und der LehrplanPLUS</h2>
      <div class="tabelle-scroll"><table class="verlauf-tabelle"><thead><tr><th>Labor</th><th>Bezug LehrplanPLUS Deutsch 3/4</th></tr></thead><tbody>
        <tr><td>Digital-Labor</td><td>Lernbereich 2 „Lesen – mit Texten und weiteren Medien umgehen“: Informationen in digitalen Medien finden, Kindersuchmaschinen nutzen, Medien beurteilen</td></tr>
        <tr><td>Lese-Labor</td><td>Lernbereich 2: Lesestrategien, erzählende, poetische, sachliche (auch Tabellen) und argumentierende Texte</td></tr>
        <tr><td>Lese-Tempo</td><td>Lernbereich 2: flüssig, genau und in angemessenem Tempo lesen</td></tr>
        <tr><td>Rechtschreib-Labor</td><td>Lernbereich 3 „Schreiben“ – richtig schreiben: Rechtschreibstrategien, Zeichensetzung bei wörtlicher Rede</td></tr>
        <tr><td>Grammatik-Labor</td><td>Lernbereich 4 „Sprachgebrauch und Sprache untersuchen und reflektieren“: Wortarten, Zeitformen, Satzglieder, Fälle, Wortbildung</td></tr>
        <tr><td>Schreib-Werkstatt</td><td>Lernbereich 3: Texte planen, schreiben und überarbeiten</td></tr></tbody></table></div>
      <h2 style="font-size:1.15rem">So übt Ihr Kind sinnvoll</h2>
      <ul style="margin:0;padding-left:20px;display:grid;gap:4px"><li>Lieber 10–15 Minuten täglich als einmal lange. Die Tagesmission ist dafür gemacht.</li><li>Erst im <b>Training</b> üben (mit Tipps und Erklärungen), dann die <b>Prüfung</b> machen.</li><li>Die <b>Fehler-Kiste</b> sammelt alles, was noch nicht geklappt hat.</li><li>Sprechen Sie mit Ihrem Kind über die digitalen Fälle: Werbung, Kettenbriefe, Betrugsmails und persönliche Daten.</li><li>Im Diktat und in der Schreib-Werkstatt sind Autokorrektur und Rechtschreibprüfung ausgeschaltet.</li></ul>
      <h2 style="font-size:1.15rem">Datenschutz</h2>
      <p>Keine Registrierung, keine Werbung, keine Tracker, keine Cookies, keine externen Schriften oder Server. Namen und Lernfortschritt werden ausschließlich im Speicher dieses Browsers (localStorage) abgelegt und verlassen das Gerät nicht. Löschen und Sichern können Sie im Bereich „Für Erwachsene“. Die Vorlesefunktion im Diktat nutzt die Sprachausgabe des Geräts.</p>
      <div class="aktionen"><button type="button" class="knopf" data-nav="start">Zurück zum Labor</button></div></section>`,
  };
}

/* ---------- Dialog & Toast ---------- */
let dialogAufloeser = null;
let dialogSchliessen = null;
function dialog({ titel, text = '', html = '', knoepfe = [{ label: 'OK', wert: true }] }) {
  if (dialogSchliessen) dialogSchliessen(undefined);
  return new Promise((resolve) => {
    const wurzel = $('#dialog-wurzel');
    const vorher = document.activeElement;
    wurzel.innerHTML = `<div class="dialog-huelle"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-titel">
      <h2 id="dlg-titel">${esc(titel)}</h2>${text ? `<p>${esc(text)}</p>` : ''}${html}
      <div class="aktionen">${knoepfe.map((k, i) => `<button type="button" class="knopf ${k.stil || ''}" data-dlg="${i}">${esc(k.label)}</button>`).join('')}</div></div></div>`;
    const app = $('#app'); if (app) { app.setAttribute('inert', ''); app.setAttribute('aria-hidden', 'true'); }
    const fertig = (wert) => { if (dialogSchliessen !== fertig) return; dialogSchliessen = null; wurzel.innerHTML = ''; dialogAufloeser = null; if (app) { app.removeAttribute('inert'); app.removeAttribute('aria-hidden'); } try { if (vorher && vorher.focus) vorher.focus(); } catch (e) { /* egal */ } resolve(wert); };
    dialogAufloeser = (taste) => {
      if (taste === 'Escape') { const k = knoepfe.find((x) => x.wert === false || x.wert === null); fertig(k ? k.wert : undefined); }
    };
    dialogSchliessen = fertig;
    $$('[data-dlg]', wurzel).forEach((b) => b.addEventListener('click', () => fertig(knoepfe[Number(b.dataset.dlg)].wert)));
    // Den sicheren Knopf (Abbrechen/Weiterarbeiten) fokussieren, damit ein versehentliches Enter nichts bestätigt.
    const alle = $$('[data-dlg]', wurzel), si = knoepfe.findIndex((k) => k.wert === false || k.wert === null);
    const ziel = si >= 0 ? alle[si] : alle[alle.length - 1];
    if (ziel) setTimeout(() => { try { ziel.focus(); } catch (e) { /* egal */ } }, 30);
  });
}
let toastTimer = null;
let toastEnde = 0;
const sanft = () => (fxStufe() !== 'voll' ? 'auto' : 'smooth');
/** Meldung erst zeigen, wenn die aktuelle fertig ist (für Abzeichen). */
function toastDanach(text) {
  const rest = toastEnde - Date.now();
  if (rest > 0) setTimeout(() => toastDanach(text), rest + 300); else toast(text);
}
function toast(text, ms = 2600) {
  const t = $('#toast'); if (!t) return;
  toastEnde = Date.now() + ms;
  t.textContent = text; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}
