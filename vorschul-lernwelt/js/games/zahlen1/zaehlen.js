/* ==========================================================================
   Spiel „Wie viele?“ (Zählen) – REFERENZ-IMPLEMENTIERUNG für alle Spiele.

   Didaktik:
   - Eins-zu-eins-Zuordnung: Das Kind kann jedes Ding antippen; es wird
     markiert und die Zahl wird mitgezählt („eins, zwei, drei …“).
   - Kardinalprinzip: Nach der richtigen Antwort wird die Menge noch einmal
     benannt („Richtig, sieben Äpfel!“) – die letzte Zählzahl ist die Anzahl.
   - Hilfe nach 2 Fehlversuchen: Flo zählt langsam vor und zeigt auf jedes Ding.
   - Stufen: geordnet (Fünferreihen) → ungeordnet → Zahlenraum bis 20.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  U.css('game-zaehlen', `
    .zaehlen-field {
      background: var(--card); border-radius: var(--radius-l); box-shadow: var(--shadow);
      padding: clamp(10px, 2.4vmin, 24px); display: grid; gap: clamp(4px, 1.2vmin, 12px);
      justify-content: center; align-content: center; max-width: 100%;
    }
    .zaehlen-item {
      appearance: none; border: 0; background: transparent; cursor: pointer; padding: 0;
      width: var(--cell); height: var(--cell); font-size: calc(var(--cell) * 0.78);
      display: flex; align-items: center; justify-content: center; position: relative;
      border-radius: 50%; transition: transform .15s;
    }
    .zaehlen-item:active { transform: scale(.92); }
    .zaehlen-item.counted { background: var(--area-soft); }
    .zaehlen-item .num {
      position: absolute; right: -4px; top: -6px; min-width: 26px; height: 26px; border-radius: 13px;
      background: var(--area); color: #fff; font: 700 16px var(--font); display: flex; align-items: center;
      justify-content: center; padding: 0 5px; box-shadow: 0 2px 0 rgba(0,0,0,.2);
    }
    .zaehlen-item.pointing { transform: scale(1.25); }
    .zaehlen-row { display: flex; gap: clamp(4px, 1.2vmin, 12px); justify-content: center; }
    .zaehlen-tip { font-size: clamp(15px, 2.4vmin, 20px); color: var(--ink-soft); font-weight: 700; text-align: center; }
  `);

  /** Zählbare Bilder: haben einen Plural und sind gut erkennbar. */
  function countables() {
    return LT.lexikon.words.filter((w) => w.p && ['obst', 'tiere', 'spielzeug', 'natur', 'fahrzeuge', 'essen', 'gemuese'].includes(w.c));
  }

  const LEVELS = {
    1: { min: 1, max: 5, layout: 'row', choices: 3 },
    2: { min: 3, max: 10, layout: 'five', choices: 4 },
    3: { min: 4, max: 10, layout: 'scatter', choices: 4 },
    4: { min: 11, max: 20, layout: 'ten', choices: 4 },
  };

  function numberChoices(n, count, min, max) {
    const set = new Set([n]);
    const near = U.shuffle([n - 1, n + 1, n - 2, n + 2, n + 3, n - 3]).filter((x) => x >= Math.max(1, min - 2) && x <= max + 2);
    for (const x of near) {
      if (set.size >= count) break;
      set.add(x);
    }
    while (set.size < count) set.add(U.randInt(1, max + 2));
    return Array.from(set).sort((a, b) => a - b);
  }

  LT.registerGame({
    id: 'zaehlen',
    area: 'zahlen',
    title: 'Wie viele?',
    icon: '🍎',
    levels: 4,
    rounds: 5,
    parent: {
      skill: 'Zählen & Anzahl bestimmen',
      goal: 'Ihr Kind zählt Dinge eins nach dem anderen ab (Eins-zu-eins-Zuordnung), erkennt, dass die zuletzt genannte Zahl die Anzahl angibt (Kardinalprinzip), und ordnet der Menge die passende Ziffer zu.',
      levels: ['1 bis 5 Dinge in einer Reihe', '3 bis 10 Dinge in Fünferreihen (strukturiert)', '4 bis 10 Dinge durcheinander', '11 bis 20 Dinge in Zehnerreihen'],
      tip: 'Zählen Sie im Alltag: Treppenstufen, Löffel beim Tischdecken, Autos an der Ampel. Lassen Sie Ihr Kind dabei auf jedes Ding zeigen.',
    },

    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      const n = U.randInt(cfg.min, cfg.max);
      const item = U.pickFresh('zaehlen-item', countables(), 6, (w) => w.id);
      const plural = item.p;

      // --- Spielfeld aufbauen ---
      const cellSize = n > 10 ? 'clamp(34px, 6.4vmin, 60px)' : 'clamp(46px, 9vmin, 84px)';
      const field = el('div.zaehlen-field', { style: { '--cell': cellSize } });
      const items = [];
      const makeItem = () => {
        const b = el('button.zaehlen-item', { type: 'button', 'aria-label': item.w }, U.emoji(item.e));
        items.push(b);
        return b;
      };

      if (cfg.layout === 'row') {
        field.style.gridTemplateColumns = `repeat(${n}, auto)`;
        for (let i = 0; i < n; i++) field.appendChild(makeItem());
      } else if (cfg.layout === 'five' || cfg.layout === 'ten') {
        const per = cfg.layout === 'five' ? 5 : 10;
        field.style.gridTemplateColumns = '1fr';
        for (let r = 0; r < Math.ceil(n / per); r++) {
          const row = el('div.zaehlen-row');
          for (let i = r * per; i < Math.min(n, (r + 1) * per); i++) row.appendChild(makeItem());
          field.appendChild(row);
        }
      } else {
        // ungeordnet: zufällige Zellen in einem Raster
        const cols = 5;
        const rows = 4;
        field.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
        const cells = U.sample(U.range(0, cols * rows - 1), n);
        for (let c = 0; c < cols * rows; c++) {
          if (cells.includes(c)) {
            const b = makeItem();
            b.style.transform = `translate(${U.randInt(-8, 8)}px, ${U.randInt(-8, 8)}px) rotate(${U.randInt(-15, 15)}deg)`;
            field.appendChild(b);
          } else field.appendChild(el('span', { style: { width: 'var(--cell)', height: 'var(--cell)' } }));
        }
      }
      ctx.stage.appendChild(field);
      ctx.stage.appendChild(el('div.zaehlen-tip', U.emoji('👆'), ' Tipp: Tippe jedes Ding an und zähle mit!'));

      // --- Antippen zum Mitzählen (Eins-zu-eins-Zuordnung) ---
      let counted = 0;
      items.forEach((b) => {
        b.addEventListener('click', () => {
          if (b.classList.contains('counted')) return;
          counted++;
          b.classList.add('counted');
          b.appendChild(el('span.num', String(counted)));
          LT.sfx.tone(400 + counted * 30, 0.08, { type: 'triangle', volume: 0.3 });
          ctx.say(U.numberWord(counted));
        });
      });

      const question = `Wie viele ${plural} siehst du?`;
      ctx.instruct(question);

      // Hilfe: Flo zählt vor
      async function countAloud() {
        items.forEach((b) => { b.classList.remove('counted'); const s = b.querySelector('.num'); if (s) s.remove(); });
        counted = 0;
        for (let i = 0; i < items.length; i++) {
          if (!ctx.active) return;
          items[i].classList.add('pointing', 'counted');
          items[i].appendChild(el('span.num', String(i + 1)));
          counted = i + 1;
          await ctx.say(U.numberWord(i + 1));
          items[i].classList.remove('pointing');
        }
      }

      const options = numberChoices(n, cfg.choices, cfg.min, cfg.max).map((k) => ({
        content: String(k),
        text: true,
        correct: k === n,
        say: U.numberWord(k),
      }));
      await ctx.choices(options, {
        shuffle: false,
        size: 'small',
        hintAfter: 3,
        correctSay: () => `Richtig! ${LT.lexikon.count(n, item)}.`,
        // nach dem 2. Fehlversuch zählt Flo gemeinsam mit dem Kind (Eingabe ist solange gesperrt)
        onWrong: async (item, tile, wrongs) => {
          if (wrongs === 2) {
            await ctx.say('Komm, wir zählen zusammen!');
            await countAloud();
          }
        },
      });
    },
  });
})();
