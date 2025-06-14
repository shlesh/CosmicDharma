from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from astro import calculate_astrology_profile

app = FastAPI()

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class BirthDetails(BaseModel):
    name: str
    dob: str     # YYYY-MM-DD
    tob: str     # HH:MM
    pob: str     # City

@app.post("/profile")
async def profile(data: BirthDetails):
    return calculate_astrology_profile(data)
