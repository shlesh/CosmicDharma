"""Deployment environment and secrets.

APP_ENV defaults to "production" on purpose: a server that forgets to set it should refuse to run
with a weak secret, not quietly accept one. Local dev and tests opt in to leniency (the dev
launchers set APP_ENV=development; tests/conftest.py sets APP_ENV=test).
"""
from __future__ import annotations

import logging
import os
import secrets

logger = logging.getLogger(__name__)

APP_ENV = os.getenv("APP_ENV", "production").strip().lower()
IS_DEV = APP_ENV in {"development", "dev", "local", "test"}

_PLACEHOLDERS = {"change-me", "changeme", "secret", "dev", "test", "password"}
MIN_SECRET_LENGTH = 32


class InsecureConfigError(RuntimeError):
    pass


def load_secret_key() -> str:
    key = (os.getenv("SECRET_KEY") or "").strip()
    weak = not key or key.lower() in _PLACEHOLDERS or len(key) < MIN_SECRET_LENGTH
    if not weak:
        return key
    if not IS_DEV:
        raise InsecureConfigError(
            "SECRET_KEY is missing or weak (needs 32+ random characters). Generate one with:\n"
            "  python -c \"import secrets; print(secrets.token_urlsafe(48))\"\n"
            "For local development set APP_ENV=development instead."
        )
    if not key:
        # An ephemeral key logs everyone out on each restart; fine for a throwaway dev run.
        logger.warning("SECRET_KEY is not set; using a temporary key (APP_ENV=%s).", APP_ENV)
        return secrets.token_urlsafe(32)
    logger.warning("SECRET_KEY is a placeholder or short; acceptable only because APP_ENV=%s.", APP_ENV)
    return key
