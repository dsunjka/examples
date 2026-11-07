/* ==========================================================================
   Lernbereiche („Inseln“) und Sticker-Sammlung.
   Die Reihenfolge der Spiele in `games` bestimmt die Anordnung auf der
   Bereichsseite (vom Leichten zum Schweren). Nicht vorhandene Spiele
   werden einfach ausgeblendet.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;

  LT.areas = [
    {
      id: 'zahlen',
      title: 'Zahlenland',
      icon: '🔢',
      deco: ['1', '2', '3', '🍎'],
      color: '#ff8a3d',
      soft: '#ffe3cf',
      hello: 'Willkommen im Zahlenland! Hier zählen, vergleichen und rechnen wir.',
      parent:
        'Mathematische Vorläuferfähigkeiten: Zählen, Mengen auf einen Blick erfassen, Ziffern kennen, Mengen vergleichen, Zahlenreihe, Zahlzerlegung und erstes Rechnen bis 10 bzw. 20 – stets mit Bildern und Punktmustern (Mengen-Zahlen-Kompetenz nach Krajewski).',
      games: ['zaehlen', 'blitzblick', 'zahlen-erkennen', 'mengen-vergleich', 'zahlenreihe', 'zahlenhaus', 'rechnen'],
    },
    {
      id: 'sprache',
      title: 'Buchstabenland',
      icon: '🔤',
      deco: ['A', 'B', 'C', '📖'],
      color: '#8e6cef',
      soft: '#e8e0ff',
      hello: 'Willkommen im Buchstabenland! Hier spielen wir mit Reimen, Silben, Lauten und Buchstaben.',
      parent:
        'Phonologische Bewusstheit (stärkster Prädiktor für den Lese-/Schreiberwerb): Reime, Silben, Anlaute, Lautverbindung – angelehnt an Trainingsprogramme wie „Hören, lauschen, lernen“. Dazu Buchstabenkenntnis, erstes Lesen und Wortschatz (Gegensätze, Oberbegriffe).',
      games: ['reime', 'silben', 'roboter', 'anlaut', 'buchstaben', 'erstes-lesen', 'gegensaetze', 'oberbegriffe'],
    },
    {
      id: 'formen',
      title: 'Formen & Farben',
      icon: '🎨',
      deco: ['🔺', '🟦', '⚪', '⭐'],
      color: '#ff5fa2',
      soft: '#ffe0ee',
      hello: 'Willkommen bei Formen und Farben! Hier entdecken wir Kreise, Dreiecke, Farben und Muster.',
      parent:
        'Geometrische Grunderfahrungen und visuelle Wahrnehmung: Formen benennen und wiedererkennen, Farben und Farbmischung, Muster erkennen und fortsetzen (Vorstufe algebraischen Denkens), Ordnen nach Größe (Seriation).',
      games: ['formen', 'farben', 'muster', 'groessen'],
    },
    {
      id: 'denken',
      title: 'Denk-Insel',
      icon: '🧩',
      deco: ['❓', '💡', '🃏', '🔍'],
      color: '#1fb5c9',
      soft: '#d3f4f8',
      hello: 'Willkommen auf der Denk-Insel! Hier trainieren wir Gedächtnis und schlaue Köpfe.',
      parent:
        'Exekutive Funktionen und logisches Denken: Arbeitsgedächtnis (visuell und auditiv), Klassifizieren, Figur-Grund-Wahrnehmung, zeitlich-logische Reihenfolgen, Schlussfolgern (Bilder-Sudoku). Diese Fähigkeiten sagen Schulerfolg nachweislich vorher.',
      games: ['memory', 'passt-nicht', 'schatten', 'was-fehlt', 'reihenfolge', 'toene-merken', 'bilder-sudoku'],
    },
    {
      id: 'welt',
      title: 'Entdecker-Welt',
      icon: '🌍',
      deco: ['🦁', '🚦', '☀️', '⏰'],
      color: '#3dbe6b',
      soft: '#daf6e3',
      hello: 'Willkommen in der Entdecker-Welt! Hier erforschen wir Tiere, Körper, Gefühle und vieles mehr.',
      parent:
        'Sachwissen und Orientierung: Raum-Lage-Begriffe (oben, unter, neben …), Körperteile, Gefühle erkennen (sozial-emotionales Lernen), sicherer Schulweg, Tiere und ihre Lebensräume, Jahreszeiten, Tagesablauf, Wochentage und die Uhr.',
      games: ['raumlage', 'koerper', 'gefuehle', 'verkehr', 'tiere', 'jahreszeiten', 'uhr'],
    },
    {
      id: 'werkstatt',
      title: 'Malwerkstatt',
      icon: '✏️',
      deco: ['🖍️', '〰️', '✨', '🖌️'],
      color: '#f2a900',
      soft: '#fff0c7',
      hello: 'Willkommen in der Malwerkstatt! Hier malen wir, spuren nach und verbinden Punkte.',
      parent:
        'Feinmotorik und Graphomotorik als Vorbereitung auf das Schreiben: Schwungübungen, Ziffern und Buchstaben in richtiger Schreibrichtung nachspuren, Zahlen der Reihe nach verbinden, kreatives Ausmalen.',
      games: ['nachspuren', 'punkte-verbinden', 'ausmalen'],
    },
  ];

  LT.areaById = (id) => LT.areas.find((a) => a.id === id) || null;
  /** Vorhandene Spiele eines Bereichs in Anzeige-Reihenfolge. */
  LT.gamesOfArea = function (areaId) {
    const a = LT.areaById(areaId);
    if (!a) return [];
    const ordered = a.games.filter((id) => LT.games[id]);
    // Spiele, die registriert, aber nicht in der Liste sind, hinten anfügen
    LT.gameOrder.forEach((id) => {
      if (LT.games[id].area === areaId && !ordered.includes(id)) ordered.push(id);
    });
    return ordered.map((id) => LT.games[id]);
  };

  /* --------------------------------------------------------------------
     Sticker-Album: 56 Sticker in 7 Themen. Alle 4 Sterne gibt es einen.
     -------------------------------------------------------------------- */
  const THEMES = [
    { id: 'tiere', title: 'Tierfreunde', icon: '🐾', items: [['🐶', 'Hund'], ['🐱', 'Katze'], ['🦁', 'Löwe'], ['🐯', 'Tiger'], ['🐼', 'Panda'], ['🐨', 'Koala'], ['🐸', 'Frosch'], ['🐵', 'Affe']] },
    { id: 'fahrzeuge', title: 'Fahrzeuge', icon: '🚦', items: [['🚒', 'Feuerwehrauto'], ['🚓', 'Polizeiauto'], ['🚑', 'Krankenwagen'], ['🚜', 'Traktor'], ['🚂', 'Lokomotive'], ['🚁', 'Hubschrauber'], ['🏎️', 'Rennauto'], ['🚀', 'Rakete']] },
    { id: 'dinos', title: 'Dinos & Fabelwesen', icon: '🦕', items: [['🦕', 'Langhals-Dino'], ['🦖', 'T-Rex'], ['🐉', 'Drache'], ['🦄', 'Einhorn'], ['🤖', 'Roboter'], ['👽', 'Außerirdischer'], ['👻', 'Gespenst'], ['🧙', 'Zauberer']] },
    { id: 'meer', title: 'Unterwasserwelt', icon: '🌊', items: [['🐳', 'Wal'], ['🐬', 'Delfin'], ['🦈', 'Hai'], ['🐙', 'Krake'], ['🐠', 'Tropenfisch'], ['🐢', 'Schildkröte'], ['🦀', 'Krabbe'], ['🐚', 'Muschel']] },
    { id: 'weltall', title: 'Weltall', icon: '🪐', items: [['🌍', 'Erde'], ['🌙', 'Mond'], ['☀️', 'Sonne'], ['⭐', 'Stern'], ['🪐', 'Saturn'], ['🛸', 'Ufo'], ['☄️', 'Komet'], ['🌈', 'Regenbogen']] },
    { id: 'sport', title: 'Sport & Musik', icon: '🏆', items: [['⚽', 'Fußball'], ['🏀', 'Basketball'], ['🎾', 'Tennisball'], ['🚲', 'Fahrrad'], ['🥇', 'Goldmedaille'], ['🏆', 'Pokal'], ['🎸', 'Gitarre'], ['🥁', 'Trommel']] },
    { id: 'lecker', title: 'Leckereien', icon: '🍓', items: [['🍕', 'Pizza'], ['🍦', 'Eis'], ['🍩', 'Donut'], ['🍉', 'Melone'], ['🍓', 'Erdbeere'], ['🧁', 'Muffin'], ['🍪', 'Keks'], ['🍭', 'Lutscher']] },
  ];
  LT.stickerThemes = THEMES;
  // Reihenfolge der Freischaltung: reihum aus den Themen, damit es abwechslungsreich bleibt
  LT.stickers = [];
  for (let i = 0; i < 8; i++) {
    THEMES.forEach((t) => {
      const [e, name] = t.items[i];
      LT.stickers.push({ id: `${t.id}-${i}`, e, name, theme: t.id });
    });
  }
  LT.stickerById = (id) => LT.stickers.find((s) => s.id === id) || null;
})();
