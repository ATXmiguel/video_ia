import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {INK, RED, YELLOW} from '../palette';
import {DISPLAY} from '../ui/fonts';

const SW = 7; // outline width, same as the characters

export const Burger: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={SW / s}>
    <path d="M -60 -5 Q -60 -60 0 -62 Q 60 -60 60 -5 Z" fill="#f2a43a" />
    <rect x={-66} y={-8} width={132} height={14} rx={7} fill="#6bc24a" />
    <rect x={-62} y={6} width={124} height={20} rx={10} fill="#7a3b1f" />
    <path d="M -60 28 L 60 28 Q 58 52 0 54 Q -58 52 -60 28 Z" fill="#f2a43a" />
    {[-30, -8, 18, 36].map((sx, i) => (
      <ellipse key={i} cx={sx} cy={-38 + (i % 2) * 10} rx={5} ry={3} fill="#fff4d6" strokeWidth={0} />
    ))}
  </g>
);

const Logo: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <g>
    <rect x={x - w / 2} y={y - 70} width={w} height={140} rx={40} fill={RED} stroke={INK} strokeWidth={SW} />
    <text x={x} y={y + 30} textAnchor="middle" fontFamily={DISPLAY} fontSize={96} fill={YELLOW} stroke={INK} strokeWidth={6} paintOrder="stroke">
      BIG BUN'S
    </text>
  </g>
);

