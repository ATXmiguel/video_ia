"""YouTube Data API helper for the channel's own uploads, comments and votes.

Credentials come from secrets/client_secret.json + secrets/token.json locally, or from the
YT_CLIENT_SECRET_JSON / YT_TOKEN_JSON environment variables in CI. Never print tokens.

Usage:
  python3 scripts/youtube_api.py auth                 # one-time consent, writes secrets/token.json
  python3 scripts/youtube_api.py whoami               # channel the token belongs to
  python3 scripts/youtube_api.py upload FILE.mp4 meta.json   # meta: title, description, tags, privacy
  python3 scripts/youtube_api.py comment VIDEO_ID "text"
  python3 scripts/youtube_api.py top VIDEO_ID         # most-liked comment that votes A or B, as JSON
"""

import json
import os
import re
import sys
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
    if not creds.valid:
        creds.refresh(Request())
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


def top(video_id: str) -> None:
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
            m = re.search(r"\b([AB])\b", c["textDisplay"].upper())
            if m and (best is None or c["likeCount"] > best["likes"]):
                best = {"user": c["authorDisplayName"], "text": c["textDisplay"], "likes": c["likeCount"], "vote": m.group(1)}
        token = res.get("nextPageToken")
        if not token:
            break
    print(json.dumps(best, ensure_ascii=False))


if __name__ == "__main__":
    cmd, *args = sys.argv[1:]
    {"auth": auth, "whoami": whoami, "upload": upload, "comment": comment, "top": top}[cmd](*args)
