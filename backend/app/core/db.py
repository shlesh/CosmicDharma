import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


def normalize_database_url(url: str) -> str:
    """Point Postgres URLs at the psycopg 3 driver.

    Hosts such as Neon and Render hand out `postgres://` or `postgresql://` URLs. SQLAlchemy
    reads a bare `postgresql://` as psycopg2 (not installed) and rejects `postgres://`.
    """
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


def make_engine(url: str):
    url = normalize_database_url(url)
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    # Serverless Postgres (Neon) closes idle connections when it scales to zero; check each
    # pooled connection before use instead of failing the first request after a quiet spell.
    # connect_timeout: fail fast (and let the caller log it) instead of hanging startup.
    return create_engine(url, pool_pre_ping=True, pool_recycle=300, connect_args={"connect_timeout": 10})


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
engine = make_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
