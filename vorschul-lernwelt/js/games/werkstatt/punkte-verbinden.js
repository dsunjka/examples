/* ==========================================================================
   Spiel „Punkte verbinden“ ⭐ (Malwerkstatt)

   Didaktik:
   - Zahlenfolge sicher aufsagen und Ziffern wiedererkennen: Das Kind sucht
     die Punkte in der Reihenfolge 1, 2, 3 … Die Kopfzeile zeigt groß die
     nächste Zahl (👉 4) – so wird die Ziffer mit dem gesprochenen Zahlwort
     verknüpft. Jede angetippte Zahl wird vorgelesen.
   - Feinmotorik / Auge-Hand-Koordination: Antippen ODER mit dem Finger von
     Punkt zu Punkt ziehen (Linien wie mit dem Stift).
   - Neugier als Motor: „Was wird das wohl?“ – am Ende erscheint das fertige,
     farbige Bild und wird benannt.
   - Fehler sind erlaubt: Ein falscher Punkt wird sanft kommentiert („Das ist
     die Sieben. Wir suchen die Fünf.“), nach 2 Fehlern pulsiert der richtige.
   - Stufen: bis 5/6 → bis 10 → bis 15 → bis 20 Punkte.

   Bilder: Punktlisten im 100×100-Raster in Verbindungsreihenfolge
   (geschlossene Umrisse: der letzte Punkt wird automatisch mit der 1 verbunden),
   plus Deko-SVG, das nach dem Verbinden erscheint.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.werk;
  const S = W.svg;

  /** regelmäßiger Stern/Polygon: abwechselnde Radien */
  function starPts(cx, cy, n, r1, r2, rot = -90) {
    const out = [];
    for (let k = 0; k < n * (r2 ? 2 : 1); k++) {
      const a = ((rot + (k * 360) / (n * (r2 ? 2 : 1))) * Math.PI) / 180;
      const r = r2 && k % 2 ? r2 : r1;
      out.push([+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)]);
    }
    return out;
  }
  /** Pentagramm in einem Zug (5 Punkte, jeweils 144° weiter) */
  function pentagram(cx, cy, r) {
    const out = [];
    for (let k = 0; k < 5; k++) {
      const a = ((-90 + k * 144) * Math.PI) / 180;
      out.push([+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)]);
    }
    return out;
  }
  /** Bogenpunkte (für den Pilzhut) */
  function arcPts(cx, cy, rx, ry, a0, a1, step) {
    const out = [];
    for (let a = a0; a <= a1 + 0.01; a += step) {
      const r = (a * Math.PI) / 180;
      out.push([+(cx + rx * Math.cos(r)).toFixed(1), +(cy + ry * Math.sin(r)).toFixed(1)]);
    }
    return out;
  }

  /** Liegt q innerhalb des Polygons (Nonzero-Regel)? */
  function inside(poly, q) {
    let wn = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const cross = (b.x - a.x) * (q.y - a.y) - (q.x - a.x) * (b.y - a.y);
      if (a.y <= q.y) { if (b.y > q.y && cross > 0) wn++; } else if (b.y <= q.y && cross < 0) wn--;
    }
    return wn !== 0;
  }
  /** Richtung, in die die Nummer neben den Punkt gesetzt wird: nach außen, entlang der Winkelhalbierenden. */
  function labelDir(poly, i, cx, cy) {
    const p = poly[i];
    const a = poly[(i - 1 + poly.length) % poly.length];
    const c = poly[(i + 1) % poly.length];
    const n1 = { x: -(p.y - a.y), y: p.x - a.x };
    const n2 = { x: -(c.y - p.y), y: c.x - p.x };
    const l1 = Math.hypot(n1.x, n1.y) || 1, l2 = Math.hypot(n2.x, n2.y) || 1;
    let d = { x: n1.x / l1 + n2.x / l2, y: n1.y / l1 + n2.y / l2 };
    let len = Math.hypot(d.x, d.y);
    if (len < 0.2) { d = { x: p.x - cx, y: p.y - cy }; len = Math.hypot(d.x, d.y) || 1; }
    d = { x: d.x / len, y: d.y / len };
    if (inside(poly, { x: p.x + d.x * 2, y: p.y + d.y * 2 })) d = { x: -d.x, y: -d.y };
    return d;
  }

  function segDist(q, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const l2 = dx * dx + dy * dy || 1;
    const t = U.clamp(((q.x - a.x) * dx + (q.y - a.y) * dy) / l2, 0, 1);
    return Math.hypot(q.x - (a.x + t * dx), q.y - (a.y + t * dy));
  }
  /**
   * Nummern so neben die Punkte setzen, dass sie möglichst weit weg von anderen
   * Punkten, Linien und Nummern stehen (gierige Platzierung, Außenseite bevorzugt).
   */
  function placeLabels(pts, cx, cy, closed) {
    const edges = [];
    for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) edges.push([pts[i], pts[(i + 1) % pts.length]]);
    const placed = [];
    return pts.map((p, i) => {
      const pref = labelDir(pts, i, cx, cy);
      let best = null, bestScore = -Infinity;
      for (const r of [6.2, 7.6]) {
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          const q = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };
          if (q.x < -4 || q.x > 104 || q.y < -4 || q.y > 104) continue;
          let dDot = Infinity, dLab = Infinity, dEdge = Infinity;
          pts.forEach((o, j) => { if (j !== i) dDot = Math.min(dDot, W.dist(q, o)); });
          placed.forEach((o) => { dLab = Math.min(dLab, W.dist(q, o)); });
          edges.forEach(([e1, e2]) => { dEdge = Math.min(dEdge, segDist(q, e1, e2)); });
          const score = Math.min(dDot, dLab * 0.8, dEdge * 1.6 + 1.5, 9) + (Math.cos(a) * pref.x + Math.sin(a) * pref.y) * 0.8 - (r > 7 ? 0.6 : 0);
          if (score > bestScore) { bestScore = score; best = q; }
        }
      }
      placed.push(best);
      return best;
    });
  }

  /** Zahl als Nomen („die Fünf“) */
  const NUM = (k) => U.cap(U.numberWord(k));

  const INK = '#2b2d42';
  /* Bilder je Stufe. say = so wird das fertige Bild benannt. */
  const PICS = {
    1: [
      { id: 'stern5', say: 'ein Stern', e: '⭐', color: '#ffd23f', pts: pentagram(50, 54, 42), decor: '' },
      { id: 'haus', say: 'ein Haus', e: '🏠', color: '#ffb38a', pts: [[22, 88], [78, 88], [78, 46], [50, 16], [22, 46]],
        decor: `<polygon points="22,46 50,16 78,46" fill="#e5533d"/><rect x="42" y="64" width="16" height="24" rx="2" fill="#9c6b3f"/><rect x="28" y="54" width="11" height="11" fill="#bfe8ff" stroke="${INK}" stroke-width="1"/><rect x="61" y="54" width="11" height="11" fill="#bfe8ff" stroke="${INK}" stroke-width="1"/>` },
      { id: 'herz', say: 'ein Herz', e: '❤️', color: '#ff5f7a', pts: [[50, 88], [10, 46], [28, 16], [50, 34], [72, 16], [90, 46]],
        decor: `<path d="M50 88 L14 52 C2 38 10 16 28 16 C40 16 47 24 50 34 C53 24 60 16 72 16 C90 16 98 38 86 52 Z" fill="#ff5f7a"/><path d="M26 30 q4 -6 10 -6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>` },
      { id: 'diamant', say: 'ein Diamant', e: '💎', color: '#8fdcff', pts: [[30, 26], [70, 26], [88, 44], [50, 88], [12, 44]],
        decor: `<path d="M12 44 H88 M30 26 L40 44 L50 26 L60 44 L70 26 M40 44 L50 88 L60 44" fill="none" stroke="#3a8fc4" stroke-width="1.4"/>` },
      { id: 'segelboot', say: 'ein Segelboot', e: '⛵', color: '#bfe8ff', pts: [[50, 10], [80, 56], [90, 60], [76, 84], [26, 84], [12, 60]],
        decor: `<polygon points="52,14 80,56 52,56" fill="#fff" stroke="${INK}" stroke-width="1"/><polygon points="48,18 48,56 16,56" fill="#ffe08a" stroke="${INK}" stroke-width="1"/><line x1="50" y1="10" x2="50" y2="60" stroke="#7a4b24" stroke-width="2"/><polygon points="12,60 90,60 76,84 26,84" fill="#b5713a"/><path d="M0 92 q6 -5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="#4fc3f7" stroke-width="2"/>` },
    ],
    2: [
      { id: 'stern10', say: 'ein Stern', e: '⭐', color: '#ffd23f', pts: starPts(50, 54, 5, 42, 18), decor: '' },
      { id: 'fisch', say: 'ein Fisch', e: '🐟', color: '#ff9f43', pts: [[12, 52], [26, 36], [46, 28], [64, 38], [86, 22], [80, 52], [86, 82], [64, 66], [46, 76], [26, 68]],
        decor: `<circle cx="27" cy="47" r="4" fill="#fff"/><circle cx="26" cy="47" r="2" fill="${INK}"/><path d="M14 56 q5 3 9 0" fill="none" stroke="${INK}" stroke-width="1.2"/><path d="M44 36 q6 16 0 32 M54 38 q5 14 0 28" fill="none" stroke="#e07b1a" stroke-width="2"/>` },
      { id: 'rakete', say: 'eine Rakete', e: '🚀', color: '#e8ecf5', pts: [[50, 8], [62, 26], [62, 64], [76, 82], [58, 74], [42, 74], [24, 82], [38, 64], [38, 26]],
        decor: `<polygon points="42,74 50,96 58,74" fill="#ff9f43"/><polygon points="62,64 76,82 58,74" fill="#e5533d"/><polygon points="38,64 24,82 42,74" fill="#e5533d"/><path d="M50 8 L62 26 H38 Z" fill="#e5533d"/><circle cx="50" cy="42" r="7" fill="#8fdcff" stroke="${INK}" stroke-width="1.4"/>` },
      { id: 'krone', say: 'eine Krone', e: '👑', color: '#ffc533', pts: [[14, 80], [86, 80], [88, 30], [68, 52], [50, 20], [32, 52], [12, 30]],
        decor: `<rect x="14" y="68" width="72" height="12" fill="#e09b00"/><circle cx="32" cy="74" r="3.4" fill="#e5533d"/><circle cx="50" cy="74" r="3.4" fill="#4fc3f7"/><circle cx="68" cy="74" r="3.4" fill="#2ecc71"/><circle cx="50" cy="20" r="3" fill="#e5533d"/>` },
      { id: 'tanne7', say: 'ein Tannenbaum', e: '🌲', color: '#3dbe6b', pts: [[50, 10], [72, 44], [60, 44], [82, 78], [18, 78], [40, 44], [28, 44]],
        decor: `<rect x="44" y="78" width="12" height="14" fill="#9c6b3f"/><circle cx="44" cy="58" r="3" fill="#e5533d"/><circle cx="60" cy="68" r="3" fill="#ffd23f"/><circle cx="52" cy="34" r="3" fill="#4fc3f7"/>` },
      { id: 'katzenkopf', say: 'eine Katze', e: '🐱', color: '#ffb35c', pts: [[22, 40], [26, 12], [42, 30], [58, 30], [74, 12], [78, 40], [84, 60], [70, 82], [30, 82], [16, 60]],
        decor: `<polygon points="28,20 30,34 38,30" fill="#ffc9c9"/><polygon points="72,20 70,34 62,30" fill="#ffc9c9"/><ellipse cx="38" cy="52" rx="4" ry="5" fill="${INK}"/><ellipse cx="62" cy="52" rx="4" ry="5" fill="${INK}"/><polygon points="46,62 54,62 50,67" fill="#ff7a8a"/><path d="M50 67 q-4 6 -9 3 M50 67 q4 6 9 3 M30 62 H12 M30 67 L13 72 M70 62 H88 M70 67 L87 72" fill="none" stroke="${INK}" stroke-width="1.2"/>` },
      { id: 'auto', say: 'ein Auto', e: '🚗', color: '#e5533d', pts: [[8, 72], [8, 56], [20, 50], [32, 30], [68, 30], [80, 50], [92, 54], [92, 72]],
        decor: `<polygon points="36,34 48,34 48,50 26,50" fill="#bfe8ff"/><polygon points="52,34 65,34 75,50 52,50" fill="#bfe8ff"/><circle cx="28" cy="72" r="9" fill="${INK}"/><circle cx="28" cy="72" r="3.5" fill="#ccc"/><circle cx="72" cy="72" r="9" fill="${INK}"/><circle cx="72" cy="72" r="3.5" fill="#ccc"/><rect x="86" y="57" width="6" height="5" fill="#ffd23f"/>` },
    ],
    3: [
      { id: 'tanne15', say: 'ein Tannenbaum', e: '🌲', color: '#2fa35a', pts: [[50, 8], [66, 30], [58, 30], [74, 52], [62, 52], [80, 74], [56, 74], [56, 90], [44, 90], [44, 74], [20, 74], [38, 52], [26, 52], [42, 30], [34, 30]],
        decor: `<rect x="44" y="74" width="12" height="16" fill="#9c6b3f"/><polygon points="${starPts(50, 8, 5, 6, 2.6).join(' ')}" fill="#ffd23f" stroke="#e09b00" stroke-width=".8"/><circle cx="46" cy="40" r="2.6" fill="#e5533d"/><circle cx="58" cy="60" r="2.6" fill="#4fc3f7"/><circle cx="38" cy="64" r="2.6" fill="#ffd23f"/><circle cx="54" cy="46" r="2.6" fill="#fff"/>` },
      { id: 'schiff', say: 'ein Schiff', e: '🚢', color: '#e5533d', pts: [[6, 60], [26, 60], [26, 44], [40, 44], [40, 28], [50, 28], [50, 44], [64, 44], [64, 60], [94, 60], [80, 82], [20, 82]],
        decor: `<rect x="26" y="44" width="38" height="16" fill="#fff"/><rect x="40" y="28" width="10" height="16" fill="${INK}"/><rect x="40" y="33" width="10" height="4" fill="#e5533d"/><circle cx="33" cy="52" r="2.6" fill="#8fdcff"/><circle cx="45" cy="52" r="2.6" fill="#8fdcff"/><circle cx="57" cy="52" r="2.6" fill="#8fdcff"/><path d="M0 90 q6 -5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="#4fc3f7" stroke-width="2"/>` },
      { id: 'pilz', say: 'ein Pilz', e: '🍄', color: '#e5533d', pts: arcPts(50, 54, 40, 36, 180, 360, 30).concat([[62, 54], [64, 88], [36, 88], [38, 54]]),
        decor: `<polygon points="62,54 64,88 36,88 38,54" fill="#fff3dc"/><circle cx="34" cy="36" r="5" fill="#fff"/><circle cx="56" cy="28" r="4" fill="#fff"/><circle cx="70" cy="42" r="4.5" fill="#fff"/><circle cx="20" cy="48" r="3" fill="#fff"/><circle cx="48" cy="45" r="3" fill="#fff"/>` },
      { id: 'hase', say: 'ein Hase', e: '🐰', color: '#d9d4cc', pts: [[40, 48], [30, 10], [44, 8], [46, 42], [54, 42], [56, 8], [70, 10], [60, 48], [72, 62], [68, 82], [50, 90], [32, 82], [28, 62]],
        decor: `<path d="M38 40 L34 16 L41 15 L43 40 Z M62 40 L66 16 L59 15 L57 40 Z" fill="#ffc9c9"/><circle cx="42" cy="62" r="3.2" fill="${INK}"/><circle cx="58" cy="62" r="3.2" fill="${INK}"/><ellipse cx="50" cy="71" rx="3.4" ry="2.4" fill="#ff7a8a"/><path d="M50 73 v4 M44 72 H30 M44 75 L31 79 M56 72 H70 M56 75 L69 79" fill="none" stroke="${INK}" stroke-width="1.1"/>` },
      { id: 'rakete13', say: 'eine Rakete', e: '🚀', color: '#e8ecf5', pts: [[50, 6], [60, 16], [64, 30], [64, 60], [78, 74], [78, 88], [64, 80], [36, 80], [22, 88], [22, 74], [36, 60], [36, 30], [40, 16]],
        decor: `<polygon points="40,80 50,98 60,80" fill="#ff9f43"/><polygon points="64,60 78,74 78,88 64,80" fill="#8e6cef"/><polygon points="36,60 22,74 22,88 36,80" fill="#8e6cef"/><path d="M50 6 L60 16 L64 30 H36 L40 16 Z" fill="#8e6cef"/><circle cx="50" cy="46" r="8" fill="#8fdcff" stroke="${INK}" stroke-width="1.4"/>` },
      { id: 'katze', say: 'eine Katze', e: '🐱', color: '#9aa0b5', pts: [[28, 8], [40, 22], [56, 22], [68, 8], [70, 30], [64, 44], [74, 60], [78, 88], [18, 88], [22, 60], [32, 44], [26, 30]],
        decor: `<path d="M76 84 C96 84 98 60 88 52" fill="none" stroke="#7d8399" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="30" r="3" fill="${INK}"/><circle cx="56" cy="30" r="3" fill="${INK}"/><polygon points="45,36 51,36 48,40" fill="#ff7a8a"/><path d="M38 38 H24 M58 38 H72 M40 88 V74 M56 88 V74" fill="none" stroke="${INK}" stroke-width="1.1"/>` },
      { id: 'lok', say: 'eine Lokomotive', e: '🚂', color: '#2e7dd7', pts: [[8, 78], [8, 22], [40, 22], [40, 40], [66, 40], [64, 20], [78, 20], [76, 40], [90, 40], [90, 64], [96, 78]],
        decor: `<rect x="14" y="28" width="20" height="12" fill="#bfe8ff"/><rect x="3" y="18" width="42" height="5" fill="${INK}"/><circle cx="24" cy="80" r="9" fill="${INK}"/><circle cx="24" cy="80" r="3.5" fill="#ccc"/><circle cx="56" cy="82" r="7" fill="${INK}"/><circle cx="76" cy="82" r="7" fill="${INK}"/><circle cx="72" cy="12" r="4" fill="#ddd"/><circle cx="80" cy="7" r="3" fill="#eee"/>` },
    ],
    4: [
      { id: 'schmetterling', say: 'ein Schmetterling', e: '🦋', color: '#8e6cef', pts: [[50, 30], [66, 14], [86, 12], [88, 30], [74, 48], [88, 64], [80, 84], [60, 78], [50, 64], [40, 78], [20, 84], [12, 64], [26, 48], [12, 30], [14, 12], [34, 14]],
        decor: `<ellipse cx="50" cy="52" rx="4" ry="22" fill="${INK}"/><circle cx="50" cy="28" r="5" fill="${INK}"/><path d="M48 24 Q42 12 36 8 M52 24 Q58 12 64 8" fill="none" stroke="${INK}" stroke-width="1.4"/><circle cx="30" cy="30" r="6" fill="#ffd23f"/><circle cx="70" cy="30" r="6" fill="#ffd23f"/><circle cx="30" cy="66" r="5" fill="#ff7ab8"/><circle cx="70" cy="66" r="5" fill="#ff7ab8"/>` },
      { id: 'burg', say: 'eine Burg', e: '🏰', color: '#b8b2a7', pts: [[4, 92], [4, 14], [14, 14], [14, 26], [26, 26], [26, 14], [36, 14], [36, 44], [64, 44], [64, 14], [74, 14], [74, 26], [86, 26], [86, 14], [96, 14], [96, 92]],
        decor: `<path d="M40 92 V72 a10 10 0 0 1 20 0 V92 Z" fill="#7a4b24"/><rect x="16" y="42" width="8" height="12" rx="4" fill="${INK}"/><rect x="76" y="42" width="8" height="12" rx="4" fill="${INK}"/><line x1="50" y1="44" x2="50" y2="26" stroke="${INK}" stroke-width="1.4"/><polygon points="50,26 62,30 50,34" fill="#e5533d"/>` },
      { id: 'dino', say: 'ein Dino', e: '🦕', color: '#3dbe6b', pts: [[90, 26], [76, 30], [70, 56], [70, 82], [60, 82], [58, 66], [40, 66], [38, 82], [28, 82], [26, 64], [6, 74], [20, 52], [34, 38], [52, 38], [64, 40], [72, 16], [82, 12]],
        decor: `<circle cx="80" cy="19" r="2.4" fill="${INK}"/><path d="M84 25 q3 1 5 0" fill="none" stroke="${INK}" stroke-width="1"/><circle cx="40" cy="50" r="3.4" fill="#2a9a52"/><circle cx="52" cy="54" r="2.6" fill="#2a9a52"/><circle cx="30" cy="54" r="2.4" fill="#2a9a52"/>` },
      { id: 'elefant', say: 'ein Elefant', e: '🐘', color: '#a7b0c4', pts: [[30, 28], [16, 32], [10, 50], [8, 74], [16, 76], [18, 56], [26, 60], [30, 86], [42, 86], [44, 70], [66, 70], [68, 86], [80, 86], [82, 66], [90, 72], [84, 52], [80, 36], [60, 24], [44, 24]],
        decor: `<path d="M34 32 C48 28 52 44 48 56 C44 64 34 62 32 54 Z" fill="#8d97ad"/><circle cx="24" cy="40" r="2.4" fill="${INK}"/><path d="M22 58 q2 6 8 6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>` },
    ],
  };

  /* ------------------------------------------------------------------
     Spiel
     ------------------------------------------------------------------ */
  LT.registerGame({
    id: 'punkte-verbinden',
    area: 'werkstatt',
    title: 'Punkte verbinden',
    icon: '⭐',
    levels: 4,
    rounds: 3,
    parent: {
      skill: 'Zahlenfolge & Feinmotorik',
      goal: 'Ihr Kind verbindet nummerierte Punkte der Reihe nach. Dabei übt es die Zahlenreihe, erkennt Ziffern wieder (die nächste Zahl wird groß angezeigt und vorgelesen) und führt kontrollierte Linien – eine wichtige Vorübung für das Schreiben.',
      levels: ['Bis 5 oder 6 Punkte (Stern, Haus, Herz …)', 'Bis 10 Punkte', 'Bis 15 Punkte', 'Bis 20 Punkte'],
      tip: 'Malen Sie selbst kleine Punktbilder auf Papier (z. B. ein Haus mit 5 Punkten) und lassen Sie Ihr Kind sie mit Stift verbinden. Zählen Sie dabei laut mit.',
    },

    async task(ctx) {
      const pool = PICS[ctx.level] || PICS[1];
      const pic = U.pickFresh('pv-' + ctx.level, pool, Math.min(3, pool.length - 1), (p) => p.id);
      await play(ctx, pic);
    },
  });

  async function play(ctx, pic) {
    const n = pic.pts.length;
    const pts = pic.pts.map((p) => ({ x: p[0], y: p[1] }));
    const cx = U.sum(pts.map((p) => p.x)) / n;
    const cy = U.sum(pts.map((p) => p.y)) / n;

    // --- Aufbau ---
    const nextNum = el('span.pv-next-num', '1');
    const head = el('button.pv-head', { type: 'button', 'aria-label': 'Nächste Zahl anhören' }, U.emoji('👉', 'pv-point'), nextNum);
    const area = el('div.pv-area');
    ctx.stage.classList.add('pv-stage');
    ctx.stage.appendChild(el('div.pv-wrap', head, area));

    const svg = S('svg', { class: 'pv-board', viewBox: '-7 -7 114 114', role: 'img', 'aria-label': 'Punktebild' });
    const fill = S('polygon', { class: 'pv-fill', points: pts.map((p) => `${p.x},${p.y}`).join(' '), fill: pic.color });
    const decor = S('g', { class: 'pv-decor' });
    decor.innerHTML = pic.decor || '';
    const linesG = S('g', { class: 'pv-lines' });
    const rubber = S('line', { class: 'pv-rubber' });
    const dotsG = S('g', { class: 'pv-dots' });
    svg.append(fill, decor, linesG, rubber, dotsG);
    area.appendChild(svg);
    W.fit(ctx, area, svg, 1);

    const labels = placeLabels(pts, cx, cy, pic.closed !== false);
    const dots = pts.map((p, i) => {
      const lx = labels[i].x;
      const ly = labels[i].y;
      const g = S('g', { class: 'pv-dot' + (i === 0 ? ' first' : ''), 'data-n': i + 1 },
        S('circle', { class: 'pv-hit', cx: p.x, cy: p.y, r: 5.5 }),
        S('circle', { class: 'pv-ring', cx: p.x, cy: p.y, r: 3.8 }),
        S('circle', { class: 'pv-pt', cx: p.x, cy: p.y, r: 2.1 }),
        S('text', { class: 'pv-num', x: lx, y: ly, text: String(i + 1) }));
      dotsG.appendChild(g);
      return g;
    });

    let expected = 0; // Index des nächsten Punkts
    let finished = false;
    let resolveDone;
    const done = new Promise((r) => (resolveDone = r));
    let wrongBusy = false;

    function setNext() {
      dots.forEach((d) => { ctx.markTest(d, false); d.classList.remove('pv-hinted'); });
      if (finished) return;
      nextNum.textContent = String(expected + 1);
      ctx.markTest(dots[expected]);
    }

    function addLine(a, b) {
      const ln = S('line', { class: 'pv-line', x1: pts[a].x, y1: pts[a].y, x2: pts[b].x, y2: pts[b].y });
      linesG.appendChild(ln);
    }

    function connect(i) {
      if (finished || i !== expected) return false;
      dots[i].classList.add('done');
      dots[i].classList.remove('first');
      if (i > 0) addLine(i - 1, i);
      LT.sfx.tone(440 + Math.min(i, 20) * 22, 0.08, { type: 'triangle', volume: 0.3 });
      ctx.say(U.numberWord(i + 1));
      expected++;
      if (expected >= n) {
        finished = true;
        if (pic.closed !== false) addLine(n - 1, 0);
        setNext();
        resolveDone();
      } else setNext();
      return true;
    }

    /** nächstgelegener Punkt (Index) innerhalb von maxD, sonst -1 */
    function nearest(p, maxD) {
      let best = -1, bd = maxD;
      pts.forEach((q, i) => {
        const d = W.dist(p, q);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }

    async function wrongDot(i) {
      if (wrongBusy) return;
      wrongBusy = true;
      const isDone = dots[i].classList.contains('done');
      const say = isDone
        ? `Die ${NUM(i + 1)} hast du schon. Wir suchen die ${NUM(expected + 1)}.`
        : `Das ist die ${NUM(i + 1)}. Wir suchen die ${NUM(expected + 1)}.`;
      const k = await ctx.wrong(dots[i], { say });
      if (k >= 2 && !finished) {
        dots[expected].classList.add('pv-hinted');
      }
      wrongBusy = false;
    }

    // --- Bedienung: Antippen oder Ziehen ---
    let pointer = null;
    ctx.listen(svg, 'pointerdown', (e) => {
      if (finished || pointer !== null) return;
      e.preventDefault();
      const p = W.toLocal(svg, e);
      // der gesuchte Punkt darf großzügig getroffen werden
      if (W.dist(p, pts[expected]) <= 9) {
        connect(expected);
      } else {
        const i = nearest(p, 7);
        if (i < 0) return;
        if (i === expected - 1) { /* letzten Punkt erneut berührt: Weiterziehen erlaubt */ } else {
          wrongDot(i);
          return;
        }
      }
      pointer = e.pointerId;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
    });
    ctx.listen(svg, 'pointermove', (e) => {
      if (e.pointerId !== pointer || finished) return;
      const p = W.toLocal(svg, e);
      const last = pts[expected - 1];
      if (last) {
        rubber.setAttribute('x1', last.x); rubber.setAttribute('y1', last.y);
        rubber.setAttribute('x2', p.x); rubber.setAttribute('y2', p.y);
        rubber.classList.add('on');
      }
      if (W.dist(p, pts[expected]) <= 6) connect(expected);
    });
    const up = (e) => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      rubber.classList.remove('on');
    };
    ctx.listen(svg, 'pointerup', up);
    ctx.listen(svg, 'pointercancel', up);
    // Klick (Tastatur/Testmodus): nur der gesuchte Punkt zählt, sonst nichts tun
    dots.forEach((d, i) => d.addEventListener('click', () => connect(i)));
    head.addEventListener('click', () => { if (!finished) ctx.say(`Such die ${NUM(expected + 1)}.`); });

    setNext();
    ctx.instruct(ctx.index === 0
      ? `Verbinde die Punkte der Reihe nach. Fang bei der Eins an, dann die Zwei, die Drei und so weiter. Was wird das wohl?`
      : `Verbinde die Punkte von der Eins bis zur ${NUM(n)}. Was wird das wohl?`);

    await done;
    if (!ctx.active) return;
    // --- Auflösung: Bild erscheint ---
    rubber.classList.remove('on');
    svg.classList.add('pv-reveal');
    head.replaceChildren(U.emoji(pic.e, 'pv-pic-emoji'), el('span.pv-pic-name', U.cap(pic.say.split(' ').slice(1).join(' '))));
    head.classList.add('solved');
    await ctx.sleep(500);
    await ctx.correct(svg, { say: `Super! Das ist ${pic.say}!` });
  }

  LT.werk.pvPics = PICS;
  LT.werk.placeLabels = placeLabels;
})();
