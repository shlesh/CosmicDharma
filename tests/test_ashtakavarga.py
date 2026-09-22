from backend.app.astrology.ashtakavarga import calculate_ashtakavarga


def test_bav_canonical_totals():
    planets = [
        {"name": "Sun", "sign": 1},
        {"name": "Moon", "sign": 4},
        {"name": "Mars", "sign": 6},
        {"name": "Mercury", "sign": 3},
        {"name": "Jupiter", "sign": 9},
        {"name": "Venus", "sign": 2},
        {"name": "Saturn", "sign": 10},
    ]
    res = calculate_ashtakavarga(planets, lagna_sign=1)
    totals = {name: sum(points.values()) for name, points in res["bav"].items()}
    assert totals == {
        "Sun": 48, "Moon": 49, "Mars": 39, "Mercury": 54,
        "Jupiter": 56, "Venus": 52, "Saturn": 39,
    }
    assert sum(res["sav"].values()) == 337


def test_ashtakavarga_structure():
    planets = [{"name": "Sun", "sign": 1}, {"name": "Moon", "sign": 4}]
    res = calculate_ashtakavarga(planets, lagna_sign=5)
    assert set(res["bav"]) == {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"}
    assert res["lagna_sign"] == 5
