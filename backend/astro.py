# backend/astro.py

from datetime import datetime
import swisseph as swe
from timezonefinder import TimezoneFinder
import pytz
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderServiceError
from .models import ProfileInput

NAKSHATRAS = [ ... ]  # as before
RASHIS     = [ ... ]  # as before

def calculate_astrology_profile(data: ProfileInput):
    # 1. Parse birth datetime
    naive_dt = datetime.strptime(f"{data.dob} {data.tob}", "%Y-%m-%d %H:%M")

    # 2. Geocode with timeout + error handling
    geolocator = Nominatim(user_agent="astro_app")
    try:
        location = geolocator.geocode(data.pob, timeout=10)  # 10s timeout
    except GeocoderServiceError as e:
        raise RuntimeError(f"Geocoding failed: {e}")
    if not location:
        raise RuntimeError(f"Place not found: {data.pob}")
    lat, lon = location.latitude, location.longitude

    # 3. Timezone → UTC
    tz_str   = TimezoneFinder().timezone_at(lat=lat, lng=lon)
    local_tz = pytz.timezone(tz_str)
    local_dt = local_tz.localize(naive_dt)
    utc_dt   = local_dt.astimezone(pytz.utc)

    # 4. Julian Day
    jd = swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute/60 + utc_dt.second/3600
    )

    # 5. Moon longitude
    moon_long = swe.calc_ut(jd, swe.MOON)[0]

    # 6. Nakshatra & pada
    nak_index = int(moon_long // (13 + 1/3))
    nak       = NAKSHATRAS[nak_index]
    pada      = int(((moon_long % (13 + 1/3)) // (1 + 1/3))) + 1

    # 7. Rashi
    rashi_index = int(moon_long // 30)
    rashi       = RASHIS[rashi_index]

    return {
        "moon_longitude": moon_long,
        "nakshatra":      nak,
        "pada":           pada,
        "rashi":          rashi,
    }
