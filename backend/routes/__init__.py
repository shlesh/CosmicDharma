from .auth import router as auth_router
from .profile import router as profile_router
from .blog import router as blog_router
from .admin import router as admin_router

__all__ = [
    "auth_router",
    "profile_router",
    "blog_router",
    "admin_router",
]
