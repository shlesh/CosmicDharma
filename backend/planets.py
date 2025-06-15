# backend/planets.py - CORRECTED VERSION
import swisseph as swe

def calculate_planets(binfo, *, node_type: str = "mean"):
    """
    Calculate sidereal planetary longitudes for Vedic astrology.
    Returns list of dicts: name, longitude, sign, degree_in_sign, nakshatra_pada.
    """
    planet_ids = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mercury': swe.MERCURY,
        'Venus': swe.VENUS,
        'Mars': swe.MARS,
        'Jupiter': swe.JUPITER,
        'Saturn': swe.SATURN,
        'Rahu': swe.MEAN_NODE if node_type.lower() == "mean" else swe.TRUE_NODE,
    }
    
    results = []
    for name, pid in planet_ids.items():
        values, _ = swe.calc_ut(binfo['jd_ut'], pid)
        lon, lat, dist = values[:3]
        
        # Apply ayanamsa to get sidereal longitude
        sidereal_lon = (lon - binfo['sidereal_offset']) % 360
        
        sign = int(sidereal_lon // 30) + 1
        deg_in_sign = sidereal_lon % 30
        
        # Calculate nakshatra and pada
        nakshatra_idx = int(sidereal_lon // (360/27))
        nakshatra_deg = sidereal_lon % (360/27)
        pada = int(nakshatra_deg // (360/27/4)) + 1
        
        results.append({
            'name': name,
            'longitude': sidereal_lon,
            'tropical_longitude': lon,  # Keep tropical for reference
            'sign': sign,
            'degree': deg_in_sign,
            'nakshatra_index': nakshatra_idx,
            'pada': pada,
            'retrograde': _is_retrograde(name, binfo['jd_ut'], pid)
        })
    
    # Add Ketu (always opposite to Rahu)
    rahu = next(p for p in results if p['name'] == 'Rahu')
    ketu_lon = (rahu['longitude'] + 180) % 360
    ketu_sign = int(ketu_lon // 30) + 1
    ketu_deg = ketu_lon % 30
    ketu_nak_idx = int(ketu_lon // (360/27))
    ketu_nak_deg = ketu_lon % (360/27)
    ketu_pada = int(ketu_nak_deg // (360/27/4)) + 1
    
    results.append({
        'name': 'Ketu',
        'longitude': ketu_lon,
        'tropical_longitude': (rahu['tropical_longitude'] + 180) % 360,
        'sign': ketu_sign,
        'degree': ketu_deg,
        'nakshatra_index': ketu_nak_idx,
        'pada': ketu_pada,
        'retrograde': True  # Nodes are always retrograde
    })
    
    return results

def _is_retrograde(planet_name, jd, planet_id):
    """Check if planet is retrograde."""
    if planet_name in ['Sun', 'Moon', 'Rahu', 'Ketu']:
        return planet_name in ['Rahu', 'Ketu']  # Nodes always retrograde
    
    # Check speed to determine retrograde motion
    tomorrow = jd + 1
    pos_today, _ = swe.calc_ut(jd, planet_id)
    pos_tomorrow, _ = swe.calc_ut(tomorrow, planet_id)
    
    # If longitude decreases, planet is retrograde
    return pos_tomorrow[0] < pos_today[0]