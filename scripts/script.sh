#!/usr/bin/env bash

# ==========================================
# COSMIC DHARMA - ENHANCED WSL STARTUP SCRIPT
# ==========================================

# Remove strict error handling to allow recovery
# set -euo pipefail  # REMOVED for better error handling

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

# Unicode symbols (simplified for WSL)
CHECK="[OK]"
CROSS="[FAIL]"
ARROW=">"
STAR="*"
ROCKET=">>>"
SPARKLES="***"
WARNING="[!]"
INFO="[i]"
GEAR="[*]"
PACKAGE="[PKG]"
PYTHON="[PY]"
NODE="[NODE]"
DATABASE="[DB]"
NETWORK="[NET]"
CLOCK="[TIME]"
LOADING="..."

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
DEBUG_LOG="$REPO_ROOT/.startup-debug.log"
PID_FILE="$REPO_ROOT/.startup.pid"
REDIS_PID_FILE="$REPO_ROOT/.redis.pid"
WORKER_ENABLED=1
CLEANUP_REGISTERED=0
START_TIME=$(date +%s)

# Network configuration for WSL
if [ $IS_WSL -eq 1 ]; then
    # Get Windows host IP for WSL2
    export WINDOWS_HOST=$(cat /etc/resolv.conf 2>/dev/null | grep nameserver | awk '{print $2}' || echo "172.17.0.1")
    export DISPLAY="${WINDOWS_HOST}:0"
fi

# Optional flags
SEED_DB=0
RUN_DIAGNOSTICS=0
VERBOSE=0
SKIP_TESTS=0
AUTO_FIX=0
DEBUG_MODE=0

# Process tracking
declare -a MANAGED_PIDS=()

# Error tracking
declare -a ERRORS=()
declare -a WARNINGS=()
LAST_ERROR=""
LAST_ERROR_CODE=0

# ==========================================
# ENHANCED ERROR HANDLING
# ==========================================

# Global error handler
handle_command_error() {
    local exit_code=$?
    local command="$1"
    local context="${2:-Unknown context}"
    
    if [ $exit_code -ne 0 ]; then
        LAST_ERROR="Command failed: $command (exit code: $exit_code)"
        LAST_ERROR_CODE=$exit_code
        log_error "ERROR in $context: $command failed with exit code $exit_code"
        
        if [ $DEBUG_MODE -eq 1 ]; then
            echo -e "${RED}DEBUG: Command that failed: $command${RESET}" >&2
            echo -e "${RED}DEBUG: Exit code: $exit_code${RESET}" >&2
            echo -e "${RED}DEBUG: Context: $context${RESET}" >&2
        fi
        
        return $exit_code
    fi
    return 0
}

# Safe command execution
safe_execute() {
    local command="$1"
    local context="${2:-Command execution}"
    local allow_fail="${3:-0}"
    
    log_debug "Executing: $command"
    
    if [ $DEBUG_MODE -eq 1 ]; then
        echo -e "${DIM}DEBUG: Running: $command${RESET}"
    fi
    
    # Execute command and capture output
    local output
    local exit_code
    
    if output=$(eval "$command" 2>&1); then
        exit_code=0
        log_debug "Command succeeded: $command"
        echo "$output"
    else
        exit_code=$?
        LAST_ERROR="$output"
        LAST_ERROR_CODE=$exit_code
        log_error "Command failed ($exit_code): $command"
        log_error "Output: $output"
        
        if [ $allow_fail -eq 0 ]; then
            echo -e "${RED}Error executing: $command${RESET}" >&2
            echo -e "${RED}Output: $output${RESET}" >&2
            return $exit_code
        fi
    fi
    
    return 0
}

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
    elif [ "$level" = "DEBUG" ]; then
        echo "[$timestamp] $message" >> "$DEBUG_LOG"
    fi
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_debug() { [ $VERBOSE -eq 1 ] || [ $DEBUG_MODE -eq 1 ] && log "DEBUG" "$@" || true; }

# ==========================================
# SIMPLIFIED UI FOR WSL
# ==========================================

