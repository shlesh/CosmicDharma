import datetime
from backend.dasha import calculate_vimshottari_dasha
from backend.analysis import calculate_all_divisional_charts, DIVISIONAL_CHARTS, DIV_CHART_INTERP


def test_vimshottari_dasha_sequence():
    binfo = {"jd_ut": 2440587.5}
    planets = [{"name": "Moon", "longitude": 10.0}]
    seq = calculate_vimshottari_dasha(binfo, planets)
    assert len(seq) == 9
    assert seq[0]["lord"] == "Ketu"
    assert seq[-1]["lord"] == "Mercury"
    assert seq[0]["start"] == datetime.date(1970, 1, 1)


def test_all_divisional_charts_full():
    planets = [{"name": "Sun", "longitude": 15.0}]
    charts = calculate_all_divisional_charts(planets)
    assert len(charts) == 60
    assert set(charts.keys()) == set(DIVISIONAL_CHARTS.keys())
    for mapping in charts.values():
        val = mapping["Sun"]
        assert 1 <= val <= 12


def test_div_chart_interpretations_complete():
    assert len(DIV_CHART_INTERP) == 60
