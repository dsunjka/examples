/* ==========================================================================
   Spiel „Rechenrakete“ 🚀 (Rechenschule, Klasse 1) – Plus und Minus bis 20
   OHNE Zehnerübergang über die Analogie: 3 + 4 = 7  →  13 + 4 = 17.

   Didaktik:
   - Paar-Aufgaben: Zuerst rechnet das Kind die „kleine Schwester“ (3 + 4),
     dann die „große Schwester“ (13 + 4). Die beiden Rechnungen stehen
     stellengerecht untereinander; der Zehner (blau) ist das Einzige, was
     dazukommt. Merksatz: „Der Zehner bleibt einfach dabei.“
   - Bildstütze: Zehnerstange (blau) + Einerwürfel (rot / grün). Beim Minus
     werden nur Einer weggenommen (durchgestrichen).
   - Jede gelöste Aufgabe lässt die Rakete am Rand ein Stück höher steigen,
     am Ende der Runde ist sie beim Mond.
   - Stufen:
       1  Plus, Einer-Analogie mit Bild (Zehnerstange bleibt liegen), 3 Antworten
       2  Plus ohne Bild (auch 10 + 4 ↔ 0 + 4), 4 Antworten
       3  Minus-Analogie 7 − 4 → 17 − 4
       4  Plus und Minus gemischt, Antwort über Zahlentasten (freie Eingabe)
       5  Platzhalter 12 + _ = 16 / 18 − _ = 13 mit Zahlentasten; die kleine
          Schwester erscheint nur noch als Hilfe (Ende Klasse 1)
   - Fehlvorstellungen und Hilfe-Leiter:
       • Zehner vergessen (13 + 4 = 7) bzw. Zehner als „eins“ (13 + 4 = 8):
         gezielte Erklärung; 2. Hilfe: Bild mit grauem, schlafendem Zehner
         „Der Zehner schläft, rechne nur die Einer.“; 3. Hilfe: Flo rechnet
         vor (Einer, dann wacht der Zehner auf).
       • Minus: Zehner mit weggenommen (17 − 4 = 3), Zeichen verwechselt.
       • Platzhalter: Ergebnis abgeschrieben (12 + _ = 16 → 16).
   - Anpassung in der Runde: ctx.flow < 0 → kleinere Zahlen, Bild von Anfang
     an, auf Stufe 5 wieder mit kleiner Schwester; ctx.flow > 0 (ab Stufe 2)
     → die kleine Schwester erscheint erst als Hilfe.
   - Lerninhalte (ctx.item): '13 + 4', '17 - 4', '12 + _ = 16', '18 - _ = 13'.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* ---------------- Zahlwörter (TTS-freundlich, auch über zwanzig) ---------------- */
  const ONES = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  function w(n) {
    if (n >= 0 && n <= 20) return U.numberWord(n);
    if (n > 20 && n < 100) {
      const t = Math.floor(n / 10);
      const o = n % 10;
      return o ? `${ONES[o]}und${TENS[t]}` : TENS[t];
    }
    return U.numberWord(n);
  }
  const W = (n) => U.cap(w(n));
  const opWord = (op) => (op === '+' ? 'plus' : 'minus');
  const opSign = (op) => (op === '+' ? '+' : '−');

  /* ---------------- Aufgaben-Pools ---------------- */
  // Paar: a = 10 + e, b einstellig, Ergebnis ohne Zehnerübergang
  function pairPlus(minE, maxE, maxSum, maxB) {
    const out = [];
    for (let e = minE; e <= maxE; e++) {
      for (let b = 1; b <= Math.min(maxB, maxSum - e); b++) {
        out.push({ kind: 'pair', op: '+', e, b, a: 10 + e, r: e + b, R: 10 + e + b, k: `${10 + e} + ${b}` });
      }
    }
    return out;
  }
  function pairMinus(minE, maxE) {
    const out = [];
    for (let e = minE; e <= maxE; e++) {
      for (let b = 1; b <= e; b++) {
        out.push({ kind: 'pair', op: '-', e, b, a: 10 + e, r: e - b, R: 10 + e - b, k: `${10 + e} - ${b}` });
      }
    }
    return out;
  }
  // Platzhalter: a op x = c; gesucht x
  function gapPlus() {
    const out = [];
    for (let e = 1; e <= 7; e++) {
      for (let x = 2; x <= 9 - e; x++) {
        const c = 10 + e + x;
        out.push({ kind: 'gap', op: '+', e, b: x, a: 10 + e, c, ce: e + x, R: x, k: `${10 + e} + _ = ${c}` });
      }
    }
    return out;
  }
  function gapMinus() {
    const out = [];
    for (let e = 3; e <= 9; e++) {
      for (let x = 1; x <= e - 1; x++) {
        const c = 10 + e - x;
        out.push({ kind: 'gap', op: '-', e, b: x, a: 10 + e, c, ce: e - x, R: x, k: `${10 + e} - _ = ${c}` });
      }
    }
    return out;
  }
  const POOL = {
    1: pairPlus(1, 7, 9, 6),
    1.5: pairPlus(1, 5, 6, 4), // leichter (flow < 0)
    2: pairPlus(0, 8, 9, 9),
    3: pairMinus(2, 9),
    3.5: pairMinus(2, 6).filter((t) => t.b <= 3),
    4: pairPlus(0, 8, 9, 9).concat(pairMinus(2, 9)),
    5: gapPlus().concat(gapMinus()),
  };

  const INTRO = {
    1: 'Jede große Aufgabe hat eine kleine Schwester. Zuerst rechnest du die kleine. Dann kommt ein Zehner dazu. Der Zehner bleibt einfach liegen.',
    2: 'Jetzt ohne Würfel! Die kleine Schwester hilft dir. Die große geht genauso, nur mit einem Zehner mehr.',
    3: 'Jetzt kommt Minus! Wir nehmen nur Einer weg. Der Zehner bleibt liegen.',
    4: 'Jetzt kommt Plus und Minus gemischt. Schau gut auf das Zeichen! Die Antwort tippst du selbst mit den Zahlentasten.',
    5: 'Jetzt fehlt eine Zahl in der Mitte! Wie viele kommen dazu, oder wie viele gehen weg? Tippe die fehlende Zahl.',
  };
  let introduced = new Set();

  /* ---------------- Sätze ---------------- */
  const OK = ['Richtig', 'Genau', 'Super', 'Stimmt', 'Klasse'];
  const okWord = () => U.pickFresh('rec-ok', OK, 3);

  /** Gesprochene Aufgabe (nur Wörter, keine Zeichen). big = mit Zehner. */
  function spoken(t, big) {
    const a = big ? t.a : t.e;
    if (t.kind === 'gap') {
      const c = big ? t.c : t.ce;
      return `${W(a)} ${opWord(t.op)} wie viel ist ${w(c)}?`;
    }
    return `${W(a)} ${opWord(t.op)} ${w(t.b)}.`;
  }
  /** Fertiger Rechensatz. */
  function sentence(t, big) {
    const a = big ? t.a : t.e;
    if (t.kind === 'gap') return `${W(a)} ${opWord(t.op)} ${w(t.b)} ist ${w(big ? t.c : t.ce)}.`;
    return `${W(a)} ${opWord(t.op)} ${w(t.b)} ist ${w(big ? t.R : t.r)}.`;
  }
  const smallAnswer = (t) => (t.kind === 'gap' ? t.b : t.r);

  /** Erklärung zur kleinen Schwester (ohne Lösung). */
  function explainSmall(v, t) {
    const ans = smallAnswer(t);
    if (t.kind === 'gap') {
      if (v === t.ce) return `Fast! ${W(t.ce)} soll am Ende herauskommen. Wie viele ${t.op === '+' ? 'kommen dazu' : 'gehen weg'}?`;
      return `Fast! Es sind ${v > ans ? 'weniger' : 'mehr'} als ${w(v)}.`;
    }
    if (t.op === '+' && v === t.e - t.b && t.e >= t.b) return 'Schau aufs Zeichen: Plus heißt dazu. Dann werden es mehr.';
    if (t.op === '-' && v === t.e + t.b) return 'Schau aufs Zeichen: Minus heißt wegnehmen. Dann werden es weniger.';
    if (v === t.e) return `${W(t.e)} ist die Zahl vom Anfang. Es ${t.op === '+' ? 'kommen' : 'gehen'} noch ${w(t.b)} ${t.op === '+' ? 'dazu' : 'weg'}.`;
    return `Fast! Es sind ${v > ans ? 'weniger' : 'mehr'} als ${w(v)}.`;
  }
  /** Erklärung zur großen Schwester: benennt die Fehlvorstellung, verrät aber nicht die Lösung. */
  function explainBig(v, t) {
    const R = t.R;
    if (t.kind === 'gap') {
      if (v === t.c) return `Fast! ${W(t.c)} soll am Ende ${t.op === '+' ? 'herauskommen' : 'übrig bleiben'}. Wie viele ${t.op === '+' ? 'kommen dazu' : 'gehen weg'}?`;
      if (v === R + 10) return `Schau mal: Der Zehner bleibt liegen. Es ${t.op === '+' ? 'kommen' : 'gehen'} nur Einer ${t.op === '+' ? 'dazu' : 'weg'}.`;
      if (t.op === '+' && v === t.a + t.c) return 'Du hast alles zusammengezählt. Wir suchen nur, wie viele dazukommen.';
      if (t.op === '+' && v === t.c % 10 && v !== R) return `Schau mal: ${W(t.a)} hat schon ${w(t.e)} Einer. Wie viele fehlen noch?`;
      if (t.op === '-' && v === t.e && v !== R) return `Dann bliebe nur der Zehner übrig. Es gehen weniger weg.`;
      return `Fast! Es sind ${v > R ? 'weniger' : 'mehr'} als ${w(v)}.`;
    }
    if (t.op === '+') {
      if (v === t.r) return `Fast! ${W(t.r)} ist die kleine Schwester. Bei ${w(t.a)} liegt noch ein Zehner dabei. Der muss mit.`;
      if (t.e > 0 && v === t.r + 1) return 'Schau mal: Die Eins vorne ist ein ganzer Zehner, nicht nur eins. Rechne die Einer, dann kommt der Zehner dazu.';
      if (v === R + 10) return 'Hmm, du hast den Zehner zweimal gezählt. Es gibt nur einen Zehner.';
      if (v === t.a) return `${W(t.a)} ist die Zahl vom Anfang. Es kommen noch ${w(t.b)} dazu.`;
      if (v === t.a - t.b && t.a >= t.b) return 'Schau aufs Zeichen: Plus heißt dazu. Dann werden es mehr.';
      return `Fast! Es sind ${v > R ? 'weniger' : 'mehr'} als ${w(v)}.`;
    }
    if (v === t.r && t.r !== R) return 'Fast! Der Zehner geht nicht weg. Wir nehmen nur Einer weg. Der Zehner bleibt liegen.';
    if (v === t.a + t.b) return 'Schau aufs Zeichen: Minus heißt wegnehmen. Dann werden es weniger.';
    if (v === t.a) return `${W(t.a)} ist die Zahl vom Anfang. Es gehen noch ${w(t.b)} weg.`;
    return `Fast! Es sind ${v > R ? 'weniger' : 'mehr'} als ${w(v)}.`;
  }
  function hintSmall(t) {
    if (t.kind === 'gap') return `Tipp: Fang bei ${w(t.e)} an. Wie viele Schritte ${t.op === '+' ? 'weiter' : 'zurück'} bis ${w(t.ce)}?`;
    if (t.e === 0) return `Tipp: Am Anfang ist nichts da. Dann kommen ${w(t.b)} dazu.`;
    return `Tipp: Fang bei ${w(t.e)} an und zähle ${w(t.b)} ${t.op === '+' ? 'weiter' : 'zurück'}.`;
  }
  function modelSmall(t) {
    return `Schau: ${sentence(t, false)} Tipp die ${w(smallAnswer(t))} an.`;
  }
  function hintBig(t) {
    if (t.kind === 'gap') {
      return `Der Zehner schläft. Schau nur auf die Einer: ${w(t.e)} ${opWord(t.op)} wie viel ist ${w(t.ce)}?`;
    }
    if (t.e === 0) return `Der Zehner schläft. Rechne nur die Einer: null plus ${w(t.b)}. Dann wacht der Zehner wieder auf.`;
    return `Der Zehner schläft. Rechne nur die Einer: ${w(t.e)} ${opWord(t.op)} ${w(t.b)}. Dann wacht der Zehner wieder auf.`;
  }
  function modelBig(t) {
    if (t.kind === 'gap') {
      return `${sentence(t, false)} Der Zehner bleibt dabei. Also: ${sentence(t, true)} Es sind ${w(t.b)}.`;
    }
    const first = sentence(t, false);
    if (t.r === 0) return `${first} Es bleibt nur der Zehner. Das ist zehn.`;
    return `${first} Der Zehner wacht auf: zehn und ${w(t.r)} ist ${w(t.R)}.`;
  }
  function procPraise(t) {
    if (t.kind === 'gap') {
      return U.pickFresh('rec-proc-gap', [
        'Du hast bei den Einern geschaut, wie viele fehlen. Sehr schlau!',
        'Super gedacht! Der Zehner bleibt, und du hast nur die Einer verglichen.',
      ], 1);
    }
    if (t.op === '-') {
      return U.pickFresh('rec-proc-minus', [
        'Du hast nur die Einer weggenommen. Der Zehner ist geblieben. Super gedacht!',
        'Klasse! Du hast die kleine Schwester als Trick benutzt.',
      ], 1);
    }
    return U.pickFresh('rec-proc-plus', [
      'Du hast die kleine Schwester als Trick benutzt. Sehr schlau!',
      'Der Zehner hat geschlafen, und du hast nur die Einer gerechnet. Klasse!',
      'Super! Du hast nicht gezählt, sondern die kleine Aufgabe benutzt.',
    ], 1);
  }

  /* ---------------- Antwortmöglichkeiten ---------------- */
  function options(n, count, prefer, lo, hi) {
    const set = new Set([n]);
    for (const p of prefer) {
      if (set.size >= count) break;
      if (p >= lo && p <= hi) set.add(p);
    }
    for (const x of U.shuffle([n + 1, n - 1, n + 2, n - 2, n + 3])) {
      if (set.size >= count) break;
      if (x >= lo && x <= hi) set.add(x);
    }
    let guard = 0;
    while (set.size < count && guard++ < 100) set.add(U.randInt(lo, hi));
    return Array.from(set).sort((x, y) => x - y);
  }
  function preferSmall(t) {
    if (t.kind === 'gap') return [t.ce, t.b + 1, t.b - 1];
    return t.op === '+' ? [t.e - t.b, t.r + 1, t.r - 1] : [t.e + t.b, t.r + 1, t.r - 1];
  }
  function preferBig(t) {
    if (t.kind === 'gap') return [t.c, t.b + 10, t.b + 1, t.b - 1];
    return t.op === '+'
      ? (t.e > 0 ? [t.r, t.r + 1, t.R + 1, t.R - 1] : [t.r, t.R + 1, t.R - 1])
      : [t.r, t.R + 1, t.R - 1, t.a + t.b];
  }

  /* ---------------- Bausteine der Oberfläche ---------------- */
  function sky(progress) {
    const rocket = el('span.rec-rocket', { 'aria-hidden': 'true' }, el('span.rec-rocket-e', '🚀'), el('span.rec-flame'));
    const node = el('div.rec-sky', { 'aria-hidden': 'true' },
      el('span.rec-moon', '🌙'),
      el('span.rec-star.s1', '✦'), el('span.rec-star.s2', '✦'), el('span.rec-star.s3', '✦'),
      el('div.rec-track', rocket));
    const set = (p) => { rocket.style.setProperty('--rec-p', String(Math.max(0, Math.min(1, p)))); };
    set(progress);
    return { node, rocket, set };
  }

  /** Eine Zeile der Rechentafel. big = mit Zehner. Liefert {row, slot, setSlot}. */
  function eqRow(t, big) {
    const a = big ? t.a : t.e;
    const cell = (txt, cls = '') => el('span', { class: 'rec-c ' + cls }, txt);
    const cells = [];
    // erste Zahl: Zehner + Einer stellengerecht
    cells.push(cell(big ? '1' : '', 'rec-t' + (big ? ' rec-ten' : '')));
    cells.push(cell(String(a % 10), 'rec-o rec-one'));
    cells.push(cell(opSign(t.op), 'rec-op'));
    let slot;
    if (t.kind === 'gap') {
      slot = el('span.rec-c.rec-slot.rec-slot1', '?');
      cells.push(slot);
      cells.push(cell('=', 'rec-op'));
      const c = big ? t.c : t.ce;
      cells.push(cell(c >= 10 ? '1' : '', 'rec-t' + (c >= 10 ? ' rec-ten' : '')));
      cells.push(cell(String(c % 10), 'rec-o rec-one'));
    } else {
      cells.push(cell(String(t.b), 'rec-one rec-b'));
      cells.push(cell('=', 'rec-op'));
      slot = el('span.rec-c.rec-slot.rec-slot2', '?');
      cells.push(slot);
    }
    const label = big ? 'Große Schwester' : 'Kleine Schwester';
    const row = el('div', { class: 'rec-row ' + (big ? 'rec-big' : 'rec-small'), role: 'img', 'aria-label': label }, ...cells);
    const setSlot = (txt, done) => {
      slot.textContent = txt;
      slot.classList.toggle('rec-filled', txt !== '?' && txt !== '');
      slot.classList.toggle('rec-done', !!done);
      // Zehner-Ziffer im Ergebnis blau färben
      if (t.kind !== 'gap') {
        U.clear(slot);
        if (txt.length === 2) slot.append(el('span.rec-ten', txt[0]), el('span', txt[1]));
        else slot.textContent = txt;
      }
    };
    return { row, slot, setSlot };
  }

  /** Bild: Zehnerstange + Einerwürfel (in Fünfer-Säulen). */
  function picture(t) {
    const node = el('div.rec-pic', { 'aria-hidden': 'true' });
    const bar = el('div.rec-bar');
    for (let i = 0; i < 10; i++) bar.appendChild(el('i'));
    const zz = el('span.rec-zz', '💤');
    const barWrap = el('div.rec-barwrap', bar, zz);
    const cols = (n, cls) => {
      const g = el('div.rec-grp');
      const cubes = [];
      for (let c = 0; c < Math.ceil(n / 5); c++) {
        const col = el('div.rec-col');
        for (let i = c * 5; i < Math.min(n, c * 5 + 5); i++) {
          const cube = el('i', { class: 'rec-cube ' + cls });
          cubes.push(cube);
          col.appendChild(cube);
        }
        g.appendChild(col);
      }
      return { g, cubes };
    };
    let g1;
    let g2 = null;
    if (t.op === '+') {
      const first = t.e;
      g1 = cols(first, 'r');
      g2 = cols(t.b, t.kind === 'gap' ? 'g q' : 'g');
    } else {
      // Minus: e Würfel, die letzten b werden weggenommen
      g1 = cols(t.e, 'r');
      g1.cubes.slice(t.e - t.b).forEach((c) => c.classList.add(...(t.kind === 'gap' ? ['x', 'q'] : ['x'])));
    }
    node.appendChild(barWrap);
    if (g1.cubes.length) node.appendChild(g1.g);
    if (g2) {
      if (g1.cubes.length) node.appendChild(el('span.rec-plus', '+'));
      node.appendChild(g2.g);
    }
    return {
      node,
      showTen(on) { node.classList.toggle('rec-noten', !on); },
      sleep(on) { node.classList.toggle('rec-sleep', on); },
      glowOnes(on) { node.classList.toggle('rec-glow-ones', on); },
      reveal() { node.classList.add('rec-solved'); },
    };
  }

  /* ---------------- Zahlentasten (freie Eingabe) ---------------- */
  /**
   * Eigene Bedienung: Ziffern tippen, ⌫ löschen, ✓ prüfen. Hilfe-Leiter je
   * Schritt (hintAfter 2): 1. Fehler erklären, 2. Fehler Denkanstoß + Bild,
   * 3. Fehler vormachen (Tasten leuchten). Löst mit true (erster Versuch) auf.
   */
  function keypad(ctx, host, answer, ui) {
    return new Promise((resolve) => {
      let val = '';
      let busy = false;
      let finished = false;
      let localWrong = 0;
      const keys = {};
      const pad = el('div.rec-keys');
      const show = () => ui.setSlot(val === '' ? '?' : val, false);
      const press = (k) => {
        if (busy || finished || !ctx.active) return;
        LT.sfx.play('tap');
        if (k === 'del') val = val.slice(0, -1);
        else if (k === 'ok') { check(); return; } else if (val.length < 2) val = (val === '0' ? '' : val) + k;
        show();
      };
      const mk = (k, label, cls, aria) => {
        const b = el('button', { type: 'button', class: 'rec-key ' + (cls || ''), 'aria-label': aria || label }, label);
        ctx.listen(b, 'click', () => press(k));
        keys[k] = b;
        pad.appendChild(b);
      };
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach((d) => mk(d, d, '', w(+d)));
      mk('del', '⌫', 'rec-key-del', 'Löschen');
      mk('0', '0', '', 'null');
      mk('ok', '✓', 'rec-key-ok', 'Fertig');
      host.appendChild(pad);

      const unhintAll = () => Object.values(keys).forEach((b) => ctx.unhint(b));
      function hintDigits() {
        unhintAll();
        const s = String(answer);
        const next = s.startsWith(val) && val.length < s.length ? s[val.length] : null;
        if (next) ctx.hint(keys[next]);
        else if (val === s) ctx.hint(keys.ok);
        else ctx.hint(keys.del);
      }
      let modeled = false;

      async function check() {
        if (busy || finished) return;
        if (val === '') {
          busy = true;
          ctx.hint(keys['1']);
          await ctx.say('Tippe zuerst eine Zahl. Dann tippst du auf den Haken.');
          ctx.unhint(keys['1']);
          busy = false;
          return;
        }
        const v = parseInt(val, 10);
        busy = true;
        if (v === answer) {
          finished = true;
          unhintAll();
          ctx.testSolve(null);
          ui.setSlot(String(answer), true);
          pad.classList.add('rec-locked');
          const first = localWrong === 0;
          if (ui.onCorrect) await ui.onCorrect(first);
          resolve(first);
          return;
        }
        localWrong++;
        await ctx.wrong(ui.row, { say: ui.explain(v), keep: true });
        if (!ctx.active) return;
        val = '';
        show();
        if (localWrong === 2) {
          if (ui.onHint) ui.onHint();
          await ctx.say(ui.hintSay());
        } else if (localWrong >= 3) {
          modeled = true;
          if (localWrong === 3) {
            ctx.modelShown = true;
            if (ui.onModel) ui.onModel();
            await ctx.say(ui.modelSay());
          } else {
            await ctx.say(`Tippe ${w(answer)}.`);
          }
          if (!ctx.active) return;
          hintDigits();
        }
        busy = false;
      }
      // erst nach jeder Eingabe die nächste Taste zeigen (nach dem Vormachen)
      ctx.listen(pad, 'click', () => { if (modeled && !finished) ctx.timeout(hintDigits, 10); });

      ctx.testSolve(() => {
        if (finished) return;
        if (busy) return;
        val = String(answer);
        show();
        check();
      });
    });
  }

  /* ---------------- Ein Schritt mit Antwort-Kacheln ---------------- */
  async function choiceStep(ctx, host, opts) {
    const box = el('div.choices.rec-choices');
    host.appendChild(box);
    const values = options(opts.answer, opts.count, opts.prefer, 0, 20);
    const items = values.map((k) => ({ content: String(k), text: true, correct: k === opts.answer, say: w(k), value: k, className: 'rec-num' }));
    const shown = ctx.flow < 0 && items.length >= 4 ? items.length - 1 : items.length;
    const ha = shown <= 3 ? 1 : 2;
    let localWrong = 0;
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
      onCorrect: () => opts.ui.setSlot(String(opts.answer), true),
      onWrong: async () => {
        localWrong++;
        if (localWrong === 1 && opts.onFirstWrong) await opts.onFirstWrong();
        if (localWrong === ha && opts.onHint) opts.onHint();
        if (localWrong === ha + 1 && opts.onModel) opts.onModel();
      },
    });
    // alte Kacheln entfernen, damit der Testmodus nicht auf erledigte Markierungen tippt
    box.remove();
  }

  /* ------------------------------------------------------------------ */
  LT.registerGame({
    id: 'rechenrakete',
    area: 'mathe1',
    title: 'Rechenrakete',
    icon: '🚀',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Flos Rakete fliegt zum Mond! Jede gelöste Aufgabe bringt sie ein Stück höher.',
    parent: {
      skill: 'Plus und Minus bis 20 ohne Zehnerübergang (Analogie)',
      goal: 'Ihr Kind löst Aufgaben wie 13 + 4 oder 18 − 5 über die „kleine Schwester“ 3 + 4 bzw. 8 − 5: Der Zehner bleibt liegen, gerechnet wird nur mit den Einern (KMK: Zahlbeziehungen nutzen).',
      levels: [
        'Plus mit Bild: 3 + 4 → 13 + 4, Zehnerstange bleibt liegen',
        'Plus ohne Bild, auch 10 + 4',
        'Minus-Analogie: 7 − 4 → 17 − 4',
        'Plus und Minus gemischt, Antwort selbst eintippen',
        'Platzhalter: 12 + _ = 16 und 18 − _ = 13',
      ],
      tip: 'Typischer Fehler: 13 + 4 = 7 oder 8 (der Zehner wird vergessen oder als „eins“ gerechnet). Fragen Sie: „Was macht der Zehner?“ – „Er schläft und bleibt liegen.“ Legen Sie zu Hause 10 Gabeln als Bündel und einzelne Löffel dazu.',
    },

    async task(ctx) {
      const level = ctx.taskLevel;
      if (ctx.index === 0) introduced = new Set();

      const poolKey = level === 1 && ctx.flow < 0 ? 1.5 : level === 3 && ctx.flow < 0 ? 3.5 : level;
      const t = ctx.item(POOL[poolKey], (x) => x.k, { avoid: 6 });
      const pad = level >= 4; // Zahlentasten
      const withSister = level === 5 ? ctx.flow < 0 : !(level >= 2 && ctx.flow > 0);
      const picFromStart = level === 1 || (pad && ctx.flow < 0);

      ctx.stage.classList.add('rec-stage');
      const total = ctx.total || 6;
      const base = ctx.index / total;
      const step = 1 / total;
      const rocket = sky(base);
      const main = el('div.rec-main');
      const wrap = el('div.rec-wrap', main, rocket.node);
      ctx.stage.appendChild(wrap);

      const board = el('div.rec-board');
      const small = eqRow(t, false);
      const big = eqRow(t, true);
      board.append(small.row, big.row);
      const work = el('div.rec-work' + (pad ? '.rec-work-pad' : ''));
      const pic = picture(t);
      pic.showTen(false);
      if (!picFromStart) pic.node.classList.add('rec-hidden');
      work.appendChild(pic.node);
      main.append(board, work);

      const rise = (p) => {
        LT.sfx.play('whoosh');
        rocket.rocket.classList.add('rec-fly');
        rocket.set(p);
        ctx.timeout(() => rocket.rocket.classList.remove('rec-fly'), 900);
      };
      const showPic = (withTen) => {
        pic.node.classList.remove('rec-hidden');
        pic.showTen(withTen);
      };

      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }

      /* ---------- Schritt 1: kleine Schwester ---------- */
      if (withSister) {
        big.row.classList.add('rec-waiting');
        const q = `Die kleine Schwester: ${spoken(t, false)}${t.kind === 'gap' ? '' : ' Wie viel ist das?'}`;
        await ctx.instruct(q);
        if (!ctx.active) return;
        const okSmall = () => `${okWord()}! ${sentence(t, false)}`;
        const ans = smallAnswer(t);
        const common = {
          explain: (v) => explainSmall(v, t),
          hintSay: () => { showPic(false); return hintSmall(t); },
          modelSay: () => { showPic(false); pic.reveal(); return modelSmall(t); },
        };
        if (pad) {
          await keypad(ctx, work, ans, {
            row: small.row,
            setSlot: small.setSlot,
            explain: common.explain,
            hintSay: common.hintSay,
            modelSay: common.modelSay,
            onCorrect: async () => { await ctx.correct(small.row, { say: okSmall(), praise: false }); },
          });
          if (!ctx.active) return;
          const keysEl = work.querySelector('.rec-keys');
          if (keysEl) keysEl.remove();
        } else {
          await choiceStep(ctx, work, {
            answer: ans,
            count: level === 1 ? 3 : 4,
            prefer: preferSmall(t),
            ui: small,
            correctSay: okSmall,
            explain: common.explain,
            hintSay: common.hintSay,
            modelSay: common.modelSay,
          });
          if (!ctx.active) return;
        }
        rise(base + step * 0.5);
        await ctx.sleep(350);
        if (!ctx.active) return;
      } else {
        small.row.classList.add('rec-hidden');
      }

      /* ---------- Schritt 2: große Schwester ---------- */
      big.row.classList.remove('rec-waiting');
      big.row.classList.add('rec-active');
      if (!pic.node.classList.contains('rec-hidden')) {
        pic.showTen(true);
        pic.node.classList.add('rec-tenin');
      }
      let q;
      if (withSister) {
        q = picFromStart
          ? `Jetzt kommt ein Zehner dazu. Die große Schwester: ${spoken(t, true)}${t.kind === 'gap' ? '' : ' Wie viel ist das?'}`
          : `Und die große Schwester: ${spoken(t, true)}${t.kind === 'gap' ? '' : ' Wie viel ist das?'}`;
      } else {
        q = `${spoken(t, true)}${t.kind === 'gap' ? '' : ' Wie viel ist das?'}`;
      }
      await ctx.instruct(q);
      if (!ctx.active) return;

      // kleine Schwester als erste Hilfe zeigen (wenn sie noch fehlt)
      let sisterShown = withSister;
      const revealSister = () => {
        if (sisterShown) return false;
        sisterShown = true;
        small.row.classList.remove('rec-hidden');
        small.row.classList.add('rec-pop');
        small.setSlot(String(smallAnswer(t)), true);
        return true;
      };
      const correctBig = () => {
        if (ctx.wrongCount === 0 && U.chance(0.3)) return procPraise(t);
        return `${okWord()}! ${sentence(t, true)}`;
      };
      const explainB = (v) => {
        let s = explainBig(v, t);
        if (revealSister()) s += ' Schau, die kleine Schwester hilft dir.';
        return s;
      };
      const hintB = () => {
        revealSister();
        showPic(true);
        pic.sleep(true);
        return hintBig(t);
      };
      const modelB = () => {
        revealSister();
        showPic(true);
        pic.sleep(false);
        pic.reveal();
        pic.glowOnes(true);
        board.classList.add('rec-glow');
        return modelBig(t);
      };
      if (pad) {
        await keypad(ctx, work, t.R, {
          row: big.row,
          setSlot: big.setSlot,
          explain: explainB,
          hintSay: hintB,
          modelSay: modelB,
          onCorrect: async (first) => {
            await ctx.correct(big.row, { say: first ? correctBig() : `${okWord()}! ${sentence(t, true)}`, praise: false });
          },
        });
      } else {
        await choiceStep(ctx, work, {
          answer: t.R,
          count: level === 1 ? 3 : 4,
          prefer: preferBig(t),
          ui: big,
          correctSay: correctBig,
          explain: explainB,
          hintSay: hintB,
          modelSay: modelB,
        });
      }
      if (!ctx.active) return;

      /* ---------- Festigen: Einer gleich, Zehner kommt dazu ---------- */
      pic.sleep(false);
      revealSister();
      board.classList.add('rec-glow');
      if (ctx.wrongCount > 0 || ctx.index === 0) {
        await ctx.say(t.kind === 'gap'
          ? 'Siehst du? Bei den Einern ist es gleich. Der Zehner bleibt einfach dabei.'
          : 'Siehst du? Die Einer sind gleich. Der Zehner bleibt einfach dabei.');
        if (!ctx.active) return;
      }
      rise(base + step);
      await ctx.sleep(700);
      if (!ctx.active) return;
      if (ctx.index === total - 1) {
        rocket.node.classList.add('rec-arrived');
        LT.sfx.play('star');
        await ctx.say('Hurra! Die Rakete ist beim Mond angekommen!');
        if (!ctx.active) return;
      }
      await ctx.sleep(300);
    },
  });
})();
