"""House occupancy, lords, and a compact aspect sketch."""

from __future__ import annotations

import swisseph as swe

from .birth_info import HOUSE_MAP
from .chart_utils import house_from_signs, lord_of_house, sign_of_house
from ..utils.signs import get_sign_name, get_sign_lord

_ASPECT_PATTERNS = {
    "Mars": [4, 7, 8],
    "Jupiter": [5, 7, 9],
    "Saturn": [3, 7, 10],
}


def _normalize_house_system(house_system):
    if house_system is None:
        return None
    if isinstance(house_system, bytes):
        return house_system[:1]
    key = house_system.lower()
    code = HOUSE_MAP.get(key)
    if not code and len(house_system) == 1:
        code = house_system.upper().encode()[:1]
    return code or b"W"


def _normalize_cusps(cusps) -> list[float]:
    values = [float(c) % 360 for c in cusps]
    if len(values) >= 13:
        return values[1:13]
    return values[:12]


def _planet_house(lon, cusps):
    lon = lon % 360
    n = len(cusps)
    for i in range(n):
        start = cusps[i] % 360
        end = cusps[(i + 1) % n] % 360
        if abs((lon - start) % 360) < 1e-6 or abs((lon - start) % 360 - 360) < 1e-6:
            return i + 1
        if start < end:
            if start < lon < end:
                return i + 1
        else:
            if lon > start or lon < end:
                return i + 1
    return n


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
                mutual.append(tuple(sorted((n1, n2))))
    return {"planet_aspects": aspects, "mutual_aspects": mutual}


def analyze_houses(binfo, planets, *, house_system=None):
    requested = house_system or binfo.get("house_system") or "cusps"
    if isinstance(requested, bytes):
        requested_key = "whole_sign" if requested[:1] == b"W" else "cusps"
    else:
        requested_key = str(requested).lower()

    if house_system is not None:
        hsys = _normalize_house_system(house_system)
        swe.houses(binfo["jd_ut"], binfo["latitude"], binfo["longitude"], hsys)

    lagna_sign = binfo.get("lagna_sign")
    if not lagna_sign and "ascendant" in binfo:
        lagna_sign = int(float(binfo["ascendant"]) % 360 // 30) + 1
    if not lagna_sign:
        lagna_sign = int(float(binfo.get("cusps", [0])[0]) % 360 // 30) + 1

    cusps = _normalize_cusps(binfo["cusps"]) if binfo.get("cusps") else None
    use_whole = requested_key in {"whole_sign", "w"}

    occupants = {i: [] for i in range(1, 13)}
    placements = {}
    for p in planets:
        lon = float(p["longitude"])
        sign = p.get("sign") or int(lon // 30) + 1
        if use_whole:
            house = house_from_signs(sign, lagna_sign)
        elif cusps:
            house = _planet_house(lon, cusps)
        else:
            house = house_from_signs(sign, lagna_sign)
        occupants[house].append(p["name"])
        placements[p["name"]] = {"sign": sign, "house": house, "longitude": lon}

    houses_data = {}
    for i in range(1, 13):
        if use_whole:
            sign_num = sign_of_house(lagna_sign, i)
            degree_in_sign = float(binfo.get("ascendant", 0)) % 30 if i == 1 else 0.0
            lord = lord_of_house(lagna_sign, i)
        else:
            cusp_degree = cusps[i - 1] if cusps else (sign_of_house(lagna_sign, i) - 1) * 30
            sign_num = int(cusp_degree // 30) + 1
            degree_in_sign = cusp_degree % 30
            lord = get_sign_lord(sign_num)
        sign_name = get_sign_name(sign_num)
        house_occupants = occupants[i]
        summary = f"{sign_name}"
        if lord:
            summary += f" (ruled by {lord})"
        if house_occupants:
            summary += f". Contains: {', '.join(house_occupants)}."
            try:
                from .interpretations import PLANETS_IN_HOUSES
                bits = [
                    PLANETS_IN_HOUSES[name][i]
                    for name in house_occupants
                    if name in PLANETS_IN_HOUSES and i in PLANETS_IN_HOUSES[name]
                ]
                if bits:
                    summary += " " + " ".join(bits)
            except Exception:
                pass
        else:
            summary += ". Empty."
        houses_data[i] = {
            "house_num": i,
            "sign": sign_name,
            "sign_id": sign_num,
            "degree": degree_in_sign,
            "lord": lord,
            "occupants": house_occupants,
            "summary": summary,
        }

    return {
        "houses": houses_data,
        "occupants": occupants,
        "placements": placements,
        "aspects": _calculate_aspects(placements),
        "lagna_sign": lagna_sign,
    }
