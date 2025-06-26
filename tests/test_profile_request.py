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

