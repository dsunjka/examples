/* ==========================================================================
   Spiel „Erstes Lesen“ (erstes-lesen) – lauttreue Wörter selbst erlesen

   Didaktik:
   - Das Wort wird VOR der Antwort NICHT vorgelesen – sonst wäre es kein Lesen.
     Vorgelesen werden nur die Bilder (damit klar ist, was sie zeigen).
   - Silbenmethode: Silben abwechselnd blau/rot mit Silbenbögen. Das Kind liest
     Silbe für Silbe und schleift sie zum Wort zusammen.
   - Nur lauttreue Wörter in GROSSBUCHSTABEN (keine ie/ch/sch/ck/Doppel-
     konsonanten); einzig Uhr, Ohr, Kuh mit stummem h – wie in Erstlesebüchern.
   - „Lesefinger“: Tippt das Kind auf das Wort, leuchten die Buchstaben
     nacheinander auf (ohne Ton) – eine stille Lesehilfe.
   - Ablenker sehen dem Zielwort ähnlich (gleicher Anfangsbuchstabe, OMA/OPA,
     UHR/OHR, EI/EIS) – so reicht es nicht, nur den ersten Buchstaben zu raten.
   - Hilfe-Leiter: 1. Fehler → gewähltes Bild benennen und mit dem Wortanfang
             vergleichen („Das Bild heißt Hut. Hut fängt mit H an.“) + Lesefinger,
             2. → Lesestrategie („Lies Silbe für Silbe …“),
             3. → Flo liest die Silben vor und zeigt das passende Bild.
   - Wörter über ctx.item (Schlüssel = Wort, z. B. „Oma“).
   - Nach der richtigen Antwort wird das Wort silbisch vorgelesen (O – ma. Oma!).
   - Stufen: 1 kurze Wörter (2 Bilder) → 2 vierbuchstabige Wörter (3 Bilder)
             → 3 zwei- und dreisilbige Wörter (3 Bilder)
             → 4 umgekehrt: Bild → richtiges Wort unter ähnlichen (MAUS/HAUS/LAUS).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S2 = LT.s2;

  /* ---------------- Wortlisten (Silben mit Bindestrich) ---------------- */
  // [Wort mit Silbengrenzen, Emoji]
  const RAW = {
    1: [
      ['O-MA', '👵'], ['O-PA', '👴'], ['EIS', '🍦'], ['UHR', '⌚'], ['OHR', '👂'], ['EI', '🥚'],
      ['HUT', '🎩'], ['BUS', '🚌'], ['U-FO', '🛸'], ['TOR', '🥅'], ['WAL', '🐳'], ['KUH', '🐄'],
    ],
    2: [
      ['MAUS', '🐭'], ['NA-SE', '👃'], ['RO-SE', '🌹'], ['HO-SE', '👖'], ['SO-FA', '🛋️'], ['LA-MA', '🦙'],
      ['I-GEL', '🦔'], ['AU-GE', '👁️'], ['AU-TO', '🚗'], ['DO-SE', '🥫'], ['HAUS', '🏠'], ['HA-SE', '🐰'],
      ['KI-WI', '🥝'], ['PILZ', '🍄'], ['BAUM', '🌳'], ['EU-LE', '🦉'], ['LU-PE', '🔍'], ['DI-NO', '🦕'],
      ['BROT', '🍞'], ['WOLF', '🐺'],
    ],
    3: [
      ['TO-MA-TE', '🍅'], ['BA-NA-NE', '🍌'], ['RA-KE-TE', '🚀'], ['A-NA-NAS', '🍍'], ['SA-LAT', '🥬'],
      ['ME-LO-NE', '🍉'], ['KA-MEL', '🐫'], ['PAL-ME', '🌴'], ['ZE-BRA', '🦓'], ['A-MEI-SE', '🐜'],
      ['RAU-PE', '🐛'], ['KRO-KO-DIL', '🐊'], ['E-LE-FANT', '🐘'], ['KAK-TUS', '🌵'], ['SEI-FE', '🧼'],
      ['TUL-PE', '🌷'], ['GUR-KE', '🥒'], ['TOR-TE', '🎂'], ['KER-ZE', '🕯️'], ['PIN-SEL', '🖌️'], ['BIR-NE', '🍐'], ['PA-PA-GEI', '🦜'],
    ],
  };
  const WORDS = {};
  Object.keys(RAW).forEach((lv) => {
    WORDS[lv] = RAW[lv].map(([t, e]) => ({ t, e, plain: S2.plain(t), say: S2.spoken(t) }));
  });

  /** Stufe 4: Bild → Wort. Ablenker sind echte, ähnlich aussehende Wörter. */
  const REVERSE = [
    ['MAUS', '🐭', 'die', ['HAUS', 'LAUS']],
    ['HAUS', '🏠', 'das', ['MAUS', 'LAUS']],
    ['RO-SE', '🌹', 'die', ['HO-SE', 'DO-SE']],
    ['HO-SE', '👖', 'die', ['RO-SE', 'DO-SE']],
    ['DO-SE', '🥫', 'die', ['HO-SE', 'RO-SE']],
    ['NA-SE', '👃', 'die', ['HA-SE', 'VA-SE']],
    ['HA-SE', '🐰', 'der', ['NA-SE', 'VA-SE']],
    ['O-MA', '👵', 'die', ['O-PA', 'OBST']],
    ['O-PA', '👴', 'der', ['O-MA', 'OBST']],
    ['HUT', '🎩', 'der', ['MUT', 'GUT']],
    ['TOR', '🥅', 'das', ['ROT', 'TON']],
    ['EIS', '🍦', 'das', ['REIS', 'EI']],
    ['WAL', '🐳', 'der', ['WALD', 'MAL']],
    ['I-GEL', '🦔', 'der', ['E-GEL', 'I-GLU']],
    ['LA-MA', '🦙', 'das', ['MA-MA', 'LAM-PE']],
    ['AU-TO', '🚗', 'das', ['AU-GE', 'AU-LA']],
    ['AU-GE', '👁️', 'das', ['AU-TO', 'AU-LA']],
    ['BAUM', '🌳', 'der', ['RAUM', 'BAU-ER']],
    ['PILZ', '🍄', 'der', ['FILZ', 'PELZ']],
    ['TO-MA-TE', '🍅', 'die', ['TA-PE-TE', 'TOR-TE']],
    ['RA-KE-TE', '🚀', 'die', ['PA-KE-TE', 'TA-PE-TE']],
    ['BA-NA-NE', '🍌', 'die', ['A-NA-NAS', 'BAN-DE']],
    ['KA-MEL', '🐫', 'das', ['KA-ME-RA', 'KA-MIN']],
    ['SA-LAT', '🥬', 'der', ['SOL-DAT', 'SALZ']],
    ['ME-LO-NE', '🍉', 'die', ['ZI-TRO-NE', 'ME-LO-DIE']],
  ].map(([t, e, a, d]) => ({ t, e, a, d, say: S2.spoken(t) }));

  /* ---------------- Helfer ---------------- */

  /** Ähnlichkeit zweier Wörter (für „knifflige“ Ablenker). */
  function similarity(a, b) {
    let s = 0;
    if (a[0] === b[0]) s += 2;
    if (a[a.length - 1] === b[b.length - 1]) s += 1;
    if (a.length === b.length) s += 1;
    const setB = new Set(b);
    new Set(a).forEach((ch) => { if (setB.has(ch)) s += 0.5; });
    return s;
  }
  /** n Ablenker: einer ähnlich (aus den Top 3), der Rest zufällig. */
  function pickDistractors(target, pool, n) {
    const others = pool.filter((w) => w.plain !== target.plain && w.e !== target.e);
    const ranked = U.shuffle(others).sort((x, y) => similarity(target.plain, y.plain) - similarity(target.plain, x.plain));
    const res = [U.pick(ranked.slice(0, 3))];
    const rest = U.shuffle(others.filter((w) => !res.includes(w)));
    while (res.length < n && rest.length) res.push(rest.shift());
    return res;
  }

  /** Großes Lesewort in einer Karte; Antippen startet den Lesefinger. */
  function wordCard(ctx, text) {
    const word = S2.wordNode(text, { cls: 'lesen-big' });
    const finger = el('div.lesen-finger', U.emoji('👆'), el('span', 'Tippe aufs Wort'));
    const card = el('button.prompt-box.lesen-card', { type: 'button', 'aria-label': 'Lesewort – antippen für den Lesefinger' }, word, finger);
    card.addEventListener('click', () => S2.readingFinger(ctx, word));
    ctx.stage.appendChild(card);
    return { card, word };
  }

  /* ---------------- Stufen 1–3: Wort lesen → Bild wählen ---------------- */
  async function readWord(ctx, level) {
    const pool = WORDS[level];
    const target = ctx.item(pool, (w) => w.say, { avoid: 6 });
    // Knobel-Aufgabe auf Stufe 3 (Stufe 4 ist eine andere Aufgabenart): ein Bild mehr
    const nDis = level === 1 ? 1 : level === 3 && ctx.flow > 0 && ctx.level === 3 ? 3 : 2;
    const others = pickDistractors(target, pool, nDis);
    const multi = target.t.includes('-');
    const { word } = wordCard(ctx, target.t);

    const first = ctx.index === 0 && level === 1;
    await ctx.instruct(first
      ? (target.t.includes('-')
        ? 'Hier steht ein Wort. Lies es! Erst die blaue Silbe, dann die rote. Welches Bild passt?'
        : 'Hier steht ein Wort. Lies es! Welches Bild passt?')
      : U.pick(['Lies das Wort. Welches Bild passt dazu?', 'Was steht hier? Lies und tippe auf das passende Bild.', 'Lies genau! Welches Bild gehört zu dem Wort?']));
    if (!ctx.active) return;

    const items = [target, ...others].map((w) => ({ content: w.e, correct: w === target, say: w.say, w }));
    await ctx.choices(items, {
      nameFirst: true,
      sayButton: true,
      size: 'large',
      hintAfter: 2,
      praise: false,
      correctSay: () => S2.vary('lesen-ok', ['Richtig gelesen!', 'Super gelesen!', 'Toll, du hast es gelesen!',
        multi ? 'Richtig, du hast Silbe für Silbe gelesen!' : 'Richtig, du hast jeden Buchstaben gelesen!']),
      // Hilfe-Leiter (das Zielwort wird erst beim Vormachen vorgelesen – sonst wäre es kein Lesen):
      // 1 gewähltes Bild benennen und mit dem Wortanfang vergleichen + Lesefinger
      explain: (item) => (item.w.plain[0] !== target.plain[0]
        ? `Das Bild heißt ${item.say}. ${item.say} fängt mit ${item.w.plain[0]} an. Schau auf den ersten Buchstaben.`
        : `Das Bild heißt ${item.say}. Der Anfang stimmt. Lies bis zum Ende.`),
      // 2 Denkanstoß: Lesestrategie
      hintSay: multi ? 'Lies Silbe für Silbe: erst blau, dann rot.' : 'Lies ganz langsam, Buchstabe für Buchstabe.',
      // 3 vormachen: Flo liest vor und zeigt das Bild
      modelSay: 'Schau, hier ist das passende Bild.',
      onWrong: async (item, tile, n) => {
        if (n === 1) await S2.readingFinger(ctx, word);
        else if (n >= 3) {
          await ctx.say('Ich lese es dir vor.');
          await S2.speakSyllables(ctx, word, { rate: 0.75 });
        }
      },
    });
    // Erkenntnis sichern: Wort silbisch vorlesen
    await S2.speakSyllables(ctx, word);
    await ctx.sleep(300);
  }

  /* ---------------- Stufe 4: Bild → richtiges Wort ---------------- */
  async function pickWord(ctx) {
    const target = ctx.item(REVERSE, (w) => w.say, { avoid: 8 });
    const card = el('div.prompt-box.lesen-pic-card', U.emoji(target.e, 'big-emoji'));
    ctx.stage.appendChild(card);
    const options = [target.t, ...target.d].map((t) => {
      const node = S2.wordNode(t, { cls: 'lesen-opt' });
      return { content: node, correct: t === target.t, className: 'lesen-wordtile', aria: 'Wort', node, t };
    });
    const indef = (target.a === 'die' ? 'eine ' : 'ein ') + target.say;
    ctx.instruct(ctx.index === 0
      ? `Das ist ${indef}. Hier stehen drei Wörter. Wo steht ${target.say}? Lies genau!`
      : `Das ist ${indef}. Wo steht ${target.say}?`);
    // Anfangsbuchstabe hilft nur, wenn er die Wörter unterscheidet
    const firsts = [target.t, ...target.d].map((t) => S2.plain(t)[0]);
    const unique = firsts.filter((f) => f === firsts[0]).length === 1;
    let rightNode = null;
    await ctx.choices(options, {
      columns: 1,
      hintAfter: 2,
      praise: false,
      correctSay: () => S2.vary('lesen-rev-ok', ['Richtig gelesen!', 'Genau, da steht es!', 'Super gelesen!', 'Richtig, du hast jedes Wort bis zum Ende gelesen!']),
      // Hilfe-Leiter: 1 gewähltes Wort vorlesen und Ziel nennen → 2 Lesestrategie → 3 zeigen
      explain: (item) => `Da steht ${S2.spoken(item.t)}. Wir suchen ${target.say}.`,
      hintSay: unique
        ? `${target.say} fängt mit ${firsts[0]} an. Lies jedes Wort bis zum Ende.`
        : 'Lies jedes Wort ganz langsam, Silbe für Silbe, bis zum Ende.',
      modelSay: `Schau, hier steht ${target.say}.`,
      onCorrect: (item) => { rightNode = item.node; },
    });
    if (rightNode) await S2.speakSyllables(ctx, rightNode);
    await ctx.sleep(300);
  }

  LT.registerGame({
    id: 'erstes-lesen',
    area: 'sprache',
    title: 'Erstes Lesen',
    icon: '📖',
    levels: 4,
    rounds: 5,
    intro: 'Jetzt liest du selbst! Die Silben sind bunt: erst blau, dann rot.',
    parent: {
      skill: 'Erstes Lesen (Silbenmethode)',
      goal: 'Ihr Kind erliest selbstständig kurze, lauttreue Wörter in Großbuchstaben und ordnet ihnen ein Bild zu. Die Silben sind abwechselnd blau und rot gefärbt und mit Silbenbögen markiert – so fällt das Zusammenschleifen leichter. Das Wort wird vor der Antwort bewusst nicht vorgelesen; erst nach Fehlversuchen liest Flo die Silben vor.',
      levels: [
        'Kurze Wörter (OMA, OPA, EIS, UHR, HUT …) – 2 Bilder',
        'Vierbuchstabige Wörter (MAUS, NASE, ROSE, SOFA, LAMA …) – 3 Bilder',
        'Zwei- und dreisilbige Wörter (TOMATE, BANANE, RAKETE, KROKODIL …) – 3 Bilder',
        'Umgekehrt: Zum Bild das richtige Wort unter ähnlichen finden (MAUS/HAUS/LAUS)',
      ],
      tip: 'Schreiben Sie kurze Wörter in Großbuchstaben auf Zettel (MAMA, OMA, AUTO, SOFA) und legen Sie sie an die passenden Dinge in der Wohnung. Lesen Sie dabei in Silben und schwingen Sie die Silbenbögen mit dem Finger mit.',
    },

    async task(ctx) {
      const lv = S2.lv(ctx, (l) => (l <= 3 ? 'read' : 'pick'));
      if (lv <= 3) return readWord(ctx, lv);
      return pickWord(ctx);
    },
  });
})();
