"""Find every cut in a reference film from the small gray memmap written by decode_small.py.

usage: python detect_cuts.py <datadir>
Writes per-frame metrics (frame_metrics.npz) and cuts.json: hard cuts plus soft-transition candidates.
Normalized cross-correlation is used alongside absolute difference so that dark, low-contrast cuts are not missed.
"""
import json, sys, pathlib
import numpy as np

d = pathlib.Path(sys.argv[1])
meta = json.load(open(d / "meta.json"))
n = meta["frames"]; H, W = meta["gray"]
G = np.memmap(d / "gray.bin", np.uint8, "r", shape=(n, H, W))

mad = np.zeros(n); ncc = np.ones(n); mean = np.zeros(n); std = np.zeros(n); mad6 = np.zeros(n); hist = np.zeros(n)
prev = None; prevh = None
buf = {}
for i in range(n):
    f = np.asarray(G[i], np.float32)
    mean[i] = f.mean(); std[i] = f.std()
    h = np.histogram(f, bins=32, range=(0, 256))[0] / f.size
    if prev is not None:
        mad[i] = np.abs(f - prev).mean()
        a = f - f.mean(); b = prev - prev.mean()
        dn = np.sqrt((a * a).sum() * (b * b).sum())
        ncc[i] = (a * b).sum() / dn if dn > 1e-3 else 1.0
        hist[i] = np.abs(h - prevh).sum()
    if i >= 6:
        mad6[i] = np.abs(f - np.asarray(G[i - 6], np.float32)).mean()
    prev = f; prevh = h

def local_median(x, r=12):
    out = np.zeros_like(x)
    for i in range(len(x)):
        lo, hi = max(0, i - r), min(len(x), i + r + 1)
        v = np.concatenate([x[lo:i], x[i + 1:hi]])
        out[i] = np.median(v) if len(v) else 0
    return out

mm = local_median(mad); nm = local_median(1 - ncc)
score = (mad / (mm + 0.25)); nscore = ((1 - ncc) / (nm + 0.002))
cuts = []
for i in range(1, n):
    strong = mad[i] > 2.0 and score[i] > 5
    darkcut = (1 - ncc[i]) > 0.12 and nscore[i] > 8
    hcut = hist[i] > 0.35 and score[i] > 3
    if strong or darkcut or hcut:
        cuts.append({"frame": i, "t": round(i / 24, 3), "mad": round(float(mad[i]), 2), "ncc": round(float(ncc[i]), 3),
                     "hist": round(float(hist[i]), 3), "score": round(float(score[i]), 1), "nscore": round(float(nscore[i]), 1)})
# merge cuts one frame apart (a cut spread over 2 frames by the encoder)
merged = []
for c in cuts:
    if merged and c["frame"] - merged[-1]["frame"] <= 2:
        merged[-1].setdefault("also", []).append(c["frame"])
        continue
    merged.append(c)
# soft candidates: large 6-frame change without a hard cut within it
hard = np.array([c["frame"] for c in merged])
soft = []
i = 6
while i < n:
    if mad6[i] > 6 and (len(hard) == 0 or np.min(np.abs(hard - (i - 3))) > 8):
        j = i
        while j + 1 < n and mad6[j + 1] > 6:
            j += 1
        soft.append({"from": i - 6, "to": j, "peak": round(float(mad6[i:j + 1].max()), 1), "t": round(i / 24, 2)})
        i = j + 1
    i += 1
np.savez(d / "frame_metrics.npz", mad=mad, ncc=ncc, mean=mean, std=std, mad6=mad6, hist=hist)
json.dump({"hard": merged, "soft": soft}, open(d / "cuts.json", "w"), indent=0)
print("hard", len(merged), "soft", len(soft))
print("mean luma p5/50/95", np.percentile(mean, [5, 50, 95]).round(1))
