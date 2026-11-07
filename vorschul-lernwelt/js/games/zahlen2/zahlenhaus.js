/* ==========================================================================
   Spiel „Zahlenhaus“ (zahlenhaus) – Zahlzerlegung / Teil-Ganzes-Beziehung.

   Didaktik:
   - Das Teil-Ganzes-Verständnis („5 ist 2 und 3“) gilt als Schlüssel für
     das Rechnen in der Grundschule. Das Zahlenhaus ist das dort übliche
     Bild dafür: Im Dach wohnt das Ganze, in jedem Stockwerk zwei Teile,
     die zusammen die Dachzahl ergeben.
   - Darstellungswechsel von konkret zu symbolisch:
       1  Dachzahl 2–5, Teile als rote/blaue Punkte, leere Kreise zeigen,
          was noch fehlt (Ganzes sichtbar)
       2  Schüttelbox (bis 7): Murmeln, Kastanien … werden geschüttelt, ein
          Teil verschwindet unter dem Deckel – „Wie viele sind versteckt?“
          Daneben steht das passende Zahlenhaus (Brücke zur Ziffer).
       3  Zehnerfreunde: 10 = 7 + ? mit dem Zehnerfeld (wichtig für das
          spätere Rechnen über den Zehner)
       4  Zahlenhaus bis 10 nur mit Ziffern, mal fehlt links, mal rechts
       5  Ganze Zahlenhäuser: Ein Stockwerk ist als Beispiel fertig, zwei
          werden ergänzt. Erkenntnis am Ende: links eins mehr, rechts eins
          weniger (operatives Denken).
   - Ablenker sind typische Fehler: der sichtbare Teil oder das Ganze.
   - Hilfe nach 2 Fehlversuchen: Punkte erscheinen (bzw. der Deckel wird
     durchsichtig) und Flo zählt die fehlenden gemeinsam mit dem Kind.
     Nach dem 3. Fehlversuch leuchtet die richtige Kachel.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = LT.z2;

  /* ---------------- Grafik: Dach mit Schornstein ---------------- */
  const ROOF_SVG = `
<svg viewBox="0 0 200 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="142" y="10" width="18" height="40" fill="#a1887f"/>
  <rect x="138" y="5" width="26" height="9" rx="2" fill="#6d4c41"/>
  <polygon points="100,5 196,80 4,80" fill="#ef6351" stroke="#c0392b" stroke-width="5" stroke-linejoin="round"/>
  <path d="M40 66 L160 66 M64 47 L136 47" stroke="#d64933" stroke-width="3" stroke-linecap="round" opacity=".55"/>
</svg>`;

  const MARBLE_COLORS = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5', '#f3722c', '#43aa8b'];

  /** Dinge in der Schüttelbox (alle sicher erkennbar; Murmeln werden gezeichnet). */
  const BOX_ITEMS = [
    { id: 'murmel', sg: 'Murmel', pl: 'Murmeln', g: 'f' },
    { id: 'kastanie', e: '🌰', sg: 'Kastanie', pl: 'Kastanien', g: 'f' },
    { id: 'muschel', e: '🐚', sg: 'Muschel', pl: 'Muscheln', g: 'f' },
    { id: 'bonbon', e: '🍬', sg: 'Bonbon', pl: 'Bonbons', g: 'n' },
  ];

  const INTRO = {
    1: 'Das ist das Zahlenhaus! Unten wohnen zwei Teile. Zusammen sind sie so viel wie die Zahl im Dach.',
    2: 'Hier ist die Schüttelbox! Ein paar Sachen verstecken sich gleich unter dem Deckel.',
    3: 'Jetzt kommen die Zehnerfreunde! Zwei Zahlen sind Freunde, wenn sie zusammen zehn sind.',
    4: 'Jetzt wohnen im Zahlenhaus nur noch Zahlen. Findest du die fehlende Zahl?',
    5: 'Jetzt bauen wir ein ganzes Zahlenhaus mit mehreren Stockwerken!',
  };

  /* ---------------- Aufgaben-Pools ---------------- */
  function combos(nLo, nHi) {
    const out = [];
    for (let N = nLo; N <= nHi; N++) for (let a = 1; a < N; a++) out.push({ N, a, key: N + '-' + a });
    return out;
  }
  const POOL1 = combos(2, 5);
  const POOL2 = combos(3, 7);
  const POOL3 = U.range(1, 9).map((a) => ({ N: 10, a, key: 'z' + a }));
  const POOL4 = combos(3, 10);

  /* ---------------- Haus bauen ---------------- */
  function fillRoom(r, c) {
    U.clear(r);
    r.classList.toggle('zh-unknown', c.mode === 'unknown');
    if (c.mode === 'unknown') {
      r.appendChild(el('span.zh-q', '?'));
      delete r.dataset.n;
      return;
    }
    r.dataset.n = String(c.n);
    if (c.mode === 'dots') {
      r.appendChild(Z.dice(c.n, 'zh-dice ' + (c.color || 'red')));
      r.appendChild(el('span.zh-small', String(c.n)));
    } else {
      r.appendChild(el('span.zh-digit', String(c.n)));
    }
  }

  /**
   * floors: [{ l: {n, mode, color}, r: {...} }]   mode: 'digit' | 'dots' | 'unknown'
   * opts: { attic: Plättchen-Spezifikation, cls }
   */
  function buildHouse(ctx, N, floors, opts, getQuestion) {
    const house = el('div.zh-house' + (opts.cls ? '.' + opts.cls : ''));
    const roof = el('button.zh-roof', { type: 'button', html: ROOF_SVG, 'aria-label': 'Dachzahl ' + Z.word(N) });
    roof.appendChild(el('span.zh-roofnum', String(N)));
    house.appendChild(roof);
    const body = el('div.zh-body');
    let attic = null;
    if (opts.attic) {
      attic = Z.tokenRow(opts.attic, 'zh-attic-row');
      body.appendChild(el('div.zh-attic', attic.node));
    }
    const rows = floors.map((f) => {
      const l = el('div.zh-room');
      const r = el('div.zh-room');
      fillRoom(l, f.l);
      fillRoom(r, f.r);
      const row = el('div.zh-floor', l, r);
      body.appendChild(row);
      return { row, l, r };
    });
    house.appendChild(body);

    // Antippen: Zahlen werden vorgelesen (für Kinder, die Ziffern noch lernen)
    ctx.listen(roof, 'click', () => { LT.sfx.play('tap'); ctx.say(`Im Dach wohnt die ${Z.Word(N)}.`); });
    rows.forEach(({ l, r }) => [l, r].forEach((room) => {
      ctx.listen(room, 'click', () => {
        if (room.classList.contains('zh-unknown')) ctx.say(getQuestion());
        else if (room.dataset.n) { LT.sfx.play('tap'); LT.ui.animate(room, 'zr-bounce'); ctx.say(Z.word(Number(room.dataset.n))); }
      });
    }));
    return { house, rows, attic };
  }

  /** Zahlenkacheln */
  function numberItems(ans, count, lo, hi, prefer, withDots) {
    return Z.options(ans, count, lo, hi, prefer).map((k) => ({
      content: withDots ? Z.numTile(k, true) : String(k),
      text: !withDots,
      correct: k === ans,
      say: Z.word(k),
    }));
  }

  /** Raum nach richtiger Antwort füllen (mit kleiner Animation). */
  function reveal(room, n, mode) {
    fillRoom(room, { n, mode, color: 'blue' });
    room.classList.add('zh-filled');
  }

  /** Hilfe-Leiste (Stufe 4/5): Dachzahl als Plättchen, bekannter Teil rot, Rest leer. */
  function addStrip(stage, before, l, r, missing) {
    const spec = [].concat(Array(l).fill(missing === 'l' ? '' : 'a'), Array(r).fill(missing === 'r' ? '' : 'a'));
    const row = Z.tokenRow(spec, 'zh-strip');
    stage.insertBefore(row.node, before);
    return row.toks.filter((t, i) => spec[i] === '');
  }

  /* =================== Stufe 1: Punkte =================== */
  async function levelDots(ctx) {
    const { N, a } = U.pickFresh('zh-1', POOL1, 4, (c) => c.key);
    const b = N - a;
    const q = `Im Dach wohnt die ${Z.Word(N)}. Wie viele Punkte gehören in das leere Zimmer?`;
    const H = buildHouse(ctx, N, [{ l: { n: a, mode: 'dots' }, r: { mode: 'unknown' } }],
      { attic: [].concat(Array(a).fill('a'), Array(b).fill('')), cls: 'zh-dots' }, () => q);
    ctx.stage.appendChild(H.house);
    const box = el('div.choices');
    ctx.stage.appendChild(box);
    if (ctx.index === 0) await ctx.say(INTRO[1]);
    if (!ctx.active) return;
    ctx.instruct(q);
    const empties = H.attic.toks.slice(a);
    await ctx.choices(numberItems(b, 3, 1, 6, [a, N], true), {
      container: box, shuffle: false, size: 'small', hintAfter: 3,
      correctSay: `Richtig! ${a} und ${b} sind zusammen ${N}.`,
      onCorrect: () => {
        Z.clearBadges(H.house);
        empties.forEach((t) => { t.classList.remove('z2-hl'); Z.setTok(t, 'b'); });
        reveal(H.rows[0].r, b, 'dots');
      },
      onWrong: async (item, tile, w) => {
        if (w !== 2) return;
        await ctx.say('Schau auf die Kreise oben: Wie viele sind noch leer? Wir zählen zusammen!');
        empties.forEach((t) => t.classList.add('z2-hl'));
        await Z.countAlong(ctx, empties);
      },
    });
  }

  /* =================== Stufe 2: Schüttelbox =================== */
  function thing(i, it) {
    const t = el('span.zh-thing', { style: { transform: `translate(${U.randInt(-3, 3)}px, ${U.randInt(-3, 3)}px) rotate(${U.randInt(-20, 20)}deg)` } });
    if (it.e) t.appendChild(U.emoji(it.e));
    else t.appendChild(el('i.zh-marble', { style: { '--mc': MARBLE_COLORS[i % MARBLE_COLORS.length] } }));
    return t;
  }

  async function levelBox(ctx) {
    const { N, a } = U.pickFresh('zh-2', POOL2, 5, (c) => c.key);
    const b = N - a;
    const it = U.pickFresh('zh-item', BOX_ITEMS, 2, (x) => x.id);
    const q = `In der Schüttelbox sind ${N} ${it.pl}. Du siehst ${Z.acc(a, it)}. Wie viele ${it.pl} sind unter dem Deckel versteckt?`;

    // --- Schüttelbox: zuerst liegen alle Dinge sichtbar in der Box ---
    const inner = el('div.zh-box-in');
    const pile = el('div.zh-pile');
    for (let i = 0; i < N; i++) pile.appendChild(thing(i, it));
    inner.appendChild(pile);
    const boxEl = el('div.zh-box', inner, el('div.zh-box-label', String(N)));

    const H = buildHouse(ctx, N, [{ l: { n: a, mode: 'digit' }, r: { mode: 'unknown' } }], { cls: 'zh-small' }, () => q);
    const row = el('div.zh-row', boxEl, H.house);
    ctx.stage.appendChild(row);
    const box = el('div.choices');
    ctx.stage.appendChild(box);
    ctx.setInstruction(q);

    if (ctx.index === 0) await ctx.say(INTRO[2]);
    if (!ctx.active) return;
    await ctx.say(`In der Schüttelbox sind ${N} ${it.pl}. Ich schüttle die Box.`);
    if (!ctx.active) return;

    // --- Schütteln: danach liegen a Dinge links, b Dinge rechts unter dem Deckel ---
    boxEl.classList.add('zh-shake');
    for (let k = 0; k < 6; k++) ctx.timeout(() => LT.sfx.tone(U.randInt(500, 950), 0.04, { type: 'square', volume: 0.08 }), k * 130);
    await ctx.sleep(450);
    U.clear(inner);
    const left = el('div.zh-half.left');
    const right = el('div.zh-half.right');
    const hidden = [];
    for (let i = 0; i < a; i++) left.appendChild(thing(i, it));
    for (let i = 0; i < b; i++) {
      const t = thing(a + i, it);
      hidden.push(t);
      right.appendChild(t);
    }
    const lid = el('div.zh-lid', el('span', '?'));
    right.appendChild(lid);
    inner.appendChild(left);
    inner.appendChild(right);
    await ctx.sleep(550);
    boxEl.classList.remove('zh-shake');
    if (!ctx.active) return;

    ctx.instruct(`Du siehst ${Z.acc(a, it)}. Wie viele ${it.pl} sind unter dem Deckel versteckt?`);
    ctx.setInstruction(q);
    ctx.listen(lid, 'click', () => ctx.say(q));

    await ctx.choices(numberItems(b, 4, 1, 7, [a, N]), {
      container: box, shuffle: false, size: 'small', hintAfter: 3,
      correctSay: `Richtig! Unter dem Deckel ${Z.verb(b, 'war', 'waren')} ${Z.nom(b, it)}. ${a} und ${b} sind zusammen ${N}.`,
      onCorrect: () => {
        Z.clearBadges(boxEl);
        lid.classList.add('zh-open');
        LT.sfx.play('whoosh');
        reveal(H.rows[0].r, b, 'digit');
      },
      onWrong: async (item, tile, w) => {
        if (w !== 2) return;
        lid.classList.add('zh-see');
        await ctx.say(`Ich mache den Deckel durchsichtig. Wir zählen die versteckten ${it.pl} zusammen!`);
        await Z.countAlong(ctx, hidden);
      },
    });
  }

  /* =================== Stufe 3: Zehnerfreunde =================== */
  async function levelTen(ctx) {
    const { a } = U.pickFresh('zh-3', POOL3, 4, (c) => c.key);
    const b = 10 - a;
    const q = `Im Dach wohnt die Zehn. ${a === 1 ? 'Ein Plättchen ist' : a + ' Plättchen sind'} schon rot. Wie viele fehlen bis zur Zehn?`;
    const H = buildHouse(ctx, 10, [{ l: { n: a, mode: 'digit' }, r: { mode: 'unknown' } }], {}, () => q);
    const tf = Z.tenFrame(U.range(0, 9).map((i) => (i < a ? 'a' : '')), 'zh-ten');
    const row = el('div.zh-row', H.house, tf.node);
    ctx.stage.appendChild(row);
    const box = el('div.choices');
    ctx.stage.appendChild(box);
    if (ctx.index === 0) await ctx.say(INTRO[3]);
    if (!ctx.active) return;
    ctx.instruct(q);
    const empties = tf.toks.slice(a);
    const cheers = ['Das sind Zehnerfreunde!', 'Zusammen sind sie zehn – Zehnerfreunde!', 'Die beiden sind Zehnerfreunde!'];
    await ctx.choices(numberItems(b, 4, 1, 10, [a, b + 1, b - 1]), {
      container: box, shuffle: false, size: 'small', hintAfter: 3,
      correctSay: `Richtig! ${a} und ${b} sind zusammen 10. ${U.pick(cheers)}`,
      onCorrect: () => {
        Z.clearBadges(tf.node);
        empties.forEach((t) => { t.classList.remove('z2-hl'); Z.setTok(t, 'b'); });
        reveal(H.rows[0].r, b, 'digit');
      },
      onWrong: async (item, tile, w) => {
        if (w !== 2) return;
        await ctx.say('Schau aufs Zehnerfeld: Wie viele Felder sind noch leer? Wir zählen zusammen!');
        empties.forEach((t) => t.classList.add('z2-hl'));
        await Z.countAlong(ctx, empties);
      },
    });
  }

  /* =================== Stufe 4: nur Ziffern =================== */
  async function levelDigits(ctx) {
    const { N, a } = U.pickFresh('zh-4', POOL4, 8, (c) => c.key);
    const b = N - a;
    const missing = U.chance(0.5) ? 'r' : 'l';
    const known = missing === 'r' ? a : b;
    const ans = missing === 'r' ? b : a;
    const q = `Im Dach wohnt die ${Z.Word(N)}. Welche Zahl gehört in das leere Zimmer?`;
    const H = buildHouse(ctx, N, [{
      l: missing === 'l' ? { mode: 'unknown' } : { n: a, mode: 'digit' },
      r: missing === 'r' ? { mode: 'unknown' } : { n: b, mode: 'digit' },
    }], {}, () => q);
    ctx.stage.appendChild(H.house);
    const box = el('div.choices');
    ctx.stage.appendChild(box);
    if (ctx.index === 0) await ctx.say(INTRO[4]);
    if (!ctx.active) return;
    ctx.instruct(q);
    let empties = null;
    await ctx.choices(numberItems(ans, 4, 0, 10, [known, N]), {
      container: box, shuffle: false, size: 'small', hintAfter: 3,
      correctSay: `Richtig! ${a} und ${b} sind zusammen ${N}.`,
      onCorrect: () => {
        if (empties) empties.forEach((t) => Z.setTok(t, 'b'));
        Z.clearBadges(ctx.stage);
        reveal(missing === 'r' ? H.rows[0].r : H.rows[0].l, ans, 'digit');
      },
      onWrong: async (item, tile, w) => {
        if (w !== 2) return;
        empties = addStrip(ctx.stage, box, a, b, missing);
        await ctx.say(`Ich male dir ${N} Punkte. ${known === 1 ? 'Einer ist' : known + ' sind'} rot. Wir zählen die leeren Punkte zusammen!`);
        await Z.countAlong(ctx, empties);
      },
    });
  }

  /* =================== Stufe 5: ganze Zahlenhäuser =================== */
  async function levelFloors(ctx) {
    const N = U.pickFresh('zh-5', U.range(4, 10), 3);
    const s = U.randInt(1, N - 3);
    // drei Stockwerke mit aufeinanderfolgenden Zerlegungen; das oberste ist das Beispiel
    const floors = [s, s + 1, s + 2].map((a, i) => ({ a, b: N - a, miss: i === 0 ? null : U.pick(['l', 'r']) }));
    const full = `In jedem Stockwerk sind es zusammen ${Z.word(N)}. Welche Zahl fehlt im gelben Stockwerk?`;
    const H = buildHouse(ctx, N, floors.map((f) => ({
      l: f.miss === 'l' ? { mode: 'unknown' } : { n: f.a, mode: 'digit' },
      r: f.miss === 'r' ? { mode: 'unknown' } : { n: f.b, mode: 'digit' },
    })), { cls: 'zh-tall' }, () => full);
    ctx.stage.appendChild(H.house);
    const box = el('div.choices');
    ctx.stage.appendChild(box);
    if (ctx.index === 0) await ctx.say(INTRO[5]);
    if (!ctx.active) return;
    H.rows[0].row.classList.add('zh-example');

    for (let i = 1; i < floors.length; i++) {
      if (!ctx.active) return;
      const f = floors[i];
      const rowEls = H.rows[i];
      rowEls.row.classList.add('zh-active');
      const ans = f.miss === 'r' ? f.b : f.a;
      const known = f.miss === 'r' ? f.a : f.b;
      ctx.setInstruction(full);
      if (i === 1) ctx.say(full);
      else ctx.say(`Und hier? Neben der ${Z.Word(known)} fehlt eine Zahl.`);
      U.clear(box);
      box.classList.remove('locked');
      const base = ctx.wrongCount;
      let strip = null;
      let empties = null;
      await ctx.choices(numberItems(ans, 4, 0, 10, [known, N]), {
        container: box, shuffle: false, size: 'small', hintAfter: base + 3,
        correctSay: `Richtig! ${f.a} und ${f.b} sind ${N}.`,
        onCorrect: () => {
          if (empties) empties.forEach((t) => Z.setTok(t, 'b'));
          reveal(f.miss === 'r' ? rowEls.r : rowEls.l, ans, 'digit');
        },
        onWrong: async (item, tile, w) => {
          if (w - base !== 2) return;
          empties = addStrip(ctx.stage, box, f.a, f.b, f.miss);
          strip = empties.length ? empties[0].parentNode : null;
          await ctx.say(`Ich male dir ${N} Punkte. ${known === 1 ? 'Einer ist' : known + ' sind'} rot. Wir zählen die leeren Punkte zusammen!`);
          await Z.countAlong(ctx, empties);
        },
      });
      if (!ctx.active) return;
      rowEls.row.classList.remove('zh-active');
      if (strip) {
        await ctx.sleep(500);
        strip.remove();
      }
    }
    if (!ctx.active) return;
    H.house.classList.add('zh-done');
    LT.sfx.play('star');
    await ctx.say('Super, das Zahlenhaus ist fertig! Siehst du? Links wird es immer eins mehr, rechts immer eins weniger.');
    await ctx.sleep(400);
  }

  /* ---------------- Spiel ---------------- */
  LT.registerGame({
    id: 'zahlenhaus',
    area: 'zahlen',
    title: 'Zahlenhaus',
    icon: '🏠',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Zahlzerlegung (Teil-Ganzes)',
      goal: 'Ihr Kind lernt, dass sich eine Zahl in zwei Teile zerlegen lässt (5 ist 2 und 3) und dass man aus dem Ganzen und einem Teil den anderen Teil bestimmen kann. Dieses Teil-Ganzes-Verständnis gilt als Schlüssel für das Rechnen in der Grundschule; die „Zehnerfreunde“ brauchen Kinder später beim Rechnen über den Zehner.',
      levels: [
        'Dachzahl 2 bis 5 mit roten und blauen Punkten',
        'Schüttelbox: Wie viele sind unter dem Deckel versteckt? (bis 7)',
        'Zehnerfreunde mit dem Zehnerfeld (10 = 7 + ?)',
        'Zahlenhaus bis 10 nur mit Ziffern',
        'Ganze Zahlenhäuser: mehrere Stockwerke ergänzen',
      ],
      tip: 'Basteln Sie eine Schüttelbox: 5 Knöpfe in eine Dose, schütteln, Deckel halb öffnen – wie viele sind noch versteckt? Oder verstecken Sie einige von 10 Gummibärchen unter der Hand: „Ich sehe 6. Wie viele sind unter meiner Hand?“',
    },

    async task(ctx) {
      switch (ctx.level) {
        case 1: return levelDots(ctx);
        case 2: return levelBox(ctx);
        case 3: return levelTen(ctx);
        case 4: return levelDigits(ctx);
        default: return levelFloors(ctx);
      }
    },
  });
})();
