/* ==========================================================================
   Spiel „Tier-Wissen“ 🦁

   Didaktik:
   - Sachwissen über Tiere in vier Schritten – vom Hören zum Wissen:
     1. Tierlaute (auditiv, sehr konkret): „Welches Tier macht Muh?“
     2. Tierkinder: Fohlen, Kalb, Lamm … gehören zu welchem Tier?
        (Wortschatz: Fachbegriffe für Tierkinder; Raupe → Schmetterling und
        Kaulquappe → Frosch werden richtig als Verwandlung formuliert.)
     3. Lebensräume: Wo lebt der Pinguin? (klare Szenen ohne Tiere)
     4. Eigenschaften (Klassifizieren): fliegen, Eier legen, Panzer, Federn …
   - Fehler werden zum Lernanlass: Tippt das Kind ein falsches Tier an, sagt
     Flo, was dieses Tier macht („Die Katze macht Miau.“) bzw. erklärt
     typische Denkfallen („Der Pinguin ist ein Vogel, kann aber nicht fliegen.“
     „Der Wal lebt im Wasser, ist aber kein Fisch.“).
   - Nach 2 Fehlversuchen wird die richtige Kachel hervorgehoben und Flo gibt
     einen Hinweis – jede Aufgabe endet mit einem Erfolg.
   - Datensätze sind bewusst so gewählt, dass es immer GENAU EINE richtige
     Antwort gibt (z. B. nie Ente und Frosch zusammen bei „Quak“, nie Ente als
     Ablenker beim Küken, weil Entenkinder auch Küken heißen).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.w2;

  /* ------------------------------------------------------------------
     Tiere: id → [Emoji, Nominativ mit Artikel]
     ------------------------------------------------------------------ */
  const A = {
    kuh: ['🐄', 'die Kuh'], schaf: ['🐑', 'das Schaf'], ziege: ['🐐', 'die Ziege'], hund: ['🐶', 'der Hund'],
    katze: ['🐱', 'die Katze'], schwein: ['🐷', 'das Schwein'], hahn: ['🐓', 'der Hahn'], huhn: ['🐔', 'das Huhn'],
    ente: ['🦆', 'die Ente'], pferd: ['🐴', 'das Pferd'], loewe: ['🦁', 'der Löwe'], eule: ['🦉', 'die Eule'],
    biene: ['🐝', 'die Biene'], maus: ['🐭', 'die Maus'], kueken: ['🐥', 'das Küken'], wolf: ['🐺', 'der Wolf'],
    elefant: ['🐘', 'der Elefant'], schlange: ['🐍', 'die Schlange'], taube: ['🕊️', 'die Taube'], affe: ['🐒', 'der Affe'],
    frosch: ['🐸', 'der Frosch'], wildschwein: ['🐗', 'das Wildschwein'], schmetterling: ['🦋', 'der Schmetterling'],
    hase: ['🐰', 'der Hase'], pinguin: ['🐧', 'der Pinguin'], wal: ['🐳', 'der Wal'], delfin: ['🐬', 'der Delfin'],
    hai: ['🦈', 'der Hai'], krake: ['🐙', 'der Krake'], krabbe: ['🦀', 'die Krabbe'], tropenfisch: ['🐠', 'der Tropenfisch'],
    fisch: ['🐟', 'der Fisch'], papagei: ['🦜', 'der Papagei'], tiger: ['🐯', 'der Tiger'], gorilla: ['🦍', 'der Gorilla'],
    orang: ['🦧', 'der Orang-Utan'], faultier: ['🦥', 'das Faultier'], kamel: ['🐫', 'das Kamel'], skorpion: ['🦂', 'der Skorpion'],
    igel: ['🦔', 'der Igel'], eichhoernchen: ['🐿️', 'das Eichhörnchen'], hirsch: ['🦌', 'der Hirsch'], fuchs: ['🦊', 'der Fuchs'],
    fledermaus: ['🦇', 'die Fledermaus'], adler: ['🦅', 'der Adler'], schildkroete: ['🐢', 'die Schildkröte'],
    krokodil: ['🐊', 'das Krokodil'], giraffe: ['🦒', 'die Giraffe'], marienkaefer: ['🐞', 'der Marienkäfer'],
    ameise: ['🐜', 'die Ameise'], spinne: ['🕷️', 'die Spinne'], schwan: ['🦢', 'der Schwan'], pfau: ['🦚', 'der Pfau'],
  };
  const emo = (id) => A[id][0];
  const nom = (id) => A[id][1];                       // „die Kuh“
  const word = (id) => A[id][1].replace(/^\S+\s/, ''); // „Kuh“
  const Nom = (id) => U.cap(nom(id));                 // „Die Kuh“

  /** Kachel für ein Tier. */
  const animalItem = (id, correct, extra) => Object.assign({ content: emo(id), say: word(id), correct, value: id, size: 'large' }, extra || {});

  /* ------------------------------------------------------------------
     Stufe 1: Tierlaute (key = Laut-Gruppe; gleiche Laute nie gemeinsam)
     ------------------------------------------------------------------ */
  const SOUNDS = [
    { id: 'kuh', s: 'Muh', key: 'muh' },
    { id: 'schaf', s: 'Mäh', key: 'maeh' },
    { id: 'hund', s: 'Wau wau', key: 'wau' },
    { id: 'katze', s: 'Miau', key: 'miau' },
    { id: 'schwein', s: 'Grunz grunz', key: 'grunz' },
    { id: 'hahn', s: 'Kikeriki', key: 'kikeriki', not: ['huhn'] },
    { id: 'huhn', s: 'Gack gack', key: 'gack', not: ['hahn'] },
    { id: 'ente', s: 'Quak quak', key: 'quak' },
    { id: 'frosch', s: 'Quak quak', key: 'quak' },
    { id: 'eule', s: 'Schuhu', key: 'schuhu' },
    { id: 'biene', s: 'Summ summ', key: 'summ' },
    { id: 'maus', s: 'Piep piep', key: 'piep' },
    { id: 'kueken', s: 'Piep piep', key: 'piep' },
    { id: 'elefant', s: 'Törööö', key: 'toeroe' },
    { id: 'schlange', s: 'Zisch zisch', key: 'zisch' },
    { id: 'taube', s: 'Gurr gurr', key: 'gurr' },
    { id: 'wolf', s: 'Auuu', key: 'auuh' },
    { id: 'loewe', s: 'Roar', key: 'roar' },
  ];

  async function taskSounds(ctx) {
    const t = U.pickFresh('w2-tiere-laut', SOUNDS, 6, (x) => x.id);
    const pool = SOUNDS.filter((x) => x.key !== t.key && !(t.not || []).includes(x.id) && !(x.not || []).includes(t.id));
    const others = U.sample(pool, 2);
    ctx.stage.appendChild(el('div.prompt-box.w2-prompt', U.emoji('💬', 'mid-emoji'), el('span.prompt-text', `„${t.s}!“`)));
    ctx.instruct(`Welches Tier macht ${t.s}?`);
    const bySound = Object.fromEntries(SOUNDS.map((x) => [x.id, x.s]));
    await ctx.choices([animalItem(t.id, true), ...others.map((o) => animalItem(o.id, false))], {
      sayButton: true,
      correctSay: () => `Richtig! ${Nom(t.id)} macht ${t.s}.`,
      wrongSay: (it) => `${Nom(it.value)} macht ${bySound[it.value]}. Hör noch mal: Wer macht ${t.s}?`,
      hintSay: `Schau, das ist ${nom(t.id)}.`,
    });
  }

  /* ------------------------------------------------------------------
     Stufe 2: Tierkinder
     adult → [Dativ-Form]; baby: Name, Bild (Emoji oder gezeichnet), not = verbotene Ablenker
     ------------------------------------------------------------------ */
  const ADULTS = {
    pferd: 'vom Pferd', kuh: 'von der Kuh', schaf: 'vom Schaf', schwein: 'vom Schwein', huhn: 'vom Huhn',
    hund: 'vom Hund', katze: 'von der Katze', ziege: 'von der Ziege', frosch: 'vom Frosch',
    schmetterling: 'vom Schmetterling', wildschwein: 'vom Wildschwein', ente: 'von der Ente', hase: 'vom Hasen',
  };
  const BABIES = [
    { w: 'Fohlen', a: 'das', adult: 'pferd' },
    { w: 'Kalb', a: 'das', adult: 'kuh' },
    { w: 'Lamm', a: 'das', adult: 'schaf', not: ['ziege'] },
    { w: 'Zicklein', a: 'das', adult: 'ziege', not: ['schaf'] },
    { w: 'Ferkel', a: 'das', adult: 'schwein', not: ['wildschwein'] },
    { w: 'Frischling', a: 'der', adult: 'wildschwein', not: ['schwein'] },
    { w: 'Küken', a: 'das', adult: 'huhn', e: '🐥', not: ['ente'] },
    { w: 'Welpe', a: 'der', adult: 'hund' },
    { w: 'Kätzchen', a: 'das', adult: 'katze' },
    { w: 'Kaulquappe', a: 'die', adult: 'frosch', change: true, svg: 'kaulquappe' },
    { w: 'Raupe', a: 'die', adult: 'schmetterling', change: true, e: '🐛' },
  ];
  const babyOf = (adultId) => BABIES.find((b) => b.adult === adultId);
  const indef = (b) => (b.a === 'der' ? 'Ein' : b.a === 'die' ? 'Eine' : 'Ein');

  function kaulquappeSVG() {
    return W.svg('<path d="M40 30 Q60 18 78 30 Q92 40 104 28 Q96 46 80 40 Q64 36 56 44 Z" fill="#3b3f58"/><ellipse cx="36" cy="34" rx="18" ry="14" fill="#3b3f58"/><circle cx="30" cy="30" r="3.5" fill="#fff"/><circle cx="29" cy="30" r="1.6" fill="#000"/>', '0 0 110 60', 'w2-tadpole');
  }

  async function taskBabies(ctx) {
    const b = U.pickFresh('w2-tiere-kind', BABIES, 5, (x) => x.w);
    const pool = Object.keys(ADULTS).filter((id) => id !== b.adult && !(b.not || []).includes(id));
    const others = U.sample(pool, 2);
    const pic = b.svg ? kaulquappeSVG() : U.emoji(b.e || '🍼', 'mid-emoji');
    ctx.stage.appendChild(el('div.prompt-box.w2-prompt', pic, el('span.prompt-text', b.w), U.emoji('➡️', 'small-emoji'), U.emoji('❓', 'mid-emoji')));
    let q;
    let right;
    if (b.change) {
      q = `${indef(b)} ${b.w} verwandelt sich, wenn sie groß wird. Welches Tier wird aus ihr?`;
      right = `Richtig! Aus der ${b.w} wird ${b.adult === 'frosch' ? 'ein Frosch' : 'ein Schmetterling'}.`;
    } else {
      q = `${indef(b)} ${b.w} ist ein Tierkind. Zu welchem Tier gehört es?`;
      if (b.a === 'der') q = `${indef(b)} ${b.w} ist ein Tierkind. Zu welchem Tier gehört er?`;
      right = `Richtig! ${U.cap(b.a)} ${b.w} ist das Kind ${ADULTS[b.adult]}.`;
    }
    ctx.instruct(q);
    await ctx.choices([animalItem(b.adult, true), ...others.map((id) => animalItem(id, false))], {
      sayButton: true,
      correctSay: right,
      wrongSay: (it) => {
        const kid = babyOf(it.value);
        if (!kid) return `Nein, ${b.a} ${b.w} ist nicht das Kind ${ADULTS[it.value]}. Probier ein anderes Tier!`;
        if (kid.change) return `Nein, ${nom(it.value)} war vorher eine ${kid.w}.`;
        return `Nein, das Kind ${ADULTS[it.value]} heißt ${kid.w}.`;
      },
      hintSay: b.change ? `Schau mal genau: In dieses Tier verwandelt sich ${b.a === 'die' ? 'die' : 'das'} ${b.w}.` : `Schau, zu diesem Tier gehört ${b.a} ${b.w}.`,
    });
  }

  /* ------------------------------------------------------------------
     Stufe 3: Lebensräume (nur eindeutige Zuordnungen!)
     ------------------------------------------------------------------ */
  const HOMES = [
    { id: 'kuh', h: 'hof' }, { id: 'schwein', h: 'hof' }, { id: 'schaf', h: 'hof' }, { id: 'huhn', h: 'hof' },
    { id: 'pferd', h: 'hof' }, { id: 'hahn', h: 'hof' },
    { id: 'fuchs', h: 'wald' }, { id: 'igel', h: 'wald', not: ['hof'] /* Igel leben auch in Gärten */ }, { id: 'eichhoernchen', h: 'wald' }, { id: 'hirsch', h: 'wald' },
    { id: 'wildschwein', h: 'wald' }, { id: 'eule', h: 'wald', not: ['hof'] /* Schleiereulen brüten in Scheunen */ },
    { id: 'wal', h: 'meer', not: ['eis'], fact: 'Er ist aber kein Fisch – er kommt nach oben und atmet Luft, so wie wir.' },
    { id: 'delfin', h: 'meer', fact: 'Delfine atmen Luft und spielen gern in den Wellen.' },
    { id: 'hai', h: 'meer' }, { id: 'krake', h: 'meer', fact: 'Er hat acht Arme.' }, { id: 'tropenfisch', h: 'meer' },
    { id: 'affe', h: 'dschungel' }, { id: 'papagei', h: 'dschungel' },
    { id: 'gorilla', h: 'dschungel' }, { id: 'orang', h: 'dschungel' },
    { id: 'faultier', h: 'dschungel', fact: 'Es hängt fast den ganzen Tag gemütlich im Baum.' },
    { id: 'kamel', h: 'wueste', fact: 'Es kann lange ohne Wasser auskommen.' },
    { id: 'pinguin', h: 'eis', not: ['meer'] /* Pinguine jagen im Meer */, fact: 'Pinguine können nicht fliegen, aber super schwimmen.' },
  ];

  async function taskHomes(ctx) {
    const t = U.pickFresh('w2-tiere-heim', HOMES, 8, (x) => x.id);
    const home = W.habitat(t.h);
    const others = U.sample(W.HABITATS.filter((h) => h.id !== t.h && !(t.not || []).includes(h.id)), ctx.level >= 4 ? 3 : 2);
    ctx.stage.appendChild(el('div.prompt-box.w2-prompt', U.emoji(emo(t.id), 'big-emoji')));
    ctx.instruct(`Wo lebt ${nom(t.id)}?`);
    const items = [home, ...others].map((h) => ({
      content: W.sceneTile(W.habitatScene(h.id), h.label || h.name),
      say: h.name,
      value: h,
      correct: h.id === t.h,
      className: 'w2-scene-tile',
    }));
    await ctx.choices(items, {
      sayButton: true,
      nameFirst: ctx.index === 0,
      correctSay: `Richtig! ${Nom(t.id)} lebt ${home.dat}.${t.fact ? ' ' + t.fact : ''}`,
      wrongSay: (it) => `Das ist ${it.value.nom}. Da lebt ${nom(t.id)} nicht.`,
      hintSay: `${Nom(t.id)} lebt ${home.dat}. Schau, hier!`,
    });
  }

  /* ------------------------------------------------------------------
     Stufe 4: Eigenschaften. yes = richtige Tiere, no = sichere Ablenker,
     explain = Erklärung, wenn ein (verlockender) Ablenker angetippt wird.
     ------------------------------------------------------------------ */
  const PROPS = [
    {
      id: 'fliegen', phrase: 'kann fliegen', neg: 'kann nicht fliegen',
      yes: ['eule', 'papagei', 'taube', 'adler', 'biene', 'schmetterling', 'marienkaefer', 'fledermaus'],
      no: ['hund', 'katze', 'kuh', 'schwein', 'pinguin', 'elefant', 'igel', 'pferd', 'giraffe', 'schildkroete', 'hase'],
      explain: { pinguin: 'Der Pinguin ist ein Vogel, aber fliegen kann er nicht. Dafür schwimmt er super!' },
      facts: { fledermaus: 'Sie ist aber kein Vogel – sie hat ein Fell.' },
    },
    {
      id: 'eier', phrase: 'legt Eier', neg: 'legt keine Eier',
      yes: ['huhn', 'ente', 'schildkroete', 'krokodil', 'pinguin', 'eule', 'schwan', 'frosch'],
      no: ['hund', 'katze', 'kuh', 'pferd', 'schwein', 'schaf', 'elefant', 'loewe', 'affe', 'wal', 'maus', 'hase'],
      explain: {
        hase: 'Hasen legen keine Eier – das gibt es nur in der Ostergeschichte. Hasen bekommen lebende Babys.',
        wal: 'Der Wal legt keine Eier. Er bekommt ein lebendes Baby und gibt ihm Milch.',
      },
      facts: { frosch: 'Der Frosch legt ganz viele Eier ins Wasser. Das nennt man Laich.' },
    },
    {
      id: 'panzer', phrase: 'hat einen Panzer', neg: 'hat keinen Panzer',
      yes: ['schildkroete', 'krabbe'],
      no: ['hund', 'katze', 'kuh', 'pferd', 'hase', 'elefant', 'giraffe', 'affe', 'schaf', 'maus', 'igel', 'frosch'],
      explain: { igel: 'Der Igel hat Stacheln, aber keinen Panzer.' },
      facts: { schildkroete: 'Bei Gefahr zieht sie den Kopf in den Panzer.' },
    },
    {
      id: 'wasser', phrase: 'lebt im Wasser', neg: 'lebt nicht im Wasser',
      yes: ['fisch', 'tropenfisch', 'wal', 'delfin', 'hai', 'krake'],
      no: ['hund', 'katze', 'kuh', 'loewe', 'giraffe', 'elefant', 'pferd', 'kamel', 'eichhoernchen', 'hase', 'affe', 'schaf'],
      explain: {},
      facts: { wal: 'Er ist aber kein Fisch – er atmet Luft wie wir.', delfin: 'Er ist aber kein Fisch – er atmet Luft.' },
    },
    {
      id: 'stacheln', phrase: 'hat Stacheln', neg: 'hat keine Stacheln',
      yes: ['igel'],
      no: ['hase', 'maus', 'katze', 'hund', 'schaf', 'kuh', 'fuchs', 'eichhoernchen', 'pferd', 'affe', 'ente'],
      explain: {},
      facts: { igel: 'Bei Gefahr rollt er sich zu einer Stachelkugel zusammen.' },
    },
    {
      id: 'ruessel', phrase: 'hat einen Rüssel', neg: 'hat keinen Rüssel',
      yes: ['elefant'],
      no: ['giraffe', 'loewe', 'kuh', 'pferd', 'hund', 'katze', 'affe', 'kamel', 'tiger'],
      explain: {},
      facts: { elefant: 'Mit dem Rüssel kann er trinken, riechen und Dinge greifen.' },
    },
    {
      id: 'hals', phrase: 'hat einen ganz langen Hals', neg: 'hat keinen langen Hals',
      yes: ['giraffe'],
      no: ['elefant', 'loewe', 'kuh', 'schwein', 'hund', 'katze', 'affe', 'tiger', 'hase', 'igel'],
      explain: {},
      facts: { giraffe: 'So kommt sie an die Blätter ganz oben in den Bäumen.' },
    },
    {
      id: 'achtbeine', phrase: 'hat acht Beine', neg: 'hat nicht acht Beine',
      yes: ['spinne'],
      no: ['biene', 'marienkaefer', 'ameise', 'hund', 'katze', 'huhn', 'pferd'],
      explain: {
        biene: 'Die Biene ist ein Insekt. Sie hat sechs Beine.',
        marienkaefer: 'Der Marienkäfer ist ein Käfer. Er hat sechs Beine.',
        ameise: 'Die Ameise ist ein Insekt. Sie hat sechs Beine.',
        huhn: 'Das Huhn hat nur zwei Beine.',
      },
      facts: { spinne: 'Insekten haben nur sechs Beine. Die Spinne ist also kein Insekt.' },
    },
    {
      id: 'federn', phrase: 'hat Federn', neg: 'hat keine Federn',
      yes: ['eule', 'papagei', 'huhn', 'ente', 'pinguin', 'schwan', 'taube', 'pfau'],
      no: ['hund', 'katze', 'fledermaus', 'schmetterling', 'maus', 'kuh', 'frosch', 'biene', 'hase', 'pferd'],
      explain: {
        fledermaus: 'Die Fledermaus kann fliegen, aber sie hat Fell und keine Federn.',
        schmetterling: 'Der Schmetterling hat Flügel, aber keine Federn.',
      },
      facts: { pinguin: 'Er ist ein Vogel – auch wenn er nicht fliegen kann.' },
    },
  ];

  async function taskProps(ctx) {
    const p = U.pickFresh('w2-tiere-prop', PROPS, 4, (x) => x.id);
    const t = U.pick(p.yes);
    const others = U.sample(p.no, 3);
    ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-prop', PROP_ICON[p.id] ? U.emoji(PROP_ICON[p.id], 'big-emoji') : null, U.emoji('❓', 'big-emoji')));
    ctx.instruct(`Welches Tier ${p.phrase}?`);
    await ctx.choices([animalItem(t, true), ...others.map((id) => animalItem(id, false))], {
      sayButton: true,
      correctSay: `Richtig! ${Nom(t)} ${p.phrase}.${p.facts[t] ? ' ' + p.facts[t] : ''}`,
      wrongSay: (it) => p.explain[it.value] || `Nein, ${nom(it.value)} ${p.neg}.`,
      hintSay: `Schau, ${nom(t)} ${p.phrase}.`,
    });
  }
  /** Symbol für die Eigenschaft im Aufgabenkasten (zeigt die Frage, nicht die Antwort). */
  const PROP_ICON = { fliegen: '✈️', eier: '🥚', panzer: '🛡️', wasser: '🌊', stacheln: '🌵', ruessel: '👃', hals: '📏', achtbeine: '8️⃣', federn: '🪶' };

  LT.registerGame({
    id: 'tiere',
    area: 'welt',
    title: 'Tier-Wissen',
    icon: '🦁',
    levels: 4,
    rounds: 5,
    parent: {
      skill: 'Sachwissen Tiere',
      goal: 'Ihr Kind ordnet Tierlaute, Tierkinder, Lebensräume und typische Merkmale den richtigen Tieren zu. Es lernt Fachwörter (Fohlen, Ferkel, Kaulquappe), übt das Klassifizieren nach Merkmalen und erfährt nebenbei Sachwissen – etwa, dass der Wal kein Fisch ist oder der Pinguin nicht fliegen kann.',
      levels: [
        'Stufe 1: Tierlaute – Welches Tier macht Muh?',
        'Stufe 2: Tierkinder – Fohlen, Kalb, Lamm, Ferkel … und Verwandlungen (Raupe → Schmetterling)',
        'Stufe 3: Lebensräume – Bauernhof, Wald, Meer, Dschungel, Wüste, Eis (3 Szenen)',
        'Stufe 4: Merkmale – Welches Tier kann fliegen, legt Eier, hat einen Panzer? (4 Tiere)',
      ],
      tip: 'Im Zoo, auf dem Bauernhof oder beim Bilderbuch: Fragen Sie „Wie heißt das Tierbaby?“ oder „Wo wohnt dieses Tier?“. Ein Ausflug zum Teich im Frühling zeigt echte Kaulquappen!',
    },
    async task(ctx) {
      if (ctx.level === 1) return taskSounds(ctx);
      if (ctx.level === 2) return taskBabies(ctx);
      if (ctx.level === 3) return taskHomes(ctx);
      // Stufe 4: meist Merkmale, ab und zu Lebensraum mit 4 Szenen (Wiederholung)
      if (ctx.index === 2) return taskHomes(ctx);
      return taskProps(ctx);
    },
  });
})();
