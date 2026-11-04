import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CAST, INK, Look, SKIN} from '../palette';
import type {CastMember, Face, Pose, Who} from '../types';

const D = Math.PI / 180;

// [upper, lower] arm angles in degrees from straight down, positive = away from the body. [back arm, front arm].
const ARMS: Record<Pose, [[number, number], [number, number]]> = {
  idle: [[10, 4], [10, 4]],
  walk: [[10, 4], [10, 4]],
  point: [[10, 4], [92, 88]],
  shock: [[145, 170], [145, 170]],
  cheer: [[155, 178], [155, 178]],
  angry: [[48, -45], [48, -45]],
  shrug: [[70, 140], [70, 140]],
  sad: [[4, 0], [4, 0]],
};

const Limb: React.FC<{pts: [number, number][]; w: number; color: string}> = ({pts, w, color}) => {
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w} />
      <path d={d} stroke={color} strokeWidth={w - 12} />
    </g>
  );
};

const Hair: React.FC<{look: Look; r: number; layer: 'back' | 'front'; frame: number}> = ({look, r, layer, frame}) => {
  const c = look.hairColor;
  const sw = 6;
  if (layer === 'back') {
    if (look.hair === 'ponytail') {
      const swing = Math.sin(frame * 0.15) * 0.08 * r;
      return <ellipse cx={-1.05 * r + swing} cy={0.15 * r} rx={0.38 * r} ry={0.62 * r} fill={c} stroke={INK} strokeWidth={sw} transform={`rotate(20 ${-1.05 * r} ${0.15 * r})`} />;
    }
    if (look.hair === 'puff') {
      return (
        <g fill={c} stroke={INK} strokeWidth={sw}>
          {[[-0.85, -0.55], [-0.35, -0.95], [0.3, -0.98], [0.85, -0.6], [-1.05, 0.05], [1.0, 0.0], [-0.9, 0.55], [0.9, 0.5]].map(([x, y], i) => (
            <circle key={i} cx={x * r} cy={y * r} r={0.48 * r} />
          ))}
        </g>
      );
    }
    if (look.hair === 'bun') {
      return <circle cx={0} cy={-1.12 * r} r={0.42 * r} fill={c} stroke={INK} strokeWidth={sw} />;
    }
    return null;
  }
  switch (look.hair) {
    case 'cap':
      return (
        <g stroke={INK} strokeWidth={sw} strokeLinejoin="round">
          <path d={`M ${-1.0 * r} ${-0.2 * r} A ${r} ${r} 0 0 1 ${1.0 * r} ${-0.2 * r} Z`} fill={c} />
          <path d={`M ${0.2 * r} ${-0.24 * r} L ${1.45 * r} ${-0.24 * r} Q ${1.5 * r} ${-0.06 * r} ${1.3 * r} ${-0.06 * r} L ${0.2 * r} ${-0.06 * r} Z`} fill={c} />
          <circle cx={0.05 * r} cy={-0.62 * r} r={0.17 * r} fill="#ffd84d" strokeWidth={4} />
        </g>
      );
    case 'spiky': {
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        const rr = i % 2 ? 1.0 : 1.38;
        pts.push(`${(Math.cos(a) * rr * r).toFixed(1)},${(Math.sin(a) * rr * r - 0.12 * r).toFixed(1)}`);
      }
      return <polygon points={pts.join(' ')} fill={c} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
    }
    case 'ponytail':
      return (
        <path
          d={`M ${-1.02 * r} ${0.05 * r} A ${1.02 * r} ${1.02 * r} 0 0 1 ${1.02 * r} ${-0.05 * r} Q ${0.4 * r} ${-0.5 * r} ${-0.2 * r} ${-0.35 * r} Q ${-0.7 * r} ${-0.25 * r} ${-1.02 * r} ${0.05 * r} Z`}
          fill={c}
          stroke={INK}
          strokeWidth={sw}
        />
      );
    case 'bald':
      return (
        <g fill={c} stroke={INK} strokeWidth={4}>
          <path d={`M ${-0.98 * r} ${-0.05 * r} Q ${-1.12 * r} ${0.2 * r} ${-0.9 * r} ${0.4 * r} Z`} />
          <path d={`M ${0.98 * r} ${-0.05 * r} Q ${1.12 * r} ${0.2 * r} ${0.9 * r} ${0.4 * r} Z`} />
        </g>
      );
    case 'bun':
      return (
        <path
          d={`M ${-1.02 * r} ${0.1 * r} A ${1.02 * r} ${1.02 * r} 0 0 1 ${1.02 * r} ${0.1 * r} Q ${0.6 * r} ${-0.45 * r} ${0} ${-0.42 * r} Q ${-0.6 * r} ${-0.45 * r} ${-1.02 * r} ${0.1 * r} Z`}
          fill={c}
          stroke={INK}
          strokeWidth={sw}
        />
      );
    case 'swoop':
      return (
        <path
          d={`M ${-1.05 * r} ${0.05 * r} Q ${-1.15 * r} ${-1.15 * r} ${0.2 * r} ${-1.2 * r} Q ${1.45 * r} ${-1.15 * r} ${1.25 * r} ${-0.15 * r} Q ${0.6 * r} ${-0.75 * r} ${-0.35 * r} ${-0.38 * r} Q ${-0.8 * r} ${-0.25 * r} ${-1.05 * r} ${0.05 * r} Z`}
          fill={c}
          stroke={INK}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      );
    case 'puff':
      return look.shades ? (
        <g stroke={INK} strokeWidth={4}>
          <circle cx={-0.32 * r} cy={-0.62 * r} r={0.24 * r} fill="#2a2a3a" />
          <circle cx={0.32 * r} cy={-0.62 * r} r={0.24 * r} fill="#2a2a3a" />
          <line x1={-0.08 * r} y1={-0.62 * r} x2={0.08 * r} y2={-0.62 * r} />
        </g>
      ) : null;
  }
};

