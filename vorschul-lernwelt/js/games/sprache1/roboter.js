/* ==========================================================================
   Spiel „Roboter-Sprache“ (roboter) – Silben zu Wörtern verbinden.

   Didaktik:
   - Synthese: Robo spricht ein Wort „zerhackt“ in Silben („Ba … na … ne“),
     das Kind setzt die Silben im Kopf zum Wort zusammen und tippt das Bild
     an. Genau das braucht es später beim Lesen („Ro-se“ → Rose).
   - Gearbeitet wird mit SILBEN, nicht mit Einzellauten: Die Vorlesestimme
     spricht Silben zuverlässig, isolierte Laute dagegen nicht.
   - Die Bilder werden auf den Stufen 1–3 NICHT vorher benannt (sonst wäre
     die Synthese überflüssig); jedes Bild hat aber einen 🔊-Knopf. Bei einem
     Fehler nennt Flo das gewählte Bild („Das ist die Birne.“) und Robo
     wiederholt das Wort. Robo antippen = nochmal hören.
   - Stufen:
       1  Wörter mit 2 Silben, 3 Bilder (verschiedene Anfänge)
       2  Wörter mit 3 Silben, 4 Bilder
       3  Ähnlich beginnende Wörter (Karotte – Kartoffel – Kamel – Kaktus):
          genau bis zum Ende hinhören
       4  Nur die erste Silbe („Ra …“) – welches Wort fängt so an?
          (Bilder werden benannt; Ablenker beginnen mit anderen Lauten)
       5  Erste Silbe – alle Wörter beginnen mit demselben Laut, nur der
          Vokal unterscheidet sich (Kü … → Küken, Kiwi oder Katze?)
   - Nach 2 Fehlversuchen wird das richtige Bild hervorgehoben.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S = LT.s1;

  /* Wörter: alle mehrsilbigen Wörter der geprüften Datenbank (ohne Avocado –
     für Vorschulkinder zu unbekannt). */
  const WORDS = S.words.filter((x) => x.s.length >= 2 && x.w !== 'Avocado');
  const W = (name) => WORDS.find((x) => x.w === name);

  /* Stufe 3: Gruppen ähnlich beginnender Wörter */
  const START_GROUPS = [
    ['Katze', 'Kamel', 'Karotte', 'Kartoffel', 'Kaktus', 'Karussell', 'Kamera'],
    ['Koala', 'Kokosnuss', 'Küken', 'Käse', 'Känguru', 'Kerze', 'Kirsche', 'Kiwi'],
    ['Banane', 'Badewanne', 'Birne', 'Biene', 'Besen'],
    ['Roller', 'Roboter', 'Rose', 'Rakete', 'Raupe', 'Rucksack'],
    ['Regenschirm', 'Regenbogen', 'Rakete', 'Raupe'],
    ['Giraffe', 'Gitarre', 'Geige', 'Gurke', 'Gorilla'],
    ['Trommel', 'Trompete', 'Traktor', 'Tropfen', 'Traube'],
    ['Krokodil', 'Krone', 'Krankenwagen'],
    ['Löwe', 'Löffel', 'Lutscher', 'Luftballon', 'Lastwagen', 'Lama'],
    ['Hamster', 'Hammer', 'Hamburger', 'Handy', 'Hase', 'Handschuh'],
    ['Sonne', 'Sonnenblume', 'Socke', 'Seife', 'Salat'],
    ['Schneemann', 'Schneeflocke', 'Schnecke'],
    ['Taxi', 'Tasche', 'Taschenlampe', 'Tomate', 'Tiger'],
    ['Panda', 'Papagei', 'Pizza', 'Pinsel', 'Popcorn', 'Polizeiauto'],
    ['Flamingo', 'Flasche', 'Flugzeug', 'Fledermaus'],
    ['Schlitten', 'Schlüssel', 'Schleife', 'Schlange'],
    ['Muschel', 'Muffin', 'Mücke', 'Mikrofon', 'Motorrad', 'Magnet'],
    ['Teddy', 'Telefon', 'Tiger', 'Tomate', 'Tulpe'],
    ['Feuer', 'Feuerwehrauto', 'Fernseher', 'Fahrrad'],
    ['Brille', 'Brezel', 'Brokkoli', 'Birne'],
    ['Zebra', 'Zitrone', 'Ziege', 'Zwiebel'],
    ['Apfel', 'Affe', 'Ananas', 'Ameise', 'Anker', 'Ampel'],
    ['Elefant', 'Ente', 'Erdbeere'],
    ['Dino', 'Delfin', 'Donut', 'Dose', 'Daumen'],
    ['Wolke', 'Wecker', 'Würfel'],
  ]
    .map((g) => g.map((n) => { const x = W(n); if (!x) console.warn('roboter: unbekanntes Wort', n); return x; }).filter(Boolean))
    .filter((g) => g.length >= 3);

  /* Stufe 4/5: mögliche Zielwörter (beginnen mit Konsonant, erste Silbe klingt allein eindeutig) */
  const START_TARGETS = WORDS.filter((x) => x.on !== '-' && !x.g);
  /** Wörter mit gleichem Anfangslaut, aber anderem Vokal (für Stufe 5) */
  function sameOnsetOthers(t) {
    const byV = {};
    WORDS.forEach((x) => {
      if (x.on === t.on && x.v !== t.v && x !== t && x.e !== t.e) (byV[x.v] = byV[x.v] || []).push(x);
    });
    return Object.values(byV).map((list) => U.pick(list));
  }
  const L5_TARGETS = START_TARGETS.filter((t) => {
    const vs = new Set(WORDS.filter((x) => x.on === t.on && x.v !== t.v).map((x) => x.v));
    return vs.size >= 2;
  });

  /** Ablenker mit anderem ersten Laut (untereinander auch verschieden) */
  function otherStarts(t, n, filter) {
    const used = new Set([S.firstSound(t)]);
    const out = [];
    for (const x of U.shuffle(WORDS.filter((y) => y !== t && y.e !== t.e && filter(y)))) {
      if (out.length >= n) break;
      const fs = S.firstSound(x);
      if (used.has(fs)) continue;
      used.add(fs);
      out.push(x);
    }
    return out;
  }

  /* ------------------------------------------------------------------
     Aufgabe
     ------------------------------------------------------------------ */
  function buildTask(level) {
    if (level === 1) {
      const t = U.pickFresh('robo-2', WORDS.filter((x) => x.s.length === 2), 12, (x) => x.w);
      return { t, dis: otherStarts(t, 2, (y) => y.s.length <= 3), mode: 'whole' };
    }
    if (level === 2) {
      const t = U.pickFresh('robo-3', WORDS.filter((x) => x.s.length === 3), 12, (x) => x.w);
      return { t, dis: otherStarts(t, 3, (y) => y.s.length >= 2 && y.s.length <= 4), mode: 'whole' };
    }
    if (level === 3) {
      const g = U.pickFresh('robo-grp', START_GROUPS, 6);
      const t = U.pickFresh('robo-sim', g, 3, (x) => x.w);
      const dis = U.sample(g.filter((x) => x !== t && x.e !== t.e), 3);
      return { t, dis, mode: 'whole' };
    }
    if (level === 4) {
      const t = U.pickFresh('robo-start', START_TARGETS, 12, (x) => x.w);
      return { t, dis: otherStarts(t, 2, () => true), mode: 'start' };
    }
    const t = U.pickFresh('robo-start5', L5_TARGETS, 10, (x) => x.w);
    return { t, dis: U.sample(sameOnsetOthers(t), 2), mode: 'start' };
  }

  LT.registerGame({
    id: 'roboter',
    area: 'sprache',
    title: 'Roboter-Sprache',
    icon: '🤖',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Silben zu Wörtern verbinden (Synthese)',
      goal: 'Robo spricht Wörter in Silben „zerhackt“. Ihr Kind setzt die Silben im Kopf wieder zum ganzen Wort zusammen und hört später schon am Wortanfang, welches Wort gemeint ist. Genau diese Fähigkeit braucht es beim Lesenlernen, wenn aus Silben und Lauten ein Wort wird.',
      levels: [
        'Stufe 1: Wörter mit 2 Silben, 3 Bilder',
        'Stufe 2: Wörter mit 3 Silben, 4 Bilder',
        'Stufe 3: Wörter, die ähnlich anfangen (Karotte, Kartoffel, Kamel …) – bis zum Ende hinhören',
        'Stufe 4: Nur die erste Silbe hören („Ra …“) – welches Wort fängt so an?',
        'Stufe 5: Nur die erste Silbe – alle Wörter beginnen mit demselben Laut (Kü … → Küken, Kiwi oder Katze?)',
      ],
      tip: 'Spielen Sie „Roboter“: Sprechen Sie Wörter in Silben mit kleinen Pausen („Ba – de – wan – ne“) und lassen Sie Ihr Kind raten. Dann tauschen Sie die Rollen – jetzt ist Ihr Kind der Roboter! Das klappt prima beim Einkaufen oder im Auto.',
    },

    async task(ctx) {
      const { t, dis, mode } = buildTask(ctx.level);
      const syls = mode === 'start' ? [t.s[0]] : t.s;
      const shown = mode === 'start' ? `${t.s[0]} …` : syls.join(' … '); // Anzeige
      const spoken = mode === 'start' ? `${S.sylSpeak(t.s[0], 0)} …` : S.joinSyl(syls, ' … '); // Sprachausgabe

      /* --- Bühne: Robo + Sprechblase, darunter die Bilder --- */
      const robo = el('button.s1-robo', { type: 'button', 'aria-label': 'Robo – nochmal hören', title: 'Robo – nochmal hören', html: S.robotSVG() });
      robo.appendChild(el('span.s1-robo-badge', { 'aria-hidden': 'true' }, '🔁'));
      const balloon = el('div.s1-balloon', { 'aria-live': 'polite' });
      ctx.stage.appendChild(el('div.s1-robo-row', robo, balloon));
      const box = el('div.choices.s1-choices');
      ctx.stage.appendChild(box);

      let speaking = false;
      // Flos Sprechblase würde Robos Silben anzeigen → ausblenden, solange Robo spricht
      const voiceOff = () => {
        if (LT.ui.hideBubble) LT.ui.hideBubble();
        document.body.classList.remove('s1-robo-voice');
      };
      const waitDots = () => el('span.s1-dots', { 'aria-hidden': 'true' }, el('i'), el('i'), el('i'));
      balloon.appendChild(waitDots());
      ctx.onCleanup(voiceOff);

      /** Robo spricht (Silben einzeln, tiefe Roboterstimme, Mund leuchtet). */
      async function roboSpeak() {
        if (speaking || !ctx.active) return;
        speaking = true;
        robo.classList.remove('happy', 'confused');
        robo.classList.add('talking');
        document.body.classList.add('s1-robo-voice');
        S.robotBeep();
        await ctx.sleep(260);
        for (let i = 0; i < syls.length; i++) {
          if (!ctx.active) break;
          if (i === 0) U.clear(balloon);
          balloon.appendChild(el('span.s1-chip', mode === 'start' ? shown : syls[i]));
          LT.ui.animate(robo, 's1-beat');
          await ctx.say(S.sylSpeak(syls[i], i), S.robotVoice());
          await ctx.sleep(mode === 'start' ? 150 : 380);
        }
        robo.classList.remove('talking');
        voiceOff();
        speaking = false;
      }
      ctx.listen(robo, 'click', () => roboSpeak());

      const startOf = (x) => S.sylSpeak(x.s[0], 0);
      const items = [t].concat(dis).map((x) => ({ content: x.e, say: x.w, correct: x === t, x }));
      const lock = S.lock(ctx, box);
      const p = ctx.choices(items, {
        container: box,
        sayButton: true,
        size: items.length <= 3 ? 'large' : undefined,
        className: items.length === 4 ? 's1-grid4' : '',
        correctSay: mode === 'start'
          ? () => `Richtig! ${t.w} fängt mit ${startOf(t)} an.`
          : () => S.vary('robo-ok', [`Richtig! ${S.joinSyl(t.s)}: ${t.w}!`, `Genau! Robo meint ${S.withArticle(t)}.`]),
        wrongSay: mode === 'start'
          ? (it) => `${it.x.w} fängt mit ${startOf(it.x)} an. Hör noch mal, was Robo sagt.`
          : (it) => `Das ist ${S.withArticle(it.x)}. Hör noch mal, was Robo sagt.`,
        hintSay: mode === 'start' ? () => `${startOf(t)} … ${t.w}!` : null,
        onWrong: async () => {
          robo.classList.add('confused');
          await ctx.sleep(300);
          await roboSpeak();
        },
        onCorrect: () => {
          robo.classList.remove('confused');
          robo.classList.add('happy');
        },
      });

      /* --- Ablauf --- */
      if (mode === 'whole') {
        if (ctx.index === 0) await ctx.say(ctx.level === 3
          ? 'Hör ganz genau bis zum Ende zu! Die Wörter fangen fast gleich an.'
          : 'Das ist Robo, der Roboter. Robo spricht ganz komisch – in Silben! Hör gut zu und finde das richtige Bild.');
        await ctx.instruct('Hör gut zu!');
        await roboSpeak();
        const q = 'Welches Bild meint Robo?';
        await ctx.say(q);
        ctx.setInstruction(`Robo sagt: ${spoken}. ${q}`);
      } else {
        if (ctx.index === 0) await ctx.say('Robo sagt jetzt nur den Anfang von einem Wort. Welches Wort fängt so an?');
        await ctx.instruct('Hör gut zu!');
        await roboSpeak();
        await ctx.say('Welches Wort fängt so an?');
        await S.nameTiles(ctx, box);
        await roboSpeak();
        ctx.setInstruction(`Robo sagt: ${spoken} Welches Wort fängt so an? ${items.map((i) => i.say).join(', ')}?`);
      }
      lock.release();
      await p;

      // Robo freut sich und sagt das ganze Wort
      if (!ctx.active) return;
      robo.classList.add('happy');
      document.body.classList.add('s1-robo-voice');
      await ctx.say(t.w + '!', S.robotVoice());
      voiceOff();
      await ctx.sleep(200);
    },
  });
})();
