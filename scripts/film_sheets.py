"""Contact sheets from a folder of stills, each tile labelled with its shot or time, for reading a film quickly.
usage: python scripts/film_sheets.py <stills_dir> <timeline.csv or -> <out_prefix> [cols] [rows] [tile_w]"""
import csv
import sys
from pathlib import Path

from PIL import Image, ImageDraw

src, tl, prefix = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6
rows = int(sys.argv[5]) if len(sys.argv) > 5 else 5
w = int(sys.argv[6]) if len(sys.argv) > 6 else 320
h = w * 9 // 16
names = {}
if tl != "-":
    for r in csv.DictReader(open(tl, encoding="utf-8")):
        names[int(r["start_frame"]) + int(r["frames"]) // 2] = r["shot"]
files = sorted(src.glob("*.jpg"))
if names:
    files = [f for f in files if int(f.stem[1:]) in names]
for page in range(0, len(files), cols * rows):
    sheet = Image.new("RGB", (cols * w, rows * h), "#222")
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(files[page : page + cols * rows]):
        im = Image.open(f).resize((w, h))
        x, y = (i % cols) * w, (i // cols) * h
        sheet.paste(im, (x, y))
        n = int(f.stem[1:])
        d.rectangle([x, y, x + 74, y + 13], fill="#000")
        d.text((x + 2, y + 1), names.get(n, f"{n / 24:.0f}s"), fill="#ff0")
    sheet.save(f"{prefix}{page // (cols * rows) + 1:02d}.jpg", quality=82)
print(len(files), "tiles")
