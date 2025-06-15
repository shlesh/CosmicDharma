from datetime import date, time
from backend import main


def test_profile_cache(monkeypatch):
    calls = {"geo": 0}
    def fake_geo(loc):
        calls["geo"] += 1
        return 10.0, 20.0, "UTC"

    monkeypatch.setattr(main, "geocode_location", fake_geo)
    monkeypatch.setattr(main, "get_birth_info", lambda **k: {"jd_ut": 0, "sidereal_offset": 0, "cusps": []})
    monkeypatch.setattr(main, "calculate_planets", lambda *a, **k: [])
    monkeypatch.setattr(main, "calculate_vimshottari_dasha", lambda *a, **k: [])
    monkeypatch.setattr(main, "get_nakshatra", lambda *a, **k: {})
    monkeypatch.setattr(main, "analyze_houses", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_core_elements", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_divisional_charts", lambda *a, **k: {})
    monkeypatch.setattr(main, "get_vargottama_planets", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_vedic_aspects", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_sign_aspects", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_all_yogas", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_shadbala", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_bhava_bala", lambda *a, **k: {})
    monkeypatch.setattr(main, "calculate_ashtakavarga", lambda *a, **k: {})
    monkeypatch.setattr(main, "full_analysis", lambda *a, **k: {})

    main.CONFIG["cache_enabled"] = "true"
    main.clear_profile_cache()

    req = main.ProfileRequest(date=date(2020,1,1), time=time(12,0), location="Delhi")
    main._compute_vedic_profile(req)
    assert calls["geo"] == 1
    main._compute_vedic_profile(req)
    assert calls["geo"] == 1
