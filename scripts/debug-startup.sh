#!/usr/bin/env bash
set -euo pipefail

echo "=== Cosmic Dharma Debug Script ==="
echo "Starting diagnostic checks..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Script directory: $SCRIPT_DIR"

# Navigate to repo root
cd "$(dirname "${BASH_SOURCE[0]}")/.."
REPO_ROOT="$(pwd)"
echo "Repository root: $REPO_ROOT"

# Check directory structure
echo -e "\n=== Directory Structure ==="
ls -la
echo -e "\n=== Backend Directory ==="
ls -la backend/ 2>/dev/null || echo "Backend directory not found"

# Check system requirements
echo -e "\n=== System Check ==="
echo "Node.js: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "npm: $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo "Python3: $(python3 --version 2>/dev/null || echo 'NOT FOUND')"
echo "pip3: $(python3 -m pip --version 2>/dev/null || echo 'NOT FOUND')"
echo "Git: $(git --version 2>/dev/null || echo 'NOT FOUND')"

# Check if package.json exists
echo -e "\n=== Package Files ==="
if [ -f "package.json" ]; then
    echo "✓ package.json found"
    echo "Node scripts available:"
    cat package.json | grep -A 10 '"scripts"' || echo "No scripts section found"
else
    echo "✗ package.json NOT found"
fi

if [ -f "backend/requirements.txt" ]; then
    echo "✓ backend/requirements.txt found"
else
    echo "✗ backend/requirements.txt NOT found"
fi

# Check environment files
echo -e "\n=== Environment Files ==="
[ -f "backend/.env.example" ] && echo "✓ backend/.env.example exists" || echo "✗ backend/.env.example missing"
[ -f "backend/.env" ] && echo "✓ backend/.env exists" || echo "✗ backend/.env missing"
[ -f ".env.local.example" ] && echo "✓ .env.local.example exists" || echo "✗ .env.local.example missing"
[ -f ".env.local" ] && echo "✓ .env.local exists" || echo "✗ .env.local missing"

# Check for node_modules
echo -e "\n=== Dependencies ==="
if [ -d "node_modules" ]; then
    echo "✓ node_modules directory exists"
else
    echo "✗ node_modules directory missing - need to run npm install"
fi

if [ -d "backend/venv" ]; then
    echo "✓ Python virtual environment exists"
else
    echo "✗ Python virtual environment missing"
fi

# Check ports
echo -e "\n=== Port Check ==="
if command -v lsof >/dev/null 2>&1; then
    echo "Port 3000: $(lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo 'OCCUPIED' || echo 'FREE')"
    echo "Port 8000: $(lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo 'OCCUPIED' || echo 'FREE')"
else
    echo "lsof not available - installing..."
    sudo apt-get update && sudo apt-get install -y lsof
fi

# Check Redis
echo -e "\n=== Redis Check ==="
if command -v redis-server >/dev/null 2>&1; then
    echo "✓ redis-server available"
else
    echo "✗ redis-server not available"
fi

if command -v docker >/dev/null 2>&1; then
    echo "✓ Docker available"
else
    echo "✗ Docker not available"
fi

echo -e "\n=== WSL Specific Checks ==="
echo "WSL Version: $(cat /proc/version | grep -i microsoft || echo 'Not WSL or WSL1')"
echo "Current user: $(whoami)"
echo "Home directory: $HOME"
echo "Working directory: $(pwd)"

# Test basic Python functionality
echo -e "\n=== Python Test ==="
python3 -c "print('Python is working')" 2>/dev/null && echo "✓ Python basic test passed" || echo "✗ Python basic test failed"

# Test basic Node functionality  
echo -e "\n=== Node Test ==="
node -e "console.log('Node is working')" 2>/dev/null && echo "✓ Node basic test passed" || echo "✗ Node basic test failed"

echo -e "\n=== Debug Complete ==="
echo "If you see any ✗ items above, those need to be fixed first."