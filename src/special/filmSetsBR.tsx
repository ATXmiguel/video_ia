import React from 'react';
import {random} from 'remotion';
import type {FilmSet} from './filmSets';

// Sets for "E se, de repente, a internet acabasse?": a Brazilian neighbourhood. Same recipe as filmSets.tsx: side-on,
// about 3,000 units wide, lots of small slightly irregular objects, and every room comes back at another hour or in
// another state. All writing on these sets is in Portuguese. Business names are invented.
const FLOOR = 880;
const Sh: React.FC<{x: number; y?: number; rx: number; ry?: number; o?: number}> = ({x, y = FLOOR + 5, rx, ry = 11, o = 0.42}) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#000" opacity={o} filter="url(#wSoftS)" />;
const arr = (n: number) => Array.from({length: n}, (_, i) => i);
const ANTON = 'Anton';

// ---------- Mercadinho da Neide ----------
const GOODS = ['#c4492f', '#d9b23a', '#2f7a6a', '#e6dec9', '#3b6ea8', '#b9607b', '#7fae56', '#d97f2e'];
const Shelf: React.FC<{x: number; y: number; w: number; seed: string; stock: number}> = ({x, y, w, seed, stock}) => (
  <g>
    <rect x={x} y={y} width={w} height={11} fill="#5a4230" />
    <rect x={x} y={y + 11} width={w} height={6} fill="#000" opacity={0.25} />
    {arr(Math.floor(w / 42)).map((i) => {
      const k = random(`${seed}k${i}`);
      if (random(`${seed}s${i}`) > stock) return null;
      const tall = 44 + k * 44;
      const c = GOODS[Math.floor(random(`${seed}c${i}`) * GOODS.length)];
      const round = k > 0.62;
      return (
        <g key={i} transform={`translate(${x + 8 + i * 42} ${y})`}>
          <rect x={0} y={-tall} width={34} height={tall} rx={round ? 10 : 2} fill={c} />
          <rect x={0} y={-tall} width={9} height={tall} rx={round ? 8 : 2} fill="#000" opacity={0.14} />
          <rect x={4} y={-tall * 0.66} width={26} height={tall * 0.3} fill="#f3ead6" opacity={0.75} />
        </g>
      );
    })}
  </g>
);
const PriceTag: React.FC<{x: number; y: number; t: string; r?: number}> = ({x, y, t, r = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={3} y={4} width={104} height={52} fill="#000" opacity={0.22} />
    <rect width={104} height={52} fill="#f7e36b" />
    <text x={52} y={38} textAnchor="middle" fontFamily={ANTON} fontSize={30} fill="#a52a1e">{t}</text>
  </g>
);
const Banana: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M0 0 q ${-16 + i * 11} 44 ${-34 + i * 20} 80`} stroke="#e0bb3e" strokeWidth={15} fill="none" strokeLinecap="round" />)}
    <rect x={-5} y={-18} width={10} height={22} fill="#6b5a2e" />
  </g>
);
const Crate: React.FC<{x: number; c: string; stock: number; seed: string}> = ({x, c, stock, seed}) => (
  <g transform={`translate(${x} ${FLOOR})`}>
    <Sh x={0} y={4} rx={92} />
    {stock > 0.5 && arr(14).map((i) => <circle key={i} cx={-68 + (i % 7) * 23} cy={-106 - Math.floor(i / 7) * 18 + random(`${seed}${i}`) * 5} r={15} fill={c} />)}
    <rect x={-84} y={-104} width={168} height={104} fill="#a8824f" />
    {[0, 1, 2].map((i) => <rect key={i} x={-84} y={-100 + i * 34} width={168} height={22} fill="#be9a62" />)}
    <rect x={-84} y={-104} width={15} height={104} fill="#8c6b3f" />
    <rect x={69} y={-104} width={15} height={104} fill="#8c6b3f" />
  </g>
);
const mercadoWall = (stock: number): React.FC<{frame: number}> => ({frame}) => (
  <g>
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="#d8c79a" />
    <rect x={-400} y={620} width={4400} height={FLOOR - 620} fill="#b8644a" />
    {arr(110).map((i) => <rect key={i} x={-400 + i * 40} y={620} width={38} height={FLOOR - 620} fill={i % 2 ? '#000' : '#fff'} opacity={0.04} />)}
    <rect x={-400} y={610} width={4400} height={10} fill="#7b4230" />
    {/* the sign over the shelves */}
    <rect x={760} y={22} width={980} height={92} rx={6} fill="#245f57" />
    <text x={1250} y={92} textAnchor="middle" fontFamily={ANTON} fontSize={66} letterSpacing={5} fill="#f4e7c2">MERCADINHO DA NEIDE</text>
    {/* shelves, left and middle runs */}
    {[0, 1, 2, 3].map((row) => <Shelf key={row} x={120} y={230 + row * 120} w={980} seed={`ms${row}`} stock={stock} />)}
    {[0, 1, 2, 3].map((row) => <Shelf key={`b${row}`} x={1300} y={230 + row * 120} w={720} seed={`mt${row}`} stock={stock} />)}
    {/* hanging things */}
    {[230, 400, 560, 860, 1040].map((x, i) => <path key={x} d={`M${x} 122 v ${22 + (i % 2) * 12}`} stroke="#4a3a2a" strokeWidth={3} />)}
    {stock > 0.5 && <Banana x={232} y={150} />}
    {stock > 0.5 && <Banana x={402} y={160} />}
    <PriceTag x={520} y={134} t="R$ 5,90" r={-3} />
    <PriceTag x={820} y={140} t="R$ 3,49" r={2} />
    <PriceTag x={1000} y={136} t="R$ 8,20" r={-2} />
    {/* the classic sign */}
    <g transform="translate(2140 150) rotate(-2)">
      <rect x={5} y={7} width={420} height={140} fill="#000" opacity={0.25} />
      <rect width={420} height={140} fill="#f4efdd" stroke="#a52a1e" strokeWidth={7} />
      <text x={210} y={66} textAnchor="middle" fontFamily={ANTON} fontSize={46} letterSpacing={2} fill="#a52a1e">FIADO, SÓ AMANHÃ</text>
      <text x={210} y={116} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={27} fill="#333">Volte sempre!</text>
    </g>
    {/* calendar, clock */}
    <g transform="translate(2150 330)">
      <rect x={4} y={6} width={126} height={160} fill="#000" opacity={0.25} />
      <rect width={126} height={160} fill="#f1ecdb" />
      <rect width={126} height={30} fill="#245f57" />
      {arr(20).map((i) => <rect key={i} x={8 + (i % 5) * 23} y={40 + Math.floor(i / 5) * 28} width={17} height={19} fill={i === 11 ? '#c4492f' : '#c9c4b4'} />)}
    </g>
    <g transform="translate(2420 400)">
      <circle r={66} fill="#efe8d4" stroke="#245f57" strokeWidth={10} />
      {arr(12).map((i) => <path key={i} d={`M${Math.sin((i * Math.PI) / 6) * 48} ${-Math.cos((i * Math.PI) / 6) * 48} L${Math.sin((i * Math.PI) / 6) * 55} ${-Math.cos((i * Math.PI) / 6) * 55}`} stroke="#333" strokeWidth={3} />)}
      <path d={`M0 0 L${Math.sin(frame / 400) * 44} ${-Math.cos(frame / 400) * 44} M0 0 L24 12`} stroke="#181818" strokeWidth={6} strokeLinecap="round" />
    </g>
    {/* drinks fridge with the glass lit */}
    <g transform={`translate(2600 ${FLOOR})`}>
      <rect x={-124} y={-640} width={248} height={640} rx={8} fill="#c9333a" />
      <rect x={-106} y={-600} width={212} height={500} fill="#dbeef2" />
      {[0, 1, 2, 3].map((r) => arr(6).map((i) => (random(`fr${r}${i}`) < stock + 0.1 ? <rect key={`${r}${i}`} x={-98 + i * 34} y={-590 + r * 124} width={26} height={96} rx={8} fill={GOODS[(r * 3 + i) % GOODS.length]} /> : null)))}
      {[0, 1, 2].map((r) => <rect key={r} x={-106} y={-480 + r * 124} width={212} height={6} fill="#8f9ea3" />)}
      <text x={0} y={-612} textAnchor="middle" fontFamily={ANTON} fontSize={26} fill="#fff">GELADO</text>
    </g>
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="url(#wWall)" opacity={0.3} />
  </g>
);
const RedFloor: React.FC = () => (
  <g>
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="#8f4a38" />
    {arr(80).map((i) => <path key={i} d={`M${-500 + i * 76} ${FLOOR} L${960 + (-500 + i * 76 - 960) * 1.9} ${FLOOR + 300}`} stroke="#000" strokeOpacity={0.15} strokeWidth={3} />)}
    {[14, 36, 70, 120, 190].map((d) => <rect key={d} x={-500} y={FLOOR + d} width={5600} height={3} fill="#000" opacity={0.16} />)}
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="url(#wFloor)" opacity={0.5} />
    <rect x={-500} y={FLOOR - 10} width={5600} height={10} fill="#3a2118" opacity={0.7} />
  </g>
);
const mercadoProps = (stock: number): React.FC => () => (
  <g>
    <Crate x={200} c="#d97f2e" stock={stock} seed="ca" />
    <Crate x={400} c="#7fae56" stock={stock} seed="cb" />
    <Crate x={600} c="#c4492f" stock={stock} seed="cc" />
    <g transform={`translate(850 ${FLOOR})`}>
      <Sh x={0} y={4} rx={74} />
      {arr(4).map((i) => <rect key={i} x={-62} y={-36 - i * 36} width={124} height={34} rx={7} fill={stock > 0.5 || i === 0 ? '#e9e0c2' : 'none'} stroke={stock > 0.5 || i === 0 ? '#bdb189' : 'none'} strokeWidth={2} />)}
      {stock > 0.5 && <text x={0} y={-114} textAnchor="middle" fontFamily={ANTON} fontSize={22} fill="#7b4230">ARROZ 5 KG</text>}
    </g>
  </g>
);
// The counter, with the scale, the sweet jar and the register.
const MercadoCounter: React.FC = () => (
  <g>
    <Sh x={1560} rx={460} ry={14} />
    <rect x={1140} y={660} width={840} height={FLOOR - 660} fill="#7f5a3c" />
    {arr(21).map((i) => <rect key={i} x={1140 + i * 40} y={664} width={36} height={FLOOR - 672} fill={i % 2 ? '#000' : '#fff'} opacity={0.05} />)}
    <rect x={1124} y={640} width={872} height={24} rx={4} fill="#e4d9bd" />
    <rect x={1124} y={660} width={872} height={8} fill="#000" opacity={0.2} />
    <g transform="translate(1240 640)">
      <rect x={-46} y={-30} width={92} height={30} rx={4} fill="#c9cfcf" />
      <path d="M-58 -44 Q 0 -60 58 -44 L 50 -30 H -50 Z" fill="#9aa2a2" />
    </g>
    <g transform="translate(1420 640)">
      <path d="M-30 0 V -66 Q 0 -86 30 -66 V 0 Z" fill="#dfe8e6" opacity={0.55} />
      {arr(9).map((i) => <circle key={i} cx={-16 + (i % 3) * 16} cy={-14 - Math.floor(i / 3) * 16} r={7} fill={GOODS[i % GOODS.length]} />)}
    </g>
    <g transform="translate(1810 640)">
      <rect x={-72} y={-74} width={144} height={74} rx={5} fill="#3b3d40" />
      <rect x={-54} y={-64} width={108} height={26} fill="#a9c7b0" />
      {arr(8).map((i) => <rect key={i} x={-54 + (i % 4) * 28} y={-32 + Math.floor(i / 4) * 14} width={20} height={9} fill="#c9c4b4" />)}
    </g>
  </g>
);

// ---------- Sala do Caio ----------
const salaWall = (night: boolean): React.FC<{frame: number}> => ({frame}) => (
  <g>
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill={night ? '#3d4a58' : '#c98f60'} />
    <rect x={-400} y={740} width={4400} height={FLOOR - 740} fill={night ? '#2e3742' : '#a87448'} />
    <rect x={-400} y={730} width={4400} height={10} fill={night ? '#20262e' : '#7a5232'} />
    {/* window over the sofa */}
    <g>
      <rect x={140} y={120} width={560} height={410} fill="#e6dec9" />
      <rect x={154} y={134} width={532} height={382} fill={night ? '#0f1c2e' : '#a8d3e8'} />
      {arr(7).map((i) => {
        const h = 130 + random(`jw${i}`) * 170;
        return (
          <g key={i}>
            <rect x={160 + i * 76} y={516 - h} width={68} height={h} fill={night ? '#1a2636' : '#8ea3ad'} />
            {arr(10).map((j) => <rect key={j} x={168 + i * 76 + (j % 3) * 19} y={516 - h + 12 + Math.floor(j / 3) * 28} width={11} height={15} fill={night ? (random(`jl${i}${j}`) > 0.45 ? '#e8c47a' : '#27364a') : '#5d7380'} opacity={0.85} />)}
          </g>
        );
      })}
      <path d="M420 134 V516" stroke="#e6dec9" strokeWidth={10} />
      <path d="M126 112 H714" stroke="#5a3f2a" strokeWidth={9} />
      <path d="M140 118 q 34 210 -6 430 h 74 q -28 -210 8 -430 Z" fill="#7b2f3a" />
      <path d="M700 118 q -34 210 6 430 h -74 q 28 -210 -8 -430 Z" fill="#7b2f3a" />
    </g>
    {/* framed photos */}
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${830 + i * 130} ${170 + (i % 2) * 22}) rotate(${(i - 1) * 2})`}>
        <rect x={4} y={6} width={104} height={128} fill="#000" opacity={0.25} />
        <rect width={104} height={128} fill="#4a3324" />
        <rect x={8} y={8} width={88} height={112} fill={['#7d9aa5', '#c2a273', '#8f7f9a'][i]} />
        <circle cx={52} cy={56} r={21} fill="#14131a" />
        <rect x={32} y={80} width={40} height={40} fill="#14131a" />
      </g>
    ))}
    {/* shelf with the router */}
    <rect x={1240} y={430} width={420} height={12} fill="#5a4230" />
    <g transform="translate(1330 430)">
      <rect x={-48} y={-30} width={96} height={30} rx={5} fill="#23252b" />
      <path d="M-38 -30 L-48 -74 M38 -30 L48 -74" stroke="#23252b" strokeWidth={7} strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={-27 + i * 18} cy={-14} r={4} fill={i === 3 ? '#d34a3a' : frame % 40 < 20 ? '#e7a93b' : '#7a5a26'} />)}
    </g>
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1450 + i * 24} y={430 - 60 - (i % 2) * 14} width={20} height={60 + (i % 2) * 14} fill={GOODS[(i + 2) % GOODS.length]} />)}
    {/* helmet on its hook */}
    <circle cx={1790} cy={410} r={46} fill="#c4492f" />
    <path d="M1762 412 h 56 v 26 h -56 Z" fill="#20252b" />
    <path d="M1790 340 v 24" stroke="#333" strokeWidth={4} />
    {/* door */}
    <g>
      <rect x={2080} y={250} width={300} height={FLOOR - 250} fill="#6b4b34" />
      <rect x={2106} y={280} width={248} height={240} fill="#5a3f2a" />
      <rect x={2106} y={550} width={248} height={290} fill="#5a3f2a" />
      <circle cx={2342} cy={570} r={13} fill="#d9b23a" />
    </g>
    <rect x={1990} y={560} width={34} height={52} rx={4} fill="#efe8d4" />
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="url(#wWall)" opacity={0.3} />
  </g>
);
const WoodFloor: React.FC = () => (
  <g>
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="#6a4a30" />
    {arr(80).map((i) => <path key={i} d={`M${-500 + i * 76} ${FLOOR} L${960 + (-500 + i * 76 - 960) * 1.9} ${FLOOR + 300}`} stroke="#000" strokeOpacity={0.2} strokeWidth={3} />)}
    <ellipse cx={980} cy={FLOOR + 90} rx={520} ry={62} fill="#8a3b34" opacity={0.85} />
    <ellipse cx={980} cy={FLOOR + 90} rx={470} ry={48} fill="#c79a4f" opacity={0.5} />
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="url(#wFloor)" opacity={0.55} />
    <rect x={-500} y={FLOOR - 10} width={5600} height={10} fill="#241810" opacity={0.7} />
  </g>
);
const SalaProps: React.FC = () => (
  <g>
    {/* sofa */}
    <g transform={`translate(420 ${FLOOR})`}>
      <Sh x={0} y={4} rx={300} />
      <rect x={-270} y={-230} width={540} height={150} rx={22} fill="#3f6b70" />
      <rect x={-290} y={-112} width={580} height={92} rx={18} fill="#35595e" />
      <rect x={-300} y={-170} width={60} height={150} rx={18} fill="#2c4b4f" />
      <rect x={240} y={-170} width={60} height={150} rx={18} fill="#2c4b4f" />
      <rect x={-258} y={-22} width={22} height={22} fill="#241810" />
      <rect x={236} y={-22} width={22} height={22} fill="#241810" />
      <rect x={-200} y={-190} width={90} height={80} rx={14} fill="#d9b23a" transform="rotate(-8 -155 -150)" />
    </g>
    {/* TV stand and TV */}
    <g transform={`translate(1090 ${FLOOR})`}>
      <Sh x={0} y={4} rx={200} />
      <rect x={-190} y={-124} width={380} height={112} fill="#5a4230" />
      <rect x={-176} y={-112} width={166} height={88} fill="#4a3324" />
      <rect x={10} y={-112} width={166} height={88} fill="#4a3324" />
      <rect x={-150} y={-334} width={300} height={186} rx={6} fill="#14151a" />
      <rect x={-136} y={-322} width={272} height={160} fill="#232833" />
      <path d="M-120 -310 L-50 -190" stroke="#fff" strokeOpacity={0.05} strokeWidth={30} />
      <rect x={-24} y={-148} width={48} height={24} fill="#14151a" />
    </g>
    {/* plant */}
    <g transform={`translate(800 ${FLOOR})`}>
      <Sh x={0} y={4} rx={60} />
      {arr(7).map((i) => <path key={i} d={`M0 -70 Q ${(i - 3) * 30} -170 ${(i - 3) * 48} ${-160 - (i % 2) * 34}`} stroke="#3f7a4f" strokeWidth={15} fill="none" strokeLinecap="round" />)}
      <path d="M-44 -74 H 44 L 34 0 H -34 Z" fill="#a8603d" />
    </g>
    {/* bookshelf */}
    <g transform={`translate(1720 ${FLOOR})`}>
      <Sh x={0} y={4} rx={130} />
      <rect x={-120} y={-440} width={240} height={440} fill="#5a4230" />
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x={-106} y={-424 + r * 106} width={212} height={92} fill="#33261b" />
          {arr(9).map((i) => (random(`bk${r}${i}`) > 0.2 ? <rect key={i} x={-102 + i * 23} y={-424 + r * 106 + 92 - 58 - random(`bh${r}${i}`) * 26} width={19} height={58 + random(`bh${r}${i}`) * 26} fill={GOODS[(r + i * 2) % GOODS.length]} /> : null))}
        </g>
      ))}
    </g>
  </g>
);

