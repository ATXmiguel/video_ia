import React from 'react';
import {AbsoluteFill, Html5Audio, interpolate, random, Sequence, Series, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '../ui/fonts';
import {FLOOR, FrontStrip, SetDefs, SETS} from './sets';
import {Sil} from './Sil';

export const SPECIAL_FPS = 24;
const BRASS = '#d9a93f';
const NAVY = '#0c2226'; // the film's "dark" is teal-black, not navy
const CREAM = '#efe6cd';

type Line = {who: string; text: string; start: number; duration: number; audio: string};
type Ding = {t: number; who: string; big?: boolean};
export type Shot = Record<string, any> & {kind: string; duration: number; lines: Line[]; dings: Ding[]};
export type SpecialBuild = {shots: Shot[]; pad: string; tension: string};

const frames = (s: {duration: number}) => Math.round(s.duration * SPECIAL_FPS);
export const specialFrames = (b: SpecialBuild) => b.shots.reduce((n, s) => n + frames(s), 0);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const MOODS: Record<string, {filter: string; ambient: string; rim: string; glow?: number}> = {
  warm: {filter: 'saturate(0.8) contrast(0.94)', ambient: '#8f7c68', rim: '#f0a860', glow: 0.34},
  night: {filter: 'saturate(0.72) contrast(0.94)', ambient: '#5a6470', rim: '#eaa45c', glow: 0.34},
  cost: {filter: 'grayscale(0.86) contrast(0.92)', ambient: '#6d7680', rim: '#8fbfe0', glow: 0.1},
  dark: {filter: 'saturate(0.6) contrast(0.92)', ambient: '#262d36', rim: '#8fbfe0', glow: 0.22},
  fire: {filter: 'saturate(0.85) contrast(0.96)', ambient: '#6f4a3c', rim: '#ff8a3c', glow: 0.42},
  dawn: {filter: 'saturate(0.82) contrast(0.94)', ambient: '#8c7867', rim: '#ffbb7a', glow: 0.3},
  day: {filter: 'saturate(0.62) contrast(0.92)', ambient: '#858a90', rim: '#d5e0e6', glow: 0.2},
};

const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0, ...style}}>
    <SetDefs />
    {children}
  </svg>
);

const Pill: React.FC<{text: string; x: number; y: number; color?: string}> = ({text, x, y, color = CREAM}) => {
  const w = text.length * 17 + 56;
  return (
    <g>
      <rect x={x - w / 2} y={y - 28} width={w} height={56} rx={28} fill="#0a1214" opacity={0.86} stroke={color} strokeWidth={2} />
      <text x={x} y={y + 9} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={25} letterSpacing={2.5} fill={color}>
        {text}
      </text>
    </g>
  );
};

// The corner marker for the perk/cost run: a room key tag.
const Tag: React.FC<{word: string}> = ({word}) => {
  const perk = word === 'PERK';
  const c = perk ? BRASS : '#9fb3bd';
  return (
    <g transform="translate(1660 104)">
      <path d="M0 34 L 34 0 H 196 V 68 H 34 Z" fill={c} />
      <circle cx={30} cy={34} r={10} fill="#0a1214" />
      <text x={116} y={46} textAnchor="middle" fontFamily="Anton" fontSize={38} letterSpacing={3} fill="#0a1214">
        {word}
      </text>
    </g>
  );
};

const Hand: React.FC<{x: number; y: number; rot?: number; cuff?: string; s?: number}> = ({x, y, rot = 0, cuff = '#c28c24', s = 1.5}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#propShadow)">
    <rect x={-48} y={44} width={96} height={560} fill={cuff} />
    <rect x={-48} y={44} width={22} height={560} fill="#000" opacity={0.28} />
    <rect x={-54} y={36} width={108} height={22} rx={4} fill="#efe6cd" />
    <path d="M-52 44 Q -60 -34 -44 -50 H 44 Q 60 -34 52 44 Z" fill="#0c0c12" />
    {[-36, -12, 12, 36].map((fx, i) => {
      const len = [62, 80, 76, 56][i];
      return (
        <g key={fx}>
          <rect x={fx - 12} y={-50 - len} width={24} height={len + 12} rx={12} fill="#0c0c12" />
          <rect x={fx - 3} y={-42 - len} width={6} height={len * 0.42} rx={3} fill="#54535f" />
          <rect x={fx - 3} y={-48 - len * 0.34} width={6} height={len * 0.28} rx={3} fill="#3a3a46" />
        </g>
      );
    })}
    <path d="M50 12 Q 96 -18 100 -60" stroke="#0c0c12" strokeWidth={25} fill="none" strokeLinecap="round" />
  </g>
);

