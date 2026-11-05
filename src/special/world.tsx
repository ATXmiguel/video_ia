import React from 'react';
import {AbsoluteFill, random} from 'remotion';

// Reusable pieces from the study: a room with real detail density, a top-down desk with large hands, the torn wipe,
// pop labels and dust. Numbers come from docs/whatif/REPLICATION_GUIDE.md.
const TEAL = '#35605f';
const TEAL_D = '#27494b';
const BURG = '#5e2531';
const BURG_D = '#431a24';
const BRASS = '#b58f43';
const BRASS_L = '#d9b566';
const CREAM = '#d8d0ba';
const WOOD = '#5a4231';
const WOOD_D = '#3d2b1f';
export const WORLD_FLOOR = 880;

const easeInCubic = (t: number) => t ** 3;

export const WorldDefs: React.FC = () => (
  <defs>
    <filter id="wSoft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="12" />
    </filter>
    <filter id="wSoftS" x="-60%" y="-160%" width="220%" height="420%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <filter id="wGlow" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="46" />
    </filter>
    <filter id="wGlowS" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <filter id="wProp" x="-30%" y="-30%" width="170%" height="170%">
      <feDropShadow dx="9" dy="14" stdDeviation="10" floodColor="#000" floodOpacity="0.55" />
    </filter>
    <filter id="wProp2" x="-30%" y="-30%" width="170%" height="170%">
      <feDropShadow dx="3" dy="5" stdDeviation="3.4" floodColor="#000" floodOpacity="0.5" />
    </filter>
    <linearGradient id="wWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity="0.36" />
      <stop offset="0.28" stopColor="#000" stopOpacity="0.04" />
      <stop offset="1" stopColor="#000" stopOpacity="0.3" />
    </linearGradient>
    <linearGradient id="wFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity="0.32" />
      <stop offset="0.4" stopColor="#000" stopOpacity="0.02" />
      <stop offset="1" stopColor="#000" stopOpacity="0.28" />
    </linearGradient>
    <linearGradient id="wFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0.08" />
      <stop offset="1" stopColor="#000" stopOpacity="0.4" />
    </linearGradient>
    <radialGradient id="wDesk" cx="0.46" cy="0.44" r="0.7">
      <stop offset="0" stopColor="#ffdca8" stopOpacity="0.26" />
      <stop offset="1" stopColor="#000" stopOpacity="0.46" />
    </radialGradient>
  </defs>
);

const Sh: React.FC<{x: number; y: number; rx: number; ry?: number; o?: number}> = ({x, y, rx, ry = 14, o = 0.5}) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#000" opacity={o} filter="url(#wSoftS)" />;

// A pool of light on the wall and the floor beneath it.
const Pool: React.FC<{x: number; y: number; c?: string; r?: number; o?: number}> = ({x, y, c = '#ffd08a', r = 200, o = 0.32}) => (
  <g style={{mixBlendMode: 'screen'}}>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill={c} opacity={o} filter="url(#wGlow)" />
    <ellipse cx={x} cy={WORLD_FLOOR + 66} rx={r * 1.2} ry={38} fill={c} opacity={o * 0.75} filter="url(#wGlowS)" />
  </g>
);

const Sconce: React.FC<{x: number; y?: number}> = ({x, y = 400}) => (
  <g>
    <Pool x={x} y={y + 24} />
    <rect x={x - 5} y={y + 40} width={10} height={24} fill={BRASS} />
    <rect x={x - 16} y={y + 60} width={32} height={8} rx={3} fill={BRASS} />
    <path d={`M${x - 24} ${y + 40} L${x - 15} ${y} H${x + 15} L${x + 24} ${y + 40} Z`} fill="#f1dcae" />
    <path d={`M${x - 24} ${y + 40} L${x - 15} ${y} H${x - 6} L${x - 12} ${y + 40} Z`} fill="#000" opacity={0.08} />
  </g>
);