// ---------- Rua ----------
const Wires: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x - 11} y={-140} width={22} height={FLOOR + 140} fill="#7f7a70" />
    <rect x={x - 80} y={-80} width={160} height={12} fill="#6a665e" />
    <rect x={x - 26} y={120} width={52} height={58} rx={4} fill="#4d4b46" />
    {/* the Brazilian tangle */}
    {arr(10).map((i) => <path key={i} d={`M${x - 90} ${-70 + i * 7} Q ${x - 420} ${10 + i * 15} ${x - 800} ${-76 + i * 9}`} stroke="#14141a" strokeWidth={3} fill="none" />)}
    {arr(10).map((i) => <path key={i} d={`M${x + 90} ${-70 + i * 7} Q ${x + 420} ${6 + i * 16} ${x + 800} ${-76 + i * 9}`} stroke="#14141a" strokeWidth={3} fill="none" />)}
    {arr(5).map((i) => <circle key={i} cx={x + (i - 2) * 22} cy={150 + (i % 2) * 22} r={18 + i * 2} fill="none" stroke="#14141a" strokeWidth={3} />)}
  </g>
);
const Loja: React.FC<{x: number; w: number; wall: string; awn: string; name: string; seed: string; night: boolean; closed?: boolean; size?: number}> = ({x, w, wall, awn, name, seed, night, closed, size = 50}) => (
  <g>
    <rect x={x} y={-300} width={w} height={FLOOR + 300} fill={wall} />
    {arr(3).map((i) => {
      const bx = x + 30 + i * ((w - 40) / 3);
      const bw = (w - 40) / 3 - 30;
      const lit = night && random(`${seed}lit${i}`) > 0.4;
      return (
        <g key={i}>
          <rect x={bx} y={-70} width={bw} height={170} fill={lit ? '#e8c47a' : night ? '#1c2733' : '#465a63'} />
          <rect x={bx} y={-70} width={bw} height={38} fill="#fff" opacity={night ? 0.03 : 0.25} />
          <path d={`M${bx + bw / 2} -70 V100`} stroke="#e6dec9" strokeWidth={4} opacity={0.7} />
          <rect x={bx - 8} y={100} width={bw + 16} height={8} fill="#e6dec9" opacity={0.7} />
        </g>
      );
    })}
    <rect x={x + 8} y={158} width={w - 16} height={82} rx={4} fill="#1f2a2a" />
    <text x={x + w / 2} y={218} textAnchor="middle" fontFamily={ANTON} fontSize={size} letterSpacing={3} fill={night ? '#f4dca0' : '#f4e7c2'}>{name}</text>
    {closed ? (
      <g>
        <rect x={x + 22} y={282} width={w - 44} height={598} fill="#6d7276" />
        {arr(26).map((i) => <rect key={i} x={x + 22} y={282 + i * 23} width={w - 44} height={3} fill="#000" opacity={0.24} />)}
      </g>
    ) : (
      <g>
        <rect x={x + 22} y={282} width={w * 0.58} height={500} fill={night ? '#e7c98b' : '#b9d3dc'} />
        <rect x={x + 22} y={282} width={w * 0.58} height={500} fill="#39484e" opacity={night ? 0.05 : 0.22} />
        {arr(5).map((i) => <rect key={i} x={x + 40 + i * ((w * 0.58 - 20) / 5)} y={740 - random(`${seed}${i}`) * 70} width={((w * 0.58 - 20) / 5) * 0.72} height={42 + random(`${seed}${i}`) * 70} rx={4} fill={GOODS[(i * 3 + seed.length) % GOODS.length]} />)}
        <rect x={x + 22} y={782} width={w * 0.58} height={98} fill="#2a2f2e" />
        <rect x={x + w * 0.66} y={330} width={w * 0.27} height={550} fill="#2c3a3c" />
        <rect x={x + w * 0.69} y={358} width={w * 0.21} height={180} fill={night ? '#e7c98b' : '#b9d3dc'} opacity={0.75} />
        <circle cx={x + w * 0.7} cy={640} r={8} fill="#c9a24a" />
      </g>
    )}
    <path d={`M${x + 6} 244 H${x + w - 6} L${x + w + 14} 320 H${x - 14} Z`} fill={awn} />
    {arr(Math.floor(w / 58)).map((i) => <path key={i} d={`M${x + 6 + i * 58} 244 h 29 l 2 76 h -30 Z`} fill="#fff" opacity={0.25} />)}
  </g>
);
const ruaWall = (night: boolean, closed: boolean): React.FC<{frame: number}> => ({frame}) => (
  <g>
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill={night ? '#101b2b' : '#a9d3e6'} />
    {!night && [0, 1, 2].map((i) => <ellipse key={i} cx={((i * 900 + frame * 0.4) % 3600) - 200} cy={-120 + i * 30} rx={220} ry={40} fill="#f2f5f2" opacity={0.75} filter="url(#wSoftS)" />)}
    <Loja x={-300} w={600} wall="#d09a5e" awn="#2f7a6a" name="PADARIA PÃO QUENTE" seed="ra" night={night} closed={closed} size={46} />
    <Loja x={300} w={560} wall="#7fa58f" awn="#c4492f" name="FARMÁCIA" seed="rb" night={night} />
    <Loja x={860} w={640} wall="#d5c59a" awn="#245f57" name="MERCADINHO DA NEIDE" seed="rc" night={night} size={46} />
    <Loja x={1500} w={620} wall="#8798ab" awn="#3b4d63" name="BANCO" seed="rd" night={night} closed={closed} />
    <Loja x={2120} w={560} wall="#b9607b" awn="#d9b23a" name="CONSERTO DE CELULAR" seed="re" night={night} closed={closed} size={42} />
    <Loja x={2680} w={700} wall="#c78d4f" awn="#7b2f3a" name="BAR DO ZECA" seed="rf" night={night} />
    {night && <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="#0a1426" opacity={0.42} />}
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="url(#wWall)" opacity={0.2} />
  </g>
);
const Calcada: React.FC = () => (
  <g>
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="#b8b3a6" />
    {/* wavy black-and-white pavement */}
    {arr(46).map((i) => <path key={i} d={`M${-500 + i * 130} ${FLOOR + 20} q 65 34 130 0 t 130 0 v 20 q -65 34 -130 0 t -130 0 Z`} fill="#26262a" opacity={0.75} />)}
    <rect x={-500} y={FLOOR + 96} width={5600} height={14} fill="#d8d3c5" />
    <rect x={-500} y={FLOOR + 110} width={5600} height={200} fill="#43454a" />
    {arr(30).map((i) => <rect key={i} x={-500 + i * 220} y={FLOOR + 158} width={120} height={8} fill="#e0c24a" opacity={0.75} />)}
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="url(#wFloor)" opacity={0.45} />
  </g>
);
const RuaProps: React.FC = () => (
  <g>
    <Wires x={560} />
    <Wires x={2240} />
    {/* orelhao */}
    <g transform={`translate(1460 ${FLOOR})`}>
      <Sh x={0} y={4} rx={70} />
      <rect x={-9} y={-250} width={18} height={250} fill="#6a665e" />
      <path d="M-74 -250 Q -92 -380 0 -388 Q 92 -380 74 -250 Q 0 -222 -74 -250 Z" fill="#3a7fb5" />
      <path d="M-54 -262 Q -66 -360 0 -366 Q 66 -360 54 -262 Q 0 -244 -54 -262 Z" fill="#2c6494" />
      <rect x={-22} y={-340} width={44} height={70} rx={4} fill="#2a2a2f" />
      <rect x={-14} y={-332} width={28} height={20} fill="#9fb8a4" />
    </g>
    {/* tree */}
    <g transform={`translate(1000 ${FLOOR})`}>
      <ellipse cx={0} cy={3} rx={70} ry={10} fill="#000" opacity={0.4} filter="url(#wSoftS)" />
      <path d="M-20 0 Q -8 -160 -30 -320 H 34 Q 14 -160 26 0 Z" fill="#5a4230" />
    </g>
    {/* newsstand */}
    <g transform={`translate(2680 ${FLOOR})`}>
      <Sh x={0} y={4} rx={150} />
      <rect x={-140} y={-300} width={280} height={300} fill="#2f7a6a" />
      <rect x={-160} y={-320} width={320} height={30} fill="#245f57" />
      <text x={0} y={-262} textAnchor="middle" fontFamily={ANTON} fontSize={30} fill="#f4e7c2">BANCA</text>
      {arr(12).map((i) => <rect key={i} x={-126 + (i % 6) * 42} y={-232 + Math.floor(i / 6) * 74} width={36} height={60} fill={GOODS[i % GOODS.length]} />)}
    </g>
  </g>
);