const Bell: React.FC<{x: number; y: number; s?: number; wave?: number}> = ({x, y, s = 1, wave = -1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={20} cy={34} rx={170} ry={46} fill="#000" opacity={0.55} filter="url(#softShadowSmall)" />
    <ellipse cx={0} cy={18} rx={150} ry={46} fill="#3d291c" />
    <path d="M-122 6 A 122 122 0 0 1 122 6 Z" fill="#d9a93f" />
    <path d="M-92 -30 A 100 100 0 0 1 -30 -96" stroke="#f6dd9a" strokeWidth={12} fill="none" strokeLinecap="round" />
    <rect x={-12} y={-142} width={24} height={30} rx={8} fill="#a9812e" />
    <circle cx={0} cy={-148} r={18} fill="#d9a93f" />
    {wave >= 0 &&
      [0, 0.25].map((d) => {
        const p = Math.min(1, wave + d);
        return <circle key={d} cx={0} cy={-50} r={130 + p * 190} fill="none" stroke={BRASS} strokeWidth={6 * (1 - p) + 1} opacity={1 - p} />;
      })}
  </g>
);

const Key: React.FC<{x: number; y: number; rot?: number; label?: string; s?: number}> = ({x, y, rot = 0, label = '412', s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#propShadow)">
    <circle cx={0} cy={0} r={30} fill="none" stroke={BRASS} strokeWidth={13} />
    <rect x={26} y={-7} width={120} height={14} fill={BRASS} />
    <rect x={118} y={7} width={13} height={22} fill={BRASS} />
    <rect x={92} y={7} width={13} height={16} fill={BRASS} />
    <path d="M-30 18 L -84 72" stroke="#555" strokeWidth={4} />
    <path d="M-84 56 L -40 100 L -92 152 L -136 108 Z" fill="#6b2233" />
    <text x={-88} y={118} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={28} fill={CREAM} transform="rotate(-45 -88 108)">
      {label}
    </text>
  </g>
);

const Note: React.FC<{x: number; y: number; text: string; rot?: number; s?: number}> = ({x, y, text, rot = -5, s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#propShadow)">
    <rect x={-120} y={-100} width={240} height={200} fill="#e0c656" />
    <rect x={-120} y={-100} width={240} height={34} fill="#dcc24a" />
    {text.split('|').map((t, i) => (
      <text key={i} x={0} y={-16 + i * 52} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} fill="#1a1a1a">
        {t}
      </text>
    ))}
  </g>
);

const Wood: React.FC<{dark?: boolean}> = ({dark}) => (
  <g>
    <rect width={1920} height={1080} fill={dark ? '#3a2a20' : '#6a4d38'} />
    {Array.from({length: 7}).map((_, i) => (
      <g key={i}>
        <rect y={i * 170 - 20} width={1920} height={170} fill={i % 2 ? '#000' : '#fff'} opacity={0.035} />
        <path d={`M0 ${i * 170 - 20} H 1920`} stroke="#000" strokeOpacity={0.32} strokeWidth={4} />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M${random(`g${i}${k}`) * 900} ${i * 170 + 26 + k * 44} q 300 ${random(`h${i}${k}`) * 16 - 8} 760 0`} stroke="#000" strokeOpacity={0.09} strokeWidth={3} fill="none" />
        ))}
      </g>
    ))}
    <rect width={1920} height={1080} fill="url(#deskGlow)" />
  </g>
);

// Top-down objects on the desk: each prop moves from (x,y) to (toX,toY) over the shot, eased.
const Props: React.FC<{props: any[]; p: number; wave: number}> = ({props, p, wave}) => (
  <>
    {props.map((o, i) => {
      const e = Math.min(1, p * (o.speed ?? 2.2));
      const eased = 1 - (1 - e) ** 3;
      const x = o.toX !== undefined ? o.x + (o.toX - o.x) * eased : o.x;
      const y = o.toY !== undefined ? o.y + (o.toY - o.y) * eased : o.y;
      switch (o.t) {
        case 'bell':
          return <Bell key={i} x={x} y={y} s={o.s ?? 1} wave={wave} />;
        case 'hand':
          return <Hand key={i} x={x} y={y} rot={o.rot} cuff={o.cuff} s={o.s} />;
        case 'key':
          return <Key key={i} x={x} y={y} rot={o.rot} label={o.label} s={o.s} />;
        case 'note':
          return <Note key={i} x={x} y={y} text={o.text} rot={o.rot} s={o.s} />;
        case 'mug':
          return (
            <g key={i} transform={`translate(${x} ${y})`} filter="url(#propShadow)">
              <circle r={78} fill={o.color ?? '#d9d2bd'} />
              <circle r={60} fill="#3a2214" />
              <path d="M76 -14 q 44 14 0 28" stroke={o.color ?? '#d9d2bd'} strokeWidth={14} fill="none" />
            </g>
          );
        case 'card':
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${o.rot ?? 0})`} filter="url(#propShadow)">
              <rect x={-74} y={-104} width={148} height={208} rx={12} fill={o.back ? '#6b2233' : '#f4efdf'} />
              {!o.back && (
                <text x={0} y={22} textAnchor="middle" fontFamily="Anton" fontSize={84} fill={o.red ? '#c0392b' : '#14141c'}>
                  {o.text}
                </text>
              )}
            </g>
          );
        case 'button':
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${o.s ?? 1})`} filter="url(#propShadow)">
              <circle r={120} fill={BRASS} />
              <circle r={92} fill="none" stroke="#a9812e" strokeWidth={8} />
              <path d="M-40 -56 Q -60 -30 -56 0" stroke="#f6dd9a" strokeWidth={12} strokeLinecap="round" fill="none" />
              {[-22, 22].map((a) => (
                <circle key={a} cx={a} cy={0} r={11} fill="#7a5a1e" />
              ))}
            </g>
          );
        default:
          return null;
      }
    })}
  </>
);

const Cast: React.FC<{cast: any[]; frame: number; dur: number; t: number; speaking?: string; dings: Ding[]; rim: string; y?: number; light?: [number, number]; shadows?: boolean}> = ({cast, frame, dur, t, speaking, dings, rim, y = FLOOR, light, shadows}) => (
  <>
    {cast.map((m, i) => {
      const prog = interpolate(frame, [0, dur], [0, 1], clamp);
      const x = m.toX !== undefined ? m.x + (m.toX - m.x) * prog : m.x;
      const last = dings.filter((d) => d.who === m.who && d.t <= t).pop();
      return (
        <Sil
          key={i}
          look={m.look ?? m.who}
          x={x}
          y={m.y ?? y}
          s={m.s ?? 1}
          face={m.face}
          pose={m.pose}
          flip={m.flip}
          walking={m.toX !== undefined}
          talking={speaking === m.who}
          frame={frame + i * 7}
          rim={m.rim ?? rim}
          ringAge={last ? t - last.t : undefined}
          light={light}
          floorShadow={shadows && !m.noShadow}
          wallShadow={shadows && !m.y}
        />
      );
    })}
  </>
);

const Smoke: React.FC<{frame: number; amount?: number}> = ({frame, amount = 1}) => (
  <Svg style={{mixBlendMode: 'screen', filter: 'blur(34px)'}}>
    {Array.from({length: 14}).map((_, i) => {
      const sx = random(`sm${i}`) * 1920;
      const sy = (random(`sn${i}`) * 900 - frame * (0.8 + random(`so${i}`))) % 1100;
      return <circle key={i} cx={sx + Math.sin(frame / 40 + i) * 40} cy={sy < 0 ? sy + 1100 : sy} r={120 + random(`sp${i}`) * 170} fill="#7c8387" opacity={0.3 * amount} />;
    })}
  </Svg>
);

const Lights: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{background: Math.floor(frame / 10) % 2 ? '#e5332a' : '#2a5fe5', opacity: 0.16, mixBlendMode: 'screen'}} />
);

// The light in the room: everything away from the source falls toward the ambient color, and the source itself blooms.
const RoomLight: React.FC<{set: string; mood: string; frame: number; flicker?: boolean}> = ({set, mood, frame, flicker}) => {
  const S = SETS[set];
  const M = MOODS[mood];
  const [lx, ly] = S.light;
  const pulse = flicker ? 0.82 + 0.18 * Math.sin(frame * 0.5) * Math.sin(frame * 0.23) : 1;
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 72% 88% at ${(lx / 1920) * 100}% ${(ly / 1080) * 100}%, #ffffff 0%, #f2eee6 22%, ${M.ambient} 88%)`,
          mixBlendMode: 'multiply',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 34% 46% at ${(lx / 1920) * 100}% ${(ly / 1080) * 100}%, ${S.lightColor} 0%, transparent 100%)`,
          mixBlendMode: 'screen',
          opacity: (M.glow ?? 0.2) * pulse,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 38% 13% at ${(lx / 1920) * 100}% 87%, ${S.lightColor} 0%, transparent 100%)`,
          mixBlendMode: 'soft-light',
          opacity: Math.min(1, (M.glow ?? 0.2) * 2) * pulse,
        }}
      />
    </>
  );
};

