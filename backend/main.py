# backend/main.py - UPDATED WITH COMPLETE VEDIC FEATURES

import logging
from datetime import date as dt_date, time as dt_time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal

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

# New Vedic modules
from backend.divisional_charts import get_vargottama_planets
from backend.aspects import calculate_vedic_aspects, calculate_sign_aspects
from backend.yogas import calculate_all_yogas
from backend.shadbala import calculate_shadbala, calculate_bhava_bala
from backend.analysis import full_analysis, calculate_all_divisional_charts

# FastAPI app init
app = FastAPI(
    title="Vedic Astrology Service",
    description="Comprehensive Vedic astrology calculations following traditional principles",
    version="2.0"
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
    Vedic astrology profile request:
    - date: YYYY-MM-DD
    - time: HH:MM:SS
    - location: free-form place name (e.g., "City, State, Country")
    """
    model_config = ConfigDict(populate_by_name=True)

    birth_date: dt_date = Field(..., alias="date")
    birth_time: dt_time = Field(..., alias="time")
    location: str = Field(...)
    ayanamsa: Literal["lahiri", "raman", "kp"] = Field(
        default="lahiri"  # Changed default to Lahiri for Vedic
    )
    node_type: Literal["mean", "true"] = Field(
        default="mean", alias="lunar_node"
    )
    house_system: Literal["whole_sign", "equal", "sripati"] = Field(
        default="whole_sign"  # Changed to Vedic standard
    )


def _compute_vedic_profile(request: ProfileRequest):
    """Compute complete Vedic astrological profile."""
    
    # Geocoding
    loc_str = request.location.strip()
    logger.info("Geocoding '%s'", loc_str)
    try:
        lat, lon, tz = geocode_location(loc_str)
    except ValueError as ex:
        logger.error(str(ex))
        raise HTTPException(status_code=400, detail=str(ex))
    logger.info("Computed coordinates %s, %s timezone %s", lat, lon, tz)

    # Basic calculations
    logger.info("Calculating Vedic charts")
    binfo = get_birth_info(
        date=request.birth_date,
        time=request.birth_time,
        latitude=lat,
        longitude=lon,
        timezone=tz,
        ayanamsha=request.ayanamsa,
        house_system=request.house_system,
    )
    
    # Planetary positions (now includes Ketu and sidereal positions)
    planets = calculate_planets(binfo, node_type=request.node_type)
    
    # Vimshottari Dasha with depth
    dashas = calculate_vimshottari_dasha(binfo, planets, depth=3)
    
    # Nakshatra
    nak = get_nakshatra(planets)
    
    # Houses
    houses = analyze_houses(binfo, planets)
    if isinstance(houses, dict) and 'houses' not in houses:
        houses = {'houses': houses, 'placements': {}, 'aspects': {}}
    
    # Core elements with modalities
    core = calculate_core_elements(planets, include_modalities=True)
    
    # Proper divisional charts
    dcharts = calculate_all_divisional_charts(planets)
    
    # Vargottama planets
    vargottama = get_vargottama_planets(
        dcharts.get('D1', {}),
        dcharts.get('D9', {})
    )
    
    # Vedic aspects
    graha_drishti = calculate_vedic_aspects(planets, houses)
    rasi_drishti = calculate_sign_aspects(planets)
    
    # Yogas (planetary combinations)
    yogas = calculate_all_yogas(planets, houses, graha_drishti)
    
    # Planetary strengths (Shadbala)
    shadbala = calculate_shadbala(planets, binfo, houses)
    
    # House strengths (Bhava Bala)
    bhava_bala = calculate_bhava_bala(houses, planets, binfo)
    
    # Ashtakavarga (simplified - would need full implementation)
    ashtakavarga = {
        'note': 'Full Ashtakavarga calculation to be implemented',
        'total_points': {}  # Would calculate benefic points
    }
    
    # Analysis with all components
    analysis_results = full_analysis(
        planets, dashas, nak, houses, core, dcharts,
        jd=binfo["jd_ut"],
        include_nakshatra=True,
        include_houses=True,
        include_core=True,
        include_dashas=True,
        include_divisional_charts=True,
    )
    
    # Add Vedic-specific analysis
    analysis_results['yogas'] = yogas
    analysis_results['shadbala'] = shadbala
    analysis_results['bhavaBala'] = bhava_bala
    analysis_results['vargottamaPlanets'] = vargottama
    
    result = {
        "birthInfo": {**binfo, "latitude": lat, "longitude": lon, "timezone": tz},
        "planetaryPositions": planets,
        "vimshottariDasha": dashas,
        "nakshatra": nak,
        "houses": houses,
        "coreElements": core,
        "divisionalCharts": dcharts,
        "vedicAspects": {
            "grahaDrishti": graha_drishti,
            "rasiDrishti": rasi_drishti
        },
        "yogas": yogas,
        "shadbala": shadbala,
        "bhavaBala": bhava_bala,
        "ashtakavarga": ashtakavarga,
        "analysis": analysis_results,
    }
    return result

@app.post("/profile")
async def get_profile(request: ProfileRequest):
    """Get complete Vedic astrological profile."""
    logger.info("Received profile request: %s", request)
    try:
        result = _compute_vedic_profile(request)
        logger.info("Profile computation completed")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/divisional-charts")
async def get_divisional_charts(request: ProfileRequest):
    """Return all 16 main divisional charts based on profile input."""
    logger.info("Received divisional charts request: %s", request)
    data = _compute_vedic_profile(request)
    logger.info("Divisional charts computation completed")
    return {"divisionalCharts": data["divisionalCharts"]}


@app.post("/dasha")
async def get_dasha(request: ProfileRequest):
    """Return Vimshottari dasha with sub-periods."""
    logger.info("Received dasha request: %s", request)
    data = _compute_vedic_profile(request)
    logger.info("Dasha computation completed")
    return {"vimshottariDasha": data["vimshottariDasha"]}


@app.post("/yogas")
async def get_yogas(request: ProfileRequest):
    """Return all planetary combinations (yogas) in the chart."""
    logger.info("Received yogas request: %s", request)
    data = _compute_vedic_profile(request)
    logger.info("Yogas computation completed")
    return {
        "yogas": data["yogas"],
        "analysis": data["analysis"]["yogas"]
    }


@app.post("/strengths")
async def get_strengths(request: ProfileRequest):
    """Return planetary and house strengths."""
    logger.info("Received strengths request: %s", request)
    data = _compute_vedic_profile(request)
    logger.info("Strengths computation completed")
    return {
        "shadbala": data["shadbala"],
        "bhavaBala": data["bhavaBala"]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "2.0"}