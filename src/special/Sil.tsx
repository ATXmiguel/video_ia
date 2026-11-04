import React from 'react';

// The film's character: a solid black round head on a neck, sleeves with a dark outline, cream features,
// and a thick crescent of rim light on the side facing the shot's light source.
const BLACK = '#08080d';
const EYE = '#f3ead6';
const BRASS = '#d9a93f';

export type Look = {
  torso?: string;
  sleeve?: string;
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
  you: {torso: '#d29a2a', sleeve: '#c28c24', item: 'cap', tag: true},
  otis: {torso: '#7c1f33', item: 'tufts', buttons: true},
  vane: {torso: '#e6e0d0', legs: '#d8d2c2', item: 'slick', tie: '#14141c'},
  quill: {torso: '#1f4f57', skirt: true, item: 'hat', umbrella: true},
  mom: {torso: '#4f8a5b', item: 'bun'},
  robe: {torso: '#dcd8cc', skirt: true, belt: '#a9a392'},
  robe2: {torso: '#c9d6d6', skirt: true, belt: '#8fa5a5', item: 'curls'},
  man: {torso: '#2f5c8f', tie: '#8fb4d9'},
  date: {torso: '#b9607b', item: 'bob'},
  inspector: {torso: '#646d78', tie: '#2a2f36', clipboard: true},
  firefighter: {torso: '#b98a2a', legs: '#a67c26', item: 'helmet'},
  coworker: {torso: '#3f6f76'},
  extra: {faceless: true},
};

type Pose = {l: number[]; r: number[]; sit?: boolean};
// Arm targets as [elbowX, elbowY, handX, handY], relative to the foot point.
const POSES: Record<string, Pose> = {
  idle: {l: [-46, -226, -40, -150], r: [46, -226, 40, -150]},
  desk: {l: [-56, -226, -14, -186], r: [56, -226, 14, -186]},
  point: {l: [-46, -226, -40, -150], r: [90, -280, 156, -300]},
  phone: {l: [-46, -226, -40, -150], r: [70, -232, 56, -344]},
  shock: {l: [-80, -290, -66, -392], r: [80, -290, 66, -392]},
  cheer: {l: [-76, -320, -90, -420], r: [76, -320, 90, -420]},
  shrug: {l: [-80, -246, -112, -296], r: [80, -246, 112, -296]},
  bang: {l: [-46, -226, -40, -150], r: [86, -292, 154, -346]},
  mic: {l: [-46, -226, -40, -150], r: [62, -232, 32, -308]},
  sit: {l: [-46, -226, 18, -176], r: [46, -226, 60, -176], sit: true},
  sitmug: {l: [-46, -226, 18, -176], r: [68, -224, 96, -214], sit: true},
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
  light?: [number, number]; // where the shot's light is, in frame coordinates
  floorShadow?: boolean;
  wallShadow?: boolean;
};

