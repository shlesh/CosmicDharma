"""Donor status is granted by an admin, never self-assigned at registration."""
from app import models
from app.core import auth


def _bearer(username):
    return {"Authorization": f"Bearer {auth.create_access_token({'sub': username})}"}


def test_register_ignores_client_supplied_privileges(test_app):
    client, Session = test_app
    resp = client.post(
        "/api/register",
        json={"username": "sneaky", "email": "s@example.com", "password": "pw123456",
              "is_donor": True, "is_admin": True},
    )
    assert resp.status_code == 200

    with Session() as db:
        user = db.query(models.User).filter_by(username="sneaky").one()
        assert user.is_donor is False
        assert user.is_admin is False

    # ...so the donor-only endpoints stay closed to them.
    assert client.get("/api/prompts", headers=_bearer("sneaky")).status_code == 403


def _seed(Session):
    with Session() as db:
        db.add_all([
            models.User(username="boss", email="b@example.com",
                        hashed_password=auth.get_password_hash("pw"), is_admin=True),
            models.User(username="fan", email="f@example.com",
                        hashed_password=auth.get_password_hash("pw")),
        ])
        db.commit()


def test_admin_can_grant_and_revoke_donor(test_app):
    client, Session = test_app
    _seed(Session)

    resp = client.patch("/api/admin/users/fan/donor", json={"is_donor": True}, headers=_bearer("boss"))
    assert resp.status_code == 200
    assert resp.json()["is_donor"] is True
    assert client.get("/api/prompts", headers=_bearer("fan")).status_code == 200

    resp = client.patch("/api/admin/users/fan/donor", json={"is_donor": False}, headers=_bearer("boss"))
    assert resp.json()["is_donor"] is False
    assert client.get("/api/prompts", headers=_bearer("fan")).status_code == 403


def test_non_admin_cannot_grant_donor(test_app):
    client, Session = test_app
    _seed(Session)
    resp = client.patch("/api/admin/users/fan/donor", json={"is_donor": True}, headers=_bearer("fan"))
    assert resp.status_code == 403
    with Session() as db:
        assert db.query(models.User).filter_by(username="fan").one().is_donor is False


def test_grant_donor_unknown_user_is_404(test_app):
    client, Session = test_app
    _seed(Session)
    resp = client.patch("/api/admin/users/ghost/donor", json={"is_donor": True}, headers=_bearer("boss"))
    assert resp.status_code == 404
