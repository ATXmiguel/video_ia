import React from 'react';
import {AbsoluteFill, Html5Audio, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '../ui/fonts';
import {Puppet, RigDefs, type Mouth} from './rig';
import {Fore, LobbyDesk, LobbyFloor, LobbyProps, LobbyWall, Motes, PopPill, TopHand, TornWipe, Vending, WoodDesk, WorldDefs} from './world';

// The proof clip: one short scene from our own film (the "fire marshal" gag), told at the reference's pace, with the
// new rig. Everything here is either the rig, the reusable world pieces, or this scene's direction.
type Line = {who: string; audio: string; duration: number; visemes: [number, Mouth][]};
export type ProofBuild = {lines: Record<string, Line>; bed: string; room: string};

const RIM_WARM = '#f0a860';
const SHOTS = {walk: 62, up: 30, ask: 74, bell: 36, sigh: 30, reply: 88, fall: 24, exit: 62, gag: 44};
const starts = (() => {
  let n = 0;
  const o: Record<string, number> = {};
  for (const [k, v] of Object.entries(SHOTS)) {
    o[k] = n;
    n += v;
  }
  return {o, total: n};
})();
export const PROOF_FRAMES = starts.total;

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const io = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const lineVisemes = (l: Line, at: number): [number, Mouth][] => [[0, 'flat'], ...l.visemes.map(([f, m]) => [f + at, m] as [number, Mouth])];

const SvgLayer: React.FC<{children: React.ReactNode; blur?: number; style?: React.CSSProperties}> = ({children, blur = 0, style}) => (
  <AbsoluteFill style={{filter: blur > 0.2 ? `blur(${blur}px)` : undefined, ...style}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      <WorldDefs />
      <RigDefs />
      {children}
    </svg>
  </AbsoluteFill>
);

// World coordinates to screen: the wall sits behind the floor plane, so it moves a little less.
const Cam: React.FC<{cx: number; cy?: number; z: number; par?: number; children: React.ReactNode}> = ({cx, cy = 540, z, par = 1, children}) => (
  <g transform={`translate(960 540) scale(${z}) translate(${-(960 + (cx - 960) * par)} ${-cy})`}>{children}</g>
);

// The desk is in the cast layer so people can stand behind it, so it takes its share of the room's light here.
const DeskLit: React.FC = () => (
  <g style={{filter: 'brightness(0.74) saturate(0.84)'}}>
    <LobbyDesk />
  </g>
);

const Grade: React.FC<{light: [number, number]; cold?: boolean; glow?: number}> = ({light, cold, glow = 0.3}) => (
  <>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 74% 90% at ${(light[0] / 1920) * 100}% ${(light[1] / 1080) * 100}%, #ffffff 0%, #f4efe6 24%, ${cold ? '#6d7580' : '#a08f7d'} 96%)`,
        mixBlendMode: 'multiply',
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 36% 46% at ${(light[0] / 1920) * 100}% ${(light[1] / 1080) * 100}%, #ffd08a 0%, transparent 100%)`,
        mixBlendMode: 'screen',
        opacity: glow,
      }}
    />
  </>
);

const Badge: React.FC<{open: number}> = ({open}) => (
  <g>
    <rect x={-4} y={-26} width={60} height={46} rx={4} fill="#2a1d14" />
    <g transform={`translate(26 -3) scale(${0.25 + 0.75 * open} 1) translate(-26 3)`}>
      <rect x={-4} y={-26} width={60} height={46} rx={4} fill="#3a2a1d" />
      <path d="M26 -20 l13 6 v13 q0 9 -13 14 q-13 -5 -13 -14 v-13 Z" fill="#d9a93f" />
      <circle cx={26} cy={-5} r={4} fill="#7a5a1e" />
    </g>
  </g>
);