const Fore: React.FC<{set: string; frame: number; dur: number; mood: string}> = ({set, frame, dur, mood}) => {
  const F = SETS[set].Fore;
  if (!F) return null;
  // Nearest the lens, so it travels furthest as the camera moves.
  const shift = interpolate(frame, [0, dur], [0, -34]);
  return (
    <AbsoluteFill style={{filter: `blur(18px) ${MOODS[mood].filter}`, transform: `translateX(${shift}px) scale(1.08)`}}>
      <Svg>
        <F />
      </Svg>
    </AbsoluteFill>
  );
};

const Wide: React.FC<{shot: any; frame: number; dur: number; t: number; speaking?: string}> = ({shot, frame, dur, t, speaking}) => {
  const set = SETS[shot.set];
  const moodName = shot.mood ?? 'night';
  const mood = MOODS[moodName];
  // The background layer drifts less than the cast, which is what reads as depth.
  const drift = interpolate(frame, [0, dur], [10, -10]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: `blur(${shot.dof ?? 2.4}px) ${mood.filter}`, transform: `translateX(${drift}px) scale(1.03)`}}>
        <Svg>
          <set.Back />
        </Svg>
      </AbsoluteFill>
      <RoomLight set={shot.set} mood={moodName} frame={frame} flicker={moodName === 'fire'} />
      <Svg>
        <Cast cast={shot.cast ?? []} frame={frame} dur={dur} t={t} speaking={speaking} dings={shot.dings} rim={mood.rim} light={set.light} shadows />
        {shot.stretcher && (
          <g transform={`translate(${interpolate(frame, [0, dur], shot.stretcher, clamp)} 800)`}>
            <g transform="rotate(90) translate(-12 220) scale(0.8)">
              <Sil look="otis" x={0} y={0} face="closed" frame={frame} rim={mood.rim} />
            </g>
            <rect x={-250} y={34} width={420} height={18} rx={8} fill="#efe6cd" />
            <ellipse cx={46} cy={-12} rx={15} ry={20} fill="#6fb3c9" opacity={0.9} />
          </g>
        )}
        {shot.desk && set.Front && (
          <g style={{filter: `${mood.filter} brightness(0.62)`}}>
            <set.Front />
          </g>
        )}
        {(shot.pills ?? []).map((p: any, i: number) => (
          <Pill key={i} {...p} />
        ))}
      </Svg>
      <Fore set={shot.set} frame={frame} dur={dur} mood={moodName} />
    </AbsoluteFill>
  );
};

