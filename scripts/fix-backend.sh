#!/bin/bash
# Script to fix backend import issues

set -e

echo "🔧 Fixing backend imports..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# Ensure backend __init__.py exists and is correct
cat > backend/__init__.py << 'EOF'
"""Backend package for Cosmic Dharma - Vedic Astrology Platform."""

__all__ = []
EOF

# Fix permissions
chmod +x backend/run_server.py
chmod +x scripts/*.sh

# Initialize database if needed
if [ -f "backend/venv/bin/python" ]; then
    echo "📊 Initializing database..."
    cd backend
    venv/bin/python -c "
import sys
sys.path.insert(0, '..')
from backend.db import Base, engine
from backend.models import User, BlogPost, Prompt, Report, PasswordResetToken
print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('✅ Database initialized')
" || echo "⚠️  Database initialization skipped (may already exist)"
    cd ..
fi

echo "✅ Backend fixes applied"
echo ""
echo "You can now run:"
echo "  npm run dev        # Run frontend and backend"
echo "  ./scripts/quick-run.sh  # Quick start"