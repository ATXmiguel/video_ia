import React from 'react';
import {random} from 'remotion';
import {LOOKS, type Look} from './Sil';

// A puppet rig built from the measurements in docs/whatif/REPLICATION_GUIDE.md. Every length is in units where the head
// is 100 across, and the figure is 4.8 heads tall. Bodies are forward kinematics on the arms and two-bone IK on the
// legs, so feet stay planted. Motion is pose to pose: a short eased move, then a hold. Faces change by crossfade, not
// by sliding, and mouths are held shapes rather than a sine flap.
export const HIP_Y = -230;
const TORSO = 125;
const THIGH = 116;
const SHIN = 116;
const UPPER = 85;
const FORE = 80;
const NECK = 26;
const R = 50;

const BLACK = '#0c0b12';
const CREAM = '#f8f1dc';
const OUTLINE = '#0a0a10';
const BRASS = '#d9a93f';

export type Pose = {
  rootX: number;
  rootY: number; // how far the hip drops
  lean: number; // torso, degrees, + = forward
  headX: number;
  headY: number;
  front: number; // 0 = side-on, 1 = facing the lens
  dir: number; // 1 = faces right, -1 = faces left
  near: [number, number]; // near arm [shoulder, elbow], 0 = straight down, + = forward
  far: [number, number];
  nearFoot: [number, number]; // [x, height above the floor] from the root
  farFoot: [number, number];
  nearToe: number; // foot angle, degrees, + = toe up
  farToe: number;
};

export const NEUTRAL: Pose = {
  rootX: 0, rootY: 0, lean: 2, headX: 0, headY: 0, front: 0, dir: 1,
  near: [6, 10], far: [-4, 10], nearFoot: [14, 0], farFoot: [-14, 0], nearToe: 0, farToe: 0,
};

