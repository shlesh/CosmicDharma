import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import Base, engine, SessionLocal
from backend.models import User, BlogPost
from backend.auth import get_password_hash


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    admin = db.query(User).filter_by(username="admin").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin"),
            is_admin=True,
        )
        db.add(admin)

    user = db.query(User).filter_by(username="user").first()
    if not user:
        user = User(
            username="user",
            email="user@example.com",
            hashed_password=get_password_hash("password"),
            is_admin=False,
        )
        db.add(user)

    donor = db.query(User).filter_by(username="donor").first()
    if not donor:
        donor = User(
            username="donor",
            email="donor@example.com",
            hashed_password=get_password_hash("donor"),
            is_donor=True,
        )
        db.add(donor)

    db.commit()

    posts = [
        BlogPost(title="Welcome", content="This is the first post", owner=admin),
        BlogPost(title="Second Post", content="Another example post", owner=user),
    ]
    db.add_all(posts)
    db.commit()
    db.close()
    print("Database seeded.\n")
    print("Login with admin/admin, user/password or donor/donor")


if __name__ == "__main__":
    seed()
