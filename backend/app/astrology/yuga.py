"""Yuga clock from Sri Yukteswar, The Holy Science (1894).

Ascending and descending 12000-year arcs make a 24000-year cycle.
Each yuga includes sandhis of 1/10 duration at both ends.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Optional

YUGA_SEGMENTS = [
    ("Satya", -11500, -6700, "descending", 4),
    ("Treta", -6700, -3100, "descending", 3),
    ("Dwapara", -3100, -700, "descending", 2),
    ("Kali", -700, 500, "descending", 1),
    ("Kali", 500, 1700, "ascending", 1),
    ("Dwapara", 1700, 4100, "ascending", 2),
    ("Treta", 4100, 7700, "ascending", 3),
    ("Satya", 7700, 12500, "ascending", 4),
]

SANDHI_YEARS = {"Kali": 100, "Dwapara": 200, "Treta": 300, "Satya": 400}

DHARMA_LABELS = {
    1: "one quarter — gross matter",
    2: "one half — energy / electricity",
    3: "three quarters — divine magnetism",
    4: "full — knowledge of Spirit",
}

AGE_QUALITY = {
    "Kali": "Intellect grasps only gross material creation.",
    "Dwapara": "Intellect grasps fine matter and the electricities that form the outer world.",
    "Treta": "Intellect grasps divine magnetism, the source of those electrical forces.",
    "Satya": "Intellect can comprehend Spirit; dharma is complete.",
}


@dataclass(frozen=True)
class YugaState:
    name: str
    arc: str
    start_year: int
    end_year: int
    year: int
    years_into: int
    years_remaining: int
    in_sandhi: bool
    sandhi_role: Optional[str]
    dharma_padas: int
    dharma_label: str
    quality: str
    next_yuga: str
    next_year: int
    source: str = "Swami Sri Yukteswar Giri, The Holy Science (1894)"

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "display": f"{self.arc.title()} {self.name} Yuga",
            "arc": self.arc,
            "start_year": self.start_year,
            "end_year": self.end_year,
            "year": self.year,
            "years_into": self.years_into,
            "years_remaining": self.years_remaining,
            "in_sandhi": self.in_sandhi,
            "sandhi": self.sandhi_role,
            "dharma_padas": self.dharma_padas,
            "dharma": self.dharma_label,
            "quality": self.quality,
            "next_yuga": self.next_yuga,
            "next_year": self.next_year,
            "source": self.source,
            "note": (
                "A natal chart is a portrait of karma and its probable fruit, "
                "not a sentence. Will can outwit the stars."
            ),
        }


def _year_of(when: date | int | None) -> int:
    if when is None:
        return date.today().year
    if isinstance(when, int):
        return when
    return when.year


def _segment_for(year: int):
    for i, seg in enumerate(YUGA_SEGMENTS):
        name, start, end, arc, pada = seg
        if start <= year < end:
            nxt = YUGA_SEGMENTS[(i + 1) % len(YUGA_SEGMENTS)]
            return seg, nxt
    return YUGA_SEGMENTS[0], YUGA_SEGMENTS[1]


def _sandhi_role(name: str, start: int, end: int, year: int) -> Optional[str]:
    width = SANDHI_YEARS[name]
    if year < start + width:
        return "opening"
    if year >= end - width:
        return "closing"
    return None


def get_yuga(when: date | int | None = None) -> YugaState:
    year = _year_of(when)
    (name, start, end, arc, pada), nxt = _segment_for(year)
    role = _sandhi_role(name, start, end, year)
    return YugaState(
        name=name,
        arc=arc,
        start_year=start,
        end_year=end,
        year=year,
        years_into=year - start,
        years_remaining=end - year,
        in_sandhi=role is not None,
        sandhi_role=role,
        dharma_padas=pada,
        dharma_label=DHARMA_LABELS[pada],
        quality=AGE_QUALITY[name],
        next_yuga=nxt[0],
        next_year=end,
    )


def describe_yuga(when: date | int | None = None) -> dict:
    return get_yuga(when).to_dict()