// Named partial poses: the vocabulary of the acting. Add to this as films need more.
export const P: Record<string, Partial<Pose>> = {
  stand: {lean: 2, near: [6, 10], far: [-4, 10], nearFoot: [14, 0], farFoot: [-14, 0], rootY: 0, headX: 0, headY: 0},
  relaxed: {lean: 0, near: [2, 6], far: [-8, 12], nearFoot: [20, 0], farFoot: [-18, 0], rootY: 2},
  front: {front: 1, lean: 0, near: [8, 6], far: [8, 6], nearFoot: [20, 0], farFoot: [-20, 0], rootY: 0},
  leanIn: {lean: 14, headX: 8, near: [48, 30], far: [10, 30], nearFoot: [26, 0], farFoot: [-30, 0], rootY: 4},
  reachJacket: {lean: 4, near: [14, 118], far: [-6, 12], headX: -2},
  showBadge: {lean: 9, headX: 6, near: [52, 44], far: [-8, 16], nearFoot: [24, 0], farFoot: [-26, 0], rootY: 3},
  showBadgeHigh: {lean: 11, headX: 8, near: [66, 48], far: [-6, 20], nearFoot: [26, 0], farFoot: [-28, 0], rootY: 4},
  slump: {lean: 16, headX: 10, headY: 9, near: [0, 2], far: [-2, 2], rootY: 7, nearFoot: [10, 0], farFoot: [-12, 0]},
  shrug: {lean: -2, near: [34, 92], far: [-20, 88], headY: 4},
  armsUp: {lean: -3, near: [168, 4], far: [172, 4], headY: 2},
  handToMouth: {lean: 4, near: [38, 128], far: [-4, 12], headX: -1},
  phoneEar: {lean: 3, near: [26, 138], far: [-6, 12], headX: -2},
  writing: {lean: 16, headX: 10, headY: 5, near: [44, 40], far: [36, 56], rootY: 0},
  deskReady: {lean: 6, headX: 2, near: [36, 46], far: [30, 60], rootY: 0},
  sit: {rootY: 112, lean: 5, nearFoot: [112, 0], farFoot: [96, 0], near: [30, 50], far: [18, 56]},
  sitDesk: {rootY: 112, lean: 12, headX: 6, nearFoot: [112, 0], farFoot: [96, 0], near: [52, 42], far: [44, 52]},
  // Added for data-built films (src/special/Film.tsx).
  grab: {lean: 6, near: [78, 22], far: [64, 30], rootY: 4, nearFoot: [22, 0], farFoot: [-24, 0]},
  carry: {lean: -2, near: [46, 52], far: [40, 58], headX: -1},
  point: {lean: 4, near: [86, 6], far: [-6, 14], headX: 3},
  pour: {lean: 9, headX: 6, near: [62, 34], far: [-4, 40], nearFoot: [20, 0], farFoot: [-24, 0], rootY: 2},
  raiseHand: {lean: 0, near: [142, 8], far: [-6, 14], headX: -3},
  flail: {lean: -4, near: [132, 30], far: [150, -18], headY: 2},
  crouch: {lean: 22, headX: 12, headY: 8, rootY: 46, near: [30, 34], far: [18, 40], nearFoot: [30, 0], farFoot: [-30, 0]},
  sitDown: {rootY: 112, lean: 5, nearFoot: [112, 0], farFoot: [96, 0], near: [40, 44], far: [28, 50]},
  sitForkUp: {rootY: 112, lean: 8, headX: 3, nearFoot: [112, 0], farFoot: [96, 0], near: [48, 86], far: [44, 52]},
  sitForkDown: {rootY: 112, lean: 14, headX: 7, nearFoot: [112, 0], farFoot: [96, 0], near: [58, 24], far: [50, 30]},
  reach: {lean: 6, headX: 2, near: [118, 18], far: [-6, 14]},
  checkPhone: {lean: 7, headX: 4, headY: 6, near: [60, 74], far: [-4, 14]},
  phoneUp: {lean: -4, headX: -2, near: [168, 6], far: [-8, 16]},
  phoneShake: {lean: 4, headX: 2, near: [92, 30], far: [-8, 14]},
  handsHead: {lean: 0, headY: 4, near: [150, 132], far: [150, 132]},
  armsFold: {lean: -2, near: [28, 96], far: [18, 104]},
  give: {lean: 8, headX: 5, near: [78, 12], far: [-6, 14], nearFoot: [24, 0], farFoot: [-24, 0], rootY: 3},
  knock: {lean: 6, headX: 2, near: [82, 66], far: [-4, 14]},
  ride: {rootY: 86, lean: 14, headX: 7, near: [66, 22], far: [58, 26], nearFoot: [64, 36], farFoot: [50, 36]},
  listen: {lean: 8, headX: 6, headY: 6, near: [30, 110], far: [-4, 12], rootY: 3},
  sitOnly: {rootY: 112, lean: 3, nearFoot: [112, 0], farFoot: [96, 0], near: [18, 40], far: [12, 44]},
  sitPhone: {rootY: 112, lean: 12, headX: 8, headY: 7, nearFoot: [112, 0], farFoot: [96, 0], near: [58, 76], far: [40, 70]},
  sitRead: {rootY: 112, lean: 10, headX: 6, headY: 8, nearFoot: [112, 0], farFoot: [96, 0], near: [52, 62], far: [46, 66]},
  sitFloat: {rootY: 60, lean: -6, nearFoot: [92, 24], farFoot: [70, 12], near: [70, 30], far: [60, 40]},
};

export type Ease = 'io' | 'snap' | 'out' | 'in' | 'slow';
const EASES: Record<Ease, {f: (t: number) => number; dur: number}> = {
  io: {f: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2), dur: 6},
  snap: {f: (t) => 1 - (1 - t) ** 3, dur: 2},
  out: {f: (t) => 1 - (1 - t) ** 4, dur: 8}, // 70% of the move in the first three frames, then a long settle
  in: {f: (t) => t ** 3, dur: 5},
  slow: {f: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2), dur: 12},
};

export type Key = {at: number; pose?: string; ease?: Ease; dur?: number} & Partial<Pose>;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const applyKey = (base: Pose, k: Partial<Pose>, t: number): Pose => {
  const out = {...base} as any;
  for (const key of Object.keys(k)) {
    const v = (k as any)[key];
    if (v === undefined) continue;
    if (Array.isArray(v)) out[key] = [lerp(out[key][0], v[0], t), lerp(out[key][1], v[1], t)];
    else if (typeof v === 'number') out[key] = lerp(out[key], v, t);
  }
  return out as Pose;
};

