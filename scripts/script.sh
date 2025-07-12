#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# COSMIC DHARMA - ENHANCED WSL STARTUP SCRIPT
# ==========================================

# Terminal colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
ORANGE='\033[0;33m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'
UNDERLINE='\033[4m'
BLINK='\033[5m'
REVERSE='\033[7m'
RESET='\033[0m'

# Unicode symbols
CHECK="✓"
CROSS="✗"
ARROW="→"
STAR="★"
ROCKET="🚀"
SPARKLES="✨"
WARNING="⚠️"
INFO="ℹ️"
GEAR="⚙️"
PACKAGE="📦"
PYTHON="🐍"
NODE="⬢"
DATABASE="🗄️"
NETWORK="🌐"
CLOCK="🕐"
FIRE="🔥"
HEART="❤️"
DIAMOND="💎"
LIGHTNING="⚡"
SHIELD="🛡️"
BUG="🐛"
TOOLS="🔧"
CHECKMARK="☑️"
HOURGLASS="⏳"

# WSL Detection
IS_WSL=0
if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null; then
    IS_WSL=1
fi

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$REPO_ROOT/.startup.log"
ERROR_LOG="$REPO_ROOT/.startup-errors.log"
PID_FILE="$REPO_ROOT/.startup.pid"
REDIS_PID_FILE="$REPO_ROOT/.redis.pid"
WORKER_ENABLED=1
CLEANUP_REGISTERED=0
START_TIME=$(date +%s)

# Network configuration for WSL
if [ $IS_WSL -eq 1 ]; then
    # Get Windows host IP for WSL2
    export WINDOWS_HOST=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
    export DISPLAY="${WINDOWS_HOST}:0"
fi

# Optional flags
SEED_DB=0
RUN_DIAGNOSTICS=0
VERBOSE=0
SKIP_TESTS=0
AUTO_FIX=0

# Process tracking
declare -a MANAGED_PIDS=()

# Error tracking
declare -a ERRORS=()
declare -a WARNINGS=()

# ==========================================
# ENHANCED LOGGING SYSTEM
# ==========================================

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    if [ "$level" = "ERROR" ]; then
        echo "[$timestamp] $message" >> "$ERROR_LOG"
        ERRORS+=("$message")
    elif [ "$level" = "WARN" ]; then
        WARNINGS+=("$message")
    fi
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_debug() { [ $VERBOSE -eq 1 ] && log "DEBUG" "$@"; }

# ==========================================
# ENHANCED UI FUNCTIONS
# ==========================================

