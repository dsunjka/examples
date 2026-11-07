/* ==========================================================================
   Spiel „Anlaute hören“ (anlaut) – Anfangslaute erkennen, Buchstaben zuordnen.

   Didaktik:
   - Den ersten Laut eines Wortes herauszuhören ist der Übergang von der
     Silben- zur Lautebene (phonologische Bewusstheit im engeren Sinn).
   - Gearbeitet wird über GANZE Wörter: „Welches Bild fängt so an wie Mond?“
     Die Vorlesestimme spricht isolierte Laute unzuverlässig; Buchstaben
     werden deshalb mit ihrem Namen genannt, immer mit Schlüsselwort
     („M wie Maus“) – wie in einer Anlauttabelle.
   - Nur EINDEUTIGE Anlaute (automatisch aus der geprüften Datenbank):
       · kein V (Vogel = f), kein C/Ch/Qu/X/Y
       · keine Doppellaute Ei/Eu/Au (Eis ≠ „E“, Auto ≠ „A“)
       · keine Konsonantenhäufungen (St, Sp, Pf, Schw, Kr, Br …)
       · Sch + Vokal zählt als EIN Laut (Schaf, Schuh, Schere)
       · keine Bilder mit zwei üblichen Namen (🥕 Karotte/Möhre,
         🦛 Nilpferd/Flusspferd, ⏰ Wecker/Uhr …)
   - Stufen:
       1  Bild zu Bild: 2 Bilder, deutlich verschiedene Laute
       2  Bild zu Bild: 3 Bilder, deutlich verschiedene Laute
       3  Buchstabe zum Anlaut: 3 Buchstaben mit Anlautbild („M wie Mond“)
       4  Bild zu Bild mit ähnlich klingenden Lauten (M/N, B/P, D/T, G/K,
          F/W, S/Sch/Z, L/R)
       5  Buchstabe zum Anlaut ohne Bildhilfe, 4 Buchstaben, auch ähnliche
          Laute, Sch und Selbstlaute (A, E, I, O, U)
   - Fehler: Flo stellt die beiden Wörter gegenüber („Mond – Kuh: Das klingt
     am Anfang anders.“); nach 2 Fehlversuchen wird die Lösung hervorgehoben.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S = LT.s1;

  const VOWELS = ['A', 'E', 'I', 'O', 'U'];
  /** Ähnlich klingende Laute (Artikulationsort/-art ähnlich) */
  const SIMILAR = {
    M: ['N'], N: ['M'], B: ['P', 'D'], P: ['B', 'T'], D: ['T', 'B'], T: ['D', 'P'], G: ['K'], K: ['G'],
    F: ['W'], W: ['F'], S: ['Sch', 'Z'], Sch: ['S'], Z: ['S'], L: ['R'], R: ['L'], H: [],
    A: ['E'], E: ['I', 'A'], I: ['E'], O: ['U'], U: ['O'],
  };
  const isSim = (a, b) => (SIMILAR[a] || []).includes(b) || (SIMILAR[b] || []).includes(a);

  /* Buchstaben-Familien aus der geprüften Datenbank (nur eindeutige Bilder) */
  const FAM = {};
  S.words.forEach((x) => {
    if (x.x) return;
    const L = S.letterOf(x);
    if (!L) return;
    (FAM[L] = FAM[L] || []).push(x);
  });
  const LETTERS = Object.keys(FAM).filter((L) => FAM[L].length >= 2);
  const CONS = LETTERS.filter((L) => !VOWELS.includes(L));
  /** Gut hörbare (dehnbare) Laute für den Einstieg */
  const EASY = ['M', 'S', 'F', 'L', 'R', 'Sch', 'W', 'N'].filter((L) => CONS.includes(L));
  const SIM_TARGETS = CONS.filter((L) => (SIMILAR[L] || []).some((s) => LETTERS.includes(s)));

  const letterSize = (L) => (L.length > 1 ? 'long' : '');

  /** Buchstaben, die NICHT ähnlich zu `L` (und untereinander verschieden) sind */
  function clearContrasts(L, n, pool) {
    const out = [];
    for (const D of U.shuffle(pool)) {
      if (out.length >= n) break;
      if (D === L || isSim(D, L) || out.some((o) => o === D)) continue;
      out.push(D);
    }
    return out;
  }
  const wordOf = (L, avoid = []) => U.pick(FAM[L].filter((x) => !avoid.includes(x)));

  const INTRO = {
    1: 'Wir hören ganz genau auf den Anfang von Wörtern! Hör gut zu.',
    2: 'Wir hören auf den Anfang von Wörtern. Welches Bild fängt genauso an?',
    3: 'Jetzt suchen wir den passenden Buchstaben. Jeder Buchstabe hat ein Bild – wie in einer Anlauttabelle.',
    4: 'Jetzt wird es knifflig: Manche Anfänge klingen sehr ähnlich. Hör ganz genau hin!',
    5: 'Jetzt kennst du schon viele Buchstaben! Mit welchem Buchstaben fängt das Wort an?',
  };

  /** Bilder/Buchstaben zeigen, Frage vorlesen, Kacheln benennen, dann antworten lassen. */
  async function ask(ctx, items, question, opts) {
    const box = el('div.choices.s1-choices');
    ctx.stage.appendChild(box);
    const lock = S.lock(ctx, box);
    const p = ctx.choices(items, Object.assign({ container: box, sayButton: true, size: items.length <= 3 ? 'large' : undefined, className: items.length === 4 ? 's1-grid4' : '' }, opts));
    if (ctx.index === 0) await ctx.say(INTRO[ctx.level]);
    await ctx.instruct(question);
    await S.nameTiles(ctx, box);
    ctx.setInstruction(question + ' ' + items.map((i) => i.say).join(', ') + '.');
    lock.release();
    return p;
  }

  /* ------------------------------------------------------------------
     Bild zu Bild (Stufen 1, 2, 4)
     ------------------------------------------------------------------ */
  async function pictureTask(ctx) {
    const lv = ctx.level;
    const T = lv === 1 ? U.pickFresh('anl-easy', EASY, 3) : lv === 4 ? U.pickFresh('anl-sim', SIM_TARGETS, 4) : U.pickFresh('anl-cons', CONS, 5);
    const [prompt, match] = U.sample(FAM[T], 2);
    let disLetters;
    if (lv === 4) {
      const sim = U.pick((SIMILAR[T] || []).filter((s) => LETTERS.includes(s)));
      const other = clearContrasts(T, 1, LETTERS.filter((L) => L !== sim))[0];
      disLetters = [sim, other];
    } else {
      disLetters = clearContrasts(T, lv === 1 ? 1 : 2, CONS);
    }
    const dis = disLetters.map((L) => wordOf(L));
    const card = S.card(prompt);
    ctx.stage.appendChild(card);
    const items = [match].concat(dis).map((x) => ({ content: x.e, say: x.w, correct: x === match, x }));
    await ask(ctx, items, `Welches Bild fängt so an wie ${prompt.w}?`, {
      correctSay: (it) => `Richtig! ${prompt.w} und ${it.x.w} fangen beide mit ${T} an.`,
      wrongSay: (it) => (lv === 4
        ? `${prompt.w} – ${it.x.w}. Hör genau: ${it.x.w} fängt mit ${S.letterOf(it.x)} an.`
        : `${prompt.w} – ${it.x.w}. Das klingt am Anfang anders. Hör noch mal genau hin!`),
      hintSay: () => `Hör mal: ${prompt.w} – ${match.w}. Das klingt am Anfang gleich!`,
      onCorrect: () => LT.ui.animate(card, 'joy'),
    });
  }

  /* ------------------------------------------------------------------
     Buchstabe zum Anlaut (Stufen 3, 5)
     ------------------------------------------------------------------ */
  async function letterTask(ctx) {
    const lv = ctx.level;
    const T = lv === 3 ? U.pickFresh('anl-l3', U.chance(0.8) ? CONS : LETTERS, 5) : U.pickFresh('anl-l5', LETTERS, 6);
    const prompt = wordOf(T);
    let others;
    if (lv === 3) {
      others = clearContrasts(T, 2, CONS);
    } else {
      const sims = U.shuffle((SIMILAR[T] || []).filter((s) => LETTERS.includes(s))).slice(0, 2);
      others = sims.concat(clearContrasts(T, 3 - sims.length, LETTERS.filter((L) => !sims.includes(L))));
    }
    // Schlüsselwort je Buchstabe („M wie Mond“) – nie das gefragte Wort selbst
    const key = {};
    [T].concat(others).forEach((L) => { key[L] = wordOf(L, [prompt]); });

    const card = S.card(prompt);
    ctx.stage.appendChild(card);
    const items = [T].concat(others).map((L) => ({
      content: lv === 3
        ? el('span.s1-letter-tile', el('span.s1-letter.' + (letterSize(L) || 'short'), L), U.emoji(key[L].e, 's1-letter-key'))
        : el('span.s1-letter.big.' + (letterSize(L) || 'short'), L),
      say: lv === 3 ? `${L} wie ${key[L].w}` : L,
      aria: `${L} wie ${key[L].w}`,
      correct: L === T,
      L,
    }));
    await ask(ctx, items, `Mit welchem Buchstaben fängt ${prompt.w} an?`, {
      correctSay: () => `Richtig! ${prompt.w} fängt mit ${T} an. ${T} wie ${prompt.w}!`,
      wrongSay: (it) => `Das ist das ${it.L}, wie ${key[it.L].w}. ${prompt.w} fängt anders an.`,
      hintSay: () => `Hör mal: ${prompt.w}. ${T} wie ${key[T].w}!`,
      onCorrect: () => LT.ui.animate(card, 'joy'),
    });
  }

  LT.registerGame({
    id: 'anlaut',
    area: 'sprache',
    title: 'Anlaute hören',
    icon: '👂',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Anlaute hören & Buchstaben zuordnen',
      goal: 'Ihr Kind lernt, den ersten Laut eines Wortes herauszuhören und Wörter mit gleichem Anlaut zu finden. Danach ordnet es dem Laut den passenden Buchstaben zu – wie in einer Anlauttabelle („M wie Maus“). So entsteht die Verbindung zwischen gesprochener Sprache und Schrift. Verwendet werden nur eindeutige Anlaute (kein V wie in Vogel, keine Doppellaute wie Ei/Au, keine Lauthäufungen wie St/Sp/Pf); Sch zählt als ein Laut.',
      levels: [
        'Stufe 1: Gleicher Anfang? 2 Bilder, gut unterscheidbare Laute (Mond – Maus oder Tiger?)',
        'Stufe 2: 3 Bilder, gut unterscheidbare Laute',
        'Stufe 3: Den passenden Buchstaben wählen – mit Anlautbild („M wie Mond“)',
        'Stufe 4: Ähnlich klingende Laute unterscheiden (M/N, B/P, D/T, G/K, F/W, S/Sch/Z, L/R)',
        'Stufe 5: Buchstaben ohne Bildhilfe – auch ähnliche Laute, Sch und Selbstlaute (A, E, I, O, U)',
      ],
      tip: 'Spielen Sie „Ich sehe was, was du nicht siehst, und das fängt mit mmm an.“ Sprechen Sie dabei den LAUT (mmm, sss, fff), nicht den Buchstabennamen („Em“) – die Vorlesestimme der App nennt Buchstaben mit Namen, weil sie Einzellaute nicht sauber sprechen kann. Gut zum Einstieg sind dehnbare Laute wie M, S, F, L und Sch.',
    },

    async task(ctx) {
      if (ctx.level === 3 || ctx.level === 5) return letterTask(ctx);
      return pictureTask(ctx);
    },
  });
})();
