/* ==========================================================================
   LT.reise – „Flos Reise“: ein schrittweiser Lernpfad durch acht Orte.

   Didaktik (Spiralcurriculum nach Bruner, Mastery-Lernpfad):
   - Jede Fähigkeit taucht zuerst auf der leichtesten Stufe auf und kommt in
     späteren Kapiteln auf höherer Stufe wieder (z. B. Zählen 1 → Zählen 2 →
     Mengen vergleichen → Zahlenhaus → Rechnen).
   - Jedes Kapitel mischt die Lernwelten (Zahlen, Sprache, Formen, Denken,
     Wissen, Malen) → verschachteltes Üben statt Block-Üben.
   - Eine Station gilt als geschafft, sobald eine Runde beendet ist (Dranbleiben
     zählt). So bleibt der Pfad angstfrei; die adaptive Stufe der Spiele sorgt
     weiter für die passende Schwierigkeit.
   - Kapitel-Einleitung und Schatzkisten-Geschichte geben einen roten Faden
     (narratives Lernen) und belohnen mit einem Bonus-Sticker.

   Persönlicher Teil – „Flos Tipp“ (bis zu drei freiwillige Extra-Stationen,
   oben auf dem Reise-Bildschirm, aus den Daten des Kindes berechnet):
   - Wiederholen: gespieltes Spiel mit den meisten fälligen Inhalten (≥ 2,
     verteiltes Wiederholen, siehe LT.progress.itemSummary),
   - Üben: gespieltes Spiel aus dem schwächsten Bereich (Status 'practice'
     bzw. geringste Trefferquote), auf der aktuellen Stufe des Kindes,
   - Stärke: Erfolgsspiel (Status 'solid' bzw. hohe Trefferquote) für ein
     sicheres Erfolgserlebnis.
   Die Auswahl bleibt für den Tag stabil, blockiert die Reise nie und gibt
   nach der Runde ganz normal Sterne. Vor neuen Kapitel-Stationen gibt es
   bewusst nichts zusätzlich: Das Aufwärmen mit Bekanntem macht die Engine.

   Teil 2 „Flos Schulabenteuer“ (SCHOOL_CHAPTERS, Klasse 1): sieben Kapitel
   mit den Schulspielen und Film-Stationen ['film', filmId] (= Spiel
   'film-<filmId>' aus Flos Kino) direkt vor dem passenden Übungsspiel.
   Frei, sobald die Lernstufe „Klasse 1“ eingestellt oder Teil 1 geschafft
   ist (R.schoolUnlocked); sonst darf man hineinschauen, der Startknopf
   öffnet aber Teil 1. Teil 2 speichert unter LT.store('reise-schule').

   Fehlende Spiele (z. B. noch nicht vorhandene Forscherwelt-Reisen) werden
   einfach übersprungen. Gespeichert wird (Teil 1) in LT.store('reise'):
     { done: { 'spiel@stufe': true }, chests: { kapitelId: true }, intros: { kapitelId: true },
       tips: { date, picks: { art: spielId }, done: { art: true }, told: { art: true }, hello } }

   ALLE gesprochenen Sätze sind feste Texte (vorab aufgenommene Stimme).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* ------------------------------------------------------------------
     Kapitel und Stationen  [Spiel-ID, Stufe]
     ------------------------------------------------------------------ */
  const CHAPTERS = [
    {
      id: 'wald',
      title: 'Zauberwald',
      icon: '🌳',
      color: '#2f9e5f',
      soft: '#dcf5e4',
      deco: ['🍄', '🦉', '🌲', '🦔', '🍂', '🐿️'],
      intro: 'Wir sind im Zauberwald. Hier wohnen kluge Eulen und flinke Eichhörnchen. Hilf mir, die Rätsel zu lösen!',
      story: 'Hurra, du hast alle Rätsel im Zauberwald gelöst! Die kluge Eule ist sehr stolz auf dich. Sie schenkt dir einen glitzernden Schatz. Komm mit, wir wandern weiter zum Bauernhof!',
      focus: 'Erste Schritte: Zählen bis 5, Farben, Reime hören, Gefühle, Silben klatschen, Merken, Schwungübungen und die erste Wissensreise.',
      stations: [['zaehlen', 1], ['farben', 1], ['reime', 1], ['w-schmetterling', 1], ['memory', 1], ['gefuehle', 1], ['silben', 1], ['nachspuren', 1]],
    },
    {
      id: 'hof',
      title: 'Bauernhof',
      icon: '🚜',
      color: '#e07b24',
      soft: '#ffecd6',
      deco: ['🐄', '🐔', '🌻', '🐷', '🐑', '🌾'],
      intro: 'Wir sind auf dem Bauernhof. Hier leben Kühe, Hühner und viele Tierkinder. Die Bäuerin braucht heute deine Hilfe!',
      story: 'Toll, du hast der Bäuerin überall geholfen! Die Tiere sind satt und zufrieden. Als Dank bekommst du einen Schatz. Jetzt reisen wir weiter ans Meer!',
      focus: 'Mengen auf einen Blick, Anlaute, Grundformen, Klassifizieren, Raum-Lage-Begriffe, Zählen bis 10 sowie Tierkinder und Pflanzenwachstum.',
      stations: [['blitzblick', 1], ['w-tierkinder', 1], ['anlaut', 1], ['formen', 1], ['w-pflanzen', 1], ['passt-nicht', 1], ['raumlage', 1], ['zaehlen', 2]],
    },
    {
      id: 'meer',
      title: 'Meeresküste',
      icon: '🏖️',
      color: '#1a8fc4',
      soft: '#d6effb',
      deco: ['🐚', '🦀', '⛵', '🐬', '🌊', '🐠'],
      intro: 'Wir sind an der Meeresküste. Hier rauschen die Wellen und Krabben laufen über den Sand. Lass uns zusammen den Strand erforschen!',
      story: 'Wunderbar, du hast die ganze Küste erforscht! Ein freundlicher Delfin bringt dir eine Schatzkiste. Darin liegt ein Geschenk für dich. Am Horizont sehen wir schon hohe Berge!',
      focus: 'Mengen vergleichen, Reime auf Stufe 2, Muster fortsetzen, Ziffern erkennen, Figur-Grund-Wahrnehmung, Tier-Wissen und Lebensräume.',
      stations: [['mengen-vergleich', 1], ['reime', 2], ['w-lebensraeume', 1], ['muster', 1], ['tiere', 1], ['zahlen-erkennen', 1], ['schatten', 1]],
    },
    {
      id: 'berge',
      title: 'Berge',
      icon: '⛰️',
      color: '#6f5fd0',
      soft: '#e6e2ff',
      deco: ['🦅', '🌲', '🐐', '☁️', '🏔️', '🌼'],
      intro: 'Wir sind in den Bergen. Hier oben ist die Luft frisch und klar. Gemeinsam klettern wir bis zum Gipfel!',
      story: 'Juhu, wir sind auf dem Gipfel angekommen! Von hier oben kann man ganz weit sehen. Ein Adler hat dir einen Schatz gebracht. Dort unten glitzert schon der Sand der Wüste!',
      focus: 'Spirale: Blitzblick und Silben auf Stufe 2. Neu: Größen ordnen, Gegenteile, Kim-Spiel, Zahlenreihe sowie die fünf Sinne und das Wetter.',
      stations: [['blitzblick', 2], ['silben', 2], ['w-sinne', 1], ['groessen', 1], ['gegensaetze', 1], ['was-fehlt', 1], ['w-wetter', 1], ['zahlenreihe', 1]],
    },
    {
      id: 'wueste',
      title: 'Wüste',
      icon: '🏜️',
      color: '#c98a12',
      soft: '#fff0c9',
      deco: ['🐪', '🌵', '☀️', '🦎', '🌴', '🦂'],
      intro: 'Wir sind in der Wüste. Hier ist es heiß und sandig. Die Kamele zeigen uns den Weg zur Oase.',
      story: 'Geschafft, wir haben die Oase gefunden! Das Kamel freut sich über das frische Wasser. Im Sand hast du eine Schatzkiste entdeckt. Jetzt wird es kalt, wir reisen in die Eiswelt!',
      focus: 'Spirale: Ziffern, Anlaute und die Schmetterlings-Reise auf Stufe 2 (Fachbegriffe als Grundlage für die Experten-Stufe im Schloss). Neu: was in unserem Körper passiert, zeitliche Reihenfolgen, Dinosaurier, Zahlzerlegung und Punkte verbinden.',
      stations: [['zahlen-erkennen', 2], ['anlaut', 2], ['w-koerper-innen', 1], ['reihenfolge', 1], ['w-schmetterling', 2], ['w-dinos', 1], ['zahlenhaus', 1], ['punkte-verbinden', 1]],
    },
    {
      id: 'eis',
      title: 'Eiswelt',
      icon: '❄️',
      color: '#2aa3bd',
      soft: '#d8f4fa',
      deco: ['🐧', '❄️', '⛄', '🐋', '🧊', '🌨️'],
      intro: 'Wir sind in der Eiswelt. Hier ist alles weiß von Schnee und Eis. Die Pinguine wollen mit dir spielen!',
      story: 'Prima, die Pinguine sind begeistert von dir! Du hast alle Aufgaben im Schnee geschafft. Unter dem Eis wartet ein funkelnder Schatz. Jetzt fliegen wir mit einer Rakete ins Weltall!',
      focus: 'Spirale: Mengenvergleich auf Stufe 2. Neu: Jahreszeiten, Silben verbinden, Gesundheit, logisches Schließen, Umweltschutz, Verkehrserziehung und erstes Rechnen.',
      stations: [['mengen-vergleich', 2], ['jahreszeiten', 1], ['roboter', 1], ['w-gesund', 1], ['bilder-sudoku', 1], ['w-umwelt', 1], ['verkehr', 1], ['rechnen', 1]],
    },
    {
      id: 'weltall',
      title: 'Weltraum',
      icon: '🚀',
      color: '#3d3f9a',
      soft: '#e3e4ff',
      deco: ['🌙', '⭐', '🪐', '☄️', '🛰️', '✨'],
      intro: 'Wir sind im Weltraum. Hier funkeln die Sterne und die Erde ist ganz klein. Schnall dich an, die Sternenreise beginnt!',
      story: 'Super, du kennst dich jetzt im Weltraum aus! Wir haben Planeten und Sterne besucht. Ein Komet bringt dir einen Schatz. Nun landen wir beim Schloss des Wissens!',
      focus: 'Spirale: Zahlenreihe, Memory und Zahlenhaus auf Stufe 2. Neu: Buchstaben, Oberbegriffe, Tonfolgen merken, die Uhr und das Weltall.',
      stations: [['zahlenreihe', 2], ['buchstaben', 1], ['w-weltall', 1], ['memory', 2], ['oberbegriffe', 1], ['toene-merken', 1], ['uhr', 1], ['zahlenhaus', 2]],
    },
    {
      id: 'schloss',
      title: 'Schloss des Wissens',
      icon: '🏰',
      color: '#cf4a86',
      soft: '#ffe0ee',
      deco: ['👑', '📚', '🔭', '🎈', '🦄', '🎺'],
      intro: 'Wir sind am Schloss des Wissens. Hier warten die schwierigsten Rätsel der ganzen Reise. Du hast schon so viel gelernt, du schaffst das!',
      story: 'Hurra, du hast die ganze Reise geschafft! Im Schloss des Wissens feiern alle ein großes Fest. Du hast so viel gelernt und nie aufgegeben. Dafür bekommst du den größten Schatz!',
      focus: 'Meisterstufe: Helfer und Notruf, Rechnen, Buchstaben und Bilder-Sudoku auf Stufe 2, erstes Lesen sowie Vertiefungs-Stufen der Wissensreisen aus Kapitel 2 und 7 sowie die Experten-Stufe der Schmetterlings-Reise (Kapitel 1 Stufe 1, Kapitel 5 Stufe 2).',
      stations: [['w-helfer', 1], ['rechnen', 2], ['w-tierkinder', 2], ['buchstaben', 2], ['bilder-sudoku', 2], ['erstes-lesen', 1], ['w-weltall', 2], ['w-schmetterling', 3]],
    },
  ];
  CHAPTERS.find((c) => c.id === 'weltall').dark = true;

  /* ------------------------------------------------------------------
     Teil 2 – „Flos Schulabenteuer“ (Brücke Vorschule → Ende Klasse 1)
     Stationen wie oben [Spiel-ID, Stufe]; ['film', filmId] ist eine
     Film-Station (Spiel 'film-<filmId>' aus Flos Kino) und steht direkt
     vor dem passenden Übungsspiel. Spirale: die Schulspiele steigen von
     Kapitel zu Kapitel um höchstens eine Stufe (nie eine Stufe, deren
     Vorstufen das Kind nicht schon kennt); dazwischen Kita-Spiele als
     Brücke, höchstens zwei Stufen über dem, was Teil 1 verlangt hat
     (Teil 1: Rechnen 2, Erstes Lesen 1, Jahreszeiten 1, Uhr 1). Filme
     stehen vor dem Spiel, dessen Stufe genau den Filminhalt übt
     (Zähne → Körper-Labor 3, Uhrzeit → Uhr 3, Igel → Jahreszeiten 3).
     Noch fehlende Spiele/Filme werden übersprungen und erscheinen
     automatisch, sobald es sie gibt.
     ------------------------------------------------------------------ */
  const SCHOOL_CHAPTERS = [
    {
      id: 'klasse',
      title: 'Erster Schultag',
      icon: '🎒',
      color: '#e8590c',
      soft: '#ffe8d6',
      deco: ['✏️', '📏', '🍎', '🖍️', '📓', '🧮'],
      intro: 'Heute ist dein erster Schultag! Wir sind im Klassenzimmer. Hier lernen wir rechnen, lesen und den sicheren Schulweg. Ich bin schon ganz aufgeregt!',
      story: 'Hurra, dein erster Schultag war ein voller Erfolg! Die Lehrerin ist sehr stolz auf dich. In deiner Schultüte liegt ein Schatz. Jetzt gehen wir in die Bücherei!',
      focus: 'Schulstart: Zehnerfeld und Kraft der Fünf, Silben lesen, Nachbarzahlen, Laute hören, sicherer Schulweg; dazu Minus bis 10 aus der Kita-Welt als Brücke. Erklärfilme: Kraft der Zehn, Silben, Schulweg.',
      stations: [['film', 'kraft-der-zehn'], ['zehnerfeld', 1], ['film', 'silben'], ['silbenlesen', 1], ['zahlen-nachbarn', 1], ['hoerkoenig', 1], ['film', 'schulweg'], ['schulweg', 1], ['rechnen', 4]],
    },
    {
      id: 'buecherei',
      title: 'Bücherei',
      icon: '📚',
      color: '#5f3dc4',
      soft: '#e5dbff',
      deco: ['📖', '🦉', '🔖', '🐛', '📚', '🪑'],
      intro: 'Wir sind in der Bücherei. Hier stehen ganz viele Bücher mit spannenden Geschichten. Der Bücherwurm zeigt uns, wie man Wörter liest und schreibt. Und in einem Sachbuch entdecken wir unsere Sinne.',
      story: 'Toll, du hast in der Bücherei schon richtig viel gelesen! Der Bücherwurm schenkt dir ein Lesezeichen und einen Schatz. Komm mit, wir gehen auf den Marktplatz!',
      focus: 'Blitzwörter, Wörter lautgetreu schreiben (Erklärfilm), Plus bis 20 mit der „kleinen Schwester“-Aufgabe (3 + 4 → 13 + 4), dreisilbige Wörter lesen, Leseverständnis Wort–Bild, Zehnerfeld schneller, die fünf Sinne; dazu Erstes Lesen mit langen Wörtern.',
      stations: [['blitzwoerter', 1], ['film', 'wort-schreiben'], ['schreibwerkstatt', 1], ['rechenrakete', 1], ['silbenlesen', 2], ['lesedetektiv', 1], ['zehnerfeld', 2], ['erstes-lesen', 3], ['koerperlabor', 1]],
    },
    {
      id: 'markt',
      title: 'Marktplatz',
      icon: '🛒',
      color: '#2f9e44',
      soft: '#d3f9d8',
      deco: ['🍎', '🥕', '🧀', '💶', '🌻', '🥨'],
      intro: 'Wir sind auf dem Marktplatz. Hier gibt es Äpfel, Brezeln und Blumen. Heute bezahlen wir mit Geld und rechnen ganz schlau.',
      story: 'Super, du hast auf dem Markt prima eingekauft und richtig bezahlt! Die Marktfrau schenkt dir einen roten Apfel und einen Schatz. Jetzt besuchen wir das Forscherlabor!',
      focus: 'Geld erkennen und bezahlen (Erklärfilm), Verdoppeln (Erklärfilm), Nachbarzahlen bis 20, Laute im Wort, Analogieaufgaben ohne Bildstütze, mehr Blitzwörter, Zwanzigerfeld.',
      stations: [['film', 'geld'], ['kaufladen', 1], ['film', 'verdoppeln'], ['verdoppeln', 1], ['zahlen-nachbarn', 2], ['hoerkoenig', 2], ['rechenrakete', 2], ['blitzwoerter', 2], ['zehnerfeld', 3]],
    },
    {
      id: 'labor',
      title: 'Forscherlabor',
      icon: '🔬',
      color: '#1971c2',
      soft: '#d0ebff',
      deco: ['🧪', '🔍', '💧', '🧲', '🦷', '⚗️'],
      intro: 'Wir sind im Forscherlabor. Hier machen wir Experimente wie echte Forscher. Wir vermuten, probieren aus und erklären.',
      story: 'Wunderbar, du bist ein echter Forscher! Alle Experimente haben geklappt. Im Labor wartet ein glitzernder Schatz auf dich. Jetzt gehen wir in den Schulgarten!',
      focus: 'Schwimmen und Sinken, Zähne putzen mit KAI und Zahnwissen (je mit Erklärfilm), Sätze bauen (Erklärfilm Satz-Zug: Großschreibung und Punkt), Tausch- und Umkehraufgaben, geschlossene Silben lesen, längere Wörter schreiben.',
      stations: [['film', 'schwimmen-sinken'], ['schwimmen-sinken', 1], ['film', 'zaehne'], ['koerperlabor', 3], ['film', 'satz-zug'], ['satzbaumeister', 1], ['aufgabenfamilie', 1], ['silbenlesen', 3], ['schreibwerkstatt', 2]],
    },
    {
      id: 'garten',
      title: 'Schulgarten',
      icon: '🌳',
      color: '#5c940d',
      soft: '#e9fac8',
      deco: ['🌱', '🐞', '🦔', '🍂', '🌻', '🐝'],
      intro: 'Wir sind im Schulgarten. Hier wachsen Blumen und Gemüse, und unter dem Laub wohnt ein kleiner Igel. Komm, wir helfen beim Gärtnern!',
      story: 'Prima, der Schulgarten blüht und der Igel hat ein warmes Nest! Du hast fleißig geholfen. Unter den Blättern liegt ein Schatz für dich. Jetzt machen wir einen Klassenausflug!',
      focus: 'Zehnerübergang mit der Brücke (Erklärfilm), Tiere im Winter (Erklärfilm) und der Jahreskreislauf, Müll trennen, Namenwörter erkennen, Sätze sinnentnehmend lesen, Zahlenmauern, Verdoppeln bis 10 + 10.',
      stations: [['film', 'ueber-die-zehn'], ['zehnerbruecke', 1], ['film', 'igel-winter'], ['jahreszeiten', 3], ['muell', 1], ['wortarten', 1], ['lesedetektiv', 2], ['zahlenmauer', 1], ['verdoppeln', 2]],
    },
    {
      id: 'ausflug',
      title: 'Klassenausflug',
      icon: '🚌',
      color: '#e67700',
      soft: '#fff3bf',
      deco: ['🚌', '🗺️', '🥪', '⏰', '🦆', '🌳'],
      intro: 'Heute machen wir einen Klassenausflug! Wir fahren mit dem Bus in den Park. Damit wir den Bus zurück nicht verpassen, schauen wir oft auf die Uhr.',
      story: 'Juhu, was für ein schöner Ausflug! Alle Kinder sind pünktlich wieder am Bus. Der Busfahrer hat einen Schatz für dich. Jetzt feiern wir das große Schulfest!',
      focus: 'Uhrzeit mit vollen und halben Stunden (Erklärfilm, danach die halbe Stunde auf der Uhr finden), Zehnerübergang mit 7 und 8, Rechengeschichten, Zebrastreifen und Blickrichtung, längere Sätze, Blitzwörter, Geld mit Schein, Aufgabenfamilien ohne Bilder.',
      stations: [['film', 'uhrzeit'], ['uhr', 3], ['zehnerbruecke', 2], ['sachrechnen', 1], ['schulweg', 2], ['satzbaumeister', 2], ['blitzwoerter', 3], ['kaufladen', 2], ['aufgabenfamilie', 2]],
    },
    {
      id: 'fest',
      title: 'Schulfest',
      icon: '🏆',
      color: '#d6336c',
      soft: '#ffdeeb',
      deco: ['🎈', '🎪', '🎉', '🥇', '🎵', '🍰'],
      intro: 'Heute ist das große Schulfest! Es gibt Spiele, Musik und Kuchen. Hier warten die schwierigsten Aufgaben des Schuljahres. Du hast so viel gelernt, du schaffst das!',
      story: 'Hurra, du hast das ganze Schulabenteuer geschafft! Beim Schulfest jubeln alle Kinder für dich. Du hast so viel gelernt und nie aufgegeben. Dafür bekommst du den größten Schatz!',
      focus: 'Meisterstufe Klasse 1: Zehnerübergang frei, Silbenlesen mit sch, ei, au, Zahlenmauern bis 20, Präpositionen lesen, Rechengeschichten mit Wegnehmen, Konsonantenhäufungen schreiben, Minus mit der „kleinen Schwester“ (17 − 4), Tunwörter, Laute weglassen.',
      stations: [['zehnerbruecke', 3], ['silbenlesen', 4], ['zahlenmauer', 2], ['lesedetektiv', 3], ['sachrechnen', 2], ['schreibwerkstatt', 3], ['rechenrakete', 3], ['wortarten', 2], ['hoerkoenig', 3]],
    },
  ];

  /* Teile der Reise. Teil 1 speichert weiter unter 'reise' (bestehender
     Fortschritt bleibt erhalten), Teil 2 unter 'reise-schule'. */
  const JOURNEYS = {
    reise: {
      id: 'reise', part: 1, store: 'reise', title: 'Flos Reise', tab: 'Teil 1: Flos Reise', icon: '🗺️', goal: '🏰',
      area: '#ef7d32', areaSoft: '#ffe6d3', className: '', chapters: CHAPTERS, say: {},
    },
    schule: {
      id: 'schule', part: 2, store: 'reise-schule', title: 'Flos Schulabenteuer', tab: 'Teil 2: Schulabenteuer', icon: '🎒', goal: '🏆',
      area: '#1c7ed6', areaSoft: '#dbeafe', className: 'is-schule', chapters: SCHOOL_CHAPTERS,
      say: {
        welcome: 'Das ist unser Schulabenteuer! Tippe auf die leuchtende Station.',
        back: 'Weiter geht unser Schulabenteuer! Tippe auf die leuchtende Station.',
        tap: 'Tippe auf die leuchtende Station! Dort geht unser Schulabenteuer weiter.',
        finished: 'Du hast das ganze Schulabenteuer geschafft! Du bist ein echtes Schulkind. Du kannst jede Station nochmal spielen.',
        tipThanks: 'Toll, du hast meinen Tipp gespielt! Weiter geht unser Schulabenteuer.',
      },
    },
  };
  const JOURNEY_IDS = Object.keys(JOURNEYS);
  const J = (jid) => JOURNEYS[jid] || JOURNEYS.reise;

  /* ------------------------------------------------------------------
     Feste Sätze
     ------------------------------------------------------------------ */
  const SAY = {
    welcome: 'Das ist unsere große Reise! Tippe auf die leuchtende Station.',
    back: 'Weiter geht unsere Reise! Tippe auf die leuchtende Station.',
    hop: [
      'Super gemacht! Ich hüpfe schon zur nächsten Station.',
      'Toll, wieder eine Station geschafft! Weiter geht es!',
      'Prima! Komm mit, wir gehen weiter!',
      'Klasse! Siehst du, wie ich hüpfe? Auf zur nächsten Station!',
    ],
    tap: 'Tippe auf die leuchtende Station! Dort geht unsere Reise weiter.',
    locked: 'Diese Station ist noch verschlossen. Spiel zuerst die leuchtende Station!',
    veiled: 'Dieser Ort ist noch hinter den Wolken versteckt. Schaffe zuerst die Stationen davor!',
    chestLocked: 'Diese Schatzkiste öffnet sich, wenn du alle Stationen geschafft hast.',
    chestReady: 'Du hast alle Stationen geschafft! Tippe auf die Schatzkiste!',
    chestOpened: 'Diese Schatzkiste hast du schon geöffnet.',
    sticker: 'Du bekommst einen Bonus-Sticker für dein Album!',
    stickerFull: 'Du hast schon alle Sticker gesammelt! Du bist ein Superstar!',
    reveal: 'Schau mal, ein neuer Ort ist aufgetaucht!',
    finished: 'Du hast die ganze Reise geschafft! Du kannst jede Station nochmal spielen.',
    replay: 'Das hast du schon geschafft. Wir spielen es gerne nochmal!',
    // Flos Tipp (persönliche Extra-Stationen)
    tipsHello: 'Oben habe ich heute Extra-Tipps für dich. Tippe darauf, wenn du magst.',
    tipsHead: 'Das sind meine Tipps für dich. Du kannst sie spielen, wenn du magst. Die Reise geht auch ohne sie weiter.',
    tipReview: 'Hier üben wir etwas, das du schon kennst, damit du es nicht vergisst.',
    tipPractice: 'Hier üben wir noch ein bisschen. Mit jedem Üben wird es leichter.',
    tipStrength: 'Das kannst du schon richtig gut! Zeig mir, wie toll du das machst.',
    tipDone: 'Diesen Tipp hast du heute schon gespielt. Wir spielen ihn gerne nochmal!',
    tipThanks: 'Toll, du hast meinen Tipp gespielt! Weiter geht unsere Reise.',
    // Teil 1 / Teil 2
    part1: 'Das ist Teil eins: Flos große Reise.',
    part2: 'Das ist Teil zwei: Flos Schulabenteuer.',
    part2Locked: 'Das Schulabenteuer ist für Schulkinder. Schaffe zuerst Teil eins. Hineinschauen darfst du aber schon!',
    part2Reveal: 'Und weißt du was? Jetzt beginnt Teil zwei: Flos Schulabenteuer!',
  };
  const sayOf = (jid, k) => J(jid).say[k] || SAY[k];
  const TIP_KINDS = [
    { kind: 'review', badge: '🔁', label: 'Wiederholen', say: 'tipReview', color: '#2f9e5f' },
    { kind: 'practice', badge: '💪', label: 'Üben', say: 'tipPractice', color: '#1a8fc4' },
    { kind: 'strength', badge: '⭐', label: 'Stärke', say: 'tipStrength', color: '#e0a100' },
  ];

  /* ------------------------------------------------------------------
     Zustand
     ------------------------------------------------------------------ */
  function load(jid) {
    const s = LT.store.get(J(jid).store, null);
    const st = s && typeof s === 'object' ? s : {};
    st.done = st.done || {};
    st.chests = st.chests || {};
    st.intros = st.intros || {};
    return st;
  }
  /** Tages-Zustand der Tipps (gemeinsam für beide Teile, gespeichert bei Teil 1). */
  function tipState() {
    const st = S('reise');
    const today = U.today();
    if (!st.tips || typeof st.tips !== 'object' || st.tips.date !== today) st.tips = { date: today, picks: {}, done: {}, told: {}, hello: false };
    const t = st.tips;
    t.picks = t.picks || {};
    t.done = t.done || {};
    t.told = t.told || {};
    return t;
  }
  const states = {};
  const S = (jid = 'reise') => { jid = J(jid).id; return states[jid] || (states[jid] = load(jid)); };
  const save = (jid = 'reise') => LT.store.set(J(jid).store, S(jid));

  const keyOf = (game, level) => game + '@' + level;
  /** Station aus der Liste: [spiel, stufe] oder ['film', filmId]. */
  const parseStation = ([g, lv]) => (g === 'film' ? { game: 'film-' + lv, level: 1, kind: 'film' } : { game: g, level: lv, kind: 'game' });

  /** Kapitel mit den vorhandenen Stationen (fehlende Spiele werden übersprungen). */
  function chapters(jid = 'reise') {
    return J(jid).chapters.map((ch, index) => {
      const stations = ch.stations
        .map(parseStation)
        .filter((s) => LT.games[s.game] && LT.games[s.game].type !== 'free')
        .map((s) => ({ game: s.game, kind: s.kind, level: U.clamp(s.level, 1, LT.games[s.game].levels || 1), key: keyOf(s.game, s.level), def: LT.games[s.game] }));
      return Object.assign({}, ch, { index, stations, journey: J(jid).id });
    }).filter((ch) => ch.stations.length);
  }

  /** Vollständige Lage eines Teils der Reise: Status je Kapitel und Station. */
  function situation(jid = 'reise') {
    const st = S(jid);
    const chs = chapters(jid);
    let current = null; // { chapter, station | 'chest' }
    chs.forEach((ch, i) => {
      ch.unlocked = i === 0 || !!st.chests[chs[i - 1].id];
      ch.opened = !!st.chests[ch.id];
      ch.doneCount = ch.stations.filter((s) => st.done[s.key]).length;
      ch.complete = ch.doneCount === ch.stations.length;
      const firstOpen = ch.stations.findIndex((s) => !st.done[s.key]);
      ch.stations.forEach((s, k) => {
        if (st.done[s.key]) s.state = 'done';
        else if (!ch.unlocked) s.state = 'locked';
        else if (ch.opened) s.state = 'open'; // nachträglich hinzugekommenes Spiel in einem fertigen Kapitel
        else s.state = k === firstOpen ? 'current' : 'locked';
      });
      if (!current && ch.unlocked && !ch.opened) {
        ch.isCurrent = true;
        current = { chapter: ch, station: ch.complete ? 'chest' : ch.stations[firstOpen] };
      }
    });
    const all = chs.flatMap((c) => c.stations);
    return {
      journey: J(jid).id,
      chapters: chs,
      current,
      total: all.length,
      done: all.filter((s) => st.done[s.key]).length,
      finished: !current,
    };
  }

  /** Teil 1 ganz geschafft? (alle Schatzkisten der acht Kapitel geöffnet) */
  function part1Done() {
    const st = S('reise');
    return CHAPTERS.every((c) => st.chests[c.id]);
  }
  /** Schul-Reihe und Teil 2 frei: Lernstufe „Klasse 1“ ODER Teil 1 geschafft. */
  function schoolUnlocked() {
    const s = LT.progress && LT.progress.settings ? LT.progress.settings() : {};
    return s.stage === 'klasse1' || part1Done();
  }

  /* ------------------------------------------------------------------
     Flos Tipp: persönliche Extra-Stationen aus den Lerndaten
     ------------------------------------------------------------------ */
  function playedGames() {
    const recs = LT.progress.profile.games || {};
    return LT.gameOrder.map((id) => LT.games[id])
      .filter((d) => d && d.type !== 'free' && d.area !== 'kino' && recs[d.id] && recs[d.id].rounds > 0);
  }
  const accOf = (id) => {
    const a = LT.progress.accuracy(id);
    return a == null ? 0.5 : a;
  };
  const CHOOSE = {
    // meiste fällige Inhalte (mindestens 2)
    review(cands) {
      let best = null;
      let bestDue = 1;
      cands.forEach((d) => {
        const due = LT.progress.itemSummary(d.id).due;
        if (due > bestDue) { best = d; bestDue = due; }
      });
      return best;
    },
    // schwächster Bereich: zuerst Spiele mit Status „üben“, dann geringste Trefferquote
    practice(cands, all) {
      const P = LT.progress;
      const areaAcc = {};
      all.forEach((d) => { (areaAcc[d.area] = areaAcc[d.area] || []).push(accOf(d.id)); });
      Object.keys(areaAcc).forEach((a) => { areaAcc[a] = U.sum(areaAcc[a]) / areaAcc[a].length; });
      const list = cands.filter((d) => P.status(d.id) !== 'solid');
      list.sort((a, b) => (P.status(a.id) === 'practice' ? 0 : 1) - (P.status(b.id) === 'practice' ? 0 : 1)
        || areaAcc[a.area] - areaAcc[b.area]
        || accOf(a.id) - accOf(b.id));
      return list[0] || null;
    },
    // Erfolgsspiel: sicher gekonnt oder hohe Trefferquote, gern oft gespielt
    strength(cands) {
      const P = LT.progress;
      const recs = P.profile.games;
      const list = cands.filter((d) => P.status(d.id) === 'solid' || (P.accuracy(d.id) != null && P.accuracy(d.id) >= 0.75));
      list.sort((a, b) => (P.status(a.id) === 'solid' ? 0 : 1) - (P.status(b.id) === 'solid' ? 0 : 1)
        || accOf(b.id) - accOf(a.id)
        || (recs[b.id].rounds || 0) - (recs[a.id].rounds || 0));
      return list[0] || null;
    },
  };

  /**
   * Bis zu drei Tipps für heute: [{ kind, badge, label, say, color, game, def, done }].
   * Einmal gewählte Tipps bleiben den ganzen Tag gleich (auch nach dem Spielen).
   */
  function tips(sit) {
    const all = playedGames();
    if (!all.length) return [];
    const t = tipState();
    sit = sit || situation();
    const curGame = sit.current && sit.current.station !== 'chest' ? sit.current.station.game : null;
    let changed = false;
    // ungültig gewordene Tipps verwerfen (Spiel fehlt oder ist „frei“)
    Object.keys(t.picks).forEach((k) => {
      const d = LT.games[t.picks[k]];
      if (!d || d.type === 'free') { delete t.picks[k]; changed = true; }
    });
    TIP_KINDS.forEach(({ kind }) => {
      if (t.picks[kind]) return;
      const used = new Set(Object.values(t.picks));
      const cands = all.filter((d) => !used.has(d.id) && d.id !== curGame);
      const pick = CHOOSE[kind](cands, all);
      if (pick) { t.picks[kind] = pick.id; changed = true; }
    });
    if (changed) save();
    return TIP_KINDS.filter((k) => t.picks[k.kind]).map((k) => Object.assign({}, k, { game: t.picks[k.kind], def: LT.games[t.picks[k.kind]], done: !!t.done[k.kind] }));
  }

  /* ------------------------------------------------------------------
     Pfad-Geometrie: geschwungene Schlange
     ------------------------------------------------------------------ */
  const xAt = (i, phase) => 50 + 27 * Math.sin(i * 0.95 + phase);

  function buildPath(points) {
    // points in Einheiten: x 0..100, y 0..(n*100)
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const my = (y0 + y1) / 2;
      d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`;
    }
    return d;
  }

  /* ------------------------------------------------------------------
     Bildschirm
     ------------------------------------------------------------------ */
  const R = { chapters: CHAPTERS, schoolChapters: SCHOOL_CHAPTERS, journeys: JOURNEYS, SAY };
  let run = null; // laufende Station { key, game, level, journey } oder Tipp { tip, game, journey }
  let justDone = null; // zuletzt geschaffte Station (für die Hüpf-Animation)
  let justTip = false; // gerade einen Tipp gespielt (für Flos Dank)
  let viewing = null; // gerade angezeigter Teil ('reise' | 'schule')
  let hint = SAY.tap;

  function stationNode(s, ch) {
    const area = LT.areaById(s.def.area);
    const film = s.kind === 'film';
    const pips = el('span.reise-pips', { 'aria-hidden': 'true' });
    if (!film) for (let i = 0; i < Math.min(s.level, 5); i++) pips.appendChild(el('i'));
    const btn = el('button.reise-station.' + s.state + (film ? '.is-film' : ''), {
      type: 'button',
      'aria-label': (film ? 'Film: ' : '') + s.def.title + (s.state === 'locked' ? ' – verschlossen' : ''),
      title: (film ? 'Film: ' : '') + s.def.title,
      data: { key: s.key },
      style: { '--world': area ? area.color : ch.color },
      on: { click: () => onStation(s, btn) },
    },
      U.emoji(s.def.icon, 'reise-st-icon'),
      film ? el('span.reise-film-badge.emoji', { 'aria-hidden': 'true' }, '🎬') : pips,
      s.state === 'locked' ? el('span.reise-lock.emoji', '🔒') : null,
      s.state === 'done' ? el('span.reise-check', '✓') : null
    );
    if (s.state === 'current' && LT.config.test) btn.setAttribute('data-test-station', '1');
    return btn;
  }

  function chapterNode(ch) {
    const n = ch.stations.length;
    const phase = ch.index * 1.3;
    const sec = el('section.reise-chapter' + (ch.isCurrent ? '.is-current' : '') + (ch.opened ? '.is-opened' : '') + (ch.dark ? '.is-dark' : ''), {
      data: { chapter: ch.id },
      style: { '--ch': ch.color, '--ch-soft': ch.soft, '--rows': String(n + 1) },
    });
    sec.appendChild(
      el('header.reise-ch-head',
        el('span.reise-ch-num', String(ch.index + 1)),
        U.emoji(ch.icon, 'reise-ch-icon'),
        el('h2', ch.title),
        el('span.reise-ch-count', { 'aria-label': `${ch.doneCount} von ${n} Stationen` }, U.emoji(ch.opened ? '🏆' : '👣'), ` ${ch.doneCount}/${n}`)
      )
    );
    const path = el('div.reise-path');
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push([i === n ? 50 : xAt(i, phase), i * 100 + 50]);
    const svg = el('svg.reise-trail', { viewBox: `0 0 100 ${(n + 1) * 100}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    svg.appendChild(el('path.reise-trail-bg', { d: buildPath(pts) }));
    // geschaffter Teil des Weges
    const doneUntil = ch.stations.findIndex((s) => s.state !== 'done');
    const upto = doneUntil === -1 ? n : doneUntil;
    if (upto > 0) svg.appendChild(el('path.reise-trail-done', { d: buildPath(pts.slice(0, upto + 1)) }));
    path.appendChild(svg);

    // Deko am Wegesrand (gegenüber der Station)
    for (let i = 0; i <= n; i++) {
      if (i % 2 === 1 && i !== n) continue;
      const x = pts[i][0];
      const left = x > 50 ? 4 + ((i * 7) % 8) : 84 + ((i * 5) % 8);
      path.appendChild(el('span.reise-deco.emoji', { 'aria-hidden': 'true', style: { left: left + '%', top: `calc(var(--row) * ${i + 0.15})` } }, ch.deco[i % ch.deco.length]));
    }

    ch.stations.forEach((s, i) => {
      const node = stationNode(s, ch);
      node.style.left = pts[i][0] + '%';
      node.style.top = `calc(var(--row) * ${i + 0.5})`;
      path.appendChild(node);
    });

    // Schatzkiste am Kapitelende
    const chestState = ch.opened ? 'opened' : ch.complete ? 'ready' : 'locked';
    const chest = el('button.reise-chest.' + chestState, {
      type: 'button',
      'aria-label': 'Schatzkiste',
      title: 'Schatzkiste',
      style: { left: '50%', top: `calc(var(--row) * ${n + 0.5})` },
      on: { click: () => onChest(ch, chestState) },
    }, U.emoji(ch.opened ? '🎉' : '🎁'));
    if (chestState === 'ready' && LT.config.test) chest.setAttribute('data-test-station', '1');
    path.appendChild(chest);
    sec.appendChild(path);
    return sec;
  }

  function veiledNode(ch) {
    return el('section.reise-chapter.is-veiled', {
      data: { chapter: ch.id },
      style: { '--ch': ch.color, '--ch-soft': ch.soft },
      role: 'button',
      'aria-label': 'Verborgener Ort',
      on: { click: (e) => { LT.sfx.play('pop'); LT.ui.animate(e.currentTarget, 'shake'); LT.speech.say(SAY.veiled); } },
    },
      el('span.reise-ch-num', String(ch.index + 1)),
      el('div.reise-clouds', { 'aria-hidden': 'true' }, U.emoji('☁️'), U.emoji('❓'), U.emoji('☁️')),
      el('span.reise-veil-lock.emoji', { 'aria-hidden': 'true' }, '🔒')
    );
  }

  function tipsNode(list) {
    const head = el('button.reise-tips-flo', {
      type: 'button',
      'aria-label': 'Flos Tipps',
      title: 'Flos Tipps',
      on: { click: () => { LT.sfx.play('pop'); LT.ui.animate(head, 'reise-flo-joy'); LT.speech.say(SAY.tipsHead); } },
    }, el('span.reise-tips-face', { html: LT.ui.floSVG() }), el('span.reise-tips-bulb.emoji', { 'aria-hidden': 'true' }, '💡'));
    const row = el('div.reise-tips-row');
    list.forEach((t) => {
      const btn = el('button.reise-tip.' + t.kind + (t.done ? '.done' : ''), {
        type: 'button',
        'aria-label': `Flos Tipp – ${t.label}: ${t.def.title}`,
        title: `${t.label}: ${t.def.title}`,
        style: { '--tip': t.color },
        data: { tip: t.kind },
        on: { click: () => onTip(t, btn) },
      },
        U.emoji(t.def.icon, 'reise-tip-icon'),
        el('span.reise-tip-badge.emoji', { 'aria-hidden': 'true' }, t.badge),
        t.done ? el('span.reise-check', '✓') : null,
        el('span.reise-tip-label', t.label)
      );
      row.appendChild(btn);
    });
    return el('div.reise-tips', { role: 'group', 'aria-label': 'Flos Tipps' }, head, row);
  }

  function finishNode(jid) {
    return el('div.reise-goal', U.emoji(J(jid).goal === '🏰' ? '🏆' : '🎓', 'reise-goal-icon'), el('p', 'Ziel'));
  }

  /** Umschalter Teil 1 / Teil 2 oben auf dem Reise-Bildschirm. */
  function partsNode(jid, opts) {
    const open = schoolUnlocked();
    const box = el('div.reise-parts', { role: 'tablist', 'aria-label': 'Teile der Reise' });
    JOURNEY_IDS.forEach((id) => {
      const j = J(id);
      const locked = j.part === 2 && !open;
      const btn = el('button.reise-part' + (id === jid ? '.active' : '') + (locked ? '.locked' : ''), {
        type: 'button',
        role: 'tab',
        'aria-selected': id === jid ? 'true' : 'false',
        data: { journey: id },
        on: { click: () => {
          LT.sfx.play('click');
          if (id === jid) { LT.speech.say(j.part === 2 ? SAY.part2 : SAY.part1); return; }
          viewing = id;
          R.show(Object.assign({}, opts, { journey: id, partSay: locked ? SAY.part2Locked : j.part === 2 ? SAY.part2 : SAY.part1 }));
        } },
      },
        U.emoji(j.icon, 'reise-part-icon'),
        el('span.reise-part-label', j.tab),
        locked ? el('span.reise-part-lock', U.emoji('🔒'), ' ab Schulkind-Stufe') : null
      );
      box.appendChild(btn);
    });
    return box;
  }

  /** Welcher Teil öffnet sich vom Startbildschirm aus? Teil 2, sobald er frei ist. */
  R.defaultJourney = () => (schoolUnlocked() ? 'schule' : 'reise');
  R.schoolUnlocked = schoolUnlocked;
  R.part1Done = part1Done;
  R.current = () => viewing || R.defaultJourney();

  /**
   * Reise-Bildschirm zeigen.
   * opts: { onBack (Standard: Weltkarte), journey: 'reise' | 'schule' (Standard: zuletzt gezeigter bzw. aktueller Teil) }
   */
  R.show = function (opts = {}) {
    const A = LT.app;
    if (A && A.gate && !A.gate(() => R.show(opts))) return;
    if (A) A.screen = 'reise';
    LT.engine.stop();
    const jid = J(opts.journey || viewing || R.defaultJourney()).id;
    const jr = J(jid);
    viewing = jid;
    const back = () => (opts.onBack || A.showHome)();
    const sit = situation(jid);
    const replay = LT.ui.speakButton(() => hint, { cls: 'reise-replay' });
    const { screen } = LT.ui.screen({
      className: 'reise-screen' + (jr.className ? ' ' + jr.className : ''),
      title: jr.title,
      icon: jr.icon,
      onBack: () => { viewing = null; back(); },
      right: [LT.ui.starCounter(), replay],
    });
    screen.style.setProperty('--area', jr.area);
    screen.style.setProperty('--area-soft', jr.areaSoft);
    screen.dataset.journey = jid;
    LT.ui.setMascot({ hidden: true });
    LT.ui.onMascotTap = () => LT.speech.say(hint);

    const content = el('div.content.reise-content');
    screen.appendChild(content);

    content.appendChild(partsNode(jid, opts));

    // Fortschritt (nur Anzeige)
    const pct = sit.total ? Math.round((sit.done / sit.total) * 100) : 0;
    content.appendChild(
      el('div.reise-progress', { 'aria-label': `${sit.done} von ${sit.total} Stationen geschafft` },
        U.emoji('🦊'),
        el('div.reise-meter', el('i', { style: { width: pct + '%' } })),
        U.emoji(jr.goal),
        el('span.reise-progress-num', `${sit.done}/${sit.total}`)
      )
    );

    // Flos Tipp: persönliche Extra-Stationen (freiwillig)
    const tipList = tips(sit);
    if (tipList.length) content.appendChild(tipsNode(tipList));

    const map = el('div.reise-map');
    content.appendChild(map);
    if (!sit.chapters.length) {
      map.appendChild(el('div.reise-empty', U.emoji('🚧', 'reise-empty-icon'), el('p', 'Hier wird noch gebaut. Bald geht es los!')));
    }
    const later = [];
    sit.chapters.forEach((ch) => {
      if (ch.unlocked) map.appendChild(chapterNode(ch));
      else if (!map.querySelector('.is-veiled')) map.appendChild(veiledNode(ch));
      else later.push(ch);
    });
    if (later.length) {
      map.appendChild(el('div.reise-later', later.map((ch) => el('button.reise-later-cloud', {
        type: 'button',
        'aria-label': 'Verborgener Ort',
        on: { click: (e) => { LT.sfx.play('pop'); LT.ui.animate(e.currentTarget, 'shake'); LT.speech.say(SAY.veiled); } },
      }, U.emoji('☁️'), el('span', String(ch.index + 1))))));
    }
    if (sit.chapters.length) map.appendChild(finishNode(jid));

    // Flo, die Reisefigur
    const flo = el('div.reise-flo', { html: LT.ui.floSVG(), role: 'button', 'aria-label': 'Flo', on: { click: () => { LT.sfx.play('pop'); LT.ui.animate(flo, 'reise-flo-joy'); LT.speech.say(hint); } } });
    if (sit.chapters.length) map.appendChild(flo);

    const targetNode = () => {
      if (!sit.current) return map.querySelector('.reise-chapter:last-of-type .reise-chest') || map.querySelector('.reise-goal');
      if (sit.current.station === 'chest') return map.querySelector(`[data-chapter="${sit.current.chapter.id}"] .reise-chest`);
      return map.querySelector(`[data-key="${sit.current.station.key}"]`);
    };
    const fromNode = justDone ? map.querySelector(`[data-key="${justDone}"]`) : null;
    const hopped = justDone;
    justDone = null;

    const place = (node, animate) => {
      if (!node || !flo.isConnected) return;
      const m = map.getBoundingClientRect();
      const r = node.getBoundingClientRect();
      const fw = flo.offsetWidth;
      const fh = flo.offsetHeight;
      // Flo steht neben der Station – auf der Seite mit mehr Platz
      const cx = r.left - m.left + r.width / 2;
      const right = cx < m.width / 2;
      const x = right ? cx + r.width * 0.42 : cx - r.width * 0.42 - fw;
      const y = r.top - m.top + r.height / 2 - fh * 0.78;
      flo.classList.toggle('look-left', !right);
      const prev = flo._pos;
      flo._pos = { x, y };
      if (animate && prev && flo.animate) {
        const midX = (prev.x + x) / 2;
        const midY = Math.min(prev.y, y) - Math.max(60, Math.abs(prev.y - y) * 0.35);
        flo.animate(
          [
            { transform: `translate(${prev.x}px, ${prev.y}px)` },
            { transform: `translate(${midX}px, ${midY}px)`, offset: 0.5 },
            { transform: `translate(${x}px, ${y}px)` },
          ],
          { duration: LT.config.test ? 30 : 900, easing: 'ease-in-out' }
        );
      }
      flo.style.transform = `translate(${x}px, ${y}px)`;
    };

    const target = targetNode();
    requestAnimationFrame(() => {
      if (!flo.isConnected) return;
      if (fromNode && target && fromNode !== target) {
        place(fromNode, false);
        scrollTo(content, fromNode, false);
        setTimeout(() => {
          if (!flo.isConnected) return;
          LT.sfx.play('star');
          place(target, true);
          scrollTo(content, target, true);
        }, LT.config.test ? 20 : 650);
      } else {
        place(target, false);
        scrollTo(content, target, false);
      }
    });
    const onResize = () => { if (!flo.isConnected) { window.removeEventListener('resize', onResize); if (R._onResize === onResize) R._onResize = null; return; } place(targetNode(), false); };
    // Nur EIN Listener: den der vorigen Anzeige zuerst entfernen (sonst Speicherleck)
    if (R._onResize) window.removeEventListener('resize', R._onResize);
    R._onResize = onResize;
    window.addEventListener('resize', onResize);

    // Sprechen / Einleitung
    const cur = sit.current;
    if (!sit.chapters.length) hint = SAY.veiled;
    else if (!cur) hint = sayOf(jid, 'finished');
    else if (cur.station === 'chest') hint = SAY.chestReady;
    else hint = sayOf(jid, 'tap');

    const st = S(jid);
    const fromTip = justTip;
    justTip = false;
    const ts = tipList.length ? tipState() : null;
    const tipsHello = ts && !ts.hello && tipList.some((t) => !t.done);
    const greeted = R._greeted && R._greeted[jid];
    R._greeted = Object.assign({}, R._greeted, { [jid]: true });
    if (cur && !st.intros[cur.chapter.id]) {
      // Als gesehen gilt die Einleitung erst, wenn sie wirklich erscheint (siehe showIntro)
      setTimeout(() => { if (flo.isConnected) showIntro(cur.chapter, cur.chapter.index > 0); }, hopped ? 900 : 250);
    } else if (opts.partSay) {
      LT.speech.say(opts.partSay);
    } else if (fromTip) {
      LT.speech.say(sayOf(jid, 'tipThanks'));
    } else if (hopped) {
      LT.speech.say(cur && cur.station === 'chest' ? SAY.chestReady : U.pickFresh('reise-hop', SAY.hop, 2));
    } else if (!sit.chapters.length) {
      LT.speech.say(SAY.veiled);
    } else if (!cur) {
      LT.speech.say(sayOf(jid, 'finished'));
    } else if (cur.station === 'chest') {
      LT.speech.say(SAY.chestReady);
    } else if (tipsHello) {
      // einmal am Tag auf die Tipps hinweisen
      ts.hello = true;
      save('reise');
      LT.speech.say((greeted ? sayOf(jid, 'back') : sayOf(jid, 'welcome')) + ' ' + SAY.tipsHello);
    } else {
      LT.speech.say(greeted ? sayOf(jid, 'back') : sayOf(jid, 'welcome'));
    }
  };

  function scrollTo(content, node, smooth) {
    if (!node) return;
    const c = content.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    const top = content.scrollTop + (r.top - c.top) - c.height * 0.45;
    try { content.scrollTo({ top: Math.max(0, top), behavior: smooth && !LT.config.test ? 'smooth' : 'auto' }); } catch (e) { content.scrollTop = Math.max(0, top); }
  }

  /* ------------------------------------------------------------------
     Interaktion
     ------------------------------------------------------------------ */
  function onStation(s, btn) {
    if (s.state === 'locked') {
      LT.sfx.play('wrong');
      LT.ui.animate(btn, 'shake');
      LT.speech.say(SAY.locked);
      return;
    }
    LT.sfx.play('click');
    if (s.state === 'done') {
      // Erst den Satz ausreden lassen, dann starten (sonst schneidet das Spiel ihn ab).
      // Wird die Ansage unterbrochen (anderes Antippen, Bildschirmwechsel), startet nichts.
      const p = LT.speech.say(SAY.replay);
      const tok = LT.speech._token;
      p.then(() => {
        if (LT.speech._token === tok && btn.isConnected && LT.app && LT.app.screen === 'reise') R.startStation(s);
      });
      return;
    }
    R.startStation(s);
  }

  /** Tipp antippen: beim ersten Mal am Tag erklärt Flo kurz, warum; danach startet das Spiel. */
  function onTip(t, btn) {
    LT.sfx.play('click');
    LT.ui.animate(btn, 'bump');
    const ts = tipState();
    let text = null;
    if (t.done) text = SAY.tipDone;
    else if (!ts.told[t.kind]) text = SAY[t.say];
    if (!text) { R.startTip(t); return; }
    ts.told[t.kind] = true;
    save('reise');
    const p = LT.speech.say(text);
    const tok = LT.speech._token;
    p.then(() => {
      if (LT.speech._token === tok && btn.isConnected && LT.app && LT.app.screen === 'reise') R.startTip(t);
    });
  }

  /** Tipp starten: Spiel auf der aktuellen Stufe des Kindes (keine feste Stufe). */
  R.startTip = function (t) {
    run = { tip: t.kind, game: t.game, journey: R.current() };
    const A = LT.app;
    if (!A || !A.startGame) return;
    A.startGame(t.game, { from: 'reise' });
  };

  /** Station starten (Spiel mit genau dieser Stufe). */
  R.startStation = function (s) {
    run = { key: s.key, game: s.game, level: s.level, journey: R.current() };
    const A = LT.app;
    if (!A || !A.startGame) return;
    A.startGame(s.game, { from: 'reise', level: s.level });
  };

  /** Von app.js nach jeder beendeten Runde aufgerufen. */
  R.onRoundFinished = function (gameId) {
    if (!run || run.game !== gameId) return;
    if (run.tip) {
      const ts = tipState();
      if (!ts.done[run.tip]) {
        ts.done[run.tip] = true;
        justTip = true;
        save('reise');
      }
      return;
    }
    const st = S(run.journey);
    if (!st.done[run.key]) {
      st.done[run.key] = true;
      justDone = run.key;
      save(run.journey);
    }
  };
  /** Von app.js beim Verlassen eines Spiels aufgerufen, das aus der Reise kam. */
  R.onGameExit = function () {
    const jid = run && run.journey;
    run = null;
    R.show(jid ? { journey: jid } : {});
  };

  function onChest(ch, chestState) {
    if (chestState === 'locked') {
      LT.sfx.play('wrong');
      LT.speech.say(SAY.chestLocked);
      return;
    }
    if (chestState === 'opened') {
      LT.sfx.play('pop');
      LT.speech.say(SAY.chestOpened);
      return;
    }
    openChest(ch);
  }

  function openChest(ch) {
    const jid = ch.journey || 'reise';
    const st = S(jid);
    st.chests[ch.id] = true;
    save(jid);
    const fresh = LT.progress.giveBonusSticker();
    LT.progress.save(true);
    const sticker = fresh.length ? LT.stickerById(fresh[fresh.length - 1]) : null;
    LT.sfx.play('win');
    LT.ui.confetti(150);
    const lid = el('span.reise-chest-big.emoji', '🎁');
    const reward = el('div.reise-reward');
    const next = situation(jid);
    const isLast = !next.current;
    // Ende von Teil 1: weiter ins Schulabenteuer
    const toSchool = isLast && jid === 'reise' && situation('schule').chapters.length > 0;
    const btn = LT.ui.button(toSchool ? 'Zum Schulabenteuer' : isLast ? 'Juhu!' : 'Weiter reisen', () => {
      ov.remove();
      LT.speech.stop();
      if (toSchool) { viewing = 'schule'; R.show({ journey: 'schule' }); } else R.show({ journey: jid });
    }, { icon: toSchool ? '🎒' : isLast ? '🎉' : '🗺️', cls: 'btn-gold', big: true });
    btn.disabled = true;
    const ov = LT.ui.overlay([
      el('h2', 'Schatzkiste!'),
      lid,
      el('p.reise-story', ch.story),
      reward,
      el('div.actions', btn),
    ], { className: 'reise-chest-overlay' });
    ov.style.setProperty('--ch', ch.color);
    ov.style.setProperty('--ch-soft', ch.soft);
    if (LT.config.test) ov.dataset.test = 'reise-chest';
    (async () => {
      await U.sleep(600);
      lid.textContent = '✨';
      lid.classList.add('open');
      LT.sfx.play('sticker');
      if (sticker) {
        reward.appendChild(el('span.sticker-reveal.emoji', sticker.e));
      } else {
        reward.appendChild(el('span.sticker-reveal.emoji', '🏆'));
      }
      btn.disabled = false;
      if (LT.config.test) btn.setAttribute('data-test-station', '1');
      await LT.speech.say(ch.story);
      if (!ov.isConnected) return;
      if (sticker) {
        await LT.speech.say(SAY.sticker);
        if (ov.isConnected) await LT.speech.say(sticker.name);
      } else {
        await LT.speech.say(SAY.stickerFull);
      }
      if (ov.isConnected && toSchool) LT.speech.say(SAY.part2Reveal);
      else if (ov.isConnected && !isLast) LT.speech.say(SAY.reveal);
    })();
  }

  function showIntro(ch, reveal) {
    const jid = ch.journey || 'reise';
    S(jid).intros[ch.id] = true;
    save(jid);
    const deco = el('div.reise-intro-deco', { 'aria-hidden': 'true' }, ch.deco.slice(0, 4).map((d) => U.emoji(d)));
    const btn = LT.ui.button('Los geht’s!', () => {
      ov.remove();
      LT.speech.stop();
      LT.speech.say(sayOf(jid, 'tap'));
    }, { icon: '▶️', cls: 'btn-primary', big: true });
    if (LT.config.test) btn.setAttribute('data-test-station', '1');
    const ov = LT.ui.overlay([
      el('div.reise-intro-place', U.emoji(ch.icon, 'reise-intro-icon')),
      el('h2', ch.title),
      deco,
      el('p.reise-story', ch.intro),
      el('div.actions', btn),
    ], { className: 'reise-intro' + (jid === 'schule' ? '.is-schule' : '') });
    ov.style.setProperty('--area', ch.color);
    ov.style.setProperty('--ch', ch.color);
    ov.style.setProperty('--ch-soft', ch.soft);
    LT.sfx.play(reveal ? 'levelup' : 'pop');
    LT.speech.say(reveal ? SAY.reveal + ' ' + ch.intro : ch.intro);
  }

  /* ------------------------------------------------------------------
     Für Startseite und Elternbereich
     ------------------------------------------------------------------ */
  /** Zusammenfassung eines Teils (Standard: der Teil, den der Startknopf öffnet). */
  R.summary = function (jid) {
    jid = J(jid || R.defaultJourney()).id;
    const sit = situation(jid);
    const jr = J(jid);
    return {
      journey: jid,
      part: jr.part,
      title: jr.title,
      icon: jr.icon,
      goal: jr.goal,
      unlocked: jr.part === 1 || schoolUnlocked(),
      done: sit.done,
      total: sit.total,
      finished: sit.finished,
      chapter: sit.current ? sit.current.chapter : null,
      chapters: sit.chapters.map((c) => ({ id: c.id, title: c.title, icon: c.icon, focus: c.focus, done: c.doneCount, total: c.stations.length, unlocked: c.unlocked, opened: c.opened, stations: c.stations.map((s) => ({ game: s.game, kind: s.kind, level: s.level, title: s.def.title, icon: s.def.icon, state: s.state })) })),
      missing: jr.chapters.flatMap((c) => c.stations.map(parseStation).filter((s) => !LT.games[s.game]).map((s) => s.game)),
    };
  };
  /** Liste der Teile (für Elternbereich). */
  R.journeyList = () => JOURNEY_IDS.map((id) => J(id));
  /** Heutige Tipps (für Startseite und Elternbereich). */
  R.tips = () => tips(situation(R.current()));
  /** Zurücksetzen: ein Teil (jid) oder alle Teile (ohne Angabe). Tipps gehören zu Teil 1. */
  R.reset = function (jid) {
    const ids = jid ? [J(jid).id] : JOURNEY_IDS;
    ids.forEach((id) => {
      states[id] = { done: {}, chests: {}, intros: {} };
      save(id);
    });
    run = null;
    justDone = null;
    justTip = false;
    viewing = null;
    R._greeted = {};
  };
  /** Alle festen Sätze (z. B. für das Einsammeln der Sprachaufnahmen). */
  R.speechTexts = function () {
    const out = [];
    Object.values(SAY).forEach((v) => (Array.isArray(v) ? out.push(...v) : out.push(v)));
    JOURNEY_IDS.forEach((id) => {
      const jr = J(id);
      Object.values(jr.say).forEach((v) => out.push(v));
      jr.chapters.forEach((c) => { out.push(c.intro, c.story, SAY.reveal + ' ' + c.intro); });
      out.push(sayOf(id, 'welcome') + ' ' + SAY.tipsHello, sayOf(id, 'back') + ' ' + SAY.tipsHello);
    });
    (LT.stickers || []).forEach((s) => out.push(s.name));
    return Array.from(new Set(out));
  };

  /* Test-Helfer (nur ?test) */
  if (LT.config.test) {
    R.test = {
      completeChapter(idx, jid = 'reise') {
        const ch = chapters(jid)[idx];
        if (!ch) return false;
        const st = S(jid);
        ch.stations.forEach((s) => { st.done[s.key] = true; });
        st.intros[ch.id] = true;
        save(jid);
        return true;
      },
      /** Teil 1 komplett (alle Kisten offen) – schaltet Teil 2 frei. */
      completePart1() {
        const st = S('reise');
        chapters('reise').forEach((ch) => { ch.stations.forEach((s) => { st.done[s.key] = true; }); st.intros[ch.id] = true; st.chests[ch.id] = true; });
        CHAPTERS.forEach((c) => { st.chests[c.id] = true; });
        save('reise');
      },
      situation,
      tips,
    };
  }

  LT.reise = R;
})();
