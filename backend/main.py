# backend/main.py - ENHANCED ERROR HANDLING
import logging
import os
import sys
from pathlib import Path
from typing import Dict, Any
import traceback

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir.parent))

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session
from datetime import datetime
import swisseph as swe

# Import with proper error handling
try:
    from db import Base, engine, get_session
    from models import User, BlogPost, Prompt, Report, PasswordResetToken
    from auth import get_current_user
    from routes import auth_router, profile_router, blog_router, admin_router
    from utils.email_utils import send_email
except ImportError as e:
    logging.error(f"Import error: {e}")
    logging.error("Please ensure your backend modules are properly structured")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log') if os.getenv('LOG_TO_FILE') else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Cosmic Dharma - Vedic Astrology API",
    description="Comprehensive Vedic astrology calculations following traditional principles",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enhanced CORS configuration
frontend_urls = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://cosmicdharma.netlify.app",  # Add production URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    
    try:
        response = await call_next(request)
        
        # Log response
        process_time = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Response: {response.status_code} - {process_time:.4f}s")
        
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise

# Enhanced error handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.method} {request.url}: {exc}")
    
    # Extract readable error messages
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(x) for x in error["loc"])
        message = error["msg"]
        errors.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation failed",
            "errors": errors,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP {exc.status_code} on {request.method} {request.url}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.error(f"ValueError on {request.method} {request.url}: {str(exc)}")
    
    return JSONResponse(
        status_code=400,
        content={
            "detail": f"Invalid input: {str(exc)}",
            "error_type": "ValueError",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(swe.Error)
async def swisseph_error_handler(request: Request, exc: swe.Error):
    logger.error(f"SwissEph error on {request.method} {request.url}: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Astronomical calculation error. Please check your input data.",
            "error_type": "SwissEphError",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url}: {str(exc)}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Please try again later.",
            "error_type": type(exc).__name__,
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": f"{request.method}_{hash(str(request.url))}_{int(datetime.utcnow().timestamp())}"
        }
    )

# Create tables with enhanced error handling
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created successfully")
except Exception as e:
    logger.error(f"❌ Database initialization error: {e}")
    logger.error(traceback.format_exc())

# Include routers with error handling
try:
    app.include_router(auth_router, prefix="/api", tags=["Authentication"])
    app.include_router(profile_router, prefix="/api", tags=["Astrology"])
    app.include_router(blog_router, prefix="/api", tags=["Blog"])
    app.include_router(admin_router, prefix="/api", tags=["Admin"])
    logger.info("✅ All routers loaded successfully")
except Exception as e:
    logger.warning(f"⚠️ Some routers could not be loaded: {e}")

# Enhanced health check with system info
@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        from db import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": "2.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": db_status,
            "swisseph": "healthy",  # Could add actual test here
        },
        "uptime": "N/A",  # Could implement uptime tracking
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Enhanced system info endpoint
@app.get("/api/system-info")
async def system_info():
    return {
        "python_version": sys.version,
        "python_path": sys.path[:3],
        "backend_dir": str(backend_dir),
        "environment_vars": {
            "ENVIRONMENT": os.getenv("ENVIRONMENT"),
            "DATABASE_URL": os.getenv("DATABASE_URL", "Not set"),
            "REDIS_URL": os.getenv("REDIS_URL", "Not set"),
            "CACHE_ENABLED": os.getenv("CACHE_ENABLED", "true"),
        }
    }

# Root endpoint with API info
@app.get("/")
async def root():
    return {
        "message": "🌟 Cosmic Dharma API v2.1.0",
        "description": "Comprehensive Vedic Astrology Platform",
        "docs": "/docs",
        "health": "/api/health",
        "endpoints": {
            "auth": "/api/login, /api/register",
            "profile": "/api/profile",
            "blog": "/api/posts",
            "admin": "/api/admin"
        },
        "features": [
            "Birth chart analysis",
            "Planetary positions",
            "Dasha calculations",
            "Yoga detection",
            "House analysis"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info"
    )
