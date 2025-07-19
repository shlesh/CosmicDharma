from flask import Blueprint

bp = Blueprint('api', __name__)

from . import health  # noqa: E402,F401
