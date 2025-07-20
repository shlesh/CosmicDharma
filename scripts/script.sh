#!/usr/bin/env bash

# ==========================================
# COSMIC DHARMA - OPTIMIZED SETUP SCRIPT v2.0
# ==========================================

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly LOG_DIR="$REPO_ROOT/logs"
readonly LOG_FILE="$LOG_DIR/startup.log"
readonly ERROR_LOG="$LOG_DIR/startup-errors.log"
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
    if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
        # Use tput for better compatibility
        readonly RED="$(tput setaf 1)"
        readonly GREEN="$(tput setaf 2)"
        readonly YELLOW="$(tput setaf 3)"
        readonly BLUE="$(tput setaf 4)"
        readonly MAGENTA="$(tput setaf 5)"
        readonly CYAN="$(tput setaf 6)"
        readonly WHITE="$(tput bold)"
        readonly PURPLE="$(tput setaf 5)"
        readonly BOLD="$(tput bold)"
        readonly DIM="$(tput dim)"
        readonly RESET="$(tput sgr0)"
    else
        # Fallback to ANSI codes with proper formatting
        readonly RED=$'\033[0;31m'
        readonly GREEN=$'\033[0;32m'
        readonly YELLOW=$'\033[1;33m'
        readonly BLUE=$'\033[0;34m'
        readonly MAGENTA=$'\033[0;35m'
        readonly CYAN=$'\033[0;36m'
        readonly WHITE=$'\033[1;37m'
        readonly PURPLE=$'\033[0;35m'
        readonly BOLD=$'\033[1m'
        readonly DIM=$'\033[2m'
        readonly RESET=$'\033[0m'
    fi

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
        printf '%b' "$message"
    else
        printf '%b\n' "$message"
    fi
}


# Status messages
ui::success() { ui::print " ${GREEN}${CHECK}${RESET} $1"; }
ui::error() { ui::print " ${RED}${CROSS}${RESET} $1"; ERRORS+=("$1"); }
ui::warning() { ui::print " ${YELLOW}${WARN}${RESET} $1"; WARNINGS+=("$1"); }
ui::info() { ui::print " ${CYAN}${INFO}${RESET} $1"; }

# Progress indicator
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
    ui::print " COSMIC DHARMA v2.0"
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
}

log::write() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    [[ "$level" == "ERROR" ]] && echo "[$timestamp] $message" >> "$ERROR_LOG"
}

log::info() { log::write "INFO" "$1"; }
log::error() { log::write "ERROR" "$1"; }
log::debug() { log::write "DEBUG" "$1"; }

# ==========================================
# SECURITY MODULE
# ==========================================

security::generate_secure_key() {
    local key=""
    if command -v openssl >/dev/null 2>&1; then
        key=$(openssl rand -hex 32 2>/dev/null)
    elif [[ -r /dev/urandom ]]; then
        key=$(head -c 32 /dev/urandom | xxd -p | tr -d '\n' 2>/dev/null)
    elif command -v python3 >/dev/null 2>&1; then
        key=$(python3 -c 'import secrets; print(secrets.token_hex(32))' 2>/dev/null)
    else
        key=$(date +%s%N | sha256sum | head -c 64)
        ui::warning "Using fallback key generation (less secure)"
    fi
    [[ -n "$key" ]] || key="fallback-$(date +%s)-$(whoami)"
    echo "$key"
}

# ==========================================
# RETRY MODULE
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
            delay=$((delay * 2))
        fi
        ((attempt++))
    done
    ui::error "$description failed after $max_attempts attempts"
    return 1
}

# ==========================================
# SYSTEM CHECK MODULE
# ==========================================

