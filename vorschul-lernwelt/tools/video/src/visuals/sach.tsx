import React from 'react';
import {interpolate} from 'remotion';
import {Stage, Tag} from '../components/ui';
import {atOf, Emo, rnd, useBeat} from '../beat';
import {C, EMOJI, FONT, NAMED} from '../theme';
import type {VProps} from './types';

/* =========================== strasse =========================== */
type Car = {lane?: 'near' | 'far'; at?: number; until?: number; stop?: boolean; e?: string};
type LightStep = {state: 'red' | 'green'; at?: number};

const PedLight: React.FC<{state: 'red' | 'green'; x: number}> = ({state, x}) => (
  <g transform={`translate(${x} 0)`}>
    <rect x="-7" y="250" width="14" height="270" fill="#6b7080" />
    <rect x="-38" y="150" width="76" height="140" rx="14" fill="#2b2d42" />
    <circle cx="0" cy="186" r="28" fill={state === 'red' ? '#ff4a4a' : '#5a2a2a'} />
    <circle cx="0" cy="254" r="28" fill={state === 'green' ? '#2fe07a' : '#1f4a32'} />
    {state === 'red' && <circle cx="0" cy="186" r="44" fill="#ff4a4a" opacity="0.25" />}
    {state === 'green' && <circle cx="0" cy="254" r="44" fill="#2fe07a" opacity="0.25" />}
    {/* stehendes Männchen */}
    <g fill={state === 'red' ? '#fff' : '#8a4a4a'}>
      <circle cx="0" cy="172" r="5" />
      <rect x="-6" y="178" width="12" height="16" rx="3" />
      <rect x="-6" y="192" width="5" height="12" />
      <rect x="1" y="192" width="5" height="12" />
    </g>
    {/* gehendes Männchen */}
    <g fill={state === 'green' ? '#fff' : '#3a6a4a'}>
      <circle cx="2" cy="240" r="5" />
      <path d="M-3 246 L6 246 L8 260 L14 270 L9 272 L3 262 L-2 272 L-7 270 L-2 258 Z" />
    </g>
  </g>
);

