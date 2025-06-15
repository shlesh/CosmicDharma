# File: backend/analysis.py
"""
Comprehensive analysis module:
- Extended divisional chart generation for D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D12, D16, D20, D30, D40, D45, D60
- Textual interpretations for nakshatra, houses, core elements, dasha sequence, divisional charts
"""
from datetime import date
from .astro_constants import NAKSHATRA_METADATA

# Extended divisional charts (D1–D60)
DIVISIONAL_CHARTS = {f"D{n}": n for n in range(1, 61)}

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
# Build simple interpretations for each nakshatra using its trait keywords
NAKSHATRA_INTERP = {
    info["name"]: f"{', '.join(info.get('traits', []))} qualities." 
    for info in NAKSHATRA_METADATA
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
    'D1': 'Rashi chart shows overall life themes and the physical body.',
    'D2': 'Hora chart relates to wealth and possessions.',
    'D3': 'Drekkana focuses on siblings and courage.',
    'D4': 'Chaturthamsha indicates property and fortune.',
    'D5': 'Panchamsha reveals spiritual practices and learning.',
    'D6': 'Shashthamsa highlights health issues and obstacles.',
    'D7': 'Saptamsa reflects children and creativity.',
    'D8': 'Ashtamsa deals with longevity and transformation.',
    'D9': 'Navamsa reflects marriage, spirituality, and inner strength.',
    'D10': 'Dasamsa highlights career, vocation, and public life.',
    'D11': 'Rudramsa reveals power and challenges.',
    'D12': 'Dvadashamsa relates to parents and heritage.',
    'D13': 'Trayodashamsa gives insight into hidden talents.',
    'D14': 'Chaturdamsa outlines stability and comforts.',
    'D15': 'Panchadasamsa indicates prosperity and luxury.',
    'D16': 'Shodashamsa explores vehicles and happiness.',
    'D17': 'Saptadasamsa shows strength over adversity.',
    'D18': 'Ashtadasamsa deals with debts and misfortune.',
    'D19': 'Navadasamsa indicates morality and principles.',
    'D20': 'Vimsamsa highlights spiritual practice and devotion.',
    'D21': 'Ekavimsamsa focuses on leadership and authority.',
    'D22': 'Dvavimsamsa reflects battles and courage.',
    'D23': 'Trayovimsamsa points to skills and craftsmanship.',
    'D24': 'Chaturvimshamsa shows education and knowledge.',
    'D25': 'Panchavimsamsa concerns learning aptitude and wisdom.',
    'D26': 'Shadvimsamsa indicates personal strengths and flaws.',
    'D27': 'Bhamsha explores overall stamina and weaknesses.',
    'D28': 'Ashtavimsamsa reveals stability and assets.',
    'D29': 'Navavimsamsa deals with travel and movement.',
    'D30': 'Trimshamsa uncovers misfortunes and karmic debts.',
    'D31': 'Ekatrimshamsa deals with inner motives and drives.',
    'D32': 'Dvatrimshamsa indicates ancestral patterns.',
    'D33': 'Trayatrimshamsa reveals grace and blessings.',
    'D34': 'Chatustrimshamsa shows learning and communication.',
    'D35': 'Panchatrimshamsa relates to alliances and social circle.',
    'D36': 'Shattrimshamsa highlights financial growth.',
    'D37': 'Saptatrimshamsa deals with desire and ambitions.',
    'D38': 'Ashtatrimshamsa reveals obstacles and enemies.',
    'D39': 'Navatrimshamsa reflects good fortune and dharma.',
    'D40': 'Khavedamsa explores auspicious and inauspicious deeds.',
    'D41': 'Ekachattvarimsamsa deals with subtle strengths.',
    'D42': 'Dvadchattvarimsamsa reveals wealth from family.',
    'D43': 'Traychattvarimsamsa points to dharma and ethics.',
    'D44': 'Chaturchattvarimsamsa relates to comforts and luxuries.',
    'D45': 'Akshavedamsa highlights innate talent and spiritual power.',
    'D46': 'Shadchattvarimsamsa reveals obstacles to progress.',
    'D47': 'Saptchattvarimsamsa explores mysticism and secrets.',
    'D48': 'Ashtchattvarimsamsa covers achievements and recognition.',
    'D49': 'Navchattvarimsamsa deals with leadership potential.',
    'D50': 'Panchashamsa shows karmic influences on success.',
    'D51': 'Ekapanchashamsa deals with personal transformation.',
    'D52': 'Dvipanchashamsa focuses on alliances and partners.',
    'D53': 'Tripanchashamsa reveals resilience and recovery.',
    'D54': 'Chaturpanchashamsa relates to creativity and knowledge.',
    'D55': 'Panchapanchashamsa highlights prestige and fame.',
    'D56': 'Shatpanchashamsa indicates spiritual development.',
    'D57': 'Saptpanchashamsa shows perseverance and duty.',
    'D58': 'Ashtpanchashamsa covers obstacles in vocation.',
    'D59': 'Navpanchashamsa reveals karmic healing and insight.',
    'D60': 'Shashtiamsa details past-life karma and subtle nuances.'
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
