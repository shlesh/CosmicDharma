#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# COSMIC DHARMA - UNIFIED STARTUP SCRIPT
# ==========================================

# Terminal colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
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

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$REPO_ROOT/.startup.log"
PID_FILE="$REPO_ROOT/.startup.pid"
REDIS_PID_FILE="$REPO_ROOT/.redis.pid"
WORKER_ENABLED=1
CLEANUP_REGISTERED=0

# Process tracking
declare -a MANAGED_PIDS=()

# ==========================================
# HELPER FUNCTIONS
# ==========================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

print_header() {
    clear
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║   ██████╗ ██████╗ ███████╗███╗   ███╗██╗ ██████╗            ║
    ║  ██╔════╝██╔═══██╗██╔════╝████╗ ████║██║██╔════╝            ║
    ║  ██║     ██║   ██║███████╗██╔████╔██║██║██║                 ║
    ║  ██║     ██║   ██║╚════██║██║╚██╔╝██║██║██║                 ║
    ║  ╚██████╗╚██████╔╝███████║██║ ╚═╝ ██║██║╚██████╗            ║
    ║   ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝ ╚═════╝            ║
    ║                                                               ║
    ║             ██████╗ ██╗  ██╗ █████╗ ██████╗ ███╗   ███╗ █████╗ ║
    ║             ██╔══██╗██║  ██║██╔══██╗██╔══██╗████╗ ████║██╔══██╗║
    ║             ██║  ██║███████║███████║██████╔╝██╔████╔██║███████║║
    ║             ██║  ██║██╔══██║██╔══██║██╔══██╗██║╚██╔╝██║██╔══██║║
    ║             ██████╔╝██║  ██║██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║║
    ║             ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝║
    ║                                                               ║
    ║              ${WHITE}Vedic Astrology Platform ${CYAN}                      ║
    ╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"
}

print_step() {
    local step=$1
    local total=$2
    local message=$3
    echo -e "\n${BOLD}${BLUE}[Step ${step}/${total}]${RESET} ${message}"
}

print_success() {
    echo -e "${GREEN}${CHECK} $1${RESET}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${RESET}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING} $1${RESET}"
}

print_info() {
    echo -e "${CYAN}${INFO} $1${RESET}"
}

print_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    
    printf "\r${CYAN}Progress: ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%$((width - filled))s" | tr ' ' '░'
    printf "] %3d%%${RESET}" $percentage
}

spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while [ "$(ps a | awk '{print $1}' | grep -w $pid)" ]; do
        local temp=${spinstr#?}
        printf " ${CYAN}%c${RESET} " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b"
    done
    printf "   \b\b\b"
}

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    fi
    return 0
}

find_free_port() {
    local start_port=$1
    local port=$start_port
    while ! check_port $port; do
        ((port++))
        if [ $port -gt $((start_port + 100)) ]; then
            return 1
        fi
    done
    echo $port
}

# ==========================================
# CLEANUP FUNCTIONS
# ==========================================

cleanup() {
    if [ $CLEANUP_REGISTERED -eq 0 ]; then
        return
    fi
    
    echo -e "\n${YELLOW}${BOLD}Shutting down services...${RESET}"
    
    # Kill managed processes
    for pid in "${MANAGED_PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            echo -e "${DIM}Stopping process $pid...${RESET}"
            kill -TERM $pid 2>/dev/null || true
        fi
    done
    
    # Stop Redis if we started it
    if [ -f "$REDIS_PID_FILE" ]; then
        local redis_pid=$(cat "$REDIS_PID_FILE")
        if kill -0 $redis_pid 2>/dev/null; then
            echo -e "${DIM}Stopping Redis...${RESET}"
            kill -TERM $redis_pid 2>/dev/null || true
        fi
        rm -f "$REDIS_PID_FILE"
    fi
    
    # Stop Docker Compose Redis if we started it
    if [ "${REDIS_STARTED:-}" = "compose" ] && [ -n "${DOCKER_COMPOSE_CMD:-}" ]; then
        echo -e "${DIM}Stopping Docker Redis...${RESET}"
        $DOCKER_COMPOSE_CMD stop redis >/dev/null 2>&1 || true
    fi
    
    # Deactivate virtual environment
    if command -v deactivate >/dev/null 2>&1; then
        deactivate
    fi
    
    # Remove PID file
    rm -f "$PID_FILE"
    
    echo -e "${GREEN}${CHECK} Cleanup complete${RESET}"
    log "Cleanup completed"
}

