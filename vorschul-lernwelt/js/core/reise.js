/* ==========================================================================
   LT.reise – „Flos Reise“: ein schrittweiser Lernpfad durch acht Orte.

   Didaktik (Spiralcurriculum nach Bruner, Mastery-Lernpfad):
   - Jede Fähigkeit taucht zuerst auf der leichtesten Stufe auf und kommt in
     späteren Kapiteln auf höherer Stufe wieder (z. B. Zählen 1 → Zählen 2 →
     Mengen vergleichen → Zahlenhaus → Rechnen).
   - Jedes Kapitel mischt die Lernwelten (Zahlen, Sprache, Formen, Denken,
     Wissen, Malen) → verschachteltes Üben statt Block-Üben.
   - Eine Station gilt als geschafft, sobald eine Runde beendet ist (Dranbleiben
     zählt). So bleibt der Pfad angstfrei; die adaptive Stufe der Spiele sorgt
     weiter für die passende Schwierigkeit.
   - Kapitel-Einleitung und Schatzkisten-Geschichte geben einen roten Faden
     (narratives Lernen) und belohnen mit einem Bonus-Sticker.

   Fehlende Spiele (z. B. noch nicht vorhandene Forscherwelt-Reisen) werden
   einfach übersprungen. Gespeichert wird in LT.store('reise'):
     { done: { 'spiel@stufe': true }, chests: { kapitelId: true }, intros: { kapitelId: true } }

   ALLE gesprochenen Sätze sind feste Texte (vorab aufgenommene Stimme).
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;

  /* ------------------------------------------------------------------
     Kapitel und Stationen  [Spiel-ID, Stufe]
     ------------------------------------------------------------------ */
  const CHAPTERS = [
    {
      id: 'wald',
      title: 'Zauberwald',
      icon: '🌳',
      color: '#2f9e5f',
      soft: '#dcf5e4',
      deco: ['🍄', '🦉', '🌲', '🦔', '🍂', '🐿️'],
      intro: 'Wir sind im Zauberwald. Hier wohnen kluge Eulen und flinke Eichhörnchen. Hilf mir, die Rätsel zu lösen!',
      story: 'Hurra, du hast alle Rätsel im Zauberwald gelöst! Die kluge Eule ist sehr stolz auf dich. Sie schenkt dir einen glitzernden Schatz. Komm mit, wir wandern weiter zum Bauernhof!',
      focus: 'Erste Schritte: Zählen bis 5, Farben, Reime hören, Gefühle, Silben klatschen, Merken, Schwungübungen und die erste Wissensreise.',
      stations: [['zaehlen', 1], ['farben', 1], ['reime', 1], ['w-schmetterling', 1], ['memory', 1], ['gefuehle', 1], ['silben', 1], ['nachspuren', 1]],
    },
    {
      id: 'hof',
      title: 'Bauernhof',
      icon: '🚜',
      color: '#e07b24',
      soft: '#ffecd6',
      deco: ['🐄', '🐔', '🌻', '🐷', '🐑', '🌾'],
      intro: 'Wir sind auf dem Bauernhof. Hier leben Kühe, Hühner und viele Tierkinder. Die Bäuerin braucht heute deine Hilfe!',
      story: 'Toll, du hast der Bäuerin überall geholfen! Die Tiere sind satt und zufrieden. Als Dank bekommst du einen Schatz. Jetzt reisen wir weiter ans Meer!',
      focus: 'Mengen auf einen Blick, Anlaute, Grundformen, Klassifizieren, Raum-Lage-Begriffe, Zählen bis 10 sowie Tierkinder und Pflanzenwachstum.',
      stations: [['blitzblick', 1], ['w-tierkinder', 1], ['anlaut', 1], ['formen', 1], ['w-pflanzen', 1], ['passt-nicht', 1], ['raumlage', 1], ['zaehlen', 2]],
    },
    {
      id: 'meer',
      title: 'Meeresküste',
      icon: '🏖️',
      color: '#1a8fc4',
      soft: '#d6effb',
      deco: ['🐚', '🦀', '⛵', '🐬', '🌊', '🐠'],
      intro: 'Wir sind an der Meeresküste. Hier rauschen die Wellen und Krabben laufen über den Sand. Lass uns zusammen den Strand erforschen!',
      story: 'Wunderbar, du hast die ganze Küste erforscht! Ein freundlicher Delfin bringt dir eine Schatzkiste. Darin liegt ein Geschenk für dich. Am Horizont sehen wir schon hohe Berge!',
      focus: 'Mengen vergleichen, Reime auf Stufe 2, Muster fortsetzen, Ziffern erkennen, Figur-Grund-Wahrnehmung, Tier-Wissen und Lebensräume.',
      stations: [['mengen-vergleich', 1], ['reime', 2], ['w-lebensraeume', 1], ['muster', 1], ['tiere', 1], ['zahlen-erkennen', 1], ['schatten', 1]],
    },
    {
      id: 'berge',
      title: 'Berge',
      icon: '⛰️',
      color: '#6f5fd0',
      soft: '#e6e2ff',
      deco: ['🦅', '🌲', '🐐', '☁️', '🏔️', '🌼'],
      intro: 'Wir sind in den Bergen. Hier oben ist die Luft frisch und klar. Gemeinsam klettern wir bis zum Gipfel!',
      story: 'Juhu, wir sind auf dem Gipfel angekommen! Von hier oben kann man ganz weit sehen. Ein Adler hat dir einen Schatz gebracht. Dort unten glitzert schon der Sand der Wüste!',
      focus: 'Spirale: Blitzblick und Silben auf Stufe 2. Neu: Größen ordnen, Gegenteile, Kim-Spiel, Zahlenreihe sowie die fünf Sinne und das Wetter.',
      stations: [['blitzblick', 2], ['silben', 2], ['w-sinne', 1], ['groessen', 1], ['gegensaetze', 1], ['was-fehlt', 1], ['w-wetter', 1], ['zahlenreihe', 1]],
    },
    {
      id: 'wueste',
      title: 'Wüste',
      icon: '🏜️',
      color: '#c98a12',
      soft: '#fff0c9',
      deco: ['🐪', '🌵', '☀️', '🦎', '🌴', '🦂'],
      intro: 'Wir sind in der Wüste. Hier ist es heiß und sandig. Die Kamele zeigen uns den Weg zur Oase.',
      story: 'Geschafft, wir haben die Oase gefunden! Das Kamel freut sich über das frische Wasser. Im Sand hast du eine Schatzkiste entdeckt. Jetzt wird es kalt, wir reisen in die Eiswelt!',
      focus: 'Spirale: Ziffern, Anlaute und die Schmetterlings-Reise auf Stufe 2 (Fachbegriffe als Grundlage für die Experten-Stufe im Schloss). Neu: was in unserem Körper passiert, zeitliche Reihenfolgen, Dinosaurier, Zahlzerlegung und Punkte verbinden.',
      stations: [['zahlen-erkennen', 2], ['anlaut', 2], ['w-koerper-innen', 1], ['reihenfolge', 1], ['w-schmetterling', 2], ['w-dinos', 1], ['zahlenhaus', 1], ['punkte-verbinden', 1]],
    },
    {
      id: 'eis',
      title: 'Eiswelt',
      icon: '❄️',
      color: '#2aa3bd',
      soft: '#d8f4fa',
      deco: ['🐧', '❄️', '⛄', '🐋', '🧊', '🌨️'],
      intro: 'Wir sind in der Eiswelt. Hier ist alles weiß von Schnee und Eis. Die Pinguine wollen mit dir spielen!',
      story: 'Prima, die Pinguine sind begeistert von dir! Du hast alle Aufgaben im Schnee geschafft. Unter dem Eis wartet ein funkelnder Schatz. Jetzt fliegen wir mit einer Rakete ins Weltall!',
      focus: 'Spirale: Mengenvergleich auf Stufe 2. Neu: Jahreszeiten, Silben verbinden, Gesundheit, logisches Schließen, Umweltschutz, Verkehrserziehung und erstes Rechnen.',
      stations: [['mengen-vergleich', 2], ['jahreszeiten', 1], ['roboter', 1], ['w-gesund', 1], ['bilder-sudoku', 1], ['w-umwelt', 1], ['verkehr', 1], ['rechnen', 1]],
    },
    {
      id: 'weltall',
      title: 'Weltraum',
      icon: '🚀',
      color: '#3d3f9a',
      soft: '#e3e4ff',
      deco: ['🌙', '⭐', '🪐', '☄️', '🛰️', '✨'],
      intro: 'Wir sind im Weltraum. Hier funkeln die Sterne und die Erde ist ganz klein. Schnall dich an, die Sternenreise beginnt!',
      story: 'Super, du kennst dich jetzt im Weltraum aus! Wir haben Planeten und Sterne besucht. Ein Komet bringt dir einen Schatz. Nun landen wir beim Schloss des Wissens!',
      focus: 'Spirale: Zahlenreihe, Memory und Zahlenhaus auf Stufe 2. Neu: Buchstaben, Oberbegriffe, Tonfolgen merken, die Uhr und das Weltall.',
      stations: [['zahlenreihe', 2], ['buchstaben', 1], ['w-weltall', 1], ['memory', 2], ['oberbegriffe', 1], ['toene-merken', 1], ['uhr', 1], ['zahlenhaus', 2]],
    },
    {
      id: 'schloss',
      title: 'Schloss des Wissens',
      icon: '🏰',
      color: '#cf4a86',
      soft: '#ffe0ee',
      deco: ['👑', '📚', '🔭', '🎈', '🦄', '🎺'],
      intro: 'Wir sind am Schloss des Wissens. Hier warten die schwierigsten Rätsel der ganzen Reise. Du hast schon so viel gelernt, du schaffst das!',
      story: 'Hurra, du hast die ganze Reise geschafft! Im Schloss des Wissens feiern alle ein großes Fest. Du hast so viel gelernt und nie aufgegeben. Dafür bekommst du den größten Schatz!',
      focus: 'Meisterstufe: Helfer und Notruf, Rechnen, Buchstaben und Bilder-Sudoku auf Stufe 2, erstes Lesen sowie Vertiefungs-Stufen der Wissensreisen aus Kapitel 2 und 7 sowie die Experten-Stufe der Schmetterlings-Reise (Kapitel 1 Stufe 1, Kapitel 5 Stufe 2).',
      stations: [['w-helfer', 1], ['rechnen', 2], ['w-tierkinder', 2], ['buchstaben', 2], ['bilder-sudoku', 2], ['erstes-lesen', 1], ['w-weltall', 2], ['w-schmetterling', 3]],
    },
  ];

  /* ------------------------------------------------------------------
     Feste Sätze
     ------------------------------------------------------------------ */
  const SAY = {
    welcome: 'Das ist unsere große Reise! Tippe auf die leuchtende Station.',
    back: 'Weiter geht unsere Reise! Tippe auf die leuchtende Station.',
    hop: [
      'Super gemacht! Ich hüpfe schon zur nächsten Station.',
      'Toll, wieder eine Station geschafft! Weiter geht es!',
      'Prima! Komm mit, wir gehen weiter!',
      'Klasse! Siehst du, wie ich hüpfe? Auf zur nächsten Station!',
    ],
    tap: 'Tippe auf die leuchtende Station! Dort geht unsere Reise weiter.',
    locked: 'Diese Station ist noch verschlossen. Spiel zuerst die leuchtende Station!',
    veiled: 'Dieser Ort ist noch hinter den Wolken versteckt. Schaffe zuerst die Stationen davor!',
    chestLocked: 'Diese Schatzkiste öffnet sich, wenn du alle Stationen geschafft hast.',
    chestReady: 'Du hast alle Stationen geschafft! Tippe auf die Schatzkiste!',
    chestOpened: 'Diese Schatzkiste hast du schon geöffnet.',
    sticker: 'Du bekommst einen Bonus-Sticker für dein Album!',
    stickerFull: 'Du hast schon alle Sticker gesammelt! Du bist ein Superstar!',
    reveal: 'Schau mal, ein neuer Ort ist aufgetaucht!',
    finished: 'Du hast die ganze Reise geschafft! Du kannst jede Station nochmal spielen.',
    replay: 'Das hast du schon geschafft. Wir spielen es gerne nochmal!',
  };

  /* ------------------------------------------------------------------
     Zustand
     ------------------------------------------------------------------ */
  function load() {
    const s = LT.store.get('reise', null);
    const st = s && typeof s === 'object' ? s : {};
    st.done = st.done || {};
    st.chests = st.chests || {};
    st.intros = st.intros || {};
    return st;
  }
  let state = null;
  const S = () => state || (state = load());
  const save = () => LT.store.set('reise', S());

  const keyOf = (game, level) => game + '@' + level;

  /** Kapitel mit den vorhandenen Stationen (fehlende Spiele werden übersprungen). */
  function chapters() {
    return CHAPTERS.map((ch, index) => {
      const stations = ch.stations
        .filter(([g]) => LT.games[g] && LT.games[g].type !== 'free')
        .map(([g, lv]) => ({ game: g, level: U.clamp(lv, 1, LT.games[g].levels || 1), key: keyOf(g, lv), def: LT.games[g] }));
      return Object.assign({}, ch, { index, stations });
    }).filter((ch) => ch.stations.length);
  }

  /** Vollständige Lage der Reise: Status je Kapitel und Station. */
  function situation() {
    const st = S();
    const chs = chapters();
    let current = null; // { chapter, station | 'chest' }
    chs.forEach((ch, i) => {
      ch.unlocked = i === 0 || !!st.chests[chs[i - 1].id];
      ch.opened = !!st.chests[ch.id];
      ch.doneCount = ch.stations.filter((s) => st.done[s.key]).length;
      ch.complete = ch.doneCount === ch.stations.length;
      const firstOpen = ch.stations.findIndex((s) => !st.done[s.key]);
      ch.stations.forEach((s, k) => {
        if (st.done[s.key]) s.state = 'done';
        else if (!ch.unlocked) s.state = 'locked';
        else if (ch.opened) s.state = 'open'; // nachträglich hinzugekommenes Spiel in einem fertigen Kapitel
        else s.state = k === firstOpen ? 'current' : 'locked';
      });
      if (!current && ch.unlocked && !ch.opened) {
        ch.isCurrent = true;
        current = { chapter: ch, station: ch.complete ? 'chest' : ch.stations[firstOpen] };
      }
    });
    const all = chs.flatMap((c) => c.stations);
    return {
      chapters: chs,
      current,
      total: all.length,
      done: all.filter((s) => st.done[s.key]).length,
      finished: !current,
    };
  }

  /* ------------------------------------------------------------------
     Pfad-Geometrie: geschwungene Schlange
     ------------------------------------------------------------------ */
  const xAt = (i, phase) => 50 + 27 * Math.sin(i * 0.95 + phase);

  function buildPath(points) {
    // points in Einheiten: x 0..100, y 0..(n*100)
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const my = (y0 + y1) / 2;
      d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`;
    }
    return d;
  }

  /* ------------------------------------------------------------------
     Bildschirm
     ------------------------------------------------------------------ */
  const R = { chapters: CHAPTERS, SAY };
  let run = null; // laufende Station { key, chapterId }
  let justDone = null; // zuletzt geschaffte Station (für die Hüpf-Animation)
  let hint = SAY.tap;

  function stationNode(s, ch) {
    const area = LT.areaById(s.def.area);
    const pips = el('span.reise-pips', { 'aria-hidden': 'true' });
    for (let i = 0; i < Math.min(s.level, 5); i++) pips.appendChild(el('i'));
    const btn = el('button.reise-station.' + s.state, {
      type: 'button',
      'aria-label': s.def.title + (s.state === 'locked' ? ' – verschlossen' : ''),
      title: s.def.title,
      data: { key: s.key },
      style: { '--world': area ? area.color : ch.color },
      on: { click: () => onStation(s, btn) },
    },
      U.emoji(s.def.icon, 'reise-st-icon'),
      pips,
      s.state === 'locked' ? el('span.reise-lock.emoji', '🔒') : null,
      s.state === 'done' ? el('span.reise-check', '✓') : null
    );
    if (s.state === 'current' && LT.config.test) btn.setAttribute('data-test-station', '1');
    return btn;
  }

  function chapterNode(ch, sit) {
    const n = ch.stations.length;
    const phase = ch.index * 1.3;
    const sec = el('section.reise-chapter' + (ch.isCurrent ? '.is-current' : '') + (ch.opened ? '.is-opened' : '') + (ch.id === 'weltall' ? '.is-dark' : ''), {
      data: { chapter: ch.id },
      style: { '--ch': ch.color, '--ch-soft': ch.soft, '--rows': String(n + 1) },
    });
    sec.appendChild(
      el('header.reise-ch-head',
        el('span.reise-ch-num', String(ch.index + 1)),
        U.emoji(ch.icon, 'reise-ch-icon'),
        el('h2', ch.title),
        el('span.reise-ch-count', { 'aria-label': `${ch.doneCount} von ${n} Stationen` }, U.emoji(ch.opened ? '🏆' : '👣'), ` ${ch.doneCount}/${n}`)
      )
    );
    const path = el('div.reise-path');
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push([i === n ? 50 : xAt(i, phase), i * 100 + 50]);
    const svg = el('svg.reise-trail', { viewBox: `0 0 100 ${(n + 1) * 100}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    svg.appendChild(el('path.reise-trail-bg', { d: buildPath(pts) }));
    // geschaffter Teil des Weges
    const doneUntil = ch.stations.findIndex((s) => s.state !== 'done');
    const upto = doneUntil === -1 ? n : doneUntil;
    if (upto > 0) svg.appendChild(el('path.reise-trail-done', { d: buildPath(pts.slice(0, upto + 1)) }));
    path.appendChild(svg);

    // Deko am Wegesrand (gegenüber der Station)
    for (let i = 0; i <= n; i++) {
      if (i % 2 === 1 && i !== n) continue;
      const x = pts[i][0];
      const left = x > 50 ? 4 + ((i * 7) % 8) : 84 + ((i * 5) % 8);
      path.appendChild(el('span.reise-deco.emoji', { 'aria-hidden': 'true', style: { left: left + '%', top: `calc(var(--row) * ${i + 0.15})` } }, ch.deco[i % ch.deco.length]));
    }

    ch.stations.forEach((s, i) => {
      const node = stationNode(s, ch);
      node.style.left = pts[i][0] + '%';
      node.style.top = `calc(var(--row) * ${i + 0.5})`;
      path.appendChild(node);
    });

    // Schatzkiste am Kapitelende
    const chestState = ch.opened ? 'opened' : ch.complete ? 'ready' : 'locked';
    const chest = el('button.reise-chest.' + chestState, {
      type: 'button',
      'aria-label': 'Schatzkiste',
      title: 'Schatzkiste',
      style: { left: '50%', top: `calc(var(--row) * ${n + 0.5})` },
      on: { click: () => onChest(ch, chestState) },
    }, U.emoji(ch.opened ? '🎉' : '🎁'));
    if (chestState === 'ready' && LT.config.test) chest.setAttribute('data-test-station', '1');
    path.appendChild(chest);
    sec.appendChild(path);
    return sec;
  }

  function veiledNode(ch) {
    return el('section.reise-chapter.is-veiled', {
      data: { chapter: ch.id },
      style: { '--ch': ch.color, '--ch-soft': ch.soft },
      role: 'button',
      'aria-label': 'Verborgener Ort',
      on: { click: (e) => { LT.sfx.play('pop'); LT.ui.animate(e.currentTarget, 'shake'); LT.speech.say(SAY.veiled); } },
    },
      el('span.reise-ch-num', String(ch.index + 1)),
      el('div.reise-clouds', { 'aria-hidden': 'true' }, U.emoji('☁️'), U.emoji('❓'), U.emoji('☁️')),
      el('span.reise-veil-lock.emoji', { 'aria-hidden': 'true' }, '🔒')
    );
  }

  function finishNode() {
    return el('div.reise-goal', U.emoji('🏆', 'reise-goal-icon'), el('p', 'Ziel'));
  }

  /**
   * Reise-Bildschirm zeigen.
   * opts: { onBack }  (Standard: Weltkarte)
   */
  R.show = function (opts = {}) {
    const A = LT.app;
    if (A && A.gate && !A.gate(() => R.show(opts))) return;
    if (A) A.screen = 'reise';
    LT.engine.stop();
    const back = () => (opts.onBack || A.showHome)();
    const sit = situation();
    const replay = LT.ui.speakButton(() => hint, { cls: 'reise-replay' });
    const { screen } = LT.ui.screen({
      className: 'reise-screen',
      title: 'Flos Reise',
      icon: '🗺️',
      onBack: back,
      right: [LT.ui.starCounter(), replay],
    });
    screen.style.setProperty('--area', '#ef7d32');
    screen.style.setProperty('--area-soft', '#ffe6d3');
    LT.ui.setMascot({ hidden: true });
    LT.ui.onMascotTap = () => LT.speech.say(hint);

    const content = el('div.content.reise-content');
    screen.appendChild(content);

    // Fortschritt (nur Anzeige)
    const pct = sit.total ? Math.round((sit.done / sit.total) * 100) : 0;
    content.appendChild(
      el('div.reise-progress', { 'aria-label': `${sit.done} von ${sit.total} Stationen geschafft` },
        U.emoji('🦊'),
        el('div.reise-meter', el('i', { style: { width: pct + '%' } })),
        U.emoji('🏰'),
        el('span.reise-progress-num', `${sit.done}/${sit.total}`)
      )
    );

    const map = el('div.reise-map');
    content.appendChild(map);
    const later = [];
    sit.chapters.forEach((ch) => {
      if (ch.unlocked) map.appendChild(chapterNode(ch, sit));
      else if (!map.querySelector('.is-veiled')) map.appendChild(veiledNode(ch));
      else later.push(ch);
    });
    if (later.length) {
      map.appendChild(el('div.reise-later', later.map((ch) => el('button.reise-later-cloud', {
        type: 'button',
        'aria-label': 'Verborgener Ort',
        on: { click: (e) => { LT.sfx.play('pop'); LT.ui.animate(e.currentTarget, 'shake'); LT.speech.say(SAY.veiled); } },
      }, U.emoji('☁️'), el('span', String(ch.index + 1))))));
    }
    map.appendChild(finishNode());

    // Flo, die Reisefigur
    const flo = el('div.reise-flo', { html: LT.ui.floSVG(), role: 'button', 'aria-label': 'Flo', on: { click: () => { LT.sfx.play('pop'); LT.ui.animate(flo, 'reise-flo-joy'); LT.speech.say(hint); } } });
    map.appendChild(flo);

    const targetNode = () => {
      if (!sit.current) return map.querySelector('.reise-chapter:last-of-type .reise-chest') || map.querySelector('.reise-goal');
      if (sit.current.station === 'chest') return map.querySelector(`[data-chapter="${sit.current.chapter.id}"] .reise-chest`);
      return map.querySelector(`[data-key="${sit.current.station.key}"]`);
    };
    const fromNode = justDone ? map.querySelector(`[data-key="${justDone}"]`) : null;
    const hopped = justDone;
    justDone = null;

    const place = (node, animate) => {
      if (!node || !flo.isConnected) return;
      const m = map.getBoundingClientRect();
      const r = node.getBoundingClientRect();
      const fw = flo.offsetWidth;
      const fh = flo.offsetHeight;
      // Flo steht neben der Station – auf der Seite mit mehr Platz
      const cx = r.left - m.left + r.width / 2;
      const right = cx < m.width / 2;
      const x = right ? cx + r.width * 0.42 : cx - r.width * 0.42 - fw;
      const y = r.top - m.top + r.height / 2 - fh * 0.78;
      flo.classList.toggle('look-left', !right);
      const prev = flo._pos;
      flo._pos = { x, y };
      if (animate && prev && flo.animate) {
        const midX = (prev.x + x) / 2;
        const midY = Math.min(prev.y, y) - Math.max(60, Math.abs(prev.y - y) * 0.35);
        flo.animate(
          [
            { transform: `translate(${prev.x}px, ${prev.y}px)` },
            { transform: `translate(${midX}px, ${midY}px)`, offset: 0.5 },
            { transform: `translate(${x}px, ${y}px)` },
          ],
          { duration: LT.config.test ? 30 : 900, easing: 'ease-in-out' }
        );
      }
      flo.style.transform = `translate(${x}px, ${y}px)`;
    };

    const target = targetNode();
    requestAnimationFrame(() => {
      if (!flo.isConnected) return;
      if (fromNode && target && fromNode !== target) {
        place(fromNode, false);
        scrollTo(content, fromNode, false);
        setTimeout(() => {
          if (!flo.isConnected) return;
          LT.sfx.play('star');
          place(target, true);
          scrollTo(content, target, true);
        }, LT.config.test ? 20 : 650);
      } else {
        place(target, false);
        scrollTo(content, target, false);
      }
    });
    const onResize = () => { if (!flo.isConnected) { window.removeEventListener('resize', onResize); if (R._onResize === onResize) R._onResize = null; return; } place(targetNode(), false); };
    // Nur EIN Listener: den der vorigen Anzeige zuerst entfernen (sonst Speicherleck)
    if (R._onResize) window.removeEventListener('resize', R._onResize);
    R._onResize = onResize;
    window.addEventListener('resize', onResize);

    // Sprechen / Einleitung
    const cur = sit.current;
    if (!cur) hint = SAY.finished;
    else if (cur.station === 'chest') hint = SAY.chestReady;
    else hint = SAY.tap;

    const st = S();
    if (cur && !st.intros[cur.chapter.id]) {
      // Als gesehen gilt die Einleitung erst, wenn sie wirklich erscheint (siehe showIntro)
      setTimeout(() => { if (flo.isConnected) showIntro(cur.chapter, cur.chapter.index > 0); }, hopped ? 900 : 250);
    } else if (hopped) {
      LT.speech.say(cur && cur.station === 'chest' ? SAY.chestReady : U.pickFresh('reise-hop', SAY.hop, 2));
    } else if (!cur) {
      LT.speech.say(SAY.finished);
    } else if (cur.station === 'chest') {
      LT.speech.say(SAY.chestReady);
    } else {
      LT.speech.say(R._greeted ? SAY.back : SAY.welcome);
    }
    R._greeted = true;
  };

  function scrollTo(content, node, smooth) {
    if (!node) return;
    const c = content.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    const top = content.scrollTop + (r.top - c.top) - c.height * 0.45;
    try { content.scrollTo({ top: Math.max(0, top), behavior: smooth && !LT.config.test ? 'smooth' : 'auto' }); } catch (e) { content.scrollTop = Math.max(0, top); }
  }

  /* ------------------------------------------------------------------
     Interaktion
     ------------------------------------------------------------------ */
  function onStation(s, btn) {
    if (s.state === 'locked') {
      LT.sfx.play('wrong');
      LT.ui.animate(btn, 'shake');
      LT.speech.say(SAY.locked);
      return;
    }
    LT.sfx.play('click');
    if (s.state === 'done') {
      // Erst den Satz ausreden lassen, dann starten (sonst schneidet das Spiel ihn ab).
      // Wird die Ansage unterbrochen (anderes Antippen, Bildschirmwechsel), startet nichts.
      const p = LT.speech.say(SAY.replay);
      const tok = LT.speech._token;
      p.then(() => {
        if (LT.speech._token === tok && btn.isConnected && LT.app && LT.app.screen === 'reise') R.startStation(s);
      });
      return;
    }
    R.startStation(s);
  }

  /** Station starten (Spiel mit genau dieser Stufe). */
  R.startStation = function (s) {
    run = { key: s.key, game: s.game, level: s.level };
    const A = LT.app;
    if (!A || !A.startGame) return;
    A.startGame(s.game, { from: 'reise', level: s.level });
  };

  /** Von app.js nach jeder beendeten Runde aufgerufen. */
  R.onRoundFinished = function (gameId) {
    if (!run || run.game !== gameId) return;
    const st = S();
    if (!st.done[run.key]) {
      st.done[run.key] = true;
      justDone = run.key;
      save();
    }
  };
  /** Von app.js beim Verlassen eines Spiels aufgerufen, das aus der Reise kam. */
  R.onGameExit = function () {
    run = null;
    R.show();
  };

  function onChest(ch, chestState) {
    if (chestState === 'locked') {
      LT.sfx.play('wrong');
      LT.speech.say(SAY.chestLocked);
      return;
    }
    if (chestState === 'opened') {
      LT.sfx.play('pop');
      LT.speech.say(SAY.chestOpened);
      return;
    }
    openChest(ch);
  }

  function openChest(ch) {
    const st = S();
    st.chests[ch.id] = true;
    save();
    const fresh = LT.progress.giveBonusSticker();
    LT.progress.save(true);
    const sticker = fresh.length ? LT.stickerById(fresh[fresh.length - 1]) : null;
    LT.sfx.play('win');
    LT.ui.confetti(150);
    const lid = el('span.reise-chest-big.emoji', '🎁');
    const reward = el('div.reise-reward');
    const next = situation();
    const isLast = !next.current;
    const btn = LT.ui.button(isLast ? 'Juhu!' : 'Weiter reisen', () => {
      ov.remove();
      LT.speech.stop();
      R.show();
    }, { icon: isLast ? '🎉' : '🗺️', cls: 'btn-gold', big: true });
    btn.disabled = true;
    const ov = LT.ui.overlay([
      el('h2', 'Schatzkiste!'),
      lid,
      el('p.reise-story', ch.story),
      reward,
      el('div.actions', btn),
    ], { className: 'reise-chest-overlay' });
    ov.style.setProperty('--ch', ch.color);
    ov.style.setProperty('--ch-soft', ch.soft);
    if (LT.config.test) ov.dataset.test = 'reise-chest';
    (async () => {
      await U.sleep(600);
      lid.textContent = '✨';
      lid.classList.add('open');
      LT.sfx.play('sticker');
      if (sticker) {
        reward.appendChild(el('span.sticker-reveal.emoji', sticker.e));
      } else {
        reward.appendChild(el('span.sticker-reveal.emoji', '🏆'));
      }
      btn.disabled = false;
      if (LT.config.test) btn.setAttribute('data-test-station', '1');
      await LT.speech.say(ch.story);
      if (!ov.isConnected) return;
      if (sticker) {
        await LT.speech.say(SAY.sticker);
        if (ov.isConnected) await LT.speech.say(sticker.name);
      } else {
        await LT.speech.say(SAY.stickerFull);
      }
      if (ov.isConnected && !isLast) LT.speech.say(SAY.reveal);
    })();
  }

  function showIntro(ch, reveal) {
    S().intros[ch.id] = true;
    save();
    const deco = el('div.reise-intro-deco', { 'aria-hidden': 'true' }, ch.deco.slice(0, 4).map((d) => U.emoji(d)));
    const btn = LT.ui.button('Los geht’s!', () => {
      ov.remove();
      LT.speech.stop();
      LT.speech.say(SAY.tap);
    }, { icon: '▶️', cls: 'btn-primary', big: true });
    if (LT.config.test) btn.setAttribute('data-test-station', '1');
    const ov = LT.ui.overlay([
      el('div.reise-intro-place', U.emoji(ch.icon, 'reise-intro-icon')),
      el('h2', ch.title),
      deco,
      el('p.reise-story', ch.intro),
      el('div.actions', btn),
    ], { className: 'reise-intro' });
    ov.style.setProperty('--area', ch.color);
    ov.style.setProperty('--ch', ch.color);
    ov.style.setProperty('--ch-soft', ch.soft);
    LT.sfx.play(reveal ? 'levelup' : 'pop');
    LT.speech.say(reveal ? SAY.reveal + ' ' + ch.intro : ch.intro);
  }

  /* ------------------------------------------------------------------
     Für Startseite und Elternbereich
     ------------------------------------------------------------------ */
  R.summary = function () {
    const sit = situation();
    return {
      done: sit.done,
      total: sit.total,
      finished: sit.finished,
      chapter: sit.current ? sit.current.chapter : null,
      chapters: sit.chapters.map((c) => ({ id: c.id, title: c.title, icon: c.icon, focus: c.focus, done: c.doneCount, total: c.stations.length, unlocked: c.unlocked, opened: c.opened, stations: c.stations.map((s) => ({ game: s.game, level: s.level, title: s.def.title, icon: s.def.icon, state: s.state })) })),
      missing: CHAPTERS.flatMap((c) => c.stations.filter(([g]) => !LT.games[g]).map(([g]) => g)),
    };
  };
  R.reset = function () {
    state = { done: {}, chests: {}, intros: {} };
    save();
    run = null;
    justDone = null;
    R._greeted = false;
  };
  /** Alle festen Sätze (z. B. für das Einsammeln der Sprachaufnahmen). */
  R.speechTexts = function () {
    const out = [];
    Object.values(SAY).forEach((v) => (Array.isArray(v) ? out.push(...v) : out.push(v)));
    CHAPTERS.forEach((c) => { out.push(c.intro, c.story, SAY.reveal + ' ' + c.intro); });
    (LT.stickers || []).forEach((s) => out.push(s.name));
    return out;
  };

  /* Test-Helfer (nur ?test) */
  if (LT.config.test) {
    R.test = {
      completeChapter(idx) {
        const ch = chapters()[idx];
        if (!ch) return false;
        const st = S();
        ch.stations.forEach((s) => { st.done[s.key] = true; });
        st.intros[ch.id] = true;
        save();
        return true;
      },
      situation,
    };
  }

  LT.reise = R;
})();
