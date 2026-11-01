import React from 'react';
import {Composition} from 'remotion';
import {Episode, FPS, totalFrames} from './Episode';
import type {Build} from './types';
import latest from './latest.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Episode"
    component={Episode}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={300}
    defaultProps={latest as Build}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames(props)})}
  />
);
