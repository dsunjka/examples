/* ==========================================================================
   Spiel „Flos Kaufladen“ 🛒 (Rechenschule, Klasse 1) – Rechnen mit Geld bis 20 €.

   Didaktik (Plan A7):
   - Münzen und Scheine erkennen (1 €, 2 €, 5 €, 10 €, 20 €), Beträge legen,
     bezahlen, Geldbeträge zählen und vergleichen, Rückgeld (Ergänzen).
   - Typische Fehlvorstellungen:
       * „Die größere Münze / mehr Geldstücke = mehr Geld“ → beim Zählen und
         Vergleichen wird immer auf den WERT gezeigt („Schau auf die Zahl!“),
         Ablenker in den Antworten ist die Anzahl der Geldstücke.
       * Anzahl der Münzen wird mit dem Betrag verwechselt → Flo zählt nach
         jedem Bezahlen sichtbar mit Zwischensummen: „fünf, sieben, acht“.
   - Strategien: großes Geld zuerst, dann weiterzählen; beim Rückgeld vom
     Preis aus weiterzählen (Ergänzen bis zum bezahlten Schein).
   - Stufen:
       1  Münzen 1 € und 2 €, Preise bis 5 € legen; kleine Beträge zählen
          (Brücke aus der Vorschule)
       2  + 5-€-Schein, Preise bis 10 €; Zählen; „Wer hat mehr Geld?“
       3  + 10-€-Schein, Preise bis 20 €; Zählen; Vergleichen
       4  + 20-€-Schein: mit möglichst wenig Geldstücken bezahlen und einen
          Betrag auf einem anderen Weg legen als Flo
       5  Rückgeld: „Du bezahlst mit 10 €, das Eis kostet 7 €“ (antippen und
          selbst als Kassierer legen); zwei Dinge zusammen bezahlen
          (Niveau Ende Klasse 1)
   - Bedienung: Geld im Geldbeutel antippen → es landet auf dem Zahlteller;
     Geld auf dem Teller antippen → es kommt zurück; „Bezahlen“ prüft.
   - Hilfe-Leiter (Legen, über ctx.helpStep): 1. Fehler → Flo zählt das
     Gelegte und sagt „zu wenig / zu viel“; 2. Fehler → Summe am Teller wird
     sichtbar + Strategie („größtes Geld zuerst“, „vom Preis weiterzählen“);
     3. Fehler → Flo legt vor und zählt, das Kind tippt auf „Bezahlen“.
     Antwort-Kacheln über ctx.choices (explain / hintSay / modelSay).
   - Lerninhalte (ctx.item): 'Lege 7 €', '5 + 2 + 1 €', 'Mia 5 | Ben 1+1+1',
     'Wenig 8 €', 'Anders 8 €', 'Rückgeld 10 − 7', 'Kasse 20 − 13', '6 € + 5 €'.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const w = (n) => U.numberWord(n);
  const W = (n) => U.cap(U.numberWord(n));
  const euro = (n) => (n === 1 ? 'ein Euro' : `${w(n)} Euro`);
  const Euro = (n) => U.cap(euro(n));
  const lbl = (n) => `${n} €`;
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const sum = (arr) => arr.reduce((s, x) => s + x, 0);
  const desc = (arr) => arr.slice().sort((a, b) => b - a);
  const msKey = (arr) => desc(arr).join('+');

  const ROUNDS = 6;
  const MAX_TRAY = 12;
  /** Geld im Geldbeutel je Stufe */
  const DENOMS = { 1: [1, 2], 2: [1, 2, 5], 3: [1, 2, 5, 10], 4: [1, 2, 5, 10, 20], 5: [1, 2, 5, 10, 20] };
  /** neues Geld, das beim Stufen-Intro gezeigt wird */
  const NEW = { 1: [1, 2], 2: [5], 3: [10], 4: [20], 5: [10, 20] };

  /** Aufgabenart je Stufe und Aufgabe */
  const PLAN = {
    1: ['legen', 'zaehlen', 'legen', 'legen', 'zaehlen', 'legen'],
    2: ['legen', 'zaehlen', 'vergleich', 'legen', 'zaehlen', 'legen'],
    3: ['legen', 'zaehlen', 'legen', 'vergleich', 'legen', 'zaehlen'],
    4: ['wenig', 'zaehlen', 'anders', 'wenig', 'anders', 'zaehlen'],
    5: ['rueck', 'kasse', 'zwei', 'rueck', 'kasse', 'rueck'],
  };
  const kindFor = (level, index) => PLAN[level][index % PLAN[level].length];

  const INTRO = {
    1: 'Willkommen in Flos Kaufladen! Hier bezahlen wir mit Euro. Das ist ein Euro. Und das sind zwei Euro. Schau immer auf die Zahl!',
    2: 'Neu im Geldbeutel: der Schein mit fünf Euro! Ein Schein ist leicht, aber viel wert. Fünf Euro sind so viel wie fünf Münzen mit einem Euro.',
    3: 'Jetzt gibt es auch den Schein mit zehn Euro. Damit kannst du bis zwanzig Euro bezahlen.',
    4: 'Jetzt kommt der Schein mit zwanzig Euro dazu. Heute wirst du ein Geldprofi. Es gibt viele Wege, einen Preis zu legen.',
    5: 'Jetzt geht es um das Rückgeld. Wer mit einem großen Schein bezahlt, bekommt Geld zurück.',
  };
  const KIND_INTRO = {
    legen: 'Tippe auf das Geld im Geldbeutel. Dann landet es auf dem Teller. Wenn alles passt, tippe auf Bezahlen.',
    zaehlen: 'Wie viel Geld ist das? Zähle die Euro, nicht die Münzen!',
    vergleich: 'Wer hat mehr Geld? Achtung: Viele Münzen sind nicht immer viel Geld.',
    wenig: 'Ein Geldprofi bezahlt mit möglichst wenig Geldstücken. Nimm große Münzen und Scheine!',
    anders: 'Flo hat schon Geld gelegt. Kannst du genauso viel Geld auf eine andere Art legen?',
    rueck: 'Du bezahlst mit einem großen Schein. Wie viel Geld bekommst du zurück?',
    kasse: 'Jetzt sitzt du an der Kasse! Gib dem Kind das richtige Rückgeld.',
    zwei: 'Jetzt kaufst du zwei Sachen auf einmal. Rechne erst zusammen, dann lege das Geld.',
  };

  /* ------------------------------------------------------------------
     Waren im Laden (Preisspanne passt grob zur Wirklichkeit)
     ------------------------------------------------------------------ */
  const GOODS = [
    { k: 'Apfel', e: '🍎', a: 'der', lo: 1, hi: 2 },
    { k: 'Brezel', e: '🥨', a: 'die', lo: 1, hi: 2 },
    { k: 'Banane', e: '🍌', a: 'die', lo: 1, hi: 2 },
    { k: 'Saft', e: '🧃', a: 'der', lo: 1, hi: 3 },
    { k: 'Eis', e: '🍦', a: 'das', lo: 1, hi: 4 },
    { k: 'Kuchen', e: '🍰', a: 'der', lo: 2, hi: 5 },
    { k: 'Ball', e: '⚽', a: 'der', lo: 3, hi: 9 },
    { k: 'Auto', e: '🚗', a: 'das', lo: 3, hi: 10 },
    { k: 'Buch', e: '📕', a: 'das', lo: 4, hi: 12 },
    { k: 'Puzzle', e: '🧩', a: 'das', lo: 5, hi: 12 },
    { k: 'Dino', e: '🦕', a: 'der', lo: 4, hi: 12 },
    { k: 'Trommel', e: '🥁', a: 'die', lo: 6, hi: 15 },
    { k: 'Teddy', e: '🧸', a: 'der', lo: 6, hi: 16 },
    { k: 'Drachen', e: '🪁', a: 'der', lo: 7, hi: 16 },
    { k: 'Rucksack', e: '🎒', a: 'der', lo: 11, hi: 20 },
    { k: 'Roller', e: '🛴', a: 'der', lo: 14, hi: 20 },
  ];
  const The = (g) => `${U.cap(g.a)} ${g.k}`;
  function goodFor(price, exclude) {
    let fit = GOODS.filter((g) => price >= g.lo && price <= g.hi && g !== exclude);
    if (!fit.length) fit = GOODS.filter((g) => g !== exclude);
    return U.pickFresh('kau-good', fit, 4, (g) => g.k);
  }

  /* ------------------------------------------------------------------
     Geld-Mathematik
     ------------------------------------------------------------------ */
  /** größtes Geld zuerst (für Euro immer die wenigsten Geldstücke) */
  function greedy(t, denoms) {
    const out = [];
    let r = t;
    for (const d of desc(denoms)) while (r >= d) { out.push(d); r -= d; }
    return out;
  }
  /** einen anderen Weg finden: das größte Geldstück (> 1 €) in kleinere tauschen */
  const BREAK = { 20: [10, 10], 10: [5, 5], 5: [2, 2, 1], 2: [1, 1] };
  function otherWay(way) {
    const s = desc(way);
    const i = s.findIndex((v) => v > 1);
    if (i < 0) return s;
    return desc([...s.slice(0, i), ...BREAK[s[i]], ...s.slice(i + 1)]);
  }
  /** alle Mehrfachmengen (absteigend) aus denoms mit n Stücken und Summe in [sMin, sMax] */
  function multisets(denoms, nMin, nMax, sMin, sMax) {
    const ds = desc(denoms);
    const res = [];
    (function rec(start, cur, s) {
      if (cur.length >= nMin && s >= sMin && s <= sMax) res.push(cur.slice());
      if (cur.length >= nMax) return;
      for (let i = start; i < ds.length; i++) {
        if (s + ds[i] > sMax) continue;
        cur.push(ds[i]);
        rec(i, cur, s + ds[i]);
        cur.pop();
      }
    })(0, [], 0);
    return res;
  }
  /** „Fünf, sieben, acht.“ (Zwischensummen, größtes Geld zuerst) */
  function runningTotals(pieces) {
    const out = [];
    let s = 0;
    for (const v of desc(pieces)) { s += v; out.push(s); }
    return out;
  }
  function countSay(pieces) {
    const rt = runningTotals(pieces);
    if (rt.length <= 1) return '';
    return rt.map((x, i) => (i === 0 ? W(x) : w(x))).join(', ') + '.';
  }
  /** Weiterzählen vom Preis bis zum bezahlten Betrag */
  function countUpSay(price, paid) {
    const c = paid - price;
    if (c <= 4) {
      return `${W(price)}, ${range(price + 1, paid).map(w).join(', ')}. Das sind ${euro(c)} Rückgeld.`;
    }
    const steps = desc(greedy(c, [1, 2, 5, 10])).reverse();
    let s = price;
    const parts = steps.map((v) => { s += v; return `plus ${w(v)} ist ${w(s)}`; });
    return `${W(price)} ${parts.join(', ')}. Zusammen sind das ${euro(c)} Rückgeld.`;
  }

  /* ------------------------------------------------------------------
     Pools (Lerninhalte)
     ------------------------------------------------------------------ */
  function legenPool(level, flow) {
    let p;
    if (level === 1) p = flow < 0 ? range(1, 4) : range(2, 5);
    else if (level === 2) p = flow < 0 ? range(3, 8) : flow > 0 ? range(6, 10) : range(4, 10);
    else p = flow < 0 ? range(6, 15) : flow > 0 ? range(11, 20) : range(8, 20);
    return p.map((n) => ({ kind: 'legen', t: n, key: `Lege ${n} €` }));
  }
  function zaehlPool(level, flow) {
    let list;
    if (level === 1) list = multisets([1, 2], 2, flow > 0 ? 5 : 4, 3, flow < 0 ? 5 : 7).filter((m) => m.includes(2));
    else if (level === 2) list = multisets([1, 2, 5], 2, flow < 0 ? 3 : 4, 4, 10).filter((m) => m.includes(5));
    else if (level === 3) list = multisets([1, 2, 5, 10], 3, flow < 0 ? 4 : 5, 8, 20).filter((m) => m.includes(10));
    else list = multisets([1, 2, 5, 10, 20], 4, flow < 0 ? 4 : 6, 11, 20).filter((m) => m.includes(10) || m.includes(5));
    return list.map((m) => ({ kind: 'zaehlen', pieces: m, t: sum(m), key: `${m.join(' + ')} €` }));
  }
  function vergleichPool(level) {
    const big = level === 2 ? [1, 2, 5] : [1, 2, 5, 10];
    const top = level === 2 ? 5 : 10;
    const few = multisets(big, 1, 2, 2, level === 2 ? 10 : 20).filter((m) => m[0] === top);
    const many = multisets(level === 2 ? [1, 2] : [1, 2, 5], 3, 5, 3, level === 2 ? 10 : 20);
    const out = [];
    for (const a of few) {
      for (const b of many) {
        const d = sum(a) - sum(b);
        if (Math.abs(d) > 3) continue;
        out.push({ kind: 'vergleich', a, b, key: `${a.join('+')} | ${b.join('+')}` });
      }
    }
    return out;
  }
  function wenigPool(level, flow) {
    const p = flow < 0 ? range(6, 13) : flow > 0 ? range(12, 20) : range(7, 20);
    return p.filter((n) => greedy(n, DENOMS[4]).length >= 2).map((n) => ({ kind: 'wenig', t: n, key: `Wenig ${n} €` }));
  }
  function andersPool(level, flow) {
    const p = flow < 0 ? range(3, 8) : flow > 0 ? range(9, 17) : range(4, 15);
    return p.map((n) => ({ kind: 'anders', t: n, key: `Anders ${n} €` }));
  }
  function rueckPool(kind, flow) {
    const out = [];
    const add = (paid, price) => out.push({ kind, paid, price, t: paid - price, key: `${kind === 'rueck' ? 'Rückgeld' : 'Kasse'} ${paid} − ${price}` });
    if (flow <= 0) range(1, 4).forEach((p) => add(5, p));
    range(flow < 0 ? 5 : 3, 9).forEach((p) => add(10, p));
    if (flow >= 0) range(flow > 0 ? 6 : 11, 19).forEach((p) => add(20, p));
    return out;
  }
  function zweiPool(flow) {
    const out = [];
    for (let a = 2; a <= 12; a++) {
      for (let b = 2; b <= a; b++) {
        const s = a + b;
        if (s < 7 || s > 20) continue;
        if (flow < 0 && s > 12) continue;
        if (flow > 0 && s < 11) continue;
        out.push({ kind: 'zwei', a, b, t: s, key: `${a} € + ${b} €` });
      }
    }
    return out;
  }
  function poolFor(kind, level, flow) {
    switch (kind) {
      case 'legen': return legenPool(level, flow);
      case 'zaehlen': return zaehlPool(level, flow);
      case 'vergleich': return vergleichPool(level);
      case 'wenig': return wenigPool(level, flow);
      case 'anders': return andersPool(level, flow);
      case 'rueck': case 'kasse': return rueckPool(kind, flow);
      default: return zweiPool(flow);
    }
  }

  /* ------------------------------------------------------------------
     Geld zeichnen (eigene, schlichte Gestaltung – keine echten Abbildungen)
     ------------------------------------------------------------------ */
  function money(v) {
    const coin = v < 5;
    const node = el('span', { class: `kau-m ${coin ? 'kau-coin' : 'kau-bill'} kau-v${v}`, 'aria-hidden': 'true' },
      el('b', lbl(v)));
    if (!coin) node.appendChild(el('i', 'EURO'));
    return node;
  }
  /** Geldstück mit Platz für eine Zwischensumme */
  function piece(v) {
    const p = el('span.kau-p', money(v));
    p._v = v;
    return p;
  }
  function badge(p, n) {
    let b = p.querySelector('.kau-badge');
    if (!b) { b = el('span.kau-badge'); p.appendChild(b); }
    b.textContent = lbl(n);
  }
  function clearBadges(root) { root.querySelectorAll('.kau-badge').forEach((b) => b.remove()); }
  /** Geldstücke in einem Behälter der Größe nach ordnen (größtes zuerst) */
  function sortBox(box) {
    const ps = Array.from(box.querySelectorAll('.kau-p'));
    ps.sort((x, y) => y._v - x._v).forEach((p) => box.appendChild(p));
    return ps;
  }
  /** sichtbar mitzählen: Zwischensummen erscheinen nacheinander */
  async function showCount(ctx, box, ms = 380) {
    const ps = sortBox(box);
    let s = 0;
    for (const p of ps) {
      s += p._v;
      badge(p, s);
      p.classList.add('kau-counted');
      LT.sfx.tone(500 + s * 14, 0.07, { type: 'triangle', volume: 0.25 });
      await ctx.sleep(ms);
      if (!ctx.active) return s;
    }
    return s;
  }
  function shopCard(g, price, extraCls = '') {
    return el('div.kau-good' + extraCls,
      U.emoji(g.e, 'kau-good-emoji'),
      el('span.kau-tag', lbl(price)));
  }

  let introduced = new Set();

  LT.registerGame({
    id: 'kaufladen',
    area: 'mathe1',
    title: 'Flos Kaufladen',
    icon: '🛒',
    levels: 5,
    rounds: ROUNDS,
    type: 'tasks',
    intro: 'Willkommen in Flos Kaufladen! Hier kaufen wir ein und bezahlen mit Geld.',
    parent: {
      skill: 'Rechnen mit Geld bis 20 €: Münzen und Scheine erkennen, Beträge legen, zählen, vergleichen, Rückgeld',
      goal: 'Ihr Kind lernt die Euro-Münzen und -Scheine bis 20 € kennen und verbindet Geld mit dem Zahlenraum bis 20. Es zählt Geldbeträge geschickt („großes Geld zuerst, dann weiterzählen“), merkt, dass nicht die Anzahl oder Größe der Münzen zählt, sondern ihr Wert, legt Beträge auf verschiedenen Wegen und bestimmt Rückgeld durch Ergänzen („von 7 bis 10 sind es 3“).',
      levels: [
        'Münzen 1 € und 2 €: Preise bis 5 € passend legen, kleine Beträge zählen (Brücke aus der Vorschule)',
        'Dazu der 5-€-Schein: Preise bis 10 € legen, Beträge zählen, „Wer hat mehr Geld?“ (mehr Münzen ≠ mehr Geld)',
        'Dazu der 10-€-Schein: Preise bis 20 € legen, Beträge bis 20 € zählen und vergleichen',
        'Dazu der 20-€-Schein: mit möglichst wenig Geldstücken bezahlen und denselben Betrag auf einem anderen Weg legen',
        'Rückgeld bestimmen und selbst herausgeben (z. B. 10 € gegeben, 7 € Preis) und zwei Dinge zusammen bezahlen (Niveau Ende Klasse 1)',
      ],
      tip: 'Spielen Sie Kaufladen mit echtem Kleingeld oder Spielgeld: Preise bis 20 € auf Zettel schreiben, abwechselnd Kunde und Kassierer sein. Fragen Sie: „Geht es auch mit weniger Münzen?“ und „Wie viel bekomme ich zurück?“. Beim Einkaufen darf Ihr Kind kleine Beträge selbst bezahlen und das Rückgeld nachzählen.',
    },

    async task(ctx) {
      const level = ctx.taskLevel;
      const kind = kindFor(level, ctx.index);
      if (ctx.index === 0) {
        // Stufen unterhalb der Startstufe kennt das Kind schon (kein „Willkommen“ beim Zurückstufen)
        introduced = new Set(range(1, ctx.level - 1));
      }
      ctx.stage.classList.add('kau-stage');
      if (!introduced.has(level)) {
        introduced.add(level);
        await levelIntro(ctx, level);
        if (!ctx.active) return;
      }
      if (KIND_INTRO[kind] && !introduced.has('k:' + kind)) {
        introduced.add('k:' + kind);
        await ctx.say(KIND_INTRO[kind]);
        if (!ctx.active) return;
      }
      const t = ctx.item(poolFor(kind, level, ctx.flow), (x) => x.key, { avoid: 3 });
      if (kind === 'zaehlen') await zaehlTask(ctx, t, level);
      else if (kind === 'vergleich') await vergleichTask(ctx, t);
      else if (kind === 'rueck') await rueckTask(ctx, t);
      else await buildTask(ctx, t, level);
    },
  });

  /** Stufen-Intro: das neue Geld groß zeigen und benennen */
  async function levelIntro(ctx, level) {
    const show = el('div.kau-intro', ...NEW[level].map((v) => el('div.kau-intro-item', piece(v))));
    ctx.stage.appendChild(show);
    await ctx.say(INTRO[level]);
    if (!ctx.active) return;
    await ctx.sleep(300);
    show.remove();
  }

  /* ==================================================================
     Legen / Bezahlen (legen, wenig, anders, zwei, kasse)
     ================================================================== */
  async function buildTask(ctx, t, level) {
    const kind = t.kind;
    const denoms = DENOMS[level];
    const target = t.t;
    const speakTap = level <= 2;
    const good = kind === 'zwei' ? goodFor(t.a) : goodFor(kind === 'kasse' ? t.price : target);
    const good2 = kind === 'zwei' ? goodFor(t.b, good) : null;
    const flo = kind === 'anders' ? greedy(target, denoms) : null;
    const minN = greedy(target, denoms).length;
    const solution = kind === 'anders' ? otherWay(flo) : kind === 'kasse' ? desc(greedy(target, denoms)) : greedy(target, denoms);

    // ---------- oben: Ware(n) ----------
    const top = el('div.kau-top');
    if (kind === 'zwei') {
      top.append(shopCard(good, t.a), el('span.kau-op', '+'), shopCard(good2, t.b));
    } else if (kind === 'kasse') {
      top.append(
        shopCard(good, t.price),
        el('div.kau-paid', el('span.kau-who-emoji', U.emoji('🧒')), el('span.kau-small', 'gibt'), el('div.kau-row', piece(t.paid))),
      );
    } else {
      top.append(shopCard(good, target));
      if (kind === 'anders') {
        const floBox = el('div.kau-flo', el('span.kau-small', 'Flo:'), el('div.kau-row', ...flo.map(piece)));
        top.appendChild(floBox);
      }
    }

    // ---------- Zahlteller ----------
    const trayLbl = el('span.kau-tray-lbl', kind === 'kasse' ? 'Rückgeld' : 'Teller');
    const sumBadge = el('span.kau-sum', '0 €');
    const trayRow = el('div.kau-row.kau-tray-row');
    const tray = el('div.kau-tray', trayLbl, trayRow, sumBadge);
    let showSum = false;

    // ---------- Geldbeutel + Knöpfe ----------
    const coinGrp = el('div.kau-wgrp');
    const billGrp = el('div.kau-wgrp');
    const wallet = el('div.kau-wallet', coinGrp, billGrp);
    if (denoms.every((v) => v < 5)) billGrp.remove();
    const btns = {};
    let busy = true;
    let finished = false;
    let modeled = false;

    const trayVals = () => Array.from(trayRow.querySelectorAll('.kau-p')).map((p) => p._v);
    function refresh() {
      const s = sum(trayVals());
      sumBadge.textContent = lbl(s);
      sumBadge.classList.toggle('is-on', showSum);
      tray.classList.toggle('is-empty', s === 0);
    }
    function addPiece(v, quiet) {
      const p = piece(v);
      p.classList.add('kau-in');
      ctx.listen(p, 'click', () => {
        if (busy || finished) return;
        clearBadges(trayRow);
        p.remove();
        LT.sfx.play('flip');
        refresh();
      });
      trayRow.appendChild(p);
      if (!quiet) LT.sfx.tone(700 + v * 12, 0.08, { type: 'triangle', volume: 0.3 });
      refresh();
      return p;
    }
    function setTray(vals) {
      trayRow.innerHTML = '';
      vals.forEach((v) => addPiece(v, true));
      refresh();
    }
    for (const v of denoms) {
      const b = el('button.kau-wb', { type: 'button', 'aria-label': euro(v) }, money(v));
      ctx.listen(b, 'click', () => {
        if (busy || finished) return;
        if (trayVals().length >= MAX_TRAY) {
          LT.ui.animate(tray, 'shake');
          ctx.say('Der Teller ist voll. Nimm etwas weg.');
          return;
        }
        clearBadges(trayRow);
        addPiece(v);
        if (speakTap) ctx.say(euro(v));
      });
      btns[v] = b;
      (v < 5 ? coinGrp : billGrp).appendChild(b);
    }
    const clear = el('button.btn.kau-tool', {
      type: 'button', 'aria-label': 'Alles zurück',
      on: { click: () => { if (busy || finished) return; setTray([]); LT.sfx.play('flip'); } },
    }, U.emoji('↩️'));
    const pay = el('button.btn.btn-green.kau-pay', { type: 'button', on: { click: () => doCheck() } },
      el('span.kau-pay-mark', '✓'), el('span', kind === 'kasse' ? 'Geben' : 'Bezahlen'));
    const actions = el('div.kau-actions', clear, pay);
    const bottom = el('div.kau-bottom', wallet, actions);

    ctx.stage.append(top, tray, bottom);
    refresh();

    // ---------- Texte ----------
    const priceSay = kind === 'zwei'
      ? `${The(good)} kostet ${euro(t.a)}. ${The(good2)} kostet ${euro(t.b)}.`
      : `${The(good)} kostet ${euro(kind === 'kasse' ? t.price : target)}.`;
    let question;
    if (kind === 'legen') question = `${priceSay} Lege genau ${euro(target)} auf den Teller.`;
    else if (kind === 'wenig') question = `${priceSay} Bezahle mit möglichst wenig Geldstücken.`;
    else if (kind === 'anders') question = `Flo hat ${euro(target)} gelegt. Lege ${euro(target)} auf eine andere Art.`;
    else if (kind === 'zwei') question = `${priceSay} Du kaufst beides. Lege das Geld auf den Teller.`;
    else question = `${priceSay} Das Kind bezahlt mit ${euro(t.paid)}. Lege das Rückgeld hin.`;
    const payWord = kind === 'kasse' ? 'Geben' : 'Bezahlen';

    function strategyHint() {
      const s = sum(trayVals());
      if (kind === 'zwei') return `Tipp: Rechne erst ${w(t.a)} plus ${w(t.b)}. Fang beim größten Geld an.`;
      if (kind === 'kasse') return `Tipp: Zähle vom Preis aus weiter bis ${w(t.paid)}. Von ${w(t.price)} bis ${w(t.paid)}, wie viel fehlt?`;
      if (kind === 'anders') {
        const big = Math.max(...flo);
        return big > 1
          ? `Tipp: Tausche das größte Geld von Flo gegen kleinere Münzen. Zusammen müssen es wieder ${euro(target)} sein.`
          : 'Tipp: Nimm eine größere Münze statt zwei kleinen.';
      }
      if (kind === 'wenig') return `Tipp: Nimm zuerst das größte Geld, das passt. Am Teller siehst du jetzt, wie viel schon liegt.`;
      return s > target
        ? `Tipp: Nimm zuerst das größte Geld, das passt. Am Teller siehst du jetzt, wie viel schon liegt.`
        : `Tipp: Nimm zuerst das größte Geld, das passt. Dann zähle weiter bis ${w(target)}.`;
    }
    function modelSentence() {
      if (kind === 'kasse') return `Schau, ich zähle vom Preis weiter. ${countUpSay(t.price, t.paid)}`;
      if (kind === 'zwei') return `${W(t.a)} plus ${w(t.b)} ist ${w(target)}. ${countSay(solution) || ''} Genau ${euro(target)}.`;
      if (kind === 'anders') return `Schau, so geht es auch: ${countSay(solution)} Wieder ${euro(target)}, aber anders als Flo.`;
      const c = countSay(solution);
      return `Schau: ${c ? c + ' ' : ''}Genau ${euro(target)}.`;
    }

    // ---------- Prüfen ----------
    async function doCheck() {
      if (busy || finished || !ctx.active) return;
      const vals = trayVals();
      const s = sum(vals);
      if (s === 0) {
        LT.ui.animate(tray, 'shake');
        await ctx.say('Leg zuerst Geld auf den Teller. Tippe dazu auf das Geld unten.');
        return;
      }
      busy = true;
      ctx.unhint(pay);
      Object.values(btns).forEach((b) => ctx.unhint(b));
      // Flo zählt sichtbar mit (größtes Geld zuerst)
      if (vals.length > 1) await showCount(ctx, trayRow);
      if (!ctx.active) return;
      const cs = countSay(vals);
      const exact = s === target;
      let ok = exact;
      if (kind === 'wenig') ok = exact && vals.length === minN;
      if (kind === 'anders') ok = exact && msKey(vals) !== msKey(flo);

      if (ok) {
        finished = true;
        ctx.markTest(pay, false);
        let say;
        const first = ctx.wrongCount === 0 && !modeled;
        const PROC = {
          legen: ['Super! Du hast mit dem großen Geld angefangen und dann weitergezählt.', 'Klasse! Du hast genau gezählt, bis der Preis gepasst hat.'],
          wenig: [`Wie ein Profi! Nur ${w(vals.length)} Geldstücke, weil du das große Geld zuerst genommen hast.`, 'Super schlau! Große Scheine zuerst, so brauchst du ganz wenig Geldstücke.'],
          anders: ['Toll! Du hast einen eigenen Weg gefunden. Gleich viel Geld, nur anders gelegt.', 'Klasse! Du hast getauscht und es sind trotzdem gleich viele Euro.'],
          zwei: ['Super! Du hast erst zusammengerechnet und dann bezahlt.', 'Klasse! Erst rechnen, dann legen. Das machen Profis so.'],
          kasse: ['Prima! Du hast vom Preis aus weitergezählt. So machen es echte Kassierer.', 'Super! Du hast genau ergänzt bis zum Schein.'],
        };
        if (first && U.chance(0.3)) say = `${U.pickFresh('kau-proc-' + kind, PROC[kind], 1)}`;
        else say = `${U.pickFresh('kau-ok-b', ['Richtig', 'Prima', 'Super', 'Stimmt'], 2)}, ${kind === 'kasse' ? euro(target) + ' Rückgeld' : 'genau ' + euro(target)}!`;
        if (cs) say = `${cs} ${say}`;
        if (kind === 'kasse') say += ` ${W(t.price)} plus ${w(target)} ist ${w(t.paid)}.`;
        tray.classList.add('is-done');
        await ctx.correct(tray, { say, praise: false });
        if (!ctx.active) return;
        await ctx.sleep(450);
        resolveTask();
        return;
      }

      // --- nicht richtig ---
      let say;
      const pre = cs ? `${cs} Das sind ${euro(s)}.` : `Das ${s === 1 ? 'ist' : 'sind'} ${euro(s)}.`;
      const firstTake = ctx.wrongCount === 0 ? ' Tippe auf Geld am Teller, dann kommt es zurück.' : '';
      if (kind === 'wenig' && exact) {
        say = `Genau ${euro(s)}, prima! Aber das sind ${w(vals.length)} Geldstücke. Es geht mit weniger. Tausche kleine Münzen gegen großes Geld.`;
      } else if (kind === 'anders' && exact) {
        say = `Genau ${euro(s)}! Aber so hat Flo es auch gelegt. Findest du einen anderen Weg?`;
      } else if (s < target) {
        const what = kind === 'zwei' ? 'Beides zusammen kostet mehr.' : kind === 'kasse' ? 'Das ist noch zu wenig Rückgeld.' : kind === 'anders' ? `Flo hat ${euro(target)} gelegt.` : `${The(good)} kostet ${euro(target)}.`;
        say = `${pre} ${what} Da fehlt noch etwas.`;
      } else {
        const what = kind === 'zwei' ? 'Beides zusammen kostet weniger.' : kind === 'kasse' ? 'Das ist zu viel Rückgeld.' : 'Das ist zu viel.';
        say = `${pre} ${what} Nimm etwas weg.${firstTake}`;
      }
      await ctx.wrong(tray, { say, keep: true });
      if (!ctx.active) return;
      const step = ctx.helpStep;
      if (step === 2) {
        showSum = true;
        refresh();
        const hintV = kind === 'anders' ? null : desc(denoms).find((d) => d <= (kind === 'wenig' || s > target ? target : target - s) && d <= target);
        if (hintV && btns[hintV] && kind !== 'kasse') {
          ctx.hint(btns[hintV]);
          ctx.timeout(() => ctx.unhint(btns[hintV]), 3500);
        }
        ctx.hint(sumBadge);
        ctx.timeout(() => ctx.unhint(sumBadge), 3500);
        await ctx.say(strategyHint());
        if (!ctx.active) return;
      } else if (step >= 3) {
        // vormachen: Flo legt hin und zählt, das Kind tippt auf „Bezahlen“
        modeled = true;
        ctx.modelShown = true;
        showSum = true;
        clearBadges(trayRow);
        setTray([]);
        await ctx.say('Schau, ich zeige es dir.');
        if (!ctx.active) return;
        for (const v of solution) {
          addPiece(v);
          ctx.hint(btns[v]);
          await ctx.sleep(380);
          if (!ctx.active) return;
          ctx.unhint(btns[v]);
        }
        await showCount(ctx, trayRow, 250);
        if (!ctx.active) return;
        await ctx.say(`${modelSentence()} Tippe auf ${payWord}.`);
        if (!ctx.active) return;
        ctx.hint(pay);
        ctx.markTest(pay);
      }
      busy = false;
    }

    let resolveTask;
    const done = new Promise((r) => { resolveTask = r; });

    ctx.setInstruction(question);
    await ctx.instruct(question);
    if (!ctx.active) return;
    busy = false;
    ctx.testSolve(() => {
      if (busy || finished) return;
      setTray(solution);
      doCheck();
    });
    await done;
  }

  /* ==================================================================
     Zählen: Wie viel Geld ist das?
     ================================================================== */
  async function zaehlTask(ctx, t) {
    const pieces = U.shuffle(t.pieces.slice());
    const n = pieces.length;
    const box = el('div.kau-row.kau-count', ...pieces.map(piece));
    const card = el('div.prompt-box.kau-countcard', box);
    ctx.stage.appendChild(card);
    const question = 'Wie viel Geld ist das?';
    await ctx.instruct(question);
    if (!ctx.active) return;

    const ans = t.t;
    const values = LT.z2.options(ans, 4, 1, 20, [n, ans + 1, ans - 1, ans - 2]);
    const items = values.map((k) => ({ content: lbl(k), text: true, correct: k === ans, say: euro(k), value: k, className: 'kau-num' }));
    const ha = LT.z2.hintAfterFor(ctx, items.length);
    const cs = countSay(t.pieces);
    let counted = false;
    const PROC = [
      'Super! Du hast mit dem größten Geld angefangen und weitergezählt.',
      'Klasse! Du hast nicht die Münzen gezählt, sondern die Euro.',
    ];
    await ctx.choices(items, {
      shuffle: false,
      size: 'small',
      hintAfter: ha,
      praise: false,
      onCorrect: () => { if (!counted) { counted = true; showCount(ctx, box, 200); } },
      correctSay: () => {
        if (ctx.wrongCount === 0 && U.chance(0.3)) return `${U.pickFresh('kau-proc-z', PROC, 1)} ${cs}`;
        return `${cs} ${U.pickFresh('kau-ok', ['Richtig', 'Genau', 'Super', 'Stimmt'], 2)}, das sind ${euro(ans)}!`;
      },
      explain: (item) => {
        const k = item.value;
        if (k === n) return `Fast! Das sind ${w(n)} Geldstücke. Aber nicht jedes ist ein Euro wert. Schau auf die Zahlen!`;
        return k > ans ? `Schau mal: Es sind weniger als ${euro(k)}.` : `Schau mal: Es sind mehr als ${euro(k)}.`;
      },
      hintSay: () => 'Ich lege das Geld der Größe nach. Fang beim größten an und zähle weiter.',
      modelSay: () => `Schau: ${cs} Das sind ${euro(ans)}.`,
      onWrong: async (item, tile, wrongs) => {
        if (wrongs === ha) sortBox(box);
        else if (wrongs === ha + 1) { counted = true; await showCount(ctx, box, 300); }
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(500);
  }

  /* ==================================================================
     Vergleichen: Wer hat mehr Geld?
     ================================================================== */
  async function vergleichTask(ctx, t) {
    // Mia/Ben zufällig der „wenige große“ oder der „viele kleine“ Geldbeutel
    const swap = U.chance(0.5);
    const kids = [
      { name: 'Mia', e: '👧', vals: swap ? t.b : t.a },
      { name: 'Ben', e: '👦', vals: swap ? t.a : t.b },
    ];
    kids.forEach((k) => { k.s = sum(k.vals); });
    const [A, B] = kids;
    const equal = A.s === B.s;
    const winner = equal ? null : A.s > B.s ? A : B;
    const loser = equal ? null : winner === A ? B : A;
    const rows = [];
    const items = kids.map((k) => {
      const row = el('div.kau-row.kau-purse-row', ...U.shuffle(k.vals.slice()).map(piece));
      rows.push(row);
      k.row = row;
      const content = el('span.kau-purse', el('span.kau-purse-who', U.emoji(k.e), el('span.kau-purse-name', k.name)), row);
      return { content, correct: winner === k, say: k.name, kid: k, className: 'kau-purse-tile' };
    });
    items.push({ content: el('span.kau-purse.kau-equal', U.emoji('⚖️'), el('span.kau-purse-name', 'gleich viel')), correct: equal, say: 'gleich viel', kid: null, className: 'kau-purse-tile kau-equal-tile' });

    const question = 'Wer hat mehr Geld? Mia oder Ben? Oder haben beide gleich viel?';
    ctx.setInstruction(question);
    const choiceP = ctx.choices(items, {
      shuffle: false,
      hintAfter: 1,
      praise: false,
      className: 'kau-purses',
      correctSay: () => {
        const facts = `Mia hat ${euro(A.s)}, Ben hat ${euro(B.s)}.`;
        if (ctx.wrongCount === 0 && U.chance(0.3)) return `${U.pickFresh('kau-proc-v', ['Super! Du hast nicht die Münzen gezählt, sondern die Euro.', 'Klasse! Du hast bei beiden genau nachgezählt.'], 1)} ${facts}`;
        return `${U.pickFresh('kau-ok', ['Richtig', 'Genau', 'Super', 'Stimmt'], 2)}! ${facts}`;
      },
      explain: (item) => {
        const k = item.kid;
        if (!k) return 'Fast! Zähle bei beiden nach. Es ist nicht gleich viel.';
        const other = k === A ? B : A;
        if (k.vals.length > other.vals.length) return `Fast! ${k.name} hat mehr Geldstücke. Aber zähle, wie viel Euro es sind!`;
        return equal ? 'Fast! Zähle bei beiden die Euro ganz genau.' : `Schau mal: Zähle bei ${k.name} und bei ${other.name} die Euro.`;
      },
      hintSay: () => 'Tipp: Ich lege das Geld der Größe nach. Fang beim größten Geld an und zähle weiter. Erst bei Mia, dann bei Ben.',
      modelSay: () => (equal
        ? `Schau: Mia hat ${euro(A.s)}. Ben hat auch ${euro(B.s)}. Beide haben gleich viel.`
        : `Schau: ${winner.name} hat ${euro(winner.s)}. ${loser.name} hat nur ${euro(loser.s)}. ${winner.name} hat mehr Geld.`),
      onCorrect: () => { rows.forEach((r) => showCount(ctx, r, 160)); },
      onWrong: async (item, tile, wrongs) => {
        if (wrongs === 1) rows.forEach(sortBox);
        else if (wrongs >= 2) await Promise.all(rows.map((r) => showCount(ctx, r, 220)));
      },
    });
    await ctx.say(question);
    await choiceP;
    if (!ctx.active) return;
    await ctx.sleep(500);
  }

  /* ==================================================================
     Rückgeld: Wie viel bekommst du zurück?
     ================================================================== */
  async function rueckTask(ctx, t) {
    const good = goodFor(t.price);
    const change = t.t;
    const back = el('div.kau-row.kau-back');
    const backBox = el('div.kau-backbox', el('span.kau-small', 'zurück:'), back, el('b.kau-q', '?'));
    const scene = el('div.kau-scene',
      shopCard(good, t.price),
      el('div.kau-paid', el('span.kau-small', 'Du gibst'), el('div.kau-row', piece(t.paid))),
    );
    const steps = el('div.kau-steps');
    ctx.stage.append(scene, backBox, steps);

    const question = `${The(good)} kostet ${euro(t.price)}. Du bezahlst mit ${euro(t.paid)}. Wie viel Geld bekommst du zurück?`;
    await ctx.instruct(question);
    if (!ctx.active) return;

    const values = LT.z2.options(change, 4, 1, 20, [t.price, change + 1, change - 1, t.paid]);
    const items = values.map((k) => ({ content: lbl(k), text: true, correct: k === change, say: euro(k), value: k, className: 'kau-num' }));
    const ha = LT.z2.hintAfterFor(ctx, items.length);

    function showSteps() {
      if (steps.childElementCount) return;
      steps.appendChild(el('span.kau-step.is-start', String(t.price)));
      range(t.price + 1, t.paid).forEach((x, i) => {
        const c = el('span.kau-step', String(x));
        steps.appendChild(c);
        ctx.timeout(() => c.classList.add('is-on'), 160 * i);
      });
    }
    function showBack() {
      backBox.querySelector('.kau-q').remove();
      desc(greedy(change, [1, 2, 5, 10])).forEach((v, i) => ctx.timeout(() => back.appendChild(piece(v)), 160 * i));
      backBox.classList.add('is-done');
    }
    const PROC = [
      'Super! Du hast vom Preis aus weitergezählt. So rechnen Kassierer.',
      'Klasse! Du hast ergänzt bis zum Schein. Sehr schlau!',
    ];
    await ctx.choices(items, {
      shuffle: false,
      size: 'small',
      hintAfter: ha,
      praise: false,
      onCorrect: () => showBack(),
      correctSay: () => {
        const check = `${W(t.price)} plus ${w(change)} ist ${w(t.paid)}.`;
        if (ctx.wrongCount === 0 && U.chance(0.3)) return `${U.pickFresh('kau-proc-r', PROC, 1)} ${check}`;
        return `${U.pickFresh('kau-ok', ['Richtig', 'Genau', 'Super', 'Stimmt'], 2)}, ${euro(change)} zurück! ${check}`;
      },
      explain: (item) => {
        const k = item.value;
        if (k === t.price) return `Fast! ${Euro(t.price)} kostet ${good.a} ${good.k}. Wir suchen das Geld, das du zurückbekommst.`;
        if (k === t.paid) return `Fast! ${Euro(t.paid)} hast du gegeben. Du bekommst nur einen Teil davon zurück.`;
        return `Schau mal: Rechne ${w(t.price)} plus ${w(k)}. Kommst du genau auf ${w(t.paid)}?`;
      },
      hintSay: () => `Tipp: Zähle vom Preis aus weiter bis ${w(t.paid)}.`,
      modelSay: () => countUpSay(t.price, t.paid),
      onWrong: async (item, tile, wrongs) => {
        if (wrongs >= ha) showSteps();
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(600);
  }
})();
