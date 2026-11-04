import React from 'react';
import {random} from 'remotion';

// Sets drawn like a lit room rather than flat color: gradient walls, panel and plank texture, dark corners where
// surfaces meet, shadows under furniture. Colors stay muted; the shot's light and grade do the rest (see Special.tsx).
export const FLOOR = 880;
const TEAL = '#35605f';
const TEAL_D = '#25474a';
const BURG = '#5e2531';
const BURG_D = '#431a24';
const BRASS = '#b58f43';
const CREAM = '#d8d0ba';
const WOOD = '#57402f';

export const SetDefs: React.FC = () => (
  <defs>
    <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <filter id="softShadowSmall" x="-60%" y="-120%" width="220%" height="340%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <filter id="propShadow" x="-30%" y="-30%" width="170%" height="170%">
      <feDropShadow dx="10" dy="16" stdDeviation="13" floodColor="#000" floodOpacity="0.5" />
    </filter>
    <linearGradient id="shadeFromRight" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0.25" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.42" />
    </linearGradient>
    <linearGradient id="shadeFromLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0.25" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.42" />
    </linearGradient>
    <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity="0.34" />
      <stop offset="0.3" stopColor="#000" stopOpacity="0.04" />
      <stop offset="1" stopColor="#000" stopOpacity="0.28" />
    </linearGradient>
    <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity="0.34" />
      <stop offset="0.35" stopColor="#000" stopOpacity="0.04" />
      <stop offset="1" stopColor="#000" stopOpacity="0.2" />
    </linearGradient>
    <linearGradient id="woodFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0.07" />
      <stop offset="1" stopColor="#000" stopOpacity="0.42" />
    </linearGradient>
    <radialGradient id="deskGlow" cx="0.5" cy="0.45" r="0.62">
      <stop offset="0" stopColor="#ffd59a" stopOpacity="0.3" />
      <stop offset="1" stopColor="#000" stopOpacity="0.45" />
    </radialGradient>
    <linearGradient id="dawnsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#4a5873" />
      <stop offset="0.7" stopColor="#c99a7c" />
      <stop offset="1" stopColor="#e6bb8f" />
    </linearGradient>
  </defs>
);

const Sh: React.FC<{x: number; y: number; rx: number; ry?: number; o?: number}> = ({x, y, rx, ry = 16, o = 0.5}) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#000" opacity={o} filter="url(#softShadowSmall)" />;

const Win: React.FC<{x: number; y: number; w: number; h: number; sky: string; lights?: boolean; rain?: boolean; seed?: string; curtain?: string}> = ({x, y, w, h, sky, lights, rain, seed = 'w', curtain}) => (
  <g>
    <rect x={x - 12} y={y + 10} width={w + 24} height={h + 22} fill="#000" opacity={0.3} filter="url(#softShadowSmall)" />
    <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} fill={CREAM} />
    <rect x={x} y={y} width={w} height={h} fill={sky} />
    {lights &&
      Array.from({length: 7}).map((_, i) => {
        const bw = w / 7;
        const bh = h * (0.3 + random(`${seed}h${i}`) * 0.45);
        return (
          <g key={i}>
            <rect x={x + i * bw} y={y + h - bh} width={bw - 3} height={bh} fill="#10202a" />
            {Array.from({length: 5}).map((__, j) =>
              random(`${seed}${i}${j}`) > 0.5 ? <rect key={j} x={x + i * bw + 6} y={y + h - bh + 10 + j * 18} width={9} height={11} fill="#e6bd6a" /> : null,
            )}
          </g>
        );
      })}
    {rain &&
      Array.from({length: 26}).map((_, i) => {
        const rx = x + random(`r${seed}${i}`) * w;
        const ry = y + random(`q${seed}${i}`) * (h - 30);
        return <path key={i} d={`M${rx} ${ry} l -5 22`} stroke="#9fc3cf" strokeWidth={2} opacity={0.4} />;
      })}
    <path d={`M${x + w / 2} ${y} V ${y + h}`} stroke={CREAM} strokeWidth={7} />
    <rect x={x - 24} y={y + h + 8} width={w + 48} height={16} fill={CREAM} />
    {curtain && (
      <>
        <path d={`M${x - 44} ${y - 30} h 70 q 10 ${h * 0.5} -18 ${h + 60} h -56 Z`} fill={curtain} />
        <path d={`M${x + w + 44} ${y - 30} h -70 q -10 ${h * 0.5} 18 ${h + 60} h 56 Z`} fill={curtain} />
        {[0, 1].map((i) => (
          <path key={i} d={`M${x - 22 + i * 18} ${y - 26} q 8 ${h * 0.5} -8 ${h + 50}`} stroke="#000" strokeOpacity={0.16} strokeWidth={5} fill="none" />
        ))}
      </>
    )}
  </g>
);

