"""Panchanga calculations with classical five-limb notes."""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List

import pytz

from .nakshatra import _meta

TITHI_NAMES = [
    "Shukla Pratipada",
    "Shukla Dvitiya",
    "Shukla Tritiya",
    "Shukla Chaturthi",
    "Shukla Panchami",
    "Shukla Shashthi",
    "Shukla Saptami",
    "Shukla Ashtami",
    "Shukla Navami",
    "Shukla Dashami",
    "Shukla Ekadashi",
    "Shukla Dwadashi",
    "Shukla Trayodashi",
    "Shukla Chaturdashi",
    "Purnima",
    "Krishna Pratipada",
    "Krishna Dvitiya",
    "Krishna Tritiya",
    "Krishna Chaturthi",
    "Krishna Panchami",
    "Krishna Shashthi",
    "Krishna Saptami",
    "Krishna Ashtami",
    "Krishna Navami",
    "Krishna Dashami",
    "Krishna Ekadashi",
    "Krishna Dwadashi",
    "Krishna Trayodashi",
    "Krishna Chaturdashi",
    "Amavasya",
]

YOGA_NAMES = [
    "Vishkambha",
    "Priti",
    "Ayushman",
    "Saubhagya",
    "Shobhana",
    "Atiganda",
    "Sukarman",
    "Dhriti",
    "Shoola",
    "Ganda",
    "Vriddhi",
    "Dhruva",
    "Vyaghata",
    "Harshana",
    "Vajra",
    "Siddhi",
    "Vyatipata",
    "Variyana",
    "Parigha",
    "Shiva",
    "Siddha",
    "Sadhya",
    "Shubha",
    "Shukla",
    "Brahma",
    "Indra",
    "Vaidhriti",
]

_KARANA_SEQUENCE = (
    ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"] * 8
    + ["Shakuni", "Chatushpada", "Naga", "Kimstughna"]
)

VAARA_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

# Tithi class by lunar-day number within a paksha (1-15).
_TITHI_CLASS = {
    1: ("Nanda", "Joy, travel, and light beginnings."),
    2: ("Bhadra", "Building, agreements, and steady work."),
    3: ("Jaya", "Contest, resolve, and decisive action."),
    4: ("Rikta", "Empty tithi; poor for new starts, better for clearing."),
    5: ("Purna", "Completion, fullness, and gathering in."),
    6: ("Nanda", "Joy, travel, and light beginnings."),
    7: ("Bhadra", "Building, agreements, and steady work."),
    8: ("Jaya", "Contest, resolve, and decisive action."),
    9: ("Rikta", "Empty tithi; poor for new starts, better for clearing."),
    10: ("Purna", "Completion, fullness, and gathering in."),
    11: ("Nanda", "Fasting, vow, and inward reset."),
    12: ("Bhadra", "Building, agreements, and steady work."),
    13: ("Jaya", "Contest, resolve, and decisive action."),
    14: ("Rikta", "Empty tithi; poor for new starts, better for clearing."),
    15: ("Purna", "Full or dark moon; peak of the paksha."),
}

_YOGA_NOTES = {
    "Vishkambha": ("caution", "Obstacle yoga; delay launches and travel."),
    "Priti": ("favorable", "Affection and goodwill; good for meeting people."),
    "Ayushman": ("favorable", "Longevity and health work."),
    "Saubhagya": ("favorable", "Fortune and household prosperity."),
    "Shobhana": ("favorable", "Beauty, art, and gracious acts."),
    "Atiganda": ("caution", "Severe yoga; avoid risky or surgical work."),
    "Sukarman": ("favorable", "Skillful action and honest labour."),
    "Dhriti": ("favorable", "Steadfastness; hold a course."),
    "Shoola": ("caution", "Piercing yoga; poor for travel and conflict."),
    "Ganda": ("caution", "Junction yoga; keep plans simple."),
    "Vriddhi": ("favorable", "Increase, study, and growth."),
    "Dhruva": ("favorable", "Fixed, lasting work; poor for fickle bets."),
    "Vyaghata": ("caution", "Sudden blows; avoid haste and machines."),
    "Harshana": ("favorable", "Cheer and celebration."),
    "Vajra": ("caution", "Hard, brittle yoga; speech can wound."),
    "Siddhi": ("favorable", "Accomplishment of started work."),
    "Vyatipata": ("caution", "Malefic conjunction; skip auspicious rites."),
    "Variyana": ("favorable", "Comfort, vehicles, and ease."),
    "Parigha": ("caution", "Bar across the path; do not force doors."),
    "Shiva": ("favorable", "Auspicious, calm, and consecrating."),
    "Siddha": ("favorable", "Work already aligned tends to land."),
    "Sadhya": ("favorable", "What can be done, can be finished."),
    "Shubha": ("favorable", "Clean and fortunate."),
    "Shukla": ("favorable", "Bright, clarifying activity."),
    "Brahma": ("favorable", "Learning, counsel, and sacred study."),
    "Indra": ("favorable", "Authority and public standing."),
    "Vaidhriti": ("caution", "Severe yoga; postpone major rites."),
}

