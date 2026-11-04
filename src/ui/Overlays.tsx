import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {INK, RED, YELLOW} from '../palette';
import {BODY, DISPLAY} from './fonts';

// Title card over the opening seconds. Fully visible on frame 0 so it doubles as the thumbnail.
export const Cover: React.FC<{hook: string; accent: string; tag: string; frames: number}> = ({hook, accent, tag, frames}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [frames - 8, frames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const wobble = Math.sin(frame * 0.2) * 1.2;
  if (frame >= frames) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', opacity: out}}>
      <div
        style={{
          marginTop: 170,
          background: '#fff',
          border: `8px solid ${INK}`,
          borderRadius: 34,
          padding: '26px 44px 30px',
          textAlign: 'center',
          transform: `rotate(${-2 + wobble}deg)`,
          boxShadow: '0 14px 0 rgba(0,0,0,0.3)',
          maxWidth: 960,
        }}
      >
        <div style={{fontFamily: DISPLAY, fontSize: 112, lineHeight: 1, color: INK}}>{hook}</div>
        <div style={{fontFamily: DISPLAY, fontSize: 92, lineHeight: 1.05, color: RED, marginTop: 6}}>{accent}</div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 300,
          background: '#7b3fe4',
          color: '#fff',
          border: `6px solid ${INK}`,
          borderRadius: 18,
          padding: '10px 30px',
          fontFamily: DISPLAY,
          fontSize: 56,
          letterSpacing: 2,
          transform: 'rotate(2deg)',
        }}
      >
        {tag.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};

// Episode 2+ opener: the winning comment from last episode, likes counting up, over a gray recap.
export const TopComment: React.FC<{user: string; text: string; likes: number; part: number}> = ({user, text, likes, part}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inn = spring({frame: frame - 6, fps, config: {damping: 12}});
  const count = Math.round(interpolate(frame, [10, 60], [likes * 0.85, likes], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{marginTop: 300, fontFamily: DISPLAY, fontSize: 150, color: YELLOW, WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill'}}>
        PART {part}
      </div>
      <div
        style={{
          marginTop: 40,
          width: 900,
          background: '#fff',
          border: `7px solid ${INK}`,
          borderRadius: 30,
          padding: '28px 30px',
          position: 'relative',
          transform: `scale(${inn}) rotate(-1.5deg)`,
          boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: 30,
            background: YELLOW,
            border: `5px solid ${INK}`,
            borderRadius: 12,
            padding: '4px 16px',
            fontFamily: BODY,
            fontWeight: 800,
            fontSize: 28,
            color: INK,
          }}
        >
          TOP COMMENT
        </div>
        <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
          <div
            style={{
              width: 90,
              height: 90,
              flex: '0 0 auto',
              borderRadius: 999,
              background: '#7b3fe4',
              color: '#fff',
              fontFamily: DISPLAY,
              fontSize: 54,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user.replace('@', '').charAt(0).toUpperCase()}
          </div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 32, color: '#666'}}>{user}</div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 46, color: INK, lineHeight: 1.15}}>{text}</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 64, color: RED, lineHeight: 1}}>♥</div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 30, color: INK}}>{count.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
