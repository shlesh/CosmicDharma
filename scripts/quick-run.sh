#!/bin/bash
# Quick run script for development - assumes setup is already done

set -e

echo "🚀 Starting Cosmic Dharma (Quick Mode)"
echo ""

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Virtual environment not found. Run ./scripts/script.sh first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules not found. Run ./scripts/script.sh first."
    exit 1
fi

# Export ports
export PORT=${PORT:-3000}
export BACKEND_PORT=${BACKEND_PORT:-8000}

echo "📍 Frontend: http://localhost:${PORT}"
echo "📍 Backend:  http://localhost:${BACKEND_PORT}"
echo "📍 API Docs: http://localhost:${BACKEND_PORT}/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Run all services
npx concurrently \
    --names "Frontend,Backend" \
    --prefix-colors "cyan,magenta" \
    --prefix "[{name}]" \
    --kill-others-on-fail \
    "npm run dev:frontend" \
    "cd backend && venv/bin/python run_server.py"