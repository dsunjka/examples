/* ===== Grundlagen: Hilfsfunktionen, Module, Inhaltsregister ===== */
const INHALT = window.LL_INHALT || {};
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
/** Text mit erlaubtem Inline-Markup <b> und <i>. */
const rich = (s) => esc(s).replace(/&lt;(\/?)(b|i)&gt;/g, '<$1$2>');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sum = (a) => a.reduce((x, y) => x + y, 0);
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const icon = (name, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

function heute(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function datumLesbar(ts) {
  try {
    return new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return heute(new Date(ts)); }
}
function zeitLesbar(sek) {
  sek = Math.max(0, Math.round(sek));
  const m = Math.floor(sek / 60), s = sek % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
/** Kleiner deterministischer Zufallsgenerator (für Tagesmission). */
function rng(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = (Math.imul(h, 1103515245) + 12345) >>> 0; return h / 4294967296; };
}
function mische(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Permutation 0..n-1, die nicht die Identität ist (wenn möglich). */
function permutation(n, nieIdentisch = false) {
  const basis = Array.from({ length: n }, (_, i) => i);
  let p = mische(basis);
  if (nieIdentisch && n > 1) {
    let tries = 0;
    while (p.every((v, i) => v === i) && tries++ < 10) p = mische(basis);
  }
  return p;
}
function plural(n, ein, mehr) { return `${n} ${n === 1 ? ein : mehr}`; }

/* ---------- Module ---------- */
const MODULE = [
  { id: 'digital', titel: 'Digital-Labor', kurz: 'Internetseiten lesen, prüfen und bedienen – Training für BYLET-D', farbe: 'var(--m-digital)', icon: 'digital', gruppeName: 'Fall' },
  { id: 'lesen', titel: 'Lese-Labor', kurz: 'Sachtexte, Geschichten und Gedichte genau verstehen – nah an BYLET-V', farbe: 'var(--m-lesen)', icon: 'lesen', gruppeName: 'Text' },
  { id: 'tempo', titel: 'Lese-Tempo', kurz: 'Schnell und genau lesen: Stimmt der Satz? – nah an BYLET-F', farbe: 'var(--m-tempo)', icon: 'tempo', gruppeName: '' },
  { id: 'rechtschreibung', titel: 'Rechtschreib-Labor', kurz: 'Strategien: mitsprechen, nachdenken, merken – plus Diktat', farbe: 'var(--m-rechtschreibung)', icon: 'rechtschreibung', gruppeName: 'Thema' },
  { id: 'grammatik', titel: 'Grammatik-Labor', kurz: 'Wortarten, Zeitformen, Satzglieder und die vier Fälle', farbe: 'var(--m-grammatik)', icon: 'grammatik', gruppeName: 'Thema' },
  { id: 'schreiben', titel: 'Schreib-Werkstatt', kurz: 'Texte planen, lebendig formulieren und überarbeiten', farbe: 'var(--m-schreiben)', icon: 'schreiben', gruppeName: 'Thema' },
];
const MODUL = Object.fromEntries(MODULE.map((m) => [m.id, m]));

const KOMPETENZEN = {
  digital: { finden: 'Informationen finden', navigieren: 'Navigieren & Bedienen', verknuepfen: 'Verknüpfen & Schließen', bewerten: 'Bewerten & Prüfen' },
  lesen: { entnehmen: 'Informationen entnehmen', schliessen: 'Schlüsse ziehen', reflektieren: 'Nachdenken & Bewerten' },
  rechtschreibung: { mitsprechen: 'Mitsprechen', nachdenken: 'Nachdenken', merken: 'Merken', zeichen: 'Satzzeichen' },
  grammatik: { wortarten: 'Wortarten', wortbildung: 'Wortbildung', zeitformen: 'Zeitformen', satzglieder: 'Satzglieder', faelle: 'Die vier Fälle' },
  schreiben: { planen: 'Planen', formulieren: 'Formulieren', ueberarbeiten: 'Überarbeiten' },
};
const TYP_HINWEIS = {
  single: 'Wähle eine Antwort aus.',
  multi: 'Wähle alle richtigen Antworten aus. Es sind mehrere richtig.',
  matrix: 'Entscheide bei jeder Aussage.',
  luecke: 'Wähle für jede Lücke das passende Wort.',
  markieren: 'Tippe die passenden Wörter an.',
  zuordnen: 'Tippe erst ein Kärtchen an, dann die passende Kiste.',
  reihenfolge: 'Bringe alles mit den Pfeilen in die richtige Reihenfolge.',
  eingabe: 'Tippe deine Antwort ein. Groß- und Kleinschreibung zählt.',
};
const TYP_NAME = { single: 'Eine Antwort', multi: 'Mehrfachauswahl', matrix: 'Aussagen prüfen', luecke: 'Lückentext', markieren: 'Antippen', zuordnen: 'Zuordnen', reihenfolge: 'Reihenfolge', eingabe: 'Eintippen' };

/* ---------- Inhaltsregister ---------- */
const REG = { items: {}, gruppen: {}, module: {} };
function baueRegister() {
  for (const m of MODULE) REG.module[m.id] = { gruppen: [], items: [] };
  const neueGruppe = (modul, art, daten, titel, extra = {}) => {
    const g = { id: daten.id, modul, art, titel, daten, items: [], ...extra };
    REG.gruppen[g.id] = g;
    REG.module[modul].gruppen.push(g.id);
    for (const it of daten.items || []) {
      if (!it || !it.id || REG.items[it.id]) continue;
      REG.items[it.id] = { it, modul, gruppe: g.id };
      g.items.push(it.id);
      REG.module[modul].items.push(it.id);
    }
    return g;
  };
  const faelle = (INHALT.digital || []).slice().sort((a, b) => (a.nummer || 0) - (b.nummer || 0));
  for (const f of faelle) neueGruppe('digital', 'fall', f, f.titel);
  for (const t of INHALT.lesen || []) neueGruppe('lesen', 'text', t, t.titel);
  for (const mod of ['rechtschreibung', 'grammatik', 'schreiben']) {
    for (const th of (INHALT[mod] && INHALT[mod].themen) || []) neueGruppe(mod, 'thema', th, th.titel);
  }
}
const itemInfo = (id) => REG.items[id];
const gruppeVon = (id) => REG.gruppen[(REG.items[id] || {}).gruppe];
function kompetenzLabel(modul, k) { return (KOMPETENZEN[modul] || {})[k] || k || 'Sonstiges'; }
function modulHatInhalt(id) {
  if (id === 'tempo') return !!(INHALT.tempo && (INHALT.tempo.saetze || []).length);
  return (REG.module[id] || { items: [] }).items.length > 0;
}
