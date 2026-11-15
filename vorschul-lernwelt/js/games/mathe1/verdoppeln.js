/* ==========================================================================
   Spiel „Zauberspiegel“ 🪞 (Rechenschule, Klasse 1) – Spec A5
   Verdoppeln und Halbieren bis 20, Fast-Verdopplung (6 + 7 = 6 + 6 + 1),
   gerade/ungerade („Geht das gerecht?“).

   Didaktik:
   - Stufe 1  Verdoppeln 1–5: Das Kind legt selbst Dinge vor den Spiegel
              (Korb antippen), zaubert mit dem Zauberstab, der Spiegel zeigt
              noch einmal so viele. „Wie viele sind es zusammen?“
   - Stufe 2  Verdoppeln 6–10: Beide Seiten in Fünferreihen („Kraft der Fünf“):
              5 + 5 = 10, dann der Rest doppelt.
   - Stufe 3  Halbieren gerader Zahlen bis 20: Kekse gerecht an Flo und Eule
              verteilen. Rückbezug: „Welche Zahl und noch einmal die gleiche?“
   - Stufe 4  Fast-Verdopplung: erst die passende Verdopplung wählen
              (6 + 6 oder 7 + 7), dann eins mehr / eins weniger.
   - Stufe 5  Gemischt im Kopf (Spiegel nur als Hilfe) und „Geht das gerecht?“
              mit ungeraden Zahlen: Einführung gerade / ungerade.
   - Fehlvorstellungen:
       • Verdoppeln als „+2“ → „Verdoppeln heißt: gleich viele noch einmal.“
       • Halbieren als „−2“ → „Zwei gleich große Teile.“
       • Fast-Verdopplung: Verdopplung ohne den einen Extra-Punkt.
   - Anpassung: ctx.taskLevel / ctx.flow wählen kleinere oder größere Zahlen,
     zeigen oder verstecken den Spiegel und die Anzahl der Antworten.
   - Lerninhalte (ctx.item): '4 + 4', 'Hälfte 12', '6 + 7', '11 gerecht?'.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const w = (n) => U.numberWord(n);
  const W = (n) => U.cap(w(n));

  /* ---------------- Dinge vor dem Spiegel ---------------- */
  const THINGS = [
    { e: '🍎', sg: 'Apfel', pl: 'Äpfel', g: 'm' },
    { e: '⭐', sg: 'Stern', pl: 'Sterne', g: 'm' },
    { e: '🍓', sg: 'Erdbeere', pl: 'Erdbeeren', g: 'f' },
    { e: '🐚', sg: 'Muschel', pl: 'Muscheln', g: 'f' },
    { e: '🌸', sg: 'Blume', pl: 'Blumen', g: 'f' },
    { e: '🐞', sg: 'Marienkäfer', pl: 'Marienkäfer', g: 'm' },
    { e: '🎈', sg: 'Ballon', pl: 'Ballons', g: 'm' },
  ];
  const ART_ACC = { m: 'einen', f: 'eine', n: 'ein' };
  const ART_NOM = { m: 'ein', f: 'eine', n: 'ein' };
  const acc = (n, it) => (n === 1 ? `${ART_ACC[it.g]} ${it.sg}` : `${w(n)} ${it.pl}`);
  const nom = (n, it) => (n === 1 ? `${ART_NOM[it.g]} ${it.sg}` : `${w(n)} ${it.pl}`);
  /** „Das ist ein Apfel.“ / „Das sind drei Äpfel.“ */
  const dasSind = (n, it, extra = '') => (n === 1 ? `Das ist ${extra}${nom(n, it)}.` : `Das sind ${extra}${nom(n, it)}.`);
  const thing = () => U.pickFresh('ver-thing', THINGS, 3, (x) => x.sg);

  /* ---------------- Aufgaben-Pools ---------------- */
  const dbl = (n, direct) => ({ kind: 'double', n, R: 2 * n, k: `${n} + ${n}`, direct: !!direct });
  const half = (n, direct) => ({ kind: 'half', n, h: n / 2, R: n / 2, k: `Hälfte ${n}`, direct: !!direct });
  const near = (x, y, direct) => {
    const a = Math.min(x, y);
    return { kind: 'near', x, y, a, R: x + y, k: `${x} + ${y}`, direct: !!direct };
  };
  const parity = (n) => ({ kind: 'parity', n, odd: n % 2 === 1, R: n % 2 === 1 ? 'odd' : 'even', k: `${n} gerecht?` });
  const nearPool = (lo, hi, direct) => {
    const out = [];
    for (let a = lo; a <= hi; a++) out.push(near(a, a + 1, direct), near(a + 1, a, direct));
    return out;
  };
  const evens = (lo, hi) => U.range(lo, hi).filter((n) => n % 2 === 0);

  const POOL = {
    b: U.range(1, 5).map((n) => ({ ...dbl(n), kind: 'build' })),
    be: U.range(1, 3).map((n) => ({ ...dbl(n), kind: 'build' })),
    bs: U.range(3, 5).map((n) => ({ ...dbl(n), kind: 'build' })),
    d: U.range(6, 10).map((n) => dbl(n)),
    de: U.range(6, 8).map((n) => dbl(n)),
    dd: U.range(6, 10).map((n) => dbl(n, true)),
    h: evens(4, 20).map((n) => half(n)),
    he: evens(2, 10).map((n) => half(n)),
    hh: evens(12, 20).map((n) => half(n, true)),
    n: nearPool(3, 9),
    ne: nearPool(1, 5),
    nd: nearPool(4, 9, true),
    m: [
      ...[7, 9, 11, 13, 15, 12, 14, 16].map(parity),
      ...U.range(6, 10).map((n) => dbl(n, true)),
      ...evens(12, 20).map((n) => half(n, true)),
      ...nearPool(5, 9, true).filter((t) => t.x < t.y),
      near(9, 10, true),
    ],
    me: [
      ...[5, 7, 9, 6, 8, 10].map(parity),
      ...U.range(3, 7).map((n) => dbl(n, true)),
      ...evens(6, 12).map((n) => half(n)),
      ...nearPool(2, 5, true).filter((t) => t.x < t.y),
    ],
  };

  /** Pool und Intro je Aufgabe. ctx.level bestimmt die Art (Legen, Fünferreihen,
      Halbieren, …), ctx.taskLevel nur die Schwere innerhalb dieser Art – so
      wechselt die Bedienung (Korb vs. Antwortkarten) nie mitten in der Runde. */
  function config(ctx) {
    const L = ctx.level;
    const T = ctx.taskLevel;
    if (L === 1) return { pool: T > 1 ? 'bs' : ctx.flow < 0 ? 'be' : 'b', intro: 1 };
    if (L === 2) return { pool: T < 2 ? 'de' : T > 2 ? 'dd' : 'd', intro: 2 };
    if (L === 3) return { pool: T < 3 ? 'he' : T > 3 ? 'hh' : 'h', intro: 3 };
    if (L === 4) return { pool: T < 4 ? 'ne' : T > 4 ? 'nd' : 'n', intro: 4 };
    return { pool: T < 5 ? 'me' : 'm', intro: 5 };
  }

  const INTRO = {
    1: 'Das ist ein Zauberspiegel! Leg etwas davor, dann zaubert der Spiegel noch einmal genauso viele. Das heißt verdoppeln.',
    2: 'Jetzt kommen größere Zahlen. Schau auf die Fünferreihen. Fünf und fünf sind zehn. Dann rechnest du den Rest.',
    3: 'Jetzt teilen Flo und Eule Kekse. Gerecht heißt: Beide bekommen gleich viele. Das heißt halbieren.',
    4: 'Jetzt kommt ein Trick! Bei sechs plus sieben ist fast eine Verdopplung versteckt. Sechs plus sechs, und dann noch einer.',
    5: 'Jetzt bist du ein Spiegel-Profi! Rechne im Kopf. Und manchmal fragt Flo: Geht das gerecht? Gerade Zahlen kann man gerecht teilen. Bei ungeraden Zahlen bleibt einer übrig.',
  };
  let introduced = new Set();

  const OK = ['Richtig', 'Genau', 'Super', 'Stimmt', 'Klasse'];
  const okWord = () => U.pickFresh('ver-ok', OK, 3);
  const proc = (ctx, normal, list) => (ctx.wrongCount === 0 && U.chance(0.3) ? U.pickFresh('ver-proc-' + list[0].length, list, 1) : normal);

  /* ---------------- Antwortmöglichkeiten ---------------- */
  function options(n, count, prefer, max = 20) {
    const set = new Set([n]);
    for (const p of prefer) {
      if (set.size >= count) break;
      if (p >= 0 && p <= max && p !== n) set.add(p);
    }
    for (const x of U.shuffle([n + 1, n - 1, n + 2, n - 2, n + 3])) {
      if (set.size >= count) break;
      if (x >= 0 && x <= max) set.add(x);
    }
    let guard = 0;
    while (set.size < count && guard++ < 100) set.add(U.randInt(0, max));
    return Array.from(set).sort((x, y) => x - y);
  }

  async function numberChoice(ctx, host, opts) {
    const box = el('div.choices.ver-choices');
    host.appendChild(box);
    const values = options(opts.answer, opts.count, opts.prefer);
    const items = values.map((v) => ({ content: String(v), text: true, correct: v === opts.answer, say: w(v), value: v, className: 'ver-num' }));
    const ha = LT.z2 && LT.z2.hintAfterFor ? LT.z2.hintAfterFor(ctx, items.length) : (items.length <= 3 ? 1 : 2);
    await ctx.choices(items, {
      container: box,
      shuffle: false,
      size: 'small',
      hintAfter: ha,
      praise: false,
      correctSay: () => opts.correctSay(),
      explain: (item) => opts.explain(item.value),
      hintSay: () => opts.hintSay(),
      modelSay: () => opts.modelSay(),
    });
    box.remove();
  }

  /* ---------------- Gleichung ---------------- */
  function equation(parts, aria) {
    const slots = [];
    const main = el('div.ver-eq', { role: 'img', 'aria-label': aria });
    parts.forEach((p) => {
      if (p === '?') {
        const s = el('span.ver-slot', '?');
        slots.push(s);
        main.appendChild(s);
      } else if (/^[+−=]$/.test(p)) main.appendChild(el('span.ver-op', p));
      else main.appendChild(el('span.ver-n', p));
    });
    const helper = el('div.ver-help.ver-hidden', { 'aria-hidden': 'true' });
    const node = el('div.ver-eqbox', main, helper);
    return {
      node,
      fill(v) { slots.forEach((s) => { s.textContent = String(v); s.classList.add('ver-done'); }); },
      help(html) {
        helper.innerHTML = html;
        helper.classList.remove('ver-hidden');
        helper.classList.add('ver-pop');
      },
    };
  }

  /* ---------------- Zauberspiegel (zwei Seiten) ---------------- */
  function rows(n, emoji, extraAt = -1) {
    const box = el('div.ver-rows');
    let row = null;
    for (let i = 0; i < n; i++) {
      if (i % 5 === 0) { row = el('div.ver-row'); box.appendChild(row); }
      row.appendChild(el('span', { class: 'ver-it' + (i === extraAt ? ' ver-extra' : '') }, emoji));
    }
    return box;
  }
  function mirror(it, opts = {}) {
    const leftItems = el('div.ver-items');
    const rightItems = el('div.ver-items');
    const lc = el('span.ver-count');
    const rc = el('span.ver-count');
    const mkFog = () => el('div.ver-fog', { 'aria-hidden': 'true' }, el('span', '✨'), el('span.ver-fogq', '?'), el('span', '✨'));
    const fog = mkFog();
    const left = el('div.ver-side.ver-left', leftItems, lc, el('div.ver-fog.ver-fogleft', el('span', '🪄')));
    const glass = el('div.ver-side.ver-glass', el('div.ver-mirrorwrap', rightItems), rc, fog);
    const node = el('div.ver-mirror', { 'aria-hidden': 'true' },
      left, el('div.ver-frame', el('span.ver-frametop', '🪞')), glass);
    let ln = 0;
    let rn = 0;
    const api = {
      node,
      left,
      glass,
      setLeft(n, extraAt = -1) {
        ln = n;
        U.clear(leftItems);
        if (n > 0) leftItems.appendChild(rows(n, it.e, extraAt));
        lc.textContent = n > 0 ? String(n) : '';
      },
      setRight(n, extraAt = -1) {
        rn = n;
        U.clear(rightItems);
        if (n > 0) rightItems.appendChild(rows(n, it.e, extraAt));
        rc.textContent = n > 0 ? String(n) : '';
      },
      fogged() { return !glass.classList.contains('ver-clear') || node.classList.contains('ver-veiled'); },
      veil() { node.classList.add('ver-veiled'); },
      reveal() {
        node.classList.remove('ver-veiled');
        glass.classList.add('ver-clear', 'ver-magic');
        LT.sfx.play('whoosh');
      },
      glowFives(on) { node.classList.toggle('ver-fives', on); },
      counts: () => [ln, rn],
    };
    if (opts.clear) glass.classList.add('ver-clear');
    return api;
  }

  /* ---------------- Keks-Teller (Halbieren / gerecht) ---------------- */
  function cookieTable(ctx, n) {
    const tray = el('div.ver-tray');
    const plateA = el('div.ver-plate-items');
    const plateB = el('div.ver-plate-items');
    const ca = el('span.ver-count');
    const cb = el('span.ver-count');
    const plates = el('div.ver-plates',
      el('div.ver-plate', el('span.ver-who', { html: LT.ui.floSVG() }), plateA, ca),
      el('div.ver-plate', el('span.ver-who', '🦉'), plateB, cb));
    const node = el('div.ver-table', { 'aria-hidden': 'true' }, tray, plates);
    const cookie = (cls = '') => el('span', { class: 'ver-it ver-cookie' + cls }, '🍪');

    function fives() {
      U.clear(tray);
      tray.className = 'ver-tray';
      let row = null;
      for (let i = 0; i < n; i++) {
        if (i % 10 === 0) { row = el('div.ver-row.ver-row10'); tray.appendChild(row); }
        row.appendChild(cookie(i % 10 === 4 ? ' ver-gap' : ''));
      }
    }
    function pairs(markOdd) {
      U.clear(tray);
      tray.className = 'ver-tray ver-pairs';
      const cols = Math.ceil(n / 2);
      const top = el('div.ver-row');
      const bot = el('div.ver-row');
      for (let i = 0; i < cols; i++) {
        top.appendChild(cookie(markOdd && n % 2 === 1 && i === cols - 1 ? ' ver-odd' : ''));
        if (i < Math.floor(n / 2)) bot.appendChild(cookie());
      }
      tray.append(top, el('div.ver-cut'), bot);
    }
    fives();
    return {
      node,
      fives,
      pairs,
      async share() {
        const h = Math.floor(n / 2);
        if (tray.classList.contains('ver-pairs')) fives();
        const all = Array.from(tray.querySelectorAll('.ver-cookie'));
        let a = 0;
        let b = 0;
        const step = n > 12 ? 90 : 150;
        for (let i = 0; i < h; i++) {
          if (!ctx.active) return;
          for (const which of [0, 1]) {
            const c = all.pop();
            if (c) c.classList.add('ver-gone');
            const target = which === 0 ? plateA : plateB;
            const k = which === 0 ? ++a : ++b;
            if ((k - 1) % 5 === 0) target.appendChild(el('div.ver-row'));
            target.lastChild.appendChild(el('span.ver-it.ver-cookie.ver-pop', '🍪'));
            (which === 0 ? ca : cb).textContent = String(k);
          }
          LT.sfx.play('tap');
          await ctx.sleep(step);
        }
        tray.querySelectorAll('.ver-gone').forEach((c) => c.remove());
        if (n % 2 === 1) {
          const left = tray.querySelector('.ver-cookie');
          if (left) left.classList.add('ver-odd');
        } else tray.classList.add('ver-empty');
      },
    };
  }

  /* ---------------- Stufe 1: selbst legen ---------------- */
  function buildStep(ctx, host, t, it, M) {
    return new Promise((resolve) => {
      let count = 0;
      let busy = false;
      let done = false;
      let sw = 0;
      const minus = el('button', { type: 'button', class: 'ver-btn ver-minus', 'aria-label': 'Eins weg' }, '➖');
      const basket = el('button', { type: 'button', class: 'ver-btn ver-basket', 'aria-label': 'Eins dazu' },
        el('span.ver-bk', '🧺'), el('span.ver-bkit', it.e));
      const wand = el('button', { type: 'button', class: 'ver-btn ver-wand', 'aria-label': 'Zaubern' },
        el('span', '🪄'), el('span.ver-wandlbl', 'Zaubern'));
      const bar = el('div.ver-controls', minus, basket, wand);
      host.appendChild(bar);
      const render = () => { M.setLeft(count); minus.disabled = count === 0; };
      render();
      const unhintAll = () => [minus, basket, wand].forEach((b) => ctx.unhint(b));
      ctx.listen(basket, 'click', () => {
        if (busy || done || !ctx.active || count >= 10) return;
        LT.sfx.play('pop');
        count++;
        render();
        if (sw >= 2) guide();
      });
      ctx.listen(minus, 'click', () => {
        if (busy || done || !ctx.active || count <= 0) return;
        LT.sfx.play('tap');
        count--;
        render();
        if (sw >= 2) guide();
      });
      ctx.listen(wand, 'click', () => check());
      function guide() {
        unhintAll();
        ctx.hint(count < t.n ? basket : count > t.n ? minus : wand);
      }
      async function check() {
        if (busy || done || !ctx.active) return;
        busy = true;
        if (count === 0) {
          ctx.hint(basket);
          await ctx.say('Tippe zuerst auf den Korb.');
          ctx.unhint(basket);
          busy = false;
          return;
        }
        if (count === t.n) {
          done = true;
          unhintAll();
          ctx.testSolve(null);
          [minus, basket, wand].forEach((b) => { b.disabled = true; });
          bar.classList.add('ver-locked');
          resolve(sw === 0);
          return;
        }
        sw++;
        const say = count > t.n
          ? `Schau mal: ${dasSind(count, it)} Wir brauchen ${acc(t.n, it)}. Mit dem Minus nimmst du eins weg.`
          : `Schau mal: ${dasSind(count, it, 'erst ')} Wir brauchen ${acc(t.n, it)}.`;
        await ctx.wrong(M.left, { say, keep: true });
        if (!ctx.active) return;
        if (sw === 2) {
          await ctx.say(t.n === 1
            ? 'Tipp: Tippe nur ein einziges Mal auf den Korb.'
            : `Tipp: Zähle mit, wenn du tippst. Bis ${w(t.n)}.`);
          if (!ctx.active) return;
          guide();
        } else if (sw >= 3) {
          ctx.modelShown = true;
          while (count !== t.n) {
            count += count < t.n ? 1 : -1;
            render();
            LT.sfx.play('tap');
            await ctx.sleep(260);
          }
          await ctx.say(`Schau, so stimmt es: ${dasSind(t.n, it)} Jetzt tippst du auf den Zauberstab.`);
          if (!ctx.active) return;
          guide();
        }
        busy = false;
      }
      ctx.testSolve(() => {
        if (done || busy) return;
        count = t.n;
        render();
        check();
      });
    });
  }

  /* ---------------- Verdoppeln (Stufe 1, 2, 5) ---------------- */
  function doubleTexts(ctx, t, M, eq, it) {
    const n = t.n;
    const r = n - 5;
    return {
      answer: t.R,
      prefer: [n + 2, n, t.R + 1, t.R - 1, t.R + 2],
      correctSay: () => {
        eq.fill(t.R);
        if (M.fogged()) M.reveal();
        const normal = `${okWord()}! ${W(n)} plus ${w(n)} ist ${w(t.R)}.`;
        if (n >= 6) {
          return proc(ctx, normal, [
            n === 10
              ? 'Super! Zehn und zehn sind zwanzig. Das kannst du dir gut merken.'
              : `Super! Mit der Fünf geht das schnell: Fünf und fünf sind zehn, dann noch ${w(r)} und ${w(r)}.`,
            `Klasse! Das Doppelte von ${w(n)} ist ${w(t.R)}. Das kannst du dir gut merken.`,
          ]);
        }
        return proc(ctx, normal, [
          `Klasse! ${W(n)} und noch einmal ${w(n)} sind ${w(t.R)}.`,
          `Super! Beide Seiten zusammen sind ${w(t.R)}.`,
        ]);
      },
      explain: (v) => {
        if (v === n + 2 && n !== 2) return 'Schau mal: Verdoppeln heißt nicht zwei dazu. Verdoppeln heißt: gleich viele noch einmal.';
        if (v === n) return 'Das ist nur eine Seite. Im Spiegel sind noch einmal genauso viele.';
        if (Math.abs(v - t.R) === 1) return 'Fast! Nur eins daneben. Beide Seiten haben gleich viele.';
        return `Schau noch einmal. Es sind ${v > t.R ? 'weniger' : 'mehr'} als ${w(v)}.`;
      },
      hintSay: () => {
        if (M.fogged()) M.reveal();
        if (n === 10) {
          M.glowFives(true);
          return 'Tipp: Auf jeder Seite sind zwei volle Fünferreihen. Das sind zehn. Zehn und noch einmal zehn.';
        }
        if (n >= 6) {
          M.glowFives(true);
          return `Tipp: Auf jeder Seite ist eine volle Fünferreihe. Fünf und fünf sind zehn. Und dann noch ${w(r)} und ${w(r)}.`;
        }
        return `Tipp: Zähle die ${it.pl} vor dem Spiegel. Dann zählst du im Spiegel weiter.`;
      },
      modelSay: () => {
        if (M.fogged()) M.reveal();
        if (n === 10) {
          M.glowFives(true);
          eq.help('<b>10 + 10</b> = 20');
          return 'Schau: Auf jeder Seite sind zehn. Zehn und zehn sind zwanzig.';
        }
        if (n >= 6) {
          M.glowFives(true);
          eq.help(`<b>5 + 5</b> = 10 &nbsp; <b>${r} + ${r}</b> = ${2 * r}`);
          return `Schau: Fünf und fünf sind zehn. ${W(r)} und ${w(r)} sind ${w(2 * r)}. Zehn und ${w(2 * r)} sind ${w(t.R)}.`;
        }
        return `Schau: ${W(n)} und noch einmal ${w(n)} sind ${w(t.R)}.`;
      },
    };
  }

  async function playDouble(ctx, t, cfg) {
    const it = thing();
    const n = t.n;
    const build = t.kind === 'build';
    const eq = equation([String(n), '+', String(n), '=', '?'], `${n} + ${n}`);
    const M = mirror(it);
    const work = el('div.ver-work');
    ctx.stage.appendChild(el('div.ver-main', eq.node, M.node, work));
    if (build) eq.node.classList.add('ver-hidden');
    else M.setLeft(n);
    if (t.direct) M.veil();

    if (!(await intro(ctx, cfg))) return;

    if (build) {
      await ctx.instruct(`Lege ${acc(n, it)} vor den Spiegel. Tippe auf den Korb. Dann zauberst du.`);
      if (!ctx.active) return;
      const firstTry = await buildStep(ctx, work, t, it, M);
      if (!ctx.active) return;
      U.clear(work);
      M.setRight(n);
      M.reveal();
      eq.node.classList.remove('ver-hidden');
      eq.node.classList.add('ver-pop');
      await ctx.sleep(500);
      if (!ctx.active) return;
      await ctx.instruct(firstTry
        ? `Simsalabim! ${W(n)} und noch einmal ${w(n)}. Wie viele sind es zusammen?`
        : `Simsalabim! Jetzt sind es ${w(n)} und noch einmal ${w(n)}. Wie viele sind es zusammen?`);
    } else if (t.direct) {
      M.setRight(n);
      await ctx.instruct(`Das Doppelte von ${w(n)}. ${W(n)} plus ${w(n)}. Wie viel ist das?`);
    } else {
      M.setRight(n);
      await ctx.sleep(350);
      if (!ctx.active) return;
      M.reveal();
      await ctx.instruct(`${W(n)} vor dem Spiegel. Und im Spiegel? Wie viele sind es zusammen?`);
    }
    if (!ctx.active) return;
    const tx = doubleTexts(ctx, t, M, eq, it);
    await numberChoice(ctx, work, { ...tx, count: answerCount(ctx, build ? 3 : 4) });
    if (!ctx.active) return;
    M.glowFives(false);
    if (ctx.wrongCount > 0 || build) {
      await ctx.say(`${W(n)} plus ${w(n)} ist ${w(t.R)}. Das Doppelte von ${w(n)} ist ${w(t.R)}.`);
      if (!ctx.active) return;
    }
    await ctx.sleep(450);
  }

  /* ---------------- Halbieren (Stufe 3, 5) ---------------- */
  async function playHalf(ctx, t, cfg) {
    const n = t.n;
    const h = t.h;
    const eq = equation(['?', '+', '?', '=', String(n)], `? + ? = ${n}`);
    const tbl = cookieTable(ctx, n);
    const work = el('div.ver-work');
    ctx.stage.appendChild(el('div.ver-main', eq.node, tbl.node, work));
    if (t.direct) tbl.node.classList.add('ver-dim');

    if (!(await intro(ctx, cfg))) return;
    await ctx.instruct(`${W(n)} Kekse. Flo und Eule teilen gerecht. Wie viele bekommt jeder?`);
    if (!ctx.active) return;
    let shared = false;
    const doShare = () => {
      if (shared) return;
      shared = true;
      tbl.node.classList.remove('ver-dim');
      tbl.share();
    };
    await numberChoice(ctx, work, {
      answer: h,
      count: answerCount(ctx, 4),
      prefer: [n - 2, h + 1, h - 1, n, h + 2],
      correctSay: () => {
        eq.fill(h);
        return proc(ctx, `${okWord()}! Die Hälfte von ${w(n)} ist ${w(h)}.`, [
          `Klasse! Die Verdopplung hilft beim Halbieren: ${w(h)} plus ${w(h)} ist ${w(n)}.`,
          `Super! ${W(h)} und ${w(h)} sind ${w(n)}. Das passt genau.`,
        ]);
      },
      explain: (v) => {
        if (v === n - 2) return 'Schau mal: Halbieren heißt nicht zwei weg. Halbieren heißt: zwei gleich große Teile.';
        if (v === n) return 'Dann hätte einer alle Kekse und der andere keinen. Das ist nicht gerecht.';
        if (v > n) return `So viele Kekse haben wir gar nicht. Es sind nur ${w(n)}.`;
        return `Dann bekommt jeder ${w(v)}. ${W(v)} und ${w(v)} sind ${w(2 * v)}. Wir haben aber ${w(n)} Kekse.`;
      },
      hintSay: () => {
        tbl.node.classList.remove('ver-dim');
        tbl.pairs(false);
        return `Tipp: Denk an den Zauberspiegel. Welche Zahl und noch einmal die gleiche Zahl sind ${w(n)}?`;
      },
      modelSay: () => {
        doShare();
        return `Schau: Immer einer für Flo, einer für Eule. Jeder bekommt ${w(h)}. ${W(h)} und ${w(h)} sind ${w(n)}.`;
      },
    });
    if (!ctx.active) return;
    if (!shared) {
      tbl.node.classList.remove('ver-dim');
      await tbl.share();
      if (!ctx.active) return;
    }
    if (ctx.wrongCount > 0 || ctx.index === 0) {
      await ctx.say(`Die Hälfte von ${w(n)} ist ${w(h)}. Denn ${w(h)} plus ${w(h)} ist ${w(n)}.`);
      if (!ctx.active) return;
    }
    await ctx.sleep(450);
  }

  /* ---------------- Fast-Verdopplung (Stufe 4, 5) ---------------- */
  async function playNear(ctx, t, cfg) {
    const { x, y, a } = t;
    const b = a + 1;
    const eq = equation([String(x), '+', String(y), '=', '?'], `${x} + ${y}`);
    const M = mirror({ e: '●' }, { clear: true });
    M.node.classList.add('ver-dots');
    M.setLeft(x, x > y ? x - 1 : -1);
    M.setRight(y, y > x ? y - 1 : -1);
    const work = el('div.ver-work');
    ctx.stage.appendChild(el('div.ver-main', eq.node, M.node, work));
    if (t.direct) M.veil();

    if (!(await intro(ctx, cfg))) return;
    const task = `${W(x)} plus ${w(y)}.`;
    let base = a; // gewählte Verdopplung
    if (!t.direct) {
      await ctx.instruct(`${task} Welche Verdopplung hilft dir?`);
      if (!ctx.active) return;
      const box = el('div.choices.ver-choices');
      work.appendChild(box);
      const cands = [a - 2, a + 3, a + 4, a - 3, a + 5].filter((v) => v >= 1 && v <= 10 && v !== a && v !== b);
      const wrongs = U.shuffle(cands.slice(0, 3)).slice(0, 2);
      const vals = [a, b, ...wrongs].sort((p, q) => p - q);
      const items = vals.map((v) => ({
        content: `${v} + ${v}`, text: true, correct: v === a || v === b, value: v,
        say: `${w(v)} plus ${w(v)}`, className: 'ver-dbl',
      }));
      const chosen = await ctx.choices(items, {
        container: box,
        shuffle: false,
        size: 'small',
        hintAfter: LT.z2 && LT.z2.hintAfterFor ? LT.z2.hintAfterFor(ctx, items.length) : 2,
        praise: false,
        correctSay: (item) => (item.value === a
          ? `${okWord()}! ${W(a)} plus ${w(a)} ist ganz nah dran.`
          : `${okWord()}! Auch ${w(b)} plus ${w(b)} ist ganz nah dran.`),
        explain: () => `Schau auf die Zahlen in der Aufgabe: ${w(x)} und ${w(y)}. Die Verdopplung soll ganz nah dran sein.`,
        hintSay: () => 'Tipp: Nimm eine Zahl aus der Aufgabe zweimal.',
        modelSay: () => `Schau: ${W(a)} plus ${w(a)}. Das ist fast wie ${w(x)} plus ${w(y)}.`,
      });
      if (!ctx.active) return;
      base = chosen.value;
      box.remove();
    }
    // Alle Hilfen folgen der gewählten Verdopplung: a + a und einer mehr,
    // oder b + b und einer weniger.
    const up = () => base === a;
    const showHelp = () => {
      if (M.fogged()) M.reveal();
      if (base === a) eq.help(`${x} + ${y} = <b>${a} + ${a}</b> + 1`);
      else eq.help(`${x} + ${y} = <b>${b} + ${b}</b> − 1`);
      M.node.classList.add('ver-showextra');
    };
    let q;
    if (t.direct) q = `${task} Wie viel ist das?`;
    else if (base === a) {
      showHelp();
      q = `${W(a)} plus ${w(a)} ist ${w(2 * a)}. Bei ${w(x)} plus ${w(y)} ist es einer mehr. Wie viel ist das?`;
    } else {
      showHelp();
      q = `${W(b)} plus ${w(b)} ist ${w(2 * b)}. Bei ${w(x)} plus ${w(y)} ist es einer weniger. Wie viel ist das?`;
    }
    await ctx.instruct(q);
    if (!ctx.active) return;
    await numberChoice(ctx, work, {
      answer: t.R,
      count: answerCount(ctx, 4),
      prefer: base === a ? [2 * a, 2 * a + 2, t.R + 1, 2 * b] : [2 * b, 2 * b - 2, t.R - 1, 2 * a],
      correctSay: () => {
        eq.fill(t.R);
        return proc(ctx, `${okWord()}! ${W(x)} plus ${w(y)} ist ${w(t.R)}.`, [
          'Super! Die Verdopplung ist ein guter Trick.',
          up() ? 'Klasse! Erst verdoppeln, dann einer mehr. So geht es schnell.'
            : 'Klasse! Erst verdoppeln, dann einer weniger. So geht es schnell.',
          'Toll! Mit dem Spiegel-Trick geht es ganz schnell.',
        ]);
      },
      explain: (v) => {
        if (v === 2 * a) return `Das ist ${w(a)} plus ${w(a)}. Aber ${w(b)} ist einer mehr als ${w(a)}.`;
        if (v === 2 * b) return `Das ist ${w(b)} plus ${w(b)}. Aber ${w(a)} ist einer weniger als ${w(b)}.`;
        if (Math.abs(v - t.R) === 1) return 'Fast! Nur eins daneben. Rechne mit der Verdopplung.';
        return `Schau noch einmal. Es sind ${v > t.R ? 'weniger' : 'mehr'} als ${w(v)}.`;
      },
      hintSay: () => {
        showHelp();
        return up()
          ? `Tipp: Rechne zuerst ${w(a)} plus ${w(a)}. Dann kommt noch der eine Extra-Punkt dazu.`
          : `Tipp: Rechne zuerst ${w(b)} plus ${w(b)}. Dann nimmst du einen weg.`;
      },
      modelSay: () => {
        showHelp();
        return up()
          ? `Schau: ${W(a)} plus ${w(a)} ist ${w(2 * a)}. Und einer mehr ist ${w(t.R)}.`
          : `Schau: ${W(b)} plus ${w(b)} ist ${w(2 * b)}. Und einer weniger ist ${w(t.R)}.`;
      },
    });
    if (!ctx.active) return;
    if (ctx.wrongCount > 0 || ctx.index === 0) {
      await ctx.say(up()
        ? `${W(a)} plus ${w(a)} ist ${w(2 * a)}. Einer mehr ist ${w(t.R)}. Also ist ${w(x)} plus ${w(y)} gleich ${w(t.R)}.`
        : `${W(b)} plus ${w(b)} ist ${w(2 * b)}. Einer weniger ist ${w(t.R)}. Also ist ${w(x)} plus ${w(y)} gleich ${w(t.R)}.`);
      if (!ctx.active) return;
    }
    await ctx.sleep(450);
  }

  /* ---------------- Geht das gerecht? (Stufe 5) ---------------- */
  async function playParity(ctx, t, cfg) {
    const n = t.n;
    const head = el('div.ver-eqbox', el('div.ver-eq', { role: 'img', 'aria-label': `${n} Kekse` },
      el('span.ver-n', String(n)), el('span.ver-op', '🍪'), el('span.ver-ask', 'gerecht?')));
    const tbl = cookieTable(ctx, n);
    const work = el('div.ver-work');
    ctx.stage.appendChild(el('div.ver-main', head, tbl.node, work));

    if (!(await intro(ctx, cfg))) return;
    await ctx.instruct(`${W(n)} Kekse für Flo und Eule. Geht das gerecht? Oder bleibt einer übrig?`);
    if (!ctx.active) return;
    const box = el('div.choices.ver-choices');
    work.appendChild(box);
    let paired = false;
    // Konkrete Bilder statt Symbolen: zwei Teller mit gleich vielen Keksen,
    // bzw. zwei Teller und ein Keks, der übrig bleibt.
    const plate = () => el('span.ver-pp-plate', el('span', '🍪'), el('span', '🍪'));
    const pic = (odd) => el('span.ver-parpic', { 'aria-hidden': 'true' },
      el('span.ver-pp-row', plate(), plate()),
      el('span', { class: 'ver-pp-extra' + (odd ? '' : ' ver-pp-none') }, '🍪'));
    const items = [
      { content: pic(false), label: 'gerecht', say: 'Geht gerecht.', correct: !t.odd, value: 'even', className: 'ver-par' },
      { content: pic(true), label: 'einer übrig', say: 'Einer bleibt übrig.', correct: t.odd, value: 'odd', className: 'ver-par' },
    ];
    await ctx.choices(items, {
      container: box,
      shuffle: false,
      size: 'small',
      sayButton: true,
      hintAfter: 1,
      praise: false,
      correctSay: () => proc(ctx, `${okWord()}!`, [
        'Klasse! Mit Paaren sieht man das gut.',
        t.odd ? 'Super! Ein Keks hat keinen Partner.' : 'Super! Jeder Keks hat einen Partner.',
      ]),
      explain: () => 'Schau mal genau hin. Wir legen immer einen Keks für Flo und einen für Eule.',
      onWrong: async () => {
        if (!paired) { paired = true; tbl.pairs(true); LT.sfx.play('flip'); }
        await ctx.sleep(300);
      },
      hintSay: () => 'Tipp: Hat jeder Keks oben einen Partner unten?',
    });
    if (!ctx.active) return;
    box.remove();
    await tbl.share();
    if (!ctx.active) return;
    if (t.odd) await ctx.say(`${W(n)} ist ungerade. Jeder bekommt ${w((n - 1) / 2)}, und einer bleibt übrig.`);
    else await ctx.say(`${W(n)} ist gerade. Jeder bekommt ${w(n / 2)}. Das ist gerecht.`);
    if (!ctx.active) return;
    await ctx.sleep(450);
  }

  /* ---------------- Hilfen ---------------- */
  function answerCount(ctx, base) {
    return base + (ctx.flow > 0 ? 1 : 0);
  }
  async function intro(ctx, cfg) {
    if (introduced.has(cfg.intro)) return ctx.active;
    introduced.add(cfg.intro);
    await ctx.say(INTRO[cfg.intro]);
    return ctx.active;
  }

  /* ------------------------------------------------------------------ */
  LT.registerGame({
    id: 'verdoppeln',
    area: 'mathe1',
    title: 'Zauberspiegel',
    icon: '🪞',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Flo hat einen Zauberspiegel gefunden. Komm, wir zaubern mit Zahlen!',
    parent: {
      skill: 'Verdoppeln und Halbieren bis 20, Fast-Verdopplungen, gerade und ungerade Zahlen',
      goal: 'Ihr Kind automatisiert die Verdopplungen bis 10 + 10 und nutzt sie als Rechentrick: Halbieren ist die Umkehrung (die Hälfte von 14 ist 7, weil 7 + 7 = 14), und Nachbaraufgaben wie 6 + 7 werden über 6 + 6 + 1 gelöst. Zum Schluss lernt es gerade und ungerade Zahlen kennen.',
      levels: [
        'Verdoppeln 1–5: selbst Dinge vor den Zauberspiegel legen, der Spiegel verdoppelt',
        'Verdoppeln 6–10 mit Fünferreihen (5 + 5 = 10, dann der Rest)',
        'Halbieren gerader Zahlen bis 20: Kekse gerecht für Flo und Eule',
        'Fast-Verdopplung: 6 + 7 = 6 + 6 + 1 (passende Verdopplung wählen)',
        'Gemischt im Kopf, dazu „Geht das gerecht?“: gerade und ungerade Zahlen',
      ],
      tip: 'Verdoppeln Sie im Alltag: zwei Hände mit je 4 Fingern, Eierkarton (6 und 6), Schuhe und Socken. Verwechselt Ihr Kind Verdoppeln mit „zwei dazu“, legen Sie beide Hälften nebeneinander: „Gleich viele noch einmal.“',
    },

    async task(ctx) {
      if (ctx.index === 0) introduced = new Set();
      const cfg = config(ctx);
      const t = ctx.item(POOL[cfg.pool], (x) => x.k, { avoid: 4 });
      ctx.stage.classList.add('ver-stage');
      if (t.kind === 'build' || t.kind === 'double') return playDouble(ctx, t, cfg);
      if (t.kind === 'half') return playHalf(ctx, t, cfg);
      if (t.kind === 'near') return playNear(ctx, t, cfg);
      return playParity(ctx, t, cfg);
    },
  });
})();
