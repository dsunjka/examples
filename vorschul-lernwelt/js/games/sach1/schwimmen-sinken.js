/* ==========================================================================
   Spiel „Schwimmt oder sinkt?“ 🛁 (Sachkunde-Schule, Klasse 1) – B13

   Didaktik (Sachunterricht Klasse 1: Stoffe und ihre Eigenschaften, Wasser):
   - Forscher-Ablauf wie im Schulversuch: Vermuten → Versuch im Wasserbecken
     (Animation) → Ergebnis beobachten → Erklärung. Die Vermutung ist das
     Lern-Item (ctx.track(key, ok)); eine falsche Vermutung ist „beim Forschen
     ganz normal“ – das Kind sieht sofort, was wirklich passiert.
   - Kernidee: Es liegt am MATERIAL, nicht an der Größe oder dem Gewicht.
     Dinge aus Holz und Kork schwimmen meistens, viele aus Plastik auch;
     volle Dinge aus Metall, Stein und Glas sinken. Hohle Dinge mit Luft darin
     (Schiff, Schüssel) sind Thema von Stufe 5; die Größenfalle nutzt nur volle
     Dinge, damit „Material“ und „Luft im Inneren“ sich nicht widersprechen
     (die hohle Badeente bekommt einen eigenen Merksatz mit der Luft).
   - Fehlvorstellung „Schwere/große Dinge sinken immer“ wird mit
     Gegenbeispielen widerlegt: riesiger Baumstamm schwimmt, winziger Nagel
     sinkt. Auf der höchsten Stufe: Ein Schiff aus Metall schwimmt (innen hohl,
     voller Luft), Knete als Kugel sinkt, als Schiffchen schwimmt sie.
   - Stufen:
       1  Vermuten mit klaren Alltagsdingen (Brücke aus der Vorschule);
          Merksatz mit dem Material nach jedem Versuch
       2  Material-Detektiv: vermuten, testen, dann „Woraus ist es?“ –
          Material-Muster (Holz, Kork, Plastik, Metall, Stein, Glas) wählen
       3  Forscher-Tabelle: für drei bis fünf Dinge vermuten, dann alle auf
          einmal testen und die Vermutungen überprüfen (festigt Stufe 1–2)
       4  Größen-Falle: ein großes und ein kleines Ding – welches sinkt /
          schwimmt? Danach „Warum?“ (Material statt groß/schwer/Form) –
          Begründen leitet zu den Profi-Rätseln über
       5  Profi-Rätsel (Ende Klasse 1): Schiff und Schüssel aus Metall, Knete
          in zwei Formen, Apfel, Eis, Kerze, Ei, Kokosnuss – mit „Warum?“
   - Hilfe-Leiter bei „Woraus?“ / „Warum?“ (ctx.choices): 1. Erklärung, die
     die falsche Idee mit der Beobachtung widerlegt, 2. Strategie-Tipp
     („Woraus ist es gemacht?“, ein Ablenker verschwindet), 3. Flo macht es
     vor. Vermutungen sind einmalig (Hypothese); ein falsch vermutetes Ding
     kommt in der Runde noch einmal, dann mit Tipp („Denk an das Material“,
     auf Stufe 5 ein Tipp zum Rätsel) – höchstens einmal pro Runde, damit sich
     zwei Dinge nicht endlos abwechseln (pool() filtert sie aus).
   - Lern-Items: Dingnamen („Korken“, „Murmel“), Paare („Baumstamm und Nagel“),
     Profi-Rätsel („Schiff aus Metall“, „Knete: Schiffchen“).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const cap = (s) => U.cap(s);
  const proc = (ctx, normal, process) => (ctx.wrongCount === 0 && U.chance(0.3) ? process : normal);
  const vary = (key, list) => U.pickFresh('sws-' + key, list, 1);
  /* Ein Ding, das in dieser Runde schon zweimal falsch vermutet wurde, kommt in
     der Runde nicht noch einmal (sonst pendeln zwei Dinge hin und her). */
  let wrongCount = new Map();
  const noteResult = (key, ok) => { if (!ok) wrongCount.set(key, (wrongCount.get(key) || 0) + 1); };
  const pool = (list, keyFn) => {
    const rest = list.filter((x) => (wrongCount.get(keyFn(x)) || 0) < 2);
    return rest.length >= 2 ? rest : list;
  };
  const trackPred = (ctx, key, ok) => { ctx.track(key, ok); noteResult(key, ok); };
  const hintAfterFor = (ctx, n, nWrong) => {
    const visible = ctx.flow < 0 && n >= 4 && nWrong >= 2 ? n - 1 : n;
    return visible <= 3 ? 1 : 2;
  };

  /* ======================================================================
     Bilder (SVG, viewBox 0 0 100 100) für Dinge ohne passendes Emoji
     ====================================================================== */
  const ART = {
    korken: `<g transform="rotate(-12 50 55)"><path d="M32 22 L68 22 L63 90 L37 90 Z" fill="#d9a066" stroke="#9c6a36" stroke-width="3"/>
      <ellipse cx="50" cy="22" rx="18" ry="6" fill="#e9bb82" stroke="#9c6a36" stroke-width="3"/>
      <g fill="#a8743e"><circle cx="43" cy="40" r="2.4"/><circle cx="56" cy="48" r="2"/><circle cx="46" cy="62" r="2.6"/><circle cx="57" cy="72" r="2.2"/><circle cx="44" cy="80" r="1.8"/></g></g>`,
    nagel: `<g transform="rotate(20 50 55)"><rect x="46" y="18" width="8" height="66" fill="#a2abba" stroke="#6f7887" stroke-width="2"/>
      <polygon points="46,84 54,84 50,98" fill="#a2abba" stroke="#6f7887" stroke-width="2"/>
      <rect x="33" y="10" width="34" height="10" rx="3" fill="#8a93a3" stroke="#6f7887" stroke-width="2"/></g>`,
    murmel: `<circle cx="50" cy="56" r="38" fill="#a9ddff" fill-opacity=".8" stroke="#4f9fcf" stroke-width="3"/>
      <path d="M26 62 Q38 36 52 56 T76 50" stroke="#ff6b6b" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="38" r="8" fill="#fff" opacity=".85"/>`,
    ente: `<ellipse cx="46" cy="70" rx="38" ry="22" fill="#ffd23f" stroke="#e0a800" stroke-width="3"/>
      <circle cx="66" cy="38" r="19" fill="#ffd23f" stroke="#e0a800" stroke-width="3"/>
      <path d="M82 40 Q96 42 84 50 Q80 47 82 40 Z" fill="#ff8a3d" stroke="#d96a1f" stroke-width="2"/>
      <circle cx="70" cy="33" r="3.4" fill="#2b2d42"/>
      <path d="M26 66 Q40 56 54 70" stroke="#e0a800" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    holzloeffel: `<g transform="rotate(35 50 50)"><ellipse cx="50" cy="24" rx="16" ry="21" fill="#c98b4f" stroke="#8a5a2b" stroke-width="3"/>
      <rect x="45" y="42" width="10" height="56" rx="5" fill="#c98b4f" stroke="#8a5a2b" stroke-width="3"/>
      <path d="M44 16 Q50 26 46 34" stroke="#8a5a2b" stroke-width="2" fill="none"/></g>`,
    lineal: `<g transform="rotate(-25 50 50)"><rect x="4" y="38" width="92" height="24" rx="3" fill="#e5b87a" stroke="#a8743e" stroke-width="3"/>
      <g stroke="#7d5428" stroke-width="2.4">${[14, 24, 34, 44, 54, 64, 74, 84].map((x, i) => `<line x1="${x}" y1="38" x2="${x}" y2="${i % 2 ? 46 : 51}"/>`).join('')}</g></g>`,
    perle: `<circle cx="50" cy="56" r="34" fill="#b9773b" stroke="#7d4c22" stroke-width="3"/>
      <path d="M24 46 Q50 36 76 46 M22 62 Q50 72 78 62" stroke="#8a5a2b" stroke-width="2.4" fill="none"/>
      <circle cx="50" cy="56" r="9" fill="#5a3415"/>`,
    schaufel: `<g transform="rotate(-30 50 50)"><path d="M34 46 L66 46 L62 90 Q50 98 38 90 Z" fill="#3ddc97" stroke="#1f9e64" stroke-width="3"/>
      <rect x="45" y="6" width="10" height="42" rx="4" fill="#3ddc97" stroke="#1f9e64" stroke-width="3"/>
      <rect x="38" y="4" width="24" height="9" rx="4" fill="#28c584" stroke="#1f9e64" stroke-width="3"/></g>`,
    deckel: `<rect x="20" y="40" width="60" height="40" rx="7" fill="#3d8bfd" stroke="#2457b0" stroke-width="3"/>
      <g stroke="#2457b0" stroke-width="3">${[30, 40, 50, 60, 70].map((x) => `<line x1="${x}" y1="46" x2="${x}" y2="74"/>`).join('')}</g>
      <rect x="16" y="32" width="68" height="12" rx="5" fill="#5aa0ff" stroke="#2457b0" stroke-width="3"/>`,
    kiste: `<rect x="8" y="20" width="84" height="74" rx="4" fill="#d39a5c" stroke="#8a5a2b" stroke-width="4"/>
      <path d="M8 44 H92 M8 70 H92" stroke="#8a5a2b" stroke-width="4"/><path d="M12 24 L88 90" stroke="#b07a40" stroke-width="6"/>`,
    brett: `<g transform="rotate(-8 50 55)"><rect x="0" y="34" width="100" height="36" rx="5" fill="#d39a5c" stroke="#8a5a2b" stroke-width="3"/>
      <path d="M5 44 Q30 39 52 46 T96 42 M5 58 Q34 53 56 60 T96 56" stroke="#8a5a2b" stroke-width="2.6" fill="none"/>
      <ellipse cx="70" cy="51" rx="6" ry="3.5" fill="#8a5a2b"/></g>`,
    knetekugel: `<circle cx="50" cy="60" r="32" fill="#a66cff" stroke="#7b45d6" stroke-width="3"/>
      <path d="M34 54 Q46 46 58 54 M38 66 Q50 58 62 66" stroke="#8a55e6" stroke-width="2.4" fill="none"/>`,
    kneteschiff: `<path d="M6 52 Q50 58 94 52 Q88 88 50 88 Q12 88 6 52 Z" fill="#a66cff" stroke="#7b45d6" stroke-width="3"/>
      <path d="M12 54 Q50 66 88 54" fill="#6a3bc2" opacity=".45"/>`,
    schuessel: `<defs><linearGradient id="sws-gb" x1="0" x2="1"><stop offset="0" stop-color="#8d96a5"/><stop offset=".45" stop-color="#e4e8ef"/><stop offset="1" stop-color="#8d96a5"/></linearGradient></defs>
      <path d="M4 46 Q50 52 96 46 Q90 90 50 90 Q10 90 4 46 Z" fill="url(#sws-gb)" stroke="#6f7887" stroke-width="3"/>
      <ellipse cx="50" cy="47" rx="46" ry="7" fill="#c3c9d3" stroke="#6f7887" stroke-width="3"/>`,
  };

  /* Material-Muster für „Woraus ist es?“ (keine Gegenstände, damit nichts verraten wird) */
  const SWATCH = {
    holz: `<rect x="6" y="6" width="88" height="88" rx="16" fill="#c98b4f"/>
      <path d="M6 28 Q30 20 50 30 T94 26 M6 54 Q34 46 54 56 T94 52 M6 78 Q28 70 50 80 T94 76" stroke="#8a5a2b" stroke-width="4" fill="none"/>`,
    kork: `<rect x="6" y="6" width="88" height="88" rx="16" fill="#dcaa70"/>
      <g fill="#a8743e">${[[20, 22], [40, 18], [66, 24], [82, 16], [28, 44], [54, 40], [78, 48], [16, 66], [42, 62], [64, 70], [84, 78], [30, 84], [56, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2"/>`).join('')}</g>`,
    plastik: `<rect x="6" y="6" width="88" height="88" rx="22" fill="#ff5fa2"/>
      <ellipse cx="36" cy="28" rx="20" ry="9" fill="#fff" opacity=".55"/><circle cx="72" cy="70" r="12" fill="#ffd23f"/><circle cx="34" cy="70" r="10" fill="#3d8bfd"/>`,
    metall: `<defs><linearGradient id="sws-gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d8696"/><stop offset=".45" stop-color="#eef1f6"/><stop offset=".55" stop-color="#c9ced8"/><stop offset="1" stop-color="#6f7887"/></linearGradient></defs>
      <rect x="6" y="6" width="88" height="88" rx="16" fill="url(#sws-gm)" stroke="#6f7887" stroke-width="3"/><path d="M20 80 L80 20" stroke="#fff" stroke-width="5" opacity=".6"/>`,
    stein: `<rect x="6" y="6" width="88" height="88" rx="16" fill="#9aa0a6"/>
      <g fill="#6d737a">${[[24, 26, 7], [62, 20, 5], [76, 50, 8], [36, 58, 6], [58, 78, 7], [20, 80, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
      <g fill="#c4c8cd"><circle cx="46" cy="36" r="4"/><circle cx="80" cy="80" r="3"/></g>`,
    glas: `<rect x="6" y="6" width="88" height="88" rx="16" fill="#d6f1ff" stroke="#6fbbe6" stroke-width="4"/>
      <path d="M22 70 L46 22 M38 78 L62 30" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  };

  /* Mini-Symbole für die Vermutung: Ball an der Oberfläche / am Boden */
  const ICON = {
    float: `<rect x="6" y="26" width="48" height="30" rx="7" fill="#5bb8f5"/>
      <path d="M6 30 Q12 26 18 30 T30 30 T42 30 T54 30" stroke="#fff" stroke-width="3" fill="none"/>
      <circle cx="30" cy="24" r="10" fill="#ff9f43" stroke="#d9771c" stroke-width="2.5"/>
`,
    sink: `<rect x="6" y="20" width="48" height="36" rx="7" fill="#5bb8f5"/>
      <path d="M6 24 Q12 20 18 24 T30 24 T42 24 T54 24" stroke="#fff" stroke-width="3" fill="none"/>
      <circle cx="30" cy="45" r="9" fill="#7d8696" stroke="#4f5766" stroke-width="2.5"/>
      <path d="M30 6 V22 M24 16 L30 22 L36 16" stroke="#2b2d42" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  };

  const svg = (vb, inner, cls) => {
    const d = document.createElement('div');
    d.innerHTML = `<svg viewBox="${vb}" class="${cls || ''}" aria-hidden="true" focusable="false">${inner}</svg>`;
    return d.firstChild;
  };
  /** Bild eines Dings: SVG oder Emoji, füllt seinen Container. */
  function art(o) {
    if (o.art) return svg('0 0 100 100', ART[o.art], 'sws-art');
    return el('span.sws-emo', { 'aria-hidden': 'true' }, o.e);
  }
  const look = (o) => o.e || o.art;
  const icon = (kind, cls) => svg('0 0 60 60', ICON[kind], 'sws-icon ' + (cls || ''));

  /* ======================================================================
     Materialien und Dinge
     ====================================================================== */
  const MAT = {
    holz: { n: 'Holz', fl: true, rule: 'Holz schwimmt.', hint: 'Tipp: Das Material kommt von einem Baum. Man kann es sägen.' },
    kork: { n: 'Kork', fl: true, rule: 'Kork schwimmt.', hint: 'Tipp: Das Material ist weich und kommt von der Rinde eines Baumes.' },
    plastik: { n: 'Plastik', fl: true, rule: 'Viele Dinge aus Plastik schwimmen.', hint: 'Tipp: Das Material ist glatt und oft bunt, wie viele Spielsachen.' },
    metall: { n: 'Metall', fl: false, rule: 'Metall sinkt.', hint: 'Tipp: Das Material ist hart, fühlt sich kalt an und glänzt.' },
    stein: { n: 'Stein', fl: false, rule: 'Stein sinkt.', hint: 'Tipp: Das Material ist hart und grau. Es liegt draußen auf dem Weg.' },
    glas: { n: 'Glas', fl: false, rule: 'Glas sinkt.', hint: 'Tipp: Das Material ist hart, und man kann hindurchschauen.' },
  };
  const MAT_IDS = Object.keys(MAT);

  const G = { m: ['der', 'er', 'Er'], f: ['die', 'sie', 'Sie'], n: ['das', 'es', 'Es'] };
  const der = (o) => G[o.g][0] + ' ' + (o.sp || o.k);
  const Der = (o) => cap(der(o));
  const er = (o) => G[o.g][1];
  const Er = (o) => G[o.g][2];
  const verb = (fl) => (fl ? 'schwimmt' : 'sinkt');
  const merk = (o) => o.merk || `${Der(o)} ist aus ${MAT[o.mat].n}. ${MAT[o.mat].rule}`;
  const SUMMARY = 'Dinge aus Holz und Kork schwimmen meistens, viele aus Plastik auch. Volle Dinge aus Metall, Stein oder Glas sinken.';
  const question = (o) => `Schwimmt ${der(o)} oder sinkt ${er(o)}?`;

  // Stufe 1: klare Alltagsdinge
  const L1 = [
    { k: 'Holzklotz', g: 'm', mat: 'holz', e: '🪵' },
    { k: 'Korken', g: 'm', mat: 'kork', art: 'korken' },
    { k: 'Badeente', g: 'f', mat: 'plastik', art: 'ente', merk: 'Die Badeente ist aus Plastik und innen voller Luft. Darum schwimmt sie.' },
    { k: 'Eimer', g: 'm', mat: 'plastik', e: '🪣' },
    { k: 'Bleistift', g: 'm', mat: 'holz', e: '✏️' },
    { k: 'Stein', g: 'm', mat: 'stein', e: '🪨' },
    { k: 'Schlüssel', g: 'm', mat: 'metall', e: '🔑' },
    { k: 'Löffel', g: 'm', mat: 'metall', e: '🥄' },
    { k: 'Münze', g: 'f', mat: 'metall', e: '🪙' },
    { k: 'Schraube', g: 'f', mat: 'metall', e: '🔩' },
  ];
  // Stufe 2: neue Dinge, gleiche Form – anderes Material (Holzlöffel ↔ Löffel)
  const L2 = [
    { k: 'Holzlöffel', g: 'm', mat: 'holz', art: 'holzloeffel' },
    { k: 'Lineal', g: 'n', mat: 'holz', art: 'lineal' },
    { k: 'Holzperle', g: 'f', mat: 'holz', art: 'perle' },
    { k: 'Sandschaufel', g: 'f', mat: 'plastik', art: 'schaufel' },
    { k: 'Flaschendeckel', g: 'm', mat: 'plastik', art: 'deckel' },
    { k: 'Gabel', g: 'f', mat: 'metall', e: '🍴' },
    { k: 'Schere', g: 'f', mat: 'metall', e: '✂️' },
    { k: 'Büroklammer', g: 'f', mat: 'metall', e: '📎' },
    { k: 'Ring', g: 'm', mat: 'metall', e: '💍' },
    { k: 'Murmel', g: 'f', mat: 'glas', art: 'murmel' },
    { k: 'Kieselstein', g: 'm', mat: 'stein', e: '🪨' },
    { k: 'Glocke', g: 'f', mat: 'metall', e: '🔔' },
  ];
  [...L1, ...L2].forEach((o) => { o.fl = MAT[o.mat].fl; });
  const SORT = [...L1, ...L2];

  // Stufe 3: Größen-Falle (big = großes Ding, small = kleines Ding)
  const mk = (k, g, mat, look, s, ein, big) => Object.assign({ k, g, mat, fl: MAT[mat].fl, s, ein, big }, look);
  // Nur VOLLE Dinge (nichts Hohles mit Luft darin): hier soll das Material der Grund sein.
  const PAIRS = [
    { k: 'Baumstamm und Nagel', a: mk('Baumstamm', 'm', 'holz', { e: '🪵' }, 1.6, 'ein riesiger Baumstamm', true),
      b: mk('Nagel', 'm', 'metall', { art: 'nagel', form: { t: 'Er ist spitz.', ex: 'Ein Bleistift aus Holz ist auch spitz. Der schwimmt. Spitz ist nicht der Grund.' } }, 0.5, 'ein kleiner Nagel', false) },
    { k: 'Holzkiste und Schlüssel', a: mk('Holzkiste', 'f', 'holz', { art: 'kiste' }, 1.45, 'eine große Holzkiste', true),
      b: mk('Schlüssel', 'm', 'metall', { e: '🔑', form: { t: 'Er hat ein Loch.', ex: 'Eine Holzperle hat auch ein Loch. Die schwimmt. Das Loch ist nicht der Grund.' } }, 0.55, 'ein kleiner Schlüssel', false) },
    { k: 'Holzbrett und Murmel', a: mk('Holzbrett', 'n', 'holz', { art: 'brett', alt: { t: 'Es ist lang.', ex: 'Ein langer Löffel aus Metall sinkt doch. Lang ist nicht der Grund.' } }, 1.6, 'ein großes Holzbrett', true),
      b: mk('Murmel', 'f', 'glas', { art: 'murmel', form: { t: 'Sie ist rund.', ex: 'Eine Holzperle ist auch rund. Die schwimmt. Rund ist nicht der Grund.' } }, 0.45, 'eine kleine Murmel', false) },
    { k: 'Eimer und Münze', a: mk('Eimer', 'm', 'plastik', { e: '🪣', alt: { t: 'Er ist rot.', ex: 'Die Farbe ist nicht der Grund. Ein roter Stein würde trotzdem sinken.' } }, 1.45, 'ein großer Eimer aus Plastik', true),
      b: mk('Münze', 'f', 'metall', { e: '🪙', form: { t: 'Sie ist flach.', ex: 'Ein Lineal aus Holz ist auch flach. Das schwimmt. Flach ist nicht der Grund.' } }, 0.5, 'eine kleine Münze', false) },
    { k: 'Großer Stein und Korken', a: mk('Stein', 'm', 'stein', { e: '🪨' }, 1.45, 'ein großer Stein', true),
      b: mk('Korken', 'm', 'kork', { art: 'korken' }, 0.5, 'ein kleiner Korken', false) },
  ];

  // Stufe 5: Profi-Rätsel
  const PROFI = [
    { k: 'Schiff aus Metall', type: 'why', o: { k: 'Schiff', g: 'n', mat: 'metall', fl: true, e: '🚢', s: 1.2 },
      ask: 'Das Schiff ist aus Metall. Schwimmt es oder sinkt es?',
      whyQ: 'Metall sinkt doch! Warum schwimmt das Schiff?',
      reasons: [
        { t: 'Es ist innen hohl. Darin ist viel Luft.', ok: true },
        { t: 'Metall schwimmt immer.', ex: 'Denk an den Schlüssel. Der ist aus Metall und sinkt.' },
        { t: 'Es ist ganz groß.', ex: 'Ein großer Stein ist auch groß. Trotzdem sinkt er.' },
      ],
      hint: 'Tipp: Was ist im Schiff drin, wo keine Leute sind?',
      tip: 'Tipp: Ein Schiff ist innen hohl. Darin ist viel Luft.',
      model: 'Das Schiff ist innen hohl. Darin ist viel Luft. Die Luft hilft beim Schwimmen. Tipp auf diese Karte.',
      after: 'Genau! Ein Schiff ist wie eine große Schüssel voller Luft. Darum kann es schwimmen, obwohl es aus Metall ist.' },
    { k: 'Schüssel aus Metall', type: 'why', o: { k: 'Schüssel', g: 'f', mat: 'metall', fl: true, art: 'schuessel', s: 1.15 },
      ask: 'Die Schüssel ist aus Metall. Schwimmt sie oder sinkt sie?',
      whyQ: 'Warum schwimmt die Schüssel aus Metall?',
      reasons: [
        { t: 'Sie ist hohl wie ein Boot. Darin ist Luft.', ok: true },
        { t: 'Sie ist aus Holz.', ex: 'Schau genau hin: Die Schüssel glänzt. Sie ist aus Metall.' },
        { t: 'Sie ist rund.', ex: 'Eine runde Murmel sinkt. Rund ist nicht der Grund.' },
      ],
      hint: 'Tipp: Schau, wie die Schüssel geformt ist. Was ist darin?',
      tip: 'Tipp: Die Schüssel ist hohl wie ein Boot. Darin ist Luft.',
      model: 'Die Schüssel ist hohl wie ein Boot. Darin ist Luft. Tipp auf diese Karte.',
      after: 'Prima! Die Schüssel ist wie ein kleines Boot. Wenn Wasser hineinläuft, sinkt sie aber.' },
    { k: 'Knete: Schiffchen', type: 'knete',
      objs: [
        { k: 'Kugel', g: 'f', mat: 'knete', fl: false, art: 'knetekugel', sp: 'Kugel aus Knete' },
        { k: 'Schiffchen', g: 'n', mat: 'knete', fl: true, art: 'kneteschiff', sp: 'Schiffchen aus Knete' },
      ],
      ask: 'Beide sind aus gleich viel Knete. Was glaubst du: Was schwimmt?',
      whyQ: 'Warum schwimmt das Schiffchen, aber die Kugel sinkt?',
      reasons: [
        { t: 'Die Form: Im Schiffchen ist Platz für Luft.', ok: true },
        { t: 'Das Schiffchen ist leichter.', ex: 'Beide sind aus gleich viel Knete. Sie sind genau gleich schwer.' },
        { t: 'Es ist eine andere Knete.', ex: 'Schau mal: Es ist dieselbe Knete. Nur die Form ist anders.' },
      ],
      hint: 'Tipp: Was ist bei den beiden anders? Schau auf die Form.',
      tip: 'Tipp: Im Schiffchen ist Platz für Luft.',
      model: 'Es liegt an der Form. Im Schiffchen ist Platz für Luft. Tipp auf diese Karte.',
      after: 'Super! Gleiche Knete, andere Form. Mit Luft darin schwimmt sie, wie ein Schiff.' },
    { k: 'Apfel', type: 'single', o: { k: 'Apfel', g: 'm', fl: true, e: '🍎' }, tip: 'Tipp: Im Apfel ist viel Luft versteckt.',
      after: 'Im Apfel ist viel Luft versteckt. Darum schwimmt er. Man kann Äpfel aus dem Wasser fischen!' },
    { k: 'Eiswürfel', type: 'single', o: { k: 'Eiswürfel', g: 'm', fl: true, e: '🧊' }, tip: 'Tipp: Denk an die riesigen Eisberge im Meer.',
      after: 'Eis schwimmt immer oben. Darum schwimmen sogar riesige Eisberge im Meer.' },
    { k: 'Kerze', type: 'single', o: { k: 'Kerze', g: 'f', fl: true, e: '🕯️' }, tip: 'Tipp: Die Kerze ist aus Wachs. Denk an Teelichter in einer Schale mit Wasser.',
      after: 'Die Kerze ist aus Wachs. Wachs schwimmt, auch wenn die Kerze groß ist.' },
    { k: 'Ei', type: 'single', o: { k: 'Ei', g: 'n', fl: false, e: '🥚', sp: 'rohe Ei' }, tip: 'Tipp: Ein frisches Ei ist ganz voll. Darin ist kaum Luft.',
      after: 'Ein frisches Ei sinkt nach unten. Es ist ganz voll, da ist kaum Luft drin.' },
    { k: 'Kokosnuss', type: 'single', o: { k: 'Kokosnuss', g: 'f', fl: true, e: '🥥' }, tip: 'Tipp: Kokosnüsse reisen über das Meer bis zu neuen Inseln.',
      after: 'Kokosnüsse schwimmen sogar über das Meer bis zu einer neuen Insel.' },
  ];

  const INTRO = {
    1: 'Wir forschen am Wasserbecken. Zuerst vermutest du: Schwimmt es oder sinkt es? Dann probieren wir es aus.',
    2: 'Jetzt bist du Material Detektiv. Nach dem Versuch fragen wir: Woraus ist es gemacht?',
    3: 'Jetzt füllen wir eine Forschertabelle. Du vermutest für alle Dinge. Dann testen wir alle auf einmal.',
    4: 'Achtung, Größenfalle! Ein großes Ding und ein kleines Ding. Lass dich nicht täuschen!',
    5: 'Jetzt kommen Profirätsel. Manchmal steckt ein Trick dahinter. Denk gut nach!',
  };
  const KIND = { 1: 'single', 2: 'single', 3: 'sort', 4: 'pair', 5: 'profi' };
  let introduced = new Set();

  const OK_PRED = ['Richtig vermutet!', 'Gut vermutet!', 'Stimmt genau!', 'Super vermutet!'];
  const PROC_PRED = [
    'Du hast an das Material gedacht. Sehr schlau!',
    'Du hast genau überlegt, woraus es ist. Prima geforscht!',
    'Du hast erst nachgedacht und dann getippt. So machen es echte Forscher!',
  ];
  const PROC_PROFI_WHY = [
    'Du hast an die Luft im Inneren gedacht. Sehr schlau!',
    'Du hast dich vom Metall nicht täuschen lassen. Wie ein echter Profi!',
  ];
  const PROC_PROFI = [
    'Du hast gut überlegt und dich nicht täuschen lassen. Prima!',
    'Du hast erst nachgedacht und dann getippt. So machen es echte Forscher!',
  ];
  const OOPS = ['Oh, schau mal!', 'Oh, spannend!', 'Hoppla, schau mal!'];
  const LEARN = ['Beim Forschen lernt man aus jedem Versuch.', 'Genau dafür machen Forscher Versuche.', 'Jetzt weißt du es!'];

  /* ======================================================================
     Bühne: Frage-Karte, Wasserbecken, Bedienung
     ====================================================================== */
  function buildScene(ctx, objs) {
    const wrap = el('div.sws-wrap');
    const card = el('div.prompt-box.sws-card');
    const tank = el('div.sws-tank');
    const nodes = objs.map((o, i) => {
      const n = el('div.sws-obj', { style: { left: ((i + 1) * 100) / (objs.length + 1) + '%', '--sc': String(o.s || 1) } }, art(o));
      tank.appendChild(n);
      return n;
    });
    tank.appendChild(el('div.sws-water'));
    const ctrl = el('div.sws-ctrl');
    wrap.append(card, tank, ctrl);
    ctx.stage.appendChild(wrap);
    if (objs.length >= 4) tank.classList.add('sws-many');
    return { wrap, card, tank, nodes, ctrl };
  }

  function setCard(card, text, extra) {
    card.innerHTML = '';
    if (extra) card.appendChild(extra);
    card.appendChild(el('span.sws-qtext', text));
  }

  /** Lässt die Dinge ins Wasser; resolves nach der Animation. */
  async function drop(ctx, scene, objs, which) {
    const idx = which || objs.map((_, i) => i);
    ctx.sfx.play('whoosh');
    idx.forEach((i, k) => {
      ctx.timeout(() => {
        const n = scene.nodes[i];
        const o = objs[i];
        n.classList.add(o.fl ? 'sws-float' : 'sws-sink');
        const left = n.style.left;
        const sp = el('div.sws-splash', { style: { left } });
        scene.tank.appendChild(sp);
        ctx.sfx.play('pop');
        if (!o.fl) {
          for (let b = 0; b < 4; b++) {
            scene.tank.appendChild(el('span.sws-bub', { style: { left: `calc(${left} + ${U.randInt(-18, 18)}px)`, animationDelay: (0.5 + b * 0.25) + 's' } }));
          }
        }
      }, k * 220);
    });
    await ctx.sleep(2100 + idx.length * 220);
  }

  /** Zwei Vermutungs-Knöpfe. Liefert { btn:{float,sink}, wait() } */
  function predictButtons(ctx, ctrl) {
    let resolver = null;
    const mkBtn = (kind, label) => {
      const content = el('span.sws-pb', icon(kind), el('span.sws-pb-t', label));
      const t = LT.ui.tile(content, { className: 'sws-pbtn sws-pbtn-' + kind, aria: label });
      t.addEventListener('click', () => {
        if (!resolver) return;
        const r = resolver;
        resolver = null;
        ctx.sfx.play('tap');
        r(kind);
      });
      ctrl.appendChild(t);
      return t;
    };
    const btn = { float: mkBtn('float', 'schwimmt'), sink: mkBtn('sink', 'sinkt') };
    return {
      btn,
      wait(correctKind) {
        ctx.markTest(btn.float, correctKind === 'float');
        ctx.markTest(btn.sink, correctKind === 'sink');
        ctrl.classList.remove('sws-locked');
        return new Promise((res) => { resolver = (k) => { ctrl.classList.add('sws-locked'); ctx.markTest(btn.float, false); ctx.markTest(btn.sink, false); res(k); }; });
      },
    };
  }

  /** Einmalige Auswahl eines Dings (Größenfalle, Knete). */
  function chooseObject(ctx, ctrl, objs, correctIdx) {
    return new Promise((res) => {
      let done = false;
      const tiles = objs.map((o, i) => {
        const t = LT.ui.tile(el('span.sws-ot', el('span.sws-ot-pic', art(o)), el('span.sws-ot-t', o.k)), { className: 'sws-otile', aria: o.k });
        if (i === correctIdx) ctx.markTest(t);
        t.addEventListener('click', () => {
          if (done) return;
          done = true;
          ctrl.classList.add('sws-locked');
          tiles.forEach((x) => ctx.markTest(x, false));
          ctx.sfx.play('tap');
          t.classList.add('sws-chosen');
          res({ i, tile: t });
        });
        ctrl.appendChild(t);
        return t;
      });
    });
  }

  /** Text-Antworten für „Warum?“ mit Hilfe-Leiter. */
  async function askWhy(ctx, scene, qText, reasons, o) {
    scene.ctrl.innerHTML = '';
    scene.ctrl.classList.remove('sws-locked');
    scene.ctrl.classList.add('sws-why');
    setCard(scene.card, qText, el('span.sws-qtag', 'Warum?'));
    await ctx.instruct(qText);
    if (!ctx.active) return;
    const items = reasons.map((r) => ({ content: r.t, text: true, correct: !!r.ok, say: r.t, r, className: 'sws-rtile' }));
    await ctx.choices(items, {
      container: scene.ctrl, sayButton: true, praise: false,
      hintAfter: hintAfterFor(ctx, items.length, items.length - 1),
      correctSay: () => proc(ctx, vary('whyok', ['Richtig!', 'Genau!', 'Stimmt!']), 'Du hast den Grund gefunden. Wie ein echter Forscher!'),
      explain: (w) => 'Fast! ' + (w.r.ex || ''),
      hintSay: () => o.hint,
      modelSay: () => o.model,
    });
  }

  /* ---------- Reaktion auf eine Vermutung ---------- */
  async function judge(ctx, node, ok, o, extra, procList) {
    const res = o.fl ? `${Der(o)} schwimmt.` : `${Der(o)} sinkt nach unten.`;
    if (ok) {
      const pl = procList || PROC_PRED;
      const say = proc(ctx, vary('okp', OK_PRED) + ' ' + res, vary('okp', OK_PRED) + ' ' + vary(pl === PROC_PRED ? 'procp' : pl === PROC_PROFI_WHY ? 'procpw' : 'procps', pl)) + (extra ? ' ' + extra : '');
      await ctx.correct(node, { say, praise: false });
    } else {
      await ctx.wrong(node, { say: '', keep: true });
      if (!ctx.active) return;
      await ctx.say(`${vary('oops', OOPS)} ${res} ${vary('learn', LEARN)}` + (extra ? ' ' + extra : ''));
    }
  }

  /* ======================================================================
     Stufe 1 und 2: ein Ding vermuten (Stufe 2 zusätzlich „Woraus?“)
     ====================================================================== */
  async function taskSingle(ctx, level) {
    const o = ctx.item(pool(level === 1 ? L1 : L2, (x) => x.k), (x) => x.k, { avoid: 4 });
    const scene = buildScene(ctx, [o]);
    const scaffold = ctx.isReview || ctx.flow < 0;
    const chip = level === 1 && scaffold ? el('span.sws-chip', 'aus ' + MAT[o.mat].n) : null;
    setCard(scene.card, question(o), el('span.sws-cardpic', art(o)));
    if (chip) scene.card.appendChild(chip);
    const pb = predictButtons(ctx, scene.ctrl);
    const p = pb.wait(o.fl ? 'float' : 'sink');
    if (ctx.isReview) {
      await ctx.instruct(`Tipp: Denk zuerst an das Material. Woraus ist ${der(o)}? ${question(o)}`);
    } else {
      await ctx.instruct(question(o));
    }
    if (!ctx.active) return;
    const kind = await p;
    if (!ctx.active) return;
    const node = pb.btn[kind];
    node.classList.add('sws-chosen');
    await drop(ctx, scene, [o]);
    if (!ctx.active) return;
    const ok = (kind === 'float') === o.fl;
    trackPred(ctx, o.k, ok);
    await judge(ctx, node, ok, o, level === 1 ? merk(o) : '');
    if (!ctx.active) return;

    if (level === 2) {
      // Woraus ist es? Material-Muster wählen
      scene.ctrl.innerHTML = '';
      scene.ctrl.classList.remove('sws-locked');
      scene.ctrl.classList.add('sws-mats');
      const opp = U.pick(MAT_IDS.filter((m) => MAT[m].fl !== o.fl));
      let n = 3 + (ctx.flow > 0 ? 1 : 0) - (ctx.flow < 0 ? 1 : 0);
      const rest = U.shuffle(MAT_IDS.filter((m) => m !== o.mat && m !== opp));
      const mats = [o.mat, opp, ...rest].slice(0, n);
      const q = `Woraus ist ${der(o)}?`;
      setCard(scene.card, q, el('span.sws-cardpic', art(o)));
      await ctx.instruct(q);
      if (!ctx.active) return;
      const M = MAT[o.mat].n;
      const items = mats.map((m) => ({
        content: el('span.sws-mt', svg('0 0 100 100', SWATCH[m], 'sws-sw'), el('span.sws-mt-t', MAT[m].n)),
        correct: m === o.mat, say: MAT[m].n, m, className: 'sws-mtile',
      }));
      await ctx.choices(items, {
        container: scene.ctrl, sayButton: true, praise: false,
        hintAfter: hintAfterFor(ctx, items.length, items.length - 1),
        correctSay: () => proc(ctx, `${vary('mok', ['Richtig!', 'Genau!', 'Stimmt!'])} ${merk(o)}`,
          `Richtig! Du hast genau hingeschaut. ${merk(o)}`),
        explain: (w) => (MAT[w.m].fl !== o.fl
          ? `${MAT[w.m].rule} ${Der(o)} ist aber ${o.fl ? 'oben geschwommen' : 'untergegangen'}.`
          : `Fast! ${MAT[w.m].n} ${verb(MAT[w.m].fl)} ${MAT[w.m].fl ? 'meistens ' : ''}auch. Aber schau noch mal genau hin: Woraus ist ${der(o)}?`),
        hintSay: () => MAT[o.mat].hint,
        modelSay: () => `Schau: ${merk(o)} Tipp auf ${M}.`,
      });
    }
    if (!ctx.active) return;
    await ctx.sleep(450);
  }

  /* ======================================================================
     Stufe 3: Größenfalle
     ====================================================================== */
  function reasonsFor(o) {
    const M = MAT[o.mat].n;
    if (!o.big && !o.fl) {
      // kleines Ding sinkt: Ablenker sind die echten Fehlideen „schwer → sinkt“ und die Form
      return [
        { t: `${Er(o)} ist aus ${M}.`, ok: true },
        { t: `${Er(o)} ist schwer.`, kind: 'heavy' },
        o.form ? { t: o.form.t, kind: 'form' } : { t: `${Er(o)} ist klein.`, kind: 'size' },
      ];
    }
    return [
      { t: `${Er(o)} ist aus ${M}.`, ok: true },
      { t: `${Er(o)} ist ${o.big ? 'groß' : 'klein'}.`, kind: 'size' },
      o.alt ? { t: o.alt.t, kind: 'alt' } : { t: `${Er(o)} ist ${o.big ? 'schwer' : 'leicht'}.`, kind: 'weight' },
    ];
  }
  function explainReason(o, kind, other) {
    const v = verb(o.fl);
    if (kind === 'alt') return o.alt.ex;
    if (kind === 'form') return o.form.ex;
    if (kind === 'heavy') {
      return `${Der(o)} ist ganz leicht${other && other.big ? `, viel leichter als ${der(other)}` : ''}. Trotzdem ${v} ${er(o)}. Am Gewicht liegt es nicht.`;
    }
    if (kind === 'size') {
      if (o.big && o.fl) return `${Der(o)} ist groß. Trotzdem ${v} ${er(o)}. Groß ist nicht der Grund.`;
      if (!o.big && !o.fl) return `${Der(o)} ist klein. Aber ein kleiner Korken schwimmt doch. An der Größe liegt es nicht.`;
      if (o.big) return 'Schau mal: Auch ein ganz kleiner Kieselstein sinkt. An der Größe liegt es nicht.';
      return 'Schau mal: Ein riesiger Baumstamm schwimmt auch. An der Größe liegt es nicht.';
    }
    if (o.big && o.fl) return `${Der(o)} ist schwer. Trotzdem ${v} ${er(o)}. Am Gewicht allein liegt es nicht.`;
    if (!o.big && !o.fl) return `${Der(o)} ist ganz leicht. Trotzdem ${v} ${er(o)}. Am Gewicht allein liegt es nicht.`;
    if (o.big) return 'Auch ein ganz leichter, kleiner Stein sinkt. Am Gewicht allein liegt es nicht.';
    return 'Ein schwerer Baumstamm schwimmt auch. Am Gewicht allein liegt es nicht.';
  }

  async function taskPair(ctx) {
    const pair = ctx.item(pool(PAIRS, (x) => x.k), (x) => x.k, { avoid: 2 });
    const counter = pair.a.fl !== pair.b.fl && pair.a.fl; // großes Ding schwimmt, kleines sinkt
    const askFloat = U.chance(0.5);
    const target = askFloat ? (pair.a.fl ? pair.a : pair.b) : (pair.a.fl ? pair.b : pair.a);
    let objs = U.shuffle([pair.a, pair.b]);
    if (ctx.flow > 0) {
      // Knobel: ein drittes Ding, das sich wie das Nicht-Ziel verhält
      const other = target === pair.a ? pair.b : pair.a;
      const extra = U.pick(SORT.filter((x) => x.fl === other.fl && x.k !== pair.a.k && x.k !== pair.b.k && look(x) !== look(pair.a) && look(x) !== look(pair.b)));
      objs = U.shuffle([...objs, Object.assign({}, extra, { s: 0.85 })]);
    }
    const scene = buildScene(ctx, objs);
    const names = objs.map((x) => x.ein || ((x.g === 'f' ? 'eine ' : 'ein ') + x.k));
    const intro = objs.length === 2 ? `Hier sind ${names[0]} und ${names[1]}.` : `Hier sind ${names[0]}, ${names[1]} und ${names[2]}.`;
    const q = askFloat ? 'Was schwimmt?' : 'Was sinkt?';
    setCard(scene.card, q, null);
    const p = chooseObject(ctx, scene.ctrl, objs, objs.indexOf(target));
    await ctx.instruct(`${intro} Was glaubst du: ${q}`);
    if (!ctx.active) return;
    const { i, tile } = await p;
    if (!ctx.active) return;
    await drop(ctx, scene, objs);
    if (!ctx.active) return;
    const ok = objs[i] === target;
    trackPred(ctx, pair.k, ok);
    if (ok) {
      const say = proc(ctx, `${vary('okp', OK_PRED)} ${Der(target)} ${verb(target.fl)}.`,
        `${vary('okp', OK_PRED)} Du hast dich von der Größe nicht täuschen lassen. Stark!`);
      await ctx.correct(tile, { say, praise: false });
    } else {
      await ctx.wrong(tile, { say: '', keep: true });
      if (!ctx.active) return;
      await ctx.say(`${vary('oops', OOPS)} ${Der(target)} ${verb(target.fl)}. ${vary('learn', LEARN)}`);
    }
    if (!ctx.active) return;
    // Warum? – zum überraschenden Ding (großes schwimmt / kleines sinkt), sonst zum großen Stein
    const about = counter ? U.pick([pair.a, pair.b]) : pair.a;
    const partner = about === pair.a ? pair.b : pair.a;
    const rs = reasonsFor(about).map((r) => Object.assign(r, { ex: r.ok ? '' : explainReason(about, r.kind, partner) }));
    const M = MAT[about.mat].n;
    const despite = about.fl ? `, auch wenn ${er(about)} groß und schwer ist` : (about.big ? '' : `, auch wenn ${er(about)} klein und leicht ist`);
    await askWhy(ctx, scene, `Warum ${verb(about.fl)} ${der(about)}?`, rs, {
      hint: 'Tipp: Frag dich: Woraus ist es gemacht?',
      model: `Schau: ${Der(about)} ist aus ${M}. Darum ${verb(about.fl)} ${er(about)}${despite}. Tipp auf diese Karte.`,
    });
    if (!ctx.active) return;
    await ctx.say(vary('merk3', ['Es kommt auf das Material an, nicht auf die Größe.', 'Bei vollen Dingen zählt das Material, nicht die Größe.']));
    await ctx.sleep(400);
  }

  /* ======================================================================
     Stufe 4: Forschertabelle – alle vermuten, dann alle testen
     ====================================================================== */
  async function taskSort(ctx) {
    const n = Math.max(3, Math.min(5, 4 + ctx.flow));
    const first = ctx.item(pool(SORT, (x) => x.k), (x) => x.k, { avoid: 4 });
    let objs;
    for (let tries = 0; tries < 20; tries++) {
      objs = [first, ...U.sample(SORT.filter((x) => x !== first && look(x) !== look(first)), n - 1)];
      if (objs.some((x) => x.fl) && objs.some((x) => !x.fl) && new Set(objs.map(look)).size === n) break;
    }
    objs = U.shuffle(objs);
    const scene = buildScene(ctx, objs);
    scene.tank.classList.add('sws-table');
    const pb = predictButtons(ctx, scene.ctrl);
    const preds = [];
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      scene.nodes.forEach((x, k) => x.classList.toggle('sws-cur', k === i));
      setCard(scene.card, question(o), el('span.sws-cardpic', art(o)));
      const p = pb.wait(o.fl ? 'float' : 'sink');
      ctx.instruct(i === 0 ? `Fangen wir an. ${question(o)}` : question(o));
      const kind = await p;
      if (!ctx.active) return;
      preds.push(kind);
      scene.nodes[i].appendChild(el('div.sws-badge', icon(kind)));
      await ctx.sleep(200);
      if (!ctx.active) return;
    }
    scene.nodes.forEach((x) => x.classList.remove('sws-cur'));
    scene.ctrl.classList.add('sws-gone');
    setCard(scene.card, 'Jetzt testen wir alle!', null);
    await ctx.say('Jetzt testen wir alle auf einmal!');
    if (!ctx.active) return;
    await drop(ctx, scene, objs);
    if (!ctx.active) return;
    const wrong = [];
    objs.forEach((o, i) => {
      const ok = (preds[i] === 'float') === o.fl;
      trackPred(ctx, o.k, ok);
      const b = scene.nodes[i].querySelector('.sws-badge');
      if (b) b.classList.add(ok ? 'sws-ok' : 'sws-oops');
      if (!ok) wrong.push(o);
    });
    if (!wrong.length) {
      await ctx.correct(scene.card, {
        praise: false,
        say: proc(ctx, vary('allok', ['Alles richtig vermutet! Toll!', 'Jede Vermutung stimmt! Super!']),
          'Alles richtig vermutet! Du hast bei jedem Ding an das Material gedacht. Sehr schlau!'),
      });
    } else {
      await ctx.wrong(scene.card, { say: '', keep: true });
      if (!ctx.active) return;
      const right = objs.length - wrong.length;
      const ofN = `von ${U.numberWord(objs.length)} Vermutungen`;
      const tally = right === 1 ? `Eine ${ofN} stimmt.` : `${U.cap(U.numberWord(right))} ${ofN} stimmen.`;
      await ctx.say(right ? `${tally} Schau mal:` : 'Schau mal genau hin:');
      for (const o of wrong) {
        if (!ctx.active) return;
        const node = scene.nodes[objs.indexOf(o)];
        node.classList.add('sws-cur');
        await ctx.say(merk(o));
        node.classList.remove('sws-cur');
      }
      if (!ctx.active) return;
      await ctx.say(SUMMARY);
    }
    if (!ctx.active) return;
    await ctx.sleep(450);
  }

  /* ======================================================================
     Stufe 5: Profi-Rätsel
     ====================================================================== */
  async function taskProfi(ctx) {
    const r = ctx.item(pool(PROFI, (x) => x.k), (x) => x.k, { avoid: 3 });
    const reviewTip = ctx.isReview && r.tip ? r.tip + ' ' : '';
    if (r.type === 'knete') {
      const objs = r.objs;
      const scene = buildScene(ctx, objs);
      setCard(scene.card, 'Was schwimmt?', el('span.sws-qtag', 'Knete'));
      const p = chooseObject(ctx, scene.ctrl, objs, 1);
      await ctx.instruct(reviewTip + r.ask);
      if (!ctx.active) return;
      const { i, tile } = await p;
      if (!ctx.active) return;
      await drop(ctx, scene, objs);
      if (!ctx.active) return;
      const ok = i === 1;
      trackPred(ctx, r.k, ok);
      if (ok) await ctx.correct(tile, { praise: false, say: proc(ctx, `${vary('okp', OK_PRED)} Das Schiffchen schwimmt.`, `${vary('okp', OK_PRED)} Du hast auf die Form geachtet. Sehr schlau!`) });
      else {
        await ctx.wrong(tile, { say: '', keep: true });
        if (!ctx.active) return;
        await ctx.say(`${vary('oops', OOPS)} Die Kugel sinkt, aber das Schiffchen schwimmt. Spannend, oder?`);
      }
      if (!ctx.active) return;
      await askWhy(ctx, scene, r.whyQ, r.reasons, r);
      if (!ctx.active) return;
      await ctx.say(r.after);
      await ctx.sleep(400);
      return;
    }
    const o = r.o;
    const scene = buildScene(ctx, [o]);
    const q = r.ask || question(o);
    setCard(scene.card, q, el('span.sws-cardpic', art(o)));
    const pb = predictButtons(ctx, scene.ctrl);
    const p = pb.wait(o.fl ? 'float' : 'sink');
    await ctx.instruct(ctx.isReview ? `Erinnerst du dich? ${reviewTip}${q}` : q);
    if (!ctx.active) return;
    const kind = await p;
    if (!ctx.active) return;
    const node = pb.btn[kind];
    node.classList.add('sws-chosen');
    await drop(ctx, scene, [o]);
    if (!ctx.active) return;
    const ok = (kind === 'float') === o.fl;
    trackPred(ctx, r.k, ok);
    await judge(ctx, node, ok, o, r.type === 'single' ? r.after : '', r.type === 'why' ? PROC_PROFI_WHY : PROC_PROFI);
    if (!ctx.active) return;
    if (r.type === 'why') {
      await askWhy(ctx, scene, r.whyQ, r.reasons, r);
      if (!ctx.active) return;
      await ctx.say(r.after);
    }
    await ctx.sleep(400);
  }

  /* ======================================================================
     Registrierung
     ====================================================================== */
  LT.registerGame({
    id: 'schwimmen-sinken',
    area: 'sach1',
    title: 'Schwimmt oder sinkt?',
    icon: '🛁',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Schwimmt es oder sinkt es? Das finden wir heute im Wasserbecken heraus!',
    parent: {
      skill: 'Forschen wie im Sachunterricht: Vermuten, Versuch beobachten, Ergebnis erklären (Schwimmen und Sinken)',
      goal: 'Ihr Kind stellt vor einem Versuch eine Vermutung auf, beobachtet das Ergebnis und erklärt es mit dem Material: Dinge aus Holz und Kork schwimmen meistens, viele aus Plastik auch; volle Dinge aus Metall, Stein und Glas sinken – unabhängig von Größe und Gewicht. Auf der höchsten Stufe versteht es, warum ein Schiff aus Metall schwimmt (Form mit Luft darin).',
      levels: [
        'Vermuten mit klaren Alltagsdingen (Korken, Schlüssel, Stein …), danach Merksatz mit dem Material – Brücke aus der Vorschule',
        'Material-Detektiv: vermuten, testen und dann das Material bestimmen (Holz, Kork, Plastik, Metall, Stein, Glas)',
        'Forschertabelle: für drei bis fünf Dinge vermuten, alle auf einmal testen und die eigenen Vermutungen überprüfen',
        'Größenfalle: großes und kleines Ding (riesiger Baumstamm, winziger Nagel) – was sinkt? Danach den Grund wählen: Material statt Größe, Gewicht oder Form',
        'Profirätsel (Ende Klasse 1): Schiff und Schüssel aus Metall, Knete als Kugel und als Schiffchen, Apfel, Eis, Kerze, Ei – mit Begründung',
      ],
      tip: 'Machen Sie den Versuch in der Badewanne oder Spüle: Erst vermuten lassen („Was glaubst du?“), dann testen. Besonders spannend: Knete als Kugel und als Schiffchen, ein Apfel und eine Kartoffel, ein Löffel aus Holz und einer aus Metall. Nicht wundern: Manches Plastik sinkt, und eine leere, verschlossene Glasflasche schwimmt, weil Luft darin ist.',
    },

    async task(ctx) {
      // Gleiche Bedienung → taskLevel darf wechseln; sonst bleibt die Stufe der Runde
      const level = KIND[ctx.taskLevel] === KIND[ctx.level] ? ctx.taskLevel : ctx.level;
      if (ctx.index === 0) { introduced = new Set(); wrongCount = new Map(); }
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      if (level <= 2) return taskSingle(ctx, level);
      if (level === 3) return taskSort(ctx);
      if (level === 4) return taskPair(ctx);
      return taskProfi(ctx);
    },
  });
})();