const Body: React.FC<{L: Look; pose: Pose; face: string; c?: string; talking: boolean; walking: boolean; frame: number; lightSide: number}> = ({
  L,
  pose,
  face,
  c,
  talking,
  walking,
  frame,
  lightSide,
}) => {
  const tone = (col: string) => c ?? col;
  const swing = walking ? Math.sin(frame * 0.55) * 34 : 0;
  const legs = pose.sit
    ? [`M-14 -150 Q 30 -150 66 -146 L 66 -8`, `M14 -150 Q 50 -150 92 -146 L 92 -8`]
    : [`M-14 -150 Q ${-16 + swing * 0.5} -76 ${-20 + swing} 0`, `M14 -150 Q ${16 - swing * 0.5} -76 ${20 - swing} 0`];
  const legColor = tone(L.legs ?? BLACK);
  const sleeve = L.sleeve ?? L.torso;
  const arm = (a: number[], side: number) => {
    const d = `M${side * 32} -288 Q ${a[0]} ${a[1]} ${a[2]} ${a[3]}`;
    return (
      <>
        <path d={d} stroke={tone(BLACK)} strokeWidth={sleeve ? 23 : 14} fill="none" strokeLinecap="round" />
        {sleeve && <path d={d} stroke={tone(sleeve)} strokeWidth={16} fill="none" strokeLinecap="round" />}
        <circle cx={a[2]} cy={a[3]} r={11} fill={tone(BLACK)} />
      </>
    );
  };
  const torsoBottom = L.skirt ? -64 : -142;
  const torsoPath = `M-38 -296 Q 0 -310 38 -296 L ${L.skirt ? 40 : 27} ${torsoBottom} Q 0 ${torsoBottom + 7} ${L.skirt ? -40 : -27} ${torsoBottom} Z`;
  const talk = talking ? 2.5 + 7.5 * Math.abs(Math.sin(frame * 0.62)) : 0;

  const features = () => {
    if (c || L.faceless) return null;
    const fx = 7; // features sit a little toward the way the character faces
    const ex = 21;
    const ey = -364;
    const halfEye = (sd: number, tilt: number, key: string) => (
      <g key={key} transform={`translate(${fx + sd * ex} ${ey}) rotate(${tilt * sd})`}>
        <path d="M-12 0 H 12 A 11 10 0 0 1 -12 0 Z" fill={EYE} />
        <rect x={-15} y={-5} width={30} height={6} rx={3} fill={EYE} />
      </g>
    );
    const arc = (d: number) =>
      [-1, 1].map((sd) => (
        <path key={sd} d={`M${fx + sd * ex - 12} ${ey + (d > 0 ? -2 : 3)} q 12 ${d} 24 0`} stroke={EYE} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      ));
    let eyes: React.ReactNode;
    if (face === 'closed') eyes = arc(9);
    else if (face === 'happy') eyes = arc(-13);
    else if (face === 'shock')
      eyes = [-1, 1].map((sd) => (
        <g key={sd}>
          <circle cx={fx + sd * ex} cy={ey} r={14} fill={EYE} />
          <circle cx={fx + sd * ex + 2} cy={ey} r={4.5} fill={BLACK} />
        </g>
      ));
    else if (face === 'tired' || face === 'bored' || face === 'smug') eyes = [-1, 1].map((sd) => halfEye(sd, 0, String(sd)));
    else if (face === 'angry') eyes = [-1, 1].map((sd) => halfEye(sd, -14, String(sd)));
    else if (face === 'sad') eyes = [-1, 1].map((sd) => halfEye(sd, 15, String(sd)));
    else eyes = [-1, 1].map((sd) => <circle key={sd} cx={fx + sd * ex} cy={ey} r={7.5} fill={EYE} />);
    const my = -330;
    const mouth = (() => {
      if (talk) return <ellipse cx={fx} cy={my} rx={9} ry={talk} fill={EYE} />;
      if (face === 'shock') return <ellipse cx={fx} cy={my} rx={8} ry={11} fill={EYE} />;
      if (face === 'happy' || face === 'smile') return <path d={`M${fx - 15} ${my - 4} q 15 14 30 0`} stroke={EYE} strokeWidth={5} fill="none" strokeLinecap="round" />;
      if (face === 'smug') return <path d={`M${fx - 11} ${my + 1} q 15 7 26 -7`} stroke={EYE} strokeWidth={5} fill="none" strokeLinecap="round" />;
      if (face === 'sad') return <path d={`M${fx - 13} ${my + 5} q 13 -11 26 0`} stroke={EYE} strokeWidth={5} fill="none" strokeLinecap="round" />;
      return <path d={`M${fx - 11} ${my} H ${fx + 11}`} stroke={EYE} strokeWidth={5} strokeLinecap="round" />;
    })();
    return (
      <>
        {eyes}
        {mouth}
      </>
    );
  };

  return (
    <g>
      {legs.map((d, i) => (
        <path key={i} d={d} stroke={legColor} strokeWidth={15} fill="none" strokeLinecap="round" />
      ))}
      {arm(pose.l, -1)}
      <rect x={-13} y={-326} width={26} height={40} fill={tone(BLACK)} />
      <path d={torsoPath} fill={tone(L.torso ?? BLACK)} />
      {!c && L.torso && <path d={torsoPath} fill={`url(#${lightSide > 0 ? 'shadeFromRight' : 'shadeFromLeft'})`} />}
      {!c && L.belt && <rect x={-31} y={-170} width={62} height={9} rx={4} fill={L.belt} />}
      {!c && L.tie && <path d="M-5 -296 L5 -296 L8 -214 L0 -200 L-8 -214 Z" fill={L.tie} />}
      {!c && L.buttons && [-272, -240, -208, -176].map((by) => <circle key={by} cx={0} cy={by} r={4.5} fill={BRASS} />)}
      {!c && L.tag && <rect x={7} y={-270} width={17} height={7} rx={2} fill="#f2d98c" />}
      {arm(pose.r, 1)}
      {!c && L.clipboard && <rect x={pose.r[2] - 18} y={pose.r[3] - 26} width={36} height={46} rx={3} fill="#dcd7c6" />}
      {L.umbrella && (
        <g>
          <path d={`M${pose.r[2]} ${pose.r[3]} L ${pose.r[2]} -490`} stroke={tone('#2a2a2a')} strokeWidth={5} />
          <path d={`M${pose.r[2] - 110} -480 Q ${pose.r[2]} -580 ${pose.r[2] + 110} -480 Q ${pose.r[2] + 73} -500 ${pose.r[2] + 37} -480 Q ${pose.r[2]} -502 ${pose.r[2] - 37} -480 Q ${pose.r[2] - 73} -500 ${pose.r[2] - 110} -480 Z`} fill={tone('#e0b52a')} />
        </g>
      )}
      <circle cx={0} cy={-372} r={60} fill={tone(BLACK)} />
      {L.item === 'cap' && <path d="M-59 -394 A 60 60 0 0 1 59 -394 L 98 -388 Q 100 -380 90 -380 L -58 -386 Z" fill={tone('#c9362d')} />}
      {L.item === 'helmet' && <path d="M-70 -390 A 68 68 0 0 1 70 -390 L 90 -380 L -90 -380 Z" fill={tone('#a8362a')} />}
      {L.item === 'hat' && <path d="M-84 -398 L 84 -398 L 52 -410 L 46 -448 L -46 -448 L -52 -410 Z" fill={tone('#10343a')} />}
      {L.item === 'tufts' && (
        <>
          <circle cx={-62} cy={-380} r={15} fill={tone('#a0a3a9')} />
          <circle cx={62} cy={-380} r={15} fill={tone('#a0a3a9')} />
        </>
      )}
      {L.item === 'slick' && <path d="M-60 -386 A 60 60 0 0 1 60 -386 Q 10 -422 -60 -386 Z" fill={tone('#38312a')} />}
      {L.item === 'bun' && <circle cx={0} cy={-440} r={21} fill={tone(BLACK)} />}
      {L.item === 'curls' && [-48, -25, 0, 25, 48].map((cx) => <circle key={cx} cx={cx} cy={-420 + Math.abs(cx) * 0.4} r={20} fill={tone('#17171f')} />)}
      {L.item === 'bob' && <path d="M-70 -332 Q -82 -442 0 -440 Q 82 -442 70 -332 L 52 -338 Q 52 -400 0 -406 Q -52 -400 -52 -338 Z" fill={tone('#17171f')} />}
      {features()}
    </g>
  );
};

