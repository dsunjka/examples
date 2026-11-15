/* ==========================================================================
   Spiel „Über die Zehner-Brücke“ 🌉 (Rechenschule, Klasse 1)
   Zehnerübergang mit Zerlegen bis zur Zehn: 8 + 5 = 8 + 2 + 3,
   13 − 5 = 13 − 3 − 2. Zahlenstrahl 0–20 mit Brücke bei 10, Zwanzigerfeld.

   Didaktik:
   - Schritt 1 (Zerlegen): Der zweite Summand liegt als Punkte-Reihe da
     (Fünferbündel). Das Kind tippt so viele Punkte an, wie Flo bis zur
     Brücke braucht, und bestätigt mit ✓. Vorschau: Die angetippten Punkte
     wandern ins Zwanzigerfeld (Stufe 1–2) und als gestrichelter Bogen auf
     den Zahlenstrahl – das Kind kann selbst kontrollieren, ob die Zehn voll
     ist. Danach hüpft Flo bis zur Zehn.
   - Schritt 2 (Rest): „Von zehn noch drei weiter. Wo landet Flo?“
   - Stufen:
       1  9 + x  (immer nur 1 bis zur 10, Brücke aus der Vorschule)
       2  8 + x, 7 + x
       3  beliebig plus über die 10 (Ergebnis bis 18), ohne Zwanzigerfeld
       4  Minus über die 10: 13 − 5 = 13 − 3 − 2 (Flo dreht sich um)
       5  Plus und Minus gemischt, ohne Brückenhilfe; Zeitbonus ⚡ statt
          Zeitdruck. Die Brücke erscheint nur als Hilfe.
   - Fehlvorstellungen:
       • zählendes Rechnen mit ±1-Fehler → Zerlegungshilfe „Wie viele bis 10?“
       • alle Punkte auf einmal (nicht zerlegt) → „Erst nur bis zur Brücke“
       • Minus-Richtung verwechselt → „Minus heißt zurück“, Flo schaut nach links
   - Anpassung: flow < 0 → kleinere Zahlen / Zwanzigerfeld als Stütze;
     flow > 0 → schwerere Aufgaben, mehr Antworten.
   - Lerninhalte (ctx.item): '8 + 5', '13 - 5'.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const w = (n) => U.numberWord(n);
  const W = (n) => U.cap(w(n));
  const opWord = (op) => (op === '+' ? 'plus' : 'minus');
  const opSign = (op) => (op === '+' ? '+' : '−');
  const hopsW = (n) => (n === 1 ? 'einen Hüpfer' : `${w(n)} Hüpfer`);
  const dotsW = (n) => (n === 1 ? 'einen Punkt' : `${w(n)} Punkte`);

  /* ---------------- Aufgaben ---------------- */
  function plus(a, b) {
    const to = 10 - a;
    return { op: '+', a, b, to, rest: b - to, R: a + b, k: `${a} + ${b}` };
  }
  function minus(a, b) {
    const to = a - 10;
    return { op: '-', a, b, to, rest: b - to, R: a - b, k: `${a} - ${b}` };
  }
  function plusPool(as, bMin, bMax, maxR) {
    const out = [];
    as.forEach((a) => {
      for (let b = bMin; b <= bMax; b++) if (a + b > 10 && a + b <= maxR) out.push(plus(a, b));
    });
    return out;
  }
  function minusPool(aMin, aMax, bMax) {
    const out = [];
    for (let a = aMin; a <= aMax; a++) {
      for (let b = 2; b <= bMax; b++) if (a - b < 10 && a - b >= 1) out.push(minus(a, b));
    }
    return out;
  }
  const POOL = {
    '1': plusPool([9], 2, 9, 20),
    '1e': plusPool([9], 2, 5, 20),
    '2': plusPool([8, 7], 3, 9, 20),
    '2e': plusPool([8, 7], 3, 6, 20),
    '3': plusPool([3, 4, 5, 6, 7, 8, 9], 2, 9, 18).filter((t) => t.rest >= 1),
    '3e': plusPool([6, 7, 8, 9], 2, 7, 15),
    '3h': plusPool([3, 4, 5, 6], 5, 9, 18),
    '4': minusPool(11, 18, 9),
    '4e': minusPool(11, 14, 6),
  };
  POOL['5'] = POOL['3'].concat(POOL['4']);

  /** Aufgabenart je Aufgabe: Pool, Modus (Zerlegen oder direkt), Zwanzigerfeld. */
  function config(ctx) {
    let lv = ctx.taskLevel;
    const lvl = ctx.level;
    if (lvl === 3 && lv === 4) return { lv: 3, pool: '3h', mode: 'split', frame: false, n: 4 };
    if (lvl === 5 && lv < 5) return { lv: 5, pool: '5', mode: 'split', frame: false, n: 4 };
    if (lv === 5) return { lv, pool: '5', mode: 'direct', frame: false, n: ctx.flow > 0 ? 5 : 4 };
    let pool = String(lv);
    if (ctx.flow < 0 && POOL[lv + 'e']) pool = lv + 'e';
    const frame = lv <= 2 || ctx.flow < 0 || (lv === 4 && ctx.level === 4);
    return { lv, pool, mode: 'split', frame, n: lv === 1 ? 3 : 4 };
  }

  const INTRO = {
    1: 'Flo will über die Brücke bei zehn. Er hüpft zuerst genau bis zur Zehn. Dann hüpft er den Rest. Tippe so viele Punkte an, wie Flo bis zur Zehn braucht.',
    2: 'Jetzt startet Flo weiter vorne. Bis zur Brücke sind es mehr Hüpfer. Schau, wie viele Plätze bis zur Zehn noch frei sind.',
    3: 'Jetzt kann Flo überall starten. Das Zwanzigerfeld macht Pause. Überlege selbst: Wie viele Hüpfer sind es bis zur Zehn?',
    4: 'Jetzt kommt Minus! Minus heißt zurück. Flo dreht sich um. Er hüpft erst zurück bis zur Zehn und dann den Rest.',
    5: 'Jetzt bist du ein Brücken-Profi! Plus und Minus gemischt, ganz ohne Brücke. Rechne im Kopf: erst bis zur Zehn, dann den Rest. Wenn du flink bist, bekommst du einen Blitz.',
  };
  let introduced = new Set();
  let bolts = 0;

  const OK = ['Richtig', 'Genau', 'Super', 'Stimmt', 'Klasse'];
  const okWord = () => U.pickFresh('zbr-ok', OK, 3);

  const taskSay = (t) => `${W(t.a)} ${opWord(t.op)} ${w(t.b)}.`;
  const sentence = (t) => `${W(t.a)} ${opWord(t.op)} ${w(t.b)} ist ${w(t.R)}.`;
  const stepSay = (t) => (t.op === '+'
    ? `${W(t.a)} plus ${w(t.to)} ist zehn. Zehn plus ${w(t.rest)} ist ${w(t.R)}.`
    : `${W(t.a)} minus ${w(t.to)} ist zehn. Zehn minus ${w(t.rest)} ist ${w(t.R)}.`);

  function procPraise(t, direct) {
    if (direct) {
      return U.pickFresh('zbr-proc-d', [
        'Super! Du hast im Kopf erst bis zur Zehn gerechnet.',
        'Klasse! Ganz ohne Brücke, und trotzdem richtig. Du bist ein Brücken-Profi!',
        'Toll gedacht! Erst zur Zehn, dann der Rest.',
      ], 1);
    }
    if (t.op === '-') {
      return U.pickFresh('zbr-proc-m', [
        'Du bist erst zurück bis zur Zehn gehüpft. Sehr schlau!',
        'Klasse! Minus heißt zurück, und du hast an der Zehn Pause gemacht.',
      ], 1);
    }
    return U.pickFresh('zbr-proc-p', [
      'Du hast erst bis zur Zehn gerechnet. Sehr schlau!',
      'Super! Du hast die Zahl geschickt geteilt.',
      'Toll! Erst die Zehn voll machen, dann der Rest. So rechnen Profis.',
    ], 1);
  }

  /* ---------------- Antwortmöglichkeiten ---------------- */
  function options(n, count, prefer) {
    const set = new Set([n]);
    for (const p of prefer) {
      if (set.size >= count) break;
      if (p >= 0 && p <= 20) set.add(p);
    }
    for (const x of U.shuffle([n + 1, n - 1, n + 2, n - 2, n + 3])) {
      if (set.size >= count) break;
      if (x >= 0 && x <= 20) set.add(x);
    }
    let guard = 0;
    while (set.size < count && guard++ < 100) set.add(U.randInt(1, 20));
    return Array.from(set).sort((x, y) => x - y);
  }
  function prefer(t) {
    const near = U.shuffle([t.R - 1, t.R + 1]);
    if (t.op === '+') return [near[0], 10, near[1], t.R + 2];
    return [10 + t.rest, near[0], 10, near[1]];
  }

  /* ---------------- Gleichung ---------------- */
  function equation(t) {
    const slot = el('span.zbr-slot', '?');
    const main = el('div.zbr-eq', { role: 'img', 'aria-label': `${t.a} ${opSign(t.op)} ${t.b}` },
      el('span.zbr-n', String(t.a)), el('span.zbr-op', opSign(t.op)), el('span.zbr-n.zbr-b', String(t.b)),
      el('span.zbr-op', '='), slot);
    const steps = el('div.zbr-steps.zbr-hidden', { 'aria-hidden': 'true' },
      el('span', String(t.a)), el('span.zbr-op', opSign(t.op)), el('span.zbr-to', String(t.to)),
      el('span.zbr-op', opSign(t.op)), el('span.zbr-rest', String(t.rest)));
    const bolt = el('span.zbr-bolt.zbr-hidden', { 'aria-hidden': 'true' });
    const node = el('div.zbr-eqbox', main, steps, bolt);
    return {
      node,
      showSteps() { steps.classList.remove('zbr-hidden'); steps.classList.add('zbr-pop'); },
      fill(v) { slot.textContent = String(v); slot.classList.add('zbr-done'); },
      bolts(n) {
        bolt.textContent = '⚡'.repeat(Math.min(n, 6));
        bolt.classList.toggle('zbr-hidden', n <= 0);
      },
    };
  }

  /* ---------------- Zahlenstrahl mit Brücke ---------------- */
  function numberLine(ctx, t) {
    const pos = (i) => `${(i / 20) * 100}%`;
    const track = el('div.zbr-track');
    for (let i = 0; i <= 20; i++) {
      const tk = el('span', { class: 'zbr-tick' + (i === 10 ? ' zbr-ten' : i % 5 === 0 ? ' zbr-five' : '') });
      tk.style.left = pos(i);
      const lb = el('span', { class: 'zbr-lbl' + (i === 10 ? ' zbr-lbl-ten' : '') }, String(i));
      lb.style.left = pos(i);
      track.append(tk, lb);
    }
    const bridge = el('span.zbr-bridge', { 'aria-hidden': 'true' }, '🌉');
    bridge.style.left = pos(10);
    track.appendChild(bridge);
    const flo = el('span.zbr-flo' + (t.op === '-' ? '.zbr-back' : ''), { html: LT.ui.floSVG() });
    const dir = el('span.zbr-dir', t.op === '-' ? '◀' : '▶');
    flo.appendChild(dir);
    flo.style.left = pos(t.a);
    track.appendChild(flo);
    const node = el('div.zbr-linebox', { 'aria-hidden': 'true' }, track);
    let ghost = null;
    let at = t.a;

    function arc(from, to, cls, label) {
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      const a = el('span', { class: 'zbr-arc ' + cls });
      a.style.left = pos(lo);
      a.style.width = `${((hi - lo) / 20) * 100}%`;
      if (label) a.appendChild(el('span.zbr-arclbl', label));
      track.appendChild(a);
      return a;
    }
    return {
      node,
      preview(n) {
        if (ghost) ghost.remove();
        ghost = null;
        if (n <= 0) return;
        const end = t.op === '+' ? Math.min(20, t.a + n) : Math.max(0, t.a - n);
        ghost = arc(t.a, end, 'zbr-ghost', (t.op === '+' ? '+' : '−') + n);
      },
      clearPreview() { if (ghost) ghost.remove(); ghost = null; },
      arc,
      glowTen(on) { node.classList.toggle('zbr-tenglow', on); },
      async hopTo(target, cls, label) {
        const from = at;
        const step = target > at ? 1 : -1;
        while (at !== target) {
          at += step;
          flo.style.left = pos(at);
          flo.classList.remove('zbr-jump');
          void flo.offsetWidth;
          flo.classList.add('zbr-jump');
          LT.sfx.play('tap');
          await ctx.sleep(300);
        }
        if (from !== target) arc(from, target, cls, label);
      },
    };
  }

  /* ---------------- Zwanzigerfeld ---------------- */
  function frame(t) {
    const cells = [];
    const halves = [el('div.zbr-half'), el('div.zbr-half')];
    for (let i = 0; i < 20; i++) {
      const c = el('i.zbr-cell');
      cells.push(c);
      halves[i < 10 ? 0 : 1].appendChild(c);
    }
    const node = el('div.zbr-frame', { 'aria-hidden': 'true' }, ...halves);
    const base = () => {
      cells.forEach((c, i) => { c.className = 'zbr-cell' + (i < t.a ? ' zbr-a' : ''); });
    };
    base();
    return {
      node,
      cells,
      preview(n, cls = 'zbr-p') {
        base();
        if (t.op === '+') {
          for (let i = t.a; i < Math.min(20, t.a + n); i++) cells[i].classList.add(cls);
        } else {
          for (let i = t.a - 1; i >= Math.max(0, t.a - n); i--) cells[i].classList.add('zbr-x');
        }
      },
      solved(stage) {
        base();
        if (t.op === '+') {
          for (let i = t.a; i < 10; i++) cells[i].classList.add('zbr-to');
          if (stage >= 2) for (let i = 10; i < t.R; i++) cells[i].classList.add('zbr-r');
        } else {
          for (let i = 10; i < t.a; i++) cells[i].classList.add('zbr-x');
          if (stage >= 2) for (let i = t.R; i < 10; i++) cells[i].classList.add('zbr-x', 'zbr-xr');
        }
      },
      glowFree(on) {
        cells.forEach((c, i) => {
          const target = t.op === '+' ? (i >= t.a && i < 10) : (i >= 10 && i < t.a);
          c.classList.toggle('zbr-glow', on && target);
        });
      },
    };
  }

  /* ---------------- Schritt 1: Zerlegen (eigene Bedienung) ---------------- */
  function splitStep(ctx, host, t, ui) {
    return new Promise((resolve) => {
      let sel = 0;
      let busy = false;
      let done = false;
      let sw = 0;
      const dots = [];
      const rows = el('div.zbr-dots');
      let row = null;
      for (let i = 0; i < t.b; i++) {
        if (i % 5 === 0) { row = el('div.zbr-dotrow'); rows.appendChild(row); }
        const d = el('button', { type: 'button', class: 'zbr-dot', 'aria-label': `${i + 1}` });
        ctx.listen(d, 'click', () => tap(i));
        dots.push(d);
        row.appendChild(d);
      }
      const okBtn = el('button', { type: 'button', class: 'zbr-okbtn', 'aria-label': 'Fertig' }, '✓');
      ctx.listen(okBtn, 'click', () => check());
      const head = el('div.zbr-trayhead', el('span.zbr-traynum', String(t.b)),
        el('span.zbr-trayhint', t.op === '+' ? 'bis zur 10?' : 'zurück bis 10?'));
      const tray = el('div.zbr-tray', head, el('div.zbr-traybody', rows, okBtn));
      host.appendChild(tray);

      const render = () => {
        dots.forEach((d, i) => d.classList.toggle('zbr-sel', i < sel));
        ui.preview(sel);
      };
      function tap(i) {
        if (busy || done || !ctx.active) return;
        LT.sfx.play('tap');
        sel = sel === i + 1 ? i : i + 1;
        render();
      }
      const unhintAll = () => { dots.forEach((d) => ctx.unhint(d)); ctx.unhint(okBtn); };
      let modeled = false;
      function showNext() {
        unhintAll();
        if (sel === t.to) ctx.hint(okBtn);
        else if (sel < t.to) ctx.hint(dots[t.to - 1]);
        else ctx.hint(dots[t.to - 1]);
      }

      function explain(v) {
        if (t.op === '+') {
          if (v === t.b) return `Das sind alle ${w(t.b)}. Flo hüpft erst nur bis zur Brücke. Wie viele fehlen bis zur Zehn?`;
          if (v < t.to) return 'Fast! Dann ist Flo noch nicht auf der Brücke. Die Zehn ist noch nicht voll.';
          return 'Fast! Dann ist Flo schon über die Brücke gehüpft. Wir wollen genau bis zur Zehn.';
        }
        if (v === t.b) return `Das sind alle ${w(t.b)}. Flo hüpft erst nur zurück bis zur Brücke. Wie viele sind es bis zur Zehn?`;
        if (v < t.to) return 'Fast! Dann ist Flo noch nicht an der Brücke. Er muss weiter zurück bis zur Zehn.';
        return 'Fast! Dann ist Flo schon unter die Zehn gehüpft. Wir wollen genau bis zur Zehn.';
      }
      function hintSay() {
        if (t.op === '+') return `Tipp: Schau aufs Zwanzigerfeld. Wie viele Plätze sind bis zur Zehn noch frei? Von ${w(t.a)} bis zehn.`;
        return `Tipp: Schau aufs Zwanzigerfeld. Wie viele Plättchen liegen rechts nach der Zehn? Von ${w(t.a)} zurück bis zehn.`;
      }
      function modelSay() {
        if (t.op === '+') return `Schau: Von ${w(t.a)} bis zehn sind es ${hopsW(t.to)}. Tippe ${dotsW(t.to)} an. Dann tippst du auf den Haken.`;
        return `Schau: Von ${w(t.a)} zurück bis zehn sind es ${hopsW(t.to)}. Tippe ${dotsW(t.to)} an. Dann tippst du auf den Haken.`;
      }

      async function check() {
        if (busy || done || !ctx.active) return;
        if (sel === 0) {
          busy = true;
          ctx.hint(dots[0]);
          await ctx.say('Tippe zuerst Punkte an. Dann tippst du auf den Haken.');
          ctx.unhint(dots[0]);
          busy = false;
          return;
        }
        busy = true;
        if (sel === t.to) {
          done = true;
          unhintAll();
          ctx.testSolve(null);
          tray.classList.add('zbr-split');
          dots.forEach((d, i) => { d.classList.toggle('zbr-restdot', i >= t.to); d.disabled = true; });
          okBtn.disabled = true;
          resolve(sw === 0);
          return;
        }
        sw++;
        await ctx.wrong(tray, { say: explain(sel), keep: true });
        if (!ctx.active) return;
        sel = 0;
        render();
        if (sw === 2) {
          ui.showHelp();
          await ctx.say(hintSay());
        } else if (sw >= 3) {
          if (sw === 3) {
            ctx.modelShown = true;
            ui.showHelp();
            await ctx.say(modelSay());
          } else {
            await ctx.say(`Tippe ${dotsW(t.to)} an.`);
          }
          if (!ctx.active) return;
          modeled = true;
          showNext();
        }
        busy = false;
      }
      ctx.listen(tray, 'click', () => { if (modeled && !done) ctx.timeout(showNext, 10); });

      ctx.testSolve(() => {
        if (done || busy) return;
        sel = t.to;
        render();
        check();
      });
    });
  }

  /* ---------------- Antwortkacheln ---------------- */
  async function answerStep(ctx, host, opts) {
    const box = el('div.choices.zbr-choices');
    host.appendChild(box);
    const values = options(opts.answer, opts.count, opts.prefer);
    const items = values.map((k) => ({ content: String(k), text: true, correct: k === opts.answer, say: w(k), value: k, className: 'zbr-num' }));
    const ha = LT.z2 && LT.z2.hintAfterFor ? LT.z2.hintAfterFor(ctx, items.length) : (items.length <= 3 ? 1 : 2);
    let n = 0;
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
      onWrong: async () => {
        n++;
        if (opts.onWrong) await opts.onWrong(n, ha);
      },
    });
    box.remove();
  }

  /* ------------------------------------------------------------------ */
  LT.registerGame({
    id: 'zehnerbruecke',
    area: 'mathe1',
    title: 'Über die Zehner-Brücke',
    icon: '🌉',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Flo will über die Zehner-Brücke hüpfen. Hilf ihm dabei!',
    parent: {
      skill: 'Zehnerübergang: Plus und Minus über die 10 bis 20',
      goal: 'Ihr Kind rechnet Aufgaben wie 8 + 5 oder 13 − 5 schrittweise: erst bis zur 10, dann der Rest (8 + 2 + 3, 13 − 3 − 2). Das ersetzt fehleranfälliges Weiterzählen in Einerschritten – eine Kernkompetenz der 1. Klasse.',
      levels: [
        '9 + x: nur 1 bis zur 10, mit Zwanzigerfeld und Zahlenstrahl',
        '8 + x und 7 + x: wie viele fehlen bis zur 10?',
        'Beliebige Plusaufgaben über die 10, ohne Zwanzigerfeld',
        'Minus über die 10: 13 − 5 = 13 − 3 − 2 (rückwärts hüpfen)',
        'Plus und Minus gemischt im Kopf, Brücke nur als Hilfe, Blitz-Bonus fürs flotte Rechnen',
      ],
      tip: 'Fragen Sie beim Rechnen immer zuerst: „Wie viele fehlen bis zur 10?“ Die Zerlegungen der 10 (8 und 2, 7 und 3 …) sind das Fundament – üben Sie sie ruhig mit den Fingern. Zählt Ihr Kind in Einerschritten, liegt es oft genau eins daneben.',
    },

    async task(ctx) {
      if (ctx.index === 0) { introduced = new Set(); bolts = 0; }
      const cfg = config(ctx);
      const t = ctx.item(POOL[cfg.pool], (x) => x.k, { avoid: 5 });
      const direct = cfg.mode === 'direct';

      ctx.stage.classList.add('zbr-stage');
      const eq = equation(t);
      eq.bolts(bolts);
      const line = numberLine(ctx, t);
      const fr = frame(t);
      const work = el('div.zbr-work');
      const main = el('div.zbr-main', eq.node, line.node, fr.node, work);
      ctx.stage.appendChild(main);
      if (!cfg.frame) fr.node.classList.add('zbr-hidden');
      if (direct) line.node.classList.add('zbr-hidden');

      if (!introduced.has(cfg.lv)) {
        introduced.add(cfg.lv);
        await ctx.say(INTRO[cfg.lv]);
        if (!ctx.active) return;
      }

      /* ================= Stufe 5: direkt im Kopf ================= */
      if (direct) {
        await ctx.instruct(`${taskSay(t)} Wie viel ist das?`);
        if (!ctx.active) return;
        const startT = Date.now();
        let helpShown = false;
        const showLine = () => {
          if (helpShown) return;
          helpShown = true;
          line.node.classList.remove('zbr-hidden');
          line.node.classList.add('zbr-pop');
          line.glowTen(true);
        };
        await answerStep(ctx, work, {
          answer: t.R,
          count: cfg.n,
          prefer: prefer(t),
          correctSay: () => {
            eq.fill(t.R);
            const fast = ctx.wrongCount === 0 && Date.now() - startT < 12000;
            if (fast) {
              bolts++;
              eq.bolts(bolts);
              return `${okWord()}! ${sentence(t)} Blitzschnell! Du bekommst einen Blitz.`;
            }
            if (ctx.wrongCount === 0 && U.chance(0.3)) return procPraise(t, true);
            return `${okWord()}! ${sentence(t)}`;
          },
          explain: (v) => {
            showLine();
            if (Math.abs(v - t.R) === 1) return 'Fast! Nur eins daneben. Nicht zählen, sondern erst bis zur Zehn rechnen. Wie viele fehlen bis zur Zehn?';
            if (v === 10) return t.op === '+' ? 'Zehn ist die Brücke. Flo muss noch weiter hüpfen.' : 'Zehn ist die Brücke. Flo muss noch weiter zurück.';
            if (t.op === '-' && v === 10 + t.rest) return 'Schau mal: Minus heißt zurück. Flo hüpft zu den kleineren Zahlen.';
            if (t.op === '+' && v < t.a) return 'Schau aufs Zeichen: Plus heißt dazu. Dann werden es mehr.';
            return `Fast! Es sind ${v > t.R ? 'weniger' : 'mehr'} als ${w(v)}. Wie viele fehlen bis zur Zehn?`;
          },
          hintSay: () => {
            showLine();
            eq.showSteps();
            return `Tipp: Teile die ${w(t.b)}. Erst ${w(t.to)} bis zur Zehn. Dann noch ${w(t.rest)}.`;
          },
          modelSay: () => {
            showLine();
            eq.showSteps();
            line.arc(t.a, 10, 'zbr-arc-to', opSign(t.op) + t.to);
            line.arc(10, t.R, 'zbr-arc-rest', opSign(t.op) + t.rest);
            return `Schau: ${stepSay(t)}`;
          },
        });
        if (!ctx.active) return;
        if (helpShown) {
          await ctx.say(`Erst bis zur Zehn, dann der Rest. ${stepSay(t)}`);
          if (!ctx.active) return;
        }
        await ctx.sleep(500);
        return;
      }

      /* ================= Schritt 1: Zerlegen ================= */
      const first = t.op === '+'
        ? `${taskSay(t)} Wie viele Hüpfer sind es bis zur Zehn? Tippe so viele Punkte an.`
        : `${taskSay(t)} Flo hüpft zurück. Wie viele Hüpfer sind es bis zur Zehn? Tippe so viele Punkte an.`;
      await ctx.instruct(first);
      if (!ctx.active) return;
      const firstSplit = await splitStep(ctx, work, t, {
        preview: (n) => { fr.preview(n); line.preview(n); },
        showHelp: () => {
          fr.node.classList.remove('zbr-hidden');
          fr.glowFree(true);
          line.glowTen(true);
        },
      });
      if (!ctx.active) return;
      fr.glowFree(false);
      line.clearPreview();
      fr.solved(1);
      eq.showSteps();
      await ctx.correct(work.querySelector('.zbr-tray'), {
        say: firstSplit
          ? `${okWord()}! ${U.cap(hopsW(t.to))} bis zur Zehn.`
          : `${okWord()}! ${U.cap(hopsW(t.to))} bis zur Zehn. Dann bleiben noch ${w(t.rest)}.`,
        praise: false,
      });
      if (!ctx.active) return;
      await line.hopTo(10, 'zbr-arc-to', opSign(t.op) + t.to);
      if (!ctx.active) return;
      line.glowTen(true);
      LT.sfx.play('pop');
      U.clear(work);

      /* ================= Schritt 2: Rest ================= */
      const q = t.op === '+'
        ? `Flo ist auf der Brücke! Es fehlen noch ${hopsW(t.rest)}. Zehn plus ${w(t.rest)}. Wo landet Flo?`
        : `Flo ist auf der Brücke! Noch ${hopsW(t.rest)} zurück. Zehn minus ${w(t.rest)}. Wo landet Flo?`;
      await ctx.instruct(q);
      if (!ctx.active) return;
      await answerStep(ctx, work, {
        answer: t.R,
        count: cfg.n,
        prefer: prefer(t),
        correctSay: () => {
          eq.fill(t.R);
          if (ctx.wrongCount === 0 && U.chance(0.3)) return procPraise(t, false);
          return `${okWord()}! ${sentence(t)}`;
        },
        explain: (v) => {
          if (t.op === '+') {
            if (v === 10) return `Flo steht erst auf der Brücke. Er hüpft noch ${w(t.rest)} weiter.`;
            if (Math.abs(v - t.R) === 1) return `Fast! Hüpfe von der Zehn genau ${hopsW(t.rest)} weiter. Nicht mehr und nicht weniger.`;
            return `Fast! Es sind ${v > t.R ? 'weniger' : 'mehr'} als ${w(v)}.`;
          }
          if (v === 10 + t.rest) return 'Schau mal: Minus heißt zurück. Flo hüpft nach links, zu den kleineren Zahlen.';
          if (v === 10) return `Flo steht erst auf der Brücke. Er hüpft noch ${w(t.rest)} zurück.`;
          if (Math.abs(v - t.R) === 1) return `Fast! Hüpfe von der Zehn genau ${hopsW(t.rest)} zurück. Nicht mehr und nicht weniger.`;
          return `Fast! Es sind ${v > t.R ? 'weniger' : 'mehr'} als ${w(v)}.`;
        },
        hintSay: () => {
          fr.node.classList.remove('zbr-hidden');
          fr.solved(1);
          if (t.op === '+') return `Tipp: Ein voller Zehner und noch ${w(t.rest)} Einer. Welche Zahl ist das?`;
          return `Tipp: Zähle von zehn ${w(t.rest)} Schritte zurück.`;
        },
        modelSay: () => {
          fr.node.classList.remove('zbr-hidden');
          fr.solved(2);
          return `Schau: Zehn ${opWord(t.op)} ${w(t.rest)} ist ${w(t.R)}. Tippe die ${w(t.R)} an.`;
        },
      });
      if (!ctx.active) return;
      fr.solved(2);
      line.glowTen(false);
      await line.hopTo(t.R, 'zbr-arc-rest', opSign(t.op) + t.rest);
      if (!ctx.active) return;
      if (ctx.wrongCount > 0 || ctx.index === 0) {
        await ctx.say(`${sentence(t)} Erst bis zur Zehn, dann der Rest.`);
        if (!ctx.active) return;
      }
      await ctx.sleep(450);
    },
  });
})();
