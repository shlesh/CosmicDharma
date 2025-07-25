import swisseph as swe
from datetime import datetime
import pytz
from .astro_constants import RASHI_METADATA


# Supported ayanamśa options
AYANAMSHA_MAP = {
    "fagan_bradley": swe.SIDM_FAGAN_BRADLEY,
    "lahiri": swe.SIDM_LAHIRI,
    "raman": swe.SIDM_RAMAN,
    "kp": swe.SIDM_KRISHNAMURTI,
}

HOUSE_MAP = {
    "placidus": b"P",
    "whole_sign": b"W",
}

def get_birth_info(date, time, latitude, longitude, timezone,
                   *, ayanamsha: str = "fagan_bradley",
                   house_system: str = "placidus"):
    """
    Compute Julian Day, sidereal offset, ascendant, house cusps.
    Returns a dict with jd_ut, sidereal_offset, asc, houses.

    """
    # validate coordinates
    if not (-90.0 <= latitude <= 90.0):
        raise ValueError("Latitude must be between -90 and 90 degrees")
    if not (-180.0 <= longitude <= 180.0):
        raise ValueError("Longitude must be between -180 and 180 degrees")

    # validate timezone
    try:
        tz = pytz.timezone(timezone)
    except pytz.UnknownTimeZoneError as exc:
        raise ValueError(f"Invalid timezone '{timezone}'") from exc

    local_dt = tz.localize(datetime.combine(date, time))
    utc_dt = local_dt.astimezone(pytz.utc)
    # convert the UTC datetime to Julian Day
    jd_ut = swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60 + utc_dt.second / 3600,
    )


    # determine ayanamsha constant
    if isinstance(ayanamsha, str):
        ay_const = AYANAMSHA_MAP.get(ayanamsha.lower())
        if ay_const is None:
            raise ValueError(f"Unknown ayanamsha '{ayanamsha}'")
    else:
        ay_const = int(ayanamsha)

    swe.set_sid_mode(ay_const)
    # get ayanamsa (sidereal offset)
    sidereal_offset = swe.get_ayanamsa(jd_ut)
    # compute houses and ascendant
    # SwissEph expects a single character identifying the house system.
    # Map the user-friendly name to the correct byte code. Users may pass
    # the single-letter code directly (e.g. "P" or "W") or a full name like
    # "placidus". Normalize both cases and raise an error if the value is
    # not recognized.
    if isinstance(house_system, bytes):
        hsys = house_system[:1]
    else:
        key = house_system.lower()
        hsys = HOUSE_MAP.get(key)
        if not hsys and len(house_system) == 1:
            hsys = house_system.upper().encode()[:1]
    if not hsys:
        raise ValueError(f"Unknown house system '{house_system}'")
    cusps, ascmc = swe.houses(jd_ut, latitude, longitude, hsys)
    asc = ascmc[0]
    return {
        "jd_ut": jd_ut,
        "sidereal_offset": sidereal_offset,
        "ascendant": asc,
        "cusps": cusps,
        "latitude": latitude,
        "longitude": longitude,
        "timezone": timezone,
    }


def get_lagna(jd_ut: float, latitude: float, longitude: float,
              house_system: str | bytes = "P") -> dict:
    """Return rashi metadata for the rising sign."""
    if isinstance(house_system, bytes):
        hsys = house_system[:1]
    else:
        hsys = HOUSE_MAP.get(house_system.lower())
        if not hsys and len(house_system) == 1:
            hsys = house_system.upper().encode()[:1]
    if not hsys:
        hsys = b"P"

    res = swe.houses(jd_ut, latitude, longitude, hsys)
    asc_list = res[0] if isinstance(res[0], (list, tuple)) else res
    asc_deg = asc_list[0]
    idx = int(asc_deg // 30)
    return RASHI_METADATA[idx]