export const poseAt = (track: Key[], f: number, start: Pose = NEUTRAL): Pose => {
  let p = start;
  for (const k of track) {
    if (k.at > f) break;
    const ease = EASES[k.ease ?? 'io'];
    const dur = k.dur ?? ease.dur;
    const t = dur <= 0 ? 1 : ease.f(Math.min(1, (f - k.at) / dur));
    const {at: _a, pose: name, ease: _e, dur: _d, ...own} = k;
    p = applyKey(p, {...(name ? P[name] : {}), ...own}, t);
  }
  return p;
};

export type Walk = {from: number; to: number; x0: number; x1: number; cycle?: number; keepArms?: boolean};

// Measured cycle: 16 frames, so 8 per step. The head rises and falls twice per cycle by about a tenth of its diameter.
const walkPose = (w: Walk, f: number, settle: Pose): Pose => {
  const cycle = w.cycle ?? 16;
  const span = w.to - w.from;
  const prog = (f - w.from) / span;
  const x = lerp(w.x0, w.x1, Math.min(1, prog));
  const dirn = Math.sign(w.x1 - w.x0) || 1;
  const S = Math.abs(w.x1 - w.x0) / (span / (cycle / 2)); // stride comes from the speed, so feet never skate
  const ph = ((f - w.from) / cycle) % 1;
  const foot = (phase: number): {x: number; y: number; toe: number} => {
    const q = phase % 1;
    if (q < 0.5) {
      const s = q / 0.5;
      return {x: S / 2 - S * s, y: 0, toe: s < 0.18 ? 18 * (1 - s / 0.18) : s > 0.72 ? -36 * ((s - 0.72) / 0.28) : 0};
    }
    const s = (q - 0.5) / 0.5;
    const e = s * s * (3 - 2 * s);
    return {x: -S / 2 + S * e, y: 30 * Math.sin(Math.PI * s), toe: lerp(-36, 16, s)};
  };
  const a = foot(ph);
  const b = foot(ph + 0.5);
  const swing = Math.sin(2 * Math.PI * ph);
  return {
    ...settle,
    rootX: x,
    rootY: 3 + 5 * Math.cos(4 * Math.PI * ph),
    lean: 6,
    headX: 2 + 1.5 * Math.cos(2 * Math.PI * ph),
    headY: 0,
    dir: dirn,
    near: w.keepArms ? settle.near : [-22 * swing + 4, 18 + 10 * Math.max(0, -swing)],
    far: w.keepArms ? settle.far : [22 * swing + 4, 18 + 10 * Math.max(0, swing)],
    nearFoot: [a.x, a.y],
    farFoot: [b.x, b.y],
    nearToe: a.toe,
    farToe: b.toe,
  };
};

type Joints = ReturnType<typeof solve>;
const rad = (d: number) => (d * Math.PI) / 180;

