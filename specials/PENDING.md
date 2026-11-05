# Pending for the next "what if" films

Published so far: "What If You Could Hear Every Lie?" (v2, public), https://www.youtube.com/watch?v=ho04g8eKXVg
The relit v2 got much closer to the reference, but these differences remain. Fix them before or during the next film.

## Read this first

`docs/whatif/REPLICATION_GUIDE.md` has the measured rules and ranked gaps. `docs/whatif/shots.csv` is the full shot table.
The new rig and set pieces are `src/special/rig.tsx` and `src/special/world.tsx`, shown working in `src/special/Proof.tsx`.
The published film still uses the old `Sil.tsx` and `sets.tsx`. The proof changed no shot in it.

## What the proof clip closed

Only on the 19 s clip, judged from frames. Nobody has watched it at speed or listened to it.

- **Character animation:** jointed rig, planted feet, walk cycle, pose-to-pose timing, faces that crossfade, held mouth shapes.
- **Pace and camera:** 1.9 s shots, still close-ups, tracked walk, fast eased zoom.
- **Rack focus and torn wipe:** both work and are reusable.
- **Pill labels:** now the measured size.

## Still different from the reference

1. **A film-scale builder: built, tested only on 60 s.** `scripts/make_film.py` lays out voice first, places several shots per line and reads shots from data (guide section 17). The test scene `specials/gravity-off/` runs 2.33 s per shot. Still open: nobody has watched or heard it, no film longer than 60 s has been made, and 130 shots of hand-written JSON is real work. Its bed is also still too loud (voice 6.1 dB above it, against 11.6 dB).
2. **Acting quality.** The rig can do it, but each shot needs its own specific action. The clip's gestures are still stiffer than the reference.
3. **Set detail.** The new lobby is denser, but it is one room, and its props are simpler than the reference's. Every other set still needs this treatment, and they need day versions: ours run darker overall (median luma 51 against 75).
4. **Top-down shots.** Larger hand with separate fingers, but it still reads as a glove. Overlapping fingers, phones and UI remain.
5. **Faces and garments.** Turned faces should bend round the disc, with soft shading around the eyes. Clothes need more construction.
6. **Voice and music.** Still free edge-tts and a synthesized bed. Nobody on the production side has judged them by ear, and the clip's stereo is too wide (-5 dB side against the reference's -19 dB).
7. **Not built yet with the new tools:** dark data scenes, line art that draws itself on, phone and list screens, held splits.
