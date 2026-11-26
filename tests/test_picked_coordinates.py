"""The place a user picks in autocomplete must be used as-is, not re-geocoded from its label."""
import pytest

from app.services import astro

BODY = {"date": "1990-01-01", "time": "10:00", "location": "Springfield"}
PICKED = {"lat": 39.7817, "lon": -89.6501}  # Springfield, Illinois (there are dozens of Springfields)


@pytest.fixture
def lookups(monkeypatch):
    calls = {"geocode": [], "tz": []}

    def fake_geocode(query):
        calls["geocode"].append(query)
        return 42.1015, -72.5898, "America/New_York"  # Springfield, Massachusetts

    def fake_tz(lat, lon):
        calls["tz"].append((lat, lon))
        return "America/Chicago"

    monkeypatch.setattr(astro, "geocode_location", fake_geocode)
    monkeypatch.setattr(astro, "timezone_at", fake_tz)
    astro.clear_profile_cache()
    return calls


def test_picked_coordinates_skip_geocoding(test_app, lookups):
    client, _ = test_app
    resp = client.post("/api/profile", json={**BODY, **PICKED})
    assert resp.status_code == 200, resp.text

    birth = resp.json()["birthInfo"]
    assert (birth["latitude"], birth["longitude"]) == (PICKED["lat"], PICKED["lon"])
    assert birth["timezone"] == "America/Chicago"
    assert lookups["geocode"] == []
    assert lookups["tz"] == [(PICKED["lat"], PICKED["lon"])]


def test_label_only_still_geocodes(test_app, lookups):
    client, _ = test_app
    resp = client.post("/api/profile", json=BODY)
    assert resp.status_code == 200, resp.text
    assert lookups["geocode"] == ["Springfield"]
    assert resp.json()["birthInfo"]["latitude"] == 42.1015


def test_same_label_different_coordinates_are_cached_separately(test_app, lookups):
    client, _ = test_app
    illinois = client.post("/api/profile", json={**BODY, **PICKED}).json()
    oregon = client.post("/api/profile", json={**BODY, "lat": 44.0462, "lon": -123.0220}).json()
    assert illinois["birthInfo"]["latitude"] != oregon["birthInfo"]["latitude"]
    # A different longitude moves the ascendant, so these really are two charts.
    assert illinois["birthInfo"]["ascendant"] != oregon["birthInfo"]["ascendant"]


@pytest.mark.parametrize("coords", [{"lat": 39.78}, {"lon": -89.65}, {"lat": 91, "lon": 0}, {"lat": 0, "lon": 181}])
def test_bad_coordinates_are_rejected(test_app, lookups, coords):
    client, _ = test_app
    assert client.post("/api/profile", json={**BODY, **coords}).status_code == 422
    assert client.post("/api/panchanga", json={**BODY, **coords}).status_code == 422
    assert lookups["geocode"] == []


def test_panchanga_uses_picked_coordinates(test_app, lookups):
    client, _ = test_app
    resp = client.post("/api/panchanga", json={**BODY, **PICKED})
    assert resp.status_code == 200, resp.text
    assert lookups["geocode"] == []
    assert lookups["tz"] == [(PICKED["lat"], PICKED["lon"])]


def test_validator_errors_return_422_with_message_not_500(test_app):
    # Regression: the custom 422 handler crashed on ValueError-based validators.
    client, _ = test_app
    resp = client.post("/api/profile", json={"date": "2999-01-01", "time": "10:00", "location": "Delhi"})
    assert resp.status_code == 422
    assert "future" in resp.text
