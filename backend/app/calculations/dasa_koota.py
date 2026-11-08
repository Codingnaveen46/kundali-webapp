"""Dasa Koota (10 Poruthams) South Indian matching system."""

from typing import Dict, List, Any
import json
import os

from .constants import SIGNS, SIGN_LORDS, NAKSHATRAS
from .ephemeris import get_nakshatra_and_pada

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
KOOTA_DIR = os.path.join(CURRENT_DIR, "koota_data")


def load_dasa_data() -> Dict[str, Any]:
    with open(os.path.join(KOOTA_DIR, "dasa_koota.json"), "r", encoding="utf-8") as f:
        return json.load(f)


DASA_DATA = load_dasa_data()


def calculate_dasa_koota(
    groom_moon_long: float,
    bride_moon_long: float
) -> Dict[str, Any]:
    """Calculates all 10 Poruthams in the South Indian Jyotish tradition."""
    g_nak_idx, g_nak, _, _ = get_nakshatra_and_pada(groom_moon_long)
    b_nak_idx, b_nak, _, _ = get_nakshatra_and_pada(bride_moon_long)
    
    g_sign_idx = int((groom_moon_long % 360.0) // 30.0)
    b_sign_idx = int((bride_moon_long % 360.0) // 30.0)
    
    poruthams: List[Dict[str, Any]] = []
    
    # 1. Dina Porutham (Health & Longevity)
    # Count from Bride's star to Groom's star mod 9: 2, 4, 6, 8, 9 are good
    count_b_to_g = ((g_nak_idx - b_nak_idx) % 27) + 1
    rem9 = count_b_to_g % 9
    dina_match = rem9 in (2, 4, 6, 8, 0)  # 0 is 9th
    poruthams.append({
        "name": "Dina Porutham",
        "dimension": "Physical Health & Prosperity",
        "is_compatible": dina_match,
        "rating": "Uthama (Favorable)" if dina_match else "Adhama (Unfavorable)",
        "explanation": f"Nakshatra count from Bride to Groom is {count_b_to_g} (Tara {9 if rem9 == 0 else rem9})."
    })
    
    # 2. Gana Porutham (Temperament)
    gana_map = {
        "Deva": ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Swati", "Anuradha", "Shravana", "Revati"],
        "Manushya": ["Bharani", "Rohini", "Ardra", "Purva Phalguni", "Uttara Phalguni", "Purva Ashadha", "Uttara Ashadha", "Purva Bhadrapada", "Uttara Bhadrapada"],
        "Rakshasa": ["Krittika", "Ashlesha", "Magha", "Chitra", "Vishakha", "Jyeshtha", "Mula", "Dhanishta", "Shatabhisha"]
    }
    g_gana = next((g for g, naks in gana_map.items() if g_nak in naks), "Manushya")
    b_gana = next((g for g, naks in gana_map.items() if b_nak in naks), "Manushya")
    gana_match = (g_gana == b_gana) or (g_gana == "Deva" and b_gana == "Manushya") or (g_gana == "Manushya" and b_gana == "Deva")
    poruthams.append({
        "name": "Gana Porutham",
        "dimension": "Temperamental Compatibility",
        "is_compatible": gana_match,
        "rating": "Uthama" if gana_match else "Adhama",
        "explanation": f"Groom Gana: {g_gana}, Bride Gana: {b_gana}."
    })
    
    # 3. Mahendra Porutham (Progeny & Lineage)
    # Count from Bride to Groom should be 4, 7, 10, 13, 16, 19, 22, 25
    mahendra_auspicious = [4, 7, 10, 13, 16, 19, 22, 25]
    mahendra_match = count_b_to_g in mahendra_auspicious
    poruthams.append({
        "name": "Mahendra Porutham",
        "dimension": "Lineage, Family Growth & Wealth",
        "is_compatible": mahendra_match,
        "rating": "Uthama" if mahendra_match else "Madhyama (Neutral)",
        "explanation": f"Star count from Bride is {count_b_to_g} ({'matches classical Mahendra stations' if mahendra_match else 'neutral'})."
    })
    
    # 4. Stree Deergha Porutham (Bride's Longevity & Comfort)
    # Count from Bride to Groom > 7, ideally > 13
    stree_match = count_b_to_g > 13
    stree_rating = "Uthama" if count_b_to_g > 13 else ("Madhyama" if count_b_to_g > 7 else "Adhama")
    poruthams.append({
        "name": "Stree Deergha Porutham",
        "dimension": "Wellbeing and Longevity of the Wife",
        "is_compatible": count_b_to_g > 7,
        "rating": stree_rating,
        "explanation": f"Star distance from Bride is {count_b_to_g} lunar mansions."
    })
    
    # 5. Yoni Porutham (Physical Affinity)
    # No enemy pairs
    from .ashtakoota import calculate_yoni
    yoni_res = calculate_yoni(g_nak, b_nak)
    yoni_match = not yoni_res.get("is_sworn_enemy", False) and yoni_res["points"] >= 2.0
    poruthams.append({
        "name": "Yoni Porutham",
        "dimension": "Mutual Attraction and Biological Harmony",
        "is_compatible": yoni_match,
        "rating": "Uthama" if yoni_res["points"] >= 3 else ("Madhyama" if yoni_match else "Adhama"),
        "explanation": f"{yoni_res['groom_value']} & {yoni_res['bride_value']} ({yoni_res['description']})."
    })
    
    # 6. Rasi Porutham (Family Continuation & Unity)
    # Moon sign distance from Bride to Groom
    rasi_diff = ((g_sign_idx - b_sign_idx) % 12) + 1
    rasi_match = rasi_diff not in (2, 5, 6, 8, 12)
    poruthams.append({
        "name": "Rasi Porutham",
        "dimension": "Domestic Harmony & Family Lineage",
        "is_compatible": rasi_match,
        "rating": "Uthama" if rasi_match else "Adhama",
        "explanation": f"Distance is {rasi_diff} houses ({'Favorable relative signs' if rasi_match else 'Challenging relative disposition'})."
    })
    
    # 7. Rasyadhipathi Porutham (Lordship Alignment)
    from .ashtakoota import calculate_graha_maitri
    gm_res = calculate_graha_maitri(SIGNS[g_sign_idx], SIGNS[b_sign_idx])
    rasya_match = gm_res["points"] >= 3.0
    poruthams.append({
        "name": "Rasyadhipathi Porutham",
        "dimension": "Mental Friendship between Sign Rulers",
        "is_compatible": rasya_match,
        "rating": "Uthama" if gm_res["points"] >= 4 else ("Madhyama" if rasya_match else "Adhama"),
        "explanation": gm_res["description"]
    })
    
    # 8. Vashya Porutham (Mutual Affection)
    from .ashtakoota import calculate_vashya
    vash_res = calculate_vashya(SIGNS[g_sign_idx], SIGNS[b_sign_idx])
    vashya_match = vash_res["points"] > 0
    poruthams.append({
        "name": "Vashya Porutham",
        "dimension": "Mutual Fascination & Psychological Magnetism",
        "is_compatible": vashya_match,
        "rating": "Uthama" if vash_res["points"] == 2 else ("Madhyama" if vashya_match else "Adhama"),
        "explanation": vash_res["description"]
    })
    
    # 9. Rajju Porutham (Mangalya / Lifespan of Marital Bond - CRITICAL)
    g_rajju = None
    b_rajju = None
    for r_name, r_info in DASA_DATA["rajju_types"].items():
        if g_nak in r_info["nakshatras"]:
            g_rajju = r_name
        if b_nak in r_info["nakshatras"]:
            b_rajju = r_name
            
    rajju_match = (g_rajju != b_rajju)
    rajju_impact = DASA_DATA["rajju_types"].get(g_rajju, {}).get("impact", "")
    poruthams.append({
        "name": "Rajju Porutham",
        "dimension": "Marital Longevity and Bond Strength (Critical)",
        "is_compatible": rajju_match,
        "rating": "Uthama (No Rajju Dosha)" if rajju_match else f"Adhama ({g_rajju} Rajju Dosha)",
        "explanation": "Different Rajjus; excellent marital protection." if rajju_match else f"Same {g_rajju} Rajju ({rajju_impact})."
    })
    
    # 10. Vedha Porutham (Affliction Immunity - CRITICAL)
    is_vedha = False
    for pair in DASA_DATA["vedha_pairs"]:
        if (g_nak == pair[0] and b_nak == pair[1]) or (g_nak == pair[1] and b_nak == pair[0]):
            is_vedha = True
            break
            
    vedha_match = not is_vedha
    poruthams.append({
        "name": "Vedha Porutham",
        "dimension": "Absence of Star Repulsion / Affliction (Critical)",
        "is_compatible": vedha_match,
        "rating": "Uthama (No Vedha)" if vedha_match else "Adhama (Vedha Present)",
        "explanation": "No star repulsion exists between partners." if vedha_match else f"Vedha (mutual affliction) between {g_nak} and {b_nak}."
    })
    
    compatible_count = sum(1 for p in poruthams if p["is_compatible"])
    
    return {
        "poruthams_matched": compatible_count,
        "total_poruthams": 10,
        "rajju_matched": rajju_match,
        "vedha_matched": vedha_match,
        "summary": f"{compatible_count} out of 10 Poruthams agree. Rajju: {'Approved' if rajju_match else 'Dosha present'}, Vedha: {'Approved' if vedha_match else 'Afflicted'}.",
        "poruthams": poruthams
    }
