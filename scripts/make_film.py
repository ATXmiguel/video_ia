"""Build a narrated film from a data file: voice first, then shots placed against the voice.

specials/<slug>/film.json -> voices with word timings -> timeline -> lint against the measured targets
-> public/special/<slug>/build.json -> Remotion "SpecialFilm" -> out/film/<slug>/<slug>.mp4

Separate from make_episode.py and make_special.py. See docs/whatif/REPLICATION_GUIDE.md, section 17.

Usage: python scripts/make_film.py <slug> [--check] [--preview] [--no-render]
  --check      voices and timeline only, then print the report
  --preview    half size, muted, for reading frames
  --no-render  write build.json but do not render
  --keep-bed   reuse the bed already built
"""
import asyncio
import csv
import hashlib
import json
import re
import subprocess
import sys
import unicodedata
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from make_proof import visemes  # noqa: E402
from make_special import VOICES, edge_tts, probe_duration, run_ffmpeg  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
FPS = 24
LINE_GAP = 0.25  # default silence after a line, in seconds
TARGETS = {"mean": (1.8, 2.6), "median": (1.5, 2.3), "same_kind": (0, 0.35), "no_words": (0.1, 0.4)}  # from the reference


def norm(word: str) -> str:
    """Case, accents and punctuation don't matter when anchoring to a word, so Portuguese text works the same."""
    w = unicodedata.normalize("NFKD", word.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if not unicodedata.combining(c)))


