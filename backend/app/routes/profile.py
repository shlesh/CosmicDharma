# backend/routes/profile.py - ENHANCED VERSION
import logging
from datetime import date, time as dt_time
from typing import Optional, Dict, Any
import time as pytime

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from pydantic import BaseModel, Field, field_validator, ConfigDict

from ..services.astro import (
    ProfileRequest,
    ProfileResponse,
    compute_vedic_profile,
    compute_panchanga,
    enqueue_profile_job,
    get_job,
)

router = APIRouter()
logger = logging.getLogger(__name__)

class JobResponse(BaseModel):
    job_id: str
    status: str = "queued"
    message: str = "Profile computation started"

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: Optional[int] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    estimated_completion: Optional[str] = None

class QuickProfileRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    birth_date: date   = Field(..., alias="date",  description="Birth date in YYYY-MM-DD")
    birth_time: dt_time = Field(..., alias="time",  description="Birth time in HH:MM")
    location: str      = Field(..., min_length=2,  description="Birth location")

    @field_validator('birth_date')
    @classmethod
    def validate_date(cls, v: date):
        if v > date.today():
            raise ValueError("Birth date cannot be in the future")
        if v.year < 1800:
            raise ValueError("Birth date must be after 1800")
        return v


class PanchangaRequest(BaseModel):
    """Daily panchanga may be today or a future calendar date."""
    model_config = ConfigDict(populate_by_name=True)

    birth_date: date = Field(..., alias="date")
    birth_time: dt_time = Field(default=dt_time(12, 0), alias="time")
    location: str = Field(..., min_length=2)
    ayanamsa: str = "yukteswar"
    node_type: str = Field(default="mean", alias="lunar_node")
    house_system: str = "whole_sign"

    @field_validator("birth_time", mode="before")
    @classmethod
    def _coerce_time(cls, v):
        if v is None or v == "":
            return dt_time(12, 0)
        if isinstance(v, str):
            raw = v.strip()
            if raw.count(":") == 1:
                raw = f"{raw}:00"
            parsed = dt_time.fromisoformat(raw)
            return parsed.replace(microsecond=0)
        return v


def _profile_from_panchanga(request: PanchangaRequest) -> ProfileRequest:
    return ProfileRequest.model_construct(
        birth_date=request.birth_date,
        birth_time=request.birth_time.replace(second=0, microsecond=0),
        location=request.location,
        ayanamsa=request.ayanamsa if request.ayanamsa in {
            "yukteswar", "yukteshwar", "lahiri", "raman", "kp", "yukteswar_swiss"
        } else "yukteswar",
        node_type=request.node_type if request.node_type in {"mean", "true"} else "mean",
        house_system=request.house_system if request.house_system in {
            "whole_sign", "equal", "sripati"
        } else "whole_sign",
    )


@router.post("/profile", response_model=ProfileResponse)
async def get_profile(request: ProfileRequest):
    logger.info(f"Profile request for {request.location} on {request.birth_date}")
    try:
        if not request.location.strip():
            raise HTTPException(status_code=400, detail="Location cannot be empty")
        start_time = pytime.time()
        result = compute_vedic_profile(request)
        if isinstance(result, dict):
            result['metadata'] = {
                'computation_time': f"{pytime.time() - start_time:.2f}s",
                'request_timestamp': request.birth_date.isoformat(),
                'api_version': '2.1.0',
                'frame': request.ayanamsa,
            }
        logger.info("Profile computation completed successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unhandled error in profile computation")
        raise HTTPException(status_code=500, detail=f"Profile computation failed: {str(e)}")

@router.post("/profile/quick")
async def get_quick_profile(request: QuickProfileRequest):
    logger.info(f"Quick profile request for {request.location}")
    try:
        full_request = ProfileRequest(
            birth_date=request.birth_date,
            birth_time=request.birth_time,
            location=request.location
        )
        result = compute_vedic_profile(full_request)
        quick_result = {
            'ascendant': result.get('birthInfo', {}).get('ascendant'),
            'ascendant_sign': result.get('birthInfo', {}).get('ascendant_sign'),
            'moon_sign': None,
            'sun_sign': None,
            'nakshatra': result.get('nakshatra', {}),
            'yuga': result.get('yuga'),
            'panchanga': result.get('panchanga'),
            'current_dasha': result.get('vimshottariDasha', [{}])[0].get('lord') if result.get('vimshottariDasha') else None,
            'birth_info': {
                'date': request.birth_date.isoformat(),
                'time': request.birth_time.isoformat(),
                'location': request.location
            }
        }
        planets = result.get('planetaryPositions', [])
        for planet in planets:
            if planet['name'] == 'Moon':
                quick_result['moon_sign'] = planet.get('sign')
            elif planet['name'] == 'Sun':
                quick_result['sun_sign'] = planet.get('sign')
        return quick_result
    except Exception as e:
        logger.exception("Quick profile computation failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile/job", response_model=JobResponse)
