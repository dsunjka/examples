/* ==========================================================================
   Spiel „Wo ist die Katze?“ (Raum-Lage-Begriffe)

   Didaktik:
   - Präpositionen sind eine wichtige Grundlage für die Schulfähigkeit
     („Schreibe deinen Namen OBEN auf das Blatt“, „Lege das Heft IN die Tasche“).
   - Szenen sind präzise gezeichnet: Ein Gegenstand (Tisch, Stuhl, Kiste,
     Bett, Baum) und ein Tier. „Vor“ und „hinter“ werden eindeutig über
     Überdeckung, Größe und Standhöhe dargestellt (vorne = größer, tiefer,
     verdeckt den Gegenstand; hinten = kleiner, halb verdeckt).
   - Bilder, die leicht verwechselt werden könnten, kommen nie in derselben
     Aufgabe vor (z. B. nie „neben“ zusammen mit „links/rechts“, nie „unter“
     zusammen mit „vor/hinter“).
   - Der ganze Satz wird vorgelesen, die Präposition steht groß und farbig im
     Aufgabenfeld. Nach einem Fehler sagt Flo, was auf dem falschen Bild zu
     sehen ist („Hier ist die Katze AUF dem Tisch“) – so lernt das Kind auch
     aus Fehlern. Nach 2 Fehlversuchen wird die Lösung hervorgehoben.
   - Stufen: auf/unter/in → neben/vor/hinter/über → links/rechts/zwischen →
     umgekehrt: Das Kind setzt das Tier selbst an die richtige Stelle.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.w1;

  /* ---------------- Tiere ---------------- */
  // e = ganzes Tier (seitlich), f = Gesicht (für „in der Kiste / im Bett“)
  const GROUND = [
    { id: 'katze', nom: 'die Katze', e: '🐈', f: '🐱' },
    { id: 'hund', nom: 'der Hund', e: '🐕', f: '🐶' },
    { id: 'hase', nom: 'der Hase', e: '🐇', f: '🐰' },
    { id: 'maus', nom: 'die Maus', e: '🐁', f: '🐭' },
  ];
  const FLYING = [
    { id: 'vogel', nom: 'der Vogel', e: '🐦', f: '🐦', fly: true },
    { id: 'schmetterling', nom: 'der Schmetterling', e: '🦋', f: '🦋', fly: true },
    { id: 'biene', nom: 'die Biene', e: '🐝', f: '🐝', fly: true },
  ];
  // Am Baum nur Tiere, die wirklich auf einen Baum klettern/fliegen (kein Hund/Hase „auf dem Baum“)
  const TREE = [
    GROUND[0],
    { id: 'eichhoernchen', nom: 'das Eichhörnchen', e: '🐿️', f: '🐿️' },
    FLYING[0],
  ];

  /* ---------------- Gegenstände ----------------
     Lokale Koordinaten: (0,0) = Mitte unten, y nach oben negativ.
     anchors: Position des Tieres je Präposition { x, y (= unten), s (Größe) } */
  const WOOD = '#c98b4f';
  const WOOD_D = '#9a6232';
  const OBJ = {
    tisch: {
      dat: 'dem Tisch', acc: 'den Tisch', datPl: 'den Tischen', accPl: 'die Tische', indef: 'einem Tisch',
      hw: 54, pairScale: 0.6,
      preps: ['auf', 'unter', 'neben', 'ueber', 'links', 'rechts', 'zwischen'],
      zones: ['auf', 'unter', 'links', 'rechts'],
      back: () => `
        <rect x="-38" y="-52" width="6" height="46" fill="${WOOD_D}"/>
        <rect x="32" y="-52" width="6" height="46" fill="${WOOD_D}"/>
        <rect x="-48" y="-52" width="9" height="52" rx="2" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="1.5"/>
        <rect x="39" y="-52" width="9" height="52" rx="2" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="1.5"/>
        <rect x="-56" y="-62" width="112" height="11" rx="3" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>`,
      anchors: {
        auf: { x: 0, y: -62, s: 38 }, unter: { x: 0, y: 0, s: 36 }, ueber: { x: 0, y: -96, s: 30 },
      },
    },
    stuhl: {
      dat: 'dem Stuhl', acc: 'den Stuhl', datPl: 'den Stühlen', accPl: 'die Stühle', indef: 'einem Stuhl',
      hw: 33, pairScale: 0.9,
      preps: ['auf', 'unter', 'neben', 'links', 'rechts', 'zwischen'],
      zones: ['auf', 'unter', 'links', 'rechts'],
      back: () => `
        <rect x="-29" y="-112" width="7" height="62" rx="2" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="1.5"/>
        <rect x="22" y="-112" width="7" height="62" rx="2" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="1.5"/>
        <rect x="-29" y="-114" width="58" height="24" rx="5" fill="#e07a5f" stroke="#b05a42" stroke-width="2"/>
        <rect x="-31" y="-50" width="7" height="50" rx="2" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="1.5"/>
        <rect x="24" y="-50" width="7" height="50" rx="2" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="1.5"/>
        <rect x="-34" y="-58" width="68" height="9" rx="3" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>`,
      anchors: {
        auf: { x: 0, y: -58, s: 36 }, unter: { x: 0, y: 0, s: 32 },
      },
    },
    kiste: {
      dat: 'der Kiste', acc: 'die Kiste', datPl: 'den Kisten', accPl: 'die Kisten', indef: 'einer Kiste',
      inDat: 'in der Kiste', inAcc: 'in die Kiste',
      hw: 46, pairScale: 0.7,
      preps: ['auf', 'in', 'neben', 'vor', 'hinter', 'ueber', 'links', 'rechts', 'zwischen'],
      zones: ['in', 'links', 'rechts'],
      back: (open) => open ? `
        <polygon points="-46,-64 -38,-78 -58,-96 -68,-80" fill="#e8b874" stroke="${WOOD_D}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="46,-64 38,-78 58,-96 68,-80" fill="#e8b874" stroke="${WOOD_D}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="-46,-64 46,-64 38,-78 -38,-78" fill="#7a4a22" stroke="${WOOD_D}" stroke-width="2" stroke-linejoin="round"/>`
        : `
        <polygon points="-46,-64 46,-64 38,-76 -38,-76" fill="#e8b874" stroke="${WOOD_D}" stroke-width="2" stroke-linejoin="round"/>
        <line x1="0" y1="-64" x2="0" y2="-76" stroke="#b9854a" stroke-width="8"/>`,
      front: () => `
        <rect x="-46" y="-64" width="92" height="64" rx="3" fill="#d9a35f" stroke="${WOOD_D}" stroke-width="2"/>
        <rect x="-7" y="-64" width="14" height="64" fill="#b9854a" opacity=".7"/>
        <path d="M-34 -14 h14 M27 -14 h8" stroke="${WOOD_D}" stroke-width="2" stroke-linecap="round"/>`,
      anchors: {
        auf: { x: 0, y: -74, s: 38 }, in: { x: 0, y: -48, s: 44, face: true },
        vor: { x: -30, y: 24, s: 56 }, hinter: { x: 46, y: -16, s: 46, behind: true },
        ueber: { x: 0, y: -108, s: 30 },
      },
    },
    bett: {
      dat: 'dem Bett', acc: 'das Bett', indef: 'einem Bett', inDat: 'im Bett', inAcc: 'ins Bett',
      hw: 70,
      preps: ['auf', 'unter', 'in', 'neben', 'links', 'rechts'],
      zones: ['auf', 'unter', 'links', 'rechts'],
      back: () => `
        <rect x="-72" y="-96" width="11" height="96" rx="4" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
        <rect x="61" y="-70" width="11" height="70" rx="4" fill="${WOOD}" stroke="${WOOD_D}" stroke-width="2"/>
        <rect x="-61" y="-38" width="122" height="9" fill="${WOOD_D}"/>
        <rect x="-61" y="-56" width="122" height="19" rx="4" fill="#f4f1ea" stroke="#cfc8b8" stroke-width="1.5"/>
        <ellipse cx="-44" cy="-61" rx="16" ry="8" fill="#ffffff" stroke="#cfc8b8" stroke-width="1.5"/>`,
      front: (inBed) => `
        <rect x="${inBed ? -54 : -28}" y="-64" width="${inBed ? 115 : 89}" height="30" rx="7" fill="#7cb0e8" stroke="#4f86c4" stroke-width="2"/>
        <circle cx="10" cy="-50" r="3" fill="#fff" opacity=".8"/><circle cx="34" cy="-44" r="3" fill="#fff" opacity=".8"/>
        <circle cx="48" cy="-56" r="3" fill="#fff" opacity=".8"/><circle cx="${inBed ? -30 : 0}" cy="-42" r="3" fill="#fff" opacity=".8"/>`,
      anchors: {
        auf: { x: 22, y: -64, s: 36 }, unter: { x: 0, y: 0, s: 27 }, in: { x: -42, y: -57, s: 30, face: true, between: true },
      },
      nebenDx: 96,
    },
    baum: {
      dat: 'dem Baum', acc: 'den Baum', datPl: 'den Bäumen', accPl: 'die Bäume', indef: 'einem Baum',
      hw: 54, outdoor: true, scale: 0.85, pairScale: 0.6,
      preps: ['auf', 'unter', 'neben', 'links', 'rechts', 'zwischen'],
      zones: ['auf', 'links', 'rechts'],
      // „unter dem Baum“ (unter der Krone) wird nie mit „neben/links/rechts“ gemischt
      conflicts: [['unter', 'neben'], ['unter', 'links'], ['unter', 'rechts']],
      back: () => `
        <path d="M-12 0 L-9 -80 L9 -80 L12 0 Q0 4 -12 0 Z" fill="#8b5a2b" stroke="#6b4220" stroke-width="2"/>
        <circle cx="-30" cy="-98" r="27" fill="#4caf50"/><circle cx="30" cy="-100" r="27" fill="#4caf50"/>
        <circle cx="0" cy="-116" r="42" fill="#5cbf60"/>
        <circle cx="-14" cy="-128" r="9" fill="#7fd283" opacity=".7"/>
        <path d="M4 -84 L40 -100" stroke="#8b5a2b" stroke-width="7" stroke-linecap="round"/>`,
      anchors: {
        auf: { x: 34, y: -99, s: 34 }, unter: { x: -40, y: 0, s: 36 },
      },
    },
  };

  const BASE = 144; // Bodenlinie, auf der die Gegenstände stehen
  const VW = 240;
  const VH = 172;

  // Bilder, die leicht verwechselt werden könnten → nie zusammen in einer Aufgabe
  const CONFLICTS = [
    ['neben', 'links'], ['neben', 'rechts'], ['unter', 'vor'], ['unter', 'hinter'],
    ['in', 'hinter'], ['auf', 'hinter'], ['ueber', 'hinter'],
  ];
  function conflict(obj, a, b) {
    const list = CONFLICTS.concat(obj.conflicts || []);
    return list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  }

  const WORD = { auf: 'auf', unter: 'unter', in: 'in', neben: 'neben', vor: 'vor', hinter: 'hinter', ueber: 'über', links: 'links', rechts: 'rechts', zwischen: 'zwischen' };

  /** Satzteil „unter dem Tisch“ / „zwischen den Kisten“ (Dativ = wo?). */
  function phrase(objId, prep, pair) {
    const o = OBJ[objId];
    if (pair) {
      if (prep === 'zwischen') return `zwischen ${o.datPl}`;
      if (prep === 'links') return `links neben ${o.datPl}`;
      if (prep === 'rechts') return `rechts neben ${o.datPl}`;
      return `${WORD[prep]} ${o.indef}`;
    }
    if (prep === 'in') return o.inDat;
    if (prep === 'links') return `links neben ${o.dat}`;
    if (prep === 'rechts') return `rechts neben ${o.dat}`;
    return `${WORD[prep]} ${o.dat}`;
  }
  /** Satzteil „unter den Tisch“ (Akkusativ = wohin?) für Stufe 4. */
  function phraseAcc(objId, prep, pair) {
    const o = OBJ[objId];
    if (pair) {
      if (prep === 'zwischen') return `zwischen ${o.accPl}`;
      if (prep === 'links') return `links neben ${o.accPl}`;
      if (prep === 'rechts') return `rechts neben ${o.accPl}`;
      return `${WORD[prep]} ${o.indef.replace('einem', 'einen').replace('einer', 'eine')}`;
    }
    if (prep === 'in') return o.inAcc;
    if (prep === 'links') return `links neben ${o.acc}`;
    if (prep === 'rechts') return `rechts neben ${o.acc}`;
    return `${WORD[prep]} ${o.acc}`;
  }

  /* ---------------- Szene zeichnen ---------------- */

  /** Hintergrund: Zimmer (Wand + Holzboden) oder draußen (Himmel + Wiese). */
  function background(outdoor) {
    if (outdoor) {
      return `<rect width="${VW}" height="${VH}" fill="#cdeeff"/>
        <circle cx="210" cy="26" r="14" fill="#ffd54a"/>
        <rect y="118" width="${VW}" height="${VH - 118}" fill="#9ad66b"/>
        <path d="M0 118 H${VW}" stroke="#7fc04f" stroke-width="3"/>`;
    }
    return `<rect width="${VW}" height="${VH}" fill="#fff6e6"/>
      <rect y="118" width="${VW}" height="${VH - 118}" fill="#e9c891"/>
      <path d="M0 118 H${VW}" stroke="#d1a866" stroke-width="3"/>
      <path d="M0 140 H${VW} M0 160 H${VW}" stroke="#ddb877" stroke-width="1.5"/>`;
  }

  /** Lage eines Gegenstands in der Szene (einzeln oder als Paar). */
  function placements(objId, pair) {
    const o = OBJ[objId];
    if (pair) return [{ cx: 66, s: o.pairScale }, { cx: 174, s: o.pairScale }];
    return [{ cx: 120, s: o.scale || 1 }];
  }

  /** Position des Tieres (Szenen-Koordinaten) für eine Präposition. */
  function anchor(objId, prep, pair) {
    const o = OBJ[objId];
    const pl = placements(objId, pair);
    if (pair) {
      const L = pl[0];
      const R = pl[1];
      if (prep === 'zwischen') return { x: 120, y: BASE, s: 32 };
      if (prep === 'links') return { x: Math.max(16, L.cx - o.hw * L.s - 18), y: BASE, s: 28 };
      if (prep === 'rechts') return { x: Math.min(224, R.cx + o.hw * R.s + 18), y: BASE, s: 28 };
      const a = o.anchors[prep];
      const p = pl[0];
      return { x: p.cx + a.x * p.s, y: BASE + a.y * p.s, s: Math.max(24, a.s * p.s * 1.15), face: a.face };
    }
    const p = pl[0];
    if (prep === 'neben' || prep === 'links' || prep === 'rechts') {
      const side = prep === 'links' ? -1 : prep === 'rechts' ? 1 : (anchor._side || 1);
      const dx = o.nebenDx || o.hw * p.s + 30;
      return { x: p.cx + side * dx, y: BASE, s: 36 };
    }
    const a = o.anchors[prep];
    return { x: p.cx + a.x * p.s, y: BASE + a.y * p.s, s: a.s * (p.s < 1 ? 1.05 : 1), face: a.face, behind: a.behind, between: a.between };
  }

  /**
   * Komplette Szene als SVG-Markup.
   * prep = null → nur der Gegenstand (Stufe 4 vor dem Setzen).
   */
  function sceneMarkup(objId, prep, animal, pair, opts = {}) {
    const o = OBJ[objId];
    const open = opts.open != null ? opts.open : prep === 'in';
    const pl = placements(objId, pair);
    let backs = '';
    let fronts = '';
    for (const p of pl) {
      const tr = `transform="translate(${p.cx} ${BASE}) scale(${p.s})"`;
      backs += `<g ${tr}>${o.back(open)}</g>`;
      if (o.front) fronts += `<g ${tr}>${o.front(prep === 'in')}</g>`;
    }
    let ani = '';
    let layer = 'top';
    if (prep) {
      const a = anchor(objId, prep, pair);
      const glyph = a.face ? animal.f : animal.e;
      ani = `<g class="raum-animal">${W.emo(glyph, a.x, a.y, a.s)}</g>`;
      if (a.behind) layer = 'behind';
      else if (prep === 'in') layer = 'between';
    }
    // Schatten unter dem Tier auf dem Boden macht „vor/hinter/neben“ greifbarer
    return background(o.outdoor) +
      (layer === 'behind' ? ani : '') +
      backs +
      (layer === 'between' ? ani : '') +
      fronts +
      (layer === 'top' ? ani : '');
  }

  function sceneNode(objId, prep, animal, pair, opts) {
    return W.svg(`0 0 ${VW} ${VH}`, sceneMarkup(objId, prep, animal, pair, opts), 'raum-svg');
  }

  /* ---------------- Aufgaben erzeugen ---------------- */

  const SETS = {
    1: ['auf', 'unter', 'in'],
    2: ['neben', 'vor', 'hinter', 'ueber'],
    3: ['links', 'rechts', 'zwischen'],
  };

  /** Ziel-Präposition und passende Ablenker (ohne verwechselbare Bilder). */
  function makeTask(level) {
    let target;
    if (level === 1) target = U.pickFresh('raum-p1', SETS[1], 1);
    else if (level === 2) target = U.chance(0.8) ? U.pickFresh('raum-p2', SETS[2], 2) : U.pick(SETS[1]);
    else target = U.chance(0.8) ? U.pickFresh('raum-p3', SETS[3], 1) : U.pick(SETS[2].concat(SETS[1]));

    const pair = target === 'zwischen';
    const objs = Object.keys(OBJ).filter((k) => OBJ[k].preps.includes(target));
    const objId = U.pickFresh('raum-obj', objs, 2);
    const o = OBJ[objId];

    let pool;
    if (pair) {
      pool = ['links', 'rechts', 'auf'].concat(o.anchors.unter ? ['unter'] : []);
    } else {
      pool = o.preps.filter((p) => p !== 'zwischen');
    }
    pool = pool.filter((p) => p !== target && !conflict(o, p, target));
    // Ablenker bevorzugt aus der aktuellen Stufe (sonst wird es zu leicht)
    const allowed = level === 1 ? ['auf', 'unter', 'in', 'neben'] : level === 2 ? SETS[1].concat(SETS[2]) : null;
    if (allowed) pool = pool.filter((p) => allowed.includes(p));
    const picked = [];
    if (target === 'links' && pool.includes('rechts')) picked.push('rechts');
    if (target === 'rechts' && pool.includes('links')) picked.push('links');
    const prefer = U.shuffle(pool.filter((p) => !picked.includes(p) && (SETS[level] || []).includes(p)));
    const rest = U.shuffle(pool.filter((p) => !picked.includes(p) && !prefer.includes(p)));
    for (const p of prefer.concat(rest)) {
      if (picked.length >= 2) break;
      if (picked.some((q) => conflict(o, p, q))) continue;
      picked.push(p);
    }
    const options = [target].concat(picked);
    const flying = options.includes('ueber');
    const animal = U.pickFresh('raum-animal', objId === 'baum' ? TREE : flying ? FLYING : GROUND, 2, (a) => a.id);
    return { target, options, objId, pair, animal };
  }

  /* ---------------- Spiel ---------------- */

  LT.registerGame({
    id: 'raumlage',
    area: 'welt',
    title: 'Wo ist die Katze?',
    icon: '📦',
    levels: 4,
    rounds: 5,
    parent: {
      skill: 'Raum-Lage-Begriffe (Präpositionen)',
      goal: 'Ihr Kind versteht und unterscheidet Lagebegriffe wie auf, unter, in, neben, vor, hinter, über, zwischen sowie links und rechts (aus eigener Sicht). Diese Begriffe braucht es in der Schule ständig („Schreibe oben links …“). Nach einem Fehler benennt Flo, was auf dem gewählten Bild zu sehen ist.',
      levels: [
        'auf, unter, in – drei Bilder zur Auswahl',
        'neben, vor, hinter, über – vor/hinter über Überdeckung und Größe',
        'links, rechts (aus Sicht des Kindes) und zwischen',
        'Umgekehrt: Das Kind tippt selbst die Stelle an, wohin das Tier soll',
      ],
      tip: 'Spielen Sie „Wo ist der Teddy?“: Verstecken Sie ein Kuscheltier und lassen Sie Ihr Kind mit ganzen Sätzen antworten („Der Teddy ist UNTER dem Kissen“). Beim Tischdecken: „Lege die Gabel LINKS neben den Teller.“',
    },

    async task(ctx) {
      if (ctx.level >= 4) return placeTask(ctx);
      return pickTask(ctx);
    },
  });

  /** Stufen 1–3: das richtige Bild antippen. */
  async function pickTask(ctx) {
    const t = makeTask(ctx.level);
    anchor._side = U.chance(0.5) ? -1 : 1;
    const A = U.cap(t.animal.nom);
    const sentence = (p) => `${A} ist ${phrase(t.objId, p, t.pair)}.`;

    const prompt = el('div.raum-prompt',
      el('span.raum-word', WORD[t.target]),
      el('span.raum-sentence', sentence(t.target))
    );
    ctx.stage.appendChild(prompt);
    const box = el('div.choices.raum-choices');
    ctx.stage.appendChild(box);

    const items = t.options.map((p) => ({
      content: el('div.raum-scene', sceneNode(t.objId, p, t.animal, t.pair)),
      correct: p === t.target,
      className: 'raum-tile',
      aria: sentence(p),
      value: p,
    }));
    ctx.instruct(`Finde das Bild: ${sentence(t.target)}`);

    let arrowShown = false;
    await ctx.choices(items, {
      container: box,
      correctSay: () => `Richtig! ${sentence(t.target)}`,
      wrongSay: (item) => `Hier ist ${t.animal.nom} ${phrase(t.objId, item.value, t.pair)}.`,
      hintSay: `Schau mal: Hier ist ${t.animal.nom} ${phrase(t.objId, t.target, t.pair)}.`,
      onWrong: async () => {
        // Links/rechts: Richtungspfeil als Hilfe einblenden
        if (!arrowShown && (t.target === 'links' || t.target === 'rechts')) {
          arrowShown = true;
          prompt.insertBefore(U.emoji(t.target === 'links' ? '⬅️' : '➡️', 'raum-arrow'), prompt.firstChild);
          await ctx.say(t.target === 'links' ? 'Links ist auf dieser Seite. Schau auf den Pfeil.' : 'Rechts ist auf dieser Seite. Schau auf den Pfeil.');
        }
      },
    });
  }

  /** Stufe 4: Das Kind setzt das Tier selbst an die richtige Stelle. */
  async function placeTask(ctx) {
    const pair = U.chance(0.3);
    let objId;
    let zones;
    if (pair) {
      objId = U.pickFresh('raum-obj4p', ['tisch', 'kiste', 'stuhl', 'baum'], 1);
      zones = ['zwischen', 'links', 'rechts', 'auf'];
    } else {
      objId = U.pickFresh('raum-obj4', Object.keys(OBJ), 2);
      zones = OBJ[objId].zones.slice();
    }
    const target = U.pickFresh('raum-p4', zones, 2);
    const animal = U.pickFresh('raum-animal', objId === 'baum' ? TREE : GROUND, 2, (a) => a.id);
    const A = U.cap(animal.nom);
    const open = objId === 'kiste' && zones.includes('in');

    const prompt = el('div.raum-prompt',
      U.emoji(animal.e, 'raum-who'),
      el('span.raum-word', WORD[target]),
      el('span.raum-sentence', `${A} möchte ${phraseAcc(objId, target, pair)}.`)
    );
    ctx.stage.appendChild(prompt);
    const scene = el('div.raum-big');
    const svgBox = el('div.raum-big-svg', sceneNode(objId, null, animal, pair, { open }));
    scene.appendChild(svgBox);
    const zoneBox = el('div.raum-zones');
    scene.appendChild(zoneBox);
    ctx.stage.appendChild(scene);

    const items = zones.map((p) => ({
      content: U.emoji(animal.e, 'raum-ghost'),
      correct: p === target,
      className: 'raum-zone',
      aria: phrase(objId, p, pair),
      value: p,
    }));
    ctx.instruct(`${A} möchte ${phraseAcc(objId, target, pair)}. Tippe auf die richtige Stelle!`);

    const done = ctx.choices(items, {
      container: zoneBox,
      shuffle: false,
      correctSay: () => `Super! Jetzt ist ${animal.nom} ${phrase(objId, target, pair)}.`,
      wrongSay: (item) => `Dann wäre ${animal.nom} ${phrase(objId, item.value, pair)}.`,
      hintSay: `Ich zeige dir die Stelle: ${phrase(objId, target, pair)}.`,
      onCorrect: () => {
        // Tier an die gewählte Stelle setzen
        U.clear(svgBox);
        svgBox.appendChild(sceneNode(objId, target, animal, pair, { open }));
        zoneBox.classList.add('raum-zones-done');
      },
    });
    // Trefferzonen genau an die Anker-Positionen der Szene legen
    (zoneBox._tiles || []).forEach((tile) => {
      const p = tile._item.value;
      const a = anchor(objId, p, pair);
      const r = 25;
      const cy = a.y - Math.min(a.s, 40) / 2;
      Object.assign(tile.style, {
        left: ((U.clamp(a.x, r + 2, VW - r - 2) - r) / VW * 100) + '%',
        top: ((cy - r) / VH * 100) + '%',
        width: (2 * r / VW * 100) + '%',
        height: (2 * r / VH * 100) + '%',
      });
    });
    await done;
  }

  // Für Sichtprüfung/Tests: Szenen-Zeichner zugänglich machen
  W.raum = { sceneNode, OBJ, GROUND, FLYING };
})();
