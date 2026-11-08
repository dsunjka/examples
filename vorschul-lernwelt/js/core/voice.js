/* ==========================================================================
   LT.voice – natürliche, neuronale Vorlesestimme aus vorab erzeugten Aufnahmen.

   Alle Sätze, die Flo sagen kann, wurden mit einem neuronalen Sprachmodell
   (Kyutai Pocket TTS) aufgenommen – siehe tools/. Die Aufnahmen liegen als
   kleine MP3-Schnipsel (Base64) in js/voice/<paket>.js: ein Paket pro Spiel
   plus „common“ für Sätze, die überall vorkommen. Pakete werden erst geladen,
   wenn sie gebraucht werden (per <script>, funktioniert auch per file://).

   LT.speech.say() zerlegt Texte in Sätze und fragt für jeden Satz hier nach.
   Gibt es keine Aufnahme (z. B. ganz neuer Satz), übernimmt die Gerätestimme.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;

  /** Gleiche Satz-Zerlegung wie tools/build-voice.js – NICHT ändern ohne neu zu erzeugen. */
  const SPLIT_RE = /[^.!?…]+[.!?…]+["“”»«)]*|[^.!?…]+$/g;
  function split(text) {
    const t = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
    if (!t) return [];
    const out = [];
    for (const s of (t.match(SPLIT_RE) || [t]).map((x) => x.trim()).filter(Boolean)) {
      // sehr lange Sätze (meist Aufzählungen) zusätzlich an Kommas/Doppelpunkten teilen → Teile wiederverwendbar
      if (s.length > 80) out.push(...(s.match(/[^,:;]+[,:;]?/g) || [s]).map((x) => x.trim()).filter(Boolean));
      else out.push(s);
    }
    return out;
  }
  const key = (s) => String(s).replace(/\s+/g, ' ').trim().toLowerCase();

  /** cyrb53 – schneller 53-Bit-Hash (Kollisionen praktisch ausgeschlossen). */
  function hash(str) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  const V = {
    enabled: LT.store ? LT.store.get('naturalVoiceOn', true) !== false : true,
    info: null, // { voice, model, packs: [...], count }
    map: null, // hash → Paketname
    packs: {}, // name → { promise, clips }
    // Ordner der Pakete relativ zu dieser Datei (…/js/core/voice.js → …/js/voice/)
    base: (function () {
      try {
        const src = document.currentScript && document.currentScript.getAttribute('src');
        if (src && /core\/voice\.js/.test(src)) return src.replace(/core\/voice\.js.*$/, 'voice/');
      } catch (e) { /* ignore */ }
      return 'js/voice/';
    })(),
    // Diagnose für den Elternbereich
    stats: { rec: 0, dev: 0, missing: [], errors: [] },
    split,
    hash,
    key,
  };

  /** Wird von js/voice/index.js aufgerufen. */
  LT.voiceIndex = function (data) {
    V.info = data.info || {};
    V.map = data.map || {};
    // Startbildschirm und Weltkarte sofort, gemeinsame Sätze gleich danach laden
    if (V.enabled) setTimeout(() => { V.preload('app'); V.preload('common'); }, 0);
  };
  /** Wird von js/voice/<paket>.js aufgerufen. */
  LT.voicePack = function (name, clips) {
    const p = V.packs[name] || (V.packs[name] = {});
    p.clips = clips;
    if (p.resolve) p.resolve(true);
  };

  V.available = function () {
    return !!(V.enabled && V.map && LT.sfx && LT.sfx.context && LT.sfx.context());
  };

  /** Kurzer Statustext für den Elternbereich. */
  V.status = function () {
    const st = V.stats;
    const loaded = Object.keys(V.packs).filter((k) => V.packs[k].clips).length;
    const ctx = LT.sfx && LT.sfx.context && LT.sfx.context();
    const parts = [
      `${(V.info && V.info.count) || 0} Aufnahmen`,
      `${loaded}/${(V.info && V.info.packs && V.info.packs.length) || 0} Pakete geladen`,
      `vorgelesen: ${st.rec} Aufnahme, ${st.dev} Gerätestimme`,
      `Audio: ${ctx ? ctx.state : 'nicht verfügbar'}`,
    ];
    if (!V.enabled) parts.unshift('AUS (Gerätestimme gewählt)');
    if (st.errors.length) parts.push('Ladefehler: ' + st.errors.join(', '));
    if (st.missing.length) parts.push('zuletzt ohne Aufnahme: „' + st.missing.slice(-3).join('“, „') + '“');
    return parts.join(' · ');
  };

  V.setEnabled = function (on) {
    V.enabled = !!on;
    if (LT.store) LT.store.set('naturalVoiceOn', V.enabled);
  };

  /** Paket laden (einmalig). Promise<boolean> */
  V.load = function (name) {
    if (!name) return Promise.resolve(false);
    const p = V.packs[name] || (V.packs[name] = {});
    if (p.clips) return Promise.resolve(true);
    if (p.promise) return p.promise;
    p.promise = new Promise((resolve) => {
      p.resolve = resolve;
      const s = document.createElement('script');
      s.src = V.base + name + '.js';
      s.async = true;
      s.charset = 'utf-8';
      s.onerror = () => { p.failed = true; p.promise = null; V.stats.errors.push(name); resolve(false); };
      document.head.appendChild(s);
    });
    return p.promise;
  };

  /** Paket laden, falls es existiert. */
  V.preload = function (name) {
    if (V.info && V.info.packs && V.info.packs.includes(name)) V.load(name);
  };

  /** Beim Start eines Spiels: dessen Aufnahmen schon vorladen. */
  V.preloadGame = function (id) {
    if (!V.map || !V.enabled) return;
    V.preload('common');
    V.preload(id);
  };

  /** Varianten eines Satzes, falls er den Namen des Kindes enthält („Super, Max!“ → „Super!“). */
  function variants(sentence) {
    const out = [sentence];
    const name = LT.progress && LT.progress.name && LT.progress.name();
    if (name && sentence.includes(name)) {
      const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out.push(sentence.replace(new RegExp(',\\s*' + esc, 'g'), '').replace(new RegExp(esc + ',\\s*', 'g'), '').replace(new RegExp('\\s*' + esc, 'g'), '').replace(/\s+([.!?,])/g, '$1').trim());
    }
    return out;
  }

  /** Sucht die Aufnahme zu einem Satz. Promise<{ h, b64 } | null> */
  V.find = async function (sentence, waitMs = 12000) {
    if (!V.map) return null;
    for (const s of variants(sentence)) {
      const h = hash(key(s));
      const pack = V.map[h];
      if (!pack) continue;
      const p = V.packs[pack];
      if (!p || !p.clips) {
        const ok = await Promise.race([V.load(pack), new Promise((r) => setTimeout(() => r(false), waitMs))]);
        if (!ok) return null;
      }
      const b64 = V.packs[pack].clips && V.packs[pack].clips[h];
      if (b64) return { h, b64 };
    }
    return null;
  };

  /** Ersatz für Sätze ohne eigene Aufnahme, z. B. Reimpaare „Haus – Maus.“:
   *  Teile einzeln suchen (mit/ohne Satzzeichen). Promise<[clip] | null> */
  V.findParts = async function (sentence) {
    const parts = sentence.split(/\s+[–-]\s+|,\s*/).map((x) => x.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const out = [];
    for (const part of parts) {
      const bare = part.replace(/[.!?…:;]+$/, '');
      let clip = null;
      for (const c of [part, bare, bare + '.', bare + '!', bare + '?']) {
        const h = hash(key(c));
        if (V.map[h]) { clip = await V.find(c); if (clip) break; }
      }
      if (!clip) return null;
      out.push(clip);
    }
    return out;
  };

  // ---- Wiedergabe (Web Audio) ----
  const decoded = new Map(); // h → AudioBuffer (kleiner Zwischenspeicher)
  let current = null;

  function b64ToBuffer(b64) {
    const bin = atob(b64);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }
  function decode(ctx, buf) {
    return new Promise((resolve, reject) => {
      // Safari kennt nur die Callback-Variante zuverlässig
      const pr = ctx.decodeAudioData(buf, resolve, reject);
      if (pr && pr.then) pr.then(resolve, reject);
    });
  }

  /** Spielt eine Aufnahme ab. Promise<boolean> (false = Fehler → Gerätestimme nutzen) */
  V.play = async function (clip, isCurrent) {
    const ctx = LT.sfx.context();
    if (!ctx) return false;
    try {
      if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
      let buf = decoded.get(clip.h);
      if (!buf) {
        buf = await decode(ctx, b64ToBuffer(clip.b64));
        decoded.set(clip.h, buf);
        if (decoded.size > 80) decoded.delete(decoded.keys().next().value);
      }
      if (isCurrent && !isCurrent()) return true;
      V.stop();
      return await new Promise((resolve) => {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        let done = false;
        const finish = () => { if (done) return; done = true; clearTimeout(t); if (current && current.src === src) current = null; resolve(true); };
        src.onended = finish;
        const t = setTimeout(finish, buf.duration * 1000 + 800); // Sicherheitsnetz
        current = { src, finish };
        src.start();
      });
    } catch (e) {
      return false;
    }
  };

  V.stop = function () {
    if (!current) return;
    const c = current;
    current = null;
    try { c.src.onended = null; c.src.stop(); } catch (e) { /* schon beendet */ }
    c.finish();
  };

  // iOS: Wiedergabe auch bei eingeschaltetem Stummschalter (wie die Gerätestimme)
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* ignore */ }

  LT.voice = V;
})();