system::check_requirements() {
    local errors=0

    ui::info "Operating System: $(system::get_os_info)"
    ui::info "Memory: $(system::get_memory_info)"

    ui::print "\n ${CYAN}Checking required software:${RESET}"

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
        "backend/app"
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
            local secret_key=$(security::generate_secure_key)
            if sed --version >/dev/null 2>&1; then
                sed -i "s/change-me/$secret_key/g" "$REPO_ROOT/backend/.env"
            else
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
# PYTHON PACKAGE STRUCTURE FIX
# ==========================================

setup::fix_python_imports() {
    ui::progress "Fixing Python package structure"
    
    # Create __init__.py files to make proper Python packages
    local init_files=(
        "backend/__init__.py"
        "backend/app/__init__.py"
    )
    
    for init_file in "${init_files[@]}"; do
        if [[ ! -f "$REPO_ROOT/$init_file" ]]; then
            touch "$REPO_ROOT/$init_file"
        fi
    done
    
    # Fix main.py imports - create a corrected version
    cat > "$REPO_ROOT/backend/main.py" << 'EOF'
# backend/main.py - Fixed imports for proper package structure

import logging
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

# Fixed imports - use absolute imports instead of relative
try:
    from app.database import Base, engine, get_session
    from app.models import User, Prompt, Report
    from app.auth import get_current_user
    from app.routes import auth_router, profile_router, blog_router, admin_router
except ImportError:
    # Fallback imports if app package structure doesn't exist
    try:
        from db import Base, engine, get_session
        from models import User, Prompt, Report
        from auth import get_current_user
        from routes import auth_router, profile_router, blog_router, admin_router
    except ImportError as e:
        print(f"Import error: {e}")
        print("Please ensure your backend modules are properly structured")
        sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vedic Astrology Service",
    description="Comprehensive Vedic astrology calculations following traditional principles",
    version="2.0",
)

# Update CORS configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.error(f"Database initialization error: {e}")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error("Validation error: %s", exc)
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc).split('\n')[0] if exc.errors() else "Validation error"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Include routers with error handling
try:
    app.include_router(auth_router, prefix="/api")
    app.include_router(profile_router, prefix="/api")
    app.include_router(blog_router, prefix="/api")
    app.include_router(admin_router, prefix="/api")
except Exception as e:
    logger.warning(f"Some routers could not be loaded: {e}")

# Pydantic models
class PromptCreate(BaseModel):
    text: str

class PromptOut(BaseModel):
    id: int
    text: str
    created_at: datetime

class ReportCreate(BaseModel):
    content: str

class ReportOut(BaseModel):
    id: int
    content: str
    created_at: datetime

def require_donor(current_user: User = Depends(get_current_user)) -> User:
    if not (current_user.is_donor or current_user.is_admin):
        raise HTTPException(status_code=403, detail="Donor access required")
    return current_user

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": "2.0", 
        "timestamp": datetime.utcnow().isoformat(),
        "python_path": sys.path[:3]  # Debug info
    }

@app.post("/api/prompts", response_model=PromptOut)
def create_prompt(
    prompt: PromptCreate,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_session),
):
    db_prompt = Prompt(text=prompt.text, user=current_user)
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return PromptOut(id=db_prompt.id, text=db_prompt.text, created_at=db_prompt.created_at)

@app.get("/api/prompts", response_model=list[PromptOut])
def get_prompts(
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_session),
):
    prompts = (
        db.query(Prompt)
        .filter(Prompt.user_id == current_user.id)
        .order_by(Prompt.created_at.desc())
        .all()
    )
    return [PromptOut(id=p.id, text=p.text, created_at=p.created_at) for p in prompts]

@app.post("/api/reports", response_model=ReportOut)
def create_report(
    report: ReportCreate,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_session),
):
    db_report = Report(content=report.content, user=current_user)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return ReportOut(id=db_report.id, content=db_report.content, created_at=db_report.created_at)

@app.get("/api/reports", response_model=list[ReportOut])
def get_reports(
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_session),
):
    reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )
    return [ReportOut(id=r.id, content=r.content, created_at=r.created_at) for r in reports]

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Cosmic Dharma API v2.0", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

    ui::progress_done "Python package structure fixed"
    return 0
}

# ==========================================
# DEPENDENCY MODULE
# ==========================================

