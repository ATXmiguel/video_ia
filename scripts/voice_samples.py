"""Speak the same excerpt with several free edge-tts voices and check each by transcription, for choosing by ear.
usage: python3 scripts/voice_samples.py <out_dir>"""
import asyncio
import subprocess
import sys
from pathlib import Path

import edge_tts
import numpy as np
from faster_whisper import WhisperModel

TEXT = (
    "São nove e catorze da manhã. Você manda uma mensagem. Um risquinho. Só um. "
    "Você desliga o wi-fi e liga de novo. Nada. "
    "E se, de repente, a internet acabasse? Não no seu bairro. No mundo inteiro. Tudo de uma vez. "
    "Em dezembro de 2025, o Brasil fez trezentos e treze milhões de Pix num único dia. "
    "A dona Neide não fecha. Ela abre um caderno."
)
out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)


async def main():
    voices = await edge_tts.list_voices()
    names = [v["ShortName"] for v in voices if v["Locale"] == "pt-BR" or "Multilingual" in v["ShortName"]]
    print(len(voices), "voices;", "candidates:", names)
    model = WhisperModel("small", device="cpu", compute_type="int8")
    for name in names:
        dest = out / f"{name}.mp3"
        try:
            await edge_tts.Communicate(TEXT, name, rate="+0%").save(str(dest))
        except Exception as e:
            print(name, "FAILED", e)
            continue
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(dest), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
        segs, info = model.transcribe(np.frombuffer(pcm, np.float32), beam_size=1)
        heard = " ".join(s.text for s in segs).strip()
        print(f"{name} | {len(pcm) / 4 / 16000:.1f}s | lang {info.language} {info.language_probability:.2f} | {heard[:150]}")


asyncio.run(main())
