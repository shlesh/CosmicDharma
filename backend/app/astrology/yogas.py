"""Major Pārāśari yogas. House lords are counted from the actual Lagna."""

from .chart_utils import lord_of_house, planet_house_map


def _lagna_sign(houses):
    if houses and houses.get("lagna_sign"):
        return int(houses["lagna_sign"])
    details = (houses or {}).get("houses") or {}
    first = details.get(1) or details.get("1")
    if isinstance(first, dict) and first.get("sign_id"):
        return int(first["sign_id"])
    return 1


def calculate_pancha_mahapurusha_yogas(planets, houses):
    yogas = []
    kendra_houses = [1, 4, 7, 10]
    exaltation = {"Mars": 10, "Mercury": 6, "Jupiter": 4, "Venus": 12, "Saturn": 7}
    own_signs = {
        "Mars": [1, 8], "Mercury": [3, 6], "Jupiter": [9, 12],
        "Venus": [2, 7], "Saturn": [10, 11],
    }
    yoga_names = {
        "Mars": "Ruchaka Yoga", "Mercury": "Bhadra Yoga", "Jupiter": "Hamsa Yoga",
        "Venus": "Malavya Yoga", "Saturn": "Sasa Yoga",
    }
    effects = {
        "Ruchaka Yoga": "Courageous, commander-like qualities, athletic build, leadership",
        "Bhadra Yoga": "Intelligent, good communication, scholarly, blessed with wealth",
        "Hamsa Yoga": "Spiritual, righteous, beautiful appearance, respected by all",
        "Malavya Yoga": "Luxurious life, artistic talents, attractive, wealthy",
        "Sasa Yoga": "Disciplined, authoritative, long life, political success",
    }
    placed = planet_house_map(houses)
    for planet in planets:
        name = planet["name"]
        if name not in yoga_names:
            continue
        planet_house = placed.get(name)
        if planet_house in kendra_houses:
            planet_sign = planet["sign"]
            if planet_sign == exaltation.get(name) or planet_sign in own_signs.get(name, []):
                title = yoga_names[name]
                yogas.append({
                    "name": title,
                    "type": "Pancha Mahapurusha Yoga",
                    "planet": name,
                    "house": planet_house,
                    "sign": planet_sign,
                    "strength": "Strong" if planet_sign == exaltation.get(name) else "Medium",
                    "effects": effects[title],
                })
    return yogas


def calculate_raj_yogas(planets, houses, aspects=None):
    yogas = []
    lagna = _lagna_sign(houses)
    house_lords = {n: lord_of_house(lagna, n) for n in range(1, 13)}
    placed = planet_house_map(houses)
    planet_positions = {
        p["name"]: {"sign": p["sign"], "house": placed.get(p["name"])}
        for p in planets
    }

    def check_aspect(p_from, p_to):
        if not aspects:
            return False
        to_house = planet_positions.get(p_to, {}).get("house")
        if not to_house:
            return False
        for aspect_data in aspects:
            if aspect_data["planet"] == p_from:
                for target in aspect_data["aspects_to"]:
                    if target["house"] == to_house:
                        return True
        return False

    for kendra in [1, 4, 7, 10]:
        for trikona in [1, 5, 9]:
            if kendra == trikona:
                continue
            kendra_lord = house_lords.get(kendra)
            trikona_lord = house_lords.get(trikona)
            if not kendra_lord or not trikona_lord or kendra_lord == trikona_lord:
                continue
            h1 = planet_positions.get(kendra_lord, {}).get("house")
            h2 = planet_positions.get(trikona_lord, {}).get("house")
            if h1 and h2 and h1 == h2:
                yogas.append({
                    "name": "Raja Yoga", "type": "Conjunction",
                    "planets": [kendra_lord, trikona_lord], "houses": [kendra, trikona],
                    "strength": "Very Strong",
                    "effects": "Power, authority, success, high position in life",
                })
                continue
            if h1 == trikona and h2 == kendra:
                yogas.append({
                    "name": "Raja Yoga", "type": "Parivartana",
                    "planets": [kendra_lord, trikona_lord], "houses": [kendra, trikona],
                    "strength": "Very Strong",
                    "effects": "Mutual strengthening, power, destiny connection",
                })
                continue
            if check_aspect(kendra_lord, trikona_lord) and check_aspect(trikona_lord, kendra_lord):
                yogas.append({
                    "name": "Raja Yoga", "type": "Mutual Aspect",
                    "planets": [kendra_lord, trikona_lord], "houses": [kendra, trikona],
                    "strength": "Strong",
                    "effects": "Public success, partnership strength",
                })
    return yogas


def calculate_dhana_yogas(planets, houses):
    yogas = []
    lagna = _lagna_sign(houses)
    house_lords = {n: lord_of_house(lagna, n) for n in range(1, 13)}
    placed = planet_house_map(houses)
    wealth_houses = [1, 2, 5, 9, 11]
    for i, house1 in enumerate(wealth_houses):
        for house2 in wealth_houses[i + 1:]:
            lord1 = house_lords[house1]
            lord2 = house_lords[house2]
            if lord1 and lord2 and lord1 != lord2 and lord1 in placed and lord2 in placed:
                if placed[lord1] == placed[lord2]:
                    yogas.append({
                        "name": "Dhana Yoga",
                        "type": "Wealth Combination",
                        "planets": [lord1, lord2],
                        "houses": [house1, house2],
                        "effects": "Wealth, prosperity, financial gains",
                    })
    return yogas


