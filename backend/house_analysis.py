import swisseph as swe
from .birth_info import HOUSE_MAP

# Relative houses each planet aspects by graha drishti
_ASPECT_PATTERNS = {
    "Mars": [4, 7, 8],
    "Jupiter": [5, 7, 9],
    "Saturn": [3, 7, 10],
}


def _normalize_house_system(house_system):
    """Return SwissEph house system code from a friendly name or byte."""
    if house_system is None:
        return None
    if isinstance(house_system, bytes):
        return house_system[:1]
    key = house_system.lower()
    code = HOUSE_MAP.get(key)
    if not code and len(house_system) == 1:
        code = house_system.upper().encode()[:1]
    return code or b"P"


def _get_cusps(binfo, house_system=None):
    """Compute cusps for the given house system or use precomputed ones."""
    if house_system is None:
        return binfo["cusps"]
    hsys = _normalize_house_system(house_system)
    cusps, _ = swe.houses(
        binfo["jd_ut"], binfo["latitude"], binfo["longitude"], hsys
    )
    return cusps


def _planet_house(lon, cusps):
    """Determine which house a longitude falls into handling cusp edges."""
    # If exactly on a cusp, assign to the following house
    for idx, cusp in enumerate(cusps):
        if abs((lon - cusp) % 360) < 1e-6:
            return idx + 1
    for i in range(1, 13):
        start = cusps[i - 1]
        end = cusps[i % 12]
        if start < end:
            if start < lon < end:
                return i
        else:  # wrap-around
            if lon > start or lon < end:
                return i
    return 12


def _aspected_houses(name, house):
    rel = _ASPECT_PATTERNS.get(name, [7])
    return [((house + r - 2) % 12) + 1 for r in rel]


def _calculate_aspects(placements):
    aspects = {n: _aspected_houses(n, info["house"]) for n, info in placements.items()}
    mutual = []
    names = list(placements)
    for i, n1 in enumerate(names):
        for n2 in names[i + 1 :]:
            if (
                placements[n2]["house"] in aspects[n1]
                and placements[n1]["house"] in aspects[n2]
            ):
                pair = tuple(sorted((n1, n2)))
                mutual.append(pair)
    return {"planet_aspects": aspects, "mutual_aspects": mutual}


def analyze_houses(binfo, planets, *, house_system=None):
    """Return house occupancy, individual placements and aspect info."""
    cusps = _get_cusps(binfo, house_system)
    houses = {i: [] for i in range(1, 13)}
    placements = {}
    for p in planets:
        lon = p["longitude"]
        house = _planet_house(lon, cusps)
        houses[house].append(p["name"])
        placements[p["name"]] = {"sign": p.get("sign") or int(lon // 30) + 1, "house": house}

    aspects = _calculate_aspects(placements)
    return {"houses": houses, "placements": placements, "aspects": aspects}
