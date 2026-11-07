/* ==========================================================================
   LT.progress – Lernstand, adaptive Schwierigkeit, Sterne & Sticker, Zeit.

   Didaktik der Anpassung (Zone der nächsten Entwicklung):
   - Eine Runde besteht aus mehreren Aufgaben (Standard 5).
   - Gewertet wird, ob eine Aufgabe beim ERSTEN Versuch gelöst wurde.
   - ≥ 80 % auf Anhieb  → nächste Stufe (wenn vorhanden)
   - < 50 % auf Anhieb  → eine Stufe leichter (Erfolgserlebnis sichern)
   - dazwischen          → Stufe bleibt (festigen)
   - Für jede beendete Runde gibt es mindestens 1 Stern: Dranbleiben zählt!
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const U = LT.util;

  const DEFAULT_SETTINGS = {
    speech: true,
    speechRate: 0.9,
    sound: true,
    showText: true,
    breakMinutes: 20, // 0 = aus
    dailyLimit: 0, // Minuten, 0 = aus
    praiseName: true,
  };

  function freshProfile() {
    return {
      version: 1,
      name: '',
      createdAt: Date.now(),
      stars: 0,
      stickers: [],
      bonusStickers: 0,
      freshStickers: [],
      games: {},
      daily: {}, // 'YYYY-MM-DD' -> Sekunden
      adventure: null, // Tagesabenteuer
      settings: Object.assign({}, DEFAULT_SETTINGS),
    };
  }

  let profile = null;
  let saveTimer = null;

  const P = {};

  P.load = function () {
    const stored = LT.store.get('profile', null);
    profile = stored && typeof stored === 'object' ? stored : freshProfile();
    profile.settings = Object.assign({}, DEFAULT_SETTINGS, profile.settings || {});
    profile.games = profile.games || {};
    profile.daily = profile.daily || {};
    profile.stickers = profile.stickers || [];
    profile.freshStickers = profile.freshStickers || [];
    return profile;
  };
  P.save = function (immediate) {
    clearTimeout(saveTimer);
    if (immediate) LT.store.set('profile', profile);
    else saveTimer = setTimeout(() => LT.store.set('profile', profile), 250);
  };
  Object.defineProperty(P, 'profile', { get: () => profile || P.load() });
  P.settings = () => P.profile.settings;
  P.setSetting = (k, v) => {
    P.profile.settings[k] = v;
    P.save();
    P.applySettings();
  };
  P.applySettings = () => {
    const s = P.profile.settings;
    LT.speech.enabled = !!s.speech;
    LT.speech.rate = s.speechRate || 0.9;
    LT.sfx.enabled = !!s.sound;
    document.body.classList.toggle('no-bubble', !s.showText);
  };
  P.name = () => (P.profile.name || '').trim();

  /** Datensatz eines Spiels (wird bei Bedarf angelegt). */
  P.game = function (id) {
    const g = P.profile.games;
    if (!g[id]) {
      g[id] = { level: 1, rounds: 0, tasks: 0, firstTry: 0, wrong: 0, maxLevelReached: 1, lastPlayed: 0, history: [], seconds: 0 };
    }
    return g[id];
  };
  P.level = (id) => P.game(id).level || 1;
  P.setLevel = function (id, lvl) {
    const def = LT.games[id];
    const max = (def && def.levels) || 1;
    const rec = P.game(id);
    rec.level = U.clamp(lvl, 1, max);
    rec.maxLevelReached = Math.max(rec.maxLevelReached || 1, rec.level);
    P.save();
  };

  /** Eine Aufgabe protokollieren. */
  P.recordTask = function (id, { firstTry, wrong }) {
    const rec = P.game(id);
    rec.tasks++;
    if (firstTry) rec.firstTry++;
    rec.wrong += wrong || 0;
    P.save();
  };

  /**
   * Runde abschließen. score = Anteil auf Anhieb gelöster Aufgaben (0..1) oder null (freies Spiel).
   * Rückgabe: { stars, levelBefore, levelAfter, levelChange, newStickers: [...] }
   */
  P.finishRound = function (id, { score, adaptive = true, seconds = 0 }) {
    const def = LT.games[id] || {};
    const rec = P.game(id);
    const max = def.levels || 1;
    const levelBefore = rec.level || 1;
    let stars;
    if (score == null) stars = 1;
    else stars = score >= 0.8 ? 3 : score >= 0.5 ? 2 : 1;

    let levelAfter = levelBefore;
    if (adaptive && score != null) {
      if (score >= 0.8 && levelBefore < max) levelAfter = levelBefore + 1;
      else if (score < 0.5 && levelBefore > 1) levelAfter = levelBefore - 1;
    }
    rec.level = levelAfter;
    rec.maxLevelReached = Math.max(rec.maxLevelReached || 1, levelAfter);
    rec.rounds++;
    rec.lastPlayed = Date.now();
    rec.seconds = (rec.seconds || 0) + Math.round(seconds);
    rec.history.push({ t: Date.now(), level: levelBefore, score: score == null ? null : Math.round(score * 100) / 100 });
    if (rec.history.length > 30) rec.history.splice(0, rec.history.length - 30);
    if (score === 1 && levelBefore === max) rec.mastered = true;

    const newStickers = P.addStars(stars);
    P.save(true);
    return { stars, levelBefore, levelAfter, levelChange: levelAfter - levelBefore, newStickers };
  };

  /* ---------------- Sterne & Sticker ---------------- */
  P.STARS_PER_STICKER = 4;
  /** Sterne gutschreiben, ggf. neue Sticker freischalten. */
  P.addStars = function (n) {
    const prof = P.profile;
    prof.stars += n;
    return P.syncStickers();
  };
  /** Anzahl Sticker, die laut Sternen + Bonus freigeschaltet sein sollten. */
  P.syncStickers = function () {
    const prof = P.profile;
    const all = (LT.stickers || []).map((s) => s.id);
    const target = Math.min(all.length, Math.floor(prof.stars / P.STARS_PER_STICKER) + (prof.bonusStickers || 0));
    const fresh = [];
    for (const id of all) {
      if (prof.stickers.length >= target) break;
      if (!prof.stickers.includes(id)) {
        prof.stickers.push(id);
        prof.freshStickers.push(id);
        fresh.push(id);
      }
    }
    P.save();
    return fresh;
  };
  P.giveBonusSticker = function () {
    P.profile.bonusStickers = (P.profile.bonusStickers || 0) + 1;
    return P.syncStickers();
  };
  P.starsToNextSticker = function () {
    const prof = P.profile;
    if (prof.stickers.length >= (LT.stickers || []).length) return null;
    return P.STARS_PER_STICKER - (prof.stars % P.STARS_PER_STICKER);
  };

  /* ---------------- Zeit ---------------- */
  P.addTime = function (seconds) {
    const d = U.today();
    P.profile.daily[d] = (P.profile.daily[d] || 0) + seconds;
    // nur die letzten 60 Tage behalten
    const keys = Object.keys(P.profile.daily).sort();
    while (keys.length > 60) delete P.profile.daily[keys.shift()];
    P.save();
  };
  P.todaySeconds = () => P.profile.daily[U.today()] || 0;

  /* ---------------- Auswertung für Eltern ---------------- */
  /** Status eines Spiels: 'new' | 'practice' | 'grow' | 'solid' */
  P.status = function (id) {
    const def = LT.games[id] || {};
    const rec = P.profile.games[id];
    if (!rec || !rec.rounds) return 'new';
    const recent = rec.history.slice(-4).filter((h) => h.score != null);
    const acc = recent.length ? U.sum(recent.map((h) => h.score)) / recent.length : null;
    const max = def.levels || 1;
    if (acc == null) return 'grow';
    if (acc >= 0.8 && rec.level >= max - (max > 2 ? 1 : 0)) return 'solid';
    if (acc < 0.5) return 'practice';
    return 'grow';
  };
  P.accuracy = function (id) {
    const rec = P.profile.games[id];
    if (!rec || !rec.tasks) return null;
    return rec.firstTry / rec.tasks;
  };

  P.reset = function () {
    profile = freshProfile();
    P.save(true);
    P.applySettings();
  };
  P.exportJSON = () => JSON.stringify(P.profile, null, 2);
  P.importJSON = function (text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || !data.games) throw new Error('Ungültige Datei');
    LT.store.set('profile', data);
    P.load();
    P.applySettings();
  };

  LT.progress = P;
})();
