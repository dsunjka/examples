/* ==========================================================================
   Spiel „Groß und klein“ 📏 – Vergleichen und der Größe nach ordnen
   (Seriation).

   Didaktik:
   - Seriation (nach Piaget eine Kernfähigkeit des vorschulischen Denkens):
     Das Kind vergleicht mehrere Dinge und ordnet sie in eine Reihe. Die
     angetippten Dinge wandern auf ein Regal und bilden sichtbar eine
     „Treppe“ – so wird die Ordnung anschaulich.
   - Wortschatz der Vergleiche: groß/klein, lang/kurz, hoch/niedrig mit
     Steigerung („größer“, „am größten“) – korrekt dekliniert vorgelesen.
   - Ein kleines Richtungsbild (klein ➜ groß) zeigt ohne Lesen, wo begonnen
     wird. Fehler werden freundlich kommentiert („Gibt es noch einen
     kleineren?“); nach 2 Fehlversuchen leuchtet das gesuchte Ding auf.
   - Progression:
       1  Welcher ist der größte / kleinste? (3 Dinge, deutliche Unterschiede)
       2  3 Dinge vom kleinsten zum größten ordnen
       3  4–5 Dinge ordnen (kleinere Unterschiede)
       4  Länge und Höhe: Stifte (kurz → lang) und Türme (niedrig → hoch)
       5  umgekehrte Richtung (vom größten zum kleinsten …), 5 Dinge,
          Stifte liegen versetzt – erst am Regal (gemeinsame Startlinie)
          wird die Länge sichtbar verglichen.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const FM = LT.fm;

  /** Dinge, die es in verschiedenen Größen gibt (Wörter, Artikel, Plural aus dem Lexikon). */
  const THING_IDS = ['baer', 'fisch', 'luftballon', 'baum', 'haus', 'elefant', 'apfel', 'geschenk', 'schildkroete', 'ente',
    'sonnenblume', 'auto', 'stern', 'schnecke', 'teddy', 'dino', 'katze', 'hund', 'frosch', 'erdbeere', 'tanne', 'pinguin',
    'pilz', 'hase', 'schaf', 'kueken', 'tulpe', 'maus', 'igel', 'eule'];
  const things = () => THING_IDS.map((id) => LT.lexikon.get(id)).filter((w) => w && w.p);

  /* ------------------------------------------------------------------
     Sprache: Steigerung und Deklination
     sup = Superlativ-Stamm, cmp = Komparativ
     ------------------------------------------------------------------ */
  const DIM = {
    groesse: { noun: 'Größe', supS: 'kleinst', supB: 'größt', cmpS: 'kleiner', cmpB: 'größer' },
    laenge: { noun: 'Länge', supS: 'kürzest', supB: 'längst', cmpS: 'kürzer', cmpB: 'länger' },
    hoehe: { noun: 'Höhe', supS: 'niedrigst', supB: 'höchst', cmpS: 'niedriger', cmpB: 'höher' },
  };
  const STIFT = { w: 'Stift', a: 'der', p: 'Stifte' };
  const TURM = { w: 'Turm', a: 'der', p: 'Türme' };
  /** „der größte“ (Nominativ, schwache Endung) */
  const nomSup = (art, stem) => `${art} ${stem}e`;
  /** „den kleinsten“ / „die kleinste“ / „das kleinste“ (Akkusativ, substantiviert) */
  const accSup = (art, stem) => (art === 'der' ? `den ${stem}en` : `${art} ${stem}e`);
  /** „einen kleineren“ / „eine kleinere“ / „ein kleineres“ */
  const accCmp = (art, cmp) => (art === 'der' ? `einen ${cmp}en` : art === 'die' ? `eine ${cmp}e` : `ein ${cmp}es`);
  /** Dativ Plural: „den Bären“, „den Stiften“, „den Türmen“ (+n außer nach -n/-s) */
  const datPl = (p) => (/[ns]$/.test(p) ? p : p + 'n');
  /** „vom kleinsten bis zum größten“ */
  const fromTo = (first, last) => `vom ${first}en bis zum ${last}en`;

  const SCALES = { 3: [0.42, 0.7, 1], 4: [0.4, 0.6, 0.8, 1], 5: [0.36, 0.52, 0.68, 0.84, 1] };
  const LENGTHS = { 3: [0.4, 0.7, 1], 4: [0.34, 0.56, 0.78, 1], 5: [0.3, 0.47, 0.64, 0.82, 1] };
  const PENCIL_COLORS = ['rot', 'blau', 'gelb', 'gruen', 'orange', 'lila'];

  /* ------------------------------------------------------------------
     Darstellungen
     ------------------------------------------------------------------ */
  function pencil(f, color, offset) {
    const c = FM.color(color);
    return el('span.groessen-pencil', { style: { width: `calc(var(--plen) * ${f})`, marginLeft: offset ? `calc(var(--plen) * ${offset})` : null, '--pc': c.hex, '--pd': c.dark } },
      el('i.gp-end'), el('i.gp-body'), el('i.gp-tip'));
  }
  function tower(k, color) {
    const c = FM.color(color);
    const t = el('span.groessen-tower', { style: { '--bc': c.hex, '--bd': c.dark } });
    for (let i = 0; i < k; i++) t.appendChild(el('i.groessen-blk'));
    return t;
  }
  function emojiThing(w, s) {
    return el('span.emoji.groessen-emoji', { style: { '--s': String(s) }, 'aria-hidden': 'true' }, w.e);
  }
  const ARROW = () => el('svg', { viewBox: '0 0 60 30', class: 'groessen-arrow', 'aria-hidden': 'true' },
    el('path', { d: 'M4 15 H46 M36 5 L50 15 L36 25', fill: 'none', stroke: '#2b2d42', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

  /** Richtungsbild ohne Text: klein ➜ groß (bzw. umgekehrt) */
  function directionCue(mode, thing, asc) {
    let a;
    let b;
    if (mode === 'laenge') { a = el('span.gd-pencil', pencil(0.3, 'gelb')); b = el('span.gd-pencil.long', pencil(1, 'gelb')); }
    else if (mode === 'hoehe') { a = tower(1, 'blau'); b = tower(3, 'blau'); }
    else { a = el('span.emoji.gd-small', thing.e); b = el('span.emoji.gd-big', thing.e); }
    return el('div.groessen-dir', { 'aria-hidden': 'true' }, asc ? [a, ARROW(), b] : [b, ARROW(), a]);
  }

  /* ------------------------------------------------------------------
     Stufe 1: „Wo ist der größte Bär?“
     ------------------------------------------------------------------ */
  async function pickExtreme(ctx) {
    const w = U.pickFresh('groessen-thing', things(), 8, (x) => x.id);
    const big = U.chance(0.5);
    const d = DIM.groesse;
    const stem = big ? d.supB : d.supS;
    const scales = SCALES[3];
    const items = scales.map((s, i) => ({
      content: el('span.groessen-tilebox', emojiThing(w, s)),
      correct: big ? i === 2 : i === 0,
      aria: w.w,
    }));
    const q = `Wo ist ${nomSup(w.a, stem)} ${w.w}?`;
    ctx.stage.appendChild(el('div.fm-line', el('span', q)));
    ctx.instruct(q);
    await ctx.choices(items, {
      size: 'large',
      className: 'groessen-choices',
      correctSay: `Richtig! Das ist ${nomSup(w.a, stem)} ${w.w}.`,
      wrongSay: `Hmm, gibt es noch ${accCmp(w.a, big ? d.cmpB : d.cmpS)}?`,
      onWrong: async (it, tile, n) => {
        if (n === 2) await ctx.say('Vergleiche mal alle drei ganz genau.');
      },
    });
  }

  /* ------------------------------------------------------------------
     Stufen 2–5: der Reihe nach ordnen
     ------------------------------------------------------------------ */
  async function orderTask(ctx) {
    const lv = ctx.level;
    let mode = 'groesse';
    let n = 3;
    let asc = true;
    if (lv === 3) n = U.pick([4, 4, 5]);
    if (lv === 4) { mode = U.pickFresh('groessen-mode4', ['groesse', 'laenge', 'hoehe'], 2); n = 4; }
    if (lv === 5) { mode = U.pickFresh('groessen-mode5', ['groesse', 'laenge', 'hoehe'], 2); n = 5; asc = U.chance(0.5); }
    const d = DIM[mode];
    const thing = mode === 'laenge' ? STIFT : mode === 'hoehe' ? TURM : U.pickFresh('groessen-thing', things(), 8, (x) => x.id);
    const art = thing.a;
    const firstStem = asc ? d.supS : d.supB;
    const lastStem = asc ? d.supB : d.supS;

    // Werte (aufsteigend) erzeugen
    let values;
    if (mode === 'groesse') values = SCALES[n];
    else if (mode === 'laenge') values = LENGTHS[n];
    else values = U.sample(U.range(1, 7), n).sort((a, b) => a - b);
    const colors = U.shuffle(PENCIL_COLORS);
    const maxK = mode === 'hoehe' ? values[values.length - 1] : 0;

    const items = values.map((v, i) => {
      let content;
      if (mode === 'groesse') content = emojiThing(thing, v);
      else if (mode === 'laenge') content = pencil(v, colors[i % colors.length], lv === 5 ? U.pick([0, 0.35, 0.7, 1]) * (1 - v) * 0.9 : 0);
      else content = tower(v, colors[i % colors.length]);
      const label = mode === 'hoehe' ? `Turm aus ${U.numberWord(v)} ${v === 1 ? 'Stein' : 'Steinen'}` : thing.w;
      const node = el('button.groessen-item', { type: 'button', 'aria-label': label }, content);
      return { v, node, rank: i };
    });
    // Reihenfolge im Feld: gut gemischt – höchstens ein Ding steht schon an „seinem“
    // Platz (in beide Richtungen gezählt), damit keine fertige Treppe vorgegeben ist
    const fixed = (arr, rev) => arr.filter((it, i) => it.rank === (rev ? n - 1 - i : i)).length;
    let shuffled;
    let guard = 0;
    do { shuffled = U.shuffle(items); } while ((fixed(shuffled, false) > 1 || fixed(shuffled, true) > 1) && guard++ < 200);
    const order = asc ? items.slice() : items.slice().reverse();

    const narrow = ctx.stage.clientWidth < 560;
    const cols = mode === 'groesse' && narrow && n >= 4 ? Math.ceil(n / 2) : n;
    const field = el('div.groessen-field.mode-' + mode, { style: { '--n': String(n), '--cols': String(cols), '--maxk': String(maxK) } });
    shuffled.forEach((it) => field.appendChild(it.node));
    const shelf = el('div.groessen-shelf.mode-' + mode, { style: { '--n': String(n), '--maxk': String(maxK) } });
    const slots = items.map(() => {
      const s = el('div.groessen-slot');
      shelf.appendChild(s);
      return s;
    });
    ctx.stage.classList.add('groessen-stage');
    ctx.stage.appendChild(directionCue(mode, thing, asc));
    ctx.stage.appendChild(field);
    ctx.stage.appendChild(shelf);

    const pl = thing.p;
    ctx.instruct(`Ordne die ${pl} der ${d.noun} nach: ${fromTo(firstStem, lastStem)}! Tippe zuerst ${accSup(art, firstStem)} an.`);

    let step = 0;
    let stepErrors = 0;
    let busy = false;
    const markNext = () => {
      items.forEach((it) => ctx.markTest(it.node, false));
      if (step < n) ctx.markTest(order[step].node);
    };
    markNext();

    /** Ding mit kleiner Flug-Animation (FLIP) aufs Regal stellen. */
    function moveToShelf(node, slot) {
      const a = node.getBoundingClientRect();
      const ph = el('span.groessen-ph', { style: { width: a.width + 'px', height: a.height + 'px' } });
      node.parentNode.insertBefore(ph, node);
      slot.appendChild(node);
      slot.classList.add('filled');
      const b = node.getBoundingClientRect();
      node.style.transition = 'none';
      node.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px)`;
      void node.offsetWidth;
      node.style.transition = 'transform 0.45s cubic-bezier(0.3, 1.25, 0.5, 1)';
      node.style.transform = '';
    }

    await new Promise((resolve) => {
      items.forEach((it) => {
        it.node.addEventListener('click', async () => {
          if (busy || !ctx.active || it.placed) return;
          if (it === order[step]) {
            it.placed = true;
            ctx.unhint(it.node);
            moveToShelf(it.node, slots[step]);
            LT.sfx.tone(392 * Math.pow(2, (asc ? step : n - 1 - step) / 7), 0.14, { type: 'triangle', volume: 0.35 });
            step++;
            stepErrors = 0;
            markNext();
            if (step >= n) {
              busy = true;
              await ctx.sleep(450);
              // „Treppe“: Dinge hüpfen der Reihe nach
              for (const o of order) {
                if (!ctx.active) return;
                LT.ui.animate(o.node, 'joy');
                await ctx.sleep(160);
              }
              await ctx.correct(shelf, { say: `Super! Die ${pl} sind jetzt der ${d.noun} nach geordnet: ${fromTo(firstStem, lastStem)}. Wie eine Treppe!` });
              resolve();
            }
          } else {
            busy = true;
            stepErrors++;
            await ctx.wrong(it.node, { say: `Hmm, gibt es noch ${accCmp(art, asc ? d.cmpS : d.cmpB)}?` });
            if (stepErrors >= 2) {
              ctx.hint(order[step].node);
              if (stepErrors === 2) {
                await ctx.say(step === 0
                  ? `Schau, das ist ${nomSup(art, firstStem)} ${thing.w}.`
                  : `Schau: Von den übrigen ${datPl(pl)} ist das hier ${nomSup(art, firstStem)}.`);
              }
            }
            busy = false;
          }
        });
      });
    });
  }

  LT.registerGame({
    id: 'groessen',
    area: 'formen',
    title: 'Groß und klein',
    icon: '📏',
    levels: 5,
    rounds: 4,
    intro: 'Willkommen bei Groß und klein! Schau genau hin und vergleiche.',
    parent: {
      skill: 'Größen vergleichen und ordnen (Seriation)',
      goal: 'Ihr Kind vergleicht Dinge nach Größe, Länge und Höhe und ordnet sie zu einer Reihe („Treppe“). Diese Seriation ist eine wichtige Grundlage für das Zahlverständnis (Zahlen werden größer) und für das Messen. Nebenbei lernt es die Vergleichswörter groß – größer – am größten, lang/kurz, hoch/niedrig.',
      levels: [
        'Den größten oder kleinsten von drei Dingen finden',
        'Drei Dinge vom kleinsten zum größten ordnen',
        'Vier bis fünf Dinge mit kleineren Unterschieden ordnen',
        'Länge und Höhe: Stifte von kurz nach lang, Türme von niedrig nach hoch',
        'Umgekehrte Richtung (vom größten zum kleinsten) und versetzt liegende Stifte',
      ],
      tip: 'Ordnen Sie gemeinsam Alltagsdinge: Löffel, Schuhe der Familie, Kuscheltiere oder Stifte. Fragen Sie: „Welcher ist länger? Wie kannst du das genau prüfen?“ (Tipp: gleiche Startlinie!).',
    },

    async task(ctx) {
      if (ctx.level === 1) return pickExtreme(ctx);
      return orderTask(ctx);
    },
  });
})();
