"""Measure a film's sound without listening: levels, the bed under the voice, stereo width, and hits at cuts.

usage: python audio_stats.py <audio_st.f32> <cuts.json|events.json|-> [words.json]
audio is 24 kHz interleaved stereo float32. Everything here is a measurement; none of it says how it sounds.
"""
import json, sys
import numpy as np

SR = 24000
a = np.fromfile(sys.argv[1], np.float32).reshape(-1, 2)
evs = sys.argv[2]; words = sys.argv[3] if len(sys.argv) > 3 else None
M = a.mean(1); S = (a[:, 0] - a[:, 1]) / 2
HOP = 1200  # 50 ms
n = len(M) // HOP
def rms(x):
    return np.sqrt((x[:n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-12)
def db(x):
    return 20 * np.log10(x + 1e-9)
L = db(rms(M))
print("mean/median/p10/p90 short-term dB", *np.round([L.mean(), np.median(L), np.percentile(L, 10), np.percentile(L, 90)], 1))
print("share of 50ms windows below -50 dB", round(float((L < -50).mean()), 3), "below -35", round(float((L < -35).mean()), 3))
print("side/mid ratio dB overall", round(float(db(np.sqrt((S ** 2).mean())) - db(np.sqrt((M ** 2).mean()))), 1))

# Band levels by FFT on 2048-sample frames
F = 2048; HF = 1024
idx = np.arange(0, len(M) - F, HF * 6)
win = np.hanning(F)
spec = np.abs(np.fft.rfft(M[idx[:, None] + np.arange(F)] * win, axis=1)) ** 2
freqs = np.fft.rfftfreq(F, 1 / SR)
bands = [(20, 80), (80, 250), (250, 1000), (1000, 4000), (4000, 11000)]
tot = spec.sum(1) + 1e-12

if words:
    W = [x for s in json.load(open(words)) for x in s["words"]]
    speech = np.zeros(n, bool)
    for w in W:
        i0 = int(w["s"] * 20); i1 = int(np.ceil(w["e"] * 20))
        speech[i0:i1 + 1] = True
    # gaps: at least 150 ms from any word, so this reads the bed rather than word tails
    near = np.convolve(speech.astype(int), np.ones(7, int), "same") > 0
    gap = ~near
    print("speech share", round(float(speech.mean()), 3), "gap share", round(float(gap.mean()), 3))
    print("speech level dB median, p90", *np.round(np.percentile(L[speech], [50, 90]), 1))
    print("gap level dB p10, p50, p90 (bed between words)", *np.round(np.percentile(L[gap], [10, 50, 90]), 1))
    print("median voice minus median bed dB", round(float(np.median(L[speech]) - np.median(L[gap])), 1))
    fr = (idx + F // 2) / HOP
    fr = np.clip(fr.astype(int), 0, n - 1)
    for name, m in (("speech", speech[fr]), ("gap", gap[fr])):
        print(name, "band dB", {f"{lo}-{hi}": round(float(10 * np.log10(spec[m][:, (freqs >= lo) & (freqs < hi)].sum(1).mean() + 1e-12)), 1) for lo, hi in bands})
    # bed level per minute, and how much it moves
    per = [np.round(float(np.median(L[gap][(np.nonzero(gap)[0] // 1200) == k])), 1) if ((np.nonzero(gap)[0] // 1200) == k).any() else None for k in range(n // 1200 + 1)]
    print("gap median dB per minute", per)
    gaps = [W[i + 1]["s"] - W[i]["e"] for i in range(len(W) - 1)]
    g = np.array(gaps)
    print("pauses between words: >0.35s", int((g > 0.35).sum()), ">1s", int((g > 1).sum()), ">2s", int((g > 2).sum()), "longest", round(float(g.max()), 2))
    # true rate while talking
    runs = []; t = W[0]["s"]; c = 0; last = W[0]
    for w in W:
        if w["s"] - last["e"] > 0.7:
            runs.append((c, last["e"] - t)); t = w["s"]; c = 0
        c += 1; last = w
    runs.append((c, last["e"] - t))
    rr = sum(x[0] for x in runs) / sum(x[1] for x in runs)
    print("words per second inside phrases", round(rr, 2), "phrases", len(runs), "median phrase s", round(float(np.median([x[1] for x in runs])), 2))

if evs != "-":
    E = json.load(open(evs))
    if isinstance(E, dict):
        E = E["hard"]
    cuts = [e["frame"] / 24 for e in E if e.get("cls", "cut") == "cut"]
    # energy jump at each cut compared with random places: 100 ms after vs 100 ms before
    def jump(t):
        i = int(t * SR)
        w = int(0.1 * SR)
        if i - w < 0 or i + w >= len(M):
            return 0.0
        return float(db(np.sqrt((M[i:i + w] ** 2).mean())) - db(np.sqrt((M[i - w:i] ** 2).mean())))
    jc = np.array([jump(t) for t in cuts])
    rng = np.random.default_rng(1)
    jr = np.array([jump(t) for t in rng.uniform(1, len(M) / SR - 1, 2000)])
    print("cuts", len(cuts), "energy jump at cut dB p50,p90", *np.round(np.percentile(jc, [50, 90]), 1), "random p50,p90", *np.round(np.percentile(jr, [50, 90]), 1))
    print("share of cuts with jump > 6 dB", round(float((jc > 6).mean()), 3), "random", round(float((jr > 6).mean()), 3))
    # high frequency transient share at cuts
    def hf(t):
        i = int(t * SR); w = 2048
        if i + w >= len(M):
            return 0.0
        p = np.abs(np.fft.rfft(M[i:i + w] * win)) ** 2
        return float(p[freqs > 3000].sum() / (p.sum() + 1e-12))
    print("HF share after cut median", round(float(np.median([hf(t) for t in cuts])), 3), "random", round(float(np.median([hf(t) for t in rng.uniform(1, len(M) / SR - 1, 500)])), 3))
    if words:
        starts = np.array([w["s"] for w in W]); ends = np.array([w["e"] for w in W])
        # distance from a cut to the nearest phrase start and to the nearest word boundary
        phrase_starts = np.array([W[0]["s"]] + [W[i]["s"] for i in range(1, len(W)) if W[i]["s"] - W[i - 1]["e"] > 0.25])
        ds = np.array([phrase_starts[np.argmin(np.abs(phrase_starts - t))] - t for t in cuts])
        print("cut to nearest phrase start, seconds (+ = voice comes after the cut): p10,p50,p90", *np.round(np.percentile(ds, [10, 50, 90]), 2), " within 0.25s:", round(float((np.abs(ds) < 0.25).mean()), 3), "within 0.5s:", round(float((np.abs(ds) < 0.5).mean()), 3))
        inside = np.array([((starts <= t) & (ends >= t)).any() for t in cuts])
        print("cuts landing inside a word", round(float(inside.mean()), 3))
        rp = rng.uniform(5, len(M) / SR - 5, 3000)
        ds2 = np.array([np.min(np.abs(phrase_starts - t)) for t in rp])
        print("random: within 0.25s", round(float((ds2 < 0.25).mean()), 3), "within 0.5s", round(float((ds2 < 0.5).mean()), 3))
        wps = []
        for t0, t1 in zip(cuts[:-1], cuts[1:]):
            wps.append(((starts >= t0) & (starts < t1)).sum())
        wps = np.array(wps)
        print("words per shot p10,p50,p90", *np.percentile(wps, [10, 50, 90]), " shots with no words", round(float((wps == 0).mean()), 3))
