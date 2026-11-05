"""Do labels and pose pops land on words, and do mouths follow the voice? usage: sync_stats.py <datadir>"""
import json, pathlib, sys
import numpy as np
d = pathlib.Path(sys.argv[1])
ev = json.load(open(d / "events.json"))
W = [x for s in json.load(open(d / "words.json")) for x in s["words"]]
st = np.array([w["s"] for w in W])
pops = [e["frame"] / 24 for e in ev if e["cls"] == "pop"]
dd = np.array([np.min(np.abs(st - t)) for t in pops])
r = np.random.default_rng(0).uniform(5, 530, 3000)
dr = np.array([np.min(np.abs(st - t)) for t in r])
print("pops", len(pops), "within .15s of a word start", dd.__lt__(.15).mean().round(3), "random", dr.__lt__(.15).mean().round(3))
a = np.fromfile(d / "audio_st.f32", np.float32).reshape(-1, 2).mean(1)
env = np.sqrt((a[: len(a) // 1000 * 1000].reshape(-1, 1000) ** 2).mean(1))
F = json.load(open(d / "faces.json"))
for sh in ("120", "122", "115", "124", "209", "9", "14", "92", "207"):
    if sh not in F:
        continue
    s = np.array(F[sh]["series"], float); fr = s[:, 0].astype(int)
    m = np.abs(np.diff(s[:, 5])); e = np.abs(np.diff(env[fr]))
    c = []
    for l in range(-6, 7):
        x = m[max(0, -l): len(m) - max(0, l)]; y = e[max(0, l): len(e) - max(0, -l)]
        c.append(float(np.corrcoef(x, y)[0, 1]) if x.std() > 0 and y.std() > 0 else 0)
    print(sh, "voice-on share", (env[fr] > 0.03).mean().round(2), "mouth changes", int((m > max(8, .25 * np.median(s[:, 5]))).sum()), "corr lag -6..6", np.round(c, 2))
