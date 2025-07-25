from fastapi.testclient import TestClient
from backend import main
from backend.routes import profile
from backend.services import astro
import fakeredis
from backend import models, auth
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sqlalchemy
from types import SimpleNamespace

client = TestClient(main.app)


def _parse_response(data: dict):
    """Helper to parse responses across Pydantic versions."""
    if hasattr(profile.ProfileResponse, "model_validate"):
        return profile.ProfileResponse.model_validate(data)
    return profile.ProfileResponse.parse_obj(data)


def test_profile(monkeypatch):
    fake = fakeredis.FakeRedis()
    monkeypatch.setattr(astro, "_CACHE", fake)
    astro.clear_profile_cache()
    # stub external services
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))

    # stub astrology calculations
    monkeypatch.setattr(astro, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12})
    monkeypatch.setattr(astro, "calculate_planets", lambda *a, **k: [{"name": "Moon", "longitude": 10, "sign": 1, "degree": 10}])
    monkeypatch.setattr(astro, "calculate_vimshottari_dasha", lambda *a, **k: [])
    monkeypatch.setattr(astro, "get_nakshatra", lambda planets: {"nakshatra": "Ashwini", "pada": 1})
    monkeypatch.setattr(astro, "analyze_houses", lambda *a, **k: {1: ["Moon"]})
    monkeypatch.setattr(astro, "calculate_core_elements", lambda *a, **k: {"Fire": 100})
    monkeypatch.setattr(astro, "calculate_divisional_charts", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_ashtakavarga", lambda *a, **k: {"bav": {}, "total_points": {}})
    monkeypatch.setattr(astro, "full_analysis", lambda *a, **k: {})

    resp = client.post("/profile", json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"})
    assert resp.status_code == 200
    data = _parse_response(resp.json())
    assert data.birthInfo["latitude"] == 10.0
    assert data.birthInfo["longitude"] == 20.0


def test_divisional_charts(monkeypatch):
    fake = fakeredis.FakeRedis()
    monkeypatch.setattr(astro, "_CACHE", fake)
    astro.clear_profile_cache()
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))
    monkeypatch.setattr(astro, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12})
    monkeypatch.setattr(astro, "calculate_planets", lambda *a, **k: [])
    monkeypatch.setattr(astro, "calculate_vimshottari_dasha", lambda *a, **k: [])
    monkeypatch.setattr(astro, "get_nakshatra", lambda planets: {})
    monkeypatch.setattr(astro, "analyze_houses", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_core_elements", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_divisional_charts", lambda *a, **k: {"D1": {}})
    monkeypatch.setattr(astro, "calculate_ashtakavarga", lambda *a, **k: {"bav": {}, "total_points": {}})
    monkeypatch.setattr(astro, "full_analysis", lambda *a, **k: {})

    resp = client.post("/divisional-charts", json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"})
    assert resp.status_code == 200
    data = _parse_response(resp.json())
    assert data.divisionalCharts == {"D1": {}}


def test_dasha(monkeypatch):
    fake = fakeredis.FakeRedis()
    monkeypatch.setattr(astro, "_CACHE", fake)
    astro.clear_profile_cache()
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))
    monkeypatch.setattr(astro, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12})
    monkeypatch.setattr(astro, "calculate_planets", lambda *a, **k: [])
    monkeypatch.setattr(astro, "calculate_vimshottari_dasha", lambda *a, **k: [{"lord": "Sun"}])
    monkeypatch.setattr(astro, "get_nakshatra", lambda planets: {})
    monkeypatch.setattr(astro, "analyze_houses", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_core_elements", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_divisional_charts", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_ashtakavarga", lambda *a, **k: {"bav": {}, "total_points": {}})
    monkeypatch.setattr(astro, "full_analysis", lambda *a, **k: {})

    resp = client.post("/dasha", json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"})
    assert resp.status_code == 200
    data = _parse_response(resp.json())
    assert data.vimshottariDasha == [{"lord": "Sun"}]


def test_geocode_error(monkeypatch):
    fake = fakeredis.FakeRedis()
    monkeypatch.setattr(astro, "_CACHE", fake)
    astro.clear_profile_cache()
    def fail(loc):
        raise ValueError("bad location")

    monkeypatch.setattr(astro, "geocode_location", fail)

    resp = client.post(
        "/profile",
        json={"date": "2020-01-01", "time": "12:00:00", "location": "Nowhere"},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "bad location"


def test_birth_info_invalid(monkeypatch):
    fake = fakeredis.FakeRedis()
    monkeypatch.setattr(astro, "_CACHE", fake)
    astro.clear_profile_cache()
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))

    def bad_birth(**kwargs):
        raise ValueError("date out of range")

    monkeypatch.setattr(astro, "get_birth_info", bad_birth)

    resp = client.post(
        "/profile",
        json={"date": "1600-01-01", "time": "12:00:00", "location": "Delhi"},
    )
    assert resp.status_code == 400
    assert "date out of range" in resp.json()["detail"]


def test_swisseph_failure(monkeypatch):
    fake = fakeredis.FakeRedis()
    monkeypatch.setattr(astro, "_CACHE", fake)
    astro.clear_profile_cache()
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))
    monkeypatch.setattr(astro, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12, "sidereal_offset": 0})

    import swisseph as swe

    def boom(*a, **k):
        raise swe.Error("calc failed")

    monkeypatch.setattr(astro, "calculate_planets", boom)

    resp = client.post(
        "/profile",
        json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"},
    )
    assert resp.status_code == 500
    assert "SwissEph" in resp.json()["detail"]

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