trap cleanup EXIT INT TERM

# ==========================================
# SYSTEM CHECKS
# ==========================================

check_system_requirements() {
    print_step 1 8 "Checking system requirements"
    
    local errors=0
    
    # Check OS
    echo -n "  Operating System: "
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "macOS"
    else
        print_warning "Unknown OS ($OSTYPE) - may have compatibility issues"
    fi
    
    # Check required commands
    local required_cmds=("node" "npm" "python3" "git")
    for cmd in "${required_cmds[@]}"; do
        echo -n "  Checking $cmd: "
        if command -v "$cmd" >/dev/null 2>&1; then
            print_success "Found"
        else
            print_error "Not found"
            ((errors++))
        fi
    done
    
    # Check optional commands
    local optional_cmds=("docker" "redis-server" "lsof")
    for cmd in "${optional_cmds[@]}"; do
        echo -n "  Checking $cmd: "
        if command -v "$cmd" >/dev/null 2>&1; then
            print_success "Found (optional)"
        else
            print_warning "Not found (optional)"
        fi
    done
    
    # Check Node.js version
    echo -n "  Node.js version: "
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node -v)
        local node_major=$(echo "$node_version" | sed -E 's/^v([0-9]+).*/\1/')
        if [ "$node_major" -ge 18 ]; then
            print_success "$node_version"
        else
            print_error "$node_version (requires v18+)"
            ((errors++))
        fi
    fi
    
    # Check Python version
    echo -n "  Python version: "
    if command -v python3 >/dev/null 2>&1; then
        local py_version=$(python3 -V 2>&1 | awk '{print $2}')
        local py_major=$(echo "$py_version" | cut -d. -f1)
        local py_minor=$(echo "$py_version" | cut -d. -f2)
        if [ "$py_major" -eq 3 ] && [ "$py_minor" -ge 11 ]; then
            print_success "$py_version"
        else
            print_error "$py_version (requires 3.11+)"
            ((errors++))
        fi
    fi
    
    # Check pip
    echo -n "  pip: "
    if python3 -m pip --version >/dev/null 2>&1; then
        print_success "Available"
    else
        print_error "Not available"
        ((errors++))
    fi
    
    if [ $errors -gt 0 ]; then
        echo -e "\n${RED}${BOLD}System requirements not met. Please install missing dependencies.${RESET}"
        exit 1
    fi
}

# ==========================================
# SETUP FUNCTIONS
# ==========================================

