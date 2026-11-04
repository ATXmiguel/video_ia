import React from 'react';

// The film's character: a solid black round head on thin limbs, white features, one signature item, a rim light.
const BLACK = '#0b0b12';
const WHITE = '#f6f2e8';
const BRASS = '#d9a93f';

export type Look = {
  torso?: string;
  legs?: string;
  skirt?: boolean; // torso runs down to the knees (robe, long coat)
  belt?: string;
  faceless?: boolean;
  item?: 'cap' | 'tufts' | 'slick' | 'bun' | 'curls' | 'helmet' | 'bob' | 'hat';
  buttons?: boolean;
  tie?: string;
  tag?: boolean;
  umbrella?: boolean;
  clipboard?: boolean;
};

export const LOOKS: Record<string, Look> = {
  you: {torso: '#d8a02c', item: 'cap', tag: true},
  otis: {torso: '#7c1f33', item: 'tufts', buttons: true},
  vane: {torso: '#eee9dc', legs: '#eee9dc', item: 'slick', tie: '#14141c'},
  quill: {torso: '#1f4f57', skirt: true, item: 'hat', umbrella: true},
  mom: {torso: '#4f8a5b', item: 'bun'},
  robe: {torso: '#e6e2d6', skirt: true, belt: '#b9b3a2'},
  robe2: {torso: '#d9e4e4', skirt: true, belt: '#9fb5b5', item: 'curls'},
  man: {torso: '#2f5c8f', tie: '#8fb4d9'},
  date: {torso: '#c76a86', item: 'bob'},
  inspector: {torso: '#6d7682', tie: '#2a2f36', clipboard: true},
  firefighter: {torso: '#c9962e', legs: '#c9962e', item: 'helmet'},
  coworker: {torso: '#3f6f76'},
  extra: {faceless: true},
};

type Pose = {l: number[]; r: number[]; sit?: boolean};
// Arm targets as [elbowX, elbowY, handX, handY], relative to the foot point.
const POSES: Record<string, Pose> = {
  idle: {l: [-42, -222, -38, -150], r: [42, -222, 38, -150]},
  desk: {l: [-52, -226, -14, -190], r: [52, -226, 14, -190]},
  point: {l: [-42, -222, -38, -150], r: [84, -296, 150, -310]},
  phone: {l: [-42, -222, -38, -150], r: [60, -236, 42, -345]},
  shock: {l: [-74, -300, -60, -390], r: [74, -300, 60, -390]},
  cheer: {l: [-70, -320, -86, -420], r: [70, -320, 86, -420]},
  shrug: {l: [-74, -250, -104, -300], r: [74, -250, 104, -300]},
  bang: {l: [-42, -222, -38, -150], r: [80, -300, 148, -350]},
  mic: {l: [-42, -222, -38, -150], r: [52, -240, 26, -318]},
  sit: {l: [-42, -222, 16, -176], r: [42, -222, 56, -176], sit: true},
  sitmug: {l: [-42, -222, 16, -176], r: [64, -224, 90, -214], sit: true},
};

type Props = {
  look: string;
  x: number;
  y: number;
  s?: number;
  face?: string;
  pose?: string;
  flip?: boolean;
  talking?: boolean;
  walking?: boolean;
  frame: number;
  rim?: string;
  ringAge?: number; // seconds since this character's last lie rang
};

