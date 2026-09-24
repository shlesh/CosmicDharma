import swisseph as swe
from backend.app.astrology.house_analysis import analyze_houses


def test_house_system_override(monkeypatch):
    calls = []

    def fake_houses(jd, lat, lon, hsys=b"P"):
        calls.append(hsys)
        return ([i * 30.0 for i in range(12)], [0] * 8)

    monkeypatch.setattr(swe, "houses", fake_houses)
    binfo = {
        "jd_ut": 0, "latitude": 0, "longitude": 0, "cusps": [0] * 12,
        "ascendant": 10.0, "lagna_sign": 1,
    }
    planets = [{"name": "Sun", "longitude": 10.0, "sign": 1}]
    res = analyze_houses(binfo, planets, house_system="W")
    assert calls[0] == b"W"
    assert res["placements"]["Sun"]["house"] == 1
    assert "Sun" in res["occupants"][1]
    assert res["houses"][1]["bhava"] == "Tanu"
    assert res["houses"][1]["notes"]


def test_empty_house_is_not_just_empty():
    binfo = {
        "jd_ut": 0, "latitude": 0, "longitude": 0,
        "cusps": [i * 30.0 for i in range(12)],
        "ascendant": 10.0, "lagna_sign": 2, "house_system": "whole_sign",
    }
    res = analyze_houses(binfo, [{"name": "Sun", "longitude": 40.0, "sign": 2}])
    assert res["houses"][1]["occupants"] == ["Sun"]
    assert res["houses"][3]["occupants"] == []
    assert "Empty." not in res["houses"][3]["summary"]
    assert res["houses"][3]["lord"]


def test_cusp_boundary():
    cusps = [i * 30.0 for i in range(12)]
    binfo = {"jd_ut": 0, "latitude": 0, "longitude": 0, "cusps": cusps, "house_system": "equal"}
    res = analyze_houses(binfo, [{"name": "Sun", "longitude": 30.0, "sign": 2}])
    assert res["placements"]["Sun"]["house"] == 2


def test_mutual_aspects():
    cusps = [i * 30.0 for i in range(12)]
    binfo = {"jd_ut": 0, "latitude": 0, "longitude": 0, "cusps": cusps, "house_system": "equal"}
    planets = [
        {"name": "Mars", "longitude": 0.0, "sign": 1},
        {"name": "Saturn", "longitude": 180.0, "sign": 7},
    ]
    res = analyze_houses(binfo, planets)
    pairs = [set(p) for p in res["aspects"]["mutual_aspects"]]
    assert {"Mars", "Saturn"} in pairs
