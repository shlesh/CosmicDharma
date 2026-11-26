import os

# Must be set before any app module is imported: it relaxes the SECRET_KEY check and stops
# backend/.env from leaking a developer's local settings into the tests.
os.environ["APP_ENV"] = "test"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sqlalchemy

import main
from app import models
from app.core import auth


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



@pytest.fixture(autouse=True)
def _no_nominatim_throttle(monkeypatch):
    """The 1 req/s Nominatim throttle would slow every test that geocodes; it has its own test."""
    from app.core import geocoder
    monkeypatch.setattr(geocoder, "NOMINATIM_MIN_INTERVAL", 0.0)
