import React from 'react';
import {random} from 'remotion';
import {LobbyDesk, LobbyFloor, LobbyProps, LobbyWall} from './world';
import {SETS_BR} from './filmSetsBR';

// Sets for data-built films. A set is drawn once, side-on like a dollhouse, about 3,000 units wide, and shots show it
// from different `cx` values. `wall` moves at `par` of the camera, so the floor plane slides past it.
export type FilmSet = {
  floor: number; // where feet stand
  par: number;
  rim: string;
  light: [number, number]; // key light, world coordinates
  wall: React.FC<{frame: number}>;
  ground: React.FC;
  props?: React.FC;
  front?: React.FC; // furniture people stand behind, drawn in the cast layer
  grade: {edge: string; glow: number; glowColor: string; filter?: string};
};

const FLOOR = 880;
const Sh: React.FC<{x: number; y: number; rx: number; ry?: number; o?: number}> = ({x, y, rx, ry = 12, o = 0.45}) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#000" opacity={o} filter="url(#wSoftS)" />;

// --- Diner, day. A teal-and-cream room with a counter along its length and a row of booths under big windows. ---
const CREAM = '#d4c8ae';
const TEAL = '#3a6f70';
const TEAL_D = '#2a5456';
const BURG = '#6e2c38';
const CHROME = '#a9b0ae';
const WOOD = '#6b4b34';

const DinerWindow: React.FC<{x: number; w: number; seed: string; frame: number}> = ({x, w, seed, frame}) => (
  <g>
    <rect x={x - 12} y={138} width={w + 24} height={366} fill={CHROME} />
    <rect x={x} y={150} width={w} height={342} fill="#bcd5da" />
    <rect x={x} y={392} width={w} height={100} fill="#8e9a93" />
    {Array.from({length: 5}).map((_, i) => {
      const bw = w / 5;
      const bh = 130 + random(`${seed}b${i}`) * 110;
      return (
        <g key={i}>
          <rect x={x + i * bw} y={392 - bh} width={bw - 3} height={bh} fill={i % 2 ? '#a4897a' : '#8d7f76'} />
          {Array.from({length: 9}).map((__, j) => <rect key={j} x={x + i * bw + 7 + (j % 3) * 19} y={392 - bh + 12 + Math.floor(j / 3) * 34} width={11} height={19} fill="#3d4a50" opacity={0.7} />)}
        </g>
      );
    })}
    <clipPath id={`${seed}clip`}>
      <rect x={x} y={150} width={w} height={342} />
    </clipPath>
    <g clipPath={`url(#${seed}clip)`}>
      <rect x={x + ((frame * 3) % (w + 200)) - 160} y={438} width={150} height={40} rx={10} fill="#a33f35" opacity={0.85} />
    </g>
    <path d={`M${x + w / 3} 150 V492 M${x + (2 * w) / 3} 150 V492`} stroke={CHROME} strokeWidth={7} />
    <rect x={x} y={150} width={w} height={46} fill="#fff" opacity={0.08} />
    {Array.from({length: Math.floor(w / 42)}).map((_, i) => <path key={i} d={`M${x + i * 42} 150 v 44 a 21 21 0 0 0 42 0 v -44 Z`} fill={i % 2 ? '#e7e1cf' : BURG} opacity={0.88} />)}
    <rect x={x - 22} y={500} width={w + 44} height={12} fill={CHROME} />
    {/* small things on the sill */}
    {[0.08, 0.16, 0.61, 0.9].map((k, i) => <rect key={i} x={x + w * k} y={484 - i * 3} width={16} height={18 + i * 3} rx={3} fill={['#b5482e', '#d9c554', '#e6dec9', '#55805f'][i]} />)}
  </g>
);