_KARANA_NOTES = {
    "Bava": ("favorable", "Beginnings, children, and first steps."),
    "Balava": ("favorable", "Devotion, study, and gentle work."),
    "Kaulava": ("favorable", "Friends, allies, and confidential talk."),
    "Taitila": ("favorable", "Building, adornment, and agreements."),
    "Garaja": ("mixed", "Animals, land, and practical labour."),
    "Vanija": ("favorable", "Trade, markets, and exchange."),
    "Vishti": ("caution", "Bhadra karana; avoid new ventures and travel."),
    "Shakuni": ("mixed", "Fixed karana; counsel, medicine, and strategy."),
    "Chatushpada": ("mixed", "Fixed karana; cattle, ancestors, and shelter."),
    "Naga": ("caution", "Fixed karana; better for restraint than display."),
    "Kimstughna": ("mixed", "Fixed karana of Amavasya dawn; inner work."),
}

_VAARA_NOTES = {
    "Monday": ("Moon", "Mind, liquids, home, and care."),
    "Tuesday": ("Mars", "Heat, tools, conflict, and courage."),
    "Wednesday": ("Mercury", "Speech, trade, writing, and skill."),
    "Thursday": ("Jupiter", "Teachers, dharma, counsel, and expansion."),
    "Friday": ("Venus", "Art, love, beauty, and comfort."),
    "Saturday": ("Saturn", "Discipline, repair, delay, and endurance."),
    "Sunday": ("Sun", "Authority, health, father, and public face."),
}

_IN AUSPICIOUS_YOGAS = {
    "Vishkambha",
    "Atiganda",
    "Shoola",
    "Ganda",
    "Vyaghata",
    "Vajra",
    "Vyatipata",
    "Parigha",
    "Vaidhriti",
}


