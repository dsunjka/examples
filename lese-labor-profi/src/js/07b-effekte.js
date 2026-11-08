/* ===== Spezialeffekte: Sternenhimmel, Glitzer, Münzflug, Combo, Feiern, Level-up, Töne =====
   Alles läuft über CSS-Animationen (Grafikkarte) – keine Dauerschleife in JavaScript.
   Stufen: voll (alles), sanft (wenig Bewegung), aus (ruhig). Systemeinstellung „Bewegung reduzieren“ = höchstens sanft.
   Die Effekt-Ebene #fx-ebene ist für Bildschirmleser verborgen; wichtige Momente sagt #sr-meldung an. */
function fxStufe() {
  const e = (DB && DB.einstellungen && DB.einstellungen.effekte) || 'voll';
  if (e === 'voll' && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return 'sanft';
  return e;
}
/** Fliegende Teilchen nur, wenn sie auch animiert werden (sonst bleiben sie unsichtbar und kosten nur Zeit). */
const bewegungReduziert = () => fxStufe() === 'aus' || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const fxEbene = () => document.getElementById('fx-ebene');
function sagAn(text) {
  const sr = document.getElementById('sr-meldung'); if (!sr) return;
  sr.textContent = '';
  setTimeout(() => { sr.textContent = text; }, 60);
}
/** Mittelpunkt eines Elements, eines Rechtecks oder eines {x, y}-Punkts – auf den sichtbaren Bereich begrenzt. */
function fxMitte(ziel) {
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  if (ziel && ziel.getBoundingClientRect) { const r = ziel.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  else if (ziel && typeof ziel.width === 'number') { x = ziel.left + ziel.width / 2; y = ziel.top + ziel.height / 2; }
  else if (ziel && typeof ziel.x === 'number') { x = ziel.x; y = ziel.y; }
  return { x: Math.min(Math.max(x, 40), window.innerWidth - 40), y: Math.min(Math.max(y, 60), window.innerHeight - 60) };
}

/* ---------- Sternenhimmel: ruhige Sterne auf der Leinwand, funkelnde Sterne und Sternschnuppen per CSS ---------- */
let himmelGebaut = false;
function sternenhimmel() {
  const c = document.getElementById('sterne');
  if (!c || !c.getContext) return;
  const ctx = c.getContext('2d');
  let zuletzt = { w: 0, h: 0 };
  const zeichnen = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = window.innerWidth, h = window.innerHeight;
    // Kleine Höhenänderungen (Safari-Leiste) streckt das CSS – nur bei echten Größenwechseln neu zeichnen.
    if (Math.abs(w - zuletzt.w) < 2 && Math.abs(h - zuletzt.h) < 120) return;
    zuletzt = { w, h };
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // fester Startwert: Beim Drehen des iPads springen die Sterne nicht an neue Plätze
    let s = 0x5eed1234;
    const zz = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const n = Math.round(Math.min(260, (w * h) / 5200));
    const farben = ['#ffffff', '#ffd9f5', '#d9f7ff', '#fff1c2', '#e8dcff'];
    for (let i = 0; i < n; i++) {
      const x = zz() * w, y = zz() * h, r = zz() * 1.3 + 0.25;
      ctx.globalAlpha = 0.35 + zz() * 0.6;
      ctx.fillStyle = farben[i % farben.length];
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  let t = null;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(zeichnen, 200); });
  zeichnen();
  if (himmelGebaut) return;
  himmelGebaut = true;
  const all = c.parentElement;
  const zufall = (a, b) => a + Math.random() * (b - a);
  let html = '';
  for (let i = 0; i < 26; i++) {
    html += `<i class="funkelstern" style="left:${zufall(2, 98).toFixed(1)}%;top:${zufall(2, 96).toFixed(1)}%;--g:${zufall(6, 14).toFixed(0)}px;--d:${zufall(2.2, 5.5).toFixed(2)}s;--v:${zufall(0, 5).toFixed(2)}s;--f:${['#ffffff', '#ffd36b', '#ff9fe4', '#9ff0ff'][i % 4]}"></i>`;
  }
  html += '<i class="schnuppe s1"></i><i class="schnuppe s2"></i>';
  all.insertAdjacentHTML('beforeend', html);
}
/** Sicherheitsnetz für sehr alte iPads: Ruckelt es schon im Leerlauf, fallen die teuersten Extras weg (Einstellung bleibt). */
function pruefeLeistung() {
  if (fxStufe() !== 'voll' || !window.requestAnimationFrame || !window.performance) return;
  setTimeout(() => {
    let n = 0, lang = 0, last = performance.now();
    const f = (t) => { if (t - last > 34) lang++; last = t; if (++n < 90) requestAnimationFrame(f); else if (lang > 20) document.documentElement.classList.add('fx-leicht'); };
    requestAnimationFrame(f);
  }, 1500);
}

/* ---------- Glitzer-Explosion ---------- */
const GLITZER_ZEICHEN = ['✦', '★', '✧', '•', '✦', '♥'];
const GLITZER_FARBEN = ['#ffd36b', '#ff6fd8', '#4fe3ff', '#ffffff', '#b994ff', '#5ef2b4'];
/** Glitzer aus einem Punkt ({x, y}), einem Rechteck oder der Mitte eines Elements. */
function glitzer(ziel, { anzahl = 26, weite = 150, gross = false } = {}) {
  if (bewegungReduziert()) return;
  const wurzel = fxEbene(); if (!wurzel) return;
  const { x, y } = fxMitte(ziel); // erst lesen, dann schreiben
  const n = fxStufe() === 'sanft' ? Math.min(10, Math.round(anzahl / 3)) : anzahl;
  const box = document.createElement('div');
  box.className = 'glitzer-wolke';
  box.style.left = x + 'px'; box.style.top = y + 'px';
  let html = '', maxDauer = 0;
  for (let i = 0; i < n; i++) {
    const winkel = (Math.PI * 2 * i) / n + Math.random() * 0.6;
    const w = weite * (0.45 + Math.random() * 0.75) * (gross ? 1.6 : 1);
    const dx = Math.cos(winkel) * w, dy = Math.sin(winkel) * w - (gross ? 40 : 20);
    const z = GLITZER_ZEICHEN[i % GLITZER_ZEICHEN.length], f = GLITZER_FARBEN[(i * 7) % GLITZER_FARBEN.length];
    const dauer = 0.8 + Math.random() * 0.6; maxDauer = Math.max(maxDauer, dauer);
    html += `<i style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--rot:${(Math.random() * 540 - 270).toFixed(0)}deg;--f:${f};--s:${(0.7 + Math.random() * 0.9).toFixed(2)};--dauer:${dauer.toFixed(2)}s">${z}</i>`;
  }
  box.innerHTML = html;
  wurzel.appendChild(box);
  setTimeout(() => box.remove(), Math.ceil(maxDauer * 1000) + 100);
}
/** Großer Konfetti-Regen von oben (Ergebnisse, Mission, Level-up). */
function sternenregen(menge = 40) {
  if (bewegungReduziert()) return;
  if (fxStufe() !== 'voll') { glitzer(null, { anzahl: 18, gross: true }); return; }
  const wurzel = fxEbene(); if (!wurzel) return;
  const box = document.createElement('div');
  box.className = 'sternenregen';
  let html = '', maxEnde = 0;
  for (let i = 0; i < menge; i++) {
    const z = GLITZER_ZEICHEN[i % GLITZER_ZEICHEN.length], f = GLITZER_FARBEN[i % GLITZER_FARBEN.length];
    const v = Math.random() * 0.8, d = 1.8 + Math.random() * 1.4; maxEnde = Math.max(maxEnde, v + d);
    html += `<i style="left:${(Math.random() * 100).toFixed(1)}%;--f:${f};--s:${(0.8 + Math.random() * 1.1).toFixed(2)};--v:${v.toFixed(2)}s;--dauer:${d.toFixed(2)}s;--dx:${(Math.random() * 120 - 60).toFixed(0)}px;--rot:${(Math.random() * 720 - 360).toFixed(0)}deg">${z}</i>`;
  }
  box.innerHTML = html;
  wurzel.appendChild(box);
  setTimeout(() => box.remove(), Math.ceil(maxEnde * 1000) + 100);
}

/* ---------- Münzflug zum Punkte-Chip, Combo, Wackeln ---------- */
/** „+10 ✦“ steigt aus `ziel` (Element oder Rechteck) auf und fliegt – wenn `nach` angegeben – in den Punkte-Chip. */
function punkteFlug(ziel, text, nach) {
  if (bewegungReduziert() || !ziel) return;
  const wurzel = fxEbene(); if (!wurzel) return;
  const r = ziel.getBoundingClientRect ? ziel.getBoundingClientRect() : ziel;
  const z = nach && nach.isConnected ? nach.getBoundingClientRect() : null; // alles lesen, bevor geschrieben wird
  const x = Math.min(Math.max(r.left + r.width / 2, 50), window.innerWidth - 50);
  const y = Math.min(Math.max(r.top + 10, 70), window.innerHeight - 50);
  const el = document.createElement('div');
  el.className = 'punkte-flug'; el.textContent = text;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  if (z && z.width) {
    el.classList.add('zum-chip');
    el.style.setProperty('--zx', Math.round(z.left + z.width / 2 - x) + 'px');
    el.style.setProperty('--zy', Math.round(z.top + z.height / 2 - y - 12) + 'px');
    setTimeout(() => { const chip = $('.sitzung-kopf .punkte-chip'); if (!chip) return; chip.classList.remove('hupf'); void chip.offsetWidth; chip.classList.add('hupf'); }, 900);
  }
  wurzel.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
function comboPop(n) {
  if (bewegungReduziert()) return;
  const w = fxEbene(); if (!w) return;
  const el = document.createElement('div'); el.className = 'combo-pop'; el.textContent = `${n}er-Serie! 🔥`;
  w.appendChild(el); setTimeout(() => el.remove(), 1400);
}
function wackeln(el) {
  if (!el || fxStufe() === 'aus') return;
  el.classList.remove('wackeln'); void el.offsetWidth; el.classList.add('wackeln');
  setTimeout(() => el.classList.remove('wackeln'), 650);
}

/* ---------- Feier-Warteschlange: Level-up, Abzeichen und Mission nacheinander, nie übereinander ---------- */
let feierKette = Promise.resolve();
function feiern(fn, dauer, vorlauf = 0) {
  feierKette = feierKette.then(() => new Promise((weiter) => setTimeout(() => { try { fn(); } catch (e) { /* nur Schmuck */ } setTimeout(weiter, dauer); }, vorlauf)));
}
function zeigeAbzeichen(a, kopf = 'Neues Abzeichen!') {
  sagAn(`${kopf} ${a.name}. ${a.text}`);
  ton('abzeichen');
  if (fxStufe() === 'aus') { toastDanach(`${kopf} ${a.sym} ${a.name}`); return; }
  const wurzel = fxEbene(); if (!wurzel) return;
  const el = document.createElement('div');
  el.className = 'abzeichen-neu';
  el.innerHTML = `<div class="abzeichen-neu-box"><span class="strahlen"></span><span class="sym">${a.sym}</span><small>${esc(kopf)}</small><strong>${esc(a.name)}</strong><span>${esc(a.text)}</span></div>`;
  wurzel.appendChild(el);
  setTimeout(() => glitzer({ x: window.innerWidth / 2, y: window.innerHeight / 2 - 40 }, { anzahl: 30, gross: true }), 250);
  setTimeout(() => el.remove(), 2950);
}

/* ---------- Level-up ---------- */
let levelUpTimer = null;
function zeigeLevelUp(lv) {
  sagAn(`Level up! Level ${lv.nr}: ${lv.name}`);
  ton('levelup');
  if (fxStufe() === 'aus') { toastDanach(`⭐ Level up! Level ${lv.nr} · ${lv.name}`); return; }
  const wurzel = fxEbene(); if (!wurzel) return;
  clearTimeout(levelUpTimer);
  const alt = wurzel.querySelector('.levelup'); if (alt) alt.remove();
  const el = document.createElement('div');
  el.className = 'levelup';
  el.innerHTML = `<div class="levelup-box"><strong>LEVEL UP!</strong><span>Level ${lv.nr} · ${esc(lv.name)}</span><small>Weiter so – du sammelst Sternenkraft!</small></div>`;
  wurzel.appendChild(el);
  sternenregen(46);
  levelUpTimer = setTimeout(() => el.remove(), 2800);
}

/* ---------- Sterne-Wertung (wie in Spiel-Levels) ---------- */
function sterneHTML(anteil) {
  const n = anteil >= 0.9 ? 3 : anteil >= 0.7 ? 2 : anteil >= 0.4 ? 1 : 0;
  return `<div class="sterne-wertung" role="img" aria-label="${n} von 3 Sternen">${[0, 1, 2].map((i) => `<span class="${i < n ? 'an' : ''}">★</span>`).join('')}</div>`;
}

/* ---------- Töne (Web Audio, nur wenn eingeschaltet) ---------- */
let audio = null, audioPause = null;
function ton(art) {
  if (!(DB && DB.einstellungen && DB.einstellungen.toene)) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const folgen = { richtig: [[880, 0], [1320, 0.09]], falsch: [[220, 0], [180, 0.12]], levelup: [[660, 0], [880, 0.1], [1100, 0.2], [1320, 0.3]], fanfare: [[523, 0], [659, 0.12], [784, 0.24], [1046, 0.38]], abzeichen: [[988, 0], [1318, 0.1], [1760, 0.2]] };
    const jetzt = audio.currentTime;
    for (const [frequenz, start] of folgen[art] || []) {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = art === 'falsch' ? 'triangle' : 'sine';
      o.frequency.value = frequenz;
      g.gain.setValueAtTime(0.0001, jetzt + start);
      g.gain.exponentialRampToValueAtTime(art === 'falsch' ? 0.12 : 0.16, jetzt + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, jetzt + start + 0.28);
      o.connect(g).connect(audio.destination);
      o.start(jetzt + start); o.stop(jetzt + start + 0.3);
    }
    // Audio-Hardware danach schlafen legen (spart auf dem iPad Akku)
    clearTimeout(audioPause);
    audioPause = setTimeout(() => { if (audio && audio.state === 'running') audio.suspend().catch(() => {}); }, 2500);
  } catch (e) { /* kein Ton möglich */ }
}

/* ---------- Effekte nach dem Zeichnen bestimmter Ansichten ---------- */
function effekteNachRender() {
  const n = ANSICHT.name;
  if (n === 'ergebnis' && ANSICHT.param && ANSICHT.param.eintrag && !ANSICHT.param.gefeiert) {
    ANSICHT.param.gefeiert = true;
    const e = ANSICHT.param.eintrag, anteil = e.max ? e.punkte / e.max : 0;
    if (anteil >= 0.5) { setTimeout(() => { glitzer($('.ring'), { anzahl: 30, gross: true }); sternenregen(anteil >= 0.9 ? 60 : 36); ton('fanfare'); }, 500); }
  }
  if (n === 'zusammenfassung' && ANSICHT.param && ANSICHT.param.sitz && !ANSICHT.param.gefeiert) {
    ANSICHT.param.gefeiert = true;
    const s = ANSICHT.param.sitz, r = s.ids.filter((id) => s.ergebnis[id] === 'r' || s.ergebnis[id] === 'h').length;
    if (r) setTimeout(() => { glitzer($('.ring'), { anzahl: 30, gross: true }); if (r / s.ids.length >= 0.8) sternenregen(30); ton('fanfare'); }, 450);
  }
  if (n === 'tempo-ergebnis' && ANSICHT.param && ANSICHT.param.erg && !ANSICHT.param.gefeiert) {
    ANSICHT.param.gefeiert = true;
    const { erg, bisher } = ANSICHT.param;
    if (bisher == null || tempoWert(erg) > bisher) setTimeout(() => { sternenregen(40); ton('fanfare'); }, 400);
  }
}
