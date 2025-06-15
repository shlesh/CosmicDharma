# backend/ashtakavarga.py
"""Simplified Ashtakavarga calculations."""

from typing import Dict, List

# Patterns of benefic houses counted from a planet's sign.
# Each set contains the offsets (1-12) that yield a bindu.
BINDU_PATTERNS: Dict[str, set] = {
    "Sun": {1, 2, 4, 7, 8, 9, 10, 11},
    "Moon": {1, 2, 3, 5, 6, 7, 9, 11},
    "Mars": {1, 3, 4, 6, 8, 10, 11, 12},
    "Mercury": {1, 2, 4, 6, 8, 10, 11, 12},
    "Jupiter": {1, 2, 4, 5, 7, 9, 10, 11},
    "Venus": {1, 2, 3, 4, 5, 7, 9, 10},
    "Saturn": {1, 2, 3, 5, 6, 7, 10, 11},
    "Rahu": {1, 2, 4, 6, 8, 9, 10, 11},
    "Ketu": {1, 2, 4, 6, 8, 9, 10, 11},
}


def calculate_ashtakavarga(planets: List[dict]) -> Dict[str, Dict[int, int]]:
    """Return Ashtakavarga points for each planet and house.

    Parameters
    ----------
    planets: list of dict
        Each dict must contain ``name`` and ``sign`` keys where sign is an
        integer 1..12.

    Returns
    -------
    dict
        Mapping with ``bav`` (Bhinnashtakavarga) for every planet and
        ``total_points`` containing summed points per house.
    """

    bav = {}
    totals = {h: 0 for h in range(1, 13)}

    for planet in planets:
        name = planet.get("name")
        sign = planet.get("sign")
        pattern = BINDU_PATTERNS.get(name)
        if pattern is None or sign is None:
            continue

        points = {}
        for house in range(1, 13):
            # Offset of the house from planet's sign (1-12)
            offset = (house - sign) % 12 + 1
            val = 1 if offset in pattern else 0
            points[house] = val
            totals[house] += val
        bav[name] = points

    return {"bav": bav, "total_points": totals}
