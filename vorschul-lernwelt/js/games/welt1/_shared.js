/* ==========================================================================
   Gemeinsame Helfer der Spielgruppe 'welt1'
   (Raum-Lage, Mein Körper, Gefühle, Sicher unterwegs).

   - LT.w1.svg(viewBox, inner, cls)  → SVG-Element aus Markup-String
   - LT.w1.emo(e, x, bottom, size)   → Emoji als SVG-<text>, unten bündig
   - LT.w1.tapTask(ctx, opts)        → Antipp-Aufgabe auf eigenen Trefferzonen
     (sanftes Feedback, Hilfe nach 2 Fehlversuchen, Auto-Löser für den Testmodus)
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const W = {};

  /** SVG aus Markup erzeugen (schneller zu schreiben als einzelne Elemente). */
  W.svg = function (viewBox, inner, cls) {
    const box = document.createElement('div');
    box.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="${cls || ''}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
    return box.firstChild;
  };

  /** Emoji als SVG-Text: (x, bottom) = Mitte unten des Bildes. */
  W.emo = function (e, x, bottom, size, extra) {
    const y = bottom - size * 0.11;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size.toFixed(1)}" text-anchor="middle" class="w1-emo" ${extra || ''}>${e}</text>`;
  };

  /** Kleine Hilfe: Zahl auf 1 Nachkommastelle (kompaktes SVG-Markup). */
  W.n = (v) => Math.round(v * 10) / 10;

  /**
   * Antipp-Aufgabe auf beliebigen Elementen (z. B. SVG-Trefferzonen).
   * opts: {
   *   root: Element, auf dem Klicks abgehört werden,
   *   find(target) → Zonen-Element oder null,
   *   isCorrect(zone) → boolean,
   *   correctNode(): Element, das als Hilfe hervorgehoben wird,
   *   correctSay(zone), wrongSay(zone), hintSay,
   *   onCorrect(zone), onWrong(zone, n) (async)
   * }
   * Promise wird nach dem Erfolgserlebnis aufgelöst.
   */
  W.tapTask = function (ctx, o) {
    return new Promise((resolve) => {
      let busy = false;
      let done = false;
      const hintAfter = o.hintAfter || 2;
      async function handle(zone) {
        if (busy || done || !ctx.active || !zone) return;
        if (o.isCorrect(zone)) {
          done = true;
          const hn = o.correctNode();
          if (hn) hn.classList.remove('w1-hint');
          if (o.onCorrect) o.onCorrect(zone);
          await ctx.correct(o.feedbackNode ? o.feedbackNode(zone) : null, { say: o.correctSay ? o.correctSay(zone) : undefined });
          resolve(zone);
        } else {
          busy = true;
          if (zone.classList) {
            zone.classList.add('w1-wrong');
            ctx.timeout(() => zone.classList.remove('w1-wrong'), 700);
          }
          const n = await ctx.wrong(null, { say: o.wrongSay ? o.wrongSay(zone) : undefined });
          if (o.onWrong) {
            try { await o.onWrong(zone, n); } catch (e) { console.error(e); }
          }
          if (n >= hintAfter) {
            const hn = o.correctNode();
            if (hn) hn.classList.add('w1-hint');
            if (n === hintAfter && o.hintSay) await ctx.say(typeof o.hintSay === 'function' ? o.hintSay() : o.hintSay);
          }
          busy = false;
        }
      }
      ctx.listen(o.root, 'click', (e) => handle(o.find(e.target)));
      // Testmodus: Auto-Löser tippt die richtige Zone an
      ctx.testSolve(() => handle(o.correctNode()));
    });
  };

  /** Hautfarben, Haarfarben, Kleidung (inklusiv, zufällig gemischt). */
  W.SKIN = ['#f9d7b9', '#eebb8f', '#d39a6a', '#a86f45', '#7d4e2d'];
  W.HAIR = ['#3a2618', '#1f1a17', '#c98a2e', '#8b4a22', '#e6c068'];
  W.SHIRT = ['#4a90e2', '#ff8a3d', '#3dbe6b', '#8e6cef', '#ff5fa2', '#f2b705'];
  W.look = function (key) {
    return {
      skin: U.pickFresh((key || 'w1') + '-skin', W.SKIN, 2),
      hair: U.pickFresh((key || 'w1') + '-hair', W.HAIR, 2),
      shirt: U.pickFresh((key || 'w1') + '-shirt', W.SHIRT, 2),
      long: U.chance(0.45),
    };
  };

  /** Abwechslungsreiche Vornamen für Geschichten (m/w gemischt). */
  W.NAMES = {
    m: ['Ben', 'Leon', 'Emil', 'Noah', 'Jonas', 'Malik', 'Yusuf', 'Mateo', 'Finn', 'Karim', 'Luca', 'Tim', 'Anton', 'Elias', 'Milan'],
    w: ['Mia', 'Ayla', 'Lina', 'Elif', 'Sophie', 'Hanna', 'Zoe', 'Amira', 'Lea', 'Ida', 'Emma', 'Nora', 'Leni', 'Mira', 'Frieda'],
  };
  W.name = (g) => U.pickFresh('w1-name-' + g, W.NAMES[g], 8);

  LT.w1 = W;
})();
