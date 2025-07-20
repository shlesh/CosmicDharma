# backend/main.py - Fixed imports for proper package structure

import logging
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir.parent))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

# Import with proper error handling
try:
    # Try importing from the current directory
    from db import Base, engine, get_session
    from models import User, BlogPost, Prompt, Report, PasswordResetToken
    from auth import get_current_user
    from routes import auth_router, profile_router, blog_router, admin_router
    from utils.email_utils import send_email
except ImportError as e:
    logging.error(f"Import error: {e}")
    logging.error("Please ensure your backend modules are properly structured")
    # Don't exit, try to continue with what we have

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

# Create tables with error handling
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
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
    logger.info("All routers loaded successfully")
except Exception as e:
    logger.warning(f"Some routers could not be loaded: {e}")

# Basic health check
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": "2.0", 
        "timestamp": datetime.utcnow().isoformat(),
        "python_path": sys.path[:3]
    }

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Cosmic Dharma API v2.0", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
