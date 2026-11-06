import React from 'react';
import {random} from 'remotion';
import {TopHand} from './world';
import {PROP_DRAW_BR} from './filmPropsBR';

// Props for data-built films: a shot lists them by name, with a place and optional moves. Each is drawn around its own
// origin, at a size that reads on a wide shot; `s` scales it for close work.
const CREAM = '#e6dec9';
const STEEL = '#aeb4b4';
const COFFEE = '#3f2415';

export type PropMove = {at: number; dur?: number; x?: number; y?: number; r?: number; s?: number; o?: number; ease?: 'io' | 'in' | 'out' | 'gravity' | 'linear'};
export type PropDef = {
  p: string;
  x: number;
  y: number;
  r?: number;
  s?: number;
  o?: number;
  moves?: PropMove[];
  drift?: number; // slow float while held in the air, in px
  layer?: 'back' | 'front';
  shadow?: boolean; // top-down: a soft shadow that spreads as the prop rises off the table
  h?: number;
  m?: number;
  c?: string;
  text?: string;
  w?: number;
  n?: number;
  curl?: number[];
  point?: boolean;
  t2?: string;
  t3?: string;
  t4?: string;
  lines?: string[];
};

const EASE: Record<NonNullable<PropMove['ease']>, (t: number) => number> = {
  io: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  in: (t) => t ** 3,
  out: (t) => 1 - (1 - t) ** 4,
  gravity: (t) => t * t,
  linear: (t) => t,
};

const stateAt = (d: PropDef, f: number) => {
  const st = {x: d.x, y: d.y, r: d.r ?? 0, s: d.s ?? 1, o: d.o ?? 1};
  for (const m of d.moves ?? []) {
    if (m.at > f) break;
    const dur = m.dur ?? 8;
    const t = EASE[m.ease ?? 'io'](dur <= 0 ? 1 : Math.min(1, (f - m.at) / dur));
    if (m.x !== undefined) st.x += (m.x - st.x) * t;
    if (m.y !== undefined) st.y += (m.y - st.y) * t;
    if (m.r !== undefined) st.r += (m.r - st.r) * t;
    if (m.s !== undefined) st.s += (m.s - st.s) * t;
    if (m.o !== undefined) st.o += (m.o - st.o) * t;
  }
  return st;
};

const Mug: React.FC<{c?: string}> = ({c = '#d9d2bd'}) => (
  <g>
    <path d="M26 -30 q 26 8 0 26" stroke={c} strokeWidth={7} fill="none" />
    <rect x={-28} y={-44} width={56} height={46} rx={6} fill={c} />
    <rect x={-28} y={-44} width={18} height={46} rx={6} fill="#000" opacity={0.14} />
    <ellipse cx={0} cy={-43} rx={27} ry={6} fill={COFFEE} />
  </g>
);

const TopMug: React.FC<{f: number}> = ({f}) => (
  <g>
    <path d="M78 -14 q 44 14 0 30" stroke="#d9d2bd" strokeWidth={15} fill="none" />
    <circle r={80} fill="#d9d2bd" />
    <circle r={62} fill={COFFEE} />
    <path d="M-30 -30 A 42 42 0 0 1 18 -40" stroke="#6f4a31" strokeWidth={7} fill="none" strokeLinecap="round" />
    {[0, 1].map((i) => (
      <path key={i} d={`M${-20 + i * 30} ${-40 - i * 8} q ${14 + Math.sin(f / 7 + i) * 11} -44 -5 -84 q -18 -40 9 -80`} stroke="#fff" strokeOpacity={0.13} strokeWidth={16} fill="none" strokeLinecap="round" filter="url(#wSoftS)" />
    ))}
  </g>
);

const Plate: React.FC<{n?: number}> = ({n = 0}) => (
  <g>
    <circle r={150} fill="#e9e3d2" />
    <circle r={150} fill="none" stroke="#2c5f60" strokeWidth={7} opacity={0.65} />
    <circle r={108} fill="#dcd5c1" />
    {n === 1 && (
      <g>
        <path d="M-58 -38 Q -6 -92 56 -44 Q 90 12 34 42 Q -32 76 -72 28 Q -86 -6 -58 -38 Z" fill="#f4eedd" />
        <circle cx={-6} cy={-6} r={31} fill="#e3a52f" />
        <circle cx={-14} cy={-14} r={9} fill="#fff" opacity={0.45} />
      </g>
    )}
  </g>
);

const Egg: React.FC = () => (
  <g>
    <path d="M-58 -38 Q -6 -92 56 -44 Q 90 12 34 42 Q -32 76 -72 28 Q -86 -6 -58 -38 Z" fill="#f4eedd" />
    <circle cx={-6} cy={-6} r={31} fill="#e3a52f" />
    <circle cx={-14} cy={-14} r={9} fill="#fff" opacity={0.45} />
  </g>
);

