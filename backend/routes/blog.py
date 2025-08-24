from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
import re

from backend.db import get_session
from backend.models import BlogPost, User
from backend.auth import get_current_user

router = APIRouter()

def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
    slug = re.sub(r'\s+', '-', slug.strip())
    return slug[:100]  # Limit length

class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    excerpt: Optional[str] = Field(None, max_length=500)
    published: bool = True
    featured: bool = False
    tags: Optional[str] = Field(None, max_length=500)

class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    excerpt: Optional[str] = Field(None, max_length=500)
    published: Optional[bool] = None
    featured: Optional[bool] = None
    tags: Optional[str] = Field(None, max_length=500)

class BlogPostOut(BaseModel):
    id: int
    title: str
    content: str
    excerpt: Optional[str]
    slug: str
    published: bool
    featured: bool
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime
    owner: str

    class Config:
        from_attributes = True

class BlogPostSummary(BaseModel):
    id: int
    title: str
    excerpt: Optional[str]
    slug: str
    published: bool
    featured: bool
    tags: Optional[str]
    created_at: datetime
    owner: str

@router.post("/posts", response_model=BlogPostOut)
def create_post(
    post: BlogPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Create a new blog post"""
    slug = create_slug(post.title)
    
    # Ensure slug is unique
    existing = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    counter = 1
    original_slug = slug
    while existing:
        slug = f"{original_slug}-{counter}"
        existing = db.query(BlogPost).filter(BlogPost.slug == slug).first()
        counter += 1
    
    # Create excerpt if not provided
    excerpt = post.excerpt
    if not excerpt and post.content:
        # Create excerpt from content (first 200 chars)
        excerpt = (post.content[:200] + "...") if len(post.content) > 200 else post.content
    
    db_post = BlogPost(
        title=post.title,
        content=post.content,
        excerpt=excerpt,
        slug=slug,
        published=post.published,
        featured=post.featured,
        tags=post.tags,
        owner=current_user
    )
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    return BlogPostOut(
        id=db_post.id,
        title=db_post.title,
        content=db_post.content,
        excerpt=db_post.excerpt,
        slug=db_post.slug,
        published=db_post.published,
        featured=db_post.featured,
        tags=db_post.tags,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at,
        owner=current_user.username,
    )

@router.get("/posts", response_model=List[BlogPostSummary])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    published_only: bool = Query(True),
    featured_only: bool = Query(False),
    db: Session = Depends(get_session)
):
    """List blog posts with pagination and filters"""
    query = db.query(BlogPost)
    
    if published_only:
        query = query.filter(BlogPost.published == True)
    
    if featured_only:
        query = query.filter(BlogPost.featured == True)
    
    if search:
        search_filter = or_(
            BlogPost.title.ilike(f"%{search}%"),
            BlogPost.content.ilike(f"%{search}%"),
            BlogPost.excerpt.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        for tag in tag_list:
            query = query.filter(BlogPost.tags.ilike(f"%{tag}%"))
    
    posts = query.order_by(desc(BlogPost.created_at)).offset(skip).limit(limit).all()
    
    return [
        BlogPostSummary(
            id=p.id,
            title=p.title,
            excerpt=p.excerpt,
            slug=p.slug,
            published=p.published,
            featured=p.featured,
            tags=p.tags,
            created_at=p.created_at,
            owner=p.owner.username,
        )
        for p in posts
    ]

@router.get("/posts/{slug}", response_model=BlogPostOut)
def get_post_by_slug(slug: str, db: Session = Depends(get_session)):
    """Get a specific blog post by slug"""
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if not post.published:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return BlogPostOut(
        id=post.id,
        title=post.title,
        content=post.content,
        excerpt=post.excerpt,
        slug=post.slug,
        published=post.published,
        featured=post.featured,
        tags=post.tags,
        created_at=post.created_at,
        updated_at=post.updated_at,
        owner=post.owner.username,
    )

@router.get("/posts/id/{post_id}", response_model=BlogPostOut)
def get_post_by_id(post_id: int, db: Session = Depends(get_session)):
    """Get a specific blog post by ID"""
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return BlogPostOut(
        id=post.id,
        title=post.title,
        content=post.content,
        excerpt=post.excerpt,
        slug=post.slug,
        published=post.published,
        featured=post.featured,
        tags=post.tags,
        created_at=post.created_at,
        updated_at=post.updated_at,
        owner=post.owner.username,
    )

@router.put("/posts/{post_id}", response_model=BlogPostOut)
def update_post(
    post_id: int,
    post_update: BlogPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Update a blog post"""
    db_post = db.get(BlogPost, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    
    # Update fields
    update_data = post_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_post, field, value)
    
    # Update slug if title changed
    if post_update.title and post_update.title != db_post.title:
        new_slug = create_slug(post_update.title)
        # Ensure new slug is unique
        existing = db.query(BlogPost).filter(
            BlogPost.slug == new_slug, 
            BlogPost.id != post_id
        ).first()
        counter = 1
        original_slug = new_slug
        while existing:
            new_slug = f"{original_slug}-{counter}"
            existing = db.query(BlogPost).filter(
                BlogPost.slug == new_slug, 
                BlogPost.id != post_id
            ).first()
            counter += 1
        db_post.slug = new_slug
    
    db_post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_post)
    
    return BlogPostOut(
        id=db_post.id,
        title=db_post.title,
        content=db_post.content,
        excerpt=db_post.excerpt,
        slug=db_post.slug,
        published=db_post.published,
        featured=db_post.featured,
        tags=db_post.tags,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at,
        owner=db_post.owner.username,
    )

@router.delete("/posts/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Delete a blog post"""
    db_post = db.get(BlogPost, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db.delete(db_post)
    db.commit()
    return Response(status_code=204)

@router.get("/featured", response_model=List[BlogPostSummary])
def get_featured_posts(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_session)
):
    """Get featured blog posts"""
    posts = db.query(BlogPost).filter(
        BlogPost.published == True,
        BlogPost.featured == True
    ).order_by(desc(BlogPost.created_at)).limit(limit).all()
    
    return [
        BlogPostSummary(
            id=p.id,
            title=p.title,
            excerpt=p.excerpt,
            slug=p.slug,
            published=p.published,
            featured=p.featured,
            tags=p.tags,
            created_at=p.created_at,
            owner=p.owner.username,
        )
        for p in posts
    ]

@router.get("/tags")
def get_tags(db: Session = Depends(get_session)):
    """Get all unique tags from published posts"""
    posts = db.query(BlogPost.tags).filter(
        BlogPost.published == True,
        BlogPost.tags.isnot(None)
    ).all()
    
    all_tags = set()
    for post in posts:
        if post.tags:
            tags = [tag.strip() for tag in post.tags.split(",")]
            all_tags.update(tags)
    
    return {"tags": sorted(list(all_tags))}
