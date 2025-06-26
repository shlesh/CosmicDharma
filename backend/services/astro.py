# Service layer for astrological computations
from __future__ import annotations

import logging
import uuid
from typing import Literal, Optional, Dict
from datetime import date as dt_date, time as dt_time

from fastapi import BackgroundTasks, HTTPException
from pydantic import BaseModel, Field, ConfigDict
import swisseph as swe

from backend.config import load_config
from backend.geocoder import geocode_location
from backend.birth_info import get_birth_info
from backend.planets import calculate_planets
from backend.dasha import calculate_vimshottari_dasha
from backend.nakshatra import get_nakshatra
from backend.house_analysis import analyze_houses
from backend.core_elements import calculate_core_elements
from backend.divisional_charts import (
    get_vargottama_planets,
    calculate_divisional_charts,
)
from backend.aspects import calculate_vedic_aspects, calculate_sign_aspects
from backend.yogas import calculate_all_yogas
from backend.shadbala import calculate_shadbala, calculate_bhava_bala
from backend.ashtakavarga import calculate_ashtakavarga
from backend.analysis import full_analysis

CONFIG = load_config()
logger = logging.getLogger(__name__)

# Simple in-memory cache for computed profiles
_PROFILE_CACHE: Dict[tuple, dict] = {}


def clear_profile_cache() -> None:
    """Utility for tests to clear the in-memory cache."""
    _PROFILE_CACHE.clear()


class ProfileRequest(BaseModel):
    """Request payload for Vedic profile computations."""

    model_config = ConfigDict(populate_by_name=True)

    birth_date: dt_date = Field(..., alias="date")
    birth_time: dt_time = Field(..., alias="time")
    location: str
    ayanamsa: Literal["lahiri", "raman", "kp"] = Field(default="lahiri")
    node_type: Literal["mean", "true"] = Field(default="mean", alias="lunar_node")
    house_system: Literal["whole_sign", "equal", "sripati"] = Field(default="whole_sign")


class ProfileResponse(BaseModel):
    """Response schema for complete profile."""

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


def compute_vedic_profile(request: ProfileRequest) -> dict:
    """Compute complete Vedic astrological profile."""
    key = (
        request.birth_date.isoformat(),
        request.birth_time.isoformat(),
        request.location.strip().lower(),
        request.ayanamsa,
        request.house_system,
        request.node_type,
    )

    if CONFIG.get("cache_enabled", "true") == "true" and key in _PROFILE_CACHE:
        logger.info("Cache hit for profile %s", key)
        return _PROFILE_CACHE[key]

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
    if CONFIG.get("cache_enabled", "true") == "true":
        _PROFILE_CACHE[key] = result
    return result


def enqueue_profile_job(request: ProfileRequest, background_tasks: BackgroundTasks) -> str:
    """Enqueue profile computation and return a job ID."""
    job_id = str(uuid.uuid4())
    _JOB_STORE[job_id] = {"status": "pending", "result": None, "error": None}

    def run():
        try:
            result = compute_vedic_profile(request)
            _JOB_STORE[job_id]["status"] = "complete"
            _JOB_STORE[job_id]["result"] = result
        except HTTPException as ex:
            _JOB_STORE[job_id]["status"] = "error"
            _JOB_STORE[job_id]["error"] = ex.detail
        except Exception as ex:  # pragma: no cover - unexpected
            _JOB_STORE[job_id]["status"] = "error"
            _JOB_STORE[job_id]["error"] = str(ex)

    background_tasks.add_task(run)
    return job_id


_JOB_STORE: Dict[str, dict] = {}


def get_job(job_id: str) -> Optional[dict]:
    """Retrieve job status and result."""
    return _JOB_STORE.get(job_id)