export const StrasseV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  // Ampel-Zustand
  let light: 'red' | 'green' | null = null;
  if (typeof v.light === 'string') light = v.light;
  if (Array.isArray(v.light)) {
    const steps: LightStep[] = v.light;
    light = steps[0]?.state ?? 'red';
    for (const s of steps) if (b.f >= b.at(s.at ?? 0)) light = s.state;
  }
  const zebra = v.zebra !== false;
  // Blickrichtung
  const looks: string[] = v.look || [];
  const lookAts = looks.map((_, i) => (v.lookAt || [])[i]);
  let look: string | null = null;
  looks.forEach((l, i) => {
    if (b.f >= b.at(atOf(lookAts, i, 0.15, 0.7))) look = l;
  });
  const lookIdx = looks.reduce((acc, _, i) => (b.f >= b.at(atOf(lookAts, i, 0.15, 0.7)) ? i : acc), -1);
  const kLook = lookIdx >= 0 ? b.sp(atOf(lookAts, lookIdx, 0.15, 0.7), 0, 12) : 0;
  // Gehen
  const kWalk = v.walk !== undefined ? b.p(v.walk, 2.2) : 0;
  const childY = 528 - kWalk * 258;
  const childS = 1 - kWalk * 0.3;
  const childX = v.childX ?? 470;
  const cars: Car[] = v.cars || [];
  const night = !!v.night;
  const parked = !!v.parked;
  // Blick-Schild (Pfeil + Wort, ca. 230 px breit) nicht über die Ampel (x 612–688) legen.
  const LOOK_W = 230, AMP_L = 604, AMP_R = 696;
  const lookLeft = (dir: string) => {
    let l = dir === 'left' ? childX - 220 : childX + 60;
    if (light && l < AMP_R && l + LOOK_W > AMP_L) l = dir === 'left' ? AMP_L - LOOK_W : AMP_R;
    l = Math.max(8, Math.min(960 - LOOK_W - 8, l));
    return l - childX;
  };
  return (
    <div style={{position: 'absolute', inset: 0, isolation: 'isolate'}}>
      <svg width="960" height="540" viewBox="0 0 960 540" style={{position: 'absolute', inset: 0}}>
        <rect width="960" height="300" fill={night ? '#1d2a55' : '#b4e3ff'} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${i * 200 + 10} 0)`}>
            <rect x="0" y={120 + (i % 2) * 24} width="160" height={140 - (i % 2) * 24} fill={night ? '#3a466e' : ['#ffd8a8', '#cfe3ff', '#ffc9d6', '#d9f2c4', '#ffe8a3'][i]} />
            <path d={`M-10 ${120 + (i % 2) * 24} L80 ${66 + (i % 2) * 24} L170 ${120 + (i % 2) * 24} Z`} fill={night ? '#2a3458' : '#e0775a'} />
            <rect x="26" y={160 + (i % 2) * 16} width="36" height="36" rx="4" fill={night ? '#ffe9a0' : '#fff'} />
            <rect x="98" y={160 + (i % 2) * 16} width="36" height="36" rx="4" fill={night ? '#ffe9a0' : '#fff'} />
          </g>
        ))}
        <rect y="252" width="960" height="40" fill="#d9d4cc" />
        <rect y="288" width="960" height="8" fill="#b9b2a8" />
        <rect y="296" width="960" height="134" fill="#5b6070" />
        {Array.from({length: 8}, (_, i) => (
          <rect key={i} x={i * 130 + 10} y="360" width="70" height="8" rx="4" fill="#e9e9e9" opacity={zebra && i >= 3 && i <= 4 ? 0 : 0.8} />
        ))}
        {zebra &&
          Array.from({length: 6}, (_, i) => (
            <rect key={i} x={392 - i * 2} y={302 + i * 21.5} width={176 + i * 4} height="12" rx="2" fill="#f4f4f4" />
          ))}
        <rect y="430" width="960" height="10" fill="#b9b2a8" />
        <rect y="440" width="960" height="100" fill="#d9d4cc" />
        {light && <PedLight state={light} x={650} />}
      </svg>
      {/* Autos */}
      {cars.map((c, i) => {
        const lane = c.lane ?? 'near';
        const s = b.at(c.at ?? 0.1);
        const dur = (c.stop ? 2.0 : 2.6) * b.fps;
        const e = c.until !== undefined ? b.at(c.until) : s + dur;
        const k = interpolate(b.f, [s, e], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const ek = c.stop ? 1 - Math.pow(1 - k, 2.4) : k;
        const near = lane === 'near';
        const startX = near ? -200 : 1160;
        const endX = c.stop ? (near ? 320 : 660) : near ? 1160 : -200;
        const x = startX + (endX - startX) * ek;
        const y = near ? 432 : 340;
        const size = near ? 140 : 110;
        const bounce = k > 0 && k < 1 ? Math.abs(Math.sin(b.sec * 18)) * 2 : 0;
        return (
          <div key={i} style={{position: 'absolute', left: x - size / 2, top: y - size - bounce, zIndex: near ? 5 : 2}}>
            <Emo e={c.e ?? '🚗'} size={size} style={{transform: near ? 'scaleX(-1)' : undefined}} />
          </div>
        );
      })}
      {parked && (
        <>
          <div style={{position: 'absolute', left: 250, top: 300, zIndex: 6}}><Emo e="🚙" size={150} style={{transform: 'scaleX(-1)'}} /></div>
          <div style={{position: 'absolute', left: 540, top: 300, zIndex: 6}}><Emo e="🚐" size={150} style={{transform: 'scaleX(-1)'}} /></div>
        </>
      )}
      {/* Kind */}
      <div style={{position: 'absolute', left: childX, top: childY, width: 0, height: 0, zIndex: 4}}>
        {night && (
          <div style={{position: 'absolute', left: -110, top: -200, width: 220, height: 220, borderRadius: 110, background: 'radial-gradient(circle, rgba(255,240,150,0.65), rgba(255,240,150,0) 70%)'}} />
        )}
        <div style={{position: 'absolute', left: -70, top: -150, width: 140, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', transform: `scale(${childS}) ${look === 'right' ? 'scaleX(-1)' : ''}`, transformOrigin: '50% 100%'}}>
          <Emo e={v.child ?? '🧒'} size={120} style={{transform: kWalk > 0 && kWalk < 1 ? `translateY(${-Math.abs(Math.sin(b.sec * 9)) * 6}px)` : undefined}} />
          
        </div>
        {night && (
          <div style={{position: 'absolute', left: 40 * childS, top: -96 * childS, transform: `scale(${childS})`, transformOrigin: 'left top'}}>
            <Emo e="🦺" size={74} />
            <Emo e="✨" size={36} style={{position: 'absolute', right: -24, top: -12, opacity: 0.5 + 0.5 * Math.sin(b.sec * 5)}} />
          </div>
        )}
        {look && (
          <div style={{position: 'absolute', top: -250, left: lookLeft(look), display: 'flex', alignItems: 'center', gap: 6, transform: `scale(${kLook})`, flexDirection: look === 'left' ? 'row' : 'row-reverse'}}>
            <div style={{fontSize: 70, fontWeight: 700, color: b.accent, fontFamily: FONT, lineHeight: 1}}>{look === 'left' ? '⬅' : '➡'}</div>
            <Tag text={look === 'left' ? 'links' : 'rechts'} size={40} color={b.accent} />
          </div>
        )}
      </div>
      {night && <div style={{position: 'absolute', inset: 0, background: 'rgba(15,22,60,0.45)', zIndex: 3, pointerEvents: 'none'}} />}
    </div>
  );
};

/* =========================== wasser =========================== */
type Thing = {e: string; result: 'float' | 'sink'; at?: number; label?: string; size?: number};

export const WasserV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const items: Thing[] = v.items || [];
  const ats = items.map((x) => x.at);
  const n = Math.max(1, items.length);
  // Becken etwas tiefer, damit die wartenden Gegenstände (und ❓) ganz im Bild sind.
  const tankL = 60, tankR = 710, tankTop = 146, surf = 218, bottom = 408;
  const kIn = v.continue ? 1 : b.sp(-0.08, 0, 14);
  return (
    <Stage>
      <svg width={770} height={424} viewBox="0 0 770 424" style={{position: 'absolute', inset: 0, overflow: 'visible', transform: `scale(${kIn})`}}>
        <rect x={tankL} y={tankTop} width={tankR - tankL} height={bottom - tankTop + 10} rx={18} fill="#e9f7ff" stroke="#9ccbe6" strokeWidth={8} />
        <path d={`M${tankL + 4} ${surf} ${Array.from({length: 14}, (_, i) => `Q${tankL + 4 + (i + 0.5) * ((tankR - tankL - 8) / 14)} ${surf + Math.sin(b.sec * 2 + i) * 5} ${tankL + 4 + (i + 1) * ((tankR - tankL - 8) / 14)} ${surf}`).join(' ')} L${tankR - 4} ${bottom} L${tankL + 4} ${bottom} Z`} fill="#5ab8ef" opacity={0.75} />
        <rect x={tankL + 20} y={surf + 20} width={18} height={bottom - surf - 40} rx={9} fill="#fff" opacity={0.3} />
      </svg>
      {items.map((it, i) => {
        const size = it.size ?? 92;
        const x = tankL + ((tankR - tankL) * (i + 0.5)) / n;
        const at = atOf(ats, i, 0.1, 0.65);
        const s = b.at(at);
        const fallEnd = s + 0.45 * b.fps;
        const settleEnd = fallEnd + (it.result === 'sink' ? 1.4 : 0.6) * b.fps;
        const waitY = Math.min(tankTop - 12, Math.max(size + 18, 110));
        const floatY = surf + size * 0.18;
        const sinkY = bottom - 6;
        let y = waitY, rot = 0;
        if (b.f >= s) {
          if (b.f < fallEnd) {
            const k = (b.f - s) / (fallEnd - s);
            y = waitY + (floatY - waitY) * k * k;
          } else if (it.result === 'float') {
            const k = Math.min(1, (b.f - fallEnd) / (settleEnd - fallEnd));
            y = floatY + Math.sin(k * Math.PI * 2) * 14 * (1 - k) + Math.sin(b.sec * 2.4 + i) * 4;
            rot = Math.sin(b.sec * 2 + i) * 5;
          } else {
            const k = Math.min(1, (b.f - fallEnd) / (settleEnd - fallEnd));
            const ek = 1 - Math.pow(1 - k, 2);
            y = floatY + (sinkY - floatY) * ek;
            rot = Math.sin(k * 8) * 8 * (1 - k);
          }
        }
        const kW = b.sp(-0.05 + i * 0.05);
        const splashK = interpolate(b.f, [fallEnd, fallEnd + 0.6 * b.fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const kRes = v.results === false ? 0 : b.sp((settleEnd - b.lead) / b.narr + 0.02);
        const bubbles = it.result === 'sink' && b.f > fallEnd && b.f < settleEnd + 1.2 * b.fps;
        const resText = it.label ?? (it.result === 'float' ? 'schwimmt' : 'sinkt');
        return (
          <React.Fragment key={i}>
            {splashK > 0 && splashK < 1 && (
              <div style={{position: 'absolute', left: x - 60 * (0.5 + splashK), top: surf - 10 * (0.5 + splashK), width: 120 * (0.5 + splashK), height: 20 * (0.5 + splashK), borderRadius: '50%', border: '4px solid #fff', opacity: 1 - splashK}} />
            )}
            {bubbles &&
              [0, 1, 2].map((q) => {
                const t = ((b.f - fallEnd) / b.fps + q * 0.4) % 1.2;
                return <div key={q} style={{position: 'absolute', left: x - 20 + q * 16, top: y - size * 0.5 - t * 120, width: 12, height: 12, borderRadius: 6, border: '3px solid #fff', opacity: Math.max(0, 1 - t)}} />;
              })}
            <div style={{position: 'absolute', left: x - size / 2, top: y - size, width: size, height: size, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', transform: `scale(${kW}) rotate(${rot}deg)`, transformOrigin: '50% 80%'}}>
              <Emo e={it.e} size={size * 0.9} />
            </div>
            {v.guess && b.f < s && (
              <div style={{position: 'absolute', left: x + size * 0.25, top: Math.max(-6, waitY - size - 30), transform: `scale(${b.sp(0.02)})`}}>
                <Emo e="❓" size={44} />
              </div>
            )}
            {kRes > 0 && (
              <div style={{position: 'absolute', left: x, top: it.result === 'float' ? surf + 64 : sinkY - size - 66, transform: 'translateX(-50%)', zIndex: 2}}>
                <Tag text={resText} k={kRes} size={resText.length > 16 ? 28 : 32} color={it.result === 'float' ? C.ok : NAMED.blue} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </Stage>
  );
};

/* =========================== zahn =========================== */
const KAI = [
  {k: 'K', id: 'kau', word: 'Kauflächen'},
  {k: 'A', id: 'aussen', word: 'Außenflächen'},
  {k: 'I', id: 'innen', word: 'Innenflächen'},
];

const Brush: React.FC<{x: number; y: number; rot: number; mirror?: boolean}> = ({x, y, rot, mirror}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${mirror ? -1 : 1} 1)`}>
    <rect x={-20} y={-12} width={260} height={24} rx={12} fill="#3b7ddd" />
    <rect x={150} y={-8} width={70} height={16} rx={8} fill="#7fb0f0" />
    <rect x={-70} y={-16} width={70} height={32} rx={8} fill="#e8eef8" />
    {Array.from({length: 7}, (_, i) => (
      <rect key={i} x={-66 + i * 9} y={16} width={6} height={22} rx={2} fill={i % 2 ? '#7fd3ff' : '#ffffff'} stroke="#c8d4e6" strokeWidth={1} />
    ))}
  </g>
);

