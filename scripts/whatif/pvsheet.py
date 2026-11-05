"""Contact sheet of the proof preview. usage: pvsheet.py <dir> <out.jpg> <cols> <tile_w> f1 f2 ... or a:b:step"""
import sys, pathlib
from PIL import Image, ImageDraw
d = pathlib.Path(sys.argv[1]); out = sys.argv[2]; cols = int(sys.argv[3]); tw = int(sys.argv[4])
ids = []
for x in sys.argv[5:]:
    if ":" in x:
        a, b, c = map(int, x.split(":")); ids += list(range(a, b, c))
    else:
        ids.append(int(x))
T = []
for i in ids:
    im = Image.open(d / f"{i:05d}.jpg").convert("RGB")
    im = im.resize((tw, round(im.height * tw / im.width)), Image.LANCZOS)
    D = ImageDraw.Draw(im); D.rectangle([0, 0, 40, 12], fill=(0, 0, 0)); D.text((2, 0), str(i), fill=(255, 255, 0)); T.append(im)
rows = (len(T) + cols - 1) // cols; h = T[0].height
S = Image.new("RGB", (cols * tw + (cols - 1) * 3, rows * h + (rows - 1) * 3), (60, 0, 60))
for i, t in enumerate(T):
    S.paste(t, ((i % cols) * (tw + 3), (i // cols) * (h + 3)))
S.save(out, quality=88)
