#!/bin/bash
# Run the guide's measurements on a rendered film. Everything stays under out/, which git ignores.
# usage: scripts/whatif/measure_film.sh <film.mp4> <datadir> [words.json]
set -e
V="$1"; D="$2"; PY="${PYTHON:-python3}"; H="$(dirname "$0")"
mkdir -p "$D"
"$PY" "$H/decode_small.py" "$V" "$D"
ffmpeg -v error -y -i "$V" -vn -ac 2 -ar 24000 -f f32le "$D/audio_st.f32"
"$PY" "$H/detect_cuts.py" "$D"
"$PY" "$H/shot_table.py" "$D" "$D/shots_raw.csv"
"$PY" "$H/motion_bursts.py" "$D" "$D/shots_raw.csv" "$D/bursts.json"
"$PY" "$H/audio_stats.py" "$D/audio_st.f32" "$D/events.json" $3
ffmpeg -hide_banner -nostats -i "$V" -af ebur128=peak=true -f null - 2>&1 | tail -12