const solve = (p: Pose) => {
  const hipC = {x: 0, y: HIP_Y + p.rootY};
  const fr = Math.max(0, Math.min(1, p.front));
  const lean = rad(p.lean * (1 - fr));
  const shoulderC = {x: hipC.x + Math.sin(lean) * TORSO, y: hipC.y - Math.cos(lean) * TORSO};
  const sW = 5 + 27 * fr;
  const hW = 3 + 10 * fr;
  const arm = (sh: {x: number; y: number}, a: number[], side: number) => {
    const u = rad(a[0]);
    const e = {x: sh.x + side * Math.sin(u) * UPPER, y: sh.y + Math.cos(u) * UPPER};
    const v = rad(a[0] + (fr > 0.5 ? -a[1] : a[1]));
    return {s: sh, e, h: {x: e.x + side * Math.sin(v) * FORE, y: e.y + Math.cos(v) * FORE}};
  };
  // In a front view the arms hang outward, so the near arm mirrors. In a side view both swing the same way.
  const nearArm = arm({x: shoulderC.x + sW, y: shoulderC.y + 6}, p.near, 1);
  const farArm = arm({x: shoulderC.x - sW, y: shoulderC.y + 6}, p.far, fr > 0.5 ? -1 : 1);
  const leg = (hip: {x: number; y: number}, foot: [number, number], toe: number) => {
    const F = {x: foot[0] + (hip.x - hipC.x), y: -foot[1]};
    const dx = F.x - hip.x;
    const dy = F.y - hip.y;
    const d = Math.min(THIGH + SHIN - 0.5, Math.hypot(dx, dy));
    const a = (THIGH * THIGH - SHIN * SHIN + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, THIGH * THIGH - a * a));
    const ux = dx / (Math.hypot(dx, dy) || 1);
    const uy = dy / (Math.hypot(dx, dy) || 1);
    // knees bend forward, toward +x; perpendicular of a downward leg is (uy, -ux)
    const k = {x: hip.x + ux * a + uy * h, y: hip.y + uy * a - ux * h};
    const t = rad(toe);
    return {hip, k, a: F, toe: {x: F.x + Math.cos(t) * 34, y: F.y - Math.sin(t) * 34}};
  };
  const nearLeg = leg({x: hipC.x + hW, y: hipC.y}, p.nearFoot, p.nearToe);
  const farLeg = leg({x: hipC.x - hW, y: hipC.y}, p.farFoot, p.farToe);
  const neck = {x: shoulderC.x, y: shoulderC.y - 2};
  const head = {
    x: shoulderC.x + Math.sin(lean * 1.2) * (NECK + R) + p.headX,
    y: shoulderC.y - Math.cos(lean * 1.2) * (NECK + R) + p.headY,
  };
  return {hipC, shoulderC, neck, head, nearArm, farArm, nearLeg, farLeg, fr, sW, hW, lean};
};

const Cap: React.FC<{a: {x: number; y: number}; b: {x: number; y: number}; w: number; c: string}> = ({a, b, w, c}) => (
  <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />
);

// Two capsules that overlap at the joint, so the elbow reads as a joint and not as a bend in a noodle.
const Limb: React.FC<{a: any; b: any; c: any; w: number; fill: string; line?: string; outline?: number}> = ({a, b, c, w, fill, line, outline = 3.5}) => (
  <>
    {line && <Cap a={a} b={b} w={w + outline * 2} c={line} />}
    <Cap a={a} b={b} w={w} c={fill} />
    {line && <Cap a={b} b={c} w={w + outline * 2} c={line} />}
    <Cap a={b} b={c} w={w} c={fill} />
  </>
);

