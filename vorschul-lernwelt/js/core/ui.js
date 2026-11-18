/* ==========================================================================
   LT.ui – Oberflächen-Bausteine: Maskottchen Flo, Sprechblase, Lob,
   Effekte (Konfetti, fliegende Sterne), Overlays, Kopfleiste, Kacheln.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const UI = {};

  /* ------------------------------------------------------------------
     Flo, der Fuchs – eigenes SVG-Maskottchen (blinzelt, spricht, wedelt)
     ------------------------------------------------------------------ */
  UI.floSVG = function () {
    return `
<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="tail"><path d="M100 112 C128 108 138 84 128 62 C122 84 108 94 92 98 Z" fill="#ff8a3d"/>
  <path d="M128 62 C134 74 132 88 124 98 C122 88 124 74 128 62 Z" fill="#fff"/></g>
  <ellipse cx="70" cy="114" rx="30" ry="20" fill="#ff8a3d"/>
  <ellipse cx="70" cy="118" rx="17" ry="13" fill="#fff4e8"/>
  <path d="M26 46 L34 6 L58 32 Z" fill="#ff8a3d" stroke="#e86f22" stroke-width="2" stroke-linejoin="round"/>
  <path d="M33 38 L37 16 L50 31 Z" fill="#5a3a2e"/>
  <path d="M114 46 L106 6 L82 32 Z" fill="#ff8a3d" stroke="#e86f22" stroke-width="2" stroke-linejoin="round"/>
  <path d="M107 38 L103 16 L90 31 Z" fill="#5a3a2e"/>
  <path d="M70 22 C104 22 122 44 120 66 C118 88 98 104 70 104 C42 104 22 88 20 66 C18 44 36 22 70 22 Z" fill="#ff8a3d"/>
  <path d="M70 58 C84 58 104 66 116 72 C112 92 94 104 70 104 C46 104 28 92 24 72 C36 66 56 58 70 58 Z" fill="#fff4e8"/>
  <ellipse cx="34" cy="80" rx="8" ry="5" fill="#ffb3a1" opacity=".75"/>
  <ellipse cx="106" cy="80" rx="8" ry="5" fill="#ffb3a1" opacity=".75"/>
  <g class="eye"><ellipse cx="50" cy="60" rx="8" ry="10" fill="#2b2d42"/><circle cx="53" cy="56" r="3" fill="#fff"/></g>
  <g class="eye"><ellipse cx="90" cy="60" rx="8" ry="10" fill="#2b2d42"/><circle cx="93" cy="56" r="3" fill="#fff"/></g>
  <path d="M40 44 Q50 39 59 44" stroke="#5a3a2e" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M81 44 Q90 39 100 44" stroke="#5a3a2e" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="70" cy="76" rx="8" ry="5.5" fill="#2b2d42"/>
  <path d="M60 85 Q70 92 80 85" stroke="#2b2d42" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse class="mouth-open" cx="70" cy="88" rx="7" ry="6" fill="#c2414b"/>
</svg>`;
  };

  let mascotEl = null;
  let bubbleEl = null;
  let bubbleTimer = null;

  UI.initMascot = function () {
    mascotEl = el('div.mascot', { html: UI.floSVG(), title: 'Flo – nochmal hören', role: 'button', tabindex: '0', 'aria-label': 'Flo – nochmal hören' });
    bubbleEl = el('div.bubble', { role: 'status', 'aria-live': 'polite' });
    mascotEl.addEventListener('click', () => {
      LT.sfx.play('pop');
      UI.cheer();
      if (UI.onMascotTap) UI.onMascotTap();
    });
    // per Tastatur bedienbar wie ein Knopf (Enter, Leertaste)
    mascotEl.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      mascotEl.click();
    });
    document.body.appendChild(mascotEl);
    document.body.appendChild(bubbleEl);
    LT.speech.on('start', (text) => {
      mascotEl.classList.add('talking');
      if (text) {
        clearTimeout(bubbleTimer);
        bubbleEl.textContent = text;
        bubbleEl.classList.add('show');
      }
    });
    LT.speech.on('end', () => {
      mascotEl.classList.remove('talking');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubbleEl.classList.remove('show'), 2600);
    });
  };
  UI.mascot = () => mascotEl;
  UI.setMascot = function ({ big, hidden } = {}) {
    if (!mascotEl) return;
    mascotEl.classList.toggle('big', !!big);
    mascotEl.classList.toggle('hidden', !!hidden);
    // ausgeblendet (aus dem Bild geschoben): nicht per Tab erreichbar, für Vorleser stumm
    mascotEl.tabIndex = hidden ? -1 : 0;
    if (hidden) mascotEl.setAttribute('aria-hidden', 'true'); else mascotEl.removeAttribute('aria-hidden');
    document.body.classList.toggle('mascot-big', !!big && !hidden);
    if (hidden) bubbleEl.classList.remove('show');
  };
  UI.cheer = function () {
    if (!mascotEl) return;
    mascotEl.classList.remove('cheer', 'think');
    void mascotEl.offsetWidth;
    mascotEl.classList.add('cheer');
  };
  UI.think = function () {
    if (!mascotEl) return;
    mascotEl.classList.remove('cheer', 'think');
    void mascotEl.offsetWidth;
    mascotEl.classList.add('think');
  };
  UI.hideBubble = () => bubbleEl && bubbleEl.classList.remove('show');

  /* ------------------------------------------------------------------
     Lob & Ermutigung (prozessbezogen, wachstumsorientiert)
     ------------------------------------------------------------------ */
  const PRAISE_SHORT = ['Super!', 'Richtig!', 'Klasse!', 'Genau!', 'Prima!', 'Toll!', 'Spitze!', 'Jawoll!', 'Sehr gut!', 'Stark!'];
  const PRAISE_LONG = [
    'Du hast genau hingeschaut!',
    'Das hast du dir gut überlegt!',
    'Super, du bleibst dran!',
    'Toll gemacht, weiter so!',
    'Klasse, du lernst richtig viel!',
    'Prima mitgedacht!',
  ];
  const ENCOURAGE = ['Fast! Probier es noch einmal.', 'Hmm, schau noch mal genau hin.', 'Noch nicht ganz. Du schaffst das!', 'Versuch es nochmal!', 'Nicht schlimm. Probier es nochmal!'];
  const HINT = ['Ich helfe dir ein bisschen.', 'Schau mal, ich zeige es dir.', 'Hier ist ein Tipp für dich.'];
  let praiseCount = 0;

  UI.praise = function () {
    praiseCount++;
    const name = LT.progress.settings().praiseName ? LT.progress.name() : '';
    if (praiseCount % 4 === 0) return U.pickFresh('praiseL', PRAISE_LONG, 3);
    const p = U.pickFresh('praiseS', PRAISE_SHORT, 4);
    if (name && praiseCount % 3 === 0) return p.replace(/!$/, '') + ', ' + name + '!';
    return p;
  };
  UI.encourage = () => U.pickFresh('enc', ENCOURAGE, 3);
  UI.hintPhrase = () => U.pick(HINT);

  /* ------------------------------------------------------------------
     Effekte
     ------------------------------------------------------------------ */
  let fx = null;
  function fxLayer() {
    if (!fx || !fx.isConnected) {
      fx = el('div.fx-layer');
      document.body.appendChild(fx);
    }
    return fx;
  }
  UI.confetti = function (n = 70) {
    if (LT.config.test) return;
    const layer = fxLayer();
    const colors = ['#ff8a3d', '#8e6cef', '#ff5fa2', '#1fb5c9', '#3dbe6b', '#ffc533', '#4a90e2'];
    for (let i = 0; i < n; i++) {
      const c = el('i.confetti', {
        style: {
          left: Math.random() * 100 + 'vw',
          background: U.pick(colors),
          animationDuration: 1.6 + Math.random() * 1.8 + 's',
          animationDelay: Math.random() * 0.4 + 's',
          '--dx': (Math.random() - 0.5) * 200 + 'px',
          '--rot': (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720) + 'deg',
          width: 8 + Math.random() * 8 + 'px',
          height: 12 + Math.random() * 10 + 'px',
        },
      });
      layer.appendChild(c);
      setTimeout(() => c.remove(), 4200);
    }
  };
  /** Stern fliegt von einem Element zur Sternanzeige (oder nach oben). */
  UI.flyStar = function (fromEl, symbol = '⭐') {
    if (LT.config.test || !fromEl || !fromEl.getBoundingClientRect) return;
    const layer = fxLayer();
    const a = U.center(fromEl);
    const target = document.querySelector('.topbar .dots .dot.current') || document.querySelector('.star-counter');
    const b = target ? U.center(target) : { x: a.x, y: -40 };
    const s = el('span.fly-star', { style: { left: a.x - 21 + 'px', top: a.y - 21 + 'px', '--tx': b.x - a.x + 'px', '--ty': b.y - a.y + 'px' } }, symbol);
    layer.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  };
  UI.animate = function (node, cls) {
    if (!node || !node.classList) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    setTimeout(() => node.classList.remove(cls), 1200);
  };

  /* ------------------------------------------------------------------
     Kopfleiste & Bildschirme
     ------------------------------------------------------------------ */
  UI.root = () => document.getElementById('app');

  /**
   * Neuen Bildschirm anlegen. Liefert {screen, topbar, body}.
   * 3D-Welt: place = Ort der Kamera (siehe LT.w3d.go; ohne Angabe ruhiger Himmel 'sky',
   * null = Kamera bleibt), frame = freier Bildbereich bzw. Funktion, die ihn liefert,
   * live = frame laufend nachlesen (z. B. HUD wächst nach dem Laden der Schrift).
   * UI.onLeave (einmalig): läuft, bevor der nächste Bildschirm entsteht (z. B. Nachtstimmung beenden).
   */
  UI.onLeave = null;

  /**
   * Schutz vor Geister- und Doppeltipps: Nach einem Bildschirmwechsel (oder einem neuen Dialog)
   * liegt unter dem Finger oft schon ein neuer Knopf – ein zweiter schneller Tipp des Kindes
   * (oder der Kompatibilitäts-Klick des Browsers nach einem Touch) würde ihn auslösen. Klicks aus
   * Zeigereingaben, die in den ersten UI.tapGuard ms ankommen, werden darum verworfen.
   * Tastatur (click.detail 0) und programmatische Klicks (element.click(), Tests) bleiben
   * unberührt. Im Testmodus aus (0), Tests können es mit LT.ui.tapGuard = 450 einschalten.
   */
  UI.tapGuard = LT.config && LT.config.test ? 0 : 450;
  let guardUntil = 0;
  UI.guardTaps = function (ms = UI.tapGuard) {
    if (ms > 0) guardUntil = Math.max(guardUntil, performance.now() + ms);
  };
  document.addEventListener('click', (e) => {
    // Zeitpunkt der Eingabe selbst (nicht der Verarbeitung): auf einem ausgelasteten Gerät
    // kommt der zweite Tipp sonst „zu spät“ an und rutschte durch
    const now = performance.now();
    const t = e.timeStamp > 0 && e.timeStamp <= now + 1 ? e.timeStamp : now;
    if (!e.isTrusted || e.detail === 0 || t >= guardUntil) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);

  UI.screen = function ({ area, className = '', title, icon, onBack, backIcon = '🏠', right = [], place, frame, live } = {}) {
    if (UI.onLeave) { const f = UI.onLeave; UI.onLeave = null; try { f(); } catch (e) { console.error(e); } }
    UI.guardTaps();
    const root = UI.root();
    U.clear(root);
    document.querySelectorAll('.overlay').forEach((o) => o.remove());
    const screen = el('section.screen' + (className ? '.' + className.split(' ').join('.') : ''));
    UI.applyArea(screen, area);
    let topbar = null;
    if (title !== undefined) {
      topbar = el('header.topbar');
      if (onBack) {
        topbar.appendChild(
          el('button.btn-round', { 'aria-label': 'Zurück', title: 'Zurück', on: { click: () => { LT.sfx.play('click'); onBack(); } } }, U.emoji(backIcon))
        );
      }
      topbar.appendChild(el('div.title', icon ? U.emoji(icon) : null, el('span', title)));
      right.forEach((r) => r && topbar.appendChild(r));
      screen.appendChild(topbar);
    }
    root.appendChild(screen);
    if (LT.w3d && place !== null) LT.w3d.go(place === undefined ? 'sky' : place, frame ? { frame, live: !!live } : {});
    // Fokus an den Anfang des neuen Bildschirms (Tastatur, Vorleser) – sonst fiele er auf body.
    // Erst nach dem Aufbau (Mikroaufgabe) und nur, wenn der Bildschirm nicht selbst fokussiert.
    queueMicrotask(() => {
      const a = document.activeElement;
      if (!screen.isConnected || (a && a !== document.body && a !== document.documentElement)) return;
      const head = screen.querySelector('.topbar .title, h1, h2');
      if (!head) return;
      if (!head.hasAttribute('tabindex')) { head.tabIndex = -1; head.style.outline = 'none'; } // nur Lesezeichen, kein Knopf: ohne Fokusrahmen
      try { head.focus({ preventScroll: true }); } catch (e) { /* egal */ }
    });
    return { screen, topbar };
  };
  UI.applyArea = function (node, area) {
    const a = typeof area === 'string' ? LT.areaById(area) : area;
    if (a) {
      node.style.setProperty('--area', a.color);
      node.style.setProperty('--area-soft', a.soft);
    }
  };

  UI.starCounter = function () {
    return el('div.star-counter', { 'aria-label': 'Sterne' }, U.emoji('⭐'), el('span.count', String(LT.progress.profile.stars)));
  };
  UI.bumpStars = function () {
    document.querySelectorAll('.star-counter').forEach((s) => {
      const c = s.querySelector('.count');
      if (c) c.textContent = String(LT.progress.profile.stars);
      UI.animate(s, 'bump');
    });
  };

  /**
   * Dialog über dem Bildschirm (role=dialog, aria-modal). Der Fokus springt auf den ersten
   * Knopf, bleibt im Dialog (Tab/Umschalt+Tab) und kehrt beim Schließen zurück.
   * opts.cancel: Funktion für Escape (z. B. „Abbrechen“); ohne cancel schließt Escape nicht
   * (Bewegungspause, Belohnung: dort entscheidet der Knopf).
   */
  let dialogSeq = 0;
  const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  UI.overlay = function (content, { onClose, className = '', cancel } = {}) {
    const panel = el('div.panel', content);
    const ov = el('div.overlay' + (className ? '.' + className : ''), { role: 'dialog', 'aria-modal': 'true' }, panel);
    const head = panel.querySelector('h1, h2, h3, .ask-text, p');
    if (head) {
      if (!head.id) head.id = 'dlg-title-' + ++dialogSeq;
      ov.setAttribute('aria-labelledby', head.id);
    }
    const before = document.activeElement;
    ov.close = () => {
      ov.remove();
      if (onClose) onClose();
    };
    // Schließen (auch direkt per ov.remove()): Fokus zurück, wo er vorher war
    ov.remove = function () {
      const had = ov.contains(document.activeElement);
      Element.prototype.remove.call(ov);
      if (had && before && before.isConnected && typeof before.focus === 'function') { try { before.focus({ preventScroll: true }); } catch (e) { /* egal */ } }
    };
    ov.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && typeof cancel === 'function') { e.preventDefault(); e.stopPropagation(); cancel(); return; }
      if (e.key !== 'Tab') return;
      const list = [...ov.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || !ov.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !ov.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    });
    // Farbe der aktuellen Welt übernehmen (Overlays liegen außerhalb des Bildschirms)
    const scr = document.querySelector('.screen');
    if (scr) {
      const cs = getComputedStyle(scr);
      ['--area', '--area-soft'].forEach((v) => { const val = cs.getPropertyValue(v); if (val) ov.style.setProperty(v, val.trim()); });
    }
    document.body.appendChild(ov);
    UI.guardTaps();
    // Fokus in den Dialog (der Knopf dahinter bliebe sonst fokussiert)
    const first = ov.querySelector(FOCUSABLE);
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { /* egal */ } } else {
      panel.tabIndex = -1;
      try { panel.focus({ preventScroll: true }); } catch (e) { /* egal */ }
    }
    return ov;
  };
  /** Escape irgendwo im Dokument: oberster Dialog mit cancel (Fokus kann außerhalb liegen) */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const ovs = document.querySelectorAll('.overlay[role="dialog"]');
    const top = ovs[ovs.length - 1];
    if (top && !top.contains(e.target)) top.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: false, cancelable: true }));
  });

  /** Eigene Rückfrage statt confirm()/alert(): diese werden in eingebetteten
      Ansichten (z. B. Chrome im iframe) oft stillschweigend unterdrückt.
      Liefert ein Promise<boolean>. Ohne `no` ist es ein reiner Hinweis. */
  UI.ask = function (question, { yes = 'Ja', no = 'Abbrechen', danger = false } = {}) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (v) => { if (done) return; done = true; ov.remove(); resolve(v); };
      const buttons = el('div.ask-buttons',
        no ? el('button.p-btn.light', { on: { click: () => finish(false) } }, no) : null,
        el('button.p-btn' + (danger ? '.danger' : ''), { on: { click: () => finish(true) } }, yes)
      );
      const ov = UI.overlay([el('p.ask-text', question), buttons], { className: 'ask', cancel: () => finish(!no) });
      ov.addEventListener('click', (e) => { if (e.target === ov) finish(false); });
      const first = buttons.querySelector('button:last-child');
      if (first) setTimeout(() => first.focus(), 0);
    });
  };

  UI.toast = function (text, ms = 2200) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const t = el('div.toast', text);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  /** Großer Button. */
  UI.button = function (label, onClick, { icon, cls = '', big = false } = {}) {
    return el(
      'button.btn' + (big ? '.btn-big' : '') + (cls ? '.' + cls.split(' ').join('.') : ''),
      { on: { click: (e) => { LT.sfx.play('click'); onClick(e); } } },
      icon ? U.emoji(icon) : null,
      label ? el('span', label) : null
    );
  };

  /**
   * Antwort-Kachel. content: String (Emoji/Text) oder Node.
   * opts: { size: 'small'|'large'|'wide', say: 'Wort zum Vorlesen', label: 'Beschriftung', text: true (Text statt Emoji) }
   */
  UI.tile = function (content, opts = {}) {
    const cls = ['tile'];
    if (opts.size) cls.push(...opts.size.split(' '));
    if (opts.className) cls.push(...opts.className.split(' '));
    const t = el('button', { class: cls.join(' '), type: 'button', 'aria-label': opts.aria || opts.say || (typeof content === 'string' ? content : '') });
    if (content instanceof Node) t.appendChild(content);
    else if (opts.text) t.appendChild(el('span.tile-text', { style: opts.fontSize ? { fontSize: opts.fontSize } : null }, content));
    else t.appendChild(U.emoji(content));
    if (opts.label) t.appendChild(el('span.label', opts.label));
    if (opts.say && opts.sayButton) {
      const b = el('span.say-btn', { role: 'button', 'aria-label': 'Anhören', title: 'Anhören' }, '🔊');
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        LT.speech.say(opts.say);
      });
      t.appendChild(b);
    }
    return t;
  };

  /** Lautsprecher-Knopf (z. B. für „Wort nochmal hören“). */
  UI.speakButton = function (getText, { cls = '' } = {}) {
    return el('button.btn-round' + (cls ? '.' + cls : ''), {
      'aria-label': 'Nochmal hören',
      title: 'Nochmal hören',
      on: { click: () => { const t = typeof getText === 'function' ? getText() : getText; if (t) LT.speech.say(t); } },
    }, U.emoji('🔊'));
  };

  LT.ui = UI;
})();
