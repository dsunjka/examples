/* ==========================================================================
   Forscherwelt 🔭 – Wissens-Engine (LT.wissen)

   Eine „Wissensreise“ (Einheit) wird von den Inhaltsdateien (natur.js,
   mensch.js, welt.js) mit LT.wissen.addUnit({...}) angemeldet. Die Engine
   macht daraus ein Spiel (Typ 'single', 3 Stufen) der Insel 'wissen'.

   Didaktik – jede Runde ist eine kleine, schrittweise Lernreise mit vier
   Stationen (sichtbar als Fußspuren oben):
     📖 Entdecken   → Bildergeschichte mit Mitmach-Momenten (Tippen)
     ❓ Verstehen   → Fragen mit Bildantworten, danach die Begründung („weil …“)
     🎲 Spielen     → Wissen anwenden: Reihenfolge, Sortieren, Stimmt-oder-stimmt-nicht
     🃏 Wissenskarte → Merksatz zum Sammeln im Forscherbuch (Ergebnissicherung)
   Stufe 1: ganze Geschichte · Grundfragen
   Stufe 2: „Weißt du noch?“ – Bild zum Satz finden (Wiederholung) · vertiefte Fragen
   Stufe 3: Wissenskarten wiederholen (verteiltes Lernen) · Experten- und Denkfragen
   Gewertet wird (für Sterne/Stufe), was beim ERSTEN Versuch gelingt.

   Alle gesprochenen Sätze sind feste Strings (vorab aufgenommene Stimme).

   API:
     LT.wissen.addUnit(def | [defs])   – Einheit anmelden (robust, auch mehrfach/vorab)
     LT.wissen.units                   – Liste aller Einheiten (Registrierreihenfolge)
     LT.wissen.unit(id)                – Einheit nach id
     LT.wissen.THEMES                  – Kapitel { id, title, icon }
     LT.wissen.cards()                 – { unitId: [0, 2, …] } gesammelte Karten (Kopie)
     LT.wissen.hasCard(unitId, idx)    – Karte schon gesammelt?
     LT.wissen.addCard(unitId, idx)    – Karte speichern (true = neu)
     LT.wissen.cardCount() / totalCards()
     LT.wissen.showBook({ onBack })    – Forscherbuch (buch.js)
     LT.wissen.bookButton({ onBack })  – fertiger Knopf zum Forscherbuch (buch.js)
   Vorab-Warteschlange: window.LT.wissenQueue = [unit, …] wird beim Laden verarbeitet.
   ========================================================================== */
