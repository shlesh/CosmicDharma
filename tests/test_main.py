from fastapi.testclient import TestClient
from backend import main
from backend.services import astro
from backend import models, auth
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sqlalchemy
from types import SimpleNamespace

client = TestClient(main.app)


def test_profile(monkeypatch):
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
    data = main.ProfileResponse.model_validate(resp.json())
    assert data.birthInfo["latitude"] == 10.0
    assert data.birthInfo["longitude"] == 20.0


def test_divisional_charts(monkeypatch):
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
    data = main.ProfileResponse.model_validate(resp.json())
    assert data.divisionalCharts == {"D1": {}}


def test_dasha(monkeypatch):
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
    data = main.ProfileResponse.model_validate(resp.json())
    assert data.vimshottariDasha == [{"lord": "Sun"}]


def test_geocode_error(monkeypatch):
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

