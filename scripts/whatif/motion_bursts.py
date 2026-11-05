"""How much things move inside each shot: local motion bursts, their lengths, and the holds between them.

usage: python motion_bursts.py <datadir> <shots_csv> <out.json>
A burst is a run of frames where more than a small share of pixels changed by more than a threshold. The threshold is
high enough that the slow camera drift on soft backgrounds doesn't count, so a burst is a pose change, a prop or a label.
"""
import csv, json, pathlib, sys
import numpy as np

d = pathlib.Path(sys.argv[1]); R = list(csv.DictReader(open(sys.argv[2]))); out = sys.argv[3]
meta = json.load(open(d / "meta.json")); n = meta["frames"]; H, W = meta["gray"]
G = np.memmap(d / "gray.bin", np.uint8, "r", shape=(n, H, W))
TOP, BOT = 12, H - 12
THR = 12; FRAC = 0.0012  # about 37 pixels of the 240x135 picture: one forearm moving on a wide shot

bursts = []; holds = []; per = []; moving_frames = 0; total = 0
for r in R:
    a = int(r["start_frame"]); L = int(r["frames"])
    if L < 6:
        continue
    pan = abs(float(r["pan_x_px_s"])); zoom = abs(float(r["zoom_pct_s"]))
    e = np.zeros(L)
    for f in range(a + 1, a + L):
        e[f - a] = (np.abs(np.asarray(G[f], np.int16)[TOP:BOT] - np.asarray(G[f - 1], np.int16)[TOP:BOT]) > THR).mean()
    on = e > FRAC
    tracked = pan > 8 or zoom > 3  # the camera itself lights up the detector, so these shots only count as moving
    runs = []; i = 1
    while i < L:
        if on[i]:
            j = i
            while j + 1 < L and on[j + 1]:
                j += 1
            runs.append((i, j)); i = j + 1
        i += 1
    # merge runs separated by one quiet frame
    merged = []
    for x in runs:
        if merged and x[0] - merged[-1][1] <= 2:
            merged[-1] = (merged[-1][0], x[1])
        else:
            merged.append(x)
    moving = int(on.sum())
    total += L; moving_frames += moving
    if not tracked:
        bursts += [y - x + 1 for x, y in merged]
        gaps = [merged[k + 1][0] - merged[k][1] - 1 for k in range(len(merged) - 1)]
        holds += gaps
    per.append(dict(shot=int(r["shot"]), frames=L, moving=moving, n_bursts=len(merged), tracked=tracked))

b = np.array(bursts) if bursts else np.zeros(1); h = np.array(holds) if holds else np.zeros(1)
summary = dict(
    shots=len(per), frames=total, moving_share=round(moving_frames / total, 3),
    bursts_per_shot_median=float(np.median([p["n_bursts"] for p in per])),
    bursts_per_10s=round(sum(p["n_bursts"] for p in per) / total * 240, 1),
    shots_with_no_motion_share=round(np.mean([p["n_bursts"] == 0 for p in per]), 3),
    burst_len_p10_50_90=np.percentile(b, [10, 50, 90]).tolist(),
    burst_hist_1_2_3_4_6_8_12_24_plus=np.histogram(b, [1, 2, 3, 4, 6, 8, 12, 24, 10000])[0].tolist(),
    hold_len_p10_50_90=np.percentile(h, [10, 50, 90]).tolist(),
    hold_hist_1_3_6_12_24_48_plus=np.histogram(h, [1, 3, 6, 12, 24, 48, 10000])[0].tolist(),
)
json.dump(dict(summary=summary, per=per), open(out, "w"))
print(json.dumps(summary, indent=0))
