# backend/main.py - UPDATED WITH COMPLETE VEDIC FEATURES

import logging
from datetime import datetime
from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    Response,
    BackgroundTasks,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.db import Base, engine, get_session
from backend.models import User, BlogPost
from backend.auth import (
    create_access_token,
    get_password_hash,
    authenticate_user,
    get_current_user,
)

from backend.services.astro import (
    ProfileRequest,
    ProfileResponse,
    compute_vedic_profile,
    enqueue_profile_job,
    get_job,
    clear_profile_cache,
)
from backend.config import load_config

CONFIG = load_config()

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# FastAPI app init
app = FastAPI(
    title="Vedic Astrology Service",
    description="Comprehensive Vedic astrology calculations following traditional principles",
    version="2.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Return validation errors in a structured format."""
    logger.error("Validation error: %s", exc)
    return JSONResponse(status_code=422, content={"detail": exc.errors()})



class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    is_donor: bool = False


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    username: str
    email: str
    is_admin: bool
    is_donor: bool


class BlogPostCreate(BaseModel):
    title: str
    content: str


class BlogPostOut(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    owner: str

    class Config:
        orm_mode = True



@app.post("/profile", response_model=ProfileResponse)
async def get_profile(request: ProfileRequest):
    """Get complete Vedic astrological profile."""
    logger.info("Received profile request: %s", request)
    try:
        result = compute_vedic_profile(request)
        logger.info("Profile computation completed")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/profile/job")
async def start_profile_job(request: ProfileRequest, background_tasks: BackgroundTasks):
    """Start background profile computation and return a job ID."""
    job_id = enqueue_profile_job(request, background_tasks)
    return {"job_id": job_id}


@app.get("/jobs/{job_id}")
async def get_job_result(job_id: str):
    """Retrieve status or result for a previously started job."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/divisional-charts", response_model=ProfileResponse)
async def get_divisional_charts(request: ProfileRequest):
    """Return all 16 main divisional charts based on profile input."""
    logger.info("Received divisional charts request: %s", request)
    data = compute_vedic_profile(request)
    logger.info("Divisional charts computation completed")
    return {"divisionalCharts": data["divisionalCharts"]}


@app.post("/dasha", response_model=ProfileResponse)
async def get_dasha(request: ProfileRequest):
    """Return Vimshottari dasha with sub-periods."""
    logger.info("Received dasha request: %s", request)
    data = compute_vedic_profile(request)
    logger.info("Dasha computation completed")
    return {"vimshottariDasha": data["vimshottariDasha"]}


@app.post("/yogas", response_model=ProfileResponse)
async def get_yogas(request: ProfileRequest):
    """Return all planetary combinations (yogas) in the chart."""
    logger.info("Received yogas request: %s", request)
    data = compute_vedic_profile(request)
    logger.info("Yogas computation completed")
    return {
        "yogas": data["yogas"],
        "analysis": data["analysis"]["yogas"]
    }


@app.post("/strengths", response_model=ProfileResponse)
async def get_strengths(request: ProfileRequest):
    """Return planetary and house strengths."""
    logger.info("Received strengths request: %s", request)
    data = compute_vedic_profile(request)
    logger.info("Strengths computation completed")
    return {
        "shadbala": data["shadbala"],
        "bhavaBala": data["bhavaBala"]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "2.0"}


@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_session)):
    if db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first():
        raise HTTPException(status_code=400, detail="User already exists")
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        is_donor=user.is_donor,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/logout")
def logout():
    return {"message": "Logged out"}


@app.get("/users/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserOut(
        username=current_user.username,
        email=current_user.email,
        is_admin=current_user.is_admin,
        is_donor=current_user.is_donor,
    )


@app.post("/posts", response_model=BlogPostOut)
def create_post(
    post: BlogPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    db_post = BlogPost(title=post.title, content=post.content, owner=current_user)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return BlogPostOut(
        id=db_post.id,
        title=db_post.title,
        content=db_post.content,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at,
        owner=current_user.username,
    )


@app.get("/posts", response_model=list[BlogPostOut])
def list_posts(db: Session = Depends(get_session)):
    posts = db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()
    return [
        BlogPostOut(
            id=p.id,
            title=p.title,
            content=p.content,
            created_at=p.created_at,
            updated_at=p.updated_at,
            owner=p.owner.username,
        )
        for p in posts
    ]


@app.get("/posts/{post_id}", response_model=BlogPostOut)
def get_post(post_id: int, db: Session = Depends(get_session)):
    p = db.query(BlogPost).get(post_id)
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    return BlogPostOut(
        id=p.id,
        title=p.title,
        content=p.content,
        created_at=p.created_at,
        updated_at=p.updated_at,
        owner=p.owner.username,
    )


@app.put("/posts/{post_id}", response_model=BlogPostOut)
def update_post(
    post_id: int,
    post: BlogPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    db_post = db.query(BlogPost).get(post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    db_post.title = post.title
    db_post.content = post.content
    db.commit()
    db.refresh(db_post)
    return BlogPostOut(
        id=db_post.id,
        title=db_post.title,
        content=db_post.content,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at,
        owner=current_user.username,
    )


@app.delete("/posts/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    db_post = db.query(BlogPost).get(post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(db_post)
    db.commit()
    return Response(status_code=204)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@app.get("/admin/posts", response_model=list[BlogPostOut])
def admin_list_posts(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    posts = db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()
    return [
        BlogPostOut(
            id=p.id,
            title=p.title,
            content=p.content,
            created_at=p.created_at,
            updated_at=p.updated_at,
            owner=p.owner.username,
        )
        for p in posts
    ]


@app.put("/admin/posts/{post_id}", response_model=BlogPostOut)
def admin_update_post(
    post_id: int,
    post: BlogPostCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    db_post = db.get(BlogPost, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db_post.title = post.title
    db_post.content = post.content
    db.commit()
    db.refresh(db_post)
    return BlogPostOut(
        id=db_post.id,
        title=db_post.title,
        content=db_post.content,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at,
        owner=db_post.owner.username,
    )


@app.delete("/admin/posts/{post_id}", status_code=204)
def admin_delete_post(
    post_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    db_post = db.get(BlogPost, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return Response(status_code=204)
