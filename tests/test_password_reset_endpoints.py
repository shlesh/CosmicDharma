from backend import main
from backend.app import models
from backend.app.core import auth
from datetime import datetime, timedelta

def test_request_reset_stores_token_and_sends_email(test_app, monkeypatch):
    client, Session = test_app

    sent = {}

    def fake_send(to, subject, body):
        sent["to"] = to
        sent["body"] = body

    monkeypatch.setattr(main, "send_email", fake_send)

    with Session() as db:
        user = models.User(
            username="u1",
            email="u1@example.com",
            hashed_password=auth.get_password_hash("pw"),
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


def test_reset_password_updates_password_and_marks_token_used(test_app):
    client, Session = test_app

    with Session() as db:
        user = models.User(
            username="u1",
            email="u1@example.com",
            hashed_password=auth.get_password_hash("old"),
        )
        db.add(user)
        db.commit()
        token_obj = models.PasswordResetToken(
            user_id=user.id,
            token="abc123",
            expires_at=datetime.utcnow() + timedelta(hours=1),
        )
        db.add(token_obj)
        db.commit()

    resp = client.post(
        "/reset-password",
        json={"token": "abc123", "new_password": "newpass"},
    )
    assert resp.status_code == 200

    with Session() as db:
        user = db.query(models.User).first()
        assert auth.verify_password("newpass", user.hashed_password)
        token_obj = db.query(models.PasswordResetToken).first()
        assert token_obj.used
