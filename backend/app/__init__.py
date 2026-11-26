"""Cosmic Dharma backend package.

Loads backend/.env before any submodule runs, because core/db.py and core/settings.py read the
environment at import time. Variables already set in the real environment win over the file.
Tests (APP_ENV=test) skip the file so a developer's local .env can't leak into them.
"""
import os
from pathlib import Path

if os.getenv("APP_ENV", "").strip().lower() != "test":
    try:
        from dotenv import load_dotenv
    except ImportError:  # pragma: no cover - python-dotenv is in requirements.txt
        pass
    else:
        load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
