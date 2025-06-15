"""Simple divisional chart calculations."""

from .analysis import DIVISIONAL_CHARTS

__all__ = ["calculate_basic_divisional_charts"]


def _varga_sign(lon: float, divisions: int) -> int:
    """Return sign number for a longitude in a divisional chart."""
    part = 360 / (12 * divisions)
    idx = int(lon / part)
    return (idx // divisions) + 1


def calculate_basic_divisional_charts(planets, charts=("D9", "D10")):
    """Return mapping for selected divisional charts (prototype)."""
    result = {}
    for code in charts:
        divisions = DIVISIONAL_CHARTS.get(code)
        if not divisions:
            continue
        mapping = {}
        for p in planets:
            mapping[p["name"]] = _varga_sign(p["longitude"], divisions)
        result[code] = mapping
    return result

