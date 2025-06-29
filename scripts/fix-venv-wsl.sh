#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Fixing Python Virtual Environment in WSL..."

# Install all required Python components
echo "📦 Installing Python components..."
sudo apt update
sudo apt install -y python3-full python3-venv python3-pip python3-setuptools python3-distutils

# Test if venv works in home directory
echo "🧪 Testing virtual environment creation..."
cd ~
if python3 -m venv test_venv; then
    echo "✅ Virtual environment works in home directory"
    rm -rf test_venv
    
    # Copy project to WSL filesystem for better compatibility
    echo "📁 Copying project to WSL filesystem for better performance..."
    if [ ! -d ~/CosmicDharma ]; then
        cp -r /mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma ~/CosmicDharma
        echo "✅ Project copied to ~/CosmicDharma"
    else
        echo "ℹ️ Project already exists in ~/CosmicDharma"
    fi
    
    # Set up virtual environment in WSL location
    cd ~/CosmicDharma/backend
    echo "🏗️ Creating virtual environment..."
    python3 -m venv venv
    
    echo "⚡ Activating virtual environment..."
    source venv/bin/activate
    
    echo "⬆️ Upgrading pip..."
    pip install --upgrade pip
    
    echo "📚 Installing requirements..."
    pip install -r requirements.txt -r requirements-dev.txt
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "🏃 To run your project:"
    echo "   cd ~/CosmicDharma"
    echo "   ./scripts/dev.sh"
    echo ""
    echo "📁 Your project is now in: ~/CosmicDharma"
    echo "🌟 This location provides better performance and compatibility in WSL"
    
else
    echo "❌ Virtual environment creation failed in home directory"
    echo "🔄 Trying alternative method..."
    
    # Try the original location with manual pip installation
    cd /mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma/backend
    
    echo "🏗️ Creating virtual environment without pip..."
    python3 -m venv --without-pip venv
    
    echo "⚡ Activating virtual environment..."
    source venv/bin/activate
    
    echo "📥 Installing pip manually..."
    curl -s https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python get-pip.py
    rm get-pip.py
    
    echo "📚 Installing requirements..."
    pip install -r requirements.txt -r requirements-dev.txt
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "🏃 To run your project:"
    echo "   cd /mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma"
    echo "   ./scripts/dev.sh"
fi