/* ==========================================================================
   Gemeinsame Bausteine der Spielgruppe 'denken1' (Denk-Insel)  →  LT.d1

   Spiele der Gruppe: Memory, Was passt nicht?, Schatten-Rätsel, Was fehlt?
   Alle trainieren exekutive Funktionen bzw. visuelles Denken:
   - Arbeitsgedächtnis (Memory, Kim-Spiel „Was fehlt?“)
   - Klassifizieren und Begründen (Was passt nicht?)
   - Figur-Grund- und Formwahrnehmung, Raumlage/Spiegelung (Schatten)

   Hier liegen nur sprachliche Helfer (Artikel, Pronomen, Satzbausteine),
   ein kleines Zusatz-Lexikon (Bilder, die im Haupt-Lexikon fehlen) und die
   Silhouetten-Darstellung. Die Sätze werden vorgelesen – deshalb ist die
   Grammatik (Artikel, Fälle) hier zentral und einmal sauber gelöst.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const D = {};

  /* ------------------------------------------------------------------
     Zusatz-Lexikon (gleiches Format wie LT.lexikon: e, w, a, p, c)
     Nur gut unterstützte Emojis (Unicode ≤ 12), alle im Testbrowser
     (Noto Color Emoji) als Farbbild UND als Silhouette geprüft.
     ------------------------------------------------------------------ */
  const EXTRA_RAW = [
    // id, Emoji, Wort, Artikel, Plural, Kategorie
    ['vogel', '🐦', 'Vogel', 'der', 'Vögel', 'tiere'],
    ['adler', '🦅', 'Adler', 'der', 'Adler', 'tiere'],
    ['taube', '🕊️', 'Taube', 'die', 'Tauben', 'tiere'],
    ['fledermaus', '🦇', 'Fledermaus', 'die', 'Fledermäuse', 'tiere'],
    ['t-rex', '🦖', 'T-Rex', 'der', 'T-Rexe', 'tiere'],
    // Ganzkörper-Bilder (die Lexikon-Bilder zeigen teils nur den Kopf)
    ['hund-ganz', '🐕', 'Hund', 'der', 'Hunde', 'tiere'],
    ['katze-ganz', '🐈', 'Katze', 'die', 'Katzen', 'tiere'],
    ['pferd-ganz', '🐎', 'Pferd', 'das', 'Pferde', 'tiere'],
    ['schwein-ganz', '🐖', 'Schwein', 'das', 'Schweine', 'tiere'],
    ['tiger-ganz', '🐅', 'Tiger', 'der', 'Tiger', 'tiere'],
    ['hase-ganz', '🐇', 'Hase', 'der', 'Hasen', 'tiere'],
    ['maus-ganz', '🐁', 'Maus', 'die', 'Mäuse', 'tiere'],
    ['sonnenhut', '👒', 'Sonnenhut', 'der', 'Sonnenhüte', 'kleidung'],
    ['helm', '⛑️', 'Helm', 'der', 'Helme', 'kleidung'],
    ['eiswuerfel', '🧊', 'Eiswürfel', 'der', 'Eiswürfel', 'natur'],
    ['vulkan', '🌋', 'Vulkan', 'der', 'Vulkane', 'natur'],
  ];
  const EXTRA = {};
  EXTRA_RAW.forEach(([id, e, w, a, p, c]) => { EXTRA[id] = { id, e, w, a, p, c, s: [w] }; });

  /** Wort aus dem Haupt-Lexikon oder dem Zusatz-Lexikon holen. */
  D.word = function (id) {
    const w = EXTRA[id] || (LT.lexikon && LT.lexikon.get(id));
    if (!w) console.error('denken1: unbekanntes Wort', id);
    return w || null;
  };
  /** Liste von ids → Wortobjekte (unbekannte werden verworfen). */
  D.words = (ids) => ids.map(D.word).filter(Boolean);

  /* ------------------------------------------------------------------
     Grammatik-Helfer (x = Wortobjekt mit a = der|die|das, w = Wort)
     ------------------------------------------------------------------ */
  /** „der Hund“ */
  D.art = (x) => `${x.a} ${x.w}`;
  /** „Der Hund“ (Satzanfang) */
  D.Art = (x) => `${U.cap(x.a)} ${x.w}`;
  /** Akkusativ: „den Hund“ / „die Kuh“ / „das Schaf“ */
  D.den = (x) => `${x.a === 'der' ? 'den' : x.a} ${x.w}`;
  /** Unbestimmt (Nominativ): „ein Hund“ / „eine Kuh“ / „ein Schaf“ */
  D.ein = (x) => `${x.a === 'die' ? 'eine' : 'ein'} ${x.w}`;
  /** Personalpronomen am Satzanfang: Er / Sie / Es */
  D.Pron = (x) => (x.a === 'der' ? 'Er' : x.a === 'die' ? 'Sie' : 'Es');
  /** Akkusativ + „andere“: „den anderen Hund“ / „die andere Kuh“ / „das andere Schaf“ */
  D.denAnderen = (x) => (x.a === 'der' ? `den anderen ${x.w}` : x.a === 'die' ? `die andere ${x.w}` : `das andere ${x.w}`);
  /** Zahlwort groß: „Drei“ */
  D.Num = (n) => U.cap(U.numberWord(n));

  /**
   * „auch“ hinter das Verb setzen: „ist ein Tier“ → „ist auch ein Tier“,
   * „kann fliegen“ → „kann auch fliegen“. (Prädikate beginnen immer mit dem Verb.)
   */
  D.auch = function (pred) {
    const i = pred.indexOf(' ');
    return i < 0 ? `${pred} auch` : `${pred.slice(0, i)} auch${pred.slice(i)}`;
  };

  /* ------------------------------------------------------------------
     Darstellung
     ------------------------------------------------------------------ */
  /**
   * Silhouette eines Emojis (CSS: filter brightness(0)).
   * opts.mirror → waagerecht gespiegelt (für Raumlage-Aufgaben).
   */
  D.shadow = function (emoji, opts = {}) {
    return U.emoji(emoji, 'd1-shadow' + (opts.mirror ? ' d1-mirror' : ''));
  };
  /** Farbiges Bild (optional gespiegelt). */
  D.picture = function (emoji, opts = {}) {
    return U.emoji(emoji, 'd1-pic' + (opts.mirror ? ' d1-mirror' : ''));
  };

  /** Ist das Display hochkant? (für Raster-Entscheidungen) */
  D.portrait = (node) => {
    const r = (node || document.body).getBoundingClientRect();
    return r.height > r.width * 1.05;
  };

  /** Innenmaße eines Elements ohne Padding. */
  D.innerSize = function (node) {
    const cs = getComputedStyle(node);
    const w = node.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = node.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    return { w: Math.max(0, w), h: Math.max(0, h) };
  };

  /** Kleines Element, das nur Platz einnimmt (z. B. leere Rasterzelle). */
  D.spacer = (cls) => el('span.' + (cls || 'd1-spacer'), { 'aria-hidden': 'true' });

  LT.d1 = D;
})();