async def speak(text: str, voice: list, dest: Path, words_path: Path) -> list:
    if dest.exists() and words_path.exists():
        return json.loads(words_path.read_text(encoding="utf-8"))
    name, rate, pitch = voice
    for attempt in range(6):
        try:
            words, audio = [], bytearray()
            comm = edge_tts.Communicate(text, name, rate=rate, pitch=pitch, boundary="WordBoundary")
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    audio.extend(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    words.append({"text": chunk["text"], "s": round(chunk["offset"] / 1e7, 3), "e": round((chunk["offset"] + chunk["duration"]) / 1e7, 3)})
            dest.write_bytes(audio)
            words_path.write_text(json.dumps(words), encoding="utf-8")
            return words
        except Exception as e:  # the service drops requests for a few seconds at a time
            if attempt == 5:
                raise
            print(f"  tts retry ({e})")
            await asyncio.sleep(2 * 2**attempt)
    return []


async def lay_out_voice(film: dict, build_dir: Path, slug: str) -> list:
    """Step 1. Every item of the script gets its place on the clock, before any shot is considered."""
    voices = {**{k: list(v) for k, v in VOICES.items()}, **film.get("voices", {})}
    t = float(film.get("lead", 0.3))
    items = []
    for raw in film["script"]:
        item = {"id": raw["id"], "t": t, "shots": raw.get("shots", [])}
        if "silence" in raw:
            item.update(kind="silence", dur=float(raw["silence"]), words=[])
        else:
            voice = voices[raw["who"]]
            key = hashlib.sha1(json.dumps([raw["text"], voice]).encode()).hexdigest()[:10]
            dest = build_dir / f"{raw['id']}_{key}.mp3"
            words = await speak(raw["text"], voice, dest, dest.with_suffix(".json"))
            # edge-tts leaves a tail of silence on each file: the clock follows the last spoken word, not the file.
            spoken = min(probe_duration(dest), words[-1]["e"] + 0.08) if words else probe_duration(dest)
            item.update(kind="line", who=raw["who"], text=raw["text"], audio=f"special/{slug}/{dest.name}", path=dest, dur=spoken, words=words)
        t += item["dur"] + float(raw.get("after", LINE_GAP if item["kind"] == "line" else 0))
        item["next"] = t
        items.append(item)
    return items


def anchor_time(shot: dict, item: dict, cursor: dict) -> float | None:
    """Where a shot's cut falls, or None if it should share the time left between its neighbours."""
    if "on" in shot:
        want = norm(shot["on"])
        for i in range(cursor["word"], len(item["words"])):
            if norm(item["words"][i]["text"]) == want:
                cursor["word"] = i + 1
                return item["t"] + item["words"][i]["s"]
        raise SystemExit(f"shot {shot.get('id')}: word {shot['on']!r} not found in what is left of line {item['id']}")
    if "tail" in shot:
        return item["t"] + item["dur"] + float(shot["tail"])
    if "at" in shot:
        return item["t"] + float(shot["at"])
    return None


def place_shots(film: dict, items: list) -> list:
    """Step 2. Cuts are placed against the laid-out voice. A line can hold any number of shots, and a shot runs until
    the next cut, so picture runs under speech and nothing is padded to fit a line."""
    placed = []
    for item in items:
        cursor = {"word": 0}
        for n, shot in enumerate(item["shots"]):
            t = anchor_time(shot, item, cursor)
            if t is None and n == 0:
                t = item["t"]
            placed.append({"shot": shot, "item": item, "t": None if t is None else t + shot.get("nudge", 0) / FPS})
    end = items[-1]["next"] + float(film.get("tail", 0.5))
    # Unanchored shots split the time between their anchored neighbours evenly.
    i = 0
    while i < len(placed):
        if placed[i]["t"] is not None:
            i += 1
            continue
        j = i
        while j < len(placed) and placed[j]["t"] is None:
            j += 1
        a = placed[i - 1]["t"]
        b = placed[j]["t"] if j < len(placed) else end
        for k in range(i, j):
            placed[k]["t"] = a + (b - a) * (k - i + 1) / (j - i + 1)
        i = j
    placed[0]["t"] = 0.0
    frames = [round(p["t"] * FPS) for p in placed] + [round(end * FPS)]
    shots = []
    for k, p in enumerate(placed):
        dur = frames[k + 1] - frames[k]
        if dur <= 0:
            raise SystemExit(f"shot {p['shot'].get('id')}: cuts are out of order (length {dur} frames)")
        data = {x: v for x, v in p["shot"].items() if x not in ("on", "tail", "at", "nudge")}
        data.setdefault("id", f"s{k + 1:03d}")
        shots.append({**data, "start": frames[k], "dur": dur})
    return shots


def first_motion(shot: dict) -> int | None:
    """The first frame on which the shot's data asks for something to change."""
    ats = []
    for c in shot.get("cast", []):
        ats += [a.get("at", 6) for a in c.get("acts", [])]
        ats += [w["from"] for w in c.get("walks", [])]
    for p in shot.get("props", []):
        ats += [m["at"] for m in p.get("moves", [])]
    if shot.get("step"):
        ats.append(shot["step"]["at"])
    if shot.get("rack"):
        ats.append(shot["rack"]["at"])
    return min(ats) if ats else None


def lint(shots: list, items: list, total: int) -> tuple[list, dict]:
    """Step 3. Compare the plan with the numbers measured on the reference, before spending a render on it."""
    problems = []
    lens = np.array([s["dur"] / FPS for s in shots])
    word_times = [it["t"] + w["s"] for it in items for w in it["words"]]
    per = [sum(1 for t in word_times if s["start"] / FPS <= t < (s["start"] + s["dur"]) / FPS) for s in shots]
    for s in shots:
        name = f"{s['id']} ({s['kind']})"
        if not s.get("action"):
            problems.append(f"{name}: no named action")
        first = first_motion(s)
        if first is None:
            problems.append(f"{name}: nothing in the data moves")
        elif first > 12:
            problems.append(f"{name}: first move at frame {first}, after the first half second")
        if s["dur"] > 4 * FPS and not s.get("develops"):
            problems.append(f"{name}: {s['dur'] / FPS:.1f} s without `develops`. Split it.")
        if s["dur"] < 10:
            problems.append(f"{name}: only {s['dur']} frames")
    same = float(np.mean([a["kind"] == b["kind"] for a, b in zip(shots, shots[1:])])) if len(shots) > 1 else 0.0
    speech = sum(it["dur"] for it in items if it["kind"] == "line") / (total / FPS)
    stats = {
        "shots": len(shots), "seconds": round(total / FPS, 1), "mean": round(float(lens.mean()), 2), "median": round(float(np.median(lens)), 2),
        "p10": round(float(np.percentile(lens, 10)), 2), "p90": round(float(np.percentile(lens, 90)), 2), "same_kind": round(same, 2),
        "no_words": round(float(np.mean([w == 0 for w in per])), 2), "words_median": float(np.median(per)), "words_p90": float(np.percentile(per, 90)),
        "speech_share": round(speech, 2), "kinds": {k: sum(1 for s in shots if s["kind"] == k) for k in sorted({s["kind"] for s in shots})},
    }
    for key, (lo, hi) in TARGETS.items():
        if not lo <= stats[key] <= hi:
            problems.append(f"{key} = {stats[key]}, target {lo} to {hi}")
    for s, w in zip(shots, per):
        s["_words"] = w
    return problems, stats


def make_bed(build_dir: Path, seconds: float, sections: list | None = None) -> None:
    """A low bed and room tone with stereo width kept down. With `sections` (time, chord, dB) the bed follows the acts:
    the guide measured it moving by act, dropping 8 to 10 dB in the saddest minute and rising at the end."""
    if sections:
        sr = 44100
        n = int((seconds + 1) * sr)
        t = np.arange(n) / sr
        left = np.zeros(n)
        right = np.zeros(n)
        gain = np.zeros(n)
        times = [s[0] for s in sections] + [seconds + 1]
        for k, (t0, chord, level) in enumerate(sections):
            t1 = times[k + 1]
            # Each section's chord fades in over 3 s and out over 3 s across the boundary.
            env = np.clip((t - t0 + 1.5) / 3, 0, 1) * np.clip((t1 - t + 1.5) / 3, 0, 1)
            for j, f in enumerate(chord):
                swell = 0.72 + 0.28 * np.sin(2 * np.pi * t / (19 + j * 7) + j + k)
                left += env * swell * np.sin(2 * np.pi * f * t + j) * (1 - 0.12 * j)
                right += env * swell * np.sin(2 * np.pi * f * 1.0025 * t + j * 1.7) * (1 - 0.12 * j)
                left += env * 0.22 * swell * np.sin(2 * np.pi * f / 2 * t)
                right += env * 0.22 * swell * np.sin(2 * np.pi * f / 2 * t)
            # Sparse soft plucks, so that it reads as music rather than a hum.
            step = 3.2
            for i, at in enumerate(np.arange(t0, t1, step)):
                f = chord[i % len(chord)] * 2
                a0, a1 = int(at * sr), min(n, int((at + 2.6) * sr))
                if a0 >= n:
                    break
                tt = t[a0:a1] - at
                pl = 0.34 * np.exp(-tt * 2.2) * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))
                left[a0:a1] += pl * 0.9
                right[a0:a1] += pl * 1.1
            gain = np.where((t >= t0) & (t < t1), level, gain)
        # Smooth the level steps over about 2.5 s.
        win = int(2.5 * sr / 100)
        g = np.convolve(np.repeat(gain[::100], 1), np.ones(win) / win, mode="same")
        gain = np.interp(t, np.arange(len(g)) * 100 / sr, g)
        amp = 10 ** (gain / 20)
        mid, side = (left + right) / 2, (left - right) / 2
        side *= 0.45
        left, right = (mid + side) * amp, (mid - side) * amp
        peak = max(np.abs(left).max(), np.abs(right).max())
        pcm = (np.stack([left, right], 1) / peak * 0.18 * 32767).astype(np.int16)
        wav = build_dir / "bed.wav"
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(pcm.tobytes())
        run_ffmpeg("-i", str(wav), "-af", "lowpass=f=1500,afade=t=in:d=1", "-c:a", "libmp3lame", "-b:a", "160k", str(build_dir / "bed.mp3"))
        wav.unlink()
    else:
        d = f"{seconds + 1:.2f}"

        def chord(detune):
            parts = []
            for k, tones in enumerate([(110.0, 164.8, 220.0), (98.0, 146.8, 246.9), (87.3, 130.8, 220.0)]):
                gate = f"(0.5+0.5*sin(2*PI*t/{d}*{2 + k}+{k}))"
                parts += [f"0.15*sin(2*PI*{f * detune}*t)*{gate}" for f in tones]
            return "+".join(parts)

        run_ffmpeg("-f", "lavfi", "-i", f"aevalsrc='{chord(1.0)}|{chord(1.003)}':s=44100:d={d}", "-af", "lowpass=f=800,stereotools=slev=0.12,afade=t=in:d=0.3",
                   "-c:a", "libmp3lame", "-b:a", "160k", str(build_dir / "bed.mp3"))
    d = f"{seconds + 1:.2f}"
    run_ffmpeg("-f", "lavfi", "-i", f"anoisesrc=d={d}:c=brown:a=0.5", "-f", "lavfi", "-i", f"anoisesrc=d={d}:c=brown:a=0.5:s=7",
               "-filter_complex", "[0][1]join=inputs=2:channel_layout=stereo,lowpass=f=500,stereotools=slev=0.12", "-c:a", "libmp3lame", "-b:a", "128k", str(build_dir / "room.mp3"))


