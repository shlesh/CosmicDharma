#!/usr/bin/env bash
set -euo pipefail

# Colors
RED="$(tput setaf 1)"
GREEN="$(tput setaf 2)"
YELLOW="$(tput setaf 3)"
BLUE="$(tput setaf 4)"
RESET="$(tput sgr0)"

# ASCII banner
echo -e "${BLUE}\\n" \
" ____            _       _     _     " \
"\\n|  _ \\ ___  ___| |_ ___| |__ (_)_ __" \
"\\n| |_) / _ \\/ __| __/ __| '_ \\| | '_ \\" \
"\\n|  __/ (_) \\__ \\ || (__| | | | | |_) |" \
"\\n|_|   \\___/|___/\\__\\___|_| |_|_| .__/" \
"\\n                                   |_|" \
"\\n${RESET}"

# Move to the repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Ensure backend/.env exists, copying from the example if available
if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  cp backend/.env.example backend/.env
  echo "${YELLOW}Created backend/.env from backend/.env.example. Please adjust the values as needed.${RESET}"
fi

echo -e "${BLUE}\nBootstrapping development environment...${RESET}"

# Verify required commands are available
for cmd in node npm python3; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: $cmd is not installed or not in PATH." >&2
    exit 1
  fi
done

# Display versions and verify minimum requirements
NODE_VERSION="$(node -v)"
NODE_MAJOR="$(echo "$NODE_VERSION" | sed -E 's/^v([0-9]+).*/\1/')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "${RED}Error: Node.js 18 or newer is required. Found $NODE_VERSION.${RESET}" >&2
  exit 1
else
  echo -e "Node version: ${GREEN}$NODE_VERSION${RESET}"
fi

PY_VERSION="$(python3 -V | awk '{print $2}')"
PY_MAJOR="$(echo "$PY_VERSION" | cut -d. -f1)"
PY_MINOR="$(echo "$PY_VERSION" | cut -d. -f2)"
if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 11 ]; }; then
  echo "${RED}Error: Python 3.11 or newer is required. Found $PY_VERSION.${RESET}" >&2
  exit 1
else
  echo -e "Python version: ${GREEN}$PY_VERSION${RESET}"
fi

# Install Node.js dependencies
if [ ! -d node_modules ]; then
  echo "${YELLOW}Installing Node packages...${RESET}"
  npm install --legacy-peer-deps --silent --no-audit --no-fund
fi

# Set up Python virtual environment
if [ ! -d backend/venv ]; then
  echo "${YELLOW}Creating Python virtual environment...${RESET}"
  python3 -m venv backend/venv
  source backend/venv/bin/activate
  echo "${YELLOW}Installing Python packages...${RESET}"
  pip install --quiet -r backend/requirements.txt -r backend/requirements-dev.txt
else
  source backend/venv/bin/activate
fi

# Run tests before starting services
echo "${BLUE}Running tests...${RESET}"
npm run test:all || { echo "${RED}Tests failed. Aborting.${RESET}" >&2; exit 1; }

# Assume the worker should run unless Redis is unavailable
RUN_WORKER=1

# Test connectivity to Redis before starting services. If Redis isn't running,
# attempt to start it automatically. Docker Compose is preferred and the script
# falls back to a daemonized `redis-server` when available. One of these tools
# must be installed for the automatic startup to succeed. Any `redis-server`
# process started by this script will be cleaned up on exit.
REDIS_URL="redis://localhost:6379"
if [ -f backend/.env ]; then
  val=$(grep -E '^REDIS_URL=' backend/.env | cut -d '=' -f2- | tr -d '\r' || true)
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

DOCKER_COMPOSE_CMD=""
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
  fi
fi

echo "Checking Redis availability..."

if ! check_redis "$REDIS_URL"; then
  echo "Redis is not running; attempting to start via Docker Compose..." >&2
  if [ -n "$DOCKER_COMPOSE_CMD" ]; then
    $DOCKER_COMPOSE_CMD up -d redis
    for _ in {1..5}; do
      sleep 1
      if check_redis "$REDIS_URL"; then
        REDIS_STARTED=compose
        break
      fi
    done
    if [ "${REDIS_STARTED:-}" != compose ]; then
      echo "Redis did not start via Docker Compose." >&2
      RUN_WORKER=0
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
        RUN_WORKER=0
      fi
    else
      echo "Warning: Redis is not running and neither Docker Compose nor redis-server was found." >&2
      echo "Start Redis manually (e.g., 'docker compose up -d redis' or 'docker-compose up -d redis') to enable the worker." >&2
      RUN_WORKER=0
    fi
  fi
else
  echo "Redis is running."
fi

# Deactivate the virtual environment on exit and stop any redis-server we
# started.
cleanup() {
  if [ "${REDIS_STARTED:-}" = server ] && [ -f "$REDIS_PIDFILE" ]; then
    kill "$(cat "$REDIS_PIDFILE")" 2>/dev/null || true
    rm -f "$REDIS_PIDFILE"
  elif [ "${REDIS_STARTED:-}" = compose ] && [ -n "$DOCKER_COMPOSE_CMD" ]; then
    $DOCKER_COMPOSE_CMD stop redis >/dev/null
  fi
  deactivate
}
trap cleanup EXIT

# Start Next.js and the FastAPI backend. Launch the background worker only if
# Redis is available.
echo -e "${BLUE}Starting application...${RESET}"
if [ "$RUN_WORKER" -eq 1 ]; then
  npx --yes concurrently --kill-others-on-fail "npm run dev" "npm run worker"
else
  npx --yes concurrently --kill-others-on-fail "npm run dev"
  echo "Background worker disabled due to missing Redis." >&2
fi