def calculate_chandra_yogas(planets):
    yogas = []
    moon = next((p for p in planets if p["name"] == "Moon"), None)
    if not moon:
        return yogas
    moon_sign = moon["sign"]
    planets_from_moon = {}
    for planet in planets:
        if planet["name"] == "Moon":
            continue
        planets_from_moon[planet["name"]] = ((planet["sign"] - moon_sign) % 12) or 12
    planets_in_2nd = [p for p, h in planets_from_moon.items() if h == 2 and p not in ["Sun", "Rahu", "Ketu"]]
    planets_in_12th = [p for p, h in planets_from_moon.items() if h == 12 and p not in ["Sun", "Rahu", "Ketu"]]
    if planets_in_2nd:
        yogas.append({
            "name": "Sunafa Yoga", "type": "Chandra Yoga",
            "planets": ["Moon"] + planets_in_2nd,
            "effects": "Self-earned wealth, intelligent, good reputation",
        })
    if planets_in_12th:
        yogas.append({
            "name": "Anafa Yoga", "type": "Chandra Yoga",
            "planets": ["Moon"] + planets_in_12th,
            "effects": "Well-mannered, charitable, spiritual inclination",
        })
    if planets_in_2nd and planets_in_12th:
        yogas.append({
            "name": "Durudhara Yoga", "type": "Chandra Yoga",
            "planets": ["Moon"] + planets_in_2nd + planets_in_12th,
            "effects": "Wealthy, charitable, famous, enjoys all comforts",
        })
    kendra_from_moon = [
        p for p, h in planets_from_moon.items()
        if h in (1, 4, 7, 10) and p not in ["Sun", "Rahu", "Ketu"]
    ]
    if not planets_in_2nd and not planets_in_12th and not kendra_from_moon:
        yogas.append({
            "name": "Kemadruma Yoga",
            "type": "Chandra Yoga (Negative)",
            "planets": ["Moon"],
            "effects": "Isolation of the Moon. Cancelled when a planet occupies a kendra from the Moon.",
        })
    if planets_from_moon.get("Jupiter") in [1, 4, 7, 10]:
        yogas.append({
            "name": "Gaja Kesari Yoga", "type": "Chandra Yoga",
            "planets": ["Moon", "Jupiter"],
            "effects": "Wisdom, wealth, fame, respected like an elephant",
        })
    return yogas


def calculate_nabhasa_yogas(planets):
    yogas = []
    movable, fixed, dual = [1, 4, 7, 10], [2, 5, 8, 11], [3, 6, 9, 12]
    classic = [p for p in planets if p["name"] not in ["Rahu", "Ketu"]]
    in_mov = sum(1 for p in classic if p["sign"] in movable)
    in_fix = sum(1 for p in classic if p["sign"] in fixed)
    in_dual = sum(1 for p in classic if p["sign"] in dual)
    if in_mov == 7:
        yogas.append({"name": "Rajju Yoga", "type": "Nabhasa Yoga", "effects": "Travel, unstable life but gains through movement"})
    if in_fix == 7:
        yogas.append({"name": "Musala Yoga", "type": "Nabhasa Yoga", "effects": "Stable, determined, proud, prosperous"})
    if in_dual == 7:
        yogas.append({"name": "Nala Yoga", "type": "Nabhasa Yoga", "effects": "Intelligent, skilled in many arts, adaptable"})
    return yogas


def generate_yoga_summary(all_yogas):
    summary = []
    if all_yogas["pancha_mahapurusha"]:
        summary.append(f"Chart has {len(all_yogas['pancha_mahapurusha'])} Mahapurusha Yoga(s)")
    if all_yogas["raj_yogas"]:
        summary.append(f"Chart has {len(all_yogas['raj_yogas'])} Raja Yoga(s)")
    if all_yogas["dhana_yogas"]:
        summary.append(f"Chart has {len(all_yogas['dhana_yogas'])} Dhana Yoga(s)")
    for yoga in all_yogas["chandra_yogas"]:
        if yoga["name"] == "Gaja Kesari Yoga":
            summary.append("Gaja Kesari Yoga present")
            break
    return summary


def calculate_all_yogas(planets, houses, aspects=None):
    all_yogas = {
        "pancha_mahapurusha": calculate_pancha_mahapurusha_yogas(planets, houses),
        "raj_yogas": calculate_raj_yogas(planets, houses, aspects=aspects),
        "dhana_yogas": calculate_dhana_yogas(planets, houses),
        "chandra_yogas": calculate_chandra_yogas(planets),
        "nabhasa_yogas": calculate_nabhasa_yogas(planets),
    }
    return {
        "yogas": all_yogas,
        "total_count": sum(len(v) for v in all_yogas.values()),
        "summary": generate_yoga_summary(all_yogas),
    }
