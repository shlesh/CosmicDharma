# backend/main.py

import os
import time as _time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from datetime import date as dt_date, time as dt_time

# Optional Google Maps geocoding
try:
    import googlemaps
    GMAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
    if GMAPS_API_KEY:
        gmaps = googlemaps.Client(key=GMAPS_API_KEY)
    else:
        gmaps = None
except ImportError:
    gmaps = None

# Fallback geocoding & timezone detection
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder

google_fallback = Nominatim(user_agent="vedic-astrology-geocoder")
timezone_finder = TimezoneFinder()

# Core astrology modules
from backend.birth_info import get_birth_info
from backend.planets import calculate_planets
from backend.dasha import calculate_vimshottari_dasha
from backend.nakshatra import get_nakshatra
from backend.house_analysis import analyze_houses
from backend.core_elements import calculate_core_elements
from backend.analysis import calculate_all_divisional_charts, full_analysis

# FastAPI app init
app = FastAPI(
    title="Vedic Astrology Service",
    description="Compute personalized Vedic astrology profiles",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

class ProfileRequest(BaseModel):
    """
    Astrology profile request:
    - date: YYYY-MM-DD
    - time: HH:MM:SS
    - location: free-form place name (e.g., "City, State, Country")
    """
    model_config = ConfigDict(populate_by_name=True)

    birth_date: dt_date = Field(..., alias="date")
    birth_time: dt_time = Field(..., alias="time")
    location: str = Field(...)

@app.post("/profile")
async def get_profile(request: ProfileRequest):
    try:
        loc_str = request.location.strip()
        lat = lon = None

        # 1. Try Google Maps geocoding if available
        if gmaps:
            try:
                results = gmaps.geocode(loc_str)
                if results:
                    loc = results[0]["geometry"]["location"]
                    lat, lon = loc.get("lat"), loc.get("lng")
                    # determine timezone via Google if desired:
                    tz_info = gmaps.timezone({
                        "location": (lat, lon),
                        "timestamp": int(_time.time()),
                    })
                    tz = tz_info.get("timeZoneId")
                else:
                    tz = None
            except Exception:
                lat = lon = tz = None
        else:
            tz = None

        # 2. Fallback to geopy + suffix-based search if Google failed or not configured
        if lat is None or lon is None:
            # primary fuzzy search
            try:
                candidates = google_fallback.geocode(loc_str, exactly_one=False, limit=5)
            except Exception:
                candidates = None
            if candidates:
                geo = candidates[0]
                lat, lon = geo.latitude, geo.longitude
            else:
                # suffix-based fallback
                parts = [p.strip() for p in loc_str.split(",") if p.strip()]
                for i in range(1, len(parts)):
                    trial = ", ".join(parts[i:])
                    try:
                        candidates = google_fallback.geocode(trial, exactly_one=False, limit=5)
                    except Exception:
                        candidates = None
                    if candidates:
                        geo = candidates[0]
                        lat, lon = geo.latitude, geo.longitude
                        break
        
        if lat is None or lon is None:
            raise HTTPException(status_code=400, detail=f"Could not geocode location '{loc_str}'")

        # 3. Timezone determination if not from Google
        if not tz:
            tz = timezone_finder.timezone_at(lat=lat, lng=lon) or 'UTC'

        # 4. Compute birth info & charts
        binfo = get_birth_info(date=request.birth_date, time=request.birth_time,
                               latitude=lat, longitude=lon, timezone=tz)
        planets = calculate_planets(binfo)
        dashas = calculate_vimshottari_dasha(binfo)
        nak = get_nakshatra(binfo)
        houses = analyze_houses(binfo, planets)
        core = calculate_core_elements(binfo, planets)
        dcharts = calculate_all_divisional_charts(binfo, planets)
        analysis_results = full_analysis(binfo, planets, dashas, nak, houses, core, dcharts)

        return {
            "birthInfo": {**binfo, "latitude": lat, "longitude": lon, "timezone": tz},
            "planetaryPositions": planets,
            "vimshottariDasha": dashas,
            "nakshatra": nak,
            "houses": houses,
            "coreElements": core,
            "divisionalCharts": dcharts,
            "analysis": analysis_results,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