const Frame: React.FC<{x: number; y: number; w: number; h: number; kind?: number}> = ({x, y, w, h, kind = 0}) => (
  <g>
    <rect x={x + 4} y={y + 7} width={w} height={h} fill="#000" opacity={0.3} filter="url(#wSoftS)" />
    <rect x={x} y={y} width={w} height={h} fill={BRASS} />
    <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} fill={CREAM} />
    {kind === 0 && <path d={`M${x + 14} ${y + h - 18} l${(w - 28) * 0.36} ${-(h - 40) * 0.7} l${(w - 28) * 0.24} ${(h - 40) * 0.4} l${(w - 28) * 0.18} ${-(h - 40) * 0.2} l${(w - 28) * 0.22} ${(h - 40) * 0.5} Z`} fill="#6e8a80" />}
    {kind === 1 && <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * 0.24} fill="#7c1f33" opacity={0.8} />}
    {kind === 2 && [0, 1, 2, 3].map((i) => <path key={i} d={`M${x + 16} ${y + 22 + i * 14} H${x + w - 16 - (i % 2) * 20}`} stroke="#776" strokeWidth={3} />)}
  </g>
);

const Pigeonholes: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x + 8} y={y + 12} width={520} height={290} fill="#000" opacity={0.36} filter="url(#wSoftS)" />
    <rect x={x} y={y} width={520} height={290} fill={WOOD} />
    <rect x={x} y={y} width={520} height={290} fill="url(#wFace)" />
    {Array.from({length: 40}).map((_, i) => {
      const cx = x + 18 + (i % 10) * 49.5;
      const cy = y + 16 + Math.floor(i / 10) * 68;
      const hasKey = random(`k${i}`) > 0.28;
      const hasMail = random(`m${i}`) > 0.7;
      return (
        <g key={i}>
          <rect x={cx} y={cy} width={42} height={60} fill={WOOD_D} />
          {hasMail && <rect x={cx + 5} y={cy + 34} width={32} height={24} fill={random(`mc${i}`) > 0.5 ? '#cfc7b1' : '#b7c0b4'} transform={`rotate(${random(`mr${i}`) * 8 - 4} ${cx + 20} ${cy + 46})`} />}
          {hasKey && (
            <g>
              <circle cx={cx + 21} cy={cy + 10} r={4.5} fill="none" stroke={BRASS_L} strokeWidth={2.6} />
              <rect x={cx + 19.6} y={cy + 14} width={3} height={18} fill={BRASS_L} />
              <rect x={cx + 13} y={cy + 30} width={16} height={9} rx={2} fill={random(`t${i}`) > 0.5 ? '#6b2233' : '#2c5f60'} />
            </g>
          )}
        </g>
      );
    })}
  </g>
);

const Palm: React.FC<{x: number; s?: number}> = ({x, s = 1}) => (
  <g transform={`translate(${x} ${WORLD_FLOOR}) scale(${s})`}>
    <Sh x={0} y={4} rx={90} ry={13} />
    {[-58, -34, -12, 14, 38, 62, -78, 80].map((a, i) => (
      <path key={i} d={`M0 -128 q ${a * 0.8} ${-120 - (i % 3) * 30} ${a * 2} ${-70 - (i % 3) * 30} q ${-a * 1.1} -6 ${-a * 2} ${70 + (i % 3) * 30}`} fill={i % 2 ? '#2f5f49' : '#3a6e54'} />
    ))}
    <path d="M-52 -130 H52 L38 0 H-38 Z" fill={BURG_D} />
    <path d="M-52 -130 H-30 L-22 0 H-38 Z" fill="#000" opacity={0.2} />
    <rect x={-56} y={-140} width={112} height={16} rx={3} fill={BURG} />
  </g>
);

