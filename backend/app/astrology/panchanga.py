"""Basic Panchanga calculations."""
from __future__ import annotations

from datetime import datetime
from typing import Dict

import pytz

from .constants import NAKSHATRA_METADATA

TITHI_NAMES = [
    "Shukla Pratipada",
    "Shukla Dvitiya",
    "Shukla Tritiya",
    "Shukla Chaturthi",
    "Shukla Panchami",
    "Shukla Shashthi",
    "Shukla Saptami",
    "Shukla Ashtami",
    "Shukla Navami",
    "Shukla Dashami",
    "Shukla Ekadashi",
    "Shukla Dwadashi",
    "Shukla Trayodashi",
    "Shukla Chaturdashi",
    "Purnima",
    "Krishna Pratipada",
    "Krishna Dvitiya",
    "Krishna Tritiya",
    "Krishna Chaturthi",
    "Krishna Panchami",
    "Krishna Shashthi",
    "Krishna Saptami",
    "Krishna Ashtami",
    "Krishna Navami",
    "Krishna Dashami",
    "Krishna Ekadashi",
    "Krishna Dwadashi",
    "Krishna Trayodashi",
    "Krishna Chaturdashi",
    "Amavasya",
]

YOGA_NAMES = [
    "Vishkambha",
    "Priti",
    "Ayushman",
    "Saubhagya",
    "Shobhana",
    "Atiganda",
    "Sukarman",
    "Dhriti",
    "Shoola",
    "Ganda",
    "Vriddhi",
    "Dhruva",
    "Vyaghata",
    "Harshana",
    "Vajra",
    "Siddhi",
    "Vyatipata",
    "Variyana",
    "Parigha",
    "Shiva",
    "Siddha",
    "Sadhya",
    "Shubha",
    "Shukla",
    "Brahma",
    "Indra",
    "Vaidhriti",
]

_KARANA_SEQUENCE = (
    ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"] * 8
    + ["Shakuni", "Chatushpada", "Naga", "Kimstughna"]
)

VAARA_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


def get_tithi(sun_lon: float, moon_lon: float) -> Dict:
    diff = (moon_lon - sun_lon) % 360
    index = int(diff // 12)
    frac = (diff % 12) / 12
    name = TITHI_NAMES[index]
    paksha = "Shukla" if index < 15 else "Krishna"
    return {"index": index + 1, "name": name, "paksha": paksha, "fraction": frac}


def get_nakshatra(moon_lon: float) -> Dict:
    span = 360 / 27
    index = int(moon_lon % 360 // span)
    pada = int((moon_lon % span) // (span / 4)) + 1
    meta = NAKSHATRA_METADATA[index]
    return {"index": index + 1, "nakshatra": meta["name"], "pada": pada}


def get_yoga(sun_lon: float, moon_lon: float) -> Dict:
    total = (sun_lon + moon_lon) % 360
    span = 360 / 27
    index = int(total // span)
    frac = (total % span) / span
    return {"index": index + 1, "name": YOGA_NAMES[index], "fraction": frac}


def get_karana(sun_lon: float, moon_lon: float) -> Dict:
    diff = (moon_lon - sun_lon) % 360
    index = int(diff // 6)
    frac = (diff % 6) / 6
    name = _KARANA_SEQUENCE[index]
    return {"index": index + 1, "name": name, "fraction": frac}


def get_vaara(dt: datetime) -> str:
    return VAARA_NAMES[dt.weekday()]


def _localize(dt: datetime, timezone: str) -> datetime:
    tz = pytz.timezone(timezone)
    if dt.tzinfo is None:
        return tz.localize(dt)
    return dt.astimezone(tz)


def calculate_panchanga(
    dt: datetime,
    sun_lon: float,
    moon_lon: float,
    timezone: str,
) -> Dict:
    local_dt = _localize(dt, timezone)
    return {
        "tithi": get_tithi(sun_lon, moon_lon),
        "nakshatra": get_nakshatra(moon_lon),
        "yoga": get_yoga(sun_lon, moon_lon),
        "karana": get_karana(sun_lon, moon_lon),
        "vaara": get_vaara(local_dt),
    }