const Lobby: React.FC<{cx: number; z: number; frame: number; cy?: number; blur?: number; props?: boolean}> = ({cx, z, frame, cy, blur = 0, props = true}) => (
  <SvgLayer blur={blur}>
    <g style={{filter: 'saturate(0.82) contrast(0.95)'}}>
      <Cam cx={cx} cy={cy} z={z} par={0.84}>
        <LobbyWall frame={frame} />
      </Cam>
      <Cam cx={cx} cy={cy} z={z}>
        <LobbyFloor />
        {props && <LobbyProps />}
      </Cam>
    </g>
  </SvgLayer>
);

// Shot 1: the side-on walk with the camera tracking at the walker's pace, background sliding behind him.
const WalkShot: React.FC<{f: number; l: ProofBuild['lines']}> = ({f}) => {
  const dur = SHOTS.walk;
  const x0 = 460;
  const x1 = 1120;
  const manX = x0 + ((x1 - x0) * f) / dur;
  const cx = 300 + manX * 0.86 + 90 + (f / dur) * 6;
  const z = 1.1 + (f / dur) * 0.012;
  const lightX = 960 + (1560 - cx) * z * 0.72;
  return (
    <AbsoluteFill>
      <Lobby cx={cx} z={z} frame={f} />
      <Grade light={[lightX, 300]} />
      <SvgLayer>
        <Cam cx={cx} z={z}>
          <Puppet id="bg1" look="robe" x={1500} y={876} s={0.84} frame={f} rim={RIM_WARM} light={[1560, 300]} floorShadow walks={[{from: 0, to: 400, x0: 0, x1: -840}]} />
          <Puppet id="bell" look="coworker" x={250} y={862} s={0.86} frame={f} rim={RIM_WARM} light={[1560, 300]} floorShadow face={[{at: 0, eyes: 'dot', mouth: 'flat', look: -0.3}, {at: 26, look: 0.6, mouth: 'smile'}]} track={[{at: 0, pose: 'relaxed', dir: -1, dur: 0}, {at: 10, near: [26, 100], dur: 7}, {at: 34, near: [4, 8], ease: 'out'}]} />
          <Puppet id="man" look="man" x={x0} y={902} s={1.03} frame={f} rim={RIM_WARM} light={[1560, 300]} floorShadow wallShadow walks={[{from: 0, to: 400, x0: 0, x1: (((x1 - x0) / dur) * 400) / 1.03}]} face={[{at: 0, eyes: 'dot', mouth: 'smile', look: 0.55}]} />
        </Cam>
        <Cam cx={cx} z={z}>
          <DeskLit />
        </Cam>
      </SvgLayer>
      <Fore d={`M${-60 - f * 6} 1080 V 620 Q ${40 - f * 6} 590 ${120 - f * 6} 700 L ${180 - f * 6} 1080 Z`} blur={20} />
    </AbsoluteFill>
  );
};

// Close-up behind the counter. Head about 340 across at 1080p, the middle of the measured range.
const HeroClose: React.FC<{f: number; dur: number; face: any[]; track?: any[]; visemes?: [number, Mouth][]}> = ({f, dur, face, track, visemes}) => {
  const z = 1.25;
  return (
    <AbsoluteFill>
      <Lobby cx={1880} cy={470} z={z} frame={f} blur={9} props={false} />
      <Grade light={[1110, 240]} />
      <SvgLayer>
        <Puppet id="youC" look="you" x={980} y={1886} s={3.4} frame={f} rim={RIM_WARM} light={[1320, 40]} highlight sway={0.8} face={face} visemes={visemes} track={track ?? [{at: 0, pose: 'front', dur: 0}]} />
        <g>
          <rect y={982} width={1920} height={98} fill="#4a3425" />
          <rect y={982} width={1920} height={98} fill="url(#wFace)" />
          <rect y={974} width={1920} height={9} fill="#b58f43" />
          <rect x={640} y={944} width={640} height={36} rx={3} fill="#e6dec9" />
          <rect x={640} y={944} width={320} height={36} rx={3} fill="#d3cbb6" />
          {[0, 1].map((i) => <rect key={i} x={670} y={952 + i * 12} width={250} height={3} fill="#776" />)}
        </g>
      </SvgLayer>
    </AbsoluteFill>
  );
};

