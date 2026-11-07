/* ==========================================================================
   Spiel „Gegenteile“ (gegensaetze) – Wortschatz: Adjektive und ihre Gegensätze

   Didaktik:
   - Jedes Adjektiv wird an einem eindeutigen Bild verankert und in einem
     kurzen Satz benannt („Das Feuer ist heiß.“). Für Größe, Länge und Füllung
     wird DASSELBE Ding in zwei Zuständen gezeigt (großer/kleiner Baum,
     langer/kurzer Zug, volles/leeres Glas) – so zählt nur die Eigenschaft.
   - Nach jeder Lösung wird das Gegensatzpaar benannt („Heiß und kalt sind
     Gegenteile.“).
   - Ablenker werden so gewählt, dass sie NICHT ebenfalls passen könnten
     (z. B. nie Schnecke als Ablenker bei „klein“, nie Sonne bei „heiß“).
   - Progression:
       1  Bildpaar: „Das Feuer ist heiß. Was ist kalt?“ – 2 Bilder
       2  „Was ist das Gegenteil von heiß?“ – 3 Bilder, Wörter zum Anhören (🔊)
       3  nur gesprochen, ohne Ausgangsbild: „Was ist das Gegenteil von laut?“
          – unter den Bildern ist auch „laut“ selbst als Falle
       4  Satz ergänzen: „Eis ist kalt, Feuer ist …“ mit gesprochenen Wortkarten
   - Hilfe nach 2 Fehlversuchen: Flo nennt das Gegenteil und zeigt das Bild.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* ---------------- Bild-Bausteine ---------------- */
  const emo = (e, size = 1.3) => el('span', { class: 'emoji', 'aria-hidden': 'true', style: { fontSize: size + 'em' } }, e);
  /** Zwei Emojis übereinander (oben klein, unten groß) – z. B. Regenwolke über Hund. */
  const stack = (top, base) => el('span.gg-stack', { 'aria-hidden': 'true' }, el('span.emoji.gg-stack-top', top), el('span.emoji.gg-stack-base', base));
  /** Zug mit n Wagen. */
  const train = (n) => el('span.gg-train', { 'aria-hidden': 'true' }, el('span.emoji', '🚂'), U.range(1, n).map(() => el('span.emoji', '🚃')));
  /** Buntstift (lang oder kurz) als SVG – derselbe Stift, nur die Länge ändert sich. */
  function pencil(long) {
    const end = long ? 90 : 40; // Ende des gelben Holzschafts
    const shift = long ? 2 : 27; // Stift mittig setzen
    return el('span', {
      class: 'emoji gg-pencil',
      'aria-hidden': 'true',
      html: `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><g transform="translate(${shift} 0)">
        <rect x="3" y="7" width="15" height="26" rx="5" fill="#ff8fab"/>
        <rect x="16" y="6" width="7" height="28" fill="#b8bfd6"/>
        <rect x="23" y="7" width="${end - 23}" height="26" fill="#ffc533"/>
        <rect x="23" y="15.5" width="${end - 23}" height="9" fill="#ffb000"/>
        <polygon points="${end},7 ${end + 22},20 ${end},33" fill="#f6d7a7"/>
        <polygon points="${end + 13},14.7 ${end + 22},20 ${end + 13},25.3" fill="#3b3f5c"/>
      </g></svg>`,
    });
  }
  /** Glas (voll oder leer) als SVG. */
  function glass(full) {
    const water = full
      ? '<path d="M11.4 15 L48.6 15 L43.6 72 Q43 74 41 74 L19 74 Q17 74 16.4 72 Z" fill="#4fb3ff"/><path d="M11.4 15 Q20 19 30 15 T48.6 15" fill="none" stroke="#bfe6ff" stroke-width="2.4"/>'
      : '';
    return el('span', {
      class: 'emoji gg-glass',
      'aria-hidden': 'true',
      html: `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5 L52 5 L46.5 74.5 Q46 78 42 78 L18 78 Q14 78 13.5 74.5 Z" fill="#f2f9ff" stroke="#5c6080" stroke-width="3" stroke-linejoin="round"/>
        ${water}
        <path d="M15 11 L19 66" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".85"/>
      </svg>`,
    });
  }

  /* ---------------- Gegensatzpaare ----------------
     a/b: { w: Adjektiv, say: Satz zum Bild, pic: () => Node }
     avoid: Paare, deren Bilder bei dieser Frage ebenfalls passen könnten
     (wird automatisch symmetrisch ergänzt). */
  const GROSS_VARIANTS = [
    { e: '🌳', n: 'Der Baum' },
    { e: '🏠', n: 'Das Haus' },
    { e: '🐶', n: 'Der Hund' },
  ];
  const PAIRS = [
    {
      id: 'gross', variants: GROSS_VARIANTS,
      a: { w: 'groß', say: (v) => `${v.n} ist groß.`, pic: (v) => emo(v.e, 1.45) },
      b: { w: 'klein', say: (v) => `${v.n} ist klein.`, pic: (v) => emo(v.e, 0.55) },
      avoid: ['schnell', 'schwer', 'alt', 'heiss', 'lang', 'hell', 'nass', 'suess'],
    },
    {
      id: 'heiss',
      a: { w: 'heiß', say: 'Das Feuer ist heiß.', pic: () => emo('🔥') },
      b: { w: 'kalt', say: 'Die Schneeflocke ist kalt.', pic: () => emo('❄️') },
      avoid: ['hell', 'nass', 'schnell', 'schwer'],
    },
    {
      id: 'schnell',
      a: { w: 'schnell', say: 'Die Rakete ist schnell.', pic: () => emo('🚀') },
      b: { w: 'langsam', say: 'Die Schnecke ist langsam.', pic: () => emo('🐌') },
      avoid: ['lang', 'schwer', 'alt', 'wach', 'laut', 'nass', 'suess'],
    },
    {
      id: 'laut',
      a: { w: 'laut', say: 'Die Trommel ist laut.', pic: () => emo('🥁') },
      b: { w: 'leise', say: 'Psst! Flüstern ist leise.', pic: () => emo('🤫') },
      avoid: ['froh', 'alt', 'wach', 'schnell', 'schwer', 'hell', 'lang'],
    },
    {
      id: 'hell',
      a: { w: 'hell', say: 'Die Sonne ist hell.', pic: () => emo('☀️') },
      b: { w: 'dunkel', say: 'Die Nacht ist dunkel.', pic: () => emo('🌃') },
      avoid: ['heiss', 'nass', 'wach'],
    },
    {
      id: 'voll',
      a: { w: 'voll', say: 'Das Glas ist voll.', pic: () => glass(true) },
      b: { w: 'leer', say: 'Das Glas ist leer.', pic: () => glass(false) },
      avoid: [],
    },
    {
      id: 'nass',
      a: { w: 'nass', say: 'Der Hund ist nass.', pic: () => stack('🌧️', '🐶') },
      b: { w: 'trocken', say: 'Der Hund ist trocken.', pic: () => stack('☀️', '🐶') },
      avoid: ['suess', 'froh', 'schnell', 'voll'],
    },
    {
      id: 'froh', who: true,
      a: { w: 'fröhlich', say: 'Dieses Kind ist fröhlich.', pic: () => emo('😄') },
      b: { w: 'traurig', say: 'Dieses Kind ist traurig.', pic: () => emo('😢') },
      avoid: ['wach', 'alt', 'offen'],
    },
    {
      id: 'offen',
      a: { w: 'offen', say: 'Das Buch ist offen.', pic: () => emo('📖') },
      b: { w: 'geschlossen', say: 'Das Buch ist geschlossen.', pic: () => emo('📕') },
      avoid: ['wach'],
    },
    {
      id: 'suess',
      a: { w: 'süß', say: 'Der Lutscher ist süß.', pic: () => emo('🍭') },
      b: { w: 'sauer', say: 'Die Zitrone ist sauer.', pic: () => emo('🍋') },
      avoid: ['alt'],
    },
    {
      id: 'schwer',
      a: { w: 'schwer', say: 'Der Elefant ist schwer.', pic: () => emo('🐘') },
      b: { w: 'leicht', say: 'Der Luftballon ist leicht.', pic: () => emo('🎈') },
      avoid: ['lang', 'alt'],
    },
    {
      id: 'alt', who: true,
      a: { w: 'alt', say: 'Die Oma ist alt.', pic: () => emo('👵') },
      b: { w: 'jung', say: 'Das Baby ist jung.', pic: () => emo('👶') },
      avoid: ['wach'],
    },
    {
      id: 'wach', who: true,
      a: { w: 'wach', say: 'Dieses Kind ist wach.', pic: () => emo('😃') },
      b: { w: 'müde', say: 'Dieses Kind ist müde.', pic: () => emo('🥱') },
      avoid: [],
    },
    {
      id: 'lang',
      a: { w: 'lang', say: 'Der Stift ist lang.', pic: () => pencil(true) },
      b: { w: 'kurz', say: 'Der Stift ist kurz.', pic: () => pencil(false) },
      avoid: [],
    },
  ];
  // Konflikte symmetrisch machen
  const byId = {};
  PAIRS.forEach((p) => { byId[p.id] = p; p.avoid = new Set(p.avoid); });
  PAIRS.forEach((p) => p.avoid.forEach((q) => byId[q] && byId[q].avoid.add(p.id)));
  const compatible = (p, q) => p !== q && !p.avoid.has(q.id);

  /* ---------------- Satz-Ergänzung (Stufe 4) ----------------
     Hälften: t = Satzanfang (Großschreibung wie am Satzbeginn), n = beginnt mit Nomen
     (bleibt groß), w = Adjektiv, pic = Bild zum Satzteil.
     safe = Ablenkerwörter, die zu BEIDEN Satzhälften sicher nicht passen. */
  const SENTENCES = [
    { a: { t: 'Eis ist', n: 1, w: 'kalt', pic: () => emo('🍦', 1) }, b: { t: 'Feuer ist', n: 1, w: 'heiß', pic: () => emo('🔥', 1) }, safe: ['traurig', 'müde', 'jung'] },
    { a: { t: 'Ein Elefant ist', w: 'groß', pic: () => emo('🐘', 1) }, b: { t: 'Eine Maus ist', w: 'klein', pic: () => emo('🐭', 1) }, safe: ['leer', 'offen', 'geschlossen'] },
    { a: { t: 'Eine Schnecke ist', w: 'langsam', pic: () => emo('🐌', 1) }, b: { t: 'Eine Rakete ist', w: 'schnell', pic: () => emo('🚀', 1) }, safe: ['sauer', 'offen', 'jung'] },
    { a: { t: 'Ein Löwe brüllt', w: 'laut', pic: () => emo('🦁', 1) }, b: { t: 'Eine Maus piepst', w: 'leise', pic: () => emo('🐭', 1) }, safe: ['sauer', 'voll', 'offen'] },
    { a: { t: 'Am Tag ist es', w: 'hell', pic: () => emo('☀️', 1) }, b: { t: 'In der Nacht ist es', w: 'dunkel', pic: () => emo('🌙', 1) }, safe: ['sauer', 'schnell', 'jung'] },
    { a: { t: 'Honig ist', n: 1, w: 'süß', pic: () => emo('🍯', 1) }, b: { t: 'Eine Zitrone ist', w: 'sauer', pic: () => emo('🍋', 1) }, safe: ['laut', 'schnell', 'müde'] },
    { a: { t: 'Ein Lastwagen ist', w: 'schwer', pic: () => emo('🚚', 1) }, b: { t: 'Ein Luftballon ist', w: 'leicht', pic: () => emo('🎈', 1) }, safe: ['sauer', 'müde', 'traurig'] },
    { a: { t: 'Ein Baby ist', w: 'jung', pic: () => emo('👶', 1) }, b: { t: 'Eine Oma ist', w: 'alt', pic: () => emo('👵', 1) }, safe: ['leer', 'offen', 'geschlossen'] },
    { a: { t: 'Nach dem Schlafen bin ich', w: 'wach', pic: () => emo('🌅', 1) }, b: { t: 'Vor dem Schlafen bin ich', w: 'müde', pic: () => emo('🛏️', 1) }, safe: ['leer', 'offen', 'geschlossen'] },
    { a: { t: 'Wenn ich lache, bin ich', w: 'fröhlich', pic: () => emo('😄', 1) }, b: { t: 'Wenn ich weine, bin ich', w: 'traurig', pic: () => emo('😢', 1) }, safe: ['leer', 'geschlossen', 'schwer'] },
    { a: { t: 'Im Regen werde ich', w: 'nass', pic: () => emo('🌧️', 1) }, b: { t: 'Unter dem Schirm bleibe ich', w: 'trocken', pic: () => emo('☂️', 1) }, safe: ['süß', 'alt', 'leer'] },
    { a: { t: 'Vor dem Trinken ist das Glas', w: 'voll', pic: () => glass(true) }, b: { t: 'Nach dem Trinken ist das Glas', w: 'leer', pic: () => glass(false) }, safe: ['müde', 'traurig', 'jung'] },
    { a: { t: 'Beim Schlafen sind die Augen', w: 'geschlossen', pic: () => emo('😴', 1) }, b: { t: 'Beim Spielen sind die Augen', w: 'offen', pic: () => emo('⚽', 1) }, safe: ['sauer', 'leer', 'jung'] },
    { a: { t: 'Ein Zug mit vielen Wagen ist', w: 'lang', pic: () => train(3) }, b: { t: 'Ein Zug mit einem Wagen ist', w: 'kurz', pic: () => train(1) }, safe: ['süß', 'müde', 'traurig'] },
  ];
  const lowerStart = (half) => (half.n ? half.t : half.t.charAt(0).toLowerCase() + half.t.slice(1));

  /* ---------------- Aufgabenbausteine ---------------- */

  /** Aufgabe wählen: Paar + Richtung (welcher Pol ist gegeben?). */
  function pickPair(key) {
    const pair = U.pickFresh(key, PAIRS, 6, (p) => p.id);
    const flip = U.chance(0.5);
    const given = flip ? pair.b : pair.a;
    const target = flip ? pair.a : pair.b;
    const v = pair.variants ? U.pick(pair.variants) : null;
    return { pair, given, target, v };
  }
  const sayOf = (pole, v) => (typeof pole.say === 'function' ? pole.say(v) : pole.say);

  /** Ablenker-Pole aus verträglichen Paaren (je Paar höchstens einer). */
  function distractorPoles(pair, n) {
    const pairs = U.shuffle(PAIRS.filter((q) => compatible(pair, q))).slice(0, n);
    return pairs.map((q) => {
      const pole = U.chance(0.5) ? q.a : q.b;
      return { pole, v: q.variants ? U.pick(q.variants) : null };
    });
  }

  /** Karte mit Ausgangsbild + Wort. */
  function givenCard(ctx, pole, v) {
    const picBox = el('div.gg-pic', pole.pic(v));
    const card = el('div.prompt-box.gg-card',
      el('div.gg-half.given', picBox, el('div.gg-word', pole.w)),
      el('div.gg-arrow', U.emoji('↔️')),
      el('div.gg-half.missing', el('div.gg-pic.gg-q', '?'), el('div.gg-word', '\u00A0'))
    );
    ctx.stage.appendChild(card);
    return card;
  }
  /** Nach der Lösung das Paar komplett zeigen. */
  function completeCard(card, pole, v) {
    const miss = card.querySelector('.gg-half.missing');
    if (!miss) return;
    U.clear(miss);
    miss.appendChild(el('div.gg-pic', pole.pic(v)));
    miss.appendChild(el('div.gg-word', pole.w));
    miss.classList.remove('missing');
    LT.ui.animate(miss, 'joy');
  }

  const Cap = (w) => U.cap(w);

  // Stufen 1–3: Bilder
  async function pictureTask(ctx, level) {
    const { pair, given, target, v } = pickPair('gg-pair-' + level);
    const nDist = level === 1 ? 1 : level === 2 ? 2 : 1;
    const dists = distractorPoles(pair, nDist);
    const items = [{ content: el('div.gg-tilepic', target.pic(v)), correct: true, say: target.w, aria: target.w }];
    if (level === 3) items.push({ content: el('div.gg-tilepic', given.pic(v)), correct: false, say: given.w, aria: given.w, sentence: sayOf(given, v), trap: true });
    dists.forEach((d) => items.push({ content: el('div.gg-tilepic', d.pole.pic(d.v)), correct: false, say: d.pole.w, aria: d.pole.w, sentence: sayOf(d.pole, d.v) }));
    // Hilfe nach einem Fehler: Flo sagt, was das gewählte Bild zeigt, und wiederholt die Frage
    const wrongSay = (item) => {
      if (item.trap) return `${item.sentence} Das ist ja genau ${given.w}! Wir suchen das Gegenteil.`;
      if (level === 1) return `${item.sentence} Aber ${pair.who ? 'wer' : 'was'} ist ${target.w}?`;
      if (level === 2) return `${item.sentence} Was ist das Gegenteil von ${given.w}?`;
      return item.sentence;
    };

    let card = null;
    if (level === 3) {
      const ear = el('div.prompt-box.gg-listen',
        el('div.gg-listen-icon', U.emoji('👂')),
        el('div.gg-listen-word', 'Gegenteil von ', el('b', given.w)));
      ctx.stage.appendChild(ear);
      card = ear;
      ctx.instruct(`Hör gut zu! Was ist das Gegenteil von ${given.w}?`);
    } else {
      card = givenCard(ctx, given, v);
      if (level === 1) ctx.instruct(`${sayOf(given, v)} ${pair.who ? 'Wer' : 'Was'} ist ${target.w}?`);
      else ctx.instruct(`${sayOf(given, v)} Was ist das Gegenteil von ${given.w}?`);
    }

    await ctx.choices(items, {
      sayButton: level === 2,
      size: 'large',
      hintAfter: 2,
      wrongSay,
      hintSay: `Das Gegenteil von ${given.w} ist ${target.w}. ${sayOf(target, v)}`,
      correctSay: level === 1
        ? `Richtig! ${Cap(given.w)} und ${target.w} sind Gegenteile.`
        : `Richtig! Das Gegenteil von ${given.w} ist ${target.w}.`,
      onWrong: async (item, tile, n) => {
        if (n === 1 && level === 3 && !item.trap) await ctx.say(`Überleg mal: Was ist ganz anders als ${given.w}?`);
      },
      onCorrect: () => { if (level !== 3) completeCard(card, target, v); },
    });
  }

  // Stufe 4: Satz ergänzen mit gesprochenen Wortkarten
  async function sentenceTask(ctx) {
    const s = U.pickFresh('gg-sent', SENTENCES, 6, (x) => x.a.w);
    const flip = U.chance(0.5);
    const first = flip ? s.b : s.a;
    const second = flip ? s.a : s.b;
    const start = `${first.t} ${first.w}, ${lowerStart(second)}`;
    const full = `${start} ${second.w}.`;

    const gap = el('div.gg-gap', '?');
    const card = el('div.prompt-box.gg-sentence',
      el('div.gg-shalf', el('div.gg-spic', first.pic()), el('div.gg-sword', first.w)),
      el('div.gg-sdots', '…'),
      el('div.gg-shalf', el('div.gg-spic', second.pic()), gap)
    );
    ctx.stage.appendChild(card);

    await ctx.instruct(`${start} …? Welches Wort passt?`);
    if (!ctx.active) return;
    const words = [second.w, first.w, U.pick(s.safe)];
    const items = words.map((w, i) => ({
      content: el('span.gg-wordcard', w),
      correct: i === 0,
      say: w,
      className: 'gg-wordtile',
      aria: w,
    }));
    await ctx.choices(items, {
      nameFirst: true,
      sayButton: true,
      hintAfter: 2,
      wrongSay: (item) => (item.say === first.w
        ? `${Cap(first.w)} steht schon vorne im Satz. Wir suchen das Gegenteil von ${first.w}.`
        : `${Cap(item.say)} passt hier nicht. Wir suchen das Gegenteil von ${first.w}.`),
      hintSay: `Das Gegenteil von ${first.w} ist ${second.w}.`,
      correctSay: `Richtig! ${full}`,
      onCorrect: () => {
        gap.textContent = second.w;
        gap.classList.add('filled');
      },
    });
  }

  LT.registerGame({
    id: 'gegensaetze',
    area: 'sprache',
    title: 'Gegenteile',
    icon: '↔️',
    levels: 4,
    rounds: 5,
    intro: 'Wir suchen Gegenteile! Gegenteile sind ganz verschieden – wie Tag und Nacht.',
    parent: {
      skill: 'Wortschatz: Eigenschaftswörter & Gegensätze',
      goal: 'Ihr Kind lernt Eigenschaftswörter (groß, heiß, leise, voll, müde …) und ihre Gegenteile kennen. Gegensatzpaare strukturieren den Wortschatz, schärfen genaues Hinhören und Beschreiben und bereiten das Verstehen von Sachtexten vor.',
      levels: [
        'Bildpaar: „Das Feuer ist heiß. Was ist kalt?“ – 2 Bilder',
        '„Was ist das Gegenteil von heiß?“ – 3 Bilder, Wörter zum Anhören',
        'Nur gesprochen, ohne Ausgangsbild – das Wort selbst ist als Falle mit dabei',
        'Sätze ergänzen: „Eis ist kalt, Feuer ist …“ mit vorgelesenen Wortkarten',
      ],
      tip: 'Spielen Sie „Gegenteil-Ping-Pong“: Sie sagen ein Wort (laut), Ihr Kind antwortet mit dem Gegenteil (leise) – und flüstert oder ruft es passend dazu. Auch beim Anziehen oder Kochen lassen sich Gegenteile entdecken (warm/kalt, nass/trocken).',
    },

    async task(ctx) {
      if (ctx.level <= 3) return pictureTask(ctx, ctx.level);
      return sentenceTask(ctx);
    },
  });
})();
