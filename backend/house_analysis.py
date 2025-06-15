def analyze_houses(binfo, planets):
    """
    Determine which planets fall into which houses.
    Returns dict mapping house number to list of planet names.
    """
    cusps = binfo['cusps']
    analysis = {i: [] for i in range(1,13)}
    for p in planets:
        lon = p['longitude']
        # find house by comparing to cusps
        for i in range(1,13):
            start = cusps[i-1]
            end = cusps[i % 12]
            if start < end:
                if start <= lon < end:
                    analysis[i].append(p['name'])
                    break
            else:  # wrap-around
                if lon >= start or lon < end:
                    analysis[i].append(p['name'])
                    break
    return analysis