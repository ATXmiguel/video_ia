import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Character} from '../art/Character';
import {INK, YELLOW} from '../palette';
import type {Build, BuiltScene} from '../types';
import {BODY, DISPLAY} from './fonts';

const SIDES = [
  {bg: '#9c2533', stripe: '#b8303f', word: YELLOW},
  {bg: '#1f7a45', stripe: '#28904f', word: '#7fd0ff'},
];

// End card: the screen splits in two and each half shows YOU already doing that option, under the word to comment.
// Narration lines are [question, option A, option B, cta]; each element appears with its line.
export const ChoiceCard: React.FC<{scene: BuiltScene; build: Build}> = ({scene, build}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {choice} = build;
  const enter = (i: number) => spring({frame: frame - Math.round((scene.lines[i]?.start ?? 0) * fps), fps, config: {damping: 12}});
  const q = enter(0);
  const cta = enter(choice.options.length + 1);
  const pulse = 1 + 0.05 * Math.sin(frame * 0.3);
  const next = build.arc?.final ? 'NEXT STORY' : build.arc ? `PART ${build.arc.part + 1}` : `EP ${build.episode + 1}`;

  return (
    <AbsoluteFill style={{background: '#14122b'}}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
        <defs>
          {SIDES.map((s, i) => (
            <pattern key={i} id={`stripes${i}`} width={60} height={60} patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <rect width={60} height={60} fill={s.bg} />
              <rect width={24} height={60} fill={s.stripe} />
            </pattern>
          ))}
        </defs>
        {choice.options.slice(0, 2).map((o, i) => {
          const e = enter(i + 1);
          return (
            <g key={o.key} opacity={0.35 + 0.65 * e}>
              <rect x={i * 540} y={0} width={540} height={1920} fill={`url(#stripes${i})`} />
              <g transform={`translate(0 ${(1 - e) * 200})`}>
                <Character
                  m={{who: 'you', x: 270 + i * 540, pose: o.pose ?? (i ? 'point' : 'cheer'), face: o.face ?? (i ? 'smug' : 'happy'), flip: !i}}
                  footY={1560}
                  talking={false}
                  progress={0}
                  seed={i}
                />
              </g>
            </g>
          );
        })}
        <line x1={540} y1={0} x2={540} y2={1920} stroke={INK} strokeWidth={10} />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 270,
          left: '50%',
          transform: `translateX(-50%) scale(${0.7 + 0.3 * q})`,
          opacity: q,
          padding: '14px 44px',
          borderRadius: 18,
          background: YELLOW,
          border: `7px solid ${INK}`,
          fontFamily: DISPLAY,
          fontSize: 66,
          color: INK,
          whiteSpace: 'nowrap',
        }}
      >
        COMMENT ONE WORD
      </div>

      {choice.options.slice(0, 2).map((o, i) => {
        const e = enter(i + 1);
        const word = (o.word ?? o.label).toUpperCase();
        return (
          <div
            key={o.key}
            style={{
              position: 'absolute',
              top: 420,
              left: i * 540,
              width: 540,
              textAlign: 'center',
              opacity: e,
              transform: `translateY(${(1 - e) * -80}px)`,
            }}
          >
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: word.length > 7 ? 104 : 136,
                lineHeight: 1,
                color: SIDES[i].word,
                WebkitTextStroke: `12px ${INK}`,
                paintOrder: 'stroke fill',
              }}
            >
              {word}
            </div>
            <div style={{marginTop: 14, fontFamily: BODY, fontWeight: 800, fontSize: 34, color: '#fff', letterSpacing: 2, padding: '0 30px'}}>
              {(o.word ? o.label : o.teaser).toUpperCase()}
            </div>
            {o.word && (
              <div style={{marginTop: 6, fontFamily: BODY, fontWeight: 600, fontSize: 28, color: '#ffffffcc', letterSpacing: 2}}>
                {o.teaser.toUpperCase()}
              </div>
            )}
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          top: 760,
          left: '50%',
          transform: `translate(-50%, 0) scale(${enter(2)})`,
          width: 120,
          height: 120,
          borderRadius: 999,
          background: '#fff',
          border: `7px solid ${INK}`,
          fontFamily: DISPLAY,
          fontSize: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: INK,
        }}
      >
        X
      </div>

      <div
        style={{
          position: 'absolute',
          top: 905,
          left: '50%',
          transform: `translateX(-50%) rotate(-3deg) scale(${interpolate(cta, [0, 1], [0.5, 1])})`,
          opacity: cta,
          padding: '12px 34px',
          borderRadius: 16,
          background: INK,
          border: '5px solid #fff',
          fontFamily: DISPLAY,
          fontSize: 60,
          color: '#fff',
          whiteSpace: 'nowrap',
        }}
      >
        {next} →
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: DISPLAY,
          fontSize: 72,
          color: '#fff',
          WebkitTextStroke: `10px ${INK}`,
          paintOrder: 'stroke fill',
          opacity: cta,
          transform: `scale(${pulse})`,
        }}
      >
        MOST-LIKED WORD WINS
      </div>
    </AbsoluteFill>
  );
};
