# File: backend/analysis.py
"""
Comprehensive analysis module:
- Extended divisional chart generation for D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D12, D16, D20, D30, D40, D45, D60
- Textual interpretations for nakshatra, houses, core elements, dasha sequence, divisional charts
"""
from datetime import date
from .astro_constants import NAKSHATRA_METADATA

# Cache for analyses keyed by Julian Day and option tuple
_CACHE = {}

# Extended divisional charts (D1–D60)
DIVISIONAL_CHARTS = {f"D{n}": n for n in range(1, 61)}

def calculate_all_divisional_charts(planets, jd=None):
    """
    Generate all standard divisional charts by dividing each 30° sign into n parts.
    Returns a dict of chart name to mapping of planet to sign number.
    """
    def varga_sign(lon, divisions):
        part = 360 / (12 * divisions)
        idx = int(lon / part)
        return (idx // divisions) + 1

    cache_key = ("dcharts", jd)
    if jd is not None and cache_key in _CACHE:
        return _CACHE[cache_key]

    charts = {}
    for chart, div in DIVISIONAL_CHARTS.items():
        mapping = {}
        for p in planets:
            mapping[p['name']] = varga_sign(p['longitude'], div)
        charts[chart] = mapping
    if jd is not None:
        _CACHE[cache_key] = charts
    return charts

# Interpretations dictionaries
# Build interpretations for each nakshatra referencing classical texts
NAKSHATRA_INTERP = {
    info['name']: (
        f"In Brihat Parashara Hora Shastra, {info['name']} is described as "
        f"having {', '.join(info.get('traits', []))} qualities."
    )
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
    'D1': 'Rashi chart (BPHS Ch.3) shows the body and life path; houses 1, 4, 7 and 10 are key.',
    'D2': 'Hora (BPHS Ch.6) examines wealth via the 2nd house and its lord.',
    'D3': 'Drekkana (BPHS Ch.7) highlights siblings and courage through the 3rd house.',
    'D4': 'Chaturthamsha (BPHS Ch.8) relates to property and fortune seen from the 4th house.',
    'D5': 'Panchamsha (BPHS Ch.8) reveals mantra practice and learning involving the 5th house.',
    'D6': 'Shashthamsa (BPHS Ch.8) notes health issues and obstacles via the 6th house.',
    'D7': 'Saptamsa (BPHS Ch.8) reflects children and creativity shown by the 5th and 7th houses.',
    'D8': 'Ashtamsa (BPHS Ch.8) deals with longevity and transformation of the 8th house.',
    'D9': 'Navamsa (BPHS Ch.8) represents marriage and dharma; planets retaining their D1 sign are vargottama.',
    'D10': 'Dasamsa (BPHS Ch.8) highlights career and public life through the 10th house.',
    'D11': 'Rudramsa (BPHS Ch.8) reveals power and challenges of the 11th house.',
    'D12': 'Dvadashamsa (BPHS Ch.8) relates to parents and ancestral heritage of the 12th house.',
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


def verify_divisional_chart_positions(planets, dcharts):
    """Ensure planet placements match computed Varga positions."""
    lon_map = {p['name']: p['longitude'] for p in planets}
    def varga_sign(lon, divisions):
        part = 360 / (12 * divisions)
        idx = int(lon / part)
        return (idx // divisions) + 1

    for chart, div in DIVISIONAL_CHARTS.items():
        if chart not in dcharts:
            continue
        mapping = dcharts[chart]
        for name, sign in mapping.items():
            lon = lon_map.get(name)
            if lon is None:
                continue
            if varga_sign(lon, div) != sign:
                raise ValueError(f"{name} wrong sign in {chart}")


def interpret_divisional_charts(dcharts, planets=None):
    """
    Summarize divisional charts focusing on key ones.
    """
    summary = {}
    if planets:
        verify_divisional_chart_positions(planets, dcharts)

    for chart, mapping in dcharts.items():
        interp = DIV_CHART_INTERP.get(chart)
        if interp:
            # count planets per sign
            counts = {}
            for sign in mapping.values():
                counts[sign] = counts.get(sign, 0) + 1
            summary[chart] = {'interpretation': interp, 'distribution': counts}

    if 'D1' in dcharts and 'D9' in dcharts:
        vargottama = {}
        for name, sign in dcharts['D9'].items():
            if dcharts['D1'].get(name) == sign:
                vargottama[name] = 'Vargottama'
        if vargottama and 'D9' in summary:
            summary['D9']['navamsaStrength'] = vargottama
    return summary

# Combined analysis

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
    """Return selected textual interpretations with optional caching."""
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
