import datetime
import pytest
import swisseph as swe

from app.astrology import birth_info as birth_info_mod
from app.astrology.birth_info import get_birth_info, get_lagna, AYANAMSHA_MAP
from app.astrology.constants import RASHI_METADATA


def test_ayanamsha_and_house(monkeypatch):
    calls = {}

    def fake_set_sid_mode(mode):
        calls['mode'] = mode

    def fake_houses(jd, lat, lon, hsys=b'P'):
        calls['hsys'] = hsys
        return ([0] * 12, [0] * 8)

    monkeypatch.setattr(swe, 'set_sid_mode', fake_set_sid_mode)
    monkeypatch.setattr(swe, 'get_ayanamsa', lambda jd: 0)
    monkeypatch.setattr(swe, 'houses', fake_houses)
    monkeypatch.setattr(swe, 'julday', lambda *a, **k: 0)

    get_birth_info(
        datetime.date(2020, 1, 1),
        datetime.time(0, 0),
        10,
        20,
        'UTC',
        ayanamsha='lahiri',
        house_system='W',
    )

    assert calls['mode'] == swe.SIDM_LAHIRI
    assert calls['hsys'] == b'W'


def test_invalid_latitude():
    with pytest.raises(ValueError):
        get_birth_info(
            datetime.date(2020, 1, 1),
            datetime.time(0, 0),
            100,
            20,
            'UTC',
        )


def test_invalid_timezone():
    with pytest.raises(ValueError):
        get_birth_info(
            datetime.date(2020, 1, 1),
            datetime.time(0, 0),
            10,
            20,
            'Invalid/Zone',
        )


def test_unknown_ayanamsha():
    """Invalid ayanamsha string should raise ValueError."""
    with pytest.raises(ValueError):
        get_birth_info(
            datetime.date(2020, 1, 1),
            datetime.time(0, 0),
            10,
            20,
            'UTC',
            ayanamsha='invalid',
        )


def test_unknown_house_system():
    """Invalid house system should raise ValueError."""
    with pytest.raises(ValueError):
        get_birth_info(
            datetime.date(2020, 1, 1),
            datetime.time(0, 0),
            10,
            20,
            'UTC',
            house_system='invalid',
        )


def test_get_lagna_basic(monkeypatch):
    """get_lagna should return metadata for the rising sign."""
    # The Lagna comes from ascmc[0] (the Ascendant), not from the first cusp.
    def fake_houses(jd, lat, lon, hsys=b'P'):
        return ([0.0] * 12, [45.0] + [0] * 7)

    monkeypatch.setattr(swe, 'houses', fake_houses)
    monkeypatch.setattr(birth_info_mod, 'get_ayanamsa', lambda jd, mode="yukteswar": 0.0)

    res = get_lagna(0.0, 0.0, 0.0)
    assert res == RASHI_METADATA[1]
