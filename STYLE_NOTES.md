# Test: cold open (from ep006, started 2026-11-04)

**Problem.** Ep1–4: 58% of Shorts viewers skipped, 42% kept watching, average view 0:27 of 1:00 on Ep1. Parts 2+ opened
with ~2.6 s of silence under the title card, then "Top comment said…" over a gray recap, so the story began around 5 s.
Every part also lost views to the one before it, and viewers were almost all new, so the opening has to work for strangers.

**Change.** Voice from the first moment on a line that states the stakes for a newcomer; title card only 1.1 s, over the
voice; no gray recap; the winning comment becomes a small unspoken badge on the scene that resolves the vote.

**How to judge it.** Compare "Continuaram assistindo" for ep006 onward against the 42% baseline, over at least 3 episodes with
a couple of days of data each. Retention matters more than raw views here, since views also depend on the feed and age.
Small numbers, so treat a few points' difference as noise. Keep it if it clearly rises; otherwise go back to look at the hook itself.

# Study 2 (2026-11-02): five Instagram channels, frame by frame

Reels sampled with screenshots every few seconds, plus captions and top comments.

| channel | followers | posts | views | format |
|---|---|---|---|---|
| @escolhas.app (PT) | 305k | 14 | 5.2M → 1.3M, all 14 above 1M (newest still rising) | "Day N of 30": a gross gamer has 30 days to glow up before a date; viewers pick each fix |
| @notruecolorstory (EN) | 76k | 11 | 7.2M, 6.6M, 2.4M… | 2nd-person horror with **rules** ("3 rules", "line seven"), "NIGHT 1", "YOUR STOP" |
| @escolhadagalera (PT) | 7k | 6 | 289k → 34k | same template as escolhas.app: a bar has 30 days to fill up or it becomes a pharmacy |
| @pacoquito01 (PT) | 8.6k | 62 | 771k / 476k / 372k hits, most 20–60k | one-off "nesse mundo…" what-if stories with a big plot twist; no voting |
| @fatos_animados10 (PT) | 1.3k | 11 | 851k / 362k hits, flops of 2–5k | 3D facts. Hits: 2nd-person retelling of a famous story, "why you get sleepy after lunch"; flops: school-lesson facts |

Our numbers for comparison: Ep1 1,083, Ep2 617 (YouTube Shorts only).

## What the winners do that we don't

1. **A finish line.** escolhas.app is a countdown to a goal: "30 DIAS PARA O ENCONTRO". The HUD has
   **DIAS RESTANTES 30** and a **GLOW-UP 0%** bar. Every caption starts "Dia 12 de 30" and says "todo ajuste fica
   pra sempre" (every fix is permanent). Viewers follow along to see Day 30. Our HUD (tips, manager rage) has no
   end goal, and our parts don't add up to anything.
2. **Vote with ONE WORD, not A/B.** "Comenta UMA palavra: DENTES ou QUARTO." The comments read like a debate
   ("Tropa do perfume 👉", "Limpar o quarto ----👉") and the top ones get 6k–20k likes. A letter carries no
   opinion. The words are the option's noun: DENTES / QUARTO, GELADEIRA / BANHEIRO, PHONE / DOOR.
3. **The choice card shows both futures.** The screen is split in two colors with an X in the middle. Each half
   draws the hero already doing that option, with the big word on top, a 2–3 word subtitle, and a "DIA 2 →" tag.
   notruecolor uses two pill buttons with icons ("📱 PHONE" / "🚪 DOOR"), and in Part 2 each button carries its
   consequence ("STEP OFF — breaks rule three").
4. **Phone screens.** Both big channels cut to a full-screen phone: texts from "Me" ("Don't turn on the light"),
   a chat with Laura ("30 dias"), a bank app (R$ 4,20). It reads instantly, it builds suspense line by line, and
   it is cheap to draw. We have no phone scene, and ep003's plot was literally a phone.
5. **Later parts open with the payoff.** Day 12 of escolhas.app opens on "DIA 1 — ele era assim 🤢" (the gross
   before), then cuts to now. The first second answers "is it worth watching?". Our opener is the top comment
   over a gray recap, which is good for the community and weak as a hook.
6. **Longer, but always moving.** Winners run 75–120 s (escolhas 92–115 s, notruecolor 83–104 s, pacoquito 55–120 s),
   with a new set every 5–10 s (room, kitchen, street, park, phone). Ours are 55–60 s and stay in one restaurant.
7. **Imagine / POV hook in the first word.** "IMAGINE your phone wakes you up", "nesse mundo, a foto da escola
   mostra você daqui a 25 anos", "Everyone on this train…". One sentence sets a world with a strange rule. Our hooks
   are good titles ("YOU STOLE HIS PHONE.") but the first spoken line is a continuation.
8. **Captions as a sales page.** "Dia 1 de 30 😬 [premise]. VOCÊ escolhe cada ajuste… Comenta UMA palavra: X ou Y.
   A mais votada é resolvida no Dia 2… Segue pra não perder a transformação." notruecolor adds a share line:
   "Send this to the person who always falls asleep on the train 😴". The channel comments "Dia 2 lançado!" /
   "NIGHT 2 IS UP 👀" on the previous episode (3.5k–21k likes): that comment is how people find the next part.
9. **The platform is Instagram.** All five channels are on Reels. Even a brand-new copy (escolhadagalera,
   6 posts) got 289k on its first video. pacoquito copied the template once ("DIAS PRA AULA 29 / CHANCE COM
   A BIA 1%") and got 20k on a channel whose audience came for twist stories: the template works best on a
   channel that *is* that series from day one.
10. **Relatable or famous beats educational.** fatos_animados: a school lesson about microbes got 5k, "why you
    get sleepy after lunch" got 362k. Everyday embarrassment (body odor, messy room, no money, crush) is
    universal; workplace drama is narrower.

Not worth copying: 3D mannequins (the flat style works fine for escolhas.app); other people's
characters or famous stories (copyright); the "learn to make these videos, link in bio" upsell.

## Changes made to our pipeline

- One-word voting: options have a `word`. The choice card is a split screen showing YOU doing each option,
  "COMMENT ONE WORD", and a "PART N →" tag. `youtube_api.py top` counts the word or the letter.
- `set: "phone"` scene with a chat that fills in line by line.
- Optional `goal` HUD (countdown + progress bar) for stories with a finish line (from story 2 on).
- Episodes may run 70–90 s. The upload copy drops to 720p when needed to stay around 6 MB.
- DAILY_PLAN: Instagram-style description, share line, and a "PART N IS UP 👀" comment on the previous episode.

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
