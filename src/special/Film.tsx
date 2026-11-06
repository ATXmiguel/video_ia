import React from 'react';
import {AbsoluteFill, Html5Audio, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '../ui/fonts';
import type {Look} from './Sil';
import {Puppet, RigDefs, type FaceKey, type Key, type Mouth, type Walk} from './rig';
import {expandActs, liftAt, type Act} from './filmActs';
import {PropView, type PropDef} from './filmProps';
import {SETS} from './filmSets';
import {Fore, Motes, PopPill, TornWipe, WoodDesk, WorldDefs} from './world';
import {BR_DEFS} from './filmPropsBR';

// A film built from data. scripts/make_film.py lays the voice out first, places each shot's cut against it and writes
// the result as this component's props. Nothing here knows about any one film: a shot only says what kind it is, what
// is in it and what its one action is. Camera defaults by kind are the measured ones (docs/whatif/REPLICATION_GUIDE.md).
export type Kind = 'wide' | 'medium' | 'close' | 'rack' | 'top' | 'insert' | 'data';

export type CastEntry = {
  who: string;
  x?: number;
  y?: number;
  s?: number;
  dir?: number;
  pose?: string;
  key?: Partial<Key>; // anything the starting pose should override
  face?: Omit<FaceKey, 'at'>;
  acts?: Act[];
  walks?: Walk[];
  slide?: {from: number; to: number; x0: number; x1: number}; // the whole body rides along, feet still: on a moto
  hold?: PropDef & {until?: number};
  behind?: boolean; // behind the set's front furniture (staff behind a counter)
  plane?: 'near' | 'far'; // for a rack shot
  sway?: number;
  floorShadow?: boolean;
  wallShadow?: boolean;
};

export type Shot = {
  id: string;
  kind: Kind;
  action: string; // the one action, in words. Required: it is what the shot is for.
  start: number; // frames, from the builder
  dur: number;
  set?: string;
  cx?: number;
  cy?: number;
  to?: number; // pan: cx moves to this over the shot
  z?: number;
  push?: number; // %/s
  step?: {at: number; to: number; dur?: number; toFocus?: [number, number]};
  focus?: [number, number]; // top and insert shots: the point the lens looks at
  blur?: number;
  rim?: string;
  light?: [number, number];
  surface?: 'wood' | 'dark';
  cast?: CastEntry[];
  props?: PropDef[];
  motes?: boolean;
  fore?: {d: string; blur?: number; c?: string; vx?: number};
  pill?: {text: string; x: number; y: number; at?: number; to?: [number, number]; dark?: boolean};
  rack?: {at: number; dur?: number; to: 'near' | 'far'};
  trans?: 'cut' | 'torn' | 'dissolve' | 'fade';
  transLen?: number;
  sfx?: {s: string; at?: number; v?: number; len?: number}[];
  ff?: number; // props run this many frames ahead: a second angle of something that has already played out
};

export type FilmLine = {id: string; who: string; text: string; start: number; frames: number; audio: string; visemes: [number, Mouth][]};
export type FilmBuild = {
  frames: number;
  fade?: number;
  looks: Record<string, Look>;
  lines: FilmLine[];
  shots: Shot[];
  bed: string;
  room: string;
  bedVolume?: number;
  roomVolume?: number;
};

export const filmFrames = (b: FilmBuild) => b.frames ?? 240;

const KIND: Record<Kind, {z: number; push: number; blur: number; vignette: number}> = {
  wide: {z: 1.12, push: 1, blur: 0, vignette: 0.42},
  medium: {z: 1.7, push: 0.15, blur: 3, vignette: 0.4},
  close: {z: 1.25, push: 0, blur: 9, vignette: 0.26},
  rack: {z: 1.2, push: 0, blur: 9, vignette: 0.3},
  top: {z: 1.25, push: 1.3, blur: 0, vignette: 0.5},
  insert: {z: 1.25, push: 2.2, blur: 9, vignette: 0.42},
  data: {z: 1, push: 0.15, blur: 0, vignette: 0.34},
};

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const io = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SvgLayer: React.FC<{children: React.ReactNode; blur?: number; style?: React.CSSProperties}> = ({children, blur = 0, style}) => (
  <AbsoluteFill style={{filter: blur > 0.2 ? `blur(${blur}px)` : undefined, ...style}}>
    <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      <WorldDefs />
      <RigDefs />
      <BR_DEFS />
      {children}
    </svg>
  </AbsoluteFill>
);

const Cam: React.FC<{cx: number; cy: number; z: number; par?: number; children: React.ReactNode}> = ({cx, cy, z, par = 1, children}) => (
  <g transform={`translate(960 540) scale(${z}) translate(${-(960 + (cx - 960) * par)} ${-cy})`}>{children}</g>
);

const camOf = (s: Shot, f: number) => {
  const k = KIND[s.kind];
  const z0 = s.z ?? k.z;
  const push = s.push ?? k.push;
  let z = z0 * (1 + ((push / 100) * f) / 24);
  let focus = s.focus ?? ([960, 540] as [number, number]);
  if (s.step) {
    const t = io(clamp01((f - s.step.at) / (s.step.dur ?? 12)));
    z *= lerp(1, s.step.to, t);
    if (s.step.toFocus) focus = [lerp(focus[0], s.step.toFocus[0], t), lerp(focus[1], s.step.toFocus[1], t)];
  }
  const cx = s.to !== undefined ? lerp(s.cx ?? 960, s.to, f / s.dur) : s.cx ?? 960;
  return {z, cx, cy: s.cy ?? 540, focus};
};

const SetBack: React.FC<{s: Shot; f: number; z: number; cx: number; cy: number}> = ({s, f, z, cx, cy}) => {
  const set = SETS[s.set ?? ''];
  if (!set) throw new Error(`Shot ${s.id}: unknown set "${s.set}"`);
  const blur = s.blur ?? KIND[s.kind].blur;
  const Wall = set.wall;
  const Ground = set.ground;
  const Props = set.props;
  return (
    <SvgLayer blur={blur}>
      <g style={{filter: set.grade.filter}}>
        <Cam cx={cx} cy={cy} z={z} par={set.par}>
          <Wall frame={f} />
        </Cam>
        <Cam cx={cx} cy={cy} z={z}>
          <Ground />
          {Props && blur < 6 && <Props />}
        </Cam>
      </g>
    </SvgLayer>
  );
};

const Grade: React.FC<{s: Shot; z: number; cx: number}> = ({s, z, cx}) => {
  const set = SETS[s.set ?? ''];
  const {width, height} = useVideoConfig();
  const seen = (1080 * width) / height; // how much of the 1920-wide stage this frame shows
  const l = s.light ?? set.light;
  // Close and rack shots stand in screen space, so their light stays where the shot put it.
  const lx = s.kind === 'close' || s.kind === 'rack' ? l[0] : 960 + (l[0] - cx) * z;
  const ly = Math.max(-200, Math.min(1000, l[1]));
  const pos = `${((lx - (1920 - seen) / 2) / seen) * 100}% ${(ly / 1080) * 100}%`;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 95% at ${pos}, #ffffff 0%, #fbf7ee 30%, ${set.grade.edge} 100%)`, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 50% at ${pos}, ${set.grade.glowColor} 0%, transparent 100%)`, mixBlendMode: 'screen', opacity: set.grade.glow}} />
    </>
  );
};

