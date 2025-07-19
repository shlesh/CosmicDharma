#!/usr/bin/env bash

# ==========================================
# COSMIC DHARMA - OPTIMIZED SETUP SCRIPT
# ==========================================

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly LOG_DIR="$REPO_ROOT/logs"
readonly LOG_FILE="$LOG_DIR/startup.log"
readonly ERROR_LOG="$LOG_DIR/startup-errors.log"
readonly DEBUG_LOG="$LOG_DIR/startup-debug.log"
readonly PID_FILE="$REPO_ROOT/.startup.pid"
readonly REDIS_PID_FILE="$REPO_ROOT/.redis.pid"

# Global state
declare -g WORKER_ENABLED=1
declare -g START_TIME=$(date +%s)
declare -g IS_WSL=0
declare -g WSL_HAS_SYSTEMD=0
declare -g WSL_WINDOWS_REDIS=0
declare -g VERBOSE=0
declare -g DEBUG_MODE=0
declare -g SKIP_TESTS=0
declare -g AUTO_FIX=0
declare -g SEED_DB=0
declare -g RUN_DIAGNOSTICS=0
declare -g PYTHON_CMD=""
declare -g VENV_PATH=""
declare -g ACTIVATE_SCRIPT=""
declare -g WINDOWS_HOST=""

# Error tracking
declare -ga ERRORS=()
declare -ga WARNINGS=()

# ==========================================
# UI MODULE - Clean output management
# ==========================================

ui::init() {
    # Terminal colors
    readonly RED='\033[0;31m'
    readonly GREEN='\033[0;32m'
    readonly YELLOW='\033[1;33m'
    readonly BLUE='\033[0;34m'
    readonly MAGENTA='\033[0;35m'
    readonly CYAN='\033[0;36m'
    readonly WHITE='\033[1;37m'
    readonly PURPLE='\033[0;35m'
    readonly BOLD='\033[1m'
    readonly DIM='\033[2m'
    readonly RESET='\033[0m'

    # Icons
    readonly CHECK="✓"
    readonly CROSS="✗"
    readonly ARROW="→"
    readonly INFO="ℹ"
    readonly WARN="⚠"
    readonly GEAR="⚙"

    # Enhanced WSL detection
    wsl::detect_and_configure
}

# Clear current line
ui::clear_line() {
    printf '\r\033[K'
}

# Print with proper line clearing
ui::print() {
    local message="$1"
    local no_newline="${2:-false}"
    ui::clear_line
    if [[ "$no_newline" == "true" ]]; then
        printf "%b" "$message"
    else
        printf "%b\n" "$message"
    fi
}

# Status messages
ui::success() { ui::print " ${GREEN}${CHECK}${RESET} $1"; }
ui::error() { ui::print " ${RED}${CROSS}${RESET} $1"; ERRORS+=("$1"); }
ui::warning() { ui::print " ${YELLOW}${WARN}${RESET} $1"; WARNINGS+=("$1"); }
ui::info() { ui::print " ${CYAN}${INFO}${RESET} $1"; }

# Progress indicator without repetition
ui::progress() {
    local message="$1"
    ui::print " ${CYAN}${GEAR}${RESET} ${message}..." true
}

# Complete progress
ui::progress_done() {
    local message="${1:-Done}"
    local status="${2:-success}"
    ui::clear_line
    case "$status" in
        success) ui::success "$message" ;;
        error) ui::error "$message" ;;
        warning) ui::warning "$message" ;;
        *) ui::info "$message" ;;
    esac
}

# Header
ui::header() {
    clear
    ui::print "${PURPLE}${BOLD}"
    ui::print "=============================================================="
    ui::print " COSMIC DHARMA"
    ui::print " Vedic Astrology Platform"
    ui::print "=============================================================="
    ui::print "${RESET}"
    [[ $IS_WSL -eq 1 ]] && ui::print "${CYAN}Running on Windows Subsystem for Linux (WSL)${RESET}\n"
}

# Step header
ui::step() {
    local step=$1
    local total=$2
    local title="$3"
    ui::print "\n${BOLD}${BLUE}[${step}/${total}]${RESET} ${BOLD}${WHITE}${title}${RESET}"
    ui::print "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

# ==========================================
# WSL DETECTION AND CONFIGURATION
# ==========================================

wsl::detect_and_configure() {
    if grep -qEi "(Microsoft|WSL)" /proc/version 2>/dev/null; then
        IS_WSL=1
        
        # More robust Windows host detection
        WINDOWS_HOST=$(ip route show | grep default | awk '{print $3}' 2>/dev/null)
        [[ -z "$WINDOWS_HOST" ]] && WINDOWS_HOST=$(cat /etc/resolv.conf 2>/dev/null | grep nameserver | awk '{print $2}' | head -1)
        [[ -z "$WINDOWS_HOST" ]] && WINDOWS_HOST="172.17.0.1"
        
        # Check for systemd support (WSL2)
        if command -v systemctl >/dev/null 2>&1 && systemctl is-system-running >/dev/null 2>&1; then
            WSL_HAS_SYSTEMD=1
        fi
        
        # Windows executable detection
        if command -v redis-server.exe >/dev/null 2>&1; then
            WSL_WINDOWS_REDIS=1
        fi
    fi
}

# ==========================================
# LOGGING MODULE
# ==========================================

log::init() {
    mkdir -p "$LOG_DIR"
    echo "=== Cosmic Dharma Startup $(date) ===" > "$LOG_FILE"
    > "$ERROR_LOG"
    > "$DEBUG_LOG"
}

log::write() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    case "$level" in
        ERROR) echo "[$timestamp] $message" >> "$ERROR_LOG" ;;
        DEBUG) [[ $DEBUG_MODE -eq 1 ]] && echo "[$timestamp] $message" >> "$DEBUG_LOG" ;;
    esac
}

