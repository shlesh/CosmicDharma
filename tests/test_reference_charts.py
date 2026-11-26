"""Reference-chart tests: our engine vs. independent sources, not vs. itself.

Planet positions come from NASA JPL Horizons (DE441): OBSERVER tables, CENTER='500@399'
(geocentre), QUANTITIES='31' = "ecliptic-of-date longitude ... of the target's apparent
position", in UT (UT1 before 1962). Fetched 2026-11-26. Swiss Ephemeris returns the same quantity
(apparent, geocentric, true equinox of date), so the two agree to a fraction of an arcsecond.

The ascendant has no JPL equivalent, so it is checked against the textbook formula from Meeus,
*Astronomical Algorithms* (sidereal time ch. 12, ascendant ch. 14), implemented below without
Swiss Ephemeris. That formula ignores nutation (up to ~17"), hence the looser tolerance.

Each case is entered the way a user would enter it: local civil time and a place. So these tests
also cover the local -> UT conversion, including historical offsets (India was +5:30 in 1917).
"""
import math
from datetime import date, time

import pytest

from app.astrology.birth_info import get_birth_info
from app.astrology.planets import calculate_planets

PLANET_TOL_ARCSEC = 2.0      # observed worst case: 0.2"
ASC_TOL_ARCSEC = 30.0        # observed worst case: 14" (Meeus formula omits nutation)

CASES = {
    # local date, local time, lat, lon (east +), tz
    "honolulu_1961": (date(1961, 8, 4), time(19, 24), 21.3069, -157.8583, "Pacific/Honolulu"),
    "san_francisco_1955": (date(1955, 2, 24), time(19, 15), 37.7749, -122.4194, "America/Los_Angeles"),
    "prayagraj_1917": (date(1917, 11, 19), time(23, 11), 25.4358, 81.8463, "Asia/Kolkata"),
}

EXPECTED_UTC = {
    "honolulu_1961": "1961-08-05T05:24:00+00:00",
    "san_francisco_1955": "1955-02-25T03:15:00+00:00",
    "prayagraj_1917": "1917-11-19T17:41:00+00:00",
}

# JPL Horizons ObsEcLon (degrees, tropical, apparent, ecliptic of date).
JPL = {
    "honolulu_1961": {
        "Sun": 132.5479089, "Mercury": 122.3315919, "Venus": 91.7893450, "Mars": 172.5765892,
        "Jupiter": 300.8586257, "Saturn": 295.3307494,
    },
    "san_francisco_1955": {"Sun": 335.7481040, "Saturn": 231.1626510},
    "prayagraj_1917": {"Mercury": 245.9440485, "Venus": 283.7200030, "Mars": 159.0895718},
}


def _arcsec(a, b):
    return abs(((a - b + 180) % 360 - 180) * 3600)


def _chart(case):
    d, t, lat, lon, tz = CASES[case]
    binfo = get_birth_info(d, t, lat, lon, tz, ayanamsha="lahiri")
    return binfo, {p["name"]: p for p in calculate_planets(binfo)}


def meeus_ascendant(jd_ut, lat, lon_east):
    t = (jd_ut - 2451545.0) / 36525
    gmst = 280.46061837 + 360.98564736629 * (jd_ut - 2451545.0) + 0.000387933 * t**2 - t**3 / 38710000
    ramc = math.radians((gmst + lon_east) % 360)
    eps = math.radians(23.439291 - 0.0130042 * t)
    phi = math.radians(lat)
    asc = math.atan2(math.cos(ramc), -(math.sin(ramc) * math.cos(eps) + math.tan(phi) * math.sin(eps)))
    return math.degrees(asc) % 360


@pytest.mark.parametrize("case", CASES)
def test_local_time_converts_to_the_right_ut(case):
    binfo, _ = _chart(case)
    assert binfo["utc"] == EXPECTED_UTC[case]


@pytest.mark.parametrize("case,body", [(c, b) for c in JPL for b in JPL[c]])
def test_planet_matches_jpl_horizons(case, body):
    _, planets = _chart(case)
    assert _arcsec(planets[body]["tropical_longitude"], JPL[case][body]) < PLANET_TOL_ARCSEC


@pytest.mark.parametrize("case", CASES)
def test_ascendant_matches_meeus(case):
    binfo, _ = _chart(case)
    _, _, lat, lon, _ = CASES[case]
    assert _arcsec(binfo["tropical_ascendant"], meeus_ascendant(binfo["jd_ut"], lat, lon)) < ASC_TOL_ARCSEC


@pytest.mark.parametrize("case", CASES)
def test_sidereal_is_tropical_minus_ayanamsa(case):
    binfo, planets = _chart(case)
    off = binfo["sidereal_offset"]
    for p in planets.values():
        assert _arcsec(p["longitude"], p["tropical_longitude"] - off) < 1e-6
    assert _arcsec(binfo["ascendant"], binfo["tropical_ascendant"] - off) < 1e-6