async def start_profile_job(request: ProfileRequest, background_tasks: BackgroundTasks):
    try:
        job_id = enqueue_profile_job(request, background_tasks)
        return JobResponse(
            job_id=job_id,
            status="queued",
            message=f"Profile computation queued for {request.location}"
        )
    except Exception as e:
        logger.exception("Failed to enqueue profile job")
        raise HTTPException(status_code=500, detail=f"Job creation failed: {str(e)}")

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_result(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    response = JobStatusResponse(
        job_id=job_id,
        status=job['status'],
        result=job.get('result'),
        error=job.get('error')
    )
    progress_map = {'queued': 0, 'pending': 0, 'running': 50, 'complete': 100, 'error': 0}
    response.progress = progress_map.get(job['status'], 0)
    return response

@router.post("/divisional-charts")
async def get_divisional_charts(request: ProfileRequest):
    try:
        data = compute_vedic_profile(request)
        charts = data.get("divisionalCharts", {})
        return {
            "charts": charts,
            "divisionalCharts": charts,
            "interpretations": data.get("analysis", {}).get("divisionalCharts", {}),
            "vargottama_planets": data.get("vargottamaPlanets", []),
            "summary": {"total_charts": len(charts), "strong_planets": []},
        }
    except Exception as e:
        logger.exception("Divisional charts computation failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dasha")
async def get_dasha(
    request: ProfileRequest,
    depth: int = Query(3, ge=1, le=5, description="Dasha depth (1-5 levels)")
):
    try:
        data = compute_vedic_profile(request)
        dashas = data.get("vimshottariDasha", [])
        return {
            "vimshottariDasha": dashas,
            "vimshottari_dasha": dashas,
            "current_period": dashas[0] if dashas else None,
            "interpretations": data.get("analysis", {}).get("vimshottariDasha", []),
            "metadata": {"depth": depth, "total_periods": len(dashas)},
        }
    except Exception as e:
        logger.exception("Dasha computation failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/panchanga")
async def get_panchanga(request: PanchangaRequest):
    try:
        full = _profile_from_panchanga(request)
        panchanga_data = compute_panchanga(full)
        return {
            "panchanga": panchanga_data,
            "vaara": panchanga_data.get("vaara"),
            "tithi": panchanga_data.get("tithi"),
            "nakshatra": panchanga_data.get("nakshatra"),
            "yoga": panchanga_data.get("yoga"),
            "karana": panchanga_data.get("karana"),
            "auspiciousness": {"overall_rating": "good", "favorable_activities": [], "avoid_activities": []},
            "metadata": {"calculation_date": request.birth_date.isoformat(), "location": request.location},
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Panchanga computation failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/yogas")
async def get_yogas(request: ProfileRequest):
    data = compute_vedic_profile(request)
    yogas = data.get("yogas", {})
    analysis = data.get("analysis", {})
    return {"yogas": yogas, "analysis": analysis.get("yogas", yogas)}

@router.post("/strengths")
async def get_strengths(request: ProfileRequest):
    data = compute_vedic_profile(request)
    return {"shadbala": data.get("shadbala", {}), "bhavaBala": data.get("bhavaBala", {})}

@router.post("/profiles/batch")
async def process_batch_profiles(
    profiles: list[QuickProfileRequest],
    background_tasks: BackgroundTasks
):
    if len(profiles) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 profiles allowed per batch")
    job_ids = []
    for profile in profiles:
        try:
            full_request = ProfileRequest(
                birth_date=profile.birth_date,
                birth_time=profile.birth_time,
                location=profile.location
            )
            job_ids.append(enqueue_profile_job(full_request, background_tasks))
        except Exception as e:
            logger.error(f"Failed to queue profile for {profile.location}: {e}")
    return {"message": f"Queued {len(job_ids)} profile computations", "job_ids": job_ids, "check_status_url": "/api/jobs/{job_id}"}
