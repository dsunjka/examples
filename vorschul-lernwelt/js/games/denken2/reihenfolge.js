/* ==========================================================================
   Spiel „Was passiert zuerst?“ 🎞️ – zeitlich-logisches Denken.

   Didaktik:
   - Bildgeschichten aus dem Erfahrungsraum des Kindes (Natur, Wachsen,
     Wetter, Küche, Tagesablauf). Das Kind bringt die Bilder in die richtige
     Reihenfolge, indem es sie der Reihe nach antippt; jedes Bild wandert in
     das nächste nummerierte Feld 1 – 2 – 3 – 4 (Zahlen als Ordnungszahlen).
   - Kind kann nicht lesen: Flo benennt jedes Bild zuerst (Kachel leuchtet),
     über den 🔊-Knopf auf jeder Karte kann es jederzeit nochmal gehört werden.
   - Sprache: Nach der Lösung erzählt Flo die Geschichte Satz für Satz nach
     (Feld leuchtet mit) – Vorbild für eigenes Erzählen mit „zuerst, dann,
     zum Schluss“ (Erzählkompetenz, Ursache und Wirkung).
   - Fehler: Ein zu frühes Bild wackelt sanft („Das kommt erst später.“) und
     bleibt nutzbar. Nach 2 Fehlversuchen an derselben Stelle leuchtet das
     richtige Bild und Flo sagt, was als Nächstes passiert (Vormachen).
   - Stufen: 1) „Was war zuerst?“ – 2 Bilder · 2) 3 Schritte ordnen ·
     3) 4 Schritte ordnen · 4) „Was kommt danach?“ – Geschichte gedanklich
     weiterführen und das passende Bild aus 3 auswählen.
   - Alle Geschichten haben EINE eindeutige Reihenfolge (keine Kreisläufe
     wie Jahreszeiten, bei denen man überall anfangen könnte).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const D = LT.d2;

  /* ------------------------------------------------------------------
     Geschichten. Je Schritt:  e = Emoji (oder svg), n = kurzer Name zum
     Benennen der Karte, t = Erzählsatz für das Nacherzählen.
     tag = Themenfeld (Distraktoren in Stufe 4 nur aus ANDEREN Themen),
     nd = als falsche Antwort ungeeignet (würde fast überall passen).
     ------------------------------------------------------------------ */
  const STORIES = [
    { id: 'huhn', tag: 'tier', steps: [
      { e: '🥚', n: 'Ein Ei', t: 'Im Nest liegt ein Ei.' },
      { e: '🐣', n: 'Ein Küken schlüpft', t: 'Knack! Ein Küken schlüpft aus dem Ei.' },
      { e: '🐥', n: 'Ein kleines Küken', t: 'Das kleine Küken piept und wächst.' },
      { e: '🐔', n: 'Ein Huhn', t: 'Aus dem Küken wird ein großes Huhn.' },
    ] },
    { id: 'schmetterling', tag: 'tier', steps: [
      { e: '🐛', n: 'Eine Raupe', t: 'Eine kleine Raupe frisst viele Blätter.' },
      { svg: 'puppe', n: 'Eine Puppe', t: 'Die Raupe spinnt sich ein und wird zu einer Puppe.' },
      { e: '🦋', n: 'Ein Schmetterling', t: 'Aus der Puppe schlüpft ein Schmetterling.' },
    ] },
    { id: 'blume', tag: 'pflanze', steps: [
      { e: '🌱', n: 'Ein kleiner Keim', t: 'Aus der Erde wächst ein kleiner Keim.' },
      { e: '🌿', n: 'Eine größere Pflanze', t: 'Die Pflanze bekommt viele Blätter und wird größer.' },
      { e: '🌻', n: 'Eine Sonnenblume', t: 'Jetzt blüht eine große Sonnenblume.' },
    ] },
    { id: 'apfel', tag: 'pflanze', steps: [
      { e: '🌸', n: 'Eine Blüte', t: 'Im Frühling blüht der Apfelbaum.' },
      { e: '🍏', n: 'Ein kleiner grüner Apfel', t: 'Ein kleiner, grüner Apfel wächst.' },
      { e: '🍎', n: 'Ein reifer roter Apfel', t: 'Im Herbst ist der Apfel rot und reif.' },
      { e: '🧺', n: 'Ein Korb', t: 'Wir pflücken die Äpfel und legen sie in den Korb.' },
    ] },
    { id: 'schneemann', tag: 'wetter', steps: [
      { e: '❄️', n: 'Es schneit', t: 'Es schneit und schneit.' },
      { e: '⛄', n: 'Ein Schneemann', t: 'Die Kinder bauen einen Schneemann.' },
      { e: '☀️', n: 'Die warme Sonne', t: 'Die Sonne scheint und es wird warm.', nd: true },
      { svg: 'pfuetze', n: 'Der Schneemann ist geschmolzen', t: 'Der Schneemann schmilzt. Übrig bleiben nur Hut, Karotte und eine Pfütze.' },
    ] },
    { id: 'regen', tag: 'wetter', steps: [
      { e: '☁️', n: 'Dicke Wolken', t: 'Dicke Wolken ziehen auf.' },
      { e: '🌧️', n: 'Es regnet', t: 'Es regnet.' },
      { e: '🌈', n: 'Ein Regenbogen', t: 'Dann kommt die Sonne heraus und ein Regenbogen leuchtet.' },
    ] },
    { id: 'mensch', tag: 'mensch', steps: [
      { e: '👶', n: 'Ein Baby', t: 'Das ist ein Baby.' },
      { e: '🧒', n: 'Ein Kind', t: 'Das Baby wächst und wird ein Kind.' },
      { e: '🧑', n: 'Ein Erwachsener', t: 'Das Kind wird groß und ist erwachsen.' },
      { e: '🧓', n: 'Ein alter Mensch', t: 'Viele Jahre später ist es alt und hat graue Haare.' },
    ] },
    { id: 'kuchen', tag: 'essen', steps: [
      { e: '🥚🥛', n: 'Eier und Milch', t: 'Wir holen Eier, Milch und Mehl.' },
      { e: '🥣', n: 'Teig in der Schüssel', t: 'Wir rühren alles zu einem Teig.' },
      { svg: 'ofen', svgArg: 'kuchen', n: 'Der Ofen', t: 'Der Kuchen backt im heißen Ofen.' },
      { e: '🎂', n: 'Ein fertiger Kuchen', t: 'Fertig ist der leckere Kuchen!' },
    ] },
    { id: 'pizza', tag: 'essen', steps: [
      { e: '🍅🧀', n: 'Tomaten und Käse', t: 'Wir legen Tomaten und Käse auf den Teig.' },
      { svg: 'ofen', svgArg: 'pizza', n: 'Der Ofen', t: 'Die Pizza backt im heißen Ofen.' },
      { e: '🍕', n: 'Eine fertige Pizza', t: 'Die Pizza ist fertig. Mmh, lecker!' },
    ] },
    { id: 'suppe', tag: 'essen', steps: [
      { e: '🥕🥔', n: 'Karotten und Kartoffeln', t: 'Papa schneidet Karotten und Kartoffeln.' },
      { e: '🍲', n: 'Eine Suppe im Topf', t: 'Im Topf kocht eine leckere Suppe.' },
      { e: '😋', n: 'Lecker', t: 'Alle essen. Mmh, lecker!', nd: true },
    ] },
    { id: 'geburtstag', tag: 'essen', steps: [
      { e: '🎂', n: 'Ein Kuchen mit Kerzen', t: 'Auf dem Geburtstagskuchen brennen Kerzen.' },
      { e: '🌬️', n: 'Pusten', t: 'Ali pustet alle Kerzen aus.', nd: true },
      { e: '🍰', n: 'Ein Stück Kuchen', t: 'Jetzt bekommt jeder ein Stück Kuchen.' },
    ] },
    { id: 'tag', tag: 'alltag', steps: [
      { e: '⏰', n: 'Der Wecker', t: 'Der Wecker klingelt. Guten Morgen!' },
      { e: '🍳', n: 'Das Frühstück', t: 'Wir frühstücken zusammen.' },
      { e: '🎒', n: 'Der Rucksack', t: 'Mit dem Rucksack geht es in den Kindergarten.' },
      { e: '🛌', n: 'Schlafen im Bett', t: 'Am Abend schlafen wir im Bett.', nd: true },
    ] },
    { id: 'ballon', tag: 'spiel', steps: [
      { e: '🎈', n: 'Ein Luftballon', t: 'Tim hat einen roten Luftballon.' },
      { e: '💥', n: 'Peng', t: 'Peng! Der Luftballon platzt.', nd: true },
      { e: '😢', n: 'Traurig', t: 'Oh nein, Tim ist traurig.', nd: true },
    ] },
    { id: 'haus', tag: 'bau', steps: [
      { e: '🧱', n: 'Viele Steine', t: 'Hier liegen viele Steine.' },
      { e: '🏗️', n: 'Ein Kran', t: 'Die Bauleute bauen mit dem Kran ein Haus.' },
      { e: '🏠', n: 'Ein fertiges Haus', t: 'Das Haus ist fertig!' },
    ] },
    { id: 'malen', tag: 'basteln', steps: [
      { e: '📄', n: 'Ein leeres Blatt', t: 'Hier ist ein leeres Blatt Papier.' },
      { e: '🖍️', n: 'Wachsmalstifte', t: 'Mia malt ein buntes Bild.' },
      { e: '🖼️', n: 'Ein Bild im Rahmen', t: 'Das fertige Bild hängt an der Wand.' },
    ] },
    { id: 'anziehen', tag: 'kleidung', steps: [
      { e: '🧦', n: 'Socken', t: 'Zuerst ziehe ich die Socken an.' },
      { e: '👟', n: 'Schuhe', t: 'Dann ziehe ich die Schuhe an.' },
    ] },
    { id: 'haende', tag: 'hygiene', steps: [
      { e: '🧼', n: 'Seife', t: 'Lea wäscht sich mit Seife die Hände.' },
      { e: '🥪', n: 'Ein Brot', t: 'Dann isst sie ihr Brot.' },
    ] },
  ];

  const LEVELS = {
    1: { mode: 'order', n: 2 },
    2: { mode: 'order', n: 3 },
    3: { mode: 'order', n: 4 },
    4: { mode: 'next' },
  };

  /* Größe der Karten je nach Anzahl (passt auch aufs Handy hochkant) */
  const CELL = {
    2: 'clamp(96px, min(34vw, 24vh), 190px)',
    3: 'clamp(84px, min(27vw, 23vh), 180px)',
    4: 'clamp(66px, min(19vw, 21vh), 168px)',
  };

  /** Schlüssel eines Schritts für Vergleiche (Emoji oder SVG) */
  const key = (s) => s.e || s.svg + ':' + (s.svgArg || '');

  /** Feldreihe 1-2-3(-4) aufbauen */
  function buildSlots(n) {
    const row = el('div.rf-slots');
    const slots = [];
    for (let i = 0; i < n; i++) {
      const s = el('div.rf-slot', el('span.rf-num', String(i + 1)), el('span.rf-q', '?'));
      slots.push(s);
      row.appendChild(s);
    }
    return { row, slots };
  }
  function fillSlot(slot, step) {
    const q = slot.querySelector('.rf-q');
    if (q) q.remove();
    slot.appendChild(D.pic(step));
    slot.classList.add('filled');
    LT.ui.animate(slot, 'joy');
  }

  /** Geschichte nacherzählen: Feld für Feld leuchtet, Flo liest den Satz */
  async function retell(ctx, slots, steps) {
    for (let i = 0; i < steps.length; i++) {
      if (!ctx.active) return;
      slots[i].classList.add('rf-telling');
      await ctx.say(steps[i].t);
      slots[i].classList.remove('rf-telling');
      await ctx.sleep(150);
    }
  }

  /* ------------------------------------------------------------------
     Stufen 1–3: Bilder der Reihe nach antippen
     ------------------------------------------------------------------ */
  async function orderTask(ctx, cfg) {
    const pool = STORIES.filter((s) => s.steps.length >= cfg.n);
    const story = U.pickFresh('rf-story-' + cfg.n, pool, Math.min(5, pool.length - 1), (s) => s.id);
    let steps;
    if (cfg.n === 2 && story.steps.length > 2) {
      // Stufe 1: zwei deutlich auseinanderliegende Schritte (z. B. Ei und Huhn)
      const L = story.steps.length;
      const i = U.randInt(0, L - 3);
      const j = U.randInt(i + 2, L - 1);
      steps = [story.steps[i], story.steps[j]];
    } else {
      steps = story.steps.slice(0, cfg.n);
    }
    const n = steps.length;
    ctx.stage.style.setProperty('--rf-cell', CELL[n]);

    const { row, slots } = buildSlots(n);
    const cards = el('div.rf-cards' + (n === 4 ? '.rf-n4' : ''));
    ctx.stage.appendChild(row);
    ctx.stage.appendChild(el('div.rf-arrow-down', U.emoji('👆')));
    ctx.stage.appendChild(cards);

    // Karten gemischt (nie schon in der richtigen Reihenfolge)
    let order = U.shuffle(U.range(0, n - 1));
    while (order.every((v, k) => v === k)) order = U.shuffle(order);
    const tiles = order.map((idx) => {
      const t = LT.ui.tile(D.pic(steps[idx]), { say: steps[idx].n, sayButton: true, className: 'rf-card' });
      t._idx = idx;
      cards.appendChild(t);
      return t;
    });

    let busy = true;
    let next = 0;
    let slotWrong = 0;
    let done = null;
    const finished = new Promise((r) => { done = r; });

    const markNext = () => {
      tiles.forEach((t) => ctx.markTest(t, false));
      const t = tiles.find((x) => x._idx === next);
      if (t) ctx.markTest(t);
    };

    // Flo benennt die Bilder
    for (const t of tiles) {
      if (!ctx.active) return;
      t.classList.add('speaking');
      await ctx.say(steps[t._idx].n);
      t.classList.remove('speaking');
      await ctx.sleep(120);
    }
    if (!ctx.active) return;
    const question = n === 2
      ? 'Was passiert zuerst? Tippe das Bild an, das zuerst kommt.'
      : 'Bring die Bilder in die richtige Reihenfolge! Tippe zuerst an, was zuerst passiert – und dann immer weiter.';
    ctx.instruct(question);
    busy = false;
    markNext();

    const place = async (t) => {
      fillSlot(slots[next], steps[next]);
      t.classList.add('rf-used');
      ctx.markTest(t, false);
      ctx.unhint(t);
      LT.sfx.play('pop');
      next++;
      slotWrong = 0;
    };

    tiles.forEach((t) => {
      t.addEventListener('click', async () => {
        if (busy || !ctx.active || t.classList.contains('rf-used')) return;
        busy = true;
        if (t._idx === next) {
          await place(t);
          // Stufe 1: das zweite Bild rutscht von allein nach
          if (n === 2 && next === 1) {
            await ctx.sleep(450);
            const last = tiles.find((x) => x._idx === 1);
            await place(last);
          }
          if (next >= n) {
            await ctx.correct(row, { say: n === 2 ? 'Richtig, das passiert zuerst! Hör mal:' : 'Super, die Reihenfolge stimmt! Hör mal:' });
            await retell(ctx, slots, steps);
            done();
            return;
          }
          markNext();
          busy = false;
        } else {
          slotWrong++;
          await ctx.wrong(t, { say: next === 0 ? 'Hmm, war das wirklich zuerst? Überleg nochmal.' : 'Das kommt erst später. Was passiert davor?' });
          t.classList.remove('is-wrong');
          if (slotWrong >= 2 && ctx.active) {
            const right = tiles.find((x) => x._idx === next);
            ctx.hint(right);
            await ctx.say(`${next === 0 ? 'Schau mal, dieses Bild kommt zuerst' : 'Schau mal, dieses Bild kommt als Nächstes'}: ${steps[next].n}.`);
          }
          busy = false;
        }
      });
    });
    await finished;
  }

  /* ------------------------------------------------------------------
     Stufe 4: „Was kommt danach?“ – passendes Bild auswählen
     ------------------------------------------------------------------ */
  async function nextTask(ctx) {
    const pool = STORIES.filter((s) => s.steps.length >= 3);
    const story = U.pickFresh('rf-story-next', pool, 6, (s) => s.id);
    const steps = story.steps;
    const n = steps.length;
    const answer = steps[n - 1];
    ctx.stage.style.setProperty('--rf-cell', CELL[n === 3 ? 3 : 4]);

    const { row, slots } = buildSlots(n);
    ctx.stage.appendChild(row);
    for (let i = 0; i < n - 1; i++) fillSlot(slots[i], steps[i]);
    slots[n - 1].classList.add('rf-missing');

    // Falsche Antworten: Bilder aus anderen Themen, nicht doppelt
    const own = new Set(steps.map(key));
    const cand = [];
    STORIES.filter((s) => s.tag !== story.tag).forEach((s) => s.steps.forEach((st) => {
      if (!st.nd && !own.has(key(st)) && !cand.find((c) => key(c) === key(st))) cand.push(st);
    }));
    const wrongs = U.sample(cand, 2);

    // Geschichte bis hierhin erzählen
    await ctx.say('Hör dir die Geschichte an.');
    for (let i = 0; i < n - 1; i++) {
      if (!ctx.active) return;
      slots[i].classList.add('rf-telling');
      await ctx.say(steps[i].t);
      slots[i].classList.remove('rf-telling');
    }
    if (!ctx.active) return;
    ctx.instruct('Was passiert als Nächstes? Tippe das richtige Bild an.');

    const items = [answer, ...wrongs].map((st) => ({
      content: D.pic(st),
      correct: st === answer,
      say: st.n,
      className: 'rf-card',
    }));
    const box = el('div.choices.rf-cards');
    ctx.stage.appendChild(box);
    await ctx.choices(items, {
      container: box,
      nameFirst: true,
      sayButton: true,
      hintAfter: 2,
      hintSay: 'Schau mal, das hier passt zur Geschichte.',
      correctSay: 'Genau, das passiert als Nächstes! Hör mal die ganze Geschichte:',
      wrongSay: 'Passt das zur Geschichte? Überleg nochmal.',
      onCorrect: () => {
        slots[n - 1].classList.remove('rf-missing');
        fillSlot(slots[n - 1], answer);
      },
    });
    await retell(ctx, slots, steps);
  }

  LT.registerGame({
    id: 'reihenfolge',
    area: 'denken',
    title: 'Was passiert zuerst?',
    icon: '🎞️',
    levels: 4,
    rounds: 4,
    parent: {
      skill: 'Zeitlich-logisches Denken & Erzählen',
      goal: 'Ihr Kind erkennt, was zuerst, danach und zum Schluss passiert, versteht Ursache und Wirkung (der Schneemann schmilzt, WEIL die Sonne scheint) und hört, wie man eine Geschichte in der richtigen Reihenfolge erzählt.',
      levels: [
        'Was war zuerst? – zwei Bilder einer Geschichte (z. B. Ei und Huhn)',
        'Drei Bilder in die richtige Reihenfolge bringen',
        'Vier Bilder in die richtige Reihenfolge bringen',
        'Was kommt danach? – die Geschichte im Kopf weiterdenken und das passende Bild wählen',
      ],
      tip: 'Erzählen Sie gemeinsam den Tag nach: „Was haben wir zuerst gemacht? Und dann?“ Auch beim Backen, Anziehen oder Pflanzen lassen sich die Schritte gut benennen.',
    },
    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      if (cfg.mode === 'next') await nextTask(ctx);
      else await orderTask(ctx, cfg);
    },
  });
})();
