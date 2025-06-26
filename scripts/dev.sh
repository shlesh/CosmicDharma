#!/usr/bin/env bash
set -euo pipefail

# Move to the repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Verify required commands are available
for cmd in node npm python3; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: $cmd is not installed or not in PATH." >&2
    exit 1
  fi
done

# Require Node.js >=18
NODE_MAJOR=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node.js 18 or newer is required. Found $(node -v)." >&2
  exit 1
fi

# Install Node.js dependencies
if [ ! -d node_modules ]; then
  npm install --legacy-peer-deps
fi

# Set up Python virtual environment
if [ ! -d backend/venv ]; then
  python3 -m venv backend/venv
fi
source backend/venv/bin/activate
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt

# Test connectivity to Redis before starting services
REDIS_URL="redis://localhost:6379"
if [ -f backend/.env ]; then
  val=$(grep -E '^REDIS_URL=' backend/.env | cut -d '=' -f2- | tr -d '\r')
  if [ -z "$val" ]; then
    val=$(grep -E '^CACHE_URL=' backend/.env | cut -d '=' -f2- | tr -d '\r')
  fi
  if [ -n "$val" ]; then
    REDIS_URL="$val"
  fi
fi
if ! REDIS_TEST_URL="$REDIS_URL" python - <<'EOF'
import os, redis, sys
url = os.environ.get("REDIS_TEST_URL")
try:
    redis.from_url(url, socket_connect_timeout=1).ping()
except Exception:
    sys.exit(1)
EOF
then
  echo "Redis is not running—start it with 'docker compose up -d redis'." >&2
  exit 1
fi

# Deactivate the virtual environment on exit
trap deactivate EXIT

# Start Next.js, FastAPI and the background worker
npx concurrently --kill-others-on-fail "npm run dev" "npm run worker"
