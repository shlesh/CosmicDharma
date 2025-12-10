"""Nakshatra utilities."""

from .constants import NAKSHATRA_METADATA
from .dasha import ORDER

def get_nakshatra(planets):
    """Return nakshatra details for the Moon position.

    Parameters
    ----------
    planets : list of dict
        Planetary positions as returned by :func:`calculate_planets`.

    Returns
    -------
    dict
        ``nakshatra`` name, ``pada`` number, ``deity``, ``symbol``,
        ``ruling_planet`` for the nakshatra, and ``pada_ruler`` according
        to the Vimshottari sequence.
    """

    moon = next(p for p in planets if p['name'] == 'Moon')
    lon = moon['longitude'] % 360

    span = 360 / 27
    idx = int(lon // span)
    pada = int((lon % span) // (span / 4)) + 1

    meta = NAKSHATRA_METADATA[idx]

    # Determine pada ruler using Vimshottari order
    pada_index = idx * 4 + (pada - 1)
    pada_ruler = ORDER[pada_index % len(ORDER)]

    return {
        'nakshatra': meta['name'],
        'pada': pada,
        'deity': meta.get('deity'),
        'symbol': meta.get('symbol'),
        'ruling_planet': meta.get('ruling_planet'),
        'pada_ruler': pada_ruler,
    }