const Close: React.FC<{shot: any; frame: number; dur: number; t: number; speaking?: string}> = ({shot, frame, dur, t, speaking}) => {
  const set = SETS[shot.set];
  const moodName = shot.mood ?? 'night';
  const mood = MOODS[moodName];
  const who = shot.who;
  const drift = interpolate(frame, [0, dur], [14, -14]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: `blur(${shot.dof ?? 19}px) ${mood.filter}`, transform: `translateX(${drift}px) scale(1.2)`}}>
        <Svg>
          <set.Back />
        </Svg>
      </AbsoluteFill>
      <RoomLight set={shot.set} mood={moodName} frame={frame} flicker={moodName === 'fire'} />
      <Svg>
        <Cast
          cast={[{who, look: shot.look, x: shot.x ?? 960, y: shot.y ?? 2110, s: shot.s ?? 4.2, face: shot.face, pose: shot.pose ?? 'idle', flip: shot.flip}]}
          frame={frame}
          dur={dur}
          t={t}
          speaking={speaking}
          dings={shot.dings}
          rim={mood.rim}
          light={set.light}
        />
        {shot.mic && (
          <g>
            <path d="M1230 1090 Q 1290 900 1190 790" stroke="#1c1c1c" strokeWidth={14} fill="none" />
            <rect x={1146} y={720} width={80} height={120} rx={38} fill="#2f2f38" transform="rotate(-30 1186 780)" />
          </g>
        )}
        {shot.strip !== false && <FrontStrip color={shot.stripColor} kind={set.strip} />}
        {shot.note && <Note x={270} y={806} text={shot.note} rot={-6} />}
      </Svg>
    </AbsoluteFill>
  );
};

const Table: React.FC<{shot: any; p: number; wave: number}> = ({shot, p, wave}) => (
  <AbsoluteFill>
    <Svg>
      <Wood dark={shot.dark} />
      <Props props={shot.props ?? []} p={p} wave={wave} />
    </Svg>
  </AbsoluteFill>
);

const KeyRack: React.FC<{shot: any; p: number}> = ({shot, p}) => (
  <AbsoluteFill style={{background: NAVY}}>
    <Svg>
      {Array.from({length: 212}).map((_, i) => {
        const col = i % 27;
        const row = Math.floor(i / 27);
        const x = 130 + col * 62;
        const y = 150 + row * 96;
        const lit = shot.wave ? p * 1.25 > (col + row * 2) / 42 : shot.lit;
        return (
          <g key={i} opacity={lit ? 1 : 0.28}>
            <circle cx={x} cy={y} r={9} fill="none" stroke={lit ? BRASS : '#6f8a8a'} strokeWidth={4} />
            <rect x={x - 2.5} y={y + 8} width={5} height={36} fill={lit ? BRASS : '#6f8a8a'} />
            {lit && <circle cx={x} cy={y + 20} r={24} fill={BRASS} opacity={0.14} />}
          </g>
        );
      })}
      {shot.big && (
        <text x={960} y={590} textAnchor="middle" fontFamily="Anton" fontSize={230} fill={CREAM} stroke={NAVY} strokeWidth={14} paintOrder="stroke">
          {shot.big}
        </text>
      )}
    </Svg>
  </AbsoluteFill>
);

