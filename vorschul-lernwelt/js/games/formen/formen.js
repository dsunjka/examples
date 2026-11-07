/* ==========================================================================
   Spiel „Formen-Welt“ 🔷 – Formen benennen und wiedererkennen.

   Didaktik:
   - Form statt Farbe: Die Formen haben in jeder Aufgabe wechselnde Farben
     (manchmal alle dieselbe), damit das Kind wirklich auf die FORM achtet
     und nicht „der Kreis ist immer rot“ lernt.
   - Sprache: Nach jeder Antwort wird die Form mit einem Merkmal benannt
     („Richtig, das ist das Dreieck! Es hat drei Ecken.“). Tippt das Kind
     daneben, sagt Flo, was es angetippt hat („Das ist ein Oval.“) – so wird
     auch der Fehler zum Lernanlass.
   - Hilfe nach 2 Fehlversuchen: Flo beschreibt die Eigenschaften der Form
     (Ecken, Seiten, rund/länglich) und hebt die richtige Form hervor.
   - Progression (konkret → bildlich → abstrakt):
       1  drei Grundformen (Kreis, Dreieck, Quadrat)
       2  sieben Formen, mit ähnlichen Paaren (Quadrat ↔ Rechteck, Kreis ↔ Oval)
       3  Forminvarianz: gedreht, verschieden groß, andere Dreiecksarten,
          dazu die Raute – „Auch gedreht bleibt ein Dreieck ein Dreieck!“
       4  Formen im Alltag: Welche Form hat das Fenster, der Keks, die Tür?
       5  Formen-Bilder: „Finde alle Dreiecke!“ in einem Haus, einer Rakete,
          einem Roboter oder Fisch aus Formen – Mehrfachauswahl mit Zähler.
   - Mathematisch sauber: Ein Quadrat ist auch ein Rechteck, ein Kreis ein
     besonderes Oval. Solche Sonderfälle tauchen nie als „falsche“ Antwort
     auf (siehe LT.fm.safeDistractors).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const FM = LT.fm;

  const L1 = ['kreis', 'dreieck', 'quadrat'];
  const L2 = ['kreis', 'dreieck', 'quadrat', 'rechteck', 'oval', 'stern', 'herz'];
  const L3 = L2.concat(['raute']);
  /** Gute (ähnliche) Ablenker – sie sind die gesuchte Form aber NICHT. */
  const PARTNER = { kreis: ['oval'], quadrat: ['rechteck', 'raute'], dreieck: [], rechteck: ['oval'], oval: ['rechteck'], stern: ['herz'], herz: ['stern'], raute: ['dreieck'] };

  /* ------------------------------------------------------------------
     Stufe 3: zufällige Lage/Größe/Variante je Form (Forminvarianz).
     Quadrate werden nur leicht gedreht, damit sie nicht wie eine Raute
     „auf der Spitze stehen“ (das wäre für Vorschulkinder unfair).
     ------------------------------------------------------------------ */
  const ROT = {
    kreis: [0],
    oval: [0, 30, 60, 90, -30, -60],
    quadrat: [0, 12, 20, -15, -22],
    rechteck: [0, 90, 30, -25, 60, -60],
    dreieck: [0, 90, 180, -30, 40, 200, -100],
    stern: [0, 18, -12, 36],
    herz: [0, -22, 22, 12],
    raute: [0, 90],
  };
  function variation(kind) {
    const rot = U.pick(ROT[kind]);
    let variant;
    if (kind === 'dreieck') variant = U.pick(['gleich', 'recht', 'spitz', 'flach']);
    if (kind === 'rechteck') variant = U.pick(['lang', 'mittel']);
    let scale = U.pick([0.6, 0.68, 0.8, 0.92]);
    // gedrehte, lange Formen etwas kleiner, damit nichts aus der Kachel ragt
    if (rot % 90 !== 0 && (kind === 'rechteck' || kind === 'oval')) scale = Math.min(scale, 0.78);
    return { rot, variant, scale, turned: rot !== 0 && kind !== 'kreis', sized: scale <= 0.68, odd: kind === 'dreieck' && variant !== 'gleich' };
  }

  /* ------------------------------------------------------------------
     Stufe 4: Dinge aus dem Alltag (Emoji oder selbst gezeichnet).
     Nur flache Dinge (keine Kugeln/Würfel), die die Form klar zeigen.
     rot = Lage der Umriss-Hilfe (Grad), sc = Größe der Umriss-Hilfe
     ------------------------------------------------------------------ */
  const THINGS = [
    // Kreis
    { e: '🍪', w: 'Keks', a: 'der', shape: 'kreis', say: 'Der Keks ist rund wie ein Kreis.' },
    { e: '🕒', w: 'Uhr', a: 'die', shape: 'kreis', say: 'Die Uhr ist rund wie ein Kreis.' },
    { e: '🎯', w: 'Zielscheibe', a: 'die', shape: 'kreis', say: 'Die Zielscheibe ist rund wie ein Kreis.' },
    { e: '🌕', w: 'Vollmond', a: 'der', shape: 'kreis', say: 'Der Vollmond sieht aus wie ein Kreis.' },
    { svg: 'teller', w: 'Teller', a: 'der', shape: 'kreis', say: 'Der Teller ist rund wie ein Kreis.' },
    // Dreieck
    { e: '🍕', w: 'Pizzastück', a: 'das', shape: 'dreieck', rot: 180, say: 'Das Pizzastück hat drei Ecken – wie ein Dreieck.' },
    { e: '⚠️', w: 'Warnschild', a: 'das', shape: 'dreieck', say: 'Das Warnschild ist ein Dreieck.' },
    { e: '⛺', w: 'Zelt', a: 'das', shape: 'dreieck', say: 'Das Zelt sieht aus wie ein Dreieck.' },
    { e: '🚩', w: 'Fähnchen', a: 'das', shape: 'dreieck', rot: 90, sc: 0.6, say: 'Das Fähnchen ist ein Dreieck.' },
    { e: '📐', w: 'Geodreieck', a: 'das', shape: 'dreieck', variant: 'recht', say: 'Das Geodreieck heißt sogar so: Drei-eck!' },
    { svg: 'triangel', w: 'Triangel', a: 'die', shape: 'dreieck', say: 'Die Triangel ist ein Dreieck. Das steckt sogar in ihrem Namen.' },
    // Quadrat
    { svg: 'fenster', w: 'Fenster', a: 'das', shape: 'quadrat', say: 'Das Fenster ist ein Quadrat. Alle vier Seiten sind gleich lang.' },
    { svg: 'zettel', w: 'Notizzettel', a: 'der', shape: 'quadrat', say: 'Der Notizzettel ist ein Quadrat.' },
    { svg: 'spielbrett', w: 'Spielbrett', a: 'das', shape: 'quadrat', say: 'Das Spielbrett ist ein Quadrat.' },
    // Rechteck
    { e: '🚪', w: 'Tür', a: 'die', shape: 'rechteck', rot: 90, say: 'Die Tür ist ein Rechteck: zwei lange und zwei kurze Seiten.' },
    { e: '📱', w: 'Handy', a: 'das', shape: 'rechteck', rot: 90, say: 'Das Handy ist ein Rechteck.' },
    { e: '✉️', w: 'Briefumschlag', a: 'der', shape: 'rechteck', variant: 'mittel', say: 'Der Briefumschlag ist ein Rechteck.' },
    { svg: 'schokolade', w: 'Schokoladentafel', a: 'die', shape: 'rechteck', say: 'Die Schokoladentafel ist ein Rechteck.' },
    { svg: 'tafel', w: 'Tafel', a: 'die', shape: 'rechteck', variant: 'mittel', say: 'Die Tafel ist ein Rechteck.' },
    // Oval
    { e: '🥚', w: 'Ei', a: 'das', shape: 'oval', rot: 90, sc: 0.85, say: 'Das Ei ist oval: rund, aber länglich.' },
    { svg: 'spiegel', w: 'Spiegel', a: 'der', shape: 'oval', rot: 90, say: 'Der Spiegel ist oval: rund, aber länglich.' },
    { svg: 'teppich', w: 'Teppich', a: 'der', shape: 'oval', say: 'Der Teppich ist oval.' },
  ];
  const THING_SHAPES = ['kreis', 'dreieck', 'quadrat', 'rechteck', 'oval'];
  const indefNom = (t) => (t.a === 'die' ? 'eine ' : 'ein ') + t.w;
  const defAcc = (t) => (t.a === 'der' ? 'den' : t.a) + ' ' + t.w;

  /** Selbst gezeichnete Alltagsdinge (100er-Raster). */
  function thingSVG(name) {
    const svg = el('svg', { viewBox: '0 0 100 100', class: 'formen-thing-svg', 'aria-hidden': 'true' });
    const add = (tag, attrs) => svg.appendChild(el(tag, attrs));
    switch (name) {
      case 'teller':
        add('circle', { cx: 50, cy: 50, r: 45, fill: '#ffffff', stroke: '#b9c0cc', 'stroke-width': 3 });
        add('circle', { cx: 50, cy: 50, r: 37, fill: 'none', stroke: '#5b9bea', 'stroke-width': 3, 'stroke-dasharray': '5 5' });
        add('circle', { cx: 50, cy: 50, r: 28, fill: '#f3f5fa', stroke: '#dfe3ea', 'stroke-width': 2 });
        break;
      case 'triangel':
        add('path', { d: 'M48 6 Q50 2 52 6', fill: 'none', stroke: '#c0392b', 'stroke-width': 3 });
        add('polyline', { points: '44,18 50,8 90,82 10,82 40,28', fill: 'none', stroke: '#9aa3b5', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        add('line', { x1: 66, y1: 52, x2: 96, y2: 26, stroke: '#6b7385', 'stroke-width': 4, 'stroke-linecap': 'round' });
        break;
      case 'fenster':
        add('rect', { x: 8, y: 8, width: 84, height: 84, rx: 3, fill: '#ffffff', stroke: '#8d5a2b', 'stroke-width': 5 });
        [[15, 15], [53, 15], [15, 53], [53, 53]].forEach(([x, y]) => add('rect', { x, y, width: 32, height: 32, fill: '#9fd8ff' }));
        add('line', { x1: 20, y1: 40, x2: 38, y2: 22, stroke: '#ffffff', 'stroke-width': 3, opacity: 0.8 });
        add('line', { x1: 58, y1: 78, x2: 76, y2: 60, stroke: '#ffffff', 'stroke-width': 3, opacity: 0.8 });
        break;
      case 'zettel':
        add('rect', { x: 12, y: 12, width: 76, height: 76, fill: '#ffe66d', stroke: '#d9b73a', 'stroke-width': 2.5 });
        [34, 48, 62, 76].forEach((y) => add('line', { x1: 22, y1: y, x2: 78, y2: y, stroke: '#c9a92a', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        add('circle', { cx: 50, cy: 18, r: 5, fill: '#e53935' });
        break;
      case 'spielbrett':
        add('rect', { x: 8, y: 8, width: 84, height: 84, fill: '#8d5a2b', rx: 3 });
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
          add('rect', { x: 13 + c * 18.5, y: 13 + r * 18.5, width: 18.5, height: 18.5, fill: (r + c) % 2 ? '#2b2d42' : '#fff7e6' });
        }
        break;
      case 'tafel':
        add('rect', { x: 5, y: 20, width: 90, height: 58, rx: 2, fill: '#2f5d46', stroke: '#9a6a3a', 'stroke-width': 5 });
        add('path', { d: 'M18 60 L30 42 L42 60 Z M54 46 Q64 36 74 46 T86 50', fill: 'none', stroke: '#ffffff', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.9 });
        add('rect', { x: 60, y: 79, width: 14, height: 5, rx: 2, fill: '#ffffff' });
        break;
      case 'schokolade':
        add('rect', { x: 4, y: 26, width: 92, height: 48, rx: 3, fill: '#7a4a24', stroke: '#4f2c10', 'stroke-width': 3 });
        [27, 50, 73].forEach((x) => add('line', { x1: x, y1: 28, x2: x, y2: 72, stroke: '#4f2c10', 'stroke-width': 2.5 }));
        add('line', { x1: 6, y1: 50, x2: 94, y2: 50, stroke: '#4f2c10', 'stroke-width': 2.5 });
        [[8, 30], [31, 30], [54, 30], [77, 30], [8, 54], [31, 54], [54, 54], [77, 54]].forEach(([x, y]) => add('rect', { x: x + 2, y: y + 2, width: 11, height: 4, rx: 2, fill: '#a26a3c' }));
        break;
      case 'spiegel':
        add('ellipse', { cx: 50, cy: 50, rx: 30, ry: 44, fill: '#d4ecfa', stroke: '#d4a21f', 'stroke-width': 7 });
        add('line', { x1: 36, y1: 40, x2: 52, y2: 22, stroke: '#ffffff', 'stroke-width': 4, 'stroke-linecap': 'round' });
        add('line', { x1: 40, y1: 56, x2: 62, y2: 32, stroke: '#ffffff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.8 });
        break;
      case 'teppich':
        add('ellipse', { cx: 50, cy: 50, rx: 46, ry: 28, fill: '#e57373', stroke: '#b94b4b', 'stroke-width': 3 });
        add('ellipse', { cx: 50, cy: 50, rx: 36, ry: 19, fill: 'none', stroke: '#ffd166', 'stroke-width': 3.5 });
        add('ellipse', { cx: 50, cy: 50, rx: 22, ry: 10, fill: '#ffd166' });
        break;
      default:
        break;
    }
    return svg;
  }

  /* ------------------------------------------------------------------
     Stufe 5: Bilder aus Formen (Raster 260 × 320, hochkant – passt aufs
     Handy wie aufs Tablet). Teile werden von hinten nach vorn gezeichnet.
     c = Farb-ID oder [Füllung, Kontur]
     ------------------------------------------------------------------ */
  const GLASS = ['#bfe6ff', '#3f86c4'];
  const METAL = ['#c3ccdb', '#6f7d93'];
  const PICTURES = [
    {
      id: 'haus', intro: 'Schau mal, ein Haus aus Formen!', bg: '#dff1ff',
      decor: [
        ['path', { d: 'M0 250 Q40 242 80 250 T160 250 T260 248 L260 320 L0 320 Z', fill: '#93d36d' }],
        ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r = (a * Math.PI) / 180;
          return ['line', { x1: 212 + 33 * Math.cos(r), y1: 50 + 33 * Math.sin(r), x2: 212 + 42 * Math.cos(r), y2: 50 + 42 * Math.sin(r), stroke: '#f2b400', 'stroke-width': 4, 'stroke-linecap': 'round' }];
        }),
      ],
      parts: [
        { k: 'kreis', cx: 212, cy: 50, r: 27, c: 'gelb' },
        { k: 'rechteck', x: 28, y: 160, w: 144, h: 96, c: ['#ffe2a8', '#c9993f'] },
        { k: 'dreieck', pts: '16,160 184,160 100,80', c: 'rot' },
        { k: 'kreis', cx: 100, cy: 130, r: 16, c: GLASS },
        { k: 'quadrat', x: 40, y: 176, w: 36, h: 36, c: GLASS },
        { k: 'quadrat', x: 124, y: 176, w: 36, h: 36, c: GLASS },
        { k: 'rechteck', x: 84, y: 196, w: 32, h: 60, c: 'braun' },
        { k: 'rechteck', x: 214, y: 262, w: 16, h: 26, c: ['#9b6a3c', '#5a3512'] },
        { k: 'dreieck', pts: '190,264 254,264 222,206', c: 'gruen' },
        { k: 'dreieck', pts: '196,228 248,228 222,168', c: 'gruen' },
      ],
    },
    {
      id: 'rakete', intro: 'Schau mal, eine Rakete aus Formen!', bg: '#1f2d5c',
      decor: [],
      parts: [
        { k: 'stern', cx: 44, cy: 58, r: 24, c: 'gelb' },
        { k: 'stern', cx: 220, cy: 46, r: 20, c: 'gelb' },
        { k: 'stern', cx: 36, cy: 182, r: 20, c: 'gelb' },
        { k: 'kreis', cx: 214, cy: 270, r: 30, c: 'lila' },
        { k: 'dreieck', pts: '95,190 95,240 60,240', c: 'rot' },
        { k: 'dreieck', pts: '165,190 165,240 200,240', c: 'rot' },
        { k: 'rechteck', x: 95, y: 110, w: 70, h: 130, c: ['#eef1f6', '#8b93a3'] },
        { k: 'dreieck', pts: '95,110 165,110 130,36', c: 'rot' },
        { k: 'kreis', cx: 130, cy: 150, r: 18, c: GLASS },
        { k: 'kreis', cx: 130, cy: 200, r: 14, c: GLASS },
        { k: 'dreieck', pts: '108,240 152,240 130,294', c: 'orange' },
      ],
    },
    {
      id: 'roboter', intro: 'Schau mal, ein Roboter aus Formen!', bg: '#efe7ff',
      decor: [['line', { x1: 130, y1: 34, x2: 130, y2: 47, stroke: '#62666e', 'stroke-width': 4 }]],
      parts: [
        { k: 'kreis', cx: 130, cy: 22, r: 13, c: 'rot' },
        { k: 'dreieck', pts: '80,76 80,116 56,96', c: 'orange' },
        { k: 'dreieck', pts: '180,76 180,116 204,96', c: 'orange' },
        { k: 'quadrat', x: 80, y: 46, w: 100, h: 100, c: METAL },
        { k: 'kreis', cx: 108, cy: 84, r: 14, c: 'gelb' },
        { k: 'kreis', cx: 152, cy: 84, r: 14, c: 'gelb' },
        { k: 'rechteck', x: 100, y: 114, w: 60, h: 18, c: ['#4a4f5c', '#2b2d42'] },
        { k: 'rechteck', x: 40, y: 156, w: 24, h: 64, c: METAL },
        { k: 'rechteck', x: 196, y: 156, w: 24, h: 64, c: METAL },
        { k: 'rechteck', x: 70, y: 152, w: 120, h: 80, c: 'blau' },
        { k: 'herz', cx: 130, cy: 192, s: 46, c: 'rot' },
        { k: 'kreis', cx: 52, cy: 232, r: 14, c: 'gruen' },
        { k: 'kreis', cx: 208, cy: 232, r: 14, c: 'gruen' },
        { k: 'rechteck', x: 92, y: 232, w: 26, h: 46, c: METAL },
        { k: 'rechteck', x: 142, y: 232, w: 26, h: 46, c: METAL },
        { k: 'oval', cx: 105, cy: 290, rx: 24, ry: 12, c: 'lila' },
        { k: 'oval', cx: 155, cy: 290, rx: 24, ry: 12, c: 'lila' },
      ],
    },
    {
      id: 'fisch', intro: 'Schau mal, ein Fisch aus Formen!', bg: '#cdeefe',
      decor: [
        ['path', { d: 'M0 286 Q60 274 130 284 T260 280 L260 320 L0 320 Z', fill: '#f3dca4' }],
        ['path', { d: 'M236 300 Q226 280 238 262 Q250 244 238 226', fill: 'none', stroke: '#3aa35b', 'stroke-width': 7, 'stroke-linecap': 'round' }],
        ['path', { d: 'M150 300 Q160 284 150 268', fill: 'none', stroke: '#3aa35b', 'stroke-width': 6, 'stroke-linecap': 'round' }],
      ],
      parts: [
        { k: 'kreis', cx: 30, cy: 112, r: 12, c: ['#effaff', '#5aa9d6'] },
        { k: 'kreis', cx: 46, cy: 70, r: 12, c: ['#effaff', '#5aa9d6'] },
        { k: 'kreis', cx: 28, cy: 32, r: 12, c: ['#effaff', '#5aa9d6'] },
        { k: 'dreieck', pts: '186,150 240,108 240,192', c: 'orange' },
        { k: 'dreieck', pts: '96,114 150,114 112,72', c: 'orange' },
        { k: 'dreieck', pts: '108,186 140,186 116,218', c: 'orange' },
        { k: 'oval', cx: 120, cy: 150, rx: 72, ry: 44, c: 'gelb' },
        { k: 'kreis', cx: 80, cy: 138, r: 11, c: ['#2b2d42', '#000000'] },
        { k: 'oval', cx: 62, cy: 296, rx: 26, ry: 13, c: METAL },
        { k: 'oval', cx: 112, cy: 300, rx: 20, ry: 10, c: METAL },
        { k: 'stern', cx: 196, cy: 290, r: 22, c: 'rot' },
      ],
    },
  ];

  /** Ein Teil des Formen-Bildes als SVG-Gruppe (mit größerer Trefferfläche für kleine Teile). */
  function pictureNode(p) {
    const [fill, stroke] = Array.isArray(p.c) ? p.c : [FM.color(p.c).hex, FM.color(p.c).dark];
    let shape;
    let small = false;
    switch (p.k) {
      case 'kreis': shape = el('circle', { cx: p.cx, cy: p.cy, r: p.r }); small = p.r < 20; break;
      case 'oval': shape = el('ellipse', { cx: p.cx, cy: p.cy, rx: p.rx, ry: p.ry }); small = p.ry < 20; break;
      case 'quadrat':
      case 'rechteck': shape = el('rect', { x: p.x, y: p.y, width: p.w, height: p.h, rx: 2 }); small = Math.min(p.w, p.h) < 40; break;
      case 'dreieck': shape = el('polygon', { points: p.pts }); small = true; break;
      case 'stern': shape = el('polygon', { points: FM.starPoints(p.cx, p.cy, p.r, p.r * 0.45) }); small = true; break;
      case 'herz': shape = el('path', { d: 'M50 90 C22 70 5 52 9 32 C13 13 37 9 50 27 C63 9 87 13 91 32 C95 52 78 70 50 90 Z', transform: `translate(${p.cx - p.s / 2} ${p.cy - p.s / 2}) scale(${p.s / 100})` }); break;
      default: shape = el('circle', { cx: 0, cy: 0, r: 1 });
    }
    const g = el('g', { class: 'formen-part', role: 'button', 'aria-label': FM.SHAPES[p.k].name });
    if (small) {
      // unsichtbarer, breiter Rand: größere Trefferfläche für Kinderfinger
      const hit = shape.cloneNode(true);
      hit.setAttribute('fill', 'rgba(0,0,0,0)');
      hit.setAttribute('stroke', 'rgba(0,0,0,0)');
      hit.setAttribute('stroke-width', '14');
      hit.setAttribute('vector-effect', 'non-scaling-stroke');
      hit.setAttribute('stroke-linejoin', 'round');
      hit.setAttribute('class', 'formen-hit');
      g.appendChild(hit);
    }
    shape.setAttribute('fill', fill);
    shape.setAttribute('stroke', stroke);
    shape.setAttribute('stroke-width', '3');
    shape.setAttribute('stroke-linejoin', 'round');
    if (p.k === 'herz') shape.setAttribute('vector-effect', 'non-scaling-stroke');
    shape.setAttribute('class', 'formen-vis');
    g.appendChild(shape);
    g._part = p;
    return g;
  }

  /** Erlaubte Suchformen eines Bildes: mind. 2 Stück und ohne Sonderfall-Konflikt
      (z. B. keine Rechteck-Suche, wenn das Bild Quadrate enthält). */
  function targetsOf(pic) {
    const kinds = U.uniqueBy(pic.parts.map((p) => p.k), (k) => k);
    return kinds.filter((t) => {
      const n = pic.parts.filter((p) => p.k === t).length;
      if (n < 2) return false;
      return !pic.parts.some((p) => FM.alsoIs(p.k, t));
    });
  }

  /* ------------------------------------------------------------------
     Aufgabentypen
     ------------------------------------------------------------------ */

  /** Stufen 1–3: „Tippe auf den Kreis!“ */
  async function tapShape(ctx) {
    const lv = ctx.level;
    const pool = lv === 1 ? L1 : lv === 2 ? L2 : L3;
    const target = U.pickFresh('formen-target-' + lv, pool, lv === 1 ? 1 : 3);
    let kinds;
    if (lv === 1) kinds = L1.slice();
    else {
      const safe = FM.safeDistractors(target, pool);
      const partners = (PARTNER[target] || []).filter((k) => safe.includes(k));
      const rest = U.shuffle(safe.filter((k) => !partners.includes(k)));
      kinds = [target].concat(partners, rest).slice(0, 4);
    }
    // Farben: meist verschieden, auf Stufe 2/3 manchmal alle gleich (nur die Form zählt!)
    const sameColor = lv >= 2 && U.chance(0.3);
    const colors = sameColor ? kinds.map(() => U.pick(FM.VIVID)) : FM.distinctColors(kinds.length);
    if (sameColor) colors.fill(colors[0]);

    const items = kinds.map((k, i) => {
      const v = lv === 3 ? variation(k) : { rot: 0, scale: lv === 1 ? 0.92 : 0.86 };
      return {
        content: FM.shape(k, colors[i], { rot: v.rot, scale: v.scale, variant: v.variant, cls: 'formen-tile-shape' }),
        correct: k === target,
        kind: k,
        v,
        aria: FM.SHAPES[k].name,
      };
    });

    const phrase = U.pick([`Tippe auf ${FM.acc(target)}!`, `Wo ist ${FM.def(target)}?`, `Finde ${FM.acc(target)}!`]);
    ctx.stage.appendChild(el('div.prompt-box.formen-prompt', el('span.prompt-text', phrase)));
    ctx.instruct(phrase);

    // hochkant (Handy/Tablet) 2 × 2 Kacheln, quer alle in einer Reihe
    const portrait = ctx.stage.clientHeight > ctx.stage.clientWidth;
    await ctx.choices(items, {
      columns: items.length === 4 && portrait ? 2 : undefined,
      className: 'formen-choices',
      size: 'large',
      correctSay: (it) => {
        let s = `Richtig, das ist ${FM.def(target)}! ${FM.SHAPES[target].fact}`;
        if (lv === 3 && it.v.turned) s += ` Auch gedreht bleibt ${FM.indef(target)} ${FM.indef(target)}!`;
        else if (lv === 3 && it.v.odd) s += ' Jedes Dreieck hat drei Ecken – egal, wie es aussieht.';
        else if (lv === 3 && it.v.sized) s += ' Ob groß oder klein – die Form bleibt gleich.';
        return s;
      },
      wrongSay: (it) => `Das ist ${FM.indef(it.kind)}. Wo ist ${FM.def(target)}?`,
      onWrong: async (it, tile, n) => {
        if (n === 2) await ctx.say(FM.SHAPES[target].hint);
      },
    });
  }

  /** Stufe 4: Formen im Alltag – „Welche Form hat das Fenster?“ */
  async function everyday(ctx) {
    const thing = U.pickFresh('formen-thing', THINGS, 8, (t) => t.w);
    const target = thing.shape;
    // Ablenker: alle Formen, die das Ding NICHT ist (ein quadratisches Fenster ist
    // auch ein Rechteck → „Rechteck“ wird dann nicht als falsche Antwort angeboten)
    const safe = THING_SHAPES.filter((k) => k !== target && !FM.alsoIs(target, k));
    const kinds = U.shuffle([target].concat(U.sample(safe, 2)));
    const colors = FM.distinctColors(3);

    const view = el('div.formen-thing');
    view.appendChild(thing.svg ? thingSVG(thing.svg) : U.emoji(thing.e, 'formen-thing-emoji'));
    const box = el('div.prompt-box.formen-thing-box', view, el('span.formen-thing-name', thing.w));
    ctx.stage.appendChild(box);

    const q = `Das ist ${indefNom(thing)}. Welche Form hat ${thing.a} ${thing.w}?`;
    ctx.instruct(q);

    const items = kinds.map((k, i) => ({
      content: FM.shape(k, colors[i], { scale: 0.86, rot: k === 'rechteck' && U.chance(0.3) ? 90 : 0, cls: 'formen-tile-shape' }),
      correct: k === target,
      kind: k,
      say: FM.SHAPES[k].name,
    }));
    await ctx.choices(items, {
      sayButton: true,
      className: 'formen-choices',
      correctSay: `Richtig! ${thing.say}`,
      wrongSay: (it) => `Das ist ${FM.indef(it.kind)}. Schau dir ${defAcc(thing)} noch mal genau an.`,
      onWrong: async (it, tile, n) => {
        if (n === 2) {
          // Hilfe: Flo „malt“ die Form gestrichelt um das Ding herum
          const ol = FM.shape(target, null, { outline: true, rot: thing.rot || 0, scale: thing.sc || 1, variant: thing.variant, stroke: '#ff5fa2', strokeWidth: 5, cls: 'formen-outline' });
          view.appendChild(ol);
          await ctx.say(`Schau, ich male die Form nach. ${FM.SHAPES[target].hint}`);
        }
      },
    });
  }

  /** Stufe 5: „Finde alle Dreiecke!“ im Formen-Bild. */
  async function findAll(ctx) {
    const pic = U.pickFresh('formen-pic', PICTURES, 2, (p) => p.id);
    const target = U.pickFresh('formen-pic-target-' + pic.id, targetsOf(pic), 1);
    const n = pic.parts.filter((p) => p.k === target).length;

    // Zähler: ein Feld je gesuchter Form
    const counter = el('div.formen-counter', { 'aria-label': `0 von ${n}` });
    const slots = [];
    for (let i = 0; i < n; i++) {
      const s = el('span.formen-slot', FM.icon(target, 'weiss', { scale: 0.8 }));
      slots.push(s);
      counter.appendChild(s);
    }
    const head = el('div.formen-find-head', el('span.formen-find-text', `Finde alle ${FM.plural(target)}!`), counter);
    ctx.stage.appendChild(head);

    const svg = el('svg', { viewBox: '0 0 260 320', class: 'formen-pic', role: 'img', 'aria-label': pic.intro });
    svg.appendChild(el('rect', { x: 0, y: 0, width: 260, height: 320, rx: 18, fill: pic.bg, class: 'formen-deco' }));
    pic.decor.forEach(([tag, attrs]) => svg.appendChild(el(tag, Object.assign({ class: 'formen-deco' }, attrs))));
    const nodes = pic.parts.map((p) => {
      const g = pictureNode(p);
      svg.appendChild(g);
      return g;
    });
    ctx.stage.appendChild(svg);
    ctx.stage.classList.add('formen-stage-find');

    const pluralWord = FM.plural(target);
    ctx.instruct(`${pic.intro} Finde alle ${pluralWord}. Es sind ${FM.nw(n)}.`);

    const targets = nodes.filter((g) => g._part.k === target);
    let found = 0;
    let busy = false;
    let errors = 0;

    const markNext = () => {
      nodes.forEach((g) => ctx.markTest(g, false));
      const next = targets.find((g) => !g._found);
      if (next) ctx.markTest(next);
    };
    markNext();

    await new Promise((resolve) => {
      nodes.forEach((g) => {
        g.addEventListener('click', async () => {
          if (busy || !ctx.active || g._found) return;
          if (g._part.k === target) {
            g._found = true;
            g.classList.add('is-found');
            ctx.unhint(g);
            g.classList.remove('formen-hint');
            const slot = slots[found];
            found++;
            slot.classList.add('on');
            U.clear(slot).appendChild(FM.icon(target, Array.isArray(g._part.c) ? g._part.c[0] : g._part.c, { scale: 0.8 }));
            counter.setAttribute('aria-label', `${found} von ${n}`);
            markNext();
            LT.sfx.tone(520 + found * 70, 0.12, { type: 'triangle', volume: 0.35 });
            if (found >= n) {
              busy = true;
              const all = n === 2 ? `beide ${pluralWord}` : `alle ${FM.nw(n)} ${pluralWord}`;
              await ctx.correct(svg, { say: `Super! Du hast ${all} gefunden!` });
              resolve();
            } else {
              ctx.say(U.cap(FM.nw(found)) + '!');
            }
          } else {
            busy = true;
            errors++;
            g.classList.remove('formen-shake');
            void g.getBoundingClientRect();
            g.classList.add('formen-shake');
            await ctx.wrong(null, { say: `Das ist ${FM.indef(g._part.k)}. Wir suchen ${pluralWord}.` });
            if (errors >= 2) {
              const next = targets.find((x) => !x._found);
              if (next && !next.classList.contains('formen-hint')) {
                next.classList.add('formen-hint');
                await ctx.say(`Schau, hier ist noch ${FM.indef(target)}.`);
              }
            }
            busy = false;
          }
        });
      });
    });
  }

  LT.registerGame({
    id: 'formen',
    area: 'formen',
    title: 'Formen-Welt',
    icon: '🔷',
    levels: 5,
    rounds: 5,
    intro: 'Willkommen in der Formen-Welt! Hör gut zu und finde die richtige Form.',
    parent: {
      skill: 'Geometrische Formen erkennen und benennen',
      goal: 'Ihr Kind lernt die Grundformen Kreis, Dreieck, Quadrat, Rechteck, Oval, Stern, Herz und Raute sicher zu benennen und an ihren Merkmalen (Ecken, Seiten, rund/länglich) zu unterscheiden. Es erfährt, dass eine Form gleich bleibt, auch wenn sie gedreht, größer oder kleiner ist (Forminvarianz), und entdeckt Formen in seiner Umwelt.',
      levels: [
        'Drei Grundformen: Kreis, Dreieck, Quadrat – in wechselnden Farben, damit die Form zählt, nicht die Farbe',
        'Sieben Formen mit ähnlichen Paaren (Quadrat ↔ Rechteck, Kreis ↔ Oval, Stern ↔ Herz)',
        'Forminvarianz: gedrehte, verschieden große Formen und verschiedene Dreiecksarten, dazu die Raute',
        'Formen im Alltag: Welche Form haben Keks, Fenster, Tür oder Ei?',
        'Formen-Bilder: alle Dreiecke (Kreise, Quadrate …) in einem Haus, einer Rakete, einem Roboter oder Fisch finden',
      ],
      tip: 'Gehen Sie auf „Formen-Jagd“: Welche Kreise, Rechtecke und Dreiecke findet Ihr Kind in der Küche oder auf dem Spielplatz? Fragen Sie nach: „Woran erkennst du das?“ (Ecken zählen!). Auch Legen mit Bauklötzen oder Ausstechformen festigt die Formen.',
    },

    async task(ctx) {
      if (ctx.level <= 3) return tapShape(ctx);
      if (ctx.level === 4) return everyday(ctx);
      return findAll(ctx);
    },
  });
})();
