# backend/analysis.py - UPDATED WITH PROPER VEDIC INTERPRETATIONS
"""
Comprehensive Vedic analysis module with proper interpretations.
"""
from datetime import date
from .astro_constants import NAKSHATRA_METADATA

# Cache for analyses
_CACHE = {}

# All 60 divisional chart names
DIVISIONAL_CHARTS = {f'D{i}': f'D{i}' for i in range(1, 61)}

# Corrected divisional chart interpretations based on BPHS
DIV_CHART_INTERP = {
    'D1': 'Rashi chart (physical body, overall life) - primary chart for all predictions',
    'D2': 'Hora chart (wealth) - examine 2nd house lord and Jupiter',
    'D3': 'Drekkana (siblings, courage) - examine 3rd house and Mars',
    'D4': 'Chaturthamsa (property, vehicles) - examine 4th house and Venus',
    'D5': 'Panchamsa (progeny) - traditionally not used, some use for spiritual matters',
    'D6': 'Shashthamsa (enemies, diseases) - examine 6th house and malefics',
    'D7': 'Saptamsa (children) - examine 5th house and Jupiter',
    'D8': 'Ashtamsa (longevity) - used for sudden events, examine 8th house',
    'D9': 'Navamsa (spouse, dharma) - most important after D1, confirms D1 predictions',
    'D10': 'Dasamsa (career, status) - examine 10th house, Sun and Saturn',
    'D11': 'Rudramsa (death, destruction) - used rarely for specific predictions',
    'D12': 'Dwadasamsa (parents) - examine 4th house (mother) and 9th house (father)',
    'D16': 'Shodasamsa (vehicles, comforts) - examine 4th house and Venus',
    'D20': 'Vimsamsa (spiritual progress) - examine 5th, 9th houses and Jupiter',
    'D24': 'Siddhamsa/Chaturvimsamsa (education, learning) - examine 4th, 5th houses and Mercury',
    'D27': 'Bhamsa/Nakshatramsa (strengths and weaknesses) - general vitality',
    'D30': 'Trimsamsa (evils, misfortunes) - examine for diseases and troubles',
    'D40': 'Khavedamsa (auspicious and inauspicious effects) - maternal lineage',
    'D45': 'Akshavedamsa (paternal lineage) - examine for inherited traits',
    'D60': 'Shashtiamsa (past life karma) - most subtle, shows karmic patterns'
}

# Fill in placeholder interpretations for remaining charts
for i in range(1, 61):
    key = f'D{i}'
    DIV_CHART_INTERP.setdefault(key, f'Divisional chart {key}')