const CLOSE_DEFAULT = {x: 980, y: 1886, s: 3.4};

const Performer: React.FC<{c: CastEntry; i: number; s: Shot; f: number; lines: FilmLine[]; looks: FilmBuild['looks']; global: number}> = ({c, i, s, f, lines, looks, global}) => {
  const set = SETS[s.set ?? ''];
  const screen = s.kind === 'close' || s.kind === 'rack';
  const acting = expandActs(c.acts);
  const first: Key = {at: 0, dur: 0, pose: c.pose ?? (s.kind === 'close' ? 'front' : 'stand'), dir: c.dir ?? 1, ...(c.key ?? {})};
  const track = [first, ...acting.track];
  const face: FaceKey[] = [{at: 0, fade: 0, ...(c.face ?? {})}, ...acting.face];
  // Mouths follow the voice only while that person's line is playing; otherwise the face's own mouth shows.
  const line = lines.find((l) => l.who === c.who && global >= l.start && global < l.start + l.frames + 2);
  const visemes = line ? (line.visemes.map(([at, m]) => [at + line.start - s.start, m]) as [number, Mouth][]) : undefined;
  const hold = c.hold;
  const slideX = c.slide ? lerp(c.slide.x0, c.slide.x1, clamp01((f - c.slide.from) / Math.max(1, c.slide.to - c.slide.from))) : 0;
  return (
    <Puppet
      id={`${s.id}${i}`}
      look={c.who}
      lookDef={looks[c.who]}
      x={(c.x ?? (s.kind === 'close' ? CLOSE_DEFAULT.x : 960)) + slideX}
      y={c.y ?? (s.kind === 'close' ? CLOSE_DEFAULT.y : set.floor)}
      s={c.s ?? (s.kind === 'close' ? CLOSE_DEFAULT.s : 1)}
      frame={f}
      track={track}
      face={face}
      walks={c.walks}
      visemes={visemes}
      rim={s.rim ?? set.rim}
      light={s.light ?? set.light}
      floorShadow={c.floorShadow ?? !screen}
      wallShadow={c.wallShadow ?? false}
      highlight={screen}
      sway={c.sway ?? (screen ? 0.7 : 1)}
      lift={liftAt(acting.lift, f)}
      hold={
        hold && (hold.until === undefined || f < hold.until)
          ? (J: any) => (
              <g transform={`translate(${J.nearArm.h.x} ${J.nearArm.h.y})`}>
                <PropView d={hold} f={f} />
              </g>
            )
          : undefined
      }
    />
  );
};

