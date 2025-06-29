from datetime import date, time, timedelta
import pytest

from backend.services.astro import ProfileRequest


def test_profile_request_future_date():
    tomorrow = date.today() + timedelta(days=1)
    with pytest.raises(ValueError):
        ProfileRequest(date=tomorrow, time=time(12, 0), location="Delhi")


def test_profile_request_invalid_time():
    with pytest.raises(ValueError):
        ProfileRequest(date=date(2020, 1, 1), time=time(23, 59, 1), location="Delhi")


def test_profile_request_alias_fields():
    req = ProfileRequest(
        date=date(2020, 1, 1),
        time=time(6, 30),
        location="Delhi",
        lunar_node="true",
        ayanamsa="kp",
        house_system="equal",
    )

    assert req.birth_date == date(2020, 1, 1)
    assert req.birth_time == time(6, 30)
    assert req.location == "Delhi"
    assert req.node_type == "true"
    assert req.ayanamsa == "kp"
    assert req.house_system == "equal"


def test_profile_request_time_with_seconds_string():
    with pytest.raises(ValueError):
        ProfileRequest(date=date(2020, 1, 1), time="23:59:01", location="Delhi")

