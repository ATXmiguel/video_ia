import React from 'react';
import {Composition} from 'remotion';
import {Avatar, Banner} from './Branding';
import {TerminalReplay} from './TerminalReplay';
import {Episode, FPS, totalFrames} from './Episode';
import type {Build} from './types';
import latest from './latest.json';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="Avatar" component={Avatar} width={800} height={800} fps={FPS} durationInFrames={1} />
  <Composition id="Banner" component={Banner} width={2560} height={1440} fps={FPS} durationInFrames={1} />
  <Composition
    id="TerminalReplay"
    component={TerminalReplay}
    width={1280}
    height={720}
    fps={FPS}
    durationInFrames={33 * FPS}
    defaultProps={{title: 'Terminal', steps: []}}
  />
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
  </>
);
