# backend/astro_constants.py
"""
Shared constants and metadata for Vedic astrological calculations.
Includes full Rashi (zodiac) and Nakshatra (lunar mansion) metadata.
"""

# Rashi metadata: name, element, quality, ruling planet, basic nature
RASHI_METADATA = [
    {"name": "Aries",        "element": "Fire",  "quality": "Cardinal", "ruler": "Mars",     "nature": "Courageous"},
    {"name": "Taurus",       "element": "Earth", "quality": "Fixed",    "ruler": "Venus",    "nature": "Stable"},
    {"name": "Gemini",       "element": "Air",   "quality": "Mutable",  "ruler": "Mercury",  "nature": "Adaptable"},
    {"name": "Cancer",       "element": "Water", "quality": "Cardinal", "ruler": "Moon",     "nature": "Nurturing"},
    {"name": "Leo",          "element": "Fire",  "quality": "Fixed",    "ruler": "Sun",      "nature": "Charismatic"},
    {"name": "Virgo",        "element": "Earth", "quality": "Mutable",  "ruler": "Mercury",  "nature": "Analytical"},
    {"name": "Libra",        "element": "Air",   "quality": "Cardinal", "ruler": "Venus",    "nature": "Harmonious"},
    {"name": "Scorpio",      "element": "Water", "quality": "Fixed",    "ruler": "Mars",     "nature": "Intense"},
    {"name": "Sagittarius",  "element": "Fire",  "quality": "Mutable",  "ruler": "Jupiter",  "nature": "Philosophical"},
    {"name": "Capricorn",    "element": "Earth", "quality": "Cardinal", "ruler": "Saturn",   "nature": "Disciplined"},
    {"name": "Aquarius",     "element": "Air",   "quality": "Fixed",    "ruler": "Saturn",   "nature": "Innovative"},
    {"name": "Pisces",       "element": "Water", "quality": "Mutable",  "ruler": "Jupiter",  "nature": "Compassionate"},
]

