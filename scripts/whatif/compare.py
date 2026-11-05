"""Side-by-side stills and motion strips: reference (left or top) against our clip. Output stays under out/, never in git.

usage: compare.py <ref_frames_dir> <proof_clip.mp4> <out_dir>
"""
import pathlib, subprocess, sys
from PIL import Image, ImageDraw

ref = pathlib.Path(sys.argv[1]); clip = sys.argv[2]; out = pathlib.Path(sys.argv[3])
ours = out / "frames"; ours.mkdir(parents=True, exist_ok=True)
if not any(ours.iterdir()):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", clip, "-start_number", "0", "-q:v", "2", str(ours / "%05d.jpg")], check=True)


def tile(path, w, crop=None, label=None):
    im = Image.open(path).convert("RGB")
    if crop:
        s = im.width / 1280
        im = im.crop(tuple(int(c * s) for c in crop))
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    if label:
        d = ImageDraw.Draw(im); d.rectangle([0, 0, 8 * len(label) + 6, 14], fill=(0, 0, 0)); d.text((3, 1), label, fill=(255, 255, 0))
    return im


def pair(name, rf, of):
    a = tile(ref / f"{rf:05d}.jpg", 960, label=f"REFERENCE {rf}")
    b = tile(ours / f"{of:05d}.jpg", 960, label=f"OURS {of}")
    S = Image.new("RGB", (1926, a.height), (60, 0, 60)); S.paste(a, (0, 0)); S.paste(b, (966, 0))
    S.save(out / f"compare_{name}.jpg", quality=90)


def strip(name, rfs, ofs, rcrop=None, ocrop=None, w=190, cols=8):
    rows = []
    for src, ids, crop, lab in ((ref, rfs, rcrop, "R"), (ours, ofs, ocrop, "O")):
        rows.append([tile(src / f"{i:05d}.jpg", w, crop, f"{lab}{i}") for i in ids])
    n = max(len(r) for r in rows)
    h = sum((r[0].height + 3) * ((len(r) + cols - 1) // cols) for r in rows)
    S = Image.new("RGB", (cols * (w + 3), h), (60, 0, 60)); y = 0
    for r in rows:
        for i, t in enumerate(r):
            S.paste(t, ((i % cols) * (w + 3), y + (i // cols) * (t.height + 3)))
        y += (r[0].height + 3) * ((len(r) + cols - 1) // cols)
    S.save(out / f"strip_{name}.jpg", quality=88)


pair("walk", 4710, 30)
pair("closeup", 5470, 75)
pair("wide", 4870, 140)
pair("topdown", 90, 195)
pair("rackfocus", 8620, 280)
pair("wipe", 1682, 402)
pair("pill", 1060, 440)
strip("walk", list(range(4700, 4716)), list(range(14, 30)), (560, 240, 880, 600), (300, 340, 780, 880))
strip("gesture", list(range(2834, 2858, 3)) , list(range(112, 136, 3)), (250, 100, 760, 660), (250, 220, 900, 900))
strip("face", list(range(4586, 4602, 2)), list(range(217, 233, 2)), (440, 140, 820, 520), (620, 150, 1040, 570))
print("wrote", sorted(p.name for p in out.glob("*.jpg")))
