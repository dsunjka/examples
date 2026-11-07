/* ==========================================================================
   Spiel „Was fehlt?“ 🙈 – Kim-Spiel für das visuelle Arbeitsgedächtnis.

   Didaktik:
   - Auf dem Tisch liegen Dinge. Flo benennt sie nacheinander („ein Ball,
     ein Apfel …“) – Bild UND Wort werden gemeinsam gespeichert (doppelte
     Kodierung), das Kind lernt nebenbei eine Merkstrategie: leise mitsagen.
   - KEIN Zeitdruck: Das Kind entscheidet selbst, wann es sich alles gemerkt
     hat, und tippt dann auf den grünen Knopf. Erst dann schließt sich der
     Vorhang und Flo zaubert ein Ding weg (bzw. auf der letzten Stufe auch
     eines dazu).
   - Progression: 3 → 4 → 5 → 6 Dinge. Auf Stufe 1–2 bleibt die Lücke an
     ihrem Platz (räumlicher Hinweis), ab Stufe 3 werden die übrigen Dinge
     neu gemischt (das Kind muss sich die Dinge selbst merken, nicht den
     Platz). Ab Stufe 3 ist unter den Antworten ein „Verwechsler“ aus derselben
     Kategorie (Hund oder Katze?). Stufe 5: zusätzlich „Was ist neu?“.
   - Antworten sind gemischt: das fehlende Ding, ein Ding, das noch auf dem
     Tisch liegt (genau hinschauen!), und Dinge, die nie da waren.
   - Hilfe: 1. Fehler → genaue Rückmeldung („Der Ball liegt noch auf dem
     Tisch.“) plus Kategorie-Tipp („Es ist ein Tier.“). 2. Fehler → Flo
     öffnet den Vorhang zum „Vorher-Bild“, das gesuchte Ding leuchtet; dann
     wird die Lösung hervorgehoben. Jede Aufgabe endet mit Erfolg.
   - Damit der Kategorie-Tipp eindeutig ist, liegt von jeder Kategorie
     höchstens ein Ding auf dem Tisch.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const D = LT.d1;

  /* ------------------------------------------------------------------
     Dinge (gut erkennbar, gut benennbar) und Kategorie-Tipps
     ------------------------------------------------------------------ */
  const POOL = {
    tiere: ['hund', 'katze', 'maus', 'hase', 'kuh', 'schwein', 'ente', 'frosch', 'schnecke', 'elefant', 'giraffe', 'loewe', 'pinguin', 'fisch', 'schmetterling', 'igel', 'eule', 'affe', 'biene'],
    obst: ['apfel', 'banane', 'erdbeere', 'birne', 'zitrone', 'ananas', 'kirsche', 'melone'],
    gemuese: ['karotte', 'gurke', 'brokkoli', 'zwiebel'],
    naschen: ['keks', 'lutscher', 'torte', 'muffin', 'donut', 'bonbon', 'eis'],
    fahrzeuge: ['auto', 'bus', 'fahrrad', 'flugzeug', 'rakete', 'traktor', 'schiff', 'hubschrauber', 'feuerwehrauto'],
    kleidung: ['hose', 'socke', 'schal', 'hut', 'kappe', 'schuh', 'kleid', 'handschuh', 'jacke'],
    spielzeug: ['ball', 'teddy', 'drachen', 'luftballon', 'wuerfel', 'geschenk', 'puzzle'],
    musik: ['trommel', 'gitarre', 'trompete', 'geige'],
    haushalt: ['schluessel', 'buch', 'schere', 'wecker', 'regenschirm', 'krone', 'kerze', 'brille', 'loeffel', 'hammer'],
    natur: ['sonne', 'mond', 'stern', 'regenbogen', 'baum', 'tulpe', 'kaktus'],
  };
  const TIPS = {
    tiere: 'ein Tier',
    obst: 'Obst',
    gemuese: 'Gemüse',
    naschen: 'etwas zum Naschen',
    fahrzeuge: 'ein Fahrzeug',
    kleidung: 'etwas zum Anziehen',
    spielzeug: 'ein Spielzeug',
    musik: 'ein Musikinstrument',
    natur: 'etwas aus der Natur',
    haushalt: null, // zu uneinheitlich für einen sinnvollen Tipp
  };
  const ALL = [];
  Object.keys(POOL).forEach((cat) => POOL[cat].forEach((id) => {
    const w = D.word(id);
    if (w) ALL.push({ id, cat, word: w });
  }));

  const LEVELS = {
    1: { n: 3, keepGap: true, options: 3, sameCat: false, modes: ['fehlt'] },
    2: { n: 4, keepGap: true, options: 4, sameCat: false, modes: ['fehlt'] },
    3: { n: 5, keepGap: false, options: 4, sameCat: true, modes: ['fehlt'] },
    4: { n: 6, keepGap: false, options: 4, sameCat: true, modes: ['fehlt'] },
    5: { n: 6, keepGap: false, options: 4, sameCat: true, modes: ['fehlt', 'neu'] },
  };

  /** n Dinge aus n verschiedenen Kategorien */
  function pickTable(n) {
    return U.sample(Object.keys(POOL), n).map((cat) => U.pick(ALL.filter((x) => x.cat === cat)));
  }

  LT.registerGame({
    id: 'was-fehlt',
    area: 'denken',
    title: 'Was fehlt?',
    icon: '🙈',
    levels: 5,
    rounds: 4,
    parent: {
      skill: 'Visuelles Arbeitsgedächtnis (Kim-Spiel)',
      goal: 'Ihr Kind prägt sich mehrere Dinge ein, während Flo sie benennt (Bild und Wort zusammen merken). Es bestimmt selbst, wann es bereit ist – es gibt keinen Zeitdruck. Danach verschwindet ein Ding hinter dem Vorhang. Das trainiert das Arbeitsgedächtnis, genaues Hinsehen und Vergleichen – Fähigkeiten, die beim Lesen, Rechnen und Zuhören in der Schule ständig gebraucht werden.',
      levels: [
        '3 Dinge, die Lücke bleibt an ihrem Platz',
        '4 Dinge, die Lücke bleibt an ihrem Platz',
        '5 Dinge, danach neu gemischt; ein ähnliches Ding als Ablenker',
        '6 Dinge, danach neu gemischt',
        '6 Dinge: Was fehlt? – oder: Was ist neu dazugekommen?',
      ],
      tip: 'Kim-Spiel zu Hause: Legen Sie 4–6 Gegenstände auf ein Tablett, decken Sie sie mit einem Tuch ab und nehmen Sie einen weg. Tauschen Sie auch die Rollen – Kinder lieben es, die Erwachsenen zu prüfen!',
    },

    async task(ctx) {
      const cfg = LEVELS[ctx.level] || LEVELS[1];
      const mode = cfg.modes.length > 1 ? U.pickFresh('wf-mode', cfg.modes, 1) : cfg.modes[0];
      const n = cfg.n;
      const table = pickTable(n);
      const maxItems = mode === 'neu' ? n + 1 : n;

      /* ---------- Aufbau: Tisch mit Vorhang, unten Knopf/Antworten ---------- */
      const grid = el('div.wf-grid');
      const memo = el('div.wf-memo', { hidden: true }, el('div.wf-grid'));
      const curtainL = el('div.wf-curtain.left');
      const curtainR = el('div.wf-curtain.right');
      const sparkle = el('span.wf-sparkle.emoji', { 'aria-hidden': 'true' }, '✨');
      const tableEl = el('div.wf-table', grid, memo, curtainL, curtainR, sparkle);
      const bottom = el('div.wf-bottom');
      ctx.stage.classList.add('wf-stage');
      ctx.stage.append(tableEl, bottom);

      /** Größen so berechnen, dass Tisch + Antworten ohne Scrollen passen. */
      function layout() {
        if (!ctx.active) return;
        const { w, h } = D.innerSize(ctx.stage);
        const stageGap = parseFloat(getComputedStyle(ctx.stage).rowGap) || 16;
        const portrait = h > w * 1.05;
        const g = Math.round(U.clamp(Math.min(w, h) * 0.022, 8, 16));
        // Antwort-Kacheln (bzw. Knopf) unten
        // hochkant alle Antworten in eine Reihe, wenn sie dort noch groß genug sind (≥ 76 px)
        const oneRow = (w - g * (cfg.options - 1)) / cfg.options >= 76;
        const oCols = portrait && !oneRow ? 2 : cfg.options;
        const oRows = Math.ceil(cfg.options / oCols);
        const choice = Math.round(U.clamp(Math.min((w - g * (oCols - 1)) / oCols, (h * (portrait ? 0.34 : 0.3) - g * (oRows - 1)) / oRows), 72, 140));
        // im Neu-Modus wird auf dem Tisch geantwortet → unten nur Platz für den Bereit-Knopf
        const bottomH = mode === 'neu' ? 84 : oRows * choice + (oRows - 1) * g;
        // Tisch: bestes Raster für maxItems Dinge
        const pad = Math.round(U.clamp(Math.min(w, h) * 0.035, 14, 30)) + 10; // + Rahmen
        const tw = w - 2 * pad;
        const th = h - bottomH - stageGap - 2 * pad;
        // quer: bei Gleichstand breitere Raster (wie Dinge nebeneinander auf dem Tisch)
        let best = null;
        const order = U.range(1, maxItems);
        if (!portrait) order.reverse();
        for (const cols of order) {
          const rows = Math.ceil(maxItems / cols);
          if (cols * rows - maxItems >= cols) continue;
          const size = Math.min((tw - g * (cols - 1)) / cols, (th - g * (rows - 1)) / rows);
          const value = Math.min(size, 150) - (cols * rows - maxItems) * 4;
          if (!best || value > best.value + 0.5) best = { cols, size, value };
        }
        const slot = Math.floor(U.clamp(best.size, 64, 150));
        ctx.stage.style.setProperty('--wf-slot', slot + 'px');
        ctx.stage.style.setProperty('--wf-gap', g + 'px');
        ctx.stage.style.setProperty('--wf-choice', choice + 'px');
        ctx.stage.style.setProperty('--wf-pad', pad - 10 + 'px');
        const gw = best.cols * slot + (best.cols - 1) * g + 'px';
        tableEl.querySelectorAll('.wf-grid').forEach((x) => { x.style.width = gw; });
        bottom.style.minHeight = bottomH + 'px';
        bottom.style.gridTemplateColumns = `repeat(${oCols}, auto)`;
      }

      /** Dinge auf den Tisch legen. list: Dinge oder null (= leerer Platz). */
      function render(target, list, glow) {
        U.clear(target);
        return list.map((x) => {
          if (!x) {
            const gap = el('div.wf-slot.empty', el('span.wf-q', '?'));
            target.appendChild(gap);
            return gap;
          }
          const s = el('div.wf-slot' + (glow && x === glow ? '.wf-glow' : ''), { 'aria-label': x.word.w }, U.emoji(x.word.e));
          target.appendChild(s);
          return s;
        });
      }

      const closeCurtain = async () => {
        tableEl.classList.add('closed');
        LT.sfx.play('whoosh');
        await ctx.sleep(700);
      };
      const openCurtain = async () => {
        tableEl.classList.remove('closed');
        LT.sfx.play('whoosh');
        await ctx.sleep(650);
      };

      layout();
      ctx.listen(window, 'resize', layout);
      const slots = render(grid, table);

      /* ---------- 1. Einprägen: Flo benennt jedes Ding ---------- */
      const ready = LT.ui.button('Ich hab’s mir gemerkt!', () => {}, { icon: '👍', cls: 'btn-green wf-ready', big: true });
      ready.disabled = true;
      bottom.appendChild(ready);

      await ctx.instruct(ctx.index === 0
        ? 'Schau dir die Dinge auf dem Tisch gut an und merk sie dir!'
        : U.pick(['Schau genau hin und merk dir alles!', 'Was liegt auf dem Tisch? Merk es dir gut!', 'Gut aufpassen! Merk dir alle Dinge.']));
      for (const s of slots) {
        if (!ctx.active) return;
        s.classList.add('wf-naming');
        const x = table[slots.indexOf(s)];
        await ctx.say(D.ein(x.word));
        s.classList.remove('wf-naming');
        await ctx.sleep(150);
      }
      if (!ctx.active) return;

      ready.disabled = false;
      ready.classList.add('wf-pulse');
      ctx.markTest(ready);
      const readyText = mode === 'neu' || ctx.level === 5
        ? 'Wenn du dir alles gemerkt hast, tippe auf den grünen Knopf. Dann zaubere ich!'
        : 'Wenn du dir alles gemerkt hast, tippe auf den grünen Knopf. Dann zaubere ich etwas weg!';
      ctx.instruct(ctx.index === 0 ? `Lass dir ruhig Zeit. ${readyText}` : 'Tippe auf den grünen Knopf, wenn du bereit bist.');
      await new Promise((res) => {
        ready.addEventListener('click', res, { once: true });
        ctx.onCleanup(res);
      });
      if (!ctx.active) return;
      ctx.markTest(ready, false);
      ready.remove();

      /* ---------- 2. Zaubern hinter dem Vorhang ---------- */
      const magic = ctx.say(U.pick(['Vorhang zu! Hokuspokus …', 'Hokuspokus, Fidibus …', 'Abrakadabra …']));
      await closeCurtain();
      await magic; // Zauberspruch ausreden lassen, nicht vom nächsten Satz abschneiden
      if (!ctx.active) return;

      let missing = null;
      let added = null;
      let current;
      if (mode === 'fehlt') {
        missing = U.pickFresh('wf-missing', table, Math.min(4, n - 1), (x) => x.id);
        if (cfg.keepGap) {
          current = table.map((x) => (x === missing ? null : x));
        } else {
          current = U.shuffle(table.filter((x) => x !== missing));
        }
        render(grid, current);
      } else {
        const used = new Set(table.map((x) => x.id));
        // aus einer Kategorie, die noch nicht auf dem Tisch liegt → Kategorie-Tipp ist eindeutig
        const usedCats = new Set(table.map((x) => x.cat));
        added = U.pick(ALL.filter((x) => !used.has(x.id) && !usedCats.has(x.cat)));
        current = U.shuffle(table.concat([added]));
        U.clear(grid); // die Dinge werden unten als antippbare Kacheln auf den Tisch gelegt
      }
      // „Vorher-Bild“ für die Hilfe vorbereiten
      render(memo.firstChild, table, missing);
      await ctx.sleep(350);
      if (!ctx.active) return;

      /** Hilfe: Vorhang auf zum Vorher-Bild, dann zurück */
      async function showBefore() {
        await ctx.say('Ich zeige dir noch einmal, wie es vorher war.');
        if (!ctx.active) return;
        await closeCurtain();
        memo.hidden = false;
        await openCurtain();
        if (!ctx.active) return;
        await ctx.say(mode === 'fehlt' ? 'Schau, das leuchtende Ding fehlt jetzt!' : 'Schau genau: So war es vorher.');
        await ctx.sleep(1800);
        if (!ctx.active) return;
        await closeCurtain();
        memo.hidden = true;
        await openCurtain();
      }

      /* ---------- 3. Fragen ---------- */
      if (mode === 'fehlt') {
        const visible = U.pick(table.filter((x) => x !== missing));
        const used = new Set(table.map((x) => x.id));
        const unseenPool = ALL.filter((x) => !used.has(x.id));
        const unseen = [];
        if (cfg.sameCat) {
          const twin = unseenPool.filter((x) => x.cat === missing.cat);
          if (twin.length) unseen.push(U.pick(twin));
        }
        unseen.push(...U.sample(unseenPool.filter((x) => !unseen.includes(x) && x.cat !== missing.cat), cfg.options - 2 - unseen.length));
        const options = [missing, visible].concat(unseen).map((x) => ({
          content: x.word.e, say: D.art(x.word), correct: x === missing, thing: x,
        }));

        const done = ctx.say(U.pick(['Simsalabim!', 'Fertig gezaubert!', 'Und jetzt schau!']));
        await openCurtain();
        await done;
        if (!ctx.active) return;
        const q = 'Was fehlt? Tippe auf das Ding, das nicht mehr auf dem Tisch liegt.';
        ctx.setInstruction(q);
        ctx.say(ctx.index === 0 ? q : 'Was fehlt?');

        await ctx.choices(options, {
          container: bottom,
          className: 'wf-options',
          sayButton: true,
          hintAfter: 2,
          wrongSay: (it) => {
            if (ctx.wrongCount >= 1) return '';
            const tip = TIPS[missing.cat] ? ` Tipp: Es ist ${TIPS[missing.cat]}.` : '';
            if (it.thing === visible) return `${D.Art(it.thing.word)} liegt noch auf dem Tisch. Schau mal genau hin!${tip}`;
            // Verwechsler aus derselben Kategorie: Der Tipp „Es ist …“ würde hier nur verwirren
            if (it.thing.cat === missing.cat && TIPS[missing.cat]) {
              return `${D.Art(it.thing.word)} war gar nicht auf dem Tisch. Aber du bist nah dran: Was fehlt, ist auch ${TIPS[missing.cat]}.`;
            }
            return `${D.Art(it.thing.word)} war gar nicht auf dem Tisch.${tip}`;
          },
          onWrong: async (it, tile, wrongs) => {
            if (wrongs === 2) await showBefore();
          },
          hintSay: 'Weißt du es jetzt? Tippe es an!',
          onCorrect: () => {
            // das fehlende Ding kommt zurück auf den Tisch
            const back = el('div.wf-slot.wf-back', { 'aria-label': missing.word.w }, U.emoji(missing.word.e));
            const gap = grid.querySelector('.wf-slot.empty');
            if (gap) grid.replaceChild(back, gap);
            else grid.appendChild(back);
          },
          correctSay: () => `Richtig! ${D.Art(missing.word)} hat gefehlt.`,
        });
      } else {
        const done = ctx.say('Simsalabim!');
        const items = current.map((x) => ({
          content: x.word.e, say: D.art(x.word), correct: x === added, className: 'wf-thing', thing: x,
        }));
        const choosing = ctx.choices(items, {
          container: grid,
          shuffle: false,
          hintAfter: 2,
          wrongSay: (it) => {
            if (ctx.wrongCount >= 1) return '';
            const tip = TIPS[added.cat] ? ` Tipp: Das Neue ist ${TIPS[added.cat]}.` : '';
            return `${D.Art(it.thing.word)} war schon vorher da.${tip}`;
          },
          onWrong: async (it, tile, wrongs) => {
            if (wrongs === 2) await showBefore();
          },
          hintSay: 'Das hier ist neu. Tippe es an!',
          correctSay: () => `Richtig! ${D.Art(added.word)} ist neu dazugekommen.`,
        });
        await openCurtain();
        await done;
        if (!ctx.active) return;
        const q = 'Was ist neu dazugekommen? Tippe es auf dem Tisch an!';
        ctx.setInstruction(q);
        ctx.say(q);
        await choosing;
      }
      await ctx.sleep(600);
    },
  });
})();
