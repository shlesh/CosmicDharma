"""Shared helpers so yogas, aspects, houses, and strengths agree."""

from __future__ import annotations

from typing import Any, Dict, Iterable, List, Mapping, Optional

SIGN_LORDS = {
    1: "Mars",
    2: "Venus",
    3: "Mercury",
    4: "Moon",
    5: "Sun",
    6: "Mercury",
    7: "Venus",
    8: "Mars",
    9: "Jupiter",
    10: "Saturn",
    11: "Saturn",
    12: "Jupiter",
}


def norm_sign(sign: int) -> int:
    return ((int(sign) - 1) % 12) + 1


def house_from_signs(planet_sign: int, lagna_sign: int) -> int:
    return ((norm_sign(planet_sign) - norm_sign(lagna_sign)) % 12) + 1


def sign_of_house(lagna_sign: int, house: int) -> int:
    return ((norm_sign(lagna_sign) - 1 + int(house) - 1) % 12) + 1


def lord_of_house(lagna_sign: int, house: int) -> str:
    return SIGN_LORDS[sign_of_house(lagna_sign, house)]


def lagna_sign_from_binfo(binfo: Mapping[str, Any], planets: Optional[Iterable[Mapping]] = None) -> int:
    if binfo.get("lagna_sign"):
        return norm_sign(int(binfo["lagna_sign"]))
    asc = binfo.get("ascendant")
    if isinstance(asc, (int, float)):
        return int(asc % 360 // 30) + 1
    if planets:
        for p in planets:
            if p.get("name") == "Lagna":
                return norm_sign(int(p["sign"]))
    return 1


def occupants_by_house(houses: Mapping[str, Any] | None) -> Dict[int, List[str]]:
    if not houses:
        return {}
    raw = houses.get("occupants") if isinstance(houses.get("occupants"), dict) else None
    if raw is None:
        raw = houses.get("houses", houses)
    out: Dict[int, List[str]] = {}
    if not isinstance(raw, Mapping):
        return out
    for key, value in raw.items():
        try:
            num = int(key)
        except (TypeError, ValueError):
            continue
        if isinstance(value, Mapping):
            occ = value.get("occupants") or value.get("planets") or []
            out[num] = list(occ) if isinstance(occ, list) else []
        elif isinstance(value, list):
            out[num] = [str(x) for x in value]
        else:
            out[num] = []
    return out


def planet_house_map(houses: Mapping[str, Any] | None, planets: Iterable[Mapping] | None = None,
                     lagna_sign: Optional[int] = None) -> Dict[str, int]:
    if houses and isinstance(houses.get("placements"), Mapping):
        result = {}
        for name, info in houses["placements"].items():
            if isinstance(info, Mapping) and info.get("house"):
                result[name] = int(info["house"])
        if result:
            return result
    occ = occupants_by_house(houses or {})
    result = {}
    for house, names in occ.items():
        for name in names:
            result[name] = house
    if result:
        return result
    if planets and lagna_sign:
        for p in planets:
            if "sign" in p and p.get("name"):
                result[p["name"]] = house_from_signs(int(p["sign"]), lagna_sign)
    return result
