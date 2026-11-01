import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Head} from '../art/Character';
import {CAST, INK, YELLOW} from '../palette';
import type {Who, Word} from '../types';
import {BODY, DISPLAY} from './fonts';

type Chunk = {words: Word[]; start: number; end: number};

const chunkWords = (words: Word[]): Chunk[] => {
  const chunks: Chunk[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const pause = next ? next.start - w.end > 0.18 : true;
    if (cur.length === 2 || pause || w.text.length > 8) {
      chunks.push({words: cur, start: cur[0].start, end: w.end});
      cur = [];
    }
  });
  return chunks;
};

// 1–2 word captions; the word being spoken sits in a yellow box. Character lines get a speaker avatar.
export const Captions: React.FC<{words: Word[]; who: Who}> = ({words, who}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = useMemo(() => chunkWords(words), [words]);
  const idx = chunks.findLastIndex((c) => c.start <= t);
  if (idx < 0) return null;
  const chunk = chunks[idx];
  if (idx === chunks.length - 1 && t > chunk.end + 0.3) return null;
  const pop = spring({frame: frame - Math.round(chunk.start * fps), fps, config: {damping: 10, stiffness: 300}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 1390}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${0.8 + 0.2 * pop})`}}>
        {who !== 'narrator' && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <svg width={110} height={110} viewBox="-60 -60 120 120">
              <circle r={56} fill="#fff" stroke={INK} strokeWidth={6} />
              <g transform="translate(0 6)">
                <Head who={who} r={36} talking />
              </g>
            </svg>
            <div
              style={{
                marginTop: -12,
                background: INK,
                color: '#fff',
                fontFamily: BODY,
                fontWeight: 800,
                fontSize: 20,
                padding: '2px 10px',
                borderRadius: 8,
              }}
            >
              {CAST[who].name}
            </div>
          </div>
        )}
        <div style={{fontFamily: DISPLAY, fontSize: 112, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
          {chunk.words.map((w, i) => {
            const active = t >= w.start && t < (chunk.words[i + 1]?.start ?? chunk.end + 0.3);
            return (
              <span
                key={i}
                style={
                  active
                    ? {
                        background: YELLOW,
                        color: INK,
                        padding: '0 14px',
                        borderRadius: 14,
                        border: `6px solid ${INK}`,
                        display: 'inline-block',
                        transform: 'rotate(-2deg)',
                        marginLeft: i ? 12 : 0,
                      }
                    : {
                        color: '#fff',
                        WebkitTextStroke: `14px ${INK}`,
                        paintOrder: 'stroke fill',
                        display: 'inline-block',
                        marginLeft: i ? 12 : 0,
                      }
                }
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
