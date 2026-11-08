/* ===== Ereignisse, Einstellungen und Start ===== */
let themaGesetzt = false;
function wendeEinstellungenAn() {
  const e = E(), root = document.documentElement;
  root.style.setProperty('--gross', { normal: 1, gross: 1.12, sehrgross: 1.25 }[e.schrift] || 1);
  root.style.setProperty('--zeilen', e.weit ? 1.95 : 1.55);
  const stufe = fxStufe();
  root.classList.toggle('fx-voll', stufe === 'voll');
  root.classList.toggle('fx-sanft', stufe === 'sanft');
  root.classList.toggle('fx-aus', stufe === 'aus');
}
function gruppeSortiert(ids) {
  const reihenfolge = Object.keys(REG.gruppen);
  return ids.slice().sort((a, b) => {
    const ga = reihenfolge.indexOf(REG.items[a].gruppe), gb = reihenfolge.indexOf(REG.items[b].gruppe);
    if (ga !== gb) return ga - gb;
    return REG.gruppen[REG.items[a].gruppe].items.indexOf(a) - REG.gruppen[REG.items[b].gruppe].items.indexOf(b);
  });
}
function starteTraining(ids, titel, art = 'training', zurueck) {
  starteSitzung({ art, titel, ids, zurueck: zurueck || { name: ANSICHT.name === 'sitzung' ? 'start' : ANSICHT.name, param: ANSICHT.param } });
}

