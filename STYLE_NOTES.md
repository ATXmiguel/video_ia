# What works in interactive-choice reels (studied 2026-10-31)

Reference: @aurafarmingchoice on Instagram, 6 days old, 19.3k followers, 9 reels.
Views: Ep1 ? · Ep2 418k · **Ep3 636k** · Ep4 417k · Ep5 428k · Ep6 309k · Ep7 109k (newest) · second series 92k / 48k.
Learn the mechanics below; don't copy their characters, school or "aura" premise.

## Mechanics to use

1. **The viewer is the protagonist.** Second person ("you got transferred..."), the main character is labelled
   YOU, and the options say what *you* do. Choices feel personal, so people argue about them.
2. **A visible game system.** A HUD stays on screen the whole time: a score card top-left that changes after
   every choice (10,067 → 60,067), a meter top-right, and status badges (LOCKED IN, DETENTION). Each decision
   has a visible, measurable consequence, so it feels like playing a game.
3. **The community is in the video.** Episodes 2+ open with the real winning comment (username + like counter
   going up, "ALMOST 10K LIKES") over a quick grayscale recap and a PART N badge. "Most-liked comment decides"
   turns the comments into a campaign: the top comment on Ep1 has 37k likes. The caption credits the winner.
4. **Speed.** A new visual every 2–4 s; 1–2 word captions with the key word in a yellow box; stamps and labels
   popping in (CHOPPED, DETECTED, "W RIZZ ✓"); small speaker avatars next to dialogue.
5. **A world premise in 5 seconds.** Ep1: building establishing shot → "transferred to a school where everyone
   has a visible score" → scanner judges you → you're humiliated → conflict. No slow build.
6. **A twist around 40–45 s,** then the dilemma. End card: "WHAT DO YOU DO?", two big cards (icon + option +
   a teaser line like "HE OWES YOU" / "GENIUS OR CRINGE?"), "COMMENT A OR B 👇", "TOP COMMENT DECIDES PART N".
7. **Covers that read as a series.** Every reel has a title card with a cliffhanger line ("CAUGHT. BY HER DAD💀")
   and an episode tag at the bottom, so the profile grid looks like a show to binge.
8. **Style.** Flat bright colors, thick outlines, big-head stick figures, simple sets. Cheap to make, readable
   on a phone, very consistent. Dark, moody frames get lost in the feed.
9. **Audience and slang.** A Gen-Z teen audience and its slang (rizz, mog, glazed, chopped, clanker, 67).
   High-school life: crush, rival, detention, a robot hall monitor.
10. **Cadence.** 9 episodes in 6 days. Views peaked at Ep3 and then decayed; a second series started cold.

## For our pipeline

- Voting: **most-liked comment** with an A/B in it wins (not a vote count). Show it in the next intro (username + likes).
- Add a `hud` to episodes: score, meter, status badge, changing per scene.
- Captions at 1–2 words; a stamp/label element for punchlines.
- Choice cards get an icon + a teaser line.
- Draw a cover/title card at frame 0 with the episode's cliffhanger line and a series + episode tag.
