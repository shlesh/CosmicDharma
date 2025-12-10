# backend/yogas.py - IMPORTANT VEDIC YOGAS
"""
Calculate important Vedic astrological yogas (planetary combinations).
These are crucial for prediction in Vedic astrology.
"""

from .constants import RASHI_METADATA
from app.utils.signs import get_sign_lord

def calculate_pancha_mahapurusha_yogas(planets, houses):
    """
    Calculate the five great personality yogas.
    Formed when Mars, Mercury, Jupiter, Venus, or Saturn
    are in own sign or exaltation in a kendra (1,4,7,10).
    """
    yogas = []
    kendra_houses = [1, 4, 7, 10]
    
    # Exaltation signs
    exaltation = {
        'Mars': 10,      # Capricorn
        'Mercury': 6,    # Virgo
        'Jupiter': 4,    # Cancer
        'Venus': 12,     # Pisces
        'Saturn': 7      # Libra
    }
    
    # Own signs
    own_signs = {
        'Mars': [1, 8],         # Aries, Scorpio
        'Mercury': [3, 6],      # Gemini, Virgo
        'Jupiter': [9, 12],     # Sagittarius, Pisces
        'Venus': [2, 7],        # Taurus, Libra
        'Saturn': [10, 11]      # Capricorn, Aquarius
    }
    
    yoga_names = {
        'Mars': 'Ruchaka Yoga',
        'Mercury': 'Bhadra Yoga',
        'Jupiter': 'Hamsa Yoga',
        'Venus': 'Malavya Yoga',
        'Saturn': 'Sasa Yoga'
    }
    
    for planet in planets:
        name = planet['name']
        if name not in yoga_names:
            continue
            
        # Find planet's house
        planet_house = None
        for house_num, occupants in houses['houses'].items():
            if name in occupants:
                planet_house = house_num
                break
        
        if planet_house in kendra_houses:
            planet_sign = planet['sign']
            
            # Check if in own sign or exaltation
            if (planet_sign == exaltation.get(name) or 
                planet_sign in own_signs.get(name, [])):
                
                yogas.append({
                    'name': yoga_names[name],
                    'type': 'Pancha Mahapurusha Yoga',
                    'planet': name,
                    'house': planet_house,
                    'sign': planet_sign,
                    'strength': 'Strong' if planet_sign == exaltation.get(name) else 'Medium',
                    'effects': get_mahapurusha_effects(yoga_names[name])
                })
    
    return yogas

def get_mahapurusha_effects(yoga_name):
    """Get the effects of Pancha Mahapurusha Yogas."""
    effects = {
        'Ruchaka Yoga': 'Courageous, commander-like qualities, athletic build, leadership',
        'Bhadra Yoga': 'Intelligent, good communication, scholarly, blessed with wealth',
        'Hamsa Yoga': 'Spiritual, righteous, beautiful appearance, respected by all',
        'Malavya Yoga': 'Luxurious life, artistic talents, attractive, wealthy',
        'Sasa Yoga': 'Disciplined, authoritative, long life, political success'
    }
    return effects.get(yoga_name, '')

