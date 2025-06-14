import swisseph as swe
from datetime import datetime
from timezonefinder import TimezoneFinder
import pytz

# Use Lahiri ayanamsa (commonly used in Indian astrology)
swe.set_sid_mode(swe.SIDM_LAHIRI)

# Nakshatra mapping
nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
    "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
    "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
]

signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

def calculate_astrology_profile(data):
    print("DOB:", dob)
    print("JULIAN:", jd)
    print("MOON LONG:", moon_long)
    print("Nakshatra Index:", nak_index)

    # Step 1: Parse birth datetime
    dob = datetime.strptime(f"{data.dob} {data.tob}", "%Y-%m-%d %H:%M")

    # Step 2: Get coordinates and timezone
    # (For now, use placeholder coordinates for Renukoot)
    lat, lon = 24.2166, 83.0369
    tf = TimezoneFinder()
    timezone_str = tf.timezone_at(lat=lat, lng=lon) or "Asia/Kolkata"
    timezone = pytz.timezone(timezone_str)
    dob_utc = timezone.localize(dob).astimezone(pytz.utc)

    jd = swe.julday(dob_utc.year, dob_utc.month, dob_utc.day, dob_utc.hour + dob_utc.minute / 60.0)

    # Step 3: Get Moon position
    moon_long = swe.calc_ut(jd, swe.MOON)[0]  # safer
    moon_sign = signs[int(moon_long // 30)]

    # Step 4: Nakshatra
    nak_index = int(moon_long // (13 + 1/3))  # 13°20' = 13.333...
    pada = int((moon_long % (13 + 1/3)) // (3 + 1/3)) + 1
    nakshatra = nakshatras[nak_index % 27]

    # Step 5: Return result
    return {
        "lagna": "Pending",  # Will compute this later
        "rashi": moon_sign,
        "nakshatra": nakshatra,
        "pada": str(pada),
        "mahadasa": "Pending",  # Coming soon
        "message": f"{data.name}, you are born under {nakshatra} nakshatra in {moon_sign} rashi (Pada {pada})."
    }
