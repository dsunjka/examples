/* ==========================================================================
   LT.engine – Spiel-Registrierung und Rundenablauf.

   ---------------------------------------------------------------
   SPIEL-SCHNITTSTELLE (für alle Spiele in js/games/**)
   ---------------------------------------------------------------
   LT.registerGame({
     id: 'zaehlen',              // eindeutig, a-z0-9-
     area: 'zahlen',             // zahlen | sprache | formen | denken | welt | werkstatt
     title: 'Wie viele?',        // kurzer, kindgerechter Titel
     icon: '🍎',                 // Emoji für die Spielkarte
     levels: 4,                  // Anzahl Schwierigkeitsstufen (1..n)
     rounds: 5,                  // Aufgaben pro Runde (nur type 'tasks', Standard 5)
     type: 'tasks',              // 'tasks' (Standard) | 'single' | 'free'
     intro: 'Zähle die Dinge!',  // (optional) einmal zu Rundenbeginn vorgelesen
     parent: {                   // Infos für den Elternbereich
       skill: 'Zählen & Mengen erfassen',
       goal: 'Was das Kind hier lernt …',
       levels: ['Stufe 1: …', 'Stufe 2: …'],
       tip: 'Idee für den Alltag …',
     },
     // type 'tasks':  wird für jede Aufgabe aufgerufen; Promise auflösen, wenn die Aufgabe fertig ist.
     async task(ctx) { … },
     // type 'single' | 'free': wird einmal aufgerufen; Promise auflösen, wenn das Spiel fertig ist.
     //   Rückgabe optional { score: 0..1 }  (sonst aus ctx.correct/ctx.wrong berechnet)
     async play(ctx) { … },
   });

   ctx (Kontext je Aufgabe):
     ctx.stage           – leeres <div class="stage">, hier wird gezeichnet
     ctx.level           – aktuelle Stufe (1..levels), ctx.maxLevel
     ctx.index/ctx.total – Nummer der Aufgabe in der Runde (0-basiert) / Anzahl
     ctx.name            – Name des Kindes ('' wenn nicht gesetzt)
     ctx.util, ctx.ui, ctx.sfx, ctx.lex (Bild-Wort-Lexikon), ctx.el (= util.el)
     ctx.say(text)       – vorlesen (Promise)
     ctx.instruct(text)  – vorlesen UND als „Nochmal hören“-Text merken (🔊-Knopf / Flo antippen)
     ctx.setInstruction(text) – nur merken
     ctx.correct(node?, {say, praise:false}) – positives Feedback (Ton, Animation, Lob). Promise.
     ctx.wrong(node?, {say, keep})           – sanftes Feedback (keep: Kachel bleibt bedienbar), zählt Fehlversuch. Promise<Anzahl Fehler>.
     ctx.hint(node)      – Element pulsierend hervorheben (Hilfestellung)
     ctx.choices(items, opts) – Auswahl-Kacheln (siehe unten). Promise<gewähltes richtiges Item>.
     ctx.sleep(ms)       – warten (im Testmodus verkürzt)
     ctx.active          – false, sobald das Kind das Spiel verlassen hat → Schleifen/Timer beenden!
     ctx.onCleanup(fn), ctx.timeout(fn, ms), ctx.interval(fn, ms), ctx.listen(target, ev, fn)
     ctx.wrongCount      – Fehlversuche in dieser Aufgabe
     ctx.testSolve(fn)   – Auto-Löser für den Testmodus registrieren (für Spiele ohne ctx.choices)
     ctx.markTest(node)  – im Testmodus Element als „als Nächstes antippen“ markieren

   ctx.choices(items, opts)
     items: [{ content: '🍎' | Node, correct: true|false, say: 'Apfel', label, text: true, value }]
     opts:  { columns, size: 'small'|'large'|'wide', container (Standard: neue .choices in stage),
              nameFirst: true  → Flo zeigt vorher auf jede Kachel und nennt das Wort (item.say),
              sayButton: true  → kleiner 🔊-Knopf auf jeder Kachel,
              hintAfter: 2     → nach so vielen Fehlversuchen wird die Lösung hervorgehoben,
              shuffle: true, praise, correctSay, wrongSay, hintSay,
              onWrong: async (item, tile, wrongCount) => {…}  – nach dem Fehler-Feedback, Eingabe solange gesperrt,
              onCorrect(item, tile) }
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  LT.games = LT.games || {};
  LT.gameOrder = LT.gameOrder || [];

  LT.registerGame = function (def) {
    if (!def || !def.id) throw new Error('registerGame: id fehlt');
    def.levels = def.levels || 1;
    def.type = def.type || 'tasks';
    def.rounds = def.rounds || 5;
    if (LT.games[def.id]) console.warn('Spiel doppelt registriert:', def.id);
    LT.games[def.id] = def;
    LT.gameOrder.push(def.id);
    return def;
  };

  const E = { current: null };

  function stopCurrent() {
    const s = E.current;
    if (!s) return;
    s.aborted = true;
    for (const fn of s.cleanups.splice(0)) {
      try { fn(); } catch (e) { console.error(e); }
    }
    LT.speech.stop();
    E.current = null;
    if (LT.test) LT.test.solver = null;
  }
  E.stop = stopCurrent;

  /**
   * Spiel starten.
   * opts: { level (erzwingen), onExit(result|null), onAgain, exitLabel }
   */
  E.start = function (gameId, opts = {}) {
    const def = LT.games[gameId];
    if (!def) {
      LT.ui.toast('Dieses Spiel gibt es noch nicht.');
      return;
    }
    stopCurrent();
    const rec = LT.progress.game(gameId);
    const level = U.clamp(opts.level || rec.level || 1, 1, def.levels);
    const session = {
      id: gameId,
      def,
      level,
      aborted: false,
      cleanups: [],
      results: [],
      stats: { correct: 0, wrong: 0 },
      instruction: '',
      startedAt: Date.now(),
      opts,
    };
    E.current = session;

    const area = LT.areaById(def.area);
    const total = def.type === 'tasks' ? def.rounds : 0;
    const dots = el('div.dots', { 'aria-hidden': 'true' });
    for (let i = 0; i < total; i++) dots.appendChild(el('i.dot'));
    const replayBtn = LT.ui.speakButton(() => session.instruction, { cls: 'replay' });
    const { screen } = LT.ui.screen({
      area,
      className: 'game-screen game-' + gameId,
      title: def.title,
      icon: def.icon,
      onBack: () => exit(session, null),
      backIcon: '⬅️',
      right: [total ? dots : null, replayBtn],
    });
    const stage = el('div.stage');
    screen.appendChild(stage);
    session.stage = stage;
    session.dots = dots;
    LT.ui.setMascot({ big: false, hidden: false });
    LT.ui.onMascotTap = () => session.instruction && LT.speech.say(session.instruction);

    run(session).catch((err) => {
      console.error('Fehler im Spiel', gameId, err);
      if (!session.aborted) {
        LT.ui.toast('Hoppla! Da ist etwas schiefgelaufen.');
        exit(session, null);
      }
    });
    return session;
  };

  function exit(session, result) {
    if (E.current !== session) return;
    stopCurrent();
    const cb = session.opts.onExit;
    if (cb) cb(result);
    else if (LT.app) LT.app.showArea(session.def.area);
  }

  function makeCtx(session, index, total) {
    const def = session.def;
    let wrongCount = 0;
    let correctCount = 0;
    const stage = session.stage;
    U.clear(stage);
    stage.className = 'stage';
    stage.removeAttribute('style');

    const guard = (p) => p; // Platzhalter für spätere Erweiterungen
    const ctx = {
      def,
      id: def.id,
      level: session.level,
      maxLevel: def.levels,
      index,
      total,
      stage,
      el,
      util: U,
      ui: LT.ui,
      sfx: LT.sfx,
      lex: LT.lexikon,
      get name() { return LT.progress.name(); },
      get active() { return !session.aborted && E.current === session; },
      get wrongCount() { return wrongCount; },
      get correctCount() { return correctCount; },
      // Wartet; wird das Spiel verlassen, löst die Wartezeit nie mehr auf (nachfolgender Code läuft nicht weiter)
      sleep: (ms) => new Promise((res) => {
        if (session.aborted) return;
        const t = setTimeout(res, Math.max(0, ms * LT.config.speed));
        session.cleanups.push(() => clearTimeout(t));
      }),
      say(text, opts) {
        if (session.aborted) return Promise.resolve();
        return guard(LT.speech.say(text, opts));
      },
      setInstruction(text) { session.instruction = text; },
      instruct(text, opts) {
        session.instruction = text;
        return ctx.say(text, opts);
      },
      async correct(node, o = {}) {
        if (session.aborted) return;
        correctCount++;
        session.stats.correct++;
        LT.sfx.play('correct');
        LT.ui.cheer();
        if (node && node.classList) {
          if (node.classList.contains('tile')) node.classList.add('is-correct');
          else LT.ui.animate(node, 'joy');
          LT.ui.flyStar(node);
        }
        const text = o.say || (o.praise === false ? '' : LT.ui.praise());
        if (text) await ctx.say(text);
        else await U.sleep(500);
        await U.sleep(o.pause == null ? 250 : o.pause);
      },
      async wrong(node, o = {}) {
        if (session.aborted) return wrongCount;
        wrongCount++;
        session.stats.wrong++;
        LT.sfx.play('wrong');
        LT.ui.think();
        if (node && node.classList) {
          if (!o.keep && node.classList.contains('tile')) node.classList.add('is-wrong');
          else LT.ui.animate(node, 'shake');
        }
        const text = o.say === undefined ? LT.ui.encourage() : o.say;
        if (text) await ctx.say(text);
        return wrongCount;
      },
      hint(node) {
        if (!node || !node.classList) return;
        node.classList.add(node.classList.contains('tile') ? 'is-hint' : 'hint-glow');
      },
      unhint(node) {
        if (node && node.classList) node.classList.remove('is-hint', 'hint-glow');
      },
      onCleanup(fn) { session.cleanups.push(fn); },
      timeout(fn, ms) {
        const t = setTimeout(() => { if (!session.aborted) fn(); }, ms * LT.config.speed);
        session.cleanups.push(() => clearTimeout(t));
        return t;
      },
      interval(fn, ms) {
        const t = setInterval(() => { if (!session.aborted) fn(); }, ms * LT.config.speed);
        session.cleanups.push(() => clearInterval(t));
        return t;
      },
      listen(target, ev, fn, o) {
        target.addEventListener(ev, fn, o);
        session.cleanups.push(() => target.removeEventListener(ev, fn, o));
      },
      testSolve(fn) {
        if (LT.test) LT.test.solver = fn;
      },
      markTest(node, on = true) {
        if (!LT.config.test || !node) return;
        if (on) node.setAttribute('data-test-correct', '1');
        else node.removeAttribute('data-test-correct');
      },
      choices(items, opts) { return choices(ctx, session, items, opts || {}); },
    };
    return ctx;
  }

  /* ------------------------------------------------------------------
     Standard-Auswahl: Kacheln mit genau einer (oder mehreren) richtigen Antwort(en)
     ------------------------------------------------------------------ */
  function choices(ctx, session, items, opts) {
    return new Promise((resolve) => {
      const list = opts.shuffle === false ? items.slice() : U.shuffle(items);
      const box = opts.container || el('div.choices');
      if (opts.className) box.classList.add(...opts.className.split(' '));
      if (opts.columns) {
        box.style.display = 'grid';
        box.style.gridTemplateColumns = `repeat(${opts.columns}, auto)`;
        box.style.justifyContent = 'center';
      }
      if (!opts.container) ctx.stage.appendChild(box);
      const hintAfter = opts.hintAfter == null ? 2 : opts.hintAfter;
      let busy = !!opts.nameFirst;
      let finished = false;
      let localWrong = 0; // Fehler nur dieser Auswahl (für hintAfter)
      const tiles = list.map((item) => {
        const t = LT.ui.tile(item.content, {
          size: item.size || opts.size,
          className: item.className,
          say: item.say,
          sayButton: opts.sayButton,
          label: item.label,
          text: item.text,
          fontSize: item.fontSize || opts.fontSize,
          aria: item.aria,
        });
        t._item = item;
        if (item.correct) ctx.markTest(t);
        t.addEventListener('click', async () => {
          if (busy || finished || session.aborted) return;
          if (item.correct) {
            finished = true;
            box.classList.add('locked');
            tiles.forEach((x) => ctx.unhint(x));
            if (opts.onCorrect) opts.onCorrect(item, t);
            await ctx.correct(t, { say: typeof opts.correctSay === 'function' ? opts.correctSay(item) : opts.correctSay, praise: opts.praise });
            resolve(item);
          } else {
            busy = true;
            const n = await ctx.wrong(t, { say: typeof opts.wrongSay === 'function' ? opts.wrongSay(item) : opts.wrongSay });
            if (opts.onWrong) {
              try { await opts.onWrong(item, t, n); } catch (e) { console.error(e); }
            }
            busy = false;
            localWrong++;
            if (localWrong >= hintAfter) {
              const right = tiles.find((x) => x._item.correct);
              if (right) {
                ctx.hint(right);
                if (localWrong === hintAfter && opts.hintSay) ctx.say(typeof opts.hintSay === 'function' ? opts.hintSay(right._item) : opts.hintSay);
              }
            }
          }
        });
        box.appendChild(t);
        return t;
      });
      // Bilder benennen (wie im Kindergarten: „Das ist ein …“) bevor geantwortet wird
      if (opts.nameFirst) {
        (async () => {
          for (const t of tiles) {
            if (session.aborted) return;
            if (!t._item.say) continue;
            t.classList.add('speaking');
            await ctx.say(t._item.say, { interrupt: true });
            t.classList.remove('speaking');
            await U.sleep(120);
          }
          busy = false;
        })();
      }
      box._tiles = tiles;
    });
  }

  /* ------------------------------------------------------------------
     Rundenablauf
     ------------------------------------------------------------------ */
  async function run(session) {
    const def = session.def;
    if (def.intro) {
      session.instruction = def.intro;
    }
    let score = null;
    if (def.type === 'tasks') {
      const total = def.rounds;
      for (let i = 0; i < total; i++) {
        if (session.aborted) return;
        updateDots(session, i);
        const ctx = makeCtx(session, i, total);
        if (i === 0 && def.intro) await ctx.say(def.intro);
        if (session.aborted) return;
        await def.task(ctx);
        if (session.aborted) return;
        const firstTry = ctx.wrongCount === 0;
        session.results.push({ firstTry, wrong: ctx.wrongCount });
        LT.progress.recordTask(def.id, { firstTry, wrong: ctx.wrongCount });
        if (LT.test) LT.test.solver = null;
        markDot(session, i, firstTry);
        await U.sleep(300);
      }
      score = session.results.filter((r) => r.firstTry).length / total;
    } else {
      const ctx = makeCtx(session, 0, 1);
      if (def.intro) await ctx.say(def.intro);
      if (session.aborted) return;
      const res = (await def.play(ctx)) || {};
      if (session.aborted) return;
      if (LT.test) LT.test.solver = null;
      if (def.type === 'free') score = null;
      else if (typeof res.score === 'number') score = U.clamp(res.score, 0, 1);
      else {
        const { correct, wrong } = session.stats;
        score = correct + wrong ? correct / (correct + wrong) : 1;
      }
    }
    if (session.aborted) return;
    const seconds = (Date.now() - session.startedAt) / 1000;
    const result = LT.progress.finishRound(def.id, { score, adaptive: def.type !== 'free', seconds });
    result.score = score;
    result.gameId = def.id;
    LT.ui.bumpStars();
    if (LT.app && LT.app.onRoundFinished) LT.app.onRoundFinished(def.id, result);
    await showRoundEnd(session, result);
  }

  function updateDots(session, i) {
    const dots = session.dots ? Array.from(session.dots.children) : [];
    dots.forEach((d, k) => d.classList.toggle('current', k === i));
  }
  function markDot(session, i, firstTry) {
    const d = session.dots && session.dots.children[i];
    if (d) {
      d.classList.remove('current');
      d.classList.add('done');
      if (firstTry) d.classList.add('star');
    }
  }

  async function showRoundEnd(session, result) {
    const def = session.def;
    const name = LT.progress.name();
    LT.sfx.play('win');
    LT.ui.confetti(result.stars === 3 ? 110 : 60);
    LT.ui.cheer();

    // Freies Malen wird nicht bewertet: statt Sternen ein Malpinsel-Symbol
    const starsRow = def.type === 'free' ? el('div.round-stars.free', U.emoji('🎨'), U.emoji('🖼️'), U.emoji('✨')) : el('div.round-stars', [1, 2, 3].map(() => U.emoji('⭐')));
    let headline;
    if (def.type === 'free') headline = 'Fertig! Wunderschön!';
    else if (result.stars === 3) headline = name ? `Super, ${name}!` : 'Super gemacht!';
    else if (result.stars === 2) headline = 'Gut gemacht!';
    else headline = 'Toll, dass du drangeblieben bist!';

    const lines = [];
    if (result.levelChange > 0) lines.push(el('p', U.emoji('🚀'), ` Neue Stufe: ${result.levelAfter} von ${def.levels}!`));
    else if (result.levelAfter === def.levels && def.levels > 1 && result.stars === 3) lines.push(el('p', U.emoji('👑'), ' Höchste Stufe – du bist ein Profi!'));
    const stickerBox = el('div');
    const panel = [
      el('h2', headline),
      starsRow,
      ...lines,
      stickerBox,
      el('div.actions',
        LT.ui.button('Nochmal', () => { ov.remove(); E.start(def.id, session.opts); }, { icon: '🔁', cls: 'btn-primary', big: true }),
        LT.ui.button('Fertig', () => { ov.remove(); exit(session, result); }, { icon: '✅', big: true })
      ),
    ];
    const ov = LT.ui.overlay(panel, { className: 'round-end' });
    ov.dataset.test = 'round-end';
    const stars = starsRow.querySelectorAll('.emoji');
    if (def.type === 'free') starsRow.querySelectorAll('.emoji').forEach((s) => s.classList.add('on'));
    else for (let i = 0; i < result.stars; i++) {
      await U.sleep(350);
      stars[i].classList.add('on');
      LT.sfx.play('star');
    }
    let speech = headline + (result.stars === 3 && def.type !== 'free' ? ' Drei Sterne!' : '');
    if (result.levelChange > 0) {
      LT.sfx.play('levelup');
      speech += ' Jetzt wird es ein bisschen kniffliger!';
    } else if (result.levelChange < 0) {
      speech += ' Wir üben das nochmal etwas leichter.';
    }
    if (result.newStickers && result.newStickers.length) {
      const st = LT.stickerById(result.newStickers[result.newStickers.length - 1]);
      if (st) {
        stickerBox.appendChild(el('p', 'Neuer Sticker für dein Album:'));
        stickerBox.appendChild(el('span.sticker-reveal.emoji', st.e));
        LT.sfx.play('sticker');
        speech += ` Du hast einen neuen Sticker bekommen: ${st.name}!`;
      }
    }
    LT.speech.say(speech);
  }

  /* ------------------------------------------------------------------
     Test-Schnittstelle (nur für automatisierte Tests, ?test)
     ------------------------------------------------------------------ */
  if (LT.config.test) {
    LT.test = {
      solver: null,
      start(id, level) {
        return !!E.start(id, { level, onExit: () => {} });
      },
      solve() {
        if (typeof LT.test.solver === 'function') {
          const fn = LT.test.solver;
          try { fn(); } catch (e) { console.error('Test-Löser fehlgeschlagen', e); }
          return true;
        }
        return false;
      },
      state() {
        return {
          game: E.current && E.current.id,
          ended: !!document.querySelector('[data-test="round-end"]'),
          hasMark: !!document.querySelector('[data-test-correct]'),
          hasSolver: typeof LT.test.solver === 'function',
        };
      },
    };
  }

  LT.engine = E;
})();
