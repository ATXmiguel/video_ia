import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Replays a recorded terminal session (real command outputs) for the API compliance screencast.
export type TermStep = {cmd?: string; out?: string[]; note?: string; at: number}; // `at` = second it starts

const FONT = 'Consolas, "Cascadia Mono", monospace';

export const TerminalReplay: React.FC<{title: string; steps: TermStep[]}> = ({title, steps}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const rows: React.ReactNode[] = [];
  steps.forEach((s, i) => {
    if (t < s.at) return;
    if (s.note) rows.push(<div key={`n${i}`} style={{color: '#5fd7ff'}}>{s.note}</div>);
    if (s.cmd) {
      const typed = Math.min(s.cmd.length, Math.floor((t - s.at) * 40));
      rows.push(
        <div key={`c${i}`}>
          <span style={{color: '#6cc644'}}>PS D:\video_ia&gt; </span>
          <span style={{color: '#ffd84d'}}>{s.cmd.slice(0, typed)}</span>
          {typed < s.cmd.length && <span style={{background: '#ddd'}}>&nbsp;</span>}
        </div>,
      );
      if (typed < s.cmd.length) return;
    }
    if (s.out && t >= s.at + (s.cmd ? s.cmd.length / 40 + 0.8 : 0)) {
      s.out.forEach((line, j) => (
        rows.push(<div key={`o${i}-${j}`} style={{color: '#e6e6e6', whiteSpace: 'pre-wrap'}}>{line}</div>)
      ));
      rows.push(<div key={`s${i}`}>&nbsp;</div>);
    }
  });
  return (
    <AbsoluteFill style={{background: '#1d1f24', padding: 40}}>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', border: '1px solid #3a3d44'}}>
        <div style={{height: 44, background: '#2b2e35', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8}}>
          {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
            <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
          ))}
          <div style={{marginLeft: 16, color: '#c8c8c8', fontFamily: 'Segoe UI, sans-serif', fontSize: 18}}>{title}</div>
        </div>
        <div style={{flex: 1, background: '#0c0c0c', padding: 24, fontFamily: FONT, fontSize: 21, lineHeight: 1.45, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
          {rows}
        </div>
      </div>
    </AbsoluteFill>
  );
};
