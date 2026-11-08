/* ==========================================================================
   Forscherbuch 📔 – Sammlung der Wissenskarten aus den Wissensreisen.

   LT.wissen.showBook({ onBack })   – Vollbild-Bildschirm (Zurück → onBack)
   LT.wissen.bookButton({ onBack, big }) – Knopf zum Einbinden (Startseite/Insel)

   Didaktik: Das Buch macht Gelerntes sichtbar (Sammelmotivation) und lädt zum
   Wiederholen ein – jede gesammelte Karte wird beim Antippen vorgelesen.
   Fehlende Karten zeigen, wo es noch etwas zu entdecken gibt.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.wissen;
  if (!W) return;

  const LEVEL_SAY = ['Du bekommst sie auf Stufe eins.', 'Du bekommst sie auf Stufe zwei.', 'Du bekommst sie auf Stufe drei.'];
  const TEXT = {
    helloEmpty: 'Das ist dein Forscherbuch. Hier sammelst du Wissenskarten. Spiele die Wissensreisen in der Forscherwelt!',
    hello: 'Das ist dein Forscherbuch. Tippe auf eine Karte, dann lese ich sie dir vor.',
    missing: 'Diese Karte bekommst du in der Wissensreise.',
    tapMascot: 'Tippe auf eine Karte. Die bunten Karten hast du schon gesammelt.',
    start: 'Möchtest du die Wissensreise jetzt spielen?',
  };

  function bigCard(unit, idx) {
    const f = unit.facts[idx];
    return el('div.wz-bigcard', { role: 'img', 'aria-label': f.text },
      el('span.wz-front-head', U.emoji(unit.icon), el('span', unit.title)),
      U.emoji(f.e || unit.icon, 'wz-front-e'),
      el('span.wz-front-text', f.text),
      el('div.wz-card-pips', [0, 1, 2].map((k) => el('i' + (k === idx ? '.on' : W.hasCard(unit.id, k) ? '.have' : '')))));
  }

  function showCard(unit, idx) {
    const f = unit.facts[idx];
    LT.sfx.play('flip');
    const ov = LT.ui.overlay([
      bigCard(unit, idx),
      el('div.actions',
        LT.ui.button('', () => LT.speech.say(f.text), { icon: '🔊', cls: 'wz-ov-say' }),
        LT.ui.button('', () => ov.close(), { icon: '✅', cls: 'btn-primary wz-ov-ok' })),
    ], { className: 'wz-card-overlay', onClose: () => LT.speech.stop() });
    ov.querySelector('.wz-ov-say').setAttribute('aria-label', 'Nochmal hören');
    ov.querySelector('.wz-ov-ok').setAttribute('aria-label', 'Schließen');
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.close(); });
    LT.speech.say(f.text);
  }

  function showMissing(unit, idx, reopen) {
    const ov = LT.ui.overlay([
      el('div.wz-missing-big', { 'aria-hidden': 'true' }, U.emoji(unit.icon), el('span', '?')),
      el('h2', unit.title),
      el('div.actions',
        LT.games[unit.id] ? LT.ui.button('', () => {
          ov.remove();
          // Über das App-Gate starten (Bewegungspause, Tageslimit) und Bildschirm als Spiel markieren,
          // damit die Limit-Prüfung in app.js die laufende Runde nicht abbricht.
          const go = () => {
            if (LT.app) LT.app.screen = 'game';
            LT.engine.start(unit.id, { onExit: () => reopen() });
          };
          if (LT.app && typeof LT.app.gate === 'function' && !LT.app.gate(go)) return;
          go();
        }, { icon: '▶️', cls: 'btn-primary wz-ov-play', big: true }) : null,
        LT.ui.button('', () => ov.close(), { icon: '⬅️', cls: 'wz-ov-ok', big: true })),
    ], { className: 'wz-card-overlay', onClose: () => LT.speech.stop() });
    const play = ov.querySelector('.wz-ov-play');
    if (play) play.setAttribute('aria-label', 'Wissensreise spielen');
    ov.querySelector('.wz-ov-ok').setAttribute('aria-label', 'Zurück zum Forscherbuch');
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.close(); });
    (async () => {
      await LT.speech.say(TEXT.missing);
      if (!ov.isConnected) return;
      await LT.speech.say(unit.title);
      if (!ov.isConnected) return;
      await LT.speech.say(LEVEL_SAY[idx] || LEVEL_SAY[0]);
      if (!ov.isConnected) return;
      if (play) LT.speech.say(TEXT.start);
    })();
  }

  W.showBook = function (opts = {}) {
    const onBack = opts.onBack || (() => (LT.app && LT.app.showHome ? LT.app.showHome() : null));
    const reopen = () => W.showBook(opts);
    if (LT.engine) LT.engine.stop();
    if (LT.app) LT.app.screen = 'book';
    const have = W.cardCount();
    const total = W.totalCards();
    const counter = el('div.wz-counter', { 'aria-label': 'Gesammelte Karten' }, U.emoji('🃏'), el('span', have + ' von ' + total));
    const { screen } = LT.ui.screen({ area: W.AREA, className: 'wz-book-screen', title: 'Mein Forscherbuch', icon: '📔', onBack, right: [counter] });
    const content = el('div.content.wz-book');
    screen.appendChild(content);
    LT.ui.setMascot({ big: false, hidden: false });
    LT.ui.onMascotTap = () => LT.speech.say(TEXT.tapMascot);

    content.appendChild(el('div.wz-book-meter', el('div.meter', el('i', { style: { width: (total ? Math.round((have / total) * 100) : 0) + '%' } }))));

    const cards = W.cards();
    W.THEMES.forEach((th) => {
      const units = W.units.filter((u) => u.theme === th.id);
      if (!units.length) return;
      const ordered = LT.gamesOfArea ? LT.gamesOfArea(W.AREA).map((g) => W.unit(g.id)).filter((u) => u && u.theme === th.id) : units;
      const list = el('div.wz-chapter-units');
      (ordered.length ? ordered : units).forEach((u) => {
        const got = cards[u.id] || [];
        const slots = el('div.wz-slots');
        for (let i = 0; i < 3; i++) {
          if (i >= u.facts.length) continue;
          const owned = got.includes(i);
          const btn = owned
            ? el('button.wz-mini-card.owned', { type: 'button', 'aria-label': u.facts[i].text, on: { click: () => showCard(u, i) } }, U.emoji(u.facts[i].e || u.icon), el('span.wz-mini-lv', [0, 1, 2].map((k) => el('i' + (k <= i ? '.on' : '')))))
            : el('button.wz-mini-card.missing', { type: 'button', 'aria-label': 'Fehlende Karte', on: { click: () => { LT.sfx.play('click'); showMissing(u, i, reopen); } } }, el('span.wz-q', '?'));
          slots.appendChild(btn);
        }
        list.appendChild(el('div.wz-unit-row' + (got.length >= u.facts.length && u.facts.length ? '.complete' : ''),
          el('div.wz-unit-head', U.emoji(u.icon, 'wz-unit-icon'), el('span.wz-unit-title', u.title), got.length >= u.facts.length && u.facts.length ? U.emoji('🏅', 'wz-medal') : null),
          slots));
      });
      content.appendChild(el('section.wz-chapter.wz-theme-' + th.id, el('h3.wz-chapter-title', U.emoji(th.icon), el('span', th.title)), list));
    });
    if (!W.units.length) content.appendChild(el('p.wz-empty', U.emoji('🔭'), ' Noch keine Wissensreisen.'));
    LT.speech.say(have ? TEXT.hello : TEXT.helloEmpty);
    return screen;
  };

  /** Fertiger Knopf (für Startseite / Forscherwelt-Insel, eingebunden von app.js). */
  W.bookButton = function (opts = {}) {
    const have = W.cardCount();
    return el('button.btn.wz-book-btn' + (opts.big ? '.btn-big' : ''), {
      type: 'button',
      'aria-label': 'Forscherbuch',
      title: 'Forscherbuch',
      on: { click: () => { LT.sfx.play('click'); W.showBook({ onBack: opts.onBack }); } },
    }, U.emoji('📔'), el('span', 'Forscherbuch'), have ? el('span.wz-book-badge', String(have)) : null);
  };
})();
