# backend/models.py
from pydantic import BaseModel

class ProfileInput(BaseModel):
    name: str
    dob:  str  # YYYY-MM-DD
    tob:  str  # HH:MM
    pob:  str
