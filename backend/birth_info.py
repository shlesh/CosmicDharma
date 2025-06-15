import swisseph as swe
from datetime import datetime

def get_birth_info(date, time, latitude, longitude, timezone):
    """
    Compute Julian Day, sidereal offset, ascendant, house cusps.
    Returns a dict with jd_ut, sidereal_offset, asc, houses.
    """
    # combine date and time to UTC datetime
    dt = datetime.combine(date, time)
    # convert to Julian Day UTC
    jd_ut = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60 + dt.second/3600)
    # set sidereal ayanamsha (Fagan/Bradley)
    swe.set_sid_mode(swe.SIDM_FAGAN_BRADLEY)
    # compute ascendant
    asc, mc = swe.houses(jd_ut, latitude, longitude)[0:2]
    # compute house cusps
    cusps = swe.houses(jd_ut, latitude, longitude)[1]
    return {
        "jd_ut": jd_ut,
        "ascendant": asc,
        "cusps": cusps,
        "latitude": latitude,
        "longitude": longitude,
        "timezone": timezone,
    }