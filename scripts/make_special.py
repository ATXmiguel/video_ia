"""Turn the special film (specials/hear-every-lie/film.json) into out/special_hear_every_lie.mp4.

edge-tts voices + synthesized bell, sfx and music -> public/special/build.json -> Remotion "Special" -> loudness normalize.
Separate from make_episode.py so the daily series pipeline stays untouched.

Usage: python3 scripts/make_special.py [--no-render]
"""
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import truststore

truststore.inject_into_ssl()  # edge-tts needs the system certificates on this network

import edge_tts  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
BUILD = PUBLIC / "special"
FILM = ROOT / "specials" / "hear-every-lie" / "film.json"
OUT = ROOT / "out" / "special_hear_every_lie.mp4"

LEAD = 0.3  # before the first line of a shot
GAP = 0.25  # between lines
TAIL = 0.45  # after the last line of a shot
DING_AT = 0.04  # the bell lands right at the end of the lie
DING_HOLD = 0.6  # room for the bell to ring before anyone continues
DOUBLE = 0.34  # between the rings of a double bell

# who -> (voice, rate, pitch)
VOICES = {
    "narrator": ("en-US-AndrewNeural", "+0%", "-2Hz"),
    "you": ("en-US-BrianNeural", "+2%", "+0Hz"),
    "otis": ("en-US-GuyNeural", "-6%", "-6Hz"),
    "vane": ("en-US-ChristopherNeural", "+0%", "+0Hz"),
    "quill": ("en-GB-SoniaNeural", "-4%", "+0Hz"),
    "mom": ("en-US-JennyNeural", "+0%", "+0Hz"),
    "man": ("en-US-EricNeural", "+4%", "+0Hz"),
    "date": ("en-US-AriaNeural", "+4%", "+4Hz"),
    "guest1": ("en-US-RogerNeural", "+6%", "+0Hz"),
    "guest2": ("en-US-MichelleNeural", "+6%", "+4Hz"),
}


def run_ffmpeg(*args: str) -> None:
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


async def speak(text: str, who: str, dest: Path) -> None:
    voice, rate, pitch = VOICES[who]
    for attempt in range(6):
        try:
            await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(str(dest))
            return
        except Exception as e:  # the service drops requests for a few seconds at a time: back off and retry
            if attempt == 5:
                raise
            print(f"  tts retry ({e})")
            await asyncio.sleep(2 * 2**attempt)


def make_sfx() -> None:
    sfx = PUBLIC / "sfx"
    sfx.mkdir(parents=True, exist_ok=True)
    bell = "0.5*sin(2*PI*1865*t)*exp(-4*t)+0.28*sin(2*PI*2794*t)*exp(-6*t)+0.14*sin(2*PI*4698*t)*exp(-9*t)"
    recipes = {
        "bell": ["-f", "lavfi", "-i", f"aevalsrc='{bell}':d=1.4"],
        # The same bell in a big empty building, for the one lie the whole hotel hears.
        "bigbell": ["-f", "lavfi", "-i", f"aevalsrc='{bell}':d=4", "-af", "aecho=0.8:0.8:180|420|760:0.6|0.45|0.3,volume=1.6"],
        "knock": ["-f", "lavfi", "-i", "aevalsrc='0.9*sin(2*PI*120*t)*exp(-22*t)+0.4*sin(2*PI*260*t)*exp(-34*t)':d=0.3"],
        "click": ["-f", "lavfi", "-i", "aevalsrc='0.7*sin(2*PI*900*t)*exp(-90*t)':d=0.1"],
        "rumble": ["-f", "lavfi", "-i", "anoisesrc=d=6:c=brown:a=0.8", "-af", "lowpass=f=320,afade=t=in:d=0.4,afade=t=out:st=5:d=1"],
        "siren": ["-f", "lavfi", "-i", "aevalsrc='0.4*sin(2*PI*(760+240*sin(2*PI*0.45*t))*t)':d=8", "-af", "lowpass=f=1800,afade=t=in:d=1.2,afade=t=out:st=6:d=2"],
    }
    for name, args in recipes.items():
        dest = sfx / f"{name}.mp3"
        run_ffmpeg(*args, "-c:a", "libmp3lame", "-b:a", "160k", str(dest))


