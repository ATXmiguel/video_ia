import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import '../ui/fonts';
import {Puppet, RigDefs} from './rig';
import {WorldDefs} from './world';
import {BR_DEFS, PROP_DRAW_BR} from './filmPropsBR';
import type {PropDef} from './filmProps';

// Three thumbnail options for "E se, de repente, a internet acabasse?". One big face, one striking image of the idea,
// at most four huge words, nothing important in the bottom-right corner where the time badge sits.
const CAIO = {torso: '#2e6f92', sleeve: '#27607f', legs: '#2b3138'};
const NEIDE = {torso: '#7a3f4a', item: 'bun' as const, legs: '#3f3540'};
const draw = (d: Partial<PropDef> & {p: string}, f = 90) => PROP_DRAW_BR[d.p]({x: 0, y: 0, ...d} as PropDef, f);

const Word: React.FC<{x: number; y: number; size: number; c: string; children: string; anchor?: 'start' | 'middle' | 'end'; rot?: number}> = ({x, y, size, c, children, anchor = 'start', rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <text textAnchor={anchor} fontFamily="Anton" fontSize={size} letterSpacing={1} stroke="#05070b" strokeWidth={size * 0.13} strokeLinejoin="round" fill="#05070b">{children}</text>
    <text textAnchor={anchor} fontFamily="Anton" fontSize={size} letterSpacing={1} fill={c}>{children}</text>
  </g>
);

const Face: React.FC<{x: number; y: number; s: number; look: typeof CAIO | typeof NEIDE; eyes: 'wide' | 'sad' | 'dot'; brow: 'high' | 'worry'; mouth: 'o' | 'ah' | 'wave'; lookX?: number; rim?: string; light?: [number, number]; id: string}> = ({x, y, s, look, eyes, brow, mouth, lookX = 0, rim = '#ffb24d', light = [1280, 0], id}) => (
  <Puppet id={id} look="caio" lookDef={look} x={x} y={y} s={s} frame={0} sway={0} rim={rim} light={light} highlight track={[{at: 0, pose: 'front', dur: 0, dir: 1}]} face={[{at: 0, fade: 0, eyes, brow, mouth, look: lookX}]} />
);

const Glow: React.FC<{x: number; y: number; r: number; c: string; o?: number}> = ({x, y, r, c, o = 0.5}) => <circle cx={x} cy={y} r={r} fill={c} opacity={o} filter="url(#brGlow)" />;

const Frame: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <AbsoluteFill style={{background: bg}}>
    <svg viewBox="0 0 1280 720" width="100%" height="100%">
      <WorldDefs />
      <RigDefs />
      <BR_DEFS />
      {children}
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)'}} />
  </AbsoluteFill>
);

// A: the world going dark behind a stunned face.
const A: React.FC = () => (
  <Frame bg="radial-gradient(ellipse 80% 90% at 72% 40%, #24486b 0%, #0d1a2b 60%, #05080f 100%)">
    <Glow x={880} y={300} r={300} c="#3f7fb5" o={0.34} />
    <g transform="translate(880 320) scale(0.82)">{draw({p: 'globe', n: 0}, 22)}</g>
    <Face id="a" x={290} y={2265} s={4.5} look={CAIO} eyes="wide" brow="high" mouth="o" lookX={0.3} light={[900, 200]} />
    <Word x={640} y={150} size={118} c="#f3ead6" anchor="start">O MUNDO</Word>
    <Word x={640} y={300} size={150} c="#ffc857" anchor="start">SEM REDE</Word>
    <g transform="translate(1110 500) scale(0.62)">{draw({p: 'qmark'})}</g>
  </Frame>
);

// B: the failed Pix on a phone shoved at the lens.
const B: React.FC = () => (
  <Frame bg="radial-gradient(ellipse 80% 90% at 30% 45%, #4a2a22 0%, #1a0f12 60%, #06060b 100%)">
    <Glow x={1040} y={420} r={250} c="#e2553f" o={0.5} />
    <Face id="b" x={290} y={2285} s={4.5} look={CAIO} eyes="wide" brow="worry" mouth="ah" lookX={0.45} light={[900, 260]} />
    <g transform="translate(1060 450) rotate(7) scale(0.78)">{draw({p: 'phone', text: 'pix', t2: 'R$ 23,50', n: 0, x: 3, y: 3})}</g>
    <Word x={590} y={150} size={138} c="#ffc857" rot={-2}>O PIX</Word>
    <Word x={590} y={290} size={120} c="#f3ead6" rot={-2}>NÃO FOI</Word>
  </Frame>
);

// C: a year later, mother and son and a letter.
const C: React.FC = () => (
  <Frame bg="radial-gradient(ellipse 80% 90% at 70% 35%, #8a5a3a 0%, #2c1a1c 60%, #07060b 100%)">
    <Glow x={920} y={300} r={250} c="#ffb778" o={0.4} />
    <g transform="translate(920 370) rotate(-6) scale(0.4)">{draw({p: 'carta', lines: ['Filha,', 'aqui tá todo', 'mundo bem.', 'Me escreve.'], n: 0})}</g>
    <Face id="c" x={290} y={2265} s={4.5} look={NEIDE} eyes="sad" brow="worry" mouth="wave" lookX={0.3} light={[900, 200]} />
    <Word x={640} y={140} size={108} c="#f3ead6">1 ANO</Word>
    <Word x={880} y={140} size={108} c="#ffc857">SEM</Word>
    <Word x={640} y={640} size={150} c="#ffc857">INTERNET</Word>
  </Frame>
);

const Root: React.FC = () => (
  <>
    <Composition id="ThumbA" component={A} width={1280} height={720} fps={24} durationInFrames={1} />
    <Composition id="ThumbB" component={B} width={1280} height={720} fps={24} durationInFrames={1} />
    <Composition id="ThumbC" component={C} width={1280} height={720} fps={24} durationInFrames={1} />
  </>
);

registerRoot(Root);