const Cart: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${WORLD_FLOOR})`}>
    <Sh x={0} y={6} rx={120} ry={13} />
    <path d="M-92 -280 Q 0 -350 92 -280" stroke={BRASS_L} strokeWidth={8} fill="none" />
    <path d="M-92 -280 V -24 M92 -280 V -24" stroke={BRASS} strokeWidth={8} />
    <rect x={-104} y={-30} width={208} height={12} fill={BRASS} />
    <circle cx={-74} cy={-10} r={11} fill="#14141a" />
    <circle cx={74} cy={-10} r={11} fill="#14141a" />
    <rect x={-74} y={-122} width={108} height={92} rx={8} fill="#7c4a2d" />
    <rect x={-74} y={-122} width={108} height={92} rx={8} fill="url(#wFace)" />
    <path d="M-30 -122 q 10 -16 20 0" stroke="#3d2b1f" strokeWidth={5} fill="none" />
    <rect x={-54} y={-122} width={8} height={92} fill="#3d2b1f" opacity={0.6} />
    <rect x={-44} y={-190} width={88} height={68} rx={8} fill="#31545a" />
    <rect x={-44} y={-190} width={88} height={68} rx={8} fill="url(#wFace)" />
    <rect x={40} y={-104} width={36} height={74} rx={6} fill="#6d2c38" />
  </g>
);

const Clock: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <circle cx={x + 5} cy={y + 8} r={56} fill="#000" opacity={0.3} filter="url(#wSoftS)" />
    <circle cx={x} cy={y} r={56} fill={CREAM} stroke={BRASS} strokeWidth={8} />
    {Array.from({length: 12}).map((_, i) => (
      <path key={i} d={`M${x + Math.sin((i * Math.PI) / 6) * 42} ${y - Math.cos((i * Math.PI) / 6) * 42} L${x + Math.sin((i * Math.PI) / 6) * 48} ${y - Math.cos((i * Math.PI) / 6) * 48}`} stroke="#444" strokeWidth={3} />
    ))}
    <path d={`M${x} ${y} V${y - 34} M${x} ${y} L${x + 24} ${y + 10}`} stroke="#222" strokeWidth={5} strokeLinecap="round" />
  </g>
);

const NoticeBoard: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x + 5} y={y + 9} width={240} height={170} fill="#000" opacity={0.3} filter="url(#wSoftS)" />
    <rect x={x} y={y} width={240} height={170} fill="#8a6c47" stroke={WOOD_D} strokeWidth={7} />
    {[
      [16, 14, 66, 82, '#d9d3bf', -3],
      [92, 12, 56, 46, '#c9b458', 4],
      [156, 18, 68, 60, '#b7c7c9', -2],
      [22, 104, 84, 52, '#cdbfa3', 2],
      [118, 72, 52, 86, '#dfdac8', -4],
      [178, 94, 46, 56, '#c47a6a', 3],
    ].map(([a, b, w, h, c, r], i) => (
      <g key={i} transform={`rotate(${r} ${x + (a as number) + (w as number) / 2} ${y + (b as number) + (h as number) / 2})`}>
        <rect x={x + (a as number)} y={y + (b as number)} width={w as number} height={h as number} fill={c as string} />
        {[0, 1, 2].map((k) => <rect key={k} x={x + (a as number) + 6} y={y + (b as number) + 10 + k * 11} width={(w as number) - 14} height={3} fill="#555" opacity={0.5} />)}
        <circle cx={x + (a as number) + (w as number) / 2} cy={y + (b as number) + 4} r={3.5} fill="#a33" />
      </g>
    ))}
  </g>
);

const Window: React.FC<{x: number; y: number; w: number; h: number; seed?: string; frame?: number}> = ({x, y, w, h, seed = 'lw', frame = 0}) => (
  <g>
    <rect x={x - 14} y={y + 12} width={w + 28} height={h + 24} fill="#000" opacity={0.3} filter="url(#wSoftS)" />
    <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill={CREAM} />
    <rect x={x} y={y} width={w} height={h} fill="#10202c" />
    {Array.from({length: 9}).map((_, i) => {
      const bw = w / 9;
      const bh = h * (0.28 + random(`${seed}h${i}`) * 0.5);
      return (
        <g key={i}>
          <rect x={x + i * bw} y={y + h - bh} width={bw - 2} height={bh} fill={i % 2 ? '#0c1822' : '#132430'} />
          {Array.from({length: 12}).map((__, j) =>
            random(`${seed}${i}${j}`) > 0.62 ? <rect key={j} x={x + i * bw + 5 + (j % 3) * 12} y={y + h - bh + 8 + Math.floor(j / 3) * 18} width={7} height={10} fill="#e6bd6a" opacity={0.85} /> : null,
          )}
        </g>
      );
    })}
    {Array.from({length: 46}).map((_, i) => {
      const rx = x + random(`r${seed}${i}`) * w;
      const ry = y + ((random(`q${seed}${i}`) * h + frame * 9) % h);
      return <path key={i} d={`M${rx} ${ry} l -4 18`} stroke="#9fc3cf" strokeWidth={1.8} opacity={0.34} />;
    })}
    <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h * 0.42} H${x + w}`} stroke={CREAM} strokeWidth={7} />
    <rect x={x - 26} y={y + h + 10} width={w + 52} height={15} fill={CREAM} />
    <path d={`M${x - 56} ${y - 34} h 86 q 10 ${h * 0.5} -24 ${h + 84} h -62 Z`} fill="#6e2c38" />
    <path d={`M${x + w + 56} ${y - 34} h -86 q -10 ${h * 0.5} 24 ${h + 84} h 62 Z`} fill="#6e2c38" />
    {[0, 1, 2].map((i) => <path key={i} d={`M${x - 40 + i * 20} ${y - 30} q 8 ${h * 0.5} -10 ${h + 74}`} stroke="#000" strokeOpacity={0.18} strokeWidth={5} fill="none" />)}
    {[0, 1, 2].map((i) => <path key={i} d={`M${x + w + 40 - i * 20} ${y - 30} q -8 ${h * 0.5} 10 ${h + 74}`} stroke="#000" strokeOpacity={0.18} strokeWidth={5} fill="none" />)}
    <rect x={x - 64} y={y - 44} width={w + 128} height={12} rx={4} fill={BRASS} />
  </g>
);

