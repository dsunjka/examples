/* ==========================================================================
   Spiel „Ausmalbilder“ 🖍️ (Malwerkstatt) – kreativ, ohne richtig/falsch

   Didaktik:
   - Freies, kreatives Gestalten: Das Kind wählt Bild und Farben selbst.
     Es gibt kein Richtig oder Falsch – jedes Bild ist schön.
   - Farbwörter: Beim Antippen einer Farbe wird ihr Name vorgelesen
     („Hellblau“) – so wächst der Farbwortschatz nebenbei.
   - Auge-Hand-Koordination und Flächenwahrnehmung: Flächen mit dicken
     Konturen gezielt antippen; auch kleine Flächen (Augen, Fenster) sind dabei.
   - Ausdauer und Stolz: Bilder werden automatisch gespeichert und beim
     nächsten Öffnen wiederhergestellt – man kann an einem Bild weitermalen.
     „Neu anfangen“ (mit Rückfrage) macht das Bild wieder weiß.

   Alle Bilder sind selbst gezeichnete SVGs (viewBox 0 0 200 200).
   Jede Fläche ist ein eigenes Element (Reihenfolge = Malreihenfolge von hinten
   nach vorne); „deco“ sind feste Linien/Details, die nicht ausgemalt werden.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.werk;
  const S = W.svg;

  /* ------------------------------------------------------------------
     Farbpalette (12 Farben + Schwamm zum Wegwischen)
     ------------------------------------------------------------------ */
  const COLORS = [
    { c: '#e53935', name: 'Rot' },
    { c: '#fb8c00', name: 'Orange' },
    { c: '#fdd835', name: 'Gelb' },
    { c: '#9ccc65', name: 'Hellgrün' },
    { c: '#2e7d32', name: 'Dunkelgrün' },
    { c: '#4fc3f7', name: 'Hellblau' },
    { c: '#1e50c8', name: 'Dunkelblau' },
    { c: '#8e24aa', name: 'Lila' },
    { c: '#f48fb1', name: 'Rosa' },
    { c: '#8d5524', name: 'Braun' },
    { c: '#9e9e9e', name: 'Grau' },
    { c: '#333333', name: 'Schwarz' },
  ];
  const ERASER = { c: '#ffffff', name: 'Schwamm', eraser: true };

  /* ------------------------------------------------------------------
     Zeichen-Helfer für die Bilder
     ------------------------------------------------------------------ */
  const rect = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  const circ = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
  const ell = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
  const path = (d) => `<path d="${d}"/>`;
  const poly = (pts) => `<polygon points="${pts}"/>`;
  const BG = rect(0, 0, 200, 200);
  /** Wolke (Mittelpunkt, Größe) */
  const cloud = (x, y, s = 1) =>
    path(`M${x - 26 * s} ${y + 10 * s} a${11 * s} ${11 * s} 0 0 1 ${4 * s} ${-20 * s} a${15 * s} ${15 * s} 0 0 1 ${26 * s} ${-8 * s} a${13 * s} ${13 * s} 0 0 1 ${22 * s} ${10 * s} a${10 * s} ${10 * s} 0 0 1 ${0} ${18 * s} Z`);
  /** fünfzackiger Stern */
  const star = (cx, cy, r1, r2) => {
    const p = [];
    for (let k = 0; k < 10; k++) {
      const a = ((-90 + k * 36) * Math.PI) / 180;
      const r = k % 2 ? r2 : r1;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return poly(p.join(' '));
  };
  /** Blüte aus Kreisen */
  const petals = (cx, cy, d, r, n = 6) => {
    let s = '';
    for (let k = 0; k < n; k++) {
      const a = ((-90 + (k * 360) / n) * Math.PI) / 180;
      s += circ((cx + d * Math.cos(a)).toFixed(1), (cy + d * Math.sin(a)).toFixed(1), r);
    }
    return s;
  };
  const FOX = 'transform="translate(-3 6) scale(1.3)"';

  /* ------------------------------------------------------------------
     Die Ausmalbilder
     ------------------------------------------------------------------ */
  const PICTURES = [
    {
      id: 'flo', name: 'Flo, der Fuchs', e: '🦊',
      regions: [
        BG,
        path('M0 168 Q100 150 200 168 V200 H0 Z'),
        petals(24, 176, 7, 6, 5), circ(24, 176, 5),
        petals(178, 180, 7, 6, 5), circ(178, 180, 5),
        `<g ${FOX}>${path('M100 112 C128 108 138 84 128 62 C122 84 108 94 92 98 Z')}</g>`,
        `<g ${FOX}>${path('M128 62 C134 74 132 88 124 98 C122 88 124 74 128 62 Z')}</g>`,
        `<g ${FOX}>${ell(70, 114, 30, 20)}</g>`,
        `<g ${FOX}>${ell(70, 118, 17, 13)}</g>`,
        `<g ${FOX}>${path('M26 46 L34 6 L58 32 Z')}</g>`,
        `<g ${FOX}>${path('M114 46 L106 6 L82 32 Z')}</g>`,
        `<g ${FOX}>${path('M33 38 L37 16 L50 31 Z')}</g>`,
        `<g ${FOX}>${path('M107 38 L103 16 L90 31 Z')}</g>`,
        `<g ${FOX}>${path('M70 22 C104 22 122 44 120 66 C118 88 98 104 70 104 C42 104 22 88 20 66 C18 44 36 22 70 22 Z')}</g>`,
        `<g ${FOX}>${path('M70 58 C84 58 104 66 116 72 C112 92 94 104 70 104 C46 104 28 92 24 72 C36 66 56 58 70 58 Z')}</g>`,
        `<g ${FOX}>${ell(70, 76, 8, 5.5)}</g>`,
      ],
      deco: `<g ${FOX}><ellipse cx="50" cy="60" rx="8" ry="10" fill="#2b2d42"/><ellipse cx="90" cy="60" rx="8" ry="10" fill="#2b2d42"/><circle cx="53" cy="56" r="3" fill="#fff" stroke="none"/><circle cx="93" cy="56" r="3" fill="#fff" stroke="none"/><path d="M40 44 Q50 39 59 44 M81 44 Q90 39 100 44 M60 85 Q70 92 80 85" fill="none"/></g>`,
    },
    {
      id: 'haus', name: 'das Haus', e: '🏠',
      regions: [
        BG,
        path('M0 165 Q100 150 200 165 V200 H0 Z'),
        circ(166, 34, 17),
        cloud(52, 40, 1),
        rect(122, 46, 16, 34),
        rect(48, 92, 104, 76),
        poly('36,94 100,40 164,94'),
        rect(88, 126, 26, 42, 4),
        rect(58, 106, 22, 22),
        rect(120, 106, 22, 22),
        circ(100, 72, 9),
        path('M14 168 C10 150 30 140 36 152 C44 140 60 150 54 168 Z'),
        path('M150 168 C146 150 166 140 172 152 C180 140 196 150 190 168 Z'),
      ],
      deco: '<path d="M69 106 V128 M58 117 H80 M131 106 V128 M120 117 H142 M100 63 V81 M91 72 H109" fill="none"/><circle cx="108" cy="148" r="2.4" fill="#2b2d42"/>',
    },
    {
      id: 'auto', name: 'das Auto', e: '🚗',
      regions: [
        BG,
        circ(160, 34, 16),
        cloud(56, 44, 0.9),
        rect(0, 158, 200, 42),
        rect(16, 174, 30, 6, 2), rect(86, 174, 30, 6, 2), rect(156, 174, 30, 6, 2),
        path('M18 142 L18 116 Q20 106 34 104 L58 102 L78 74 Q82 70 90 70 L130 70 Q138 70 142 76 L160 102 L172 104 Q184 106 184 120 L184 142 Z'),
        poly('84,78 106,78 106,102 66,102'),
        poly('114,78 132,78 150,102 114,102'),
        circ(55, 144, 19),
        circ(148, 144, 19),
        circ(55, 144, 7),
        circ(148, 144, 7),
        rect(172, 110, 12, 10, 3),
        rect(18, 112, 8, 10, 3),
      ],
      deco: '<path d="M110 104 V138 M118 114 H128" fill="none"/>',
    },
    {
      id: 'blume', name: 'die Blume', e: '🌸',
      regions: [
        BG,
        circ(170, 30, 16),
        rect(0, 184, 200, 16),
        path('M97 96 H103 V150 H97 Z'),
        path('M98 138 C80 116 58 120 52 132 C68 144 86 146 98 138 Z'),
        path('M102 124 C120 102 142 106 148 118 C132 130 114 132 102 124 Z'),
        petals(100, 72, 27, 18, 6),
        circ(100, 72, 16),
        path('M68 156 H132 L124 194 H76 Z'),
        rect(62, 146, 76, 16, 4),
        path('M30 70 C26 60 38 56 40 64 C42 56 54 60 50 70 C46 78 34 78 30 70 Z'),
      ],
      deco: '<path d="M40 64 V74" fill="none"/>',
    },
    {
      id: 'fisch', name: 'der Fisch', e: '🐟',
      regions: [
        BG,
        path('M0 176 Q50 164 100 176 T200 172 V200 H0 Z'),
        path('M28 176 C18 152 40 140 28 112 C46 132 36 150 42 176 Z'),
        path('M164 176 C156 154 176 144 168 122 C184 140 172 158 178 176 Z'),
        poly('140,100 182,66 174,100 182,134'),
        path('M68 72 C78 44 112 44 122 70 Z'),
        ell(95, 100, 55, 34),
        path('M80 68 C70 85 70 115 80 132 L92 134 C82 115 82 85 92 66 Z'),
        path('M110 68 C100 85 100 115 110 132 L121 129 C112 115 112 85 121 71 Z'),
        path('M96 110 C108 112 116 122 112 130 C102 128 94 120 96 110 Z'),
        circ(62, 92, 9),
        circ(40, 52, 6), circ(28, 32, 4), circ(50, 22, 5),
        star(150, 186, 9, 4),
      ],
      deco: '<circle cx="60" cy="92" r="4" fill="#2b2d42"/><path d="M42 110 q6 5 13 0" fill="none"/>',
    },
    {
      id: 'rakete', name: 'die Rakete', e: '🚀',
      regions: [
        BG,
        star(34, 40, 11, 5), star(172, 96, 9, 4), star(30, 150, 9, 4), star(168, 168, 11, 5), star(60, 100, 6, 3),
        circ(158, 40, 18),
        path('M70 120 L42 166 L72 156 Z'),
        path('M130 120 L158 166 L128 156 Z'),
        path('M82 158 Q100 198 118 158 Z'),
        path('M100 18 C125 40 132 75 130 110 L130 160 L70 160 L70 110 C68 75 75 40 100 18 Z'),
        path('M100 18 C112 29 120 42 123.5 55 L76.5 55 C80 42 88 29 100 18 Z'),
        rect(70, 128, 60, 12),
        circ(100, 88, 15),
      ],
      deco: '<path d="M134 46 Q158 30 182 36" fill="none"/><path d="M136 34 Q160 50 180 46" fill="none" opacity=".6"/><path d="M100 162 V170" fill="none"/>',
    },
    {
      id: 'dino', name: 'der Dino', e: '🦕',
      regions: [
        BG,
        circ(32, 32, 16),
        cloud(108, 34, 0.8),
        path('M0 170 Q100 158 200 170 V200 H0 Z'),
        rect(52, 128, 18, 44, 7),
        rect(136, 126, 18, 44, 7),
        path('M4 158 C30 150 45 100 95 92 C120 88 135 95 145 98 C152 80 154 60 156 48 C158 34 170 28 182 32 C194 36 194 52 182 56 C176 58 172 62 171 72 C170 95 170 115 165 128 C155 155 120 158 90 158 C60 158 40 160 4 158 Z'),
        rect(78, 134, 18, 40, 7),
        rect(116, 134, 18, 40, 7),
        circ(92, 118, 9), circ(120, 128, 7), circ(66, 134, 6), circ(112, 106, 5),
        path('M14 170 C12 156 24 150 30 158 C36 150 48 156 46 170 Z'),
      ],
      deco: '<circle cx="180" cy="41" r="3" fill="#2b2d42"/><path d="M184 50 q4 1 7 -2" fill="none"/>',
    },
    {
      id: 'schmetterling', name: 'der Schmetterling', e: '🦋',
      regions: [
        BG,
        path('M0 182 Q100 172 200 182 V200 H0 Z'),
        path('M100 96 C75 40 25 26 22 66 C20 92 55 104 100 100 Z'),
        path('M100 96 C125 40 175 26 178 66 C180 92 145 104 100 100 Z'),
        path('M100 104 C65 102 34 120 44 156 C54 182 92 162 100 116 Z'),
        path('M100 104 C135 102 166 120 156 156 C146 182 108 162 100 116 Z'),
        circ(56, 66, 12), circ(144, 66, 12), circ(66, 140, 9), circ(134, 140, 9),
        circ(80, 84, 6), circ(120, 84, 6),
        ell(100, 116, 9, 40),
        circ(100, 70, 11),
        petals(24, 186, 6, 5, 5), circ(24, 186, 4),
        petals(176, 186, 6, 5, 5), circ(176, 186, 4),
      ],
      deco: '<path d="M96 61 Q86 36 72 28 M104 61 Q114 36 128 28" fill="none"/><circle cx="72" cy="28" r="3.5" fill="#2b2d42"/><circle cx="128" cy="28" r="3.5" fill="#2b2d42"/><circle cx="96" cy="68" r="2" fill="#2b2d42"/><circle cx="104" cy="68" r="2" fill="#2b2d42"/><path d="M95 75 q5 4 10 0" fill="none"/>',
    },
    {
      id: 'schiff', name: 'das Segelschiff', e: '⛵',
      regions: [
        BG,
        circ(166, 30, 16),
        cloud(50, 40, 0.9),
        path('M0 150 Q25 140 50 150 T100 150 T150 150 T200 150 V200 H0 Z'),
        rect(97, 14, 6, 120),
        poly('103,16 130,23 103,30'),
        poly('106,38 106,126 162,126'),
        poly('94,50 94,126 48,126'),
        path('M28 130 H172 L152 166 H48 Z'),
        path('M37 146 H163 L158 155 H42 Z'),
        circ(66, 138, 4.5), circ(100, 138, 4.5), circ(134, 138, 4.5),
        path('M0 178 Q25 170 50 178 T100 178 T150 178 T200 178 V200 H0 Z'),
      ],
      deco: '<path d="M140 64 q7 -7 14 0 q7 -7 14 0 M30 86 q6 -6 12 0 q6 -6 12 0" fill="none"/>',
    },
    {
      id: 'regenbogen', name: 'der Regenbogen', e: '🌈',
      regions: [
        BG,
        circ(170, 36, 15),
        ...[92, 80, 68, 56, 44, 32].map((R) => path(`M${100 - R} 172 A${R} ${R} 0 0 1 ${100 + R} 172 L${100 + R - 12} 172 A${R - 12} ${R - 12} 0 0 0 ${100 - R + 12} 172 Z`)),
        path('M0 172 H200 V200 H0 Z'),
        cloud(30, 162, 1),
        cloud(168, 162, 1),
      ],
      deco: '',
    },
  ];

  /* ------------------------------------------------------------------
     Speichern / Laden
     ------------------------------------------------------------------ */
  const key = (pic) => 'ausmalen-' + pic.id;
  const loadFills = (pic) => {
    const v = LT.store.get(key(pic), null);
    return v && typeof v === 'object' && v.fills ? v.fills : {};
  };
  const saveFills = (pic, fills) => {
    if (Object.keys(fills).length) LT.store.set(key(pic), { fills, t: Date.now() });
    else LT.store.remove(key(pic));
  };

  /** Bild als SVG aufbauen; liefert { svg, regions } */
  function buildSVG(pic, fills, cls) {
    const svg = S('svg', { class: cls, viewBox: '0 0 200 200', role: 'img', 'aria-label': pic.name });
    const g = S('g', { class: 'mal-regions' });
    g.innerHTML = pic.regions.join('');
    const regions = Array.from(g.children).map((node, i) => {
      // Gruppe (z. B. Flo mit Transformation): die Form darin ist die Fläche
      const shape = node.tagName.toLowerCase() === 'g' ? node.firstElementChild : node;
      shape.classList.add('mal-region');
      if (i === 0) shape.classList.add('mal-bg');
      shape.setAttribute('fill', fills[i] || '#ffffff');
      shape.dataset.i = i;
      return shape;
    });
    const deco = S('g', { class: 'mal-deco' });
    deco.innerHTML = pic.deco || '';
    svg.append(g, deco);
    return { svg, regions };
  }

  /* ------------------------------------------------------------------
     Spiel
     ------------------------------------------------------------------ */
  LT.registerGame({
    id: 'ausmalen',
    area: 'werkstatt',
    title: 'Ausmalbilder',
    icon: '🖍️',
    type: 'free',
    levels: 1,
    parent: {
      skill: 'Kreativität, Farben & Auge-Hand-Koordination',
      goal: 'Ihr Kind malt Bilder frei aus. Es wählt Farben bewusst, lernt Farbnamen (jede Farbe wird vorgelesen) und trifft gezielt auch kleine Flächen. Die Bilder werden gespeichert, damit es später weitermalen kann.',
      levels: ['Freies Ausmalen: 10 Bilder (Flo der Fuchs, Haus, Auto, Blume, Fisch, Rakete, Dino, Schmetterling, Segelschiff, Regenbogen), 12 Farben und ein Schwamm zum Wegwischen'],
      tip: 'Fragen Sie nach dem Malen: „Erzähl mir von deinem Bild!“ Ein lila Fuchs ist übrigens völlig in Ordnung – Kreativität kennt keine falschen Farben.',
    },

    play(ctx) {
      return new Promise((resolve) => {
        let finished = false;
        let current = null; // { pic, fills, regions, svg }
        let color = COLORS[0];

        function finish() {
          if (finished) return;
          finished = true;
          if (current) saveFills(current.pic, current.fills);
          LT.sfx.play('win');
          const painted = current && Object.keys(current.fills).length > 0;
          ctx.say(painted ? 'Wunderschön! Dein Bild ist gespeichert.' : 'Bis bald! Deine Bilder warten hier auf dich.').then(() => resolve({}));
        }

        /* ---------- Galerie ---------- */
        function showGallery(first) {
          current = null;
          U.clear(ctx.stage);
          ctx.stage.className = 'stage mal-stage';
          const grid = el('div.mal-gallery');
          const area = el('div.mal-gallery-area', grid);
          const cards = PICTURES.map((pic) => {
            const fills = loadFills(pic);
            const { svg } = buildSVG(pic, fills, 'mal-thumb-svg');
            const card = el('button.mal-card', { type: 'button', 'aria-label': pic.name }, svg,
              Object.keys(fills).length ? el('span.mal-card-badge', U.emoji('🖌️')) : null);
            card.addEventListener('click', () => {
              LT.sfx.play('click');
              openEditor(pic);
            });
            grid.appendChild(card);
            return card;
          });
          const done = LT.ui.button('Fertig', finish, { icon: '✅', cls: 'btn-green mal-done' });
          ctx.stage.append(el('div.mal-gallery-actions', done), area);
          layoutGallery(area, grid, cards.length);
          ctx.instruct(first ? 'Such dir ein Bild zum Ausmalen aus!' : 'Welches Bild möchtest du jetzt malen?');
          ctx.testSolve(() => { if (!current) openEditor(PICTURES[0], true); solveCurrent(); });
        }

        function layoutGallery(area, grid, n) {
          const apply = () => {
            const w = area.clientWidth, h = area.clientHeight;
            if (!w || !h) return;
            const gap = Math.max(8, Math.min(18, Math.round(Math.min(w, h) * 0.025)));
            let best = { size: 0, cols: 1 };
            for (let cols = 2; cols <= 5; cols++) {
              const rows = Math.ceil(n / cols);
              const size = Math.min((w - gap * (cols - 1)) / cols, (h - gap * (rows - 1)) / rows, 240);
              if (size > best.size) best = { size, cols };
            }
            grid.style.gridTemplateColumns = `repeat(${best.cols}, ${Math.floor(best.size)}px)`;
            grid.style.gap = gap + 'px';
          };
          apply();
          requestAnimationFrame(apply);
          ctx.listen(window, 'resize', apply);
        }

        /* ---------- Malfläche ---------- */
        function openEditor(pic, silent) {
          U.clear(ctx.stage);
          ctx.stage.className = 'stage mal-stage';
          const fills = Object.assign({}, loadFills(pic));
          const { svg, regions } = buildSVG(pic, fills, 'mal-board');
          current = { pic, fills, regions, svg };

          const boardArea = el('div.mal-area', svg);
          const palette = el('div.mal-palette');
          const swatches = COLORS.concat([ERASER]).map((col) => {
            const b = el('button.mal-swatch' + (col.eraser ? '.eraser' : ''), {
              type: 'button', 'aria-label': col.name, title: col.name, style: { '--sw': col.c },
            }, col.eraser ? U.emoji('🧽') : null);
            b.addEventListener('click', () => {
              color = col;
              swatches.forEach((x) => x.classList.toggle('selected', x === b));
              LT.sfx.play('tap');
              ctx.say(col.eraser ? 'Der Schwamm wischt die Farbe weg.' : col.name);
            });
            if (col === color) b.classList.add('selected');
            palette.appendChild(b);
            return b;
          });
          const back = el('button.btn-round.mal-back', { type: 'button', 'aria-label': 'Andere Bilder', title: 'Andere Bilder' }, U.emoji('🖼️'));
          back.addEventListener('click', () => { LT.sfx.play('click'); saveFills(pic, fills); showGallery(false); });
          const reset = el('button.btn-round.mal-reset', { type: 'button', 'aria-label': 'Neu anfangen', title: 'Neu anfangen' }, U.emoji('🔄'));
          reset.addEventListener('click', () => { LT.sfx.play('click'); askReset(); });
          const done = LT.ui.button('Fertig', finish, { icon: '✅', cls: 'btn-green mal-done' });
          const actions = el('div.mal-actions', back, reset, done);
          const side = el('div.mal-side', palette, actions);
          ctx.stage.appendChild(el('div.mal-editor', boardArea, side));
          W.fit(ctx, boardArea, svg, 1);

          // Fläche antippen = füllen
          regions.forEach((r) => {
            r.addEventListener('click', () => {
              if (finished) return;
              const i = r.dataset.i;
              if (color.eraser) delete fills[i];
              else fills[i] = color.c;
              r.setAttribute('fill', color.c);
              r.classList.remove('mal-splash');
              void r.getBBox();
              r.classList.add('mal-splash');
              LT.sfx.play('pop');
              saveFills(pic, fills);
            });
          });

          function askReset() {
            const ov = LT.ui.overlay([
              el('h2', 'Neu anfangen?'),
              el('div.mal-confirm-pic', buildSVG(pic, {}, 'mal-thumb-svg').svg),
              el('div.actions',
                LT.ui.button('Ja', () => {
                  ov.remove();
                  Object.keys(fills).forEach((k) => delete fills[k]);
                  regions.forEach((r) => r.setAttribute('fill', '#ffffff'));
                  saveFills(pic, fills);
                  LT.sfx.play('whoosh');
                  ctx.say('Alles wieder weiß. Viel Spaß beim Malen!');
                }, { icon: '✅', cls: 'btn-primary', big: true }),
                LT.ui.button('Nein', () => ov.remove(), { icon: '❌', big: true })),
            ], { className: 'mal-confirm' });
            ctx.onCleanup(() => ov.remove());
            ctx.say('Möchtest du das Bild wieder ganz weiß machen?');
          }

          if (!silent) {
            const restored = Object.keys(fills).length > 0;
            ctx.instruct(`${U.cap(pic.name)}! ` + (restored
              ? 'Du kannst weitermalen. Tippe auf eine Farbe und dann auf eine Fläche im Bild.'
              : 'Tippe auf eine Farbe. Dann tippe auf eine Fläche im Bild.'));
          }
          ctx.testSolve(solveCurrent);
        }

        /** Testmodus: alle Flächen färben und beenden. */
        function solveCurrent() {
          if (!current || finished) return;
          current.regions.forEach((r, i) => {
            const c = COLORS[i % COLORS.length].c;
            current.fills[i] = c;
            r.setAttribute('fill', c);
          });
          saveFills(current.pic, current.fills);
          finish();
        }

        showGallery(true);
      });
    },
  });

  LT.werk.malPictures = PICTURES;
})();
