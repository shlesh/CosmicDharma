#!/usr/bin/env python3
"""
Cosmic Dharma Backend Server
Starts the FastAPI application with proper configuration
"""

import os
import sys
import uvicorn
from pathlib import Path

def main():
    """Start the FastAPI server"""
    # Add backend to Python path
    backend_dir = Path(__file__).parent
    sys.path.insert(0, str(backend_dir))
    sys.path.insert(0, str(backend_dir.parent))
    
    # Set environment variables
    os.environ.setdefault("PYTHONPATH", str(backend_dir))
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    print(f"🚀 Starting Cosmic Dharma Backend")
    print(f"📍 Server: http://{host}:{port}")
    print(f"📚 API Docs: http://{host}:{port}/docs")
    print(f"🔧 Debug mode: {debug}")
    print(f"📂 Working directory: {os.getcwd()}")
    
    try:
        # Import main app to check for errors
        from main import app
        print("✅ App imported successfully")
        
        # Start server
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=debug,
            reload_dirs=[str(backend_dir)] if debug else None,
            log_level="info" if debug else "warning"
        )
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Please ensure your backend modules are properly structured")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
