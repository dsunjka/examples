import React from 'react';
import {interpolate} from 'remotion';
import {Card, Stage, Tag} from '../components/ui';
import {atOf, Emo, useBeat} from '../beat';
import {C, color, FONT} from '../theme';
import type {VProps} from './types';

const VOWELS = /[aeiouäöüyAEIOUÄÖÜY]/;

/* =========================== silben =========================== */
export const SilbenV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const syl: string[] = v.syllables || [v.word || ''];
  const word: string = v.word ?? syl.join('');
  const ats = syl.map((_, i) => (v.at || [])[i]);
  const tot = syl.join('').length;
  const fs = (tot > 10 ? 84 : tot > 7 ? 100 : 118) * (v.picture ? 0.84 : 1);
  const mergeAt: number | undefined = v.merge;
  const km = mergeAt !== undefined ? b.p(mergeAt, 0.6) : 0;
  const kv = v.vowels ? b.p(v.vowelsAt ?? 0.6, 0.4) : 0;
  const kPic = v.picture ? b.sp(v.pictureAt ?? (mergeAt ?? 0.75)) : 0;
  const gap = 34 * (1 - km);
  const colors = [color(v.colors?.[0], C.syl1), color(v.colors?.[1], C.syl2)];
  return (
    <Stage>
      {/* Feste Lage (unabhängig von clap/count), damit "continue"-Beats nicht springen:
          Klatsch-Hände ragen nach oben, Schilder hängen unten dran, ohne das Wort zu verschieben. */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 44, position: 'relative'}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap}}>
          {v.picture && (
            <div style={{transform: `scale(${kPic})`, marginRight: 30 - gap, alignSelf: 'center'}}>
              <Emo e={v.picture} size={110} />
            </div>
          )}
          {syl.map((s, i) => {
            const at = atOf(ats, i, 0.05, 0.65);
            const k = b.sp(at, 0, 10);
            const swing = interpolate(b.f, [b.at(at), b.at(at) + 0.45 * b.fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const col = colors[i % 2];
            const kc = v.clap ? b.sp(at) : 0;
            const clapScale = v.clap ? 1 + 0.25 * Math.max(0, 1 - (b.f - b.at(at)) / (0.3 * b.fps)) : 1;
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', paddingBottom: 40}}>
                {v.clap && (
                  <div style={{position: 'absolute', top: -96, transform: `scale(${kc * clapScale})`, opacity: Math.min(1, kc) * (1 - km)}}>
                    <Emo e="👏" size={70} />
                  </div>
                )}
                <div
                  style={{
                    fontFamily: FONT, fontWeight: 700, fontSize: fs, lineHeight: 1.1, color: km > 0.5 && !v.keepColors ? C.ink : col,
                    transform: `translateY(${(1 - k) * 40}px)`, opacity: Math.min(1, k * 2), padding: `0 ${2 * (1 - km)}px`,
                  }}
                >
                  {s.split('').map((ch, ci) => {
                    const isV = VOWELS.test(ch) && kv > 0;
                    return (
                      <span
                        key={ci}
                        style={{
                          display: 'inline-block',
                          borderRadius: fs,
                          padding: isV ? '0 0.06em' : 0,
                          background: isV ? `radial-gradient(circle at 50% 58%, rgba(255,197,51,${0.75 * kv}) 0 ${fs * 0.36}px, transparent ${fs * 0.37}px)` : 'none',
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </div>
                {/* Bogen absolut: nimmt keine Breite ein (sonst bleiben nach dem Zusammenrücken Lücken im Wort) */}
                <svg width={Math.max(60, s.length * fs * 0.55)} height={40} viewBox="0 0 100 40" preserveAspectRatio="none" style={{opacity: 1 - km, position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)'}}>
                  <path d="M6 6 Q50 62 94 6" stroke={col} strokeWidth={7} fill="none" strokeLinecap="round" opacity={swing > 0.02 ? 1 : 0} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - swing} vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            );
          })}
        </div>
        {((mergeAt !== undefined && v.mergeText) || v.count) && (
          <div style={{position: 'absolute', top: '100%', marginTop: 4, display: 'flex', gap: 18, alignItems: 'center', whiteSpace: 'nowrap'}}>
            {mergeAt !== undefined && v.mergeText && (
              <div style={{opacity: km, transform: `scale(${0.8 + 0.2 * km})`}}>
                <Tag text={v.mergeText ?? word} size={52} color={b.accent} />
              </div>
            )}
            {v.count && <Tag text={v.count} size={44} color={b.accent} k={b.sp(v.countAt ?? 0.75)} />}
          </div>
        )}
      </div>
    </Stage>
  );
};

/* =========================== buchstaben =========================== */
type Letter = {l: string; pic?: string; word?: string; at?: number};

export const BuchstabenV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const letters: Letter[] = v.letters || [];
  const ats = letters.map((x) => x.at);
  const n = letters.length;
  const cw = n <= 3 ? 180 : n === 4 ? 150 : 120;
  const blendAt: number | undefined = v.blendAt;
  const kb = blendAt !== undefined ? b.p(blendAt, 0.7) : 0;
  const kPic = v.picture ? b.sp((blendAt ?? 0.8) + 0.1) : 0;
  return (
    <Stage>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{display: 'flex', gap: 20 * (1 - kb) + 4, alignItems: 'flex-start'}}>
          {letters.map((L, i) => {
            const at = atOf(ats, i, 0.05, 0.7);
            const k = b.sp(at);
            const kp = b.sp(at + 0.06);
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: cw}}>
                <div
                  style={{
                    width: cw, height: cw * 0.95, borderRadius: 24, background: '#fff',
                    border: `5px ${k > 0.05 ? 'solid' : 'dashed'} ${k > 0.05 ? color(v.color, C.sprache) : C.inkFaint}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 5px 0 rgba(43,45,66,0.12)', opacity: v.boxes || k > 0.02 ? 1 : 0,
                  }}
                >
                  <span style={{fontFamily: FONT, fontWeight: 700, fontSize: cw * 0.62, color: C.ink, transform: `scale(${k})`, display: 'inline-block', lineHeight: 1, marginTop: -cw * 0.08}}>{L.l}</span>
                </div>
                {L.pic && (
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${kp * (1 - kb)})`, opacity: 1 - kb, height: 130}}>
                    <Emo e={L.pic} size={78} />
                    {L.word && (
                      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 32, color: C.inkSoft, marginTop: 4}}>
                        <span style={{color: color(v.color, C.sprache)}}>{L.word.slice(0, L.l.length)}</span>
                        {L.word.slice(L.l.length)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {v.word && blendAt !== undefined && (
          <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: letters.some((l) => l.pic) ? -130 : 0, opacity: kb, transform: `translateY(${(1 - kb) * 30}px)`}}>
            <Card style={{padding: '4px 34px 14px', fontFamily: FONT, fontWeight: 700, fontSize: 90, color: b.accent, border: `5px solid ${b.accent}`}}>{v.word}</Card>
            {v.picture && <Emo e={v.picture} size={110} style={{transform: `scale(${kPic})`}} />}
          </div>
        )}
      </div>
    </Stage>
  );
};

/* =========================== satz =========================== */
export const SatzV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const words: string[] = v.words || [];
  const end: string = v.end ?? '.';
  const ats = words.map((_, i) => (v.at || [])[i]);
  const all = [...words, end];
  const len = words.join('').length;
  const fs = len > 18 ? 46 : len > 12 ? 54 : 62;
  const driveIn = v.continue ? 1 : b.p(-0.08, 1.2);
  const capAt = v.capitalAt ?? 0.3;
  const kCap = v.capital === false ? 0 : b.p(capAt, 0.4);
  const hl: number[] = v.highlight || [];
  const kHl = b.p(v.highlightAt ?? 0.55, 0.4);
  const endAt = v.endAt ?? 0.75;
  const kEnd = b.sp(endAt);
  const wheel = (x: number) => (
    <div style={{position: 'absolute', bottom: -22, left: x, width: 34, height: 34, borderRadius: 17, background: C.ink, border: '6px solid #9aa0bf', boxSizing: 'border-box'}} />
  );
  const letterHl = (w: string, on: number) => (
    <>
      <span style={{position: 'relative', display: 'inline-block'}}>
        <span style={{position: 'absolute', left: '50%', top: '55%', width: fs * 0.95, height: fs * 0.95, marginLeft: -fs * 0.475, marginTop: -fs * 0.475, borderRadius: fs, background: C.gold, opacity: 0.75 * on, transform: `scale(${0.5 + 0.5 * on})`}} />
        <span style={{position: 'relative', color: on > 0.5 ? '#c2410c' : undefined}}>{w[0]}</span>
      </span>
      {w.slice(1)}
    </>
  );
  return (
    <Stage>
      <div style={{position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 10, transform: `translateX(${(1 - driveIn) * 900}px)`, marginTop: 40}}>
        {/* Schienen */}
        <div style={{position: 'absolute', left: -400, right: -400, bottom: -30, height: 8, background: '#8a5a36', borderRadius: 4}} />
        {all.map((w, i) => {
          const isLoco = i === 0;
          const isEnd = i === all.length - 1;
          const at = isEnd ? endAt : atOf(ats, i, 0.0, 0.6);
          const k = isEnd ? kEnd : b.p(at, 0.3);
          const wagonColor = isLoco ? '#e0433a' : isEnd ? C.gold : ['#3b7ddd', '#22b26b', '#8e6cef', '#ff8a3d'][(i - 1) % 4];
          return (
            <div key={i} style={{position: 'relative', display: 'flex', alignItems: 'flex-end'}}>
              {i > 0 && <div style={{width: 14, height: 8, background: C.ink, marginBottom: 18, marginLeft: -10, marginRight: 0}} />}
              <div
                style={{
                  position: 'relative', minWidth: isEnd ? 80 : 110, height: isLoco ? 130 : 104, padding: '0 18px',
                  background: wagonColor, borderRadius: isLoco ? '40px 16px 10px 10px' : 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.15)',
                  transform: isEnd ? `scale(${kEnd})` : 'none', transformOrigin: '50% 100%',
                }}
              >
                {isLoco && (
                  <>
                    <div style={{position: 'absolute', left: 18, top: -42, width: 30, height: 46, background: C.ink, borderRadius: '8px 8px 0 0'}} />
                    <div style={{position: 'absolute', left: 6 - ((b.sec * 20) % 20), top: -78 - ((b.sec * 30) % 30), width: 34, height: 26, borderRadius: 20, background: '#fff', opacity: 0.8}} />
                  </>
                )}
                <div
                  style={{
                    background: '#fff', borderRadius: 12, padding: '0 14px 6px', fontFamily: FONT, fontWeight: 700,
                    fontSize: isEnd ? fs * 1.2 : fs, color: C.ink, opacity: k, lineHeight: 1.15, minWidth: isEnd ? 40 : undefined, textAlign: 'center',
                  }}
                >
                  {isEnd ? w : isLoco ? letterHl(w, kCap) : hl.includes(i) ? letterHl(w, kHl) : w}
                </div>
                {isLoco && v.labels?.start && (
                  <div style={{position: 'absolute', top: '100%', marginTop: 34, left: '50%', transform: 'translateX(-50%)'}}>
                    <Tag text={v.labels.start} size={32} color="#c2410c" k={b.sp(capAt + 0.05)} />
                  </div>
                )}
                {isEnd && v.labels?.end && (
                  <div style={{position: 'absolute', top: '100%', marginTop: 34, left: '50%', transform: 'translateX(-50%)'}}>
                    <Tag text={v.labels.end} size={32} color={C.goldDark} k={b.sp(endAt + 0.05)} />
                  </div>
                )}
                {wheel(14)}
                {!isEnd && wheel(isLoco ? 70 : 60)}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
