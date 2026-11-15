/* ==========================================================================
   Spiel „Zahlenmauer“ 🧱 (Rechenschule, Klasse 1) – Präfix .zm-
   Zahlenmauern, Rechendreiecke und schöne Päckchen (Muster & Strukturen).

   Didaktik:
   - Regel der Zahlenmauer: Jeder Stein ist so viel wie die zwei Steine
     direkt darunter zusammen (Tragsteine). Rechendreieck: Außen steht die
     Summe der zwei inneren Zahlen an dieser Seite.
   - Bedienung für Tablet + Stimme: Ein leerer Stein leuchtet mit „?“, das
     Kind tippt den passenden Zahlenstein an, er fliegt in die Mauer.
     Bekannte Steine kann man antippen, dann liest Flo die Zahl vor.
   - Stufen:
       1  3er-Mauer bis 10, unten alles gegeben (Brücke aus der Vorschule)
       2  3er-Mauer bis 20 (Zehnerübergang in den Steinen)
       3  Lücke unten: ein Tragstein fehlt → Ergänzen / Minus
       4  Rechendreieck (innen gegeben → außen addieren; später fehlt innen
          eine Zahl → Minus)
       5  Profi-Knobeln (Ende Klasse 1): „Was passiert, wenn ein Stein um eins
          größer wird?“, Mauer von oben nach unten, 4er-Mauer,
          schöne Päckchen fortsetzen und die Störaufgabe finden (B2).
   - Fehlvorstellungen und Hilfe-Leiter:
       • nebeneinander statt untereinander addieren → Ablenker = Summe des
         falschen Paares; Erklärung „Ein Stein steht auf den zwei Steinen
         direkt darunter“
       • beim Rückwärtsrechnen addieren statt ergänzen → Ablenker oben+Nachbar
       • ±1 beim Zählen
     1. Fehler: Erklärung; 2. Fehler: die zwei Tragsteine leuchten auf +
     Strategie-Tipp; 3. Fehler: Flo rechnet es vor.
   - Lerninhalte (ctx.item): 'Mauer 2 3 4', 'Mauer 3 ? 4', 'Dreieck 2 5 3',
     'Stein +1 Mitte', 'Päckchen 5 + 1', 'Störaufgabe 6 + 4' …
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

  const OK = ['Richtig', 'Genau', 'Super', 'Stimmt', 'Klasse', 'Prima'];
  const okWord = () => U.pickFresh('zm-ok', OK, 3);

  /* ==================================================================
     Pools
     ================================================================== */
  function triples(lo, hi, test) {
    const out = [];
    for (let a = lo; a <= hi; a++) for (let b = lo; b <= hi; b++) for (let c = lo; c <= hi; c++) {
      if (test(a, b, c)) out.push([a, b, c]);
    }
    return out;
  }
  const top3 = (a, b, c) => a + 2 * b + c;
  const POOL1 = triples(1, 5, (a, b, c) => top3(a, b, c) <= 10 && top3(a, b, c) >= 6)
    .map((base) => ({ base, k: 'Mauer ' + base.join(' ') }));
  const POOL1E = triples(1, 3, (a, b, c) => top3(a, b, c) <= 7)
    .map((base) => ({ base, k: 'Mauer ' + base.join(' ') }));
  const POOL2 = triples(1, 9, (a, b, c) => top3(a, b, c) >= 11 && top3(a, b, c) <= 20 && (a + b > 10 || b + c > 10 || top3(a, b, c) >= 14))
    .map((base) => ({ base, k: 'Mauer ' + base.join(' ') }));
  const POOL2E = triples(1, 6, (a, b, c) => top3(a, b, c) >= 10 && top3(a, b, c) <= 15)
    .map((base) => ({ base, k: 'Mauer ' + base.join(' ') }));
  const POOL3 = [];
  triples(1, 8, (a, b, c) => top3(a, b, c) >= 8 && top3(a, b, c) <= 20).forEach((base) => {
    [0, 1, 2].forEach((u) => {
      const k = 'Mauer ' + base.map((v, i) => (i === u ? '?' : v)).join(' ');
      // u=1: das Mittelfeld darüber kann links oder rechts stehen
      const m = u === 0 ? 0 : u === 2 ? 1 : (base[0] + base[1] <= base[1] + base[2] ? 0 : 1);
      POOL3.push({ base, u, m, k });
    });
  });
  // leichter (flow<0): kleine Tragsteine, oben höchstens 12
  const POOL3E = POOL3.filter((x) => Math.max.apply(null, x.base) <= 5 && top3(x.base[0], x.base[1], x.base[2]) <= 12);
  const POOLTD = [];
  triples(1, 8, (a, b, c) => top3(a, b, c) >= 12 && top3(a, b, c) <= 20).forEach((base) => {
    POOLTD.push({ base, side: U.chance(0.5) ? 0 : 1, k: 'von oben ' + base.join(' ') });
  });
  const POOL4M = [];
  for (let a = 1; a <= 4; a++) for (let b = 1; b <= 4; b++) for (let c = 1; c <= 4; c++) for (let d = 1; d <= 4; d++) {
    const t = a + 3 * b + 3 * c + d;
    if (t >= 12 && t <= 20) POOL4M.push({ base: [a, b, c, d], k: 'Riesenmauer ' + [a, b, c, d].join(' ') });
  }
  const POOLTRI = triples(1, 9, (a, b, c) => a + b <= 18 && a + b + c >= 9 && a !== b && b !== c)
    .map((inner) => ({ inner, k: 'Dreieck ' + inner.join(' ') }));
  const POOLTRI_E = triples(1, 6, (a, b, c) => a + b <= 10 && a + c <= 10 && b + c <= 10)
    .map((inner) => ({ inner, k: 'Dreieck ' + inner.join(' ') }));
  const POOLPLUS1 = [
    { p: 0, k: 'Stein +1 links' },
    { p: 1, k: 'Stein +1 Mitte' },
    { p: 2, k: 'Stein +1 rechts' },
  ];

  /* ---------- schöne Päckchen ---------- */
  function patterns() {
    const out = [];
    const add = (x0, op, y0, dx, dy, type) => {
      for (let i = 0; i < 4; i++) {
        const x = x0 + i * dx;
        const y = y0 + i * dy;
        const r = op === '+' ? x + y : x - y;
        if (x < 1 || y < 1 || r < 0 || r > 20) return;
      }
      out.push({ x0, op, y0, dx, dy, type, k: `Päckchen ${x0} ${op === '+' ? '+' : '-'} ${y0}` });
    };
    for (let x = 2; x <= 9; x++) for (let y = 1; y <= 4; y++) add(x, '+', y, 0, 1, 'A');
    for (let x = 2; x <= 6; x++) for (let y = 2; y <= 8; y++) add(x, '+', y, 1, 0, 'B');
    for (let s = 8; s <= 15; s++) for (let x = 2; x <= 6; x++) add(x, '+', s - x, 1, -1, 'C');
    for (let x = 10; x <= 15; x++) for (let y = 1; y <= 3; y++) add(x, '-', y, 0, 1, 'D');
    for (let x = 11; x <= 15; x++) for (let y = 1; y <= 3; y++) add(x, '-', y, 1, 1, 'E');
    for (let x = 1; x <= 4; x++) for (let y = 3; y <= 6; y++) add(x, '+', y, 2, 0, 'F');
    return out;
  }
  const PATTERNS = patterns();
  const rowOf = (pt, i) => {
    const x = pt.x0 + i * pt.dx;
    const y = pt.y0 + i * pt.dy;
    return { x, y, op: pt.op, r: pt.op === '+' ? x + y : x - y };
  };
  const rowText = (r, withResult) => `${r.x} ${opSign(r.op)} ${r.y}` + (withResult ? ` = ${r.r}` : '');
  const rowSay = (r) => `${W(r.x)} ${opWord(r.op)} ${w(r.y)}`;
  const rowSent = (r) => `${rowSay(r)} ist ${w(r.r)}.`;
  function change(d) {
    if (d === 0) return 'bleibt immer gleich';
    return `wird immer um ${w(Math.abs(d))} ${d > 0 ? 'größer' : 'kleiner'}`;
  }
  const patternSay = (pt) => `Die erste Zahl ${change(pt.dx)}. Die zweite Zahl ${change(pt.dy)}.`;
  const resultDelta = (pt) => (pt.op === '+' ? pt.dx + pt.dy : pt.dx - pt.dy);

  /* ==================================================================
     Modell: Felder mit Rechen-Beziehungen (sum = a + b)
     ================================================================== */
  function wallModel(base) {
    const n = base.length;
    const vals = {};
    const rels = [];
    const order = [];
    base.forEach((v, i) => { vals['0-' + i] = v; });
    for (let r = 0; r < n; r++) {
      for (let i = 0; i < n - r; i++) {
        const id = r + '-' + i;
        order.push(id);
        if (r > 0) {
          const a = (r - 1) + '-' + i;
          const b = (r - 1) + '-' + (i + 1);
          vals[id] = vals[a] + vals[b];
          rels.push({ s: id, a, b });
        }
      }
    }
    return { n, vals, rels, order, top: (n - 1) + '-0' };
  }
  function triModel(inner) {
    const vals = { i0: inner[0], i1: inner[1], i2: inner[2] };
    vals.oL = vals.i0 + vals.i1;
    vals.oR = vals.i0 + vals.i2;
    vals.oB = vals.i1 + vals.i2;
    return {
      vals,
      rels: [{ s: 'oL', a: 'i0', b: 'i1' }, { s: 'oR', a: 'i0', b: 'i2' }, { s: 'oB', a: 'i1', b: 'i2' }],
      order: ['i0', 'i1', 'i2', 'oL', 'oR', 'oB'],
    };
  }
  /** Nächster lösbarer Schritt (Reihenfolge von unten nach oben). */
  function nextStep(model, known) {
    for (const id of model.order) {
      if (known.has(id)) continue;
      for (const r of model.rels) {
        if (r.s === id && known.has(r.a) && known.has(r.b)) return { id, op: '+', x: r.a, y: r.b, rel: r };
      }
      for (const r of model.rels) {
        if (!known.has(r.s)) continue;
        if (r.a === id && known.has(r.b)) return { id, op: '-', x: r.s, y: r.b, rel: r };
        if (r.b === id && known.has(r.a)) return { id, op: '-', x: r.s, y: r.a, rel: r };
      }
    }
    return null;
  }
  /** Typische Fehlzahlen für einen Schritt. */
  function misValues(model, known, st) {
    const v = model.vals;
    const R = v[st.id];
    const out = [];
    if (st.op === '-') {
      out.push(v[st.x] + v[st.y]); // addiert statt ergänzt
    } else {
      // nebeneinander statt untereinander: andere bekannte Paare
      model.rels.forEach((r) => {
        if (r === st.rel) return;
        [[r.a, r.b], [r.s, r.a], [r.s, r.b]].forEach(([p, q]) => {
          if (known.has(p) && known.has(q) && (p === st.x || p === st.y || q === st.x || q === st.y)) {
            const s = v[p] + v[q];
            if (s !== R) out.push(s);
          }
        });
      });
      out.push(Math.max(v[st.x], v[st.y]));
    }
    return out.filter((x) => x !== R && x >= 0 && x <= 20);
  }
  function numberOptions(R, count, prefer) {
    const set = new Set([R]);
    const near = U.shuffle([R + 1, R - 1]).concat(U.shuffle([R + 2, R - 2, R + 10, R - 10]));
    const pref = U.shuffle(prefer.slice(0, 2)).concat(prefer.slice(2));
    for (const p of [pref[0], near[0]].concat(pref.slice(1), near.slice(1))) {
      if (set.size >= count) break;
      if (p != null && p >= 0 && p <= 20) set.add(p);
    }
    let g = 0;
    while (set.size < count && g++ < 100) set.add(U.randInt(Math.max(0, R - 5), Math.min(20, R + 5)));
    return Array.from(set).sort((a, b) => a - b);
  }

  /* ==================================================================
     Darstellung
     ================================================================== */
  function makeField(ctx, id, model, cls) {
    const f = el('button.zm-field' + (cls ? '.' + cls : ''), { type: 'button', data: { id } });
    const v = el('span.zm-v');
    f.appendChild(v);
    f._v = v;
    ctx.listen(f, 'click', () => {
      if (f.dataset.n != null && f.dataset.n !== '') {
        LT.sfx.play('tap');
        LT.ui.animate && LT.ui.animate(f, 'zm-bounce');
        ctx.say(W(Number(f.dataset.n)));
      } else if (f.classList.contains('zm-active') && ctx.def) {
        ctx.say(model.ask || 'Welche Zahl kommt in das Feld mit dem Fragezeichen?');
      }
    });
    return f;
  }
  function fieldApi(fields) {
    return {
      fields,
      set(id, n, pop) {
        const f = fields[id];
        f.dataset.n = String(n);
        f._v.textContent = String(n);
        f.classList.remove('zm-empty', 'zm-active');
        f.setAttribute('aria-label', String(n));
        if (pop) { f.classList.remove('zm-pop'); void f.offsetWidth; f.classList.add('zm-pop'); }
      },
      empty(id) {
        const f = fields[id];
        delete f.dataset.n;
        f._v.textContent = '';
        f.classList.add('zm-empty');
        f.setAttribute('aria-label', 'leer');
      },
      activate(id) {
        Object.values(fields).forEach((x) => x.classList.remove('zm-active'));
        if (!id) return;
        fields[id].classList.add('zm-active');
        fields[id]._v.textContent = '?';
      },
      glow(ids) {
        Object.values(fields).forEach((x) => x.classList.remove('zm-glow'));
        (ids || []).forEach((i) => fields[i] && fields[i].classList.add('zm-glow'));
      },
      badge(id, text) {
        const f = fields[id];
        const old = f.querySelector('.zm-badge');
        if (old) old.remove();
        f.appendChild(el('span.zm-badge', text));
      },
    };
  }
  function buildWall(ctx, model) {
    const n = model.n;
    const wall = el('div.zm-wall', { style: { '--zm-n': String(n) }, role: 'group', 'aria-label': 'Zahlenmauer' });
    const fields = {};
    for (let r = n - 1; r >= 0; r--) {
      const row = el('div.zm-row');
      for (let i = 0; i < n - r; i++) {
        const id = r + '-' + i;
        fields[id] = makeField(ctx, id, model, 'zm-brick' + (r === n - 1 ? '.zm-topbrick' : ''));
        row.appendChild(fields[id]);
      }
      wall.appendChild(row);
    }
    const api = fieldApi(fields);
    api.node = wall;
    return api;
  }
  const TRI_SVG = `
<svg class="zm-tri-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  <polygon points="50,4 4,80 96,80" fill="#fff3d6" stroke="#f2a900" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M50 54 L27 42 M50 54 L73 42 M50 54 L50 80" stroke="#f2c25a" stroke-width="1.4" stroke-dasharray="3 2.5" fill="none"/>
</svg>`;
  function buildTriangle(ctx, model) {
    const box = el('div.zm-tri', { html: TRI_SVG, role: 'group', 'aria-label': 'Rechendreieck' });
    const fields = {};
    const pos = { i0: [50, 33], i1: [30, 66], i2: [70, 66], oL: [13, 36], oR: [87, 36], oB: [50, 93] };
    Object.keys(pos).forEach((id) => {
      const inner = id.charAt(0) === 'i';
      const f = makeField(ctx, id, model, inner ? 'zm-inner' : 'zm-outer');
      f.style.left = pos[id][0] + '%';
      f.style.top = pos[id][1] + '%';
      fields[id] = f;
      box.appendChild(f);
    });
    const api = fieldApi(fields);
    api.node = box;
    return api;
  }

  /* ==================================================================
     Ein Rechenschritt in Mauer oder Dreieck
     ================================================================== */
  async function solveStep(ctx, view, model, known, st, opts) {
    const v = model.vals;
    const R = v[st.id];
    const a = v[st.x];
    const b = v[st.y];
    const tri = !!opts.tri;
    view.activate(st.id);
    const ask = tri ? 'Welche Zahl kommt in das Feld mit dem Fragezeichen?' : 'Welche Zahl kommt in den Stein mit dem Fragezeichen?';
    model.ask = ask;
    await ctx.instruct(opts.first ? `${opts.first} ${ask}` : ask);
    if (!ctx.active) return;
    let count = opts.count;
    const values = numberOptions(R, count, misValues(model, known, st));
    const items = values.map((k) => ({ content: String(k), text: true, correct: k === R, say: w(k), value: k, className: 'zm-num' }));
    const ha = LT.z2 && LT.z2.hintAfterFor ? LT.z2.hintAfterFor(ctx, items.length) : (items.length <= 3 ? 1 : 2);
    const box = el('div.choices.zm-choices');
    opts.host.appendChild(box);
    let local = 0;
    const carriers = tri ? 'die zwei Zahlen innen daneben' : 'die zwei Steine darunter';
    // Jeder Stein ist ein eigener ctx.choices-Aufruf im selben ctx: Damit jeder
    // Stein die volle Hilfe-Leiter (inkl. Vormachen) bekommt, modelShown pro
    // Stein zurücksetzen und danach für das Requeue der Aufgabe wieder einsetzen.
    const modelBefore = !!ctx.modelShown;
    ctx.modelShown = false;
    await ctx.choices(items, {
      container: box,
      shuffle: false,
      size: 'small',
      hintAfter: ha,
      praise: false,
      onCorrect: (item, tile) => {
        view.glow([]);
        if (LT.z2 && LT.z2.flyNumber) LT.z2.flyNumber(ctx, tile, view.fields[st.id], String(R));
      },
      correctSay: () => {
        view.set(st.id, R, true);
        known.add(st.id);
        const sent = st.op === '+' ? `${W(a)} plus ${w(b)} ist ${w(R)}.` : `${W(a)} minus ${w(b)} ist ${w(R)}.`;
        const end = opts.last ? ' ' + (tri ? 'Das Dreieck ist fertig!' : U.pickFresh('zm-done', ['Die Mauer steht!', 'Die Mauer ist fertig!', 'Fertig gebaut!'], 1)) : '';
        if (local === 0 && U.chance(0.3)) {
          const proc = st.op === '+'
            ? U.pickFresh('zm-proc-p', tri
              ? ['Du hast genau die zwei Zahlen innen daneben zusammengerechnet. Klasse!', 'Super! Immer die zwei Nachbarn innen. Genau so geht das Rechendreieck.']
              : ['Du hast genau die zwei Tragsteine zusammengerechnet. Klasse!', 'Super! Du schaust immer auf die zwei Steine darunter. Wie ein echter Baumeister!', 'Toll gerechnet! Erst schauen, welche Steine tragen, dann rechnen.'], 1)
            : U.pickFresh('zm-proc-m', [
              'Du hast rückwärts gerechnet: Was fehlt noch? Sehr schlau!',
              `Klasse! Du hast überlegt: ${w(b)} und wie viel sind ${w(a)}? So rechnen Profis.`,
              'Super! Ergänzen ist ein toller Trick.',
            ], 1);
          return `${proc}${end}`;
        }
        return `${okWord()}! ${sent}${end}`;
      },
      explain: (item) => {
        const x = item.value;
        if (st.op === '+') {
          const mis = misValues(model, known, st);
          if (!tri && mis.indexOf(x) >= 0 && x !== Math.max(a, b)) return 'Schau mal: Ein Stein steht immer auf den zwei Steinen direkt darunter. Nicht auf den Nachbarn daneben.';
          if (tri && mis.indexOf(x) >= 0 && x !== Math.max(a, b)) return 'Schau mal: Außen gehören nur die zwei Zahlen innen direkt daneben dazu.';
          if (x === a || x === b) return tri ? 'Das ist nur eine Zahl. Außen stehen beide zusammen.' : 'Das ist nur ein Tragstein. Der Stein oben ist beide zusammen.';
          if (Math.abs(x - R) === 1) return 'Fast! Nur eins daneben. Rechne noch einmal ganz genau.';
          return `Fast! ${U.cap(carriers)} sind zusammen ${x > R ? 'weniger' : 'mehr'} als ${w(x)}.`;
        }
        if (x === a + b) return tri
          ? 'Schau mal: Außen steht die große Zahl. Innen muss eine kleinere Zahl hin. Was fehlt noch?'
          : 'Schau mal: Der obere Stein ist der größte. Unten muss eine kleinere Zahl hin. Was fehlt noch?';
        if (Math.abs(x - R) === 1) return 'Fast! Nur eins daneben. Prüfe: Passt deine Zahl mit dem Nachbarn zusammen?';
        return `Fast! Deine Zahl und die ${w(b)} müssen zusammen ${w(a)} sein.`;
      },
      hintSay: () => {
        view.glow([st.x, st.y]);
        if (st.op === '+') return `Tipp: Schau auf ${carriers}. Sie leuchten. Rechne ${w(a)} plus ${w(b)}.`;
        return `Tipp: ${W(b)} und wie viel sind zusammen ${w(a)}? Rechne ${w(a)} minus ${w(b)}.`;
      },
      modelSay: () => {
        view.glow([st.x, st.y]);
        if (st.op === '+') return `Schau: ${W(a)} plus ${w(b)} ist ${w(R)}. Tippe die ${w(R)} an.`;
        return `Schau: ${W(a)} minus ${w(b)} ist ${w(R)}. Denn ${w(b)} plus ${w(R)} ist ${w(a)}. Tippe die ${w(R)} an.`;
      },
      onWrong: async () => { local++; },
    });
    ctx.modelShown = modelBefore || !!ctx.modelShown;
    box.remove();
  }

  async function runFields(ctx, view, model, known, host, count, firstSay, tri) {
    let st = nextStep(model, known);
    let first = firstSay;
    while (st && ctx.active) {
      const after = new Set(known); after.add(st.id);
      const last = !nextStep(model, after);
      await solveStep(ctx, view, model, known, st, { host, count, first, last, tri });
      if (!ctx.active) return;
      first = '';
      await ctx.sleep(250);
      st = nextStep(model, known);
    }
  }

  /* ==================================================================
     Aufgabenarten
     ================================================================== */
  const RULE = 'Das ist eine Zahlenmauer! Jeder Stein ist so viel wie die zwei Steine darunter zusammen.';
  const INTRO = {
    1: RULE + ' Wir bauen von unten nach oben.',
    rule: RULE,
    2: 'Jetzt werden die Zahlen größer. Oben stehen Zahlen bis zwanzig.',
    3: 'Achtung, jetzt fehlt unten ein Stein! Dann rechnest du rückwärts. Frag dich: Was fehlt noch?',
    4: 'Das ist ein Rechendreieck. Innen liegen drei Zahlen. Außen steht immer, was die zwei Zahlen daneben zusammen sind.',
    triMinus: 'Jetzt fehlt innen eine Zahl. Außen steht schon die Summe. Rechne rückwärts.',
    plus1: 'Ein Experiment! Ein Stein unten wird gleich um eins größer. Was passiert mit dem obersten Stein?',
    topdown: 'Bei dieser Mauer steht oben schon die Zahl. Rechne von oben nach unten.',
    mauer4: 'Eine Riesenmauer! Unten liegen vier Steine.',
    weiter: 'Das ist ein schönes Päckchen. Die Aufgaben folgen einem Muster. Wie geht es weiter?',
    stoer: 'In diesem Päckchen hat sich eine Aufgabe versteckt, die nicht ins Muster passt. Findest du sie?',
  };
  const K5 = ['plus1', 'topdown', 'weiter', 'stoer', 'mauer4'];
  let introduced = new Set();
  let order5 = K5.slice();
  let triSeen = false;
  /** Aufgabenart je Stufe: Innerhalb einer Runde wechselt die Art nie (flow
   *  ändert nur Zahlenraum / Anzahl der Kärtchen, siehe engine.md). */
  const kindOf = (lv) => (lv <= 2 ? 'wall' : lv === 3 ? 'gap' : lv === 4 ? 'tri' : 'profi');
  const levelOf = (ctx) => (LT.s2 && LT.s2.lv
    ? LT.s2.lv(ctx, kindOf)
    : (kindOf(ctx.taskLevel) === kindOf(ctx.level) ? ctx.taskLevel : ctx.level));

  async function introOnce(ctx, key) {
    if (introduced.has(key)) return;
    introduced.add(key);
    if (key === 1) introduced.add('rule'); // INTRO 1 enthält die Regel
    await ctx.say(INTRO[key]);
  }
  /** Die Mauer-Regel einmal pro Runde vor der ersten Mauer – auf jeder Stufe. */
  async function ruleOnce(ctx) {
    if (introduced.has('rule') || introduced.has(1)) return;
    await introOnce(ctx, 'rule');
  }

  function shell(ctx) {
    ctx.stage.classList.add('zm-stage');
    const top = el('div.zm-top');
    const work = el('div.zm-work');
    const main = el('div.zm-main', top, work);
    ctx.stage.appendChild(main);
    return { top, work };
  }

  /* ---------- Stufen 1–3 + 5 (von oben) + 5 (Riesenmauer) ---------- */
  async function taskWall(ctx, lv, kind) {
    let pick;
    let model;
    const known = new Set();
    if (kind === 'mauer4') {
      pick = ctx.item(POOL4M, (x) => x.k, { avoid: 4 });
      model = wallModel(pick.base);
      // echte 4er-Mauer: flow>0 nur die untere Reihe, flow 0 ein Stein der
      // zweiten Reihe gegeben (5 Rechenschritte), flow<0 zwei Steine (4 Schritte)
      for (let i = 0; i < 4; i++) known.add('0-' + i);
      const giveN = ctx.flow > 0 ? 0 : ctx.flow < 0 ? 2 : 1;
      U.shuffle(['1-0', '1-1', '1-2']).slice(0, giveN).forEach((id) => known.add(id));
    } else if (kind === 'topdown') {
      pick = ctx.item(POOLTD, (x) => x.k, { avoid: 4 });
      model = wallModel(pick.base);
      known.add(model.top);
      if (pick.side === 0) { known.add('1-0'); known.add('0-2'); } else { known.add('1-1'); known.add('0-0'); }
    } else if (lv === 3) {
      pick = ctx.item(ctx.flow < 0 && POOL3E.length ? POOL3E : POOL3, (x) => x.k, { avoid: 5 });
      model = wallModel(pick.base);
      [0, 1, 2].forEach((i) => { if (i !== pick.u) known.add('0-' + i); });
      known.add('1-' + pick.m);
    } else {
      const pool = lv === 1 ? (ctx.flow < 0 ? POOL1E : POOL1) : (ctx.flow < 0 ? POOL2E : POOL2);
      pick = ctx.item(pool, (x) => x.k, { avoid: 5 });
      model = wallModel(pick.base);
      pick.base.forEach((_, i) => known.add('0-' + i));
    }
    const { top, work } = shell(ctx);
    const view = buildWall(ctx, model);
    top.appendChild(view.node);
    model.order.forEach((id) => (known.has(id) ? view.set(id, model.vals[id]) : view.empty(id)));

    if (lv !== 1) { await ruleOnce(ctx); if (!ctx.active) return; }
    await introOnce(ctx, kind === 'mauer4' || kind === 'topdown' ? kind : lv);
    if (!ctx.active) return;
    let count = lv === 1 ? 3 : 4;
    if (ctx.flow > 0) count++;
    await runFields(ctx, view, model, known, work, count, '', false);
    if (!ctx.active) return;
    await ctx.sleep(450);
  }

  /* ---------- Stufe 4: Rechendreieck ---------- */
  async function taskTriangle(ctx) {
    // Minus-Variante erst, wenn das Kind in dieser Runde schon ein normales
    // Dreieck gelöst hat; flow<0 nie, flow>0 öfter (statt Formatwechsel).
    const minus = triSeen && ctx.flow >= 0 && (ctx.flow > 0 || (ctx.index >= 2 && ctx.index % 2 === 1));
    if (!minus) triSeen = true;
    const pool = ctx.flow < 0 ? POOLTRI_E : POOLTRI;
    const pick = ctx.item(pool, (x) => x.k, { avoid: 5 });
    const model = triModel(pick.inner);
    const known = new Set(['i0', 'i1', 'i2']);
    if (minus) {
      const miss = U.pick(['i0', 'i1', 'i2']);
      known.delete(miss);
      const rel = U.pick(model.rels.filter((r) => r.a === miss || r.b === miss));
      known.add(rel.s);
    }
    const { top, work } = shell(ctx);
    const view = buildTriangle(ctx, model);
    top.appendChild(view.node);
    model.order.forEach((id) => (known.has(id) ? view.set(id, model.vals[id]) : view.empty(id)));
    await introOnce(ctx, 4);
    if (!ctx.active) return;
    if (minus) { await introOnce(ctx, 'triMinus'); if (!ctx.active) return; }
    await runFields(ctx, view, model, known, work, ctx.flow > 0 ? 5 : 4, '', true);
    if (!ctx.active) return;
    await ctx.sleep(450);
  }

  /* ---------- Stufe 5: Ein Stein wird um eins größer ---------- */
  const POSW = ['links unten', 'unten in der Mitte', 'rechts unten'];
  async function taskPlus1(ctx) {
    const pick = ctx.item(POOLPLUS1, (x) => x.k, { avoid: 1 });
    const base = U.pick(triples(1, 6, (a, b, c) => top3(a, b, c) >= 9 && top3(a, b, c) <= 17));
    const model = wallModel(base);
    const { top, work } = shell(ctx);
    const view = buildWall(ctx, model);
    top.appendChild(view.node);
    model.order.forEach((id) => view.set(id, model.vals[id]));
    await ruleOnce(ctx);
    if (!ctx.active) return;
    await introOnce(ctx, 'plus1');
    if (!ctx.active) return;
    const p = pick.p;
    const pid = '0-' + p;
    await ctx.sleep(300);
    if (!ctx.active) return;
    view.set(pid, base[p] + 1, true);
    view.badge(pid, '+1');
    LT.sfx.play('pop');
    const answer = p === 1 ? 2 : 1;
    const above = p === 0 ? ['1-0'] : p === 2 ? ['1-1'] : ['1-0', '1-1'];
    await ctx.instruct(`Der Stein ${POSW[p]} wird um eins größer. Um wie viel wird der oberste Stein größer?`);
    if (!ctx.active) return;
    const box = el('div.choices.zm-choices');
    work.appendChild(box);
    const items = [1, 2, 3].map((k) => ({ content: '+' + k, text: true, correct: k === answer, say: 'um ' + w(k), value: k, className: 'zm-num' }));
    let local = 0;
    await ctx.choices(items, {
      container: box,
      shuffle: false,
      size: 'small',
      hintAfter: 1,
      praise: false,
      correctSay: () => {
        if (local === 0 && U.chance(0.3)) return 'Super! Du hast vorher überlegt, statt alles neu zu rechnen. Wie ein Forscher!';
        return `${okWord()}! Um ${w(answer)}.`;
      },
      explain: (item) => (item.value === 3
        ? 'Fast! So viel ist es nicht. Der Stein wird ja nur um eins größer.'
        : 'Schau mal, wie viele Steine direkt über dem großen Stein liegen. Jeder davon wird um eins größer.'),
      hintSay: () => { view.glow(above); return p === 1 ? 'Tipp: Über dem mittleren Stein liegen zwei Steine. Beide werden größer.' : 'Tipp: Über dem Randstein liegt nur ein Stein.'; },
      modelSay: () => { view.glow(above.concat([model.top])); return `Schau: Der Stein trägt ${p === 1 ? 'zwei Steine' : 'nur einen Stein'}. Darum wird der oberste Stein um ${w(answer)} größer.`; },
      onWrong: async () => { local++; },
    });
    box.remove();
    if (!ctx.active) return;
    view.glow([]);
    const nb = base.slice(); nb[p]++;
    const m2 = wallModel(nb);
    for (const id of above) {
      await ctx.sleep(350);
      if (!ctx.active) return;
      view.set(id, m2.vals[id], true);
      view.badge(id, '+1');
      LT.sfx.play('pop');
    }
    await ctx.sleep(350);
    if (!ctx.active) return;
    view.set(model.top, m2.vals[model.top], true);
    view.badge(model.top, '+' + answer);
    LT.sfx.play('pop');
    await ctx.say(p === 1
      ? 'Der mittlere Stein trägt zwei Steine. Darum zählt er doppelt, und der oberste Stein wird um zwei größer.'
      : 'Der Randstein trägt nur einen Stein. Darum wird der oberste Stein nur um eins größer.');
    if (!ctx.active) return;
    await ctx.sleep(450);
  }

  /* ---------- Stufe 5: schöne Päckchen ---------- */
  function packCard(rows) {
    const card = el('div.zm-pack', { role: 'group', 'aria-label': 'Päckchen' });
    rows.forEach((r) => card.appendChild(r));
    return card;
  }
  function rowNode(r, withResult) {
    return el('div.zm-prow-static', el('span.zm-pt', rowText(r, false)), el('span.zm-peq', withResult ? '= ' + r.r : ''));
  }

  async function taskWeiter(ctx) {
    const pt = ctx.item(PATTERNS, (x) => x.k, { avoid: 4 });
    const rows = [0, 1, 2].map((i) => rowOf(pt, i));
    const next = rowOf(pt, 3);
    const { top, work } = shell(ctx);
    const last = el('div.zm-prow-static.zm-qrow', el('span.zm-pt', '?'), el('span.zm-peq', ''));
    top.appendChild(packCard(rows.map((r) => rowNode(r, true)).concat([last])));
    await introOnce(ctx, 'weiter');
    if (!ctx.active) return;
    await ctx.instruct(`${rowSent(rows[0])} ${rowSent(rows[1])} ${rowSent(rows[2])} Welche Aufgabe kommt als Nächstes?`);
    if (!ctx.active) return;
    const r3 = rows[2];
    const cands = [];
    const push = (x, y) => {
      const r = { x, y, op: pt.op, r: pt.op === '+' ? x + y : x - y };
      if (x < 1 || y < 1 || r.r < 0 || r.r > 20) return;
      if (x === next.x && y === next.y) return;
      if (cands.some((c) => c.x === x && c.y === y)) return;
      cands.push(r);
    };
    push(pt.dy !== 0 ? r3.x + pt.dx : r3.x + pt.dx, pt.dy !== 0 ? r3.y : r3.y + 1);
    push(pt.dx !== 0 ? r3.x : r3.x + 1, pt.dx !== 0 ? r3.y + pt.dy : r3.y + pt.dy);
    push(r3.x, r3.y);
    push(next.x + 1, next.y + 1);
    const nOpt = ctx.flow > 0 ? 4 : 3;
    const opts = U.shuffle([next].concat(cands.slice(0, nOpt - 1)));
    const items = opts.map((r) => ({ content: rowText(r, false), text: true, correct: r === next, say: rowSay(r), r, className: 'zm-ptile' }));
    const box = el('div.choices.zm-choices');
    work.appendChild(box);
    let local = 0;
    await ctx.choices(items, {
      container: box,
      shuffle: false,
      size: 'small',
      hintAfter: LT.z2 && LT.z2.hintAfterFor ? LT.z2.hintAfterFor(ctx, items.length) : 1,
      praise: false,
      correctSay: () => {
        U.clear(last);
        last.classList.remove('zm-qrow');
        last.append(el('span.zm-pt', rowText(next, false)), el('span.zm-peq', '= ' + next.r));
        last.classList.add('zm-pop');
        if (local === 0 && U.chance(0.3)) return 'Super! Du hast das Muster entdeckt und weitergedacht.';
        return `${okWord()}! ${rowSent(next)}`;
      },
      explain: (item) => {
        const r = item.r;
        if (r.x === r3.x && r.y === r3.y) return 'Das ist die gleiche Aufgabe wie oben. Das Päckchen soll weitergehen.';
        if (r.x !== next.x && r.y === next.y) return 'Fast! Schau auf die erste Zahl. Wie verändert sie sich von Zeile zu Zeile?';
        if (r.y !== next.y && r.x === next.x) return 'Fast! Schau auf die zweite Zahl. Wie verändert sie sich von Zeile zu Zeile?';
        return 'Fast! Vergleiche beide Zahlen von Zeile zu Zeile.';
      },
      hintSay: () => `Tipp: ${patternSay(pt)}`,
      modelSay: () => `Schau: Nach ${rowSay(r3)} kommt ${rowSay(next)}. ${patternSay(pt)}`,
      onWrong: async () => { local++; },
    });
    box.remove();
    if (!ctx.active) return;
    const d = resultDelta(pt);
    await ctx.say(`Schau aufs Ergebnis: Es ${change(d)}.`);
    if (!ctx.active) return;
    await ctx.sleep(450);
  }

  async function taskStoer(ctx) {
    const pt = ctx.item(PATTERNS, (x) => x.k.replace('Päckchen', 'Störaufgabe'), { avoid: 4 });
    const rows = [0, 1, 2, 3].map((i) => rowOf(pt, i));
    const s = U.randInt(1, 3);
    const good = rows[s];
    const perturb = U.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [0, 2]]);
    let bad = null;
    for (const [ddx, ddy] of perturb) {
      const x = good.x + ddx;
      const y = good.y + ddy;
      const r = { x, y, op: pt.op, r: pt.op === '+' ? x + y : x - y };
      if (x < 1 || y < 1 || r.r < 0 || r.r > 20) continue;
      if (rows.some((q) => q.x === x && q.y === y)) continue;
      bad = r; break;
    }
    if (!bad) bad = { x: good.x, y: good.y + 3, op: pt.op, r: pt.op === '+' ? good.x + good.y + 3 : good.x - good.y - 3 };
    const shown = rows.slice(); shown[s] = bad;
    const { top, work } = shell(ctx);
    const card = el('div.zm-pack.zm-pack-pick');
    top.appendChild(card);
    await introOnce(ctx, 'stoer');
    if (!ctx.active) return;
    await ctx.instruct('Eine Aufgabe passt nicht ins Muster. Tippe sie an.');
    if (!ctx.active) return;
    const items = shown.map((r, i) => ({
      content: el('span.zm-prow-in', el('span.zm-pt', rowText(r, false)), el('span.zm-peq', '= ' + r.r)),
      correct: i === s,
      say: rowSent(r),
      aria: rowText(r, true),
      r,
      className: 'zm-prow',
    }));
    let local = 0;
    let badTile = null;
    await ctx.choices(items, {
      container: card,
      shuffle: false,
      hintAfter: 2,
      praise: false,
      onCorrect: (item, tile) => { badTile = tile; },
      correctSay: () => {
        if (local === 0 && U.chance(0.3)) return 'Klasse! Du hast Zeile für Zeile verglichen. So findet man Störenfriede!';
        return `${okWord()}! Die passt nicht.`;
      },
      explain: () => 'Diese Aufgabe passt ins Muster. Vergleiche die Zahlen von oben nach unten.',
      hintSay: () => `Tipp: ${patternSay(pt)} Wo stimmt das nicht?`,
      modelSay: () => `Schau: Hier müsste ${rowSay(good)} stehen. Tippe die Aufgabe an.`,
      onWrong: async () => { local++; },
    });
    if (!ctx.active) return;
    if (badTile) {
      const inner = badTile.querySelector('.zm-prow-in');
      if (inner) {
        U.clear(inner);
        inner.append(el('span.zm-pt', rowText(good, false)), el('span.zm-peq', '= ' + good.r));
      }
      badTile.classList.add('zm-fixed');
    }
    await ctx.say(`So passt es: ${rowSent(good)} ${patternSay(pt)}`);
    if (!ctx.active) return;
    await ctx.sleep(450);
  }

  /* ==================================================================
     Registrierung
     ================================================================== */
  LT.registerGame({
    id: 'zahlenmauer',
    area: 'mathe1',
    title: 'Zahlenmauer',
    icon: '🧱',
    levels: 5,
    rounds: 5,
    type: 'tasks',
    intro: 'Wir bauen Zahlenmauern! Komm, wir rechnen Stein für Stein.',
    parent: {
      skill: 'Zahlenmauern, Rechendreiecke und schöne Päckchen (Muster und Strukturen)',
      goal: 'Ihr Kind übt Plus und Minus bis 20 in strukturierten Aufgabenformaten der 1. Klasse: In der Zahlenmauer ist jeder Stein die Summe der zwei Steine darunter. Fehlt unten ein Stein, wird ergänzt. Auf der höchsten Stufe erforscht es Zusammenhänge: Warum wird der oberste Stein um 2 größer, wenn der mittlere Stein um 1 wächst? Wie geht ein schönes Päckchen weiter, und welche Aufgabe stört das Muster?',
      levels: [
        '3er-Mauer bis 10: unten alles gegeben, nach oben addieren',
        '3er-Mauer bis 20 (auch mit Zehnerübergang)',
        'Lücke unten: ein Tragstein fehlt, Ergänzen bzw. Minus nötig',
        'Rechendreieck: außen addieren, später innen eine Zahl ergänzen',
        'Profi-Knobeln: „Ein Stein wird 1 größer – was passiert oben?“, Mauer von oben, 4er-Mauer, schöne Päckchen fortsetzen und Störaufgabe finden',
      ],
      tip: 'Zahlenmauern lassen sich gut auf Papier malen. Typischer Fehler: Kinder addieren Steine nebeneinander statt die zwei darunter. Zeigen Sie mit zwei Fingern auf die „Tragsteine“. Bei schönen Päckchen fragen: „Was verändert sich von Zeile zu Zeile? Was bleibt gleich?“',
    },

    async task(ctx) {
      if (ctx.index === 0) { introduced = new Set(); order5 = U.shuffle(K5); triSeen = false; }
      const lv = levelOf(ctx);
      if (lv === 5) {
        const kind = order5[ctx.index % order5.length];
        if (introduced.has(5) === false) { introduced.add(5); await ctx.say('Jetzt wirst du Mauer-Profi! Wir knobeln mit Mauern und mit schönen Päckchen.'); if (!ctx.active) return; }
        if (kind === 'plus1') return taskPlus1(ctx);
        if (kind === 'weiter') return taskWeiter(ctx);
        if (kind === 'stoer') return taskStoer(ctx);
        return taskWall(ctx, 5, kind);
      }
      if (lv === 4) return taskTriangle(ctx);
      return taskWall(ctx, lv, 'wall');
    },
  });
})();
