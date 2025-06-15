# backend/core_elements.py
import swisseph as swe
from .astro_constants import RASHI_METADATA

def get_core_elements(jd: float, lat: float, lon: float, moon_long: float) -> dict:
    """
    Compute Sun sign, Moon sign, and Ascendant metadata.
    Returns a dict:
      {
        'sun': { name, element, quality, ruler, nature },
        'moon': { ... },
        'ascendant': { ... }
      }
    """
    # Sun longitude
    sun_res = swe.calc_ut(jd, swe.SUN)
    sun_long = sun_res[0][0] if isinstance(sun_res[0], (list, tuple)) else sun_res[0]
    # Ascendant longitude
    asc_res = swe.houses(jd, lat, lon, b'P')
    asc_long = asc_res[0][0] if isinstance(asc_res[0], (list, tuple)) else asc_res[0]

    sun_idx = int(sun_long // 30)
    moon_idx = int(moon_long // 30)
    asc_idx = int(asc_long // 30)

    return {
        'sun':        RASHI_METADATA[sun_idx],
        'moon':       RASHI_METADATA[moon_idx],
        'ascendant':  RASHI_METADATA[asc_idx],
    }