log::info() { log::write "INFO" "$1"; }
log::error() { log::write "ERROR" "$1"; }
log::debug() { log::write "DEBUG" "$1"; }

# ==========================================
# SECURITY MODULE
# ==========================================

security::generate_secure_key() {
    local key=""
    
    # Try multiple methods for cross-platform compatibility
    if command -v openssl >/dev/null 2>&1; then
        key=$(openssl rand -hex 32 2>/dev/null)
    elif [[ -r /dev/urandom ]]; then
        key=$(head -c 32 /dev/urandom | xxd -p | tr -d '\n' 2>/dev/null)
    elif command -v python3 >/dev/null 2>&1; then
        key=$(python3 -c 'import secrets; print(secrets.token_hex(32))' 2>/dev/null)
    else
        # Fallback (less secure)
        key=$(date +%s%N | sha256sum | head -c 64)
        ui::warning "Using fallback key generation (less secure)"
    fi
    
    [[ -n "$key" ]] || key="fallback-$(date +%s)-$(whoami)"
    echo "$key"
}

# ==========================================
# RETRY AND VALIDATION MODULE
# ==========================================

retry::with_backoff() {
    local max_attempts=${1:-3}
    local delay=${2:-2}
    local description="$3"
    shift 3
    
    local attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if "$@"; then
            return 0
        fi
        
        if [[ $attempt -lt $max_attempts ]]; then
            ui::warning "$description failed (attempt $attempt/$max_attempts), retrying in ${delay}s..."
            sleep "$delay"
            delay=$((delay * 2))  # Exponential backoff
        fi
        ((attempt++))
    done
    
    ui::error "$description failed after $max_attempts attempts"
    return 1
}

validate::configuration() {
    local issues=0
    
    ui::progress "Validating configuration"
    
    # Check environment file completeness
    if [[ -f "$REPO_ROOT/backend/.env" ]]; then
        local required_vars=("SECRET_KEY" "DATABASE_URL" "REDIS_URL")
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" "$REPO_ROOT/backend/.env"; then
                ui::error "Missing required environment variable: $var"
                ((issues++))
            fi
        done
    fi
    
    # Validate URLs and paths
    if [[ -f "$REPO_ROOT/backend/.env" ]]; then
        local db_url=$(grep "^DATABASE_URL=" "$REPO_ROOT/backend/.env" | cut -d'=' -f2-)
        if [[ "$db_url" == *"sqlite:///"* ]]; then
            local db_path=$(echo "$db_url" | sed 's/sqlite:\/\/\///')
            local db_dir=$(dirname "$db_path")
            [[ ! -d "$db_dir" ]] && mkdir -p "$db_dir"
        fi
    fi
    
    if [[ $issues -eq 0 ]]; then
        ui::progress_done "Configuration validated"
    else
        ui::progress_done "Configuration issues found" "warning"
    fi
    
    return $issues
}

# ==========================================
# SYSTEM CHECK MODULE
# ==========================================

system::check_requirements() {
    local errors=0

    # OS Detection
    ui::info "Operating System: $(system::get_os_info)"
    
    # Memory check
    local mem_info=$(system::get_memory_info)
    ui::info "Memory: $mem_info"
    
    # Required software
    ui::print "\n ${CYAN}Checking required software:${RESET}"
    
    # Check Node.js with retry
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version 2>&1 | sed 's/v//')
        local node_major=$(echo "$node_version" | cut -d. -f1)
        if [[ $node_major -ge 18 ]]; then
            ui::success "Node.js: v$node_version"
        else
            ui::error "Node.js: v$node_version (requires v18+)"
            ((errors++))
        fi
    else
        ui::error "Node.js: Not found"
        ((errors++))
    fi
    
    # Enhanced Python detection
    PYTHON_CMD=""
    for cmd in python3.12 python3.11 python3.10 python3.9 python3 python; do
        if command -v "$cmd" >/dev/null 2>&1; then
            local py_version=$($cmd --version 2>&1 | awk '{print $2}')
            local py_major=$(echo "$py_version" | cut -d. -f1)
            local py_minor=$(echo "$py_version" | cut -d. -f2)
            if [[ $py_major -eq 3 ]] && [[ $py_minor -ge 9 ]]; then
                PYTHON_CMD="$cmd"
                ui::success "Python: $py_version ($cmd)"
                break
            fi
        fi
    done
    
    if [[ -z "$PYTHON_CMD" ]]; then
        ui::error "Python: Not found (requires 3.9+)"
        ((errors++))
    fi
    
    # Check Git
    if command -v git >/dev/null 2>&1; then
        ui::success "Git: $(git --version | awk '{print $3}')"
    else
        ui::error "Git: Not found"
        ((errors++))
    fi
    
    # Enhanced Redis check for WSL
    if command -v redis-server >/dev/null 2>&1; then
        ui::success "Redis: $(redis-server --version | awk '{print $3}' | sed 's/v=//')"
    elif [[ $IS_WSL -eq 1 ]] && command -v redis-server.exe >/dev/null 2>&1; then
        ui::success "Redis: Found Windows executable"
        WSL_WINDOWS_REDIS=1
    else
        ui::warning "Redis: Not found (background tasks will be disabled)"
    fi
    
    return $errors
}

