# Replication guide: "what if" films at reference level

This guide lets an agent make a narrated 16:9 film with our Remotion pipeline at the level of the reference ("What If
You Had 500 IQ?", Ifverse, 8:56, 12,853 frames at 24 fps). It replaces the numbers in `STYLE_WHATIF_FILM.md` where they
disagree: the pace and blur figures there were wrong.

Learn the craft and leave the film behind. Don't reuse its story, characters, names, lines or hero design, and don't
trace frames. Section 15 lists what must stay different.

All pixel sizes are at 720p unless marked. Multiply by 1.5 for our 1080p. `D` is the head diameter, the rig's unit.

## 1. What this rests on

**Measured across every frame**: cuts, camera motion, moving regions, color, cadence, audio levels. Scripts are in
`scripts/whatif/`, and the table is `docs/whatif/shots.csv` (236 shots).

**Read by eye**:

- First and last frame of every candidate cut (348 pairs) and the middle frame of every shot, at 256 px wide.
- 105 soft-transition candidates, first and last frame, at 190 px.
- Every frame, at 190 px per tile: two walks, a talking mouth, a raised arm, two head turns, a group reaction, a torn
  wipe, a fast zoom, a dissolve.
- Every second or third frame, same size: a held phone gesture, a close-up, a finger on a phone, a seated lean, a body
  entering, a character speaking with a hand raised.
- 9 frames at full size, plus zoomed crops of 4 figures.

**Not done**:

- Nobody listened. Everything on sound is a measurement, and nothing here says how it sounds.
- Most frames were only measured, not looked at.
- Whole-shot types in `shots.csv` were assigned from three small frames per shot, so a few may be wrong.
- Blink and mouth numbers come from a tracker that only works where the head is darker than the room. About 15 of 57
  close-ups were dropped for that reason, so dark scenes are not covered. The 11 blinks found include a few likely false
  ones (a hand passing the face).
- About 35 cut decisions were set by hand after review, including the wipes and dissolves, which have no sharp spike. The
  override file stays local, and the result is in the table's `transition_in` column.

**Correction to earlier notes**: `STYLE_WHATIF_FILM.md` says 127 cuts and 4.1 s per shot. That came from ffmpeg scene
detection, which misses most cuts here. The real figure is 2.27 s.

## 2. The gaps, ranked by how much they change the look

Our v2 film was measured with the same scripts.

| # | Gap | Reference | Our v2 | Fix |
|---|---|---|---|---|
| 1 | Things moving inside the shot | Something moves on 60% of frames; 2.6% of shots have no local motion | 22%; 34% of shots have none | One specific action per shot (section 5) |
| 2 | Cutting pace | Mean 2.27 s, median 1.85 s, 24 to 37 cuts per minute | Mean 5.41 s, median 5.17 s | Split beats into 2 to 3 shots (section 3) |
| 3 | Figure and rig | 4.8 heads tall, jointed limbs, feet that plant | 3.6 heads, bent noodles, sliding legs | `rig.tsx` (section 4) |
| 4 | Face behavior | Crossfaded poses, held mouth shapes, rare blinks | Sine flap on every talking frame, no blinks | `rig.tsx` (section 6) |
| 5 | Set detail | About 40 distinct objects in a recurring wide | About 10 to 15 | `world.tsx` lobby as the model (section 7) |
| 6 | Camera language | Close-ups nearly locked, wides push, walks are tracked, eased fast zooms | The same slow push on 95% of shots | Section 3 |
| 7 | Top-down shots | Hands fill a third of the frame, with full finger construction | Smaller, simpler hands | `TopHand` (section 9) |
| 8 | Transitions | Torn wipe moves across in 5 to 6 frames, line art draws itself on | Torn split only held still | `TornWipe` (section 11) |
| 9 | Labels | Pills 50 px tall with a leader line to the object | About 37 px, floating | `PopPill` (section 10) |
| 10 | Sound | Real stereo (side about 19 dB under mid), bed moves by act, drops 8 to 10 dB in the saddest minute | Near mono (side 51 dB under mid), flat bed | Section 13 |
| 11 | Background blur | Sigma 4.4 to 7.2 px, so 7 to 11 at 1080p | 19 at 1080p: twice too soft, and rooms lose legibility | Use 9 (section 8) |

Things we already match: bar height (40 px), vignette (corner/center luma median 0.57 vs 0.58), integrated tone range
(p1 luma 9 vs 10; p99 184 vs 187). Don't spend time there. Our overall picture is darker (median luma 51 vs 75), and
the reference's day scenes are much brighter than anything we have.

## 3. Editing and camera

**Pace.** 223 hard cuts, 8 torn wipes, 2 dissolves, 2 fades, in 8:55. Cuts per minute: 24, 23, 24, 27, 31, 20, 26, 37, 24.
So the pace is steady, with a peak in the climax and a dip at the low emotional point. Shot length p10 to p90 is 0.88 to
4.21 s. Only about 3% of shots pass 6 s, and those are built set pieces with their own internal development.

**Rule:** if a beat runs over 4 s and nothing in it develops, split it. Aim for a median near 1.9 s.

**Rotation.** The same shot type follows itself only 25% of the time. The commonest moves are wide to close, close to wide,
wide to wide (a different angle) and wide to top-down. Return to the same room many times by cross-cutting. A
conversation is wide, close, wide, close, often with a close-up lasting under a second.

| Type (in `shots.csv`) | Shots | Time | Median length | Median push |
|---|---|---|---|---|
| W wide side-on | 77 | 165 s | 2.0 s | 0.96 %/s |
| C close-up | 54 | 109 s | 1.75 s | 0.04 %/s |
| T top-down table | 29 | 55 s | 1.25 s | 1.27 %/s |
| I object or place insert | 17 | 36 s | 1.6 s | 2.2 %/s |
| K dark data | 8 | 37 s | 3.9 s | 0.02 %/s |
| U full-screen UI | 12 | 28 s | 1.85 s | 1.4 %/s |
| M medium | 11 | 20 s | 1.5 s | 0.15 %/s |
| S held torn split | 7 | 19 s | 1.25 s | 0.67 %/s |
| D line diagram | 4 | 17 s | 4.0 s | 1.5 %/s |
| P map, O over-shoulder, L terminal, X title | 17 | 51 s | varies | varies |

**Camera rules, all measured:**

- **Close-ups hold still.** The acting is the only thing moving. Our v2 pushed on them, which is wrong.
- **Wides push about 1%/s, inserts about 2%/s.** Never pull out slowly (only 1% of shots do).
- **Top-down and object shots start tight and step out.** An eased fast zoom halves the scale in about 11 frames (frames
  59 to 70), with a hold on both sides. This is the film's signature camera move. Use it to reveal context.
- **Walks are tracked.** About 4% of shots pan past 8 px/s. They pan up to 48 px/s with the walker kept near the center
  and the background sliding behind. The walker drifts a little in frame, so it never looks locked on.
- **No handheld and no shake on calm shots.**

**In Remotion:** in a shot, use one `z` value on close-ups, and `z = a + (f / dur) * b` with `b` about 1% per second on
wides. Pan by moving `cx` in `Cam`. For a fast step, `io(clamp01((f - start) / 12))`. See `BellShot` and `WalkShot` in
`src/special/Proof.tsx`.

## 4. The figure

Read from zoomed crops of wide shots and full-size close-ups. Our own rig uses `D = 100`.

| Part | In D |
|---|---|
| Whole figure | 4.8 |
| Head | 1, a perfect disc |
| Neck, visible | 0.25 long, 0.17 wide, thinner than you expect |
| Torso, shoulder to hip | 1.25 |
| Thigh + shin | 2.3 |
| Upper arm, forearm | 0.85, 0.80; hands reach mid-thigh |
| Leg width | 0.22 |
| Bare arm, sleeved arm | 0.16, 0.20 plus a 0.035 dark outline |
| Foot | a capsule 0.34 long, 0.19 wide |
| Hand on a body | a round black nub, 0.2 across |

Sizes on screen: close-up head diameter is 160 to 330 px, median 230 (345 at 1080p). Wide heads are 55 to 75 px.

**Construction.**

- **Limbs are two capsules** that overlap at the joint, with the forearm on top. That overlap and its outline is what
  makes an elbow read as a joint. A single curved stroke is what makes our old limbs look like noodles.
- **Knees bend** with a visible angle in a walk and go straight when standing. Use IK from a planted foot.
- **Garments are flat shapes with a dark outline.** A long side panel, a pocket, drawstrings. Each person has one or two
  signature pieces, and only the hero has a saturated color.
- **Extras use the same rig**, without a garment, in a dark desaturated color and with no face.
- **Rim light is the silhouette again**, offset by 0.062 D toward the light. Sampled as 14 px at a 225 px head and 3 to 4 px at a 55 px head,
  so it is proportional. It covers the head, arms and legs, on one side only, with hard edges.
- **Close-ups add a thin highlight stroke** on the dark side of the head, about 2 px, in a pale version of the rim color.

**In Remotion:** `src/special/rig.tsx`. `Puppet` takes `look` (still the `LOOKS` table in `Sil.tsx`), `track`, `face`,
`walks`, `visemes`, `rim`, `light`, `hold`. Add poses to `P` by name. `hold` draws what the near hand carries.

## 5. Body animation: where the life comes from

This is the most important section. The reference looks alive because **each shot has one specific action, done fast, then
held**. It does not look alive because of constant movement. Close-up heads barely drift: 0.5% of head radius (std), about
half a pixel.

Timing, read frame by frame:

| Action | Frames | Note |
|---|---|---|
| Arm snaps up (hand to mouth, both arms overhead) | 2 | Then held 26 or more frames |
| Arm returns | 2 | |
| Group doubles over | 4 | Then held, with small bobs |
| Lean forward while seated | 6 to 8 | Accelerates in: 3.6, 7, 12 px per frame |
| Return from a lean | 6, plus settle | 70% of the distance in 3 frames, then a long tail |
| Slow push with the body | 10 to 12 | Back foot steps at the end |
| Prop on a desk (drawer, stamp, page) | 4 to 10 | Fired alongside, as a second small action |
| Waving arm, sustained | About 24 per swing | Slow sine, and the head tilts with it |

**Holds run 20 to 60 frames.** Measured motion bursts have a median of 8 frames. No clear overshoot was seen in the samples
read: moves ease in and settle, they don't bounce. Don't add bouncy springs.

**A hold still has a trace of life:** a gentle drift of 1 to 3 px on an arm holding an object, period about 40 frames.

**Rules for directing a shot:**

1. Name the shot's one action before drawing it: reach, lean, wave, flinch, turn away, push a door.
2. Start it within the first half second, so that a 1.5 s shot still shows it.
3. Give background characters their own small action, on a different beat.
4. Prefer a prop reacting in the same shot: a drip falling, a label, a steam wisp, a clock hand.
5. A reaction shot may be nothing but one crossfade of the face, and that is fine on a close-up.

**Walk.** Measured on two walks:

- 16 frames per cycle, 8 per step, animated on ones.
- The head rises and falls twice per cycle by about 0.1 D.
- Rear foot peels and tips, the front foot lands heel first with a small toe-up angle.
- The reference's feet skate slightly. Ours don't, because stride is derived from speed.
- In `rig.tsx`: `walks={[{from, to, x0, x1}]}`. A comfortable speed is about 11 units per frame (stride of 88).

**Cadence.** Everything is on ones at 24 fps (`held_frac` near 0, no alternate-frame pattern), as you would expect from a
puppet rig. Don't animate on twos.

**In Remotion:**

```tsx
track={[
  {at: 0, pose: 'stand', dur: 0},
  {at: 19, pose: 'reachJacket', ease: 'io', dur: 7},
  {at: 32, pose: 'showBadge', ease: 'out', dur: 7},
]}
```

Eases: `snap` (2 frames), `io` (6), `out` (8, long tail), `in`, `slow` (12).

## 6. The face

**Features are painted on the disc.** The disc doesn't change, and a head turn is not a rotation.

- **A head turn is a crossfade.** Old features fade out and new ones fade up in a new position over 3 to 6 frames, with a
  brief moment of both. Read at frames 4586 to 4594, 11538 to 11546 and 5849 to 5855. Then hold for 20 or more frames.
- **Features move a long way:** the look offset spans up to about 0.4 of the head's radius either side.
- **Some changes are a one-frame snap,** for a beat that lands (smile to flat at frame 3598 to 3599).
- **Brows and lids fade in on their own** over about 6 frames (6408 to 6413).
- **Eye set:** small dot; half-lid (a D shape with a flat bar on top); wide ring with a small pupil; closed arc; happy arc. Glasses
  are a separate layer.
- **Cream, never white.** Sampled `#f9f1dc`.

**Mouth: held shapes, not a flap.** One sample held a wavy line for 18 frames, then opened in two.

- Measured holds: median 8 frames, p10 3, p90 43, about one change per second.
- Shapes: flat line, wavy line, thin oval, round O with a dark inside, open oval, smile, smirk.
- **Mouths did not track the voice closely.** Correlation between mouth changes and voice level was weak and inconsistent over nine
  shots, with no steady lag. Don't spend effort on exact lip sync. Do avoid a mechanical rhythm, and do close the mouth in pauses.
- **In our pipeline:** `scripts/make_proof.py` derives shapes from the loudness of each line, with a 4-frame minimum hold.

**Blinks are rare and quick.** 11 found in 94 s of tracked close-ups, about 7 per minute, mostly 2 to 3 frames. Our rig blinks every 170
to 260 frames, for 3 frames.

## 7. Sets

A recurring wide room in the reference holds about 40 distinct objects, none of them important. For example: clock, wall
calendar, wall cabinets, cooker hood, spice shelf, tile field, sink, tap, kettle, dish rack, lower cabinets with handles, oven,
hanging lamp, curtains, window with a city, plant, framed photo, TV, fridge with magnets, table with a checked cloth, chairs, floor planks.

**How to build one:**

- **Side-on, like a dollhouse,** with one or two perspective cues on the floor (planks or tile converging). Walls are flat with a gradient.
- **One color family per wall,** muted: walls `#655c53` to `#827968`, cabinet `#465248`, floor `#46352d`, cloth `#9c988f`, tile `#878880` (all sampled, warm dusk).
- **Details are small, repeated, slightly irregular.** Random rotation on papers, some slots empty, some lit windows.
- **Every object gets a soft contact shadow.**
- **The room returns and changes:** same layout at morning, dusk, night and in cold grade. Decorations can appear, a window changes.
  It is cheap, and it makes the world feel real.
- **Crop it.** Wide shots still cut off the room, and each angle shows only part of it.

**In Remotion:** `LobbyWall`, `LobbyFloor`, `LobbyProps`, `LobbyDesk` in `src/special/world.tsx`. Draw a room once, about 3,000 units wide, then
show it from several `cx` values. Old sets in `sets.tsx` still work but need this density.

## 8. Light, color, depth

**Sampled values:**

| Thing | Value |
|---|---|
| Bars | `#000000`, 40 px |
| Head, any scene | `#0c0b12` to `#0d090f` |
| Rim warm | `#f1aa68` to `#f4ac62` |
| Rim cold, night | `#96ccf0` to `#9bd1fd` |
| Rim pale, day | `#e4eef7` |
| Saturated hero garment | `#3372df` (ours must differ) |
| Dark-scene background | `#0b121a` |
| Night room floor | `#13181e` |

Luma across shots: median 75; p1 near 10; p99 near 187. Mean saturation 0.26 (dark data scenes 0.54, wides 0.22). Corners fall to
0.58 of the center. Top-down shots vignette hardest (0.48), close-ups least (0.76).

**Layer order matters.** Set, then the room's light as multiply and screen overlays, then the cast above that, then the vignette. `Special.tsx` already does this. The first proof render didn't, and heads went brown, so this is easy to break. Furniture in the cast layer needs its own
`brightness()`, as `DeskLit` does in `Proof.tsx`.

**Light within a shot.** 23% of shots over 20 frames have a luma swing above 8. It is usually a story event: a candle lit, a lamp off, a dim over 20 to
30 frames, a phone lighting a face. Day to night is a 10-frame dissolve (frames 11866 to 11875); a memory transition took about 20.

**Blur by plane** (sigma from edge profiles):

| Plane | 720p | 1080p, CSS `blur()` |
|---|---|---|
| Characters, props, wide-shot sets | Under 1 | 0 |
| Background in close-ups | 4.4 to 7.2 | 7 to 11, use 9 |
| Foreground near the lens | About 10 by eye | 16 to 22 |

**Rack focus** appears as a foreground head in the same shot as a sharp person behind it. In `ReplyShot`: animate each layer's blur over 12 frames.

## 9. Top-down shots

These are 12% of shots and the most distinctive. On wood at `#674f37` to `#6f553a`, with plank lines every 60 px or so.

- **Hands are big.** Palm plus fingers about 500 px long at 720p, about a third of the frame width.
- **Construction:** near-black palm; four separate capsule fingers overlapping like shingles; a separate thumb; each finger has a thin paler inner line and a soft blurred sheen; a rim of warm light on one edge; the arm is a wide sleeve with a shaded side and a cuff.
- **A signature item at the wrist** tells you whose hand it is. Ours should use a different item.
- **Scene dressing:** at least 5 objects at varied rotation, cropped by the frame edge, all with soft shadows.
- **Dust specks** drift on some shots, about 40 to 50 small pale dots, and pale blurred blobs lie on the table as light through a shade.
- **Phone screens are readable** at about 200 px wide with simple UI. Key text has a soft glow.

**In Remotion:** `TopHand`, `WoodDesk`, `Motes`. `curl` shortens each finger, `point` extends one.

## 10. Labels and text

- **Pill:** 50 px tall, spaced heavy capitals (about 25 px type), dark fill at about 90%, thin warm border, often a thin leader line down to the object.
- **Appearance:** the pill widens from its middle over 4 frames, the text follows 2 frames later. A check mark draws on in 2 frames (frames 1040 to 1046, 1072 to 1074).
- **A dashed pill** marks something false; a brighter one marks the truth.
- **Corner badge:** one small round marker that switches sides with its section. We use a key tag instead. Keep it that way.
- **Comic pops:** dark spiky burst with gold text on a head, a stamp that lands with a slight tilt.
- **Numbers and counters** sit in a dark rounded box near the corner, ticking up.
- **Text alone on dark** uses heavy type with a soft warm glow. Terminal text is monospaced with a block cursor, and the view drifts upward as lines arrive.
- **Labels did not land on word starts** any more often than chance (34% within 0.15 s, against 47% for random times). They follow the idea, not the syllable.

## 11. Transitions

- **Hard cut:** 95%. It's the default.
- **Torn wipe:** 8 times. A jagged black line about 8 px thick crosses in 5 to 6 frames, accelerating (frames 1680 to 1685). The new shot is already moving behind it.
- **Held torn split:** 7 shots, with both sides still acting. Sometimes the tear arrives, holds, then moves on.
- **Dissolve:** only for time passing, over 10 to 20 frames (2 times).
- **Fade:** title and end card only.
- **Line art draws itself** with a stroke reveal over 15 frames or more (frames 1684 to 1698). Use `pathLength` and `strokeDashoffset`.
- **Dread shape:** a jagged black mass descends from the top over a crowd. Use once, if at all.

**In Remotion:** `TornWipe` in `world.tsx`. For a held split pass `hold`, a value from 0 to 1.

## 12. Cutting to narration

- 1,013 words, 2.8 words per second inside phrases, 103 phrases with a median of 2.8 s, speech on 59% of the running time.
- Pauses: 209 over 0.35 s, 59 over 1 s, 26 over 2 s, longest 13.5 s. **Long silences are used**, while something plays out in picture.
- **Words per shot:** median 3, p90 9. 21% of shots have no words at all. So a phrase usually spans more than one shot.
- **Cuts lean toward phrase starts but aren't tied to them:** 37% fall within 0.25 s of one (random: 21%). 28% land inside a word.
- **Rule:** let picture run under speech. Cut on the idea change, or mid-phrase on the noun being shown, and don't pad shots to fit lines.

**What this means for our builder:** `make_special.py` makes each shot as long as its lines plus padding, one shot per line group. That alone forces our 5 s pace. A next film needs the voice laid
out first, then shots timed against it with several shots per line.

## 13. Sound (measured, not heard)

- **Loudness:** -15.0 LUFS integrated, LRA 4.7 LU, true peak -1.6 dBFS. Normalize there rather than our -14.
- **Voice vs bed:** voice median -17.7 dB, gaps between words median -29.3 dB, so about 11.6 dB of separation. Gaps range from -41 to -21 dB.
- **The bed is low.** In gaps there is more energy at 20 to 80 Hz than during speech (29 vs 23 dB), and almost nothing above 4 kHz (11 dB vs 28 dB during speech). So the music sits below the voice in frequency.
- **It moves by act.** Gap level by minute: -26, -28, -29, -30, -30, **-37**, -33, -28, -25. The quietest stretch is the emotional low, and it rises for the ending.
- **Almost never silent:** 0.4% of windows under -50 dB (ours: 4.7%).
- **Stereo:** side about 19 dB below mid. Ours is near mono at -51 dB.
- **Hits on cuts:** 23% of cuts have a jump over 6 dB within 100 ms (random: 13%). So some cuts carry a sound and most don't. Sound effects are used, not constant.

**Our synthesized bed will not match by measuring alone.** Someone should listen to the voice and music. This remains the least verified area.

## 14. How the code maps

| Need | Where |
|---|---|
| Puppet, poses, walk, faces, blinks | `src/special/rig.tsx` |
| Detailed room, top-down hand, wood, dust, pill, torn wipe | `src/special/world.tsx` |
| Example scene using all of it | `src/special/Proof.tsx`, composition `SpecialProof` |
| Voices, mouth shapes, stereo bed, render | `scripts/make_proof.py` |
| Measure any film | `scripts/whatif/` (see below) |

`Special.tsx`, `Sil.tsx` and `sets.tsx` are unchanged, so the published film still rebuilds. A next film should build its shots on `Puppet` and `world.tsx`.

**To measure a film,** after `ffmpeg -vn` to 24 kHz stereo `f32le` as `audio_st.f32` in the data folder:

```bash
python3 scripts/whatif/decode_small.py film.mp4 out/whatif/x
```

```bash
python3 scripts/whatif/detect_cuts.py out/whatif/x
```

```bash
python3 scripts/whatif/shot_table.py out/whatif/x out/whatif/x/shots_raw.csv
```

```bash
python3 scripts/whatif/motion_bursts.py out/whatif/x out/whatif/x/shots_raw.csv out/whatif/x/bursts.json
```

```bash
python3 scripts/whatif/audio_stats.py out/whatif/x/audio_st.f32 out/whatif/x/events.json
```

Use these on your own film before you call it done. Targets: mean shot under 2.6 s, under 5% of shots without motion, moving share above 50%.

`shots.csv` columns: `transition_in`, `type`, frames and seconds, `zoom_pct_s` (+ = push in), `pan_x_px_s` and `pan_y_px_s` (720p px/s, + = picture moves right or down), `moving_frac` and `move_*` (share and box of the frame with local motion), `held_frac`, `diff_lag2`, luma percentiles, `sat_mean`, `corner_over_center`, `mean_rgb`, `n_pops` (local pose or label events), `n_cam_jumps`.

## 15. What must stay different

Technique is free to learn; these are not ours to take:

- Story, premise, names, lines, the plot beats, the terminal twist, the bell curve of tiny people.
- The hero's blue hoodie, and the glasses-and-scarf or hair-bow cast designs. Ours have red cap and mustard vest, and their own signature items.
- The plus/minus corner badge (ours is a key tag), the wristwatch hand marker, the kitchen as the home base.
- Palette: theirs is navy and amber, ours teal, burgundy and brass.

And change these deliberately, so that the craft isn't a copy of the look. Keep characters as our black-silhouette family, but vary their signature pieces, rim colors and sets by film.

## 16. The proof

A clip of 18.8 s in our own film's world: the "fire marshal" gag from the hotel, in 10 shots. It is built only from
`rig.tsx`, `world.tsx` and direction in `Proof.tsx`. No frame was traced. The clip and comparison stills are local, under
`out/whatif/proof/` (gitignored, because the stills contain reference frames). Rebuild with `python3 scripts/make_proof.py`.

| Measure | Reference | Our v2 | Proof clip |
|---|---|---|---|
| Mean shot length | 2.27 s | 5.41 s | 1.88 s |
| Frames with local motion | 60% | 22% | About 64% |
| Shots with no local motion | 2.6% | 34% | 0 |
| Median push, wide / close-up | 0.96 / 0.04 %/s | About 1.1 on all | 0.7 / 0.02 %/s |
| Side vs mid, stereo | -19 dB | -51 dB | -5 dB (too wide) |
| Integrated loudness | -15.0 LUFS | Not compared | -16.1 LUFS |

A 19 s clip with hand-placed action will score well on these, so they show the method can reach the numbers, not that a
whole film would.

**Judged by reading frames. Nobody watched it at speed or listened to it.**

Closed, or close:

- **Body construction and proportions.** Jointed limbs, planted feet, the rim light. Side by side, this is the same kind of figure.
- **Pose-to-pose timing.** Moves and holds follow the measured numbers.
- **Face changes by crossfade**, held mouth shapes, rare blinks.
- **Tracked walk, eased fast zoom, torn wipe, rack focus, pill.** All work and are reusable.
- **Pace.**

Better but still short:

- **Room detail.** The lobby is far denser than v2, but props are bigger and simpler, and the light is less subtle than the reference's kitchen. Its dark teal also reads heavier. The vignette is correct by number, yet the wide still looks darker than a reference day scene.
- **Top-down shots.** The hand is now large and built from separate fingers, but it is upright and reads as a glove. The reference's overlapping fingers, soft sheen and object density are better. Phones and UI were not attempted.
- **Faces.** The reference's turned face bends its features around the disc, and adds soft shadows round the eyes and glasses. Ours only slides and thins them.
- **Garments.** No hood, pocket or drawstring-level detail. The reference's clothes carry far more character.
- **Acting.** The reach-and-show-badge reads clearly but stiffly. A hand-directed feel comes from many small choices the rig doesn't make for you.

Not addressed:

- Voice and music. The bed is a test, its stereo width overshoots, and the voices are the same free edge-tts.
- Dark data scenes, line-art draw-on, UI screens and held splits. Described above, not built with the new tools.
- Lip movement is derived from loudness and has not been judged by ear.
- Whether the clip plays well at full speed. A person needs to watch it.

**Cost to keep in mind.** `Proof.tsx` is about 520 lines for 19 s, and rendering took about 8 minutes at 1080p with blur layers. A full film at this pace is about 130 shots for 5 minutes, so it needs a shot data format rather than hand-written components, plus a builder that lays out voice first (section 12). Neither exists yet.
