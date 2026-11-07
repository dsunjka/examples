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
function ladeSpeicher() {
  try {
    const roh = window.localStorage.getItem(SPEICHER_KEY);
    if (roh) {
      const d = JSON.parse(roh);
      if (d && d.version === 1 && d.profile) {
        d.einstellungen = { ...EINST_STANDARD, ...(d.einstellungen || {}) };
        for (const p of Object.values(d.profile)) normalisiereProfil(p);
        return d;
      }
    }
  } catch (e) { speicherOk = false; }
  return leererSpeicher();
}
function normalisiereProfil(p) {
  p.items = p.items || {}; p.pruefungen = p.pruefungen || []; p.tempo = p.tempo || [];
  p.diktate = p.diktate || {}; p.texte = p.texte || {}; p.abzeichen = p.abzeichen || {};
  p.tage = p.tage || []; p.punkte = p.punkte || 0; p.fehlerBehoben = p.fehlerBehoben || 0;
  p.fehlerwoerter = p.fehlerwoerter || [];
  return p;
}
let DB = ladeSpeicher();
let speicherTimer = null;
function speichern(sofort = false) {
  clearTimeout(speicherTimer);
  const los = () => {
    try { window.localStorage.setItem(SPEICHER_KEY, JSON.stringify(DB)); speicherOk = true; }
    catch (e) { speicherOk = false; }
  };
  if (sofort) los(); else speicherTimer = setTimeout(los, 250);
}
window.addEventListener('pagehide', () => speichern(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) speichern(true); });

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
  { id: 'tempo30', sym: '🚀', name: 'Tempo-Rakete', text: 'Im Lese-Tempo mindestens 30 Sätze richtig', test: (p) => p.tempo.some((x) => x.richtig >= 30) },
  { id: 'rs', sym: '✍️', name: 'Rechtschreib-Ass', text: '80 % im Rechtschreib-Labor gemeistert', test: (p) => { const s = modulStand('rechtschreibung', p); return s.gesamt > 0 && s.gemeistert >= 0.8 * s.gesamt; } },
  { id: 'gr', sym: '🧩', name: 'Grammatik-Genie', text: '80 % im Grammatik-Labor gemeistert', test: (p) => { const s = modulStand('grammatik', p); return s.gesamt > 0 && s.gemeistert >= 0.8 * s.gesamt; } },
  { id: 'diktat', sym: '🎧', name: 'Diktat-Meister', text: 'Ein Diktat mit 10 von 10 Wörtern', test: (p) => Object.values(p.diktate).some((d) => d.best >= 10) },
  { id: 'autor', sym: '🖋️', name: 'Schreib-Talent', text: 'Zwei Schreibaufträge fertig geschrieben', test: (p) => Object.values(p.texte).filter((t) => t.fertig).length >= 2 },
  { id: 'fehler', sym: '🦾', name: 'Fehler-Fresser', text: '10 Fehler aus der Fehler-Kiste verbessert', test: (p) => p.fehlerBehoben >= 10 },
  { id: 'serie5', sym: '🔥', name: 'Dranbleiber', text: 'An 5 Tagen hintereinander geübt', test: (p) => serie(p) >= 5 },
  { id: 'mission', sym: '🎯', name: 'Missionserfüller', text: 'Eine Tagesmission komplett erledigt', test: (p) => !!p.missionGeschafft },
];
function pruefeAbzeichen() {
  const p = P(); if (!p) return [];
  const neu = [];
  for (const a of ABZEICHEN) {
    try { if (!p.abzeichen[a.id] && a.test(p)) { p.abzeichen[a.id] = Date.now(); neu.push(a); } } catch (e) { /* Inhalte fehlen */ }
  }
  if (neu.length) { speichern(); neu.forEach((a, i) => setTimeout(() => toast(`Neues Abzeichen: ${a.sym} ${a.name}`), 700 + i * 2600)); }
  return neu;
}

/* ---------- Sichern & Wiederherstellen ---------- */
function exportCode() {
  const daten = { app: 'lese-labor-profi', v: 1, datum: Date.now(), profile: DB.profile, einstellungen: DB.einstellungen };
  const json = JSON.stringify(daten);
  return 'LLP1:' + btoa(unescape(encodeURIComponent(json)));
}
function importCode(code) {
  const roh = String(code || '').trim();
  let json;
  if (roh.startsWith('LLP1:')) json = decodeURIComponent(escape(atob(roh.slice(5).replace(/\s+/g, ''))));
  else if (roh.startsWith('{')) json = roh;
  else throw new Error('Das ist kein gültiger Sicherungscode. Er beginnt mit „LLP1:“.');
  const d = JSON.parse(json);
  if (!d || d.app !== 'lese-labor-profi' || !d.profile) throw new Error('Der Code gehört nicht zu Lese-Labor PROFI.');
  let n = 0;
  for (const [id, p] of Object.entries(d.profile)) { DB.profile[id] = normalisiereProfil(p); n++; }
  if (d.einstellungen) DB.einstellungen = { ...EINST_STANDARD, ...d.einstellungen };
  if (!DB.profile[DB.aktivesProfil]) DB.aktivesProfil = Object.keys(DB.profile)[0] || null;
  speichern(true);
  return n;
}
