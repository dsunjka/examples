import React from 'react';

// Flo, der Fuchs – dasselbe SVG wie in der App (js/core/ui.js, UI.floSVG),
// erweitert um sprechenden Mund, Blinzeln, Gefühle und Pfoten-Gesten.
export type FloEmotion = 'neutral' | 'happy' | 'surprised' | 'think' | 'wink' | 'cold';
export type FloGesture = 'none' | 'wave' | 'point' | 'cheer';

export const Flo: React.FC<{
  size: number;
  frame: number;
  fps: number;
  talk?: number; // 0..1 Lautstärke (Mund)
  emotion?: FloEmotion;
  gesture?: FloGesture;
  flip?: boolean;
  bob?: boolean;
  style?: React.CSSProperties;
}> = ({size, frame, fps, talk = 0, emotion = 'neutral', gesture = 'none', flip, bob = true, style}) => {
  const t = frame / fps;
  // Blinzeln: alle ~3,4 s für 0,15 s
  const cyc = (t + 0.7) % 3.4;
  const blink = cyc < 0.15 ? 0.12 : 1;
  const y = bob ? Math.sin(t * 2.2) * 2.2 : 0;
  const tail = Math.sin(t * 3.1) * 7;
  const mouthRy = 0.6 + Math.min(1, talk) * 7;
  const shiver = emotion === 'cold' ? Math.sin(t * 40) * 0.8 : 0;
  const happyEyes = emotion === 'happy' && talk < 0.05;
  const eyeRy = emotion === 'surprised' ? 12 : 10;
  const browLift = emotion === 'surprised' ? -6 : emotion === 'think' ? -3 : 0;
  const wave = Math.sin(t * 7) * 18;
  const look = emotion === 'think' ? 3 : 0;

  const eye = (cx: number, closed: boolean) =>
    closed || happyEyes ? (
      <path d={`M${cx - 8} ${62} Q${cx} ${52} ${cx + 8} ${62}`} stroke="#2b2d42" strokeWidth={4} fill="none" strokeLinecap="round" />
    ) : (
      <g transform={`translate(${cx} 60) scale(1 ${blink}) translate(${-cx} -60)`}>
        <ellipse cx={cx} cy={60} rx={8} ry={eyeRy} fill="#2b2d42" />
        <circle cx={cx + 3 + look} cy={56 - look} r={3} fill="#fff" />
      </g>
    );

  return (
    <svg
      width={size}
      height={size}
      viewBox="-10 -6 160 150"
      style={{overflow: 'visible', transform: `translate(${shiver}px, ${y}px) ${flip ? 'scaleX(-1)' : ''}`, ...style}}
    >
      <g transform={`rotate(${tail} 96 106)`}>
        <path d="M100 112 C128 108 138 84 128 62 C122 84 108 94 92 98 Z" fill="#ff8a3d" />
        <path d="M128 62 C134 74 132 88 124 98 C122 88 124 74 128 62 Z" fill="#fff" />
      </g>
      <ellipse cx="70" cy="114" rx="30" ry="20" fill="#ff8a3d" />
      <ellipse cx="70" cy="118" rx="17" ry="13" fill="#fff4e8" />
      {/* Pfoten */}
      {gesture === 'none' && (
        <>
          <ellipse cx="52" cy="128" rx="9" ry="6" fill="#e86f22" />
          <ellipse cx="88" cy="128" rx="9" ry="6" fill="#e86f22" />
        </>
      )}
      {gesture === 'wave' && (
        <g transform={`rotate(${wave * 0.8} 96 110)`}>
          <path d="M94 110 C114 102 130 88 138 70" stroke="#ff8a3d" strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="139" cy="66" r="9" fill="#fff4e8" stroke="#e86f22" strokeWidth="2" />
        </g>
      )}
      {gesture === 'point' && (
        <g>
          <path d="M92 110 C108 108 122 104 134 100" stroke="#ff8a3d" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="136" cy="99" r="8" fill="#fff4e8" stroke="#e86f22" strokeWidth="2" />
        </g>
      )}
      {gesture === 'cheer' && (
        <g transform={`translate(0 ${Math.sin(t * 8) * 3})`}>
          <path d="M46 110 C26 102 10 88 2 70" stroke="#ff8a3d" strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="1" cy="66" r="9" fill="#fff4e8" stroke="#e86f22" strokeWidth="2" />
          <path d="M94 110 C114 102 130 88 138 70" stroke="#ff8a3d" strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="139" cy="66" r="9" fill="#fff4e8" stroke="#e86f22" strokeWidth="2" />
        </g>
      )}
      <path d="M26 46 L34 6 L58 32 Z" fill="#ff8a3d" stroke="#e86f22" strokeWidth="2" strokeLinejoin="round" />
      <path d="M33 38 L37 16 L50 31 Z" fill="#5a3a2e" />
      <path d="M114 46 L106 6 L82 32 Z" fill="#ff8a3d" stroke="#e86f22" strokeWidth="2" strokeLinejoin="round" />
      <path d="M107 38 L103 16 L90 31 Z" fill="#5a3a2e" />
      <path d="M70 22 C104 22 122 44 120 66 C118 88 98 104 70 104 C42 104 22 88 20 66 C18 44 36 22 70 22 Z" fill="#ff8a3d" />
      <path d="M70 58 C84 58 104 66 116 72 C112 92 94 104 70 104 C46 104 28 92 24 72 C36 66 56 58 70 58 Z" fill="#fff4e8" />
      <ellipse cx="34" cy="80" rx="8" ry="5" fill="#ffb3a1" opacity={emotion === 'happy' ? 1 : 0.75} />
      <ellipse cx="106" cy="80" rx="8" ry="5" fill="#ffb3a1" opacity={emotion === 'happy' ? 1 : 0.75} />
      {eye(50, false)}
      {eye(90, emotion === 'wink')}
      <path d={`M40 ${44 + browLift} Q50 ${39 + browLift} 59 ${44 + browLift}`} stroke="#5a3a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path
        d={emotion === 'think' ? 'M81 40 Q90 36 100 42' : `M81 ${44 + browLift} Q90 ${39 + browLift} 100 ${44 + browLift}`}
        stroke="#5a3a2e" strokeWidth="3" fill="none" strokeLinecap="round"
      />
      <ellipse cx="70" cy="76" rx="8" ry="5.5" fill="#2b2d42" />
      {emotion === 'surprised' && talk < 0.05 ? (
        <ellipse cx="70" cy="89" rx="5" ry="6" fill="#c2414b" />
      ) : (
        <>
          <path d={emotion === 'happy' ? 'M57 84 Q70 96 83 84' : 'M60 85 Q70 92 80 85'} stroke="#2b2d42" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="70" cy={87 + mouthRy * 0.35} rx={6 + mouthRy * 0.25} ry={mouthRy} fill="#c2414b" />
        </>
      )}
      {emotion === 'cold' && (
        <g>
          <path d="M24 50 Q22 10 70 10 Q118 10 116 50 Z" fill="#3b7ddd" />
          <rect x="20" y="40" width="100" height="14" rx="7" fill="#7fb0f0" />
          <circle cx="70" cy="8" r="10" fill="#fff" />
        </g>
      )}
    </svg>
  );
};