const Fork: React.FC = () => (
  <g fill={STEEL}>
    <rect x={-7} y={-40} width={14} height={190} rx={6} />
    <rect x={-22} y={-96} width={44} height={62} rx={9} />
    {[-22, -7, 8].map((x) => <rect key={x} x={x} y={-142} width={13} height={56} rx={4} />)}
    <rect x={-3} y={-30} width={4} height={170} fill="#fff" opacity={0.35} />
  </g>
);

const Spoon: React.FC = () => (
  <g fill={STEEL}>
    <rect x={-7} y={-40} width={14} height={190} rx={6} />
    <ellipse cx={0} cy={-76} rx={34} ry={48} />
    <ellipse cx={-8} cy={-82} rx={14} ry={26} fill="#fff" opacity={0.3} />
  </g>
);

const Napkin: React.FC = () => (
  <g>
    <rect x={-90} y={-90} width={180} height={180} fill="#e4dfd0" />
    <path d="M-90 -90 L 90 90 M 90 -90 L 0 0" stroke="#000" strokeOpacity={0.12} strokeWidth={5} />
    <path d="M-90 90 L 0 0 L 90 90 Z" fill="#000" opacity={0.06} />
  </g>
);

const Coffeepot: React.FC = () => (
  <g transform="scale(-1 1)">
    <path d="M-44 -60 L -68 -74 L -52 -50 Z" fill="#2a2a2f" />
    <path d="M-40 -82 H 40 L 34 -60 Q 66 -18 46 0 H -46 Q -66 -18 -34 -60 Z" fill="#d8e0dd" opacity={0.92} />
    <path d="M-54 -22 Q -60 -8 -46 0 H 46 Q 60 -8 54 -22 Z" fill={COFFEE} />
    <rect x={-44} y={-98} width={88} height={18} rx={5} fill="#2a2a2f" />
    <path d="M42 -80 q 44 6 28 58" stroke="#2a2a2f" strokeWidth={12} fill="none" strokeLinecap="round" />
  </g>
);

