"""Track the face on close-up shots: head position and size, where the features sit on the disc, eye and mouth area.

usage: python face_track.py <frames_dir> <shots_csv> <out_json> shot [shot ...]
The characters' heads are near-black discs with bright features, so this finds the disc, then reads what is bright
inside it. Blinks show as a short dip in eye area; a mouth pose change as a step in mouth area.
"""
import csv, json, pathlib, sys
import numpy as np
from PIL import Image

fdir = pathlib.Path(sys.argv[1]); shots = {int(r["shot"]): r for r in csv.DictReader(open(sys.argv[2]))}
out = sys.argv[3]; wanted = [int(x) for x in sys.argv[4:]]
W, H = 640, 360


def load(f):
    im = Image.open(fdir / f"{f:05d}.jpg").convert("L").resize((W, H), Image.BILINEAR)
    return np.asarray(im, np.float32)


def box(mask, r):
    """Sum of a mask over (2r+1)^2 windows, same shape, via an integral image."""
    I = np.pad(mask.astype(np.float32).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    y0 = np.clip(np.arange(H) - r, 0, H); y1 = np.clip(np.arange(H) + r + 1, 0, H)
    x0 = np.clip(np.arange(W) - r, 0, W); x1 = np.clip(np.arange(W) + r + 1, 0, W)
    return I[np.ix_(y1, x1)] - I[np.ix_(y0, x1)] - I[np.ix_(y1, x0)] + I[np.ix_(y0, x0)]


def find_head(l, rguess=None):
    dark = l < 34
    best = None
    for r in ([rguess] if rguess else [34, 44, 54, 64, 76, 90, 105, 120]):
        s = box(dark, int(r * 0.7))
        i = np.argmax(s[20:-20]) + 20 * W  # inside the bars
        y, x = np.unravel_index(i, s.shape)
        fill = s[y, x] / ((2 * int(r * 0.7) + 1) ** 2)
        if best is None or (fill > 0.72 and r > best[0]):
            best = (r, x, y, fill)
    return best


res = {}
for sh in wanted:
    r = shots[sh]; a = int(r["start_frame"]); n = int(r["frames"])
    l0 = load(a + n // 2)
    head = find_head(l0)
    R = head[0]
    series = []
    yy, xx = np.mgrid[0:H, 0:W]
    for f in range(a, a + n):
        l = load(f)
        _, x, y, fill = find_head(l, R)
        # refine centre from dark pixels near the estimate
        d = ((xx - x) ** 2 + (yy - y) ** 2) < (R * 1.15) ** 2
        dd = (l < 34) & d
        if dd.sum() > 50:
            x = float(xx[dd].mean()); y = float(yy[dd].mean())
        rr = np.sqrt(dd.sum() / np.pi)
        d2 = ((xx - x) ** 2 + (yy - y) ** 2) < (0.86 * rr) ** 2
        bright = (l > 110) & d2
        eye = bright & (yy < y + 0.16 * rr)
        mouth = bright & (yy >= y + 0.16 * rr)
        ex = float(xx[eye].mean() - x) / rr if eye.sum() else 0
        ey = float(yy[eye].mean() - y) / rr if eye.sum() else 0
        mh = float(yy[mouth].max() - yy[mouth].min()) if mouth.sum() else 0
        mw = float(xx[mouth].max() - xx[mouth].min()) if mouth.sum() else 0
        series.append([f, round(x, 1), round(y, 1), round(rr, 1), int(eye.sum()), int(mouth.sum()), round(ex, 3), round(ey, 3), mh, mw])
    res[sh] = {"start": a, "frames": n, "fill": round(float(head[3]), 2), "r": R, "series": series}
    print(sh, n, "r", R, "fill", round(float(head[3]), 2), flush=True)
json.dump(res, open(out, "w"))
