/* ==========================================================================
   LT.kino – „Flos Kino“: kurze Erklärfilme mit anschließendem Quiz.

   - Die Insel 'kino' (grade: 1, Schul-Reihe der Weltkarte) wird hier zur
     Laufzeit angelegt (Muster wie js/games/wissen/_shared.js).
   - Jeder Film aus LT.films (js/data/films.js) wird als eigenes Spiel
     'film-<id>' registriert: area 'kino', type 'single', levels 1.
     So kann Flos Reise Filme als Stationen einbauen und der Lernstand
     zeigt die Quizfragen (ctx.track) wie bei jedem anderen Spiel.
   - Ablauf: Plakat mit großem ▶ (Kind tippt selbst – Autoplay mit Ton ist
     blockiert) → Film in großem, abgerundetem <video> mit eigener Leiste
     (Pause, Nochmal, Weiter ab 80 %) → Quiz mit ctx.choices und Hilfe-Leiter
     (Erklärung → Denkanstoß → Musterlösung), „Nochmal ansehen“ springt zur
     passenden Stelle (quiz[i].at) → „Jetzt üben“ mit den passenden Spielen.
   - Fehlt die Videodatei, erscheint „Dieser Film kommt bald“ und das Quiz
     geht trotzdem. Im Testmodus (LT.config.test) wird nichts abgespielt
     und es werden keine Medien geladen.
   Alle gesprochenen Sätze sind feste Texte (Zahlen als Wörter).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  const AREA = 'kino';
  if (LT.areas && !LT.areas.find((a) => a.id === AREA)) {
    LT.areas.push({
      id: AREA,
      grade: 1,
      title: 'Flos Kino',
      icon: '🎬',
      deco: ['🍿', '🎞️', '⭐', '🎟️'],
      color: '#c2255c',
      soft: '#ffdeeb',
      hello: 'Willkommen in Flos Kino! Hier schauen wir kurze Erklärfilme. Danach habe ich ein paar Fragen für dich.',
      parent:
        'Kurze Erklärfilme (ein bis zwei Minuten) mit Fuchs Flo zu Kernthemen der ersten Klasse: Zehner und Einer, Zehnerübergang, Verdoppeln, Uhrzeit, Geld, Silben, Wörter schreiben, Sätze, Schulweg, Natur und Gesundheit. Nach jedem Film folgen drei Fragen mit gestuften Hilfen; danach schlägt Flo das passende Übungsspiel vor. Erst erklären lassen, dann selbst üben – so wird aus dem Zuschauen Lernen.',
      games: [],
    });
  }

  const SUBJECTS = {
    mathe1: { label: 'Rechnen', icon: '🧮', color: '#e8590c' },
    deutsch1: { label: 'Lesen und Schreiben', icon: '📚', color: '#5f3dc4' },
    sach1: { label: 'Sachkunde', icon: '🔬', color: '#2b8a3e' },
  };

  const SAY = {
    tapPlay: 'Tippe auf den großen Knopf, dann geht der Film los!',
    soon: 'Dieser Film kommt bald. Die Fragen kannst du aber schon beantworten!',
    quizStart: 'Jetzt habe ich ein paar Fragen zum Film.',
    rewatchHint: 'Wenn du magst, schau dir die Stelle im Film nochmal an.',
    done: 'Super! Du hast den Film geschaut und alle Fragen beantwortet.',
    practice: 'Willst du es jetzt selbst üben? Tippe auf ein Spiel!',
    reise: 'Super! Weiter geht unsere Reise.',
    paused: 'Der Film macht eine Pause. Tippe auf Weiter, wenn du bereit bist.',
  };

  const K = { SAY, SUBJECTS, pending: null };
  const gameId = (film) => 'film-' + film.id;

  function fmtDur(s) {
    s = Math.max(0, Math.round(Number(s) || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  const isText = (t) => /[A-Za-z0-9ÄÖÜäöüß€]/.test(String(t));

  function watched(film) {
    const rec = LT.progress.profile.games[gameId(film)];
    return !!(rec && rec.rounds > 0);
  }
  K.watched = watched;
  K.list = () => (LT.films || []).filter((f) => f && f.id && LT.games[gameId(f)]);
  K.byId = (id) => (LT.films || []).find((f) => f.id === id) || null;

  /* ------------------------------------------------------------------
     Registrierung
     ------------------------------------------------------------------ */
  function register(film) {
    if (!film || !film.id) return;
    const id = gameId(film);
    if (LT.games[id]) return;
    film.quiz = Array.isArray(film.quiz) ? film.quiz.filter((q) => q && q.q && Array.isArray(q.options) && q.options.length >= 2) : [];
    film.related = Array.isArray(film.related) ? film.related : [];
    const subj = SUBJECTS[film.subject] || { label: 'Erklärfilm' };
    LT.registerGame({
      id,
      area: AREA,
      title: film.title,
      icon: film.icon || '🎬',
      levels: 1,
      type: 'single',
      film,
      parent: {
        skill: 'Erklärfilm – ' + subj.label,
        goal: film.parent || '',
        levels: [`Film ansehen (${fmtDur(film.duration)} Min.) und ${film.quiz.length} Fragen beantworten`],
        tip: 'Schauen Sie den Film gemeinsam an und bitten Sie Ihr Kind, Ihnen den Trick danach mit eigenen Worten zu erklären.',
      },
      play: (ctx) => playFilm(ctx, film),
    });
  }
  (LT.films || []).forEach(register);
  K.register = register;

  /* ------------------------------------------------------------------
     Plakat (Bild oder großes Symbol als Ersatz)
     ------------------------------------------------------------------ */
  function posterNode(film, cls) {
    const subj = SUBJECTS[film.subject] || { color: '#c2255c' };
    const box = el('div.kino-poster' + (cls ? '.' + cls : ''), { style: { '--film': subj.color } },
      U.emoji(film.icon || '🎬', 'kino-poster-icon'));
    if (film.poster && !LT.config.test) {
      const img = el('img.kino-poster-img', { alt: '', attrs: { loading: 'lazy', decoding: 'async' } });
      img.addEventListener('error', () => img.remove());
      img.addEventListener('load', () => box.classList.add('has-img'));
      img.src = film.poster;
      box.appendChild(img);
    }
    return box;
  }

  /* ------------------------------------------------------------------
     Das Film-Spiel
     ------------------------------------------------------------------ */
  async function playFilm(ctx, film) {
    K.pending = null;
    const test = !!LT.config.test;
    const fromReise = !!(LT.app && LT.app.gameFrom === 'reise');
    ctx.stage.classList.add('kino-stage');
    const player = el('div.kino-player');
    const screen = el('div.kino-screen');
    const bar = el('div.kino-bar');
    player.append(screen, bar);
    ctx.stage.appendChild(player);
    ctx.stage.appendChild(el('h2.kino-title', film.title));

    let video = null;
    let videoOk = !test && !!film.src;
    let maxSeen = 0;
    const mascot = (hidden) => LT.ui.setMascot({ big: false, hidden });

    if (videoOk) {
      video = el('video.kino-video', { attrs: { playsinline: '', 'webkit-playsinline': '', preload: 'metadata', disablepictureinpicture: '' } });
      video.playsInline = true;
      video.controls = false;
      ctx.listen(video, 'error', () => { videoOk = false; player.classList.add('is-missing'); });
      ctx.listen(video, 'timeupdate', () => { if (video.currentTime > maxSeen) maxSeen = video.currentTime; });
      ctx.listen(video, 'play', () => { LT.speech.stop(); player.classList.add('is-playing'); mascot(true); });
      ctx.listen(video, 'pause', () => { player.classList.remove('is-playing'); });
      ctx.onCleanup(() => { try { video.pause(); video.removeAttribute('src'); video.load(); } catch (e) { /* egal */ } });
      video.src = film.src;
    }
    const seenShare = () => {
      const d = video && isFinite(video.duration) && video.duration > 0 ? video.duration : film.duration || 0;
      return d ? maxSeen / d : 0;
    };

    /* ---- 1) Plakat mit großem Play-Knopf ---- */
    const showSoon = (onGo) => {
      U.clear(screen);
      U.clear(bar);
      screen.appendChild(
        el('div.kino-soon',
          U.emoji('🎞️', 'kino-soon-icon'),
          el('p', el('b', 'Dieser Film kommt bald!')),
          el('p', 'Die Fragen kannst du schon beantworten.')
        )
      );
      const go = LT.ui.button('Zu den Fragen', onGo, { icon: '❓', cls: 'btn-primary', big: true });
      ctx.markTest(go);
      bar.appendChild(go);
      ctx.instruct(SAY.soon);
    };

    if (test) {
      screen.appendChild(posterNode(film, 'is-big'));
      await ctx.say(film.intro || '');
      if (!ctx.active) return;
    } else {
      const choice = await new Promise((resolve) => {
        const playBtn = el('button.kino-play', { type: 'button', 'aria-label': 'Film starten', title: 'Film starten', on: { click: () => resolve('play') } }, el('span.kino-play-tri', '▶'));
        const poster = posterNode(film, 'is-big');
        screen.append(poster, playBtn);
        if (video) {
          screen.appendChild(video);
          if (!videoOk) showSoon(() => resolve('missing'));
          else ctx.listen(video, 'error', () => showSoon(() => resolve('missing')));
        }
        ctx.instruct(film.intro ? film.intro + ' ' + SAY.tapPlay : SAY.tapPlay);
      });
      if (!ctx.active) return;
      if (choice === 'play' && videoOk) {
        await watchFilm();
        if (!ctx.active) return;
      }
    }

    /* ---- 2) Film ansehen ---- */
    function watchFilm() {
      return new Promise((resolve) => {
        LT.speech.stop();
        ctx.setInstruction(SAY.paused);
        player.classList.add('is-watching');
        U.clear(bar);
        const pauseBtn = LT.ui.button('Pause', () => {
          if (video.paused) video.play().catch(() => {});
          else video.pause();
        }, { icon: '⏸️', cls: 'kino-btn kino-pause', big: true });
        const replayBtn = LT.ui.button('Nochmal', () => { video.currentTime = 0; video.play().catch(() => {}); }, { icon: '🔁', cls: 'kino-btn', big: true });
        const nextBtn = LT.ui.button('Weiter', () => finish(), { icon: '➡️', cls: 'kino-btn btn-green kino-next', big: true });
        nextBtn.style.display = 'none';
        bar.append(pauseBtn, replayBtn, nextBtn);
        const syncPause = () => {
          const paused = video.paused;
          pauseBtn.querySelector('.emoji').textContent = paused ? '▶️' : '⏸️';
          pauseBtn.querySelector('span:not(.emoji)').textContent = paused ? 'Weiter schauen' : 'Pause';
        };
        ctx.listen(video, 'play', syncPause);
        ctx.listen(video, 'pause', syncPause);
        ctx.listen(video, 'timeupdate', () => { if (seenShare() >= 0.8) nextBtn.style.display = ''; });
        ctx.listen(video, 'ended', () => finish());
        ctx.listen(video, 'error', () => finish());
        // Tippen auf das Bild = Pause/Weiter
        ctx.listen(video, 'click', () => pauseBtn.click());
        let done = false;
        function finish() {
          if (done) return;
          done = true;
          try { video.pause(); } catch (e) { /* egal */ }
          player.classList.remove('is-watching');
          mascot(false);
          resolve();
        }
        video.play().catch(() => {
          // Wiedergabe verweigert (z. B. Datei fehlt): freundlich weiter
          if (!videoOk) finish();
          else syncPause();
        });
      });
    }

    /* ---- 3) Quiz ---- */
    const quiz = film.quiz || [];
    let firstTry = 0;
    if (quiz.length) {
      player.classList.add('is-mini');
      U.clear(screen);
      U.clear(bar);
      if (videoOk && video) {
        screen.appendChild(video);
        const pause = LT.ui.button('Pause', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); }, { icon: '⏯️', cls: 'kino-btn' });
        const close = LT.ui.button('Zur Frage', () => { video.pause(); player.classList.remove('is-rewatch'); mascot(false); }, { icon: '❓', cls: 'kino-btn' });
        bar.append(pause, close);
        ctx.listen(video, 'ended', () => { player.classList.remove('is-rewatch'); mascot(false); });
      }
      const quizBox = el('div.kino-quiz');
      ctx.stage.appendChild(quizBox);
      const head = el('div.kino-q-head');
      const qText = el('p.kino-q');
      const prompt = el('div.prompt-box.kino-prompt', head, qText);
      const box = el('div.choices.kino-choices');
      const tools = el('div.kino-tools');
      quizBox.append(prompt, box, tools);
      qText.textContent = SAY.quizStart;
      await ctx.say(SAY.quizStart);
      if (!ctx.active) return;
      for (let i = 0; i < quiz.length; i++) {
        const item = quiz[i];
        U.clear(head);
        for (let k = 0; k < quiz.length; k++) head.appendChild(el('i' + (k < i ? '.done' : k === i ? '.now' : '')));
        head.appendChild(el('span', `Frage ${i + 1} von ${quiz.length}`));
        qText.textContent = item.q;
        U.clear(box);
        box.classList.remove('locked');
        U.clear(tools);
        if (videoOk && video) {
          tools.appendChild(LT.ui.button('Nochmal ansehen', () => {
            LT.speech.stop();
            player.classList.add('is-rewatch');
            mascot(true);
            try { video.currentTime = Math.max(0, Number(item.at) || 0); } catch (e) { /* egal */ }
            video.play().catch(() => {});
          }, { icon: '🎬', cls: 'kino-rewatch' }));
        }
        await ctx.instruct(item.q);
        if (!ctx.active) return;
        const before = ctx.wrongCount;
        const opts = item.options.map((o) => ({
          content: String(o.text),
          text: isText(o.text),
          say: o.say || String(o.text),
          correct: !!o.correct,
          fontSize: isText(o.text) && String(o.text).length > 6 ? 'clamp(18px, 3.4vmin, 28px)' : undefined,
        }));
        const many = opts.length >= 4;
        await ctx.choices(opts, {
          container: box,
          size: opts.some((o) => o.text && o.content.length > 6) ? 'wide' : 'large',
          sayButton: opts.some((o) => o.text && o.content.length > 3),
          hintAfter: many ? 2 : 1,
          explain: () => item.explain || 'Schau nochmal genau hin.',
          hintSay: many ? () => item.hint || 'Eine Antwort habe ich weggenommen. Überleg nochmal!' : undefined,
          modelSay: () => (item.model ? item.model + ' Tipp es an!' : 'Schau, das hier ist richtig. Tipp es an!'),
          onCorrect: () => { if (video) { video.pause(); player.classList.remove('is-rewatch'); mascot(false); } },
        });
        if (!ctx.active) return;
        const ok = ctx.wrongCount === before;
        if (ok) firstTry++;
        ctx.track(film.id + ': ' + (item.key || String(item.q).slice(0, 28)), ok);
        await ctx.sleep(400);
        if (!ctx.active) return;
      }
      quizBox.remove();
    }

    /* ---- 4) Jetzt üben ---- */
    player.classList.add('is-mini');
    const end = el('div.kino-end.prompt-box');
    const related = fromReise ? [] : film.related.filter((g) => LT.games[g]);
    end.appendChild(el('p.kino-end-title', U.emoji('🎉'), ' Film geschafft!'));
    const row = el('div.kino-practice');
    const finished = new Promise((resolve) => {
      related.slice(0, 3).forEach((g) => {
        const d = LT.games[g];
        row.appendChild(
          el('button.card-btn.kino-practice-btn', {
            type: 'button',
            'aria-label': 'Jetzt üben: ' + d.title,
            on: { click: () => { LT.sfx.play('click'); K.pending = g; resolve(); } },
          }, U.emoji(d.icon, 'kino-practice-icon'), el('span', el('small', 'Jetzt üben:'), el('b', d.title)))
        );
      });
      const fin = LT.ui.button(fromReise ? 'Weiter' : 'Fertig', () => resolve(), { icon: '✅', cls: 'btn-green', big: true });
      ctx.markTest(fin);
      if (related.length) end.appendChild(row);
      end.appendChild(el('div.actions', fin));
    });
    ctx.stage.appendChild(end);
    ctx.setInstruction(related.length ? SAY.practice : SAY.done);
    ctx.say(quiz.length ? (related.length ? SAY.done + ' ' + SAY.practice : SAY.done) : (fromReise ? SAY.reise : SAY.practice));
    await finished;
    if (!ctx.active) return;
    LT.speech.stop();
    return { score: quiz.length ? firstTry / quiz.length : 1 };
  }

  /** Von app.js beim Verlassen eines Films: gewähltes Übungsspiel (einmalig). */
  K.takePractice = function () {
    const g = K.pending;
    K.pending = null;
    return g && LT.games[g] ? g : null;
  };

  /* ------------------------------------------------------------------
     Kino-Insel: Filme als Kinokarten
     ------------------------------------------------------------------ */
  K.renderIsland = function (content, { onPlay } = {}) {
    const films = K.list();
    const seen = films.filter(watched).length;
    content.appendChild(
      el('div.kino-head',
        U.emoji('🍿', 'kino-head-icon'),
        el('div',
          el('h2', 'Heute im Kino'),
          el('p', films.length ? `${seen} von ${films.length} Filmen gesehen` : 'Die Filme kommen bald!')
        )
      )
    );
    const groups = {};
    films.forEach((f) => { (groups[f.subject] = groups[f.subject] || []).push(f); });
    const order = Object.keys(SUBJECTS).concat(Object.keys(groups).filter((k) => !SUBJECTS[k]));
    order.forEach((subject) => {
      const list = groups[subject];
      if (!list || !list.length) return;
      const s = SUBJECTS[subject] || { label: 'Filme', icon: '🎬', color: '#c2255c' };
      const row = el('div.kino-tickets');
      list.forEach((f) => {
        const isSeen = watched(f);
        const t = el('button.kino-ticket' + (isSeen ? '.seen' : ''), {
          type: 'button',
          'aria-label': f.title + (isSeen ? ' – schon gesehen' : ''),
          title: f.title,
          style: { '--film': s.color },
          on: { click: () => { LT.sfx.play('click'); if (onPlay) onPlay(gameId(f)); } },
        },
          posterNode(f),
          el('span.kino-ticket-body',
            el('span.kino-ticket-title', f.title),
            el('span.kino-ticket-meta', U.emoji('⏱️'), ` ${fmtDur(f.duration)}`)
          ),
          el('span.kino-ticket-stub', { 'aria-hidden': 'true' }, isSeen ? '✓' : '▶'),
          isSeen ? el('span.kino-seen', 'Gesehen') : null
        );
        row.appendChild(t);
      });
      content.appendChild(el('section.kino-group', el('h3', U.emoji(s.icon), ' ', s.label), row));
    });
  };

  /** Alle festen Sätze (für das Einsammeln der Sprachaufnahmen). */
  K.speechTexts = function () {
    const out = Object.values(SAY);
    (LT.films || []).forEach((f) => {
      if (f.intro) out.push(f.intro, f.intro + ' ' + SAY.tapPlay);
      (f.quiz || []).forEach((q) => {
        out.push(q.q, q.explain, q.hint, q.model, q.model ? q.model + ' Tipp es an!' : null);
        (q.options || []).forEach((o) => out.push(o.say || String(o.text)));
      });
    });
    out.push(SAY.done + ' ' + SAY.practice, 'Eine Antwort habe ich weggenommen. Überleg nochmal!', 'Schau nochmal genau hin.');
    return Array.from(new Set(out.filter(Boolean)));
  };

  LT.kino = K;
})();
