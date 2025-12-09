"""Basic Panchanga calculations."""
from __future__ import annotations

from datetime import datetime
import pytz
from typing import Dict

from .constants import NAKSHATRA_METADATA

# Names of the 30 tithis
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

# Names of the 27 yogas
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

# Sequence of 60 karanas within a lunar month
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
    """Return tithi details from longitudes."""
    diff = (moon_lon - sun_lon) % 360
    index = int(diff // 12)
    frac = (diff % 12) / 12
    name = TITHI_NAMES[index]
    paksha = "Shukla" if index < 15 else "Krishna"
    return {"index": index + 1, "name": name, "paksha": paksha, "fraction": frac}


def get_nakshatra(moon_lon: float) -> Dict:
    """Return nakshatra and pada for the Moon longitude."""
    span = 360 / 27
    index = int(moon_lon % 360 // span)
    pada = int((moon_lon % span) // (span / 4)) + 1
    meta = NAKSHATRA_METADATA[index]
    return {"index": index + 1, "nakshatra": meta["name"], "pada": pada}


def get_yoga(sun_lon: float, moon_lon: float) -> Dict:
    """Return yoga from the sum of longitudes."""
    total = (sun_lon + moon_lon) % 360
    span = 360 / 27
    index = int(total // span)
    frac = (total % span) / span
    return {"index": index + 1, "name": YOGA_NAMES[index], "fraction": frac}


def get_karana(sun_lon: float, moon_lon: float) -> Dict:
    """Return karana for the lunar day."""
    diff = (moon_lon - sun_lon) % 360
    index = int(diff // 6)
    frac = (diff % 6) / 6
    name = _KARANA_SEQUENCE[index]
    return {"index": index + 1, "name": name, "fraction": frac}


def get_vaara(dt: datetime) -> str:
    """Return weekday name for the given localized datetime."""
    return VAARA_NAMES[dt.weekday()]


def calculate_panchanga(
    dt: datetime,
    sun_lon: float,
    moon_lon: float,
    timezone: str,
) -> Dict:
    """Combine all panchanga elements."""
    tz = pytz.timezone(timezone)
    local_dt = dt.astimezone(tz)
    return {
        "tithi": get_tithi(sun_lon, moon_lon),
        "nakshatra": get_nakshatra(moon_lon),
        "yoga": get_yoga(sun_lon, moon_lon),
        "karana": get_karana(sun_lon, moon_lon),
        "vaara": get_vaara(local_dt),
    }
