/* ==========================================================================
   LT.store – robuste Speicherung im Browser (localStorage mit Fallback).
   Wenn localStorage gesperrt ist (privater Modus, Datei-Zugriff), läuft die
   App trotzdem – dann eben nur für diese Sitzung.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const PREFIX = LT.config.test ? 'lernwelt-test.' : 'lernwelt.';
  const memory = {};

  function backend() {
    try {
      const k = '__lt_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }
  const ls = backend();

  LT.store = {
    persistent: !!ls,
    get(key, fallback) {
      try {
        const raw = ls ? ls.getItem(PREFIX + key) : memory[key];
        if (raw === null || raw === undefined) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      try {
        if (ls) ls.setItem(PREFIX + key, raw);
        else memory[key] = raw;
      } catch (e) {
        memory[key] = raw;
      }
    },
    remove(key) {
      try {
        if (ls) ls.removeItem(PREFIX + key);
      } catch (e) { /* egal */ }
      delete memory[key];
    },
  };
})();