print_header() {
    clear
    local width=$(tput cols)
    local padding=$(( (width - 62) / 2 ))
    
    echo -e "${PURPLE}${BOLD}"
    printf "%${padding}s" ""
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ______                    _        ____  _                           ║
║    / ____/___  _________ ___  (_)____  / __ \/ /_  ____ _________ ___  ____ ║
║   / /   / __ \/ ___/ __ `__ \/ / ___/ / / / / __ \/ __ `/ ___/ __ `__ \/ __ \║
║  / /___/ /_/ (__  ) / / / / / / /__  / /_/ / / / / /_/ / /  / / / / / / /_/ /║
║  \____/\____/____/_/ /_/ /_/_/\___/ /_____/_/ /_/\__,_/_/  /_/ /_/ /_/\__,_/ ║
║                                                              ║
║              ${SPARKLES} Vedic Astrology Platform ${SPARKLES}              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"
    
    # WSL Notice
    if [ $IS_WSL -eq 1 ]; then
        echo -e "${CYAN}${ITALIC}Running on Windows Subsystem for Linux (WSL)${RESET}"
        echo
    fi
}

print_step() {
    local step=$1
    local total=$2
    local message=$3
    local icon=${4:-$GEAR}
    
    echo
    echo -e "${BOLD}${BLUE}┌─────────────────────────────────────────────────────────────┐${RESET}"
    echo -e "${BOLD}${BLUE}│ ${icon} Step ${step}/${total}: ${WHITE}${message}${BLUE} │${RESET}"
    echo -e "${BOLD}${BLUE}└─────────────────────────────────────────────────────────────┘${RESET}"
}

print_success() {
    echo -e "  ${GREEN}${CHECK} $1${RESET}"
    log_info "SUCCESS: $1"
}

print_error() {
    echo -e "  ${RED}${CROSS} $1${RESET}"
    log_error "$1"
}

print_warning() {
    echo -e "  ${YELLOW}${WARNING} $1${RESET}"
    log_warn "$1"
}

print_info() {
    echo -e "  ${CYAN}${INFO} $1${RESET}"
    log_info "$1"
}

print_debug() {
    [ $VERBOSE -eq 1 ] && echo -e "  ${DIM}${TOOLS} $1${RESET}"
    log_debug "$1"
}

print_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    
    printf "\r  ${CYAN}Progress: ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%$((width - filled))s" | tr ' ' '░'
    printf "] %3d%% ${RESET}" $percentage
}

animated_spinner() {
    local pid=$1
    local message=$2
    local delay=0.1
    local spinners=(
        "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
        "◐◓◑◒"
        "◰◳◲◱"
        "▖▘▝▗"
        "⣾⣽⣻⢿⡿⣟⣯⣷"
    )
    local spinner=${spinners[0]}
    local i=0
    
    while kill -0 $pid 2>/dev/null; do
        local temp=${spinner:$i:1}
        printf "\r  ${CYAN}%s${RESET} %s" "$temp" "$message"
        ((i=(i+1)%${#spinner}))
        sleep $delay
    done
    printf "\r  ${GREEN}${CHECK}${RESET} %s\n" "$message"
}

print_box() {
    local title=$1
    local content=$2
    local color=${3:-$CYAN}
    
    echo -e "${color}╭──────────────────────────────────────────────────────────────╮${RESET}"
    echo -e "${color}│ ${BOLD}${title}${RESET}${color} │${RESET}"
    echo -e "${color}├──────────────────────────────────────────────────────────────┤${RESET}"
    echo -e "${color}│ ${RESET}${content}${color} │${RESET}"
    echo -e "${color}╰──────────────────────────────────────────────────────────────╯${RESET}"
}

# ==========================================
# ERROR RECOVERY SYSTEM
# ==========================================

handle_error() {
    local error_code=$?
    local error_context=$1
    local suggestion=$2
    
    print_error "Error in: $error_context (Exit code: $error_code)"
    [ -n "$suggestion" ] && print_info "Suggestion: $suggestion"
    
    if [ $AUTO_FIX -eq 1 ]; then
        print_info "Attempting automatic fix..."
        return 1
    else
        echo -e "\n${YELLOW}What would you like to do?${RESET}"
        echo "  1) Retry"
        echo "  2) Skip this step"
        echo "  3) View detailed error log"
        echo "  4) Exit"
        
        read -p "Choice (1-4): " choice
        case $choice in
            1) return 1 ;;
            2) return 0 ;;
            3) 
                less "$ERROR_LOG"
                return 1
                ;;
            4) exit 1 ;;
            *) return 1 ;;
        esac
    fi
}

# ==========================================
# SYSTEM CHECKS WITH WSL SUPPORT
# ==========================================

check_system_requirements() {
    print_step 1 8 "System Requirements Check" $SHIELD
    
    local errors=0
    local system_info=""
    
    # OS Detection
    echo -n "  Operating System: "
    if [ $IS_WSL -eq 1 ]; then
        local wsl_version=$(wsl.exe -l -v 2>/dev/null | grep -E "^\*" | awk '{print $4}' || echo "Unknown")
        print_info "WSL $wsl_version on Windows"
        system_info="WSL $wsl_version"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local distro=$(lsb_release -si 2>/dev/null || echo "Linux")
        print_success "$distro Linux"
        system_info="$distro Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "macOS"
        system_info="macOS"
    else
        print_warning "Unknown OS ($OSTYPE)"
        system_info="Unknown OS"
    fi
    
    # System Resources
    echo -e "\n  ${CYAN}System Resources:${RESET}"
    local total_mem=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo "Unknown")
    local available_mem=$(free -m 2>/dev/null | awk '/^Mem:/{print $7}' || echo "Unknown")
    local cpu_cores=$(nproc 2>/dev/null || echo "Unknown")
    
    echo "    Memory: ${available_mem}MB available of ${total_mem}MB total"
    echo "    CPU Cores: $cpu_cores"
    
    if [ "$available_mem" != "Unknown" ] && [ $available_mem -lt 1024 ]; then
        print_warning "Low memory available (< 1GB)"
    fi
    
    # Network Check
    echo -e "\n  ${CYAN}Network Connectivity:${RESET}"
    if ping -c 1 -W 2 8.8.8.8 &>/dev/null; then
        print_success "Internet connection available"
    else
        print_error "No internet connection detected"
        ((errors++))
    fi
    
    # WSL-specific checks
    if [ $IS_WSL -eq 1 ]; then
        echo -e "\n  ${CYAN}WSL-Specific Checks:${RESET}"
        
        # Check if systemd is enabled (WSL2)
        if command -v systemctl &>/dev/null && systemctl is-system-running &>/dev/null; then
            print_success "systemd is enabled"
        else
            print_warning "systemd not enabled (some services may not work)"
        fi
        
        # Check Windows host connectivity
        if ping -c 1 -W 2 $WINDOWS_HOST &>/dev/null; then
            print_success "Windows host reachable at $WINDOWS_HOST"
        else
            print_warning "Cannot reach Windows host"
        fi
    fi
    
    # Required Commands
    echo -e "\n  ${CYAN}Required Software:${RESET}"
    local required_cmds=(
        "node|$NODE|Node.js"
        "npm|$PACKAGE|NPM"
        "python3|$PYTHON|Python 3"
        "git|$DIAMOND|Git"
    )
    
    for cmd_info in "${required_cmds[@]}"; do
        IFS='|' read -r cmd icon name <<< "$cmd_info"
        echo -n "    $icon $name: "
        
        if command -v "$cmd" >/dev/null 2>&1; then
            local version=$($cmd --version 2>&1 | head -n1 || echo "Unknown")
            print_success "$version"
        else
            print_error "Not found"
            ((errors++))
        fi
    done
    
    # Optional Commands
    echo -e "\n  ${CYAN}Optional Software:${RESET}"
    local optional_cmds=(
        "docker|🐳|Docker"
        "redis-server|$DATABASE|Redis"
        "lsof|$NETWORK|lsof"
    )
    
    for cmd_info in "${optional_cmds[@]}"; do
        IFS='|' read -r cmd icon name <<< "$cmd_info"
        echo -n "    $icon $name: "
        
        if command -v "$cmd" >/dev/null 2>&1; then
            print_success "Available"
        else
            print_warning "Not found (optional)"
        fi
    done
    
    # Version Checks
    echo -e "\n  ${CYAN}Version Requirements:${RESET}"
    
    # Node.js version
    echo -n "    $NODE Node.js version: "
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node -v)
        local node_major=$(echo "$node_version" | sed -E 's/^v([0-9]+).*/\1/')
        if [ "$node_major" -ge 18 ]; then
            print_success "$node_version ✓"
        else
            print_error "$node_version (requires v18+)"
            ((errors++))
        fi
    fi
    
    # Python version
    echo -n "    $PYTHON Python version: "
    if command -v python3 >/dev/null 2>&1; then
        local py_version=$(python3 -V 2>&1 | awk '{print $2}')
        local py_major=$(echo "$py_version" | cut -d. -f1)
        local py_minor=$(echo "$py_version" | cut -d. -f2)
        if [ "$py_major" -eq 3 ] && [ "$py_minor" -ge 11 ]; then
            print_success "$py_version ✓"
        else
            print_error "$py_version (requires 3.11+)"
            ((errors++))
        fi
    fi
    
    # Summary
    echo
    if [ $errors -eq 0 ]; then
        print_box "System Check Passed" "All requirements met! ${CHECK}" "$GREEN"
    else
        print_box "System Check Failed" "$errors requirement(s) not met ${CROSS}" "$RED"
        
        if [ $AUTO_FIX -eq 0 ]; then
            echo -e "\n${YELLOW}Would you like to continue anyway? (y/N)${RESET}"
            read -r continue_anyway
            if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
}

# ==========================================
# ENHANCED SETUP FUNCTIONS
# ==========================================

setup_directories() {
    print_step 2 8 "Directory Setup" $PACKAGE
    
    cd "$REPO_ROOT"
    
    # Create necessary directories
    local dirs=(
        "logs"
        "backend/logs"
        "backend/cache"
        "backend/uploads"
        ".vscode"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created $dir"
        else
            print_info "$dir already exists"
        fi
    done
    
    # Setup environment files
    echo -e "\n  ${CYAN}Environment Configuration:${RESET}"
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        if [ -f backend/.env.example ]; then
            cp backend/.env.example backend/.env
            print_success "Created backend/.env from example"
            
            # Generate secure secret key
            local secret_key=$(openssl rand -hex 32 2>/dev/null || python3 -c 'import secrets; print(secrets.token_hex(32))')
            sed -i "s/change-me/$secret_key/g" backend/.env
            print_info "Generated secure SECRET_KEY"
        else
            print_error "No backend/.env.example found"
            cat > backend/.env << EOF
SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || date +%s | sha256sum | head -c 64)
DATABASE_URL=sqlite:///./app.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
AYANAMSA=lahiri
NODE_TYPE=mean
HOUSE_SYSTEM=whole_sign
CACHE_ENABLED=true
CACHE_URL=redis://localhost:6379/1
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=3600
EOF
            print_success "Created minimal backend/.env"
        fi
    else
        print_info "backend/.env already exists"
    fi
    
    # Frontend .env.local
    if [ ! -f .env.local ]; then
        if [ -f .env.local.example ]; then
            cp .env.local.example .env.local
            print_success "Created .env.local from example"
        else
            echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
            print_success "Created .env.local with defaults"
        fi
    else
        print_info ".env.local already exists"
    fi
    
    # WSL-specific configurations
    if [ $IS_WSL -eq 1 ]; then
        echo -e "\n  ${CYAN}WSL Configuration:${RESET}"
        
        # Create WSL config if needed
        if [ ! -f ~/.wslconfig ]; then
            cat > ~/.wslconfig << EOF
[wsl2]
memory=4GB
processors=2
localhostForwarding=true
EOF
            print_success "Created WSL configuration"
        fi
        
        # VS Code settings for WSL
        if [ -d .vscode ]; then
            cat > .vscode/settings.json << EOF
{
    "terminal.integrated.defaultProfile.linux": "bash",
    "python.defaultInterpreterPath": "./backend/venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "remote.WSL.fileWatcher.polling": true
}
EOF
            print_success "Created VS Code WSL settings"
        fi
    fi
}

install_node_dependencies() {
    print_step 3 8 "Node.js Dependencies" $NODE
    
    # Check package.json
    if [ ! -f package.json ]; then
        print_error "package.json not found!"
        return 1
    fi
    
    # Clean install option
    if [ -d node_modules ] && [ $AUTO_FIX -eq 0 ]; then
        echo -e "\n  ${YELLOW}node_modules already exists. Options:${RESET}"
        echo "    1) Skip installation"
        echo "    2) Update packages"
        echo "    3) Clean install (delete and reinstall)"
        read -p "  Choice (1-3): " npm_choice
        
        case $npm_choice in
            1) 
                print_info "Skipping Node.js installation"
                return 0
                ;;
            2)
                print_info "Updating packages..."
                ;;
            3)
                print_warning "Removing node_modules..."
                rm -rf node_modules package-lock.json
                ;;
        esac
    fi
    
    # Install dependencies
    echo -e "\n  ${DIM}Installing Node.js packages...${RESET}"
    
    # Show package stats
    local total_deps=$(grep -c '"' package.json 2>/dev/null || echo "0")
    print_info "Installing ~$total_deps dependencies"
    
    npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | \
        while IFS= read -r line; do
            if [[ "$line" == *"WARN"* ]]; then
                print_warning "npm: $line"
            elif [[ "$line" == *"ERR!"* ]]; then
                print_error "npm: $line"
            fi
        done &
    
    local npm_pid=$!
    animated_spinner $npm_pid "Installing Node.js packages..."
    wait $npm_pid
    
    if [ $? -eq 0 ]; then
        local installed=$(find node_modules -maxdepth 1 -type d | wc -l)
        print_success "Installed $installed packages successfully"
    else
        print_error "Failed to install Node.js dependencies"
        handle_error "npm install" "Try 'rm -rf node_modules' and run again"
    fi
}

setup_python_environment() {
    print_step 4 8 "Python Environment" $PYTHON
    
    cd "$REPO_ROOT"
    
    # Check Python availability
    if ! command -v python3 >/dev/null 2>&1; then
        print_error "Python 3 not found!"
        return 1
    fi
    
    # Virtual environment management
    echo -e "\n  ${CYAN}Virtual Environment:${RESET}"
    
    if [ -d backend/venv ]; then
        print_info "Virtual environment exists"
        
        # Check if it's valid
        if [ ! -f backend/venv/bin/activate ] && [ ! -f backend/venv/Scripts/activate ]; then
            print_warning "Virtual environment seems corrupted"
            rm -rf backend/venv
            print_info "Removed corrupted venv"
        fi
    fi
    
    if [ ! -d backend/venv ]; then
        print_info "Creating virtual environment..."
        python3 -m venv backend/venv &
        animated_spinner $! "Creating Python virtual environment..."
        print_success "Virtual environment created"
    fi
    
    # Optional: Check for pip executable and recreate if missing
    if [ -f backend/venv/bin/activate ] && [ ! -f backend/venv/bin/pip ]; then
        print_warning "pip executable not found in venv. Recreating..."
        python3 -m venv backend/venv &
        animated_spinner $! "Recreating Python virtual environment..."
        print_success "Virtual environment recreated"
    fi
    
    # Activate virtual environment
    echo -e "\n  ${CYAN}Activating Environment:${RESET}"
    if [ -f backend/venv/bin/activate ]; then
        source backend/venv/bin/activate
        print_success "Activated virtual environment (Unix)"
    elif [ -f backend/venv/Scripts/activate ]; then
        source backend/venv/Scripts/activate
        print_success "Activated virtual environment (Windows)"
    else
        print_error "Could not find activation script"
        return 1
    fi
    
    # Upgrade pip
    echo -e "\n  ${CYAN}Package Manager:${RESET}"
    print_info "Upgrading pip..."
    python3 -m pip install --upgrade pip >/dev/null 2>&1 &
    animated_spinner $! "Upgrading pip..."
    
    # Install requirements
    echo -e "\n  ${CYAN}Python Packages:${RESET}"
    
    if [ ! -f backend/requirements.txt ]; then
        print_error "requirements.txt not found!"
        return 1
    fi
    
    local total_packages=$(wc -l < backend/requirements.txt)
    print_info "Installing $total_packages packages..."
    
    # Install with progress
    pip install -q -r backend/requirements.txt -r backend/requirements-dev.txt 2>&1 | \
        while IFS= read -r line; do
            if [[ "$line" == *"Successfully installed"* ]]; then
                print_success "$line"
            elif [[ "$line" == *"ERROR"* ]]; then
                print_error "$line"
            fi
        done &
    
    local pip_pid=$!
    animated_spinner $pip_pid "Installing Python packages..."
    
    # Store exit status of pip install, preventing script exit via `set -e`
    local pip_exit_status=0
    wait $pip_pid || pip_exit_status=$?
    
    if [ $pip_exit_status -eq 0 ]; then
        print_success "All Python packages installed"
        
        # Verify critical packages
        echo -e "\n  ${CYAN}Verifying Critical Packages:${RESET}"
        local critical_packages=("fastapi" "uvicorn" "swisseph" "redis" "rq")
        for pkg in "${critical_packages[@]}"; do
            if python3 -c "import $pkg" 2>/dev/null; then
                print_success "$pkg ✓"
            else
                print_error "$pkg ✗"
            fi
        done
    else
        print_error "Failed to install Python dependencies (Exit Code: $pip_exit_status)"
        handle_error "pip install" "Check internet connection and try again"
    fi
}

# ==========================================
# ENHANCED REDIS MANAGEMENT
# ==========================================

setup_redis() {
    print_step 5 8 "Redis Setup" $DATABASE
    
    # Get Redis configuration
    local redis_url="redis://localhost:6379"
    local redis_host="localhost"
    local redis_port="6379"
    
    if [ -f backend/.env ]; then
        local env_url=$(grep -E '^REDIS_URL=' backend/.env | cut -d'=' -f2- | tr -d '\r' || true)
        if [ -n "$env_url" ]; then
            redis_url="$env_url"
            # Parse host and port from URL
            redis_host=$(echo "$env_url" | sed -E 's|redis://([^:]+):([0-9]+).*|\1|')
            redis_port=$(echo "$env_url" | sed -E 's|redis://([^:]+):([0-9]+).*|\2|')
        fi
    fi
    
    echo -e "\n  ${CYAN}Redis Configuration:${RESET}"
    print_info "URL: $redis_url"
    
    # Check if Redis is already running
    if python3 -c "import redis; redis.from_url('$redis_url').ping()" 2>/dev/null; then
        print_success "Redis is already running and accessible"
        return 0
    fi
    
    # WSL-specific Redis check
    if [ $IS_WSL -eq 1 ]; then
        echo -e "\n  ${CYAN}Checking Windows Redis:${RESET}"
        # Try to connect to Redis on Windows host
        local windows_redis="redis://${WINDOWS_HOST}:6379"
        if python3 -c "import redis; redis.from_url('$windows_redis').ping()" 2>/dev/null; then
            print_success "Found Redis on Windows host"
            print_info "Update backend/.env to use: REDIS_URL=$windows_redis"
            return 0
        fi
    fi
    
    # Try different Redis startup methods
    echo -e "\n  ${CYAN}Starting Redis:${RESET}"
    
    # Method 1: Docker
    if command -v docker >/dev/null 2>&1; then
        print_info "Trying Docker..."
        
        # Check if Redis container exists
        if docker ps -a | grep -q "cosmic-redis"; then
            docker start cosmic-redis >/dev/null 2>&1
        else
            docker run -d --name cosmic-redis -p 6379:6379 redis:7-alpine >/dev/null 2>&1
        fi
        
        sleep 2
        if python3 -c "import redis; redis.from_url('$redis_url').ping()" 2>/dev/null; then
            REDIS_STARTED="docker"
            print_success "Redis started with Docker"
            return 0
        fi
    fi
    
    # Method 2: Local redis-server
    if command -v redis-server >/dev/null 2>&1; then
        print_info "Trying local Redis server..."
        
        # Create Redis config for better WSL performance
        cat > "$REPO_ROOT/.redis.conf" << EOF
port 6379
bind 127.0.0.1
daemonize yes
pidfile $REDIS_PID_FILE
dir $REPO_ROOT
save ""
appendonly no
EOF
        
        redis-server "$REPO_ROOT/.redis.conf" >/dev/null 2>&1
        sleep 2
        
        if python3 -c "import redis; redis.from_url('$redis_url').ping()" 2>/dev/null; then
            REDIS_STARTED="local"
            print_success "Redis started locally"
            return 0
        fi
    fi
    
    # Method 3: Use fake Redis for development
    print_warning "Could not start Redis - worker will be disabled"
    print_info "The application will still work without background jobs"
    WORKER_ENABLED=0
    
    # Offer installation help
    echo -e "\n  ${YELLOW}To enable Redis:${RESET}"
    echo "    Option 1: Install Docker and run: docker run -d -p 6379:6379 redis"
    echo "    Option 2: Install Redis: sudo apt-get install redis-server"
    if [ $IS_WSL -eq 1 ]; then
        echo "    Option 3: Install Redis on Windows and enable in WSL"
    fi
}

# ==========================================
# TEST RUNNER WITH BETTER OUTPUT
# ==========================================

run_tests() {
    print_step 6 8 "Running Tests" $BUG
    
    if [ $SKIP_TESTS -eq 1 ]; then
        print_warning "Skipping tests (--skip-tests flag)"
        return 0
    fi
    
    local test_errors=0
    
    # Frontend tests
    echo -e "\n  ${CYAN}Frontend Tests:${RESET}"
    if [ -f vitest.config.js ]; then
        npm run test:frontend 2>&1 | while IFS= read -r line; do
            if [[ "$line" == *"PASS"* ]]; then
                echo -e "    ${GREEN}✓${RESET} $line"
            elif [[ "$line" == *"FAIL"* ]]; then
                echo -e "    ${RED}✗${RESET} $line"
                ((test_errors++))
            fi
        done &
        
        local frontend_pid=$!
        animated_spinner $frontend_pid "Running frontend tests..."
        wait $frontend_pid
        
        if [ $? -eq 0 ]; then
            print_success "Frontend tests passed"
        else
            print_warning "Some frontend tests failed"
        fi
    else
        print_warning "No frontend test configuration found"
    fi
    
    # Backend tests
    echo -e "\n  ${CYAN}Backend Tests:${RESET}"
    if [ -f pytest.ini ]; then
        cd backend
        source venv/bin/activate
        
        PYTHONPATH=. pytest -q 2>&1 | while IFS= read -r line; do
            if [[ "$line" == *"passed"* ]]; then
                echo -e "    ${GREEN}✓${RESET} $line"
            elif [[ "$line" == *"failed"* ]] || [[ "$line" == *"error"* ]]; then
                echo -e "    ${RED}✗${RESET} $line"
                ((test_errors++))
            fi
        done &
        
        local backend_pid=$!
        animated_spinner $backend_pid "Running backend tests..."
        wait $backend_pid
        
        if [ $? -eq 0 ]; then
            print_success "Backend tests passed"
        else
            print_warning "Some backend tests failed"
        fi
        
        cd ..
    else
        print_warning "No backend test configuration found"
    fi
    
    # Summary
    if [ $test_errors -eq 0 ]; then
        print_box "All Tests Passed" "Ready for launch! ${ROCKET}" "$GREEN"
    else
        print_box "Test Failures" "Some tests failed, but continuing..." "$YELLOW"
    fi
}

# ==========================================
# PORT MANAGEMENT WITH AUTO-RESOLUTION
# ==========================================

check_ports() {
    print_step 7 8 "Port Availability" $NETWORK
    
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    
    # Function to find next available port
    find_available_port() {
        local start_port=$1
        local max_attempts=20
        
        for i in $(seq 0 $max_attempts); do
            local test_port=$((start_port + i))
            if ! lsof -Pi :$test_port -sTCP:LISTEN -t >/dev/null 2>&1; then
                echo $test_port
                return 0
            fi
        done
        return 1
    }
    
    # Check frontend port
    echo -e "\n  ${CYAN}Frontend Port ($frontend_port):${RESET}"
    if ! lsof -Pi :$frontend_port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "Port $frontend_port is available"
    else
        print_warning "Port $frontend_port is in use"
        
        # Show what's using the port
        local process=$(lsof -Pi :$frontend_port -sTCP:LISTEN 2>/dev/null | tail -n1 | awk '{print $1}')
        [ -n "$process" ] && print_info "Used by: $process"
        
        # Find alternative
        local new_port=$(find_available_port $frontend_port)
        if [ -n "$new_port" ]; then
            print_success "Found alternative port: $new_port"
            export PORT=$new_port
            frontend_port=$new_port
            
            # Update .env.local
            sed -i "s/localhost:3000/localhost:$new_port/g" .env.local 2>/dev/null
        else
            print_error "No available ports found!"
            return 1
        fi
    fi
    
    # Check backend port
    echo -e "\n  ${CYAN}Backend Port ($backend_port):${RESET}"
    if ! lsof -Pi :$backend_port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_success "Port $backend_port is available"
    else
        print_warning "Port $backend_port is in use"
        
        # Show what's using the port
        local process=$(lsof -Pi :$backend_port -sTCP:LISTEN 2>/dev/null | tail -n1 | awk '{print $1}')
        [ -n "$process" ] && print_info "Used by: $process"
        
        # Find alternative
        local new_port=$(find_available_port $backend_port)
        if [ -n "$new_port" ]; then
            print_success "Found alternative port: $new_port"
            export BACKEND_PORT=$new_port
            backend_port=$new_port
            
            # Update .env.local
            sed -i "s/localhost:8000/localhost:$new_port/g" .env.local 2>/dev/null
        else
            print_error "No available ports found!"
            return 1
        fi
    fi
    
    # WSL port forwarding info
    if [ $IS_WSL -eq 1 ]; then
        echo -e "\n  ${CYAN}WSL Port Forwarding:${RESET}"
        print_info "Ports should be accessible from Windows at:"
        print_info "  Frontend: http://localhost:$frontend_port"
        print_info "  Backend: http://localhost:$backend_port"
    fi
}

# ==========================================
# ENHANCED SERVICE STARTUP
# ==========================================

start_services() {
    print_step 8 8 "Starting Services" $ROCKET
    
    CLEANUP_REGISTERED=1
    echo $$ > "$PID_FILE"
    
    # Service configuration
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    
    # Clear screen and show launch info
    clear
    print_header
    
    # Launch banner
    echo -e "${BOLD}${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║         ${ROCKET} COSMIC DHARMA IS LAUNCHING! ${ROCKET}              ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}\n"
    
    # Service URLs
    cat << EOF
${CYAN}${BOLD}📡 Service Endpoints:${RESET}
${CYAN}├─${RESET} ${GREEN}Frontend:${RESET}   http://localhost:${frontend_port}
${CYAN}├─${RESET} ${GREEN}Backend:${RESET}    http://localhost:${backend_port}
${CYAN}├─${RESET} ${GREEN}API Docs:${RESET}   http://localhost:${backend_port}/docs
${CYAN}└─${RESET} ${GREEN}Logs:${RESET}       $LOG_FILE

${YELLOW}${BOLD}⌨️  Quick Commands:${RESET}
${YELLOW}├─${RESET} ${WHITE}Stop all:${RESET}     Press ${BOLD}Ctrl+C${RESET}
${YELLOW}├─${RESET} ${WHITE}View logs:${RESET}    ${DIM}tail -f $LOG_FILE${RESET}
${YELLOW}├─${RESET} ${WHITE}Backend shell:${RESET} ${DIM}cd backend && source venv/bin/activate${RESET}
${YELLOW}└─${RESET} ${WHITE}Restart:${RESET}      ${DIM}$0${RESET}

EOF
    
    # System status
    if [ $WORKER_ENABLED -eq 1 ]; then
        echo -e "${GREEN}${BOLD}✅ All Systems Go!${RESET} Redis worker enabled for background tasks.\n"
    else
        echo -e "${YELLOW}${BOLD}⚡ Running in Limited Mode${RESET} Background tasks disabled (no Redis).\n"
    fi
    
    # WSL-specific instructions
    if [ $IS_WSL -eq 1 ]; then
        echo -e "${CYAN}${BOLD}🪟 WSL Instructions:${RESET}"
        echo -e "   • Open in Windows browser: ${UNDERLINE}http://localhost:${frontend_port}${RESET}"
        echo -e "   • If ports don't work, restart WSL: ${DIM}wsl --shutdown${RESET}\n"
    fi
    
    # Performance monitoring
    echo -e "${DIM}Starting services with resource monitoring...${RESET}\n"
    
    # Build command
    local services=""
    local names=""
    local colors=""
    
    # Frontend
    services="\"npm run dev\""
    names="Frontend"
    colors="cyan"
    
    # Backend (with custom port if needed)
    if [ $backend_port -ne 8000 ]; then
        services="$services \"cd backend && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port $backend_port\""
    else
        services="$services \"npm run backend\""
    fi
    names="$names,Backend"
    colors="$colors,magenta"
    
    # Worker (if enabled)
    if [ $WORKER_ENABLED -eq 1 ]; then
        services="$services \"npm run worker\""
        names="$names,Worker"
        colors="$colors,yellow"
    fi
    
    # Launch with concurrently
    echo -e "${BOLD}${GREEN}🚀 Launching services...${RESET}\n"
    
    eval "npx --yes concurrently \
        --names '$names' \
        --prefix-colors '$colors' \
        --prefix '[{time}][{name}]' \
        --timestamp-format 'HH:mm:ss' \
        --handle-input \
        --restart-tries 3 \
        --restart-after 1000 \
        $services" 2>&1 | tee -a "$LOG_FILE"
}

# ==========================================
# ENHANCED CLEANUP
# ==========================================

cleanup() {
    if [ $CLEANUP_REGISTERED -eq 0 ]; then
        return
    fi
    
    echo -e "\n\n${YELLOW}${BOLD}🛑 Shutting down Cosmic Dharma...${RESET}"
    
    # Calculate runtime
    local end_time=$(date +%s)
    local runtime=$((end_time - START_TIME))
    local hours=$((runtime / 3600))
    local minutes=$(((runtime % 3600) / 60))
    local seconds=$((runtime % 60))
    
    echo -e "${DIM}Total runtime: ${hours}h ${minutes}m ${seconds}s${RESET}\n"
    
    # Stop services
    for pid in "${MANAGED_PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            echo -e "${DIM}  Stopping process $pid...${RESET}"
            kill -TERM $pid 2>/dev/null || true
        fi
    done
    
    # Stop Redis if we started it
    if [ -f "$REDIS_PID_FILE" ]; then
        local redis_pid=$(cat "$REDIS_PID_FILE")
        if kill -0 $redis_pid 2>/dev/null; then
            echo -e "${DIM}  Stopping Redis...${RESET}"
            kill -TERM $redis_pid 2>/dev/null || true
        fi
        rm -f "$REDIS_PID_FILE"
    fi
    
    # Stop Docker Redis if we started it
    if [ "${REDIS_STARTED:-}" = "docker" ]; then
        echo -e "${DIM}  Stopping Docker Redis...${RESET}"
        docker stop cosmic-redis >/dev/null 2>&1 || true
    fi
    
    # Deactivate virtual environment
    if command -v deactivate >/dev/null 2>&1; then
        deactivate
    fi
    
    # Remove PID file
    rm -f "$PID_FILE"
    
    # Show summary
    echo -e "\n${GREEN}${BOLD}✨ Thanks for using Cosmic Dharma! ✨${RESET}"
    
    # Show any errors that occurred
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo -e "\n${RED}${BOLD}Errors encountered:${RESET}"
        for error in "${ERRORS[@]}"; do
            echo -e "  ${RED}•${RESET} $error"
        done
    fi
    
    # Show any warnings
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo -e "\n${YELLOW}${BOLD}Warnings:${RESET}"
        for warning in "${WARNINGS[@]}"; do
            echo -e "  ${YELLOW}•${RESET} $warning"
        done
    fi
    
    echo -e "\n${CYAN}${BOLD}See you in the stars! ${STAR}${RESET}\n"
}

trap cleanup EXIT INT TERM

# ==========================================
# DIAGNOSTIC MODE
# ==========================================

run_diagnostics() {
    print_header
    
    echo -e "${BOLD}${CYAN}=== SYSTEM DIAGNOSTICS ===${RESET}\n"
    
    # System Info
    echo -e "${BOLD}System Information:${RESET}"
    echo "  Script: $0"
    echo "  Directory: $SCRIPT_DIR"
    echo "  Repository: $REPO_ROOT"
    echo "  WSL: $([ $IS_WSL -eq 1 ] && echo "Yes" || echo "No")"
    [ $IS_WSL -eq 1 ] && echo "  Windows Host: $WINDOWS_HOST"
    echo
    
    # Software Versions
    echo -e "${BOLD}Software Versions:${RESET}"
    echo "  Node: $(node --version 2>/dev/null || echo 'not found')"
    echo "  npm: $(npm --version 2>/dev/null || echo 'not found')"
    echo "  Python: $(python3 --version 2>/dev/null || echo 'not found')"
    echo "  pip: $(python3 -m pip --version 2>/dev/null | awk '{print $2}' || echo 'not found')"
    echo "  Git: $(git --version 2>/dev/null | awk '{print $3}' || echo 'not found')"
    echo "  Docker: $(docker --version 2>/dev/null | awk '{print $3}' || echo 'not found')"
    echo "  Redis: $(redis-server --version 2>/dev/null | awk '{print $3}' || echo 'not found')"
    echo
    
    # Environment Files
    echo -e "${BOLD}Environment Files:${RESET}"
    for file in "backend/.env" ".env.local" "package.json" "backend/requirements.txt"; do
        if [ -f "$file" ]; then
            echo -e "  ${GREEN}✓${RESET} $file ($(wc -l < "$file") lines)"
        else
            echo -e "  ${RED}✗${RESET} $file"
        fi
    done
    echo
    
    # Port Status
    echo -e "${BOLD}Port Status:${RESET}"
    for port in 3000 8000 6379; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            local process=$(lsof -Pi :$port -sTCP:LISTEN 2>/dev/null | tail -n1 | awk '{print $1}')
            echo -e "  Port $port: ${RED}In use${RESET} by $process"
        else
            echo -e "  Port $port: ${GREEN}Available${RESET}"
        fi
    done
    echo
    
    # Network
    echo -e "${BOLD}Network Status:${RESET}"
    if ping -c 1 -W 2 8.8.8.8 &>/dev/null; then
        echo -e "  Internet: ${GREEN}Connected${RESET}"
    else
        echo -e "  Internet: ${RED}Disconnected${RESET}"
    fi
    
    if [ $IS_WSL -eq 1 ] && ping -c 1 -W 2 $WINDOWS_HOST &>/dev/null; then
        echo -e "  Windows Host: ${GREEN}Reachable${RESET}"
    elif [ $IS_WSL -eq 1 ]; then
        echo -e "  Windows Host: ${RED}Unreachable${RESET}"
    fi
    echo
    
    # Recent Logs
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BOLD}Recent Log Entries:${RESET}"
        tail -n 5 "$LOG_FILE" | sed 's/^/  /'
        echo
    fi
    
    # Recent Errors
    if [ -f "$ERROR_LOG" ] && [ -s "$ERROR_LOG" ]; then
        echo -e "${BOLD}${RED}Recent Errors:${RESET}"
        tail -n 5 "$ERROR_LOG" | sed 's/^/  /'
        echo
    fi
    
    print_box "Diagnostics Complete" "System scan finished ${CHECK}" "$GREEN"
}

# ==========================================
# ARGUMENT PARSING
# ==========================================

usage() {
    cat << EOF
${BOLD}Usage:${RESET} $0 [options]

${BOLD}Options:${RESET}
  -h, --help          Show this help message
  -d, --diagnostics   Run system diagnostics and exit
  -s, --seed          Seed database with demo data
  -v, --verbose       Enable verbose output
  -t, --skip-tests    Skip running tests
  -a, --auto-fix      Attempt automatic fixes for common issues
  
${BOLD}Examples:${RESET}
  $0                  # Normal startup
  $0 -d               # Run diagnostics
  $0 -s -t            # Seed database and skip tests
  $0 -v -a            # Verbose mode with auto-fix

${BOLD}WSL Tips:${RESET}
  • Ensure WSL2 is installed (not WSL1)
  • Enable systemd for better service management
  • Install Windows Terminal for better experience
  • Use VS Code with Remote-WSL extension

EOF
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -d|--diagnostics)
            RUN_DIAGNOSTICS=1
            shift
            ;;
        -s|--seed)
            SEED_DB=1
            shift
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -t|--skip-tests)
            SKIP_TESTS=1
            shift
            ;;
        -a|--auto-fix)
            AUTO_FIX=1
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# ==========================================
# MAIN EXECUTION
# ==========================================

main() {
    # Initialize logs
    echo "=== Cosmic Dharma Startup $(date) ===" > "$LOG_FILE"
    > "$ERROR_LOG"
    
    # Show header
    print_header
    
    # Diagnostics mode
    if [ $RUN_DIAGNOSTICS -eq 1 ]; then
        run_diagnostics
        exit 0
    fi
    
    # Welcome message
    echo -e "${BOLD}${WHITE}Welcome to Cosmic Dharma Setup Wizard!${RESET}\n"
    echo -e "${CYAN}This script will:${RESET}"
    echo "  • Check system requirements"
    echo "  • Install all dependencies"
    echo "  • Configure your environment"
    echo "  • Start the application"
    echo
    
    if [ $IS_WSL -eq 1 ]; then
        echo -e "${YELLOW}${BOLD}WSL Detected!${RESET}"
        echo -e "${YELLOW}Special optimizations will be applied for WSL.${RESET}\n"
    fi
    
    echo -e "${GREEN}Press Enter to begin or Ctrl+C to cancel...${RESET}"
    read -r
    
    # Run all setup steps
    check_system_requirements
    setup_directories
    install_node_dependencies
    setup_python_environment
    setup_redis
    
    # Optional database seeding
    if [ $SEED_DB -eq 1 ]; then
        print_step 5.5 8 "Database Seeding" $DATABASE
        cd backend
        source venv/bin/activate
        
        if PYTHONPATH=. python seed_demo.py 2>&1 | grep -q "Database seeded"; then
            print_success "Database seeded with demo data"
            print_info "Login credentials:"
            print_info "  Admin: admin/admin"
            print_info "  User: user/password"
            print_info "  Donor: donor/donor"
        else
            print_error "Failed to seed database"
        fi
        cd ..
    fi
    
    run_tests
    check_ports
    
    # Final summary before launch
    echo
    print_box "Setup Complete!" "All systems ready for launch! ${ROCKET}" "$GREEN"
    echo
    echo -e "${GREEN}${BOLD}Press Enter to launch Cosmic Dharma...${RESET}"
    read -r
    
    # Start services
    start_services
}

# Run main function
main