const Silhouette: React.FC<{J: Joints; L: Look; tone?: string; hold?: (J: Joints) => React.ReactNode}> = ({J, L, tone, hold}) => {
  const t = (c: string) => tone ?? c;
  const legC = t(L.legs ?? BLACK);
  const sleeve = L.sleeve ?? L.torso;
  const armW = sleeve ? 20 : 16;
  const legW = 22;
  const {hipC, shoulderC, fr, lean} = J;
  const halfS = 21 + 19 * fr;
  const halfH = 16 + 12 * fr;
  const bottom = L.skirt ? 95 : 0;
  // The torso as a tapered shape along the spine, so a lean carries the shoulders with it.
  const nx = Math.cos(lean);
  const ny = Math.sin(lean);
  const by = hipC.y + bottom + 8;
  const torso =
    `M${shoulderC.x - nx * halfS} ${shoulderC.y - ny * halfS - 2} Q ${shoulderC.x} ${shoulderC.y - 14} ${shoulderC.x + nx * halfS} ${shoulderC.y + ny * halfS - 2} ` +
    `L ${hipC.x + nx * (halfH + (L.skirt ? 8 : 0))} ${by} Q ${hipC.x} ${by + 7} ${hipC.x - nx * (halfH + (L.skirt ? 8 : 0))} ${by} Z`;
  const armLine = sleeve ? t(OUTLINE) : undefined;
  const armFill = t(sleeve ?? BLACK);
  const foot = (leg: any) => <Cap a={leg.a} b={leg.toe} w={19} c={legC} />;
  return (
    <g>
      <Limb a={J.farArm.s} b={J.farArm.e} c={J.farArm.h} w={armW} fill={armFill} line={armLine} />
      <circle cx={J.farArm.h.x} cy={J.farArm.h.y} r={10} fill={t(BLACK)} />
      <Limb a={J.farLeg.hip} b={J.farLeg.k} c={J.farLeg.a} w={legW} fill={legC} />
      {foot(J.farLeg)}
      <Limb a={J.nearLeg.hip} b={J.nearLeg.k} c={J.nearLeg.a} w={legW} fill={legC} />
      {foot(J.nearLeg)}
      <path d={`M${J.neck.x} ${J.neck.y} L${J.head.x} ${J.head.y}`} stroke={t(BLACK)} strokeWidth={17} />
      <path d={torso} fill={t(L.torso ?? BLACK)} stroke={L.torso ? t(OUTLINE) : 'none'} strokeWidth={L.torso ? 3 : 0} strokeLinejoin="round" />
      {!tone && L.torso && <path d={torso} fill="url(#rigShade)" />}
      {!tone && L.tie && <path d={`M${shoulderC.x - 5 + (J.fr < 0.5 ? 10 : 0)} ${shoulderC.y - 4} l10 0 l3 74 l-8 14 l-8 -14 Z`} fill={L.tie} />}
      {!tone && L.buttons && [22, 50, 78, 106].map((d) => <circle key={d} cx={lerp(shoulderC.x, hipC.x, d / 125) + (J.fr < 0.5 ? 8 : 0)} cy={lerp(shoulderC.y, hipC.y, d / 125)} r={3.6} fill={BRASS} />)}
      {!tone && L.tag && <rect x={shoulderC.x + 3} y={shoulderC.y + 26} width={14} height={6} rx={2} fill="#f2d98c" />}
      {!tone && L.belt && <rect x={hipC.x - halfH} y={hipC.y - 8} width={halfH * 2} height={7} rx={3} fill={L.belt} />}
      <circle cx={J.head.x} cy={J.head.y} r={R} fill={t(BLACK)} />
      <HeadItem L={L} J={J} tone={tone} />
      <Limb a={J.nearArm.s} b={J.nearArm.e} c={J.nearArm.h} w={armW} fill={armFill} line={armLine} />
      {hold?.(J)}
      <circle cx={J.nearArm.h.x} cy={J.nearArm.h.y} r={10.5} fill={t(BLACK)} />
    </g>
  );
};

const HeadItem: React.FC<{L: Look; J: Joints; tone?: string}> = ({L, J, tone}) => {
  const t = (c: string) => tone ?? c;
  const {x, y} = J.head;
  const k = R / 60;
  const place = `translate(${x} ${y - (L.item === 'cap' ? 12 : 0)}) scale(${k}) translate(0 372)`;
  return (
    <g transform={place}>
      {L.item === 'cap' && (
        <>
          <path d="M-59 -394 A 60 60 0 0 1 59 -394 L 92 -390 Q 94 -383 86 -383 L -58 -386 Z" fill={t('#c9362d')} />
          {!tone && <path d="M-46 -412 Q -6 -436 30 -424" stroke="#ffffff" strokeOpacity={0.14} strokeWidth={5} fill="none" strokeLinecap="round" />}
        </>
      )}
      {L.item === 'helmet' && <path d="M-70 -390 A 68 68 0 0 1 70 -390 L 90 -380 L -90 -380 Z" fill={t('#a8362a')} />}
      {L.item === 'hat' && <path d="M-84 -398 L 84 -398 L 52 -410 L 46 -448 L -46 -448 L -52 -410 Z" fill={t('#10343a')} />}
      {L.item === 'tufts' && (
        <>
          <circle cx={-62} cy={-380} r={15} fill={t('#a0a3a9')} />
          <circle cx={62} cy={-380} r={15} fill={t('#a0a3a9')} />
        </>
      )}
      {L.item === 'slick' && <path d="M-60 -386 A 60 60 0 0 1 60 -386 Q 10 -422 -60 -386 Z" fill={t('#38312a')} />}
      {L.item === 'bun' && <circle cx={0} cy={-440} r={21} fill={t(BLACK)} />}
      {L.item === 'curls' && [-48, -25, 0, 25, 48].map((cx) => <circle key={cx} cx={cx} cy={-420 + Math.abs(cx) * 0.4} r={20} fill={t('#17171f')} />)}
      {L.item === 'bob' && <path d="M-70 -332 Q -82 -442 0 -440 Q 82 -442 70 -332 L 52 -338 Q 52 -400 0 -406 Q -52 -400 -52 -338 Z" fill={t('#17171f')} />}
    </g>
  );
};

