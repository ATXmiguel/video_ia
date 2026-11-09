import type {Who} from './types';

export const INK = '#1e1d2b';
export const SKIN = '#f7dcbb';
export const YELLOW = '#ffd84d';
export const RED = '#e8443a';

export const STAMP_COLORS = {red: '#ff4a3d', green: '#2fd27a', yellow: '#ffc83d', blue: '#3fa8ff'};

export type Look = {
  name: string;
  shirt: string;
  pants: string;
  height: number; // px, feet to top of head
  hair: 'cap' | 'spiky' | 'ponytail' | 'bald' | 'puff' | 'bun' | 'swoop';
  hairColor: string;
  tie?: string;
  mustache?: boolean;
  shades?: boolean;
  glasses?: boolean;
};

// The recurring cast. Keep looks stable across episodes so viewers recognise everyone instantly.
export const CAST: Record<Exclude<Who, 'narrator'>, Look> = {
  you: {name: 'YOU', shirt: '#e8443a', pants: '#2e3a5c', height: 600, hair: 'cap', hairColor: '#e8443a'},
  kevin: {name: 'KEVIN', shirt: '#f4f6fb', pants: '#3b3f4f', height: 610, hair: 'bald', hairColor: '#5a3b22', tie: '#2f6fe0', mustache: true},
  tyler: {name: 'TYLER', shirt: '#e8443a', pants: '#2e3a5c', height: 660, hair: 'spiky', hairColor: '#2a2230'},
  lily: {name: 'LILY', shirt: '#e8443a', pants: '#2e3a5c', height: 570, hair: 'ponytail', hairColor: '#7a4a2a'},
  brenda: {name: 'BRENDA', shirt: '#9b4fe0', pants: '#5b2f8c', height: 600, hair: 'puff', hairColor: '#ffd36b', shades: true},
  // Story 2: Starlite Cinema
  gloria: {name: 'GLORIA', shirt: '#2b2a3a', pants: '#2b2a3a', height: 640, hair: 'bun', hairColor: '#9aa0ad', tie: '#c0392b', glasses: true},
  chad: {name: 'CHAD', shirt: '#7b2cbf', pants: '#2e3a5c', height: 650, hair: 'swoop', hairColor: '#f2c14e'},
  // Story 3: Hotel Hollow
  mortimer: {name: 'MORTIMER', shirt: '#1f3b3a', pants: '#14202a', height: 680, hair: 'swoop', hairColor: '#d5d8e0', tie: '#c9a227', mustache: true},
};
