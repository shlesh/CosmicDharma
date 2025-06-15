import swisseph as swe

def calculate_planets(binfo):
    """
    Calculate geocentric planetary longitudes for core planets.
    Returns list of dicts: name, longitude, sign, degree_in_sign.
    """
    planet_ids = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mercury': swe.MERCURY,
        'Venus': swe.VENUS,
        'Mars': swe.MARS,
        'Jupiter': swe.JUPITER,
        'Saturn': swe.SATURN,
        'Rahu': swe.MEAN_NODE,
    }
    results = []
    for name, pid in planet_ids.items():
        lon, lat, dist = swe.calc_ut(binfo['jd_ut'], pid)
        sign = int(lon // 30) + 1
        deg_in_sign = lon % 30
        results.append({
            'name': name,
            'longitude': lon,
            'sign': sign,
            'degree': deg_in_sign,
        })
    return results