const Booth: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <Sh x={0} y={6} rx={250} />
    <rect x={-250} y={-268} width={62} height={258} rx={16} fill={BURG} />
    <rect x={188} y={-268} width={62} height={258} rx={16} fill={BURG} />
    <rect x={-250} y={-268} width={16} height={258} rx={8} fill="#000" opacity={0.2} />
    <rect x={188} y={-268} width={16} height={258} rx={8} fill="#000" opacity={0.2} />
    <rect x={-190} y={-118} width={54} height={108} fill="#58222c" />
    <rect x={136} y={-118} width={54} height={108} fill="#58222c" />
    <rect x={-126} y={-162} width={252} height={16} rx={5} fill="#d8d3c2" />
    <rect x={-126} y={-148} width={252} height={7} fill={CHROME} />
    <rect x={-12} y={-142} width={24} height={132} fill={CHROME} />
    <rect x={-58} y={-12} width={116} height={10} rx={4} fill={CHROME} />
    <rect x={-92} y={-178} width={30} height={16} rx={3} fill="#d9d2bd" />
    <rect x={44} y={-186} width={14} height={24} rx={4} fill="#b5482e" />
    <rect x={62} y={-184} width={13} height={22} rx={4} fill="#d9c554" />
    <rect x={-20} y={-192} width={34} height={30} rx={3} fill={CHROME} />
  </g>
);

const Stool: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <Sh x={0} y={4} rx={46} ry={8} />
    <rect x={-6} y={-126} width={12} height={120} fill={CHROME} />
    <rect x={-34} y={-8} width={68} height={8} rx={4} fill={CHROME} />
    <rect x={-40} y={-146} width={80} height={22} rx={11} fill={BURG} />
    <rect x={-40} y={-130} width={80} height={6} fill={CHROME} />
  </g>
);

const MenuBoard: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x + 5} y={y + 8} width={420} height={186} fill="#000" opacity={0.3} filter="url(#wSoftS)" />
    <rect x={x} y={y} width={420} height={186} fill="#1f2a2a" stroke={WOOD} strokeWidth={8} />
    {Array.from({length: 7}).map((_, i) => (
      <g key={i}>
        <rect x={x + 22} y={y + 22 + i * 22} width={110 + random(`mn${i}`) * 50} height={7} fill="#d7d2c0" opacity={0.75} />
        <rect x={x + 170} y={y + 22 + i * 22} width={22} height={7} fill="#d9b566" opacity={0.8} />
        <rect x={x + 226} y={y + 22 + i * 22} width={100 + random(`mo${i}`) * 44} height={7} fill="#d7d2c0" opacity={0.75} />
        <rect x={x + 376} y={y + 22 + i * 22} width={22} height={7} fill="#d9b566" opacity={0.8} />
      </g>
    ))}
  </g>
);

const WallClock: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <circle cx={x + 5} cy={y + 8} r={66} fill="#000" opacity={0.3} filter="url(#wSoftS)" />
    <circle cx={x} cy={y} r={64} fill="#e8e1cc" stroke={TEAL_D} strokeWidth={10} />
    {Array.from({length: 12}).map((_, i) => {
      const t = (i * Math.PI) / 6;
      return <path key={i} d={`M${x + Math.sin(t) * 48} ${y - Math.cos(t) * 48} L${x + Math.sin(t) * 55} ${y - Math.cos(t) * 55}`} stroke="#333" strokeWidth={3} />;
    })}
    <path d={`M${x} ${y} L${x + 30} ${y} M${x} ${y} L${x} ${y - 46}`} stroke="#181818" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const HangLamp: React.FC<{x: number; y?: number}> = ({x, y = 230}) => (
  <g>
    <path d={`M${x} -200 V${y}`} stroke="#2a2a2f" strokeWidth={4} />
    <path d={`M${x - 58} ${y + 48} Q ${x - 44} ${y} ${x} ${y} Q ${x + 44} ${y} ${x + 58} ${y + 48} Z`} fill={TEAL_D} />
    <ellipse cx={x} cy={y + 48} rx={58} ry={9} fill="#ffe7b4" />
    <g style={{mixBlendMode: 'screen'}}>
      <ellipse cx={x} cy={y + 110} rx={150} ry={120} fill="#ffd9a0" opacity={0.2} filter="url(#wGlow)" />
    </g>
  </g>
);

