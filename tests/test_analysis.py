from backend.app.astrology.analysis import (
    interpret_nakshatra,
    interpret_houses,
    interpret_core_elements,
    interpret_dasha_sequence,
    interpret_divisional_charts,
    full_analysis,
)


def test_interpret_nakshatra():
    res = interpret_nakshatra({'nakshatra': 'Ashwini', 'pada': 1})
    assert res['nakshatra'] == 'Ashwini'
    assert res['pada'] == 1
    assert 'Healing' in res['description']


def test_interpret_houses():
    mapping = {1: ['Sun'], 2: []}
    res = interpret_houses(mapping)
    assert 'Sun' in res[1]
    assert 'no major planets' in res[2]


def test_interpret_core_elements():
    res = interpret_core_elements({'Fire': 60})
    assert res['Fire'].startswith('Fire: 60%')


def test_interpret_dasha_sequence():
    dashas = [{'lord': 'Sun', 'start': '2020', 'end': '2021'}]
    res = interpret_dasha_sequence(dashas)
    assert res[0]['lord'] == 'Sun'
    assert 'vitality' in res[0]['description'].lower()


def test_interpret_divisional_charts():
    charts = {'D1': {'Sun': 1, 'Moon': 1}}
    res = interpret_divisional_charts(charts)
    assert 'D1' in res
    assert res['D1']['distribution']['Aries'] == 2


def test_full_analysis():
    planets = [{'name': 'Sun', 'longitude': 10.0}]
    dashas = [{'lord': 'Sun', 'start': '2020', 'end': '2021'}]
    nak = {'nakshatra': 'Ashwini', 'pada': 1}
    houses = {1: ['Sun']}
    core = {'Fire': 60}
    dcharts = {'D1': {'Sun': 1}}
    out = full_analysis(planets, dashas, nak, houses, core, dcharts)
    assert 'nakshatra' in out
    assert 'houses' in out
    assert 'coreElements' in out
    assert 'vimshottariDasha' in out
    assert 'divisionalCharts' in out


def test_full_analysis_cache():
    planets = []
    dashas = []
    nak = {}
    houses = {}
    core = {}
    dcharts = {}
    from backend.app.astrology import analysis
    analysis._CACHE.clear()
    first = full_analysis(planets, dashas, nak, houses, core, dcharts, jd=123)
    second = full_analysis(planets, dashas, nak, houses, core, dcharts, jd=123)
    assert first is second
    analysis._CACHE.clear()
