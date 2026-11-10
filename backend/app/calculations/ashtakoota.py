"""Ashtakoota (36 Guna Milan) matching engine with classical cancellation rules."""

from typing import Dict, List, Any, Optional
import json
import os

from .constants import SIGNS, SANSKRIT_SIGNS, SIGN_LORDS, NAKSHATRAS
from .ephemeris import get_nakshatra_and_pada
from .avakahada import get_vashya_category

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
CANCELLATION_CONFIG_PATH = os.path.join(CURRENT_DIR, "cancellation_rules_config.json")


class AuditableRuleEnablingError(ValueError):
    """Raised when a cancellation rule is enabled without mandatory astrologer audit metadata."""
    pass


def validate_cancellation_rule_audit(rule_code: str, rule_dict: Dict[str, Any]) -> None:
    """Validates that a rule is only enabled with full astrologer sign-off metadata (astrologer_name, tradition, date)."""
    is_en = rule_dict.get("is_enabled", rule_dict.get("enabled", False))
    if is_en:
        astrologer_name = (
            rule_dict.get("astrologer_name")
            or rule_dict.get("verified_by_astrologer")
            or rule_dict.get("astrologer")
        )
        tradition = rule_dict.get("tradition")
        date_val = (
            rule_dict.get("date")
            or rule_dict.get("verification_date")
        )
        if not astrologer_name or not str(astrologer_name).strip():
            raise AuditableRuleEnablingError(
                f"Cancellation rule '{rule_code}' cannot be enabled without a non-empty 'astrologer_name'."
            )
        if not tradition or not str(tradition).strip():
            raise AuditableRuleEnablingError(
                f"Cancellation rule '{rule_code}' cannot be enabled without a non-empty 'tradition'."
            )
        if not date_val or not str(date_val).strip():
            raise AuditableRuleEnablingError(
                f"Cancellation rule '{rule_code}' cannot be enabled without a non-empty verification 'date'."
            )


def is_cancellation_rule_enabled(rule_code: str, custom_config: Optional[Dict[str, Any]] = None) -> bool:
    """Checks whether a cancellation rule is enabled. Rules are disabled by default unless explicitly enabled
    with mandatory astrologer audit metadata (astrologer_name, tradition, date)."""
    if custom_config and rule_code in custom_config:
        cfg = custom_config[rule_code]
        if isinstance(cfg, dict):
            if cfg.get("is_enabled", cfg.get("enabled", False)):
                validate_cancellation_rule_audit(rule_code, cfg)
                return True
            return False
        if bool(cfg):
            raise AuditableRuleEnablingError(
                f"Cancellation rule '{rule_code}' cannot be enabled without a dictionary containing astrologer_name, tradition, and date."
            )
        return False

    try:
        if os.path.exists(CANCELLATION_CONFIG_PATH):
            with open(CANCELLATION_CONFIG_PATH, "r", encoding="utf-8") as f:
                rules = json.load(f).get("rules", {})
                rule_entry = rules.get(rule_code, {})
                if rule_entry.get("is_enabled", False):
                    validate_cancellation_rule_audit(rule_code, rule_entry)
                    return True
    except AuditableRuleEnablingError:
        raise
    except Exception:
        pass
    return False


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
        
    working = {
        "inputs": {
            "groom_sign": groom_sign,
            "bride_sign": bride_sign,
            "groom_varna": g_varna,
            "bride_varna": b_varna
        },
        "intermediate_values": {
            "groom_varna_rank": g_rank,
            "bride_varna_rank": b_rank
        },
        "table_or_rule_used": "Groom Varna Rank >= Bride Varna Rank -> 1.0 (Anuloma); Bride Varna Rank > Groom Varna Rank -> 0.0 (Pratiloma)",
        "school": "Parashari tradition",
        "score": points,
        "max_score": 1.0,
        "working_str": f"Groom {groom_sign} ({g_varna}, rank {g_rank}) vs Bride {bride_sign} ({b_varna}, rank {b_rank}) -> {'rank ' + str(g_rank) + ' >= ' + str(b_rank) + ' (1.0 pt)' if g_rank >= b_rank else 'rank ' + str(g_rank) + ' < ' + str(b_rank) + ' (0.0 pt)'}",
        "explanation": f"Groom Varna rank {g_rank} ({g_varna}) {'is greater than or equal to' if g_rank >= b_rank else 'is lower than'} Bride Varna rank {b_rank} ({b_varna}), yielding {points:.1f}/1.0."
    }

    return {
        "koota": "Varna",
        "points": points,
        "raw_points": points,
        "effective_points": points,
        "max_points": 1.0,
        "groom_value": g_varna,
        "bride_value": b_varna,
        "status": status,
        "description": desc,
        "working": working,
        "citation": VARNA_DATA["citation"]
    }


