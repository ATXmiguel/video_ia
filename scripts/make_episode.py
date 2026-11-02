"""Turn an episode script (episodes/epNNN.json) into a rendered video (out/epNNN.mp4).

Steps: voices per line with word timings (edge-tts) -> sfx + music bed (ffmpeg)
-> public/epNNN/build.json -> Remotion render -> loudness normalize -> <10 MB upload copy.

Usage: python3 scripts/make_episode.py episodes/ep001.json [--no-render]
"""

import asyncio
import json
import subprocess
import sys
from pathlib import Path

import truststore

truststore.inject_into_ssl()  # this network needs the Windows certificate store
import edge_tts  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FPS = 30
COVER = 2.2  # seconds the title card covers the opening (keep in sync with COVER_FRAMES)
LEAD_IN = 0.25
GAP = 0.15
TAIL = 0.45
CHOICE_HOLD = 2.5

# who -> (voice, rate, pitch). Keep stable: viewers learn the voices.
VOICES = {
    "narrator": ("en-US-AndrewNeural", "+12%", "+0Hz"),
    "you": ("en-US-BrianNeural", "+10%", "+0Hz"),
    "kevin": ("en-US-ChristopherNeural", "+8%", "-4Hz"),
    "tyler": ("en-US-EricNeural", "+12%", "+0Hz"),
    "lily": ("en-US-EmmaNeural", "+10%", "+6Hz"),
    "brenda": ("en-US-MichelleNeural", "+14%", "+12Hz"),
}


def run_ffmpeg(*args: str) -> None:
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