def calculate_raj_yogas(planets, houses, aspects=None):
    """
    Calculate Raja Yogas (combinations for power and success).
    Formed by connections (Sambandha) between kendra (1,4,7,10) and trikona (1,5,9) lords.
    Connection types accepted:
    1. Conjunction
    2. Parivartana (Exchange of Signs)
    3. Mutual Aspect
    """
    yogas = []
    kendra_houses = [1, 4, 7, 10]
    trikona_houses = [1, 5, 9]
    
    # Get house lords
    house_lords = {}
    for house_num in range(1, 13):
        # Find the sign in this house
        house_sign = house_num  # In whole sign system
        house_lords[house_num] = get_sign_lord(house_sign)
    
    # Find planets and their positions
    planet_positions = {}
    for planet in planets:
        planet_positions[planet['name']] = {
            'sign': planet['sign'],
            'house': None
        }
    
    # Assign houses to planets
    for house_num, occupants in houses['houses'].items():
        for planet_name in occupants:
            if planet_name in planet_positions:
                planet_positions[planet_name]['house'] = house_num

    # Helper to check aspects
    def check_aspect(p_from, p_to):
        if not aspects: return False
        
        # Find house of p_to
        to_house = planet_positions.get(p_to, {}).get('house')
        if not to_house: return False
        
        # Check if p_from aspects that house
        for aspect_data in aspects:
            if aspect_data['planet'] == p_from:
                for target in aspect_data['aspects_to']:
                    if target['house'] == to_house:
                        return True
        return False
    
    # Check for Raja Yoga combinations
    for kendra in kendra_houses:
        for trikona in trikona_houses:
            if kendra == trikona:  # Skip 1st house (both kendra and trikona)
                continue
                
            kendra_lord = house_lords.get(kendra)
            trikona_lord = house_lords.get(trikona)
            
            if kendra_lord and trikona_lord and kendra_lord != trikona_lord:
                
                h1 = planet_positions.get(kendra_lord, {}).get('house')
                h2 = planet_positions.get(trikona_lord, {}).get('house')
                
                # 1. Conjunction
                if h1 and h2 and h1 == h2:
                    yogas.append({
                        'name': 'Raja Yoga',
                        'type': 'Conjunction',
                        'planets': [kendra_lord, trikona_lord],
                        'houses': [kendra, trikona],
                        'strength': 'Very Strong',
                        'effects': 'Power, authority, success, high position in life'
                    })
                    continue
                
                # 2. Parivartana (Exchange of Signs)
                # Kendra Lord in Trikona House AND Trikona Lord in Kendra House
                # (Assuming Whole Sign: House N == Sign N roughly, but strict logic is Lord A in Sign B...)
                # Actually we have house positions. If h1 (Kendra Lord's house) == trikona 
                # AND h2 (Trikona Lord's house) == kendra
                if h1 == trikona and h2 == kendra:
                     yogas.append({
                        'name': 'Raja Yoga',
                        'type': 'Parivartana',
                        'planets': [kendra_lord, trikona_lord],
                        'houses': [kendra, trikona],
                        'strength': 'Very Strong',
                        'effects': 'Mutual strengthening, power, destiny connection'
                    })
                     continue

                # 3. Mutual Aspect
                if check_aspect(kendra_lord, trikona_lord) and check_aspect(trikona_lord, kendra_lord):
                    yogas.append({
                        'name': 'Raja Yoga',
                        'type': 'Mutual Aspect',
                        'planets': [kendra_lord, trikona_lord],
                        'houses': [kendra, trikona],
                        'strength': 'Strong',
                        'effects': 'Public success, partnership strength'
                    })
    
    return yogas

def calculate_dhana_yogas(planets, houses):
    """
    Calculate Dhana Yogas (wealth combinations).
    Connections between 1st, 2nd, 5th, 9th, and 11th house lords.
    """
    yogas = []
    wealth_houses = [1, 2, 5, 9, 11]
    
    # Get house lords and positions (similar to raj yoga calculation)
    house_lords = {}
    for house_num in range(1, 13):
        house_lords[house_num] = get_sign_lord(house_num)
    
    # Check combinations
    for i, house1 in enumerate(wealth_houses):
        for house2 in wealth_houses[i+1:]:
            lord1 = house_lords[house1]
            lord2 = house_lords[house2]
            
            if lord1 and lord2:
                # Find if they're connected (simplified - just checking conjunction)
                # In real implementation, would check aspects too
                for house_num, occupants in houses['houses'].items():
                    if lord1 in occupants and lord2 in occupants:
                        yogas.append({
                            'name': 'Dhana Yoga',
                            'type': 'Wealth Combination',
                            'planets': [lord1, lord2],
                            'houses': [house1, house2],
                            'effects': 'Wealth, prosperity, financial gains'
                        })
                        break
    
    return yogas

def calculate_chandra_yogas(planets):
    """
    Calculate Moon-based yogas (Chandra Yogas).
    These are very important in Vedic astrology.
    """
    yogas = []
    
    # Find Moon
    moon = next((p for p in planets if p['name'] == 'Moon'), None)
    if not moon:
        return yogas
    
    moon_sign = moon['sign']
    
    # Find other planets' positions relative to Moon
    planets_from_moon = {}
    for planet in planets:
        if planet['name'] == 'Moon':
            continue
        houses_from_moon = ((planet['sign'] - moon_sign) % 12) or 12
        planets_from_moon[planet['name']] = houses_from_moon
    
    # Sunafa Yoga - planet in 2nd from Moon
    planets_in_2nd = [p for p, h in planets_from_moon.items() if h == 2 and p not in ['Sun', 'Rahu', 'Ketu']]
    if planets_in_2nd:
        yogas.append({
            'name': 'Sunafa Yoga',
            'type': 'Chandra Yoga',
            'planets': ['Moon'] + planets_in_2nd,
            'effects': 'Self-earned wealth, intelligent, good reputation'
        })
    
    # Anafa Yoga - planet in 12th from Moon
    planets_in_12th = [p for p, h in planets_from_moon.items() if h == 12 and p not in ['Sun', 'Rahu', 'Ketu']]
    if planets_in_12th:
        yogas.append({
            'name': 'Anafa Yoga',
            'type': 'Chandra Yoga',
            'planets': ['Moon'] + planets_in_12th,
            'effects': 'Well-mannered, charitable, spiritual inclination'
        })
    
    # Durudhara Yoga - planets in both 2nd and 12th from Moon
    if planets_in_2nd and planets_in_12th:
        yogas.append({
            'name': 'Durudhara Yoga',
            'type': 'Chandra Yoga',
            'planets': ['Moon'] + planets_in_2nd + planets_in_12th,
            'effects': 'Wealthy, charitable, famous, enjoys all comforts'
        })
    
    # Kemadruma Yoga - no planets in 2nd/12th from Moon (poverty yoga)
    if not planets_in_2nd and not planets_in_12th:
        yogas.append({
            'name': 'Kemadruma Yoga',
            'type': 'Chandra Yoga (Negative)',
            'planets': ['Moon'],
            'effects': 'Struggles in life, poverty, obstacles (can be cancelled by other factors)'
        })
    
    # Gaja Kesari Yoga - Jupiter in kendra from Moon
    jupiter_from_moon = planets_from_moon.get('Jupiter')
    if jupiter_from_moon in [1, 4, 7, 10]:
        yogas.append({
            'name': 'Gaja Kesari Yoga',
            'type': 'Chandra Yoga',
            'planets': ['Moon', 'Jupiter'],
            'effects': 'Wisdom, wealth, fame, respected like an elephant'
        })
    
    return yogas

