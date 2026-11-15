import React from 'react';
import {interpolate} from 'remotion';
import {GROUND} from '../components/Backdrop';
import {Flo} from '../components/Flo';
import {Bubble, Tag} from '../components/ui';
import {Emo, Marked, useBeat} from '../beat';
import type {VProps} from './types';

type Move = {x?: number; y?: number; at?: number; until?: number};
type Actor = {
  e: string; // Emoji (auch mehrere) oder "flo"
  x?: number; // 0..100 (% Bildbreite), Mitte der Figur
  y?: number; // 0..100 (% Bildhöhe), Fußpunkt der Figur
  size?: number; // px (Standard 96)
  at?: number;
  enter?: 'pop' | 'fade' | 'left' | 'right' | 'drop' | 'up' | 'none';
  anim?: 'none' | 'bounce' | 'wiggle' | 'float' | 'sleep' | 'shiver' | 'walk' | 'pulse' | 'spin' | 'fly';
  moves?: Move[];
  exit?: {at: number; to?: 'left' | 'right' | 'fade' | 'shrink' | 'up' | 'down'};
  flip?: boolean;
  label?: string;
  labelAt?: number;
  labelBelow?: boolean;
  bubble?: string;
  bubbleAt?: number;
  think?: boolean;
  emotion?: string;
  gesture?: string;
  z?: number;
};

const ActorView: React.FC<{a: Actor; i: number; ground: number}> = ({a, i, ground}) => {
  const b = useBeat();
  const size = a.size ?? 96;
  const at0 = a.at ?? 0;
  // Position aus Start + Wegpunkten
  let x = a.x ?? 50;
  let y = a.y ?? ground;
  let moving = false;
  for (const m of a.moves || []) {
    const s = b.at(m.at ?? 0.3);
    const e = m.until !== undefined ? b.at(m.until) : s + 1.2 * b.fps;
    const k = interpolate(b.f, [s, e], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const ek = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    if (k > 0 && k < 1) moving = true;
    x = x + ((m.x ?? x) - x) * ek;
    y = y + ((m.y ?? y) - y) * ek;
  }
  // Auftritt
  const enter = a.enter ?? 'pop';
  const kp = b.sp(at0, 0, 12);
  const kf = b.p(at0, 0.6);
  let dx = 0, dy = 0, sc = 1, op = 1;
  if (enter === 'pop') { sc = kp; op = Math.min(1, kp * 3); }
  if (enter === 'fade') op = kf;
  if (enter === 'left') dx = (1 - kf) * -(x + 20) * 9.6;
  if (enter === 'right') dx = (1 - kf) * (120 - x) * 9.6;
  if (enter === 'drop') { dy = (1 - kp) * -(y * 5.4 + 60); op = b.f >= b.at(at0) ? 1 : 0; }
  if (enter === 'up') { dy = (1 - kf) * 120; op = kf; }
  if (enter === 'none') op = 1;
  // Abgang
  if (a.exit) {
    const ke = b.p(a.exit.at, 0.7);
    const to = a.exit.to ?? 'fade';
    if (to === 'fade') op *= 1 - ke;
    if (to === 'shrink') sc *= 1 - ke;
    if (to === 'left') dx -= ke * (x + 20) * 9.6;
    if (to === 'right') dx += ke * (120 - x) * 9.6;
    if (to === 'up') dy -= ke * 600;
    if (to === 'down') { dy += ke * 200; op *= 1 - ke; }
  }
  // Daueranimation
  const t = b.sec + i * 0.37;
  const anim = a.anim ?? (moving ? 'walk' : 'none');
  let ax = 0, ay = 0, rot = 0, as = 1;
  if (anim === 'bounce') ay = -Math.abs(Math.sin(t * 4)) * size * 0.18;
  if (anim === 'wiggle') rot = Math.sin(t * 5) * 7;
  if (anim === 'float' || anim === 'fly') ay = Math.sin(t * 2.2) * size * 0.08;
  if (anim === 'fly') rot = Math.sin(t * 6) * 4;
  if (anim === 'sleep') as = 1 + Math.sin(t * 2) * 0.03;
  if (anim === 'shiver') ax = Math.sin(t * 45) * 1.5;
  if (anim === 'walk' && moving) { ay = -Math.abs(Math.sin(t * 9)) * size * 0.08; rot = Math.sin(t * 9) * 4; }
  if (anim === 'pulse') as = 1 + Math.sin(t * 4) * 0.06;
  if (anim === 'spin') rot = (t * 120) % 360;

  const kl = a.label ? b.sp(a.labelAt ?? at0 + 0.15) : 0;
  const kb = a.bubble ? b.sp(a.bubbleAt ?? at0 + 0.1) : 0;
  const left = (x / 100) * 960;
  const top = (y / 100) * 540;
  const isFlo = a.e === 'flo';
  const bubbleEmoji = a.bubble && !/[A-Za-zÄÖÜäöüß0-9]/.test(a.bubble);
  const zzz = anim === 'sleep';
  // Schild nicht aus dem Bild ragen lassen (Breite grob geschätzt: Andika 700 ≈ 0,52 em pro Zeichen + Polster).
  const labelW = a.label ? a.label.length * 30 * 0.52 + 36 : 0;
  const labelShift = a.label ? Math.max(labelW / 2 + 6, Math.min(960 - labelW / 2 - 6, left)) - left : 0;
  return (
    <div
      style={{
        position: 'absolute', left, top, width: 0, height: 0, opacity: op, zIndex: a.z ?? Math.round(y),
        transform: `translate(${dx + ax}px, ${dy + ay}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute', left: -size / 2, top: -size, width: size, height: size,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          transform: `scale(${sc * as}) rotate(${rot}deg)`, transformOrigin: '50% 100%',
        }}
      >
        {isFlo ? (
          <Flo size={size} frame={b.f} fps={b.fps} talk={b.talk} emotion={a.emotion as any} gesture={a.gesture as any} flip={a.flip} bob={false} />
        ) : (
          <Emo e={a.e} size={size * 0.9} style={{transform: a.flip ? 'scaleX(-1)' : undefined}} />
        )}
      </div>
      {zzz && (
        <div style={{position: 'absolute', left: size * 0.2, top: -size * 1.15 - ((b.sec * 18) % 30), opacity: 0.5 + 0.5 * Math.abs(Math.sin(b.sec * 1.5))}}>
          <Emo e="💤" size={size * 0.4} />
        </div>
      )}
      {a.label && (
        <div style={{position: 'absolute', left: labelShift, top: a.bubble || a.labelBelow ? 8 : -size - 50, transform: 'translateX(-50%)'}}>
          <Tag text={a.label} k={kl} size={30} />
        </div>
      )}
      {a.bubble && (
        <Bubble
          k={kb}
          think={a.think}
          tail="down"
          size={bubbleEmoji ? 64 : 36}
          style={{left: -10, bottom: size + 26, transform: `translateX(-40%) scale(${kb})`, whiteSpace: 'nowrap'}}
        >
          {bubbleEmoji ? <Emo e={a.bubble} size={64} /> : <Marked text={a.bubble} accent={b.accent} />}
        </Bubble>
      )}
    </div>
  );
};

export const SceneV: React.FC<VProps> = ({v}) => {
  const ground = GROUND[(v.bg as keyof typeof GROUND) || 'meadow'] ?? 80;
  const actors: Actor[] = v.actors || [];
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {actors.map((a, i) => (
        <ActorView key={i} a={a} i={i} ground={ground} />
      ))}
    </div>
  );
};

export const sceneHasFlo = (v: any) => (v.actors || []).some((a: Actor) => a.e === 'flo');
