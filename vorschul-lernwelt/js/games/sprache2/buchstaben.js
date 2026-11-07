/* ==========================================================================
   Spiel „ABC-Entdecker“ (buchstaben) – Buchstabenkenntnis mit Anlauttabelle

   Didaktik:
   - Buchstabe und Laut werden immer über ein festes Bildwort verknüpft
     („M wie Maus“) – genau so arbeiten Anlauttabellen in der Grundschule.
   - Die komplette Anlauttabelle ist jederzeit über den ABC-Knopf erreichbar:
     freies Erkunden (Antippen → „M wie Maus“) und „Alle anhören“.
   - Progression (konkret → symbolisch):
       1  häufige, gut unterscheidbare Großbuchstaben (M, A, L, O …), 3 Optionen
       2  alle Großbuchstaben, 4 Optionen, darunter ein ähnlich aussehender
       3  Groß- und Kleinbuchstaben einander zuordnen (M ↔ m)
       4  Anlaut hören: „Mit welchem Buchstaben fängt Mond an?“
          (Hilfe: Vergleich mit dem Bildwort der Anlauttabelle)
       5  der eigene Name (Lücke füllen) – abwechselnd mit leicht
          verwechselbaren Buchstaben (b/d/p/q, M/W, E/F …) inkl. Formtipps
   - Hilfen: nach dem 1. Fehler ein gezielter Tipp (Form, langsames Vorsprechen),
     nach dem 2. Fehler wird die Lösung hervorgehoben und benannt.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S2 = LT.s2;

  /* ---------------- Daten ---------------- */

  /** Stufe 1: häufige Buchstaben; leicht verwechselbare nicht gemeinsam anbieten. */
  const FREQ = ['M', 'A', 'L', 'O', 'I', 'E', 'U', 'S', 'R', 'N', 'T', 'H'];
  const FREQ_AVOID = { M: ['N'], N: ['M', 'H'], H: ['N'], I: ['L', 'T'], L: ['I', 'E'], T: ['I'], E: ['L'] };

  /** Ähnlich aussehende Buchstaben (für etwas knackigere Ablenker ab Stufe 2). */
  const LOOK_UP = {
    A: ['V', 'H'], B: ['P', 'R', 'D'], C: ['G', 'O'], D: ['O', 'B'], E: ['F'], F: ['E', 'P'], G: ['C'], H: ['N'],
    I: ['L', 'T'], J: ['I', 'T'], K: ['X', 'R'], L: ['I', 'J'], M: ['N', 'W'], N: ['M', 'H'], O: ['Q', 'C', 'D'],
    P: ['R', 'B', 'F'], Q: ['O'], R: ['P', 'B', 'K'], S: ['Z'], T: ['I', 'J'], U: ['V', 'O'], V: ['U', 'W', 'Y'],
    W: ['M', 'V'], X: ['Y', 'K'], Y: ['V', 'X'], Z: ['N', 'S'],
  };
  const LOOK_LOW = {
    a: ['o', 'd'], b: ['d', 'p'], c: ['e', 'o'], d: ['b', 'q'], e: ['c', 'o'], f: ['t'], g: ['q', 'p'], h: ['n', 'b'],
    i: ['j', 'l'], j: ['i'], k: ['h'], l: ['i', 't'], m: ['n', 'w'], n: ['u', 'm', 'h'], o: ['a', 'c'], p: ['q', 'b'],
    q: ['p', 'd'], r: ['n'], s: ['z'], t: ['l', 'f'], u: ['n', 'v'], v: ['y', 'w'], w: ['m', 'v'], x: ['k'], y: ['v'], z: ['s'],
  };

  /** Stufe 4: Wörter mit eindeutigem Anlaut (kein Sch/St/Sp/Pf, kein Au/Ei/Eu am Wortanfang).
      C, Q, V, X und Y fehlen bewusst: Ihr Laut ist nicht „typisch“ (V = f, C = k …). */
  const ANLAUT = {
    A: [['🐒', 'Affe'], ['🐜', 'Ameise'], ['🍍', 'Ananas'], ['⚓', 'Anker'], ['🍎', 'Apfel']],
    B: [['🍌', 'Banane'], ['⚽', 'Ball'], ['🐻', 'Bär'], ['🐝', 'Biene'], ['📖', 'Buch'], ['🚌', 'Bus'], ['🌳', 'Baum'], ['🛏️', 'Bett']],
    D: [['🦕', 'Dino'], ['🐬', 'Delfin'], ['🍩', 'Donut'], ['🪁', 'Drachen']],
    E: [['🐘', 'Elefant'], ['🦆', 'Ente'], ['🍓', 'Erdbeere']],
    F: [['🦊', 'Fuchs'], ['🐟', 'Fisch'], ['🐸', 'Frosch'], ['🔥', 'Feuer'], ['🚲', 'Fahrrad']],
    G: [['🦒', 'Giraffe'], ['🥒', 'Gurke'], ['🎁', 'Geschenk'], ['🎸', 'Gitarre'], ['🎻', 'Geige'], ['🔔', 'Glocke']],
    H: [['🐶', 'Hund'], ['🏠', 'Haus'], ['🐰', 'Hase'], ['🎩', 'Hut'], ['🐓', 'Hahn'], ['❤️', 'Herz'], ['👖', 'Hose'], ['🔨', 'Hammer']],
    I: [['🦔', 'Igel'], ['🏝️', 'Insel']],
    J: [['🧥', 'Jacke']],
    K: [['🐱', 'Katze'], ['🐄', 'Kuh'], ['🧀', 'Käse'], ['👑', 'Krone'], ['🍪', 'Keks'], ['🕯️', 'Kerze'], ['🐫', 'Kamel'], ['🐊', 'Krokodil']],
    L: [['🦁', 'Löwe'], ['🦙', 'Lama'], ['🥄', 'Löffel'], ['🍭', 'Lutscher'], ['🎈', 'Luftballon']],
    M: [['🐭', 'Maus'], ['🌙', 'Mond'], ['🥛', 'Milch'], ['🐚', 'Muschel'], ['🌽', 'Mais'], ['🧁', 'Muffin'], ['🧲', 'Magnet']],
    N: [['👃', 'Nase'], ['🦏', 'Nashorn']],
    O: [['👂', 'Ohr'], ['🍊', 'Orange']],
    P: [['🐧', 'Pinguin'], ['🍄', 'Pilz'], ['🐼', 'Panda'], ['🍕', 'Pizza'], ['🖌️', 'Pinsel'], ['🍿', 'Popcorn'], ['🦜', 'Papagei']],
    R: [['🚀', 'Rakete'], ['🌹', 'Rose'], ['💍', 'Ring'], ['🛴', 'Roller'], ['🌈', 'Regenbogen'], ['🤖', 'Roboter'], ['🎒', 'Rucksack'], ['🐛', 'Raupe']],
    S: [['☀️', 'Sonne'], ['🧼', 'Seife'], ['🧦', 'Socke'], ['🥬', 'Salat'], ['🛋️', 'Sofa']],
    T: [['🐯', 'Tiger'], ['🍅', 'Tomate'], ['🧸', 'Teddy'], ['🎂', 'Torte'], ['🚕', 'Taxi'], ['🥁', 'Trommel'], ['🚪', 'Tür'], ['🌷', 'Tulpe']],
    U: [['🛸', 'Ufo'], ['⌚', 'Uhr']],
    W: [['🐳', 'Wal'], ['☁️', 'Wolke'], ['🐺', 'Wolf'], ['🎲', 'Würfel'], ['🌭', 'Würstchen']],
    Z: [['🦓', 'Zebra'], ['🍋', 'Zitrone'], ['🚂', 'Zug'], ['🐐', 'Ziege'], ['🦷', 'Zahn']],
  };
  const ANLAUT_WORDS = [];
  Object.keys(ANLAUT).forEach((L) => ANLAUT[L].forEach(([e, w]) => ANLAUT_WORDS.push({ L, e, w })));
  const ANLAUT_LETTERS = Object.keys(ANLAUT);
  /** Ähnlich klingende Anlaute nicht gemeinsam anbieten (b/p, d/t, g/k, m/n, s/z, e/i, o/u, f/w). */
  const SOUND_AVOID = { B: ['P'], P: ['B'], D: ['T'], T: ['D'], G: ['K'], K: ['G'], M: ['N'], N: ['M'], S: ['Z'], Z: ['S'], E: ['I'], I: ['E'], O: ['U'], U: ['O'], F: ['W'], W: ['F'] };

  /** Stufe 5 (ohne Namen bzw. im Wechsel): leicht verwechselbare Buchstabengruppen. */
  const CONFUSE = [
    { id: 'bdpq', letters: ['b', 'd', 'p', 'q'] },
    { id: 'mwnv', letters: ['M', 'W', 'N', 'V'] },
    { id: 'efhl', letters: ['E', 'F', 'H', 'L'] },
    { id: 'oqcg', letters: ['O', 'Q', 'C', 'G'] },
    { id: 'numh', letters: ['n', 'u', 'm', 'h'] },
    { id: 'prbd', letters: ['P', 'R', 'B', 'D'] },
    { id: 'ijlt', letters: ['i', 'j', 'l', 't'] },
  ];
  /** Formtipps (werden nach dem 1. Fehler vorgelesen). */
  const SHAPE = {
    b: 'Beim kleinen B kommt erst der Strich und dann der Bauch.',
    d: 'Beim kleinen D kommt erst der Bauch und dann der Strich.',
    p: 'Beim kleinen P geht der Strich nach unten, und der Bauch ist rechts.',
    q: 'Beim kleinen Q geht der Strich nach unten, und der Bauch ist links.',
    M: 'Das M hat oben zwei Spitzen.',
    W: 'Das W hat unten zwei Spitzen.',
    N: 'Das N hat zwei Striche und dazwischen eine schräge Linie.',
    V: 'Das V hat unten nur eine Spitze.',
    E: 'Das E hat drei Arme.',
    F: 'Das F hat zwei Arme: oben und in der Mitte.',
    H: 'Das H sieht aus wie eine Leiter mit einer Sprosse.',
    L: 'Das L hat einen Strich und unten einen Fuß.',
    O: 'Das O ist rund und ganz geschlossen.',
    Q: 'Das Q ist ein Kreis mit einem kleinen Strich unten.',
    C: 'Das C ist ein Kreis, der rechts offen ist.',
    G: 'Das G sieht aus wie ein C mit einem kleinen Strich.',
    n: 'Das kleine N hat oben nur einen Bogen.',
    u: 'Das kleine U hat unten einen Bogen.',
    m: 'Das kleine M hat zwei Bögen.',
    h: 'Das kleine H hat einen langen Strich und daneben einen Bogen.',
    P: 'Das P hat oben einen Bauch.',
    R: 'Das R hat oben einen Bauch und unten ein Bein.',
    B: 'Das B hat zwei Bäuche.',
    D: 'Das D hat einen großen Bauch.',
    i: 'Das kleine I ist ein kurzer Strich mit einem Punkt.',
    j: 'Das kleine J hat einen Punkt und unten einen Haken.',
    l: 'Das kleine L ist ein langer Strich ohne Punkt.',
    t: 'Das kleine T hat einen Querstrich, wie ein Kreuz.',
  };

  let abcIntroDone = false; // ABC-Knopf nur einmal pro Sitzung vorstellen

  /* ---------------- Bausteine ---------------- */

  /** Antwortkachel mit einem Buchstaben. */
  function letterItem(ch, correct) {
    return { content: S2.letter(ch), correct, aria: 'Buchstabe ' + ch, value: ch };
  }

  /** Aufgabenkarte: Platzhalter-Kästchen (?) + Bild der Anlauttabelle. */
  function promptCard(ctx, entry, { slotText = '?', big = null } = {}) {
    const slot = el('div.abc-slot', big ? S2.letter(big, 'abc-slot-letter') : el('span.abc-slot-q', slotText));
    const pic = el('div.abc-pic', S2.pic(entry));
    const card = el('div.prompt-box.abc-prompt', slot, pic);
    ctx.stage.appendChild(card);
    return { card, slot, pic };
  }
  function fillSlot(slot, ch) {
    U.clear(slot);
    slot.appendChild(S2.letter(ch, 'abc-slot-letter'));
    slot.classList.add('filled');
    LT.ui.animate(slot, 'joy');
  }

  /** Name des Kindes aufbereiten: erstes Wort, nur Buchstaben, „Paul“-Schreibweise. */
  function cleanName(raw) {
    const first = String(raw || '').trim().split(/[\s-]+/)[0] || '';
    const letters = Array.from(first).filter((c) => /[A-Za-zÄÖÜäöüß]/.test(c));
    if (letters.length < 2 || letters.length > 12) return null;
    return [S2.upper(letters[0]), ...letters.slice(1).map((c) => S2.lower(c))];
  }

  /* ---------------- Stufen ---------------- */

  // Stufe 1 + 2: „Wo ist das M wie Maus?“
  async function findLetter(ctx, level) {
    const pool = level === 1 ? FREQ : S2.LETTERS;
    const L = U.pickFresh('abc-find-' + level, pool, Math.min(6, pool.length - 1));
    const entry = S2.abc(L);
    const { slot } = promptCard(ctx, entry);
    const others = level === 1
      ? S2.distract(L, FREQ, 2, { avoid: FREQ_AVOID[L] || [] })
      : S2.distract(L, S2.LETTERS, 3, { prefer: LOOK_UP[L] || [] });
    ctx.instruct(`Wo ist das ${L} wie ${entry.w}?`);
    await ctx.choices([letterItem(L, true), ...others.map((x) => letterItem(x, false))], {
      hintAfter: 2,
      // informativ: den gewählten Buchstaben benennen und das Ziel wiederholen
      wrongSay: (item) => `Das ist das ${item.value} wie ${S2.abc(item.value).w}. Wir suchen das ${L} wie ${entry.w}.`,
      hintSay: `Hier ist das ${L}. ${L} wie ${entry.w}.`,
      correctSay: `Richtig! ${L} wie ${entry.w}.`,
      onCorrect: () => fillSlot(slot, L),
    });
  }

  // Stufe 3: Groß- und Kleinbuchstaben zuordnen
  async function matchCase(ctx) {
    const L = U.pickFresh('abc-case', S2.LETTERS, 8);
    const entry = S2.abc(L);
    const toLower = ctx.index % 2 === 0 ? U.chance(0.75) : U.chance(0.4);
    const shown = toLower ? L : S2.lower(L);
    const target = toLower ? S2.lower(L) : L;
    const pool = toLower ? S2.LETTERS.map(S2.lower) : S2.LETTERS;
    const prefer = toLower ? LOOK_LOW[target] || [] : LOOK_UP[target] || [];
    const others = S2.distract(target, pool, 3, { prefer });

    const big = el('div.abc-case-given', S2.letter(shown, 'abc-case-letter'));
    const pic = el('div.abc-pic.small', S2.pic(entry));
    const card = el('div.prompt-box.abc-prompt', big, pic);
    ctx.stage.appendChild(card);

    const sizeWord = toLower ? 'kleine' : 'große';
    const shownWord = toLower ? 'große' : 'kleine';
    ctx.instruct(`Das ist das ${shownWord} ${L} wie ${entry.w}. Wo ist das ${sizeWord} ${L}?`);
    await ctx.choices([letterItem(target, true), ...others.map((x) => letterItem(x, false))], {
      hintAfter: 2,
      wrongSay: (item) => `Das ist das ${S2.isLower(item.value) ? 'kleine' : 'große'} ${S2.upper(item.value)}. Wir suchen das ${sizeWord} ${L}.`,
      hintSay: `Hier ist das ${sizeWord} ${L}.`,
      correctSay: `Richtig! Das große ${L} und das kleine ${L} gehören zusammen.`,
      onCorrect: () => {
        big.appendChild(S2.letter(target, 'abc-case-letter partner'));
        LT.ui.animate(big, 'joy');
      },
    });
  }

  // Stufe 4: Anlaut hören → Buchstabe
  async function hearAnlaut(ctx) {
    const word = U.pickFresh('abc-anlaut', ANLAUT_WORDS, 10, (x) => x.w);
    const L = word.L;
    const table = S2.abc(L);
    const ear = el('button.btn-round.abc-ear', { type: 'button', 'aria-label': 'Wort nochmal hören', on: { click: () => ctx.say(word.w, { rate: 0.7 }) } }, U.emoji('👂'));
    const helper = el('div.abc-helper');
    const card = el('div.prompt-box.abc-prompt', el('div.abc-pic', U.emoji(word.e)), ear, helper);
    ctx.stage.appendChild(card);
    const others = S2.distract(L, ANLAUT_LETTERS, 3, { avoid: SOUND_AVOID[L] || [] });
    ctx.instruct(`Hör gut zu: ${word.w}. Mit welchem Buchstaben fängt ${word.w} an?`);
    await ctx.choices([letterItem(L, true), ...others.map((x) => letterItem(x, false))], {
      hintAfter: 2,
      wrongSay: (item) => `Das ist das ${item.value} wie ${S2.abc(item.value).w}.`,
      correctSay: `Richtig! ${word.w} fängt mit ${L} an.`,
      onWrong: async (item, tile, n) => {
        if (n === 1) {
          await ctx.say('Hör ganz genau auf den Anfang:');
          await ctx.say(word.w, { rate: 0.55 });
        } else if (n === 2) {
          // Hilfe mit der Anlauttabelle: gleiches Anfangsgeräusch wie das Tabellenwort
          U.clear(helper);
          helper.appendChild(S2.letter(L, 'abc-helper-letter'));
          helper.appendChild(S2.pic(table, 'abc-helper-pic'));
          helper.classList.add('show');
          if (table.w === word.w) await ctx.say(`Schau in dein ABC: ${L} wie ${table.w}!`);
          else await ctx.say(`${word.w} fängt an wie ${table.w}. ${L} wie ${table.w}!`);
        }
      },
    });
  }

  // Stufe 5a: Buchstaben des eigenen Namens
  async function nameTask(ctx, nameChars) {
    const upperMode = ctx.index % 4 === 0;
    const shown = upperMode ? nameChars.map(S2.upper) : nameChars.slice();
    const name = nameChars.join('');
    const candidates = shown.map((c, i) => i).filter((i) => shown[i] !== 'ß');
    const pos = ctx.index === 0 ? 0 : U.pickFresh('abc-namepos-' + name, candidates, Math.max(0, candidates.length - 2));
    const missing = shown[pos];
    const lowerCase = S2.isLower(missing);
    const inName = new Set(nameChars.map(S2.upper));
    const pool = S2.LETTERS.filter((x) => !inName.has(x)).map((x) => (lowerCase ? S2.lower(x) : x));
    const prefer = (lowerCase ? LOOK_LOW[missing] : LOOK_UP[missing]) || [];
    const others = S2.distract(missing, pool, 3, { prefer: prefer.filter((x) => !inName.has(S2.upper(x))) });

    const boxes = shown.map((c, i) => el('span.abc-name-box' + (i === pos ? '.gap' : ''), i === pos ? '?' : S2.letter(c)));
    const row = el('div.abc-name-row', { style: { '--len': String(shown.length) } }, boxes);
    const card = el('div.prompt-box.abc-name-card', el('div.abc-name-label', U.emoji('🏷️'), ' Dein Name'), row);
    ctx.stage.appendChild(card);

    ctx.instruct(`Hier steht dein Name: ${name}! Ein Buchstabe fehlt. Welcher Buchstabe fehlt?`);
    await ctx.choices([letterItem(missing, true), ...others.map((x) => letterItem(x, false))], {
      hintAfter: 2,
      hintSay: `Hier ist das ${S2.sayLetter(missing)}.`,
      praise: false,
      correctSay: 'Richtig!',
      onWrong: async (item, tile, n) => {
        if (n === 1) await ctx.say(`Es fehlt das ${lowerCase ? 'kleine ' : ''}${S2.sayLetter(missing)}.`);
      },
      onCorrect: () => {
        const b = boxes[pos];
        U.clear(b);
        b.appendChild(S2.letter(missing));
        b.classList.remove('gap');
        b.classList.add('filled');
      },
    });
    // Namen buchstabieren: jedes Kästchen leuchtet beim Vorlesen
    for (let i = 0; i < boxes.length; i++) {
      if (!ctx.active) return;
      boxes[i].classList.add('on');
      await ctx.say(S2.sayLetter(shown[i]));
      boxes[i].classList.remove('on');
    }
    if (ctx.active) {
      row.classList.add('all-on');
      await ctx.say(`${name}! Das ist dein Name.`);
    }
  }

  // Stufe 5b: leicht verwechselbare Buchstaben
  async function confuseTask(ctx) {
    const set = U.pickFresh('abc-confuse', CONFUSE, 3, (s) => s.id);
    const target = U.pick(set.letters);
    const L = S2.upper(target);
    const entry = S2.abc(L);
    const small = S2.isLower(target);
    const { slot } = promptCard(ctx, entry);
    const label = small ? `das kleine ${L}` : `das ${L}`;
    ctx.instruct(`Wo ist ${label} wie ${entry.w}?`);
    await ctx.choices(set.letters.map((x) => letterItem(x, x === target)), {
      hintAfter: 2,
      wrongSay: (item) => `Das ist ${S2.isLower(item.value) ? 'das kleine' : 'das'} ${S2.upper(item.value)}.`,
      hintSay: `Hier ist ${label}.`,
      correctSay: `Richtig! ${U.cap(label)} wie ${entry.w}.`,
      onWrong: async (item, tile, n) => {
        if (n === 1 && SHAPE[target]) await ctx.say(SHAPE[target]);
      },
      onCorrect: () => fillSlot(slot, target),
    });
  }

  /* ---------------- Registrierung ---------------- */

  LT.registerGame({
    id: 'buchstaben',
    area: 'sprache',
    title: 'ABC-Entdecker',
    icon: '🔠',
    levels: 5,
    rounds: 5,
    intro: 'Komm, wir entdecken Buchstaben!',
    parent: {
      skill: 'Buchstabenkenntnis & Laut-Buchstaben-Zuordnung',
      goal: 'Ihr Kind lernt die Druckbuchstaben mit Hilfe einer Anlauttabelle kennen („M wie Maus“), ordnet Groß- und Kleinbuchstaben zu, hört Anfangslaute aus Wörtern heraus und findet die Buchstaben des eigenen Namens. Über den ABC-Knopf kann es die ganze Anlauttabelle frei erkunden.',
      levels: [
        'Häufige, gut unterscheidbare Großbuchstaben (M, A, L, O, I, E …) – 3 Antworten',
        'Alle Großbuchstaben – 4 Antworten, darunter ein ähnlich aussehender',
        'Groß- und Kleinbuchstaben einander zuordnen (M ↔ m)',
        'Anlaut hören: „Mit welchem Buchstaben fängt Mond an?“ (Hilfe über die Anlauttabelle)',
        'Der eigene Name (Lücke füllen, sofern im Elternbereich eingetragen) im Wechsel mit leicht verwechselbaren Buchstaben (b/d/p/q, M/W, E/F …) inklusive Formtipps',
      ],
      tip: 'Gehen Sie auf Buchstabenjagd: Welche Buchstaben aus dem Namen Ihres Kindes finden Sie auf Schildern, Verpackungen oder Nummernschildern? Sprechen Sie dabei den Laut („mmm wie Maus“) statt des Buchstabennamens.',
    },

    async task(ctx) {
      U.clear(ctx.stage);
      const abcBtn = S2.abcButton(ctx);
      // Den ABC-Knopf beim ersten Mal kurz vorstellen
      if (!abcIntroDone && ctx.index === 0) {
        abcIntroDone = true;
        abcBtn.classList.add('pulse');
        ctx.timeout(() => abcBtn.classList.remove('pulse'), 6000);
        await ctx.say('Schau mal, der Knopf, der jetzt leuchtet, ist dein ABC. Da kannst du alle Buchstaben entdecken.');
        if (!ctx.active) return;
      }
      const lv = ctx.level;
      if (lv <= 2) return findLetter(ctx, lv);
      if (lv === 3) return matchCase(ctx);
      if (lv === 4) return hearAnlaut(ctx);
      const name = cleanName(ctx.name);
      if (name && ctx.index % 2 === 0) return nameTask(ctx, name);
      return confuseTask(ctx);
    },
  });
})();
