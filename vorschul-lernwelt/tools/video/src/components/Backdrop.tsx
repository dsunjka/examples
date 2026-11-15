import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rnd} from '../beat';
import {EMOJI} from '../theme';

// Einfache, ruhige Landschaften (statisch → winzige Videodateien).
export type BgName =
  | 'plain' | 'meadow' | 'street' | 'classroom' | 'forest' | 'forest-winter'
  | 'bathroom' | 'water-tank' | 'shop' | 'night' | 'kitchen' | 'south';

export const BG_NAMES: BgName[] = ['plain', 'meadow', 'street', 'classroom', 'forest', 'forest-winter', 'bathroom', 'water-tank', 'shop', 'night', 'kitchen', 'south'];

/** Bodenhöhe (in Prozent der Bildhöhe), auf der Figuren mit y=100 … stehen. */
export const GROUND: Record<BgName, number> = {
  plain: 76, meadow: 76, street: 71, classroom: 77, forest: 76, 'forest-winter': 76,
  bathroom: 76, 'water-tank': 76, shop: 77, night: 76, kitchen: 74, south: 76,
};

const Sky: React.FC<{a: string; b: string}> = ({a, b}) => (
  <>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
    </defs>
    <rect width="960" height="540" fill="url(#sky)" />
  </>
);

const Cloud: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 0.95}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx="0" cy="0" rx="46" ry="22" fill="#fff" />
    <ellipse cx="34" cy="-12" rx="34" ry="24" fill="#fff" />
    <ellipse cx="66" cy="2" rx="36" ry="20" fill="#fff" />
  </g>
);

const Pine: React.FC<{x: number; y: number; s?: number; snow?: boolean}> = ({x, y, s = 1, snow}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-8" y="-20" width="16" height="30" fill="#7a4e2d" />
    <path d="M0 -150 L48 -60 L-48 -60 Z" fill="#2f8a57" />
    <path d="M0 -110 L60 -20 L-60 -20 Z" fill="#2a7d4f" />
    {snow && (
      <>
        <path d="M0 -150 L20 -112 Q0 -104 -20 -112 Z" fill="#fff" />
        <path d="M-60 -20 Q-40 -30 -24 -22 Q0 -32 24 -22 Q40 -30 60 -20 Z" fill="#fff" />
        <path d="M-48 -60 Q-30 -70 -12 -62 Q8 -72 26 -62 Q40 -68 48 -60 Z" fill="#fff" />
      </>
    )}
  </g>
);

const Leafy: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#3dbe6b'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-9" y="-70" width="18" height="80" rx="6" fill="#8a5a36" />
    <circle cx="0" cy="-110" r="54" fill={c} />
    <circle cx="-38" cy="-80" r="36" fill={c} />
    <circle cx="40" cy="-82" r="38" fill={c} />
  </g>
);

const Snow: React.FC<{frame: number}> = ({frame}) => (
  <g>
    {Array.from({length: 46}, (_, i) => {
      const x = (rnd(i) * 1000 + Math.sin(frame / 30 + i) * 14) % 980;
      const y = ((rnd(i + 99) * 560 + frame * (0.7 + rnd(i + 7) * 0.8)) % 580) - 20;
      return <circle key={i} cx={x} cy={y} r={2.5 + rnd(i + 3) * 3} fill="#fff" opacity="0.9" />;
    })}
  </g>
);

