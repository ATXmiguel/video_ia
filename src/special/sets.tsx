import React from 'react';
import {random} from 'remotion';

// Flat, detailed sets in a dollhouse side view, 1920x1080. Floor line at FLOOR. Palette: deep teal, burgundy, brass.
export const FLOOR = 900;
const TEAL = '#1d4a50';
const TEAL_D = '#143539';
const BURG = '#6b2233';
const BURG_D = '#4c1825';
const BRASS = '#c99a3a';
const CREAM = '#e8dfc6';
const WOOD = '#5a3d2a';

const Win: React.FC<{x: number; y: number; w: number; h: number; sky: string; lights?: boolean; rain?: boolean; seed?: string}> = ({x, y, w, h, sky, lights, rain, seed = 'w'}) => (
  <g>
    <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} fill={BRASS} opacity={0.75} />
    <rect x={x} y={y} width={w} height={h} fill={sky} />
    {lights &&
      Array.from({length: 7}).map((_, i) => {
        const bw = w / 7;
        const bh = h * (0.3 + random(`${seed}h${i}`) * 0.45);
        return (
          <g key={i}>
            <rect x={x + i * bw} y={y + h - bh} width={bw - 3} height={bh} fill="#0d1c26" />
            {Array.from({length: 4}).map((__, j) =>
              random(`${seed}${i}${j}`) > 0.5 ? <rect key={j} x={x + i * bw + 5} y={y + h - bh + 8 + j * 16} width={6} height={8} fill="#e6bd6a" /> : null,
            )}
          </g>
        );
      })}
    {rain &&
      Array.from({length: 18}).map((_, i) => {
        const rx = x + random(`r${seed}${i}`) * w;
        const ry = y + random(`q${seed}${i}`) * (h - 30);
        return <path key={i} d={`M${rx} ${ry} l -5 22`} stroke="#9fc3cf" strokeWidth={2} opacity={0.55} />;
      })}
    <path d={`M${x + w / 2} ${y} V ${y + h}`} stroke={BRASS} strokeWidth={5} opacity={0.75} />
  </g>
);

const Door: React.FC<{x: number; n?: string; color?: string; open?: boolean}> = ({x, n, color = BURG, open}) => (
  <g>
    <rect x={x - 8} y={500} width={196} height={FLOOR - 500} fill={BRASS} opacity={0.65} />
    <rect x={x} y={508} width={180} height={FLOOR - 508} fill={open ? '#0f1216' : color} />
    {!open && (
      <>
        <rect x={x + 24} y={540} width={132} height={120} fill="none" stroke="#00000033" strokeWidth={5} />
        <rect x={x + 24} y={690} width={132} height={160} fill="none" stroke="#00000033" strokeWidth={5} />
        <circle cx={x + 158} cy={700} r={9} fill={BRASS} />
      </>
    )}
    {n && (
      <text x={x + 90} y={486} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={28} fill={BRASS}>
        {n}
      </text>
    )}
  </g>
);

const Lamp: React.FC<{x: number; y?: number}> = ({x, y = 180}) => (
  <g>
    <path d={`M${x} 0 V ${y}`} stroke="#1a1a1a" strokeWidth={4} />
    <path d={`M${x - 70} ${y + 56} L ${x - 30} ${y} H ${x + 30} L ${x + 70} ${y + 56} Z`} fill={BRASS} />
    <path d={`M${x - 70} ${y + 56} L ${x - 260} 900 H ${x + 260} L ${x + 70} ${y + 56} Z`} fill="#ffd98a" opacity={0.08} />
  </g>
);

const Floor: React.FC<{color: string; line?: string}> = ({color, line}) => (
  <g>
    <rect y={FLOOR} width={1920} height={180} fill={color} />
    {line && Array.from({length: 13}).map((_, i) => <path key={i} d={`M${i * 160} ${FLOOR} L ${i * 210 - 300} 1080`} stroke={line} strokeWidth={3} />)}
  </g>
);

