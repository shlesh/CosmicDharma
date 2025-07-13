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
declare -g VERBOSE=0
declare -g DEBUG_MODE=0
declare -g SKIP_TESTS=0
declare -g AUTO_FIX=0
declare -g SEED_DB=0
declare -g RUN_DIAGNOSTICS=0

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
    
    # Detect WSL
    if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null; then
        IS_WSL=1
        export WINDOWS_HOST=$(cat /etc/resolv.conf 2>/dev/null | grep nameserver | awk '{print $2}' || echo "172.17.0.1")
    fi
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
ui::success() { ui::print "  ${GREEN}${CHECK}${RESET} $1"; }
ui::error() { ui::print "  ${RED}${CROSS}${RESET} $1"; ERRORS+=("$1"); }
ui::warning() { ui::print "  ${YELLOW}${WARN}${RESET} $1"; WARNINGS+=("$1"); }
ui::info() { ui::print "  ${CYAN}${INFO}${RESET} $1"; }

# Progress indicator without repetition
ui::progress() {
    local message="$1"
    ui::print "  ${CYAN}${GEAR}${RESET} ${message}..." true
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
    ui::print "                    COSMIC DHARMA"
    ui::print "                Vedic Astrology Platform"
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
    ui::print "\n  ${CYAN}Checking required software:${RESET}"
    
    # Check Node.js
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
    
    # Check Python
    local python_cmd=""
    for cmd in python3 python; do
        if command -v "$cmd" >/dev/null 2>&1; then
            local py_version=$($cmd --version 2>&1 | awk '{print $2}')
            local py_major=$(echo "$py_version" | cut -d. -f1)
            local py_minor=$(echo "$py_version" | cut -d. -f2)
            if [[ $py_major -eq 3 ]] && [[ $py_minor -ge 9 ]]; then
                python_cmd="$cmd"
                ui::success "Python: $py_version"
                break
            fi
        fi
    done
    
    if [[ -z "$python_cmd" ]]; then
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
    
    return $errors
}

system::get_os_info() {
    if [[ $IS_WSL -eq 1 ]]; then
        echo "WSL $(wsl.exe -l -v 2>/dev/null | grep -E "^\*" | awk '{print $4}' || echo "2")"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        lsb_release -si 2>/dev/null || echo "Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS"
    else
        echo "Unknown ($OSTYPE)"
    fi
}

system::get_memory_info() {
    local total=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo "Unknown")
    local available=$(free -m 2>/dev/null | awk '/^Mem:/{print $7}' || echo "Unknown")
    echo "${available}MB available of ${total}MB"
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
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir" 2>/dev/null && ((created++))
        fi
    done
    
    ui::progress_done "Directory structure ready ($created created)"
    return 0
}

setup::environment_files() {
    ui::progress "Setting up environment files"
    
    local files_created=0
    
    # Backend .env
    if [[ ! -f backend/.env ]]; then
        if [[ -f backend/.env.example ]]; then
            cp backend/.env.example backend/.env
            # Generate secure secret key
            local secret_key=$(openssl rand -hex 32 2>/dev/null || python3 -c 'import secrets; print(secrets.token_hex(32))' 2>/dev/null || date +%s | sha256sum | head -c 64)
            sed -i "s/change-me/$secret_key/g" backend/.env 2>/dev/null || \
            sed -i '' "s/change-me/$secret_key/g" backend/.env 2>/dev/null
            ((files_created++))
        else
            setup::create_backend_env
            ((files_created++))
        fi
    fi
    
    # Frontend .env.local
    if [[ ! -f .env.local ]]; then
        echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
        ((files_created++))
    fi
    
    ui::progress_done "Environment files configured ($files_created created)"
    return 0
}

setup::create_backend_env() {
    local secret_key=$(openssl rand -hex 32 2>/dev/null || date +%s | sha256sum | head -c 64)
    
    cat > backend/.env << EOF
SECRET_KEY=$secret_key
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
}

# ==========================================
# DEPENDENCY MODULE
# ==========================================

