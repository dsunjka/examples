/* ==========================================================================
   Spiel „Lesedetektiv“ 🕵️ (Leseschule, Klasse 1) – sinnentnehmendes Lesen

   Didaktik (KMK Lesen: Texte verstehen, Anweisungen lesen und umsetzen):
   - Das Kind LIEST selbst. Wort, Satz oder Geschichte werden vor der Antwort
     NICHT vorgelesen. Ein 🔊-Knopf an der Lesekarte liest vor, zählt aber
     als Hilfe (die Aufgabe gilt dann nicht mehr als „auf Anhieb“ gelöst und
     kommt in der Wiederholung früher wieder).
   - Lupe / Leselineal: Antippen eines Wortes lässt es still aufleuchten; nach
     einem Fehlversuch wandert das Leselineal still Wort für Wort (Buchstabe
     für Buchstabe auf Stufe 1) über den Text.
   - Gegen „nur das erste Wort lesen und raten“: Die Bilder unterscheiden sich
     immer nur in EINEM entscheidenden Wort – mal am Anfang, mal am Ende.
     Die Erklärung nach einem Fehler sagt, WO der Unterschied liegt
     („Der Anfang stimmt. Lies weiter bis zum Punkt!“), ohne die Lösung zu
     verraten. Beim Denkanstoß leuchten die entscheidenden Wörter.
   - Stufen:
       1  Wort ↔ Bild mit ähnlichen Wörtern (Maus/Haus/Mais, Biene/Birne)
       2  Satz ↔ Bild, die Bilder unterscheiden sich in einem Wort
       3  Kleine wichtige Wörter: auf/unter/neben/in, Zahlwörter (zwei bis
          neun) und Lese-Mal-Aufträge („Male den Stern gelb.“)
       4  Mini-Geschichte (drei Sätze) + zwei Fragen
       5  Unsinn-Alarm: „Stimmt das?“ (Ja/Nein) und „Welcher Satz ist Unsinn?“
   - Hilfe-Leiter: 1. Fehler → Erklärung, wo der Unterschied steckt + stilles
     Leselineal, 2. → entscheidende Wörter / Antwortsatz leuchten, eine
     falsche Karte verschwindet, 3. → Flo liest vor und zeigt die Lösung.
   - Lerninhalte (ctx.item): Wort ('Maus'), Satz ('Der Hund schläft.'),
     'Katze unter dem Tisch', 'Vier Enten', 'Stern gelb', Geschichte ('Bello'),
     Unsinn-Satz.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* ======================================================================
     Inhalte
     ====================================================================== */

  /* ---------- Stufe 1: Gruppen ähnlicher Wörter [Wort, Emoji, Artikel] ---------- */
  const GROUPS = [
    [['Maus', '🐭', 'die'], ['Haus', '🏠', 'das'], ['Mais', '🌽', 'der']],
    [['Hose', '👖', 'die'], ['Rose', '🌹', 'die'], ['Dose', '🥫', 'die']],
    [['Nase', '👃', 'die'], ['Hase', '🐰', 'der'], ['Vase', '🏺', 'die']],
    [['Tasche', '👜', 'die'], ['Flasche', '🍾', 'die'], ['Tasse', '☕', 'die']],
    [['Hund', '🐶', 'der'], ['Mund', '👄', 'der'], ['Mond', '🌙', 'der']],
    [['Eis', '🍦', 'das'], ['Reis', '🍚', 'der'], ['Kreis', '⭕', 'der']],
    [['Biene', '🐝', 'die'], ['Birne', '🍐', 'die'], ['Bein', '🦵', 'das']],
    [['Raupe', '🐛', 'die'], ['Traube', '🍇', 'die'], ['Taube', '🕊️', 'die']],
    [['Kuh', '🐄', 'die'], ['Schuh', '👟', 'der'], ['Kuchen', '🍰', 'der']],
    [['Kind', '🧒', 'das'], ['Rind', '🐂', 'das'], ['Wind', '🌬️', 'der']],
    [['Brot', '🍞', 'das'], ['Boot', '⛵', 'das'], ['Brille', '👓', 'die']],
    [['Schaf', '🐑', 'das'], ['Schal', '🧣', 'der'], ['Schiff', '🚢', 'das']],
    [['Fisch', '🐟', 'der'], ['Frosch', '🐸', 'der'], ['Flasche', '🍾', 'die']],
    [['Bus', '🚌', 'der'], ['Buch', '📖', 'das'], ['Burg', '🏰', 'die']],
    [['Kuchen', '🍰', 'der'], ['Küken', '🐥', 'das'], ['Küche', '🍳', 'die']],
  ];
  const WORDS = [];
  GROUPS.forEach((g, gi) => g.forEach(([w, e, a]) => {
    if (!WORDS.find((x) => x.w === w)) WORDS.push({ w, e, a, groups: [] });
    WORDS.find((x) => x.w === w).groups.push(gi);
  }));
  const wordObj = (w) => WORDS.find((x) => x.w === w);

  /* ---------- Stufe 2: Satz-Gruppen mit genau einem entscheidenden Unterschied ---------- */
  const SETS = [
    [['Der Junge fährt Fahrrad.', ['👦', '🚲']], ['Der Junge fährt Roller.', ['👦', '🛴']], ['Das Mädchen fährt Fahrrad.', ['👧', '🚲']]],
    [['Mama trinkt Tee.', ['👩', '🍵']], ['Mama trinkt Saft.', ['👩', '🧃']], ['Papa trinkt Tee.', ['👨', '🍵']]],
    [['Der Bär isst Honig.', ['🐻', '🍯']], ['Der Bär isst Fisch.', ['🐻', '🐟']], ['Der Affe isst Honig.', ['🐒', '🍯']]],
    [['Oma liest ein Buch.', ['👵', '📖']], ['Oma strickt einen Schal.', ['👵', '🧶']], ['Opa liest ein Buch.', ['👴', '📖']]],
    [['Das Baby weint.', ['👶', '😢']], ['Das Baby lacht.', ['👶', '😄']], ['Das Baby schläft.', ['👶', '💤']]],
    [['Der Frosch springt ins Wasser.', ['🐸', '💦']], ['Der Frosch sitzt im Gras.', ['🐸', '🌿']], ['Die Ente springt ins Wasser.', ['🦆', '💦']]],
    [['Lea malt eine Sonne.', ['👧', '🖍️', '☀️']], ['Lea malt ein Haus.', ['👧', '🖍️', '🏠']], ['Lea malt eine Blume.', ['👧', '🖍️', '🌸']]],
    [['Tim baut einen Schneemann.', ['👦', '⛄']], ['Tim baut eine Burg.', ['👦', '🏰']], ['Tim baut eine Rakete.', ['👦', '🚀']]],
    [['Die Katze trinkt Milch.', ['🐱', '🥛']], ['Die Katze jagt eine Maus.', ['🐱', '🐭']], ['Der Hund trinkt Milch.', ['🐶', '🥛']]],
    [['Der Vogel fliegt hoch.', ['🐦', '☁️']], ['Der Vogel singt ein Lied.', ['🐦', '🎵']], ['Das Flugzeug fliegt hoch.', ['✈️', '☁️']]],
    [['Draußen regnet es.', ['🌧️']], ['Draußen schneit es.', ['🌨️']], ['Draußen blitzt es.', ['🌩️']]],
    [['Der Hund spielt mit dem Ball.', ['🐶', '⚽']], ['Der Hund spielt mit der Katze.', ['🐶', '🐱']], ['Das Kind spielt mit dem Ball.', ['🧒', '⚽']]],
    [['Papa kocht Suppe.', ['👨', '🍲']], ['Papa kocht Nudeln.', ['👨', '🍝']], ['Papa isst Suppe.', ['👨', '🥄', '🍲']]],
    [['Der Igel sucht Äpfel.', ['🦔', '🍎']], ['Der Igel sucht Pilze.', ['🦔', '🍄']], ['Das Eichhörnchen sucht Pilze.', ['🐿️', '🍄']]],
  ];
  const SENTS = [];
  SETS.forEach((set, si) => set.forEach(([t, scene]) => SENTS.push({ t, scene, si, words: splitWords(t) })));

  /* ---------- Stufe 3a: Präpositionen ---------- */
  const ANIMALS = [
    { n: 'Katze', art: 'Die', e: '🐱' },
    { n: 'Hund', art: 'Der', e: '🐶' },
    { n: 'Maus', art: 'Die', e: '🐭' },
    { n: 'Hase', art: 'Der', e: '🐰' },
    { n: 'Ente', art: 'Die', e: '🦆' },
  ];
  const PLACES = {
    tisch: { name: 'dem Tisch', preps: ['auf', 'unter', 'neben'] },
    kiste: { name: 'der Kiste', preps: ['in', 'auf', 'neben'] },
  };
  const PREPS = [];
  ANIMALS.forEach((a) => Object.keys(PLACES).forEach((p) => PLACES[p].preps.forEach((pr) => {
    PREPS.push({ a, place: p, prep: pr, k: `${a.n} ${pr} ${PLACES[p].name}`, t: `${a.art} ${a.n} sitzt ${pr} ${PLACES[p].name}.` });
  })));

  /* ---------- Stufe 3b: Zahlwörter ---------- */
  const THINGS = [
    { pl: 'Enten', e: '🦆', v: 'schwimmen' },
    { pl: 'Äpfel', e: '🍎', v: 'liegen da' },
    { pl: 'Fische', e: '🐟', v: 'schwimmen' },
    { pl: 'Sterne', e: '⭐', v: 'leuchten' },
    { pl: 'Bienen', e: '🐝', v: 'fliegen' },
    { pl: 'Blumen', e: '🌸', v: 'blühen' },
    { pl: 'Ballons', e: '🎈', v: 'fliegen' },
  ];
  const COUNTS = [];
  THINGS.forEach((th) => { for (let n = 2; n <= 9; n++) COUNTS.push({ th, n, k: `${U.cap(U.numberWord(n))} ${th.pl}`, t: `${U.cap(U.numberWord(n))} ${th.pl} ${th.v}.` }); });

  /* ---------- Stufe 3c: Lese-Mal-Auftrag ---------- */
  const COLORS = [
    { w: 'rot', c: '#e63946' },
    { w: 'blau', c: '#2f74d8' },
    { w: 'gelb', c: '#ffd02b' },
    { w: 'grün', c: '#2bb34b' },
  ];
  const SHAPES = [
    { n: 'Ball', acc: 'den Ball', id: 'ball' },
    { n: 'Stern', acc: 'den Stern', id: 'stern' },
    { n: 'Herz', acc: 'das Herz', id: 'herz' },
    { n: 'Fisch', acc: 'den Fisch', id: 'fisch' },
    { n: 'Haus', acc: 'das Haus', id: 'haus' },
    { n: 'Blume', acc: 'die Blume', id: 'blume' },
  ];
  const PAINTS = [];
  SHAPES.forEach((s) => COLORS.forEach((c) => PAINTS.push({ s, c, k: `${s.n} ${c.w}` })));

  /* ---------- Stufe 4: Mini-Geschichten (drei Sätze, zwei Fragen) ----------
     a: Antworten. t = Wort (wird gelesen, nicht vorgesprochen) oder e = Bild (+ say).
     ok = richtig, why = Erklärung zur falschen Wahl (verrät die Lösung nicht).
     s = Index des Satzes, in dem die Antwort steht. x = Zusatz-Ablenker (Knobel). */
  const STORIES = [
    {
      k: 'Bello',
      s: ['Tom hat einen Hund.', 'Der Hund heißt Bello.', 'Bello spielt gern mit dem Ball.'],
      q: [
        { q: 'Wie heißt der Hund?', s: 1, a: [{ t: 'Bello', ok: true }, { t: 'Tom', why: 'Tom ist der Junge. Wie heißt der Hund?' }, { t: 'Bella', why: 'Schau genau auf den letzten Buchstaben.' }], x: { t: 'Ball', why: 'Mit dem Ball spielt der Hund. Aber wie heißt er?' } },
        { q: 'Womit spielt der Hund gern?', s: 2, a: [{ e: '⚽', say: 'Ball', ok: true }, { e: '🦴', say: 'Knochen', why: 'Ein Knochen steht nicht in der Geschichte.' }, { e: '🧸', say: 'Teddy', why: 'Ein Teddy steht nicht in der Geschichte.' }], x: { e: '🪀', say: 'Jojo', why: 'Ein Jo-Jo steht nicht in der Geschichte.' } },
      ],
    },
    {
      k: 'Mia im Garten',
      s: ['Mia ist im Garten.', 'Sie pflückt drei rote Blumen.', 'Die Blumen schenkt sie Oma.'],
      q: [
        { q: 'Wie viele Blumen pflückt Mia?', s: 1, a: [{ t: 'drei', ok: true }, { t: 'zwei', why: 'Lies das Zahlwort im zweiten Satz genau.' }, { t: 'vier', why: 'Lies das Zahlwort im zweiten Satz genau.' }], x: { t: 'neun', why: 'Lies das Zahlwort im zweiten Satz genau.' } },
        { q: 'Wer bekommt die Blumen?', s: 2, a: [{ e: '👵', say: 'Oma', ok: true }, { e: '👴', say: 'Opa', why: 'Opa steht nicht in der Geschichte.' }, { e: '👩', say: 'Mama', why: 'Mama steht nicht in der Geschichte.' }], x: { e: '👧', say: 'Mia', why: 'Mia pflückt die Blumen. Wem schenkt sie die Blumen?' } },
      ],
    },
    {
      k: 'Der Igel',
      s: ['Im Wald lebt ein Igel.', 'Am Tag schläft er unter dem Laub.', 'In der Nacht sucht er Käfer.'],
      q: [
        { q: 'Wo schläft der Igel?', s: 1, a: [{ e: '🍂', say: 'Laub', ok: true }, { e: '🛏️', say: 'Bett', why: 'Ein Igel schläft nicht im Bett. Lies den zweiten Satz.' }, { e: '🌳', say: 'Baum', why: 'Der Igel lebt im Wald. Aber wo schläft er?' }], x: { e: '🏠', say: 'Haus', why: 'Ein Haus steht nicht in der Geschichte.' } },
        { q: 'Was sucht der Igel in der Nacht?', s: 2, a: [{ e: '🪲', say: 'Käfer', ok: true }, { e: '🍎', say: 'Apfel', why: 'Ein Apfel steht nicht in der Geschichte.' }, { e: '🧀', say: 'Käse', why: 'Käse fängt auch mit K an. Lies das Wort ganz bis zum Ende.' }], x: { e: '🍄', say: 'Pilz', why: 'Ein Pilz steht nicht in der Geschichte.' } },
      ],
    },
    {
      k: 'Ben backt',
      s: ['Ben und Papa backen einen Kuchen.', 'Der Kuchen ist rund und braun.', 'Ben darf den Teig rühren.'],
      q: [
        { q: 'Was backen Ben und Papa?', s: 0, a: [{ e: '🎂', say: 'Kuchen', ok: true }, { e: '🍞', say: 'Brot', why: 'Brot steht nicht in der Geschichte.' }, { e: '🍪', say: 'Kekse', why: 'Kekse stehen nicht in der Geschichte.' }], x: { e: '🍕', say: 'Pizza', why: 'Pizza steht nicht in der Geschichte.' } },
        { q: 'Was darf Ben machen?', s: 2, a: [{ t: 'rühren', ok: true }, { t: 'essen', why: 'Lies den letzten Satz. Was darf Ben?' }, { t: 'backen', why: 'Backen tun beide. Was darf Ben alleine?' }], x: { t: 'rufen', why: 'Rufen fängt auch mit R an. Lies das Wort bis zum Ende.' } },
      ],
    },
    {
      k: 'Lotta',
      s: ['Lotta hat eine Katze.', 'Die Katze ist schwarz.', 'Sie schläft gern auf dem Sofa.'],
      q: [
        { q: 'Welche Farbe hat die Katze?', s: 1, a: [{ t: 'schwarz', ok: true }, { t: 'weiß', why: 'Lies den zweiten Satz genau.' }, { t: 'braun', why: 'Lies den zweiten Satz genau.' }], x: { t: 'rot', why: 'Rote Katzen gibt es nicht. Lies den zweiten Satz.' } },
        { q: 'Wo schläft die Katze gern?', s: 2, a: [{ e: '🛋️', say: 'Sofa', ok: true }, { e: '🛏️', say: 'Bett', why: 'Ein Bett steht nicht in der Geschichte.' }, { e: '📦', say: 'Kiste', why: 'Eine Kiste steht nicht in der Geschichte.' }], x: { e: '🧺', say: 'Korb', why: 'Ein Korb steht nicht in der Geschichte.' } },
      ],
    },
    {
      k: 'Am See',
      s: ['Heute ist es heiß.', 'Emil fährt mit Mama an den See.', 'Dort baden sie und essen ein Eis.'],
      q: [
        { q: 'Wie ist das Wetter?', s: 0, a: [{ e: '☀️', say: 'heiß und sonnig', ok: true }, { e: '🌧️', say: 'Regen', why: 'Lies den ersten Satz noch einmal.' }, { e: '❄️', say: 'Schnee', why: 'Im Schnee baden wir nicht im See. Lies den ersten Satz.' }], x: { e: '🌬️', say: 'Wind', why: 'Lies den ersten Satz noch einmal.' } },
        { q: 'Was essen Emil und Mama?', s: 2, a: [{ e: '🍦', say: 'Eis', ok: true }, { e: '🍉', say: 'Melone', why: 'Eine Melone steht nicht in der Geschichte.' }, { e: '🥨', say: 'Brezel', why: 'Eine Brezel steht nicht in der Geschichte.' }], x: { e: '🍟', say: 'Pommes', why: 'Pommes stehen nicht in der Geschichte.' } },
      ],
    },
    {
      k: 'Der Drache',
      s: ['Paul hat einen Drachen.', 'Der Drachen ist gelb und hat einen langen Schwanz.', 'Im Herbst lässt Paul ihn steigen.'],
      q: [
        { q: 'Welche Farbe hat der Drachen?', s: 1, a: [{ t: 'gelb', ok: true }, { t: 'grün', why: 'Grün fängt auch mit G an. Lies das Wort bis zum Ende.' }, { t: 'blau', why: 'Lies den zweiten Satz genau.' }], x: { t: 'rot', why: 'Lies den zweiten Satz genau.' } },
        { q: 'Wann lässt Paul den Drachen steigen?', s: 2, a: [{ t: 'im Herbst', ok: true }, { t: 'im Winter', why: 'Lies den letzten Satz genau.' }, { t: 'im Sommer', why: 'Lies den letzten Satz genau.' }], x: { t: 'in der Nacht', why: 'Lies den letzten Satz genau.' } },
      ],
    },
    {
      k: 'Fips',
      s: ['Fips ist ein kleiner Vogel.', 'Er wohnt in einem Nest auf dem Baum.', 'Am Morgen singt er ein Lied.'],
      q: [
        { q: 'Wer ist Fips?', s: 0, a: [{ e: '🐦', say: 'ein Vogel', ok: true }, { e: '🐭', say: 'eine Maus', why: 'Lies den ersten Satz noch einmal.' }, { e: '🐿️', say: 'ein Eichhörnchen', why: 'Ein Eichhörnchen wohnt auch auf dem Baum. Aber lies den ersten Satz.' }], x: { e: '🐱', say: 'eine Katze', why: 'Lies den ersten Satz noch einmal.' } },
        { q: 'Wann singt Fips?', s: 2, a: [{ t: 'am Morgen', ok: true }, { t: 'am Abend', why: 'Lies den letzten Satz genau.' }, { t: 'in der Nacht', why: 'Lies den letzten Satz genau.' }], x: { t: 'am Mittag', why: 'Lies den letzten Satz genau.' } },
      ],
    },
    {
      k: 'Schultag',
      s: ['Nina geht in die Schule.', 'In ihrer Tasche sind zwei Hefte und ein Buch.', 'Ihr Stift ist grün.'],
      q: [
        { q: 'Wie viele Hefte hat Nina?', s: 1, a: [{ t: 'zwei', ok: true }, { t: 'eins', why: 'Ein Buch hat sie. Wie viele Hefte?' }, { t: 'drei', why: 'Lies das Zahlwort im zweiten Satz genau.' }], x: { t: 'zehn', why: 'Zehn fängt auch mit Z an. Lies das Wort bis zum Ende.' } },
        { q: 'Welche Farbe hat der Stift?', s: 2, a: [{ t: 'grün', ok: true }, { t: 'gelb', why: 'Gelb fängt auch mit G an. Lies das Wort bis zum Ende.' }, { t: 'rot', why: 'Lies den letzten Satz genau.' }], x: { t: 'blau', why: 'Lies den letzten Satz genau.' } },
      ],
    },
    {
      k: 'Schnee',
      s: ['Es ist Winter.', 'Lukas und Ali bauen einen Schneemann.', 'Er bekommt eine Möhre als Nase.'],
      q: [
        { q: 'Was bauen die Kinder?', s: 1, a: [{ e: '⛄', say: 'Schneemann', ok: true }, { e: '🏰', say: 'Burg', why: 'Eine Burg steht nicht in der Geschichte.' }, { e: '🛷', say: 'Schlitten', why: 'Ein Schlitten steht nicht in der Geschichte.' }], x: { e: '🏠', say: 'Haus', why: 'Ein Haus steht nicht in der Geschichte.' } },
        { q: 'Was ist die Nase?', s: 2, a: [{ e: '🥕', say: 'Möhre', ok: true }, { e: '🍌', say: 'Banane', why: 'Eine Banane steht nicht in der Geschichte.' }, { e: '🪨', say: 'Stein', why: 'Ein Stein steht nicht in der Geschichte.' }], x: { e: '🍎', say: 'Apfel', why: 'Ein Apfel steht nicht in der Geschichte.' } },
      ],
    },
  ];

  /* ---------- Stufe 5: Sinn und Unsinn ----------
     t = Satz, key = entscheidendes Wort (leuchtet als Denkanstoß), fix = Merksatz. */
  const NONSENSE = [
    { t: 'Die Kuh legt ein Ei.', key: 'Ei', fix: 'Eine Kuh gibt Milch. Eier legen Hühner.' },
    { t: 'Der Fisch klettert auf den Baum.', key: 'klettert', fix: 'Ein Fisch schwimmt im Wasser.' },
    { t: 'Im Winter ist der Schnee heiß.', key: 'heiß', fix: 'Schnee ist kalt.' },
    { t: 'Die Banane ist blau.', key: 'blau', fix: 'Eine Banane ist gelb.' },
    { t: 'Mit der Gabel trinke ich Saft.', key: 'Gabel', fix: 'Saft trinke ich aus einem Glas.' },
    { t: 'Der Hund hat zwei Beine.', key: 'zwei', fix: 'Ein Hund hat vier Beine.' },
    { t: 'In der Nacht scheint die Sonne.', key: 'Sonne', fix: 'In der Nacht scheint der Mond.' },
    { t: 'Das Auto fliegt über die Wolken.', key: 'fliegt', fix: 'Ein Auto fährt auf der Straße.' },
    { t: 'Die Katze bellt laut.', key: 'bellt', fix: 'Eine Katze miaut. Ein Hund bellt.' },
    { t: 'Ich schlafe in der Badewanne.', key: 'Badewanne', fix: 'Ich schlafe im Bett.' },
    { t: 'Im Sommer bauen wir einen Schneemann.', key: 'Sommer', fix: 'Einen Schneemann bauen wir im Winter.' },
    { t: 'Der Elefant ist kleiner als eine Maus.', key: 'kleiner', fix: 'Ein Elefant ist viel größer als eine Maus.' },
    { t: 'Ich putze mir mit dem Kamm die Zähne.', key: 'Kamm', fix: 'Zähne putze ich mit der Zahnbürste.' },
    { t: 'Der Apfel wächst unter der Erde.', key: 'unter', fix: 'Ein Apfel wächst am Baum.' },
  ];
  const SENSE = [
    { t: 'Der Igel hat viele Stacheln.' },
    { t: 'Im Winter kann es schneien.' },
    { t: 'Eine Spinne hat acht Beine.' },
    { t: 'Die Ente schwimmt auf dem See.' },
    { t: 'Mit der Schere kann man schneiden.' },
    { t: 'Ein Hund kann bellen.' },
    { t: 'In der Nacht ist es dunkel.' },
    { t: 'Das Gras auf der Wiese ist grün.' },
    { t: 'Ein Vogel hat zwei Flügel.' },
    { t: 'Kinder gehen in die Schule.' },
    { t: 'Im Herbst fallen die Blätter vom Baum.' },
    { t: 'Ein Fahrrad hat zwei Räder.' },
    { t: 'Eis schmilzt in der Sonne.' },
    { t: 'Die Feuerwehr löscht das Feuer.' },
  ];

  /* ======================================================================
     Ablauf-Texte
     ====================================================================== */
  const KIND = (l) => (l <= 3 ? 'pic' : l === 4 ? 'text' : 'sense');
  const lvOf = (ctx) => (KIND(ctx.taskLevel) === KIND(ctx.level) ? ctx.taskLevel : ctx.level);

  const INTRO = {
    1: 'Lesedetektive lesen ganz genau. Die Wörter sehen sich sehr ähnlich! Lies jeden Buchstaben bis zum Ende.',
    2: 'Jetzt liest du ganze Sätze. Die Bilder sind fast gleich. Lies Wort für Wort, bis zum Punkt!',
    3: 'Jetzt kommen kleine Wörter, die ganz wichtig sind: auf, unter, neben. Und Zahlwörter. Manchmal bekommst du auch einen Malauftrag.',
    4: 'Jetzt liest du eine kleine Geschichte. Danach stelle ich dir zwei Fragen. Du darfst immer wieder in die Geschichte schauen.',
    5: 'Achtung, Alarm! Hier gibt es Unsinn. Manche Sätze können gar nicht stimmen. Lies genau und stell dir alles im Kopf vor.',
  };
  const HELP_INFO = 'Wenn du nicht weiterkommst, tippe auf den Lautsprecher an der Karte. Dann lese ich dir vor.';
  let introduced = new Set();
  let l3off = 0;

  /* ======================================================================
     Helfer
     ====================================================================== */
  function splitWords(t) { return t.replace(/[.!?]$/, '').split(' '); }
  const clean = (w) => w.replace(/[.,!?]/g, '');
  const vary = (key, list) => U.pickFresh('les-' + key, list, Math.min(2, list.length - 1));
  const proc = (ctx, normal, process) => (ctx.wrongCount === 0 && !ctx._lesHelped && U.chance(0.3) ? process : normal);
  const ORD = ['ersten', 'zweiten', 'dritten'];

  /** Hilfe genutzt (Vorlesen): zählt wie ein Hinweis, aber ohne Fehler-Ton. */
  function countHelp(ctx) {
    if (ctx._lesHelped) return;
    ctx._lesHelped = true;
    const was = LT.sfx.enabled;
    LT.sfx.enabled = false;
    try { ctx.wrong(null, { say: '' }); } finally { LT.sfx.enabled = was; }
  }

  /** Text als Wort-Spans (jedes Wort antippbar: leuchtet still auf – die Lupe). */
  function textNode(ctx, text, cls, tap = true) {
    const box = el('div', { class: 'les-text' + (cls ? ' ' + cls : '') });
    box._words = [];
    text.split(' ').forEach((w, i) => {
      if (i) box.appendChild(document.createTextNode(' '));
      const sp = el('span.les-w', w);
      sp._w = clean(w);
      if (tap) {
        sp.addEventListener('click', (e) => {
          e.stopPropagation();
          sp.classList.add('les-lit');
          ctx.timeout(() => sp.classList.remove('les-lit'), 700);
        });
      }
      box._words.push(sp);
      box.appendChild(sp);
    });
    return box;
  }

  /** Leselineal: Wörter (oder Buchstaben) leuchten still nacheinander auf. */
  async function sweep(ctx, nodes, ms = 520) {
    for (const n of nodes) {
      if (!ctx.active) return;
      n.classList.add('les-lit');
      await ctx.sleep(ms);
      n.classList.remove('les-lit');
    }
  }

  /** Vorlesen mit Lupe: Die Karte leuchtet, Flo liest. */
  async function readAloud(ctx, card, text) {
    card.classList.add('les-reading');
    await ctx.say(text, { rate: 0.85 });
    card.classList.remove('les-reading');
  }

  /** Lesekarte mit Lupe-Symbol und 🔊-Hilfe-Knopf (zählt als Hinweis). */
  function readCard(ctx, content, getText, cls) {
    const help = el('button.les-help', { type: 'button', 'aria-label': 'Vorlesen (Hilfe)', title: 'Vorlesen (Hilfe)' }, U.emoji('🔊'));
    const card = el('div', { class: 'prompt-box les-card' + (cls ? ' ' + cls : '') }, el('span.les-lupe', { 'aria-hidden': 'true' }, '🔍'), content, help);
    let busy = false;
    help.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (busy || !ctx.active) return;
      busy = true;
      LT.sfx.play('click');
      countHelp(ctx);
      help.classList.add('les-used');
      await readAloud(ctx, card, getText());
      busy = false;
    });
    return card;
  }

  /** Emoji-Szene: Hauptfigur groß, Rest kleiner. */
  function emojiScene(list) {
    return el('span.les-scene', { 'aria-hidden': 'true' }, ...list.map((e, i) => U.emoji(e, i === 0 ? 'les-sc-main' : 'les-sc-sub')));
  }

  /* ---------- SVG-Zeichnungen ---------- */
  const TISCH = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="4" y="44" width="64" height="8" rx="3" fill="#b07a4a" stroke="#7a4e2a" stroke-width="1.5"/><rect x="9" y="52" width="6" height="40" rx="2" fill="#9a6538"/><rect x="57" y="52" width="6" height="40" rx="2" fill="#9a6538"/><rect x="0" y="92" width="100" height="3" rx="1.5" fill="#d9d2c3"/></svg>';
  const KISTE_BACK = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M8 52 L16 46 L68 46 L60 52 Z" fill="#8a5a2b"/><rect x="0" y="92" width="100" height="3" rx="1.5" fill="#d9d2c3"/></svg>';
  const KISTE_FRONT = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="8" y="52" width="52" height="40" rx="2" fill="#d39b5b" stroke="#8a5a2b" stroke-width="1.5"/><line x1="8" y1="65" x2="60" y2="65" stroke="#a8743d" stroke-width="1.5"/><line x1="8" y1="78" x2="60" y2="78" stroke="#a8743d" stroke-width="1.5"/><path d="M60 52 L68 46 L68 86 L60 92 Z" fill="#b8814a" stroke="#8a5a2b" stroke-width="1.5"/></svg>';

  function prepScene(item) {
    const box = el('span', { class: `les-pscene les-${item.place} les-p-${item.prep}`, 'aria-hidden': 'true' });
    if (item.place === 'tisch') {
      box.appendChild(el('span.les-obj', { html: TISCH }));
      box.appendChild(U.emoji(item.a.e, 'les-animal'));
    } else {
      box.appendChild(el('span.les-obj', { html: KISTE_BACK }));
      box.appendChild(U.emoji(item.a.e, 'les-animal'));
      box.appendChild(el('span.les-obj.les-front', { html: KISTE_FRONT }));
    }
    return box;
  }

  function countScene(item) {
    const g = el('span', { class: 'les-count les-n' + item.n, 'aria-hidden': 'true' });
    for (let i = 0; i < item.n; i++) g.appendChild(U.emoji(item.th.e));
    return g;
  }

  function shapeSVG(id) {
    const st = 'stroke="#2b2d42" stroke-width="3.5" stroke-linejoin="round"';
    switch (id) {
      case 'ball': return `<svg viewBox="0 0 100 100"><circle class="les-fill" cx="50" cy="50" r="40" ${st}/><path d="M14 40 Q50 58 86 40 M14 60 Q50 78 86 60" fill="none" stroke="#2b2d42" stroke-width="2.5" opacity=".55"/></svg>`;
      case 'stern': return `<svg viewBox="0 0 100 100"><path class="les-fill" d="M50 6 L62 37 L95 38 L69 58 L78 91 L50 72 L22 91 L31 58 L5 38 L38 37 Z" ${st}/></svg>`;
      case 'herz': return `<svg viewBox="0 0 100 100"><path class="les-fill" d="M50 88 C20 66 6 50 6 32 C6 18 17 9 30 9 C40 9 46 15 50 23 C54 15 60 9 70 9 C83 9 94 18 94 32 C94 50 80 66 50 88 Z" ${st}/></svg>`;
      case 'fisch': return `<svg viewBox="0 0 100 100"><path class="les-fill" d="M8 50 C20 26 54 22 74 44 L94 28 L90 50 L94 72 L74 56 C54 78 20 74 8 50 Z" ${st}/><circle cx="26" cy="46" r="4.5" fill="#2b2d42"/></svg>`;
      case 'haus': return `<svg viewBox="0 0 100 100"><path class="les-fill" d="M14 46 L50 12 L86 46 L86 92 L14 92 Z" ${st}/><rect x="40" y="62" width="20" height="30" fill="#fff" ${st}/></svg>`;
      case 'blume': return `<svg viewBox="0 0 100 100"><path d="M50 60 L50 96" stroke="#2bb34b" stroke-width="5"/><g class="les-fill" ${st}><circle cx="50" cy="20" r="14"/><circle cx="76" cy="38" r="14"/><circle cx="66" cy="66" r="14"/><circle cx="34" cy="66" r="14"/><circle cx="24" cy="38" r="14"/></g><circle cx="50" cy="44" r="11" fill="#ffb02e" ${st}/></svg>`;
      default: return '';
    }
  }

  /** Index des ersten Worts, in dem sich zwei Sätze unterscheiden (oder -1). */
  function firstDiff(a, b) {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) if (clean(a[i] || '') !== clean(b[i] || '')) return i;
    return -1;
  }

  /** Entscheidende Wörter: kommen im Zielsatz vor, aber nicht in allen Ablenkern. */
  function keyWords(target, others) {
    return target.filter((w) => others.some((o) => !o.map(clean).includes(clean(w)))).map(clean);
  }

  function glowWords(textBox, words) {
    textBox._words.forEach((sp) => { if (words.includes(sp._w)) sp.classList.add('les-key'); });
  }

  /** Begrüßung je Stufe + einmal der Hinweis auf den Hilfe-Knopf. */
  async function levelIntro(ctx, lv) {
    if (ctx.index === 0) { introduced = new Set(); l3off = U.randInt(0, 2); }
    if (!introduced.has(lv)) {
      introduced.add(lv);
      await ctx.say(INTRO[lv]);
      if (!ctx.active) return;
    }
    if (!introduced.has('help')) {
      introduced.add('help');
      await ctx.say(HELP_INFO);
    }
  }

  /* ======================================================================
     Stufe 1: Wort lesen → Bild wählen (ähnliche Wörter)
     ====================================================================== */
  async function wordTask(ctx) {
    const target = ctx.item(WORDS, (x) => x.w, { avoid: 6 });
    const gi = U.pick(target.groups);
    const sibs = GROUPS[gi].map((x) => wordObj(x[0])).filter((x) => x !== target);
    const opts = [target, ...sibs];
    if (ctx.flow > 0) {
      const extra = U.pick(WORDS.filter((x) => !opts.includes(x) && x.e !== target.e));
      if (extra) opts.push(extra);
    }
    const letters = el('div.les-word', { 'aria-label': 'Lesewort' }, ...Array.from(target.w).map((ch) => el('span.les-ch', ch)));
    const card = readCard(ctx, letters, () => target.w, 'les-wordcard');
    ctx.stage.appendChild(card);
    const chars = Array.from(letters.children);
    letters.addEventListener('click', () => sweep(ctx, chars, 300));

    ctx.instruct(vary('w-instr', ['Lies das Wort. Welches Bild passt?', 'Was steht hier? Tippe auf das passende Bild.', 'Lies genau bis zum Ende. Welches Bild passt?']));
    const items = opts.map((x) => ({ content: x.e, correct: x === target, say: x.w, x }));
    let localWrong = 0;
    await ctx.choices(items, {
      size: 'large',
      nameFirst: true,
      sayButton: true,
      hintAfter: 2,
      praise: false,
      correctSay: () => proc(ctx,
        vary('w-ok', ['Richtig gelesen!', 'Genau, das passt!', 'Super, Detektiv!']),
        vary('w-proc', ['Du hast jeden Buchstaben gelesen, nicht nur den ersten. Klasse!', 'Du hast genau bis zum Ende gelesen. So machen das Detektive!'])),
      explain: (item) => {
        const a = item.x.w;
        if (a[0] !== target.w[0]) {
          if (/^sch/i.test(a)) return `Das Bild heißt ${a}. Der Anfang ist anders. Schau auf den ersten Buchstaben.`;
          return `Das Bild heißt ${a}. ${a} fängt mit ${a[0].toUpperCase()} an. Schau auf den ersten Buchstaben.`;
        }
        return `Das Bild heißt ${a}. Der Anfang stimmt. Lies weiter bis zum Ende!`;
      },
      hintSay: 'Die Lupe hilft dir. Lies jeden Buchstaben, ganz langsam.',
      modelSay: () => `Hier steht ${target.w}. Schau, das passende Bild.`,
      onWrong: async (item, tile) => {
        const n = ++localWrong; // eigene Zählung (Vorlesen zählt in ctx.wrongCount mit)
        if (n === 1) await sweep(ctx, chars, 380);
        else if (n === 2) await sweep(ctx, chars, 520);
      },
    });
    if (!ctx.active) return;
    letters.classList.add('les-done');
    await ctx.sleep(400);
  }

  /* ======================================================================
     Stufe 2 + 3a + 3b: Satz lesen → Bild wählen
     opts: {target, others, scene(item), sentence(item), key, explain(item)}
     ====================================================================== */
  async function sentenceToPicture(ctx, cfg) {
    const { target, others } = cfg;
    const tb = textNode(ctx, target.t, 'les-sent');
    const card = readCard(ctx, tb, () => target.t);
    ctx.stage.appendChild(card);
    const kw = keyWords(splitWords(target.t), others.map((o) => splitWords(o.t)));

    ctx.instruct(cfg.instr || vary('s-instr', ['Lies den Satz. Welches Bild passt?', 'Lies genau bis zum Punkt. Welches Bild passt?', 'Was steht da? Tippe auf das passende Bild.']));
    const items = [target, ...others].map((o) => ({ content: cfg.scene(o), correct: o === target, aria: 'Bild', className: 'les-pictile', o }));
    const ha = items.length <= 3 ? 1 : 2;
    let localWrong = 0;
    await ctx.choices(items, {
      size: 'large',
      className: 'les-pics',
      hintAfter: ha,
      praise: false,
      correctSay: () => proc(ctx,
        vary('s-ok', ['Richtig gelesen!', 'Genau, das passt!', 'Super, Detektiv!']),
        cfg.procSay || vary('s-proc', ['Du hast Wort für Wort gelesen, bis zum Punkt. Klasse!', 'Toll, du hast auch die kleinen Wörter genau gelesen!'])),
      explain: (item) => cfg.explain(item.o),
      hintSay: 'Schau auf die leuchtenden Wörter. Die sind wichtig!',
      modelSay: 'Hier ist das passende Bild.',
      onWrong: async (item, tile) => {
        const n = ++localWrong; // eigene Zählung (Vorlesen zählt in ctx.wrongCount mit)
        if (n === 1 && ha > 1) await sweep(ctx, tb._words);
        if (n === ha) glowWords(tb, kw);
        if (n > ha) await readAloud(ctx, card, target.t);
      },
    });
    if (!ctx.active) return;
    glowWords(tb, kw);
    await ctx.sleep(500);
  }

  /** Erklärung für Satz-Bild: Wo steckt der Unterschied? (ohne Lösung) */
  function diffExplain(target, wrong) {
    const i = firstDiff(splitWords(target.t), splitWords(wrong.t));
    if (i <= 1) return 'Schau genau, wer im Satz etwas macht. Lies den Anfang noch einmal.';
    return 'Der Anfang stimmt. Aber lies weiter, bis zum Punkt!';
  }

  async function sentTask(ctx) {
    const target = ctx.item(SENTS, (s) => s.t, { avoid: 8 });
    const others = SENTS.filter((s) => s.si === target.si && s !== target);
    if (ctx.flow > 0) {
      const extra = U.pick(SENTS.filter((s) => s.si !== target.si));
      if (extra) others.push(extra);
    }
    await sentenceToPicture(ctx, {
      target, others,
      scene: (o) => emojiScene(o.scene),
      explain: (o) => diffExplain(target, o),
    });
  }

  async function prepTask(ctx) {
    const target = ctx.item(PREPS, (p) => p.k, { avoid: 6 });
    const others = PREPS.filter((p) => p.a === target.a && p.place === target.place && p !== target);
    if (ctx.flow > 0) {
      const extra = U.pick(PREPS.filter((p) => p.a !== target.a && p.place === target.place && p.prep === target.prep));
      if (extra) others.push(extra);
    }
    await sentenceToPicture(ctx, {
      target, others,
      scene: prepScene,
      procSay: 'Super, du hast auch das kleine Wort genau gelesen!',
      explain: (o) => (o.a !== target.a
        ? 'Der Ort stimmt. Aber welches Tier ist es? Lies den Anfang genau.'
        : `${target.a.art} ${target.a.n} stimmt. Aber wo sitzt ${target.a.art === 'Der' ? 'er' : 'sie'}? Lies das kleine Wort genau.`),
    });
  }

  async function countTask(ctx) {
    const lo = ctx.flow < 0 ? 2 : 3;
    const hi = ctx.flow < 0 ? 5 : 9;
    const pool = COUNTS.filter((c) => c.n >= lo && c.n <= hi);
    const target = ctx.item(pool, (c) => c.k, { avoid: 6 });
    const ns = U.shuffle([target.n - 1, target.n + 1, target.n + 2, target.n - 2].filter((n) => n >= 2 && n <= 9));
    const others = ns.slice(0, 2).map((n) => COUNTS.find((c) => c.th === target.th && c.n === n));
    if (ctx.flow > 0) {
      const extra = U.pick(COUNTS.filter((c) => c.n === target.n && c.th !== target.th));
      if (extra) others.push(extra);
    }
    await sentenceToPicture(ctx, {
      target, others,
      scene: countScene,
      procSay: 'Toll, du hast das Zahlwort gelesen und genau gezählt!',
      explain: (o) => (o.th !== target.th
        ? 'Die Zahl stimmt. Aber was ist auf dem Bild? Lies weiter.'
        : `Auf diesem Bild sind ${U.numberWord(o.n)} ${o.th.pl}. Lies das Zahlwort am Anfang genau.`),
    });
  }

  /* ======================================================================
     Stufe 3c: Lese-Mal-Auftrag (eigene Bedienung: Stift wählen, Bild antippen)
     ====================================================================== */
  async function paintTask(ctx) {
    const first = ctx.item(PAINTS, (p) => p.k, { avoid: 6 });
    const parts = [first];
    if (ctx.flow > 0) {
      const second = U.pick(PAINTS.filter((p) => p.s !== first.s && p.c !== first.c));
      parts.push(second);
    }
    const text = parts.length === 1
      ? `Male ${first.s.acc} ${first.c.w}.`
      : `Male ${first.s.acc} ${first.c.w} und ${parts[1].s.acc} ${parts[1].c.w}.`;
    const nShapes = parts.length === 1 ? (ctx.flow < 0 ? 3 : 4) : 4;
    const shapeList = U.shuffle([...parts.map((p) => p.s), ...U.sample(SHAPES.filter((s) => !parts.some((p) => p.s === s)), nShapes - parts.length)]);

    ctx.stage.classList.add('les-paintstage');
    const tb = textNode(ctx, text, 'les-sent');
    const card = readCard(ctx, tb, () => text);
    ctx.stage.appendChild(card);

    const shapeBtns = shapeList.map((s) => {
      const b = el('button.les-shape', { type: 'button', 'aria-label': s.n, html: shapeSVG(s.id) });
      b._s = s;
      return b;
    });
    const crayons = COLORS.map((c) => {
      const b = el('button.les-crayon', { type: 'button', 'aria-label': 'Farbe ' + c.w, style: { '--c': c.c } }, el('span.les-tip'), el('span.les-cname', c.w));
      b._c = c;
      return b;
    });
    ctx.stage.appendChild(el('div.les-shapes', ...shapeBtns));
    ctx.stage.appendChild(el('div.les-crayons', ...crayons));

    const kw = [];
    parts.forEach((p) => { kw.push(clean(p.s.acc.split(' ')[1]), p.c.w); });
    let sel = null;
    let busy = false;
    const done = new Set();
    let resolveTask;
    const finished = new Promise((r) => { resolveTask = r; });

    const fill = (b, color) => { b.querySelectorAll('.les-fill').forEach((f) => f.setAttribute('fill', color || '#fff')); };
    shapeBtns.forEach((b) => fill(b, null));

    function choose(c) {
      if (busy) return;
      sel = c;
      LT.sfx.play('click');
      crayons.forEach((x) => x.classList.toggle('les-sel', x._c === c));
    }

    async function paint(b) {
      if (busy || !ctx.active || done.has(b)) return;
      if (!sel) {
        LT.ui.animate(crayons[0].parentNode, 'shake');
        await ctx.say('Nimm zuerst eine Farbe.');
        return;
      }
      busy = true;
      fill(b, sel.c);
      const part = parts.find((p) => p.s === b._s && !done.has(b));
      if (part && part.c === sel) {
        done.add(b);
        b.classList.add('les-ok');
        crayons.forEach((x) => ctx.unhint(x));
        shapeBtns.forEach((x) => ctx.unhint(x));
        if (done.size === parts.length) {
          await ctx.correct(b, {
            say: proc(ctx, vary('p-ok', ['Super gemalt!', 'Genau so steht es da!', 'Toll, Auftrag erledigt!']),
              'Du hast den Auftrag ganz genau gelesen, wie ein echter Detektiv!'),
          });
          resolveTask();
          return;
        }
        LT.sfx.play('pop');
        LT.ui.animate(b, 'joy');
        await ctx.say('Genau! Lies weiter, da steht noch mehr.');
        busy = false;
        return;
      }
      // Fehler: erklären, was nicht passt (ohne die Lösung zu sagen)
      const nom = b._s.acc.replace(/^den /, 'der ');
      const say = !part
        ? `Das ist ${nom}. Lies noch einmal: Was sollst du malen?`
        : `${U.cap(nom)} ist richtig. Aber welche Farbe? ${parts.length > 1 ? 'Lies genau, was dahinter steht.' : 'Lies das letzte Wort genau.'}`;
      await ctx.wrong(b, { keep: true, say });
      if (!ctx.active) return;
      await ctx.sleep(300);
      fill(b, null);
      const step = ctx.helpStep;
      if (step === 1) await sweep(ctx, tb._words);
      else if (step === 2) {
        glowWords(tb, kw);
        await ctx.say('Schau auf die leuchtenden Wörter: Was sollst du malen, und mit welcher Farbe?');
      } else if (step >= 3) {
        ctx.modelShown = true;
        glowWords(tb, kw);
        await readAloud(ctx, card, text);
        const next = parts.find((p) => !shapeBtns.some((x) => x._s === p.s && done.has(x)));
        if (next) {
          crayons.forEach((x) => { if (x._c === next.c) ctx.hint(x); });
          shapeBtns.forEach((x) => { if (x._s === next.s) ctx.hint(x); });
          await ctx.say('Schau, nimm diese Farbe und male das leuchtende Bild an.');
        }
      }
      busy = false;
    }

    crayons.forEach((c) => c.addEventListener('click', () => choose(c._c)));
    shapeBtns.forEach((b) => b.addEventListener('click', () => paint(b)));

    ctx.testSolve(async () => {
      for (const p of parts) {
        const b = shapeBtns.find((x) => x._s === p.s);
        if (done.has(b)) continue;
        busy = false;
        choose(p.c);
        await paint(b);
      }
    });

    ctx.instruct(introduced.has('paint-instr')
      ? 'Lies den Malauftrag und male!'
      : 'Lies den Malauftrag. Tippe zuerst auf eine Farbe und dann auf das Bild.');
    introduced.add('paint-instr');
    await finished;
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  /* ======================================================================
     Stufe 4: Mini-Geschichte + zwei Fragen
     ====================================================================== */
  async function storyTask(ctx) {
    const story = ctx.item(STORIES, (s) => s.k, { avoid: 5 });
    ctx.stage.classList.add('les-storystage');
    const lines = story.s.map((t) => {
      const tb = textNode(ctx, t, 'les-line');
      return tb;
    });
    const textBox = el('div.les-story', ...lines);
    const card = readCard(ctx, textBox, () => story.s.join(' '), 'les-storycard');
    ctx.stage.appendChild(card);
    const qBox = el('div.les-q');
    ctx.stage.appendChild(qBox);

    if (!introduced.has('story-instr')) {
      introduced.add('story-instr');
      await ctx.say('Lies die Geschichte ganz in Ruhe. Tippe auf den Haken, wenn du fertig bist.');
    } else {
      await ctx.say(vary('st-instr', ['Lies die Geschichte. Dann tippe auf den Haken.', 'Eine neue Geschichte! Lies sie ganz in Ruhe.']));
    }
    if (!ctx.active) return;
    ctx.setInstruction('Lies die Geschichte. Dann tippe auf den Haken.');
    // „Fertig gelesen“-Knopf – das Kind bestimmt das Lesetempo selbst
    await new Promise((res) => {
      const b = LT.ui.button('Fertig gelesen', () => { LT.sfx.play('click'); b.remove(); res(); }, { icon: '✅', cls: 'btn-primary les-ready' });
      ctx.markTest(b);
      qBox.appendChild(b);
    });
    if (!ctx.active) return;

    for (let qi = 0; qi < story.q.length; qi++) {
      const q = story.q[qi];
      U.clear(qBox);
      lines.forEach((l) => l.classList.remove('les-answerline'));
      qBox.appendChild(el('div.les-qtext', el('span.les-qnum', String(qi + 1)), q.q));
      const answers = q.a.slice();
      if (ctx.flow > 0 && q.x) answers.push(q.x);
      const isPic = !!answers[0].e;
      const items = answers.map((a) => (isPic
        ? { content: a.e, correct: !!a.ok, say: a.say, a }
        : { content: a.t, text: true, correct: !!a.ok, a, className: 'les-wordans', aria: 'Antwort' }));
      const box = el('div.choices.les-answers');
      qBox.appendChild(box);
      ctx.instruct(q.q);
      const ha = items.length <= 3 ? 1 : 2;
      let localWrong = 0;
      await ctx.choices(items, {
        container: box,
        size: isPic ? undefined : 'wide',
        sayButton: isPic,
        hintAfter: ha,
        praise: false,
        correctSay: () => (qi === story.q.length - 1
          ? proc(ctx, vary('st-ok2', ['Richtig! Du bist ein echter Lesedetektiv!', 'Super, beide Fragen geschafft!']),
            'Du hast in der Geschichte nachgeschaut. Genau so machen das Detektive!')
          : vary('st-ok1', ['Richtig!', 'Genau!', 'Stimmt!'])),
        explain: (item) => item.a.why || 'Lies noch einmal in der Geschichte nach.',
        hintSay: `Die Antwort steht im ${ORD[q.s]} Satz. Ich lasse ihn leuchten.`,
        modelSay: 'Hier ist die Antwort.',
        onWrong: async (item, tile) => {
        const n = ++localWrong; // eigene Zählung (Vorlesen zählt in ctx.wrongCount mit)
          if (n === ha) lines[q.s].classList.add('les-answerline');
          if (n > ha) {
            lines[q.s].classList.add('les-answerline');
            await readAloud(ctx, lines[q.s], story.s[q.s]);
          }
        },
      });
      if (!ctx.active) return;
      await ctx.sleep(300);
    }
  }

  /* ======================================================================
     Stufe 5: Unsinn-Alarm
     ====================================================================== */
  async function yesNoTask(ctx) {
    const all = [...NONSENSE.map((x) => Object.assign({ bad: true }, x)), ...SENSE.map((x) => Object.assign({ bad: false }, x))];
    const target = ctx.item(all, (x) => x.t, { avoid: 8 });
    const tb = textNode(ctx, target.t, 'les-sent');
    const card = readCard(ctx, tb, () => target.t);
    ctx.stage.appendChild(card);
    ctx.instruct(introduced.has('yn-instr')
      ? vary('yn', ['Lies den Satz. Stimmt das?', 'Kann das stimmen? Lies genau.'])
      : 'Lies den Satz. Kann das stimmen, oder ist es Unsinn?');
    introduced.add('yn-instr');
    const items = [
      { content: el('span.les-yn', U.emoji('👍'), el('span', 'Stimmt')), correct: !target.bad, aria: 'Stimmt', className: 'les-yntile les-yes', v: 'yes' },
      { content: el('span.les-yn', U.emoji('🤪'), el('span', 'Unsinn')), correct: target.bad, aria: 'Unsinn', className: 'les-yntile les-no', v: 'no' },
    ];
    let localWrong = 0;
    await ctx.choices(items, {
      size: 'wide',
      shuffle: false,
      hintAfter: 2,
      praise: false,
      correctSay: () => {
        const base = target.bad
          ? proc(ctx, vary('yn-bad', ['Genau, das ist Unsinn!', 'Richtig, das kann nicht stimmen!']), 'Du hast dir den Satz im Kopf vorgestellt. Super, das ist Unsinn!')
          : proc(ctx, vary('yn-ok', ['Genau, das stimmt!', 'Richtig, das kann stimmen!']), 'Du hast genau gelesen und nachgedacht. Das stimmt!');
        return target.bad ? `${base} ${target.fix}` : base;
      },
      explain: (item) => (item.v === 'yes'
        ? 'Hmm. Stell dir den Satz wie ein Bild im Kopf vor. Lies jedes Wort genau. Geht das wirklich?'
        : 'Schau noch einmal genau. Stell dir den Satz im Kopf vor. Ist daran wirklich etwas komisch?'),
      onWrong: async () => {
        if (target.bad && target.key) glowWords(tb, [target.key]);
        else await sweep(ctx, tb._words);
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(400);
  }

  async function oddTask(ctx) {
    const target = ctx.item(NONSENSE, (x) => x.t, { avoid: 6 });
    const n = ctx.flow > 0 ? 3 : 2;
    const goods = U.sample(SENSE, n);
    ctx.stage.classList.add('les-oddstage');
    ctx.stage.appendChild(el('div.prompt-box.les-card.les-oddhead', el('span.les-lupe', { 'aria-hidden': 'true' }, '🔍'), el('span.les-oddtitle', 'Welcher Satz ist Unsinn?')));
    ctx.instruct(introduced.has('odd-instr')
      ? 'Welcher Satz ist Unsinn?'
      : 'Hier stehen mehrere Sätze. Einer davon ist Unsinn. Lies alle und finde ihn!');
    introduced.add('odd-instr');
    const items = [target, ...goods].map((s) => {
      const tb = textNode(ctx, s.t, 'les-opttext', false);
      return { content: tb, correct: s === target, aria: 'Satz', className: 'les-senttile', s, tb };
    });
    const ha = items.length <= 3 ? 1 : 2;
    let tItem = items[0];
    let localWrong = 0;
    await ctx.choices(items, {
      columns: 1,
      className: 'les-oddlist',
      hintAfter: ha,
      praise: false,
      correctSay: () => proc(ctx,
        `${vary('odd-ok', ['Genau, das ist Unsinn!', 'Richtig gefunden!'])} ${target.fix}`,
        `Du hast alle Sätze genau gelesen. Super! ${target.fix}`),
      explain: (item) => 'Dieser Satz kann stimmen. Stell dir jeden Satz wie ein Bild vor. Welcher ist komisch?',
      hintSay: 'Lies die Sätze noch einmal ganz langsam. Ein Satz ist schon weg.',
      modelSay: 'Schau, dieser Satz ist Unsinn.',
      onWrong: async (item, tile) => {
        const n = ++localWrong; // eigene Zählung (Vorlesen zählt in ctx.wrongCount mit)
        if (n > ha && target.key) glowWords(tItem.tb, [target.key]);
      },
    });
    if (!ctx.active) return;
    if (target.key) glowWords(tItem.tb, [target.key]);
    await ctx.sleep(400);
  }

  /* ======================================================================
     Registrierung
     ====================================================================== */
  LT.registerGame({
    id: 'lesedetektiv',
    area: 'deutsch1',
    title: 'Lesedetektiv',
    icon: '🕵️',
    levels: 5,
    rounds: 5,
    type: 'tasks',
    intro: 'Hallo, Lesedetektiv! Wir lesen ganz genau, wie Detektive mit der Lupe.',
    parent: {
      skill: 'Leseverständnis: Wörter, Sätze und kleine Texte verstehen (Klasse 1)',
      goal: 'Ihr Kind liest selbstständig und zeigt, dass es das Gelesene verstanden hat: Wort und Bild, Satz und Bild, kleine Geschichten mit Fragen und Unsinn-Sätze. Die Bilder unterscheiden sich immer nur in einem entscheidenden Wort, so lohnt sich genaues Lesen bis zum Punkt statt Raten nach dem ersten Wort. Texte werden bewusst nicht vorgelesen; der Lautsprecher-Knopf an der Lesekarte liest vor, zählt aber als Hilfe. Nach Fehlern zeigt Flo, wo der Unterschied steckt, und lässt die wichtigen Wörter leuchten.',
      levels: [
        'Wort und Bild mit sehr ähnlichen Wörtern (Maus/Haus/Mais, Biene/Birne)',
        'Satz und Bild: die Bilder unterscheiden sich in einem einzigen Wort',
        'Kleine wichtige Wörter (auf, unter, neben, in), Zahlwörter bis neun und Mal-Aufträge („Male den Stern gelb.“)',
        'Mini-Geschichte mit drei Sätzen lesen und zwei Fragen beantworten',
        'Unsinn-Alarm: „Stimmt das?“ und „Welcher Satz ist Unsinn?“',
      ],
      tip: 'Schreiben Sie Ihrem Kind kleine Lese-Aufträge auf Zettel („Hol einen Löffel.“, „Klopf dreimal an die Tür.“) oder lustige Unsinn-Sätze („Die Katze kann bellen.“). Fragen Sie nach dem Lesen: „Was hast du gelesen? Wer kommt vor?“ Nicht vorlesen, sondern auf ein Wort zeigen: „Lies hier noch einmal genau.“',
    },

    async task(ctx) {
      const lv = lvOf(ctx);
      ctx.stage.classList.add('les-stage');
      await levelIntro(ctx, lv);
      if (!ctx.active) return;
      if (lv === 1) return wordTask(ctx);
      if (lv === 2) return sentTask(ctx);
      if (lv === 3) {
        // Mal-Aufträge nur, wenn Stufe 3 die eigentliche Stufe ist (nicht als Knobel-Aufgabe)
        const kinds = ctx.level === 3 ? ['prep', 'count', 'paint'] : ['prep', 'count'];
        const kind = kinds[(ctx.index + l3off) % kinds.length];
        if (kind === 'prep') return prepTask(ctx);
        if (kind === 'count') return countTask(ctx);
        return paintTask(ctx);
      }
      if (lv === 4) return storyTask(ctx);
      const odd = ctx.flow > 0 || ctx.index % 3 === 2;
      return odd ? oddTask(ctx) : yesNoTask(ctx);
    },
  });
})();