const BackBar: React.FC = () => (
  <g>
    {/* shelf run behind the counter */}
    <rect x={1500} y={330} width={1420} height={12} fill={WOOD} />
    <rect x={1500} y={342} width={1420} height={8} fill="#000" opacity={0.2} />
    {Array.from({length: 34}).map((_, i) => {
      const x = 1518 + i * 41;
      const k = random(`sh${i}`);
      if (k < 0.16) return null;
      const tall = 30 + k * 44;
      const c = ['#d7d2c0', '#a33f35', '#d9c554', '#2c6e73', '#c9a24a', '#e6dec9', '#55805f'][Math.floor(random(`sc${i}`) * 7)];
      return <rect key={i} x={x} y={330 - tall} width={22 + (i % 3) * 6} height={tall} rx={3} fill={c} />;
    })}
    {/* pass-through hatch to the kitchen, with a ticket rail and hanging ladles */}
    <rect x={1700} y={378} width={430} height={212} fill="#2a2f2e" stroke={CHROME} strokeWidth={9} />
    <rect x={1712} y={390} width={406} height={70} fill="#46504e" />
    <rect x={1700} y={364} width={430} height={10} fill={CHROME} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${1740 + i * 76} 366 v 24 l 8 8 v 24`} fill="none" stroke="#cfd6d4" strokeWidth={4} />)}
    {[0, 1, 2].map((i) => <rect key={i} x={1780 + i * 94} y={372} width={38} height={48} fill="#efe9d6" transform={`rotate(${(i - 1) * 3} ${1798 + i * 94} 372)`} />)}
    <rect x={1690} y={584} width={450} height={16} fill={CHROME} />
    {/* coffee machine */}
    <g transform="translate(2360 590)">
      <rect x={-120} y={-200} width={240} height={200} rx={8} fill={CHROME} />
      <rect x={-120} y={-200} width={70} height={200} rx={8} fill="#000" opacity={0.12} />
      <rect x={-96} y={-178} width={192} height={38} fill="#1d2222" />
      {[0, 1, 2].map((i) => <circle key={i} cx={-66 + i * 66} cy={-159} r={8} fill={i === 1 ? '#c4492f' : '#d9b566'} />)}
      {[-60, 60].map((x) => (
        <g key={x}>
          <rect x={x - 36} y={-116} width={72} height={78} rx={8} fill="#d8e0dd" opacity={0.85} />
          <rect x={x - 36} y={-70} width={72} height={32} rx={6} fill="#3f2415" />
          <rect x={x - 44} y={-40} width={88} height={10} fill="#2a2a2f" />
        </g>
      ))}
    </g>
    {/* cake dome and stacked cups */}
    <g transform="translate(2640 590)">
      <rect x={-92} y={-10} width={184} height={10} rx={4} fill={CHROME} />
      <path d="M-82 -10 V -86 Q 0 -160 82 -86 V -10 Z" fill="#dfe8e6" opacity={0.42} />
      <rect x={-60} y={-68} width={120} height={58} rx={6} fill="#d6a26e" />
      <rect x={-60} y={-72} width={120} height={18} rx={6} fill="#f2ead8" />
      <circle cx={0} cy={-152} r={9} fill={CHROME} />
    </g>
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={2800 - i * 2} y={570 - i * 15} width={54 + i * 4} height={17} rx={4} fill="#e6dec9" stroke="#b5ad97" strokeWidth={1.5} />)}
  </g>
);

const DinerWall: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-400} y={-300} width={4300} height={FLOOR + 300} fill={CREAM} />
    {Array.from({length: 88}).map((_, i) => <rect key={i} x={-400 + i * 50} y={-300} width={2} height={FLOOR - 340} fill="#000" opacity={0.035} />)}
    <rect x={-400} y={560} width={4300} height={FLOOR - 560} fill={TEAL} />
    {Array.from({length: 110}).map((_, i) => <rect key={i} x={-400 + i * 40} y={560} width={38} height={FLOOR - 560} fill={i % 2 ? '#000' : '#fff'} opacity={0.035} />)}
    <rect x={-400} y={548} width={4300} height={12} fill={CHROME} />
    <rect x={-400} y={40} width={4300} height={70} fill={TEAL_D} />
    <rect x={-400} y={108} width={4300} height={7} fill={CHROME} />
    {[0, 1, 2].map((i) => <DinerWindow key={i} x={-120 + i * 480} w={420} seed={`dw${i}`} frame={frame} />)}
    <rect x={1400} y={-300} width={1600} height={FLOOR + 300} fill="#000" opacity={0.03} />
    <MenuBoard x={1496} y={128} />
    <text x={2270} y={94} textAnchor="middle" fontFamily="Anton" fontSize={52} letterSpacing={8} fill="#e6dec9">
      MAGDA&apos;S
    </text>
    <WallClock x={2150} y={230} />
    <g transform="translate(2300 136)">
      <rect x={4} y={7} width={118} height={156} fill="#000" opacity={0.3} filter="url(#wSoftS)" />
      <rect width={118} height={156} fill="#efe9d6" />
      <rect width={118} height={30} fill="#a33f35" />
      {Array.from({length: 20}).map((_, i) => <rect key={i} x={8 + (i % 5) * 21} y={40 + Math.floor(i / 5) * 27} width={16} height={18} fill={i === 13 ? '#a33f35' : '#c9c4b4'} />)}
    </g>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${2470 + i * 134} ${150 + (i % 2) * 16}) rotate(${(i - 1) * 2})`}>
        <rect x={4} y={7} width={110} height={138} fill="#000" opacity={0.3} filter="url(#wSoftS)" />
        <rect width={110} height={138} fill={WOOD} />
        <rect x={8} y={8} width={94} height={122} fill={['#7d8f85', '#b38f6d', '#8f7f9a'][i]} />
        <circle cx={55} cy={60} r={22} fill="#1c1a20" />
      </g>
    ))}
    <BackBar />
    <rect x={-400} y={-300} width={4300} height={FLOOR + 300} fill="url(#wWall)" opacity={0.5} />
  </g>
);

