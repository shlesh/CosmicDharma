import os
import time
import logging
import asyncio
import threading
from functools import lru_cache

from geopy.geocoders import Nominatim
import httpx

try:
    import googlemaps
    GMAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
    gmaps = googlemaps.Client(key=GMAPS_API_KEY) if GMAPS_API_KEY else None
except ImportError:  # pragma: no cover - googlemaps optional
    gmaps = None

logger = logging.getLogger(__name__)

# OpenStreetMap's Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/):
# identify the application in the User-Agent and send at most 1 request per second, or the server
# gets blocked. Put contact details (a URL or e-mail) in NOMINATIM_USER_AGENT in production.
NOMINATIM_USER_AGENT = os.getenv("NOMINATIM_USER_AGENT", "CosmicDharma/2.1")
NOMINATIM_MIN_INTERVAL = 1.0  # seconds between requests; tests set this to 0
_geopy = Nominatim(user_agent=NOMINATIM_USER_AGENT, timeout=10)
_nominatim_lock = threading.Lock()
_nominatim_last = 0.0


def _nominatim_throttle():
    """Block until at least NOMINATIM_MIN_INTERVAL has passed since the previous request."""
    global _nominatim_last
    with _nominatim_lock:
        wait = _nominatim_last + NOMINATIM_MIN_INTERVAL - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        _nominatim_last = time.monotonic()


def timezone_at(lat: float, lon: float) -> str:
    """IANA timezone name for a coordinate, offline.

    Uses tzfpy (one small wheel) rather than timezonefinder (h3 + numpy + cffi).
    Note tzfpy takes (lon, lat). The import is lazy so that a missing or
    OS-blocked native binary breaks only this lookup, not app startup.
    """
    from tzfpy import get_tz
    return get_tz(lon, lat) or "UTC"


def _geocode_once(query: str, locale: str | None = None):
    """Return (lat, lon, tz) for a single geocode query."""
    lat = lon = tz = None

    if gmaps:
        try:
            if locale:
                results = gmaps.geocode(query, language=locale)
            else:
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
            _nominatim_throttle()
            if locale:
                geo = _geopy.geocode(query, exactly_one=True, language=locale)
            else:
                geo = _geopy.geocode(query, exactly_one=True)
            if geo:
                lat, lon = geo.latitude, geo.longitude
        except Exception as ex:  # pragma: no cover - network
            logger.warning("Geopy geocode failed: %s", ex)

    return lat, lon, tz


async def _async_geocode_once(query: str, locale: str | None = None):
    """Async geocode using httpx when Google Maps is unavailable."""
    lat = lon = tz = None

    if gmaps:
        def sync_call():
            try:
                if locale:
                    results = gmaps.geocode(query, language=locale)
                else:
                    results = gmaps.geocode(query)
                if results:
                    loc = results[0]["geometry"]["location"]
                    lt, ln = loc.get("lat"), loc.get("lng")
                    tz_info = gmaps.timezone({"location": (lt, ln),
                                              "timestamp": int(time.time())})
                    return lt, ln, tz_info.get("timeZoneId")
            except Exception as ex:  # pragma: no cover - network
                logger.warning("Google geocode failed: %s", ex)
            return None, None, None

        lat, lon, tz = await asyncio.get_running_loop().run_in_executor(None, sync_call)
    else:
        params = {"q": query, "format": "json", "limit": 1}
        if locale:
            params["accept-language"] = locale
        try:
            async with httpx.AsyncClient(headers={"User-Agent": NOMINATIM_USER_AGENT}, timeout=10) as client:
                resp = await client.get("https://nominatim.openstreetmap.org/search", params=params)
                resp.raise_for_status()
                data = resp.json()
                if data:
                    lat = float(data[0]["lat"])
                    lon = float(data[0]["lon"])
        except Exception as ex:  # pragma: no cover - network
            logger.warning("Async geocode failed: %s", ex)

    return lat, lon, tz


@lru_cache(maxsize=128)
def geocode_location(query: str, locale: str | None = None):
    """Return (lat, lon, timezone) for a place string."""
    tokens = [t.strip() for t in query.split(',')]
    candidates = [', '.join(tokens[:i]) for i in range(len(tokens), 0, -1)]
    if len(tokens) > 1:
        candidates.extend(', '.join(tokens[i:]) for i in range(1, len(tokens)))

    lat = lon = tz = None
    for cand in candidates:
        lat, lon, tz = _geocode_once(cand, locale=locale)
        if lat is not None and lon is not None:
            break

    if lat is None or lon is None:
        raise ValueError(f"Could not resolve location '{query}'")

    if not tz:
        tz = timezone_at(lat, lon)
    return lat, lon, tz


async def geocode_location_async(query: str, locale: str | None = None):
    """Async version of geocode_location using httpx when gmaps is unavailable."""
    tokens = [t.strip() for t in query.split(',')]
    candidates = [', '.join(tokens[:i]) for i in range(len(tokens), 0, -1)]
    if len(tokens) > 1:
        candidates.extend(', '.join(tokens[i:]) for i in range(1, len(tokens)))

    lat = lon = tz = None
    for cand in candidates:
        lat, lon, tz = await _async_geocode_once(cand, locale=locale)
        if lat is not None and lon is not None:
            break

    if lat is None or lon is None:
        raise ValueError(f"Could not resolve location '{query}'")

    if not tz:
        tz = timezone_at(lat, lon)
    return lat, lon, tz