const Wall: React.FC<{color: string; trim?: string}> = ({color, trim = TEAL_D}) => (
  <g>
    <rect width={1920} height={FLOOR} fill={color} />
    <rect y={660} width={1920} height={240} fill={trim} />
    <rect y={652} width={1920} height={10} fill={BRASS} opacity={0.7} />
  </g>
);

const Rack: React.FC = () => (
  <g>
    <rect x={720} y={200} width={480} height={280} fill={WOOD} />
    {Array.from({length: 40}).map((_, i) => (
      <g key={i}>
        <circle cx={752 + (i % 10) * 46} cy={236 + Math.floor(i / 10) * 66} r={5} fill={BRASS} />
        <rect x={749 + (i % 10) * 46} y={240 + Math.floor(i / 10) * 66} width={6} height={22} fill={BRASS} opacity={0.8} />
      </g>
    ))}
  </g>
);

export const SETS: Record<string, {Back: React.FC; Front?: React.FC}> = {
  lobby: {
    Back: () => (
      <g>
        <Wall color={TEAL} />
        <Rack />
        <Win x={110} y={210} w={420} h={520} sky="#0c1a27" lights rain seed="lob" />
        <circle cx={1450} cy={280} r={70} fill={CREAM} stroke={BRASS} strokeWidth={10} />
        <path d="M1450 280 V 236 M1450 280 L 1482 296" stroke="#222" strokeWidth={7} strokeLinecap="round" />
        <rect x={1660} y={700} width={130} height={200} fill={BURG_D} />
        <path d="M1725 700 q -70 -130 -10 -210 q 50 90 10 210" fill="#2f6b4f" />
        <Lamp x={960} y={90} />
        <Floor color="#2a1d1a" line="#ffffff0c" />
        <rect x={160} y={916} width={460} height={44} rx={6} fill={BURG} />
      </g>
    ),
    Front: () => (
      <g>
        <rect x={650} y={690} width={640} height={390} fill={BURG} />
        <rect x={634} y={672} width={672} height={26} fill={WOOD} />
        <rect x={650} y={698} width={640} height={8} fill={BRASS} />
        <path d="M1180 672 a 26 26 0 0 1 52 0 Z" fill={BRASS} />
        <circle cx={1206} cy={644} r={6} fill={BRASS} />
      </g>
    ),
  },
  office: {
    Back: () => (
      <g>
        <Wall color={BURG} trim={BURG_D} />
        <rect x={190} y={190} width={240} height={170} fill={CREAM} stroke={BRASS} strokeWidth={10} />
        <path d="M230 240 H 390 M230 275 H 360 M230 310 H 390" stroke="#776" strokeWidth={6} />
        <Win x={1320} y={180} w={420} h={420} sky="#6f7f88" />
        <Door x={120} color={WOOD} />
        <Floor color="#2a1d1a" />
        <rect x={780} y={700} width={660} height={200} fill={WOOD} />
        <rect x={760} y={682} width={700} height={22} fill="#3d291c" />
        <rect x={1270} y={630} width={70} height={52} fill={BRASS} />
      </g>
    ),
  },
  staff: {
    Back: () => (
      <g>
        <Wall color="#2d3e3f" trim="#22302f" />
        <rect x={150} y={720} width={480} height={100} fill="#6d7a72" />
        <rect x={150} y={690} width={140} height={44} rx={10} fill={CREAM} />
        <rect x={150} y={816} width={20} height={84} fill={WOOD} />
        <rect x={610} y={816} width={20} height={84} fill={WOOD} />
        <rect x={1020} y={720} width={400} height={18} fill={WOOD} />
        <rect x={1040} y={738} width={16} height={162} fill={WOOD} />
        <rect x={1384} y={738} width={16} height={162} fill={WOOD} />
        <rect x={1150} y={688} width={38} height={32} fill={CREAM} />
        <rect x={1236} y={688} width={38} height={32} fill={CREAM} />
        <Lamp x={1210} y={150} />
        <rect x={640} y={190} width={180} height={140} fill="#0e1a26" stroke={BRASS} strokeWidth={8} />
        <text x={1700} y={300} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={56} fill={BRASS} opacity={0.75}>
          009
        </text>
        <Floor color="#231a17" />
      </g>
    ),
  },
  basement: {
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#1b2528" />
        {[120, 190, 262].map((y, i) => (
          <rect key={y} y={y} width={1920} height={i === 1 ? 26 : 16} fill={i === 1 ? '#6d4a2c' : '#3a4a4c'} />
        ))}
        <rect x={1160} y={380} width={380} height={330} rx={8} fill="#39464a" />
        <rect x={1200} y={420} width={300} height={70} fill="#10181a" />
        <circle cx={1440} cy={455} r={18} fill="#e03a30" />
        {[0, 1, 2].map((i) => <rect key={i} x={1200 + i * 104} y={530} width={84} height={130} fill="#2b3538" />)}
        <Floor color="#14191b" />
      </g>
    ),
  },
  corridor: {
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#26444a" />
        <rect y={660} width={1920} height={240} fill={TEAL_D} />
        {[110, 660, 1210, 1650].map((x, i) => (
          <Door key={x} x={x} n={`${312 + i}`} />
        ))}
        {[470, 1020, 1520].map((x) => (
          <g key={x}>
            <rect x={x} y={340} width={36} height={70} rx={8} fill={BRASS} />
            <circle cx={x + 18} cy={330} r={55} fill="#ffd98a" opacity={0.14} />
          </g>
        ))}
        <Floor color={BURG_D} />
        <rect y={FLOOR} width={1920} height={14} fill={BRASS} opacity={0.4} />
      </g>
    ),
  },
  stairs: {
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#253338" />
        {Array.from({length: 11}).map((_, i) => (
          <rect key={i} x={i * 170} y={900 - i * 56} width={1920} height={56 + i * 56} fill={i % 2 ? '#2f3f43' : '#35474c'} />
        ))}
        <path d="M0 800 L 1870 180" stroke={BRASS} strokeWidth={9} />
        <rect x={1420} y={110} width={150} height={60} fill="#2fa86a" />
        <text x={1495} y={154} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={34} fill="#fff">
          EXIT
        </text>
      </g>
    ),
  },
  laundry: {
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#1f2d30" />
        {[160, 520, 880, 1240, 1600].map((x, i) => (
          <g key={x}>
            <rect x={x} y={480} width={300} height={420} rx={8} fill="#7d8688" />
            <circle cx={x + 150} cy={700} r={105} fill="#20282a" stroke="#c0c6c4" strokeWidth={10} />
            {i === 2 && <circle cx={x + 150} cy={700} r={90} fill="#e4602a" />}
            <rect x={x + 30} y={510} width={100} height={22} fill="#20282a" />
          </g>
        ))}
        <Floor color="#14191b" />
      </g>
    ),
  },
  diner: {
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#7d7468" />
        <Win x={480} y={150} w={960} h={380} sky="#5c6f78" />
        <rect x={250} y={520} width={210} height={380} rx={24} fill="#8e3b45" />
        <rect x={1460} y={520} width={210} height={380} rx={24} fill="#8e3b45" />
        <rect x={560} y={680} width={800} height={24} fill={CREAM} />
        <rect x={930} y={704} width={60} height={196} fill="#444" />
        <rect x={700} y={630} width={44} height={50} fill="#ddd" />
        <rect x={1180} y={630} width={44} height={50} fill="#ddd" />
        <Floor color="#4f4a42" />
      </g>
    ),
  },
  party: {
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#6e7a79" />
        <rect x={520} y={110} width={880} height={110} fill={CREAM} />
        <text x={960} y={186} textAnchor="middle" fontFamily="Anton" fontSize={70} letterSpacing={6} fill={BURG}>
          HAPPY BIRTHDAY, STAFF!
        </text>
        <rect x={700} y={680} width={520} height={220} fill={WOOD} />
        <rect x={680} y={662} width={560} height={22} fill="#3d291c" />
        <rect x={880} y={600} width={160} height={62} rx={6} fill="#f1e6cf" />
        <rect x={956} y={566} width={8} height={36} fill="#c84" />
        <Floor color="#3c4242" />
      </g>
    ),
  },
  lawn: {
    Back: () => (
      <g>
        <defs>
          <linearGradient id="dawnsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3c4f73" />
            <stop offset="0.7" stopColor="#d89d78" />
            <stop offset="1" stopColor="#f2c48c" />
          </linearGradient>
        </defs>
        <rect width={1920} height={FLOOR} fill="url(#dawnsky)" />
        <rect x={480} y={160} width={960} height={700} fill="#28252a" />
        {Array.from({length: 40}).map((_, i) => (
          <rect key={i} x={520 + (i % 8) * 112} y={200 + Math.floor(i / 8) * 124} width={70} height={82} fill={i % 5 === 2 ? '#f06a2a' : '#121116'} />
        ))}
        <rect x={840} y={760} width={240} height={100} fill="#121116" />
        <text x={960} y={148} textAnchor="middle" fontFamily="Anton" fontSize={58} letterSpacing={8} fill={BRASS}>
          HOTEL LARKSPUR
        </text>
        <rect y={860} width={1920} height={220} fill="#3f6a47" />
        <rect y={860} width={1920} height={14} fill="#587f5a" />
      </g>
    ),
  },
  hospital: {
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#dcd6bf" />
        <rect y={660} width={1920} height={240} fill="#bfc9b6" />
        <Win x={1240} y={150} w={460} h={420} sky="#f4d7a3" />
        <rect x={260} y={680} width={720} height={70} rx={14} fill="#f6f1e0" />
        <rect x={260} y={640} width={150} height={60} rx={20} fill="#fff" />
        <rect x={290} y={750} width={20} height={150} fill="#888" />
        <rect x={930} y={750} width={20} height={150} fill="#888" />
        <Floor color="#a9a48d" />
      </g>
    ),
  },
  curb: {
    Back: () => (
      <g>
        <rect width={1920} height={760} fill="#a9c6cc" />
        <rect x={0} y={140} width={1060} height={620} fill="#322a2a" />
        {Array.from({length: 24}).map((_, i) => (
          <rect key={i} x={60 + (i % 6) * 164} y={190 + Math.floor(i / 6) * 138} width={90} height={92} fill="#14110f" />
        ))}
        <rect x={1180} y={560} width={560} height={200} rx={14} fill="#b0301f" />
        <rect x={1180} y={640} width={560} height={16} fill="#eee" />
        <circle cx={1300} cy={770} r={46} fill="#111" />
        <circle cx={1640} cy={770} r={46} fill="#111" />
        <rect y={760} width={1920} height={140} fill="#6b6b66" />
        <Floor color="#8b8a82" />
      </g>
    ),
  },
  kitchen: {
    Back: () => (
      <g>
        <Wall color="#a8a389" trim="#5f7a64" />
        <Win x={700} y={180} w={380} h={320} sky="#b7c4c9" />
        <rect x={1240} y={420} width={200} height={480} fill="#d7d5c7" />
        <rect x={180} y={320} width={330} height={210} fill="#5f7a64" />
        <Floor color="#5a3d2a" />
      </g>
    ),
  },
};

// Used by close-ups: the blurred background plus a strip of foreground at the bottom.
export const FrontStrip: React.FC<{color?: string}> = ({color = BURG}) => (
  <g>
    <rect y={980} width={1920} height={100} fill={color} />
    <rect y={972} width={1920} height={12} fill={BRASS} opacity={0.8} />
  </g>
);
