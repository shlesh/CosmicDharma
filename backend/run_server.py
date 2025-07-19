# backend/run_server.py
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
sys.path.insert(0, str(backend_dir))

def main():
    """Start the FastAPI server"""
    # Set environment variables if not set
    os.environ.setdefault("PYTHONPATH", str(project_root))
    
    # Import after path setup
    try:
        from main import app
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Python path: {sys.path}")
        sys.exit(1)
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    print(f"🚀 Starting Cosmic Dharma Backend")
    print(f"📍 Server: http://{host}:{port}")
    print(f"📚 API Docs: http://{host}:{port}/docs")
    print(f"🔧 Debug mode: {debug}")
    
    # Start server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        reload_dirs=[str(backend_dir)] if debug else None,
        log_level="info" if debug else "warning"
    )

if __name__ == "__main__":
    main()