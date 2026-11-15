/* ==========================================================================
   Spiel „Zahlen-Nachbarn“ 🏘️ (Rechenschule, Klasse 1) – Zahlenraum bis 20:
   Nachbarzahlen, Zehner und Einer, Zahlenstrahl, Ordnen; Ausblick bis 100.

   Didaktik:
   - Im Zahlenhaus wohnen die Zahlen in Stockwerken: unten 1 bis 10, oben
     11 bis 20. Genau über jeder Zahl wohnt die Zahl mit einem Zehner mehr
     („Über der Sechs wohnt die Sechzehn“). So wird die Analogie zwischen
     den Zehnern sichtbar, die später beim Rechnen hilft.
   - Nachbarzahlen: Der kleine Nachbar ist eins weniger, der große Nachbar
     ist eins mehr. Die Zahl-Mieter fliegen in die leeren Fenster.
   - Stellenwerte: Zahlen aus Zehnerstangen und Einerwürfeln bauen und
     lesen. Zehn Einerwürfel werden sichtbar zu einer Stange gebündelt.
   - Stufen:
       1  Nachbarn bis 10 (beide Nachbarn finden, „wer wohnt dazwischen?“)
          – Brücke aus der Vorschule
       2  Nachbarn 10 bis 20, auch über das Stockwerk hinweg (10 → 9 / 11)
          und an der Zwanzig (19 → 20, nicht „110“)
       3  Zehner und Einer: Zahl bauen (Stellenwerttafel) und lesen (11–20);
          das Zahlwort wird gelesen, nicht als Ziffer gezeigt (14 ≠ 41)
       4  Zahlenstrahl bis 20: Zweierschritte mit Lücken (gerade/ungerade)
          und „Welche Zahl zeigt der Pfeil?“
       5  Ordnen, größte/kleinste Zahl, „liegt zwischen“; Ausblick bis 100
          (Nachbarn am Zehnerübergang, z. B. 39 → 40)
   - Typische Fehlvorstellungen als gezielte Ablenker: 41 statt 14 (Einer
     werden zuerst gesprochen), 110 statt 20, Richtung links/rechts
     vertauscht, Einerschritt statt Zweierschritt, nur die Einer gelesen.
   - Hilfe-Leiter: 1. Fehler → erklärt die gewählte Zahl, ohne die Lösung zu
     verraten; 2. Fehler → Strategie (Licht im Stockwerk, Stange zuerst,
     Zählen am Zahlenstrahl); 3. Fehler → Flo macht es vor.
   - Lerninhalte (ctx.item): 'Nachbarn 7', 'zwischen 6 und 8', 'Baue 14',
     'Lies 14', '4 6 _ 10 12', 'Pfeil 13', 'ordne 9 12 15', 'größte …',
     'zwischen 13 und 17', 'nach 39'.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = LT.z2;

  /* ---------------- Zahlwörter (auch über 20, für den Ausblick bis 100) ---------------- */
  const ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
    'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const TENS = ['', 'zehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  function w(n) {
    if (n >= 0 && n <= 20) {
      const s = U.numberWord(n);
      if (!/\d/.test(s)) return s;
    }
    if (n < 20) return ONES[n] || String(n);
    if (n < 100) {
      const z = Math.floor(n / 10);
      const e = n % 10;
      return e === 0 ? TENS[z] : (e === 1 ? 'ein' : ONES[e]) + 'und' + TENS[z];
    }
    if (n === 100) return 'hundert';
    if (n < 120) return 'hundert' + ONES[n - 100];
    return String(n);
  }
  const W = (n) => U.cap(w(n));
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  /** Ziffern vertauscht (14 → 41); null, wenn das nichts Neues ergibt. */
  const rev = (n) => {
    if (n < 10) return null;
    const r = Number(String(n).split('').reverse().join(''));
    return r !== n ? r : null;
  };
  const okWord = () => U.pickFresh('znb-ok', ['Richtig', 'Genau', 'Ja', 'Stimmt', 'Super'], 2);
  const proc = (ctx, normal, list, key) => (ctx.wrongCount === 0 && !ctx.modelShown && U.chance(0.3)
    ? U.pickFresh('znb-proc-' + key, list, 1) : normal);

  const ROUNDS = 6;

  const INTRO = {
    1: 'Willkommen im Zahlenhaus! Hier wohnt jede Zahl in ihrem Fenster. Links wohnt der kleine Nachbar, er ist eins weniger. Rechts wohnt der große Nachbar, er ist eins mehr.',
    2: 'Das Zahlenhaus hat jetzt zwei Stockwerke. Unten wohnen eins bis zehn, oben elf bis zwanzig. Findest du die Nachbarn?',
    3: 'Jetzt bauen wir Zahlen! Eine Stange sind zehn Einer. Das ist ein Zehner. Merke dir: Der Zehner steht vorne.',
    4: 'Jetzt kommt der Zahlenstrahl! Die Zahlen stehen der Reihe nach auf einer langen Linie. Manchmal hüpfen wir immer zwei weiter.',
    5: 'Jetzt bist du Zahlen-Profi! Wir ordnen Zahlen, suchen die größte und die kleinste und schauen, was dazwischen liegt.',
  };
  const KIND_INTRO = {
    read: 'Jetzt liest du Zahlen. Wie viele Stangen, wie viele Würfel? Welche Zahl ist das?',
    arrow: 'Auf dem Zahlenstrahl zeigt ein Pfeil auf eine Zahl. Zähl die Striche!',
    sort: 'Bring die Zahlen in die richtige Reihe. Tippe zuerst die kleinste Zahl an, dann die nächste.',
    hundert: 'Jetzt ein Blick ins Hochhaus! Hier wohnen Zahlen bis hundert. Die Nachbarn gibt es dort auch.',
  };

  /** Aufgabenart je Stufe und Aufgabe. */
  function kindFor(ctx, level, index) {
    if (level === 1 || level === 2) return index % 3 === 2 ? 'mid' : 'both';
    if (level === 3) return index % 2 === 1 ? 'read' : 'build';
    if (level === 4) return index % 3 === 1 ? 'arrow' : 'hops';
    if (ctx.flow > 0 && index >= 2 && index % 2 === 1) return 'hundert';
    if (index === ROUNDS - 1 && U.chance(0.5)) return 'hundert';
    return ['sort', 'extreme', 'between', 'sort', 'between', 'extreme'][index % 6];
  }

  /** Neue Kachelreihe für ctx.choices (alte Reihe wird ersetzt, damit keine
   *  erledigte Kachel mehr als „richtig“ markiert ist). */
  function freshBox(holder) {
    U.clear(holder);
    const box = el('div.choices.znb-choices');
    holder.appendChild(box);
    return box;
  }
  const numItems = (values, answer, extra) => values.map((k) => ({
    content: String(k), text: true, correct: k === answer, say: w(k), value: k,
    className: 'znb-num' + (k >= 100 ? ' is-long' : ''), ...(extra || {}),
  }));

  /* ==================================================================
     Zahlenhaus (Stufe 1, 2 und Ausblick)
     ================================================================== */
  function makeHouse(floors, cls) {
    const wins = new Map();
    const box = el('div.znb-floors');
    floors.forEach((row) => {
      const fl = el('div.znb-floor');
      row.forEach((n) => {
        const win = el('div.znb-win', { 'aria-hidden': 'true' }, el('span.znb-wnum', ''));
        win._n = n;
        wins.set(n, win);
        fl.appendChild(win);
      });
      box.appendChild(fl);
    });
    const node = el('div', { class: 'znb-house ' + (cls || '') },
      el('div.znb-roof', el('span.znb-chimney')),
      box,
      el('div.znb-ground'));
    return { node, wins };
  }
  function setWin(win, state, text) {
    if (!win) return;
    win.classList.remove('is-lit', 'is-ask', 'is-filled', 'is-on', 'is-active');
    if (state) state.split(' ').forEach((s) => win.classList.add('is-' + s));
    win.querySelector('.znb-wnum').textContent = text == null ? '' : String(text);
  }

  /** Große Nachbar-Kärtchen [?][7][?] (Fokus unter dem Haus). */
  function makeStrip(cells) {
    const node = el('div.znb-strip');
    const boxes = cells.map((c) => {
      const b = el('div', { class: 'znb-cell' + (c == null ? ' is-ask' : '') }, c == null ? '?' : String(c));
      node.appendChild(b);
      return b;
    });
    return { node, boxes };
  }
  function fillCell(box, n) {
    box.textContent = String(n);
    box.classList.remove('is-ask', 'is-active');
    box.classList.add('is-filled');
  }

  async function houseTask(ctx, t, level) {
    const two = level >= 2;
    const floors = two ? [range(11, 20), range(1, 10)] : [range(1, 10)];
    const house = makeHouse(floors, two ? 'is-two' : '');
    const holder = el('div.znb-holder');
    let cells;
    let asks; // [{n, cellIdx, side}]
    if (t.kind === 'both') {
      cells = [null, t.n, null];
      asks = [{ n: t.n - 1, idx: 0, side: 'left' }, { n: t.n + 1, idx: 2, side: 'right' }];
    } else {
      cells = [t.n - 1, null, t.n + 1];
      asks = [{ n: t.n, idx: 1, side: 'mid' }];
    }
    const strip = makeStrip(cells);
    // Fenster: alle dunkel, die bekannten leuchten, die gesuchten mit „?“
    house.wins.forEach((win) => setWin(win, ''));
    cells.forEach((c, i) => {
      const n = t.n - 1 + i;
      if (c == null) setWin(house.wins.get(n), 'ask', '?');
      else setWin(house.wins.get(n), 'lit', n);
    });
    ctx.stage.classList.add('znb-stage');
    ctx.stage.append(house.node, strip.node, holder);

    const lightsOn = (nums) => nums.forEach((n) => {
      const win = house.wins.get(n);
      if (win && !win.classList.contains('is-ask') && !win.classList.contains('is-lit') && !win.classList.contains('is-filled')) setWin(win, 'on', n);
    });

    const q = t.kind === 'both'
      ? `Wer sind die Nachbarn von der ${W(t.n)}?`
      : `Die ${W(t.n - 1)} und die ${W(t.n + 1)} sind Nachbarn. Wer wohnt dazwischen?`;
    await ctx.instruct(q);
    if (!ctx.active) return;

    for (let a = 0; a < asks.length; a++) {
      const ask = asks[a];
      const ans = ask.n;
      const cell = strip.boxes[ask.idx];
      const win = house.wins.get(ans);
      cell.classList.add('is-active');
      win.classList.add('is-active');
      let sub;
      if (ask.side === 'left') sub = `Wer wohnt links? Der kleine Nachbar.`;
      else if (ask.side === 'right') sub = `Und wer wohnt rechts? Der große Nachbar.`;
      else sub = '';
      if (sub) {
        ctx.setInstruction(`${q} ${sub}`);
        await ctx.say(sub);
        if (!ctx.active) return;
      }
      // Antworten: typische Fehler zuerst
      const prefer = [];
      if (ask.side === 'left') prefer.push(t.n + 1, t.n, ans - 1);
      else if (ask.side === 'right') prefer.push(t.n - 1, t.n, ans + 1);
      else prefer.push(t.n - 1, t.n + 1, ans + 2);
      if (level >= 2 && rev(ans) && U.chance(0.5)) prefer.unshift(rev(ans));
      if (ans === 20) prefer.unshift(110);
      const set = new Set([ans]);
      for (const p of prefer) { if (set.size >= 4) break; if (p >= 0 && p !== ans) set.add(p); }
      let guard = 0;
      while (set.size < 4 && guard++ < 50) { const x = ans + U.randInt(-3, 3); if (x >= 0 && x <= 20) set.add(x); }
      const values = Array.from(set).sort((x, y) => x - y);
      const items = numItems(values, ans);
      const ha = Z.hintAfterFor(ctx, items.length);
      const last = a === asks.length - 1;

      const explain = (item) => {
        const k = item.value;
        if (k === 110) return 'Fast! Hundertzehn ist eine riesige Zahl. Nach neun Einern kommt der zehnte Einer. Zehn Einer sind ein neuer Zehner.';
        if (rev(ans) === k) return `Fast! Das ist ${w(k)}. Schau genau: Der Zehner steht vorne.`;
        if (k === t.n && ask.side !== 'mid') return `Die ${W(k)} wohnt in der Mitte. Wir suchen ihren Nachbarn.`;
        if (ask.side === 'left' && k > t.n) return `Fast! Die ${W(k)} ist größer. Sie wohnt rechts. Links wohnt der kleine Nachbar.`;
        if (ask.side === 'right' && k < t.n) return `Fast! Die ${W(k)} ist kleiner. Sie wohnt links. Rechts wohnt der große Nachbar.`;
        if (ask.side === 'mid' && (k === t.n - 1 || k === t.n + 1)) return `Die ${W(k)} wohnt schon nebenan. Wir suchen die Zahl dazwischen.`;
        if (ask.side === 'mid') return `Schau mal: Die ${W(k)} liegt nicht zwischen den beiden.`;
        return `Schau mal: Die ${W(k)} wohnt nicht direkt daneben. Nachbarn sind nur eins entfernt.`;
      };
      const hintSay = () => {
        if (level >= 2 && ans > 10 && ans <= 20) {
          const low = ans - 10;
          const lw = house.wins.get(low);
          if (lw) { lightsOn([low - 1, low, low + 1].filter((x) => x >= 1 && x <= 10)); ctx.hint(lw); ctx.timeout(() => ctx.unhint(lw), 3500); }
          return `Tipp: Schau ins untere Stockwerk. Genau unter dem Fragezeichen wohnt die ${W(low)}. Oben ist es genauso, nur mit einem Zehner mehr.`;
        }
        lightsOn(floors.flat());
        if (ask.side === 'left') return `Ich mache das Licht an. Der kleine Nachbar ist eins weniger als ${w(t.n)}. Zähl rückwärts.`;
        if (ask.side === 'right') return `Ich mache das Licht an. Der große Nachbar ist eins mehr als ${w(t.n)}. Zähl weiter.`;
        return `Ich mache das Licht an. Zähl von der ${W(t.n - 1)} eins weiter.`;
      };
      const modelSay = () => {
        if (ask.side === 'left') return `Eins weniger als ${w(t.n)} ist ${w(ans)}. Tipp die ${W(ans)} an.`;
        if (ask.side === 'right') return ans === 20
          ? 'Nach neunzehn kommt zwanzig. Zehn Einer werden ein neuer Zehner. Tipp die Zwanzig an.'
          : `Eins mehr als ${w(t.n)} ist ${w(ans)}. Tipp die ${W(ans)} an.`;
        return `${W(t.n - 1)}, ${w(ans)}, ${w(t.n + 1)}. In der Mitte wohnt die ${W(ans)}. Tipp sie an.`;
      };
      let picked = null;
      await ctx.choices(items, {
        container: freshBox(holder),
        shuffle: false,
        size: 'small',
        hintAfter: ha,
        praise: false,
        onCorrect: (item, tile) => { picked = tile; },
        correctSay: () => {
          if (!last) return `${okWord()}, ${w(ans)}!`;
          const normal = t.kind === 'both'
            ? `${okWord()}! Die ${W(t.n - 1)} und die ${W(t.n + 1)} sind die Nachbarn von der ${W(t.n)}.`
            : `${okWord()}! Die ${W(ans)} wohnt zwischen ${w(t.n - 1)} und ${w(t.n + 1)}.`;
          return proc(ctx, normal, [
            `Klasse! Eins weniger und eins mehr, das hast du schnell gewusst.`,
            `Super! Du kennst die Zahlenreihe richtig gut.`,
            level >= 2 ? 'Toll! Du hast die Nachbarn auch im oberen Stockwerk gefunden.' : 'Toll! Du hast genau nachgedacht.',
          ], 'house');
        },
        explain,
        hintSay,
        modelSay,
        onWrong: async (item, tile, n) => {
          if (n === ha + 1) lightsOn(floors.flat());
        },
      });
      if (!ctx.active) return;
      await Z.flyNumber(ctx, picked, cell, String(ans));
      if (!ctx.active) return;
      fillCell(cell, ans);
      setWin(win, 'filled', ans);
      U.clear(holder);
      await ctx.sleep(250);
      if (!ctx.active) return;
    }
    // Ausklang: Bei der Zehn über das Stockwerk hinweg
    if (level >= 2 && t.kind === 'both' && t.n === 10) {
      await ctx.say('Die Elf wohnt schon im oberen Stockwerk. Die Nachbarn können auch über die Treppe wohnen.');
    }
    await ctx.sleep(450);
  }

  /* ==================================================================
     Zehner und Einer (Stufe 3)
     ================================================================== */
  function rod() {
    const r = el('div.znb-rod', { 'aria-hidden': 'true' });
    for (let i = 0; i < 10; i++) r.appendChild(el('i'));
    return r;
  }
  const cube = () => el('i.znb-cube', { 'aria-hidden': 'true' });
  /** Bild aus Stangen und Würfeln (zum Lesen). */
  function piecesPicture(z, e) {
    const rods = el('div.znb-rods');
    for (let i = 0; i < z; i++) rods.appendChild(rod());
    const cubes = el('div.znb-cubes');
    for (let i = 0; i < e; i++) cubes.appendChild(cube());
    return el('div.prompt-box.znb-pic', rods, e ? cubes : null);
  }
  const zeSay = (n) => {
    const z = Math.floor(n / 10);
    const e = n % 10;
    const zs = z === 1 ? 'ein Zehner' : `${w(z)} Zehner`;
    const es = e === 0 ? 'kein Einer' : e === 1 ? 'ein Einer' : `${w(e)} Einer`;
    return `${W(n)} ist ${zs} und ${es}.`;
  };

  async function readTask(ctx, t) {
    const n = t.n;
    const z = Math.floor(n / 10);
    const e = n % 10;
    ctx.stage.classList.add('znb-stage');
    const pic = piecesPicture(z, e);
    const holder = el('div.znb-holder');
    ctx.stage.append(pic, holder);
    await ctx.instruct('Welche Zahl ist das?');
    if (!ctx.active) return;
    const set = new Set([n]);
    const prefer = [rev(n), e || null, n + 1, n - 1, n + 2];
    if (n === 20) prefer.unshift(2);
    for (const p of prefer) { if (set.size >= 4) break; if (p != null && p > 0 && p !== n) set.add(p); }
    let guard = 0;
    while (set.size < 4 && guard++ < 50) set.add(U.randInt(10, 20));
    const items = numItems(Array.from(set).sort((a, b) => a - b), n);
    const ha = Z.hintAfterFor(ctx, items.length);
    const rods = Array.from(pic.querySelectorAll('.znb-rod'));
    const cubes = Array.from(pic.querySelectorAll('.znb-cube'));
    await ctx.choices(items, {
      container: freshBox(holder),
      shuffle: false,
      size: 'small',
      hintAfter: ha,
      praise: false,
      correctSay: () => proc(ctx, `${okWord()}! ${zeSay(n)}`, [
        `Super! Du hast zuerst die Stange gesehen. ${zeSay(n)}`,
        `Klasse! Zehner vorne, Einer hinten. ${zeSay(n)}`,
      ], 'read'),
      explain: (item) => {
        const k = item.value;
        if (k === rev(n)) return `Fast! Das ist ${w(k)}. Dafür bräuchte man ${w(Math.floor(k / 10))} Stangen. Zähl die Stangen!`;
        if (k === e || (n === 20 && k === 2)) return n === 20 ? 'Fast! Jede Stange ist zehn wert, nicht eins.' : 'Fast! Das sind nur die Würfel. Die Stange gehört auch dazu.';
        if (Math.abs(k - n) === 1) return 'Ganz knapp! Zähl die Würfel noch einmal genau.';
        return `Schau mal: Das sind ${k > n ? 'zu viele' : 'zu wenige'}.`;
      },
      hintSay: () => {
        rods.forEach((r) => r.classList.add('znb-glow'));
        return z === 2 ? 'Tipp: Jede Stange ist zehn. Zehn und noch zehn?' : 'Tipp: Die Stange ist zehn. Zähl die Würfel dazu: zehn und wie viele?';
      },
      modelSay: () => `${zeSay(n)} Tipp die ${W(n)} an.`,
      onWrong: async (item, tile, k) => {
        if (k === ha + 1 && e > 0) {
          await ctx.say('Zehn,');
          await Z.countAlong(ctx, cubes, { start: 11, badge: false, words: cubes.map((c, i) => w(11 + i)) });
        }
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(500);
  }

  async function buildTask(ctx, t, showDigits) {
    const n = t.n;
    const tz = Math.floor(n / 10);
    const te = n % 10;
    const MAXZ = 4;
    let z = 0;
    let e = 0;
    let busy = true;
    let finished = false;
    let modeled = false;
    ctx.stage.classList.add('znb-stage', 'znb-build');

    const goal = el('div.prompt-box.znb-goal',
      el('span.znb-goal-lbl', 'Baue'),
      showDigits ? el('b.znb-goal-num', String(n)) : el('b.znb-goal-word', w(n)));

    const zCol = el('div.znb-col.znb-colz');
    const eCol = el('div.znb-col.znb-cole');
    const zDig = el('b.znb-dig', '0');
    const eDig = el('b.znb-dig', '0');
    const btn = (label, aria, fn) => {
      const b = el('button.btn.znb-pm', { type: 'button', 'aria-label': aria }, label);
      ctx.listen(b, 'click', () => { if (!busy && !finished) fn(b); });
      return b;
    };
    const zMinus = btn('−', 'Zehner weg', () => { if (z > 0) { z--; render(); tone(300); } });
    const zPlus = btn('+', 'Zehner dazu', (b) => {
      if (z >= MAXZ) { LT.ui.animate && LT.ui.animate(b, 'shake'); return; }
      z++; render(); tone(560);
    });
    const eMinus = btn('−', 'Einer weg', () => { if (e > 0) { e--; render(); tone(300); } });
    const ePlus = btn('+', 'Einer dazu', (b) => {
      if (e >= 9 && z >= MAXZ) { LT.ui.animate && LT.ui.animate(b, 'shake'); return; }
      e++; render(); tone(480 + e * 20);
      if (e === 10) bundle();
    });
    const table = el('div.znb-table',
      el('div.znb-th', el('span', 'Z'), el('small', 'Zehner')),
      el('div.znb-th', el('span', 'E'), el('small', 'Einer')),
      zCol, eCol,
      el('div.znb-tf', zDig), el('div.znb-tf', eDig),
      el('div.znb-pms', zMinus, zPlus), el('div.znb-pms', eMinus, ePlus));
    const clear = el('button.btn.znb-tool', { type: 'button', 'aria-label': 'Alles wegnehmen' }, U.emoji('🧽'));
    ctx.listen(clear, 'click', () => { if (busy || finished) return; z = 0; e = 0; render(); LT.sfx.play('flip'); });
    const check = el('button.btn.btn-green.znb-check', { type: 'button' }, el('span.znb-check-mark', '✓'), el('span', 'Fertig'));
    ctx.listen(check, 'click', () => doCheck());
    const tools = el('div.znb-tools', clear, check);
    ctx.stage.append(goal, el('div.znb-buildrow', table, tools));

    function tone(f) { LT.sfx.tone(f, 0.07, { type: 'triangle', volume: 0.25 }); }
    function render() {
      U.clear(zCol);
      U.clear(eCol);
      for (let i = 0; i < z; i++) zCol.appendChild(rod());
      for (let i = 0; i < e; i++) eCol.appendChild(cube());
      zDig.textContent = String(z);
      eDig.textContent = String(e);
    }
    async function bundle() {
      busy = true;
      eCol.classList.add('znb-bundling');
      await ctx.say('Zehn Einer! Die bündeln wir zu einer Zehnerstange.');
      if (!ctx.active) return;
      await ctx.sleep(300);
      if (!ctx.active) return;
      eCol.classList.remove('znb-bundling');
      e = 0;
      z = Math.min(MAXZ, z + 1);
      render();
      const r = zCol.lastElementChild;
      if (r) { r.classList.add('znb-pop'); ctx.timeout(() => r.classList.remove('znb-pop'), 500); }
      LT.sfx.tone(700, 0.12, { type: 'triangle', volume: 0.3 });
      busy = false;
    }

    async function doCheck() {
      if (busy || finished || !ctx.active) return;
      busy = true;
      const v = z * 10 + e;
      if (v === n) {
        finished = true;
        ctx.markTest(check, false);
        ctx.unhint(check);
        const say = proc(ctx, `${okWord()}! ${zeSay(n)}`, [
          `Super! Du hast zuerst die Zehnerstange gelegt. ${zeSay(n)}`,
          `Klasse! Der Zehner steht vorne, das hast du dir gemerkt. ${zeSay(n)}`,
        ], 'build');
        await ctx.correct(table, { say, praise: false });
        if (!ctx.active) return;
        await ctx.sleep(450);
        resolveTask();
        return;
      }
      let say;
      if (v === 0) say = 'Leg zuerst Stangen oder Würfel in die Tafel. Tippe auf Plus.';
      else if (z === te && e === tz && rev(n) === v) say = `Fast! Du hast ${w(z)} Zehner und ${e === 1 ? 'einen' : w(e)} Einer gebaut. Das ist ${w(v)}. Bei ${w(n)} hört man die Einer zuerst. Aber der Zehner steht vorne.`;
      else say = `Fast! Du hast ${z === 1 ? 'einen' : w(z)} Zehner und ${e === 1 ? 'einen' : w(e)} Einer gebaut. Das ist ${w(v)}. Wir suchen ${w(n)}.`;
      await ctx.wrong(table, { say, keep: true });
      if (!ctx.active) return;
      const step = ctx.helpStep;
      if (step === 2) {
        ctx.hint(zPlus);
        ctx.timeout(() => ctx.unhint(zPlus), 3000);
        await ctx.say(tz === 2
          ? 'Tipp: Zwanzig sind zwei Zehner. Eine Stange ist ein Zehner.'
          : `Tipp: ${W(n)} ist zehn und ${w(te)}. Eine Stange ist zehn. Wie viele Würfel kommen dazu?`);
      } else if (step >= 3 && !modeled) {
        modeled = true;
        ctx.modelShown = true;
        z = 0; e = 0; render();
        await ctx.say('Schau, ich zeige es dir. Zuerst die Zehner.');
        if (!ctx.active) return;
        for (let i = 0; i < tz; i++) { z++; render(); tone(560); await ctx.sleep(350); if (!ctx.active) return; }
        for (let i = 0; i < te; i++) { e++; render(); tone(480 + e * 20); await ctx.sleep(220); if (!ctx.active) return; }
        await ctx.say(`${zeSay(n)} Tippe auf Fertig.`);
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
    render();
    await ctx.instruct(`Baue die Zahl ${w(n)}. Dann tippe auf Fertig.`);
    if (!ctx.active) return;
    busy = false;
    ctx.testSolve(() => {
      if (busy || finished) return;
      z = tz; e = te; render();
      doCheck();
    });
    await done;
  }

  /* ==================================================================
     Zahlenstrahl (Stufe 4)
     ================================================================== */
  function makeLine(maxN) {
    const ticks = [];
    const labels = new Map();
    const line = el('div.znb-line', { 'aria-hidden': 'true' });
    const track = el('div.znb-track');
    line.appendChild(track);
    for (let i = 0; i <= maxN; i++) {
      const tk = el('span', { class: 'znb-tick' + (i % 10 === 0 ? ' is-ten' : i % 5 === 0 ? ' is-five' : '') });
      tk.style.left = (i / maxN) * 100 + '%';
      track.appendChild(tk);
      ticks.push(tk);
    }
    const pos = (i) => (i / maxN) * 100 + '%';
    function label(i, text, cls) {
      let lb = labels.get(i);
      if (!lb) {
        lb = el('span.znb-lbl');
        lb.style.left = pos(i);
        track.appendChild(lb);
        labels.set(i, lb);
      }
      lb.className = 'znb-lbl' + (cls ? ' ' + cls : '');
      lb.textContent = text;
      return lb;
    }
    function hop(a, b, cls) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const h = el('span', { class: 'znb-hop' + (cls ? ' ' + cls : '') });
      h.style.left = pos(lo);
      h.style.width = ((hi - lo) / maxN) * 100 + '%';
      track.appendChild(h);
      return h;
    }
    function arrow(i) {
      const a = el('span.znb-arrow', '▼');
      a.style.left = pos(i);
      track.appendChild(a);
      return a;
    }
    const node = el('div.prompt-box.znb-linebox', line);
    return { node, ticks, label, hop, arrow, labels };
  }

  function hopsPool(flow) {
    const p = [];
    for (let s = 0; s <= 12; s++) {
      const seq = [0, 1, 2, 3, 4].map((i) => s + 2 * i);
      if (seq[4] > 20) continue;
      const gaps = flow > 0 ? [[1, 3], [2, 4], [1, 4]] : [[1], [2], [3], [4]];
      const variants = flow > 0 && s >= 3 ? [seq, seq.slice().reverse()] : [seq];
      gaps.forEach((g) => variants.forEach((show) => {
        p.push({ kind: 'hops', seq: show, gaps: g, key: show.map((x, i) => (g.includes(i) ? '_' : x)).join(' ') });
      }));
    }
    // bei Schwierigkeiten: kleinere Zahlen, Lücke in der Mitte
    return flow < 0 ? p.filter((x) => x.seq[0] <= 6 && x.gaps.length === 1 && x.gaps[0] <= 3) : p;
  }

  async function hopsTask(ctx, t) {
    const L = makeLine(20);
    const seq = t.seq;
    const desc = seq[1] < seq[0];
    const known = new Set(seq.map((x, i) => (t.gaps.includes(i) ? null : x)).filter((x) => x != null));
    for (let i = 0; i < seq.length - 1; i++) L.hop(seq[i], seq[i + 1]);
    seq.forEach((x, i) => {
      if (t.gaps.includes(i)) L.label(x, '?', 'is-ask');
      else L.label(x, String(x), 'is-on');
      L.ticks[x].classList.add('is-mark');
    });
    [0, 10, 20].forEach((x) => { if (!seq.some((y) => Math.abs(y - x) <= 1)) L.label(x, String(x), 'is-faint'); });
    const strip = makeStrip(seq.map((x, i) => (t.gaps.includes(i) ? null : x)));
    strip.node.classList.add('is-five');
    const holder = el('div.znb-holder');
    ctx.stage.classList.add('znb-stage');
    ctx.stage.append(L.node, strip.node, holder);
    const even = seq[0] % 2 === 0;
    await ctx.instruct(desc ? 'Wir hüpfen immer zwei zurück. Welche Zahl fehlt?' : 'Wir hüpfen immer zwei weiter. Welche Zahl fehlt?');
    if (!ctx.active) return;

    for (let gi = 0; gi < t.gaps.length; gi++) {
      const idx = t.gaps[gi];
      const ans = seq[idx];
      const cell = strip.boxes[idx];
      cell.classList.add('is-active');
      // Bezugszahl: die bekannte (oder schon gefundene) Zahl davor, sonst danach
      const hasPrev = idx > 0 && (known.has(seq[idx - 1]));
      const ref = hasPrev ? seq[idx - 1] : seq[idx + 1];
      const forward = hasPrev ? !desc : desc; // zählen wir von ref aus aufwärts?
      if (gi > 0) {
        ctx.setInstruction('Welche Zahl fehlt noch?');
        await ctx.say('Und welche Zahl fehlt noch?');
        if (!ctx.active) return;
      }
      const set = new Set([ans]);
      for (const p of U.shuffle([ans - 1, ans + 1]).concat([ans + 2, ans - 2, ans + 3])) {
        if (set.size >= 4) break;
        if (p >= 0 && p <= 20 && !known.has(p)) set.add(p);
      }
      let guard = 0;
      while (set.size < 4 && guard++ < 50) { const x = U.randInt(0, 20); if (!known.has(x)) set.add(x); }
      const items = numItems(Array.from(set).sort((a, b) => a - b), ans);
      const ha = Z.hintAfterFor(ctx, items.length);
      const last = gi === t.gaps.length - 1;
      const stepTicks = () => {
        const dir = forward ? 1 : -1;
        return [ref + dir, ref + 2 * dir].map((x) => L.ticks[x]).filter(Boolean);
      };
      await ctx.choices(items, {
        container: freshBox(holder),
        shuffle: false,
        size: 'small',
        hintAfter: ha,
        praise: false,
        correctSay: () => {
          if (!last) return `${okWord()}, ${w(ans)}!`;
          const normal = `${okWord()}! ${Z.sayList(seq)}. Das sind lauter ${even ? 'gerade' : 'ungerade'} Zahlen.`;
          return proc(ctx, normal, [
            `Super! Du bist im Kopf immer zwei gehüpft. ${Z.sayList(seq)}.`,
            `Klasse! Du hast das Muster erkannt: immer zwei ${desc ? 'zurück' : 'weiter'}.`,
          ], 'hops');
        },
        explain: (item) => {
          const k = item.value;
          if (Math.abs(k - ans) === 1) return `Fast! Wir hüpfen immer zwei ${desc ? 'zurück' : 'weiter'}, nicht nur eins.`;
          if (Math.abs(k - ans) === 2) return 'Schau mal: Das ist ein Hüpfer zu weit.';
          return `Schau mal: Die ${W(k)} passt nicht in die Hüpf-Reihe.`;
        },
        hintSay: () => {
          stepTicks().forEach((tk) => tk.classList.add('is-hint'));
          return `Tipp: Geh von der ${W(ref)} zwei Striche ${forward ? 'weiter' : 'zurück'}. Zähl: eins, zwei.`;
        },
        modelSay: () => `Von der ${W(ref)} zwei ${forward ? 'weiter' : 'zurück'} ist die ${W(ans)}. Tipp sie an.`,
        onWrong: async (item, tile, n) => {
          if (n === ha + 1) await Z.countAlong(ctx, stepTicks(), { badge: false, words: ['eins', 'zwei'], cls: 'is-hint' });
        },
      });
      if (!ctx.active) return;
      fillCell(cell, ans);
      L.label(ans, String(ans), 'is-on is-new');
      known.add(ans);
      U.clear(holder);
      await ctx.sleep(250);
      if (!ctx.active) return;
    }
    await ctx.sleep(450);
  }

  async function arrowTask(ctx, t) {
    const n = t.n;
    const L = makeLine(20);
    const anchors = ctx.flow < 0 ? [0, 5, 10, 15, 20] : [0, 10, 20];
    anchors.forEach((x) => L.label(x, String(x), 'is-on'));
    const arr = L.arrow(n);
    L.ticks[n].classList.add('is-mark');
    const holder = el('div.znb-holder');
    ctx.stage.classList.add('znb-stage');
    ctx.stage.append(L.node, holder);
    await ctx.instruct('Welche Zahl zeigt der Pfeil?');
    if (!ctx.active) return;
    // nächster beschrifteter Strich als Startpunkt fürs Zählen
    const anchor = anchors.reduce((best, x) => (Math.abs(x - n) < Math.abs(best - n) ? x : best), anchors[0]);
    const path = () => {
      const dir = n > anchor ? 1 : -1;
      const r = [];
      for (let x = anchor + dir; dir > 0 ? x <= n : x >= n; x += dir) r.push(x);
      return r;
    };
    const set = new Set([n]);
    for (const p of U.shuffle([n - 1, n + 1]).concat(U.shuffle([n - 2, n + 2]), [20 - n])) {
      if (set.size >= 4) break;
      if (p >= 0 && p <= 20) set.add(p);
    }
    const items = numItems(Array.from(set).sort((a, b) => a - b), n);
    const ha = Z.hintAfterFor(ctx, items.length);
    await ctx.choices(items, {
      container: freshBox(holder),
      shuffle: false,
      size: 'small',
      hintAfter: ha,
      praise: false,
      onCorrect: () => { L.label(n, String(n), 'is-on is-new'); arr.classList.add('is-done'); },
      correctSay: () => proc(ctx, `${okWord()}, ${w(n)}!`, [
        `Super! Du hast von der ${W(anchor)} aus gezählt. Das ist schlau.`,
        'Klasse! Du hast die Striche genau gezählt.',
      ], 'arrow'),
      explain: (item) => {
        const k = item.value;
        if (Math.abs(k - n) === 1) return 'Ganz knapp! Zähl die Striche noch einmal ganz genau.';
        if (k === 20 - n) return 'Schau mal: Die Null ist links. Von links nach rechts werden die Zahlen größer.';
        return k < n ? `Fast! Der Pfeil steht weiter rechts als die ${W(k)}. Die Zahl ist größer.` : `Fast! Der Pfeil steht weiter links als die ${W(k)}. Die Zahl ist kleiner.`;
      },
      hintSay: () => {
        const lb = L.labels.get(anchor);
        if (lb) { ctx.hint(lb); ctx.timeout(() => ctx.unhint(lb), 3500); }
        return `Tipp: Fang bei der ${W(anchor)} an und zähl die Striche bis zum Pfeil.`;
      },
      modelSay: () => `Der Pfeil zeigt auf die ${W(n)}. Tipp sie an.`,
      onWrong: async (item, tile, k) => {
        if (k === ha + 1) {
          const p = path();
          await ctx.say(W(anchor) + ',');
          await Z.countAlong(ctx, p.map((x) => L.ticks[x]), { badge: false, words: p.map((x) => w(x)), cls: 'is-hint' });
        }
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(500);
  }

  /* ==================================================================
     Stufe 5: Ordnen, größte/kleinste, dazwischen, Ausblick bis 100
     ================================================================== */
  /** Zahlen zum Vergleichen: ein, zwei Zahlen ohne Zehner (6–9) und sonst
   *  nahe beieinander liegende Zahlen mit Zehner (Stellenwert-Vergleich). */
  function numberSet(count) {
    const singles = count >= 5 ? 2 : 1;
    const s = U.sample(range(6, 9), singles).concat(U.sample(range(11, 20), count - singles));
    return s.sort((a, b) => a - b);
  }

  async function sortTask(ctx, t) {
    const sorted = t.nums;
    const holder = el('div.znb-holder');
    const slotsRow = el('div.znb-slots');
    const slots = sorted.map((x, i) => {
      if (i > 0) slotsRow.appendChild(el('span.znb-lt', '<'));
      const s = el('div.znb-cell.is-ask', '?');
      slotsRow.appendChild(s);
      return s;
    });
    ctx.stage.classList.add('znb-stage');
    ctx.stage.append(el('div.znb-sortlbl', el('span', 'klein'), el('span', '→'), el('span', 'groß')), slotsRow, holder);
    await ctx.instruct('Ordne die Zahlen. Tippe zuerst die kleinste Zahl an.');
    if (!ctx.active) return;
    let rest = U.shuffle(sorted.slice());
    for (let i = 0; i < sorted.length; i++) {
      const ans = sorted[i];
      slots[i].classList.add('is-active');
      if (rest.length === 1) {
        await ctx.sleep(200);
        if (!ctx.active) return;
        fillCell(slots[i], ans);
        break;
      }
      if (i > 0) ctx.setInstruction('Welche Zahl ist jetzt die kleinste?');
      const items = numItems(rest, ans);
      const ha = Z.hintAfterFor(ctx, items.length);
      const restNow = rest.slice();
      let picked = null;
      await ctx.choices(items, {
        container: freshBox(holder),
        shuffle: false,
        ease: false,
        size: 'small',
        hintAfter: ha,
        praise: false,
        onCorrect: (item, tile) => { picked = tile; },
        correctSay: () => (i === 0 ? `${okWord()}, ${w(ans)} ist die kleinste!` : `${W(ans)}!`),
        explain: (item) => `Fast! Es gibt noch eine kleinere Zahl als die ${W(item.value)}.`,
        hintSay: () => (restNow.some((x) => x < 10) && restNow.some((x) => x >= 10)
          ? 'Tipp: Zahlen ohne Zehner sind am kleinsten. Schau, wer keinen Zehner hat.'
          : restNow.every((x) => x >= 10) ? 'Tipp: Alle haben einen Zehner. Dann schau auf die Einer.' : 'Tipp: Zähl im Kopf von eins los. Welche Zahl kommt zuerst?'),
        modelSay: () => `Die ${W(ans)} ist die kleinste von diesen Zahlen. Tipp sie an.`,
      });
      if (!ctx.active) return;
      await Z.flyNumber(ctx, picked, slots[i], String(ans));
      if (!ctx.active) return;
      fillCell(slots[i], ans);
      rest = rest.filter((x) => x !== ans);
    }
    U.clear(holder);
    const say = proc(ctx, `${okWord()}! ${Z.sayList(sorted)}. Von klein nach groß.`, [
      `Super! Du hast erst auf die Zehner geschaut und dann auf die Einer. ${Z.sayList(sorted)}.`,
      `Klasse geordnet! ${Z.sayList(sorted)}.`,
    ], 'sort');
    await ctx.correct(slotsRow, { say, praise: false });
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  async function extremeTask(ctx, t) {
    const nums = t.nums;
    const big = t.big;
    const ans = big ? Math.max(...nums) : Math.min(...nums);
    const holder = el('div.znb-holder');
    const label = el('div.prompt-box.znb-ask', U.emoji(big ? '🐘' : '🐭', 'mid-emoji'), el('span.prompt-text', big ? 'die größte Zahl' : 'die kleinste Zahl'));
    ctx.stage.classList.add('znb-stage');
    ctx.stage.append(label, holder);
    await ctx.instruct(big ? 'Tippe die größte Zahl an.' : 'Tippe die kleinste Zahl an.');
    if (!ctx.active) return;
    const items = numItems(nums, ans);
    const ha = Z.hintAfterFor(ctx, items.length);
    await ctx.choices(items, {
      container: freshBox(holder),
      shuffle: true,
      size: 'small',
      hintAfter: ha,
      praise: false,
      correctSay: () => proc(ctx, `${okWord()}! Die ${W(ans)} ist die ${big ? 'größte' : 'kleinste'}.`, [
        'Super! Du hast zuerst auf die Zehner geschaut. Das ist sehr schlau.',
        'Klasse verglichen! Zehner zuerst, dann die Einer.',
      ], 'ext'),
      explain: (item) => `Fast! Es gibt noch eine ${big ? 'größere' : 'kleinere'} Zahl als die ${W(item.value)}.`,
      hintSay: () => {
        const mixed = nums.some((x) => x < 10) && nums.some((x) => x >= 10);
        if (mixed) return big ? 'Tipp: Zahlen mit einem Zehner sind größer als Zahlen ohne Zehner. Dann schau auf die Einer.' : 'Tipp: Zahlen ohne Zehner sind kleiner als Zahlen mit Zehner.';
        return 'Tipp: Alle haben gleich viele Zehner. Schau auf die Einer.';
      },
      modelSay: () => `Die ${W(ans)} ist die ${big ? 'größte' : 'kleinste'}. Tipp sie an.`,
    });
    if (!ctx.active) return;
    await ctx.sleep(500);
  }

  async function betweenTask(ctx, t) {
    const { a, b, ans } = t;
    const holder = el('div.znb-holder');
    const strip = el('div.znb-strip',
      el('div.znb-cell', String(a)), el('span.znb-dots', '…'),
      el('div.znb-cell.is-ask.is-active', '?'), el('span.znb-dots', '…'), el('div.znb-cell', String(b)));
    const mid = strip.querySelector('.is-ask');
    ctx.stage.classList.add('znb-stage');
    ctx.stage.append(strip, holder);
    await ctx.instruct(`Welche Zahl liegt zwischen ${w(a)} und ${w(b)}?`);
    if (!ctx.active) return;
    const outside = U.pick([a - 1, b + 1, b + 2, a - 2].filter((x) => x >= 0 && x <= 20 && (x < a || x > b)));
    const values = [ans, a, b, outside].filter((x, i, arr) => x != null && arr.indexOf(x) === i);
    const items = numItems(values, ans);
    const ha = Z.hintAfterFor(ctx, items.length);
    let picked = null;
    await ctx.choices(items, {
      container: freshBox(holder),
      shuffle: true,
      size: 'small',
      hintAfter: ha,
      praise: false,
      onCorrect: (item, tile) => { picked = tile; },
      correctSay: () => proc(ctx, `${okWord()}! Die ${W(ans)} liegt zwischen ${w(a)} und ${w(b)}.`, [
        `Super! Du hast im Kopf von ${w(a)} bis ${w(b)} gezählt.`,
        'Klasse! Größer als die eine und kleiner als die andere, genau.',
      ], 'betw'),
      explain: (item) => {
        const k = item.value;
        if (k === a || k === b) return `Fast! Die ${W(k)} steht ja schon am Rand. Wir suchen eine Zahl dazwischen.`;
        return k < a ? `Schau mal: Die ${W(k)} ist kleiner als ${w(a)}. Sie liegt nicht dazwischen.` : `Schau mal: Die ${W(k)} ist größer als ${w(b)}. Sie liegt nicht dazwischen.`;
      },
      hintSay: () => `Tipp: Zähl von der ${W(a)} weiter bis zur ${W(b)}. Welche Zahl kommt unterwegs?`,
      modelSay: () => `${Z.sayList(range(a, b))}. Die ${W(ans)} liegt dazwischen. Tipp sie an.`,
    });
    if (!ctx.active) return;
    await Z.flyNumber(ctx, picked, mid, String(ans));
    if (!ctx.active) return;
    fillCell(mid, ans);
    await ctx.sleep(500);
  }

  async function hundertTask(ctx, t) {
    const { n, side } = t; // side 'next' → n+1, 'prev' → n-1
    const ans = side === 'next' ? n + 1 : n - 1;
    const house = makeHouse([[n - 1, n, n + 1]], 'is-tall');
    house.wins.forEach((win) => setWin(win, ''));
    setWin(house.wins.get(n), 'lit', n);
    setWin(house.wins.get(ans), 'ask active', '?');
    const holder = el('div.znb-holder');
    ctx.stage.classList.add('znb-stage');
    ctx.stage.append(house.node, holder);
    await ctx.instruct(side === 'next' ? `Welche Zahl kommt nach ${w(n)}?` : `Welche Zahl kommt vor ${w(n)}?`);
    if (!ctx.active) return;
    const z = Math.floor(n / 10);
    const set = new Set([ans]);
    const prefer = side === 'next'
      ? [Number(String(z) + '10'), z * 10, ans + 1, n - 1]
      : [n + 1, ans - 1, (z - 1) * 10, ans + 10];
    for (const p of prefer) { if (set.size >= 4) break; if (p != null && p > 0 && p !== ans) set.add(p); }
    let guard = 0;
    while (set.size < 4 && guard++ < 50) set.add(ans + U.randInt(-4, 4));
    const items = numItems(Array.from(set).sort((a, b) => a - b), ans);
    const ha = Z.hintAfterFor(ctx, items.length);
    let picked = null;
    await ctx.choices(items, {
      container: freshBox(holder),
      shuffle: false,
      size: 'small',
      hintAfter: ha,
      praise: false,
      onCorrect: (item, tile) => { picked = tile; },
      correctSay: () => proc(ctx, `${okWord()}! ${side === 'next' ? `Nach ${w(n)} kommt ${w(ans)}.` : `Vor ${w(n)} kommt ${w(ans)}.`}`, [
        'Wow! Du kennst sogar die großen Zahlen. Ein neuer Zehner, genau!',
        'Super! Das ist schon Zahlenraum bis hundert. Du bist ein echter Zahlen-Profi!',
      ], 'hund'),
      explain: (item) => {
        const k = item.value;
        if (k >= 100) return 'Fast! Das wäre eine riesige Zahl. Neun Einer und noch einer sind zehn Einer. Das gibt einen neuen Zehner.';
        if (side === 'next' && k < n) return `Fast! Die ${W(k)} ist kleiner. Wir suchen die Zahl danach.`;
        if (side === 'prev' && k > n) return `Fast! Die ${W(k)} ist größer. Wir suchen die Zahl davor.`;
        return `Schau mal: Die ${W(k)} ist kein direkter Nachbar.`;
      },
      hintSay: () => (side === 'next'
        ? `Tipp: Bei ${w(n)} sind alle Einer voll. Jetzt kommt ein neuer Zehner.`
        : `Tipp: Vor ${w(n)} geht es in den Zehner davor. Da sind alle Einer voll, also neun Einer.`),
      modelSay: () => `${side === 'next' ? `${W(n)}, ${w(ans)}` : `${W(ans)}, ${w(n)}`}. Tipp die ${W(ans)} an.`,
    });
    if (!ctx.active) return;
    const win = house.wins.get(ans);
    await Z.flyNumber(ctx, picked, win, String(ans));
    if (!ctx.active) return;
    setWin(win, 'filled', ans);
    await ctx.sleep(500);
  }

  /* ==================================================================
     Pools
     ================================================================== */
  function poolFor(kind, level, flow) {
    if (kind === 'both') {
      const p = level === 1 ? range(flow < 0 ? 2 : 2, flow < 0 ? 6 : 9) : range(10, 19);
      return p.map((n) => ({ kind, n, key: `Nachbarn ${n}` }));
    }
    if (kind === 'mid') {
      const p = level === 1 ? range(2, 9) : range(11, 19);
      return p.map((n) => ({ kind, n, key: `zwischen ${n - 1} und ${n + 1}` }));
    }
    if (kind === 'build') {
      const p = flow < 0 ? range(11, 15) : range(11, 20);
      return p.map((n) => ({ kind, n, key: `Baue ${n}` }));
    }
    if (kind === 'read') {
      const p = flow < 0 ? range(11, 16) : range(12, 20);
      return p.map((n) => ({ kind, n, key: `Lies ${n}` }));
    }
    if (kind === 'hops') return hopsPool(flow);
    if (kind === 'arrow') {
      const anchors = flow < 0 ? [0, 5, 10, 15, 20] : [0, 10, 20];
      let p = range(1, 19).filter((n) => !anchors.includes(n));
      if (flow > 0) p = p.filter((n) => [3, 4, 6, 7, 13, 14, 16, 17].includes(n));
      return p.map((n) => ({ kind, n, key: `Pfeil ${n}` }));
    }
    if (kind === 'sort') {
      const count = flow < 0 ? 3 : flow > 0 ? 5 : 4;
      return range(1, 6).map(() => {
        const nums = numberSet(count);
        return { kind, nums, key: 'ordne ' + nums.join(' ') };
      });
    }
    if (kind === 'extreme') {
      const count = flow < 0 ? 3 : 5;
      return range(1, 6).map(() => {
        const big = U.chance(0.5);
        let nums = numberSet(count);
        if (flow > 0) nums = U.sample(range(11, 20), count).sort((a, b) => a - b); // alle mit Zehner
        return { kind, nums, big, key: `${big ? 'größte' : 'kleinste'} ${nums.join(' ')}` };
      });
    }
    if (kind === 'between') {
      const p = [];
      for (let a = 1; a <= 17; a++) {
        const d = flow < 0 ? 2 : 2 + (a % 3);
        const b = a + d;
        if (b > 20) continue;
        const ans = U.randInt(a + 1, b - 1);
        p.push({ kind, a, b, ans, key: `zwischen ${a} und ${b}` });
      }
      return p.filter((x) => x.a >= (flow < 0 ? 5 : 8));
    }
    // hundert
    const p = [];
    for (let z = 2; z <= 9; z++) {
      p.push({ kind, n: z * 10 + 9, side: 'next', key: `nach ${z * 10 + 9}` });
      p.push({ kind, n: z * 10, side: 'prev', key: `vor ${z * 10}` });
    }
    return p;
  }

  let introduced = new Set();
  let buildCount = 0;

  LT.registerGame({
    id: 'zahlen-nachbarn',
    area: 'mathe1',
    title: 'Zahlen-Nachbarn',
    icon: '🏘️',
    levels: 5,
    rounds: ROUNDS,
    type: 'tasks',
    parent: {
      skill: 'Zahlenraum bis 20: Nachbarzahlen, Zehner und Einer, Zahlenstrahl, Ordnen (Ausblick bis 100)',
      goal: 'Ihr Kind lernt, wie die Zahlen bis 20 aufgebaut sind: Jede Zahl hat einen kleinen Nachbarn (eins weniger) und einen großen Nachbarn (eins mehr). 14 besteht aus 1 Zehner und 4 Einern – der Zehner steht vorne, auch wenn man „vier-zehn“ spricht. Am Zahlenstrahl findet es Zahlen und Zweierschritte, und es vergleicht und ordnet Zahlen. Das ist die Grundlage für das Rechnen im Zwanzigerraum und später bis 100.',
      levels: [
        'Nachbarzahlen bis 10 im Zahlenhaus (beide Nachbarn, „wer wohnt dazwischen?“) – Brücke aus der Vorschule',
        'Nachbarzahlen 10 bis 20, auch über das Stockwerk hinweg und an der 20 (nicht „110“)',
        'Zahlen 11 bis 20 aus Zehnerstangen und Einerwürfeln bauen und lesen; 10 Einer werden zu einem Zehner gebündelt',
        'Zahlenstrahl bis 20: Lücken in Zweierschritten (gerade/ungerade Zahlen) und Zahlen am Strahl ablesen',
        'Zahlen bis 20 ordnen, größte/kleinste Zahl, „liegt zwischen“; Ausblick: Nachbarn bis 100 am Zehnerübergang (39 → 40)',
      ],
      tip: 'Fragen Sie im Alltag nach Nachbarn: „Wir wohnen in Nummer 14. Wer wohnt links und rechts?“ Hausnummern, Seitenzahlen und Kalender sind tolle Zahlenstrahle. Wenn Ihr Kind 41 statt 14 schreibt: gemeinsam mit 1 Zehnerpack (z. B. 10 Stifte mit Gummi) und 4 einzelnen legen und sagen „Der Zehner steht vorne“.',
    },

    async task(ctx) {
      const level = ctx.taskLevel;
      if (ctx.index === 0) { introduced = new Set(); buildCount = 0; }
      const kind = kindFor(ctx, level, ctx.index);
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      if (KIND_INTRO[kind] && !introduced.has('k:' + kind)) {
        introduced.add('k:' + kind);
        await ctx.say(KIND_INTRO[kind]);
        if (!ctx.active) return;
      }
      const t = ctx.item(poolFor(kind, level, ctx.flow), (x) => x.key, { avoid: 3 });
      if (kind === 'both' || kind === 'mid') return houseTask(ctx, t, level);
      if (kind === 'build') {
        // Erst mit Ziffer, danach mit dem Zahlwort (da passiert der 41-Fehler)
        const digits = ctx.flow < 0 || buildCount === 0;
        buildCount++;
        return buildTask(ctx, t, digits);
      }
      if (kind === 'read') return readTask(ctx, t);
      if (kind === 'hops') return hopsTask(ctx, t);
      if (kind === 'arrow') return arrowTask(ctx, t);
      if (kind === 'sort') return sortTask(ctx, t);
      if (kind === 'extreme') return extremeTask(ctx, t);
      if (kind === 'between') return betweenTask(ctx, t);
      return hundertTask(ctx, t);
    },
  });
})();
