# backend/aspects.py - VEDIC ASPECT SYSTEM
"""
Vedic aspects (Graha Drishti) are different from Western aspects.
All planets aspect the 7th house from their position (100% strength).
Mars, Jupiter, and Saturn have special aspects.
"""

def calculate_vedic_aspects(planets, houses):
    """
    Calculate Vedic planetary aspects (Graha Drishti).
    
    Standard aspects:
    - All planets aspect 7th house (opposite sign) with full strength
    
    Special aspects:
    - Mars: 4th and 8th aspects (in addition to 7th)
    - Jupiter: 5th and 9th aspects (in addition to 7th)
    - Saturn: 3rd and 10th aspects (in addition to 7th)
    
    Rahu/Ketu: 5th, 7th, and 9th aspects (some traditions)
    """
    
    aspects = []
    
    for planet in planets:
        planet_name = planet['name']
        planet_sign = planet['sign']
        planet_house = None
        
        # Find which house the planet occupies
        for house_num, occupants in houses['houses'].items():
            if planet_name in occupants:
                planet_house = house_num
                break
        
        if not planet_house:
            continue
        
        aspected_houses = []
        
        # All planets aspect 7th house/sign
        seventh_house = ((planet_house + 6) % 12) or 12
        aspected_houses.append({
            'house': seventh_house,
            'strength': 100,  # Full strength
            'type': '7th aspect (opposition)'
        })
        
        # Special aspects
        if planet_name == 'Mars':
            # 4th aspect
            fourth_house = ((planet_house + 3) % 12) or 12
            aspected_houses.append({
                'house': fourth_house,
                'strength': 75,  # 3/4 strength
                'type': '4th aspect (special)'
            })
            # 8th aspect
            eighth_house = ((planet_house + 7) % 12) or 12
            aspected_houses.append({
                'house': eighth_house,
                'strength': 100,  # Full strength
                'type': '8th aspect (special)'
            })
            
        elif planet_name == 'Jupiter':
            # 5th aspect
            fifth_house = ((planet_house + 4) % 12) or 12
            aspected_houses.append({
                'house': fifth_house,
                'strength': 100,  # Full strength
                'type': '5th aspect (trine)'
            })
            # 9th aspect
            ninth_house = ((planet_house + 8) % 12) or 12
            aspected_houses.append({
                'house': ninth_house,
                'strength': 100,  # Full strength
                'type': '9th aspect (trine)'
            })
            
        elif planet_name == 'Saturn':
            # 3rd aspect
            third_house = ((planet_house + 2) % 12) or 12
            aspected_houses.append({
                'house': third_house,
                'strength': 100,  # Full strength
                'type': '3rd aspect (special)'
            })
            # 10th aspect
            tenth_house = ((planet_house + 9) % 12) or 12
            aspected_houses.append({
                'house': tenth_house,
                'strength': 100,  # Full strength
                'type': '10th aspect (special)'
            })
            
        elif planet_name in ['Rahu', 'Ketu']:
            # Some traditions give special aspects to nodes
            # 5th aspect
            fifth_house = ((planet_house + 4) % 12) or 12
            aspected_houses.append({
                'house': fifth_house,
                'strength': 100,
                'type': '5th aspect (nodal)'
            })
            # 9th aspect
            ninth_house = ((planet_house + 8) % 12) or 12
            aspected_houses.append({
                'house': ninth_house,
                'strength': 100,
                'type': '9th aspect (nodal)'
            })
        
        aspects.append({
            'planet': planet_name,
            'from_house': planet_house,
            'from_sign': planet_sign,
            'aspects_to': aspected_houses
        })
    
    return aspects

def calculate_sign_aspects(planets):
    """
    Calculate Rasi Drishti (Sign aspects) according to Jaimini system.
    
    Fixed signs aspect Movable signs (except adjacent)
    Movable signs aspect Fixed signs (except adjacent)
    Dual signs aspect other Dual signs
    """
    
    sign_aspects = {}
    
    # Define sign qualities
    movable = [1, 4, 7, 10]  # Aries, Cancer, Libra, Capricorn
    fixed = [2, 5, 8, 11]    # Taurus, Leo, Scorpio, Aquarius
    dual = [3, 6, 9, 12]     # Gemini, Virgo, Sagittarius, Pisces
    
    for sign in range(1, 13):
        aspected_signs = []
        
        if sign in movable:
            # Movable signs aspect all fixed signs except adjacent
            for target in fixed:
                if abs(target - sign) not in [1, 11]:  # Not adjacent
                    aspected_signs.append(target)
                    
        elif sign in fixed:
            # Fixed signs aspect all movable signs except adjacent
            for target in movable:
                if abs(target - sign) not in [1, 11]:  # Not adjacent
                    aspected_signs.append(target)
                    
        else:  # Dual signs
            # Dual signs aspect other dual signs
            for target in dual:
                if target != sign:
                    aspected_signs.append(target)
        
        sign_aspects[sign] = aspected_signs
    
    return sign_aspects

def find_planetary_combinations(planets, aspects):
    """
    Find important planetary combinations (yogas) based on aspects.
    """
    yogas = []
    
    # Find mutual aspects
    for i, aspect1 in enumerate(aspects):
        planet1 = aspect1['planet']
        
        for aspect2 in aspects[i+1:]:
            planet2 = aspect2['planet']
            
            # Check if planet1 aspects planet2's house and vice versa
            planet2_house = aspect2['from_house']
            planet1_house = aspect1['from_house']
            
            planet1_aspects_planet2 = any(
                asp['house'] == planet2_house 
                for asp in aspect1['aspects_to']
            )
            
            planet2_aspects_planet1 = any(
                asp['house'] == planet1_house 
                for asp in aspect2['aspects_to']
            )
            
            if planet1_aspects_planet2 and planet2_aspects_planet1:
                yogas.append({
                    'type': 'Mutual Aspect',
                    'planets': [planet1, planet2],
                    'description': f'{planet1} and {planet2} are in mutual aspect'
                })
    
    return yogas