const Exterior: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <defs>
        <linearGradient id="extSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ab8ff" />
          <stop offset="1" stopColor="#c3e9ff" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#extSky)" />
      <circle cx={880} cy={260} r={90} fill="#ffe66b" stroke={INK} strokeWidth={SW} />
      {[0, 1, 2].map((i) => {
        const cx = ((random(`cl${i}`) * 1200 + frame * (0.6 + i * 0.3)) % 1400) - 160;
        const cy = 180 + i * 130;
        return (
          <g key={i} fill="#fff" stroke={INK} strokeWidth={SW}>
            <path d={`M ${cx - 90} ${cy} a 45 45 0 0 1 60 -40 a 55 55 0 0 1 100 0 a 40 40 0 0 1 30 40 Z`} />
          </g>
        );
      })}
      <rect x={60} y={620} width={960} height={900} fill="#ffcf5a" stroke={INK} strokeWidth={SW} />
      <rect x={60} y={620} width={960} height={60} fill={RED} stroke={INK} strokeWidth={SW} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M ${60 + i * 120} 680 q 60 60 120 0`} fill={i % 2 ? '#fff' : RED} stroke={INK} strokeWidth={5} />
      ))}
      <Burger x={540} y={500} s={1.5} />
      <Logo x={540} y={830} w={620} />
      {[150, 690].map((wx) => (
        <g key={wx}>
          <rect x={wx} y={1000} width={240} height={260} rx={14} fill="#9fdcff" stroke={INK} strokeWidth={SW} />
          <line x1={wx + 40} y1={1030} x2={wx + 100} y2={1090} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
        </g>
      ))}
      <rect x={430} y={1080} width={220} height={440} rx={10} fill="#9fdcff" stroke={INK} strokeWidth={SW} />
      <line x1={540} y1={1080} x2={540} y2={1520} stroke={INK} strokeWidth={SW} />
      <rect x={445} y={1110} width={190} height={50} rx={8} fill="#fff" stroke={INK} strokeWidth={4} />
      <text x={540} y={1148} textAnchor="middle" fontFamily={DISPLAY} fontSize={36} fill={RED}>
        NOW HIRING
      </text>
      <rect x={0} y={1520} width={1080} height={110} fill="#c9ccd6" stroke={INK} strokeWidth={SW} />
      <rect x={0} y={1630} width={1080} height={290} fill="#4b4f60" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={((i * 260 - frame * 2) % 1300) - 100} y={1760} width={150} height={20} rx={10} fill={YELLOW} />
      ))}
    </>
  );
};

const MenuBoard: React.FC<{x: number; items: [string, string][]; color: string}> = ({x, items, color}) => (
  <g>
    <rect x={x} y={250} width={320} height={420} rx={22} fill="#2b2a3a" stroke={INK} strokeWidth={SW} />
    <rect x={x} y={250} width={320} height={70} rx={22} fill={color} stroke={INK} strokeWidth={SW} />
    {items.map(([name, price], i) => (
      <g key={name}>
        <text x={x + 24} y={390 + i * 90} fontFamily={DISPLAY} fontSize={44} fill="#fff">
          {name}
        </text>
        <text x={x + 296} y={390 + i * 90} textAnchor="end" fontFamily={DISPLAY} fontSize={44} fill={YELLOW}>
          {price}
        </text>
      </g>
    ))}
  </g>
);

const CounterBack: React.FC = () => (
  <>
    <rect width={1080} height={1920} fill="#ffe7b8" />
    {new Array(12).fill(0).map((_, i) => (
      <rect key={i} x={i * 90} y={0} width={45} height={1920} fill="#ffdc9c" />
    ))}
    <MenuBoard x={20} color={RED} items={[['BIG BUN', '5.99'], ['DOUBLE', '7.49'], ['KIDS', '3.99']]} />
    <MenuBoard x={380} color="#2fae5f" items={[['FRIES', '2.49'], ['RINGS', '2.99'], ['NUGGS', '4.49']]} />
    <MenuBoard x={740} color="#3f8cff" items={[['SHAKE', '3.99'], ['SODA', '1.99'], ['COFFEE', '1.49']]} />
    <rect x={0} y={760} width={1080} height={26} fill={RED} />
  </>
);

const CounterFront: React.FC = () => (
  <>
    <rect x={-10} y={1290} width={1100} height={56} rx={12} fill="#b7bcc9" stroke={INK} strokeWidth={SW} />
    <rect x={-10} y={1346} width={1100} height={600} fill={RED} stroke={INK} strokeWidth={SW} />
    {new Array(10).fill(0).map((_, i) => (
      <rect key={i} x={i * 120} y={1346} width={60} height={600} fill="#d6362d" />
    ))}
    <rect x={-10} y={1440} width={1100} height={40} fill={YELLOW} stroke={INK} strokeWidth={SW} />
    {[180, 900].map((rx) => (
      <g key={rx} stroke={INK} strokeWidth={SW}>
        <rect x={rx - 70} y={1180} width={140} height={110} rx={12} fill="#3a3d4f" />
        <rect x={rx - 55} y={1195} width={110} height={50} rx={6} fill="#7ef0b0" />
      </g>
    ))}
  </>
);

const Kitchen: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <rect width={1080} height={1920} fill="#cfe0ea" />
      {new Array(14).fill(0).map((_, r) =>
        new Array(9).fill(0).map((_, c) => (
          <rect key={`${r}-${c}`} x={c * 120 + (r % 2) * 60 - 60} y={r * 70} width={118} height={68} fill="#e3eef5" stroke="#b7c9d6" strokeWidth={2} />
        )),
      )}
      <line x1={40} y1={420} x2={1040} y2={420} stroke="#8a93a6" strokeWidth={10} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${110 + i * 200} 420) rotate(${Math.sin(frame * 0.08 + i) * 3})`}>
          <rect x={-60} y={0} width={120} height={150} fill="#fffef6" stroke={INK} strokeWidth={5} />
          {[30, 60, 90, 120].map((ly) => (
            <line key={ly} x1={-40} y1={ly} x2={40 - (ly % 60)} y2={ly} stroke="#9aa" strokeWidth={6} />
          ))}
        </g>
      ))}
      <rect x={60} y={900} width={420} height={420} rx={16} fill="#9ea7b8" stroke={INK} strokeWidth={SW} />
      <rect x={90} y={930} width={360} height={140} rx={10} fill="#e9a23b" stroke={INK} strokeWidth={5} />
      {new Array(8).fill(0).map((_, i) => (
        <circle key={i} cx={120 + random(`b${i}`) * 300} cy={1000 + Math.sin(frame * 0.3 + i) * 25} r={8 + random(`br${i}`) * 8} fill="#ffd36b" stroke={INK} strokeWidth={3} />
      ))}
      <text x={270} y={1240} textAnchor="middle" fontFamily={DISPLAY} fontSize={60} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke">
        FRYER
      </text>
      <rect x={600} y={1000} width={420} height={320} rx={16} fill="#3b3f52" stroke={INK} strokeWidth={SW} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const h = 50 + Math.abs(Math.sin(frame * 0.4 + i * 1.3)) * 50;
        return <path key={i} d={`M ${640 + i * 62} 1000 q 18 ${-h} 36 0 Z`} fill={i % 2 ? '#ff8a3d' : '#ffd84d'} stroke={INK} strokeWidth={4} />;
      })}
      <rect x={0} y={1520} width={1080} height={400} fill="#8a93a6" />
      {new Array(9).fill(0).map((_, i) => (
        <line key={i} x1={i * 130} y1={1520} x2={i * 130 - 120} y2={1920} stroke="#7a8296" strokeWidth={6} />
      ))}
      <line x1={0} y1={1520} x2={1080} y2={1520} stroke={INK} strokeWidth={SW} />
    </>
  );
};

