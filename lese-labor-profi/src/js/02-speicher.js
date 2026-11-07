/* ===== Speicher: Profile, Fortschritt, Punkte, Abzeichen (nur auf diesem Gerät) ===== */
const SPEICHER_KEY = 'lese-labor-profi:v1';
const EINST_STANDARD = {
  zeitDigital: 40, zeitLesen: 30, zeitTest: 20, zeitGross: 45, timerZeigen: true,
  schrift: 'normal', weit: false, ruhig: false, thema: 'auto',
  stimme: '', sprechTempo: 0.85, tempoDauer: 180, blitzSek: 3,
};
const AVATARE = ['🦊', '🦉', '🐢', '🐙', '🦔', '🐝', '🐧', '🦁', '🐼', '🐸', '🦄', '🐳'];
const INTERVALLE = [0, 864e5, 2 * 864e5, 4 * 864e5, 8 * 864e5, 16 * 864e5];
let speicherOk = true;

function leererSpeicher() { return { version: 1, aktivesProfil: null, profile: {}, einstellungen: { ...EINST_STANDARD } }; }
let speicherWarnung = '';
function ladeSpeicher() {
  let roh = null;
  try { roh = window.localStorage.getItem(SPEICHER_KEY); } catch (e) { speicherOk = false; return leererSpeicher(); }
  if (!roh) return leererSpeicher();
  let d;
  try { d = JSON.parse(roh); } catch (e) { d = null; }
  if (!d || typeof d !== 'object' || d.version !== 1 || !d.profile || typeof d.profile !== 'object') {
    // Beschädigte Daten nicht stillschweigend überschreiben: Sicherungskopie anlegen.
    try { window.localStorage.setItem(SPEICHER_KEY + ':defekt-' + Date.now(), roh); } catch (e) { /* kein Platz */ }
    speicherWarnung = 'Der gespeicherte Fortschritt war beschädigt und konnte nicht geladen werden. Eine Kopie wurde aufbewahrt.';
    return leererSpeicher();
  }
  const out = leererSpeicher();
  out.einstellungen = pruefeEinstellungen(d.einstellungen);
  for (const [id, p] of Object.entries(d.profile)) {
    const sauber = bereinigeProfil(p, { mitLaufend: true });
    if (sauber && sauber.id === id) out.profile[id] = sauber;
  }
  out.aktivesProfil = out.profile[d.aktivesProfil] ? d.aktivesProfil : (Object.keys(out.profile)[0] || null);
  out.letzteSicherung = zahl(d.letzteSicherung);
  return out;
}
const zahl = (v, max = 1e13) => { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : 0; };
const ID_OK = /^[a-z0-9-]{1,64}$/;
const istObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const kurztext = (v, max = 20000) => String(v == null ? '' : v).slice(0, max);
/** Profil auf Typen und Wertebereiche prüfen (schützt auch vor manipulierten Sicherungscodes). */
function bereinigeProfil(p, { mitLaufend = false } = {}) {
  if (!istObj(p) || typeof p.id !== 'string' || !/^[a-z0-9]{1,40}$/.test(p.id)) return null;
  const n = { id: p.id, name: kurztext(p.name, 24).trim() || 'Forscherkind', avatar: AVATARE.includes(p.avatar) ? p.avatar : AVATARE[0], erstellt: zahl(p.erstellt), punkte: zahl(p.punkte, 1e7), fehlerBehoben: zahl(p.fehlerBehoben, 1e6) };
  n.items = {};
  if (istObj(p.items)) for (const [id, r] of Object.entries(p.items)) {
    if (!ID_OK.test(id) || !istObj(r)) continue;
    n.items[id] = { v: zahl(r.v, 1e6), ok: zahl(r.ok, 1e6), x: zahl(r.x, 1e6), b: Math.min(5, zahl(r.b)), d: zahl(r.d), z: zahl(r.z), l: ['r', 'h', 't', 'f'].includes(r.l) ? r.l : 'f' };
  }
  const STATUS = ['r', 't', 'f', 'leer'];
  n.pruefungen = (Array.isArray(p.pruefungen) ? p.pruefungen : []).filter(istObj).slice(-40).map((x) => {
    const ids = (Array.isArray(x.ids) ? x.ids : []).filter((id) => typeof id === 'string' && ID_OK.test(id)).slice(0, 60);
    const details = {};
    if (istObj(x.details)) for (const id of ids) details[id] = STATUS.includes(x.details[id]) ? x.details[id] : 'leer';
    return { sid: typeof x.sid === 'string' && /^[a-z0-9]{1,24}$/.test(x.sid) ? x.sid : undefined, art: typeof x.art === 'string' && ID_OK.test(x.art) ? x.art : 'test', titel: kurztext(x.titel, 80), datum: zahl(x.datum), punkte: zahl(x.punkte, 1000), max: zahl(x.max, 1000), dauer: zahl(x.dauer, 1e6), zeitLimit: zahl(x.zeitLimit, 1e6), ids, details, antworten: istObj(x.antworten) ? x.antworten : {}, perms: istObj(x.perms) ? x.perms : {} };
  });
  const alleTempo = (Array.isArray(p.tempo) ? p.tempo : []).filter(istObj).map((t) => ({ datum: zahl(t.datum), richtig: zahl(t.richtig, 1000), falsch: zahl(t.falsch, 1000), dauer: zahl(t.dauer, 1e4) || 180, gelesen: zahl(t.gelesen, 1000) }));
  n.tempoRekord = Math.max(zahl(p.tempoRekord, 1000), 0, ...alleTempo.map((t) => Math.max(0, t.richtig - t.falsch)));
  n.tempo = alleTempo.slice(-60);
  n.grossZaehler = Number.isFinite(Number(p.grossZaehler)) && p.grossZaehler != null ? zahl(p.grossZaehler, 1e6) : n.pruefungen.filter((x) => x.art === 'gross').length;
  n.diktate = {};
  if (istObj(p.diktate)) for (const [id, d] of Object.entries(p.diktate)) if (ID_OK.test(id) && istObj(d)) n.diktate[id] = { best: zahl(d.best, 100), letzte: zahl(d.letzte, 100), datum: zahl(d.datum) };
  n.texte = {};
  if (istObj(p.texte)) for (const [id, t] of Object.entries(p.texte)) if (ID_OK.test(id) && istObj(t)) n.texte[id] = { text: kurztext(t.text, 50000), notizen: (Array.isArray(t.notizen) ? t.notizen : []).map((x) => kurztext(x, 500)).slice(0, 20), check: (Array.isArray(t.check) ? t.check : []).map(Boolean).slice(0, 20), fertig: !!t.fertig, datum: zahl(t.datum), fertigDatum: zahl(t.fertigDatum) };
  n.abzeichen = {};
  if (istObj(p.abzeichen)) for (const a of ABZEICHEN) if (p.abzeichen[a.id]) n.abzeichen[a.id] = zahl(p.abzeichen[a.id]) || 1;
  n.tage = (Array.isArray(p.tage) ? p.tage : []).filter((t) => typeof t === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t)).slice(-400);
  n.fehlerwoerter = (Array.isArray(p.fehlerwoerter) ? p.fehlerwoerter : []).filter((w) => typeof w === 'string').map((w) => w.slice(0, 40)).slice(-50);
  if (istObj(p.mission) && typeof p.mission.datum === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.mission.datum)) {
    const ids = (Array.isArray(p.mission.ids) ? p.mission.ids : []).filter((id) => typeof id === 'string' && ID_OK.test(id)).slice(0, 10);
    n.mission = { datum: p.mission.datum, ids, erledigt: (Array.isArray(p.mission.erledigt) ? p.mission.erledigt : []).filter((id) => ids.includes(id)) };
  }
  if (typeof p.missionGeschafft === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.missionGeschafft)) n.missionGeschafft = p.missionGeschafft;
  if (mitLaufend && istObj(p.laufend) && Array.isArray(p.laufend.ids)) n.laufend = p.laufend;
  return n;
}
const EINST_ERLAUBT = {
  zeitDigital: [30, 40, 50, 60, 0], zeitLesen: [20, 30, 40, 0], zeitTest: [15, 20, 30, 0], zeitGross: [30, 45, 60, 0], timerZeigen: [true, false],
  schrift: ['normal', 'gross', 'sehrgross'], weit: [true, false], ruhig: [true, false], thema: ['auto', 'light', 'dark'],
  sprechTempo: [0.7, 0.85, 1], tempoDauer: [60, 120, 180], blitzSek: [2, 3, 5],
};
function pruefeEinstellungen(e) {
  const out = { ...EINST_STANDARD };
  if (!istObj(e)) return out;
  for (const [k, werte] of Object.entries(EINST_ERLAUBT)) if (werte.includes(e[k])) out[k] = e[k];
  if (typeof e.stimme === 'string') out.stimme = e.stimme.slice(0, 120);
  return out;
}
function normalisiereProfil(p) {
  p.items = p.items || {}; p.pruefungen = p.pruefungen || []; p.tempo = p.tempo || [];
  p.diktate = p.diktate || {}; p.texte = p.texte || {}; p.abzeichen = p.abzeichen || {};
  p.tage = p.tage || []; p.punkte = p.punkte || 0; p.fehlerBehoben = p.fehlerBehoben || 0;
  p.fehlerwoerter = p.fehlerwoerter || [];
  return p;
}
let DB = null; // wird nach den Abzeichen-Definitionen geladen
let speicherTimer = null;
let ungespeichert = false;
function speichern(sofort = false) {
  clearTimeout(speicherTimer);
  ungespeichert = true;
  const los = () => {
    try { window.localStorage.setItem(SPEICHER_KEY, JSON.stringify(DB)); speicherOk = true; ungespeichert = false; }
    catch (e) { speicherOk = false; }
  };
  if (sofort) los(); else speicherTimer = setTimeout(los, 250);
}
/** Offene Eingaben übernehmen und nur dann schreiben, wenn dieser Tab etwas geändert hat. */
function allesSichern() {
  try { schreibSpeichern(); } catch (e) { /* Schreib-Ansicht nicht offen */ }
  if (ungespeichert) speichern(true);
}
window.addEventListener('pagehide', allesSichern);
document.addEventListener('visibilitychange', () => { if (document.hidden) allesSichern(); });
// Ein anderer Tab hat gespeichert: frischen Stand übernehmen, wenn hier nichts aussteht.
window.addEventListener('storage', (ev) => {
  if (ev.key !== SPEICHER_KEY || !ev.newValue) return;
  // Läuft hier eine Prüfung, die ein anderes Fenster gerade bearbeitet, abgegeben oder verworfen hat: hier beenden.
  if (typeof SITZ !== 'undefined' && SITZ && SITZ.art === 'pruefung' && !SITZ.abgegeben) {
    // Neueren Stand übernehmen, die eigene laufende Prüfung aber behalten – außer sie wurde dort schon abgegeben.
    clearTimeout(speicherTimer);
    const neu = ladeSpeicher(), aktiv = DB.aktivesProfil;
    DB = neu; if (DB.profile[aktiv]) DB.aktivesProfil = aktiv;
    const p = P();
    if (p && p.pruefungen.some((x) => x.sid === SITZ.id)) {
      stoppeUhr(); SITZ = null;
      toast('Diese Prüfung wurde in einem anderen Fenster abgegeben.', 4200);
      zeige('start');
      return;
    }
    if (p) { p.laufend = SITZ; speichern(); }
    return;
  }
  if (ungespeichert) return;
  const neu = ladeSpeicher();
  if (!neu || !Object.keys(neu.profile).length) return;
  const aktiv = DB && DB.aktivesProfil;
  DB = neu;
  if (aktiv && DB.profile[aktiv]) DB.aktivesProfil = aktiv;
  if (['start', 'digital', 'lesen', 'tempo', 'rechtschreibung', 'grammatik', 'schreiben', 'fortschritt'].includes(ANSICHT.name)) render();
});

