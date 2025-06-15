import os
import time
import logging

from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder

try:
    import googlemaps
    GMAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
    gmaps = googlemaps.Client(key=GMAPS_API_KEY) if GMAPS_API_KEY else None
except ImportError:  # pragma: no cover - googlemaps optional
    gmaps = None

logger = logging.getLogger(__name__)
_geopy = Nominatim(user_agent="vedic-astrology-geocoder")
_tzfinder = TimezoneFinder()


def _geocode_once(query: str):
    """Return (lat, lon, tz) for a single geocode query."""
    lat = lon = tz = None

    if gmaps:
        try:
            results = gmaps.geocode(query)
            if results:
                loc = results[0]["geometry"]["location"]
                lat, lon = loc.get("lat"), loc.get("lng")
                tz_info = gmaps.timezone({"location": (lat, lon),
                                          "timestamp": int(time.time())})
                tz = tz_info.get("timeZoneId")
        except Exception as ex:  # pragma: no cover - network
            logger.warning("Google geocode failed: %s", ex)

    if lat is None or lon is None:
        try:
            geo = _geopy.geocode(query, exactly_one=True)
            if geo:
                lat, lon = geo.latitude, geo.longitude
        except Exception as ex:  # pragma: no cover - network
            logger.warning("Geopy geocode failed: %s", ex)

    return lat, lon, tz


def geocode_location(query: str):
    """Return (lat, lon, timezone) for a place string."""
    tokens = [t.strip() for t in query.split(',')]
    candidates = [', '.join(tokens[:i]) for i in range(len(tokens), 0, -1)]
    if len(tokens) > 1:
        candidates.extend(', '.join(tokens[i:]) for i in range(1, len(tokens)))

    lat = lon = tz = None
    for cand in candidates:
        lat, lon, tz = _geocode_once(cand)
        if lat is not None and lon is not None:
            break

    if lat is None or lon is None:
        raise ValueError(f"Could not resolve location '{query}'")

    if not tz:
        tz = _tzfinder.timezone_at(lat=lat, lng=lon) or 'UTC'
    return lat, lon, tz
