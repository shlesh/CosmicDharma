import pytest
from types import SimpleNamespace

from app.core import geocoder


def test_geocode_exact(monkeypatch):
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)

    def fake_geocode(q, exactly_one=True):
        if q == "Renukoot, Sonbhadra, India":
            return SimpleNamespace(latitude=1.0, longitude=2.0)
        return None

    monkeypatch.setattr(geocoder._geopy, "geocode", fake_geocode)
    monkeypatch.setattr(geocoder, "timezone_at", lambda lat, lon: "Asia/Kolkata")

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
    monkeypatch.setattr(geocoder, "timezone_at", lambda lat, lon: "Asia/Kolkata")

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
    monkeypatch.setattr(geocoder, "timezone_at", lambda lat, lon: "Asia/Kolkata")

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
        def __init__(self, headers=None, **kwargs):
            # Nominatim rejects anonymous clients; the app must identify itself.
            assert headers and headers.get("User-Agent") == geocoder.NOMINATIM_USER_AGENT
        async def __aenter__(self):
            return self
        async def __aexit__(self, exc_type, exc, tb):
            return False
        async def get(self, url, params=None):
            assert params.get("accept-language") == "en"
            return await fake_get(url, params)

    monkeypatch.setattr(geocoder.httpx, "AsyncClient", DummyClient)
    monkeypatch.setattr(geocoder, "timezone_at", lambda lat, lon: "UTC")

    lat, lon, tz = await geocoder.geocode_location_async("Renukoot", locale="en")
    assert lat == 1.0
    assert lon == 2.0
    assert tz == "UTC"


def test_nominatim_requests_are_spaced_out(monkeypatch):
    # Nominatim's policy allows at most 1 request/second; geocode_location tries several
    # candidate strings, so they must not go out back-to-back.
    import time as _time
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)
    monkeypatch.setattr(geocoder, "NOMINATIM_MIN_INTERVAL", 0.2)
    calls = []

    def fake_geocode(q, exactly_one=True):
        calls.append(_time.monotonic())
        return None  # force it through every candidate

    monkeypatch.setattr(geocoder._geopy, "geocode", fake_geocode)
    with pytest.raises(ValueError):
        geocoder.geocode_location("A, B, C")
    assert len(calls) >= 3
    gaps = [b - a for a, b in zip(calls, calls[1:])]
    assert min(gaps) >= 0.15  # 0.2 s minus Windows timer granularity (~16 ms)


def test_nominatim_gets_an_identifying_user_agent():
    assert geocoder._geopy.headers["User-Agent"] == geocoder.NOMINATIM_USER_AGENT
    assert "python" not in geocoder.NOMINATIM_USER_AGENT.lower()



PHOTON_VARANASI = {"features": [{"geometry": {"type": "Point", "coordinates": [83.0076, 25.3356]}}]}


def test_photon_point_swaps_lon_lat():
    assert geocoder._photon_point(PHOTON_VARANASI) == (25.3356, 83.0076)
    assert geocoder._photon_point({"features": []}) == (None, None)


def test_photon_params_only_pass_supported_languages():
    assert geocoder._photon_params("x", "en-IN") == {"q": "x", "limit": 1, "lang": "en"}
    assert "lang" not in geocoder._photon_params("x", "hi")
    assert "lang" not in geocoder._photon_params("x", None)


def test_falls_back_to_photon_when_nominatim_refuses(monkeypatch):
    """Nominatim blocks many cloud IPs (it refused Render's); Photon then answers."""
    geocoder.geocode_location.cache_clear()
    monkeypatch.setattr(geocoder, "gmaps", None)

    def refused(q, exactly_one=True, **kw):
        raise RuntimeError("403 Forbidden")

    monkeypatch.setattr(geocoder._geopy, "geocode", refused)
    calls = []

    def photon(query, locale=None):
        calls.append(query)
        return 25.3356, 83.0076

    monkeypatch.setattr(geocoder, "_photon_geocode", photon)
    monkeypatch.setattr(geocoder, "timezone_at", lambda lat, lon: "Asia/Kolkata")
    assert geocoder.geocode_location("Varanasi, India") == (25.3356, 83.0076, "Asia/Kolkata")
    assert calls == ["Varanasi, India"]


@pytest.mark.asyncio
async def test_async_falls_back_to_photon(monkeypatch):
    monkeypatch.setattr(geocoder, "gmaps", None)

    class FailingClient:
        def __init__(self, *a, **kw): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *exc): return False
        async def get(self, *a, **kw): raise RuntimeError("403 Forbidden")

    async def photon(query, locale=None):
        return 25.3356, 83.0076

    monkeypatch.setattr(geocoder.httpx, "AsyncClient", FailingClient)
    monkeypatch.setattr(geocoder, "_photon_geocode_async", photon)
    monkeypatch.setattr(geocoder, "timezone_at", lambda lat, lon: "Asia/Kolkata")
    assert await geocoder.geocode_location_async("Varanasi, India") == (25.3356, 83.0076, "Asia/Kolkata")
