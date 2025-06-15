def calculate_basic_divisional_charts(planets):
    """Return D9 and D10 charts for given planets."""
    charts = {"D9": {}, "D10": {}}
    for p in planets:
        sign = int(p["longitude"] // 30) + 1
        charts["D9"][p["name"]] = sign
        charts["D10"][p["name"]] = sign
    return charts
