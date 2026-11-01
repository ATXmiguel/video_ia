import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Head} from '../art/Character';
import {INK, YELLOW} from '../palette';
import type {Build, BuiltScene} from '../types';
import {BODY, DISPLAY} from './fonts';

const COLORS = ['#ff5a4d', '#3fa8ff', '#b98cff'];

// End card. Narration lines are [question, option A, option B, ..., cta]; each element appears with its line.
export const ChoiceCard: React.FC<{scene: BuiltScene; build: Build}> = ({scene, build}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {choice} = build;
  const enter = (i: number) => spring({frame: frame - Math.round((scene.lines[i]?.start ?? 0) * fps), fps, config: {damping: 12}});
  const q = enter(0);
  const cta = enter(choice.options.length + 1);
  const pulse = 1 + 0.05 * Math.sin(frame * 0.3);

  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 290, background: 'radial-gradient(circle at 50% 45%, #3a2f6b 0%, #14122b 75%)'}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 126,
          color: '#fff',
          WebkitTextStroke: `14px ${INK}`,
          paintOrder: 'stroke fill',
          opacity: q,
          transform: `scale(${0.7 + 0.3 * q})`,
        }}
      >
        {choice.question}
      </div>
      <div style={{display: 'flex', gap: 30, marginTop: 50, alignItems: 'center', position: 'relative'}}>
        {choice.options.map((o, i) => {
          const e = enter(i + 1);
          return (
            <div
              key={o.key}
              style={{
                width: 440,
                height: 700,
                borderRadius: 40,
                background: `linear-gradient(180deg, ${COLORS[i]}33, #1d1a38)`,
                border: `8px solid ${COLORS[i]}`,
                boxShadow: `0 0 60px ${COLORS[i]}66, 0 12px 0 rgba(0,0,0,0.4)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '30px 26px',
                opacity: e,
                transform: `translateY(${(1 - e) * 120}px) rotate(${(i ? 1 : -1) * 2 * e}deg)`,
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 999,
                  background: COLORS[i],
                  border: `6px solid ${INK}`,
                  fontFamily: DISPLAY,
                  fontSize: 80,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {o.key}
              </div>
              <svg width={230} height={230} viewBox="-100 -100 200 200" style={{marginTop: 26}}>
                <circle r={95} fill="#fff" stroke={INK} strokeWidth={8} />
                <g transform="translate(0 10)">
                  <Head who={o.icon} r={62} face={i ? 'smug' : 'happy'} />
                </g>
              </svg>
              <div
                style={{
                  marginTop: 30,
                  fontFamily: DISPLAY,
                  fontSize: 64,
                  lineHeight: 1.05,
                  color: '#fff',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                {o.label}
              </div>
              <div style={{marginTop: 'auto', fontFamily: BODY, fontWeight: 800, fontSize: 30, color: COLORS[i], letterSpacing: 2, textAlign: 'center'}}>
                {o.teaser.toUpperCase()}
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${enter(2)})`,
            width: 100,
            height: 100,
            borderRadius: 999,
            background: YELLOW,
            border: `6px solid ${INK}`,
            fontFamily: DISPLAY,
            fontSize: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: INK,
          }}
        >
          OR
        </div>
      </div>
      <div
        style={{
          marginTop: 70,
          padding: '20px 56px',
          borderRadius: 999,
          background: `linear-gradient(90deg, ${COLORS[0]}, ${COLORS[1]})`,
          border: `7px solid ${INK}`,
          fontFamily: DISPLAY,
          fontSize: 84,
          color: '#fff',
          WebkitTextStroke: `8px ${INK}`,
          paintOrder: 'stroke fill',
          opacity: cta,
          transform: `scale(${interpolate(cta, [0, 1], [0.6, 1]) * pulse})`,
        }}
      >
        COMMENT A OR B
      </div>
      <div style={{marginTop: 26, fontFamily: BODY, fontWeight: 800, fontSize: 38, letterSpacing: 3, color: '#fff', opacity: cta}}>
        TOP COMMENT DECIDES EP {build.episode + 1}
      </div>
    </AbsoluteFill>
  );
};
