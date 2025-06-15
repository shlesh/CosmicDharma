from datetime import datetime, timedelta


def calculate_vimshottari_dasha(binfo, planets):
    """Return full Vimshottari dasha sequence starting at birth."""
    dasha_years = {
        'Ketu': 7,
        'Venus': 20,
        'Sun': 6,
        'Moon': 10,
        'Mars': 7,
        'Rahu': 18,
        'Jupiter': 16,
        'Saturn': 19,
        'Mercury': 17,
    }
    order = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']

    moon = next(p for p in planets if p['name'] == 'Moon')
    lon = moon['longitude']
    frac = (lon % (360 / 27)) / (360 / 27)
    start_index = int(lon // (360 / 27)) % len(order)

    start_date = datetime.fromtimestamp((binfo['jd_ut'] - 2440587.5) * 86400)
    sequence = []
    current_start = start_date
    for i in range(len(order)):
        lord = order[(start_index + i) % len(order)]
        years = dasha_years[lord]
        duration_days = years * 365.25
        if i == 0:
            duration_days *= (1 - frac)
        end = current_start + timedelta(days=duration_days)
        sequence.append({
            'lord': lord,
            'start': current_start.date(),
            'end': end.date(),
        })
        current_start = end
    return sequence