export const Sil: React.FC<Props> = ({look, x, y, s = 1, face = 'neutral', pose = 'idle', flip, talking = false, walking = false, frame, rim = '#e8a25a', ringAge, light, floorShadow, wallShadow}) => {
  const L = LOOKS[look] ?? LOOKS.extra;
  const P = POSES[pose] ?? POSES.idle;
  const ring = ringAge !== undefined && ringAge >= 0 && ringAge < 0.5 ? ringAge / 0.5 : -1;
  // Rim light: a copy of the body pushed toward the light, showing as a crescent around the silhouette.
  const lx = light ? light[0] - x : 300;
  const ly = light ? light[1] - (y - 300 * s) : -300;
  const len = Math.hypot(lx, ly) || 1;
  const sign = flip ? -1 : 1;
  const rimX = (lx / len) * 8 * sign;
  const rimY = (ly / len) * 6;
  const lightSide = lx * sign > 0 ? 1 : -1;
  const shadowX = -(lx / len);
  return (
    <>
      {wallShadow && (
        <g transform={`translate(${x + shadowX * 90} ${y - 16}) scale(${(flip ? -s : s) * 1.08} ${s * 1.08})`} opacity={0.34} filter="url(#softShadow)">
          <Body L={L} pose={P} face={face} c="#000" talking={false} walking={walking} frame={frame} lightSide={lightSide} />
        </g>
      )}
      {floorShadow && <ellipse cx={x + shadowX * 40 * s} cy={y + 4} rx={92 * s} ry={15 * s} fill="#000" opacity={0.5} filter="url(#softShadowSmall)" />}
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
        <g transform={`translate(${rimX} ${rimY})`}>
          <Body L={L} pose={P} face={face} c={rim} talking={false} walking={walking} frame={frame} lightSide={lightSide} />
        </g>
        <Body L={L} pose={P} face={face} talking={talking} walking={walking} frame={frame} lightSide={lightSide} />
        {ring >= 0 && <circle cx={7} cy={-330} r={36 + ring * 52} fill="none" stroke={BRASS} strokeWidth={4 * (1 - ring) + 1} opacity={1 - ring} />}
      </g>
    </>
  );
};
