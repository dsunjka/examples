/* ===== Spezialeffekte: Sternenhimmel, Glitzer, Level-up, fliegende Punkte, Töne =====
   Alles läuft über CSS-Animationen (Grafikkarte) – keine Dauerschleife in JavaScript.
   Stufen: voll (alles), sanft (wenig Bewegung), aus (ruhig). Systemeinstellung „Bewegung reduzieren“ = höchstens sanft. */
function fxStufe() {
  const e = (DB && DB.einstellungen && DB.einstellungen.effekte) || 'voll';
  if (e === 'voll' && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return 'sanft';
  return e;
}

/* ---------- Sternenhimmel: ruhige Sterne auf der Leinwand, funkelnde Sterne und Sternschnuppen per CSS ---------- */
let himmelGebaut = false;
function sternenhimmel() {
  const c = document.getElementById('sterne');
  if (!c || !c.getContext) return;
  const ctx = c.getContext('2d');
  const zeichnen = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = window.innerWidth, h = window.innerHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const n = Math.round(Math.min(260, (w * h) / 5200));
    const farben = ['#ffffff', '#ffd9f5', '#d9f7ff', '#fff1c2', '#e8dcff'];
    for (let i = 0; i < n; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 1.3 + 0.25;
      ctx.globalAlpha = 0.35 + Math.random() * 0.6;
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

/* ---------- Glitzer-Explosion ---------- */
const GLITZER_ZEICHEN = ['✦', '★', '✧', '•', '✦', '♥'];
const GLITZER_FARBEN = ['#ffd36b', '#ff6fd8', '#4fe3ff', '#ffffff', '#b994ff', '#5ef2b4'];
/** Glitzer aus einem Punkt (x, y in Fensterkoordinaten) oder aus der Mitte eines Elements. */
function glitzer(ziel, { anzahl = 26, weite = 150, gross = false } = {}) {
  const stufe = fxStufe();
  if (stufe === 'aus') return;
  let x, y;
  if (ziel && ziel.getBoundingClientRect) { const r = ziel.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  else if (ziel && typeof ziel.x === 'number') { x = ziel.x; y = ziel.y; }
  else { x = window.innerWidth / 2; y = window.innerHeight / 2; }
  const wurzel = document.getElementById('effekte'); if (!wurzel) return;
  const n = stufe === 'sanft' ? Math.min(10, Math.round(anzahl / 3)) : anzahl;
  const box = document.createElement('div');
  box.className = 'glitzer-wolke';
  box.style.left = x + 'px'; box.style.top = y + 'px';
  let html = '';
  for (let i = 0; i < n; i++) {
    const winkel = (Math.PI * 2 * i) / n + Math.random() * 0.6;
    const w = weite * (0.45 + Math.random() * 0.75) * (gross ? 1.6 : 1);
    const dx = Math.cos(winkel) * w, dy = Math.sin(winkel) * w - (gross ? 40 : 20);
    const z = GLITZER_ZEICHEN[i % GLITZER_ZEICHEN.length], f = GLITZER_FARBEN[(i * 7) % GLITZER_FARBEN.length];
    html += `<i style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--rot:${(Math.random() * 540 - 270).toFixed(0)}deg;--f:${f};--s:${(0.7 + Math.random() * 0.9).toFixed(2)};--dauer:${(0.8 + Math.random() * 0.6).toFixed(2)}s">${z}</i>`;
  }
  box.innerHTML = html;
  wurzel.appendChild(box);
  setTimeout(() => box.remove(), 1700);
}
/** Großer Konfetti-Regen von oben (Ergebnisse, Mission, Level-up). */
function sternenregen(menge = 40) {
  if (fxStufe() !== 'voll') { glitzer(null, { anzahl: 18, gross: true }); return; }
  const wurzel = document.getElementById('effekte'); if (!wurzel) return;
  const box = document.createElement('div');
  box.className = 'sternenregen';
  let html = '';
  for (let i = 0; i < menge; i++) {
    const z = GLITZER_ZEICHEN[i % GLITZER_ZEICHEN.length], f = GLITZER_FARBEN[i % GLITZER_FARBEN.length];
    html += `<i style="left:${(Math.random() * 100).toFixed(1)}%;--f:${f};--s:${(0.8 + Math.random() * 1.1).toFixed(2)};--v:${(Math.random() * 0.8).toFixed(2)}s;--dauer:${(1.8 + Math.random() * 1.4).toFixed(2)}s;--dx:${(Math.random() * 120 - 60).toFixed(0)}px;--rot:${(Math.random() * 720 - 360).toFixed(0)}deg">${z}</i>`;
  }
  box.innerHTML = html;
  wurzel.appendChild(box);
  setTimeout(() => box.remove(), 3600);
}

/* ---------- Fliegende Punkte, Wackeln ---------- */
function punkteFlug(ziel, text) {
  if (fxStufe() === 'aus' || !ziel) return;
  const r = ziel.getBoundingClientRect(), wurzel = document.getElementById('effekte'); if (!wurzel) return;
  const el = document.createElement('div');
  el.className = 'punkte-flug'; el.textContent = text;
  el.style.left = (r.left + r.width / 2) + 'px'; el.style.top = (r.top - 6) + 'px';
  wurzel.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
function wackeln(el) {
  if (!el || fxStufe() === 'aus') return;
  el.classList.remove('wackeln'); void el.offsetWidth; el.classList.add('wackeln');
  setTimeout(() => el.classList.remove('wackeln'), 600);
}

/* ---------- Level-up ---------- */
let levelUpTimer = null;
function zeigeLevelUp(lv) {
  const wurzel = document.getElementById('effekte'); if (!wurzel) return;
  clearTimeout(levelUpTimer);
  const alt = wurzel.querySelector('.levelup'); if (alt) alt.remove();
  const el = document.createElement('div');
  el.className = 'levelup';
  el.setAttribute('role', 'status');
  el.innerHTML = `<div class="levelup-box"><strong>LEVEL UP!</strong><span>Level ${lv.nr} · ${esc(lv.name)}</span><small>Weiter so – du sammelst Sternenkraft!</small></div>`;
  wurzel.appendChild(el);
  sternenregen(46);
  ton('levelup');
  levelUpTimer = setTimeout(() => el.remove(), 2800);
}

/* ---------- Sterne-Wertung (wie in Spiel-Levels) ---------- */
function sterneHTML(anteil) {
  const n = anteil >= 0.9 ? 3 : anteil >= 0.7 ? 2 : anteil >= 0.4 ? 1 : 0;
  return `<div class="sterne-wertung" role="img" aria-label="${n} von 3 Sternen">${[0, 1, 2].map((i) => `<span class="${i < n ? 'an' : ''}">★</span>`).join('')}</div>`;
}

/* ---------- Töne (Web Audio, nur wenn eingeschaltet) ---------- */
let audio = null;
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
  } catch (e) { /* kein Ton möglich */ }
}

/* ---------- Effekte nach dem Zeichnen bestimmter Ansichten ---------- */
function effekteNachRender() {
  const n = ANSICHT.name;
  if (n === 'ergebnis' && ANSICHT.param && ANSICHT.param.eintrag && !ANSICHT.param.gefeiert) {
    ANSICHT.param.gefeiert = true;
    const e = ANSICHT.param.eintrag, anteil = e.max ? e.punkte / e.max : 0;
    if (anteil >= 0.5) { setTimeout(() => { sternenregen(anteil >= 0.9 ? 60 : 36); glitzer($('.ring'), { anzahl: 30, gross: true }); ton('fanfare'); }, 500); }
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
