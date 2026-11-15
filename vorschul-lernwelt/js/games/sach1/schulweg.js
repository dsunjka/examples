/* ==========================================================================
   Spiel „Sicher zur Schule“ 🚸 (Sachkunde-Schule, Klasse 1) – Spec A14

   Baut auf „Sicher unterwegs“ (welt1/verkehr, Kita) auf und geht weiter:
   nicht nur Regeln erkennen, sondern Situationen beurteilen, Gefahren selbst
   finden, Gründe verstehen und im Notfall richtig handeln.

   Stufen:
     1  Ampel-Profi (Brücke aus der Vorschule): Fußgänger- vs. Autoampel,
        Rot ohne Auto, Grün mit Abbieger, Ampel wird mitten auf der Straße rot,
        Ampelknopf, Schild „Ampel“.
     2  Zebrastreifen und Blickrichtung: Links-rechts-links selbst legen
        (eigene Bedienung, Auto kommt evtl.), wann am Zebrastreifen losgehen
        (Auto fährt / bremst / steht), Blickkontakt, Fahrrad schieben,
        Schilder Fußgängerüberweg und Gehweg (Bedeutung lesen).
     3  Gefahren-Detektiv: Wimmelbild-Straße – Gefahren antippen (parkende
        Autos, Ausfahrt, Ball, Bus); „Wo gehst du am sichersten rüber?“;
        Rückfahrlicht, Bus-Aussteigen; Schilder Kinder, Spielstraße, Stopp.
     4  Sichtbar im Dunkeln: Wen sieht der Autofahrer zuerst? Was macht dich
        sichtbar (Mehrfachauswahl)? Regen + Dunkel; Schilder-Profi (alle
        Schilder, ähnliche Ablenker).
     5  Notruf: Nummer wählen (112/110/kein Notruf), Telefon-Rollenspiel mit
        Tastenfeld und den W-Fragen (Wer? Wo? Was? Wie viele? Warten!).

   Fehlvorstellungen, die gezielt angesprochen werden:
   - „Grün ist grün“ (Autoampel gilt nicht für Fußgänger)
   - „Bei Grün kann nichts passieren“ (abbiegende Autos)
   - „Wenn kein Auto kommt, darf ich bei Rot“
   - „Das Auto wird langsamer, also kann ich gehen“ (erst wenn es steht)
   - „Hier draußen“ als Ortsangabe beim Notruf; sofort Auflegen
   Hilfe-Leiter: 1. Fehler → Erklärung, was am Gewählten nicht passt (ohne
   Lösung), dann Denkanstoß (hintSay) und eine Antwort fällt weg; danach
   macht Flo es vor (modelSay).
   Gesprochene Texte: Zahlen als Wörter, Notrufnummern als „eins, eins, zwei“.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const w = (n) => U.numberWord(n);

  const S112 = 'eins, eins, zwei';
  const S110 = 'eins, eins, null';

  /* ======================================================================
     SVG-Helfer
     ====================================================================== */
  function svg(vb, inner, cls) {
    const d = document.createElement('div');
    d.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${cls || ''}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${inner}</svg>`;
    return d.firstChild;
  }

  /** Kind mit Fußpunkt (x, fy), Skalierung s. o: back, run, stop, vest, dark, bright, helmet, bag, shirt, hair, adult */
  function kid(x, fy, o = {}, s = 1) {
    const skin = o.skin || '#eebb8f';
    const hair = o.hair || '#3a2618';
    const shirt = o.dark ? '#22242f' : o.vest ? '#ffd400' : o.bright ? '#f4f4f8' : (o.shirt || '#ff8a3d');
    const pants = o.dark ? '#191a22' : o.bright ? '#c9d6ea' : (o.pants || '#3d5a80');
    const legs = o.run
      ? '<polyline points="-3,-15 -7,-7 -12,-3"/><polyline points="3,-15 7,-7 6,0"/>'
      : '<line x1="-4" y1="-15" x2="-4" y2="0"/><line x1="4" y1="-15" x2="4" y2="0"/>';
    const arms = o.run
      ? '<line x1="-7" y1="-29" x2="-15" y2="-22"/><line x1="7" y1="-29" x2="14" y2="-37"/>'
      : o.stop
        ? '<line x1="-7" y1="-29" x2="-13" y2="-19"/><line x1="7" y1="-29" x2="13" y2="-19"/>'
        : '<line x1="-7" y1="-29" x2="-10" y2="-17"/><line x1="7" y1="-29" x2="10" y2="-17"/>';
    const armColor = o.dark ? '#22242f' : o.vest ? '#ffd400' : skin;
    const reflect = o.vest
      ? '<rect x="-8" y="-26" width="16" height="3" fill="#f2f6ff"/><rect x="-8" y="-20" width="16" height="3" fill="#f2f6ff"/>' +
        (o.glow ? '<circle cx="0" cy="-24" r="19" fill="#fff6a0" opacity=".28"/><g stroke="#fff6a0" stroke-width="1.6" stroke-linecap="round"><line x1="-15" y1="-34" x2="-20" y2="-39"/><line x1="15" y1="-34" x2="20" y2="-39"/><line x1="-16" y1="-16" x2="-22" y2="-14"/><line x1="16" y1="-16" x2="22" y2="-14"/></g>' : '')
      : '';
    const bag = o.bag
      ? (o.back
        ? `<rect x="-9" y="-33" width="18" height="17" rx="4" fill="${o.bag}"/>${o.glow ? '<rect x="-9" y="-24" width="18" height="3" fill="#f2f6ff"/>' : ''}`
        : `<rect x="-11" y="-32" width="3" height="12" rx="1.5" fill="${o.bag}"/><rect x="8" y="-32" width="3" height="12" rx="1.5" fill="${o.bag}"/>`)
      : '';
    const face = o.back
      ? `<circle cx="0" cy="-41" r="8.4" fill="${hair}"/>`
      : `<path d="M-8.4 -42 Q0 -54 8.4 -42 Q0 -47 -8.4 -42 Z" fill="${hair}"/>
         <circle cx="-3" cy="-41" r="1.2" fill="#2b2d42"/><circle cx="3" cy="-41" r="1.2" fill="#2b2d42"/>
         <path d="M-2.5 -37.5 Q0 -35.5 2.5 -37.5" stroke="#7a3b2e" stroke-width="1" fill="none"/>`;
    const helmet = o.helmet
      ? '<path d="M-10 -42 A10 10 0 0 1 10 -42 Z" fill="#e53935" stroke="#a52824" stroke-width="1.2"/>'
      : '';
    return `<g transform="translate(${x} ${fy}) scale(${s})" opacity="${o.op == null ? 1 : o.op}">
      <g stroke="${pants}" stroke-width="5" stroke-linecap="round" fill="none">${legs}</g>
      <g stroke="${armColor}" stroke-width="4" stroke-linecap="round">${arms}</g>
      ${o.back ? '' : bag}
      <rect x="-8" y="-33" width="16" height="19" rx="4" fill="${shirt}"/>
      ${reflect}${o.back ? bag : ''}
      <circle cx="0" cy="-41" r="8" fill="${skin}"/>${face}${helmet}
    </g>`;
  }

  /** Auto von der Seite. x = Mitte, by = Unterkante, dir 1 = fährt nach rechts. o: s, beam, reverse, blink, brake, driver, speed */
  function car(x, by, color, dir = 1, o = {}) {
    const s = o.s || 1;
    return `<g transform="translate(${x} ${by}) scale(${dir * s} ${s})">
      ${o.beam ? '<polygon points="28,-14 120,-38 120,12" fill="#fff6a0" opacity=".35"/>' : ''}
      ${o.speed ? '<g stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity=".9"><line x1="-36" y1="-24" x2="-54" y2="-24"/><line x1="-34" y1="-16" x2="-60" y2="-16"/><line x1="-36" y1="-8" x2="-50" y2="-8"/></g>' : ''}
      ${o.reverse ? '<circle cx="-31" cy="-14" r="10" fill="#ffffff" opacity=".55"/><g stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none"><polyline points="-42,-26 -48,-20 -42,-14"/><polyline points="-50,-26 -56,-20 -50,-14"/></g>' : ''}
      <path d="M-28 -8 Q-29 -18 -20 -19 L-12 -20 L-6 -31 Q-4 -33 0 -33 L13 -33 Q16 -33 18 -30 L23 -20 Q29 -19 29 -12 L29 -8 Z" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
      <path d="M-9 -21 L-4 -30 L4 -30 L4 -21 Z M7 -21 L7 -30 L13 -30 Q15 -30 16 -28 L20 -21 Z" fill="#cfe9ff" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>
      ${o.driver ? '<circle cx="11" cy="-25" r="3.6" fill="#eebb8f"/><path d="M7.6 -26 Q11 -31 14.4 -26" fill="#5a3a22"/><circle cx="12.4" cy="-25.4" r=".8" fill="#2b2d42"/>' : ''}
      <rect x="25" y="-17" width="4" height="4" rx="1" fill="${o.beam ? '#fff6a0' : '#ffe9a8'}"/>
      ${o.blink ? '<circle cx="27" cy="-11" r="4" fill="#ff9f1a"/><circle cx="27" cy="-11" r="7" fill="#ff9f1a" opacity=".35"/>' : ''}
      <rect x="-28" y="-16" width="3" height="4" rx="1" fill="${o.reverse ? '#ffffff' : '#ff5a4f'}"/>
      ${o.brake ? '<circle cx="-27" cy="-14" r="7" fill="#ff3b30" opacity=".5"/>' : ''}
      <circle cx="-16" cy="-6" r="6" fill="#2b2d42"/><circle cx="-16" cy="-6" r="2.6" fill="#b7bccb"/>
      <circle cx="17" cy="-6" r="6" fill="#2b2d42"/><circle cx="17" cy="-6" r="2.6" fill="#b7bccb"/>
    </g>`;
  }

  function bus(x, by, dir = 1) {
    return `<g transform="translate(${x} ${by}) scale(${dir} 1)">
      <rect x="-36" y="-38" width="72" height="32" rx="6" fill="#f2b705" stroke="rgba(0,0,0,.3)" stroke-width="1.2"/>
      <g fill="#cfe9ff" stroke="rgba(0,0,0,.2)" stroke-width=".8"><rect x="-31" y="-33" width="11" height="11" rx="1.5"/><rect x="-17" y="-33" width="11" height="11" rx="1.5"/><rect x="-3" y="-33" width="11" height="11" rx="1.5"/><rect x="11" y="-33" width="11" height="11" rx="1.5"/><rect x="25" y="-33" width="9" height="16" rx="1.5"/></g>
      <rect x="-36" y="-17" width="72" height="3" fill="#ffffff" opacity=".7"/>
      <circle cx="-22" cy="-6" r="6" fill="#2b2d42"/><circle cx="-22" cy="-6" r="2.6" fill="#b7bccb"/>
      <circle cx="22" cy="-6" r="6" fill="#2b2d42"/><circle cx="22" cy="-6" r="2.6" fill="#b7bccb"/>
    </g>`;
  }

  /* --- Fußgängerampel (lokales viewBox 0 0 100 210) --- */
  function manStand(c) {
    return `<g stroke="${c}" stroke-linecap="round" fill="none">
      <line x1="0" y1="-7" x2="0" y2="6" stroke-width="9"/>
      <line x1="-6.5" y1="-6" x2="-7.5" y2="6" stroke-width="4"/><line x1="6.5" y1="-6" x2="7.5" y2="6" stroke-width="4"/>
      <line x1="-2.6" y1="8" x2="-2.6" y2="19" stroke-width="4.6"/><line x1="2.6" y1="8" x2="2.6" y2="19" stroke-width="4.6"/>
    </g><circle cx="0" cy="-14" r="4.8" fill="${c}"/>`;
  }
  function manWalk(c) {
    return `<g stroke="${c}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="1" y1="-7" x2="-1" y2="5" stroke-width="7.5"/>
      <polyline points="1,-5 6,1 10,4" stroke-width="4"/><polyline points="0,-5 -5,0 -9,3" stroke-width="4"/>
      <polyline points="-1,6 4,12 8,19" stroke-width="4.6"/><polyline points="-1,6 -5,13 -10,18" stroke-width="4.6"/>
    </g><circle cx="2" cy="-14" r="4.8" fill="${c}"/>`;
  }
  function pedLightMarkup(green, button) {
    const red = green ? '#4a2323' : '#ff3b30';
    const grn = green ? '#2ee86f' : '#1d3d29';
    return `<rect x="44" y="150" width="12" height="60" fill="#8a8f9c"/>
      ${button ? '<rect x="30" y="160" width="40" height="30" rx="5" fill="#ffd400" stroke="#b39500" stroke-width="2"/><circle cx="50" cy="175" r="8" fill="#2b2d42"/>' : ''}
      <rect x="18" y="8" width="64" height="146" rx="12" fill="#2b2d42" stroke="#1a1b29" stroke-width="3"/>
      <rect x="25" y="16" width="50" height="62" rx="8" fill="#111"/>
      <rect x="25" y="84" width="50" height="62" rx="8" fill="#111"/>
      <g transform="translate(50 50) scale(1.55)">${manStand(red)}</g>
      <g transform="translate(50 118) scale(1.55)">${manWalk(grn)}</g>`;
  }
  /** Fußgängerampel in einer Szene, Fußpunkt (x, by), Höhe ca. 63 */
  const pedLight = (x, by, green, button) => `<g transform="translate(${x - 15} ${by - 63}) scale(0.3)">${pedLightMarkup(green, button)}</g>`;
  /** Autoampel (drei Lichter) in einer Szene */
  function carLight(x, by, state) {
    const c = (on, col, off) => (on ? col : off);
    return `<rect x="${x - 2}" y="${by - 40}" width="4" height="40" fill="#8a8f9c"/>
      <rect x="${x - 8}" y="${by - 72}" width="16" height="36" rx="4" fill="#2b2d42"/>
      <circle cx="${x}" cy="${by - 65}" r="4.6" fill="${c(state === 'red', '#ff3b30', '#4a2323')}"/>
      <circle cx="${x}" cy="${by - 54}" r="4.6" fill="${c(state === 'yellow', '#ffcc00', '#4a4123')}"/>
      <circle cx="${x}" cy="${by - 43}" r="4.6" fill="${c(state === 'green', '#2ee86f', '#1d3d29')}"/>`;
  }
  const pedLightNode = (green) => svg('0 0 100 210', pedLightMarkup(green), 'sch-light');
  const carLightNode = (state) => svg('6 32 28 78', carLight(20, 108, state), 'sch-light sch-carlight');

  /** Straße. Fahrbahn y 48–104, Bordstein 104, Gehweg (nah) darunter. */
  function street(o = {}) {
    const n = o.night;
    const sky = n ? '#1b2340' : '#cdeeff';
    const walk = n ? '#4f5363' : '#dcdde3';
    const road = n ? '#2f323b' : '#666b78';
    const houses = n
      ? `<rect x="14" y="6" width="44" height="30" fill="#2b3150"/><rect x="24" y="14" width="9" height="8" fill="#ffd95a"/>
         <rect x="150" y="2" width="58" height="34" fill="#2b3150"/><rect x="162" y="10" width="9" height="8" fill="#ffd95a"/><circle cx="224" cy="12" r="6" fill="#f5f0c8"/>`
      : `<rect x="14" y="8" width="44" height="28" fill="#f4c27a"/><polygon points="10,10 36,-6 62,10" fill="#d9644a"/><rect x="24" y="15" width="9" height="8" fill="#fff"/><rect x="40" y="15" width="9" height="8" fill="#fff"/>
         <rect x="150" y="6" width="58" height="30" fill="#9fc6e8"/><rect x="162" y="12" width="9" height="8" fill="#fff"/><rect x="186" y="12" width="9" height="8" fill="#fff"/>
         <circle cx="108" cy="20" r="10" fill="#5cbf60"/><rect x="106" y="26" width="4" height="10" fill="#8b5a2b"/>`;
    let extra = '';
    if (o.zebra != null) for (let y = 51; y < 102; y += 9) extra += `<rect x="${o.zebra}" y="${y}" width="40" height="5" fill="#fff" opacity=".95"/>`;
    if (o.furt != null) for (let y = 50; y < 102; y += 8) extra += `<rect x="${o.furt}" y="${y}" width="4" height="4" fill="#fff"/><rect x="${o.furt + 36}" y="${y}" width="4" height="4" fill="#fff"/>`;
    if (o.rain) for (let i = 0; i < 26; i++) { const rx = (i * 37) % 240; const ry = (i * 53) % 140; extra += `<line x1="${rx}" y1="${ry}" x2="${rx - 4}" y2="${ry + 9}" stroke="#9fc3ff" stroke-width="1.3" opacity=".7"/>`; }
    return `<rect width="240" height="150" fill="${sky}"/>${houses}
      <rect y="36" width="240" height="12" fill="${walk}"/>
      <rect y="48" width="240" height="56" fill="${road}"/>
      ${o.wet ? '<rect y="48" width="240" height="56" fill="#7fa8ff" opacity=".12"/>' : ''}
      <path d="M0 76 H240" stroke="${n ? '#8a8d96' : '#fff'}" stroke-width="2.5" stroke-dasharray="14 10"/>
      <rect y="104" width="240" height="46" fill="${walk}"/>
      <rect y="102" width="240" height="5" fill="${n ? '#80838f' : '#b4b7c2'}"/>${extra}`;
  }
  const scene = (markup) => svg('0 0 240 150', markup, 'sch-scene');

  /* --- Verkehrszeichen (viewBox 0 0 100 100), nach StVO vereinfacht --- */
  function octagon(r) {
    return U.range(0, 7).map((i) => {
      const a = Math.PI / 8 + i * Math.PI / 4;
      return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
  }
  const blueCircle = '<circle cx="50" cy="50" r="46" fill="#1f5fbf"/><circle cx="50" cy="50" r="42.5" fill="none" stroke="#fff" stroke-width="3"/>';
  const warnTri = '<polygon points="50,6 96,88 4,88" fill="#d32f2f" stroke="#d32f2f" stroke-width="4" stroke-linejoin="round"/><polygon points="50,22 83,80 17,80" fill="#fff"/>';
  const SIGNS = {
    zebra: {
      title: 'Zebrastreifen', name: 'das Schild für den Zebrastreifen',
      look: 'Schau genau: Auf dem Schild geht ein Mensch über Streifen.',
      mean: 'Hier ist ein Zebrastreifen. Fußgänger dürfen hier rüber, und die Autos müssen anhalten.',
      svg: `<rect x="4" y="4" width="92" height="92" rx="7" fill="#1f5fbf"/><rect x="8" y="8" width="84" height="84" rx="5" fill="none" stroke="#fff" stroke-width="3"/>
        <polygon points="50,14 88,84 12,84" fill="#fff"/>
        <g fill="#111"><rect x="30" y="74" width="7" height="6"/><rect x="40" y="74" width="7" height="6"/><rect x="50" y="74" width="7" height="6"/><rect x="60" y="74" width="7" height="6"/></g>
        <g transform="translate(50 56) scale(1.05)">${manWalk('#111')}</g>`,
    },
    gehweg: {
      title: 'Gehweg', name: 'das Schild für den Gehweg',
      look: 'Schau genau: Auf dem runden blauen Schild gehen ein Erwachsener und ein Kind.',
      mean: 'Dieser Weg ist für Fußgänger. Hier gehst du zu Fuß.',
      svg: `${blueCircle}<g fill="#fff" stroke="#fff" stroke-linecap="round">
        <circle cx="40" cy="26" r="6" stroke="none"/><path d="M33 36 L47 36 L52 62 L28 62 Z" stroke-width="2" stroke-linejoin="round"/>
        <line x1="35" y1="62" x2="35" y2="78" stroke-width="5"/><line x1="45" y1="62" x2="45" y2="78" stroke-width="5"/>
        <line x1="47" y1="40" x2="57" y2="52" stroke-width="4"/><circle cx="62" cy="44" r="4.6" stroke="none"/>
        <line x1="62" y1="51" x2="62" y2="64" stroke-width="7"/><line x1="59.5" y1="65" x2="58" y2="78" stroke-width="4"/><line x1="64.5" y1="65" x2="66" y2="78" stroke-width="4"/></g>`,
    },
    radweg: {
      title: 'Radweg', name: 'das Schild für den Radweg',
      look: 'Schau genau: Auf dem runden blauen Schild ist ein Fahrrad.',
      mean: 'Hier ist ein Radweg. Hier fahren die Fahrräder.',
      svg: `${blueCircle}<g stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="30" cy="62" r="13"/><circle cx="70" cy="62" r="13"/><polyline points="30,62 47,62 40,42 30,62"/><polyline points="47,62 62,42 40,42"/>
        <line x1="62" y1="42" x2="70" y2="62"/><line x1="60" y1="34" x2="62" y2="42"/><line x1="55" y1="34" x2="66" y2="34"/><line x1="36" y1="38" x2="45" y2="38"/></g>`,
    },
    stopp: {
      title: 'Stopp', name: 'das Stoppschild',
      look: 'Schau genau: Dieses Schild ist rot und hat acht Ecken.',
      mean: 'Stopp! Hier müssen alle Autos ganz anhalten.',
      svg: `<polygon points="${octagon(47)}" fill="#fff"/><polygon points="${octagon(43)}" fill="#d32f2f"/>
        <text x="50" y="60" text-anchor="middle" font-size="27" font-weight="700" fill="#fff" font-family="Arial, Helvetica, sans-serif" letter-spacing="1">STOP</text>`,
    },
    kinder: {
      title: 'Achtung Kinder', name: 'das Schild: Achtung, Kinder',
      look: 'Schau genau: Im roten Dreieck laufen zwei Kinder.',
      mean: 'Achtung, hier sind oft Kinder! Die Autos fahren besonders vorsichtig.',
      svg: `${warnTri}<g stroke="#111" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="42" y1="48" x2="40" y2="62" stroke-width="5.5"/><polyline points="41,51 34,56" stroke-width="3"/><polyline points="42,51 49,55" stroke-width="3"/>
          <polyline points="40,62 35,68 33,75" stroke-width="3.4"/><polyline points="40,62 45,68 47,75" stroke-width="3.4"/>
          <line x1="59" y1="56" x2="58" y2="66" stroke-width="5"/><polyline points="59,58 53,62" stroke-width="2.6"/><polyline points="59,58 65,61" stroke-width="2.6"/>
          <polyline points="58,66 54,71 53,76" stroke-width="3"/><polyline points="58,66 62,71 64,76" stroke-width="3"/>
        </g><circle cx="43" cy="42" r="4" fill="#111"/><circle cx="60" cy="50.5" r="3.4" fill="#111"/>`,
    },
    ampel: {
      title: 'Ampel kommt', name: 'das Schild: Achtung, Ampel',
      look: 'Schau genau: Im roten Dreieck ist eine kleine Ampel mit drei Lichtern.',
      mean: 'Achtung, gleich kommt eine Ampel!',
      svg: `${warnTri}<rect x="40" y="38" width="20" height="40" rx="4" fill="#111"/>
        <circle cx="50" cy="46" r="4.6" fill="#ff3b30"/><circle cx="50" cy="58" r="4.6" fill="#ffcc00"/><circle cx="50" cy="70" r="4.6" fill="#2ee86f"/>`,
    },
    spiel: {
      title: 'Spielstraße', name: 'das Schild für die Spielstraße',
      look: 'Schau genau: Auf dem blauen Schild spielt ein Kind mit einem Ball, und ein Auto ist ganz klein.',
      mean: 'Hier ist eine Spielstraße. Kinder dürfen spielen, und die Autos fahren ganz langsam.',
      svg: `<rect x="4" y="14" width="92" height="72" rx="7" fill="#1f5fbf"/><rect x="8" y="18" width="84" height="64" rx="5" fill="none" stroke="#fff" stroke-width="2.6"/>
        <polygon points="14,46 26,34 38,46 38,62 14,62" fill="#fff"/><rect x="23" y="52" width="6" height="10" fill="#1f5fbf"/>
        <g stroke="#fff" stroke-linecap="round" fill="none"><line x1="52" y1="40" x2="52" y2="54" stroke-width="5"/><line x1="52" y1="54" x2="48" y2="64" stroke-width="3.4"/><line x1="52" y1="54" x2="56" y2="64" stroke-width="3.4"/><line x1="52" y1="44" x2="46" y2="50" stroke-width="3"/><line x1="52" y1="44" x2="58" y2="49" stroke-width="3"/>
        <line x1="68" y1="48" x2="68" y2="58" stroke-width="4"/><line x1="68" y1="58" x2="65" y2="65" stroke-width="3"/><line x1="68" y1="58" x2="71" y2="65" stroke-width="3"/></g>
        <circle cx="52" cy="35" r="4" fill="#fff"/><circle cx="68" cy="44" r="3.2" fill="#fff"/><circle cx="62" cy="66" r="3.2" fill="#fff"/>
        <path d="M74 74 Q74 70 78 70 L80 67 L86 67 L88 70 Q90 70 90 74 Z" fill="#fff"/><path d="M12 76 H90" stroke="#fff" stroke-width="2"/>`,
    },
  };
  const signNode = (id, cls) => svg('0 0 100 100', SIGNS[id].svg, 'sch-sign ' + (cls || ''));

  /* --- Mini-Szenen als Bild-Antworten --- */
  /** Zebrastreifen: Auto fährt / bremst / steht (viewBox 0 0 120 84) */
  function zebraMini(state) {
    let s = '<rect width="120" height="84" fill="#cdeeff"/><rect y="12" width="120" height="48" fill="#666b78"/><rect y="58" width="120" height="26" fill="#dcdde3"/><rect y="57" width="120" height="3" fill="#b4b7c2"/>';
    for (let y = 15; y < 58; y += 8) s += `<rect x="78" y="${y}" width="26" height="4.5" fill="#fff"/>`;
    s += kid(111, 82, { stop: true, shirt: '#3dbe6b', bag: '#e53935' }, 0.6);
    if (state === 'fahrt') s += car(30, 54, '#e53935', 1, { s: 0.62, speed: true });
    if (state === 'bremst') s += car(52, 54, '#e53935', 1, { s: 0.62, brake: true }) + '<g stroke="#ffffff" stroke-width="2" stroke-linecap="round"><line x1="22" y1="44" x2="30" y2="44"/><line x1="20" y1="50" x2="30" y2="50"/></g><text x="22" y="34" font-size="16" font-weight="700" fill="#ffcc00" font-family="Arial, sans-serif">!</text>';
    if (state === 'steht') s += car(56, 54, '#e53935', 1, { s: 0.62, driver: true });
    return svg('0 0 120 84', s, 'sch-mini');
  }
  /** Nachts: Wie gut sieht man das Kind? (viewBox 0 0 80 100) */
  function nightMini(type) {
    const o = type === 'dark' ? { dark: true, bag: '#20222c', op: 0.55 } : type === 'bright' ? { bright: true, bag: '#d9dde8' } : { vest: true, glow: true, bag: '#ff5fa2' };
    const s = '<rect width="80" height="100" fill="#141a33"/><circle cx="66" cy="14" r="6" fill="#f5f0c8"/><rect y="78" width="80" height="22" fill="#2a2d38"/>' +
      '<polygon points="0,96 80,62 80,100 0,100" fill="#fff6a0" opacity=".08"/>' + kid(40, 92, o, 1.25);
    return svg('0 0 80 100', s, 'sch-mini sch-night');
  }

  /* --- Wimmelbild-Bausteine: Felder à 80 Breite, Höhe 160 (Fahrbahn y 52–110) --- */
  function slotBg(n) {
    const W = n * 80;
    let h = '';
    for (let i = 0; i < n; i++) {
      const x = i * 80;
      h += i % 2
        ? `<rect x="${x + 10}" y="8" width="52" height="30" fill="#9fc6e8"/><rect x="${x + 20}" y="15" width="9" height="8" fill="#fff"/><rect x="${x + 42}" y="15" width="9" height="8" fill="#fff"/>`
        : `<rect x="${x + 14}" y="12" width="40" height="26" fill="#f4c27a"/><polygon points="${x + 10},14 ${x + 34},-2 ${x + 58},14" fill="#d9644a"/><rect x="${x + 22}" y="18" width="9" height="8" fill="#fff"/><circle cx="${x + 68}" cy="26" r="9" fill="#5cbf60"/><rect x="${x + 66}" y="32" width="4" height="8" fill="#8b5a2b"/>`;
    }
    return `<rect width="${W}" height="160" fill="#cdeeff"/>${h}
      <rect y="40" width="${W}" height="12" fill="#dcdde3"/><rect y="52" width="${W}" height="58" fill="#666b78"/>
      <path d="M0 81 H${W}" stroke="#fff" stroke-width="2.5" stroke-dasharray="14 10"/>
      <rect y="110" width="${W}" height="50" fill="#dcdde3"/><rect y="108" width="${W}" height="5" fill="#b4b7c2"/>`;
  }
  const SLOT_DRAW = {
    parkend: (x) => kid(x + 41, 110, { shirt: '#8e6cef', bag: '#3dbe6b' }, 0.78) + car(x + 18, 110, '#4a90e2', 1, { s: 0.6 }) + car(x + 64, 110, '#3dbe6b', 1, { s: 0.6 }),
    luecke: (x) => car(x + 18, 110, '#4a90e2', 1, { s: 0.6 }) + car(x + 64, 110, '#e8a33d', 1, { s: 0.6 }),
    ausfahrt: (x) => `<rect x="${x + 4}" y="113" width="58" height="47" fill="#c4c6cf"/><rect x="${x + 2}" y="120" width="4" height="40" fill="#8a8f9c"/><rect x="${x + 60}" y="120" width="4" height="40" fill="#8a8f9c"/>` +
      car(x + 32, 156, '#8e6cef', -1, { s: 0.7, reverse: true }) + kid(x + 71, 158, { shirt: '#ff5fa2', bag: '#1f5fbf' }, 0.72),
    ball: (x) => `<circle cx="${x + 46}" cy="94" r="5.5" fill="#fff" stroke="#2b2d42" stroke-width="1.2"/><path d="M${x + 44} ${91} l3 -1 l2 2.5 l-1.5 3 l-3 0 Z" fill="#2b2d42"/>
      <path d="M${x + 30} 96 h7 M${x + 28} 91 h6" stroke="#fff" stroke-width="1.4"/>` + kid(x + 26, 122, { run: true, shirt: '#ff8a3d' }, 0.78),
    bus: (x) => bus(x + 46, 110, -1) + kid(x + 7, 104, { run: true, shirt: '#e53935', bag: '#ffd400' }, 0.74),
    busquer: (x) => bus(x + 42, 110, -1),
    hecke: (x) => `<ellipse cx="${x + 40}" cy="112" rx="38" ry="24" fill="#3d9a4f"/><ellipse cx="${x + 24}" cy="104" rx="20" ry="16" fill="#4cb35f"/><ellipse cx="${x + 56}" cy="104" rx="20" ry="16" fill="#4cb35f"/>`,
    zebra: (x) => {
      let s = '';
      for (let y = 55; y < 108; y += 9) s += `<rect x="${x + 20}" y="${y}" width="40" height="5" fill="#fff"/>`;
      return s + kid(x + 40, 146, { stop: true, shirt: '#3dbe6b', bag: '#e53935' }, 0.78);
    },
    zebraLeer: (x) => {
      let s = '';
      for (let y = 55; y < 108; y += 9) s += `<rect x="${x + 20}" y="${y}" width="40" height="5" fill="#fff"/>`;
      return s;
    },
    hand: (x) => kid(x + 30, 156, { shirt: '#4a90e2', pants: '#2b2d42', hair: '#7a4a24' }, 1.05) +
      `<line x1="${x + 40}" y1="${156 - 19}" x2="${x + 46}" y2="${156 - 14}" stroke="#eebb8f" stroke-width="3" stroke-linecap="round"/>` + kid(x + 52, 156, { shirt: '#ffd400', bag: '#8e6cef' }, 0.7),
    ampelwait: (x) => {
      let s = '';
      for (let y = 54; y < 108; y += 8) s += `<rect x="${x + 22}" y="${y}" width="4" height="4" fill="#fff"/><rect x="${x + 56}" y="${y}" width="4" height="4" fill="#fff"/>`;
      return s + pedLight(x + 12, 128, false) + kid(x + 44, 148, { stop: true, shirt: '#ff8a3d', bag: '#4a90e2' }, 0.78);
    },
  };

  /* ======================================================================
     Inhalte
     ====================================================================== */
  // Antwortkarte: { e: Emoji, t: Text (sichtbar), s: gesprochen (sonst t), ok, why }
  const L1 = [
    {
      k: 'Welche Ampel', kind: 'card', q: 'Du gehst zu Fuß. Welche Ampel gilt für dich?',
      pics: true,
      opts: [
        { node: () => pedLightNode(false), aria: 'Ampel mit Männchen', ok: true },
        { node: () => carLightNode('green'), aria: 'Ampel mit drei Lichtern', why: 'Diese Ampel hat drei runde Lichter. Sie ist für die Autos.' },
      ],
      hint: 'Such die Ampel mit dem Männchen.',
      learn: 'Die Ampel mit dem Männchen ist für dich. Die Ampel mit drei Lichtern ist für die Autos.',
      proc: 'Du hast genau auf das Männchen geachtet. Sehr aufmerksam!',
    },
    {
      k: 'Autoampel grün', kind: 'card', q: 'Die Ampel für die Autos ist grün. Darfst du jetzt gehen?',
      scene: () => street({ furt: 120 }) + carLight(176, 104, 'green') + pedLight(104, 104, false) + car(50, 100, '#3dbe6b', 1, { speed: true }) + kid(140, 140, { back: true, shirt: '#ff8a3d', bag: '#4a90e2' }),
      opts: [
        { e: '✋', t: 'Nein. Ich warte auf mein grünes Männchen.', ok: true },
        { e: '🚶', t: 'Ja. Grün ist grün.', why: 'Diese grüne Ampel ist für die Autos. Die Autos dürfen jetzt fahren.' },
        { e: '🏃', t: 'Ja, wenn ich ganz schnell renne.', why: 'Rennen macht es nicht sicherer. Schau, welche Ampel für dich gilt.' },
      ],
      hint: 'Such die Ampel mit dem Männchen. Welche Farbe hat sie?',
      learn: 'Für dich gilt nur die Ampel mit dem Männchen. Wenn die Autos Grün haben, hast du Rot.',
      proc: 'Du hast dich nicht vom Grün der Autoampel reinlegen lassen. Stark!',
    },
    {
      k: 'Rot ohne Auto', kind: 'card', q: 'Das Männchen ist rot. Es kommt kein Auto. Was machst du?',
      scene: () => street({ furt: 120 }) + pedLight(104, 104, false) + kid(140, 140, { back: true, shirt: '#3dbe6b', bag: '#e53935' }),
      opts: [
        { e: '✋', t: 'Ich warte auf Grün.', ok: true },
        { e: '🏃', t: 'Ich renne schnell rüber.', why: 'Ein Auto kann ganz plötzlich um die Ecke kommen. Bei Rot ist die Straße nicht für dich.' },
        { e: '🙈', t: 'Ich gehe, wenn keiner guckt.', why: 'Die Regel gilt immer, auch wenn keiner zuschaut. Kleine Kinder machen dir alles nach.' },
      ],
      hint: 'Was bedeutet das rote Männchen? Es steht still.',
      learn: 'Bei Rot wartest du immer, auch wenn kein Auto kommt. Du bist ein Vorbild für kleinere Kinder.',
    },
    {
      k: 'Abbieger', kind: 'card', q: 'Grün! Aber ein Auto will abbiegen. Was machst du?',
      scene: () => street({ furt: 120 }) + pedLight(104, 104, true) + car(78, 100, '#4a90e2', 1, { blink: true }) + kid(140, 140, { back: true, shirt: '#ffd400', bag: '#8e6cef' }),
      opts: [
        { e: '👀', t: 'Ich schaue, ob das Auto anhält.', ok: true },
        { e: '🏃', t: 'Ich laufe einfach los.', why: 'Grün heißt: Du darfst gehen. Aber manche Autofahrer sehen dich beim Abbiegen nicht.' },
        { e: '🏠', t: 'Ich gehe wieder nach Hause.', why: 'Nach Hause musst du nicht. Es gibt einen sicheren Weg über die Straße.' },
      ],
      hint: 'Das Auto blinkt. Hat der Fahrer dich wirklich gesehen?',
      learn: 'Auch bei Grün schaust du nach abbiegenden Autos. Erst wenn das Auto anhält, gehst du.',
      proc: 'Du hast das blinkende Auto bemerkt. Wie ein echter Verkehrsprofi!',
    },
    {
      k: 'Rot in der Mitte', kind: 'card', q: 'Du bist mitten auf der Straße. Da wird die Ampel rot. Was tust du?',
      scene: () => street({ furt: 120 }) + pedLight(104, 104, false) + kid(140, 82, { back: true, shirt: '#ff5fa2', bag: '#3dbe6b' }),
      opts: [
        { e: '➡️', t: 'Ich gehe zügig weiter.', ok: true },
        { e: '🔙', t: 'Ich drehe um und renne zurück.', why: 'Umdrehen und rennen ist gefährlich. Dabei kannst du stolpern, und der Weg ist nicht kürzer.' },
        { e: '🧍', t: 'Ich bleibe mitten auf der Straße stehen.', why: 'Mitten auf der Straße ist kein sicherer Platz zum Warten.' },
      ],
      hint: 'Die Autos warten noch einen Moment. Wo ist der nächste sichere Platz?',
      learn: 'Wird die Ampel rot, wenn du schon gehst, gehst du zügig weiter. Die Autos warten, bis du drüben bist.',
    },
    {
      k: 'Ampelknopf', kind: 'card', q: 'Die Ampel bleibt lange rot. Was kannst du tun?',
      scene: () => street({ furt: 120 }) + pedLight(104, 108, false, true) + kid(140, 140, { back: true, shirt: '#3dbe6b', bag: '#ffd400' }),
      opts: [
        { e: '👆', t: 'Ich drücke den Knopf und warte.', ok: true },
        { e: '📣', t: 'Ich rufe ganz laut.', why: 'Die Ampel kann dich nicht hören. Schau mal, was am Ampelmast hängt.' },
        { e: '🏃', t: 'Ich gehe bei Rot.', why: 'Bei Rot ist die Straße nicht für dich, auch wenn es lange dauert.' },
      ],
      hint: 'Schau mal auf den gelben Kasten an der Ampel.',
      learn: 'An vielen Ampeln gibt es einen Knopf. Du drückst ihn und wartest geduldig auf Grün.',
    },
    {
      k: 'Schild Ampel', kind: 'card', q: 'Welches Schild sagt: Achtung, gleich kommt eine Ampel?', pics: true,
      opts: [
        { sign: 'ampel', ok: true }, { sign: 'kinder' }, { sign: 'stopp' },
      ],
      hint: 'Schau in die Dreiecke. Wo siehst du drei kleine Lichter?',
      learn: 'Dieses Schild warnt die Autofahrer: Achtung, gleich kommt eine Ampel!',
    },
  ];

  const L2 = [
    { k: 'Links, rechts, links', kind: 'look' },
    {
      k: 'Zebra: wann gehen', kind: 'card', q: 'Am Zebrastreifen: Wann darfst du losgehen?', pics: true,
      opts: [
        { node: () => zebraMini('steht'), label: 'steht', aria: 'Das Auto steht', ok: true, cls: 'sch-minitile' },
        { node: () => zebraMini('bremst'), label: 'bremst', aria: 'Das Auto bremst', cls: 'sch-minitile', why: 'Das Auto bremst gerade. Es rollt aber noch.' },
        { node: () => zebraMini('fahrt'), label: 'fährt', aria: 'Das Auto fährt', cls: 'sch-minitile', why: 'Das Auto fährt noch schnell. Es hat noch nicht angehalten.' },
      ],
      hint: 'Schau auf die Striche hinter den Autos. Welches Auto bewegt sich gar nicht mehr?',
      learn: 'Am Zebrastreifen gehst du erst, wenn das Auto ganz steht und der Fahrer dich sieht.',
      proc: 'Du hast genau geschaut, ob das Auto wirklich steht. Sehr gut!',
    },
    {
      k: 'Blickkontakt', kind: 'card', q: 'Woran merkst du, dass der Autofahrer dich gesehen hat?',
      scene: () => street({ zebra: 130 }) + car(98, 100, '#e53935', 1, { driver: true }) + kid(150, 140, { stop: true, shirt: '#3dbe6b', bag: '#4a90e2' }),
      opts: [
        { e: '👀', t: 'Er schaut mich an und hält an.', ok: true },
        { e: '📯', t: 'Das Auto hupt.', why: 'Hupen heißt nicht: Du darfst gehen. Vielleicht will der Fahrer dich warnen.' },
        { e: '🐢', t: 'Das Auto fährt langsamer.', why: 'Langsamer heißt noch nicht stehen. Das Auto kann noch weiterfahren.' },
      ],
      hint: 'Schau dem Fahrer in die Augen. Was macht das Auto?',
      learn: 'Schau dem Fahrer in die Augen. Wenn er dich anschaut und das Auto steht, weißt du: Er hat dich gesehen.',
    },
    {
      k: 'Fahrrad am Zebra', kind: 'card', q: 'Du hast dein Fahrrad dabei und willst über den Zebrastreifen. Was machst du?',
      opts: [
        { e: '🚶', t: 'Ich steige ab und schiebe.', ok: true },
        { e: '🚲', t: 'Ich fahre schnell drüber.', why: 'Am Zebrastreifen müssen die Autos nur für Fußgänger anhalten. Auf dem Rad bist du kein Fußgänger.' },
        { e: '🔔', t: 'Ich klingle und fahre.', why: 'Klingeln hilft hier nicht. Die Autos müssen nur für Fußgänger anhalten.' },
      ],
      emoji: '🚲',
      hint: 'Für wen ist der Zebrastreifen gemacht?',
      learn: 'Am Zebrastreifen steigst du ab und schiebst dein Fahrrad. Dann bist du ein Fußgänger.',
    },
    {
      k: 'Schild Zebrastreifen', kind: 'card', q: 'Was bedeutet dieses Schild?', sign: 'zebra', read: true,
      opts: [
        { e: '🦓', t: 'Hier ist ein Zebrastreifen.', ok: true },
        { e: '🎠', t: 'Hier ist ein Spielplatz.', why: 'Auf einem Spielplatz-Schild spielen Kinder. Hier ist etwas anderes.' },
        { e: '🚲', t: 'Hier fahren nur Fahrräder.', why: 'Ein Fahrrad ist auf diesem Schild nicht zu sehen.' },
      ],
      hint: 'Schau genau: Worüber geht der Mensch auf dem Schild?',
      learn: 'Das Schild zeigt einen Zebrastreifen. Hier müssen die Autos Fußgänger rüberlassen.',
    },
    {
      k: 'Schild Gehweg', kind: 'card', q: 'Was bedeutet dieses Schild?', sign: 'gehweg', read: true,
      opts: [
        { e: '🚶', t: 'Hier gehen Fußgänger.', ok: true },
        { e: '🚲', t: 'Hier fahren Fahrräder.', why: 'Auf diesem Schild ist kein Fahrrad.' },
        { e: '🚌', t: 'Hier hält der Bus.', why: 'Das Bus-Schild ist gelb und grün mit einem großen H.' },
      ],
      hint: 'Wer ist auf dem Schild zu sehen?',
      learn: 'Das blaue runde Schild mit den zwei Menschen zeigt: Dieser Weg ist für Fußgänger.',
    },
  ];

  const DANGERS = {
    parkend: { k: 'Gefahr: parkende Autos', found: 'Gefunden! Zwischen parkenden Autos sieht dich kein Autofahrer. Geh bis zu einer freien Stelle.' },
    ausfahrt: { k: 'Gefahr: Ausfahrt', found: 'Gefunden! Das Auto fährt rückwärts aus der Ausfahrt. Der Fahrer sieht das Kind nicht.' },
    ball: { k: 'Gefahr: Ball', found: 'Gefunden! Das Kind rennt dem Ball auf die Straße nach. Bleib stehen, auch wenn der Ball wegrollt.' },
    bus: { k: 'Gefahr: Bus', found: 'Gefunden! Vor dem Bus sehen die Autos das Kind nicht. Warte, bis der Bus weggefahren ist.' },
  };
  const SAFE = {
    zebra: 'Schau mal: Dieses Kind wartet am Zebrastreifen. Das ist sicher.',
    hand: 'Schau mal: Das Kind geht an der Hand auf dem Gehweg. Das ist sicher.',
    ampelwait: 'Schau mal: Das Kind wartet bei Rot an der Ampel. Das ist sicher.',
  };

  const L3 = [
    { k: 'Gefahr: parkende Autos', kind: 'hunt', main: 'parkend' },
    { k: 'Gefahr: Ausfahrt', kind: 'hunt', main: 'ausfahrt' },
    { k: 'Gefahr: Ball', kind: 'hunt', main: 'ball' },
    { k: 'Gefahr: Bus', kind: 'hunt', main: 'bus' },
    { k: 'Wo rüber?', kind: 'spot' },
    {
      k: 'Rückfahrlicht', kind: 'card', q: 'Hinten an diesem Auto leuchtet ein weißes Licht. Was heißt das?',
      scene: () => street() + `<rect x="130" y="104" width="70" height="46" fill="#c4c6cf"/>` + car(160, 146, '#8e6cef', -1, { reverse: true }) + kid(222, 148, { shirt: '#ff5fa2', bag: '#1f5fbf' }),
      opts: [
        { e: '🔙', t: 'Das Auto fährt gleich rückwärts.', ok: true },
        { e: '🔧', t: 'Das Auto ist kaputt.', why: 'Das Auto ist nicht kaputt. Das weiße Licht ist ein Zeichen für die anderen.' },
        { e: '💡', t: 'Das Licht ist für mich zum Sehen.', why: 'Das Licht ist ein Zeichen. Es verrät, wohin das Auto gleich fährt.' },
      ],
      hint: 'Das Licht ist hinten am Auto. In welche Richtung fährt es wohl?',
      learn: 'Weißes Licht hinten heißt: Das Auto fährt rückwärts. Bleib stehen, bis es weg ist.',
      proc: 'Du hast das kleine weiße Licht entdeckt. Toll aufgepasst!',
    },
    {
      k: 'Bus aussteigen', kind: 'card', q: 'Du steigst aus dem Bus aus. Wann gehst du über die Straße?',
      scene: () => street() + bus(120, 102, -1) + kid(150, 142, { shirt: '#3dbe6b', bag: '#e53935' }),
      opts: [
        { e: '⏳', t: 'Wenn der Bus weggefahren ist.', ok: true },
        { e: '🏃', t: 'Sofort vor dem Bus.', why: 'Vor dem Bus sehen dich die Autos nicht. Der große Bus versteckt dich.' },
        { e: '↩️', t: 'Sofort hinter dem Bus.', why: 'Auch hinter dem Bus bist du versteckt. Die Autos sehen dich nicht.' },
      ],
      hint: 'Kannst du an dem Bus vorbei die Autos sehen?',
      learn: 'Warte, bis der Bus weggefahren ist. Dann siehst du die Straße wieder, und die Autos sehen dich.',
    },
    {
      k: 'Schild Kinder', kind: 'card', q: 'Was bedeutet dieses Schild?', sign: 'kinder', read: true,
      opts: [
        { e: '⚠️', t: 'Achtung, hier sind oft Kinder!', ok: true },
        { e: '🧒', t: 'Hier dürfen nur Kinder gehen.', why: 'Das Schild verbietet niemandem den Weg. Es ist ein Dreieck. Dreiecke warnen.' },
        { e: '✋', t: 'Hier müssen alle anhalten.', why: 'Das Schild zum Anhalten ist rot mit acht Ecken.' },
      ],
      hint: 'Ein Dreieck mit rotem Rand warnt die Autofahrer. Wovor wohl?',
      learn: 'Das Dreieck warnt die Autofahrer: Achtung, Kinder! Oft steht es vor Schulen und Kindergärten.',
    },
    {
      k: 'Schild Spielstraße', kind: 'card', q: 'Was bedeutet dieses Schild?', sign: 'spiel', read: true,
      opts: [
        { e: '⚽', t: 'Hier dürfen Kinder spielen. Autos fahren ganz langsam.', ok: true },
        { e: '🏟️', t: 'Hier ist ein Fußballplatz.', why: 'Auf dem Schild sind auch ein Haus und ein Auto. Es ist eine Straße.' },
        { e: '🚫', t: 'Hier dürfen keine Kinder hin.', why: 'Schau genau: Auf dem Schild spielt ein Kind.' },
      ],
      hint: 'Wer ist auf dem Schild groß, und was ist ganz klein?',
      learn: 'In der Spielstraße dürfen Kinder spielen. Autos müssen Schritttempo fahren. Trotzdem passt du auf.',
    },
    {
      k: 'Schild Stopp', kind: 'card', q: 'Was bedeutet dieses Schild?', sign: 'stopp', read: true,
      opts: [
        { e: '✋', t: 'Autos müssen hier ganz anhalten.', ok: true },
        { e: '🚌', t: 'Hier ist eine Bushaltestelle.', why: 'Das Schild für den Bus ist gelb mit grünem Rand.' },
        { e: '💨', t: 'Hier darf man schnell fahren.', why: 'Rot bedeutet bei Schildern meistens: Achtung oder halt.' },
      ],
      hint: 'Das Schild ist rot und hat acht Ecken. Was steht darauf?',
      learn: 'Am Stoppschild müssen alle Autos ganz anhalten. Schau trotzdem, ob sie wirklich stehen.',
    },
  ];

  const MULTI_ITEMS = [
    { e: '🦺', t: 'Warnweste', ok: true, yes: 'Ja! Die Warnweste leuchtet im Scheinwerferlicht.' },
    { e: '🎒', t: 'Ranzen mit Leuchtstreifen', ok: true, yes: 'Ja! Die Leuchtstreifen am Ranzen werfen das Licht zurück.' },
    { e: '🔦', t: 'Blinklicht', ok: true, yes: 'Ja! Ein kleines Blinklicht sieht man schon von weitem.' },
    { e: '🧥', t: 'Dunkle Jacke', why: 'Eine dunkle Jacke sieht man im Dunkeln kaum.' },
    { e: '🕶️', t: 'Sonnenbrille', why: 'Mit einer Sonnenbrille siehst du selbst schlechter. Und gesehen wirst du davon nicht.' },
    { e: '🎩', t: 'Schwarzer Hut', why: 'Ein schwarzer Hut verschwindet im Dunkeln.' },
  ];

  const L4 = [
    { k: 'Sichtbar machen', kind: 'multi' },
    {
      k: 'Wen sieht man zuerst', kind: 'card', q: 'Es ist dunkel. Wen sieht der Autofahrer zuerst?', pics: true,
      opts: [
        { node: () => nightMini('reflect'), aria: 'Kind mit Leuchtweste', ok: true },
        { node: () => nightMini('bright'), aria: 'Kind in heller Kleidung', why: 'Helle Sachen sind schon gut. Aber etwas anderes leuchtet noch heller.' },
        { node: () => nightMini('dark'), aria: 'Kind in dunkler Kleidung', why: 'Dunkle Sachen verschwinden im Dunkeln fast ganz.' },
      ],
      hint: 'Was leuchtet, wenn das Licht vom Auto darauf fällt?',
      learn: 'Leuchtstreifen werfen das Licht zurück. Mit ihnen sehen dich Autofahrer schon von ganz weit weg.',
      proc: 'Du hast an das Licht der Autos gedacht. Sehr schlau!',
    },
    {
      k: 'Regen und Dunkel', kind: 'card', q: 'Es regnet, und es ist dunkel. Was ist jetzt anders?',
      scene: () => street({ night: true, rain: true, wet: true }) + car(60, 100, '#4a90e2', 1, { beam: true }) + kid(196, 140, { vest: true, glow: true, bag: '#ff5fa2' }),
      opts: [
        { e: '🛑', t: 'Autos brauchen länger zum Bremsen.', ok: true },
        { e: '👓', t: 'Autofahrer sehen jetzt besser.', why: 'Bei Regen und Dunkelheit sieht man schlechter, nicht besser.' },
        { e: '🚫', t: 'Bei Regen fahren keine Autos.', why: 'Autos fahren auch bei Regen. Viele Eltern fahren dann sogar mit dem Auto.' },
      ],
      hint: 'Denk an eine nasse Rutsche. Wie schnell kommst du da zum Stehen?',
      learn: 'Auf nasser Straße rutschen die Autos länger. Darum wartest du lieber einmal mehr.',
    },
    {
      k: 'Winterjacke', kind: 'card', q: 'Im Winter ist es morgens noch dunkel. Welche Jacke ist für den Schulweg am besten?',
      opts: [
        { e: '🦺', t: 'Eine helle Jacke mit Leuchtstreifen.', ok: true },
        { e: '🧥', t: 'Eine schwarze Jacke.', why: 'Eine schwarze Jacke sieht man im Dunkeln kaum.' },
        { e: '👕', t: 'Nur ein T-Shirt.', why: 'Im Winter frierst du im T-Shirt. Und gut sehen kann man dich damit auch nicht.' },
      ],
      emoji: '🌙',
      hint: 'Was sieht man im Licht der Autos am besten?',
      learn: 'Helle Kleidung und Leuchtstreifen machen dich im Dunkeln gut sichtbar.',
    },
  ];
  // Schilder-Profi (Stufe 4): Bedeutung hören, Schild finden – mit ähnlichen Ablenkern
  const SIMILAR = { zebra: ['gehweg', 'radweg', 'spiel'], gehweg: ['radweg', 'zebra', 'spiel'], radweg: ['gehweg', 'zebra', 'spiel'], stopp: ['kinder', 'ampel', 'zebra'], kinder: ['ampel', 'stopp', 'spiel'], ampel: ['kinder', 'stopp', 'zebra'], spiel: ['zebra', 'gehweg', 'kinder'] };
  Object.keys(SIGNS).forEach((id) => {
    L4.push({
      k: 'Schild finden: ' + SIGNS[id].title, kind: 'card', q: SIGNS[id].mean + ' Welches Schild passt?', pics: true,
      signPick: id,
      hint: SIGNS[id].look,
      learn: SIGNS[id].mean,
    });
  });

  // Stufe 5: Notruf
  const NUM_OPTS = {
    n112: { big: '112', t: 'Feuerwehr und Rettung', s: `${U.cap(S112)}. Feuerwehr und Rettungswagen.`, e: '🚑' },
    n110: { big: '110', t: 'Polizei', s: `${U.cap(S110)}. Polizei.`, e: '🚓' },
    none: { big: '🙅', t: 'Kein Notruf', s: 'Kein Notruf.', e: '', none: true },
  };
  const NUMBER_CASES = [
    { k: 'Nummer: Rauch', q: 'Aus einem Fenster kommt dicker, schwarzer Rauch.', emoji: '🔥', ans: 'n112', learn: `Bei Feuer rufst du die Feuerwehr: ${S112}.` },
    { k: 'Nummer: Sturz', q: 'Ein Kind ist vom Klettergerüst gefallen. Es kann den Arm nicht bewegen.', emoji: '🤕', ans: 'n112', learn: `Wenn jemand verletzt ist, kommt der Rettungswagen: ${S112}. Hol auch einen Erwachsenen.` },
    { k: 'Nummer: Fahrraddieb', q: 'Jemand bricht ein fremdes Fahrrad auf und fährt damit weg.', emoji: '🚲', ans: 'n110', learn: `Bei Dieben hilft die Polizei: ${S110}.` },
    { k: 'Nummer: Blechschaden', q: 'Zwei Autos sind zusammengestoßen. Niemand ist verletzt. Die Fahrer streiten laut.', emoji: '🚗', ans: 'n110', learn: `Wenn niemand verletzt ist, hilft die Polizei: ${S110}.` },
    { k: 'Nummer: Ball', q: 'Dein Ball ist über den Zaun in den Garten geflogen.', emoji: '⚽', ans: 'none', learn: 'Das ist kein Notfall. Frag lieber einen Erwachsenen, ob er dir hilft.' },
    { k: 'Nummer: Schlüssel', q: 'Du hast deinen Hausschlüssel vergessen.', emoji: '🔑', ans: 'none', learn: 'Das ist kein Notfall. Ruf Mama oder Papa an, oder geh zu den Nachbarn.' },
    { k: 'Nummer: Spaß', q: 'Ein Kind will zum Spaß beim Notruf anrufen.', emoji: '😜', ans: 'none', learn: 'Der Notruf ist nie zum Spaß. Sonst fehlt die Hilfe für einen echten Notfall.' },
  ];
  const NUM_WHY = {
    n112: { n110: 'Hier braucht jemand schnell Hilfe von der Feuerwehr oder vom Rettungswagen. Die Polizei hat eine andere Nummer.', none: 'Doch, das ist ein echter Notfall. Hier muss schnell Hilfe kommen.' },
    n110: { n112: 'Niemand ist verletzt, und nichts brennt. Feuerwehr und Rettungswagen braucht es nicht.', none: 'Doch, hier soll jemand kommen und helfen. Wer passt auf, dass alle sich an die Regeln halten?' },
    none: { n112: 'Niemand ist in Gefahr. Der Notruf ist nur für echte Notfälle.', n110: 'Niemand ist in Gefahr. Der Notruf ist nur für echte Notfälle.' },
  };

  const CALLS = [
    {
      k: 'Notruf: Fahrradsturz', emoji: '🚲', story: 'Auf dem Schulweg ist ein Mann vom Fahrrad gestürzt. Er blutet am Bein und kann nicht aufstehen. Kein Erwachsener ist da.',
      wo: { t: 'In der Lindenstraße, vor der Schule.' },
      was: { t: 'Ein Mann ist vom Fahrrad gestürzt. Er blutet am Bein.' },
      wieviel: { t: 'Ein Mann ist verletzt.' },
    },
    {
      k: 'Notruf: Oma', emoji: '👵', story: 'Oma ist im Garten hingefallen. Sie ist ganz blass und spricht nicht richtig. Du bist allein mit ihr.',
      wo: { t: 'Im Gartenweg 5, bei meiner Oma.', s: `Im Gartenweg ${w(5)}, bei meiner Oma.` },
      was: { t: 'Meine Oma ist hingefallen. Sie spricht nicht richtig.' },
      wieviel: { t: 'Nur meine Oma ist verletzt.' },
    },
    {
      k: 'Notruf: Feuer', emoji: '🔥', story: 'Neben dem Spielplatz brennt ein Mülleimer. Der Rauch wird immer mehr. Niemand löscht.',
      wo: { t: 'Am Spielplatz in der Parkstraße.' },
      was: { t: 'Ein Mülleimer brennt.' },
      wieviel: { t: 'Niemand ist verletzt.' },
    },
    {
      k: 'Notruf: Unfall', emoji: '🚗', story: 'An der Kreuzung sind zwei Autos zusammengestoßen. Eine Frau hält sich den Arm und weint.',
      wo: { t: 'An der Kreuzung Hauptstraße und Schulstraße.' },
      was: { t: 'Zwei Autos sind zusammengestoßen. Eine Frau ist verletzt.' },
      wieviel: { t: 'Eine Frau ist verletzt.' },
    },
  ];
  const L5 = CALLS.map((c) => Object.assign({ kind: 'call' }, c)).concat(NUMBER_CASES.map((c) => Object.assign({ kind: 'number' }, c)));

  const POOLS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5 };
  const CUSTOM = { 2: 'look', 3: 'hunt', 4: 'multi', 5: 'call' };

  const INTRO = {
    1: 'Wir üben den Schulweg wie richtige Schulkinder. Zuerst die Ampel. Schau genau hin: Welche Ampel gilt für dich?',
    2: 'Jetzt geht es um den Zebrastreifen. Und du lernst, wohin du zuerst schaust.',
    3: 'Jetzt wirst du Gefahren-Detektiv. Parkende Autos, Ausfahrten und Busse können gefährlich sein.',
    4: 'Im Winter ist es morgens noch dunkel. Wie sehen dich die Autofahrer? Und kennst du alle Schilder?',
    5: `Jetzt lernst du den Notruf. Ist ein Erwachsener da, holst du ihn zuerst. Sonst rufst du selbst an.`,
  };
  const PROC = [
    'Du hast erst genau geschaut und dann getippt. Sehr gut!',
    'Du hast an die Regel gedacht. Wie ein echtes Schulkind!',
    'Du hast überlegt, was passieren kann. Das ist schlau!',
  ];
  const OK = ['Richtig!', 'Genau!', 'Super!', 'Prima!'];

  let introduced = new Set();
  let customCount = {};

  /* ======================================================================
     Spiel
     ====================================================================== */
  LT.registerGame({
    id: 'schulweg',
    area: 'sach1',
    title: 'Sicher zur Schule',
    icon: '🚸',
    levels: 5,
    rounds: 5,
    type: 'tasks',
    intro: 'Hallo! Bald gehst du allein zur Schule. Ich zeige dir, wie du sicher ankommst.',
    parent: {
      skill: 'Verkehrserziehung Klasse 1: Schulweg, Verkehrszeichen, Notruf',
      goal: 'Aufbauend auf „Sicher unterwegs“ beurteilt Ihr Kind echte Schulweg-Situationen: Welche Ampel gilt? Wann darf ich am Zebrastreifen gehen? Wo lauern Gefahren (parkende Autos, Ausfahrten, Bus)? Wie werde ich im Dunkeln gesehen? Zum Schluss übt es den Notruf 112/110 mit den W-Fragen. Flo erklärt immer den Grund hinter der Regel.',
      levels: [
        'Ampel-Profi: Fußgänger- vs. Autoampel, Rot ohne Auto, Abbieger bei Grün, Ampelknopf',
        'Zebrastreifen und Blickrichtung: links – rechts – links selbst legen, erst gehen, wenn das Auto steht, Blickkontakt',
        'Gefahren-Detektiv: Gefahren im Wimmelbild finden, sichere Querungsstelle wählen, Schilder Kinder/Spielstraße/Stopp',
        'Sichtbar im Dunkeln: Reflektoren, helle Kleidung, Regen; Schilder-Profi mit ähnlichen Schildern',
        'Notruf: 112 oder 110 oder kein Notfall; Telefon-Rollenspiel mit Wer? Wo? Was? Wie viele? Warten!',
      ],
      tip: 'Gehen Sie den Schulweg mehrmals gemeinsam ab, später läuft Ihr Kind voraus und erklärt Ihnen jede Stelle. Wählen Sie den sichersten, nicht den kürzesten Weg. Üben Sie den Notruf mit einem ausgeschalteten Telefon und sagen Sie gemeinsam Ihre Adresse auf. Kinder unter acht Jahren können Tempo und Abstand von Autos noch nicht sicher einschätzen.',
    },

    async task(ctx) {
      const level = ctx.taskLevel;
      if (ctx.index === 0) { introduced = new Set(); customCount = {}; }
      if (!introduced.has(level)) {
        introduced.add(level);
        await ctx.say(INTRO[level]);
        if (!ctx.active) return;
      }
      const t = pickTask(ctx, level);
      ctx.stage.classList.add('sch-stage');
      if (t.kind === 'look') return lookTask(ctx, t);
      if (t.kind === 'hunt') return huntTask(ctx, t);
      if (t.kind === 'spot') return spotTask(ctx, t);
      if (t.kind === 'multi') return multiTask(ctx, t);
      if (t.kind === 'call') return callTask(ctx, t);
      if (t.kind === 'number') return numberTask(ctx, t);
      return cardTask(ctx, t);
    },
  });

  /** Aufgabe wählen: die eigene Bedienung der Stufe kommt pro Runde mind. einmal, höchstens zweimal. */
  function pickTask(ctx, level) {
    let pool = POOLS[level];
    const ck = CUSTOM[level];
    if (ck) {
      const n = customCount[level] || 0;
      const late = ctx.index >= ctx.total - 2;
      if (n === 0 && (late || ctx.index >= 1 && U.chance(0.5))) pool = pool.filter((x) => x.kind === ck);
      else if (n >= 2) pool = pool.filter((x) => x.kind !== ck);
    }
    const t = ctx.item(pool, (x) => x.k, { avoid: Math.min(3, pool.length - 1) });
    if (ck && t.kind === ck) customCount[level] = (customCount[level] || 0) + 1;
    return t;
  }

  const ha = (n) => (n <= 2 ? 2 : n === 3 ? 1 : 2);
  const okWord = () => U.pickFresh('sch-ok', OK, 2)[0] || 'Richtig!';
  function praiseSay(ctx, sc, learn) {
    if (ctx.modelShown) return `Genau. ${learn}`;
    if (ctx.wrongCount === 0 && U.chance(0.3)) return `${sc.proc || U.pick(PROC)} ${learn}`;
    return `${okWord()} ${learn}`;
  }

  function cardContent(o) {
    if (o.big) return el('span.sch-ci.sch-numcard', el('span.sch-big' + (o.none ? '.sch-big-none' : ''), o.big), el('span.sch-ct', o.t));
    return el('span.sch-ci', o.e ? U.emoji(o.e, 'sch-ce') : null, el('span.sch-ct', o.t));
  }

  function layout(ctx, qText, fig) {
    const wrap = el('div.sch-wrap' + (fig ? '' : '.sch-nofig'));
    const left = el('div.sch-left');
    const q = el('div.sch-q', el('span.sch-qt', qText));
    left.appendChild(q);
    if (fig) left.appendChild(el('div.sch-fig', fig));
    const box = el('div.choices.sch-opts');
    wrap.append(left, box);
    ctx.stage.appendChild(wrap);
    return { wrap, left, q, box };
  }

  /* ---------------- Bild-/Textkarten-Aufgabe ---------------- */
  async function cardTask(ctx, sc) {
    let fig = null;
    if (sc.scene) fig = scene(sc.scene());
    else if (sc.sign) fig = signNode(sc.sign, 'sch-sign-big');
    else if (sc.emoji) fig = U.emoji(sc.emoji, 'sch-figemoji');
    let opts = sc.opts;
    if (sc.signPick) {
      const n = ctx.flow > 0 ? 3 : 2;
      opts = [{ sign: sc.signPick, ok: true }].concat(SIMILAR[sc.signPick].slice(0, n).map((id) => ({ sign: id })));
    }
    // nach Fehlern in der Runde: eine falsche Antwort weniger
    if (ctx.flow < 0 && opts.length >= 3) {
      const wrongs = opts.filter((o) => !o.ok);
      const drop = U.pick(wrongs);
      opts = opts.filter((o) => o !== drop);
    }
    const L = layout(ctx, sc.q, fig);
    const pics = !!sc.pics;
    L.box.classList.add(pics ? 'sch-picopts' : 'sch-cardopts');
    if (pics && opts.length > 3) L.box.classList.add('sch-four');
    if (opts.some((o) => o.cls === 'sch-minitile')) L.box.classList.add('sch-minis');
    const items = opts.map((o) => {
      if (o.sign) {
        return { content: signNode(o.sign), correct: !!o.ok, className: 'sch-pic sch-signtile', aria: SIGNS[o.sign].title, sign: o.sign, why: o.why };
      }
      if (o.node) return { content: o.node(), correct: !!o.ok, className: 'sch-pic' + (o.cls ? ' ' + o.cls : ''), aria: o.aria, label: o.label, why: o.why };
      return { content: cardContent(o), correct: !!o.ok, className: 'sch-card', say: o.s || o.t, why: o.why };
    });
    // Vorlesen: auf Stufe 1–3 liest Flo die Antworten vor; ab Stufe 4 liest das Kind selbst (🔊 hilft)
    const readSelf = !pics && (ctx.taskLevel >= 4 || sc.read) && ctx.flow >= 0;
    const nameFirst = !pics && !readSelf;
    const spoken = sc.qs || sc.q;
    await ctx.instruct(readSelf ? `${spoken} Lies selbst. Der Lautsprecher hilft dir.` : spoken);
    if (!ctx.active) return;
    const right = items.find((x) => x.correct);
    await ctx.choices(items, {
      container: L.box,
      sayButton: !pics,
      nameFirst,
      hintAfter: ha(items.length),
      praise: false,
      correctSay: () => praiseSay(ctx, sc, sc.learn),
      explain: (wr) => {
        if (wr.sign) return `${SIGNS[wr.sign].mean} Wir suchen ein anderes Schild.`;
        return wr.why || 'Schau noch einmal genau hin.';
      },
      hintSay: () => sc.hint,
      modelSay: () => {
        if (right.sign) return `Schau, hier ist ${SIGNS[right.sign].name}. ${SIGNS[right.sign].look} Tipp es an.`;
        if (right.say) return `Schau, diese Antwort passt: ${right.say} Tipp sie an.`;
        return 'Schau, dieses Bild passt. Tipp es an.';
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  /* ---------------- Stufe 2: Links – rechts – links legen ---------------- */
  function crossMarkup() {
    return street() +
      `<polygon class="sch-look sch-look-l" points="120,98 0,50 0,104" fill="#fff59d" opacity="0"/>
       <polygon class="sch-look sch-look-r" points="120,98 240,50 240,104" fill="#fff59d" opacity="0"/>
       <g class="sch-car sch-car-l" style="transform: translate(-70px, 0)">${car(0, 100, '#e53935', 1)}</g>
       <g class="sch-car sch-car-r" style="transform: translate(310px, 0)">${car(0, 72, '#4a90e2', -1)}</g>
       <g class="sch-walker">${kid(120, 140, { back: true, shirt: '#3dbe6b', bag: '#ff8a3d' })}</g>`;
  }

  async function lookTask(ctx, t) {
    const want = ['l', 'r', 'l'];
    const sv = scene(crossMarkup());
    const L = layout(ctx, 'Wohin schaust du? Lege die Reihenfolge.', sv);
    L.box.classList.add('sch-lookbox');
    const slots = want.map(() => el('div.sch-slot', '?'));
    const slotRow = el('div.sch-slots', ...slots);
    const btnL = el('button.tile.sch-dir', { type: 'button', 'aria-label': 'links' }, U.emoji('⬅️'), el('span.label', 'links'));
    const btnR = el('button.tile.sch-dir', { type: 'button', 'aria-label': 'rechts' }, U.emoji('➡️'), el('span.label', 'rechts'));
    const btnRow = el('div.sch-dirs', btnL, btnR);
    L.box.append(slotRow, btnRow);
    const look = (side) => {
      sv.querySelectorAll('.sch-look').forEach((n) => n.setAttribute('opacity', '0'));
      if (side) sv.querySelector('.sch-look-' + side).setAttribute('opacity', '0.45');
    };
    const btnOf = (s) => (s === 'l' ? btnL : btnR);
    const WHY = [
      'Schau mal: Auf deiner Straßenseite kommen die Autos von links. Die sind dir am nächsten.',
      'Nach links hast du schon geschaut. Jetzt schaust du auf die andere Seite.',
      'Während du rechts geschaut hast, kann links ein neues Auto gekommen sein. Schau noch einmal dorthin.',
    ];
    const SAY_OK = ['Zuerst links.', 'Dann rechts.', 'Und noch einmal links!'];

    await ctx.instruct('Du stehst am Bordstein und willst über die Straße. Wohin schaust du zuerst, dann, und zum Schluss? Tippe die Pfeile.');
    if (!ctx.active) return;
    let step = 0;
    let busy = false;
    const firstTryLook = { ok: true };
    const mark = () => { ctx.markTest(btnL, false); ctx.markTest(btnR, false); if (step < 3) ctx.markTest(btnOf(want[step])); };
    mark();
    await new Promise((resolve) => {
      const onTap = async (side, btn) => {
        if (busy || step >= 3 || !ctx.active) return;
        busy = true;
        if (side === want[step]) {
          ctx.unhint(btnL); ctx.unhint(btnR);
          LT.sfx.play('pop');
          slots[step].textContent = side === 'l' ? '⬅️' : '➡️';
          slots[step].classList.add('sch-slot-ok');
          look(side);
          step++;
          mark();
          await ctx.say(SAY_OK[step - 1]);
          if (step >= 3) { resolve(); return; }
        } else {
          firstTryLook.ok = false;
          await ctx.wrong(btn, { keep: true, say: WHY[step] });
          if (!ctx.active) return;
          const hs = ctx.helpStep;
          if (hs >= 2) ctx.hint(btnOf(want[step]));
          if (hs >= 3 && !ctx.modelShown) {
            ctx.modelShown = true;
            await ctx.say('Schau: Zuerst links, dann rechts, dann noch einmal links. Tipp auf den leuchtenden Pfeil.');
          }
        }
        busy = false;
      };
      ctx.listen(btnL, 'click', () => onTap('l', btnL));
      ctx.listen(btnR, 'click', () => onTap('r', btnR));
    });
    if (!ctx.active) return;
    ctx.markTest(btnL, false); ctx.markTest(btnR, false);
    btnRow.classList.add('sch-done');
    await ctx.correct(slotRow, {
      say: firstTryLook.ok && U.chance(0.3)
        ? 'Du hast ganz ruhig links, rechts, links geschaut. Wie ein echtes Schulkind!'
        : 'Links, rechts, links. Super!',
    });
    if (!ctx.active) return;

    // Kommt ein Auto? (wenn es gut läuft: immer)
    const carSide = ctx.flow > 0 ? U.pick(['l', 'r']) : U.pick([null, 'l', 'r']);
    const carEl = carSide ? sv.querySelector('.sch-car-' + carSide) : null;
    if (carEl) {
      look(carSide);
      carEl.style.transition = 'transform ' + (1.2 * LT.config.speed + 0.01) + 's ease-out';
      carEl.style.transform = carSide === 'l' ? 'translate(40px, 0)' : 'translate(200px, 0)';
      await ctx.sleep(900);
      if (!ctx.active) return;
    }
    const decide = async (carNow) => {
      U.clear(L.box);
      L.q.querySelector('.sch-qt').textContent = carNow ? 'Da kommt ein Auto! Darfst du gehen?' : 'Die Straße ist frei. Darfst du gehen?';
      await ctx.instruct(carNow ? 'Da kommt ein Auto! Darfst du jetzt gehen?' : 'Die Straße ist frei. Darfst du jetzt gehen?');
      if (!ctx.active) return;
      await ctx.choices([
        { content: cardContent({ e: '🚶', t: 'Gehen' }), correct: !carNow, className: 'sch-card sch-short', say: 'Gehen' },
        { content: cardContent({ e: '✋', t: 'Warten' }), correct: carNow, className: 'sch-card sch-short', say: 'Warten' },
      ], {
        container: L.box,
        shuffle: false,
        praise: false,
        correctSay: carNow ? 'Richtig! Du wartest, bis das Auto vorbei ist.' : 'Richtig! Jetzt gehst du zügig geradeaus.',
        explain: () => (carNow ? 'Halt! Das Auto ist noch da. Es kann nicht so schnell bremsen.' : 'Links und rechts ist alles frei. Kein Auto kommt.'),
      });
    };
    if (carEl) {
      await decide(true);
      if (!ctx.active) return;
      carEl.style.transition = 'transform ' + (1.4 * LT.config.speed + 0.01) + 's ease-in';
      carEl.style.transform = carSide === 'l' ? 'translate(330px, 0)' : 'translate(-90px, 0)';
      await ctx.sleep(1400);
      if (!ctx.active) return;
      await ctx.say('Das Auto ist vorbei. Schau noch einmal: links, rechts, links.');
      if (!ctx.active) return;
      look('l'); await ctx.sleep(350); look('r'); await ctx.sleep(350); look('l'); await ctx.sleep(350);
      if (!ctx.active) return;
    }
    look(null);
    await decide(false);
    if (!ctx.active) return;
    const walker = sv.querySelector('.sch-walker');
    walker.style.transition = 'transform ' + (1.6 * LT.config.speed + 0.01) + 's linear';
    walker.style.transform = 'translate(0, -96px)';
    await ctx.sleep(1700);
  }

  /** Straße aus Feldern bauen; im Hochformat bei vielen Feldern auf zwei Reihen verteilt (größer zum Antippen). */
  function streetRows(defs) {
    const portrait = window.innerHeight > window.innerWidth * 1.15;
    const rows = portrait && defs.length >= 4 ? [defs.slice(0, Math.ceil(defs.length / 2)), defs.slice(Math.ceil(defs.length / 2))] : [defs];
    const node = el('div.sch-rows' + (rows.length > 1 ? '.sch-tworows' : ''));
    const cells = [];
    rows.forEach((row) => {
      const m = row.length;
      const markup = slotBg(m) + row.map((s, i) => SLOT_DRAW[s.id](i * 80)).join('');
      const pic = el('div.sch-pic-wrap', { style: { maxWidth: `calc(${rows.length > 1 ? 30 : 52}vh * ${(m * 80 / 138).toFixed(3)})` } }, svg(`0 22 ${m * 80} 138`, markup, 'sch-scene sch-wimmel'));
      row.forEach((s, i) => cells.push({ def: s, pic, left: i * 100 / m, width: 100 / m }));
      node.appendChild(pic);
    });
    return { node, cells };
  }

  /* ---------------- Stufe 3: Wimmelbild – Gefahren finden ---------------- */
  async function huntTask(ctx, t) {
    const nDanger = ctx.flow > 0 || ctx.taskLevel >= 4 ? 3 : 2;
    const nSafe = ctx.flow < 0 ? 1 : 2;
    const others = U.sample(Object.keys(DANGERS).filter((d) => d !== t.main), nDanger - 1);
    const safes = U.sample(Object.keys(SAFE), nSafe);
    const slotsDef = U.shuffle([t.main].concat(others).map((d) => ({ id: d, danger: true })).concat(safes.map((s) => ({ id: s, danger: false }))));
    const q = `Finde die ${w(nDanger)} Gefahren!`;
    const wrap = el('div.sch-huntwrap');
    const qBox = el('div.sch-q', el('span.sch-qt', q), el('span.sch-count', '0 / ' + nDanger));
    const R = streetRows(slotsDef);
    const spots = R.cells.map((c, i) => {
      const b = el('button.sch-hot', { type: 'button', 'aria-label': 'Stelle ' + (i + 1), style: { left: c.left + '%', width: c.width + '%' } });
      b._def = c.def;
      c.pic.appendChild(b);
      return b;
    });
    wrap.append(qBox, R.node);
    ctx.stage.appendChild(wrap);
    await ctx.instruct(`Schau dir die Straße genau an. Wo ist es gefährlich? Finde die ${w(nDanger)} Gefahren und tippe sie an.`);
    if (!ctx.active) return;
    let found = 0;
    let busy = false;
    const open = () => spots.filter((b) => b._def.danger && !b.classList.contains('sch-found'));
    const remark = () => { spots.forEach((b) => ctx.markTest(b, false)); const o = open(); if (o.length) ctx.markTest(o[0]); };
    remark();
    await new Promise((resolve) => {
      spots.forEach((b) => ctx.listen(b, 'click', async () => {
        if (busy || !ctx.active || b.classList.contains('sch-found') || b.classList.contains('sch-safe')) return;
        busy = true;
        const d = b._def;
        if (d.danger) {
          b.classList.add('sch-found');
          b.appendChild(el('span.sch-badge', '⚠️'));
          spots.forEach((x) => ctx.unhint(x));
          found++;
          qBox.querySelector('.sch-count').textContent = found + ' / ' + nDanger;
          remark();
          LT.sfx.play('correct');
          LT.ui.animate(b, 'joy');
          await ctx.say(DANGERS[d.id].found);
          if (found >= nDanger) { resolve(); return; }
        } else {
          b.classList.add('sch-safe');
          b.appendChild(el('span.sch-badge.sch-badge-ok', '✅'));
          await ctx.wrong(b, { keep: true, say: SAFE[d.id] });
          if (!ctx.active) return;
          const hs = ctx.helpStep;
          const o = open();
          if (hs >= 2 && o.length) ctx.hint(o[0]);
          if (hs >= 3 && o.length && !ctx.modelShown) {
            ctx.modelShown = true;
            await ctx.say('Schau hier, wo es leuchtet. Was macht das Kind da? Tipp es an.');
          }
        }
        busy = false;
      }));
    });
    if (!ctx.active) return;
    spots.forEach((b) => ctx.markTest(b, false));
    await ctx.correct(qBox, {
      say: ctx.wrongCount === 0 && U.chance(0.3)
        ? 'Du hast alle Gefahren entdeckt, ohne dich zu irren. Ein echter Verkehrs-Detektiv!'
        : `${okWord()} Du hast alle Gefahren gefunden.`,
    });
    if (!ctx.active) return;
    await ctx.sleep(300);
  }

  /* ---------------- Stufe 3: Wo gehst du am sichersten rüber? ---------------- */
  const SPOT_WHY = {
    luecke: 'Zwischen parkenden Autos sieht dich kein Autofahrer. Und du siehst die Autos nicht.',
    busquer: 'Neben dem Bus bist du versteckt. Ein Auto, das vorbeifährt, sieht dich nicht.',
    hecke: 'Hinter der hohen Hecke siehst du die Autos nicht kommen. Und sie sehen dich nicht.',
  };
  async function spotTask(ctx, t) {
    const bads = U.sample(Object.keys(SPOT_WHY), ctx.flow < 0 ? 1 : 2);
    const defs = U.shuffle([{ id: 'zebraLeer', ok: true }].concat(bads.map((id) => ({ id }))));
    const n = defs.length;
    const markup = slotBg(n) + defs.map((s, i) => SLOT_DRAW[s.id](i * 80)).join('');
    const sv = svg(`0 22 ${n * 80} 138`, markup, 'sch-scene sch-wimmel');
    const wrap = el('div.sch-huntwrap');
    const qBox = el('div.sch-q', el('span.sch-qt', 'Wo gehst du am sichersten über die Straße?'));
    const pic = el('div.sch-pic-wrap', { style: { maxWidth: `calc(52vh * ${(n * 80 / 138).toFixed(3)})` } }, sv);
    const box = el('div.choices.sch-spotbox');
    pic.appendChild(box);
    wrap.append(qBox, pic);
    ctx.stage.appendChild(wrap);
    await ctx.instruct('Wo gehst du am sichersten über die Straße? Tippe auf eine Nummer.');
    if (!ctx.active) return;
    const items = defs.map((d, i) => ({
      content: String(i + 1), text: true, correct: !!d.ok, className: 'sch-spot', aria: 'Stelle ' + w(i + 1), id: d.id,
      pos: (i + 0.5) * 100 / n,
    }));
    const p = ctx.choices(items, {
      container: box,
      shuffle: false,
      hintAfter: ha(items.length),
      praise: false,
      correctSay: () => praiseSay(ctx, { proc: 'Du hast an die versteckten Stellen gedacht. Sehr schlau!' }, 'Am Zebrastreifen sehen dich alle Autofahrer gut. Hier gehst du rüber.'),
      explain: (wr) => SPOT_WHY[wr.id] || 'Schau noch einmal genau.',
      hintSay: 'Wo können dich die Autofahrer gut sehen?',
      modelSay: 'Schau, hier ist der Zebrastreifen. Da sehen dich alle. Tipp auf die Nummer.',
    });
    // Positionen der Nummern-Knöpfe unter den Stellen
    (box._tiles || Array.from(box.children)).forEach((tile) => { tile.style.left = tile._item.pos + '%'; });
    await p;
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  /* ---------------- Stufe 4: Was macht dich sichtbar? (mehrere richtig) ---------------- */
  async function multiTask(ctx, t) {
    const nGood = ctx.flow > 0 ? 3 : 2;
    const goods = U.sample(MULTI_ITEMS.filter((x) => x.ok), nGood);
    const bads = U.sample(MULTI_ITEMS.filter((x) => !x.ok), ctx.flow < 0 ? 2 : 3);
    const list = U.shuffle(goods.concat(bads));
    const q = `Was macht dich im Dunkeln sichtbar? Finde ${w(nGood)} Sachen.`;
    const L = layout(ctx, q, scene(street({ night: true }) + car(56, 100, '#4a90e2', 1, { beam: true }) + kid(190, 140, { dark: true, bag: '#20222c', op: 0.6 })));
    L.box.classList.add('sch-multiopts');
    const tiles = list.map((it) => {
      const b = el('button.tile.sch-mtile', { type: 'button', 'aria-label': it.t }, U.emoji(it.e), el('span.label', it.t));
      b._it = it;
      L.box.appendChild(b);
      return b;
    });
    await ctx.instruct(q);
    if (!ctx.active) return;
    let got = 0;
    let busy = false;
    const open = () => tiles.filter((b) => b._it.ok && !b.classList.contains('is-correct'));
    const remark = () => { tiles.forEach((b) => ctx.markTest(b, false)); const o = open(); if (o.length) ctx.markTest(o[0]); };
    remark();
    await new Promise((resolve) => {
      tiles.forEach((b) => ctx.listen(b, 'click', async () => {
        if (busy || !ctx.active || b.classList.contains('is-correct') || b.classList.contains('is-wrong')) return;
        busy = true;
        if (b._it.ok) {
          b.classList.add('is-correct');
          tiles.forEach((x) => ctx.unhint(x));
          got++;
          remark();
          LT.sfx.play('correct');
          await ctx.say(b._it.yes);
          if (got >= nGood) { resolve(); return; }
        } else {
          await ctx.wrong(b, { say: b._it.why });
          if (!ctx.active) return;
          const hs = ctx.helpStep;
          const o = open();
          if (hs >= 2 && o.length) ctx.hint(o[0]);
          if (hs >= 3 && o.length && !ctx.modelShown) {
            ctx.modelShown = true;
            await ctx.say(`Schau, das hier leuchtet im Dunkeln: ${o[0]._it.t}. Tipp es an.`);
          }
        }
        busy = false;
      }));
    });
    if (!ctx.active) return;
    tiles.forEach((b) => ctx.markTest(b, false));
    await ctx.correct(L.q, {
      say: ctx.wrongCount === 0 && U.chance(0.3)
        ? 'Du hast an das Licht der Autos gedacht. Genau so wirst du gesehen!'
        : `${okWord()} Mit Leuchtsachen sehen dich die Autofahrer schon von weitem.`,
    });
    if (!ctx.active) return;
    await ctx.sleep(300);
  }

  /* ---------------- Stufe 5: Welche Nummer? ---------------- */
  async function numberTask(ctx, sc) {
    const L = layout(ctx, sc.q + ' Wen rufst du an?', U.emoji(sc.emoji, 'sch-figemoji'));
    L.box.classList.add('sch-cardopts');
    let keys = ['n112', 'n110', 'none'];
    if (ctx.flow < 0) keys = [sc.ans, U.pick(keys.filter((k) => k !== sc.ans))];
    const items = keys.map((k) => ({ content: cardContent(NUM_OPTS[k]), correct: k === sc.ans, className: 'sch-card sch-num', say: NUM_OPTS[k].s, key: k }));
    await ctx.instruct(`${sc.q} Wen rufst du an?`);
    if (!ctx.active) return;
    await ctx.choices(items, {
      container: L.box,
      sayButton: true,
      nameFirst: ctx.flow < 0 || ctx.index === 0,
      hintAfter: ha(items.length),
      praise: false,
      correctSay: () => praiseSay(ctx, { proc: 'Du hast erst überlegt, ob es ein echter Notfall ist. Sehr klug!' }, sc.learn),
      explain: (wr) => NUM_WHY[sc.ans][wr.key],
      hintSay: sc.ans === 'none' ? 'Ist hier jemand in Gefahr oder verletzt?' : sc.ans === 'n112' ? 'Brennt es, oder ist jemand verletzt?' : 'Ist jemand verletzt? Oder hat jemand etwas Verbotenes getan?',
      modelSay: () => `Schau: ${sc.learn}`,
    });
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  /* ---------------- Stufe 5: Notruf-Rollenspiel ---------------- */
  async function callTask(ctx, sc) {
    const wrap = el('div.sch-callwrap');
    const storyBox = el('div.sch-q.sch-story', U.emoji(sc.emoji, 'sch-storyemoji'), el('span.sch-qt', sc.story));
    const phone = el('div.sch-phone');
    const display = el('div.sch-display', ' ');
    const pad = el('div.sch-pad');
    const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    const keyBtns = {};
    KEYS.forEach((k) => {
      const b = el('button.sch-key', { type: 'button', 'aria-label': k }, k);
      keyBtns[k] = b;
      pad.appendChild(b);
    });
    const callBtn = el('button.sch-callbtn', { type: 'button', 'aria-label': 'Anrufen' }, '📞');
    phone.append(display, pad, callBtn);
    wrap.append(storyBox, phone);
    ctx.stage.appendChild(wrap);

    await ctx.instruct(`${sc.story} Ruf den Notruf an. Tippe die Nummer.`);
    if (!ctx.active) return;

    // 1) Nummer tippen
    const target = '112';
    let typed = '';
    let localWrong = 0;
    let busy = false;
    const mark = () => {
      Object.values(keyBtns).forEach((b) => ctx.markTest(b, false));
      ctx.markTest(callBtn, false);
      if (typed.length < 3) ctx.markTest(keyBtns[target[typed.length]]);
      else ctx.markTest(callBtn);
    };
    mark();
    await new Promise((resolve) => {
      Object.keys(keyBtns).forEach((k) => ctx.listen(keyBtns[k], 'click', async () => {
        if (busy || !ctx.active || typed.length >= 3) return;
        busy = true;
        const b = keyBtns[k];
        if (k === target[typed.length]) {
          Object.values(keyBtns).forEach((x) => ctx.unhint(x));
          LT.sfx.play('tap');
          typed += k;
          display.textContent = typed;
          LT.ui.animate(b, 'joy');
          mark();
          if (typed.length >= 3) { callBtn.classList.add('sch-ready'); await ctx.say('Und jetzt auf den grünen Hörer.'); }
        } else {
          localWrong++;
          const say = localWrong === 1
            ? 'Fast! Die Notrufnummer für Feuerwehr und Rettungswagen hat drei Ziffern. Sie beginnt mit der Eins.'
            : localWrong === 2 ? 'Schau, welche Taste leuchtet.' : `Die Nummer heißt ${S112}. Tipp die leuchtende Taste.`;
          await ctx.wrong(b, { keep: true, say });
          if (!ctx.active) return;
          if (localWrong >= 2) ctx.hint(keyBtns[target[typed.length]]);
          if (localWrong >= 3) ctx.modelShown = true;
        }
        busy = false;
      }));
      ctx.listen(callBtn, 'click', () => {
        if (typed.length < 3 || busy || !ctx.active) return;
        ctx.markTest(callBtn, false);
        resolve();
      });
    });
    if (!ctx.active) return;
    LT.sfx.play('pop');
    phone.classList.add('sch-ringing');
    display.textContent = '📞 112 …';
    await ctx.say(localWrong === 0 ? `Super, ${S112}. Es klingelt.` : 'Es klingelt.');
    if (!ctx.active) return;
    await ctx.sleep(600);
    if (!ctx.active) return;

    // 2) Gespräch mit der Leitstelle
    U.clear(phone);
    phone.classList.remove('sch-ringing');
    phone.classList.add('sch-talk');
    const bubble = el('div.sch-bubble', el('span.sch-who', '🎧'), el('span.sch-bt', ''));
    const ans = el('div.choices.sch-opts.sch-cardopts');
    phone.append(bubble, ans);
    storyBox.classList.add('sch-story-small');

    const name = (ctx.name || '').trim();
    const Q = [
      {
        q: 'Notruf, Feuerwehr und Rettungsdienst. Wer ruft an?',
        opts: [
          { e: '🙋', t: name ? `Ich heiße ${name}.` : 'Ich sage meinen ganzen Namen.', ok: true },
          { e: '🤷', t: 'Ich bin es!', why: 'Die Frau am Telefon kennt dich nicht. Sie braucht deinen Namen.' },
          { e: '😶', t: 'Rate mal!', why: 'Beim Notruf gibt es keine Rätsel. Sag ihr, wer du bist.' },
        ],
        hint: 'Wie heißt du?',
      },
      {
        q: 'Wo ist der Notfall?',
        opts: [
          { e: '📍', t: sc.wo.t, s: sc.wo.s, ok: true },
          { e: '👉', t: 'Hier draußen.', why: 'Die Frau am Telefon kann dich nicht sehen. Sie braucht die Straße oder den Ort.' },
          { e: '🤷', t: 'Das weiß ich nicht.', why: 'Schau dich um. Steht irgendwo ein Straßenschild oder ein bekanntes Haus?' },
        ],
        hint: 'Sag die Straße und was in der Nähe ist.',
      },
      {
        q: 'Was ist passiert?',
        opts: [
          { e: '🗣️', t: sc.was.t, ok: true },
          { e: '😱', t: 'Etwas ganz Schlimmes!', why: 'Sag genau, was passiert ist. Dann weiß sie, welche Hilfe kommen muss.' },
          { e: '🍦', t: 'Ich habe Hunger.', why: 'Das hat mit dem Notfall nichts zu tun.' },
        ],
        hint: 'Erzähl kurz, was du gesehen hast.',
      },
    ];
    if (ctx.flow > 0 || ctx.isReview) {
      Q.push({
        q: 'Wie viele Menschen sind verletzt?',
        opts: [
          { e: '🔢', t: sc.wieviel.t, ok: true },
          { e: '💯', t: 'Ganz viele!', why: 'Sag genau, was du siehst. Dann kommen genug Helfer.' },
          { e: '👋', t: 'Tschüss!', why: 'Leg noch nicht auf. Die Frau braucht noch eine Antwort.' },
        ],
        hint: 'Zähl, wie viele Menschen Hilfe brauchen.',
      });
    }
    Q.push({
      q: 'Bleib bitte am Telefon. Ich habe noch eine Frage.',
      opts: [
        { e: '👂', t: 'Ich warte und höre zu.', ok: true },
        { e: '📵', t: 'Ich lege schnell auf.', why: 'Wenn du auflegst, kann sie dich nichts mehr fragen. Sie beendet das Gespräch.' },
        { e: '🏃', t: 'Ich laufe weg.', why: 'Die Helfer brauchen dich noch. Bleib am Telefon.' },
      ],
      hint: 'Wer beendet beim Notruf das Gespräch?',
    });

    const praiseStep = U.chance(0.3) ? U.randInt(1, Q.length - 1) : -1;
    for (let i = 0; i < Q.length; i++) {
      const step = Q[i];
      if (!ctx.active) return;
      U.clear(ans);
      bubble.querySelector('.sch-bt').textContent = step.q;
      LT.ui.animate(bubble, 'joy');
      const before = ctx.wrongCount;
      await ctx.instruct(step.q);
      if (!ctx.active) return;
      const items = step.opts.map((o) => ({ content: cardContent(o), correct: !!o.ok, className: 'sch-card', say: o.s || o.t, why: o.why }));
      await ctx.choices(items, {
        container: ans,
        sayButton: true,
        nameFirst: ctx.flow < 0,
        hintAfter: 1,
        praise: false,
        correctSay: (it) => (i === praiseStep && ctx.wrongCount === before
          ? 'Genau! Du antwortest kurz und klar. So kann die Hilfe schnell kommen.'
          : `${okWord()}`),
        explain: (wr) => wr.why,
        hintSay: step.hint,
        modelSay: (r) => `Schau, diese Antwort hilft: ${r.say} Tipp sie an.`,
      });
      if (!ctx.active) return;
      await ctx.sleep(200);
    }
    if (!ctx.active) return;
    bubble.querySelector('.sch-bt').textContent = 'Danke! Die Hilfe ist unterwegs.';
    U.clear(ans);
    ans.appendChild(el('div.sch-helpcoming', U.emoji(sc.k === 'Notruf: Feuer' ? '🚒' : '🚑', 'sch-figemoji')));
    await ctx.say('Danke! Die Hilfe ist unterwegs. Du hast alles richtig gemacht. Wer? Wo? Was? Und dann warten.');
    if (!ctx.active) return;
    await ctx.sleep(400);
  }
})();