const CheckerFloor: React.FC = () => (
  <g>
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="#c2baa6" />
    {Array.from({length: 7}).map((_, row) => {
      const y0 = FLOOR + [0, 14, 34, 62, 100, 150, 214][row];
      const y1 = FLOOR + [14, 34, 62, 100, 150, 214, 300][row];
      return Array.from({length: 44}).map((__, i) =>
        (i + row) % 2 ? (
          <path
            key={`${row}-${i}`}
            d={`M${960 + (i - 22) * 120 * (1 + (y0 - FLOOR) / 150)} ${y0} L${960 + (i - 21) * 120 * (1 + (y0 - FLOOR) / 150)} ${y0} L${960 + (i - 21) * 120 * (1 + (y1 - FLOOR) / 150)} ${y1} L${960 + (i - 22) * 120 * (1 + (y1 - FLOOR) / 150)} ${y1} Z`}
            fill="#2f3f3f"
            opacity={0.8}
          />
        ) : null,
      );
    })}
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="url(#wFloor)" opacity={0.65} />
    <rect x={-500} y={FLOOR - 12} width={5600} height={12} fill="#1a1512" opacity={0.75} />
  </g>
);

const DinerFurniture: React.FC = () => (
  <g>
    {[0, 1, 2].map((i) => <Booth key={i} x={100 + i * 480} />)}
    <HangLamp x={100} />
    <HangLamp x={580} />
    <HangLamp x={1060} />
    {/* jukebox and coat rack between the booths and the counter */}
    <g transform={`translate(1370 ${FLOOR})`}>
      <Sh x={0} y={6} rx={100} />
      <path d="M-82 0 V -236 Q 0 -336 82 -236 V 0 Z" fill={BURG} />
      <path d="M-62 -130 V -232 Q 0 -300 62 -232 V -130 Z" fill="#e4c98a" />
      {[-40, -14, 14, 40].map((x) => <rect key={x} x={x - 7} y={-250} width={14} height={110} fill="#b5482e" opacity={0.6} />)}
      <rect x={-64} y={-120} width={128} height={48} fill="#14141a" />
      {Array.from({length: 12}).map((_, i) => <rect key={i} x={-58 + (i % 6) * 20} y={-114 + Math.floor(i / 6) * 20} width={15} height={14} fill="#d7d2c0" />)}
      <rect x={-82} y={-60} width={164} height={8} fill={CHROME} />
    </g>
  </g>
);

