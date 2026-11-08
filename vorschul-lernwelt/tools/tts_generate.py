#!/usr/bin/env python3
"""Erzeugt Sprachaufnahmen mit Kyutai Pocket TTS (CC-BY-4.0 Gewichte, MIT-Code).

Aufruf:
  python tools/tts_generate.py --jobs jobs.json --voice juergen [--language german]
jobs.json: [["Text", "pfad/zur/datei.wav"], ...]  (vorhandene Dateien werden übersprungen)
"""
import argparse, json, os, sys, time
import numpy as np
import torch
import soundfile as sf
from pocket_tts.models.tts_model import TTSModel
from pocket_tts.utils.utils import get_predefined_voice

p = argparse.ArgumentParser()
p.add_argument('--jobs', required=True)
p.add_argument('--voice', default='juergen')
p.add_argument('--language', default='german')
p.add_argument('--temperature', type=float, default=None)
p.add_argument('--shard', default='0/1')
p.add_argument('--reverse', action='store_true', help='von hinten abarbeiten (zweiter Prozess auf demselben Shard)')
a = p.parse_args()
torch.set_num_threads(int(os.environ.get('TTS_THREADS', '2')))
kw = {'language': a.language}
if a.temperature is not None: kw['temp'] = a.temperature
model = TTSModel.load_model(**kw)
state = model.get_state_for_audio_prompt(a.voice)
sr = model.config.mimi.sample_rate
jobs = json.load(open(a.jobs))
k, n = map(int, a.shard.split('/'))
jobs = [j for i, j in enumerate(jobs) if i % n == k]
if a.reverse: jobs.reverse()
t0 = time.time(); done = 0; secs = 0.0
for text, out in jobs:
    if os.path.exists(out): continue
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    chunks = [c.detach().cpu().numpy().reshape(-1) for c in model.generate_audio_stream(model_state=state, text_to_generate=text)]
    audio = np.concatenate(chunks) if chunks else np.zeros(1, dtype=np.float32)
    sf.write(out + '.tmp.wav', audio, sr)
    os.replace(out + '.tmp.wav', out)
    done += 1; secs += len(audio) / sr
    if done % 25 == 0:
        el = time.time() - t0
        print(f'[{a.shard}] {done}/{len(jobs)}  {secs/el:.2f}x Echtzeit', flush=True)
print(f'[{a.shard}] fertig: {done} Dateien, {secs:.0f}s Audio in {time.time()-t0:.0f}s', flush=True)
