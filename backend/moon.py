# backend/moon.py
from .astro_constants import NAKSHATRA_METADATA, RASHI_METADATA
import swisseph as swe

def get_moon_longitude(jd: float) -> float:
    res = swe.calc_ut(jd, swe.MOON)
    return res[0][0] if isinstance(res[0], (list, tuple)) else res[0]

def get_moon_sign(moon_long: float) -> dict:
    idx = int(moon_long // 30)
    return RASHI_METADATA[idx]

def get_moon_nakshatra_and_pada(moon_long: float) -> (dict, int):
    span = 13 + 1/3
    idx = int(moon_long // span)
    pada = int(((moon_long % span) // (1 + 1/3))) + 1
    return NAKSHATRA_METADATA[idx], pada
