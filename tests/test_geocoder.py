import pytest
from types import SimpleNamespace

from backend.app.core import geocoder


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

    def fake_once(q, locale=None):
        call_count["n"] += 1
        return 1.0, 2.0, "Asia/Kolkata"

    monkeypatch.setattr(geocoder, "_geocode_once", fake_once)
    for _ in range(2):
        lat, lon, tz = geocoder.geocode_location("Renukoot, Sonbhadra, India")
        assert (lat, lon, tz) == (1.0, 2.0, "Asia/Kolkata")

    assert call_count["n"] == 1


def test_geocode_locale(monkeypatch):
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)
    captured = {}

    def fake_geocode(q, exactly_one=True, language=None):
        captured["lang"] = language
        return SimpleNamespace(latitude=1.0, longitude=2.0)

    monkeypatch.setattr(geocoder._geopy, "geocode", fake_geocode)
    monkeypatch.setattr(geocoder, "_tzfinder", SimpleNamespace(timezone_at=lambda lat, lng: "Asia/Kolkata"))

    lat, lon, tz = geocoder.geocode_location("Renukoot, Sonbhadra, India", locale="hi")
    assert lat == 1.0
    assert lon == 2.0
    assert tz == "Asia/Kolkata"
    assert captured["lang"] == "hi"


@pytest.mark.asyncio
async def test_geocode_async(monkeypatch):
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)

    async def fake_get(url, params=None):
        return SimpleNamespace(
            raise_for_status=lambda: None,
            json=lambda: [{"lat": "1.0", "lon": "2.0"}]
        )

    class DummyClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, exc_type, exc, tb):
            return False
        async def get(self, url, params=None):
            assert params.get("accept-language") == "en"
            return await fake_get(url, params)

    monkeypatch.setattr(geocoder.httpx, "AsyncClient", DummyClient)
    monkeypatch.setattr(geocoder, "_tzfinder", SimpleNamespace(timezone_at=lambda lat, lng: "UTC"))

    lat, lon, tz = await geocoder.geocode_location_async("Renukoot", locale="en")
    assert lat == 1.0
    assert lon == 2.0
    assert tz == "UTC"
