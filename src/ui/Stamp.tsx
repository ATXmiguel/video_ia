import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {INK, STAMP_COLORS} from '../palette';
import type {Stamp as StampT} from '../types';
import {DISPLAY} from './fonts';

// Punchline label that slams in. Mounted inside a Sequence starting at the stamp's moment.
export const Stamp: React.FC<{stamp: StampT}> = ({stamp}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 11, stiffness: 260}});
  const color = STAMP_COLORS[stamp.color];
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 560}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 132,
          lineHeight: 1,
          padding: '14px 40px 18px',
          color,
          background: 'rgba(255,255,255,0.94)',
          border: `12px solid ${color}`,
          borderRadius: 24,
          outline: `6px solid ${INK}`,
          transform: `rotate(-7deg) scale(${2.2 - 1.2 * s})`,
          opacity: Math.min(1, s * 2),
          boxShadow: '0 14px 0 rgba(0,0,0,0.25)',
          whiteSpace: 'nowrap',
        }}
      >
        {stamp.text}
      </div>
    </AbsoluteFill>
  );
};
