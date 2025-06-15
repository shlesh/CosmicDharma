import datetime
from backend.dasha import calculate_vimshottari_dasha
from backend.analysis import (
    calculate_all_divisional_charts,
    DIVISIONAL_CHARTS,
    DIV_CHART_INTERP,
)
from backend.d_charts import calculate_basic_divisional_charts


def test_vimshottari_dasha_sequence():
    binfo = {"jd_ut": 2440587.5}
    planets = [{"name": "Moon", "longitude": 10.0}]
    seq = calculate_vimshottari_dasha(binfo, planets)
    assert len(seq) == 9
    assert seq[0]["lord"] == "Ketu"
    assert seq[-1]["lord"] == "Mercury"
    assert seq[0]["start"] == datetime.date(1970, 1, 1)


def test_antar_dasha_depth_and_start_date():
    binfo = {"jd_ut": 2440587.5}
    planets = [{"name": "Moon", "longitude": 10.0}]
    seq = calculate_vimshottari_dasha(binfo, planets, depth=2)
    ketu = seq[0]
    assert "sub" in ketu
    first_antar = ketu["sub"][0]
    assert first_antar["lord"] == "Ketu"
    assert first_antar["start"] == datetime.date(1970, 1, 1)
    assert first_antar["end"] == datetime.date(1970, 2, 7)

    start = datetime.date(1971, 10, 3)
    seq = calculate_vimshottari_dasha(binfo, planets, start_date=start)
    assert seq[0]["lord"] == "Venus"
    assert seq[0]["start"] == start


def test_pratyantar_depth():
    binfo = {"jd_ut": 2440587.5}
    planets = [{"name": "Moon", "longitude": 10.0}]
    seq = calculate_vimshottari_dasha(binfo, planets, depth=3)
    ketu = seq[0]
    first_antar = ketu["sub"][0]
    assert "sub" in first_antar
    first_praty = first_antar["sub"][0]
    assert first_praty["lord"] == "Ketu"
    assert first_praty["start"] == datetime.date(1970, 1, 1)


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


def test_basic_d_charts_prototype():
    planets = [{"name": "Sun", "longitude": 15.0}]
    charts = calculate_basic_divisional_charts(planets)
    assert set(charts.keys()) == {"D9", "D10"}
    assert charts["D9"]["Sun"] == 1
    assert charts["D10"]["Sun"] == 1

