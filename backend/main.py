# backend/main.py

from fastapi import FastAPI, HTTPException
from .models import ProfileInput
from .astro import calculate_astrology_profile
from starlette.concurrency import run_in_threadpool

app = FastAPI()

@app.post("/profile")
async def profile(input: ProfileInput):
    try:
        # offload blocking work
        result = await run_in_threadpool(calculate_astrology_profile, input)
        return result
    except Exception as e:
        # this will show up in the UI as a 500 + your message
        raise HTTPException(status_code=500, detail=str(e))
