/* ===== Quellen: simulierter Browser, Lesetexte, Merkkasten, Textmarker ===== */
const SITE_FARBEN = { gruen: '#2f8a3f', blau: '#2f68d8', orange: '#d9671c', lila: '#7a4cc2', rot: '#c7364a', grau: '#4b5568', tuerkis: '#0c8b8b', gelb: '#b88a00' };
const ERLAUBTE_TAGS = new Set('h1 h2 h3 h4 p ul ol li strong em b i small span div a button br hr table thead tbody tr th td dl dt dd details summary time caption'.split(' '));
const GEFAEHRLICH = new Set('script style iframe object embed img video audio link meta form input textarea select svg math template noscript'.split(' '));
const ERLAUBTE_ATTR = new Set(['class', 'data-ziel', 'data-extern', 'open', 'colspan', 'rowspan', 'datetime', 'title', 'aria-label']);
const KLASSE_OK = /^(?:[wspcma]-[a-z0-9-]+|aktiv)$/;
const MARKER_ZIELE = 'p, li, td, th, dd, dt, h1, h2, h3, h4, summary, .c-text, .p-text, .s-text, .s-titel, .m-vorschau, .m-betreff, .a-zelle, .a-hinweis, .a-gross';

const htmlCache = new Map();
function saeubere(html) {
  if (htmlCache.has(html)) return htmlCache.get(html);
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html || '');
  for (const el of Array.from(tpl.content.querySelectorAll('*'))) {
    const tag = el.tagName.toLowerCase();
    if (GEFAEHRLICH.has(tag)) { el.remove(); continue; }
    if (!ERLAUBTE_TAGS.has(tag)) { el.replaceWith(...Array.from(el.childNodes)); continue; }
    for (const at of Array.from(el.attributes)) {
      if (!ERLAUBTE_ATTR.has(at.name)) el.removeAttribute(at.name);
    }
    if (el.hasAttribute('class')) {
      const cls = el.getAttribute('class').split(/\s+/).filter((c) => KLASSE_OK.test(c));
      if (cls.length) el.setAttribute('class', cls.join(' ')); else el.removeAttribute('class');
    }
    if (tag === 'a' && (el.hasAttribute('data-ziel') || el.hasAttribute('data-extern'))) { el.setAttribute('role', 'link'); el.setAttribute('tabindex', '0'); }
    if (tag === 'button') el.setAttribute('type', 'button');
  }
  for (const t of Array.from(tpl.content.querySelectorAll('table'))) {
    const huelle = document.createElement('div');
    huelle.className = 'w-tabelle-huelle';
    t.parentNode.insertBefore(huelle, t);
    huelle.appendChild(t);
  }
  const div = document.createElement('div');
  div.appendChild(tpl.content.cloneNode(true));
  const out = div.innerHTML;
  htmlCache.set(html, out);
  return out;
}

/* ---------- Digitaler Fall ---------- */
function fallZustand(fallId) {
  const f = REG.gruppen[fallId].daten;
  SITZ.browser = SITZ.browser || {};
  if (!SITZ.browser[fallId]) SITZ.browser[fallId] = { verlauf: [f.startseite], pos: 0 };
  return SITZ.browser[fallId];
}
function seiteVon(f, id) { return (f.seiten || []).find((s) => s.id === id) || f.seiten[0]; }
function renderGeraet(fallId) {
  const f = REG.gruppen[fallId].daten, z = fallZustand(fallId);
  const s = seiteVon(f, z.verlauf[z.pos]);
  const rahmen = s.rahmen || f.rahmen || 'browser';
  const app = s.app || f.app || {};
  const farbe = s.farbe || app.farbe || 'blau';
  let leiste;
  if (rahmen === 'app') {
    leiste = `<div class="app-leiste" style="--site:${SITE_FARBEN[app.farbe || farbe] || SITE_FARBEN.blau}">
      <button type="button" class="browser-knopf" data-act="b-zurueck" aria-label="Zurück" ${z.pos === 0 ? 'disabled' : ''}>${icon('zurueck')}</button>
      <div class="app-name"><span class="sym" aria-hidden="true">${esc(app.symbol || '📱')}</span><span>${esc(app.name || 'App')}<br><small>${esc(s.titel)}</small></span></div></div>`;
  } else {
    leiste = `<div class="browser-leiste">
      <div class="browser-tab">${esc(s.titel)}</div>
      <button type="button" class="browser-knopf" data-act="b-zurueck" aria-label="Zurück" ${z.pos === 0 ? 'disabled' : ''}>${icon('zurueck')}</button>
      <button type="button" class="browser-knopf" data-act="b-vor" aria-label="Vorwärts" ${z.pos >= z.verlauf.length - 1 ? 'disabled' : ''}>${icon('vor')}</button>
      <button type="button" class="browser-knopf" data-act="b-start" aria-label="Zur Startseite des Falls">${icon('neu')}</button>
      <div class="adresse" title="${esc(s.adresse || '')}">${icon('schloss')}<span>${esc(s.adresse || '')}</span></div></div>`;
  }
  return `<div class="geraet">${leiste}<div class="web farbe-${esc(farbe)}" data-seite="${esc(s.id)}" data-marker-key="${esc(fallId + ':' + s.id)}">${saeubere(s.html)}</div></div>`;
}
function fallNavigiere(fallId, wohin) {
  const f = REG.gruppen[fallId].daten, z = fallZustand(fallId);
  if (wohin === 'zurueck') z.pos = Math.max(0, z.pos - 1);
  else if (wohin === 'vor') z.pos = Math.min(z.verlauf.length - 1, z.pos + 1);
  else if (wohin === 'start') { z.verlauf = z.verlauf.slice(0, z.pos + 1).concat(f.startseite); z.pos = z.verlauf.length - 1; }
  else if ((f.seiten || []).some((s) => s.id === wohin)) {
    if (z.verlauf[z.pos] !== wohin) { z.verlauf = z.verlauf.slice(0, z.pos + 1).concat(wohin); z.pos = z.verlauf.length - 1; }
  }
  zeichneQuellinhalt(true);
}

