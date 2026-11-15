/* ==========================================================================
   Spiel „Zehnerfeld-Blitz“ 🔟 (Rechenschule, Klasse 1) – Anzahlen bis 20
   strukturiert erfassen: Kraft der Fünf, Zehnerfeld, Zwanzigerfeld.

   Didaktik:
   - Ein Zehner- oder Zwanzigerfeld blitzt kurz auf. Weil keine Zeit zum
     Abzählen bleibt, lernt das Kind, die STRUKTUR zu nutzen: „Eine volle
     Reihe sind fünf, und noch drei“ bzw. „Das obere Feld ist voll, das sind
     zehn, und noch drei: dreizehn“. Das ist die Grundlage für den
     Zehnerübergang (7 + 6 = 7 + 3 + 3).
   - Zwei Bedienarten: Zahl antippen (Blitz) und selbst legen (Plättchen ins
     Feld tippen, mit Fünfer- und Zehnerstreifen als Abkürzung). Beim
     Nachlegen (Stufe 2) wird das Gesehene aus dem Gedächtnis gelegt.
   - Stufen:
       1  Zehnerfeld 3 bis 10, geordnet, 2 s sichtbar; dazu „Lege die Zahl“
          (Brücke aus der Vorschule, vgl. Blitzblick)
       2  Zehnerfeld 1 bis 10, nur 1 s; dazu „Lege nach, was du gesehen hast“
       3  Zwanzigerfeld 11 bis 20: oben ein volles Zehnerfeld + Rest;
          dazu „Lege die Zahl“ mit dem Zehnerstreifen
       4  Zwanzigerfeld in zwei Farben (z. B. 7 rot oben + 6 blau unten):
          Wie viele zusammen? Strategie „erst die Zehn voll machen“
          (nach der Lösung wandern blaue Plättchen nach oben)
       5  „Wie viele fehlen bis 10 / bis 20?“ (Ergänzen, Ende Klasse 1)
   - Lerninhalte (ctx.item): 'Feld 7', 'Feld 13', 'Lege 8', 'Nachlegen 6',
     '7 + 6', '13 bis 20'.
   - Hilfe-Leiter (Antwort-Kacheln): 1. Fehler → erklärt die typische
     Verwechslung („Das ist nur das untere Feld …“) bzw. mehr/weniger;
     2. Fehler → Karte bleibt offen + Strategie-Anstoß; 3. Fehler → Flo
     zeigt die Struktur (Reihen leuchten, Zehn wird voll gemacht) und sagt
     den Rechensatz. Beim Legen genauso über ctx.helpStep; zum Schluss legt
     Flo vor und das Kind tippt auf „Fertig“.
   - Innerhalb der Runde: ctx.taskLevel; ctx.flow < 0 → länger sichtbar und
     leichtere Inhalte, ctx.flow > 0 → kürzer sichtbar, schwerere Inhalte.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = LT.z2;

  const w = (n) => U.numberWord(n);
  const W = (n) => U.cap(U.numberWord(n));
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };

  /* ------------------------------------------------------------------
     Stufen
     ------------------------------------------------------------------ */
  const SHOW = { 1: 2000, 2: 1000, 3: 2000, 4: 3500, 5: 2600 };
  const ROUNDS = 6;

  /** Aufgabenart je Stufe und Aufgabe (jede dritte Aufgabe wird gelegt). */
  function kindFor(level, index) {
    const build = index % 3 === 2;
    if (level === 1) return build ? 'lege' : 'ten';
    if (level === 2) return build ? 'nach' : 'ten';
    if (level === 3) return build ? 'lege' : 'twenty';
    if (level === 4) return 'pair';
    return 'miss';
  }

  const INTRO = {
    1: 'Im Zehnerfeld passen oben fünf und unten fünf. Gleich blitzt es kurz auf. Erkenne die Zahl, ohne zu zählen!',
    2: 'Jetzt wird es blitzschnell! Das Zehnerfeld ist nur ganz kurz zu sehen. Denk an die volle Fünferreihe.',
    3: 'Jetzt kommt das Zwanzigerfeld! Es hat zwei Zehnerfelder. Ist das obere Feld voll, sind das schon zehn.',
    4: 'Jetzt gibt es rote und blaue Plättchen. Wie viele sind es zusammen? Tipp: Mach im Kopf erst die Zehn voll.',
    5: 'Jetzt wird es knifflig! Wie viele fehlen noch bis zehn oder bis zwanzig? Schau auf die leeren Kästchen.',
  };
  const KIND_INTRO = {
    lege: 'Jetzt legst du selbst! Tippe auf die Kästchen. Mit dem Fünferstreifen geht es schneller. Dann tippst du auf Fertig.',
    lege20: 'Jetzt legst du im Zwanzigerfeld! Mit dem Zehnerstreifen füllst du ein ganzes Feld auf einmal.',
    nach: 'Jetzt legst du nach! Schau dir das Feld gut an. Dann legst du genau so viele Plättchen.',
  };

  /* ------------------------------------------------------------------
     Felder bauen
     ------------------------------------------------------------------ */
  /** spec: Array mit 10 oder 20 Einträgen 'r' | 'b' | ''. */
  function makeField(spec, interactive) {
    const size = spec.length;
    const node = el('div', { class: 'zeh-field' + (size === 20 ? ' is-twenty' : '') + (interactive ? ' is-build' : '') });
    const cells = [];
    const toks = [];
    const frames = [];
    for (let f = 0; f < size / 10; f++) {
      const fr = el('div.zeh-frame');
      for (let i = 0; i < 10; i++) {
        const idx = f * 10 + i;
        const tok = el('i', { class: 'zeh-tok ' + (spec[idx] || '') });
        const cell = interactive
          ? el('button.zeh-cell', { type: 'button', 'aria-label': 'Kästchen' }, tok)
          : el('span.zeh-cell', tok);
        cell._idx = idx;
        fr.appendChild(cell);
        cells.push(cell);
        toks.push(tok);
      }
      frames.push(fr);
      node.appendChild(fr);
    }
    if (!interactive) node.setAttribute('aria-hidden', 'true');
    return { node, cells, toks, frames, size };
  }
  const setTok = (tok, kind) => {
    tok.classList.remove('r', 'b', 'g');
    if (kind) tok.classList.add(kind);
  };
  const isOn = (tok) => tok.classList.contains('r') || tok.classList.contains('b');
  const ordered = (n, size, color = 'r') => Array.from({ length: size }, (_, i) => (i < n ? color : ''));
  /** Zellen einer Reihe (Reihe 0..3, je fünf Kästchen). */
  const rowCells = (field, r) => field.cells.slice(r * 5, r * 5 + 5);
  function glow(cells, cls = 'zeh-hl') { cells.forEach((c) => c.classList.add(cls)); }
  function unglow(field) { field.cells.forEach((c) => c.classList.remove('zeh-hl', 'zeh-hl2')); }

  /* ------------------------------------------------------------------
     Sätze zur Struktur (TTS-freundlich: nur Zahlwörter)
     ------------------------------------------------------------------ */
  function tenSay(n) {
    if (n < 5) return `${W(n)} in der oberen Reihe. Die Reihe ist noch nicht voll.`;
    if (n === 5) return 'Die obere Reihe ist voll. Das sind fünf.';
    if (n === 10) return 'Beide Reihen sind voll. Fünf und fünf sind zehn.';
    const r = n - 5;
    return `Oben fünf und unten ${w(r)}. Fünf und ${w(r)} sind ${w(n)}.` + (n === 9 ? ' Nur ein Kästchen ist frei.' : '');
  }
  function twentySay(n) {
    if (n === 20) return 'Beide Felder sind voll. Zehn und zehn sind zwanzig.';
    if (n === 10) return 'Das obere Feld ist voll. Das sind zehn.';
    if (n < 10) return tenSay(n);
    const r = n - 10;
    return `Oben zehn und unten ${w(r)}. Zehn und ${w(r)} sind ${w(n)}.`;
  }
  const buildSay = (n) => (n <= 10 ? tenSay(n) : twentySay(n));
  function pairSay(a, b) {
    const s = a + b;
    if (s === 10) return `${W(a)} rote und ${w(b)} blaue. ${W(a)} und ${w(b)} sind genau zehn. Das obere Feld wird voll!`;
    const need = 10 - a;
    const rest = b - need;
    return `Mach erst die Zehn voll: ${W(a)} und ${w(need)} sind zehn. Dann noch ${w(rest)}. Zehn und ${w(rest)} sind ${w(s)}.`;
  }
  function missSay(n, goal) {
    const m = goal - n;
    if (goal === 20 && n < 10) {
      const t = 10 - n;
      return `Bis zehn ${t === 1 ? 'fehlt' : 'fehlen'} ${w(t)}. Dazu kommt das ganze untere Feld, das sind zehn. ${W(n)} und ${w(m)} sind zwanzig.`;
    }
    return `${W(n)} und ${w(m)} sind ${w(goal)}.`;
  }

  /* ------------------------------------------------------------------
     Pools (Lerninhalte)
     ------------------------------------------------------------------ */
  function poolFor(kind, level, flow, index = 0) {
    if (kind === 'ten') {
      const lo = level === 1 ? 3 : 1;
      let p = range(lo, 10);
      if (flow > 0) p = range(6, 10);
      return p.map((n) => ({ kind, n, key: `Feld ${n}` }));
    }
    if (kind === 'twenty') {
      let p = range(11, 20);
      if (flow < 0) p = [11, 12, 13, 14, 15, 20];
      return p.map((n) => ({ kind, n, key: `Feld ${n}` }));
    }
    if (kind === 'lege') {
      const p = level === 1 ? range(flow < 0 ? 3 : 4, 10) : range(flow < 0 ? 11 : 12, flow < 0 ? 15 : 19);
      return p.map((n) => ({ kind, n, key: `Lege ${n}` }));
    }
    if (kind === 'nach') {
      return range(flow < 0 ? 2 : 4, flow < 0 ? 8 : 10).map((n) => ({ kind, n, key: `Nachlegen ${n}` }));
    }
    if (kind === 'pair') {
      const p = [];
      for (let a = 4; a <= 9; a++) {
        for (let b = 2; b <= 9; b++) {
          const s = a + b;
          if (s < 10 || s > 18) continue;
          // Zehnerübergang ist neu: Einstieg mit 9 + x / 8 + x (nur eins
          // oder zwei Plättchen wandern), dann 7 / 6; a ≤ 5 erst bei flow > 0.
          if (flow < 0 && (a < 8 || s > 14)) continue;
          if (flow === 0 && a < (index < 2 ? 8 : 6)) continue;
          if (flow > 0 && s < 13) continue;
          p.push({ kind, a, b, n: s, key: `${a} + ${b}` });
        }
      }
      return p;
    }
    // miss
    const p = [];
    if (flow <= 0) range(2, 9).forEach((n) => p.push({ kind, n, goal: 10, key: `${n} bis 10` }));
    if (flow >= 0) range(11, 19).forEach((n) => p.push({ kind, n, goal: 20, key: `${n} bis 20` }));
    if (flow > 0) range(6, 9).forEach((n) => p.push({ kind, n, goal: 20, key: `${n} bis 20` }));
    return p;
  }

  /* ------------------------------------------------------------------
     Blitzkarte mit Abdeckung
     ------------------------------------------------------------------ */
  function makeCard(field) {
    const icon = el('span.zeh-cover-icon.emoji', '⚡');
    const cover = el('div.zeh-cover', icon);
    const card = el('div.zeh-card', el('div.zeh-face', field.node), cover);
    return { card, cover, icon };
  }

  async function countdown(ctx, cardObj) {
    cardObj.icon.style.display = 'none';
    for (const k of [3, 2, 1]) {
      const num = el('span.zeh-cover-num', String(k));
      cardObj.cover.appendChild(num);
      LT.sfx.tone(k === 1 ? 660 : 520, 0.09, { type: 'triangle', volume: 0.3 });
      await ctx.sleep(380);
      num.remove();
      if (!ctx.active) return;
    }
    cardObj.icon.textContent = '❓';
    cardObj.icon.style.display = '';
  }

  /** Mini-Streifen als Knopf-Inhalt (Fünfer bzw. Zehner). */
  function strip(n) {
    const s = el('span.zeh-strip' + (n === 10 ? '.is-ten' : ''), { 'aria-hidden': 'true' });
    for (let i = 0; i < n; i++) s.appendChild(el('i'));
    return s;
  }

  let introduced = new Set();

  LT.registerGame({
    id: 'zehnerfeld',
    area: 'mathe1',
    title: 'Zehnerfeld-Blitz',
    icon: '🔟',
    levels: 5,
    rounds: ROUNDS,
    type: 'tasks',
    parent: {
      skill: 'Anzahlen bis 20 strukturiert erfassen (Kraft der Fünf, Zehner- und Zwanzigerfeld)',
      goal: 'Ihr Kind lernt, Mengen bis 20 nicht mehr einzeln abzuzählen, sondern über Fünfer- und Zehnerbündel zu sehen: „Eine volle Reihe sind 5, und noch 3 sind 8“, „Ein volles Zehnerfeld und 3 sind 13“. Diese Zahlvorstellung ist die wichtigste Grundlage für das Rechnen über den Zehner (7 + 6 = 7 + 3 + 3) und für das Ergänzen bis 10 und 20.',
      levels: [
        'Zehnerfeld 3 bis 10, geordnet, 2 Sekunden sichtbar; Zahlen bis 10 selbst legen (Brücke aus der Vorschule)',
        'Zehnerfeld 1 bis 10, nur 1 Sekunde sichtbar; Gesehenes aus dem Gedächtnis nachlegen',
        'Zwanzigerfeld 11 bis 20: oben ein volles Zehnerfeld plus Rest („Zehn und drei sind dreizehn“); Zahlen bis 19 legen',
        'Zwanzigerfeld in zwei Farben (z. B. 7 rot + 6 blau): zusammen, mit der Strategie „erst die Zehn voll machen“',
        '„Wie viele fehlen bis 10 bzw. bis 20?“: Ergänzen mit Blick auf die leeren Kästchen (Niveau Ende Klasse 1)',
      ],
      tip: 'Spielen Sie „Blitzfinger“: Zeigen Sie kurz Finger (z. B. eine ganze Hand und zwei) und fragen Sie „Wie viele?“. Eierkartons mit 10 Mulden sind ein tolles Zehnerfeld für Zuhause. Fragen Sie nach dem Ergebnis immer: „Wie hast du das so schnell gesehen?“',
    },

    async task(ctx) {
      const level = ctx.taskLevel;
      const kind = kindFor(level, ctx.index);
      if (ctx.index === 0) introduced = new Set();
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      const ik = kind === 'lege' && level >= 3 ? 'lege20' : kind;
      if (KIND_INTRO[ik] && !introduced.has('k:' + ik)) {
        introduced.add('k:' + ik);
        await ctx.say(KIND_INTRO[ik]);
        if (!ctx.active) return;
      }
      const t = ctx.item(poolFor(kind, level, ctx.flow, ctx.index), (x) => x.key, { avoid: 3 });
      if (kind === 'lege' || kind === 'nach') await buildTask(ctx, t, level);
      else await blitzTask(ctx, t, level);
    },
  });

  /* ==================================================================
     Blitz-Aufgabe: Feld blitzt auf → Zahl antippen
     ================================================================== */
  async function blitzTask(ctx, t, level) {
    const kind = t.kind;
    // „bis zehn“ im Zehnerfeld: sonst wären 20 − n Kästchen leer statt 10 − n.
    const size = kind === 'ten' || (kind === 'miss' && t.goal === 10) ? 10 : 20;
    let spec;
    if (kind === 'pair') spec = Array.from({ length: 20 }, (_, i) => (i < t.a ? 'r' : i >= 10 && i < 10 + t.b ? 'b' : ''));
    else spec = ordered(t.n, size);
    const field = makeField(spec, false);
    const cardObj = makeCard(field);
    const card = cardObj.card;
    const answer = kind === 'miss' ? t.goal - t.n : t.n;
    let showMs = SHOW[level] + (ctx.flow < 0 ? 600 : ctx.flow > 0 ? -300 : 0);
    showMs = Math.max(800, showMs);

    const againBtn = LT.ui.button('Nochmal zeigen', () => showAgain(), { icon: '👀', cls: 'zeh-again' });
    againBtn.disabled = true;
    const choiceBox = el('div.choices.zeh-choices.is-waiting');
    ctx.stage.classList.add('zeh-stage');
    ctx.stage.append(card, againBtn, choiceBox);

    let finished = false;
    let opened = false;
    let againUsed = false;
    let flashing = false;
    let zvDone = false;

    async function flash(ms) {
      flashing = true;
      card.classList.add('is-open');
      LT.sfx.play('whoosh');
      await ctx.sleep(ms);
      flashing = false;
      if (!ctx.active || opened) return;
      card.classList.remove('is-open');
      LT.sfx.play('flip');
    }
    function openForGood() {
      opened = true;
      card.classList.add('is-open');
      againBtn.disabled = true;
    }
    async function showAgain() {
      if (againUsed || flashing || opened || finished || !ctx.active) return;
      againUsed = true;
      againBtn.disabled = true;
      choiceBox.classList.add('is-locked');
      await flash(showMs + 300);
      if (!ctx.active) return;
      choiceBox.classList.remove('is-locked');
    }
    ctx.listen(cardObj.cover, 'click', () => { if (!againBtn.disabled) showAgain(); });

    /** Struktur sichtbar machen (Hilfe 3 und nach der Lösung) */
    async function showStructure() {
      if (kind === 'pair') {
        if (zvDone) return;
        zvDone = true;
        const need = 10 - t.a;
        glow(field.cells.slice(0, t.a));
        for (let j = 0; j < need; j++) {
          await ctx.sleep(320);
          if (!ctx.active) return;
          setTok(field.toks[10 + t.b - 1 - j], '');
          setTok(field.toks[t.a + j], 'b');
          field.cells[t.a + j].classList.add('zeh-hl');
          LT.sfx.tone(480 + j * 40, 0.08, { type: 'triangle', volume: 0.3 });
        }
        await ctx.sleep(300);
        if (!ctx.active) return;
        glow(field.cells.slice(10, 10 + t.b - need), 'zeh-hl2');
        return;
      }
      if (kind === 'miss') {
        const empty = field.cells.slice(t.n, t.goal);
        empty.forEach((c, i) => ctx.timeout(() => { setTok(field.toks[t.n + i], 'g'); c.classList.add('zeh-hl2'); }, 90 * i));
        return;
      }
      const n = t.n;
      const unit = kind === 'ten' ? 5 : 10;
      if (n >= unit) glow(field.cells.slice(0, unit));
      await ctx.sleep(450);
      if (!ctx.active) return;
      if (n > unit) glow(field.cells.slice(unit, n), 'zeh-hl2');
      else if (n < unit) glow(field.cells.slice(0, n));
    }

    // ---------- Ansage → Countdown → Blitz ----------
    const QUESTION = {
      ten: 'Wie viele Plättchen waren es?',
      twenty: 'Wie viele Plättchen waren es?',
      pair: 'Wie viele Plättchen sind es zusammen?',
      miss: `Wie viele fehlen bis ${w(t.goal)}?`,
    };
    const question = QUESTION[kind];
    let pre;
    if (kind === 'miss') pre = `${question} Schau genau hin!`;
    else if (kind === 'pair') pre = U.pickFresh('zeh-pre-pair', ['Rot und blau zusammen. Schau genau hin!', 'Wie viele sind es zusammen? Augen auf!', 'Achtung, gleich blitzt es!'], 1);
    else pre = U.pickFresh('zeh-pre', ['Schau genau hin!', 'Achtung, gleich blitzt es!', 'Augen auf!', 'Bereit? Schau genau hin!'], 2);
    ctx.setInstruction(question);
    await ctx.instruct(pre);
    if (!ctx.active) return;
    await countdown(ctx, cardObj);
    if (!ctx.active) return;
    await flash(showMs);
    if (!ctx.active) return;

    choiceBox.classList.remove('is-waiting');
    againBtn.disabled = false;
    ctx.setInstruction(`${question} Tippe auf die Zahl.`);
    ctx.say(ctx.index === 0 ? `${question} Du darfst einmal nochmal gucken.` : question);

    // ---------- Antworten ----------
    let values;
    if (kind === 'ten') values = Z.options(answer, 4, level === 1 ? 2 : 1, 10, [answer - 1, answer + 1, answer > 5 ? answer - 5 : answer + 5]);
    else if (kind === 'twenty') values = Z.options(answer, 4, 1, 20, [answer - 10, answer + 1, answer - 1]);
    else if (kind === 'pair') values = Z.options(answer, 4, 1, 20, [answer - 1, answer + 1, U.pick([t.a, t.b])]);
    else {
      // typische Fehler: Plättchen statt Lücke (n); bis 20 mit n > 10 nur das
      // untere Feld (n − 10); bis 20 mit n < 10 nur bis zehn ergänzt (10 − n).
      const typ = t.goal === 20 ? (t.n > 10 ? [t.n - 10] : [10 - t.n]) : [];
      values = Z.options(answer, 4, 1, 20, [...typ, t.n, answer + 1, answer - 1]);
    }
    const items = values.map((k) => ({ content: String(k), text: true, correct: k === answer, say: w(k), value: k, className: 'zeh-num' }));
    const ha = Z.hintAfterFor(ctx, items.length);

    const struct = kind === 'ten' ? tenSay(t.n) : kind === 'twenty' ? twentySay(t.n) : kind === 'pair' ? pairSay(t.a, t.b) : missSay(t.n, t.goal);
    const PROC = {
      ten: ['Super! Du hast die volle Fünferreihe gesehen und nicht einzeln gezählt.', 'Klasse! Mit der Kraft der Fünf geht das blitzschnell.'],
      twenty: ['Klasse! Du hast gleich gesehen: Das obere Feld ist voll, das sind zehn.', 'Super! Du hast nicht gezählt, sondern die Zehn auf einen Blick gesehen.'],
      pair: ['Toll! Erst die Zehn voll machen, das ist sehr schlau.', 'Super! Du hast die Plättchen geschickt zusammengerechnet.'],
      miss: ['Prima! Du hast auf die leeren Kästchen geschaut. So geht es blitzschnell.', 'Klasse! Du hast die Lücke bis zur vollen Zahl gesehen.'],
    };
    const more = (k) => (k > answer ? 'weniger' : 'mehr');
    function explain(item) {
      const k = item.value;
      if (kind === 'ten') {
        if (t.n > 5 && k === t.n - 5) return 'Fast! Das ist nur die untere Reihe. Die volle obere Reihe gehört auch dazu.';
        return `Schau mal: Es waren ${more(k)} als ${w(k)}. Denk an die volle Fünferreihe.`;
      }
      if (kind === 'twenty') {
        if (k === t.n - 10) return 'Fast! Das ist nur das untere Feld. Das volle obere Feld gehört auch dazu.';
        return `Schau mal: Es waren ${more(k)} als ${w(k)}. Denk an das volle obere Feld.`;
      }
      if (kind === 'pair') {
        if (k === t.a) return 'Fast! Das sind nur die roten Plättchen. Die blauen gehören auch dazu.';
        if (k === t.b) return 'Fast! Das sind nur die blauen Plättchen. Die roten gehören auch dazu.';
        return `Schau mal: Zusammen sind es ${more(k)} als ${w(k)}. Mach im Kopf erst die Zehn voll.`;
      }
      if (k === t.n) return `Fast! So viele Plättchen sind schon da. Wir suchen die leeren Kästchen bis ${w(t.goal)}.`;
      if (t.goal === 20 && t.n > 10 && k === t.n - 10) return 'Fast! So viele Plättchen liegen unten. Wie viele Kästchen sind noch leer?';
      if (t.goal === 20 && t.n < 10 && k === 10 - t.n) return 'Fast! Das fehlt nur bis zehn. Das untere Feld ist auch noch leer.';
      return `Schau mal: Es fehlen ${more(k)} als ${w(k)}. Schau auf die leeren Kästchen.`;
    }
    function hintSay() {
      const open = 'Die Karte bleibt jetzt offen. ';
      if (kind === 'ten') {
        if (t.n > 5) return `${open}Die obere Reihe ist voll, das sind fünf. Wie viele sind unten?`;
        if (t.n === 5) return `${open}Oben passen genau fünf hin. Ist die Reihe voll?`;
        return `${open}Oben passen fünf hin. Wie viele Kästchen sind noch leer?`;
      }
      if (kind === 'twenty') {
        return t.n === 20 ? `${open}Das obere Feld ist voll, das sind zehn. Und das untere Feld?` : `${open}Das obere Feld ist voll, das sind zehn. Wie viele sind im unteren Feld?`;
      }
      if (kind === 'pair') {
        return t.a + t.b === 10 ? `${open}Passen die blauen genau in die Lücken oben?` : `${open}Mach erst die Zehn voll. Wie viele blaue passen noch ins obere Feld?`;
      }
      if (t.goal === 10) return `${open}Schau auf die leeren Kästchen. Eine leere Reihe sind fünf.`;
      if (t.n > 10) return `${open}Das obere Feld ist voll. Wie viele Kästchen sind unten noch leer?`;
      return `${open}Schau erst oben: Wie viele fehlen bis zehn? Dazu kommt das ganze untere Feld.`;
    }

    await ctx.choices(items, {
      container: choiceBox,
      shuffle: false,
      size: 'small',
      hintAfter: ha,
      praise: false,
      onCorrect: () => {
        finished = true;
        openForGood();
        showStructure();
      },
      correctSay: () => {
        if (ctx.wrongCount === 0 && U.chance(0.3)) return `${U.pickFresh('zeh-proc-' + kind, PROC[kind], 1)} ${struct}`;
        const ok = U.pickFresh('zeh-ok', ['Richtig', 'Genau', 'Ja', 'Stimmt'], 2);
        return `${ok}, ${w(answer)}! ${struct}`;
      },
      explain,
      hintSay,
      modelSay: () => struct,
      onWrong: async (item, tile, wrongs) => {
        if (wrongs === 1 && ha > 1 && !againUsed && !opened) {
          ctx.hint(againBtn);
          ctx.timeout(() => ctx.unhint(againBtn), 2600);
        }
        if (wrongs === ha) {
          ctx.unhint(againBtn);
          openForGood();
        } else if (wrongs === ha + 1) {
          openForGood();
          await showStructure();
        }
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(700);
  }

  /* ==================================================================
     Lege-Aufgabe: Zahl legen (Stufe 1/3) bzw. Gesehenes nachlegen (Stufe 2)
     ================================================================== */
  async function buildTask(ctx, t, level) {
    const n = t.n;
    const size = n > 10 ? 20 : 10;
    const nach = t.kind === 'nach';
    ctx.stage.classList.add('zeh-stage');

    // --- oben: Zielzahl bzw. Blitzkarte ---
    let cardObj = null;
    let again = null;
    let opened = false;
    let againUsed = false;
    let flashing = false;
    const top = el('div.zeh-top');
    if (nach) {
      cardObj = makeCard(makeField(ordered(n, 10), false));
      cardObj.card.classList.add('is-small');
      again = el('button.btn.zeh-again-round', { type: 'button', 'aria-label': 'Nochmal zeigen', on: { click: () => showAgain() } }, U.emoji('👀'));
      again.disabled = true;
      top.append(cardObj.card, again);
    } else {
      top.appendChild(el('div.prompt-box.zeh-goal', el('span.zeh-goal-lbl', 'Lege'), el('b.zeh-goal-num', String(n))));
    }

    // --- Feld zum Legen ---
    const field = makeField(ordered(0, size), true);
    let usedTool = false;
    let busy = true; // erst nach der Ansage
    let finished = false;
    let modeled = false;

    const count = () => field.toks.filter(isOn).length;
    function toggle(i) {
      const tok = field.toks[i];
      setTok(tok, isOn(tok) ? '' : 'r');
      LT.sfx.tone(isOn(tok) ? 520 + count() * 18 : 360, 0.06, { type: 'triangle', volume: 0.25 });
    }
    field.cells.forEach((c, i) => ctx.listen(c, 'click', () => {
      if (busy || finished) return;
      unglow(field);
      toggle(i);
    }));

    function fillCells(idxs) {
      idxs.forEach((i, j) => {
        setTok(field.toks[i], 'r');
        field.cells[i].classList.remove('zeh-pop');
        void field.cells[i].offsetWidth;
        field.cells[i].classList.add('zeh-pop');
        ctx.timeout(() => field.cells[i].classList.remove('zeh-pop'), 400 + j * 10);
      });
      LT.sfx.tone(560, 0.09, { type: 'triangle', volume: 0.3 });
    }
    function useStrip(len, btn) {
      if (busy || finished) return;
      unglow(field);
      const blocks = size / len;
      for (let b = 0; b < blocks; b++) {
        const idxs = range(b * len, b * len + len - 1);
        if (idxs.every((i) => !isOn(field.toks[i]))) {
          usedTool = true;
          fillCells(idxs);
          return;
        }
      }
      LT.ui.animate(btn, 'shake');
      ctx.say(len === 5 ? 'Es ist keine Reihe mehr ganz leer.' : 'Es ist kein Feld mehr ganz leer.');
    }

    const tools = el('div.zeh-tools');
    const five = el('button.btn.zeh-tool', { type: 'button', 'aria-label': 'Fünferstreifen', on: { click: () => useStrip(5, five) } }, strip(5), el('span', '5'));
    tools.appendChild(five);
    let ten = null;
    if (size === 20) {
      ten = el('button.btn.zeh-tool', { type: 'button', 'aria-label': 'Zehnerstreifen', on: { click: () => useStrip(10, ten) } }, strip(10), el('span', '10'));
      tools.appendChild(ten);
    }
    const clear = el('button.btn.zeh-tool.zeh-clear', {
      type: 'button', 'aria-label': 'Alles wegnehmen',
      on: { click: () => { if (busy || finished) return; unglow(field); field.toks.forEach((x) => setTok(x, '')); LT.sfx.play('flip'); } },
    }, U.emoji('🧽'));
    const check = el('button.btn.btn-green.zeh-check', { type: 'button', on: { click: () => doCheck() } }, el('span.zeh-check-mark', '✓'), el('span', 'Fertig'));
    tools.append(clear, check);

    ctx.stage.append(top, field.node, tools);

    // --- Nachlegen: Karte blitzt ---
    async function flash(ms) {
      flashing = true;
      cardObj.card.classList.add('is-open');
      LT.sfx.play('whoosh');
      await ctx.sleep(ms);
      flashing = false;
      if (!ctx.active || opened) return;
      cardObj.card.classList.remove('is-open');
      LT.sfx.play('flip');
    }
    function openForGood() {
      if (!cardObj) return;
      opened = true;
      cardObj.card.classList.add('is-open');
      again.disabled = true;
    }
    async function showAgain() {
      if (!nach || againUsed || flashing || opened || finished || !ctx.active) return;
      againUsed = true;
      again.disabled = true;
      await flash(1500);
    }

    // --- Prüfen ---
    const structuredNow = () => {
      // geordnet = die ersten k Kästchen belegt, Rest leer (Kraft der Fünf)
      const k = count();
      return field.toks.every((x, i) => isOn(x) === i < k);
    };
    async function doCheck() {
      if (busy || finished || !ctx.active) return;
      busy = true;
      const k = count();
      if (k === n) {
        finished = true;
        ctx.markTest(check, false);
        ctx.unhint(check);
        openForGood();
        const wasStructured = structuredNow();
        let say;
        if (ctx.wrongCount === 0 && !modeled && U.chance(0.3)) {
          say = usedTool
            ? U.pickFresh('zeh-proc-tool', ['Super! Du hast mit dem Streifen gelegt. So geht es blitzschnell.', 'Klasse! Mit dem Streifen hast du nicht einzeln zählen müssen.'], 1)
            : wasStructured
              ? 'Toll! Du hast die Reihen schön der Reihe nach voll gemacht. So sieht man die Zahl auf einen Blick.'
              : 'Super! Du hast genau gelegt.';
        } else {
          say = `${U.pickFresh('zeh-ok', ['Richtig', 'Genau', 'Ja', 'Stimmt'], 2)}, ${w(n)}!`;
        }
        if (wasStructured) say += ' ' + buildSay(n);
        await ctx.correct(field.node, { say, praise: false });
        if (!ctx.active) return;
        if (!wasStructured) {
          // ordnen: so sieht man die Zahl noch schneller
          field.toks.forEach((x, i) => setTok(x, i < n ? 'r' : ''));
          glow(field.cells.slice(0, Math.min(n, size === 20 ? 10 : 5)));
          await ctx.say(`Schau, so sieht man es noch schneller. ${buildSay(n)}`);
          if (!ctx.active) return;
        }
        await ctx.sleep(500);
        resolveTask();
        return;
      }
      // nicht richtig
      const tooMany = k > n;
      if (k === 0) {
        // leeres Feld: nur ein Anstoß, kein Fehler (keine Wertung, keine Hilfestufe)
        LT.ui.animate(field.node, 'shake');
        await ctx.say('Leg zuerst Plättchen ins Feld. Tippe auf die Kästchen.');
        busy = false;
        return;
      }
      let say;
      if (nach) say = `Fast! Das sind ${tooMany ? 'zu viele' : 'zu wenige'}. Denk an das Feld von eben.`;
      else say = `Fast! Das sind ${tooMany ? 'zu viele' : 'zu wenige'}.`;
      await ctx.wrong(field.node, { say, keep: true });
      if (!ctx.active) return;
      const step = ctx.helpStep;
      if (step === 1 && nach && !againUsed && !opened) {
        ctx.hint(again);
        await ctx.say('Du darfst nochmal gucken. Tippe auf die Augen!');
        ctx.timeout(() => ctx.unhint(again), 2600);
      } else if (step === 2) {
        if (nach) {
          openForGood();
          await ctx.say('Die Karte bleibt jetzt offen. Lege genau so viele wie oben.');
        } else if (n > 10) {
          if (ten) ctx.hint(ten);
          glow(field.frames[0].querySelectorAll('.zeh-cell'));
          await ctx.say(`Tipp: Ein volles Zehnerfeld sind zehn. Zehn und wie viele sind ${w(n)}?`);
          if (ten) ctx.timeout(() => ctx.unhint(ten), 3000);
        } else if (n > 5) {
          ctx.hint(five);
          glow(rowCells(field, 0));
          await ctx.say(`Tipp: Eine volle Reihe sind fünf. Fünf und wie viele sind ${w(n)}?`);
          ctx.timeout(() => ctx.unhint(five), 3000);
        } else {
          glow(rowCells(field, 0));
          await ctx.say(`Tipp: In die obere Reihe passen fünf. Lege ${w(n)} der Reihe nach von links.`);
        }
      } else if (step >= 3 && !modeled) {
        // vormachen: Flo legt geordnet, das Kind tippt auf „Fertig“
        modeled = true;
        ctx.modelShown = true;
        openForGood();
        unglow(field);
        field.toks.forEach((x) => setTok(x, ''));
        await ctx.say('Schau, ich zeige es dir.');
        if (!ctx.active) return;
        const unit = n > 10 ? 10 : 5;
        const first = Math.min(n, unit);
        fillCells(range(0, first - 1));
        glow(field.cells.slice(0, first));
        await ctx.sleep(600);
        if (!ctx.active) return;
        if (n > first) {
          fillCells(range(first, n - 1));
          glow(field.cells.slice(first, n), 'zeh-hl2');
        }
        await ctx.say(`${buildSay(n)} Tippe auf Fertig.`);
        if (!ctx.active) return;
        ctx.hint(check);
        ctx.markTest(check);
      } else if (step >= 3) {
        ctx.hint(check);
      }
      busy = false;
    }

    let resolveTask;
    const done = new Promise((r) => { resolveTask = r; });

    // --- Ablauf ---
    if (nach) {
      ctx.setInstruction('Lege genau so viele Plättchen nach, wie du gesehen hast. Dann tippe auf Fertig.');
      await ctx.instruct('Schau genau hin!');
      if (!ctx.active) return;
      await countdown(ctx, cardObj);
      if (!ctx.active) return;
      await flash(1400 + (ctx.flow < 0 ? 600 : 0));
      if (!ctx.active) return;
      again.disabled = false;
      ctx.say('Jetzt lege nach, was du gesehen hast!');
    } else {
      const q = `Lege ${w(n)} Plättchen. Dann tippe auf Fertig.`;
      await ctx.instruct(q);
      if (!ctx.active) return;
    }
    busy = false;
    ctx.testSolve(() => {
      if (busy || finished) return;
      field.toks.forEach((x, i) => setTok(x, i < n ? 'r' : ''));
      doCheck();
    });
    await done;
  }
})();
