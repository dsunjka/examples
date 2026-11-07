/* ==========================================================================
   Spiel „Jahreszeiten & Tage“ 🍂

   Didaktik (Zeitbegriffe entwickeln – vom Erleben zur Ordnung):
   - Stufe 1: Jahreszeiten an typischen Erlebnissen erkennen (Schneemann,
     Kastanien, Eis essen, Tulpen). Jede Jahreszeit hat ein festes Bild:
     DERSELBE Baum in vier Jahreszeiten (Blüten, sattes Grün, bunte Blätter,
     kahle Äste mit Schnee) – so wird der Wandel der Natur sichtbar.
     Abwechselnd: Bild → Jahreszeit und Jahreszeit → passendes Bild.
   - Stufe 2: Tagesablauf (Morgen, Mittag, Abend, Nacht) – mit Himmels-Szenen
     (Sonne geht links auf, steht hoch, geht unter; Mond und Sterne) und
     Erlebnissen aus dem eigenen Tag (Frühstück, Gute-Nacht-Geschichte).
   - Stufe 3: Jahreskreislauf – Was kommt nach/vor …? (Zyklisches Denken)
   - Stufe 4: Wochentage mit dem „Wochenzug“ (7 Waggons, Wochenende farbig)
     als anschaulicher Stütze: Welcher Tag kommt nach Montag?
   - Stufe 5: Wochentage ohne direkte Hilfe: vor, gestern/morgen, Wochenende,
     auch über den Wochenwechsel (nach Sonntag kommt wieder Montag).
   - Hilfe nach 2 Fehlversuchen: Flo sagt die Reihe (Jahreszeiten/Wochentage)
     vor und zeigt dabei mit – danach wird die Lösung hervorgehoben.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.w2;

  /* ------------------------------------------------------------------
     Daten: Jahreszeiten-Bilder (nur eindeutige Zuordnungen)
     ------------------------------------------------------------------ */
  const SEASON_ITEMS = [
    { s: 'fruehling', e: '🌷', say: 'Tulpen', q: 'Wann blühen die ersten Tulpen?', a: 'Im Frühling blühen die Tulpen.' },
    { s: 'fruehling', e: '🐣', say: 'Osterküken', q: 'Zu Ostern sieht man überall kleine Küken und bunte Eier. In welcher Jahreszeit ist Ostern?', a: 'Ostern ist im Frühling.' },
    { s: 'fruehling', e: '🌸', say: 'Blüten', q: 'Wann sind die Obstbäume voller Blüten?', a: 'Im Frühling blühen die Bäume.' },
    { s: 'sommer', e: '🍦', rev: false, say: 'Eis', q: 'Wann ist es so heiß, dass ein Eis besonders gut schmeckt?', a: 'Im Sommer ist es heiß. Da schmeckt ein Eis!' },
    { s: 'sommer', e: '🏖️', say: 'Strand', q: 'Wann gehst du am Strand baden?', a: 'Im Sommer gehen wir baden.' },
    { s: 'sommer', e: '🌻', say: 'Sonnenblume', q: 'Wann blühen die großen Sonnenblumen?', a: 'Im Sommer blühen die Sonnenblumen.' },
    { s: 'sommer', e: '⛱️', say: 'Sonnenschirm', q: 'Wann brauchst du einen Sonnenschirm gegen die heiße Sonne?', a: 'Im Sommer scheint die Sonne ganz heiß.' },
    { s: 'herbst', e: '🍂', say: 'bunte Blätter', q: 'Wann werden die Blätter bunt und fallen von den Bäumen?', a: 'Im Herbst fallen die bunten Blätter.' },
    { s: 'herbst', e: '🌰', say: 'Kastanie', q: 'Wann kannst du Kastanien sammeln?', a: 'Im Herbst fallen die Kastanien von den Bäumen.' },
    { s: 'herbst', e: '🎃', say: 'Kürbis', q: 'Wann werden die Kürbisse geerntet?', a: 'Im Herbst ist Kürbis-Zeit.' },
    { s: 'herbst', e: '🪁', rev: false, say: 'Drachen', q: 'Wann ist es oft so windig, dass du einen Drachen steigen lassen kannst?', a: 'Im Herbst ist es windig. Drachen-Zeit!' },
    { s: 'herbst', e: '🍄', rev: false, say: 'Pilze', q: 'Wann wachsen im Wald besonders viele Pilze?', a: 'Im Herbst wachsen viele Pilze.' },
    { s: 'winter', e: '⛄', say: 'Schneemann', q: 'Wann baust du einen Schneemann?', a: 'Im Winter, wenn Schnee liegt, baust du einen Schneemann.' },
    { s: 'winter', e: '🛷', say: 'Schlitten', q: 'Wann fährst du Schlitten?', a: 'Im Winter fährst du Schlitten im Schnee.' },
    { s: 'winter', e: '🧤', rev: false, say: 'Handschuhe', q: 'Wann brauchst du dicke Handschuhe, weil es draußen so kalt ist?', a: 'Im Winter ist es kalt.' },
    { s: 'winter', e: '🎄', say: 'Weihnachtsbaum', q: 'Wann steht ein Weihnachtsbaum im Zimmer?', a: 'Weihnachten ist im Winter.' },
    { s: 'winter', e: '❄️', say: 'Schneeflocken', q: 'Wann fallen Schneeflocken vom Himmel?', a: 'Im Winter schneit es.' },
  ];
  /** Bilder für die Rückrichtung „Was passt zum …?“ – nur solche, die zu KEINER anderen Jahreszeit passen. */
  const SEASON_REV = SEASON_ITEMS.filter((x) => x.rev !== false);
  /** Kurzer Satz, den Flo beim Kreislauf ergänzt. */
  const SEASON_FACT = {
    fruehling: 'Dann blühen die ersten Blumen.',
    sommer: 'Dann ist es warm und die Sonne scheint lange.',
    herbst: 'Dann werden die Blätter bunt.',
    winter: 'Dann wird es kalt, und manchmal schneit es.',
  };

  /* ------------------------------------------------------------------
     Daten: Tagesablauf (act = etwas, das das Kind selbst tut)
     ------------------------------------------------------------------ */
  const DAY_ITEMS = [
    { d: 'morgen', e: '⏰', say: 'Wecker', q: 'Wann klingelt der Wecker und du stehst auf?', a: 'Am Morgen klingelt der Wecker. Zeit zum Aufstehen!' },
    { d: 'morgen', e: '🥣', say: 'Frühstück', act: true, q: 'Wann frühstückst du?', a: 'Am Morgen gibt es Frühstück.' },
    { d: 'morgen', e: '🐓', say: 'Hahn', q: 'Wann kräht der Hahn Kikeriki und weckt alle auf?', a: 'Am Morgen kräht der Hahn.' },
    { d: 'morgen', e: '🎒', say: 'Rucksack', act: true, q: 'Wann gehst du mit deinem Rucksack in den Kindergarten?', a: 'Am Morgen geht es in den Kindergarten.' },
    { d: 'mittag', e: '🍝', say: 'Mittagessen', act: true, q: 'Wann gibt es Nudeln zum Mittagessen?', a: 'Am Mittag gibt es Mittagessen.' },
    { d: 'mittag', e: '☀️', say: 'Sonne', q: 'Wann steht die Sonne ganz hoch oben am Himmel?', a: 'Am Mittag steht die Sonne am höchsten.' },
    { d: 'abend', e: '🥪', say: 'Abendbrot', act: true, q: 'Wann isst du Abendbrot?', a: 'Am Abend gibt es Abendbrot.' },
    { d: 'abend', e: '📖', fwd: false /* „Gute-Nacht“ verleitet zu „Nacht“ */, say: 'Gute-Nacht-Geschichte', act: true, q: 'Wann liest dir jemand eine Gute-Nacht-Geschichte vor?', a: 'Am Abend, vor dem Einschlafen, gibt es eine Geschichte.' },
    { d: 'abend', e: '🌇', say: 'Sonnenuntergang', q: 'Wann geht die Sonne unter?', a: 'Am Abend geht die Sonne unter.' },
    { d: 'nacht', e: '😴', say: 'Schlafen', act: true, q: 'Wann schläfst du tief und fest in deinem Bett?', a: 'In der Nacht schläfst du.' },
    { d: 'nacht', e: '🦉', say: 'Eule', q: 'Wann ist die Eule wach und geht auf die Jagd?', a: 'In der Nacht ist die Eule wach. Am Tag schläft sie.' },
    { d: 'nacht', e: '🌟', say: 'Sterne', q: 'Wann leuchten die Sterne am dunklen Himmel?', a: 'In der Nacht leuchten die Sterne.' },
    { d: 'nacht', e: '🦇', say: 'Fledermaus', q: 'Wann ist es ganz dunkel, und die Fledermaus fliegt herum?', a: 'In der Nacht fliegt die Fledermaus.' },
  ];

  /** Woran man die Tageszeit auf dem Bild erkennt (Hilfe nach Fehlern). */
  const DAY_FACT = {
    morgen: 'Da geht die Sonne gerade auf.',
    mittag: 'Da steht die Sonne ganz hoch am Himmel.',
    abend: 'Da geht die Sonne unter.',
    nacht: 'Da ist es dunkel, und der Mond scheint.',
  };

  /* ------------------------------------------------------------------
     Daten: Wochentage
     ------------------------------------------------------------------ */
  const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const mod7 = (n) => ((n % 7) + 7) % 7;

  /* ------------------------------------------------------------------
     Bausteine
     ------------------------------------------------------------------ */
  function seasonItem(id, correct) {
    const s = W.season(id);
    return { content: W.sceneTile(W.seasonScene(id), s.name), say: s.name, correct, value: id, className: 'w2-scene-tile' };
  }
  function dayItem(id, correct) {
    const d = W.daytime(id);
    return { content: W.sceneTile(W.dayScene(id), d.name), say: d.name, correct, value: id, className: 'w2-scene-tile' };
  }
  /** Vierer-Raster (quer 4 nebeneinander, hochkant 2 × 2). */
  function grid4(ctx) {
    const box = el('div.choices.w2-grid4');
    ctx.stage.appendChild(box);
    return box;
  }

  /* ---------------- Stufe 1: Jahreszeiten zuordnen ---------------- */
  async function taskSeasons(ctx) {
    const reverse = ctx.index % 2 === 1;
    if (!reverse) {
      const it = U.pickFresh('w2-jz-item', SEASON_ITEMS, 6, (x) => x.e);
      ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-prompt-sm', U.emoji(it.e, 'big-emoji')));
      ctx.instruct(it.q);
      await ctx.choices(W.SEASONS.map((s) => seasonItem(s.id, s.id === it.s)), {
        container: grid4(ctx),
        shuffle: false,
        sayButton: true,
        nameFirst: ctx.index === 0,
        correctSay: `Richtig! ${it.a}`,
        wrongSay: (c) => `Das ist der ${W.season(c.value).name}. ${SEASON_FACT[c.value]} Hör noch mal: ${it.q}`,
        hintSay: `${it.a} Schau, hier!`,
      });
    } else {
      const s = U.pickFresh('w2-jz-rev', W.SEASONS, 2, (x) => x.id);
      const right = U.pick(SEASON_REV.filter((x) => x.s === s.id));
      const others = W.SEASONS.filter((x) => x.id !== s.id).map((o) => U.pick(SEASON_REV.filter((x) => x.s === o.id)));
      const wrong = U.sample(others, 2);
      ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-prompt-scene', W.sceneTile(W.seasonScene(s.id), s.name)));
      ctx.instruct(`Es ist ${s.name}. Was passt zum ${s.name}?`);
      const items = [right, ...wrong].map((x) => ({ content: x.e, say: x.say, correct: x === right }));
      await ctx.choices(items, {
        nameFirst: true,
        sayButton: true,
        correctSay: `Richtig! ${right.a}`,
        wrongSay: (it) => {
          const x = SEASON_ITEMS.find((y) => y.e === it.content);
          return x ? `Hmm. ${x.a} Probier es noch einmal!` : undefined;
        },
        hintSay: `${right.a} Schau, hier!`,
      });
    }
  }

  /* ---------------- Stufe 2: Tagesablauf ---------------- */
  async function taskDay(ctx) {
    const reverse = ctx.index % 2 === 1;
    if (!reverse) {
      const it = U.pickFresh('w2-jz-tag', DAY_ITEMS.filter((x) => x.fwd !== false), 6, (x) => x.e);
      ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-prompt-sm', U.emoji(it.e, 'big-emoji')));
      ctx.instruct(it.q);
      await ctx.choices(W.DAYTIMES.map((d) => dayItem(d.id, d.id === it.d)), {
        container: grid4(ctx),
        shuffle: false,
        sayButton: true,
        nameFirst: ctx.index === 0,
        correctSay: `Richtig! ${it.a}`,
        wrongSay: (c) => `Das ist ${c.value === 'nacht' ? 'die' : 'der'} ${W.daytime(c.value).name}. ${DAY_FACT[c.value]} Hör noch mal: ${it.q}`,
        hintSay: `${it.a} Schau, hier!`,
      });
    } else {
      const acts = DAY_ITEMS.filter((x) => x.act);
      const right = U.pickFresh('w2-jz-act', acts, 3, (x) => x.e);
      const d = W.daytime(right.d);
      const wrong = U.sample(U.uniqueBy(U.shuffle(acts.filter((x) => x.d !== right.d)), (x) => x.d), 2);
      ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-prompt-scene', W.sceneTile(W.dayScene(d.id), d.name)));
      ctx.instruct(`Es ist ${d.name}. Was machst du ${d.dat}?`);
      const items = [right, ...wrong].map((x) => ({ content: x.e, say: x.say, correct: x === right, value: x }));
      await ctx.choices(items, {
        nameFirst: true,
        sayButton: true,
        correctSay: `Richtig! ${right.a}`,
        wrongSay: (it) => `Hmm. ${it.value.a} Probier es noch einmal!`,
        hintSay: `${right.a} Schau, hier!`,
      });
    }
  }

  /* ---------------- Stufe 3: Kreislauf der Jahreszeiten ---------------- */
  async function taskCycle(ctx) {
    const ids = W.SEASONS.map((s) => s.id);
    const before = ctx.index === 3 || (ctx.index > 1 && U.chance(0.3));
    const i = U.pickFresh('w2-jz-cyc', [0, 1, 2, 3], 2);
    const given = W.SEASONS[i];
    const ans = W.SEASONS[before ? (i + 3) % 4 : (i + 1) % 4];
    const q = el('div.w2-q-scene', U.emoji('❓', 'big-emoji'));
    const g = el('div.w2-mini', W.sceneTile(W.seasonScene(given.id), given.name));
    const arrow = U.emoji('➡️', 'mid-emoji');
    ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-cycle', before ? [q, arrow, g] : [g, arrow, q]));
    const text = before
      ? `Welche Jahreszeit kommt vor dem ${given.name}?`
      : `Gerade ist ${given.name}. Welche Jahreszeit kommt nach dem ${given.name}?`;
    ctx.instruct(text);
    const items = ids.filter((id) => id !== given.id).map((id) => seasonItem(id, id === ans.id));
    await ctx.choices(items, {
      sayButton: true,
      correctSay: before
        ? `Richtig! Vor dem ${given.name} kommt der ${ans.name}.`
        : `Richtig! Nach dem ${given.name} kommt der ${ans.name}. ${SEASON_FACT[ans.id]}`,
      wrongSay: (it) => `Der ${W.season(it.value).name} kommt nicht direkt ${before ? 'vor' : 'nach'} dem ${given.name}.`,
      onWrong: async (item, tile, n) => {
        if (n === 2) await ctx.say('Hör gut zu: Frühling, Sommer, Herbst, Winter. Und dann fängt es wieder von vorne an mit dem Frühling.');
      },
    });
  }

  /* ---------------- Stufe 4 + 5: Wochentage ---------------- */
  function weekTrain(cur, target, showTarget) {
    const cars = DAYS.map((d, k) => {
      const c = el('div.w2-car' + (k >= 5 ? '.w2-weekend' : ''), el('span.w2-car-t', SHORT[k]));
      if (k === cur) c.classList.add('is-cur');
      if (k === target && showTarget) {
        c.classList.add('is-q');
        c.firstChild.textContent = '?';
      }
      return c;
    });
    const train = el('div.w2-train', U.emoji('🚂', 'w2-loco'), cars);
    train._cars = cars;
    return train;
  }
  async function singWeek(ctx, train, from) {
    await ctx.say('Wir sagen die Wochentage zusammen auf.');
    for (let k = 0; k < 7; k++) {
      if (!ctx.active) return;
      const idx = mod7(from + k);
      const car = train._cars[idx];
      car.classList.add('w2-sing');
      await ctx.say(DAYS[idx], { interrupt: true });
      car.classList.remove('w2-sing');
    }
  }
  function dayChoice(k, correct) {
    return { content: DAYS[k], text: true, say: DAYS[k], correct, value: k, className: 'w2-day-tile' };
  }

  async function taskWeek(ctx) {
    let mode = 'nach';
    if (ctx.level >= 5) mode = U.pickFresh('w2-jz-wmode', ['vor', 'morgen', 'gestern', 'wochenende', 'nach'], 2);
    let d;
    let ans;
    let text;
    let say;
    if (mode === 'wochenende') {
      ans = U.pick([5, 6]);
      const wrong = U.sample([0, 1, 2, 3, 4], 2);
      ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-prompt-sm', U.emoji('🎈', 'big-emoji'), U.emoji('😊', 'big-emoji')));
      ctx.instruct('Am Wochenende haben viele Kinder frei. Welcher Tag gehört zum Wochenende?');
      await ctx.choices([dayChoice(ans, true), ...wrong.map((k) => dayChoice(k, false))], {
        nameFirst: true,
        sayButton: true,
        correctSay: `Richtig! ${DAYS[ans]} gehört zum Wochenende. Das Wochenende sind Samstag und Sonntag.`,
        wrongSay: (it) => `Am ${DAYS[it.value]} gehen viele Kinder in den Kindergarten. ${DAYS[it.value]} gehört nicht zum Wochenende.`,
        hintSay: 'Das Wochenende sind die beiden letzten Tage der Woche: Samstag und Sonntag.',
      });
      return;
    }
    // Ausgangstag wählen (Stufe 4: kein Wochenwechsel, damit der Zug passt)
    if (mode === 'nach' || mode === 'morgen') {
      d = U.pickFresh('w2-jz-wd', ctx.level >= 5 ? U.range(0, 6) : U.range(0, 5), 3);
      ans = mod7(d + 1);
    } else {
      d = U.pickFresh('w2-jz-wd', U.range(0, 6), 3);
      ans = mod7(d - 1);
    }
    if (mode === 'nach') { text = `Welcher Tag kommt nach ${DAYS[d]}?`; say = `Richtig! Nach ${DAYS[d]} kommt ${DAYS[ans]}.`; }
    if (mode === 'vor') { text = `Welcher Tag kommt vor ${DAYS[d]}?`; say = `Richtig! Vor ${DAYS[d]} kommt ${DAYS[ans]}.`; }
    if (mode === 'morgen') { text = `Stell dir vor, heute ist ${DAYS[d]}. Welcher Tag ist morgen?`; say = `Richtig! Wenn heute ${DAYS[d]} ist, dann ist morgen ${DAYS[ans]}.`; }
    if (mode === 'gestern') { text = `Stell dir vor, heute ist ${DAYS[d]}. Welcher Tag war gestern?`; say = `Richtig! Wenn heute ${DAYS[d]} ist, dann war gestern ${DAYS[ans]}.`; }
    if (d === 6 && ans === 0) say += ' Nach dem Sonntag fängt eine neue Woche an.';
    if (d === 0 && ans === 6) say += ' Der Sonntag ist der letzte Tag der Woche davor.';

    // Stufe 4: Zug zeigt Fragezeichen am Zielplatz; Stufe 5: nur der Ausgangstag ist markiert
    const train = weekTrain(d, ans, ctx.level < 5);
    ctx.stage.appendChild(train);
    ctx.instruct(text);
    const wrongPool = U.shuffle([mod7(d + 2), mod7(d - 1), mod7(d + 1), mod7(d - 2), mod7(d + 3)].filter((k) => k !== ans && k !== d));
    const wrong = U.uniqueBy(wrongPool, (k) => k).slice(0, 2);
    await ctx.choices([dayChoice(ans, true), ...wrong.map((k) => dayChoice(k, false))], {
      nameFirst: true,
      sayButton: true,
      correctSay: say,
      wrongSay: (it) => (mode === 'nach' || mode === 'morgen'
        ? `${DAYS[it.value]} kommt nach ${DAYS[mod7(it.value - 1)]}. Wir suchen den Tag nach ${DAYS[d]}.`
        : `${DAYS[it.value]} kommt vor ${DAYS[mod7(it.value + 1)]}. Wir suchen den Tag vor ${DAYS[d]}.`),
      onCorrect: () => {
        const car = train._cars[ans];
        car.classList.remove('is-q');
        car.classList.add('is-done');
        car.firstChild.textContent = SHORT[ans];
      },
      onWrong: async (item, tile, n) => {
        if (n === 2) {
          await singWeek(ctx, train, mode === 'nach' || mode === 'morgen' ? d : ans);
          train._cars[ans].classList.add('hint-glow');
        }
      },
    });
  }

  LT.registerGame({
    id: 'jahreszeiten',
    area: 'welt',
    title: 'Jahreszeiten & Tage',
    icon: '🍂',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Zeitbegriffe: Jahreszeiten, Tageszeiten, Wochentage',
      goal: 'Ihr Kind verknüpft Jahreszeiten und Tageszeiten mit eigenen Erlebnissen, versteht den Jahreskreislauf als wiederkehrende Reihenfolge und lernt die Wochentage in der richtigen Reihenfolge – inklusive „gestern“, „morgen“ und „Wochenende“.',
      levels: [
        'Stufe 1: Was passt zu welcher Jahreszeit? (Bilder und Baum-Szenen)',
        'Stufe 2: Tagesablauf – Morgen, Mittag, Abend, Nacht',
        'Stufe 3: Jahreskreislauf – Was kommt nach dem Sommer / vor dem Frühling?',
        'Stufe 4: Wochentage mit dem Wochenzug – Welcher Tag kommt nach Montag?',
        'Stufe 5: Wochentage knifflig – vor, gestern, morgen, Wochenende, Wochenwechsel',
      ],
      tip: 'Sprechen Sie morgens über den Tag: „Heute ist Dienstag – morgen ist Mittwoch, da ist Turnen.“ Ein Wochenplan mit Bildern an der Kühlschranktür und ein Jahreszeiten-Baum, den Sie gemeinsam immer wieder anschauen, machen Zeit greifbar.',
    },
    async task(ctx) {
      if (ctx.level === 1) return taskSeasons(ctx);
      if (ctx.level === 2) return taskDay(ctx);
      if (ctx.level === 3) return taskCycle(ctx);
      return taskWeek(ctx);
    },
  });
})();
