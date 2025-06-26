#!/usr/bin/env bash
set -e

# Move to repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Install Node.js dependencies
if [ ! -d node_modules ]; then
  npm install --legacy-peer-deps
fi

# Set up Python virtual environment
if [ ! -d backend/venv ]; then
  python3 -m venv backend/venv
  source backend/venv/bin/activate
  pip install -r backend/requirements.txt
  pip install -r backend/requirements-dev.txt
else
  source backend/venv/bin/activate
fi

# Start Next.js, FastAPI and the background worker
npx concurrently "npm run dev" "npm run worker"
