"""Bhinnashtakavarga and Sarvashtakavarga after BPHS.

Eight contributors: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna.
Rahu and Ketu do not contribute bindus here.

Canonical BAV totals: Sun 48, Moon 49, Mars 39, Mercury 54,
Jupiter 56, Venus 52, Saturn 39. SAV sums to 337.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from .chart_utils import lagna_sign_from_binfo

BAV_TABLES: Dict[str, Dict[str, set]] = {
    "Sun": {
        "Sun": {1, 2, 4, 7, 8, 9, 10, 11},
        "Moon": {3, 6, 10, 11},
        "Mars": {1, 2, 4, 7, 8, 9, 10, 11},
        "Mercury": {3, 5, 6, 9, 10, 11, 12},
        "Jupiter": {5, 6, 9, 11},
        "Venus": {6, 7, 12},
        "Saturn": {1, 2, 4, 7, 8, 9, 10, 11},
        "Lagna": {3, 4, 6, 10, 11, 12},
    },
    "Moon": {
        "Sun": {3, 6, 7, 8, 10, 11},
        "Moon": {1, 3, 6, 7, 10, 11},
        "Mars": {2, 3, 5, 6, 9, 10, 11},
        "Mercury": {1, 3, 4, 5, 7, 8, 10, 11},
        "Jupiter": {1, 4, 7, 8, 10, 11, 12},
        "Venus": {3, 4, 5, 7, 9, 10, 11},
        "Saturn": {3, 5, 6, 11},
        "Lagna": {3, 6, 10, 11},
    },
    "Mars": {
        "Sun": {3, 5, 6, 10, 11},
        "Moon": {3, 6, 11},
        "Mars": {1, 2, 4, 7, 8, 10, 11},
        "Mercury": {3, 5, 6, 11},
        "Jupiter": {6, 10, 11, 12},
        "Venus": {6, 8, 11, 12},
        "Saturn": {1, 4, 7, 8, 9, 10, 11},
        "Lagna": {1, 3, 6, 10, 11},
    },
    "Mercury": {
        "Sun": {5, 6, 9, 11, 12},
        "Moon": {2, 4, 6, 8, 10, 11},
        "Mars": {1, 2, 4, 7, 8, 9, 10, 11},
        "Mercury": {1, 3, 5, 6, 9, 10, 11, 12},
        "Jupiter": {6, 8, 11, 12},
        "Venus": {1, 2, 3, 4, 5, 8, 9, 11},
        "Saturn": {1, 2, 4, 7, 8, 9, 10, 11},
        "Lagna": {1, 2, 4, 6, 8, 10, 11},
    },
    "Jupiter": {
        "Sun": {1, 2, 3, 4, 7, 8, 9, 10, 11},
        "Moon": {2, 5, 7, 9, 11},
        "Mars": {1, 2, 4, 7, 8, 10, 11},
        "Mercury": {1, 2, 4, 5, 6, 9, 10, 11},
        "Jupiter": {1, 2, 3, 4, 7, 8, 10, 11},
        "Venus": {2, 5, 6, 9, 10, 11},
        "Saturn": {3, 5, 6, 12},
        "Lagna": {1, 2, 4, 5, 6, 7, 9, 10, 11},
    },
    "Venus": {
        "Sun": {8, 11, 12},
        "Moon": {1, 2, 3, 4, 5, 8, 9, 11, 12},
        "Mars": {3, 4, 6, 9, 11, 12},
        "Mercury": {3, 5, 6, 9, 11},
        "Jupiter": {5, 8, 9, 10, 11},
        "Venus": {1, 2, 3, 4, 5, 8, 9, 10, 11},
        "Saturn": {3, 4, 5, 8, 9, 10, 11},
        "Lagna": {1, 2, 3, 4, 5, 8, 9, 11},
    },
    "Saturn": {
        "Sun": {1, 2, 4, 7, 8, 9, 10, 11},
        "Moon": {3, 6, 11},
        "Mars": {3, 5, 6, 10, 11, 12},
        "Mercury": {6, 8, 9, 10, 11, 12},
        "Jupiter": {5, 6, 11, 12},
        "Venus": {6, 11, 12},
        "Saturn": {3, 5, 6, 11},
        "Lagna": {1, 3, 4, 6, 10, 11},
    },
}

CONTRIBUTORS = ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Lagna")
BAV_BODIES = ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn")


def calculate_ashtakavarga(
    planets: List[dict],
    lagna_sign: Optional[int] = None,
    binfo: Optional[dict] = None,
) -> Dict:
    positions = {}
    for p in planets:
        name = p.get("name")
        sign = p.get("sign")
        if name and sign:
            positions[name] = int(sign)
    if lagna_sign is None and binfo is not None:
        lagna_sign = lagna_sign_from_binfo(binfo, planets)
    if lagna_sign is None:
        lagna_sign = 1
    positions["Lagna"] = int(lagna_sign)

    bav = {}
    sav = {h: 0 for h in range(1, 13)}
    for body in BAV_BODIES:
        table = BAV_TABLES[body]
        points = {h: 0 for h in range(1, 13)}
        for contributor in CONTRIBUTORS:
            if contributor not in positions:
                continue
            origin = positions[contributor]
            for offset in table[contributor]:
                house = (origin + offset - 2) % 12 + 1
                points[house] += 1
        bav[body] = points
        for h, val in points.items():
            sav[h] += val

    return {
        "bav": bav,
        "sav": sav,
        "total_points": sav,
        "lagna_sign": lagna_sign,
        "scheme": "BPHS eight-contributor Bhinnashtakavarga",
    }