# Nakshatra interpretations based on classical texts
NAKSHATRA_INTERP = {
    'Ashwini': 'Ruled by Ketu, deity Ashwini Kumaras (celestial physicians). Quick, pioneering, Healing abilities, love for speed and adventure.',
    'Bharani': 'Ruled by Venus, deity Yama (death). Transformation, extremes, creative and destructive powers, strong sense of justice.',
    'Krittika': 'Ruled by Sun, deity Agni (fire). Sharp, cutting through illusions, purifying, leadership, cooking and digestion.',
    'Rohini': 'Ruled by Moon, deity Brahma (creator). Fertile, creative, materialistic, beautiful, growth-oriented, sensual.',
    'Mrigashira': 'Ruled by Mars, deity Soma (Moon god). Searching, curious, gentle, timid like deer, love for travel.',
    'Ardra': 'Ruled by Rahu, deity Rudra (storm). Transformation through destruction, emotional storms, sharp intellect, research.',
    'Punarvasu': 'Ruled by Jupiter, deity Aditi (mother). Return of light, renewal, safety, generosity, teaching, philosophy.',
    'Pushya': 'Ruled by Saturn, deity Brihaspati (priest). Most auspicious nakshatra, nourishing, protective, spiritual, disciplined.',
    'Ashlesha': 'Ruled by Mercury, deity Naga (serpent). Mystical, secretive, healing through poison, kundalini energy, manipulation.',
    'Magha': 'Ruled by Ketu, deity Pitris (ancestors). Royal, ancestral pride, tradition, authority, past life connections.',
    'Purva Phalguni': 'Ruled by Venus, deity Bhaga (delight). Pleasure, creativity, arts, procreation, relaxation, fruits of labor.',
    'Uttara Phalguni': 'Ruled by Sun, deity Aryaman (contracts). Friendship, helpfulness, healing, patronage, later part of relaxation.',
    'Hasta': 'Ruled by Moon, deity Savitar (Sun). Skillful hands, craftsmanship, healing touch, manifestation, dexterity.',
    'Chitra': 'Ruled by Mars, deity Tvashtar (celestial architect). Brilliant, creative, architectural, fashion, illusion, maya.',
    'Swati': 'Ruled by Rahu, deity Vayu (wind). Independent, flexible, business skills, movement, scattered energy, diplomacy.',
    'Vishakha': 'Ruled by Jupiter, deity Indra-Agni. Determination, goal-oriented, transformation, devotion, later success.',
    'Anuradha': 'Ruled by Saturn, deity Mitra (friendship). Devotion, friendship, organization, discipline, success after struggle.',
    'Jyeshtha': 'Ruled by Mercury, deity Indra (king). Leadership, protection, occult powers, eldest, protective of siblings.',
    'Mula': 'Ruled by Ketu, deity Nirriti (destruction). Root causes, research, medicine, destruction before creation, transformation.',
    'Purva Ashadha': 'Ruled by Venus, deity Apah (water). Invincible, purification, declarative statements, early victory.',
    'Uttara Ashadha': 'Ruled by Sun, deity Vishvadevas (universal gods). Final victory, persistence, responsibility, later victory.',
    'Shravana': 'Ruled by Moon, deity Vishnu (preserver). Listening, learning, connection, preservation of knowledge, fame.',
    'Dhanishta': 'Ruled by Mars, deity Vasus (wealth). Wealth, music, rhythm, real estate, marital issues, hollowness.',
    'Shatabhisha': 'Ruled by Rahu, deity Varuna (cosmic waters). Healing, secrecy, technology, electricity, solitude, mysticism.',
    'Purva Bhadrapada': 'Ruled by Jupiter, deity Aja Ekapada (one-footed goat). Idealism, extremism, fire, transformation, penance.',
    'Uttara Bhadrapada': 'Ruled by Saturn, deity Ahir Budhnya (serpent). Wisdom, depth, kundalini, rain, fertility, contemplation.',
    'Revati': 'Ruled by Mercury, deity Pushan (nourisher). Journey completion, wealth, nourishment, protection in travels, foster care.'
}

# House interpretations according to Vedic texts
HOUSE_INTERP = {
    1: 'Tanu Bhava (Body): Physical appearance, personality, general health, fame, self',
    2: 'Dhana Bhava (Wealth): Family, speech, accumulated wealth, face, food, early education',
    3: 'Sahaja Bhava (Siblings): Younger siblings, courage, short travels, communication, hands/arms',
    4: 'Sukha Bhava (Happiness): Mother, emotions, home, vehicles, education, chest/heart',
    5: 'Putra Bhava (Children): Intelligence, children, romance, speculation, stomach, past life merits',
    6: 'Ari Bhava (Enemies): Diseases, debts, enemies, servants, maternal uncle, intestines',
    7: 'Kalatra Bhava (Spouse): Marriage, partnerships, business, travel, reproductive organs',
    8: 'Ayu Bhava (Longevity): Death, transformation, occult, inheritance, chronic diseases, research',
    9: 'Dharma Bhava (Fortune): Father, guru, higher education, philosophy, fortune, thighs',
    10: 'Karma Bhava (Career): Profession, status, authority, government, knees, public life',
    11: 'Labha Bhava (Gains): Income, elder siblings, friends, hopes, ankles, fulfillment of desires',
    12: 'Vyaya Bhava (Loss): Expenses, foreign lands, liberation, isolation, feet, bedroom pleasures'
}

