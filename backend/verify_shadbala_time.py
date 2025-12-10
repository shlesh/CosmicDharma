
import sys
import os
from datetime import date, time
import swisseph as swe

# Add backend to path
sys.path.append(os.getcwd())

from app.astrology.sun_data import get_sun_times
from app.astrology.shadbala import calculate_kala_bala

def verify_shadbala_time():
    print("🌅 Verifying Vedic Time Logic for Shadbala...\n")
    
    # Test Case: 3 AM birth on a Tuesday (should be Vedic Monday)
    # Date: Jan 7, 2025 is a Tuesday.
    # Time: 03:00 UTC
    # Lat/Lon: 0,0
    
    t_date = date(2025, 1, 7)
    t_time = time(3, 0)
    
    # Calculate JD
    # We need a quick JD calc same as birth_info
    # Simple util:
    import pytz
    from datetime import datetime
    utc_dt = datetime.combine(t_date, t_time).replace(tzinfo=pytz.utc)
    jd_ut = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour + utc_dt.minute/60)
    
    print(f"Test: Birth on {utc_dt} (Civil Tuesday)")
    
    lat = 0.0
    lon = 0.0
    
    sun_data = get_sun_times(jd_ut, lat, lon)
    
    print("--- Sun Data Results ---")
    print(f"Sunrise JD: {sun_data['sunrise']:.5f}")
    print(f"Sunset JD:  {sun_data['sunset']:.5f}")
    print(f"Birth JD:   {jd_ut:.5f}")
    
    is_day = sun_data['is_day_birth']
    print(f"Is Day Birth? {is_day}")
    
    if not is_day:
        print("✅ Correctly identified as Night Birth (3 AM).")
    else:
        print("❌ Error: 3 AM identified as Day Birth!")
        
    weekday = sun_data['vedic_weekday']
    print(f"Vedic Weekday Index: {weekday}")
    
    # Jan 7 2025 is Tuesday. 
    # 3 AM is before Sunrise (approx 6 AM at equator).
    # So Vedic Vara should be Monday.
    # Monday = 1 (Sun=0, Mon=1...)
    
    if weekday == 1:
        print("✅ Vedic Weekday is Monday (Correct).")
    elif weekday == 2:
        print("❌ Vedic Weekday is Tuesday (Civil Day - Incorrect for Vedic).")
    else:
        print(f"❌ Vedic Weekday is {weekday} (Unexpected).")
        
    print("\n--- Kala Bala Check ---")
    # Check Moon strength (Night strength)
    # Moon in Night birth should get +30
    planet_moon = {'name': 'Moon', 'sign': 1, 'degree': 0} # dummy
    binfo = {'jd_ut': jd_ut, 'latitude': lat, 'longitude': lon, 'birth_time': t_time}
    
    kb = calculate_kala_bala(planet_moon, binfo)
    print(f"Moon Kala Bala: {kb}")
    
    # Check manual logic: 
    # Night birth -> Moon gets 30 (Nathonnatha)
    # Vara is Monday -> Moon is lord -> Gets 45 (Vara Bala)
    # Paksha -> ignored/approx here.
    
    expected_min = 30 + 45 
    # Paksha might add more points depending on phase. 
    
    if kb >= 75:
        print("✅ Moon Kala Bala reflects Night + Monday Strength.")
    else:
        print(f"⚠️ Moon Kala Bala seems low: {kb}. Check logic.")

if __name__ == "__main__":
    verify_shadbala_time()
