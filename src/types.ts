// Shape of public/<ep>/build.json, written by scripts/make_episode.py.

export type Word = {text: string; start: number; end: number}; // seconds, relative to the line's audio

export type Who = 'narrator' | 'you' | 'kevin' | 'tyler' | 'lily' | 'brenda';

export type Line = {
  who: Who;
  text: string;
  audio: string; // path inside public/
  start: number; // seconds from scene start
  duration: number;
  words: Word[];
};

export type Pose = 'idle' | 'walk' | 'point' | 'shock' | 'cheer' | 'angry' | 'shrug' | 'sad';
export type Face = 'neutral' | 'happy' | 'shock' | 'angry' | 'smug' | 'sad' | 'love';

export type CastMember = {
  who: Exclude<Who, 'narrator'>;
  x: number; // 0..1080, feet position
  pose?: Pose;
  face?: Face;
  flip?: boolean; // face left
  toX?: number; // walk to this x over the scene
};

export type Hud = {tips: number; rage: number; badge: string};

export type Stamp = {text: string; color: 'red' | 'green' | 'yellow' | 'blue'; line?: number};

export type SceneSpec = {
  set: 'exterior' | 'counter' | 'kitchen' | 'dining';
  cast: CastMember[];
  hud: Hud;
  stamp?: Stamp;
  zoom?: Exclude<Who, 'narrator'>; // punch in on this character
  fx?: 'shake' | 'flash';
};

export type BuiltScene = SceneSpec & {
  kind: 'story' | 'choice' | 'recap';
  duration: number; // seconds
  lines: Line[];
};

export type Option = {key: string; label: string; teaser: string; icon: Exclude<Who, 'narrator'>};

export type Build = {
  series: string;
  episode: number;
  hook: string;
  hookAccent: string;
  topComment: {user: string; text: string; likes: number} | null;
  scenes: BuiltScene[];
  choice: {question: string; options: Option[]};
  music: string;
};
