"""Classify cut candidates and measure every shot: camera motion, moving regions, color, animation cadence.

usage: python shot_table.py <datadir> <out.csv>

Event classes:
  cut   : content changes and no similarity transform explains it
  camera: a fast zoom/pan step, explained by a similarity transform (best aligned NCC high)
  pop   : a local change on a static picture (pose snap, label appearing, wipe edge)
Camera motion is a robust Lucas-Kanade fit of (scale, tx, ty) between frames 4 apart, on the 240x135 luma.
"""
import csv, json, sys, pathlib
import numpy as np

d = pathlib.Path(sys.argv[1]); out_csv = sys.argv[2]
meta = json.load(open(d / "meta.json"))
n = meta["frames"]; H, W = meta["gray"]
G = np.memmap(d / "gray.bin", np.uint8, "r", shape=(n, H, W))
C = np.memmap(d / "rgb.bin", np.uint8, "r", shape=(n, 90, 160, 3))
ev = json.load(open(d / "cuts.json"))["hard"]
TOP, BOT = 12, H - 12   # work inside the letterbox bars

yy, xx = np.mgrid[TOP:BOT, 0:W].astype(np.float32)
cx, cy = (W - 1) / 2, (H - 1) / 2
xn, yn = xx - cx, yy - cy
K = np.array([1, 4, 6, 4, 1], np.float32) / 16


def bilinear(img, x, y):
    x = np.clip(x, 0, W - 1.001); y = np.clip(y, 0, H - 1.001)
    x0 = x.astype(int); y0 = y.astype(int); fx = x - x0; fy = y - y0
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy)
            + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy)


def blur(f):
    # separable 5-tap blur without scipy
    p = np.pad(f, 2, mode="edge")
    v = sum(K[i] * p[i:i + f.shape[0], 2:-2] for i in range(5))
    p = np.pad(v, ((0, 0), (2, 2)), mode="edge")
    return sum(K[i] * p[:, i:i + f.shape[1]] for i in range(5))


def fit(a, b, iters=6):
    """Find s,tx,ty so that b(s*x+tx, s*y+ty) ~ a. Robust: pixels that disagree (characters) get low weight."""
    a = blur(a.astype(np.float32)); b = blur(b.astype(np.float32))
    gy, gx = np.gradient(b)
    s, tx, ty = 1.0, 0.0, 0.0
    r = None
    for _ in range(iters):
        X = cx + s * xn + tx; Y = cy + s * yn + ty
        bw = bilinear(b, X, Y); gxw = bilinear(gx, X, Y); gyw = bilinear(gy, X, Y)
        r = a[TOP:BOT] - bw
        sr = np.median(np.abs(r)) * 1.5 + 0.5
        w = 1.0 / (1 + (r / (3 * sr)) ** 2)
        J = np.stack([(gxw * xn + gyw * yn).ravel(), gxw.ravel(), gyw.ravel()], 1)
        WJ = J * w.ravel()[:, None]
        A = J.T @ WJ + np.eye(3) * 1e-3
        dp = np.linalg.solve(A, WJ.T @ r.ravel())
        s += dp[0]; tx += dp[1]; ty += dp[2]
    return s, tx, ty, np.abs(r)


def ncc(a, b):
    a = a - a.mean(); b = b - b.mean()
    dn = np.sqrt((a * a).sum() * (b * b).sum())
    return float((a * b).sum() / dn) if dn > 1e-3 else 1.0


# 1. classify events
for e in ev:
    f = e["frame"]
    a = np.asarray(G[f - 1], np.float32); b = np.asarray(G[f], np.float32)
    best = -2
    for s0 in (1.0, 0.9, 1.1, 0.8, 1.25):
        best = max(best, ncc(a[TOP:BOT], bilinear(b, cx + s0 * xn, cy + s0 * yn)))
    s, tx, ty, r = fit(a, b)
    best = max(best, ncc(a[TOP:BOT], bilinear(b, cx + s * xn + tx, cy + s * yn + ty)))
    chg = float((np.abs(a - b)[TOP:BOT] > 12).mean())
    e["aligned"] = round(best, 3); e["chg"] = round(chg, 3)
    if chg < 0.28 and e["ncc"] > 0.80:
        e["cls"] = "pop"
    elif best > 0.93 and chg < 0.6 and abs(s - 1) < 0.3 and e["ncc"] > 0.5:
        e["cls"] = "camera"
    else:
        e["cls"] = "cut"

overrides = {}
ov = d / "overrides.json"
if ov.exists():
    overrides = {int(k): v for k, v in json.load(open(ov)).items()}
have = {e["frame"] for e in ev}
for f, c in overrides.items():
    if f not in have:  # soft transitions have no spike, so they enter the table only through a reviewed override
        ev.append({"frame": f, "t": round(f / 24, 3), "mad": 0, "ncc": 1, "hist": 0, "score": 0, "nscore": 0, "aligned": 1, "chg": 0, "cls": c})
ev.sort(key=lambda e: e["frame"])
for e in ev:
    if e["frame"] in overrides:
        e["cls"] = overrides[e["frame"]]

