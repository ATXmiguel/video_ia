"""Warnings for the E Se De Repente routine, plus an optional ElevenLabs voice.

The Shorts use free edge-tts, chosen by Miguel on 2026-11-06, so nothing below alert() runs unless a film.json sets
"voiceEngine": "elevenlabs". In that case one video never mixes engines: on Unavailable, make_film.py redoes every line with
edge-tts, records why in voice_status.json and calls alert(). The key comes from ELEVENLABS_API_KEY or a
secrets/elevenlabs_key.txt file and is never printed.

usage: python3 scripts/voice_engine.py alert "<title>" "<text>"
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "specials" / "elevenlabs.json"
LOG = ROOT / "out" / "AVISOS_esederrepente.md"
# The key lives in the main checkout; ROOT is that checkout or a worktree under .claude/worktrees/.
KEY_FILES = [ROOT / "secrets" / "elevenlabs_key.txt", ROOT.parents[2] / "secrets" / "elevenlabs_key.txt"]
RETRIES = 4
# Statuses the API uses when the account can't pay for the request (quota_exceeded is the one in its docs).
NO_CREDIT = {"quota_exceeded", "insufficient_credits", "insufficient_quota", "payment_required"}


class Unavailable(Exception):
    """ElevenLabs can't voice this video. `kind` is one of: credit, no_key, bad_key, config, service."""

    def __init__(self, kind: str, detail: str):
        super().__init__(f"{kind}: {detail}")
        self.kind = kind
        self.detail = detail


def base_url() -> str:
    return os.environ.get("ELEVENLABS_API_BASE", "https://api.elevenlabs.io").rstrip("/")


def load_key() -> str:
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    for path in KEY_FILES:
        if not key and path.exists():
            key = path.read_text(encoding="utf-8-sig").strip()
    if not key:
        raise Unavailable("no_key", "chave não encontrada em secrets/elevenlabs_key.txt")
    return key


def load_config() -> dict:
    return json.loads(CONFIG.read_text(encoding="utf-8"))


def voice_for(who: str, film: dict, config: dict) -> list:
    """[voice id, model, settings] for this speaker. A film maps its characters to roles with `elevenRoles`."""
    role = film.get("elevenRoles", {}).get(who, who)
    voice_id = config.get("voices", {}).get(role)
    if not voice_id:
        raise Unavailable("config", f"nenhuma voz da ElevenLabs escolhida para '{role}' em specials/elevenlabs.json")
    return [voice_id, config.get("model", "eleven_multilingual_v2"), config.get("settings", {})]


def _classify(code: int, body: bytes) -> Unavailable | None:
    """A refusal that retrying won't fix, or None if it's worth another try."""
    try:
        detail = json.loads(body).get("detail", {})
    except (ValueError, AttributeError):
        detail = {}
    status = detail.get("status", "") if isinstance(detail, dict) else ""
    message = detail.get("message", "") if isinstance(detail, dict) else str(detail)
    text = f"HTTP {code} {status} {message}".strip()
    if status in NO_CREDIT or code == 402 or "credit" in message.lower() or "quota" in message.lower():
        return Unavailable("credit", text)
    if code in (401, 403) or status in ("invalid_api_key", "missing_permissions"):
        return Unavailable("bad_key", text)
    if code in (429, 500, 502, 503, 504):
        return None
    return Unavailable("service", text)


def _request(path: str, key: str, payload: dict | None = None) -> dict:
    data = json.dumps(payload).encode() if payload is not None else None
    headers = {"xi-api-key": key, "Content-Type": "application/json", "User-Agent": "video-diarios/1.0"}
    last = "sem resposta"
    for attempt in range(RETRIES):
        try:
            with urllib.request.urlopen(urllib.request.Request(base_url() + path, data=data, headers=headers), timeout=180) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            problem = _classify(e.code, e.read())
            if problem:
                raise problem from None
            last = f"HTTP {e.code}"
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last = str(e)
        if attempt < RETRIES - 1:
            time.sleep(2 * 2**attempt)
    raise Unavailable("service", f"sem resposta depois de {RETRIES} tentativas ({last})")


def credits_left(key: str) -> int | None:
    """Credits left this period, or None if this key isn't allowed to read them (the speech calls still report it)."""
    try:
        sub = _request("/v1/user/subscription", key)
    except Unavailable as e:
        if "missing_permissions" in e.detail:
            return None
        raise
    if "character_limit" not in sub or "character_count" not in sub:
        return None
    return int(sub["character_limit"]) - int(sub["character_count"])


def preflight(chars: int) -> dict:
    """Refuse before spending anything if the balance can't cover the whole video."""
    key = load_key()
    left = credits_left(key)
    if left is not None and left < chars:
        raise Unavailable("credit", f"restam {left} créditos e o vídeo precisa de cerca de {chars}")
    return {"credits_before": left, "chars_needed": chars}


def words_from_alignment(alignment: dict) -> list:
    words, cur = [], None
    for ch, s, e in zip(alignment["characters"], alignment["character_start_times_seconds"], alignment["character_end_times_seconds"]):
        if ch.isspace():
            if cur:
                words.append(cur)
            cur = None
        elif cur is None:
            cur = {"text": ch, "s": round(s, 3), "e": round(e, 3)}
        else:
            cur["text"] += ch
            cur["e"] = round(e, 3)
    if cur:
        words.append(cur)
    return words


def speak(text: str, voice: list, dest: Path, words_path: Path) -> list:
    if dest.exists() and words_path.exists():
        return json.loads(words_path.read_text(encoding="utf-8"))
    voice_id, model, settings = voice
    body = {"text": text, "model_id": model}
    if settings:
        body["voice_settings"] = settings
    data = _request(f"/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128", load_key(), body)
    if not data.get("audio_base64") or not data.get("alignment"):
        raise Unavailable("service", "resposta sem áudio ou sem marcação de tempo")
    words = words_from_alignment(data["alignment"])
    dest.write_bytes(base64.b64decode(data["audio_base64"]))
    words_path.write_text(json.dumps(words), encoding="utf-8")
    return words


REASONS = {
    "credit": "A ElevenLabs está sem crédito",
    "no_key": "A chave da ElevenLabs não foi encontrada",
    "bad_key": "A ElevenLabs recusou a chave",
    "config": "A voz da ElevenLabs não está configurada",
    "service": "A ElevenLabs não respondeu",
}

TOAST = r"""
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
$xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
$text = $xml.GetElementsByTagName('text')
$text.Item(0).AppendChild($xml.CreateTextNode($env:AVISO_TITULO)) > $null
$text.Item(1).AppendChild($xml.CreateTextNode($env:AVISO_TEXTO)) > $null
$app = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show([Windows.UI.Notifications.ToastNotification]::new($xml))
"""


def alert(title: str, body: str) -> None:
    """Leave the warning in the log file, which can't fail quietly, and also pop a Windows notification."""
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as fh:
        fh.write(f"- {datetime.now():%Y-%m-%d %H:%M} **{title}** {body}\n")
    print(f"AVISO: {title} {body}")
    try:
        env = {**os.environ, "AVISO_TITULO": title, "AVISO_TEXTO": body}
        subprocess.run(["powershell", "-NoProfile", "-NonInteractive", "-Command", TOAST], env=env, capture_output=True, timeout=30, check=True)
    except (OSError, subprocess.SubprocessError) as e:
        print(f"notificação do Windows falhou ({e}); o aviso está em {LOG}")


if __name__ == "__main__":
    if len(sys.argv) != 4 or sys.argv[1] != "alert":
        raise SystemExit(__doc__)
    alert(sys.argv[2], sys.argv[3])
