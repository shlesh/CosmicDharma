#!/usr/bin/env python3
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import Base, engine, SessionLocal
from backend.models import User, BlogPost
from backend.auth import get_password_hash


def seed():
    """Seed the database with demo users and posts."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if admin exists
        admin = db.query(User).filter_by(username="admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                is_admin=True,
            )
            db.add(admin)
            print("✓ Created admin user")

        # Check if regular user exists
        user = db.query(User).filter_by(username="user").first()
        if not user:
            user = User(
                username="user",
                email="user@example.com",
                hashed_password=get_password_hash("password"),
                is_admin=False,
            )
            db.add(user)
            print("✓ Created regular user")

        # Check if donor exists
        donor = db.query(User).filter_by(username="donor").first()
        if not donor:
            donor = User(
                username="donor",
                email="donor@example.com",
                hashed_password=get_password_hash("donor"),
                is_donor=True,
            )
            db.add(donor)
            print("✓ Created donor user")

        db.commit()

        # Add sample posts if none exist
        if db.query(BlogPost).count() == 0:
            posts = [
                BlogPost(
                    title="Welcome to Cosmic Dharma",
                    content="Discover the ancient wisdom of Vedic astrology...",
                    owner=admin
                ),
                BlogPost(
                    title="Understanding Your Birth Chart",
                    content="Your birth chart is a cosmic blueprint...",
                    owner=user
                ),
            ]
            db.add_all(posts)
            db.commit()
            print("✓ Created sample blog posts")

        print("\nDatabase seeded successfully!")
        print("\nYou can login with:")
        print("  Admin:   admin / admin")
        print("  User:    user / password")
        print("  Donor:   donor / donor")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
