from flask import Flask


def create_app(config_object: str = "config.Config") -> Flask:
    """Application factory for Flask."""
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Register blueprints
    from .api import health
    app.register_blueprint(health.bp)

    return app
