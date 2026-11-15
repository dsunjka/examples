// Farben wie in der App (css/base.css), damit Film und App zusammenpassen.
export const C = {
  ink: '#2b2d42',
  inkSoft: '#5c6080',
  inkFaint: '#9aa0bf',
  card: '#ffffff',
  paper: '#fffdf7',
  sky1: '#bfe8ff',
  sky2: '#e8f7ff',
  sand: '#fff4dc',
  ok: '#22b26b',
  okSoft: '#d4f6e3',
  soft: '#ffb26b',
  softBg: '#fff1e3',
  no: '#ff7a59',
  gold: '#ffc533',
  goldDark: '#e09b00',
  line: '#e4e7f2',
  fox: '#ff8a3d',
  zahlen: '#ff8a3d',
  sprache: '#8e6cef',
  welt: '#3dbe6b',
  denken: '#1fb5c9',
  formen: '#ff5fa2',
  // Silbenfarben (Silbenmethode: blau / rot)
  syl1: '#2f6fe0',
  syl2: '#e0433a',
};

// Benannte Farben für Punkte, Bögen, Markierungen (in Filmskripten verwendbar).
export const NAMED: Record<string, string> = {
  red: '#ef4f4f',
  blue: '#3b7ddd',
  green: '#22b26b',
  orange: '#ff8a3d',
  yellow: '#ffc533',
  purple: '#8e6cef',
  pink: '#ff5fa2',
  teal: '#1fb5c9',
  grey: '#9aa0bf',
  brown: '#a0673a',
  ink: '#2b2d42',
  white: '#ffffff',
};

export const color = (c: string | undefined, fallback: string): string => {
  if (!c) return fallback;
  return NAMED[c] || c;
};

export const FONT = '"Andika", "Trebuchet MS", system-ui, sans-serif';
export const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';

export const W = 960;
export const H = 540;
// Bühne für Inhalts-Visuals: lässt unten links Platz für Flo und unten für die Untertitelzeile.
export const STAGE = {left: 176, top: 14, width: 770, height: 424};
