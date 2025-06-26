# backend/geo.py
from functools import lru_cache
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderServiceError

# initialize once
geolocator = Nominatim(user_agent="astro_app/1.0")

@lru_cache(maxsize=64)
def geocode_place(query: str, timeout: int = 10):
    """
    Geocode a place string with fallbacks:
      - raw query
      - query + ", India"
      - each comma-segment and that + ", India"
    Returns (lat, lon) or raises RuntimeError listing tried queries.
    """
    base = query.strip()
    candidates = [base, f"{base}, India"]
    for part in base.split(','):
        p = part.strip()
        if p:
            candidates.append(p)
            candidates.append(f"{p}, India")

    tried = []
    for q in candidates:
        tried.append(q)
        try:
            loc = geolocator.geocode(q, timeout=timeout)
        except GeocoderServiceError:
            continue
        if loc:
            return loc.latitude, loc.longitude

    raise RuntimeError(f"Place not found: '{query}'. Tried: {', '.join(tried)}")
