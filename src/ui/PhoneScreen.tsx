import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {INK} from '../palette';
import type {BuiltScene} from '../types';
import {BODY} from './fonts';

// Full-screen phone with a chat. Each message pops in when its line starts; "typing…" dots lead into it.
export const PhoneScreen: React.FC<{scene: BuiltScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phone = scene.phone ?? {contact: '?', messages: []};
  const at = (i: number) => Math.round((scene.lines[phone.messages[i].line ?? i]?.start ?? 0) * fps);
  const rise = interpolate(frame, [0, 10], [140, 0], {extrapolateRight: 'clamp'});
  const typingFor = phone.messages.findIndex((_, i) => frame < at(i));
  const showTyping = typingFor >= 0 && at(typingFor) - frame < 18 && phone.messages[typingFor].from === 'them';

  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #5b3fb0 0%, #1b1238 80%)'}}>
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 300,
          width: 860,
          height: 1440,
          borderRadius: 90,
          background: '#0f0f16',
          border: `10px solid ${INK}`,
          boxShadow: '0 30px 0 rgba(0,0,0,0.35)',
          padding: 26,
          transform: `translateY(${rise}px) rotate(-2deg)`,
        }}
      >
        <div style={{width: '100%', height: '100%', borderRadius: 66, background: '#f4f4f8', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '56px 40px 26px', background: '#fff', borderBottom: '3px solid #e2e2ea'}}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                background: '#8f95a8',
                color: '#fff',
                fontFamily: BODY,
                fontWeight: 800,
                fontSize: 46,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {phone.contact.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 46, color: INK}}>{phone.contact}</div>
              <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 28, color: '#2fb36a'}}>online</div>
            </div>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 22, padding: '30px 34px 60px'}}>
            {phone.messages.map((m, i) => {
              const s = spring({frame: frame - at(i), fps, config: {damping: 13}});
              if (frame < at(i)) return null;
              const me = m.from === 'me';
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: me ? 'flex-end' : 'flex-start',
                    maxWidth: '78%',
                    padding: '22px 30px',
                    borderRadius: 38,
                    borderBottomRightRadius: me ? 10 : 38,
                    borderBottomLeftRadius: me ? 38 : 10,
                    background: me ? '#2f7bf6' : '#e3e3ea',
                    color: me ? '#fff' : INK,
                    fontFamily: BODY,
                    fontWeight: 600,
                    fontSize: 44,
                    lineHeight: 1.2,
                    transform: `scale(${0.6 + 0.4 * s})`,
                    transformOrigin: me ? 'right bottom' : 'left bottom',
                    opacity: s,
                  }}
                >
                  {m.text}
                </div>
              );
            })}
            {showTyping && (
              <div style={{alignSelf: 'flex-start', display: 'flex', gap: 12, padding: '26px 30px', borderRadius: 38, background: '#e3e3ea'}}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{width: 18, height: 18, borderRadius: 99, background: '#8f95a8', opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.25 + d))}} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
