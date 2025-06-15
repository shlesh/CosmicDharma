# backend/main.py
from fastapi import FastAPI, HTTPException
from starlette.concurrency import run_in_threadpool

from .models import ProfileInput
from .geo import geocode_place
from .birth_info import get_birth_info
from .datetime_utils import parse_local_datetime, compute_julian_day
from .moon import get_moon_longitude, get_moon_sign, get_moon_nakshatra_and_pada
from .ascendant import get_lagna
from .planets import get_planetary_positions
from .dasha import compute_vimshottari
from .astro_constants import NAKSHATRA_METADATA
from .core_elements import get_core_elements
from .nakshatra import get_nakshatra_analysis
from .house_analysis import get_house_analysis

app = FastAPI()

@app.post("/profile")
async def profile(input: ProfileInput):
    try:
        # 1) Geocode place → lat, lon
        lat, lon = await run_in_threadpool(geocode_place, input.pob)

        # 2) Format birth info for display
        birth_info = get_birth_info(input.dob, input.tob, lat, lon)

        # 3) Compute UTC datetime and Julian Day
        utc_dt = await run_in_threadpool(parse_local_datetime, input.dob, input.tob, lat, lon)
        jd     = compute_julian_day(utc_dt)

        # 4) Moon calculations
        moon_long = get_moon_longitude(jd)
        moon_sign = get_moon_sign(moon_long)
        nak_meta, pada = get_moon_nakshatra_and_pada(moon_long)
        nak_idx = next(i for i,m in enumerate(NAKSHATRA_METADATA) if m["name"] == nak_meta["name"])

        # 5) Ascendant (Lagna)
        lagna_meta = get_lagna(jd, lat, lon)
        house_info = get_house_analysis(jd, lat, lon)

        # 6) Planetary positions
        planets = get_planetary_positions(jd)

        # 7) Vimshottari Mahādasha
        dasha   = await run_in_threadpool(compute_vimshottari, jd, nak_idx, pada)

        core = get_core_elements(jd, lat, lon, moon_long)
        nak_analysis = get_nakshatra_analysis(nak_meta, pada)

        return {
            "birth_info":     birth_info,
            "core_elements": core,
            "nakshatra": nak_analysis,
            "moon_longitude": moon_long,
            "moon_sign":      moon_sign,
            "nakshatra":      nak_meta,
            "pada":           pada,
            "lagna":          lagna_meta,
            "houses":         house_info,
            "planets":        planets,
            "dasha":          dasha,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
