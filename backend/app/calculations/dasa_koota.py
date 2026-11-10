"""Dasa Koota (10 Poruthams) South Indian matching system with strict Pass/Fail/Conditional grading."""

from typing import Dict, List, Any, Optional
import json
import os

from .constants import SIGNS, SIGN_LORDS, NAKSHATRAS
from .ephemeris import get_nakshatra_and_pada
from .ashtakoota import calculate_graha_maitri, is_cancellation_rule_enabled, GRAHA_MAITRI_DATA

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
KOOTA_DIR = os.path.join(CURRENT_DIR, "koota_data")


def load_dasa_rules() -> Dict[str, Any]:
    with open(os.path.join(KOOTA_DIR, "dasa_koota_rules.json"), "r", encoding="utf-8") as f:
        return json.load(f)


DASA_RULES = load_dasa_rules()
RULES = DASA_RULES["rules"]


def calculate_dasa_koota(
    groom_moon_long: float,
    bride_moon_long: float,
    cancellation_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Calculates all 10 Poruthams with explicit Pass/Fail/Conditional statuses, count/distance, rules, and sources."""
    g_nak_idx, g_nak, _, _ = get_nakshatra_and_pada(groom_moon_long)
    b_nak_idx, b_nak, _, _ = get_nakshatra_and_pada(bride_moon_long)
    
    g_sign_idx = int((groom_moon_long % 360.0) // 30.0)
    b_sign_idx = int((bride_moon_long % 360.0) // 30.0)
    
    poruthams: List[Dict[str, Any]] = []
    
    # 1. Dina Porutham (Health & Longevity)
    count_b_to_g = ((g_nak_idx - b_nak_idx) % 27) + 1
    rem9 = count_b_to_g % 9
    dina_rule = RULES["dina"]
    
    # Rule strictly applied: remainder in 2, 4, 6, 8, 0 passes; 1, 3, 5, 7 fails.
    # Paryaya exemption removed as unverified.
    is_dina_pass = rem9 in (2, 4, 6, 8, 0)
    dina_status = "Pass" if is_dina_pass else "Fail"
    dina_result = "pass" if is_dina_pass else "does not pass"
    dina_rating = "Pass (Uthama)" if is_dina_pass else "Fail (Adhama)"
        
    tara_name_map = {1: "Janma", 2: "Sampat", 3: "Vipat", 4: "Kshema", 5: "Pratyak", 6: "Sadhana", 7: "Naidhana", 8: "Mitra", 0: "Paramamitra"}
    tara_name = tara_name_map[rem9]

    dina_working_str = f"Dina count {count_b_to_g}, {count_b_to_g} mod 9 = {rem9} -> {dina_result}"
    dina_working = {
        "counts": {"count_bride_to_groom": count_b_to_g, "remainder": rem9, "tara_name": tara_name},
        "rule": "Count from bride's star to groom's star, divide by 9. Remainder 2, 4, 6, 8, 0 pass; 1, 3, 5, 7 fail.",
        "result": dina_result,
        "working_str": dina_working_str,
        "explanation": f"Count from Bride's star ({b_nak}) to Groom's star ({g_nak}) is {count_b_to_g}. Divided by 9, remainder is {rem9} ({tara_name} Tara) -> {dina_result}."
    }

    poruthams.append({
        "name": "Dina Porutham",
        "dimension": dina_rule["dimension"],
        "status": dina_status,
        "result": dina_result,
        "is_compatible": is_dina_pass,
        "rating": dina_rating,
        "count": count_b_to_g,
        "remainder": rem9,
        "tara_name": tara_name,
        "count_or_distance": f"Count: {count_b_to_g}, Remainder: {rem9} ({tara_name} Tara)",
        "rule": "Count from bride's star to groom's star, divide by 9. Remainder 2, 4, 6, 8, 0 pass; 1, 3, 5, 7 fail.",
        "source": "Source: unverified, traditions differ.",
        "working": dina_working,
        "explanation": f"Count from Bride's star ({b_nak}) to Groom's star ({g_nak}) is {count_b_to_g}. Divided by 9, remainder is {rem9} ({tara_name} Tara) -> {dina_result}."
    })
    
    # 2. Gana Porutham (Temperament)
    gana_map = {
        "Deva": ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Swati", "Anuradha", "Shravana", "Revati"],
        "Manushya": ["Bharani", "Rohini", "Ardra", "Purva Phalguni", "Uttara Phalguni", "Purva Ashadha", "Uttara Ashadha", "Purva Bhadrapada", "Uttara Bhadrapada"],
        "Rakshasa": ["Krittika", "Ashlesha", "Magha", "Chitra", "Vishakha", "Jyeshtha", "Mula", "Dhanishta", "Shatabhisha"]
    }
    g_gana = next((g for g, naks in gana_map.items() if g_nak in naks), "Manushya")
    b_gana = next((g for g, naks in gana_map.items() if b_nak in naks), "Manushya")
    gana_rule = RULES["gana"]
    
    if g_gana == b_gana or (g_gana == "Deva" and b_gana == "Manushya"):
        gana_status = "Pass"
        gana_result = "pass"
        gana_rating = "Uthama (Pass)"
    elif g_gana == "Manushya" and b_gana == "Deva":
        gana_status = "Conditional"
        gana_result = "conditional"
        gana_rating = "Madhyama (Conditional)"
    else:
        gana_status = "Fail"
        gana_result = "does not pass"
        gana_rating = "Adhama (Fail)"

    gana_working_str = f"Groom {g_nak} ({g_gana}) vs Bride {b_nak} ({b_gana}) -> {gana_result}"
    gana_working = {
        "counts": {"groom_gana": g_gana, "bride_gana": b_gana},
        "rule": gana_rule["rule"],
        "result": gana_result,
        "working_str": gana_working_str,
        "explanation": f"Groom temperament archetype is {g_gana}; Bride temperament archetype is {b_gana} -> {gana_result}."
    }

    poruthams.append({
        "name": "Gana Porutham",
        "dimension": gana_rule["dimension"],
        "status": gana_status,
        "result": gana_result,
        "is_compatible": gana_status in ("Pass", "Conditional"),
        "rating": gana_rating,
        "count_or_distance": f"Groom: {g_gana}, Bride: {b_gana}",
        "rule": gana_rule["rule"],
        "source": gana_rule["citation"],
        "working": gana_working,
        "explanation": f"Groom temperament archetype is {g_gana}; Bride temperament archetype is {b_gana}."
    })
    
    # 3. Mahendra Porutham (Progeny & Lineage)
    mahendra_rule = RULES["mahendra"]
    mahendra_match = count_b_to_g in mahendra_rule["auspicious_counts"]
    mahendra_status = "Pass" if mahendra_match else "Fail"
    mahendra_result = "pass" if mahendra_match else "does not pass"
    mahendra_rating = "Uthama (Pass)" if mahendra_match else "Adhama (Fail - Not satisfied)"

    mahendra_working_str = f"Mahendra {count_b_to_g} {'in' if mahendra_match else 'not in'} {{4,7,10,13,16,19,22,25}} -> {mahendra_result}"
    mahendra_working = {
        "counts": {"count_bride_to_groom": count_b_to_g, "auspicious_counts": mahendra_rule["auspicious_counts"]},
        "rule": "Star count from bride must be in {4, 7, 10, 13, 16, 19, 22, 25}.",
        "result": mahendra_result,
        "working_str": mahendra_working_str,
        "explanation": f"Star count from Bride is {count_b_to_g}. " + ("Matches Mahendra station (4, 7, 10, 13, 16, 19, 22, 25) -> pass." if mahendra_match else "Not one of the 8 required Mahendra stations -> does not pass.")
    }

    poruthams.append({
        "name": "Mahendra Porutham",
        "dimension": mahendra_rule["dimension"],
        "status": mahendra_status,
        "result": mahendra_result,
        "is_compatible": mahendra_match,
        "rating": mahendra_rating,
        "count_or_distance": f"Nakshatra count: {count_b_to_g} from Bride",
        "rule": mahendra_rule["rule"],
        "source": mahendra_rule["citation"],
        "working": mahendra_working,
        "explanation": f"Star count from Bride is {count_b_to_g}. " + ("Matches Mahendra station (4, 7, 10, 13, 16, 19, 22, 25)." if mahendra_match else "Not one of the 8 required Mahendra stations.")
    })
    
    # 4. Stree Deergha Porutham (Wife's Wellbeing & Longevity)
    stree_rule = RULES["stree_deergha"]
    if count_b_to_g > 13:
        stree_status = "Pass"
        stree_result = "pass"
        stree_rating = "Uthama (Pass - Distance > 13)"
        stree_working_str = f"Stree Deergha {count_b_to_g} > 13 -> pass"
    elif count_b_to_g >= 8:
        stree_status = "Conditional"
        stree_result = "conditional"
        stree_rating = "Madhyama (Conditional - Distance 8-13)"
        stree_working_str = f"Stree Deergha {count_b_to_g} in 8..13 -> conditional"
    else:
        stree_status = "Fail"
        stree_result = "does not pass"
        stree_rating = "Adhama (Fail - Distance <= 7)"
        stree_working_str = f"Stree Deergha {count_b_to_g} <= 7 -> does not pass"

    stree_working = {
        "counts": {"count_bride_to_groom": count_b_to_g},
        "rule": "Count from bride's star to groom's star > 13 passes (Uthama); 8 to 13 conditional; <= 7 does not pass.",
        "result": stree_result,
        "working_str": stree_working_str,
        "explanation": f"Star distance from Bride is {count_b_to_g} nakshatras (Threshold: >13 Pass, 8-13 Conditional, <=7 Fail)."
    }

    poruthams.append({
        "name": "Stree Deergha Porutham",
        "dimension": stree_rule["dimension"],
        "status": stree_status,
        "result": stree_result,
        "is_compatible": stree_status in ("Pass", "Conditional"),
        "rating": stree_rating,
        "count_or_distance": f"Nakshatra distance: {count_b_to_g} lunar mansions",
        "rule": stree_rule["rule"],
        "source": stree_rule["citation"],
        "threshold_used": "> 13 Pass (Uthama), 8-13 Conditional (Madhyama), <= 7 Fail (Adhama)",
        "working": stree_working,
        "explanation": f"Star distance from Bride is {count_b_to_g} nakshatras (Threshold: >13 Pass, 8-13 Conditional, <=7 Fail)."
    })
    
    # 5. Yoni Porutham (Physical Affinity)
    from .ashtakoota import calculate_yoni
    yoni_res = calculate_yoni(g_nak, b_nak)
    yoni_rule = RULES["yoni"]
    is_enemy = yoni_res.get("is_sworn_enemy", False)
    
    if is_enemy:
        yoni_status = "Fail"
        yoni_result = "does not pass"
        yoni_rating = "Adhama (Fail - Sworn Enemies)"
    elif yoni_res["points"] >= 3.0:
        yoni_status = "Pass"
        yoni_result = "pass"
        yoni_rating = "Uthama (Pass)"
    elif yoni_res["points"] >= 2.0:
        yoni_status = "Conditional"
        yoni_result = "conditional"
        yoni_rating = "Madhyama (Conditional)"
    else:
        yoni_status = "Fail"
        yoni_result = "does not pass"
        yoni_rating = "Adhama (Fail)"

    yoni_working_str = f"Yoni {yoni_res['status'].lower()} (score {yoni_res['points']}/4.0) -> {yoni_result}"
    yoni_working = {
        "counts": {"points": yoni_res["points"], "max_points": 4.0},
        "rule": yoni_rule["rule"],
        "result": yoni_result,
        "working_str": yoni_working_str,
        "explanation": f"Score: {yoni_res['points']}/4.0. {yoni_res['description']}"
    }

    poruthams.append({
        "name": "Yoni Porutham",
        "dimension": yoni_rule["dimension"],
        "status": yoni_status,
        "result": yoni_result,
        "is_compatible": yoni_status in ("Pass", "Conditional"),
        "rating": yoni_rating,
        "count_or_distance": f"Groom: {yoni_res['groom_value']}, Bride: {yoni_res['bride_value']}",
        "gender_status": "unverified",
        "rule": yoni_rule["rule"],
        "source": yoni_rule["citation"],
        "working": yoni_working,
        "explanation": f"Score: {yoni_res['points']}/4.0. {yoni_res['description']}"
    })
    
    # 6. Rasi Porutham (Domestic Harmony & Lineage)
    count_b_to_g = ((g_sign_idx - b_sign_idx) % 12) + 1
    count_g_to_b = ((b_sign_idx - g_sign_idx) % 12) + 1
    disposition = f"{count_b_to_g}/{count_g_to_b}"
    rasi_rule = RULES["rasi"]
    
    g_lord = SIGN_LORDS[g_sign_idx]
    b_lord = SIGN_LORDS[b_sign_idx]
    
    # Calculate Graha Maitri between Moon sign lords for consistency
    gm_res = calculate_graha_maitri(SIGNS[g_sign_idx], SIGNS[b_sign_idx])
    lord_relationship = gm_res["relationship"]  # "same lord", "mutual friends", "friend/neutral", etc.
    mitigation_rule_enabled = is_cancellation_rule_enabled("RASI_PORUTHAM_FRIENDLY_LORDS_MITIGATION", cancellation_config)
    
    # Evaluate Rasi Porutham with convention sensitivity and configurable mitigation
    mitigation_note = None
    if count_b_to_g == 7:
        rasi_status = "Pass"
        rasi_result = "pass"
        rasi_rating = "Pass (Uthama - Sama Saptaka)"
        pass_fail_reason = "Pass: 7/7 (Sama-Saptaka) passes under the count rule used here (unverified; traditions differ)."
    elif count_b_to_g in (3, 4, 10, 11):
        rasi_status = "Pass"
        rasi_result = "pass"
        rasi_rating = "Pass (Uthama)"
        pass_fail_reason = f"Pass: {disposition} disposition passes under the count rule used here (unverified; traditions differ)."
    elif count_b_to_g == 1:
        if g_nak_idx != b_nak_idx:
            rasi_status = "Pass"
            rasi_result = "pass"
            rasi_rating = "Pass (Uthama - Same Sign, Different Star)"
            pass_fail_reason = "Pass: Same Moon sign (1/1) with different Nakshatras passes under the count rule used here (unverified; traditions differ)."
        else:
            rasi_status = "Conditional"
            rasi_result = "conditional"
            rasi_rating = "Conditional (Madhyama - Same Star)"
            pass_fail_reason = "Conditional: Same sign (1/1) and same Nakshatra requires confirmation of different quarter padas by an astrologer."
    elif count_b_to_g in (6, 8):
        has_potential_mitigation = (g_lord == b_lord or lord_relationship in ("same lord", "mutual friends", "friend/neutral"))
        if has_potential_mitigation and mitigation_rule_enabled:
            rasi_status = "Conditional"
            rasi_result = "conditional"
            rasi_rating = "Conditional (Madhyama - Mitigated Shadashtaka)"
            pass_fail_reason = f"Conditional: 6/8 (Shadashtaka) mitigated by enabled rule (Moon sign rulers {g_lord} and {b_lord} are {lord_relationship})."
            mitigation_note = f"Mitigation rule enabled: lords are {lord_relationship}."
        else:
            rasi_status = "Fail"
            rasi_result = "does not pass"
            rasi_rating = "Fail (Adhama - Shadashtaka)"
            pass_fail_reason = f"Fail: 6/8 (Shadashtaka) does not pass under the count rule used here (unverified; traditions differ)."
            mitigation_note = f"possible mitigation: lords are {lord_relationship}; traditions differ" if has_potential_mitigation else None
    elif count_b_to_g in (5, 9):
        has_potential_mitigation = (g_lord == b_lord or lord_relationship in ("same lord", "mutual friends", "friend/neutral"))
        if has_potential_mitigation and mitigation_rule_enabled:
            rasi_status = "Conditional"
            rasi_result = "conditional"
            rasi_rating = "Conditional (Madhyama - Mitigated Navam-Pancham)"
            pass_fail_reason = f"Conditional: {disposition} (Navam-Pancham) mitigated by enabled rule (Moon sign rulers {g_lord} and {b_lord} are {lord_relationship})."
            mitigation_note = f"Mitigation rule enabled: lords are {lord_relationship}."
        elif count_b_to_g == 9:
            # Bride to Groom is 9th (Groom to Bride 5th): Convention difference
            # Convention 1 (discrete set {1, 3, 4, 7, 10, 11}) -> fail
            # Convention 2 ('beyond the 6th') -> pass (9 > 6)
            rasi_status = "Depends on convention"
            rasi_result = "depends on convention"
            rasi_rating = "Convention Dependent (9/5 Navam-Pancham)"
            pass_fail_reason = (
                f"Depends on convention: Bride->Groom {count_b_to_g}th (Groom->Bride {count_g_to_b}th) (9/5 Navam-Pancham). "
                "Convention 1 (discrete set {1, 3, 4, 7, 10, 11}) does not pass (9th fails). "
                "Convention 2 ('beyond the 6th') passes (9 > 6). Both conventions shown for astrologer review."
            )
            mitigation_note = f"possible mitigation: lords are {lord_relationship}; traditions differ" if has_potential_mitigation else None
        else:
            rasi_status = "Fail"
            rasi_result = "does not pass"
            rasi_rating = "Fail (Adhama - Navam-Pancham)"
            pass_fail_reason = f"Fail: {disposition} (Navam-Pancham: Bride to Groom {count_b_to_g}, Groom to Bride {count_g_to_b}) does not pass under the count rule used here (unverified; traditions differ)."
            mitigation_note = f"possible mitigation: lords are {lord_relationship}; traditions differ" if has_potential_mitigation else None
    elif count_b_to_g in (2, 12):
        has_potential_mitigation = (g_lord == b_lord or lord_relationship in ("same lord", "mutual friends", "friend/neutral"))
        if has_potential_mitigation and mitigation_rule_enabled:
            rasi_status = "Conditional"
            rasi_result = "conditional"
            rasi_rating = "Conditional (Madhyama - Mitigated Dwirdwadasha)"
            pass_fail_reason = f"Conditional: 2/12 (Dwirdwadasha) mitigated by enabled rule (Moon sign rulers {g_lord} and {b_lord} are {lord_relationship})."
            mitigation_note = f"Mitigation rule enabled: lords are {lord_relationship}."
        else:
            rasi_status = "Fail"
            rasi_result = "does not pass"
            rasi_rating = "Fail (Adhama - Dwirdwadasha)"
            pass_fail_reason = f"Fail: 2/12 (Dwirdwadasha) does not pass under the count rule used here (unverified; traditions differ)."
            mitigation_note = f"possible mitigation: lords are {lord_relationship}; traditions differ" if has_potential_mitigation else None
    else:
        rasi_status = "Fail"
        rasi_result = "does not pass"
        rasi_rating = "Fail (Adhama)"
        pass_fail_reason = f"Fail: {disposition} does not pass under the count rule used here (unverified; traditions differ)."

    rasi_working_str = f"Rasi bride->groom {count_b_to_g}th (groom->bride {count_g_to_b}th) -> {rasi_result} (show both conventions)"
    rasi_working = {
        "counts": {"count_bride_to_groom": count_b_to_g, "count_groom_to_bride": count_g_to_b, "disposition": disposition},
        "conventions": {
            "convention_1_discrete": "Pass if count in {1, 3, 4, 7, 10, 11}; fail otherwise",
            "convention_2_beyond_6th": "Pass if groom's sign counted from bride's is > 6 (beyond 6th)"
        },
        "rule": "Count from Bride's Moon sign to Groom's, and Groom to Bride. Convention 1: {1, 3, 4, 7, 10, 11} pass. Convention 2: groom sign beyond 6th passes.",
        "result": rasi_result,
        "working_str": rasi_working_str,
        "explanation": pass_fail_reason
    }

    poruthams.append({
        "name": "Rasi Porutham",
        "dimension": rasi_rule["dimension"],
        "status": rasi_status,
        "result": rasi_result,
        "is_compatible": rasi_status in ("Pass", "Conditional", "Depends on convention"),
        "rating": rasi_rating,
        "count_bride_to_groom": count_b_to_g,
        "count_groom_to_bride": count_g_to_b,
        "disposition": disposition,
        "mitigation_note": mitigation_note,
        "count_or_distance": f"Bride to Groom: {count_b_to_g} ({SIGNS[b_sign_idx]} to {SIGNS[g_sign_idx]}), Groom to Bride: {count_g_to_b} ({SIGNS[g_sign_idx]} to {SIGNS[b_sign_idx]}), Disposition: {disposition}",
        "rule": "Count from Bride's Moon sign to Groom's, and Groom to Bride. Convention 1: {1, 3, 4, 7, 10, 11} pass. Convention 2: groom sign beyond 6th passes.",
        "pass_fail_reason": pass_fail_reason,
        "source": "Source: unverified, traditions differ.",
        "working": rasi_working,
        "explanation": f"Sign count: Bride to Groom is {count_b_to_g}, Groom to Bride is {count_g_to_b} (Disposition {disposition}). {pass_fail_reason}" + (f" Note: {mitigation_note}." if mitigation_note else "")
    })
    
    # 7. Rasyadhipathi Porutham (Lordship Alignment)
    rasya_rule = RULES["rasyadhipathi"]
    if gm_res["points"] >= 4.0:
        rasya_status = "Pass"
        rasya_result = "pass"
        rasya_rating = "Pass (Uthama)"
        rasya_reason = f"Pass: Moon sign lords ({g_lord} and {b_lord}) are {lord_relationship}, scoring {gm_res['points']}/5.0 points."
    elif gm_res["points"] >= 3.0:
        rasya_status = "Conditional"
        rasya_result = "conditional"
        rasya_rating = "Conditional (Madhyama)"
        rasya_reason = f"Conditional: Moon sign lords ({g_lord} and {b_lord}) are {lord_relationship}, scoring {gm_res['points']}/5.0 points."
    else:
        rasya_status = "Fail"
        rasya_result = "does not pass"
        rasya_rating = "Fail (Adhama)"
        rasya_reason = f"Fail: Moon sign lords ({g_lord} and {b_lord}) are {lord_relationship}, scoring {gm_res['points']}/5.0 points."

    rasya_working_str = f"Rasyadhipathi {lord_relationship} -> {rasya_result}"
    rasya_working = {
        "counts": {"groom_lord": g_lord, "bride_lord": b_lord, "relationship": lord_relationship, "points": gm_res["points"]},
        "rule": "Planetary rulers of Groom and Bride Moon signs evaluated via natural friendship table (score out of 5.0). 4.0-5.0 Pass; 3.0 Conditional; <3.0 Fail.",
        "result": rasya_result,
        "working_str": rasya_working_str,
        "explanation": f"Score: {gm_res['points']}/5.0 points ({lord_relationship}). {rasya_reason}"
    }

    poruthams.append({
        "name": "Rasyadhipathi Porutham",
        "dimension": rasya_rule["dimension"],
        "status": rasya_status,
        "result": rasya_result,
        "is_compatible": rasya_status in ("Pass", "Conditional"),
        "rating": rasya_rating,
        "groom_lord": g_lord,
        "bride_lord": b_lord,
        "relationship": lord_relationship,
        "count_or_distance": f"Groom lord: {g_lord} ({SIGNS[g_sign_idx]}), Bride lord: {b_lord} ({SIGNS[b_sign_idx]}) — {lord_relationship} ({gm_res['points']}/5.0)",
        "rule": "Planetary rulers of Groom and Bride Moon signs evaluated via natural friendship table (score out of 5.0). 4.0-5.0 Pass; 3.0 Conditional; <3.0 Fail.",
        "pass_fail_reason": rasya_reason,
        "source": "Source: unverified, traditions differ.",
        "working": rasya_working,
        "explanation": f"Score: {gm_res['points']}/5.0 points ({lord_relationship}). {rasya_reason}"
    })
    
    # 8. Vashya Porutham (Mutual Affection)
    from .ashtakoota import calculate_vashya, VASHYA_DATA
    from .avakahada import get_vashya_category
    vash_res = calculate_vashya(SIGNS[g_sign_idx], SIGNS[b_sign_idx], school="category_matrix", groom_moon_long=groom_moon_long, bride_moon_long=bride_moon_long)
    vashya_rule = RULES["vashya"]
    
    g_cat = get_vashya_category(SIGNS[g_sign_idx], groom_moon_long)
    b_cat = get_vashya_category(SIGNS[b_sign_idx], bride_moon_long)
    
    if vash_res["points"] == 2.0:
        vashya_status = "Pass"
        vashya_result = "pass"
        vashya_rating = "Uthama (Pass)"
        vashya_reason = f"Pass: Groom sign {SIGNS[g_sign_idx]} ({g_cat}) and Bride sign {SIGNS[b_sign_idx]} ({b_cat}) yield full 2.0/2.0 points in the Vashya matrix."
    elif vash_res["points"] > 0.0:
        vashya_status = "Conditional"
        vashya_result = "conditional"
        vashya_rating = "Madhyama (Conditional)"
        vashya_reason = f"Conditional: Groom sign {SIGNS[g_sign_idx]} ({g_cat}) and Bride sign {SIGNS[b_sign_idx]} ({b_cat}) yield {vash_res['points']}/2.0 points in the Vashya matrix."
    else:
        vashya_status = "Fail"
        vashya_result = "does not pass"
        vashya_rating = "Adhama (Fail)"
        vashya_reason = f"Fail: Groom sign {SIGNS[g_sign_idx]} ({g_cat}) and Bride sign {SIGNS[b_sign_idx]} ({b_cat}) yield 0.0/2.0 points; the porutham does not pass (unverified; traditions differ)."

    vashya_working_str = f"Vashya conditional" if vashya_result == "conditional" else f"Vashya {vashya_result}"
    vashya_working = {
        "counts": {"score": vash_res["points"], "max_score": 2.0, "groom_category": g_cat, "bride_category": b_cat},
        "rule": "One sign must naturally exert classical Vashya over the other sign (Pass for 2.0 points, Conditional for 0.5-1.5 points, Fail for 0.0 points).",
        "result": vashya_result,
        "working_str": vashya_working_str,
        "explanation": vashya_reason
    }

    poruthams.append({
        "name": "Vashya Porutham",
        "dimension": vashya_rule["dimension"],
        "status": vashya_status,
        "result": vashya_result,
        "is_compatible": vashya_status in ("Pass", "Conditional"),
        "rating": vashya_rating,
        "groom_category": g_cat,
        "bride_category": b_cat,
        "count_bride_to_groom": count_b_to_g,
        "count_groom_to_bride": count_g_to_b,
        "count_or_distance": f"Groom: {SIGNS[g_sign_idx]} ({g_cat}), Bride: {SIGNS[b_sign_idx]} ({b_cat}) — Score {vash_res['points']}/2.0",
        "rule": "One sign must naturally exert classical Vashya over the other sign (Pass for 2.0 points, Conditional for 0.5-1.5 points, Fail for 0.0 points).",
        "pass_fail_reason": vashya_reason,
        "source": "Source: unverified, traditions differ.",
        "working": vashya_working,
        "explanation": vashya_reason
    })
    
    # 9. Rajju Porutham (Marital Longevity - CRITICAL)
    rajju_rule = RULES["rajju"]
    g_rajju = None
    b_rajju = None
    for r_name, r_info in rajju_rule["types"].items():
        if g_nak in r_info["stars"]:
            g_rajju = r_name
        if b_nak in r_info["stars"]:
            b_rajju = r_name
            
    rajju_match = (g_rajju != b_rajju)
    rajju_status = "Pass" if rajju_match else "Fail"
    rajju_result = "pass" if rajju_match else "does not pass"
    rajju_rating = "Uthama (Pass - No Rajju Dosha)" if rajju_match else f"Adhama (Fail - {g_rajju} Rajju Dosha)"
    g_rajju_impact = rajju_rule["types"].get(g_rajju, {}).get("impact", "")

    rajju_working_str = f"Rajju {('different (' + str(g_rajju) + ' vs ' + str(b_rajju) + ') -> pass') if rajju_match else ('both ' + str(g_rajju) + ' -> does not pass')}"
    rajju_working = {
        "counts": {"groom_rajju": g_rajju, "bride_rajju": b_rajju},
        "rule": rajju_rule["rule"],
        "result": rajju_result,
        "working_str": rajju_working_str,
        "explanation": "Different Rajjus pass (rule as stated; unverified; traditions differ)." if rajju_match else f"Same {g_rajju} Rajju does not pass (unverified; traditions differ)."
    }

    poruthams.append({
        "name": "Rajju Porutham",
        "dimension": rajju_rule["dimension"],
        "status": rajju_status,
        "result": rajju_result,
        "is_compatible": rajju_match,
        "rating": rajju_rating,
        "count_or_distance": f"Groom: {g_rajju} Rajju, Bride: {b_rajju} Rajju",
        "rule": rajju_rule["rule"],
        "source": rajju_rule["citation"],
        "working": rajju_working,
        "explanation": "Different Rajjus pass (rule as stated; unverified; traditions differ)." if rajju_match else f"Same {g_rajju} Rajju does not pass (unverified; traditions differ)."
    })
    
    # 10. Vedha Porutham (Affliction Immunity - CRITICAL)
    vedha_rule = RULES["vedha"]
    is_vedha = False
    for pair in vedha_rule["pairs"]:
        if (g_nak == pair[0] and b_nak == pair[1]) or (g_nak == pair[1] and b_nak == pair[0]):
            is_vedha = True
            break
            
    vedha_match = not is_vedha
    vedha_status = "Pass" if vedha_match else "Fail"
    vedha_result = "pass" if vedha_match else "does not pass"
    vedha_rating = "Uthama (Pass - No Vedha)" if vedha_match else f"Adhama (Fail - Vedha between {g_nak} and {b_nak})"

    vedha_working_str = "Vedha no clash -> pass" if vedha_match else f"Vedha clash between {g_nak} and {b_nak} -> does not pass"
    vedha_working = {
        "counts": {"is_vedha": is_vedha},
        "rule": vedha_rule["rule"],
        "result": vedha_result,
        "working_str": vedha_working_str,
        "explanation": "No Vedha pair from the rule set used here applies (unverified; traditions differ)." if vedha_match else f"Vedha pair between {g_nak} and {b_nak} present; does not pass (unverified; traditions differ)."
    }

    poruthams.append({
        "name": "Vedha Porutham",
        "dimension": vedha_rule["dimension"],
        "status": vedha_status,
        "result": vedha_result,
        "is_compatible": vedha_match,
        "rating": vedha_rating,
        "count_or_distance": f"Groom: {g_nak}, Bride: {b_nak}",
        "rule": vedha_rule["rule"],
        "source": vedha_rule["citation"],
        "working": vedha_working,
        "explanation": "No Vedha pair from the rule set used here applies (unverified; traditions differ)." if vedha_match else f"Vedha pair between {g_nak} and {b_nak} present; does not pass (unverified; traditions differ)."
    })
    
    # SEGREGATE: Failed poruthams listed ABOVE passed ones (Prompt C.2)
    failed_poruthams = [p for p in poruthams if p["status"] == "Fail" or p["result"] == "does not pass"]
    conditional_poruthams = [p for p in poruthams if p["status"] in ("Conditional", "Depends on convention") or p["result"] in ("conditional", "depends on convention")]
    passed_poruthams = [p for p in poruthams if (p["status"] == "Pass" or p["result"] == "pass") and p not in failed_poruthams and p not in conditional_poruthams]
    
    ordered_poruthams = failed_poruthams + conditional_poruthams + passed_poruthams
    
    pass_count = len(passed_poruthams)
    conditional_count = len(conditional_poruthams)
    fail_count = len(failed_poruthams)
    
    return {
        "poruthams_matched": pass_count,
        "total_poruthams": 10,
        "pass_count": pass_count,
        "conditional_count": conditional_count,
        "fail_count": fail_count,
        "rajju_matched": rajju_match,
        "vedha_matched": vedha_match,
        "failed_names": [p["name"] for p in failed_poruthams],
        "passed_names": [p["name"] for p in passed_poruthams],
        "conditional_names": [p["name"] for p in conditional_poruthams],
        "section_label": "Experimental and unverified (traditions differ)",
        "is_experimental": True,
        "disclaimer": "Calculated under South Indian Dasa Koota tradition. Experimental and unverified; traditions differ.",
        "summary": f"{pass_count} Passed, {conditional_count} Conditional, {fail_count} Failed out of 10 Poruthams. Rajju: {'Approved' if rajju_match else 'Dosha present'}, Vedha: {'Approved' if vedha_match else 'Afflicted'}.",
        "poruthams": ordered_poruthams
    }
