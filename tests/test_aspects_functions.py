from backend.app.astrology.aspects import calculate_vedic_aspects, calculate_sign_aspects


def test_calculate_vedic_aspects_simple():
    planets = [
        {"name": "Mars", "sign": 1},
        {"name": "Jupiter", "sign": 2},
        {"name": "Saturn", "sign": 3},
    ]
    houses = {"houses": {1: ["Mars"], 2: ["Jupiter"], 3: ["Saturn"]}}

    res = calculate_vedic_aspects(planets, houses)
    mapping = {r["planet"]: [a["house"] for a in r["aspects_to"]] for r in res}

    assert set(mapping["Mars"]) == {7, 4, 8}
    assert set(mapping["Jupiter"]) == {8, 6, 10}
    assert set(mapping["Saturn"]) == {9, 5, 12}


def test_calculate_sign_aspects_simple():
    planets = [
        {"name": "Mars", "sign": 1},
        {"name": "Jupiter", "sign": 2},
        {"name": "Saturn", "sign": 3},
    ]
    res = calculate_sign_aspects(planets)

    assert set(res[1]) == {5, 8, 11}
    assert set(res[2]) == {4, 7, 10}
    assert set(res[3]) == {6, 9, 12}
