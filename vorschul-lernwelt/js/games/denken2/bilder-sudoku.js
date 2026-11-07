/* ==========================================================================
   Spiel „Bilder-Sudoku“ 🧩 – logisches Schließen.

   Didaktik:
   - Lateinische Quadrate mit Bildern statt Zahlen: „In jeder Reihe und in
     jeder Spalte kommt jedes Tier nur einmal vor.“ Das Kind schließt aus
     dem, was schon da ist, auf das, was fehlt (Ausschlussverfahren).
   - Jedes Rätsel wird erzeugt UND geprüft: Es ist eindeutig lösbar und lässt
     sich allein mit dem einfachsten Schluss lösen („In diesem Feld fehlt nur
     noch ein Tier“) – keine Raterei.
   - Bedienung ohne Lesen: Ein lösbares leeres Feld ist schon ausgewählt
     (leuchtet); das Kind tippt unten das passende Bild an. Es kann aber auch
     jedes andere leere Feld antippen.
   - Fehler: Flo erklärt konkret, WARUM es nicht passt („In dieser Reihe ist
     schon eine Katze.“) und zeigt auf das doppelte Bild. Nach 2 Fehlern im
     selben Feld werden Reihe und Spalte hervorgehoben und das passende Bild
     leuchtet.
   - Stufen: 3×3 mit 1 Lücke · 3×3 mit 3 Lücken · 4×4 (mit 2×2-Kästchen)
     mit 3–4 Lücken · 4×4 mit 6–8 Lücken.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* Bildersätze: gut unterscheidbare Farben/Formen; ein = unbestimmter Artikel */
  const SETS = [
    { id: 'haustiere', kind: 'tier', items: [
      { e: '🐶', w: 'Hund', a: 'der', ein: 'ein' }, { e: '🐱', w: 'Katze', a: 'die', ein: 'eine' },
      { e: '🐸', w: 'Frosch', a: 'der', ein: 'ein' }, { e: '🐷', w: 'Schwein', a: 'das', ein: 'ein' }] },
    { id: 'zoo', kind: 'tier', items: [
      { e: '🦁', w: 'Löwe', a: 'der', ein: 'ein' }, { e: '🐼', w: 'Panda', a: 'der', ein: 'ein' },
      { e: '🐵', w: 'Affe', a: 'der', ein: 'ein' }, { e: '🐧', w: 'Pinguin', a: 'der', ein: 'ein' }] },
    { id: 'hof', kind: 'tier', items: [
      { e: '🐮', w: 'Kuh', a: 'die', ein: 'eine' }, { e: '🐔', w: 'Huhn', a: 'das', ein: 'ein' },
      { e: '🐴', w: 'Pferd', a: 'das', ein: 'ein' }, { e: '🐑', w: 'Schaf', a: 'das', ein: 'ein' }] },
    { id: 'krabbel', kind: 'tier', items: [
      { e: '🐞', w: 'Marienkäfer', a: 'der', ein: 'ein' }, { e: '🐝', w: 'Biene', a: 'die', ein: 'eine' },
      { e: '🐌', w: 'Schnecke', a: 'die', ein: 'eine' }, { e: '🦋', w: 'Schmetterling', a: 'der', ein: 'ein' }] },
    { id: 'obst', kind: 'obst', items: [
      { e: '🍎', w: 'Apfel', a: 'der', ein: 'ein' }, { e: '🍌', w: 'Banane', a: 'die', ein: 'eine' },
      { e: '🍐', w: 'Birne', a: 'die', ein: 'eine' }, { e: '🍓', w: 'Erdbeere', a: 'die', ein: 'eine' }] },
  ];
  const KIND = {
    tier: { every: 'jedes Tier', which: 'Welches Tier' },
    obst: { every: 'jede Obstsorte', which: 'Welches Obst' },
  };

  const LEVELS = {
    1: { n: 3, holes: [1, 1] },
    2: { n: 3, holes: [3, 3] },
    3: { n: 4, holes: [3, 4] },
    4: { n: 4, holes: [6, 8] },
  };

  /* ------------------------------------------------------------------
     Rätsel-Erzeugung
     ------------------------------------------------------------------ */
  const boxOf = (n, r, c) => (n === 4 ? Math.floor(r / 2) * 2 + Math.floor(c / 2) : -1);

  /** Darf Symbol v in Feld (r,c) stehen? (Reihe, Spalte, bei 4×4 auch Kästchen) */
  function allowed(g, n, r, c, v) {
    for (let i = 0; i < n; i++) {
      if (i !== c && g[r][i] === v) return false;
      if (i !== r && g[i][c] === v) return false;
    }
    if (n === 4) {
      const br = Math.floor(r / 2) * 2;
      const bc = Math.floor(c / 2) * 2;
      for (let i = br; i < br + 2; i++) for (let j = bc; j < bc + 2; j++) {
        if ((i !== r || j !== c) && g[i][j] === v) return false;
      }
    }
    return true;
  }

  /** Vollständiges, zufälliges Lösungsgitter (Backtracking) */
  function fullGrid(n) {
    const g = Array.from({ length: n }, () => Array(n).fill(-1));
    const fill = (pos) => {
      if (pos === n * n) return true;
      const r = Math.floor(pos / n);
      const c = pos % n;
      for (const v of U.shuffle(U.range(0, n - 1))) {
        if (allowed(g, n, r, c, v)) {
          g[r][c] = v;
          if (fill(pos + 1)) return true;
          g[r][c] = -1;
        }
      }
      return false;
    };
    fill(0);
    return g;
  }

  /** Kandidaten eines leeren Feldes */
  function candidates(g, n, r, c) {
    return U.range(0, n - 1).filter((v) => allowed(g, n, r, c, v));
  }

  /** Mit „nur ein Bild passt noch“ vollständig lösbar? (garantiert Eindeutigkeit) */
  function solvableBySingles(puzzle, n) {
    const g = puzzle.map((row) => row.slice());
    for (;;) {
      let progress = false;
      let empty = 0;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        if (g[r][c] !== -1) continue;
        empty++;
        const cand = candidates(g, n, r, c);
        if (cand.length === 1) { g[r][c] = cand[0]; progress = true; }
        else if (!cand.length) return false;
      }
      if (!empty) return true;
      if (!progress) return false;
    }
  }

  function makePuzzle(cfg) {
    const n = cfg.n;
    for (let tries = 0; tries < 400; tries++) {
      const sol = fullGrid(n);
      const holes = U.randInt(cfg.holes[0], cfg.holes[1]);
      const cells = U.shuffle(U.range(0, n * n - 1)).slice(0, holes);
      const puzzle = sol.map((row) => row.slice());
      cells.forEach((p) => { puzzle[Math.floor(p / n)][p % n] = -1; });
      if (solvableBySingles(puzzle, n)) return { sol, puzzle };
    }
    // Rückfall (praktisch nie): eine einzige Lücke
    const sol = fullGrid(n);
    const puzzle = sol.map((row) => row.slice());
    puzzle[0][0] = -1;
    return { sol, puzzle };
  }

  LT.registerGame({
    id: 'bilder-sudoku',
    area: 'denken',
    title: 'Bilder-Sudoku',
    icon: '🧩',
    levels: 4,
    rounds: 4,
    parent: {
      skill: 'Logisches Schließen (Ausschlussverfahren)',
      goal: 'Ihr Kind lernt, Regeln anzuwenden und Schlüsse zu ziehen: „In dieser Reihe gibt es schon Hund und Katze – also fehlt der Frosch.“ Das schult systematisches Denken, Konzentration und Ausdauer.',
      levels: [
        '3 × 3 Felder mit einer Lücke',
        '3 × 3 Felder mit drei Lücken',
        '4 × 4 Felder mit Viererkästchen, 3–4 Lücken',
        '4 × 4 Felder mit Viererkästchen, 6–8 Lücken',
      ],
      tip: 'Legen Sie mit Besteck, Bausteinen oder Obst ein kleines 3×3-Feld: In jeder Reihe und Spalte darf jedes Ding nur einmal liegen. Ein Teil fehlt – welches?',
    },

    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      const n = cfg.n;
      const set = U.pickFresh('sud-set', SETS, 2, (s) => s.id);
      const pics = U.sample(set.items, n);
      const kind = KIND[set.kind];
      const { sol, puzzle } = makePuzzle(cfg);
      const grid = puzzle.map((row) => row.slice()); // aktueller Stand

      // --- Spielfeld ---
      const board = el('div.sud-board', { style: { '--n': n } });
      board.classList.add(n === 4 ? 'sud-4' : 'sud-3');
      const cells = [];
      for (let r = 0; r < n; r++) {
        cells.push([]);
        for (let c = 0; c < n; c++) {
          const v = grid[r][c];
          const cell = el('button.sud-cell', { type: 'button', 'aria-label': v === -1 ? 'leeres Feld' : pics[v].w });
          if (n === 4) {
            if (c === 1) cell.classList.add('sud-br');
            if (r === 1) cell.classList.add('sud-bb');
          }
          if (v === -1) cell.classList.add('empty');
          else cell.appendChild(U.emoji(pics[v].e));
          cell._r = r;
          cell._c = c;
          board.appendChild(cell);
          cells[r].push(cell);
        }
      }
      const palette = el('div.sud-palette');
      const palBtns = pics.map((p, v) => {
        const b = el('button.sud-pick', { type: 'button', 'aria-label': p.w }, U.emoji(p.e));
        b._v = v;
        palette.appendChild(b);
        return b;
      });
      // Querformat: Bildauswahl rechts neben dem Gitter (per CSS), hochkant darunter
      ctx.stage.appendChild(el('div.sud-main', board, el('div.sud-hand', U.emoji('👇')), palette));

      let sel = null;
      let busy = true;
      let cellWrong = 0;
      let done = null;
      const finished = new Promise((r) => { done = r; });

      const empties = () => cells.flat().filter((x) => grid[x._r][x._c] === -1);

      function clearHelp() {
        cells.flat().forEach((x) => x.classList.remove('sud-line', 'sud-dup'));
        palBtns.forEach((b) => { ctx.unhint(b); ctx.markTest(b, false); });
      }
      function select(cell) {
        if (sel) sel.classList.remove('selected');
        sel = cell;
        cellWrong = 0;
        clearHelp();
        if (!cell) return;
        cell.classList.add('selected');
        ctx.markTest(palBtns[sol[cell._r][cell._c]]);
      }
      /** Ein Feld wählen, das man JETZT schon sicher füllen kann */
      function autoSelect() {
        const list = empties();
        const easy = list.find((x) => candidates(grid, n, x._r, x._c).length === 1);
        select(easy || list[0] || null);
      }

      // --- Einführung ---
      const rule = n === 4
        ? `In jeder Reihe, in jeder Spalte und in jedem Viererkästchen kommt ${kind.every} nur einmal vor.`
        : `In jeder Reihe und in jeder Spalte kommt ${kind.every} nur einmal vor.`;
      const holes = empties().length;
      const question = holes === 1
        ? `${rule} ${kind.which} fehlt? Tippe unten das richtige Bild an.`
        : `${rule} Fülle die leeren Felder! Tippe unten das passende Bild an.`;
      // Bilder benennen (Palette leuchtet nacheinander) – jede Aufgabe hat einen
      // neuen Bildersatz, deshalb immer (das Kind braucht die Wörter für Flos Erklärungen)
      {
        for (const b of palBtns) {
          if (!ctx.active) return;
          b.classList.add('speaking');
          await ctx.say(pics[b._v].w);
          b.classList.remove('speaking');
        }
      }
      if (!ctx.active) return;
      autoSelect();
      ctx.instruct(question);
      busy = false;

      // --- Leeres Feld antippen ---
      cells.flat().forEach((cell) => {
        cell.addEventListener('click', () => {
          if (busy || !ctx.active) return;
          if (grid[cell._r][cell._c] !== -1) {
            ctx.say(pics[grid[cell._r][cell._c]].w); // volle Felder: nur benennen
            return;
          }
          LT.sfx.play('tap');
          select(cell);
        });
      });

      // --- Bild wählen ---
      palBtns.forEach((b) => {
        b.addEventListener('click', async () => {
          if (busy || !ctx.active) return;
          if (!sel) { autoSelect(); return; }
          const r = sel._r;
          const c = sel._c;
          const v = b._v;
          const p = pics[v];
          busy = true;
          if (v === sol[r][c]) {
            grid[r][c] = v;
            const cell = sel;
            cell.classList.remove('empty', 'selected');
            cell.appendChild(U.emoji(p.e));
            cell.setAttribute('aria-label', p.w);
            clearHelp();
            sel = null;
            const left = empties().length;
            if (!left) {
              await ctx.correct(board, { say: n === 4
                ? `Super! Jetzt kommt in jeder Reihe, jeder Spalte und jedem Kästchen ${kind.every} genau einmal vor.`
                : `Super! Jetzt kommt in jeder Reihe und jeder Spalte ${kind.every} genau einmal vor.` });
              done();
              return;
            }
            LT.sfx.play('correct');
            LT.ui.animate(cell, 'joy');
            await ctx.say(`Genau, ${p.a} ${p.w}!`);
            autoSelect();
            busy = false;
          } else {
            // Warum passt es nicht? Doppeltes Bild suchen und zeigen
            let where = '';
            let dup = null;
            for (let i = 0; i < n && !dup; i++) {
              if (grid[r][i] === v) { dup = cells[r][i]; where = 'In dieser Reihe'; }
            }
            for (let i = 0; i < n && !dup; i++) {
              if (grid[i][c] === v) { dup = cells[i][c]; where = 'In dieser Spalte'; }
            }
            if (!dup && n === 4) {
              cells.flat().forEach((x) => {
                if (!dup && boxOf(n, x._r, x._c) === boxOf(n, r, c) && grid[x._r][x._c] === v) { dup = x; where = 'In diesem Kästchen'; }
              });
            }
            if (!dup) {
              // Kein Regelverstoß – das Feld ist nur noch nicht eindeutig: zu einem lösbaren Feld lenken
              await ctx.say('Hier kann man das noch nicht sicher wissen. Probier zuerst dieses Feld!');
              autoSelect();
              busy = false;
              return;
            }
            dup.classList.add('sud-dup');
            cellWrong++;
            await ctx.wrong(b, { say: `${where} ist schon ${p.ein} ${p.w}.` });
            if (!ctx.active) return;
            dup.classList.remove('sud-dup');
            if (cellWrong >= 2) {
              // Hilfe: Reihe und Spalte hervorheben, passendes Bild leuchtet
              cells.flat().forEach((x) => {
                if (x._r === r || x._c === c || (n === 4 && boxOf(n, x._r, x._c) === boxOf(n, r, c))) x.classList.add('sud-line');
              });
              ctx.hint(palBtns[sol[r][c]]);
              await ctx.say(n === 4
                ? `Schau dir die Reihe, die Spalte und das Kästchen an. ${kind.which} fehlt hier noch?`
                : `Schau dir die Reihe und die Spalte an. ${kind.which} fehlt hier noch?`);
            }
            busy = false;
          }
        });
      });

      await finished;
    },
  });
})();
