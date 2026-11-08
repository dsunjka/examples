/* ==========================================================================
   LT.speech – Vorlesestimme (Web Speech API, Deutsch).
   Ein Vorschulkind kann (noch) nicht lesen: JEDE Aufgabe wird vorgelesen.
   - wählt automatisch eine deutsche Stimme (Eltern können sie ändern)
   - say() liefert ein Promise, das IMMER aufgelöst wird (auch bei Fehlern,
     fehlender Stimme oder hängender Sprachausgabe → Zeitlimit)
   - lange Texte werden in Sätze zerlegt (Chrome bricht sonst nach ~15 s ab)
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  const synth = window.speechSynthesis;

  const PREFERRED = [
    /katja.*(natural|online)/i, /seraphina/i, /amala/i, /conrad.*(natural|online)/i, /google deutsch/i,
    /anna/i, /petra/i, /helena/i, /marlene/i, /vicki/i, /hedda/i, /katja/i, /yannick/i, /markus/i,
  ];

  const S = {
    supported: !!(synth && window.SpeechSynthesisUtterance),
    enabled: true,
    rate: 0.9,
    pitch: 1.05,
    voice: null,
    voices: [],
    speaking: false,
    _listeners: { start: [], end: [] },
    _keep: [],
    _token: 0,
  };

  function loadVoices() {
    if (!S.supported) return;
    let all = [];
    try { all = synth.getVoices() || []; } catch (e) { all = []; }
    S.voices = all.filter((v) => /^de([-_]|$)/i.test(v.lang));
    const saved = LT.store.get('voiceName', '');
    let v = saved ? S.voices.find((x) => x.name === saved) : null;
    if (!v) {
      for (const re of PREFERRED) {
        v = S.voices.find((x) => re.test(x.name) && /de[-_]DE/i.test(x.lang)) || S.voices.find((x) => re.test(x.name));
        if (v) break;
      }
    }
    if (!v) v = S.voices.find((x) => /de[-_]DE/i.test(x.lang)) || S.voices[0] || null;
    S.voice = v;
  }
  if (S.supported) {
    loadVoices();
    try { synth.addEventListener('voiceschanged', loadVoices); } catch (e) { synth.onvoiceschanged = loadVoices; }
  }

  S.on = (ev, fn) => S._listeners[ev] && S._listeners[ev].push(fn);
  const emit = (ev, data) => S._listeners[ev].forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } });

  S.setVoiceByName = (name) => {
    LT.store.set('voiceName', name || '');
    loadVoices();
  };

  /** Satzweise zerlegen, damit keine Äußerung zu lang wird. */
  function chunks(text) {
    if (text.length < 160) return [text];
    const parts = text.match(/[^.!?…]+[.!?…]*\s*/g) || [text];
    const out = [];
    let cur = '';
    for (const p of parts) {
      if ((cur + p).length > 160 && cur) { out.push(cur.trim()); cur = ''; }
      cur += p;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  function speakOne(text, opts, token) {
    return new Promise((resolve) => {
      if (token !== S._token) return resolve(false);
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(ok);
      };
      const rate = opts.rate || S.rate;
      // Sicherheitsnetz: manche Browser feuern "end" nie.
      const timer = setTimeout(() => finish(true), 2500 + (text.length * 95) / rate);
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = (S.voice && S.voice.lang) || 'de-DE';
        if (S.voice) u.voice = S.voice;
        u.rate = rate;
        u.pitch = opts.pitch || S.pitch;
        u.volume = 1;
        u.onend = () => finish(true);
        u.onerror = () => finish(false);
        S._keep.push(u); // gegen Garbage-Collection-Bug in Chrome
        if (S._keep.length > 20) S._keep.shift();
        synth.speak(u);
        // Safari/iOS: hängt manchmal im pausierten Zustand
        if (synth.paused) synth.resume();
      } catch (e) {
        finish(false);
      }
    });
  }

  /**
   * Text vorlesen. Gibt ein Promise zurück, das nach dem Sprechen aufgelöst wird.
   * opts: { rate, pitch, interrupt (Standard true), silent (nur Sprechblase) }
   */
  S.say = async function (text, opts = {}) {
    text = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
    if (!text) return;
    const token = ++S._token;
    S.speaking = true;
    emit('start', text);
    try {
      if (LT.config.test) {
        await new Promise((r) => setTimeout(r, 5));
      } else if (!S.enabled || opts.silent || (!S.supported && !(LT.voice && LT.voice.available()))) {
        await new Promise((r) => setTimeout(r, S.enabled && S.supported ? 300 : Math.min(2500, 500 + text.length * 30)));
      } else {
        if (opts.interrupt !== false) {
          if (LT.voice) LT.voice.stop();
          if (S.supported) { try { synth.cancel(); } catch (e) { /* ignore */ } }
          await new Promise((r) => setTimeout(r, 40));
        }
        const V = LT.voice;
        if (V && V.available()) {
          // Natürliche Stimme: Satz für Satz die Aufnahme abspielen, sonst Gerätestimme
          for (const sentence of V.split(text)) {
            if (token !== S._token) break;
            const clip = await V.find(sentence);
            if (token !== S._token) break;
            let ok = clip && (await V.play(clip, () => token === S._token));
            if (!clip && token === S._token) {
              const parts = await V.findParts(sentence);
              if (parts) { ok = true; for (const c of parts) { if (token !== S._token || !(await V.play(c, () => token === S._token))) { ok = false; break; } } }
            }
            if (ok) V.stats.rec++;
            else if (token === S._token) {
              V.stats.dev++;
              V.stats.missing.push(sentence + (clip ? ' (Abspielfehler)' : ''));
              if (V.stats.missing.length > 20) V.stats.missing.shift();
              if (S.supported) await speakOne(sentence, opts, token);
            }
          }
        } else if (S.supported) {
          for (const part of chunks(text)) {
            if (token !== S._token) break;
            await speakOne(part, opts, token);
          }
        }
      }
    } finally {
      if (token === S._token) {
        S.speaking = false;
        emit('end', text);
      }
    }
  };

  /** Sprechen sofort beenden. */
  S.stop = function () {
    S._token++;
    S.speaking = false;
    if (LT.voice) LT.voice.stop();
    if (S.supported) {
      try { synth.cancel(); } catch (e) { /* ignore */ }
    }
    emit('end', '');
  };

  /** Muss einmal durch eine Nutzeraktion ausgelöst werden (iOS/Safari). */
  S.unlock = function () {
    if (!S.supported || S._unlocked) return;
    S._unlocked = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
    } catch (e) { /* ignore */ }
    loadVoices();
  };

  LT.speech = S;
})();
