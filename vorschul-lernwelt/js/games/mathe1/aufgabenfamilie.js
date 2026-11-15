/* ==========================================================================
   Spiel „Aufgabenfamilie“ 👨‍👩‍👧 (Rechenschule, Klasse 1) – Spec A6
   Tauschaufgabe, Umkehraufgabe und die Rechenfamilie aus drei Zahlen.

   Bild: Ein Zahlenhaus. Im Dach wohnt die große Zahl (das Ganze), unten
   wohnen die zwei Teile (rot und blau). Alle Aufgaben, die genau diese drei
   Zahlen benutzen, sind eine Familie: 3 + 4, 4 + 3, 7 − 3, 7 − 4.

   Stufen:
     1  bis 10 mit Punktbildern: Tauschaufgabe finden, Familie ins Haus holen
        (4 Kärtchen, 1 Fremder) – Brücke vom Zahlenhaus der Vorschule
     2  bis 10 nur Zahlen: Familie (2 Fremde, auch „3 − 7“), Umkehraufgabe,
        Tauschaufgabe
     3  bis 20: Familie und Umkehraufgabe
     4  Eine Zahl fehlt im Haus / eine Aufgabe fehlt in der Familie
     5  „Welche Aufgabe gehört nicht zur Familie?“ und Platzhalter-Aufgaben
        (? − 5 = 8) über die Umkehraufgabe – Ende Klasse 1

   Fehlvorstellungen und Hilfen:
     • Tauschgesetz bei Minus (3 − 7): „Von drei Äpfeln kann ich keine sieben
       wegnehmen. Bei Minus steht die größte Zahl vorne.“
     • Fremde Zahl übersehen (7 + 3 gehört zu 3, 7, 10): Die fremde Zahl wird
       benannt: „Die Zehn wohnt nicht in diesem Haus.“
     • Tauschaufgabe = dieselbe Aufgabe noch einmal / eine Minusaufgabe.
     • Umkehraufgabe: weggenommene Zahl als Ergebnis, Plus statt Minus.
   Hilfe-Leiter: 1. erklären, 2. Strategie (Zahlen im Haus leuchten, Tipp),
   3. vormachen (Karte/Kachel leuchtet, Flo rechnet vor).
   Lerninhalte (ctx.item): 'Tausch 3 + 4', '7 - 3', 'Haus 3 4 7',
   'Haus 13 = 8 + ?', 'Fehlt 13 - 8', 'Fremd 5 - 13', '? - 5 = 8'.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const w = (n) => U.numberWord(n);
  const W = (n) => U.cap(w(n));

  /* ---------------- Familien ---------------- */
  function families(lo, hi, minPart, maxPart) {
    const out = [];
    for (let s = lo; s <= hi; s++) {
      for (let a = minPart; a < s - a; a++) {
        const b = s - a;
        if (b > maxPart || a === 10 || b === 10) continue;
        out.push({ a, b, s });
      }
    }
    return out;
  }
  const FAM = {
    1: families(4, 10, 1, 9),
    2: families(5, 10, 2, 8),
    3: families(11, 20, 2, 15),
  };

  /* ---------------- Aufgabenkärtchen ---------------- */
  const OPW = { '+': 'plus', '-': 'minus' };
  const card = (x, op, y) => ({ x, op, y });
  const res = (c) => (c.op === '+' ? c.x + c.y : c.x - c.y);
  const lab = (c) => `${c.x} ${c.op === '+' ? '+' : '−'} ${c.y}`;
  const keyOf = (c) => `${c.x} ${c.op} ${c.y}`;
  const sp = (c) => `${w(c.x)} ${OPW[c.op]} ${w(c.y)}`;
  const Sp = (c) => U.cap(sp(c));
  const same = (c, d) => c.x === d.x && c.op === d.op && c.y === d.y;
  const members = (f) => [card(f.a, '+', f.b), card(f.b, '+', f.a), card(f.s, '-', f.a), card(f.s, '-', f.b)];
  function isMember(c, f) {
    if (c.op === '+') return (c.x === f.a && c.y === f.b) || (c.x === f.b && c.y === f.a);
    return c.x === f.s && (c.y === f.a || c.y === f.b);
  }
  const isSwap = (c) => c.op === '-' && c.x < c.y;
  /** die Zahl der Karte, die nicht im Haus wohnt (oder null) */
  function foreignOf(c, f) {
    const set = new Set([f.a, f.b, f.s]);
    const nums = [c.x, c.y, res(c)];
    const n = nums.find((v) => !set.has(v));
    return n == null ? null : n;
  }

  /** fremde Kärtchen nach Art: swap (3 − 7), plus (andere Summe), minus (andere Zahl) */
  function intruderCands(f) {
    const { a, b, s } = f;
    const ok = (c) => !isMember(c, f) && (isSwap(c) || foreignOf(c, f) != null) && c.x >= 0 && c.y >= 1 && c.x <= 20 && c.y <= 20 && (isSwap(c) || (res(c) >= 0 && res(c) <= 20));
    const uniq = (list) => {
      const seen = new Set();
      return list.filter(ok).filter((c) => { const k = keyOf(c); if (seen.has(k)) return false; seen.add(k); return true; });
    };
    return {
      swap: uniq([card(a, '-', s), card(b, '-', s)]),
      plus: uniq([card(a, '+', b + 1), card(a + 1, '+', b), card(b, '+', b), card(a, '+', a), card(s, '+', a), card(b, '+', a - 1)]),
      minus: uniq([card(s, '-', a + 1), card(s, '-', b - 1), card(s, '-', a - 1), card(s + 1, '-', a), card(s - 1, '-', b)]),
    };
  }
  function pickIntruders(f, level, n) {
    const C = intruderCands(f);
    const out = [];
    const add = (list) => {
      const fresh = list.filter((c) => !out.some((d) => same(c, d)));
      if (fresh.length) out.push(U.pick(fresh));
    };
    const order = level <= 1
      ? (U.chance(0.65) ? ['plus', 'minus', 'plus'] : ['minus', 'plus', 'plus'])
      : ['swap', ...U.shuffle(['plus', 'minus']), 'plus', 'minus'];
    for (const t of order) {
      if (out.length >= n) break;
      add(C[t]);
    }
    return out.slice(0, n);
  }

  /* ---------------- Aufgaben-Pools je Stufe ---------------- */
  function fk(f) { return `${f.a} ${f.b} ${f.s}`; }
  function buildPools() {
    const P = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    const tausch = (f, L) => [
      { kind: 'tausch', f, x: f.a, y: f.b, k: `Tausch ${f.a} + ${f.b}`, L },
      { kind: 'tausch', f, x: f.b, y: f.a, k: `Tausch ${f.b} + ${f.a}`, L },
    ];
    const umkehr = (f, L) => [
      { kind: 'umkehr', f, x: f.a, y: f.b, k: `${f.s} - ${f.b}`, L },
      { kind: 'umkehr', f, x: f.b, y: f.a, k: `${f.s} - ${f.a}`, L },
    ];
    const family = (f, L) => ({ kind: 'family', f, k: `Haus ${fk(f)}`, L });
    FAM[1].forEach((f) => { P[1].push(...tausch(f, 1), family(f, 1)); });
    FAM[2].forEach((f) => { P[2].push(...tausch(f, 2), ...umkehr(f, 2), family(f, 2)); });
    FAM[3].forEach((f) => { P[3].push(...umkehr(f, 3), family(f, 3)); });
    // Stufe 4: Zahl fehlt im Haus / Aufgabe fehlt in der Familie
    const f4 = FAM[3].filter((f) => f.b <= 9).concat(FAM[2].filter((f) => f.s >= 8));
    f4.forEach((f) => {
      P[4].push({ kind: 'missing', f, miss: 's', k: `Haus ? = ${f.a} + ${f.b}`, L: 4 });
      P[4].push({ kind: 'missing', f, miss: 'a', k: `Haus ${f.s} = ${f.b} + ?`, L: 4 });
      P[4].push({ kind: 'missing', f, miss: 'b', k: `Haus ${f.s} = ${f.a} + ?`, L: 4 });
      members(f).forEach((c, i) => { if (f.s >= 11 || i >= 2) P[4].push({ kind: 'missingCard', f, gone: i, k: `Fehlt ${keyOf(c)}`, L: 4 }); });
    });
    // Stufe 5: Wer gehört nicht dazu? / Platzhalter
    FAM[3].forEach((f) => {
      const C = intruderCands(f);
      const subtle = [...C.swap.slice(0, 1), ...C.minus.slice(0, 2), ...C.plus.slice(0, 1)];
      subtle.forEach((c) => P[5].push({ kind: 'odd', f, intr: c, k: `Fremd ${keyOf(c)}`, L: 5 }));
      [f.a, f.b].forEach((p) => {
        const q = f.s - p;
        P[5].push({ kind: 'platz', f, form: 'plusR', p, ans: q, k: `${p} + ? = ${f.s}`, L: 5 });
        P[5].push({ kind: 'platz', f, form: 'minusR', p: q, ans: p, k: `${f.s} - ? = ${q}`, L: 5 });
        P[5].push({ kind: 'platz', f, form: 'minusL', p, ans: f.s, k: `? - ${p} = ${q}`, L: 5 });
      });
      P[5].push({ kind: 'family', f, k: `Haus ${fk(f)}`, L: 5 });
    });
    return P;
  }
  const POOL = buildPools();
  const START = { 1: 'tausch', 2: 'family', 3: 'family', 4: 'missing', 5: 'odd' };

  const INTRO = {
    1: 'Das ist ein Zahlenhaus. Oben im Dach wohnt die große Zahl. Unten wohnen zwei Zahlen. Zusammen ergeben sie die große Zahl. Bei der Tauschaufgabe tauschen die zwei Zahlen ihre Plätze.',
    2: 'Jetzt ohne Punkte! Zu jeder Familie gehören vier Aufgaben: zwei Plusaufgaben und zwei Minusaufgaben.',
    3: 'Jetzt wohnen größere Zahlen im Haus, bis zwanzig. Der Trick bleibt gleich. Wenn du eine Aufgabe weißt, weißt du die ganze Familie.',
    4: 'Jetzt fehlt etwas! Mal fehlt eine Zahl im Haus, mal fehlt eine Aufgabe in der Familie. Finde es heraus!',
    5: 'Jetzt bist du Familien Detektiv! Eine fremde Aufgabe hat sich eingeschmuggelt. Und manchmal fehlt eine Zahl in der Rechnung.',
  };
  let introduced = new Set();
  let lastKind = null;

  const OK = ['Richtig', 'Genau', 'Super', 'Stimmt', 'Klasse'];
  const okWord = () => U.pickFresh('auf-ok', OK, 3);
  const proc = (ctx, normal, list) => (ctx.wrongCount === 0 && U.chance(0.3) ? U.pickFresh('auf-proc-' + list[0].slice(0, 12), list, 1) : normal);

  /* ---------------- Bausteine: Punkte, Haus, Karten ---------------- */
  const RED = 'auf-red';
  const BLUE = 'auf-blue';
  function colorOf(n, f) { return n === f.a ? RED : n === f.b ? BLUE : 'auf-gold'; }
  function dotRow(n, cls, crossed = 0) {
    const box = el('span.auf-dots');
    for (let i = 0; i < n; i++) {
      if (i > 0 && i % 5 === 0) box.appendChild(el('span.auf-dgap'));
      box.appendChild(el('span', { class: 'auf-dot ' + cls + (i >= n - crossed ? ' auf-x' : '') }));
    }
    return box;
  }
  /** Punktbild einer Karte (Stufe 1) */
  function cardDots(c, f) {
    const box = el('span.auf-cdots', { 'aria-hidden': 'true' });
    if (c.op === '+') {
      box.appendChild(dotRow(c.x, colorOf(c.x, f)));
      box.appendChild(dotRow(c.y, colorOf(c.y, f)));
    } else if (!isSwap(c)) {
      const keep = c.x - c.y;
      if (c.x === f.s && (c.y === f.a || c.y === f.b)) {
        box.appendChild(dotRow(keep, colorOf(keep, f)));
        box.appendChild(dotRow(c.y, colorOf(c.y, f), c.y));
      } else box.appendChild(dotRow(c.x, 'auf-gold', c.y));
    }
    return box;
  }
  function cardFace(c, f, dots) {
    const r = el('span.auf-res', { 'aria-hidden': 'true' }, `= ${res(c)}`);
    const face = el('span.auf-face',
      el('span.auf-eqline', el('span.auf-lab', lab(c)), r),
      dots ? cardDots(c, f) : null);
    face._res = r;
    return face;
  }

  function house(f, opts = {}) {
    const hide = opts.hide || {};
    const num = (v, which) => el('span', { class: 'auf-num auf-n-' + which + (hide[which] ? ' auf-q' : '') }, hide[which] ? '?' : String(v));
    const nS = num(f.s, 's');
    const nA = num(f.a, 'a');
    const nB = num(f.b, 'b');
    const roomA = el('div.auf-room.auf-room-a', nA, opts.dots ? dotRow(f.a, RED) : null);
    const roomB = el('div.auf-room.auf-room-b', nB, opts.dots ? dotRow(f.b, BLUE) : null);
    const roof = el('div.auf-roof', el('span.auf-chimney'), nS);
    const slots = [];
    let slotBox = null;
    if (opts.slots) {
      slotBox = el('div.auf-slots');
      for (let i = 0; i < 4; i++) {
        const s = el('div.auf-slot', el('span.auf-slotq', '?'));
        slots.push(s);
        slotBox.appendChild(s);
      }
    }
    const node = el('div', { class: 'auf-house' + (opts.small ? ' auf-small' : '') + (opts.dots ? ' auf-withdots' : ''), role: 'img', 'aria-label': opts.aria || 'Zahlenhaus' },
      roof, el('div.auf-body', el('div.auf-rooms', roomA, roomB), slotBox));
    const nums = { s: nS, a: nA, b: nB };
    return {
      node,
      slots,
      nums,
      reveal(which) {
        const n = nums[which];
        n.textContent = String(f[which]);
        n.classList.remove('auf-q');
        n.classList.add('auf-pop', 'auf-filled');
      },
      revealAll() { ['s', 'a', 'b'].forEach((k) => { if (nums[k].classList.contains('auf-q')) this.reveal(k); }); },
      glow(on = true) { Object.values(nums).forEach((n) => n.classList.toggle('auf-glow', on)); },
    };
  }

  function eqBox(lines) {
    const box = el('div.auf-eqbox');
    lines.forEach((l) => box.appendChild(el('div', { class: 'auf-eq' + (l.cls ? ' ' + l.cls : '') }, l.text)));
    return box;
  }

  function numOptions(ans, count, prefer, max = 20) {
    const set = new Set([ans]);
    for (const p of prefer) {
      if (set.size >= count) break;
      if (p >= 0 && p <= max && p !== ans) set.add(p);
    }
    for (const x of U.shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 3])) {
      if (set.size >= count) break;
      if (x >= 0 && x <= max) set.add(x);
    }
    let guard = 0;
    while (set.size < count && guard++ < 100) set.add(U.randInt(0, max));
    return Array.from(set).sort((x, y) => x - y);
  }
  const hintAfter = (ctx, n) => (LT.z2 && LT.z2.hintAfterFor ? LT.z2.hintAfterFor(ctx, n) : (n <= 3 ? 1 : 2));

  async function askNumber(ctx, host, o) {
    const box = el('div.choices.auf-nums');
    host.appendChild(box);
    const values = numOptions(o.answer, o.count, o.prefer);
    const items = values.map((v) => ({ content: String(v), text: true, correct: v === o.answer, say: w(v), value: v, className: 'auf-ntile' }));
    await ctx.choices(items, {
      container: box,
      shuffle: false,
      size: 'small',
      hintAfter: hintAfter(ctx, items.length),
      praise: false,
      correctSay: () => o.correctSay(),
      explain: (item) => o.explain(item.value),
      hintSay: () => o.hintSay(),
      modelSay: () => o.modelSay(),
      onWrong: o.onWrong,
    });
  }

  async function askCards(ctx, host, list, o) {
    const box = el('div.choices.auf-cchoices');
    host.appendChild(box);
    const items = list.map((x) => ({
      content: cardFace(x.c, o.f, o.dots), correct: !!x.correct, say: sp(x.c), aria: sp(x.c), c: x.c, why: x.why, className: 'auf-ctile',
    }));
    await ctx.choices(items, {
      container: box,
      hintAfter: hintAfter(ctx, items.length),
      praise: false,
      correctSay: (item) => o.correctSay(item),
      explain: (item) => o.explain(item),
      hintSay: () => o.hintSay(),
      modelSay: () => o.modelSay(),
      onWrong: o.onWrong,
    });
  }

  /** Erklärung zu einem Kärtchen, das nicht zur Familie gehört (ohne die Lösung zu verraten) */
  function whyNot(c, f) {
    if (isSwap(c)) return `Schau mal: Von ${w(c.x)} Äpfeln kann ich keine ${w(c.y)} wegnehmen. Bei Minus steht die größte Zahl vorne.`;
    const n = foreignOf(c, f);
    if (n === res(c) && n !== c.x && n !== c.y) return `Schau mal: ${Sp(c)} ist ${w(n)}. Die ${W(n)} wohnt nicht in diesem Haus.`;
    if (n != null) return `Schau mal: In dieser Aufgabe kommt die ${W(n)} vor. Die ${W(n)} wohnt nicht in diesem Haus.`;
    return `Schau mal genau auf die Zahlen im Haus.`;
  }

  function main(ctx) {
    ctx.stage.classList.add('auf-stage');
    const m = el('div.auf-main');
    ctx.stage.appendChild(m);
    return m;
  }

  /* ================================================================
     Tauschaufgabe (Stufe 1, 2)
     ================================================================ */
  async function playTausch(ctx, t) {
    const { f, x, y } = t;
    const L = t.L;
    const dots = L === 1;
    const M = main(ctx);
    const H = house(f, { dots, small: true, aria: `Zahlenhaus mit ${f.s}, ${f.a} und ${f.b}` });
    const given = card(x, '+', y);
    const E = eqBox([{ text: `${x} + ${y} = ${f.s}` }]);
    const top = el('div.auf-top', H.node, E);
    M.appendChild(top);
    const right = card(y, '+', x);
    const dis = [
      { c: card(x, '+', y), why: 'same' },
      { c: card(f.s, '-', y), why: 'minus' },
      { c: U.chance(0.5) ? card(y, '+', y) : card(x, '+', Math.min(y + 1, 20 - x)), why: 'other' },
      { c: card(y, '-', x), why: 'minus' },
    ].filter((d) => !same(d.c, right) && d.c.y >= 1);
    let n = L === 1 ? 2 : 3;
    if (ctx.flow > 0 && L > 1) n = 3;
    const pickDis = [dis[0], ...U.sample(dis.slice(1), n - 1)];
    const list = [{ c: right, correct: true }, ...pickDis];
    await ctx.instruct(`${Sp(given)} ist ${w(f.s)}. Welche Aufgabe ist die Tauschaufgabe?`);
    if (!ctx.active) return;
    await askCards(ctx, M, list, {
      f,
      dots,
      correctSay: () => {
        E.appendChild(el('div.auf-eq.auf-eq2.auf-pop', `${y} + ${x} = ${f.s}`));
        return proc(ctx, `${okWord()}! ${Sp(right)} ist auch ${w(f.s)}.`, [
          `Du hast die zwei Zahlen einfach getauscht. Genau so geht das!`,
          `Super! Du weißt: Beim Tauschen bleibt das Ergebnis gleich. Sehr schlau!`,
        ]);
      },
      explain: (item) => {
        if (item.why === 'same') return 'Schau mal: Das ist genau die gleiche Aufgabe. Bei der Tauschaufgabe tauschen die zwei Zahlen ihre Plätze.';
        if (item.c.op === '-') return 'Das ist eine Minusaufgabe. Die Tauschaufgabe ist auch eine Plusaufgabe.';
        return `Schau mal: Bei ${sp(item.c)} sind andere Zahlen dabei. Beim Tauschen bleiben die Zahlen gleich. Sie wechseln nur den Platz.`;
      },
      hintSay: () => `Tipp: Nimm die gleichen Zahlen. Was vorne war, kommt nach hinten.`,
      modelSay: () => `Schau: Aus ${sp(given)} wird ${sp(right)}. Das Ergebnis bleibt ${w(f.s)}. Tipp die Karte an!`,
    });
    if (!ctx.active) return;
    if (ctx.wrongCount > 0 || U.chance(0.4)) await ctx.say('Beim Tauschen bleibt das Ergebnis gleich.');
    await ctx.sleep(400);
  }

  /* ================================================================
     Umkehraufgabe (Stufe 2, 3)
     ================================================================ */
  async function playUmkehr(ctx, t) {
    const { f, x, y } = t;
    const M = main(ctx);
    const H = house(f, { small: true, aria: `Zahlenhaus mit ${f.s}, ${f.a} und ${f.b}` });
    const slot = el('span.auf-slot-inline', '?');
    const E = eqBox([{ text: `${x} + ${y} = ${f.s}` }]);
    const line2 = el('div.auf-eq.auf-eq-ask', `${f.s} − ${y} = `, slot);
    E.appendChild(line2);
    M.appendChild(el('div.auf-top', H.node, E));
    await ctx.instruct(`${W(x)} plus ${w(y)} ist ${w(f.s)}. Und ${w(f.s)} minus ${w(y)}?`);
    if (!ctx.active) return;
    const yNode = x === f.a ? H.nums.b : H.nums.a;
    await askNumber(ctx, M, {
      answer: x,
      count: ctx.flow > 0 ? 5 : 4,
      prefer: [y, f.s + y <= 20 ? f.s + y : f.s, x + 1, x - 1],
      correctSay: () => {
        slot.textContent = String(x);
        slot.classList.add('auf-done');
        yNode.classList.remove('auf-taken');
        return proc(ctx, `${okWord()}! ${W(f.s)} minus ${w(y)} ist ${w(x)}.`, [
          'Du hast die Plusaufgabe umgedreht. Das ist die Umkehraufgabe. Sehr schlau!',
          'Du hast im Zahlenhaus nachgeschaut. Genau so rechnen Profis!',
        ]);
      },
      explain: (v) => {
        if (v === y) return `Schau mal: Die ${W(y)} nehmen wir weg. Welche Zahl bleibt übrig?`;
        if (v === f.s) return `${W(f.s)} ist die große Zahl im Dach. Wir nehmen ${w(y)} weg. Dann wird es weniger.`;
        if (v > f.s) return 'Schau mal: Minus heißt wegnehmen. Dann wird es weniger, nicht mehr.';
        return `Prüfe mal: ${W(v)} plus ${w(y)} ist ${w(v + y)}. Wir brauchen ${w(f.s)}.`;
      },
      hintSay: () => {
        yNode.classList.add('auf-taken');
        return `Tipp: Schau ins Zahlenhaus. Nimm die ${W(y)} weg. Welche Zahl wohnt noch unten?`;
      },
      modelSay: () => `Schau: ${W(x)} plus ${w(y)} ist ${w(f.s)}. Also ist ${w(f.s)} minus ${w(y)} wieder ${w(x)}. Die Umkehraufgabe rechnet zurück.`,
    });
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  /* ================================================================
     Familie ins Haus holen (Stufe 1, 2, 3, 5) – eigene Bedienung
     ================================================================ */
  function playFamily(ctx, t) {
    const { f } = t;
    const dots = t.L === 1;
    return new Promise(async (resolve) => {
      const M = main(ctx);
      const H = house(f, { dots, slots: true, aria: `Zahlenhaus mit ${f.s}, ${f.a} und ${f.b}` });
      M.appendChild(H.node);
      let nIntr = t.L === 1 ? 1 : 2;
      if (ctx.flow > 0) nIntr++;
      if (ctx.flow < 0) nIntr = Math.max(1, nIntr - 1);
      const intr = pickIntruders(f, t.L, nIntr);
      const all = U.shuffle([...members(f).map((c) => ({ c, ok: true })), ...intr.map((c) => ({ c, ok: false }))]);
      const pile = el('div.auf-pile');
      M.appendChild(pile);
      let busy = true;
      let done = false;
      let placed = 0;
      let sw = 0;
      const cards = all.map((x) => {
        const face = cardFace(x.c, f, dots);
        const b = el('button', { type: 'button', class: 'auf-card' + (dots ? ' auf-card-dots' : ''), 'aria-label': sp(x.c) }, face);
        b._x = x;
        b._face = face;
        if (x.ok) ctx.markTest(b);
        ctx.listen(b, 'click', () => onTap(b));
        pile.appendChild(b);
        return b;
      });
      const open = () => cards.filter((b) => b._x.ok && !b._in);
      const unhintAll = () => { cards.forEach((b) => ctx.unhint(b)); H.glow(false); };

      async function onTap(b) {
        if (busy || done || !ctx.active || b._in || b._out) return;
        busy = true;
        const x = b._x;
        if (x.ok) {
          unhintAll();
          b._in = true;
          ctx.markTest(b, false);
          const slot = H.slots[placed++];
          U.clear(slot);
          slot.classList.add('auf-filled');
          slot.appendChild(b);
          b.classList.add('auf-in', 'auf-pop');
          b._face._res.classList.add('auf-show');
          LT.sfx.play('pop');
          await ctx.say(`${Sp(x.c)} ist ${w(res(x.c))}.`);
          if (!ctx.active) return;
          if (placed >= 4) return finish();
          busy = false;
          return;
        }
        sw++;
        await ctx.wrong(b, { say: whyNot(x.c, f), keep: true });
        if (!ctx.active) return;
        b._out = true;
        b.classList.add('auf-out');
        b.setAttribute('aria-disabled', 'true');
        if (sw === 2) {
          H.glow(true);
          await ctx.say(`Tipp: Prüfe jede Karte. Es dürfen nur ${w(f.a)}, ${w(f.b)} und ${w(f.s)} vorkommen. Bei Minus steht die größte Zahl vorne.`);
        } else if (sw >= 3) {
          const next = open()[0];
          if (next) {
            ctx.modelShown = true;
            ctx.hint(next);
            await ctx.say(`Schau, diese Karte gehört dazu: ${sp(next._x.c)} ist ${w(res(next._x.c))}. Tipp sie an!`);
          }
        }
        if (!ctx.active) return;
        busy = false;
      }

      async function finish() {
        done = true;
        ctx.testSolve(null);
        unhintAll();
        cards.forEach((b) => { if (!b._in) b.classList.add('auf-gone'); });
        H.node.classList.add('auf-complete');
        const normal = U.pickFresh('auf-fam-ok', [
          'Die ganze Familie ist zu Hause! Zwei Plusaufgaben und zwei Minusaufgaben.',
          `Super! Alle vier Aufgaben mit ${w(f.a)}, ${w(f.b)} und ${w(f.s)} sind zu Hause.`,
          'Klasse! Die Familie ist komplett.',
        ], 2);
        await ctx.correct(H.node, {
          praise: false,
          say: proc(ctx, normal, [
            'Du hast bei jeder Karte die Zahlen geprüft. Sehr gründlich!',
            'Du hast gemerkt: Bei Minus steht die größte Zahl vorne. Wie ein Profi!',
          ]),
        });
        if (!ctx.active) return;
        await ctx.sleep(400);
        resolve();
      }

      ctx.testSolve(() => {
        if (busy || done) return;
        const next = open()[0];
        if (next) onTap(next);
      });
      let say;
      if (t.L === 1) say = 'Welche Aufgaben wohnen in diesem Haus? Tippe die vier passenden Karten an.';
      else if (nIntr > 1) say = 'Hol die vier Aufgaben der Familie ins Haus. Fremde Karten gehören nicht dazu.';
      else say = 'Hol die vier Aufgaben der Familie ins Haus. Eine fremde Karte gehört nicht dazu.';
      await ctx.instruct(say);
      if (!ctx.active) return;
      busy = false;
    });
  }

  /* ================================================================
     Eine Zahl fehlt im Haus (Stufe 4)
     ================================================================ */
  async function playMissing(ctx, t) {
    const { f, miss } = t;
    const M = main(ctx);
    const hide = { [miss]: true };
    const H = house(f, { hide, aria: 'Zahlenhaus mit einer fehlenden Zahl' });
    M.appendChild(H.node);
    const known = miss === 'a' ? f.b : f.a;
    const ans = f[miss];
    if (miss === 's') await ctx.instruct(`Unten wohnen ${w(f.a)} und ${w(f.b)}. Welche Zahl wohnt im Dach?`);
    else await ctx.instruct(`Im Dach wohnt die ${W(f.s)}. Unten wohnt die ${W(known)}. Welche Zahl fehlt?`);
    if (!ctx.active) return;
    const prefer = miss === 's'
      ? [ans + 1, ans - 1, Math.abs(f.b - f.a), ans + 2]
      : [f.s + known <= 20 ? f.s + known : ans + 2, ans + 1, ans - 1, known];
    const family = () => `${W(f.a)} plus ${w(f.b)} ist ${w(f.s)}. ${W(f.s)} minus ${w(f.a)} ist ${w(f.b)}.`;
    await askNumber(ctx, M, {
      answer: ans,
      count: ctx.flow < 0 ? 3 : 4,
      prefer,
      correctSay: () => {
        H.reveal(miss);
        return proc(ctx, `${okWord()}! Die ${W(ans)} gehört ins Haus.`, miss === 's'
          ? ['Du hast die zwei Zahlen unten zusammengerechnet. Genau richtig!']
          : [`Du hast von ${w(known)} bis ${w(f.s)} weitergerechnet. Sehr schlau!`, 'Du hast die Umkehraufgabe benutzt. Wie ein Profi!']);
      },
      explain: (v) => {
        if (miss === 's') {
          if (v <= f.b) return 'Schau mal: Im Dach wohnt die größte Zahl im Haus.';
          return `Fast! Im Dach wohnt ${w(f.a)} plus ${w(f.b)}. Rechne nochmal genau.`;
        }
        if (v >= f.s) return 'Schau mal: Die Zahl im Dach ist die größte. Unten wohnen kleinere Zahlen.';
        return `Prüfe mal: ${W(known)} plus ${w(v)} ist ${w(known + v)}. Im Dach steht aber ${w(f.s)}.`;
      },
      hintSay: () => (miss === 's'
        ? 'Tipp: Die zwei Zahlen unten ergeben zusammen die Zahl im Dach.'
        : `Tipp: Rechne von ${w(known)} weiter bis ${w(f.s)}. Oder rechne ${w(f.s)} minus ${w(known)}.`),
      modelSay: () => (miss === 's'
        ? `Schau: ${W(f.a)} plus ${w(f.b)} ist ${w(f.s)}. Die ${W(f.s)} wohnt im Dach.`
        : `Schau: ${W(known)} plus ${w(ans)} ist ${w(f.s)}. Also fehlt die ${W(ans)}.`),
    });
    if (!ctx.active) return;
    if (ctx.wrongCount > 0) await ctx.say(family());
    await ctx.sleep(400);
  }

  /* ================================================================
     Eine Aufgabe fehlt in der Familie (Stufe 4)
     ================================================================ */
  async function playMissingCard(ctx, t) {
    const { f, gone } = t;
    const M = main(ctx);
    const H = house(f, { slots: true, aria: `Zahlenhaus mit ${f.s}, ${f.a} und ${f.b}` });
    M.appendChild(H.node);
    const mem = members(f);
    const missing = mem[gone];
    let si = 0;
    mem.forEach((c, i) => {
      const slot = H.slots[si++];
      if (i === gone) { slot.classList.add('auf-wait'); return; }
      U.clear(slot);
      slot.classList.add('auf-filled');
      const face = cardFace(c, f, false);
      face._res.classList.add('auf-show');
      slot.appendChild(el('div.auf-card.auf-in.auf-static', face));
    });
    const C = intruderCands(f);
    const others = mem.filter((c, i) => i !== gone);
    const dis = [
      { c: U.pick(others.filter((c) => c.op === missing.op).concat(others.slice(0, 1))), why: 'dup' },
      ...(C.swap.length ? [{ c: U.pick(C.swap), why: 'swap' }] : []),
      ...(C.minus.length ? [{ c: U.pick(C.minus), why: 'foreign' }] : []),
      ...(C.plus.length ? [{ c: U.pick(C.plus), why: 'foreign' }] : []),
    ];
    const n = ctx.flow < 0 ? 2 : 3;
    const pickDis = [dis[0], ...U.sample(dis.slice(1), n - 1)];
    await ctx.instruct('Eine Aufgabe fehlt noch in der Familie. Welche?');
    if (!ctx.active) return;
    await askCards(ctx, M, [{ c: missing, correct: true }, ...pickDis], {
      f,
      dots: false,
      correctSay: () => {
        const slot = H.slots[gone];
        U.clear(slot);
        slot.classList.remove('auf-wait');
        slot.classList.add('auf-filled');
        const face = cardFace(missing, f, false);
        face._res.classList.add('auf-show');
        slot.appendChild(el('div.auf-card.auf-in.auf-static.auf-pop', face));
        return proc(ctx, `${okWord()}! ${Sp(missing)} ist ${w(res(missing))}. Jetzt ist die Familie komplett.`, [
          'Du hast die Plusaufgaben und Minusaufgaben gezählt. Sehr schlau!',
          'Du hast genau geschaut, welche Aufgabe noch fehlt. Klasse gemacht!',
        ]);
      },
      explain: (item) => {
        if (item.why === 'dup') return 'Schau mal: Diese Aufgabe wohnt schon im Haus. Welche fehlt noch?';
        return whyNot(item.c, f);
      },
      hintSay: () => 'Tipp: Zur Familie gehören zwei Plusaufgaben und zwei Minusaufgaben. Zähle mal im Haus.',
      modelSay: () => `Schau: ${Sp(missing)} ist ${w(res(missing))}. Diese Aufgabe fehlt noch. Tipp sie an!`,
    });
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  /* ================================================================
     Welche Aufgabe gehört nicht zur Familie? (Stufe 5)
     ================================================================ */
  async function playOdd(ctx, t) {
    const { f, intr } = t;
    const M = main(ctx);
    const showNums = ctx.flow < 0;
    const H = house(f, { small: true, hide: showNums ? {} : { s: true, a: true, b: true }, aria: 'Zahlenhaus' });
    M.appendChild(H.node);
    const mem = U.sample(members(f), 3);
    await ctx.instruct('Eine Aufgabe gehört nicht zur Familie. Welche ist die fremde Aufgabe?');
    if (!ctx.active) return;
    await askCards(ctx, M, [{ c: intr, correct: true }, ...mem.map((c) => ({ c }))], {
      f,
      dots: false,
      correctSay: () => {
        H.revealAll();
        return proc(ctx, `${okWord()}! ${Sp(intr)} gehört nicht dazu.`, [
          'Du hast die Zahlen der Familie herausgefunden. Echte Detektivarbeit!',
          'Du hast jede Aufgabe genau geprüft. Sehr gründlich!',
        ]);
      },
      explain: (item) => `Schau mal: ${Sp(item.c)} ist ${w(res(item.c))}. Diese Aufgabe passt zur Familie.`,
      hintSay: () => {
        H.revealAll();
        H.glow(true);
        return `Tipp: In der Familie wohnen ${w(f.a)}, ${w(f.b)} und ${w(f.s)}. Welche Aufgabe passt nicht dazu?`;
      },
      modelSay: () => {
        const why = isSwap(intr)
          ? `Von ${w(intr.x)} kann ich keine ${w(intr.y)} wegnehmen.`
          : `In ${sp(intr)} kommt die ${W(foreignOf(intr, f))} vor.`;
        return `Schau: ${why} Diese Aufgabe ist die fremde. Tipp sie an!`;
      },
    });
    if (!ctx.active) return;
    H.glow(false);
    await ctx.say(isSwap(intr) ? 'Bei Minus steht die größte Zahl vorne.' : `Die Familie heißt ${w(f.a)}, ${w(f.b)} und ${w(f.s)}.`);
    await ctx.sleep(400);
  }

  /* ================================================================
     Platzhalter über die Umkehraufgabe (Stufe 5)
     ================================================================ */
  async function playPlatz(ctx, t) {
    const { f, form, p, ans } = t;
    const M = main(ctx);
    const slot = el('span.auf-slot-inline', '?');
    let parts;
    let spoken;
    if (form === 'plusR') { parts = [`${p} + `, slot, ` = ${f.s}`]; spoken = `${W(p)} plus wie viel ist ${w(f.s)}?`; }
    else if (form === 'minusR') { parts = [`${f.s} − `, slot, ` = ${p}`]; spoken = `${W(f.s)} minus wie viel ist ${w(p)}?`; }
    else { parts = [slot, ` − ${p} = ${f.s - p}`]; spoken = `Wie viel minus ${w(p)} ist ${w(f.s - p)}?`; }
    const E = el('div.auf-eqbox', el('div.auf-eq.auf-eq-big', ...parts));
    const hide = form === 'minusL' ? { s: true } : (ans === f.a ? { a: true } : { b: true });
    const H = house(f, { small: true, hide, aria: 'Zahlenhaus als Hilfe' });
    const helpWrap = el('div.auf-helpwrap', H.node);
    if (ctx.flow >= 0) helpWrap.classList.add('auf-hidden');
    M.appendChild(el('div.auf-top', helpWrap, E));
    await ctx.instruct(spoken);
    if (!ctx.active) return;
    const showHelp = () => { helpWrap.classList.remove('auf-hidden'); helpWrap.classList.add('auf-pop'); };
    const q = f.s - p;
    await askNumber(ctx, M, {
      answer: ans,
      count: ctx.flow > 0 ? 5 : 4,
      prefer: form === 'minusL' ? [Math.abs(q - p), ans + 1, ans - 1] : [f.s + p <= 20 ? f.s + p : ans + 2, f.s, ans + 1, ans - 1],
      correctSay: () => {
        slot.textContent = String(ans);
        slot.classList.add('auf-done');
        H.revealAll();
        return proc(ctx, `${okWord()}! Die ${W(ans)} gehört in die Lücke.`, [
          'Du hast die Umkehraufgabe benutzt. Das ist ein echter Profi Trick!',
          'Du hast an die Rechenfamilie gedacht. Sehr schlau!',
        ]);
      },
      explain: (v) => {
        if (form === 'plusR') {
          if (v === f.s) return `Schau mal: Die ${W(f.s)} ist schon das Ergebnis. Welche Zahl kommt dazu?`;
          return `Prüfe mal: ${W(p)} plus ${w(v)} ist ${v + p <= 20 ? w(v + p) : 'mehr als zwanzig'}. Wir brauchen ${w(f.s)}.`;
        }
        if (form === 'minusR') {
          if (v > f.s) return `Schau mal: Von ${w(f.s)} kann ich keine ${w(v)} wegnehmen.`;
          return `Prüfe mal: ${W(f.s)} minus ${w(v)} ist ${w(f.s - v)}. Wir brauchen ${w(p)}.`;
        }
        if (v < p) return `Schau mal: Von ${w(v)} kann ich keine ${w(p)} wegnehmen. Die Zahl vorne muss die größte sein.`;
        return `Prüfe mal: ${W(v)} minus ${w(p)} ist ${w(v - p)}. Wir brauchen ${w(q)}.`;
      },
      hintSay: () => {
        showHelp();
        return form === 'minusL'
          ? `Tipp: Schau ins Zahlenhaus. Unten wohnen ${w(p)} und ${w(q)}. Welche Zahl wohnt im Dach?`
          : 'Tipp: Schau ins Zahlenhaus. Die zwei Zahlen unten ergeben zusammen die Zahl im Dach.';
      },
      modelSay: () => {
        showHelp();
        return `Schau: ${W(f.a)} plus ${w(f.b)} ist ${w(f.s)}. Also ist die gesuchte Zahl ${w(ans)}.`;
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  /* ------------------------------------------------------------------ */
  LT.registerGame({
    id: 'aufgabenfamilie',
    area: 'mathe1',
    title: 'Aufgabenfamilie',
    icon: '👨‍👩‍👧',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Hier wohnen Rechenfamilien. Drei Zahlen wohnen zusammen in einem Haus. Komm, wir lernen die Familien kennen!',
    parent: {
      skill: 'Tauschaufgabe, Umkehraufgabe und Rechenfamilien (Aufgabenfamilie aus drei Zahlen) im Zahlenraum bis 20',
      goal: 'Ihr Kind erkennt operative Beziehungen: 4 + 3 = 3 + 4 (Tauschaufgabe), aus 4 + 3 = 7 folgen 7 − 3 = 4 und 7 − 4 = 3 (Umkehraufgabe). Es nutzt das Zahlenhaus (Ganzes oben, zwei Teile unten), um fehlende Zahlen und Platzhalter-Aufgaben zu lösen, und weiß, dass es bei Minus kein Tauschen gibt.',
      levels: [
        'Bis 10 mit Punktbildern: Tauschaufgabe finden, die vier Aufgaben einer Familie ins Haus holen',
        'Bis 10 nur mit Zahlen: Familie (mit Stolperkarten wie 3 − 7), Umkehraufgabe, Tauschaufgabe',
        'Bis 20: Familien und Umkehraufgaben (13 − 5 über 8 + 5 = 13)',
        'Eine Zahl fehlt im Zahlenhaus oder eine Aufgabe fehlt in der Familie',
        'Fremde Aufgabe in der Familie entdecken, Platzhalter-Aufgaben wie ? − 5 = 8 über die Umkehraufgabe',
      ],
      tip: 'Legen Sie mit drei Zahlenkarten (z. B. 3, 4, 7) und Plus-, Minus- und Gleichzeichen gemeinsam alle vier Aufgaben. Fragt Ihr Kind nach 3 − 7, nehmen Sie 3 Gummibärchen: „Kann ich davon 7 wegnehmen?“ Bei Minus steht immer die größte Zahl vorne.',
    },

    async task(ctx) {
      if (ctx.index === 0) { introduced = new Set(); lastKind = null; }
      const L = ctx.taskLevel;
      let pool = POOL[L];
      if (!introduced.has(L)) {
        introduced.add(L);
        pool = pool.filter((x) => x.kind === START[L]);
        await ctx.say(INTRO[L]);
        if (!ctx.active) return;
      } else {
        const kinds = new Set(pool.map((x) => x.kind));
        if (kinds.size > 1 && lastKind) pool = pool.filter((x) => x.kind !== lastKind);
      }
      const t = ctx.item(pool, (x) => x.k, { avoid: 6 });
      lastKind = t.kind;
      if (t.kind === 'tausch') return playTausch(ctx, t);
      if (t.kind === 'umkehr') return playUmkehr(ctx, t);
      if (t.kind === 'family') return playFamily(ctx, t);
      if (t.kind === 'missing') return playMissing(ctx, t);
      if (t.kind === 'missingCard') return playMissingCard(ctx, t);
      if (t.kind === 'odd') return playOdd(ctx, t);
      return playPlatz(ctx, t);
    },
  });
})();
