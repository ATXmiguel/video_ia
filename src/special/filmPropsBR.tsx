import React from 'react';
import {random} from 'remotion';
import type {PropDef} from './filmProps';

// Props and on-screen data for "E se, de repente, a internet acabasse?". Everything readable here is in Portuguese.
const ANTON = 'Anton';
const INTER = 'Inter';
const HAND = 'Caveat, Inter';
const arr = (n: number) => Array.from({length: n}, (_, i) => i);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const io = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const CREAM = '#f3ead6';
const AMBER = '#ffc857';
const RED = '#e2553f';

const Spinner: React.FC<{f: number; r?: number; c?: string}> = ({f, r = 30, c = '#cfd6da'}) => (
  <g transform={`rotate(${f * 12})`}>
    <circle r={r} fill="none" stroke={c} strokeOpacity={0.2} strokeWidth={r * 0.22} />
    <path d={`M0 ${-r} A ${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke={c} strokeWidth={r * 0.22} strokeLinecap="round" />
  </g>
);

// A phone face up or held to the lens: 300 x 620 around its centre.
const Phone: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const screen = d.text ?? 'erro';
  const line = d.t2 ?? '';
  const t3 = d.t3 ?? '';
  const clip = `ph${Math.round(d.x)}${Math.round(d.y)}${screen}`;
  return (
    <g>
      <rect x={-162} y={-322} width={324} height={644} rx={42} fill="#0d0d12" />
      <rect x={-162} y={-322} width={324} height={644} rx={42} fill="none" stroke="#3a3a44" strokeWidth={4} />
      <clipPath id={clip}>
        <rect x={-146} y={-304} width={292} height={608} rx={28} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x={-146} y={-304} width={292} height={608} fill={screen === 'off' ? '#07080b' : '#10161d'} />
        {screen !== 'off' && (
          <g>
            <text x={-126} y={-272} fontFamily={INTER} fontWeight={800} fontSize={20} fill="#dfe6ea">{d.t4 ?? '9:14'}</text>
            {[0, 1, 2, 3].map((i) => <rect key={i} x={84 + i * 10} y={-280 - i * 3} width={7} height={8 + i * 3} fill="#dfe6ea" />)}
          </g>
        )}
        {screen === 'chat' && (
          <g>
            <rect x={-146} y={-256} width={292} height={62} fill="#1d2a31" />
            <circle cx={-110} cy={-225} r={21} fill="#b9607b" />
            <text x={-78} y={-217} fontFamily={INTER} fontWeight={800} fontSize={26} fill={CREAM}>{line || 'Mãe'}</text>
            <rect x={-130} y={-170} width={186} height={62} rx={14} fill="#25323a" />
            <text x={-116} y={-130} fontFamily={INTER} fontWeight={600} fontSize={21} fill={CREAM}>Bom dia, filho</text>
            <rect x={-70} y={-90} width={204} height={84} rx={14} fill="#1f5c52" />
            <text x={-56} y={-52} fontFamily={INTER} fontWeight={600} fontSize={21} fill={CREAM}>{t3 || 'Chego já, mãe'}</text>
            <path d="M92 -28 l 8 8 l 14 -16" stroke="#b9c6cb" strokeWidth={4} fill="none" strokeLinecap="round" />
            <text x={0} y={70} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={22} fill="#9fb0b6">enviando…</text>
            <g transform="translate(0 130)"><Spinner f={f} r={24} /></g>
          </g>
        )}
        {screen === 'load' && (
          <g>
            <text x={0} y={-140} textAnchor="middle" fontFamily={ANTON} fontSize={44} fill={CREAM}>{line}</text>
            <g><Spinner f={f} r={52} /></g>
            <text x={0} y={120} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={24} fill="#9fb0b6">{t3 || 'Carregando…'}</text>
          </g>
        )}
        {screen === 'erro' && (
          <g>
            <g transform="translate(0 -70)" fill="none" stroke="#5e6b72" strokeWidth={15} strokeLinecap="round">
              <path d="M-78 -18 Q 0 -86 78 -18" />
              <path d="M-48 12 Q 0 -30 48 12" />
              <circle cx={0} cy={44} r={8} fill="#5e6b72" />
              <path d="M-90 62 L 90 -82" stroke={RED} />
            </g>
            <text x={0} y={70} textAnchor="middle" fontFamily={ANTON} fontSize={42} fill={CREAM}>{line || 'SEM CONEXÃO'}</text>
            <text x={0} y={112} textAnchor="middle" fontFamily={INTER} fontWeight={600} fontSize={21} fill="#9fb0b6">{t3 || 'Tente novamente'}</text>
          </g>
        )}
        {screen === 'pix' && (
          <g>
            <text x={0} y={-200} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={25} fill="#9fb0b6">Pagamento via Pix</text>
            <text x={0} y={-120} textAnchor="middle" fontFamily={ANTON} fontSize={66} fill={CREAM}>{line || 'R$ 23,50'}</text>
            {f < (d.n ?? 24) ? (
              <g transform="translate(0 20)"><Spinner f={f} r={44} /></g>
            ) : (
              <g>
                <circle cx={0} cy={10} r={52} fill={RED} />
                <path d="M-22 -12 L 22 32 M22 -12 L-22 32" stroke="#fff" strokeWidth={11} strokeLinecap="round" />
                <text x={0} y={108} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={25} fill={CREAM}>Não foi possível</text>
                <text x={0} y={140} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={25} fill={CREAM}>concluir</text>
              </g>
            )}
          </g>
        )}
        {screen === 'mapa' && (
          <g>
            <rect x={-146} y={-256} width={292} height={560} fill="#d9d5c5" />
            {arr(6).map((i) => <path key={i} d={`M-160 ${-210 + i * 96} L 170 ${-260 + i * 104}`} stroke="#f7f5ec" strokeWidth={15} />)}
            {arr(5).map((i) => <path key={i} d={`M${-130 + i * 72} -270 L${-100 + i * 56} 310`} stroke="#f7f5ec" strokeWidth={12} />)}
            <rect x={-30} y={40} width={110} height={90} fill="#a9c79c" />
            <circle cx={12} cy={-40} r={19} fill={RED} />
            <circle cx={12} cy={-40} r={7} fill="#fff" />
            <rect x={-128} y={210} width={256} height={64} rx={14} fill="#10161d" />
            <text x={0} y={250} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={21} fill={CREAM}>Reconectando…</text>
          </g>
        )}
        {screen === 'call' && (
          <g>
            <rect x={-146} y={-256} width={292} height={560} fill="#39424c" />
            {arr(70).map((i) => <rect key={i} x={-146 + random(`nx${i}${Math.floor(f / 3)}`) * 292} y={-256 + random(`ny${i}${Math.floor(f / 3)}`) * 560} width={22} height={6} fill="#fff" opacity={0.08} />)}
            <path d="M-110 300 V 100 Q 0 30 110 100 V 300 Z" fill="#b9607b" />
            <circle cx={0} cy={-40} r={84} fill="#0c0b12" />
            {arr(9).map((i) => <circle key={i} cx={Math.cos(i * 0.72 + 2.9) * 84} cy={-60 + Math.sin(i * 0.72 + 2.9) * 84} r={26} fill="#0c0b12" />)}
            <circle cx={-26} cy={-44} r={8} fill={CREAM} />
            <circle cx={26} cy={-44} r={8} fill={CREAM} />
            <path d="M-26 -8 Q 0 14 26 -8" stroke={CREAM} strokeWidth={6} fill="none" strokeLinecap="round" />
            <text x={0} y={-200} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={26} fill={CREAM}>{line || 'Lena'}</text>
          </g>
        )}
        {screen === 'home' && (
          <g>
            {arr(20).map((i) => (
              <g key={i} transform={`translate(${-102 + (i % 4) * 68} ${-214 + Math.floor(i / 4) * 86})`}>
                <rect x={-24} y={-24} width={48} height={48} rx={12} fill={['#b9607b', '#2f7a6a', '#d97f2e', '#3b6ea8', '#c4492f', '#7fae56'][(i * 7) % 6]} opacity={f > (d.n ?? 12) + i ? 0.2 : 0.95} />
              </g>
            ))}
          </g>
        )}
        <rect x={-146} y={-304} width={292} height={608} fill="url(#brGlass)" opacity={0.18} />
      </g>
    </g>
  );
};

const Maquininha: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const err = f >= (d.n ?? 20);
  return (
    <g>
      <rect x={-120} y={-220} width={240} height={440} rx={26} fill="#22252b" />
      <rect x={-96} y={-196} width={192} height={150} rx={6} fill={err ? '#3a1f1d' : '#16323a'} />
      <text x={0} y={-132} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={25} fill={err ? '#ff9a85' : '#a4e0d0'}>{err ? 'FALHA NA' : 'AGUARDE…'}</text>
      <text x={0} y={-98} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={25} fill={err ? '#ff9a85' : '#a4e0d0'}>{err ? 'CONEXÃO' : ''}</text>
      {arr(12).map((i) => <rect key={i} x={-88 + (i % 3) * 62} y={-28 + Math.floor(i / 3) * 52} width={52} height={40} rx={7} fill={i === 9 ? '#b23a2c' : i === 11 ? '#2f8a56' : '#3f434b'} />)}
    </g>
  );
};

const Caderno: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const lines = d.lines ?? ['Seu Zeca: R$ 12,50', 'Dona Rita: R$ 7,00', 'Tiago: R$ 31,20', 'Bia: R$ 9,90'];
  return (
    <g>
      <rect x={-268} y={-356} width={536} height={712} rx={10} fill="#27486b" />
      <rect x={-250} y={-342} width={500} height={684} fill="#f4efdc" />
      {arr(16).map((i) => <rect key={i} x={-250} y={-300 + i * 42} width={500} height={2.5} fill="#a9c1d3" />)}
      <rect x={-204} y={-342} width={3} height={684} fill="#d98a7f" />
      <text x={-186} y={-310} fontFamily={HAND} fontWeight={700} fontSize={44} fill="#a52a1e">{d.t2 ?? 'FIADO'}</text>
      {lines.map((l, i) => {
        const shown = clamp01((f - (d.n ?? 0) - i * 14) / 12);
        const n = Math.floor(l.length * shown);
        return <text key={i} x={-186} y={-220 + i * 84} fontFamily={HAND} fontWeight={700} fontSize={50} fill="#1c2a44">{l.slice(0, n)}</text>;
      })}
    </g>
  );
};

// Bank notes: invented design, only a value and a plain wave.
const Nota: React.FC<{v?: string; c?: string}> = ({v = '20', c = '#c98a42'}) => (
  <g>
    <rect x={-190} y={-88} width={380} height={176} rx={6} fill={c} />
    <rect x={-176} y={-74} width={352} height={148} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={4} />
    <path d="M-176 26 q 60 -44 130 -6 t 130 -8 t 90 8 V74 H-176 Z" fill="#000" opacity={0.1} />
    <text x={-132} y={-24} textAnchor="middle" fontFamily={ANTON} fontSize={52} fill="#3c2612">{v}</text>
    <text x={128} y={56} textAnchor="middle" fontFamily={ANTON} fontSize={52} fill="#3c2612">{v}</text>
    <circle r={46} fill="#fff" opacity={0.2} />
    <text x={0} y={14} textAnchor="middle" fontFamily={ANTON} fontSize={32} fill="#3c2612">REAIS</text>
  </g>
);

const Radio: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const on = f >= (d.n ?? 0);
  return (
    <g>
      <path d="M-70 -130 L 66 -222" stroke="#8d8d92" strokeWidth={8} strokeLinecap="round" />
      <rect x={-166} y={-132} width={332} height={208} rx={18} fill="#7b4a30" />
      <rect x={-146} y={-112} width={166} height={168} rx={8} fill="#3a2418" />
      {arr(10).map((i) => <rect key={i} x={-140} y={-104 + i * 16} width={154} height={6} fill="#000" opacity={0.42} />)}
      <rect x={38} y={-112} width={110} height={42} rx={4} fill={on ? '#f3d893' : '#6b6248'} />
      <rect x={90 + Math.sin(f / 18) * 20} y={-108} width={4} height={34} fill="#a52a1e" />
      <circle cx={68} cy={-22} r={22} fill="#2d1a10" />
      <circle cx={122} cy={-22} r={22} fill="#2d1a10" />
      <path d="M68 -22 L68 -40 M122 -22 L132 -36" stroke={CREAM} strokeWidth={5} />
      {on && arr(3).map((i) => {
        const r = ((f * 2.6 + i * 44) % 130) + 12;
        return <path key={i} d={`M${166 + r * 0.4} ${-70 - r} A ${r} ${r} 0 0 1 ${166 + r} ${-70 + r * 0.1}`} fill="none" stroke={AMBER} strokeWidth={6} opacity={clamp01(1 - r / 140)} />;
      })}
    </g>
  );
};

const Moto: React.FC<{f: number; c?: string; bag?: boolean}> = ({f, c = '#c4492f', bag = true}) => (
  <g>
    {[-118, 118].map((x) => (
      <g key={x} transform={`translate(${x} -48)`}>
        <circle r={48} fill="#14141a" />
        <circle r={25} fill="#a9b0ae" />
        <path d="M-25 0 H25 M0 -25 V25" stroke="#14141a" strokeWidth={4} transform={`rotate(${f * 20})`} />
      </g>
    ))}
    <path d="M-118 -48 L -50 -92 L 44 -92 L 118 -48" stroke="#3a3a42" strokeWidth={13} fill="none" />
    <path d="M-68 -116 Q 10 -158 62 -118 L 46 -82 H -46 Z" fill={c} />
    <path d="M58 -112 L 104 -170 M92 -176 h 30" stroke="#2a2a2f" strokeWidth={11} strokeLinecap="round" />
    <circle cx={112} cy={-146} r={17} fill="#f7e7a8" />
    <rect x={-92} y={-132} width={68} height={22} rx={8} fill="#1d1d24" />
    {bag && (
      <g>
        <rect x={-186} y={-232} width={104} height={110} rx={8} fill="#d9b23a" />
        <rect x={-186} y={-232} width={26} height={110} rx={8} fill="#000" opacity={0.15} />
        <path d="M-186 -196 h 104" stroke="#000" strokeOpacity={0.25} strokeWidth={3} />
      </g>
    )}
  </g>
);

const Globe: React.FC<{f: number; off?: number}> = ({f, off}) => {
  const out = off === undefined ? 0 : clamp01((f - off) / 36);
  const dots = arr(70).map((i) => ({x: (random(`gx${i}`) - 0.5) * 2, y: (random(`gy${i}`) - 0.5) * 2}));
  return (
    <g>
      <circle r={440} fill="#14324a" />
      <clipPath id="brGlobe"><circle r={440} /></clipPath>
      <g clipPath="url(#brGlobe)">
        <path d="M-300 -310 Q -130 -340 -90 -230 Q -150 -120 -60 -40 Q -40 40 -80 120 Q -100 260 -170 320 Q -220 240 -200 120 Q -260 20 -320 -60 Q -390 -200 -300 -310 Z" fill="#2a5f58" />
        <path d="M70 -300 Q 220 -360 360 -250 Q 420 -130 300 -80 Q 250 -40 270 40 Q 240 190 150 260 Q 90 120 60 40 Q 30 -80 80 -150 Q 30 -220 70 -300 Z" fill="#2a5f58" />
        {arr(5).map((i) => <ellipse key={i} rx={440} ry={80 + i * 90} fill="none" stroke="#fff" strokeOpacity={0.05} strokeWidth={2} />)}
        {arr(5).map((i) => <ellipse key={`v${i}`} ry={440} rx={80 + i * 90} fill="none" stroke="#fff" strokeOpacity={0.05} strokeWidth={2} />)}
      </g>
      {dots.map((p, i) => {
        const r = Math.hypot(p.x, p.y);
        if (r > 0.96) return null;
        const q = dots[(i * 7 + 3) % dots.length];
        const gone = random(`go${i}`) < out * 1.05;
        return (
          <g key={i}>
            {Math.hypot(q.x, q.y) < 0.96 && <path d={`M${p.x * 440} ${p.y * 440} Q ${(p.x + q.x) * 220} ${(p.y + q.y) * 220 - 90} ${q.x * 440} ${q.y * 440}`} stroke={AMBER} strokeOpacity={gone ? 0.03 : 0.42} strokeWidth={2.4} fill="none" />}
            <circle cx={p.x * 440} cy={p.y * 440} r={gone ? 4 : 7} fill={gone ? '#39464f' : AMBER} />
          </g>
        );
      })}
      <circle r={440} fill="none" stroke="#6fa8c8" strokeOpacity={0.5} strokeWidth={5} />
    </g>
  );
};

// A web of independent networks, used for "no off switch".
const Rede: React.FC<{f: number; off?: number; n?: number}> = ({f, off, n = 46}) => {
  const out = off === undefined ? 0 : clamp01((f - off) / 22);
  const pts = arr(n).map((i) => ({x: (random(`rx${i}`) - 0.5) * 1560, y: (random(`ry${i}`) - 0.5) * 760}));
  return (
    <g>
      {pts.map((p, i) => arr(2).map((k) => {
        const q = pts[(i * (k + 3) + 5) % n];
        const pulse = (f / 28 + i * 0.37 + k) % 1;
        const gone = random(`ro${i}${k}`) < out * 1.05;
        return (
          <g key={`${i}${k}`}>
            <path d={`M${p.x} ${p.y} L${q.x} ${q.y}`} stroke={gone ? '#35414a' : '#6fa8c8'} strokeOpacity={gone ? 0.25 : 0.55} strokeWidth={2.5} strokeDasharray={gone ? '6 12' : undefined} />
            {!gone && <circle cx={p.x + (q.x - p.x) * pulse} cy={p.y + (q.y - p.y) * pulse} r={5} fill={AMBER} />}
          </g>
        );
      }))}
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={11 + (i % 4) * 4} fill={random(`rg${i}`) < out * 1.05 ? '#35414a' : '#dfe8ec'} />)}
    </g>
  );
};

// Words on the dark data scenes: heavy type with a soft glow.
const Big: React.FC<{d: PropDef}> = ({d}) => {
  const sz = d.w ?? 150;
  return (
    <g>
      <text textAnchor="middle" fontFamily={ANTON} fontSize={sz} letterSpacing={3} fill={d.c ?? CREAM} filter="url(#brGlowText)" opacity={0.45}>{d.text}</text>
      <text textAnchor="middle" fontFamily={ANTON} fontSize={sz} letterSpacing={3} fill={d.c ?? CREAM}>{d.text}</text>
      {d.t2 && <text y={Math.max(70, sz * 0.62)} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={Math.max(36, sz * 0.27)} letterSpacing={3} fill="#c4ced3">{d.t2}</text>}
    </g>
  );
};

// A number that ticks up in its dark box, formatted the Brazilian way.
const Counter: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const to = d.h ?? 100;
  const t = io(clamp01(f / (d.n ?? 26)));
  const val = to * t;
  const dec = d.m ?? 0;
  const s = val.toLocaleString('pt-BR', {minimumFractionDigits: dec, maximumFractionDigits: dec});
  const shown = `${d.t3 ?? ''}${s}${d.t4 ?? ''}`;
  const w = d.w ?? 760;
  return (
    <g>
      <rect x={-w / 2} y={-122} width={w} height={d.t2 ? 262 : 196} rx={22} fill="#0a0f14" opacity={0.92} stroke="#c9a56a" strokeWidth={3} />
      <text y={38} textAnchor="middle" fontFamily={ANTON} fontSize={132} fill={d.c ?? AMBER}>{shown}</text>
      {d.t2 && <text y={104} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={34} letterSpacing={2} fill={CREAM}>{d.t2}</text>}
    </g>
  );
};

// Year plate that sits at the top of a past-outage segment.
const Fact: React.FC<{d: PropDef; f: number}> = ({d, f}) => (
  <g opacity={clamp01(f / 4)}>
    <rect x={-210} y={-52} width={420} height={104} rx={14} fill="#0a0f14" opacity={0.9} stroke="#c9a56a" strokeWidth={3} />
    <text y={22} textAnchor="middle" fontFamily={ANTON} fontSize={64} letterSpacing={4} fill={AMBER}>{d.text}</text>
  </g>
);

const Bars: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const a = d.h ?? 314;
  const b = d.m ?? 161;
  const ta = io(clamp01(f / 16));
  const tb = io(clamp01((f - 14) / 16));
  const k = 1.3;
  return (
    <g>
      <rect x={-260} y={-a * k * ta} width={200} height={a * k * ta} fill="#5e6b72" />
      <rect x={60} y={-b * k * tb} width={200} height={b * k * tb} fill={AMBER} />
      <text x={-160} y={-a * k * ta - 22} textAnchor="middle" fontFamily={ANTON} fontSize={62} fill={CREAM}>{Math.round(a * ta)} min</text>
      {tb > 0.02 && <text x={160} y={-b * k * tb - 22} textAnchor="middle" fontFamily={ANTON} fontSize={62} fill={AMBER}>{Math.round(b * tb)} min</text>}
      <text x={-160} y={60} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={34} fill="#c4ced3">{d.t2 ?? 'ANTES'}</text>
      <text x={160} y={60} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={34} fill="#c4ced3">{d.t3 ?? 'BLOQUEADO'}</text>
      <rect x={-300} y={0} width={600} height={6} fill="#c4ced3" />
    </g>
  );
};

const Mural: React.FC<{f: number; n?: number}> = ({f, n}) => {
  const notes = [
    ['PROCURO', 'minha irmã', 'Lena, em Lisboa'], ['VENDO', 'bicicleta', 'falar com Tiago'], ['AULA', 'de violão', 'na garagem'], ['RÁDIO', 'notícias', 'às 18h na praça'], ['TROCO', 'pão por', 'conserto'],
    ['MOTOBOY', 'leva recado', 'R$ 5'], ['VACINA', 'quarta, no', 'posto'], ['ACHEI', 'um cachorro', 'marrom'], ['ÔNIBUS', 'novo horário', '6h e 18h'],
  ];
  const count = n ?? notes.length;
  return (
    <g>
      <rect x={-470} y={-390} width={940} height={590} fill="#6b4b34" />
      <rect x={-446} y={-366} width={892} height={542} fill="#ab865c" />
      {arr(70).map((i) => <circle key={i} cx={(random(`mu${i}`) - 0.5) * 880} cy={-96 + (random(`mv${i}`) - 0.5) * 530} r={2.6} fill="#000" opacity={0.2} />)}
      {notes.slice(0, count).map((t, i) => {
        const shown = clamp01((f - i * 3) / 3);
        return (
          <g key={i} transform={`translate(${-300 + (i % 3) * 300} ${-268 + Math.floor(i / 3) * 170}) rotate(${(random(`mr${i}`) - 0.5) * 7}) scale(${0.5 + shown * 0.5})`} opacity={shown}>
            <rect x={-132} y={-70} width={264} height={150} fill={['#f4efdc', '#f7e36b', '#d6e6df', '#f4d7cf'][i % 4]} />
            <circle cx={0} cy={-58} r={8} fill={RED} />
            <text y={-12} textAnchor="middle" fontFamily={ANTON} fontSize={38} fill="#23262b">{t[0]}</text>
            <text y={24} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={24} fill="#23262b">{t[1]}</text>
            <text y={56} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={24} fill="#23262b">{t[2]}</text>
          </g>
        );
      })}
    </g>
  );
};

const Bilhete: React.FC<{d: PropDef}> = ({d}) => (
  <g>
    <path d="M-170 -130 L 160 -142 L 176 128 L -162 138 Z" fill="#f4efdc" />
    {(d.lines ?? ['Chego às 7.']).map((l, i) => <text key={i} x={-136} y={-62 + i * 60} fontFamily={HAND} fontWeight={700} fontSize={52} fill="#1c2a44">{l}</text>)}
  </g>
);

const Carta: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const lines = d.lines ?? ['Filha,', 'aqui tá todo mundo bem.', 'Me escreve.', 'Sua mãe'];
  return (
    <g>
      <path d="M-360 -470 L 360 -482 L 372 470 L -356 480 Z" fill="#f4efdc" />
      {arr(13).map((i) => <path key={i} d={`M-320 ${-380 + i * 64} L 330 ${-390 + i * 64}`} stroke="#a9c1d3" strokeWidth={2} />)}
      {lines.map((l, i) => {
        const shown = clamp01((f - (d.n ?? 0) - i * 16) / 14);
        return <text key={i} x={-290} y={-300 + i * 110} fontFamily={HAND} fontWeight={700} fontSize={84} fill="#1c2a44">{l.slice(0, Math.floor(l.length * shown))}</text>;
      })}
    </g>
  );
};

const Envelope: React.FC = () => (
  <g>
    <rect x={-240} y={-140} width={480} height={280} fill="#ece5cf" />
    <path d="M-240 -140 L 0 30 L 240 -140" fill="none" stroke="#b5ad97" strokeWidth={6} />
    <rect x={150} y={-122} width={70} height={84} fill="#c4492f" />
    <text x={-210} y={92} fontFamily={HAND} fontWeight={700} fontSize={50} fill="#1c2a44">Lena, Lisboa, Portugal</text>
  </g>
);

const HD: React.FC<{d: PropDef}> = ({d}) => (
  <g>
    <rect x={-120} y={-180} width={240} height={360} rx={18} fill="#2a2c33" />
    <rect x={-120} y={-180} width={46} height={360} rx={18} fill="#000" opacity={0.25} />
    <rect x={-90} y={-60} width={180} height={150} fill="#f4efdc" />
    <text x={0} y={-14} textAnchor="middle" fontFamily={ANTON} fontSize={38} fill="#23262b">{d.text ?? 'HD DA'}</text>
    <text x={0} y={36} textAnchor="middle" fontFamily={ANTON} fontSize={38} fill="#23262b">{d.t2 ?? 'SEMANA'}</text>
    <circle cx={84} cy={150} r={7} fill="#6fd08c" />
  </g>
);

const Cama: React.FC<{f: number}> = ({f}) => {
    const hot = clamp01((f - 8) / 24);
  return (
    <g>
      <rect x={-470} y={-180} width={40} height={180} fill="#4a3324" />
      <rect x={430} y={-110} width={40} height={110} fill="#4a3324" />
      <rect x={-440} y={-100} width={880} height={60} fill="#5a3f2a" />
      <rect x={-440} y={-176} width={880} height={84} rx={14} fill={`rgb(${150 + hot * 75},${160 - hot * 90},${180 - hot * 130})`} />
      <rect x={-420} y={-226} width={210} height={60} rx={20} fill="#efe8d4" />
      <g transform="translate(90 -300)">
        <rect x={-146} y={-62} width={292} height={124} rx={16} fill="#0a0f14" stroke="#c9a56a" strokeWidth={3} />
        <text y={28} textAnchor="middle" fontFamily={ANTON} fontSize={74} fill={hot > 0.6 ? RED : CREAM}>TRAVADA</text>
      </g>
      {arr(5).map((i) => <path key={i} d={`M${-200 + i * 110} -190 q 20 -30 0 -60 q -20 -30 0 -60`} stroke="#ffbe8f" strokeOpacity={hot * 0.45} strokeWidth={7} fill="none" transform={`translate(0 ${-((f * 1.3 + i * 22) % 40)})`} />)}
    </g>
  );
};

const Atm: React.FC<{off?: boolean}> = ({off}) => (
  <g>
    <rect x={-104} y={-400} width={208} height={400} rx={6} fill="#6d7b8a" />
    <rect x={-84} y={-372} width={168} height={110} fill={off ? '#2b1412' : '#1d3a4a'} />
    <text x={0} y={-326} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={21} fill={off ? '#ff9a85' : '#a4e0d0'}>{off ? 'FORA DE' : 'INSIRA O'}</text>
    <text x={0} y={-294} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={21} fill={off ? '#ff9a85' : '#a4e0d0'}>{off ? 'SERVIÇO' : 'CARTÃO'}</text>
    {arr(12).map((i) => <rect key={i} x={-58 + (i % 3) * 42} y={-240 + Math.floor(i / 3) * 34} width={34} height={26} rx={4} fill="#3f434b" />)}
    <rect x={-70} y={-96} width={140} height={14} fill="#1b1d21" />
  </g>
);

const Truck: React.FC<{f: number}> = ({f}) => (
  <g>
    <rect x={-300} y={-280} width={430} height={210} fill="#d8d2c2" />
    <rect x={-300} y={-280} width={430} height={22} fill="#b9b39f" />
    <path d="M140 -240 H 250 L 310 -160 V -70 H 140 Z" fill="#245f57" />
    <path d="M168 -220 H 240 L 284 -160 H 168 Z" fill="#b9d3dc" />
    {[-210, -120, 220].map((x) => (
      <g key={x} transform={`translate(${x} -46)`}>
        <circle r={46} fill="#14141a" />
        <circle r={22} fill="#a9b0ae" />
        <path d="M-22 0 H22 M0 -22 V22" stroke="#14141a" strokeWidth={4} transform={`rotate(${f * 18})`} />
      </g>
    ))}
  </g>
);

const Aviao: React.FC = () => (
  <g fill="#e7ecef">
    <path d="M-340 -20 Q -340 -56 -280 -56 H 280 Q 350 -40 380 0 Q 330 22 280 22 H -280 Q -340 22 -340 -20 Z" />
    <path d="M-40 16 L -180 150 H -120 L 60 16 Z" fill="#bcc6cc" />
    <path d="M-270 -50 L -340 -170 H -296 L -210 -50 Z" fill="#c4492f" />
    {arr(14).map((i) => <rect key={i} x={-230 + i * 34} y={-36} width={18} height={18} rx={4} fill="#34424c" />)}
    <path d="M300 -44 Q 340 -30 362 -6 H 300 Z" fill="#34424c" />
  </g>
);

const Vulcao: React.FC<{f: number}> = ({f}) => {
  const p = clamp01((f - 6) / 24);
  return (
    <g>
      <rect x={-1100} y={0} width={2200} height={560} fill="#163c54" />
      <path d={`M-1100 0 ${arr(24).map((i) => `q 46 ${(i % 2 ? -1 : 1) * 14} 92 0`).join(' ')} V30 H-1100 Z`} fill="#2d6a86" />
      <path d="M-320 0 L -90 -280 H 90 L 320 0 Z" fill="#3e3431" />
      {arr(10).map((i) => <circle key={i} cx={(i - 4.5) * 34 * (0.4 + p)} cy={-290 - p * (80 + i * 34)} r={36 + p * 66 + i * 6} fill={i % 3 ? '#4a4b52' : '#6d6c70'} opacity={p * 0.92} />)}
      {arr(8).map((i) => <circle key={`l${i}`} cx={(i - 3.5) * 28} cy={-300 - p * (20 + i * 30)} r={18} fill="#ff8a3d" opacity={p} />)}
      <path d="M-1000 250 C -600 200 -300 280 -60 240" stroke="#f2c14e" strokeWidth={11} fill="none" />
      <path d="M70 240 C 300 200 600 280 1000 240" stroke="#f2c14e" strokeWidth={11} fill="none" />
      {p <= 0.3 && <path d="M-60 240 L 70 240" stroke="#f2c14e" strokeWidth={11} />}
      {p > 0.3 && <text x={4} y={330} textAnchor="middle" fontFamily={ANTON} fontSize={64} letterSpacing={2} fill={RED}>CABO ROMPIDO</text>}
    </g>
  );
};

const Qmark: React.FC<{f: number}> = ({f}) => (
  <g>
    <circle r={150} fill={AMBER} opacity={0.22 + Math.sin(f / 9) * 0.03} filter="url(#brGlow)" />
    <text y={72} textAnchor="middle" fontFamily={ANTON} fontSize={200} fill={AMBER}>?</text>
  </g>
);

// A clock face whose hand has run, with the chapter name.
const Chapter: React.FC<{d: PropDef; f: number}> = ({d, f}) => {
  const hand = io(clamp01(f / 16)) * (d.h ?? 90);
  return (
    <g>
      <g transform="translate(0 -210)">
        <circle r={124} fill="#0a0f14" stroke={AMBER} strokeWidth={10} />
        {arr(12).map((i) => <path key={i} d={`M${Math.sin((i * Math.PI) / 6) * 98} ${-Math.cos((i * Math.PI) / 6) * 98} L${Math.sin((i * Math.PI) / 6) * 110} ${-Math.cos((i * Math.PI) / 6) * 110}`} stroke={CREAM} strokeWidth={i % 3 ? 3 : 8} />)}
        <path d={`M0 0 L${Math.sin((hand * Math.PI) / 180) * 94} ${-Math.cos((hand * Math.PI) / 180) * 94}`} stroke={AMBER} strokeWidth={9} strokeLinecap="round" />
        <circle r={10} fill={AMBER} />
      </g>
      <text y={92} textAnchor="middle" fontFamily={ANTON} fontSize={164} letterSpacing={4} fill={CREAM} filter="url(#brGlowText)" opacity={0.42}>{d.text}</text>
      <text y={92} textAnchor="middle" fontFamily={ANTON} fontSize={164} letterSpacing={4} fill={CREAM}>{d.text}</text>
      {d.t2 && <text y={172} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={38} letterSpacing={6} fill={AMBER}>{d.t2}</text>}
    </g>
  );
};

const Livro: React.FC = () => (
  <g>
    <path d="M0 -120 Q -120 -160 -240 -130 V 120 Q -120 90 0 130 Q 120 90 240 120 V -130 Q 120 -160 0 -120 Z" fill="#f2ecd8" />
    <path d="M0 -120 V 130" stroke="#b5ad97" strokeWidth={5} />
    {arr(7).map((i) => <g key={i}><rect x={-212} y={-92 + i * 28} width={180} height={6} fill="#777" opacity={0.6} /><rect x={32} y={-92 + i * 28} width={180} height={6} fill="#777" opacity={0.6} /></g>)}
    <rect x={-250} y={120} width={500} height={14} fill="#7b2f3a" />
  </g>
);

const CaixaCorreio: React.FC = () => (
  <g>
    <rect x={-10} y={-120} width={20} height={120} fill="#3a3a42" />
    <rect x={-70} y={-310} width={140} height={200} rx={16} fill="#d9b23a" />
    <rect x={-70} y={-310} width={34} height={200} rx={16} fill="#000" opacity={0.12} />
    <rect x={-46} y={-270} width={92} height={14} rx={4} fill="#1d2a33" />
    <text x={0} y={-180} textAnchor="middle" fontFamily={ANTON} fontSize={32} fill="#1d2a33">CARTAS</text>
  </g>
);

export const BR_DEFS: React.FC = () => (
  <defs>
    <linearGradient id="brGlass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
      <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <filter id="brGlow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="46" /></filter>
    <filter id="brGlowText" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="16" /></filter>
  </defs>
);

export const PROP_DRAW_BR: Record<string, (d: PropDef, f: number) => React.ReactNode> = {
  phone: (d, f) => <Phone d={d} f={f} />,
  phoneHeld: () => (
    <g>
      <rect x={-18} y={-40} width={36} height={72} rx={7} fill="#0d0d12" stroke="#50505c" strokeWidth={2.5} />
      <rect x={-13} y={-34} width={26} height={58} fill="#7fb8d6" opacity={0.85} />
    </g>
  ),
  maquininha: (d, f) => <Maquininha d={d} f={f} />,
  caderno: (d, f) => <Caderno d={d} f={f} />,
  nota: (d) => <Nota v={d.text} c={d.c} />,
  radio: (d, f) => <Radio d={d} f={f} />,
  moto: (d, f) => <Moto f={f} c={d.c} bag={d.n !== 0} />,
  globe: (d, f) => <Globe f={f} off={d.n} />,
  rede: (d, f) => <Rede f={f} off={d.n} n={d.m} />,
  big: (d) => <Big d={d} />,
  counter: (d, f) => <Counter d={d} f={f} />,
  fact: (d, f) => <Fact d={d} f={f} />,
  bars: (d, f) => <Bars d={d} f={f} />,
  mural: (d, f) => <Mural f={f} n={d.n} />,
  bilhete: (d) => <Bilhete d={d} />,
  carta: (d, f) => <Carta d={d} f={f} />,
  envelope: () => <Envelope />,
  hd: (d) => <HD d={d} />,
  cama: (_d, f) => <Cama f={f} />,
  atm: (d) => <Atm off={d.n === 1} />,
  truck: (_d, f) => <Truck f={f} />,
  aviao: () => <Aviao />,
  vulcao: (_d, f) => <Vulcao f={f} />,
  qmark: (_d, f) => <Qmark f={f} />,
  chapter: (d, f) => <Chapter d={d} f={f} />,
  livro: () => <Livro />,
  caixaCorreio: () => <CaixaCorreio />,
};