export type Eyes = 'dot' | 'half' | 'wide' | 'closed' | 'happy' | 'angry' | 'sad';
export type Brow = 'none' | 'flat' | 'worry' | 'cross' | 'high';
export type Mouth = 'flat' | 'smile' | 'smirk' | 'frown' | 'wave' | 'o' | 'ah' | 'ee' | 'none';
export type FaceKey = {at: number; eyes?: Eyes; brow?: Brow; mouth?: Mouth; look?: number; lookY?: number; fade?: number};
type FaceState = {eyes: Eyes; brow: Brow; mouth: Mouth; look: number; lookY: number};

const EyesPart: React.FC<{s: FaceState; blink: boolean}> = ({s, blink}) => {
  const fx = s.look * 19;
  const fy = s.lookY * 9 - 6;
  const gap = 19 * (1 - 0.32 * Math.abs(s.look));
  const farScale = 1 - 0.22 * Math.abs(s.look);
  const kind = blink && s.eyes !== 'closed' && s.eyes !== 'happy' ? 'closed' : s.eyes;
  const one = (sd: number) => {
    const isFar = (s.look > 0 && sd < 0) || (s.look < 0 && sd > 0);
    const k = isFar ? farScale : 1;
    const cx = fx + sd * gap;
    switch (kind) {
      case 'wide':
        return (
          <g key={sd} transform={`translate(${cx} ${fy}) scale(${k})`}>
            <circle r={11.5} fill={CREAM} />
            <circle cx={s.look * 3.5} cy={s.lookY * 2} r={4} fill={BLACK} />
          </g>
        );
      case 'closed':
        return <path key={sd} d={`M${cx - 9 * k} ${fy - 1} q ${9 * k} 7 ${18 * k} 0`} stroke={CREAM} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case 'happy':
        return <path key={sd} d={`M${cx - 10 * k} ${fy + 2} q ${10 * k} -11 ${20 * k} 0`} stroke={CREAM} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case 'half':
      case 'angry':
      case 'sad': {
        const tilt = kind === 'angry' ? -14 * sd : kind === 'sad' ? 13 * sd : 0;
        return (
          <g key={sd} transform={`translate(${cx} ${fy}) rotate(${tilt}) scale(${k})`}>
            <path d="M-10.5 0 H 10.5 A 10.5 8.5 0 0 1 -10.5 0 Z" fill={CREAM} />
            <rect x={-13} y={-4} width={26} height={5} rx={2.5} fill={CREAM} />
          </g>
        );
      }
      default:
        return <circle key={sd} cx={cx} cy={fy} r={6 * k} fill={CREAM} />;
    }
  };
  return <>{[-1, 1].map(one)}</>;
};

const BrowPart: React.FC<{s: FaceState}> = ({s}) => {
  if (s.brow === 'none') return null;
  const fx = s.look * 19;
  const fy = s.lookY * 9 - 25;
  const gap = 19 * (1 - 0.32 * Math.abs(s.look));
  const tilt = s.brow === 'worry' ? 13 : s.brow === 'cross' ? -16 : 0;
  const up = s.brow === 'high' ? -5 : 0;
  return (
    <>
      {[-1, 1].map((sd) => (
        <path key={sd} d="M-9 0 Q 0 -2.5 9 0" transform={`translate(${fx + sd * gap} ${fy + up}) rotate(${tilt * sd})`} stroke={CREAM} strokeWidth={4.4} fill="none" strokeLinecap="round" />
      ))}
    </>
  );
};