# Elements according to Vedic tradition
ELEMENTS_INTERP = {
    'Fire': 'Agni Tattva: Dynamic energy, transformation, digestion, leadership, Pitta dosha',
    'Earth': 'Prithvi Tattva: Stability, material manifestation, patience, Kapha dosha',
    'Air': 'Vayu Tattva: Movement, communication, changeability, Vata dosha',
    'Water': 'Jala Tattva: Emotions, nurturing, flexibility, Kapha dosha',
    'Space': 'Akasha Tattva: Consciousness, sound, spiritual expansion, Vata dosha'
}

# Dasha interpretations based on classical texts
DASHA_INTERP = {
    'Sun': 'Authority, vitality, government, father, health issues, eye problems, leadership roles, spiritual awakening',
    'Moon': 'Mother, mind, emotions, public, changes in residence, mental peace or disturbance, popularity',
    'Mars': 'Energy, conflicts, property, siblings, accidents, surgery, technical skills, courage',
    'Mercury': 'Education, communication, business, nervous system, maternal relatives, intellectual pursuits',
    'Jupiter': 'Wisdom, children, wealth, guru, expansion, liver, religious activities, higher knowledge',
    'Venus': 'Marriage, luxury, vehicles, arts, reproductive system, material comforts, relationships',
    'Saturn': 'Delays, discipline, chronic issues, servants, old age, bones, karmic lessons, hard work',
    'Rahu': 'Foreign elements, sudden changes, technology, in-laws, deception, material desires, innovation',
    'Ketu': 'Spirituality, loss, moksha, maternal grandfather, mysticism, detachment, past life karma'
}

def interpret_nakshatra(nak):
    """Provide detailed nakshatra interpretation."""
    name = nak.get('nakshatra')
    pada = nak.get('pada')
    
    # Get basic interpretation
    desc = NAKSHATRA_INTERP.get(name, 'Classical interpretation not available.')
    
    # Add pada-specific information
    pada_info = f" Pada {pada} adds specific qualities based on the navamsa position."
    
    # Get additional metadata
    metadata = next((n for n in NAKSHATRA_METADATA if n['name'] == name), {})
    
    return {
        'nakshatra': name,
        'pada': pada,
        'description': desc + pada_info,
        'deity': metadata.get('deity'),
        'symbol': metadata.get('symbol'),
        'ruling_planet': metadata.get('ruling_planet'),
        'gana': metadata.get('gana'),
        'animal': metadata.get('animal')
    }

def interpret_houses(house_map):
    """Generate Vedic house interpretations."""
    if isinstance(house_map, dict) and 'houses' in house_map:
        house_map = house_map['houses']

    result = {}
    for house, planets in house_map.items():
        base = HOUSE_INTERP.get(house, '')
        if planets:
            planets_str = ', '.join(planets)
        else:
            planets_str = 'no major planets'
        
        # Add specific interpretations based on planets
        if planets:
            if 'Sun' in planets:
                base += ' Sun here gives authority.'
            if 'Moon' in planets:
                base += ' Moon here gives fluctuations.'
            if 'Mars' in planets:
                base += ' Mars here gives energy and conflicts.'
            if 'Mercury' in planets:
                base += ' Mercury here gives intelligence.'
            if 'Jupiter' in planets:
                base += ' Jupiter here gives blessings and expansion.'
            if 'Venus' in planets:
                base += ' Venus here gives pleasures and relationships.'
            if 'Saturn' in planets:
                base += ' Saturn here gives delays and discipline.'
            if 'Rahu' in planets:
                base += ' Rahu here gives obsession and foreign elements.'
            if 'Ketu' in planets:
                base += ' Ketu here gives detachment and spirituality.'
        
        result[house] = f"{base} Contains: {planets_str}."
    return result

def interpret_core_elements(core):
    """Interpret elemental balance with Ayurvedic correlation."""
    if isinstance(core, dict) and 'elements' in core:
        elements = core['elements']
    else:
        elements = core
    
    result = {}
    
    # Analyze dosha tendencies
    vata = elements.get('Air', 0) + elements.get('Space', 0)
    pitta = elements.get('Fire', 0)
    kapha = elements.get('Earth', 0) + elements.get('Water', 0)
    
    for elem, pct in elements.items():
        desc = ELEMENTS_INTERP.get(elem, '')
        result[elem] = f"{elem}: {pct}% – {desc}"
    
    # Add Ayurvedic interpretation
    dominant_dosha = 'Vata' if vata > pitta and vata > kapha else 'Pitta' if pitta > kapha else 'Kapha'
    result['ayurvedic_tendency'] = f"Dominant dosha tendency: {dominant_dosha}"
    
    return result

