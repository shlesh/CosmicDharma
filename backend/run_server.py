    cat > "$REPO_ROOT/.run-backend.sh" << EOF
#!/bin/bash
cd "$REPO_ROOT/backend"
source "$ACTIVATE_SCRIPT"
python -m uvicorn main:app --reload --host 0.0.0.0 --port $backend_port
EOF