# Nakshatra metadata: name, symbol, deity, ruling planet, gana, nature, element, caste, gender, animal, trait keywords
NAKSHATRA_METADATA = [
    {"name":"Ashwini",        "symbol":"Horse's head",        "deity":"Ashwini Kumaras", "ruling_planet":"Ketu",    "gana":"Deva",    "nature":"Movable", "element":"Fire",  "caste":"Kshatriya", "gender":"Male",   "animal":"Horse",  "traits":["Healing","Vitality"]},
    {"name":"Bharani",        "symbol":"Yoni",                "deity":"Yama",            "ruling_planet":"Venus",   "gana":"Manushya","nature":"Fixed",   "element":"Earth", "caste":"Brahmin",   "gender":"Female", "animal":"Elephant","traits":["Endurance","Transformation"]},
    {"name":"Krittika",       "symbol":"Knife",               "deity":"Agni",            "ruling_planet":"Sun",     "gana":"Deva",    "nature":"Fixed",   "element":"Fire",  "caste":"Kshatriya","gender":"Male",   "animal":"Dog",     "traits":["Courage","Purification"]},
    {"name":"Rohini",         "symbol":"Chariot",             "deity":"Brahma",          "ruling_planet":"Moon",    "gana":"Manushya","nature":"Fixed",   "element":"Earth", "caste":"Vaishya",  "gender":"Male",   "animal":"Serpent","traits":["Growth","Fertility"]},
    {"name":"Mrigashira",     "symbol":"Antelope's head",      "deity":"Soma",            "ruling_planet":"Mars",    "gana":"Deva",    "nature":"Movable", "element":"Air",   "caste":"Shudra",   "gender":"Male",   "animal":"Antelope","traits":["Searching","Curiosity"]},
    {"name":"Ardra",          "symbol":"Teardrop",            "deity":"Rudra",           "ruling_planet":"Rahu",    "gana":"Deva",    "nature":"Movable", "element":"Water", "caste":"Shudra",   "gender":"Male",   "animal":"Dog",     "traits":["Transformation","Storm"]},
    {"name":"Punarvasu",      "symbol":"Quiver of arrows",     "deity":"Aditi",           "ruling_planet":"Jupiter", "gana":"Deva",    "nature":"Movable", "element":"Fire",  "caste":"Vaishya",  "gender":"Female", "animal":"Cat",     "traits":["Renewal","Abundance"]},
    {"name":"Pushya",         "symbol":"Cow's udder",         "deity":"Brihaspati",      "ruling_planet":"Saturn",  "gana":"Deva",    "nature":"Fixed",   "element":"Water", "caste":"Kshatriya","gender":"Male",   "animal":"Goat",    "traits":["Nurturing","Wisdom"]},
    {"name":"Ashlesha",       "symbol":"Serpent",             "deity":"Naga",            "ruling_planet":"Mercury", "gana":"Rakshasa","nature":"Fixed",   "element":"Water", "caste":"Kshatriya","gender":"Female", "animal":"Snake",   "traits":["Mystery","Deception"]},
    {"name":"Magha",          "symbol":"Throne room",         "deity":"Pitris",          "ruling_planet":"Ketu",    "gana":"Manushya","nature":"Fixed",   "element":"Fire",  "caste":"Brahmin",   "gender":"Male",   "animal":"Rat",     "traits":["Ancestry","Power"]},
    {"name":"Purva Phalguni", "symbol":"Front legs of bed",    "deity":"Bhaga",           "ruling_planet":"Venus",   "gana":"Deva",    "nature":"Fixed",   "element":"Fire",  "caste":"Vaishya",  "gender":"Female", "animal":"Monkey",  "traits":["Pleasure","Creativity"]},
    {"name":"Uttara Phalguni","symbol":"Back legs of bed",     "deity":"Aryaman",         "ruling_planet":"Sun",     "gana":"Deva",    "nature":"Fixed",   "element":"Fire",  "caste":"Vaishya",  "gender":"Male",   "animal":"Cow",     "traits":["Service","Friendship"]},
    {"name":"Hasta",          "symbol":"Hand",                "deity":"Savitar",         "ruling_planet":"Moon",    "gana":"Manushya","nature":"Movable", "element":"Earth", "caste":"Shudra",   "gender":"Male",   "animal":"Buffalo","traits":["Skill","Dexterity"]},
    {"name":"Chitra",         "symbol":"Bright jewel",        "deity":"Tvastar",         "ruling_planet":"Mars",    "gana":"Manushya","nature":"Fixed",   "element":"Fire",  "caste":"Vaishya",  "gender":"Female", "animal":"Tiger",   "traits":["Beauty","Creativity"]},
    {"name":"Swati",          "symbol":"Coral",               "deity":"Vayu",            "ruling_planet":"Venus",   "gana":"Deva",    "nature":"Movable", "element":"Air",   "caste":"Kshatriya","gender":"Female", "animal":"Buffalo","traits":["Independence","Flexibility"]},
    {"name":"Vishakha",       "symbol":"Triumphal arch",      "deity":"Indra-Agni",      "ruling_planet":"Jupiter", "gana":"Deva",    "nature":"Movable", "element":"Fire",  "caste":"Vaishya",  "gender":"Female", "animal":"Wolf",    "traits":["Determination","Goal-oriented"]},
    {"name":"Anuradha",       "symbol":"Lotus",               "deity":"Mitra",           "ruling_planet":"Saturn",  "gana":"Deva",    "nature":"Fixed",   "element":"Water", "caste":"Kshatriya","gender":"Female", "animal":"Bottle",  "traits":["Friendship","Devotion"]},
    {"name":"Jyeshtha",       "symbol":"Elder",               "deity":"Indra",           "ruling_planet":"Mercury", "gana":"Manushya","nature":"Fixed",   "element":"Water", "caste":"Brahmin",   "gender":"Male",   "animal":"Cog",     "traits":["Authority","Responsibility"]},
    {"name":"Mula",           "symbol":"Root",                "deity":"Nirriti",         "ruling_planet":"Ketu",    "gana":"Rakshasa","nature":"Movable", "element":"Fire",  "caste":"Shudra",   "gender":"Female", "animal":"Rodent",  "traits":["Destruction","Renewal"]},
    {"name":"Purva Ashadha",  "symbol":"Fan",                 "deity":"Apah",            "ruling_planet":"Venus",   "gana":"Deva",    "nature":"Movable", "element":"Water", "caste":"Kshatriya","gender":"Male",   "animal":"Elephant","traits":["Victory","Ambition"]},
    {"name":"Uttara Ashadha", "symbol":"Elephant tusk",       "deity":"Vishvadevas",     "ruling_planet":"Sun",     "gana":"Deva",    "nature":"Movable", "element":"Earth", "caste":"Kshatriya","gender":"Female", "animal":"Buffalo","traits":["Inertia","Endurance"]},
    {"name":"Shravana",       "symbol":"Ear",                 "deity":"Vishnu",          "ruling_planet":"Moon",    "gana":"Manushya","nature":"Fixed",   "element":"Air",   "caste":"Brahmin",   "gender":"Female", "animal":"Monkey",  "traits":["Listening","Learning"]},
    {"name":"Dhanishta",      "symbol":"Drum",                "deity":"Vasu",            "ruling_planet":"Mars",    "gana":"Deva",    "nature":"Fixed",   "element":"Earth", "caste":"Vaishya",  "gender":"Male",   "animal":"Sheep",   "traits":["Music","Wealth"]},
    {"name":"Shatabhisha",    "symbol":"Empty circle",        "deity":"Varuna",          "ruling_planet":"Rahu",    "gana":"Rakshasa","nature":"Fixed",   "element":"Ether", "caste":"Shudra",   "gender":"Male",   "animal":"Horse",   "traits":["Healing","Mystery"]},
    {"name":"Purva Bhadrapada","symbol":"Front legs of funeral cot","deity":"Aja Ekapad","ruling_planet":"Jupiter","gana":"Rakshasa","nature":"Movable","element":"Water","caste":"Shudra","gender":"Male","animal":"Lion","traits":["Transformation","Spirituality"]},
    {"name":"Uttara Bhadrapada","symbol":"Back legs of funeral cot","deity":"Ahirbudhnya","ruling_planet":"Saturn","gana":"Rakshasa","nature":"Movable","element":"Water","caste":"Brahmin","gender":"Female","animal":"Cow","traits":["Stability","Depth"]},
    {"name":"Revati",         "symbol":"Fish",                "deity":"Pushan",          "ruling_planet":"Mercury","gana":"Deva",    "nature":"Fixed",   "element":"Ether", "caste":"Vaishya",  "gender":"Female", "animal":"Pig",     "traits":["Nourishment","Prosperity"]},
]