const Dining: React.FC = () => (
  <>
    <rect width={1080} height={1920} fill="#ffd1dc" />
    <rect x={0} y={0} width={1080} height={220} fill="#ff9fb6" />
    {[80, 580].map((wx) => (
      <g key={wx}>
        <rect x={wx} y={320} width={420} height={420} rx={20} fill="#9fdcff" stroke={INK} strokeWidth={SW} />
        <line x1={wx + 210} y1={320} x2={wx + 210} y2={740} stroke={INK} strokeWidth={SW} />
        <line x1={wx + 60} y1={360} x2={wx + 140} y2={440} stroke="#fff" strokeWidth={12} strokeLinecap="round" />
      </g>
    ))}
    <rect x={0} y={1180} width={1080} height={30} fill={RED} />
    {[[-40, 230], [850, 230]].map(([bx, w]) => (
      <g key={bx}>
        <rect x={bx} y={900} width={w} height={500} rx={30} fill="#e8443a" stroke={INK} strokeWidth={SW} />
        <rect x={bx + 20} y={930} width={w - 40} height={440} rx={22} fill="#ff6a5a" stroke={INK} strokeWidth={5} />
      </g>
    ))}
    {new Array(6).fill(0).map((_, r) =>
      new Array(9).fill(0).map((_, c) => (
        <rect key={`${r}-${c}`} x={c * 120} y={1520 + r * 70} width={120} height={70} fill={(r + c) % 2 ? '#fff' : '#2b2a3a'} />
      )),
    )}
    <line x1={0} y1={1520} x2={1080} y2={1520} stroke={INK} strokeWidth={SW} />
  </>
);

// Story 2: Starlite Cinema — a run-down old movie theater.
const Bulbs: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  const frame = useCurrentFrame();
  const pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) pts.push([x + (w * i) / 12, y], [x + (w * i) / 12, y + h]);
  for (let i = 1; i < 4; i++) pts.push([x, y + (h * i) / 4], [x + w, y + (h * i) / 4]);
  return (
    <g>
      {pts.map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r={11} fill={(i + Math.floor(frame / 6)) % 3 ? '#fff3a8' : '#ff9f3d'} stroke={INK} strokeWidth={3} />
      ))}
    </g>
  );
};

