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
  const Z = LT.z1;

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
    .zaehlen-field.blocks { display: flex; flex-wrap: wrap; gap: clamp(10px, 2.6vmin, 28px); }
    .zaehlen-block { display: flex; flex-direction: column; gap: clamp(4px, 1.2vmin, 12px); padding: clamp(4px, 1vmin, 8px); border-radius: 18px; background: var(--area-soft); }
    .zaehlen-block .zaehlen-row { justify-content: flex-start; }
    .zaehlen-tip { font-size: clamp(15px, 2.4vmin, 20px); color: var(--ink-soft); font-weight: 700; text-align: center; }
  `);

  /** Zählbare Bilder: haben einen Plural, sind gut erkennbar und eindeutig EIN Ding
      (nicht 🍒 = zwei Kirschen, 🥞 = Stapel …). Die geprüfte Liste liegt in _shared.js. */
  const AMBIGUOUS = ['kirsche', 'traube', 'kiwi', 'kokosnuss', 'melone', 'pizza', 'pfannkuchen', 'saft', 'brokkoli', 'salat', 'feuer', 'sonne', 'mond', 'regenbogen', 'blitz', 'welle', 'berg'];
  function countables() {
    if (LT.z1 && LT.z1.countables) return LT.z1.countables();
    return LT.lexikon.words.filter((w) => w.p && !AMBIGUOUS.includes(w.id) && ['obst', 'tiere', 'spielzeug', 'natur', 'fahrzeuge', 'essen', 'gemuese'].includes(w.c));
  }

  const LEVELS = {
    1: { min: 1, max: 5, layout: 'row', choices: 3 },
    2: { min: 3, max: 10, layout: 'five', choices: 4 },
    3: { min: 4, max: 10, layout: 'scatter', choices: 4 },
    4: { min: 11, max: 20, layout: 'ten', choices: 4 },
  };

  function numberChoices(n, count, min, max) {
    const set = new Set([n]);
    // Zahlenraum des Kindes nicht verlassen: nie über 20 (21, 22 kennt es noch nicht), nie unter 1
    const lo = Math.max(1, min - 2);
    const hi = Math.min(20, max + 2);
    const near = U.shuffle([n - 1, n + 1, n - 2, n + 2, n + 3, n - 3]).filter((x) => x >= lo && x <= hi);
    for (const x of near) {
      if (set.size >= count) break;
      set.add(x);
    }
    let guard = 0;
    while (set.size < count && guard++ < 100) set.add(U.randInt(lo, hi));
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
      levels: ['1 bis 5 Dinge in einer Reihe', '3 bis 10 Dinge in Fünferreihen (strukturiert)', '4 bis 10 Dinge durcheinander', '11 bis 20 Dinge in Zehnerblöcken (2 × 5) – erst die volle Zehn, dann weiterzählen'],
      tip: 'Zählen Sie im Alltag: Treppenstufen, Löffel beim Tischdecken, Autos an der Ampel. Lassen Sie Ihr Kind dabei auf jedes Ding zeigen.',
    },

    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      // keine direkte Wiederholung derselben Anzahl
      const n = U.pickFresh('zaehlen-n-' + ctx.level, U.range(cfg.min, cfg.max), 2);
      const item = U.pickFresh('zaehlen-item', countables(), 6, (w) => w.id);
      const plural = item.p;

      // --- Spielfeld aufbauen ---
      // Dinge sind antippbar (Mitzählen) → mindestens 56 px; bei 11–20 brechen die
      // Zehnerblöcke auf schmalen Bildschirmen untereinander um.
      const cellSize = n > 10 ? 'clamp(56px, min(8vmin, 7.4vw), 72px)'
        : cfg.layout === 'scatter' ? 'clamp(56px, min(8.6vmin, 15vw), 84px)' // 4 Rasterzeilen
          : 'clamp(56px, min(11vmin, 15vw), 96px)';
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
      } else if (cfg.layout === 'five') {
        field.style.gridTemplateColumns = '1fr';
        for (let r = 0; r < Math.ceil(n / 5); r++) {
          const row = el('div.zaehlen-row');
          for (let i = r * 5; i < Math.min(n, (r + 1) * 5); i++) row.appendChild(makeItem());
          field.appendChild(row);
        }
      } else if (cfg.layout === 'ten') {
        // Zehnerblöcke wie im Zehnerfeld: je 2 Reihen à 5 (passt auch hochkant aufs Handy)
        field.classList.add('blocks');
        for (let b = 0; b < Math.ceil(n / 10); b++) {
          const block = el('div.zaehlen-block');
          for (let r = 0; r < 2; r++) {
            const start = b * 10 + r * 5;
            if (start >= n) break;
            const row = el('div.zaehlen-row');
            for (let i = start; i < Math.min(n, start + 5); i++) row.appendChild(makeItem());
            block.appendChild(row);
          }
          field.appendChild(block);
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
      ctx.setInstruction(question);
      ctx.say(ctx.index === 0 ? `${question} Tippe jedes Ding an und zähle mit!` : question);

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
        if (!ctx.active) return;
        // Kardinalprinzip benennen: Die letzte Zahl sagt, wie viele es sind.
        await ctx.say(n === 1 ? `Es ist nur ${Z.count(1, item)}.` : `Die letzte Zahl sagt uns, wie viele es sind: ${Z.count(n, item)}.`);
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
        hintAfter: 2,
        correctSay: () => `Richtig! ${U.cap(Z.count(n, item))}.`,
        // nach dem 2. Fehlversuch zählt Flo gemeinsam mit dem Kind (Eingabe ist solange gesperrt)
        onWrong: async (choice, tile, wrongs) => {
          if (wrongs === 2) {
            await ctx.say('Komm, wir zählen zusammen!');
            await countAloud();
          }
        },
      });
    },
  });
})();
