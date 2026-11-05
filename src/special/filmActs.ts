import {P, type Ease, type FaceKey, type Key} from './rig';

// The acting vocabulary for data-built films. A shot names one action; this file turns the name into keys, using the
// frame counts read from the reference (docs/whatif/REPLICATION_GUIDE.md, section 5): snaps take 2 frames, leans 6 to 8,
// a return is 70% done in 3 frames, and everything then holds for 20 frames or more. No bouncing.
export type Act = {
  a: string; // action name below, or any pose name in the rig's P table
  at?: number; // shot frame it starts on. Defaults to 6, so a 1.5 s shot still shows it.
  dur?: number;
  ease?: Ease;
  // Free-form arguments, used by the actions that need them.
  to?: number;
  h?: number;
  eyes?: FaceKey['eyes'];
  brow?: FaceKey['brow'];
  mouth?: FaceKey['mouth'];
  look?: number;
  lookY?: number;
  fade?: number;
  n?: number;
};

export type LiftKey = {at: number; to: number; dur: number; kind: 'rise' | 'fall'};
export type Acting = {track: Key[]; face: FaceKey[]; lift: LiftKey[]};

const faceOf = (a: Act, fade: number, at: number): FaceKey => {
  const k: FaceKey = {at, fade: a.fade ?? fade};
  if (a.eyes) k.eyes = a.eyes;
  if (a.brow) k.brow = a.brow;
  if (a.mouth) k.mouth = a.mouth;
  if (a.look !== undefined) k.look = a.look;
  if (a.lookY !== undefined) k.lookY = a.lookY;
  return k;
};

type Builder = (a: Act, at: number, out: Acting) => void;

const LIB: Record<string, Builder> = {
  // Face only. A reaction close-up may be nothing but this, and the guide says that is fine.
  face: (a, at, o) => {
    o.face.push(faceOf(a, 4, at));
  },
  // One-frame change, for a beat that lands.
  snapFace: (a, at, o) => {
    o.face.push(faceOf(a, 1, at));
  },
  // A head turn is a crossfade of the features to a new place, with a small body answer.
  turn: (a, at, o) => {
    o.face.push(faceOf({...a, look: a.look ?? a.to ?? -0.5}, 4, at));
    o.track.push({at, headX: (a.look ?? a.to ?? -0.5) * 5, ease: 'io', dur: 6});
  },
  lookUp: (a, at, o) => {
    o.face.push(faceOf({...a, lookY: a.lookY ?? -1, look: a.look ?? 0.2}, 3, at));
    o.track.push({at, headY: -4, lean: -3, ease: 'io', dur: 6});
  },
  lookDown: (a, at, o) => {
    o.face.push(faceOf({...a, lookY: a.lookY ?? 0.9}, 3, at));
    o.track.push({at, headY: 5, ease: 'io', dur: 6});
  },
  // Lean forward: accelerates in over 7 frames.
  lean: (a, at, o) => {
    o.track.push({at, pose: 'leanIn', ease: 'in', dur: a.dur ?? 7});
    if (a.eyes || a.mouth || a.brow) o.face.push(faceOf(a, 4, at));
  },
  // Return from a lean: 70% of the way in three frames, then a long tail.
  back: (a, at, o) => {
    o.track.push({at, pose: 'stand', ease: 'out', dur: a.dur ?? 8});
  },
  flinch: (a, at, o) => {
    o.track.push({at, lean: -9, headX: -5, near: [30, 110], ease: 'snap', dur: 2});
    o.face.push(faceOf({eyes: 'wide', brow: 'high', mouth: 'o', ...a}, 1, at));
  },
  // Group or solo collapse into a doubled-over hold: four frames.
  doubleOver: (a, at, o) => {
    o.track.push({at, lean: 38, headX: 22, headY: 18, rootY: 24, near: [16, 26], far: [8, 30], ease: 'io', dur: 4});
    o.face.push(faceOf({eyes: 'happy', mouth: 'ah', ...a}, 2, at));
  },
  sigh: (a, at, o) => {
    o.face.push({at, eyes: 'closed', fade: 5});
    o.track.push({at, rootY: 9, ease: 'slow', dur: 12});
    o.face.push({at: at + 16, eyes: a.eyes ?? 'half', fade: 3});
    o.track.push({at: at + 16, rootY: 0, ease: 'io', dur: 6});
  },
  nod: (_a, at, o) => {
    o.track.push({at, headY: 7, ease: 'io', dur: 3}, {at: at + 4, headY: 0, ease: 'out', dur: 5});
  },
  // Sustained swing, about 24 frames per swing, with the head going along.
  wave: (a, at, o) => {
    const n = a.n ?? 3;
    for (let i = 0; i < n; i++) {
      const up = i % 2 === 0;
      o.track.push({at: at + i * 24, near: up ? [150, -24] : [128, 22], headX: up ? 3 : -3, ease: 'slow', dur: 24});
    }
  },
  // Small repeated hand move at a table: eating, writing, stirring.
  fuss: (a, at, o) => {
    const n = a.n ?? 6;
    for (let i = 0; i < n; i++) o.track.push({at: at + i * 9, near: i % 2 ? [54, 40] : [48, 58], ease: 'io', dur: 6});
  },
  // Off the floor and back. Rising eases in over 8 frames; falling is a gravity curve and lands with a dip.
  rise: (a, at, o) => {
    o.lift.push({at, to: a.h ?? 60, dur: a.dur ?? 8, kind: 'rise'});
  },
  fall: (a, at, o) => {
    const dur = a.dur ?? 5;
    o.lift.push({at, to: 0, dur, kind: 'fall'});
    o.track.push({at: at + dur, rootY: 16, ease: 'snap', dur: 2}, {at: at + dur + 3, rootY: 0, ease: 'out', dur: 8});
  },
};

// Everything in `acts`, in time order, so that later keys build on earlier ones.
export const expandActs = (acts: Act[] = []): Acting => {
  const out: Acting = {track: [], face: [], lift: []};
  const sorted = [...acts].map((a) => ({...a, at: a.at ?? 6})).sort((x, y) => x.at - y.at);
  for (const a of sorted) {
    const b = LIB[a.a];
    if (b) b(a, a.at, out);
    else if (P[a.a]) {
      out.track.push({at: a.at, pose: a.a, ease: a.ease ?? 'io', dur: a.dur});
      if (a.eyes || a.mouth || a.brow || a.look !== undefined || a.lookY !== undefined) out.face.push(faceOf(a, 3, a.at));
    } else {
      throw new Error(`Unknown action "${a.a}". Add it to filmActs.ts or to the P table in rig.tsx.`);
    }
  }
  return out;
};

export const liftAt = (keys: LiftKey[], f: number): number => {
  let h = 0;
  for (const k of keys) {
    if (k.at > f) break;
    const t = Math.min(1, (f - k.at) / Math.max(1, k.dur));
    const e = k.kind === 'fall' ? t * t : 1 - (1 - t) ** 2;
    h = h + (k.to - h) * e;
  }
  return h;
};