BOUNDARY = ("cut", "wipe", "dissolve", "fade")
kinds = {e["frame"]: e["cls"] for e in ev if e["cls"] in BOUNDARY}
bounds = [0] + sorted(kinds) + [n]
others = [e for e in ev if e["cls"] not in BOUNDARY]
cam_frames = {e["frame"] for e in ev if e["cls"] == "camera"}


def luma_rgb(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


rows = []
for i in range(len(bounds) - 1):
    a, b = bounds[i], bounds[i + 1]
    L = b - a
    ss, txs, tys = [], [], []
    res = np.zeros((H, W), np.float32); cnt = 0
    step = 4 if L > 8 else 1
    for f in range(a, b - step, step):
        if any(c in cam_frames for c in range(f + 1, f + step + 1)):
            continue
        A = np.asarray(G[f], np.float32); B = np.asarray(G[f + step], np.float32)
        s, tx, ty, r = fit(A, B, iters=4)
        ss.append((s - 1) / step); txs.append(tx / step); tys.append(ty / step)
        res[TOP:BOT] += (r > 6).astype(np.float32); cnt += 1
    if ss:
        # a point at x in a sits at s*x+t in b, so s>1 means the picture grew (push in) and t>0 means it moved right/down.
        zoom = float(np.median(ss)) * 24 * 100   # % per second, + = push in
        panx = float(np.median(txs)) * 24 * (1280 / W)  # px of 720p per second; + = picture moves right
        pany = float(np.median(tys)) * 24 * (720 / H)
        zvar = float(np.std(ss)) * 24 * 100
        pvar = float(np.std(txs)) * 24 * (1280 / W)
    else:
        zoom = panx = pany = zvar = pvar = 0.0
    frac = 0.0; bbox = [0, 0, 0, 0]
    if cnt:
        mask = (res / cnt)[TOP:BOT] > 0.2
        frac = float(mask.mean())
        ys, xs = np.nonzero(mask)
        if len(xs):
            bbox = [round(float(np.percentile(xs, 2)) / W, 2), round(float(np.percentile(ys, 2)) / (BOT - TOP), 2),
                    round(float(np.percentile(xs, 98)) / W, 2), round(float(np.percentile(ys, 98)) / (BOT - TOP), 2)]
    dif = np.array([float(np.abs(np.asarray(G[f], np.float32)[TOP:BOT] - np.asarray(G[f - 1], np.float32)[TOP:BOT]).mean())
                    for f in range(a + 1, b)] or [0.0])
    held = float((dif < 0.05).mean())
    lag2 = 0.0
    if len(dif) > 8 and dif.std() > 1e-6:
        x = dif - dif.mean()
        lag2 = float((x[:-2] * x[2:]).sum() / (x * x).sum())
    mid = np.asarray(C[(a + b) // 2][8:-8], np.float32)
    l = luma_rgb(mid)
    mx = mid.max(2); mn = mid.min(2)
    sat = float(((mx - mn) / (mx + 1)).mean())
    p = np.percentile(l, [1, 50, 99])
    h_, w_ = l.shape
    corner = float(np.mean([l[:12, :18].mean(), l[:12, -18:].mean(), l[-12:, :18].mean(), l[-12:, -18:].mean()]))
    centre = float(l[h_ // 2 - 15:h_ // 2 + 15, w_ // 2 - 25:w_ // 2 + 25].mean())
    mean_rgb = mid.reshape(-1, 3).mean(0)
    inner = [e for e in others if a < e["frame"] < b]
    rows.append(dict(shot=i + 1, transition_in=kinds.get(a, "start"), start_frame=a, end_frame=b - 1, frames=L, start_s=round(a / 24, 3), dur_s=round(L / 24, 3),
                     zoom_pct_s=round(zoom, 2), pan_x_px_s=round(panx, 1), pan_y_px_s=round(pany, 1), zoom_std=round(zvar, 2), pan_std=round(pvar, 1),
                     moving_frac=round(frac, 3), move_x0=bbox[0], move_y0=bbox[1], move_x1=bbox[2], move_y1=bbox[3],
                     held_frac=round(held, 2), diff_lag2=round(lag2, 2), luma_p1=round(p[0]), luma_p50=round(p[1]), luma_p99=round(p[2]),
                     sat_mean=round(sat, 3), corner_over_center=round(corner / (centre + 1), 2),
                     mean_rgb="#%02x%02x%02x" % tuple(int(v) for v in mean_rgb),
                     n_pops=sum(1 for e in inner if e["cls"] == "pop"), n_cam_jumps=sum(1 for e in inner if e["cls"] == "camera")))
    if i % 50 == 0:
        print(i, a, L, round(zoom, 1), round(panx), flush=True)

with open(out_csv, "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
json.dump(ev, open(d / "events.json", "w"), indent=0)
print("events", {c: sum(1 for e in ev if e["cls"] == c) for c in ("cut", "wipe", "dissolve", "fade", "camera", "pop")}, "shots", len(rows))
