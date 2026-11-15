import React from 'react';
import {Flo} from '../components/Flo';
import {Bubble, Card, Stage, Tag} from '../components/ui';
import {atOf, Emo, Marked, useBeat} from '../beat';
import {C, color, FONT} from '../theme';
import type {VProps} from './types';

/* ---------------- title ---------------- */
export const TitleV: React.FC<VProps> = ({v, film}) => {
  const b = useBeat();
  const title = v.title ?? film.title;
  const icon = v.icon ?? film.icon;
  const kIcon = b.sp(-0.05);
  const kTitle = b.p(0.02, 0.6);
  const kSub = b.p(0.25, 0.6);
  const kFlo = b.sp(-0.1, 0, 14);
  const size = title.length > 22 ? 58 : title.length > 15 ? 66 : 76;
  return (
    <Stage full>
      <div style={{position: 'absolute', left: 30, bottom: 26, transform: `translateY(${(1 - kFlo) * 260}px)`}}>
        <Flo size={330} frame={b.f} fps={b.fps} talk={b.talk} emotion="happy" gesture="wave" />
      </div>
      <Card
        style={{
          position: 'absolute', left: 360, top: 64, width: 560, height: 412,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: `6px solid ${b.accent}`,
          transform: `scale(${0.85 + 0.15 * kTitle})`, opacity: kTitle,
        }}
      >
        <div
          style={{
            width: 170, height: 170, borderRadius: 85, background: film.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${kIcon}) rotate(${Math.sin(b.sec * 2) * 4}deg)`, marginTop: -10,
          }}
        >
          <Emo e={icon} size={110} />
        </div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: C.ink, textAlign: 'center', padding: '18px 26px 0'}}>
          <Marked text={title} accent={b.accent} />
        </div>
        {v.subtitle && (
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.inkSoft, marginTop: 12, opacity: kSub}}>{v.subtitle}</div>
        )}
      </Card>
    </Stage>
  );
};

/* ---------------- flo ---------------- */
export const FloV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const side = v.side === 'right' ? 'right' : 'left';
  const kIn = v.continue ? 1 : b.sp(-0.1, 0, 14);
  const kB = b.sp(v.bubbleAt ?? 0.1);
  const items: {e: string; at?: number; label?: string}[] = (v.items || []).map((x: any) => (typeof x === 'string' ? {e: x} : x));
  const bubbleIsEmoji = typeof v.bubble === 'string' && !/[A-Za-zÄÖÜäöüß0-9]/.test(v.bubble);
  return (
    <Stage full>
      {/* Mit Untertitel (v._caption, von FloExplainer gesetzt) steht Flo kleiner und höher, damit die Zeile ihn nicht verdeckt. */}
      <div style={{position: 'absolute', [side]: v._caption ? 90 : 70, bottom: v._caption ? 104 : 30, transform: `translateY(${(1 - kIn) * 300}px)`}}>
        <Flo size={v._caption ? 330 : 380} frame={b.f} fps={b.fps} talk={b.talk} emotion={v.emotion} gesture={v.gesture} flip={side === 'right'} />
      </div>
      {v.bubble && (
        <Bubble
          k={kB}
          think={!!v.think}
          tail={side === 'left' ? 'left' : 'right'}
          size={bubbleIsEmoji ? 110 : v.bubble.length > 18 ? 46 : 56}
          style={{[side]: 450, top: items.length ? 50 : v._caption ? 80 : 110, maxWidth: 430, transformOrigin: side === 'left' ? 'left bottom' : 'right bottom'}}
        >
          {bubbleIsEmoji ? <Emo e={v.bubble} size={110} /> : <Marked text={v.bubble} accent={b.accent} />}
        </Bubble>
      )}
      {items.length > 0 && (
        <div style={{position: 'absolute', [side]: 450, top: v.bubble ? (v._caption ? 230 : 280) : 160, width: 494, display: 'flex', gap: items.length > 2 ? 14 : 26, justifyContent: side === 'left' ? 'flex-start' : 'flex-end'}}>
          {items.map((it, i) => {
            const k = b.sp(atOf(items.map((x) => x.at), i, 0.15, 0.7));
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>
                <Emo e={it.e} size={items.length > 2 ? 92 : it.label ? 100 : 110} />
                {it.label && <Tag text={it.label} size={items.length > 2 || it.label.length > 10 ? 28 : 34} style={{marginTop: 6}} />}
              </div>
            );
          })}
        </div>
      )}
    </Stage>
  );
};

/* ---------------- merke ---------------- */
export const MerkeV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const lines: string[] = v.lines || [];
  const kCard = v.continue ? 1 : b.sp(-0.05, 0, 13);
  return (
    <Stage>
      <Card
        style={{
          width: 680, padding: '26px 40px 30px', border: `6px solid ${C.gold}`, background: '#fffaf0',
          transform: `scale(${kCard})`, display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16, fontWeight: 700, fontSize: 40, color: C.goldDark}}>
          <Emo e={v.icon || '💡'} size={58} style={{transform: `rotate(${Math.sin(b.sec * 2.5) * 8}deg)`}} />
          {v.title || 'Merke!'}
        </div>
        {lines.map((l, i) => {
          const k = b.p(atOf(v.at || [], i, 0.05, 0.6), 0.5);
          return (
            <div key={i} style={{fontSize: lines.length > 3 ? 42 : 50, fontWeight: 700, lineHeight: 1.15, opacity: k, transform: `translateX(${(1 - k) * 40}px)`}}>
              <Marked text={l} accent={b.accent} />
            </div>
          );
        })}
      </Card>
    </Stage>
  );
};

/* ---------------- bild ---------------- */
export const BildV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const items: {e: string; label?: string; at?: number; size?: number; n?: number}[] = (v.items || []).map((x: any) =>
    typeof x === 'string' ? {e: x} : x,
  );
  const n = items.length;
  const base = v.size || (n <= 1 ? 200 : n === 2 ? 160 : n === 3 ? 130 : 100);
  return (
    <Stage>
      <div style={{display: 'flex', gap: n > 3 ? 26 : 50, alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap', width: '100%'}}>
        {items.map((it, i) => {
          const k = b.sp(atOf(items.map((x) => x.at), i, 0.0, 0.7));
          const bob = Math.sin(b.sec * 2 + i) * 4;
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transform: `scale(${k}) translateY(${bob}px)`}}>
              <Emo e={it.n ? it.e.repeat(it.n) : it.e} size={it.size || base} />
              {it.label && <Tag text={it.label} size={36} />}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/* ---------------- liste ---------------- */
export const ListeV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const items: {e?: string; text: string; mark?: 'yes' | 'no'; at?: number; markAt?: number}[] = v.items || [];
  const two = items.length > 4;
  const ats = items.map((x) => x.at);
  return (
    <Stage>
      {v.title && (
        <div style={{position: 'absolute', top: 0, fontSize: 40, fontWeight: 700, color: b.accent}}>{v.title}</div>
      )}
      <div
        style={{
          display: 'grid', gridTemplateColumns: two ? '1fr 1fr' : '1fr', gap: two ? '14px 22px' : 14,
          width: two ? 740 : 600, marginTop: v.title ? 50 : 0,
        }}
      >
        {items.map((it, i) => {
          const at = atOf(ats, i, 0.03, 0.75);
          const k = b.p(at, 0.45);
          const km = it.mark ? b.sp(it.markAt ?? at + 0.08) : 0;
          const yes = it.mark === 'yes';
          return (
            <Card
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 18, padding: '10px 18px', height: two ? 84 : 88,
                opacity: k, transform: `translateX(${(1 - k) * 60}px)`,
                border: `4px solid ${it.mark ? (yes ? C.ok : C.no) : C.line}`,
              }}
            >
              {it.e && <Emo e={it.e} size={two ? 52 : 60} />}
              <div style={{flex: 1, fontSize: two ? 34 : 42, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden'}}>{it.text}</div>
              {it.mark && (
                <div
                  style={{
                    width: 58, height: 58, borderRadius: 29, background: yes ? C.ok : C.no, color: '#fff',
                    fontSize: 40, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: `scale(${km})`, flex: 'none',
                  }}
                >
                  {yes ? '✓' : '✗'}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Stage>
  );
};

/* ---------------- vergleich ---------------- */
type Side = {e?: string; n?: number; items?: string[]; label?: string; mark?: 'yes' | 'no'; at?: number; text?: string; color?: string};

const SideBox: React.FC<{s: Side; k: number; mirror?: boolean; idx: number}> = ({s, k, mirror, idx}) => {
  const b = useBeat();
  const list = s.items || (s.e ? Array.from({length: s.n ?? 1}, () => s.e as string) : []);
  const size = list.length <= 1 ? 150 : list.length <= 3 ? 96 : list.length <= 4 ? 76 : list.length <= 6 ? 70 : 54;
  const col = s.mark === 'yes' ? C.ok : s.mark === 'no' ? C.no : color(s.color, C.line);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: 310}}>
      <Card
        style={{
          width: 310, height: 260, boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center',
          gap: 8, padding: 14, border: `5px solid ${col}`, position: 'relative',
          transform: `scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.5),
        }}
      >
        {s.text && <div style={{fontSize: s.text.length > 7 ? 54 : s.text.length > 5 ? 64 : 76, fontWeight: 700, whiteSpace: 'nowrap'}}>{s.text}</div>}
        {list.map((e, i) => {
          const ki = b.sp((s.at ?? 0) + i * 0.04);
          return <Emo key={i} e={e} size={size} style={{transform: `scale(${ki}) ${mirror ? 'scaleX(-1)' : ''}`}} />;
        })}
        {s.mark && (
          <div
            style={{
              position: 'absolute', right: -16, top: -16, width: 60, height: 60, borderRadius: 30,
              background: col, color: '#fff', fontSize: 42, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${b.sp((s.at ?? 0) + 0.25)})`,
            }}
          >
            {s.mark === 'yes' ? '✓' : '✗'}
          </div>
        )}
      </Card>
      {s.label && <Tag text={s.label} size={36} k={b.sp((s.at ?? 0) + 0.1)} key={idx} />}
    </div>
  );
};

export const VergleichV: React.FC<VProps> = ({v}) => {
  const b = useBeat();
  const left: Side = v.left || {};
  const right: Side = v.right || {};
  const lAt = left.at ?? 0;
  const rAt = right.at ?? (v.mid === 'mirror' ? 0.3 : 0.35);
  const mAt = v.midAt ?? (lAt + rAt) / 2 + 0.1;
  const kM = b.sp(mAt);
  const mirror = v.mid === 'mirror';
  return (
    <Stage>
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <SideBox s={{...left, at: lAt}} k={b.sp(lAt)} idx={0} />
        <div style={{minWidth: 64, display: 'flex', justifyContent: 'center', transform: `scale(${kM})`}}>
          {mirror ? (
            <div
              style={{
                width: 26, height: 300, borderRadius: 13, marginTop: -50,
                background: `linear-gradient(90deg, #cfe9ff, #ffffff ${40 + Math.sin(b.sec * 2) * 20}%, #a9d4f5)`,
                border: '5px solid #8ab4d8',
              }}
            />
          ) : (
            <div style={{fontSize: String(v.mid ?? '').length > 2 ? 46 : 80, fontWeight: 700, color: b.accent, marginTop: -50, whiteSpace: 'nowrap'}}>{v.mid ?? ''}</div>
          )}
        </div>
        <SideBox s={{...right, at: rAt}} k={b.sp(rAt)} mirror={mirror} idx={1} />
      </div>
    </Stage>
  );
};
