import swisseph as swe
from datetime import datetime, timedelta
import pytz

def get_sun_times(jd_ut, lat, lon):
    """
    Calculate Vedic day details: Sunrise, Sunset, and Vedic Weekday.
    
    Args:
        jd_ut (float): Julian Day in UTC
        lat (float): Latitude
        lon (float): Longitude
        
    Returns:
        dict: {
            'sunrise': float (JD),
            'sunset': float (JD),
            'is_day_birth': bool,
            'vedic_weekday': int (0=Sunday, 1=Monday, ... 6=Saturday)
        }
    """
    # 1. Calculate Sunrise/Sunset for the given location and day
    # We first look for the sunrise "today" relative to the input time.
    # Note: swe.rise_trans finds the *next* rise/set after the given JD.
    # So to find the relevant sunrise that defined the start of this Vedic day,
    # we might need to search backwards if the birth is before sunrise.
    
    # Flags for rise/trans: bit 0=0 (rise), bit 0=1 (set), planet=swe.SUN
    # We use center of disc for Vedic (usually) or tip? 
    # Standard computations often use center (swe.CALC_RISE | swe.BIT_DISC_CENTER) 
    # or just swe.CALC_RISE (which defaults to limb). 
    # Lahiri Ephemeris usage varies, but center is safer for generic "Day/Night" distinction.
    # Let's use default (limb) which is standard for "Visual Sunrise".
    
    flags = swe.CALC_RISE | swe.BIT_DISC_CENTER
    
    # Search for sunrise on the current civil day (approx)
    # Start searching 24 hours back to ensure we capture the sunrise preceding the event
    result_rise = swe.rise_trans(jd_ut - 1, swe.SUN, flags, (lon, lat, 0))
    rise_jd = result_rise[1][0] # tuple: ((jd_rise, ...), (jd_set, ...)) -> structure is complex
    # wait, rise_trans returns: ((time, ...), (error)) in older versions or just tuple.
    # checking pyswisseph docs or common usage:
    # it returns a tuple/list of times.
    # Actually swe.rise_trans returns `(double[2], char[256])` in C.
    # In python it returns `((rise_jd, ...), ...)`? 
    # Let's rely on documentation or careful usage. 
    # Correct signature: swe.rise_trans(jd_ut, planet, starname, flags, geolon, geolat, altitude, pressure, temp)
    # Returns ( (rise_jd, ...), (msg) ) ? No, just the tuple of floats usually.
    # Actually, simpler method:
    
    # Let's refine the search.
    # We want the sunrise strictly BEFORE or AT `jd_ut`. 
    # But wait, if birth is 3 AM, and sunrise 6 AM. The previous sunrise was yesterday 6AM.
    # That means it is "Night" of Yesterday.
    
    # Step 1: Find next sunrise and previous sunrise.
    
    # Look for sunrise AFTER input time
    res_next_rise = swe.rise_trans(jd_ut, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0))
    next_rise = res_next_rise[1][0]
    
    # Look for sunrise BEFORE input time (go back 1.2 days to be safe and find next after that)
    res_prev_rise = swe.rise_trans(jd_ut - 1.2, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0))
    # Logic: rise_trans finds the *next* event after start_jd.
    # So if we start 30h back, the "next" rise should be the one yesterday (or today if morning).
    
    # To properly identify the "Vedic Day", we need the sunrise that started the current period.
    # This is the sunrise with the largest JD that is <= jd_ut.
    # Actually, iterate finding rises.
    
    # Robust approach:
    # 1. Start search from 'jd_ut - 1.5' (36 hours ago).
    # 2. Find next rise.
    # 3. If that rise is <= jd_ut, keep it and look for next.
    # 4. Stop when rise > jd_ut. The last one <= jd_ut is our "Vedic Sunrise".
    
    search_start = jd_ut - 1.5
    vedic_rise = None
    
    for _ in range(3): # Check a few days window
        res = swe.rise_trans(search_start, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0))
        t = res[1][0]
        if t <= jd_ut:
            vedic_rise = t
            search_start = t + 0.1 # Move slightly forward
        else:
            break
            
    if vedic_rise is None:
        # Should not happen if we go back far enough
        vedic_rise = next_rise # Fallback (weird)
        
    # Now find the Sunset following that specific Sunrise
    res_set = swe.rise_trans(vedic_rise, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, (lon, lat, 0))
    sunset_jd = res_set[1][0]
    
    # Is Day Birth?
    # If Birth JD is between Vedic Sunrise and that day's Sunset
    is_day_birth = (jd_ut >= vedic_rise) and (jd_ut <= sunset_jd)
    
    # Vedic Weekday (Vaara)
    # The weekday is determined by the Vedic Sunrise.
    # swe.day_of_week(0) = Monday, 1=Tuesday... NO.
    # swe.day_of_week returns 0=Monday, 1=Tuesday... 6=Sunday.
    # Wait, lets check standard `date.weekday()`: 0=Mon, 6=Sun.
    # Vedic uses: 0=Sunday, 1=Monday ... 6=Saturday (Ravivara, Somavara...)
    # We need to map correctly.
    
    # Let's use Python's datetime from the JD to be sure, or swe.day_of_week.
    # swe.day_of_week(jd): 0=Monday, ... 6=Sunday.
    # Vedic mapping:
    # Sun (Ravi) = 0 -> SWE 6
    # Mon (Soma) = 1 -> SWE 0
    # Tue (Mangala) = 2 -> SWE 1
    # Wed (Budha) = 3 -> SWE 2
    # Thu (Guru) = 4 -> SWE 3
    # Fri (Shukra) = 5 -> SWE 4
    # Sat (Shani) = 6 -> SWE 5
    
    swe_dow = swe.day_of_week(vedic_rise)
    # Map SWE (0=Mon) to Vedic (0=Sun, 1=Mon)
    # Mon(0) -> 1
    # Tue(1) -> 2
    # ...
    # Sun(6) -> 0
    
    vedic_weekday = (swe_dow + 1) % 7
    
    return {
        "sunrise": vedic_rise,
        "sunset": sunset_jd,
        "is_day_birth": is_day_birth,
        "vedic_weekday": vedic_weekday,
        "next_sunrise": next_rise # might be useful
    }
