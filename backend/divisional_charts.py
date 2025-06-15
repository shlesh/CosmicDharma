# backend/divisional_charts.py - PROPER VEDIC CALCULATIONS
"""
Divisional chart calculations according to Brihat Parashara Hora Shastra (BPHS)
Each divisional chart has specific calculation rules, not simple division.
"""

def calculate_navamsa(longitude):
    """
    D9 - Navamsa calculation
    Each sign divided into 9 parts of 3°20' each
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    navamsa_part = int(deg_in_sign // (30/9))
    
    # Starting signs for each rashi's navamsa
    # Fire signs start from Aries, Earth from Capricorn, Air from Libra, Water from Cancer
    element = sign % 4
    if element == 0:  # Fire (Aries, Leo, Sagittarius)
        start_sign = 0  # Aries
    elif element == 1:  # Earth (Taurus, Virgo, Capricorn)
        start_sign = 9  # Capricorn
    elif element == 2:  # Air (Gemini, Libra, Aquarius)
        start_sign = 6  # Libra
    else:  # Water (Cancer, Scorpio, Pisces)
        start_sign = 3  # Cancer
    
    navamsa_sign = ((start_sign + navamsa_part) % 12) + 1
    return navamsa_sign

def calculate_hora(longitude):
    """
    D2 - Hora Chart
    Each sign divided into 2 parts of 15° each
    Odd signs: 1st half Sun, 2nd half Moon
    Even signs: 1st half Moon, 2nd half Sun
    """
    sign = int(longitude // 30) + 1
    deg_in_sign = longitude % 30
    
    if sign % 2 == 1:  # Odd sign
        return 5 if deg_in_sign < 15 else 4  # Leo (Sun) or Cancer (Moon)
    else:  # Even sign
        return 4 if deg_in_sign < 15 else 5  # Cancer (Moon) or Leo (Sun)

def calculate_drekkana(longitude):
    """
    D3 - Drekkana Chart
    Each sign divided into 3 parts of 10° each
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // 10)
    
    # 1st part: same sign, 2nd part: 5th from it, 3rd part: 9th from it
    if part == 0:
        return sign + 1
    elif part == 1:
        return ((sign + 4) % 12) + 1
    else:
        return ((sign + 8) % 12) + 1

def calculate_chaturthamsa(longitude):
    """
    D4 - Chaturthamsa (Turyamsa)
    Each sign divided into 4 parts of 7°30' each
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // 7.5)
    
    # For movable signs: start from same sign
    # For fixed signs: start from 4th sign
    # For dual signs: start from 7th sign
    quality = sign % 3
    if quality == 0:  # Movable (Cardinal)
        start = sign
    elif quality == 1:  # Fixed
        start = (sign + 3) % 12
    else:  # Dual (Mutable)
        start = (sign + 6) % 12
    
    return ((start + part) % 12) + 1

def calculate_saptamsa(longitude):
    """
    D7 - Saptamsa
    Each sign divided into 7 parts
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // (30/7))
    
    # Odd signs count from same sign, even signs count from 7th sign
    if (sign + 1) % 2 == 1:
        return ((sign + part) % 12) + 1
    else:
        return ((sign + 6 + part) % 12) + 1

def calculate_dasamsa(longitude):
    """
    D10 - Dasamsa (Career)
    Each sign divided into 10 parts of 3° each
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // 3)
    
    # Odd signs start from same sign, even signs from 9th sign
    if (sign + 1) % 2 == 1:
        return ((sign + part) % 12) + 1
    else:
        return ((sign + 8 + part) % 12) + 1

def calculate_dwadasamsa(longitude):
    """
    D12 - Dwadasamsa (Parents)
    Each sign divided into 12 parts of 2°30' each
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // 2.5)
    
    return ((sign + part) % 12) + 1

def calculate_shodasamsa(longitude):
    """
    D16 - Shodasamsa (Vehicles, Comforts)
    Each sign divided into 16 parts
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // (30/16))
    
    # Movable signs: start from Aries
    # Fixed signs: start from Leo
    # Dual signs: start from Sagittarius
    quality = sign % 3
    if quality == 0:
        start = 0  # Aries
    elif quality == 1:
        start = 4  # Leo
    else:
        start = 8  # Sagittarius
    
    return ((start + part) % 12) + 1

def calculate_vimsamsa(longitude):
    """
    D20 - Vimsamsa (Spiritual Progress)
    Each sign divided into 20 parts
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // (30/20))
    
    # Complex calculation based on sign type
    if sign in [0, 4, 8]:  # Fire signs
        start = 0  # Start from Aries
    elif sign in [1, 5, 9]:  # Earth signs
        start = 8  # Start from Sagittarius
    elif sign in [2, 6, 10]:  # Air signs
        start = 4  # Start from Leo
    else:  # Water signs
        start = 0  # Start from Aries
    
    return ((start + part) % 12) + 1

