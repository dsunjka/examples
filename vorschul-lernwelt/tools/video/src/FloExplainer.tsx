import React, {useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from './components/Backdrop';
import {Flo} from './components/Flo';
import {Caption} from './components/ui';
import {BeatCtx} from './beat';
import {VISUALS} from './visuals';
import type {FilmInfo} from './visuals/types';

export type Beat = {
  say: string;
  caption?: string;
  visual: {type: string; [k: string]: any};
  pause?: number; // Sekunden Pause nach der Sprache (Standard 0.7)
  // von render.mjs ergänzt:
  audio?: string; // Pfad relativ zu public/
  dur?: number; // Sprechdauer in Sekunden
  env?: number[]; // Lautstärke pro Frame (0..1) ab Sprechbeginn
  // von calculateMetadata ergänzt:
  from?: number;
  frames?: number;
  lead?: number;
};

export type FilmProps = {
  film: {id: string; title: string; icon: string; accent?: string; subject?: string};
  beats: Beat[];
  fps?: number;
};

export const LEAD = 0.3; // Sekunden vor dem Sprechbeginn
export const OVER = 8; // Frames Überblendung zwischen Beats

/** Schätzung, falls (noch) keine Audiodatei da ist: ~2,4 Wörter pro Sekunde. */
export const estimateDur = (say: string) => Math.max(1.5, String(say || '').split(/\s+/).filter(Boolean).length / 2.4 + 0.3);

/** Beat-Längen in Frames (dieselbe Formel nutzt render.mjs für timing.json). */
export const layoutBeats = (beats: Beat[], fps: number) => {
  let from = 0;
  return beats.map((bt, i) => {
    const dur = bt.dur ?? estimateDur(bt.say);
    const pause = bt.pause ?? (bt.visual?.type === 'title' ? 0.9 : 0.7);
    const extra = i === beats.length - 1 ? 1.0 : 0;
    const lead = Math.round(LEAD * fps);
    const frames = lead + Math.ceil((dur + pause + extra) * fps);
    const out = {...bt, dur, from, frames, lead};
    from += frames;
    return out;
  });
};

const soften = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (c: number) => Math.round(c + (255 - c) * 0.8);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

let fontsHandled = false;
const useFonts = () => {
  const [handle] = useState(() => (fontsHandled ? null : delayRender('Andika laden')));
  useState(() => {
    if (fontsHandled || handle === null) return;
    fontsHandled = true;
    const faces = [
      new FontFace('Andika', `url(${staticFile('fonts/andika-400.woff2')}) format("woff2")`, {weight: '400'}),
      new FontFace('Andika', `url(${staticFile('fonts/andika-700.woff2')}) format("woff2")`, {weight: '700'}),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((fs) => {
        fs.forEach((f) => (document.fonts as any).add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  });
};

const BeatView: React.FC<{bt: Beat; index: number; film: FilmInfo; first: boolean}> = ({bt, index, film, first}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lead = bt.lead ?? Math.round(LEAD * fps);
  const narr = Math.max(1, Math.round((bt.dur ?? 2) * fps));
  const rel = f - lead;
  let talk = 0;
  if (bt.env && bt.env.length) {
    const i = Math.max(0, Math.min(bt.env.length - 1, rel));
    talk = rel >= 0 && rel < bt.env.length ? (bt.env[i] + (bt.env[i - 1] ?? bt.env[i])) / 2 : 0;
  } else if (rel >= 0 && rel < narr) {
    talk = 0.35 + 0.35 * Math.abs(Math.sin(f / 2.3));
  }
  const v = bt.visual || {type: 'flo'};
  const entry = VISUALS[v.type] || VISUALS.flo;
  const Comp = entry.comp;
  const corner = v.flo !== false && !(entry.noCornerFlo && entry.noCornerFlo(v));
  const fadeIn = first || v.continue ? 1 : interpolate(f, [0, OVER], [0, 1], {extrapolateRight: 'clamp'});
  const bg = v.bg ?? entry.bg ?? 'plain';
  return (
    <BeatCtx.Provider value={{f, fps, lead, narr, frames: bt.frames ?? narr + lead, accent: film.accent, talk, index}}>
      <AbsoluteFill style={{opacity: fadeIn}}>
        {!entry.ownBg && <Backdrop name={bg} frame={f} />}
        <Comp v={bt.caption ? {...v, _caption: true} : v} film={film} />
        {corner && (
          <div style={{position: 'absolute', left: 4, bottom: -6}}>
            <Flo size={180} frame={f} fps={fps} talk={talk} emotion={v.floEmotion} gesture={v.floGesture ?? 'none'} />
          </div>
        )}
        {bt.caption && <Caption text={bt.caption} left={corner ? 196 : 18} />}
      </AbsoluteFill>
      {bt.audio && (
        <Sequence from={lead} layout="none">
          <Audio src={staticFile(bt.audio)} />
        </Sequence>
      )}
    </BeatCtx.Provider>
  );
};

export const FloExplainer: React.FC<FilmProps> = ({film, beats}) => {
  useFonts();
  const accent = film.accent || '#ff8a3d';
  const info: FilmInfo = {id: film.id, title: film.title, icon: film.icon, accent, accentSoft: soften(accent), subject: film.subject};
  return (
    <AbsoluteFill style={{background: '#e8f7ff'}}>
      {beats.map((bt, i) => (
        <Sequence key={i} from={bt.from ?? 0} durationInFrames={(bt.frames ?? 1) + (i < beats.length - 1 ? OVER : 0)} layout="none">
          <AbsoluteFill>
            <BeatView bt={bt} index={i} film={info} first={i === 0} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