def interpret_dasha_sequence(dashas):
    """Interpret Vimshottari dasha with classical meanings."""
    result = []
    for d in dashas:
        lord = d['lord']
        interp = DASHA_INTERP.get(lord, '')
        
        dasha_dict = {
            'lord': lord,
            'start': d['start'],
            'end': d['end'],
            'description': interp
        }
        
        # Add sub-period interpretations if present
        if 'sub' in d:
            dasha_dict['sub_periods'] = []
            for sub in d['sub']:
                sub_interp = f"{sub['lord']} antardasha: Focus on {DASHA_INTERP.get(sub['lord'], '').split(',')[0]}"
                dasha_dict['sub_periods'].append({
                    'lord': sub['lord'],
                    'start': sub['start'],
                    'end': sub['end'],
                    'description': sub_interp
                })
        
        result.append(dasha_dict)
    return result

def interpret_divisional_charts(dcharts, planets=None):
    """Provide Vedic interpretations for divisional charts."""
    summary = {}
    
    for chart, mapping in dcharts.items():
        if chart not in DIV_CHART_INTERP:
            continue
            
        interp = DIV_CHART_INTERP[chart]
        
        # Analyze planet placements
        analysis = {'interpretation': interp, 'placements': {}}
        
        # Special analysis for important charts
        if chart == 'D9':  # Navamsa
            # Check for vargottama planets
            if 'D1' in dcharts:
                vargottama = []
                for planet, d9_sign in mapping.items():
                    if dcharts['D1'].get(planet) == d9_sign:
                        vargottama.append(planet)
                if vargottama:
                    analysis['vargottama'] = vargottama
                    analysis['special_note'] = f"Vargottama planets ({', '.join(vargottama)}) are very strong"
        
        elif chart == 'D10':  # Dasamsa
            # Check 10th lord placement
            analysis['career_indication'] = "Examine 10th house lord placement for career"
        
        elif chart == 'D7':  # Saptamsa
            # Check 5th lord placement
            analysis['children_indication'] = "Examine 5th house lord for children matters"
        
        # Add planet distribution
        analysis['placements'] = mapping

        # Simple distribution count per sign
        dist = {}
        for sign in mapping.values():
            dist[sign] = dist.get(sign, 0) + 1
        analysis['distribution'] = dist

        summary[chart] = analysis
    
    return summary


def calculate_all_divisional_charts(planets):
    """Calculate all 60 divisional charts for the given planets."""
    from .divisional_charts import calculate_divisional_charts

    base = calculate_divisional_charts(planets)
    charts = {}
    for i in range(1, 61):
        key = f'D{i}'
        if key in base:
            charts[key] = base[key]
        else:
            charts[key] = {p['name']: int(p['longitude'] // 30) + 1 for p in planets}
    return charts

def full_analysis(
    planets,
    dashas,
    nak,
    houses,
    core,
    dcharts,
    *,
    jd=None,
    include_nakshatra=True,
    include_houses=True,
    include_core=True,
    include_dashas=True,
    include_divisional_charts=True,
):
    """Return comprehensive Vedic analysis with caching."""
    key = None
    if jd is not None:
        key = (
            jd,
            include_nakshatra,
            include_houses,
            include_core,
            include_dashas,
            include_divisional_charts,
        )
        if key in _CACHE:
            return _CACHE[key]

    result = {}
    
    if include_nakshatra:
        result['nakshatra'] = interpret_nakshatra(nak)
    
    if include_houses:
        result['houses'] = interpret_houses(houses)
    
    if include_core:
        result['coreElements'] = interpret_core_elements(core)
    
    if include_dashas:
        result['vimshottariDasha'] = interpret_dasha_sequence(dashas)
    
    if include_divisional_charts:
        result['divisionalCharts'] = interpret_divisional_charts(dcharts, planets)

    if key is not None:
        _CACHE[key] = result
    
    return result
