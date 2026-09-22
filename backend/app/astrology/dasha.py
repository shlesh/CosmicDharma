from datetime import datetime, timedelta, date, timezone
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


def _birth_datetime(binfo: Dict) -> datetime:
    """Civil birth instant. Never use the host machine timezone."""
    for key in ("local", "utc"):
        raw = binfo.get(key)
        if raw:
            try:
                dt = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc).replace(tzinfo=None)
            except ValueError:
                pass
    jd = float(binfo["jd_ut"])
    return datetime(1970, 1, 1) + timedelta(days=jd - 2440587.5)


def _build_sub_periods(lord: str, start_dt: datetime, duration: float, depth: int) -> List[Dict]:
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
    moon = next(p for p in planets if p["name"] == "Moon")
    lon = moon["longitude"]
    frac = (lon % (360 / 27)) / (360 / 27)
    start_index = int(lon // (360 / 27)) % len(ORDER)

    birth_dt = _birth_datetime(binfo)
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
