#!/usr/bin/env bash
# Launcher Arc Wallet Checker — jalankan server lokal + buka browser otomatis.
cd "$(dirname "$0")" || exit 1
PORT="${1:-8000}"
URL="http://localhost:$PORT"

echo "============================================"
echo "  Arc Wallet Checker"
echo "  Buka di browser: $URL"
echo "  (Ctrl+C untuk berhenti)"
echo "============================================"

# Coba buka browser otomatis (WSL/Windows/Linux/Mac)
( sleep 1
  explorer.exe "$URL" 2>/dev/null \
  || cmd.exe /c start "" "$URL" 2>/dev/null \
  || xdg-open "$URL" 2>/dev/null \
  || open "$URL" 2>/dev/null
) &

exec python3 -m http.server "$PORT" --bind 0.0.0.0
