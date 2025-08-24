#!/usr/bin/env bash
set -euo pipefail

# Go to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Activate venv if present
if [[ -d "venv" ]]; then source venv/bin/activate; fi

# Run FastAPI
exec python -m uvicorn main:app --reload --host 0.0.0.0 --port "${BACKEND_PORT:-8000}"
