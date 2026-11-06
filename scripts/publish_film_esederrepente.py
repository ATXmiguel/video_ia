"""Upload a finished film to E Se De Repente: private first, thumbnail, then public, and read it back.

The token comes only from YT_TOKEN_JSON. Stops before uploading unless that token belongs to the expected channel.
usage: YT_TOKEN_JSON="$(cat secrets/token_esederrepente.json)" python3 scripts/publish_film_esederrepente.py <video> <thumb> <meta.json>
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from googleapiclient.errors import HttpError  # noqa: E402
from googleapiclient.http import MediaFileUpload  # noqa: E402
from youtube_api import youtube  # noqa: E402

CHANNEL = "UC2nFCAMKGQ9v2JksMgCbmSg"


def main() -> int:
    video, thumb, meta_path = sys.argv[1:4]
    if not os.environ.get("YT_TOKEN_JSON"):
        print("STOP: YT_TOKEN_JSON is not set")
        return 2
    meta = json.loads(Path(meta_path).read_text(encoding="utf-8"))
    yt = youtube()
    items = yt.channels().list(part="id,snippet", mine=True).execute().get("items", [])
    ids = [i["id"] for i in items]
    if ids != [CHANNEL]:
        print("STOP: token belongs to", ids)
        return 2
    status = {"selfDeclaredMadeForKids": False, "containsSyntheticMedia": False, "embeddable": True, "publicStatsViewable": True, "license": "youtube"}
    body = {
        "snippet": {"title": meta["title"], "description": meta["description"], "tags": meta["tags"], "categoryId": "27", "defaultLanguage": "pt-BR", "defaultAudioLanguage": "pt-BR"},
        "status": {"privacyStatus": "private", **status},
    }
    request = yt.videos().insert(part="snippet,status", body=body, media_body=MediaFileUpload(video, chunksize=8 * 1024 * 1024, resumable=True), notifySubscribers=True)
    response = None
    while response is None:
        progress, response = request.next_chunk()
        if progress:
            print(f"upload {int(progress.progress() * 100)}%")
    vid = response["id"]
    print("uploaded private:", f"https://www.youtube.com/watch?v={vid}")
    try:
        yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(thumb)).execute()
    except HttpError as e:
        print("thumbnail refused, video stays private:", e.resp.status, e.reason)
        return 3
    print("thumbnail set")
    yt.videos().update(part="status", body={"id": vid, "status": {"privacyStatus": "public", **status}}).execute()
    back = yt.videos().list(part="status,snippet,contentDetails", id=vid).execute()["items"][0]
    print("read back:", json.dumps({"status": back["status"], "title": back["snippet"]["title"], "duration": back["contentDetails"]["duration"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