const Marquee: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <rect width={1080} height={1920} fill="#1d1640" />
      {new Array(40).fill(0).map((_, i) => (
        <circle key={i} cx={random(`s${i}`) * 1080} cy={random(`t${i}`) * 560} r={3 + random(`u${i}`) * 3} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + i))} />
      ))}
      <rect x={90} y={520} width={900} height={1000} fill="#8e2b3a" stroke={INK} strokeWidth={SW} />
      <rect x={400} y={240} width={280} height={370} rx={20} fill="#c23b4f" stroke={INK} strokeWidth={SW} />
      {'STARLITE'.split('').map((ch, i) => (
        <text key={i} x={540} y={284 + i * 40} textAnchor="middle" fontFamily={DISPLAY} fontSize={40} fill={YELLOW} stroke={INK} strokeWidth={4} paintOrder="stroke">
          {ch}
        </text>
      ))}
      <rect x={60} y={600} width={960} height={300} rx={18} fill="#fffbe9" stroke={INK} strokeWidth={SW} />
      <Bulbs x={60} y={600} w={960} h={300} />
      <text x={540} y={720} textAnchor="middle" fontFamily={DISPLAY} fontSize={78} fill={INK}>
        TONIGHT ONLY
      </text>
      <text x={540} y={830} textAnchor="middle" fontFamily={DISPLAY} fontSize={72} fill={RED}>
        ZOMBIE PROM 3
      </text>
      {[150, 690].map((px) => (
        <g key={px}>
          <rect x={px} y={1000} width={240} height={340} rx={10} fill="#ffd84d" stroke={INK} strokeWidth={SW} />
          <rect x={px + 20} y={1020} width={200} height={300} fill={px < 500 ? '#3fa8ff' : '#2fd27a'} stroke={INK} strokeWidth={4} />
          <circle cx={px + 120} cy={1130} r={50} fill="#fff" stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <rect x={430} y={1060} width={220} height={460} rx={10} fill="#4a1d26" stroke={INK} strokeWidth={SW} />
      <line x1={540} y1={1060} x2={540} y2={1520} stroke={INK} strokeWidth={SW} />
      <rect x={0} y={1520} width={1080} height={110} fill="#c9ccd6" stroke={INK} strokeWidth={SW} />
      <rect x={0} y={1630} width={1080} height={290} fill="#3a2f5c" />
      <rect x={300} y={1520} width={480} height={110} fill={RED} />
    </>
  );
};

const LobbyBack: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <rect width={1080} height={1920} fill="#5a1e3a" />
      {new Array(12).fill(0).map((_, i) => (
        <rect key={i} x={i * 90} y={0} width={45} height={1920} fill="#4e1832" />
      ))}
      <rect x={0} y={170} width={1080} height={90} fill="#2b2a3a" />
      <text x={540} y={238} textAnchor="middle" fontFamily={DISPLAY} fontSize={64} fill={YELLOW}>
        CONCESSIONS
      </text>
      {[60, 760].map((px, i) => (
        <g key={px}>
          <rect x={px} y={330} width={260} height={380} rx={8} fill="#ffd84d" stroke={INK} strokeWidth={SW} />
          <rect x={px + 18} y={348} width={224} height={344} fill={i ? '#9b4fe0' : '#2fae5f'} stroke={INK} strokeWidth={4} />
          <text x={px + 130} y={560} textAnchor="middle" fontFamily={DISPLAY} fontSize={40} fill="#fff" stroke={INK} strokeWidth={4} paintOrder="stroke">
            {i ? 'SPACE' : 'ZOMBIE'}
          </text>
          <text x={px + 130} y={610} textAnchor="middle" fontFamily={DISPLAY} fontSize={40} fill="#fff" stroke={INK} strokeWidth={4} paintOrder="stroke">
            {i ? 'COWS' : 'PROM 3'}
          </text>
        </g>
      ))}
      <rect x={380} y={360} width={320} height={420} rx={14} fill="#e8443a" stroke={INK} strokeWidth={SW} />
      <rect x={405} y={390} width={270} height={300} rx={8} fill="#fff8d8" stroke={INK} strokeWidth={5} />
      {new Array(18).fill(0).map((_, i) => (
        <circle key={i} cx={425 + random(`p${i}`) * 230} cy={680 - random(`q${i}`) * 220 - Math.abs(Math.sin(frame * 0.25 + i)) * 30} r={14} fill="#fffdf2" stroke={INK} strokeWidth={3} />
      ))}
      <text x={540} y={755} textAnchor="middle" fontFamily={DISPLAY} fontSize={46} fill={YELLOW}>
        POPCORN
      </text>
      <rect x={0} y={860} width={1080} height={22} fill={YELLOW} />
    </>
  );
};

