/* ==========================================================================
   Spiel „Farben-Zauber“ 🌈 – Farben benennen, zuordnen und mischen.

   Didaktik:
   - Farbwörter werden mit Alltagsbeispielen verankert („Rot wie eine
     Erdbeere“) – das Beispiel erscheint nach der richtigen Antwort und als
     Hilfe nach 2 Fehlversuchen.
   - Tippt das Kind daneben, nennt Flo die angetippte Farbe („Das ist Blau.“):
     So lernt es auch aus dem Fehler ein Farbwort.
   - Progression:
       1  Grundfarben Rot, Blau, Gelb, Grün (Farbkleckse, 3 zur Wahl)
       2  alle elf Farben inkl. Orange, Lila, Rosa, Braun, Schwarz, Weiß, Grau
          (Farbtöpfe, 4 zur Wahl)
       3  Ding → Farbe: „Welche Farbe hat die Banane?“ (Weltwissen; Farben,
          die im Bild ebenfalls vorkommen, werden nie als falsch angeboten)
       4  Farbmischen: Zwei Farben fließen in eine Schüssel – „Was entsteht?“
          Das Kind sagt das Ergebnis voraus, danach verrührt Flo die Farben
          (Rot+Gelb=Orange, Blau+Gelb=Grün, Rot+Blau=Lila, Rot+Weiß=Rosa,
          Schwarz+Weiß=Grau). Bildlich (Schüssel) und symbolisch (A + B = ?).
       5  Rückwärts mischen: „Welche zwei Farben brauchst du für Grün?“ – das
          Kind probiert selbst; ein falsches Paar wird trotzdem gemischt und
          benannt („Aus Rot und Blau wird Lila.“) → entdeckendes Lernen.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const FM = LT.fm;
  const C = FM.color;

  /* ------------------------------------------------------------------
     Stufe 3: Dinge mit eindeutiger Hauptfarbe. also = Farben, die im Bild
     ebenfalls vorkommen und deshalb nicht als falsche Antwort taugen.
     ------------------------------------------------------------------ */
  const THINGS = [
    { e: '🍓', w: 'Erdbeere', a: 'die', c: 'rot', also: ['gruen'] },
    { e: '🍅', w: 'Tomate', a: 'die', c: 'rot', also: ['gruen'] },
    { e: '🚒', w: 'Feuerwehrauto', a: 'das', c: 'rot', also: ['weiss', 'schwarz', 'grau', 'gelb', 'blau'] },
    { e: '🐞', w: 'Marienkäfer', a: 'der', c: 'rot', also: ['schwarz'] },
    { e: '🍒', w: 'Kirschen', a: 'die', pl: true, c: 'rot', also: ['gruen', 'braun'] },
    { e: '🍌', w: 'Banane', a: 'die', c: 'gelb', also: ['braun', 'gruen'] },
    { e: '🍋', w: 'Zitrone', a: 'die', c: 'gelb', also: ['gruen', 'orange'] },
    { e: '🐥', w: 'Küken', a: 'das', c: 'gelb', also: ['orange'] },
    { e: '🌻', w: 'Sonnenblume', a: 'die', c: 'gelb', also: ['braun', 'gruen', 'orange'] },
    { e: '🧀', w: 'Käse', a: 'der', c: 'gelb', also: ['orange'] },
    { e: '🐸', w: 'Frosch', a: 'der', c: 'gruen', also: ['rosa', 'rot', 'orange', 'weiss'] },
    { e: '🥒', w: 'Gurke', a: 'die', c: 'gruen', also: [] },
    { e: '🥦', w: 'Brokkoli', a: 'der', c: 'gruen', also: [] },
    { e: '🍀', w: 'Kleeblatt', a: 'das', c: 'gruen', also: [] },
    { e: '🌵', w: 'Kaktus', a: 'der', c: 'gruen', also: ['braun', 'rosa'] },
    { e: '🐊', w: 'Krokodil', a: 'das', c: 'gruen', also: ['weiss'] },
    { e: '🐳', w: 'Wal', a: 'der', c: 'blau', also: ['weiss', 'grau'] },
    { e: '💧', w: 'Wassertropfen', a: 'der', c: 'blau', also: [] },
    { e: '👖', w: 'Jeans', a: 'die', c: 'blau', also: ['braun'] },
    { e: '🌊', w: 'Welle', a: 'die', c: 'blau', also: ['weiss'] },
    { e: '🥕', w: 'Karotte', a: 'die', c: 'orange', also: ['gruen'] },
    { e: '🍊', w: 'Orange', a: 'die', c: 'orange', also: ['gruen'] },
    { e: '🎃', w: 'Kürbis', a: 'der', c: 'orange', also: ['gruen', 'schwarz', 'gelb', 'braun'] },
    { e: '🏀', w: 'Basketball', a: 'der', c: 'orange', also: ['schwarz'] },
    { e: '🍆', w: 'Aubergine', a: 'die', c: 'lila', also: ['gruen'] },
    { e: '🍇', w: 'Weintrauben', a: 'die', pl: true, c: 'lila', also: ['gruen', 'braun'] },
    { e: '🐷', w: 'Schweinchen', a: 'das', c: 'rosa', also: ['rot'] },
    { e: '🦩', w: 'Flamingo', a: 'der', c: 'rosa', also: ['schwarz', 'rot', 'orange'] },
    { e: '🌸', w: 'Kirschblüte', a: 'die', c: 'rosa', also: ['weiss', 'rot'] },
    { e: '🐻', w: 'Bär', a: 'der', c: 'braun', also: ['orange', 'schwarz'] },
    { e: '🌰', w: 'Kastanie', a: 'die', c: 'braun', also: ['orange'] },
    { e: '🥔', w: 'Kartoffel', a: 'die', c: 'braun', also: ['gelb', 'orange'] },
    { e: '🦔', w: 'Igel', a: 'der', c: 'braun', also: ['grau', 'schwarz'] },
    { e: '🎩', w: 'Zauberhut', a: 'der', c: 'schwarz', also: ['rot', 'lila', 'grau'] },
    { e: '🕷️', w: 'Spinne', a: 'die', c: 'schwarz', also: ['grau', 'braun'] },
    { e: '🕶️', w: 'Sonnenbrille', a: 'die', c: 'schwarz', also: ['grau'] },
    { e: '⛄', w: 'Schneemann', a: 'der', c: 'weiss', also: ['schwarz', 'orange', 'braun', 'grau', 'blau'] },
    { e: '👻', w: 'Gespenst', a: 'das', c: 'weiss', also: ['grau', 'schwarz'] },
    { e: '🦢', w: 'Schwan', a: 'der', c: 'weiss', also: ['orange', 'schwarz', 'grau'] },
    { e: '🐑', w: 'Schaf', a: 'das', c: 'weiss', also: ['schwarz', 'grau', 'rosa'] },
    { e: '🐘', w: 'Elefant', a: 'der', c: 'grau', also: ['rosa', 'weiss', 'blau'] },
    { e: '🦏', w: 'Nashorn', a: 'das', c: 'grau', also: ['weiss', 'blau'] },
    { e: '🐨', w: 'Koala', a: 'der', c: 'grau', also: ['weiss', 'schwarz', 'rosa'] },
    { e: '🐺', w: 'Wolf', a: 'der', c: 'grau', also: ['weiss', 'schwarz', 'braun'] },
    { e: '🐭', w: 'Maus', a: 'die', c: 'grau', also: ['rosa', 'weiss', 'braun'] },
  ];

  /* ------------------------------------------------------------------
     Farbmischung (wie im Malkasten). Schlüssel = alphabetisch sortiertes Paar.
     Gelb + Schwarz kommt nie vor (ergäbe ein schwer benennbares Oliv).
     ------------------------------------------------------------------ */
  const MIX = {
    'gelb+rot': 'orange',
    'blau+gelb': 'gruen',
    'blau+rot': 'lila',
    'rot+weiss': 'rosa',
    'schwarz+weiss': 'grau',
    'blau+weiss': 'hellblau',
    'gelb+weiss': 'hellgelb',
    'rot+schwarz': 'dunkelrot',
    'blau+schwarz': 'dunkelblau',
  };
  const mixOf = (a, b) => MIX[[a, b].sort().join('+')] || null;
  /** Stufe 4 (vorhersagen) und 5 (rückwärts): die fünf „Zaubermischungen“. */
  const RECIPES = [
    { a: 'rot', b: 'gelb', r: 'orange', pots: ['rot', 'gelb', 'blau', 'weiss'] },
    { a: 'blau', b: 'gelb', r: 'gruen', pots: ['rot', 'gelb', 'blau', 'weiss'] },
    { a: 'rot', b: 'blau', r: 'lila', pots: ['rot', 'gelb', 'blau', 'weiss'] },
    { a: 'rot', b: 'weiss', r: 'rosa', pots: ['rot', 'weiss', 'blau', 'gelb'] },
    { a: 'schwarz', b: 'weiss', r: 'grau', pots: ['schwarz', 'weiss', 'rot', 'blau'] },
  ];
  const RESULTS = ['orange', 'gruen', 'lila', 'rosa', 'grau', 'braun'];

  const name = (id) => C(id).name;
  const adj = (id) => C(id).adj;
  /** „Rot wie eine Erdbeere“ */
  const exSay = (id) => `${name(id)} wie ${C(id).ex[0][1]}`;
  /** Ein Beispiel für die Farbe, das NICHT das gezeigte Ding ist. */
  const otherExample = (id, emoji) => C(id).ex.find((x) => x[0] !== emoji) || C(id).ex[0];

  /** Beispiel-Bild als kleines Abzeichen (Hilfe/Erkenntnis). */
  function exampleBadge(id, ex) {
    return el('span.farben-ex', U.emoji((ex || C(id).ex[0])[0]));
  }

  /* ------------------------------------------------------------------
     Misch-Szene: zwei Farbtöpfe gießen in eine Schüssel, Flo rührt um.
     ------------------------------------------------------------------ */
  function mixScene(ctx) {
    const potL = el('div.farben-mpot.left');
    const potR = el('div.farben-mpot.right');
    const strL = el('div.farben-stream.left');
    const strR = el('div.farben-stream.right');
    const swirl = el('div.farben-swirl');
    const result = el('div.farben-result');
    const paint = el('div.farben-paint', swirl, result);
    const back = el('svg.farben-bowl-back', { viewBox: '0 0 200 110', 'aria-hidden': 'true' },
      el('ellipse', { cx: 100, cy: 22, rx: 96, ry: 20, fill: '#e4ebf5', stroke: '#8b93a3', 'stroke-width': 3 }));
    const front = el('svg.farben-bowl-front', { viewBox: '0 0 200 110', 'aria-hidden': 'true' },
      el('path', { d: 'M4 22 Q6 104 100 106 Q194 104 196 22 Q194 42 100 42 Q6 42 4 22 Z', fill: '#ffffff', stroke: '#8b93a3', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
      el('path', { d: 'M12 52 Q100 66 188 52 L184 66 Q100 80 16 66 Z', fill: '#ff5fa2', opacity: 0.85 }),
      el('circle', { cx: 60, cy: 86, r: 4, fill: '#ffc533' }),
      el('circle', { cx: 100, cy: 92, r: 4, fill: '#1fb5c9' }),
      el('circle', { cx: 140, cy: 86, r: 4, fill: '#3dbe6b' }));
    const bowl = el('div.farben-bowl', back, paint, front);
    const scene = el('div.farben-mix', potL, potR, strL, strR, bowl);

    const api = {
      node: scene,
      /** Farben setzen und alles zurück auf Anfang. */
      set(a, b) {
        scene.classList.remove('pour', 'filled', 'stir', 'half', 'blended', 'has-pots');
        U.clear(potL).appendChild(FM.pot(a));
        U.clear(potR).appendChild(FM.pot(b));
        strL.style.setProperty('--c', C(a).hex);
        strR.style.setProperty('--c', C(b).hex);
        swirl.style.setProperty('--a', C(a).hex);
        swirl.style.setProperty('--b', C(b).hex);
        result.style.removeProperty('background');
        scene.classList.add('has-pots');
      },
      reset() {
        scene.classList.remove('pour', 'filled', 'stir', 'half', 'blended', 'has-pots');
        U.clear(potL);
        U.clear(potR);
      },
      /** Eingießen (Animation) – danach liegen beide Farben als Wirbel in der Schüssel. */
      async pour() {
        scene.classList.add('pour');
        LT.sfx.play('whoosh');
        await ctx.sleep(900);
        scene.classList.add('filled');
        await ctx.sleep(900);
        scene.classList.remove('pour');
      },
      /** Umrühren: partial → nur halb gemischt (Hilfe), sonst ganz. */
      async blend(res, partial) {
        result.style.background = C(res).hex;
        scene.classList.add('stir', partial ? 'half' : 'blended');
        if (!partial) scene.classList.remove('half');
        LT.sfx.play('pop');
        await ctx.sleep(partial ? 700 : 1300);
      },
    };
    return api;
  }

  /* ------------------------------------------------------------------
     Stufen 1 + 2: Farbe antippen
     ------------------------------------------------------------------ */
  async function tapColor(ctx) {
    const lv = ctx.level;
    const pool = lv === 1 ? FM.BASIC : FM.ALL;
    const target = U.pickFresh('farben-t' + lv, pool, lv === 1 ? 2 : 5);
    const others = U.sample(pool.filter((c) => c !== target), lv === 1 ? 2 : 3);
    const kinds = [target].concat(others);
    const phrase = U.pick([`Tippe auf ${name(target)}!`, `Wo ist ${name(target)}?`, `Finde ${name(target)}!`]);
    const line = el('div.fm-line.farben-line', el('span', phrase));
    ctx.stage.appendChild(line);
    ctx.instruct(phrase);

    const items = kinds.map((k) => ({
      content: lv === 1 ? FM.blob(k) : FM.pot(k),
      correct: k === target,
      kind: k,
      aria: name(k),
    }));
    await ctx.choices(items, {
      size: 'large',
      className: 'farben-choices',
      columns: items.length === 4 && ctx.stage.clientHeight > ctx.stage.clientWidth ? 2 : undefined,
      correctSay: () => `Richtig, das ist ${name(target)}! ${exSay(target)}.`,
      wrongSay: (it) => `Das ist ${name(it.kind)}. Wo ist ${name(target)}?`,
      onCorrect: () => { if (!line.querySelector('.farben-ex')) line.appendChild(exampleBadge(target)); },
      onWrong: async (it, tile, n) => {
        if (n === 2) {
          if (!line.querySelector('.farben-ex')) line.appendChild(exampleBadge(target));
          await ctx.say(`Ein Tipp: ${exSay(target)}.`);
        }
      },
    });
  }

  /* ------------------------------------------------------------------
     Stufe 3: Ding → Farbe
     ------------------------------------------------------------------ */
  async function thingColor(ctx) {
    const t = U.pickFresh('farben-thing', THINGS, 10, (x) => x.w);
    const ok = FM.ALL.filter((c) => c !== t.c && !t.also.includes(c));
    const kinds = [t.c].concat(U.sample(ok, 3));
    const box = el('div.prompt-box.farben-thing-box', U.emoji(t.e, 'farben-thing-emoji'), el('span.farben-thing-name', t.w));
    ctx.stage.appendChild(box);
    const verb = t.pl ? 'haben' : 'hat';
    const q = `Welche Farbe ${verb} ${t.a} ${t.w}?`;
    ctx.instruct(q);
    const items = kinds.map((k) => ({ content: FM.blob(k), correct: k === t.c, kind: k, say: name(k) }));
    const Def = U.cap(t.a) + ' ' + t.w;
    await ctx.choices(items, {
      sayButton: true,
      className: 'farben-choices',
      columns: ctx.stage.clientHeight > ctx.stage.clientWidth ? 2 : undefined,
      correctSay: `Richtig! ${Def} ${t.pl ? 'sind' : 'ist'} ${adj(t.c)}.`,
      wrongSay: (it) => `Das ist ${name(it.kind)}. Schau dir ${t.a === 'der' && !t.pl ? 'den' : t.a} ${t.w} noch mal genau an.`,
      onWrong: async (it, tile, n) => {
        if (n === 2) {
          // Hilfe: ein anderes Ding mit derselben Farbe zum Vergleich zeigen
          const ex = otherExample(t.c, t.e);
          box.appendChild(el('span.farben-thing-hint', el('span', '='), exampleBadge(t.c, ex)));
          await ctx.say(`Ein Tipp: ${Def} ${t.pl ? 'haben' : 'hat'} die gleiche Farbe wie ${ex[1]}.`);
        }
      },
    });
  }

  /* ------------------------------------------------------------------
     Stufe 4: Farbmischen – „Was entsteht?“
     ------------------------------------------------------------------ */
  async function predictMix(ctx) {
    const rcp = U.pickFresh('farben-mix', RECIPES, 2, (r) => r.r);
    const [a, b] = U.shuffle([rcp.a, rcp.b]);
    const res = rcp.r;

    // symbolisch: Klecks + Klecks = ?
    const qMark = el('span.farben-eq-q', '?');
    const eq = el('div.farben-eq',
      el('span.farben-eq-blob', FM.blob(a)), el('span.farben-eq-op', '+'),
      el('span.farben-eq-blob', FM.blob(b)), el('span.farben-eq-op', '='),
      el('span.farben-eq-blob.farben-eq-res', qMark));
    const scene = mixScene(ctx);
    scene.set(a, b);
    ctx.stage.classList.add('farben-stage-mix');
    ctx.stage.appendChild(el('div.farben-mixwrap', eq, scene.node));

    await ctx.instruct(`Wir mischen ${name(a)} und ${name(b)}. Schau gut zu!`);
    if (!ctx.active) return;
    await scene.pour();
    if (!ctx.active) return;
    const q = `${name(a)} und ${name(b)}: Welche Farbe entsteht, wenn wir umrühren?`;
    ctx.instruct(q);

    const distract = U.sample(RESULTS.filter((r) => r !== res), 2);
    const items = [res].concat(distract).map((k) => ({ content: FM.blob(k), correct: k === res, kind: k, say: name(k) }));
    await ctx.choices(items, {
      sayButton: true,
      size: 'small',
      className: 'farben-choices farben-choices-mix',
      correctSay: `Richtig! Aus ${name(a)} und ${name(b)} wird ${name(res)}!`,
      wrongSay: (it) => `Aus ${name(a)} und ${name(b)} wird nicht ${name(it.kind)}. Überleg noch mal!`,
      onCorrect: () => {
        scene.blend(res);
        const r = eq.querySelector('.farben-eq-res');
        U.clear(r).appendChild(FM.blob(res));
        r.classList.add('joy');
      },
      onWrong: async (it, tile, n) => {
        if (n === 2) {
          await ctx.say('Ich rühre schon mal ein bisschen um. Schau genau hin!');
          await scene.blend(res, true);
        }
      },
    });
    await ctx.sleep(400);
  }

  /* ------------------------------------------------------------------
     Stufe 5: Rückwärts – „Welche zwei Farben brauchst du für Grün?“
     ------------------------------------------------------------------ */
  async function findRecipe(ctx) {
    const rcp = U.pickFresh('farben-recipe', RECIPES, 2, (r) => r.r);
    const target = rcp.r;
    const need = [rcp.a, rcp.b];

    const goal = el('div.farben-goal', el('span.farben-goal-blob', FM.blob(target)), el('span.farben-goal-name', name(target)));
    const scene = mixScene(ctx);
    const top = el('div.farben-top', goal, scene.node);
    const potsBox = el('div.choices.farben-pots');
    ctx.stage.classList.add('farben-stage-mix');
    ctx.stage.appendChild(top);
    ctx.stage.appendChild(potsBox);

    const instruction = `Wir wollen ${name(target)} mischen. Welche zwei Farben brauchst du? Tippe zwei Farbtöpfe an!`;
    ctx.instruct(instruction);

    const tiles = U.shuffle(rcp.pots).map((k) => {
      const t = LT.ui.tile(FM.pot(k), { size: 'small', say: name(k), sayButton: true, aria: name(k) });
      t._kind = k;
      potsBox.appendChild(t);
      return t;
    });

    let selected = [];
    let busy = false;
    let wrongs = 0;
    const markNext = () => {
      tiles.forEach((t) => ctx.markTest(t, false));
      const next = tiles.find((t) => need.includes(t._kind) && !selected.includes(t));
      if (next && !busy) ctx.markTest(next);
    };
    markNext();

    await new Promise((resolve) => {
      tiles.forEach((t) => {
        t.addEventListener('click', async () => {
          if (busy || !ctx.active) return;
          if (selected.includes(t)) {
            // Auswahl wieder lösen
            selected = selected.filter((x) => x !== t);
            t.classList.remove('farben-picked');
            markNext();
            return;
          }
          selected.push(t);
          t.classList.add('farben-picked');
          LT.sfx.play('tap');
          ctx.say(name(t._kind));
          if (selected.length < 2) { markNext(); return; }

          busy = true;
          markNext();
          const [a, b] = selected.map((x) => x._kind);
          const res = mixOf(a, b);
          scene.set(a, b);
          await ctx.sleep(250);
          await scene.pour();
          if (!ctx.active) return;
          await scene.blend(res);
          if (!ctx.active) return;
          if (res === target) {
            tiles.forEach((x) => ctx.unhint(x));
            await ctx.correct(goal, { say: `Super! Aus ${name(a)} und ${name(b)} wird ${name(target)}!` });
            resolve();
            return;
          }
          wrongs++;
          await ctx.wrong(null, { say: `Aus ${name(a)} und ${name(b)} wird ${name(res)}. Wir brauchen aber ${name(target)}. Probier es noch einmal!` });
          selected.forEach((x) => x.classList.remove('farben-picked'));
          selected = [];
          scene.reset();
          if (wrongs >= 2) {
            // Hilfe: erst eine, beim nächsten Mal beide nötigen Farben zeigen
            const show = wrongs === 2 ? [need[0]] : need;
            tiles.filter((x) => show.includes(x._kind)).forEach((x) => ctx.hint(x));
            await ctx.say(wrongs === 2
              ? `Ein Tipp: Eine Farbe ist ${name(need[0])}.`
              : `Schau: Wir brauchen ${name(need[0])} und ${name(need[1])}.`);
          }
          busy = false;
          markNext();
        });
      });
    });
    await ctx.sleep(300);
  }

  LT.registerGame({
    id: 'farben',
    area: 'formen',
    title: 'Farben-Zauber',
    icon: '🌈',
    levels: 5,
    rounds: 5,
    intro: 'Willkommen beim Farben-Zauber! Hör gut zu und tippe auf die richtige Farbe.',
    parent: {
      skill: 'Farben benennen, zuordnen und mischen',
      goal: 'Ihr Kind lernt die Grundfarben und weitere Farbwörter sicher zu benennen, verbindet Farben mit Dingen aus seiner Umwelt und entdeckt, wie durch Mischen neue Farben entstehen (Rot + Gelb = Orange, Blau + Gelb = Grün, Rot + Blau = Lila, Rot + Weiß = Rosa, Schwarz + Weiß = Grau). Das Vorhersagen und Ausprobieren fördert naturwissenschaftliches Denken.',
      levels: [
        'Die vier Grundfarben Rot, Blau, Gelb und Grün erkennen',
        'Alle elf Farben: zusätzlich Orange, Lila, Rosa, Braun, Schwarz, Weiß und Grau',
        'Welche Farbe hat die Banane? – Dinge ihrer typischen Farbe zuordnen',
        'Farbmischen: vorhersagen, was aus zwei Farben entsteht, dann zuschauen',
        'Rückwärts mischen: zwei passende Farbtöpfe für eine Zielfarbe finden und ausprobieren',
      ],
      tip: 'Malen Sie mit Wasserfarben oder Fingerfarben und mischen Sie gemeinsam: Was passiert, wenn Gelb und Blau sich treffen? Spielen Sie „Ich sehe was, was du nicht siehst, und das ist rot“.',
    },

    async task(ctx) {
      if (ctx.level <= 2) return tapColor(ctx);
      if (ctx.level === 3) return thingColor(ctx);
      if (ctx.level === 4) return predictMix(ctx);
      return findRecipe(ctx);
    },
  });
})();
