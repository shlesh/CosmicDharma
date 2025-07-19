import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import Base, engine, SessionLocal
from backend.models import User, BlogPost
from backend.auth import get_password_hash