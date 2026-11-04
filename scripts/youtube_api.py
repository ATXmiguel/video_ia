"""YouTube Data API helper for the channel's own uploads, comments and votes.

Credentials come from secrets/client_secret.json + secrets/token.json locally, or from the
YT_CLIENT_SECRET_JSON / YT_TOKEN_JSON environment variables in CI. Never print tokens.

Usage:
  python3 scripts/youtube_api.py auth                 # one-time consent, writes secrets/token.json
  python3 scripts/youtube_api.py whoami               # channel the token belongs to
  python3 scripts/youtube_api.py upload FILE.mp4 meta.json   # meta: title, description, tags, privacy
  python3 scripts/youtube_api.py comment VIDEO_ID "text"
  python3 scripts/youtube_api.py top VIDEO_ID [WORD_A WORD_B]  # most-liked comment that votes, as JSON
  python3 scripts/youtube_api.py stats ID [ID ...]    # views, likes, comments per video, as JSON
  python3 scripts/youtube_api.py status VIDEO_ID      # title, channel, upload and privacy status
"""

import json
import os
import re
import sys
import time
from pathlib import Path

try:  # some networks need the OS certificate store (no-op where it isn't installed, e.g. CI)
    import truststore

    truststore.inject_into_ssl()
except ImportError:
    pass

from google.auth.transport.requests import Request  # noqa: E402
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = Path(__file__).resolve().parent.parent
SECRETS = ROOT / "secrets"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"]


def client_config() -> dict:
    raw = os.environ.get("YT_CLIENT_SECRET_JSON")
    return json.loads(raw) if raw else json.loads((SECRETS / "client_secret.json").read_text())


def credentials() -> Credentials:
    raw = os.environ.get("YT_TOKEN_JSON")
    info = json.loads(raw) if raw else json.loads((SECRETS / "token.json").read_text())
    creds = Credentials.from_authorized_user_info(info, SCOPES)
    for attempt in range(3):  # this network drops TLS handshakes now and then
        if creds.valid:
            break
        try:
            creds.refresh(Request())
        except Exception:
            if attempt == 2:
                raise
            time.sleep(3)
    return creds


def youtube():
    return build("youtube", "v3", credentials=credentials(), cache_discovery=False)


def auth() -> None:
    flow = InstalledAppFlow.from_client_config(client_config(), SCOPES)
    creds = flow.run_local_server(
        port=8765, open_browser=False, prompt="consent", access_type="offline",
        authorization_prompt_message="Open this URL to authorize:\n{url}\n",
    )
    SECRETS.mkdir(exist_ok=True)
    (SECRETS / "token.json").write_text(creds.to_json())
    print("saved secrets/token.json")


def whoami() -> None:
    res = youtube().channels().list(part="snippet", mine=True).execute()
    for ch in res.get("items", []):
        print(ch["id"], ch["snippet"]["title"])


def upload(path: str, meta_path: str) -> None:
    meta = json.loads(Path(meta_path).read_text(encoding="utf-8"))
    body = {
        "snippet": {
            "title": meta["title"],
            "description": meta["description"],
            "tags": meta.get("tags", []),
            "categoryId": "1",  # Film & Animation
            "defaultLanguage": "en",
            "defaultAudioLanguage": "en",
        },
        "status": {
            "privacyStatus": meta.get("privacy", "public"),
            "selfDeclaredMadeForKids": False,
            "containsSyntheticMedia": False,  # stylized cartoon, nothing realistic
        },
    }
    req = youtube().videos().insert(part="snippet,status", body=body, media_body=MediaFileUpload(path, resumable=True))
    res = None
    while res is None:
        _, res = req.next_chunk()
    print(json.dumps({"id": res["id"], "url": f"https://youtube.com/shorts/{res['id']}", "privacy": res["status"]["privacyStatus"]}))


def comment(video_id: str, text: str) -> None:
    body = {"snippet": {"videoId": video_id, "topLevelComment": {"snippet": {"textOriginal": text}}}}
    res = youtube().commentThreads().insert(part="snippet", body=body).execute()
    print(res["id"])


def stats(*video_ids: str) -> None:
    res = youtube().videos().list(part="statistics", id=",".join(video_ids)).execute()
    out = {v["id"]: {k: int(v["statistics"].get(k, 0)) for k in ("viewCount", "likeCount", "commentCount")}
           for v in res.get("items", [])}
    print(json.dumps(out))


def status(video_id: str) -> None:
    res = youtube().videos().list(part="snippet,status", id=video_id).execute()
    v = res["items"][0]
    print(json.dumps({"id": v["id"], "title": v["snippet"]["title"], "channel": v["snippet"]["channelTitle"],
                      "uploadStatus": v["status"]["uploadStatus"], "privacyStatus": v["status"]["privacyStatus"]}))


def vote_of(text: str, words: tuple[str, ...]) -> str | None:
    # A vote is the option's word (episodes from ep004 on), else its letter ("a" is also an article, so a word wins).
    # A comment naming both options is no vote.
    up = text.upper()
    hits = {k for k, w in zip("AB", words) if re.search(rf"\b{re.escape(w.upper())}\b", up)}
    hits = hits or set(re.findall(r"\b([AB])\b", up))
    return hits.pop() if len(hits) == 1 else None


def top(video_id: str, *words: str) -> None:
    yt = youtube()
    owner = yt.videos().list(part="snippet", id=video_id).execute()["items"][0]["snippet"]["channelId"]
    best, token = None, None
    while True:
        res = yt.commentThreads().list(part="snippet", videoId=video_id, order="relevance", maxResults=100,
                                       textFormat="plainText", pageToken=token).execute()
        for item in res.get("items", []):
            c = item["snippet"]["topLevelComment"]["snippet"]
            if c.get("authorChannelId", {}).get("value") == owner:
                continue
            vote = vote_of(c["textDisplay"], words)
            if vote and (best is None or c["likeCount"] > best["likes"]):
                best = {"user": c["authorDisplayName"], "text": c["textDisplay"], "likes": c["likeCount"], "vote": vote}
        token = res.get("nextPageToken")
        if not token:
            break
    print(json.dumps(best, ensure_ascii=False))


if __name__ == "__main__":
    cmd, *args = sys.argv[1:]
    {"auth": auth, "whoami": whoami, "upload": upload, "comment": comment, "top": top, "stats": stats, "status": status}[cmd](*args)
