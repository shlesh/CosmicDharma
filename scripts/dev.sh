#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# COSMIC DHARMA - QUICK DEV SCRIPT
# ==========================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Navigate to repo root
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo -e "${CYAN}🚀 Starting Cosmic Dharma (Quick Mode)...${RESET}\n"

# Quick checks
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}Installing Node dependencies...${RESET}"
    npm install --legacy-peer-deps --silent
fi

if [ ! -d backend/venv ]; then
    echo -e "${YELLOW}Creating Python environment...${RESET}"
    python3 -m venv backend/venv
fi

# Activate Python env
source backend/venv/bin/activate

# Check if pip packages are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Installing Python packages...${RESET}"
    pip install -q -r backend/requirements.txt -r backend/requirements-dev.txt
fi

# Ensure .env files exist
[ ! -f backend/.env ] && [ -f backend/.env.example ] && cp backend/.env.example backend/.env
[ ! -f .env.local ] && [ -f .env.local.example ] && cp .env.local.example .env.local

# Check Redis
if python -c "import redis; redis.from_url('redis://localhost:6379').ping()" 2>/dev/null; then
    WORKER="\" \"npm run worker"
else
    echo -e "${YELLOW}Redis not available - worker disabled${RESET}"
    WORKER=""
fi

# Start services
echo -e "\n${GREEN}Frontend: http://localhost:3000${RESET}"
echo -e "${GREEN}Backend:  http://localhost:8000${RESET}\n"

eval "npx concurrently \
    --names 'Next,FastAPI${WORKER:+,Worker}' \
    --prefix-colors 'cyan,magenta${WORKER:+,yellow}' \
    \"npm run dev${WORKER}\""