import math
from backend.core_elements import calculate_core_elements


def test_sign_mapping():
    planets = [
        {"name": "Mercury", "sign": 7},  # Libra should be Air
        {"name": "Mars", "sign": 8},  # Scorpio should be Water
    ]
    res = calculate_core_elements(planets)
    assert res["Air"] == 50.0
    assert res["Water"] == 50.0
    assert res["Space"] == 0.0


def test_modalities_and_weighting():
    planets = [
        {"name": "Sun", "sign": 1},  # Aries - Cardinal
        {"name": "Moon", "sign": 2},  # Taurus - Fixed
        {"name": "Mercury", "sign": 3},  # Gemini - Mutable
    ]
    res = calculate_core_elements(planets, luminary_weight=2, include_modalities=True)
    elems = res["elements"]
    mods = res["modalities"]
    assert elems["Fire"] == 40.0
    assert elems["Earth"] == 40.0
    assert elems["Air"] == 20.0
    assert mods["Cardinal"] == 40.0
    assert mods["Fixed"] == 40.0
    assert mods["Mutable"] == 20.0
