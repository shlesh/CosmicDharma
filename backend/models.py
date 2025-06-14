# backend/models.py

from pydantic import BaseModel

class ProfileInput(BaseModel):
    name: str          # user’s name
    dob: str           # date of birth, e.g. "2001-06-23"
    tob: str           # time of birth, e.g. "04:26"
    pob: str           # place of birth, e.g. "Renukoot"