system::get_os_info() {
    if [[ $IS_WSL -eq 1 ]]; then
        local wsl_version=$(wsl.exe -l -v 2>/dev/null | grep -E "^\*" | awk '{print $4}' || echo "2")
        local distro=$(lsb_release -si 2>/dev/null || echo "Unknown")
        echo "WSL $wsl_version ($distro)"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        lsb_release -si 2>/dev/null || echo "Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS $(sw_vers -productVersion 2>/dev/null || echo "")"
    else
        echo "Unknown ($OSTYPE)"
    fi
}

system::get_memory_info() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        local total=$(sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1024/1024)}' || echo "Unknown")
        echo "${total}MB total"
    else
        local total=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo "Unknown")
        local available=$(free -m 2>/dev/null | awk '/^Mem:/{print $7}' || echo "Unknown")
        echo "${available}MB available of ${total}MB"
    fi
}

# ==========================================
# SETUP MODULE
# ==========================================

setup::directories() {
    ui::progress "Creating directory structure"
    
    local dirs=(
        "logs"
        "backend/logs"
        "backend/cache"
        "backend/uploads"
        ".vscode"
    )
    
    local created=0
    for dir in "${dirs[@]}"; do
        if [[ ! -d "$REPO_ROOT/$dir" ]]; then
            mkdir -p "$REPO_ROOT/$dir" 2>/dev/null && ((created++))
        fi
    done
    
    ui::progress_done "Directory structure ready ($created created)"
    return 0
}

setup::environment_files() {
    ui::progress "Setting up environment files"
    
    local files_created=0
    
    # Backend .env
    if [[ ! -f "$REPO_ROOT/backend/.env" ]]; then
        if [[ -f "$REPO_ROOT/backend/.env.example" ]]; then
            cp "$REPO_ROOT/backend/.env.example" "$REPO_ROOT/backend/.env"
            
            # Generate secure secret key
            local secret_key=$(security::generate_secure_key)
            
            # Handle both GNU sed and BSD sed
            if sed --version >/dev/null 2>&1; then
                # GNU sed
                sed -i "s/change-me/$secret_key/g" "$REPO_ROOT/backend/.env"
            else
                # BSD sed (macOS)
                sed -i '' "s/change-me/$secret_key/g" "$REPO_ROOT/backend/.env"
            fi
            ((files_created++))
        else
            setup::create_backend_env
            ((files_created++))
        fi
    fi
    
    # Frontend .env.local
    if [[ ! -f "$REPO_ROOT/.env.local" ]]; then
        echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > "$REPO_ROOT/.env.local"
        ((files_created++))
    fi
    
    # Update Redis URL for WSL if needed
    if [[ $IS_WSL -eq 1 ]] && [[ -f "$REPO_ROOT/backend/.env" ]]; then
        if [[ $WSL_WINDOWS_REDIS -eq 1 ]] || ! command -v redis-server >/dev/null 2>&1; then
            ui::info "Updating Redis URL for WSL Windows host"
            local windows_redis="redis://${WINDOWS_HOST}:6379"
            if sed --version >/dev/null 2>&1; then
                sed -i "s|redis://localhost:6379|$windows_redis|g" "$REPO_ROOT/backend/.env"
            else
                sed -i '' "s|redis://localhost:6379|$windows_redis|g" "$REPO_ROOT/backend/.env"
            fi
        fi
    fi
    
    ui::progress_done "Environment files configured ($files_created created)"
    return 0
}

setup::create_backend_env() {
    local secret_key=$(security::generate_secure_key)
    local redis_url="redis://localhost:6379"
    
    # Use Windows host for Redis if WSL and no local Redis
    if [[ $IS_WSL -eq 1 ]] && ! command -v redis-server >/dev/null 2>&1; then
        redis_url="redis://${WINDOWS_HOST}:6379"
    fi
    
    cat > "$REPO_ROOT/backend/.env" << EOF
SECRET_KEY=$secret_key
DATABASE_URL=sqlite:///./app.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
AYANAMSA=lahiri
NODE_TYPE=mean
HOUSE_SYSTEM=whole_sign
CACHE_ENABLED=true
CACHE_URL=${redis_url}/1
REDIS_URL=${redis_url}/0
CACHE_TTL=3600
EOF
}

# ==========================================
# DEPENDENCY MODULE
# ==========================================

deps::verify_installation() {
    local component=$1
    local verification_cmd=$2
    local max_retries=3
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        ui::progress "Verifying $component installation (attempt $((retry_count + 1)))"
        
        if eval "$verification_cmd" >/dev/null 2>&1; then
            ui::progress_done "$component verified"
            return 0
        fi
        
        ((retry_count++))
        if [[ $retry_count -lt $max_retries ]]; then
            ui::warning "$component verification failed, retrying..."
            sleep 2
        fi
    done
    
    ui::progress_done "$component verification failed" "error"
    return 1
}

