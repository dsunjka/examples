import React from 'react';
import {CalculateMetadataFunction, Composition} from 'remotion';
import {FilmProps, FloExplainer, layoutBeats} from './FloExplainer';

// Eine Komposition für alle Filme. render.mjs übergibt das Filmskript samt
// Audiodateien/-dauern als --props; die Beat-Längen ergeben sich aus der Sprechdauer.
const calcMeta: CalculateMetadataFunction<FilmProps> = ({props}) => {
  const fps = props.fps || 24;
  const beats = layoutBeats(props.beats || [], fps);
  const total = beats.reduce((a, b) => a + (b.frames || 0), 0);
  return {fps, durationInFrames: Math.max(1, total), props: {...props, beats}};
};

const demo: FilmProps = {
  film: {id: 'demo', title: 'Die Kraft der Zehn', icon: '🌰', accent: '#ff8a3d'},
  fps: 24,
  beats: [
    {say: 'Hallo! Ich bin Flo. Heute zeige ich dir einen Rechen-Trick.', visual: {type: 'title'}},
    {
      say: 'Ich lege immer zehn in eine Schachtel.',
      caption: '10 = 1 Zehner',
      visual: {type: 'zehnerfeld', size: 10, boxes: 2, style: 'schachtel', emoji: '🌰', groups: [{n: 13, from: 'scatter'}]},
    },
  ],
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="FloExplainer"
    component={FloExplainer}
    fps={24}
    width={960}
    height={540}
    durationInFrames={240}
    defaultProps={demo}
    calculateMetadata={calcMeta}
  />
);
