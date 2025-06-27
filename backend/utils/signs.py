"""Utility functions for zodiac signs."""

from __future__ import annotations


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