const LobbyFront: React.FC = () => (
  <>
    <rect x={-10} y={1290} width={1100} height={56} rx={12} fill="#d9c08a" stroke={INK} strokeWidth={SW} />
    <rect x={-10} y={1346} width={1100} height={600} fill="#2b2a3a" stroke={INK} strokeWidth={SW} />
    {new Array(10).fill(0).map((_, i) => (
      <rect key={i} x={i * 120} y={1346} width={60} height={600} fill="#36344a" />
    ))}
    <rect x={-10} y={1440} width={1100} height={40} fill={RED} stroke={INK} strokeWidth={SW} />
    {[170, 910].map((bx) => (
      <g key={bx} stroke={INK} strokeWidth={5}>
        <path d={`M ${bx - 55} 1170 L ${bx + 55} 1170 L ${bx + 42} 1290 L ${bx - 42} 1290 Z`} fill="#fff" />
        {[-30, 0, 30].map((sx) => (
          <rect key={sx} x={bx + sx - 9} y={1170} width={18} height={120} fill={RED} strokeWidth={0} />
        ))}
        {[-36, -12, 12, 36].map((sx, i) => (
          <circle key={sx} cx={bx + sx} cy={1160 - (i % 2) * 14} r={18} fill="#fffdf2" strokeWidth={3} />
        ))}
      </g>
    ))}
  </>
);

const Auditorium: React.FC<{dark?: boolean}> = ({dark}) => {
  const frame = useCurrentFrame();
  const glow = 0.85 + 0.15 * Math.sin(frame * 0.3);
  return (
    <>
      <rect width={1080} height={1920} fill="#1a1426" />
      <path d="M 0 0 L 150 0 Q 120 600 0 1100 Z" fill="#8e2b3a" stroke={INK} strokeWidth={SW} />
      <path d="M 1080 0 L 930 0 Q 960 600 1080 1100 Z" fill="#8e2b3a" stroke={INK} strokeWidth={SW} />
      <rect x={140} y={200} width={800} height={520} rx={10} fill={dark ? '#08070d' : '#bfe6ff'} opacity={dark ? 1 : glow} stroke={INK} strokeWidth={SW} />
      {!dark && <path d="M 140 720 L 0 1300 L 1080 1300 L 940 720 Z" fill="#bfe6ff" opacity={0.12} />}
      {[0, 1, 2].map((row) =>
        new Array(7).fill(0).map((_, c) => (
          <g key={`${row}-${c}`} stroke={INK} strokeWidth={5}>
            <rect x={c * 160 - 20 + (row % 2) * 40} y={1200 + row * 130} width={140} height={150} rx={24} fill={row % 2 ? '#a8323f' : '#c23b4f'} />
          </g>
        )),
      )}
      <rect x={0} y={1600} width={1080} height={320} fill="#2b2340" />
      <line x1={0} y1={1600} x2={1080} y2={1600} stroke={INK} strokeWidth={SW} />
      {[160, 540, 920].map((lx) => (
        <rect key={lx} x={lx - 30} y={1625} width={60} height={14} rx={7} fill={YELLOW} opacity={0.8} />
      ))}
    </>
  );
};

const Blackout: React.FC = () => <Auditorium dark />;


const HotelBack: React.FC = () => {
  const frame = useCurrentFrame();
  const flick = Math.sin(frame * 0.7) > 0.8 ? 0.55 : 1;
  return (
    <>
      <rect width={1080} height={1920} fill="#1d3a3a" />
      {new Array(9).fill(0).map((_, i) => (
        <rect key={i} x={i * 130} y={0} width={65} height={1920} fill="#183030" />
      ))}
      <rect x={0} y={150} width={1080} height={100} fill="#14202a" stroke={INK} strokeWidth={SW} />
      <text x={540} y={225} textAnchor="middle" fontFamily={DISPLAY} fontSize={68} fill="#c9a227">
        HOTEL HOLLOW
      </text>
      <g opacity={flick}>
        <line x1={540} y1={250} x2={540} y2={360} stroke={INK} strokeWidth={6} />
        <ellipse cx={540} cy={410} rx={150} ry={50} fill="#ffe9a8" stroke={INK} strokeWidth={SW} />
        {[-110, -55, 0, 55, 110].map((cx) => (
          <path key={cx} d={`M ${540 + cx} 450 l 0 40`} stroke="#ffe9a8" strokeWidth={8} strokeLinecap="round" />
        ))}
      </g>
      <rect x={90} y={560} width={900} height={440} rx={10} fill="#3a2a1f" stroke={INK} strokeWidth={SW} />
      {new Array(12).fill(0).map((_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const is13 = i === 7;
        return (
          <g key={i}>
            <rect x={130 + col * 140} y={600 + row * 200} width={100} height={130} rx={8} fill={is13 ? '#e8443a' : '#6b4a2f'} stroke={INK} strokeWidth={5} opacity={is13 ? 0.6 + 0.4 * Math.sin(frame * 0.3) : 1} />
            <text x={180 + col * 140} y={680 + row * 200} textAnchor="middle" fontFamily={DISPLAY} fontSize={44} fill="#fff" stroke={INK} strokeWidth={4} paintOrder="stroke">
              {i + 6}
            </text>
          </g>
        );
      })}
      <rect x={0} y={1346} width={1080} height={574} fill="#2a1c2f" />
    </>
  );
};

