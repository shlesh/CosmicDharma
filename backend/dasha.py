from datetime import timedelta, datetime

def calculate_vimshottari_dasha(binfo):
    """
    Generate Vimshottari Dasha sequence starting at birth.
    Each dasha: lord, start, end (dates).
    """
    # Vimshottari durations in years
    dasha_years = {
        'Ketu':7,'Venus':20,'Sun':6,'Moon':10,'Mars':7,'Rahu':18,
        'Jupiter':16,'Saturn':19,'Mercury':17
    }
    # sequence order
    order = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury']
    # calculate fraction of first dasha elapsed at birth
    moon = next(p for p in binfo.get('planetaryPositions', []) if p['name']=='Moon')
    lon = moon['longitude']
    # find nakshatra position fraction
    frac = (lon % (360/27)) / (360/27)
    # first lord based on nakshatra index
    first_index = int(lon // (360/27))
    first_lord = order[first_index % len(order)]
    # adjust starting balance
    sequence = []
    start_date = datetime.fromtimestamp((binfo['jd_ut'] - 2440587.5)*86400)
    idx = order.index(first_lord)
    # compute remaining years of first dasha
    total = dasha_years[first_lord]
    remaining = total * (1 - frac)
    current_start = start_date
    # first dasha
    first_end = current_start + timedelta(days=remaining*365.25)
    sequence.append({'lord': first_lord, 'start': current_start.date(), 'end': first_end.date()})
    current_start = first_end
    # subsequent dashas (cycle once)
    for i in range(1, len(order)):
        lord = order[(idx + i) % len(order)]
        yrs = dasha_years[lord]
        end = current_start + timedelta(days=yrs*365.25)
        sequence.append({'lord': lord, 'start': current_start.date(), 'end': end.date()})
        current_start = end
    return sequence