#!/bin/bash
# Test script to verify Cosmic Dharma setup

set -e

echo "🧪 Testing Cosmic Dharma Setup"
echo "=============================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_item() {
    local name="$1"
    local command="$2"
    
    echo -n "Testing $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo "1. System Requirements"
echo "----------------------"
test_item "Node.js 18+" "[[ $(node --version | cut -d. -f1 | sed 's/v//') -ge 18 ]]"
test_item "npm" "command -v npm"
test_item "Python 3.9+" "python3 --version | grep -E '3\.(9|1[0-9])'"
test_item "Git" "command -v git"

echo ""
echo "2. Project Files"
echo "----------------"
test_item "package.json" "[[ -f package.json ]]"
test_item "backend/requirements.txt" "[[ -f backend/requirements.txt ]]"
test_item "Scripts executable" "[[ -x scripts/script.sh ]]"

echo ""
echo "3. Dependencies"
echo "---------------"
test_item "node_modules" "[[ -d node_modules ]]"
test_item "Python venv" "[[ -d backend/venv ]]"
test_item "concurrently" "[[ -f node_modules/.bin/concurrently ]]"

echo ""
echo "4. Configuration"
echo "----------------"
test_item "backend/.env" "[[ -f backend/.env ]]"
test_item ".env.local" "[[ -f .env.local ]]"
test_item "Secret key set" "grep -q 'SECRET_KEY=' backend/.env && ! grep -q 'change-me' backend/.env"

echo ""
echo "5. Python Environment"
echo "--------------------"
if [[ -f backend/venv/bin/python ]]; then
    test_item "FastAPI" "backend/venv/bin/python -c 'import fastapi'"
    test_item "SQLAlchemy" "backend/venv/bin/python -c 'import sqlalchemy'"
    test_item "SwissEph" "backend/venv/bin/python -c 'import swisseph'"
    test_item "Redis module" "backend/venv/bin/python -c 'import redis'"
else
    echo -e "${YELLOW}⚠ Python venv not found${NC}"
fi

echo ""
echo "6. Database"
echo "-----------"
test_item "SQLite DB exists" "[[ -f backend/app.db ]]"

echo ""
echo "7. Port Availability"
echo "-------------------"
test_item "Port 3000" "! lsof -ti:3000"
test_item "Port 8000" "! lsof -ti:8000"

echo ""
echo "8. NPM Scripts"
echo "--------------"
test_item "dev script" "grep -q '\"dev\":' package.json"
test_item "dev:frontend script" "grep -q '\"dev:frontend\":' package.json"
test_item "dev:backend script" "grep -q '\"dev:backend\":' package.json"

echo ""
echo "=============================="
echo "Results: ${GREEN}$TESTS_PASSED passed${NC}, ${RED}$TESTS_FAILED failed${NC}"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✅ All tests passed! Your setup is ready.${NC}"
    echo ""
    echo "You can now run:"
    echo "  npm run dev"
    echo "  ./scripts/quick-run.sh"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Run setup:${NC}"
    echo "  ./scripts/script.sh"
    echo ""
    echo "For specific issues, see TROUBLESHOOTING.md"
fi

exit $TESTS_FAILED