"""Security hardening: secrets, demo data, who can publish, and what errors reveal."""
import importlib
import subprocess
import sys
from pathlib import Path

import pytest

from app import models
from app.core import auth, settings

BACKEND = Path(__file__).resolve().parents[1] / "backend"


# --- SECRET_KEY -----------------------------------------------------------------------------

def _reload_settings(monkeypatch, app_env, secret):
    monkeypatch.setenv("APP_ENV", app_env)
    if secret is None:
        monkeypatch.delenv("SECRET_KEY", raising=False)
    else:
        monkeypatch.setenv("SECRET_KEY", secret)
    return importlib.reload(settings)


@pytest.fixture(autouse=True)
def _restore_settings(monkeypatch):
    yield
    monkeypatch.setenv("APP_ENV", "test")
    importlib.reload(settings)


@pytest.mark.parametrize("secret", [None, "", "change-me", "short-but-random-x9"])
def test_production_refuses_weak_or_missing_secret(monkeypatch, secret):
    s = _reload_settings(monkeypatch, "production", secret)
    with pytest.raises(s.InsecureConfigError):
        s.load_secret_key()


def test_production_accepts_strong_secret(monkeypatch):
    strong = "k" * 8 + "Q7v_2pLx9RmZ4tW8yB1nC6dF3hJ5sA0e"
    s = _reload_settings(monkeypatch, "production", strong)
    assert s.load_secret_key() == strong


def test_app_env_defaults_to_production(monkeypatch):
    monkeypatch.delenv("APP_ENV", raising=False)
    s = importlib.reload(settings)
    assert s.APP_ENV == "production" and not s.IS_DEV


def test_development_tolerates_placeholder_and_missing(monkeypatch):
    s = _reload_settings(monkeypatch, "development", "change-me")
    assert s.load_secret_key() == "change-me"  # stable, so dev reloads don't log you out
    s = _reload_settings(monkeypatch, "development", None)
    assert len(s.load_secret_key()) >= 32


def test_server_will_not_start_in_production_without_a_secret():
    env = {"APP_ENV": "production", "SECRET_KEY": "change-me", "PATH": "", "SYSTEMROOT": _systemroot()}
    proc = subprocess.run(
        [sys.executable, "-c", "import main"], cwd=BACKEND, env=env, capture_output=True, text=True, timeout=120
    )
    assert proc.returncode != 0
    assert "InsecureConfigError" in proc.stderr


def _systemroot():
    import os
    return os.environ.get("SYSTEMROOT", "")


# --- demo seed --------------------------------------------------------------------------------

def test_demo_seed_refuses_outside_development(tmp_path):
    env = {"APP_ENV": "production", "DATABASE_URL": f"sqlite:///{tmp_path / 'x.db'}", "SYSTEMROOT": _systemroot()}
    proc = subprocess.run(
        [sys.executable, str(BACKEND / "seed_demo.py")], env=env, capture_output=True, text=True, timeout=120
    )
    assert proc.returncode != 0
    assert "Refusing to seed" in proc.stderr
    assert not (tmp_path / "x.db").exists()


# --- publishing -----------------------------------------------------------------------------

def _bearer(username):
    return {"Authorization": f"Bearer {auth.create_access_token({'sub': username})}"}


def _users(Session):
    with Session() as db:
        db.add_all([
            models.User(username="boss", email="b@e.com", hashed_password=auth.get_password_hash("pw"), is_admin=True),
            models.User(username="fan", email="f@e.com", hashed_password=auth.get_password_hash("pw"), is_donor=True),
        ])
        db.commit()


def test_only_admins_can_publish_posts(test_app):
    client, Session = test_app
    _users(Session)
    post = {"title": "Hello", "content": "World"}
    assert client.post("/api/posts", json=post, headers=_bearer("fan")).status_code == 403
    assert client.post("/api/posts", json=post, headers=_bearer("boss")).status_code == 200


# --- error responses --------------------------------------------------------------------------

def test_500s_do_not_leak_exception_text(test_app, monkeypatch):
    from app.routes import profile as profile_routes

    def boom(req):
        raise RuntimeError("secret internals: /srv/app/db.sqlite password=hunter2")

    monkeypatch.setattr(profile_routes, "compute_vedic_profile", boom)
    client, _ = test_app
    body = {"date": "1990-01-01", "time": "10:00", "location": "Delhi"}
    for path in ("/api/profile", "/api/divisional-charts", "/api/dasha"):
        resp = client.post(path, json=body)
        assert resp.status_code == 500, path
        assert "hunter2" not in resp.text and "internals" not in resp.text, path


def test_4xx_from_the_service_is_not_turned_into_a_500(test_app, monkeypatch):
    from fastapi import HTTPException
    from app.routes import profile as profile_routes

    def unknown_place(req):
        raise HTTPException(status_code=400, detail="Could not resolve location 'Atlantis'")

    monkeypatch.setattr(profile_routes, "compute_vedic_profile", unknown_place)
    client, _ = test_app
    body = {"date": "1990-01-01", "time": "10:00", "location": "Atlantis"}
    for path in ("/api/profile/quick", "/api/divisional-charts", "/api/dasha"):
        resp = client.post(path, json=body)
        assert resp.status_code == 400, path
        assert "Atlantis" in resp.text, path
