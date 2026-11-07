/* ==========================================================================
   Spiel „Memory“ 🃏 – visuell-räumliches Arbeitsgedächtnis & Wortschatz.

   Didaktik:
   - Klassisches Paare-Suchen: Das Kind muss sich merken, WO welches Bild
     liegt (räumliches Arbeitsgedächtnis) und seine Aufmerksamkeit steuern.
   - Wortschatz: Jede aufgedeckte Karte wird mit Artikel benannt („die Kuh“),
     jedes gefundene Paar im Plural („Zwei Kühe!“) – Wortfelder als Thema
     (Bauernhof, Zoo, Fahrzeuge, Kleidung …) vernetzen den Wortschatz.
   - Nicht-Paare sind normal und werden NICHT als Fehler gewertet: Die Karten
     drehen sich nur ruhig wieder um. Beim ersten Mal erklärt Flo die Regel.
   - Echte Hilfe: Nach zwei Fehlzügen in Folge zeigt Flo die passende Karte,
     wenn das Kind sie schon einmal gesehen hat („Den anderen Hund hast du
     schon gesehen – schau, hier!“). So endet jedes Spiel mit Erfolg.
   - Stufen: 3 → 4 → 6 → 8 Paare; Stufe 5 „Zahl & Menge“: Ziffer ↔ Punktebild
     (Würfelbild bis 6, darüber „Kraft der Fünf“: oben 5, unten der Rest).
   - Wertung fair aus den Zügen: Ein Kind mit gutem Gedächtnis braucht etwa
     2 Züge pro Paar. Bis 2,5 Züge pro Paar gibt es 3 Sterne, bis 4 Züge pro
     Paar 2 Sterne – Glück und Pech beim ersten Aufdecken gleichen sich aus.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const D = LT.d1;

  /* ------------------------------------------------------------------
     Themen (Wortfelder). Nur Wörter mit Plural und gut unterscheidbaren
     Bildern (z. B. kein Taxi neben dem Auto, kein Hahn neben dem Huhn).
     ------------------------------------------------------------------ */
  const THEMES = [
    { id: 'hof', name: 'Tieren vom Bauernhof', ids: ['kuh', 'schwein', 'schaf', 'ziege', 'pferd', 'huhn', 'kueken', 'ente', 'hund', 'katze'] },
    { id: 'zoo', name: 'Tieren aus dem Zoo', ids: ['loewe', 'tiger', 'elefant', 'giraffe', 'zebra', 'affe', 'nilpferd', 'kaenguru', 'pinguin', 'kamel', 'nashorn', 'panda', 'koala', 'flamingo', 'papagei'] },
    { id: 'wald', name: 'Tieren aus Wald und Wiese', ids: ['fuchs', 'igel', 'eichhoernchen', 'eule', 'baer', 'hirsch', 'wildschwein', 'schnecke', 'marienkaefer', 'schmetterling', 'ameise', 'biene'] },
    { id: 'wasser', name: 'Tieren aus dem Wasser', ids: ['fisch', 'wal', 'delfin', 'hai', 'krake', 'krabbe', 'schildkroete', 'frosch', 'schwan', 'muschel'] },
    { id: 'obst', name: 'Obst und Gemüse', ids: ['apfel', 'birne', 'banane', 'erdbeere', 'kirsche', 'traube', 'orange', 'zitrone', 'ananas', 'kiwi', 'karotte', 'gurke', 'brokkoli', 'zwiebel', 'kartoffel'] },
    { id: 'fahrzeuge', name: 'Fahrzeugen', ids: ['auto', 'bus', 'zug', 'fahrrad', 'flugzeug', 'hubschrauber', 'rakete', 'traktor', 'feuerwehrauto', 'krankenwagen', 'schiff', 'segelboot', 'roller', 'lastwagen', 'motorrad'] },
    { id: 'kleidung', name: 'Sachen zum Anziehen', ids: ['hemd', 'hose', 'kleid', 'socke', 'handschuh', 'schal', 'hut', 'kappe', 'schuh', 'stiefel', 'jacke', 'brille'] },
    { id: 'spiel', name: 'Spielsachen und Musik', ids: ['ball', 'teddy', 'drachen', 'luftballon', 'puzzle', 'wuerfel', 'geschenk', 'trommel', 'gitarre', 'trompete', 'klavier', 'geige'] },
    { id: 'lecker', name: 'leckerem Essen', ids: ['brot', 'brezel', 'keks', 'lutscher', 'torte', 'muffin', 'donut', 'pfannkuchen', 'bonbon', 'hamburger', 'wuerstchen', 'pizza'] },
    { id: 'natur', name: 'Pflanzen und Natur', ids: ['baum', 'tanne', 'tulpe', 'sonnenblume', 'rose', 'blatt', 'kaktus', 'kastanie', 'kleeblatt', 'wolke', 'stern', 'schneeflocke'] },
  ];

  const LEVELS = {
    1: { pairs: 3, mode: 'bild' },
    2: { pairs: 4, mode: 'bild' },
    3: { pairs: 6, mode: 'bild' },
    4: { pairs: 8, mode: 'bild' },
    5: { pairs: 6, mode: 'zahl' },
  };

  /* ------------------------------------------------------------------
     Punktebilder für „Zahl & Menge“ (Positionen in % der Karte)
     ------------------------------------------------------------------ */
  const DICE = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[26, 26], [50, 50], [74, 74]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
    6: [[30, 22], [30, 50], [30, 78], [70, 22], [70, 50], [70, 78]],
  };
  function dotPattern(n) {
    const box = el('div.mem-dots', { role: 'img', 'aria-label': `${n} Punkte` });
    let pos;
    if (n <= 6) pos = DICE[n];
    else {
      // „Kraft der Fünf“: obere Reihe voll (5), untere Reihe der Rest
      const xs = [14, 32, 50, 68, 86];
      pos = xs.map((x) => [x, 36]).concat(xs.slice(0, n - 5).map((x) => [x, 66]));
      box.classList.add('rows');
    }
    pos.forEach(([x, y]) => box.appendChild(el('i.mem-dot', { style: { left: x + '%', top: y + '%' } })));
    return box;
  }

  LT.registerGame({
    id: 'memory',
    area: 'denken',
    title: 'Memory',
    icon: '🃏',
    levels: 5,
    type: 'single',
    parent: {
      skill: 'Visuelles Arbeitsgedächtnis & Wortschatz',
      goal: 'Ihr Kind merkt sich, wo welche Karte liegt, und steuert seine Aufmerksamkeit gezielt (exekutive Funktionen). Jede Karte wird mit Artikel benannt, jedes Paar im Plural („Zwei Kühe!“) – so wächst nebenbei der Wortschatz in Themenfeldern. Fehlzüge gehören zum Spiel und zählen nicht als Fehler; bewertet wird, wie sparsam es aufdeckt.',
      levels: [
        '3 Paare (6 Karten) zu einem Thema',
        '4 Paare (8 Karten)',
        '6 Paare (12 Karten)',
        '8 Paare (16 Karten)',
        'Zahl & Menge: Ziffer 1–10 und passendes Punktebild finden (6 Paare)',
      ],
      tip: 'Spielen Sie zu Hause echtes Memory und sprechen Sie dabei laut („Hier war doch die Katze!“). Kim-Spiele helfen ebenso: Legen Sie 4–6 Dinge auf ein Tuch, ein Ding verschwindet – was fehlt?',
    },

    async play(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      const zahl = cfg.mode === 'zahl';
      const n = cfg.pairs;

      /* ---------- Karten erzeugen ---------- */
      let theme = null;
      const specs = [];
      if (zahl) {
        U.sample(U.range(1, 10), n).forEach((k) => {
          specs.push({ key: 'n' + k, value: k, kind: 'digit' });
          specs.push({ key: 'n' + k, value: k, kind: 'dots' });
        });
      } else {
        const usable = THEMES.filter((t) => D.words(t.ids).filter((w) => w.p).length >= n);
        theme = U.pickFresh('mem-theme', usable, 4, (t) => t.id);
        U.sample(D.words(theme.ids).filter((w) => w.p), n).forEach((w) => {
          specs.push({ key: w.id, word: w });
          specs.push({ key: w.id, word: w });
        });
      }

      const cards = U.shuffle(specs).map((spec, i) => {
        const front = el('div.mem-face.mem-front');
        if (spec.word) front.appendChild(U.emoji(spec.word.e));
        else if (spec.kind === 'digit') front.appendChild(el('span.mem-digit', String(spec.value)));
        else front.appendChild(dotPattern(spec.value));
        const back = el('div.mem-face.mem-back', el('span.mem-back-mark', { 'aria-hidden': 'true' }, '?'));
        const inner = el('div.mem-inner', back, front);
        const node = el('button.mem-card', { type: 'button', 'aria-label': `Karte ${i + 1}` }, inner);
        return Object.assign({ el: node, open: false, matched: false, seen: false }, spec);
      });

      /** Was Flo beim Aufdecken sagt (Punktebilder bleiben stumm: selbst erkennen!) */
      const nameOf = (c) => (c.word ? D.art(c.word) : c.kind === 'digit' ? D.Num(c.value) : '');
      const labelOf = (c) => (c.word ? c.word.w : c.kind === 'digit' ? `Zahl ${c.value}` : `${c.value} Punkte`);

      /* ---------- Aufbau ---------- */
      const slots = [];
      const bar = el('div.mem-bar', { 'aria-label': 'Gefundene Paare' });
      for (let i = 0; i < n; i++) {
        const s = el('span.mem-slot');
        slots.push(s);
        bar.appendChild(s);
      }
      const grid = el('div.mem-grid' + (zahl ? '.zahl' : ''));
      cards.forEach((c) => grid.appendChild(c.el));
      ctx.stage.classList.add('mem-stage');
      ctx.stage.append(bar, grid);

      /** Kartengröße so wählen, dass alles ohne Scrollen passt (quer & hochkant). */
      function layout() {
        if (!ctx.active) return;
        const { w, h } = D.innerSize(ctx.stage);
        const stageGap = parseFloat(getComputedStyle(ctx.stage).rowGap) || 16;
        const availH = h - bar.offsetHeight - stageGap;
        const N = cards.length;
        const g = Math.round(U.clamp(Math.min(w, availH) * 0.022, 8, 16));
        const MAX = 176;
        let best = null;
        for (let cols = 2; cols <= N; cols++) {
          const rows = Math.ceil(N / cols);
          const empty = cols * rows - N;
          if (empty >= cols) continue;
          const size = Math.min((w - g * (cols - 1)) / cols, (availH - g * (rows - 1)) / rows);
          const value = Math.min(size, MAX) - empty * 4;
          if (!best || value > best.value + 0.5) best = { cols, size, value };
        }
        const size = Math.floor(U.clamp(best.size, 56, MAX));
        grid.style.setProperty('--mem-size', size + 'px');
        grid.style.setProperty('--mem-gap', g + 'px');
        grid.style.width = best.cols * size + (best.cols - 1) * g + 'px';
      }
      layout();
      requestAnimationFrame(layout);
      ctx.listen(window, 'resize', layout);

      /* ---------- Spiellogik ---------- */
      let first = null;
      let busy = false;
      let moves = 0;
      let found = 0;
      let missStreak = 0;
      let explained = false; // Regel „passt nicht → umdrehen“ einmal erklären
      let hinted = null;
      let finish;
      const done = new Promise((r) => { finish = r; });
      ctx.onCleanup(() => finish(null));

      const partnerOf = (c) => cards.find((x) => x !== c && x.key === c.key);

      function setOpen(c, open) {
        c.open = open;
        c.el.classList.toggle('is-open', open);
        c.el.setAttribute('aria-label', open ? labelOf(c) : 'Verdeckte Karte');
        LT.sfx.play('flip');
      }

      function clearHint() {
        if (hinted) ctx.unhint(hinted.el);
        hinted = null;
      }

      /** Karte antippen (synchron, damit auch der Test-Löser zuverlässig ist). */
      function pick(c) {
        if (!ctx.active || busy || !c || c.open || c.matched) return;
        setOpen(c, true);
        c.seen = true;
        const name = nameOf(c);
        const spoken = name ? ctx.say(name) : Promise.resolve();
        if (!first) {
          first = c;
          // Echte Hilfe nach zwei Fehlzügen in Folge: passende Karte zeigen, wenn schon gesehen
          const partner = partnerOf(c);
          if (missStreak >= 2 && partner.seen && !partner.matched) {
            spoken.then(() => {
              if (!ctx.active || first !== c) return;
              hinted = partner;
              ctx.hint(partner.el);
              ctx.say(c.word ? `${U.cap(D.denAnderen(c.word))} hast du schon gesehen. Schau, hier!` : 'Die passende Karte hast du schon gesehen. Schau, hier!');
            });
          }
          return;
        }
        const a = first;
        first = null;
        busy = true;
        moves++;
        evaluate(a, c, spoken).catch((e) => console.error(e));
      }

      async function evaluate(a, b, spoken) {
        if (a.key === b.key) {
          // ---- Paar gefunden ----
          clearHint();
          missStreak = 0;
          await ctx.sleep(250);
          if (!ctx.active) return;
          a.matched = b.matched = true;
          a.el.classList.add('is-matched');
          b.el.classList.add('is-matched');
          const slot = slots[found++];
          slot.classList.add('filled');
          slot.appendChild(a.word ? U.emoji(a.word.e) : el('span.mem-slot-num', String(a.value)));
          LT.ui.animate(a.el, 'joy');
          const say = a.word
            ? U.pick([`Zwei ${a.word.p}!`, `Ein Paar: zwei ${a.word.p}!`, `Super, zwei ${a.word.p}!`])
            : a.value === 1 ? 'Die Eins und ein Punkt. Das passt!' : `Die ${D.Num(a.value)} und ${U.numberWord(a.value)} Punkte. Das passt!`;
          await ctx.correct(b.el, { say });
          if (!ctx.active) return;
          busy = false;
          if (found === n) end();
        } else {
          // ---- kein Paar: ruhig wieder umdrehen (kein Fehler!) ----
          missStreak++;
          await spoken;
          await ctx.sleep(900);
          if (!ctx.active) return;
          if (!explained) {
            explained = true;
            await ctx.say(zahl ? 'Die passen nicht zusammen. Merk dir, wo sie liegen!' : 'Die sind nicht gleich. Ich drehe sie wieder um. Merk dir, wo sie liegen!');
            if (!ctx.active) return;
          }
          setOpen(a, false);
          setOpen(b, false);
          await ctx.sleep(450);
          busy = false;
        }
      }

      async function end() {
        await ctx.sleep(300);
        if (!ctx.active) return;
        // fair: ca. 2 Züge pro Paar = volle Punktzahl (3 Sterne bis 2,5 Züge/Paar, 2 Sterne bis 4)
        const score = Math.min(1, (2 * n + 1) / Math.max(1, moves));
        await ctx.say(`Geschafft! Du hast alle ${U.numberWord(n)} Paare gefunden!`);
        finish({ score });
      }

      cards.forEach((c) => ctx.listen(c.el, 'click', () => pick(c)));

      // Testmodus: immer ein passendes Paar aufdecken
      ctx.testSolve(() => {
        if (busy) return;
        if (first) { pick(partnerOf(first)); return; }
        const a = cards.find((c) => !c.matched);
        if (!a) return;
        pick(a);
        pick(partnerOf(a));
      });

      /* ---------- Ansage ---------- */
      const rule = zahl
        ? 'Finde immer eine Zahl und das passende Punktebild. Tippe zwei Karten an.'
        : 'Tippe zwei Karten an und finde zwei gleiche Bilder.';
      ctx.setInstruction(rule);
      ctx.say(zahl ? `Zahlen-Memory! ${rule}` : `Memory mit ${theme.name}! ${rule}`);

      const res = await done;
      return res || { score: 0 };
    },
  });
})();
