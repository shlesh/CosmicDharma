from datetime import datetime, timedelta, date
from typing import List, Dict, Optional


DASHA_YEARS = {
    "Ketu": 7,
    "Venus": 20,
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17,
}

ORDER = [
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
]


def _build_sub_periods(lord: str, start_dt: datetime, duration: float, depth: int) -> List[Dict]:
    """Recursively build sub-periods for a given dasha lord."""

    if depth == 0:
        return []

    ratio = {k: v / 120 for k, v in DASHA_YEARS.items()}
    idx = ORDER.index(lord)
    result = []
    current = start_dt
    for i in range(len(ORDER)):
        sub_lord = ORDER[(idx + i) % len(ORDER)]
        sub_duration = duration * ratio[sub_lord]
        end = current + timedelta(days=sub_duration)
        entry = {
            "lord": sub_lord,
            "start": current,
            "end": end,
        }
        if depth > 1:
            entry["sub"] = _build_sub_periods(sub_lord, current, sub_duration, depth - 1)
        result.append(entry)
        current = end
    return result


def _filter_periods(periods: List[Dict], start_dt: datetime) -> List[Dict]:
    """Trim periods so the sequence begins at ``start_dt``."""

    result = []
    for p in periods:
        if p["end"] <= start_dt:
            continue

        entry = {
            "lord": p["lord"],
            "start": max(p["start"], start_dt),
            "end": p["end"],
        }
        if "sub" in p:
            sub = _filter_periods(p["sub"], start_dt)
            if sub:
                entry["sub"] = sub
        result.append(entry)
    return result


def calculate_vimshottari_dasha(
    binfo: Dict,
    planets: List[Dict],
    *,
    start_date: Optional[datetime] = None,
    depth: int = 1,
) -> List[Dict]:
    """Return Vimshottari dasha periods with optional depth and start date."""

    moon = next(p for p in planets if p["name"] == "Moon")
    lon = moon["longitude"]
    frac = (lon % (360 / 27)) / (360 / 27)
    start_index = int(lon // (360 / 27)) % len(ORDER)

    birth_dt = datetime.fromtimestamp((binfo["jd_ut"] - 2440587.5) * 86400)
    if start_date is None:
        start_date = birth_dt
    elif isinstance(start_date, date) and not isinstance(start_date, datetime):
        start_date = datetime.combine(start_date, datetime.min.time())

    sequence = []
    current_start = birth_dt
    for i in range(len(ORDER)):
        lord = ORDER[(start_index + i) % len(ORDER)]
        years = DASHA_YEARS[lord]
        duration_days = years * 365.25
        if i == 0:
            duration_days *= 1 - frac
        end = current_start + timedelta(days=duration_days)
        entry = {
            "lord": lord,
            "start": current_start,
            "end": end,
        }
        if depth > 1:
            entry["sub"] = _build_sub_periods(lord, current_start, duration_days, depth - 1)
        sequence.append(entry)
        current_start = end

    filtered = _filter_periods(sequence, start_date)

    def _format(period_list: List[Dict]) -> List[Dict]:
        formatted = []
        for p in period_list:
            item = {
                "lord": p["lord"],
                "start": p["start"].date(),
                "end": p["end"].date(),
            }
            if "sub" in p:
                sub = _format(p["sub"])
                if sub:
                    item["sub"] = sub
            formatted.append(item)
        return formatted

    return _format(filtered)
