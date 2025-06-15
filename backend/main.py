# backend/main.py - UPDATED WITH COMPLETE VEDIC FEATURES

import logging
from datetime import date as dt_date, time as dt_time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, Any

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
from backend.divisional_charts import (
    get_vargottama_planets,
    calculate_divisional_charts,
)
from backend.aspects import calculate_vedic_aspects, calculate_sign_aspects
from backend.yogas import calculate_all_yogas
from backend.shadbala import calculate_shadbala, calculate_bhava_bala
from backend.ashtakavarga import calculate_ashtakavarga
from backend.analysis import full_analysis
import swisseph as swe

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


class ProfileResponse(BaseModel):
    """Response schema for profile-related endpoints."""

    birthInfo: Optional[dict] = None
    planetaryPositions: Optional[list] = None
    vimshottariDasha: Optional[list] = None
    nakshatra: Optional[dict] = None
    houses: Optional[dict] = None
    coreElements: Optional[dict] = None
    divisionalCharts: Optional[dict] = None
    vedicAspects: Optional[dict] = None
    yogas: Optional[dict] = None
    shadbala: Optional[dict] = None
    bhavaBala: Optional[dict] = None
    ashtakavarga: Optional[dict] = None
    analysis: Optional[dict] = None


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
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Geocoding failed")
        raise HTTPException(status_code=500, detail="Geocoding failed") from ex
    logger.info("Computed coordinates %s, %s timezone %s", lat, lon, tz)

    logger.info("Calculating Vedic charts")
    try:
        binfo = get_birth_info(
            date=request.birth_date,
            time=request.birth_time,
            latitude=lat,
            longitude=lon,
            timezone=tz,
            ayanamsha=request.ayanamsa,
            house_system=request.house_system,
        )
    except ValueError as ex:
        logger.error("Invalid birth data: %s", ex)
        raise HTTPException(status_code=400, detail=str(ex))
    except swe.Error as ex:
        logger.error("SwissEph error: %s", ex)
        raise HTTPException(status_code=500, detail=f"SwissEph error: {ex}")
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute birth info")
        raise HTTPException(status_code=500, detail="Failed to compute birth information") from ex

    try:
        planets = calculate_planets(binfo, node_type=request.node_type)
    except swe.Error as ex:
        logger.error("SwissEph error: %s", ex)
        raise HTTPException(status_code=500, detail=f"SwissEph error: {ex}")
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute planetary positions")
        raise HTTPException(status_code=500, detail="Failed to compute planetary positions") from ex

    try:
        dashas = calculate_vimshottari_dasha(binfo, planets, depth=3)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute dasha")
        raise HTTPException(status_code=500, detail="Failed to compute vimshottari dasha") from ex

    try:
        nak = get_nakshatra(planets)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute nakshatra")
        raise HTTPException(status_code=500, detail="Failed to compute nakshatra") from ex

    try:
        houses = analyze_houses(binfo, planets)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute houses")
        raise HTTPException(status_code=500, detail="Failed to compute houses") from ex
    if isinstance(houses, dict) and 'houses' not in houses:
        houses = {'houses': houses, 'placements': {}, 'aspects': {}}

    try:
        core = calculate_core_elements(planets, include_modalities=True)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute core elements")
        raise HTTPException(status_code=500, detail="Failed to compute core elements") from ex

    try:
        dcharts = calculate_divisional_charts(planets)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute divisional charts")
        raise HTTPException(status_code=500, detail="Failed to compute divisional charts") from ex

    try:
        vargottama = get_vargottama_planets(
            dcharts.get('D1', {}),
            dcharts.get('D9', {})
        )
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute vargottama planets")
        raise HTTPException(status_code=500, detail="Failed to compute vargottama planets") from ex

    try:
        graha_drishti = calculate_vedic_aspects(planets, houses)
        rasi_drishti = calculate_sign_aspects(planets)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute aspects")
        raise HTTPException(status_code=500, detail="Failed to compute aspects") from ex

    try:
        yogas = calculate_all_yogas(planets, houses, graha_drishti)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute yogas")
        raise HTTPException(status_code=500, detail="Failed to compute yogas") from ex

    try:
        shadbala = calculate_shadbala(planets, binfo, houses)
        bhava_bala = calculate_bhava_bala(houses, planets, binfo)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute strengths")
        raise HTTPException(status_code=500, detail="Failed to compute strengths") from ex

    try:
        ashtakavarga = calculate_ashtakavarga(planets)
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute ashtakavarga")
        raise HTTPException(status_code=500, detail="Failed to compute ashtakavarga") from ex

    try:
        analysis_results = full_analysis(
            planets, dashas, nak, houses, core, dcharts,
            jd=binfo["jd_ut"],
            include_nakshatra=True,
            include_houses=True,
            include_core=True,
            include_dashas=True,
            include_divisional_charts=True,
        )
    except Exception as ex:  # pragma: no cover - unexpected
        logger.exception("Failed to compute analysis")
        raise HTTPException(status_code=500, detail="Failed to compute analysis") from ex

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

@app.post("/profile", response_model=ProfileResponse)
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


@app.post("/divisional-charts", response_model=ProfileResponse)
async def get_divisional_charts(request: ProfileRequest):
    """Return all 16 main divisional charts based on profile input."""
    logger.info("Received divisional charts request: %s", request)
    data = _compute_vedic_profile(request)
    logger.info("Divisional charts computation completed")
    return {"divisionalCharts": data["divisionalCharts"]}


@app.post("/dasha", response_model=ProfileResponse)
async def get_dasha(request: ProfileRequest):
    """Return Vimshottari dasha with sub-periods."""
    logger.info("Received dasha request: %s", request)
    data = _compute_vedic_profile(request)
    logger.info("Dasha computation completed")
    return {"vimshottariDasha": data["vimshottariDasha"]}


@app.post("/yogas", response_model=ProfileResponse)
async def get_yogas(request: ProfileRequest):
    """Return all planetary combinations (yogas) in the chart."""
    logger.info("Received yogas request: %s", request)
    data = _compute_vedic_profile(request)
    logger.info("Yogas computation completed")
    return {
        "yogas": data["yogas"],
        "analysis": data["analysis"]["yogas"]
    }


@app.post("/strengths", response_model=ProfileResponse)
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
