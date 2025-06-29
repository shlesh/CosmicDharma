#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${CYAN}🚀 Cosmic Dharma Quick Start${RESET}\n"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${RESET}"
    exit 1
fi

# Check Python
if ! command -v python3 >/dev/null 2>&1; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.11+${RESET}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${RESET}"
npm install --legacy-peer-deps

# Setup Python environment
echo -e "${YELLOW}🐍 Setting up Python environment...${RESET}"
cd backend
if [ ! -d venv ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt -r requirements-dev.txt

# Copy env files if they don't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created backend/.env - please configure it${RESET}"
fi
cd ..

if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
fi

# Seed database
echo -e "${YELLOW}🌱 Seeding database...${RESET}"
cd backend
source venv/bin/activate
PYTHONPATH=. python seed_demo.py
cd ..

# Check Redis
echo -e "${YELLOW}🔍 Checking Redis...${RESET}"
if ! redis-cli ping >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Redis not running. Starting with Docker...${RESET}"
    if command -v docker >/dev/null 2>&1; then
        docker run -d --name cosmic-redis -p 6379:6379 redis:7-alpine 2>/dev/null || true
    else
        echo -e "${RED}❌ Redis not available. Background jobs will be disabled.${RESET}"
    fi
fi

# Start services
echo -e "\n${GREEN}✅ Setup complete!${RESET}"
echo -e "\n${CYAN}Starting services...${RESET}"
echo -e "${GREEN}Frontend: http://localhost:3000${RESET}"
echo -e "${GREEN}Backend:  http://localhost:8000${RESET}"
echo -e "${GREEN}API Docs: http://localhost:8000/docs${RESET}\n"

# Run the application
npm run dev