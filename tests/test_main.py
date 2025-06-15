from fastapi.testclient import TestClient
from backend import main
from types import SimpleNamespace

client = TestClient(main.app)


def test_profile(monkeypatch):
    # stub external services
    monkeypatch.setattr(main, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))

    # stub astrology calculations
    monkeypatch.setattr(main, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12})
    monkeypatch.setattr(main, "calculate_planets", lambda *a, **k: [{"name": "Moon", "longitude": 10, "sign": 1, "degree": 10}])
    monkeypatch.setattr(main, "calculate_vimshottari_dasha", lambda *a, **k: [])
    monkeypatch.setattr(main, "get_nakshatra", lambda planets: {"nakshatra": "Ashwini", "pada": 1})
    monkeypatch.setattr(main, "analyze_houses", lambda *a, **k: {1: ["Moon"]})
    monkeypatch.setattr(main, "calculate_core_elements", lambda *a, **k: {"Fire": 100})
    monkeypatch.setattr(main, "calculate_divisional_charts", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_ashtakavarga", lambda *a, **k: {"bav": {}, "total_points": {}})
    monkeypatch.setattr(main, "full_analysis", lambda *a, **k: {})

    resp = client.post("/profile", json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"})
    assert resp.status_code == 200
    data = main.ProfileResponse.model_validate(resp.json())
    assert data.birthInfo["latitude"] == 10.0
    assert data.birthInfo["longitude"] == 20.0


def test_divisional_charts(monkeypatch):
    monkeypatch.setattr(main, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))
    monkeypatch.setattr(main, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12})
    monkeypatch.setattr(main, "calculate_planets", lambda *a, **k: [])
    monkeypatch.setattr(main, "calculate_vimshottari_dasha", lambda *a, **k: [])
    monkeypatch.setattr(main, "get_nakshatra", lambda planets: {})
    monkeypatch.setattr(main, "analyze_houses", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_core_elements", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_divisional_charts", lambda *a, **k: {"D1": {}})
    monkeypatch.setattr(main, "calculate_ashtakavarga", lambda *a, **k: {"bav": {}, "total_points": {}})
    monkeypatch.setattr(main, "full_analysis", lambda *a, **k: {})

    resp = client.post("/divisional-charts", json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"})
    assert resp.status_code == 200
    data = main.ProfileResponse.model_validate(resp.json())
    assert data.divisionalCharts == {"D1": {}}


def test_dasha(monkeypatch):
    monkeypatch.setattr(main, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))
    monkeypatch.setattr(main, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12})
    monkeypatch.setattr(main, "calculate_planets", lambda *a, **k: [])
    monkeypatch.setattr(main, "calculate_vimshottari_dasha", lambda *a, **k: [{"lord": "Sun"}])
    monkeypatch.setattr(main, "get_nakshatra", lambda planets: {})
    monkeypatch.setattr(main, "analyze_houses", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_core_elements", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_divisional_charts", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_ashtakavarga", lambda *a, **k: {"bav": {}, "total_points": {}})
    monkeypatch.setattr(main, "full_analysis", lambda *a, **k: {})

    resp = client.post("/dasha", json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"})
    assert resp.status_code == 200
    data = main.ProfileResponse.model_validate(resp.json())
    assert data.vimshottariDasha == [{"lord": "Sun"}]


def test_geocode_error(monkeypatch):
    def fail(loc):
        raise ValueError("bad location")

    monkeypatch.setattr(main, "geocode_location", fail)

    resp = client.post(
        "/profile",
        json={"date": "2020-01-01", "time": "12:00:00", "location": "Nowhere"},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "bad location"


def test_birth_info_invalid(monkeypatch):
    monkeypatch.setattr(main, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))

    def bad_birth(**kwargs):
        raise ValueError("date out of range")

    monkeypatch.setattr(main, "get_birth_info", bad_birth)

    resp = client.post(
        "/profile",
        json={"date": "1600-01-01", "time": "12:00:00", "location": "Delhi"},
    )
    assert resp.status_code == 400
    assert "date out of range" in resp.json()["detail"]


def test_swisseph_failure(monkeypatch):
    monkeypatch.setattr(main, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))
    monkeypatch.setattr(main, "get_birth_info", lambda **k: {"jd_ut": 0, "cusps": [0]*12, "sidereal_offset": 0})

    import swisseph as swe

    def boom(*a, **k):
        raise swe.Error("calc failed")

    monkeypatch.setattr(main, "calculate_planets", boom)

    resp = client.post(
        "/profile",
        json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"},
    )
    assert resp.status_code == 500
    assert "SwissEph" in resp.json()["detail"]
