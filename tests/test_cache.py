from datetime import date, time
from backend.services import astro


def test_profile_cache(monkeypatch):
    calls = {"geo": 0}
    def fake_geo(loc):
        calls["geo"] += 1
        return 10.0, 20.0, "UTC"

    monkeypatch.setattr(astro, "geocode_location", fake_geo)
    monkeypatch.setattr(astro, "get_birth_info", lambda **k: {"jd_ut": 0, "sidereal_offset": 0, "cusps": []})
    monkeypatch.setattr(astro, "calculate_planets", lambda *a, **k: [])
    monkeypatch.setattr(astro, "calculate_vimshottari_dasha", lambda *a, **k: [])
    monkeypatch.setattr(astro, "get_nakshatra", lambda *a, **k: {})
    monkeypatch.setattr(astro, "analyze_houses", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_core_elements", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_divisional_charts", lambda *a, **k: {})
    monkeypatch.setattr(astro, "get_vargottama_planets", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_vedic_aspects", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_sign_aspects", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_all_yogas", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_shadbala", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_bhava_bala", lambda *a, **k: {})
    monkeypatch.setattr(astro, "calculate_ashtakavarga", lambda *a, **k: {})
    monkeypatch.setattr(astro, "full_analysis", lambda *a, **k: {})

    astro.CONFIG["cache_enabled"] = "true"
    astro.clear_profile_cache()

    req = astro.ProfileRequest(date=date(2020,1,1), time=time(12,0), location="Delhi")
    astro.compute_vedic_profile(req)
    assert calls["geo"] == 1
    astro.compute_vedic_profile(req)
    assert calls["geo"] == 1