const WIDE_CX = 1570;
const WideDesk: React.FC<{f: number; dur: number; man: any; you: any}> = ({f, dur, man, you}) => {
  const z = 1.2 + (f / dur) * 0.02;
  return (
    <AbsoluteFill>
      <Lobby cx={WIDE_CX} z={z} frame={f} />
      <Grade light={[960 + (1790 - WIDE_CX) * z, 260]} glow={0.36} />
      <SvgLayer>
        <Cam cx={WIDE_CX} z={z}>
          <Puppet id="youW" look="you" x={1930} y={880} frame={f} rim={RIM_WARM} light={[1930, 200]} {...you} />
          <DeskLit />
          <Puppet id="manW" look="man" y={910} s={1.03} frame={f} rim={RIM_WARM} light={[1930, 200]} floorShadow wallShadow {...man} />
        </Cam>
      </SvgLayer>
      <Fore d="M1790 1080 Q 1760 600 1860 520 Q 1920 480 1940 560 L 1940 1080 Z" blur={22} c="#0b0d0f" />
    </AbsoluteFill>
  );
};

const scribble = (from: number, to: number): any[] => {
  const k: any[] = [];
  for (let a = from; a < to; a += 7) {
    k.push({at: a, near: [44 + (random(`sc${a}`) * 14 - 7), 40 + random(`sd${a}`) * 16], dur: 5});
  }
  return k;
};

const AskShot: React.FC<{f: number; l: ProofBuild['lines']}> = ({f, l}) => {
  const lineAt = 12;
  const dur = SHOTS.ask;
  return (
    <WideDesk
      f={f}
      dur={dur}
      you={{start: undefined, track: [{at: 0, pose: 'writing', dir: -1, dur: 0}, ...scribble(2, 70)], face: [{at: 0, eyes: 'half', mouth: 'flat', look: 0.3, lookY: 0.7}]}}
      man={{
        x: 1040,
        walks: [{from: -4, to: 14, x0: 150, x1: 310}],
        track: [
          {at: 14, pose: 'stand', dur: 6},
          {at: 19, pose: 'reachJacket', ease: 'io', dur: 7},
          {at: 32, pose: 'showBadge', ease: 'out', dur: 7},
          {at: 47, pose: 'showBadgeHigh', ease: 'io', dur: 5},
        ],
        face: [{at: 0, eyes: 'dot', mouth: 'smile', look: 0.55}, {at: 40, eyes: 'happy', brow: 'high', fade: 3}],
        visemes: lineVisemes(l.m1, lineAt),
        hold: (J: any) => (f >= 30 ? <g transform={`translate(${J.nearArm.h.x + 10} ${J.nearArm.h.y - 8})`}><Badge open={clamp01((f - 32) / 5)} /></g> : null),
      }}
    />
  );
};

