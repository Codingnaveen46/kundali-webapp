"""Dosha Samya (Mars Dosha and Malefic Balance) comparison for Kundali matching."""

from typing import Dict, Any
from .doshas import check_mangal_dosha


def calculate_dosha_samya(
    groom_mangal: Dict[str, Any],
    bride_mangal: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculates Dosha Samya (Mars Dosha balance) between Groom and Bride.
    
    Classical Jyotish principle: If both partners have balanced Mangal Dosha,
    the mutual afflictions neutralize each other.
    """
    def compute_points(mangal_res: Dict[str, Any]) -> float:
        if mangal_res.get("is_cancelled", False):
            return 0.0
        pts = 0.0
        aff = mangal_res.get("afflicted_from", {})
        if aff.get("lagna", False):
            pts += 1.0  # Lagna placement strongest
        if aff.get("moon", False):
            pts += 0.5  # Moon placement medium
        if aff.get("venus", False):
            pts += 0.25 # Venus placement mild
        return pts
        
    g_pts = compute_points(groom_mangal)
    b_pts = compute_points(bride_mangal)
    
    diff = abs(g_pts - b_pts)
    
    if g_pts == 0.0 and b_pts == 0.0:
        verdict = "Complete Harmony (No Mangal Dosha in either chart)"
        is_balanced = True
        explanation = "Neither Groom nor Bride possesses uncancelled Mangal Dosha. Dosha Samya is fully satisfied."
    elif diff <= 0.5:
        verdict = "Dosha Samya Achieved (Balanced Kuja Dosha)"
        is_balanced = True
        explanation = (
            f"Both partners have comparable Mangal Dosha intensity (Groom: {g_pts:.2f}, Bride: {b_pts:.2f}). "
            "Under classical Jyotish principles (Muhurtha Chintamani), mutual presence of Mars dosha neutralizes its negative effects."
        )
    elif g_pts > b_pts:
        verdict = "Mild Imbalance (Groom higher)"
        is_balanced = True  # In traditional lore, groom having slightly higher dosha than bride is acceptable
        explanation = (
            f"Groom has Mangal Dosha ({g_pts:.2f} points) while Bride has lower ({b_pts:.2f} points). "
            "Traditional texts consider this manageable."
        )
    else:
        verdict = "Unbalanced (Bride higher)"
        is_balanced = False
        explanation = (
            f"Bride has stronger uncancelled Mangal Dosha ({b_pts:.2f} points) than Groom ({g_pts:.2f} points). "
            "Classical authorities recommend evaluating individual D9/Navamsa charts and Jupiter's protective aspects."
        )
        
    return {
        "groom_points": g_pts,
        "bride_points": b_pts,
        "is_balanced": is_balanced,
        "verdict": verdict,
        "explanation": explanation
    }
