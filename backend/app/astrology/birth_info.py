import swisseph as swe
from datetime import datetime
import pytz
from .constants import RASHI_METADATA


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
    "equal": b"E",
    "sripati": b"P",  # Approximation using Placidus or Porphyry often accepted if Sripati not explicit
    "campanus": b"C",
    "regiomontanus": b"R",
}

def get_birth_info(date, time, latitude, longitude, timezone,
                   *, ayanamsha: str = "lahiri",
                   house_system: str = "whole_sign"):
    """
    Compute Julian Day, sidereal offset, sidereal ascendant, and sidereal house cusps.
    Returns a dict with jd_ut, sidereal_offset, ascendant, cusps, etc.
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
        ay_const = AYANAMSHA_MAP.get(ayanamsha.lower(), swe.SIDM_LAHIRI)
    else:
        ay_const = int(ayanamsha)

    swe.set_sid_mode(ay_const)
    # get ayanamsa (sidereal offset)
    sidereal_offset = swe.get_ayanamsa(jd_ut)

    # compute houses and ascendant
    # SwissEph houses() function generally returns Tropical values even if set_sid_mode is called
    # unless we use specific flags, but the safest standard method is to subtract ayanamsa manually.
    
    if isinstance(house_system, bytes):
        hsys = house_system[:1]
    else:
        key = house_system.lower()
        hsys = HOUSE_MAP.get(key)
        if not hsys and len(house_system) == 1:
            hsys = house_system.upper().encode()[:1]
    if not hsys:
        # Default to Whole Sign if unknown, which is standard for Vedic Rashi
        hsys = b"W"

    cusps_tropical, ascmc_tropical = swe.houses(jd_ut, latitude, longitude, hsys)
    
    # Convert Tropical to Sidereal
    # ascmc[0] is Ascendant
    sidereal_ascendant = (ascmc_tropical[0] - sidereal_offset) % 360
    
    # Convert Cusps to Sidereal
    # note: cusps is a tuple where index 0 is usually 0.0 or garbage for alignment in 1-based indexing, 
    # but swe.houses returns a tuple of length 13 (0..12). 
    sidereal_cusps = [(c - sidereal_offset) % 360 for c in cusps_tropical]
    
    return {
        "jd_ut": jd_ut,
        "sidereal_offset": sidereal_offset,
        "ascendant": sidereal_ascendant,
        "cusps": sidereal_cusps,
        "latitude": latitude,
        "longitude": longitude,
        "timezone": timezone,
        "tropical_ascendant": ascmc_tropical[0], # Keep for reference if needed
        "house_system": house_system
    }


def get_lagna(jd_ut: float, latitude: float, longitude: float,
              house_system: str | bytes = "W") -> dict:
    """Return rashi metadata for the rising sign (Sidereal)."""
    # We need the sidereal offset to get strict Sidereal Lagna
    # This simplified function calls get_ayanamsa on the fly assuming Lahiri
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    offset = swe.get_ayanamsa(jd_ut)
    
    if isinstance(house_system, bytes):
        hsys = house_system[:1]
    else:
        hsys = HOUSE_MAP.get(house_system.lower(), b"W")

    res = swe.houses(jd_ut, latitude, longitude, hsys)
    asc_list = res[0] if isinstance(res[0], (list, tuple)) else res
    
    # Convert Tropical Asc to Sidereal Asc
    asc_deg_tropical = asc_list[0]
    asc_deg_sidereal = (asc_deg_tropical - offset) % 360
    
    idx = int(asc_deg_sidereal // 30)
    return RASHI_METADATA[idx]