// The counter runs along the room, with people on stools in front and staff behind.
const DinerCounter: React.FC = () => (
  <g style={{filter: 'brightness(0.98)'}}>
    <Sh x={2150} y={FLOOR + 6} rx={700} ry={14} />
    <rect x={1520} y={700} width={1300} height={FLOOR - 700} fill={TEAL_D} />
    {Array.from({length: 33}).map((_, i) => <rect key={i} x={1520 + i * 40} y={704} width={38} height={FLOOR - 716} fill={i % 2 ? '#000' : '#fff'} opacity={0.05} />)}
    <rect x={1520} y={FLOOR - 14} width={1300} height={14} fill={CHROME} />
    <rect x={1504} y={680} width={1332} height={22} rx={4} fill="#ddd6c4" />
    <rect x={1504} y={698} width={1332} height={10} fill={CHROME} />
    {/* things on the counter */}
    <g transform="translate(1660 680)">
      <rect x={-20} y={-34} width={40} height={34} rx={4} fill={CHROME} />
      <rect x={-14} y={-26} width={28} height={10} fill="#efe9d6" />
    </g>
    <rect x={1740} y={656} width={13} height={24} rx={4} fill="#b5482e" />
    <rect x={1758} y={659} width={13} height={21} rx={4} fill="#d9c554" />
    <g transform="translate(2020 680)">
      <rect x={-22} y={-4} width={44} height={4} fill="#e9e3d2" />
      <path d="M-34 -4 Q 0 -14 34 -4 Z" fill="#e9e3d2" />
    </g>
    <g transform="translate(2190 680)">
      <rect x={-70} y={-8} width={140} height={8} rx={4} fill={CHROME} />
      <path d="M-58 -8 V -64 Q 0 -112 58 -64 V -8 Z" fill="#dfe8e6" opacity={0.42} />
      <path d="M-44 -8 V -36 H 44 V -8 Z" fill="#c98f58" />
    </g>
    <g transform="translate(2470 680)">
      <rect x={-16} y={-46} width={32} height={46} rx={5} fill="#e6dec9" />
      <rect x={-6} y={-62} width={12} height={16} fill={CHROME} />
    </g>
    <rect x={2600} y={662} width={60} height={18} rx={3} fill="#efe9d6" />
    {[1640, 1800, 1960, 2120, 2280, 2440, 2600, 2760].map((x) => <Stool key={x} x={x} />)}
  </g>
);

