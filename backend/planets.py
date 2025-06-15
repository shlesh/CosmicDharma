# backend/planets.py
import swisseph as swe
from .astro_constants import RASHI_METADATA

_PLANETS = {
    "Sun": swe.SUN, "Moon": swe.MOON, "Mercury": swe.MERCURY,
    "Venus": swe.VENUS, "Mars": swe.MARS,
    "Jupiter": swe.JUPITER, "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE, "Ketu": swe.TRUE_NODE,
}

def get_planetary_positions(jd: float):
    positions = {}
    for name, body in _PLANETS.items():
        res = swe.calc_ut(jd, body)
        raw = res[0][0] if isinstance(res[0], (list, tuple)) else res[0]
        sign_idx = int(raw // 30)
        positions[name] = {
            "longitude": raw,
            "sign":      RASHI_METADATA[sign_idx]["name"],
            "deg":       raw % 30,
        }
    return positions
