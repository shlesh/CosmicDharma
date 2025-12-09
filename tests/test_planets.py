import swisseph as swe
from backend.app.astrology import planets as planets_mod


def test_calculate_planets_with_mock(monkeypatch):
    planets_mod.clear_planet_cache()
    binfo = {'jd_ut': 0, 'sidereal_offset': 24}
    values = {
        swe.SUN: 10.0,
        swe.MOON: 20.0,
        swe.MERCURY: 30.0,
        swe.VENUS: 40.0,
        swe.MARS: 50.0,
        swe.JUPITER: 60.0,
        swe.SATURN: 70.0,
        swe.MEAN_NODE: 80.0,
    }

    def fake_calc_ut(jd, pid):
        return [values.get(pid, 0.0), 0.0, 0.0], None

    monkeypatch.setattr(swe, "calc_ut", fake_calc_ut)
    monkeypatch.setattr(planets_mod, "_is_retrograde", lambda *a, **k: False)

    res = planets_mod.calculate_planets(binfo)
    assert len(res) == 9

    sun = res[0]
    assert sun["name"] == "Sun"
    assert sun["longitude"] == (10.0 - 24) % 360
    assert sun["sign"] == 12
    assert sun["degree"] == 16.0

    ketu = res[-1]
    assert ketu["name"] == "Ketu"
    rahu_lon = (80.0 - 24) % 360
    assert ketu["longitude"] == (rahu_lon + 180) % 360
    assert ketu["retrograde"] is True
