import datetime
from fastapi import BackgroundTasks
import fakeredis
from rq import Queue, SimpleWorker
from backend.services import astro


def fake_compute(req):
    return {'done': True}


def test_enqueue_and_get_job(monkeypatch):
    fake = fakeredis.FakeRedis()
    q = Queue('profiles', connection=fake)
    monkeypatch.setattr(astro, '_REDIS', fake)
    monkeypatch.setattr(astro, '_JOB_QUEUE', q)
    monkeypatch.setattr(astro, 'compute_vedic_profile', fake_compute)

    req = astro.ProfileRequest(date=datetime.date(2020, 1, 1), time=datetime.time(12, 0), location='Delhi')
    job_id = astro.enqueue_profile_job(req, BackgroundTasks())

    worker = SimpleWorker([q], connection=fake)
    worker.work(burst=True)

    job = astro.get_job(job_id)
    assert job['status'] == 'complete'
    assert job['result'] == {'done': True}
