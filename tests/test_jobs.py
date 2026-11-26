import datetime

from fastapi import BackgroundTasks

from app.services import astro


def _request():
    return astro.ProfileRequest(
        date=datetime.date(2020, 1, 1), time=datetime.time(12, 0), location="Delhi"
    )


async def _run(tasks: BackgroundTasks):
    await tasks()


def test_enqueue_and_get_job(monkeypatch):
    monkeypatch.setattr(astro, "compute_vedic_profile", lambda req: {"done": True})

    tasks = BackgroundTasks()
    job_id = astro.enqueue_profile_job(_request(), tasks)
    assert astro.get_job(job_id)["status"] == "pending"

    import asyncio
    asyncio.run(_run(tasks))

    job = astro.get_job(job_id)
    assert job["status"] == "complete"
    assert job["result"] == {"done": True}
    assert job["error"] is None


def test_failed_job_records_error(monkeypatch):
    def boom(req):
        raise RuntimeError("ephemeris exploded")

    monkeypatch.setattr(astro, "compute_vedic_profile", boom)

    tasks = BackgroundTasks()
    job_id = astro.enqueue_profile_job(_request(), tasks)

    import asyncio
    asyncio.run(_run(tasks))

    job = astro.get_job(job_id)
    assert job["status"] == "error"
    assert "ephemeris exploded" in job["error"]


def test_unknown_job_is_none():
    assert astro.get_job("does-not-exist") is None
