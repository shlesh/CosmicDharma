"""
Compute 12 house cusps & assign planets to their houses.
"""
import swisseph as swe
from .astro_constants import RASHI_METADATA
from .planets import get_planetary_positions


def get_house_analysis(jd: float, lat: float, lon: float) -> dict:
    """
    Returns:
      {
        'cusps': [
           { 'house':1, 'sign':'Aries', 'deg':10.23 }, ...
        ],
        'planets_in_houses': [
           { 'planet':'Sun', 'house':1 }, ...
        ]
      }
    """
    # 1) Get cusps and ascmc (unused)
    cusps, _ = swe.houses(jd, lat, lon, b'P')
    # 2) Map cusps to sign name and intra-sign degree
    cusp_list = []
    for i, cusp in enumerate(cusps, start=1):
        idx = int(cusp // 30)
        deg = cusp % 30
        cusp_list.append({
            'house': i,
            'sign':  RASHI_METADATA[idx]['name'],
            'deg':   round(deg, 2),
        })

    # 3) Planetary positions
    planet_positions = get_planetary_positions(jd)
    planets_in_houses = []
    for name, info in planet_positions.items():
        p_long = info['longitude']
        # find which house cusp segment it falls into
        house_num = None
        for j in range(12):
            start = cusps[j]
            end = cusps[(j+1) % 12]
            if start < end:
                if start <= p_long < end:
                    house_num = j + 1
                    break
            else:
                # wrap around
                if p_long >= start or p_long < end:
                    house_num = j + 1
                    break
        planets_in_houses.append({'planet': name, 'house': house_num})

    return {
        'cusps': cusp_list,
        'planets_in_houses': planets_in_houses,
    }