// Top-down: tight on the bell as it rings on its own, then an eased fast pull-out to show the desk and the hand.
const BellShot: React.FC<{f: number}> = ({f}) => {
  const zt = io(clamp01((f - 10) / 12));
  const z = 1.9 - zt * 0.55 + (f / SHOTS.bell) * 0.02;
  const shake = f < 16 ? Math.sin(f * 2.6) * (16 - f) * 0.42 : 0;
  const wave = clamp01(f / 16);
  const hy = 1250 - io(clamp01((f - 4) / 14)) * 400;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <SvgLayer>
        <g transform={`translate(960 540) scale(${z}) translate(${-(1110 - zt * 200)} ${-(460 + zt * 120)})`}>
          <WoodDesk />
          {/* ledger */}
          <g transform="translate(420 300) rotate(-5)" filter="url(#wProp)">
            <rect x={-180} y={-130} width={360} height={260} rx={6} fill="#e6dec9" />
            <rect x={-180} y={-130} width={180} height={260} rx={6} fill="#d7cfb9" />
            {Array.from({length: 9}).map((_, i) => <rect key={i} x={-160} y={-104 + i * 25} width={140} height={3} fill="#887" />)}
            {Array.from({length: 9}).map((_, i) => <rect key={i} x={20} y={-104 + i * 25} width={120 + (i % 3) * 8} height={3} fill="#887" />)}
          </g>
          <path d="M540 470 l 170 -70" stroke="#26262e" strokeWidth={13} strokeLinecap="round" filter="url(#wProp2)" />
          {/* mug with steam */}
          <g transform="translate(1540 220)" filter="url(#wProp)">
            <circle r={92} fill="#d9d2bd" />
            <circle r={72} fill="#3a2214" />
            <path d="M-34 -34 A 48 48 0 0 1 20 -46" stroke="#6f4a31" strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M90 -16 q 50 16 0 32" stroke="#d9d2bd" strokeWidth={17} fill="none" />
          </g>
          {[0, 1].map((i) => (
            <path key={i} d={`M${1520 + i * 34} ${180 - i * 10} q ${16 + Math.sin(f / 7 + i) * 12} -50 ${-6} -96 q ${-20} -46 ${10} -90`} stroke="#fff" strokeOpacity={0.12} strokeWidth={18} fill="none" strokeLinecap="round" filter="url(#wSoftS)" />
          ))}
          {/* key and paper */}
          <g transform="translate(1360 700) rotate(16)" filter="url(#wProp2)">
            <circle r={30} fill="none" stroke="#d9a93f" strokeWidth={13} />
            <rect x={26} y={-7} width={120} height={14} fill="#d9a93f" />
            <rect x={118} y={7} width={13} height={22} fill="#d9a93f" />
            <rect x={92} y={7} width={13} height={16} fill="#d9a93f" />
            <path d="M-84 56 L -40 100 L -92 152 L -136 108 Z" fill="#6b2233" />
          </g>
          <g transform="translate(300 790) rotate(9)" filter="url(#wProp2)">
            <rect x={-120} y={-92} width={240} height={184} fill="#d9c554" />
            <rect x={-120} y={-92} width={240} height={30} fill="#cfbb4a" />
          </g>
          {/* the bell */}
          <g transform={`translate(${1110 + shake} 460)`}>
            <ellipse cx={18} cy={32} rx={172} ry={48} fill="#000" opacity={0.5} filter="url(#wSoftS)" />
            <ellipse cx={0} cy={18} rx={150} ry={46} fill="#3d291c" />
            <path d="M-122 6 A 122 122 0 0 1 122 6 Z" fill="#d9a93f" />
            <path d="M-122 6 A 122 122 0 0 1 -40 -108 Q -90 -60 -92 6 Z" fill="#000" opacity={0.14} />
            <path d="M-92 -30 A 100 100 0 0 1 -30 -96" stroke="#f6dd9a" strokeWidth={12} fill="none" strokeLinecap="round" />
            <rect x={-12} y={-142} width={24} height={30} rx={8} fill="#a9812e" />
            <circle cx={0} cy={-148} r={18} fill="#d9a93f" />
            {[0, 0.25, 0.5].map((d) => {
              const p = clamp01(wave + d);
              return <circle key={d} cx={0} cy={-50} r={130 + p * 240} fill="none" stroke="#d9a93f" strokeWidth={7 * (1 - p) + 1} opacity={(1 - p) * 0.9} />;
            })}
          </g>
          {/* badge under a big hand */}
          <g transform={`translate(700 ${hy - 330}) rotate(-8)`} filter="url(#wProp)">
            <rect x={-130} y={-90} width={260} height={180} rx={10} fill="#3a2a1d" />
            <path d="M-46 -60 l46 22 v46 q0 34 -46 52 q-46 -18 -46 -52 v-46 Z" fill="#d9a93f" transform="translate(46 0)" />
            <circle cx={0} cy={-6} r={15} fill="#7a5a1e" />
          </g>
          <TopHand x={770} y={hy + 150} rot={-8} s={1.5} cuff="#2f5c8f" curl={[0.1, 0.05, 0.08, 0.14]} />
          <Motes frame={f} />
        </g>
      </SvgLayer>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 52% 44%, transparent 40%, rgba(0,0,0,0.42) 100%)'}} />
    </AbsoluteFill>
  );
};

