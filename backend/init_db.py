# backend/init_db.py
"""Database initialization script"""

import sys
from pathlib import Path

# Add paths
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir.parent))
sys.path.insert(0, str(backend_dir))

def init_database():
    """Initialize database with all tables"""
    try:
        from db import Base, engine
        from models import User, BlogPost, Prompt, Report, PasswordResetToken
        
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # Create default admin user
        from sqlalchemy.orm import sessionmaker
        from auth import get_password_hash
        
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Check if admin exists
        admin = session.query(User).filter_by(username="admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@cosmicdharma.com",
                hashed_password=get_password_hash("admin123"),
                is_admin=True,
                is_donor=True
            )
            session.add(admin)
            session.commit()
            print("✅ Admin user created (admin/admin123)")
        
        session.close()
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_database()
