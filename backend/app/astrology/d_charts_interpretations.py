"""
Logic to generate comprehensive reports for Divisional Charts.
Fuses planetary sign placements with specific Chart Contexts.
"""

from .interpretations import PLANETS_IN_SIGNS
from .d_charts_meanings import D_CHART_MEANINGS

def get_d_chart_details(chart_key, placements):
    """
    Generate a rich report for a specific D-Chart.
    
    Args:
        chart_key (str): e.g., "D1", "D9", "D60"
        placements (dict): { "Sun": 1, "Moon": 4 ... } mapping planet to sign number (1-12)
        
    Returns:
        dict: {
            "name": str,
            "domain": str,
            "description": str,
            "placements": dict (planet -> sign_name),
            "interpretation": str (Synthesis text),
            "special_note": str (e.g. Vargottama),
            "details": list[dict] (Detailed breakdown per planet)
        }
    """
    if chart_key not in D_CHART_MEANINGS:
        return None
        
    meta = D_CHART_MEANINGS[chart_key]
    from app.utils.signs import get_sign_name
    
    # Structure to hold the rich data
    report = {
        "name": meta["name"],
        "domain": meta["domain"],
        "description": meta["description"],
        "placements": {}, # Simple map for grid
        "details": []     # Rich list
    }
    
    # Generate interpretation for key planets
    # We focus on Sun, Moon, Ascendant (if present), Lagna Lord, Dasha Lord etc.
    # For this comprehensive report, we do all major planets.
    
    planets_of_interest = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
    
    for planet, sign_num in placements.items():
        if planet not in planets_of_interest: 
            # Still add to placements grid
            sign_name = get_sign_name(sign_num)
            report["placements"][planet] = sign_name
            continue
            
        sign_name = get_sign_name(sign_num)
        report["placements"][planet] = sign_name # Add to grid
        
        # Get Base Text
        base_text = ""
        if planet in PLANETS_IN_SIGNS and sign_name in PLANETS_IN_SIGNS[planet]:
            base_text = PLANETS_IN_SIGNS[planet][sign_name]
        
        # Is this base text suitable? 
        # Base text is D1-centric (e.g. "Sun in Aries is exalted...").
        # We need to adapt it using the context flavor.
        
        context = meta["context_flavor"]
        
        # Create a synthesized reading
        # "Regarding your career [Context], Sun in Aries indicates..."
        # We take the base text, strip the first sentence if it's generic "Sun in Aries is...", keeps qualities.
        # Actually, simply appending is often effective enough if framed right.
        
        synthesized_text = f"{context} {base_text}"
        
        report["details"].append({
            "planet": planet,
            "sign": sign_name,
            "text": synthesized_text
        })

    # Add a top-level summary / "interpretation" field for the UI header
    # Usually highlighting the most dignifed planet or just the description
    report["interpretation"] = meta["description"]
    
    return report

def augment_divisional_charts(d_charts_raw):
    """
    Take the raw d_charts dictionary ( { "D1": {"Sun": 1...} } )
    and return a rich dictionary with full reports.
    """
    rich_charts = {}
    for key, placements in d_charts_raw.items():
        details = get_d_chart_details(key, placements)
        if details:
            rich_charts[key] = details
    return rich_charts
