/* ==========================================================================
   Spiel „Nachspuren“ ✍️ (Malwerkstatt)

   Didaktik:
   - Graphomotorik vor dem Schreiben: Das Kind fährt mit dem Finger eine
     gestrichelte Vorlage nach. Die eigene „Tinte“ erscheint sofort, der schon
     richtig nachgespurte Teil leuchtet golden – das Kind sieht seinen Fortschritt.
   - Bewegungsrichtung und Strichreihenfolge sind beim Schreibenlernen wichtig
     (flüssiges Schreiben, später verbundene Schrift). Deshalb: grüner
     Startpunkt mit Strich-Nummer, ein Pfeil zeigt laufend die Richtung,
     Kontrollpunkte müssen je Strich in der richtigen Reihenfolge erreicht werden.
   - Kein Frust: sehr großzügige Toleranz (die gelbe „Straße“), Absetzen ist
     erlaubt – es geht an derselben Stelle weiter. Wer zweimal danebenmalt,
     bekommt die Bewegung vorgemacht (Finger fährt den Weg vor) und die Toleranz
     wird noch größer. Der 💡-Knopf zeigt den Weg jederzeit.
   - Stufen: 1 Schwungübungen (Linie, Welle, Zickzack, Bögen, Girlanden,
     Schleifen, Kreis, Spirale) → 2 Ziffern 0–9 → 3 Großbuchstaben (Druckschrift)
     → 4 Kleinbuchstaben in der Lineatur → 5 Mein Name / kurze Wörter.
   - Nach dem Nachspuren wird benannt, was entstanden ist („Das ist eine Drei!“,
     „M wie Maus!“) – Form, Name und Laut werden verknüpft.

   Datenformat: Jedes Zeichen besteht aus Strichen; ein Strich ist eine
   Polylinie im 100×100-Raster (x nach rechts, y nach unten) in Schreibrichtung.
   Großbuchstaben/Ziffern: Oberlinie y=15, Grundlinie y=85.
   Kleinbuchstaben: Oberlänge y=12, Mittellinie (x-Höhe) y=42, Grundlinie y=72,
   Unterlänge y=94. Bögen werden als Kreis-/Ellipsenbögen erzeugt
   (Winkel in Grad, 0° = rechts, 90° = unten, 270° = oben; wachsender Winkel =
   im Uhrzeigersinn, fallender Winkel = gegen den Uhrzeigersinn).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.werk;
  const S = W.svg;

  /* ------------------------------------------------------------------
     Bausteine für die Strichdaten
     ------------------------------------------------------------------ */
  /** Gerade Strecken: L(x1,y1, x2,y2, …) */
  const L = (...c) => {
    const out = [];
    for (let i = 0; i < c.length; i += 2) out.push([c[i], c[i + 1]]);
    return out;
  };
  /** Ellipsenbogen von a0 nach a1 (Grad). */
  const A = (cx, cy, rx, ry, a0, a1) => {
    const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 6));
    const out = [];
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    }
    return out;
  };
  /** Kubische Bézierkurve. */
  const C = (p0, p1, p2, p3, n = 16) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const m = 1 - t;
      out.push([
        m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
        m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
    return out;
  };
  /** Teilstücke zu EINEM Strich verbinden (doppelte Nahtpunkte entfernen). */
  const J = (...parts) => {
    const out = [];
    for (const part of parts) {
      for (const p of part) {
        const last = out[out.length - 1];
        if (last && Math.hypot(last[0] - p[0], last[1] - p[1]) < 0.6) continue;
        out.push(p);
      }
    }
    return out;
  };
  /** Punkt (z. B. i-Punkt): Strich aus einem einzigen Punkt = antippen. */
  const DOT = (x, y) => [[x, y]];
  /** Punktliste in einen Zielkasten einpassen (für Schwungübungen). */
  const fitBox = (pts, x0, y0, x1, y1) => {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const s = Math.min((x1 - x0) / (maxX - minX || 1), (y1 - y0) / (maxY - minY || 1));
    const ox = (x0 + x1) / 2 - ((minX + maxX) / 2) * s;
    const oy = (y0 + y1) / 2 - ((minY + maxY) / 2) * s;
    return pts.map((p) => [p[0] * s + ox, p[1] * s + oy]);
  };

  /* ------------------------------------------------------------------
     Stufe 1: Schwungübungen – mit kleiner Geschichte (Tier läuft mit)
     ------------------------------------------------------------------ */
  function sine() {
    const out = [];
    for (let x = 10; x <= 90; x += 2) out.push([x, 50 - 15 * Math.sin(((x - 10) / 40) * 2 * Math.PI)]);
    return out;
  }
  function loops() {
    const out = [];
    const a = 3.4, b = 12;
    for (let t = -Math.PI; t <= 5 * Math.PI + 0.001; t += Math.PI / 18) out.push([a * t - b * Math.sin(t), -b * Math.cos(t)]);
    return fitBox(out, 10, 26, 90, 72);
  }
  function spiral() {
    const out = [];
    const turns = 2.25;
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const a = (-90 - f * turns * 360) * Math.PI / 180; // gegen den Uhrzeigersinn
      const r = 36 - f * 30;
      out.push([50 + r * Math.cos(a), 52 + r * Math.sin(a)]);
    }
    return out;
  }

  const SCHWUNG = [
    { id: 'linie', grp: 0, strokes: [L(12, 50, 88, 50)], walker: '🐛', goal: '🍏',
      say: 'Hilf der Raupe zum Apfel. Zieh eine gerade Linie.', done: 'Super! Eine schöne gerade Linie!' },
    { id: 'senkrecht', grp: 0, strokes: [L(50, 14, 50, 80)], walker: '🍎', goal: '🧺',
      say: 'Der Apfel fällt vom Baum in den Korb. Zieh eine Linie von oben nach unten.', done: 'Prima! Gerade von oben nach unten!' },
    { id: 'welle', grp: 0, strokes: [sine()], walker: '🐟', goal: '🐚',
      say: 'Der Fisch schwimmt durch die Wellen. Fahr die Welle nach.', done: 'Toll! Was für schöne Wellen!' },
    { id: 'zickzack', grp: 1, strokes: [L(10, 64, 23, 36, 36, 64, 49, 36, 62, 64, 75, 36, 88, 64)], walker: '🐝', goal: '🌻',
      say: 'Die Biene fliegt im Zickzack zur Blume. Fahr den Zickzack nach.', done: 'Klasse! Ein toller Zickzack!' },
    { id: 'girlande', grp: 1, strokes: [J(A(23.5, 42, 13.5, 20, 180, 0), A(50.5, 42, 13.5, 20, 180, 0), A(77.5, 42, 13.5, 20, 180, 0))], walker: '🐒', goal: '🍌',
      say: 'Der Affe schwingt von Ast zu Ast. Fahr die Schaukel-Bögen nach.', done: 'Super! Schöne Girlanden!' },
    { id: 'boegen', grp: 1, strokes: [J(A(23.5, 64, 13.5, 22, 180, 360), A(50.5, 64, 13.5, 22, 180, 360), A(77.5, 64, 13.5, 22, 180, 360))], walker: '🐇', goal: '🥕',
      say: 'Der Hase hüpft zur Möhre. Hüpf mit dem Finger über die Bögen.', done: 'Hopp, hopp! Tolle Bögen!' },
    { id: 'schleifen', grp: 2, strokes: [loops()], walker: '🦋', goal: '🌸',
      say: 'Der Schmetterling fliegt Schleifen. Fahr die Schleifen nach.', done: 'Wunderbar! Schöne Schleifen!' },
    { id: 'kreis', grp: 2, strokes: [A(50, 50, 32, 32, 270, -90)], walker: '🚗', goal: null,
      say: 'Das Auto fährt im Kreisverkehr. Fahr einmal rundherum.', done: 'Super! Ein runder Kreis!' },
    { id: 'spirale', grp: 2, strokes: [spiral()], walker: '🐌', goal: null,
      say: 'Die Schnecke kriecht in ihr Haus. Fahr die Spirale nach, bis in die Mitte.', done: 'Toll! Eine Schnecken-Spirale!' },
  ];

  /* ------------------------------------------------------------------
     Stufe 2: Ziffern 0–9 (Schreibrichtung wie in der Grundschule)
     ------------------------------------------------------------------ */
  const DIGITS = {
    0: [A(50, 50, 23, 35, 270, -90)], // oben beginnen, nach links herum
    1: [L(33, 33, 56, 15, 56, 85)], // kurzer Aufstrich, dann gerade nach unten
    2: [J(A(50, 35, 20, 20, 200, 380), L(68.8, 41.8, 30, 85, 72, 85))],
    3: [J(A(48, 32, 18, 17, 210, 450), A(48, 67, 19, 18, 270, 510))],
    4: [L(50, 15, 26, 60, 76, 60), L(62, 34, 62, 85)], // schräg runter, nach rechts – dann Strich von oben
    5: [J(L(34, 15, 33, 46), A(48, 63, 20, 22, 232, 510)), L(34, 15, 70, 15)], // Hals und Bauch, dann das Dach
    6: [J(C([66, 16], [44, 20], [30, 42], [30, 66]), A(50, 66, 20, 19, 180, -180))],
    7: [L(28, 15, 72, 15, 42, 85)],
    8: [J(A(50, 32, 17, 17, 330, 90), A(50, 67, 20, 18, 270, 630), A(50, 32, 17, 17, 90, -30))],
    9: [J(A(50, 34, 19, 19, 0, -360), L(69, 34, 66, 85))],
  };
  const DIGIT_NAMES = ['Null', 'Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun'];

  /* ------------------------------------------------------------------
     Stufe 3: Großbuchstaben (Druckschrift)
     ------------------------------------------------------------------ */
  const CAPS = {
    A: [L(50, 15, 26, 85), L(50, 15, 74, 85), L(35, 60, 65, 60)],
    B: [L(30, 15, 30, 85), J(L(30, 15, 52, 15), A(52, 32.5, 17, 17.5, 270, 450), L(52, 50, 30, 50, 54, 50), A(54, 67.5, 18, 17.5, 270, 450), L(54, 85, 30, 85))],
    C: [A(54, 50, 26, 35, -40, -320)],
    D: [L(30, 15, 30, 85), J(L(30, 15, 42, 15), A(42, 50, 28, 35, 270, 450), L(42, 85, 30, 85))],
    E: [L(32, 15, 32, 85), L(32, 15, 70, 15), L(32, 50, 64, 50), L(32, 85, 70, 85)],
    F: [L(32, 15, 32, 85), L(32, 15, 70, 15), L(32, 50, 64, 50)],
    G: [J(A(54, 50, 26, 35, -40, -360), L(80, 50, 60, 50))],
    H: [L(28, 15, 28, 85), L(72, 15, 72, 85), L(28, 50, 72, 50)],
    I: [L(50, 15, 50, 85)],
    J: [J(L(62, 15, 62, 66), A(46, 66, 16, 19, 0, 180))],
    K: [L(32, 15, 32, 85), L(70, 15, 33, 52, 72, 85)],
    L: [L(32, 15, 32, 85, 70, 85)],
    M: [L(24, 15, 24, 85), L(24, 15, 50, 58, 76, 15, 76, 85)],
    N: [L(28, 15, 28, 85), L(28, 15, 72, 85, 72, 15)],
    O: [A(50, 50, 28, 35, 270, -90)],
    P: [L(30, 15, 30, 85), J(L(30, 15, 50, 15), A(50, 33, 18, 18, 270, 450), L(50, 51, 30, 51))],
    Q: [A(50, 50, 28, 35, 270, -90), L(56, 68, 78, 90)],
    R: [L(30, 15, 30, 85), J(L(30, 15, 50, 15), A(50, 33, 18, 18, 270, 450), L(50, 51, 30, 51)), L(46, 51, 72, 85)],
    S: [J(A(50, 32, 20, 17, -30, -270), A(50, 67, 21, 18, 270, 510))],
    T: [L(26, 15, 74, 15), L(50, 15, 50, 85)],
    U: [J(L(28, 15, 28, 62), A(50, 62, 22, 23, 180, 0), L(72, 62, 72, 15))],
    V: [L(26, 15, 50, 85, 74, 15)],
    W: [L(16, 15, 33, 85, 50, 36, 67, 85, 84, 15)],
    X: [L(28, 15, 72, 85), L(72, 15, 28, 85)],
    Y: [L(28, 15, 50, 50, 50, 85), L(72, 15, 50, 50)],
    Z: [L(28, 15, 72, 15, 28, 85, 72, 85)],
  };
  // Umlaute (für Namen): Grundbuchstabe + zwei Punkte darüber
  CAPS['Ä'] = CAPS.A.concat([DOT(40, 6), DOT(60, 6)]);
  CAPS['Ö'] = CAPS.O.concat([DOT(40, 6), DOT(60, 6)]);
  CAPS['Ü'] = CAPS.U.concat([DOT(40, 6), DOT(60, 6)]);

  /* ------------------------------------------------------------------
     Stufe 4: Kleinbuchstaben (Druckschrift, Lineatur)
     ------------------------------------------------------------------ */
  const RING = A(48, 57, 15, 15, -30, -390); // Kreis für a, d, g, q: rechts oben beginnen, gegen den Uhrzeigersinn
  const LOWER = {
    a: [RING, L(63, 42, 63, 72)],
    b: [L(34, 12, 34, 72), A(49, 57, 15, 15, 180, 540)],
    c: [A(50, 57, 15, 15, -40, -320)],
    d: [RING, L(63, 12, 63, 72)],
    e: [J(L(35, 57, 65, 57), A(50, 57, 15, 15, 0, -320))],
    f: [J(A(56, 22, 10, 10, -30, -180), L(46, 22, 46, 72)), L(36, 42, 60, 42)],
    g: [RING, J(L(63, 42, 63, 84), A(49, 84, 14, 10, 0, 180))],
    h: [J(L(34, 12, 34, 72, 34, 56), A(49, 56, 15, 14, 180, 360), L(64, 56, 64, 72))],
    i: [L(50, 42, 50, 72), DOT(50, 28)],
    j: [J(L(56, 42, 56, 84), A(44, 84, 12, 10, 0, 180)), DOT(56, 28)],
    k: [L(36, 12, 36, 72), L(62, 42, 37, 60, 64, 72)],
    l: [L(50, 12, 50, 72)],
    m: [J(L(26, 42, 26, 72, 26, 54), A(37.5, 54, 11.5, 12, 180, 360), L(49, 54, 49, 72, 49, 54), A(60.5, 54, 11.5, 12, 180, 360), L(72, 54, 72, 72))],
    n: [J(L(32, 42, 32, 72, 32, 56), A(48, 56, 16, 14, 180, 360), L(64, 56, 64, 72))],
    o: [A(50, 57, 15, 15, 270, -90)],
    p: [L(34, 42, 34, 94), A(49, 57, 15, 15, 180, 540)],
    q: [RING, L(63, 42, 63, 94)],
    r: [J(L(36, 42, 36, 72, 36, 54), A(50, 54, 14, 12, 180, 315))],
    s: [J(A(50, 49.5, 13, 7.5, -30, -270), A(50, 64.5, 14, 7.5, 270, 510))],
    t: [J(L(46, 20, 46, 66), A(54, 66, 8, 6, 180, 30)), L(36, 42, 60, 42)],
    u: [J(L(34, 42, 34, 58), A(49, 58, 15, 14, 180, 0), L(64, 58, 64, 42, 64, 72))],
    v: [L(34, 42, 50, 72, 66, 42)],
    w: [L(24, 42, 37, 72, 50, 48, 63, 72, 76, 42)],
    x: [L(36, 42, 64, 72), L(64, 42, 36, 72)],
    y: [L(34, 42, 50, 72), L(66, 42, 40, 94)],
    z: [L(36, 42, 64, 42, 36, 72, 64, 72)],
  };

  /* Buchstabennamen (so spricht man sie beim Buchstabieren; lautgetreu geschrieben,
     damit die Sprachausgabe sie richtig ausspricht) und Anlautwörter */
  const LETTER_NAME = {
    A: 'A', B: 'Beh', C: 'Zeh', D: 'Deh', E: 'E', F: 'Ef', G: 'Geh', H: 'Ha', I: 'I', J: 'Jott', K: 'Ka', L: 'El', M: 'Em',
    N: 'En', O: 'O', P: 'Peh', Q: 'Ku', R: 'Err', S: 'Es', T: 'Teh', U: 'U', V: 'Vau', W: 'Weh', X: 'Ix', Y: 'Ypsilon', Z: 'Zett',
    'Ä': 'Ä', 'Ö': 'Ö', 'Ü': 'Ü',
  };
  // pos: Position des Buchstabens im Wort (für die Hervorhebung), meist 0 = Anlaut
  const ANCHOR = {
    A: { w: 'Affe', e: '🐒' }, B: { w: 'Banane', e: '🍌' }, C: { w: 'Computer', e: '💻' }, D: { w: 'Dino', e: '🦕' },
    E: { w: 'Elefant', e: '🐘' }, F: { w: 'Fisch', e: '🐟' }, G: { w: 'Giraffe', e: '🦒' }, H: { w: 'Haus', e: '🏠' },
    I: { w: 'Igel', e: '🦔' }, J: { w: 'Jojo', e: '🪀' }, K: { w: 'Katze', e: '🐱' }, L: { w: 'Löwe', e: '🦁' },
    M: { w: 'Maus', e: '🐭' }, N: { w: 'Nase', e: '👃' }, O: { w: 'Ohr', e: '👂' }, P: { w: 'Pinguin', e: '🐧' },
    Q: { w: 'Quadrat', e: '🟦' }, R: { w: 'Rakete', e: '🚀' }, S: { w: 'Sonne', e: '☀️' }, T: { w: 'Tomate', e: '🍅' },
    U: { w: 'Ufo', e: '🛸' }, V: { w: 'Vogel', e: '🐦' }, W: { w: 'Wal', e: '🐳' }, X: { w: 'Hexe', e: '🧙', pos: 2 },
    Y: { w: 'Yoga', e: '🧘' }, Z: { w: 'Zebra', e: '🦓' },
  };

  /* Stufe 5: kurze Wörter (falls kein Name eingetragen ist) */
  const WORDS = [
    { w: 'MAMA', s: 'Mama', e: '👩' }, { w: 'PAPA', s: 'Papa', e: '👨' }, { w: 'OMA', s: 'Oma', e: '👵' },
    { w: 'OPA', s: 'Opa', e: '👴' }, { w: 'AUTO', s: 'Auto', e: '🚗' }, { w: 'BALL', s: 'Ball', e: '⚽' },
    { w: 'HAUS', s: 'Haus', e: '🏠' }, { w: 'MAUS', s: 'Maus', e: '🐭' }, { w: 'EIS', s: 'Eis', e: '🍦' },
    { w: 'IGEL', s: 'Igel', e: '🦔' }, { w: 'HUND', s: 'Hund', e: '🐶' }, { w: 'KUH', s: 'Kuh', e: '🐮' },
    { w: 'NASE', s: 'Nase', e: '👃' }, { w: 'MOND', s: 'Mond', e: '🌙' }, { w: 'UHR', s: 'Uhr', e: '⏰' },
    { w: 'ZUG', s: 'Zug', e: '🚂' }, { w: 'BUS', s: 'Bus', e: '🚌' }, { w: 'TOR', s: 'Tor', e: '🥅' },
  ];

  const ORD = ['ersten', 'zweiten', 'dritten', 'vierten', 'fünften'];
  const ORD_NOM = ['erste', 'zweite', 'dritte', 'vierte', 'fünfte'];
  const COUNT_WORD = ['', 'einen', 'zwei', 'drei', 'vier', 'fünf'];

  /** Name des Kindes → Buchstabenfolge, die wir nachspuren können (oder ''). */
  function nameLetters(name) {
    if (!name) return '';
    const first = String(name).trim().split(/[\s-]+/)[0] || '';
    const up = first.toLocaleUpperCase('de-DE').replace(/ß/g, 'SS');
    const letters = Array.from(up).filter((ch) => CAPS[ch]);
    if (letters.length !== Array.from(up).length || letters.length < 2 || letters.length > 10) return '';
    return letters.join('');
  }

  /* ------------------------------------------------------------------
     Der Nachspur-Baustein: SVG-Fläche mit Vorlage, Tinte und Kontrollpunkten
     ------------------------------------------------------------------ */
  const STEP = 3.5; // Abstand der Kontrollpunkte
  const LOOK = 3; // so viele Kontrollpunkte darf man „überspringen“

  function createTracer(ctx, strokesRaw, opts = {}) {
    const strokes = strokesRaw.map((s) => {
      const pts = s.map((p) => ({ x: p[0], y: p[1] }));
      const cps = pts.length === 1 ? pts : W.resample(pts, STEP);
      return { pts, cps, reached: -1 };
    });
    const svg = S('svg', { class: 'spur-board', viewBox: '0 0 100 100', role: 'img', 'aria-label': opts.label || 'Nachspur-Vorlage' });

    // Lineatur
    const guides = S('g', { class: 'spur-guides' });
    if (opts.guides === 'caps') {
      guides.appendChild(S('rect', { x: 3, y: 15, width: 94, height: 70, class: 'spur-band' }));
      [15, 85].forEach((y) => guides.appendChild(S('line', { x1: 3, x2: 97, y1: y, y2: y })));
      guides.appendChild(S('line', { x1: 3, x2: 97, y1: 50, y2: 50, class: 'spur-mid' }));
    } else if (opts.guides === 'lower') {
      guides.appendChild(S('rect', { x: 3, y: 42, width: 94, height: 30, class: 'spur-band' }));
      [12, 42, 72, 94].forEach((y) => guides.appendChild(S('line', { x1: 3, x2: 97, y1: y, y2: y, class: y === 72 ? 'spur-base' : '' })));
    }
    svg.appendChild(guides);

    // Vorlage: breite helle „Straße“ + gestrichelte Mittellinie
    const tmpl = S('g', { class: 'spur-template' });
    const doneG = S('g', { class: 'spur-done' });
    strokes.forEach((s) => {
      if (s.pts.length === 1) {
        tmpl.appendChild(S('circle', { cx: s.pts[0].x, cy: s.pts[0].y, r: 4.2, class: 'spur-road-dot' }));
        tmpl.appendChild(S('circle', { cx: s.pts[0].x, cy: s.pts[0].y, r: 2.2, class: 'spur-dash-dot' }));
        s.donePath = S('circle', { cx: s.pts[0].x, cy: s.pts[0].y, r: 0, class: 'spur-done-dot' });
      } else {
        const d = W.pathD(s.pts);
        tmpl.appendChild(S('path', { d, class: 'spur-road' }));
        tmpl.appendChild(S('path', { d, class: 'spur-dash' }));
        s.donePath = S('path', { d: '', class: 'spur-done-path' });
      }
      doneG.appendChild(s.donePath);
    });
    svg.appendChild(tmpl);
    svg.appendChild(doneG);

    // Ziel-Emoji (Schwungübungen)
    if (opts.goal) {
      const end = strokes[strokes.length - 1].pts.slice(-1)[0];
      svg.appendChild(S('text', { x: end.x, y: end.y - 9, class: 'spur-emoji spur-goal', text: opts.goal }));
    }

    const inkG = S('g', { class: 'spur-ink' });
    svg.appendChild(inkG);

    // Nummern der übrigen Striche (grau) – nur bei mehreren Strichen
    const badgeG = S('g', { class: 'spur-badges' });
    svg.appendChild(badgeG);
    const multi = strokes.length > 1;
    // alle Strichpunkte (um Nummern nicht auf Linien zu setzen)
    const allPts = [].concat(...strokes.map((t) => t.cps));
    strokes.forEach((s, i) => {
      if (!multi || s.cps.length === 1) return; // Punkte (i, ä …) brauchen keine Nummer
      const p = s.cps[0];
      const q = s.cps[Math.min(2, s.cps.length - 1)];
      let dx = 0, dy = 1;
      if (q !== p) {
        const len = W.dist(p, q) || 1;
        dx = (q.x - p.x) / len;
        dy = (q.y - p.y) / len;
      }
      // Kandidaten: links/rechts neben dem Strichanfang oder davor – der freieste Platz gewinnt
      const cands = [[-dy, dx], [dy, -dx], [-dx, -dy], [(-dy - dx) * 0.7, (dx - dy) * 0.7], [(dy - dx) * 0.7, (-dx - dy) * 0.7]];
      let bx = p.x, by = p.y - 7.5, bestD = -1;
      for (const [cx, cy] of cands) {
        const x = U.clamp(p.x + cx * 8, 5, 95);
        const y = U.clamp(p.y + cy * 8, 5, 95);
        let dmin = Infinity;
        for (const o of allPts) dmin = Math.min(dmin, Math.hypot(o.x - x, o.y - y));
        if (dmin > bestD) { bestD = dmin; bx = x; by = y; }
      }
      s.badge = S('g', { class: 'spur-badge' }, S('circle', { cx: bx, cy: by, r: 3.6 }), S('text', { x: bx, y: by + 0.2, text: String(i + 1) }));
      badgeG.appendChild(s.badge);
    });

    // Pfeil, Startpunkt, mitlaufendes Tier
    const arrow = S('g', { class: 'spur-arrow' }, S('polygon', { points: '-3.2,-3.4 4.2,0 -3.2,3.4' }));
    const start = S('g', { class: 'spur-start' }, S('circle', { r: 4.8 }), S('text', { y: 0.3, text: '' }));
    const startPulse = S('g', { class: 'spur-start-pulse' }, start);
    svg.appendChild(arrow);
    let walker = null;
    if (opts.walker) {
      walker = S('text', { class: 'spur-emoji spur-walker', text: opts.walker });
      svg.appendChild(walker);
    }
    svg.appendChild(startPulse);

    let si = 0; // aktueller Strich
    let finished = false;
    let tolBonus = 0;
    let resolveDone;
    const done = new Promise((r) => (resolveDone = r));

    function tol() {
      return 11 + tolBonus;
    }

    function headPoint() {
      const s = strokes[si];
      return s.cps[Math.max(0, s.reached)];
    }

    function updateMarkers() {
      if (finished) {
        arrow.style.display = 'none';
        startPulse.style.display = 'none';
        if (walker) {
          const end = strokes[strokes.length - 1].pts.slice(-1)[0];
          walker.setAttribute('x', end.x);
          walker.setAttribute('y', end.y - 1);
        }
        return;
      }
      const s = strokes[si];
      const h = headPoint();
      start.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)})`);
      start.querySelector('text').textContent = multi ? String(si + 1) : '';
      // Pfeil ein Stück voraus
      if (s.cps.length > 1) {
        const k = Math.min(s.cps.length - 1, Math.max(0, s.reached) + 4);
        const a = s.cps[Math.max(0, k - 1)];
        const b = s.cps[Math.min(s.cps.length - 1, k + 1)];
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        const p = s.cps[k];
        arrow.style.display = k > Math.max(0, s.reached) ? '' : 'none';
        arrow.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(0)})`);
      } else arrow.style.display = 'none';
      if (walker) {
        walker.setAttribute('x', h.x);
        walker.setAttribute('y', h.y - 8.5);
      }
      strokes.forEach((t, i) => {
        if (t.badge) t.badge.style.display = i > si ? '' : 'none';
      });
    }

    function renderDone(s) {
      if (s.pts.length === 1) {
        s.donePath.setAttribute('r', s.reached >= 0 ? 3.6 : 0);
      } else {
        s.donePath.setAttribute('d', s.reached >= 0 ? W.pathD(s.cps.slice(0, s.reached + 1)) : '');
      }
    }

    function strokeDone() {
      const s = strokes[si];
      s.reached = s.cps.length - 1;
      renderDone(s);
      W.blip(si);
      si++;
      if (si >= strokes.length) {
        finished = true;
        updateMarkers();
        svg.classList.add('is-finished');
        resolveDone();
        return;
      }
      updateMarkers();
      if (opts.announceStrokes !== false && strokes[si].pts.length > 1) ctx.say(`Und jetzt der ${ORD_NOM[si] || 'nächste'} Strich.`);
      else if (strokes[si].pts.length === 1) {
        const prevDot = strokes[si - 1].pts.length === 1;
        const nextDot = strokes[si + 1] && strokes[si + 1].pts.length === 1;
        ctx.say(prevDot ? 'Und jetzt den zweiten Punkt.' : nextDot ? 'Jetzt noch die zwei Punkte antippen.' : 'Jetzt noch den Punkt antippen.');
      }
    }

    /** Einen Messpunkt verarbeiten; true, wenn Fortschritt. */
    function process(p) {
      if (finished) return false;
      const s = strokes[si];
      if (s.cps.length === 1) {
        if (W.dist(p, s.cps[0]) <= tol()) {
          s.reached = 0;
          strokeDone();
          return true;
        }
        return false;
      }
      let best = -1;
      const from = s.reached + 1;
      const to = Math.min(s.cps.length - 1, s.reached + LOOK + (s.reached < 0 ? 0 : 1));
      for (let j = from; j <= to; j++) {
        if (W.dist(p, s.cps[j]) <= tol()) best = j;
      }
      if (best < 0) return false;
      s.reached = best;
      renderDone(s);
      if (s.reached >= s.cps.length - 2) strokeDone();
      else updateMarkers();
      return true;
    }

    /* --- Pointer-Bedienung --- */
    let pointer = null;
    let gesture = null;
    function addInkPoint(p) {
      gesture.pts.push(p);
      gesture.path.setAttribute('d', W.pathD(gesture.pts));
    }
    function onDown(e) {
      if (pointer !== null || finished) return;
      e.preventDefault();
      pointer = e.pointerId;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
      const p = W.toLocal(svg, e);
      gesture = { pts: [], len: 0, progressed: false, gained: 0, path: S('path', { class: 'spur-ink-path' }) };
      inkG.appendChild(gesture.path);
      addInkPoint(p);
      // ein Punkt allein soll auch sichtbar sein
      gesture.path.setAttribute('d', `M${p.x.toFixed(1)} ${p.y.toFixed(1)} l0.01 0`);
      if (process(p)) { gesture.progressed = true; gesture.gained++; }
    }
    function onMove(e) {
      if (e.pointerId !== pointer || !gesture) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) {
        const p = W.toLocal(svg, ev);
        const last = gesture.pts[gesture.pts.length - 1];
        const d = W.dist(last, p);
        if (d < 0.4) continue;
        // schnelle Bewegungen: Zwischenpunkte prüfen, damit keine Kontrollpunkte verloren gehen
        const n = Math.ceil(d / 2);
        for (let i = 1; i <= n; i++) {
          const q = { x: last.x + ((p.x - last.x) * i) / n, y: last.y + ((p.y - last.y) * i) / n };
          if (process(q)) { gesture.progressed = true; gesture.gained++; }
        }
        gesture.len += d;
        addInkPoint(p);
      }
    }
    function onUp(e) {
      if (e.pointerId !== pointer) return;
      pointer = null;
      const g = gesture;
      gesture = null;
      if (!g || finished) return;
      // Viel gemalt, aber (fast) kein Fortschritt – z. B. falsche Richtung oder daneben
      if (g.progressed && g.gained < 2 && g.len > 24) opts.onMiss && opts.onMiss();
      if (!g.progressed) {
        // Tinte, die nichts nachgespurt hat, sanft ausblenden
        g.path.classList.add('fade');
        ctx.timeout(() => g.path.remove(), 700);
        if (g.len > 16) opts.onMiss && opts.onMiss();
        else pulseStart();
      }
    }
    ctx.listen(svg, 'pointerdown', onDown);
    ctx.listen(svg, 'pointermove', onMove);
    ctx.listen(svg, 'pointerup', onUp);
    ctx.listen(svg, 'pointercancel', onUp);

    function pulseStart() {
      startPulse.classList.remove('bump');
      void startPulse.getBoundingClientRect();
      startPulse.classList.add('bump');
    }

    /** Vormachen: ein Finger fährt den restlichen Weg des aktuellen Strichs nach. */
    let demoRunning = false;
    async function demo() {
      if (finished || demoRunning) return;
      demoRunning = true;
      const s = strokes[si];
      const rest = s.cps.slice(Math.max(0, s.reached));
      const pts = rest.length > 1 ? W.resample(rest, 2) : rest;
      const trail = S('path', { class: 'spur-demo-trail' });
      const hand = S('g', { class: 'spur-demo' }, S('circle', { r: 3.4 }), S('text', { x: 3, y: 8.5, class: 'spur-emoji', text: '👆' }));
      svg.appendChild(trail);
      svg.appendChild(hand);
      const shown = [];
      for (let i = 0; i < pts.length; i++) {
        if (!ctx.active || finished) break;
        shown.push(pts[i]);
        trail.setAttribute('d', W.pathD(shown));
        hand.setAttribute('transform', `translate(${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)})`);
        await ctx.sleep(pts.length === 1 ? 700 : 26);
      }
      await ctx.sleep(300);
      trail.classList.add('fade');
      hand.remove();
      ctx.timeout(() => trail.remove(), 700);
      demoRunning = false;
    }

    function solve() {
      if (finished) return;
      while (!finished) {
        const s = strokes[si];
        s.reached = s.cps.length - 1;
        strokeDone();
      }
    }

    updateMarkers();
    return {
      svg,
      done,
      demo,
      solve,
      get finished() { return finished; },
      hintStart() { startPulse.classList.add('hint'); },
      widen() { tolBonus = Math.min(tolBonus + 3, 8); },
    };
  }

  /* ------------------------------------------------------------------
     Bildschirmaufbau: Kopfzeile + Zeichenfläche
     ------------------------------------------------------------------ */
  function layout(ctx) {
    const head = el('div.spur-head');
    const area = el('div.spur-area');
    const help = el('button.btn-round.spur-help', { type: 'button', 'aria-label': 'Zeig es mir', title: 'Zeig es mir' }, U.emoji('💡'));
    const wrap = el('div.spur-wrap', el('div.spur-top', head, help), area);
    ctx.stage.classList.add('spur-stage');
    ctx.stage.appendChild(wrap);
    return { head, area, help };
  }

  /**
   * Ein Zeichen nachspuren lassen. Führt die Fehler-/Hilfe-Logik aus und
   * löst auf, wenn alle Striche fertig sind.
   */
  async function traceOne(ctx, ui, strokes, opts) {
    U.clear(ui.area);
    let tracer = null;
    let wrongBusy = false;
    tracer = createTracer(ctx, strokes, Object.assign({}, opts, {
      onMiss: async () => {
        if (wrongBusy || tracer.finished) return;
        wrongBusy = true;
        const n = await ctx.wrong(null, { say: ctx.wrongCount === 0 ? 'Fast! Fang beim grünen Punkt an und fahr in Pfeilrichtung.' : 'Schau, ich zeige es dir.' });
        if (n >= 2 && ctx.active) {
          tracer.widen();
          tracer.hintStart();
          await tracer.demo();
        }
        wrongBusy = false;
      },
    }));
    ui.area.appendChild(tracer.svg);
    W.fit(ctx, ui.area, tracer.svg, 1);
    ui.help.onclick = () => { LT.sfx.play('click'); tracer.demo(); };
    ctx.testSolve(() => tracer.solve());
    await tracer.done;
    return tracer;
  }

  /* ------------------------------------------------------------------
     Spiel registrieren
     ------------------------------------------------------------------ */
  LT.registerGame({
    id: 'nachspuren',
    area: 'werkstatt',
    title: 'Nachspuren',
    icon: '✍️',
    levels: 5,
    rounds: 4,
    parent: {
      skill: 'Graphomotorik & Schreibvorbereitung',
      goal: 'Ihr Kind übt flüssige, gesteuerte Bewegungen (Schwungübungen) und lernt Ziffern und Buchstaben in der richtigen Schreibrichtung und Strichreihenfolge – so wie es in der Grundschule eingeführt wird. Der grüne Startpunkt mit Nummer und der Pfeil zeigen, wo und wohin es geht.',
      levels: [
        'Schwungübungen: gerade Linien, Wellen, Zickzack, Bögen, Girlanden, Schleifen, Kreis und Spirale',
        'Ziffern 0 bis 9 mit Schreibrichtung',
        'Großbuchstaben A bis Z in Druckschrift, mit Anlautwort (M wie Maus)',
        'Kleinbuchstaben a bis z in der Lineatur (Ober-, Mittel- und Unterlänge)',
        'Den eigenen Namen (im Elternbereich eintragen) und kurze Wörter wie MAMA, OPA, AUTO Buchstabe für Buchstabe',
      ],
      tip: 'Malen Sie Schwünge und Buchstaben mit dem Finger in Sand, auf beschlagene Fenster oder mit Kreide groß auf den Gehweg. Große Bewegungen aus der Schulter kommen vor kleinen Bewegungen mit dem Stift.',
    },

    async task(ctx) {
      const ui = layout(ctx);
      if (ctx.level === 1) return taskSchwung(ctx, ui);
      if (ctx.level === 2) return taskDigit(ctx, ui);
      if (ctx.level === 3) return taskLetter(ctx, ui, false);
      if (ctx.level === 4) return taskLetter(ctx, ui, true);
      return taskWord(ctx, ui);
    },
  });

  /* --- Stufe 1 --- */
  async function taskSchwung(ctx, ui) {
    // Fortschritt innerhalb der Runde: leicht → mittel → schwer
    const grp = [0, 1, U.pick([1, 2]), 2][ctx.index] ?? U.rand(3);
    const pool = SCHWUNG.filter((s) => s.grp === grp);
    const shape = U.pickFresh('spur-schwung-' + grp, pool, 2, (s) => s.id);
    ui.head.appendChild(el('span.spur-walk', U.emoji(shape.walker), shape.goal ? el('span.spur-arrow-txt', '➜') : null, shape.goal ? U.emoji(shape.goal) : null));
    ctx.instruct(shape.say + ' Fang beim grünen Punkt an.');
    const tr = await traceOne(ctx, ui, shape.strokes, { walker: shape.walker, goal: shape.goal, guides: 'none', label: shape.id });
    if (!ctx.active) return;
    await ctx.correct(tr.svg, { say: shape.done });
  }

  /* --- Stufe 2 --- */
  async function taskDigit(ctx, ui) {
    const d = U.pickFresh('spur-digit', U.range(0, 9), 6);
    const name = DIGIT_NAMES[d];
    const big = el('span.spur-glyph', String(d));
    const dots = el('span.spur-dots');
    ui.head.append(big, dots);
    const strokes = DIGITS[d];
    let text = `Spure die ${name} nach.`;
    text += strokes.length > 1 ? ` Die ${name} hat ${COUNT_WORD[strokes.length]} Striche. Fang beim grünen Punkt mit der Eins an.` : ' Fang beim grünen Punkt an.';
    ctx.instruct(text);
    const tr = await traceOne(ctx, ui, strokes, { guides: 'caps', label: 'Ziffer ' + d });
    if (!ctx.active) return;
    // Menge zur Ziffer zeigen (Ziffer ↔ Anzahl)
    for (let i = 0; i < d; i++) dots.appendChild(U.emoji('⭐'));
    if (d === 0) dots.appendChild(el('span.spur-zero', 'nichts'));
    await ctx.correct(tr.svg, { say: d === 0 ? 'Super! Das ist eine Null. Null heißt: gar nichts.' : `Super! Das ist eine ${name}. ${U.cap(U.numberWord(d))} Sterne.`.replace('Eins Sterne', 'Ein Stern') });
  }

  /* --- Stufe 3 und 4 --- */
  async function taskLetter(ctx, ui, lower) {
    const keys = Object.keys(lower ? LOWER : CAPS).filter((k) => /^[A-Za-z]$/.test(k));
    const ch = U.pickFresh(lower ? 'spur-lower' : 'spur-caps', keys, 8);
    const up = ch.toUpperCase();
    const anc = ANCHOR[up];
    const nm = LETTER_NAME[up];
    const pos = anc.pos || 0;
    const word = el('span.spur-word',
      anc.w.slice(0, pos), el('b', anc.w.charAt(pos)), anc.w.slice(pos + 1));
    ui.head.append(el('span.spur-glyph' + (lower ? '.lower' : ''), ch), U.emoji(anc.e, 'spur-anchor'), word);
    const strokes = lower ? LOWER[ch] : CAPS[ch];
    const kind = lower ? 'kleines' : 'großes';
    const wie = up === 'X' ? `${nm} wie in ${anc.w}` : `${nm} wie ${anc.w}`;
    let text = `Das ist ein ${kind} ${nm}. ${wie}. Spure das ${nm} nach.`;
    const lines = strokes.filter((s) => s.length > 1).length;
    const hasDot = strokes.some((s) => s.length === 1);
    if (strokes.length > 1) text += ` Es hat ${COUNT_WORD[lines]} ${lines === 1 ? 'Strich' : 'Striche'}${hasDot ? ' und einen Punkt' : ''}. Fang beim grünen Punkt mit der Eins an.`;
    else text += ' Fang beim grünen Punkt an.';
    ctx.instruct(text);
    const tr = await traceOne(ctx, ui, strokes, { guides: lower ? 'lower' : 'caps', label: 'Buchstabe ' + ch });
    if (!ctx.active) return;
    await ctx.correct(tr.svg, { say: `Toll! ${wie}!` });
  }

  /* --- Stufe 5: Name oder Wort, Buchstabe für Buchstabe --- */
  async function taskWord(ctx, ui) {
    const nm = nameLetters(ctx.name);
    let item;
    if (nm && ctx.index === 0) item = { w: nm, s: ctx.name.trim().split(/[\s-]+/)[0], e: '🧒', isName: true };
    else item = U.pickFresh('spur-words', WORDS, 6, (x) => x.w);
    const letters = Array.from(item.w);
    const strip = el('span.spur-strip', letters.map((c) => el('span.spur-letter', c)));
    ui.head.append(U.emoji(item.e, 'spur-anchor'), strip);
    const cells = Array.from(strip.children);
    ctx.instruct(item.isName ? `Wir schreiben deinen Namen: ${item.s}! Zuerst das ${LETTER_NAME[letters[0]]}.` : `Wir schreiben das Wort ${item.s}. Zuerst das ${LETTER_NAME[letters[0]]}.`);
    for (let i = 0; i < letters.length; i++) {
      if (!ctx.active) return;
      cells.forEach((c, k) => c.classList.toggle('current', k === i));
      if (i > 0) ctx.instruct(`Jetzt das ${LETTER_NAME[letters[i]]}.`);
      await traceOne(ctx, ui, CAPS[letters[i]], { guides: 'caps', announceStrokes: true, label: 'Buchstabe ' + letters[i] });
      if (!ctx.active) return;
      cells[i].classList.remove('current');
      cells[i].classList.add('done');
      W.blip(i + 2);
      await ctx.sleep(450);
    }
    if (!ctx.active) return;
    strip.classList.add('spur-strip-done');
    await ctx.correct(strip, { say: item.isName ? `Super, ${item.s}! Da steht dein Name!` : `Super! Du hast ${item.s} geschrieben!` });
  }

  // für Tests/Sichtprüfung der Strichdaten
  LT.werk.spurData = { DIGITS, CAPS, LOWER, SCHWUNG, createTracer };
})();
