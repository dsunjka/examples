/* ==========================================================================
   Spiel „Schatten-Rätsel“ 🌑 – Formwahrnehmung, Figur-Grund, Raumlage.

   Didaktik:
   - Ein Schatten zeigt nur den Umriss: Farbe und Details fallen weg. Das
     Kind muss sich auf die FORM konzentrieren und charakteristische
     Merkmale suchen (Rüssel, Höcker, Stacheln, Segel …) – visuelle
     Analyse und Gestalterfassung, wichtig für das spätere Erkennen von
     Buchstabenformen.
   - Progression:
       1  Schatten → farbiges Bild, 3 sehr verschiedene Umrisse
       2  Schatten → farbiges Bild, 4 ähnliche Umrisse (gleiche Gruppe)
       3  umgekehrt: farbiges Bild → richtiger Schatten (4 ähnliche)
       4  Spiegel-Schatten als Ablenker (nur asymmetrische Motive): Die
          Richtung muss stimmen – Raumlage-Wahrnehmung (Vorläufer für die
          Unterscheidung von b/d, p/q, 3/ε).
   - Hilfe: Nach dem 1. Fehler nennt Flo das entscheidende Merkmal als
     Frage („Schau genau: Wer hat einen langen Rüssel?“), nach dem 2. Fehler
     zeigt Flo die Lösung. Danach wird die Erkenntnis benannt („Richtig!
     Der Schatten gehört zum Elefanten. Er hat einen Rüssel und große Ohren.“)
     und der Schatten färbt sich ein (Aha-Effekt).
   - Daten geprüft: Alle Motive wurden als Silhouette (Noto Color Emoji)
     angesehen; Motive mit undeutlichem Umriss (z. B. Krokodil, Banane) oder
     ohne klare Richtung (Schere, Schirm) sind nicht bzw. nicht als
     Spiegel-Aufgabe dabei. Merkmale, die sich ähneln, kommen nie in
     derselben Aufgabe vor (avoid).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const D = LT.d1;

  /* ------------------------------------------------------------------
     Motive: [id, Gruppe, Merkmal (Prädikat), „zu …“ (Dativ), Art, asymmetrisch, avoid]
     Art: 'tier' → „Wer …?“, 'ding' → „Was …?“
     ------------------------------------------------------------------ */
  const RAW = [
    // große Tiere
    ['elefant', 'gross', 'hat einen Rüssel und große Ohren', 'zum Elefanten', 'tier', 1],
    ['nashorn', 'gross', 'hat ein Horn auf der Nase', 'zum Nashorn', 'tier', 1],
    ['kamel', 'gross', 'hat zwei Höcker auf dem Rücken', 'zum Kamel', 'tier', 1],
    ['hirsch', 'gross', 'hat ein großes Geweih', 'zum Hirsch', 'tier', 1],
    ['giraffe', 'gross', 'hat einen ganz langen Hals', 'zur Giraffe', 'tier', 1, ['flamingo', 'dino']],
    // Vögel
    ['hahn', 'voegel', 'hat einen Kamm auf dem Kopf', 'zum Hahn', 'tier', 1],
    ['ente', 'voegel', 'hat einen breiten, flachen Schnabel', 'zur Ente', 'tier', 1],
    ['papagei', 'voegel', 'hat einen krummen Schnabel', 'zum Papagei', 'tier', 1],
    ['pinguin', 'voegel', 'steht aufrecht und hat kurze Flügel', 'zum Pinguin', 'tier', 0],
    ['flamingo', 'voegel', 'steht auf einem langen, dünnen Bein', 'zum Flamingo', 'tier', 1, ['giraffe']],
    // kleine Tiere
    ['hase-ganz', 'klein', 'hat lange Ohren', 'zum Hasen', 'tier', 1],
    ['maus-ganz', 'klein', 'hat einen langen, dünnen Schwanz', 'zur Maus', 'tier', 1],
    ['eichhoernchen', 'klein', 'hat einen großen, buschigen Schwanz', 'zum Eichhörnchen', 'tier', 1],
    ['igel', 'klein', 'hat viele spitze Stacheln', 'zum Igel', 'tier', 1],
    ['schnecke', 'klein', 'trägt ein Haus auf dem Rücken', 'zur Schnecke', 'tier', 1],
    // Urzeit & Meer
    ['dino', 'urmeer', 'hat einen langen Hals und einen langen Schwanz', 'zum Dino', 'tier', 1, ['giraffe']],
    ['t-rex', 'urmeer', 'hat einen großen Kopf und winzige Arme', 'zum T-Rex', 'tier', 1],
    ['schildkroete', 'urmeer', 'hat einen runden Panzer', 'zur Schildkröte', 'tier', 1],
    ['hai', 'urmeer', 'hat eine spitze Flosse auf dem Rücken', 'zum Hai', 'tier', 1],
    ['wal', 'urmeer', 'spritzt Wasser in die Luft', 'zum Wal', 'tier', 1],
    // Krabbeltiere & Co.
    ['krabbe', 'krabbel', 'hat zwei große Scheren', 'zur Krabbe', 'tier', 0, ['schere']],
    ['spinne', 'krabbel', 'hat acht dünne Beine', 'zur Spinne', 'tier', 0, ['krake']],
    ['schmetterling', 'krabbel', 'hat vier große Flügel', 'zum Schmetterling', 'tier', 0],
    ['marienkaefer', 'krabbel', 'ist rund wie ein kleiner Knopf', 'zum Marienkäfer', 'tier', 0],
    ['krake', 'krabbel', 'hat acht lange Arme', 'zum Kraken', 'tier', 0, ['spinne']],
    // Fahrzeuge
    ['hubschrauber', 'fahrzeuge', 'hat oben einen Propeller', 'zum Hubschrauber', 'ding', 1],
    ['traktor', 'fahrzeuge', 'hat hinten ein riesiges Rad', 'zum Traktor', 'ding', 1],
    ['fahrrad', 'fahrzeuge', 'hat zwei große Räder und einen Sattel', 'zum Fahrrad', 'ding', 0],
    ['roller', 'fahrzeuge', 'hat eine lange Lenkstange', 'zum Roller', 'ding', 1],
    ['segelboot', 'fahrzeuge', 'hat ein großes Segel', 'zum Segelboot', 'ding', 1],
    ['rakete', 'fahrzeuge', 'hat vorne eine spitze Nase', 'zur Rakete', 'ding', 1],
    // Werkzeug & Haushalt
    ['schluessel', 'werkzeug', 'hat oben einen runden Ring', 'zum Schlüssel', 'ding', 1],
    ['schere', 'werkzeug', 'hat zwei Löcher für die Finger', 'zur Schere', 'ding', 0, ['krabbe']],
    ['hammer', 'werkzeug', 'hat einen schweren Kopf und einen langen Stiel', 'zum Hammer', 'ding', 1],
    ['loeffel', 'werkzeug', 'ist vorne rund wie eine kleine Schale', 'zum Löffel', 'ding', 1],
    ['regenschirm', 'werkzeug', 'hat unten einen gebogenen Griff', 'zum Regenschirm', 'ding', 0],
    // Obst & Gemüse
    ['apfel', 'obst', 'hat oben einen Stiel und ein Blatt', 'zum Apfel', 'ding', 0],
    ['birne', 'obst', 'ist unten dick und oben schmal', 'zur Birne', 'ding', 0],
    ['ananas', 'obst', 'hat oben eine Krone aus spitzen Blättern', 'zur Ananas', 'ding', 0, ['baum']],
    ['karotte', 'obst', 'ist lang und unten ganz spitz', 'zur Karotte', 'ding', 1],
    // Leckereien
    ['brezel', 'lecker', 'hat drei Löcher', 'zur Brezel', 'ding', 0],
    ['eis', 'lecker', 'steckt in einer spitzen Waffel', 'zum Eis', 'ding', 0, ['tanne']],
    ['lutscher', 'lecker', 'ist rund und steckt auf einem Stab', 'zum Lutscher', 'ding', 1],
    ['torte', 'lecker', 'hat oben Kerzen', 'zur Torte', 'ding', 0],
    // Natur
    ['baum', 'natur', 'hat einen Stamm und eine runde Krone aus Blättern', 'zum Baum', 'ding', 0, ['ananas']],
    ['tanne', 'natur', 'ist spitz wie ein Dreieck', 'zur Tanne', 'ding', 0, ['eis']],
    ['kaktus', 'natur', 'hat Arme, die nach oben zeigen', 'zum Kaktus', 'ding', 0],
    ['pilz', 'natur', 'hat einen dicken Stiel und oben einen runden Hut', 'zum Pilz', 'ding', 0],
  ];

  const ITEMS = RAW.map(([id, group, f, zu, kind, asym, avoid]) => ({ id, group, f, zu, kind, asym: !!asym, avoid: avoid || [] }))
    .map((it) => Object.assign(it, { word: D.word(it.id) }))
    .filter((it) => it.word);
  const GROUPS = U.uniqueBy(ITEMS, (it) => it.group).map((it) => it.group);

  /** Dürfen zwei Motive in derselben Aufgabe vorkommen? (kein verwechselbares Merkmal) */
  const compat = (a, b) => a.id !== b.id && !a.avoid.includes(b.id) && !b.avoid.includes(a.id);
  const question = (t) => `${t.kind === 'tier' ? 'Wer' : 'Was'} ${t.f}?`;
  const insight = (t) => `${D.Pron(t.word)} ${t.f}.`;

  /** Ablenker wählen: bevorzugt aus der Gruppe des Ziels, sonst aus anderen Gruppen. */
  function distractors(target, n, { sameGroup, asymOnly }) {
    const ok = (x) => compat(target, x) && (!asymOnly || x.asym);
    if (!sameGroup) {
      // je ein Motiv aus verschiedenen ANDEREN Gruppen (sehr unterschiedliche Umrisse)
      const groups = U.shuffle(GROUPS.filter((g) => g !== target.group));
      const out = [];
      for (const g of groups) {
        if (out.length >= n) break;
        const cand = ITEMS.filter((x) => x.group === g && ok(x) && out.every((o) => compat(o, x)));
        if (cand.length) out.push(U.pick(cand));
      }
      return out;
    }
    const same = U.shuffle(ITEMS.filter((x) => x.group === target.group && ok(x)));
    const out = same.slice(0, n);
    if (out.length < n) out.push(...U.sample(ITEMS.filter((x) => x.group !== target.group && ok(x)), n - out.length));
    return out;
  }

  const LEVELS = {
    1: { dir: 'shadow-to-pic', n: 3, sameGroup: false },
    2: { dir: 'shadow-to-pic', n: 4, sameGroup: true },
    3: { dir: 'pic-to-shadow', n: 4, sameGroup: true },
    4: { dir: 'mirror', n: 4, sameGroup: true },
  };

  LT.registerGame({
    id: 'schatten',
    area: 'denken',
    title: 'Schatten-Rätsel',
    icon: '🌑',
    levels: 4,
    rounds: 5,
    parent: {
      skill: 'Formwahrnehmung, Figur-Grund & Raumlage',
      goal: 'Ein Schatten zeigt nur den Umriss. Ihr Kind lernt, auf die Form und auf typische Merkmale zu achten (Rüssel, Höcker, Segel …) statt auf Farben. In der höchsten Stufe sind Schatten gespiegelt – dann muss auch die Richtung stimmen. Diese genaue visuelle Analyse hilft später, ähnliche Buchstaben wie b und d sicher zu unterscheiden.',
      levels: [
        'Schatten zum Bild: 3 Bilder mit sehr verschiedenen Umrissen',
        'Schatten zum Bild: 4 Bilder mit ähnlichen Umrissen',
        'Umgekehrt: Zum Bild den richtigen Schatten finden (4 ähnliche Schatten)',
        'Gespiegelte Schatten als Ablenker – Form UND Richtung müssen stimmen',
      ],
      tip: 'Machen Sie abends mit einer Taschenlampe Schattenspiele an der Wand: Welche Tiere kann Ihr Kind mit den Händen formen? Raten Sie abwechselnd Schatten von Alltagsdingen (Tasse, Schere, Löffel).',
    },

    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      const mirrorMode = cfg.dir === 'mirror';
      const pool = mirrorMode ? ITEMS.filter((x) => x.asym) : ITEMS;
      const target = U.pickFresh('sch-t-' + ctx.level, pool, 10, (x) => x.id);
      const w = target.word;

      /* ---------- Antwortmöglichkeiten ---------- */
      let items;
      let refMirror = false;
      if (cfg.dir === 'shadow-to-pic') {
        const others = distractors(target, cfg.n - 1, { sameGroup: cfg.sameGroup });
        items = [target].concat(others).map((x) => ({
          content: D.picture(x.word.e), say: D.art(x.word), correct: x === target, motif: x,
        }));
      } else if (cfg.dir === 'pic-to-shadow') {
        const others = distractors(target, cfg.n - 1, { sameGroup: true });
        items = [target].concat(others).map((x) => ({
          content: D.shadow(x.word.e), aria: 'Schatten', correct: x === target, motif: x,
        }));
      } else {
        // Spiegel-Stufe: Ziel richtig herum + Ziel gespiegelt + 2 andere (zufällige Richtung).
        // Auch das Vorlage-Bild wird zufällig gespiegelt → keine „Richtungs-Faustregel“.
        refMirror = U.chance(0.5);
        const others = distractors(target, 2, { sameGroup: true, asymOnly: true });
        items = [
          { content: D.shadow(w.e, { mirror: refMirror }), aria: 'Schatten', correct: true, motif: target },
          { content: D.shadow(w.e, { mirror: !refMirror }), aria: 'Schatten', correct: false, motif: target, flipped: true },
        ].concat(others.map((x) => ({ content: D.shadow(x.word.e, { mirror: U.chance(0.5) }), aria: 'Schatten', correct: false, motif: x })));
      }

      /* ---------- Vorlage ---------- */
      const showShadow = cfg.dir === 'shadow-to-pic';
      const promptPic = showShadow ? D.shadow(w.e) : D.picture(w.e, { mirror: mirrorMode && refMirror });
      promptPic.classList.add('sch-prompt-pic');
      const prompt = el('div.prompt-box.sch-wall' + (showShadow ? '.is-shadow' : '.is-picture'), promptPic);
      ctx.stage.classList.add('sch-stage');
      ctx.stage.appendChild(prompt);

      /* ---------- Ansage ---------- */
      let q;
      if (showShadow) {
        // „Wem?“ nur bei Tieren – bei Dingen fragt man „Was ist das für ein Schatten?“
        const ask = target.kind === 'tier' ? 'Wem gehört dieser Schatten?' : 'Was ist das für ein Schatten?';
        ctx.setInstruction(`${ask} Tippe auf das passende Bild.`);
        q = ctx.index === 0
          ? `Schau dir den Schatten genau an. ${ask} Tippe auf das passende Bild.`
          : U.pick([ask, `${ask} Schau genau hin!`, 'Zu welchem Bild passt der Schatten?']);
      } else if (!mirrorMode) {
        q = `Das ist ${D.ein(w)}. Welcher Schatten gehört ${target.zu}?`;
        ctx.setInstruction(q);
      } else {
        const base = `Das ist ${D.ein(w)}. Welcher Schatten passt genau ${target.zu}?`;
        ctx.setInstruction(`${base} Achte auch auf die Richtung!`);
        q = ctx.index === 0
          ? `Achtung, jetzt wird es knifflig! Manche Schatten sind wie im Spiegel verdreht. ${base}`
          : base;
      }
      ctx.say(q);

      /* ---------- Antworten ---------- */
      await ctx.choices(items, {
        size: 'large',
        className: 'sch-choices n' + items.length,
        sayButton: showShadow,
        hintAfter: 2,
        wrongSay: (it) => {
          if (ctx.wrongCount >= 1) return ''; // beim 2. Fehler übernimmt die Hilfe (hintSay)
          if (it.flipped) return 'Fast! Dieser Schatten ist wie im Spiegel verdreht. Schau genau, in welche Richtung das Bild zeigt.';
          // informativ: sagen, was das Angetippte ist, und das Merkmal des Ziels nennen
          if (showShadow) return `Hmm, das ist ${D.ein(it.motif.word)}. Schau genau: ${question(target)}`;
          return `Hmm, dieser Schatten gehört ${it.motif.zu}. ${D.Art(w)} ${target.f}.`;
        },
        hintSay: () => {
          if (showShadow) return `Schau, hier! Das ist ${D.art(w)}. ${insight(target)}`;
          if (mirrorMode) return 'Schau, hier! Dieser Schatten zeigt in dieselbe Richtung wie das Bild.';
          return `Schau, hier! Dieser Schatten gehört ${target.zu}.`;
        },
        onCorrect: (it, tile) => {
          // Aha-Effekt: Schatten färbt sich ein
          if (showShadow) prompt.classList.add('sch-reveal');
          else tile.classList.add('sch-reveal');
        },
        correctSay: () => {
          if (mirrorMode) {
            return U.pick([
              'Richtig! Dieser Schatten passt genau, sogar die Richtung stimmt!',
              `Super! Form und Richtung stimmen. ${insight(target)}`,
              'Genau! Der Schatten zeigt in dieselbe Richtung wie das Bild.',
            ]);
          }
          return `Richtig! ${showShadow ? 'Der' : 'Dieser'} Schatten gehört ${target.zu}. ${insight(target)}`;
        },
      });
      await ctx.sleep(500);
    },
  });
})();