// Rack focus: the near head goes soft and the man comes sharp, on the word that lands.
const ReplyShot: React.FC<{f: number; l: ProofBuild['lines']}> = ({f, l}) => {
  const lineAt = 8;
  const dur = SHOTS.reply;
  const hitAt = 44;
  const rack = io(clamp01((f - 36) / 12));
  const z = 1.2;
  return (
    <AbsoluteFill>
      <Lobby cx={1180} cy={470} z={z} frame={f} blur={9} props={false} />
      <Grade light={[1500, 180]} />
      <SvgLayer blur={8 - rack * 8}>
        <Puppet
          id="manR"
          look="man"
          x={640}
          y={1190}
          s={1.7}
          frame={f}
          rim={RIM_WARM}
          light={[1500, 120]}
          track={[{at: 0, pose: 'showBadgeHigh', dur: 0}, {at: hitAt + 8, pose: 'reachJacket', ease: 'slow', dur: 14}, {at: hitAt + 30, pose: 'stand', ease: 'out'}]}
          face={[
            {at: 0, eyes: 'happy', brow: 'high', mouth: 'smile', look: 0.6},
            {at: hitAt, eyes: 'dot', brow: 'flat', mouth: 'flat', look: 0.6, fade: 1},
            {at: hitAt + 12, eyes: 'wide', brow: 'worry', mouth: 'wave', look: 0.45, fade: 4},
          ]}
          hold={(J: any) => (f < hitAt + 14 ? <g transform={`translate(${J.nearArm.h.x + 10} ${J.nearArm.h.y - 8})`}><Badge open={1} /></g> : null)}
        />
      </SvgLayer>
      <SvgLayer blur={rack * 12}>
        <Puppet
          id="youR"
          look="you"
          x={1400}
          y={1830}
          s={3.3}
          frame={f}
          rim={RIM_WARM}
          light={[1500, -100]}
          highlight
          sway={0.7}
          track={[{at: 0, pose: 'front', dir: -1, dur: 0}]}
          face={[{at: 0, eyes: 'half', brow: 'none', mouth: 'flat', look: 0.45}]}
          visemes={lineVisemes(l.y1, lineAt)}
        />
      </SvgLayer>
    </AbsoluteFill>
  );
};

const FallShot: React.FC<{f: number}> = ({f}) => {
  const z = 1.25;
  const drop = f - 8;
  return (
    <AbsoluteFill>
      <Lobby cx={1040} cy={480} z={z} frame={f} blur={9} props={false} />
      <Grade light={[1500, 180]} />
      <SvgLayer>
        <Puppet
          id="manF"
          look="man"
          x={950}
          y={1900}
          s={3.5}
          frame={f}
          rim={RIM_WARM}
          light={[1500, 60]}
          highlight
          sway={0.7}
          track={[{at: 0, pose: 'front', dur: 0}]}
          face={[
            {at: 0, eyes: 'wide', brow: 'worry', mouth: 'wave', look: 0.1},
            {at: 6, look: -0.5, fade: 3},
            {at: 14, look: 0.6, fade: 3},
          ]}
        />
        {drop > 0 && <path d={`M1120 ${360 + drop * drop * 1.2} q 15 26 0 36 q -15 -10 0 -36`} fill="#a9d6e6" opacity={clamp01(1.6 - drop / 12)} />}
      </SvgLayer>
    </AbsoluteFill>
  );
};

const exitTrack: any[] = [
  {at: 0, pose: 'stand', rootX: 310, dur: 0},
  {at: 2, pose: 'slump', ease: 'slow', dur: 12},
  {at: 18, dir: -1, ease: 'io', dur: 3},
];