export const MouthPart: React.FC<{m: Mouth; look: number; lookY: number}> = ({m, look, lookY}) => {
  const fx = look * 19;
  const y = lookY * 9 + 22;
  const stroke = {stroke: CREAM, strokeWidth: 4.4, fill: 'none', strokeLinecap: 'round'} as const;
  switch (m) {
    case 'smile':
      return <path d={`M${fx - 13} ${y - 3} q 13 11 26 0`} {...stroke} />;
    case 'smirk':
      return <path d={`M${fx - 11} ${y + 2} q 14 5 24 -7`} {...stroke} />;
    case 'frown':
      return <path d={`M${fx - 11} ${y + 3} q 11 -9 22 0`} {...stroke} />;
    case 'wave':
      return <path d={`M${fx - 12} ${y} q 6 -4 12 0 t 12 0`} {...stroke} />;
    case 'o':
      return <ellipse cx={fx} cy={y} rx={7.5} ry={9} fill="#2a1518" stroke={CREAM} strokeWidth={4} />;
    case 'ah':
      return <ellipse cx={fx} cy={y + 1} rx={10} ry={8} fill="#2a1518" stroke={CREAM} strokeWidth={3.8} />;
    case 'ee':
      return <ellipse cx={fx} cy={y} rx={12} ry={3.6} fill="#2a1518" stroke={CREAM} strokeWidth={3.4} />;
    case 'none':
      return null;
    default:
      return <path d={`M${fx - 10} ${y} H ${fx + 10}`} {...stroke} />;
  }
};

const faceBase: FaceState = {eyes: 'dot', brow: 'none', mouth: 'flat', look: 0.25, lookY: 0};

const FacePart: React.FC<{track: FaceKey[]; frame: number; viseme?: Mouth; seed: string}> = ({track, frame, viseme, seed}) => {
  let cur = faceBase;
  let prev = faceBase;
  let fade = 0;
  let since = 1e9;
  for (const k of track) {
    if (k.at > frame) break;
    prev = cur;
    const {at: _a, fade: fd, ...rest} = k;
    cur = {...cur, ...rest};
    fade = fd ?? 4;
    since = frame - k.at;
  }
  const blinkEvery = 170 + Math.floor(random(`b${seed}`) * 90);
  const blink = (frame + Math.floor(random(`c${seed}`) * 100)) % blinkEvery < 3;
  const p = fade <= 0 ? 1 : Math.min(1, since / fade);
  const layer = (s: FaceState, o: number, key: string) =>
    o <= 0.01 ? null : (
      <g key={key} opacity={o}>
        <EyesPart s={s} blink={blink} />
        <BrowPart s={s} />
        {!viseme && <MouthPart m={s.mouth} look={s.look} lookY={s.lookY} />}
      </g>
    );
  return (
    <>
      {layer(prev, 1 - p, 'prev')}
      {layer(cur, p, 'cur')}
      {viseme && <MouthPart m={viseme} look={cur.look} lookY={cur.lookY} />}
    </>
  );
};

export type PuppetProps = {
  look: string;
  x: number;
  y: number;
  s?: number;
  frame: number;
  track?: Key[];
  face?: FaceKey[];
  walks?: Walk[];
  visemes?: [number, Mouth][]; // [frame, shape], held until the next
  start?: Pose;
  rim?: string;
  light?: [number, number];
  floorShadow?: boolean;
  wallShadow?: boolean;
  highlight?: boolean; // the thin stroke on the head's dark side, for close-ups
  sway?: number; // gentle drift while holding a pose; about half a percent of the head
  hold?: (J: Joints) => React.ReactNode;
  id?: string;
  lookDef?: Look; // a film's own costume, instead of a name from LOOKS
  lift?: number; // raises the body off the floor while the floor shadow stays on the floor
};

export const RigDefs: React.FC = () => (
  <defs>
    <linearGradient id="rigShade" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0.3" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.36" />
    </linearGradient>
    <filter id="rigSoft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <filter id="rigSoftFloor" x="-60%" y="-160%" width="220%" height="420%">
      <feGaussianBlur stdDeviation="7" />
    </filter>
  </defs>
);