document.addEventListener('click', async (ev) => {
  const ziel = ev.target;
  if (!(ziel instanceof Element)) return;
  if (ziel.closest('[data-dlg]')) return;

  /* Quelle: Textmarker und Links im simulierten Browser */
  const quelle = ziel.closest('.quelle-flaeche');
  if (quelle && SITZ) {
    if (SITZ.markerAn) {
      const tm = ziel.closest('[data-tm]');
      if (tm) { ev.preventDefault(); markerUmschalten(tm); return; }
      if (ziel.closest('a, button[data-ziel]')) { ev.preventDefault(); toast('Der Textmarker ist an. Schalte ihn aus, um Links zu öffnen.'); return; }
    }
    const link = ziel.closest('[data-ziel]');
    if (link) { ev.preventDefault(); const g = gruppeVon(aktId()); if (g && g.art === 'fall') fallNavigiere(g.id, link.getAttribute('data-ziel')); return; }
    if (ziel.closest('[data-extern]')) { ev.preventDefault(); toast('Dieser Link führt in der Übung nirgendwohin.'); return; }
    if (ziel.closest('a')) { ev.preventDefault(); return; }
  }

  const nav = ziel.closest('[data-nav]');
  if (nav && !nav.disabled) {
    const n = nav.getAttribute('data-nav');
    if (n === 'profile') neuProfilAvatar = AVATARE[Math.floor(Math.random() * AVATARE.length)];
    zeige(n); return;
  }
  const el = ziel.closest('[data-act]');
  if (!el || el.disabled) return;
  const act = el.getAttribute('data-act'), ds = el.dataset;

  switch (act) {
    /* Antworten */
    case 'opt': case 'mx': case 'tok': case 'chip': case 'gruppe': case 'pool': case 'hoch': case 'runter':
      antwortAktion(act, ds); return;
    /* Sitzung */
    case 's-beenden': sitzungBeenden(); return;
    case 's-gehe': gehe(Number(ds.i)); fokus(`.navi-punkt[data-i="${Number(ds.i)}"]`); return;
    case 's-zurueck': gehe(SITZ.index - 1); fokus('.frage-text'); return;
    case 's-weiter': weiter(); if (SITZ) fokus('.frage-text'); return;
    case 's-abgeben': abgebenFragen(); return;
    case 's-markieren': { const id = aktId(); SITZ.markiert[id] = !SITZ.markiert[id]; zeichneKopf(); zeichneAufgabe(); sitzungMerken(); fokus('[data-act="s-markieren"]'); return; }
    case 's-tipp': tippZeigen(); return;
    case 's-pruefen': pruefen(); return;
    case 's-loesung': loesungZeigen(); return;
    case 's-nochmal': { SITZ.phase[aktId()] = 'edit'; zeichneAufgabe(); const f = $('input.eingabe'); if (f) f.focus(); else fokus('.frage-text'); return; }
    case 's-springen': {
      const z = el.dataset.ziel === 'quelle' ? $('.quelle-spalte') : $('#aufgabe-spalte');
      if (z) z.scrollIntoView({ block: 'start', behavior: sanft() });
      setTimeout(springenAktualisieren, 400); return;
    }
    case 's-uhr': SITZ.zeitVerborgen = !SITZ.zeitVerborgen; zeichneKopf(); fokus('#uhr'); return;
    case 'q-marker': SITZ.markerAn = !SITZ.markerAn; el.setAttribute('aria-pressed', String(SITZ.markerAn)); $('#quelle').classList.toggle('marker-an', SITZ.markerAn); if (SITZ.markerAn) toast('Textmarker an: Tippe auf Sätze, um sie gelb zu markieren.'); return;
    case 'q-loeschen': markerLoeschen(); return;
    case 'q-abschnitt': if (SITZ) { SITZ.abschnittZeig = Number(ds.n) || 1; zeichneQuellinhalt(true); const q = $('#quelle'); if (q && q.scrollIntoView && window.innerWidth <= 900) q.scrollIntoView({ block: 'start', behavior: sanft() }); fokus(`.reiter[data-n="${Number(ds.n) || 1}"]`); } return;
    case 'q-gross': SITZ.quelleGross = !SITZ.quelleGross; renderSitzung(); return;
    case 'b-zurueck': case 'b-vor': case 'b-start': { const g = gruppeVon(aktId()); if (g && g.art === 'fall') fallNavigiere(g.id, act.slice(2)); return; }

    /* Profile */
    case 'profil-wahl': DB.aktivesProfil = ds.id; speichern(true); zeige('start'); return;
    case 'ava': neuProfilAvatar = ds.ava; $$('.ava-wahl button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ava === neuProfilAvatar))); return;
    case 'profil-loeschen': {
      const p = DB.profile[ds.id]; if (!p) return;
      const ok = await dialog({ titel: `Profil „${p.name}“ löschen?`, text: 'Der ganze Fortschritt dieses Profils wird von diesem Gerät gelöscht. Das kann man nicht rückgängig machen.', knoepfe: [{ label: 'Abbrechen', wert: false, stil: 'knopf-zweit' }, { label: 'Löschen', wert: true, stil: 'knopf-gefahr' }] });
      if (ok) { profilLoeschen(ds.id); zeige(P() ? 'erwachsene' : 'profile'); }
      return;
    }

    /* Start & Labore */
    case 'laufend-weiter': sitzungFortsetzen(); return;
    case 'laufend-verwerfen': {
      const ok = await dialog({ titel: 'Angefangene Prüfung verwerfen?', text: 'Die Antworten dieser Prüfung werden gelöscht.', knoepfe: [{ label: 'Behalten', wert: false, stil: 'knopf-zweit' }, { label: 'Verwerfen', wert: true, stil: 'knopf-gefahr' }] });
      if (ok) { sitzungVerwerfen(); render(); }
      return;
    }
    case 'mission': { const m = tagesMission(); if (!m) return; const offen = m.ids.filter((id) => !m.erledigt.includes(id)); starteSitzung({ art: 'mission', titel: 'Tagesmission', ids: offen.length ? offen : m.ids, zurueck: { name: 'start' } }); return; }
    case 'fehler-kiste': starteTraining(gruppeSortiert(fehlerKiste().slice(0, 12)), 'Fehler-Kiste', 'fehler', { name: 'start' }); return;
    case 'training-gruppe': { const g = REG.gruppen[ds.g]; starteTraining(g.items.slice(), g.art === 'fall' ? `Fall ${g.daten.nummer}: ${g.titel}` : g.titel, 'training', { name: g.modul }); return; }
    case 'training-modul': {
      const alle = REG.module[ds.m].items, offen = alle.filter((id) => itemStatus(id) !== 'r');
      const ids = gruppeSortiert(mische(offen.length >= 6 ? offen : alle).slice(0, 10));
      starteTraining(ids, `${MODUL[ds.m].titel}: gemischt`, 'training', { name: ds.m }); return;
    }
    case 'training-ids': starteTraining(gruppeSortiert(String(ds.ids).split(',').filter((id) => REG.items[id])), ds.titel || 'Training', 'training', { name: 'start' }); return;
    case 'pruef-intro': { const cfg = pruefConfig(ds.art); if (cfg && ANSICHT.name === 'byles') cfg.herkunft = 'byles'; if (cfg && cfg.ids.length) zeige('pruefung-start', cfg); else toast('Für diese Prüfung fehlen noch Aufgaben.'); return; }
    case 'pruef-los': {
      const cfg = ANSICHT.param; if (!cfg) return;
      const lauf = P() && P().laufend;
      if (lauf && (lauf.ids || []).some((id) => REG.items[id])) {
        const w = await dialog({ titel: 'Angefangene Prüfung', text: `Du hast „${lauf.titel}“ noch nicht abgegeben. Wenn du eine neue Prüfung startest, wird die alte gelöscht.`, knoepfe: [{ label: 'Abbrechen', wert: null, stil: 'knopf-geist' }, { label: 'Alte weitermachen', wert: 'alt', stil: 'knopf-zweit' }, { label: 'Neu starten', wert: 'neu', stil: 'knopf-signal' }] });
        if (w === 'alt') { sitzungFortsetzen(); return; }
        if (w !== 'neu') return;
        sitzungVerwerfen();
      }
      const box = $('#uhr-zeigen'); if (box) { E().timerZeigen = box.checked; speichern(); }
      starteSitzung({ art: 'pruefung', titel: cfg.titel, ids: cfg.ids, pruefArt: cfg.art, zeitMin: cfg.zeitMin, zurueck: { name: cfg.herkunft || cfg.modul || 'start' } });
      return;
    }
    case 'zurueck-modul': zeige(ds.m && (MODUL[ds.m] || ds.m === 'byles') ? ds.m : 'start'); return;
    case 'pruefung-ansehen': { const e = P().pruefungen[Number(ds.i)]; if (e) zeige('ergebnis', { eintrag: e }); return; }

    /* Tempo */
    case 'tempo-start': tempoStart(); return;
    case 'blitz-start': blitzStart(); return;
    case 'blitz-uebung': blitzUebung(); return;
    case 'blitz-los': blitzLos(); return;
    case 'blitz-wahl': blitzWahl(Number(ds.i)); return;
    case 'blitz-weiter': blitzWeiter(); return;
    case 'blitz-teil2': blitzTeil2(); return;
    case 'blitz-fertig': blitzFertig(); return;
    case 'blitz-abbruch': blitzAbbruch(); return;
    case 'daumen-start': daumenStart(); return;
    case 'daumen-wahl': daumenWahl(Number(ds.w)); return;
    case 'daumen-weiter': daumenWeiter(); return;
    case 'daumen-zurueck': if (DAUMEN && DAUMEN.i > 0) { DAUMEN.i--; render(); daumenFokus(); } return;
    case 'tempo-antwort': tempoAntwort(Number(ds.r)); return;
    case 'tempo-los': tempoLos(); return;
    case 'tempo-abbruch': tempoStopp(); TEMPO = null; zeige('tempo'); return;

    /* Diktat */
    case 'diktat': diktatStart(ds.id); return;
    case 'diktat-modus': DIKTAT.modus = ds.modus; DIKTAT.phase = ds.modus === 'hoer' ? 'hoer' : 'bereit'; zeige('diktat'); if (ds.modus === 'hoer') diktatVorlesen(); return;
    case 'diktat-hoeren': diktatVorlesen(); return;
    case 'diktat-satz': diktatVorlesen(true); return;
    case 'diktat-weiter': diktatWeiter(); return;
    case 'diktat-blitz': diktatBlitz(); return;

    /* Schreiben */
    case 'schreibauftrag': zeige('schreibauftrag', ds.id); return;
    case 'wort-einfuegen': {
      const f = $('#schreibfeld'); if (!f) return;
      const s = f.selectionStart != null ? f.selectionStart : f.value.length, e2 = f.selectionEnd != null ? f.selectionEnd : s;
      const vor = f.value.slice(0, s), nach = f.value.slice(e2);
      const einfueg = (vor && !/\s$/.test(vor) ? ' ' : '') + ds.wort + (nach && !/^[\s.,!?]/.test(nach) ? ' ' : '');
      f.value = vor + einfueg + nach;
      const pos = (vor + einfueg).length; f.focus(); try { f.setSelectionRange(pos, pos); } catch (x) { /* egal */ }
      f.dispatchEvent(new Event('input')); return;
    }
    case 'schreib-check': schreibCheck(); return;
    case 'text-kopieren': { const f = $('#schreibfeld'); if (f) { textKopieren(f.value); } return; }
    case 'schreib-fertig': schreibFertig(); return;

    /* Erwachsene */
    case 'stimme-test': if (!sprich(['Hallo! So klingt die Vorlesestimme im Lese-Labor.'])) toast('Auf diesem Gerät gibt es keine Sprachausgabe.'); return;
    case 'datei-waehlen': { const f = $('#import-datei'); if (f) f.click(); return; }
    case 'export-zeigen': { const f = $('#export-feld'), t = $('#export-code'); t.value = exportCode(); f.hidden = false; t.focus(); t.select(); return; }
    case 'export-kopieren': { const t = $('#export-code'); try { await navigator.clipboard.writeText(t.value); toast('Code kopiert. Bewahren Sie ihn gut auf.'); } catch (x) { t.focus(); t.select(); toast('Bitte den markierten Code selbst kopieren.'); } return; }
    case 'export-datei': sicherungAlsDatei(); return;
    case 'import': {
      let geprueft;
      try { geprueft = pruefeCode($('#import-code').value); }
      catch (x) { toast(x && /Code|Lese-Labor/.test(x.message || '') ? x.message : 'Der Code konnte nicht gelesen werden.', 4200); return; }
      const konflikt = Object.keys(geprueft.neu).filter((id) => DB.profile[id]);
      if (konflikt.length) {
        const info = konflikt.map((id) => `${DB.profile[id].name}: auf diesem Gerät ${DB.profile[id].punkte} Punkte${DB.profile[id].laufend ? ' und eine angefangene Prüfung' : ''}, im Code ${geprueft.neu[id].punkte} Punkte`).join(' · ');
        const w = await dialog({ titel: 'Vorhandenes Profil ersetzen?', text: `${info}. Der Stand auf diesem Gerät wird dabei ersetzt.`, knoepfe: [{ label: 'Abbrechen', wert: false, stil: 'knopf-zweit' }, { label: 'Ersetzen', wert: true }] });
        if (!w) return;
      }
      const n = uebernehmeImport(geprueft); wendeEinstellungenAn();
      toast(speicherOk ? `${plural(n, 'Profil', 'Profile')} wiederhergestellt.` : `${plural(n, 'Profil', 'Profile')} geladen, aber dieser Browser kann gerade nicht speichern (Speicher voll oder privater Modus).`, speicherOk ? 2600 : 6000);
      zeige('erwachsene');
      return;
    }
    case 'alles-loeschen': {
      const ok = await dialog({ titel: 'Wirklich alles löschen?', text: 'Alle Profile, Ergebnisse, Texte und Einstellungen werden von diesem Gerät gelöscht.', knoepfe: [{ label: 'Abbrechen', wert: false, stil: 'knopf-zweit' }, { label: 'Alles löschen', wert: true, stil: 'knopf-gefahr' }] });
      if (ok) {
        try { for (const k of Object.keys(window.localStorage)) if (k.startsWith(SPEICHER_KEY + ':')) window.localStorage.removeItem(k); } catch (x) { /* Speicher nicht verfügbar */ }
        speicherWarnung = '';
        DB = leererSpeicher(); speichern(true); erwachseneOffen = false; wendeEinstellungenAn(); zeige('profile');
      }
      return;
    }
    default: return;
  }
});

document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (!(el instanceof Element)) return;
  if (el.matches('select[data-act="lk"]')) { antwortAktion('lk', { g: el.dataset.g, wert: el.value }); return; }
  if (el.matches('[data-einst]')) {
    const k = el.getAttribute('data-einst');
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (['zeitDigital', 'zeitLesen', 'zeitTest', 'zeitGross', 'tempoDauer', 'blitzSek', 'sprechTempo'].includes(k)) v = Number(v);
    E()[k] = v; speichern(); wendeEinstellungenAn();
    return;
  }
  if (el.id === 'import-datei' && el.files && el.files[0]) {
    const r = new FileReader();
    r.onload = () => { $('#import-code').value = String(r.result || '').trim(); toast('Datei geladen. Tippe auf „Wiederherstellen“.'); };
    r.readAsText(el.files[0]);
  }
});
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (!(el instanceof Element)) return;
  if (el.matches('input[data-act="eingabe"]')) { antwortAktion('eingabe', { wert: el.value }); return; }
  if (el.matches('[data-act="profil-name"]')) {
    const p = DB.profile[el.dataset.id], n = el.value.trim().slice(0, 24);
    if (p && n) { p.name = n; speichern(); }
  }
});
document.addEventListener('submit', (ev) => {
  const f = ev.target;
  ev.preventDefault();
  if (f.id === 'profil-form') { neuesProfil($('#profil-name').value, neuProfilAvatar); zeige('start'); return; }
  if (f.id === 'gate-form') {
    const v = Number($('#gate-antwort').value);
    if (gateAufgabe && v === gateAufgabe.a * gateAufgabe.b) { erwachseneOffen = true; gateAufgabe = null; zeige('erwachsene'); }
    else { toast('Das stimmt leider nicht.'); gateAufgabe = null; zeige('erwachsene'); }
    return;
  }
  if (f.id === 'diktat-form') { diktatPruefen($('#diktat-eingabe').value); }
});
document.addEventListener('keydown', (ev) => {
  if (dialogAufloeser) { if (ev.key === 'Escape') dialogAufloeser('Escape'); else if (ev.repeat) ev.preventDefault(); return; }
  if (ANSICHT.name === 'daumen' && el instanceof Element && el.matches('.daumen-knopf') && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(ev.key)) {
    ev.preventDefault();
    const k = $$('.daumen-knopf'), i = k.indexOf(el), n = ev.key === 'Home' ? 0 : ev.key === 'End' ? k.length - 1 : (i + (['ArrowLeft', 'ArrowUp'].includes(ev.key) ? -1 : 1) + k.length) % k.length;
    daumenWahl(Number(k[n].dataset.w)); k[n].focus();
    return;
  }
  if (ANSICHT.name === 'blitz-lauf' && BLITZ && /^[1-4]$/.test(ev.key)) { ev.preventDefault(); if (!ev.repeat && BLITZ.phase === 'wahl') blitzWahl(Number(ev.key) - 1); return; }
  const el = ev.target;
  if (ev.key === 'Enter' && el instanceof Element && el.matches('input[data-act="eingabe"]')) {
    ev.preventDefault();
    if (!SITZ || ANSICHT.name !== 'sitzung') return;
    const ph = SITZ.phase[aktId()];
    if (istPruefung()) weiter();
    else if (ph === 'edit') pruefen();
    else if (ph === 'nochmal') { SITZ.phase[aktId()] = 'edit'; zeichneAufgabe(); const f = $('input.eingabe'); if (f) f.focus(); }
    else weiter();
    return;
  }
  if ((ev.key === 'Enter' || ev.key === ' ') && el instanceof Element && el.matches('.zu-gruppe, .zu-pool')) { ev.preventDefault(); antwortAktion(el.dataset.act, el.dataset); return; }
  if ((ev.key === 'Enter' || ev.key === ' ') && el instanceof Element && el.matches('a[data-ziel], a[data-extern]')) { ev.preventDefault(); el.click(); return; }
  if (ANSICHT.name === 'tempo-lauf' && TEMPO && TEMPO.phase !== 'start') {
    if (ev.repeat) return;
    if (ev.key === 'ArrowLeft' || ev.key === 'j') tempoAntwort(1);
    if (ev.key === 'ArrowRight' || ev.key === 'n') tempoAntwort(0);
  }
});
document.addEventListener('click', (ev) => {
  const sum = ev.target instanceof Element ? ev.target.closest('details.auftrag[data-gruppe] > summary') : null;
  if (!sum || !SITZ) return;
  const d = sum.parentElement;
  setTimeout(() => { if (SITZ) SITZ.offen[d.getAttribute('data-gruppe')] = d.open; }, 0);
});
window.addEventListener('popstate', async () => {
  if (!verlaufGesetzt) return;
  verlaufGesetzt = false;
  const n = ANSICHT.name;
  const zurueckLegen = () => { try { history.pushState({ lese: n }, '', location.href); verlaufGesetzt = true; } catch (e) { /* egal */ } };
  if (dialogAufloeser) { zurueckLegen(); return; } // Während eines Dialogs (z. B. „Die Zeit ist um!“) zählt die Zurück-Geste nicht
  if (n === 'sitzung' && SITZ) { const ok = await sitzungBeenden(); if (ok === false) zurueckLegen(); return; }
  if (n === 'tempo-lauf') { tempoStopp(); TEMPO = null; zeige('tempo'); return; }
  if (n === 'blitz-lauf') { blitzAbbruch(); return; }
  if (n === 'daumen') {
    if (DAUMEN && !DAUMEN.fertig && DAUMEN.i > 0) { DAUMEN.i--; try { history.pushState({ lese: n }, '', '#byles'); verlaufGesetzt = true; } catch (e) { /* egal */ } render(); daumenFokus(); } else zeige('byles');
    return;
  }
  if (n === 'diktat') { zeige('rechtschreibung'); return; }
});
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (!HASH_ANSICHTEN.has(h) || h === ANSICHT.name) return;
  if (['sitzung', 'tempo-lauf', 'blitz-lauf', 'daumen'].includes(ANSICHT.name)) return;
  zeige(h);
});

let appGestartet = false;
function starteApp() {
  if (appGestartet) return; // der Host darf hot.ready mehrfach aufrufen
  appGestartet = true;
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* egal */ }
  try { document.documentElement.lang = 'de'; } catch (e) { /* egal */ }
  baueRegister();
  try { sternenhimmel(); } catch (e) { /* Hintergrund ist nur Schmuck */ }
  wendeEinstellungenAn();
  try { pruefeLeistung(); } catch (e) { /* nur Schmuck */ }
  if (DB.aktivesProfil && !DB.profile[DB.aktivesProfil]) DB.aktivesProfil = Object.keys(DB.profile)[0] || null;
  const h = location.hash.slice(1);
  zeige(P() ? (HASH_ANSICHTEN.has(h) && h !== 'profile' ? h : 'start') : 'profile');
}
if (window.claude && window.claude.hot && typeof window.claude.hot.ready === 'function') window.claude.hot.ready(starteApp);
else starteApp();
