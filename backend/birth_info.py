import swisseph as swe
from datetime import datetime
import pytz

# Mapping of human readable ayanamsha names to Swiss Ephemeris constants
AYANAMSHA_MAP = {
    "fagan": swe.SIDM_FAGAN_BRADLEY,
    "fagan/bradley": swe.SIDM_FAGAN_BRADLEY,
    "lahiri": swe.SIDM_LAHIRI,
    "raman": swe.SIDM_RAMAN,
    "krishnamurti": swe.SIDM_KRISHNAMURTI,
}

def get_birth_info(
    date,
    time,
    latitude,
    longitude,
    timezone,
    *,
    ayanamsha: str | int = "fagan",
    house_system: str = "P",
):
    """Return core astronomical info for a birth.

    Parameters are validated and then fed to Swiss Ephemeris. ``ayanamsha`` can
    be a human readable name like ``"lahiri"`` or one of the numeric constants
    from :mod:`swisseph`. ``house_system`` is the single letter code understood
    by :func:`swisseph.houses`.
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
