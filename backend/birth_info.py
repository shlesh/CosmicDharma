# backend/birth_info.py
"""
Parse and format birth details into human-readable strings:
- Day of week and full date
- Time with AM/PM and timezone abbreviation
- Reverse-geocoded location string (City, State, Country)
- Coordinates summary
"""
from datetime import datetime
import pytz
from timezonefinder import TimezoneFinder
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderServiceError

# One-time reverse geolocator
geo_reverse = Nominatim(user_agent="astro_app/1.0")

def get_birth_info(dob: str, tob: str, lat: float, lon: float) -> dict:
    """
    Given date (YYYY-MM-DD), time (HH:MM), and coords,
    return formatted birth info.
    """
    # 1) Parse naive local datetime
    naive = datetime.strptime(f"{dob} {tob}", "%Y-%m-%d %H:%M")

    # 2) Determine timezone from coords
    tz_str = TimezoneFinder().timezone_at(lat=lat, lng=lon) or "UTC"
    tz = pytz.timezone(tz_str)
    local_dt = tz.localize(naive)

    # 3) Format date & time
    date_string = local_dt.strftime("%A, %B %d, %Y")
    time_string = local_dt.strftime("%I:%M %p %Z")

    # 4) Reverse geocode
    try:
        rev = geo_reverse.reverse((lat, lon), timeout=10)
        addr = rev.raw.get("address", {})
        parts = []
        for key in ("city", "town", "village", "state", "country"):
            v = addr.get(key)
            if v and v not in parts:
                parts.append(v)
        location = ", ".join(parts)
    except GeocoderServiceError:
        location = ""

    return {
        "date_string": date_string,
        "time_string": time_string,
        "timezone": tz_str,
        "location": location,
        "latitude": lat,
        "longitude": lon,
    }
