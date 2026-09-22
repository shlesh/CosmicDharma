"""Six-fold planetary strength. Occupancy uses chart_utils so rich house dicts work."""

from datetime import datetime
import swisseph as swe

from app.utils.signs import get_sign_lord
from .chart_utils import lord_of_house, occupants_by_house, planet_house_map


def calculate_shadbala(planets, birth_info, houses):
    shadbala = {}
    for planet in planets:
        if planet["name"] in ["Rahu", "Ketu"]:
            continue
        strength = {
            "sthana_bala": calculate_sthana_bala(planet, planets),
            "dig_bala": calculate_dig_bala(planet, houses),
            "kala_bala": calculate_kala_bala(planet, birth_info, planets),
            "chesta_bala": calculate_chesta_bala(planet),
            "naisargika_bala": get_naisargika_bala(planet["name"]),
            "drik_bala": 0,
        }
        strength["total"] = sum(strength.values())
        strength["required"] = get_required_strength(planet["name"])
        strength["is_strong"] = strength["total"] >= strength["required"]
        shadbala[planet["name"]] = strength
    return shadbala


def calculate_sthana_bala(planet, all_planets):
    points = 0
    sign = planet["sign"]
    name = planet["name"]
    exaltation_data = {
        "Sun": {"sign": 1, "degree": 10},
        "Moon": {"sign": 2, "degree": 3},
        "Mars": {"sign": 10, "degree": 28},
        "Mercury": {"sign": 6, "degree": 15},
        "Jupiter": {"sign": 4, "degree": 5},
        "Venus": {"sign": 12, "degree": 27},
        "Saturn": {"sign": 7, "degree": 20},
    }
    if name in exaltation_data:
        exalt = exaltation_data[name]
        if sign == exalt["sign"]:
            deg_diff = abs(planet["degree"] - exalt["degree"])
            points += max(0, 60 - (deg_diff * 2))
        elif sign == ((exalt["sign"] + 5) % 12) + 1:
            deg_diff = abs(planet["degree"] - exalt["degree"])
            points -= max(0, 60 - (deg_diff * 2))
    own_signs = {
        "Sun": [5], "Moon": [4], "Mars": [1, 8], "Mercury": [3, 6],
        "Jupiter": [9, 12], "Venus": [2, 7], "Saturn": [10, 11],
    }
    if sign in own_signs.get(name, []):
        points += 30
    friends = {
        "Sun": ["Moon", "Mars", "Jupiter"],
        "Moon": ["Sun", "Mercury"],
        "Mars": ["Sun", "Moon", "Jupiter"],
        "Mercury": ["Sun", "Venus"],
        "Jupiter": ["Sun", "Moon", "Mars"],
        "Venus": ["Mercury", "Saturn"],
        "Saturn": ["Mercury", "Venus"],
    }
    for friend in friends.get(name, []):
        if sign in own_signs.get(friend, []):
            points += 15
            break
    return max(0, points)


def calculate_dig_bala(planet, houses):
    dig_bala_houses = {
        "Sun": 10, "Moon": 4, "Mars": 10, "Mercury": 1,
        "Jupiter": 1, "Venus": 4, "Saturn": 7,
    }
    planet_house = planet_house_map(houses).get(planet["name"])
    if not planet_house:
        return 0
    ideal_house = dig_bala_houses.get(planet["name"])
    if planet_house == ideal_house:
        return 60
    distance = min(abs(planet_house - ideal_house), 12 - abs(planet_house - ideal_house))
    return max(0, 60 - (distance * 10))


def calculate_kala_bala(planet, birth_info, planets=None):
    try:
        from .sun_data import get_sun_times
    except ImportError:
        pass
    points = 0
    name = planet["name"]
    jd = birth_info.get("jd_ut", 0)
    lat = birth_info.get("latitude", 0)
    lon = birth_info.get("longitude", 0)
    try:
        sun_data = get_sun_times(jd, lat, lon)
        is_day = sun_data["is_day_birth"]
        vedic_weekday = sun_data["vedic_weekday"]
    except Exception:
        birth_hour = birth_info.get("birth_time", datetime.min.time()).hour
        is_day = 6 <= birth_hour < 18
        vedic_weekday = int(swe.day_of_week(jd))
    day_strong = ["Sun", "Jupiter", "Venus"]
    night_strong = ["Moon", "Mars", "Saturn"]
    if name in day_strong and is_day:
        points += 30
    elif name in night_strong and not is_day:
        points += 30
    elif name == "Mercury":
        points += 30
    if name == "Moon":
        sun_lon = None
        if planets:
            for p in planets:
                if p.get("name") == "Sun":
                    if "longitude" in p:
                        sun_lon = p["longitude"]
                    elif "sign" in p and "degree" in p:
                        sun_lon = (p["sign"] - 1) * 30 + p["degree"]
                    break
        if sun_lon is None:
            try:
                sun_lon = swe.calc_ut(jd, swe.SUN)[0][0]
            except Exception:
                sun_lon = 0.0
        moon_lon = planet.get("longitude")
        if moon_lon is None:
            moon_lon = (planet["sign"] - 1) * 30 + planet.get("degree", 0)
        phase = (moon_lon - sun_lon) % 360
        if phase > 180:
            phase = 360 - phase
        points += 60 * (phase / 180)
    weekday_rulers = {0: "Sun", 1: "Moon", 2: "Mars", 3: "Mercury", 4: "Jupiter", 5: "Venus", 6: "Saturn"}
    if weekday_rulers.get(vedic_weekday) == name:
        points += 45
    return points


def calculate_chesta_bala(planet):
    if planet["name"] in ["Sun", "Moon"]:
        return 30
    if planet.get("retrograde", False):
        return 60
    return 30


def get_naisargika_bala(planet_name):
    return {
        "Sun": 60, "Moon": 51.43, "Venus": 42.86, "Jupiter": 34.29,
        "Mercury": 25.71, "Mars": 17.14, "Saturn": 8.57,
    }.get(planet_name, 0)


def get_required_strength(planet_name):
    return {
        "Sun": 340, "Moon": 360, "Mars": 300, "Mercury": 420,
        "Jupiter": 390, "Venus": 330, "Saturn": 300,
    }.get(planet_name, 300)


def calculate_bhava_bala(houses, planets, birth_info):
    house_strengths = {}
    shadbala = calculate_shadbala(planets, birth_info, houses)
    occ = occupants_by_house(houses)
    lagna = houses.get("lagna_sign") or birth_info.get("lagna_sign") or 1
    for house_num in range(1, 13):
        strength = 0
        occupants = occ.get(house_num, [])
        for occupant in occupants:
            if occupant in shadbala:
                strength += shadbala[occupant]["total"] * 0.25
        house_lord = lord_of_house(int(lagna), house_num)
        if house_lord and house_lord in shadbala:
            strength += shadbala[house_lord]["total"] * 0.5
        house_strengths[house_num] = {
            "strength": strength,
            "occupants": occupants,
            "lord": house_lord,
            "is_strong": strength > 300,
        }
    return house_strengths