export const Backdrop: React.FC<{name?: BgName | string; frame: number}> = ({name = 'plain', frame}) => {
  const n = (BG_NAMES as string[]).includes(name) ? (name as BgName) : 'plain';
  return (
    <AbsoluteFill>
      <svg width="960" height="540" viewBox="0 0 960 540" style={{position: 'absolute', inset: 0}}>
        {n === 'plain' && (
          <>
            <Sky a="#bfe8ff" b="#fff4dc" />
            <Cloud x={90} y={70} s={0.9} o={0.7} />
            <Cloud x={780} y={56} s={0.7} o={0.6} />
          </>
        )}
        {(n === 'meadow' || n === 'south') && (
          <>
            <Sky a={n === 'south' ? '#9fdcff' : '#aee2ff'} b={n === 'south' ? '#fff0c9' : '#e8f7ff'} />
            <circle cx="840" cy="84" r="46" fill="#ffd54a" />
            <circle cx="840" cy="84" r="62" fill="#ffd54a" opacity="0.25" />
            <Cloud x={120} y={80} />
            <Cloud x={470} y={56} s={0.8} />
            {n === 'south' ? (
              <>
                <rect y="370" width="960" height="170" fill="#f6dc9b" />
                <path d="M0 360 Q240 340 480 358 T960 352 L960 380 L0 380 Z" fill="#62c6e8" />
                <text x="770" y="390" fontSize="150" fontFamily={EMOJI}>🌴</text>
                <text x="830" y="250" fontSize="80" fontFamily={EMOJI}>🌴</text>
              </>
            ) : (
              <>
                <path d="M0 330 Q200 280 420 320 T960 300 L960 540 L0 540 Z" fill="#8fdc8a" />
                <path d="M0 380 Q260 350 520 380 T960 370 L960 540 L0 540 Z" fill="#6cc96e" />
                {Array.from({length: 14}, (_, i) => (
                  <circle key={i} cx={40 + i * 68 + rnd(i) * 30} cy={430 + rnd(i + 5) * 90} r={6} fill={i % 3 === 0 ? '#ffd54a' : i % 3 === 1 ? '#fff' : '#ff9ec4'} />
                ))}
              </>
            )}
          </>
        )}
        {n === 'street' && (
          <>
            <Sky a="#b4e3ff" b="#eaf7ff" />
            <Cloud x={160} y={70} s={0.8} />
            <Cloud x={700} y={50} s={0.7} />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${i * 200 + 20} 0)`}>
                <rect x="0" y={180 + (i % 2) * 30} width="150" height={150 - (i % 2) * 30} fill={['#ffd8a8', '#cfe3ff', '#ffc9d6', '#d9f2c4', '#ffe8a3'][i]} />
                <path d={`M-10 ${180 + (i % 2) * 30} L75 ${120 + (i % 2) * 30} L160 ${180 + (i % 2) * 30} Z`} fill="#e0775a" />
                <rect x="24" y={226 + (i % 2) * 20} width="34" height="34" rx="4" fill="#fff" />
                <rect x="92" y={226 + (i % 2) * 20} width="34" height="34" rx="4" fill="#fff" />
              </g>
            ))}
            <rect y="330" width="960" height="60" fill="#d9d4cc" />
            <rect y="386" width="960" height="8" fill="#b9b2a8" />
            <rect y="394" width="960" height="110" fill="#5b6070" />
            <rect y="500" width="960" height="8" fill="#b9b2a8" />
            <rect y="508" width="960" height="32" fill="#d9d4cc" />
          </>
        )}
        {n === 'classroom' && (
          <>
            <rect width="960" height="540" fill="#fff3d6" />
            <rect y="380" width="960" height="160" fill="#e3b97f" />
            {Array.from({length: 12}, (_, i) => (
              <rect key={i} x={i * 80} y="380" width="2" height="160" fill="#c99a5f" />
            ))}
            <rect x="250" y="50" width="460" height="230" rx="12" fill="#8a5a36" />
            <rect x="262" y="62" width="436" height="206" rx="6" fill="#2f6b4f" />
            <text x="300" y="130" fontSize="44" fill="#fff" opacity="0.6" fontFamily="Andika">A b C  1 2 3</text>
            <rect x="40" y="80" width="150" height="190" rx="10" fill="#cdeeff" stroke="#fff" strokeWidth="10" />
            <rect x="770" y="80" width="150" height="190" rx="10" fill="#cdeeff" stroke="#fff" strokeWidth="10" />
          </>
        )}
        {(n === 'forest' || n === 'forest-winter') && (
          <>
            <Sky a={n === 'forest' ? '#ffe2b8' : '#cfe0f0'} b={n === 'forest' ? '#fff4dc' : '#f4f8fc'} />
            {n === 'forest' ? (
              <>
                <Leafy x={90} y={380} s={1.1} c="#f29b38" />
                <Leafy x={300} y={366} s={0.8} c="#e2683c" />
                <Leafy x={640} y={366} s={0.85} c="#f4b942" />
                <Leafy x={870} y={380} s={1.05} c="#e2683c" />
                <rect y="364" width="960" height="176" fill="#c9a26b" />
                {Array.from({length: 30}, (_, i) => (
                  <ellipse key={i} cx={rnd(i) * 960} cy={384 + rnd(i + 3) * 150} rx="10" ry="5" fill={['#e2683c', '#f4b942', '#a0522d'][i % 3]} />
                ))}
              </>
            ) : (
              <>
                <Pine x={90} y={384} s={1.15} snow />
                <Pine x={250} y={366} s={0.8} snow />
                <Pine x={700} y={366} s={0.85} snow />
                <Pine x={870} y={384} s={1.1} snow />
                <path d="M0 364 Q240 344 480 364 T960 360 L960 540 L0 540 Z" fill="#ffffff" />
                <path d="M0 450 Q300 430 600 450 T960 446 L960 540 L0 540 Z" fill="#eef4fb" />
                <Snow frame={frame} />
              </>
            )}
          </>
        )}
        {n === 'night' && (
          <>
            <Sky a="#1d2a55" b="#3b4f86" />
            <circle cx="820" cy="90" r="40" fill="#fff6c8" />
            <circle cx="836" cy="80" r="36" fill="#2a3a6c" />
            {Array.from({length: 26}, (_, i) => (
              <circle key={i} cx={rnd(i) * 960} cy={rnd(i + 40) * 300} r={1.5 + rnd(i + 2) * 2} fill="#fff" opacity={0.6 + 0.4 * Math.sin(frame / 12 + i)} />
            ))}
            <path d="M0 370 Q240 340 480 366 T960 360 L960 540 L0 540 Z" fill="#2c4a3e" />
          </>
        )}
        {n === 'bathroom' && (
          <>
            <rect width="960" height="540" fill="#e4f4fb" />
            {Array.from({length: 13}, (_, i) => (
              <rect key={'v' + i} x={i * 80} y="0" width="2" height="380" fill="#c8e4f0" />
            ))}
            {Array.from({length: 5}, (_, i) => (
              <rect key={'h' + i} x="0" y={i * 80} width="960" height="2" fill="#c8e4f0" />
            ))}
            <rect y="380" width="960" height="160" fill="#b9dce9" />
          </>
        )}
        {n === 'water-tank' && (
          <>
            <Sky a="#e8f7ff" b="#fff4dc" />
            <rect y="390" width="960" height="150" fill="#e3b97f" />
            <rect x="120" y="110" width="720" height="290" rx="20" fill="#bfe8ff" opacity="0.55" stroke="#9ccbe6" strokeWidth="8" />
            <rect x="128" y="190" width="704" height="202" rx="12" fill="#5ab8ef" opacity="0.6" />
          </>
        )}
        {n === 'shop' && (
          <>
            <rect width="960" height="540" fill="#fff0dc" />
            {[110, 230].map((y) => (
              <rect key={y} x="40" y={y} width="880" height="12" rx="6" fill="#c08a55" />
            ))}
            {[110, 230].map((y, r) =>
              ['🍎', '🥕', '🧃', '🍌', '🥖', '🧀', '🍐', '🥛', '🍪', '🍅', '🧸', '⚽'].map((e, i) => (
                <text key={y + e} x={60 + i * 72} y={y - 6} fontSize="48" fontFamily={EMOJI} opacity="0.9">
                  {['🍎', '🥕', '🧃', '🍌', '🥖', '🧀', '🍐', '🥛', '🍪', '🍅', '🧸', '⚽'][(i + r * 4) % 12]}
                </text>
              )),
            )}
            <rect y="400" width="960" height="140" fill="#d8a46f" />
            <rect x="600" y="330" width="360" height="80" rx="10" fill="#9bd4a8" />
          </>
        )}
        {n === 'kitchen' && (
          <>
            <rect width="960" height="540" fill="#fff7e6" />
            <rect x="0" y="300" width="960" height="140" fill="#ffd8a8" />
            <rect x="0" y="292" width="960" height="14" fill="#e8a868" />
            <rect y="440" width="960" height="100" fill="#e3b97f" />
            <rect x="680" y="60" width="200" height="160" rx="12" fill="#cdeeff" stroke="#fff" strokeWidth="10" />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};
