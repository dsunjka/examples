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
   - Hilfe-Leiter: Erklärung zum gewählten Tier → Denkanstoß (Merkmal des
     gesuchten Tieres bzw. des Lebensraums) → Flo zeigt und begründet.
     Lerninhalte („Kuh: Muh“, „Fohlen“, „Pinguin – Eis und Schnee“,
     „kann fliegen“) über ctx.item – jede Aufgabe endet mit einem Erfolg.
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

  /** Denkanstoß: ein Merkmal des Tieres (verrät nicht den Namen). */
  const CLUE = {
    kuh: 'Das Tier gibt uns Milch.', schaf: 'Das Tier hat ganz viel Wolle.', hund: 'Das Tier wedelt mit dem Schwanz und bewacht das Haus.',
    katze: 'Das Tier schnurrt und fängt Mäuse.', schwein: 'Das Tier wälzt sich gern im Schlamm.', hahn: 'Das Tier weckt morgens den ganzen Bauernhof.',
    huhn: 'Das Tier legt Eier.', ente: 'Das Tier schwimmt auf dem Teich und hat Federn.', frosch: 'Das Tier ist grün und hüpft.',
    eule: 'Das Tier ist nachts wach und hat große Augen.', biene: 'Das Tier macht Honig.', maus: 'Das Tier ist ganz klein und mag Käse.',
    kueken: 'Das Tier ist ein kleines, gelbes Vogelkind.', elefant: 'Das Tier hat einen langen Rüssel.', schlange: 'Das Tier hat gar keine Beine.',
    taube: 'Das Tier ist ein Vogel und sitzt oft auf Dächern in der Stadt.', wolf: 'Das Tier heult nachts den Mond an.', loewe: 'Das Tier hat eine große Mähne.',
    pferd: 'Auf dem Tier kann man reiten.', ziege: 'Das Tier hat Hörner und einen kleinen Bart.', wildschwein: 'Das Tier lebt im Wald und hat borstiges Fell.',
    schmetterling: 'Das Tier hat bunte Flügel.',
  };
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
    // Lerninhalt = Tier und Laut („Kuh: Muh“)
    const t = ctx.item(SOUNDS, (x) => `${word(x.id)}: ${x.s}`, { avoid: 6 });
    const pool = SOUNDS.filter((x) => x.key !== t.key && !(t.not || []).includes(x.id) && !(x.not || []).includes(t.id));
    // nach Fehlern in der Runde nur zwei Tiere zur Auswahl
    const others = U.sample(pool, ctx.flow < 0 ? 1 : 2);
    ctx.stage.appendChild(el('div.prompt-box.w2-prompt', U.emoji('💬', 'mid-emoji'), el('span.prompt-text', `„${t.s}!“`)));
    ctx.instruct(`Welches Tier macht ${t.s}?`);
    const bySound = Object.fromEntries(SOUNDS.map((x) => [x.id, x.s]));
    await ctx.choices([animalItem(t.id, true), ...others.map((o) => animalItem(o.id, false))], {
      sayButton: true,
      hintAfter: W.hintAfter(ctx, others.length + 1),
      correctSay: () => (ctx.modelShown ? `Genau, ${nom(t.id)}.` : `Richtig! ${Nom(t.id)} macht ${t.s}.`),
      explain: (it) => `${Nom(it.value)} macht ${bySound[it.value]}. Hör noch mal: Wer macht ${t.s}?`,
      hintSay: () => `Ein Tipp: ${CLUE[t.id]}`,
      modelSay: () => `Schau: ${Nom(t.id)} macht ${t.s}.`,
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
    // Lerninhalt = das Tierkind („Fohlen“)
    const b = ctx.item(BABIES, (x) => x.w, { avoid: 5 });
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
      hintAfter: W.hintAfter(ctx, 3),
      correctSay: () => (ctx.modelShown ? `Genau, ${nom(b.adult)}.` : right),
      // 1. Hilfe: Wie heißt das Kind des gewählten Tieres?
      explain: (it) => {
        const kid = babyOf(it.value);
        if (!kid) return `${U.cap(b.a)} ${b.w} ist nicht das Kind ${ADULTS[it.value]}. Probier ein anderes Tier!`;
        const ask = b.change ? `Was wird aus der ${b.w}?` : `Zu welchem Tier gehört ${b.a} ${b.w}?`;
        if (kid.change) return `${Nom(it.value)} war vorher eine ${kid.w}. ${ask}`;
        return `Das Kind ${ADULTS[it.value]} heißt ${kid.w}. ${ask}`;
      },
      // 2. Hilfe: Merkmal des gesuchten Tieres
      hintSay: () => `Ein Tipp: ${CLUE[b.adult]}`,
      // 3. Hilfe: zeigen und begründen
      modelSay: () => (b.change
        ? `Schau: Aus der ${b.w} wird ${b.adult === 'frosch' ? 'ein Frosch' : 'ein Schmetterling'}.`
        : `Schau: ${U.cap(b.a)} ${b.w} ist das Kind ${ADULTS[b.adult]}.`),
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

  /** Wie ist es im Lebensraum? (Denkanstoß, ohne den Namen zu nennen) */
  const HOME_CLUE = {
    hof: 'der Bauer die Tiere füttert', wald: 'viele Bäume wachsen und Pilze stehen', meer: 'es ganz viel salziges Wasser gibt',
    dschungel: 'es heiß und feucht ist und riesige Pflanzen wachsen', wueste: 'es heiß und trocken ist und viel Sand gibt',
    eis: 'es das ganze Jahr ganz kalt ist',
  };
  async function taskHomes(ctx) {
    // Lerninhalt = Tier und Lebensraum („Pinguin – Eis und Schnee“)
    const t = ctx.item(HOMES, (x) => `${word(x.id)} – ${W.habitat(x.h).name}`, { avoid: 8 });
    const home = W.habitat(t.h);
    const others = U.sample(W.HABITATS.filter((h) => h.id !== t.h && !(t.not || []).includes(h.id)), ctx.taskLevel >= 4 ? 3 : 2);
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
      hintAfter: W.hintAfter(ctx, items.length),
      correctSay: () => (ctx.modelShown ? `Genau, ${home.dat}.${t.fact ? ' ' + t.fact : ''}`
        : `Richtig! ${Nom(t.id)} lebt ${home.dat}.${t.fact ? ' ' + t.fact : ''}`),
      explain: (it) => `Das ist ${it.value.nom}. Da lebt ${nom(t.id)} nicht.`,
      // Denkanstoß: Wie ist es dort, wo das Tier lebt?
      hintSay: () => `Ein Tipp: ${Nom(t.id)} lebt dort, wo ${HOME_CLUE[t.h]}.`,
      modelSay: () => `Schau: ${Nom(t.id)} lebt ${home.dat}.`,
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
    // Lerninhalt = das Merkmal („kann fliegen“)
    const p = ctx.item(PROPS, (x) => x.phrase, { avoid: 4 });
    const t = U.pick(p.yes);
    const others = U.sample(p.no, 3);
    ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-prop', PROP_ICON[p.id] ? U.emoji(PROP_ICON[p.id], 'big-emoji') : null, U.emoji('❓', 'big-emoji')));
    ctx.instruct(`Welches Tier ${p.phrase}?`);
    await ctx.choices([animalItem(t, true), ...others.map((id) => animalItem(id, false))], {
      sayButton: true,
      hintAfter: W.hintAfter(ctx, 4),
      correctSay: () => (ctx.modelShown ? `Genau!${p.facts[t] ? ' ' + p.facts[t] : ''}` : `Richtig! ${Nom(t)} ${p.phrase}.${p.facts[t] ? ' ' + p.facts[t] : ''}`),
      // 1. Hilfe: was für das gewählte Tier stimmt (typische Denkfallen erklärt)
      explain: (it) => p.explain[it.value] || `${Nom(it.value)} ${p.neg}.`,
      hintSay: () => `Ein Tipp: ${PROP_CLUE[p.id]}`,
      modelSay: () => `Schau: ${Nom(t)} ${p.phrase}.`,
    });
  }
  /** Denkanstoß je Merkmal (Strategie, nicht die Lösung). */
  const PROP_CLUE = {
    fliegen: 'Das Tier fliegt mit seinen Flügeln hoch durch die Luft.',
    eier: 'Tiere, die ihren Babys Milch geben, legen keine Eier.',
    panzer: 'Ein Panzer ist hart wie ein Helm und schützt den Körper.',
    wasser: 'Wer im Wasser lebt, hat oft Flossen statt Beine.',
    stacheln: 'Stacheln sind spitz und pieksen.',
    ruessel: 'Ein Rüssel ist eine ganz lange Nase.',
    hals: 'Mit einem ganz langen Hals kommt man an die Blätter oben im Baum.',
    achtbeine: 'Insekten haben sechs Beine. Wir suchen ein Tier mit mehr Beinen.',
    federn: 'Alle Vögel haben Federn.',
  };
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
      if (ctx.taskLevel === 1) return taskSounds(ctx);
      if (ctx.taskLevel === 2) return taskBabies(ctx);
      if (ctx.taskLevel === 3) return taskHomes(ctx);
      // Stufe 4: meist Merkmale, ab und zu Lebensraum mit 4 Szenen (Wiederholung)
      if (ctx.index === 2) return taskHomes(ctx);
      return taskProps(ctx);
    },
  });
})();
