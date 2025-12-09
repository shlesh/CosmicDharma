def calculate_core_elements(
    planets,
    *,
    luminary_weight: float = 1.0,
    include_modalities: bool = False,
):
    """Compute elemental (and optionally modality) balances.

    Parameters
    ----------
    planets: list of dict
        Each dict must contain ``name`` and ``sign`` keys.
    luminary_weight: float, optional
        Weight applied to Sun and Moon when calculating totals.
    include_modalities: bool, optional
        If ``True`` also return cardinal/fixed/mutable percentages.

    Returns
    -------
    dict
        Element percentages or a dict with ``elements`` and ``modalities`` keys
        if ``include_modalities`` is ``True``.
    """

    elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0, "Space": 0}

    # Standard element assignments for the 12 signs
    sign_to_element = {
        1: "Fire",
        2: "Earth",
        3: "Air",
        4: "Water",
        5: "Fire",
        6: "Earth",
        7: "Air",  # Libra
        8: "Water",  # Scorpio
        9: "Fire",
        10: "Earth",
        11: "Air",
        12: "Water",
    }

    sign_to_modality = {
        1: "Cardinal",
        2: "Fixed",
        3: "Mutable",
        4: "Cardinal",
        5: "Fixed",
        6: "Mutable",
        7: "Cardinal",
        8: "Fixed",
        9: "Mutable",
        10: "Cardinal",
        11: "Fixed",
        12: "Mutable",
    }

    modalities = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}

    total_weight = 0.0
    for p in planets:
        weight = luminary_weight if p.get("name") in {"Sun", "Moon"} else 1.0
        total_weight += weight

        element = sign_to_element[p["sign"]]
        elements[element] += weight

        if include_modalities:
            mod = sign_to_modality[p["sign"]]
            modalities[mod] += weight

    if total_weight == 0:
        return (
            {"elements": elements, "modalities": modalities}
            if include_modalities
            else elements
        )

    for k in elements:
        elements[k] = round((elements[k] / total_weight) * 100, 1)

    if include_modalities:
        for k in modalities:
            modalities[k] = round((modalities[k] / total_weight) * 100, 1)
        return {"elements": elements, "modalities": modalities}

    return elements
