# backend/datetime_utils.py
from datetime import datetime
import pytz
from timezonefinder import TimezoneFinder
import swisseph as swe

def parse_local_datetime(dob: str, tob: str, lat: float, lon: float):
    """
    Convert local DOB/TOB and lat/lon into a timezone-aware UTC datetime.
    """
    # 1) Parse local naive datetime
    naive = datetime.strptime(f"{dob} {tob}", "%Y-%m-%d %H:%M")

    # 2) Determine timezone from coordinates
    tz_str = TimezoneFinder().timezone_at(lat=lat, lng=lon) or "UTC"
    tz = pytz.timezone(tz_str)

    # 3) Localize & convert to UTC
    local_dt = tz.localize(naive)
    return local_dt.astimezone(pytz.utc)

def compute_julian_day(utc_dt):
    """
    Compute Julian Day (float) from a timezone-aware UTC datetime.
    """
    return swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute/60 + utc_dt.second/3600
    )
