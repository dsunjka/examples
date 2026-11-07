/* ==========================================================================
   Spiel „Mein Körper“

   Didaktik:
   - Körperteile benennen und zeigen können ist Teil der Körperwahrnehmung
     und des Grundwortschatzes (Arztbesuch, Sport, „Wasch dir die Hände“).
   - Eine freundliche, selbst gezeichnete Kinderfigur (wechselnde Haut- und
     Haarfarben) mit großzügigen Trefferzonen. Das Kind tippt das genannte
     Körperteil an; danach wird es benannt und mit einem kleinen Sachsatz
     verknüpft („Mit den Ohren hörst du.“).
   - Tippt das Kind daneben, sagt Flo, was es angetippt hat („Das ist der
     Arm.“) – so lernt es auch dabei ein Wort. Nach 2 Fehlversuchen leuchtet
     die richtige Stelle auf.
   - Ab und zu lädt Flo ein, das Körperteil am eigenen Körper zu zeigen
     (Verknüpfung von Bild und eigenem Körper).
   - Stufen: große Körperteile → Gesicht (vergrößert) → Details (Hals,
     Schulter, Ellenbogen, Knie, Finger, Zeh) → die fünf Sinne.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.w1;

  /* ---------------- Körperteile ----------------
     is: „ist der Kopf“, fact: kurzer Sachsatz, show: Einladung, es am eigenen Körper zu zeigen */
  const PARTS = {
    // Stufe 1: große Körperteile
    kopf: { is: 'der Kopf', fact: 'Mit dem Kopf kannst du nicken.', show: 'Leg mal deine Hand auf deinen Kopf!' },
    bauch: { is: 'der Bauch', fact: 'In den Bauch kommt dein Essen.', show: 'Streichel mal deinen Bauch!' },
    arm: { is: 'ein Arm', fact: 'Du hast zwei Arme.', show: 'Streck mal deine Arme in die Luft!' },
    bein: { is: 'ein Bein', fact: 'Mit den Beinen kannst du laufen und springen.', show: 'Kannst du auf einem Bein stehen?' },
    hand: { is: 'eine Hand', fact: 'Du hast zwei Hände.', show: 'Klatsch mal in die Hände!' },
    fuss: { is: 'ein Fuß', fact: 'Mit den Füßen stehst du auf dem Boden.', show: 'Stampf mal mit den Füßen!' },
    // Stufe 2: Gesicht
    auge: { is: 'ein Auge', fact: 'Mit den Augen siehst du.', show: 'Blinzel mal mit deinen Augen!' },
    nase: { is: 'die Nase', fact: 'Mit der Nase riechst du.', show: 'Tipp mal auf deine Nase!' },
    mund: { is: 'der Mund', fact: 'Mit dem Mund kannst du essen und sprechen.', show: 'Mach mal deinen Mund ganz weit auf!' },
    ohr: { is: 'ein Ohr', fact: 'Mit den Ohren hörst du.', show: 'Fass mal an deine Ohren!' },
    haare: { is: 'die Haare', plural: true, fact: 'Haare wachsen immer weiter.', show: 'Wuschel mal durch deine Haare!' },
    kinn: { is: 'das Kinn', fact: 'Das Kinn ist ganz unten im Gesicht.', show: 'Tipp mal auf dein Kinn!' },
    wange: { is: 'eine Wange', fact: 'Du hast zwei Wangen.', show: 'Blas mal deine Wangen ganz dick auf!' },
    braue: { is: 'eine Augenbraue', fact: 'Die Augenbrauen sind über den Augen.', show: 'Kannst du deine Augenbrauen hochziehen?' },
    // Stufe 3: Details
    hals: { is: 'der Hals', fact: 'Der Hals verbindet den Kopf mit dem Körper.', show: 'Dreh mal deinen Kopf hin und her!' },
    schulter: { is: 'eine Schulter', fact: 'Du hast zwei Schultern.', show: 'Zieh mal deine Schultern hoch!' },
    ellenbogen: { is: 'ein Ellenbogen', fact: 'Mit dem Ellenbogen kannst du den Arm beugen.', show: 'Beug mal deinen Arm!' },
    knie: { is: 'ein Knie', fact: 'Mit dem Knie kannst du das Bein beugen.', show: 'Mach mal eine Kniebeuge!' },
    finger: { is: 'ein Finger', fact: 'An jeder Hand hast du fünf Finger.', show: 'Wackel mal mit deinen Fingern!' },
    zeh: { is: 'ein Zeh', fact: 'An jedem Fuß hast du fünf Zehen.', show: 'Wackel mal mit deinen Zehen!' },
  };
  const LEVEL_PARTS = {
    1: ['kopf', 'bauch', 'arm', 'bein', 'hand', 'fuss'],
    2: ['auge', 'nase', 'mund', 'ohr', 'haare', 'kinn', 'wange', 'braue'],
    3: ['hals', 'schulter', 'ellenbogen', 'knie', 'finger', 'zeh'],
  };

  /* ---------------- Ganze Figur (viewBox 0 0 200 400) ---------------- */
  function mirror(pts) { return pts.map(([x, y]) => [200 - x, y]); }
  const ARM_L = [[69, 128], [47, 182], [37, 228]];
  const LEG_L = [[87, 252], [83, 306], [80, 354]];
  const pl = (pts) => pts.map((p) => p.join(',')).join(' ');

  function figureMarkup(look, level) {
    const S = look.skin;
    const H = look.hair;
    const C = look.shirt;
    const SD = 'rgba(0,0,0,.18)';
    const hand = (cx, side) => {
      // Handfläche mit vier Fingern und Daumen (Daumen zeigt nach außen)
      const f = side < 0 ? [[-7, 4, -9, 17], [-2, 6, -2, 20], [3, 6, 4, 20], [8, 3, 11, 15]] : [[7, 4, 9, 17], [2, 6, 2, 20], [-3, 6, -4, 20], [-8, 3, -11, 15]];
      const th = side < 0 ? 'M-8 -4 L-16 4' : 'M8 -4 L16 4';
      return `<g transform="translate(${cx} 242)">
        ${f.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${S}" stroke-width="5.5" stroke-linecap="round"/>`).join('')}
        <path d="${th}" stroke="${S}" stroke-width="6" stroke-linecap="round"/>
        <circle r="11" fill="${S}"/></g>`;
    };
    const foot = (cx, side) => {
      const toes = [-12, -6, 0, 6, 12].map((dx, i) => `<circle cx="${cx + dx * side}" cy="${372 - (i === 0 ? 1 : 0)}" r="${i === 0 ? 3.8 : 3.1}" fill="${S}" stroke="${SD}" stroke-width=".8"/>`).join('');
      return `<ellipse cx="${cx}" cy="363" rx="16" ry="10" fill="${S}" stroke="${SD}" stroke-width="1"/>${toes}`;
    };
    const hairShort = `<path d="M63 64 Q62 26 100 26 Q138 26 137 64 Q128 44 100 45 Q74 44 63 64 Z" fill="${H}"/>`;
    const hairLong = `<path d="M60 92 Q54 40 82 30 Q100 22 118 30 Q146 40 140 92 L132 92 Q134 56 120 46 Q100 40 80 46 Q66 56 68 92 Z" fill="${H}"/>`;
    return `
      <!-- Beine & Füße -->
      <polyline points="${pl(LEG_L)}" fill="none" stroke="${S}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${pl(mirror(LEG_L))}" fill="none" stroke="${S}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M77 306 Q83 311 89 306 M111 306 Q117 311 123 306" stroke="${SD}" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${foot(78, -1)}${foot(122, 1)}
      <!-- Hose -->
      <path d="M65 214 H135 L139 264 H105 L100 238 L95 264 H61 Z" fill="#3d5a80" stroke="#2c4463" stroke-width="2" stroke-linejoin="round"/>
      <!-- Arme -->
      <polyline points="${pl(ARM_L)}" fill="none" stroke="${S}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${pl(mirror(ARM_L))}" fill="none" stroke="${S}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M44 180 Q47 186 52 183 M156 180 Q153 186 148 183" stroke="${SD}" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${hand(33, -1)}${hand(167, 1)}
      <!-- Hals & T-Shirt -->
      <rect x="91" y="96" width="18" height="30" rx="5" fill="${S}"/>
      <path d="M70 120 Q100 112 130 120 L146 150 L136 157 L136 222 H64 L64 157 L54 150 Z" fill="${C}" stroke="rgba(0,0,0,.15)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M90 118 Q100 128 110 118" stroke="rgba(0,0,0,.2)" stroke-width="2.5" fill="none"/>
      <circle cx="100" cy="176" r="10" fill="#fff" opacity=".85"/><path d="M95 176 l4 4 l7 -8" stroke="${C}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Kopf -->
      ${look.long ? hairLong : ''}
      <ellipse cx="63" cy="70" rx="7" ry="10" fill="${S}"/><ellipse cx="137" cy="70" rx="7" ry="10" fill="${S}"/>
      <circle cx="100" cy="66" r="36" fill="${S}"/>
      ${look.long ? `<path d="M64 62 Q64 28 100 28 Q136 28 136 62 Q120 46 100 48 Q80 46 64 62 Z" fill="${H}"/>` : hairShort}
      <circle cx="87" cy="67" r="3.8" fill="#2b2d42"/><circle cx="113" cy="67" r="3.8" fill="#2b2d42"/>
      <circle cx="88.3" cy="65.6" r="1.2" fill="#fff"/><circle cx="114.3" cy="65.6" r="1.2" fill="#fff"/>
      <circle cx="80" cy="80" r="5" fill="#ff8a8a" opacity=".35"/><circle cx="120" cy="80" r="5" fill="#ff8a8a" opacity=".35"/>
      <path d="M89 81 Q100 91 111 81" stroke="#7a3b2e" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${zonesFigure(level)}`;
  }

  /** Trefferzonen der Figur (je Stufe nur die passenden). */
  function zonesFigure(level) {
    const g = (part, inner) => `<g class="kz-g" data-part="${part}">${inner}</g>`;
    const line = (pts, w) => `<polyline class="kz kz-line" points="${pl(pts)}" fill="none" stroke="transparent" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const circ = (cx, cy, r) => `<circle class="kz" cx="${cx}" cy="${cy}" r="${r}" fill="transparent"/>`;
    const ell = (cx, cy, rx, ry) => `<ellipse class="kz" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="transparent"/>`;
    if (level === 1) {
      const armL = [[69, 128], [47, 182], [38, 224]];
      const legL = [[87, 266], [83, 306], [80, 348]];
      return g('bauch', `<rect class="kz" x="62" y="124" width="76" height="98" rx="10" fill="transparent"/>`) +
        g('kopf', circ(100, 60, 44)) +
        g('arm', line(armL, 32) + line(mirror(armL), 32)) +
        g('bein', line(legL, 34) + line(mirror(legL), 34)) +
        g('hand', circ(32, 248, 22) + circ(168, 248, 22)) +
        g('fuss', ell(78, 366, 25, 17) + ell(122, 366, 25, 17));
    }
    return g('hals', `<rect class="kz" x="84" y="96" width="32" height="30" rx="8" fill="transparent"/>`) +
      g('schulter', circ(66, 128, 20) + circ(134, 128, 20)) +
      g('ellenbogen', circ(47, 182, 21) + circ(153, 182, 21)) +
      g('finger', circ(32, 256, 21) + circ(168, 256, 21)) +
      g('knie', circ(83, 306, 20) + circ(117, 306, 20)) +
      g('zeh', ell(76, 372, 22, 14) + ell(124, 372, 22, 14));
  }

  /* ---------------- Großes Gesicht (viewBox 0 0 300 300) ---------------- */
  function faceMarkup(look) {
    const S = look.skin;
    const H = look.hair;
    const SD = 'rgba(0,0,0,.16)';
    const eye = (cx) => `<ellipse cx="${cx}" cy="150" rx="16" ry="14" fill="#fff" stroke="${SD}" stroke-width="1.5"/>
      <circle cx="${cx}" cy="151" r="9" fill="#5a3d2b"/><circle cx="${cx}" cy="151" r="4.5" fill="#1d1d1d"/>
      <circle cx="${cx + 3}" cy="147" r="2.6" fill="#fff"/>`;
    return `
      ${look.long ? `<path d="M50 150 Q40 60 150 44 Q260 60 250 150 L252 236 Q236 250 222 236 L218 140 H82 L78 236 Q64 250 48 236 Z" fill="${H}"/>` : ''}
      <ellipse cx="48" cy="164" rx="19" ry="28" fill="${S}" stroke="${SD}" stroke-width="2"/>
      <path d="M50 150 Q40 164 50 178" stroke="${SD}" stroke-width="3" fill="none"/>
      <ellipse cx="252" cy="164" rx="19" ry="28" fill="${S}" stroke="${SD}" stroke-width="2"/>
      <path d="M250 150 Q260 164 250 178" stroke="${SD}" stroke-width="3" fill="none"/>
      <ellipse cx="150" cy="162" rx="98" ry="108" fill="${S}"/>
      <path d="M53 142 Q50 48 150 46 Q250 48 247 142 Q236 94 150 94 Q66 94 53 142 Z" fill="${H}"/>
      <path d="M100 121 Q118 110 136 120 M164 120 Q182 110 200 121" stroke="${H}" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${eye(118)}${eye(182)}
      <path d="M150 162 L139 192 Q150 201 161 192 Z" fill="rgba(0,0,0,.12)"/>
      <circle cx="94" cy="200" r="15" fill="#ff8a8a" opacity=".35"/><circle cx="206" cy="200" r="15" fill="#ff8a8a" opacity=".35"/>
      <path d="M116 214 Q150 246 184 214 Q150 228 116 214 Z" fill="#c2453a" stroke="#8f2f27" stroke-width="2" stroke-linejoin="round"/>
      <path d="M136 230 Q150 236 164 230" stroke="#ff9d93" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M134 262 Q150 268 166 262" stroke="${SD}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${zonesFace()}`;
  }
  function zonesFace() {
    const g = (part, inner) => `<g class="kz-g" data-part="${part}">${inner}</g>`;
    const circ = (cx, cy, r) => `<circle class="kz" cx="${cx}" cy="${cy}" r="${r}" fill="transparent"/>`;
    const ell = (cx, cy, rx, ry) => `<ellipse class="kz" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="transparent"/>`;
    return g('haare', `<path class="kz" d="M48 142 Q44 36 150 34 Q256 36 252 142 Q238 100 150 100 Q62 100 48 142 Z" fill="transparent"/>`) +
      g('ohr', ell(46, 164, 21, 32) + ell(254, 164, 21, 32)) +
      g('braue', `<rect class="kz" x="94" y="102" width="48" height="30" rx="10" fill="transparent"/><rect class="kz" x="158" y="102" width="48" height="30" rx="10" fill="transparent"/>`) +
      g('auge', circ(118, 151, 19) + circ(182, 151, 19)) +
      g('nase', ell(150, 182, 18, 22)) +
      g('wange', circ(92, 202, 23) + circ(208, 202, 23)) +
      g('mund', ell(150, 223, 40, 17)) +
      g('kinn', ell(150, 257, 42, 14));
  }

  /* ---------------- Die fünf Sinne (Stufe 4) ---------------- */
  const SENSES = {
    sehen: { e: '👀', say: 'die Augen', mit: 'mit den Augen', verb: 'siehst', q: 'Womit siehst du?' },
    hoeren: { e: '👂', say: 'die Ohren', mit: 'mit den Ohren', verb: 'hörst', q: 'Womit hörst du?' },
    riechen: { e: '👃', say: 'die Nase', mit: 'mit der Nase', verb: 'riechst', q: 'Womit riechst du?' },
    schmecken: { e: '👅', say: 'die Zunge', mit: 'mit der Zunge', verb: 'schmeckst', q: 'Womit schmeckst du?' },
    fuehlen: { e: '✋', say: 'die Hände', mit: 'mit den Händen und der Haut', verb: 'fühlst', q: 'Womit fühlst du, ob etwas weich oder hart ist?' },
  };
  // Situationen, die eindeutig EINEN Sinn ansprechen
  const SITUATIONS = [
    { s: 'hoeren', e: '🔔', t: 'Die Glocke läutet: Ding, dong!' },
    { s: 'hoeren', e: '🥁', t: 'Jemand trommelt ganz laut.' },
    { s: 'hoeren', e: '🐦', t: 'Ein Vogel singt ein Lied.' },
    { s: 'hoeren', e: '🐶', t: 'Der Hund bellt: Wau, wau!' },
    { s: 'sehen', e: '🌈', t: 'Am Himmel ist ein bunter Regenbogen.' },
    { s: 'sehen', e: '⭐', t: 'In der Nacht leuchten die Sterne.' },
    { s: 'sehen', e: '🦋', t: 'Ein bunter Schmetterling fliegt vorbei.' },
    { s: 'riechen', e: '🌸', t: 'Die Blume duftet ganz fein.' },
    { s: 'riechen', e: '🧦', t: 'Die alten Socken stinken.' },
    { s: 'schmecken', e: '🍋', t: 'Die Zitrone ist sauer.' },
    { s: 'schmecken', e: '🍬', t: 'Das Bonbon ist süß.' },
    { s: 'schmecken', e: '🥨', t: 'Die Brezel ist salzig.' },
    { s: 'fuehlen', e: '🧸', t: 'Der Teddy ist ganz weich.' },
    { s: 'fuehlen', e: '🌵', t: 'Der Kaktus ist stachelig.' },
    { s: 'fuehlen', e: '🧊', t: 'Der Eiswürfel ist kalt.' },
  ];

  LT.registerGame({
    id: 'koerper',
    area: 'welt',
    title: 'Mein Körper',
    icon: '🧍',
    levels: 4,
    rounds: 5,
    parent: {
      skill: 'Körperteile & Sinne benennen',
      goal: 'Ihr Kind lernt die Namen der Körperteile – vom Kopf bis zum Ellenbogen – und verknüpft die Sinnesorgane mit den fünf Sinnen. Das stärkt Körperwahrnehmung und Wortschatz (z. B. beim Arzt: „Mein Knie tut weh“).',
      levels: [
        'Große Körperteile: Kopf, Bauch, Arm, Bein, Hand, Fuß',
        'Gesicht (vergrößert): Auge, Nase, Mund, Ohr, Haare, Kinn, Wange, Augenbraue',
        'Details: Hals, Schulter, Ellenbogen, Knie, Finger, Zeh',
        'Die fünf Sinne: Womit hörst, siehst, riechst, schmeckst, fühlst du?',
      ],
      tip: 'Singen Sie „Kopf, Schulter, Knie und Fuß“ mit Bewegungen. Beim Anziehen oder Baden: „Wo ist dein Ellenbogen?“ Bei einem Spaziergang: „Was hörst du? Was riechst du?“',
    },

    async task(ctx) {
      if (ctx.level >= 4) return senseTask(ctx);
      return bodyTask(ctx);
    },
  });

  /** Stufen 1–3: Körperteil auf der Figur antippen. */
  async function bodyTask(ctx) {
    const level = ctx.level;
    const partId = U.pickFresh('koerper-' + level, LEVEL_PARTS[level], 3);
    const part = PARTS[partId];
    const look = W.look('koerper');
    const verb = part.plural ? 'sind' : 'ist';

    ctx.stage.classList.add('koerper-stage');
    const q = `Wo ${verb} ${part.is}?`;
    const prompt = el('div.w1-prompt.koerper-prompt', U.emoji('👆'), el('span.w1-q', q));
    ctx.stage.appendChild(prompt);
    const svg = level === 2
      ? W.svg('0 0 300 300', faceMarkup(look), 'koerper-svg koerper-face')
      : W.svg('0 0 200 400', figureMarkup(look, level), 'koerper-svg koerper-figure');
    const wrap = el('div.koerper-wrap', svg);
    ctx.stage.appendChild(wrap);

    ctx.instruct(`${q} Tippe darauf!`);
    const zoneOf = (id) => svg.querySelector(`[data-part="${id}"]`);
    const nameOf = (z) => PARTS[z.getAttribute('data-part')];
    const showMe = U.chance(0.35);

    await W.tapTask(ctx, {
      root: svg,
      find: (t) => (t && t.closest ? t.closest('[data-part]') : null),
      isCorrect: (z) => z.getAttribute('data-part') === partId,
      correctNode: () => zoneOf(partId),
      onCorrect: (z) => z.classList.add('w1-ok'),
      feedbackNode: () => wrap,
      correctSay: () => `Richtig! Das ${verb} ${part.is}. ${showMe ? part.show : part.fact}`,
      wrongSay: (z) => {
        const p = nameOf(z);
        return `Das ${p.plural ? 'sind' : 'ist'} ${p.is}. ${q}`;
      },
      hintSay: `Schau mal, hier leuchtet es. Da ${verb} ${part.is}.`,
    });
    if (showMe && ctx.active) await ctx.sleep(1200);
  }

  /** Stufe 4: Welcher Sinn passt? */
  async function senseTask(ctx) {
    const direct = U.chance(0.3);
    let senseId;
    let promptNode;
    let text;
    let correctText;
    if (direct) {
      senseId = U.pickFresh('koerper-sense', Object.keys(SENSES), 2);
      const s = SENSES[senseId];
      text = s.q;
      correctText = `Richtig! Du ${s.verb} ${s.mit}.`;
      promptNode = el('div.w1-prompt', U.emoji('🤔'), el('span.w1-q', s.q));
    } else {
      const sit = U.pickFresh('koerper-sit', SITUATIONS, 6, (x) => x.e);
      senseId = sit.s;
      const s = SENSES[senseId];
      text = `${sit.t} Womit merkst du das?`;
      correctText = `Richtig! Das ${s.verb} du ${s.mit}.`;
      promptNode = el('div.w1-prompt', U.emoji(sit.e, 'big-emoji'), el('span.w1-q', sit.t));
    }
    ctx.stage.appendChild(promptNode);
    const items = Object.keys(SENSES).map((k) => ({
      content: SENSES[k].e,
      say: SENSES[k].say,
      correct: k === senseId,
      value: k,
    }));
    ctx.instruct(text);
    await ctx.choices(items, {
      shuffle: false,
      sayButton: true,
      nameFirst: ctx.index === 0,
      className: 'koerper-senses',
      correctSay: () => correctText,
      wrongSay: (it) => `Das ${['sehen', 'hoeren', 'fuehlen'].includes(it.value) ? 'sind' : 'ist'} ${it.say}. Probier es nochmal!`,
      hintSay: `Ich helfe dir: ${SENSES[senseId].say}!`,
    });
  }
})();