const PillLayer: React.FC<{s: Shot; f: number}> = ({s, f}) =>
  s.pill ? (
    <SvgLayer>
      <PopPill text={s.pill.text} x={s.pill.x} y={s.pill.y} since={f - (s.pill.at ?? 6)} to={s.pill.to} dark={s.pill.dark ?? true} />
    </SvgLayer>
  ) : null;

const props = (s: Shot, f: number, layer: 'back' | 'front') => (s.props ?? []).filter((p) => (p.layer ?? 'front') === layer).map((p, i) => <PropView key={`${layer}${i}`} d={p} f={f + (s.ff ?? 0)} />);

const WorldShot: React.FC<{s: Shot; f: number; b: FilmBuild; global: number}> = ({s, f, b, global}) => {
  const {z, cx, cy} = camOf(s, f);
  const set = SETS[s.set ?? ''];
  const Front = set.front;
  const cast = s.cast ?? [];
  const perf = (c: CastEntry, i: number) => <Performer key={i} c={c} i={i} s={s} f={f} lines={b.lines} looks={b.looks} global={global} />;
  return (
    <AbsoluteFill>
      <SetBack s={s} f={f} z={z} cx={cx} cy={cy} />
      <Grade s={s} z={z} cx={cx} />
      <SvgLayer>
        <Cam cx={cx} cy={cy} z={z}>
          {props(s, f, 'back')}
          {cast.map((c, i) => (c.behind ? perf(c, i) : null))}
          {Front && <Front />}
          {cast.map((c, i) => (!c.behind ? perf(c, i) : null))}
          {props(s, f, 'front')}
        </Cam>
      </SvgLayer>
      {s.fore && <Fore d={s.fore.d} blur={s.fore.blur ?? 18} c={s.fore.c} dx={(s.fore.vx ?? 0) * f} />}
    </AbsoluteFill>
  );
};

// Screen-space shots: the camera is on the set behind, and the people stand where the shot puts them.
const CloseShot: React.FC<{s: Shot; f: number; b: FilmBuild; global: number}> = ({s, f, b, global}) => {
  const {z, cx, cy} = camOf(s, f);
  const rack = s.rack ? io(clamp01((f - s.rack.at) / (s.rack.dur ?? 12))) : 0;
  const toFar = s.rack?.to === 'far';
  const cast = s.cast ?? [];
  const plane = (name: 'near' | 'far' | undefined) => cast.map((c, i) => ((c.plane ?? undefined) === name ? <Performer key={i} c={c} i={i} s={s} f={f} lines={b.lines} looks={b.looks} global={global} /> : null));
  return (
    <AbsoluteFill>
      <SetBack s={s} f={f} z={z} cx={cx} cy={cy} />
      <Grade s={s} z={z} cx={cx} />
      {s.kind === 'rack' && <SvgLayer blur={toFar ? 8 - rack * 8 : rack * 8}>{plane('far')}</SvgLayer>}
      <SvgLayer>
        {props(s, f, 'back')}
        {plane(undefined)}
      </SvgLayer>
      {s.kind === 'rack' && <SvgLayer blur={toFar ? rack * 12 : 12 - rack * 12}>{plane('near')}</SvgLayer>}
      <SvgLayer>{props(s, f, 'front')}</SvgLayer>
      {s.fore && <Fore d={s.fore.d} blur={s.fore.blur ?? 18} c={s.fore.c} dx={(s.fore.vx ?? 0) * f} />}
    </AbsoluteFill>
  );
};

const TopShot: React.FC<{s: Shot; f: number}> = ({s, f}) => {
  const {z, focus} = camOf(s, f);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <SvgLayer>
        <g transform={`translate(960 540) scale(${z}) translate(${-focus[0]} ${-focus[1]})`}>
          <WoodDesk dark={s.surface === 'dark'} />
          {props(s, f, 'back')}
          {props(s, f, 'front')}
          {s.motes && <Motes frame={f} seed={s.id} />}
        </g>
      </SvgLayer>
    </AbsoluteFill>
  );
};

const InsertShot: React.FC<{s: Shot; f: number}> = ({s, f}) => {
  const {z, cx, cy, focus} = camOf(s, f);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {s.set && <SetBack s={s} f={f} z={1.25} cx={cx} cy={cy} />}
      {s.set && <Grade s={s} z={1.25} cx={cx} />}
      <SvgLayer>
        <g transform={`translate(960 540) scale(${z}) translate(${-focus[0]} ${-focus[1]})`}>
          {props(s, f, 'back')}
          {props(s, f, 'front')}
        </g>
      </SvgLayer>
    </AbsoluteFill>
  );
};