// --- Main Street, day. Shopfronts in a row, a lamp post, a bench, a far clock tower over the roofs. ---
const Shop: React.FC<{x: number; w: number; wall: string; awn: string; name: string; seed: string}> = ({x, w, wall, awn, name, seed}) => (
  <g>
    <rect x={x} y={-300} width={w} height={FLOOR + 300} fill={wall} />
    {Array.from({length: 4}).map((_, i) => (
      <g key={i}>
        <rect x={x + 26 + i * ((w - 40) / 4)} y={-40} width={(w - 40) / 4 - 26} height={170} fill="#39484e" />
        <rect x={x + 26 + i * ((w - 40) / 4)} y={-40} width={(w - 40) / 4 - 26} height={40} fill="#b9d3dc" opacity={0.5} />
        <rect x={x + 18 + i * ((w - 40) / 4)} y={130} width={(w - 40) / 4 - 10} height={8} fill="#e6dec9" opacity={0.7} />
      </g>
    ))}
    <rect x={x} y={166} width={w} height={70} fill="#1f2a2a" />
    <text x={x + w / 2} y={216} textAnchor="middle" fontFamily="Anton" fontSize={42} letterSpacing={6} fill="#e6dec9">
      {name}
    </text>
    <rect x={x + 24} y={280} width={w * 0.56} height={490} fill="#b9d3dc" />
    <rect x={x + 24} y={280} width={w * 0.56} height={490} fill="#39484e" opacity={0.2} />
    {Array.from({length: 5}).map((_, i) => <rect key={i} x={x + 44 + i * 56} y={712 - random(`${seed}${i}`) * 70} width={42} height={58 + random(`${seed}${i}`) * 70} rx={4} fill={['#c9a24a', '#a33f35', '#e6dec9', '#55805f', '#8f7f9a'][i]} />)}
    <rect x={x + 24} y={770} width={w * 0.56} height={110} fill="#2a2f2e" />
    <rect x={x + w * 0.64} y={330} width={w * 0.28} height={550} fill="#2c3a3c" />
    <rect x={x + w * 0.67} y={360} width={w * 0.22} height={180} fill="#b9d3dc" opacity={0.7} />
    <circle cx={x + w * 0.68} cy={640} r={8} fill="#c9a24a" />
    <path d={`M${x + 6} 240 H${x + w - 6} L${x + w + 16} 322 H${x - 16} Z`} fill={awn} />
    {Array.from({length: Math.floor(w / 58)}).map((_, i) => <path key={i} d={`M${x + 6 + i * 58} 240 h 29 l 2 82 h -30 Z`} fill="#fff" opacity={0.28} />)}
  </g>
);