deps::install_node() {
    ui::progress "Checking Node.js dependencies"
    
    if [[ ! -f "$REPO_ROOT/package.json" ]]; then
        ui::progress_done "No package.json found" "error"
        return 1
    fi

    if [[ -d "$REPO_ROOT/node_modules" ]] && [[ $AUTO_FIX -eq 0 ]]; then
        local pkg_count=$(find "$REPO_ROOT/node_modules" -maxdepth 1 -type d | wc -l)
        ui::progress_done "Node.js packages already installed ($pkg_count packages)"
        return 0
    fi

    ui::progress "Installing Node.js dependencies"

    if [[ $AUTO_FIX -eq 1 ]] && [[ -d "$REPO_ROOT/node_modules" ]]; then
        ui::info "Cleaning node_modules for fresh install"
        rm -rf "$REPO_ROOT/node_modules" "$REPO_ROOT/package-lock.json"
    fi

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
        rm -f "$npm_log"
        return 1
    fi
}

deps::setup_python() {
    ui::progress "Setting up Python environment"

    if [[ -z "$PYTHON_CMD" ]]; then
        ui::progress_done "Python not found" "error"
        return 1
    fi

    VENV_PATH="$REPO_ROOT/backend/venv"

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
        rm -f "$pip_log"
        return 0
    fi
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
            ui::warning "Port $port in use"
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
            return 0
        fi
    fi

    # Try to start local Redis
    if command -v redis-server >/dev/null 2>&1; then
        ui::progress "Starting Redis server"
        pkill -f "redis-server.*:6379" 2>/dev/null || true
        
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
import sys
sys.path.insert(0, \".\")

try:
    from app.database import engine, Base
except ImportError:
    try:
        from database import engine, Base
    except ImportError:
        print(\"Database modules not found\")
        sys.exit(0)

try:
    Base.metadata.create_all(bind=engine)
    print(\"Database initialized successfully\")
except Exception as e:
    print(f\"Database error: {e}\")
' 2>/dev/null || true
    "

    ui::progress_done "Database initialized"
    return 0
}

# ==========================================
# HEALTH CHECK MODULE
# ==========================================

health::check_services() {
    local frontend_port=${PORT:-3000}
    local backend_port=${BACKEND_PORT:-8000}
    local max_wait=45
    local wait_time=0

    ui::progress "Waiting for services to become healthy"

    while [[ $wait_time -lt $max_wait ]]; do
        local frontend_ok=0
        local backend_ok=0

        # Check backend health endpoint with better error handling
        if curl -s -f "http://localhost:$backend_port/api/health" >/dev/null 2>&1; then
            backend_ok=1
        fi

        # Check frontend
        if curl -s -f "http://localhost:$frontend_port" >/dev/null 2>&1; then
            frontend_ok=1
        fi

        if [[ $backend_ok -eq 1 ]]; then
            if [[ $frontend_ok -eq 1 ]]; then
                ui::progress_done "All services healthy"
                return 0
            else
                ui::progress_done "Backend healthy, frontend starting..."
                return 0
            fi
        fi

        sleep 3
        ((wait_time += 3))
    done

    ui::progress_done "Service health check timeout" "warning"
    return 1
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
${GREEN}Health Check:${RESET} http://localhost:${backend_port}/api/health

EOF

    ui::print "\n${BOLD}${GREEN}Launching services...${RESET}\n"

    # WSL-compatible backend command
    local backend_cmd="cd '$REPO_ROOT/backend' && bash -c 'source venv/bin/activate && PYTHONPATH=\"$REPO_ROOT/backend\" python run_server.py'"
    
    local services="\"npm run dev\""
    local names="Frontend"
    local colors="cyan"

    if [[ $WORKER_ENABLED -eq 1 ]]; then
        local worker_cmd="cd '$REPO_ROOT/backend' && bash -c 'source venv/bin/activate && python -m rq.cli worker profiles --url redis://localhost:6379/0'"
        services="$services \"$worker_cmd\""
        names="$names,Worker"
        colors="$colors,yellow"
    fi

    # Use concurrently with explicit shell
    eval "SHELL=/bin/bash npx --yes concurrently \
        --names '$names' \
        --prefix-colors '$colors' \
        --prefix '[{name}]' \
        --kill-others-on-fail \
        --restart-tries 2 \
        --restart-after 3000 \
        $services" &

    # Wait and run health checks
    sleep 15
    health::check_services || ui::warning "Some services may not be ready yet"
    
    ui::print "\n${GREEN}${BOLD}Services are running! Press Ctrl+C to stop.${RESET}\n"
    
    # Keep script running
    wait
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

    if [[ $RUN_DIAGNOSTICS -eq 1 ]]; then
        run_diagnostics
        exit 0
    fi

    ui::print "${BOLD}${WHITE}Welcome to Cosmic Dharma Setup v2.0!${RESET}\n"
    
    if [[ $IS_WSL -eq 1 ]]; then
        ui::info "WSL detected - optimizations applied"
        ui::info "Windows Host: $WINDOWS_HOST"
    fi

    if [[ $AUTO_FIX -eq 1 ]]; then
        ui::info "Auto-fix mode enabled"
    fi

    # Run setup steps
    local steps=(
        "system::check_requirements|System Requirements"
        "setup::directories|Directory Setup"
        "setup::environment_files|Environment Configuration"
        "setup::fix_python_imports|Python Package Structure"
        "deps::install_node|Node.js Dependencies"
        "deps::setup_python|Python Environment"
        "db::initialize|Database Setup"
        "service::setup_redis|Redis Setup"
        "service::manage_ports|Port Management"
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

    ui::print "${BOLD}System Information:${RESET}"
    ui::info "OS: $(system::get_os_info)"
    ui::info "Memory: $(system::get_memory_info)"
    ui::info "Script: $SCRIPT_DIR"
    ui::info "Repository: $REPO_ROOT"
    ui::info "User: $(whoami)"

    if [[ $IS_WSL -eq 1 ]]; then
        ui::print "\n${BOLD}WSL Information:${RESET}"
        ui::info "Windows Host: $WINDOWS_HOST"
        ui::info "Systemd Support: $([[ $WSL_HAS_SYSTEMD -eq 1 ]] && echo "Yes" || echo "No")"
        ui::info "Windows Redis: $([[ $WSL_WINDOWS_REDIS -eq 1 ]] && echo "Detected" || echo "Not found")"
    fi

    ui::print "\n${BOLD}Software Versions:${RESET}"
    for cmd in node npm python3 pip3 git redis-server; do
        if command -v "$cmd" >/dev/null 2>&1; then
            local version=$($cmd --version 2>&1 | head -n1 || echo "unknown")
            ui::success "$cmd: $version"
        else
            ui::error "$cmd: not found"
        fi
    done

    ui::print "\n${BOLD}Port Status:${RESET}"
    for port in 3000 8000 6379; do
        if service::is_port_in_use "$port"; then
            ui::warning "Port $port: in use"
        else
            ui::success "Port $port: available"
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
  -t, --skip-tests   Skip running tests
  -a, --auto-fix     Auto-fix common issues
  -s, --seed         Seed database with sample data

${BOLD}Examples:${RESET}
  $0                 Normal startup
  $0 -d              Run diagnostics
  $0 -a              Auto-fix issues
  $0 -a -s           Auto-fix and seed database

EOF
}

# ==========================================
# CLEANUP
# ==========================================

cleanup() {
    ui::print "\n${YELLOW}Shutting down...${RESET}"
    
    # Kill child processes
    pkill -P $$ 2>/dev/null || true
    
    # Stop Redis if we started it
    if [[ -f "$REDIS_PID_FILE" ]]; then
        local redis_pid=$(cat "$REDIS_PID_FILE")
        kill $redis_pid 2>/dev/null || true
        rm -f "$REDIS_PID_FILE"
    fi
    
    local runtime=$(($(date +%s) - START_TIME))
    ui::info "Total runtime: $((runtime / 60))m $((runtime % 60))s"
    
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

cd "$REPO_ROOT" || {
    echo "Error: Cannot change to repository root"
    exit 1
}

echo $$ > "$PID_FILE"

# Run main function
main "$@"
