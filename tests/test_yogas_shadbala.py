from datetime import time
import math
from backend.app.astrology.yogas import calculate_all_yogas
from backend.app.astrology.shadbala import calculate_shadbala
from backend.app.astrology.divisional_charts import calculate_all_vargas
from backend.app.utils.signs import get_sign_lord


def test_calculate_all_yogas_empty():
    res = calculate_all_yogas([], {"houses": {}})
    assert res["total_count"] == 0
    assert res["summary"] == []
    for yogas in res["yogas"].values():
        assert yogas == []


def test_calculate_all_yogas_nabhasa_only():
    planets = [
        {"name": n, "sign": 1} for n in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    ]
    res = calculate_all_yogas(planets, {"houses": {}})
    names = [y["name"] for y in res["yogas"]["nabhasa_yogas"]]
    assert "Rajju Yoga" in names
    assert res["yogas"]["chandra_yogas"]
    assert res["total_count"] == 1 + len(res["yogas"]["chandra_yogas"])


def test_calculate_shadbala_edge_cases():
    planets = [
        {"name": "Sun", "sign": 5, "degree": 10, "retrograde": False},
        {"name": "Saturn", "sign": 1, "degree": 20, "retrograde": False},
        {"name": "Rahu", "sign": 10, "degree": 0, "retrograde": True},
    ]
    binfo = {"birth_time": time(12, 0), "jd_ut": 2451545.0}
    houses = {"houses": {1: ["Sun"], 7: ["Saturn"]}}
    res = calculate_shadbala(planets, binfo, houses)
    assert "Rahu" not in res
    assert res["Saturn"]["sthana_bala"] == 0
    assert res["Sun"]["dig_bala"] == 30
    assert res["Sun"]["kala_bala"] == 30
    assert res["Saturn"]["kala_bala"] == 15


def test_moon_paksha_bala():
    planets = [
        {"name": "Sun", "sign": 1, "degree": 0, "retrograde": False},
        {"name": "Moon", "sign": 4, "degree": 0, "retrograde": False},
    ]
    binfo = {"birth_time": time(12, 0), "jd_ut": 2451545.0}
    houses = {"houses": {1: ["Sun"], 4: ["Moon"]}}
    res = calculate_shadbala(planets, binfo, houses)
    assert math.isclose(res["Moon"]["kala_bala"], 15.0)


def test_calculate_all_vargas_values():
    res = calculate_all_vargas(15.0)
    assert len(res) == 60
    assert res["D1"] == 1
    assert res["D9"] == 5
    assert res["D10"] == 6
    assert res["D60"] == 7


def test_get_sign_lord_helper():
    assert get_sign_lord(1) == "Mars"
    assert get_sign_lord(12) == "Jupiter"
