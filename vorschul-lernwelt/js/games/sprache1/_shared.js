/* ==========================================================================
   Gemeinsame Bausteine der Spielgruppe 'sprache1' (Buchstabenland)  →  LT.s1

   Didaktischer Hintergrund – phonologische Bewusstheit
   (vgl. „Hören, lauschen, lernen“, Küspert & Schneider):
     Reime  →  Silben  →  Silben verbinden (Synthese)  →  Anlaute  →  Buchstaben
   Die Spiele arbeiten bewusst über GANZE Wörter und Silben, weil die
   Vorlesestimme (Text-to-Speech) isolierte Einzellaute unzuverlässig spricht.
   Buchstaben werden mit ihrem Namen genannt („M wie Maus“) – so wie in einer
   Anlauttabelle.

   Inhalt:
     S.words / S.byWord   geprüfte Wortdatenbank (Bild, Wort, Artikel, Sprech-
                          silben, Anfangslaut, erster Vokal, Merkmale)
     S.letterOf(w)        Anlaut-Buchstabe (nur eindeutige Anlaute, sonst null)
     S.firstSound(w)      erster Laut (für „anders anfangen“)
     S.card(word)         Bildkarte mit Wort und Anhören-Knopf
     S.sylWord(silben)    Wort in farbigen Sprechsilben mit Silbenbögen
     S.arcRow(n)          n Silbenbögen (Symbol)
     S.speakSyllables()   Silben einzeln und deutlich getrennt vorsprechen
     S.joinSyl(silben)    „ba – na – ne“ (Text für die Sprachausgabe)
     S.silben(n)          „eine Silbe“ / „drei Silben“
     S.clap()             synthetischer Klatsch-Ton (Web Audio)
     S.robotSVG()         Robo, der Roboter (eigenes SVG)
     S.lock(ctx, node)    Eingabe sperren, solange Flo noch erklärt/benennt
     S.nameTiles(ctx,box) Flo zeigt auf jede Kachel und nennt das Wort
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S = {};

  /* ------------------------------------------------------------------
     Wortdatenbank
     Spalten: Emoji | Wort | Artikel | Sprechsilben | Anfangslaut | 1. Vokal | Merkmale
       Anfangslaut (phonetisch): b d f g h j k l m n p r s(=stimmhaft wie in Sonne)
         t w z(=ts) sch, Konsonantenhäufungen: kr kl gr gl br bl tr dr fl fr pf zw
         schl schn schm schw schp(=Sp) scht(=St); '-' = Wort beginnt mit Vokal
       1. Vokal (Klangklasse): a e(auch ä) i o u ö ü au ei eu
       Merkmale: x = Bildname nicht eindeutig (z. B. 🥕 Karotte/Möhre) → nicht
                     für Anlaut-Aufgaben, bei denen das Kind selbst benennt
                 g = erste Silbe allein klingt irreführend (Ge-schenk mit
                     Schwa) → nicht als Anfangssilbe beim Roboter
     Alle Silben sind Sprechsilben (wie beim Klatschen) und wurden einzeln
     geprüft. Wörter mit strittiger Silbenzahl (Pinguin, Kastanie, Orange,
     Marienkäfer, Dinosaurier) sind bewusst NICHT enthalten.
     ------------------------------------------------------------------ */
  const DB_RAW = `
🐶|Hund|der|Hund|h|u
🐱|Katze|die|Kat-ze|k|a
🐹|Hamster|der|Hams-ter|h|a
🐭|Maus|die|Maus|m|au
🐰|Hase|der|Ha-se|h|a
🐄|Kuh|die|Kuh|k|u
🐷|Schwein|das|Schwein|schw|ei
🐑|Schaf|das|Schaf|sch|a
🐐|Ziege|die|Zie-ge|z|i
🐴|Pferd|das|Pferd|pf|e
🐓|Hahn|der|Hahn|h|a
🐥|Küken|das|Kü-ken|k|ü
🦆|Ente|die|En-te|-|e
🦊|Fuchs|der|Fuchs|f|u
🦔|Igel|der|I-gel|-|i
🦉|Eule|die|Eu-le|-|eu
🐻|Bär|der|Bär|b|e
🐺|Wolf|der|Wolf|w|o|x
🐌|Schnecke|die|Schne-cke|schn|e
🐝|Biene|die|Bie-ne|b|i
🦋|Schmetterling|der|Schmet-ter-ling|schm|e
🐛|Raupe|die|Rau-pe|r|au|x
🐜|Ameise|die|A-mei-se|-|a
🕷️|Spinne|die|Spin-ne|schp|i
🦁|Löwe|der|Lö-we|l|ö
🐯|Tiger|der|Ti-ger|t|i
🐘|Elefant|der|E-le-fant|-|e
🦒|Giraffe|die|Gi-raf-fe|g|i
🦓|Zebra|das|Ze-bra|z|e
🐒|Affe|der|Af-fe|-|a
🦛|Nilpferd|das|Nil-pferd|n|i|x
🐊|Krokodil|das|Kro-ko-dil|kr|o
🐍|Schlange|die|Schlan-ge|schl|a
🦘|Känguru|das|Kän-gu-ru|k|e
🐫|Kamel|das|Ka-mel|k|a
🦏|Nashorn|das|Nas-horn|n|a
🐼|Panda|der|Pan-da|p|a
🐨|Koala|der|Ko-a-la|k|o
🦩|Flamingo|der|Fla-min-go|fl|a
🦜|Papagei|der|Pa-pa-gei|p|a
🐟|Fisch|der|Fisch|f|i
🐳|Wal|der|Wal|w|a
🐬|Delfin|der|Del-fin|d|e
🦈|Hai|der|Hai|h|ei
🐢|Schildkröte|die|Schild-krö-te|sch|i
🐸|Frosch|der|Frosch|fr|o
🦢|Schwan|der|Schwan|schw|a
🦕|Dino|der|Di-no|d|i
🦇|Fledermaus|die|Fle-der-maus|fl|e
🦍|Gorilla|der|Go-ril-la|g|o|x
🦙|Lama|das|La-ma|l|a
🦚|Pfau|der|Pfau|pf|au
🦟|Mücke|die|Mü-cke|m|ü
🕊️|Taube|die|Tau-be|t|au|x
🍎|Apfel|der|Ap-fel|-|a
🍐|Birne|die|Bir-ne|b|i
🍌|Banane|die|Ba-na-ne|b|a
🍓|Erdbeere|die|Erd-bee-re|-|e
🍒|Kirsche|die|Kir-sche|k|i
🍇|Traube|die|Trau-be|tr|au
🍋|Zitrone|die|Zi-tro-ne|z|i
🍉|Melone|die|Me-lo-ne|m|e|x
🍍|Ananas|die|A-na-nas|-|a
🥝|Kiwi|die|Ki-wi|k|i
🥥|Kokosnuss|die|Ko-kos-nuss|k|o
🥕|Karotte|die|Ka-rot-te|k|a|x
🥔|Kartoffel|die|Kar-tof-fel|k|a
🥦|Brokkoli|der|Brok-ko-li|br|o
🥒|Gurke|die|Gur-ke|g|u
🍅|Tomate|die|To-ma-te|t|o
🌽|Mais|der|Mais|m|ei
🧅|Zwiebel|die|Zwie-bel|zw|i
🍄|Pilz|der|Pilz|p|i
🥬|Salat|der|Sa-lat|s|a
🥑|Avocado|die|A-vo-ca-do|-|a|x
🍞|Brot|das|Brot|br|o
🧀|Käse|der|Kä-se|k|e
🥚|Ei|das|Ei|-|ei
🍦|Eis|das|Eis|-|ei
🍕|Pizza|die|Piz-za|p|i
🍪|Keks|der|Keks|k|e
🍯|Honig|der|Ho-nig|h|o
🥨|Brezel|die|Bre-zel|br|e
🍭|Lutscher|der|Lut-scher|l|u
🍫|Schokolade|die|Scho-ko-la-de|sch|o
🧁|Muffin|der|Muf-fin|m|u|x
🍩|Donut|der|Do-nut|d|o
🥞|Pfannkuchen|der|Pfann-ku-chen|pf|a
🍿|Popcorn|das|Pop-corn|p|o
🍔|Hamburger|der|Ham-bur-ger|h|a|x
🧃|Saft|der|Saft|s|a|x
🚗|Auto|das|Au-to|-|au
🚌|Bus|der|Bus|b|u
🚂|Zug|der|Zug|z|u|x
🚲|Fahrrad|das|Fahr-rad|f|a
✈️|Flugzeug|das|Flug-zeug|fl|u
🚁|Hubschrauber|der|Hub-schrau-ber|h|u
🚀|Rakete|die|Ra-ke-te|r|a
🚜|Traktor|der|Trak-tor|tr|a
🚒|Feuerwehrauto|das|Feu-er-wehr-au-to|f|eu
🚓|Polizeiauto|das|Po-li-zei-au-to|p|o
🚑|Krankenwagen|der|Kran-ken-wa-gen|kr|a
🚢|Schiff|das|Schiff|sch|i
⛵|Segelboot|das|Se-gel-boot|s|e|x
🛴|Roller|der|Rol-ler|r|o
🚕|Taxi|das|Ta-xi|t|a|x
🚚|Lastwagen|der|Last-wa-gen|l|a
🏍️|Motorrad|das|Mo-tor-rad|m|o
👖|Hose|die|Ho-se|h|o
🧦|Socke|die|So-cke|s|o
🧤|Handschuh|der|Hand-schuh|h|a
🧣|Schal|der|Schal|sch|a
🎩|Hut|der|Hut|h|u
👟|Schuh|der|Schuh|sch|u
🥾|Stiefel|der|Stie-fel|scht|i
🧥|Jacke|die|Ja-cke|j|a|x
👓|Brille|die|Bril-le|br|i
👗|Kleid|das|Kleid|kl|ei
👜|Tasche|die|Ta-sche|t|a|x
🧸|Teddy|der|Ted-dy|t|e
🪁|Drachen|der|Dra-chen|dr|a
🎈|Luftballon|der|Luft-bal-lon|l|u|x
🎲|Würfel|der|Wür-fel|w|ü
🎁|Geschenk|das|Ge-schenk|g|e|g
🛷|Schlitten|der|Schlit-ten|schl|i
🤖|Roboter|der|Ro-bo-ter|r|o
🎠|Karussell|das|Ka-rus-sell|k|a
🥁|Trommel|die|Trom-mel|tr|o
🎸|Gitarre|die|Gi-tar-re|g|i
🎺|Trompete|die|Trom-pe-te|tr|o
🎻|Geige|die|Gei-ge|g|ei
🔔|Glocke|die|Glo-cke|gl|o
🎤|Mikrofon|das|Mi-kro-fon|m|i
☎️|Telefon|das|Te-le-fon|t|e
📷|Kamera|die|Ka-me-ra|k|a|x
🏠|Haus|das|Haus|h|au
🔑|Schlüssel|der|Schlüs-sel|schl|ü
🛏️|Bett|das|Bett|b|e
🚪|Tür|die|Tür|t|ü
🕯️|Kerze|die|Ker-ze|k|e
⏰|Wecker|der|We-cker|w|e|x
📖|Buch|das|Buch|b|u
✂️|Schere|die|Sche-re|sch|e
🧹|Besen|der|Be-sen|b|e
🛁|Badewanne|die|Ba-de-wan-ne|b|a|x
🔨|Hammer|der|Ham-mer|h|a
🧲|Magnet|der|Ma-gnet|m|a
🥄|Löffel|der|Löf-fel|l|ö
☂️|Regenschirm|der|Re-gen-schirm|r|e|x
👑|Krone|die|Kro-ne|kr|o
💍|Ring|der|Ring|r|i
⚓|Anker|der|An-ker|-|a
📱|Handy|das|Han-dy|h|a
📺|Fernseher|der|Fern-se-her|f|e
⌚|Uhr|die|Uhr|-|u
🎒|Rucksack|der|Ruck-sack|r|u|x
💡|Glühbirne|die|Glüh-bir-ne|gl|ü|x
🖌️|Pinsel|der|Pin-sel|p|i
🔦|Taschenlampe|die|Ta-schen-lam-pe|t|a|x
🎀|Schleife|die|Schlei-fe|schl|ei
🧼|Seife|die|Sei-fe|s|ei
🥫|Dose|die|Do-se|d|o
🍼|Flasche|die|Fla-sche|fl|a|x
🚦|Ampel|die|Am-pel|-|a
🛸|Ufo|das|U-fo|-|u
🏝️|Insel|die|In-sel|-|i
⛺|Zelt|das|Zelt|z|e
☀️|Sonne|die|Son-ne|s|o
🌙|Mond|der|Mond|m|o
⭐|Stern|der|Stern|scht|e
☁️|Wolke|die|Wol-ke|w|o
❄️|Schneeflocke|die|Schnee-flo-cke|schn|e
⛄|Schneemann|der|Schnee-mann|schn|e
🌈|Regenbogen|der|Re-gen-bo-gen|r|e
⚡|Blitz|der|Blitz|bl|i
🌳|Baum|der|Baum|b|au
🌷|Tulpe|die|Tul-pe|t|u|x
🌹|Rose|die|Ro-se|r|o
🌵|Kaktus|der|Kak-tus|k|a
🔥|Feuer|das|Feu-er|f|eu
🐚|Muschel|die|Mu-schel|m|u
💧|Tropfen|der|Trop-fen|tr|o
🍀|Kleeblatt|das|Klee-blatt|kl|e
🌻|Sonnenblume|die|Son-nen-blu-me|s|o|x
👃|Nase|die|Na-se|n|a
👄|Mund|der|Mund|m|u|x
👂|Ohr|das|Ohr|-|o
🦷|Zahn|der|Zahn|z|a
👍|Daumen|der|Dau-men|d|au
🦶|Fuß|der|Fuß|f|u
🦵|Bein|das|Bein|b|ei
✋|Hand|die|Hand|h|a
👵|Oma|die|O-ma|-|o
👴|Opa|der|O-pa|-|o
`;

  /* Emoji, die ohne Variantenselektor (U+FE0F) als schwarzer Text erscheinen
     würden, bekommen ihn automatisch angehängt. */
  const TEXT_DEFAULT = new Set([0x2600, 0x2601, 0x2602, 0x260e, 0x2702, 0x2708, 0x2709, 0x270f, 0x2744,
    0x1f54a, 0x1f3d6, 0x1f3dd, 0x1f577, 0x1f6cf, 0x1f56f, 0x1f58c, 0x1f3cd, 0x1f43f, 0x1f32c, 0x1f576]);
  S.fe0f = function (e) {
    const cps = Array.from(e);
    if (cps.length === 1 && TEXT_DEFAULT.has(cps[0].codePointAt(0))) return e + '️';
    return e;
  };

  const toId = (w) => w.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-');

  S.words = DB_RAW.trim().split('\n').map((line) => {
    const [e, w, a, s, on, v, flags = ''] = line.trim().split('|');
    return { id: toId(w), e: S.fe0f(e), w, a, s: s.split('-'), on, v, x: flags.includes('x'), g: flags.includes('g') };
  });
  S.byWord = {};
  S.words.forEach((x) => {
    if (S.byWord[x.w]) console.warn('sprache1: doppeltes Wort', x.w);
    S.byWord[x.w] = x;
  });

  /* ------------------------------------------------------------------
     Laute & Buchstaben
     ------------------------------------------------------------------ */
  const ON2LETTER = { b: 'B', d: 'D', f: 'F', g: 'G', h: 'H', j: 'J', k: 'K', l: 'L', m: 'M', n: 'N', p: 'P', r: 'R', s: 'S', t: 'T', w: 'W', z: 'Z', sch: 'Sch' };
  const V2LETTER = { a: 'A', e: 'E', i: 'I', o: 'O', u: 'U' };
  /** Anlaut-Buchstabe – NUR bei eindeutigem Einzel-Anlaut (kein Cluster,
      kein Diphthong, Schreibung passt zum Laut), sonst null. */
  S.letterOf = function (x) {
    const L = x.on === '-' ? V2LETTER[x.v] : ON2LETTER[x.on];
    if (!L) return null;
    return x.w.startsWith(L) ? L : null;
  };
  const FIRST = { schl: 'sch', schn: 'sch', schm: 'sch', schw: 'sch', schp: 'sch', scht: 'sch', kr: 'k', kl: 'k', br: 'b', bl: 'b', tr: 't', dr: 'd', gr: 'g', gl: 'g', fl: 'f', fr: 'f', pf: 'p', zw: 'z' };
  /** Erster Laut (Cluster zählen zu ihrem ersten Konsonanten). */
  S.firstSound = (x) => (x.on === '-' ? 'V' + x.v : FIRST[x.on] || x.on);

  /* ------------------------------------------------------------------
     Sprache
     ------------------------------------------------------------------ */
  /**
   * Silbe für die Sprachausgabe aufbereiten (isolierte Silben liest die
   * Stimme nach Ausspracheregeln für ganze Wörter):
   *  - immer klein: „Di“, „Sa“, „Mo“ würden sonst evtl. als Abkürzung
   *    (Dienstag, Samstag, Montag) oder „Eu“ als „E-U“ gelesen
   *  - „cke“ → „ke“ (So-cke, Glo-cke)
   *  - v im Wortinneren klingt wie w: Kla-vier → „wier“ (nicht „vier“ = 4),
   *    Lo-ko-mo-ti-ve → „we“
   *  - y am Silbenende klingt wie i: Ted-dy, Han-dy → „di“ (nicht „dü“)
   */
  S.sylSpeak = function (syl, i) {
    let t = syl.toLowerCase();
    if (t.startsWith('ck')) t = 'k' + t.slice(2);
    if (i > 0 && t.startsWith('v')) t = 'w' + t.slice(1);
    if (i > 0 && t.endsWith('y')) t = t.slice(0, -1) + 'i';
    return t;
  };
  /** „ba – na – ne“ (Gedankenstrich = hörbare Pause in der Vorlesestimme) */
  S.joinSyl = (syls, sep = ' – ') => syls.map((s, i) => S.sylSpeak(s, i)).join(sep);
  /** „eine Silbe“, „drei Silben“ */
  S.silben = (n) => (n === 1 ? 'eine Silbe' : `${U.numberWord(n)} Silben`);
  /** „mit einer Silbe“, „mit drei Silben“ */
  S.mitSilben = (n) => (n === 1 ? 'mit einer Silbe' : `mit ${U.numberWord(n)} Silben`);
  /** „die Banane“ */
  S.withArticle = (x) => `${x.a} ${x.w}`;
  /** Robo-Stimme: tiefer und etwas langsamer */
  S.robotVoice = () => ({ pitch: 0.55, rate: Math.max(0.55, (LT.speech.rate || 0.9) * 0.82) });

  /**
   * Silben einzeln und deutlich getrennt vorsprechen.
   * opts: { onEach(i), gap (ms), rate, pitch, clap: true }
   */
  S.speakSyllables = async function (ctx, syls, opts = {}) {
    const rate = opts.rate || Math.max(0.6, (LT.speech.rate || 0.9) * 0.85);
    for (let i = 0; i < syls.length; i++) {
      if (!ctx.active) return;
      if (opts.onEach) opts.onEach(i);
      if (opts.clap !== false) S.clap();
      await ctx.say(S.sylSpeak(syls[i], i), { rate, pitch: opts.pitch });
      await ctx.sleep(opts.gap == null ? 260 : opts.gap);
    }
    if (opts.onEach) opts.onEach(-1);
  };

  /* ------------------------------------------------------------------
     Darstellung
     ------------------------------------------------------------------ */
  const ARC_SVG = '<svg viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M5 5 Q50 56 95 5"/></svg>';

  /** Bildkarte: großes Bild, Wort darunter, Anhören-Knopf. */
  S.card = function (word, { label = true, speak = true, cls = '' } = {}) {
    const pic = U.emoji(word.e, 'big-emoji s1-card-pic');
    const lab = label ? el('div.s1-card-word', word.w) : null;
    const card = el('div.prompt-box.s1-card' + (cls ? '.' + cls.split(' ').join('.') : ''), pic, lab);
    if (speak) {
      const b = LT.ui.speakButton(() => word.w, { cls: 's1-card-say' });
      b.setAttribute('aria-label', word.w + ' anhören');
      card.appendChild(b);
    }
    card._pic = pic;
    card._label = lab;
    return card;
  };

  /** Wort in Sprechsilben (abwechselnd blau/rot wie in der Silbenmethode) mit Bögen. */
  S.sylWord = function (syls, { arcs = true, colors = true } = {}) {
    const box = el('div.s1-syl', { 'aria-label': syls.join('-') });
    box._parts = syls.map((s, i) => {
      const p = el('span.s1-syl-part' + (colors ? (i % 2 ? '.c2' : '.c1') : ''), el('span.s1-syl-txt', s), arcs ? el('span.s1-arc', { html: ARC_SVG }) : null);
      box.appendChild(p);
      return p;
    });
    box.highlight = (i) => box._parts.forEach((p, k) => p.classList.toggle('on', k === i));
    return box;
  };

  /** Ein einzelner Silbenbogen (z. B. für die Klatsch-Ablage). */
  S.arc = (cls = '') => el('span.s1-tarc' + (cls ? '.' + cls : ''), { html: ARC_SVG });

  /** Reihe aus n Silbenbögen (Symbol für die Silbenzahl). */
  S.arcRow = function (n, cls = '') {
    const row = el('span.s1-arcrow' + (cls ? '.' + cls : ''), { 'aria-hidden': 'true' });
    for (let i = 0; i < n; i++) row.appendChild(S.arc());
    return row;
  };

  /* ------------------------------------------------------------------
     Klatsch-Ton (Rauschimpulse, Web Audio) – respektiert Ton-Einstellung
     ------------------------------------------------------------------ */
  let actx = null;
  let noise = null;
  S.clap = function () {
    if (LT.config.test || !LT.sfx.enabled) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) actx = new AC();
      if (actx.state === 'suspended') actx.resume().catch(() => {});
      if (!noise) {
        const len = Math.floor(actx.sampleRate * 0.3);
        noise = actx.createBuffer(1, len, actx.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      const t0 = actx.currentTime + 0.005;
      // Zwei Hände treffen nie ganz gleichzeitig: drei kurze Impulse, der letzte hallt nach
      [0, 0.012, 0.024].forEach((dt, k) => {
        const src = actx.createBufferSource();
        src.buffer = noise;
        const bp = actx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1050 + k * 180;
        bp.Q.value = 1.1;
        const g = actx.createGain();
        const end = k === 2 ? 0.17 : 0.025;
        g.gain.setValueAtTime(0.0001, t0 + dt);
        g.gain.exponentialRampToValueAtTime(0.75, t0 + dt + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + end);
        src.connect(bp);
        bp.connect(g);
        g.connect(actx.destination);
        src.start(t0 + dt, Math.random() * 0.1);
        src.stop(t0 + dt + end + 0.03);
      });
    } catch (e) { /* Ton ist nur Beiwerk */ }
  };

  /* ------------------------------------------------------------------
     Robo, der Roboter (eigenes SVG). Zustände per Klasse am Container:
     .talking (Mund-Balken), .happy (Lachaugen, Winken), .confused, .s1-beat
     ------------------------------------------------------------------ */
  S.robotSVG = function () {
    const bars = [72.5, 84.5, 96.5, 108.5, 120.5].map((x) => `<rect x="${x}" y="104" width="7" height="16" rx="3.5"/>`).join('');
    return `
<svg viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <ellipse cx="100" cy="226" rx="62" ry="6" fill="#2b2d42" opacity=".12"/>
  <line x1="100" y1="40" x2="100" y2="18" stroke="#5b6b82" stroke-width="5" stroke-linecap="round"/>
  <circle class="s1-robo-ant" cx="100" cy="14" r="9" fill="#ff5fa2" stroke="#5b6b82" stroke-width="3"/>
  <rect x="20" y="70" width="18" height="40" rx="7" fill="#8e9fb8" stroke="#5b6b82" stroke-width="3"/>
  <rect x="162" y="70" width="18" height="40" rx="7" fill="#8e9fb8" stroke="#5b6b82" stroke-width="3"/>
  <rect x="34" y="38" width="132" height="106" rx="28" fill="#d4def0" stroke="#5b6b82" stroke-width="4"/>
  <rect x="48" y="52" width="104" height="78" rx="20" fill="#2b2d42"/>
  <g class="s1-robo-eyes" fill="#5ef0ff">
    <circle cx="76" cy="80" r="11"/><circle cx="124" cy="80" r="11"/>
    <circle cx="79" cy="77" r="3.5" fill="#fff"/><circle cx="127" cy="77" r="3.5" fill="#fff"/>
  </g>
  <g class="s1-robo-happy" fill="none" stroke="#5ef0ff" stroke-width="6" stroke-linecap="round">
    <path d="M64 85 Q76 68 88 85"/><path d="M112 85 Q124 68 136 85"/>
  </g>
  <g class="s1-robo-mouth" fill="#5ef0ff">${bars}</g>
  <circle cx="58" cy="118" r="5" fill="#ff8fb8" opacity=".8"/>
  <circle cx="142" cy="118" r="5" fill="#ff8fb8" opacity=".8"/>
  <rect x="86" y="143" width="28" height="12" fill="#8e9fb8" stroke="#5b6b82" stroke-width="3"/>
  <g class="s1-robo-arm s1-robo-arm-l"><path d="M54 172 Q32 180 26 204" stroke="#5b6b82" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="25" cy="208" r="10" fill="#8e9fb8" stroke="#5b6b82" stroke-width="3"/></g>
  <g class="s1-robo-arm s1-robo-arm-r"><path d="M146 172 Q168 180 174 204" stroke="#5b6b82" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="175" cy="208" r="10" fill="#8e9fb8" stroke="#5b6b82" stroke-width="3"/></g>
  <rect x="50" y="153" width="100" height="70" rx="20" fill="#d4def0" stroke="#5b6b82" stroke-width="4"/>
  <circle class="s1-robo-light" cx="100" cy="186" r="14" fill="#ffc533" stroke="#5b6b82" stroke-width="3"/>
  <circle cx="70" cy="206" r="4" fill="#8e9fb8"/><circle cx="130" cy="206" r="4" fill="#8e9fb8"/>
</svg>`;
  };

  /** Kurzes Piep-Geräusch, bevor Robo spricht. */
  S.robotBeep = function () {
    LT.sfx.tone(660, 0.07, { type: 'square', volume: 0.12 });
    LT.sfx.tone(880, 0.09, { type: 'square', volume: 0.12, delay: 0.09 });
  };

  /* ------------------------------------------------------------------
     Ablauf-Helfer
     ------------------------------------------------------------------ */
  /** Klicks in node abfangen, bis release() aufgerufen wird (Flo erklärt noch). */
  S.lock = function (ctx, node) {
    let locked = true;
    const fn = (e) => {
      if (!locked) return;
      e.stopPropagation();
      e.preventDefault();
    };
    ctx.listen(node, 'click', fn, true);
    node.classList.add('s1-wait');
    return {
      release() {
        locked = false;
        node.classList.remove('s1-wait');
      },
      get locked() { return locked; },
    };
  };

  /** Flo zeigt nacheinander auf jede Kachel (aus ctx.choices) und nennt sie. */
  S.nameTiles = async function (ctx, box) {
    const tiles = box._tiles || [];
    for (const t of tiles) {
      if (!ctx.active) return;
      const it = t._item;
      if (!it || !it.say) continue;
      t.classList.add('speaking');
      await ctx.say(it.say);
      t.classList.remove('speaking');
      await ctx.sleep(140);
    }
  };

  /** Zufällig einen von mehreren Sätzen (Abwechslung beim Feedback). */
  S.vary = (key, list) => U.pickFresh('s1-' + key, list, Math.min(2, list.length - 1));

  LT.s1 = S;
})();