print_header() {
    clear
    echo -e "${PURPLE}${BOLD}"
    echo "=============================================================="
    echo "                    COSMIC DHARMA"
    echo "                Vedic Astrology Platform"
    echo "=============================================================="
    echo -e "${RESET}"
    
    if [ $IS_WSL -eq 1 ]; then
        echo -e "${CYAN}Running on Windows Subsystem for Linux (WSL)${RESET}"
        echo
    fi
}

print_step() {
    local step=$1
    local total=$2
    local message=$3
    local icon=${4:-$GEAR}
    
    echo
    echo -e "${BOLD}${BLUE}==============================================================>${RESET}"
    echo -e "${BOLD}${WHITE}$icon Step ${step}/${total}: ${message}${RESET}"
    echo -e "${BOLD}${BLUE}==============================================================>${RESET}"
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
    if [ $VERBOSE -eq 1 ] || [ $DEBUG_MODE -eq 1 ]; then
        echo -e "  ${DIM}[DEBUG] $1${RESET}"
    fi
    log_debug "$1"
}

# Simplified progress for WSL
show_progress() {
    local message="$1"
    echo -ne "  ${CYAN}${LOADING} ${message}${RESET}"
}

complete_progress() {
    local message="$1"
    local status="${2:-success}"
    
    echo -ne "\r"  # Clear line
    if [ "$status" = "success" ]; then
        print_success "$message"
    elif [ "$status" = "error" ]; then
        print_error "$message"
    else
        print_warning "$message"
    fi
}

# Simple loading animation for WSL
show_loading() {
    local pid=$1
    local message=$2
    local dots=""
    
    while kill -0 $pid 2>/dev/null; do
        dots="${dots}."
        if [ ${#dots} -gt 3 ]; then
            dots=""
        fi
        echo -ne "\r  ${CYAN}${message}${dots}   ${RESET}"
        sleep 0.5
    done
    
    wait $pid
    local exit_code=$?
    
    echo -ne "\r"  # Clear line
    if [ $exit_code -eq 0 ]; then
        print_success "$message"
    else
        print_error "$message (failed with exit code: $exit_code)"
    fi
    
    return $exit_code
}

print_box() {
    local title=$1
    local content=$2
    local color=${3:-$CYAN}
    
    echo
    echo -e "${color}+--------------------------------------------------------------+${RESET}"
    echo -e "${color}| ${BOLD}${title}${RESET}"
    echo -e "${color}+--------------------------------------------------------------+${RESET}"
    echo -e "${color}| ${RESET}${content}"
    echo -e "${color}+--------------------------------------------------------------+${RESET}"
    echo
}

# ==========================================
# INTERACTIVE ERROR RECOVERY
# ==========================================

interactive_error_handler() {
    local error_context="$1"
    local suggestions=("$@")
    shift  # Remove first argument
    
    echo
    echo -e "${RED}${BOLD}=== ERROR ENCOUNTERED ===${RESET}"
    echo -e "${RED}Context: ${error_context}${RESET}"
    if [ -n "$LAST_ERROR" ]; then
        echo -e "${RED}Details: ${LAST_ERROR}${RESET}"
    fi
    echo
    
    # Show suggestions if any
    if [ ${#suggestions[@]} -gt 1 ]; then
        echo -e "${YELLOW}Possible solutions:${RESET}"
        local i=1
        for suggestion in "${suggestions[@]:1}"; do
            echo "  $i) $suggestion"
            ((i++))
        done
        echo
    fi
    
    echo -e "${YELLOW}What would you like to do?${RESET}"
    echo "  r) Retry the operation"
    echo "  s) Skip this step"
    echo "  d) Show detailed debug information"
    echo "  l) View error logs"
    echo "  f) Try automatic fix"
    echo "  x) Exit script"
    echo
    
    local choice
    read -p "Your choice [r/s/d/l/f/x]: " choice
    
    case $choice in
        r|R)
            echo -e "${CYAN}Retrying...${RESET}"
            return 1  # Retry
            ;;
        s|S)
            echo -e "${YELLOW}Skipping this step...${RESET}"
            return 0  # Skip
            ;;
        d|D)
            echo -e "\n${CYAN}=== DEBUG INFORMATION ===${RESET}"
            echo "Last error: $LAST_ERROR"
            echo "Last error code: $LAST_ERROR_CODE"
            echo "Current directory: $(pwd)"
            echo "Script directory: $SCRIPT_DIR"
            echo "Repository root: $REPO_ROOT"
            echo
            echo "Recent log entries:"
            tail -n 10 "$LOG_FILE" 2>/dev/null || echo "No log file found"
            echo
            echo "Press Enter to continue..."
            read
            return 1  # Retry after showing debug
            ;;
        l|L)
            echo -e "\n${CYAN}=== ERROR LOG ===${RESET}"
            if [ -f "$ERROR_LOG" ]; then
                tail -n 20 "$ERROR_LOG"
            else
                echo "No error log found"
            fi
            echo
            echo "Press Enter to continue..."
            read
            return 1  # Retry after showing log
            ;;
        f|F)
            echo -e "${CYAN}Attempting automatic fix...${RESET}"
            return 2  # Auto-fix
            ;;
        x|X)
            echo -e "${RED}Exiting...${RESET}"
            exit 1
            ;;
        *)
            echo -e "${RED}Invalid choice. Retrying...${RESET}"
            return 1  # Retry
            ;;
    esac
}

