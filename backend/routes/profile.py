import logging
from fastapi import APIRouter, BackgroundTasks, HTTPException

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
        logger.exception("Unhandled error")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/profile/job")
async def start_profile_job(request: ProfileRequest, background_tasks: BackgroundTasks):
    """Start background profile computation and return a job ID."""
    job_id = enqueue_profile_job(request, background_tasks)
    return {"job_id": job_id}


@router.get("/jobs/{job_id}")
async def get_job_result(job_id: str):
    """Retrieve status or result for a previously started job."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/divisional-charts", response_model=ProfileResponse)
async def get_divisional_charts(request: ProfileRequest):
    """Return all 16 main divisional charts based on profile input."""
    logger.info("Received divisional charts request: %s", request)
    data = compute_vedic_profile(request)
    logger.info("Divisional charts computation completed")
    return {"divisionalCharts": data["divisionalCharts"]}


@router.post("/dasha", response_model=ProfileResponse)
async def get_dasha(request: ProfileRequest):
    """Return Vimshottari dasha with sub-periods."""
    logger.info("Received dasha request: %s", request)
    data = compute_vedic_profile(request)
    logger.info("Dasha computation completed")
    return {"vimshottariDasha": data["vimshottariDasha"]}


@router.post("/yogas", response_model=ProfileResponse)
async def get_yogas(request: ProfileRequest):
    """Return all planetary combinations (yogas) in the chart."""
    logger.info("Received yogas request: %s", request)
    data = compute_vedic_profile(request)
    logger.info("Yogas computation completed")
    return {
        "yogas": data["yogas"],
        "analysis": data["analysis"]["yogas"]
    }


@router.post("/strengths", response_model=ProfileResponse)
async def get_strengths(request: ProfileRequest):
    """Return planetary and house strengths."""
    logger.info("Received strengths request: %s", request)
    data = compute_vedic_profile(request)
    logger.info("Strengths computation completed")
    return {
        "shadbala": data["shadbala"],
        "bhavaBala": data["bhavaBala"]
    }


@router.post("/panchanga", response_model=ProfileResponse)
async def get_panchanga(request: ProfileRequest):
    """Return traditional panchanga details for the given date."""
    logger.info("Received panchanga request: %s", request)
    data = compute_panchanga(request)
    logger.info("Panchanga computation completed")
    return {"panchanga": data}