def make_music(pad: Path, tension: Path, seconds: float) -> None:
    d = f"{seconds + 2:.2f}"
    # Slow overlapping minor chords: each one fades in and out under the next, so nothing clicks.
    chords = [(146.8, 174.6, 220.0), (116.5, 174.6, 233.1), (130.8, 196.0, 261.6), (110.0, 164.8, 261.6)]
    parts = []
    for k, tones in enumerate(chords):
        gate = f"if(lt(mod(t-{k * 6},24),8),sin(PI*mod(t-{k * 6},24)/8),0)"
        for f in tones:
            parts.append(f"0.16*sin(2*PI*{f}*t)*{gate}")
            parts.append(f"0.05*sin(2*PI*{f * 2.003}*t)*{gate}")
    run_ffmpeg("-f", "lavfi", "-i", f"aevalsrc='{'+'.join(parts)}':s=44100:d={d}", "-af", "lowpass=f=1200",
               "-c:a", "libmp3lame", "-b:a", "128k", str(pad))
    # A heartbeat over a low, unresolved drone.
    beat = "0.8*sin(2*PI*55*t)*(exp(-9*mod(t,1.1))+0.7*exp(-9*mod(t-0.26,1.1)))"
    drone = "0.14*sin(2*PI*73.4*t)+0.11*sin(2*PI*77.8*t)"
    run_ffmpeg("-f", "lavfi", "-i", f"aevalsrc='{beat}+{drone}':s=44100:d={d}", "-af", "lowpass=f=700",
               "-c:a", "libmp3lame", "-b:a", "128k", str(tension))


async def main(render: bool) -> None:
    film = json.loads(FILM.read_text(encoding="utf-8"))
    BUILD.mkdir(parents=True, exist_ok=True)
    make_sfx()
    shots = []
    for si, shot in enumerate(film["shots"]):
        t = LEAD if shot["lines"] else 0.0
        lines, dings = [], []
        for li, raw in enumerate(shot["lines"]):
            rel = f"special/{shot['id']}_{li}.mp3"
            dest = PUBLIC / rel
            await speak(raw["text"], raw["who"], dest)
            dur = probe_duration(dest)
            lines.append({"who": raw["who"], "text": raw["text"], "start": round(t, 3), "duration": round(dur, 3), "audio": rel})
            t += dur
            for n in range(raw.get("ding", 0)):
                dings.append({"t": round(t + DING_AT + n * DOUBLE, 3), "who": raw["who"], "big": raw.get("big", False)})
            if raw.get("ding"):
                t += DING_HOLD + (raw["ding"] - 1) * DOUBLE
            t += raw.get("after", GAP)
        duration = t + shot.get("after", TAIL) + shot.get("hold", 0)
        out = {k: v for k, v in shot.items() if k != "lines"}
        shots.append({**out, "lines": lines, "dings": dings, "duration": round(duration, 3)})
        print(f"{si + 1:>2}/{len(film['shots'])} {shot['id']:>4} {shot['kind']:<8} {duration:5.1f}s")

    total = sum(s["duration"] for s in shots)
    pad, tension = BUILD / "pad.mp3", BUILD / "tension.mp3"
    make_music(pad, tension, total)
    build_path = BUILD / "build.json"
    build_path.write_text(json.dumps({"shots": shots, "pad": "special/pad.mp3", "tension": "special/tension.mp3"}, indent=1), encoding="utf-8")
    print(f"total {total / 60:.2f} min, {len(shots)} shots, avg {total / len(shots):.1f}s")

    if render:
        raw = ROOT / "out" / "special_raw.mp4"
        subprocess.run(f'npx remotion render src/index.ts Special "{raw}" --props="{build_path}" --concurrency=75%', shell=True, check=True, cwd=ROOT)
        run_ffmpeg("-i", str(raw), "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", str(OUT))
        print(f"rendered {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    asyncio.run(main("--no-render" not in sys.argv))