const FaceArt: React.FC<{face: Face; r: number; blink: boolean; talking: boolean; frame: number; mustache?: boolean}> = ({
  face,
  r,
  blink,
  talking,
  frame,
  mustache,
}) => {
  const ex = 0.34 * r;
  const ey = 0.02 * r;
  const big = face === 'shock' ? 1.3 : 1;
  const eyes = blink ? (
    <g stroke={INK} strokeWidth={6} strokeLinecap="round">
      <line x1={-ex - 0.14 * r} y1={ey} x2={-ex + 0.14 * r} y2={ey} />
      <line x1={ex - 0.14 * r} y1={ey} x2={ex + 0.14 * r} y2={ey} />
    </g>
  ) : (
    <g>
      {[-ex, ex].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={ey} rx={0.17 * r * big} ry={0.22 * r * big} fill="#fff" stroke={INK} strokeWidth={5} />
          <circle cx={x + 0.05 * r} cy={ey + 0.02 * r} r={(face === 'shock' ? 0.06 : 0.095) * r} fill={INK} />
          {face === 'smug' && <rect x={x - 0.2 * r} y={ey - 0.26 * r} width={0.4 * r} height={0.2 * r} fill={SKIN} />}
          {face === 'smug' && <line x1={x - 0.18 * r} y1={ey - 0.06 * r} x2={x + 0.18 * r} y2={ey - 0.06 * r} stroke={INK} strokeWidth={6} strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );
  const brows =
    face === 'angry' ? (
      <g stroke={INK} strokeWidth={9} strokeLinecap="round">
        <line x1={-0.55 * r} y1={-0.32 * r} x2={-0.15 * r} y2={-0.18 * r} />
        <line x1={0.55 * r} y1={-0.32 * r} x2={0.15 * r} y2={-0.18 * r} />
      </g>
    ) : face === 'sad' ? (
      <g stroke={INK} strokeWidth={7} strokeLinecap="round">
        <line x1={-0.5 * r} y1={-0.22 * r} x2={-0.18 * r} y2={-0.34 * r} />
        <line x1={0.5 * r} y1={-0.22 * r} x2={0.18 * r} y2={-0.34 * r} />
      </g>
    ) : null;

  const open = talking && Math.floor(frame / 4) % 2 === 0;
  let mouth: React.ReactNode;
  if (face === 'shock' || open) {
    mouth = <ellipse cx={0.02 * r} cy={0.45 * r} rx={(face === 'shock' ? 0.13 : 0.15) * r} ry={(face === 'shock' ? 0.17 : 0.11) * r} fill="#7a1f2b" stroke={INK} strokeWidth={5} />;
  } else if (face === 'happy' || face === 'love') {
    mouth = <path d={`M ${-0.27 * r} ${0.3 * r} Q ${0.02 * r} ${0.75 * r} ${0.3 * r} ${0.3 * r} Z`} fill="#7a1f2b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
  } else if (face === 'angry' || face === 'sad') {
    mouth = <path d={`M ${-0.2 * r} ${0.52 * r} Q ${0.02 * r} ${0.32 * r} ${0.22 * r} ${0.52 * r}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />;
  } else if (face === 'smug') {
    mouth = <path d={`M ${-0.15 * r} ${0.42 * r} Q ${0.12 * r} ${0.5 * r} ${0.3 * r} ${0.28 * r}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />;
  } else {
    mouth = <path d={`M ${-0.14 * r} ${0.42 * r} Q ${0.02 * r} ${0.5 * r} ${0.18 * r} ${0.42 * r}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />;
  }

  return (
    <g>
      {brows}
      {eyes}
      {(face === 'love' || face === 'happy') && (
        <g fill="#ff8fa8" opacity={0.7}>
          <ellipse cx={-0.6 * r} cy={0.25 * r} rx={0.15 * r} ry={0.09 * r} />
          <ellipse cx={0.62 * r} cy={0.25 * r} rx={0.15 * r} ry={0.09 * r} />
        </g>
      )}
      {mouth}
      {mustache && <path d={`M ${-0.32 * r} ${0.3 * r} Q ${0.02 * r} ${0.12 * r} ${0.34 * r} ${0.3 * r} Q ${0.02 * r} ${0.24 * r} ${-0.32 * r} ${0.3 * r} Z`} fill="#5a3b22" stroke={INK} strokeWidth={4} />}
      {face === 'shock' && <path d={`M ${0.82 * r} ${-0.5 * r} q ${0.12 * r} ${0.25 * r} 0 ${0.32 * r} q ${-0.12 * r} ${-0.07 * r} 0 ${-0.32 * r} Z`} fill="#7fd0ff" stroke={INK} strokeWidth={3} />}
      {face === 'sad' && <ellipse cx={-0.38 * r} cy={0.32 * r} rx={0.06 * r} ry={0.1 * r} fill="#7fd0ff" />}
    </g>
  );
};

// Head with hair and face, origin at the head centre. Shared by the full body and the HUD/caption avatars.
export const Head: React.FC<{who: Exclude<Who, 'narrator'>; r: number; face?: Face; talking?: boolean; seed?: number}> = ({
  who,
  r,
  face = 'neutral',
  talking = false,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const look = CAST[who];
  const blink = (frame + seed * 37) % 97 < 4 && face !== 'shock';
  return (
    <g>
      <Hair look={look} r={r} layer="back" frame={frame} />
      <circle cx={0} cy={0} r={r} fill={SKIN} stroke={INK} strokeWidth={7} />
      <Hair look={look} r={r} layer="front" frame={frame} />
      <FaceArt face={face} r={r} blink={blink} talking={talking} frame={frame} mustache={look.mustache} />
      {look.glasses && (
        <g fill="none" stroke={INK} strokeWidth={6}>
          <rect x={-0.62 * r} y={-0.2 * r} width={0.52 * r} height={0.42 * r} rx={0.1 * r} />
          <rect x={0.1 * r} y={-0.2 * r} width={0.52 * r} height={0.42 * r} rx={0.1 * r} />
          <line x1={-0.1 * r} y1={-0.05 * r} x2={0.1 * r} y2={-0.05 * r} />
        </g>
      )}
    </g>
  );
};

export const Character: React.FC<{m: CastMember; footY: number; talking: boolean; progress: number; seed: number}> = ({
  m,
  footY,
  talking,
  progress,
  seed,
}) => {
  const frame = useCurrentFrame();
  const look = CAST[m.who];
  const H = look.height;
  const r = 0.13 * H;
  const pose: Pose = m.toX !== undefined ? 'walk' : (m.pose ?? 'idle');
  const x = m.toX !== undefined ? m.x + (m.toX - m.x) * progress : m.x;
  const phase = frame * 0.35;
  const walking = pose === 'walk';
  const breathe = 1 + 0.012 * Math.sin(frame * 0.12 + seed);
  const bob = walking ? -Math.abs(Math.sin(phase)) * 10 : 0;

  const headY = -H + r;
  const shoulderY = -H + 2 * r + 0.04 * H;
  const hipY = -0.38 * H;
  const sw = 0.2 * H;
  const hw = 0.17 * H;
  const legW = 0.065 * H;
  const armW = 0.055 * H;

  const legSwing = walking ? 20 * Math.sin(phase) : 3;
  const leg = (side: number, ang: number) => {
    const hx = side * 0.045 * H;
    const fx = hx + Math.sin(ang * D) * H * 0.38 * side;
    return (
      <g key={side}>
        <Limb pts={[[hx, hipY], [fx, -0.02 * H]]} w={legW} color={look.pants} />
        <ellipse cx={fx + 0.03 * H} cy={-0.01 * H} rx={0.06 * H} ry={0.03 * H} fill={INK} />
      </g>
    );
  };

  const arm = (side: number, [a1, a2]: [number, number], swing: number) => {
    const sx = side * (sw / 2 - 0.01 * H);
    const sy = shoulderY + 0.03 * H;
    const u1 = (a1 + swing) * D;
    const u2 = (a2 + swing) * D;
    const ex = sx + side * Math.sin(u1) * 0.17 * H;
    const ey = sy + Math.cos(u1) * 0.17 * H;
    const hx = ex + side * Math.sin(u2) * 0.16 * H;
    const hy = ey + Math.cos(u2) * 0.16 * H;
    return (
      <g key={side}>
        <Limb pts={[[sx, sy], [ex, ey], [hx, hy]]} w={armW} color={SKIN} />
        <circle cx={hx} cy={hy} r={0.032 * H} fill={SKIN} stroke={INK} strokeWidth={6} />
      </g>
    );
  };
  const [back, front] = ARMS[pose];
  const armSwing = walking ? 18 * Math.sin(phase) : 0;
  const shake = pose === 'shock' ? Math.sin(frame * 1.7) * 3 : 0;

  return (
    <g transform={`translate(${x + shake} ${footY + bob})`}>
      <ellipse cx={0} cy={0} rx={0.16 * H} ry={0.025 * H} fill="#000" opacity={0.18} />
      <g transform={`scale(${m.flip ? -1 : 1} ${breathe}) translate(0 0)`}>
        {leg(-1, -legSwing)}
        {leg(1, legSwing)}
        {arm(-1, back, -armSwing)}
        <path
          d={`M ${-sw / 2} ${shoulderY + 0.03 * H} Q ${-sw / 2} ${shoulderY} ${-sw / 2 + 0.04 * H} ${shoulderY}
              L ${sw / 2 - 0.04 * H} ${shoulderY} Q ${sw / 2} ${shoulderY} ${sw / 2} ${shoulderY + 0.03 * H}
              L ${hw / 2} ${hipY + 0.02 * H} L ${-hw / 2} ${hipY + 0.02 * H} Z`}
          fill={look.shirt}
          stroke={INK}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        {look.tie && (
          <path d={`M 0 ${shoulderY + 4} L ${0.025 * H} ${shoulderY + 0.05 * H} L 0 ${shoulderY + 0.2 * H} L ${-0.025 * H} ${shoulderY + 0.05 * H} Z`} fill={look.tie} stroke={INK} strokeWidth={4} />
        )}
        {look.shirt === '#e8443a' && (
          <rect x={0.02 * H} y={shoulderY + 0.06 * H} width={0.055 * H} height={0.03 * H} rx={4} fill="#ffd84d" stroke={INK} strokeWidth={3} />
        )}
        {arm(1, front, armSwing)}
        <g transform={`translate(0 ${headY}) rotate(${pose === 'sad' ? 8 : 0})`}>
          <Head who={m.who} r={r} face={m.face ?? (pose === 'shock' ? 'shock' : 'neutral')} talking={talking} seed={seed} />
        </g>
      </g>
    </g>
  );
};
