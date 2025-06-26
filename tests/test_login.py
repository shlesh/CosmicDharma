from fastapi.testclient import TestClient
from backend import main, models, auth
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sqlalchemy


def setup_test_app():
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

    main.app.dependency_overrides[main.get_session] = override
    main.app.dependency_overrides[auth.get_session] = override
    return TestClient(main.app), TestingSession


def test_login_valid():
    client, Session = setup_test_app()
    with Session() as db:
        user = models.User(
            username="test",
            email="t@example.com",
            hashed_password=auth.get_password_hash("pw"),
        )
        db.add(user)
        db.commit()

    resp = client.post("/login", data={"username": "test", "password": "pw"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_invalid():
    client, Session = setup_test_app()
    with Session() as db:
        user = models.User(
            username="user",
            email="u@example.com",
            hashed_password=auth.get_password_hash("pw"),
        )
        db.add(user)
        db.commit()

    resp = client.post("/login", data={"username": "user", "password": "bad"})
    assert resp.status_code == 400