def get_tithi(sun_lon: float, moon_lon: float) -> Dict:
    diff = (moon_lon - sun_lon) % 360
    index = int(diff // 12)
    frac = (diff % 12) / 12
    name = TITHI_NAMES[index]
    paksha = "Shukla" if index < 15 else "Krishna"
    day_in_paksha = (index % 15) + 1
    klass, meaning = _TITHI_CLASS[day_in_paksha]
    quality = "caution" if klass == "Rikta" else "favorable"
    if name in {"Purnima", "Amavasya"}:
        quality = "mixed"
    return {
        "index": index + 1,
        "name": name,
        "paksha": paksha,
        "fraction": frac,
        "class": klass,
        "meaning": meaning,
        "quality": quality,
    }


def get_nakshatra(moon_lon: float) -> Dict:
    span = 360 / 27
    index = int(moon_lon % 360 // span)
    pada = int((moon_lon % span) // (span / 4)) + 1
    meta = _meta(index)
    traits = meta.get("traits") or []
    trait_text = ", ".join(traits) if traits else meta.get("nature", "")
    return {
        "index": index + 1,
        "nakshatra": meta["name"],
        "pada": pada,
        "deity": meta.get("deity"),
        "symbol": meta.get("symbol"),
        "ruling_planet": meta.get("ruling_planet"),
        "gana": meta.get("gana"),
        "nature": meta.get("nature"),
        "element": meta.get("element"),
        "animal": meta.get("animal"),
        "meaning": (
            f"{meta['name']} is ruled by {meta.get('ruling_planet')}, "
            f"deity {meta.get('deity')}. {trait_text}."
        ),
    }


def get_yoga(sun_lon: float, moon_lon: float) -> Dict:
    total = (sun_lon + moon_lon) % 360
    span = 360 / 27
    index = int(total // span)
    frac = (total % span) / span
    name = YOGA_NAMES[index]
    quality, meaning = _YOGA_NOTES[name]
    return {
        "index": index + 1,
        "name": name,
        "fraction": frac,
        "quality": quality,
        "meaning": meaning,
    }


def get_karana(sun_lon: float, moon_lon: float) -> Dict:
    diff = (moon_lon - sun_lon) % 360
    index = int(diff // 6)
    frac = (diff % 6) / 6
    name = _KARANA_SEQUENCE[index]
    quality, meaning = _KARANA_NOTES.get(name, ("mixed", "Movable half-tithi."))
    return {
        "index": index + 1,
        "name": name,
        "fraction": frac,
        "quality": quality,
        "meaning": meaning,
    }


def get_vaara(dt: datetime) -> str:
    return VAARA_NAMES[dt.weekday()]


def _localize(dt: datetime, timezone: str) -> datetime:
    tz = pytz.timezone(timezone)
    if dt.tzinfo is None:
        return tz.localize(dt)
    return dt.astimezone(tz)


def _summarize(tithi: Dict, nakshatra: Dict, yoga: Dict, karana: Dict, vaara: str) -> Dict:
    flags: List[str] = []
    favor: List[str] = []
    avoid: List[str] = []
    scores = []

    if tithi.get("class") == "Rikta":
        flags.append(f"{tithi['name']} is a Rikta tithi")
        avoid.append("New contracts, weddings, and first journeys")
        favor.append("Clearing, repair, and ending leftover work")
        scores.append(-1)
    elif tithi.get("name") in {"Purnima", "Amavasya"}:
        flags.append(f"{tithi['name']} closes a paksha")
        favor.append("Completion, offering, and ancestral or vow work")
        scores.append(0)
    else:
        favor.append(tithi.get("meaning") or "Ordinary lunar-day work")
        scores.append(1)

    if yoga.get("name") in _INAUSPICIOUS_YOGAS:
        flags.append(f"{yoga['name']} yoga is traditionally severe")
        avoid.append("Auspicious rites, surgery, and long travel")
        scores.append(-1)
    else:
        favor.append(yoga.get("meaning") or yoga.get("name", "Yoga"))
        scores.append(1)

    if karana.get("name") == "Vishti":
        flags.append("Vishti (Bhadra) karana")
        avoid.append("Opening shops, signing, and setting out")
        scores.append(-1)
    elif karana.get("quality") == "caution":
        flags.append(f"{karana['name']} karana asks for restraint")
        scores.append(0)
    else:
        favor.append(karana.get("meaning") or karana.get("name", "Karana"))
        scores.append(1)

    lord, vaara_note = _VAARA_NOTES.get(vaara, ("", ""))
    if vaara_note:
        favor.append(f"{vaara} ({lord}): {vaara_note}")

    total = sum(scores)
    if total <= 0:
        quality = "caution"
    elif total >= 3:
        quality = "favorable"
    else:
        quality = "mixed"

    nak = nakshatra.get("nakshatra", "the Moon mansion")
    summary = (
        f"{vaara}, {tithi.get('name')} in {nak}. "
        f"Day quality: {quality}. "
        + ("; ".join(flags) if flags else "No severe calendar flags.")
    )
    # Deduplicate while keeping order.
    seen = set()
    clean_favor = []
    for item in favor:
        if item and item not in seen:
            seen.add(item)
            clean_favor.append(item)
    clean_avoid = []
    for item in avoid:
        if item and item not in seen:
            seen.add(item)
            clean_avoid.append(item)

    return {
        "quality": quality,
        "summary": summary,
        "favor": clean_favor[:6],
        "avoid": clean_avoid[:6],
        "flags": flags,
        "vaara_lord": lord,
        "vaara_meaning": vaara_note,
    }


def calculate_panchanga(
    dt: datetime,
    sun_lon: float,
    moon_lon: float,
    timezone: str,
) -> Dict:
    local_dt = _localize(dt, timezone)
    tithi = get_tithi(sun_lon, moon_lon)
    nakshatra = get_nakshatra(moon_lon)
    yoga = get_yoga(sun_lon, moon_lon)
    karana = get_karana(sun_lon, moon_lon)
    vaara = get_vaara(local_dt)
    notes = _summarize(tithi, nakshatra, yoga, karana, vaara)
    return {
        "tithi": tithi,
        "nakshatra": nakshatra,
        "yoga": yoga,
        "karana": karana,
        "vaara": vaara,
        "quality": notes["quality"],
        "summary": notes["summary"],
        "favor": notes["favor"],
        "avoid": notes["avoid"],
        "flags": notes["flags"],
        "vaara_lord": notes["vaara_lord"],
        "vaara_meaning": notes["vaara_meaning"],
    }