const Vending: React.FC<{x: number; s?: number}> = ({x, s = 1}) => (
  <g transform={`translate(${x} ${WORLD_FLOOR}) scale(${s})`}>
    <Sh x={10} y={6} rx={190} ry={15} />
    <rect x={-160} y={-560} width={320} height={560} rx={12} fill="#2c4a5e" />
    <rect x={-160} y={-560} width={320} height={560} rx={12} fill="url(#wFace)" />
    <rect x={-134} y={-530} width={196} height={392} rx={6} fill="#10181e" />
    <g style={{mixBlendMode: 'screen'}}>
      <rect x={-134} y={-530} width={196} height={392} fill="#cfe4ea" opacity={0.22} filter="url(#wGlowS)" />
    </g>
    {Array.from({length: 20}).map((_, i) => {
      const cx = -122 + (i % 4) * 46;
      const cy = -518 + Math.floor(i / 4) * 76;
      const c = ['#c9362d', '#d9a93f', '#3f8f6a', '#3f6fa8', '#b65a8a'][Math.floor(random(`sn${i}`) * 5)];
      return (
        <g key={i}>
          <rect x={cx} y={cy} width={38} height={54} rx={3} fill={c} />
          <rect x={cx} y={cy} width={38} height={14} fill="#fff" opacity={0.2} />
          <rect x={cx - 3} y={cy + 56} width={44} height={6} fill="#6d7b82" />
        </g>
      );
    })}
    <rect x={78} y={-510} width={60} height={120} rx={4} fill="#1a2730" />
    {Array.from({length: 9}).map((_, i) => <rect key={i} x={86 + (i % 3) * 16} y={-500 + Math.floor(i / 3) * 24} width={12} height={16} rx={2} fill="#6d7b82" />)}
    <rect x={84} y={-380} width={48} height={12} rx={2} fill="#0a0f12" />
    <rect x={-134} y={-110} width={196} height={70} rx={5} fill="#0a0f12" />
    <rect x={-120} y={-548} width={170} height={12} fill="#d9a93f" opacity={0.0} />
  </g>
);

