"""Follow one dark head through a frame range and print the normalized motion curve: shows easing and overshoot.
usage: track_head.py <frames_dir> first last x0 y0 x1 y1 [r]  (720p crop box that holds only that head)"""
import pathlib, sys
import numpy as np
from PIL import Image
D = pathlib.Path(sys.argv[1]); a, b, x0, y0, x1, y1 = map(int, sys.argv[2:8])
xs = []; ys = []
for f in range(a, b + 1):
    l = np.asarray(Image.open(D / f"{f:05d}.jpg").convert("L").crop((x0, y0, x1, y1)), np.float32)
    m = l < 32
    # keep the largest filled square-ish blob: erode by box coverage so thin limbs drop out
    I = np.pad(m.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    r = int(sys.argv[8]) if len(sys.argv) > 8 else 12
    h, w = m.shape
    cov = I[2 * r:, 2 * r:] - I[:-2 * r, 2 * r:] - I[2 * r:, :-2 * r] + I[:-2 * r, :-2 * r]
    ok = cov >= 0.92 * (2 * r) ** 2
    if ok.sum():
        yy, xx = np.nonzero(ok)
        xs.append(float(xx.mean() + r + x0)); ys.append(float(yy.mean() + r + y0))
    else:
        xs.append(np.nan); ys.append(np.nan)
xs = np.array(xs); ys = np.array(ys)
print("frame  x  y")
for i in range(len(xs)):
    print(a + i, round(xs[i], 1), round(ys[i], 1))