def normalize(raw: Path, dest: Path, target: float = -15.0) -> None:
    """A plain gain and a peak limiter. loudnorm's dynamic mode lifts the bed in every pause, which is the opposite of what the guide measured."""
    probe = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(raw), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    measured = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", probe)[-1])
    run_ffmpeg("-i", str(raw), "-c:v", "copy", "-af", f"volume={target - measured:.2f}dB,alimiter=limit=0.83:level=false", "-c:a", "aac", "-b:a", "192k", str(dest))
    print(f"loudness: {measured} LUFS, gain {target - measured:.2f} dB")


async def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if not args:
        raise SystemExit(__doc__)
    slug = args[0]
    film = json.loads((ROOT / "specials" / slug / "film.json").read_text(encoding="utf-8"))
    build_dir = ROOT / "public" / "special" / slug
    out = ROOT / "out" / "film" / slug
    build_dir.mkdir(parents=True, exist_ok=True)
    out.mkdir(parents=True, exist_ok=True)

    items = await lay_out_voice(film, build_dir, slug)
    shots = place_shots(film, items)
    total = shots[-1]["start"] + shots[-1]["dur"]
    problems, stats = lint(shots, items, total)

    with open(out / "timeline.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["shot", "kind", "start_frame", "frames", "seconds", "words", "action"])
        for s in shots:
            w.writerow([s["id"], s["kind"], s["start"], s["dur"], round(s["dur"] / FPS, 2), s["_words"], s.get("action", "")])
    (out / "timeline.json").write_text(json.dumps([{k: s[k] for k in ("id", "kind", "start", "dur")} for s in shots]), encoding="utf-8")
    for s in shots:
        s.pop("_words")
    (out / "words.json").write_text(json.dumps([{"words": [{"s": it["t"] + w["s"], "e": it["t"] + w["e"]} for w in it["words"]]} for it in items if it["words"]]), encoding="utf-8")
    print(json.dumps(stats, indent=1))
    print(f"{len(problems)} problem(s)")
    for p in problems:
        print(" -", p)
    if "--check" in flags:
        return

    lines = [{"id": it["id"], "who": it["who"], "text": it["text"], "start": round(it["t"] * FPS), "frames": round(it["dur"] * FPS), "audio": it["audio"], "visemes": visemes(it["path"])} for it in items if it["kind"] == "line"]
    t_of = {it["id"]: it["t"] for it in items}
    sections = [(t_of[k], v[0], v[1]) for k, v in film["sections"].items()] if film.get("sections") else None
    if "--keep-bed" not in flags or not (build_dir / "bed.mp3").exists():
        make_bed(build_dir, total / FPS, sections)
    build = {"frames": total, "fade": film.get("fade", 0), "looks": film.get("looks", {}), "lines": lines, "shots": shots,
             "bed": f"special/{slug}/bed.mp3", "room": f"special/{slug}/room.mp3", "bedVolume": film.get("bedVolume", 0.5), "roomVolume": film.get("roomVolume", 0.2)}
    path = build_dir / "build.json"
    path.write_text(json.dumps(build), encoding="utf-8")
    if "--no-render" in flags:
        return
    if "--preview" in flags:
        subprocess.run(f'npx remotion render src/index.ts SpecialFilm "{out / "preview.mp4"}" --props="{path}" --scale=0.5 --muted --concurrency=75% --log=error', shell=True, check=True, cwd=ROOT)
        return
    raw = out / "raw.mp4"
    subprocess.run(f'npx remotion render src/index.ts SpecialFilm "{raw}" --props="{path}" --concurrency=75% --log=error', shell=True, check=True, cwd=ROOT)
    normalize(raw, out / f"{slug}.mp4")
    print("rendered", out / f"{slug}.mp4")


if __name__ == "__main__":
    asyncio.run(main())
