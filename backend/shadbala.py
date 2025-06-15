# backend/shadbala.py - PLANETARY STRENGTH CALCULATIONS
"""
Calculate Shadbala (six-fold strength) of planets.
This is crucial for determining which planets will give strong results.
"""

import math
from datetime import datetime

def calculate_shadbala(planets, birth_info, houses):
    """
    Calculate six types of planetary strength:
    1. Sthana Bala (Positional Strength)
    2. Dig Bala (Directional Strength)
    3. Kala Bala (Temporal Strength)
    4. Chesta Bala (Motional Strength)
    5. Naisargika Bala (Natural Strength)
    6. Drik Bala (Aspectual Strength)
    """
    
    shadbala = {}
    
    for planet in planets:
        if planet['name'] in ['Rahu', 'Ketu']:
            continue  # Nodes don't have Shadbala
            
        strength = {
            'sthana_bala': calculate_sthana_bala(planet, planets),
            'dig_bala': calculate_dig_bala(planet, houses),
            'kala_bala': calculate_kala_bala(planet, birth_info),
            'chesta_bala': calculate_chesta_bala(planet),
            'naisargika_bala': get_naisargika_bala(planet['name']),
            'drik_bala': 0  # Would need aspect calculations
        }
        
        # Total strength in Rupas
        strength['total'] = sum(strength.values())
        
        # Required strength for planet to give good results
        strength['required'] = get_required_strength(planet['name'])
        strength['is_strong'] = strength['total'] >= strength['required']
        
        shadbala[planet['name']] = strength
    
    return shadbala

def calculate_sthana_bala(planet, all_planets):
    """
    Positional Strength based on:
    - Exaltation/Debilitation
    - Own sign/Friendly sign
    - Placement in divisions
    """
    points = 0
    sign = planet['sign']
    name = planet['name']
    
    # Exaltation points (max 60)
    exaltation_data = {
        'Sun': {'sign': 1, 'degree': 10},      # Aries 10°
        'Moon': {'sign': 2, 'degree': 3},      # Taurus 3°
        'Mars': {'sign': 10, 'degree': 28},    # Capricorn 28°
        'Mercury': {'sign': 6, 'degree': 15},  # Virgo 15°
        'Jupiter': {'sign': 4, 'degree': 5},   # Cancer 5°
        'Venus': {'sign': 12, 'degree': 27},   # Pisces 27°
        'Saturn': {'sign': 7, 'degree': 20}    # Libra 20°
    }
    
    if name in exaltation_data:
        exalt = exaltation_data[name]
        if sign == exalt['sign']:
            # Calculate based on proximity to exact exaltation degree
            deg_diff = abs(planet['degree'] - exalt['degree'])
            points += max(0, 60 - (deg_diff * 2))
        elif sign == ((exalt['sign'] + 5) % 12) + 1:  # Debilitation
            deg_diff = abs(planet['degree'] - exalt['degree'])
            points -= max(0, 60 - (deg_diff * 2))
    
    # Own sign strength (30 points)
    own_signs = {
        'Sun': [5],           # Leo
        'Moon': [4],          # Cancer
        'Mars': [1, 8],       # Aries, Scorpio
        'Mercury': [3, 6],    # Gemini, Virgo
        'Jupiter': [9, 12],   # Sagittarius, Pisces
        'Venus': [2, 7],      # Taurus, Libra
        'Saturn': [10, 11]    # Capricorn, Aquarius
    }
    
    if sign in own_signs.get(name, []):
        points += 30
    
    # Friendly sign (15 points) - simplified
    friends = {
        'Sun': ['Moon', 'Mars', 'Jupiter'],
        'Moon': ['Sun', 'Mercury'],
        'Mars': ['Sun', 'Moon', 'Jupiter'],
        'Mercury': ['Sun', 'Venus'],
        'Jupiter': ['Sun', 'Moon', 'Mars'],
        'Venus': ['Mercury', 'Saturn'],
        'Saturn': ['Mercury', 'Venus']
    }
    
    # Check if in friend's sign
    for friend in friends.get(name, []):
        friend_signs = own_signs.get(friend, [])
        if sign in friend_signs:
            points += 15
            break
    
    return max(0, points)  # Don't go below 0