(function () {
  'use strict';
  const LT = (window.LT = window.LT || {});
  const U = LT.util;
  const el = U.el;

  const AREA = 'wissen';
  const STORE_KEY = 'wissenKarten';

  /* ------------------------------------------------------------------
     Insel registrieren
     ------------------------------------------------------------------ */
  const ORDER = [
    'w-sinne', 'w-tierkinder', 'w-schmetterling', 'w-gesund', 'w-pflanzen', 'w-wetter',
    'w-lebensraeume', 'w-koerper-innen', 'w-helfer', 'w-umwelt', 'w-weltall', 'w-dinos',
  ];
  if (LT.areas && !LT.areas.find((a) => a.id === AREA)) {
    LT.areas.push({
      id: AREA,
      title: 'Forscherwelt',
      icon: '🔭',
      deco: ['🔍', '🦋', '🌍', '💡'],
      color: '#4f7cff',
      soft: '#e1e9ff',
      hello: 'Willkommen in der Forscherwelt! Hier entdecken wir spannendes Wissen über Tiere, Natur, unseren Körper und die Welt.',
      parent:
        'Sachwissen und naturwissenschaftliches Grundverständnis in kleinen Lernreisen: Entdecken (Bildergeschichte zum Mitmachen), Verstehen (Fragen mit Begründung), Anwenden (Reihenfolgen, Sortieren, Aussagen prüfen) und Sichern (Wissenskarte für das Forscherbuch). Fachbegriffe werden eingeführt und wiederholt, Stufe 3 enthält Transfer- und Denkfragen.',
      games: ORDER.slice(),
    });
  }

  const THEMES = [
    { id: 'natur', title: 'Natur & Tiere', icon: '🌿' },
    { id: 'mensch', title: 'Mensch & Zusammenleben', icon: '🧒' },
    { id: 'welt', title: 'Welt & Technik', icon: '🌍' },
  ];

  const STEPS = [
    { id: 'entdecken', icon: '📖', name: 'Entdecken' },
    { id: 'verstehen', icon: '❓', name: 'Verstehen' },
    { id: 'spielen', icon: '🎲', name: 'Spielen' },
    { id: 'karte', icon: '🃏', name: 'Wissenskarte' },
  ];

  /* ------------------------------------------------------------------
     Feste Sätze (mehrere Varianten für Abwechslung)
     ------------------------------------------------------------------ */
  const T = {
    hello2: ['Schön, dass du wieder mitforschst!', 'Willkommen zurück in der Forscherwelt!'],
    hello3: ['Jetzt kommt die Experten-Reise! Das ist etwas für echte Profis.', 'Heute wird es knifflig. Das ist die Experten-Reise!'],
    step1: ['Erste Station: Entdecken. Hör gut zu und schau genau hin!', 'Wir fangen an. Schau dir die Geschichte an!'],
    step1b: ['Erste Station: Weißt du noch? Schau dir die Bilder an.'],
    step1c: ['Erste Station: Erinnerst du dich an deine Wissenskarten? Hör gut zu!'],
    step1n: ['Erste Station: Hör gut zu. Das haben Forscher schon herausgefunden.'],
    step2: ['Zweite Station: Verstehen. Jetzt stelle ich dir Fragen.', 'Jetzt kommen Forscherfragen. Überleg gut!'],
    step3: ['Dritte Station: Jetzt bist du dran!', 'Jetzt bist du dran! Wir spielen mit deinem Wissen.'],
    step4: ['Vierte Station: Jetzt kommt eine Wissenskarte für dein Forscherbuch!'],
    tapWrong: ['Schau noch mal genau hin.', 'Fast! Such noch ein bisschen.', 'Hmm, das ist es nicht. Such weiter!'],
    recallQ: 'Welches Bild passt zu diesem Satz? Hör gut zu.',
    recallRight: ['Genau! Du hast gut aufgepasst.', 'Richtig! Das weißt du noch.'],
    recallWrong: ['Hmm, schau dir die Bilder noch mal an.'],
    hint: 'Schau mal, ich zeige es dir.',
    orderStart: 'Was kommt zuerst?',
    orderWrong: ['Das kommt erst später. Was kommt vorher?', 'Noch nicht. Was kommt davor?'],
    orderHint: 'Schau, das hier kommt jetzt.',
    orderDone: 'Super! Jetzt hörst du die ganze Reihe.',
    sortPickFirst: 'Tippe zuerst auf ein Bild.',
    sortWrong: ['Das passt hier nicht. Probier es noch einmal!', 'Hmm, gehört das wirklich hierhin? Probier es nochmal!'],
    sortHint: 'Schau, hier gehört es hin.',
    sortDone: ['Alles richtig sortiert! Toll gemacht!', 'Fertig sortiert! Das hast du super gemacht!'],
    tfRight: ['Richtig!', 'Genau!'],
    tfWrong: ['Hmm, überleg noch mal.', 'Noch nicht ganz. Hör noch einmal genau hin.'],
    cardTap: 'Tippe auf die Karte. Dann dreht sie sich um.',
    cardNew: ['Kommt ins Forscherbuch!'],
    cardOld: ['Diese Karte hast du schon. Super, du weißt es noch!'],
    expert: ['Jetzt kommen die kniffligen Fragen!'],
  };
  const pick = (k) => U.pickFresh('wz-' + k, T[k], 1);

  /* ------------------------------------------------------------------
     Kartenspeicher (Forscherbuch)
     ------------------------------------------------------------------ */
  function loadCards() {
    const c = LT.store ? LT.store.get(STORE_KEY, {}) : {};
    return c && typeof c === 'object' && !Array.isArray(c) ? c : {};
  }

  const W = (LT.wissen = Object.assign(LT.wissen || {}, {
    AREA,
    THEMES,
    STEPS,
    units: [],
    unit: (id) => W.units.find((u) => u.id === id) || null,
    cards() {
      const c = loadCards();
      const out = {};
      Object.keys(c).forEach((k) => { if (Array.isArray(c[k])) out[k] = c[k].slice(); });
      return out;
    },
    hasCard(unitId, idx) {
      const c = loadCards();
      return Array.isArray(c[unitId]) && c[unitId].includes(idx);
    },
    addCard(unitId, idx) {
      const c = loadCards();
      const list = Array.isArray(c[unitId]) ? c[unitId] : [];
      if (list.includes(idx)) return false;
      list.push(idx);
      list.sort((a, b) => a - b);
      c[unitId] = list;
      if (LT.store) LT.store.set(STORE_KEY, c);
      return true;
    },
    cardCount() {
      const c = loadCards();
      return W.units.reduce((s, u) => s + (Array.isArray(c[u.id]) ? c[u.id].filter((i) => i < u.facts.length).length : 0), 0);
    },
    totalCards: () => W.units.reduce((s, u) => s + u.facts.length, 0),
    /** Fertige Kachel-Szene aus Emojis (für Geschichte, Buch, Wiederholung). */
    scene: (emojis, cls) => el('div.wz-scene' + (cls ? '.' + cls : ''), (emojis || []).map((e, i) => el('span.emoji.wz-se', { style: { '--i': i } }, e))),
  }));

  /* ------------------------------------------------------------------
     Einheit anmelden (robust: Teil-Daten, Doppelte, Arrays)
     ------------------------------------------------------------------ */
  const asArr = (x) => (Array.isArray(x) ? x : x ? [x] : []);

  function normalize(def) {
    const u = Object.assign({}, def);
    u.theme = THEMES.find((t) => t.id === u.theme) ? u.theme : 'natur';
    u.title = u.title || 'Wissensreise';
    u.icon = u.icon || '🔍';
    u.story = asArr(u.story).filter((s) => s && (s.say || s.scene)).map((s) => Object.assign({}, s, { scene: asArr(s.scene) }));
    u.quiz = asArr(u.quiz).filter((q) => q && q.q && Array.isArray(q.answers) && q.answers.length >= 2).map((q) => {
      const c = Number(q.correct) || 0;
      return Object.assign({}, q, { level: U.clamp(Number(q.level) || 1, 1, 3), correct: U.clamp(c, 0, q.answers.length - 1) });
    });
    u.play = asArr(u.play).filter((p) => p && p.type);
    u.facts = asArr(u.facts).filter((f) => f && f.text).slice(0, 3);
    return u;
  }

  W.addUnit = function (def) {
    if (Array.isArray(def)) return def.map(W.addUnit);
    if (!def || typeof def !== 'object' || !def.id) {
      console.warn('LT.wissen.addUnit: Einheit ohne id');
      return null;
    }
    if (W.unit(def.id) || (LT.games && LT.games[def.id])) return W.unit(def.id); // doppelt → ignorieren
    const u = normalize(def);
    W.units.push(u);
    if (typeof LT.registerGame === 'function') {
      LT.registerGame({
        id: u.id,
        area: AREA,
        title: u.title,
        icon: u.icon,
        levels: 3,
        type: 'single',
        parent: u.parent || { skill: 'Sachwissen', goal: u.intro || u.title, levels: ['Stufe 1: Grundwissen', 'Stufe 2: Vertiefung', 'Stufe 3: Experten-Fragen'], tip: '' },
        unit: u,
        play: (ctx) => runUnit(ctx, u),
      });
    }
    return u;
  };

  /* ------------------------------------------------------------------
     Kleine Helfer
     ------------------------------------------------------------------ */
  /** Wartet auf einen Klick auf node (im Testmodus markiert). */
  function waitClick(ctx, node) {
    return new Promise((resolve) => {
      const h = () => {
        if (!ctx.active) return;
        node.removeEventListener('click', h);
        ctx.markTest(node, false);
        resolve();
      };
      node.addEventListener('click', h);
      ctx.markTest(node);
    });
  }

  function nextButton(label) {
    return el('button.wz-next', { type: 'button', 'aria-label': label || 'Weiter', title: label || 'Weiter' }, U.emoji('➡️'));
  }

  /** Großer Weiter-Pfeil: erscheint, wartet auf Tippen. */
  async function waitNext(ctx, host, opts = {}) {
    const b = nextButton(opts.label);
    host.appendChild(b);
    if (opts.say) ctx.say(opts.say);
    await waitClick(ctx, b);
    LT.sfx.play('whoosh');
    b.disabled = true;
    return b;
  }

  /** Element mit FLIP-Animation in ein neues Elternelement verschieben. */
  function moveTo(node, parent) {
    const a = node.getBoundingClientRect();
    parent.appendChild(node);
    const b = node.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if (!dx && !dy) return;
    node.animate([{ transform: `translate(${dx}px, ${dy}px) scale(1.1)` }, { transform: 'none' }], { duration: Math.max(1, 450 * LT.config.speed), easing: 'cubic-bezier(.3,1.3,.5,1)' });
  }

  function miniDots(n) {
    const box = el('div.wz-mini', { 'aria-hidden': 'true' });
    for (let i = 0; i < n; i++) box.appendChild(el('i'));
    box.set = (k, state) => { const d = box.children[k]; if (d) d.className = state || ''; };
    return box;
  }

  /* ------------------------------------------------------------------
     Schritt-Anzeige (Fußspuren)
     ------------------------------------------------------------------ */
  function buildTrail(level) {
    const trail = el('ol.wz-trail', { 'aria-label': 'Deine Forscher-Reise' });
    const steps = STEPS.map((s, i) => {
      const name = i === 0 && level === 2 ? 'Weißt du noch?' : i === 0 && level === 3 ? 'Erinnern' : s.name;
      const li = el('li.wz-step', { 'aria-label': name },
        el('span.wz-step-icon', U.emoji(s.icon), el('span.wz-step-check.emoji', { 'aria-hidden': 'true' }, '✔️')),
        el('span.wz-step-name', name));
      return li;
    });
    steps.forEach((li, i) => {
      if (i) trail.appendChild(el('li.wz-prints', { 'aria-hidden': 'true' }, U.emoji('🐾'), U.emoji('🐾')));
      trail.appendChild(li);
    });
    trail.go = (k) => {
      steps.forEach((li, i) => {
        li.classList.toggle('done', i < k);
        li.classList.toggle('current', i === k);
        if (i === k) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
      });
      trail.querySelectorAll('.wz-prints').forEach((p, i) => p.classList.toggle('walked', i < k));
      if (steps[k]) LT.ui.animate(steps[k], 'wz-hop');
    };
    return trail;
  }

  /* ------------------------------------------------------------------
     Ablauf einer Runde
     ------------------------------------------------------------------ */
  async function runUnit(ctx, unit) {
    const level = ctx.level;
    const stage = ctx.stage;
    stage.classList.add('wz-stage', 'wz-theme-' + unit.theme);
    if (LT.config.test) stage.classList.add('wz-test'); // keine Endlos-Animationen → Testklicks sofort stabil
    const trail = buildTrail(level);
    const body = el('div.wz-body');
    stage.append(trail, body);
    const score = { sum: 0, n: 0, add(v) { this.sum += v; this.n++; } };
    const clear = () => { U.clear(body); body.className = 'wz-body'; };

    // --- Titelkarte ---
    trail.go(-1);
    const lens = el('div.wz-title-card',
      el('div.wz-lens', U.emoji(unit.icon, 'wz-lens-icon'), el('span.wz-lens-glass')),
      el('h2.wz-title', unit.title),
      el('div.wz-level-badge', { 'aria-label': 'Stufe' }, [1, 2, 3].map((i) => U.emoji(i <= level ? '⭐' : '☆', i <= level ? 'on' : ''))));
    body.appendChild(lens);
    if (level === 2) await ctx.say(pick('hello2'));
    if (level === 3) await ctx.say(pick('hello3'));
    if (unit.intro) await ctx.instruct(unit.intro);
    await ctx.sleep(400);

    // --- 1 Entdecken ---
    clear();
    trail.go(0);
    if (level === 1) await stationStory(ctx, unit, body);
    else if (level === 2) await stationRecall(ctx, unit, body, score);
    else await stationFactRecall(ctx, unit, body);

    // --- 2 Verstehen ---
    clear();
    trail.go(1);
    await stationQuiz(ctx, unit, body, score);

    // --- 3 Spielen ---
    clear();
    trail.go(2);
    const p = unit.play.length ? unit.play[Math.min(level - 1, unit.play.length - 1)] : null;
    if (p) {
      await ctx.say(pick('step3'));
      await stationPlay(ctx, p, body, score);
    }

    // --- 4 Wissenskarte ---
    clear();
    trail.go(3);
    await stationCard(ctx, unit, body, level);
    trail.go(4);

    return { score: score.n ? score.sum / score.n : 1 };
  }

  /* ------------------------------------------------------------------
     Station 1a: Bildergeschichte (Stufe 1)
     ------------------------------------------------------------------ */
  async function stationStory(ctx, unit, body) {
    if (!unit.story.length) return;
    await ctx.say(pick('step1'));
    const pages = miniDots(unit.story.length);
    for (let i = 0; i < unit.story.length; i++) {
      const card = unit.story[i];
      U.clear(body);
      const scene = W.scene(card.scene, 'wz-scene-big');
      const replay = el('button.wz-replay', { type: 'button', 'aria-label': 'Nochmal hören', title: 'Nochmal hören', on: { click: () => LT.speech.say(card.say) } }, U.emoji('🔊'));
      const text = el('p.wz-story-text', card.say || '');
      const sheet = el('div.wz-story-card', { role: 'group', 'aria-label': 'Bild ' + (i + 1) }, el('span.wz-corner.emoji', { 'aria-hidden': 'true' }, '🔍'), scene, text, replay);
      const nav = el('div.wz-nav', pages);
      body.append(sheet, nav);
      pages.set(i, 'current');
      // Szene-Emojis wackeln beim Antippen (spielerisch, ohne Wertung)
      const spans = Array.from(scene.children);
      spans.forEach((s) => s.addEventListener('click', () => LT.ui.animate(s, 'wz-wiggle')));
      if (card.say) await ctx.instruct(card.say);
      if (card.tap && spans.length) {
        const idx = U.clamp(Number(card.tap.index) || 0, 0, spans.length - 1);
        await storyTap(ctx, spans, idx, card.tap);
      }
      pages.set(i, 'done');
      await waitNext(ctx, nav);
    }
  }

  async function storyTap(ctx, spans, idx, tap) {
    const target = spans[idx];
    spans.forEach((s) => {
      s.setAttribute('role', 'button');
      s.setAttribute('tabindex', '0');
      s.classList.add('tappable');
      s.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.click(); } };
    });
    target.setAttribute('aria-label', 'Hier tippen');
    if (tap.say) await ctx.instruct(tap.say);
    let misses = 0;
    await new Promise((resolve) => {
      const handlers = [];
      const done = () => {
        handlers.forEach(([s, h]) => s.removeEventListener('click', h));
        ctx.markTest(target, false);
        resolve();
      };
      spans.forEach((s, k) => {
        const h = async () => {
          if (!ctx.active) return;
          if (k === idx) {
            done();
            return;
          }
          misses++;
          LT.sfx.play('tap');
          LT.ui.think();
          ctx.say(pick('tapWrong'));
          if (misses >= 2) target.classList.add('wz-lens-hint');
        };
        s.addEventListener('click', h);
        handlers.push([s, h]);
      });
      ctx.markTest(target);
    });
    spans.forEach((s) => { s.classList.remove('tappable'); s.removeAttribute('tabindex'); s.removeAttribute('role'); s.onkeydown = null; });
    target.classList.remove('wz-lens-hint');
    target.classList.add('wz-found');
    LT.sfx.play('correct');
    LT.ui.cheer();
    LT.ui.flyStar(target);
    await ctx.say(tap.done || LT.ui.praise());
  }

  /* ------------------------------------------------------------------
     Station 1b: „Weißt du noch?“ (Stufe 2) – Bild zum Satz finden
     ------------------------------------------------------------------ */
  async function stationRecall(ctx, unit, body, score) {
    const cards = U.uniqueBy(unit.story.filter((c) => c.say && c.scene.length), (c) => c.scene.join(''));
    // Filmstreifen der ganzen Geschichte
    const strip = el('div.wz-strip', cards.length ? unit.story.map((c) => W.scene(c.scene, 'wz-scene-mini')) : null);
    body.appendChild(strip);
    await ctx.say(pick('step1b'));
    await ctx.sleep(cards.length ? 900 : 100);
    if (cards.length < 2) return;
    const target = U.pick(cards);
    const others = U.sample(cards.filter((c) => c !== target), Math.min(2, cards.length - 1));
    U.clear(body);
    const box = el('div.prompt-box.wz-prompt', U.emoji('👂', 'mid-emoji wz-ear'), el('span.wz-q-text', target.say));
    const choices = el('div.choices.wz-choices.wz-choices-scenes');
    body.append(box, choices);
    await ctx.instruct(T.recallQ + ' ' + target.say);
    const before = ctx.wrongCount;
    await ctx.choices([target, ...others].map((c) => ({
      content: W.scene(c.scene, 'wz-scene-tile'),
      correct: c === target,
      className: 'wz-scene-choice',
      aria: 'Bild',
    })), { container: choices, size: 'wide', correctSay: pick('recallRight'), wrongSay: pick('recallWrong'), hintSay: T.hint });
    score.add(ctx.wrongCount === before ? 1 : 0);
  }

  /* ------------------------------------------------------------------
     Station 1c: Wissenskarten wiederholen (Stufe 3)
     ------------------------------------------------------------------ */
  async function stationFactRecall(ctx, unit, body) {
    const facts = unit.facts.slice(0, 2);
    if (!facts.length) return;
    // Nur gesammelte Karten als "deine" Karten ankündigen; sonst neutral einführen.
    const owned = facts.map((f, i) => W.hasCard(unit.id, i));
    const allOwned = owned.every(Boolean);
    const row = el('div.wz-fact-row');
    const minis = facts.map((f, i) => {
      const m = el('div.wz-fact-mini' + (owned[i] ? '' : '.new'), { role: 'img', 'aria-label': f.text },
        U.emoji(f.e || unit.icon, 'wz-fact-mini-e'), el('p', f.text),
        owned[i] ? null : el('span.wz-fact-new', { 'aria-hidden': 'true' }, '?'));
      row.appendChild(m);
      return m;
    });
    const nav = el('div.wz-nav');
    body.append(row, nav);
    await ctx.say(pick(allOwned ? 'step1c' : 'step1n'));
    for (let i = 0; i < facts.length; i++) {
      minis[i].classList.add('speaking');
      await ctx.say(facts[i].text);
      minis[i].classList.remove('speaking');
      minis[i].classList.add('read');
    }
    ctx.setInstruction(facts.map((f) => f.text).join(' '));
    await waitNext(ctx, nav);
  }

  /* ------------------------------------------------------------------
     Station 2: Forscherfragen
     ------------------------------------------------------------------ */
  function selectQuestions(unit, level) {
    const L = (n) => unit.quiz.filter((q) => q.level === n);
    let list;
    if (level === 1) list = U.sample(L(1), 3);
    else if (level === 2) {
      list = U.sample(L(2), 2);
      list = list.concat(U.sample(L(1).concat(L(2)).filter((q) => !list.includes(q)), 3 - list.length));
    } else {
      list = U.sample(L(3), 3);
      list = list.concat(U.sample(L(2), 3 - list.length));
    }
    // Rückfall: zu wenige Fragen in der gewünschten Stufe → irgendwelche
    if (list.length < 3) list = list.concat(U.sample(unit.quiz.filter((q) => !list.includes(q)), 3 - list.length));
    return U.shuffle(list).sort((a, b) => a.level - b.level);
  }

  async function stationQuiz(ctx, unit, body, score) {
    const qs = selectQuestions(unit, ctx.level);
    if (!qs.length) return;
    await ctx.say(ctx.level === 3 ? pick('expert') : pick('step2'));
    const dots = miniDots(qs.length);
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      U.clear(body);
      dots.set(i, 'current');
      const box = el('div.prompt-box.wz-prompt', U.emoji('🔍', 'mid-emoji wz-lupe'), el('span.wz-q-text', q.q));
      const choices = el('div.choices.wz-choices');
      if (q.answers.length === 4) choices.classList.add('four');
      body.append(dots, box, choices);
      await ctx.instruct(q.q);
      const before = ctx.wrongCount;
      const items = q.answers.map((a, k) => ({
        content: Array.isArray(a) ? a[0] : String(a),
        label: Array.isArray(a) ? a[1] : '',
        say: Array.isArray(a) ? a[1] || a[0] : String(a),
        correct: k === q.correct,
      }));
      await ctx.choices(items, {
        container: choices,
        size: 'large',
        nameFirst: true,
        sayButton: true,
        correctSay: q.why || undefined,
        hintSay: T.hint,
      });
      const first = ctx.wrongCount === before;
      score.add(first ? 1 : 0);
      dots.set(i, first ? 'star' : 'done');
      await ctx.sleep(250);
    }
  }

  /* ------------------------------------------------------------------
     Station 3: Mitmachspiele
     ------------------------------------------------------------------ */
  async function stationPlay(ctx, p, body, score) {
    body.classList.add('wz-play-' + p.type);
    if (p.type === 'order') return playOrder(ctx, p, body, score);
    if (p.type === 'sort') return playSort(ctx, p, body, score);
    if (p.type === 'truefalse') return playTrueFalse(ctx, p, body, score);
    console.warn('LT.wissen: unbekannter Spieltyp', p.type);
  }

  /* --- Reihenfolge: nacheinander antippen → wandert nach oben in die Reihe --- */
  async function playOrder(ctx, p, body, score) {
    const items = asArr(p.items).map((it, k) => ({ e: it[0], label: it[1] || '', k }));
    if (!items.length) return;
    const long = items.some((it) => it.label.length > 12); // lange Beschriftungen → breitere Kacheln
    const row = el('div.wz-order-row' + (long ? '.long' : ''), { 'aria-label': 'Reihenfolge' });
    const slots = items.map((_, k) => {
      const s = el('div.wz-slot', el('span.wz-slot-n', String(k + 1)));
      if (k) row.appendChild(el('span.wz-arrow.emoji', { 'aria-hidden': 'true' }, '➜'));
      row.appendChild(s);
      return s;
    });
    const pool = el('div.wz-pool');
    let order = U.shuffle(items);
    if (order.every((x, i) => x.k === i) && items.length > 1) order = order.slice(1).concat(order[0]);
    const tiles = order.map((it) => {
      const t = LT.ui.tile(it.e, { size: 'small', label: it.label, say: it.label, sayButton: true, className: 'wz-order-tile' + (long ? ' long-label' : '') });
      t._it = it;
      pool.appendChild(t);
      return t;
    });
    body.append(row, pool);
    await ctx.instruct((p.say || '') + ' ' + T.orderStart);
    let step = 0;
    let firstTry = 0;
    let stepWrong = 0;
    let busy = false;
    const markNext = () => tiles.forEach((t) => ctx.markTest(t, !t._placed && t._it.k === step));
    markNext();
    await new Promise((resolve) => {
      tiles.forEach((t) => t.addEventListener('click', async () => {
        if (busy || t._placed || !ctx.active) return;
        busy = true;
        if (t._it.k === step) {
          t._placed = true;
          ctx.markTest(t, false);
          tiles.forEach((x) => ctx.unhint(x));
          t.classList.add('placed');
          moveTo(t, slots[step]);
          slots[step].classList.add('filled');
          LT.sfx.play('pop');
          LT.ui.flyStar(t);
          if (stepWrong === 0) firstTry++;
          stepWrong = 0;
          step++;
          if (t._it.label) await ctx.say(t._it.label);
          markNext();
          busy = false;
          if (step >= items.length) resolve();
        } else {
          stepWrong++;
          await ctx.wrong(t, { keep: true, say: pick('orderWrong') });
          if (stepWrong >= 2) {
            const right = tiles.find((x) => !x._placed && x._it.k === step);
            if (right) { ctx.hint(right); if (stepWrong === 2) ctx.say(T.orderHint); }
          }
          busy = false;
        }
      }));
    });
    score.add(firstTry / items.length);
    LT.sfx.play('correct');
    LT.ui.cheer();
    row.classList.add('complete');
    await ctx.say(T.orderDone);
    for (const t of tiles.slice().sort((a, b) => a._it.k - b._it.k)) {
      t.classList.add('speaking');
      if (t._it.label) await ctx.say(t._it.label);
      else await ctx.sleep(400);
      t.classList.remove('speaking');
    }
    await ctx.sleep(300);
  }

  /* --- Sortieren: Bild antippen (oder ziehen) → Korb antippen --- */
  async function playSort(ctx, p, body, score) {
    const groups = asArr(p.groups).slice(0, 3);
    const items = asArr(p.items).map((it) => ({ e: it[0], label: it[1] || '', g: U.clamp(Number(it[2]) || 0, 0, Math.max(0, groups.length - 1)) }));
    if (!groups.length || !items.length) return;
    const pool = el('div.wz-pool.wz-sort-pool');
    const longSort = items.some((it) => it.label.length > 12);
    const tiles = U.shuffle(items).map((it) => {
      const t = LT.ui.tile(it.e, { size: 'small', label: it.label, say: it.label, className: 'wz-sort-item' + (longSort ? ' long-label' : '') });
      t._it = it;
      pool.appendChild(t);
      return t;
    });
    const baskets = groups.map((g, k) => {
      const inner = el('div.wz-basket-items');
      const b = el('button.wz-basket', { type: 'button', 'aria-label': g[1] || g[0] },
        el('span.wz-basket-head', U.emoji(g[0], 'wz-basket-e'), el('span.wz-basket-label', g[1] || '')), inner);
      b._k = k;
      b._inner = inner;
      return b;
    });
    const row = el('div.wz-baskets' + (groups.length === 3 ? '.three' : ''), baskets);
    body.append(pool, row);
    await ctx.instruct(p.say || '');

    let selected = null;
    let busy = false;
    let placed = 0;
    let firstTry = 0;
    const markState = () => {
      tiles.forEach((t) => ctx.markTest(t, false));
      baskets.forEach((b) => ctx.markTest(b, false));
      if (selected) ctx.markTest(baskets[selected._it.g]);
      else {
        const next = tiles.find((t) => !t._done);
        if (next) ctx.markTest(next);
      }
    };
    const select = (t) => {
      if (selected) selected.classList.remove('picked');
      selected = t;
      if (t) {
        t.classList.add('picked');
        LT.sfx.play('tap');
        if (t._it.label) ctx.say(t._it.label);
      }
      markState();
    };
    let finish;
    const allDone = new Promise((r) => { finish = r; });

    async function drop(t, b) {
      if (busy || !ctx.active || t._done) return;
      busy = true;
      if (b._k === t._it.g) {
        t._done = true;
        t.classList.remove('picked');
        baskets.forEach((x) => ctx.unhint(x));
        if (!t._wrong) firstTry++;
        selected = null;
        const chip = el('span.wz-chip.emoji', { title: t._it.label }, t._it.e);
        t.classList.add('gone');
        b._inner.appendChild(chip);
        LT.ui.animate(b, 'joy');
        LT.sfx.play('correct');
        LT.ui.flyStar(b);
        placed++;
        markState();
        await ctx.sleep(260);
        t.remove();
        busy = false;
        if (placed >= tiles.length) finish();
      } else {
        t._wrong = (t._wrong || 0) + 1;
        selected = null;
        t.classList.remove('picked');
        markState();
        await ctx.wrong(b, { keep: true, say: pick('sortWrong') });
        if (t._wrong >= 2) {
          ctx.hint(baskets[t._it.g]);
          selected = t;
          t.classList.add('picked');
          markState();
          ctx.say(T.sortHint);
        }
        busy = false;
      }
    }

    tiles.forEach((t) => {
      t.addEventListener('click', () => {
        if (busy || t._done || !ctx.active) return;
        if (t._dragged) { t._dragged = false; return; }
        select(selected === t ? null : t);
      });
      // Ziehen (optional, Tippen reicht)
      t.addEventListener('pointerdown', (ev) => {
        if (busy || t._done || ev.button > 0) return;
        const sx = ev.clientX;
        const sy = ev.clientY;
        let ghost = null;
        const move = (e) => {
          if (!ghost && Math.hypot(e.clientX - sx, e.clientY - sy) > 14) {
            ghost = el('div.wz-ghost.emoji', t._it.e);
            document.body.appendChild(ghost);
            select(t);
          }
          if (ghost) {
            ghost.style.left = e.clientX + 'px';
            ghost.style.top = e.clientY + 'px';
            baskets.forEach((b) => b.classList.toggle('over', b === basketAt(e)));
          }
        };
        const up = (e) => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
          if (!ghost) return;
          ghost.remove();
          baskets.forEach((b) => b.classList.remove('over'));
          t._dragged = true;
          setTimeout(() => { t._dragged = false; }, 400);
          const b = basketAt(e);
          if (b) drop(t, b);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        ctx.onCleanup(() => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); if (ghost) ghost.remove(); });
      });
    });
    const basketAt = (e) => {
      const n = document.elementFromPoint(e.clientX, e.clientY);
      return n && n.closest ? baskets.find((b) => b === n.closest('.wz-basket')) : null;
    };
    baskets.forEach((b) => b.addEventListener('click', () => {
      if (busy || !ctx.active) return;
      if (!selected) {
        LT.ui.animate(b, 'shake');
        ctx.say(T.sortPickFirst);
        return;
      }
      drop(selected, b);
    }));
    markState();
    await allDone;
    score.add(firstTry / tiles.length);
    LT.ui.cheer();
    await ctx.say(pick('sortDone'));
    await ctx.sleep(300);
  }

  /* --- Stimmt oder stimmt nicht? --- */
  async function playTrueFalse(ctx, p, body, score) {
    const all = asArr(p.items).filter((x) => x && x.s);
    if (!all.length) return;
    let list = U.sample(all, Math.min(all.length, 4));
    // möglichst beide Antworten vorkommen lassen
    if (list.every((x) => x.ok) || list.every((x) => !x.ok)) {
      const other = all.find((x) => !list.includes(x) && x.ok !== list[0].ok);
      if (other) list[list.length - 1] = other;
      list = U.shuffle(list);
    }
    const dots = miniDots(list.length);
    if (p.say) await ctx.say(p.say);
    let first = 0;
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      U.clear(body);
      dots.set(i, 'current');
      const card = el('div.wz-tf-card', U.emoji(it.e || '❓', 'wz-tf-e'), el('p.wz-tf-text', it.s));
      const choices = el('div.choices.wz-tf-choices');
      body.append(dots, card, choices);
      await ctx.instruct(it.s);
      const before = ctx.wrongCount;
      await ctx.choices([
        { content: '👍', label: 'Stimmt', say: 'Stimmt', correct: !!it.ok, className: 'wz-yes' },
        { content: '👎', label: 'Stimmt nicht', say: 'Stimmt nicht', correct: !it.ok, className: 'wz-no' },
      ], {
        container: choices,
        shuffle: false,
        size: 'wide',
        hintAfter: 1,
        correctSay: it.why || pick('tfRight'),
        wrongSay: pick('tfWrong'),
      });
      const ok = ctx.wrongCount === before;
      if (ok) first++;
      dots.set(i, ok ? 'star' : 'done');
      await ctx.sleep(200);
    }
    score.add(first / list.length);
  }

  /* ------------------------------------------------------------------
     Station 4: Wissenskarte (Flip, ab ins Forscherbuch)
     ------------------------------------------------------------------ */
  async function stationCard(ctx, unit, body, level) {
    const idx = Math.min(level, unit.facts.length) - 1;
    const fact = unit.facts[idx];
    if (!fact) return;
    const pips = el('div.wz-card-pips', [0, 1, 2].map((k) => el('i' + (k === idx ? '.on' : W.hasCard(unit.id, k) ? '.have' : ''))));
    const card = el('button.wz-flip', { type: 'button', 'aria-label': 'Wissenskarte umdrehen' },
      el('span.wz-flip-inner',
        el('span.wz-face.wz-back', el('span.wz-back-lens', U.emoji('🔍')), el('span.wz-back-q', '?')),
        el('span.wz-face.wz-front',
          el('span.wz-front-head', U.emoji(unit.icon), el('span', unit.title)),
          U.emoji(fact.e || unit.icon, 'wz-front-e'),
          el('span.wz-front-text', fact.text),
          pips)));
    const book = el('div.wz-bookfly', { 'aria-hidden': 'true' }, U.emoji('📔'));
    const nav = el('div.wz-nav');
    body.append(card, book, nav);
    LT.ui.animate(card, 'wz-card-in');
    await ctx.say(pick('step4'));
    ctx.say(T.cardTap);
    ctx.setInstruction(T.cardTap);
    await waitClick(ctx, card);
    LT.sfx.play('flip');
    card.classList.add('flipped');
    card.setAttribute('aria-label', fact.text);
    await ctx.sleep(850);
    card.classList.add('settled');
    LT.ui.confetti(80);
    LT.sfx.play('star');
    await ctx.instruct(fact.text);
    const added = W.addCard(unit.id, idx);
    if (added) {
      card.classList.add('to-book');
      book.classList.add('open');
      LT.sfx.play('sticker');
      await ctx.say(pick('cardNew'));
    } else {
      await ctx.say(pick('cardOld'));
    }
    // erneut antippen → nochmal vorlesen
    card.addEventListener('click', () => { LT.ui.animate(card, 'joy'); LT.speech.say(fact.text); });
    await waitNext(ctx, nav, { label: 'Fertig' });
  }

  /* ------------------------------------------------------------------
     Vorab-Warteschlange verarbeiten (falls Inhalte früher geladen wurden)
     ------------------------------------------------------------------ */
  const queued = Array.isArray(LT.wissenQueue) ? LT.wissenQueue.slice() : [];
  LT.wissenQueue = { push: (...us) => { us.forEach((u) => W.addUnit(u)); return 0; } };
  queued.forEach((u) => W.addUnit(u));
})();