// ---------- Hospital ----------
const hospitalWall: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="#c8d9cf" />
    <rect x={-400} y={600} width={4400} height={FLOOR - 600} fill="#8fb3a3" />
    <rect x={-400} y={592} width={4400} height={8} fill="#6d8f80" />
    <rect x={560} y={40} width={700} height={72} rx={6} fill="#245f57" />
    <text x={910} y={94} textAnchor="middle" fontFamily={ANTON} fontSize={50} letterSpacing={5} fill="#f4f1e4">ENFERMARIA</text>
    {/* curtains */}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${-60 + i * 480} 0)`}>
        <path d="M0 120 H 300" stroke="#8f9ea3" strokeWidth={7} />
        {arr(7).map((j) => <path key={j} d={`M${j * 44} 124 q 22 300 0 600 h 40 q -22 -300 0 -600 Z`} fill={j % 2 ? '#a8c4d0' : '#94b3c1'} />)}
      </g>
    ))}
    {/* whiteboard */}
    <g transform="translate(1320 170)">
      <rect x={5} y={7} width={500} height={250} fill="#000" opacity={0.2} />
      <rect width={500} height={250} fill="#f4f6f2" stroke="#8f9ea3" strokeWidth={8} />
      <text x={24} y={52} fontFamily="Inter" fontWeight={800} fontSize={30} fill="#245f57">LEITOS</text>
      {arr(5).map((i) => <rect key={i} x={24} y={76 + i * 32} width={210 + random(`hb${i}`) * 220} height={8} fill="#5d6d76" opacity={0.65} />)}
    </g>
    {/* wall clock */}
    <g transform="translate(2020 230)">
      <circle r={66} fill="#f4f6f2" stroke="#3a4a4a" strokeWidth={9} />
      <path d={`M0 0 L${Math.sin(frame / 200) * 46} ${-Math.cos(frame / 200) * 46} M0 0 L26 -14`} stroke="#181818" strokeWidth={6} strokeLinecap="round" />
    </g>
    {/* shelf of folders behind the desk */}
    <rect x={2160} y={330} width={520} height={12} fill="#8f9ea3" />
    {arr(16).map((i) => <rect key={i} x={2170 + i * 31} y={330 - 90} width={26} height={90} fill={GOODS[i % GOODS.length]} opacity={0.85} />)}
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="url(#wWall)" opacity={0.2} />
  </g>
);
const HospFloor: React.FC = () => (
  <g>
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="#a7b3ad" />
    {arr(70).map((i) => <path key={i} d={`M${-500 + i * 90} ${FLOOR} L${960 + (-500 + i * 90 - 960) * 1.9} ${FLOOR + 300}`} stroke="#000" strokeOpacity={0.1} strokeWidth={3} />)}
    {[16, 44, 90, 160].map((d) => <rect key={d} x={-500} y={FLOOR + d} width={5600} height={3} fill="#000" opacity={0.08} />)}
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="url(#wFloor)" opacity={0.4} />
  </g>
);
const HospProps: React.FC = () => (
  <g>
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${120 + i * 480} ${FLOOR})`}>
        <Sh x={0} y={4} rx={210} />
        <rect x={-200} y={-190} width={400} height={60} rx={10} fill="#eef1ea" />
        <rect x={-210} y={-132} width={420} height={14} fill="#8f9ea3" />
        <rect x={-188} y={-120} width={12} height={120} fill="#8f9ea3" />
        <rect x={176} y={-120} width={12} height={120} fill="#8f9ea3" />
        <rect x={-214} y={-270} width={16} height={150} fill="#8f9ea3" />
        <rect x={-190} y={-226} width={90} height={40} rx={12} fill="#fff" />
        <rect x={-70} y={-200} width={260} height={52} rx={10} fill="#7aa3b2" />
      </g>
    ))}
    <g transform={`translate(1130 ${FLOOR})`}>
      <Sh x={0} y={4} rx={46} />
      <rect x={-4} y={-400} width={8} height={400} fill="#8f9ea3" />
      <rect x={-40} y={-400} width={80} height={7} fill="#8f9ea3" />
      <rect x={-34} y={-392} width={36} height={70} rx={8} fill="#dfeef2" />
      <rect x={-34} y={-8} width={68} height={8} fill="#8f9ea3" />
    </g>
  </g>
);
const HospDesk: React.FC = () => (
  <g>
    <Sh x={2080} rx={500} ry={14} />
    <rect x={1620} y={660} width={920} height={FLOOR - 660} fill="#dfe6dc" />
    <rect x={1620} y={660} width={920} height={20} fill="#245f57" />
    <rect x={1604} y={640} width={952} height={22} rx={4} fill="#f4f6f2" />
    <g transform="translate(1800 640)">
      <rect x={-74} y={-126} width={148} height={102} fill="#191c20" />
      <rect x={-64} y={-116} width={128} height={82} fill="#293036" />
      <rect x={-12} y={-24} width={24} height={24} fill="#191c20" />
    </g>
    <g transform="translate(2320 640)">
      {arr(7).map((i) => <rect key={i} x={-60 + (i % 2) * 4} y={-12 - i * 11} width={120} height={10} fill={i % 2 ? '#efe9d6' : '#e4dcc2'} />)}
    </g>
  </g>
);

