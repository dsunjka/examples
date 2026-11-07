/* ==========================================================================
   Gemeinsame Bausteine der Spielgruppe 'sprache2' (Buchstabenland)  →  LT.s2

   Didaktischer Hintergrund:
   - Anlauttabelle (Druckschrift): Zu jedem Buchstaben gibt es EIN festes
     Bildwort mit eindeutigem, typischem Anlaut („M wie Maus“). Die Tabelle ist
     das wichtigste Werkzeug im Anfangsunterricht: Kinder schlagen dort nach,
     wie ein Laut aussieht. Für die schwierigen Buchstaben gelten bewährte
     Lösungen: C wie Clown, Q wie Qualle (Qu), X wie Xylofon, Y wie Yo-Yo
     (Duden: „Jo-Jo, auch Yo-Yo“). Qualle und Xylofon gibt es nicht als gut
     unterstütztes Emoji, das Jo-Jo-Emoji ist klein kaum erkennbar – diese drei
     sind als eigenes Inline-SVG gezeichnet.
   - Silbenmethode: Wörter werden in Silben gegliedert und abwechselnd BLAU
     und ROT eingefärbt, mit Silbenbögen darunter (wie in Erstlesebüchern).
     Das erleichtert das Zusammenschleifen beim ersten Lesen.
   - Buchstabennamen werden in der Sprachausgabe IMMER groß geschrieben
     („das kleine M“), weil Sprachausgaben einzelne Kleinbuchstaben oft als
     Abkürzung lesen (m = Meter, h = Stunde, l = Liter …).

     S2.ABC / S2.abc(L)        Anlauttabelle A–Z
     S2.pic(entry, cls)        Bild eines Eintrags (Emoji oder SVG)
     S2.letter(ch, cls)        Buchstabe in Andika (var(--font))
     S2.wordNode(text, opts)   Wort in Silbenfarben mit Silbenbögen
     S2.speakSyllables(ctx, n) Silben nacheinander vorlesen + hervorheben
     S2.readingFinger(ctx, n)  „Lesefinger“: Buchstaben leuchten nacheinander
     S2.abcButton(ctx)         Knopf, der die Anlauttabelle öffnet
     S2.openAbc(ctx)           Anlauttabelle zum freien Erkunden
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const S2 = {};

  /* ------------------------------------------------------------------
     Eigene Zeichnungen (Inline-SVG) für Buchstaben ohne passendes Emoji
     ------------------------------------------------------------------ */
  function xylofonSVG() {
    // Holzschienen, sechs Klangstäbe in Regenbogenfarben (links lang → rechts kurz), zwei Schlägel
    const colors = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
    let bars = '';
    for (let i = 0; i < 6; i++) {
      const x = 15 + i * 12.4;
      const top = 22 + i * 2.6;
      const bottom = 82 - i * 2.8;
      bars += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="9.4" height="${(bottom - top).toFixed(1)}" rx="2.4" fill="${colors[i]}" stroke="rgba(0,0,0,.18)" stroke-width="1"/>` +
        `<circle cx="${(x + 4.7).toFixed(1)}" cy="${(top + 6).toFixed(1)}" r="1.3" fill="#fff" opacity=".85"/>` +
        `<circle cx="${(x + 4.7).toFixed(1)}" cy="${(bottom - 6).toFixed(1)}" r="1.3" fill="#fff" opacity=".85"/>`;
    }
    return `<svg class="s2-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 26 L92 38" stroke="#a0673a" stroke-width="6" stroke-linecap="round"/>
      <path d="M10 76 L92 66" stroke="#a0673a" stroke-width="6" stroke-linecap="round"/>
      ${bars}
      <path d="M46 97 L74 66" stroke="#8d5524" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="75" cy="64" r="6" fill="#e63946" stroke="rgba(0,0,0,.2)"/>
      <path d="M60 99 L90 74" stroke="#8d5524" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="91" cy="72" r="6" fill="#e63946" stroke="rgba(0,0,0,.2)"/>
    </svg>`;
  }
  function qualleSVG() {
    // freundliche Qualle: Glockenschirm mit Wellenrand, Gesicht, wehende Fangarme
    const tent = [24, 37, 50, 63, 76].map((x, i) => {
      const d = i % 2 ? 6 : -6;
      return `<path d="M${x} 55 C${x + d} 64 ${x - d} 72 ${x} 80 C${x + d} 87 ${x - d} 92 ${x + d / 2} 97" stroke="#c77dff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }).join('');
    return `<svg class="s2-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="s2-qg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa6d9"/><stop offset="1" stop-color="#b57bff"/></linearGradient></defs>
      ${tent}
      <path d="M14 56 C12 18 88 18 86 56 Q79 62 72 56 Q65 62 57 56 Q50 62 43 56 Q36 62 29 56 Q21 62 14 56 Z" fill="url(#s2-qg)" stroke="#9b5de5" stroke-width="2"/>
      <ellipse cx="33" cy="30" rx="8" ry="5" fill="#fff" opacity=".55" transform="rotate(-25 33 30)"/>
      <circle cx="40" cy="42" r="4.2" fill="#2b2d42"/><circle cx="41.5" cy="40.5" r="1.4" fill="#fff"/>
      <circle cx="60" cy="42" r="4.2" fill="#2b2d42"/><circle cx="61.5" cy="40.5" r="1.4" fill="#fff"/>
      <ellipse cx="32" cy="49" rx="4" ry="2.4" fill="#ff6fa8" opacity=".6"/>
      <ellipse cx="68" cy="49" rx="4" ry="2.4" fill="#ff6fa8" opacity=".6"/>
      <path d="M45 49 Q50 54 55 49" stroke="#2b2d42" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  function yoyoSVG() {
    // Jo-Jo von vorne: Schnur mit Fingerschlaufe, rote Scheibe, Bewegungsstriche
    return `<svg class="s2-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="9" r="6" fill="none" stroke="#5c6080" stroke-width="2.6"/>
      <path d="M50 15 L50 62" stroke="#5c6080" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="50" cy="64" r="30" fill="#ef233c" stroke="#b5172b" stroke-width="2.5"/>
      <circle cx="50" cy="64" r="19" fill="#ff6b81"/>
      <circle cx="50" cy="64" r="6.5" fill="#ffd166" stroke="#e09b00" stroke-width="1.5"/>
      <ellipse cx="38" cy="50" rx="7" ry="4" fill="#fff" opacity=".55" transform="rotate(-35 38 50)"/>
      <path d="M13 52 Q7 64 13 76" stroke="#9aa0bf" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M87 52 Q93 64 87 76" stroke="#9aa0bf" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  const SVG = { xylofon: xylofonSVG, qualle: qualleSVG, yoyo: yoyoSVG };

  /* ------------------------------------------------------------------
     Anlauttabelle (Druckschrift A–Z)
     Auswahlkriterien: eindeutiger, typischer Anlaut (kein Sch-/St-/Sp-,
     kein Au/Ei/Eu am Anfang), bekanntes Wort, unverwechselbares Bild.
     ------------------------------------------------------------------ */
  S2.ABC = [
    { L: 'A', w: 'Affe', a: 'der', e: '🐒' },
    { L: 'B', w: 'Banane', a: 'die', e: '🍌' },
    { L: 'C', w: 'Clown', a: 'der', e: '🤡' },
    { L: 'D', w: 'Dino', a: 'der', e: '🦕' },
    { L: 'E', w: 'Elefant', a: 'der', e: '🐘' },
    { L: 'F', w: 'Fuchs', a: 'der', e: '🦊' },
    { L: 'G', w: 'Giraffe', a: 'die', e: '🦒' },
    { L: 'H', w: 'Hund', a: 'der', e: '🐶' },
    { L: 'I', w: 'Igel', a: 'der', e: '🦔' },
    { L: 'J', w: 'Jacke', a: 'die', e: '🧥' },
    { L: 'K', w: 'Katze', a: 'die', e: '🐱' },
    { L: 'L', w: 'Löwe', a: 'der', e: '🦁' },
    { L: 'M', w: 'Maus', a: 'die', e: '🐭' },
    { L: 'N', w: 'Nase', a: 'die', e: '👃' },
    { L: 'O', w: 'Ohr', a: 'das', e: '👂' },
    { L: 'P', w: 'Pinguin', a: 'der', e: '🐧' },
    { L: 'Q', w: 'Qualle', a: 'die', svg: 'qualle' },
    { L: 'R', w: 'Rakete', a: 'die', e: '🚀' },
    { L: 'S', w: 'Sonne', a: 'die', e: '☀️' },
    { L: 'T', w: 'Tiger', a: 'der', e: '🐯' },
    { L: 'U', w: 'Ufo', a: 'das', e: '🛸' },
    { L: 'V', w: 'Vogel', a: 'der', e: '🐦' },
    { L: 'W', w: 'Wal', a: 'der', e: '🐳' },
    { L: 'X', w: 'Xylofon', a: 'das', svg: 'xylofon' },
    { L: 'Y', w: 'Yo-Yo', a: 'das', svg: 'yoyo' },
    { L: 'Z', w: 'Zebra', a: 'das', e: '🦓' },
  ];
  const byLetter = {};
  S2.ABC.forEach((x) => { byLetter[x.L] = x; });
  /** Eintrag der Anlauttabelle zu einem Buchstaben (groß oder klein). */
  S2.abc = (ch) => byLetter[String(ch).toUpperCase()] || null;
  S2.LETTERS = S2.ABC.map((x) => x.L);

  /** Bild eines Eintrags: Emoji-Span oder SVG (skaliert über font-size, 1em). */
  S2.pic = function (entry, cls = '') {
    if (entry.svg) {
      const s = el('span', { class: 'emoji s2-svgpic ' + cls, 'aria-hidden': 'true', html: SVG[entry.svg]() });
      return s;
    }
    return U.emoji(entry.e, cls);
  };

  /** Buchstabe groß darstellen (Schrift Andika). */
  S2.letter = (ch, cls = '') => el('span', { class: 's2-letter ' + cls, 'aria-hidden': 'true' }, ch);
  S2.upper = (ch) => (ch === 'ß' ? 'ß' : String(ch).toUpperCase());
  S2.lower = (ch) => String(ch).toLowerCase();
  S2.isLower = (ch) => ch !== S2.upper(ch);
  /** Buchstabe für die Sprachausgabe (immer groß, s. Kopfkommentar). */
  S2.sayLetter = (ch) => (ch === 'ß' ? 'scharfes S' : S2.upper(ch));

  /* ------------------------------------------------------------------
     Silbenwort: TOMATE → TO (blau) MA (rot) TE (blau) mit Silbenbögen
     text: 'TO-MA-TE' (Bindestriche trennen die Silben)
     ------------------------------------------------------------------ */
  S2.syllables = (text) => String(text).split('-');
  S2.plain = (text) => String(text).replace(/-/g, '');
  /** Gesprochene Form: 'TO-MA-TE' → 'Tomate' */
  S2.spoken = (text) => U.cap(S2.plain(text).toLowerCase());

  S2.wordNode = function (text, opts = {}) {
    const syls = S2.syllables(text);
    const n = S2.plain(text).length;
    const node = el('div', { class: 's2-word' + (opts.cls ? ' ' + opts.cls : ''), style: { '--n': String(n) }, 'aria-label': S2.plain(text) });
    syls.forEach((s, i) => {
      const syl = el('span', { class: 's2-syl ' + (i % 2 ? 's2-red' : 's2-blue') });
      Array.from(s).forEach((ch) => syl.appendChild(el('span.s2-ch', ch)));
      if (opts.arcs !== false) syl.appendChild(el('i.s2-arc'));
      node.appendChild(syl);
    });
    node._syls = syls;
    return node;
  };

  /** Silben nacheinander hervorheben und vorlesen, danach das ganze Wort. */
  S2.speakSyllables = async function (ctx, node, { whole = true, rate } = {}) {
    if (!node || !node._syls) return;
    const spans = Array.from(node.querySelectorAll('.s2-syl'));
    if (spans.length > 1) {
      for (let i = 0; i < spans.length; i++) {
        if (!ctx.active) return;
        spans[i].classList.add('on');
        await ctx.say(U.cap(node._syls[i].toLowerCase()), rate ? { rate } : undefined);
        spans[i].classList.remove('on');
        await ctx.sleep(120);
      }
    }
    if (whole && ctx.active) {
      node.classList.add('all-on');
      await ctx.say(S2.spoken(node._syls.join('-')));
      node.classList.remove('all-on');
    }
  };

  /** Lesefinger: Buchstaben leuchten nacheinander auf (ohne Ton – das Kind liest selbst). */
  S2.readingFinger = async function (ctx, node) {
    if (!node || node._fingerBusy) return;
    node._fingerBusy = true;
    const chars = Array.from(node.querySelectorAll('.s2-ch'));
    for (const c of chars) {
      if (!ctx.active) break;
      c.classList.add('lit');
      await ctx.sleep(380);
      c.classList.remove('lit');
    }
    node._fingerBusy = false;
  };

  /* ------------------------------------------------------------------
     Anlauttabelle als Overlay zum freien Erkunden
     ------------------------------------------------------------------ */
  S2.openAbc = function (ctx) {
    if (document.querySelector('.s2-abc-ov')) return;
    let token = 0; // bricht „Alle anhören“ ab
    const cells = [];
    const grid = el('div.s2-abc-grid');
    S2.ABC.forEach((x) => {
      const c = el('button.s2-abc-cell', { type: 'button', 'aria-label': `${x.L} wie ${x.w}` },
        el('span.s2-abc-l', x.L, el('span.s2-abc-small', S2.lower(x.L))),
        S2.pic(x, 's2-abc-pic'),
        el('span.s2-abc-w', x.w)
      );
      c.addEventListener('click', () => {
        token++;
        cells.forEach((k) => k.classList.remove('playing'));
        LT.sfx.play('pop');
        LT.ui.animate(c, 'joy');
        LT.speech.say(`${x.L} wie ${x.w}`);
      });
      cells.push(c);
      grid.appendChild(c);
    });

    async function playAll() {
      const my = ++token;
      for (let i = 0; i < S2.ABC.length; i++) {
        if (my !== token || !ov.isConnected || !ctx.active) return;
        const c = cells[i];
        cells.forEach((k) => k.classList.remove('playing'));
        c.classList.add('playing');
        c.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        await LT.speech.say(`${S2.ABC[i].L} wie ${S2.ABC[i].w}`);
        await ctx.sleep(150);
      }
      cells.forEach((k) => k.classList.remove('playing'));
    }
    function close() {
      token++;
      LT.speech.stop();
      ov.remove();
    }

    const head = el('div.s2-abc-head',
      el('h2', U.emoji('🔠'), ' Mein ABC'),
      el('div.s2-abc-actions',
        LT.ui.button('Alle anhören', playAll, { icon: '▶️', cls: 'btn-primary' }),
        LT.ui.button('Fertig', close, { icon: '✅' })
      )
    );
    const ov = LT.ui.overlay([head, grid], { className: 's2-abc-ov' });
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ctx.onCleanup(() => { token++; ov.remove(); });
    LT.speech.say('Das ist dein ABC. Tippe auf ein Bild und hör zu!');
  };

  /** Runder ABC-Knopf unten rechts in der Spielfläche. */
  S2.abcButton = function (ctx) {
    const b = el('button.btn-round.s2-abc-btn', {
      type: 'button',
      'aria-label': 'ABC-Tabelle öffnen',
      title: 'Mein ABC',
      on: { click: () => { LT.sfx.play('click'); S2.openAbc(ctx); } },
    }, el('span.s2-abc-btn-txt', 'ABC'));
    ctx.stage.appendChild(b);
    return b;
  };

  /* ------------------------------------------------------------------
     Kleine Helfer
     ------------------------------------------------------------------ */
  /** n Ablenker aus pool (ohne target/avoid), davon höchstens EIN „ähnlicher“ aus prefer. */
  S2.distract = function (target, pool, n, { avoid = [], prefer = [] } = {}) {
    const ok = (x) => x !== target && !avoid.includes(x);
    const res = [];
    const pref = U.shuffle(prefer.filter((x) => pool.includes(x) && ok(x)));
    if (pref.length && n > 0) res.push(pref[0]);
    const rest = U.shuffle(pool.filter((x) => ok(x) && !res.includes(x)));
    while (res.length < n && rest.length) res.push(rest.shift());
    return res;
  };

  /** „der“ → „Der“ usw. für Satzanfänge. */
  S2.Art = (a) => U.cap(a);

  LT.s2 = S2;
})();
