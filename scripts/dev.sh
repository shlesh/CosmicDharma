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

# Deactivate the virtual environment on exit
trap deactivate EXIT

# Start Next.js, FastAPI and the background worker
npx concurrently --kill-others-on-fail "npm run dev" "npm run worker"