// ---------- Praca ----------
const pracaWall = (dusk: boolean): React.FC<{frame: number}> => ({frame}) => (
  <g>
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill={dusk ? '#d99668' : '#a9d3e6'} />
    {dusk && <rect x={-400} y={-300} width={4400} height={500} fill="#7e5a78" opacity={0.65} />}
    {[0, 1, 2].map((i) => <ellipse key={i} cx={((i * 1100 + frame * 0.3) % 3600) - 200} cy={-70 + i * 40} rx={260} ry={42} fill={dusk ? '#f1c8a0' : '#f2f5f2'} opacity={0.65} filter="url(#wSoftS)" />)}
    {/* low buildings */}
    {arr(16).map((i) => {
      const h = 170 + random(`pb${i}`) * 200;
      return <rect key={i} x={-400 + i * 290} y={700 - h} width={270} height={h + 40} fill={dusk ? '#5d4a50' : GOODS[(i * 5) % GOODS.length]} opacity={dusk ? 1 : 0.42} />;
    })}
    {/* church in the distance */}
    <g transform="translate(1500 700)" fill={dusk ? '#6f5356' : '#d8d2c0'}>
      <rect x={-260} y={-260} width={520} height={330} />
      <rect x={-340} y={-470} width={120} height={540} />
      <rect x={220} y={-470} width={120} height={540} />
      <path d="M-340 -470 L-280 -560 L-220 -470 Z M220 -470 L280 -560 L340 -470 Z" />
      <path d="M-260 -260 L0 -380 L260 -260 Z" />
      <circle cx={0} cy={-180} r={46} fill={dusk ? '#463338' : '#8f8a7a'} />
    </g>
    {/* garden hedge */}
    <rect x={-400} y={680} width={4400} height={FLOOR - 680} fill={dusk ? '#40503c' : '#5e8f66'} />
    {arr(70).map((i) => <circle key={i} cx={-400 + i * 64} cy={686 - (i % 3) * 8} r={36} fill={dusk ? '#40503c' : '#5e8f66'} />)}
    <rect x={-400} y={-300} width={4400} height={FLOOR + 300} fill="url(#wWall)" opacity={0.15} />
  </g>
);
const Lajota: React.FC = () => (
  <g>
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="#b39f7f" />
    {arr(80).map((i) => <path key={i} d={`M${-500 + i * 76} ${FLOOR} L${960 + (-500 + i * 76 - 960) * 1.8} ${FLOOR + 300}`} stroke="#000" strokeOpacity={0.12} strokeWidth={3} />)}
    {[18, 50, 100, 170].map((d) => <rect key={d} x={-500} y={FLOOR + d} width={5600} height={3} fill="#000" opacity={0.12} />)}
    <rect x={-500} y={FLOOR} width={5600} height={300} fill="url(#wFloor)" opacity={0.4} />
  </g>
);
const PracaProps: React.FC = () => (
  <g>
    {[150, 1950].map((x, k) => (
      <g key={x} transform={`translate(${x} ${FLOOR})`}>
        <ellipse cx={0} cy={3} rx={84} ry={11} fill="#000" opacity={0.4} filter="url(#wSoftS)" />
        <path d="M-24 0 Q -8 -200 -34 -400 H 38 Q 14 -200 30 0 Z" fill="#5a4230" />
        {arr(18).map((i) => <circle key={i} cx={(random(`ptr${k}${i}`) - 0.5) * 420} cy={-420 - random(`pts${k}${i}`) * 230} r={74 + random(`ptt${k}${i}`) * 40} fill={i % 2 ? '#3f7a4f' : '#4f8f5e'} />)}
      </g>
    ))}
    {[560, 2500].map((x) => (
      <g key={x} transform={`translate(${x} ${FLOOR})`}>
        <Sh x={0} y={4} rx={130} ry={9} />
        <rect x={-118} y={-110} width={236} height={13} rx={3} fill="#7c5a3f" />
        <rect x={-118} y={-88} width={236} height={13} rx={3} fill="#7c5a3f" />
        <rect x={-122} y={-58} width={244} height={14} rx={3} fill="#8f6b4c" />
        {[-100, 100].map((a) => <rect key={a} x={a - 6} y={-110} width={12} height={110} fill="#2d2d30" />)}
      </g>
    ))}
    {/* lamp post */}
    {[900, 2240].map((x) => (
      <g key={x} transform={`translate(${x} ${FLOOR})`}>
        <Sh x={0} y={4} rx={40} ry={7} />
        <rect x={-7} y={-470} width={14} height={470} fill="#2d3530" />
        <circle cx={0} cy={-500} r={34} fill="#f3ecc8" stroke="#2d3530" strokeWidth={6} />
      </g>
    ))}
  </g>
);

