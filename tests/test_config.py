import os
from backend.app.core import config
from pathlib import Path


def setup_function(function):
    # reset cache before each test
    config._cfg = None


def test_load_config_defaults(monkeypatch):
    monkeypatch.setattr(config.Path, "exists", lambda self: False)
    monkeypatch.delenv("AYANAMSA", raising=False)
    monkeypatch.delenv("NODE_TYPE", raising=False)
    monkeypatch.delenv("HOUSE_SYSTEM", raising=False)
    monkeypatch.delenv("CACHE_ENABLED", raising=False)
    cfg = config.load_config()
    assert cfg == config.DEFAULTS


def test_load_config_env_override(monkeypatch):
    monkeypatch.setattr(config.Path, "exists", lambda self: False)
    monkeypatch.setenv("AYANAMSA", "raman")
    monkeypatch.setenv("CACHE_ENABLED", "false")
    cfg = config.load_config()
    assert cfg["ayanamsa"] == "raman"
    assert cfg["node_type"] == config.DEFAULTS["node_type"]
    assert cfg["cache_enabled"] == "false"


def test_load_config_yaml_override(monkeypatch, tmp_path):
    data = "ayanamsa: raman\nhouse_system: equal\ncache_enabled: false\n"

    class DummyPath(Path):
        _flavour = type(Path())._flavour
        def __new__(cls, *args, **kwargs):
            return super().__new__(cls, *args, **kwargs)
        def with_name(self, name):
            return tmp_path / name
    yaml_file = tmp_path / "config.yaml"
    yaml_file.write_text(data)

    monkeypatch.setattr(config, "Path", DummyPath)
    monkeypatch.delenv("AYANAMSA", raising=False)
    cfg = config.load_config()
    assert cfg["ayanamsa"] == "raman"
    assert cfg["house_system"] == "equal"
    assert cfg["cache_enabled"] == "false"