const E = () => DB.einstellungen;
const P = () => DB.profile[DB.aktivesProfil] || null;

function neuesProfil(name, avatar) {
  const id = 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  DB.profile[id] = normalisiereProfil({ id, name: (name || '').trim().slice(0, 24) || 'Forscherkind', avatar: avatar || AVATARE[0], erstellt: Date.now() });
  DB.aktivesProfil = id;
  speichern(true);
  return DB.profile[id];
}
function profilLoeschen(id) {
  delete DB.profile[id];
  if (DB.aktivesProfil === id) DB.aktivesProfil = Object.keys(DB.profile)[0] || null;
  speichern(true);
}

/* ---------- Fortschritt je Aufgabe ----------
   l: letzter Status  r = richtig ohne Hilfe, h = richtig mit Hilfe/zweitem Versuch, t = teilweise, f = falsch */
function itemStand(id, p = P()) { return (p && p.items[id]) || null; }
function itemStatus(id, p = P()) { const s = itemStand(id, p); return s ? s.l : 'neu'; }
function notiereErgebnis(id, status, { sauber = false } = {}) {
  const p = P(); if (!p) return 0;
  const vorher = p.items[id];
  const r = p.items[id] || (p.items[id] = { v: 0, ok: 0, x: 0, b: 0, d: 0 });
  const warFehler = vorher && ['f', 't', 'h'].includes(vorher.l);
  r.v++; r.z = Date.now();
  let punkte = 1;
  if (status === 'richtig') {
    r.ok++;
    if (sauber) { r.l = 'r'; r.b = Math.min(5, (r.b || 0) + 1); punkte = 10; if (warFehler) p.fehlerBehoben++; }
    else { r.l = 'h'; r.b = Math.max(1, r.b || 0); punkte = 5; }
  } else {
    r.x++; r.l = status === 'teilweise' ? 't' : 'f'; r.b = 1; punkte = status === 'teilweise' ? 2 : 1;
  }
  r.d = Date.now() + INTERVALLE[r.b || 0];
  punkteDazu(punkte);
  merkeTag();
  speichern();
  return punkte;
}
function punkteDazu(n) { const p = P(); if (p) p.punkte = Math.max(0, (p.punkte || 0) + n); }
function merkeTag() {
  const p = P(); if (!p) return;
  const t = heute();
  if (!p.tage.includes(t)) { p.tage.push(t); if (p.tage.length > 400) p.tage = p.tage.slice(-400); }
}
function serie(p = P()) {
  if (!p || !p.tage.length) return 0;
  const set = new Set(p.tage); let n = 0; const d = new Date();
  if (!set.has(heute(d))) d.setDate(d.getDate() - 1);
  while (set.has(heute(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function modulStand(modul, p = P()) {
  const ids = (REG.module[modul] || { items: [] }).items;
  let r = 0, h = 0, f = 0, gesehen = 0;
  for (const id of ids) {
    const s = itemStatus(id, p);
    if (s !== 'neu') gesehen++;
    if (s === 'r') r++; else if (s === 'h') h++; else if (s === 'f' || s === 't') f++;
  }
  return { gesamt: ids.length, gemeistert: r, geuebt: h, fehler: f, gesehen };
}
function gesamtStand(p = P()) {
  let g = 0, m = 0;
  for (const mod of MODULE) { const s = modulStand(mod.id, p); g += s.gesamt; m += s.gemeistert; }
  return { gesamt: g, gemeistert: m, prozent: pct(m, g) };
}
function fehlerKiste(p = P()) {
  if (!p) return [];
  return Object.keys(p.items).filter((id) => REG.items[id] && ['f', 't', 'h'].includes(p.items[id].l))
    .sort((a, b) => (p.items[a].z || 0) - (p.items[b].z || 0));
}
function faelligeWiederholungen(p = P()) {
  if (!p) return [];
  const jetzt = Date.now();
  return Object.keys(p.items).filter((id) => REG.items[id] && p.items[id].l === 'r' && (p.items[id].b || 0) < 4 && (p.items[id].d || 0) <= jetzt);
}

/* ---------- Level ---------- */
const LEVEL = [
  [0, 'Labor-Neuling'], [150, 'Lese-Entdecker'], [400, 'Wort-Forscher'], [800, 'Text-Detektiv'],
  [1400, 'Sprach-Experte'], [2200, 'Lese-Labor-PROFI'], [3200, 'Labor-Legende'],
];
function level(punkte) {
  let i = 0; while (i + 1 < LEVEL.length && punkte >= LEVEL[i + 1][0]) i++;
  const [ab, name] = LEVEL[i], naechst = LEVEL[i + 1];
  return { nr: i + 1, name, ab, bis: naechst ? naechst[0] : null, naechsterName: naechst ? naechst[1] : null };
}

/* ---------- Tagesmission ---------- */
function tagesMission() {
  const p = P(); if (!p) return null;
  const t = heute();
  if (p.mission && p.mission.datum === t && p.mission.ids.every((id) => REG.items[id])) return p.mission;
  const rnd = rng(p.id + t);
  const ids = [];
  const nimm = (id) => { if (id && !ids.includes(id) && ids.length < 10) ids.push(id); };
  fehlerKiste(p).slice(0, 3).forEach(nimm);
  faelligeWiederholungen(p).slice(0, 2).forEach(nimm);
  const reihen = mische(MODULE.filter((m) => m.id !== 'tempo'), rnd).map((m) => {
    const alle = REG.module[m.id].items;
    const neu = mische(alle.filter((id) => itemStatus(id, p) === 'neu'), rnd);
    const rest = mische(alle.filter((id) => itemStatus(id, p) !== 'neu'), rnd);
    // Digitale Fälle und Texte: zusammenhängend wählen (eine Gruppe), damit die Quelle passt
    return neu.concat(rest);
  });
  let runde = 0;
  while (ids.length < 10 && reihen.some((r) => r.length) && runde < 50) {
    for (const r of reihen) if (r.length) nimm(r.shift());
    runde++;
  }
  // nach Quelle gruppieren, damit Fälle/Texte nicht ständig wechseln
  const reihenfolge = ids.slice().sort((a, b) => {
    const ga = REG.items[a].modul + REG.items[a].gruppe, gb = REG.items[b].modul + REG.items[b].gruppe;
    return ga < gb ? -1 : ga > gb ? 1 : 0;
  });
  p.mission = { datum: t, ids: reihenfolge, erledigt: [] };
  speichern();
  return p.mission;
}

/* ---------- Abzeichen ---------- */
const ABZEICHEN = [
  { id: 'start', sym: '🧪', name: 'Erster Versuch', text: 'Die erste Aufgabe gelöst', test: (p) => Object.keys(p.items).length >= 1 },
  { id: 'fall', sym: '🔎', name: 'Fall gelöst', text: 'Alle 4 Aufgaben eines Falls gemeistert', test: (p) => REG.module.digital.gruppen.some((g) => REG.gruppen[g].items.every((id) => itemStatus(id, p) === 'r')) },
  { id: 'faelle', sym: '🕵️', name: 'Meisterdetektiv', text: 'Alle 20 Digital-Aufgaben gemeistert', test: (p) => { const s = modulStand('digital', p); return s.gesamt > 0 && s.gemeistert === s.gesamt; } },
  { id: 'werbung', sym: '🛡️', name: 'Netz-Profi', text: 'Alle „Bewerten“-Aufgaben im Digital-Labor gemeistert', test: (p) => { const b = REG.module.digital.items.filter((id) => REG.items[id].it.kompetenz === 'bewerten'); return b.length > 0 && b.every((id) => itemStatus(id, p) === 'r'); } },
  { id: 'bylet15', sym: '🏅', name: 'BYLET-D bestanden', text: 'In der BYLET-D-Prüfung mindestens 15 von 20', test: (p) => p.pruefungen.some((x) => x.art === 'digital' && x.punkte >= 15) },
  { id: 'bylet18', sym: '🏆', name: 'PROFI-Prüfung', text: 'In der BYLET-D-Prüfung mindestens 18 von 20', test: (p) => p.pruefungen.some((x) => x.art === 'digital' && x.punkte >= 18) },
  { id: 'leser', sym: '📚', name: 'Bücherwurm', text: 'Alle Texte im Lese-Labor bearbeitet', test: (p) => { const s = modulStand('lesen', p); return s.gesamt > 0 && s.gesehen === s.gesamt; } },
  { id: 'tempo30', sym: '🚀', name: 'Tempo-Rakete', text: 'Im Lese-Tempo einen Tempo-Wert von mindestens 30', test: (p) => p.tempo.some((x) => x.richtig - x.falsch >= 30) },
  { id: 'rs', sym: '✍️', name: 'Rechtschreib-Ass', text: '80 % im Rechtschreib-Labor gemeistert', test: (p) => { const s = modulStand('rechtschreibung', p); return s.gesamt > 0 && s.gemeistert >= 0.8 * s.gesamt; } },
  { id: 'gr', sym: '🧩', name: 'Grammatik-Genie', text: '80 % im Grammatik-Labor gemeistert', test: (p) => { const s = modulStand('grammatik', p); return s.gesamt > 0 && s.gemeistert >= 0.8 * s.gesamt; } },
  { id: 'diktat', sym: '🎧', name: 'Diktat-Meister', text: 'Ein Diktat mit 10 von 10 Wörtern', test: (p) => Object.values(p.diktate).some((d) => d.best >= 10) },
  { id: 'autor', sym: '🖋️', name: 'Schreib-Talent', text: 'Zwei Schreibaufträge fertig geschrieben', test: (p) => Object.values(p.texte).filter((t) => t.fertig).length >= 2 },
  { id: 'fehler', sym: '🦾', name: 'Fehler-Fresser', text: '10 Fehler aus der Fehler-Kiste verbessert', test: (p) => p.fehlerBehoben >= 10 },
  { id: 'serie5', sym: '🔥', name: 'Dranbleiber', text: 'An 5 Tagen hintereinander geübt', test: (p) => serie(p) >= 5 },
  { id: 'mission', sym: '🎯', name: 'Missionserfüller', text: 'Eine Tagesmission komplett erledigt', test: (p) => !!p.missionGeschafft },
];
DB = ladeSpeicher();
function pruefeAbzeichen() {
  const p = P(); if (!p) return [];
  const neu = [];
  for (const a of ABZEICHEN) {
    try { if (!p.abzeichen[a.id] && a.test(p)) { p.abzeichen[a.id] = Date.now(); neu.push(a); } } catch (e) { /* Inhalte fehlen */ }
  }
  if (neu.length) { speichern(); neu.forEach((a, i) => setTimeout(() => toastDanach(`Neues Abzeichen: ${a.sym} ${a.name}`), 700 + i * 2600)); }
  return neu;
}

/* ---------- Sichern & Wiederherstellen ---------- */
function merkeSicherung() {
  DB.letzteSicherung = Date.now(); speichern();
  const z = document.getElementById('letzte-sicherung'); if (z) z.innerHTML = '<b>Letzte Sicherung:</b> ' + esc(datumLesbar(DB.letzteSicherung));
}
function exportCode() { merkeSicherung(); return sicherungsCode(); }
function sicherungsCode() {
  const daten = { app: 'lese-labor-profi', v: 1, datum: Date.now(), profile: DB.profile, einstellungen: DB.einstellungen };
  const json = JSON.stringify(daten);
  return 'LLP1:' + btoa(unescape(encodeURIComponent(json)));
}
/** Sicherungscode lesen und bereinigen, ohne etwas zu verändern. */
function pruefeCode(code) {
  const roh = String(code || '').trim();
  const kaputt = new Error('Der Code ist unvollständig oder beschädigt. Bitte den ganzen Code einfügen (er beginnt mit „LLP1:“).');
  if (!roh.startsWith('LLP1:') && !roh.startsWith('{')) throw new Error('Das ist kein Sicherungscode von Lese-Labor PROFI. Er beginnt mit „LLP1:“.');
  let d;
  try {
    const json = roh.startsWith('LLP1:') ? decodeURIComponent(escape(atob(roh.slice(5).replace(/\s+/g, '')))) : roh;
    d = JSON.parse(json);
  } catch (e) { throw kaputt; }
  if (!istObj(d) || d.app !== 'lese-labor-profi' || !istObj(d.profile)) throw new Error('Der Code gehört nicht zu Lese-Labor PROFI.');
  const neu = {};
  for (const [id, p] of Object.entries(d.profile)) { const sauber = bereinigeProfil(p); if (sauber && sauber.id === id) neu[id] = sauber; }
  if (!Object.keys(neu).length) throw kaputt;
  return { neu, einst: d.einstellungen ? pruefeEinstellungen(d.einstellungen) : null };
}
/** Geprüfte Profile übernehmen (vorhandene mit gleicher ID werden ersetzt). */
function uebernehmeImport({ neu, einst }) {
  Object.assign(DB.profile, neu);
  if (einst) DB.einstellungen = einst;
  if (!DB.profile[DB.aktivesProfil]) DB.aktivesProfil = Object.keys(DB.profile)[0] || null;
  speichern(true);
  return Object.keys(neu).length;
}
function importCode(code) { return uebernehmeImport(pruefeCode(code)); }
