import swisseph as swe
from datetime import datetime
import pytz

def get_birth_info(date, time, latitude, longitude, timezone):
    """
    Compute Julian Day, sidereal offset, ascendant, house cusps.
    Returns a dict with jd_ut, sidereal_offset, asc, houses.
    """
    # combine date and time and convert to UTC based on the given timezone
    tz = pytz.timezone(timezone)
    local_dt = tz.localize(datetime.combine(date, time))
    utc_dt = local_dt.astimezone(pytz.utc)
    # convert the UTC datetime to Julian Day
    jd_ut = swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60 + utc_dt.second / 3600,
    )
    # set sidereal ayanamsha (Fagan/Bradley)
    swe.set_sid_mode(swe.SIDM_FAGAN_BRADLEY)
    # get ayanamsa (sidereal offset)
    sidereal_offset = swe.get_ayanamsa(jd_ut)
    # compute houses and ascendant
    cusps, ascmc = swe.houses(jd_ut, latitude, longitude)
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
