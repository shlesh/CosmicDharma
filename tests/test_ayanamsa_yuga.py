import pytest
import swisseph as swe

from backend.app.astrology.ayanamsa import get_ayanamsa, yukteswar_ayanamsa
from backend.app.astrology.yuga import describe_yuga


def test_yukteswar_anchor_1894():
    jd = swe.julday(1894, 1, 1, 0.0)
    val = yukteswar_ayanamsa(jd)
    expected = 20 + 54 / 60 + 36 / 3600
    assert abs(val - expected) < 1e-6


def test_yukteswar_rate():
    jd0 = swe.julday(1894, 1, 1, 0.0)
    jd1 = swe.julday(1895, 1, 1, 0.0)
    delta = (yukteswar_ayanamsa(jd1) - yukteswar_ayanamsa(jd0)) * 3600
    assert abs(delta - 54.0) < 0.02


def test_unknown_ayanamsa_raises():
    with pytest.raises(ValueError):
        get_ayanamsa(2451545.0, "not-a-frame")


def test_yuga_now_is_ascending_dwapara():
    state = describe_yuga(2026)
    assert state["name"] == "Dwapara"
    assert state["arc"] == "ascending"
    assert state["next_yuga"] == "Treta"
    assert state["next_year"] == 4100


def test_yuga_kali_nadir():
    state = describe_yuga(500)
    assert state["name"] == "Kali"
    assert state["arc"] == "ascending"
