/* ==========================================================================
   Gemeinsame Helfer der Spielgruppe 'zahlen2'
   (Zahlen-Zug, Zahlenhaus, Rechengeschichten) – Namensraum LT.z2

   Didaktischer Grundgedanke der Gruppe:
   - Zahlen werden immer mehrfach dargestellt: als Zahlwort (gesprochen),
     als Ziffer und als strukturierte Menge (Würfelbild, Fünferreihe,
     Zehnerfeld). So entsteht die Verbindung Menge ↔ Zahlwort ↔ Ziffer.
   - Hilfen sind „Vormachen statt Vorsagen“: Flo zeigt auf Dinge und zählt
     gemeinsam mit dem Kind (Z.countAlong).
   - Strukturierte Punktbilder (Fünfer-/Zehnerstruktur) fördern das
     „quasi-simultane“ Erfassen statt mühsamen Einzelzählens.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const Z = {};

  /* ---------------- Zahlwörter ---------------- */
  /** 'sieben' */
  Z.word = (n) => U.numberWord(n);
  /** 'Sieben' – als Nomen („die Sieben“, „vor der Sieben“) */
  Z.Word = (n) => U.cap(U.numberWord(n));
  /** Liste von Zahlen als gesprochene Reihe: „Drei, vier, fünf“. gap → „…“ */
  Z.sayList = (nums, gapIndex = -1) =>
    U.cap(nums.map((n, i) => (i === gapIndex ? '…' : Z.word(n))).join(', '));

  /* ---------------- Grammatik-Helfer (unbestimmter Artikel) ---------------- */
  // g: 'm' | 'f' | 'n'
  const ART_NOM = { m: 'ein', f: 'eine', n: 'ein' };
  const ART_ACC = { m: 'einen', f: 'eine', n: 'ein' };
  /** Nominativ: „ein Vogel“ / „3 Vögel“ */
  Z.nom = (n, it) => (n === 1 ? `${ART_NOM[it.g]} ${it.sg}` : `${n} ${it.pl}`);
  /** Akkusativ: „einen Apfel“ / „3 Äpfel“ */
  Z.acc = (n, it) => (n === 1 ? `${ART_ACC[it.g]} ${it.sg}` : `${n} ${it.pl}`);
  /** Verbform Singular/Plural */
  Z.verb = (n, sg, pl) => (n === 1 ? sg : pl);

  /**
   * Vielfältige Vornamen für Geschichten (g für Pronomen er/sie).
   * Bewusst gemischt: verschiedene Herkünfte, Mädchen und Jungen.
   */
  Z.NAMES = [
    { n: 'Lena', g: 'f' }, { n: 'Ben', g: 'm' }, { n: 'Aylin', g: 'f' }, { n: 'Emil', g: 'm' },
    { n: 'Mia', g: 'f' }, { n: 'Yusuf', g: 'm' }, { n: 'Sofia', g: 'f' }, { n: 'Noah', g: 'm' },
    { n: 'Leyla', g: 'f' }, { n: 'Jonas', g: 'm' }, { n: 'Amira', g: 'f' }, { n: 'Finn', g: 'm' },
    { n: 'Elif', g: 'f' }, { n: 'Milan', g: 'm' }, { n: 'Hanna', g: 'f' }, { n: 'Karim', g: 'm' },
    { n: 'Ida', g: 'f' }, { n: 'Luca', g: 'm' }, { n: 'Yara', g: 'f' }, { n: 'Mats', g: 'm' },
    { n: 'Mama', g: 'f' }, { n: 'Papa', g: 'm' }, { n: 'Oma', g: 'f' }, { n: 'Opa', g: 'm' },
  ];
  Z.pron = (p) => (p.g === 'f' ? 'sie' : 'er');
  Z.name = () => U.pickFresh('z2-name', Z.NAMES, 8, (p) => p.n);

  /* ---------------- Antwortmöglichkeiten ---------------- */
  /**
   * Zahlen-Antworten: n plus Ablenker. prefer = typische Fehler (werden
   * bevorzugt genommen, z. B. die Nachbarzahl), danach nahe Zahlen.
   * Ergebnis aufsteigend sortiert (wie auf einem Zahlenstrahl).
   */
  Z.options = function (n, count, lo, hi, prefer = []) {
    const set = new Set([n]);
    const max = Math.min(count, hi - lo + 1);
    for (const p of prefer) {
      if (set.size >= max) break;
      if (p >= lo && p <= hi) set.add(p);
    }
    for (const x of U.shuffle([n - 1, n + 1, n - 2, n + 2, n + 3, n - 3])) {
      if (set.size >= max) break;
      if (x >= lo && x <= hi) set.add(x);
    }
    let guard = 0;
    while (set.size < max && guard++ < 200) set.add(U.randInt(lo, hi));
    return Array.from(set).sort((a, b) => a - b);
  };

  /** Inhalt einer Zahlenkachel: große Ziffer, optional mit Würfelpunkten darunter. */
  Z.numTile = function (n, withDots) {
    return el('span.z2-tilenum', el('b', String(n)), withDots && n > 0 ? Z.dice(n, 'z2-tdice') : null);
  };

  /* ---------------- Punktbilder ---------------- */
  // Würfelbilder im 3×3-Raster (Indizes 0..8)
  const DICE = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  /** Würfelbild (1–6) bzw. Fünferreihen (ab 7). cls z. B. 'red'. */
  Z.dice = function (n, cls = '') {
    if (n >= 1 && n <= 6) {
      const box = el('span', { class: 'z2-dice ' + cls, 'aria-hidden': 'true' });
      for (let i = 0; i < 9; i++) box.appendChild(el('i', { class: DICE[n].includes(i) ? 'on' : '' }));
      return box;
    }
    return Z.dotRows(n, cls);
  };
  /** Punkte in Fünferreihen (Kraft der Fünf). */
  Z.dotRows = function (n, cls = '') {
    const box = el('span', { class: 'z2-dotrows ' + cls, 'aria-hidden': 'true' });
    for (let r = 0; r < Math.ceil(n / 5); r++) {
      const row = el('span.z2-dotrow');
      for (let i = r * 5; i < Math.min(n, r * 5 + 5); i++) row.appendChild(el('i.on'));
      box.appendChild(row);
    }
    return box;
  };

  /**
   * Plättchen-Reihe mit Fünfer-Lücke: spec = Array aus 'a' (rot), 'b' (blau), '' (leer).
   * Liefert { node, toks }.
   */
  Z.tokenRow = function (spec, cls = '') {
    const node = el('div', { class: 'z2-tokrow ' + cls, 'aria-hidden': 'true' });
    const toks = spec.map((s, i) => {
      const t = el('i', { class: 'z2-tok ' + (s || 'empty') });
      if (i > 0 && i % 5 === 0) node.appendChild(el('span.z2-tokgap'));
      node.appendChild(t);
      return t;
    });
    return { node, toks };
  };

  /**
   * Zehnerfeld (2 × 5): spec = 10 Einträge 'a' | 'b' | ''.
   * Liefert { node, cells, toks } – toks[i] ist das Plättchen in Feld i.
   */
  Z.tenFrame = function (spec, cls = '') {
    const node = el('div', { class: 'z2-ten ' + cls, 'aria-hidden': 'true' });
    const cells = [];
    const toks = [];
    for (let i = 0; i < 10; i++) {
      const tok = el('i', { class: 'z2-tok ' + (spec[i] || 'empty') });
      const c = el('span.z2-cell', tok);
      node.appendChild(c);
      cells.push(c);
      toks.push(tok);
    }
    return { node, cells, toks };
  };
  /** Plättchen umfärben ('a' | 'b' | 'empty'). */
  Z.setTok = (tok, kind) => {
    tok.classList.remove('a', 'b', 'empty');
    tok.classList.add(kind || 'empty');
  };

  /* ---------------- Gemeinsam zählen (Hilfe) ---------------- */
  /**
   * Flo zeigt nacheinander auf die Elemente und zählt laut mit.
   * opts: { start: 1, badge: true (Zahl ans Element heften), cls: 'z2-point', words }
   */
  Z.countAlong = async function (ctx, nodes, opts = {}) {
    const start = opts.start == null ? 1 : opts.start;
    const cls = opts.cls || 'z2-point';
    for (let i = 0; i < nodes.length; i++) {
      if (!ctx.active) return;
      const node = nodes[i];
      node.classList.add(cls);
      if (opts.badge !== false) {
        const old = node.querySelector(':scope > .z2-badge');
        if (old) old.remove();
        node.appendChild(el('span.z2-badge', String(start + i)));
      }
      LT.sfx.tone(420 + i * 35, 0.08, { type: 'triangle', volume: 0.3 });
      await ctx.say(opts.words ? opts.words[i] : Z.word(start + i));
      node.classList.remove(cls);
      await ctx.sleep(80);
    }
  };
  /** Zähl-Markierungen entfernen. */
  Z.clearBadges = (root) => root.querySelectorAll('.z2-badge').forEach((b) => b.remove());

  /**
   * Antippen zum Mitzählen (Eins-zu-eins-Zuordnung) wie im Referenzspiel:
   * jedes angetippte Element bekommt die nächste Zählzahl.
   * Liefert reset(), um die Zählung zurückzusetzen.
   */
  Z.tapToCount = function (ctx, nodes, isActive = () => true) {
    let counted = 0;
    nodes.forEach((b) => {
      ctx.listen(b, 'click', () => {
        if (!isActive(b) || b.classList.contains('z2-counted')) return;
        counted++;
        b.classList.add('z2-counted');
        b.appendChild(el('span.z2-badge', String(counted)));
        LT.sfx.tone(400 + counted * 30, 0.08, { type: 'triangle', volume: 0.3 });
        ctx.say(Z.word(counted));
      });
    });
    return function reset() {
      counted = 0;
      nodes.forEach((b) => {
        b.classList.remove('z2-counted');
        const s = b.querySelector(':scope > .z2-badge');
        if (s) s.remove();
      });
    };
  };

  /* ---------------- Animation ---------------- */
  /** Zwei Animation-Frames abwarten (damit CSS-Übergänge sicher starten). */
  Z.frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  /**
   * Eine Zahl fliegt von der gewählten Kachel in ihr Ziel (z. B. den leeren
   * Waggon). Im Testmodus sofort. Gibt ein Promise zurück.
   */
  Z.flyNumber = function (ctx, fromEl, toEl, text) {
    if (LT.config.test || !fromEl || !toEl || !fromEl.isConnected || !toEl.isConnected) return Promise.resolve();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const size = Math.min(a.height, 120);
    const fly = el('div.z2-fly', {
      style: {
        left: a.left + a.width / 2 - size / 2 + 'px',
        top: a.top + a.height / 2 - size / 2 + 'px',
        width: size + 'px',
        height: size + 'px',
        fontSize: size * 0.55 + 'px',
      },
    }, text);
    document.body.appendChild(fly);
    ctx.onCleanup(() => fly.remove());
    const scale = Math.max(0.35, Math.min(1, b.height / size));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fly.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${scale})`;
    }));
    return ctx.sleep(560).then(() => fly.remove());
  };

  LT.z2 = Z;
})();
