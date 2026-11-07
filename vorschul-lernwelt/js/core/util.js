/* ==========================================================================
   LT.util – kleine Helfer (Zufall, DOM, Zeit)
   Alle Module hängen am globalen Namensraum window.LT, damit die App auch
   ohne Webserver per Doppelklick (file://) funktioniert.
   ========================================================================== */
(function () {
  'use strict';
  const LT = (window.LT = window.LT || {});

  const params = new URLSearchParams(location.search);
  LT.config = Object.assign(
    {
      /** Testmodus (?test): Sprache stumm, Animationen ~50x schneller, Test-Markierungen im DOM. */
      test: params.has('test'),
      speed: 1,
    },
    LT.config || {}
  );
  if (LT.config.test) LT.config.speed = 0.02;

  const U = {};

  U.rand = (n) => Math.floor(Math.random() * n);
  U.randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  /** n verschiedene Elemente zufällig auswählen. */
  U.sample = (arr, n) => U.shuffle(arr).slice(0, n);
  /** Liste [a..b] inklusive. */
  U.range = (a, b) => {
    const r = [];
    for (let i = a; i <= b; i++) r.push(i);
    return r;
  };
  U.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  U.sum = (arr) => arr.reduce((s, x) => s + x, 0);
  U.uniqueBy = (arr, fn) => {
    const seen = new Set();
    return arr.filter((x) => {
      const k = fn(x);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
  /** Zufällige Distraktoren: n Elemente aus pool, die nicht in exclude sind. */
  U.distractors = (pool, n, exclude = []) => {
    const ex = new Set(exclude);
    return U.sample(pool.filter((x) => !ex.has(x)), n);
  };
  /** Zieht ohne direkte Wiederholung: merkt sich die letzten k Werte pro Schlüssel. */
  const recent = {};
  U.pickFresh = (key, arr, k = 3, idFn = (x) => x) => {
    const mem = (recent[key] = recent[key] || []);
    const k2 = Math.min(k, Math.max(0, arr.length - 1));
    let pool = arr.filter((x) => !mem.includes(idFn(x)));
    if (!pool.length) pool = arr;
    const v = U.pick(pool);
    mem.push(idFn(v));
    while (mem.length > k2) mem.shift();
    return v;
  };

  /** Wartet ms Millisekunden (im Testmodus stark verkürzt). */
  U.sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms * LT.config.speed)));

  /**
   * DOM-Helfer:  U.el('button.tile.big', { on: { click: fn }, data: { id: 3 }, style: {...} }, 'Text', node)
   * attrs: class, text, html, style (Objekt oder String), on, data, attrs (beliebige Attribute),
   *        sowie direkt gesetzte Attribute wie title, type, role, aria-label …
   */
  U.el = function (tag, attrs, ...children) {
    let t = tag || 'div';
    let classes = [];
    let id = null;
    const m = t.match(/^([a-z0-9-]+)?((?:[.#][\w-]+)*)$/i);
    if (m) {
      t = m[1] || 'div';
      (m[2] || '').replace(/([.#])([\w-]+)/g, (_, sym, name) => {
        if (sym === '.') classes.push(name);
        else id = name;
      });
    }
    const svgTags = /^(svg|path|circle|rect|ellipse|line|polyline|polygon|g|text|defs|use|tspan|clipPath|mask|linearGradient|radialGradient|stop)$/;
    const node = svgTags.test(t) ? document.createElementNS('http://www.w3.org/2000/svg', t) : document.createElement(t);
    if (id) node.id = id;
    if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
      children.unshift(attrs);
      attrs = null;
    }
    attrs = attrs || {};
    if (attrs.class) classes = classes.concat(String(attrs.class).split(/\s+/).filter(Boolean));
    if (classes.length) node.setAttribute('class', classes.join(' '));
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') continue;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'style') {
        if (typeof v === 'string') node.style.cssText = v;
        else for (const [sk, sv] of Object.entries(v)) {
          if (sk.startsWith('--')) node.style.setProperty(sk, sv);
          else node.style[sk] = sv;
        }
      } else if (k === 'on') {
        for (const [ev, fn] of Object.entries(v)) node.addEventListener(ev, fn);
      } else if (k === 'data') {
        for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
      } else if (k === 'attrs') {
        for (const [ak, av] of Object.entries(v)) node.setAttribute(ak, av);
      } else if (k in node && typeof v !== 'string' && !(node instanceof SVGElement)) {
        node[k] = v;
      } else {
        node.setAttribute(k, v === true ? '' : v);
      }
    }
    U.append(node, children);
    return node;
  };
  U.append = function (node, children) {
    for (const c of children.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      node.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return node;
  };
  U.clear = (node) => {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  };
  /** Emoji-Span mit passender Schriftart. */
  U.emoji = (ch, cls = '') => U.el('span', { class: 'emoji ' + cls, 'aria-hidden': 'true' }, ch);

  /** Spiel-spezifisches CSS einmalig einfügen: U.css('game-memory', '.memory-card{...}') */
  U.css = function (id, cssText) {
    if (document.getElementById('css-' + id)) return;
    const s = document.createElement('style');
    s.id = 'css-' + id;
    s.textContent = cssText;
    document.head.appendChild(s);
  };

  /** Zahlwörter 0–20 (für Sprache & Anzeige). */
  const NUM = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig'];
  U.numberWord = (n) => NUM[n] || String(n);

  /** Heutiges Datum als 'YYYY-MM-DD' (lokal). */
  U.today = (d = new Date()) => {
    const p = (x) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  /** Element-Mittelpunkt (für Effekte). */
  U.center = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  /** Großschreibung des ersten Buchstabens. */
  U.cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  LT.util = U;
})();
