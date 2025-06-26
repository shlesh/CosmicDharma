from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_session
from ..models import BlogPost, User
from ..auth import get_current_user

router = APIRouter()


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


@router.post("/posts", response_model=BlogPostOut)
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


@router.get("/posts", response_model=list[BlogPostOut])
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


@router.get("/posts/{post_id}", response_model=BlogPostOut)
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


@router.put("/posts/{post_id}", response_model=BlogPostOut)
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


@router.delete("/posts/{post_id}", status_code=204)
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
