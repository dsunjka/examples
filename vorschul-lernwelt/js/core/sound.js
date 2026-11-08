/* ==========================================================================
   LT.sfx – Geräusche, komplett synthetisch erzeugt (Web Audio API).
   Keine Audiodateien nötig. Fehler-Geräusch bewusst sanft (kein „Buzzer“),
   damit Fehler nicht als Strafe erlebt werden.
   ========================================================================== */
(function () {
  'use strict';
  const LT = window.LT;
  let ctx = null;
  let master = null;

  const NOTES = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, H4: 493.88, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, H5: 987.77, C6: 1046.5 };

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  const F = {
    enabled: true,
    NOTES,
    /** Gemeinsamer AudioContext (auch für die Vorlesestimme). */
    context: () => ensure(),
    /** Einmal bei der ersten Berührung aufrufen (Autoplay-Regeln der Browser). */
    unlock() {
      const c = ensure();
      if (c && c.state === 'suspended') c.resume().catch(() => {});
    },
    /** Einzelner Ton. freq in Hz oder Notenname ('C5'). */
    tone(freq, dur = 0.18, opts = {}) {
      if (!F.enabled || LT.config.test) return;
      const c = ensure();
      if (!c) return;
      if (c.state === 'suspended') c.resume().catch(() => {});
      const f = typeof freq === 'string' ? NOTES[freq] || 440 : freq;
      const t0 = c.currentTime + (opts.delay || 0);
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = opts.type || 'sine';
      o.frequency.setValueAtTime(f, t0);
      if (opts.slideTo) o.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
      const vol = opts.volume == null ? 0.6 : opts.volume;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    },
    /** Folge von Tönen: [['C5',0.12],['E5',0.12]] */
    seq(list, opts = {}) {
      let d = 0;
      for (const [n, dur] of list) {
        if (n) F.tone(n, dur * 1.3, Object.assign({}, opts, { delay: d }));
        d += dur;
      }
    },
    play(name) {
      if (!F.enabled || LT.config.test) return;
      switch (name) {
        case 'correct':
          F.seq([['C5', 0.09], ['E5', 0.09], ['G5', 0.16]], { type: 'triangle', volume: 0.5 });
          break;
        case 'wrong':
          F.tone(330, 0.22, { type: 'sine', slideTo: 260, volume: 0.35 });
          break;
        case 'click':
        case 'tap':
          F.tone(880, 0.05, { type: 'triangle', volume: 0.25 });
          break;
        case 'pop':
          F.tone(600, 0.08, { type: 'sine', slideTo: 1200, volume: 0.35 });
          break;
        case 'flip':
          F.tone(500, 0.07, { type: 'triangle', slideTo: 700, volume: 0.25 });
          break;
        case 'whoosh':
          F.tone(300, 0.25, { type: 'sine', slideTo: 900, volume: 0.2 });
          break;
        case 'star':
          F.seq([['G5', 0.07], ['C6', 0.14]], { type: 'triangle', volume: 0.45 });
          break;
        case 'levelup':
          F.seq([['C5', 0.1], ['E5', 0.1], ['G5', 0.1], ['C6', 0.25]], { type: 'square', volume: 0.18 });
          break;
        case 'win':
          F.seq([['G4', 0.1], ['C5', 0.1], ['E5', 0.1], ['G5', 0.18], ['E5', 0.1], ['G5', 0.35]], { type: 'triangle', volume: 0.45 });
          break;
        case 'sticker':
          F.seq([['E5', 0.08], ['G5', 0.08], ['C6', 0.08], ['E5', 0.08], ['G5', 0.08], ['C6', 0.3]], { type: 'sine', volume: 0.45 });
          break;
        case 'drum':
          F.tone(150, 0.15, { type: 'sine', slideTo: 60, volume: 0.9 });
          break;
        default:
          break;
      }
    },
  };

  LT.sfx = F;
})();
