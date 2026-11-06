"""One-time consent for E Se De Repente. Writes secrets/token_esederrepente.json in the given checkout, and only if the
account chosen in the browser really is that channel. Never touches secrets/token.json, and never prints a token.
usage: python3 -u scripts/auth_esederrepente.py <checkout_root>"""
import json
import sys
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

CHANNEL = "UC2nFCAMKGQ9v2JksMgCbmSg"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"]

secrets = Path(sys.argv[1]) / "secrets"
dest = secrets / "token_esederrepente.json"
if dest.exists():
    raise SystemExit(f"STOP: {dest} already exists")
flow = InstalledAppFlow.from_client_config(json.loads((secrets / "client_secret.json").read_text()), SCOPES)
creds = flow.run_local_server(port=8765, open_browser=False, prompt="consent", authorization_prompt_message="Open this URL to authorize:\n{url}\n")
items = build("youtube", "v3", credentials=creds, cache_discovery=False).channels().list(part="id,snippet", mine=True).execute().get("items", [])
ids = [i["id"] for i in items]
if ids != [CHANNEL]:
    names = [i["snippet"]["title"] for i in items]
    raise SystemExit(f"NOT SAVED: that consent belongs to {names} {ids}, not E Se De Repente. Run again and pick the right channel.")
dest.write_text(creds.to_json())
print("SAVED: token for", items[0]["snippet"]["title"], ids[0])
