import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Character, Head} from './art/Character';
import {Burger} from './art/Sets';
import {INK, RED, YELLOW} from './palette';
import type {CastMember} from './types';
import {BODY, DISPLAY} from './ui/fonts';

// Channel profile picture (800×800, shown as a circle).
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${YELLOW} 0%, #ffb02e 60%, ${RED} 100%)`}}>
    <svg viewBox="-400 -400 800 800" width="100%" height="100%">
      {new Array(16).fill(0).map((_, i) => (
        <path key={i} d="M 0 0 L -60 -420 L 60 -420 Z" fill="#fff" opacity={0.18} transform={`rotate(${i * 22.5})`} />
      ))}
      <g transform="translate(0 40)">
        <Head who="you" r={230} face="happy" seed={1} />
      </g>
    </svg>
  </AbsoluteFill>
);

// Channel banner (2560×1440). Everything important stays inside the 1546×423 safe area in the middle.
const CAST_LINE: CastMember[] = [
  {who: 'kevin', x: 0, pose: 'angry', face: 'angry'},
  {who: 'tyler', x: 0, pose: 'point', face: 'smug', flip: true},
  {who: 'you', x: 0, pose: 'shrug', face: 'shock'},
  {who: 'lily', x: 0, pose: 'cheer', face: 'happy'},
  {who: 'brenda', x: 0, pose: 'point', face: 'angry', flip: true},
];

export const Banner: React.FC = () => (
  <AbsoluteFill style={{background: '#ffe7b8'}}>
    <svg viewBox="0 0 2560 1440" width="100%" height="100%" style={{position: 'absolute'}}>
      {new Array(29).fill(0).map((_, i) => (
        <rect key={i} x={i * 90} y={0} width={45} height={1440} fill="#ffdc9c" />
      ))}
      <rect x={0} y={935} width={2560} height={505} fill={RED} />
      <rect x={0} y={935} width={2560} height={30} fill={YELLOW} stroke={INK} strokeWidth={6} />
      <Burger x={260} y={720} s={2} />
      <Burger x={2300} y={720} s={2} />
      {CAST_LINE.map((m, i) => (
        <g key={m.who} transform={`translate(${1440 + i * 135} 0) scale(0.68)`}>
          <Character m={m} footY={1400} talking={false} progress={0} seed={i + 1} />
        </g>
      ))}
    </svg>
    <div
      style={{
        position: 'absolute',
        left: 540,
        top: 560,
        width: 820,
        textAlign: 'center',
        transform: 'rotate(-3deg)',
      }}
    >
      <div style={{fontFamily: DISPLAY, fontSize: 170, lineHeight: 0.95, color: YELLOW, WebkitTextStroke: `18px ${INK}`, paintOrder: 'stroke fill'}}>
        SHIFT HAPPENS
      </div>
      <div
        style={{
          display: 'inline-block',
          marginTop: 18,
          background: '#7b3fe4',
          color: '#fff',
          border: `6px solid ${INK}`,
          borderRadius: 18,
          padding: '8px 26px',
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: 40,
          letterSpacing: 2,
        }}
      >
        YOU DECIDE · NEW EPISODE DAILY
      </div>
    </div>
  </AbsoluteFill>
);