const Body: React.FC<{L: Look; pose: Pose; face: string; c?: string; talking: boolean; walking: boolean; frame: number}> = ({
  L,
  pose,
  face,
  c,
  talking,
  walking,
  frame,
}) => {
  const tone = (col: string) => c ?? col;
  const limb = tone(BLACK);
  const swing = walking ? Math.sin(frame * 0.55) * 34 : 0;
  const legs = pose.sit
    ? [`M-14 -150 Q 30 -150 66 -146 L 66 -8`, `M14 -150 Q 50 -150 92 -146 L 92 -8`]
    : [`M-14 -150 Q ${-16 + swing * 0.5} -76 ${-20 + swing} 0`, `M14 -150 Q ${16 - swing * 0.5} -76 ${20 - swing} 0`];
  const legColor = tone(L.legs ?? BLACK);
  const arm = (a: number[], side: number) => `M${side * 26} -296 Q ${a[0]} ${a[1]} ${a[2]} ${a[3]}`;
  const torsoBottom = L.skirt ? -64 : -142;
  const torsoColor = tone(L.torso ?? BLACK);
  const eye = WHITE;
  const talk = talking ? 3 + 9 * Math.abs(Math.sin(frame * 0.62)) : 0;

  const features = () => {
    if (c || L.faceless) return null;
    const ex = 22;
    const ey = -376;
    const eyes: Record<string, React.ReactNode> = {
      closed: (
        <>
          <path d={`M${-ex - 12} ${ey} q 12 9 24 0`} stroke={eye} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M${ex - 12} ${ey} q 12 9 24 0`} stroke={eye} strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      ),
      happy: (
        <>
          <path d={`M${-ex - 12} ${ey + 3} q 12 -14 24 0`} stroke={eye} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M${ex - 12} ${ey + 3} q 12 -14 24 0`} stroke={eye} strokeWidth={6} fill="none" strokeLinecap="round" />
        </>
      ),
      shock: (
        <>
          <circle cx={-ex} cy={ey} r={15} fill={eye} />
          <circle cx={ex} cy={ey} r={15} fill={eye} />
          <circle cx={-ex + 2} cy={ey} r={5} fill={BLACK} />
          <circle cx={ex + 2} cy={ey} r={5} fill={BLACK} />
        </>
      ),
    };
    const lid = face === 'tired' || face === 'bored' || face === 'smug' ? 0.5 : face === 'angry' ? 0.65 : 1;
    const slant = face === 'angry' ? 7 : face === 'sad' ? -7 : 0;
    const open = (
      <>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <ellipse cx={sd * ex} cy={ey} rx={13} ry={11 * lid} fill={eye} />
            <circle cx={sd * ex + 3} cy={ey + (lid < 1 ? 1 : 0)} r={4.5 * Math.min(1, lid + 0.3)} fill={BLACK} />
            {slant !== 0 && (
              // A slanted lid over the top of the eye: inner corner low when angry, outer corner low when sad.
              <path d={`M${sd * ex - 15} ${ey - 12} L${sd * ex + 15} ${ey - 12} L${sd * ex + 15} ${ey - 6 - sd * slant * 0.7} L${sd * ex - 15} ${ey - 6 + sd * slant * 0.7} Z`} fill={BLACK} />
            )}
          </g>
        ))}
      </>
    );
    const my = -340;
    const mouth = (() => {
      if (talk) return <ellipse cx={0} cy={my} rx={10} ry={talk} fill={eye} />;
      if (face === 'shock') return <ellipse cx={0} cy={my} rx={9} ry={13} fill={eye} />;
      if (face === 'happy' || face === 'smile') return <path d={`M-16 ${my - 4} q 16 16 32 0`} stroke={eye} strokeWidth={5} fill="none" strokeLinecap="round" />;
      if (face === 'smug') return <path d={`M-12 ${my + 1} q 16 8 28 -8`} stroke={eye} strokeWidth={5} fill="none" strokeLinecap="round" />;
      if (face === 'sad') return <path d={`M-14 ${my + 5} q 14 -12 28 0`} stroke={eye} strokeWidth={5} fill="none" strokeLinecap="round" />;
      return <path d={`M-11 ${my} L 11 ${my}`} stroke={eye} strokeWidth={5} strokeLinecap="round" />;
    })();
    return (
      <>
        {eyes[face] ?? open}
        {mouth}
      </>
    );
  };

  return (
    <g>
      {legs.map((d, i) => (
        <path key={i} d={d} stroke={legColor} strokeWidth={15} fill="none" strokeLinecap="round" />
      ))}
      <path d={arm(pose.l, -1)} stroke={limb} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path
        d={`M-30 -304 Q 0 -316 30 -304 L ${L.skirt ? 38 : 25} ${torsoBottom} Q 0 ${torsoBottom + 7} ${L.skirt ? -38 : -25} ${torsoBottom} Z`}
        fill={torsoColor}
      />
      {!c && L.belt && <rect x={-29} y={-170} width={58} height={9} rx={4} fill={L.belt} />}
      {!c && L.tie && <path d="M-5 -302 L5 -302 L8 -214 L0 -200 L-8 -214 Z" fill={L.tie} />}
      {!c && L.buttons && [-280, -248, -216, -184].map((by) => <circle key={by} cx={0} cy={by} r={4.5} fill={BRASS} />)}
      {!c && L.tag && <rect x={7} y={-276} width={17} height={7} rx={2} fill="#f2d98c" />}
      <path d={arm(pose.r, 1)} stroke={limb} strokeWidth={13} fill="none" strokeLinecap="round" />
      {!c && L.clipboard && <rect x={pose.r[2] - 18} y={pose.r[3] - 26} width={36} height={46} rx={3} fill="#e8e3d3" />}
      {L.umbrella && (
        <g>
          <path d={`M${pose.r[2]} ${pose.r[3]} L ${pose.r[2]} -480`} stroke={tone('#2a2a2a')} strokeWidth={5} />
          <path d={`M${pose.r[2] - 110} -470 Q ${pose.r[2]} -570 ${pose.r[2] + 110} -470 Q ${pose.r[2] + 73} -490 ${pose.r[2] + 37} -470 Q ${pose.r[2]} -492 ${pose.r[2] - 37} -470 Q ${pose.r[2] - 73} -490 ${pose.r[2] - 110} -470 Z`} fill={tone('#f0c52e')} />
        </g>
      )}
      <circle cx={0} cy={-370} r={58} fill={tone(BLACK)} />
      {L.item === 'cap' && (
        <path d="M-57 -392 A 58 58 0 0 1 57 -392 L 94 -386 Q 96 -378 86 -378 L -56 -384 Z" fill={tone('#d63a30')} />
      )}
      {L.item === 'helmet' && <path d="M-68 -388 A 66 66 0 0 1 68 -388 L 88 -378 L -88 -378 Z" fill={tone('#b83a2a')} />}
      {L.item === 'hat' && <path d="M-82 -396 L 82 -396 L 50 -408 L 44 -446 L -44 -446 L -50 -408 Z" fill={tone('#10343a')} />}
      {L.item === 'tufts' && (
        <>
          <circle cx={-60} cy={-378} r={15} fill={tone('#a9acb2')} />
          <circle cx={60} cy={-378} r={15} fill={tone('#a9acb2')} />
        </>
      )}
      {L.item === 'slick' && <path d="M-58 -384 A 58 58 0 0 1 58 -384 Q 10 -420 -58 -384 Z" fill={tone('#38312a')} />}
      {L.item === 'bun' && <circle cx={0} cy={-438} r={21} fill={tone(BLACK)} />}
      {L.item === 'curls' &&
        [-46, -24, 0, 24, 46].map((cx) => <circle key={cx} cx={cx} cy={-418 + Math.abs(cx) * 0.4} r={20} fill={tone('#17171f')} />)}
      {L.item === 'bob' && <path d="M-68 -330 Q -80 -440 0 -438 Q 80 -440 68 -330 L 50 -336 Q 50 -398 0 -404 Q -50 -398 -50 -336 Z" fill={tone('#17171f')} />}
      {features()}
    </g>
  );
};

export const Sil: React.FC<Props> = ({look, x, y, s = 1, face = 'neutral', pose = 'idle', flip, talking = false, walking = false, frame, rim = '#d98a3f', ringAge}) => {
  const L = LOOKS[look] ?? LOOKS.extra;
  const P = POSES[pose] ?? POSES.idle;
  const ring = ringAge !== undefined && ringAge >= 0 && ringAge < 0.5 ? ringAge / 0.5 : -1;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g transform="translate(-4 -2)" opacity={0.95}>
        <Body L={L} pose={P} face={face} c={rim} talking={false} walking={walking} frame={frame} />
      </g>
      <Body L={L} pose={P} face={face} talking={talking} walking={walking} frame={frame} />
      {ring >= 0 && <circle cx={0} cy={-340} r={16 + ring * 44} fill="none" stroke={BRASS} strokeWidth={6 * (1 - ring) + 1} opacity={1 - ring} />}
    </g>
  );
};
