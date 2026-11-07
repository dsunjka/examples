/* ==========================================================================
   Spiel „Sicher unterwegs“ (Verkehrserziehung, Schulweg – deutsche Regeln)

   Didaktik:
   - Vorbereitung auf den Schulweg: Fußgängerampel, sicheres Verhalten am
     Bordstein und Zebrastreifen, Sichtbarkeit im Dunkeln, Helm, Anschnallen,
     wichtige Verkehrszeichen (nach StVO) und „links – rechts – links“.
   - Fußgängerampel wie in Deutschland: rotes STEHENDES Männchen oben,
     grünes GEHENDES Männchen unten. Auch die wichtige Regel „Bei Rot wird
     gewartet – auch wenn kein Auto kommt“ (Vorbild für andere Kinder).
   - „Welches Kind macht es richtig?“: Zwei gezeichnete Szenen, die sich nur
     im Verhalten unterscheiden. Nach der Antwort nennt Flo die Regel und den
     Grund („Zwischen parkenden Autos sehen dich die Autofahrer nicht.“).
   - Verkehrszeichen sind vereinfacht, aber in Form und Farbe korrekt
     gezeichnet (Zeichen 350 Fußgängerüberweg, 239 Gehweg, 237 Radweg,
     206 Halt/Stopp, 136 Kinder, 224 Haltestelle).
   - Links – rechts – links: Das Kind steht (von hinten gesehen) am Bordstein,
     so stimmen links und rechts mit seiner eigenen Sicht überein. Erst wenn
     die Straße frei ist, wird gegangen. In Deutschland kommen die Autos auf
     der nahen Fahrbahnseite von links – darum zuerst nach links schauen.
   - Stufen: Ampel → richtig/falsch im Straßenverkehr → Verkehrszeichen →
     links-rechts-links beim Überqueren.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.w1;

  /* ======================================================================
     Fußgängerampel (viewBox 0 0 100 210)
     ====================================================================== */
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
  /** green = true → grünes Männchen leuchtet, sonst rotes. */
  function ampelMarkup(green) {
    const red = green ? '#4a2323' : '#ff3b30';
    const grn = green ? '#2ee86f' : '#1d3d29';
    return `
      <rect x="44" y="150" width="12" height="60" fill="#8a8f9c"/>
      <rect x="18" y="8" width="64" height="146" rx="12" fill="#2b2d42" stroke="#1a1b29" stroke-width="3"/>
      <rect x="25" y="16" width="50" height="62" rx="8" fill="#111"/>
      <rect x="25" y="84" width="50" height="62" rx="8" fill="#111"/>
      ${green ? '' : '<rect x="25" y="16" width="50" height="62" rx="8" fill="#ff3b30" opacity=".12"/>'}
      ${green ? '<rect x="25" y="84" width="50" height="62" rx="8" fill="#2ee86f" opacity=".12"/>' : ''}
      <g transform="translate(50 50) scale(1.55)">${manStand(red)}</g>
      <g transform="translate(50 118) scale(1.55)">${manWalk(grn)}</g>
      <rect x="22" y="12" width="56" height="4" rx="2" fill="#3c3f58"/>`;
  }
  const ampelNode = (green, cls) => W.svg('0 0 100 210', ampelMarkup(green), 'verk-ampel ' + (cls || ''));

  /* ======================================================================
     Bausteine für Straßenszenen (viewBox 0 0 240 160)
     ====================================================================== */
  const VB = '0 0 240 160';

  /** Kind von vorne (fy = Fußpunkt). o: helmet, vest, dark, run, stop, back, night */
  function kid(x, fy, o = {}) {
    const skin = o.skin || '#eebb8f';
    const hair = o.hair || '#3a2618';
    const shirt = o.dark ? '#262838' : o.vest ? '#ffd400' : (o.shirt || '#ff8a3d');
    const pants = o.dark ? '#191a24' : '#3d5a80';
    const legs = o.run
      ? `<polyline points="${x - 3},${fy - 15} ${x - 7},${fy - 7} ${x - 12},${fy - 3}" /><polyline points="${x + 3},${fy - 15} ${x + 7},${fy - 7} ${x + 6},${fy}" />`
      : `<line x1="${x - 4}" y1="${fy - 15}" x2="${x - 4}" y2="${fy}"/><line x1="${x + 4}" y1="${fy - 15}" x2="${x + 4}" y2="${fy}"/>`;
    const arms = o.run
      ? `<line x1="${x - 7}" y1="${fy - 29}" x2="${x - 15}" y2="${fy - 22}"/><line x1="${x + 7}" y1="${fy - 29}" x2="${x + 14}" y2="${fy - 37}"/>`
      : o.stop
        ? `<line x1="${x - 7}" y1="${fy - 29}" x2="${x - 13}" y2="${fy - 19}"/><line x1="${x + 7}" y1="${fy - 29}" x2="${x + 13}" y2="${fy - 19}"/>`
        : `<line x1="${x - 7}" y1="${fy - 29}" x2="${x - 10}" y2="${fy - 17}"/><line x1="${x + 7}" y1="${fy - 29}" x2="${x + 10}" y2="${fy - 17}"/>`;
    const armColor = o.dark ? '#262838' : skin;
    const reflect = o.vest
      ? `<rect x="${x - 8}" y="${fy - 25}" width="16" height="3" fill="#f2f6ff"/><rect x="${x - 8}" y="${fy - 19}" width="16" height="3" fill="#f2f6ff"/>
         ${o.night ? `<circle cx="${x}" cy="${fy - 24}" r="20" fill="#fff6a0" opacity=".25"/>` : ''}`
      : '';
    const face = o.back
      ? `<circle cx="${x}" cy="${fy - 41}" r="8.4" fill="${hair}"/>`
      : `<path d="M${x - 8.4} ${fy - 42} Q${x} ${fy - 54} ${x + 8.4} ${fy - 42} Q${x} ${fy - 47} ${x - 8.4} ${fy - 42} Z" fill="${hair}"/>
         <circle cx="${x - 3}" cy="${fy - 41}" r="1.2" fill="#2b2d42"/><circle cx="${x + 3}" cy="${fy - 41}" r="1.2" fill="#2b2d42"/>
         <path d="M${x - 2.5} ${fy - 37.5} Q${x} ${fy - 35.5} ${x + 2.5} ${fy - 37.5}" stroke="#7a3b2e" stroke-width="1" fill="none"/>`;
    const helmet = o.helmet
      ? `<path d="M${x - 10} ${fy - 42} A10 10 0 0 1 ${x + 10} ${fy - 42} Z" fill="#e53935" stroke="#a52824" stroke-width="1.2"/>
         <path d="M${x - 4} ${fy - 50} L${x - 2} ${fy - 44} M${x + 3} ${fy - 50} L${x + 4} ${fy - 44}" stroke="#ffffff" stroke-width="1.2" opacity=".8"/>
         <path d="M${x - 8} ${fy - 42} Q${x} ${fy - 31} ${x + 8} ${fy - 42}" stroke="#333" stroke-width="1" fill="none"/>`
      : '';
    return `<g class="verk-kid">
      <g stroke="${pants}" stroke-width="5" stroke-linecap="round" fill="none">${legs}</g>
      <g stroke="${armColor}" stroke-width="4" stroke-linecap="round">${arms}</g>
      <rect x="${x - 8}" y="${fy - 33}" width="16" height="19" rx="4" fill="${shirt}"/>
      ${reflect}
      <circle cx="${x}" cy="${fy - 41}" r="8" fill="${skin}"/>${face}${helmet}
    </g>`;
  }

  /** Auto von der Seite. x = Mitte, by = Unterkante der Räder, dir 1 = fährt nach rechts. */
  function car(x, by, color, dir = 1, o = {}) {
    const s = o.s || 1;
    const beam = o.beam
      ? `<polygon points="28,-14 110,-34 110,10" fill="#fff6a0" opacity=".35"/>`
      : '';
    return `<g transform="translate(${x} ${by}) scale(${dir * s} ${s})">
      ${beam}
      <path d="M-28 -8 Q-29 -18 -20 -19 L-12 -20 L-6 -31 Q-4 -33 0 -33 L13 -33 Q16 -33 18 -30 L23 -20 Q29 -19 29 -12 L29 -8 Z" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
      <path d="M-9 -21 L-4 -30 L4 -30 L4 -21 Z M7 -21 L7 -30 L13 -30 Q15 -30 16 -28 L20 -21 Z" fill="#cfe9ff" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>
      <rect x="25" y="-17" width="4" height="4" rx="1" fill="${o.beam ? '#fff6a0' : '#ffe9a8'}"/>
      <rect x="-28" y="-16" width="3" height="4" rx="1" fill="#ff5a4f"/>
      <circle cx="-16" cy="-6" r="6" fill="#2b2d42"/><circle cx="-16" cy="-6" r="2.6" fill="#b7bccb"/>
      <circle cx="17" cy="-6" r="6" fill="#2b2d42"/><circle cx="17" cy="-6" r="2.6" fill="#b7bccb"/>
    </g>`;
  }

  /** Straßen-Hintergrund. Fahrbahn y 52–112, Bordstein y 112, Gehweg darunter. */
  function street(o = {}) {
    const n = o.night;
    const sky = n ? '#1b2340' : '#cdeeff';
    const walk = n ? '#5c6070' : '#dcdde3';
    const road = n ? '#33363f' : '#666b78';
    const houses = n
      ? `<rect x="14" y="8" width="44" height="30" fill="#2b3150"/><rect x="24" y="16" width="9" height="8" fill="#ffd95a"/><rect x="40" y="16" width="9" height="8" fill="#2b3150" stroke="#454c70"/>
         <rect x="150" y="4" width="58" height="34" fill="#2b3150"/><rect x="162" y="12" width="9" height="8" fill="#ffd95a"/><rect x="186" y="12" width="9" height="8" fill="#ffd95a"/>
         <circle cx="222" cy="12" r="6" fill="#f5f0c8"/>`
      : `<rect x="14" y="8" width="44" height="30" fill="#f4c27a"/><polygon points="10,10 36,-6 62,10" fill="#d9644a"/><rect x="24" y="16" width="9" height="8" fill="#fff"/><rect x="40" y="16" width="9" height="8" fill="#fff"/>
         <rect x="150" y="6" width="58" height="32" fill="#9fc6e8"/><rect x="162" y="13" width="9" height="8" fill="#fff"/><rect x="186" y="13" width="9" height="8" fill="#fff"/>
         <circle cx="108" cy="22" r="10" fill="#5cbf60"/><rect x="106" y="28" width="4" height="10" fill="#8b5a2b"/>`;
    return `<rect width="240" height="160" fill="${sky}"/>${houses}
      <rect y="38" width="240" height="14" fill="${walk}"/>
      <rect y="52" width="240" height="60" fill="${road}"/>
      <path d="M0 82 H240" stroke="${n ? '#8a8d96' : '#fff'}" stroke-width="2.5" stroke-dasharray="14 10"/>
      <rect y="112" width="240" height="48" fill="${walk}"/>
      <rect y="110" width="240" height="5" fill="${n ? '#80838f' : '#b4b7c2'}"/>
      <path d="M0 136 H240" stroke="${n ? '#666a78' : '#c9cbd3'}" stroke-width="1"/>
      ${o.zebra != null ? zebra(o.zebra) : ''}${o.furt != null ? furt(o.furt) : ''}`;
  }
  function zebra(x) {
    let s = '';
    for (let y = 55; y < 110; y += 10) s += `<rect x="${x}" y="${y}" width="44" height="6" fill="#ffffff" opacity=".95"/>`;
    return s;
  }
  /** Fußgängerfurt an einer Ampel: zwei Reihen weißer Quadrate (kein Zebrastreifen!). */
  function furt(x) {
    let s = '';
    for (let y = 54; y < 110; y += 8) s += `<rect x="${x}" y="${y}" width="4" height="4" fill="#fff"/><rect x="${x + 40}" y="${y}" width="4" height="4" fill="#fff"/>`;
    return s;
  }
  function bike(x, by) {
    return `<g stroke="#2b2d42" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="${x - 20}" cy="${by - 10}" r="10"/><circle cx="${x + 20}" cy="${by - 10}" r="10"/>
      <polyline points="${x - 20},${by - 10} ${x - 2},${by - 10} ${x - 8},${by - 28} ${x - 20},${by - 10}" stroke="#3dbe6b" stroke-width="3"/>
      <polyline points="${x - 2},${by - 10} ${x + 12},${by - 28} ${x - 8},${by - 28}" stroke="#3dbe6b" stroke-width="3"/>
      <line x1="${x + 12}" y1="${by - 28}" x2="${x + 20}" y2="${by - 10}"/>
      <line x1="${x + 10}" y1="${by - 34}" x2="${x + 12}" y2="${by - 28}"/><line x1="${x + 6}" y1="${by - 34}" x2="${x + 15}" y2="${by - 34}"/>
    </g>`;
  }
  function ball(x, y) {
    return `<circle cx="${x}" cy="${y}" r="6" fill="#fff" stroke="#2b2d42" stroke-width="1.2"/>
      <path d="M${x - 2} ${y - 3} l3 -1 l2 2.5 l-1.5 3 l-3 0 Z" fill="#2b2d42"/>
      <path d="M${x - 14} ${y + 2} h6 M${x - 16} ${y - 2} h5" stroke="#fff" stroke-width="1.2" opacity=".8"/>`;
  }
  function miniAmpel(x, by, green) {
    return `<g transform="translate(${x - 9} ${by - 62}) scale(0.18 0.3)">${ampelMarkup(green)}</g>`;
  }

  /* ======================================================================
     Stufe 2: Welches Kind macht es richtig?  (safe = sicheres Verhalten)
     ====================================================================== */
  const SCENES = [
    {
      id: 'helm', q: 'Welches Kind fährt sicher Fahrrad?',
      learn: 'Richtig! Mit dem Helm ist dein Kopf geschützt. Setz ihn beim Fahrradfahren immer auf.',
      bad: 'Oh! Ohne Helm kann sich das Kind bei einem Sturz am Kopf wehtun.',
      draw: (safe) => `<rect width="240" height="160" fill="#cdeeff"/><rect y="100" width="240" height="60" fill="#9ad66b"/>
        <rect y="112" width="240" height="26" fill="#e4c99a"/><circle cx="200" cy="30" r="14" fill="#ffd54a"/>
        <circle cx="40" cy="80" r="20" fill="#5cbf60"/><rect x="37" y="92" width="6" height="16" fill="#8b5a2b"/>
        ${kid(114, 126, { helmet: safe, shirt: '#8e6cef', hair: '#c98a2e' })}${bike(120, 134)}`,
    },
    {
      id: 'bordstein', q: 'Da kommt ein Auto. Welches Kind macht es richtig?',
      learn: 'Richtig! Am Bordstein bleibst du stehen und schaust, ob ein Auto kommt.',
      bad: 'Oh, das ist gefährlich! Das Kind rennt einfach auf die Straße.',
      draw: (safe) => street() + car(50, 108, '#e53935', 1) + (safe ? kid(160, 138, { stop: true }) : kid(160, 102, { run: true })),
    },
    {
      id: 'zebra', q: 'Welches Kind geht richtig über die Straße?',
      learn: 'Richtig! Am Zebrastreifen gehst du über die Straße. Warte, bis die Autos angehalten haben.',
      bad: 'Oh! Das Kind geht nicht über den Zebrastreifen. Das ist gefährlich.',
      draw: (safe) => street({ zebra: 160 }) + car(110, 108, '#4a90e2', 1) + (safe ? kid(182, 100) : kid(56, 96, { run: true })),
    },
    {
      id: 'parken', q: 'Welches Kind geht sicher über die Straße?',
      learn: 'Richtig! Zwischen parkenden Autos sehen dich die Autofahrer nicht. Geh lieber am Zebrastreifen über die Straße.',
      bad: 'Oh! Zwischen den parkenden Autos sieht der Autofahrer das Kind nicht.',
      draw: (safe) => street({ zebra: 186 }) + car(40, 80, '#3dbe6b', 1) +
        (safe ? car(64, 112, '#f2b705', 1) + car(126, 112, '#8e6cef', 1) + kid(208, 100)
          : car(64, 112, '#f2b705', 1) + kid(96, 108, { run: true }) + car(130, 112, '#8e6cef', 1)),
    },
    {
      id: 'ball', q: 'Oh, der Ball rollt auf die Straße! Welches Kind macht es richtig?',
      learn: 'Richtig! Bleib stehen und lauf nicht hinterher. Ein Erwachsener holt den Ball.',
      bad: 'Oh, das ist gefährlich! Das Kind rennt dem Ball hinterher, und ein Auto kommt.',
      draw: (safe) => street() + ball(120, 90) + car(40, 108, '#e53935', 1) + (safe ? kid(150, 138, { stop: true }) : kid(152, 102, { run: true })),
    },
    {
      id: 'dunkel', q: 'Es ist dunkel. Welches Kind sehen die Autofahrer gut?',
      learn: 'Richtig! Helle Kleidung und Leuchtstreifen sieht man im Dunkeln schon von weitem.',
      bad: 'Hm, das Kind in dunkler Kleidung sieht man im Dunkeln kaum.',
      draw: (safe) => street({ night: true }) + car(46, 106, '#4a90e2', 1, { beam: true }) +
        kid(166, 140, safe ? { vest: true, night: true } : { dark: true, hair: '#1f1a17', skin: '#7d5a40' }),
    },
    {
      id: 'gehweg', q: 'Welches Kind geht an der richtigen Stelle?',
      learn: 'Richtig! Zu Fuß gehst du auf dem Gehweg.',
      bad: 'Oh! Das Kind läuft auf der Fahrbahn. Da fahren die Autos.',
      draw: (safe) => street() + car(48, 108, '#f2b705', 1) + (safe ? kid(140, 146) : kid(140, 106)),
    },
    {
      id: 'gurt', q: 'Welches Kind ist im Auto richtig angeschnallt?',
      learn: 'Richtig! Im Auto schnallst du dich immer an. Kinder sitzen auf einem Kindersitz.',
      bad: 'Oh! Dieses Kind hat keinen Gurt an. Das ist gefährlich.',
      draw: (safe) => `<rect width="240" height="160" fill="#cdeeff"/><rect y="128" width="240" height="32" fill="#666b78"/>
        <g transform="translate(120 140)">
          <path d="M-100 -12 Q-102 -46 -76 -50 L-52 -54 L-30 -94 Q-26 -100 -18 -100 L40 -100 Q48 -100 54 -92 L78 -56 Q102 -52 102 -32 L102 -12 Z" fill="#4a90e2" stroke="#2f6db5" stroke-width="2"/>
          <path d="M-40 -58 L-22 -90 L18 -90 L18 -58 Z" fill="#dff1ff" stroke="#2f6db5" stroke-width="2"/>
          <path d="M24 -58 L24 -90 L42 -90 Q46 -90 50 -84 L66 -58 Z" fill="#dff1ff" stroke="#2f6db5" stroke-width="2"/>
          <rect x="-12" y="-80" width="26" height="24" rx="5" fill="#555a6e"/>
          <circle cx="1" cy="-79" r="8" fill="#eebb8f"/><path d="M-7 -81 Q1 -92 9 -81 Q1 -85 -7 -81 Z" fill="#3a2618"/>
          <circle cx="-2" cy="-79" r="1.1" fill="#2b2d42"/><circle cx="4" cy="-79" r="1.1" fill="#2b2d42"/>
          <rect x="-7" y="-70" width="16" height="12" rx="3" fill="#ff8a3d"/>
          ${safe ? '<line x1="-8" y1="-71" x2="9" y2="-58" stroke="#1d1f2b" stroke-width="3.2" stroke-linecap="round"/><rect x="6" y="-61" width="5" height="4" rx="1" fill="#c9ccd6"/>' : ''}
          <circle cx="-60" cy="-12" r="16" fill="#2b2d42"/><circle cx="-60" cy="-12" r="7" fill="#b7bccb"/>
          <circle cx="62" cy="-12" r="16" fill="#2b2d42"/><circle cx="62" cy="-12" r="7" fill="#b7bccb"/>
          <rect x="94" y="-44" width="8" height="8" rx="2" fill="#ffe9a8"/>
        </g>`,
    },
    {
      id: 'ampel', q: 'Die Ampel zeigt das rote Männchen. Welches Kind macht es richtig?',
      learn: 'Richtig! Beim roten Männchen bleibst du stehen und wartest auf Grün.',
      bad: 'Oh! Das Kind geht bei Rot über die Straße. Das ist gefährlich.',
      draw: (safe) => street({ furt: 120 }) + miniAmpel(196, 128, false) + car(50, 108, '#3dbe6b', 1) +
        (safe ? kid(142, 138, { stop: true }) : kid(142, 100)),
    },
  ];

  /* ======================================================================
     Stufe 3: Verkehrszeichen (viewBox 0 0 100 100), nach StVO vereinfacht
     ====================================================================== */
  function octagon(r, cx = 50, cy = 50) {
    return U.range(0, 7).map((i) => {
      const a = Math.PI / 8 + i * Math.PI / 4;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
  }
  const blueCircle = '<circle cx="50" cy="50" r="46" fill="#1f5fbf"/><circle cx="50" cy="50" r="42.5" fill="none" stroke="#fff" stroke-width="3"/>';
  const SIGNS = {
    zebra: {
      name: 'den Zebrastreifen', title: 'Fußgängerüberweg',
      q1: 'Tippe auf das Schild für den Zebrastreifen.',
      q2: 'Hier dürfen Fußgänger über die Straße, und die Autos müssen anhalten. Welches Schild passt?',
      learn: 'Das Schild zeigt einen Zebrastreifen. Hier dürfen Fußgänger über die Straße gehen. Die Autos müssen anhalten und warten.',
      svg: `<rect x="4" y="4" width="92" height="92" rx="7" fill="#1f5fbf"/><rect x="8" y="8" width="84" height="84" rx="5" fill="none" stroke="#fff" stroke-width="3"/>
        <polygon points="50,14 88,84 12,84" fill="#fff"/>
        <g fill="#111"><rect x="30" y="74" width="7" height="6"/><rect x="40" y="74" width="7" height="6"/><rect x="50" y="74" width="7" height="6"/><rect x="60" y="74" width="7" height="6"/></g>
        <g transform="translate(50 56) scale(1.05)">${manWalk('#111')}</g>`,
    },
    gehweg: {
      name: 'den Gehweg', title: 'Gehweg',
      q1: 'Tippe auf das Schild für den Gehweg.',
      q2: 'Hier gehen Fußgänger. Autos dürfen hier nicht fahren. Welches Schild passt?',
      learn: 'Das ist das Schild für den Gehweg. Hier gehen die Fußgänger.',
      svg: `${blueCircle}<g fill="#fff" stroke="#fff" stroke-linecap="round">
        <circle cx="40" cy="26" r="6" stroke="none"/>
        <path d="M33 36 L47 36 L52 62 L28 62 Z" stroke-width="2" stroke-linejoin="round"/>
        <line x1="35" y1="62" x2="35" y2="78" stroke-width="5"/><line x1="45" y1="62" x2="45" y2="78" stroke-width="5"/>
        <line x1="47" y1="40" x2="57" y2="52" stroke-width="4"/>
        <circle cx="62" cy="44" r="4.6" stroke="none"/>
        <line x1="62" y1="51" x2="62" y2="64" stroke-width="7"/>
        <line x1="59.5" y1="65" x2="58" y2="78" stroke-width="4"/><line x1="64.5" y1="65" x2="66" y2="78" stroke-width="4"/>
        <line x1="66" y1="54" x2="70" y2="61" stroke-width="3.5"/></g>`,
    },
    radweg: {
      name: 'den Radweg', title: 'Radweg',
      q1: 'Tippe auf das Schild für den Radweg.',
      q2: 'Hier fahren Fahrräder. Welches Schild passt?',
      learn: 'Das ist das Schild für den Radweg. Hier fahren die Fahrräder.',
      svg: `${blueCircle}<g stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="30" cy="62" r="13"/><circle cx="70" cy="62" r="13"/>
        <polyline points="30,62 47,62 40,42 30,62"/><polyline points="47,62 62,42 40,42"/>
        <line x1="62" y1="42" x2="70" y2="62"/><line x1="60" y1="34" x2="62" y2="42"/><line x1="55" y1="34" x2="66" y2="34"/>
        <line x1="36" y1="38" x2="45" y2="38"/></g>`,
    },
    stopp: {
      name: 'das Stoppschild', title: 'Stopp',
      q1: 'Tippe auf das Stoppschild.',
      q2: 'Bei diesem Schild müssen alle Autos ganz anhalten. Welches Schild ist das?',
      learn: 'Das ist das Stoppschild. Hier müssen alle Fahrzeuge ganz anhalten.',
      svg: `<polygon points="${octagon(47)}" fill="#fff"/><polygon points="${octagon(43)}" fill="#d32f2f"/>
        <text x="50" y="60" text-anchor="middle" font-size="27" font-weight="700" fill="#fff" font-family="Arial, Helvetica, sans-serif" letter-spacing="1">STOP</text>`,
    },
    kinder: {
      name: 'das Schild Achtung Kinder', title: 'Achtung, Kinder',
      q1: 'Tippe auf das Schild: Achtung, Kinder!',
      q2: 'Dieses Schild sagt den Autofahrern: Vorsicht, hier sind oft Kinder! Welches Schild ist das?',
      learn: 'Das Schild warnt die Autofahrer: Achtung, Kinder! Hier müssen sie besonders vorsichtig fahren.',
      svg: `<polygon points="50,6 96,88 4,88" fill="#d32f2f" stroke="#d32f2f" stroke-width="4" stroke-linejoin="round"/>
        <polygon points="50,22 83,80 17,80" fill="#fff"/>
        <g stroke="#111" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="42" y1="48" x2="40" y2="62" stroke-width="5.5"/>
          <polyline points="41,51 34,56" stroke-width="3"/><polyline points="42,51 49,55" stroke-width="3"/>
          <polyline points="40,62 35,68 33,75" stroke-width="3.4"/><polyline points="40,62 45,68 47,75" stroke-width="3.4"/>
          <line x1="59" y1="56" x2="58" y2="66" stroke-width="5"/>
          <polyline points="59,58 53,62" stroke-width="2.6"/><polyline points="59,58 65,61" stroke-width="2.6"/>
          <polyline points="58,66 54,71 53,76" stroke-width="3"/><polyline points="58,66 62,71 64,76" stroke-width="3"/>
        </g><circle cx="43" cy="42" r="4" fill="#111"/><circle cx="60" cy="50.5" r="3.4" fill="#111"/>`,
    },
    haltestelle: {
      name: 'die Haltestelle', title: 'Haltestelle',
      q1: 'Tippe auf das Schild für die Bushaltestelle.',
      q2: 'Hier hält der Bus. Welches Schild passt?',
      learn: 'Das ist das Schild für die Haltestelle. Hier hält der Bus.',
      svg: `<circle cx="50" cy="50" r="46" fill="#2e9e4a"/><circle cx="50" cy="50" r="38" fill="#ffd400"/>
        <text x="50" y="66" text-anchor="middle" font-size="46" font-weight="700" fill="#2e9e4a" font-family="Arial, Helvetica, sans-serif">H</text>`,
    },
  };
  const signNode = (id) => W.svg('0 0 100 100', SIGNS[id].svg, 'verk-sign');

  /* ======================================================================
     Spiel
     ====================================================================== */
  LT.registerGame({
    id: 'verkehr',
    area: 'welt',
    title: 'Sicher unterwegs',
    icon: '🚦',
    levels: 4,
    rounds: 4,
    parent: {
      skill: 'Verkehrserziehung & Schulweg',
      goal: 'Ihr Kind lernt die Fußgängerampel, sicheres Verhalten an Straße, Bordstein und Zebrastreifen, Sichtbarkeit im Dunkeln, Helm und Anschnallen, wichtige Verkehrszeichen und das Überqueren mit „links – rechts – links“. Flo nennt jedes Mal die Regel und den Grund.',
      levels: [
        'Fußgängerampel: rotes stehendes / grünes gehendes Männchen – auch: Bei Rot warten, wenn kein Auto kommt',
        'Welches Kind macht es richtig? (Bordstein, Zebrastreifen, parkende Autos, Ball, Dunkelheit, Helm, Gurt …)',
        'Verkehrszeichen: Fußgängerüberweg, Gehweg, Radweg, Stopp, Achtung Kinder, Haltestelle',
        'Links – rechts – links schauen und nur bei freier Straße gehen',
      ],
      tip: 'Üben Sie den Schulweg gemeinsam, lange vor dem ersten Schultag – zuerst Sie als Vorbild, dann Ihr Kind als „Lotse“. Benennen Sie unterwegs Schilder und gefährliche Stellen. Kinder unter 8 Jahren können Geschwindigkeiten und Entfernungen von Autos noch nicht sicher einschätzen.',
    },

    async task(ctx) {
      if (ctx.level === 1) return ampelTask(ctx);
      if (ctx.level === 2) return sceneTask(ctx);
      if (ctx.level === 3) return signTask(ctx);
      return crossTask(ctx);
    },
  });

  const GO = { content: '🚶', say: 'Gehen', label: 'Gehen' };
  const WAIT = { content: '✋', say: 'Warten', label: 'Warten' };

  /** Stufe 1: Fußgängerampel. */
  async function ampelTask(ctx) {
    const kind = U.pickFresh('verk-a', ['single', 'single', 'two', 'nocar'], 2);
    if (kind === 'two') {
      const wantGo = U.chance(0.5);
      const q = wantGo ? 'Bei welcher Ampel darfst du gehen?' : 'Bei welcher Ampel musst du warten?';
      ctx.stage.appendChild(el('div.w1-prompt', U.emoji('🚦'), el('span.w1-q', q)));
      const items = [true, false].map((g) => ({
        content: ampelNode(g),
        correct: g === wantGo,
        className: 'verk-ampel-tile',
        aria: g ? 'grünes Männchen' : 'rotes Männchen',
        value: g,
      }));
      ctx.instruct(q);
      await ctx.choices(items, {
        correctSay: () => wantGo ? 'Richtig! Beim grünen Männchen darfst du gehen.' : 'Richtig! Beim roten Männchen musst du warten.',
        wrongSay: (it) => it.value ? 'Hier ist das grüne Männchen. Da darfst du gehen.' : 'Hier ist das rote Männchen. Da musst du warten.',
        hintSay: wantGo ? 'Such das grüne Männchen. Es geht los.' : 'Such das rote Männchen. Es steht still.',
      });
      return;
    }
    const green = kind === 'nocar' ? false : U.chance(0.5);
    const q = kind === 'nocar'
      ? 'Die Ampel ist rot. Es kommt gar kein Auto. Darfst du trotzdem gehen?'
      : 'Darfst du jetzt gehen?';
    const row = el('div.verk-ampel-row' + (kind === 'nocar' ? '.with-street' : ''), ampelNode(green, 'verk-ampel-big'),
      kind === 'nocar' ? el('div.verk-empty', W.svg('0 0 240 160', street(), 'verk-mini-street')) : null);
    ctx.stage.appendChild(row);
    const box = el('div.choices.verk-go-choices');
    ctx.stage.appendChild(box);
    ctx.instruct(q + ' Gehen oder warten?');
    await ctx.choices([
      Object.assign({ correct: green }, GO),
      Object.assign({ correct: !green }, WAIT),
    ], {
      container: box,
      shuffle: false,
      nameFirst: ctx.index === 0,
      correctSay: () => kind === 'nocar'
        ? 'Richtig! Bei Rot wartest du immer – auch wenn kein Auto kommt. Andere Kinder machen es dir nach.'
        : green ? 'Richtig! Das grüne Männchen geht – du darfst gehen. Schau trotzdem nach Autos.' : 'Richtig! Das rote Männchen steht – du bleibst stehen und wartest.',
      wrongSay: () => green ? 'Schau genau: Das grüne Männchen leuchtet. Es geht los.' : 'Schau genau: Das rote Männchen leuchtet. Es steht still.',
    });
  }

  /** Stufe 2: Welches Kind macht es richtig? */
  async function sceneTask(ctx) {
    const sc = U.pickFresh('verk-scene', SCENES, 5, (s) => s.id);
    ctx.stage.appendChild(el('div.w1-prompt', U.emoji('🤔'), el('span.w1-q', sc.q)));
    const box = el('div.choices.verk-choices');
    ctx.stage.appendChild(box);
    const items = [true, false].map((safe) => ({
      content: W.svg(VB, sc.draw(safe), 'verk-scene'),
      correct: safe,
      className: 'verk-tile',
      aria: safe ? 'richtig' : 'gefährlich',
    }));
    ctx.instruct(sc.q);
    await ctx.choices(items, {
      container: box,
      correctSay: () => sc.learn,
      wrongSay: () => sc.bad,
      hintSay: 'Schau mal, dieses Kind macht es richtig.',
    });
  }

  /** Stufe 3: Verkehrszeichen erkennen. */
  async function signTask(ctx) {
    const ids = Object.keys(SIGNS);
    const target = U.pickFresh('verk-sign', ids, 3);
    const S = SIGNS[target];
    const q = U.chance(0.5) ? S.q1 : S.q2;
    const others = U.sample(ids.filter((i) => i !== target), 2);
    ctx.stage.appendChild(el('div.w1-prompt', U.emoji('🚸'), el('span.w1-q', q)));
    const items = [target].concat(others).map((id) => ({
      content: signNode(id),
      correct: id === target,
      className: 'verk-sign-tile',
      aria: SIGNS[id].title,
      value: id,
    }));
    ctx.instruct(q);
    await ctx.choices(items, {
      size: 'large',
      correctSay: () => `Richtig! ${S.learn}`,
      wrongSay: (it) => `Das ist ${SIGNS[it.value].name}. Probier es nochmal.`,
      hintSay: `Hier ist ${S.name}.`,
    });
  }

  /* ---------- Stufe 4: Links – rechts – links ---------- */
  function crossMarkup() {
    // Kind von hinten am Bordstein; Blick-Kegel (links/rechts) und Auto werden per Klasse gesteuert
    return street({ zebra: null }) +
      `<polygon class="verk-look verk-look-l" points="120,104 0,56 0,112" fill="#fff59d" opacity="0"/>
       <polygon class="verk-look verk-look-r" points="120,104 240,56 240,112" fill="#fff59d" opacity="0"/>
       <g class="verk-car verk-car-l" style="transform: translate(-60px, 0)">${car(0, 108, '#e53935', 1)}</g>
       <g class="verk-car verk-car-r" style="transform: translate(300px, 0)">${car(0, 80, '#4a90e2', -1)}</g>
       <g class="verk-walker">${kid(120, 140, { back: true, shirt: '#3dbe6b' })}
       </g>`;
  }

  async function crossTask(ctx) {
    const carSide = U.pick([null, 'l', 'r']); // kommt am Ende ein Auto? von welcher Seite?
    ctx.stage.classList.add('verk-cross-stage');
    const prompt = el('div.w1-prompt', U.emoji('👀'), el('span.w1-q', 'Links – rechts – links'));
    ctx.stage.appendChild(prompt);
    const svg = W.svg(VB, crossMarkup(), 'verk-cross');
    const wrap = el('div.verk-cross-wrap', svg);
    ctx.stage.appendChild(wrap);
    const bar = el('div.verk-bar');
    ctx.stage.appendChild(bar);

    const look = (side) => {
      svg.querySelectorAll('.verk-look').forEach((n) => n.setAttribute('opacity', '0'));
      if (side) svg.querySelector('.verk-look-' + side).setAttribute('opacity', '0.45');
    };
    const LEFT = { content: '⬅️', say: 'links', label: 'links' };
    const RIGHT = { content: '➡️', say: 'rechts', label: 'rechts' };

    async function step(want, text, ok) {
      if (!ctx.active) return;
      U.clear(bar);
      const box = el('div.choices.verk-arrows');
      bar.appendChild(box);
      ctx.instruct(text);
      await ctx.choices([
        Object.assign({ correct: want === 'l', value: 'l' }, LEFT),
        Object.assign({ correct: want === 'r', value: 'r' }, RIGHT),
      ], {
        container: box,
        shuffle: false,
        correctSay: ok,
        wrongSay: 'Erst links, dann rechts, dann noch einmal links.',
        onCorrect: () => look(want),
      });
    }

    await step('l', 'Du willst über die Straße und stehst am Bordstein. Wohin schaust du zuerst? Tippe auf den Pfeil.', 'Richtig! Zuerst nach links.');
    await step('r', 'Und wohin schaust du jetzt?', 'Genau! Jetzt nach rechts.');
    await step('l', 'Und dann?', 'Super! Noch einmal nach links.');
    if (!ctx.active) return;

    // Kommt ein Auto?
    const carEl = carSide ? svg.querySelector('.verk-car-' + carSide) : null;
    if (carEl) {
      look(carSide);
      carEl.style.transition = 'transform ' + (1.2 * LT.config.speed + 0.01) + 's ease-out';
      carEl.style.transform = carSide === 'l' ? 'translate(30px, 0)' : 'translate(205px, 0)';
      await ctx.sleep(900);
    }
    async function decide(carNow) {
      U.clear(bar);
      const box = el('div.choices.verk-go-choices');
      bar.appendChild(box);
      const q = carNow ? 'Oh, da kommt ein Auto! Darfst du jetzt gehen?' : 'Die Straße ist frei. Darfst du jetzt gehen?';
      prompt.querySelector('.w1-q').textContent = carNow ? 'Da kommt ein Auto!' : 'Die Straße ist frei.';
      ctx.instruct(q);
      await ctx.choices([
        Object.assign({ correct: !carNow }, GO),
        Object.assign({ correct: carNow }, WAIT),
      ], {
        container: box,
        shuffle: false,
        correctSay: () => carNow ? 'Richtig! Du wartest, bis das Auto vorbei ist.' : 'Richtig! Jetzt gehst du zügig geradeaus über die Straße.',
        wrongSay: () => carNow ? 'Halt! Das Auto ist noch da. Warte lieber.' : 'Die Straße ist frei. Du darfst jetzt gehen.',
      });
    }
    if (carEl) {
      await decide(true);
      if (!ctx.active) return;
      carEl.style.transition = 'transform ' + (1.4 * LT.config.speed + 0.01) + 's ease-in';
      carEl.style.transform = carSide === 'l' ? 'translate(320px, 0)' : 'translate(-80px, 0)';
      await ctx.sleep(1500);
      look(null);
    }
    look(null);
    await decide(false);
    if (!ctx.active) return;
    // Kind geht über die Straße
    const walker = svg.querySelector('.verk-walker');
    walker.style.transition = 'transform ' + (1.6 * LT.config.speed + 0.01) + 's linear';
    walker.style.transform = 'translate(0, -96px)';
    await ctx.sleep(1700);
  }

  // Für Sichtprüfung
  W.verkehr = { SCENES, SIGNS, ampelNode, signNode };
})();
