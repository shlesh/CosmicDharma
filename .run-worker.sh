#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

if [[ -d "venv" ]]; then source venv/bin/activate; fi

# Start RQ worker for the "profiles" queue
exec python -m rq.cli worker profiles --url "${REDIS_URL:-redis://localhost:6379/0}"