// A lobby wide enough to walk through. It is drawn in layers so the camera can move them at different speeds.
export const LobbyWall: React.FC<{frame?: number}> = ({frame = 0}) => (
  <g>
    <rect x={-400} y={-200} width={4200} height={WORLD_FLOOR + 200} fill={TEAL} />
    {Array.from({length: 86}).map((_, i) => <rect key={i} x={-400 + i * 50} y={-200} width={25} height={850} fill="#fff" opacity={0.022} />)}
    <rect x={-400} y={640} width={4200} height={WORLD_FLOOR - 640} fill={TEAL_D} />
    {Array.from({length: 27}).map((_, i) => (
      <g key={i}>
        <rect x={-380 + i * 156} y={668} width={134} height={186} fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={4} />
        <rect x={-372 + i * 156} y={676} width={118} height={170} fill="none" stroke="#fff" strokeOpacity={0.05} strokeWidth={3} />
      </g>
    ))}
    <rect x={-400} y={630} width={4200} height={12} fill={CREAM} opacity={0.55} />
    <rect x={-400} y={46} width={4200} height={16} fill={CREAM} opacity={0.34} />
    <rect x={-400} y={70} width={4200} height={6} fill={CREAM} opacity={0.18} />
    <rect x={-400} y={-200} width={4200} height={WORLD_FLOOR + 200} fill="url(#wWall)" />
    <Window x={120} y={170} w={430} h={400} frame={frame} />
    <Frame x={760} y={210} w={150} h={190} kind={0} />
    <Frame x={930} y={250} w={110} h={140} kind={1} />
    <Sconce x={690} />
    <Clock x={1160} y={230} />
    <NoticeBoard x={1230} y={300} />
    <Sconce x={1560} />
    <Frame x={2460} y={200} w={170} h={210} kind={2} />
    <Sconce x={2720} />
    <rect x={1650} y={150} width={560} height={20} fill={BRASS} />
    <text x={1930} y={138} textAnchor="middle" fontFamily="Anton" fontSize={58} letterSpacing={9} fill={BRASS_L}>
      RECEPTION
    </text>
    <Pigeonholes x={1670} y={186} />
    <Pool x={1930} y={260} c="#ffd498" r={330} o={0.4} />
    <Frame x={2880} y={250} w={130} h={160} kind={0} />
    <Clock x={3180} y={240} />
  </g>
);

export const LobbyFloor: React.FC = () => (
  <g>
    <rect x={-400} y={WORLD_FLOOR} width={5600} height={260} fill="#6a4f3e" />
    {Array.from({length: 66}).map((_, i) => {
      const x = -400 + i * 96;
      return <path key={i} d={`M${x} ${WORLD_FLOOR} L${960 + (x - 960) * 2.1} 1140`} stroke="#fff" strokeOpacity={0.09} strokeWidth={3} />;
    })}
    {[902, 930, 972, 1030, 1110].map((y) => <path key={y} d={`M-400 ${y} H5200`} stroke="#fff" strokeOpacity={0.09} strokeWidth={3} />)}
    {Array.from({length: 18}).map((_, i) => (
      <rect key={i} x={-300 + i * 230} y={942} width={118} height={30} fill={i % 2 ? '#000' : '#fff'} opacity={0.035} />
    ))}
    <rect x={-400} y={WORLD_FLOOR} width={5600} height={260} fill="url(#wFloor)" />
    <rect x={-400} y={WORLD_FLOOR - 16} width={5600} height={14} fill="#1a1512" opacity={0.75} />
    <path d="M300 918 L1150 918 L1230 1040 L220 1040 Z" fill={BURG} opacity={0.82} />
    <path d="M326 930 L1130 930 L1192 1026 L262 1026 Z" fill="none" stroke={BRASS_L} strokeOpacity={0.5} strokeWidth={4} />
    <path d="M360 942 L1110 942 L1156 1014 L308 1014 Z" fill="none" stroke={BRASS_L} strokeOpacity={0.22} strokeWidth={3} />
  </g>
);

