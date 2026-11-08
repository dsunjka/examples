/* ==========================================================================
   LT.app – Bildschirme der Lernwelt:
   Start → Weltkarte (Tagesabenteuer + Inseln) → Insel (Spiele) → Spiel
   außerdem: Sticker-Album, Bewegungspause, Tageslimit, Elternbereich.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;
  const el = U.el;
  const P = LT.progress;

  const A = { screen: null, greeted: {} };
  LT.app = A;

  /* ------------------------------------------------------------------
     Zeitmessung, Bewegungspause, Tageslimit
     ------------------------------------------------------------------ */
  let continuous = 0; // Sekunden seit der letzten Pause
  let pending = 0;
  let breakDue = false;

  function tick() {
    if (document.hidden) return;
    if (A.screen === 'splash' || A.screen === 'parents' || A.screen === 'pause' || A.screen === 'limit') return;
    continuous++;
    pending++;
    if (pending >= 10) {
      P.addTime(pending);
      pending = 0;
    }
    const s = P.settings();
    if (s.breakMinutes > 0 && continuous >= s.breakMinutes * 60) breakDue = true;
    if (limitReached() && A.screen !== 'game') A.showLimit();
  }
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (pending) P.addTime(pending);
      pending = 0;
      LT.speech.stop();
      P.save(true);
    }
  });

  function limitReached() {
    const s = P.settings();
    if (!s.dailyLimit) return false;
    const extra = (P.profile.limitExtra && P.profile.limitExtra[U.today()]) || 0;
    return P.todaySeconds() >= (s.dailyLimit + extra) * 60;
  }

  /** Vor jedem Bildschirmwechsel: Pause fällig? Limit erreicht? */
  function gate(next) {
    if (limitReached()) {
      A.showLimit();
      return false;
    }
    if (breakDue) {
      A.showPause(next);
      return false;
    }
    return true;
  }

  const MOVES = [
    ['🐸', 'Hüpfe fünfmal wie ein Frosch!'],
    ['🦒', 'Mach dich ganz groß wie eine Giraffe – und dann ganz klein wie eine Maus!'],
    ['🦩', 'Stell dich auf ein Bein wie ein Flamingo und zähle bis zehn!'],
    ['🐶', 'Schüttel dich wie ein nasser Hund!'],
    ['🌬️', 'Kreise deine Arme wie eine Windmühle!'],
    ['🏃', 'Lauf ganz schnell auf der Stelle und zähle bis zehn!'],
    ['🐻', 'Stapfe wie ein Bär einmal durch das Zimmer!'],
    ['⭐', 'Mach drei Hampelmänner!'],
    ['🐢', 'Atme ganz langsam ein und aus, wie eine Schildkröte. Dreimal!'],
  ];

  A.showPause = function (next) {
    A.screen = 'pause';
    LT.engine.stop();
    const [icon, text] = U.pick(MOVES);
    const btn = LT.ui.button('Fertig – weiter!', () => {
      breakDue = false;
      continuous = 0;
      ov.remove();
      A.screen = null;
      (next || A.showHome)();
    }, { icon: '✅', cls: 'btn-green', big: true });
    btn.disabled = true;
    const counter = el('p.p-muted', '');
    const ov = LT.ui.overlay([
      el('h2', 'Bewegungspause!'),
      el('span.break-emoji.emoji', icon),
      el('p', text),
      counter,
      el('div.actions', btn),
    ]);
    LT.speech.say('Zeit für eine kleine Bewegungspause! ' + text);
    let left = LT.config.test ? 1 : 20;
    counter.textContent = `Noch ${left} Sekunden …`;
    const iv = setInterval(() => {
      left--;
      counter.textContent = left > 0 ? `Noch ${left} Sekunden …` : 'Super gemacht!';
      if (left <= 0) {
        clearInterval(iv);
        btn.disabled = false;
        LT.sfx.play('star');
      }
    }, 1000);
  };

  A.showLimit = function () {
    if (A.screen === 'limit') return;
    A.screen = 'limit';
    LT.engine.stop();
    const { screen } = LT.ui.screen({});
    LT.ui.setMascot({ big: true });
    screen.appendChild(
      el('div.splash',
        el('div.flo-big', { html: LT.ui.floSVG(), style: { animation: 'none', opacity: '0.9' } }),
        el('h1', { style: { fontSize: 'clamp(30px,6vmin,56px)' } }, 'Für heute ist Schluss!'),
        el('p', { style: { fontSize: 'clamp(18px,3vmin,26px)', maxWidth: '640px' } }, 'Flo ist müde und macht jetzt ein Nickerchen. 💤 Morgen spielen wir weiter!'),
        el('button.p-btn.light', { on: { click: () => parentGate(() => {
          const d = U.today();
          P.profile.limitExtra = P.profile.limitExtra || {};
          P.profile.limitExtra[d] = (P.profile.limitExtra[d] || 0) + 15;
          P.save(true);
          A.screen = null;
          A.showHome();
        }) } }, '🔒 Eltern: 15 Minuten verlängern')
      )
    );
    LT.speech.say('Für heute ist Schluss! Flo ist müde und macht ein Nickerchen. Morgen spielen wir weiter!');
  };

  /* ------------------------------------------------------------------
     Startbildschirm (wichtig: erste Berührung schaltet Ton & Stimme frei)
     ------------------------------------------------------------------ */
  A.showSplash = function () {
    A.screen = 'splash';
    const { screen } = LT.ui.screen({});
    LT.ui.setMascot({ hidden: true });
    const start = () => {
      LT.sfx.unlock();
      LT.speech.unlock();
      LT.sfx.play('pop');
      A.screen = null;
      const name = P.name();
      A.showHome(true);
      LT.speech.say(
        name
          ? `Hallo ${name}! Ich bin Flo, der Fuchs. Schön, dass du da bist! Wohin wollen wir heute reisen?`
          : 'Hallo! Ich bin Flo, der Fuchs. Schön, dass du da bist! Wohin wollen wir heute reisen?'
      );
    };
    screen.appendChild(
      el('div.splash',
        el('h1', 'Lernwelt mit Flo'),
        el('div.flo-big', { html: LT.ui.floSVG(), on: { click: start }, role: 'button', 'aria-label': 'Los geht’s' }),
        LT.ui.button('Los geht’s!', start, { icon: '▶️', cls: 'btn-primary', big: true })
      )
    );
    screen.style.setProperty('--area', '#ff8a3d');
  };

  /* ------------------------------------------------------------------
     Tagesabenteuer: 3 Stationen aus verschiedenen Bereichen
     (ausgewogenes, verteiltes Üben – bevorzugt Neues und Übungsbedarf)
     ------------------------------------------------------------------ */
  function adventure() {
    const today = U.today();
    let adv = P.profile.adventure;
    const valid = adv && adv.date === today && adv.games.every((id) => LT.games[id]);
    if (!valid) {
      const scored = LT.gameOrder
        .map((id) => LT.games[id])
        .filter((g) => g.type !== 'free')
        .map((g) => {
          const rec = P.profile.games[g.id];
          const st = P.status(g.id);
          let w = Math.random() * 3;
          if (!rec || !rec.rounds) w += 6;
          if (st === 'practice') w += 5;
          if (st === 'grow') w += 3;
          if (rec && rec.lastPlayed) w += Math.min(4, (Date.now() - rec.lastPlayed) / 86400000);
          // Bereiche mit Basiskompetenzen etwas häufiger
          if (g.area === 'zahlen' || g.area === 'sprache') w += 1;
          return { g, w };
        })
        .sort((a, b) => b.w - a.w);
      const chosen = [];
      const usedAreas = new Set();
      for (const { g } of scored) {
        if (usedAreas.has(g.area)) continue;
        chosen.push(g.id);
        usedAreas.add(g.area);
        if (chosen.length === 3) break;
      }
      adv = { date: today, games: chosen, done: chosen.map(() => false), rewarded: false };
      P.profile.adventure = adv;
      P.save();
    }
    return adv;
  }

  A.onRoundFinished = function (gameId) {
    const adv = P.profile.adventure;
    if (!adv || adv.date !== U.today()) return;
    const i = adv.games.indexOf(gameId);
    if (i >= 0 && !adv.done[i]) {
      adv.done[i] = true;
      P.save();
    }
  };

  function renderAdventure() {
    const adv = adventure();
    if (!adv.games.length) return null;
    const allDone = adv.done.every(Boolean);
    const nextIdx = adv.done.indexOf(false);
    const stations = el('div.stations');
    adv.games.forEach((id, i) => {
      const g = LT.games[id];
      if (i > 0) stations.appendChild(el('span.station-arrow', '➜'));
      stations.appendChild(
        el('button.station' + (adv.done[i] ? '.done' : '') + (i === nextIdx ? '.next' : ''), {
          'aria-label': g.title,
          title: g.title,
          on: { click: () => { LT.sfx.play('click'); startGame(id, { from: 'home' }); } },
        }, U.emoji(g.icon))
      );
    });
    const chest = el('span.chest.emoji' + (allDone && !adv.rewarded ? '.open' : ''), adv.rewarded ? '🎉' : '🎁');
    const box = el('div.daily',
      el('div.daily-title', U.emoji('🗺️'), el('span', 'Tagesabenteuer')),
      stations,
      el('span.station-arrow', '➜'),
      chest
    );
    chest.addEventListener('click', () => {
      if (allDone && !adv.rewarded) rewardAdventure();
      else LT.speech.say(adv.rewarded ? 'Das Tagesabenteuer hast du heute schon geschafft! Super!' : 'Schaffe alle drei Stationen, dann öffnet sich die Schatzkiste!');
    });
    return box;
  }

  function rewardAdventure() {
    const adv = P.profile.adventure;
    adv.rewarded = true;
    const fresh = P.giveBonusSticker();
    P.save(true);
    LT.sfx.play('sticker');
    LT.ui.confetti(140);
    const st = fresh.length ? LT.stickerById(fresh[fresh.length - 1]) : null;
    const ov = LT.ui.overlay([
      el('h2', 'Schatzkiste geöffnet!'),
      st ? el('span.sticker-reveal.emoji', st.e) : el('span.sticker-reveal.emoji', '🏆'),
      el('p', st ? `Ein Bonus-Sticker: ${st.name}!` : 'Du hast alle Sticker – du bist ein Superstar!'),
      el('div.actions', LT.ui.button('Juhu!', () => { ov.remove(); A.showHome(); }, { icon: '🎉', cls: 'btn-gold', big: true })),
    ]);
    LT.speech.say(`Hurra! Du hast das Tagesabenteuer geschafft! ${st ? 'Du bekommst einen Bonus-Sticker: ' + st.name + '!' : ''}`);
  }

  /* ------------------------------------------------------------------
     Weltkarte (Startseite)
     ------------------------------------------------------------------ */
  A.showHome = function (fromSplash) {
    if (!gate(A.showHome)) return;
    A.screen = 'home';
    LT.engine.stop();
    const albumBtn = el('button.btn-round', { title: 'Sticker-Album', 'aria-label': 'Sticker-Album', on: { click: () => { LT.sfx.play('click'); A.showAlbum(); } } }, U.emoji('📒'));
    const parentBtn = el('button.btn-round', { title: 'Elternbereich', 'aria-label': 'Elternbereich', style: { opacity: '0.8' }, on: { click: () => parentGate(A.showParents) } }, U.emoji('🔒'));
    const { screen } = LT.ui.screen({ title: 'Lernwelt mit Flo', icon: '🦊', right: [LT.ui.starCounter(), albumBtn, parentBtn] });
    screen.style.setProperty('--area', '#4a90e2');
    const content = el('div.content');
    screen.appendChild(content);
    LT.ui.setMascot({ big: true });
    LT.ui.onMascotTap = () => LT.speech.say('Tippe auf eine Insel! Oder spiel das Tagesabenteuer mit den drei Stationen.');

    const name = P.name();
    content.appendChild(el('div.home-head', el('h1', name ? `Hallo ${name}!` : 'Hallo!')));
    const adv = renderAdventure();
    if (adv) content.appendChild(adv);

    const grid = el('div.areas');
    LT.areas.forEach((a) => {
      const games = LT.gamesOfArea(a.id);
      if (!games.length) return;
      const reached = U.sum(games.map((g) => (P.profile.games[g.id] ? P.profile.games[g.id].maxLevelReached || 1 : 0)));
      const possible = U.sum(games.map((g) => g.levels));
      const pct = possible ? Math.round((reached / possible) * 100) : 0;
      const card = el('button.card-btn.area-card', {
        'aria-label': a.title,
        on: { click: () => { LT.sfx.play('click'); A.showArea(a.id); } },
      },
        el('span.area-deco', { style: { left: '8%', top: '10%' } }, a.deco[0]),
        el('span.area-deco', { style: { right: '8%', top: '12%' } }, a.deco[1]),
        el('span.area-deco', { style: { left: '12%', bottom: '10%' } }, a.deco[2]),
        el('span.area-deco.emoji', { style: { right: '10%', bottom: '12%' } }, a.deco[3]),
        U.emoji(a.icon, 'area-icon'),
        el('span.area-title', a.title),
        el('span.area-meter', { title: 'Fortschritt' }, el('i', { style: { width: pct + '%' } }))
      );
      LT.ui.applyArea(card, a);
      grid.appendChild(card);
    });
    content.appendChild(grid);

    const adv2 = P.profile.adventure;
    if (!fromSplash && adv2 && adv2.done.every(Boolean) && !adv2.rewarded) {
      setTimeout(() => LT.speech.say('Du hast alle drei Stationen geschafft! Tippe auf die Schatzkiste!'), 400);
    }
  };

  /* ------------------------------------------------------------------
     Insel (Bereich) mit Spielkarten
     ------------------------------------------------------------------ */
  A.showArea = function (areaId) {
    if (!gate(() => A.showArea(areaId))) return;
    const a = LT.areaById(areaId);
    if (!a) return A.showHome();
    A.screen = 'area';
    A.lastArea = areaId;
    LT.engine.stop();
    const { screen } = LT.ui.screen({ area: a, title: a.title, icon: a.icon, onBack: A.showHome, right: [LT.ui.starCounter()] });
    const content = el('div.content');
    screen.appendChild(content);
    LT.ui.setMascot({ big: false });
    LT.ui.onMascotTap = () => LT.speech.say(a.hello + ' Tippe auf ein Spiel!');

    const grid = el('div.grid');
    LT.gamesOfArea(areaId).forEach((g) => {
      const rec = P.profile.games[g.id];
      const pips = el('div.level-pips', { 'aria-label': `Stufe ${rec ? rec.level : 1} von ${g.levels}` });
      if (g.type !== 'free') for (let i = 1; i <= g.levels; i++) pips.appendChild(el('i' + (rec && rec.rounds && i <= rec.level ? '.on' : '')));
      const card = el('button.card-btn.game-card', {
        'aria-label': g.title,
        on: { click: () => { LT.sfx.play('click'); startGame(g.id, { from: 'area' }); } },
      },
        !rec || !rec.rounds ? el('span.new-badge', 'neu') : null,
        rec && rec.mastered ? el('span.crown.emoji', '👑') : null,
        U.emoji(g.icon, 'game-icon'),
        el('span.game-title', g.title),
        pips
      );
      grid.appendChild(card);
    });
    content.appendChild(grid);

    if (!A.greeted[areaId]) {
      A.greeted[areaId] = true;
      LT.speech.say(a.hello);
    } else {
      LT.speech.say('Was möchtest du spielen?');
    }
  };

  function startGame(id, { from } = {}) {
    if (!gate(() => startGame(id, { from }))) return;
    const g = LT.games[id];
    if (!g) return;
    A.screen = 'game';
    const back = from === 'home' ? A.showHome : () => A.showArea(g.area);
    LT.engine.start(id, { onExit: () => back() });
  }
  A.startGame = startGame;

  /* ------------------------------------------------------------------
     Sticker-Album
     ------------------------------------------------------------------ */
  A.showAlbum = function () {
    A.screen = 'album';
    LT.engine.stop();
    const { screen } = LT.ui.screen({ title: 'Mein Sticker-Album', icon: '📒', onBack: A.showHome, right: [LT.ui.starCounter()] });
    screen.style.setProperty('--area', '#ff5fa2');
    const content = el('div.content');
    screen.appendChild(content);
    LT.ui.setMascot({ big: false });
    const have = new Set(P.profile.stickers);
    const fresh = new Set(P.profile.freshStickers || []);
    const total = LT.stickers.length;
    const next = P.starsToNextSticker();
    content.appendChild(
      el('div.album-progress',
        el('span', `${have.size} von ${total} Stickern`),
        el('div.meter', el('i', { style: { width: Math.round((have.size / total) * 100) + '%' } })),
        next ? el('span', `Noch ${next} `, U.emoji('⭐'), ' bis zum nächsten') : el('span', 'Album komplett! ', U.emoji('🏆'))
      )
    );
    const pages = el('div.album-pages');
    LT.stickerThemes.forEach((t) => {
      const grid = el('div.album-grid');
      LT.stickers.filter((s) => s.theme === t.id).forEach((s) => {
        const owned = have.has(s.id);
        grid.appendChild(
          el('button.sticker' + (owned ? '' : '.locked') + (fresh.has(s.id) ? '.fresh' : ''), {
            'aria-label': owned ? s.name : 'noch nicht gesammelt',
            on: { click: (e) => {
              if (owned) {
                LT.sfx.play('pop');
                LT.ui.animate(e.currentTarget, 'joy');
                LT.speech.say(s.name);
              } else {
                LT.speech.say('Diesen Sticker hast du noch nicht. Sammle Sterne, dann bekommst du ihn!');
              }
            } },
          }, owned ? U.emoji(s.e) : '?')
        );
      });
      pages.appendChild(el('div.album-page', el('h3', U.emoji(t.icon), t.title), grid));
    });
    content.appendChild(pages);
    P.profile.freshStickers = [];
    P.save();
    LT.speech.say(have.size ? `Du hast schon ${have.size} Sticker gesammelt!` : 'Hier kommen deine Sticker hinein. Spiele und sammle Sterne!');
  };

  /* ------------------------------------------------------------------
     Eltern-Schranke (Rechenaufgabe, die Vorschulkinder i. d. R. nicht lösen)
     ------------------------------------------------------------------ */
  function parentGate(onOk) {
    LT.speech.stop();
    const a = U.randInt(6, 9);
    const b = U.randInt(6, 9);
    let input = '';
    const display = el('div.gate-display', '–');
    const keys = el('div.keypad');
    const press = (k) => {
      if (k === '⌫') input = input.slice(0, -1);
      else if (k === 'OK') {
        if (Number(input) === a * b) {
          ov.remove();
          onOk();
          return;
        }
        input = '';
        LT.ui.animate(display, 'shake');
      } else if (input.length < 3) input += k;
      display.textContent = input || '–';
    };
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].forEach((k) => keys.appendChild(el('button', { on: { click: () => press(k) } }, k)));
    const ov = LT.ui.overlay([
      el('h2', { style: { fontSize: '26px' } }, 'Nur für Erwachsene'),
      el('p', `Bitte lösen: ${a} × ${b} = ?`),
      display,
      keys,
      el('div.actions', el('button.p-btn.light', { on: { click: () => ov.remove() } }, 'Abbrechen')),
    ], { className: 'gate' });
    if (LT.config.test) ov.dataset.answer = String(a * b);
  }
  A.parentGate = parentGate;

  /* ------------------------------------------------------------------
     Elternbereich
     ------------------------------------------------------------------ */
  A.showParents = function (tab = 'overview') {
    A.screen = 'parents';
    LT.engine.stop();
    LT.speech.stop();
    const { screen } = LT.ui.screen({ className: 'parents', title: 'Elternbereich', icon: '👪', onBack: () => { A.screen = null; A.showHome(); } });
    screen.style.setProperty('--area', '#2b2d42');
    LT.ui.setMascot({ hidden: true });
    const content = el('div.content');
    screen.appendChild(content);
    const tabs = [
      ['overview', '📊 Überblick'],
      ['progress', '📈 Lernstand'],
      ['settings', '⚙️ Einstellungen'],
      ['didactics', '🎓 Pädagogik'],
      ['help', '❓ Hilfe'],
    ];
    const tabBar = el('div.tabs');
    tabs.forEach(([id, label]) => tabBar.appendChild(el('button.tab' + (id === tab ? '.active' : ''), { on: { click: () => A.showParents(id) } }, label)));
    content.appendChild(tabBar);
    const body = el('div');
    content.appendChild(body);
    ({ overview: renderOverview, progress: renderProgress, settings: renderSettings, didactics: renderDidactics, help: renderHelp })[tab](body);
  };

  function fmtMin(sec) {
    const m = Math.round(sec / 60);
    if (m < 60) return `${m} Min.`;
    return `${Math.floor(m / 60)} Std. ${m % 60} Min.`;
  }

  function renderOverview(body) {
    const prof = P.profile;
    const games = Object.entries(prof.games);
    const rounds = U.sum(games.map(([, g]) => g.rounds || 0));
    const tasks = U.sum(games.map(([, g]) => g.tasks || 0));
    const first = U.sum(games.map(([, g]) => g.firstTry || 0));
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = U.today(d);
      week.push({ label: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()], sec: prof.daily[key] || 0 });
    }
    const weekSec = U.sum(week.map((w) => w.sec));
    body.appendChild(
      el('div.p-kpis',
        kpi('⭐ ' + prof.stars, 'Sterne gesammelt'),
        kpi(`${prof.stickers.length}/${LT.stickers.length}`, 'Sticker im Album'),
        kpi(fmtMin(P.todaySeconds()), 'Lernzeit heute'),
        kpi(fmtMin(weekSec), 'Lernzeit 7 Tage'),
        kpi(String(rounds), 'Runden gespielt'),
        kpi(tasks ? Math.round((first / tasks) * 100) + ' %' : '–', 'auf Anhieb richtig')
      )
    );
    const maxSec = Math.max(60, ...week.map((w) => w.sec));
    body.appendChild(
      el('div.p-card',
        el('h3', 'Lernzeit der letzten 7 Tage'),
        el('div.p-week', week.map((w) => el('div.col', el('i', { style: { height: Math.round((w.sec / maxSec) * 100) + '%' }, title: fmtMin(w.sec) }), el('span', w.label))))
      )
    );

    // Empfehlungen
    const all = LT.gameOrder.map((id) => LT.games[id]).filter((g) => g.type !== 'free');
    const practice = all.filter((g) => P.status(g.id) === 'practice');
    const solid = all.filter((g) => P.status(g.id) === 'solid');
    const untried = all.filter((g) => P.status(g.id) === 'new');
    const rec = el('div.p-card', el('h3', 'Empfehlungen'));
    const ul = el('ul');
    if (practice.length) ul.appendChild(el('li', el('b', 'Gemeinsam üben: '), practice.slice(0, 4).map((g) => g.title).join(', '), ' – hier braucht Ihr Kind noch Unterstützung. Spielen Sie diese Spiele gemeinsam und übertragen Sie sie in den Alltag (siehe Tab „Pädagogik“).'));
    if (solid.length) ul.appendChild(el('li', el('b', 'Stärken: '), solid.slice(0, 6).map((g) => g.title).join(', '), ' – sicher gemeistert. Loben Sie die Anstrengung, nicht das „Schlau-Sein“.'));
    if (untried.length) ul.appendChild(el('li', el('b', 'Noch nicht ausprobiert: '), untried.length + ' Spiele, z. B. ', untried.slice(0, 4).map((g) => g.title).join(', '), '.'));
    if (!ul.children.length) ul.appendChild(el('li', 'Noch keine Daten – viel Spaß beim ersten Ausprobieren!'));
    rec.appendChild(ul);
    body.appendChild(rec);

    // Bereiche
    const areaCard = el('div.p-card', el('h3', 'Fortschritt nach Bereichen'));
    const table = el('table.p-table', el('tr', el('th', 'Bereich'), el('th', 'Stufen erreicht'), el('th', 'Auf Anhieb richtig'), el('th', 'Runden')));
    LT.areas.forEach((a) => {
      const gs = LT.gamesOfArea(a.id);
      if (!gs.length) return;
      const recs = gs.map((g) => prof.games[g.id]).filter(Boolean);
      const reached = U.sum(gs.map((g) => (prof.games[g.id] ? prof.games[g.id].maxLevelReached || 1 : 0)));
      const possible = U.sum(gs.map((g) => g.levels));
      const t = U.sum(recs.map((r) => r.tasks || 0));
      const f = U.sum(recs.map((r) => r.firstTry || 0));
      table.appendChild(
        el('tr',
          el('td', `${a.icon} ${a.title}`),
          el('td', el('div.p-bar', { title: `${reached}/${possible}` }, el('i', { style: { width: Math.round((reached / possible) * 100) + '%' } }))),
          el('td', t ? Math.round((f / t) * 100) + ' %' : '–'),
          el('td', String(U.sum(recs.map((r) => r.rounds || 0))))
        )
      );
    });
    areaCard.appendChild(table);
    body.appendChild(areaCard);
  }
  function kpi(value, label) {
    return el('div.p-kpi', el('b', value), el('span', label));
  }

  const STATUS = {
    new: ['new', 'noch nicht gespielt'],
    practice: ['practice', 'üben'],
    grow: ['grow', 'im Aufbau'],
    solid: ['solid', 'sicher'],
  };

  function renderProgress(body) {
    body.appendChild(el('p.p-muted', 'Die Stufe passt sich automatisch an (≥ 80 % auf Anhieb → höher, < 50 % → leichter). Sie können sie hier auch selbst festlegen.'));
    LT.areas.forEach((a) => {
      const gs = LT.gamesOfArea(a.id);
      if (!gs.length) return;
      const table = el('table.p-table', el('tr', el('th', 'Spiel'), el('th', 'Stufe'), el('th', 'Runden'), el('th', 'Auf Anhieb'), el('th', 'Verlauf'), el('th', 'Status')));
      gs.forEach((g) => {
        const rec = P.profile.games[g.id];
        const acc = P.accuracy(g.id);
        const st = STATUS[P.status(g.id)];
        const sel = el('select', { 'aria-label': 'Stufe für ' + g.title, on: { change: (e) => { P.setLevel(g.id, Number(e.target.value)); LT.ui.toast('Stufe gespeichert'); } } });
        for (let i = 1; i <= g.levels; i++) sel.appendChild(el('option', { value: String(i), selected: (rec ? rec.level : 1) === i }, `${i} / ${g.levels}`));
        if (g.type === 'free') sel.disabled = true;
        const hist = rec ? rec.history.slice(-8) : [];
        const spark = el('div', { style: { display: 'flex', gap: '2px', alignItems: 'flex-end', height: '24px' } },
          hist.map((h) => el('i', { title: h.score == null ? 'frei' : Math.round(h.score * 100) + ' % (Stufe ' + h.level + ')', style: { width: '7px', height: Math.max(3, Math.round((h.score == null ? 0.5 : h.score) * 24)) + 'px', background: h.score == null ? '#c7cbe0' : h.score >= 0.8 ? '#22b26b' : h.score >= 0.5 ? '#ffc533' : '#ff8a80', borderRadius: '2px', display: 'block' } }))
        );
        table.appendChild(
          el('tr',
            el('td', `${g.icon} ${g.title}`),
            el('td', sel),
            el('td', String(rec ? rec.rounds : 0)),
            el('td', acc == null ? '–' : Math.round(acc * 100) + ' %'),
            el('td', spark),
            el('td', el('span.p-badge.' + st[0], st[1]))
          )
        );
      });
      body.appendChild(el('div.p-card', el('h3', `${a.icon} ${a.title}`), table));
    });
  }

  function renderSettings(body) {
    const s = P.settings();
    const card = el('div.p-card', el('h3', 'Kind'));
    const nameInput = el('input', { type: 'text', value: P.profile.name || '', placeholder: 'z. B. Max', maxLength: 20 });
    nameInput.addEventListener('change', () => { P.profile.name = nameInput.value.trim(); P.save(true); LT.ui.toast('Name gespeichert'); });
    card.appendChild(row('Name (wird vorgelesen)', nameInput));
    card.appendChild(row('Name beim Loben verwenden', toggle(s.praiseName, (v) => P.setSetting('praiseName', v))));
    body.appendChild(card);

    const voice = el('div.p-card', el('h3', 'Stimme & Ton'));
    const sel = el('select');
    const voices = LT.speech.voices;
    const V = LT.voice;
    const natural = !!(V && V.map);
    if (natural) sel.appendChild(el('option', { value: '__flo', selected: V.enabled }, 'Flo – natürliche Stimme (empfohlen)'));
    if (!LT.speech.supported && !natural) sel.appendChild(el('option', 'Sprachausgabe wird von diesem Browser nicht unterstützt'));
    else if (!voices.length && !natural) sel.appendChild(el('option', 'Keine deutsche Stimme gefunden'));
    voices.forEach((v) => sel.appendChild(el('option', { value: v.name, selected: !(natural && V.enabled) && LT.speech.voice && LT.speech.voice.name === v.name }, `Gerätestimme: ${v.name} (${v.lang})`)));
    sel.addEventListener('change', () => {
      if (sel.value === '__flo') { V.setEnabled(true); return; }
      if (V) V.setEnabled(false);
      LT.speech.setVoiceByName(sel.value);
    });
    voice.appendChild(row('Vorlesestimme', sel, el('button.p-btn.light', { on: { click: () => LT.speech.say('Hallo! Ich bin Flo, der Fuchs. So klinge ich.') } }, '▶ Testen')));
    const rate = el('input', { type: 'range', min: '0.6', max: '1.2', step: '0.05', value: String(s.speechRate) });
    const rateLabel = el('span.p-muted', Math.round(s.speechRate * 100) + ' %');
    rate.addEventListener('input', () => { rateLabel.textContent = Math.round(rate.value * 100) + ' %'; });
    rate.addEventListener('change', () => { P.setSetting('speechRate', Number(rate.value)); LT.speech.say('So schnell spreche ich jetzt.'); });
    voice.appendChild(row('Sprechtempo', rate, rateLabel));
    voice.appendChild(row('Vorlesen', toggle(s.speech, (v) => P.setSetting('speech', v))));
    voice.appendChild(row('Geräusche', toggle(s.sound, (v) => P.setSetting('sound', v))));
    voice.appendChild(row('Text in Sprechblase zeigen', toggle(s.showText, (v) => P.setSetting('showText', v))));
    if (natural) voice.appendChild(el('p.p-muted', `Flos Stimme wurde vorab mit dem neuronalen Sprachmodell ${(V.info && V.info.model) || 'Pocket TTS'} aufgenommen (${(V.info && V.info.count) || 'tausende'} Sätze) und funktioniert auch ohne Internet. Das Sprechtempo gilt nur für Gerätestimmen. Sätze ohne Aufnahme liest die Gerätestimme vor.`));
    voice.appendChild(el('p.p-muted', 'Tipp für Gerätestimmen: Die natürlichsten bieten meist Microsoft Edge („Katja Online“, „Seraphina“) und Google Chrome („Google Deutsch“). Auf iPad/iPhone: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Deutsch → „Anna (Erweitert)“ laden.'));
    body.appendChild(voice);

    const time = el('div.p-card', el('h3', 'Bildschirmzeit'));
    time.appendChild(row('Bewegungspause nach', select([[0, 'aus'], [10, '10 Minuten'], [15, '15 Minuten'], [20, '20 Minuten'], [30, '30 Minuten']], s.breakMinutes, (v) => P.setSetting('breakMinutes', v))));
    time.appendChild(row('Tageslimit', select([[0, 'kein Limit'], [15, '15 Minuten'], [20, '20 Minuten'], [30, '30 Minuten'], [45, '45 Minuten'], [60, '60 Minuten']], s.dailyLimit, (v) => P.setSetting('dailyLimit', v))));
    time.appendChild(el('p.p-muted', 'Empfehlung für 5–6-Jährige: kurze Einheiten von 10–20 Minuten, am besten gemeinsam mit einem Erwachsenen, und insgesamt höchstens 30–60 Minuten Bildschirmzeit pro Tag.'));
    body.appendChild(time);

    const data = el('div.p-card', el('h3', 'Daten'));
    data.appendChild(el('p.p-muted', LT.store.persistent ? 'Alle Daten bleiben ausschließlich auf diesem Gerät (im Browser gespeichert). Es wird nichts ins Internet übertragen.' : 'Achtung: Dieser Browser erlaubt keine dauerhafte Speicherung – der Fortschritt geht beim Schließen verloren.'));
    const fileIn = el('input', { type: 'file', accept: 'application/json', style: { display: 'none' } });
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files[0];
      if (!f) return;
      try {
        P.importJSON(await f.text());
        LT.ui.toast('Fortschritt geladen');
        A.showParents('settings');
      } catch (e) {
        alert('Die Datei konnte nicht gelesen werden.');
      }
    });
    data.appendChild(
      el('div.p-row',
        el('button.p-btn', { on: { click: exportData } }, '⬇ Fortschritt sichern'),
        el('button.p-btn.light', { on: { click: () => fileIn.click() } }, '⬆ Sicherung laden'),
        fileIn,
        el('button.p-btn.danger', { on: { click: () => {
          if (confirm('Wirklich den gesamten Fortschritt (Sterne, Sticker, Stufen) löschen?')) {
            P.reset();
            LT.ui.toast('Alles zurückgesetzt');
            A.showParents('settings');
          }
        } } }, '🗑 Alles zurücksetzen')
      )
    );
    body.appendChild(data);
  }
  function exportData() {
    const blob = new Blob([P.exportJSON()], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `lernwelt-fortschritt-${U.today()}.json` });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function row(label, ...controls) {
    return el('div.p-row', el('label', label), ...controls);
  }
  function toggle(value, onChange) {
    const cb = el('input', { type: 'checkbox', checked: !!value, style: { width: '24px', height: '24px' } });
    cb.addEventListener('change', () => onChange(cb.checked));
    return cb;
  }
  function select(options, value, onChange) {
    const s = el('select');
    options.forEach(([v, l]) => s.appendChild(el('option', { value: String(v), selected: v === value }, l)));
    s.addEventListener('change', () => onChange(Number(s.value)));
    return s;
  }

  function renderDidactics(body) {
    body.appendChild(
      el('div.p-card',
        el('h3', 'Das pädagogische Konzept'),
        el('p', 'Die Lernwelt fördert die Basiskompetenzen, die für einen guten Schulstart besonders wichtig sind (orientiert an den Bildungsplänen der Länder für den Elementarbereich). Jedes Spiel folgt denselben Prinzipien:'),
        el('ul',
          el('li', el('b', 'Alles wird vorgelesen. '), 'Ihr Kind braucht keine Lesefähigkeit. Mit 🔊 oder einem Tipp auf Flo wird die Aufgabe wiederholt.'),
          el('li', el('b', 'Passende Schwierigkeit. '), 'Jedes Spiel hat mehrere Stufen. Die App passt sie nach jeder Runde automatisch an (Zone der nächsten Entwicklung): nicht zu leicht, nicht zu schwer.'),
          el('li', el('b', 'Fehler sind erlaubt. '), 'Falsche Antworten werden sanft kommentiert, nie bestraft. Nach zwei Fehlversuchen hilft Flo mit einem Hinweis – so endet jede Aufgabe mit einem Erfolgserlebnis.'),
          el('li', el('b', 'Lob für Anstrengung. '), 'Gelobt wird das Dranbleiben und genaue Hinschauen (wachstumsorientierte Haltung), nicht „Du bist schlau“.'),
          el('li', el('b', 'Kurze Einheiten. '), 'Eine Runde dauert 2–4 Minuten. Bewegungspausen und ein optionales Tageslimit helfen bei einem gesunden Umgang mit Bildschirmzeit.'),
          el('li', el('b', 'Konkret – bildlich – symbolisch. '), 'Zahlen und Buchstaben werden immer mit Bildern, Mengen und Lauten verknüpft (EIS-Prinzip nach Bruner).'),
          el('li', el('b', 'Ausgewogen üben. '), 'Das Tagesabenteuer schlägt jeden Tag drei Spiele aus verschiedenen Bereichen vor und bevorzugt Neues sowie Spiele mit Übungsbedarf.'),
          el('li', el('b', 'Motivation. '), 'Sterne und ein Sticker-Album belohnen das Dranbleiben – ohne Zeitdruck, Werbung oder In-App-Käufe.')
        ),
        el('p', el('b', 'Ihre Rolle: '), 'Kinder lernen am besten im Gespräch. Setzen Sie sich ab und zu dazu, fragen Sie „Wie hast du das herausgefunden?“ und greifen Sie Themen im Alltag auf. Die Tipps zu jedem Spiel finden Sie unten.')
      )
    );
    LT.areas.forEach((a) => {
      const gs = LT.gamesOfArea(a.id);
      if (!gs.length) return;
      const card = el('div.p-card', el('h3', `${a.icon} ${a.title}`), el('p', a.parent));
      gs.forEach((g) => {
        const p = g.parent || {};
        card.appendChild(
          el('details.p-details',
            el('summary', `${g.icon} ${g.title}${p.skill ? ' – ' + p.skill : ''}`),
            p.goal ? el('p', el('b', 'Lernziel: '), p.goal) : null,
            p.levels && p.levels.length ? el('ul', p.levels.map((l, i) => el('li', `Stufe ${i + 1}: ${l.replace(/^Stufe \d+:\s*/, '')}`))) : null,
            p.tip ? el('p', el('b', 'Idee für den Alltag: '), p.tip) : null
          )
        );
      });
      body.appendChild(card);
    });
  }

  function renderHelp(body) {
    body.appendChild(
      el('div.p-card',
        el('h3', 'So funktioniert die Lernwelt'),
        el('ul',
          el('li', 'Auf der Weltkarte wählt Ihr Kind eine Insel und dann ein Spiel. Eine Runde hat meist 5 Aufgaben.'),
          el('li', 'Die Punkte oben zeigen den Fortschritt der Runde. Gelbe Punkte = auf Anhieb richtig.'),
          el('li', 'Für jede Runde gibt es 1–3 Sterne, für je 4 Sterne einen neuen Sticker im Album.'),
          el('li', '🔊 bzw. ein Tipp auf Flo wiederholt die Aufgabe. ⬅️ führt zurück.'),
          el('li', 'Der Elternbereich ist durch eine Rechenaufgabe geschützt.')
        ),
        el('h3', 'Als App installieren (offline nutzbar)'),
        el('ul',
          el('li', el('b', 'iPad/iPhone (Safari): '), 'Teilen-Symbol → „Zum Home-Bildschirm“.'),
          el('li', el('b', 'Android (Chrome): '), 'Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.'),
          el('li', el('b', 'Computer: '), 'Einfach die Datei index.html im Browser öffnen – es ist keine Installation nötig.')
        ),
        el('p.p-muted', 'Für ein gutes Spielerlebnis: Tablet im Querformat, Lautstärke an, ruhige Umgebung. Bei sehr leisem oder fehlendem Vorlesen bitte die Einstellungen der Sprachausgabe des Geräts prüfen.'),
        el('h3', 'Datenschutz'),
        el('p', 'Die Lernwelt sammelt keine Daten, enthält keine Werbung, keine Tracker und keine Käufe. Fortschritt und Einstellungen werden nur lokal im Browser dieses Geräts gespeichert.')
      )
    );
  }

  /* ------------------------------------------------------------------
     Start
     ------------------------------------------------------------------ */
  function boot() {
    P.load();
    P.applySettings();
    P.syncStickers();
    LT.ui.initMascot();
    document.addEventListener('pointerdown', () => { LT.sfx.unlock(); LT.speech.unlock(); }, { once: true });
    if (LT.config.test) {
      A.showHome();
      return;
    }
    A.showSplash();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
