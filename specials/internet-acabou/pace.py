"""Marks which script shots are long enough to need a second angle (splits.json), from an unsplit plan.
Order: write {} to splits.json, run gen.py and `make_film.py internet-acabou --check`, run this, run gen.py again.
Dark data shots are allowed to run longer: too many of them in a row would not rotate the picture."""
import csv
import json
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
film = json.loads((HERE / "film.json").read_text(encoding="utf-8"))
rows = list(csv.DictReader(open(ROOT / "out/film/internet-acabou/timeline.csv", encoding="utf-8")))
keys = []
for item in film["script"]:
    for j, s in enumerate(item["shots"]):
        keys.append((None if "(pausa)" in s["action"] else f"{item['id']}:{j}", s["kind"]))
assert len(keys) == len(rows), (len(keys), len(rows))
splits = {}
for (k, kind), r in zip(keys, rows):
    secs = float(r["seconds"])
    limit = 5.0 if kind == "data" else 3.7
    if k and secs > limit:
        splits[k] = max(1, int(secs // limit))
(HERE / "splits.json").write_text(json.dumps(splits, indent=0), encoding="utf-8")
print(len(splits), "shots split,", sum(splits.values()), "added; total was", len(rows))