export const LobbyProps: React.FC = () => (
  <g>
    <Palm x={90} s={1.1} />
    <Cart x={640} />
    <g transform={`translate(1000 ${WORLD_FLOOR})`}>
      <Sh x={0} y={4} rx={150} ry={12} />
      <rect x={-140} y={-90} width={280} height={16} rx={6} fill={BURG} />
      <rect x={-140} y={-170} width={280} height={76} rx={10} fill={BURG} />
      <rect x={-140} y={-170} width={280} height={76} rx={10} fill="url(#wFace)" />
      {[-90, 0, 90].map((a) => <circle key={a} cx={a} cy={-132} r={5} fill={BRASS} />)}
      <rect x={-128} y={-76} width={12} height={76} fill={WOOD_D} />
      <rect x={116} y={-76} width={12} height={76} fill={WOOD_D} />
      <rect x={-96} y={-98} width={70} height={10} rx={2} fill="#d7d2c3" transform="rotate(-3)" />
    </g>
    <Palm x={2360} s={0.95} />
    <Cart x={3060} />
  </g>
);

export const LobbyDesk: React.FC = () => (
  <g>
    <Sh x={1940} y={WORLD_FLOOR + 6} rx={420} ry={18} />
    <rect x={1620} y={640} width={640} height={WORLD_FLOOR - 640} fill={BURG} />
    <rect x={1620} y={640} width={640} height={WORLD_FLOOR - 640} fill="url(#wFace)" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={1644 + i * 152} y={676} width={136} height={186} fill="none" stroke="#000" strokeOpacity={0.26} strokeWidth={5} />
        <rect x={1654 + i * 152} y={686} width={116} height={166} fill="none" stroke={BRASS_L} strokeOpacity={0.2} strokeWidth={3} />
      </g>
    ))}
    <rect x={1604} y={622} width={672} height={24} rx={3} fill={WOOD} />
    <rect x={1604} y={622} width={672} height={7} fill="#fff" opacity={0.12} />
    <rect x={1620} y={646} width={640} height={7} fill={BRASS} />
    <path d="M1720 622 a 22 22 0 0 1 44 0 Z" fill={BRASS_L} />
    <circle cx={1742} cy={596} r={5} fill={BRASS_L} />
    <rect x={2060} y={584} width={120} height={38} rx={3} fill="#e6dec9" />
    <rect x={2060} y={584} width={58} height={38} rx={3} fill="#cfc7b1" />
    {[0, 1, 2].map((i) => <rect key={i} x={2070} y={592 + i * 9} width={40} height={2.5} fill="#776" />)}
    <path d="M2180 620 l 24 -46" stroke="#2c2c34" strokeWidth={6} strokeLinecap="round" />
    <rect x={1860} y={608} width={72} height={14} rx={2} fill="#26262e" />
    <rect x={1880} y={574} width={30} height={34} rx={3} fill="#2c2c34" />
    <rect x={2214} y={602} width={40} height={20} rx={3} fill="#c8b15a" />
  </g>
);

