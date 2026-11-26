from pathlib import Path
import os
import yaml

DEFAULTS = {
    "ayanamsa": "yukteswar",
    "node_type": "mean",
    "house_system": "whole_sign",
    "cache_enabled": "true",
    "cache_ttl": "3600",
}

_cfg = None


def _config_paths() -> list[Path]:
    """Where config.yaml may live; the first existing one wins."""
    here = Path(__file__).resolve()
    return [
        here.parents[2] / "config.yaml",
        here.parents[1] / "config.yaml",
        here.with_name("config.yaml"),
    ]


def load_config():
    global _cfg
    if _cfg is not None:
        return _cfg
    cfg = DEFAULTS.copy()

    for path in _config_paths():
        if path.exists():
            try:
                data = yaml.safe_load(path.read_text()) or {}
                for k in DEFAULTS:
                    if k in data:
                        cfg[k] = str(data[k]).lower()
            except Exception:
                pass
            break

    for k in DEFAULTS:
        val = os.getenv(k.upper())
        if val is not None:
            cfg[k] = str(val).lower()

    _cfg = cfg
    return cfg
