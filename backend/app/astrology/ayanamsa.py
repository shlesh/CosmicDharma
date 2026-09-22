"""Sidereal offsets used by Cosmic Dharma.

Default frame is Sri Yukteswar's Revati ayanamsa from The Holy Science
(1894): the vernal equinox is 20d54m36s from the first point of Aries
(Revati), implying about 1394 years since coincidence and a 54 arcsec/year
rate from his 24000-year cycle.

Lahiri / Raman / KP remain available for comparison via Swiss Ephemeris.
"""

from __future__ import annotations

from datetime import datetime, timezone

import swisseph as swe

YUKTESWAR_EPOCH_YEAR = 1894
YUKTESWAR_EPOCH_AYANAMSA_DEG = 20 + 54 / 60 + 36 / 3600
YUKTESWAR_RATE_ARCSEC_PER_YEAR = 54.0
YUKTESWAR_FIDUCIAL = "Revati"
YUKTESWAR_SOURCE = "Swami Sri Yukteswar Giri, The Holy Science (1894)"
YUKTESWAR_ZERO_YEAR = YUKTESWAR_EPOCH_YEAR - 1394

SWISS_SIDEREAL_MODES = {
    "lahiri": swe.SIDM_LAHIRI,
    "raman": swe.SIDM_RAMAN,
    "kp": swe.SIDM_KRISHNAMURTI,
    "fagan_bradley": swe.SIDM_FAGAN_BRADLEY,
}

if hasattr(swe, "SIDM_YUKTESHWAR"):
    SWISS_SIDEREAL_MODES["yukteswar_swiss"] = swe.SIDM_YUKTESHWAR


def _julian_years_from_1894(jd_ut: float) -> float:
    epoch_jd = swe.julday(YUKTESWAR_EPOCH_YEAR, 1, 1, 0.0)
    return (jd_ut - epoch_jd) / 365.25


def yukteswar_ayanamsa(jd_ut: float) -> float:
    years = _julian_years_from_1894(jd_ut)
    return (YUKTESWAR_EPOCH_AYANAMSA_DEG + years * YUKTESWAR_RATE_ARCSEC_PER_YEAR / 3600.0) % 360


def swiss_ayanamsa(jd_ut: float, mode: str) -> float:
    key = mode.lower()
    if key not in SWISS_SIDEREAL_MODES:
        raise ValueError(f"Unknown Swiss sidereal mode '{mode}'")
    swe.set_sid_mode(SWISS_SIDEREAL_MODES[key])
    getter = getattr(swe, "get_ayanamsa_ut", swe.get_ayanamsa)
    return float(getter(jd_ut))


def get_ayanamsa(jd_ut: float, mode: str = "yukteswar") -> float:
    key = (mode or "yukteswar").lower().strip()
    if key in {"yukteswar", "yukteshwar", "sri_yukteswar", "holy_science"}:
        return yukteswar_ayanamsa(jd_ut)
    if key in SWISS_SIDEREAL_MODES:
        return swiss_ayanamsa(jd_ut, key)
    raise ValueError(
        f"Unknown ayanamsa '{mode}'. Use yukteswar, lahiri, raman, kp"
        + (", yukteswar_swiss" if "yukteswar_swiss" in SWISS_SIDEREAL_MODES else "")
        + ", or fagan_bradley."
    )


def describe_ayanamsa(mode: str, value_deg: float) -> dict:
    key = (mode or "yukteswar").lower().strip()
    if key in {"yukteswar", "yukteshwar", "sri_yukteswar", "holy_science"}:
        return {
            "id": "yukteswar",
            "name": "Sri Yukteswar (Revati)",
            "value": value_deg,
            "fiducial": YUKTESWAR_FIDUCIAL,
            "rate_arcsec_per_year": YUKTESWAR_RATE_ARCSEC_PER_YEAR,
            "epoch_year": YUKTESWAR_EPOCH_YEAR,
            "epoch_value": YUKTESWAR_EPOCH_AYANAMSA_DEG,
            "zero_year": YUKTESWAR_ZERO_YEAR,
            "source": YUKTESWAR_SOURCE,
        }
    labels = {
        "lahiri": "Lahiri (Chitra/Spica)",
        "raman": "B.V. Raman",
        "kp": "Krishnamurti",
        "fagan_bradley": "Fagan/Bradley",
        "yukteswar_swiss": "Yukteshwar (Swiss Ephemeris preset)",
    }
    return {
        "id": key,
        "name": labels.get(key, key),
        "value": value_deg,
        "fiducial": "Chitra" if key == "lahiri" else None,
        "source": "Swiss Ephemeris sidereal mode",
    }


def supported_ayanamsas() -> list[str]:
    names = ["yukteswar", "lahiri", "raman", "kp"]
    if "yukteswar_swiss" in SWISS_SIDEREAL_MODES:
        names.append("yukteswar_swiss")
    names.append("fagan_bradley")
    return names
