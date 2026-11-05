"""Build the proof clip for the replication guide: voices, mouth shapes, a stereo bed, then Remotion "SpecialProof".

Voices are edge-tts. Mouth shapes come from each line's loudness per frame, held at least 4 frames, because the study
found the reference holds mouth poses rather than flapping. Output: out/whatif/proof/proof_clip.mp4

Usage: python3 scripts/make_proof.py [--no-render]
"""
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from make_special import VOICES, probe_duration, run_ffmpeg, speak  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
BUILD = PUBLIC / "special" / "proof"
OUT = ROOT / "out" / "whatif" / "proof"
FPS = 24
LINES = {
    "n1": ("narrator", "Nobody scams the front desk."),
    "m1": ("man", "I'm with the fire marshal's office."),
    "y1": ("you", "Sir, you're with a vending machine company."),
}


def visemes(path: Path) -> list:
    """Loudness per frame -> held mouth shapes. Quiet = rest; loud = open shapes chosen by a repeating pattern."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32)
    hop = 16000 // FPS
    env = np.array([np.sqrt((a[i:i + hop] ** 2).mean() + 1e-12) for i in range(0, len(a) - hop, hop)])
    top = np.percentile(env, 95) + 1e-6
    level = env / top
    shapes = ["ah", "ee", "o", "wave", "ah", "wave", "ee"]
    out = []
    k = 0
    cur = None
    held = 99
    for f, v in enumerate(level):
        if v < 0.14:
            want = "flat"
        elif cur in (None, "flat") or held >= 6:
            want = shapes[k % len(shapes)] if v > 0.3 else "wave"
            k += 1
        else:
            want = cur
        if want != cur and (held >= 4 or cur is None):
            out.append([f, want])
            cur = want
            held = 0
        held += 1
    out.append([len(level), "flat"])
    return out


def make_bed(seconds: float) -> None:
    d = f"{seconds + 1:.2f}"
    # A warm low bed with real stereo width: slightly detuned left and right, and most of the energy under 250 Hz.
    def chord(detune):
        parts = []
        for k, tones in enumerate([(98.0, 146.8, 220.0), (87.3, 130.8, 207.7)]):
            gate = f"(0.5+0.5*sin(2*PI*t/{d}*{2 + k}+{k}))"
            for f in tones:
                parts.append(f"0.16*sin(2*PI*{f * detune}*t)*{gate}")
        return "+".join(parts)
    run_ffmpeg("-f", "lavfi", "-i", f"aevalsrc='{chord(1.0)}|{chord(1.004)}':s=44100:d={d}", "-af", "lowpass=f=900,afade=t=in:d=0.3",
               "-c:a", "libmp3lame", "-b:a", "160k", str(BUILD / "bed.mp3"))
    # Room tone: quiet brown noise, wide.
    run_ffmpeg("-f", "lavfi", "-i", f"anoisesrc=d={d}:c=brown:a=0.5", "-f", "lavfi", "-i", f"anoisesrc=d={d}:c=brown:a=0.5:s=7",
               "-filter_complex", "[0][1]join=inputs=2:channel_layout=stereo,lowpass=f=500", "-c:a", "libmp3lame", "-b:a", "128k", str(BUILD / "room.mp3"))


async def main(render: bool) -> None:
    BUILD.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    lines = {}
    for key, (who, text) in LINES.items():
        dest = BUILD / f"{key}.mp3"
        if not dest.exists():
            await speak(text, who, dest)
        lines[key] = {"who": who, "audio": f"special/proof/{key}.mp3", "duration": round(probe_duration(dest), 3), "visemes": visemes(dest)}
        print(key, lines[key]["duration"], len(lines[key]["visemes"]))
    make_bed(21)
    build = {"lines": lines, "bed": "special/proof/bed.mp3", "room": "special/proof/room.mp3"}
    path = BUILD / "build.json"
    path.write_text(json.dumps(build), encoding="utf-8")
    if render:
        raw = OUT / "proof_raw.mp4"
        subprocess.run(f'npx remotion render src/index.ts SpecialProof "{raw}" --props="{path}" --concurrency=75%', shell=True, check=True, cwd=ROOT)
        run_ffmpeg("-i", str(raw), "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=7", "-c:a", "aac", "-b:a", "192k", str(OUT / "proof_clip.mp4"))
        print("rendered", OUT / "proof_clip.mp4")


if __name__ == "__main__":
    asyncio.run(main("--no-render" not in sys.argv))
