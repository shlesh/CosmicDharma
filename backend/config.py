from pathlib import Path
import os
import yaml

DEFAULTS = {
    "ayanamsa": "lahiri",
    "node_type": "mean",
    "house_system": "whole_sign",
    "cache_enabled": "true",
    "redis_url": "redis://localhost:6379/0",
    "cache_url": "redis://localhost:6379/1",
    "cache_ttl": "3600",
}

_cfg = None

def load_config():
    global _cfg
    if _cfg is not None:
        return _cfg
    cfg = DEFAULTS.copy()

    path = Path(__file__).with_name("config.yaml")
    if path.exists():
        try:
            data = yaml.safe_load(path.read_text()) or {}
            for k in DEFAULTS:
                if k in data:
                    cfg[k] = str(data[k]).lower()
        except Exception:
            pass

    for k in DEFAULTS:
        val = os.getenv(k.upper())
        if val is not None:
            cfg[k] = str(val).lower()

    _cfg = cfg
    return cfg
