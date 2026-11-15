import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, STAGE} from '../theme';
import {Marked, useBeat} from '../beat';

/** Inhaltsbereich (lässt Platz für Flo unten links und die Untertitelzeile). */
export const Stage: React.FC<{children: React.ReactNode; style?: React.CSSProperties; full?: boolean}> = ({children, style, full}) => (
  <div
    style={{
      position: 'absolute',
      left: full ? 0 : STAGE.left,
      top: full ? 0 : STAGE.top,
      width: full ? 960 : STAGE.width,
      height: full ? 540 : STAGE.height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT,
      color: C.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Große Untertitelzeile unten (≥ 46 px). */
export const Caption: React.FC<{text: string; left: number}> = ({text, left}) => {
  const {p, accent} = useBeat();
  const k = p(-0.02, 0.35);
  const len = text.length;
  const size = len > 30 ? 44 : len > 22 ? 48 : 54;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left,
          right: 18,
          bottom: 16,
          height: 84,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: k,
          transform: `translateY(${(1 - k) * 24}px)`,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.96)',
            borderRadius: 26,
            padding: '6px 30px 10px',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.12,
            color: C.ink,
            boxShadow: '0 5px 0 rgba(43,45,66,0.14), 0 10px 22px rgba(43,45,66,0.12)',
            border: `4px solid ${accent}`,
            maxWidth: '100%',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Marked text={text} accent={accent} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Sprechblase (Text oder Emoji). tail: Richtung des Zipfels. */
export const Bubble: React.FC<{
  children: React.ReactNode;
  k: number; // 0..1 Einblenden
  tail?: 'left' | 'right' | 'down' | 'none';
  style?: React.CSSProperties;
  size?: number;
  think?: boolean;
}> = ({children, k, tail = 'left', style, size = 44, think}) => (
  <div
    style={{
      position: 'absolute',
      background: '#fff',
      borderRadius: think ? 60 : 30,
      padding: '12px 26px 16px',
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.15,
      color: C.ink,
      boxShadow: '0 5px 0 rgba(43,45,66,0.12), 0 10px 24px rgba(43,45,66,0.12)',
      transform: `scale(${k})`,
      opacity: Math.min(1, k * 2),
      textAlign: 'center',
      ...style,
    }}
  >
    {children}
    {tail !== 'none' && !think && (
      <div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          ...(tail === 'left'
            ? {left: -22, bottom: 22, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderRight: '26px solid #fff'}
            : tail === 'right'
              ? {right: -22, bottom: 22, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: '26px solid #fff'}
              : {left: '50%', bottom: -22, marginLeft: -14, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '26px solid #fff'}),
        }}
      />
    )}
    {think && (
      <>
        <div style={{position: 'absolute', left: -6, bottom: -16, width: 22, height: 22, borderRadius: 11, background: '#fff'}} />
        <div style={{position: 'absolute', left: -22, bottom: -32, width: 12, height: 12, borderRadius: 6, background: '#fff'}} />
      </>
    )}
  </div>
);

/** Weiße Karte mit weichem Schatten. */
export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 28,
      boxShadow: '0 6px 0 rgba(43,45,66,0.12), 0 12px 26px rgba(43,45,66,0.1)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Kleines Text-Schild (z. B. unter Figuren). */
export const Tag: React.FC<{text: string; k?: number; color?: string; size?: number; style?: React.CSSProperties}> = ({
  text, k = 1, color = C.ink, size = 30, style,
}) => (
  <div
    style={{
      display: 'inline-block',
      background: '#fff',
      color,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      padding: '2px 16px 5px',
      borderRadius: 16,
      boxShadow: '0 3px 0 rgba(43,45,66,0.14)',
      transform: `scale(${k})`,
      opacity: Math.min(1, k * 2),
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);