const StreetWall: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="#b2d0dc" />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={((i * 900 + frame * 0.4) % 3600) - 200} cy={-80 + i * 34} rx={210} ry={40} fill="#eef3f2" opacity={0.7} filter="url(#wSoftS)" />
    ))}
    <Shop x={-300} w={640} wall="#a4634c" awn="#2c6e73" name="HADLEY HARDWARE" seed="sa" />
    <Shop x={340} w={560} wall="#c4b28e" awn="#6e2c38" name="FLOUR &amp; SONS" seed="sb" />
    <Shop x={900} w={620} wall="#6d8a84" awn="#c9a24a" name="OTTO'S BARBER" seed="sc" />
    <g transform="translate(1040 870)">
      <rect x={-13} y={-260} width={26} height={250} rx={9} fill="#efe9d6" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-13 ${-230 + i * 46} L13 ${-260 + i * 46} V${-236 + i * 46} L-13 ${-206 + i * 46} Z`} fill={i % 2 ? '#2f5c8f' : '#a33f35'} />)}
    </g>
    <Shop x={1520} w={640} wall="#b58f6b" awn="#2c6e73" name="THE TOWN BANK" seed="sd" />
    <Shop x={2160} w={560} wall="#7f6a74" awn="#6e2c38" name="BOOKS" seed="se" />
    <Shop x={2720} w={700} wall="#a9a587" awn="#35605f" name="FLORIST" seed="sf" />
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="url(#wWall)" opacity={0.25} />
  </g>
);

const StreetGround: React.FC = () => (
  <g>
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="#a39d90" />
    {Array.from({length: 66}).map((_, i) => {
      const x = -500 + i * 96;
      return <path key={i} d={`M${x} ${FLOOR} L${960 + (x - 960) * 1.8} ${FLOOR + 110}`} stroke="#000" strokeOpacity={0.14} strokeWidth={3} />;
    })}
    <rect x={-500} y={FLOOR + 108} width={5600} height={12} fill="#d0cbbd" />
    <rect x={-500} y={FLOOR + 120} width={5600} height={200} fill="#4a4c50" />
    {Array.from({length: 30}).map((_, i) => <rect key={i} x={-500 + i * 220} y={FLOOR + 170} width={120} height={8} fill="#d9c554" opacity={0.7} />)}
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="url(#wFloor)" opacity={0.5} />
  </g>
);

const LampPost: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <Sh x={0} y={6} rx={46} ry={8} />
    <rect x={-8} y={-580} width={16} height={580} fill="#26332f" />
    <rect x={-18} y={-30} width={36} height={30} fill="#26332f" />
    <path d="M-26 -580 h 52 l -8 -66 h -36 Z" fill="#efe6c8" stroke="#26332f" strokeWidth={6} />
    <path d="M-34 -580 h 68" stroke="#26332f" strokeWidth={8} />
  </g>
);

const Bench: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <Sh x={0} y={4} rx={120} ry={8} />
    <rect x={-108} y={-104} width={216} height={12} rx={3} fill={WOOD} />
    <rect x={-108} y={-84} width={216} height={12} rx={3} fill={WOOD} />
    <rect x={-112} y={-56} width={224} height={13} rx={3} fill="#7c5a3f" />
    {[-92, 92].map((a) => <rect key={a} x={a - 6} y={-104} width={12} height={104} fill="#26332f" />)}
  </g>
);

const Hydrant: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <Sh x={0} y={4} rx={34} ry={7} />
    <rect x={-18} y={-74} width={36} height={74} rx={5} fill="#a33f35" />
    <rect x={-30} y={-54} width={60} height={13} rx={5} fill="#8a3229" />
    <path d="M-18 -74 Q 0 -96 18 -74 Z" fill="#8a3229" />
  </g>
);

const Planter: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <Sh x={0} y={4} rx={80} ry={8} />
    {Array.from({length: 9}).map((_, i) => <circle key={i} cx={-54 + i * 13} cy={-72 - (i % 3) * 14} r={17} fill={i % 2 ? '#4c7a56' : '#5e8f66'} />)}
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={-36 + i * 24} cy={-88 - (i % 2) * 14} r={7} fill={i % 2 ? '#d9c554' : '#c4492f'} />)}
    <path d="M-70 -56 H 70 L 58 0 H -58 Z" fill="#7c5a3f" />
  </g>
);

const StreetProps: React.FC = () => (
  <g>
    <Planter x={70} />
    <LampPost x={320} />
    <Bench x={640} />
    <Hydrant x={880} />
    <LampPost x={1500} />
    <Planter x={1820} />
    <Bench x={2300} />
    <LampPost x={2680} />
    <Hydrant x={2860} />
  </g>
);

export const SETS: Record<string, FilmSet> = {
  ...SETS_BR,
  diner: {
    floor: FLOOR,
    par: 0.86,
    rim: '#f4dcb8',
    light: [640, 180],
    wall: DinerWall,
    ground: CheckerFloor,
    props: DinerFurniture,
    front: DinerCounter,
    grade: {edge: '#b4a48f', glow: 0.34, glowColor: '#ffe2b0', filter: 'saturate(0.86)'},
  },
  street: {
    floor: FLOOR,
    par: 0.8,
    rim: '#f2f4ee',
    light: [1500, -300],
    wall: StreetWall,
    ground: StreetGround,
    props: StreetProps,
    grade: {edge: '#b9b5ac', glow: 0.26, glowColor: '#fff2d4', filter: 'saturate(0.84)'},
  },
  // The proof's hotel lobby, usable by any film.
  lobby: {
    floor: FLOOR,
    par: 0.84,
    rim: '#f0a860',
    light: [1560, 300],
    wall: LobbyWall as React.FC<{frame: number}>,
    ground: LobbyFloor,
    props: LobbyProps,
    front: LobbyDesk,
    grade: {edge: '#a08f7d', glow: 0.3, glowColor: '#ffd08a', filter: 'saturate(0.82) contrast(0.95)'},
  },
};
