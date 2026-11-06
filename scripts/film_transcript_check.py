"""Transcribe a film's final audio and compare it, line by line, with the script.
usage: python scripts/film_transcript_check.py <audio or video> <film.json> <report.txt> [language]"""
import difflib
import json
import re
import subprocess
import sys
import unicodedata

import numpy as np

from faster_whisper import WhisperModel

media, film_path, out = sys.argv[1:4]
lang = sys.argv[4] if len(sys.argv) > 4 else "pt"


def norm(t):
    t = unicodedata.normalize("NFKD", t.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.findall(r"[a-z0-9]+", t)


film = json.load(open(film_path, encoding="utf-8"))
script = [(i["id"], i["text"]) for i in film["script"] if "text" in i]
model = WhisperModel("small", device="cpu", compute_type="int8")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", media, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
segs, _ = model.transcribe(np.frombuffer(pcm, np.float32), language=lang, vad_filter=True, word_timestamps=False, beam_size=5)
heard = " ".join(s.text for s in segs)
a, b = [], norm(heard)
owner = []
for lid, text in script:
    for w in norm(text):
        a.append(w)
        owner.append(lid)
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
lines = [f"script words {len(a)}, heard {len(b)}, match ratio {sm.ratio():.3f}"]
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag != "equal":
        lines.append(f"[{owner[min(i1, len(owner) - 1)]}] script: {' '.join(a[i1:i2])!r} | heard: {' '.join(b[j1:j2])!r}")
open(out, "w", encoding="utf-8").write("\n".join(lines) + "\n\nFULL TRANSCRIPT\n" + heard)
print("\n".join(lines))
