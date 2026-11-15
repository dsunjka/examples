/* ==========================================================================
   Spiel „Hörkönig“ 👑 (Leseschule, Klasse 1) – phonologische Bewusstheit
   im engeren Sinn, erweitert (Plan A13).

   Didaktik:
   - Rein auditiv: Flo spricht ein Wort, das Bild zeigt es, das geschriebene
     Wort bleibt verborgen, bis die Aufgabe gelöst ist (sonst würde das Kind
     den Buchstaben optisch suchen statt zu hören). Nach dem Lösen erscheint
     das Wort mit markiertem Laut als Brücke zur Schrift.
   - Die Vorlesestimme kann isolierte Laute nicht sauber sprechen. Flo nennt
     Buchstaben deshalb mit Namen („das M“, „das S C H“) – wie in den anderen
     Spielen – und erinnert: Wir hören auf den LAUT im Wort.
   - Gearbeitet wird mit Lauten, nicht mit Buchstaben: ll, ff, ah, oo, ie,
     sch, ei, au sind je EIN Laut. Unsichere Stellen (Auslautverhärtung wie
     d in Mond, vokalisiertes r wie in Turm, Schwa-e) werden nie abgefragt.
   - Stufen:
       1  Brücke aus der Vorschule: Wo hörst du das M – am Anfang, in der
          Mitte oder am Ende? Schwerpunkt Auslaut (3 Positionskästchen)
       2  Inlaut: Welchen Selbstlaut hörst du in der Mitte (Hut, Ball)?
          Dazu: Laute zählen (Affe hat drei Laute) und Mitte orten
       3  Laut weglassen: „Reis ohne R“ → Eis (Bildauswahl)
       4  Laut austauschen: „Maus, aus M wird H“ → Haus; später in der Mitte
          (Hund → Hand) und am Ende (Schaf → Schal)
       5  Lange und kurze Selbstlaute (Hase/Katze) mit Strich und Punkt –
          Vorbereitung auf die Rechtschreibung in Klasse 2
   - Fehlvorstellungen und Hilfe-Leiter (über ctx.choices):
       * Buchstabennamen statt Laute → Intro + Hinweis „Hör auf den Laut“
       * Silben oder Buchstaben statt Laute zählen → eigene Erklärung
       * beim Austauschen nur den Anfang beachten / gar nicht tauschen →
         Ablenker „altes Wort“ und „gleicher Anfang“ mit eigener Erklärung
       1. Fehler: erklären, was an der Wahl nicht passt; 2.: Strategie
       („Sprich ganz langsam, wie eine Schnecke“); 3.: Flo macht es vor.
   - Lerninhalte (ctx.item): „Maus: S“, „Hut: U“, „Laute: Affe“,
     „Reis ohne R“, „Maus zu Haus“, „Hase lang?“.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = (n) => U.numberWord(n);

  /* ------------------------------------------------------------------
     Wortdatenbank: Wort | Bild | Laute (geschrieben, durch Leerzeichen
     getrennt; * = unsichere Stelle, wird nie abgefragt) | Merkmale
     (! = nicht zum Laute-Zählen, weil strittig)
     ------------------------------------------------------------------ */
  const DB_RAW = `
Hut|🎩|h u t
Bus|🚌|b u s
Hund|🐶|h u n d*
Mund|👄|m u n d*
Fisch|🐟|f i sch
Pilz|🍄|p i l z
Schiff|🚢|sch i ff
Ball|⚽|b a ll
Hahn|🐓|h ah n
Zahn|🦷|z ah n
Wal|🐳|w a l
Schaf|🐑|sch a f
Schal|🧣|sch a l
Bett|🛏️|b e tt
Zelt|⛺|z e l t
Herz|❤️|h e r* z|!
Keks|🍪|k e k s
Mond|🌙|m o n d*
Boot|⛵|b oo t
Frosch|🐸|f r o sch
Brot|🍞|b r o t
Korb|🧺|k o r* b*|!
Hand|✋|h a n d*
Milch|🥛|m i l ch*
Ring|💍|r i ng*
Brief|✉️|b r ie f
Kran|🏗️|k r a n
Huhn|🐔|h uh n
Turm|🗼|t u r* m|!
Stuhl|🪑|st* uh l|!
Maus|🐭|m au s
Haus|🏠|h au s
Mais|🌽|m ai* s
Eis|🍦|ei s
Reis|🍚|r ei s
Kuh|🐄|k uh
Schuh|👞|sch uh
Baum|🌳|b au m
Arm|💪|a r* m|!
Bein|🦵|b ei n
Nase|👃|n a s e*
Hose|👖|h o s e*
Rose|🌹|r o s e*
Sofa|🛋️|s o f a
Lama|🦙|l a m a
Igel|🦔|i g e* l
Ente|🦆|e n t e*
Affe|🐒|a ff e*
Tasse|☕|t a ss e*
Sonne|☀️|s o nn e*
Kamel|🐫|k a m e l
Salat|🥗|s a l a t
Pirat|🏴‍☠️|p i r a t
Dino|🦕|d i n o
Lupe|🔍|l u p e*
Zebra|🦓|z e b r a
Panda|🐼|p a n d a
Krone|👑|k r o n e*
Tomate|🍅|t o m a t e*
Banane|🍌|b a n a n e*
Rakete|🚀|r a k e t e*
Delfin|🐬|d e l f i n
Pinsel|🖌️|p i n s e* l
Wolke|☁️|w o l k e*
Tulpe|🌷|t u l p e*
Seife|🧼|s ei f e*
Schwein|🐷|sch w ei n
Besen|🧹|b e s e* n
Biene|🐝|b ie n e*
Ziege|🐐|z ie g e*
Blume|🌸|b l u m e*
Kiwi|🥝|k i w i
Hammer|🔨|h a mm er*|!
Tiger|🐯|t i g er*|!
Kaktus|🌵|k a k t u s
`;

  /** Kanonischer Laut eines geschriebenen Lautzeichens („ll“ → „l“, „ah“ → „a“). */
  const CANON = { sch: 'sch', ch: 'ch', ei: 'ei', ai: 'ei', au: 'au', eu: 'eu', ng: 'ng', ie: 'i', ah: 'a', uh: 'u', oo: 'o', ee: 'e', ck: 'k', st: 'st', er: 'er' };
  const canon = (t) => CANON[t] || t.charAt(0);
  const VOW = ['a', 'e', 'i', 'o', 'u', 'ö', 'ü', 'ei', 'au', 'eu'];
  const isVowelTok = (tok) => VOW.includes(canon(tok.t)) || tok.t === 'er';
  /** Buchstabe zum Zeigen: „M“, „Sch“, „Ei“ */
  const disp = (c) => (c.length > 1 ? U.cap(c) : c.toUpperCase());
  /** Buchstabe zum Sprechen (Großbuchstaben, damit die Stimme den Namen sagt). */
  const SAYL = { sch: 'S C H', ch: 'C H', ei: 'E I', au: 'A U', eu: 'E U' };
  const sayL = (c) => SAYL[c] || c.toUpperCase();

  const WORDS = DB_RAW.trim().split('\n').map((line) => {
    const [w, e, ph, fl] = line.split('|');
    const toks = ph.split(' ').map((s) => ({ t: s.replace('*', ''), safe: !s.includes('*') }));
    toks.forEach((tok) => { tok.c = canon(tok.t); tok.v = isVowelTok(tok); });
    return { w, e, toks, noCount: (fl || '').includes('!'), sounds: toks.length, letters: w.length, syl: toks.filter((x) => x.v).length };
  });
  const BY = {};
  WORDS.forEach((x) => { BY[x.w] = x; });

  /* ------------------------------------------------------------------
     Aufgaben-Pools (automatisch aus der Datenbank)
     ------------------------------------------------------------------ */
  const POS = ['Anfang', 'Mitte', 'Ende'];
  const POS_PHRASE = { Anfang: 'ganz am Anfang', Mitte: 'in der Mitte', Ende: 'ganz am Ende' };

  /** Wo hörst du …? – nur eindeutige, sichere Laute; Mitte nur zwischen zwei Selbstlauten. */
  const WHERE = [];
  WORDS.forEach((x) => {
    const n = x.toks.length;
    x.toks.forEach((tok, i) => {
      if (!tok.safe || tok.c === 'er') return;
      if (x.toks.some((o, k) => k !== i && (o.c === tok.c || o.t.includes(tok.c) && tok.c.length === 1 && !o.safe))) return;
      let pos = null;
      if (i === 0) pos = 'Anfang';
      else if (i === n - 1) pos = 'Ende';
      else if (!tok.v && x.toks[i - 1].v && x.toks[i + 1].v && x.syl >= 2) pos = 'Mitte';
      if (!pos) return;
      if (tok.v && pos !== 'Anfang' && pos !== 'Ende') return;
      WHERE.push({ x, i, c: tok.c, pos, key: `${x.w}: ${disp(tok.c)}` });
    });
  });

  /** Welcher Selbstlaut in der Mitte? – einsilbige Wörter mit genau einem Selbstlaut innen. */
  const VOWEL5 = ['a', 'e', 'i', 'o', 'u'];
  const VOWEL_TASKS = WORDS.filter((x) => {
    const vs = x.toks.map((t, i) => (t.v ? i : -1)).filter((i) => i >= 0);
    return vs.length === 1 && vs[0] > 0 && vs[0] < x.toks.length - 1 && VOWEL5.includes(x.toks[vs[0]].c);
  }).map((x) => {
    const i = x.toks.findIndex((t) => t.v);
    return { x, i, v: x.toks[i].c, key: `${x.w}: ${x.toks[i].c.toUpperCase()}` };
  });
  const SIM_V = { a: ['o', 'e'], e: ['i', 'a'], i: ['e', 'u'], o: ['u', 'a'], u: ['o', 'i'] };

  /** Laute zählen */
  const COUNT_TASKS = WORDS.filter((x) => !x.noCount && x.sounds >= 2 && x.sounds <= 6)
    .map((x) => ({ x, n: x.sounds, key: `Laute: ${x.w}` }));

  /* Bilder für Stufe 3 und 4 (auch Mehrzahl als doppeltes Bild) */
  const PIC = {
    Reis: '🍚', Eis: '🍦', Mais: '🌽', Maus: '🐭', Ei: '🥚', Kreis: '⭕', Kran: '🏗️', Brot: '🍞', rot: '🔴', Boot: '⛵',
    Rose: '🌹', Bus: '🚌', Tor: '🥅', Ohr: '👂', Uhr: '⌚', Eule: '🦉', Biene: '🐝', Igel: '🦔', Ziegel: '🧱', Ziege: '🐐',
    Arm: '💪', Wal: '🐳', Hose: '👖', Hosen: '👖👖', Rosen: '🌹🌹', Hase: '🐰', Hasen: '🐰🐰', Nase: '👃', Banane: '🍌',
    Bananen: '🍌🍌', Ananas: '🍍', Tomate: '🍅', Tomaten: '🍅🍅', Rakete: '🚀', Haus: '🏠', Hund: '🐶', Mund: '👄',
    Mond: '🌙', Hand: '✋', Dose: '🥫', Kuh: '🐄', Schuh: '👞', Schaf: '🐑', Zahn: '🦷', Hahn: '🐓', Huhn: '🐔',
    Rad: '🚲', Bad: '🛁', Bett: '🛏️', Ball: '⚽', Tasse: '☕', Tasche: '👜', Flasche: '🍾', Schal: '🧣', Hut: '🎩',
    Fisch: '🐟', Sonne: '☀️', Apfel: '🍎',
  };
  /** Anzeige- und Sprechname (rot ist kein Namenwort) */
  const SPOKEN = { rot: 'rot' };

  /* Stufe 3: Laut weglassen. src ohne Bild → Sprechblase. */
  const DELETE = [
    { src: 'Reis', del: 'r', pos: 'Anfang', res: 'Eis', d: ['Reis', 'Ei', 'Mais'] },
    { src: 'Mais', del: 'm', pos: 'Anfang', res: 'Eis', d: ['Mais', 'Maus', 'Ei'] },
    { src: 'Kreis', del: 'k', pos: 'Anfang', res: 'Reis', d: ['Kreis', 'Eis', 'Kran'] },
    { src: 'Brot', del: 'b', pos: 'Anfang', res: 'rot', d: ['Brot', 'Boot', 'Rose'] },
    { src: 'Tor', del: 't', pos: 'Anfang', res: 'Ohr', d: ['Tor', 'Uhr', 'Hut'] },
    { src: 'Beule', del: 'b', pos: 'Anfang', res: 'Eule', d: ['Biene', 'Eis', 'Igel'], nopic: true },
    { src: 'Ziegel', del: 'z', pos: 'Anfang', res: 'Igel', d: ['Ziegel', 'Ziege', 'Eule'] },
    { src: 'warm', del: 'w', pos: 'Anfang', res: 'Arm', d: ['Wal', 'Ohr', 'Ball'], nopic: true },
    { src: 'Hosen', del: 'n', pos: 'Ende', res: 'Hose', d: ['Hosen', 'Rose', 'Hase'] },
    { src: 'Rosen', del: 'n', pos: 'Ende', res: 'Rose', d: ['Rosen', 'Hose', 'Nase'] },
    { src: 'Hasen', del: 'n', pos: 'Ende', res: 'Hase', d: ['Hasen', 'Nase', 'Hose'] },
    { src: 'Bananen', del: 'n', pos: 'Ende', res: 'Banane', d: ['Bananen', 'Ananas', 'Tomate'] },
    { src: 'Tomaten', del: 'n', pos: 'Ende', res: 'Tomate', d: ['Tomaten', 'Rakete', 'Banane'] },
    { src: 'Brot', del: 'r', pos: 'Mitte', res: 'Boot', d: ['Brot', 'rot', 'Bus'] },
  ].map((t) => Object.assign(t, { key: `${t.src} ohne ${disp(t.del)}` }));

  /* Stufe 4: Laut austauschen. */
  const SWAP = [
    { src: 'Maus', from: 'm', to: 'h', pos: 'Anfang', res: 'Haus', d: ['Maus', 'Hase', 'Mais'] },
    { src: 'Hund', from: 'h', to: 'm', pos: 'Anfang', res: 'Mund', d: ['Hund', 'Mond', 'Hand'] },
    { src: 'Nase', from: 'n', to: 'h', pos: 'Anfang', res: 'Hase', d: ['Nase', 'Hose', 'Hahn'] },
    { src: 'Hose', from: 'h', to: 'r', pos: 'Anfang', res: 'Rose', d: ['Hose', 'Rakete', 'Nase'] },
    { src: 'Rose', from: 'r', to: 'd', pos: 'Anfang', res: 'Dose', d: ['Rose', 'Hose', 'Bad'] },
    { src: 'Kuh', from: 'k', to: 'sch', pos: 'Anfang', res: 'Schuh', d: ['Kuh', 'Schaf', 'Hut'] },
    { src: 'Zahn', from: 'z', to: 'h', pos: 'Anfang', res: 'Hahn', d: ['Zahn', 'Huhn', 'Hase'] },
    { src: 'Rad', from: 'r', to: 'b', pos: 'Anfang', res: 'Bad', d: ['Rad', 'Bett', 'Ball'] },
    { src: 'Mais', from: 'm', to: 'r', pos: 'Anfang', res: 'Reis', d: ['Mais', 'Eis', 'Rose'] },
    { src: 'Hund', from: 'u', to: 'a', pos: 'Mitte', res: 'Hand', d: ['Hund', 'Mund', 'Hahn'] },
    { src: 'Hose', from: 'o', to: 'a', pos: 'Mitte', res: 'Hase', d: ['Hose', 'Nase', 'Rose'] },
    { src: 'Mond', from: 'o', to: 'u', pos: 'Mitte', res: 'Mund', d: ['Mond', 'Hund', 'Maus'] },
    { src: 'Tasse', from: 's', to: 'sch', pos: 'Mitte', res: 'Tasche', d: ['Tasse', 'Flasche', 'Tomate'] },
    { src: 'Schaf', from: 'f', to: 'l', pos: 'Ende', res: 'Schal', d: ['Schaf', 'Schuh', 'Wal'] },
    { src: 'Hut', from: 't', to: 'n', pos: 'Ende', res: 'Huhn', d: ['Hut', 'Hund', 'Hahn'] },
  ].map((t) => Object.assign(t, { key: `${t.src} zu ${t.res}` }));

  /* Stufe 5: lange (L) und kurze (K) Selbstlaute – der erste Selbstlaut im Wort. */
  const LEN_RAW = `
Hase|🐰|a|L
Nase|👃|a|L
Wal|🐳|a|L
Schal|🧣|a|L
Hahn|🐓|a|L
Zahn|🦷|a|L
Schaf|🐑|a|L
Ball|⚽|a|K
Affe|🐒|a|K
Hand|✋|a|K
Katze|🐱|a|K
Apfel|🍎|a|K
Tasse|☕|a|K
Igel|🦔|i|L
Biene|🐝|i|L
Ziege|🐐|i|L
Tiger|🐯|i|L
Brief|✉️|i|L
Fisch|🐟|i|K
Pilz|🍄|i|K
Schiff|🚢|i|K
Ring|💍|i|K
Milch|🥛|i|K
Kirsche|🍒|i|K
Hose|👖|o|L
Rose|🌹|o|L
Mond|🌙|o|L
Brot|🍞|o|L
Boot|⛵|o|L
Sofa|🛋️|o|L
Sonne|☀️|o|K
Frosch|🐸|o|K
Wolke|☁️|o|K
Korb|🧺|o|K
Hut|🎩|u|L
Kuh|🐄|u|L
Schuh|👞|u|L
Blume|🌸|u|L
Lupe|🔍|u|L
Huhn|🐔|u|L
Hund|🐶|u|K
Mund|👄|u|K
Bus|🚌|u|K
Tulpe|🌷|u|K
Turm|🗼|u|K
Besen|🧹|e|L
Tee|🍵|e|L
Fee|🧚|e|L
Keks|🍪|e|L
Bett|🛏️|e|K
Ente|🦆|e|K
Zelt|⛺|e|K
Messer|🔪|e|K
`;
  const LEN = LEN_RAW.trim().split('\n').map((line) => {
    const [w, e, v, l] = line.split('|');
    return { w, e, v, long: l === 'L' };
  });
  const DOUBLE_RE = /(bb|dd|ff|gg|ll|mm|nn|pp|rr|ss|tt|ck|tz)/;

  /* ------------------------------------------------------------------
     Sätze
     ------------------------------------------------------------------ */
  const INTRO = {
    1: 'Hör gut zu! Ich sage ein Wort. Wo hörst du den Laut: am Anfang, in der Mitte oder am Ende? Ich nenne dir den Buchstaben. Du hörst im Wort aber auf den Laut.',
    2: 'Jetzt hören wir in die Mitte von Wörtern hinein. Und wir zählen Laute. Ein Laut ist noch kleiner als eine Silbe.',
    3: 'Jetzt zaubern wir! Wir nehmen einen Laut weg. Dann entsteht ein neues Wort.',
    4: 'Jetzt tauschen wir einen Laut aus. Aus einem Wort wird ein ganz anderes Wort.',
    5: 'Jetzt hörst du wie ein König! Selbstlaute können lang klingen, wie bei Hase. Oder kurz, wie bei Katze. Lang bekommt einen Strich, kurz bekommt einen Punkt.',
  };
  const OK = ['Richtig!', 'Genau!', 'Super gehört!', 'Prima!', 'Ja, genau!', 'Stark!'];
  const ok = () => U.pickFresh('hoe-ok', OK, 2);
  const proc = (ctx, normal, process) => (ctx.wrongCount === 0 && U.chance(0.3) ? process : normal);
  const nameOf = (w) => SPOKEN[w] || w;

  /* ------------------------------------------------------------------
     Bausteine
     ------------------------------------------------------------------ */
  function lock(ctx, node) {
    let locked = true;
    ctx.listen(node, 'click', (e) => {
      if (!locked) return;
      e.stopPropagation();
      e.preventDefault();
    }, true);
    node.classList.add('hoe-wait');
    return { release() { locked = false; node.classList.remove('hoe-wait'); } };
  }

  async function nameTiles(ctx, box) {
    for (const t of box._tiles || []) {
      if (!ctx.active) return;
      const it = t._item;
      if (!it || !it.say) continue;
      t.classList.add('speaking');
      await ctx.say(it.say);
      t.classList.remove('speaking');
      await ctx.sleep(120);
    }
  }

  /** Bildkarte (Wort bleibt verborgen) mit Anhören-Knopf und optionaler Sprechblase. */
  function card(emoji, sayText, extra) {
    const pic = el('div.hoe-pic', emoji ? U.emoji(emoji, 'hoe-pic-e') : U.emoji('💬', 'hoe-pic-e hoe-pic-talk'));
    const b = LT.ui.speakButton(() => sayText, { cls: 'hoe-say' });
    b.setAttribute('aria-label', 'Wort nochmal hören');
    const word = el('div.hoe-word', { 'aria-live': 'polite' });
    const c = el('div.prompt-box.hoe-card', el('div.hoe-card-main', pic, extra || null), word, b);
    c._word = word;
    return c;
  }

  /** Geschriebenes Wort zeigen, ein Laut hervorgehoben (Brücke zur Schrift). */
  function revealWord(c, w, mark) {
    if (!c || !c._word) return;
    c._word.textContent = '';
    if (!mark) { c._word.textContent = w; }
    else {
      const [a, b] = mark;
      c._word.append(w.slice(0, a), el('span.hoe-mark', w.slice(a, b)), w.slice(b));
    }
    c.classList.add('hoe-revealed');
  }

  /** Stelle eines Lautes im geschriebenen Wort finden (für die Markierung). */
  function findMark(w, g, pos) {
    const s = w.toLowerCase();
    let i;
    if (pos === 'Anfang') i = s.indexOf(g);
    else if (pos === 'Ende') i = s.lastIndexOf(g);
    else i = s.indexOf(g, 1);
    if (i < 0) return null;
    let a = i;
    let b = i + g.length;
    if (g.length === 1) {
      while (a > 0 && s[a - 1] === g) a--;
      while (b < s.length && s[b] === g) b++;
    }
    return [a, b];
  }

  /** Lautkästchen: n leere Kästchen, eines mit „?“ */
  function boxes(n, q = -1) {
    const row = el('div.hoe-boxes', { 'aria-hidden': 'true' });
    row._b = [];
    for (let i = 0; i < n; i++) {
      const b = el('span.hoe-box' + (i === q ? '.q' : ''), i === q ? '?' : '');
      row._b.push(b);
      row.appendChild(b);
    }
    row.fill = (toks) => toks.forEach((t0, i) => { const t = i === 0 ? U.cap(t0) : t0; if (row._b[i]) { row._b[i].textContent = t; row._b[i].classList.remove('q'); row._b[i].classList.add('on'); } });
    return row;
  }

  /** Positions-Zug: drei Wagen, einer markiert. */
  function posTrain(pos, letter) {
    const k = POS.indexOf(pos);
    return el('span.hoe-pos',
      el('span.hoe-train', ...[0, 1, 2].map((i) => el('span.hoe-cell' + (i === k ? '.on' : ''), i === k ? letter : ''))),
      el('span.hoe-pos-label', pos));
  }

  /** Bild als Kachelinhalt (auch zwei Bilder für die Mehrzahl). */
  function picNode(w) {
    const e = PIC[w] || (BY[w] && BY[w].e) || '❓';
    const parts = Array.from(e.matchAll(/\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic}️?)*/gu)).map((m) => m[0]);
    const many = parts.length > 1;
    return el('span.hoe-tpic' + (many ? '.many' : ''), ...(many ? parts : [e]).map((p) => U.emoji(p)));
  }

  const hintAfterFor = (ctx, items) => {
    const wrong = items.filter((x) => !x.correct).length;
    const visible = items.length - (ctx.flow < 0 && items.length >= 4 && wrong >= 2 ? 1 : 0);
    return visible <= 3 ? 1 : 2;
  };

  /** Auswahl bauen, Frage stellen, ggf. Kacheln benennen, dann freigeben. */
  async function ask(ctx, items, question, opts, { name = false, cls = '' } = {}) {
    const box = el('div.choices.hoe-choices' + (cls ? '.' + cls : ''));
    ctx.stage.appendChild(box);
    const l = lock(ctx, box);
    const p = ctx.choices(items, Object.assign({ container: box, praise: false, hintAfter: hintAfterFor(ctx, items) }, opts));
    await ctx.instruct(question);
    if (name) await nameTiles(ctx, box);
    l.release();
    return p;
  }

  /* ------------------------------------------------------------------
     Stufe 1 (und 2): Wo hörst du den Laut?
     ------------------------------------------------------------------ */
  async function whereTask(ctx, lv) {
    let want;
    if (lv >= 2) want = U.chance(0.5) ? 'Mitte' : U.pick(['Anfang', 'Ende']);
    else {
      const r = Math.random();
      const mid = ctx.flow > 0 ? 0.3 : ctx.flow < 0 ? 0 : 0.12;
      want = r < mid ? 'Mitte' : r < mid + (1 - mid) * 0.6 ? 'Ende' : 'Anfang';
    }
    const pool = WHERE.filter((t) => t.pos === want && (lv >= 2 || !t.x.toks[t.i].v || t.pos === 'Anfang'));
    const t = ctx.item(pool, (q) => q.key, { avoid: 4 });
    const x = t.x;
    const L = disp(t.c);
    const Ls = sayL(t.c);
    const c = card(x.e, x.w, el('span.hoe-bubble', L));
    ctx.stage.appendChild(c);
    let shown = POS.slice();
    if (ctx.flow < 0 && t.pos !== 'Mitte' && lv === 1) shown = ['Anfang', 'Ende'];
    const items = shown.map((p) => ({ content: posTrain(p, L), say: POS_PHRASE[p], aria: POS_PHRASE[p], correct: p === t.pos, p, className: 'hoe-postile' }));
    const tokAt = (p) => (p === 'Anfang' ? x.toks[0] : p === 'Ende' ? x.toks[x.toks.length - 1] : null);
    await ask(ctx, items, `${x.w}. Wo hörst du das ${Ls}?`, {
      shuffle: false,
      correctSay: () => proc(ctx,
        `${ok()} Das ${Ls} hörst du ${POS_PHRASE[t.pos]}.`,
        `${ok()} Du hast das Wort ganz langsam gesprochen und genau gehört. Das ${Ls} ist ${POS_PHRASE[t.pos]}.`),
      explain: (it) => {
        const tok = tokAt(it.p);
        if (tok && tok.safe && tok.c !== t.c) return `Fast! Ganz am ${it.p} von ${x.w} hörst du das ${sayL(tok.c)}. Wo ist das ${Ls}?`;
        if (it.p === 'Mitte') return `Fast! Hör nochmal genau auf die Mitte von ${x.w}. Da ist das ${Ls} nicht.`;
        return `Fast! Hör nochmal genau: ${x.w}. Wir hören auf den Laut, nicht auf den Namen vom Buchstaben.`;
      },
      hintSay: () => `Sprich ${x.w} ganz langsam, wie eine Schnecke. Kommt das ${Ls} zuerst, zuletzt oder dazwischen?`,
      modelSay: () => `Hör mal: ${x.w}. Das ${Ls} kommt ${POS_PHRASE[t.pos]}. Tipp auf ${t.pos}.`,
      onCorrect: () => revealWord(c, x.w, findMark(x.w, x.toks[t.i].t, t.pos)),
    });
    if (!ctx.active) return;
    await ctx.sleep(500);
  }

  /* ------------------------------------------------------------------
     Stufe 2: Selbstlaut in der Mitte
     ------------------------------------------------------------------ */
  async function vowelTask(ctx) {
    const t = ctx.item(VOWEL_TASKS, (q) => q.key, { avoid: 4 });
    const x = t.x;
    const V = t.v.toUpperCase();
    const row = boxes(x.toks.length, t.i);
    const c = card(x.e, x.w, row);
    ctx.stage.appendChild(c);
    const nDis = ctx.flow > 0 ? 3 : 2;
    const sim = U.shuffle(SIM_V[t.v].slice());
    const dis = sim.concat(U.shuffle(VOWEL5.filter((v) => v !== t.v && !sim.includes(v)))).slice(0, nDis);
    const opts = VOWEL5.filter((v) => v === t.v || dis.includes(v));
    const items = opts.map((v) => ({ content: el('span.hoe-letter', v.toUpperCase()), say: v.toUpperCase(), aria: v.toUpperCase(), correct: v === t.v, v, className: 'hoe-ltile' }));
    await ask(ctx, items, `${x.w}. Welchen Selbstlaut hörst du in der Mitte?`, {
      shuffle: false,
      sayButton: true,
      correctSay: () => proc(ctx,
        `${ok()} In ${x.w} hörst du das ${V}.`,
        `${ok()} Du hast genau in die Mitte gehört. In ${x.w} klingt das ${V}.`),
      explain: (it) => `Fast! Mit ${it.v.toUpperCase()} würde das Wort anders klingen. Hör nochmal: ${x.w}.`,
      hintSay: () => `Sprich ${x.w} ganz langsam und zieh die Mitte lang. Welcher Selbstlaut klingt da?`,
      modelSay: () => `Hör mal: ${x.w}. In der Mitte klingt das ${V}. Tipp auf das ${V}.`,
      onCorrect: () => {
        row.fill(x.toks.map((tk) => tk.t));
        revealWord(c, x.w, findMark(x.w, x.toks[t.i].t, 'Mitte'));
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(600);
  }

  /* ------------------------------------------------------------------
     Stufe 2: Laute zählen
     ------------------------------------------------------------------ */
  async function countTask(ctx) {
    const max = ctx.flow > 0 ? 6 : ctx.flow < 0 ? 4 : 5;
    const min = ctx.flow > 0 ? 4 : 2;
    let pool = COUNT_TASKS.filter((t) => t.n >= min && t.n <= max);
    // Wörter mit Doppelbuchstaben oder Lautpaketen sind die spannenden: öfter nehmen
    if (U.chance(0.5) && pool.some((t) => t.x.letters !== t.n)) pool = pool.filter((t) => t.x.letters !== t.n);
    const t = ctx.item(pool, (q) => q.key, { avoid: 4 });
    const x = t.x;
    const row = boxes(x.toks.length);
    row.classList.add('hoe-hidden');
    const c = card(x.e, x.w, row);
    ctx.stage.appendChild(c);
    const nums = new Set([t.n]);
    if (x.syl !== t.n) nums.add(x.syl);
    if (x.letters !== t.n && x.letters <= 7) nums.add(x.letters);
    const want = ctx.flow > 0 ? 4 : 3;
    let d = 1;
    while (nums.size < want && d < 5) {
      if (t.n + d <= 7) nums.add(t.n + d);
      if (nums.size < want && t.n - d >= 1) nums.add(t.n - d);
      d++;
    }
    const list = Array.from(nums).slice(0, want).sort((a, b) => a - b);
    const items = list.map((n) => ({
      content: el('span.hoe-num', el('span.hoe-num-n', String(n)), el('span.hoe-dots', ...U.range(0, n - 1).map(() => el('i')))),
      say: W(n), aria: W(n), correct: n === t.n, n, className: 'hoe-ntile',
    }));
    await ask(ctx, items, `${x.w}. Wie viele Laute hörst du?`, {
      shuffle: false,
      correctSay: () => proc(ctx,
        `${ok()} ${x.w} hat ${W(t.n)} Laute.`,
        `${ok()} Du hast jeden Laut einzeln gehört. ${x.w} hat ${W(t.n)} Laute.`),
      explain: (it) => {
        if (it.n === x.syl && x.syl !== t.n) return `Fast! ${x.syl === 1 ? `${x.w} hat eine Silbe` : `${x.w} hat ${W(x.syl)} Silben`}. Laute sind noch kleiner als Silben.`;
        if (it.n === x.letters && x.letters !== t.n) return `Fast! Hör genau hin. Manche Buchstaben klingen zusammen wie ein einziger Laut.`;
        if (it.n < t.n) return `Fast! Da versteckt sich noch ein Laut. Hör nochmal: ${x.w}.`;
        return `Fast! So viele Laute sind es nicht. Hör nochmal: ${x.w}.`;
      },
      hintSay: () => `Sprich ${x.w} ganz langsam. Streck für jeden Laut einen Finger aus.`,
      modelSay: () => `Schau mal, für jeden Laut ein Kästchen. ${x.w} hat ${W(t.n)} Laute.`,
      onWrong: async (it, tile, n) => {
        if (n >= 3) { row.classList.remove('hoe-hidden'); row.fill(x.toks.map((tk) => tk.t)); }
      },
      onCorrect: () => {
        row.classList.remove('hoe-hidden');
        row.fill(x.toks.map((tk) => tk.t));
        revealWord(c, x.w);
      },
    });
    if (!ctx.active) return;
    await ctx.sleep(700);
  }

  /* ------------------------------------------------------------------
     Stufe 3: Laut weglassen
     ------------------------------------------------------------------ */
  async function deleteTask(ctx) {
    let pool = DELETE;
    if (ctx.flow < 0) pool = DELETE.filter((t) => t.pos === 'Anfang' && !t.nopic);
    const t = ctx.item(pool, (q) => q.key, { avoid: 4 });
    const D = sayL(t.del);
    const bubble = el('span.hoe-bubble.hoe-del', el('s', disp(t.del)), U.emoji('✂️', 'hoe-sc'));
    const c = card(t.nopic ? null : PIC[t.src], t.src, bubble);
    ctx.stage.appendChild(c);
    let dis = t.d.slice(0, 2);
    if (ctx.flow > 0) {
      const extra = t.d[2] || U.pick(Object.keys(PIC).filter((k) => k !== t.res && !t.d.includes(k)));
      dis.push(extra);
    }
    const items = [t.res].concat(dis).map((w) => ({ content: picNode(w), say: nameOf(w), aria: nameOf(w), correct: w === t.res, w, className: 'hoe-ptile' }));
    const where = t.pos === 'Ende' ? 'am Ende' : t.pos === 'Mitte' ? 'in der Mitte' : 'am Anfang';
    await ask(ctx, items, `${t.src} ohne ${D}. Was bleibt übrig?`, {
      sayButton: true,
      correctSay: () => proc(ctx,
        `${ok()} ${t.src} ohne ${D} ist ${nameOf(t.res)}.`,
        `${ok()} Du hast das ${D} ganz genau weggenommen. Aus ${t.src} wird ${nameOf(t.res)}.`),
      explain: (it) => {
        if (it.w === t.src) return `Fast! Das ist noch ${t.src}. Da ist das ${D} noch drin.`;
        return `Fast! ${U.cap(nameOf(it.w))} klingt anders. Nimm nur das ${D} weg, der Rest bleibt gleich.`;
      },
      hintSay: () => `Sprich ${t.src} ganz langsam. Lass das ${D} ${where} einfach weg. Was hörst du dann?`,
      modelSay: () => `Hör mal: ${t.src}. Ohne ${D} bleibt ${nameOf(t.res)}. Tipp auf ${nameOf(t.res)}.`,
      onCorrect: () => revealWord(c, `${t.src} ➜ ${nameOf(t.res)}`),
    }, { name: true });
    if (!ctx.active) return;
    await ctx.sleep(600);
  }

  /* ------------------------------------------------------------------
     Stufe 4: Laut austauschen
     ------------------------------------------------------------------ */
  async function swapTask(ctx) {
    let pool = SWAP;
    if (ctx.flow < 0) pool = SWAP.filter((t) => t.pos === 'Anfang');
    else if (ctx.flow > 0 || U.chance(0.4)) pool = SWAP.filter((t) => t.pos !== 'Anfang');
    const t = ctx.item(pool, (q) => q.key, { avoid: 4 });
    const A = sayL(t.from);
    const B = sayL(t.to);
    const bubble = el('span.hoe-bubble.hoe-swap', el('span', disp(t.from)), el('span.hoe-arrow', '➜'), el('span.hoe-to', disp(t.to)));
    const c = card(PIC[t.src], t.src, bubble);
    ctx.stage.appendChild(c);
    let dis = t.d.slice(0, 2);
    if (ctx.flow > 0) dis = t.d.slice(0, 3);
    const items = [t.res].concat(dis).map((w) => ({ content: picNode(w), say: nameOf(w), aria: nameOf(w), correct: w === t.res, w, className: 'hoe-ptile' }));
    const where = t.pos === 'Ende' ? 'am Ende' : t.pos === 'Mitte' ? 'in der Mitte' : 'am Anfang';
    await ask(ctx, items, `${t.src}. Aus ${A} wird ${B}. Welches Wort hörst du jetzt?`, {
      sayButton: true,
      correctSay: () => proc(ctx,
        `${ok()} Aus ${t.src} wird ${t.res}.`,
        `${ok()} Du hast nur einen Laut getauscht und den Rest gleich gelassen. Aus ${t.src} wird ${t.res}.`),
      explain: (it) => {
        if (it.w === t.src) return `Fast! Das ist noch ${t.src}. Tausche das ${A} gegen das ${B}.`;
        return `Fast! Bei ${it.w} ist mehr anders. Nur das ${A} wird zum ${B}, alles andere bleibt gleich.`;
      },
      hintSay: () => `Sprich ${t.src} ganz langsam. Sag ${where} ${B} statt ${A}. Wie klingt das?`,
      modelSay: () => `Hör mal: ${t.src}. Aus ${A} wird ${B}. So wird daraus ${t.res}. Tipp auf ${t.res}.`,
      onCorrect: () => revealWord(c, `${t.src} ➜ ${t.res}`),
    }, { name: true });
    if (!ctx.active) return;
    await ctx.sleep(600);
  }

  /* ------------------------------------------------------------------
     Stufe 5: lang oder kurz?
     ------------------------------------------------------------------ */
  function lenWord(x) {
    const i = x.w.toLowerCase().search(/[aeiouäöü]/);
    const len = x.w.slice(i, i + 2).toLowerCase() === 'ie' || /^(ah|uh|oo|ee)$/.test(x.w.slice(i, i + 2).toLowerCase()) ? 2 : 1;
    return el('span.hoe-lword', x.w.slice(0, i), el('span.hoe-v.' + (x.long ? 'long' : 'short'), x.w.slice(i, i + len)), x.w.slice(i + len));
  }
  function lenMark(long, V) {
    return el('span.hoe-len', el('span.hoe-v.big.' + (long ? 'long' : 'short'), V), el('span.hoe-len-label', long ? 'lang' : 'kurz'));
  }
  async function afterLen(ctx, c, x) {
    c._word.textContent = '';
    c._word.appendChild(lenWord(x));
    c.classList.add('hoe-revealed');
    if (!x.long && DOUBLE_RE.test(x.w.toLowerCase()) && U.chance(0.5)) {
      await ctx.say('Schau: Nach einem kurzen Selbstlaut kommen oft zwei Mitlaute.');
    }
  }

  async function lengthClassify(ctx) {
    const x = ctx.item(LEN, (q) => `${q.w} lang?`, { avoid: 5 });
    const V = x.v.toUpperCase();
    const c = card(x.e, x.w, el('span.hoe-bubble', V));
    ctx.stage.appendChild(c);
    const items = [true, false].map((long) => ({ content: lenMark(long, V), say: long ? 'lang' : 'kurz', aria: long ? 'lang' : 'kurz', correct: long === x.long, long, className: 'hoe-lentile' }));
    await ask(ctx, items, `${x.w}. Klingt das ${V} lang oder kurz?`, {
      shuffle: false,
      correctSay: () => proc(ctx,
        `${ok()} In ${x.w} klingt das ${V} ${x.long ? 'lang' : 'kurz'}.`,
        `${ok()} Du hast ganz genau auf das ${V} gehört. In ${x.w} ist es ${x.long ? 'lang' : 'kurz'}.`),
      explain: () => (x.long
        ? `Fast! Sprich ${x.w} nochmal. Kannst du das ${V} ziehen, wie ein Gummiband?`
        : `Fast! Sprich ${x.w} nochmal. Ist das ${V} ganz schnell vorbei, wie ein Klatschen?`),
      hintSay: () => 'Tipp: Wenn du den Selbstlaut lang ziehen kannst, ist er lang. Wenn er schnell vorbei ist, ist er kurz.',
      modelSay: () => `Hör mal: ${x.w}. Das ${V} klingt ${x.long ? 'lang' : 'kurz'}.`,
    });
    if (!ctx.active) return;
    await afterLen(ctx, c, x);
    if (!ctx.active) return;
    await ctx.sleep(600);
  }

  async function lengthPick(ctx) {
    const wantLong = U.chance(0.5);
    const vowels = VOWEL5.filter((v) => LEN.some((x) => x.v === v && x.long === wantLong) && LEN.filter((x) => x.v === v && x.long !== wantLong).length >= 3);
    const pool = LEN.filter((x) => x.long === wantLong && vowels.includes(x.v));
    const x = ctx.item(pool, (q) => `${q.w} lang?`, { avoid: 5 });
    const V = x.v.toUpperCase();
    const nDis = ctx.flow > 0 ? 3 : 2;
    const others = U.sample(LEN.filter((y) => y.v === x.v && y.long !== wantLong), nDis);
    const word = wantLong ? 'lang' : 'kurz';
    const c = el('div.prompt-box.hoe-card.hoe-q', lenMark(wantLong, V));
    c._word = el('div.hoe-word');
    c.appendChild(c._word);
    ctx.stage.appendChild(c);
    const items = [x].concat(others).map((y) => ({ content: el('span.hoe-tpic', U.emoji(y.e)), say: y.w, aria: y.w, correct: y === x, y, className: 'hoe-ptile' }));
    await ask(ctx, items, `Bei welchem Wort klingt das ${V} ${word}?`, {
      sayButton: true,
      correctSay: () => proc(ctx,
        `${ok()} In ${x.w} klingt das ${V} ${word}.`,
        `${ok()} Du hast jedes Wort genau verglichen. In ${x.w} ist das ${V} ${word}.`),
      explain: (it) => `Fast! In ${it.y.w} klingt das ${V} ${wantLong ? 'kurz' : 'lang'}. Hör nochmal genau.`,
      hintSay: () => `Sprich jedes Wort langsam. Wo kannst du das ${V} ${wantLong ? 'lang ziehen' : 'gar nicht ziehen'}?`,
      modelSay: () => `Hör mal: ${x.w}. Da klingt das ${V} ${word}. Tipp auf ${x.w}.`,
    }, { name: true });
    if (!ctx.active) return;
    await afterLen(ctx, c, x);
    if (!ctx.active) return;
    await ctx.sleep(600);
  }

  /* ------------------------------------------------------------------
     Spiel
     ------------------------------------------------------------------ */
  let introduced = new Set();
  let offset = 0;

  LT.registerGame({
    id: 'hoerkoenig',
    area: 'deutsch1',
    title: 'Hörkönig',
    icon: '👑',
    levels: 5,
    rounds: 6,
    type: 'tasks',
    intro: 'Willkommen beim Hörkönig! Hier hörst du ganz genau auf die Laute in Wörtern.',
    parent: {
      skill: 'Laute im Wort hören, zählen, weglassen und austauschen',
      goal: 'Ihr Kind hört Laute an jeder Stelle eines Wortes heraus: am Anfang, in der Mitte und am Ende. Es zählt Laute, nimmt einen Laut weg (Reis ohne R ist Eis) und tauscht einen Laut aus (aus Maus wird Haus). Zum Schluss unterscheidet es lange und kurze Selbstlaute (Hase, Katze). Diese genaue Lautanalyse ist die wichtigste Grundlage für das lautgetreue Schreiben und später für die Rechtschreibung (doppelte Mitlaute nach kurzem Selbstlaut). Das geschriebene Wort erscheint erst nach dem Lösen.',
      levels: [
        'Stufe 1: Wo hörst du den Laut – am Anfang, in der Mitte oder am Ende? Schwerpunkt Endlaut (Maus: S am Ende)',
        'Stufe 2: Den Selbstlaut in der Mitte erkennen (Hut: U), Laute zählen (Affe hat drei Laute) und Laute in der Mitte orten',
        'Stufe 3: Einen Laut weglassen (Reis ohne R ist Eis, Hosen ohne N ist Hose, Brot ohne R ist Boot)',
        'Stufe 4: Einen Laut austauschen – am Anfang (Maus zu Haus), in der Mitte (Hund zu Hand) und am Ende (Schaf zu Schal)',
        'Stufe 5: Lange und kurze Selbstlaute unterscheiden (Hase mit Strich, Katze mit Punkt) – Vorbereitung auf Klasse 2',
      ],
      tip: 'Sprechen Sie Laute, nicht Buchstabennamen: „mmm“ statt „Em“, „sss“ statt „Es“. Die Vorlesestimme der App nennt die Buchstaben mit Namen, weil sie einzelne Laute nicht sauber sprechen kann. Gute Spiele für unterwegs: „Was bleibt von Reis ohne R?“ oder „Ich tausche bei Maus das M gegen ein H.“ Bei lang oder kurz hilft Ziehen: Haaase geht, Kaaatze klingt komisch.',
    },

    async task(ctx) {
      const lv = ctx.taskLevel;
      if (ctx.index === 0) { introduced = new Set(); offset = U.randInt(0, 2); }
      if (!introduced.has(lv)) {
        introduced.add(lv);
        await ctx.say(INTRO[lv]);
        if (!ctx.active) return;
      }
      if (lv === 1) return whereTask(ctx, 1);
      if (lv === 2) {
        const kind = ['vowel', 'count', 'where'][(ctx.index + offset) % 3];
        if (kind === 'vowel') return vowelTask(ctx);
        if (kind === 'count') return countTask(ctx);
        return whereTask(ctx, 2);
      }
      if (lv === 3) return deleteTask(ctx);
      if (lv === 4) return swapTask(ctx);
      return (ctx.index + offset) % 2 ? lengthPick(ctx) : lengthClassify(ctx);
    },
  });
})();
