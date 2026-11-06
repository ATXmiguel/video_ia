"""The automatic gate before a Short is published. Writes out/film/<slug>/check.json; publish_short_esederrepente.py reads it.

Frames still have to be read by whoever runs this: nothing here sees cut-off text or a wrong picture.
usage: python3 scripts/check_short.py <slug>
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOUDNESS = (-16.5, -13.5)
SECONDS = (50.0, 61.0)
MIN_MATCH = 0.90


def main() -> int:
    slug = sys.argv[1]
    out = ROOT / "out" / "film" / slug
    video = out / f"{slug}.mp4"
    probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", str(video)], capture_output=True, text=True, check=True).stdout)
    w, h = probe["streams"][0]["width"], probe["streams"][0]["height"]
    secs = float(probe["format"]["duration"])
    meter = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(video), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", meter)[-1])
    report = out / "transcript.txt"
    subprocess.run([sys.executable, str(ROOT / "scripts" / "film_transcript_check.py"), str(video), str(ROOT / "specials" / slug / "film.json"), str(report), "pt"], check=True, capture_output=True)
    match = float(re.search(r"match ratio ([\d.]+)", report.read_text(encoding="utf-8")).group(1))
    voice = json.loads((out / "voice_status.json").read_text(encoding="utf-8"))
    results = {
        "vertical": (w, h) == (1080, 1920),
        "length": SECONDS[0] <= secs <= SECONDS[1],
        "loudness": LOUDNESS[0] <= lufs <= LOUDNESS[1],
        "transcript": match >= MIN_MATCH,
    }
    data = {"passed": all(results.values()), "results": results, "size": [w, h], "seconds": round(secs, 1), "lufs": lufs, "transcript_match": match, "voice": voice, "mtime": video.stat().st_mtime}
    (out / "check.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(data, ensure_ascii=False, indent=1))
    print(f"see {report} for the words that differ")
    return 0 if data["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
