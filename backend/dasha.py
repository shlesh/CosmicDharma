# backend/dasha.py
_VIMSHOTTARI_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars",
    "Rahu", "Jupiter", "Saturn", "Mercury"
]
_VIMSHOTTARI_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
    "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
}

def compute_vimshottari(dob_jd: float, nak_idx: int, pada: int):
    """
    Returns list of dicts:
      'lord', 'start_jd', 'end_jd', 'remaining_days', 'remaining_years'
    """
    start_idx = nak_idx % len(_VIMSHOTTARI_LORDS)
    frac_elapsed = (pada - 1) / 4.0
    cursor = dob_jd
    result = []

    for i in range(len(_VIMSHOTTARI_LORDS)):
        idx = (start_idx + i) % len(_VIMSHOTTARI_LORDS)
        lord = _VIMSHOTTARI_LORDS[idx]
        years = _VIMSHOTTARI_YEARS[lord]
        days_total = years * 365.25
        days_rem = days_total * (1 - frac_elapsed) if i == 0 else days_total
        start_jd = cursor
        end_jd = cursor + days_rem
        result.append({
            "lord":            lord,
            "start_jd":        start_jd,
            "end_jd":          end_jd,
            "remaining_days":  days_rem,
            "remaining_years": days_rem / 365.25,
        })
        cursor = end_jd

    return result
