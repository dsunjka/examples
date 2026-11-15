/* ==========================================================================
   Spiel „Die Uhr“ 🕐

   Didaktik (analoge Uhr lesen lernen – in kleinen Schritten):
   - Ein klares, selbst gezeichnetes Zifferblatt: kurzer, dicker, dunkler
     Stundenzeiger und langer, dünner, roter Minutenzeiger. Zu Rundenbeginn
     erklärt Flo: „Der kleine Zeiger zeigt die Stunde, der große die Minuten.“
   - Stufe 1: Volle Stunden erkennen – „Welche Uhr zeigt 3 Uhr?“ (3 Uhren).
     Merksatz: Bei einer vollen Stunde zeigt der große Zeiger nach oben.
   - Stufe 2: Uhr ablesen – „Wie spät ist es?“ Die Antwortkarten werden
     vorgelesen; oft mit Tagesbezug (Um 7 Uhr gibt es Frühstück).
     Typischer Ablenker: „12 Uhr“ (wer den großen Zeiger liest).
   - Stufe 3: Halbe Stunden – deutsche Sprechweise: „halb vier“ = 3:30.
     Der Stundenzeiger steht korrekt ZWISCHEN 3 und 4. Wichtigster Ablenker
     ist „halb drei“-Uhr (2:30) bzw. 4:30 – genau die typische Verwechslung.
   - Stufe 4: Volle und halbe Stunden ablesen (Karten „3 Uhr“ / „halb 4“).
   - Stufe 5: Uhr selbst stellen – Zahl antippen oder Stundenzeiger drehen
     (rastet auf volle Stunden ein). Flo sagt bei Fehlern, welche Uhrzeit
     gerade eingestellt ist.
   - Hilfe-Leiter: Erklärung zur gewählten Uhrzeit („Bei vier Uhr zeigt der
     kleine Zeiger auf die Vier.“) → Blick auf den kleinen Zeiger (leuchtet) →
     Flo liest die Uhr vor. Lerninhalt = die Uhrzeit ('3 Uhr', 'halb 4') über ctx.item.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const W = LT.w2;

  const norm = (h) => ((((h - 1) % 12) + 12) % 12) + 1; // auf 1–12 abbilden
  const tw = (h, m) => W.timeWords(norm(h), m);
  const Z = (n) => U.cap(U.numberWord(norm(n))); // Zahl als Nomen: „auf die Drei“

  /** Tagesbezug bei vollen Stunden (Vornamen bunt gemischt). */
  const DAILY = [
    { h: 7, e: '🥣', t: 'Um sieben Uhr frühstückt Lina.' },
    { h: 8, e: '🎒', t: 'Um acht Uhr geht Emil in den Kindergarten.' },
    { h: 10, e: '🍎', t: 'Um zehn Uhr ist Obstpause.' },
    { h: 12, e: '🍝', t: 'Um zwölf Uhr gibt es Mittagessen.' },
    { h: 3, e: '⚽', t: 'Um drei Uhr spielt Aylin Fußball.' },
    { h: 4, e: '🍰', t: 'Um vier Uhr gibt es Kuchen bei Oma.' },
    { h: 6, e: '🥪', t: 'Um sechs Uhr isst Jonas Abendbrot.' },
    { h: 2, e: '🏊', t: 'Um zwei Uhr geht Mila schwimmen.' },
    { h: 5, e: '🛁', t: 'Um fünf Uhr badet Noah.' },
  ];

  const EXPLAIN_FULL = 'Der kleine Zeiger zeigt die Stunde, der große Zeiger die Minuten. Bei einer vollen Stunde zeigt der große Zeiger immer nach oben auf die Zwölf.';
  const EXPLAIN_HALF = 'Bei halb zeigt der große Zeiger nach unten auf die Sechs. Der kleine Zeiger steht dann zwischen zwei Zahlen. Halb vier heißt: Es ist schon halb auf dem Weg zu vier Uhr.';

  /** Lerninhalt = die Uhrzeit (Schlüssel „3 Uhr“, „halb 4“): über ctx.item gewählt, damit
      schwierige Uhrzeiten in der Runde und an späteren Tagen wiederkommen. */
  function pickTime(ctx, m) {
    return ctx.item(U.range(1, 12), (h) => tw(h, m).text, { fresh: 'uhr-' + m, avoid: 4 });
  }
  /** Tagesbezug zu dieser Stunde (falls vorhanden) – mit Wahrscheinlichkeit p. */
  function dailyFor(h, p) {
    const d = DAILY.find((x) => x.h === h);
    return d && U.chance(p) ? d : null;
  }

  /** Hinweis zum Ablesen einer Uhrzeit. */
  function readHint(h, m) {
    if (m === 30) {
      return `Schau auf den kleinen Zeiger: Er steht zwischen der ${Z(h)} und der ${Z(h + 1)}. Der große Zeiger zeigt nach unten. Das heißt: ${tw(h, 30).say}.`;
    }
    return `Schau auf den kleinen Zeiger: Er zeigt auf die ${Z(h)}. Der große Zeiger zeigt nach oben. Es ist also ${tw(h, 0).say}.`;
  }

  /** Erklärung einmal pro Runde (erste Aufgabe) – mit kleiner Legende. */
  async function explainOnce(ctx, half) {
    if (ctx.index !== 0) return;
    const legend = W.clockLegend();
    ctx.stage.appendChild(legend);
    await ctx.say(half ? EXPLAIN_HALF : EXPLAIN_FULL);
  }

  /* ---------------- Stufe 1 + 3: Welche Uhr zeigt …? ---------------- */
  async function taskFind(ctx) {
    const half = ctx.taskLevel === 3 && ctx.index !== 4; // Stufe 3: halbe Stunden, zur Sicherheit eine volle
    const m = half ? 30 : 0;
    const h = pickTime(ctx, m);
    let others;
    if (half) {
      // klassische Verwechslungen: eine Stunde später/früher halb, oder die volle Stunde
      others = [[norm(h + 1), 30], U.chance(0.5) ? [h, 0] : [norm(h + 1), 0]];
      if (U.chance(0.4)) others[0] = [norm(h - 1), 30];
    } else {
      const pool = U.range(1, 12).filter((x) => Math.min(Math.abs(x - h), 12 - Math.abs(x - h)) >= 2);
      // Stufe 1, nach Fehlern in der Runde: nur zwei Uhren
      others = U.sample(pool, ctx.taskLevel === 1 && ctx.flow < 0 ? 1 : 2).map((x) => [x, 0]);
    }
    const words = tw(h, m);
    // kein 🕐-Emoji: es zeigt selbst eine (andere) Uhrzeit und würde verwirren
    const prompt = el('div.prompt-box.w2-prompt.w2-prompt-sm', U.emoji('🔍', 'mid-emoji'), el('span.prompt-text', words.text));
    ctx.stage.appendChild(prompt);
    await explainOnce(ctx, half);
    if (!ctx.active) return;
    ctx.instruct(`Welche Uhr zeigt ${words.say}?`);
    const items = [[h, m, true], ...others.map(([a, b]) => [a, b, false])].map(([a, b, ok]) => ({
      content: W.clock(a, b), correct: ok, aria: 'Uhr', className: 'w2-clock-tile', value: [a, b],
    }));
    const box = el('div.choices.w2-clock-choices');
    ctx.stage.appendChild(box);
    await ctx.choices(items, {
      container: box,
      hintAfter: W.hintAfter(ctx, items.length),
      correctSay: () => (ctx.modelShown ? 'Genau, diese Uhr.'
        : ctx.wrongCount === 0 && U.chance(0.3) ? `Richtig, du hast auf den kleinen Zeiger geschaut. Diese Uhr zeigt ${words.say}.`
          : `Richtig! Diese Uhr zeigt ${words.say}.`),
      // 1. Hilfe: was die gewählte Uhr zeigt
      explain: (it) => `Diese Uhr zeigt ${tw(it.value[0], it.value[1]).say}. Wir suchen ${words.say}.`,
      // 2. Hilfe: Regel, wo die Zeiger stehen müssen
      hintSay: half
        ? `Ein Tipp: Bei ${words.say} zeigt der große Zeiger nach unten, und der kleine Zeiger steht zwischen der ${Z(h)} und der ${Z(h + 1)}.`
        : `Ein Tipp: Bei ${words.say} zeigt der kleine Zeiger auf die ${Z(h)}, und der große Zeiger zeigt nach oben.`,
      // 3. Hilfe: an der richtigen Uhr zeigen
      modelSay: () => readHint(h, m),
    });
  }

  /* ---------------- Stufe 2 + 4: Wie spät ist es? ---------------- */
  async function taskRead(ctx) {
    const level4 = ctx.taskLevel >= 4;
    const half = level4 && ctx.index % 2 === 0 ? true : level4 ? U.chance(0.3) : false;
    const m = half ? 30 : 0;
    const h = pickTime(ctx, m);
    const daily = !half ? dailyFor(h, 0.6) : null;
    const right = tw(h, m);
    const T = (a, b) => Object.assign(tw(a, b), { h: norm(a), m: b });
    const cand = half
      ? [T(h - 1, 30) /* „halb drei“ statt „halb vier“ */, T(h, 0), T(h + 1, 0), T(h + 1, 30)]
      : [T(12, 0) /* großer Zeiger gelesen */, T(h + 1, 0), T(h - 1, 0), T(h + 2, 0)];
    const wrong = U.uniqueBy(cand.filter((c) => c.text !== right.text), (c) => c.text);
    // wichtigsten Ablenker meistens behalten, zweiten zufällig
    const picks = [wrong[0], U.pick(wrong.slice(1))];
    const clock = W.clock(h, m, { cls: 'w2-clock-show' });
    const box = el('div.prompt-box.w2-prompt.w2-read', clock, daily ? U.emoji(daily.e, 'big-emoji w2-daily') : null);
    ctx.stage.appendChild(box);
    await explainOnce(ctx, half);
    if (!ctx.active) return;
    ctx.instruct('Wie spät ist es?');
    const items = [right, ...picks].map((w) => ({
      content: w.text, text: true, say: w.say, correct: w === right, className: 'w2-time-tile', value: w,
    }));
    const ha = W.hintAfter(ctx, items.length);
    await ctx.choices(items, {
      nameFirst: true,
      sayButton: true,
      hintAfter: ha,
      correctSay: () => (ctx.modelShown ? `Genau, ${right.say}.${daily ? ' ' + daily.t : ''}` : `Richtig! Es ist ${right.say}.${daily ? ' ' + daily.t : ''}`),
      // 1. Hilfe: Wie sähe die Uhr bei der gewählten Zeit aus?
      explain: (it) => {
        const c = it.value;
        if (c.m !== m) return `Bei ${c.say} zeigt der große Zeiger nach ${c.m === 30 ? 'unten' : 'oben'}. Hier zeigt er nach ${m === 30 ? 'unten' : 'oben'}.`;
        if (m === 30) return `Bei ${c.say} steht der kleine Zeiger zwischen der ${Z(c.h)} und der ${Z(c.h + 1)}.`;
        return `Bei ${c.say} zeigt der kleine Zeiger auf die ${Z(c.h)}.`;
      },
      // 2. Hilfe: Blick auf den kleinen Zeiger lenken (er leuchtet)
      hintSay: 'Schau zuerst auf den kleinen, dicken Zeiger. Wohin zeigt er?',
      // 3. Hilfe: vorlesen, wie man die Uhr abliest
      modelSay: () => readHint(h, m),
      onWrong: async (item, tile, n) => {
        if (n === ha) clock.classList.add('w2-hint-hour');
      },
    });
  }

  /* ---------------- Stufe 5: Uhr stellen ---------------- */
  async function taskSet(ctx) {
    const target = pickTime(ctx, 0);
    const daily = dailyFor(target, 0.6);
    const start = U.pick(U.range(1, 11).filter((x) => x !== target));
    const words = tw(target, 0);
    ctx.stage.appendChild(el('div.prompt-box.w2-prompt.w2-prompt-sm',
      daily ? U.emoji(daily.e, 'mid-emoji') : U.emoji('👆', 'mid-emoji'), el('span.prompt-text', words.text)));
    const clock = W.clock(start, 0, { targets: true, cls: 'w2-clock-set' });
    const wrap = el('div.w2-set-wrap', clock);
    ctx.stage.appendChild(wrap);
    if (ctx.index === 0) await ctx.say('Der große Zeiger zeigt schon nach oben auf die Zwölf. Tippe die Zahl an, auf die der kleine Zeiger zeigen soll. Du kannst den kleinen Zeiger auch drehen.');
    if (!ctx.active) return;
    ctx.instruct(daily ? `${daily.t} Stell die Uhr auf ${words.say}.` : `Stell die Uhr auf ${words.say}.`);
    const targetHit = clock.querySelector(`[data-hour="${target}"]`);
    ctx.markTest(targetHit);

    await new Promise((resolve) => {
      let busy = false;
      let done = false;
      let down = null;
      let dragging = false;
      let suppressClick = false;

      const angleAt = (e) => {
        const r = clock.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        return { deg: ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360, dist: Math.hypot(dx, dy) / (r.width / 2) };
      };
      const hourFromDeg = (deg) => norm(Math.round(deg / 30) || 12);

      async function check(h) {
        if (busy || done || !ctx.active) return;
        clock.setTime(h, 0);
        if (h === target) {
          done = true;
          ctx.markTest(targetHit, false);
          targetHit.classList.remove('is-hint');
          await ctx.correct(wrap, { say: `Richtig! Die Uhr zeigt ${words.say}. Der kleine Zeiger zeigt auf die ${Z(target)}.` });
          resolve();
          return;
        }
        busy = true;
        // Hilfe-Leiter über ctx.helpStep: 1 erklären, 2 Denkanstoß, 3 vormachen
        await ctx.wrong(wrap, { say: `Jetzt zeigt die Uhr ${tw(h, 0).say}. Wir brauchen ${words.say}.` });
        if (ctx.active && ctx.helpStep === 2) {
          await ctx.say(`Ein Tipp: Der kleine Zeiger zeigt die Stunde. Such die Zahl für ${words.say}.`);
        } else if (ctx.active && ctx.helpStep >= 3) {
          targetHit.classList.add('is-hint');
          if (!ctx.modelShown) {
            ctx.modelShown = true;
            await ctx.say(`Schau, hier leuchtet die ${Z(target)}. Tippe sie an. Dann zeigt der kleine Zeiger auf die ${Z(target)}.`);
          }
        }
        busy = false;
      }

      ctx.listen(clock, 'pointerdown', (e) => {
        if (busy || done) return;
        down = { x: e.clientX, y: e.clientY, id: e.pointerId };
        dragging = false;
      });
      ctx.listen(clock, 'pointermove', (e) => {
        if (!down || busy || done) return;
        if (!dragging && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) {
          dragging = true;
          clock.classList.add('w2-dragging');
          try { clock.setPointerCapture(down.id); } catch (err) { /* egal */ }
        }
        if (dragging) clock.setHourAngle(angleAt(e).deg);
      });
      const end = (e) => {
        if (!down) return;
        const wasDrag = dragging;
        down = null;
        dragging = false;
        clock.classList.remove('w2-dragging');
        if (wasDrag) {
          suppressClick = true;
          ctx.timeout(() => { suppressClick = false; }, 60);
          check(hourFromDeg(angleAt(e).deg));
        }
      };
      ctx.listen(clock, 'pointerup', end);
      ctx.listen(clock, 'pointercancel', () => { down = null; dragging = false; clock.classList.remove('w2-dragging'); });
      ctx.listen(clock, 'click', (e) => {
        if (suppressClick) { suppressClick = false; return; }
        if (busy || done) return;
        const hit = e.target.closest && e.target.closest('[data-hour]');
        if (hit) { check(Number(hit.getAttribute('data-hour'))); return; }
        const a = angleAt(e);
        if (a.dist < 0.25 || a.dist > 1.1) return; // Mitte/außerhalb: ignorieren
        check(hourFromDeg(a.deg));
      });
    });
  }

  LT.registerGame({
    id: 'uhr',
    area: 'welt',
    title: 'Die Uhr',
    icon: '🕐',
    levels: 5,
    rounds: 5,
    parent: {
      skill: 'Uhrzeit: analoge Uhr lesen und stellen',
      goal: 'Ihr Kind lernt, dass der kurze Zeiger die Stunde und der lange Zeiger die Minuten zeigt, liest volle und halbe Stunden ab (deutsche Sprechweise: „halb vier“ = 3:30 Uhr) und stellt eine Uhrzeit selbst ein. Uhrzeiten werden mit dem Tagesablauf verknüpft.',
      levels: [
        'Stufe 1: Volle Stunden – Welche von 3 Uhren zeigt 3 Uhr?',
        'Stufe 2: Uhr ablesen – Wie spät ist es? (volle Stunden, mit Tagesbezug)',
        'Stufe 3: Halbe Stunden – Welche Uhr zeigt halb vier? (Stundenzeiger zwischen den Zahlen)',
        'Stufe 4: Volle und halbe Stunden ablesen',
        'Stufe 5: Uhr selbst stellen – Zahl antippen oder Stundenzeiger drehen',
      ],
      tip: 'Eine echte Zeigeruhr im Kinderzimmer hilft sehr. Verknüpfen Sie Uhrzeiten mit festen Ereignissen: „Wenn der kleine Zeiger auf der 7 ist, frühstücken wir.“ Bei „halb“ hilft der Satz: „Halb vier – schon halb auf dem Weg zur Vier.“',
    },
    async task(ctx) {
      // Wiederholung im Gedächtnis: Lerninhalt = die Uhrzeit (ctx.item)
      if (ctx.taskLevel === 1 || ctx.taskLevel === 3) return taskFind(ctx);
      if (ctx.taskLevel === 2 || ctx.taskLevel === 4) return taskRead(ctx);
      return taskSet(ctx);
    },
  });
})();