# ==========================================
# SYSTEM CHECKS WITH WSL SUPPORT
# ==========================================

check_system_requirements() {
    print_step 1 8 "System Requirements Check" $GEAR
    
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
        "git|[GIT]|Git"
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
    
    cd "$REPO_ROOT" || {
        print_error "Failed to change to repository root"
        return 1
    }
    
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
    
    # Create temp file for npm output
    local npm_output=$(mktemp)
    
    # Run npm install
    (npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tee "$npm_output") &
    
    local npm_pid=$!
    show_loading $npm_pid "Installing Node.js packages"
    local npm_result=$?
    
    if [ $npm_result -eq 0 ]; then
        local installed=$(find node_modules -maxdepth 1 -type d 2>/dev/null | wc -l)
        print_success "Installed $installed packages successfully"
    else
        print_error "Failed to install Node.js dependencies"
        
        # Show errors
        echo -e "\n${RED}Installation errors:${RESET}"
        grep -i "ERR!" "$npm_output" | head -5 || true
        
        interactive_error_handler "npm install failed" \
            "Clear npm cache: npm cache clean --force" \
            "Delete node_modules and retry" \
            "Check internet connection"
    fi
    
    rm -f "$npm_output"
}

# ==========================================
# ENHANCED PYTHON SETUP WITH BETTER ERROR HANDLING
# ==========================================