def calculate_nabhasa_yogas(planets):
    """
    Calculate Nabhasa Yogas based on planetary distribution patterns.
    These yogas are based on how planets are distributed in the chart.
    """
    yogas = []
    
    # Count planets in different sign types
    movable_signs = [1, 4, 7, 10]
    fixed_signs = [2, 5, 8, 11]
    dual_signs = [3, 6, 9, 12]
    
    planets_in_movable = sum(1 for p in planets if p['sign'] in movable_signs and p['name'] not in ['Rahu', 'Ketu'])
    planets_in_fixed = sum(1 for p in planets if p['sign'] in fixed_signs and p['name'] not in ['Rahu', 'Ketu'])
    planets_in_dual = sum(1 for p in planets if p['sign'] in dual_signs and p['name'] not in ['Rahu', 'Ketu'])
    
    # Rajju Yoga - all planets in movable signs
    if planets_in_movable == 7:
        yogas.append({
            'name': 'Rajju Yoga',
            'type': 'Nabhasa Yoga',
            'effects': 'Always traveling, unstable life but gains through travel'
        })
    
    # Musala Yoga - all planets in fixed signs
    if planets_in_fixed == 7:
        yogas.append({
            'name': 'Musala Yoga',
            'type': 'Nabhasa Yoga',
            'effects': 'Stable, determined, proud, prosperous'
        })
    
    # Nala Yoga - all planets in dual signs
    if planets_in_dual == 7:
        yogas.append({
            'name': 'Nala Yoga',
            'type': 'Nabhasa Yoga',
            'effects': 'Intelligent, skilled in many arts, adaptable'
        })
    
    return yogas

def calculate_all_yogas(planets, houses, aspects=None):
    """Calculate all major yogas in the chart."""
    all_yogas = {
        'pancha_mahapurusha': calculate_pancha_mahapurusha_yogas(planets, houses),
        'raj_yogas': calculate_raj_yogas(planets, houses, aspects=aspects),
        'dhana_yogas': calculate_dhana_yogas(planets, houses),
        'chandra_yogas': calculate_chandra_yogas(planets),
        'nabhasa_yogas': calculate_nabhasa_yogas(planets)
    }
    
    # Count total yogas
    total = sum(len(yogas) for yogas in all_yogas.values())
    
    return {
        'yogas': all_yogas,
        'total_count': total,
        'summary': generate_yoga_summary(all_yogas)
    }

def generate_yoga_summary(all_yogas):
    """Generate a summary of the most important yogas."""
    summary = []
    
    # Check for powerful combinations
    if all_yogas['pancha_mahapurusha']:
        summary.append(f"Chart has {len(all_yogas['pancha_mahapurusha'])} Mahapurusha Yoga(s) indicating strong personality")
    
    if all_yogas['raj_yogas']:
        summary.append(f"Chart has {len(all_yogas['raj_yogas'])} Raja Yoga(s) indicating power and authority")
    
    if all_yogas['dhana_yogas']:
        summary.append(f"Chart has {len(all_yogas['dhana_yogas'])} Dhana Yoga(s) indicating wealth potential")
    
    # Check for Gaja Kesari
    for yoga in all_yogas['chandra_yogas']:
        if yoga['name'] == 'Gaja Kesari Yoga':
            summary.append("Gaja Kesari Yoga present - wisdom and fame")
            break
    
    return summary
