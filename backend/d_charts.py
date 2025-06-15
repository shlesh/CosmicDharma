def calculate_divisional_charts(planets):
    """
    Generate major divisional (Varga) charts: Navamsa (D9), Dasamsa (D10).
    Returns dict with 'D9' and 'D10' charts as mappings of planet to sign.
    """
    def varga_sign(lon, divisions):
        # divide 360° into (12*divisions) equal parts
        part = 360/(12*divisions)
        idx = int(lon/part)
        return (idx // divisions) + 1
    d9 = {}
    d10 = {}
    for p in planets:
        lon = p['longitude']
        d9[p['name']] = varga_sign(lon, 9)
        d10[p['name']] = varga_sign(lon, 10)
    return {'D9': d9, 'D10': d10}
