# File: backend/analysis.py
"""
Comprehensive analysis module:
- Extended divisional chart generation for D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D12, D16, D20, D30, D40, D45, D60
- Textual interpretations for nakshatra, houses, core elements, dasha sequence, divisional charts
"""
from datetime import date

# Extended divisional charts
DIVISIONAL_CHARTS = {
    'D1': 1, 'D2': 2, 'D3': 3, 'D4': 4, 'D5': 5, 'D6': 6,
    'D7': 7, 'D8': 8, 'D9': 9, 'D10': 10, 'D12': 12, 'D16': 16,
    'D20': 20, 'D30': 30, 'D40': 40, 'D45': 45, 'D60': 60
}

def calculate_all_divisional_charts(planets):
    """
    Generate all standard divisional charts by dividing each 30° sign into n parts.
    Returns a dict of chart name to mapping of planet to sign number.
    """
    def varga_sign(lon, divisions):
        part = 360 / (12 * divisions)
        idx = int(lon / part)
        return (idx // divisions) + 1

    charts = {}
    for chart, div in DIVISIONAL_CHARTS.items():
        mapping = {}
        for p in planets:
            mapping[p['name']] = varga_sign(p['longitude'], div)
        charts[chart] = mapping
    return charts

# Interpretations dictionaries
NAKSHATRA_INTERP = {
    'Ashwini': 'Courageous, energetic, pioneering spirit.',
    'Bharani': 'Transformative, intense, enduring hardships.',
    # Add entries for all 27 nakshatras...
}

HOUSE_INTERP = {
    1: 'Self, appearance, first impressions.',
    2: 'Finances, values, possessions.',
    3: 'Communication, siblings, short journeys.',
    4: 'Home, family, mother.',
    5: 'Creativity, children, romance.',
    6: 'Work, health, daily routines.',
    7: 'Partnerships, marriage, open enemies.',
    8: 'Transformation, shared resources, occult.',
    9: 'Philosophy, higher education, long journeys.',
    10: 'Career, public status, reputation.',
    11: 'Friendships, gains, aspirations.',
    12: 'Spirituality, solitude, hidden enemies.'
}

ELEMENTS_INTERP = {
    'Fire': 'Enthusiasm, drive, leadership qualities.',
    'Earth': 'Stability, practicality, material focus.',
    'Air': 'Intellect, communication, social skill.',
    'Water': 'Emotion, intuition, empathy.',
    'Space': 'Spirituality, expansion, higher consciousness.'
}

DASHA_INTERP = {
    'Sun': 'Focus on self-expression, authority, vitality.',
    'Moon': 'Emotional sensitivity, nurturing, introspection.',
    'Mars': 'Action, courage, conflict, drive.',
    'Mercury': 'Communication, learning, adaptability.',
    'Jupiter': 'Growth, wisdom, optimism, abundance.',
    'Venus': 'Relationships, beauty, harmony, comfort.',
    'Saturn': 'Discipline, restriction, karma, perseverance.',
    'Rahu': 'Innovation, obsession, transformation.',
    'Ketu': 'Detachment, spirituality, liberation.'
}

DIV_CHART_INTERP = {
    'D9': 'Navamsa reflects marriage, spirituality, and inner strength.',
    'D10': 'Dasamsa highlights career, vocation, and public life.',
    # Add for other divisional charts if desired...
}

# Interpretation functions
def interpret_nakshatra(nak):
    name = nak.get('nakshatra')
    pada = nak.get('pada')
    desc = NAKSHATRA_INTERP.get(name, 'No interpretation available.')
    return {'nakshatra': name, 'pada': pada, 'description': desc}


def interpret_houses(house_map):
    """
    Generate interpretations for each house based on which planets occupy it.
    """
    result = {}
    for house, planets in house_map.items():
        base = HOUSE_INTERP.get(house, '')
        planets_str = ', '.join(planets) if planets else 'no major planets'
        result[house] = f"House {house} ({base}): Contains {planets_str}."
    return result


def interpret_core_elements(core):
    """
    Interpret elemental balance percentages.
    """
    result = {}
    for elem, pct in core.items():
        desc = ELEMENTS_INTERP.get(elem, '')
        result[elem] = f"{elem}: {pct}% – {desc}"
    return result


def interpret_dasha_sequence(dashas):
    """
    Interpret each dasha period.
    """
    result = []
    for d in dashas:
        lord = d['lord']
        interp = DASHA_INTERP.get(lord, '')
        result.append({
            'lord': lord,
            'start': d['start'],
            'end': d['end'],
            'description': interp
        })
    return result


def interpret_divisional_charts(dcharts):
    """
    Summarize divisional charts focusing on key ones.
    """
    summary = {}
    for chart, mapping in dcharts.items():
        interp = DIV_CHART_INTERP.get(chart)
        if interp:
            # count planets per sign
            counts = {}
            for sign in mapping.values():
                counts[sign] = counts.get(sign, 0) + 1
            summary[chart] = {'interpretation': interp, 'distribution': counts}
    return summary

# Combined analysis

def full_analysis(planets, dashas, nak, houses, core, dcharts):
    """
    Returns a dict of all textual interpretations.
    """
    return {
        'nakshatra': interpret_nakshatra(nak),
        'houses': interpret_houses(houses),
        'coreElements': interpret_core_elements(core),
        'vimshottariDasha': interpret_dasha_sequence(dashas),
        'divisionalCharts': interpret_divisional_charts(dcharts)
    }