setup_python_environment() {
    print_step 4 8 "Python Environment" $PYTHON
    
    cd "$REPO_ROOT" || {
        print_error "Failed to change to repository root"
        return 1
    }
    
    # Check Python availability
    echo -e "\n  ${CYAN}Checking Python installation...${RESET}"
    
    local python_cmd=""
    for cmd in python3.12 python3.11 python3.10 python3.9 python3 python; do
        if command -v "$cmd" >/dev/null 2>&1; then
            local version=$($cmd --version 2>&1 | awk '{print $2}')
            local major=$(echo "$version" | cut -d. -f1)
            local minor=$(echo "$version" | cut -d. -f2)
            
            if [ "$major" -eq 3 ] && [ "$minor" -ge 9 ]; then
                python_cmd="$cmd"
                print_success "Found Python: $cmd (version $version)"
                break
            else
                print_warning "Found $cmd but version $version is too old"
            fi
        fi
    done
    
    if [ -z "$python_cmd" ]; then
        print_error "No suitable Python 3.9+ found!"
        
        interactive_error_handler "Python not found" \
            "Install Python 3.9 or higher" \
            "On WSL Ubuntu: sudo apt update && sudo apt install python3.11 python3.11-venv" \
            "Skip Python setup (app won't work without backend)"
        
        local result=$?
        if [ $result -eq 2 ]; then
            # Try to install Python
            if [ $IS_WSL -eq 1 ]; then
                echo "Attempting to install Python..."
                sudo apt update && sudo apt install -y python3.11 python3.11-venv python3-pip
                python_cmd="python3.11"
            fi
        elif [ $result -eq 0 ]; then
            return 0  # Skip
        fi
        
        # Retry check
        if [ -z "$python_cmd" ] || ! command -v "$python_cmd" >/dev/null 2>&1; then
            print_error "Python installation failed"
            return 1
        fi
    fi
    
    # Virtual environment management
    echo -e "\n  ${CYAN}Setting up virtual environment...${RESET}"
    
    local venv_path="backend/venv"
    local activate_script=""
    
    # Check existing venv
    if [ -d "$venv_path" ]; then
        print_info "Virtual environment exists, checking validity..."
        
        # Determine activation script
        if [ -f "$venv_path/bin/activate" ]; then
            activate_script="$venv_path/bin/activate"
        elif [ -f "$venv_path/Scripts/activate" ]; then
            activate_script="$venv_path/Scripts/activate"
        else
            print_warning "Virtual environment seems corrupted"
            rm -rf "$venv_path"
        fi
    fi
    
    # Create venv if needed
    local max_retries=3
    local retry_count=0
    
    while [ ! -f "$activate_script" ] && [ $retry_count -lt $max_retries ]; do
        ((retry_count++))
        print_info "Creating virtual environment (attempt $retry_count/$max_retries)..."
        
        # Remove old venv if exists
        [ -d "$venv_path" ] && rm -rf "$venv_path"
        
        # Create new venv with explicit python
        if $python_cmd -m venv "$venv_path" 2>&1 | tee -a "$DEBUG_LOG"; then
            print_success "Virtual environment created"
            
            # Find activation script again
            if [ -f "$venv_path/bin/activate" ]; then
                activate_script="$venv_path/bin/activate"
            elif [ -f "$venv_path/Scripts/activate" ]; then
                activate_script="$venv_path/Scripts/activate"
            fi
            
            if [ -n "$activate_script" ]; then
                break
            fi
        else
            print_error "Failed to create virtual environment"
            
            if [ $retry_count -lt $max_retries ]; then
                echo -e "${YELLOW}Retrying in 2 seconds...${RESET}"
                sleep 2
            fi
        fi
    done
    
    if [ ! -f "$activate_script" ]; then
        print_error "Could not create virtual environment after $max_retries attempts"
        
        interactive_error_handler "Virtual environment creation failed" \
            "Check disk space: df -h" \
            "Check permissions: ls -la backend/" \
            "Try manual creation: $python_cmd -m venv backend/venv" \
            "Install venv package: sudo apt install python3-venv"
        
        if [ $? -ne 0 ]; then
            return 1
        fi
    fi
    
    # Activate virtual environment
    echo -e "\n  ${CYAN}Activating virtual environment...${RESET}"
    
    print_debug "Activation script: $activate_script"
    
    # Source activation script
    source "$activate_script" 2>&1 | tee -a "$DEBUG_LOG"
    
    if [ -n "$VIRTUAL_ENV" ]; then
        print_success "Virtual environment activated"
        print_debug "VIRTUAL_ENV: $VIRTUAL_ENV"
    else
        print_warning "VIRTUAL_ENV not set, activation may have failed"
    fi
    
    # Ensure pip is available
    echo -e "\n  ${CYAN}Checking pip...${RESET}"
    
    local pip_cmd=""
    for cmd in pip3 pip python3 -m pip python -m pip; do
        if $cmd --version >/dev/null 2>&1; then
            pip_cmd="$cmd"
            break
        fi
    done
    
    if [ -z "$pip_cmd" ]; then
        print_error "pip not found in virtual environment"
        
        # Try to install pip
        print_info "Attempting to install pip..."
        curl -sS https://bootstrap.pypa.io/get-pip.py | python3 2>&1 | tee -a "$DEBUG_LOG"
        
        # Retry pip detection
        for cmd in pip3 pip python3 -m pip; do
            if $cmd --version >/dev/null 2>&1; then
                pip_cmd="$cmd"
                break
            fi
        done
        
        if [ -z "$pip_cmd" ]; then
            print_error "Failed to install pip"
            return 1
        fi
    fi
    
    print_success "Found pip: $($pip_cmd --version)"
    
    # Upgrade pip
    echo -e "\n  ${CYAN}Upgrading pip...${RESET}"
    
    show_progress "Upgrading pip"
    if $pip_cmd install --upgrade pip >/dev/null 2>&1; then
        complete_progress "pip upgraded successfully" "success"
    else
        complete_progress "pip upgrade failed (continuing anyway)" "warning"
    fi
    
    # Install requirements
    echo -e "\n  ${CYAN}Installing Python packages...${RESET}"
    
    if [ ! -f backend/requirements.txt ]; then
        print_error "requirements.txt not found!"
        return 1
    fi
    
    local total_packages=$(wc -l < backend/requirements.txt)
    print_info "Found $total_packages packages to install"
    
    # Create a temporary file for pip output
    local pip_output=$(mktemp)
    local pip_errors=$(mktemp)
    
    # Install packages with better error handling
    print_info "Installing packages (this may take a few minutes)..."
    
    # Run pip install in background
    (
        cd backend
        $pip_cmd install -r requirements.txt -r requirements-dev.txt 2>&1 | tee "$pip_output"
    ) &
    
    local pip_pid=$!
    
    # Show progress
    show_loading $pip_pid "Installing Python packages"
    local pip_result=$?
    
    # Check results
    if [ $pip_result -eq 0 ]; then
        print_success "All Python packages installed successfully"
    else
        print_error "Some packages failed to install"
        
        # Show errors
        echo -e "\n${RED}Installation errors:${RESET}"
        grep -i "error\|failed" "$pip_output" | head -10 || true
        
        # Common fixes for WSL
        echo -e "\n${YELLOW}Common solutions for WSL:${RESET}"
        echo "  1. Update system packages: sudo apt update && sudo apt upgrade"
        echo "  2. Install build tools: sudo apt install build-essential python3-dev"
        echo "  3. Clear pip cache: pip cache purge"
        echo "  4. Install one by one: pip install package_name"
        
        interactive_error_handler "Package installation failed" \
            "Install system dependencies: sudo apt install build-essential python3-dev" \
            "Clear pip cache: pip cache purge" \
            "Try with --no-cache-dir flag" \
            "Install packages one by one"
        
        local fix_choice=$?
        if [ $fix_choice -eq 2 ]; then
            # Auto-fix attempt
            print_info "Installing system dependencies..."
            sudo apt update && sudo apt install -y build-essential python3-dev libpq-dev
            
            print_info "Retrying package installation..."
            cd backend
            $pip_cmd install --no-cache-dir -r requirements.txt -r requirements-dev.txt
            cd ..
        elif [ $fix_choice -eq 0 ]; then
            print_warning "Skipping package installation - backend may not work properly"
        fi
    fi
    
    # Cleanup temp files
    rm -f "$pip_output" "$pip_errors"
    
    # Verify critical packages
    echo -e "\n  ${CYAN}Verifying critical packages...${RESET}"
    
    local critical_packages=("fastapi" "uvicorn" "swisseph")
    local missing_packages=()
    
    for pkg in "${critical_packages[@]}"; do
        if python3 -c "import $pkg" 2>/dev/null; then
            print_success "$pkg installed"
        else
            print_error "$pkg not found"
            missing_packages+=("$pkg")
        fi
    done
    
    if [ ${#missing_packages[@]} -gt 0 ]; then
        print_error "Critical packages missing: ${missing_packages[*]}"
        
        # Try to install missing packages individually
        for pkg in "${missing_packages[@]}"; do
            print_info "Attempting to install $pkg individually..."
            if $pip_cmd install "$pkg" 2>&1 | tee -a "$DEBUG_LOG"; then
                print_success "$pkg installed"
            else
                print_error "Failed to install $pkg"
            fi
        done
    fi
    
    print_box "Python Setup Complete" "Environment is ready" "$GREEN"
    return 0
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
    print_step 6 8 "Running Tests" "[TEST]"
    
    if [ $SKIP_TESTS -eq 1 ]; then
        print_warning "Skipping tests (--skip-tests flag)"
        return 0
    fi
    
    local test_errors=0
    
    # Frontend tests
    echo -e "\n  ${CYAN}Frontend Tests:${RESET}"
    if [ -f vitest.config.js ]; then
        (npm run test:frontend 2>&1 || true) &
        local frontend_pid=$!
        show_loading $frontend_pid "Running frontend tests"
        
        if [ $? -eq 0 ]; then
            print_success "Frontend tests passed"
        else
            print_warning "Some frontend tests failed"
            ((test_errors++))
        fi
    else
        print_warning "No frontend test configuration found"
    fi
    
    # Backend tests
    echo -e "\n  ${CYAN}Backend Tests:${RESET}"
    if [ -f pytest.ini ]; then
        cd backend
        source venv/bin/activate
        
        (PYTHONPATH=. pytest -q 2>&1 || true) &
        local backend_pid=$!
        show_loading $backend_pid "Running backend tests"
        
        if [ $? -eq 0 ]; then
            print_success "Backend tests passed"
        else
            print_warning "Some backend tests failed"
            ((test_errors++))
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
    echo "=============================================================="
    echo "         ${ROCKET} COSMIC DHARMA IS LAUNCHING! ${ROCKET}"
    echo "=============================================================="
    echo -e "${RESET}\n"
    
    # Service URLs
    cat << EOF
${CYAN}${BOLD}Service Endpoints:${RESET}
  ${GREEN}Frontend:${RESET}   http://localhost:${frontend_port}
  ${GREEN}Backend:${RESET}    http://localhost:${backend_port}
  ${GREEN}API Docs:${RESET}   http://localhost:${backend_port}/docs
  ${GREEN}Logs:${RESET}       $LOG_FILE

${YELLOW}${BOLD}Quick Commands:${RESET}
  ${WHITE}Stop all:${RESET}     Press ${BOLD}Ctrl+C${RESET}
  ${WHITE}View logs:${RESET}    tail -f $LOG_FILE
  ${WHITE}Backend shell:${RESET} cd backend && source venv/bin/activate
  ${WHITE}Restart:${RESET}      $0

EOF
    
    # System status
    if [ $WORKER_ENABLED -eq 1 ]; then
        echo -e "${GREEN}${BOLD}All Systems Go!${RESET} Redis worker enabled for background tasks.\n"
    else
        echo -e "${YELLOW}${BOLD}Running in Limited Mode${RESET} Background tasks disabled (no Redis).\n"
    fi
    
    # WSL-specific instructions
    if [ $IS_WSL -eq 1 ]; then
        echo -e "${CYAN}${BOLD}WSL Instructions:${RESET}"
        echo -e "   Open in Windows browser: ${UNDERLINE}http://localhost:${frontend_port}${RESET}"
        echo -e "   If ports don't work, restart WSL: wsl --shutdown\n"
    fi
    
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
    echo -e "${BOLD}${GREEN}Launching services...${RESET}\n"
    
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
    
    echo -e "\n\n${YELLOW}${BOLD}Shutting down Cosmic Dharma...${RESET}"
    
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
    echo -e "\n${GREEN}${BOLD}Thanks for using Cosmic Dharma!${RESET}"
    
    # Show any errors that occurred
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo -e "\n${RED}${BOLD}Errors encountered:${RESET}"
        for error in "${ERRORS[@]}"; do
            echo -e "  ${RED}- ${RESET} $error"
        done
    fi
    
    # Show any warnings
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo -e "\n${YELLOW}${BOLD}Warnings:${RESET}"
        for warning in "${WARNINGS[@]}"; do
            echo -e "  ${YELLOW}- ${RESET} $warning"
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
            echo -e "  ${GREEN}${CHECK}${RESET} $file ($(wc -l < "$file") lines)"
        else
            echo -e "  ${RED}${CROSS}${RESET} $file"
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
  -D, --debug         Enable debug mode with extra logging
  
${BOLD}Examples:${RESET}
  $0                  # Normal startup
  $0 -d               # Run diagnostics
  $0 -D -v            # Debug mode with verbose output
  $0 -a               # Auto-fix common issues

${BOLD}WSL Troubleshooting:${RESET}
  • If script stops: Run with -D flag for debug info
  • For network issues: Check Windows Firewall
  • For permission errors: Run without sudo first
  • For pip issues: Install python3-venv and python3-dev

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
        -D|--debug)
            DEBUG_MODE=1
            VERBOSE=1
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
# MAIN EXECUTION WITH BETTER ERROR HANDLING
# ==========================================

main() {
    # Initialize logs
    echo "=== Cosmic Dharma Startup $(date) ===" > "$LOG_FILE"
    > "$ERROR_LOG"
    > "$DEBUG_LOG"
    
    # Show header
    print_header
    
    # Diagnostics mode
    if [ $RUN_DIAGNOSTICS -eq 1 ]; then
        run_diagnostics
        exit 0
    fi
    
    # Welcome message
    echo -e "${BOLD}${WHITE}Welcome to Cosmic Dharma Setup Wizard!${RESET}\n"
    echo -e "${CYAN}This enhanced version includes:${RESET}"
    echo "  ${CHECK} Better error handling and recovery"
    echo "  ${CHECK} WSL-optimized UI and progress indicators"
    echo "  ${CHECK} Interactive error resolution"
    echo "  ${CHECK} Detailed debug logging"
    echo
    
    if [ $IS_WSL -eq 1 ]; then
        echo -e "${YELLOW}${BOLD}WSL Detected!${RESET}"
        echo -e "${YELLOW}Special optimizations will be applied.${RESET}\n"
    fi
    
    if [ $DEBUG_MODE -eq 1 ]; then
        echo -e "${MAGENTA}${BOLD}DEBUG MODE ENABLED${RESET}\n"
    fi
    
    echo -e "${GREEN}Press Enter to begin or Ctrl+C to cancel...${RESET}"
    read -r
    
    # Run setup steps with error handling
    local steps=(
        "check_system_requirements"
        "setup_directories"
        "install_node_dependencies"
        "setup_python_environment"
        "setup_redis"
        "run_tests"
        "check_ports"
    )
    
    for step in "${steps[@]}"; do
        if ! $step; then
            print_error "Step failed: $step"
            
            if [ $AUTO_FIX -eq 0 ]; then
                echo -e "\n${YELLOW}Continue with remaining steps? (y/N)${RESET}"
                read -r continue_choice
                if [[ ! "$continue_choice" =~ ^[Yy]$ ]]; then
                    echo -e "${RED}Setup aborted.${RESET}"
                    exit 1
                fi
            fi
        fi
    done
    
    # Optional database seeding
    if [ $SEED_DB -eq 1 ]; then
        print_step 7.5 8 "Database Seeding" $DATABASE
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
    
    # Final summary
    echo
    if [ ${#ERRORS[@]} -eq 0 ]; then
        print_box "Setup Complete!" "All systems ready! ${ROCKET}" "$GREEN"
    else
        print_box "Setup Complete with Warnings" "${#ERRORS[@]} errors occurred" "$YELLOW"
        echo -e "${YELLOW}Errors encountered during setup:${RESET}"
        for error in "${ERRORS[@]}"; do
            echo "  - $error"
        done
        echo
    fi
    
    echo -e "${GREEN}${BOLD}Press Enter to launch Cosmic Dharma...${RESET}"
    read -r
    
    # Start services
    start_services
}

# ==========================================
# RUN MAIN
# ==========================================

main "$@"