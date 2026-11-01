import React from 'react';
import {interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Head} from '../art/Character';
import {INK, RED} from '../palette';
import type {Hud as HudT} from '../types';
import {BODY, DISPLAY} from './fonts';

// Game-style overlay: tips card top-left, manager rage gauge top-right. Values tween in from the previous scene.
export const Hud: React.FC<{prev: HudT; cur: HudT}> = ({prev, cur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = interpolate(frame, [4, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tips = Math.round(prev.tips + (cur.tips - prev.tips) * t);
  const rage = prev.rage + (cur.rage - prev.rage) * t;
  const dTips = cur.tips - prev.tips;
  const dRage = cur.rage - prev.rage;
  const pulse = spring({frame: frame - 4, fps, config: {damping: 8}});
  const badgePop = prev.badge !== cur.badge ? spring({frame: frame - 6, fps, config: {damping: 9}}) : 1;
  const float = interpolate(frame, [6, 40], [0, -60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const floatO = interpolate(frame, [6, 12, 34, 44], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const ang = -180 + (Math.min(rage, 100) / 100) * 180;
  const needle = (ang * Math.PI) / 180;
  const rageColor = interpolateColors(rage, [0, 50, 100], ['#2fd27a', '#ffc83d', '#ff4a3d']);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 36, top: 80}}>
        <div
          style={{
            position: 'absolute',
            top: -26,
            left: 240,
            background: RED,
            color: '#fff',
            fontFamily: BODY,
            fontWeight: 800,
            fontSize: 26,
            padding: '6px 16px',
            borderRadius: 10,
            border: `4px solid ${INK}`,
            transform: `rotate(-3deg) scale(${badgePop})`,
            zIndex: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {cur.badge}
        </div>
        <div
          style={{
            width: 400,
            height: 150,
            background: '#fff',
            border: `6px solid ${INK}`,
            borderRadius: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 20px',
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
          }}
        >
          <svg width={104} height={104} viewBox="-60 -60 120 120" style={{flex: '0 0 auto'}}>
            <circle r={56} fill="#ffe3e0" stroke={INK} strokeWidth={5} />
            <g transform="translate(0 8)">
              <Head who="you" r={38} face={dTips < 0 ? 'sad' : 'neutral'} />
            </g>
          </svg>
          <div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 24, color: '#8a8a9a', letterSpacing: 3}}>TIPS</div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 78,
                lineHeight: 1,
                color: dTips < 0 && t < 1 ? RED : INK,
                transform: `scale(${dTips ? 1 + 0.15 * (1 - pulse) * (t < 1 ? 1 : 0) : 1})`,
                transformOrigin: 'left center',
              }}
            >
              ${tips}
            </div>
          </div>
        </div>
        {dTips !== 0 && (
          <div
            style={{
              position: 'absolute',
              left: 270,
              top: 40 + float,
              opacity: floatO,
              fontFamily: DISPLAY,
              fontSize: 64,
              color: dTips > 0 ? '#2fd27a' : RED,
              WebkitTextStroke: `8px ${INK}`,
              paintOrder: 'stroke fill',
            }}
          >
            {dTips > 0 ? '+' : '-'}${Math.abs(dTips)}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 36,
          top: 80,
          width: 330,
          height: 150,
          background: '#23233a',
          border: `6px solid ${INK}`,
          borderRadius: 26,
          boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
          transform: `translateX(${dRage > 0 && t < 1 ? Math.sin(frame * 2.5) * 6 : 0}px)`,
        }}
      >
        <div style={{position: 'absolute', left: 20, top: 12, fontFamily: BODY, fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: 2}}>
          MANAGER RAGE
        </div>
        <div style={{position: 'absolute', right: 20, bottom: 10, fontFamily: DISPLAY, fontSize: 46, color: rageColor}}>{Math.round(rage)}%</div>
        <svg width={330} height={150} viewBox="0 0 330 150" style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <linearGradient id="rageGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2fd27a" />
              <stop offset="0.5" stopColor="#ffc83d" />
              <stop offset="1" stopColor="#ff4a3d" />
            </linearGradient>
          </defs>
          <path d="M 70 132 A 60 60 0 0 1 190 132" fill="none" stroke="url(#rageGrad)" strokeWidth={22} strokeLinecap="round" />
          <line x1={130} y1={132} x2={130 + Math.cos(needle) * 58} y2={132 + Math.sin(needle) * 58} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
          <circle cx={130} cy={132} r={10} fill="#fff" />
        </svg>
      </div>
      {dRage !== 0 && (
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: 230 + float * -0.5,
            opacity: floatO,
            fontFamily: DISPLAY,
            fontSize: 54,
            color: dRage > 0 ? '#ff4a3d' : '#2fd27a',
            WebkitTextStroke: `8px ${INK}`,
            paintOrder: 'stroke fill',
          }}
        >
          {dRage > 0 ? '+' : '-'}
          {Math.abs(Math.round(dRage))}% RAGE
        </div>
      )}
    </div>
  );
};
