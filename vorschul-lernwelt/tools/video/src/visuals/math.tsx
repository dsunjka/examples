import React from 'react';
import {interpolate} from 'remotion';
import {Flo} from '../components/Flo';
import {Card, Stage, Tag} from '../components/ui';
import {atOf, Emo, rnd, useBeat} from '../beat';
import {C, color, FONT, NAMED} from '../theme';
import type {VProps} from './types';

/* =========================== zehnerfeld =========================== */
type Group = {n: number; color?: string; e?: string; at?: number; until?: number; from?: 'right' | 'left' | 'top' | 'scatter' | 'none'; label?: string};

export const ZehnerfeldV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const size: number = v.size === 20 ? 20 : 10;
  const boxes: number = size === 20 ? 1 : Math.max(1, Math.min(3, v.boxes || 1));
  const total = size === 20 ? 20 : 10 * boxes;
  const cell = size === 20 ? 62 : boxes === 3 ? 44 : boxes === 2 ? 58 : 70;
  const pad = 14;
  const boxGap = 40;
  // Zellpositionen
  const pos = (i: number) => {
    if (size === 20) {
      const r = Math.floor(i / 10), c = i % 10;
      return {x: pad + c * cell + (c >= 5 ? 18 : 0), y: pad + r * cell};
    }
    const bx = Math.floor(i / 10), j = i % 10;
    const r = Math.floor(j / 5), c = j % 5;
    return {x: bx * (5 * cell + 2 * pad + boxGap) + pad + c * cell, y: pad + r * cell};
  };
  const boxW = size === 20 ? 10 * cell + 18 + 2 * pad : 5 * cell + 2 * pad;
  const boxH = 2 * cell + 2 * pad;
  const W = size === 20 ? boxW : boxes * boxW + (boxes - 1) * boxGap;
  const schachtel = v.style === 'schachtel';
  const groups: Group[] = v.groups || [];
  const gAts = groups.map((g) => g.at);
  // Punkte erzeugen
  type Dot = {i: number; col: string; e?: string; t0: number; from: string};
  const dots: Dot[] = [];
  let idx = 0;
  groups.forEach((g, gi) => {
    const a = atOf(gAts, gi, 0.05, 0.55);
    const z = g.until ?? a + Math.min(0.45, 0.06 * g.n + 0.1);
    for (let k = 0; k < g.n && idx < total; k++, idx++) {
      const t = g.n <= 1 ? a : a + ((z - a) * k) / (g.n - 1);
      dots.push({i: idx, col: color(g.color, gi === 0 ? NAMED.red : NAMED.blue), e: g.e ?? v.emoji, t0: t, from: g.from ?? v.from ?? 'none'});
    }
  });
  const landed = dots.filter((d) => b.f >= b.at(d.t0) + 0.35 * b.fps).length;
  const kBox = v.continue ? 1 : b.sp(-0.08, 0, 14);
  const dotR = cell * 0.36;
  // Markierungen
  type Mark = {from: number; to: number; at?: number; label?: string; color?: string};
  const marks: Mark[] = [...(v.marks || [])];
  if (v.highlightFive) {
    for (let s = 0; s < total; s += 5) marks.push({from: s + 1, to: s + 5, at: v.fiveAt ?? 0.75, color: v.fiveColor ?? 'yellow'});
  }
  const top = (424 - boxH) / 2 - (v.count ? 40 : 0);
  return (
    <Stage>
      <div style={{position: 'absolute', left: (770 - W) / 2, top, width: W, height: boxH, transform: `scale(${kBox})`}}>
        {Array.from({length: size === 20 ? 1 : boxes}, (_, bi) => (
          <div
            key={bi}
            style={{
              position: 'absolute', left: bi * (boxW + boxGap), top: 0, width: boxW, height: boxH,
              background: schachtel ? '#d9a066' : '#fff', borderRadius: schachtel ? 10 : 22,
              border: schachtel ? '6px solid #a8703f' : `5px solid ${C.ink}`,
              boxShadow: '0 6px 0 rgba(43,45,66,0.14)', boxSizing: 'border-box',
            }}
          >
            {schachtel && (
              <>
                <div style={{position: 'absolute', left: -6, top: -34, width: boxW * 0.5, height: 30, background: '#c98e55', borderRadius: '8px 8px 0 0', transform: 'skewX(-12deg)', border: '5px solid #a8703f', borderBottom: 0}} />
                <div style={{position: 'absolute', right: -6, top: -34, width: boxW * 0.5, height: 30, background: '#c98e55', borderRadius: '8px 8px 0 0', transform: 'skewX(12deg)', border: '5px solid #a8703f', borderBottom: 0}} />
              </>
            )}
          </div>
        ))}
        {/* leere Felder */}
        {Array.from({length: total}, (_, i) => {
          const p = pos(i);
          return (
            <div
              key={'c' + i}
              style={{
                position: 'absolute', left: p.x - (schachtel ? 0 : 0), top: p.y, width: cell, height: cell,
                boxSizing: 'border-box', border: schachtel ? '2px dashed #a8703f' : `2px solid ${C.line}`,
                background: schachtel ? '#e6b47e' : '#fafbff',
              }}
            />
          );
        })}
        {/* Markierungen */}
        {marks.map((m, mi) => {
          const ps = [];
          for (let i = m.from - 1; i <= m.to - 1; i++) ps.push(pos(i));
          const x0 = Math.min(...ps.map((p) => p.x)) - 6, y0 = Math.min(...ps.map((p) => p.y)) - 6;
          const x1 = Math.max(...ps.map((p) => p.x)) + cell + 6, y1 = Math.max(...ps.map((p) => p.y)) + cell + 6;
          const k = b.sp(m.at ?? 0.7);
          const col = color(m.color, b.accent);
          return (
            <div key={'m' + mi} style={{position: 'absolute', left: x0, top: y0, width: x1 - x0, height: y1 - y0, border: `6px solid ${col}`, borderRadius: 16, opacity: Math.min(1, k), transform: `scale(${0.8 + 0.2 * k})`, zIndex: 3}}>
              {m.label && (
                <div style={{position: 'absolute', left: '50%', top: -58, transform: 'translateX(-50%)'}}>
                  <Tag text={m.label} size={34} color={col} />
                </div>
              )}
            </div>
          );
        })}
        {/* Punkte */}
        {dots.map((d, k) => {
          const p = pos(d.i);
          const s = b.at(d.t0);
          const prog = interpolate(b.f, [s, s + 0.35 * b.fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const e = 1 - Math.pow(1 - prog, 3);
          let sx = 0, sy = 0, sc = 1;
          if (d.from === 'right') sx = (1 - e) * (W - p.x + 160);
          if (d.from === 'left') sx = -(1 - e) * (p.x + 160);
          if (d.from === 'top') sy = -(1 - e) * (p.y + 200);
          if (d.from === 'scatter') {
            const tx = 20 + rnd(k + 1) * (W - 40) - p.x;
            const ty = boxH + 40 + rnd(k + 20) * 70 - p.y;
            sx = (1 - e) * tx;
            sy = (1 - e) * ty;
          }
          if (d.from === 'none') sc = b.sp(d.t0);
          const vis = d.from === 'scatter' ? 1 : b.f >= s ? 1 : 0;
          const hop = d.from !== 'none' && prog > 0 && prog < 1 ? -Math.sin(prog * Math.PI) * 30 : 0;
          return (
            <div
              key={'d' + k}
              style={{
                position: 'absolute', left: p.x + cell / 2, top: p.y + cell / 2, width: 0, height: 0, opacity: vis, zIndex: 2,
                transform: `translate(${sx}px, ${sy + hop}px) scale(${sc})`,
              }}
            >
              {d.e ? (
                <Emo e={d.e} size={cell * 0.78} style={{position: 'absolute', left: -cell * 0.39, top: -cell * 0.42}} />
              ) : (
                <div style={{position: 'absolute', left: -dotR, top: -dotR, width: 2 * dotR, height: 2 * dotR, borderRadius: dotR, background: d.col, boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.15)'}} />
              )}
            </div>
          );
        })}
      </div>
      {/* Legende / Zähler */}
      <div style={{position: 'absolute', top: top + boxH + 34, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center'}}>
        {groups.filter((g) => g.label).map((g, gi) => (
          <Tag key={gi} text={g.label as string} size={34} color={color(g.color, gi === 0 ? NAMED.red : NAMED.blue)} k={b.sp(atOf(gAts, groups.indexOf(g), 0.05, 0.55) + 0.1)} />
        ))}
        {v.count && (
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 64, color: b.accent, minWidth: 80, textAlign: 'center', background: '#fff', borderRadius: 20, padding: '0 22px 6px', boxShadow: '0 4px 0 rgba(43,45,66,0.14)'}}>
            {landed}
          </div>
        )}
      </div>
    </Stage>
  );
};

/* =========================== zahlenstrahl =========================== */
type Jump = {from?: number; to: number; at?: number; until?: number; label?: string; color?: string; hops?: boolean; below?: boolean};

export const ZahlenstrahlV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const from: number = v.from ?? 0;
  const to: number = v.to ?? 20;
  const W = 770, lineY = 272, x0 = v.wide === false ? 40 : -120, x1 = W - 44;
  const unit = (x1 - x0) / (to - from);
  const X = (n: number) => x0 + (n - from) * unit;
  const range = to - from;
  const every = v.labelEvery ?? (range <= 20 ? 1 : range <= 50 ? 5 : 10);
  const marks: number[] = v.marks || [];
  const kIn = v.continue ? 1 : b.p(-0.05, 0.5);
  // Sprünge (mit optionaler Zerlegung in Einzelhüpfer)
  const raw: Jump[] = v.jumps || [];
  const rawAts = raw.map((j) => j.at);
  type Arc = {a: number; z: number; s: number; e: number; label?: string; col: string; below?: boolean; groupEnd: boolean; gs: number; ge: number; ga: number; gz: number};
  const arcs: Arc[] = [];
  let cur: number = v.start ?? raw[0]?.from ?? from;
  raw.forEach((j, ji) => {
    const a = j.from ?? cur;
    const st = atOf(rawAts, ji, 0.1, 0.65);
    const en = j.until ?? st + Math.min(0.35, 0.08 * Math.abs(j.to - a) + 0.12);
    const col = color(j.color, ji % 2 === 0 ? b.accent : NAMED.blue);
    if (j.hops && Math.abs(j.to - a) > 1) {
      const n = Math.abs(j.to - a), dir = Math.sign(j.to - a);
      for (let h = 0; h < n; h++) {
        arcs.push({a: a + h * dir, z: a + (h + 1) * dir, s: st + ((en - st) * h) / n, e: st + ((en - st) * (h + 1)) / n, col, below: j.below, groupEnd: h === n - 1, label: h === n - 1 ? j.label : undefined, gs: st, ge: en, ga: a, gz: j.to});
      }
    } else {
      arcs.push({a, z: j.to, s: st, e: en, label: j.label, col, below: j.below, groupEnd: true, gs: st, ge: en, ga: a, gz: j.to});
    }
    cur = j.to;
  });
  const arcH = (a: number, z: number) => Math.min(150, 34 + Math.abs(z - a) * unit * 0.35);
  // Hüpfer-Position
  let hx = X(v.start ?? raw[0]?.from ?? from), hy = lineY;
  for (const arc of arcs) {
    const s = b.at(arc.s), e = b.at(arc.e);
    if (b.f >= e) { hx = X(arc.z); hy = lineY; continue; }
    if (b.f > s) {
      const k = (b.f - s) / (e - s);
      const ax = X(arc.a), zx = X(arc.z), h = arcH(arc.a, arc.z) * (arc.below ? -1 : 1);
      hx = ax + (zx - ax) * k;
      hy = lineY - 4 * h * k * (1 - k) * 0.5 * 2;
    }
    break;
  }
  const hopper = v.hopper ?? 'flo';
  const showHopper = hopper !== 'none';
  return (
    <Stage>
      <svg width={770} height={424} viewBox="0 0 770 424" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: kIn}}>
        {/* Zehner-Brücke: goldene Säule hinter der Zahl */}
        {v.bridge !== undefined && (
          <g>
            <rect x={X(v.bridge) - 15} y={lineY - 136} width={30} height={156} rx={15} fill={C.gold} opacity={0.35} />
            <g transform={`translate(${X(v.bridge)} ${lineY - 168})`}>
              <rect x={-52} y={-5} width={104} height={10} rx={4} fill="#a0673a" />
              <path d="M-46 30 Q0 -14 46 30" stroke="#a0673a" strokeWidth={8} fill="none" strokeLinecap="round" />
              {[-30, -15, 15, 30].map((x) => (
                <line key={x} x1={x} y1={4} x2={x} y2={30 - (1 - (x / 46) ** 2) * 22} stroke="#a0673a" strokeWidth={4} />
              ))}
              {[-48, -24, 0, 24, 48].map((x) => (
                <line key={'r' + x} x1={x} y1={-5} x2={x} y2={-18} stroke="#a0673a" strokeWidth={4} strokeLinecap="round" />
              ))}
              <line x1={-50} y1={-17} x2={50} y2={-17} stroke="#a0673a" strokeWidth={4} strokeLinecap="round" />
            </g>
          </g>
        )}
        <line x1={x0 - 20} y1={lineY} x2={x1 + 24} y2={lineY} stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
        <path d={`M${x1 + 24} ${lineY - 12} L${x1 + 40} ${lineY} L${x1 + 24} ${lineY + 12} Z`} fill={C.ink} />
        {Array.from({length: range + 1}, (_, i) => {
          const n = from + i;
          const big = n % 10 === 0 || n % 5 === 0;
          const lab = n % every === 0 || marks.includes(n) || n === v.bridge;
          const hl = marks.includes(n) || n === v.bridge;
          return (
            <g key={n}>
              <line x1={X(n)} y1={lineY - (big ? 16 : 10)} x2={X(n)} y2={lineY + (big ? 16 : 10)} stroke={C.ink} strokeWidth={big ? 5 : 3} />
              {lab && (
                <>
                  {hl && <circle cx={X(n)} cy={lineY + 50} r={range > 20 ? 22 : 26} fill={n === v.bridge ? C.gold : '#fff'} stroke={n === v.bridge ? C.goldDark : b.accent} strokeWidth="4" />}
                  <text x={X(n)} y={lineY + 61} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={Math.min(n % 5 === 0 || hl ? 34 : 30, Math.abs(n) >= 10 ? unit * every * 0.68 : unit * every * 0.9)} fill={C.ink}>
                    {n}
                  </text>
                </>
              )}
            </g>
          );
        })}
        {/* Sprungbögen */}
        {arcs.map((arc, i) => {
          const s = b.at(arc.s), e = b.at(arc.e);
          const k = interpolate(b.f, [s, e], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          if (k <= 0) return null;
          const ax = X(arc.a), zx = X(arc.z);
          const h = arcH(arc.a, arc.z) * (arc.below ? -1 : 1);
          const d = `M${ax} ${lineY - 8} Q${(ax + zx) / 2} ${lineY - 8 - 2 * h} ${zx} ${lineY - 8}`;
          const kl = b.sp(arc.e);
          // Label über dem ganzen Sprung (bei Einzelhüpfern über der Gruppe)
          const gx = (X(arc.ga) + X(arc.gz)) / 2;
          const gh = arc.ga !== arc.a || arc.gz !== arc.z ? arcH(arc.a, arc.z) + 8 : h;
          return (
            <g key={i}>
              <path d={d} stroke={arc.col} strokeWidth="7" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
              {k >= 1 && <circle cx={zx} cy={lineY - 8} r="7" fill={arc.col} />}
              {arc.label && arc.groupEnd && (
                <g transform={`translate(${gx} ${lineY - 8 - (arc.below ? -1 : 1) * (Math.abs(gh) + 30)}) scale(${kl})`}>
                  <rect x={-56} y={-30} width={112} height={52} rx={18} fill="#fff" stroke={arc.col} strokeWidth="4" />
                  <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={arc.col}>{arc.label}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {showHopper && (
        <div style={{position: 'absolute', left: hx, top: hy + 8, width: 0, height: 0, opacity: kIn}}>
          {hopper === 'flo' ? (
            <div style={{position: 'absolute', left: -40, top: -80}}>
              <Flo size={80} frame={b.f} fps={b.fps} talk={0} emotion="happy" bob={false} />
            </div>
          ) : (
            <Emo e={hopper} size={64} style={{position: 'absolute', left: -32, top: -66}} />
          )}
        </div>
      )}
    </Stage>
  );
};

/* =========================== rechnung =========================== */
type Line = {parts: string[]; at?: number[]; box?: boolean | number; split?: {part: number; into: string[]; at?: number}; highlight?: {part: number; at?: number; color?: string}[]};

const isNum = (t: string) => /^[0-9?]+([.,][0-9]+)?\s*(€|ct|cm)?$/.test(t.trim());

export const RechnungV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const lines: Line[] = v.lines || (v.parts ? [{parts: v.parts, at: v.at, box: v.box, split: v.split, highlight: v.highlight}] : []);
  const n = lines.length;
  const fs = n === 1 ? 104 : n === 2 ? 82 : 64;
  const lineAts = lines.map((_, i) => (n <= 1 ? 0 : (0.8 * i) / n));
  const hasSplit = lines.some((l) => l.split);
  return (
    <Stage>
      <div style={{display: 'flex', flexDirection: 'column', gap: hasSplit ? 30 : 18, alignItems: 'center', marginTop: hasSplit ? -60 : 0}}>
        {lines.map((l, li) => {
          const base = lineAts[li];
          const span = n <= 1 ? 0.7 : 0.8 / n - 0.05;
          const ats = l.parts.map((_, i) => l.at?.[i] ?? base + (l.parts.length <= 1 ? 0 : (span * i) / (l.parts.length - 1)));
          const boxIdx = l.box === true ? l.parts.length - 1 : typeof l.box === 'number' ? l.box : -1;
          return (
            <div key={li} style={{display: 'flex', alignItems: 'center', gap: 14, position: 'relative'}}>
              {l.parts.map((t, i) => {
                const k = b.sp(ats[i]);
                const num = isNum(t);
                const hl = (l.highlight || []).find((h) => h.part === i);
                const kh = hl ? b.p(hl.at ?? 0.5, 0.4) : 0;
                const isBox = i === boxIdx;
                const shown = isBox ? b.f >= b.at(ats[i]) : true;
                const kSplit = l.split && l.split.part === i ? b.sp(l.split.at ?? ats[i] + 0.15) : 0;
                return (
                  <div key={i} style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <div
                      style={{
                        fontFamily: FONT, fontWeight: 700, fontSize: num ? fs : fs * 0.85, lineHeight: 1,
                        color: num ? C.ink : C.inkSoft, minWidth: num ? fs * 0.75 : fs * 0.5, textAlign: 'center',
                        padding: num ? '8px 18px 16px' : '0 4px',
                        borderRadius: 24,
                        background: isBox ? '#fff' : hl ? `rgba(255,197,51,${0.85 * kh})` : num ? 'rgba(255,255,255,0.92)' : 'transparent',
                        border: isBox ? `5px dashed ${b.accent}` : num ? '4px solid rgba(43,45,66,0.08)' : 'none',
                        boxShadow: num ? '0 5px 0 rgba(43,45,66,0.12)' : 'none',
                        transform: isBox ? 'none' : `scale(${k})`,
                        opacity: isBox ? Math.min(1, b.sp(Math.max(0, ats[0]))) : Math.min(1, k * 2),
                      }}
                    >
                      {isBox ? (
                        <span style={{display: 'inline-block', transform: `scale(${shown ? k : 1})`, color: shown ? b.accent : C.inkFaint}}>{shown ? t : '?'}</span>
                      ) : (
                        t
                      )}
                    </div>
                    {l.split && l.split.part === i && (
                      <div style={{position: 'absolute', top: '100%', display: 'flex', gap: 30, marginTop: 40, opacity: Math.min(1, kSplit * 1.5), transform: `scale(${kSplit})`}}>
                        <svg width={160} height={44} style={{position: 'absolute', left: '50%', marginLeft: -80, top: -44}}>
                          <line x1={80} y1={2} x2={30} y2={42} stroke={b.accent} strokeWidth={6} strokeLinecap="round" />
                          <line x1={80} y1={2} x2={130} y2={42} stroke={b.accent} strokeWidth={6} strokeLinecap="round" />
                        </svg>
                        {l.split.into.map((s, si) => (
                          <div key={si} style={{width: fs * 0.95, height: fs * 0.95, borderRadius: fs, background: si === 0 ? C.softBg : '#e3efff', border: `5px solid ${si === 0 ? C.zahlen : NAMED.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: fs * 0.6, paddingBottom: 6, boxSizing: 'border-box'}}>
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/* =========================== stellenwert =========================== */
export const StellenwertV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const num: number = Math.max(0, Math.min(99, v.number ?? 13));
  const tens = Math.floor(num / 10), ones = num % 10;
  const [tAt, oAt] = v.at || [0.1, 0.4];
  const kT = b.sp(tAt), kO = b.sp(oAt);
  const kIn = v.continue ? 1 : b.sp(-0.05, 0, 14);
  const bundles = v.bundles !== false;
  const lab = v.labels;
  const col = (title: string, digit: number, k: number, c: string, kind: 'z' | 'e', label?: string) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 250}}>
      <div style={{width: '100%', textAlign: 'center', background: c, color: '#fff', fontWeight: 700, fontSize: 40, padding: '2px 0 6px', borderRadius: kind === 'z' ? '22px 0 0 0' : '0 22px 0 0'}}>{title}</div>
      <div style={{fontSize: 116, fontWeight: 700, lineHeight: 1.05, color: c, transform: `scale(${k})`, height: 128}}>{digit}</div>
      {bundles && (
        <div style={{height: 96, display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap', width: 230, opacity: Math.min(1, k)}}>
          {kind === 'z'
            ? Array.from({length: digit}, (_, i) => (
                <div key={i} style={{width: 20, height: 92, borderRadius: 8, background: `repeating-linear-gradient(180deg, ${c} 0 9px, rgba(255,255,255,0.7) 9px 11px)`, border: `2px solid ${c}`}} />
              ))
            : Array.from({length: digit}, (_, i) => (
                <div key={i} style={{width: 32, height: 32, borderRadius: 16, background: c}} />
              ))}
        </div>
      )}
      {label && (
        <div style={{marginTop: 10}}>
          <Tag text={label} size={30} color={c} k={b.sp(lab?.at ?? 0.6)} />
        </div>
      )}
    </div>
  );
  return (
    <Stage>
      <Card style={{display: 'flex', transform: `scale(${kIn})`, overflow: 'visible', paddingBottom: 16}}>
        {col(v.tensTitle ?? 'Z  Zehner', tens, kT, NAMED.blue, 'z', lab?.tens)}
        <div style={{width: 5, background: C.line}} />
        {col(v.onesTitle ?? 'E  Einer', ones, kO, NAMED.red, 'e', lab?.ones)}
      </Card>
    </Stage>
  );
};

/* =========================== uhr =========================== */
const parseT = (s: string | undefined, d: number) => {
  if (!s) return d;
  const [h, m] = String(s).split(':').map(Number);
  return (h % 12) * 60 + (m || 0);
};

export const UhrV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const target = parseT(v.time ?? v.to, 7 * 60);
  const start = parseT(v.from, target);
  const [a0, a1] = v.at || [0.15, 0.6];
  let end = target;
  if (end < start) end += 720;
  const k = b.p(a0, Math.max(0.3, ((a1 - a0) * b.narr) / b.fps));
  const m = start + (end - start) * k;
  const minA = (m % 60) * 6;
  const hourA = ((m / 60) % 12) * 30;
  const R = 170;
  const kIn = v.continue ? 1 : b.sp(-0.05, 0, 14);
  const hl: string | undefined = v.highlight;
  const glow = 0.5 + 0.5 * Math.sin(b.sec * 5);
  const hh = Math.floor(m / 60) % 12 || 12;
  const mm = Math.round(m % 60);
  const realHour = v.daytime === 'night' ? 21 : v.daytime === 'day' ? 12 : null;
  const digital = `${v.hours24 ? (hh % 12) + 12 : hh}:${String(mm).padStart(2, '0')}`;
  const kIcon = v.icon ? b.sp(v.iconAt ?? a1) : 0;
  const kText = v.text ? b.sp(v.textAt ?? a1 + 0.05) : 0;
  return (
    <Stage>
      <div style={{display: 'flex', alignItems: 'center', gap: 50, transform: `scale(${kIn})`}}>
        <svg width={380} height={380} viewBox="-190 -190 380 380">
          <circle r={R + 12} fill={b.accent} />
          <circle r={R} fill="#fff" />
          {Array.from({length: 60}, (_, i) => {
            const a = (i * 6 * Math.PI) / 180;
            const big = i % 5 === 0;
            return <line key={i} x1={Math.sin(a) * (R - 6)} y1={-Math.cos(a) * (R - 6)} x2={Math.sin(a) * (R - (big ? 22 : 12))} y2={-Math.cos(a) * (R - (big ? 22 : 12))} stroke={C.ink} strokeWidth={big ? 5 : 2} />;
          })}
          {Array.from({length: 12}, (_, i) => {
            const n = i + 1;
            const a = (n * 30 * Math.PI) / 180;
            const special = (v.marks || []).includes(n);
            return (
              <g key={n}>
                {special && <circle cx={Math.sin(a) * (R - 52)} cy={-Math.cos(a) * (R - 52)} r={26} fill={C.gold} opacity={0.7} />}
                <text x={Math.sin(a) * (R - 52)} y={-Math.cos(a) * (R - 52) + 13} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={38} fill={C.ink}>{n}</text>
              </g>
            );
          })}
          {/* Stundenzeiger (kurz) */}
          <g transform={`rotate(${hourA})`}>
            {hl === 'hour' && <line x1={0} y1={14} x2={0} y2={-92} stroke={C.gold} strokeWidth={26} strokeLinecap="round" opacity={0.4 + 0.5 * glow} />}
            <line x1={0} y1={14} x2={0} y2={-92} stroke={C.ink} strokeWidth={15} strokeLinecap="round" />
          </g>
          {/* Minutenzeiger (lang) */}
          <g transform={`rotate(${minA})`}>
            {hl === 'minute' && <line x1={0} y1={18} x2={0} y2={-142} stroke={C.gold} strokeWidth={22} strokeLinecap="round" opacity={0.4 + 0.5 * glow} />}
            <line x1={0} y1={18} x2={0} y2={-142} stroke={NAMED.blue} strokeWidth={9} strokeLinecap="round" />
          </g>
          <circle r={12} fill={C.ink} />
        </svg>
        {(v.digital || v.icon || v.text || v.daytime || hl) && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 260}}>
            {v.daytime && v.daytime !== 'none' && (
              <Emo e={realHour !== null ? (realHour > 19 ? '🌙' : '☀️') : '☀️'} size={74} />
            )}
            {v.icon && <Emo e={v.icon} size={88} style={{transform: `scale(${kIcon})`}} />}
            {v.digital && (
              <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 64, background: C.ink, color: '#9ef0b8', borderRadius: 18, padding: '0 26px 8px', letterSpacing: 2}}>{digital}</div>
            )}
            {hl && (
              <Tag text={hl === 'hour' ? (v.handLabel ?? 'kurz: Stunde') : (v.handLabel ?? 'lang: Minuten')} size={32} color={hl === 'hour' ? C.ink : NAMED.blue} k={b.sp(0.1)} />
            )}
            {v.text && <Tag text={v.text} size={46} color={b.accent} k={kText} />}
          </div>
        )}
      </div>
    </Stage>
  );
};

/* =========================== geld =========================== */
type Money = {v: number; at?: number};
const COIN_MM: Record<string, number> = {'0.01': 16.25, '0.02': 18.75, '0.05': 21.25, '0.1': 19.75, '0.2': 22.25, '0.5': 24.25, '1': 23.25, '2': 25.75};
const BILL: Record<string, string> = {'5': '#a7b8a9', '10': '#e98473', '20': '#78a6dd', '50': '#f0a35e', '100': '#6fbf86'};
export const moneyText = (x: number) => (x >= 1 ? `${x} €` : `${Math.round(x * 100)} ct`);

export const Coin: React.FC<{value: number; scale?: number}> = ({value, scale = 4.6}) => {
  const d = (COIN_MM[String(value)] ?? 23) * scale;
  const euro = value >= 1;
  const copper = value < 0.1;
  const inner = value === 1 ? '#d9dde3' : value === 2 ? '#f2c94c' : copper ? '#d9824a' : '#f0c24b';
  const ring = value === 1 ? '#f2c94c' : value === 2 ? '#d9dde3' : copper ? '#b8642f' : '#d7a52f';
  const label = euro ? `${value}` : `${Math.round(value * 100)}`;
  return (
    <svg width={d} height={d} viewBox="-50 -50 100 100">
      <circle r="49" fill={ring} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
      <circle r={euro ? 34 : 44} fill={inner} stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      <text y={euro ? 12 : 8} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={euro ? 40 : 32} fill="#4a3b1f">{label}</text>
      <text y={euro ? 30 : 30} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={14} fill="#4a3b1f">{euro ? 'EURO' : 'CENT'}</text>
    </svg>
  );
};

export const Bill: React.FC<{value: number; w?: number}> = ({value, w = 190}) => {
  const c = BILL[String(value)] ?? '#a7b8a9';
  return (
    <svg width={w} height={w * 0.53} viewBox="0 0 190 100">
      <rect x="2" y="2" width="186" height="96" rx="10" fill={c} stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
      <rect x="12" y="12" width="166" height="76" rx="6" fill="rgba(255,255,255,0.35)" />
      <circle cx="140" cy="50" r="28" fill="rgba(255,255,255,0.45)" />
      <text x="22" y="66" fontFamily={FONT} fontWeight={700} fontSize="56" fill="#2b2d42">{value}</text>
      <text x="140" y="58" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="22" fill="#2b2d42">EURO</text>
    </svg>
  );
};

const MoneyItem: React.FC<{m: number}> = ({m}) => (m >= 5 ? <Bill value={m} /> : <Coin value={m} />);

export const GeldV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const items: Money[] = (v.items || []).map((x: any) => (typeof x === 'number' ? {v: x} : x));
  const back: Money[] = (v.back || []).map((x: any) => (typeof x === 'number' ? {v: x} : x));
  const ats = items.map((x) => x.at);
  const total = items.reduce((a, x) => a + x.v, 0);
  let running = 0;
  items.forEach((it, i) => {
    if (b.f >= b.at(atOf(ats, i, 0.05, 0.6))) running += it.v;
  });
  const sumAt = v.sumAt ?? 0.8;
  const kSum = v.sum ? b.sp(sumAt) : 0;
  const sumText = typeof v.sum === 'string' ? v.sum : `= ${moneyText(Math.round(total * 100) / 100)}`;
  const kPrice = v.price ? b.sp(v.price.at ?? 0) : 0;
  const backAts = back.map((x) => x.at);
  const kBackLabel = back.length ? b.sp(atOf(backAts, 0, 0.6, 0.85) - 0.03) : 0;
  return (
    <Stage>
      <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
        {v.price && (
          <Card style={{width: 200, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, transform: `scale(${kPrice})`}}>
            <Emo e={v.price.e} size={120} />
            <div style={{background: C.gold, borderRadius: 14, padding: '0 18px 6px', fontSize: 48, fontWeight: 700, transform: 'rotate(-4deg)'}}>{v.price.label ?? moneyText(v.price.v)}</div>
          </Card>
        )}
        <div style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', maxWidth: v.price ? 520 : 760}}>
          <div style={{display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
            {items.map((it, i) => {
              const k = b.sp(atOf(ats, i, 0.05, 0.6));
              return (
                <div key={i} style={{transform: `scale(${k}) rotate(${(rnd(i) - 0.5) * 8}deg)`, opacity: Math.min(1, k * 2)}}>
                  <MoneyItem m={it.v} />
                </div>
              );
            })}
          </div>
          {v.running && running > 0 && !kSum && <Tag text={moneyText(running)} size={46} color={b.accent} />}
          {v.sum && <Tag text={sumText} size={58} color={b.accent} k={kSum} />}
          {back.length > 0 && (
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}>
              <Tag text={v.backLabel ?? 'zurück:'} size={36} k={kBackLabel} />
              {back.map((it, i) => {
                const k = b.sp(atOf(backAts, i, 0.6, 0.85));
                return (
                  <div key={i} style={{transform: `scale(${k})`, opacity: Math.min(1, k * 2)}}>
                    <MoneyItem m={it.v} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Stage>
  );
};
