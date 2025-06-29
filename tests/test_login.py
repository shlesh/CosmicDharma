from backend import models, auth


def test_login_valid(test_app):
    client, Session = test_app
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


def test_login_invalid(test_app):
    client, Session = test_app
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
