/* ==========================================================================
   Gemeinsame Bausteine der Spielgruppe 'formen' (Formen & Farben)  →  LT.fm

   Didaktischer Hintergrund:
   - Formen werden als klare, selbst gezeichnete Flächen (SVG) gezeigt –
     einheitlich gestaltet, damit das Kind über alle Spiele hinweg dieselben
     „Formen-Freunde“ wiedererkennt.
   - Mathematische Korrektheit: Ein Quadrat IST auch ein Rechteck (und eine
     Raute), ein Kreis gilt als Sonderfall eines Ovals. Damit keine Aufgabe
     zwei richtige Antworten hat, liefert FM.safeDistractors() nur Ablenker,
     die die gesuchte Form wirklich NICHT sind (z. B. nie „Quadrat“ als
     falsche Antwort, wenn nach dem Rechteck gefragt wird).
   - Farben sind kräftig und eindeutig; Weiß bekommt immer eine sichtbare
     Kontur. Jede Farbe hat ein Alltagsbeispiel („Rot wie eine Erdbeere“),
     das als Merkhilfe und Hilfestellung dient.

   Inhalt:
     FM.COLORS / FM.color(id)       Farbpalette mit Namen, Hex-Wert, Beispielen
     FM.SHAPES                      Formen mit Artikel, Merksatz, Hinweis
     FM.def/acc/indef(kind)         „der Kreis“ / „den Kreis“ / „ein Kreis“
     FM.shape(kind, color, opts)    Form als SVG (gedreht, skaliert, Varianten)
     FM.bead(color)                 Perle (für Muster-Ketten)
     FM.blob(color)                 Farbklecks
     FM.pot(color)                  Farbtopf
     FM.safeDistractors(...)        mathematisch saubere Ablenker
     FM.adj(colorId, genus)         „roter“ / „rote“ / „rotes“ (ohne Artikel)
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const FM = {};

  /* ------------------------------------------------------------------
     Farben. ex = Alltagsbeispiele als Merkhilfe: [Emoji, Nominativ-Wendung]
     → „Rot wie eine Erdbeere“. Das erste Beispiel ist das Haupt-Beispiel.
     ------------------------------------------------------------------ */
  FM.COLORS = {
    rot: { name: 'Rot', adj: 'rot', hex: '#e53935', dark: '#a61e1b', ex: [['🍓', 'eine Erdbeere'], ['🍅', 'eine Tomate']] },
    blau: { name: 'Blau', adj: 'blau', hex: '#1f6fe0', dark: '#0e4598', ex: [['🌊', 'das Meer'], ['👖', 'eine Jeans']] },
    gelb: { name: 'Gelb', adj: 'gelb', hex: '#ffd21f', dark: '#c79700', ex: [['🍌', 'eine Banane'], ['🍋', 'eine Zitrone']] },
    gruen: { name: 'Grün', adj: 'grün', hex: '#2fb344', dark: '#1b7a2b', ex: [['🐸', 'ein Frosch'], ['🥒', 'eine Gurke']] },
    orange: { name: 'Orange', adj: 'orange', hex: '#ff8a1f', dark: '#c25b00', ex: [['🥕', 'eine Karotte'], ['🍊', 'eine Orange']] },
    lila: { name: 'Lila', adj: 'lila', hex: '#8e44c4', dark: '#5c2585', ex: [['🍇', 'Weintrauben'], ['🍆', 'eine Aubergine']] },
    rosa: { name: 'Rosa', adj: 'rosa', hex: '#ffa6cf', dark: '#d8679d', ex: [['🐷', 'ein Schweinchen'], ['🦩', 'ein Flamingo']] },
    braun: { name: 'Braun', adj: 'braun', hex: '#8d5a2b', dark: '#5a3512', ex: [['🍫', 'Schokolade'], ['🐻', 'ein Bär']] },
    schwarz: { name: 'Schwarz', adj: 'schwarz', hex: '#262626', dark: '#000000', ex: [['🎩', 'ein Zauberhut'], ['🕷️', 'eine Spinne']] },
    weiss: { name: 'Weiß', adj: 'weiß', hex: '#ffffff', dark: '#a9b0bf', ex: [['⛄', 'ein Schneemann'], ['👻', 'ein Gespenst']] },
    grau: { name: 'Grau', adj: 'grau', hex: '#9b9fa8', dark: '#62666e', ex: [['🐘', 'ein Elefant'], ['🐭', 'eine Maus']] },
    // Mischergebnisse, die nur beim freien Mischen (Farben-Zauber, Stufe 5) entstehen
    hellblau: { name: 'Hellblau', adj: 'hellblau', hex: '#93d1ff', dark: '#4a96cf', mixOnly: true },
    hellgelb: { name: 'Hellgelb', adj: 'hellgelb', hex: '#fff19a', dark: '#cdb94a', mixOnly: true },
    dunkelrot: { name: 'Dunkelrot', adj: 'dunkelrot', hex: '#8a1717', dark: '#4f0a0a', mixOnly: true },
    dunkelblau: { name: 'Dunkelblau', adj: 'dunkelblau', hex: '#15306b', dark: '#081633', mixOnly: true },
  };
  Object.keys(FM.COLORS).forEach((id) => { FM.COLORS[id].id = id; });
  FM.BASIC = ['rot', 'blau', 'gelb', 'gruen'];
  FM.ALL = ['rot', 'blau', 'gelb', 'gruen', 'orange', 'lila', 'rosa', 'braun', 'schwarz', 'weiss', 'grau'];
  /** Gut unterscheidbare, kräftige Farben für Formen und Perlen. */
  FM.VIVID = ['rot', 'blau', 'gelb', 'gruen', 'orange', 'lila'];
  /** Ähnliche Farbpaare, die in derselben Aufgabe nicht gemeinsam vorkommen sollen. */
  const SIMILAR = [['rot', 'orange'], ['gelb', 'orange'], ['rot', 'rosa'], ['lila', 'rosa']];
  FM.similar = (a, b) => SIMILAR.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  FM.color = (id) => FM.COLORS[id] || { id, name: id, hex: id, dark: '#333' };
  /** n Farben, die sich gut voneinander unterscheiden. */
  FM.distinctColors = function (n, pool = FM.VIVID, include = []) {
    const out = include.slice();
    for (const c of U.shuffle(pool)) {
      if (out.length >= n) break;
      if (out.includes(c) || out.some((o) => FM.similar(o, c))) continue;
      out.push(c);
    }
    return U.shuffle(out);
  };

  /** Starke Adjektivendung ohne Artikel: genus 'm' → „roter“, 'f' → „rote“, 'n' → „rotes“.
      Nur für deklinierbare Farbwörter gedacht (rot, blau, gelb, grün). */
  FM.adj = (colorId, genus) => FM.color(colorId).adj + (genus === 'm' ? 'er' : genus === 'f' ? 'e' : 'es');

  /* ------------------------------------------------------------------
     Formen. g = Genus; fact = kurzer Merksatz nach richtiger Antwort;
     hint = Hilfestellung (Eigenschaften der Form)
     ------------------------------------------------------------------ */
  FM.SHAPES = {
    kreis: { name: 'Kreis', g: 'm', pl: 'Kreise', fact: 'Er ist ganz rund und hat keine Ecken.', hint: 'Der Kreis ist ganz rund. Er hat keine einzige Ecke.' },
    dreieck: { name: 'Dreieck', g: 'n', pl: 'Dreiecke', fact: 'Es hat drei Ecken.', hint: 'Ein Dreieck hat drei Ecken und drei Seiten. Zähl mal mit: eins, zwei, drei.' },
    quadrat: { name: 'Quadrat', g: 'n', pl: 'Quadrate', fact: 'Alle vier Seiten sind gleich lang.', hint: 'Ein Quadrat hat vier Ecken. Alle vier Seiten sind gleich lang.' },
    rechteck: { name: 'Rechteck', g: 'n', pl: 'Rechtecke', fact: 'Es hat zwei lange und zwei kurze Seiten.', hint: 'Ein Rechteck hat vier Ecken: zwei lange Seiten und zwei kurze Seiten.' },
    oval: { name: 'Oval', g: 'n', pl: 'Ovale', fact: 'Es ist rund, aber länglich – wie ein Ei.', hint: 'Ein Oval ist rund, aber länglich – so wie ein Ei.' },
    stern: { name: 'Stern', g: 'm', pl: 'Sterne', fact: 'Er hat fünf Zacken.', hint: 'Ein Stern hat spitze Zacken. Unser Stern hat fünf Zacken.' },
    herz: { name: 'Herz', g: 'n', pl: 'Herzen', fact: 'Es hat oben zwei Bögen und unten eine Spitze.', hint: 'Ein Herz hat oben zwei runde Bögen und unten eine Spitze.' },
    raute: { name: 'Raute', g: 'f', pl: 'Rauten', fact: 'Sie hat vier gleich lange Seiten und steht auf der Spitze.', hint: 'Eine Raute hat vier Ecken und vier gleich lange Seiten. Sie steht auf einer Spitze.' },
  };
  const ART = { m: ['der', 'den', 'ein'], f: ['die', 'die', 'eine'], n: ['das', 'das', 'ein'] };
  FM.def = (k) => `${ART[FM.SHAPES[k].g][0]} ${FM.SHAPES[k].name}`;
  FM.acc = (k) => `${ART[FM.SHAPES[k].g][1]} ${FM.SHAPES[k].name}`;
  FM.indef = (k) => `${ART[FM.SHAPES[k].g][2]} ${FM.SHAPES[k].name}`;
  FM.plural = (k) => FM.SHAPES[k].pl;

  /**
   * Sonderfälle: Ein Quadrat ist zugleich ein Rechteck und eine Raute, ein Kreis
   * gilt als besonderes Oval. Wird nach Rechteck/Raute/Oval gefragt, darf der
   * Sonderfall (Quadrat bzw. Kreis) NICHT als falsche Antwort dienen.
   */
  const ALSO_IS = { quadrat: ['rechteck', 'raute'], kreis: ['oval'] };
  /** true, wenn eine Form `shown` bei der Frage nach `target` ebenfalls richtig wäre. */
  FM.alsoIs = (shown, target) => (ALSO_IS[shown] || []).includes(target);
  /** Formen, die bei der Frage nach `target` gefahrlos als falsche Antwort taugen. */
  FM.safeDistractors = (target, pool) => pool.filter((k) => k !== target && !FM.alsoIs(k, target));

  /* ------------------------------------------------------------------
     Form-Geometrie im 100×100-Raster
     ------------------------------------------------------------------ */
  const TRI = {
    gleich: '50,8 95,86 5,86', // gleichseitig
    recht: '12,10 12,90 90,90', // rechtwinklig
    spitz: '50,4 77,96 23,96', // schmal & hoch
    flach: '4,74 96,74 62,26', // flach & schief
  };
  function starPoints(cx, cy, ro, ri, n = 5) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? ri : ro;
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(' ');
  }
  FM.starPoints = starPoints;
  const HEART = 'M50 90 C22 70 5 52 9 32 C13 13 37 9 50 27 C63 9 87 13 91 32 C95 52 78 70 50 90 Z';

  /** Rohe SVG-Elemente einer Form (ohne Farbe) im 100er-Raster. */
  function shapeNodes(kind, variant) {
    switch (kind) {
      case 'kreis': return el('circle', { cx: 50, cy: 50, r: 43 });
      case 'oval': return el('ellipse', { cx: 50, cy: 50, rx: 46, ry: 28 });
      case 'quadrat': return el('rect', { x: 12, y: 12, width: 76, height: 76, rx: 3 });
      case 'rechteck':
        return variant === 'mittel'
          ? el('rect', { x: 8, y: 24, width: 84, height: 52, rx: 3 })
          : el('rect', { x: 4, y: 26, width: 92, height: 48, rx: 3 });
      case 'dreieck': return el('polygon', { points: TRI[variant] || TRI.gleich });
      case 'stern': return el('polygon', { points: starPoints(50, 54, 47, 20) });
      case 'herz': return el('path', { d: HEART });
      case 'raute': return el('polygon', { points: '50,4 84,50 50,96 16,50' });
      default: return el('circle', { cx: 50, cy: 50, r: 10 });
    }
  }
  FM.shapeNodes = shapeNodes;

  /**
   * Form als SVG.
   * color: Farb-ID ('rot') oder Hex-Wert
   * opts: { rot (Grad), scale (0.4–1), variant ('recht'|'spitz'|'flach'|'mittel'),
   *         outline: true (gestrichelte Umriss-Linie statt Fläche), cls }
   */
  FM.shape = function (kind, color, opts = {}) {
    const c = FM.color(color || 'rot');
    const svg = el('svg', { viewBox: '0 0 100 100', class: 'fm-shape' + (opts.cls ? ' ' + opts.cls : ''), 'aria-hidden': 'true', focusable: 'false' });
    const s = opts.scale || 1;
    const rot = opts.rot || 0;
    const g = el('g', { transform: `rotate(${rot} 50 50) translate(50 50) scale(${s}) translate(-50 -50)` });
    const n = shapeNodes(kind, opts.variant);
    if (opts.outline) {
      n.setAttribute('fill', 'none');
      n.setAttribute('stroke', opts.stroke || '#2b2d42');
      n.setAttribute('stroke-width', String(opts.strokeWidth || 4));
      n.setAttribute('stroke-dasharray', '9 7');
      n.setAttribute('stroke-linejoin', 'round');
      n.setAttribute('vector-effect', 'non-scaling-stroke');
    } else {
      n.setAttribute('fill', c.hex);
      n.setAttribute('stroke', c.dark);
      n.setAttribute('stroke-width', String((opts.strokeWidth || 4) / s));
      n.setAttribute('stroke-linejoin', 'round');
    }
    g.appendChild(n);
    svg.appendChild(g);
    return svg;
  };

  /** Perle mit Glanzpunkt (für Muster-Ketten). */
  FM.bead = function (color, opts = {}) {
    const c = FM.color(color);
    return el('svg', { viewBox: '0 0 100 100', class: 'fm-bead' + (opts.cls ? ' ' + opts.cls : ''), 'aria-hidden': 'true', focusable: 'false' },
      el('circle', { cx: 50, cy: 50, r: 43, fill: c.hex, stroke: c.dark, 'stroke-width': 5 }),
      el('ellipse', { cx: 35, cy: 33, rx: 13, ry: 8, fill: '#fff', opacity: 0.5, transform: 'rotate(-35 35 33)' }),
      el('circle', { cx: 50, cy: 50, r: 7, fill: c.dark, opacity: 0.45 })
    );
  };

  /** Farbklecks (organische Form mit Spritzern). */
  FM.blob = function (color, opts = {}) {
    const c = FM.color(color);
    return el('svg', { viewBox: '0 0 100 100', class: 'fm-blob' + (opts.cls ? ' ' + opts.cls : ''), 'aria-hidden': 'true', focusable: 'false' },
      el('path', {
        d: 'M50 10 C61 9 65 21 75 22 C87 23 93 35 89 47 C86 57 93 65 87 75 C81 86 68 83 60 89 C52 95 40 93 34 85 C27 77 15 80 11 68 C7 56 15 50 13 40 C11 28 22 20 32 20 C40 20 41 11 50 10 Z',
        fill: c.hex, stroke: c.dark, 'stroke-width': 3.5, 'stroke-linejoin': 'round',
      }),
      el('circle', { cx: 89, cy: 13, r: 5.5, fill: c.hex, stroke: c.dark, 'stroke-width': 2.5 }),
      el('circle', { cx: 13, cy: 88, r: 4.5, fill: c.hex, stroke: c.dark, 'stroke-width': 2.5 }),
      el('ellipse', { cx: 38, cy: 36, rx: 11, ry: 6.5, fill: '#fff', opacity: color === 'weiss' ? 0 : 0.4, transform: 'rotate(-30 38 36)' })
    );
  };

  /** Farbtopf mit Farbe, Banderole und Farbnase. */
  FM.pot = function (color, opts = {}) {
    const c = FM.color(color);
    return el('svg', { viewBox: '0 0 100 100', class: 'fm-pot' + (opts.cls ? ' ' + opts.cls : ''), 'aria-hidden': 'true', focusable: 'false' },
      el('path', { d: 'M20 38 Q50 4 80 38', fill: 'none', stroke: '#7d8596', 'stroke-width': 3.5, 'stroke-linecap': 'round' }),
      el('path', { d: 'M17 36 L22 89 Q23 95 29 95 L71 95 Q77 95 78 89 L83 36 Z', fill: '#d3d9e3', stroke: '#7d8596', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      el('path', { d: 'M19.2 48 L80.8 48 L78 82 L22 82 Z', fill: c.hex, stroke: c.dark, 'stroke-width': 2 }),
      el('ellipse', { cx: 50, cy: 36, rx: 33, ry: 9, fill: c.hex, stroke: c.dark, 'stroke-width': 3 }),
      el('path', { d: 'M66 41 Q69 47 68 55 Q67 60 64 56 Q62 50 61 42 Z', fill: c.hex, stroke: c.dark, 'stroke-width': 1.5 })
    );
  };

  /** Kleines Formen-Symbol für Zähler/Anzeigen. */
  FM.icon = (kind, color, opts) => FM.shape(kind, color, Object.assign({ cls: 'fm-icon' }, opts || {}));

  /** Hilfsfunktion: Zahlwort (1 → „eins“). */
  FM.nw = (n) => U.numberWord(n);

  LT.fm = FM;
})();
