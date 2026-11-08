/* ==========================================================================
   Forscherwelt – Kapitel 🧒 Mensch & Zusammenleben (vier Wissensreisen)
     w-sinne          Die fünf Sinne
     w-koerper-innen  Reise in den Körper (Herz, Lunge, Knochen, Muskeln, Magen)
     w-gesund         Gesund und fit (essen, trinken, Zähne, Hände, Bewegung, Schlaf)
     w-helfer         Helfer im Notfall (Feuerwehr, Polizei, Ärztin, Notruf)
   Datenformat: siehe js/games/wissen/_shared.js (LT.wissen.addUnit).
   Alle gesprochenen Sätze sind feste Strings (vorab aufgenommene Stimme).
   ========================================================================== */
(function () {
  'use strict';
  const LT = (window.LT = window.LT || {});
  // Absicherung: Fehlt die Engine noch, landen die Einheiten in der
  // Warteschlange LT.wissenQueue, die die Engine beim Laden abarbeitet.
  function add(unit) {
    if (LT.wissen && typeof LT.wissen.addUnit === 'function') LT.wissen.addUnit(unit);
    else (LT.wissenQueue = Array.isArray(LT.wissenQueue) ? LT.wissenQueue : []).push(unit);
  }

  /* ------------------------------------------------------------------
     1) Die fünf Sinne
     ------------------------------------------------------------------ */
  add({
    id: 'w-sinne',
    theme: 'mensch',
    title: 'Die fünf Sinne',
    icon: '👀',
    intro: 'Heute erforschen wir, wie du mit deinen fünf Sinnen die Welt entdeckst.',
    parent: {
      skill: 'Sachwissen Mensch: die fünf Sinne und ihre Sinnesorgane (Augen, Ohren, Nase, Zunge, Haut)',
      goal: 'Das Kind ordnet jedem Sinn das passende Sinnesorgan zu, weiß, dass die Sinne Nachrichten an das Gehirn schicken, und versteht, dass Sinne zusammenarbeiten und uns schützen.',
      levels: [
        'Stufe 1: Bildergeschichte zum Mitmachen, Sinnesorgane benennen; Dinge nach Hören und Riechen sortieren',
        'Stufe 2: Geschmacksrichtungen, Riechen und Schmecken bei Schnupfen, Fingerspitzen und Blindenschrift; Weg eines Geräusches ins Gehirn ordnen',
        'Stufe 3: Denkfragen (Dunkelheit, verdorbene Milch, Richtungshören mit zwei Ohren, Hunde-Sinne); Aussagen prüfen',
      ],
      tip: 'Machen Sie ein Sinnes-Picknick: Mit verbundenen Augen darf Ihr Kind Obststücke schmecken, an Gewürzen riechen und Gegenstände in einem Stoffbeutel ertasten. Fragen Sie jedes Mal: Welcher Sinn hat dir gerade geholfen? Auf einem Spaziergang können Sie gemeinsam eine Minute still sein und zählen, wie viele Geräusche Sie hören.',
    },
    story: [
      { scene: ['👀', '🌈'], say: 'Mit den Augen sehen wir. Wir sehen Farben, Formen und alles, was sich bewegt.',
        tap: { index: 0, say: 'Tippe auf die Augen!', done: 'Genau! Mit den Augen siehst du den bunten Regenbogen.' } },
      { scene: ['👂', '🎵'], say: 'Mit den Ohren hören wir. Wir hören Musik, Vögel und leise Stimmen.',
        tap: { index: 0, say: 'Tippe auf das Ohr!', done: 'Super! Deine Ohren hören sogar im Schlaf.' } },
      { scene: ['👃', '🌹'], say: 'Mit der Nase riechen wir. Eine Rose duftet süß.',
        tap: { index: 1, say: 'Tippe auf die Rose und schnuppere mal!', done: 'Mmh, wie gut die Rose duftet!' } },
      { scene: ['👅', '🍋', '🍯'], say: 'Mit der Zunge schmecken wir. Eine Zitrone schmeckt sauer, Honig schmeckt süß.',
        tap: { index: 0, say: 'Tippe auf die Zunge!', done: 'Richtig! Die Zunge ist dein Schmeck-Werkzeug.' } },
      { scene: ['✋', '🧸', '🧊'], say: 'Mit der Haut fühlen wir. Sie spürt, ob etwas weich oder hart, warm oder kalt ist.',
        tap: { index: 1, say: 'Tippe auf den Teddy!', done: 'Schön weich! Das spürt deine Haut, besonders an den Fingerspitzen.' } },
      { scene: ['🧠', '👀', '👂', '👃'], say: 'Alle Sinne schicken Nachrichten an dein Gehirn. Das Gehirn erkennt dann, was um dich herum passiert.',
        tap: { index: 0, say: 'Tippe auf das Gehirn!', done: 'Genau! Dein Gehirn ist der Chef, der alles versteht.' } },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Womit hörst du?', answers: [['👂', 'Mit den Ohren'], ['👀', 'Mit den Augen'], ['👃', 'Mit der Nase']], correct: 0,
        why: 'Genau! Mit den Ohren hören wir Geräusche, Musik und Stimmen.' },
      { level: 1, q: 'Womit riechst du an einer Blume?', answers: [['👅', 'Mit der Zunge'], ['👃', 'Mit der Nase'], ['👂', 'Mit den Ohren']], correct: 1,
        why: 'Richtig! Die Nase riecht, wie gut die Blume duftet.' },
      { level: 1, q: 'Womit siehst du die Farben vom Regenbogen?', answers: [['👂', 'Mit den Ohren'], ['👅', 'Mit der Zunge'], ['👀', 'Mit den Augen']], correct: 2,
        why: 'Super! Die Augen sehen Farben und Formen.' },
      { level: 1, q: 'Womit schmeckst du, ob ein Eis süß ist?', answers: [['👅', 'Mit der Zunge'], ['👀', 'Mit den Augen'], ['✋', 'Mit der Hand']], correct: 0,
        why: 'Genau! Die Zunge schmeckt, ob etwas süß ist.' },
      { level: 1, q: 'Womit fühlst du, dass ein Teddy weich ist?', answers: [['👃', 'Mit der Nase'], ['✋', 'Mit der Haut'], ['👂', 'Mit den Ohren']], correct: 1,
        why: 'Richtig! Die Haut fühlt, ob etwas weich, hart, warm oder kalt ist.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Was schmeckt salzig?', answers: [['🍓', 'Eine Erdbeere'], ['🥨', 'Eine Brezel'], ['🍯', 'Honig']], correct: 1,
        why: 'Genau! Auf der Brezel ist Salz. Die Zunge schmeckt zum Beispiel süß, sauer, salzig und bitter.' },
      { level: 2, q: 'Du hast Schnupfen. Warum schmeckt das Essen dann nach fast nichts?', answers: [['👃', 'Die Nase riecht nicht mit'], ['👂', 'Die Ohren sind zu'], ['🦶', 'Die Füße sind kalt']], correct: 0,
        why: 'Richtig! Nase und Zunge arbeiten zusammen. Ist die Nase verstopft, schmeckst du viel weniger.' },
      { level: 2, q: 'Welche Stelle fühlt besonders fein?', answers: [['☝️', 'Die Fingerspitzen'], ['🦶', 'Die Ferse'], ['💪', 'Der Oberarm']], correct: 0,
        why: 'Genau! In den Fingerspitzen gibt es besonders viele Fühl-Stellen. Darum tasten wir mit den Fingern.' },
      { level: 2, q: 'Wie lesen Menschen, die nicht sehen können?', answers: [['👃', 'Sie riechen die Buchstaben'], ['☝️', 'Sie fühlen Punkte mit den Fingern'], ['👅', 'Sie schmecken das Papier']], correct: 1,
        why: 'Richtig! Die Blindenschrift besteht aus kleinen Punkten. Die kann man mit den Fingern fühlen.' },
      { level: 2, q: 'Welcher Sinn hilft dir, ein Lied zu erkennen?', answers: [['👂', 'Das Hören'], ['👃', 'Das Riechen'], ['👅', 'Das Schmecken']], correct: 0,
        why: 'Genau! Die Ohren fangen die Töne auf. Das Gehirn erkennt dann das Lied.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Es ist ganz dunkel. Welcher Sinn hilft dir dann kaum?', answers: [['👀', 'Das Sehen'], ['👂', 'Das Hören'], ['✋', 'Das Fühlen']], correct: 0,
        why: 'Genau! Die Augen brauchen Licht. Im Dunkeln helfen dir deine Ohren und deine Hände.' },
      { level: 3, q: 'Die Milch ist schlecht geworden. Welcher Sinn warnt dich zuerst?', answers: [['👂', 'Die Ohren'], ['👃', 'Die Nase'], ['✋', 'Die Hände']], correct: 1,
        why: 'Richtig! Schlechte Milch riecht komisch. So schützt dich deine Nase.' },
      { level: 3, q: 'Du hörst ein Auto. Wie merkst du, von welcher Seite es kommt?', answers: [['👂', 'Ich höre mit zwei Ohren'], ['👅', 'Ich schmecke es'], ['👃', 'Ich rieche es']], correct: 0,
        why: 'Genau! Das Geräusch kommt bei einem Ohr etwas früher an. So weiß dein Gehirn, woher es kommt.' },
      { level: 3, q: 'Ein Hund findet einen versteckten Ball, den du nicht siehst. Wie geht das?', answers: [['🐕', 'Er riecht viel besser als wir'], ['🔮', 'Er kann zaubern'], ['🌙', 'Der Mond verrät es ihm']], correct: 0,
        why: 'Richtig! Hunde haben eine super Nase. Sie riechen viel besser als Menschen.' },
    ],
    play: [
      { type: 'sort', say: 'Was hörst du, und was riechst du? Sortiere die Bilder!', groups: [['👂', 'Hören'], ['👃', 'Riechen']],
        items: [['🔔', 'Glocke', 0], ['🥁', 'Trommel', 0], ['🎺', 'Trompete', 0], ['🌹', 'Rose', 1], ['🧄', 'Knoblauch', 1], ['🍞', 'Frisches Brot', 1]] },
      { type: 'order', say: 'Wie kommt das Geräusch in deinen Kopf? Lege die Bilder in die richtige Reihenfolge!',
        items: [['🥁', 'Die Trommel macht ein Geräusch'], ['👂', 'Das Ohr fängt das Geräusch auf'], ['🧠', 'Das Gehirn erkennt die Trommel']] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '👅', s: 'Mit der Zunge kannst du schmecken.', ok: true, why: 'Richtig! Die Zunge schmeckt süß, sauer, salzig und bitter.' },
        { e: '👂', s: 'Mit den Ohren kannst du riechen.', ok: false, why: 'Nein! Riechen tun wir mit der Nase. Mit den Ohren hören wir.' },
        { e: '🐕', s: 'Hunde können viel besser riechen als Menschen.', ok: true, why: 'Stimmt! Ein Hund kann Spuren auf dem Boden erschnüffeln.' },
        { e: '🧊', s: 'Ein Eiswürfel fühlt sich warm an.', ok: false, why: 'Nein, ein Eiswürfel ist kalt. Das spürt deine Haut sofort.' },
        { e: '🧠', s: 'Die Sinne schicken ihre Nachrichten an das Gehirn.', ok: true, why: 'Richtig! Das Gehirn versteht, was die Sinne melden.' },
        { e: '👃', s: 'Mit der Nase kann man Farben sehen.', ok: false, why: 'Nein! Farben sehen wir mit den Augen. Die Nase riecht.' },
      ] },
    ],
    facts: [
      { e: '🖐️', text: 'Du hast fünf Sinne: sehen, hören, riechen, schmecken und fühlen.' },
      { e: '👅', text: 'Auf deiner Zunge sitzen tausende winzige Geschmacksknospen. Mit ihnen schmeckst du.' },
      { e: '👂', text: 'Der kleinste Knochen deines Körpers sitzt im Ohr. Er heißt Steigbügel.' },
    ],
  });

  /* ------------------------------------------------------------------
     2) Reise in den Körper
     ------------------------------------------------------------------ */
  add({
    id: 'w-koerper-innen',
    theme: 'mensch',
    title: 'Reise in den Körper',
    icon: '🫀',
    intro: 'Heute machen wir eine Forscherreise in deinen Körper. Dort arbeiten viele fleißige Helfer.',
    parent: {
      skill: 'Sachwissen Mensch: innere Organe und ihre Aufgaben (Herz, Lunge, Knochen, Muskeln, Magen)',
      goal: 'Das Kind kennt Herz, Lunge, Skelett, Muskeln und Magen mit ihren wichtigsten Aufgaben, versteht einfache Zusammenhänge (Rennen lässt das Herz schneller schlagen, Kauen hilft dem Magen) und lernt Fachbegriffe wie Sauerstoff, Skelett und Rippen.',
      levels: [
        'Stufe 1: Bildergeschichte zum Mitmachen, Organe und ihre Aufgaben; Aussagen prüfen (stimmt oder stimmt nicht)',
        'Stufe 2: Herz als Muskel, Herzschlag beim Rennen, Rippen als Schutz, gut kauen; den Weg des Essens ordnen',
        'Stufe 3: Denkfragen zu Babyknochen, Atmen, Muskeltraining und Bauchknurren; Tätigkeiten nach schnellem oder ruhigem Herzschlag sortieren',
      ],
      tip: 'Lassen Sie Ihr Kind sein Herz fühlen: Hand auf die Brust legen, dann eine Minute auf der Stelle hüpfen und noch einmal fühlen. Was hat sich verändert? Beim Essen können Sie gemeinsam überlegen, wohin das Essen jetzt reist. Ein großes Blatt Papier, auf dem Sie den Umriss Ihres Kindes nachzeichnen, wird zur Körperkarte, in die es Herz, Lunge und Knochen malt.',
    },
    story: [
      { scene: ['🫀', '🩸'], say: 'Das ist dein Herz. Es ist ein starker Muskel und pumpt Blut durch deinen ganzen Körper.',
        tap: { index: 0, say: 'Tippe auf das Herz!', done: 'Bumm bumm! Dein Herz ist ungefähr so groß wie deine Faust.' } },
      { scene: ['🫁', '💨'], say: 'Das ist deine Lunge. Wenn du einatmest, füllt sie sich mit Luft. Aus der Luft holt sie Sauerstoff.',
        tap: { index: 0, say: 'Tippe auf die Lunge!', done: 'Tief einatmen und wieder ausatmen! Dein Körper braucht den Sauerstoff zum Leben.' } },
      { scene: ['🦴', '🧍'], say: 'Deine Knochen sind hart und stark. Zusammen bilden sie das Skelett. Es hält deinen Körper aufrecht.',
        tap: { index: 0, say: 'Tippe auf den Knochen!', done: 'Super! Ohne Knochen wärst du wabbelig wie ein Wackelpudding.' } },
      { scene: ['💪', '🏃'], say: 'Muskeln bewegen deine Knochen. Wenn du rennst, springst oder lachst, arbeiten deine Muskeln.',
        tap: { index: 0, say: 'Tippe auf den Muskel!', done: 'Stark! Du hast mehr als sechshundert Muskeln.' } },
      { scene: ['🥪', '😋', '🥣'], say: 'Du kaust dein Essen und schluckst es hinunter. Im Magen wird es zu einem weichen Brei.',
        tap: { index: 0, say: 'Tippe auf das Brot und beiß ab!', done: 'Mampf! Jetzt beginnt die Reise des Essens durch deinen Bauch.' } },
      { scene: ['🧒', '🌙', '💖'], say: 'Alle Helfer in deinem Körper arbeiten zusammen. Herz und Lunge arbeiten sogar, wenn du schläfst.' },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Was pumpt das Blut durch deinen Körper?', answers: [['🫀', 'Das Herz'], ['🦴', 'Ein Knochen'], ['🫁', 'Die Lunge']], correct: 0,
        why: 'Genau! Das Herz pumpt das Blut bis in die Zehenspitzen.' },
      { level: 1, q: 'Was füllt sich beim Einatmen mit Luft?', answers: [['🫀', 'Das Herz'], ['🫁', 'Die Lunge'], ['🦶', 'Der Fuß']], correct: 1,
        why: 'Richtig! Die Lunge füllt sich mit Luft wie ein Ballon.' },
      { level: 1, q: 'Was hält deinen Körper aufrecht wie ein Gerüst?', answers: [['🩸', 'Das Blut'], ['💨', 'Die Luft'], ['🦴', 'Die Knochen']], correct: 2,
        why: 'Super! Alle Knochen zusammen heißen Skelett. Das Skelett trägt deinen Körper.' },
      { level: 1, q: 'Was bewegt deine Arme und Beine?', answers: [['💪', 'Die Muskeln'], ['🫁', 'Die Lunge'], ['👃', 'Die Nase']], correct: 0,
        why: 'Genau! Muskeln ziehen an den Knochen. So kannst du dich bewegen.' },
      { level: 1, q: 'Was macht dein Magen mit dem Essen?', answers: [['❄️', 'Er friert es ein'], ['🥣', 'Er macht einen Brei daraus'], ['🎈', 'Er bläst es auf']], correct: 1,
        why: 'Richtig! Der Magen mischt das Essen mit Magensaft zu einem weichen Brei.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Woraus ist dein Herz?', answers: [['🦴', 'Aus Knochen'], ['💪', 'Aus Muskel'], ['🪨', 'Aus Stein']], correct: 1,
        why: 'Genau! Das Herz ist ein Muskel. Er arbeitet dein ganzes Leben lang ohne Pause.' },
      { level: 2, q: 'Warum schlägt dein Herz beim Rennen schneller?', answers: [['🏃', 'Die Muskeln brauchen mehr Blut'], ['😴', 'Das Herz wird müde'], ['🎶', 'Das Herz will tanzen']], correct: 0,
        why: 'Richtig! Beim Rennen brauchen die Muskeln mehr Sauerstoff. Das Herz pumpt darum schneller.' },
      { level: 2, q: 'Was schützen deine Rippen?', answers: [['🦶', 'Die Füße'], ['👂', 'Die Ohren'], ['🫀', 'Herz und Lunge']], correct: 2,
        why: 'Genau! Die Rippen sind wie ein Korb aus Knochen. Darin liegen Herz und Lunge sicher.' },
      { level: 2, q: 'Warum solltest du dein Essen gut kauen?', answers: [['🦷', 'Dann hat der Magen weniger Arbeit'], ['🎵', 'Dann klingt es schöner'], ['🎨', 'Dann wird es bunter']], correct: 0,
        why: 'Richtig! Kleine Stückchen kann der Magen viel leichter verarbeiten.' },
      { level: 2, q: 'Wie groß ist dein Herz ungefähr?', answers: [['🐜', 'So klein wie eine Ameise'], ['✊', 'So groß wie deine Faust'], ['🍉', 'So groß wie eine Melone']], correct: 1,
        why: 'Genau! Mach eine Faust. So groß ist dein Herz. Es wächst mit dir mit.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Ein Baby hat mehr Knochen als ein Erwachsener. Was passiert mit ihnen?', answers: [['🧩', 'Manche wachsen zusammen'], ['🍂', 'Sie fallen ab'], ['🎈', 'Sie fliegen weg']], correct: 0,
        why: 'Richtig! Beim Wachsen verbinden sich manche Knochen. Ein Erwachsener hat etwa zweihundertsechs Knochen.' },
      { level: 3, q: 'Du hältst die Luft an. Warum musst du bald wieder atmen?', answers: [['👃', 'Die Nase juckt'], ['🫁', 'Der Körper braucht Sauerstoff'], ['👂', 'Die Ohren sind voll']], correct: 1,
        why: 'Genau! Dein Körper braucht immer wieder frischen Sauerstoff. Darum atmest du sogar im Schlaf.' },
      { level: 3, q: 'Was passiert mit deinen Muskeln, wenn du oft kletterst und turnst?', answers: [['💪', 'Sie werden stärker'], ['🧊', 'Sie frieren ein'], ['🐌', 'Sie werden langsam wie eine Schnecke']], correct: 0,
        why: 'Richtig! Muskeln wachsen durch Bewegung. Darum macht Toben stark.' },
      { level: 3, q: 'Warum knurrt manchmal dein Bauch?', answers: [['🐻', 'Ein Bär wohnt darin'], ['🎵', 'Der Bauch singt ein Lied'], ['🍽️', 'Der leere Magen arbeitet und gluckert']], correct: 2,
        why: 'Genau! Auch ein leerer Magen bewegt sich. Luft und Saft gluckern dann laut.' },
    ],
    play: [
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🫀', s: 'Das Herz pumpt das Blut durch den Körper.', ok: true, why: 'Richtig! Das Herz ist eine starke Pumpe.' },
        { e: '🦴', s: 'Knochen sind weich wie Watte.', ok: false, why: 'Nein, Knochen sind hart und stark. Sie tragen deinen Körper.' },
        { e: '🫁', s: 'Mit der Lunge atmen wir.', ok: true, why: 'Stimmt! Die Lunge holt Luft in deinen Körper.' },
        { e: '🥪', s: 'Das Essen kommt nach dem Schlucken in die Lunge.', ok: false, why: 'Nein, das Essen rutscht in den Magen. In die Lunge kommt nur Luft.' },
        { e: '💪', s: 'Muskeln bewegen unseren Körper.', ok: true, why: 'Richtig! Ohne Muskeln könntest du nicht laufen und nicht lachen.' },
      ] },
      { type: 'order', say: 'Wohin reist das Essen? Lege die Bilder in die richtige Reihenfolge!',
        items: [['🍎', 'Abbeißen'], ['🦷', 'Gut kauen'], ['🥣', 'Im Magen wird es zu Brei']] },
      { type: 'sort', say: 'Wann schlägt dein Herz schnell, wann schlägt es ruhig? Sortiere!', groups: [['🐇', 'Herz schlägt schnell'], ['🐢', 'Herz schlägt ruhig']],
        items: [['🏃', 'Rennen', 0], ['🚲', 'Schnell Rad fahren', 0], ['🤸', 'Turnen', 0], ['😴', 'Schlafen', 1], ['📖', 'Ein Buch anschauen', 1], ['🧘', 'Ruhig sitzen', 1]] },
    ],
    facts: [
      { e: '🫀', text: 'Dein Herz ist ungefähr so groß wie deine Faust. Es schlägt jeden Tag mehr als hunderttausend Mal.' },
      { e: '🦴', text: 'Ein Erwachsener hat etwa zweihundertsechs Knochen. Der längste ist der Oberschenkel-Knochen.' },
      { e: '🫁', text: 'Du atmest jeden Tag viele tausend Mal ein und aus. Sogar im Schlaf.' },
    ],
  });

  /* ------------------------------------------------------------------
     3) Gesund und fit
     ------------------------------------------------------------------ */
  add({
    id: 'w-gesund',
    theme: 'mensch',
    title: 'Gesund und fit',
    icon: '🍎',
    intro: 'Heute erforschen wir, was deinem Körper guttut und dich gesund und fit hält.',
    parent: {
      skill: 'Gesundheitserziehung: ausgewogen essen, Wasser trinken, Zähne putzen, Hände waschen, Bewegung und Schlaf',
      goal: 'Das Kind kennt sechs gesunde Gewohnheiten, versteht die Gründe dafür (Keime, Zucker und Zähne, Erholung im Schlaf) und kann sie auf Alltagssituationen übertragen.',
      levels: [
        'Stufe 1: Bildergeschichte zum Mitmachen, Grundfragen; Lebensmittel nach jeden Tag oder nur ab und zu sortieren',
        'Stufe 2: Zwei Minuten Zähneputzen, Keime und Seife, Zucker und Zähne, Schlaf und Wachstum, fünf Portionen Obst und Gemüse; Händewaschen in die richtige Reihenfolge bringen',
        'Stufe 3: Denkfragen zu Alltagssituationen (nach dem Spielen, Hitze, zu wenig Schlaf, Niesen in die Armbeuge); Aussagen prüfen',
      ],
      tip: 'Machen Sie aus Gewohnheiten kleine Rituale: eine Sanduhr oder ein Zwei-Minuten-Lied beim Zähneputzen, ein Wasserglas, das Ihr Kind selbst auffüllen darf, und ein buntes Obst-Teller-Spiel, bei dem es fünf Hände voll Obst und Gemüse am Tag zählt. Beim Händewaschen hilft ein kurzes Lied, damit lange genug eingeseift wird. Putzen Sie abends nach, bis Ihr Kind gut schreiben kann. Ab zwei Jahren reicht eine erbsengroße Menge Kinderzahnpasta mit Fluorid. Empfohlen sind für Kindergartenkinder etwa drei Stunden Bewegung am Tag.',
    },
    story: [
      { scene: ['🍎', '🥕', '🥦'], say: 'Obst und Gemüse machen dich stark. Sie stecken voller Vitamine.',
        tap: { index: 1, say: 'Tippe auf die Karotte!', done: 'Knack! Karotten sind gesund und schmecken süß.' } },
      { scene: ['🚰', '💧'], say: 'Dein Körper braucht jeden Tag viel Wasser. Wasser ist das beste Getränk gegen Durst.',
        tap: { index: 1, say: 'Tippe auf den Wassertropfen!', done: 'Gluck gluck! Trink über den Tag verteilt immer wieder Wasser.' } },
      { scene: ['🪥', '🦷'], say: 'Morgens und abends putzt du deine Zähne. Dann bleiben sie gesund und stark.',
        tap: { index: 0, say: 'Tippe auf die Zahnbürste!', done: 'Schrubb schrubb! Zwei Minuten lang putzen ist genau richtig.' } },
      { scene: ['🧼', '👐'], say: 'Vor dem Essen und nach der Toilette wäschst du die Hände. Seife wäscht winzige Keime ab.',
        tap: { index: 0, say: 'Tippe auf die Seife!', done: 'Super! Mit Seife und Wasser werden deine Hände richtig sauber.' } },
      { scene: ['⚽', '🏃'], say: 'Toben, rennen und klettern machen Spaß. Bewegung macht Herz und Muskeln stark.',
        tap: { index: 0, say: 'Tippe auf den Ball!', done: 'Toll! Jeden Tag ganz viel toben und spielen, am besten mehrere Stunden, tut dir richtig gut.' } },
      { scene: ['🛏️', '😴', '🌙'], say: 'Am Abend gehst du ins Bett. Im Schlaf ruht sich dein Körper aus, und du wächst.',
        tap: { index: 0, say: 'Tippe auf das Bett!', done: 'Gute Nacht! Kinder brauchen viel Schlaf, ungefähr zehn bis zwölf Stunden jede Nacht.' } },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Was ist das beste Getränk gegen Durst?', answers: [['🥤', 'Limonade'], ['💧', 'Wasser'], ['☕', 'Kaffee']], correct: 1,
        why: 'Genau! Wasser löscht den Durst und hat keinen Zucker.' },
      { level: 1, q: 'Womit putzt du deine Zähne?', answers: [['🪥', 'Mit der Zahnbürste'], ['🍴', 'Mit der Gabel'], ['🖌️', 'Mit dem Pinsel']], correct: 0,
        why: 'Richtig! Mit der Zahnbürste und einem kleinen Klecks Zahnpasta.' },
      { level: 1, q: 'Was machst du vor dem Essen?', answers: [['🛏️', 'Ins Bett gehen'], ['🎨', 'Malen'], ['🧼', 'Hände waschen']], correct: 2,
        why: 'Super! Saubere Hände bringen keine Keime ans Essen.' },
      { level: 1, q: 'Was ist ein gesunder Snack?', answers: [['🍎', 'Ein Apfel'], ['🍭', 'Ein Lutscher'], ['🍟', 'Pommes']], correct: 0,
        why: 'Genau! Obst hat viele Vitamine. Süßigkeiten gibt es nur ab und zu.' },
      { level: 1, q: 'Was braucht dein Körper in der Nacht?', answers: [['📺', 'Fernsehen'], ['😴', 'Schlaf'], ['🍫', 'Schokolade']], correct: 1,
        why: 'Richtig! Im Schlaf ruht sich dein Körper aus.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Wie lange putzt du deine Zähne?', answers: [['1️⃣', 'Eine Sekunde'], ['2️⃣', 'Zwei Minuten'], ['🔟', 'Zehn Sekunden']], correct: 1,
        why: 'Genau! Zwei Minuten lang, morgens und abends. Dann wird jeder Zahn sauber.' },
      { level: 2, q: 'Warum wäschst du die Hände mit Seife?', answers: [['🦠', 'Seife wäscht Keime ab'], ['🌈', 'Damit sie bunt werden'], ['❄️', 'Damit sie kalt werden']], correct: 0,
        why: 'Richtig! Keime sind so winzig, dass man sie nicht sehen kann. Seife und Wasser spülen sie weg.' },
      { level: 2, q: 'Warum ist viel Zucker nicht gut für die Zähne?', answers: [['🧊', 'Zucker macht die Zähne kalt'], ['🎨', 'Zucker malt die Zähne an'], ['🦠', 'Winzige Bakterien machen daraus Säure']], correct: 2,
        why: 'Genau! Die Säure schadet den Zähnen. Darum ist Zähneputzen so wichtig.' },
      { level: 2, q: 'Was passiert, während du schläfst?', answers: [['🌱', 'Dein Körper erholt sich und wächst'], ['🏃', 'Du rennst ganz schnell'], ['🍽️', 'Dein Bauch isst ein Brot']], correct: 0,
        why: 'Richtig! Im Schlaf wächst du. Und dein Gehirn ordnet, was du gelernt hast.' },
      { level: 2, q: 'Wie viel Obst und Gemüse ist gut für einen Tag?', answers: [['☝️', 'Ein winziges Stückchen'], ['🖐️', 'Fünf Hände voll'], ['🚫', 'Gar keins']], correct: 1,
        why: 'Genau! Eine Portion passt in deine Hand. Fünf Portionen am Tag sind super.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Du hast im Garten gespielt und willst essen. Was tust du zuerst?', answers: [['🍪', 'Sofort essen'], ['🧼', 'Hände waschen'], ['🐶', 'Den Hund streicheln']], correct: 1,
        why: 'Richtig! Beim Spielen kommen Keime an die Hände. Mit Seife sind sie schnell weg.' },
      { level: 3, q: 'Es ist heiß und du schwitzt beim Spielen. Was braucht dein Körper jetzt?', answers: [['💧', 'Viel Wasser'], ['🧥', 'Eine dicke Jacke'], ['🍬', 'Ein Bonbon']], correct: 0,
        why: 'Genau! Beim Schwitzen verlierst du Wasser. Das musst du wieder trinken.' },
      { level: 3, q: 'Ein Kind bleibt abends sehr lange wach. Wie fühlt es sich am Morgen?', answers: [['🚀', 'Super fit'], ['🥱', 'Müde und schlapp'], ['🦸', 'Stark wie ein Held']], correct: 1,
        why: 'Richtig! Ohne genug Schlaf ist man müde. Dann fallen Lernen und Spielen schwerer.' },
      { level: 3, q: 'Warum niesen wir in die Armbeuge?', answers: [['🎵', 'Weil es lustig klingt'], ['🙈', 'Damit uns keiner sieht'], ['💪', 'Damit keine Keime an die Hände kommen']], correct: 2,
        why: 'Genau! So fliegen weniger Keime herum. Und deine Hände bleiben sauber.' },
    ],
    play: [
      { type: 'sort', say: 'Was ist gut für jeden Tag, und was gibt es nur ab und zu? Sortiere!', groups: [['😊', 'Jeden Tag'], ['🤏', 'Nur ab und zu']],
        items: [['🍎', 'Apfel', 0], ['🥕', 'Karotte', 0], ['🍌', 'Banane', 0], ['💧', 'Wasser', 0], ['🍭', 'Lutscher', 1], ['🍰', 'Kuchen', 1], ['🍟', 'Pommes', 1], ['🥤', 'Limonade', 1]] },
      { type: 'order', say: 'Wie wäschst du deine Hände richtig? Lege die Bilder in die richtige Reihenfolge!',
        items: [['🚰', 'Hände nass machen'], ['🧼', 'Mit Seife einseifen'], ['👏', 'Die Hände gut aneinander reiben'], ['💧', 'Die Seife abspülen'], ['🧻', 'Die Hände gut abtrocknen']] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🪥', s: 'Zähneputzen ist nur am Morgen wichtig.', ok: false, why: 'Nein! Morgens und abends putzen ist wichtig. Am Abend besonders gründlich.' },
        { e: '💧', s: 'Wasser ist ein super Durstlöscher.', ok: true, why: 'Richtig! Wasser löscht den Durst am besten.' },
        { e: '😴', s: 'Kinder brauchen weniger Schlaf als Erwachsene.', ok: false, why: 'Nein, Kinder brauchen sogar mehr Schlaf. Im Schlaf wachsen sie.' },
        { e: '🦠', s: 'Keime kann man mit bloßen Augen sehen.', ok: false, why: 'Nein, Keime sind winzig klein. Man sieht sie nur mit einem Mikroskop.' },
        { e: '🚲', s: 'Bewegung macht Herz und Muskeln stark.', ok: true, why: 'Stimmt! Wer sich viel bewegt, wird stark und fit.' },
        { e: '🥦', s: 'Gemüse steckt voller Vitamine.', ok: true, why: 'Richtig! Vitamine helfen deinem Körper, gesund zu bleiben.' },
      ] },
    ],
    facts: [
      { e: '🪥', text: 'Putze deine Zähne morgens und abends, jedes Mal zwei Minuten lang.' },
      { e: '🧼', text: 'Händewaschen mit Seife schützt vor Krankheiten. Seife deine Hände so lange ein, wie ein kurzes Lied dauert.' },
      { e: '🦷', text: 'Der Zahnschmelz ist der härteste Stoff in deinem Körper. Er ist noch härter als Knochen.' },
    ],
  });

  /* ------------------------------------------------------------------
     4) Helfer im Notfall
     ------------------------------------------------------------------ */
  add({
    id: 'w-helfer',
    theme: 'mensch',
    title: 'Helfer im Notfall',
    icon: '🚒',
    intro: 'Heute lernen wir Menschen kennen, die anderen helfen. Und du lernst, wie du selbst Hilfe holst.',
    parent: {
      skill: 'Sachwissen und Sicherheitserziehung: Berufe, die helfen (Feuerwehr, Polizei, Ärztin, Rettungsdienst), Notruf und richtiges Verhalten',
      goal: 'Das Kind kennt die wichtigsten Helferberufe und ihre Werkzeuge, weiß, dass es zuerst einen Erwachsenen holt, kennt den Notruf eins-eins-zwei (Feuerwehr und Rettungsdienst) und eins-eins-null (Polizei) und weiß, was man am Telefon sagt.',
      levels: [
        'Stufe 1: Bildergeschichte zum Mitmachen, Helferberufe erkennen; Werkzeuge der Feuerwehr und der Ärztin sortieren',
        'Stufe 2: Blaulicht und Platz machen, was man beim Notruf sagt, Stethoskop, Aufgaben der Feuerwehr; die Schritte beim Notruf ordnen',
        'Stufe 3: Denkfragen zu Rauch, Notruf nur im Ernstfall, verloren gehen und eigene Adresse; Aussagen prüfen (auch: bei Feuer nie verstecken)',
      ],
      tip: 'Üben Sie mit Ihrem Kind spielerisch einen Notruf mit einem Spielzeugtelefon: Wer bin ich, wo bin ich, was ist passiert? Lernen Sie gemeinsam Vor- und Nachnamen, Straße und Wohnort auswendig, zum Beispiel als kleinen Reim. Ein Besuch beim Tag der offenen Tür der örtlichen Feuerwehr macht die Helfer greifbar und nimmt Ängste.',
    },
    story: [
      { scene: ['👩‍🚒', '🚒'], say: 'Das ist eine Feuerwehrfrau. Die Feuerwehr löscht Brände und rettet Menschen und Tiere.',
        tap: { index: 1, say: 'Tippe auf das Feuerwehrauto!', done: 'Tatü tata! Mit Blaulicht und Sirene fährt die Feuerwehr schnell los.' } },
      { scene: ['👮‍♂️', '🚓'], say: 'Das ist ein Polizist. Die Polizei passt auf, dass alle Menschen sicher sind.',
        tap: { index: 1, say: 'Tippe auf das Polizeiauto!', done: 'Genau! Die Polizei hilft auch Kindern, die ihre Eltern verloren haben.' } },
      { scene: ['👩‍⚕️', '🩺'], say: 'Das ist eine Ärztin. Sie hilft, wenn jemand krank oder verletzt ist.',
        tap: { index: 1, say: 'Tippe auf das Stethoskop!', done: 'Damit hört die Ärztin dein Herz und deine Lunge ab.' } },
      { scene: ['🚑', '🩹'], say: 'Im Krankenwagen kommen Sanitäterinnen und Sanitäter. Sie helfen gleich dort, wo etwas passiert ist.',
        tap: { index: 0, say: 'Tippe auf den Krankenwagen!', done: 'Super! Im Krankenwagen ist alles, was die Helfer brauchen.' } },
      { scene: ['📱', '1️⃣', '1️⃣', '2️⃣'], say: 'Braucht jemand Hilfe, holst du zuerst einen Erwachsenen. Ist keiner da, rufst du die eins-eins-zwei an.',
        tap: { index: 0, say: 'Tippe auf das Telefon!', done: 'Eins, eins, zwei. Dann kommen Feuerwehr oder Krankenwagen.' } },
      { scene: ['🧒', '🗣️', '🏠'], say: 'Am Telefon sagst du, wer du bist, wo du bist und was passiert ist. Leg erst auf, wenn die Person am Telefon es sagt.' },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Wer löscht ein Feuer?', answers: [['👩‍🍳', 'Die Köchin'], ['🚒', 'Die Feuerwehr'], ['📬', 'Die Post']], correct: 1,
        why: 'Genau! Die Feuerwehr löscht Feuer mit Wasser und Schaum.' },
      { level: 1, q: 'Zu wem gehst du, wenn du krank bist?', answers: [['👩‍⚕️', 'Zur Ärztin'], ['👩‍🚒', 'Zur Feuerwehr'], ['👨‍🌾', 'Zum Bauern']], correct: 0,
        why: 'Richtig! Ärztinnen und Ärzte helfen dir, wieder gesund zu werden.' },
      { level: 1, q: 'Wann rufst du die eins-eins-zwei an?', answers: [['🍦', 'Wenn ich ein Eis möchte'], ['🧸', 'Wenn ich spielen will'], ['🔥', 'Wenn es brennt']], correct: 2,
        why: 'Genau! Wenn es brennt, holst du zuerst einen Erwachsenen. Die eins-eins-zwei ist der Notruf für Feuerwehr und Krankenwagen.' },
      { level: 1, q: 'Wer hilft dir, wenn du dich verlaufen hast?', answers: [['👮‍♀️', 'Eine Polizistin'], ['🐶', 'Ein Hund'], ['🦆', 'Eine Ente']], correct: 0,
        why: 'Richtig! Die Polizei hilft Kindern, ihre Familie wiederzufinden.' },
      { level: 1, q: 'Womit fährt die Feuerwehr zum Einsatz?', answers: [['🚲', 'Mit dem Fahrrad'], ['🚒', 'Mit dem Feuerwehrauto'], ['🛶', 'Mit dem Kanu']], correct: 1,
        why: 'Super! Im Feuerwehrauto sind Schläuche, Leitern und viel Wasser.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Ein Auto mit Blaulicht und Sirene kommt. Was machen die anderen Autos?', answers: [['🚗', 'Sie machen Platz'], ['🏁', 'Sie fahren um die Wette'], ['🎺', 'Sie hupen laut']], correct: 0,
        why: 'Genau! So kommen die Helfer schnell zu dem Menschen, der Hilfe braucht.' },
      { level: 2, q: 'Was sagst du am Telefon beim Notruf?', answers: [['🎵', 'Ein Lied'], ['🏠', 'Wer ich bin, wo ich bin und was passiert ist'], ['🍕', 'Was ich essen möchte']], correct: 1,
        why: 'Richtig! Dann wissen die Helfer, wohin sie fahren müssen.' },
      { level: 2, q: 'Was macht die Ärztin mit dem Stethoskop?', answers: [['📏', 'Sie misst, wie groß du bist'], ['✂️', 'Sie schneidet Haare'], ['👂', 'Sie hört Herz und Lunge ab']], correct: 2,
        why: 'Genau! Sie hört, wie dein Herz schlägt und wie du atmest.' },
      { level: 2, q: 'Was macht die Feuerwehr noch, außer Feuer zu löschen?', answers: [['🐱', 'Sie rettet auch Tiere'], ['🎂', 'Sie backt Kuchen'], ['✉️', 'Sie bringt Briefe']], correct: 0,
        why: 'Richtig! Die Feuerwehr hilft auch bei Unfällen und Hochwasser. Manchmal holt sie eine Katze vom Baum.' },
      { level: 2, q: 'Wann legst du beim Notruf auf?', answers: [['🏃', 'Sofort, ganz schnell'], ['🗣️', 'Wenn die Person am Telefon es sagt'], ['🥱', 'Wenn mir langweilig ist']], correct: 1,
        why: 'Genau! Die Person am Telefon hat vielleicht noch Fragen. Darum bleibst du dran.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Du siehst Rauch aus einem Fenster kommen. Was tust du zuerst?', answers: [['🧑', 'Einem Erwachsenen Bescheid sagen'], ['🧸', 'Einfach weiterspielen'], ['🙈', 'Nichts sagen']], correct: 0,
        why: 'Genau! Ein Erwachsener kann sofort die eins-eins-zwei anrufen. Du bleibst weg vom Rauch.' },
      { level: 3, q: 'Warum ruft man den Notruf nicht zum Spaß an?', answers: [['📺', 'Sonst geht das Telefon kaputt'], ['🚑', 'Dann fehlen die Helfer bei einem echten Notfall'], ['🎉', 'Doch, das ist ein lustiges Spiel']], correct: 1,
        why: 'Richtig! Der Notruf ist nur für echte Notfälle. So sind die Helfer immer bereit.' },
      { level: 3, q: 'Du hast deine Eltern im Gedränge verloren. Was ist klug?', answers: [['🏃', 'Allein weit weglaufen'], ['🙈', 'Sich verstecken'], ['🧍', 'Stehen bleiben und um Hilfe bitten']], correct: 2,
        why: 'Genau! Bleib, wo du bist, und frag eine Polizistin oder eine Verkäuferin. Deine Eltern suchen dich.' },
      { level: 3, q: 'Warum ist es gut, deine Adresse auswendig zu können?', answers: [['🏠', 'Dann finden die Helfer zu mir'], ['🍰', 'Dann bekomme ich Kuchen'], ['🎮', 'Dann darf ich länger spielen']], correct: 0,
        why: 'Richtig! Übe deine Adresse mit deinen Eltern. Dann kannst du sie im Notfall sagen.' },
    ],
    play: [
      { type: 'sort', say: 'Was braucht die Feuerwehr, und was braucht die Ärztin? Sortiere!', groups: [['👩‍🚒', 'Feuerwehr'], ['👩‍⚕️', 'Ärztin']],
        items: [['🧯', 'Feuerlöscher', 0], ['🪜', 'Leiter', 0], ['🚒', 'Feuerwehrauto', 0], ['🩺', 'Stethoskop', 1], ['🩹', 'Pflaster', 1], ['🌡️', 'Fieberthermometer', 1]] },
      { type: 'order', say: 'So holst du Hilfe am Telefon! Lege die Schritte in die richtige Reihenfolge!',
        items: [['🧑', 'Einen Erwachsenen holen'], ['📱', 'Ist keiner da, die eins-eins-zwei wählen'], ['🧒', 'Sagen, wer du bist'], ['🗣️', 'Sagen, wo du bist und was passiert ist'], ['👂', 'Gut zuhören und erst auflegen, wenn es die Person sagt']] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🚒', s: 'Die Feuerwehr hilft auch bei Unfällen und rettet Tiere.', ok: true, why: 'Richtig! Die Feuerwehr hilft bei vielen Notfällen.' },
        { e: '📱', s: 'Den Notruf darf man zum Spaß anrufen.', ok: false, why: 'Nein! Der Notruf ist nur für echte Notfälle.' },
        { e: '👮‍♀️', s: 'Die Polizei hat die Nummer eins-eins-null.', ok: true, why: 'Richtig! Feuerwehr und Krankenwagen rufst du mit der eins-eins-zwei.' },
        { e: '🔥', s: 'Bei Feuer versteckt man sich am besten unter dem Bett.', ok: false, why: 'Nein! Geh schnell nach draußen und sag einem Erwachsenen Bescheid.' },
        { e: '🏠', s: 'Es ist gut, die eigene Adresse auswendig zu können.', ok: true, why: 'Stimmt! Dann finden die Helfer schnell zu dir.' },
        { e: '🗣️', s: 'Beim Notruf legt man sofort wieder auf.', ok: false, why: 'Nein, bleib am Telefon. Die Person hat vielleicht noch Fragen.' },
      ] },
    ],
    facts: [
      { e: '📱', text: 'Mit der Nummer eins-eins-zwei rufst du Feuerwehr und Krankenwagen. Der Anruf ist kostenlos.' },
      { e: '🚒', text: 'Viele Feuerwehrleute helfen freiwillig in ihrer Freizeit. Sie gehören zur Freiwilligen Feuerwehr.' },
      { e: '🌍', text: 'Die eins-eins-zwei hilft dir in vielen Ländern. Auch im Urlaub kannst du damit Hilfe rufen.' },
    ],
  });
})();
