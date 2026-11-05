"""Sample real pixel values and estimate blur for the guide. usage: sample_look.py <frames_dir>"""
import pathlib, sys
import numpy as np
from PIL import Image

D = pathlib.Path(sys.argv[1])


def img(f):
    return np.asarray(Image.open(D / f"{f:05d}.jpg").convert("RGB"), np.float32)


def hx(v):
    return "#%02x%02x%02x" % tuple(int(round(x)) for x in v)


def patch(f, x, y, r=4):
    a = img(f)[y - r:y + r + 1, x - r:x + r + 1].reshape(-1, 3)
    return hx(np.median(a, 0))


# name, frame, x, y (720p coordinates, chosen from frames read at full size)
SAMPLES = [
    ("bar", 4870, 640, 18), ("head black warm", 4870, 470, 370), ("head black close", 7150, 600, 260), ("head black cold", 9600, 600, 300),
    ("rim warm close", 6410, 0, 0), ("hoodie blue day", 4700, 708, 400), ("hoodie blue warm", 4870, 440, 480),
    ("wall warm kitchen", 4870, 300, 90), ("wall right kitchen", 4870, 1000, 300), ("wall dusk mid", 4870, 800, 90),
    ("cabinet green", 4870, 240, 160), ("tile", 4870, 350, 290), ("floor plank", 4870, 200, 620), ("cloth", 4870, 690, 540),
    ("lampshade", 4870, 698, 195), ("wood table top-down", 90, 500, 620), ("wood table lit", 90, 300, 300),
    ("eye cream", 9600, 582, 292), ("mouth cream", 9600, 620, 354), ("rim cold", 9600, 733, 300), ("suit navy", 9600, 555, 560),
    ("night bg", 9600, 300, 620), ("office tile top", 4700, 150, 560), ("sign green", 4700, 425, 105), ("text cream", 90, 650, 400),
    ("phone black", 90, 650, 230), ("battery amber", 90, 650, 310), ("gold watch", 90, 30, 480), ("glove", 90, 200, 430),
    ("bg navy data", 8831, 640, 620), ("line pale", 1773, 0, 0),
]
for name, f, x, y in SAMPLES:
    if x == 0:
        continue
    print(f"{name:24s} frame {f:6d} ({x},{y}) {patch(f, x, y)}")


def edge_sigma(f, y0, y1, x0, x1):
    """Estimate gaussian sigma from the sharpest edge in a region: sigma = contrast / (sqrt(2pi) * max gradient)."""
    a = img(f).mean(2)[y0:y1, x0:x1]
    a = a.mean(0)  # average rows, so a vertical edge survives and noise does not
    g = np.abs(np.convolve(a, [0.5, 0, -0.5], "valid"))
    i = int(np.argmax(g))
    lo = a[max(0, i - 40):i + 1].min(); hi = a[i:min(len(a), i + 40)].max()
    lo2 = a[max(0, i - 40):i + 1].max(); hi2 = a[i:min(len(a), i + 40)].min()
    c = max(hi - lo, lo2 - hi2)
    return round(float(c / (np.sqrt(2 * np.pi) * (g[i] + 1e-6))), 1), round(float(c), 0)


# (frame, y0,y1,x0,x1): vertical edges in the background of close-ups and in sharp planes
for label, q in [
    ("close kitchen window (bg)", (7150, 200, 330, 690, 760)), ("close kitchen door (bg)", (7150, 280, 440, 60, 130)), ("close fridge (bg)", (7150, 260, 460, 1100, 1180)),
    ("close night board (bg)", (9600, 230, 330, 90, 170)), ("close 5470 fridge", (5470, 250, 450, 900, 1000)),
    ("wide kitchen cabinet (sharp)", (4870, 140, 220, 120, 160)), ("wide fridge edge", (4870, 250, 460, 1190, 1240)),
    ("wide street door", (4700, 200, 400, 360, 400)), ("head edge close", (7150, 290, 330, 470, 510)),
    ("top-down table phone edge", (90, 300, 500, 520, 560)), ("mid plane close 7300 bowl", (7300, 170, 190, 290, 360)),
]:
    print(f"{label:32s} sigma_px720, contrast {edge_sigma(q[0], *q[1:])}")

# rim width on close-ups: walk outwards from the head centre along a ray and find where black ends and rim ends
def rim_width(f, cx, cy, angle):
    a = img(f)
    t = np.deg2rad(angle)
    prof = []
    for r in range(60, 240):
        x = int(cx + r * np.cos(t)); y = int(cy + r * np.sin(t))
        prof.append(a[y, x])
    prof = np.array(prof)
    L = prof.mean(1)
    # end of head = first r where brightness rises; then rim runs until colour change
    i = int(np.argmax(L > 45))
    rimc = prof[i + 3]
    j = i + 3
    while j < len(prof) - 1 and np.abs(prof[j] - rimc).sum() < 45:
        j += 1
    return i + 60, j - i, hx(rimc)


for f, cx, cy, ang, lab in [(7150, 602, 310, -30, "cold-ish day"), (7150, 602, 310, 0, ""), (7150, 602, 310, -60, ""), (7150, 602, 310, 170, "shadow side"),
                            (9600, 602, 300, -30, "night"), (9600, 602, 300, 0, ""), (9600, 602, 300, 170, "shadow side"),
                            (5470, 615, 280, -60, "warm"), (5470, 615, 280, -90, ""), (5470, 615, 280, 170, "shadow side")]:
    print("rim", f, ang, lab, "head radius, rim width, colour", rim_width(f, cx, cy, ang))
