import swisseph as swe
from datetime import datetime
import pytz


AYANAMSA_MAP = {
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
                   *, ayanamsa: str = "fagan_bradley",
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
    hsys = house_system.upper().encode()
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