// ---------- Cidade ----------
const cidadeWall = (night: boolean): React.FC<{frame: number}> => ({frame}) => (
  <g>
    <rect x={-800} y={-400} width={5200} height={1700} fill={night ? '#0c1626' : '#b5d7e6'} />
    {night && arr(70).map((i) => <circle key={i} cx={-400 + random(`stx${i}`) * 4400} cy={-300 + random(`sty${i}`) * 560} r={1.6 + random(`str${i}`) * 2} fill="#e7e9f2" opacity={0.65} />)}
    {!night && [0, 1, 2, 3].map((i) => <ellipse key={i} cx={((i * 900 + frame * 0.6) % 3600) - 200} cy={-180 + i * 60} rx={260} ry={44} fill="#f6f7f4" opacity={0.75} filter="url(#wSoftS)" />)}
    {[0, 1].map((layer) => arr(26).map((i) => {
      const h = (layer ? 300 : 460) + random(`cb${layer}${i}`) * (layer ? 360 : 460);
      const x = -600 + i * 190 + layer * 90;
      const col = night ? (layer ? '#18222f' : '#101925') : layer ? '#7f919b' : '#a9b6bb';
      const windows = arr(Math.min(64, Math.floor(h / 22))).map((j) => {
        const on = random(`cw${layer}${i}${j}`) > (night ? 0.62 : 0.5);
        return <rect key={j} x={x + 12 + (j % 5) * 30} y={1000 - h + 14 + Math.floor(j / 5) * 46} width={18} height={26} fill={night ? (on ? '#e8c47a' : '#222d3b') : on ? '#d3e4ea' : '#5d7380'} opacity={0.85} />;
      });
      return (
        <g key={`${layer}${i}`}>
          <rect x={x} y={1000 - h} width={176} height={h + 200} fill={col} />
          {windows}
        </g>
      );
    }))}
  </g>
);
const CidadeGround: React.FC = () => <rect x={-800} y={980} width={5200} height={400} fill="#1a1d22" />;

