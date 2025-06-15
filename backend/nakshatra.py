# backend/nakshatra.py
from .astro_constants import NAKSHATRA_METADATA

def get_nakshatra_analysis(nak_meta: dict, pada: int) -> dict:
    """
    Enrich the raw nakshatra metadata with pada information.
    Input nak_meta is one entry from NAKSHATRA_METADATA.
    Returns dict with all existing keys plus 'pada'.
    """
    analysis = nak_meta.copy()
    analysis['pada'] = pada
    return analysis