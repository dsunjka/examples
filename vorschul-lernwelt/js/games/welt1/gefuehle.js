/* ==========================================================================
   Spiel „Gefühle“ (sozial-emotionales Lernen)

   Didaktik:
   - Gefühle erkennen, benennen und regulieren ist eine Kernkompetenz für
     Freundschaften und den Schulalltag.
   - Selbst gezeichnete Kindergesichter mit wechselnden Haut- und Haarfarben:
     Das Kind achtet auf den AUSDRUCK (Augenbrauen, Augen, Mund), nicht auf
     das Aussehen. Nach jeder Antwort nennt Flo das Merkmal („Die Mundwinkel
     zeigen nach unten“) – so wird der Blick für Mimik geschult.
   - Wertschätzende Sprache: Alle Gefühle sind okay („Jeder ist manchmal
     traurig“). Bei „Was hilft?“ geht es um Handlungen, nie um „falsche“
     Gefühle.
   - Geschichten nutzen abwechslungsreiche Vornamen. Ablenker werden so
     gewählt, dass nur EIN Gefühl wirklich passt (z. B. bei einem Geschenk
     nie „überrascht“ als Ablenker neben „fröhlich“).
   - Stufen: Grundgefühle → weitere Gefühle & gleiches Gefühl wiederfinden →
     Situationen → Was hilft?
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.w1;

  /* ---------------- Gefühle ---------------- */
  const FEEL = {
    froehlich: { adj: 'fröhlich', attr: 'fröhliche', cue: 'Es lacht über das ganze Gesicht.' },
    traurig: { adj: 'traurig', attr: 'traurige', cue: 'Die Mundwinkel zeigen nach unten, und eine Träne kullert.', ok: 'Jeder ist manchmal traurig. Das ist okay.' },
    wuetend: { adj: 'wütend', attr: 'wütende', cue: 'Die Augenbrauen sind nach unten gezogen, und es beißt die Zähne zusammen.', ok: 'Wütend sein ist okay. Aber wir tun niemandem weh.' },
    aengstlich: { adj: 'ängstlich', attr: 'ängstliche', cue: 'Die Augen sind weit aufgerissen, und der Mund zittert.', ok: 'Jeder hat mal Angst. Das ist okay.' },
    ueberrascht: { adj: 'überrascht', attr: 'überraschte', cue: 'Die Augenbrauen gehen hoch, und der Mund ist rund wie ein O.' },
    muede: { adj: 'müde', attr: 'müde', cue: 'Die Augen fallen ihm fast zu.' },
    verliebt: { adj: 'verliebt', attr: 'verliebte', cue: 'Es hat Herzchen in den Augen.' },
  };
  const BASIC = ['froehlich', 'traurig', 'wuetend', 'aengstlich'];
  const MORE = ['ueberrascht', 'muede', 'verliebt'];

  /** Gesicht als SVG-Markup (viewBox 0 0 120 120). */
  function faceMarkup(feel, look) {
    const S = look.skin;
    const H = look.hair;
    const INK = '#2b2d42';
    const st = (d, w = 3.5, c = INK) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const dotEyes = `<circle cx="44" cy="60" r="4.2" fill="${INK}"/><circle cx="76" cy="60" r="4.2" fill="${INK}"/><circle cx="45.4" cy="58.6" r="1.3" fill="#fff"/><circle cx="77.4" cy="58.6" r="1.3" fill="#fff"/>`;
    const bigEyes = (pr) => `<circle cx="44" cy="60" r="8.5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="76" cy="60" r="8.5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="44" cy="61" r="${pr}" fill="${INK}"/><circle cx="76" cy="61" r="${pr}" fill="${INK}"/>`;
    const cheeks = (c, o) => `<circle cx="32" cy="74" r="7" fill="${c}" opacity="${o}"/><circle cx="88" cy="74" r="7" fill="${c}" opacity="${o}"/>`;
    const heart = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 3 C-2 -1 -8 -1 -8 4 C-8 8 -3 11 0 14 C3 11 8 8 8 4 C8 -1 2 -1 0 3 Z" fill="#e8364f"/>`;
    let f = '';
    switch (feel) {
      case 'froehlich':
        f = st('M36 47 Q44 42 52 47') + st('M68 47 Q76 42 84 47') +
          st('M38 62 Q44 55 50 62', 4) + st('M70 62 Q76 55 82 62', 4) +
          `<path d="M40 75 Q60 100 80 75 Z" fill="#8f2f27" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
           <path d="M50 88 Q60 82 70 88 Q60 95 50 88 Z" fill="#ff8f8f"/>` + cheeks('#ff7a7a', 0.45);
        break;
      case 'traurig':
        f = st('M36 48 L52 42') + st('M68 42 L84 48') + dotEyes +
          st('M45 90 Q60 79 75 90') +
          `<path d="M40 67 Q35 76 40 80 Q45 76 40 67 Z" fill="#5fb7ff" stroke="#2f8fdc" stroke-width="1"/>`;
        break;
      case 'wuetend':
        f = `<circle cx="60" cy="64" r="44" fill="#ff3b3b" opacity=".16"/>` +
          st('M35 43 L53 51', 4.5) + st('M67 51 L85 43', 4.5) +
          `<circle cx="45" cy="61" r="3.8" fill="${INK}"/><circle cx="75" cy="61" r="3.8" fill="${INK}"/>` +
          `<rect x="44" y="80" width="32" height="11" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
           <path d="M44 85.5 H76 M52 80 V91 M60 80 V91 M68 80 V91" stroke="${INK}" stroke-width="1.5"/>` + cheeks('#ff3b3b', 0.4);
        break;
      case 'aengstlich':
        f = st('M36 47 L52 39') + st('M68 39 L84 47') + bigEyes(2.6) +
          st('M44 87 q4 -4 8 0 t8 0 t8 0 t8 0', 3) +
          `<path d="M95 34 Q90 44 95 48 Q100 44 95 34 Z" fill="#5fb7ff" stroke="#2f8fdc" stroke-width="1"/>`;
        break;
      case 'ueberrascht':
        f = st('M36 41 Q44 33 52 41') + st('M68 41 Q76 33 84 41') + bigEyes(4) +
          `<ellipse cx="60" cy="87" rx="7" ry="9" fill="#8f2f27" stroke="${INK}" stroke-width="2.5"/>`;
        break;
      case 'muede':
        f = st('M37 49 L51 49') + st('M69 49 L83 49') +
          `<path d="M37 60 H51 Q44 67 37 60 Z" fill="${INK}"/><path d="M69 60 H83 Q76 67 69 60 Z" fill="${INK}"/>` +
          st('M37 60 H51', 3) + st('M69 60 H83', 3) +
          st('M51 86 Q60 90 69 86', 3) +
          `<text x="92" y="30" font-size="15" font-weight="700" fill="#4a6fa5" font-family="var(--font)">z</text>
           <text x="100" y="18" font-size="20" font-weight="700" fill="#4a6fa5" font-family="var(--font)">Z</text>`;
        break;
      case 'verliebt':
        f = st('M36 46 Q44 42 52 46') + st('M68 46 Q76 42 84 46') +
          heart(44, 53, 1) + heart(76, 53, 1) +
          st('M44 79 Q60 92 76 79') + cheeks('#ff5f86', 0.55) + heart(98, 18, 0.7);
        break;
    }
    const hairBack = look.long ? `<path d="M16 66 Q12 18 60 16 Q108 18 104 66 L106 100 Q96 108 88 100 L86 60 H34 L32 100 Q24 108 14 100 Z" fill="${H}"/>` : '';
    return hairBack +
      `<ellipse cx="17" cy="66" rx="6" ry="9" fill="${S}"/><ellipse cx="103" cy="66" rx="6" ry="9" fill="${S}"/>
       <circle cx="60" cy="64" r="44" fill="${S}"/>
       <path d="M17 58 Q16 18 60 18 Q104 18 103 58 Q92 34 60 36 Q28 34 17 58 Z" fill="${H}"/>` + f;
  }
  function faceNode(feel, look, cls) {
    return W.svg('0 0 120 120', faceMarkup(feel, look), 'gef-face ' + (cls || ''));
  }
  /** Verschiedene Looks für eine Auswahl (damit das Aussehen nicht verrät, welches Gesicht passt). */
  function looks(n) {
    const skins = U.shuffle(W.SKIN);
    const hairs = U.shuffle(W.HAIR);
    return U.range(0, n - 1).map((i) => ({ skin: skins[i % skins.length], hair: hairs[i % hairs.length], long: U.chance(0.5) }));
  }

  /* ---------------- Geschichten (Stufe 3) ----------------
     g: Geschlecht des Namens; ex: Gefühle, die hier AUCH passen könnten → nie als Ablenker */
  const STORIES = [
    { g: 'w', t: '{N} bekommt ein Geschenk.', e: '🎁', f: 'froehlich', why: '{er} ein Geschenk bekommt', ex: ['ueberrascht', 'verliebt'] },
    { g: 'm', t: '{N} hat seinen Teddy verloren.', e: '🧸', f: 'traurig', why: '{er} den Teddy vermisst', ex: ['aengstlich', 'wuetend'] },
    { g: 'm', t: 'Jemand macht die Sandburg von {N} kaputt. Mit Absicht!', e: '🏰', f: 'wuetend', why: 'jemand die Sandburg kaputt gemacht hat', ex: ['traurig', 'ueberrascht'] },
    { g: 'w', t: 'Es donnert und blitzt ganz laut. {N} ist allein in ihrem Zimmer.', e: '⛈️', f: 'aengstlich', why: 'das Gewitter so laut ist', ex: ['ueberrascht', 'traurig'] },
    { g: 'm', t: '{N} war den ganzen Tag im Schwimmbad. Jetzt ist es Abend, und er gähnt.', e: '🌙', f: 'muede', why: 'er den ganzen Tag geschwommen ist', ex: ['traurig'] },
    { g: 'w', t: '{N} darf mit Oma ein Eis essen.', e: '🍦', f: 'froehlich', why: '{er} mit Oma Eis isst', ex: ['verliebt', 'ueberrascht'] },
    { g: 'm', t: 'Der Luftballon von {N} fliegt weg, hoch in den Himmel.', e: '🎈', f: 'traurig', why: 'der Luftballon weg ist', ex: ['ueberrascht', 'wuetend'] },
    { g: 'w', t: 'Ein anderes Kind nimmt {N} einfach die Schaufel weg.', e: '⛏️', f: 'wuetend', why: 'ihr jemand die Schaufel weggenommen hat', ex: ['traurig', 'ueberrascht'], noEmoji: true },
    { g: 'm', t: 'Ein großer Hund bellt {N} ganz laut an.', e: '🐕', f: 'aengstlich', why: 'der große Hund laut bellt', ex: ['ueberrascht', 'wuetend'] },
    { g: 'w', t: 'Plötzlich springt Opa hinter dem Sofa hervor und ruft: Kuckuck! Damit hat {N} nicht gerechnet.', e: '👴', f: 'ueberrascht', why: '{er} damit nicht gerechnet hat', ex: ['aengstlich', 'froehlich'] },
    { g: 'm', t: '{N} hat den ganzen Tag getobt. Jetzt fallen ihm die Augen zu.', e: '🛏️', f: 'muede', why: 'er so viel getobt hat', ex: ['traurig'] },
    { g: 'w', t: 'Die beste Freundin von {N} zieht in eine andere Stadt.', e: '🚚', f: 'traurig', why: 'die Freundin wegzieht', ex: ['wuetend', 'aengstlich'] },
    { g: 'm', t: '{N} hat ganz allein einen hohen Turm gebaut.', e: '🧱', f: 'froehlich', why: 'der Turm so toll geworden ist', ex: ['ueberrascht', 'verliebt'] },
    { g: 'w', t: '{N} hat Geburtstag, und alle singen für sie.', e: '🎂', f: 'froehlich', why: 'alle für sie singen', ex: ['ueberrascht', 'verliebt'] },
    { g: 'm', t: 'Der große Bruder kritzelt einfach auf das Bild von {N}.', e: '🖍️', f: 'wuetend', why: 'sein Bild bekritzelt wurde', ex: ['traurig', 'ueberrascht'] },
    { g: 'w', t: 'Es wird dunkel, und {N} hört draußen ein komisches Geräusch.', e: '🌲', f: 'aengstlich', why: 'das Geräusch unheimlich ist', ex: ['ueberrascht', 'traurig'] },
    { g: 'w', t: '{N} findet unter ihrem Kissen einen glitzernden Stein. Damit hat sie nicht gerechnet!', e: '💎', f: 'ueberrascht', why: 'sie damit nicht gerechnet hat', ex: ['froehlich', 'verliebt'] },
    { g: 'w', t: '{N} denkt an Karim und bekommt ganz rote Wangen. Sie mag ihn sooo gern.', e: '💕', f: 'verliebt', why: 'sie Karim so gern mag', ex: ['froehlich'], nameNot: 'Karim' },
  ];

  /* ---------------- Was hilft? (Stufe 4) ----------------
     Immer EINE hilfreiche Handlung, zwei klar nicht hilfreiche. */
  const HELP = [
    { f: 'traurig', t: 'Dein Freund ist traurig. Sein Turm ist umgefallen. Was kannst du tun?',
      ok: { e: '🤗', say: 'Ihn trösten' }, no: [{ e: '😝', say: 'Ihm die Zunge rausstrecken' }, { e: '😂', say: 'Ihn auslachen' }],
      learn: 'Genau! Trösten hilft, wenn jemand traurig ist.' },
    { f: 'wuetend', t: 'Du bist ganz wütend. Was hilft dir?',
      ok: { e: '🌬️', say: 'Tief durchatmen' }, no: [{ e: '👊', say: 'Jemanden hauen' }, { e: '💥', say: 'Sachen kaputt machen' }],
      learn: 'Genau! Tief durchatmen hilft, wenn du wütend bist. Danach kannst du sagen, was dich ärgert.' },
    { f: 'wuetend', t: 'Ein Kind nimmt dir einfach dein Auto weg. Du bist wütend. Was kannst du tun?',
      ok: { e: '🗣️', say: 'Laut sagen: Stopp, das will ich nicht!' }, no: [{ e: '👊', say: 'Zurückhauen' }, { e: '🦷', say: 'Beißen' }],
      learn: 'Genau! Mit Worten sagen, was dich stört. Das hilft.' },
    { f: 'aengstlich', t: 'Du wachst nachts auf und hast Angst im Dunkeln. Was hilft dir?',
      ok: { e: '💡', say: 'Licht anmachen und einen Erwachsenen rufen' }, no: [{ e: '📺', say: 'Einen gruseligen Film anschauen' }, { e: '🍭', say: 'Ganz viele Süßigkeiten essen' }],
      learn: 'Genau! Licht anmachen und einen Erwachsenen rufen. Dann ist die Angst schnell kleiner.' },
    { f: 'traurig', t: 'Ein Kind sitzt ganz allein und schaut traurig zu. Was kannst du tun?',
      ok: { e: '🤝', say: 'Fragen: Willst du mitspielen?' }, no: [{ e: '🙈', say: 'Einfach wegschauen' }, { e: '😂', say: 'Das Kind auslachen' }],
      learn: 'Genau! Fragen, ob es mitspielen will. Dann ist es nicht mehr allein.' },
    { f: 'traurig', t: 'Deine Freundin ist hingefallen und weint. Was kannst du tun?',
      ok: { e: '🩹', say: 'Ihr helfen und einen Erwachsenen holen' }, no: [{ e: '😂', say: 'Sie auslachen' }, { e: '🏃', say: 'Einfach weiterrennen' }],
      learn: 'Genau! Helfen und einen Erwachsenen holen. Das ist lieb von dir.' },
    { f: 'traurig', t: 'Du hast zwei Äpfel. Dein Freund hat Hunger und hat keinen. Was kannst du tun?',
      ok: { e: '🍎', say: 'Einen Apfel abgeben' }, no: [{ e: '😋', say: 'Beide Äpfel allein essen' }, { e: '🗑️', say: 'Einen Apfel wegwerfen' }],
      learn: 'Genau! Teilen macht beide froh.' },
    { f: 'traurig', t: 'Du bist traurig. Was hilft dir?',
      ok: { e: '🤗', say: 'Mit jemandem kuscheln und erzählen, was los ist' }, no: [{ e: '💥', say: 'Etwas kaputt machen' }, { e: '👊', say: 'Jemanden hauen' }],
      learn: 'Genau! Erzählen, was los ist, und kuscheln. Das tröstet.' },
    { f: 'traurig', t: 'Du hast aus Versehen den Turm von Mila umgeworfen. Jetzt ist Mila traurig. Was kannst du tun?',
      ok: { e: '💬', say: 'Entschuldigung sagen und beim Aufbauen helfen' }, no: [{ e: '😝', say: 'Ihr die Zunge rausstrecken' }, { e: '🏃', say: 'Schnell weglaufen' }],
      learn: 'Genau! Entschuldigung sagen und helfen. Dann geht es Mila bald besser.' },
    { f: 'aengstlich', t: 'Du musst zum Arzt und hast ein bisschen Angst. Was hilft dir?',
      ok: { e: '🧸', say: 'Dein Kuscheltier mitnehmen' }, no: [{ e: '🍭', say: 'Ganz viele Süßigkeiten essen' }, { e: '👊', say: 'Den Arzt hauen' }],
      learn: 'Genau! Ein Kuscheltier gibt Mut. Und ein Erwachsener ist bei dir.' },
  ];

  LT.registerGame({
    id: 'gefuehle',
    area: 'welt',
    title: 'Gefühle',
    icon: '😊',
    levels: 4,
    rounds: 5,
    parent: {
      skill: 'Gefühle erkennen & damit umgehen',
      goal: 'Ihr Kind erkennt Gefühle an der Mimik (Augenbrauen, Augen, Mund), ordnet sie Alltagssituationen zu und lernt hilfreiche Handlungen kennen: trösten, teilen, tief durchatmen, mit Worten sagen, was stört. Alle Gefühle sind okay – es geht darum, gut mit ihnen umzugehen.',
      levels: [
        'Grundgefühle: fröhlich, traurig, wütend, ängstlich',
        'Dazu: überrascht, müde, verliebt – und gleiche Gefühle bei verschiedenen Kindern wiederfinden',
        'Kurze Geschichten: Wie fühlt sich das Kind?',
        'Was hilft? Trösten, teilen, durchatmen, Hilfe holen',
      ],
      tip: 'Benennen Sie Gefühle im Alltag („Du siehst wütend aus, weil der Turm umgefallen ist“). Beim Bilderbuchlesen fragen: „Wie fühlt sich der Bär jetzt? Woran siehst du das?“ Vor dem Spiegel Grimassen schneiden macht Spaß und schult die Mimik.',
    },

    async task(ctx) {
      if (ctx.level === 1) return pickFace(ctx, BASIC, 3);
      if (ctx.level === 2) return U.chance(0.45) ? matchFace(ctx) : pickFace(ctx, BASIC.concat(MORE), 4, true);
      if (ctx.level === 3) return storyTask(ctx);
      return helpTask(ctx);
    },
  });

  /** Stufen 1–2: „Tippe auf das traurige Kind.“ */
  async function pickFace(ctx, pool, n, preferNew) {
    let target = preferNew && U.chance(0.6) ? U.pickFresh('gef-new', MORE, 1) : U.pickFresh('gef-t' + ctx.level, pool, 2);
    const others = U.sample(pool.filter((f) => f !== target), n - 1);
    const lk = looks(n);
    const F = FEEL[target];
    const q = `Tippe auf das ${F.attr} Kind.`;
    ctx.stage.appendChild(el('div.w1-prompt', U.emoji('👆'), el('span.w1-q', q)));
    const items = [target].concat(others).map((f, i) => ({
      content: faceNode(f, lk[i]),
      correct: f === target,
      className: 'gef-tile',
      aria: FEEL[f].adj,
      value: f,
    }));
    ctx.instruct(q);
    const extra = F.ok && U.chance(0.5) ? ' ' + F.ok : '';
    await ctx.choices(items, {
      size: 'large',
      correctSay: () => `Richtig! Dieses Kind ist ${F.adj}. ${F.cue}${extra}`,
      wrongSay: (it) => `Dieses Kind ist ${FEEL[it.value].adj}. Wir suchen das ${F.attr} Kind.`,
      hintSay: `Ein Tipp: ${F.cue}`,
    });
  }

  /** Stufe 2: gleiches Gefühl bei einem anderen Kind wiederfinden. */
  async function matchFace(ctx) {
    const pool = BASIC.concat(MORE);
    const target = U.pickFresh('gef-m', pool, 3);
    const others = U.sample(pool.filter((f) => f !== target), 2);
    const lk = looks(4);
    const F = FEEL[target];
    ctx.stage.appendChild(el('div.w1-prompt.gef-model', faceNode(target, lk[3], 'gef-face-model'), el('span.w1-q', `Dieses Kind ist ${F.adj}.`)));
    const items = [target].concat(others).map((f, i) => ({
      content: faceNode(f, lk[i]),
      correct: f === target,
      className: 'gef-tile',
      aria: FEEL[f].adj,
      value: f,
    }));
    ctx.instruct(`Dieses Kind ist ${F.adj}. Welches andere Kind ist auch ${F.adj}?`);
    await ctx.choices(items, {
      size: 'large',
      correctSay: () => `Richtig! Beide Kinder sind ${F.adj}. ${F.cue}`,
      wrongSay: (it) => `Dieses Kind ist ${FEEL[it.value].adj}. Schau nochmal genau hin.`,
      hintSay: `Ein Tipp: ${F.cue}`,
    });
  }

  /** Stufe 3: Geschichte hören, passendes Gefühl wählen. */
  async function storyTask(ctx) {
    const s = U.pickFresh('gef-story', STORIES, 8, (x) => x.t);
    let name = W.name(s.g);
    if (s.nameNot && name === s.nameNot) name = W.name(s.g);
    const er = s.g === 'w' ? 'sie' : 'er';
    const text = s.t.replace('{N}', name);
    const why = s.why.replace('{er}', er);
    const F = FEEL[s.f];
    const pool = BASIC.concat(MORE).filter((f) => f !== s.f && !s.ex.includes(f));
    const others = U.sample(pool, 2);
    const lk = looks(3);

    const child = s.g === 'w' ? '👧' : '👦';
    ctx.stage.appendChild(el('div.w1-prompt.gef-story',
      el('div.gef-scene', U.emoji(child), s.noEmoji ? null : U.emoji(s.e)),
      el('span.w1-q', text)
    ));
    const items = [s.f].concat(others).map((f, i) => ({
      content: faceNode(f, lk[i]),
      correct: f === s.f,
      className: 'gef-tile',
      aria: FEEL[f].adj,
      value: f,
    }));
    ctx.instruct(`${text} Wie fühlt ${er} sich?`);
    await ctx.choices(items, {
      size: 'large',
      correctSay: () => `Richtig! ${name} ist ${F.adj}, weil ${why}.`,
      wrongSay: (it) => `Dieses Kind ist ${FEEL[it.value].adj}. Passt das zu ${name}?`,
      hintSay: `Ich glaube, ${name} ist ${F.adj}.`,
    });
  }

  /** Stufe 4: Was hilft? */
  async function helpTask(ctx) {
    const h = U.pickFresh('gef-help', HELP, 5, (x) => x.t);
    const look = W.look('gef');
    ctx.stage.appendChild(el('div.w1-prompt.gef-story',
      faceNode(h.f, look, 'gef-face-model'),
      el('span.w1-q', h.t)
    ));
    const items = [Object.assign({ correct: true }, h.ok)].concat(h.no.map((x) => Object.assign({ correct: false }, x)))
      .map((x) => ({ content: x.e, say: x.say, correct: x.correct, label: null }));
    ctx.instruct(h.t);
    await ctx.choices(items, {
      nameFirst: true,
      sayButton: true,
      correctSay: () => h.learn,
      wrongSay: () => 'Hm, hilft das wirklich? Überleg nochmal.',
      hintSay: `Was meinst du hierzu: ${h.ok.say}?`,
    });
  }
})();
