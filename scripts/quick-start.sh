#!/bin/bash
# Simple startup script without the complex script.sh

set -e

echo "🚀 Starting Cosmic Dharma"
echo "=========================="

# Get the directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

# Check requirements
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found"  
    exit 1
fi

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install --legacy-peer-deps
fi

# Setup Python environment if needed
if [ ! -d "backend/venv" ]; then
    echo "🐍 Setting up Python environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Set ports
export PORT=${PORT:-3000}
export BACKEND_PORT=${BACKEND_PORT:-8000}

echo ""
echo "📍 Frontend: http://localhost:$PORT"
echo "📍 Backend:  http://localhost:$BACKEND_PORT"
echo "📍 API Docs: http://localhost:$BACKEND_PORT/docs"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "uvicorn main:app" 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM

# Start backend
echo "🔧 Starting backend..."
cd backend
source venv/bin/activate
PYTHONPATH=. python -m uvicorn main:app --reload --host 0.0.0.0 --port $BACKEND_PORT &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
PORT=$PORT npm run dev:frontend &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "   Frontend PID: $FRONTEND_PID"
echo "   Backend PID: $BACKEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
