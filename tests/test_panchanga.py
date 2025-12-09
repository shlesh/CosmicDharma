import pytz
from datetime import datetime, date, time
import fakeredis
from fastapi.testclient import TestClient
import pytest
from fastapi import HTTPException

from backend import main
from backend.app.routes import profile
from backend.app.services import astro
from backend.app.astrology import panchanga

client = TestClient(main.app)


def test_tithi_calculation():
    res = panchanga.get_tithi(0.0, 13.0)
    assert res["index"] == 2
    assert "Dvitiya" in res["name"]


def test_karana_calculation():
    res = panchanga.get_karana(0.0, 15.0)
    assert res["name"] == "Kaulava"


def test_vaara():
    dt = pytz.timezone("UTC").localize(datetime(2023, 8, 28))
    assert panchanga.get_vaara(dt) == "Monday"


def test_compute_panchanga(monkeypatch):
    fake = fakeredis.FakeRedis()
    monkeypatch.setattr(astro, "_CACHE", fake)
    astro.clear_profile_cache()
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))
    monkeypatch.setattr(astro, "get_birth_info", lambda **k: {"jd_ut": 0, "sidereal_offset": 0})
    monkeypatch.setattr(astro, "calculate_planets", lambda *a, **k: [
        {"name": "Sun", "longitude": 0},
        {"name": "Moon", "longitude": 15},
    ])
    req = astro.ProfileRequest(date=date(2020,1,1), time=time(12,0), location="Delhi")
    data = astro.compute_panchanga(req)
    assert data["tithi"]["name"].startswith("Shukla")
    assert data["vaara"] == "Wednesday"


def test_panchanga_route(monkeypatch):
    monkeypatch.setattr(profile, "compute_panchanga", lambda req: {"vaara": "Friday"})
    resp = client.post("/panchanga", json={"date": "2020-01-01", "time": "12:00:00", "location": "Delhi"})
    assert resp.status_code == 200
    assert resp.json()["panchanga"] == {"vaara": "Friday"}


def test_compute_panchanga_geocode_error(monkeypatch):
    """geocode_location raising ValueError should result in HTTP 400."""
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (_ for _ in ()).throw(ValueError("bad location")))
    req = astro.ProfileRequest(date=date(2020, 1, 1), time=time(12, 0), location="Nowhere")
    with pytest.raises(HTTPException) as exc:
        astro.compute_panchanga(req)
    assert exc.value.status_code == 400


def test_compute_panchanga_birth_info_error(monkeypatch):
    """get_birth_info raising ValueError should result in HTTP 400."""
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (10.0, 20.0, "UTC"))
    monkeypatch.setattr(astro, "get_birth_info", lambda **k: (_ for _ in ()).throw(ValueError("bad info")))
    req = astro.ProfileRequest(date=date(2020, 1, 1), time=time(12, 0), location="Delhi")
    with pytest.raises(HTTPException) as exc:
        astro.compute_panchanga(req)
    assert exc.value.status_code == 400
