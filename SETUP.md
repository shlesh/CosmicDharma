# 🛠️ Cosmic Dharma - Detailed Setup Guide

## 📋 Table of Contents
- [System Requirements](#system-requirements)
- [Automated Setup](#automated-setup)
- [Manual Setup](#manual-setup)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Development Tips](#development-tips)

## System Requirements

### Minimum Requirements
- **OS**: Linux, macOS, or Windows 10+ with WSL2
- **RAM**: 4GB (8GB recommended)
- **Storage**: 2GB free space
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11.0 or higher
- **npm**: v8.0.0 or higher

### Installing Prerequisites

#### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install requirements
brew install node@18 python@3.11 redis git

# Install nvm for Node version management (optional)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### Ubuntu/Debian
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# Install other dependencies
sudo apt install -y redis-server git build-essential
```

#### Windows (WSL2)
```powershell
# Install WSL2 (in PowerShell as Admin)
wsl --install

# Inside WSL2 Ubuntu, follow Ubuntu instructions above
```

## Automated Setup

### 🚀 One-Command Installation

```bash
# Clone and setup
git clone https://github.com/your-username/cosmic-dharma.git
cd cosmic-dharma
./scripts/script.sh
```

### What the Script Does

1. **System Check** (Step 1/8)
   - Verifies OS compatibility
   - Checks all required commands
   - Validates version requirements

2. **Directory Setup** (Step 2/8)
   - Creates necessary directories
   - Copies environment templates
   - Sets up configuration files

3. **Node.js Setup** (Step 3/8)
   - Installs npm packages
   - Handles peer dependencies
   - Sets up build tools

4. **Python Setup** (Step 4/8)
   - Creates virtual environment
   - Upgrades pip
   - Installs all Python packages

5. **Redis Setup** (Step 5/8)
   - Checks for existing Redis
   - Attempts Docker startup
   - Falls back to local Redis
   - Configures connections

6. **Testing** (Step 6/8)
   - Runs frontend tests
   - Runs backend tests
   - Reports any failures

7. **Port Check** (Step 7/8)
   - Verifies port availability
   - Finds alternative ports if needed
   - Updates configuration

8. **Service Launch** (Step 8/8)
   - Starts all services
   - Shows access URLs
   - Monitors logs

## Manual Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/cosmic-dharma.git
cd cosmic-dharma
```

### Step 2: Frontend Setup
```bash
# Install Node dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.local.example .env.local
```

### Step 3: Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# OR
venv\Scripts\activate     # Windows

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Copy environment file
cp .env.example .env

# Return to root
cd ..
```

### Step 4: Database Setup
```bash
# The database will be created automatically on first run
# To seed with demo data:
PYTHONPATH=. python backend/seed_demo.py
```

### Step 5: Redis Setup (Optional)

#### Option A: Docker
```bash
docker run -d --name cosmic-redis -p 6379:6379 redis:7-alpine
```

#### Option B: Local Installation
```bash
# macOS
brew services start redis

# Ubuntu
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Step 6: Start Services
```bash
# Terminal 1: Frontend and Backend
npm run dev

# Terminal 2: Worker (if Redis is running)
npm run worker
```

## Configuration

### Essential Configuration

#### `backend/.env`
```env
# REQUIRED - Change this!
SECRET_KEY=your-secret-key-here-minimum-32-chars

# Database
DATABASE_URL=sqlite:///./app.db  # or postgresql://...

# Vedic Astrology Settings
AYANAMSA=lahiri         # Most common for Vedic
HOUSE_SYSTEM=whole_sign # Traditional Vedic
NODE_TYPE=mean         # Mean or true nodes
```

#### `.env.local`
```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Advanced Configuration

#### Production Database
```env
# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/cosmic_dharma

# MySQL
DATABASE_URL=mysql://user:pass@localhost:3306/cosmic_dharma
```

#### Email Configuration
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-app-specific-password
FROM_EMAIL=noreply@yourdomain.com
```

#### Redis Configuration
```env
# Separate Redis databases
REDIS_URL=redis://localhost:6379/0    # Job queue
CACHE_URL=redis://localhost:6379/1    # Cache
CACHE_TTL=3600                        # 1 hour
```

## Troubleshooting

### Common Issues

#### 1. "Command not found" Errors
```bash
# Check if command exists
which node python3 redis-cli

# Add to PATH if needed
export PATH="/usr/local/bin:$PATH"
```

#### 2. Permission Denied
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### 3. Port Already in Use
```bash
# Find process using port
lsof -ti:3000  # or 8000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different ports
PORT=3001 BACKEND_PORT=8001 npm run dev
```

#### 4. Module Not Found
```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# Python
rm -rf backend/venv
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

#### 5. Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
sudo systemctl start redis-server  # Linux
brew services start redis           # macOS
docker start cosmic-redis           # Docker

# Disable worker if Redis unavailable
# The app will still work without background jobs
```

#### 6. Database Errors
```bash
# Reset database
rm backend/app.db
PYTHONPATH=. python backend/seed_demo.py

# Check permissions
ls -la backend/app.db
chmod 664 backend/app.db
```

### Platform-Specific Issues

#### macOS
- **SSL Certificate Error**: `pip config set global.trusted-host "pypi.org files.pythonhosted.org"`
- **Architecture Issues (M1/M2)**: Use `arch -x86_64` prefix for commands

#### Windows
- Use WSL2 for best compatibility
- In Git Bash, use `winpty` prefix for interactive commands
- Convert line endings: `git config core.autocrlf true`

#### Linux
- May need to install additional build tools: `sudo apt install build-essential`
- SELinux may block ports: `sudo semanage port -a -t http_port_t -p tcp 8000`

### Health Checks

Run health check after setup:
```bash
./scripts/health-check.sh
```

Expected output:
```
Frontend: ✓ Running
Backend API: ✓ Healthy
API Documentation: ✓ Available
Redis Cache: ✓ Connected
Database: ✓ SQLite database exists
Logs: ✓ No errors in startup log
Profile API: ✓ Working
```

## Development Tips

### Quick Commands

```bash
# Initial setup
npm run setup

# Stop all services
npm run stop

# Run specific tests
npm test -- components/ProfileForm.test.tsx
pytest tests/test_planets.py -v

# Database operations
sqlite3 backend/app.db ".tables"  # List tables
sqlite3 backend/app.db ".schema"  # Show schema

# Redis operations
redis-cli FLUSHALL  # Clear all data
redis-cli MONITOR   # Watch commands

# Check logs
tail -f .startup.log
tail -f backend/logs/*.log
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
npm run test:all

# Commit with conventional commits
git add .
git commit -m "feat: add birth time validation"
git commit -m "fix: correct timezone handling"
git commit -m "docs: update setup instructions"

# Push and create PR
git push origin feature/your-feature
```

### VS Code Setup

Recommended extensions:
- Python
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense

Settings (.vscode/settings.json):
```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Performance Tips

1. **Use Redis** for caching and background jobs
2. **Enable production mode** for deployment: `NODE_ENV=production`
3. **Use PostgreSQL** instead of SQLite for production
4. **Enable gzip** compression in nginx/Apache
5. **Use CDN** for static assets

### Debugging

```bash
# Enable debug logging
export DEBUG=* 
npm run dev

# Python debugging
import pdb; pdb.set_trace()  # Add breakpoint

# Check API endpoints
curl http://localhost:8000/docs

# Test specific endpoint
curl -X POST http://localhost:8000/profile \
  -H "Content-Type: application/json" \
  -d '{"date":"2000-01-01","time":"12:00","location":"Delhi"}'
```

## Getting Help

1. Check logs: `.startup.log`, `backend/logs/`
2. Run health check: `./scripts/health-check.sh`
3. Check documentation: `/docs` endpoint
4. Search issues on GitHub
5. Create detailed bug report with:
   - OS and version
   - Node/Python versions
   - Error messages
   - Steps to reproduce

---

Happy coding! 🚀✨