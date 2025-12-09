# backend/main.py
import logging
import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

# ✅ use package-relative imports
from .db import Base, engine, get_session
from .models import User, BlogPost, Prompt, Report, PasswordResetToken
from .auth import get_current_user
from .routes.auth import router as auth_router
from .routes.profile import router as profile_router
from .routes.blog import router as blog_router
from .routes.admin import router as admin_router


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
        'http://127.0.0.1:3000',
        "http://localhost:3001",
        "http://localhost:3002",
        # add your production site origin
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

@app.get("/health")
async def health_check_alias():
    return {"status": "healthy"}

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
