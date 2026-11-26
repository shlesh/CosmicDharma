"""Production runs on Postgres (Neon), tests on SQLite unless TEST_DATABASE_URL is set."""
from datetime import datetime, timedelta, timezone

import pytest

from app import models
from app.core import auth
from app.core.db import normalize_database_url
from app.routes.auth import _as_utc


@pytest.mark.parametrize(
    "given, expected",
    [
        ("postgres://u:p@host/db?sslmode=require", "postgresql+psycopg://u:p@host/db?sslmode=require"),
        ("postgresql://u:p@host/db", "postgresql+psycopg://u:p@host/db"),
        ("postgresql+psycopg://u:p@host/db", "postgresql+psycopg://u:p@host/db"),
        ("sqlite:///./app.db", "sqlite:///./app.db"),
    ],
)
def test_normalize_database_url(given, expected):
    assert normalize_database_url(given) == expected


def test_as_utc_makes_naive_and_aware_comparable():
    naive = datetime(2026, 1, 1, 12, 0)
    aware = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    assert _as_utc(naive) == aware
    assert _as_utc(aware) is aware


def test_reset_with_timezone_aware_expiry(test_app):
    """Postgres hands back aware datetimes; comparing them with utcnow() used to raise (500)."""
    client, Session = test_app
    with Session() as db:
        user = models.User(username="tz", email="tz@example.com",
                           hashed_password=auth.get_password_hash("old"))
        db.add(user)
        db.commit()
        db.add(models.PasswordResetToken(
            user_id=user.id, token="aware",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)))
        db.add(models.PasswordResetToken(
            user_id=user.id, token="expired",
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1)))
        db.commit()

    assert client.post("/reset-password", json={"token": "expired", "new_password": "x"}).status_code == 400
    resp = client.post("/reset-password", json={"token": "aware", "new_password": "newpass"})
    assert resp.status_code == 200, resp.text