const BigText: React.FC<{shot: any; p: number}> = ({shot, p}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #17393f, ${NAVY} 72%)`}}>
    <Svg>
      <text
        x={960}
        y={shot.small ? 560 : 610}
        textAnchor="middle"
        fontFamily="Anton"
        fontSize={shot.size ?? 300}
        fill={shot.color ?? CREAM}
        letterSpacing={6}
        opacity={interpolate(p, [0, 0.06], [0, 1], clamp)}
      >
        {shot.text}
      </text>
      {shot.small && (
        <text x={960} y={670} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} letterSpacing={7} fill={BRASS}>
          {shot.small}
        </text>
      )}
    </Svg>
  </AbsoluteFill>
);

// The hotel from above: rooms around a corridor, the lawn at the bottom, a dot for each person.
const HotelMap: React.FC<{shot: any; p: number; frame: number}> = ({shot, p, frame}) => {
  const rooms = Array.from({length: 40});
  const dots = shot.dots ?? 40;
  return (
    <AbsoluteFill style={{background: '#10272b'}}>
      <Svg>
        <rect x={230} y={90} width={1460} height={660} fill="#1a3a40" stroke={BRASS} strokeWidth={5} />
        {rooms.map((_, i) => (
          <rect key={i} x={250 + (i % 10) * 142} y={i < 20 ? 110 + Math.floor(i / 10) * 140 : 460 + Math.floor((i - 20) / 10) * 140} width={130} height={126} fill="#22464c" />
        ))}
        <rect x={230} y={750} width={1460} height={250} fill="#2f5a3c" />
        <text x={960} y={960} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={30} letterSpacing={8} fill="#a7c9a9">
          FRONT LAWN
        </text>
        {Array.from({length: dots}).map((_, i) => {
          const rx = 300 + random(`dx${i}`) * 1320;
          const ry = 130 + random(`dy${i}`) * 590;
          const lx = 300 + random(`lx${i}`) * 1320;
          const ly = 780 + random(`ly${i}`) * 130;
          const start = shot.pour ? random(`st${i}`) * 0.6 : 2;
          const q = interpolate(p, [start, start + 0.3], [0, 1], clamp);
          const moving = shot.moveCount !== undefined && i < shot.moveCount;
          const mx = moving ? Math.sin(frame / 25 + i) * 60 : 0;
          return <circle key={i} cx={rx + (lx - rx) * q + mx} cy={ry + (ly - ry) * q} r={8} fill={moving || shot.pour ? BRASS : '#c9d6db'} opacity={moving || shot.pour ? 1 : 0.6} />;
        })}
        {(shot.pills ?? []).map((x: any, i: number) => (
          <Pill key={i} {...x} />
        ))}
        {shot.clock && (
          <text x={1660} y={850} textAnchor="end" fontFamily="Anton" fontSize={84} fill="#ff7a4a">
            {shot.clock}
          </text>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

const Diagram: React.FC<{shot: any; frame: number}> = ({shot, frame}) => {
  const swing = Math.sin(frame / 7) * 16;
  return (
    <AbsoluteFill style={{background: '#10323a'}}>
      <Svg>
        <g stroke={CREAM} strokeWidth={5} fill="none" strokeLinecap="round">
          <circle cx={960} cy={420} r={280} />
          <path d="M860 696 V 800 M1060 696 V 800 M640 1000 Q 700 800 860 800 H 1060 Q 1220 800 1280 1000" />
          <g transform={`rotate(${swing} 960 250)`}>
            <path d="M960 250 V 300" />
            <path d="M880 470 Q 880 300 960 300 Q 1040 300 1040 470 L 1070 510 H 850 L 880 470 Z" stroke={BRASS} strokeWidth={8} />
            <circle cx={960} cy={528} r={18} stroke={BRASS} strokeWidth={8} />
          </g>
          {[0, 1, 2].map((i) => {
            const q = ((frame + i * 18) % 54) / 54;
            return <path key={i} d={`M${1270 + q * 200} ${300 + i * 90} q 40 40 0 80`} stroke={BRASS} strokeWidth={5} opacity={1 - q} />;
          })}
        </g>
        {shot.label && <Pill text={shot.label} x={1540} y={420} />}
      </Svg>
    </AbsoluteFill>
  );
};

const PhoneUi: React.FC<{shot: any; lineIdx: number}> = ({shot, lineIdx}) => (
  <AbsoluteFill>
    <Svg>
      <Wood dark />
      <rect x={640} y={50} width={640} height={980} rx={60} fill="#0a0a0e" />
      <rect x={662} y={72} width={596} height={936} rx={42} fill={shot.screen ?? '#f2eee2'} />
      <rect x={662} y={72} width={596} height={126} rx={42} fill="#1d4a50" />
      <text x={960} y={158} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={36} letterSpacing={3} fill={CREAM}>
        {shot.contact}
      </text>
      {(shot.messages ?? []).map((m: any, i: number) => {
        if ((m.line ?? i) > lineIdx) return null;
        const me = m.from === 'me';
        const ws = m.text.split('|');
        const w = 480;
        const y = 250 + i * 190;
        return (
          <g key={i}>
            <rect x={me ? 1240 - w : 680} y={y} width={w} height={60 + ws.length * 50} rx={26} fill={me ? '#c9962e' : '#fff'} stroke="#00000015" />
            {ws.map((tx: string, j: number) => (
              <text key={j} x={(me ? 1240 - w : 680) + 28} y={y + 62 + j * 50} fontFamily="Inter" fontWeight={600} fontSize={37} fill="#14141c">
                {tx}
              </text>
            ))}
          </g>
        );
      })}
    </Svg>
  </AbsoluteFill>
);

const Panel: React.FC<{frame: number; p: number}> = ({frame, p}) => (
  <AbsoluteFill style={{background: '#0a1214'}}>
    <Svg>
      <rect x={260} y={110} width={1400} height={860} rx={24} fill="#39464a" />
      <rect x={320} y={170} width={1280} height={500} rx={10} fill="#0b1416" />
      <text x={380} y={270} fontFamily="Inter" fontWeight={800} fontSize={58} letterSpacing={5} fill="#7fb9a5">
        FIRE ALARM SYSTEM
      </text>
      <text x={380} y={430} fontFamily="Anton" fontSize={150} letterSpacing={8} fill="#ff4a3d" opacity={Math.floor(frame / 12) % 2 ? 1 : 0.55}>
        BYPASSED
      </text>
      {p > 0.25 && (
        <text x={380} y={590} fontFamily="Inter" fontWeight={600} fontSize={46} fill="#7fb9a5">
          SINCE: 6 WEEKS AGO · OVERRIDE: OWNER
        </text>
      )}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={460 + i * 330} cy={810} r={62} fill={i === 1 ? '#c0392b' : '#2b3538'} stroke="#111" strokeWidth={8} />
      ))}
    </Svg>
  </AbsoluteFill>
);

const News: React.FC<{shot: any; frame: number; dur: number; t: number; speaking?: string}> = ({shot, frame, dur, t, speaking}) => (
  <AbsoluteFill style={{background: '#121a26'}}>
    <Svg>
      <rect x={0} y={0} width={1920} height={1080} fill="#20314a" />
      <Cast cast={shot.cast ?? []} frame={frame} dur={dur} t={t} speaking={speaking} dings={shot.dings} rim="#8fbfe0" y={1180} light={[1500, 200]} />
      <rect x={0} y={800} width={1920} height={280} fill="#7c1f33" />
      <text x={70} y={880} fontFamily="Anton" fontSize={72} letterSpacing={2} fill="#fff">
        HOTEL OWNER: "I HAD NO IDEA"
      </text>
      <text x={70} y={950} fontFamily="Inter" fontWeight={800} fontSize={34} letterSpacing={3} fill="#f0d68a">
        212 GUESTS OUT · ALARM LOG HANDED TO INSPECTORS
      </text>
      <rect x={70} y={96} width={170} height={60} fill="#e03a30" />
      <text x={155} y={140} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={34} fill="#fff">
        LIVE
      </text>
    </Svg>
  </AbsoluteFill>
);

const Insert: React.FC<{shot: any; p: number}> = ({shot, p}) => (
  <AbsoluteFill style={{background: shot.bg ?? '#2d3e3f'}}>
    <Svg>
      {shot.obj === 'jacket' && (
        <g>
          <path d="M960 110 q 40 0 34 -40 q -8 -30 -40 -18" stroke="#c0c6c4" strokeWidth={9} fill="none" />
          <path d="M960 130 L 700 240 M960 130 L 1220 240" stroke="#c0c6c4" strokeWidth={9} />
          <path d="M710 230 L 960 170 L 1210 230 L 1320 700 L 1200 720 L 1160 440 L 1160 950 H 760 L 760 440 L 720 720 L 600 700 Z" fill="#7c1f33" />
          {[320, 450, 580, 710, 840].map((y) => <circle key={y} cx={960} cy={y} r={20} fill={BRASS} />)}
          <path d="M960 170 V 950" stroke="#4c1825" strokeWidth={5} />
          <rect x={1000} y={330} width={110} height={38} fill={CREAM} />
          <text x={1055} y={358} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={25} fill="#222">
            OTIS
          </text>
        </g>
      )}
      {shot.obj === 'note' && <Note x={960} y={540} text={shot.text} s={2.3 - p * 0.15} />}
      {shot.obj === 'door' && (
        <g>
          <rect x={660} y={80} width={600} height={920} fill="#4c3524" />
          <rect x={710} y={140} width={500} height={330} fill="none" stroke="#00000044" strokeWidth={8} />
          <rect x={710} y={530} width={500} height={410} fill="none" stroke="#00000044" strokeWidth={8} />
          <rect x={860} y={200} width={200} height={90} fill={BRASS} />
          <text x={960} y={266} textAnchor="middle" fontFamily="Anton" fontSize={68} fill="#2a1d1a">
            009
          </text>
          <circle cx={1190} cy={560} r={24} fill={BRASS} />
        </g>
      )}
    </Svg>
  </AbsoluteFill>
);

const EndCard: React.FC<{frame: number; p: number; t: number}> = ({frame, p, t}) => (
  <AbsoluteFill style={{background: '#0a1a1d'}}>
    <Svg>
      <circle cx={960} cy={720} r={380} fill="#ffcc7f" opacity={0.1} />
      <circle cx={960} cy={720} r={380} fill="none" stroke={BRASS} strokeWidth={6} opacity={0.75} />
      <text x={960} y={196} textAnchor="middle" fontFamily="Anton" fontSize={104} letterSpacing={3} fill={CREAM}>
        WOULD YOU WANT TO
      </text>
      <text x={960} y={312} textAnchor="middle" fontFamily="Anton" fontSize={116} letterSpacing={3} fill={BRASS}>
        HEAR EVERY LIE?
      </text>
      <Sil look="otis" x={640} y={1015} s={1.05} face="smile" frame={frame} light={[960, 500]} />
      <Sil look="you" x={960} y={1015} s={1.15} face="neutral" frame={frame} light={[960, 200]} />
      <Sil look="quill" x={1280} y={1015} s={1.05} face="smug" pose="idle" frame={frame} flip light={[960, 500]} />
      {t > 2.5 && (
        <>
          <text x={290} y={720} textAnchor="middle" fontFamily="Anton" fontSize={96} letterSpacing={4} fill={BRASS}>
            BELL
          </text>
          <text x={1630} y={720} textAnchor="middle" fontFamily="Anton" fontSize={96} letterSpacing={4} fill={CREAM}>
            SILENCE
          </text>
        </>
      )}
    </Svg>
  </AbsoluteFill>
);

const ShotView: React.FC<{shot: Shot; frame: number; dur: number}> = ({shot, frame, dur}) => {
  const t = frame / SPECIAL_FPS;
  const p = frame / dur;
  const speaking = shot.lines.find((l) => t >= l.start && t < l.start + l.duration)?.who;
  const lineIdx = shot.lines.reduce((n, l, i) => (t >= l.start ? i : n), 0);
  const lastDing = shot.dings.filter((d) => d.t <= t).pop();
  const wave = lastDing && t - lastDing.t < 0.7 ? (t - lastDing.t) / 0.7 : -1;
  const common = {shot, frame, dur, t, speaking};
  switch (shot.kind) {
    case 'wide':
      return <Wide {...common} />;
    case 'close':
      return <Close {...common} />;
    case 'table':
      return <Table shot={shot} p={p} wave={wave} />;
    case 'keyrack':
      return <KeyRack shot={shot} p={p} />;
    case 'big':
      return <BigText shot={shot} p={p} />;
    case 'map':
      return <HotelMap shot={shot} p={p} frame={frame} />;
    case 'diagram':
      return <Diagram shot={shot} frame={frame} />;
    case 'phone':
      return <PhoneUi shot={shot} lineIdx={lineIdx} />;
    case 'panel':
      return <Panel frame={frame} p={p} />;
    case 'news':
      return <News {...common} />;
    case 'insert':
      return <Insert shot={shot} p={p} />;
    case 'end':
      return <EndCard frame={frame} p={p} t={t} />;
    default:
      return null;
  }
};

// A jagged tear between two scenes, shown side by side.
const TORN = [[900, 0], [930, 150], [895, 290], [940, 430], [905, 590], [950, 730], [915, 880], [945, 1080]];
const Split: React.FC<{shot: Shot; frame: number; dur: number}> = ({shot, frame, dur}) => {
  const pct = TORN.map(([x, y]) => `${(x / 1920) * 100}% ${(y / 1080) * 100}%`).join(',');
  const pick = (s: any) => ({...s, duration: shot.duration, lines: shot.lines, dings: shot.dings}) as Shot;
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <ShotView shot={pick(shot.right)} frame={frame} dur={dur} />
      </AbsoluteFill>
      <AbsoluteFill style={{clipPath: `polygon(0 0, ${pct}, 0 100%)`}}>
        <ShotView shot={pick(shot.left)} frame={frame} dur={dur} />
      </AbsoluteFill>
      <Svg>
        <polyline points={TORN.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="#050507" strokeWidth={13} />
      </Svg>
    </AbsoluteFill>
  );
};

const ShotBlock: React.FC<{shot: Shot; dur: number}> = ({shot, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cast = shot.cast ?? [];
  const meanX = cast.length ? cast.reduce((n: number, m: any) => n + (m.x + (m.toX ?? m.x)) / 2, 0) / cast.length : 960;
  const near = shot.kind === 'wide' ? [1.3, 1.37] : shot.kind === 'table' ? [1.18, 1.25] : shot.kind === 'end' ? [1, 1.015] : [1, 1.05];
  const [a, b] = shot.push ?? near;
  const scale = interpolate(frame, [0, dur], [a, b]);
  const [ox, oy] = shot.origin ?? (shot.kind === 'wide' ? [Math.min(1400, Math.max(520, meanX)), 700] : [960, 540]);
  const shakeOn = shot.shake && frame % 2 === 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${shakeOn ? (random(`x${frame}`) - 0.5) * shot.shake : 0}px, ${shakeOn ? (random(`y${frame}`) - 0.5) * shot.shake : 0}px) scale(${scale})`,
          transformOrigin: `${(ox / 1920) * 100}% ${(oy / 1080) * 100}%`,
        }}
      >
        {shot.kind === 'split' ? <Split shot={shot} frame={frame} dur={dur} /> : <ShotView shot={shot} frame={frame} dur={dur} />}
        {shot.smoke && <Smoke frame={frame} amount={shot.smoke} />}
        {shot.lights && <Lights frame={frame} />}
      </AbsoluteFill>
      {shot.pillFixed && (
        <Svg>
          <Pill {...shot.pillFixed} />
        </Svg>
      )}
      {shot.tag && (
        <Svg>
          <Tag word={shot.tag} />
        </Svg>
      )}
      {shot.lines.map((l, i) => (
        <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={Math.ceil((l.duration + 0.4) * fps)} layout="none">
          <Html5Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}
      {shot.dings.map((d, i) => (
        <Sequence key={i} from={Math.round(d.t * fps)} layout="none">
          <Html5Audio src={staticFile(d.big ? 'sfx/bigbell.mp3' : 'sfx/bell.mp3')} volume={d.big ? 1 : 0.7} />
        </Sequence>
      ))}
      {(shot.sfx ?? []).map((s: any, i: number) => (
        <Sequence key={i} from={Math.round((s.at ?? 0) * fps)} layout="none">
          <Html5Audio src={staticFile(`sfx/${s.n}.mp3`)} volume={s.v ?? 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// The film's finish over every shot: vignette, a little grain, and wide bars top and bottom.
const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 78% 82% at 50% 50%, transparent 48%, rgba(0,0,0,0.5) 100%)'}} />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('sfx/grain.png')})`,
          backgroundPosition: `${Math.floor(random(`gx${frame}`) * 640)}px ${Math.floor(random(`gy${frame}`) * 640)}px`,
          mixBlendMode: 'overlay',
          opacity: 0.16,
        }}
      />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: '#000'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: '#000'}} />
    </>
  );
};

export const Special: React.FC<SpecialBuild> = (build) => {
  const total = specialFrames(build);
  // Per-shot music level, smoothed over half a second at each boundary.
  const starts: {at: number; bed: string}[] = [];
  build.shots.reduce((n, s) => {
    starts.push({at: n, bed: s.bed ?? 'calm'});
    return n + frames(s);
  }, 0);
  const level = (f: number, bed: string, on: number) => {
    let v = 0;
    for (const s of starts) {
      if (f < s.at) break;
      const target = s.bed === bed ? on : 0;
      v += (target - v) * Math.min(1, (f - s.at) / 12);
    }
    return v * interpolate(f, [0, 24, total - 72, total], [0, 1, 1, 0], clamp);
  };
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Html5Audio src={staticFile(build.pad)} volume={(f) => level(f, 'calm', 0.22)} />
      <Html5Audio src={staticFile(build.tension)} volume={(f) => level(f, 'tense', 0.34)} />
      <Series>
        {build.shots.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={frames(s)}>
            <ShotBlock shot={s} dur={frames(s)} />
          </Series.Sequence>
        ))}
      </Series>
      <Finish />
    </AbsoluteFill>
  );
};