# --- Moon, nakshatra and Vimshottari dasha -------------------------------------------------
# The Moon drives nakshatra and dasha, so it gets its own JPL values and an independent
# derivation of the classical rules (27 equal nakshatras of 13°20'; lords cycle from Ketu
# starting at Ashwini; the birth dasha runs for the unelapsed fraction of the nakshatra).

JPL_MORE = {
    "honolulu_1961": {"Moon": 63.3573772},
    "san_francisco_1955": {
        "Moon": 7.7471988, "Mercury": 314.3617059, "Venus": 291.1718389, "Mars": 29.0904584,
        "Jupiter": 110.5079320,
    },
    "prayagraj_1917": {"Moon": 298.3027302, "Jupiter": 67.7165027, "Sun": 236.8397967, "Saturn": 134.5019564},
}

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya",
    "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
    "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]
LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
YEARS = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16,
         "Saturn": 19, "Mercury": 17}
SPAN = 360 / 27


@pytest.mark.parametrize("case,body", [(c, b) for c in JPL_MORE for b in JPL_MORE[c]])
def test_more_planets_match_jpl_horizons(case, body):
    _, planets = _chart(case)
    assert _arcsec(planets[body]["tropical_longitude"], JPL_MORE[case][body]) < PLANET_TOL_ARCSEC


def _jpl_sidereal_moon(case, ayanamsa):
    d, t, lat, lon, tz = CASES[case]
    binfo = get_birth_info(d, t, lat, lon, tz, ayanamsha=ayanamsa)
    return binfo, (JPL_MORE[case]["Moon"] - binfo["sidereal_offset"]) % 360


@pytest.mark.parametrize("ayanamsa", ["lahiri", "yukteswar"])
@pytest.mark.parametrize("case", CASES)
def test_nakshatra_and_birth_dasha_follow_from_the_jpl_moon(case, ayanamsa):
    from datetime import datetime, timedelta
    from app.astrology.dasha import calculate_vimshottari_dasha
    from app.astrology.nakshatra import get_nakshatra

    binfo, moon = _jpl_sidereal_moon(case, ayanamsa)
    idx = int(moon // SPAN)
    lord = LORDS[idx % 9]
    balance_years = (1 - (moon % SPAN) / SPAN) * YEARS[lord]

    planets = calculate_planets(binfo)
    nak = get_nakshatra(planets)
    assert nak["nakshatra"] == NAKSHATRAS[idx]
    assert nak["ruling_planet"] == lord
    assert nak["pada"] == int((moon % SPAN) // (SPAN / 4)) + 1

    first = calculate_vimshottari_dasha(binfo, planets)[0]
    assert first["lord"] == lord
    birth_utc = datetime.fromisoformat(binfo["utc"]).replace(tzinfo=None)
    expected_end = (birth_utc + timedelta(days=balance_years * 365.25)).date()  # Julian-year convention
    assert abs((first["end"] - expected_end).days) <= 1


def test_every_nakshatra_has_its_classical_lord():
    from app.astrology.nakshatra import get_nakshatra
    for i, name in enumerate(NAKSHATRAS):
        nak = get_nakshatra([{"name": "Moon", "longitude": i * SPAN + SPAN / 2}])
        assert (nak["nakshatra"], nak["ruling_planet"]) == (name, LORDS[i % 9])


@pytest.mark.parametrize("ayanamsa", ["lahiri", "raman", "kp", "fagan_bradley", "yukteswar"])
def test_every_documented_ayanamsa_is_accepted_by_the_api(test_app, monkeypatch, ayanamsa):
    # LINEAGE.md promises these are selectable; the request model used to reject fagan_bradley.
    from app.services import astro
    monkeypatch.setattr(astro, "timezone_at", lambda lat, lon: "Asia/Kolkata")
    astro.clear_profile_cache()
    client, _ = test_app
    body = {"date": "1990-01-01", "time": "10:00", "location": "Mumbai", "lat": 19.076, "lon": 72.8777,
            "ayanamsa": ayanamsa}
    resp = client.post("/api/profile", json=body)
    assert resp.status_code == 200, resp.text
    assert resp.json()["birthInfo"]["ayanamsa"]["id"] == ("yukteswar" if ayanamsa == "yukteswar" else ayanamsa)


def test_fagan_bradley_sits_about_0_88_deg_from_lahiri():
    # Fagan/Bradley's ayanamsa runs ~0°53' larger than Lahiri's in the modern era (a property of the two
    # definitions), so a mix-up between them shows up immediately.
    d, t, lat, lon, tz = CASES["honolulu_1961"]
    lahiri = get_birth_info(d, t, lat, lon, tz, ayanamsha="lahiri")["sidereal_offset"]
    fagan = get_birth_info(d, t, lat, lon, tz, ayanamsha="fagan_bradley")["sidereal_offset"]
    assert 0.8 < fagan - lahiri < 0.95