export const ZahnV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const area: string = v.area ?? 'kau';
  const t = b.sec;
  const cx = 220, top = 120;
  const kIn = v.continue ? 1 : b.sp(-0.08, 0, 14);
  const kBrush = b.p(v.brushAt ?? 0.1, 0.5);
  // aktive Fläche (bei "alle" reihum)
  const zones = ['kau', 'aussen', 'innen'];
  const active = area === 'alle' ? zones[Math.floor(Math.max(0, b.f - b.at(0.1)) / (Math.max(1, b.narr) / 3)) % 3] : area;
  let bx = cx, by = top - 50, rot = 0;
  if (active === 'kau') { bx = cx - 30 + Math.sin(t * 9) * 46; by = top - 46; rot = 0; }
  if (active === 'aussen') { bx = cx - 175 + Math.cos(t * 7) * 12; by = top + 70 + Math.sin(t * 7) * 12; rot = -90; }
  if (active === 'innen') { const ph = (t * 1.6) % 1; bx = cx + 175; by = top + 150 - ph * 110; rot = 90; }
  const glow = 0.45 + 0.35 * Math.sin(t * 4);
  const dirty = v.dirt ? 1 - b.p(0.15, Math.max(0.5, (0.7 * b.narr) / b.fps)) : 0;
  const kClean = v.clean !== undefined ? b.sp(v.clean) : 0;
  const zonePath: Record<string, string> = {
    kau: `M${cx - 112} ${top + 18} Q${cx - 80} ${top - 26} ${cx - 40} ${top + 6} Q${cx} ${top - 30} ${cx + 40} ${top + 6} Q${cx + 80} ${top - 26} ${cx + 112} ${top + 18}`,
    aussen: `M${cx - 114} ${top + 24} Q${cx - 128} ${top + 110} ${cx - 104} ${top + 200}`,
    innen: `M${cx + 114} ${top + 24} Q${cx + 128} ${top + 110} ${cx + 104} ${top + 200}`,
  };
  return (
    <Stage>
      <svg width={770} height={424} viewBox="0 0 770 424" style={{position: 'absolute', inset: 0, overflow: 'visible', transform: `scale(${kIn})`}}>
        {/* Zahnfleisch */}
        <rect x={cx - 190} y={top + 190} width={380} height={130} rx={50} fill="#ff9fb0" />
        {/* Wurzeln */}
        <path d={`M${cx - 80} ${top + 180} Q${cx - 86} ${top + 280} ${cx - 50} ${top + 300} Q${cx - 30} ${top + 240} ${cx} ${top + 220} Q${cx + 30} ${top + 240} ${cx + 50} ${top + 300} Q${cx + 86} ${top + 280} ${cx + 80} ${top + 180} Z`} fill="#fff6e8" stroke="#e7d6bd" strokeWidth={4} />
        <rect x={cx - 190} y={top + 196} width={380} height={40} rx={20} fill="#ff9fb0" />
        {/* Krone */}
        <path d={`M${cx - 112} ${top + 18} Q${cx - 80} ${top - 26} ${cx - 40} ${top + 6} Q${cx} ${top - 30} ${cx + 40} ${top + 6} Q${cx + 80} ${top - 26} ${cx + 112} ${top + 18} Q${cx + 130} ${top + 110} ${cx + 104} ${top + 206} L${cx - 104} ${top + 206} Q${cx - 130} ${top + 110} ${cx - 112} ${top + 18} Z`} fill="#ffffff" stroke="#d9e2ee" strokeWidth={5} />
        <ellipse cx={cx - 50} cy={top + 70} rx={18} ry={34} fill="#eef5ff" />
        {/* Gesicht */}
        <circle cx={cx - 40} cy={top + 104} r={9} fill={C.ink} />
        <circle cx={cx + 40} cy={top + 104} r={9} fill={C.ink} />
        <path d={`M${cx - 26} ${top + 134} Q${cx} ${top + 156} ${cx + 26} ${top + 134}`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        <ellipse cx={cx - 66} cy={top + 128} rx={12} ry={7} fill="#ffb3a1" opacity={0.7} />
        <ellipse cx={cx + 66} cy={top + 128} rx={12} ry={7} fill="#ffb3a1" opacity={0.7} />
        {/* aktive Fläche leuchtet */}
        {zones.map((z) => (
          <path key={z} d={zonePath[z]} stroke={C.gold} strokeWidth={22} fill="none" strokeLinecap="round" opacity={z === active ? glow : 0} />
        ))}
        {/* Schmutz */}
        {dirty > 0 && Array.from({length: 8}, (_, i) => (
          <circle key={i} cx={cx - 90 + rnd(i) * 180} cy={top + 10 + rnd(i + 4) * 60} r={7 + rnd(i + 9) * 5} fill="#d6b35a" opacity={dirty * 0.85} />
        ))}
        {/* Bürste + Schaum */}
        <g opacity={kBrush}>
          {[0, 1, 2, 3].map((q) => (
            <circle key={q} cx={bx + (active === 'kau' ? 0 : -40) + rnd(q + Math.floor(t * 6)) * 40} cy={by + (active === 'kau' ? 34 : 0) + (rnd(q + 3) - 0.5) * 30} r={7 + q * 2} fill="#fff" stroke="#cfe6ff" strokeWidth={2} />
          ))}
          <Brush x={bx} y={by} rot={rot} mirror={active === 'kau'} />
        </g>
      </svg>
      {/* KAI-Spalte */}
      <div style={{position: 'absolute', left: 410, top: 30, display: 'flex', flexDirection: 'column', gap: 16}}>
        {KAI.map((z, i) => {
          const on = z.id === active;
          const k = b.sp(i * 0.06 - 0.05);
          return (
            <div key={z.k} style={{display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${k * (on ? 1.08 : 0.92)})`, transformOrigin: 'left center', opacity: on ? 1 : 0.8}}>
              <div style={{width: 76, height: 76, borderRadius: 38, background: on ? b.accent : '#fff', color: on ? '#fff' : C.ink, fontFamily: FONT, fontWeight: 700, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 0 rgba(43,45,66,0.14)', paddingBottom: 6, boxSizing: 'border-box'}}>{z.k}</div>
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 31, color: on ? C.ink : C.inkSoft, background: on ? '#fff' : 'rgba(255,255,255,0.85)', borderRadius: 14, padding: '0 12px 4px', whiteSpace: 'nowrap'}}>{z.word}</div>
            </div>
          );
        })}
        {v.timer && (
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, transform: `scale(${b.sp(v.timerAt ?? 0.3)})`, transformOrigin: 'left center'}}>
            <span style={{fontFamily: EMOJI, fontSize: 60}}>⏱️</span>
            <Tag text={v.timer} size={36} color={b.accent} />
          </div>
        )}
      </div>
      {kClean > 0 && [0, 1, 2].map((q) => (
        <div key={q} style={{position: 'absolute', left: [80, 310, 200][q], top: [90, 120, 40][q], transform: `scale(${kClean * (0.8 + 0.3 * Math.sin(t * 5 + q))})`}}>
          <Emo e="✨" size={56} />
        </div>
      ))}
    </Stage>
  );
};