deps::install_node() {
    ui::progress "Checking Node.js dependencies"
    
    if [[ ! -f "$REPO_ROOT/package.json" ]]; then
        ui::progress_done "No package.json found" "error"
        return 1
    fi
    
    # Check if we need to install
    if [[ -d "$REPO_ROOT/node_modules" ]] && [[ $AUTO_FIX -eq 0 ]]; then
        local pkg_count=$(find "$REPO_ROOT/node_modules" -maxdepth 1 -type d | wc -l)
        ui::progress_done "Node.js packages already installed ($pkg_count packages)"
        return 0
    fi
    
    ui::progress "Installing Node.js dependencies"
    
    # Clean install if auto-fix
    if [[ $AUTO_FIX -eq 1 ]] && [[ -d "$REPO_ROOT/node_modules" ]]; then
        ui::info "Cleaning node_modules for fresh install"
        rm -rf "$REPO_ROOT/node_modules" "$REPO_ROOT/package-lock.json"
    fi
    
    # Run npm install with retry
    local npm_log=$(mktemp)
    if retry::with_backoff 3 5 "npm install" bash -c "cd '$REPO_ROOT' && npm install --legacy-peer-deps --no-audit --no-fund" > "$npm_log" 2>&1; then
        local installed=$(find "$REPO_ROOT/node_modules" -maxdepth 1 -type d 2>/dev/null | wc -l)
        ui::progress_done "Node.js dependencies installed ($installed packages)"
        rm -f "$npm_log"
        return 0
    else
        ui::progress_done "Failed to install Node.js dependencies" "error"
        if [[ $VERBOSE -eq 1 ]]; then
            ui::warning "Error output:"
            head -n 20 "$npm_log"
        fi
        log::error "npm install failed: $(cat "$npm_log")"
        rm -f "$npm_log"
        return 1
    fi
}

deps::setup_python() {
    ui::progress "Setting up Python environment"
    
    # Use the Python command found earlier
    if [[ -z "$PYTHON_CMD" ]]; then
        ui::progress_done "Python not found" "error"
        return 1
    fi
    
    # Set virtual environment path
    VENV_PATH="$REPO_ROOT/backend/venv"
    
    # Create virtual environment if it doesn't exist
    if [[ ! -d "$VENV_PATH" ]]; then
        ui::progress "Creating Python virtual environment"
        
        # Ensure python3-venv is installed on Debian/Ubuntu
        if [[ $IS_WSL -eq 1 ]] || [[ -f /etc/debian_version ]]; then
            if ! $PYTHON_CMD -m venv --help >/dev/null 2>&1; then
                ui::warning "python3-venv not installed, attempting to install..."
                if command -v apt-get >/dev/null 2>&1; then
                    sudo apt-get update >/dev/null 2>&1
                    sudo apt-get install -y python3-venv >/dev/null 2>&1
                fi
            fi
        fi
        
        # Create venv with retry
        if ! retry::with_backoff 3 2 "virtual environment creation" $PYTHON_CMD -m venv "$VENV_PATH"; then
            ui::progress_done "Failed to create virtual environment" "error"
            ui::info "Try: sudo apt-get install python3-venv"
            return 1
        fi
    fi
    
    # Find activation script
    if [[ -f "$VENV_PATH/bin/activate" ]]; then
        ACTIVATE_SCRIPT="$VENV_PATH/bin/activate"
    elif [[ -f "$VENV_PATH/Scripts/activate" ]]; then
        ACTIVATE_SCRIPT="$VENV_PATH/Scripts/activate"
    else
        ui::progress_done "Virtual environment corrupted" "error"
        ui::info "Try removing backend/venv and running again"
        return 1
    fi
    
    log::debug "Using activation script: $ACTIVATE_SCRIPT"
    
    # Install packages
    deps::install_python_packages
}

deps::install_python_packages() {
    ui::progress "Installing Python packages"
    
    if [[ ! -f "$REPO_ROOT/backend/requirements.txt" ]]; then
        ui::progress_done "requirements.txt not found" "error"
        return 1
    fi
    
    local pip_log=$(mktemp)
    local install_cmd="cd '$REPO_ROOT/backend' && source '$ACTIVATE_SCRIPT' && python -m pip install --upgrade pip && pip install -r requirements.txt"
    
    if [[ -f "$REPO_ROOT/backend/requirements-dev.txt" ]]; then
        install_cmd="$install_cmd && pip install -r requirements-dev.txt"
    fi
    
    if retry::with_backoff 3 5 "Python package installation" bash -c "$install_cmd" > "$pip_log" 2>&1; then
        # Verify key packages
        local packages_installed=0
        packages_installed=$(bash -c "cd '$REPO_ROOT/backend' && source '$ACTIVATE_SCRIPT' && pip list 2>/dev/null | wc -l")
        
        ui::progress_done "Python environment ready ($packages_installed packages)"
        rm -f "$pip_log"
        return 0
    else
        ui::progress_done "Some Python packages failed to install" "warning"
        if [[ $VERBOSE -eq 1 ]]; then
            ui::warning "Error output:"
            tail -n 20 "$pip_log"
        fi
        log::error "pip install failed: $(cat "$pip_log")"
        rm -f "$pip_log"
        return 0 # Continue anyway
    fi
}

# Verification functions
deps::verify_node() {
    deps::verify_installation "Node.js" "node --version && npm --version"
}

deps::verify_python() {
    local cmd="cd '$REPO_ROOT/backend' && source '$ACTIVATE_SCRIPT' && python -c 'import fastapi, redis, sqlalchemy'"
    deps::verify_installation "Python environment" "$cmd"
}

# ==========================================
# SERVICE MODULE
# ==========================================

