from datetime import date, time

from backend.app.services import astro


def test_profile_includes_lineage_yuga_panchanga(monkeypatch):
    monkeypatch.setattr(astro, "geocode_location", lambda loc: (28.6, 77.2, "UTC"))
    monkeypatch.setattr(
        astro,
        "get_birth_info",
        lambda **k: {
            "jd_ut": 2451545.0,
            "cusps": [0] * 12,
            "lagna_sign": 1,
            "local": "2020-01-01T12:00:00+00:00",
            "yuga": {"name": "Dwapara", "display": "Ascending Dwapara Yuga"},
            "ayanamsa": {"name": "Sri Yukteswar (Revati)", "value": 22.8},
        },
    )
    monkeypatch.setattr(
        astro,
        "calculate_planets",
        lambda *a, **k: [
            {"name": "Sun", "longitude": 0, "sign": 1, "degree": 0},
            {"name": "Moon", "longitude": 15, "sign": 1, "degree": 15},
        ],
    )
    monkeypatch.setattr(astro, "calculate_vimshottari_dasha", lambda *a, **k: [])
    monkeypatch.setattr(astro, "get_nakshatra", lambda planets: {"nakshatra": "Ashwini", "pada": 1})
    monkeypatch.setattr(astro, "analyze_houses", lambda *a, **k: {"1": ["Sun"]})
    monkeypatch.setattr(astro, "calculate_core_elements", lambda *a, **k: {"Fire": 1})
    monkeypatch.setattr(astro, "calculate_divisional_charts", lambda *a, **k: {"D1": {}})
    monkeypatch.setattr(astro, "get_vargottama_planets", lambda *a, **k: [])
    monkeypatch.setattr(astro, "calculate_vedic_aspects", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_sign_aspects", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_all_yogas", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_shadbala", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_bhava_bala", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_ashtakavarga", lambda *a, **k: {"bav": {}, "sav": {}})
    monkeypatch.setattr(astro, "full_analysis", lambda *a, **k: {})
    astro.CONFIG["cache_enabled"] = "false"

    req = astro.ProfileRequest(date=date(2020, 1, 1), time=time(12, 0), location="Delhi")
    result = astro.compute_vedic_profile(req)

    assert result["panchanga"]["tithi"]["name"].startswith("Shukla")
    assert result["yuga"]["name"] == "Dwapara"
    assert "Yukteswar" in result["lineage"]["frame"]
    assert result["birthInfo"]["latitude"] == 28.6
