import pytest
from types import SimpleNamespace

from backend import geocoder


def test_geocode_exact(monkeypatch):
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)

    def fake_geocode(q, exactly_one=True):
        if q == "Renukoot, Sonbhadra, India":
            return SimpleNamespace(latitude=1.0, longitude=2.0)
        return None

    monkeypatch.setattr(geocoder._geopy, "geocode", fake_geocode)
    monkeypatch.setattr(geocoder, "_tzfinder", SimpleNamespace(timezone_at=lambda lat, lng: "Asia/Kolkata"))

    lat, lon, tz = geocoder.geocode_location("Renukoot, Sonbhadra, India")
    assert lat == 1.0
    assert lon == 2.0
    assert tz == "Asia/Kolkata"


def test_geocode_fallback(monkeypatch):
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)
    calls = []

    def fake_geocode(q, exactly_one=True):
        calls.append(q)
        if q == "Renukoot, Sonebhadra, India":
            return None
        if q == "Renukoot, Sonebhadra":
            return None
        if q == "Renukoot":
            return SimpleNamespace(latitude=5.0, longitude=6.0)
        return None

    monkeypatch.setattr(geocoder._geopy, "geocode", fake_geocode)
    monkeypatch.setattr(geocoder, "_tzfinder", SimpleNamespace(timezone_at=lambda lat, lng: "Asia/Kolkata"))

    lat, lon, tz = geocoder.geocode_location("Renukoot, Sonebhadra, India")
    assert lat == 5.0
    assert lon == 6.0
    assert tz == "Asia/Kolkata"
    assert calls == [
        "Renukoot, Sonebhadra, India",
        "Renukoot, Sonebhadra",
        "Renukoot",
    ]


def test_geocode_failure(monkeypatch):
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)
    monkeypatch.setattr(geocoder._geopy, "geocode", lambda q, exactly_one=True: None)

    with pytest.raises(ValueError):
        geocoder.geocode_location("Unknown Place")


def test_geocode_cached(monkeypatch):
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)
    call_count = {"n": 0}

    def fake_once(q):
        call_count["n"] += 1
        return 1.0, 2.0, "Asia/Kolkata"

    monkeypatch.setattr(geocoder, "_geocode_once", fake_once)
    for _ in range(2):
        lat, lon, tz = geocoder.geocode_location("Renukoot, Sonbhadra, India")
        assert (lat, lon, tz) == (1.0, 2.0, "Asia/Kolkata")

    assert call_count["n"] == 1
