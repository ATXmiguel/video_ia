# Shift Happens — interactive story channel

**Shift Happens Uploader uses YouTube API Services** to publish episodes to the creator's own YouTube channel
and read the A/B votes in its comments.
[Privacy Policy](PRIVACY.md) · [Terms of Service](TERMS.md) ·
[YouTube Terms of Service](https://www.youtube.com/t/terms) ·
[Google Privacy Policy](https://policies.google.com/privacy)

Vertical (1080×1920) episodes of ~55–60s for YouTube Shorts (channel ATX_amassanoobstroo). Every episode ends on
an A/B choice; the **most-liked comment** with A or B picks what happens next, and is shown at the start of the
next episode. Everything is drawn procedurally in Remotion (flat stick-figure style, SVG), voices are Microsoft
neural TTS via `edge-tts` (one voice per character), music and sfx are synthesized with ffmpeg. No paid APIs.

- `episodes/BIBLE.md` — premise, cast, HUD rules, canon. Update the canon after every episode.
- `STYLE_NOTES.md` — what makes this format work (studied from a successful channel).
- `DAILY_PLAN.md` — what the daily routine does.  `CLOUD_MIGRATION.md` — moving it off this PC.
- `state.json` — published episodes, URLs, votes.

## Make an episode

```bash
python3 scripts/make_episode.py episodes/ep002.json
```

Output: `out/ep002.mp4` (full quality) and `out/ep002_upload.mp4` (<10 MB, for the Chrome upload).
`--no-render` only regenerates audio + `public/ep002/build.json` (preview with `npx remotion studio`).
Check frames with `npx remotion bundle src/index.ts --out-dir=build` then
`npx remotion still build Episode f.png --frame=N --props=public/ep002/build.json --scale=0.4`.

## Episode script (`episodes/epNNN.json`) — see `episodes/ep001.json`

| field | meaning |
|---|---|
| `hook`, `hookAccent` | title card over the first 2.2 s (also the thumbnail): short line + red punchline |
| `topComment` | `null` for ep 1, else `{user, text, likes}` of last episode's winning comment |
| `recap` | optional scene spec shown in gray behind the top comment (copy last episode's final scene) |
| `scenes[]` | 6–8 scenes, 1–2 short lines each |
| `choice` | `question` + 2 `options` (`key`, `label` ≤ 4 words, `teaser` ≤ 4 words, `icon` = cast member) |

Scene keys:

- `set`: `exterior` | `counter` (cast stands behind the counter) | `kitchen` | `dining`
- `cast[]`: `who` (you, kevin, tyler, lily, brenda), `x` (0–1080), `pose` (idle, point, shock, cheer, angry,
  shrug, sad), `face` (neutral, happy, shock, angry, smug, sad, love), `flip` (face left), `toX` (walk there)
- `lines[]`: a string is narration; `{"who": "kevin", "text": "..."}` is a character speaking
- `hud`: `{tips, rage, badge}` — values animate from the previous scene
- `stamp`: `{text, color: red|green|yellow|blue, line}` — slams in when that line starts
- `zoom`: punch in on one cast member · `fx`: `shake` | `flash` (fires with the stamp)

New sets go in `src/art/Sets.tsx`, new characters in `src/palette.ts` (look) + `VOICES` in the script.

## Writing rules

- Second person, present tense, short punchy sentences — they become 1–2 word captions.
- Episode 2+: the first story scene resolves the winning choice immediately.
- A twist around 40 s; end on a dilemma where both options are tempting.
- ~120–140 words total (55–60 s). Something visible changes in the HUD in most scenes.
- Teen-friendly humor, no real brands, no real people, nothing mean-spirited about real groups.

## Notes

- `remotion.config.ts` uses a short-path copy of headless Chrome (`~/.cache/remotion-chrome`)
  when present; delete that config line if renders work without it.
- `edge-tts` needs `truststore` on this network (handled in the script).
