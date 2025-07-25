# backend/routes/profile.py - ENHANCED VERSION
import logging
from datetime import date, time
from typing import Optional, Dict, Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from pydantic import BaseModel, Field, validator
from fastapi.responses import JSONResponse

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

# Enhanced response models with better structure
class JobResponse(BaseModel):
    job_id: str
    status: str = "queued"
    message: str = "Profile computation started"

class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # queued, running, complete, error
    progress: Optional[int] = None  # 0-100
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    estimated_completion: Optional[str] = None

class QuickProfileRequest(BaseModel):
    """Simplified request for quick calculations"""
    date: date = Field(..., description="Birth date in YYYY-MM-DD format")
    time: time = Field(..., description="Birth time in HH:MM format")  
    location: str = Field(..., min_length=2, description="Birth location")
    
    @validator('date')
    def validate_date(cls, v):
        if v > date.today():
            raise ValueError("Birth date cannot be in the future")
        if v.year < 1800:
            raise ValueError("Birth date must be after 1800")
        return v

# Enhanced profile endpoint with better error handling
@router.post("/profile", response_model=ProfileResponse)
async def get_profile(request: ProfileRequest):
    """Get complete Vedic astrological profile with enhanced validation."""
    logger.info(f"Profile request for {request.location} on {request.birth_date}")
    
    try:
        # Validate request data
        if not request.location.strip():
            raise HTTPException(status_code=400, detail="Location cannot be empty")
            
        # Log computation start
        start_time = time.time() if 'time' in locals() else None
        
        result = compute_vedic_profile(request)
        
        # Add metadata to response
        if isinstance(result, dict):
            result['metadata'] = {
                'computation_time': f"{time.time() - start_time:.2f}s" if start_time else None,
                'request_timestamp': request.birth_date.isoformat(),
                'api_version': '2.1.0'
            }
        
        logger.info("✅ Profile computation completed successfully")
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("❌ Unhandled error in profile computation")
        raise HTTPException(
            status_code=500, 
            detail=f"Profile computation failed: {str(e)}"
        )

# Quick profile endpoint for basic information
@router.post("/profile/quick")
async def get_quick_profile(request: QuickProfileRequest):
    """Get essential astrological information quickly."""
    logger.info(f"Quick profile request for {request.location}")
    
    try:
        # Convert to full ProfileRequest
        full_request = ProfileRequest(
            birth_date=request.date,
            birth_time=request.time,
            location=request.location
        )
        
        result = compute_vedic_profile(full_request)
        
        # Return only essential information
        quick_result = {
            'ascendant': result.get('birthInfo', {}).get('ascendant'),
            'moon_sign': None,  # Extract from planets
            'sun_sign': None,   # Extract from planets
            'nakshatra': result.get('nakshatra', {}),
            'current_dasha': result.get('vimshottariDasha', [{}])[0].get('lord') if result.get('vimshottariDasha') else None,
            'birth_info': {
                'date': request.date.isoformat(),
                'time': request.time.isoformat(),
                'location': request.location
            }
        }
        
        # Extract moon and sun signs from planets
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

# Enhanced job endpoint with progress tracking
@router.post("/profile/job", response_model=JobResponse)
async def start_profile_job(request: ProfileRequest, background_tasks: BackgroundTasks):
    """Start background profile computation with job tracking."""
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

# Enhanced job status endpoint
@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_result(job_id: str):
    """Retrieve detailed status and result for a profile computation job."""
    job = get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Enhance response with additional metadata
    response = JobStatusResponse(
        job_id=job_id,
        status=job['status'],
        result=job.get('result'),
        error=job.get('error')
    )
    
    # Add progress estimation based on status
    progress_map = {
        'queued': 0,
        'running': 50,
        'complete': 100,
        'error': 0
    }
    response.progress = progress_map.get(job['status'], 0)
    
    return response

# Specialized endpoints for specific calculations
@router.post("/divisional-charts")
async def get_divisional_charts(request: ProfileRequest):
    """Return all divisional charts (D1-D60) with interpretations."""
    logger.info(f"Divisional charts request for {request.location}")
    
    try:
        data = compute_vedic_profile(request)
        charts = data.get("divisionalCharts", {})
        
        # Add chart interpretations
        result = {
            "charts": charts,
            "interpretations": data.get("analysis", {}).get("divisionalCharts", {}),
            "vargottama_planets": data.get("vargottamaPlanets", []),
            "summary": {
                "total_charts": len(charts),
                "strong_planets": [],  # Could analyze strength across charts
            }
        }
        
        return result
        
    except Exception as e:
        logger.exception("Divisional charts computation failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dasha")
async def get_dasha(
    request: ProfileRequest,
    depth: int = Query(3, ge=1, le=5, description="Dasha depth (1-5 levels)")
):
    """Return Vimshottari dasha with configurable sub-periods depth."""
    logger.info(f"Dasha request for {request.location} with depth {depth}")
    
    try:
        data = compute_vedic_profile(request)
        dashas = data.get("vimshottariDasha", [])
        
        return {
            "vimshottari_dasha": dashas,
            "current_period": dashas[0] if dashas else None,
            "interpretations": data.get("analysis", {}).get("vimshottariDasha", []),
            "metadata": {
                "depth": depth,
                "total_periods": len(dashas)
            }
        }
        
    except Exception as e:
        logger.exception("Dasha computation failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/panchanga")
async def get_panchanga(request: ProfileRequest):
    """Return comprehensive panchanga (five-limb) calculations."""
    logger.info(f"Panchanga request for {request.location}")
    
    try:
        panchanga_data = compute_panchanga(request)
        
        return {
            "panchanga": panchanga_data,
            "auspiciousness": {
                "overall_rating": "good",  # Could implement rating logic
                "favorable_activities": [],
                "avoid_activities": []
            },
            "metadata": {
                "calculation_date": request.birth_date.isoformat(),
                "location": request.location
            }
        }
        
    except Exception as e:
        logger.exception("Panchanga computation failed")
        raise HTTPException(status_code=500, detail=str(e))

# Batch processing endpoint for multiple profiles
@router.post("/profiles/batch")
async def process_batch_profiles(
    profiles: list[QuickProfileRequest],
    background_tasks: BackgroundTasks
):
    """Process multiple birth charts in batch."""
    if len(profiles) > 10:
        raise HTTPException(
            status_code=400, 
            detail="Maximum 10 profiles allowed per batch"
        )
    
    job_ids = []
    
    for profile in profiles:
        try:
            full_request = ProfileRequest(
                birth_date=profile.date,
                birth_time=profile.time,
                location=profile.location
            )
            job_id = enqueue_profile_job(full_request, background_tasks)
            job_ids.append(job_id)
        except Exception as e:
            logger.error(f"Failed to queue profile for {profile.location}: {e}")
    
    return {
        "message": f"Queued {len(job_ids)} profile computations",
        "job_ids": job_ids,
        "check_status_url": "/api/jobs/{job_id}"
    }