setup_directories() {
    print_step 2 8 "Setting up directories"
    
    cd "$REPO_ROOT"
    
    # Create necessary directories
    local dirs=("logs" "backend/logs")
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            echo -e "  ${DIM}Created $dir${RESET}"
        fi
    done
    
    # Setup backend/.env
    if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        print_warning "Created backend/.env from example - please configure it"
    elif [ ! -f backend/.env ]; then
        print_error "No backend/.env.example found - creating minimal .env"
        cat > backend/.env << EOF
SECRET_KEY=change-me-$(openssl rand -hex 16 2>/dev/null || date +%s)
DATABASE_URL=sqlite:///./app.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
AYANAMSA=lahiri
NODE_TYPE=mean
HOUSE_SYSTEM=whole_sign
CACHE_ENABLED=true
CACHE_URL=redis://localhost:6379/1
REDIS_URL=redis://localhost:6379/0
EOF
    fi
    
    # Setup .env.local for frontend
    if [ ! -f .env.local ] && [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        print_info "Created .env.local from example"
    fi
    
    print_success "Directory setup complete"
}

install_node_dependencies() {
    print_step 3 8 "Installing Node.js dependencies"
    
    if [ -d node_modules ] && [ -f node_modules/.package-lock.json ]; then
        print_info "Node modules already installed - skipping"
    else
        echo -e "  ${DIM}Running npm install...${RESET}"
        npm install --legacy-peer-deps --silent --no-audit --no-fund &
        local npm_pid=$!
        spinner $npm_pid
        wait $npm_pid
        if [ $? -eq 0 ]; then
            print_success "Node.js dependencies installed"
        else
            print_error "Failed to install Node.js dependencies"
            exit 1
        fi
    fi
}

setup_python_environment() {
    print_step 4 8 "Setting up Python environment"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d backend/venv ]; then
        echo -e "  ${DIM}Creating virtual environment...${RESET}"
        python3 -m venv backend/venv
        print_success "Virtual environment created"
    fi
    
    # Activate virtual environment
    echo -e "  ${DIM}Activating virtual environment...${RESET}"
    source backend/venv/bin/activate
    
    # Upgrade pip first
    echo -e "  ${DIM}Upgrading pip...${RESET}"
    python3 -m pip install --upgrade pip >/dev/null 2>&1
    
    # Install Python dependencies
    echo -e "  ${DIM}Installing Python packages...${RESET}"
    if pip install -q -r backend/requirements.txt -r backend/requirements-dev.txt; then
        print_success "Python dependencies installed"
    else
        print_error "Failed to install Python dependencies"
        exit 1
    fi
}

# ==========================================
# REDIS MANAGEMENT
# ==========================================

check_redis() {
    local url=${1:-"redis://localhost:6379"}
    python3 - <<EOF >/dev/null 2>&1
import redis, sys
try:
    redis.from_url("$url", socket_connect_timeout=1).ping()
    sys.exit(0)
except:
    sys.exit(1)
EOF
}

setup_redis() {
    print_step 5 8 "Setting up Redis"
    
    # Get Redis URL from config
    local redis_url="redis://localhost:6379"
    if [ -f backend/.env ]; then
        local env_url=$(grep -E '^REDIS_URL=' backend/.env | cut -d'=' -f2- | tr -d '\r' || true)
        if [ -n "$env_url" ]; then
            redis_url="$env_url"
        fi
    fi
    
    echo -e "  ${DIM}Checking Redis at $redis_url...${RESET}"
    
    if check_redis "$redis_url"; then
        print_success "Redis is already running"
        return 0
    fi
    
    # Try Docker Compose first
    if command -v docker >/dev/null 2>&1; then
        local docker_cmd=""
        if docker compose version >/dev/null 2>&1; then
            docker_cmd="docker compose"
        elif command -v docker-compose >/dev/null 2>&1; then
            docker_cmd="docker-compose"
        fi
        
        if [ -n "$docker_cmd" ]; then
            echo -e "  ${DIM}Starting Redis with Docker...${RESET}"
            if $docker_cmd up -d redis >/dev/null 2>&1; then
                sleep 2
                if check_redis "$redis_url"; then
                    REDIS_STARTED="compose"
                    print_success "Redis started with Docker"
                    return 0
                fi
            fi
        fi
    fi
    
    # Try local redis-server
    if command -v redis-server >/dev/null 2>&1; then
        echo -e "  ${DIM}Starting local Redis server...${RESET}"
        redis-server --daemonize yes --pidfile "$REDIS_PID_FILE" --port 6379 >/dev/null 2>&1
        sleep 1
        if check_redis "$redis_url"; then
            REDIS_STARTED="local"
            print_success "Redis started locally"
            return 0
        fi
    fi
    
    print_warning "Could not start Redis - worker will be disabled"
    WORKER_ENABLED=0
}

