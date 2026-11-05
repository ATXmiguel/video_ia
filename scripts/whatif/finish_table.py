"""Add a by-eye shot type to the measured table and write docs/whatif/shots.csv. usage: finish_table.py <raw.csv> <out.csv>

Types, read from the first, middle and last frame of each shot:
W wide side-on | M medium side-on | C close-up | O over-shoulder or POV with a blurred background | T top-down table with
hands or objects | P top-down map of a place | I object or environment insert | U full-screen phone, list or form |
K dark data scene | D line-art diagram | S held torn split-screen | X text or title on dark | L terminal text
"""
import csv, sys

TYPES_BY_START = [
    (0, "T"), (113, "T"), (143, "T"), (180, "W"), (208, "T"), (233, "W"), (275, "O"), (300, "W"), (338, "C"), (397, "X"), (454, "K"),
    (771, "W"), (795, "C"), (807, "M"), (841, "C"), (895, "C"), (926, "T"), (960, "W"), (995, "T"), (1010, "W"), (1040, "M"), (1087, "S"),
    (1347, "W"), (1428, "T"), (1501, "C"), (1569, "M"), (1601, "W"), (1644, "C"), (1684, "D"), (1773, "D"), (1905, "D"), (1993, "W"), (2040, "W"),
    (2100, "M"), (2177, "S"), (2208, "W"), (2272, "I"), (2380, "W"), (2434, "I"), (2488, "W"), (2526, "M"), (2572, "C"), (2615, "M"), (2650, "W"), (2721, "W"),
    (2778, "W"), (2824, "W"), (2889, "S"), (2919, "P"), (3085, "W"), (3185, "W"), (3249, "W"), (3314, "W"), (3428, "W"), (3470, "W"), (3518, "W"),
    (3594, "C"), (3704, "S"), (3732, "W"), (3808, "W"), (3830, "O"), (3866, "C"), (3904, "C"), (3927, "W"), (3952, "W"), (4029, "I"), (4058, "I"), (4115, "W"),
    (4182, "C"), (4238, "W"), (4298, "C"), (4328, "S"), (4356, "I"), (4395, "W"), (4439, "C"), (4457, "W"), (4484, "K"), (4580, "C"), (4628, "W"),
    (4690, "W"), (4722, "W"), (4792, "C"), (4835, "W"), (4922, "S"), (4950, "W"), (4986, "U"), (5061, "C"), (5080, "I"), (5128, "U"), (5175, "U"), (5195, "U"),
    (5218, "U"), (5260, "P"), (5358, "W"), (5440, "C"), (5502, "C"), (5548, "C"), (5628, "I"), (5792, "M"), (5884, "W"), (5942, "C"), (5968, "I"), (6041, "W"),
    (6084, "W"), (6125, "W"), (6163, "T"), (6279, "W"), (6292, "T"), (6307, "W"), (6359, "M"), (6384, "T"), (6407, "C"), (6435, "T"), (6502, "O"), (6546, "W"),
    (6602, "O"), (6650, "C"), (6674, "W"), (6696, "C"), (6754, "W"), (6807, "C"), (6859, "W"), (6907, "W"), (6928, "T"), (6954, "S"), (7012, "W"), (7033, "C"),
    (7098, "C"), (7199, "C"), (7260, "T"), (7365, "C"), (7396, "W"), (7486, "T"), (7596, "W"), (7656, "I"), (7719, "W"), (7795, "W"), (7853, "C"), (7890, "T"),
    (7937, "M"), (7966, "C"), (8082, "C"), (8106, "T"), (8148, "W"), (8199, "C"), (8285, "W"), (8441, "T"), (8477, "C"), (8602, "O"), (8656, "U"), (8685, "W"),
    (8698, "T"), (8720, "I"), (8765, "I"), (8784, "K"), (8905, "T"), (8934, "K"), (9024, "U"), (9150, "U"), (9273, "U"), (9354, "I"), (9383, "W"), (9451, "C"),
    (9533, "C"), (9641, "C"), (9670, "W"), (9711, "I"), (9736, "C"), (9797, "C"), (9852, "K"), (9921, "K"), (9973, "K"), (10011, "U"), (10030, "W"), (10053, "K"),
    (10151, "T"), (10176, "W"), (10209, "X"), (10229, "W"), (10253, "W"), (10276, "U"), (10299, "T"), (10313, "C"), (10332, "C"), (10386, "C"), (10440, "C"),
    (10474, "C"), (10487, "C"), (10524, "W"), (10546, "T"), (10566, "W"), (10591, "C"), (10623, "W"), (10680, "T"), (10725, "C"), (10739, "T"), (10766, "I"),
    (10791, "C"), (10820, "W"), (10846, "W"), (10926, "W"), (10960, "U"), (11015, "P"), (11099, "M"), (11123, "T"), (11151, "T"), (11166, "M"), (11205, "I"),
    (11230, "I"), (11260, "C"), (11301, "W"), (11406, "T"), (11522, "T"), (11538, "C"), (11555, "D"), (11657, "C"), (11735, "W"), (11801, "W"), (11870, "W"), (11919, "W"),
    (11940, "C"), (11967, "W"), (12001, "L"), (12053, "C"), (12070, "L"), (12127, "L"), (12213, "C"), (12229, "L"), (12236, "L"), (12259, "L"), (12360, "W"), (12426, "I"),
    (12456, "C"), (12532, "W"), (12544, "T"), (12580, "X"),
]

R = list(csv.DictReader(open(sys.argv[1])))
T = sorted(TYPES_BY_START)
def kind(a):
    k = "?"
    for s, t in T:
        if s <= a:
            k = t
        else:
            break
    return k

cols = list(R[0].keys())
i = cols.index("transition_in") + 1
cols = cols[:i] + ["type"] + cols[i:]
exact = {s for s, _ in T}
miss = 0
for r in R:
    a = int(r["start_frame"])
    r["type"] = kind(a)
    if a not in exact:
        miss += 1
with open(sys.argv[2], "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(R)
print("shots", len(R), "shots typed by the entry before them (no exact start):", miss)
from collections import Counter
c = Counter(r["type"] for r in R)
secs = Counter()
for r in R:
    secs[r["type"]] += float(r["dur_s"])
print({k: (c[k], round(secs[k], 1)) for k in sorted(c)})
print(Counter(r["transition_in"] for r in R))
