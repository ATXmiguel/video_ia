"""Word-level transcript of a 16 kHz mono wav, as JSON (stays under out/). usage: transcribe_words.py <wav> <out.json>"""
import json, sys, wave
import numpy as np
from faster_whisper import WhisperModel
w = wave.open(sys.argv[1], "rb")
assert w.getframerate() == 16000 and w.getnchannels() == 1
audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
m = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=4)
segs, info = m.transcribe(audio, language="en", word_timestamps=True, vad_filter=False, beam_size=5)
out = []
for s in segs:
    out.append({"start": s.start, "end": s.end, "text": s.text.strip(),
                "words": [{"w": x.word.strip(), "s": round(x.start, 2), "e": round(x.end, 2)} for x in s.words]})
json.dump(out, open(sys.argv[2], "w"))
print(len(out), "segments")
