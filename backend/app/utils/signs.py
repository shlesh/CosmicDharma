"""Utility functions for zodiac signs."""

from __future__ import annotations

from app.astrology.constants import RASHI_METADATA


def get_sign_lord(sign_num: int) -> str | None:
    """Return the ruling planet of a given zodiac sign."""
    lords = {
        1: "Mars",
        2: "Venus",
        3: "Mercury",
        4: "Moon",
        5: "Sun",
        6: "Mercury",
        7: "Venus",
        8: "Mars",
        9: "Jupiter",
        10: "Saturn",
        11: "Saturn",
        12: "Jupiter",
    }
    return lords.get(sign_num)


def get_sign_name(sign_num: int) -> str | None:
    """Return the English name of the zodiac sign number."""
    if 1 <= sign_num <= 12:
        return RASHI_METADATA[sign_num - 1]["name"]
    return None

