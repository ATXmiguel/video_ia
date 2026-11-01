# Moving the daily run off this PC

Goal: the PC can stay off. A Claude cloud routine writes the episode and pushes it to GitHub; a GitHub Actions
workflow renders it and uploads it through the YouTube Data API; votes are read through the API too.

Why it can't happen today: in the cloud there is no logged-in Chrome, so uploads must use the YouTube API, and
YouTube keeps every API upload **private** until the Google Cloud project passes an API audit.

## Status (2026-11-01)

- Repo: https://github.com/ATXmiguel/video_ia — **public** (scanned: no secrets in history; `secrets/` is
  gitignored). Actions logs are public too: never print tokens. `gh` CLI not installed/logged in yet.
- Google Cloud project `shift-happens-uploader` (number 541014094342), **no billing account** (keep it that way:
  the API is free within the 10k units/day quota). YouTube Data API v3 enabled. OAuth app "Shift Happens
  Uploader": External, **In production** (unverified, which is fine for a single owner), branding points to
  README/PRIVACY/TERMS on GitHub. Desktop client in `secrets/client_secret.json`.
- OAuth done for the channel owner account → channel `UCYr4LVpGYwMKC5MgANp63qQ`
  ATX_amassanoobstroo. Refresh token in `secrets/token.json` (gitignored). `scripts/youtube_api.py whoami`
  and `top <video>` work. Uploads via the API stay **private** until the audit is approved.
- Audit form **submitted by the owner on 2026-11-01** (evidence kept locally in `docs/audit/`, not in git).
  The answer arrives by email to miguel.barbosa.godinho@gmail.com. Daily check: Gmail search
  `newer_than:60d (from:google.com OR from:youtube.com) (audit OR auditoria OR quota OR "API Services")`;
  read the thread — only an explicit approval counts as prerequisite #4. If Google asks for more info,
  tell the owner (don't reply yourself).

## Prerequisites (the user does 1–3 once; the daily run checks them every day)

| # | what | how the daily run checks it |
|---|---|---|
| 1 | GitHub repo for this project, and `gh` logged in on this PC | `git remote get-url origin` works and `gh auth status` is OK |
| 2 | Google Cloud project with **YouTube Data API v3** enabled + OAuth client (Desktop app); JSON saved as `secrets/client_secret.json` | the file exists |
| 3 | Audit requested: YouTube API Services audit/quota form, for uploads to the user's own channel | — |
| 4 | **Audit approved** | Gmail has an approval message for the API audit from YouTube/Google API Services |

When 1, 2 and 4 are all true and the `migrated` flag in `state.json` is not set, the daily run migrates:

1. Write `scripts/youtube_auth.py` (one-time OAuth consent in Chrome, stores a refresh token in
   `secrets/token.json`), `scripts/youtube_api.py` (upload, set metadata, pin comment, read top comments).
2. Run the auth once, then test it: upload `out/<last>_upload.mp4` as **unlisted**, confirm it stays unlisted,
   then set it to private (don't delete).
3. Add GitHub secrets with `gh secret set` (client secret + refresh token); never commit `secrets/`.
4. Add `.github/workflows/episode.yml`: on push of `episodes/*.json` → install Node, Python, ffmpeg → render with
   `make_episode.py` (no Chrome short-path config on Linux) → upload via `youtube_api.py` → commit `state.json`.
5. Create a Claude cloud routine (daily 13:30 BRT) with this repo, whose prompt is `DAILY_PLAN.md` steps 1–3 and 7–8
   using `youtube_api.py` for votes, then push.
6. Run the cloud pipeline once end-to-end. Only if the episode goes live: set `"migrated": true` in
   `state.json` (from then on the local task exits immediately) and tell the user they can disable the local
   scheduled task `shift-happens-daily` in the app. If anything fails, leave `migrated` false and report.
