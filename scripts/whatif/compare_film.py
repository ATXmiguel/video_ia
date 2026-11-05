"""Side-by-side stills of a data-built film against the reference, matched by shot kind, plus a numbers table.

Stills contain reference frames, so they stay under out/ and never go in git.

usage: compare_film.py <ref_frames_dir> <ref_shots.csv> <film.mp4> <timeline.json> <out_dir> [our_shots_raw.csv]
"""
import csv
import json
import pathlib
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw

ref = pathlib.Path(sys.argv[1])
rows = list(csv.DictReader(open(sys.argv[2])))
clip = sys.argv[3]
timeline = json.load(open(sys.argv[4]))
out = pathlib.Path(sys.argv[5])
out.mkdir(parents=True, exist_ok=True)
ours_csv = sys.argv[6] if len(sys.argv) > 6 else None
TYPE = {"wide": "W", "close": "C", "top": "T", "insert": "I", "medium": "M"}


def tile(im, label):
    im = im.convert("RGB").resize((960, 540), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 8 * len(label) + 6, 14], fill=(0, 0, 0))
    d.text((3, 1), label, fill=(255, 255, 0))
    return im


def our_frame(n):
    p = out / f"ours_{n:05d}.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{n / 24:.4f}", "-i", clip, "-frames:v", "1", "-q:v", "2", str(p)], check=True)
    return Image.open(p)


for kind, t in TYPE.items():
    mine = [s for s in timeline if s["kind"] == kind]
    theirs = sorted([r for r in rows if r["type"] == t], key=lambda r: float(r["dur_s"]))
    if not mine or not theirs:
        continue
    for i, s in enumerate(mine[:3]):
        r = theirs[int(len(theirs) * (i + 1) / 4)]
        rf = (int(r["start_frame"]) + int(r["end_frame"])) // 2
        of = s["start"] + s["dur"] * 2 // 3
        a = tile(Image.open(ref / f"{rf:05d}.jpg"), f"REFERENCE {rf} type {t}")
        b = tile(our_frame(of), f"OURS {of} {s['id']}")
        S = Image.new("RGB", (1926, 540), (60, 0, 60))
        S.paste(a, (0, 0))
        S.paste(b, (966, 0))
        S.save(out / f"compare_{kind}_{i + 1}.jpg", quality=90)


def stats(R):
    dur = np.array([float(r["dur_s"]) for r in R])
    return {"shots": len(R), "seconds": round(float(dur.sum()), 1), "mean_s": round(float(dur.mean()), 2), "median_s": round(float(np.median(dur)), 2),
            "p10_s": round(float(np.percentile(dur, 10)), 2), "p90_s": round(float(np.percentile(dur, 90)), 2),
            "over_6s": round(float((dur > 6).mean()), 3), "luma_p50": float(np.median([float(r["luma_p50"]) for r in R])),
            "sat": round(float(np.mean([float(r["sat_mean"]) for r in R])), 3), "corner_center": round(float(np.median([float(r["corner_over_center"]) for r in R])), 2)}


res = {"reference": stats(rows)}
if ours_csv:
    res["ours"] = stats(list(csv.DictReader(open(ours_csv))))
print(json.dumps(res, indent=1))
(out / "numbers.json").write_text(json.dumps(res, indent=1))
