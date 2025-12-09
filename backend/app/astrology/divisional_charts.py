# backend/divisional_charts.py - PROPER VEDIC CALCULATIONS
"""
Divisional chart calculations according to Brihat Parashara Hora Shastra (BPHS)
Each divisional chart has specific calculation rules, not simple division.
"""

def calculate_generic_division(longitude, divisions):
    """Return the sign placement when a sign is divided equally."""
    sign = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // (30 / divisions))
    return ((sign + part) % 12) + 1

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

def calculate_panchamsa(longitude):
    """D5 - Panchamsa"""
    return calculate_generic_division(longitude, 5)

def calculate_shashthamsa(longitude):
    """D6 - Shashthamsa"""
    return calculate_generic_division(longitude, 6)

def calculate_ashtamsa(longitude):
    """D8 - Ashtamsa"""
    return calculate_generic_division(longitude, 8)

def calculate_rudramsa(longitude):
    """D11 - Rudramsa"""
    return calculate_generic_division(longitude, 11)

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

def calculate_trayodashamsa(longitude):
    """D13 - Trayodashamsa"""
    return calculate_generic_division(longitude, 13)

def calculate_chaturdamsa(longitude):
    """D14 - Chaturdamsa"""
    return calculate_generic_division(longitude, 14)

def calculate_panchadasamsa(longitude):
    """D15 - Panchadasamsa"""
    return calculate_generic_division(longitude, 15)

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

def calculate_saptadasamsa(longitude):
    """D17 - Saptadasamsa"""
    return calculate_generic_division(longitude, 17)

def calculate_ashtadasamsa(longitude):
    """D18 - Ashtadasamsa"""
    return calculate_generic_division(longitude, 18)

def calculate_navadasamsa(longitude):
    """D19 - Navadasamsa"""
    return calculate_generic_division(longitude, 19)

def calculate_ekavimsamsa(longitude):
    """D21 - Ekavimsamsa"""
    return calculate_generic_division(longitude, 21)

def calculate_bhavamsa(longitude):
    """D22 - Bhamsa"""
    return calculate_generic_division(longitude, 22)

def calculate_trayovimsamsa(longitude):
    """D23 - Trayovimsamsa"""
    return calculate_generic_division(longitude, 23)

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

def calculate_nakshatramsa(longitude):
    """D27 - Bhamsa/Nakshatramsa"""
    return calculate_generic_division(longitude, 27)

def calculate_quintamsa(longitude):
    """D25 - Panchvimsamsa"""
    return calculate_generic_division(longitude, 25)

def calculate_shadvimsamsa(longitude):
    """D26 - Shadvimsamsa"""
    return calculate_generic_division(longitude, 26)

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

def calculate_ashtakavimsamsa(longitude):
    """D28 - Ashtakavimsamsa"""
    return calculate_generic_division(longitude, 28)

def calculate_ekonatrimsamsa(longitude):
    """D29 - Ekonatrimsamsa"""
    return calculate_generic_division(longitude, 29)

def calculate_trimshatsamsa(longitude):
    """D31 - Trimshatsamsa"""
    return calculate_generic_division(longitude, 31)

def calculate_dwatrimsamsa(longitude):
    """D32 - Dwatrimsamsa"""
    return calculate_generic_division(longitude, 32)

def calculate_tritrimsamsa(longitude):
    """D33 - Tritrimsamsa"""
    return calculate_generic_division(longitude, 33)

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

def calculate_chatvarimsamsa(longitude):
    """D34 - Chatvarimsamsa"""
    return calculate_generic_division(longitude, 34)

def calculate_panchatvimsamsa(longitude):
    """D35 - Panchatvimsamsa"""
    return calculate_generic_division(longitude, 35)

def calculate_shadtrimsamsa(longitude):
    """D36 - Shadtrimsamsa"""
    return calculate_generic_division(longitude, 36)

def calculate_saptatrimsamsa(longitude):
    """D37 - Saptatrimsamsa"""
    return calculate_generic_division(longitude, 37)

def calculate_ashtatrimsamsa(longitude):
    """D38 - Ashtatrimsamsa"""
    return calculate_generic_division(longitude, 38)

def calculate_navatrimsamsa(longitude):
    """D39 - Navatrimsamsa"""
    return calculate_generic_division(longitude, 39)

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

def calculate_eka_Chatvarimsamsa(longitude):
    """D41 - Ekacatvarimsamsa"""
    return calculate_generic_division(longitude, 41)

def calculate_dvi_chatvarimsamsa(longitude):
    """D42 - Dvichatvarimsamsa"""
    return calculate_generic_division(longitude, 42)

def calculate_tri_chatvarimsamsa(longitude):
    """D43 - Trichatvarimsamsa"""
    return calculate_generic_division(longitude, 43)

def calculate_chatu_chatvarimsamsa(longitude):
    """D44 - Chaturchatvarimsamsa"""
    return calculate_generic_division(longitude, 44)

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

def calculate_chatvimsamsa(longitude):
    """D46 - Chatvimsamsa"""
    return calculate_generic_division(longitude, 46)

