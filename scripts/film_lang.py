"""The small language for writing a Short's film.json by hand. A Short's gen.py imports this, adds lines with L() and S(), and calls write().

The stage stays 1920x1080, and a vertical frame shows only its middle: x from about 660 to 1260, all of y. Keep people and
text inside x 690-1230, and text inside y 90-830, because the Shorts interface covers the bottom of the screen.
"""
import json
from pathlib import Path

CAIO = {"torso": "#2e6f92", "sleeve": "#27607f", "legs": "#2b3138"}
LOOKS = {
    "caio": CAIO,
    "neide": {"torso": "#7a3f4a", "item": "bun", "legs": "#3f3540"},
    "bia": {"torso": "#4f9a8e", "sleeve": "#438679", "legs": "#3f7f75", "item": "bob"},
    "cliente": {"torso": "#a0782f", "item": "curls"},
    "gui": {"torso": "#5c6a6e", "item": "slick"},
    "guy2": {"torso": "#54605a"},
    "gal": {"torso": "#6f5a66", "item": "bun"},
    "gal2": {"torso": "#6a5f4c", "item": "bob"},
}
# The narrator is Thalita on free edge-tts, chosen by Miguel by ear on 2026-11-06. Pauses come from each line's `after`.
VOICES = {
    "narrator": ["pt-BR-ThalitaMultilingualNeural", "+4%", "+0Hz"],
    "neide": ["pt-BR-FranciscaNeural", "-6%", "-2Hz"],
    "bia": ["pt-BR-FranciscaNeural", "+0%", "+2Hz"],
    "cliente": ["pt-BR-FranciscaNeural", "+2%", "+0Hz"],
    "caio": ["pt-BR-AntonioNeural", "+2%", "+0Hz"],
    "gui": ["pt-BR-AntonioNeural", "-4%", "-3Hz"],
}
HELD = {"p": "phoneHeld", "x": 0, "y": 0}
SAD = dict(eyes="sad", brow="worry")
SCRIPT = []


def a(name, at=6, **k):
    return {"a": name, "at": at, **k}


def p(prop, x=960, y=540, **k):
    return {"p": prop, "x": x, "y": y, **k}


def mv(at, dur=8, **k):
    return {"at": at, "dur": dur, **k}


def fx(s, at=0, v=0.4, length=None):
    d = {"s": s, "at": at, "v": v}
    if length:
        d["len"] = length
    return d


def who(name, x=None, acts=None, face=None, **k):
    c = {"who": name}
    if x is not None:
        c["x"] = x
    if acts:
        c["acts"] = acts
    if face:
        c["face"] = face
    c.update(k)
    return c


def F(eyes="dot", mouth="flat", brow=None, look=None, lookY=None):
    d = {"eyes": eyes, "mouth": mouth}
    if brow:
        d["brow"] = brow
    if look is not None:
        d["look"] = look
    if lookY is not None:
        d["lookY"] = lookY
    return d


def shot(kind, action, set_=None, cast=None, props=None, **k):
    s = {"kind": kind, "action": action}
    if set_:
        s["set"] = set_
    if cast:
        s["cast"] = cast
    if props:
        s["props"] = props
    s.update(k)
    return s


def W(action, set_, cast=None, props=None, **k):
    return shot("wide", action, set_, cast, props, **k)


def M(action, set_, cast=None, props=None, **k):
    return shot("medium", action, set_, cast, props, **k)


def C(action, set_, cast=None, props=None, **k):
    return shot("close", action, set_, cast, props, **k)


def T(action, props, **k):
    return shot("top", action, None, None, props, **k)


def I(action, set_, props, **k):
    return shot("insert", action, set_, None, props, **k)


def D(action, props, **k):
    return shot("data", action, None, None, props, **k)


def big(text, y=480, w=110, t2=None, c=None, x=960):
    """Big words on the dark. About 11 characters fit at w=110: break longer lines into two big() calls."""
    d = p("big", x, y + 18, text=text, w=w, moves=[mv(0, 10, y=y)])
    if t2:
        d["t2"] = t2
    if c:
        d["c"] = c
    return d


def counter(to, label=None, x=960, y=460, dec=0, pre="", suf="", w=560, n=26, c=None):
    d = p("counter", x, y, h=to, n=n, m=dec, t3=pre, t4=suf, w=w, moves=[mv(0, 6, y=y - 4)])
    if label:
        d["t2"] = label
    if c:
        d["c"] = c
    return d


def phone(screen, x=960, y=500, s=1.0, t2=None, t3=None, n=None, r=0, shake=False, t4=None):
    d = p("phone", x, y, s=s, r=r, text=screen)
    for key, value in (("t2", t2), ("t3", t3), ("t4", t4), ("n", n)):
        if value is not None:
            d[key] = value
    d["moves"] = [mv(0, 10, y=y - 14)] if not shake else [mv(4, 3, x=x - 12), mv(7, 3, x=x + 12), mv(10, 3, x=x - 8), mv(13, 3, x=x)]
    return d


def hand(x=1180, y=900, r=-18, to=None, c="#2e6f92", s=1.0, curl=None, point=True):
    d = p("hand", x, y, r=r, s=s, c=c, point=point)
    if curl:
        d["curl"] = curl
        d["point"] = False
    d["moves"] = [mv(4, 8, **(to or {"x": x - 90, "y": y - 110}))]
    return d


def L(id_, text, shots, who_="narrator", after=None):
    item = {"id": id_, "who": who_, "text": text, "shots": shots}
    if after is not None:
        item["after"] = after
    SCRIPT.append(item)


def S(id_, secs, shots):
    SCRIPT.append({"id": id_, "silence": secs, "shots": shots})


def write(path, title, sections, **extra):
    """Write film.json next to the gen.py at `path`. `sections` is the bed: item id -> [chord in Hz, level in dB]."""
    film = {
        "title": title,
        "format": "short",
        "lead": 0.2,
        "tail": 0.5,
        "fade": 12,
        "bedVolume": 0.72,
        "roomVolume": 0.05,
        "sections": sections,
        "looks": LOOKS,
        "voices": VOICES,
        "script": SCRIPT,
        **extra,
    }
    Path(path).parent.joinpath("film.json").write_text(json.dumps(film, ensure_ascii=False, indent=0), encoding="utf-8")
    words = sum(len(i.get("text", "").split()) for i in SCRIPT)
    print(f"{sum(len(i['shots']) for i in SCRIPT)} shots, {words} words, {len(SCRIPT)} items")
