from backend.ashtakavarga import calculate_ashtakavarga


def test_example_chart_one():
    planets = [
        {"name": "Sun", "sign": 1},
        {"name": "Moon", "sign": 4},
        {"name": "Mars", "sign": 6},
    ]
    res = calculate_ashtakavarga(planets)
    expected_bav = {
        "Sun": {1: 1, 2: 1, 3: 0, 4: 1, 5: 0, 6: 0, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 0},
        "Moon": {1: 0, 2: 1, 3: 0, 4: 1, 5: 1, 6: 1, 7: 0, 8: 1, 9: 1, 10: 1, 11: 0, 12: 1},
        "Mars": {1: 1, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0, 8: 1, 9: 1, 10: 0, 11: 1, 12: 0},
    }
    expected_totals = {1: 2, 2: 2, 3: 1, 4: 3, 5: 2, 6: 2, 7: 1, 8: 3, 9: 3, 10: 2, 11: 2, 12: 1}
    assert res["bav"] == expected_bav
    assert res["total_points"] == expected_totals


def test_example_chart_two():
    planets = [
        {"name": "Mercury", "sign": 2},
        {"name": "Jupiter", "sign": 5},
        {"name": "Venus", "sign": 9},
        {"name": "Saturn", "sign": 11},
    ]
    res = calculate_ashtakavarga(planets)
    expected_bav = {
        "Mercury": {1: 1, 2: 1, 3: 1, 4: 0, 5: 1, 6: 0, 7: 1, 8: 0, 9: 1, 10: 0, 11: 1, 12: 1},
        "Jupiter": {1: 1, 2: 1, 3: 1, 4: 0, 5: 1, 6: 1, 7: 0, 8: 1, 9: 1, 10: 0, 11: 1, 12: 0},
        "Venus": {1: 1, 2: 0, 3: 1, 4: 0, 5: 1, 6: 1, 7: 0, 8: 0, 9: 1, 10: 1, 11: 1, 12: 1},
        "Saturn": {1: 1, 2: 0, 3: 1, 4: 1, 5: 1, 6: 0, 7: 0, 8: 1, 9: 1, 10: 0, 11: 1, 12: 1},
    }
    expected_totals = {1: 4, 2: 2, 3: 4, 4: 1, 5: 4, 6: 2, 7: 1, 8: 2, 9: 4, 10: 1, 11: 4, 12: 3}
    assert res["bav"] == expected_bav
    assert res["total_points"] == expected_totals