export const Puppet: React.FC<PuppetProps> = ({look, x, y, s = 1, frame, track = [], face = [], walks = [], visemes, start, rim = '#e8a25a', light, floorShadow, wallShadow, highlight, sway = 1, hold, id, lookDef, lift = 0}) => {
  const L = lookDef ?? LOOKS[look] ?? LOOKS.extra;
  let pose = poseAt(track, frame, start ?? NEUTRAL);
  const walk = walks.find((w) => frame >= w.from && frame < w.to);
  const lastWalk = walks.filter((w) => frame >= w.to).pop();
  if (walk) pose = walkPose(walk, frame, pose);
  else if (lastWalk) {
    // Coming out of a walk: keep where the walk ended, and let the feet settle over a few frames.
    const t = Math.min(1, (frame - lastWalk.to) / 5);
    const from = walkPose(lastWalk, lastWalk.to, pose);
    pose = {
      ...pose,
      rootX: lastWalk.x1 + pose.rootX,
      dir: Math.abs(pose.dir) < 1 && frame - lastWalk.to < 5 ? pose.dir : pose.dir,
      nearFoot: [lerp(from.nearFoot[0], pose.nearFoot[0], t), lerp(from.nearFoot[1], pose.nearFoot[1], t)],
      farFoot: [lerp(from.farFoot[0], pose.farFoot[0], t), lerp(from.farFoot[1], pose.farFoot[1], t)],
      nearToe: lerp(from.nearToe, pose.nearToe, t),
      farToe: lerp(from.farToe, pose.farToe, t),
      rootY: lerp(from.rootY, pose.rootY, t),
    };
  }
  // Holding is not frozen: a slow drift, measured at about half a percent of the head's radius on close-ups.
  const seed = id ?? look;
  const ph = random(`sw${seed}`) * 6.28;
  const dr = Math.sin(frame / 22 + ph) * sway;
  pose = {...pose, lean: pose.lean + dr * 0.5, headX: pose.headX + dr * 0.8, near: [pose.near[0] + dr * 0.9, pose.near[1]], far: [pose.far[0] - dr * 0.6, pose.far[1]]};
  const J = solve(pose);
  const dirS = Math.abs(pose.dir) < 0.12 ? 0.12 * (pose.dir < 0 ? -1 : 1) : pose.dir;
  const wx = x + pose.rootX * s;
  // Rim light: the silhouette again, pushed toward the light by 6 percent of the head, in the same flip as the body.
  const hx = wx;
  const hy = y - 300 * s;
  const lx = light ? light[0] - hx : 300;
  const ly = light ? light[1] - hy : -300;
  const len = Math.hypot(lx, ly) || 1;
  const rimX = ((lx / len) * 6.2) / dirS;
  const rimY = (ly / len) * 6.2;
  const shadowX = -(lx / len);
  let mouth: Mouth | undefined;
  if (visemes) {
    for (const [at, m] of visemes) {
      if (at > frame) break;
      mouth = m;
    }
  }
  const lightSide = (lx / len) * dirS > 0;
  return (
    <>
      {wallShadow && (
        <g transform={`translate(${wx + shadowX * 80 * s} ${y - 12}) scale(${dirS * s * 1.05} ${s * 1.05})`} opacity={0.3} filter="url(#rigSoft)">
          <Silhouette J={J} L={L} tone="#000" />
        </g>
      )}
      {floorShadow && <ellipse cx={wx + shadowX * 36 * s} cy={y + 3} rx={82 * s} ry={13 * s} fill="#000" opacity={0.5 / (1 + lift / 120)} filter="url(#rigSoftFloor)" />}
      <g transform={`translate(${wx} ${y - lift}) scale(${dirS * s} ${s})`}>
        <g transform={`translate(${rimX} ${rimY})`}>
          <Silhouette J={J} L={L} tone={rim} />
        </g>
        <Silhouette J={J} L={L} hold={hold} />
        {highlight && <path d={`M${J.head.x - (lightSide ? 37 : -37)} ${J.head.y - 12} Q ${J.head.x - (lightSide ? 32 : -32)} ${J.head.y - 30} ${J.head.x - (lightSide ? 15 : -15)} ${J.head.y - 40}`} stroke={rim} strokeOpacity={0.55} strokeWidth={1.8} fill="none" strokeLinecap="round" />}
        {!L.faceless && (
          <g transform={`translate(${J.head.x} ${J.head.y})`}>
            <FacePart track={face} frame={frame} viseme={mouth} seed={seed} />
          </g>
        )}
      </g>
    </>
  );
};