const Door: React.FC<{x: number; n?: string; color?: string}> = ({x, n, color = BURG}) => (
  <g>
    <rect x={x - 12} y={498} width={204} height={FLOOR - 498} fill={CREAM} opacity={0.85} />
    <rect x={x} y={510} width={180} height={FLOOR - 510} fill={color} />
    <rect x={x} y={510} width={180} height={FLOOR - 510} fill="url(#woodFace)" />
    <rect x={x + 24} y={540} width={132} height={120} fill="none" stroke="#00000033" strokeWidth={5} />
    <rect x={x + 24} y={690} width={132} height={160} fill="none" stroke="#00000033" strokeWidth={5} />
    <circle cx={x + 158} cy={700} r={9} fill={BRASS} />
    {n && (
      <text x={x + 90} y={482} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={28} fill={BRASS}>
        {n}
      </text>
    )}
  </g>
);

const Lamp: React.FC<{x: number; y?: number}> = ({x, y = 180}) => (
  <g>
    <path d={`M${x} 0 V ${y}`} stroke="#141414" strokeWidth={4} />
    <path d={`M${x - 74} ${y + 58} L ${x - 30} ${y} H ${x + 30} L ${x + 74} ${y + 58} Z`} fill="#6b5a2f" />
    <ellipse cx={x} cy={y + 58} rx={74} ry={9} fill="#ffe2a8" />
  </g>
);

const Floor: React.FC<{color: string; planks?: boolean; tile?: boolean}> = ({color, planks, tile}) => (
  <g>
    <rect y={FLOOR} width={1920} height={200} fill={color} />
    {planks && Array.from({length: 23}).map((_, i) => <path key={i} d={`M${i * 90 - 30} ${FLOOR} L ${(i - 11) * 190 + 960} 1080`} stroke="#000" strokeOpacity={0.24} strokeWidth={3} />)}
    {tile && (
      <>
        {Array.from({length: 17}).map((_, i) => (
          <path key={i} d={`M${i * 124 - 30} ${FLOOR} L ${(i - 8) * 250 + 960} 1080`} stroke="#fff" strokeOpacity={0.09} strokeWidth={3} />
        ))}
        {[906, 942, 992, 1052].map((y) => (
          <path key={y} d={`M0 ${y} H 1920`} stroke="#fff" strokeOpacity={0.09} strokeWidth={3} />
        ))}
      </>
    )}
    <rect y={FLOOR} width={1920} height={200} fill="url(#floorShade)" />
    <rect y={FLOOR - 16} width={1920} height={14} fill="#1a1512" opacity={0.75} />
  </g>
);

const Wall: React.FC<{color: string; trim?: string; panels?: boolean; stripes?: boolean}> = ({color, trim = TEAL_D, panels = true, stripes}) => (
  <g>
    <rect width={1920} height={FLOOR} fill={color} />
    {stripes && Array.from({length: 40}).map((_, i) => <rect key={i} x={i * 96} width={48} height={650} fill="#fff" opacity={0.022} />)}
    <rect y={640} width={1920} height={FLOOR - 640} fill={trim} />
    {panels && Array.from({length: 12}).map((_, i) => <rect key={i} x={20 + i * 162} y={668} width={136} height={186} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={4} />)}
    <rect y={630} width={1920} height={12} fill={CREAM} opacity={0.55} />
    <rect y={40} width={1920} height={14} fill={CREAM} opacity={0.3} />
    <rect width={1920} height={FLOOR} fill="url(#wallShade)" />
  </g>
);