# ==========================================
# TESTING
# ==========================================

run_tests() {
    print_step 6 8 "Running tests"
    
    echo -e "  ${DIM}Running frontend tests...${RESET}"
    if npm run test:frontend >/dev/null 2>&1; then
        print_success "Frontend tests passed"
    else
        print_error "Frontend tests failed"
        print_warning "Continuing anyway - fix tests later"
    fi
    
    echo -e "  ${DIM}Running backend tests...${RESET}"
    if PYTHONPATH=. pytest -q >/dev/null 2>&1; then
        print_success "Backend tests passed"
    else
        print_error "Backend tests failed"
        print_warning "Continuing anyway - fix tests later"
    fi
}

# ==========================================
# PORT MANAGEMENT
# ==========================================

check_ports() {
    print_step 7 8 "Checking port availability"
    
    local frontend_port=3000
    local backend_port=8000
    
    echo -n "  Frontend port $frontend_port: "
    if check_port $frontend_port; then
        print_success "Available"
    else
        print_warning "In use"
        frontend_port=$(find_free_port $frontend_port)
        if [ -n "$frontend_port" ]; then
            print_info "Using port $frontend_port instead"
            export PORT=$frontend_port
        else
            print_error "No free ports found"
            exit 1
        fi
    fi
    
    echo -n "  Backend port $backend_port: "
    if check_port $backend_port; then
        print_success "Available"
    else
        print_warning "In use"
        backend_port=$(find_free_port $backend_port)
        if [ -n "$backend_port" ]; then
            print_info "Using port $backend_port instead"
            export BACKEND_PORT=$backend_port
        else
            print_error "No free ports found"
            exit 1
        fi
    fi
}

# ==========================================
# SERVICE STARTUP
# ==========================================

start_services() {
    print_step 8 8 "Starting services"
    
    CLEANUP_REGISTERED=1
    echo $$ > "$PID_FILE"
    
    # Prepare startup command
    local services="npm run dev"
    if [ $WORKER_ENABLED -eq 1 ]; then
        services="$services\" \"npm run worker"
    fi
    
    echo -e "\n${BOLD}${GREEN}${ROCKET} Launching Cosmic Dharma...${RESET}\n"
    
    # Show service URLs
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    
    cat << EOF
${CYAN}${BOLD}Service URLs:${RESET}
${CYAN}├─${RESET} Frontend:  ${GREEN}http://localhost:${frontend_port}${RESET}
${CYAN}├─${RESET} Backend:   ${GREEN}http://localhost:${backend_port}${RESET}
${CYAN}└─${RESET} Logs:      ${DIM}$LOG_FILE${RESET}

${YELLOW}${BOLD}Quick Commands:${RESET}
${YELLOW}├─${RESET} Stop:      ${DIM}Press Ctrl+C${RESET}
${YELLOW}├─${RESET} Backend:   ${DIM}cd backend && source venv/bin/activate${RESET}
${YELLOW}└─${RESET} Logs:      ${DIM}tail -f $LOG_FILE${RESET}

EOF
    
    # Start services with concurrently
    eval "npx --yes concurrently \
        --names 'Frontend,Backend${WORKER_ENABLED:+,Worker}' \
        --prefix-colors 'cyan,magenta${WORKER_ENABLED:+,yellow}' \
        --prefix '[{name}]' \
        --timestamp-format 'HH:mm:ss' \
        $services" 2>&1 | tee -a "$LOG_FILE"
}

# ==========================================
# MAIN EXECUTION
# ==========================================

main() {
    # Initialize log
    echo "=== Startup initiated at $(date) ===" > "$LOG_FILE"
    log "Script started from $SCRIPT_DIR"
    
    # Print header
    print_header
    
    # Run all setup steps
    check_system_requirements
    setup_directories
    install_node_dependencies
    setup_python_environment
    setup_redis
    run_tests
    check_ports
    
    # Start services
    start_services
}

# Run main function
main