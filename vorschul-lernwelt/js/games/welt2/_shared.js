/* ==========================================================================
   Gemeinsame Helfer der Spielgruppe 'welt2' (Tier-Wissen, Jahreszeiten & Tage, Die Uhr).

   Didaktischer Grundgedanke der Gruppe: Sachwissen wird über klare, selbst
   gezeichnete Szenen vermittelt (Jahreszeiten-Baum, Tageszeiten-Himmel,
   Lebensraum-Kacheln, analoge Uhr). Die Bilder tragen die Bedeutung, die
   Beschriftung ist nur Ergänzung für Erwachsene – vorgelesen wird alles.

   LT.w2.svg(markup, viewBox, cls)   → SVG-Element aus Markup
   LT.w2.seasonScene(id)             → Baum-Szene je Jahreszeit (SVG)
   LT.w2.dayScene(id)                → Himmel/Haus-Szene je Tageszeit (SVG)
   LT.w2.habitatScene(id)            → Lebensraum-Szene (Emoji-Komposition)
   LT.w2.sceneTile(node, label)      → Kachel-Inhalt (Szene + Beschriftung)
   LT.w2.clock(h, m, opts)           → analoge Uhr (SVG) mit setTime()
   LT.w2.timeWords(h, m)             → { say: 'halb vier', text: 'halb 4' }
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const W = {};
  let uid = 0;

  /** SVG aus Markup erzeugen. */
  W.svg = function (markup, viewBox, cls) {
    const box = document.createElement('div');
    box.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="${cls || ''}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${markup}</svg>`;
    return box.firstChild;
  };

  /* ------------------------------------------------------------------
     Jahreszeiten: derselbe Baum in vier Jahreszeiten (viewBox 0 0 120 100)
     Kinder erkennen Jahreszeiten am besten an der Natur vor der Haustür.
     ------------------------------------------------------------------ */
  W.SEASONS = [
    { id: 'fruehling', name: 'Frühling', dat: 'im Frühling' },
    { id: 'sommer', name: 'Sommer', dat: 'im Sommer' },
    { id: 'herbst', name: 'Herbst', dat: 'im Herbst' },
    { id: 'winter', name: 'Winter', dat: 'im Winter' },
  ];
  W.season = (id) => W.SEASONS.find((s) => s.id === id);

  W.seasonScene = function (id) {
    const trunk = '<path d="M56 88 L57 58 L52 50 L55 49 L59 55 L60 44 L63 44 L63 55 L68 48 L70 50 L64 59 L65 88 Z" fill="#8a5a3b"/>';
    let m = '';
    if (id === 'fruehling') {
      m += '<rect width="120" height="100" fill="#d6f0ff"/>';
      m += '<circle cx="100" cy="16" r="9" fill="#ffd84d"/>';
      m += '<rect y="82" width="120" height="18" fill="#9bdc6f"/>';
      m += trunk;
      m += '<g fill="#a8e27f"><circle cx="48" cy="40" r="15"/><circle cx="72" cy="38" r="16"/><circle cx="60" cy="27" r="16"/></g>';
      const blossoms = [[44, 34], [52, 44], [58, 22], [66, 32], [76, 42], [70, 24], [48, 26], [62, 42], [80, 34], [40, 42]];
      m += blossoms.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#ff8fc0" stroke="#fff" stroke-width="1"/>`).join('');
      // Tulpen auf der Wiese
      [[14, '#ff5a6e'], [26, '#ffcf3a'], [92, '#b06cff'], [106, '#ff5a6e']].forEach(([x, c]) => {
        m += `<line x1="${x}" y1="94" x2="${x}" y2="84" stroke="#3c9a3c" stroke-width="2"/><path d="M${x - 4} 84 Q${x - 4} 77 ${x - 2} 78 L${x} 80 L${x + 2} 78 Q${x + 4} 77 ${x + 4} 84 Z" fill="${c}"/>`;
      });
    } else if (id === 'sommer') {
      m += '<rect width="120" height="100" fill="#7fcdff"/>';
      m += '<g stroke="#ffc400" stroke-width="2.5" stroke-linecap="round">';
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        m += `<line x1="${(20 + Math.cos(a) * 15).toFixed(1)}" y1="${(18 + Math.sin(a) * 15).toFixed(1)}" x2="${(20 + Math.cos(a) * 20).toFixed(1)}" y2="${(18 + Math.sin(a) * 20).toFixed(1)}"/>`;
      }
      m += '</g><circle cx="20" cy="18" r="11" fill="#ffd400"/>';
      m += '<rect y="82" width="120" height="18" fill="#4cbf4c"/>';
      m += trunk;
      m += '<g fill="#2e9e46"><circle cx="46" cy="40" r="17"/><circle cx="74" cy="38" r="18"/><circle cx="60" cy="24" r="18"/><circle cx="60" cy="42" r="15"/></g>';
      m += '<g fill="#40b85a"><circle cx="52" cy="28" r="6"/><circle cx="70" cy="30" r="5"/></g>';
    } else if (id === 'herbst') {
      m += '<rect width="120" height="100" fill="#cfdbe8"/>';
      m += '<g fill="#fff"><ellipse cx="24" cy="18" rx="14" ry="6"/><ellipse cx="96" cy="14" rx="12" ry="5"/></g>';
      m += '<rect y="82" width="120" height="18" fill="#b9a15a"/>';
      m += trunk;
      m += '<g><circle cx="47" cy="40" r="15" fill="#f39c34"/><circle cx="73" cy="39" r="15" fill="#e0582b"/><circle cx="60" cy="27" r="16" fill="#f5b731"/><circle cx="62" cy="42" r="10" fill="#e8742c"/></g>';
      // fallende Blätter
      const leaves = [[30, 60, '#e0582b'], [86, 64, '#f39c34'], [96, 50, '#f5b731'], [22, 76, '#f39c34'], [40, 88, '#e0582b'], [78, 90, '#f5b731'], [100, 88, '#e0582b'], [16, 90, '#f5b731']];
      m += leaves.map(([x, y, c], i) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="2.4" fill="${c}" transform="rotate(${i * 37} ${x} ${y})"/>`).join('');
    } else {
      m += '<rect width="120" height="100" fill="#a9c8e8"/>';
      m += '<rect y="80" width="120" height="20" fill="#ffffff"/>';
      m += '<path d="M0 80 Q30 74 60 80 T120 79 L120 82 L0 82 Z" fill="#f2f7ff"/>';
      // kahler Baum mit Schnee auf den Ästen
      m += '<path d="M57 88 L58 50 L46 36 L49 34 L59 45 L59 26 L62 26 L62 45 L73 32 L76 34 L63 50 L64 88 Z" fill="#7b5236"/>';
      m += '<path d="M44 34 L50 31 L52 34 L46 37 Z M57 25 L64 25 L63 28 L58 28 Z M72 31 L78 32 L76 35 L72 34 Z" fill="#fff"/>';
      m += '<ellipse cx="60" cy="81" rx="12" ry="3" fill="#e2ecf8"/>';
      // Schneeflocken
      const flakes = [[14, 14], [34, 30], [22, 52], [92, 20], [104, 44], [84, 60], [40, 66], [100, 70], [12, 72], [76, 12], [50, 12]];
      m += flakes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`).join('');
    }
    return W.svg(m, '0 0 120 100', 'w2-scene-svg');
  };

  /* ------------------------------------------------------------------
     Tageszeiten: Himmel mit Sonne/Mond über einem kleinen Haus (viewBox 0 0 120 90)
     Morgen: Sonne geht links auf · Mittag: Sonne ganz oben ·
     Abend: Sonne geht rechts unter · Nacht: Mond, Sterne, Licht im Fenster
     ------------------------------------------------------------------ */
  W.DAYTIMES = [
    { id: 'morgen', name: 'Morgen', dat: 'am Morgen' },
    { id: 'mittag', name: 'Mittag', dat: 'am Mittag' },
    { id: 'abend', name: 'Abend', dat: 'am Abend' },
    { id: 'nacht', name: 'Nacht', dat: 'in der Nacht' },
  ];
  W.daytime = (id) => W.DAYTIMES.find((d) => d.id === id);

  W.dayScene = function (id) {
    const g = 'w2g' + ++uid;
    const house = (win) => `<rect x="70" y="56" width="30" height="22" fill="#f7e3c4"/><path d="M66 58 L85 42 L104 58 Z" fill="#d9534f"/><rect x="77" y="62" width="8" height="8" fill="${win}" stroke="#8a5a3b" stroke-width="1.2"/><rect x="88" y="64" width="7" height="14" fill="#8a5a3b"/>`;
    const rays = (cx, cy, r1, r2, n, col, upperOnly) => {
      let s = `<g stroke="${col}" stroke-width="2.4" stroke-linecap="round">`;
      for (let i = 0; i < n; i++) {
        const a = (i * 2 * Math.PI) / n;
        if (upperOnly && Math.sin(a) > -0.2) continue; // aufgehende Sonne: keine Strahlen unter dem Horizont
        s += `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}"/>`;
      }
      return s + '</g>';
    };
    let m = '';
    if (id === 'morgen') {
      m += `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8ff"/><stop offset="1" stop-color="#ffd8a8"/></linearGradient></defs>`;
      m += `<rect width="120" height="90" fill="url(#${g})"/>`;
      m += rays(30, 74, 15, 21, 12, '#ffb000', true);
      m += '<circle cx="30" cy="74" r="12" fill="#ffc531"/>';
      m += '<rect y="74" width="120" height="16" fill="#86cf62"/>' + house('#e9f2ff');
    } else if (id === 'mittag') {
      m += '<rect width="120" height="90" fill="#5cbcff"/>';
      m += rays(60, 20, 14, 21, 12, '#ffd000');
      m += '<circle cx="60" cy="20" r="11" fill="#ffe14a"/>';
      m += '<rect y="74" width="120" height="16" fill="#5cc35a"/>' + house('#e9f2ff');
    } else if (id === 'abend') {
      m += `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4fa3"/><stop offset=".55" stop-color="#e46f7e"/><stop offset="1" stop-color="#ffb05c"/></linearGradient></defs>`;
      m += `<rect width="120" height="90" fill="url(#${g})"/>`;
      // Abendsonne weiter rechts als die Morgensonne (Osten ↔ Westen), aber gut sichtbar vor dem Haus
      m += '<circle cx="50" cy="76" r="14" fill="#ff7b3a"/>';
      m += '<rect y="74" width="120" height="16" fill="#4f8f4a"/>' + house('#ffe27a');
    } else {
      m += '<rect width="120" height="90" fill="#1c2756"/>';
      m += '<circle cx="28" cy="22" r="11" fill="#fff3b0"/><circle cx="33" cy="18" r="10" fill="#1c2756"/>';
      const stars = [[56, 12], [80, 22], [100, 10], [48, 34], [108, 32], [70, 8], [14, 44]];
      m += stars.map(([x, y]) => `<path d="M${x} ${y - 3.5} L${x + 1} ${y - 1} L${x + 3.5} ${y} L${x + 1} ${y + 1} L${x} ${y + 3.5} L${x - 1} ${y + 1} L${x - 3.5} ${y} L${x - 1} ${y - 1} Z" fill="#fff6c2"/>`).join('');
      m += '<rect y="74" width="120" height="16" fill="#203a2c"/>' + house('#ffd84d');
    }
    return W.svg(m, '0 0 120 90', 'w2-scene-svg');
  };

  /* ------------------------------------------------------------------
     Lebensräume als Szenen (ohne Tiere – die Szene darf nichts verraten)
     ------------------------------------------------------------------ */
  W.HABITATS = [
    { id: 'hof', nom: 'der Bauernhof', name: 'Bauernhof', dat: 'auf dem Bauernhof', icons: ['🏡', '🚜', '🌾'] },
    { id: 'wald', nom: 'der Wald', name: 'Wald', dat: 'im Wald', icons: ['🌲', '🌳', '🍄'] },
    { id: 'meer', nom: 'das Meer', name: 'Meer', dat: 'im Meer', icons: ['⛵', '🌊', '🌊'] },
    { id: 'dschungel', nom: 'der Dschungel', name: 'Dschungel', dat: 'im Dschungel', icons: ['🌴', '🌿', '🌺'] },
    { id: 'wueste', nom: 'die Wüste', name: 'Wüste', dat: 'in der Wüste', icons: ['☀️', '🌵', '🏜️'] },
    { id: 'eis', nom: 'Eis und Schnee', name: 'Eis und Schnee', label: 'Eis & Schnee', dat: 'in Eis und Schnee', icons: ['❄️', '🏔️', '🧊'] },
  ];
  W.habitat = (id) => W.HABITATS.find((h) => h.id === id);
  W.habitatScene = function (id) {
    const h = W.habitat(id);
    return el('div.w2-habitat.w2-hab-' + id, h.icons.map((e, i) => el('span.emoji.w2-hab-i.w2-hab-i' + i, e)));
  };

  /** Szene + Beschriftung als Kachel-Inhalt. */
  W.sceneTile = function (node, label) {
    return el('div.w2-scene', node, label ? el('span.w2-scene-label', label) : null);
  };

  /* ------------------------------------------------------------------
     Analoge Uhr (viewBox 0 0 200 200)
     Kurzer, dicker, dunkler Stundenzeiger – langer, dünner, roter Minutenzeiger.
     ------------------------------------------------------------------ */
  W.HOUR_COLOR = '#2b2d42';
  W.MIN_COLOR = '#e8463a';

  W.clock = function (h, m, opts = {}) {
    let s = '';
    s += '<circle cx="100" cy="100" r="96" fill="#3dbe6b"/>';
    s += '<circle cx="100" cy="100" r="88" fill="#fffdf7"/>';
    // Minutenstriche (Fünferstriche kräftiger)
    for (let i = 0; i < 60; i++) {
      const a = (i * Math.PI) / 30;
      const big = i % 5 === 0;
      const r1 = big ? 78 : 82;
      s += `<line x1="${(100 + Math.sin(a) * r1).toFixed(1)}" y1="${(100 - Math.cos(a) * r1).toFixed(1)}" x2="${(100 + Math.sin(a) * 86).toFixed(1)}" y2="${(100 - Math.cos(a) * 86).toFixed(1)}" stroke="${big ? '#5c6080' : '#b9bdd3'}" stroke-width="${big ? 3 : 1.4}" stroke-linecap="round"/>`;
    }
    // Zahlen 1–12 (bei Bedarf als Trefferflächen zum Antippen)
    for (let i = 1; i <= 12; i++) {
      const a = (i * Math.PI) / 6;
      const x = 100 + Math.sin(a) * 63;
      const y = 100 - Math.cos(a) * 63;
      const target = opts.targets ? ` data-hour="${i}" class="w2-num-hit"` : ' class="w2-num"';
      s += `<g${target}><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" class="w2-num-bg"/>` +
        `<text x="${x.toFixed(1)}" y="${(y + 7.5).toFixed(1)}" text-anchor="middle" font-size="21" font-weight="700" fill="#2b2d42" font-family="Andika, Trebuchet MS, sans-serif">${i}</text></g>`;
    }
    // Zeiger: Minutenzeiger lang/dünn/rot, Stundenzeiger kurz/dick/dunkel (liegt oben)
    s += `<g class="w2-hand w2-hand-m"><line x1="100" y1="114" x2="100" y2="24" stroke="${W.MIN_COLOR}" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="24" r="0.1" fill="none"/></g>`;
    s += `<g class="w2-hand w2-hand-h"><line x1="100" y1="110" x2="100" y2="56" stroke="${W.HOUR_COLOR}" stroke-width="10" stroke-linecap="round"/></g>`;
    s += '<circle cx="100" cy="100" r="7" fill="#2b2d42"/><circle cx="100" cy="100" r="2.5" fill="#fff"/>';
    const svg = W.svg(s, '0 0 200 200', 'w2-clock' + (opts.cls ? ' ' + opts.cls : ''));
    const hh = svg.querySelector('.w2-hand-h');
    const mh = svg.querySelector('.w2-hand-m');
    svg.setHourAngle = (deg) => { hh.style.transform = `rotate(${deg}deg)`; };
    svg.setTime = (hr, mn) => {
      svg.setHourAngle(((hr % 12) + mn / 60) * 30);
      mh.style.transform = `rotate(${mn * 6}deg)`;
    };
    svg.hourHand = hh;
    svg.minuteHand = mh;
    svg.setTime(h, m);
    return svg;
  };

  /** Uhrzeit in Worten (umgangssprachlich, wie Kinder es hören). h: 1–12, m: 0 | 30 */
  W.timeWords = function (h, m) {
    const word = (n) => (n === 1 ? 'ein' : U.numberWord(n));
    if (m === 30) {
      const next = (h % 12) + 1;
      return { say: 'halb ' + U.numberWord(next), text: 'halb ' + next };
    }
    return { say: word(h) + ' Uhr', text: h + ' Uhr' };
  };

  /** Kleine Legende: kurzer dicker Zeiger = Stunde, langer roter = Minuten. */
  W.clockLegend = function () {
    return el('div.w2-legend',
      el('span.w2-leg', el('i.w2-leg-h'), el('span', 'Stunde')),
      el('span.w2-leg', el('i.w2-leg-m'), el('span', 'Minuten')));
  };

  LT.w2 = W;
})();