/* ---------- Lesetext ---------- */
function renderLesetext(textId) {
  const t = REG.gruppen[textId].daten, x = t.text || {};
  let n = 0, v = 0;
  const abs = (x.absaetze || []).map((a) => {
    if (/^##\s/.test(a)) return `<h3>${rich(a.replace(/^##\s*/, ''))}</h3>`;
    n++;
    return `<div class="abs"><span class="abs-nr" aria-label="Absatz ${n}">${n}</span><p>${rich(a)}</p></div>`;
  }).join('');
  const str = (x.strophen || []).map((st, si) => `<div class="strophe"><div class="strophe-nr">Strophe ${si + 1}</div>${st.map((vers) => { v++; return `<div class="vers"><span class="vers-nr" aria-label="Vers ${v}">${v}</span><p>${rich(vers)}</p></div>`; }).join('')}</div>`).join('');
  let tab = '';
  if (x.tabelle && (x.tabelle.kopf || []).length) {
    tab = `<div class="tabelle-huelle"><table class="lese-tabelle">${x.tabelle.titel ? `<caption>${rich(x.tabelle.titel)}</caption>` : ''}<thead><tr>${x.tabelle.kopf.map((k) => `<th scope="col">${rich(k)}</th>`).join('')}</tr></thead><tbody>${(x.tabelle.zeilen || []).map((z) => `<tr>${z.map((c) => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  return `<article class="lesetext" data-marker-key="${esc(textId)}">
    <h2>${rich(x.titel || t.titel)}</h2>${x.untertitel ? `<p class="unter">${rich(x.untertitel)}</p>` : ''}${x.autor ? `<p class="autor">${rich(x.autor)}</p>` : ''}
    ${abs}${str}${tab}</article>`;
}

/* ---------- Merkkasten ---------- */
function renderMerkkasten(thema, farbe) {
  const w = thema.wissen || {};
  return `<section class="merkkasten" style="--farbe:${farbe}"><h3>Merkkasten: ${esc(thema.titel)}</h3>
    ${w.merksatz ? `<p class="merksatz">${rich(w.merksatz)}</p>` : ''}
    ${(w.punkte || []).length ? `<ul>${w.punkte.map((p) => `<li>${rich(p)}</li>`).join('')}</ul>` : ''}
    ${(w.beispiele || []).length ? `<div class="beispiele">${w.beispiele.map((b) => `<span>${rich(b)}</span>`).join('')}</div>` : ''}</section>`;
}

/* ---------- Textmarker ---------- */
function markerVorbereiten(wurzel) {
  const box = wurzel.querySelector('[data-marker-key]');
  if (!box) return;
  const key = box.getAttribute('data-marker-key');
  const ziele = Array.from(box.querySelectorAll(MARKER_ZIELE)).filter((el) => !el.querySelector(MARKER_ZIELE));
  ziele.forEach((el, i) => el.setAttribute('data-tm', String(i)));
  const gesetzt = ((SITZ && SITZ.marker) || {})[key] || [];
  for (const i of gesetzt) { const el = box.querySelector(`[data-tm="${i}"]`); if (el) el.classList.add('tm'); }
}
function markerUmschalten(el) {
  const box = el.closest('[data-marker-key]'); if (!box) return;
  const key = box.getAttribute('data-marker-key'), i = Number(el.getAttribute('data-tm'));
  SITZ.marker = SITZ.marker || {};
  const liste = SITZ.marker[key] || (SITZ.marker[key] = []);
  const pos = liste.indexOf(i);
  if (pos >= 0) { liste.splice(pos, 1); el.classList.remove('tm'); } else { liste.push(i); el.classList.add('tm'); }
  sitzungMerken();
}
function markerLoeschen() {
  const box = $('.quelle-flaeche [data-marker-key]'); if (!box) return;
  const key = box.getAttribute('data-marker-key');
  if (SITZ.marker) SITZ.marker[key] = [];
  $$('.tm', box).forEach((el) => el.classList.remove('tm'));
  sitzungMerken();
}
