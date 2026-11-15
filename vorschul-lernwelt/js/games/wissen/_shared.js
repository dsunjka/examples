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

   Adaptiv lernen (Typ 'single' → eigene Steuerung, siehe engine.js):
   - Verteiltes Wiederholen: Jede Forscherfrage (Schlüssel = Fragetext),
     jede Stimmt-Aussage (Satz), jedes Sortier-Bild („Frisst Blätter – Raupe“),
     jede Reihenfolge („Reihenfolge: Ei bis Schmetterling“) und das Bild der
     Weißt-du-noch-Station wird mit ctx.track(key, ok) gemeldet. Fällige
     Inhalte früherer Tage werden bevorzugt ausgewählt (höchstens 2 je Station).
   - In der Runde: Eine falsch beantwortete Frage/Aussage kommt am Ende der
     Station noch einmal. Nach einem Fehler wird die nächste Frage mit vier
     Antworten leichter (eine Antwort weniger); alles auf Anhieb gewusst
     (Stufe 1/2) → eine Knobel-Frage der nächsten Stufe (zählt nicht zur Wertung).
   - Hilfe-Leiter: 1. Fehler → das Gewählte wird benannt („Mit den Ohren?
     Das passt hier nicht.“); dann Denkanstoß passend zum Fragewort (Warum →
     Grund überlegen, Wo → Ort …) + Frage wiederholen; dann vormachen mit
     Begründung aus dem why-Text. Optional je Frage: hint (Denkanstoß) und
     explain ({ Antwortindex: 'Satz' }) in den Inhaltsdaten. Stimmt-Aussagen:
     Fehler → Begründung aus dem why-Text. Reihenfolge/Sortieren/Antippen:
     gleichwertige Leiter (benennen → Tipp → zeigen).

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
        'Sachwissen und naturwissenschaftliches Grundverständnis in kleinen Lernreisen: Entdecken (Bildergeschichte zum Mitmachen), Verstehen (Fragen mit Begründung), Anwenden (Reihenfolgen, Sortieren, Aussagen prüfen) und Sichern (Wissenskarte für das Forscherbuch). Fachbegriffe werden eingeführt und wiederholt, Stufe 3 enthält Transfer- und Denkfragen. Nicht gewusste Fragen kommen am Ende der Station und an späteren Tagen wieder; nach Fehlern helfen gestufte Tipps (Denkanstoß, dann Erklärung).',
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
    // Hilfe-Leiter und erklärendes Feedback
    tapHint: 'Ich helfe dir. Schau, wo es leuchtet.',
    recallExplain: 'Dieses Bild passt zu einem anderen Satz.',
    recallHint: 'Wir suchen das Bild zu diesem Satz.',
    recallModel: 'Schau, hier. Dieses Bild passt zu dem Satz.',
    notHere: 'Das passt hier nicht.',
    modelLead: 'Schau, hier:',
    thought: ['Gut überlegt!', 'Super, du hast nachgedacht!'],
    afterHelp: ['Genau! Jetzt weißt du es.', 'Richtig! Das merkst du dir bestimmt.'],
    again: ['Diese Frage kommt noch einmal. Weißt du es jetzt?'],
    tfAgain: ['Diesen Satz hören wir noch einmal. Stimmt er oder stimmt er nicht?'],
    bonus: ['Du weißt ja schon richtig viel! Hier ist eine Knobel-Frage.'],
    tfSo: 'Darum stimmt das.',
    tfSoNot: 'Darum stimmt das nicht.',
    orderLater: 'Das kommt erst später.',
    orderTip0: 'Ein Tipp: Womit fängt alles an?',
    orderTip: 'Ein Tipp: Was muss zuerst passieren, damit es weitergeht?',
    sortOther: 'Das gehört in einen anderen Korb.',
    sortTip: 'Ein Tipp: Hör dir die Körbe noch einmal an.',
    // Denkanstöße je Fragewort (verraten nicht die Lösung)
    qWhy: 'Überleg mal, was der Grund dafür sein kann.',
    qWhere: 'Überleg mal, an welchem Ort das sein kann.',
    qFrom: 'Überleg mal, wo das herkommt.',
    qWho: 'Überleg mal, wer das sein kann.',
    qWhen: 'Überleg mal, wann das passiert.',
    qWith: 'Überleg mal, was man dafür braucht.',
    qOf: 'Überleg mal, woraus es besteht.',
    qCount: 'Zähle in Gedanken nach.',
    qImagine: 'Stell dir das ganz genau vor.',
    qStory: 'Denk an unsere Geschichte.',
    qKnow: 'Denk an das, was du schon weißt.',
  };
  const pick = (k) => U.pickFresh('wz-' + k, T[k], 1);

  /** Satzzeichen am Ende sicherstellen (Beschriftungen werden als Satz gesprochen). */
  const sentence = (s) => { s = String(s || '').trim(); return !s ? '' : /[.!?]$/.test(s) ? s : s + '.'; };
  /** Begründung aus einem why-Text: Lob-/Antwortwort am Anfang entfernen („Genau! Aus dem Ei …“ → „Aus dem Ei …“). */
  function reasonOf(why, answerWords) {
    const re = answerWords
      ? /^(Stimmt nicht|Stimmt|Richtig|Genau|Super gedacht|Super|Toll|Prima|Nein|Ja)\s*[!.,]\s*/
      : /^(Richtig|Genau|Super gedacht|Super|Toll|Prima|Stimmt)\s*[!.]\s*/;
    const r = String(why || '').trim().replace(re, '');
    return r ? U.cap(r) : '';
  }
  /** Kurzer, lesbarer Schlüssel für den Elternbereich (erster Satz, gekürzt). */
  function shortKey(s) {
    s = String(s || '').trim();
    const m = s.match(/^[^.!?]*[.!?]/);
    s = m ? m[0] : s;
    return s.length > 70 ? s.slice(0, 67).replace(/\s+\S*$/, '') + ' …' : s;
  }
  /**
   * Inhalte für eine Station wählen: fällige Wiederholungen früherer Tage zuerst
   * (höchstens budget.reviews je Runde), sonst abwechslungsreich zufällig.
   */
  function pickSome(ctx, tag, list, n, keyFn, budget) {
    let rest = list.slice();
    const out = [];
    const due = LT.progress && LT.progress.dueItems ? LT.progress.dueItems(ctx.id) : [];
    for (const k of due) {
      if (out.length >= n || !budget || budget.reviews <= 0) break;
      const x = rest.find((y) => keyFn(y) === k);
      if (!x) continue;
      out.push(x);
      rest = rest.filter((y) => y !== x);
      budget.reviews--;
    }
    while (out.length < n && rest.length) {
      const x = U.pickFresh('wz-' + ctx.id + '-' + tag, rest, rest.length, keyFn);
      out.push(x);
      rest = rest.filter((y) => y !== x);
    }
    return out;
  }
  /** Denkanstoß je Fragewort – verrät nicht die Lösung. */
  function questionTip(q, level) {
    if (q.hint) return q.hint;
    const t = q.q;
    if (/^Warum\b/.test(t)) return T.qWhy;
    if (/^Woher\b/.test(t)) return T.qFrom;
    if (/^(Wo|Wohin)\b/.test(t)) return T.qWhere;
    if (/^(Wer|Zu wem)\b/.test(t)) return T.qWho;
    if (/^Wann\b/.test(t)) return T.qWhen;
    if (/^Womit\b/.test(t)) return T.qWith;
    if (/^Woraus\b/.test(t)) return T.qOf;
    if (/^Wie viele\b/.test(t)) return T.qCount;
    if (/^(Du|Dein|Ein|Eine|Es|Auf|Im|Bei|Beim|Nach|Der|Die|Das|Wasser|Papier|Auch|Treffen)\b/.test(t)) return T.qImagine;
    return level === 1 ? T.qStory : T.qKnow;
  }

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
    // höchstens zwei fällige Wiederholungen früherer Tage je Station (sonst zu viel Altes)
    score.budget = () => ({ reviews: 2 });
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
          // Hilfe-Leiter: 1. Aufforderung wiederholen, ab 2. Fehler leuchtet das gesuchte Bild
          if (misses === 1) ctx.say(pick('tapWrong') + (tap.say ? ' ' + tap.say : ''), { interrupt: true });
          else {
            target.classList.add('wz-lens-hint');
            if (misses === 2) ctx.say(T.tapHint, { interrupt: true });
          }
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
    const keyOf = (c) => 'Bild: ' + shortKey(c.say);
    const target = pickSome(ctx, 'recall', cards, 1, keyOf, score.budget())[0];
    const others = U.sample(cards.filter((c) => c !== target), Math.min(2, cards.length - 1));
    U.clear(body);
    const box = el('div.prompt-box.wz-prompt', U.emoji('👂', 'mid-emoji wz-ear'), el('span.wz-q-text', target.say));
    const choices = el('div.choices.wz-choices.wz-choices-scenes');
    body.append(box, choices);
    await ctx.instruct(T.recallQ + ' ' + target.say);
    const before = ctx.wrongCount;
    ctx.modelShown = false;
    await ctx.choices([target, ...others].map((c) => ({
      content: W.scene(c.scene, 'wz-scene-tile'),
      correct: c === target,
      className: 'wz-scene-choice',
      aria: 'Bild',
      card: c,
    })), {
      container: choices,
      size: 'wide',
      hintAfter: 1,
      correctSay: () => (ctx.wrongCount === before ? pick('recallRight') : pick('afterHelp')),
      // 1. Fehler: sagen, zu welchem Satz das gewählte Bild gehört
      explain: (chosen) => T.recallExplain + ' ' + chosen.card.say,
      // Denkanstoß: den gesuchten Satz noch einmal hören
      hintSay: () => T.recallHint + ' ' + target.say,
      modelSay: T.recallModel,
    });
    const ok = ctx.wrongCount === before;
    ctx.track(keyOf(target), ok);
    score.add(ok ? 1 : 0);
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
  const qKey = (q) => q.key || q.q;

  function selectQuestions(ctx, unit, level, budget) {
    const L = (n) => unit.quiz.filter((q) => q.level === n);
    const some = (list, n) => pickSome(ctx, 'quiz', list, n, qKey, budget);
    let list;
    if (level === 1) list = some(L(1), 3);
    else if (level === 2) {
      list = some(L(2), 2);
      list = list.concat(some(L(1).concat(L(2)).filter((q) => !list.includes(q)), 3 - list.length));
    } else {
      list = some(L(3), 3);
      list = list.concat(some(L(2), 3 - list.length));
    }
    // Rückfall: zu wenige Fragen in der gewünschten Stufe → irgendwelche
    if (list.length < 3) list = list.concat(U.sample(unit.quiz.filter((q) => !list.includes(q)), 3 - list.length));
    return U.shuffle(list).sort((a, b) => a.level - b.level);
  }

  /**
   * Eine Forscherfrage stellen (mit Hilfe-Leiter). Rückgabe: true = auf Anhieb gewusst.
   * opts.ease → bei vier Antworten eine falsche weniger (nach Fehlern in der Runde).
   */
  async function askQuestion(ctx, q, body, dots, opts = {}) {
    U.clear(body);
    const box = el('div.prompt-box.wz-prompt', U.emoji('🔍', 'mid-emoji wz-lupe'), el('span.wz-q-text', q.q));
    const choices = el('div.choices.wz-choices');
    let items = q.answers.map((a, k) => ({
      content: Array.isArray(a) ? a[0] : String(a),
      label: Array.isArray(a) ? a[1] : '',
      say: Array.isArray(a) ? a[1] || a[0] : String(a),
      correct: k === q.correct,
      k,
    }));
    if (opts.ease && items.length >= 4) {
      const wrongs = items.filter((x) => !x.correct);
      const drop = U.pick(wrongs);
      items = items.filter((x) => x !== drop);
    }
    if (items.length === 4) choices.classList.add('four');
    body.append(dots, box, choices);
    if (opts.lead) await ctx.say(opts.lead);
    await ctx.instruct(q.q);
    const before = ctx.wrongCount;
    const reason = reasonOf(q.why);
    const two = items.length <= 2;
    const ha = items.length <= 3 ? 1 : 2;
    const named = (it) => (it.label ? it.label + '?' : '');
    ctx.modelShown = false;
    await ctx.choices(items, {
      container: choices,
      size: 'large',
      nameFirst: true,
      sayButton: true,
      hintAfter: ha,
      // auf Anhieb: Begründung; nach Denkanstoß: Prozess-Lob + Begründung; nach dem Vormachen: kurz bestätigen
      correctSay: () => {
        const wrongs = ctx.wrongCount - before;
        if (!wrongs) return q.why || undefined;
        if (ctx.modelShown) return pick('afterHelp');
        return reason ? pick('thought') + ' ' + reason : pick('thought');
      },
      // 1. Fehler: das GEWÄHLTE benennen (bei nur zwei Antworten gleich mit Begründung)
      explain: (chosen) => {
        const own = q.explain && q.explain[chosen.k];
        if (own) return own;
        const base = [named(chosen), T.notHere].filter(Boolean).join(' ');
        return two && reason ? base + ' ' + reason : base;
      },
      // Denkanstoß passend zum Fragewort + Frage wiederholen
      hintSay: two ? undefined : () => questionTip(q, ctx.level) + ' ' + q.q,
      // vormachen und begründen
      modelSay: (right) => [T.modelLead, sentence(right.label || ''), reason].filter(Boolean).join(' '),
    });
    const first = ctx.wrongCount === before;
    ctx.track(qKey(q), first);
    return first;
  }

  async function stationQuiz(ctx, unit, body, score) {
    const level = ctx.level;
    const qs = selectQuestions(ctx, unit, level, score.budget());
    if (!qs.length) return;
    await ctx.say(level === 3 ? pick('expert') : pick('step2'));
    const dots = miniDots(qs.length);
    const missed = [];
    let ease = false;
    for (let i = 0; i < qs.length; i++) {
      dots.set(i, 'current');
      const first = await askQuestion(ctx, qs[i], body, dots, { ease });
      score.add(first ? 1 : 0);
      dots.set(i, first ? 'star' : 'done');
      if (!first) missed.push(qs[i]);
      ease = !first; // nach einem Fehler: nächste Frage mit vier Antworten etwas leichter
      await ctx.sleep(250);
    }
    if (missed.length) {
      // Zwillingsaufgabe: eine nicht gewusste Frage kommt noch einmal (zählt nicht zur Wertung)
      await askQuestion(ctx, missed[0], body, dots, { lead: pick('again') });
      await ctx.sleep(250);
    } else if (level < 3) {
      // alles auf Anhieb gewusst → eine Knobel-Frage der nächsten Stufe (zählt nicht zur Wertung)
      const pool = unit.quiz.filter((q) => q.level === level + 1 && !qs.includes(q));
      const bonus = pool.length ? pickSome(ctx, 'bonus', pool, 1, qKey, score.budget())[0] : null;
      if (bonus) {
        await askQuestion(ctx, bonus, body, dots, { lead: pick('bonus') });
        await ctx.sleep(250);
      }
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
          // Hilfe-Leiter: 1. das Gewählte einordnen → 2. Denkanstoß → 3. zeigen
          stepWrong++;
          const right = tiles.find((x) => !x._placed && x._it.k === step);
          let say;
          if (stepWrong === 1) say = t._it.label ? sentence(t._it.label) + ' ' + T.orderLater : pick('orderWrong');
          else if (stepWrong === 2) say = p.hint || (step === 0 ? T.orderTip0 : T.orderTip);
          else if (stepWrong === 3) say = T.orderHint + (right && right._it.label ? ' ' + sentence(right._it.label) : '');
          else say = '';
          await ctx.wrong(t, { keep: true, say });
          if (stepWrong >= 3 && right) ctx.hint(right);
          busy = false;
        }
      }));
    });
    score.add(firstTry / items.length);
    const ends = [items[0].label, items[items.length - 1].label].filter(Boolean);
    ctx.track(p.key || 'Reihenfolge: ' + (ends.length === 2 ? ends.join(' bis ') : items.map((x) => x.e).join(' ')), firstTry === items.length);
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
        ctx.track(p.key ? p.key + ': ' + t._it.label : (t._it.label || t._it.e) + ' – ' + (groups[t._it.g][1] || groups[t._it.g][0]), !t._wrong);
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
        // Hilfe-Leiter je Bild: 1. benennen → (bei drei Körben) 2. Körbe noch einmal hören → zeigen
        const tipAt = groups.length > 2 ? 2 : 0;
        let say;
        if (t._wrong === 1) say = t._it.label ? sentence(t._it.label) + ' ' + T.sortOther : pick('sortWrong');
        else if (t._wrong === tipAt) say = T.sortTip + ' ' + groups.map((g) => sentence(g[1])).filter(Boolean).join(' ');
        else say = '';
        const model = t._wrong >= (tipAt ? 3 : 2);
        await ctx.wrong(b, { keep: true, say: model ? '' : say });
        if (model && ctx.active) {
          ctx.hint(baskets[t._it.g]);
          selected = t;
          t.classList.add('picked');
          markState();
          if (t._wrong === (tipAt ? 3 : 2)) ctx.say(T.sortHint);
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
  const tfKey = (x) => x.key || x.s;

  async function askStatement(ctx, it, body, dots, lead) {
    U.clear(body);
    const card = el('div.wz-tf-card', U.emoji(it.e || '❓', 'wz-tf-e'), el('p.wz-tf-text', it.s));
    const choices = el('div.choices.wz-tf-choices');
    body.append(dots, card, choices);
    if (lead) await ctx.say(lead);
    await ctx.instruct(it.s);
    const before = ctx.wrongCount;
    const reason = reasonOf(it.why, true);
    ctx.modelShown = false;
    await ctx.choices([
      { content: '👍', label: 'Stimmt', say: 'Stimmt', correct: !!it.ok, className: 'wz-yes' },
      { content: '👎', label: 'Stimmt nicht', say: 'Stimmt nicht', correct: !it.ok, className: 'wz-no' },
    ], {
      container: choices,
      shuffle: false,
      size: 'wide',
      hintAfter: 1,
      // auf Anhieb: Begründung; nach einem Fehler wurde sie schon erklärt → kurz bestätigen
      correctSay: () => (ctx.wrongCount === before ? it.why || pick('tfRight') : pick('afterHelp')),
      // Fehler: Begründung aus dem why-Text, danach leuchtet die richtige Antwort
      explain: () => (reason ? reason + ' ' + (it.ok ? T.tfSo : T.tfSoNot) : pick('tfWrong')),
    });
    const ok = ctx.wrongCount === before;
    ctx.track(tfKey(it), ok);
    return ok;
  }

  async function playTrueFalse(ctx, p, body, score) {
    const all = asArr(p.items).filter((x) => x && x.s);
    if (!all.length) return;
    let list = pickSome(ctx, 'tf', all, Math.min(all.length, 4), tfKey, score.budget ? score.budget() : null);
    // möglichst beide Antworten vorkommen lassen
    if (list.every((x) => x.ok) || list.every((x) => !x.ok)) {
      const other = all.find((x) => !list.includes(x) && x.ok !== list[0].ok);
      if (other) list[list.length - 1] = other;
    }
    list = U.shuffle(list);
    const dots = miniDots(list.length);
    if (p.say) await ctx.say(p.say);
    let first = 0;
    const missed = [];
    for (let i = 0; i < list.length; i++) {
      dots.set(i, 'current');
      const ok = await askStatement(ctx, list[i], body, dots);
      if (ok) first++;
      else missed.push(list[i]);
      dots.set(i, ok ? 'star' : 'done');
      await ctx.sleep(200);
    }
    score.add(first / list.length);
    // Zwillingsaufgabe: eine nicht gewusste Aussage noch einmal (zählt nicht zur Wertung)
    if (missed.length) {
      await askStatement(ctx, missed[0], body, dots, pick('tfAgain'));
      await ctx.sleep(200);
    }
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