deps::install_node() {
    ui::progress "Checking Node.js dependencies"
    
    if [[ ! -f package.json ]]; then
        ui::progress_done "No package.json found" "error"
        return 1
    fi
    
    if [[ -d node_modules ]] && [[ $AUTO_FIX -eq 0 ]]; then
        local pkg_count=$(find node_modules -maxdepth 1 -type d | wc -l)
        ui::progress_done "Node.js packages already installed ($pkg_count packages)"
        return 0
    fi
    
    ui::progress "Installing Node.js dependencies"
    
    # Run npm install
    local npm_log=$(mktemp)
    if npm install --legacy-peer-deps --no-audit --no-fund > "$npm_log" 2>&1; then
        local installed=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l)
        ui::progress_done "Node.js dependencies installed ($installed packages)"
        rm -f "$npm_log"
        return 0
    else
        ui::progress_done "Failed to install Node.js dependencies" "error"
        if [[ $VERBOSE -eq 1 ]]; then
            ui::warning "Error output:"
            head -n 10 "$npm_log"
        fi
        rm -f "$npm_log"
        return 1
    fi
}

deps::setup_python() {
    ui::progress "Setting up Python environment"
    
    # Find Python
    local python_cmd=""
    for cmd in python3.12 python3.11 python3.10 python3.9 python3 python; do
        if command -v "$cmd" >/dev/null 2>&1; then
            local version=$($cmd --version 2>&1 | awk '{print $2}')
            local major=$(echo "$version" | cut -d. -f1)
            local minor=$(echo "$version" | cut -d. -f2)
            
            if [[ "$major" -eq 3 ]] && [[ "$minor" -ge 9 ]]; then
                python_cmd="$cmd"
                break
            fi
        fi
    done
    
    if [[ -z "$python_cmd" ]]; then
        ui::progress_done "Python 3.9+ not found" "error"
        return 1
    fi
    
    # Virtual environment
    local venv_path="backend/venv"
    
    if [[ ! -d "$venv_path" ]]; then
        ui::progress "Creating Python virtual environment"
        if ! $python_cmd -m venv "$venv_path" >/dev/null 2>&1; then
            ui::progress_done "Failed to create virtual environment" "error"
            return 1
        fi
    fi
    
    # Determine activation script
    local activate_script=""
    if [[ -f "$venv_path/bin/activate" ]]; then
        activate_script="$venv_path/bin/activate"
    elif [[ -f "$venv_path/Scripts/activate" ]]; then
        activate_script="$venv_path/Scripts/activate"
    else
        ui::progress_done "Virtual environment corrupted" "error"
        return 1
    fi
    
    # Install packages
    ui::progress "Installing Python packages"
    
    if [[ ! -f backend/requirements.txt ]]; then
        ui::progress_done "requirements.txt not found" "error"
        return 1
    fi
    
    (
        cd backend
        source "$activate_script"
        pip install --upgrade pip >/dev/null 2>&1
        pip install -r requirements.txt -r requirements-dev.txt >/dev/null 2>&1
    )
    
    if [[ $? -eq 0 ]]; then
        ui::progress_done "Python environment ready"
        return 0
    else
        ui::progress_done "Some Python packages failed to install" "warning"
        return 0
    fi
}

# ==========================================
# SERVICE MODULE
# ==========================================

service::setup_redis() {
    ui::progress "Checking Redis"
    
    # Check if Redis is already running
    if python3 -c "import redis; redis.from_url('redis://localhost:6379').ping()" 2>/dev/null; then
        ui::progress_done "Redis is running"
        return 0
    fi
    
    # WSL: Check Windows Redis
    if [[ $IS_WSL -eq 1 ]]; then
        local windows_redis="redis://${WINDOWS_HOST}:6379"
        if python3 -c "import redis; redis.from_url('$windows_redis').ping()" 2>/dev/null; then
            ui::progress_done "Redis found on Windows host"
            ui::info "Update backend/.env to use: REDIS_URL=$windows_redis"
            return 0
        fi
    fi
    
    # Try to start local Redis
    if command -v redis-server >/dev/null 2>&1; then
        redis-server --daemonize yes --port 6379 --dir "$REPO_ROOT" >/dev/null 2>&1
        sleep 1
        
        if python3 -c "import redis; redis.from_url('redis://localhost:6379').ping()" 2>/dev/null; then
            ui::progress_done "Redis started"
            return 0
        fi
    fi
    
    # Redis not available
    WORKER_ENABLED=0
    ui::progress_done "Redis not available (background tasks disabled)" "warning"
    return 0
}

