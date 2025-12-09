import swisseph as swe
from backend.app.astrology.house_analysis import analyze_houses


def test_house_system_override(monkeypatch):
    calls = []

    def fake_houses(jd, lat, lon, hsys=b'P'):
        calls.append(hsys)
        return ([i * 30.0 for i in range(12)], [0] * 8)

    monkeypatch.setattr(swe, 'houses', fake_houses)

    binfo = {
        'jd_ut': 0,
        'latitude': 0,
        'longitude': 0,
        'cusps': [0] * 12,
    }
    planets = [{'name': 'Sun', 'longitude': 10.0, 'sign': 1}]

    res = analyze_houses(binfo, planets, house_system='W')
    assert calls[0] == b'W'
    assert res['placements']['Sun']['house'] == 1
    assert res['houses'][1] == ['Sun']


def test_cusp_boundary():
    cusps = [i * 30.0 for i in range(12)]
    binfo = {
        'jd_ut': 0,
        'latitude': 0,
        'longitude': 0,
        'cusps': cusps,
    }
    planet = {'name': 'Sun', 'longitude': 30.0, 'sign': 2}
    res = analyze_houses(binfo, [planet])
    assert res['placements']['Sun']['house'] == 2


def test_mutual_aspects():
    cusps = [i * 30.0 for i in range(12)]
    binfo = {
        'jd_ut': 0,
        'latitude': 0,
        'longitude': 0,
        'cusps': cusps,
    }
    planets = [
        {'name': 'Mars', 'longitude': 0.0, 'sign': 1},
        {'name': 'Saturn', 'longitude': 180.0, 'sign': 7},
    ]
    res = analyze_houses(binfo, planets)
    pairs = [set(p) for p in res['aspects']['mutual_aspects']]
    assert {'Mars', 'Saturn'} in pairs
    assert res['placements']['Mars']['house'] == 1
    assert res['placements']['Saturn']['house'] == 7