// Dark data scenes and full-screen phones: a dark room of its own, with the idea drawn on top.
const DataShot: React.FC<{s: Shot; f: number}> = ({s, f}) => {
  const {z, focus} = camOf(s, f);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 45%, #18283a 0%, #0b121a 62%, #070b10 100%)'}}>
      <SvgLayer>
        <g transform={`translate(960 540) scale(${z}) translate(${-focus[0]} ${-focus[1]})`}>
          {props(s, f, 'back')}
          {props(s, f, 'front')}
          {s.motes && <Motes frame={f * 2.5} seed={s.id} n={80} />}
        </g>
      </SvgLayer>
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{s: Shot; f: number; b: FilmBuild; global: number}> = ({s, f, b, global}) => {
  let view: React.ReactNode;
  if (s.kind === 'data') view = <DataShot s={s} f={f} />;
  else if (s.kind === 'top') view = <TopShot s={s} f={f} />;
  else if (s.kind === 'insert') view = <InsertShot s={s} f={f} />;
  else if (s.kind === 'close' || s.kind === 'rack') view = <CloseShot s={s} f={f} b={b} global={global} />;
  else view = <WorldShot s={s} f={f} b={b} global={global} />;
  return (
    <AbsoluteFill>
      {view}
      <PillLayer s={s} f={f} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 78% 82% at 50% 50%, transparent 46%, rgba(0,0,0,${KIND[s.kind].vignette}) 100%)`}} />
    </AbsoluteFill>
  );
};

const Finish: React.FC<{frame: number}> = ({frame}) => {
  const {width, height} = useVideoConfig();
  return (
    <>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('sfx/grain.png')})`, backgroundPosition: `${Math.floor(random(`gx${frame}`) * 640)}px ${Math.floor(random(`gy${frame}`) * 640)}px`, mixBlendMode: 'overlay', opacity: 0.06}} />
      {width > height && <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: '#000'}} />}
      {width > height && <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: '#000'}} />}
    </>
  );
};

export const Film: React.FC<FilmBuild> = (b) => {
  const frame = useCurrentFrame();
  const {shots, lines, frames} = b;
  let idx = shots.findIndex((s) => frame >= s.start && frame < s.start + s.dur);
  if (idx < 0) idx = Math.max(0, shots.length - 1);
  const s = shots[idx];
  let view: React.ReactNode = null;
  if (s) {
    const f = frame - s.start;
    view = <ShotView s={s} f={f} b={b} global={frame} />;
    const prev = shots[idx - 1];
    const len = s.transLen ?? (s.trans === 'torn' ? 6 : 14);
    // A wipe plays over the head of the new shot, which is already moving behind it. The old shot keeps running.
    if (prev && f < len && s.trans === 'torn') {
      view = <TornWipe from={<ShotView s={prev} f={frame - prev.start} b={b} global={frame} />} to={view} p={(f + 1) / len} />;
    } else if (prev && f < len && s.trans === 'dissolve') {
      view = (
        <AbsoluteFill>
          <ShotView s={prev} f={frame - prev.start} b={b} global={frame} />
          <AbsoluteFill style={{opacity: (f + 1) / len}}>{view}</AbsoluteFill>
        </AbsoluteFill>
      );
    }
  }
  const fade = b.fade ?? 0;
  const out = fade > 0 ? clamp01((frames - 1 - frame) / fade) : 1;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: out}}>{view}</AbsoluteFill>
      <Finish frame={frame} />
      {b.bed && <Html5Audio src={staticFile(b.bed)} volume={b.bedVolume ?? 0.5} />}
      {b.room && <Html5Audio src={staticFile(b.room)} volume={b.roomVolume ?? 0.2} />}
      {lines.map((l) => (
        <Sequence key={l.id} from={l.start} layout="none">
          <Html5Audio src={staticFile(l.audio)} />
        </Sequence>
      ))}
      {shots.flatMap((sh) => [
        ...(sh.trans === 'torn'
          ? [
              <Sequence key={`${sh.id}-w`} from={Math.max(0, sh.start - 2)} durationInFrames={20} layout="none">
                <Html5Audio src={staticFile('sfx/whoosh.mp3')} volume={0.35} />
              </Sequence>,
            ]
          : []),
        ...(sh.sfx ?? []).map((x, i) => (
          <Sequence key={`${sh.id}-${i}`} from={sh.start + (x.at ?? 0)} durationInFrames={x.len ?? 48} layout="none">
            <Html5Audio src={staticFile(`sfx/${x.s}.mp3`)} volume={x.v ?? 0.5} />
          </Sequence>
        )),
      ])}
    </AbsoluteFill>
  );
};
