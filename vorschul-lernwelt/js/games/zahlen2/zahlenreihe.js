/* ==========================================================================
   Spiel „Zahlen-Zug“ (zahlenreihe) – Zahlenreihe vorwärts und rückwärts.

   Didaktik:
   - Die Zahlwortreihe ist die Grundlage für Weiterzählen und Rechnen. Der
     Zug macht die Reihenfolge räumlich sichtbar: Waggon für Waggon wird die
     Zahl um eins größer (ordinaler Zahlaspekt).
   - Jede Zahl ist hörbar: Waggon antippen → Flo spricht die Zahl. So können
     auch Kinder, die Ziffern noch nicht sicher kennen, mitspielen.
   - Stufen (konkret → symbolisch):
       1  Zahlen 1–5, was kommt danach? Waggons mit Ziffer UND Würfelpunkten
       2  Zahlen bis 10, Lücke in der Mitte (Reihe wird vorgelesen)
       3  Nachbarzahlen bis 10: „Welche Zahl kommt VOR / NACH der 7?“
       4  Ausschnitte und Nachbarzahlen bis 20 (nicht mehr vorgelesen)
       5  Rückwärts zählen: Raketen-Countdown 10 … 0
   - Typische Fehler sind gezielte Ablenker (z. B. bei „vor der 7“ die 8).
   - Lerninhalt = die konkrete Zahlenfolge (Schlüssel '3 4 ? 6 7', 'vor 7',
     'nach 12', '9 8 ? 6 5') über ctx.item → verteiltes Wiederholen.
   - Hilfe-Leiter: 1. Fehler → informative Rückmeldung zur GEWÄHLTEN Zahl
     („Die Acht kommt nach der Sieben. Wir suchen die Zahl davor.“);
     2. Fehler → Denkanstoß („Zähle von vorne mit bis zur Lücke.“, ab Stufe 3
     erscheint der Zahlenstrahl) und eine Zahl verschwindet; 3. Fehler → Flo
     zählt gemeinsam bis zur Lücke bzw. am Zahlenstrahl und nennt die Lösung.
     Jede Aufgabe endet mit einem Erfolg.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = LT.z2;

  /* ---------------- Grafiken (eigenes SVG, Fahrtrichtung links) ---------------- */
  const LOCO_SVG = `
<svg viewBox="0 0 130 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="6" y="70" width="118" height="8" rx="3" fill="#3a3d5c"/>
  <path d="M1 84 L14 63 L14 84 Z" fill="#3a3d5c"/>
  <rect x="12" y="38" width="68" height="34" rx="10" fill="#e63946"/>
  <rect x="31" y="38" width="5" height="34" fill="#ffd166"/>
  <rect x="55" y="38" width="5" height="34" fill="#ffd166"/>
  <path d="M20 40 L22 21 L34 21 L36 40 Z" fill="#3a3d5c"/>
  <rect x="16" y="13" width="24" height="10" rx="3" fill="#2b2d42"/>
  <path d="M45 40 Q52 25 59 40 Z" fill="#ffd166"/>
  <circle cx="12" cy="50" r="6" fill="#ffd166" stroke="#3a3d5c" stroke-width="2"/>
  <rect x="76" y="20" width="46" height="52" rx="6" fill="#1d6fb8"/>
  <rect x="70" y="12" width="58" height="11" rx="4" fill="#2b2d42"/>
  <rect x="86" y="28" width="26" height="20" rx="4" fill="#bfe8ff" stroke="#fff" stroke-width="3"/>
  <g fill="#3a3d5c" stroke="#8d93b8" stroke-width="3">
    <circle cx="31" cy="83" r="10"/><circle cx="57" cy="83" r="10"/><circle cx="101" cy="81" r="13"/>
  </g>
  <g fill="#ffd166"><circle cx="31" cy="83" r="3"/><circle cx="57" cy="83" r="3"/><circle cx="101" cy="81" r="4"/></g>
  <rect x="29" y="81" width="74" height="4" rx="2" fill="#c3c7de"/>
</svg>`;

  const ROCKET_SVG = `
<svg viewBox="0 0 60 132" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="zr-flame"><path d="M20 100 Q30 134 40 100 Z" fill="#ff9f1c"/><path d="M25 100 Q30 120 35 100 Z" fill="#ffd166"/></g>
  <path d="M15 74 L2 102 L17 97 Z" fill="#e63946" stroke="#3a3d5c" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M45 74 L58 102 L43 97 Z" fill="#e63946" stroke="#3a3d5c" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M30 4 C46 18 48 50 45 99 L15 99 C12 50 14 18 30 4 Z" fill="#f4f6fc" stroke="#3a3d5c" stroke-width="3"/>
  <path d="M30 5.5 C37 11.5 41 19 43 28 L17 28 C19 19 23 11.5 30 5.5 Z" fill="#e63946"/>
  <circle cx="30" cy="52" r="9" fill="#4cc9f0" stroke="#3a3d5c" stroke-width="3"/>
  <circle cx="27" cy="49" r="2.5" fill="#fff"/>
  <path d="M30 99 L30 82" stroke="#e63946" stroke-width="4" stroke-linecap="round"/>
</svg>`;

  /* ---------------- Stufen ---------------- */
  const LV = {
    1: { lo: 1, hi: 6, opts: 3, dots: true },
    2: { lo: 1, hi: 10, opts: 4 },
    3: { lo: 1, hi: 10, opts: 4, line: [1, 10] },
    4: { lo: 1, hi: 20, opts: 4, line: [1, 20], sayButton: true },
    5: { lo: 0, hi: 10, opts: 4 },
  };

  const INTRO = {
    1: 'Hier kommt der Zahlen-Zug! In jedem Waggon fährt eine Zahl. Der letzte Waggon ist noch leer.',
    2: 'Im Zahlen-Zug ist ein Waggon leer geblieben. Findest du die fehlende Zahl?',
    3: 'Jetzt suchen wir Nachbarzahlen! Denk ans Zählen: Was sagst du kurz davor? Was gleich danach?',
    4: 'Jetzt fährt der Zug mit großen Zahlen bis zwanzig! Tippe auf einen Waggon, dann hörst du seine Zahl.',
    5: 'Raketenstart! Dafür zählen wir rückwärts.',
  };

  /* ---------------- Aufgaben-Pools (alle möglichen Aufgaben je Stufe) ---------------- */
  function poolEnd() {
    // 1–5: Reihe ab 1, 2 oder 3, die letzte Zahl fehlt
    const out = [];
    for (let ans = 2; ans <= 5; ans++) {
      for (let s = 1; s <= Math.min(3, ans - 1); s++) {
        out.push({ key: `e${s}-${ans}`, kind: 'end', seq: U.range(s, ans), gap: ans - s });
      }
    }
    return out;
  }
  function poolGap(startLo, startHi, gapLo, gapHi) {
    const out = [];
    for (let s = startLo; s <= startHi; s++) {
      for (let g = gapLo; g <= gapHi; g++) out.push({ key: `g${s}-${g}`, kind: 'gap', seq: U.range(s, s + 4), gap: g });
    }
    return out;
  }
  function poolNeighbor(nLo, nHi) {
    const out = [];
    for (let n = nLo; n <= nHi; n++) {
      out.push({ key: `v${n}`, kind: 'neighbor', dir: 'vor', n, seq: [n - 1, n], gap: 0 });
      out.push({ key: `n${n}`, kind: 'neighbor', dir: 'nach', n, seq: [n, n + 1], gap: 1 });
    }
    return out;
  }
  function poolCountdown() {
    // Fünf Zahlen rückwärts innerhalb 10 … 0; Lücke in der Mitte oder am Ende
    const out = [];
    for (let s = 4; s <= 10; s++) {
      for (let g = 1; g <= 4; g++) out.push({ key: `c${s}-${g}`, kind: 'countdown', seq: [s, s - 1, s - 2, s - 3, s - 4], gap: g });
    }
    return out;
  }
  const POOLS = {
    1: poolEnd(),
    2: poolGap(1, 6, 1, 3),
    3: poolNeighbor(2, 9),
    '4g': poolGap(6, 16, 0, 4),
    '4n': poolNeighbor(10, 19),
    5: poolCountdown(),
  };

  /** Lesbarer, stabiler Schlüssel für den Elternbereich: '3 4 ? 6 7', 'vor 7', 'nach 12' */
  function readableKey(t) {
    if (t.kind === 'neighbor') return `${t.dir} ${t.n}`;
    return t.seq.map((n, i) => (i === t.gap ? '?' : String(n))).join(' ');
  }

  function makeTask(ctx, level) {
    let pool = level === 4 ? POOLS['4g'].concat(POOLS['4n']) : POOLS[level];
    // Stufe 1, wenn es gerade hakt: nur Reihen, die bei eins beginnen
    if (level === 1 && ctx.flow < 0) pool = pool.filter((x) => x.seq[0] === 1);
    const t = Object.assign({}, ctx.item(pool, readableKey, { avoid: 8 }));
    t.ans = t.seq[t.gap];
    return t;
  }

  /** Denkanstoß (2. Hilfe): Strategie nennen, nicht die Lösung. */
  function hintText(t) {
    const W = Z.Word;
    if (t.kind === 'neighbor') return `Zähle bis zur ${W(t.n)}. Welche Zahl sagst du ${t.dir === 'vor' ? 'kurz davor' : 'gleich danach'}?`;
    if (t.kind === 'countdown') return 'Zähle rückwärts mit. Jede Zahl ist eins weniger.';
    if (t.gap === 0) return `Welche Zahl sagst du kurz vor der ${W(t.seq[1])}?`;
    return 'Zähle von vorne mit, bis zur Lücke.';
  }
  /** Vormachen (3. Hilfe): Lösung nennen und begründen. */
  function modelText(t) {
    const W = Z.Word;
    if (t.kind === 'neighbor') return `${t.dir === 'vor' ? 'Vor' : 'Nach'} der ${W(t.n)} kommt die ${W(t.ans)}.`;
    if (t.gap === 0) return `Vor der ${W(t.seq[1])} kommt die ${W(t.ans)}.`;
    if (t.kind === 'countdown') return `Rückwärts kommt nach der ${W(t.seq[t.gap - 1])} die ${W(t.ans)}.`;
    return `Nach der ${W(t.seq[t.gap - 1])} kommt die ${W(t.ans)}.`;
  }

  // Einführung je Aufgabenart: zu Rundenbeginn und wenn eine andere Stufe drankommt
  let introduced = new Set();

  /**
   * Informative Rückmeldung zu einer falschen Zahl k (statt nur „falsch“):
   * nennt die gewählte Zahl und sagt, in welche Richtung es weitergeht.
   */
  function wrongFeedback(t, k) {
    const W = Z.Word;
    if (t.kind === 'neighbor') {
      const want = t.dir === 'vor' ? 'davor' : 'danach';
      if (k === t.n) return `${Z.oops()} Das ist die ${W(k)} selbst. Wir suchen die Zahl ${want}.`;
      if (Math.abs(k - t.n) === 1) return `${Z.oops()} Die ${W(k)} kommt ${t.dir === 'vor' ? 'nach' : 'vor'} der ${W(t.n)}. Wir suchen die Zahl ${want}.`;
      return `${Z.oops()} Die ${W(k)} ist kein Nachbar der ${W(t.n)}.`;
    }
    if (t.kind === 'countdown') {
      return `${Z.oops()} Die ${W(k)} passt hier nicht. Beim Rückwärtszählen wird es immer eins weniger.`;
    }
    return `${Z.oops()} Die ${W(k)} ist zu ${k > t.ans ? 'groß' : 'klein'}.`;
  }

  /** Frage, Bestätigung und typische Fehler (Ablenker) je Aufgabentyp. */
  function describe(t, level) {
    const last = t.seq.length - 1;
    switch (t.kind) {
      case 'end': {
        const prev = t.seq[t.gap - 1];
        return {
          q: (t.gap > 1 ? `${Z.sayList(t.seq.slice(0, t.gap))}. ` : '') + `Welche Zahl kommt nach der ${Z.Word(prev)}?`,
          ok: `Richtig! Nach der ${Z.Word(prev)} kommt die ${Z.Word(t.ans)}.`,
          prefer: [t.ans + 1, prev],
        };
      }
      case 'gap':
        return {
          q: level <= 2 ? `${Z.sayList(t.seq, t.gap)}. Welche Zahl fehlt im Zug?` : 'Welche Zahl fehlt im Zug?',
          ok: `Richtig! ${Z.sayList(t.seq)}.`,
          prefer: [t.ans - 1, t.ans + 1],
        };
      case 'neighbor':
        return {
          q: `Welche Zahl kommt ${t.dir} der ${Z.Word(t.n)}?`,
          ok: `Richtig! ${t.dir === 'vor' ? 'Vor' : 'Nach'} der ${Z.Word(t.n)} kommt die ${Z.Word(t.ans)}.`,
          // klassische Verwechslung: die Zahl auf der anderen Seite
          prefer: t.dir === 'vor' ? [t.n + 1, t.ans - 1] : [t.n - 1, t.ans + 1],
        };
      default: {
        // Countdown
        const atEnd = t.gap === last;
        return {
          q: atEnd ? `${Z.sayList(t.seq.slice(0, t.gap))}. Und welche Zahl kommt jetzt?` : `${Z.sayList(t.seq, t.gap)}. Welche Zahl fehlt?`,
          ok: `Richtig! ${Z.sayList(t.seq)}.${t.seq[last] === 0 ? ' Start!' : ''}`,
          // vorwärts gedacht statt rückwärts → die Zahl darüber
          prefer: [t.ans + 1, t.ans - 1, t.ans + 2],
        };
      }
    }
  }

  /* ---------------- Aufbau: Zug ---------------- */
  function buildTrain(ctx, t, cfg, q) {
    const scene = el('div.zr-scene');
    const train = el('div.zr-train' + (cfg.dots ? '.dots' : ''));
    const loco = el('div.zr-loco', { html: LOCO_SVG });
    loco.appendChild(el('span.zr-steam', el('i'), el('i'), el('i')));
    train.appendChild(loco);
    const cars = t.seq.map((n, i) => {
      const isGap = i === t.gap;
      const body = el('span.zr-body', el('span.zr-num', isGap ? '?' : String(n)));
      if (cfg.dots && !isGap) body.appendChild(Z.dice(n, 'zr-dice'));
      const car = el('button', {
        type: 'button',
        class: 'zr-wagon c' + (i % 5) + (isGap ? ' zr-empty' : '') + (cfg.dots ? ' zr-withdots' : ''),
        'aria-label': isGap ? 'leerer Waggon' : Z.word(n),
      }, body, el('span.zr-wheels', el('i'), el('i')));
      ctx.listen(car, 'click', () => {
        if (car.classList.contains('zr-empty')) ctx.say(q);
        else {
          LT.sfx.play('tap');
          LT.ui.animate(car, 'zr-bounce');
          ctx.say(Z.word(n));
        }
      });
      train.appendChild(car);
      return car;
    });
    scene.appendChild(train);
    scene.appendChild(el('div.zr-track'));
    return { scene, train, cars, gapEl: cars[t.gap] };
  }

  /* ---------------- Aufbau: Raketen-Countdown ---------------- */
  function buildRocket(ctx, t, q) {
    const scene = el('div.zr-scene.zr-space');
    const board = el('div.zr-board');
    const cars = t.seq.map((n, i) => {
      const isGap = i === t.gap;
      const b = el('button', { type: 'button', class: 'zr-cd' + (isGap ? ' zr-empty' : ''), 'aria-label': isGap ? 'leeres Feld' : Z.word(n) },
        el('span.zr-num', isGap ? '?' : String(n)));
      ctx.listen(b, 'click', () => {
        if (b.classList.contains('zr-empty')) ctx.say(q);
        else {
          LT.sfx.play('tap');
          LT.ui.animate(b, 'zr-bounce');
          ctx.say(Z.word(n));
        }
      });
      board.appendChild(b);
      return b;
    });
    const rocket = el('div.zr-rocket', { html: ROCKET_SVG });
    const pad = el('div.zr-pad', rocket, el('span.zr-padbase'));
    scene.appendChild(board);
    scene.appendChild(pad);
    return { scene, train: rocket, cars, gapEl: cars[t.gap] };
  }

  /* ---------------- Zahlenstrahl (Hilfe in Stufe 3/4) ---------------- */
  function buildLine(lo, hi) {
    const node = el('div.zr-line' + (hi - lo >= 10 ? '.two' : ''), { 'aria-hidden': 'true' });
    const cells = {};
    for (let n = lo; n <= hi; n++) {
      const c = el('span.zr-cell', String(n));
      cells[n] = c;
      node.appendChild(c);
    }
    return { node, cells };
  }

  /* ---------------- Spiel ---------------- */
  LT.registerGame({
    id: 'zahlenreihe',
    area: 'zahlen',
    title: 'Zahlen-Zug',
    icon: '🚂',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Zahlenreihe vorwärts & rückwärts',
      goal: 'Ihr Kind festigt die Zahlwortreihe, erkennt Nachbarzahlen (Vorgänger und Nachfolger), ordnet Ziffern in die Reihe ein und zählt rückwärts. Das ist die Grundlage für das Weiterzählen und für das spätere Rechnen.',
      levels: [
        'Zahlen 1 bis 5: Was kommt danach? (Ziffern mit Würfelpunkten)',
        'Zahlen bis 10: eine Lücke in der Mitte (Reihe wird vorgelesen)',
        'Nachbarzahlen bis 10: Welche Zahl kommt vor / nach …?',
        'Zahlenausschnitte und Nachbarzahlen bis 20',
        'Rückwärts zählen: Raketen-Countdown von 10 bis 0',
      ],
      tip: 'Zählen Sie beim Treppensteigen laut hoch und beim Hinuntergehen rückwärts. Spielen Sie „Raketenstart“: 10, 9, 8 … 0 – und dann hochspringen! Beim Spaziergang: Welche Hausnummer kommt als Nächstes?',
    },

    async task(ctx) {
      const level = ctx.taskLevel;
      const cfg = LV[level] || LV[1];
      const t = makeTask(ctx, level);
      const d = describe(t, level);

      const view = t.kind === 'countdown' ? buildRocket(ctx, t, d.q) : buildTrain(ctx, t, cfg, d.q);
      // Größe an die Waggonanzahl anpassen (siehe CSS --zr-n / --zr-lf)
      view.scene.style.setProperty('--zr-n', String(t.seq.length));
      view.scene.style.setProperty('--zr-lf', t.kind === 'countdown' ? '1.25' : cfg.dots ? '1.9' : '1.6');
      ctx.stage.appendChild(view.scene);
      view.scene.classList.add('zr-arrive');

      const choicesBox = el('div.choices.zr-choices');
      ctx.stage.appendChild(choicesBox);

      if (ctx.index === 0) introduced = new Set();
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
      }
      if (!ctx.active) return;
      ctx.instruct(d.q);

      /* --- Hilfe 1: gemeinsam bis zur Lücke zählen (Zug / Countdown) --- */
      async function countToGap() {
        await ctx.say(t.kind === 'countdown' ? 'Komm, wir zählen gemeinsam rückwärts!' : 'Komm, wir zählen zusammen!');
        const before = view.cars.slice(0, t.gap);
        await Z.countAlong(ctx, before, { badge: false, words: t.seq.slice(0, t.gap).map(Z.Word) });
        if (!ctx.active) return;
        ctx.hint(view.gapEl);
      }

      /* --- Hilfe 2: Zahlenstrahl (Stufe 3/4) --- */
      let line = null;
      function showLine() {
        if (!line) {
          line = buildLine(cfg.line[0], cfg.line[1]);
          ctx.stage.insertBefore(line.node, choicesBox);
        }
      }
      async function lineHint() {
        showLine();
        let from;
        let to;
        if (t.kind === 'neighbor') {
          to = t.dir === 'vor' ? t.n - 1 : t.n;
          from = Math.max(cfg.line[0], t.n - 3);
        } else {
          to = t.ans - 1;
          from = t.gap > 0 ? t.seq[0] : Math.max(cfg.line[0], t.ans - 3);
        }
        await ctx.say('Komm, wir zählen zusammen!');
        const nodes = U.range(from, to).map((n) => line.cells[n]);
        await Z.countAlong(ctx, nodes, { badge: false, words: U.range(from, to).map(Z.Word) });
        if (!ctx.active) return;
        nodes.forEach((n) => n.classList.add('zr-seen'));
        line.cells[t.ans].classList.add('zr-target');
        ctx.hint(line.cells[t.ans]);
      }

      const options = Z.options(t.ans, cfg.opts, cfg.lo, cfg.hi, d.prefer).map((k) => ({
        content: cfg.dots ? Z.numTile(k, true) : String(k),
        text: !cfg.dots,
        correct: k === t.ans,
        say: Z.word(k),
        value: k,
      }));

      const ha = Z.hintAfterFor(ctx, options.length);
      await ctx.choices(options, {
        container: choicesBox,
        shuffle: false,
        size: 'small',
        sayButton: !!cfg.sayButton,
        hintAfter: ha,
        correctSay: () => (ctx.wrongCount === 0 && U.chance(0.25) ? d.ok.replace('Richtig!', 'Richtig, du hast gut mitgezählt!') : d.ok),
        // 1. Hilfe: was an der GEWÄHLTEN Zahl nicht passt
        explain: (item) => wrongFeedback(t, item.value),
        // 2. Hilfe: Denkanstoß (ab Stufe 3 mit Zahlenstrahl), 3. Hilfe: vormachen
        hintSay: () => hintText(t),
        modelSay: () => modelText(t),
        onCorrect: (item, tile) => {
          ctx.unhint(view.gapEl);
          if (line) ctx.unhint(line.cells[t.ans]);
          // Zahl fliegt in den leeren Waggon
          Z.flyNumber(ctx, tile, view.gapEl, String(t.ans)).then(() => {
            view.gapEl.classList.remove('zr-empty');
            view.gapEl.classList.add('zr-filled');
            view.gapEl.querySelector('.zr-num').textContent = String(t.ans);
            view.gapEl.setAttribute('aria-label', Z.word(t.ans));
            if (cfg.dots) view.gapEl.querySelector('.zr-body').appendChild(Z.dice(t.ans, 'zr-dice'));
          });
        },
        onWrong: async (item, tile, wrongs) => {
          if (wrongs === ha && cfg.line) showLine();
          else if (wrongs === ha + 1) {
            if (cfg.line) await lineHint();
            else await countToGap();
          }
        },
      });
      if (!ctx.active) return;

      // Belohnung: Der Zug fährt ab bzw. die Rakete startet
      if (t.kind === 'countdown') {
        view.train.classList.add('zr-launch');
        LT.sfx.play('whoosh');
      } else {
        LT.sfx.seq([['G4', 0.16], ['E4', 0.28]], { type: 'square', volume: 0.12 });
        view.scene.classList.remove('zr-arrive');
        view.train.classList.add('zr-go');
      }
      await ctx.sleep(1000);
    },
  });
})();
