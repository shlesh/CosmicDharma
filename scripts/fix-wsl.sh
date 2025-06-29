#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Fixing WSL Setup for Cosmic Dharma..."

# Update system first
echo "📦 Updating system packages..."
sudo apt update

# Fix Node.js installation
echo "🟢 Installing Node.js properly..."
# Remove any broken Node installations
sudo apt remove -y nodejs npm || true

# Install Node.js via NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Verifying Node.js installation..."
node_version=$(node --version)
npm_version=$(npm --version)
echo "Node.js: $node_version"
echo "npm: $npm_version"

# Fix Python pip access
echo "🐍 Setting up Python pip..."
# Install pip if not available
sudo apt install -y python3-pip

# Create symbolic links for easier access
sudo ln -sf /usr/bin/python3 /usr/bin/python || true

# Fix file permissions and create missing environment file
echo "📁 Setting up project files..."
cd /mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma

# Create missing .env.local
if [ ! -f .env.local ] && [ -f .env.local.example ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local from example"
fi

# Install Redis (optional but recommended)
echo "📡 Installing Redis..."
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install additional useful tools
echo "🛠️ Installing additional tools..."
sudo apt install -y build-essential lsof curl wget

# Test installations
echo "🧪 Testing installations..."
echo "Node.js test:"
node -e "console.log('✅ Node.js is working!')"

echo "Python test:"
python3 -c "print('✅ Python is working!')"

echo "pip test:"
python3 -m pip --version && echo "✅ pip is working!"

echo "Redis test:"
redis-cli ping && echo "✅ Redis is working!" || echo "⚠️ Redis may need manual start"

echo ""
echo "🎉 Setup complete! You can now run your development scripts."
echo ""
echo "💡 Quick start commands:"
echo "   cd /mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma"
echo "   ./scripts/dev.sh"
echo ""