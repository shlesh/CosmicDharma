"""Backend package for Cosmic Dharma - Vedic Astrology Platform."""

import sys
import os

# Add backend to Python path
backend_path = os.path.dirname(os.path.abspath(__file__))
parent_path = os.path.dirname(backend_path)
if parent_path not in sys.path:
    sys.path.insert(0, parent_path)

__all__ = []
