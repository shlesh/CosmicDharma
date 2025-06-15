from fastapi.testclient import TestClient
from backend import main
from types import SimpleNamespace

client = TestClient(main.app)


def test_profile(monkeypatch):
    # stub external services
    monkeypatch.setattr(main, "gmaps", None, raising=False)
    monkeypatch.setattr(main.google_fallback, "geocode", lambda *a, **k: [SimpleNamespace(latitude=10.0, longitude=20.0)])
    monkeypatch.setattr(main.timezone_finder.__class__, "timezone_at", lambda self, lat, lng: "UTC", raising=False)

    # stub astrology calculations
    monkeypatch.setattr(main, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12})
    monkeypatch.setattr(main, "calculate_planets", lambda *a, **k: [{"name": "Moon", "longitude": 10, "sign": 1, "degree": 10}])
    monkeypatch.setattr(main, "calculate_vimshottari_dasha", lambda *a, **k: [])
    monkeypatch.setattr(main, "get_nakshatra", lambda planets: {"nakshatra": "Ashwini", "pada": 1})
    monkeypatch.setattr(main, "analyze_houses", lambda *a, **k: {1: ["Moon"]})
    monkeypatch.setattr(main, "calculate_core_elements", lambda *a, **k: {"Fire": 100})
    monkeypatch.setattr(main, "calculate_all_divisional_charts", lambda *a, **k: {})
    monkeypatch.setattr(main, "full_analysis", lambda *a, **k: {})

    resp = client.post("/profile", json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["birthInfo"]["latitude"] == 10.0
    assert data["birthInfo"]["longitude"] == 20.0
