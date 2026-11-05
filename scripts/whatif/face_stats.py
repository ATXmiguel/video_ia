"""Blink, mouth, head-bob and look-direction numbers from face_track.py output. usage: face_stats.py <faces.json>"""
import json, sys
import numpy as np
F = json.load(open(sys.argv[1]))
blinks = []; rows = []; holds = []; bob = []; mouth_rates = []; look = []; radii = []; speeds = []
for sh, v in F.items():
    if v["fill"] > 0.9:
        continue
    s = np.array(v["series"], float)
    if len(s) < 10:
        continue
    t = s[:, 0]; x = s[:, 1]; y = s[:, 2]; r = s[:, 3]; eye = s[:, 4]; mouth = s[:, 5]; ex = s[:, 6]; ey = s[:, 7]; mh = s[:, 8]
    med = np.median(eye)
    radii.append(np.median(r) * 2)  # 640 wide, so also px of 720p /2
    b = eye < 0.55 * med
    i = 0; nb = 0
    while i < len(b):
        if b[i]:
            j = i
            while j + 1 < len(b) and b[j + 1]:
                j += 1
            L = j - i + 1
            if L <= 10 and i > 0 and j < len(b) - 1:
                nb += 1; blinks.append((int(sh), int(t[i]), L))
            i = j + 1
        i += 1
    # mouth pose steps: relative jumps
    mm = np.maximum(mouth, 1)
    jump = np.abs(np.diff(mouth)) > np.maximum(0.25 * np.median(mm), 8)
    idx = np.nonzero(jump)[0]
    # group adjacent jumps
    groups = []
    for k in idx:
        if groups and k - groups[-1][-1] <= 2:
            groups[-1].append(k)
        else:
            groups.append([k])
    hs = np.diff([g[0] for g in groups]) if len(groups) > 1 else []
    holds += list(hs)
    rate = len(groups) / (len(s) / 24)
    # head motion: remove linear trend (camera), scale to head radius
    tt = np.arange(len(s))
    def detr(q):
        return q - np.polyval(np.polyfit(tt, q, 1), tt)
    dx = detr(x) / np.median(r); dy = detr(y) / np.median(r)
    dex = detr(ex); 
    bob.append((np.std(dx), np.std(dy)))
    look.append(float(ex.max() - ex.min()))
    vel = np.hypot(np.diff(x), np.diff(y)) / np.median(r)
    speeds.append(np.percentile(vel, 95))
    rows.append((int(sh), len(s), int(np.median(r) * 2), nb, round(rate, 1), round(float(np.std(dx)), 3), round(float(np.std(dy)), 3), round(float(ex.max() - ex.min()), 2), round(float(np.percentile(mh, 90)), 0)))
print("shot frames headDiam640 blinks mouthChanges/s stdX/R stdY/R lookRange/R mouthH90")
for r in rows:
    print(*r)
T = sum(r[1] for r in rows) / 24
print("seconds", round(T, 1), "blinks", len(blinks), "per min", round(len(blinks) / T * 60, 1))
print("blink lengths", np.bincount([b[2] for b in blinks]) if blinks else None)
print("blink list", blinks[:40])
h = np.array(holds)
print("mouth hold frames: n", len(h), "p10,50,90", np.percentile(h, [10, 50, 90]) if len(h) else None, "hist", np.histogram(h, [1, 3, 5, 7, 9, 13, 19, 25, 49, 500])[0] if len(h) else None)
print("head diameter (px of 720p): p10,50,90", np.percentile(np.array(radii) * 2, [10, 50, 90]))
print("bob X,Y std/R median", np.median(bob, axis=0))
print("p95 head speed per frame /R median", np.median(speeds))