const ExitShot: React.FC<{f: number}> = ({f}) => {
  const dur = SHOTS.exit;
  return (
    <WideDesk
      f={f}
      dur={dur}
      you={{
        track: [{at: 0, pose: 'deskReady', dir: -1, dur: 0}, {at: 30, pose: 'writing', ease: 'io', dur: 8}, ...scribble(40, 90)],
        face: [{at: 0, eyes: 'half', mouth: 'flat', look: 0.55}, {at: 30, look: 0.3, lookY: 0.7, fade: 4}],
      }}
      man={{
        x: 1040,
        track: exitTrack,
        walks: f >= 24 ? [{from: 24, to: 400, x0: 310, x1: 310 - 376 * 11}] : [],
        face: [
          {at: 0, eyes: 'dot', brow: 'worry', mouth: 'frown', look: 0.5},
          {at: 8, eyes: 'closed', fade: 5},
          {at: 18, eyes: 'dot', look: 0.5, fade: 3},
        ],
      }}
    />
  );
};

const GagShot: React.FC<{f: number}> = ({f}) => {
  const cx = 3370;
  const z = 1.16 + (f / SHOTS.gag) * 0.02;
  return (
    <AbsoluteFill>
      <Lobby cx={cx} z={z} frame={f} props={false} />
      <Grade light={[1280, 460]} cold glow={0.14} />
      <SvgLayer>
        <Cam cx={cx} z={z}>
          <Vending x={3520} />
          <Puppet
            id="manV"
            look="man"
            x={3250}
            y={906}
            s={1.03}
            frame={f}
            rim="#d5e7ee"
            light={[3560, 400]}
            floorShadow
            wallShadow
            track={[{at: 0, near: [58, 26], far: [40, 40], lean: 8, dur: 0}, {at: 9, near: [74, 14], ease: 'out', dur: 5}, {at: 19, near: [58, 26], dur: 6}, {at: 28, near: [74, 14], ease: 'out', dur: 5}]}
            face={[{at: 0, eyes: 'half', brow: 'none', mouth: 'flat', look: 0.5}, {at: 24, look: -0.5, fade: 3}]}
            hold={(J: any) => <rect x={J.nearArm.h.x - 4} y={J.nearArm.h.y - 40} width={30} height={46} rx={3} fill="#c9362d" />}
          />
        </Cam>
        <PopPill text="VENDING CO." x={1090} y={290} since={f - 12} to={[1000, 480]} />
      </SvgLayer>
    </AbsoluteFill>
  );
};

const Tag: React.FC = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <g transform="translate(1660 104)">
        <path d="M0 34 L 34 0 H 196 V 68 H 34 Z" fill="#d9a93f" />
        <circle cx={30} cy={34} r={10} fill="#0a1214" />
        <text x={116} y={46} textAnchor="middle" fontFamily="Anton" fontSize={38} letterSpacing={3} fill="#0a1214">
          PERK
        </text>
      </g>
    </svg>
  </AbsoluteFill>
);

