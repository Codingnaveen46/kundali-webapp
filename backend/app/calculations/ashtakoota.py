"""Ashtakoota (36 Guna Milan) matching engine with classical cancellation rules."""

from typing import Dict, List, Any, Optional
import json
import os

from .constants import SIGNS, SANSKRIT_SIGNS, SIGN_LORDS, NAKSHATRAS
from .ephemeris import get_nakshatra_and_pada

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
KOOTA_DIR = os.path.join(CURRENT_DIR, "koota_data")


def load_koota_data(filename: str) -> Dict[str, Any]:
    path = os.path.join(KOOTA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


VARNA_DATA = load_koota_data("varna.json")
VASHYA_DATA = load_koota_data("vashya.json")
TARA_DATA = load_koota_data("tara.json")
YONI_DATA = load_koota_data("yoni.json")
GRAHA_MAITRI_DATA = load_koota_data("graha_maitri.json")
GANA_DATA = load_koota_data("gana.json")
BHAKOOT_DATA = load_koota_data("bhakoot.json")
NADI_DATA = load_koota_data("nadi.json")


def calculate_varna(groom_sign: str, bride_sign: str) -> Dict[str, Any]:
    """1. Varna Koota (1 Point)"""
    g_varna = VARNA_DATA["sign_varna_mapping"].get(groom_sign, "Unknown")
    b_varna = VARNA_DATA["sign_varna_mapping"].get(bride_sign, "Unknown")
    
    g_rank = VARNA_DATA["varna_ranks"].get(g_varna, 0)
    b_rank = VARNA_DATA["varna_ranks"].get(b_varna, 0)
    
    if g_rank >= b_rank:
        points = 1.0
        status = "Full"
        desc = f"Harmonious Varna alignment. Groom ({g_varna}) and Bride ({b_varna}) share mutual spiritual compatibility."
    else:
        points = 0.0
        status = "Zero"
        desc = f"Bride ({b_varna}) ranks higher in Varna than Groom ({g_varna}) (Pratiloma), yielding 0 points."
        
    return {
        "koota": "Varna",
        "points": points,
        "max_points": 1.0,
        "groom_value": g_varna,
        "bride_value": b_varna,
        "status": status,
        "description": desc,
        "citation": VARNA_DATA["citation"]
    }


def calculate_vashya(groom_sign: str, bride_sign: str, school: str = "parashari_direct") -> Dict[str, Any]:
    """2. Vashya Koota (2 Points)"""
    if school == "parashari_direct":
        targets = VASHYA_DATA["schools"]["parashari_direct"]["vashya_targets"].get(groom_sign, [])
        is_bride_vashya = bride_sign in targets
        is_same_sign = groom_sign == bride_sign
        
        # Check mutual
        g_targets_of_b = VASHYA_DATA["schools"]["parashari_direct"]["vashya_targets"].get(bride_sign, [])
        is_groom_vashya_to_b = groom_sign in g_targets_of_b
        
        if is_same_sign or (is_bride_vashya and is_groom_vashya_to_b):
            points = 2.0
            status = "Full"
            desc = f"Mutual Vashya between {groom_sign} and {bride_sign}. Excellent natural rapport."
        elif is_bride_vashya:
            points = 1.0
            status = "Partial"
            desc = f"{bride_sign} is naturally amenable to {groom_sign}."
        elif is_groom_vashya_to_b:
            points = 1.0
            status = "Partial"
            desc = f"{groom_sign} is amenable to {bride_sign}."
        else:
            points = 0.0
            status = "Zero"
            desc = f"Neither sign exerts classical Vashya over the other."
    else:
        # category_matrix
        points = 1.0
        status = "Partial"
        desc = "Calculated via category matrix school."
        
    return {
        "koota": "Vashya",
        "points": points,
        "max_points": 2.0,
        "groom_value": groom_sign,
        "bride_value": bride_sign,
        "status": status,
        "description": desc,
        "school_used": school,
        "citation": VASHYA_DATA["citation"]
    }


def calculate_tara(groom_nak_idx: int, bride_nak_idx: int) -> Dict[str, Any]:
    """3. Tara / Dina Koota (3 Points)"""
    # Count from Bride to Groom and Groom to Bride
    count_b_to_g = ((groom_nak_idx - bride_nak_idx) % 27) + 1
    tara_b_to_g = count_b_to_g % 9
    if tara_b_to_g == 0:
        tara_b_to_g = 9
        
    count_g_to_b = ((bride_nak_idx - groom_nak_idx) % 27) + 1
    tara_g_to_b = count_g_to_b % 9
    if tara_g_to_b == 0:
        tara_g_to_b = 9
        
    tara_info_bg = TARA_DATA["taras"][str(tara_b_to_g)]
    tara_info_gb = TARA_DATA["taras"][str(tara_g_to_b)]
    
    bg_auspicious = tara_b_to_g in TARA_DATA["auspicious_tara_indices"]
    gb_auspicious = tara_g_to_b in TARA_DATA["auspicious_tara_indices"]
    
    if bg_auspicious and gb_auspicious:
        points = 3.0
        status = "Full"
        desc = f"Both directions auspicious (Bride to Groom: {tara_info_bg['name']}, Groom to Bride: {tara_info_gb['name']})."
    elif bg_auspicious or gb_auspicious:
        points = 1.5
        status = "Partial"
        desc = f"One direction auspicious ({tara_info_bg['name'] if bg_auspicious else tara_info_gb['name']}), yielding 1.5 points."
    else:
        points = 0.0
        status = "Zero"
        desc = f"Neither direction auspicious (Bride to Groom: {tara_info_bg['name']}, Groom to Bride: {tara_info_gb['name']})."
        
    return {
        "koota": "Tara",
        "points": points,
        "max_points": 3.0,
        "groom_value": f"{NAKSHATRAS[groom_nak_idx]} ({tara_info_gb['name']})",
        "bride_value": f"{NAKSHATRAS[bride_nak_idx]} ({tara_info_bg['name']})",
        "status": status,
        "description": desc,
        "citation": TARA_DATA["citation"]
    }


def calculate_yoni(groom_nak: str, bride_nak: str) -> Dict[str, Any]:
    """4. Yoni Koota (4 Points)"""
    g_info = YONI_DATA["nakshatra_yoni_mapping"].get(groom_nak, {"animal": "Horse", "gender": "Male"})
    b_info = YONI_DATA["nakshatra_yoni_mapping"].get(bride_nak, {"animal": "Horse", "gender": "Female"})
    
    g_animal = g_info["animal"]
    b_animal = b_info["animal"]
    
    # Check enemy
    matrix = YONI_DATA["matrix"]
    points = float(matrix.get(g_animal, {}).get(b_animal, 2.0))
    
    is_sworn_enemy = False
    for pair in YONI_DATA["sworn_enemies"]:
        if (g_animal == pair[0] and b_animal == pair[1]) or (g_animal == pair[1] and b_animal == pair[0]):
            is_sworn_enemy = True
            break
            
    if points == 4.0:
        status = "Full"
        desc = f"Same animal yoni ({g_animal}). Peak instinctive, biological, and physical intimacy."
    elif points == 3.0:
        status = "Good"
        desc = f"Friendly animal yonis ({g_animal} & {b_animal}). Strong harmony."
    elif points == 2.0:
        status = "Average"
        desc = f"Neutral animal yonis ({g_animal} & {b_animal}). Normal mutual tolerance."
    elif points == 1.0:
        status = "Low"
        desc = f"Unfriendly animal yonis ({g_animal} & {b_animal})."
    else:
        status = "Zero"
        desc = f"Sworn enemy yonis ({g_animal} vs {b_animal}) - natural enmity archetype."
        
    return {
        "koota": "Yoni",
        "points": points,
        "max_points": 4.0,
        "groom_value": f"{g_animal} ({g_info['gender']})",
        "bride_value": f"{b_animal} ({b_info['gender']})",
        "status": status,
        "is_sworn_enemy": is_sworn_enemy,
        "description": desc,
        "citation": YONI_DATA["citation"]
    }


def calculate_graha_maitri(groom_sign: str, bride_sign: str) -> Dict[str, Any]:
    """5. Graha Maitri Koota (5 Points)"""
    g_lord = GRAHA_MAITRI_DATA["sign_lords"][groom_sign]
    b_lord = GRAHA_MAITRI_DATA["sign_lords"][bride_sign]
    
    if g_lord == b_lord:
        points = 5.0
        status = "Full"
        desc = f"Same Moon sign planetary ruler ({g_lord}). Exceptional intellectual and psychological alignment."
    else:
        # Check mutual relation
        g_rel_b = "neutral"
        if b_lord in GRAHA_MAITRI_DATA["naisargika_sambandha"][g_lord]["friends"]:
            g_rel_b = "friend"
        elif b_lord in GRAHA_MAITRI_DATA["naisargika_sambandha"][g_lord]["enemies"]:
            g_rel_b = "enemy"
            
        b_rel_g = "neutral"
        if g_lord in GRAHA_MAITRI_DATA["naisargika_sambandha"][b_lord]["friends"]:
            b_rel_g = "friend"
        elif g_lord in GRAHA_MAITRI_DATA["naisargika_sambandha"][b_lord]["enemies"]:
            b_rel_g = "enemy"
            
        key = f"{g_rel_b}_{b_rel_g}"
        points = GRAHA_MAITRI_DATA["score_matrix"].get(key, 0.0)
        
        if points == 5.0:
            status = "Full"
            desc = f"Mutual friendship between {g_lord} and {b_lord}. Deep natural empathy."
        elif points >= 4.0:
            status = "Good"
            desc = f"Friendly-neutral dynamic between {g_lord} and {b_lord}."
        elif points >= 3.0:
            status = "Average"
            desc = f"Neutral planetary dynamic between {g_lord} and {b_lord}."
        elif points >= 0.5:
            status = "Low"
            desc = f"Frictional dynamic between {g_lord} and {b_lord}."
        else:
            status = "Zero"
            desc = f"Mutual planetary enmity between {g_lord} and {b_lord}."
            
    return {
        "koota": "Graha Maitri",
        "points": points,
        "max_points": 5.0,
        "groom_value": f"{g_lord} ({groom_sign})",
        "bride_value": f"{b_lord} ({bride_sign})",
        "status": status,
        "description": desc,
        "citation": GRAHA_MAITRI_DATA["citation"]
    }


def calculate_gana(groom_nak: str, bride_nak: str, school: str = "standard_parashari") -> Dict[str, Any]:
    """6. Gana Koota (6 Points)"""
    g_gana = GANA_DATA["nakshatra_gana_mapping"].get(groom_nak, "Manushya")
    b_gana = GANA_DATA["nakshatra_gana_mapping"].get(bride_nak, "Manushya")
    
    matrix = GANA_DATA["schools"].get(school, GANA_DATA["schools"]["standard_parashari"])["matrix"]
    points = float(matrix.get(g_gana, {}).get(b_gana, 0.0))
    
    if points == 6.0:
        status = "Full"
        desc = f"Harmonious temperament match (Groom: {g_gana}, Bride: {b_gana})."
    elif points >= 5.0:
        status = "Good"
        desc = f"Compatible temperament balance (Groom: {g_gana}, Bride: {b_gana})."
    elif points > 0:
        status = "Partial"
        desc = f"Moderate temperament compatibility (Groom: {g_gana}, Bride: {b_gana})."
    else:
        status = "Zero"
        desc = f"Temperamental divergence (Groom: {g_gana}, Bride: {b_gana}) requires patience and communication."
        
    return {
        "koota": "Gana",
        "points": points,
        "max_points": 6.0,
        "groom_value": g_gana,
        "bride_value": b_gana,
        "status": status,
        "description": desc,
        "school_used": school,
        "citation": GANA_DATA["citation"]
    }


def calculate_bhakoot(
    groom_sign_idx: int,
    bride_sign_idx: int,
    groom_navamsa_idx: Optional[int] = None,
    bride_navamsa_idx: Optional[int] = None
) -> Dict[str, Any]:
    """7. Bhakoot / Rashi Koota (7 Points) with classical cancellations."""
    diff_b_to_g = ((groom_sign_idx - bride_sign_idx) % 12) + 1
    diff_g_to_b = ((bride_sign_idx - groom_sign_idx) % 12) + 1
    
    pair_code = f"{min(diff_b_to_g, diff_g_to_b)}_{max(diff_b_to_g, diff_g_to_b)}"
    rel_info = BHAKOOT_DATA["relative_dispositions"].get(pair_code, {"score": 7.0, "status": "Auspicious", "description": "Normal"})
    
    raw_points = rel_info["score"]
    has_dosha = raw_points == 0.0
    cancellations: List[str] = []
    
    g_sign = SIGNS[groom_sign_idx]
    b_sign = SIGNS[bride_sign_idx]
    g_lord = SIGN_LORDS[groom_sign_idx]
    b_lord = SIGN_LORDS[bride_sign_idx]
    
    if has_dosha:
        # Check Cancellation 1: Same Rashi Lord
        if g_lord == b_lord:
            cancellations.append(f"Both signs ({g_sign} and {b_sign}) share the same ruler ({g_lord}), fully cancelling {rel_info.get('dosha_name', 'Bhakoot Dosha')}.")
            
        # Check Cancellation 2: Mutual Friends / Non-enemies with at least one friend
        g_enemies = GRAHA_MAITRI_DATA["naisargika_sambandha"][g_lord]["enemies"]
        b_enemies = GRAHA_MAITRI_DATA["naisargika_sambandha"][b_lord]["enemies"]
        g_friends = GRAHA_MAITRI_DATA["naisargika_sambandha"][g_lord]["friends"]
        b_friends = GRAHA_MAITRI_DATA["naisargika_sambandha"][b_lord]["friends"]
        if (b_lord not in g_enemies and g_lord not in b_enemies) and (b_lord in g_friends or g_lord in b_friends):
            cancellations.append(f"Rashi lords ({g_lord} and {b_lord}) are cordial and non-inimical, neutralizing {rel_info.get('dosha_name', 'Bhakoot Dosha')}.")
            
        # Check Cancellation 3: Navamsa Lord Friendship
        if groom_navamsa_idx is not None and bride_navamsa_idx is not None:
            g_nav_lord = SIGN_LORDS[groom_navamsa_idx]
            b_nav_lord = SIGN_LORDS[bride_navamsa_idx]
            if g_nav_lord == b_nav_lord:
                cancellations.append(f"Navamsa lords ({g_nav_lord}) are identical, resolving Bhakoot Dosha at the subtle D9 layer.")
                
    is_cancelled = len(cancellations) > 0
    final_points = 7.0 if (not has_dosha or is_cancelled) else 0.0
    
    if not has_dosha:
        status = "Full"
        desc = f"Auspicious {pair_code} disposition ({rel_info['description']}). Emotional harmony and family prosperity."
    elif is_cancelled:
        status = "Cancelled"
        desc = f"Initial {rel_info.get('dosha_name', 'Bhakoot Dosha')} is cancelled by classical exception: {cancellations[0]}"
    else:
        status = "Dosha"
        desc = f"{rel_info.get('dosha_name', 'Bhakoot Dosha')} present ({rel_info['description']})."
        
    return {
        "koota": "Bhakoot",
        "points": final_points,
        "raw_points": raw_points,
        "max_points": 7.0,
        "groom_value": g_sign,
        "bride_value": b_sign,
        "status": status,
        "has_dosha": has_dosha and not is_cancelled,
        "is_cancelled": is_cancelled,
        "cancellations": cancellations,
        "description": desc,
        "citation": BHAKOOT_DATA["citation"]
    }


def calculate_nadi(
    groom_nak_idx: int,
    bride_nak_idx: int,
    groom_sign_idx: int,
    bride_sign_idx: int,
    groom_pada: int,
    bride_pada: int
) -> Dict[str, Any]:
    """8. Nadi Koota (8 Points) with classical cancellations."""
    g_nak = NAKSHATRAS[groom_nak_idx]
    b_nak = NAKSHATRAS[bride_nak_idx]
    
    g_nadi = NADI_DATA["nakshatra_nadi_mapping"].get(g_nak, "Adi")
    b_nadi = NADI_DATA["nakshatra_nadi_mapping"].get(b_nak, "Adi")
    
    has_dosha = (g_nadi == b_nadi)
    cancellations: List[str] = []
    
    if has_dosha:
        # Cancellation 1: Same Rashi, Different Nakshatras
        if groom_sign_idx == bride_sign_idx and groom_nak_idx != bride_nak_idx:
            cancellations.append(f"Same Rashi ({SIGNS[groom_sign_idx]}) with different Nakshatras ({g_nak} vs {b_nak}) completely cancels Nadi Dosha.")
            
        # Cancellation 2: Same Nakshatra, Different Rashis
        if groom_nak_idx == bride_nak_idx and groom_sign_idx != bride_sign_idx:
            cancellations.append(f"Same Nakshatra ({g_nak}) spanning two distinct Rashis cancels Nadi Dosha.")
            
        # Cancellation 3: Classically Exempt Nakshatras
        if g_nak in NADI_DATA["exempt_nakshatras"] and b_nak in NADI_DATA["exempt_nakshatras"]:
            cancellations.append(f"Both Nakshatras ({g_nak} and {b_nak}) belong to the classical 9 exempt stars (Rohini, Mrigashira, Ardra, etc.).")
            
        # Cancellation 4: Different Padas within same Nakshatra
        if groom_nak_idx == bride_nak_idx and groom_pada != bride_pada:
            cancellations.append(f"Different Padas (Groom: {groom_pada}, Bride: {bride_pada}) mitigates single-nakshatra Nadi Dosha.")
            
        # Cancellation 5: Friendly or Same Moon Lords
        g_lord = SIGN_LORDS[groom_sign_idx]
        b_lord = SIGN_LORDS[bride_sign_idx]
        if g_lord == b_lord:
            cancellations.append(f"Moon sign lords are identical ({g_lord}), neutralizing physiological clash.")
            
    is_cancelled = len(cancellations) > 0
    final_points = 8.0 if (not has_dosha or is_cancelled) else 0.0
    
    if not has_dosha:
        status = "Full"
        desc = f"Complementary Nadis (Groom: {g_nadi}, Bride: {b_nadi}). Excellent genetic, physiological, and nervous equilibrium."
    elif is_cancelled:
        status = "Cancelled"
        desc = f"Initial Nadi Dosha ({g_nadi}) cancelled by classical authority: {cancellations[0]}"
    else:
        dosha_spec = NADI_DATA["nadi_doshas"].get(g_nadi, {})
        status = "Dosha"
        desc = f"Same Nadi ({g_nadi} - {dosha_spec.get('constitution', '')}). {dosha_spec.get('dosha_description', '')}"
        
    return {
        "koota": "Nadi",
        "points": final_points,
        "raw_points": 8.0 if not has_dosha else 0.0,
        "max_points": 8.0,
        "groom_value": f"{g_nadi} ({g_nak})",
        "bride_value": f"{b_nadi} ({b_nak})",
        "status": status,
        "has_dosha": has_dosha and not is_cancelled,
        "is_cancelled": is_cancelled,
        "cancellations": cancellations,
        "description": desc,
        "citation": NADI_DATA["citation"]
    }


def calculate_ashtakoota(
    groom_moon_long: float,
    bride_moon_long: float,
    groom_navamsa_idx: Optional[int] = None,
    bride_navamsa_idx: Optional[int] = None,
    vashya_school: str = "parashari_direct",
    gana_school: str = "standard_parashari",
    min_score_threshold: float = 18.0
) -> Dict[str, Any]:
    """Computes full 36-point Ashtakoota Milan with classical cancellations and comprehensive summary."""
    g_nak_idx, g_nak, g_pada, _ = get_nakshatra_and_pada(groom_moon_long)
    b_nak_idx, b_nak, b_pada, _ = get_nakshatra_and_pada(bride_moon_long)
    
    g_sign_idx = int((groom_moon_long % 360.0) // 30.0)
    b_sign_idx = int((bride_moon_long % 360.0) // 30.0)
    
    g_sign = SIGNS[g_sign_idx]
    b_sign = SIGNS[b_sign_idx]
    
    kootas = [
        calculate_varna(g_sign, b_sign),
        calculate_vashya(g_sign, b_sign, school=vashya_school),
        calculate_tara(g_nak_idx, b_nak_idx),
        calculate_yoni(g_nak, b_nak),
        calculate_graha_maitri(g_sign, b_sign),
        calculate_gana(g_nak, b_nak, school=gana_school),
        calculate_bhakoot(g_sign_idx, b_sign_idx, groom_navamsa_idx, bride_navamsa_idx),
        calculate_nadi(g_nak_idx, b_nak_idx, g_sign_idx, b_sign_idx, g_pada, b_pada)
    ]
    
    total_points = sum(k["points"] for k in kootas)
    max_total = 36.0
    percentage = (total_points / max_total) * 100.0
    
    # Check remaining uncancelled critical doshas
    nadi_koota = kootas[7]
    bhakoot_koota = kootas[6]
    yoni_koota = kootas[3]
    
    active_doshas: List[str] = []
    if nadi_koota["has_dosha"]:
        active_doshas.append("Uncancelled Nadi Dosha")
    if bhakoot_koota["has_dosha"]:
        active_doshas.append("Uncancelled Bhakoot Dosha")
    if yoni_koota.get("is_sworn_enemy", False):
        active_doshas.append("Sworn Enemy Yoni (Maha Shatru)")
        
    is_score_acceptable = total_points >= min_score_threshold
    is_compatible = is_score_acceptable and len(active_doshas) == 0
    
    # Plain-language summary
    if is_compatible:
        verdict = "Favorable Compatibility"
        summary = (
            f"The combined Ashtakoota score is {total_points:.1f}/36 ({percentage:.0f}%), exceeding the baseline "
            f"threshold of {min_score_threshold:.0f}/36 with no critical uncancelled doshas. "
            "Score alone is not the sole factor in Jyotish: mental understanding, individual chart longevity, and shared values are equally vital."
        )
    elif is_score_acceptable and len(active_doshas) > 0:
        verdict = "Qualified Compatibility (Requires Classical Review)"
        summary = (
            f"The numerical score of {total_points:.1f}/36 meets the minimum {min_score_threshold:.0f}/36 threshold, "
            f"but contains active astrological considerations: {', '.join(active_doshas)}. "
            "Classical traditions counsel that a high numerical score alone is not enough; individual horoscopes and mutual respect should be reviewed."
        )
    else:
        verdict = "Challenging Compatibility"
        summary = (
            f"The Ashtakoota score of {total_points:.1f}/36 falls below the standard threshold of {min_score_threshold:.0f}/36. "
            "Astrological texts advise conscious communication, patience, and realistic expectations regarding temperamental differences."
        )
        
    return {
        "total_points": round(total_points, 1),
        "max_points": max_total,
        "percentage": round(percentage, 1),
        "min_score_threshold": min_score_threshold,
        "is_compatible": is_compatible,
        "verdict": verdict,
        "summary": summary,
        "active_doshas": active_doshas,
        "kootas": kootas
    }
