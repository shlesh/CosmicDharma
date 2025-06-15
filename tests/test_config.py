import os
from backend import config
from pathlib import Path


def setup_function(function):
    # reset cache before each test
    config._cfg = None


def test_load_config_defaults(monkeypatch):
    monkeypatch.setattr(config.Path, "exists", lambda self: False)
    monkeypatch.delenv("AYANAMSA", raising=False)
    monkeypatch.delenv("NODE_TYPE", raising=False)
    monkeypatch.delenv("HOUSE_SYSTEM", raising=False)
    cfg = config.load_config()
    assert cfg == config.DEFAULTS


def test_load_config_env_override(monkeypatch):
    monkeypatch.setattr(config.Path, "exists", lambda self: False)
    monkeypatch.setenv("AYANAMSA", "raman")
    cfg = config.load_config()
    assert cfg["ayanamsa"] == "raman"
    assert cfg["node_type"] == config.DEFAULTS["node_type"]


def test_load_config_yaml_override(monkeypatch, tmp_path):
    data = "ayanamsa: raman\nhouse_system: equal\n"

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
