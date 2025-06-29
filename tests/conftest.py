import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sqlalchemy

from backend import main, models, auth


@pytest.fixture
def test_app():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=sqlalchemy.pool.StaticPool,
    )
    TestingSession = sessionmaker(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    def override():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    overrides = main.app.dependency_overrides.copy()
    main.app.dependency_overrides[main.get_session] = override
    main.app.dependency_overrides[auth.get_session] = override
    client = TestClient(main.app)
    try:
        yield client, TestingSession
    finally:
        main.app.dependency_overrides = overrides