def calculate_chaturvimsamsa(longitude):
    """
    D24 - Chaturvimsamsa (Education, Learning)
    Each sign divided into 24 parts
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // (30/24))
    
    # Odd signs: start from Leo, Even signs: start from Cancer
    if (sign + 1) % 2 == 1:
        return ((4 + part) % 12) + 1  # Leo = 5
    else:
        return ((3 + part) % 12) + 1  # Cancer = 4

def calculate_trimsamsa(longitude):
    """
    D30 - Trimsamsa (Evils, Misfortunes)
    Special calculation - not equal division
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    
    # Degrees ruled by planets in odd/even signs
    if (sign + 1) % 2 == 1:  # Odd signs
        if deg_in_sign < 5:
            return 1  # Aries (Mars)
        elif deg_in_sign < 10:
            return 11  # Aquarius (Saturn)
        elif deg_in_sign < 18:
            return 9  # Sagittarius (Jupiter)
        elif deg_in_sign < 25:
            return 3  # Gemini (Mercury)
        else:
            return 7  # Libra (Venus)
    else:  # Even signs
        if deg_in_sign < 5:
            return 7  # Libra (Venus)
        elif deg_in_sign < 12:
            return 3  # Gemini (Mercury)
        elif deg_in_sign < 20:
            return 9  # Sagittarius (Jupiter)
        elif deg_in_sign < 25:
            return 11  # Aquarius (Saturn)
        else:
            return 1  # Aries (Mars)

def calculate_khavedamsa(longitude):
    """
    D40 - Khavedamsa (Auspicious/Inauspicious Effects)
    Each sign divided into 40 parts
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // (30/40))
    
    # Odd signs start from Aries, even from Libra
    if (sign + 1) % 2 == 1:
        return ((part) % 12) + 1
    else:
        return ((6 + part) % 12) + 1

def calculate_akshvedamsa(longitude):
    """
    D45 - Akshvedamsa (General Well-being)
    Each sign divided into 45 parts
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // (30/45))
    
    # Movable signs: Aries, Fixed: Leo, Dual: Sagittarius
    quality = sign % 3
    if quality == 0:
        start = 0
    elif quality == 1:
        start = 4
    else:
        start = 8
    
    return ((start + part) % 12) + 1

def calculate_shashtiamsa(longitude):
    """
    D60 - Shashtiamsa (General Effects - Most Important)
    Each sign divided into 60 parts of 0°30' each
    """
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // 0.5)
    
    # Each part has a specific deity and effect
    # Simplified calculation for sign placement
    return ((sign + part) % 12) + 1

def calculate_all_vargas(longitude):
    """Calculate all main divisional charts for a longitude."""
    return {
        'D1': int(longitude // 30) + 1,  # Rasi
        'D2': calculate_hora(longitude),
        'D3': calculate_drekkana(longitude),
        'D4': calculate_chaturthamsa(longitude),
        'D7': calculate_saptamsa(longitude),
        'D9': calculate_navamsa(longitude),
        'D10': calculate_dasamsa(longitude),
        'D12': calculate_dwadasamsa(longitude),
        'D16': calculate_shodasamsa(longitude),
        'D20': calculate_vimsamsa(longitude),
        'D24': calculate_chaturvimsamsa(longitude),
        'D30': calculate_trimsamsa(longitude),
        'D40': calculate_khavedamsa(longitude),
        'D45': calculate_akshvedamsa(longitude),
        'D60': calculate_shashtiamsa(longitude)
    }

def calculate_divisional_charts(planets):
    """Calculate divisional charts for all planets."""
    charts = {}
    
    # Initialize all charts
    for varga in ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 
                  'D16', 'D20', 'D24', 'D30', 'D40', 'D45', 'D60']:
        charts[varga] = {}
    
    # Calculate for each planet
    for planet in planets:
        vargas = calculate_all_vargas(planet['longitude'])
        for varga, sign in vargas.items():
            charts[varga][planet['name']] = sign
    
    return charts

def get_vargottama_planets(rasi_chart, navamsa_chart):
    """Find planets that are vargottama (same sign in D1 and D9)."""
    vargottama = []
    for planet, rasi_sign in rasi_chart.items():
        if navamsa_chart.get(planet) == rasi_sign:
            vargottama.append(planet)
    return vargottama