async def speak(text: str, who: str, dest: Path) -> list[dict]:
    voice, rate, pitch = VOICES[who]
    for attempt in range(6):
        try:
            words, audio = [], bytearray()
            comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    audio.extend(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    start = chunk["offset"] / 1e7
                    words.append({"text": chunk["text"], "start": round(start, 3),
                                  "end": round(start + chunk["duration"] / 1e7, 3)})
            dest.write_bytes(audio)
            return words
        except Exception as e:  # the service drops requests for a few seconds at a time: back off and retry
            if attempt == 5:
                raise
            print(f"  tts retry ({e})")
            await asyncio.sleep(2 * 2**attempt)
    return []


def as_line(raw) -> dict:
    return {"who": "narrator", "text": raw} if isinstance(raw, str) else raw


async def build_scene(spec: dict, lines: list, kind: str, slug: str, idx: int, lead: float = LEAD_IN) -> dict:
    t = lead
    built = []
    for j, raw in enumerate(lines):
        line = as_line(raw)
        rel = f"{slug}/s{idx}_l{j}.mp3"
        words = await speak(line["text"], line["who"], PUBLIC / rel)
        dur = probe_duration(PUBLIC / rel)
        built.append({**line, "audio": rel, "start": round(t, 3), "duration": round(dur, 3), "words": words})
        t += dur + GAP
    duration = t - GAP + TAIL + (CHOICE_HOLD if kind == "choice" else 0)
    return {**{k: v for k, v in spec.items() if k != "lines"}, "kind": kind, "duration": round(duration, 3), "lines": built}


def make_sfx() -> None:
    sfx = PUBLIC / "sfx"
    sfx.mkdir(parents=True, exist_ok=True)
    recipes = {
        "whoosh": ["-f", "lavfi", "-i", "anoisesrc=d=0.35:c=pink:a=0.6",
                   "-af", "highpass=f=700,afade=t=in:d=0.12,afade=t=out:st=0.12:d=0.23"],
        "boom": ["-f", "lavfi", "-i", "aevalsrc='0.9*sin(2*PI*(95-70*t)*t)*exp(-6*t)':d=0.7"],
        "ding": ["-f", "lavfi", "-i", "aevalsrc='0.5*sin(2*PI*1320*t)*exp(-6*t)+0.3*sin(2*PI*1980*t)*exp(-8*t)':d=0.8"],
        "buzz": ["-f", "lavfi", "-i", "aevalsrc='0.35*sgn(sin(2*PI*98*t))*exp(-3.5*t)':d=0.6", "-af", "lowpass=f=1400"],
    }
    for name, args in recipes.items():
        dest = sfx / f"{name}.mp3"
        if not dest.exists():
            run_ffmpeg(*args, "-c:a", "libmp3lame", "-b:a", "128k", str(dest))


def make_music(dest: Path, seconds: float) -> None:
    # Bouncy 120 bpm loop: plucked bass + arpeggio + hi-hat, cycling a I–IV–V–vi progression every 2 s.
    root = "(1+0.335*eq(mod(floor(t/2),4),1)+0.5*eq(mod(floor(t/2),4),2)+0.68*eq(mod(floor(t/2),4),3))"
    arp = "(1+0.26*eq(mod(floor(t*8),4),1)+0.5*eq(mod(floor(t*8),4),2)+1*eq(mod(floor(t*8),4),3))"
    expr = (f"0.30*sin(2*PI*65.4*{root}*t)*exp(-7*mod(t,0.25))"
            f"+0.10*sin(2*PI*261.6*{root}*{arp}*t)*exp(-10*mod(t,0.125))")
    d = f"{seconds:.2f}"
    run_ffmpeg(
        "-f", "lavfi", "-i", f"aevalsrc='{expr}':s=44100:d={d}",
        "-f", "lavfi", "-i", f"anoisesrc=color=white:a=0.25:d={d}",
        "-filter_complex",
        "[1]highpass=f=7000,aeval='val(0)*exp(-45*mod(t+0.25,0.5))'[h];"
        f"[0][h]amix=inputs=2:normalize=0,lowpass=f=5000,afade=t=in:d=0.5,afade=t=out:st={seconds - 1.5:.2f}:d=1.5",
        "-c:a", "libmp3lame", "-b:a", "160k", str(dest),
    )


def normalize(src: Path, dest: Path) -> None:
    # Shorts/TikTok play around -14 LUFS; the raw mix comes out much quieter.
    run_ffmpeg("-i", str(src), "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", str(dest))


def upload_copy(src: Path, dest: Path, seconds: float) -> None:
    # The Chrome extension can only hand files under 10 MB to the upload form, and at ~9.4 MB the
    # transfer (base64, ~12.5 MB) dropped the connection on 2026-11-02: two-pass to ~6 MB for margin.
    # Long episodes get too few bits for 1080p, so they go out at 720p (plenty for a phone screen).
    kbps = int(6.0 * 8000 / seconds) - 128
    log = str(dest.with_suffix(""))
    scale = ["-vf", "scale=720:1280:flags=lanczos"] if kbps < 650 else []
    common = ["-i", str(src), *scale, "-c:v", "libx264", "-preset", "slow", "-b:v", f"{kbps}k", "-passlogfile", log]
    run_ffmpeg(*common, "-pass", "1", "-an", "-f", "null", "NUL")
    run_ffmpeg(*common, "-pass", "2", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(dest))
    for f in dest.parent.glob(f"{dest.stem}*.log*"):
        f.unlink()


def cta_line(ep: dict) -> str:
    opts = ep["choice"]["options"]
    if all(o.get("word") for o in opts):
        vote = "Comment one word: " + " or ".join(o["word"].upper() for o in opts) + "."
        win = "The most-liked one"
    else:
        vote, win = "Comment A or B.", "Top comment"
    arc = ep.get("arc")
    if arc and arc.get("final"):
        return f"{vote} {win} picks the next story."
    if arc:
        return f"{vote} {win} decides part {arc['part'] + 1}."
    return f"{vote} {win} decides episode {ep['episode'] + 1}."


async def main(ep_path: Path, render: bool) -> None:
    ep = json.loads(ep_path.read_text(encoding="utf-8"))
    n = ep["episode"]
    slug = f"ep{n:03d}"
    (PUBLIC / slug).mkdir(parents=True, exist_ok=True)
    make_sfx()

    scenes = []
    top = ep.get("topComment")
    if top:
        # Gray recap of how last episode ended, with the winning comment read out.
        recap = {k: v for k, v in (ep.get("recap") or ep["scenes"][0]).items() if k != "lines"}
        print("recap")
        scenes.append(await build_scene(recap, [f"Top comment said: {top['text']}"], "recap", slug, 0, lead=COVER + 0.4))
    for spec in ep["scenes"]:
        print(f"scene {len(scenes) + 1}: {spec['set']}")
        lead = COVER - 0.3 if not scenes else LEAD_IN  # the title card covers the very start
        scenes.append(await build_scene(spec, spec["lines"], "story", slug, len(scenes), lead=lead))

    choice = ep["choice"]
    opts = choice["options"]
    choice_lines = [choice["question"].capitalize()] + [
        f"{'' if k == 0 else 'Or '}{o.get('word', o['key'])}: {o['label']}." for k, o in enumerate(opts)
    ] + [cta_line(ep)]
    backdrop = {k: v for k, v in ep["scenes"][-1].items() if k != "lines"}
    print("choice card")
    scenes.append(await build_scene(backdrop, choice_lines, "choice", slug, len(scenes)))

    total = sum(s["duration"] for s in scenes)
    print(f"music ({total:.1f}s)")
    make_music(PUBLIC / slug / "music.mp3", total + 1)

    build = {k: ep[k] for k in ("series", "episode", "hook", "hookAccent", "choice", "arc", "hudLabels", "goal") if k in ep}
    build.update(topComment=top, scenes=scenes, music=f"{slug}/music.mp3")
    build_path = PUBLIC / slug / "build.json"
    build_path.write_text(json.dumps(build, indent=2), encoding="utf-8")
    (ROOT / "src" / "latest.json").write_text(json.dumps(build, indent=2), encoding="utf-8")
    print(f"wrote {build_path.relative_to(ROOT)} ({total:.1f}s)")

    if render:
        out = ROOT / "out" / f"{slug}.mp4"
        raw = ROOT / "out" / f"{slug}.raw.mp4"
        subprocess.run(
            f'npx remotion render src/index.ts Episode "{raw}" --props="{build_path}" --concurrency=75%',
            shell=True, cwd=ROOT, check=True,
        )
        normalize(raw, out)
        raw.unlink()
        upload = ROOT / "out" / f"{slug}_upload.mp4"
        upload_copy(out, upload, total)
        print(f"rendered {out.relative_to(ROOT)} + {upload.name} ({upload.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    asyncio.run(main(Path(sys.argv[1]), "--no-render" not in sys.argv))
