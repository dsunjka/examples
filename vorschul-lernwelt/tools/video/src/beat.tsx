import React, {createContext, useContext} from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {EMOJI} from './theme';

// Zeitangaben in Visuals ("at", "until" …) sind ANTEILE DER SPRECHZEIT des Beats:
// 0 = Beginn der Sprache, 1 = Ende der Sprache, >1 = in der Pause danach.
// So passen Animationen immer zur Erzählung, egal wie schnell die Stimme spricht.
export type BeatTime = {
  f: number; // aktueller Frame im Beat
  fps: number;
  lead: number; // Frames vor dem Sprechbeginn
  narr: number; // Sprechdauer in Frames
  frames: number; // Länge des Beats in Frames
  accent: string;
  talk: number; // aktuelle Lautstärke 0..1 (für Flos Mund)
  index: number;
};

export const BeatCtx = createContext<BeatTime>({
  f: 0, fps: 24, lead: 6, narr: 96, frames: 120, accent: '#ff8a3d', talk: 0, index: 0,
});

export const useBeat = () => {
  const b = useContext(BeatCtx);
  const at = (x: number | undefined, def = 0) => b.lead + (x ?? def) * b.narr;
  const ease = Easing.bezier(0.33, 0, 0.2, 1);
  /** 0..1 – weicher Übergang, der bei Anteil `x` beginnt und `sec` Sekunden dauert. */
  const p = (x: number | undefined, sec = 0.5, def = 0) => {
    const s = at(x, def);
    return interpolate(b.f, [s, s + Math.max(1, sec * b.fps)], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease,
    });
  };
  /** Feder (springt leicht über 1), ab Anteil `x`. */
  const sp = (x: number | undefined, def = 0, damping = 11) =>
    spring({frame: b.f - at(x, def), fps: b.fps, config: {damping, mass: 0.7}});
  /** Verteilt n Zeitpunkte gleichmäßig zwischen a und z (Anteile). */
  const spread = (n: number, a = 0.05, z = 0.8) =>
    Array.from({length: n}, (_, i) => (n <= 1 ? a : a + ((z - a) * i) / (n - 1)));
  const sec = b.f / b.fps;
  return {...b, at, p, sp, spread, sec};
};

/** Zeitpunkt eines Elements: eigenes `at` oder gleichmäßig verteilt. */
export const atOf = (list: (number | undefined)[], i: number, a = 0.05, z = 0.8) => {
  const given = list[i];
  if (typeof given === 'number') return given;
  const n = list.length;
  return n <= 1 ? a : a + ((z - a) * i) / (n - 1);
};

export const Emo: React.FC<{e: string; size: number; style?: React.CSSProperties}> = ({e, size, style}) => (
  <span
    style={{
      fontFamily: EMOJI,
      fontSize: size,
      lineHeight: 1,
      display: 'inline-block',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {e}
  </span>
);

/** Kleine deterministische Zufallszahl (für Streuung, Schnee …). */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Text mit *Hervorhebung* in Akzentfarbe. */
export const Marked: React.FC<{text: string; accent: string}> = ({text, accent}) => {
  const parts = String(text).split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((t, i) =>
        t.startsWith('*') && t.endsWith('*') ? (
          <span key={i} style={{color: accent}}>{t.slice(1, -1)}</span>
        ) : (
          <span key={i}>{t}</span>
        ),
      )}
    </>
  );
};