const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 78% 82% at 50% 50%, transparent 46%, rgba(0,0,0,0.5) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('sfx/grain.png')})`, backgroundPosition: `${Math.floor(random(`gx${frame}`) * 640)}px ${Math.floor(random(`gy${frame}`) * 640)}px`, mixBlendMode: 'overlay', opacity: 0.06}} />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: '#000'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: '#000'}} />
    </>
  );
};

export const Proof: React.FC<ProofBuild> = ({lines, bed, room}) => {
  const frame = useCurrentFrame();
  const S = starts.o;
  const inShot = (k: keyof typeof SHOTS) => frame >= S[k] && frame < S[k] + SHOTS[k];
  const lf = (k: keyof typeof SHOTS) => frame - S[k];
  let view: React.ReactNode = null;
  if (inShot('walk')) view = <WalkShot f={lf('walk')} l={lines} />;
  else if (inShot('up')) {
    const f = lf('up');
    view = (
      <HeroClose
        f={f}
        dur={SHOTS.up}
        face={[{at: 0, eyes: 'half', mouth: 'flat', look: 0.2, lookY: 0.75}, {at: 17, look: 0.2, lookY: 0.1, fade: 3}]}
        track={[{at: 0, pose: 'front', dur: 0, near: [24, 62], far: [24, 62]}, {at: 3, near: [28, 56], dur: 5}, {at: 9, near: [22, 64], dur: 5}]}
      />
    );
  } else if (inShot('ask')) view = <AskShot f={lf('ask')} l={lines} />;
  else if (inShot('bell')) view = <BellShot f={lf('bell')} />;
  else if (inShot('sigh')) {
    const f = lf('sigh');
    view = (
      <HeroClose
        f={f}
        dur={SHOTS.sigh}
        face={[
          {at: 0, eyes: 'half', mouth: 'flat', look: 0.2, lookY: 0.1},
          {at: 5, eyes: 'closed', fade: 5},
          {at: 19, eyes: 'half', look: -0.45, lookY: 0, fade: 3},
          {at: 24, mouth: 'smirk', fade: 3},
        ]}
        track={[{at: 0, pose: 'front', dur: 0, near: [24, 62], far: [24, 62]}, {at: 5, rootY: 9, ease: 'slow', dur: 12}, {at: 19, rootY: 0, ease: 'io', dur: 6}]}
      />
    );
  } else if (inShot('reply')) view = <ReplyShot f={lf('reply')} l={lines} />;
  else if (inShot('fall')) view = <FallShot f={lf('fall')} />;
  else if (inShot('exit')) view = <ExitShot f={lf('exit')} />;
  else if (inShot('gag')) view = <GagShot f={lf('gag')} />;
  // The last frames of the exit tear over into the gag.
  const wipeLen = 6;
  const wipeStart = S.gag - wipeLen;
  if (frame >= wipeStart && frame < S.gag) {
    const p = (frame - wipeStart + 1) / wipeLen;
    view = <TornWipe from={<ExitShot f={lf('exit')} />} to={<GagShot f={0} />} p={p} />;
  }
  const taps: number[] = [];
  for (let t = 6; t < SHOTS.walk; t += 8) taps.push(t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {view}
      <Sequence from={0} durationInFrames={S.bell + SHOTS.bell + SHOTS.sigh + SHOTS.reply + SHOTS.fall + SHOTS.exit - 50} layout="none">
        <Tag />
      </Sequence>
      <Finish />
      <Html5Audio src={staticFile(bed)} volume={0.2} />
      <Html5Audio src={staticFile(room)} volume={0.2} />
      {taps.map((t) => (
        <Sequence key={t} from={t} durationInFrames={12} layout="none">
          <Html5Audio src={staticFile('sfx/knock.mp3')} volume={0.1} />
        </Sequence>
      ))}
      <Sequence from={5} layout="none">
        <Html5Audio src={staticFile(lines.n1.audio)} />
      </Sequence>
      <Sequence from={S.ask + 12} layout="none">
        <Html5Audio src={staticFile(lines.m1.audio)} />
      </Sequence>
      <Sequence from={S.ask + 32} durationInFrames={8} layout="none">
        <Html5Audio src={staticFile('sfx/click.mp3')} volume={0.5} />
      </Sequence>
      <Sequence from={S.bell} layout="none">
        <Html5Audio src={staticFile('sfx/bell.mp3')} volume={0.75} />
      </Sequence>
      <Sequence from={S.reply + 8} layout="none">
        <Html5Audio src={staticFile(lines.y1.audio)} />
      </Sequence>
      <Sequence from={wipeStart} durationInFrames={20} layout="none">
        <Html5Audio src={staticFile('sfx/whoosh.mp3')} volume={0.35} />
      </Sequence>
      <Sequence from={S.gag + 12} durationInFrames={8} layout="none">
        <Html5Audio src={staticFile('sfx/click.mp3')} volume={0.45} />
      </Sequence>
    </AbsoluteFill>
  );
};