service::check_ports() {
    ui::progress "Checking port availability"
    
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    local issues=0
    
    # Check frontend port
    if ! lsof -Pi :$frontend_port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log::debug "Port $frontend_port is available"
    else
        ui::warning "Port $frontend_port is in use"
        ((issues++))
    fi
    
    # Check backend port
    if ! lsof -Pi :$backend_port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log::debug "Port $backend_port is available"
    else
        ui::warning "Port $backend_port is in use"
        ((issues++))
    fi
    
    if [[ $issues -eq 0 ]]; then
        ui::progress_done "All ports available"
    else
        ui::progress_done "Some ports in use" "warning"
    fi
    
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
    if [[ -f vitest.config.js ]] || [[ -f vite.config.js ]]; then
        npm run test:frontend > "$test_log" 2>&1 || ((failures++))
    fi
    
    # Backend tests
    if [[ -f backend/pytest.ini ]] || [[ -d backend/tests ]]; then
        (cd backend && source venv/bin/activate && pytest -q > "$test_log" 2>&1) || ((failures++))
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
# LAUNCH MODULE
# ==========================================

launch::start_services() {
    ui::header
    
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    
    cat << EOF
${CYAN}${BOLD}Service Endpoints:${RESET}
  ${GREEN}Frontend:${RESET}   http://localhost:${frontend_port}
  ${GREEN}Backend:${RESET}    http://localhost:${backend_port}
  ${GREEN}API Docs:${RESET}   http://localhost:${backend_port}/docs

${YELLOW}${BOLD}Controls:${RESET}
  Stop all: Press ${BOLD}Ctrl+C${RESET}

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
    
    # Build command
    local services="\"npm run dev\" \"npm run backend\""
    local names="Frontend,Backend"
    local colors="cyan,magenta"
    
    if [[ $WORKER_ENABLED -eq 1 ]]; then
        services="$services \"npm run worker\""
        names="$names,Worker"
        colors="$colors,yellow"
    fi
    
    # Launch services
    eval "npx --yes concurrently \
        --names '$names' \
        --prefix-colors '$colors' \
        --prefix '[{name}]' \
        --kill-others-on-fail \
        --restart-tries 3 \
        $services"
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
        "deps::install_node|Node.js Dependencies"
        "deps::setup_python|Python Environment"
        "service::setup_redis|Redis Setup"
        "test::run_all|Running Tests"
        "service::check_ports|Port Availability"
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
    if [[ ${#WARNINGS[@]} -gt 0 ]]; then
        ui::print "${YELLOW}${#WARNINGS[@]} warnings occurred${RESET}"
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
    
    # Software
    ui::print "\n${BOLD}Software Versions:${RESET}"
    for cmd in node npm python3 pip3 git docker redis-server; do
        if command -v "$cmd" >/dev/null 2>&1; then
            ui::success "$cmd: installed"
        else
            ui::error "$cmd: not found"
        fi
    done
    
    # Ports
    ui::print "\n${BOLD}Port Status:${RESET}"
    for port in 3000 8000 6379; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            ui::warning "Port $port: in use"
        else
            ui::success "Port $port: available"
        fi
    done
    
    # Files
    ui::print "\n${BOLD}Configuration Files:${RESET}"
    for file in "backend/.env" ".env.local" "package.json" "backend/requirements.txt"; do
        if [[ -f "$file" ]]; then
            ui::success "$file exists"
        else
            ui::error "$file missing"
        fi
    done
    
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
  -h, --help          Show this help
  -d, --diagnostics   Run system diagnostics
  -v, --verbose       Enable verbose output
  -D, --debug         Enable debug mode
  -t, --skip-tests    Skip running tests
  -a, --auto-fix      Auto-fix common issues
  -s, --seed          Seed database

${BOLD}Examples:${RESET}
  $0                  Normal startup
  $0 -d               Run diagnostics
  $0 -t -a            Skip tests with auto-fix

EOF
}

# ==========================================
# CLEANUP
# ==========================================

cleanup() {
    ui::print "\n${YELLOW}Shutting down...${RESET}"
    
    # Kill child processes
    pkill -P $$ 2>/dev/null || true
    
    # Calculate runtime
    local runtime=$(($(date +%s) - START_TIME))
    ui::info "Total runtime: $((runtime / 60))m $((runtime % 60))s"
    
    # Show errors if any
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        ui::print "\n${RED}Errors encountered:${RESET}"
        for err in "${ERRORS[@]}"; do
            ui::print "  - $err"
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

# Run main
main "$@"