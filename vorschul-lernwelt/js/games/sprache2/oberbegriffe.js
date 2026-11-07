/* ==========================================================================
   Spiel „Sortier-Profi“ (oberbegriffe) – Klassifizieren & Oberbegriffe

   Didaktik:
   - Kategorien aus dem Bild-Wort-Lexikon (Tiere, Obst, Gemüse, Fahrzeuge,
     Kleidung, Spielzeug, Musikinstrumente, Essen und Trinken, Pflanzen).
     Für jede Kategorie gibt es eine sorgfältig geprüfte Auswahl eindeutiger
     Dinge (z. B. kein Pilz bei Gemüse, keine Brille bei Kleidung, kein Roller
     bei Fahrzeugen, weil er auch Spielzeug sein kann).
   - Kategorien, die sich überschneiden, kommen nie gemeinsam vor
     (Obst/Gemüse ↔ Essen, Obst/Gemüse ↔ Pflanzen, Spielzeug ↔ Fahrzeuge/Musik).
   - Jede Zuordnung wird sprachlich begründet („Die Kuh ist ein Tier.“) –
     so wird aus dem Sortieren ein Begriff.
   - Progression (konkret → abstrakt):
       1  „Was davon ist Obst?“ – 1 aus 3 Bildern
       2  Dinge in 2 Körbe sortieren (antippen + Korb antippen ODER ziehen)
       3  Dinge in 3 Körbe sortieren
       4  Oberbegriff finden: „Apfel, Birne, Banane – das sind alles …?“
   - Hilfe: Nach 2 Fehlversuchen nennt Flo das Merkmal der Kategorie bzw. die
     richtige Zuordnung und hebt den passenden Korb hervor.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* ---------------- Kategorien ---------------- */
  const CATS = {
    tiere: {
      name: 'Tiere', icon: '🐾', q: 'Was davon ist ein Tier?', one: 'ist ein Tier', no: 'ist kein Tier', all: 'sind Tiere',
      into: 'In diesen Korb kommen die Tiere.', tip: 'Tiere leben und können sich bewegen.', ids: null,
    },
    obst: {
      name: 'Obst', icon: '🍏', q: 'Was davon ist Obst?', one: 'ist Obst', no: 'ist kein Obst', all: 'sind Obst',
      into: 'In diesen Korb kommt das Obst.', tip: 'Obst, das sind Früchte. Sie schmecken oft süß und saftig.',
      ids: ['apfel', 'birne', 'banane', 'erdbeere', 'kirsche', 'traube', 'orange', 'zitrone', 'melone', 'ananas', 'pfirsich', 'kiwi'],
    },
    gemuese: {
      name: 'Gemüse', icon: '🥗', q: 'Was davon ist Gemüse?', one: 'ist Gemüse', no: 'ist kein Gemüse', all: 'sind Gemüse',
      into: 'In diesen Korb kommt das Gemüse.', tip: 'Gemüse ist nicht so süß wie Obst. Oft kocht man es, zum Beispiel für eine Suppe.',
      ids: ['karotte', 'gurke', 'tomate', 'mais', 'kartoffel', 'brokkoli', 'zwiebel', 'salat'],
    },
    essen: {
      name: 'Essen und Trinken', icon: '🍽️', q: 'Was davon kann man essen oder trinken?', one: null, no: 'kann man nicht essen', all: null,
      into: 'In diesen Korb kommt alles zum Essen und Trinken.', tip: 'Das kann man essen oder trinken.',
      ids: ['brot', 'kaese', 'ei', 'milch', 'pizza', 'eis', 'torte', 'keks', 'honig', 'brezel', 'lutscher', 'schokolade', 'wuerstchen', 'muffin', 'donut', 'saft', 'popcorn', 'hamburger'],
    },
    fahrzeuge: {
      name: 'Fahrzeuge', icon: '🚦', q: 'Was davon ist ein Fahrzeug?', one: 'ist ein Fahrzeug', no: 'ist kein Fahrzeug', all: 'sind Fahrzeuge',
      into: 'In diesen Korb kommen die Fahrzeuge.', tip: 'Mit Fahrzeugen kommt man von einem Ort zum anderen.',
      ids: ['auto', 'bus', 'zug', 'fahrrad', 'flugzeug', 'hubschrauber', 'rakete', 'traktor', 'feuerwehrauto', 'polizeiauto', 'krankenwagen', 'schiff', 'segelboot', 'taxi', 'lastwagen', 'motorrad', 'kanu'],
    },
    kleidung: {
      name: 'Kleidung', icon: '👕', q: 'Was davon ist Kleidung?', one: 'gehört zur Kleidung', no: 'gehört nicht zur Kleidung', all: 'gehören zur Kleidung',
      into: 'In diesen Korb kommt die Kleidung.', tip: 'Kleidung trägt man am Körper.',
      ids: ['hemd', 'hose', 'kleid', 'socke', 'handschuh', 'schal', 'hut', 'kappe', 'schuh', 'stiefel', 'jacke'],
    },
    spielzeug: {
      name: 'Spielzeug', icon: '🧸', q: 'Was davon ist ein Spielzeug?', one: 'ist ein Spielzeug', no: 'ist kein Spielzeug', all: 'sind Spielzeug',
      into: 'In diesen Korb kommt das Spielzeug.', tip: 'Mit Spielzeug kann man spielen.',
      ids: ['ball', 'drachen', 'luftballon', 'puzzle', 'wuerfel', 'roboter'], // Teddy ist das Korb-Symbol
    },
    musik: {
      name: 'Musikinstrumente', label: 'Musik\u00ADinstrumente', icon: '🎵', q: 'Was davon ist ein Musikinstrument?', one: 'ist ein Musikinstrument', no: 'ist kein Musikinstrument', all: 'sind Musikinstrumente',
      into: 'In diesen Korb kommen die Musikinstrumente.', tip: 'Mit Musikinstrumenten macht man Musik.',
      ids: ['trommel', 'gitarre', 'trompete', 'klavier', 'geige', 'saxofon'],
    },
    pflanzen: {
      name: 'Pflanzen', icon: '🌱', q: 'Was davon ist eine Pflanze?', one: 'ist eine Pflanze', no: 'ist keine Pflanze', all: 'sind Pflanzen',
      into: 'In diesen Korb kommen die Pflanzen.', tip: 'Pflanzen wachsen aus der Erde.',
      ids: ['baum', 'tanne', 'tulpe', 'sonnenblume', 'rose', 'kaktus', 'kleeblatt'],
    },
  };
  const CAT_IDS = Object.keys(CATS);
  /** Kategorien, die sich überschneiden (nie gemeinsam in einer Aufgabe). */
  const CONFLICT = [['essen', 'obst'], ['essen', 'gemuese'], ['pflanzen', 'obst'], ['pflanzen', 'gemuese'], ['spielzeug', 'fahrzeuge'], ['spielzeug', 'musik']];
  /** Einzelne Dinge, die neben einer bestimmten Kategorie missverständlich wären. */
  const EXCLUDE_NEXT_TO = {
    tiere: ['drachen'], // „Drachen“ (auch Fabeltier) nicht neben Tieren
    essen: ['fisch', 'krabbe', 'krake', 'huhn', 'hahn', 'ente', 'kuh', 'schwein', 'wildschwein', 'schaf', 'ziege', 'hirsch'], // Tiere, die man auch als Essen kennt
  };
  const conflicts = (a, b) => a === b || CONFLICT.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

  /** Dinge einer Kategorie, passend zu den übrigen Kategorien der Aufgabe. */
  function itemsOf(cat, others) {
    const c = CATS[cat];
    let list = c.ids ? c.ids.map((id) => LT.lexikon.get(id)).filter(Boolean) : LT.lexikon.byCat(cat);
    const ex = new Set();
    others.forEach((o) => (EXCLUDE_NEXT_TO[o] || []).forEach((id) => ex.add(id)));
    return list.filter((w) => !ex.has(w.id));
  }
  /** k verträgliche Kategorien zufällig wählen (die erste ohne direkte Wiederholung). */
  function pickCats(k, key) {
    for (let tries = 0; tries < 50; tries++) {
      const first = U.pickFresh(key, CAT_IDS, 3);
      const rest = U.shuffle(CAT_IDS.filter((c) => !conflicts(first, c)));
      const res = [first];
      for (const c of rest) {
        if (res.length >= k) break;
        if (res.every((r) => !conflicts(r, c))) res.push(c);
      }
      if (res.length === k) return res;
    }
    return ['tiere', 'fahrzeuge', 'kleidung'].slice(0, k);
  }

  const Art = (w) => U.cap(w.a) + ' ' + w.w;
  const art = (w) => w.a + ' ' + w.w;
  /** Akkusativ für „… kann man essen“: „Den Käse kann man essen.“ */
  const ACC = { der: 'den', die: 'die', das: 'das' };
  const ArtAcc = (w) => U.cap(ACC[w.a] || w.a) + ' ' + w.w;
  const isDrink = (w) => ['milch', 'saft'].includes(w.id);
  /** „Die Kuh ist ein Tier.“ / „Den Saft kann man trinken.“ */
  function because(w, cat) {
    if (cat === 'essen') return `${ArtAcc(w)} kann man ${isDrink(w) ? 'trinken' : 'essen'}.`;
    return `${Art(w)} ${CATS[cat].one}.`;
  }
  /** „Der Apfel ist kein Tier.“ / „Den Ball kann man nicht essen.“ */
  function notIn(w, cat, midSentence = false) {
    const t = cat === 'essen' ? `${ArtAcc(w)} kann man nicht essen.` : `${Art(w)} ${CATS[cat].no}.`;
    return midSentence ? t.charAt(0).toLowerCase() + t.slice(1) : t;
  }
  /** „Apfel, Birne und Banane sind Obst.“ / „… kann man essen (und trinken).“ */
  function allText(words, cat) {
    if (cat !== 'essen') return `${listText(words)} ${CATS[cat].all}.`;
    const drinks = words.filter(isDrink).length;
    const verb = drinks === 0 ? 'essen' : drinks === words.length ? 'trinken' : 'essen oder trinken';
    return `${listText(words)} – das alles kann man ${verb}.`;
  }
  function listText(words) {
    const names = words.map((w) => w.w);
    return names.slice(0, -1).join(', ') + ' und ' + names[names.length - 1];
  }

  /** Korb-Symbol (Kategorie) als Karte. */
  function catBadge(cat, cls = '') {
    return el('div.sort-badge' + (cls ? '.' + cls : ''), el('span.emoji.sort-badge-icon', CATS[cat].icon), el('span.sort-badge-name', CATS[cat].label || CATS[cat].name));
  }

  /* ---------------- Stufe 1: Was gehört dazu? ---------------- */
  async function whichBelongs(ctx) {
    const [cat, o1, o2] = pickCats(3, 'sort-l1');
    const target = U.pickFresh('sort-item-' + cat, itemsOf(cat, [o1, o2]), 4, (w) => w.id);
    const d1 = U.pick(itemsOf(o1, [cat]));
    const d2 = U.pick(itemsOf(o2, [cat]));
    const card = el('div.prompt-box.sort-l1-card', el('div.sort-basket-big', el('span.emoji.sort-basket-emoji', '🧺'), catBadge(cat)));
    ctx.stage.appendChild(card);
    await ctx.instruct(CATS[cat].q);
    if (!ctx.active) return;
    const items = [target, d1, d2].map((w) => ({ content: w.e, correct: w === target, say: art(w), w }));
    await ctx.choices(items, {
      nameFirst: true,
      sayButton: true,
      size: 'large',
      hintAfter: 2,
      wrongSay: (item) => `Hmm, ${notIn(item.w, cat, true)}`,
      hintSay: CATS[cat].tip,
      correctSay: `Richtig! ${because(target, cat)}`,
    });
  }

  /* ---------------- Stufe 4: Oberbegriff finden ---------------- */
  async function findTerm(ctx) {
    const [cat, o1, o2] = pickCats(3, 'sort-l4');
    const words = U.sample(itemsOf(cat, []), 3);
    const row = el('div.sort-trio', words.map((w) => el('div.sort-trio-item', U.emoji(w.e), el('span', w.w))));
    ctx.stage.appendChild(el('div.prompt-box.sort-trio-card', row));
    await ctx.instruct(`${words.map((w) => w.w).join(', ')}. Das sind alles …?`);
    if (!ctx.active) return;
    const items = [cat, o1, o2].map((c) => ({ content: catBadge(c, 'in-tile'), correct: c === cat, say: CATS[c].name, className: 'sort-termtile', aria: CATS[c].name, value: c }));
    await ctx.choices(items, {
      nameFirst: true,
      sayButton: true,
      hintAfter: 2,
      wrongSay: (item) => `Hmm, ${CATS[item.value].name}? Das passt nicht zu allen drei.`,
      hintSay: `${CATS[cat].tip}`,
      correctSay: `Richtig! ${allText(words, cat)}`,
    });
  }

  /* ---------------- Stufe 2 + 3: In Körbe sortieren ---------------- */
  async function sortIntoBaskets(ctx, nCats) {
    const cats = pickCats(nCats, 'sort-bins-' + nCats);
    const perCat = nCats === 2 ? 3 : 2;
    const things = [];
    cats.forEach((c) => {
      U.sample(itemsOf(c, cats.filter((x) => x !== c)), perCat).forEach((w) => things.push({ w, cat: c }));
    });
    const list = U.shuffle(things);

    // --- Aufbau: oben die Dinge, unten die Körbe ---
    const pile = el('div.sort-pile' + (list.length > 6 ? '.many' : ''));
    const binsRow = el('div.sort-bins.n' + nCats);
    const bins = cats.map((c) => {
      const content = el('div.sort-bin-content');
      const b = el('button.sort-bin', { type: 'button', 'aria-label': 'Korb für ' + CATS[c].name },
        catBadge(c),
        el('div.sort-bin-basket', content)
      );
      b._cat = c;
      b._content = content;
      binsRow.appendChild(b);
      return b;
    });
    list.forEach((t) => {
      const node = el('button.sort-item', { type: 'button', 'aria-label': t.w.w }, U.emoji(t.w.e));
      t.node = node;
      t.wrong = 0;
      node._thing = t;
      pile.appendChild(node);
    });
    ctx.stage.appendChild(pile);
    ctx.stage.appendChild(binsRow);

    // --- Erklärung: Körbe vorstellen ---
    let busy = true;
    for (const b of bins) {
      if (!ctx.active) return;
      b.classList.add('speaking');
      await ctx.say(CATS[b._cat].into);
      b.classList.remove('speaking');
    }
    if (!ctx.active) return;
    const how = ctx.index === 0
      ? 'Tippe ein Bild an und dann den richtigen Korb. Du kannst die Bilder auch in den Korb ziehen.'
      : 'Sortiere alles in den richtigen Korb!';
    ctx.setInstruction(`Sortiere! ${bins.map((b) => CATS[b._cat].into).join(' ')} ${how}`);
    await ctx.say(how);
    busy = false;

    return new Promise((resolve) => {
      let selected = null;
      let left = list.length;

      const updateTestMarks = () => {
        list.forEach((t) => ctx.markTest(t.node, false));
        bins.forEach((b) => ctx.markTest(b, false));
        if (!LT.config.test) return;
        if (selected) ctx.markTest(bins.find((b) => b._cat === selected.cat));
        else {
          const next = list.find((t) => !t.done);
          if (next) ctx.markTest(next.node);
        }
      };

      function select(t) {
        if (selected && selected !== t) selected.node.classList.remove('selected');
        selected = t;
        t.node.classList.add('selected');
        bins.forEach((b) => ctx.unhint(b));
        if (t.wrong >= 2) ctx.hint(bins.find((b) => b._cat === t.cat));
        LT.sfx.play('pop');
        ctx.say(art(t.w));
        updateTestMarks();
      }

      async function drop(t, bin) {
        if (busy || t.done) return;
        if (bin._cat === t.cat) {
          // richtig: Ding wandert in den Korb
          t.done = true;
          t.node.classList.remove('selected');
          t.node.classList.add('done');
          if (selected === t) selected = null;
          bins.forEach((b) => ctx.unhint(b));
          const mini = U.emoji(t.w.e, 'sort-mini');
          bin._content.appendChild(mini);
          LT.ui.animate(bin, 'joy');
          LT.sfx.play('correct');
          left--;
          updateTestMarks();
          if (left === 0) {
            busy = true;
            await ctx.say(because(t.w, t.cat));
            await ctx.correct(binsRow, { say: U.pick(['Super sortiert! Alles ist im richtigen Korb.', 'Toll! Du bist ein echter Sortier-Profi!', 'Prima! Alles ist richtig sortiert.']) });
            resolve();
          } else {
            ctx.say(because(t.w, t.cat));
          }
        } else {
          busy = true;
          t.wrong++;
          LT.ui.animate(bin, 'shake');
          await ctx.wrong(t.node, { say: `Hmm, ${notIn(t.w, bin._cat, true)} Probier einen anderen Korb!` });
          t.node.classList.remove('is-wrong');
          if (t.wrong >= 2 && ctx.active) {
            const right = bins.find((b) => b._cat === t.cat);
            ctx.hint(right);
            await ctx.say(`${because(t.w, t.cat)} ${CATS[t.cat].tip}`);
          }
          busy = false;
          if (!t.done) { t.node.classList.add('selected'); updateTestMarks(); }
        }
      }

      // Antippen: Ding auswählen, dann Korb antippen
      list.forEach((t) => {
        t.node.addEventListener('click', () => {
          if (busy || t.done || t.node._suppressClick) return;
          select(t);
        });
      });
      bins.forEach((b) => {
        b.addEventListener('click', () => {
          if (busy) return;
          if (selected) drop(selected, b);
          else {
            LT.ui.animate(b, 'joy');
            ctx.say(`Das ist der Korb für ${CATS[b._cat].name}. Tippe zuerst ein Bild an!`);
          }
        });
      });

      // Ziehen mit Finger oder Maus (Pointer Events)
      list.forEach((t) => enableDrag(ctx, t, bins, {
        canStart: () => !busy && !t.done,
        onStart: () => select(t),
        onDrop: (bin) => drop(t, bin),
      }));

      updateTestMarks();
    });
  }

  /** Ziehen eines Dings: Geisterbild folgt dem Finger, Korb darunter leuchtet. */
  function enableDrag(ctx, t, bins, { canStart, onStart, onDrop }) {
    const node = t.node;
    let start = null;
    let ghost = null;
    let over = null;
    const binAt = (x, y) => {
      const hit = document.elementFromPoint(x, y);
      return hit ? bins.find((b) => b.contains(hit)) || null : null;
    };
    const endDrag = () => {
      if (ghost) ghost.remove();
      ghost = null;
      if (over) over.classList.remove('over');
      over = null;
      node.classList.remove('dragging');
      start = null;
    };
    ctx.onCleanup(endDrag);

    node.addEventListener('pointerdown', (e) => {
      if (!canStart() || (e.button !== undefined && e.button !== 0)) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      try { node.setPointerCapture(e.pointerId); } catch (err) { /* ignorieren */ }
    });
    node.addEventListener('pointermove', (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!ghost) {
        if (Math.hypot(dx, dy) < 10 || !canStart()) return;
        onStart();
        const r = node.getBoundingClientRect();
        ghost = el('div.sort-ghost', { style: { width: r.width + 'px', height: r.height + 'px', fontSize: r.width * 0.62 + 'px' } }, U.emoji(t.w.e));
        document.body.appendChild(ghost);
        node.classList.add('dragging');
      }
      ghost.style.left = e.clientX - ghost.offsetWidth / 2 + 'px';
      ghost.style.top = e.clientY - ghost.offsetHeight / 2 + 'px';
      const b = binAt(e.clientX, e.clientY);
      if (b !== over) {
        if (over) over.classList.remove('over');
        over = b;
        if (over) over.classList.add('over');
      }
    });
    const finish = (e) => {
      if (!start || e.pointerId !== start.id) return;
      const wasDrag = !!ghost;
      const target = wasDrag ? binAt(e.clientX, e.clientY) : null;
      endDrag();
      if (wasDrag) {
        // der Klick nach dem Loslassen soll nicht noch einmal auswählen
        node._suppressClick = true;
        ctx.timeout(() => { node._suppressClick = false; }, 350);
        if (target) onDrop(target);
      }
    };
    node.addEventListener('pointerup', finish);
    node.addEventListener('pointercancel', (e) => { if (start && e.pointerId === start.id) endDrag(); });
  }

  LT.registerGame({
    id: 'oberbegriffe',
    area: 'sprache',
    title: 'Sortier-Profi',
    icon: '🧺',
    levels: 4,
    rounds: 4,
    intro: 'Hier wird sortiert! Was gehört zusammen?',
    parent: {
      skill: 'Oberbegriffe & Klassifizieren',
      goal: 'Ihr Kind ordnet Dinge nach gemeinsamen Merkmalen und lernt Oberbegriffe wie Tiere, Obst, Gemüse, Fahrzeuge, Kleidung oder Musikinstrumente. Das ordnet den Wortschatz im Kopf (semantisches Netz), unterstützt das Gedächtnis und ist eine wichtige Grundlage für logisches Denken und Sachunterricht.',
      levels: [
        '„Was davon ist Obst?“ – das passende Bild unter dreien finden',
        'Sechs Dinge in zwei Körbe sortieren (antippen und Korb antippen oder ziehen)',
        'Sechs Dinge in drei Körbe sortieren',
        'Oberbegriff selbst finden: „Apfel, Birne, Banane – das sind alles …?“',
      ],
      tip: 'Lassen Sie Ihr Kind beim Einräumen helfen: Einkäufe nach Obst, Gemüse und Getränken sortieren, Spielsachen in Kisten, Wäsche nach Socken und Hosen. Fragen Sie nach: „Warum gehört das dazu?“',
    },

    async task(ctx) {
      if (ctx.level === 1) return whichBelongs(ctx);
      if (ctx.level === 2) return sortIntoBaskets(ctx, 2);
      if (ctx.level === 3) return sortIntoBaskets(ctx, 3);
      return findTerm(ctx);
    },
  });
})();
