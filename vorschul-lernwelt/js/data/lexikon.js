/* ==========================================================================
   LT.lexikon – Bild-Wort-Lexikon (Emoji + deutsches Wort).
   Grundwortschatz für viele Spiele (Memory, Kategorien, Silben, Zählen …).

   Felder je Eintrag:
     id   – eindeutig (aus dem Wort erzeugt, z. B. 'eichhoernchen')
     e    – Emoji
     w    – Wort (Singular)
     a    – Artikel: 'der' | 'die' | 'das'
     p    – Plural (oder null, wenn unüblich)
     s    – Sprechsilben als Array, z. B. ['Ba','na','ne']
     c    – Kategorie (siehe LT.lexikon.categories)
     sub  – Unterkategorie (bei Tieren: Lebensraum 'hof' | 'haus' | 'wald' | 'zoo' | 'wasser' | null)

   Hinweis: Silben sind SPRECHSILBEN (wie beim Klatschen): I-gel, A-mei-se.
   Emoji-Auswahl bewusst auf ältere Unicode-Versionen beschränkt, damit die
   Bilder auch auf älteren Tablets angezeigt werden.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;

  // [Emoji, Wort, Artikel, Plural, Silben (mit -), Kategorie, Unterkategorie]
  const RAW = [
    // ---------- Tiere ----------
    ['🐶', 'Hund', 'der', 'Hunde', 'Hund', 'tiere', 'haus'],
    ['🐱', 'Katze', 'die', 'Katzen', 'Kat-ze', 'tiere', 'haus'],
    ['🐹', 'Hamster', 'der', 'Hamster', 'Hams-ter', 'tiere', 'haus'],
    ['🐭', 'Maus', 'die', 'Mäuse', 'Maus', 'tiere', null],
    ['🐰', 'Hase', 'der', 'Hasen', 'Ha-se', 'tiere', null],
    ['🐄', 'Kuh', 'die', 'Kühe', 'Kuh', 'tiere', 'hof'],
    ['🐷', 'Schwein', 'das', 'Schweine', 'Schwein', 'tiere', 'hof'],
    ['🐑', 'Schaf', 'das', 'Schafe', 'Schaf', 'tiere', 'hof'],
    ['🐐', 'Ziege', 'die', 'Ziegen', 'Zie-ge', 'tiere', 'hof'],
    ['🐴', 'Pferd', 'das', 'Pferde', 'Pferd', 'tiere', 'hof'],
    ['🐔', 'Huhn', 'das', 'Hühner', 'Huhn', 'tiere', 'hof'],
    ['🐓', 'Hahn', 'der', 'Hähne', 'Hahn', 'tiere', 'hof'],
    ['🐥', 'Küken', 'das', 'Küken', 'Kü-ken', 'tiere', 'hof'],
    ['🦆', 'Ente', 'die', 'Enten', 'En-te', 'tiere', 'hof'],
    ['🦊', 'Fuchs', 'der', 'Füchse', 'Fuchs', 'tiere', 'wald'],
    ['🦔', 'Igel', 'der', 'Igel', 'I-gel', 'tiere', 'wald'],
    ['🐿️', 'Eichhörnchen', 'das', 'Eichhörnchen', 'Eich-hörn-chen', 'tiere', 'wald'],
    ['🦉', 'Eule', 'die', 'Eulen', 'Eu-le', 'tiere', 'wald'],
    ['🐻', 'Bär', 'der', 'Bären', 'Bär', 'tiere', 'wald'],
    ['🦌', 'Hirsch', 'der', 'Hirsche', 'Hirsch', 'tiere', 'wald'],
    ['🐺', 'Wolf', 'der', 'Wölfe', 'Wolf', 'tiere', 'wald'],
    ['🐗', 'Wildschwein', 'das', 'Wildschweine', 'Wild-schwein', 'tiere', 'wald'],
    ['🐌', 'Schnecke', 'die', 'Schnecken', 'Schne-cke', 'tiere', null],
    ['🐞', 'Marienkäfer', 'der', 'Marienkäfer', 'Ma-ri-en-kä-fer', 'tiere', null],
    ['🐝', 'Biene', 'die', 'Bienen', 'Bie-ne', 'tiere', null],
    ['🦋', 'Schmetterling', 'der', 'Schmetterlinge', 'Schmet-ter-ling', 'tiere', null],
    ['🐛', 'Raupe', 'die', 'Raupen', 'Rau-pe', 'tiere', null],
    ['🐜', 'Ameise', 'die', 'Ameisen', 'A-mei-se', 'tiere', null],
    ['🕷️', 'Spinne', 'die', 'Spinnen', 'Spin-ne', 'tiere', null],
    ['🦁', 'Löwe', 'der', 'Löwen', 'Lö-we', 'tiere', 'zoo'],
    ['🐯', 'Tiger', 'der', 'Tiger', 'Ti-ger', 'tiere', 'zoo'],
    ['🐘', 'Elefant', 'der', 'Elefanten', 'E-le-fant', 'tiere', 'zoo'],
    ['🦒', 'Giraffe', 'die', 'Giraffen', 'Gi-raf-fe', 'tiere', 'zoo'],
    ['🦓', 'Zebra', 'das', 'Zebras', 'Ze-bra', 'tiere', 'zoo'],
    ['🐒', 'Affe', 'der', 'Affen', 'Af-fe', 'tiere', 'zoo'],
    ['🦛', 'Nilpferd', 'das', 'Nilpferde', 'Nil-pferd', 'tiere', 'zoo'],
    ['🐊', 'Krokodil', 'das', 'Krokodile', 'Kro-ko-dil', 'tiere', 'zoo'],
    ['🐍', 'Schlange', 'die', 'Schlangen', 'Schlan-ge', 'tiere', 'zoo'],
    ['🦘', 'Känguru', 'das', 'Kängurus', 'Kän-gu-ru', 'tiere', 'zoo'],
    ['🐧', 'Pinguin', 'der', 'Pinguine', 'Pin-gu-in', 'tiere', 'zoo'],
    ['🐫', 'Kamel', 'das', 'Kamele', 'Ka-mel', 'tiere', 'zoo'],
    ['🦏', 'Nashorn', 'das', 'Nashörner', 'Nas-horn', 'tiere', 'zoo'],
    ['🐼', 'Panda', 'der', 'Pandas', 'Pan-da', 'tiere', 'zoo'],
    ['🐨', 'Koala', 'der', 'Koalas', 'Ko-a-la', 'tiere', 'zoo'],
    ['🦩', 'Flamingo', 'der', 'Flamingos', 'Fla-min-go', 'tiere', 'zoo'],
    ['🦜', 'Papagei', 'der', 'Papageien', 'Pa-pa-gei', 'tiere', 'zoo'],
    ['🐟', 'Fisch', 'der', 'Fische', 'Fisch', 'tiere', 'wasser'],
    ['🐳', 'Wal', 'der', 'Wale', 'Wal', 'tiere', 'wasser'],
    ['🐬', 'Delfin', 'der', 'Delfine', 'Del-fin', 'tiere', 'wasser'],
    ['🦈', 'Hai', 'der', 'Haie', 'Hai', 'tiere', 'wasser'],
    ['🐙', 'Krake', 'der', 'Kraken', 'Kra-ke', 'tiere', 'wasser'],
    ['🦀', 'Krabbe', 'die', 'Krabben', 'Krab-be', 'tiere', 'wasser'],
    ['🐢', 'Schildkröte', 'die', 'Schildkröten', 'Schild-krö-te', 'tiere', 'wasser'],
    ['🐸', 'Frosch', 'der', 'Frösche', 'Frosch', 'tiere', 'wasser'],
    ['🦢', 'Schwan', 'der', 'Schwäne', 'Schwan', 'tiere', 'wasser'],
    ['🦕', 'Dino', 'der', 'Dinos', 'Di-no', 'tiere', null],

    // ---------- Obst ----------
    ['🍎', 'Apfel', 'der', 'Äpfel', 'Ap-fel', 'obst'],
    ['🍐', 'Birne', 'die', 'Birnen', 'Bir-ne', 'obst'],
    ['🍌', 'Banane', 'die', 'Bananen', 'Ba-na-ne', 'obst'],
    ['🍓', 'Erdbeere', 'die', 'Erdbeeren', 'Erd-bee-re', 'obst'],
    ['🍒', 'Kirsche', 'die', 'Kirschen', 'Kir-sche', 'obst'],
    ['🍇', 'Traube', 'die', 'Trauben', 'Trau-be', 'obst'],
    ['🍊', 'Orange', 'die', 'Orangen', 'O-ran-ge', 'obst'],
    ['🍋', 'Zitrone', 'die', 'Zitronen', 'Zi-tro-ne', 'obst'],
    ['🍉', 'Melone', 'die', 'Melonen', 'Me-lo-ne', 'obst'],
    ['🍍', 'Ananas', 'die', 'Ananas', 'A-na-nas', 'obst'],
    ['🍑', 'Pfirsich', 'der', 'Pfirsiche', 'Pfir-sich', 'obst'],
    ['🥝', 'Kiwi', 'die', 'Kiwis', 'Ki-wi', 'obst'],
    ['🥥', 'Kokosnuss', 'die', 'Kokosnüsse', 'Ko-kos-nuss', 'obst'],

    // ---------- Gemüse ----------
    ['🥕', 'Karotte', 'die', 'Karotten', 'Ka-rot-te', 'gemuese'],
    ['🥒', 'Gurke', 'die', 'Gurken', 'Gur-ke', 'gemuese'],
    ['🍅', 'Tomate', 'die', 'Tomaten', 'To-ma-te', 'gemuese'],
    ['🌽', 'Mais', 'der', null, 'Mais', 'gemuese'],
    ['🥔', 'Kartoffel', 'die', 'Kartoffeln', 'Kar-tof-fel', 'gemuese'],
    ['🥦', 'Brokkoli', 'der', 'Brokkoli', 'Brok-ko-li', 'gemuese'],
    ['🧅', 'Zwiebel', 'die', 'Zwiebeln', 'Zwie-bel', 'gemuese'],
    ['🍄', 'Pilz', 'der', 'Pilze', 'Pilz', 'gemuese'],
    ['🥬', 'Salat', 'der', 'Salate', 'Sa-lat', 'gemuese'],

    // ---------- Essen & Trinken ----------
    ['🍞', 'Brot', 'das', 'Brote', 'Brot', 'essen'],
    ['🧀', 'Käse', 'der', null, 'Kä-se', 'essen'],
    ['🥚', 'Ei', 'das', 'Eier', 'Ei', 'essen'],
    ['🥛', 'Milch', 'die', null, 'Milch', 'essen'],
    ['🍕', 'Pizza', 'die', 'Pizzas', 'Piz-za', 'essen'],
    ['🍦', 'Eis', 'das', null, 'Eis', 'essen'],
    ['🎂', 'Torte', 'die', 'Torten', 'Tor-te', 'essen'],
    ['🍪', 'Keks', 'der', 'Kekse', 'Keks', 'essen'],
    ['🍯', 'Honig', 'der', null, 'Ho-nig', 'essen'],
    ['🥨', 'Brezel', 'die', 'Brezeln', 'Bre-zel', 'essen'],
    ['🍭', 'Lutscher', 'der', 'Lutscher', 'Lut-scher', 'essen'],
    ['🍫', 'Schokolade', 'die', null, 'Scho-ko-la-de', 'essen'],
    ['🌭', 'Würstchen', 'das', 'Würstchen', 'Würst-chen', 'essen'],
    ['🧁', 'Muffin', 'der', 'Muffins', 'Muf-fin', 'essen'],
    ['🍩', 'Donut', 'der', 'Donuts', 'Do-nut', 'essen'],
    ['🥞', 'Pfannkuchen', 'der', 'Pfannkuchen', 'Pfann-ku-chen', 'essen'],
    ['🍬', 'Bonbon', 'das', 'Bonbons', 'Bon-bon', 'essen'],
    ['🧃', 'Saft', 'der', 'Säfte', 'Saft', 'essen'],
    ['🍿', 'Popcorn', 'das', null, 'Pop-corn', 'essen'],
    ['🍔', 'Hamburger', 'der', 'Hamburger', 'Ham-bur-ger', 'essen'],

    // ---------- Fahrzeuge ----------
    ['🚗', 'Auto', 'das', 'Autos', 'Au-to', 'fahrzeuge'],
    ['🚌', 'Bus', 'der', 'Busse', 'Bus', 'fahrzeuge'],
    ['🚂', 'Zug', 'der', 'Züge', 'Zug', 'fahrzeuge'],
    ['🚲', 'Fahrrad', 'das', 'Fahrräder', 'Fahr-rad', 'fahrzeuge'],
    ['✈️', 'Flugzeug', 'das', 'Flugzeuge', 'Flug-zeug', 'fahrzeuge'],
    ['🚁', 'Hubschrauber', 'der', 'Hubschrauber', 'Hub-schrau-ber', 'fahrzeuge'],
    ['🚀', 'Rakete', 'die', 'Raketen', 'Ra-ke-te', 'fahrzeuge'],
    ['🚜', 'Traktor', 'der', 'Traktoren', 'Trak-tor', 'fahrzeuge'],
    ['🚒', 'Feuerwehrauto', 'das', 'Feuerwehrautos', 'Feu-er-wehr-au-to', 'fahrzeuge'],
    ['🚓', 'Polizeiauto', 'das', 'Polizeiautos', 'Po-li-zei-au-to', 'fahrzeuge'],
    ['🚑', 'Krankenwagen', 'der', 'Krankenwagen', 'Kran-ken-wa-gen', 'fahrzeuge'],
    ['🚢', 'Schiff', 'das', 'Schiffe', 'Schiff', 'fahrzeuge'],
    ['⛵', 'Segelboot', 'das', 'Segelboote', 'Se-gel-boot', 'fahrzeuge'],
    ['🛴', 'Roller', 'der', 'Roller', 'Rol-ler', 'fahrzeuge'],
    ['🚕', 'Taxi', 'das', 'Taxis', 'Ta-xi', 'fahrzeuge'],
    ['🚚', 'Lastwagen', 'der', 'Lastwagen', 'Last-wa-gen', 'fahrzeuge'],
    ['🏍️', 'Motorrad', 'das', 'Motorräder', 'Mo-tor-rad', 'fahrzeuge'],
    ['🛶', 'Kanu', 'das', 'Kanus', 'Ka-nu', 'fahrzeuge'],

    // ---------- Kleidung ----------
    ['👔', 'Hemd', 'das', 'Hemden', 'Hemd', 'kleidung'],
    ['👖', 'Hose', 'die', 'Hosen', 'Ho-se', 'kleidung'],
    ['👗', 'Kleid', 'das', 'Kleider', 'Kleid', 'kleidung'],
    ['🧦', 'Socke', 'die', 'Socken', 'So-cke', 'kleidung'],
    ['🧤', 'Handschuh', 'der', 'Handschuhe', 'Hand-schuh', 'kleidung'],
    ['🧣', 'Schal', 'der', 'Schals', 'Schal', 'kleidung'],
    ['🎩', 'Hut', 'der', 'Hüte', 'Hut', 'kleidung'],
    ['🧢', 'Kappe', 'die', 'Kappen', 'Kap-pe', 'kleidung'],
    ['👟', 'Schuh', 'der', 'Schuhe', 'Schuh', 'kleidung'],
    ['🥾', 'Stiefel', 'der', 'Stiefel', 'Stie-fel', 'kleidung'],
    ['🧥', 'Jacke', 'die', 'Jacken', 'Ja-cke', 'kleidung'],
    ['👓', 'Brille', 'die', 'Brillen', 'Bril-le', 'kleidung'],

    // ---------- Spielzeug ----------
    ['⚽', 'Ball', 'der', 'Bälle', 'Ball', 'spielzeug'],
    ['🧸', 'Teddy', 'der', 'Teddys', 'Ted-dy', 'spielzeug'],
    ['🪁', 'Drachen', 'der', 'Drachen', 'Dra-chen', 'spielzeug'],
    ['🎈', 'Luftballon', 'der', 'Luftballons', 'Luft-bal-lon', 'spielzeug'],
    ['🧩', 'Puzzle', 'das', 'Puzzles', 'Puz-zle', 'spielzeug'],
    ['🎲', 'Würfel', 'der', 'Würfel', 'Wür-fel', 'spielzeug'],
    ['🎁', 'Geschenk', 'das', 'Geschenke', 'Ge-schenk', 'spielzeug'],
    ['🛷', 'Schlitten', 'der', 'Schlitten', 'Schlit-ten', 'spielzeug'],
    ['🤖', 'Roboter', 'der', 'Roboter', 'Ro-bo-ter', 'spielzeug'],
    ['🎠', 'Karussell', 'das', 'Karussells', 'Ka-rus-sell', 'spielzeug'],

    // ---------- Musikinstrumente ----------
    ['🥁', 'Trommel', 'die', 'Trommeln', 'Trom-mel', 'musik'],
    ['🎸', 'Gitarre', 'die', 'Gitarren', 'Gi-tar-re', 'musik'],
    ['🎺', 'Trompete', 'die', 'Trompeten', 'Trom-pe-te', 'musik'],
    ['🎹', 'Klavier', 'das', 'Klaviere', 'Kla-vier', 'musik'],
    ['🎻', 'Geige', 'die', 'Geigen', 'Gei-ge', 'musik'],
    ['🔔', 'Glocke', 'die', 'Glocken', 'Glo-cke', 'musik'],
    ['🎷', 'Saxofon', 'das', 'Saxofone', 'Sa-xo-fon', 'musik'],
    ['🎤', 'Mikrofon', 'das', 'Mikrofone', 'Mi-kro-fon', 'musik'],

    // ---------- Dinge im Haus ----------
    ['🏠', 'Haus', 'das', 'Häuser', 'Haus', 'haushalt'],
    ['🔑', 'Schlüssel', 'der', 'Schlüssel', 'Schlüs-sel', 'haushalt'],
    ['🛏️', 'Bett', 'das', 'Betten', 'Bett', 'haushalt'],
    ['🪑', 'Stuhl', 'der', 'Stühle', 'Stuhl', 'haushalt'],
    ['🚪', 'Tür', 'die', 'Türen', 'Tür', 'haushalt'],
    ['🕯️', 'Kerze', 'die', 'Kerzen', 'Ker-ze', 'haushalt'],
    ['⏰', 'Wecker', 'der', 'Wecker', 'We-cker', 'haushalt'],
    ['📖', 'Buch', 'das', 'Bücher', 'Buch', 'haushalt'],
    ['✏️', 'Stift', 'der', 'Stifte', 'Stift', 'haushalt'],
    ['✂️', 'Schere', 'die', 'Scheren', 'Sche-re', 'haushalt'],
    ['🧽', 'Schwamm', 'der', 'Schwämme', 'Schwamm', 'haushalt'],
    ['🧹', 'Besen', 'der', 'Besen', 'Be-sen', 'haushalt'],
    ['🛁', 'Badewanne', 'die', 'Badewannen', 'Ba-de-wan-ne', 'haushalt'],
    ['🔨', 'Hammer', 'der', 'Hämmer', 'Ham-mer', 'haushalt'],
    ['🧲', 'Magnet', 'der', 'Magnete', 'Ma-gnet', 'haushalt'],
    ['🥄', 'Löffel', 'der', 'Löffel', 'Löf-fel', 'haushalt'],
    ['☂️', 'Regenschirm', 'der', 'Regenschirme', 'Re-gen-schirm', 'haushalt'],
    ['👑', 'Krone', 'die', 'Kronen', 'Kro-ne', 'haushalt'],
    ['💍', 'Ring', 'der', 'Ringe', 'Ring', 'haushalt'],
    ['⚓', 'Anker', 'der', 'Anker', 'An-ker', 'haushalt'],
    ['🧺', 'Korb', 'der', 'Körbe', 'Korb', 'haushalt'],
    ['📱', 'Handy', 'das', 'Handys', 'Han-dy', 'haushalt'],
    ['📺', 'Fernseher', 'der', 'Fernseher', 'Fern-se-her', 'haushalt'],
    ['⌚', 'Uhr', 'die', 'Uhren', 'Uhr', 'haushalt'],
    ['🎒', 'Rucksack', 'der', 'Rucksäcke', 'Ruck-sack', 'haushalt'],
    ['💡', 'Glühbirne', 'die', 'Glühbirnen', 'Glüh-bir-ne', 'haushalt'],
    ['🖌️', 'Pinsel', 'der', 'Pinsel', 'Pin-sel', 'haushalt'],
    ['🔦', 'Taschenlampe', 'die', 'Taschenlampen', 'Ta-schen-lam-pe', 'haushalt'],
    ['✉️', 'Brief', 'der', 'Briefe', 'Brief', 'haushalt'],
    ['🎀', 'Schleife', 'die', 'Schleifen', 'Schlei-fe', 'haushalt'],
    ['🔒', 'Schloss', 'das', 'Schlösser', 'Schloss', 'haushalt'],
    ['🧼', 'Seife', 'die', 'Seifen', 'Sei-fe', 'haushalt'],

    // ---------- Natur & Wetter ----------
    ['☀️', 'Sonne', 'die', 'Sonnen', 'Son-ne', 'natur'],
    ['🌙', 'Mond', 'der', 'Monde', 'Mond', 'natur'],
    ['⭐', 'Stern', 'der', 'Sterne', 'Stern', 'natur'],
    ['☁️', 'Wolke', 'die', 'Wolken', 'Wol-ke', 'natur'],
    ['❄️', 'Schneeflocke', 'die', 'Schneeflocken', 'Schnee-flo-cke', 'natur'],
    ['⛄', 'Schneemann', 'der', 'Schneemänner', 'Schnee-mann', 'natur'],
    ['🌈', 'Regenbogen', 'der', 'Regenbögen', 'Re-gen-bo-gen', 'natur'],
    ['⚡', 'Blitz', 'der', 'Blitze', 'Blitz', 'natur'],
    ['🌳', 'Baum', 'der', 'Bäume', 'Baum', 'natur'],
    ['🌲', 'Tanne', 'die', 'Tannen', 'Tan-ne', 'natur'],
    ['🌷', 'Tulpe', 'die', 'Tulpen', 'Tul-pe', 'natur'],
    ['🌻', 'Sonnenblume', 'die', 'Sonnenblumen', 'Son-nen-blu-me', 'natur'],
    ['🌹', 'Rose', 'die', 'Rosen', 'Ro-se', 'natur'],
    ['🍁', 'Blatt', 'das', 'Blätter', 'Blatt', 'natur'],
    ['🌵', 'Kaktus', 'der', 'Kakteen', 'Kak-tus', 'natur'],
    ['🔥', 'Feuer', 'das', 'Feuer', 'Feu-er', 'natur'],
    ['⛰️', 'Berg', 'der', 'Berge', 'Berg', 'natur'],
    ['🌰', 'Kastanie', 'die', 'Kastanien', 'Kas-ta-nie', 'natur'],
    ['🐚', 'Muschel', 'die', 'Muscheln', 'Mu-schel', 'natur'],
    ['💧', 'Tropfen', 'der', 'Tropfen', 'Trop-fen', 'natur'],
    ['🌊', 'Welle', 'die', 'Wellen', 'Wel-le', 'natur'],
    ['🍀', 'Kleeblatt', 'das', 'Kleeblätter', 'Klee-blatt', 'natur'],
  ];

  const toId = (w) =>
    w.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-');

  const words = RAW.map(([e, w, a, p, s, c, sub]) => ({
    id: toId(w),
    e,
    w,
    a,
    p: p || null,
    s: s.split('-'),
    c,
    sub: sub || null,
  }));

  const byId = {};
  words.forEach((x) => {
    if (byId[x.id]) console.warn('Lexikon: doppelte id', x.id);
    byId[x.id] = x;
  });

  const categories = {
    tiere: { name: 'Tiere', icon: '🐾' },
    obst: { name: 'Obst', icon: '🍎' },
    gemuese: { name: 'Gemüse', icon: '🥕' },
    essen: { name: 'Essen und Trinken', icon: '🍞' },
    fahrzeuge: { name: 'Fahrzeuge', icon: '🚗' },
    kleidung: { name: 'Kleidung', icon: '👕' },
    spielzeug: { name: 'Spielzeug', icon: '🧸' },
    musik: { name: 'Musikinstrumente', icon: '🎵' },
    haushalt: { name: 'Dinge im Haus', icon: '🏠' },
    natur: { name: 'Natur und Wetter', icon: '🌳' },
  };

  const U = LT.util;
  LT.lexikon = {
    words,
    categories,
    get: (id) => byId[id] || null,
    /** Alle Wörter einer Kategorie (optional Unterkategorie). */
    byCat: (c, sub) => words.filter((x) => x.c === c && (sub === undefined || x.sub === sub)),
    /** Zufällige Auswahl, optional gefiltert. */
    random: (n, filter) => U.sample(filter ? words.filter(filter) : words, n),
    /** „die Maus“ */
    withArticle: (x) => `${x.a} ${x.w}`,
    /** „ein Apfel“ / „eine Maus“ / „ein Schaf“ */
    indefinite: (x) => (x.a === 'die' ? 'eine ' : 'ein ') + x.w,
    /** Plural (Fallback: Singular) */
    plural: (x) => x.p || x.w,
    /** Mengenangabe: 1 Apfel / 3 Äpfel */
    count: (n, x) => `${n === 1 ? (x.a === 'die' ? 'eine' : 'ein') : n} ${n === 1 ? x.w : x.p || x.w}`,
    syllables: (x) => x.s.slice(),
  };
})();
