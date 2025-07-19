#!/bin/bash

# Quick setup script for Cosmic Dharma

echo "🚀 Quick Setup for Cosmic Dharma"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install --legacy-peer-deps

# Set up Python virtual environment
echo "🐍 Setting up Python environment..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate and install dependencies
echo "Installing Python packages..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating backend/.env from example..."
    cp .env.example .env
    # Generate a secure secret key
    SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
    # Use sed to replace the secret key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/change-me/$SECRET_KEY/g" .env
    else
        # Linux
        sed -i "s/change-me/$SECRET_KEY/g" .env
    fi
fi

cd ..

# Create frontend .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
fi

echo "✅ Setup complete!"
echo ""
echo "To start the application, run:"
echo "  ./scripts/script.sh --skip-tests"
echo ""
echo "Or start services manually:"
echo "  npm run dev          # Frontend + Backend"
echo "  npm run worker       # Background worker (optional)"