// A floating lump of coffee, with a bright edge. `f` makes it wobble slowly: liquid with no weight.
const Blob: React.FC<{f: number; c?: string}> = ({f, c = COFFEE}) => {
  const a = Math.sin(f / 5) * 7;
  const b = Math.cos(f / 6) * 6;
  return (
    <g>
      <path d={`M-58 ${-8 + a} Q -46 ${-52 - b} 0 ${-46 + a} Q ${54 + b} -44 58 ${b} Q ${50 - a} 42 4 ${44 - b} Q -50 ${44 + a} -58 ${-8 + a} Z`} fill={c} />
      <path d={`M-34 ${-22 + a} Q -14 ${-38 - b} 16 -32`} stroke="#b98a5e" strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Stain: React.FC = () => (
  <g fill={COFFEE}>
    <path d="M-40 -14 Q -22 -40 8 -30 Q 42 -30 40 2 Q 44 34 10 30 Q -24 48 -40 22 Q -56 6 -40 -14 Z" />
    <circle cx={46} cy={-26} r={7} />
    <circle cx={-52} cy={34} r={5} />
    <circle cx={24} cy={46} r={6} />
  </g>
);

const Pea: React.FC<{n?: number}> = ({n = 7}) => (
  <g>
    {Array.from({length: n}).map((_, i) => (
      <circle key={i} cx={(random(`pa${i}`) - 0.5) * 80} cy={(random(`pb${i}`) - 0.5) * 80} r={12} fill={i % 2 ? '#6e9a4a' : '#7fae56'} />
    ))}
  </g>
);

const Toast: React.FC = () => (
  <g>
    <path d="M-68 -74 Q -92 -78 -86 -48 L -70 70 H 70 L 86 -48 Q 92 -78 68 -74 Z" fill="#b5803f" />
    <path d="M-56 -58 Q -72 -60 -70 -44 L -56 56 H 56 L 70 -44 Q 72 -60 56 -58 Z" fill="#d9a968" />
  </g>
);

// A wall clock with hands set by data. h and m are the time shown, and the minute hand can tick with moves on `m`.
const ClockFace: React.FC<{h?: number; m?: number; f: number; run?: boolean; cream?: string}> = ({h = 3, m = 0, f, run, cream = CREAM}) => {
  const sec = run ? (Math.floor(f / 24) * 6) % 360 : -1;
  const mA = m * 6;
  const hA = ((h % 12) + m / 60) * 30;
  return (
    <g>
      <circle r={118} fill={cream} stroke="#2c5f60" strokeWidth={15} />
      {Array.from({length: 12}).map((_, i) => {
        const t = (i * Math.PI) / 6;
        return <path key={i} d={`M${Math.sin(t) * 90} ${-Math.cos(t) * 90} L${Math.sin(t) * 104} ${-Math.cos(t) * 104}`} stroke="#333" strokeWidth={i % 3 ? 3 : 8} />;
      })}
      <path d={`M0 0 L${Math.sin((hA * Math.PI) / 180) * 58} ${-Math.cos((hA * Math.PI) / 180) * 58}`} stroke="#181818" strokeWidth={10} strokeLinecap="round" />
      <path d={`M0 0 L${Math.sin((mA * Math.PI) / 180) * 88} ${-Math.cos((mA * Math.PI) / 180) * 88}`} stroke="#181818" strokeWidth={7} strokeLinecap="round" />
      {sec >= 0 && <path d={`M0 12 L${Math.sin((sec * Math.PI) / 180) * 96} ${-Math.cos((sec * Math.PI) / 180) * 96}`} stroke="#a33" strokeWidth={3} strokeLinecap="round" />}
      <circle r={8} fill="#181818" />
    </g>
  );
};

const Cake: React.FC = () => (
  <g>
    <rect x={-82} y={-12} width={164} height={8} rx={4} fill="#c9c4b4" />
    <rect x={-68} y={-58} width={136} height={46} rx={5} fill="#f2ead8" />
    <rect x={-50} y={-98} width={100} height={40} rx={5} fill="#f6efdf" />
    <rect x={-32} y={-132} width={64} height={34} rx={5} fill="#f2ead8" />
    {[-52, -26, 0, 26, 52].map((x) => <circle key={x} cx={x} cy={-54} r={6} fill="#b9607b" />)}
    {[-34, -11, 11, 34].map((x) => <circle key={x} cx={x} cy={-94} r={5} fill="#b9607b" />)}
    <path d="M-68 -30 q 11 12 22 0 q 11 12 23 0 q 11 12 23 0 q 11 12 23 0 q 11 12 23 0" stroke="#e0d6bf" strokeWidth={4} fill="none" />
    <rect x={-32} y={-132} width={16} height={34} fill="#000" opacity={0.05} />
    <rect x={-68} y={-58} width={20} height={46} fill="#000" opacity={0.06} />
    <path d="M-9 -132 V -152 M9 -132 V -152" stroke="#2a2a2f" strokeWidth={4} />
    <circle cx={-9} cy={-158} r={8} fill="#2a2a2f" />
    <circle cx={9} cy={-158} r={8} fill="#d8d2c2" />
  </g>
);

const SoupPot: React.FC = () => (
  <g>
    <rect x={-96} y={-96} width={192} height={96} rx={10} fill={STEEL} />
    <rect x={-96} y={-96} width={40} height={96} rx={10} fill="#000" opacity={0.16} />
    <rect x={-122} y={-78} width={28} height={12} rx={5} fill="#2a2a2f" />
    <rect x={94} y={-78} width={28} height={12} rx={5} fill="#2a2a2f" />
  </g>
);

const PotLid: React.FC = () => (
  <g>
    <path d="M-102 0 Q 0 -44 102 0 Z" fill="#c2c8c8" />
    <rect x={-14} y={-40} width={28} height={14} rx={6} fill="#2a2a2f" />
  </g>
);

const Razor: React.FC = () => (
  <g>
    <rect x={-6} y={-110} width={12} height={110} rx={4} fill="#2c2c34" />
    <path d="M-6 -110 L 76 -128 L 84 -106 L 6 -94 Z" fill="#dfe6e6" />
  </g>
);

const Ladder: React.FC<{h?: number}> = ({h = 620}) => (
  <g>
    <path d={`M-52 0 L-32 ${-h} M52 0 L32 ${-h}`} stroke="#c9a24a" strokeWidth={13} strokeLinecap="round" />
    {Array.from({length: Math.floor(h / 72)}).map((_, i) => {
      const y = -46 - i * 72;
      const w = 50 - (Math.abs(y) / h) * 19;
      return <rect key={i} x={-w} y={y} width={w * 2} height={9} fill="#a9863a" />;
    })}
  </g>
);

const Bucket: React.FC = () => (
  <g>
    <path d="M-34 -58 Q 0 -96 34 -58" stroke="#444" strokeWidth={4} fill="none" />
    <path d="M-36 -58 H 36 L 28 0 H -28 Z" fill="#8c9496" />
    <ellipse cx={0} cy={-58} rx={36} ry={7} fill="#2c6e73" />
  </g>
);

const Newspaper: React.FC = () => (
  <g>
    <rect x={-92} y={-66} width={184} height={132} fill="#d9d4c3" />
    <rect x={-1} y={-66} width={2} height={132} fill="#888" />
    <rect x={-82} y={-56} width={72} height={15} fill="#444" />
    <rect x={10} y={-56} width={72} height={15} fill="#444" />
    {Array.from({length: 6}).map((_, i) => (
      <g key={i}>
        <rect x={-82} y={-32 + i * 15} width={72} height={3} fill="#777" />
        <rect x={10} y={-32 + i * 15} width={72} height={3} fill="#777" />
      </g>
    ))}
  </g>
);

const Hat: React.FC = () => (
  <g>
    <rect x={-72} y={-10} width={144} height={12} rx={6} fill="#35302c" />
    <path d="M-44 -10 V -58 Q 0 -72 44 -58 V -10 Z" fill="#35302c" />
    <rect x={-44} y={-24} width={88} height={10} fill="#5e2531" />
  </g>
);

const Tower: React.FC<{h?: number; m?: number; f: number}> = ({h = 2, m = 49, f}) => (
  <g>
    <rect x={-210} y={-420} width={420} height={1500} fill="#a08a72" />
    <rect x={-210} y={-420} width={90} height={1500} fill="#000" opacity={0.16} />
    {Array.from({length: 30}).map((_, i) => <rect key={i} x={-210 + ((i * 3) % 7) * 56} y={-400 + i * 46} width={46} height={5} fill="#000" opacity={0.1} />)}
    <path d="M-250 -420 H 250 L 0 -760 Z" fill="#5a3f33" />
    <rect x={-236} y={-436} width={472} height={26} fill="#c7b89c" />
    <rect x={-236} y={280} width={472} height={26} fill="#c7b89c" />
    <g transform="scale(1.45)">
      <ClockFace h={h} m={m} f={f} />
    </g>
  </g>
);

const Pigeon: React.FC = () => (
  <g>
    <ellipse cx={0} cy={-18} rx={26} ry={17} fill="#7c8288" />
    <circle cx={22} cy={-36} r={10} fill="#7c8288" />
    <path d="M31 -36 l 9 3 l -9 3 Z" fill="#c9a24a" />
    <path d="M-20 -14 L -46 -4 L -22 -6 Z" fill="#5f6469" />
    <path d="M-2 -2 V 8 M 6 -2 V 8" stroke="#a65" strokeWidth={3} />
  </g>
);

export const PROP_DRAW: Record<string, (d: PropDef, f: number) => React.ReactNode> = {
  mug: (d) => <Mug c={d.c} />,
  topMug: (_d, f) => <TopMug f={f} />,
  plate: (d) => <Plate n={d.n} />,
  egg: () => <Egg />,
  fork: () => <Fork />,
  spoon: () => <Spoon />,
  napkin: () => <Napkin />,
  coffeepot: () => <Coffeepot />,
  blob: (d, f) => <Blob f={f} c={d.c} />,
  stain: () => <Stain />,
  peas: (d) => <Pea n={d.n} />,
  toast: () => <Toast />,
  clock: (d, f) => <ClockFace h={d.h} m={d.m} f={f} run={d.n === 1} />,
  cake: () => <Cake />,
  soupPot: () => <SoupPot />,
  potLid: () => <PotLid />,
  razor: () => <Razor />,
  ladder: (d) => <Ladder h={d.h} />,
  bucket: () => <Bucket />,
  newspaper: () => <Newspaper />,
  hat: () => <Hat />,
  pigeon: () => <Pigeon />,
  tower: (d, f) => <Tower h={d.h} m={d.m} f={f} />,
  hand: (d) => <TopHand x={0} y={0} cuff={d.c ?? '#b03f28'} curl={d.curl ?? [0.1, 0.05, 0.08, 0.14]} point={d.point} />,
  ...PROP_DRAW_BR,
};

export const PropView: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const draw = PROP_DRAW[d.p];
  if (!draw) throw new Error(`Unknown prop "${d.p}". Add it to PROP_DRAW in filmProps.tsx.`);
  const st = stateAt(d, f);
  if (st.o <= 0.01) return null;
  const dx = d.drift ? Math.sin(f / 19 + d.x) * d.drift : 0;
  const dy = d.drift ? Math.cos(f / 23 + d.y) * d.drift : 0;
  const rise = Math.max(0, st.s / (d.s ?? 1) - 1);
  return (
    <g opacity={st.o}>
      {d.shadow && (
        <g transform={`translate(${st.x + 12 + rise * 120} ${st.y + 16 + rise * 150}) rotate(${st.r}) scale(${d.s ?? 1})`} opacity={0.5 / (1 + rise * 2.2)} filter="url(#wSoft)">
          <g style={{filter: 'brightness(0)'}}>{draw(d, f)}</g>
        </g>
      )}
      <g transform={`translate(${st.x + dx} ${st.y + dy}) rotate(${st.r}) scale(${st.s})`}>{draw(d, f)}</g>
    </g>
  );
};