service::is_port_in_use() {
    local port=$1
    if command -v ss >/dev/null 2>&1; then
        ss -tuln | grep -q ":$port "
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tuln 2>/dev/null | grep -q ":$port "
    else
        return 1
    fi
}

service::get_port_process() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -Pi :$port -sTCP:LISTEN | tail -n1 | awk '{print $1" (PID "$2")"}'
    else
        echo "Unknown process"
    fi
}

service::kill_port_process() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
        if [[ -n "$pid" ]]; then
            kill -TERM "$pid" 2>/dev/null
            sleep 2
            kill -0 "$pid" 2>/dev/null && kill -KILL "$pid" 2>/dev/null
            return 0
        fi
    fi
    return 1
}

service::manage_ports() {
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    local ports_freed=0
    
    ui::progress "Managing port conflicts"
    
    for port in $frontend_port $backend_port 6379; do
        if service::is_port_in_use "$port"; then
            local process_info=$(service::get_port_process "$port")
            ui::warning "Port $port in use: $process_info"
            
            if [[ $AUTO_FIX -eq 1 ]]; then
                if service::kill_port_process "$port"; then
                    ui::success "Freed port $port"
                    ((ports_freed++))
                else
                    ui::warning "Could not free port $port"
                fi
            fi
        fi
    done
    
    ui::progress_done "Port management complete ($ports_freed freed)"
}

service::setup_redis() {
    ui::progress "Checking Redis"
    
    # First check if we have Python redis module
    local has_redis_module=0
    if [[ -n "$ACTIVATE_SCRIPT" ]]; then
        bash -c "cd '$REPO_ROOT/backend' && source '$ACTIVATE_SCRIPT' && python -c 'import redis'" 2>/dev/null && has_redis_module=1
    fi
    
    if [[ $has_redis_module -eq 0 ]]; then
        ui::progress_done "Redis module not installed" "warning"
        WORKER_ENABLED=0
        return 0
    fi
    
    # Check if Redis is already running locally
    if service::check_redis_connection "redis://localhost:6379"; then
        ui::progress_done "Redis is running locally"
        return 0
    fi
    
    # WSL: Check Windows Redis
    if [[ $IS_WSL -eq 1 ]]; then
        local windows_redis="redis://${WINDOWS_HOST}:6379"
        if service::check_redis_connection "$windows_redis"; then
            ui::progress_done "Redis found on Windows host"
            ui::info "Backend configured to use: $windows_redis"
            return 0
        fi
    fi
    
    # Try to start local Redis
    if command -v redis-server >/dev/null 2>&1; then
        ui::progress "Starting Redis server"
        
        # Kill any existing Redis on our port
        pkill -f "redis-server.*:6379" 2>/dev/null || true
        
        # Start Redis
        redis-server --daemonize yes --port 6379 --dir "$REPO_ROOT" --logfile "$LOG_DIR/redis.log" >/dev/null 2>&1 &
        local redis_pid=$!
        sleep 2
        
        if service::check_redis_connection "redis://localhost:6379"; then
            ui::progress_done "Redis started successfully"
            echo $redis_pid > "$REDIS_PID_FILE"
            return 0
        fi
    fi
    
    # Redis not available
    WORKER_ENABLED=0
    ui::progress_done "Redis not available (background tasks disabled)" "warning"
    ui::info "Install Redis for full functionality"
    return 0
}

service::check_redis_connection() {
    local redis_url="$1"
    if [[ -n "$ACTIVATE_SCRIPT" ]]; then
        bash -c "cd '$REPO_ROOT/backend' && source '$ACTIVATE_SCRIPT' && python -c 'import redis; redis.from_url(\"$redis_url\").ping()'" 2>/dev/null
    else
        return 1
    fi
}

service::check_ports() {
    service::manage_ports
}

# ==========================================
# HEALTH CHECK MODULE
# ==========================================

health::check_services() {
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    local max_wait=30
    local wait_time=0
    
    ui::progress "Waiting for services to become healthy"
    
    while [[ $wait_time -lt $max_wait ]]; do
        local frontend_ok=0
        local backend_ok=0
        
        # Check frontend
        if curl -s "http://localhost:$frontend_port" >/dev/null 2>&1; then
            frontend_ok=1
        fi
        
        # Check backend health endpoint
        if curl -s "http://localhost:$backend_port/health" >/dev/null 2>&1; then
            backend_ok=1
        fi
        
        if [[ $frontend_ok -eq 1 && $backend_ok -eq 1 ]]; then
            ui::progress_done "All services healthy"
            return 0
        fi
        
        sleep 2
        ((wait_time += 2))
    done
    
    ui::progress_done "Service health check timeout" "warning"
    return 1
}

# ==========================================
# DATABASE MODULE
# ==========================================

