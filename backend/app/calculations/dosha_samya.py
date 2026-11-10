"""Dosha Samya (Mars Dosha and Malefic Balance) comparison for Kundali matching."""

from typing import Dict, List, Any


def get_mangal_state(mangal_res: Dict[str, Any]) -> str:
    """Classifies Mangal Dosha into one of strict states:
    1. 'Not present' or 'Not present from Moon; Lagna unavailable'
    2. 'Present, possible mitigation noted (rule unverified; traditions differ)'
    3. 'Present (reference points: ...)'
    """
    if mangal_res.get("status") == "Not present from Moon; Lagna unavailable":
        return "Not present from Moon; Lagna unavailable"

    if not mangal_res.get("is_raw_present", False):
        return "Not present"
    
    if mangal_res.get("is_cancelled", False) or "possible mitigation noted" in mangal_res.get("status", ""):
        return "Present, possible mitigation noted (rule unverified; traditions differ)"
    
    aff_points = []
    aff = mangal_res.get("afflicted_from", {})
    if aff.get("lagna"):
        aff_points.append("Lagna")
    if aff.get("moon"):
        aff_points.append("Moon")
    points_str = f" (reference points: {', '.join(aff_points)})" if aff_points else ""
    return f"Present{points_str}"


def calculate_dosha_samya(
    groom_mangal: Dict[str, Any],
    bride_mangal: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculates Dosha Samya (Mars Dosha balance) between Groom and Bride.
    
    Strict State Categories:
      - 'Not present' / 'Not present from Moon; Lagna unavailable': No affliction from Lagna or Moon.
      - 'Present, possible mitigation noted (rule unverified; traditions differ)': Affliction present but potential unverified exception applies.
      - 'Present': Active uncancelled affliction from Lagna and/or Moon.
    
    Guarantees:
      - NEVER prints 'No Mangal Dosha' or 'Harmonious (No Mangal Dosha in either chart)'
        if either partner has a dosha present (even if potential mitigation noted).
      - Where a result depends on a disabled/unverified rule, NEVER prints 'mitigated' or 'cancelled'.
    """
    g_state = get_mangal_state(groom_mangal)
    b_state = get_mangal_state(bride_mangal)
    
    g_is_raw = groom_mangal.get("is_raw_present", False)
    b_is_raw = bride_mangal.get("is_raw_present", False)
    g_is_canc = groom_mangal.get("is_cancelled", False) or "possible mitigation noted" in groom_mangal.get("status", "")
    b_is_canc = bride_mangal.get("is_cancelled", False) or "possible mitigation noted" in bride_mangal.get("status", "")
    
    g_active = g_is_raw and not g_is_canc
    b_active = b_is_raw and not b_is_canc
    
    # Calculate points for intensity comparison
    def compute_points(mangal_res: Dict[str, Any]) -> float:
        if not mangal_res.get("is_raw_present", False):
            return 0.0
        pts = 0.0
        aff = mangal_res.get("afflicted_from", {})
        if aff.get("lagna", False):
            pts += 1.0  # Lagna placement strongest
        if aff.get("moon", False):
            pts += 0.5  # Moon placement medium
        return pts
        
    g_pts = compute_points(groom_mangal)
    b_pts = compute_points(bride_mangal)

    # Derive verdict and category
    if not g_is_raw and not b_is_raw:
        # Case 1: Neither partner has any dosha
        category = "neither"
        is_balanced = True
        if g_state == "Not present from Moon; Lagna unavailable" or b_state == "Not present from Moon; Lagna unavailable":
            verdict = f"Harmonious ({g_state if g_state != 'Not present' else 'No Mangal Dosha'} for Groom, {b_state if b_state != 'Not present' else 'No Mangal Dosha'} for Bride)"
        else:
            verdict = "Harmonious (No Mangal Dosha in either chart)"
        explanation = (
            "Neither Groom nor Bride possesses Mangal Dosha from available primary reference points (Lagna/Moon). "
            "Because neither chart contains active affliction, no neutralization is required and Dosha Samya is fully satisfied."
        )
    elif g_active and b_active:
        # Case 2: Both have active uncancelled dosha -> mutual neutralization
        category = "both"
        is_balanced = True
        verdict = "Dosha Samya Achieved (Mutual Presence Neutralizes)"
        explanation = (
            f"Both partners have active Mangal Dosha (Groom: {g_pts:.1f} pts, Bride: {b_pts:.1f} pts). "
            "Under Muhurtha matching traditions, mutual presence of Mars dosha neutralizes its adverse effects."
        )
    elif g_is_canc and b_is_canc:
        # Case 3: Both partners have dosha with potential mitigations
        category = "both_cancelled"
        is_balanced = True
        verdict = "Conditional Balance: Both partners have Mangal Dosha: Present, possible mitigation noted (rule unverified; traditions differ)"
        explanation = (
            "Both partners have Mangal Dosha from primary reference points with potential mitigation conditions noted. "
            "If both mitigation rules are confirmed in your tradition, Dosha Samya is conditionally achieved."
        )
    elif g_active and b_is_canc:
        # Case 4: Groom active, Bride potential mitigation
        category = "one_active_one_cancelled"
        is_balanced = False
        verdict = f"Unbalanced: Groom has active Mangal Dosha ({g_pts:.1f} pts); Bride has Mangal Dosha: Present, possible mitigation noted (rule unverified; traditions differ)"
        explanation = (
            f"Groom has active Mangal Dosha ({g_pts:.1f} pts), while Bride's dosha has a potential mitigation noted. "
            "Because Bride's dosha may be mitigated if confirmed, mutual neutralization cannot be assumed. Traditions differ on mitigation."
        )
    elif b_active and g_is_canc:
        # Case 5: Bride active, Groom potential mitigation
        category = "one_active_one_cancelled"
        is_balanced = False
        verdict = f"Unbalanced: Bride has active Mangal Dosha ({b_pts:.1f} pts); Groom has Mangal Dosha: Present, possible mitigation noted (rule unverified; traditions differ)"
        explanation = (
            f"Bride has active Mangal Dosha ({b_pts:.1f} pts), while Groom's dosha has a potential mitigation noted. "
            "Because Groom's dosha may be mitigated if confirmed, mutual neutralization cannot be assumed. Traditions differ on mitigation."
        )
    elif g_active and not b_is_raw:
        # Case 6: Groom active, Bride has no dosha at all
        category = "one_only"
        is_balanced = False
        verdict = f"Unbalanced: Groom has Mangal Dosha, Bride has {b_state}" if b_state != "Not present" else "Unbalanced: Groom has Mangal Dosha, Bride does not"
        explanation = (
            f"Groom has active Mangal Dosha ({g_pts:.1f} pts) while Bride has {b_state}. "
            "Because only one person has the dosha, mutual neutralization does NOT apply. "
            "Astrologers recommend evaluating Jupiter's protective drishti, 7th house strength, and remedies."
        )
    elif b_active and not g_is_raw:
        # Case 7: Bride active, Groom has no dosha at all
        category = "one_only"
        is_balanced = False
        verdict = f"Unbalanced: Bride has Mangal Dosha, Groom has {g_state}" if g_state != "Not present" else "Unbalanced: Bride has Mangal Dosha, Groom does not"
        explanation = (
            f"Bride has active Mangal Dosha ({b_pts:.1f} pts) while Groom has {g_state}. "
            "Because only one person has the dosha, mutual neutralization does NOT apply. "
            "Astrologers recommend evaluating individual D9/Navamsa charts and Jupiter's protective aspects."
        )
    elif g_is_canc and not b_is_raw:
        # Case 8: Groom has potential mitigation, Bride has no dosha at all
        category = "one_cancelled"
        is_balanced = False
        verdict = f"Conditional: Groom has Mangal Dosha: Present, possible mitigation noted (rule unverified; traditions differ); Bride has {b_state if b_state != 'Not present' else 'No Mangal Dosha'}"
        explanation = (
            f"Groom possesses Mangal Dosha with potential mitigation noted. Bride has {b_state}. "
            "Mutual neutralization does not apply. If the Groom's mitigation rule is accepted in your tradition, the match is viable; traditions differ on full vs partial relief."
        )
    else:
        # Case 9: Bride has potential mitigation, Groom has no dosha at all
        category = "one_cancelled"
        is_balanced = False
        verdict = f"Conditional: Bride has Mangal Dosha: Present, possible mitigation noted (rule unverified; traditions differ); Groom has {g_state if g_state != 'Not present' else 'No Mangal Dosha'}"
        explanation = (
            f"Bride possesses Mangal Dosha with potential mitigation noted. Groom has {g_state}. "
            "Mutual neutralization does not apply. If the Bride's mitigation rule is accepted in your tradition, the match is viable; traditions differ on full vs partial relief."
        )

    decision_table = [
        {
            "case_id": "neither",
            "name": "Neither partner has Mangal Dosha",
            "condition": "Both charts have no Mangal Dosha from available primary points (Lagna/Moon)",
            "meaning": "Ideal condition. There is no marital friction from Mars; mutual neutralization is unnecessary.",
            "is_active": category == "neither"
        },
        {
            "case_id": "both",
            "name": "Both partners have active Mangal Dosha",
            "condition": "Both charts possess active Mangal Dosha from Lagna or Moon",
            "meaning": "Dosha Samya achieved. Under Muhurtha matching traditions, mutual presence neutralizes adverse effects.",
            "is_active": category == "both"
        },
        {
            "case_id": "both_cancelled",
            "name": "Both partners have Mangal Dosha with possible mitigation noted",
            "condition": "Both charts possess Mangal Dosha but potential mitigation rules are noted",
            "meaning": "Conditional Dosha Samya. Relies on astrologer accepting mitigation rules.",
            "is_active": category == "both_cancelled"
        },
        {
            "case_id": "one_only",
            "name": "Only one partner has active Mangal Dosha",
            "condition": "One chart has active Mangal Dosha while the other has none",
            "meaning": "Unbalanced. The affliction is un-neutralized; remedies or in-depth Navamsa/Jupiter analysis advised.",
            "is_active": category == "one_only"
        },
        {
            "case_id": "one_cancelled",
            "name": "One partner has Mangal Dosha with possible mitigation noted, other has none",
            "condition": "One chart has Mangal Dosha with possible mitigation noted while the other has no affliction",
            "meaning": "Conditional. The match is viable if the single partner's mitigation rule is upheld by the family astrologer.",
            "is_active": category == "one_cancelled"
        },
        {
            "case_id": "one_active_one_cancelled",
            "name": "One partner has active Mangal Dosha, other has possible mitigation noted",
            "condition": "One chart has uncancelled Mangal Dosha, other has possible mitigation noted",
            "meaning": "Unbalanced. Because one mitigation applies, mutual neutralization is uncertain.",
            "is_active": category == "one_active_one_cancelled"
        }
    ]
        
    return {
        "category": category,
        "groom_points": g_pts,
        "bride_points": b_pts,
        "groom_status": g_state,
        "bride_status": b_state,
        "is_balanced": is_balanced,
        "verdict": verdict,
        "explanation": explanation,
        "decision_table": decision_table
    }
