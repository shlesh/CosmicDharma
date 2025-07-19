#!/usr/bin/env python3
"""
Cosmic Dharma Backend Server
Starts the FastAPI application with proper configuration
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add backend to Python path
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
sys.path.insert(0, str(project_root))

def main():
    """Start the FastAPI server"""
    # Set environment variables
    os.environ.setdefault("PYTHONPATH", str(project_root))
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    print(f"🚀 Starting Cosmic Dharma Backend")
    print(f"📍 Server: http://{host}:{port}")
    print(f"📚 API Docs: http://{host}:{port}/docs")
    print(f"🔧 Debug mode: {debug}")
    print(f"📂 Working directory: {os.getcwd()}")
    
    # Start server - use module path notation
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=debug,
        reload_dirs=[str(backend_dir)] if debug else None,
        log_level="info" if debug else "warning"
    )

if __name__ == "__main__":
    main()
