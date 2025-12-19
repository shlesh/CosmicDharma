# Service layer for astrological computations
from __future__ import annotations

import logging
import json
from typing import Literal, Optional, Dict
from datetime import date as dt_date, time as dt_time, datetime

from fastapi import BackgroundTasks, HTTPException
from pydantic import BaseModel, Field, ConfigDict, field_validator
import swisseph as swe
import time
import threading
from threading import Lock, Thread
from typing import Dict, Any
import uuid
import traceback

from ..core.config import load_config
from ..core.geocoder import geocode_location
from ..astrology.birth_info import get_birth_info
from ..astrology.planets import calculate_planets
from ..astrology.dasha import calculate_vimshottari_dasha
from ..astrology.nakshatra import get_nakshatra
from ..astrology.house_analysis import analyze_houses
from ..astrology.core_elements import calculate_core_elements
from ..astrology.divisional_charts import (
    get_vargottama_planets,
    calculate_divisional_charts,
)
from ..astrology.aspects import calculate_vedic_aspects, calculate_sign_aspects
from ..astrology.yogas import calculate_all_yogas
from ..astrology.shadbala import calculate_shadbala, calculate_bhava_bala
from ..astrology.ashtakavarga import calculate_ashtakavarga
from ..astrology.analysis import full_analysis
from ..astrology import panchanga
from ..utils.signs import get_sign_name

CONFIG = load_config()
# --- Simple in-process TTL cache (drop-in for redis we used before) ---
class _TTLCache:
    def __init__(self, default_ttl: int = 3600, maxsize: int = 2048):
        self.default_ttl = int(default_ttl)
        self.maxsize = int(maxsize)
        self._data: dict[str, tuple[float | None, str]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> str | None:
        with self._lock:
            item = self._data.get(key)
            if not item:
                return None
            expires, value = item
            if expires and expires < time.time():
                self._data.pop(key, None)
                return None
            return value

    def setex(self, key: str, ttl: int, value: str) -> None:
        with self._lock:
            # naive eviction: drop the oldest expired first
            if len(self._data) >= self.maxsize:
                now = time.time()
                expired = [k for k, (exp, _) in self._data.items() if exp and exp < now]
                for k in expired:
                    self._data.pop(k, None)
                if len(self._data) >= self.maxsize and self._data:
                    # still full -> drop an arbitrary item
                    self._data.pop(next(iter(self._data)))
            self._data[key] = (time.time() + int(ttl) if ttl else None, value)

    def scan_iter(self, prefix: str):
        with self._lock:
            now = time.time()
            to_delete = [k for k, (exp, _) in self._data.items() if exp and exp < now]
            for k in to_delete:
                self._data.pop(k, None)
            return [k for k in self._data.keys() if k.startswith(prefix)]

    def delete(self, key: str) -> None:
        with self._lock:
            self._data.pop(key, None)

logger = logging.getLogger(__name__)

# Cache config
CACHE_TTL = int(CONFIG.get("cache_ttl", "3600"))
_CACHE = _TTLCache(default_ttl=CACHE_TTL, maxsize=2048)

# --- In-process job runner (instead of Redis/RQ) ---
_JOBS: dict[str, dict] = {}
_JOBS_LOCK = threading.Lock()

def _run_profile_job(payload: dict):
    req = ProfileRequest.model_validate(payload)
    return compute_vedic_profile(req)

def enqueue_profile_job(request: ProfileRequest, background_tasks: BackgroundTasks) -> str:
    job_id = uuid.uuid4().hex
    with _JOBS_LOCK:
        _JOBS[job_id] = {"status": "pending", "result": None, "error": None, "ts": time.time()}

    def runner():
        with _JOBS_LOCK:
            _JOBS[job_id]["status"] = "running"
        try:
            result = compute_vedic_profile(request)
            with _JOBS_LOCK:
                _JOBS[job_id]["status"] = "complete"
                _JOBS[job_id]["result"] = result
        except Exception:
            err = traceback.format_exc()
            with _JOBS_LOCK:
                _JOBS[job_id]["status"] = "error"
                _JOBS[job_id]["error"] = err

    background_tasks.add_task(runner)
    return job_id

def get_job(job_id: str) -> dict | None:
    with _JOBS_LOCK:
        data = _JOBS.get(job_id)
        if not data:
            return None
        # keep legacy shape
        return {"status": data["status"], "result": data["result"], "error": data["error"]}

def clear_profile_cache():
    for key in list(_CACHE.scan_iter("profile:")):
        _CACHE.delete(key)



def clear_profile_cache() -> None:
    """Utility for tests to clear the cache."""
    for key in _CACHE.scan_iter("profile:*"):
        _CACHE.delete(key)


class ProfileRequest(BaseModel):
    """Request payload for Vedic profile computations."""

    model_config = ConfigDict(populate_by_name=True)

    birth_date: dt_date = Field(..., alias="date")
    birth_time: dt_time = Field(..., alias="time")
    location: str
    ayanamsa: Literal["lahiri", "raman", "kp"] = Field(default="lahiri")
    node_type: Literal["mean", "true"] = Field(default="mean", alias="lunar_node")
    house_system: Literal["whole_sign", "equal", "sripati"] = Field(default="whole_sign")

    @field_validator("birth_date")
    @classmethod
    def _no_future_date(cls, v: dt_date) -> dt_date:
        if v > dt_date.today():
            raise ValueError("birth date cannot be in the future")
        return v

    @field_validator("birth_time")
    @classmethod
    def _valid_time(cls, v: dt_time) -> dt_time:
        if v < dt_time(0, 0) or v > dt_time(23, 59):
            raise ValueError("birth time must be between 00:00 and 23:59")
        if v.second != 0 or v.microsecond != 0:
            raise ValueError("birth time must not include seconds")
        return v


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
    panchanga: Optional[dict] = None
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

    cache_key = "profile:" + "|".join(key)
    if CONFIG.get("cache_enabled", "true") == "true":
        cached = _CACHE.get(cache_key)
        if cached:
            logger.info("Cache hit for profile %s", key)
            return json.loads(cached)

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

    named_planets = [
        {**p, "sign": get_sign_name(p["sign"])} for p in planets
    ]

    result = {
        "birthInfo": {**binfo, "latitude": lat, "longitude": lon, "timezone": tz},
        "planetaryPositions": named_planets,
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
        _CACHE.setex(cache_key, CACHE_TTL, json.dumps(result, default=str))
    return result



def compute_panchanga(request: ProfileRequest) -> dict:
    """Compute daily panchanga for the given request."""
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
        raise HTTPException(status_code=400, detail=str(ex))
    except swe.Error as ex:
        raise HTTPException(status_code=500, detail=f"SwissEph error: {ex}")

    planets = calculate_planets(binfo, node_type=request.node_type)
    sun = next(p for p in planets if p["name"] == "Sun")
    moon = next(p for p in planets if p["name"] == "Moon")

    dt = datetime.combine(request.birth_date, request.birth_time)
    data = panchanga.calculate_panchanga(
        dt,
        sun["longitude"],
        moon["longitude"],
        tz,
    )

    return data