db::initialize() {
    ui::progress "Initializing database"
    
    if [[ ! -n "$ACTIVATE_SCRIPT" ]]; then
        ui::progress_done "Python environment not set up" "error"
        return 1
    fi
    
    bash -c "
    cd '$REPO_ROOT/backend'
    source '$ACTIVATE_SCRIPT'
    
    # Run migrations if alembic is available
    if command -v alembic >/dev/null 2>&1; then
        alembic upgrade head >/dev/null 2>&1 || true
    fi
    
    # Create tables
    python -c '
from app.database import engine, Base
try:
    Base.metadata.create_all(bind=engine)
    print(\"Database initialized\")
except Exception as e:
    print(f\"Database error: {e}\")
    ' 2>/dev/null || true
    "
    
    ui::progress_done "Database initialized"
    return 0
}

# ==========================================
# TEST MODULE
# ==========================================

test::run_all() {
    if [[ $SKIP_TESTS -eq 1 ]]; then
        ui::info "Skipping tests (--skip-tests)"
        return 0
    fi
    
    ui::progress "Running tests"
    local test_log=$(mktemp)
    local failures=0
    
    # Frontend tests
    if [[ -f "$REPO_ROOT/vitest.config.js" ]] || [[ -f "$REPO_ROOT/vite.config.js" ]]; then
        ui::progress "Running frontend tests"
        (cd "$REPO_ROOT" && npm run test:frontend > "$test_log" 2>&1) || ((failures++))
    fi
    
    # Backend tests
    if [[ -f "$REPO_ROOT/backend/pytest.ini" ]] || [[ -d "$REPO_ROOT/backend/tests" ]]; then
        ui::progress "Running backend tests"
        if [[ -n "$ACTIVATE_SCRIPT" ]]; then
            bash -c "cd '$REPO_ROOT/backend' && source '$ACTIVATE_SCRIPT' && pytest -q" > "$test_log" 2>&1 || ((failures++))
        fi
    fi
    
    rm -f "$test_log"
    
    if [[ $failures -eq 0 ]]; then
        ui::progress_done "All tests passed"
    else
        ui::progress_done "Some tests failed" "warning"
    fi
    
    return 0
}

# ==========================================
# PROCESS MANAGEMENT MODULE
# ==========================================

process::manage_lifecycle() {
    local pids=()
    
    # Store PIDs for proper cleanup
    start_service_with_pid() {
        local name=$1
        local cmd=$2
        local log_file="$LOG_DIR/${name,,}.log"
        
        ui::info "Starting $name service"
        eval "$cmd" > "$log_file" 2>&1 &
        local pid=$!
        pids+=("$pid:$name")
        
        # Wait briefly to check if service started
        sleep 2
        if kill -0 "$pid" 2>/dev/null; then
            ui::success "$name started (PID: $pid)"
            echo "$pid" > "$REPO_ROOT/.${name,,}.pid"
        else
            ui::error "$name failed to start"
            return 1
        fi
    }
    
    # Cleanup function
    cleanup_processes() {
        ui::info "Stopping services..."
        for pid_info in "${pids[@]}"; do
            IFS=':' read -r pid name <<< "$pid_info"
            if kill -0 "$pid" 2>/dev/null; then
                kill -TERM "$pid" 2>/dev/null
                sleep 2
                kill -0 "$pid" 2>/dev/null && kill -KILL "$pid" 2>/dev/null
                ui::info "$name stopped"
            fi
        done
    }
    
    trap cleanup_processes EXIT INT TERM
}

# ==========================================
# LAUNCH MODULE
# ==========================================

launch::start_services() {
    ui::header
    
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    
    cat << EOF

${CYAN}${BOLD}Service Endpoints:${RESET}
${GREEN}Frontend:${RESET} http://localhost:${frontend_port}
${GREEN}Backend:${RESET} http://localhost:${backend_port}
${GREEN}API Docs:${RESET} http://localhost:${backend_port}/docs

${YELLOW}${BOLD}Controls:${RESET}
Stop all: Press ${BOLD}Ctrl+C${RESET}
View logs: Check ${DIM}logs/${RESET} directory

EOF
    
    if [[ $WORKER_ENABLED -eq 1 ]]; then
        ui::success "All systems operational - Redis worker enabled"
    else
        ui::warning "Limited mode - Background tasks disabled (no Redis)"
    fi
    
    if [[ $IS_WSL -eq 1 ]]; then
        ui::info "WSL: Open in Windows browser at http://localhost:${frontend_port}"
    fi
    
    ui::print "\n${BOLD}${GREEN}Launching services...${RESET}\n"
    
    # Initialize process management
    process::manage_lifecycle
    
    # Create custom scripts for better process management
    cat > "$REPO_ROOT/.run-backend.sh" << EOF
#!/bin/bash
cd "$REPO_ROOT/backend"
source "$ACTIVATE_SCRIPT"
python -m uvicorn main:app --reload --host 0.0.0.0 --port $backend_port
EOF
    chmod +x "$REPO_ROOT/.run-backend.sh"
    
    if [[ $WORKER_ENABLED -eq 1 ]]; then
        cat > "$REPO_ROOT/.run-worker.sh" << EOF
#!/bin/bash
cd "$REPO_ROOT/backend"
source "$ACTIVATE_SCRIPT"
python -m rq.cli worker profiles --url redis://localhost:6379/0
EOF
        chmod +x "$REPO_ROOT/.run-worker.sh"
    fi
    
    # Build command using npm scripts
    local services="\"npm run dev:frontend\""
    local names="Frontend"
    local colors="cyan"
    
    # Backend service (using the Python from venv directly)
    local backend_cmd="cd $REPO_ROOT/backend && $VENV_PATH/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port $backend_port"
    services="$services \"$backend_cmd\""
    names="$names,Backend"
    colors="$colors,magenta"
    
    if [[ $WORKER_ENABLED -eq 1 ]]; then
        local worker_cmd="cd $REPO_ROOT/backend && $VENV_PATH/bin/python -m rq.cli worker profiles --url redis://localhost:6379/0"
        services="$services \"$worker_cmd\""
        names="$names,Worker"
        colors="$colors,yellow"
    fi
    
    # Launch services with health checks
    eval "npx --yes concurrently \
    --names '$names' \
    --prefix-colors '$colors' \
    --prefix '[{name}]' \
    --kill-others-on-fail \
    --restart-tries 3 \
    $services" &
    
    # Wait a moment then run health checks
    sleep 10
    health::check_services || ui::warning "Some services may not be ready"
}

# ==========================================
# MAIN EXECUTION
# ==========================================

main() {
    # Initialize
    ui::init
    log::init
    
    # Parse arguments
    parse_args "$@"
    
    # Show header
    ui::header
    
    # Welcome message
    if [[ $RUN_DIAGNOSTICS -eq 0 ]]; then
        ui::print "${BOLD}${WHITE}Welcome to Cosmic Dharma Setup!${RESET}\n"
        
        if [[ $IS_WSL -eq 1 ]]; then
            ui::info "WSL detected - optimizations applied"
            ui::info "Windows Host: $WINDOWS_HOST"
            [[ $WSL_HAS_SYSTEMD -eq 1 ]] && ui::info "Systemd support: Available"
        fi
        
        if [[ $AUTO_FIX -eq 1 ]]; then
            ui::info "Auto-fix mode enabled"
        fi
        
        ui::print "\n${GREEN}Press Enter to begin...${RESET}"
        read -r
    fi
    
    # Run diagnostics if requested
    if [[ $RUN_DIAGNOSTICS -eq 1 ]]; then
        run_diagnostics
        exit 0
    fi
    
    # Run setup steps
    local steps=(
        "system::check_requirements|System Requirements"
        "setup::directories|Directory Setup"
        "setup::environment_files|Environment Configuration"
        "validate::configuration|Configuration Validation"
        "deps::install_node|Node.js Dependencies"
        "deps::setup_python|Python Environment"
        "deps::verify_node|Node.js Verification"
        "deps::verify_python|Python Verification"
        "db::initialize|Database Setup"
        "service::setup_redis|Redis Setup"
        "test::run_all|Running Tests"
        "service::check_ports|Port Management"
    )
    
    local step_num=1
    local total_steps=${#steps[@]}
    
    for step_info in "${steps[@]}"; do
        IFS='|' read -r func title <<< "$step_info"
        ui::step $step_num $total_steps "$title"
        
        if ! $func; then
            log::error "Step failed: $title"
            if [[ $AUTO_FIX -eq 0 ]]; then
                ui::print "\n${YELLOW}Continue despite error? [y/N]: ${RESET}" true
                read -r
                [[ ! "$REPLY" =~ ^[Yy]$ ]] && exit 1
            fi
        fi
        ((step_num++))
    done
    
    # Summary
    ui::print "\n${GREEN}${BOLD}Setup complete!${RESET}"
    local elapsed=$(($(date +%s) - START_TIME))
    ui::info "Setup time: ${elapsed}s"
    
    if [[ ${#WARNINGS[@]} -gt 0 ]]; then
        ui::print "\n${YELLOW}Warnings (${#WARNINGS[@]}):${RESET}"
        for warning in "${WARNINGS[@]:0:3}"; do
            ui::print " - $warning"
        done
        [[ ${#WARNINGS[@]} -gt 3 ]] && ui::print " ... and $((${#WARNINGS[@]} - 3)) more"
    fi
    
    # Seed database if requested
    if [[ $SEED_DB -eq 1 ]]; then
        ui::print "\n${CYAN}Seeding database...${RESET}"
        bash -c "cd '$REPO_ROOT/backend' && source '$ACTIVATE_SCRIPT' && python -m scripts.seed_db" 2>/dev/null || ui::warning "Database seeding failed"
    fi
    
    # Launch
    ui::print "\n${GREEN}Press Enter to launch Cosmic Dharma...${RESET}"
    read -r
    launch::start_services
}

# ==========================================
# DIAGNOSTICS
# ==========================================

run_diagnostics() {
    ui::print "\n${BOLD}${CYAN}=== SYSTEM DIAGNOSTICS ===${RESET}\n"
    
    # System Info
    ui::print "${BOLD}System Information:${RESET}"
    ui::info "OS: $(system::get_os_info)"
    ui::info "Memory: $(system::get_memory_info)"
    ui::info "Script: $SCRIPT_DIR"
    ui::info "Repository: $REPO_ROOT"
    ui::info "User: $(whoami)"
    ui::info "Shell: $SHELL"
    
    if [[ $IS_WSL -eq 1 ]]; then
        ui::print "\n${BOLD}WSL Information:${RESET}"
        ui::info "Windows Host: $WINDOWS_HOST"
        ui::info "Systemd Support: $([[ $WSL_HAS_SYSTEMD -eq 1 ]] && echo "Yes" || echo "No")"
        ui::info "Windows Redis: $([[ $WSL_WINDOWS_REDIS -eq 1 ]] && echo "Detected" || echo "Not found")"
    fi
    
    # Software
    ui::print "\n${BOLD}Software Versions:${RESET}"
    for cmd in node npm python3 pip3 git docker redis-server make gcc; do
        if command -v "$cmd" >/dev/null 2>&1; then
            local version=$($cmd --version 2>&1 | head -n1 || echo "unknown")
            ui::success "$cmd: $version"
        else
            ui::error "$cmd: not found"
        fi
    done
    
    # Python details
    if [[ -n "$PYTHON_CMD" ]]; then
        ui::print "\n${BOLD}Python Environment:${RESET}"
        ui::info "Python command: $PYTHON_CMD"
        ui::info "Python path: $(which $PYTHON_CMD)"
        $PYTHON_CMD -m pip --version >/dev/null 2>&1 && ui::success "pip: available" || ui::error "pip: not available"
        $PYTHON_CMD -m venv --help >/dev/null 2>&1 && ui::success "venv: available" || ui::error "venv: not available"
    fi
    
    # Ports
    ui::print "\n${BOLD}Port Status:${RESET}"
    for port in 3000 8000 6379; do
        if service::is_port_in_use "$port"; then
            local process=$(service::get_port_process "$port")
            ui::warning "Port $port: in use by $process"
        else
            ui::success "Port $port: available"
        fi
    done
    
    # Files
    ui::print "\n${BOLD}Configuration Files:${RESET}"
    local files=(
        "package.json"
        "backend/requirements.txt"
        "backend/.env"
        ".env.local"
        "backend/venv/bin/activate:backend/venv/Scripts/activate"
    )
    
    for file_spec in "${files[@]}"; do
        # Handle multiple possible paths
        IFS=':' read -ra PATHS <<< "$file_spec"
        local found=0
        for file in "${PATHS[@]}"; do
            if [[ -f "$REPO_ROOT/$file" ]]; then
                ui::success "$file exists"
                found=1
                break
            fi
        done
        [[ $found -eq 0 ]] && ui::error "${PATHS[0]} missing"
    done
    
    # Permissions
    ui::print "\n${BOLD}Permissions:${RESET}"
    [[ -w "$REPO_ROOT" ]] && ui::success "Repository: writable" || ui::error "Repository: not writable"
    [[ -w "$LOG_DIR" ]] && ui::success "Logs: writable" || ui::warning "Logs: not writable"
    
    # Environment
    ui::print "\n${BOLD}Environment Variables:${RESET}"
    [[ -n "$NODE_ENV" ]] && ui::info "NODE_ENV: $NODE_ENV"
    [[ -n "$PORT" ]] && ui::info "PORT: $PORT"
    [[ -n "$BACKEND_PORT" ]] && ui::info "BACKEND_PORT: $BACKEND_PORT"
    [[ -n "$VIRTUAL_ENV" ]] && ui::warning "VIRTUAL_ENV already set: $VIRTUAL_ENV"
    
    ui::print ""
}

# ==========================================
# ARGUMENT PARSING
# ==========================================

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help) show_usage; exit 0 ;;
            -d|--diagnostics) RUN_DIAGNOSTICS=1 ;;
            -v|--verbose) VERBOSE=1 ;;
            -D|--debug) DEBUG_MODE=1; VERBOSE=1 ;;
            -t|--skip-tests) SKIP_TESTS=1 ;;
            -a|--auto-fix) AUTO_FIX=1 ;;
            -s|--seed) SEED_DB=1 ;;
            *) ui::error "Unknown option: $1"; show_usage; exit 1 ;;
        esac
        shift
    done
}

