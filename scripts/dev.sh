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

# Test connectivity to Redis before starting services. If Redis isn't running,
# attempt to start it with Docker Compose and wait a few seconds for it to
# accept connections. When Docker Compose is unavailable, fall back to
# `redis-server` (daemonized) and clean it up on exit.
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

check_redis() {
  REDIS_TEST_URL="$1" python - <<'EOF'
import os, redis, sys
url = os.environ.get("REDIS_TEST_URL")
try:
    redis.from_url(url, socket_connect_timeout=1).ping()
except Exception:
    sys.exit(1)
EOF
}

if ! check_redis "$REDIS_URL"; then
  echo "Redis is not running; attempting to start via Docker Compose..." >&2
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    docker compose up -d redis
    for _ in {1..5}; do
      sleep 1
      if check_redis "$REDIS_URL"; then
        REDIS_STARTED=compose
        break
      fi
    done
    if [ "${REDIS_STARTED:-}" != compose ]; then
      echo "Redis did not start via Docker Compose." >&2
      exit 1
    fi
  else
    if command -v redis-server >/dev/null 2>&1; then
      echo "Docker Compose unavailable; starting redis-server locally..." >&2
      REDIS_PIDFILE="$(mktemp)"
      redis-server --daemonize yes --pidfile "$REDIS_PIDFILE" >/dev/null
      for _ in {1..5}; do
        sleep 1
        if check_redis "$REDIS_URL"; then
          REDIS_STARTED=server
          break
        fi
      done
      if [ "${REDIS_STARTED:-}" != server ]; then
        echo "redis-server failed to start." >&2
        if [ -f "$REDIS_PIDFILE" ]; then
          kill "$(cat "$REDIS_PIDFILE")" 2>/dev/null || true
          rm -f "$REDIS_PIDFILE"
        fi
        exit 1
      fi
    else
      echo "Error: Redis is not running and Docker Compose is unavailable." >&2
      exit 1
    fi
  fi
fi

# Deactivate the virtual environment on exit and stop any redis-server we
# started.
cleanup() {
  if [ "${REDIS_STARTED:-}" = server ] && [ -f "$REDIS_PIDFILE" ]; then
    kill "$(cat "$REDIS_PIDFILE")" 2>/dev/null || true
    rm -f "$REDIS_PIDFILE"
  fi
  deactivate
}
trap cleanup EXIT

# Start Next.js, FastAPI and the background worker
npx concurrently --kill-others-on-fail "npm run dev" "npm run worker"
