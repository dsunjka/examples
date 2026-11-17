/* ==========================================================================
   LT.store – robuste Speicherung im Browser.
   - Hauptspeicher: localStorage (synchron, sofort verfügbar).
   - Sicherungskopie: IndexedDB. Jeder Schreibvorgang wird gespiegelt.
     Beim Start wird die neuere der beiden Kopien verwendet. So bleibt der
     Fortschritt erhalten, auch wenn ein Browser (z. B. Safari oder eine
     eingebettete Ansicht) den localStorage leert.
   - Der Browser wird um dauerhaften Speicher gebeten (storage.persist).
   Ist gar nichts erlaubt (privater Modus), läuft die App trotzdem – dann eben
   nur für diese Sitzung.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const PREFIX = LT.config.test ? 'lernwelt-test.' : 'lernwelt.';
  const STAMP = PREFIX + '__saved'; // Zeitpunkt des letzten Schreibens (localStorage)
  const DB_NAME = PREFIX + 'db';
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

  /* ---------------- IndexedDB-Spiegel ---------------- */
  let dbPromise = null;
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      try {
        if (!window.indexedDB) return resolve(null);
        const req = window.indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore('kv');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
        req.onblocked = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
    return dbPromise;
  }
  // Schreibvorgänge sammeln und gebündelt in einer Transaktion ablegen.
  const pending = {};
  let flushTimer = null;
  function idbFlush() {
    clearTimeout(flushTimer);
    flushTimer = null;
    const keys = Object.keys(pending);
    if (!keys.length) return Promise.resolve();
    const batch = {};
    keys.forEach((k) => { batch[k] = pending[k]; delete pending[k]; });
    return openDB().then((db) => {
      if (!db) return;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('kv', 'readwrite');
          const st = tx.objectStore('kv');
          const now = Date.now();
          for (const k of Object.keys(batch)) {
            if (batch[k] === null) st.delete(k);
            else st.put(batch[k], k);
          }
          st.put(now, '__saved');
          tx.oncomplete = tx.onerror = tx.onabort = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    });
  }
  function idbQueue(key, raw) {
    pending[key] = raw;
    if (!flushTimer) flushTimer = setTimeout(idbFlush, 300);
  }
  function idbReadAll() {
    return openDB().then((db) => {
      if (!db) return null;
      return new Promise((resolve) => {
        try {
          const out = {};
          const tx = db.transaction('kv', 'readonly');
          const req = tx.objectStore('kv').openCursor();
          req.onsuccess = () => {
            const c = req.result;
            if (c) { out[c.key] = c.value; c.continue(); } else resolve(out);
          };
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });
  }

  function lsStamp() {
    try { return Number(ls && ls.getItem(STAMP)) || 0; } catch (e) { return 0; }
  }
  function lsHasData() {
    try {
      if (!ls) return false;
      for (let i = 0; i < ls.length; i++) {
        const k = ls.key(i);
        if (k && k.indexOf(PREFIX) === 0 && k !== STAMP) return true;
      }
    } catch (e) { /* egal */ }
    return false;
  }

  /* ---------------- öffentliche Schnittstelle ---------------- */
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
        if (ls) { ls.setItem(PREFIX + key, raw); ls.setItem(STAMP, String(Date.now())); }
        else memory[key] = raw;
      } catch (e) {
        memory[key] = raw;
      }
      idbQueue(key, raw);
    },
    remove(key) {
      try {
        if (ls) { ls.removeItem(PREFIX + key); ls.setItem(STAMP, String(Date.now())); }
      } catch (e) { /* egal */ }
      delete memory[key];
      idbQueue(key, null);
    },
    /** Ausstehende Sicherungen sofort schreiben (z. B. beim Schließen). */
    flush: idbFlush,
    /** Wird erfüllt, sobald eine ggf. neuere Sicherung aus IndexedDB übernommen wurde. */
    ready: null,
    restored: false,
  };

  // Beim Start: IndexedDB lesen; ist sie neuer als localStorage (oder
  // localStorage leer), wird ihr Inhalt zurückgespielt. Sonst wird die
  // Sicherung einmal vollständig aus localStorage aufgefrischt.
  LT.store.ready = new Promise((resolve) => {
    const timer = setTimeout(resolve, 2500); // nie ewig warten
    idbReadAll().then((data) => {
      try {
        if (data) {
          const idbT = Number(data.__saved) || 0;
          const keys = Object.keys(data).filter((k) => k !== '__saved');
          const idbNewer = idbT > lsStamp() || !lsHasData();
          // Schlüssel aus der Sicherung übernehmen, wenn sie neuer ist oder
          // der Schlüssel im localStorage fehlt (teilweise geleert).
          for (const k of keys) {
            let cur = null;
            try { cur = ls ? ls.getItem(PREFIX + k) : (k in memory ? memory[k] : null); } catch (e) { cur = null; }
            if (cur === data[k]) continue;
            if (cur === null || idbNewer) {
              try {
                if (ls) ls.setItem(PREFIX + k, data[k]);
                else memory[k] = data[k];
              } catch (e) { memory[k] = data[k]; }
              LT.store.restored = true;
            }
          }
          if (LT.store.restored && idbNewer) { try { if (ls) ls.setItem(STAMP, String(idbT)); } catch (e) { /* egal */ } }
          // Umgekehrt: alles, was nur im localStorage steht, in die Sicherung schreiben.
          if (ls) {
            for (let i = 0; i < ls.length; i++) {
              const k = ls.key(i);
              if (!k || k.indexOf(PREFIX) !== 0 || k === STAMP) continue;
              const key = k.slice(PREFIX.length), v = ls.getItem(k);
              if (data[key] !== v) pending[key] = v;
            }
            if (Object.keys(pending).length) idbFlush();
          }
          if (!ls) LT.store.persistent = true; // nur IndexedDB, aber dauerhaft
        }
      } catch (e) { /* egal */ }
      clearTimeout(timer);
      resolve();
    });
  });

  // Browser um dauerhaften Speicher bitten (verhindert automatisches Leeren).
  try {
    if (!LT.config.test && navigator.storage && navigator.storage.persist) {
      navigator.storage.persisted().then((p) => p || navigator.storage.persist()).catch(() => {});
    }
  } catch (e) { /* egal */ }

  // Beim Verlassen / Wegwechseln sofort sichern.
  const flushNow = () => { try { if (LT.progress && LT.progress.flush) LT.progress.flush(); } catch (e) { /* egal */ } idbFlush(); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNow(); });
  window.addEventListener('pagehide', flushNow);
})();
