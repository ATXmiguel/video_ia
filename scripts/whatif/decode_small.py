"""Decode a reference video into small memmaps for measurement (stays under out/, never committed).

usage: python decode_small.py <video> <outdir>
Writes gray.bin (240x135, uint8) and rgb.bin (160x90x3, uint8), plus meta.json.
"""
import json, subprocess, sys, pathlib
import numpy as np

video, outdir = sys.argv[1], pathlib.Path(sys.argv[2])
W, H = 240, 135
cmd = ["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, bufsize=10**8)
n = 0
fg = open(outdir / "gray.bin", "wb")
frc = open(outdir / "rgb.bin", "wb")
sz = W * H * 3
while True:
    b = p.stdout.read(sz)
    if len(b) < sz:
        break
    a = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.float32)
    g = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]).round().astype(np.uint8)
    fg.write(g.tobytes())
    # 1.5x box downsample to 160x90 by taking the mean of a 2x-sampled nearest grid
    ys = (np.arange(90) * 1.5).astype(int)
    xs = (np.arange(160) * 1.5).astype(int)
    frc.write(a[ys][:, xs].astype(np.uint8).tobytes())
    n += 1
json.dump({"frames": n, "gray": [H, W], "rgb": [90, 160, 3], "fps": 24}, open(outdir / "meta.json", "w"))
print("frames", n)
