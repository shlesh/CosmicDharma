from flask import Blueprint, jsonify

bp = Blueprint('health', __name__)


@bp.route('/api/health')
def health_check():
    """Return simple health status."""
    return jsonify({'status': 'healthy'})
