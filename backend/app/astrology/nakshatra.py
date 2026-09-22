"""Nakshatra utilities."""

from .constants import NAKSHATRA_METADATA
from .dasha import ORDER

# Corrections to published metadata (Vimshottari lords and yoni animals).
NAKSHATRA_FIXES = {
    "Swati": {"ruling_planet": "Rahu"},
    "Anuradha": {"animal": "Deer"},
    "Jyeshtha": {"animal": "Deer"},
}


def _meta(idx: int) -> dict:
    raw = dict(NAKSHATRA_METADATA[idx])
    raw.update(NAKSHATRA_FIXES.get(raw.get("name"), {}))
    return raw


def get_nakshatra(planets):
    moon = next(p for p in planets if p["name"] == "Moon")
    lon = moon["longitude"] % 360
    span = 360 / 27
    idx = int(lon // span)
    pada = int((lon % span) // (span / 4)) + 1
    meta = _meta(idx)
    pada_index = idx * 4 + (pada - 1)
    pada_ruler = ORDER[pada_index % len(ORDER)]
    return {
        "nakshatra": meta["name"],
        "pada": pada,
        "deity": meta.get("deity"),
        "symbol": meta.get("symbol"),
        "ruling_planet": meta.get("ruling_planet"),
        "pada_ruler": pada_ruler,
        "gana": meta.get("gana"),
        "animal": meta.get("animal"),
    }
