# backend/main.py

import logging
from datetime import date as dt_date, time as dt_time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict

from backend.config import load_config
from backend.geocoder import geocode_location

CONFIG = load_config()


# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Return validation errors in a structured format."""
    logger.error("Validation error: %s", exc)
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

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
    ayanamsa: str = Field(default=CONFIG.get("ayanamsa", "fagan_bradley"))
    node_type: str = Field(default=CONFIG.get("node_type", "mean"), alias="lunar_node")
    house_system: str = Field(default=CONFIG.get("house_system", "placidus"))


def _compute_profile(request: ProfileRequest):
    loc_str = request.location.strip()
    logger.info("Geocoding '%s'", loc_str)
    try:
        lat, lon, tz = geocode_location(loc_str)
    except ValueError as ex:
        logger.error(str(ex))
        raise HTTPException(status_code=400, detail=str(ex))
    logger.info("Computed coordinates %s, %s timezone %s", lat, lon, tz)

    logger.info("Calculating charts")
    binfo = get_birth_info(
        date=request.birth_date,
        time=request.birth_time,
        latitude=lat,
        longitude=lon,
        timezone=tz,
        ayanamsa=request.ayanamsa,
        house_system=request.house_system,
    )
    planets = calculate_planets(binfo, node_type=request.node_type)
    dashas = calculate_vimshottari_dasha(binfo, planets)
    nak = get_nakshatra(planets)
    houses = analyze_houses(binfo, planets)
    core = calculate_core_elements(planets)
    dcharts = calculate_all_divisional_charts(planets)
    analysis_results = full_analysis(planets, dashas, nak, houses, core, dcharts)

    result = {
        "birthInfo": {**binfo, "latitude": lat, "longitude": lon, "timezone": tz},
        "planetaryPositions": planets,
        "vimshottariDasha": dashas,
        "nakshatra": nak,
        "houses": houses,
        "coreElements": core,
        "divisionalCharts": dcharts,
        "analysis": analysis_results,
    }
    return result

@app.post("/profile")
async def get_profile(request: ProfileRequest):
    logger.info("Received profile request: %s", request)
    try:
        result = _compute_profile(request)
        logger.info("Profile computation completed")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/divisional-charts")
async def get_divisional_charts(request: ProfileRequest):
    """Return only divisional charts based on profile input."""
    logger.info("Received divisional charts request: %s", request)
    data = _compute_profile(request)
    logger.info("Divisional charts computation completed")
    return {"divisionalCharts": data["divisionalCharts"]}


@app.post("/dasha")
async def get_dasha(request: ProfileRequest):
    """Return only Vimshottari dasha sequence based on profile input."""
    logger.info("Received dasha request: %s", request)
    data = _compute_profile(request)
    logger.info("Dasha computation completed")
    return {"vimshottariDasha": data["vimshottariDasha"]}