def calculate_saptchatvarimsamsa(longitude):
    """D47 - Saptchatvarimsamsa"""
    return calculate_generic_division(longitude, 47)

def calculate_ashtchatvarimsamsa(longitude):
    """D48 - Ashtchatvarimsamsa"""
    return calculate_generic_division(longitude, 48)

def calculate_navchatvarimsamsa(longitude):
    """D49 - Navchatvarimsamsa"""
    return calculate_generic_division(longitude, 49)

def calculate_panchasaptamsa(longitude):
    """D50 - Panchasaptamsa"""
    return calculate_generic_division(longitude, 50)

def calculate_ekonnapanchasamsa(longitude):
    """D51 - Ekonnapanchasamsa"""
    return calculate_generic_division(longitude, 51)

def calculate_dvi_panchasamsa(longitude):
    """D52 - Dvi panchasamsa"""
    return calculate_generic_division(longitude, 52)

def calculate_tri_panchasamsa(longitude):
    """D53 - Tri panchasamsa"""
    return calculate_generic_division(longitude, 53)

def calculate_chatu_panchasamsa(longitude):
    """D54 - Chatu panchasamsa"""
    return calculate_generic_division(longitude, 54)

def calculate_panch_panchasamsa(longitude):
    """D55 - Panch panchasamsa"""
    return calculate_generic_division(longitude, 55)

def calculate_shad_panchasamsa(longitude):
    """D56 - Shad panchasamsa"""
    return calculate_generic_division(longitude, 56)

def calculate_sapt_panchasamsa(longitude):
    """D57 - Sapt panchasamsa"""
    return calculate_generic_division(longitude, 57)

def calculate_asht_panchasamsa(longitude):
    """D58 - Asht panchasamsa"""
    return calculate_generic_division(longitude, 58)

def calculate_nav_panchasamsa(longitude):
    """D59 - Nav panchasamsa"""
    return calculate_generic_division(longitude, 59)

def calculate_all_vargas(longitude):
    """Return all divisional chart placements from D1 through D60."""

    special = {
        1: lambda lon: int(lon // 30) + 1,
        2: calculate_hora,
        3: calculate_drekkana,
        4: calculate_chaturthamsa,
        5: calculate_panchamsa,
        6: calculate_shashthamsa,
        7: calculate_saptamsa,
        8: calculate_ashtamsa,
        9: calculate_navamsa,
        10: calculate_dasamsa,
        11: calculate_rudramsa,
        12: calculate_dwadasamsa,
        13: calculate_trayodashamsa,
        14: calculate_chaturdamsa,
        15: calculate_panchadasamsa,
        16: calculate_shodasamsa,
        17: calculate_saptadasamsa,
        18: calculate_ashtadasamsa,
        19: calculate_navadasamsa,
        20: calculate_vimsamsa,
        21: calculate_ekavimsamsa,
        22: calculate_bhavamsa,
        23: calculate_trayovimsamsa,
        24: calculate_chaturvimsamsa,
        25: calculate_quintamsa,
        26: calculate_shadvimsamsa,
        27: calculate_nakshatramsa,
        28: calculate_ashtakavimsamsa,
        29: calculate_ekonatrimsamsa,
        30: calculate_trimsamsa,
        31: calculate_trimshatsamsa,
        32: calculate_dwatrimsamsa,
        33: calculate_tritrimsamsa,
        34: calculate_chatvarimsamsa,
        35: calculate_panchatvimsamsa,
        36: calculate_shadtrimsamsa,
        37: calculate_saptatrimsamsa,
        38: calculate_ashtatrimsamsa,
        39: calculate_navatrimsamsa,
        40: calculate_khavedamsa,
        41: calculate_eka_Chatvarimsamsa,
        42: calculate_dvi_chatvarimsamsa,
        43: calculate_tri_chatvarimsamsa,
        44: calculate_chatu_chatvarimsamsa,
        45: calculate_akshvedamsa,
        46: calculate_chatvimsamsa,
        47: calculate_saptchatvarimsamsa,
        48: calculate_ashtchatvarimsamsa,
        49: calculate_navchatvarimsamsa,
        50: calculate_panchasaptamsa,
        51: calculate_ekonnapanchasamsa,
        52: calculate_dvi_panchasamsa,
        53: calculate_tri_panchasamsa,
        54: calculate_chatu_panchasamsa,
        55: calculate_panch_panchasamsa,
        56: calculate_shad_panchasamsa,
        57: calculate_sapt_panchasamsa,
        58: calculate_asht_panchasamsa,
        59: calculate_nav_panchasamsa,
        60: calculate_shashtiamsa,
    }

    results = {}
    for i in range(1, 61):
        func = special.get(i, lambda lon, d=i: calculate_generic_division(lon, d))
        results[f'D{i}'] = func(longitude)
    return results

def calculate_divisional_charts(planets):
    """Calculate divisional charts D1 through D60 for all planets."""
    charts = {f'D{i}': {} for i in range(1, 61)}
    
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