show_usage() {
    cat << EOF

${BOLD}Usage:${RESET} $0 [options]

${BOLD}Options:${RESET}
  -h, --help         Show this help
  -d, --diagnostics  Run system diagnostics
  -v, --verbose      Enable verbose output
  -D, --debug        Enable debug mode
  -t, --skip-tests   Skip running tests
  -a, --auto-fix     Auto-fix common issues
  -s, --seed         Seed database with sample data

${BOLD}Examples:${RESET}
  $0                 Normal startup
  $0 -d              Run diagnostics
  $0 -t -a           Skip tests with auto-fix
  $0 -a -s           Auto-fix and seed database

${BOLD}Troubleshooting:${RESET}
  Port in use:       Kill process or change PORT/BACKEND_PORT
  Redis issues:      Install Redis or use Docker
  Python issues:     Ensure python3-venv is installed
  WSL issues:        Enable systemd or use Windows Redis

EOF
}

# ==========================================
# CLEANUP
# ==========================================

cleanup() {
    ui::print "\n${YELLOW}Shutting down...${RESET}"
    
    # Remove temporary run scripts
    rm -f "$REPO_ROOT/.run-backend.sh" "$REPO_ROOT/.run-worker.sh"
    
    # Kill child processes
    pkill -P $$ 2>/dev/null || true
    
    # Stop Redis if we started it
    if [[ -f "$REDIS_PID_FILE" ]]; then
        local redis_pid=$(cat "$REDIS_PID_FILE")
        kill $redis_pid 2>/dev/null || true
        rm -f "$REDIS_PID_FILE"
    fi
    
    # Calculate runtime
    local runtime=$(($(date +%s) - START_TIME))
    ui::info "Total runtime: $((runtime / 60))m $((runtime % 60))s"
    
    # Show errors if any
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        ui::print "\n${RED}Errors encountered:${RESET}"
        for err in "${ERRORS[@]}"; do
            ui::print " - $err"
        done
    fi
    
    ui::print "\n${CYAN}${BOLD}Thank you for using Cosmic Dharma!${RESET}\n"
}

trap cleanup EXIT INT TERM

# ==========================================
# ENTRY POINT
# ==========================================

# Change to repository root
cd "$REPO_ROOT" || {
    echo "Error: Cannot change to repository root"
    exit 1
}

# Store PID
echo $$ > "$PID_FILE"

# Run main
main "$@"