def calculate_vashya(
    groom_sign: str,
    bride_sign: str,
    school: str = "category_matrix",
    groom_moon_long: Optional[float] = None,
    bride_moon_long: Optional[float] = None,
    vashya_capricorn: str = "split"
) -> Dict[str, Any]:
    """2. Vashya Koota (2 Points) - Evaluates mutual attraction and power balance.
    vashya_capricorn: 'split' (default: 0-15° Chatushpada, 15-30° Jalachara) or 'whole_jalachara' (all 0-30° Jalachara).
    """
    if school == "category_matrix":
        cat_data = VASHYA_DATA["schools"]["category_matrix"]
        matrix = cat_data["matrix"]

        # 1. Default score under configured vashya_capricorn
        g_cat = get_vashya_category(groom_sign, groom_moon_long, capricorn_mode=vashya_capricorn)
        b_cat = get_vashya_category(bride_sign, bride_moon_long, capricorn_mode=vashya_capricorn)
        points = float(matrix.get(g_cat, {}).get(b_cat, 0.0))

        # 2. Alternate score under opposite capricorn mode
        alt_capricorn_mode = "whole_jalachara" if vashya_capricorn == "split" else "split"
        g_cat_alt = get_vashya_category(groom_sign, groom_moon_long, capricorn_mode=alt_capricorn_mode)
        b_cat_alt = get_vashya_category(bride_sign, bride_moon_long, capricorn_mode=alt_capricorn_mode)
        points_alt = float(matrix.get(g_cat_alt, {}).get(b_cat_alt, 0.0))

        has_difference = (points != points_alt)
        alternate_option = None
        if has_difference:
            alternate_option = {
                "school": f"Category Matrix (Capricorn {alt_capricorn_mode})",
                "vashya_capricorn": alt_capricorn_mode,
                "score": points_alt,
                "groom_category": g_cat_alt,
                "bride_category": b_cat_alt,
                "label": "school difference; unverified"
            }

        if points == 2.0:
            status = "Full"
            desc = f"Harmonious Vashya category alignment (Groom: {g_cat}, Bride: {b_cat}). Mutual natural rapport."
        elif points >= 1.0:
            status = "Good" if points > 1.0 else "Partial"
            desc = f"Favorable Vashya alignment (Groom: {g_cat}, Bride: {b_cat})."
        elif points > 0:
            status = "Partial"
            desc = f"Moderate Vashya alignment (Groom: {g_cat}, Bride: {b_cat})."
        else:
            status = "Zero"
            desc = f"Inimical or non-amenable Vashya categories (Groom: {g_cat}, Bride: {b_cat})."

        working_str = f"Groom {groom_sign} ({g_cat}) vs Bride {bride_sign} ({b_cat}) -> {points:.1f}/2.0 pts"
        if has_difference:
            working_str += f" (under alternate Capricorn {alt_capricorn_mode}: {points_alt:.1f}/2.0 pts; school difference; unverified)"

        explanation = f"Groom {groom_sign} is {g_cat} and Bride {bride_sign} is {b_cat}, yielding {points:.1f}/2.0."
        if has_difference:
            explanation += f" (Under {alt_capricorn_mode}: {points_alt:.1f}/2.0, labeled 'school difference; unverified')."

        working = {
            "inputs": {
                "groom_sign": groom_sign,
                "bride_sign": bride_sign,
                "groom_moon_long": round(groom_moon_long, 2) if groom_moon_long is not None else None,
                "bride_moon_long": round(bride_moon_long, 2) if bride_moon_long is not None else None,
                "vashya_capricorn": vashya_capricorn
            },
            "intermediate_values": {
                "groom_category": g_cat,
                "bride_category": b_cat,
                "alternate_bride_category": b_cat_alt if b_cat != b_cat_alt else None,
                "score_default": points,
                "score_alternate": points_alt if has_difference else None,
                "has_school_difference": has_difference
            },
            "table_or_rule_used": f"Muhurtha Chintamani Category Matrix ({g_cat} vs {b_cat} = {points:.1f} pts)",
            "school": f"Category Matrix (Capricorn {vashya_capricorn})",
            "score": points,
            "max_score": 2.0,
            "alternate_option": alternate_option,
            "working_str": working_str,
            "explanation": explanation
        }

        return {
            "koota": "Vashya",
            "points": points,
            "raw_points": points,
            "effective_points": points,
            "max_points": 2.0,
            "groom_value": f"{groom_sign} ({g_cat})",
            "bride_value": f"{bride_sign} ({b_cat})",
            "status": status,
            "description": desc,
            "school_used": f"Muhurtha Chintamani Category Matrix (Capricorn {vashya_capricorn})",
            "alternate_option": alternate_option,
            "has_school_difference": has_difference,
            "working": working,
            "citation": cat_data["citation"]
        }
    else:
        # parashari_direct
        targets = VASHYA_DATA["schools"]["parashari_direct"]["vashya_targets"].get(groom_sign, [])
        is_bride_vashya = bride_sign in targets
        is_same_sign = groom_sign == bride_sign

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

        working = {
            "inputs": {
                "groom_sign": groom_sign,
                "bride_sign": bride_sign
            },
            "intermediate_values": {
                "is_bride_amenable_to_groom": is_bride_vashya,
                "is_groom_amenable_to_bride": is_groom_vashya_to_b
            },
            "table_or_rule_used": "BPHS Direct Target List",
            "school": "Parashari Direct",
            "score": points,
            "max_score": 2.0,
            "alternate_option": None,
            "working_str": f"Groom {groom_sign} vs Bride {bride_sign} -> {points:.1f}/2.0 pts",
            "explanation": desc
        }

        return {
            "koota": "Vashya",
            "points": points,
            "raw_points": points,
            "effective_points": points,
            "max_points": 2.0,
            "groom_value": groom_sign,
            "bride_value": bride_sign,
            "status": status,
            "description": desc,
            "school_used": "BPHS Direct Target List",
            "alternate_option": None,
            "has_school_difference": False,
            "working": working,
            "citation": VASHYA_DATA["schools"]["parashari_direct"]["citation"]
        }


