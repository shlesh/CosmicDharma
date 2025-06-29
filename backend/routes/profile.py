import logging
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

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

# Fix response models
class JobResponse(BaseModel):
    job_id: str

class JobStatusResponse(BaseModel):
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/profile", response_model=ProfileResponse)
async def get_profile(request: ProfileRequest):
    """Get complete Vedic astrological profile."""
    logger.info("Received profile request: %s", request)
    try:
        result = compute_vedic_profile(request)
        logger.info("Profile computation completed")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error in profile computation")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profile/job", response_model=JobResponse)
async def start_profile_job(request: ProfileRequest, background_tasks: BackgroundTasks):
    """Start background profile computation and return a job ID."""
    try:
        job_id = enqueue_profile_job(request, background_tasks)
        return JobResponse(job_id=job_id)
    except Exception as e:
        logger.exception("Failed to enqueue job")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_result(job_id: str):
    """Retrieve status or result for a previously started job."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(**job)

@router.post("/divisional-charts")
async def get_divisional_charts(request: ProfileRequest):
    """Return all 16 main divisional charts based on profile input."""
    logger.info("Received divisional charts request: %s", request)
    try:
        data = compute_vedic_profile(request)
        logger.info("Divisional charts computation completed")
        return {"divisionalCharts": data.get("divisionalCharts", {})}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dasha")
async def get_dasha(request: ProfileRequest):
    """Return Vimshottari dasha with sub-periods."""
    logger.info("Received dasha request: %s", request)
    try:
        data = compute_vedic_profile(request)
        logger.info("Dasha computation completed")
        return {"vimshottariDasha": data.get("vimshottariDasha", [])}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/yogas")
async def get_yogas(request: ProfileRequest):
    """Return all planetary combinations (yogas) in the chart."""
    logger.info("Received yogas request: %s", request)
    try:
        data = compute_vedic_profile(request)
        logger.info("Yogas computation completed")
        return {
            "yogas": data.get("yogas", {}),
            "analysis": data.get("analysis", {}).get("yogas", {})
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/strengths")
async def get_strengths(request: ProfileRequest):
    """Return planetary and house strengths."""
    logger.info("Received strengths request: %s", request)
    try:
        data = compute_vedic_profile(request)
        logger.info("Strengths computation completed")
        return {
            "shadbala": data.get("shadbala", {}),
            "bhavaBala": data.get("bhavaBala", {})
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/panchanga")
async def get_panchanga(request: ProfileRequest):
    """Return traditional panchanga details for the given date."""
    logger.info("Received panchanga request: %s", request)
    try:
        data = compute_panchanga(request)
        logger.info("Panchanga computation completed")
        return {"panchanga": data}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))