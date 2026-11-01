# Shift Happens — series bible

**Premise.** You're 17 and just got your first job at **Big Bun's**, a burger place where everything goes wrong.
The viewer is "YOU" (red cap, never speaks much — the narrator talks to you in second person).
Comedy first: every episode is one shift-disaster, ends on a dilemma, top comment picks.

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

## Canon so far

- Ep 1 "First day. Already framed?!" — Kevin's rules (customer always right; nobody touches his fryer).
  Tyler served Brenda a raw burger and blamed you. Kevin: fix it in ten seconds or you're fired.
  Choice: A take the blame (Lily is watching) / B expose Tyler (he'll want revenge).
