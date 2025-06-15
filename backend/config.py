from pathlib import Path
import yaml

DEFAULTS = {
    "ayanamsa": "fagan_bradley",
    "node_type": "mean",
    "house_system": "placidus",
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
    _cfg = cfg
    return cfg
