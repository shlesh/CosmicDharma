from fastapi.testclient import TestClient
from backend import main, models, auth
from backend.utils import email_utils
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


def test_password_reset_flow(monkeypatch):
    client, Session = setup_test_app()

    sent = {}

    def fake_send(to, subject, body):
        sent["to"] = to
        sent["body"] = body

    monkeypatch.setattr(main, "send_email", fake_send)

    with Session() as db:
        user = models.User(
            username="u1",
            email="u1@example.com",
            hashed_password=auth.get_password_hash("old"),
        )
        db.add(user)
        db.commit()

    resp = client.post("/request-reset", json={"email": "u1@example.com"})
    assert resp.status_code == 200

    with Session() as db:
        token_obj = db.query(models.PasswordResetToken).first()
        assert token_obj is not None
        token_value = token_obj.token

    assert sent["to"] == "u1@example.com"
    assert token_value in sent["body"]

    resp = client.post(
        "/reset-password",
        json={"token": token_value, "new_password": "newpass"},
    )
    assert resp.status_code == 200

    with Session() as db:
        user = db.query(models.User).first()
        assert auth.verify_password("newpass", user.hashed_password)
        token_obj = db.query(models.PasswordResetToken).first()
        assert token_obj.used