const grade = (edge: string, glow: number, glowColor: string, filter?: string) => ({edge, glow, glowColor, filter});

export const SETS_BR: Record<string, FilmSet> = {
  mercado: {floor: FLOOR, par: 0.86, rim: '#ffe0a8', light: [1450, 150], wall: mercadoWall(1), ground: RedFloor, props: mercadoProps(1), front: MercadoCounter, grade: grade('#a89070', 0.3, '#ffe2b0', 'saturate(0.9)')},
  mercadoVazio: {floor: FLOOR, par: 0.86, rim: '#e8c592', light: [1450, 150], wall: mercadoWall(0.28), ground: RedFloor, props: mercadoProps(0.28), front: MercadoCounter, grade: grade('#7d6a58', 0.14, '#ffd9a0', 'saturate(0.62) brightness(0.86)')},
  sala: {floor: FLOOR, par: 0.84, rim: '#ffdba0', light: [420, 200], wall: salaWall(false), ground: WoodFloor, props: SalaProps, grade: grade('#927a60', 0.28, '#ffe0b0', 'saturate(0.88)')},
  salaNoite: {floor: FLOOR, par: 0.84, rim: '#9bd1fd', light: [1100, 420], wall: salaWall(true), ground: WoodFloor, props: SalaProps, grade: grade('#2c3852', 0.14, '#9fc4ff', 'saturate(0.7) brightness(0.72)')},
  rua: {floor: FLOOR, par: 0.8, rim: '#f7f2de', light: [1500, -300], wall: ruaWall(false, false), ground: Calcada, props: RuaProps, grade: grade('#b7b2a8', 0.24, '#fff2d4', 'saturate(0.88)')},
  ruaFechada: {floor: FLOOR, par: 0.8, rim: '#efe6cc', light: [2300, -200], wall: ruaWall(false, true), ground: Calcada, props: RuaProps, grade: grade('#9a8f80', 0.14, '#ffe0b8', 'saturate(0.66) brightness(0.92)')},
  ruaNoite: {floor: FLOOR, par: 0.8, rim: '#9bd1fd', light: [1200, 240], wall: ruaWall(true, false), ground: Calcada, props: RuaProps, grade: grade('#273250', 0.2, '#ffcf8a', 'saturate(0.74) brightness(0.72)')},
  hospital: {floor: FLOOR, par: 0.86, rim: '#eef6f2', light: [1300, 100], wall: hospitalWall, ground: HospFloor, props: HospProps, front: HospDesk, grade: grade('#8ca39a', 0.2, '#f5fff6', 'saturate(0.84)')},
  praca: {floor: FLOOR, par: 0.72, rim: '#fbf4da', light: [1100, -300], wall: pracaWall(false), ground: Lajota, props: PracaProps, grade: grade('#aeb09c', 0.22, '#fff4d0', 'saturate(0.9)')},
  pracaTarde: {floor: FLOOR, par: 0.72, rim: '#ffb678', light: [2100, 200], wall: pracaWall(true), ground: Lajota, props: PracaProps, grade: grade('#7c5a4a', 0.32, '#ffb778', 'saturate(0.86)')},
  cidade: {floor: 1000, par: 0.55, rim: '#f7f2de', light: [1500, -300], wall: cidadeWall(false), ground: CidadeGround, grade: grade('#a7b3ba', 0.18, '#fff2d4', 'saturate(0.8)')},
  cidadeNoite: {floor: 1000, par: 0.55, rim: '#9bd1fd', light: [1200, 200], wall: cidadeWall(true), ground: CidadeGround, grade: grade('#1a2338', 0.2, '#ffcf8a', 'saturate(0.8)')},
};
