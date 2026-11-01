# Shift Happens — series bible

**Premise.** You're 17 and just got your first job at **Big Bun's**, a burger place where everything goes wrong.
The viewer is "YOU" (red cap, never speaks much — the narrator talks to you in second person).
Comedy first: every episode is one shift-disaster, ends on a dilemma, top comment picks.

## Stories (sagas)

The series is a run of **stories of 4–7 parts (target 5)**. Each story is **a new job for YOU** — the
"Shift Happens" brand fits any job: burger place, movie theater, theme park, pet shop, hotel, ice-cream
truck, haunted mansion tour... YOU, the second-person narration and the HUD stay; the set, the boss, the
coworkers and the HUD labels change (`hudLabels`, e.g. TIPS / MANAGER RAGE, TICKETS SOLD / BOSS PATIENCE).

Shape of a story:
1. **Part 1 — new job.** Establish the place, the boss, the rival and an ally in 10 s; first disaster; vote.
2. **Parts 2–4 — escalation.** Each part resolves the vote in its first scene, makes things worse, adds a twist
   around 40 s. Part 3 should be the strongest episode (it was the peak on the reference channel).
3. **Final part — ending.** Resolves the last vote with a real conclusion (promoted, fired, quit, chaos), shows the
   final HUD, and ends with the **"next story" vote**: "WHERE DO YOU WORK NEXT? A: movie theater / B: theme park".
   Mark it `"final": true` in `arc`. The winning job becomes story N+1, part 1.

Length rule (decided by the daily run, using `python3 scripts/youtube_api.py stats <ids>` ~24 h after each upload):
- Default: the final part is part 5.
- **End early** (part 4 becomes the final) if part 3's or a later part's views are more than 40% below the story's
  best part so far.
- **Extend** to 6 or 7 if part 5 is the story's best or second-best part and part 4→5 views went up.
- Never shorter than 4 or longer than 7.

Continuity between stories: a fan-favorite character may cameo in a later story (e.g. Brenda shows up as a
customer at the movie theater). Keep a "Stories" log below with how each one ended.

## Cast (looks + voices are in `src/palette.ts` and `scripts/make_episode.py` — keep them stable)

| who | role | personality |
|---|---|---|
| you | new hire | the viewer. Good heart, terrible luck |
| kevin | manager | bald, mustache, tie. Loves rules and his fryer. Rage meter is *his* |
| tyler | coworker / rival | spiky hair, smug. "Employee of the month, six months straight". Steals credit and tips |
| lily | coworker | ponytail, kind, funny. Possible crush. Split her tips with you on day one |
| brenda | customer | huge yellow hair, sunglasses on her head. Always angry, always "the customer is always right" |

New recurring characters need a `CAST` entry (look) and a `VOICES` entry before they appear.

## Game system (HUD)

- **TIPS $** — goes up for good moves, gets stolen/lost for bad ones.
- **MANAGER RAGE %** — Kevin's anger. 100% = you get fired (an arc-ending cliffhanger, use rarely).
- **Badge** — your status: NEW HIRE, SUSPECT, ON THIN ICE, LILY'S FAVORITE, EMPLOYEE OF THE WEEK...
- Change at least one value in most scenes; the viewer should *see* the consequences of the vote.

## Stories log

| # | job | parts | how it ended | views best part |
|---|---|---|---|---|
| 1 | Big Bun's (burger place) | in progress | — | — |

## Canon so far (story 1: Big Bun's)

- Ep 1 "First day. Already framed?!" — Kevin's rules (customer always right; nobody touches his fryer).
  Tyler served Brenda a raw burger and blamed you. Kevin: fix it in ten seconds or you're fired.
  Choice: A take the blame (Lily is watching) / B expose Tyler (he'll want revenge).
