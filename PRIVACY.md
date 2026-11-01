# Privacy Policy — Shift Happens Uploader

_Last updated: 2026-10-31_

Shift Happens Uploader is a private tool run by the owner of the YouTube channel **ATX_amassanoobstroo**
(contact: miguel.barbosa.godinho@gmail.com). It is not offered to the public and has a single user: the
channel owner.

## What it accesses

Through the YouTube Data API, with the channel owner's OAuth consent, the tool:

- uploads videos produced by the owner to the owner's own channel and sets their title, description and visibility;
- posts a comment on the owner's own videos;
- reads the public comments (author display name, text and like count) on the owner's own videos, to find the
  most-liked comment that votes for the next episode.

## How data is used and stored

- The only YouTube user data processed is the public comments on the owner's videos. The winning comment's display
  name, text and like count are shown in the next episode (the same information is already public on YouTube),
  and recorded in the project's `state.json`. No other comment data is kept.
- OAuth tokens are stored only on the owner's computer and as encrypted GitHub Actions secrets in the owner's
  private automation. They are never shared.
- No data is sold, shared with third parties, used for advertising, or combined with other data sources.

## Your choices

Anyone who wants their comment removed from a future episode can email the address above. The channel owner can
revoke the tool's access at any time at https://myaccount.google.com/permissions.

This tool's use of information received from Google APIs adheres to the
[Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy) and the
[YouTube API Services Terms of Service](https://developers.google.com/youtube/terms/api-services-terms-of-service).
YouTube's own privacy policy applies to YouTube: https://www.google.com/policies/privacy.
