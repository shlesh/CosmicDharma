"""Vedic graha drishti and Jaimini rasi drishti."""

from .chart_utils import planet_house_map


def calculate_vedic_aspects(planets, houses):
    aspects = []
    placed = planet_house_map(houses, planets)

    for planet in planets:
        planet_name = planet["name"]
        planet_sign = planet["sign"]
        planet_house = placed.get(planet_name)
        if not planet_house:
            continue

        aspected_houses = [{
            "house": ((planet_house + 6) % 12) or 12,
            "strength": 100,
            "type": "7th aspect",
        }]

        if planet_name == "Mars":
            aspected_houses.append({
                "house": ((planet_house + 3) % 12) or 12,
                "strength": 75,
                "type": "4th aspect (special)",
            })
            aspected_houses.append({
                "house": ((planet_house + 7) % 12) or 12,
                "strength": 100,
                "type": "8th aspect (special)",
            })
        elif planet_name == "Jupiter":
            aspected_houses.append({
                "house": ((planet_house + 4) % 12) or 12,
                "strength": 100,
                "type": "5th aspect",
            })
            aspected_houses.append({
                "house": ((planet_house + 8) % 12) or 12,
                "strength": 100,
                "type": "9th aspect",
            })
        elif planet_name == "Saturn":
            aspected_houses.append({
                "house": ((planet_house + 2) % 12) or 12,
                "strength": 100,
                "type": "3rd aspect (special)",
            })
            aspected_houses.append({
                "house": ((planet_house + 9) % 12) or 12,
                "strength": 100,
                "type": "10th aspect (special)",
            })

        aspects.append({
            "planet": planet_name,
            "from_house": planet_house,
            "from_sign": planet_sign,
            "aspects_to": aspected_houses,
        })
    return aspects


def calculate_sign_aspects(planets):
    movable = [1, 4, 7, 10]
    fixed = [2, 5, 8, 11]
    dual = [3, 6, 9, 12]
    sign_aspects = {}
    for sign in range(1, 13):
        if sign in movable:
            sign_aspects[sign] = [t for t in fixed if abs(t - sign) not in (1, 11)]
        elif sign in fixed:
            sign_aspects[sign] = [t for t in movable if abs(t - sign) not in (1, 11)]
        else:
            sign_aspects[sign] = [t for t in dual if t != sign]
    return sign_aspects


def find_planetary_combinations(planets, aspects):
    yogas = []
    for i, aspect1 in enumerate(aspects):
        for aspect2 in aspects[i + 1:]:
            p2_house = aspect2["from_house"]
            p1_house = aspect1["from_house"]
            if any(a["house"] == p2_house for a in aspect1["aspects_to"]) and any(
                a["house"] == p1_house for a in aspect2["aspects_to"]
            ):
                yogas.append({
                    "type": "Mutual Aspect",
                    "planets": [aspect1["planet"], aspect2["planet"]],
                    "description": f"{aspect1['planet']} and {aspect2['planet']} are in mutual aspect",
                })
    return yogas
