/* ==========================================================================
   Gemeinsame Bausteine der Spielgruppe 'denken2' (Denk-Insel)  →  LT.d2

   Spiele der Gruppe:
   - „Was passiert zuerst?“ (reihenfolge)  – zeitlich-logisches Denken
   - „Flos Klangspiel“ (toene-merken)       – auditiv-visuelles Arbeitsgedächtnis
   - „Bilder-Sudoku“ (bilder-sudoku)        – logisches Schließen

   Hier liegen nur kleine, spielübergreifende Helfer:
   - selbst gezeichnete Inline-SVG-Bilder für Dinge, für die es kein
     (gut unterstütztes) Emoji gibt (Backofen, Puppe/Kokon, geschmolzener
     Schneemann),
   - ein Bild-Baustein, der Emoji(s) ODER SVG einheitlich darstellt.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const D = {};

  /* ------------------------------------------------------------------
     Selbst gezeichnete Bilder (viewBox 0 0 100 100, ohne Text)
     ------------------------------------------------------------------ */
  const SVG = {
    /** Backofen mit Glühen im Sichtfenster; inside: 'kuchen' | 'pizza' */
    ofen(inside) {
      const food = inside === 'pizza'
        ? '<ellipse cx="50" cy="66" rx="20" ry="6" fill="#f2b84b"/><ellipse cx="50" cy="65" rx="16" ry="4.2" fill="#e8553f"/><circle cx="43" cy="64.5" r="2" fill="#ffe08a"/><circle cx="55" cy="65.5" r="2" fill="#ffe08a"/><circle cx="50" cy="63.5" r="1.6" fill="#ffe08a"/>'
        : '<path d="M33 70 Q33 54 50 54 Q67 54 67 70 Z" fill="#c98a3c"/><path d="M36 60 Q50 52 64 60" stroke="#e8b06a" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
      return `<svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M38 14 q-4 -5 0 -10 M50 14 q-4 -5 0 -10 M62 14 q-4 -5 0 -10" stroke="#ff9a52" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="12" y="18" width="76" height="74" rx="10" fill="#9aa4b8"/>
        <rect x="12" y="18" width="76" height="16" rx="8" fill="#6c768c"/>
        <circle cx="26" cy="26" r="4.5" fill="#f4f6fb"/><circle cx="40" cy="26" r="4.5" fill="#f4f6fb"/>
        <rect x="58" y="23" width="22" height="6" rx="3" fill="#ff6b4a"/>
        <rect x="20" y="40" width="60" height="44" rx="7" fill="#3b2a24"/>
        <rect x="24" y="44" width="52" height="36" rx="5" fill="#ff8f3a" opacity=".9"/>
        <rect x="24" y="44" width="52" height="12" rx="5" fill="#ffc46b" opacity=".8"/>
        ${food}
        <rect x="24" y="73" width="52" height="3" fill="#5b3b2a"/>
      </svg>`;
    },
    /** Schmetterlingspuppe (Kokon) an einem Zweig mit Blatt */
    puppe() {
      return `<svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M6 16 Q50 8 94 18" stroke="#8a5a2b" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M70 15 Q84 0 94 6 Q88 22 70 15 Z" fill="#4caf50"/>
        <line x1="48" y1="13" x2="48" y2="26" stroke="#a07a4a" stroke-width="2.5"/>
        <path d="M48 24 C64 26 66 52 60 72 C56 86 48 94 46 94 C42 90 34 80 34 64 C34 42 36 26 48 24 Z" fill="#8bc34a" stroke="#5f8f2a" stroke-width="2.5"/>
        <path d="M37 44 Q49 48 62 42 M35 58 Q48 63 63 56 M37 72 Q48 77 60 70" stroke="#5f8f2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="52" cy="34" r="2.6" fill="#ffd54f"/>
      </svg>`;
    },
    /** Geschmolzener Schneemann: Pfütze mit Hut, Karotte und Kohlestücken */
    pfuetze() {
      return `<svg viewBox="0 0 100 100" aria-hidden="true">
        <ellipse cx="50" cy="74" rx="44" ry="17" fill="#9fd8f5"/>
        <ellipse cx="44" cy="70" rx="26" ry="8" fill="#c8ecff"/>
        <rect x="56" y="44" width="24" height="22" rx="2" fill="#2b2d42" transform="rotate(12 68 55)"/>
        <rect x="50" y="62" width="36" height="6" rx="3" fill="#2b2d42" transform="rotate(12 68 65)"/>
        <rect x="57" y="57" width="24" height="4" fill="#e8553f" transform="rotate(12 69 59)"/>
        <path d="M22 70 L44 62 L44 70 Z" fill="#ff8a1f"/>
        <circle cx="32" cy="80" r="3.5" fill="#2b2d42"/><circle cx="46" cy="83" r="3.5" fill="#2b2d42"/><circle cx="60" cy="81" r="3" fill="#2b2d42"/>
        <path d="M14 58 q4 -6 0 -12 M86 52 q4 -6 0 -12" stroke="#9fd8f5" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>`;
    },
  };
  D.SVG = SVG;

  /**
   * Bild-Baustein: pic = { e: '🥚' | '🥕🥔', svg: 'ofen' , svgArg }
   * Liefert einen <span class="d2-pic">, der in Kacheln und Feldern skaliert.
   */
  D.pic = function (p) {
    if (p.svg) return el('span.d2-pic.d2-svg', { html: SVG[p.svg](p.svgArg) });
    const chars = Array.from(p.e.matchAll(/\p{Extended_Pictographic}(️)?(‍\p{Extended_Pictographic}️?)*/gu)).map((m) => m[0]);
    if (chars.length > 1) return el('span.d2-pic.d2-duo', chars.map((c) => U.emoji(c)));
    return el('span.d2-pic', U.emoji(p.e));
  };

  LT.d2 = D;
})();