export const Fore: React.FC<{d: string; c?: string; blur?: number; dx?: number}> = ({d, c = '#090c0e', blur = 16, dx = 0}) => (
  <AbsoluteFill style={{filter: `blur(${blur}px)`, transform: `translateX(${dx}px) scale(1.05)`}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <path d={d} fill={c} />
    </svg>
  </AbsoluteFill>
);

// Large top-down hand: a real palm with separate fingers, each with a soft highlight. `curl` shortens the fingers.
export const TopHand: React.FC<{x: number; y: number; rot?: number; s?: number; cuff?: string; curl?: number[]; point?: boolean; rim?: string}> = ({x, y, rot = 0, s = 1, cuff = '#c28c24', curl = [0, 0, 0, 0], point, rim = '#e9a966'}) => {
  const fingers = [
    {x: -66, len: 150, r: -12},
    {x: -22, len: 186, r: -3},
    {x: 24, len: 176, r: 4},
    {x: 68, len: 140, r: 13},
  ];
  const c = point ? [0, 0.58, 0.62, 0.6] : curl;
  const Finger: React.FC<{f: (typeof fingers)[0]; k: number; color?: string; dx?: number; dy?: number}> = ({f, k, color = '#0e0d13', dx = 0, dy = 0}) => {
    const L = f.len * (1 - k);
    return (
      <g transform={`translate(${f.x + dx} ${-100 + dy}) rotate(${f.r})`}>
        <rect x={-24} y={-L} width={48} height={L + 34} rx={24} fill={color} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g filter="url(#wProp)">
        {/* rim on the side facing the lamp */}
        <g>
          {fingers.map((f, i) => <Finger key={i} f={f} k={c[i]} color={rim} dx={7} dy={-5} />)}
          <path d="M-98 -96 Q -112 60 -66 120 H 92 Q 124 40 112 -96 Z" fill={rim} transform="translate(7 -4)" />
          <rect x={92} y={-78} width={48} height={150} rx={24} fill={rim} transform="translate(7 -4) rotate(38 116 0)" />
        </g>
        {fingers.map((f, i) => <Finger key={i} f={f} k={c[i]} />)}
        <rect x={92} y={-78} width={48} height={150} rx={24} fill="#0e0d13" transform="rotate(38 116 0)" />
        <path d="M-98 -96 Q -112 60 -66 120 H 92 Q 124 40 112 -96 Z" fill="#0e0d13" />
      </g>
      {/* knuckle lines, glove stitching, and a soft sheen on each finger */}
      {fingers.map((f, i) => {
        const L = f.len * (1 - c[i]);
        return (
          <g key={i} transform={`translate(${f.x} -100) rotate(${f.r})`}>
            <rect x={-9} y={-L + 16} width={18} height={L * 0.7} rx={9} fill="#6d6876" opacity={0.3} filter="url(#wSoftS)" />
            <rect x={-3} y={-L + 26} width={6} height={L * 0.42} rx={3} fill="#67636f" opacity={0.75} />
            <path d={`M-21 ${-L * 0.42} H21 M-21 2 H21`} stroke="#2a2833" strokeWidth={3} />
          </g>
        );
      })}
      <path d="M-70 -52 Q 0 -74 84 -52 M-74 -20 Q 0 -40 90 -18" stroke="#2a2833" strokeWidth={3} fill="none" />
      <ellipse cx={8} cy={34} rx={50} ry={40} fill="#57535f" opacity={0.26} filter="url(#wSoftS)" />
      {/* cuff */}
      <g>
        <rect x={-96} y={112} width={204} height={560} fill={cuff} />
        <rect x={-96} y={112} width={46} height={560} fill="#000" opacity={0.28} />
        <rect x={84} y={112} width={24} height={560} fill="#fff" opacity={0.07} />
        <rect x={-108} y={100} width={228} height={38} rx={7} fill="#efe6cd" />
        <rect x={-108} y={128} width={228} height={10} fill="#000" opacity={0.2} />
        <circle cx={78} cy={119} r={7} fill="#b58f43" />
      </g>
    </g>
  );
};

export const WoodDesk: React.FC<{dark?: boolean}> = ({dark}) => (
  <g>
    <rect x={-300} y={-300} width={2520} height={1680} fill={dark ? '#3e2c20' : '#6e5038'} />
    {Array.from({length: 11}).map((_, i) => (
      <g key={i}>
        <rect x={-300} y={i * 150 - 240} width={2520} height={150} fill={i % 2 ? '#000' : '#fff'} opacity={0.032} />
        <path d={`M-300 ${i * 150 - 240} H2220`} stroke="#000" strokeOpacity={0.34} strokeWidth={4} />
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${random(`gx${i}${k}`) * 1500 - 200} ${i * 150 - 210 + k * 32} q 320 ${random(`gy${i}${k}`) * 18 - 9} 800 0`} stroke="#000" strokeOpacity={0.1} strokeWidth={3} fill="none" />
        ))}
      </g>
    ))}
    <rect x={-300} y={-300} width={2520} height={1680} fill="url(#wDesk)" />
  </g>
);

// Dust in the lamp's beam on top-down shots, plus the soft blotches of a lamp through a shade.
export const Motes: React.FC<{frame: number; n?: number; seed?: string}> = ({frame, n = 46, seed = 'mt'}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const x = random(`${seed}x${i}`) * 1920 + Math.sin(frame / 40 + i) * 14;
      const y = random(`${seed}y${i}`) * 1080 - frame * (0.12 + random(`${seed}v${i}`) * 0.25);
      const r = 1.2 + random(`${seed}r${i}`) * 2.6;
      return <circle key={i} cx={x} cy={((y % 1080) + 1080) % 1080} r={r} fill="#fff4dc" opacity={0.28 + random(`${seed}o${i}`) * 0.4} />;
    })}
  </g>
);

// The pill: grows out from its middle over four frames, then the text fades up. Set in spaced capitals.
export const PopPill: React.FC<{text: string; x: number; y: number; since: number; color?: string; dark?: boolean; to?: [number, number]}> = ({text, x, y, since, color = '#efe6cd', dark = true, to}) => {
  if (since < 0) return null;
  const w = text.length * 25 + 76; // measured: 50 px tall at 720p, so 75 here, in heavy spaced capitals
  const t = Math.min(1, since / 4);
  const e = 1 - (1 - t) ** 3;
  const op = Math.min(1, Math.max(0, (since - 2) / 3));
  return (
    <g>
      {to && <path d={`M${x} ${y + 37} L${to[0]} ${to[1]}`} stroke={color} strokeWidth={2} strokeOpacity={0.7 * op} />}
      <rect x={x - (w / 2) * e} y={y - 37} width={w * e} height={74} rx={37} fill={dark ? '#14130f' : color} opacity={0.92} stroke="#c9a56a" strokeWidth={3} />
      <text x={x} y={y + 14} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={38} letterSpacing={4} fill={dark ? color : '#14130f'} opacity={op}>
        {text}
      </text>
    </g>
  );
};

const TORN: [number, number][] = [[0, 0], [38, 90], [-6, 170], [30, 275], [-18, 372], [24, 470], [-12, 560], [34, 668], [-20, 760], [22, 868], [-10, 960], [18, 1080]];

// The torn-edge wipe: the tear accelerates across in five or six frames, and the new shot is already there behind it.
export const TornWipe: React.FC<{from: React.ReactNode; to: React.ReactNode; p: number; hold?: number}> = ({from, to, p, hold}) => {
  const q = hold !== undefined ? hold : easeInCubic(Math.min(1, Math.max(0, p)));
  const x = -80 + q * 2080;
  const pts = TORN.map(([dx, y]) => `${x + dx}px ${y}px`).join(',');
  return (
    <AbsoluteFill>
      <AbsoluteFill>{from}</AbsoluteFill>
      <AbsoluteFill style={{clipPath: `polygon(0 0, ${pts}, 0 1080px)`}}>{to}</AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <polyline points={TORN.map(([dx, y]) => `${x + dx},${y}`).join(' ')} fill="none" stroke="#050507" strokeWidth={11} />
      </svg>
    </AbsoluteFill>
  );
};

export {Vending};
