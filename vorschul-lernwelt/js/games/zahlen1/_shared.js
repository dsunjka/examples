/* ==========================================================================
   Gemeinsame Bausteine der Spielgruppe 'zahlen1' (Zahlenland)  →  LT.z1

   Didaktischer Hintergrund (Mengen-Zahlen-Kompetenz nach Krajewski):
   Eine Zahl wird mit vielen Darstellungen verknüpft – Würfelbild, Fingerbild,
   Zehnerfeld, Dinge, Ziffer und Zahlwort. Strukturierte Darstellungen
   (Fünferbündelung, „Kraft der Fünf“) erlauben das Erfassen auf einen Blick
   statt mühsamen Abzählens. Alle Spiele der Gruppe nutzen deshalb dieselben,
   einheitlich gestalteten Darstellungen:

     Z.dice(n)         Würfelbild 1–6
     Z.tenFrame(n)     Zehnerfeld (2 × 5), obere Reihe rot, untere blau
     Z.twentyFrame(n)  zwei Zehnerfelder (Zehner + Einer) bis 20
     Z.hands(n)        Fingerbild mit einer oder zwei Händen (Zählen ab Daumen)
     Z.scatter(n)      ungeordnete Punkte in ein bis zwei Gruppen
     Z.objects(n, e)   Dinge (Emoji) in Fünferreihen
     Z.numberLine(a,b) Zahlenstrahl mit Markierungen

   Jede Darstellung skaliert über die CSS-Variable --c (Zellgröße) und
   liefert node._units: die einzelnen „Zählelemente“ in Zählreihenfolge.
   Z.countAlong(ctx, units) zählt diese mit Flo laut vor (Hilfestellung).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = {};

  /* ------------------------------------------------------------------
     Sprache: Zahlwörter
     ------------------------------------------------------------------ */
  /** Zahlwort klein: „sieben“ */
  Z.nw = (n) => U.numberWord(n);
  /** Zahl als Nomen: „die Sieben“ → „Sieben“ */
  Z.NW = (n) => U.cap(U.numberWord(n));
  /** „einer“ statt „eins“ in Sätzen wie „Hier einer und da drei.“ */
  Z.nwPron = (n) => (n === 1 ? 'einer' : U.numberWord(n));

  /* ------------------------------------------------------------------
     Zählbare Bilder (sorgfältig geprüft: ein Emoji = genau ein Ding;
     ausgeschlossen sind z. B. 🍒 (zwei Kirschen), 🍇 (Traube oder Beere?),
     🥞 (Stapel), 🍕/🍉 (Stück), Wetter- und Himmelsdinge).
     ------------------------------------------------------------------ */
  const COUNTABLE_IDS = [
    'apfel', 'birne', 'banane', 'erdbeere', 'orange', 'zitrone', 'ananas', 'pfirsich',
    'karotte', 'gurke', 'tomate', 'kartoffel', 'zwiebel', 'pilz',
    'ei', 'keks', 'brezel', 'lutscher', 'muffin', 'donut', 'bonbon',
    'hund', 'katze', 'maus', 'hase', 'schwein', 'schaf', 'huhn', 'kueken', 'ente', 'igel', 'eule',
    'schnecke', 'marienkaefer', 'biene', 'schmetterling', 'fisch', 'frosch', 'schildkroete', 'krabbe', 'pinguin',
    'ball', 'teddy', 'luftballon', 'geschenk',
    'auto', 'bus', 'traktor', 'taxi',
    'stern', 'baum', 'tulpe', 'sonnenblume', 'blatt', 'kastanie', 'muschel', 'kleeblatt',
  ];
  Z.countables = function () {
    return COUNTABLE_IDS.map((id) => LT.lexikon.get(id)).filter((w) => w && w.p);
  };
  /** Zufälliges zählbares Ding ohne direkte Wiederholung. */
  Z.pickThing = (key) => U.pickFresh(key || 'z1-thing', Z.countables(), 8, (w) => w.id);
  /** Nur Essbares – für Aufgaben „auf dem Teller“ (keine Bäume oder Traktoren auf dem Teller). */
  const FOOD_IDS = [
    'apfel', 'birne', 'banane', 'erdbeere', 'orange', 'zitrone', 'pfirsich',
    'karotte', 'tomate', 'kartoffel', 'pilz', 'ei', 'keks', 'brezel', 'muffin', 'donut', 'bonbon',
  ];
  Z.foods = function () {
    return FOOD_IDS.map((id) => LT.lexikon.get(id)).filter((w) => w && w.p);
  };
  Z.pickFood = (key) => U.pickFresh(key || 'z1-food', Z.foods(), 6, (w) => w.id);
  /** „sieben Äpfel“ / „ein Apfel“ / „keine Äpfel“ – mit Zahlwort (einheitlich für die Sprachausgabe). */
  Z.count = (n, w) => {
    if (n === 0) return `keine ${w.p || w.w}`;
    if (n === 1) return `${w.a === 'die' ? 'eine' : 'ein'} ${w.w}`;
    return `${U.numberWord(n)} ${w.p || w.w}`;
  };

  /* ------------------------------------------------------------------
     Antwortzahlen: richtige Zahl + nahe Nachbarn (typische Fehler), sortiert
     prefer: besondere Ablenker (z. B. 6↔9, Einer allein bei 14 → 4)
     ------------------------------------------------------------------ */
  Z.numberChoices = function (n, count, min, max, prefer = []) {
    const set = new Set([n]);
    for (const x of prefer) {
      if (set.size >= count) break;
      if (Number.isInteger(x) && x >= 0 && x !== n) set.add(x);
    }
    const near = [].concat(U.shuffle([n - 1, n + 1]), U.shuffle([n - 2, n + 2]), U.shuffle([n - 3, n + 3]));
    for (const x of near) {
      if (set.size >= count) break;
      if (x >= min && x <= max) set.add(x);
    }
    let guard = 0;
    while (set.size < count && guard++ < 100) set.add(U.randInt(min, max));
    return Array.from(set).sort((a, b) => a - b);
  };

  /* ------------------------------------------------------------------
     Würfelbild
     ------------------------------------------------------------------ */
  const DICE = {
    1: [[50, 50]],
    2: [[72, 28], [28, 72]],
    3: [[72, 28], [50, 50], [28, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 25], [28, 50], [28, 75], [72, 25], [72, 50], [72, 75]],
  };
  Z.dice = function (n) {
    const box = el('div.z1-dice', { role: 'img', 'aria-label': `Würfel mit ${n}` });
    box._units = (DICE[n] || []).map(([x, y]) => {
      const p = el('span.z1-pip', { style: { left: x + '%', top: y + '%' } });
      box.appendChild(p);
      return p;
    });
    return box;
  };

  /* ------------------------------------------------------------------
     Zehnerfeld: 2 Reihen à 5 Kästchen, zeilenweise gefüllt.
     Obere Fünferreihe rot, untere blau → „5 und 2 sind 7“ sichtbar.
     ------------------------------------------------------------------ */
  Z.tenFrame = function (n) {
    const box = el('div.z1-tf', { role: 'img', 'aria-label': `Zehnerfeld mit ${n}` });
    const units = [];
    for (let i = 0; i < 10; i++) {
      const cell = el('span.z1-tf-cell');
      if (i < n) {
        const d = el('span.z1-dot' + (i < 5 ? '.red' : '.blue'));
        cell.appendChild(d);
        units.push(d);
      }
      box.appendChild(cell);
    }
    box._units = units;
    return box;
  };

  /** Zwei Zehnerfelder (Zehner + Einer) für 0–20. */
  Z.twentyFrame = function (n) {
    const a = Z.tenFrame(Math.min(10, n));
    const b = Z.tenFrame(Math.max(0, n - 10));
    const box = el('div.z1-tf2', { role: 'img', 'aria-label': `Zwanzigerfeld mit ${n}` }, a, b);
    box._units = a._units.concat(b._units);
    box._frames = [a, b];
    return box;
  };

  /* ------------------------------------------------------------------
     Fingerbilder: selbst gezeichnete Hände (SVG), Handrücken-Ansicht wie
     die eigenen Hände des Kindes. Gezählt wird – wie in Deutschland üblich –
     ab dem Daumen: Daumen, Zeigefinger, Mittelfinger, Ringfinger, kleiner Finger.
     Bis 5: eine Hand; 6–10: linke Hand voll (5) + rechte Hand.
     Hautfarben wechseln (inklusiv).
     ------------------------------------------------------------------ */
  const SKINS = [
    ['#f8d6ba', '#cf9a76'],
    ['#efbd96', '#c48459'],
    ['#d49c6c', '#a26b3d'],
    ['#a96d45', '#7a4a2a'],
    ['#7d4c2e', '#55321d'],
  ];
  // Geometrie der RECHTEN Hand (Daumen links), viewBox 0 0 100 122. Reihenfolge = Zählreihenfolge.
  const FINGERS = [
    { up: [25, 52, 14, 40], rot: [-32, 32, 90], down: [37, 70, 30, 13], tip: [12, 57] }, // Daumen
    { up: [31, 14, 13, 52], down: [31, 44, 13, 22], tip: [37.5, 15] }, // Zeigefinger
    { up: [45.5, 7, 13, 59], down: [45.5, 42, 13, 24], tip: [52, 8] }, // Mittelfinger
    { up: [60, 13, 13, 53], down: [60, 44, 13, 22], tip: [66.5, 14] }, // Ringfinger
    { up: [74, 26, 12, 40], down: [74, 48, 12, 18], tip: [80, 27] }, // kleiner Finger
  ];
  const r = (x, y, w, h, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" ${extra || ''}/>`;

  /** Eine Hand mit k gestreckten Fingern. opts: { mirror (linke Hand), skin: [fill, stroke] } */
  Z.hand = function (k, opts = {}) {
    const [fill, stroke] = opts.skin || SKINS[0];
    const st = `fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"`;
    let raised = '';
    let folded = '';
    FINGERS.forEach((f, i) => {
      const up = i < k;
      if (i === 0) {
        if (up) raised += r(...f.up, `class="z1-finger" data-f="0" ${st} transform="rotate(${f.rot.join(' ')})"`);
        else folded = r(...f.down, `fill="${fill}" stroke="${stroke}" stroke-width="2.4"`);
      } else if (up) {
        const [x, y, w] = f.up;
        raised += r(...f.up, `class="z1-finger" data-f="${i}" ${st}`);
        raised += `<ellipse cx="${x + w / 2}" cy="${y + 7}" rx="${w / 2 - 2.6}" ry="4.6" fill="#fff" opacity=".45"/>`;
      } else {
        raised += r(...f.down, `${st} style="filter:brightness(.93)"`);
      }
    });
    const svg = `<svg viewBox="0 0 100 122" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${r(40, 96, 36, 26, `fill="${fill}" stroke="${stroke}" stroke-width="2.4"`)}
      <rect x="29" y="50" width="58" height="56" rx="20" ${st}/>
      ${raised}
      <rect x="31.5" y="57" width="53" height="47" rx="17" fill="${fill}"/>
      <rect x="40.5" y="99" width="35" height="22" fill="${fill}"/>
      ${folded}
    </svg>`;
    const art = el('div.z1-hand-art' + (opts.mirror ? '.mirror' : ''), { html: svg });
    const layer = el('div.z1-hand-layer');
    const box = el('div.z1-hand', art, layer);
    const fingerEls = art.querySelectorAll('.z1-finger');
    box._units = [];
    fingerEls.forEach((fe) => {
      const i = Number(fe.getAttribute('data-f'));
      const [tx, ty] = FINGERS[i].tip;
      const x = opts.mirror ? 100 - tx : tx;
      const a = el('span.z1-anchor', { style: { left: x + '%', top: (ty / 122) * 100 + '%' } });
      a._svg = fe;
      layer.appendChild(a);
      box._units.push(a);
    });
    return box;
  };

  /** Fingerbild für n (0–10). opts.skin optional (sonst zufällig). */
  Z.hands = function (n, opts = {}) {
    const skin = opts.skin || U.pick(SKINS);
    const box = el('div.z1-hands', { role: 'img', 'aria-label': `${n} Finger` });
    const left = Z.hand(Math.min(5, n), { mirror: true, skin });
    box.appendChild(left);
    box._units = left._units.slice();
    if (n > 5) {
      const right = Z.hand(n - 5, { skin });
      box.appendChild(right);
      box._units = box._units.concat(right._units);
    }
    return box;
  };
  Z.SKINS = SKINS;

  /* ------------------------------------------------------------------
     Ungeordnete Punkte in 1–2 Gruppen (quasi-simultanes Erfassen:
     „hier 3 und da 2“). Fläche 6c × 4c.
     ------------------------------------------------------------------ */
  Z.splitGroups = function (n) {
    if (n <= 3) return [n];
    const opts = { 4: [[2, 2], [3, 1]], 5: [[3, 2], [2, 3], [4, 1]], 6: [[3, 3], [4, 2], [2, 4]], 7: [[4, 3], [3, 4]], 8: [[4, 4]] };
    return U.pick(opts[n] || [[Math.ceil(n / 2), Math.floor(n / 2)]]);
  };
  Z.scatter = function (n, groups) {
    groups = groups || Z.splitGroups(n);
    const W = 6;
    const H = 4;
    const box = el('div.z1-scatter', { role: 'img', 'aria-label': `${n} Punkte` });
    const pts = [];
    // Gruppenmittelpunkte: eine Gruppe in der Mitte, zwei Gruppen deutlich getrennt links/rechts
    const centers = groups.length === 1
      ? [[W / 2 + (Math.random() - 0.5) * 0.6, H / 2 + (Math.random() - 0.5) * 0.4]]
      : [[1.4 + (Math.random() - 0.5) * 0.2, H / 2 + (Math.random() - 0.5) * 0.6], [4.6 + (Math.random() - 0.5) * 0.2, H / 2 + (Math.random() - 0.5) * 0.6]];
    const color = U.pick(['red', 'blue', 'green', 'purple']);
    groups.forEach((g, gi) => {
      const [cx, cy] = centers[gi];
      // Gruppengröße bestimmt den Radius der Punktwolke
      const radius = groups.length === 1 ? 0.8 + 0.22 * g : g <= 2 ? 0.8 : g === 3 ? 0.95 : 1.15;
      const mine = [];
      for (let k = 0; k < g; k++) {
        // „Best Candidate“: aus vielen Zufallspunkten den mit dem größten Abstand nehmen
        let best = null;
        let bestD = -1;
        for (let tries = 0; tries < 200; tries++) {
          const a = Math.random() * Math.PI * 2;
          const r0 = Math.sqrt(Math.random()) * (k === 0 ? radius * 0.6 : radius);
          const p = [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0];
          if (p[0] < 0.45 || p[0] > W - 0.45 || p[1] < 0.45 || p[1] > H - 0.45) continue;
          const d = mine.length ? Math.min(...mine.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1]))) : 1;
          if (d > bestD) { bestD = d; best = p; }
        }
        mine.push(best || [cx, cy]);
      }
      mine.sort((a, b) => a[1] - b[1]); // innerhalb der Gruppe von oben nach unten zählen
      pts.push(...mine);
    });
    box._units = pts.map(([x, y]) => {
      const d = el('span.z1-sdot.' + color, { style: { left: (x / W) * 100 + '%', top: (y / H) * 100 + '%' } });
      box.appendChild(d);
      return d;
    });
    box._groups = groups;
    return box;
  };

  /* ------------------------------------------------------------------
     Dinge (Emoji) in Fünferreihen
     ------------------------------------------------------------------ */
  Z.objects = function (n, emoji) {
    const box = el('div.z1-objs', { role: 'img', 'aria-label': String(n) });
    box._units = [];
    for (let r0 = 0; r0 < Math.ceil(n / 5); r0++) {
      const row = el('div.z1-objs-row');
      for (let i = r0 * 5; i < Math.min(n, r0 * 5 + 5); i++) {
        const o = el('span.z1-obj', U.emoji(emoji));
        row.appendChild(o);
        box._units.push(o);
      }
      box.appendChild(row);
    }
    if (!n) box.appendChild(el('span.z1-empty', U.emoji('🍽️')));
    return box;
  };

  /* ------------------------------------------------------------------
     Zahlenstrahl min..max. nl.mark(n, cls), nl.cell(n), nl.clear()
     ------------------------------------------------------------------ */
  Z.numberLine = function (min, max) {
    const box = el('div.z1-nl', { 'aria-hidden': 'true' });
    const track = el('div.z1-nl-track');
    const cells = {};
    for (let i = min; i <= max; i++) {
      const c = el('div.z1-nl-cell', el('i.z1-nl-tick'), el('span.z1-nl-num', String(i)));
      cells[i] = c;
      track.appendChild(c);
    }
    box.appendChild(track);
    box.cell = (n) => cells[n];
    box.mark = (n, cls = 'on') => cells[n] && cells[n].classList.add(cls);
    box.clear = () => Object.values(cells).forEach((c) => c.classList.remove('on', 'a', 'b', 'pass'));
    box._units = Object.keys(cells).map((k) => cells[k]);
    return box;
  };

  /* ------------------------------------------------------------------
     Mitzählen (Hilfestellung): Flo zeigt auf jedes Element und zählt laut.
     opts: { from: Startzahl-1 (Weiterzählen), keep: Markierungen behalten }
     ------------------------------------------------------------------ */
  Z.markUnit = function (u, num) {
    u.classList.add('z1-on');
    if (u._svg) u._svg.classList.add('z1-on');
    const old = u.querySelector(':scope > .z1-badge');
    if (old) old.remove();
    if (num != null) u.appendChild(el('span.z1-badge', String(num)));
  };
  Z.clearMarks = function (units) {
    (units || []).forEach((u) => {
      u.classList.remove('z1-on', 'z1-point');
      if (u._svg) u._svg.classList.remove('z1-on');
      const b = u.querySelector(':scope > .z1-badge');
      if (b) b.remove();
    });
  };
  Z.countAlong = async function (ctx, units, opts = {}) {
    const from = opts.from || 0;
    Z.clearMarks(units);
    for (let i = 0; i < units.length; i++) {
      if (!ctx.active) return;
      const u = units[i];
      u.classList.add('z1-point');
      Z.markUnit(u, from + i + 1);
      LT.sfx.tone(392 + (from + i) * 28, 0.09, { type: 'triangle', volume: 0.3 });
      await ctx.say(Z.nw(from + i + 1));
      u.classList.remove('z1-point');
      await ctx.sleep(90);
    }
  };

  /** Mehrere Darstellungs-Knoten in einen Rahmen mit Zellgröße packen. */
  Z.wrap = function (cls, node) {
    const w = el('div.' + cls.split(' ').join('.'), node);
    w._units = node._units;
    return w;
  };

  LT.z1 = Z;
})();