const HotelFront: React.FC = () => (
  <>
    <rect x={-10} y={1330} width={1100} height={60} rx={12} fill="#c9a227" stroke={INK} strokeWidth={SW} />
    <rect x={-10} y={1390} width={1100} height={560} fill="#14202a" stroke={INK} strokeWidth={SW} />
    <rect x={60} y={1230} width={110} height={100} rx={12} fill="#e8443a" stroke={INK} strokeWidth={5} />
    <text x={115} y={1295} textAnchor="middle" fontFamily={DISPLAY} fontSize={40} fill="#fff">
      BELL
    </text>
  </>
);

const Hallway: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.25);
  return (
    <>
      <rect width={1080} height={1920} fill="#171a2b" />
      <path d="M 0 0 L 1080 0 L 800 700 L 280 700 Z" fill="#232743" stroke={INK} strokeWidth={SW} />
      <path d="M 0 0 L 280 700 L 280 1100 L 0 1920 Z" fill="#2a2e50" stroke={INK} strokeWidth={SW} />
      <path d="M 1080 0 L 800 700 L 800 1100 L 1080 1920 Z" fill="#2a2e50" stroke={INK} strokeWidth={SW} />
      <path d="M 280 1100 L 800 1100 L 1080 1920 L 0 1920 Z" fill="#7a1f2e" stroke={INK} strokeWidth={SW} />
      <rect x={400} y={700} width={280} height={400} rx={10} fill="#2b1a14" stroke={INK} strokeWidth={SW} />
      <rect x={400} y={700} width={280} height={400} rx={10} fill="#e8443a" opacity={0.15 + 0.25 * glow} />
      <circle cx={540} cy={800} r={42} fill="#c9a227" stroke={INK} strokeWidth={5} />
      <text x={540} y={815} textAnchor="middle" fontFamily={DISPLAY} fontSize={44} fill={INK}>
        13
      </text>
      <rect x={440} y={1070} width={200} height={14} fill="#ffe9a8" opacity={glow} />
      {[120, 960].map((lx, i) => (
        <g key={lx} opacity={Math.sin(frame * 0.5 + i * 2) > -0.6 ? 1 : 0.2}>
          <rect x={lx - 20} y={560} width={40} height={90} rx={12} fill="#ffe9a8" stroke={INK} strokeWidth={5} />
        </g>
      ))}
    </>
  );
};

export const SETS = {
  hotel: {floorY: 1560, Back: HotelBack, Front: HotelFront},
  hallway: {floorY: 1700, Back: Hallway, Front: null},
  marquee: {floorY: 1575, Back: Marquee, Front: null},
  lobby: {floorY: 1560, Back: LobbyBack, Front: LobbyFront},
  auditorium: {floorY: 1700, Back: Auditorium, Front: null},
  blackout: {floorY: 1700, Back: Blackout, Front: null},
  exterior: {floorY: 1575, Back: Exterior, Front: null},
  counter: {floorY: 1560, Back: CounterBack, Front: CounterFront},
  kitchen: {floorY: 1640, Back: Kitchen, Front: null},
  dining: {floorY: 1640, Back: Dining, Front: null},
} as const;
