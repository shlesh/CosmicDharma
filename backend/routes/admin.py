from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from backend.db import get_session
from backend.models import BlogPost, User
from backend.auth import get_current_user
from .blog import BlogPostCreate, BlogPostOut
from .auth import UserOut

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/admin/posts", response_model=list[BlogPostOut])
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


@router.put("/admin/posts/{post_id}", response_model=BlogPostOut)
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


@router.delete("/admin/posts/{post_id}", status_code=204)
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


@router.get("/admin/users", response_model=list[UserOut])
def admin_list_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Return all registered users for admin dashboard."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserOut(
            username=u.username,
            email=u.email,
            is_admin=u.is_admin,
            is_donor=u.is_donor,
        )
        for u in users
    ]


@router.get("/admin/metrics")
def admin_metrics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_session),
):
    """Return basic counts for the admin dashboard."""
    return {
        "users": db.query(User).count(),
        "posts": db.query(BlogPost).count(),
        "donors": db.query(User).filter(User.is_donor.is_(True)).count(),
    }