def calculate_tara(
    groom_nak_idx: int,
    bride_nak_idx: int,
    apply_paryaya_exemption: bool = True
) -> Dict[str, Any]:
    """3. Tara / Dina Koota (3 Points) with Paryaya cycle exemption (Muhurtha Chintamani / B.V. Raman)."""
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

    # Standard auspicious indices: 2 (Sampat), 4 (Kshema), 6 (Sadhana), 8 (Mitra), 9 (Paramamitra)
    # Classical Paryaya rule: 10th (Karna in 2nd Paryaya) and 19th (Adhana in 3rd Paryaya) are exempt from Janma dosha
    bg_paryaya = apply_paryaya_exemption and (count_b_to_g in (10, 19))
    gb_paryaya = apply_paryaya_exemption and (count_g_to_b in (10, 19))

    bg_auspicious = (tara_b_to_g in TARA_DATA["auspicious_tara_indices"]) or bg_paryaya
    gb_auspicious = (tara_g_to_b in TARA_DATA["auspicious_tara_indices"]) or gb_paryaya

    bg_label = f"{tara_info_bg['name']} (Count: {count_b_to_g})"
    gb_label = f"{tara_info_gb['name']} (Count: {count_g_to_b})"

    if bg_auspicious and gb_auspicious:
        points = 3.0
        status = "Full"
        desc = f"Both directions auspicious (Bride to Groom: {bg_label}, Groom to Bride: {gb_label})."
    elif bg_auspicious or gb_auspicious:
        points = 1.5
        status = "Partial"
        desc = f"One direction auspicious (Bride to Groom: {bg_label}, Groom to Bride: {gb_label}), yielding 1.5 points."
    else:
        points = 0.0
        status = "Zero"
        desc = f"Neither direction auspicious (Bride to Groom: {bg_label}, Groom to Bride: {gb_label})."

    working_str = (
        f"bride->groom count ({count_b_to_g}), mod 9 ({tara_b_to_g}), "
        f"groom->bride count ({count_g_to_b}), mod 9 ({tara_g_to_b}); "
        f"inauspicious remainders are 3, 5, 7; so {points:g}/3. "
        "Remainder 1 (Janma) is not penalised in Tara koota."
    )
    explanation = (
        f"Bride->groom count {count_b_to_g} (mod 9 = {tara_b_to_g}, {tara_info_bg['name']}) and "
        f"groom->bride count {count_g_to_b} (mod 9 = {tara_g_to_b}, {tara_info_gb['name']}). "
        f"Inauspicious remainders are 3 (Vipat), 5 (Pratyak), 7 (Naidhana); remainder 1 (Janma) is not penalised. "
        f"Score: {points:g}/3.0 points."
    )

    working = {
        "inputs": {
            "groom_nak": NAKSHATRAS[groom_nak_idx],
            "bride_nak": NAKSHATRAS[bride_nak_idx],
            "groom_nak_idx": groom_nak_idx,
            "bride_nak_idx": bride_nak_idx
        },
        "intermediate_values": {
            "count_bride_to_groom": count_b_to_g,
            "rem_bride_to_groom": tara_b_to_g,
            "tara_bride_to_groom": tara_info_bg["name"],
            "count_groom_to_bride": count_g_to_b,
            "rem_groom_to_bride": tara_g_to_b,
            "tara_groom_to_bride": tara_info_gb["name"],
            "inauspicious_remainders": [3, 5, 7],
            "janma_penalised": False
        },
        "table_or_rule_used": "Count Nakshatras mod 9; inauspicious remainders: 3 (Vipat), 5 (Pratyak), 7 (Naidhana); remainder 1 (Janma) not penalised in Tara koota",
        "school": "Parashari / Standard Ashtakoota",
        "score": points,
        "max_score": 3.0,
        "working_str": working_str,
        "explanation": explanation
    }

    return {
        "koota": "Tara",
        "points": points,
        "raw_points": points,
        "effective_points": points,
        "max_points": 3.0,
        "groom_value": f"{NAKSHATRAS[groom_nak_idx]} ({gb_label})",
        "bride_value": f"{NAKSHATRAS[bride_nak_idx]} ({bg_label})",
        "status": status,
        "description": desc,
        "working": working,
        "citation": "Brihat Parashara Hora Shastra Chapter 81 Slokas 7-10; Muhurtha Chintamani Chapter 1; B.V. Raman Muhurtha"
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
            
    def format_yoni_archetype(animal: str, gender: str) -> str:
        if animal == "Cow":
            label = "Bull / Ox (Go-Vrishabha)" if gender == "Male" else "Cow (Dhenu)"
            return f"{label} [{gender} archetype]"
        elif animal == "Buffalo":
            label = "He-Buffalo (Mahisha)" if gender == "Male" else "She-Buffalo (Mahishi)"
            return f"{label} [{gender} archetype]"
        elif animal == "Horse":
            label = "Stallion (Ashva)" if gender == "Male" else "Mare (Vadava)"
            return f"{label} [{gender} archetype]"
        elif animal == "Elephant":
            label = "Tusker (Gaja)" if gender == "Male" else "Cow Elephant (Hastini)"
            return f"{label} [{gender} archetype]"
        elif animal == "Sheep":
            label = "Ram (Mesha)" if gender == "Male" else "Ewe (Avi)"
            return f"{label} [{gender} archetype]"
        elif animal == "Serpent":
            label = "Male Serpent (Sarpa)" if gender == "Male" else "Female Serpent (Sarpi)"
            return f"{label} [{gender} archetype]"
        elif animal == "Dog":
            label = "Male Dog (Shvana)" if gender == "Male" else "Female Dog (Shvani)"
            return f"{label} [{gender} archetype]"
        elif animal == "Cat":
            label = "Tomcat (Marjara)" if gender == "Male" else "Female Cat (Marjari)"
            return f"{label} [{gender} archetype]"
        elif animal == "Rat":
            label = "Male Rat (Mushaka)" if gender == "Male" else "Female Rat (Mushaki)"
            return f"{label} [{gender} archetype]"
        elif animal == "Tiger":
            label = "Male Tiger (Vyaghra)" if gender == "Male" else "Tigress (Vyaghri)"
            return f"{label} [{gender} archetype]"
        elif animal == "Deer":
            label = "Stag / Buck (Mriga)" if gender == "Male" else "Hind / Doe (Mrigi)"
            return f"{label} [{gender} archetype]"
        elif animal == "Monkey":
            label = "Male Monkey (Vanara)" if gender == "Male" else "Female Monkey (Vanari)"
            return f"{label} [{gender} archetype]"
        elif animal == "Lion":
            label = "Male Lion (Simha)" if gender == "Male" else "Lioness (Simhi)"
            return f"{label} [{gender} archetype]"
        elif animal == "Mongoose":
            return f"Mongoose (Nakula) [{gender} archetype]"
        return f"{animal} ({gender} archetype)"

    groom_yoni_str = format_yoni_archetype(g_animal, g_info["gender"])
    bride_yoni_str = format_yoni_archetype(b_animal, b_info["gender"])

    clarification_note = " (Note: Yoni gender and animal represent the Nakshatra's instinctive nature in classical Jyotish, not the biological gender of the person.)"

    if points == 4.0:
        status = "Full"
        desc = f"Same animal yoni ({g_animal}). Rule result: full points.{clarification_note}"
    elif points == 3.0:
        status = "Good"
        desc = f"Friendly animal yonis ({g_animal} & {b_animal}). Rule result: good points.{clarification_note}"
    elif points == 2.0:
        status = "Average"
        desc = f"Neutral animal yonis ({g_animal} & {b_animal}). Rule result: average points.{clarification_note}"
    elif points == 1.0:
        status = "Low"
        desc = f"Unfriendly animal yonis ({g_animal} & {b_animal}). Rule result: low points.{clarification_note}"
    else:
        status = "Zero"
        desc = f"Enemy yoni pair ({g_animal} vs {b_animal}). Rule result: no points; the porutham does not pass.{clarification_note}"

    working_str = f"Groom {groom_nak} ({groom_yoni_str}) vs Bride {bride_nak} ({bride_yoni_str}) -> {g_animal} & {b_animal} ({status.lower()}) -> {points:g}/4.0 pts"
    explanation = (
        f"Groom nakshatra has {g_animal} ({g_info['gender']}) and bride has {b_animal} ({b_info['gender']}). "
        f"Animal pair {g_animal} & {b_animal} yields {points:g}/4.0 points in the Yoni table used here, unverified (traditions differ)."
    )
    working = {
        "inputs": {
            "groom_nak": groom_nak,
            "bride_nak": bride_nak,
            "groom_animal": g_animal,
            "bride_animal": b_animal,
            "groom_gender": g_info["gender"],
            "bride_gender": b_info["gender"],
            "gender_status": "unverified"
        },
        "intermediate_values": {
            "animal_pair": f"{g_animal} - {b_animal}",
            "points": points,
            "is_sworn_enemy": is_sworn_enemy,
            "gender_status": "unverified"
        },
        "table_or_rule_used": "Classical Yoni Compatibility Matrix (Muhurtha Chintamani)",
        "school": "Muhurtha Chintamani",
        "score": points,
        "max_score": 4.0,
        "working_str": working_str,
        "explanation": explanation
    }

    return {
        "koota": "Yoni",
        "points": points,
        "raw_points": points,
        "effective_points": points,
        "max_points": 4.0,
        "groom_value": groom_yoni_str,
        "bride_value": bride_yoni_str,
        "groom_gender": g_info["gender"],
        "bride_gender": b_info["gender"],
        "gender_status": "unverified",
        "status": status,
        "is_sworn_enemy": is_sworn_enemy,
        "description": desc,
        "working": working,
        "archetype_note": "Animal gender represents the classical masculine (Purusha) or feminine (Stri) archetype of the Nakshatra, not the human individual's gender.",
        "citation": YONI_DATA["citation"]
    }


def calculate_graha_maitri(groom_sign: str, bride_sign: str) -> Dict[str, Any]:
    """5. Graha Maitri Koota (5 Points)"""
    g_lord = GRAHA_MAITRI_DATA["sign_lords"][groom_sign]
    b_lord = GRAHA_MAITRI_DATA["sign_lords"][bride_sign]
    
    if g_lord == b_lord:
        points = 5.0
        status = "Full"
        g_rel_b = "same"
        b_rel_g = "same"
        rel_label = "same lord"
        desc = f"Same Moon sign planetary ruler ({g_lord}). Exceptional intellectual and psychological alignment."
    else:
        # Check mutual relation (Source: unverified; traditions differ)
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
        
        pair_set = tuple(sorted([g_rel_b, b_rel_g]))
        if pair_set == ("friend", "friend"):
            rel_label = "mutual friends"
        elif pair_set == ("friend", "neutral"):
            rel_label = "friend/neutral"
        elif pair_set == ("neutral", "neutral"):
            rel_label = "neutral/neutral"
        elif pair_set == ("enemy", "friend"):
            rel_label = "friend/enemy"
        elif pair_set == ("enemy", "neutral"):
            rel_label = "neutral/enemy"
        elif pair_set == ("enemy", "enemy"):
            rel_label = "mutual enemies"
        else:
            rel_label = f"{g_rel_b}/{b_rel_g}"
        
        if points == 5.0:
            status = "Full"
            desc = f"Mutual friendship between {g_lord} and {b_lord}. Deep natural empathy."
        elif points >= 4.0:
            status = "Good"
            desc = f"Moon sign lords ({g_lord} and {b_lord}) are {rel_label} ({g_lord} views {b_lord} as {g_rel_b}, {b_lord} views {g_lord} as {b_rel_g})."
        elif points >= 3.0:
            status = "Average"
            desc = f"Neutral planetary dynamic between {g_lord} and {b_lord} ({rel_label})."
        elif points >= 0.5:
            status = "Low"
            desc = f"Frictional dynamic between {g_lord} and {b_lord} ({rel_label})."
        else:
            status = "Zero"
            desc = f"Mutual planetary enmity between {g_lord} and {b_lord} ({rel_label})."

    if g_lord == b_lord:
        working_str = f"Same Moon sign planetary ruler ({g_lord}) -> 5.0/5.0 pts"
        explanation = f"Both partners have Moon sign ruled by {g_lord}, giving maximum score of 5.0/5.0."
    else:
        working_str = f"Groom lord {g_lord} views {b_lord} as {g_rel_b}, Bride lord {b_lord} views {g_lord} as {b_rel_g} -> {rel_label} -> {points:g}/5.0 pts"
        explanation = f"Groom sign lord {g_lord} views {b_lord} as {g_rel_b}, and {b_lord} views {g_lord} as {b_rel_g} ({rel_label}), yielding {points:g}/5.0 points."

    working = {
        "inputs": {
            "groom_sign": groom_sign,
            "bride_sign": bride_sign,
            "groom_lord": g_lord,
            "bride_lord": b_lord
        },
        "intermediate_values": {
            "groom_rel_to_bride": g_rel_b,
            "bride_rel_to_groom": b_rel_g,
            "relationship": rel_label
        },
        "table_or_rule_used": "Parashari Natural Planetary Friendship (Naisargika Sambandha) Scoring Matrix",
        "school": "Parashari",
        "score": points,
        "max_score": 5.0,
        "working_str": working_str,
        "explanation": explanation
    }

    return {
        "koota": "Graha Maitri",
        "points": points,
        "raw_points": points,
        "effective_points": points,
        "max_points": 5.0,
        "groom_lord": g_lord,
        "bride_lord": b_lord,
        "groom_rel_to_bride": g_rel_b,
        "bride_rel_to_groom": b_rel_g,
        "relationship": rel_label,
        "groom_value": f"{g_lord} ({groom_sign})",
        "bride_value": f"{b_lord} ({bride_sign})",
        "status": status,
        "description": desc,
        "working": working,
        "citation": GRAHA_MAITRI_DATA["citation"]
    }


def calculate_gana(groom_nak: str, bride_nak: str, school: str = "muhurtha_chintamani") -> Dict[str, Any]:
    """6. Gana Koota (6 Points) - Temperament compatibility."""
    g_gana = GANA_DATA["nakshatra_gana_mapping"].get(groom_nak, "Manushya")
    b_gana = GANA_DATA["nakshatra_gana_mapping"].get(bride_nak, "Manushya")
    
    matrix = GANA_DATA["schools"].get(school, GANA_DATA["schools"]["muhurtha_chintamani"])["matrix"]
    points = float(matrix.get(g_gana, {}).get(b_gana, 0.0))
    
    if points == 6.0:
        status = "Full"
        desc = f"Full points under the Gana matrix used here (unverified; traditions differ) (Groom: {g_gana}, Bride: {b_gana})."
    elif points >= 5.0:
        status = "Good"
        desc = f"Good points under the Gana matrix used here (unverified; traditions differ) (Groom: {g_gana}, Bride: {b_gana})."
    elif points > 0:
        status = "Partial"
        desc = f"Partial points under the Gana matrix used here (unverified; traditions differ) (Groom: {g_gana}, Bride: {b_gana})."
    else:
        status = "Zero"
        desc = f"No points under the Gana matrix used here (unverified; traditions differ); the porutham does not pass (Groom: {g_gana}, Bride: {b_gana})."

    working_str = f"Groom {groom_nak} ({g_gana}) vs Bride {bride_nak} ({b_gana}) -> {points:g}/6.0 pts"
    explanation = f"Groom temperament is {g_gana} and bride temperament is {b_gana}, scoring {points:g}/6.0 points in the Gana matrix."
    working = {
        "inputs": {
            "groom_nak": groom_nak,
            "bride_nak": bride_nak,
            "groom_gana": g_gana,
            "bride_gana": b_gana
        },
        "intermediate_values": {
            "groom_gana": g_gana,
            "bride_gana": b_gana,
            "pair": f"{g_gana} - {b_gana}"
        },
        "table_or_rule_used": "Muhurtha Chintamani Gana Compatibility Matrix",
        "school": school,
        "score": points,
        "max_score": 6.0,
        "working_str": working_str,
        "explanation": explanation
    }

    return {
        "koota": "Gana",
        "points": points,
        "raw_points": points,
        "effective_points": points,
        "max_points": 6.0,
        "groom_value": g_gana,
        "bride_value": b_gana,
        "status": status,
        "description": desc,
        "school_used": school,
        "working": working,
        "citation": GANA_DATA["citation"]
    }


def calculate_bhakoot(
    groom_sign_idx: int,
    bride_sign_idx: int,
    groom_navamsa_idx: Optional[int] = None,
    bride_navamsa_idx: Optional[int] = None,
    cancellation_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """7. Bhakoot / Rashi Koota (7 Points) with score honesty and configurable classical cancellations."""
    diff_b_to_g = ((groom_sign_idx - bride_sign_idx) % 12) + 1
    diff_g_to_b = ((bride_sign_idx - groom_sign_idx) % 12) + 1

    pair_code = f"{min(diff_b_to_g, diff_g_to_b)}_{max(diff_b_to_g, diff_g_to_b)}"
    rel_info = BHAKOOT_DATA["relative_dispositions"].get(pair_code, {"score": 7.0, "status": "Auspicious", "description": "Normal"})

    raw_points = rel_info["score"]
    has_dosha = raw_points == 0.0
    cancellations: List[Dict[str, str]] = []

    g_sign = SIGNS[groom_sign_idx]
    b_sign = SIGNS[bride_sign_idx]
    g_lord = SIGN_LORDS[groom_sign_idx]
    b_lord = SIGN_LORDS[bride_sign_idx]

    if has_dosha:
        # Check Cancellation 1: Same Rashi Lord
        if g_lord == b_lord:
            cancellations.append({
                "rule_code": "BHAKOOT_SAME_LORD",
                "rule_name": "Same Rashi Lord",
                "description": f"Both signs ({g_sign} and {b_sign}) share the same ruler ({g_lord}), providing potential exception for {rel_info.get('dosha_name', 'Bhakoot Dosha')}.",
                "source": "Rule: Same Rashi Lord. Source: unverified; traditions differ."
            })

        # Check Cancellation 2: Mutual Friends / Non-enemies with at least one friend
        g_enemies = GRAHA_MAITRI_DATA["naisargika_sambandha"][g_lord]["enemies"]
        b_enemies = GRAHA_MAITRI_DATA["naisargika_sambandha"][b_lord]["enemies"]
        g_friends = GRAHA_MAITRI_DATA["naisargika_sambandha"][g_lord]["friends"]
        b_friends = GRAHA_MAITRI_DATA["naisargika_sambandha"][b_lord]["friends"]
        if (b_lord not in g_enemies and g_lord not in b_enemies) and (b_lord in g_friends or g_lord in b_friends):
            cancellations.append({
                "rule_code": "BHAKOOT_FRIENDLY_LORDS",
                "rule_name": "Mutual Friendship of Rashi Lords",
                "description": f"Rashi lords ({g_lord} and {b_lord}) are cordial and non-inimical, mitigating {rel_info.get('dosha_name', 'Bhakoot Dosha')}.",
                "source": "Rule: Mutual Friendship of Rashi Lords. Source: unverified; traditions differ."
            })

        # Check Cancellation 3: Navamsa Lord Friendship
        if groom_navamsa_idx is not None and bride_navamsa_idx is not None:
            g_nav_lord = SIGN_LORDS[groom_navamsa_idx]
            b_nav_lord = SIGN_LORDS[bride_navamsa_idx]
            if g_nav_lord == b_nav_lord:
                cancellations.append({
                    "rule_code": "BHAKOOT_NAVAMSA_FRIENDSHIP",
                    "rule_name": "Identical Navamsa Lords",
                    "description": f"Navamsa lords ({g_nav_lord}) are identical, providing D9 harmonic resolution for {rel_info.get('dosha_name', 'Bhakoot Dosha')}.",
                    "source": "Rule: Identical Navamsa Lords. Source: unverified; traditions differ."
                })

    applied_cancellations = [
        c for c in cancellations
        if is_cancellation_rule_enabled(c["rule_code"], cancellation_config)
    ]
    is_cancelled = len(applied_cancellations) > 0

    # SCORE HONESTY: Never add cancelled points to points column. Points = raw_points always.
    points = raw_points
    effective_points = 7.0 if (not has_dosha or is_cancelled) else 0.0

    badge = None
    cancellation_rule = None
    cancellation_source = None
    cancellation_note = None

    if not has_dosha:
        status = "Full"
        desc = f"{pair_code} disposition passes under the rule used here ({rel_info['description']}) (unverified; traditions differ)."
    elif is_cancelled:
        status = "Conditional"
        badge = f"Bhakoot dosha present, cancellation applied: {applied_cancellations[0]['rule_name']}"
        cancellation_rule = applied_cancellations[0]["rule_name"]
        cancellation_source = applied_cancellations[0]["source"]
        cancellation_note = "Rule is enabled in configuration; traditions differ on whether this cancels the dosha fully or partly."
        desc = f"{rel_info.get('dosha_name', 'Bhakoot Dosha')} present ({rel_info['description']}). Cancellation enabled: {applied_cancellations[0]['description']}"
    elif len(cancellations) > 0:
        status = "Dosha"
        badge = f"Bhakoot Dosha present (potential rule '{cancellations[0]['rule_name']}' is UNVERIFIED and disabled)"
        cancellation_rule = cancellations[0]["rule_name"]
        cancellation_source = cancellations[0]["source"]
        cancellation_note = "Rule is UNVERIFIED and disabled by default. Effective score equals raw score unless rule is explicitly enabled."
        desc = f"{rel_info.get('dosha_name', 'Bhakoot Dosha')} present ({rel_info['description']}). Potential rule: {cancellations[0]['description']} (Disabled in configuration; unverified; traditions differ)."
    else:
        status = "Dosha"
        badge = f"{rel_info.get('dosha_name', 'Bhakoot Dosha')} Present"
        desc = f"{rel_info.get('dosha_name', 'Bhakoot Dosha')} present ({rel_info['description']}). No cancellation rule applies."

    working_str = (
        f"{g_sign}->{b_sign} {diff_g_to_b}th, {b_sign}->{g_sign} {diff_b_to_g}th -> "
        f"{min(diff_b_to_g, diff_g_to_b)}/{max(diff_b_to_g, diff_g_to_b)} -> {points:g}/7.0 pts"
    )
    explanation = (
        f"Groom ({g_sign}) to Bride ({b_sign}) is {diff_g_to_b}th, and Bride to Groom is {diff_b_to_g}th "
        f"({min(diff_b_to_g, diff_g_to_b)}/{max(diff_b_to_g, diff_g_to_b)} disposition). "
        f"{'This forms Bhakoot Dosha (0/7 points).' if has_dosha else 'This forms an auspicious disposition (7/7 points).'}"
    )
    working = {
        "inputs": {
            "groom_sign": g_sign,
            "bride_sign": b_sign,
            "groom_sign_idx": groom_sign_idx,
            "bride_sign_idx": bride_sign_idx
        },
        "intermediate_values": {
            "count_groom_to_bride": diff_g_to_b,
            "count_bride_to_groom": diff_b_to_g,
            "disposition": f"{min(diff_b_to_g, diff_g_to_b)}/{max(diff_b_to_g, diff_g_to_b)}",
            "groom_lord": g_lord,
            "bride_lord": b_lord,
            "has_dosha": has_dosha,
            "cancellations": [c["rule_name"] for c in cancellations],
            "is_cancelled": is_cancelled
        },
        "table_or_rule_used": "Rashi Disposition (Bhakoot Matrix); inauspicious dispositions: 2/12 (Dvidvadasa), 5/9 (Navapanchama), 6/8 (Shadashtaka)",
        "school": "Parashari / Muhurtha Chintamani",
        "score": points,
        "max_score": 7.0,
        "working_str": working_str,
        "explanation": explanation
    }

    return {
        "koota": "Bhakoot",
        "points": points,
        "raw_points": raw_points,
        "effective_points": effective_points,
        "max_points": 7.0,
        "groom_value": g_sign,
        "bride_value": b_sign,
        "status": status,
        "badge": badge,
        "has_dosha": has_dosha,
        "is_cancelled": is_cancelled,
        "cancellations": [c["description"] for c in cancellations],
        "cancellation_rule": cancellation_rule,
        "cancellation_source": cancellation_source,
        "cancellation_note": cancellation_note,
        "description": desc,
        "working": working,
        "citation": BHAKOOT_DATA["citation"]
    }


def calculate_nadi(
    groom_nak_idx: int,
    bride_nak_idx: int,
    groom_sign_idx: int,
    bride_sign_idx: int,
    groom_pada: int = 1,
    bride_pada: int = 1,
    cancellation_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """8. Nadi Koota (8 Points) with score honesty and configurable classical cancellations."""
    g_nak = NAKSHATRAS[groom_nak_idx]
    b_nak = NAKSHATRAS[bride_nak_idx]

    g_nadi = NADI_DATA["nakshatra_nadi_mapping"].get(g_nak, "Adi")
    b_nadi = NADI_DATA["nakshatra_nadi_mapping"].get(b_nak, "Adi")

    has_dosha = (g_nadi == b_nadi)
    cancellations: List[Dict[str, str]] = []

    if has_dosha:
        # Cancellation 1: Same Rashi, Different Nakshatras
        if groom_sign_idx == bride_sign_idx and groom_nak_idx != bride_nak_idx:
            cancellations.append({
                "rule_code": "NADI_SAME_RASHI_DIFF_NAKSHATRA",
                "rule_name": "same Rashi, different Nakshatra",
                "description": f"Same Rashi ({SIGNS[groom_sign_idx]}) with different Nakshatras ({g_nak} vs {b_nak}) provides potential exception for Nadi Dosha.",
                "source": "Rule: Same Rashi, Different Nakshatras. Source: unverified; traditions differ."
            })

        # Cancellation 2: Same Nakshatra, Different Rashis
        if groom_nak_idx == bride_nak_idx and groom_sign_idx != bride_sign_idx:
            cancellations.append({
                "rule_code": "NADI_SAME_NAKSHATRA_DIFF_RASHI",
                "rule_name": "same Nakshatra, different Rashi",
                "description": f"Same Nakshatra ({g_nak}) spanning two distinct Rashis provides potential exception for Nadi Dosha.",
                "source": "Rule: Same Nakshatra, Different Rashis. Source: unverified; traditions differ."
            })

        # Cancellation 3: Exempt Nakshatras List
        if g_nak in NADI_DATA["exempt_nakshatras"] and b_nak in NADI_DATA["exempt_nakshatras"]:
            cancellations.append({
                "rule_code": "NADI_EXEMPT_NAKSHATRAS",
                "rule_name": "exempt Nakshatras",
                "description": f"Both Nakshatras ({g_nak} and {b_nak}) belong to the 9 exempt stars list (tradition claim).",
                "source": "Rule: Exempt Nakshatras List. Source: unverified; traditions differ."
            })

        # Cancellation 4: Different Padas within same Nakshatra
        if groom_nak_idx == bride_nak_idx and groom_pada != bride_pada:
            cancellations.append({
                "rule_code": "NADI_DIFF_PADA_SAME_NAKSHATRA",
                "rule_name": "different Padas in same Nakshatra",
                "description": f"Different Padas (Groom: {groom_pada}, Bride: {bride_pada}) mitigates single-nakshatra Nadi Dosha.",
                "source": "Rule: Different Padas in Same Nakshatra. Source: unverified; traditions differ."
            })

        # Cancellation 5: Friendly or Same Moon Lords
        g_lord = SIGN_LORDS[groom_sign_idx]
        b_lord = SIGN_LORDS[bride_sign_idx]
        if g_lord == b_lord:
            cancellations.append({
                "rule_code": "NADI_IDENTICAL_MOON_LORDS",
                "rule_name": "identical Moon sign lords",
                "description": f"Moon sign lords are identical ({g_lord}) (cancellation rule under consideration).",
                "source": "Rule: Identical Moon Sign Lords. Source: unverified; traditions differ."
            })

    applied_cancellations = [
        c for c in cancellations
        if is_cancellation_rule_enabled(c["rule_code"], cancellation_config)
    ]
    is_cancelled = len(applied_cancellations) > 0

    # SCORE HONESTY: Never add cancelled points to points column. Points = raw_points always.
    raw_points = 0.0 if has_dosha else 8.0
    points = raw_points
    effective_points = 8.0 if (not has_dosha or is_cancelled) else 0.0

    badge = None
    cancellation_rule = None
    cancellation_source = None
    cancellation_note = None

    if not has_dosha:
        status = "Full"
        desc = f"Different Nadis pass under the rule used here (Groom: {g_nadi}, Bride: {b_nadi}) (unverified; traditions differ)."
    elif is_cancelled:
        status = "Conditional"
        badge = f"Nadi dosha present, cancellation applied: {applied_cancellations[0]['rule_name']}"
        cancellation_rule = applied_cancellations[0]["rule_name"]
        cancellation_source = applied_cancellations[0]["source"]
        cancellation_note = "Rule is enabled in configuration; traditions differ on whether this cancels the dosha fully or partly."
        dosha_spec = NADI_DATA["nadi_doshas"].get(g_nadi, {})
        desc = f"Same Nadi ({g_nadi} - {dosha_spec.get('constitution', '')}). Cancellation enabled: {applied_cancellations[0]['description']}"
    elif len(cancellations) > 0:
        status = "Dosha"
        badge = f"Nadi Dosha present (potential rule '{cancellations[0]['rule_name']}' is UNVERIFIED and disabled)"
        cancellation_rule = cancellations[0]["rule_name"]
        cancellation_source = cancellations[0]["source"]
        cancellation_note = "Rule is UNVERIFIED and disabled by default. Effective score equals raw score unless rule is explicitly enabled."
        dosha_spec = NADI_DATA["nadi_doshas"].get(g_nadi, {})
        desc = f"Same Nadi ({g_nadi} - {dosha_spec.get('constitution', '')}). Potential rule: {cancellations[0]['description']} (Disabled in configuration; unverified; traditions differ)."
    else:
        dosha_spec = NADI_DATA["nadi_doshas"].get(g_nadi, {})
        status = "Dosha"
        badge = f"Nadi Dosha ({g_nadi}) Present"
        desc = f"Same Nadi ({g_nadi} - {dosha_spec.get('constitution', '')}). {dosha_spec.get('dosha_description', '')}"

    working_str = (
        f"Groom {g_nak} ({g_nadi}) vs Bride {b_nak} ({b_nadi}) -> "
        f"{'Same Nadi (Nadi Dosha: 0/8 pts)' if has_dosha else 'Different Nadis (8/8 pts)'}"
    )
    explanation = (
        f"Groom nakshatra has {g_nadi} Nadi and bride has {b_nadi} Nadi. "
        f"{'Same Nadi does not pass (Nadi Dosha, 0/8 points). (unverified; traditions differ)' if has_dosha else 'Different Nadis pass (8/8 points). (unverified; traditions differ)'}"
    )
    working = {
        "inputs": {
            "groom_nak": g_nak,
            "bride_nak": b_nak,
            "groom_nadi": g_nadi,
            "bride_nadi": b_nadi
        },
        "intermediate_values": {
            "groom_nadi": g_nadi,
            "bride_nadi": b_nadi,
            "has_dosha": has_dosha,
            "is_cancelled": is_cancelled,
            "cancellations": [c["rule_name"] for c in cancellations]
        },
        "table_or_rule_used": "Three Nadi Classifications (Adi, Madhya, Antya); same Nadi = 0/8 pts (Nadi Dosha); different Nadi = 8/8 pts",
        "school": "Classical Ashtakoota",
        "score": points,
        "max_score": 8.0,
        "working_str": working_str,
        "explanation": explanation
    }

    return {
        "koota": "Nadi",
        "points": points,
        "raw_points": raw_points,
        "effective_points": effective_points,
        "max_points": 8.0,
        "groom_value": f"{g_nadi} ({g_nak})",
        "bride_value": f"{b_nadi} ({b_nak})",
        "status": status,
        "badge": badge,
        "has_dosha": has_dosha,
        "is_cancelled": is_cancelled,
        "cancellations": [c["description"] for c in cancellations],
        "cancellation_rule": cancellation_rule,
        "cancellation_source": cancellation_source,
        "cancellation_note": cancellation_note,
        "description": desc,
        "working": working,
        "citation": NADI_DATA["citation"]
    }


def calculate_ashtakoota(
    groom_moon_long: float,
    bride_moon_long: float,
    groom_navamsa_idx: Optional[int] = None,
    bride_navamsa_idx: Optional[int] = None,
    vashya_school: str = "category_matrix",
    vashya_capricorn: str = "split",
    gana_school: str = "muhurtha_chintamani",
    min_score_threshold: float = 18.0,
    cancellation_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Computes full 36-point Ashtakoota Milan with score honesty, two totals (raw and effective), and classical exceptions."""
    g_nak_idx, g_nak, g_pada, _ = get_nakshatra_and_pada(groom_moon_long)
    b_nak_idx, b_nak, b_pada, _ = get_nakshatra_and_pada(bride_moon_long)

    g_sign_idx = int((groom_moon_long % 360.0) // 30.0)
    b_sign_idx = int((bride_moon_long % 360.0) // 30.0)

    g_sign = SIGNS[g_sign_idx]
    b_sign = SIGNS[b_sign_idx]

    kootas = [
        calculate_varna(g_sign, b_sign),
        calculate_vashya(
            g_sign,
            b_sign,
            school=vashya_school,
            groom_moon_long=groom_moon_long,
            bride_moon_long=bride_moon_long,
            vashya_capricorn=vashya_capricorn
        ),
        calculate_tara(g_nak_idx, b_nak_idx, apply_paryaya_exemption=True),
        calculate_yoni(g_nak, b_nak),
        calculate_graha_maitri(g_sign, b_sign),
        calculate_gana(g_nak, b_nak, school=gana_school),
        calculate_bhakoot(g_sign_idx, b_sign_idx, groom_navamsa_idx, bride_navamsa_idx, cancellation_config=cancellation_config),
        calculate_nadi(g_nak_idx, b_nak_idx, g_sign_idx, b_sign_idx, g_pada, b_pada, cancellation_config=cancellation_config)
    ]

    raw_total_points = round(sum(k["raw_points"] for k in kootas), 1)
    effective_total_points = round(sum(k.get("effective_points", k["raw_points"]) for k in kootas), 1)
    max_total = 36.0

    raw_percentage = round((raw_total_points / max_total) * 100.0, 1)
    effective_percentage = round((effective_total_points / max_total) * 100.0, 1)

    # Check Vashya alternate option
    vashya_koota = kootas[1]
    has_vashya_diff = vashya_koota.get("has_school_difference", False)
    alternate_vashya_total = None
    vashya_difference_note = None
    if has_vashya_diff and vashya_koota.get("alternate_option"):
        alt_score = vashya_koota["alternate_option"]["score"]
        alternate_vashya_total = round(raw_total_points - vashya_koota["points"] + alt_score, 1)
        vashya_difference_note = "school difference; unverified"

    rules_producing_difference = []
    for k in kootas:
        diff = round(k.get("effective_points", k["raw_points"]) - k["raw_points"], 1)
        if diff > 0:
            rules_producing_difference.append({
                "koota": k["koota"],
                "rule_name": k.get("cancellation_rule"),
                "points_added": diff
            })

    # Active uncancelled doshas
    nadi_koota = kootas[7]
    bhakoot_koota = kootas[6]
    yoni_koota = kootas[3]

    active_uncancelled_doshas: List[str] = []
    if nadi_koota["has_dosha"] and not nadi_koota.get("is_cancelled", False):
        active_uncancelled_doshas.append("Uncancelled Nadi Dosha")
    if bhakoot_koota["has_dosha"] and not bhakoot_koota.get("is_cancelled", False):
        active_uncancelled_doshas.append("Uncancelled Bhakoot Dosha")
    if yoni_koota.get("is_sworn_enemy", False):
        active_uncancelled_doshas.append("Sworn Enemy Yoni (Maha Shatru)")

    # Conditional cancellations present
    cancellations_present: List[str] = []
    if nadi_koota["has_dosha"] and nadi_koota.get("is_cancelled", False):
        cancellations_present.append(f"Nadi Dosha ({nadi_koota.get('cancellation_rule', 'Same Rashi, Different Nakshatra')})")
    if bhakoot_koota["has_dosha"] and bhakoot_koota.get("is_cancelled", False):
        cancellations_present.append(f"Bhakoot Dosha ({bhakoot_koota.get('cancellation_rule', 'Friendly/Same Lord')})")

    is_raw_acceptable = raw_total_points >= min_score_threshold
    is_effective_acceptable = effective_total_points >= min_score_threshold

    # Neutral headline and summary formulation (NO subjective verdicts like "favourable" or "not favourable")
    headline = f"Raw Ashtakoota: {raw_total_points:.1f}/36 ({raw_percentage:.1f}%)"
    if has_vashya_diff:
        alt_mode = vashya_koota["alternate_option"]["vashya_capricorn"]
        headline += f" • Alternate ({alt_mode}): {alternate_vashya_total:.1f}/36 (school difference; unverified)"

    verdict = f"{raw_total_points:.1f} / 36.0 points"
    summary = f"Raw Ashtakoota score is {raw_total_points:.1f}/36.0 ({raw_percentage:.1f}%)."
    if has_vashya_diff:
        alt_mode = vashya_koota["alternate_option"]["vashya_capricorn"]
        summary += f" Under alternate Capricorn classification ({alt_mode}), total score is {alternate_vashya_total:.1f}/36.0 (school difference; unverified)."
    summary += " Calculations are software-derived; unverified; traditions differ."

    return {
        "raw_total_points": raw_total_points,
        "effective_total_points": effective_total_points,
        "total_points": raw_total_points,  # SCORE HONESTY: default total is raw
        "max_points": max_total,
        "raw_percentage": raw_percentage,
        "effective_percentage": effective_percentage,
        "percentage": raw_percentage,
        "min_score_threshold": min_score_threshold,
        "is_compatible": is_raw_acceptable,
        "verdict": verdict,
        "headline": headline,
        "summary": summary,
        "vashya_capricorn": vashya_capricorn,
        "alternate_vashya_total": alternate_vashya_total,
        "vashya_difference_note": vashya_difference_note,
        "has_vashya_diff": has_vashya_diff,
        "has_vashya_difference": has_vashya_diff,
        "active_doshas": active_uncancelled_doshas,
        "cancellations_present": cancellations_present,
        "rules_producing_difference": rules_producing_difference,
        "kootas": kootas
    }
