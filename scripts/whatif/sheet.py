"""Tile extracted frames into a labelled contact sheet.

usage (module): sheet(frame_ids_or_(id,label), out, cols, tile_w, crop=None)
"""
import pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path("out/whatif/frames")

def sheet(items, out, cols=4, tile_w=384, crop=None, gap=3):
    tiles = []
    for it in items:
        fid, label = it if isinstance(it, tuple) else (it, str(it))
        im = Image.open(ROOT / f"{fid:05d}.jpg").convert("RGB")
        if crop:
            im = im.crop(crop)
        h = round(im.height * tile_w / im.width)
        im = im.resize((tile_w, h), Image.LANCZOS)
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 7 * len(label) + 4, 12], fill=(0, 0, 0))
        d.text((2, 0), label, fill=(255, 255, 0))
        tiles.append(im)
    rows = (len(tiles) + cols - 1) // cols
    h = tiles[0].height
    S = Image.new("RGB", (cols * tile_w + (cols - 1) * gap, rows * h + (rows - 1) * gap), (60, 0, 60))
    for i, t in enumerate(tiles):
        S.paste(t, ((i % cols) * (tile_w + gap), (i // cols) * (h + gap)))
    S.save(out, quality=88)
