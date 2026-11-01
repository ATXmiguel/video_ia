import React from 'react';
import {AbsoluteFill, Html5Audio, interpolate, random, Sequence, Series, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Character} from './art/Character';
import {SETS} from './art/Sets';
import {CAST} from './palette';
import type {Build, BuiltScene, Hud as HudT} from './types';
import {Captions} from './ui/Captions';
import {ChoiceCard} from './ui/ChoiceCard';
import {Hud} from './ui/Hud';
import {Cover, TopComment} from './ui/Overlays';
import {Stamp} from './ui/Stamp';

export const FPS = 30;
export const COVER_FRAMES = Math.round(2.2 * FPS);
export const sceneFrames = (s: BuiltScene) => Math.round(s.duration * FPS);
export const totalFrames = (b: Build) => b.scenes.reduce((n, s) => n + sceneFrames(s), 0);

const sfx = (name: string) => staticFile(`sfx/${name}.mp3`);

const SceneBlock: React.FC<{scene: BuiltScene; prevHud: HudT; first: boolean; dur: number; build: Build}> = ({
  scene,
  prevHud,
  first,
  dur,
  build,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const set = SETS[scene.set];
  const stampFrame = scene.stamp ? Math.round((scene.lines[scene.stamp.line ?? 0]?.start ?? 0) * fps) : -1;
  const since = frame - stampFrame;
  const hit = stampFrame >= 0 && since >= 0 && since < 14;
  const shake = scene.fx === 'shake' && hit ? [(random(`sx${frame}`) - 0.5) * 30, (random(`sy${frame}`) - 0.5) * 30] : [0, 0];
  const flash = scene.fx === 'flash' && hit ? interpolate(since, [0, 10], [0.8, 0], {extrapolateRight: 'clamp'}) : 0;

  const push = interpolate(frame, [0, dur], [1, 1.05]);
  const punch = interpolate(frame, [0, 6], [1.07, 1], {extrapolateRight: 'clamp'});
  const focus = scene.zoom ? scene.cast.find((m) => m.who === scene.zoom) : undefined;
  const zoomIn = focus ? interpolate(frame, [0, 10], [1, 1.35], {extrapolateRight: 'clamp'}) : 1;
  const origin = focus ? `${focus.x}px ${set.floorY - CAST[focus.who].height * 0.72}px` : '50% 50%';
  const speaking = scene.lines.find((l) => t >= l.start && t < l.start + l.duration)?.who;
  const isChoice = scene.kind === 'choice';
  const isRecap = scene.kind === 'recap';
  const hudFrom = first ? COVER_FRAMES : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translate(${shake[0]}px, ${shake[1]}px) scale(${push * punch * zoomIn})`,
          transformOrigin: origin,
          filter: isRecap ? 'grayscale(1) brightness(0.75)' : undefined,
        }}
      >
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <set.Back />
          {scene.cast.map((m, i) => (
            <Character key={i} m={m} footY={set.floorY} talking={speaking === m.who} progress={frame / dur} seed={i} />
          ))}
          {set.Front && <set.Front />}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      {!isChoice && !isRecap && (
        <Sequence from={hudFrom} layout="none">
          <Hud prev={first ? scene.hud : prevHud} cur={scene.hud} />
        </Sequence>
      )}
      {isRecap && build.topComment && (
        <Sequence from={hudFrom} layout="none">
          <TopComment {...build.topComment} episode={build.episode} />
        </Sequence>
      )}
      {scene.stamp && stampFrame >= 0 && (
        <Sequence from={stampFrame}>
          <Stamp stamp={scene.stamp} />
          <Html5Audio src={sfx('boom')} volume={0.55} />
        </Sequence>
      )}
      {!first && <Html5Audio src={sfx('whoosh')} volume={0.35} />}
      {!isChoice && scene.hud.tips > prevHud.tips && (
        <Sequence from={6} layout="none">
          <Html5Audio src={sfx('ding')} volume={0.5} />
        </Sequence>
      )}
      {!isChoice && scene.hud.rage > prevHud.rage && (
        <Sequence from={6} layout="none">
          <Html5Audio src={sfx('buzz')} volume={0.35} />
        </Sequence>
      )}
      {scene.lines.map((l, i) => (
        <Sequence key={i} from={Math.round(l.start * fps)} durationInFrames={Math.ceil((l.duration + 0.4) * fps)}>
          <Html5Audio src={staticFile(l.audio)} />
          {!isChoice && !isRecap && <Captions words={l.words} who={l.who} />}
        </Sequence>
      ))}
      {isChoice && <ChoiceCard scene={scene} build={build} />}
    </AbsoluteFill>
  );
};

export const Episode: React.FC<Build> = (build) => {
  const total = totalFrames(build);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Html5Audio
        src={staticFile(build.music)}
        volume={(f) => interpolate(f, [0, 15, total - 30, total], [0, 0.16, 0.16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
      <Series>
        {build.scenes.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={sceneFrames(s)}>
            <SceneBlock scene={s} prevHud={build.scenes[Math.max(0, i - 1)].hud} first={i === 0} dur={sceneFrames(s)} build={build} />
          </Series.Sequence>
        ))}
      </Series>
      <Cover hook={build.hook} accent={build.hookAccent} series={build.series} episode={build.episode} frames={COVER_FRAMES} />
    </AbsoluteFill>
  );
};
