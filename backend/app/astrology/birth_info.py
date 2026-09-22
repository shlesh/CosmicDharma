"""Birth instant, ayanamsa, Lagna, and house cusps."""

from __future__ import annotations

from datetime import datetime

import pytz
import swisseph as swe

from .ayanamsa import describe_ayanamsa, get_ayanamsa, supported_ayanamsas
from .constants import RASHI_METADATA
from .yuga import describe_yuga

HOUSE_MAP = {
    "placidus": b"P",
    "whole_sign": b"W",
    "equal": b"E",
    "sripati": b"O",
    "porphyry": b"O",
    "campanus": b"C",
    "regiomontanus": b"R",
}

AYANAMSHA_MAP = {
    "lahiri": "lahiri",
    "raman": "raman",
    "kp": "kp",
    "yukteswar": "yukteswar",
    "yukteshwar": "yukteswar",
    "fagan_bradley": "fagan_bradley",
}


def _normalize_cusps(cusps) -> list[float]:
    values = [float(c) for c in cusps]
    if len(values) >= 13:
        return [(c % 360) for c in values[1:13]]
    if len(values) >= 12:
        return [(c % 360) for c in values[:12]]
    raise ValueError("Swiss Eph returned an unexpected house-cusp vector")


def _whole_sign_cusps(lagna_sign: int) -> list[float]:
    return [((lagna_sign - 1 + i) % 12) * 30.0 for i in range(12)]


def _equal_cusps(lagna_deg: float) -> list[float]:
    return [(lagna_deg + 30.0 * i) % 360.0 for i in range(12)]


def _sripati_cusps(lagna_deg: float) -> list[float]:
    madhya = [(lagna_deg + 30.0 * i) % 360.0 for i in range(12)]
    cusps = []
    for i in range(12):
        prev_m = madhya[(i - 1) % 12]
        cur = madhya[i]
        span = (cur - prev_m) % 360.0
        cusps.append((prev_m + span / 2.0) % 360.0)
    return cusps


def get_birth_info(date, time, latitude, longitude, timezone,
                   *, ayanamsha: str = "yukteswar",
                   house_system: str = "whole_sign"):
    if not (-90.0 <= latitude <= 90.0):
        raise ValueError("Latitude must be between -90 and 90 degrees")
    if not (-180.0 <= longitude <= 180.0):
        raise ValueError("Longitude must be between -180 and 180 degrees")

    try:
        tz = pytz.timezone(timezone)
    except pytz.UnknownTimeZoneError as exc:
        raise ValueError(f"Invalid timezone '{timezone}'") from exc

    local_dt = tz.localize(datetime.combine(date, time))
    utc_dt = local_dt.astimezone(pytz.utc)
    jd_ut = swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60 + utc_dt.second / 3600,
    )

    if not isinstance(ayanamsha, str):
        raise ValueError("ayanamsha must be a string name")
    ay_key = ayanamsha.lower().strip()
    aliases = {"yukteshwar", "sri_yukteswar", "holy_science"}
    if ay_key not in set(supported_ayanamsas()) | aliases:
        raise ValueError(f"Unknown ayanamsa '{ayanamsha}'")

    sidereal_offset = get_ayanamsa(jd_ut, ay_key)

    if isinstance(house_system, bytes):
        hsys = house_system[:1]
        hsys_key = next((k for k, v in HOUSE_MAP.items() if v == hsys), "whole_sign")
    else:
        hsys_key = (house_system or "whole_sign").lower().strip()
        if hsys_key in HOUSE_MAP:
            hsys = HOUSE_MAP[hsys_key]
        elif len(hsys_key) == 1:
            hsys = hsys_key.upper().encode()[:1]
            hsys_key = next((k for k, v in HOUSE_MAP.items() if v == hsys), hsys_key)
        else:
            raise ValueError(f"Unknown house system '{house_system}'")

    tropical_cusps, ascmc = swe.houses(jd_ut, latitude, longitude, hsys or b"W")
    tropical_asc = float(ascmc[0])
    sidereal_ascendant = (tropical_asc - sidereal_offset) % 360
    lagna_sign = int(sidereal_ascendant // 30) + 1
    lagna_meta = RASHI_METADATA[lagna_sign - 1]

    if hsys_key == "whole_sign":
        sidereal_cusps = _whole_sign_cusps(lagna_sign)
    elif hsys_key == "equal":
        sidereal_cusps = _equal_cusps(sidereal_ascendant)
    elif hsys_key == "sripati":
        sidereal_cusps = _sripati_cusps(sidereal_ascendant)
    else:
        sidereal_cusps = [(c - sidereal_offset) % 360 for c in _normalize_cusps(tropical_cusps)]

    return {
        "jd_ut": jd_ut,
        "sidereal_offset": sidereal_offset,
        "ascendant": sidereal_ascendant,
        "ascendant_sign": lagna_meta["name"],
        "lagna_sign": lagna_sign,
        "lagna_degree": sidereal_ascendant % 30,
        "cusps": sidereal_cusps,
        "latitude": latitude,
        "longitude": longitude,
        "timezone": timezone,
        "utc": utc_dt.isoformat(),
        "local": local_dt.isoformat(),
        "date": date.isoformat(),
        "time": time.isoformat(timespec="minutes"),
        "tropical_ascendant": tropical_asc,
        "house_system": hsys_key,
        "ayanamsa": describe_ayanamsa(ay_key, sidereal_offset),
        "yuga": describe_yuga(date),
    }


def get_lagna(jd_ut: float, latitude: float, longitude: float,
              house_system: str | bytes = "W",
              ayanamsha: str = "yukteswar") -> dict:
    offset = get_ayanamsa(jd_ut, ayanamsha)
    if isinstance(house_system, bytes):
        hsys = house_system[:1]
    else:
        hsys = HOUSE_MAP.get(str(house_system).lower(), b"W")

    _cusps, ascmc = swe.houses(jd_ut, latitude, longitude, hsys)
    tropical_asc = float(ascmc[0])
    asc_deg = (tropical_asc - offset) % 360
    idx = int(asc_deg // 30)
    return RASHI_METADATA[idx]
