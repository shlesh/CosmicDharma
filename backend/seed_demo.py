import sqlalchemy
from backend.db import Base, engine, SessionLocal
from backend.models import User, BlogPost
from backend.auth import get_password_hash


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin"),
        is_admin=True,
    )
    user = User(
        username="user",
        email="user@example.com",
        hashed_password=get_password_hash("password"),
        is_admin=False,
    )
    db.add_all([admin, user])
    try:
        db.commit()
    except sqlalchemy.exc.IntegrityError:
        db.rollback()

    posts = [
        BlogPost(title="Welcome", content="This is the first post", owner=admin),
        BlogPost(title="Second Post", content="Another example post", owner=user),
    ]
    db.add_all(posts)
    db.commit()
    db.close()
    print("Database seeded.\n")
    print("Login with admin/admin or user/password")


if __name__ == "__main__":
    seed()
