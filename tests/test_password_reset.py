from backend.app import models
from backend.app.core import auth
from backend.app.routes import auth as auth_routes

def test_password_reset_flow(test_app, monkeypatch):
    client, Session = test_app

    sent = {}

    def fake_send(to, subject, body):
        sent["to"] = to
        sent["body"] = body

    monkeypatch.setattr(auth_routes, "send_email", fake_send)

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
