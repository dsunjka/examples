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
   - Hilfe nach 2 Fehlversuchen: Flo lenkt den Blick auf den kleinen Zeiger,
     der Zeiger bzw. die Zahl leuchtet, die Lösung wird hervorgehoben.
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

  /** Zuletzt gefragte Stunden (gemeinsam für Zufallsstunden UND Tagesbezug → keine direkten Wiederholungen). */
  const recentHours = [];
  function remember(h) {
    recentHours.push(h);
    while (recentHours.length > 4) recentHours.shift();
    return h;
  }
  function hourTime() {
    return remember(U.pick(U.range(1, 12).filter((h) => !recentHours.includes(h))));
  }
  /** Tagesbezug, dessen Stunde nicht gerade erst dran war (oder null). */
  function freshDaily() {
    const pool = DAILY.filter((x) => !recentHours.includes(x.h));
    if (!pool.length) return null;
    const d = U.pick(pool);
    remember(d.h);
    return d;
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
    const half = ctx.level === 3 && ctx.index !== 4; // Stufe 3: halbe Stunden, zur Sicherheit eine volle
    const h = hourTime();
    const m = half ? 30 : 0;
    let others;
    if (half) {
      // klassische Verwechslungen: eine Stunde später/früher halb, oder die volle Stunde
      others = [[norm(h + 1), 30], U.chance(0.5) ? [h, 0] : [norm(h + 1), 0]];
      if (U.chance(0.4)) others[0] = [norm(h - 1), 30];
    } else {
      const pool = U.range(1, 12).filter((x) => Math.min(Math.abs(x - h), 12 - Math.abs(x - h)) >= 2);
      others = U.sample(pool, 2).map((x) => [x, 0]);
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
      correctSay: `Richtig! Diese Uhr zeigt ${words.say}.`,
      wrongSay: (it) => `Diese Uhr zeigt ${tw(it.value[0], it.value[1]).say}. Probier es noch einmal!`,
      hintSay: half
        ? `Bei ${words.say} zeigt der große Zeiger nach unten, und der kleine Zeiger steht zwischen der ${Z(h)} und der ${Z(h + 1)}.`
        : `Bei ${words.say} zeigt der kleine Zeiger auf die ${Z(h)}, und der große Zeiger zeigt nach oben.`,
    });
  }

  /* ---------------- Stufe 2 + 4: Wie spät ist es? ---------------- */
  async function taskRead(ctx) {
    const level4 = ctx.level >= 4;
    const half = level4 && ctx.index % 2 === 0 ? true : level4 ? U.chance(0.3) : false;
    const daily = !half && U.chance(0.45) ? freshDaily() : null;
    const h = daily ? daily.h : hourTime();
    const m = half ? 30 : 0;
    const right = tw(h, m);
    const cand = half
      ? [tw(h - 1, 30) /* „halb drei“ statt „halb vier“ */, tw(h, 0), tw(h + 1, 0), tw(h + 1, 30)]
      : [tw(12, 0) /* großer Zeiger gelesen */, tw(h + 1, 0), tw(h - 1, 0), tw(h + 2, 0)];
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
      content: w.text, text: true, say: w.say, correct: w === right, className: 'w2-time-tile',
    }));
    await ctx.choices(items, {
      nameFirst: true,
      sayButton: true,
      hintAfter: 3,
      // 1. Fehler: Blick lenken · 2. Fehler: ausführliche Hilfe (onWrong) statt Standard-Spruch
      wrongSay: () => (ctx.wrongCount === 0 ? 'Das ist es noch nicht. Schau zuerst auf den kleinen, dicken Zeiger.' : ctx.wrongCount === 1 ? '' : undefined),
      correctSay: `Richtig! Es ist ${right.say}.${daily ? ' ' + daily.t : ''}`,
      onWrong: async (item, tile, n) => {
        if (n === 2) {
          clock.classList.add('w2-hint-hour');
          await ctx.say(readHint(h, m));
        }
      },
    });
  }

  /* ---------------- Stufe 5: Uhr stellen ---------------- */
  async function taskSet(ctx) {
    const daily = U.chance(0.5) ? freshDaily() : null;
    const target = daily ? daily.h : hourTime();
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
        const n = await ctx.wrong(wrap, { say: `Jetzt zeigt die Uhr ${tw(h, 0).say}. Wir brauchen ${words.say}.` });
        busy = false;
        if (n >= 2 && ctx.active) {
          targetHit.classList.add('is-hint');
          if (n === 2) ctx.say(`Der kleine Zeiger muss auf die ${Z(target)} zeigen. Tippe die ${Z(target)} an.`);
        }
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
      if (ctx.level === 1 || ctx.level === 3) return taskFind(ctx);
      if (ctx.level === 2 || ctx.level === 4) return taskRead(ctx);
      return taskSet(ctx);
    },
  });
})();
