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


# CI also runs the suite against a real Postgres (see .github/workflows/tests.yml) by setting
# TEST_DATABASE_URL. Locally it's unset, and each test gets a fresh in-memory SQLite.
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")


def _make_test_engine():
    if TEST_DATABASE_URL:
        from app.core.db import make_engine
        engine = make_engine(TEST_DATABASE_URL)
        models.Base.metadata.drop_all(bind=engine)
        return engine
    return create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=sqlalchemy.pool.StaticPool,
    )


@pytest.fixture
def test_app():
    engine = _make_test_engine()
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
        if TEST_DATABASE_URL:
            models.Base.metadata.drop_all(bind=engine)
        engine.dispose()



@pytest.fixture(autouse=True)
def _no_nominatim_throttle(monkeypatch):
    """The 1 req/s Nominatim throttle would slow every test that geocodes; it has its own test."""
    from app.core import geocoder
    monkeypatch.setattr(geocoder, "NOMINATIM_MIN_INTERVAL", 0.0)


@pytest.fixture(autouse=True)
def _no_photon(monkeypatch):
    """Keep tests off the network: the Photon fallback finds nothing unless a test says otherwise."""
    from app.core import geocoder

    async def _none_async(query, locale=None):
        return None, None

    monkeypatch.setattr(geocoder, "_photon_geocode", lambda query, locale=None: (None, None))
    monkeypatch.setattr(geocoder, "_photon_geocode_async", _none_async)
