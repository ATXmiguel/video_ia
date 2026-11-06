"""Tests the ElevenLabs paths against a local fake server, so nothing is spent and no key is needed.
usage: python3 scripts/test_voice_engine.py
"""
import base64
import json
import os
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import voice_engine as ve  # noqa: E402

ve.time.sleep = lambda _: None
ve.alert = lambda *_: None
tmp = Path(tempfile.mkdtemp())
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "sine=d=1", str(tmp / "a.mp3")], check=True)
MP3 = base64.b64encode((tmp / "a.mp3").read_bytes()).decode()
STATE = {}


class Fake(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def send(self, code, data):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_GET(self):
        self.send(*STATE["sub"])

    def do_POST(self):
        self.rfile.read(int(self.headers["Content-Length"]))
        STATE["calls"] = STATE.get("calls", 0) + 1
        self.send(*STATE["tts"](STATE["calls"]))


OK = (200, {"audio_base64": MP3, "alignment": {"characters": list("oi tu."), "character_start_times_seconds": [0, .1, .2, .3, .4, .5], "character_end_times_seconds": [.1, .2, .3, .4, .5, .6]}})
QUOTA = (401, {"detail": {"status": "quota_exceeded", "message": "You have insufficient quota"}})
BAD_KEY = (401, {"detail": {"status": "invalid_api_key", "message": "Invalid API key"}})
server = HTTPServer(("127.0.0.1", 0), Fake)
threading.Thread(target=server.serve_forever, daemon=True).start()
os.environ["ELEVENLABS_API_BASE"] = f"http://127.0.0.1:{server.server_port}"
os.environ["ELEVENLABS_API_KEY"] = "test-not-a-real-key"
VOICE = ["voz", "modelo", {}]


def kind_of(fn):
    try:
        fn()
    except ve.Unavailable as e:
        return e.kind
    return None


def speak(name="x"):
    return ve.speak("oi tu.", VOICE, tmp / f"{name}.mp3", tmp / f"{name}.json")


STATE["sub"] = (200, {"character_count": 900, "character_limit": 1000})
assert kind_of(lambda: ve.preflight(100)) is None
assert kind_of(lambda: ve.preflight(101)) == "credit", "balance too low must refuse before spending"
STATE["sub"] = (401, {"detail": {"status": "missing_permissions", "message": "needs user_read"}})
assert ve.preflight(10)["credits_before"] is None, "a key that can't read the balance still tries"
STATE["sub"] = BAD_KEY
assert kind_of(lambda: ve.preflight(10)) == "bad_key"

STATE["tts"] = lambda _: OK
assert [w["text"] for w in speak("ok")] == ["oi", "tu."]
assert speak("ok")[1]["e"] == 0.6
calls = STATE["calls"]
speak("ok")
assert STATE["calls"] == calls, "cached line must not spend credits"

STATE["tts"] = lambda _: QUOTA
assert kind_of(lambda: speak("quota")) == "credit"
STATE["tts"] = lambda _: (402, {"detail": {"status": "payment_required", "message": "x"}})
assert kind_of(lambda: speak("pay")) == "credit"
STATE["tts"] = lambda _: BAD_KEY
assert kind_of(lambda: speak("bad")) == "bad_key"
STATE["tts"] = lambda _: (503, {"detail": "busy"})
assert kind_of(lambda: speak("busy")) == "service"
STATE["calls"] = 0
STATE["tts"] = lambda n: (503, {"detail": "busy"}) if n < 3 else OK
assert kind_of(lambda: speak("retry")) is None, "a busy service gets retried"
assert not (tmp / "quota.mp3").exists(), "a refused line leaves no file behind"

del os.environ["ELEVENLABS_API_KEY"]
ve.KEY_FILES = [tmp / "none.txt"]
assert kind_of(ve.load_key) == "no_key"
assert kind_of(lambda: ve.voice_for("narrator", {}, {"voices": {"narrator": None}})) == "config"
assert ve.voice_for("neide", {"elevenRoles": {"neide": "mulher"}}, {"voices": {"mulher": "id1"}})[0] == "id1"
print("voice engine: all paths pass")
