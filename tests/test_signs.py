import pytest
from backend.app.utils.signs import get_sign_name


def test_get_sign_name_all():
    expected = [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
    ]
    for idx, name in enumerate(expected, start=1):
        assert get_sign_name(idx) == name
