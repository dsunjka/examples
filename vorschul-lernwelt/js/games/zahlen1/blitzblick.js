/* ==========================================================================
   Spiel „Blitzblick“ ⚡ – Simultanerfassung und quasi-simultane Erfassung.

   Didaktik:
   - Ein Punktmuster wird nur kurz gezeigt und dann verdeckt. Weil keine
     Zeit zum Abzählen bleibt, lernt das Kind, Mengen AUF EINEN BLICK zu
     erkennen (simultan bis ca. 4) bzw. größere Mengen über Strukturen
     zusammenzusetzen (quasi-simultan: „5 und 2 sind 7“).
   - Progression: vertraute Würfelbilder 1–4 → Würfelbilder 1–6 →
     Zehnerfeld mit „Kraft der Fünf“ 1–10 → Fingerbilder 1–10 →
     ungeordnete Punktgruppen und gemischte Bilder mit kürzerer Zeigezeit.
   - Kein Stress: Countdown kündigt das Bild an; „Nochmal zeigen“ (👀) darf
     einmal pro Aufgabe genutzt werden und zählt NICHT als Fehler.
   - Nach jeder Antwort wird die Karte aufgedeckt und die Struktur benannt
     („Vier Ecken und einer in der Mitte – vier und eins sind fünf“).
   - Lerninhalt = Bildart + Zahl (Schlüssel 'Würfel 5', 'Zehnerfeld 7',
     'Finger 8', 'Punkte 4') über ctx.item → verteiltes Wiederholen.
   - Hilfe-Leiter: 1. Fehler → „Drei passt nicht. Es waren mehr als drei.“
     und Hinweis auf „Nochmal zeigen“; 2. Fehler → Karte bleibt offen,
     Denkanstoß zur Struktur („Eine ganze Hand sind fünf Finger.“);
     3. Fehler → Flo zählt jeden Punkt mit und benennt die Struktur.
   - Innerhalb der Runde: ctx.taskLevel; bei ctx.flow < 0 bleibt das Bild
     etwas länger sichtbar, bei ctx.flow > 0 auf der Höchststufe kürzer.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const Z = LT.z1;
  const nw = Z.nw;

  /* ------------------------------------------------------------------
     Stufen: Bildart(en), Zahlenraum, Zeigezeit (ms), Anzahl Antworten
     ------------------------------------------------------------------ */
  const LEVELS = {
    1: { kinds: ['dice'], show: 2200, choices: 4 },
    2: { kinds: ['dice'], show: 2000, choices: 4 },
    3: { kinds: ['frame'], show: 2200, choices: 4 },
    4: { kinds: ['hands'], show: 1800, choices: 4 },
    5: { kinds: ['scatter', 'dice', 'frame', 'hands'], show: 1300, choices: 4 },
  };
  /** Zahlenraum je Bildart und Stufe */
  function rangeFor(kind, level) {
    if (kind === 'dice') return level === 1 ? [1, 4] : level === 2 ? [1, 6] : [3, 6];
    if (kind === 'frame') return level === 3 ? [2, 10] : [4, 10];
    if (kind === 'hands') return level === 4 ? [1, 10] : [4, 10];
    return [2, 6]; // scatter
  }

  /* ------------------------------------------------------------------
     Strukturen benennen (Erkenntnis nach der Antwort)
     ------------------------------------------------------------------ */
  const DICE_SAY = {
    1: 'Ein Punkt in der Mitte.',
    2: 'Zwei Punkte, schräg gegenüber.',
    3: 'Drei Punkte in einer schrägen Reihe.',
    4: 'In jeder Ecke ein Punkt – vier Ecken, vier Punkte.',
    5: 'Vier Ecken und einer in der Mitte. Vier und eins sind fünf.',
    6: 'Zweimal drei Punkte. Drei und drei sind sechs.',
  };
  function frameSay(n) {
    if (n === 1) return 'Ein Punkt in der oberen Reihe.';
    if (n < 5) return `${Z.NW(n)} Punkte in der oberen Reihe.`;
    if (n === 5) return 'Die obere Reihe ist voll – das sind fünf.';
    if (n === 10) return 'Alles ist voll! Fünf und fünf sind zehn.';
    const rest = n - 5;
    const extra = n === 9 ? ' Nur ein Kästchen ist noch frei.' : '';
    return `Oben fünf und unten ${Z.nwPron(rest)}. Fünf und ${nw(rest)} sind ${nw(n)}.${extra}`;
  }
  function handsSay(n) {
    if (n === 1) return 'Ein Finger – der Daumen.';
    if (n < 5) return `Eine Hand mit ${nw(n)} Fingern.`;
    if (n === 5) return 'Eine ganze Hand – das sind fünf Finger!';
    if (n === 10) return 'Zwei ganze Hände. Fünf und fünf sind zehn!';
    const rest = n - 5;
    return `Eine ganze Hand, das sind fünf, und noch ${rest === 1 ? 'ein Finger' : nw(rest) + ' Finger'}. Fünf und ${nw(rest)} sind ${nw(n)}.`;
  }
  function scatterSay(n, groups) {
    if (groups.length === 1) return n === 1 ? 'Ein Punkt.' : `${Z.NW(n)} Punkte – die siehst du auf einen Blick!`;
    const [a, b] = groups;
    return `Hier ${Z.nwPron(a)} und da ${Z.nwPron(b)}. ${Z.NW(a)} und ${nw(b)} sind ${nw(n)}.`;
  }

  /** Denkanstoß (2. Hilfe): Struktur ansprechen, ohne die Zahl zu verraten */
  const HINT_SAY = {
    dice: 'Die Karte bleibt jetzt offen. Schau dir das Würfelbild genau an.',
    frame: 'Die Karte bleibt jetzt offen. Denk dran: Oben passen genau fünf hin.',
    hands: 'Die Karte bleibt jetzt offen. Denk dran: Eine ganze Hand sind fünf Finger.',
    scatter: 'Die Karte bleibt jetzt offen. Schau dir jede Gruppe einzeln an.',
  };
  const KIND_NAME = { dice: 'Würfel', frame: 'Zehnerfeld', hands: 'Finger', scatter: 'Punkte' };

  /** Bild bauen: { node, unit (Punkte/Finger), say (Struktur) } */
  function buildPattern(kind, n) {
    if (kind === 'dice') return { node: Z.dice(n), unit: 'Punkte', say: DICE_SAY[n] };
    if (kind === 'frame') return { node: Z.tenFrame(n), unit: 'Punkte', say: frameSay(n) };
    if (kind === 'hands') return { node: Z.hands(n), unit: 'Finger', say: handsSay(n) };
    const node = Z.scatter(n);
    return { node, unit: 'Punkte', say: scatterSay(n, node._groups) };
  }

  /** Einführungssatz für die erste Aufgabe einer Runde */
  function introFor(level, kind) {
    if (level <= 2) return 'Gleich blitzt ein Würfelbild auf – nur ganz kurz! Schau genau hin.';
    if (level === 3) return 'Im Zehnerfeld ist oben Platz für fünf und unten für fünf. Schau genau hin!';
    if (level === 4) return 'Gleich zeige ich dir ganz kurz Finger. Schau genau hin!';
    return 'Jetzt geht es blitzschnell! Schau genau hin.';
  }

  LT.registerGame({
    id: 'blitzblick',
    area: 'zahlen',
    title: 'Blitzblick',
    icon: '⚡',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Mengen auf einen Blick erfassen (Simultanerfassung)',
      goal: 'Ihr Kind lernt, kleine Mengen ohne Abzählen sofort zu erkennen und größere Mengen über Strukturen zusammenzusetzen: Würfelbilder, die „Kraft der Fünf“ im Zehnerfeld („5 und 2 sind 7“) und Fingerbilder. Das ist eine wichtige Grundlage, um später nicht zählend, sondern geschickt zu rechnen.',
      levels: [
        'Würfelbilder 1 bis 4, gut 2 Sekunden sichtbar',
        'Würfelbilder 1 bis 6',
        'Zehnerfeld bis 10 – oben 5, unten der Rest („Kraft der Fünf“)',
        'Fingerbilder bis 10 (eine ganze Hand = 5)',
        'Ungeordnete Punktgruppen und gemischte Bilder, nur gut 1 Sekunde sichtbar',
      ],
      tip: 'Zeigen Sie beim Warten kurz Finger („Wie viele?“) und wechseln Sie sich ab. Würfelspiele wie „Mensch ärgere dich nicht“ sind ideal: Ermuntern Sie Ihr Kind, die Augenzahl zu nennen, ohne zu zählen.',
    },

    async task(ctx) {
      const lv = ctx.taskLevel;
      const cfg = LEVELS[lv] || LEVELS[1];
      // Lerninhalt: Bildart + Zahl (bei gemischter Stufe aus allen Bildarten)
      const pool = [];
      for (const k of cfg.kinds) {
        const [a, b] = rangeFor(k, lv);
        for (let x = a; x <= b; x++) pool.push({ kind: k, n: x });
      }
      const pick = ctx.item(pool, (p) => `${KIND_NAME[p.kind]} ${p.n}`, { avoid: 2 });
      const kind = pick.kind;
      const n = pick.n;
      const [lo, hi] = rangeFor(kind, lv);
      const pat = buildPattern(kind, n);
      // Anpassung innerhalb der Runde: etwas mehr bzw. weniger Zeit zum Hinsehen
      const showMs = cfg.show + (ctx.flow < 0 ? 500 : ctx.flow > 0 && lv === ctx.maxLevel ? -200 : 0);

      // ---------- Aufbau: Blitzkarte, „Nochmal zeigen“, Zahlen ----------
      const coverIcon = el('span.bb-cover-icon.emoji', '⚡');
      const coverHint = el('span.bb-cover-hint');
      const cover = el('div.bb-cover', { 'aria-label': 'verdeckte Karte' }, coverIcon, coverHint);
      const face = el('div.bb-face.k-' + kind, pat.node);
      const card = el('div.bb-card', face, cover);
      const againBtn = LT.ui.button('Nochmal zeigen', () => showAgain(), { icon: '👀', cls: 'bb-again' });
      againBtn.disabled = true;
      const choiceBox = el('div.choices.bb-choices.is-waiting');
      ctx.stage.append(card, againBtn, choiceBox);

      let finished = false; // Aufgabe gelöst
      let opened = false; // Karte dauerhaft offen (nach Antwort/Hilfe)
      let againUsed = false;
      let flashing = false;
      const alive = () => ctx.active && !finished;

      /** Karte kurz aufdecken und wieder verdecken */
      async function flash() {
        flashing = true;
        card.classList.add('is-open');
        LT.sfx.play('whoosh');
        await ctx.sleep(showMs);
        flashing = false;
        if (!ctx.active || opened) return;
        card.classList.remove('is-open');
        LT.sfx.play('flip');
      }
      function openForGood() {
        opened = true;
        card.classList.add('is-open');
        againBtn.disabled = true;
      }

      async function showAgain() {
        if (againUsed || flashing || opened || !alive()) return;
        againUsed = true;
        againBtn.disabled = true;
        choiceBox.classList.add('is-locked');
        await flash();
        if (!alive()) return;
        choiceBox.classList.remove('is-locked');
        coverHint.textContent = '';
      }
      cover.addEventListener('click', () => { if (!againBtn.disabled) showAgain(); });

      // ---------- Ablauf: Ansage → Countdown → Blitz → Frage ----------
      const question = `Wie viele ${pat.unit} waren es?`;
      ctx.setInstruction(question);
      await ctx.instruct(ctx.index === 0 ? introFor(lv, kind) : U.pick(['Schau genau hin!', 'Achtung, gleich blitzt es!', 'Augen auf!', 'Bereit? Schau genau hin!']));
      if (!ctx.active) return;
      coverIcon.style.display = 'none';
      for (const k of [3, 2, 1]) {
        const num = el('span.bb-cover-num', String(k));
        cover.appendChild(num);
        LT.sfx.tone(k === 1 ? 660 : 520, 0.09, { type: 'triangle', volume: 0.3 });
        await ctx.sleep(430);
        num.remove();
        if (!ctx.active) return;
      }
      coverIcon.textContent = '❓';
      coverIcon.style.display = '';
      await flash();
      if (!ctx.active) return;

      choiceBox.classList.remove('is-waiting');
      againBtn.disabled = false;
      const full = ctx.index === 0 ? `${question} Du darfst einmal nochmal gucken.` : question;
      ctx.setInstruction(`${question} Tippe auf die Zahl.`);
      ctx.say(full);

      // ---------- Antworten ----------
      const values = lv === 1 ? [1, 2, 3, 4] : Z.numberChoices(n, cfg.choices, Math.max(1, lo - 1), Math.min(10, hi + 1));
      const items = values.map((k) => ({ content: String(k), text: true, correct: k === n, say: nw(k), value: k, className: 'bb-num' }));
      const ha = Z.hintAfterFor(ctx, items.length);
      await ctx.choices(items, {
        container: choiceBox,
        shuffle: false,
        size: 'small',
        sayButton: lv <= 2,
        hintAfter: ha,
        onCorrect: () => {
          finished = true;
          openForGood();
        },
        correctSay: () => {
          if (ctx.wrongCount >= 2) return `Richtig, ${nw(n)}!`;
          if (ctx.wrongCount === 0 && U.chance(0.3)) return `Richtig, du hast es auf einen Blick gesehen: ${nw(n)}! ${pat.say}`;
          return `Richtig, ${nw(n)}! ${pat.say}`;
        },
        // 1. Hilfe: Richtung angeben (die Karte ist noch verdeckt)
        explain: (item) => `${Z.NW(item.value)} passt nicht. Es waren ${item.value > n ? 'weniger' : 'mehr'} als ${nw(item.value)}.`,
        // 2. Hilfe: Karte bleibt offen (onWrong) + Denkanstoß zur Struktur
        hintSay: () => HINT_SAY[kind],
        // 3. Hilfe: Flo zählt mit (onWrong) und benennt die Struktur
        modelSay: () => pat.say,
        onWrong: async (item, tile, wrongs) => {
          if (wrongs === 1 && ha > 1 && !againUsed && !opened) {
            // Hinweis auf das Werkzeug „Nochmal zeigen“
            ctx.hint(againBtn);
            await ctx.say('Du darfst nochmal gucken: Tippe auf die Augen!');
            ctx.timeout(() => ctx.unhint(againBtn), 2600);
          }
          if (wrongs === ha) {
            ctx.unhint(againBtn);
            openForGood();
          } else if (wrongs === ha + 1) {
            await ctx.say('Wir zählen zusammen!');
            await Z.countAlong(ctx, pat.node._units);
          }
        },
      });
      await ctx.sleep(500);
    },
  });
})();