def test_admin_routes_require_admin():
    client, Session = setup_test_app()
    with Session() as db:
        user = models.User(
            username="u1",
            email="u1@example.com",
            hashed_password=auth.get_password_hash("pw"),
            is_admin=False,
        )
        db.add(user)
        db.commit()
    token = auth.create_access_token({"sub": "u1"})
    resp = client.get("/admin/posts", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_admin_can_update_post():
    client, Session = setup_test_app()
    with Session() as db:
        admin = models.User(
            username="admin",
            email="admin@example.com",
            hashed_password=auth.get_password_hash("pw"),
            is_admin=True,
        )
        user = models.User(
            username="author",
            email="auth@example.com",
            hashed_password=auth.get_password_hash("pw"),
            is_admin=False,
        )
        db.add_all([admin, user])
        db.commit()
        post = models.BlogPost(title="t", content="c", owner=user)
        db.add(post)
        db.commit()
        db.refresh(post)
        pid = post.id
    token = auth.create_access_token({"sub": "admin"})
    resp = client.put(
        f"/admin/posts/{pid}",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"title": "new", "content": "upd"},
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "new"


def test_admin_can_list_users():
    client, Session = setup_test_app()
    with Session() as db:
        admin = models.User(
            username="admin",
            email="admin@example.com",
            hashed_password=auth.get_password_hash("pw"),
            is_admin=True,
        )
        user = models.User(
            username="user",
            email="user@example.com",
            hashed_password=auth.get_password_hash("pw"),
            is_admin=False,
        )
        db.add_all([admin, user])
        db.commit()
    token = auth.create_access_token({"sub": "admin"})
    resp = client.get(
        "/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert any(u["username"] == "user" for u in data)


def test_admin_metrics_and_donor_endpoints():
    client, Session = setup_test_app()
    with Session() as db:
        admin = models.User(
            username="admin",
            email="admin@example.com",
            hashed_password=auth.get_password_hash("pw"),
            is_admin=True,
        )
        donor = models.User(
            username="donor",
            email="donor@example.com",
            hashed_password=auth.get_password_hash("pw"),
            is_donor=True,
        )
        user = models.User(
            username="user",
            email="user@example.com",
            hashed_password=auth.get_password_hash("pw"),
        )
        db.add_all([admin, donor, user])
        db.commit()
        db.add_all([
            models.BlogPost(title="t", content="c", owner=admin),
            models.BlogPost(title="t2", content="c2", owner=donor),
        ])
        db.commit()

    token_admin = auth.create_access_token({"sub": "admin"})
    resp = client.get(
        "/admin/metrics",
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    assert resp.status_code == 200
    assert resp.json() == {"users": 3, "posts": 2, "donors": 1}

    token_user = auth.create_access_token({"sub": "user"})
    assert client.get("/prompts", headers={"Authorization": f"Bearer {token_user}"}).status_code == 403

    token_donor = auth.create_access_token({"sub": "donor"})
    resp = client.get("/prompts", headers={"Authorization": f"Bearer {token_donor}"})
    assert resp.status_code == 200 and resp.json() == []
    resp = client.get("/reports", headers={"Authorization": f"Bearer {token_donor}"})
    assert resp.status_code == 200 and resp.json() == []


def test_donor_prompt_report_crud():
    client, Session = setup_test_app()
    with Session() as db:
        donor = models.User(
            username="donor",
            email="donor@example.com",
            hashed_password=auth.get_password_hash("pw"),
            is_donor=True,
        )
        db.add(donor)
        db.commit()

    token = auth.create_access_token({"sub": "donor"})

    resp = client.post(
        "/prompts",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"text": "What is my future?"},
    )
    assert resp.status_code == 200

    resp = client.get("/prompts", headers={"Authorization": f"Bearer {token}"})
    assert any(p["text"] == "What is my future?" for p in resp.json())

    resp = client.post(
        "/reports",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"content": "Great things ahead."},
    )
    assert resp.status_code == 200

    resp = client.get("/reports", headers={"Authorization": f"Bearer {token}"})
    assert any(r["content"] == "Great things ahead." for r in resp.json())


def test_yogas_route(monkeypatch):
    monkeypatch.setattr(profile, "compute_vedic_profile", lambda req: {
        "yogas": {"TestYoga": {}},
        "analysis": {"yogas": {"TestYoga": {}}}
    })
    resp = client.post(
        "/yogas",
        json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"},
    )
    assert resp.status_code == 200
    data = _parse_response(resp.json())
    assert data.yogas == {"TestYoga": {}}
    assert data.analysis == {"TestYoga": {}}


def test_strengths_route(monkeypatch):
    monkeypatch.setattr(profile, "compute_vedic_profile", lambda req: {
        "shadbala": {"Sun": 1},
        "bhavaBala": {"1": 10}
    })
    resp = client.post(
        "/strengths",
        json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"},
    )
    assert resp.status_code == 200
    data = _parse_response(resp.json())
    assert data.shadbala == {"Sun": 1}
    assert data.bhavaBala == {"1": 10}


def test_health_route():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"
