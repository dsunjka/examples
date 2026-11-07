/* ==========================================================================
   Spiel „Was passt nicht?“ 🤔 – Klassifizieren und Begründen.

   Didaktik:
   - Vier (später fünf) Bilder, drei (vier) gehören zusammen. Das Kind muss
     das gemeinsame Merkmal SELBST finden (induktives Denken) und das
     abweichende Bild ausschließen.
   - Progression: weit entfernte Oberbegriffe (Tiere / Fahrzeug) → nahe
     Oberbegriffe (Obst / Gemüse, Bauernhof / wilde Tiere) → Merkmale quer
     zur Kategorie (kann fliegen, lebt im Wasser, hat Räder, ist heiß/kalt)
     → fünf Bilder und feine Unterschiede (Pinguin kann nicht fliegen,
     Fledermaus ist kein Vogel, Erdbeere wächst nicht am Baum).
   - Nach der Lösung wird IMMER begründet: „Richtig! Die Gurke ist Gemüse.
     Die anderen sind Obst.“ – das macht die Denkregel bewusst.
   - Fehler sind Lerngelegenheiten: Flo erklärt, warum das angetippte Bild
     doch dazugehört („Die Banane ist auch Obst.“). Nach dem 2. Fehlversuch
     nennt Flo die Regel und hebt die Lösung hervor.
   - Datensätze sorgfältig geprüft: Jede Aufgabe hat genau EINE sinnvolle
     Lösung. Dafür stammen die Bilder einer Merkmals-Aufgabe aus derselben
     Oberkategorie (sonst könnte ein zweites Bild „nicht passen“, z. B. das
     einzige Fahrzeug unter Tieren). Strittige Fälle sind bewusst weggelassen
     (Tomate, Kartoffel, Pilz, Mais als Gemüse; Ente/Huhn beim Fliegen;
     Palme als Baum; Banane/Traube am Baum).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const D = LT.d1;

  /* ------------------------------------------------------------------
     Oberbegriffe (für Stufe 1 und 2)
     sg = Prädikat Einzahl, pl = Prädikat Mehrzahl (beginnen mit dem Verb)
     ------------------------------------------------------------------ */
  const CAT = {
    tiere: { sg: 'ist ein Tier', pl: 'sind Tiere', ids: ['hund', 'katze', 'kuh', 'schwein', 'pferd', 'elefant', 'giraffe', 'loewe', 'affe', 'hase', 'maus', 'ente', 'fisch', 'frosch', 'baer', 'igel', 'schaf', 'zebra', 'pinguin', 'schnecke', 'schmetterling'] },
    fahrzeuge: { sg: 'ist ein Fahrzeug', pl: 'sind Fahrzeuge', ids: ['auto', 'bus', 'zug', 'fahrrad', 'flugzeug', 'hubschrauber', 'traktor', 'feuerwehrauto', 'krankenwagen', 'schiff', 'segelboot', 'lastwagen', 'motorrad'] },
    obst: { sg: 'ist Obst', pl: 'sind Obst', ids: ['apfel', 'birne', 'banane', 'erdbeere', 'kirsche', 'traube', 'orange', 'zitrone', 'melone', 'ananas', 'pfirsich', 'kiwi'] },
    // für Obst/Gemüse-Aufgaben ohne Melone (botanisch ein Kürbisgewächs wie die Gurke, oft „Fruchtgemüse“)
    obst2: { sg: 'ist Obst', pl: 'sind Obst', ids: ['apfel', 'birne', 'banane', 'erdbeere', 'kirsche', 'traube', 'orange', 'zitrone', 'ananas', 'pfirsich', 'kiwi'] },
    kleidung: { sg: 'ist etwas zum Anziehen', pl: 'sind Sachen zum Anziehen', ids: ['hemd', 'hose', 'kleid', 'socke', 'handschuh', 'schal', 'hut', 'kappe', 'schuh', 'stiefel', 'jacke'] },
    musik: { sg: 'ist ein Musikinstrument', pl: 'sind Musikinstrumente', ids: ['trommel', 'gitarre', 'trompete', 'klavier', 'geige', 'saxofon'] },
    // nur eindeutige Gemüse (keine Tomate, Kartoffel, Pilz, Mais, Salat-Bild)
    gemuese: { sg: 'ist Gemüse', pl: 'sind Gemüse', ids: ['karotte', 'gurke', 'brokkoli', 'zwiebel'] },
    spielzeug: { sg: 'ist ein Spielzeug', pl: 'sind Spielsachen', ids: ['ball', 'teddy', 'drachen', 'puzzle'] },
    instrumente: { sg: 'ist ein Musikinstrument', pl: 'sind Musikinstrumente', ids: ['gitarre', 'trompete', 'geige', 'klavier', 'saxofon'] },
    blumen: { sg: 'ist eine Blume', pl: 'sind Blumen', ids: ['tulpe', 'rose', 'sonnenblume'] },
    baeume: { sg: 'ist ein Baum', pl: 'sind Bäume', ids: ['baum', 'tanne'] },
    // nur Säugetiere, damit kein Vogel/Reptil „aus der Reihe fällt“
    hof: { sg: 'lebt auf dem Bauernhof', pl: 'leben auf dem Bauernhof', ids: ['kuh', 'schwein', 'schaf', 'ziege', 'pferd'] },
    wild: { sg: 'ist ein wildes Tier', pl: 'sind wilde Tiere', ids: ['loewe', 'tiger', 'elefant', 'giraffe', 'zebra', 'affe', 'nilpferd', 'nashorn', 'kaenguru', 'koala', 'panda'] },
  };

  /** Aufgabe aus zwei Oberbegriffen: a = Gruppe, b = Ausreißer */
  function catSet(a, b) {
    return { id: `${a}-${b}`, a: CAT[a].ids, aSg: CAT[a].sg, aPl: CAT[a].pl, b: CAT[b].ids.map((id) => ({ id, pred: CAT[b].sg })) };
  }
  /** Ausreißer-Liste mit gleichem Prädikat */
  const odd = (ids, pred, extra) => ids.map((id) => ({ id, pred, extra }));

  /* ---------- Stufe 1: weit entfernte Oberbegriffe (alle Paarungen) ---------- */
  const FAR = ['tiere', 'fahrzeuge', 'obst', 'kleidung', 'musik'];
  const SETS1 = [];
  FAR.forEach((a) => FAR.forEach((b) => { if (a !== b) SETS1.push(catSet(a, b)); }));

  /* ---------- Stufe 2: nahe Oberbegriffe ---------- */
  const SETS2 = [
    catSet('obst2', 'gemuese'),
    catSet('gemuese', 'obst2'),
    catSet('obst2', 'gemuese'), // doppelt gewichtet: das Kernbeispiel
    catSet('hof', 'wild'),
    catSet('wild', 'hof'),
    catSet('spielzeug', 'instrumente'),
    catSet('instrumente', 'spielzeug'),
    catSet('blumen', 'baeume'),
  ].map((s, i) => Object.assign({}, s, { id: s.id + '-' + i }));

  /* ---------- Merkmals-Aufgaben (Stufe 3 und 4) ---------- */
  const FLYERS = ['biene', 'schmetterling', 'vogel', 'eule', 'marienkaefer', 'papagei'];
  const LAND_MAMMALS = ['hund', 'katze', 'elefant', 'pferd', 'kuh', 'igel', 'schwein', 'hase'];
  const WATER = ['fisch', 'wal', 'delfin', 'hai', 'krake'];
  const WHEELS = ['auto', 'fahrrad', 'bus', 'traktor', 'roller', 'lastwagen', 'motorrad', 'zug'];
  const NO_WHEELS = ['schiff', 'segelboot', 'kanu', 'rakete', 'schlitten'];
  // Kerze nicht in der Heiß-Gruppe: sie wäre dort als einziges „kein Naturding“ (zweite Lösung)
  const HOT = ['feuer', 'sonne', 'vulkan'];
  const COLD = ['schneemann', 'schneeflocke', 'eiswuerfel'];
  const FOREST = ['fuchs', 'igel', 'eichhoernchen', 'hirsch', 'wildschwein', 'wolf', 'baer'];
  const FARM = ['kuh', 'schwein', 'schaf', 'ziege', 'pferd'];
  const HEAD = ['hut', 'kappe', 'sonnenhut', 'helm'];
  const FEET = ['schuh', 'stiefel', 'socke'];
  const BIRDS_FLY = ['vogel', 'eule', 'papagei', 'adler', 'taube', 'schwan', 'flamingo'];
  const TREE_FRUIT = ['apfel', 'birne', 'kirsche', 'pfirsich', 'orange', 'zitrone'];

  const F = {
    fliegenTiere: { id: 'fliegen-tiere', a: FLYERS, aSg: 'kann fliegen', aPl: 'können fliegen', b: odd(LAND_MAMMALS, 'kann nicht fliegen') },
    fliegenFahrzeuge: { id: 'fliegen-fahrzeuge', a: ['flugzeug', 'hubschrauber', 'rakete'], aSg: 'kann fliegen', aPl: 'können fliegen', b: odd(['auto', 'bus', 'zug', 'traktor', 'schiff', 'fahrrad', 'lastwagen'], 'kann nicht fliegen') },
    wasser: { id: 'wasser', a: WATER, aSg: 'lebt im Wasser', aPl: 'leben im Wasser', b: odd(['hund', 'katze', 'loewe', 'elefant', 'pferd', 'giraffe', 'kuh', 'hase'], 'lebt nicht im Wasser') },
    raeder: { id: 'raeder', a: WHEELS, aSg: 'hat Räder', aPl: 'haben Räder', b: odd(NO_WHEELS, 'hat keine Räder') },
    heiss: { id: 'heiss', a: HOT, aSg: 'ist heiß', aPl: 'sind heiß', b: odd(COLD, 'ist kalt') },
    kalt: { id: 'kalt', a: COLD, aSg: 'ist kalt', aPl: 'sind kalt', b: odd(HOT.concat(['kerze']), 'ist heiß') },
    wald: { id: 'wald', a: FOREST, aSg: 'lebt im Wald', aPl: 'leben im Wald', b: odd(FARM, 'lebt auf dem Bauernhof') },
    bauernhof: { id: 'bauernhof', a: FARM, aSg: 'lebt auf dem Bauernhof', aPl: 'leben auf dem Bauernhof', b: odd(['fuchs', 'igel', 'eichhoernchen', 'hirsch', 'wolf'], 'lebt im Wald') },
    licht: { id: 'licht', a: ['gluehbirne', 'taschenlampe', 'kerze'], aSg: 'macht Licht', aPl: 'machen Licht', b: odd(['schluessel', 'loeffel', 'buch', 'schere', 'besen', 'korb'], 'macht kein Licht') },
    fuesse: {
      id: 'fuesse', a: FEET, aSg: 'gehört an den Fuß', aPl: 'gehören an die Füße',
      b: [{ id: 'handschuh', pred: 'gehört an die Hand' }, { id: 'hut', pred: 'gehört auf den Kopf' }, { id: 'kappe', pred: 'gehört auf den Kopf' }, { id: 'schal', pred: 'gehört um den Hals' }],
    },
    kopf: {
      id: 'kopf', a: HEAD, aSg: 'gehört auf den Kopf', aPl: 'gehören auf den Kopf',
      b: [{ id: 'schuh', pred: 'gehört an den Fuß' }, { id: 'stiefel', pred: 'gehört an den Fuß' }, { id: 'socke', pred: 'gehört an den Fuß' }, { id: 'handschuh', pred: 'gehört an die Hand' }],
    },
    // nicht Zitrone: Apfel, Kirsche, Zitrone wachsen am Baum, die Erdbeere nicht (zweite Lösung)
    rot: { id: 'rot', a: ['apfel', 'erdbeere', 'kirsche'], aSg: 'ist rot', aPl: 'sind rot', b: odd(['banane'], 'ist gelb') },
    streifen: { id: 'streifen', a: ['zebra', 'tiger', 'biene'], aSg: 'hat Streifen', aPl: 'haben Streifen', b: odd(['marienkaefer'], 'hat Punkte') },
    // ---- feine Unterschiede (nur Stufe 4) ----
    pinguin: { id: 'pinguin', a: BIRDS_FLY, aSg: 'kann fliegen', aPl: 'können fliegen', b: odd(['pinguin'], 'kann nicht fliegen', 'Dafür kann der Pinguin super schwimmen.') },
    fledermaus: { id: 'fledermaus', a: BIRDS_FLY, aSg: 'ist ein Vogel', aPl: 'sind Vögel', b: odd(['fledermaus'], 'ist kein Vogel', 'Die Fledermaus hat ein Fell und keine Federn.') },
    beine: {
      id: 'beine', a: ['hund-ganz', 'katze-ganz', 'pferd-ganz', 'kuh', 'schwein-ganz', 'ziege', 'elefant', 'tiger-ganz', 'kamel'],
      aSg: 'hat vier Beine', aPl: 'haben vier Beine', b: odd(['hahn', 'ente', 'pinguin'], 'hat zwei Beine'),
    },
    baumobst: {
      id: 'baumobst', a: TREE_FRUIT, aSg: 'wächst am Baum', aPl: 'wachsen an Bäumen',
      b: [
        { id: 'erdbeere', pred: 'wächst nicht am Baum, sondern an einer kleinen Pflanze am Boden' },
        { id: 'ananas', pred: 'wächst nicht am Baum, sondern auf einer kleinen Pflanze' },
        { id: 'melone', pred: 'wächst nicht am Baum, sondern am Boden' },
        { id: 'karotte', pred: 'wächst in der Erde' },
      ],
    },
  };

  const SETS3 = [F.fliegenTiere, F.fliegenFahrzeuge, F.wasser, F.raeder, F.heiss, F.kalt, F.wald, F.bauernhof, F.licht, F.fuesse, F.kopf, F.rot, F.streifen];
  const SETS4 = [
    F.pinguin, F.fledermaus, F.beine, F.baumobst, F.kopf, F.fliegenTiere, F.wasser, F.raeder,
    Object.assign(catSet('obst2', 'gemuese'), { id: 'obst-gemuese-5' }),
    Object.assign(catSet('gemuese', 'obst2'), { id: 'gemuese-obst-5' }),
    Object.assign(catSet('hof', 'wild'), { id: 'hof-wild-5' }),
    Object.assign(catSet('wild', 'hof'), { id: 'wild-hof-5' }),
  ];

  /* ------------------------------------------------------------------
     Eindeutigkeits-Prüfer
     Jede gezogene Aufgabe wird geprüft: Gibt es ein Merkmal (oder eine
     Lexikon-Kategorie), das ALLE Bilder außer einem ANDEREN Bild teilen,
     hätte die Aufgabe zwei Lösungen (z. B. Apfel, Erdbeere, Auto sind rot –
     dann „passt“ auch die Banane „nicht“). Solche Ziehungen werden verworfen.
     Geprüft werden nur positive Gemeinsamkeiten – so denken Kinder:
     „Drei davon sind …“.
     ------------------------------------------------------------------ */
  const TAGS = {
    fliegt: ['vogel', 'eule', 'papagei', 'adler', 'taube', 'schwan', 'flamingo', 'biene', 'schmetterling', 'marienkaefer', 'fledermaus', 'ente', 'flugzeug', 'hubschrauber', 'rakete'],
    wasser: ['fisch', 'wal', 'delfin', 'hai', 'krake', 'krabbe', 'frosch', 'ente', 'schwan', 'pinguin', 'schildkroete', 'schiff', 'segelboot', 'kanu'],
    raeder: ['auto', 'bus', 'zug', 'fahrrad', 'traktor', 'roller', 'lastwagen', 'motorrad', 'feuerwehrauto', 'krankenwagen'],
    heiss: HOT.concat(['kerze']),
    kalt: COLD,
    licht: ['gluehbirne', 'taschenlampe', 'kerze'],
    rot: ['apfel', 'erdbeere', 'kirsche', 'feuerwehrauto', 'auto', 'marienkaefer', 'rose'],
    gelb: ['banane', 'zitrone', 'kueken', 'sonnenblume'],
    wald: FOREST.concat(['eule']),
    hof: FARM.concat(['huhn', 'hahn', 'kueken', 'ente']),
    kopf: HEAD,
    fuss: FEET,
    streifen: ['zebra', 'tiger', 'biene'],
    vogel: BIRDS_FLY.concat(['pinguin', 'ente', 'hahn', 'huhn', 'kueken']),
    baum: TREE_FRUIT,
  };
  const baseId = (id) => id.replace(/-ganz$/, '');
  function tagsOf(id) {
    const w = D.word(id);
    const t = new Set(w ? ['kat:' + w.c] : []);
    Object.keys(TAGS).forEach((tag) => { if (TAGS[tag].includes(baseId(id))) t.add(tag); });
    return t;
  }
  /** true, wenn kein Merkmal ein anderes Bild als den Ausreißer „aus der Reihe fallen“ lässt */
  function isUnique(ids, oddId) {
    const tagged = ids.map((id) => ({ id, tags: tagsOf(id) }));
    const allTags = new Set();
    tagged.forEach((x) => x.tags.forEach((t) => allTags.add(t)));
    for (const tag of allTags) {
      const lacking = tagged.filter((x) => !x.tags.has(tag));
      if (lacking.length === 1 && lacking[0].id !== oddId) return false;
    }
    return true;
  }
  /** Aufgabe ziehen: Gruppe + Ausreißer, die den Prüfer bestehen (sonst neue Ziehung). */
  function draw(sets, level, k) {
    let last = null;
    for (let s = 0; s < 12; s++) {
      const set = U.pickFresh('pn-set-' + level, sets, Math.min(4, sets.length - 1), (x) => x.id);
      for (let i = 0; i < 40; i++) {
        const outlier = U.pick(set.b);
        const pool = set.a.filter((id) => id !== outlier.id);
        if (pool.length < k) continue;
        const groupIds = U.sample(pool, k);
        last = { set, outlier, groupIds };
        if (isUnique(groupIds.concat([outlier.id]), outlier.id)) return last;
      }
    }
    return last;
  }

  const LEVELS = {
    1: { sets: SETS1, n: 4 },
    2: { sets: SETS2, n: 4 },
    3: { sets: SETS3, n: 4 },
    4: { sets: SETS4, n: 5 },
  };

  // nur für automatische Datenprüfungen (tests): Stufen und Prüfer
  D.debug = Object.assign(D.debug || {}, { passtNicht: { LEVELS, isUnique } });

  LT.registerGame({
    id: 'passt-nicht',
    area: 'denken',
    title: 'Was passt nicht?',
    icon: '🤔',
    levels: 4,
    rounds: 5,
    parent: {
      skill: 'Klassifizieren & logisch begründen',
      goal: 'Ihr Kind sucht die Gemeinsamkeit mehrerer Bilder (Oberbegriff oder Merkmal) und findet das Bild, das nicht dazugehört. Nach jeder Lösung nennt Flo die Begründung („Die Gurke ist Gemüse. Die anderen sind Obst.“). So lernt Ihr Kind, Denkregeln in Worte zu fassen – eine wichtige Grundlage für Sprache, Mathematik und Sachunterricht.',
      levels: [
        '4 Bilder, sehr verschiedene Oberbegriffe (z. B. 3 Tiere und 1 Fahrzeug)',
        '4 Bilder, nahe Oberbegriffe (Obst/Gemüse, Bauernhof/wilde Tiere, Spielzeug/Instrument)',
        '4 Bilder, gemeinsames Merkmal finden (kann fliegen, lebt im Wasser, hat Räder, ist heiß oder kalt …)',
        '5 Bilder und feine Unterschiede (Pinguin kann nicht fliegen, Fledermaus ist kein Vogel, Erdbeere wächst nicht am Baum)',
      ],
      tip: 'Spielen Sie „Was passt nicht?“ unterwegs mit Wörtern: „Apfel, Birne, Auto, Banane“. Fragen Sie immer nach: „Warum passt das nicht?“ – das Begründen ist wertvoller als die Lösung selbst.',
    },

    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      const k = cfg.n - 1; // so viele gehören zusammen

      // Gruppe und Ausreißer ziehen – geprüft auf genau EINE sinnvolle Lösung
      const { set, outlier, groupIds } = draw(cfg.sets, ctx.level, k);
      const group = D.words(groupIds);
      const oddWord = D.word(outlier.id);

      const items = group.map((w) => ({ content: w.e, say: D.art(w), correct: false, word: w }));
      items.push({ content: oddWord.e, say: D.art(oddWord), correct: true, word: oddWord });

      // ---------- Aufbau ----------
      ctx.stage.appendChild(
        el('div.prompt-box.pn-prompt', U.emoji('🤔', 'mid-emoji'), el('span.prompt-text', 'Was passt nicht?'))
      );

      const howMany = D.Num(k);
      const first = ctx.index === 0;
      const question = first
        ? `Was passt nicht? ${howMany} Bilder gehören zusammen. Eins passt nicht dazu.`
        : U.pick(['Was passt nicht?', 'Welches Bild passt nicht dazu?', 'Was passt hier nicht?']);
      ctx.setInstruction(`Was passt nicht? ${howMany} Bilder gehören zusammen. Eins passt nicht dazu.`);

      const reason = `${D.Art(oddWord)} ${outlier.pred}. Die anderen ${set.aPl}.` + (outlier.extra ? ' ' + outlier.extra : '');
      let groupTiles = [];

      // Eigener Kachel-Container: Die Bilder sind sofort zu sehen, bleiben aber gesperrt,
      // bis Frage und Benennung fertig sind (sonst würde das Benennen die Frage abschneiden).
      const box = el('div.choices.locked');
      ctx.stage.appendChild(box);
      const choosing = ctx.choices(items, {
        container: box,
        size: 'large',
        className: 'pn-choices n' + cfg.n,
        sayButton: true,
        hintAfter: 2,
        // Fehler erklären: Das angetippte Bild gehört doch zur Gruppe
        wrongSay: (it) => `${D.Art(it.word)} ${D.auch(set.aSg)}. Probier ein anderes!`,
        hintSay: () => `Ich helfe dir: ${howMany} davon ${set.aPl}. Welches nicht?`,
        onCorrect: (it, tile) => {
          groupTiles = (box._tiles || []).filter((t) => t !== tile);
          groupTiles.forEach((t) => t.classList.add('pn-same'));
        },
        correctSay: () => `Richtig! ${reason}`,
      });

      await ctx.say(question);
      // Bilder benennen: auf Stufe 1 nur bei der ersten Aufgabe, danach immer (Wortschatz!)
      if (ctx.level > 1 || first) {
        for (const t of box._tiles || []) {
          if (!ctx.active) return;
          t.classList.add('speaking');
          await ctx.say(t._item.say);
          t.classList.remove('speaking');
          await ctx.sleep(120);
        }
      }
      if (!ctx.active) return;
      box.classList.remove('locked');
      if (first) ctx.say('Welches passt nicht? Tippe es an!');

      await choosing;
      await ctx.sleep(400);
    },
  });
})();
