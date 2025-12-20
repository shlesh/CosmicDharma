import sys
import os

# Ensure the parent directory is in the path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.db import SessionLocal
from app.models import User
from app.core.auth import get_password_hash

def create_users():
    db = SessionLocal()
    try:
        # Create user: admin / admin
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Creating admin user...")
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                is_admin=True,
                is_donor=True
            )
            db.add(admin)
        else:
            print("Admin user already exists. Updating password...")
            admin.hashed_password = get_password_hash("admin")
            admin.is_admin = True
            admin.is_donor = True
        
        # Create user: user / user
        user = db.query(User).filter(User.username == "user").first()
        if not user:
            print("Creating standard user...")
            user = User(
                username="user",
                email="user@example.com",
                hashed_password=get_password_hash("user"),
                is_admin=False,
                is_donor=False
            )
            db.add(user)
        else:
            print("Standard user already exists. Updating password...")
            user.hashed_password = get_password_hash("user")
            
        db.commit()
        print("Success! Created/Updated users:")
        print(" - admin / admin")
        print(" - user / user")
        
    except Exception as e:
        print(f"Error creating users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_users()
