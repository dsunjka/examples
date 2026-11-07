/* ==========================================================================
   Spiel „Mehr oder weniger?“ ⚖️ – Mengen vergleichen.

   Didaktik:
   - Vergleichen ist eine Kernidee des Zahlbegriffs: „mehr“, „weniger“ und
     „gleich viele“ werden zunächst an echten Mengen (Teller mit Dingen)
     erlebt, später an Ziffern.
   - Progression: große Unterschiede bis 5 („auf einen Blick“) → kleine
     Unterschiede bis 10 (genau hinsehen/zählen) → „gleich viele“ als
     dritte Möglichkeit → Mengeninvarianz-Falle (Piaget): wenige GROSSE
     Dinge oder eine weit auseinandergezogene Reihe wirken nach „mehr“ –
     entscheidend ist aber die Anzahl. Damit das Kind keine Faustregel
     („die kürzere Reihe“) lernt, sind auch ehrliche Aufgaben gemischt.
     Letzte Stufe: zwei Ziffern vergleichen mit Zahlenstrahl-Hilfe.
   - Hilfe nach 2 Fehlversuchen: Eins-zu-eins-Zuordnung – Flo bildet Paare
     (gleiche Farbe bzw. Verbindungslinien); was übrig bleibt, zeigt, wo
     mehr sind. Bei Ziffern: erst Zahlenstrahl, dann Punkte als Menge.
   - Nach der Antwort werden die Anzahlen gezeigt und die Erkenntnis
     benannt („6 Mäuse sind mehr als 4 Elefanten – auch wenn die Elefanten
     viel größer sind“).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = LT.z1;
  const nw = Z.nw;
  const NW = Z.NW;

  const LEVELS = {
    1: { mode: 'plates', equal: false, less: 0.3 },
    2: { mode: 'plates', equal: false, less: 0.5 },
    3: { mode: 'plates', equal: true, less: 0.45 },
    4: { mode: 'rows', equal: true, less: 0.35 },
    5: { mode: 'digits', less: 0.5 },
  };

  /* Paarfarben (Hintergrund, Ring) für die Eins-zu-eins-Zuordnung */
  const PAIR_COLORS = [
    ['rgba(229,72,77,.22)', '#e5484d'], ['rgba(52,120,224,.22)', '#3478e0'], ['rgba(37,168,90,.24)', '#25a85a'],
    ['rgba(123,85,224,.22)', '#7b55e0'], ['rgba(255,138,61,.26)', '#ff8a3d'], ['rgba(31,181,201,.24)', '#1fb5c9'],
    ['rgba(255,95,162,.22)', '#ff5fa2'], ['rgba(140,100,60,.22)', '#8c643c'], ['rgba(242,169,0,.26)', '#e09b00'],
    ['rgba(90,96,127,.22)', '#5a607f'],
  ];

  /* Positionen auf dem Teller (in %), in Lesereihenfolge */
  const SLOTS = [[38, 22], [62, 22], [20, 40], [40, 40], [60, 40], [80, 40], [20, 60], [40, 60], [60, 60], [80, 60], [38, 78], [62, 78]];

  /* Paare „groß – klein“ für die Mengeninvarianz-Falle (aus dem Lexikon) */
  const SIZE_PAIRS = [
    ['elefant', 'maus', 'Tiere'],
    ['wal', 'fisch', 'Tiere'],
    ['giraffe', 'kueken', 'Tiere'],
    ['baer', 'biene', 'Tiere'],
    ['ananas', 'erdbeere', 'Früchte'],
    ['bus', 'fahrrad', 'Fahrzeuge'],
    ['lastwagen', 'roller', 'Fahrzeuge'],
  ];

  /* ------------------------------------------------------------------
     Zahlenpaare je Stufe
     ------------------------------------------------------------------ */
  function pairsL1() { return [[1, 3], [1, 4], [1, 5], [2, 4], [2, 5]]; }
  function pairsL2() {
    const out = [];
    for (let a = 4; a <= 9; a++) for (const d of [1, 2]) if (a + d <= 10) out.push([a, a + d]);
    return out;
  }
  function pairsL3() {
    const out = [];
    for (let a = 3; a <= 9; a++) for (const d of [1, 2, 3]) if (a + d <= 10) out.push([a, a + d]);
    return out;
  }
  const key = (p) => p.join('-');

  const cnt = (n, w) => Z.count(n, w);
  const verb = (n) => (n === 1 ? 'ist' : 'sind');

  /* ------------------------------------------------------------------
     Bausteine
     ------------------------------------------------------------------ */
  function plateNode(n, thing) {
    const plate = el('div.mv-plate');
    const slots = U.sample(U.range(0, SLOTS.length - 1), n).sort((a, b) => a - b);
    plate._units = slots.map((s) => {
      const [x, y] = SLOTS[s];
      const it = el('span.mv-item', { style: { left: x + U.randInt(-2, 2) + '%', top: y + U.randInt(-2, 2) + '%' } }, U.emoji(thing.e));
      plate.appendChild(it);
      return it;
    });
    return plate;
  }
  function rowNode(n, thing, layout, size) {
    const row = el('div.mv-row.' + layout);
    row._units = [];
    for (let i = 0; i < n; i++) {
      const it = el('span.mv-ritem.' + size, U.emoji(thing.e));
      row.appendChild(it);
      row._units.push(it);
    }
    return row;
  }
  function questionNode(word, suffix) {
    return el('div.mv-question', 'Wo sind ', el('b', word), suffix ? ' ' : '', suffix || '', '?');
  }
  function showCount(tile, n) {
    const old = tile.querySelector('.mv-count');
    if (old) old.remove();
    tile.appendChild(el('span.mv-count', String(n)));
  }

  /** Ausgegraute (falsch getippte) Teller/Reihen wieder sichtbar machen, aber gesperrt lassen. */
  function undim(container) {
    container.querySelectorAll('.mv-plate-tile.is-wrong, .mv-row-tile.is-wrong').forEach((t) => {
      t.classList.remove('is-wrong');
      t.classList.add('mv-was-wrong');
    });
  }

  /** Eins-zu-eins-Zuordnung: Paare einfärben (und optional Linien ziehen). */
  async function pairUp(ctx, A, B, lines, ask, where) {
    const k = Math.min(A.length, B.length);
    await ctx.say('Wir bilden Paare – immer eins von hier und eins von da.');
    for (let i = 0; i < k; i++) {
      if (!ctx.active) return;
      const [bg, ring] = PAIR_COLORS[i % PAIR_COLORS.length];
      [A[i], B[i]].forEach((x) => {
        x.style.setProperty('--pc', bg);
        x.style.setProperty('--pcs', ring);
        x.classList.add('paired');
      });
      if (lines) lines(A[i], B[i], ring);
      LT.sfx.tone(440 + i * 30, 0.08, { type: 'triangle', volume: 0.3 });
      await ctx.sleep(420);
    }
    const extras = A.slice(k).concat(B.slice(k));
    extras.forEach((x) => x.classList.add('extra'));
    if (!ctx.active) return;
    if (!extras.length) {
      await ctx.say('Jedes hat einen Partner. Keins bleibt übrig – es sind gleich viele!');
    } else {
      const e = extras.length;
      const other = where === 'Reihe' ? 'in der anderen Reihe' : 'auf dem anderen Teller';
      const tail = ask === 'less' ? ` Also sind ${other} weniger.` : '';
      await ctx.say(`${e === 1 ? 'Eins bleibt' : NW(e) + ' bleiben'} übrig. Da, wo welche übrig bleiben, sind mehr.${tail}`);
    }
  }

  LT.registerGame({
    id: 'mengen-vergleich',
    area: 'zahlen',
    title: 'Mehr oder weniger?',
    icon: '⚖️',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Mengen vergleichen: mehr, weniger, gleich viele',
      goal: 'Ihr Kind vergleicht Mengen und lernt die Begriffe „mehr“, „weniger“ und „gleich viele“. Es erfährt, dass die Anzahl nicht davon abhängt, wie groß die Dinge sind oder wie weit sie auseinanderliegen (Mengeninvarianz), und lernt die Paarbildung (Eins-zu-eins-Zuordnung) als sichere Vergleichsstrategie. Zuletzt werden Ziffern mit Hilfe des Zahlenstrahls verglichen.',
      levels: [
        'Zwei Teller bis 5 Dinge mit großem Unterschied',
        'Bis 10 Dinge mit kleinem Unterschied (1 oder 2)',
        'Zusätzlich „gleich viele“ als Antwort',
        'Knifflig: große gegen kleine Dinge, lange gegen kurze Reihe',
        'Zwei Ziffern vergleichen: Welche Zahl ist größer oder kleiner?',
      ],
      tip: 'Beim Tischdecken: „Haben wir gleich viele Teller wie Stühle?“ Legen Sie zu jedem Teller einen Löffel (Paare bilden). Legen Sie zwei gleich lange Reihen mit Knöpfen und ziehen Sie eine davon auseinander: „Sind es jetzt mehr?“',
    },

    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      if (cfg.mode === 'digits') return digitsTask(ctx, cfg);
      if (cfg.mode === 'rows') return rowsTask(ctx, cfg);
      return platesTask(ctx, cfg);
    },
  });

  /* ==================================================================
     Stufen 1–3: zwei Teller
     ================================================================== */
  async function platesTask(ctx, cfg) {
    const thing = Z.pickThing('mv-thing');
    let a;
    let b;
    if (cfg.equal && U.chance(0.34)) {
      a = b = U.pickFresh('mv-eq', U.range(3, 9), 3);
    } else {
      const list = ctx.level === 1 ? pairsL1() : ctx.level === 2 ? pairsL2() : pairsL3();
      const p = U.pickFresh('mv-pair-' + ctx.level, list, 3, key);
      [a, b] = U.chance(0.5) ? p : [p[1], p[0]];
    }
    const ask = U.chance(cfg.less) ? 'less' : 'more';
    const word = ask === 'more' ? 'mehr' : 'weniger';
    const answer = a === b ? 'eq' : (ask === 'more') === a > b ? 'left' : 'right';

    // ---------- Aufbau ----------
    ctx.stage.appendChild(questionNode(word, U.emoji(thing.e)));
    const board = el('div.mv-board' + (cfg.equal ? '' : '.no-eq'));
    ctx.stage.appendChild(board);
    const L = plateNode(a, thing);
    const R = plateNode(b, thing);
    const few = Math.max(a, b) <= 5 ? ' few' : '';
    const items = [
      { content: L, correct: answer === 'left', className: 'mv-plate-tile mv-l' + few, aria: 'linker Teller', side: 'left' },
      { content: R, correct: answer === 'right', className: 'mv-plate-tile mv-r' + few, aria: 'rechter Teller', side: 'right' },
    ];
    if (cfg.equal) items.splice(1, 0, { content: '⚖️', label: 'gleich viele', say: 'gleich viele', correct: answer === 'eq', className: 'mv-eq mv-m', side: 'eq' });

    let q = `Auf welchem Teller sind ${word} ${thing.p}?`;
    if (cfg.equal) q = `Auf welchem Teller sind ${word} ${thing.p} – oder sind es gleich viele?`;
    let say = q;
    if (ctx.index === 0) say += cfg.equal ? ' Wenn es gleich viele sind, tippe auf die Waage.' : ' Tippe auf den Teller.';
    ctx.setInstruction(q);
    ctx.say(say);

    const tiles = () => Array.from(board.querySelectorAll('.tile'));
    const helpAt = cfg.equal ? 2 : 1;
    await ctx.choices(items, {
      container: board,
      shuffle: false,
      // Nur zwei Teller: nach einem Fehler bleibt nur noch die Lösung übrig → Hilfe sofort.
      hintAfter: helpAt,
      onWrong: async (item, tile, wrongs) => {
        if (wrongs === helpAt) {
          undim(board);
          await pairUp(ctx, L._units, R._units, null, ask, 'Teller');
        } else if (wrongs === 1) {
          await ctx.say('Schau genau hin. Du kannst auch zählen!');
        }
      },
      onCorrect: () => {
        const [tl, , tr] = cfg.equal ? tiles() : [tiles()[0], null, tiles()[1]];
        showCount(tl, a);
        showCount(tr, b);
      },
      correctSay: () => {
        if (a === b) return `Richtig! Auf beiden Tellern sind ${cnt(a, thing)}. Das sind gleich viele.`;
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        if (ask === 'more') return `Richtig! ${U.cap(cnt(big, thing))} ${verb(big)} mehr als ${cnt(small, thing)}.`;
        return `Richtig! ${U.cap(cnt(small, thing))} ${verb(small)} weniger als ${cnt(big, thing)}.`;
      },
    });
    await ctx.sleep(500);
  }

  /* ==================================================================
     Stufe 4: Mengeninvarianz – zwei Reihen (oben/unten)
     ================================================================== */
  async function rowsTask(ctx, cfg) {
    const type = U.pickFresh('mv-trap-type', ['size', 'spread'], 1);
    // trap: die „größer wirkende“ Reihe hat WENIGER; equal: gleich viele; honest: wirkt größer UND hat mehr
    const variant = U.pickFresh('mv-variant', ['trap', 'trap', 'equal', 'honest'], 2);

    // vis = Reihe, die größer wirkt (große Dinge bzw. weit auseinander); oth = die andere
    let vis;
    let oth;
    let thingVis;
    let thingOth;
    let groupWord;
    if (type === 'size') {
      const [bigId, smallId, word] = U.pickFresh('mv-size', SIZE_PAIRS, 3, (p) => p[0]);
      thingVis = LT.lexikon.get(bigId);
      thingOth = LT.lexikon.get(smallId);
      groupWord = word;
    } else {
      thingVis = thingOth = Z.pickThing('mv-thing');
      groupWord = thingVis.p;
    }
    if (variant === 'equal') {
      vis = oth = U.randInt(4, 6);
    } else {
      const small = U.randInt(3, 5);
      const large = small + U.randInt(1, 2);
      if (variant === 'trap') { vis = small; oth = large; } else { vis = large; oth = small; }
    }
    const visRow = rowNode(vis, thingVis, 'spread', type === 'size' ? 'big' : 'mid');
    const othRow = rowNode(oth, thingOth, 'tight', type === 'size' ? 'small' : 'mid');
    const visTop = U.chance(0.5);
    const top = visTop ? { row: visRow, n: vis, thing: thingVis } : { row: othRow, n: oth, thing: thingOth };
    const bot = visTop ? { row: othRow, n: oth, thing: thingOth } : { row: visRow, n: vis, thing: thingVis };

    const ask = U.chance(cfg.less) ? 'less' : 'more';
    const word = ask === 'more' ? 'mehr' : 'weniger';
    const answer = top.n === bot.n ? 'eq' : (ask === 'more') === top.n > bot.n ? 'top' : 'bottom';

    // ---------- Aufbau ----------
    ctx.stage.appendChild(questionNode(word, type === 'size' ? groupWord : U.emoji(thingVis.e)));
    const wrap = el('div.mv-rows');
    const box = el('div.choices');
    wrap.appendChild(box);
    ctx.stage.appendChild(wrap);
    const items = [
      { content: top.row, correct: answer === 'top', className: 'mv-row-tile', aria: 'obere Reihe' },
      { content: bot.row, correct: answer === 'bottom', className: 'mv-row-tile', aria: 'untere Reihe' },
      { content: '⚖️', label: 'gleich viele', say: 'gleich viele', correct: answer === 'eq', className: 'mv-eq' },
    ];

    const q = `Wo sind ${word} ${groupWord} – oben oder unten? Oder sind es gleich viele?`;
    ctx.setInstruction(q);
    ctx.say(ctx.index === 0 ? `Achtung, jetzt wird es knifflig! ${q}` : q);

    // Linien für die Paarbildung
    const svgNS = 'http://www.w3.org/2000/svg';
    let svg = null;
    function drawLine(x, y, color) {
      if (!svg) {
        svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'mv-lines');
        wrap.appendChild(svg);
      }
      const W = wrap.getBoundingClientRect();
      const ra = x.getBoundingClientRect();
      const rb = y.getBoundingClientRect();
      const upper = ra.top < rb.top ? ra : rb;
      const lower = ra.top < rb.top ? rb : ra;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', upper.left + upper.width / 2 - W.left);
      line.setAttribute('y1', upper.bottom - W.top);
      line.setAttribute('x2', lower.left + lower.width / 2 - W.left);
      line.setAttribute('y2', lower.top - W.top);
      line.style.stroke = color;
      svg.appendChild(line);
    }

    await ctx.choices(items, {
      container: box,
      shuffle: false,
      hintAfter: 2,
      onWrong: async (item, tile, wrongs) => {
        if (wrongs === 1) {
          await ctx.say('Lass dich nicht reinlegen! Groß oder klein, lang oder kurz – es kommt nur auf die Anzahl an.');
        } else if (wrongs === 2) {
          undim(box);
          await pairUp(ctx, top.row._units, bot.row._units, drawLine, ask, 'Reihe');
        }
      },
      onCorrect: () => {
        const tiles = box.querySelectorAll('.mv-row-tile');
        showCount(tiles[0], top.n);
        showCount(tiles[1], bot.n);
      },
      correctSay: () => rowsExplain(type, ask, top, bot, thingVis),
    });
    await ctx.sleep(600);
  }

  /** Erkenntnis für Stufe 4 benennen */
  function rowsExplain(type, ask, top, bot, thingVis) {
    if (top.n === bot.n) {
      if (type === 'size') return `Richtig! Oben ${top.n}, unten ${bot.n} – das sind gleich viele, auch wenn die ${thingVis.p} viel größer sind.`;
      return `Richtig! Oben und unten sind es ${nw(top.n)} – gleich viele. Eine Reihe ist nur weiter auseinandergezogen.`;
    }
    const more = top.n > bot.n ? top : bot;
    const less = top.n > bot.n ? bot : top;
    let sentence = ask === 'more'
      ? `${U.cap(cnt(more.n, more.thing))} sind mehr als ${cnt(less.n, less.thing)}`
      : `${U.cap(cnt(less.n, less.thing))} sind weniger als ${cnt(more.n, more.thing)}`;
    const visIsLess = less.thing === thingVis && (type === 'size' || less.row.classList.contains('spread'));
    if (visIsLess) {
      sentence += type === 'size'
        ? ` – auch wenn die ${thingVis.p} viel größer sind.`
        : ' – auch wenn die Reihe mit weniger länger aussieht.';
    } else {
      sentence += '.';
    }
    return 'Richtig! ' + sentence;
  }

  /* ==================================================================
     Stufe 5: zwei Ziffern vergleichen (mit Zahlenstrahl)
     ================================================================== */
  async function digitsTask(ctx, cfg) {
    const all = [];
    for (let x = 0; x <= 10; x++) for (let y = x + 1; y <= 10; y++) if (y - x <= 5 && (x > 0 || U.chance(0.3))) all.push([x, y]);
    const p = U.pickFresh('mv-dig', all, 6, key);
    const [a, b] = U.chance(0.5) ? p : [p[1], p[0]];
    const ask = U.chance(cfg.less) ? 'less' : 'more';
    const word = ask === 'more' ? 'größer' : 'kleiner';
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const target = ask === 'more' ? big : small;

    ctx.stage.appendChild(el('div.mv-question', 'Welche Zahl ist ', el('b', word), '?'));
    const box = el('div.choices.mv-digits');
    ctx.stage.appendChild(box);
    const nl = Z.numberLine(0, 10);
    nl.classList.add('mv-nl');
    ctx.stage.appendChild(nl);

    const makeContent = (v) => el('div.mv-dig-in', { style: { display: 'contents' } }, el('span.mv-dig-num', String(v)), Z.tenFrame(v));
    const items = [a, b].map((v) => ({ content: makeContent(v), correct: v === target, value: v, className: 'mv-digit-tile', aria: String(v) }));

    const q = `Welche Zahl ist ${word}?`;
    ctx.setInstruction(q);
    ctx.say(ctx.index === 0 ? `${q} Der Zahlenstrahl unten hilft dir.` : q);

    const colorize = () => {
      nl.mark(a, 'a');
      nl.mark(b, 'b');
      const nums = box.querySelectorAll('.mv-dig-num');
      if (nums[0]) nums[0].style.color = '#e5484d';
      if (nums[1]) nums[1].style.color = '#3478e0';
    };

    await ctx.choices(items, {
      container: box,
      shuffle: false,
      // Nur zwei Zahlen: nach dem ersten Fehler ist nur noch die Lösung übrig →
      // Hilfe sofort: Zahlenstrahl markieren UND die Mengen als Punkte zeigen.
      hintAfter: 1,
      onWrong: async (item, tile, wrongs) => {
        if (wrongs !== 1) return;
        tile.classList.remove('is-wrong');
        tile.classList.add('mv-was-wrong');
        colorize();
        await ctx.say(`Schau auf den Zahlenstrahl: Die ${NW(small)} kommt zuerst, die ${NW(big)} kommt später. Je weiter hinten eine Zahl steht, desto größer ist sie.`);
        if (!ctx.active) return;
        box.querySelectorAll('.mv-digit-tile').forEach((t) => t.classList.add('with-dots'));
        await ctx.say(`Und so viele sind das: ${nw(a)} und ${nw(b)}. ${NW(big)} ${big === 1 ? 'ist' : 'sind'} mehr als ${nw(small)}.`);
      },
      onCorrect: () => colorize(),
      correctSay: () => (ask === 'more' ? `Richtig! ${NW(big)} ist größer als ${nw(small)}.` : `Richtig! ${NW(small)} ist kleiner als ${nw(big)}.`),
    });
    await ctx.sleep(500);
  }
})();