def calculate_dig_bala(planet, houses):
    """
    Directional Strength based on house placement.
    Planets gain strength in certain houses.
    """
    dig_bala_houses = {
        'Sun': 10,      # 10th house (Zenith)
        'Moon': 4,      # 4th house (Nadir)
        'Mars': 10,     # 10th house
        'Mercury': 1,   # 1st house (Ascendant)
        'Jupiter': 1,   # 1st house
        'Venus': 4,     # 4th house
        'Saturn': 7     # 7th house (Descendant)
    }
    
    # Find planet's house
    planet_house = None
    for house_num, occupants in houses['houses'].items():
        if planet['name'] in occupants:
            planet_house = house_num
            break
    
    if not planet_house:
        return 0
    
    # Maximum dig bala when in ideal house
    ideal_house = dig_bala_houses.get(planet['name'])
    if planet_house == ideal_house:
        return 60
    
    # Calculate based on distance from ideal house
    distance = min(
        abs(planet_house - ideal_house),
        12 - abs(planet_house - ideal_house)
    )
    
    return max(0, 60 - (distance * 10))

def calculate_kala_bala(planet, birth_info):
    """
    Temporal Strength based on:
    - Day/Night birth
    - Weekday
    - Hora (planetary hour)
    """
    points = 0
    
    # Day/Night strength (Nathonnatha Bala)
    # Simplified - would need sunrise/sunset calculation
    birth_hour = birth_info.get('birth_time', datetime.min.time()).hour
    is_day_birth = 6 <= birth_hour < 18
    
    day_strong = ['Sun', 'Jupiter', 'Venus']
    night_strong = ['Moon', 'Mars', 'Saturn']
    
    if planet['name'] in day_strong and is_day_birth:
        points += 30
    elif planet['name'] in night_strong and not is_day_birth:
        points += 30
    elif planet['name'] == 'Mercury':  # Always gets some strength
        points += 15
    
    # Paksha Bala (Moon phase strength) - for Moon only
    if planet['name'] == 'Moon':
        # Would need Sun-Moon distance calculation
        # Simplified version
        points += 30  # Placeholder
    
    # Weekday strength (Vara Bala)
    weekday_rulers = {
        0: 'Moon',     # Monday
        1: 'Mars',     # Tuesday
        2: 'Mercury',  # Wednesday
        3: 'Jupiter',  # Thursday
        4: 'Venus',    # Friday
        5: 'Saturn',   # Saturday
        6: 'Sun'       # Sunday
    }
    
    # Would need to calculate weekday from Julian Day
    # Placeholder calculation
    jd = birth_info.get('jd_ut', 0)
    weekday = int(jd + 1.5) % 7
    
    if weekday_rulers.get(weekday) == planet['name']:
        points += 15
    
    return points

def calculate_chesta_bala(planet):
    """
    Motional Strength based on speed and retrogression.
    Maximum when retrograde (for superior planets).
    """
    if planet['name'] in ['Sun', 'Moon']:
        return 30  # Luminaries get fixed Chesta Bala
    
    # Retrograde planets get maximum Chesta Bala
    if planet.get('retrograde', False):
        return 60
    
    # Otherwise based on speed (simplified)
    return 30

def get_naisargika_bala(planet_name):
    """Natural strength of planets in descending order."""
    natural_strength = {
        'Sun': 60,
        'Moon': 51.43,
        'Venus': 42.86,
        'Jupiter': 34.29,
        'Mercury': 25.71,
        'Mars': 17.14,
        'Saturn': 8.57
    }
    return natural_strength.get(planet_name, 0)

def get_required_strength(planet_name):
    """Minimum required strength for planet to give good results."""
    requirements = {
        'Sun': 340,
        'Moon': 360,
        'Mars': 300,
        'Mercury': 420,
        'Jupiter': 390,
        'Venus': 330,
        'Saturn': 300
    }
    return requirements.get(planet_name, 300)

def calculate_bhava_bala(houses, planets, birth_info):
    """
    Calculate house strengths based on:
    - Occupants' strength
    - Lord's strength
    - Aspects received
    """
    house_strengths = {}
    
    # Get planetary strengths first
    shadbala = calculate_shadbala(planets, birth_info, houses)
    
    for house_num in range(1, 13):
        strength = 0
        
        # Strength from occupants
        occupants = houses['houses'].get(house_num, [])
        for occupant in occupants:
            if occupant in shadbala:
                strength += shadbala[occupant]['total'] * 0.25
        
        # Strength from house lord
        house_sign = house_num  # In whole sign system
        house_lord = get_sign_lord(house_sign)
        if house_lord and house_lord in shadbala:
            strength += shadbala[house_lord]['total'] * 0.5
        
        house_strengths[house_num] = {
            'strength': strength,
            'occupants': occupants,
            'lord': house_lord,
            'is_strong': strength > 300
        }
    
    return house_strengths

def get_sign_lord(sign_num):
    """Get ruling planet of a sign."""
    lords = {
        1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon',
        5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars',
        9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
    }
    return lords.get(sign_num)