const Rack: React.FC = () => (
  <g>
    <rect x={726} y={214} width={480} height={280} fill="#000" opacity={0.35} filter="url(#softShadowSmall)" />
    <rect x={720} y={200} width={480} height={280} fill={WOOD} />
    <rect x={720} y={200} width={480} height={280} fill="url(#woodFace)" />
    {Array.from({length: 40}).map((_, i) => (
      <g key={i}>
        <circle cx={752 + (i % 10) * 46} cy={236 + Math.floor(i / 10) * 66} r={5} fill={BRASS} />
        <rect x={749 + (i % 10) * 46} y={240 + Math.floor(i / 10) * 66} width={6} height={22} fill={BRASS} opacity={0.8} />
      </g>
    ))}
  </g>
);

// Dark shapes right in front of the lens, heavily blurred, for depth.
const Blob: React.FC<{d: string; color?: string}> = ({d, color = '#0b0f10'}) => <path d={d} fill={color} />;

export const SETS: Record<string, {Back: React.FC; Front?: React.FC; Fore?: React.FC; strip?: 'tile' | 'wood' | 'none'; light: [number, number]; lightColor: string}> = {
  lobby: {
    light: [960, 240],
    lightColor: '#ffd08a',
    strip: 'wood',
    Back: () => (
      <g>
        <Wall color={TEAL} stripes />
        <Rack />
        <Win x={110} y={190} w={420} h={400} sky="#0f2030" lights rain seed="lob" curtain="#6e2c38" />
        <circle cx={1450} cy={280} r={70} fill={CREAM} stroke={BRASS} strokeWidth={10} />
        <path d="M1450 280 V 236 M1450 280 L 1482 296" stroke="#222" strokeWidth={7} strokeLinecap="round" />
        <Sh x={1720} y={886} rx={120} />
        <rect x={1660} y={720} width={130} height={165} fill={BURG_D} />
        <path d="M1725 720 q -80 -130 -14 -220 q 56 96 14 220" fill="#2f5f49" />
        <path d="M1725 720 q 60 -90 40 -170 q -56 60 -40 170" fill="#274f3e" />
        <Lamp x={960} y={70} />
        <Floor color="#6a4f3e" tile />
        <rect x={150} y={906} width={480} height={50} rx={6} fill={BURG} opacity={0.85} />
      </g>
    ),
    Front: () => (
      <g>
        <rect x={650} y={690} width={640} height={390} fill={BURG} />
        <rect x={650} y={690} width={640} height={390} fill="url(#woodFace)" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={676 + i * 150} y={730} width={136} height={320} fill="none" stroke="#000" strokeOpacity={0.24} strokeWidth={5} />
        ))}
        <rect x={634} y={672} width={672} height={26} fill={WOOD} />
        <rect x={650} y={698} width={640} height={8} fill={BRASS} />
        <path d="M1180 672 a 26 26 0 0 1 52 0 Z" fill={BRASS} />
        <circle cx={1206} cy={644} r={6} fill={BRASS} />
      </g>
    ),
    Fore: () => <Blob d="M1760 0 H 1920 V 1080 H 1700 Q 1800 600 1760 0 Z" />,
  },
  office: {
    light: [1530, 330],
    lightColor: '#d8e3ea',
    strip: 'wood',
    Back: () => (
      <g>
        <Wall color={BURG} trim={BURG_D} stripes />
        <rect x={190} y={190} width={240} height={170} fill={CREAM} stroke={BRASS} strokeWidth={10} />
        <path d="M230 240 H 390 M230 275 H 360 M230 310 H 390" stroke="#776" strokeWidth={6} />
        <Win x={1320} y={170} w={420} h={400} sky="#9db0b8" curtain="#3a1a22" />
        <Door x={120} color={WOOD} />
        <Floor color="#5f4635" planks />
        <Sh x={1110} y={892} rx={380} ry={20} />
        <rect x={780} y={704} width={660} height={180} fill={WOOD} />
        <rect x={780} y={704} width={660} height={180} fill="url(#woodFace)" />
        <rect x={760} y={686} width={700} height={22} fill="#3d291c" />
        <rect x={1270} y={636} width={70} height={52} fill={BRASS} />
      </g>
    ),
    Fore: () => <Blob d="M0 1080 V 700 Q 180 660 270 800 L 330 1080 Z" />,
  },
  staff: {
    light: [1210, 230],
    lightColor: '#ffcf85',
    strip: 'wood',
    Back: () => (
      <g>
        <Wall color="#435250" trim="#2d3b3a" />
        <Sh x={390} y={890} rx={280} ry={16} />
        <rect x={150} y={720} width={480} height={100} fill="#6d7a72" />
        <rect x={150} y={690} width={140} height={44} rx={10} fill={CREAM} />
        <rect x={150} y={816} width={20} height={70} fill={WOOD} />
        <rect x={610} y={816} width={20} height={70} fill={WOOD} />
        <Sh x={1220} y={890} rx={240} ry={15} />
        <rect x={1020} y={720} width={400} height={18} fill={WOOD} />
        <rect x={1040} y={738} width={16} height={146} fill={WOOD} />
        <rect x={1384} y={738} width={16} height={146} fill={WOOD} />
        <rect x={1150} y={688} width={38} height={32} fill={CREAM} />
        <rect x={1236} y={688} width={38} height={32} fill={CREAM} />
        <path d="M1169 680 q -12 -24 4 -44 M1255 680 q 12 -24 -4 -44" stroke="#fff" strokeOpacity={0.3} strokeWidth={4} fill="none" />
        <Lamp x={1210} y={150} />
        <rect x={640} y={190} width={180} height={140} fill="#0e1a26" stroke={CREAM} strokeWidth={8} />
        <text x={1700} y={300} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={56} fill={BRASS} opacity={0.75}>
          009
        </text>
        <Floor color="#5c4434" planks />
      </g>
    ),
    Fore: () => <Blob d="M1920 0 V 1080 H 1730 Q 1800 520 1730 0 Z" />,
  },
  basement: {
    light: [1350, 450],
    lightColor: '#ffb07a',
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#28343a" />
        <rect width={1920} height={FLOOR} fill="url(#wallShade)" />
        {[120, 190, 262].map((y, i) => (
          <g key={y}>
            <rect y={y + 16} width={1920} height={10} fill="#000" opacity={0.3} filter="url(#softShadowSmall)" />
            <rect y={y} width={1920} height={i === 1 ? 26 : 16} fill={i === 1 ? '#6d4a2c' : '#3a4a4c'} />
          </g>
        ))}
        <rect x={1160} y={380} width={380} height={330} rx={8} fill="#39464a" />
        <rect x={1200} y={420} width={300} height={70} fill="#10181a" />
        <circle cx={1440} cy={455} r={18} fill="#e03a30" />
        {[0, 1, 2].map((i) => <rect key={i} x={1200 + i * 104} y={530} width={84} height={130} fill="#2b3538" />)}
        <Floor color="#191f21" />
      </g>
    ),
    Fore: () => <Blob d="M0 0 H 1920 V 90 Q 960 150 0 90 Z" />,
  },
  corridor: {
    light: [1020, 360],
    lightColor: '#ffc880',
    Back: () => (
      <g>
        <Wall color="#3c5a5c" panels={false} stripes />
        {[110, 660, 1210, 1650].map((x, i) => (
          <Door key={x} x={x} n={`${312 + i}`} />
        ))}
        {[470, 1020, 1520].map((x) => (
          <rect key={x} x={x} y={340} width={36} height={70} rx={8} fill={BRASS} />
        ))}
        <Floor color="#74303f" />
      </g>
    ),
    Fore: () => <Blob d="M0 0 H 120 Q 190 540 120 1080 H 0 Z" />,
  },
  stairs: {
    light: [1495, 140],
    lightColor: '#b9e6c8',
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR + 20} fill="#2f3f45" />
        {Array.from({length: 11}).map((_, i) => (
          <g key={i}>
            <rect x={i * 170} y={900 - i * 56} width={1920} height={56 + i * 56} fill={i % 2 ? '#3a4b50' : '#43555a'} />
            <rect x={i * 170} y={900 - i * 56} width={1920} height={6} fill="#fff" opacity={0.08} />
          </g>
        ))}
        <path d="M0 800 L 1870 180" stroke={BRASS} strokeWidth={9} />
        <rect x={1420} y={110} width={150} height={60} fill="#2fa86a" />
        <text x={1495} y={154} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={34} fill="#fff">
          EXIT
        </text>
      </g>
    ),
    Fore: () => <Blob d="M0 1080 V 720 L 620 1080 Z" />,
  },
  laundry: {
    light: [1030, 690],
    lightColor: '#ff7a33',
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#26373b" />
        <rect width={1920} height={FLOOR} fill="url(#wallShade)" />
        {[160, 520, 880, 1240, 1600].map((x, i) => (
          <g key={x}>
            <Sh x={x + 150} y={886} rx={170} ry={14} />
            <rect x={x} y={480} width={300} height={400} rx={8} fill="#7d8688" />
            <rect x={x} y={480} width={300} height={400} rx={8} fill="url(#woodFace)" />
            <circle cx={x + 150} cy={700} r={105} fill="#20282a" stroke="#b0b6b4" strokeWidth={10} />
            {i === 2 && <circle cx={x + 150} cy={700} r={90} fill="#ec6a2d" />}
            <rect x={x + 30} y={510} width={100} height={22} fill="#20282a" />
          </g>
        ))}
        <Floor color="#171c1e" tile />
      </g>
    ),
    Fore: () => <Blob d="M1500 1080 Q 1600 860 1920 880 V 1080 Z" />,
  },
  diner: {
    light: [960, 330],
    lightColor: '#dfe9ee',
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="#8c8173" />
        <rect width={1920} height={FLOOR} fill="url(#wallShade)" />
        <Win x={480} y={140} w={960} h={370} sky="#9fb3bb" />
        <rect x={250} y={520} width={210} height={365} rx={24} fill="#8e3b45" />
        <rect x={1460} y={520} width={210} height={365} rx={24} fill="#8e3b45" />
        <Sh x={960} y={892} rx={450} ry={18} />
        <rect x={560} y={680} width={800} height={24} fill={CREAM} />
        <rect x={930} y={704} width={60} height={180} fill="#444" />
        <rect x={700} y={630} width={44} height={50} fill="#ddd" />
        <rect x={1180} y={630} width={44} height={50} fill="#ddd" />
        <Floor color="#524c43" tile />
      </g>
    ),
    Fore: () => <Blob d="M0 1080 V 660 Q 130 620 210 760 L 240 1080 Z" color="#3c1b22" />,
  },
  party: {
    light: [960, 90],
    lightColor: '#fff0cf',
    Back: () => (
      <g>
        <Wall color="#7c8886" trim="#5d6b6a" />
        <rect x={520} y={100} width={880} height={110} fill={CREAM} />
        <text x={960} y={176} textAnchor="middle" fontFamily="Anton" fontSize={70} letterSpacing={6} fill={BURG}>
          HAPPY BIRTHDAY, STAFF!
        </text>
        <Sh x={960} y={892} rx={320} ry={16} />
        <rect x={700} y={680} width={520} height={205} fill={WOOD} />
        <rect x={700} y={680} width={520} height={205} fill="url(#woodFace)" />
        <rect x={680} y={662} width={560} height={22} fill="#3d291c" />
        <rect x={880} y={600} width={160} height={62} rx={6} fill="#f1e6cf" />
        <rect x={956} y={566} width={8} height={36} fill="#c84" />
        <Floor color="#3c4242" tile />
      </g>
    ),
    Fore: () => <Blob d="M1600 1080 Q 1640 760 1780 740 Q 1920 730 1920 860 V 1080 Z" />,
  },
  lawn: {
    light: [1460, 780],
    lightColor: '#ffbb7a',
    Back: () => (
      <g>
        <rect width={1920} height={FLOOR} fill="url(#dawnsky)" />
        <rect x={480} y={160} width={960} height={700} fill="#28252a" />
        {Array.from({length: 40}).map((_, i) => (
          <rect key={i} x={520 + (i % 8) * 112} y={200 + Math.floor(i / 8) * 124} width={70} height={82} fill={i % 5 === 2 ? '#f06a2a' : '#121116'} />
        ))}
        <rect x={840} y={760} width={240} height={100} fill="#121116" />
        <text x={960} y={148} textAnchor="middle" fontFamily="Anton" fontSize={58} letterSpacing={8} fill={BRASS}>
          HOTEL LARKSPUR
        </text>
        <rect y={860} width={1920} height={220} fill="#3f6147" />
        <rect y={860} width={1920} height={220} fill="url(#floorShade)" />
      </g>
    ),
    Fore: () => <Blob d="M0 1080 V 960 Q 480 900 960 980 T 1920 950 V 1080 Z" color="#1b2c1e" />,
  },
  hospital: {
    light: [1470, 340],
    lightColor: '#ffe4b5',
    Back: () => (
      <g>
        <Wall color="#cfc8b0" trim="#b3bca9" panels={false} />
        <Win x={1240} y={140} w={460} h={410} sky="#f6dca6" curtain="#a8a48c" />
        <Sh x={620} y={892} rx={400} ry={15} />
        <rect x={260} y={680} width={720} height={70} rx={14} fill="#eee8d6" />
        <rect x={260} y={640} width={150} height={60} rx={20} fill="#fff" />
        <rect x={290} y={750} width={20} height={134} fill="#888" />
        <rect x={930} y={750} width={20} height={134} fill="#888" />
        <Floor color="#a39e87" tile />
      </g>
    ),
    Fore: () => <Blob d="M0 0 H 150 Q 110 540 180 1080 H 0 Z" color="#7d7a66" />,
  },
  curb: {
    light: [1560, 90],
    lightColor: '#fff0d0',
    Back: () => (
      <g>
        <rect width={1920} height={760} fill="#adc4c8" />
        <rect x={0} y={140} width={1060} height={620} fill="#322a2a" />
        {Array.from({length: 24}).map((_, i) => (
          <rect key={i} x={60 + (i % 6) * 164} y={190 + Math.floor(i / 6) * 138} width={90} height={92} fill="#14110f" />
        ))}
        <rect x={1180} y={560} width={560} height={200} rx={14} fill="#a52f20" />
        <rect x={1180} y={640} width={560} height={16} fill="#eee" />
        <circle cx={1300} cy={770} r={46} fill="#111" />
        <circle cx={1640} cy={770} r={46} fill="#111" />
        <rect y={760} width={1920} height={130} fill="#6b6b66" />
        <Floor color="#86857d" />
      </g>
    ),
    Fore: () => <Blob d="M1760 1080 L 1800 760 L 1860 760 L 1920 1080 Z" color="#b2502a" />,
  },
  kitchen: {
    light: [890, 340],
    lightColor: '#e7ecef',
    Back: () => (
      <g>
        <Wall color="#a39d84" trim="#5f7a64" />
        <Win x={700} y={170} w={380} h={320} sky="#c6d0d4" curtain="#b39a4a" />
        <rect x={1240} y={420} width={200} height={460} fill="#cfcdbf" />
        <rect x={180} y={320} width={330} height={210} fill="#5f7a64" />
        <Floor color="#55402f" planks />
      </g>
    ),
  },
};

// The strip of counter nearest the camera in a close-up: stays sharp while everything behind it is out of focus.
export const FrontStrip: React.FC<{kind?: string; color?: string}> = ({kind, color = BURG}) => (
  <g>
    <rect y={965} width={1920} height={115} fill={kind === 'wood' ? '#4a3425' : color} />
    {kind === 'wood' && [990, 1012].map((y) => <path key={y} d={`M0 ${y} H 1920`} stroke="#000" strokeOpacity={0.26} strokeWidth={3} />)}
    <rect y={965} width={1920} height={115} fill="url(#woodFace)" />
    <rect y={957} width={1920} height={10} fill={BRASS} />
  </g>
);
