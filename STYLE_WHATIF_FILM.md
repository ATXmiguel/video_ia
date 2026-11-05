# Animation style study: "What if" mini-film

Separate from `STYLE_NOTES.md`, which covers the vertical choice reels. This one covers a horizontal, narrated
short film. Studied 2026-11-04 from "What If You Had 500 IQ?" (Ifverse, https://www.youtube.com/watch?v=4kHPfx6Gy00):
the full transcript plus one frame every 3 s across all 8:56 (178 frames).

Measured rules are in `docs/whatif/REPLICATION_GUIDE.md`, and they override this file where they differ, above all on pace (2.27 s per shot, not 4.1 s) and blur.

Learn the craft below. Don't reuse its story, characters, names, jokes, hero design or lines.

What was not checked: voice and music were not listened to, so anything about sound comes from the transcript and
a loudness reading. The second pass used the watch-video skill at 1280 px on scene cuts (159 frames, about 10 read at
full size). The cut counts come from ffmpeg scene detection, which misses cuts in dark, low-contrast scenes.

## Format

- 16:9 at 24 fps, with wide black bars top and bottom. 8:56 long, marked "Part 1 of 3".
- Second-person narrator all the way through ("you"), plus short character lines.
- Few words on screen and no running captions. Text only appears inside the world or as a small label.
- Measured: 127 detected cuts, about 4.1 s per shot on average. Roughly 22, 16, 10, 18, 24, 11, 2, 18, 6 cuts per
  minute. Fast in the setup and the crisis, and slow for the emotional beats. Minute 6 is dark, so its count is low.
- Loudness: mean -18.3 dB, peak -1.6 dB.

## Characters

- Round, solid black heads on thin tapered stick limbs. The whole face is white eyes and a small white mouth.
- Each person gets one signature item: a colored hoodie, glasses and a scarf, a hair bow, a headset, a tie.
- Only the hero wears a strong saturated color, so the eye finds them in any crowd or wide shot.
- Rim light around the silhouette carries the mood: warm orange when safe, cold blue when tense.
- Extras are thin dark silhouettes with no face details.
- Body acting is minimal: leaning, a slow head turn, a shift in the eyes. Faces do most of the work.

## What makes it look lit instead of flat (second pass, frames studied at full size)

The first version of our film copied the shot types and still looked flat. These are what was missing:

- **Wide bars.** 40 px of 720 top and bottom (60 px at 1080), not a thin line.
- **Vignette on every shot.** Corners fall off strongly, and it does a lot of the "film" look.
- **Muted sets, one strong subject.** Backgrounds are low-saturation and low-contrast, with lifted blacks. The
  black character and the one saturated garment sit on top and pop.
- **One clear light source per shot.** A window or lamp. The wall glows around it and falls off with distance, and the
  floor gets a pool under it. Night is the same room with less light, not a different palette.
- **Rim light is thick and directional.** A solid crescent, about 14 px of 720 on a close-up, on the side facing the
  source, on the head, arms and legs alike. Warm when safe, cold when tense.
- **Heavy background blur on close-ups.** About 8 px of 720 (we use 19 px at 1080 on the set layer). The strip of counter
  nearest the lens stays sharp, so there are three planes.
- **The camera is close.** Close-up heads are about 330 px across on a 720 frame, and wide shots still crop the room.
  Characters fill the frame; sets are never fully visible.
- **Parallax.** Background, cast and foreground move at different speeds during the slow push.
- **Foreground objects near the lens.** Dark, very blurred shapes at the frame edge in many shots.
- **Soft shadows everywhere.** Under props on the desk, under furniture, contact shadows at the feet, and a faint
  blurred shadow of the character on the wall.
- **Texture.** Stitching on the bag, tile grids, wood planks, wall panels, plus a little grain.
- **Characters.** Long neck, sleeves in the garment color with a dark outline, cream dot eyes with half lids for mood.
- **Rack focus.** Sometimes two objects at different depths: the far one soft, the near one sharp.

## Shot vocabulary (rotate these; never hold one type for long)

1. **Side-on wide.** A flat, detailed set like a dollhouse cross-section, with the characters small inside it.
2. **Close-up with blurred background.** A big head, the same set out of focus behind it, a foreground strip at the
   bottom. This is the reaction shot.
3. **Top-down table.** Warm wood, stylized hands with segmented fingers, and objects: phone, watch, papers, photos.
4. **Top-down map.** The whole place from above, with small figures moving and pill labels explaining the logic.
5. **Dark data scene.** A navy background with a single glowing idea: a counter, a list, a graph made of tiny people,
   a line network lighting up node by node.
6. **Line-art diagram.** Thin pale lines on navy, used to explain how something works inside a person.
7. **Full-screen UI.** A phone, list or form filling the frame, with a highlighted row and a slow zoom.
8. **Torn split-screen.** Two scenes divided by a jagged black line, to show two things at once or a contrast.
9. **Object insert.** One object alone, in flat graphic style: a name tag, a uniform on a hanger, a badge.

## Color and light

- The time of day follows the emotional arc: warm morning, gray daytime, dusk, dark night, then warm dawn.
- Upside moments are warm and saturated. Downside moments drop to near-grayscale blue with the hero still in color.
- The climax goes dark with a single warm light source in the room (a lamp, a screen) and glowing data.
- Shallow fake depth of field on close-ups. Soft vignette, soft shadows, and no thick black outlines on sets.
- Sets are flat vector with lots of small details: fridge magnets, wall calendars, a window city that changes with the hour.

## Motion

- Slow, constant camera push or drift on nearly every shot, so nothing is ever fully still.
- Scene changes are hard cuts, plus match cuts on an object or a shape.
- Scene-to-scene continuity: the same set returns many times, changed by light or by small details, which makes
  the world feel real and cheap to produce.
- Small comic pops: "HA!" bursts, a little stamp, a label sliding in.
- Typewriter text on a terminal for the final reveal.

## On-screen graphics

- Small pill labels in the world, 2 to 4 words, in spaced capitals.
- A small persistent corner badge sorts the first half into "upside" and "downside" sections.
- Big numbers alone on dark ($ amounts, a score, a counter ticking up), used as beats.
- A short safety or fact line along the bottom when the story teaches something real.

## Story structure (the craft worth keeping)

| time | beat |
|---|---|
| 0:00–0:17 | Cold open: a concrete, impossible little proof of the premise, before anything is explained |
| 0:17–0:47 | The "what if" stated, with one real statistic turned into a visual, then the hero's number |
| 0:47–3:55 | "Amazing and awful": a run of perk/cost pairs, each one a short gag, each cost lonelier than the last |
| 3:55–4:37 | The one person who makes the hero care, built through small physical details |
| 4:37–7:23 | That person gets hurt; the hero's rule ("I never use it") breaks; a clever non-violent answer |
| 7:23–8:14 | Payoff: wide proof that it worked, then the hero finally feels what they've been missing |
| 8:14–8:56 | A last twist from a bigger unknown, then a question to the viewer on a simple end card |

Rules that make it work:

- Every perk comes with a specific image, not a description.
- A rule the hero sets early pays off when they break it.
- An early throwaway (a joke, an object) comes back in the ending with new meaning.
- Real facts, a few of them, make the fantasy feel plausible.
- The end card: title question in big type, the cast in a circle of light, comment and like icons popping in.

## How to tell this apart from our Shorts

| | Shift Happens Shorts | This style |
|---|---|---|
| Frame | 9:16, bright flat colors | 16:9, moody and lit |
| Pace | new visual every 2–4 s, 1–2 word captions, HUD, stamps | ~4 s shots with slow push, no captions, no HUD |
| Faces | skin tone, thick outlines | black silhouettes with white features and rim light |
| Length | 55–90 s | several minutes |
