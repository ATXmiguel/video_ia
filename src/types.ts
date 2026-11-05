// Shape of public/<ep>/build.json, written by scripts/make_episode.py.

export type Word = {text: string; start: number; end: number}; // seconds, relative to the line's audio

export type Who = 'narrator' | 'you' | 'kevin' | 'tyler' | 'lily' | 'brenda' | 'gloria' | 'chad';

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

export type Hud = {tips: number; rage: number; badge: string; left?: number; progress?: number};

// A chat on a phone filling the screen. Message i appears when line `line` (default i) starts.
export type Phone = {contact: string; messages: {from: 'me' | 'them'; text: string; line?: number}[]};

export type Stamp = {text: string; color: 'red' | 'green' | 'yellow' | 'blue'; line?: number};

export type SceneSpec = {
  set: 'exterior' | 'counter' | 'kitchen' | 'dining' | 'marquee' | 'lobby' | 'auditorium' | 'blackout' | 'phone';
  cast: CastMember[];
  hud: Hud;
  stamp?: Stamp;
  zoom?: Exclude<Who, 'narrator'>; // punch in on this character
  fx?: 'shake' | 'flash';
  phone?: Phone; // with set 'phone'
};

export type BuiltScene = SceneSpec & {
  kind: 'story' | 'choice' | 'recap';
  duration: number; // seconds
  lines: Line[];
};

// `word` is what viewers comment (one word, the option's noun). `pose`/`face` draw YOU doing it on the card.
export type Option = {
  key: string;
  word?: string;
  label: string;
  teaser: string;
  icon: Exclude<Who, 'narrator'>;
  pose?: Pose;
  face?: Face;
};

// A finish line for the story: "SHIFTS LEFT 5" counting down and a progress bar toward the goal.
export type Goal = {countdown: string; progress: string};

// A saga ("story") is one job for YOU, 4–7 parts long. The finale's vote picks the next saga.
export type Arc = {number: number; part: number; name: string; final?: boolean};

export type Build = {
  series: string;
  episode: number;
  arc?: Arc;
  hudLabels?: {money: string; meter: string};
  goal?: Goal;
  hook: string;
  hookAccent: string;
  topComment: {user: string; text: string; likes: number; picked?: string} | null;
  coldOpen?: boolean; // voice from the first moment; the winning comment becomes a small badge on the next scene
  scenes: BuiltScene[];
  choice: {question: string; options: Option[]};
  music: string;
};
