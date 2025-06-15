# backend/ascendant.py
from .astro_constants import RASHI_METADATA
import swisseph as swe

def get_lagna(jd: float, lat: float, lon: float, house_system: bytes = b'P') -> dict:
    res = swe.houses(jd, lat, lon, house_system)
    asc_list = res[0] if isinstance(res[0], (list, tuple)) else res
    asc_deg = asc_list[0]
    idx = int(asc_deg // 30)
    return RASHI_METADATA[idx]
