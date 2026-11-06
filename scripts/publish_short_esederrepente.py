"""Publish a finished Short on E Se De Repente: private first, then public, then read it back and log it.

Refuses unless check_short.py passed for this video, the token belongs to the expected channel, and the log has no video for
that slug or for today, so a re-run can't post twice. Shorts have no custom thumbnail through the API, so none is set.
usage: python3 scripts/publish_short_esederrepente.py <slug>
"""
import json
import os
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
ROOT = Path(__file__).resolve().parent.parent
CHANNEL = "UC2nFCAMKGQ9v2JksMgCbmSg"
LOG = ROOT / "specials" / "shorts_log.json"
TOKEN_FILES = [ROOT / "secrets" / "token_esederrepente.json", ROOT.parents[2] / "secrets" / "token_esederrepente.json"]
STATUS = {"selfDeclaredMadeForKids": False, "containsSyntheticMedia": False, "embeddable": True, "publicStatsViewable": True, "license": "youtube"}


def main() -> int:
    slug = sys.argv[1]
    out = ROOT / "out" / "film" / slug
    video = out / f"{slug}.mp4"
    check = json.loads((out / "check.json").read_text(encoding="utf-8")) if (out / "check.json").exists() else {}
    if not check.get("passed") or check.get("mtime") != video.stat().st_mtime:
        print("STOP: check_short.py has not passed for this exact file")
        return 2
    log = json.loads(LOG.read_text(encoding="utf-8"))
    today = date.today().isoformat()
    if any(e["slug"] == slug and e.get("url") for e in log) or any(e.get("published") == today for e in log):
        print("STOP: this slug or today's Short is already in specials/shorts_log.json")
        return 2
    token = next((f for f in TOKEN_FILES if f.exists()), None)
    if not token:
        print("STOP: token_esederrepente.json not found")
        return 2
    os.environ["YT_TOKEN_JSON"] = token.read_text(encoding="utf-8")  # only for this process; never printed
    from googleapiclient.http import MediaFileUpload
    from youtube_api import youtube

    meta = json.loads((ROOT / "specials" / slug / "meta.json").read_text(encoding="utf-8"))
    yt = youtube()
    ids = [i["id"] for i in yt.channels().list(part="id", mine=True).execute().get("items", [])]
    if ids != [CHANNEL]:
        print("STOP: token belongs to", ids)
        return 2
    body = {
        "snippet": {"title": meta["title"], "description": meta["description"], "tags": meta["tags"], "categoryId": "27", "defaultLanguage": "pt-BR", "defaultAudioLanguage": "pt-BR"},
        "status": {"privacyStatus": "private", **STATUS},
    }
    request = yt.videos().insert(part="snippet,status", body=body, media_body=MediaFileUpload(str(video), chunksize=8 * 1024 * 1024, resumable=True), notifySubscribers=True)
    response = None
    while response is None:
        _, response = request.next_chunk()
    vid = response["id"]
    url = f"https://www.youtube.com/shorts/{vid}"
    print("uploaded private:", url)
    yt.videos().update(part="status", body={"id": vid, "status": {"privacyStatus": "public", **STATUS}}).execute()
    back = yt.videos().list(part="status,snippet,contentDetails", id=vid).execute()["items"][0]
    print("read back:", json.dumps({"privacy": back["status"]["privacyStatus"], "title": back["snippet"]["title"], "duration": back["contentDetails"]["duration"]}, ensure_ascii=False))
    voice = json.loads((out / "voice_status.json").read_text(encoding="utf-8"))
    log.append({"slug": slug, "title": meta["title"], "published": today, "url": url, "privacy": back["status"]["privacyStatus"], "voice": voice["used"]})
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0 if back["status"]["privacyStatus"] == "public" else 3


if __name__ == "__main__":
    raise SystemExit(main())
