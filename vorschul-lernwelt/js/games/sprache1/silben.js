/* ==========================================================================
   Spiel „Silben klatschen“ (silben) – Wörter in Sprechsilben gliedern.

   Didaktik:
   - Silben sind die natürlichen Sprech-Einheiten eines Wortes. Beim
     Klatschen wird der Sprechrhythmus körperlich erlebt (Sprechen und
     Bewegen gleichzeitig) – so wie im Kindergarten.
   - Konkret → bildlich → symbolisch:
       Klatschen (Handlung)  →  Silbenbögen (Bild)  →  Zahl (Symbol)
     Jeder Klatscher legt sichtbar einen Silbenbogen ab. Nach der Antwort
     erscheinen die Bögen unter dem Wort (Silben abwechselnd blau/rot wie in
     der Silbenmethode) und Flo spricht die Silben deutlich getrennt vor:
     „Ba – na – ne“. Damit wird die Erkenntnis benannt.
   - Hilfe-Leiter: 1. Fehler → „Du hast viermal geklatscht. Banane hat weniger
     Silben.“ + langsam mitsprechen, 2. → Denkanstoß Hand unters Kinn (bei jeder
     Silbe geht das Kinn nach unten), 3. → Flo klatscht vor; danach zeigen
     gestrichelte Bögen, wie oft geklatscht wird (Hilfe bis zum Erfolg).
   - Wörter wählt ctx.item (Schlüssel = Wort), schwierige Wörter kommen wieder.
   - Stufen:
       1  Klatschen: Wörter mit 1–2 Silben
       2  Klatschen: Wörter mit bis zu 3 Silben
       3  Klatschen: lange Wörter mit 3–5 Silben
       4  Silbenzahl bestimmen: Zahl wählen (Klatschen bleibt als Hilfe)
       5  Welches Wort hat 3 Silben? – Bildauswahl nach Silbenzahl
   - Alle Sprechsilben stammen aus dem geprüften Lexikon bzw. der
     Gruppen-Datenbank; Wörter mit strittiger Silbenzahl sind ausgeschlossen.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S = LT.s1;

  /* ------------------------------------------------------------------
     Wörter: Lexikon + Gruppen-Datenbank + lange Wörter
     ------------------------------------------------------------------ */
  // Strittige Silbenzahl (Pin-gu-in/Pin-guin, Kas-ta-ni-e/Kas-ta-nie …) → nicht verwenden
  const EXCLUDE = new Set(['kastanie', 'marienkaefer', 'pinguin', 'orange', 'puzzle']);
  const EXTRA = [
    ['🍉', 'Wassermelone', 'die', 'Was-ser-me-lo-ne'],
    ['🚂', 'Lokomotive', 'die', 'Lo-ko-mo-ti-ve'],
    ['🕶️', 'Sonnenbrille', 'die', 'Son-nen-bril-le'],
  ];
  let POOL = null;
  function pool() {
    if (POOL) return POOL;
    const map = new Map();
    const add = (e, w, a, s) => { if (!map.has(w)) map.set(w, { e: S.fe0f(e), w, a, s }); };
    LT.lexikon.words.forEach((x) => { if (!EXCLUDE.has(x.id)) add(x.e, x.w, x.a, x.s.slice()); });
    S.words.forEach((x) => { if (x.w !== 'Avocado') add(x.e, x.w, x.a, x.s.slice()); });
    EXTRA.forEach(([e, w, a, s]) => add(e, w, a, s.split('-')));
    POOL = Array.from(map.values());
    return POOL;
  }
  const byCount = (n) => pool().filter((x) => x.s.length === n);
  const pickWord = (n, avoid = []) => {
    const list = byCount(n).filter((x) => !avoid.includes(x.e));
    return U.pickFresh('silben-w', list, 14, (x) => x.w);
  };

  const LV = {
    1: { mode: 'clap', counts: [1, 2, 2] },
    2: { mode: 'clap', counts: [1, 2, 3, 3] },
    3: { mode: 'clap', counts: [3, 4, 4, 5] },
    4: { mode: 'count', counts: [1, 2, 2, 3, 3, 4, 5] },
    5: { mode: 'pick' },
  };
  const kindOf = (lv) => (LV[lv] || LV[1]).mode;

  /**
   * Wort der Aufgabe: Silbenzahl zufällig nach Stufe gewichtet, das Wort selbst
   * wählt ctx.item (Wiederholung schwieriger Wörter; fällige Wörter mit einer
   * anderen erlaubten Silbenzahl bleiben im Pool).
   */
  function chooseWord(ctx, counts) {
    const n = U.pick(counts);
    const allowed = pool().filter((x) => counts.includes(x.s.length));
    return ctx.item(S.poolWithDue(ctx, allowed, (x) => x.w, (x) => x.s.length === n), (x) => x.w, { avoid: 14 });
  }

  /* ------------------------------------------------------------------
     Klatsch-Werkzeug: großer Klatsch-Knopf + Ablage für Silbenbögen
     ------------------------------------------------------------------ */
  function makeClapper(ctx, { max = 6, small = false } = {}) {
    const tray = el('div.s1-tray' + (small ? '.small' : ''), { 'aria-label': 'Geklatschte Silben' });
    const clapBtn = el('button.s1-clap' + (small ? '.small' : ''), { type: 'button', 'aria-label': 'Klatschen', title: 'Klatschen' }, U.emoji('👏'));
    const resetBtn = el('button.btn-round.s1-reset', { type: 'button', 'aria-label': 'Nochmal von vorn', title: 'Nochmal von vorn' }, U.emoji('🔄'));
    const C = { tray, clapBtn, resetBtn, taps: 0, ghosts: 0, enabled: true, onChange: null };
    C.reset = () => {
      C.taps = 0;
      U.clear(tray);
      for (let i = 0; i < C.ghosts; i++) tray.appendChild(S.arc('ghost'));
      if (C.onChange) C.onChange();
    };
    C.setGhosts = (g) => {
      C.ghosts = g;
      C.reset();
    };
    C.tap = () => {
      if (!C.enabled || !ctx.active) return;
      const limit = C.ghosts || max;
      if (C.taps >= limit) {
        LT.ui.animate(clapBtn, 'shake');
        return;
      }
      C.taps++;
      S.clap();
      LT.ui.animate(clapBtn, 's1-clapped');
      if (C.ghosts) {
        const g = tray.children[C.taps - 1];
        g.classList.remove('ghost');
        LT.ui.animate(g, 'pop');
      } else {
        tray.appendChild(S.arc('pop'));
      }
      if (C.onChange) C.onChange();
    };
    ctx.listen(clapBtn, 'click', () => C.tap());
    ctx.listen(resetBtn, 'click', () => {
      if (!C.enabled || !C.taps) return;
      LT.sfx.play('whoosh');
      C.reset();
    });
    return C;
  }

  /** Silbenbögen unter dem Wort in der Bildkarte einblenden. */
  function showSyllables(card, word) {
    if (card._syl) return card._syl;
    const sw = S.sylWord(word.s);
    if (card._label) card._label.replaceWith(sw);
    else card.appendChild(sw);
    card._syl = sw;
    return sw;
  }

  /** Flo klatscht die Silben vor (Bögen + Klatschen + getrenntes Sprechen). */
  async function demonstrate(ctx, card, word, clapper) {
    const sw = showSyllables(card, word);
    const wasEnabled = clapper ? clapper.enabled : false;
    if (clapper) {
      clapper.enabled = false;
      clapper.ghosts = 0;
      clapper.reset();
    }
    await S.speakSyllables(ctx, word.s, {
      onEach: (i) => {
        sw.highlight(i);
        if (i >= 0 && clapper) {
          LT.ui.animate(clapper.clapBtn, 's1-clapped');
          clapper.tray.appendChild(S.arc('pop'));
        }
      },
    });
    if (clapper) clapper.enabled = wasEnabled;
  }

  /** Abschluss nach richtiger Antwort: Silben deutlich getrennt + ganzes Wort. */
  async function consolidate(ctx, card, word, arcs) {
    const sw = showSyllables(card, word);
    if (word.s.length > 1) {
      await S.speakSyllables(ctx, word.s, {
        onEach: (i) => {
          sw.highlight(i);
          (arcs || []).forEach((a, k) => a.classList.toggle('on', k === i));
        },
      });
      await ctx.say(word.w + '!');
    }
  }

  /* ------------------------------------------------------------------
     Stufen 1–3: Klatschen
     ------------------------------------------------------------------ */
  async function clapTask(ctx, word) {
    const n = word.s.length;
    const card = S.card(word);
    const clapper = makeClapper(ctx);
    const doneBtn = el('button.s1-done', { type: 'button', 'aria-label': 'Fertig', title: 'Fertig' }, U.emoji('✅'));
    ctx.stage.append(card, clapper.tray, el('div.s1-controls', clapper.resetBtn, clapper.clapBtn, doneBtn));

    let busy = true;
    let finished = false;
    let guided = false;
    let finish;
    const done = new Promise((r) => (finish = r));

    const update = () => {
      doneBtn.disabled = busy || clapper.taps === 0;
      clapper.resetBtn.disabled = busy || clapper.taps === 0;
      doneBtn.classList.toggle('s1-pulse', guided && clapper.taps === n && !busy);
      clapper.clapBtn.classList.toggle('s1-off', busy && !finished);
      if (LT.config.test) {
        const ready = !busy && !finished;
        ctx.markTest(clapper.clapBtn, ready && clapper.taps < n);
        ctx.markTest(doneBtn, ready && clapper.taps >= n);
      }
    };
    clapper.onChange = update;
    const setBusy = (b) => {
      busy = b;
      clapper.enabled = !b;
      update();
    };
    setBusy(true);

    ctx.listen(doneBtn, 'click', async () => {
      if (busy || finished || !clapper.taps) return;
      setBusy(true);
      const taps = clapper.taps;
      if (taps === n) {
        finished = true;
        update();
        await ctx.correct(clapper.tray, {
          say: n === 1 ? `Richtig! ${word.w} hat nur eine Silbe.` : S.proc(ctx,
            `Richtig! ${U.cap(S.silben(n))}!`,
            `Richtig, du hast bei jeder Silbe geklatscht: ${S.silben(n)}.`),
        });
        await consolidate(ctx, card, word, Array.from(clapper.tray.children));
        finish();
        return;
      }
      // Hilfe-Leiter: 1 erklären (zu wenig / zu viel) → 2 Denkanstoß (Hand unters Kinn) → 3 vorklatschen
      const say = `Du hast ${S.times(taps)} geklatscht. ${word.w} hat ${taps < n ? 'mehr' : 'weniger'} Silben.`;
      await ctx.wrong(clapper.tray, { say });
      if (!ctx.active) return;
      const step = ctx.helpStep;
      if (step >= 3 && !guided) {
        guided = true;
        ctx.modelShown = true;
        await ctx.say('Pass auf, ich klatsche es dir vor!');
        await demonstrate(ctx, card, word, clapper);
        await ctx.say(`${U.cap(S.silben(n))}. Jetzt du! Klatsch mit und tippe dann auf den Haken.`);
        clapper.setGhosts(n);
      } else if (step === 2) {
        clapper.reset();
        await ctx.say('Leg deine Hand unter das Kinn und sprich ganz langsam mit.');
        await ctx.say(word.w, { rate: 0.6 });
        await ctx.say('Bei jeder Silbe geht dein Kinn nach unten. Klatsch dazu!');
      } else {
        clapper.reset();
        await ctx.say(`Sprich ganz langsam mit: ${word.w}.`, { rate: 0.65 });
      }
      setBusy(false);
    });

    if (ctx.index === 0) {
      await ctx.say('Wir klatschen Silben! Sprich das Wort langsam. Bei jeder Silbe tippst du einmal auf die klatschenden Hände. Zum Schluss tippst du auf den grünen Haken.');
    }
    await ctx.instruct(`Das ist ${S.withArticle(word)}. Klatsch mal: ${word.w}!`);
    setBusy(false);
    return done;
  }

  /* ------------------------------------------------------------------
     Stufe 4: Silbenzahl bestimmen
     ------------------------------------------------------------------ */
  async function countTask(ctx, word) {
    const n = word.s.length;
    const card = S.card(word);
    const clapper = makeClapper(ctx, { small: true });
    clapper.onChange = () => { clapper.resetBtn.disabled = !clapper.taps; };
    clapper.resetBtn.disabled = true;
    const box = el('div.choices.s1-choices.s1-numbox');
    ctx.stage.append(card, el('div.s1-toolrow', clapper.resetBtn, clapper.clapBtn, clapper.tray), box);

    const options = n <= 3 ? [1, 2, 3, 4] : [2, 3, 4, 5];
    const items = options.map((k) => ({
      content: el('span.s1-num', el('b', String(k)), S.arcRow(k, 'mini')),
      say: S.silben(k),
      aria: S.silben(k),
      correct: k === n,
      k,
    }));
    const lock = S.lock(ctx, box);
    const p = ctx.choices(items, {
      container: box,
      shuffle: false,
      size: 'small',
      hintAfter: 2,
      correctSay: () => S.proc(ctx,
        `Richtig! ${word.w} hat ${S.silben(n)}.`,
        `Richtig, du hast die Silben genau gezählt: ${word.w} hat ${S.silben(n)}.`),
      // Hilfe-Leiter: 1 zu wenig oder zu viel? → 2 Denkanstoß (Kinn) → 3 Flo klatscht vor
      // (beim 3. Fehler klatscht gleich Flo vor – dann keine Aufforderung zum Selberklatschen)
      explain: (it) => `${word.w} hat ${it.k < n ? 'mehr' : 'weniger'} als ${S.silben(it.k)}.` + (ctx.wrongCount >= 2 ? '' : ' ' + S.vary('silben-wrong', ['Klatsch noch mal mit!', 'Sprich langsam mit und klatsche!'])),
      hintSay: () => 'Leg deine Hand unter das Kinn und sprich das Wort langsam. Zähl, wie oft dein Kinn nach unten geht.',
      onWrong: async (it, tile, k) => {
        if (k === 3) {
          await ctx.say('Hör mal, ich klatsche es dir vor:');
          await demonstrate(ctx, card, word, clapper);
        }
      },
      modelSay: () => (n === 1 ? 'Das war nur eine Silbe. Tipp auf die Eins.' : `Das waren ${S.silben(n)}. Tipp auf die ${U.cap(U.numberWord(n))}.`),
    });
    if (ctx.index === 0) await ctx.say('Wie viele Silben hat das Wort? Du kannst zuerst klatschen. Dann tippe auf die richtige Zahl.');
    await ctx.instruct(`Wie viele Silben hat ${word.w}?`);
    lock.release();
    await p;
    clapper.enabled = false;
    await consolidate(ctx, card, word, null);
  }

  /* ------------------------------------------------------------------
     Stufe 5: Welches Wort hat … Silben?
     ------------------------------------------------------------------ */
  async function pickTask(ctx) {
    // Zielwort über ctx.item; die anderen Bilder haben andere Silbenzahlen
    const all = pool().filter((x) => x.s.length <= 5);
    const nRand = U.randInt(1, 5);
    const goal = ctx.item(S.poolWithDue(ctx, all, (x) => x.w, (x) => x.s.length === nRand), (x) => x.w, { avoid: 14 });
    const n = goal.s.length;
    // Knobel-Aufgabe: vier Bilder; leichter: Silbenzahlen liegen weit auseinander
    const nOpts = ctx.flow > 0 && ctx.level === 5 ? 4 : 3;
    const rest = U.shuffle([1, 2, 3, 4, 5].filter((c) => c !== n));
    if (ctx.flow < 0) rest.sort((a, b) => Math.abs(b - n) - Math.abs(a - n));
    const counts = [n].concat(rest.slice(0, nOpts - 1));
    const words = [goal];
    counts.slice(1).forEach((c) => words.push(pickWord(c, words.map((w) => w.e))));
    const target = el('div.prompt-box.s1-target', S.arcRow(n, 'big'), el('b', String(n)));
    const box = el('div.choices.s1-choices');
    ctx.stage.append(target, box);
    const items = words.map((x) => ({ content: x.e, say: x.w, correct: x.s.length === n, x }));
    const lock = S.lock(ctx, box);
    const p = ctx.choices(items, {
      container: box,
      sayButton: true,
      size: 'large',
      correctSay: (it) => (n === 1 ? `Richtig! ${it.x.w} hat nur eine Silbe.` : `Richtig! ${S.joinSyl(it.x.s)}. ${it.x.w} hat ${S.silben(n)}.`),
      explain: (it) => `${it.x.s.length > 1 ? S.joinSyl(it.x.s) + ': ' : ''}${it.x.w} hat ${S.silben(it.x.s.length)}. Wir suchen ein Wort ${S.mitSilben(n)}.`,
      hintSay: () => 'Klatsch bei jedem Bild leise mit und zähl die Silben.',
      modelSay: (it) => (n === 1 ? `Schau: ${it.x.w} hat nur eine Silbe.` : `Schau: ${S.joinSyl(it.x.s)}. ${it.x.w} hat ${S.silben(n)}.`),
    });
    const q = `Welches Wort hat ${S.silben(n)}?`;
    if (ctx.index === 0) await ctx.say('Jetzt suchen wir Wörter mit einer bestimmten Anzahl Silben. Klatsch leise mit!');
    await ctx.instruct(q);
    await S.nameTiles(ctx, box);
    ctx.setInstruction(q + ' ' + words.map((w) => w.w).join(', ') + '?');
    lock.release();
    await p;
  }

  LT.registerGame({
    id: 'silben',
    area: 'sprache',
    title: 'Silben klatschen',
    icon: '👏',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Silben hören, klatschen und zählen',
      goal: 'Ihr Kind gliedert Wörter in Sprechsilben. Durch das Klatschen wird der Sprechrhythmus mit dem Körper erlebt, die Silbenbögen machen die Silben sichtbar. Das Zerlegen in Silben ist eine zentrale Vorläuferfähigkeit für das Lesen (Silbe für Silbe) und das spätere Schreiben.',
      levels: [
        'Stufe 1: Klatschen – Wörter mit 1 oder 2 Silben (Hund, Kat-ze)',
        'Stufe 2: Klatschen – Wörter mit bis zu 3 Silben (Ba-na-ne)',
        'Stufe 3: Klatschen – lange Wörter mit 3 bis 5 Silben (Feu-er-wehr-au-to)',
        'Stufe 4: Silbenzahl bestimmen und die passende Zahl wählen (Klatschen als Hilfe)',
        'Stufe 5: „Welches Wort hat drei Silben?“ – Bilder nach Silbenzahl auswählen',
      ],
      tip: 'Klatschen, stampfen oder hüpfen Sie gemeinsam Namen und Wörter: „Ma-ma“, „Scho-ko-la-de“. Wer hat den längsten Namen in der Familie? Beim Treppensteigen gibt es pro Silbe eine Stufe. Wichtig: langsam und deutlich sprechen – die Silben „hört“ man am besten am eigenen Mund.',
    },

    async task(ctx) {
      const lv = S.lv(ctx, kindOf);
      const cfg = LV[lv] || LV[1];
      if (cfg.mode === 'pick') return pickTask(ctx);
      // Anpassung innerhalb der Aufgabenart (wenn ctx.taskLevel die Art wechseln würde)
      let counts = cfg.counts;
      if (lv === ctx.level && ctx.flow < 0 && lv === 1) counts = [1, 2];
      if (lv === ctx.level && ctx.flow > 0 && lv === 3) counts = [4, 4, 5];
      if (lv === ctx.level && ctx.flow > 0 && lv === 4) counts = [3, 4, 5];
      const word = chooseWord(ctx, counts);
      if (cfg.mode === 'count') return countTask(ctx, word);
      return clapTask(ctx, word);
    },
  });
})();
