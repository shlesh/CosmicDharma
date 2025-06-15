from math import floor

def get_nakshatra(binfo):
    """
    Determine Nakshatra and pada from Moon longitude.
    """
    moon = next(p for p in binfo.get('planetaryPositions', []) if p['name']=='Moon')
    lon = moon['longitude']
    nak_index = int(lon / (360/27))
    pada = int((lon % (360/27)) / ((360/27)/4)) + 1
    nak_names = [
        'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha','Ardra','Punarvasu','Pushya',
        'Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha',
        'Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha',
        'Purva Bhadrapada','Uttara Bhadrapada','Revati'
    ]
    return {
        'nakshatra': nak_names[nak_index],
        'pada': pada,
    }
