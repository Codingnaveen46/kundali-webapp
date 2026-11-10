"""Dosha evaluations: Mangal Dosha, Kaal Sarpa Yoga, and Sade Sati."""

from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import swisseph as swe

from .constants import SIGNS, SANSKRIT_SIGNS

MANGAL_HOUSES = [1, 2, 4, 7, 8, 12]

KAAL_SARPA_TYPES = [
    {"name": "Anant", "rahu_house": 1, "description": "Rahu in 1st, Ketu in 7th (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Kulik", "rahu_house": 2, "description": "Rahu in 2nd, Ketu in 8th (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Vasuki", "rahu_house": 3, "description": "Rahu in 3rd, Ketu in 9th (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Shankhpal", "rahu_house": 4, "description": "Rahu in 4th, Ketu in 10th (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Padma", "rahu_house": 5, "description": "Rahu in 5th, Ketu in 11th (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Mahapadma", "rahu_house": 6, "description": "Rahu in 6th, Ketu in 12th (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Takshak", "rahu_house": 7, "description": "Rahu in 7th, Ketu in 1st (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Karkotak", "rahu_house": 8, "description": "Rahu in 8th, Ketu in 2nd (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Shankhnad", "rahu_house": 9, "description": "Rahu in 9th, Ketu in 3rd (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Ghatak", "rahu_house": 10, "description": "Rahu in 10th, Ketu in 4th (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Vishdhar", "rahu_house": 11, "description": "Rahu in 11th, Ketu in 5th (type-name nomenclature only; unverified; traditions differ)"},
    {"name": "Sheshnag", "rahu_house": 12, "description": "Rahu in 12th, Ketu in 6th (type-name nomenclature only; unverified; traditions differ)"}
]


def get_mars_dignity(mars_sign: str) -> str:
    """Computes Mars dignity based on classical Naisargika Sambandha."""
    if mars_sign in ("Aries", "Scorpio"):
        return "Own Sign (Swakshetra)"
    elif mars_sign == "Capricorn":
        return "Exalted (Uchcha)"
    elif mars_sign == "Cancer":
        return "Debilitated (Neecha)"
    elif mars_sign in ("Leo", "Sagittarius", "Pisces"):
        return "Friendly Sign (Mitra Rashi)"
    elif mars_sign in ("Taurus", "Libra", "Aquarius"):
        return "Neutral Sign (Sama Rashi)"
    elif mars_sign in ("Gemini", "Virgo"):
        return "Enemy Sign (Shatru Rashi)"
    return "Neutral Sign"


POTENTIAL_MANGAL_CANCELLATION_CONDITIONS = [
    {"num": 1, "rule": "Mars in Aries in 1st House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in own sign Aries in Lagna."},
    {"num": 2, "rule": "Mars in Taurus in 12th House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in Taurus in 12th house."},
    {"num": 3, "rule": "Mars in Gemini in 2nd House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in Gemini in 2nd house."},
    {"num": 4, "rule": "Mars in Cancer in 8th House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in debilitation sign Cancer in 8th house."},
    {"num": 5, "rule": "Mars in Leo in 4th House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in Leo in 4th house."},
    {"num": 6, "rule": "Mars in Scorpio in 7th House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in own sign Scorpio in 7th house."},
    {"num": 7, "rule": "Mars in Sagittarius in 12th House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in Sagittarius in 12th house."},
    {"num": 8, "rule": "Mars Exalted in Capricorn in 7th/8th House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars exalted in Capricorn in 7th or 8th house."},
    {"num": 9, "rule": "Mars in Aquarius in 8th House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in Aquarius in 8th house."},
    {"num": 10, "rule": "Mars in Pisces in 7th/8th House", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in Pisces in 7th or 8th house."},
    {"num": 11, "rule": "Guru-Mangala Yoga (Mars conjunct Jupiter)", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars conjunct Jupiter in the same zodiac sign."},
    {"num": 12, "rule": "Jupiter Aspect on Mars (5th, 7th, 9th Drishti)", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Jupiter casting 5th, 7th, or 9th house aspect on Mars."},
    {"num": 13, "rule": "Chandra-Mangala Yoga (Mars conjunct Moon)", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars conjunct Moon in the same zodiac sign."},
    {"num": 14, "rule": "Mars in 2nd house in Virgo", "source": "unverified; traditions differ", "status": "UNVERIFIED", "desc": "Mars in Virgo in 2nd house."}
]
CLASSICAL_14_CANCELLATION_CONDITIONS = POTENTIAL_MANGAL_CANCELLATION_CONDITIONS


def check_mangal_dosha(
    mars_sign_idx: int,
    mars_house: Optional[int],
    moon_sign_idx: int,
    venus_sign_idx: int,
    jupiter_sign_idx: Optional[int] = None,
    saturn_sign_idx: Optional[int] = None
) -> Dict[str, Any]:
    """Evaluates Mangal Dosha (Kuja Dosha) with 3 separate reference rows, strict Lagna/Moon default basis, and unverified cancellation conditions."""
    mars_sign = SIGNS[mars_sign_idx]
    mars_dignity = get_mars_dignity(mars_sign)
    
    # Houses relative to Moon and Venus
    mars_from_moon = ((mars_sign_idx - moon_sign_idx) % 12) + 1
    mars_from_venus = ((mars_sign_idx - venus_sign_idx) % 12) + 1
    
    afflicted_from_lagna = mars_house in MANGAL_HOUSES if mars_house is not None else False
    afflicted_from_moon = mars_from_moon in MANGAL_HOUSES
    afflicted_from_venus = mars_from_venus in MANGAL_HOUSES
    
    rule_used_text = "Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house causes Kuja Dosha (Source: unverified; traditions differ)"
    
    # 3 Separate Rows
    reference_rows = [
        {
            "reference_point": "Lagna (Ascendant)",
            "house_number": mars_house,
            "sign": mars_sign,
            "dignity": mars_dignity,
            "is_afflicted": afflicted_from_lagna if mars_house is not None else False,
            "rule_used": rule_used_text if mars_house is not None else "Birth place not provided, Lagna and houses unavailable",
            "status_label": "Unavailable (Birth place not provided)" if mars_house is None else ("Afflicted" if afflicted_from_lagna else "No Dosha"),
            "note": "Birth place not provided, Lagna and houses unavailable" if mars_house is None else None,
            "is_primary": True,
            "is_available": mars_house is not None
        },
        {
            "reference_point": "Moon (Chandra Lagna)",
            "house_number": mars_from_moon,
            "sign": mars_sign,
            "dignity": mars_dignity,
            "is_afflicted": afflicted_from_moon,
            "rule_used": rule_used_text,
            "status_label": "Afflicted" if afflicted_from_moon else "No Dosha",
            "is_primary": True,
            "is_available": True
        },
        {
            "reference_point": "Venus (Shukra Lagna)",
            "house_number": mars_from_venus,
            "sign": mars_sign,
            "dignity": mars_dignity,
            "is_afflicted": afflicted_from_venus,
            "rule_used": "Secondary tradition check (optional secondary reference; not used for primary Mangal classification)",
            "status_label": "Afflicted (Secondary)" if afflicted_from_venus else "No Dosha",
            "is_primary": False,
            "is_available": True
        }
    ]
    
    # DEFAULT BASIS: Lagna and Moon ONLY. Venus is an optional secondary check.
    # When Lagna is unavailable (e.g. birth place not provided / place_assumed),
    # Lagna basis is excluded and primary evaluation depends solely on Moon.
    primary_afflicted_points: List[str] = []
    if mars_house is not None and afflicted_from_lagna:
        primary_afflicted_points.append("Lagna")
    if afflicted_from_moon:
        primary_afflicted_points.append("Moon")
        
    is_present_raw = len(primary_afflicted_points) > 0
    
    cancellations: List[Dict[str, str]] = []
    
    # Check potential cancellation conditions (all unverified by default)
    if mars_house == 1 and mars_sign == "Aries":
        cancellations.append({"rule": "Mars in Aries in 1st House", "source": "unverified; traditions differ", "desc": "Mars in own sign Aries in Lagna."})
    elif mars_house == 12 and mars_sign in ("Taurus", "Libra"):
        cancellations.append({
            "rule": "Mars in Taurus/Libra in 12th House",
            "source": "unverified; traditions differ",
            "desc": "Mars in Taurus/Libra in the 12th; Shravana nakshatra exemption seen on another site"
        })
    elif mars_house == 2 and mars_sign == "Gemini":
        cancellations.append({"rule": "Mars in Gemini in 2nd House", "source": "unverified; traditions differ", "desc": "Mars in Gemini in 2nd house."})
    elif mars_house == 8 and mars_sign == "Cancer":
        cancellations.append({"rule": "Mars in Cancer in 8th House", "source": "unverified; traditions differ", "desc": "Mars in debilitation sign Cancer in 8th house."})
    elif mars_house == 4 and mars_sign == "Leo":
        cancellations.append({"rule": "Mars in Leo in 4th House", "source": "unverified; traditions differ", "desc": "Mars in Leo in 4th house."})
    elif mars_house == 7 and mars_sign == "Scorpio":
        cancellations.append({"rule": "Mars in Scorpio in 7th House", "source": "unverified; traditions differ", "desc": "Mars in own sign Scorpio in 7th house."})
    elif mars_house == 12 and mars_sign == "Sagittarius":
        cancellations.append({"rule": "Mars in Sagittarius in 12th House", "source": "unverified; traditions differ", "desc": "Mars in Sagittarius in 12th house."})
    elif mars_house in (7, 8) and mars_sign == "Capricorn":
        cancellations.append({"rule": "Mars Exalted in Capricorn in 7th/8th House", "source": "unverified; traditions differ", "desc": "Mars exalted in Capricorn in 7th or 8th house."})
    elif mars_house == 8 and mars_sign == "Aquarius":
        cancellations.append({"rule": "Mars in Aquarius in 8th House", "source": "unverified; traditions differ", "desc": "Mars in Aquarius in 8th house."})
    elif mars_house in (7, 8) and mars_sign == "Pisces":
        cancellations.append({"rule": "Mars in Pisces in 7th/8th House", "source": "unverified; traditions differ", "desc": "Mars in Pisces in 7th or 8th house."})
        
    if jupiter_sign_idx is not None and mars_sign_idx == jupiter_sign_idx:
        cancellations.append({"rule": "Guru-Mangala Yoga (Mars conjunct Jupiter)", "source": "unverified; traditions differ", "desc": "Mars conjunct Jupiter in the same zodiac sign."})
    elif jupiter_sign_idx is not None and ((jupiter_sign_idx - mars_sign_idx) % 12 in (4, 6, 8)):
        cancellations.append({"rule": "Jupiter Aspect on Mars (5th, 7th, or 9th Drishti)", "source": "unverified; traditions differ", "desc": "Jupiter casting 5th, 7th, or 9th house aspect on Mars."})
        
    if mars_sign_idx == moon_sign_idx:
        cancellations.append({"rule": "Chandra-Mangala Yoga (Mars conjunct Moon)", "source": "unverified; traditions differ", "desc": "Mars conjunct Moon in the same zodiac sign."})
        
    is_cancelled = len(cancellations) > 0 and is_present_raw
    if cancellations and mars_house is not None and afflicted_from_lagna:
        notes_str = "; ".join(c["desc"] for c in cancellations)
        reference_rows[0]["note"] = notes_str
        reference_rows[0]["status_label"] = "Afflicted (Possible mitigation noted)"
    
    # Final output formulation: One of "Not present", "Not present from Moon; Lagna unavailable",
    # "Present (reference points: ...)", or "Present, possible mitigation noted (rule unverified; traditions differ)"
    if not is_present_raw:
        if mars_house is None:
            verdict = "Not present from Moon; Lagna unavailable"
            severity = "None"
            status = "Not present from Moon; Lagna unavailable"
        else:
            verdict = "Not present"
            severity = "None"
            status = "Not present"
    elif is_cancelled:
        verdict = "Present, possible mitigation noted (rule unverified; traditions differ)"
        severity = "Possible Mitigation (Unverified)"
        status = "Present, possible mitigation noted (rule unverified; traditions differ)"
    else:
        verdict = f"Present (reference points: {', '.join(primary_afflicted_points)})"
        severity = "High" if len(primary_afflicted_points) >= 2 else "Moderate"
        status = verdict

    result_label = f"Present ({', '.join(primary_afflicted_points)})" if primary_afflicted_points else ("Not present from Moon; Lagna unavailable" if mars_house is None else "Not present")
        
    return {
        "result": result_label,
        "is_present": is_present_raw,
        "is_raw_present": is_present_raw,
        "is_cancelled": is_cancelled,
        "severity": severity,
        "status": status,
        "verdict": verdict,
        "mars_sign": mars_sign,
        "mars_dignity": mars_dignity,
        "mars_house_lagna": mars_house,
        "mars_house_moon": mars_from_moon,
        "mars_house_venus": mars_from_venus,
        "reference_rows": reference_rows,
        "primary_basis": "Lagna and Moon",
        "secondary_basis": "Venus (clearly labelled optional secondary check)",
        "afflicted_from": {
            "lagna": afflicted_from_lagna if mars_house is not None else None,
            "moon": afflicted_from_moon,
            "venus": afflicted_from_venus
        },
        "cancellations": cancellations,
        "classical_14_conditions": POTENTIAL_MANGAL_CANCELLATION_CONDITIONS,
        "potential_14_conditions": POTENTIAL_MANGAL_CANCELLATION_CONDITIONS
    }


def check_kaal_sarpa(
    planets: Dict[str, Dict[str, Any]],
    lagna_sign_idx: Optional[int] = None
) -> Dict[str, Any]:
    """Evaluates Kaal Sarpa as a rule: a FULL Kaal Sarpa requires all seven
    classical planets (Sun to Saturn) to lie within one 180° arc of the
    Rahu-Ketu axis (Rahu to Ketu, or Ketu to Rahu).

    A type name (Anant, Kulik, ...) is only attached when the full condition
    holds. Partial distributions are reported as "Not a full Kaal Sarpa (…)"
    with the planets outside the arc named; neutral wording, no interpretation.
    Rule category only; unverified; traditions differ.
    """
    rahu_long = planets["Rahu"]["longitude"]
    ketu_long = planets["Ketu"]["longitude"]

    classical_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]

    # A planet exactly on the axis (conjunct Rahu or Ketu) lies on the
    # boundary and counts as inside BOTH arcs.
    side_1: list = []  # within arc Rahu -> Ketu
    side_2: list = []  # within arc Ketu -> Rahu
    for p_name in classical_planets:
        dist_from_rahu = (planets[p_name]["longitude"] - rahu_long) % 360.0
        if 0.0 <= dist_from_rahu <= 180.0:
            side_1.append(p_name)
        if 180.0 <= dist_from_rahu <= 360.0:
            side_2.append(p_name)

    total = len(classical_planets)  # 7
    full_by_side1 = len(side_1) == total
    full_by_side2 = len(side_2) == total
    is_purna = full_by_side1 or full_by_side2
    is_khanda = len(side_1) == total - 1 or len(side_2) == total - 1
    yoga_present = is_purna

    rahu_house = None
    direction = None
    yoga_name = "None"
    if is_purna:
        direction = "Savya" if full_by_side1 else "Apsavya"
        if lagna_sign_idx is not None:
            rahu_sign_idx = planets["Rahu"]["sign_idx"]
            rahu_house = ((rahu_sign_idx - lagna_sign_idx) % 12) + 1
            yoga_name = f"{KAAL_SARPA_TYPES[rahu_house - 1]['name']} Kaal Sarpa Yoga"

    # --- Variant rule (Moon excluded) ----------------------------------------
    # A different school counts only the six planets Sun–Saturn on one side,
    # ignoring the Moon. Reported as its own unverified rule; a type name is
    # only ever attached under the strict seven-planet rule above.
    side_1_no_moon = [p for p in side_1 if p != "Moon"]
    side_2_no_moon = [p for p in side_2 if p != "Moon"]
    variant_full = len(side_1_no_moon) == 6 or len(side_2_no_moon) == 6
    if is_purna:
        variant_note = "Full by the strict seven-planet rule; the Moon-excluded variant is not shown separately."
    elif variant_full:
        variant_note = (
            "Full by the Moon-excluded variant (all six planets Sun to Saturn lie "
            "within one 180° arc of the Rahu-Ketu axis; the Moon lies outside). "
            "Type-name nomenclature is only stated under the strict rule."
        )
    else:
        outside_variant = [p for p in classical_planets if p != "Moon" and p not in
                           (side_1_no_moon if len(side_1_no_moon) >= len(side_2_no_moon) else side_2_no_moon)]
        variant_note = (
            f"Not full by the Moon-excluded variant either ({len(outside_variant)} planet(s) "
            f"outside the axis: {', '.join(outside_variant) or 'none'})."
        ) if outside_variant else (
            "Not full by the Moon-excluded variant; planets lie on both sides of the axis."
        )

    if is_purna:
        type_desc = (
            f"Full Kaal Sarpa: all seven classical planets (Sun to Saturn) lie within one "
            f"180° arc of the Rahu-Ketu axis."
        )
        if lagna_sign_idx is not None and rahu_house is not None:
            type_desc += f" Rahu in house {rahu_house} from Lagna, direction {direction}."
            type_desc += f" Type-name nomenclature only ({yoga_name}); unverified; traditions differ."
        else:
            type_desc += " Lagna unavailable; house-specific type name omitted."
    else:
        # Not full: name the planets outside the majority arc (planets exactly
        # on the axis count as inside both arcs, so they are never "outside").
        majority = side_1 if len(side_1) >= len(side_2) else side_2
        outside = [p for p in classical_planets if p not in majority]
        if len(outside) == 0:
            outside_note = "planets lie on both sides of the axis"
        elif len(outside) == 1:
            outside_note = f"one planet outside the axis: {outside[0]}"
        else:
            outside_note = f"{len(outside)} planets outside the axis: {', '.join(outside)}"
        type_desc = f"Not a full Kaal Sarpa ({outside_note})."
        if is_khanda:
            type_desc += " Partial (Khanda) distribution by the counts used here; unverified; traditions differ."

    return {
        "is_present": yoga_present,
        "is_purna": is_purna,
        "is_khanda": is_khanda,
        "intensity": "Purna (Full)" if is_purna else ("Khanda (Partial)" if is_khanda else "None"),
        "direction": direction,
        "rahu_house": rahu_house,
        "side_counts": {
            "rahu_to_ketu": sorted(side_1),
            "ketu_to_rahu": sorted(side_2)
        },
        "yoga_name": yoga_name,
        # Variant school (Moon excluded), always labelled unverified; a type
        # name is only ever attached under the strict seven-planet rule.
        "variant_excluding_moon": {
            "is_full": variant_full if not is_purna else True,
            "note": variant_note,
            "rule_label": "unverified rule (Moon-excluded variant; traditions differ)"
        },
        "description": type_desc
    }


def check_sade_sati(
    natal_moon_sign_idx: int,
    current_saturn_long: Optional[float] = None,
    current_jd: Optional[float] = None
) -> Dict[str, Any]:
    """Calculates Sade Sati (7.5-year Saturn transit relative to natal Moon) and Kantaka Shani.
    
    If current_saturn_long is not provided, computes it for current_jd (or now).
    """
    if current_saturn_long is None:
        if current_jd is None:
            import time as _time
            now = datetime.now(timezone.utc)
            current_jd = swe.julday(now.year, now.month, now.day,
                                    now.hour + now.minute / 60.0)
        res, _ = swe.calc_ut(current_jd, swe.SATURN, swe.FLG_SIDEREAL | swe.FLG_MOSEPH)
        current_saturn_long = res[0] % 360.0
        
    saturn_sign_idx = int(current_saturn_long // 30.0)
    diff_from_moon = (saturn_sign_idx - natal_moon_sign_idx) % 12
    
    is_sade_sati = False
    phase_name = "Not Active"
    phase_desc = "Saturn is not currently transiting the 12th, 1st, or 2nd houses from your natal Moon."
    
    if diff_from_moon == 11:
        is_sade_sati = True
        phase_name = "Rising Phase (First Dhayya)"
        phase_desc = "Saturn is transiting the 12th house from natal Moon (first phase of the 7.5-year window used here; unverified; traditions differ)."
    elif diff_from_moon == 0:
        is_sade_sati = True
        phase_name = "Peak Phase (Janma Shani / Second Dhayya)"
        phase_desc = "Saturn is transiting the 1st from natal Moon (conjunct it); middle phase of the 7.5-year window used here (unverified; traditions differ)."
    elif diff_from_moon == 1:
        is_sade_sati = True
        phase_name = "Setting Phase (Third Dhayya)"
        phase_desc = "Saturn is transiting the 2nd house from natal Moon (last phase of the 7.5-year window used here; unverified; traditions differ)."
        
    # Kantaka / Ashtama Shani checks:
    # 4th house from Moon = Ardhastama Shani (Small panoti)
    # 8th house from Moon = Ashtama Shani
    is_ashtama_shani = (diff_from_moon == 7)
    is_ardhastama_shani = (diff_from_moon == 3)

    # --- Approximate window dates (sign-ingress scan) -------------------------
    # The 7.5-year Sade Sati window runs while Saturn transits the three
    # contiguous sidereal signs 12th, 1st and 2nd from the natal Moon. Dates
    # come from a 15-day scan with bisected edges and are approximate and
    # unverified; traditions differ on the exact window construction. Only
    # the previous and next windows are listed; nothing about quality or
    # effect is implied.
    windows: Dict[str, Any] = {
        "rule_label": "unverified rule (whole-sign 7.5-year window; traditions differ)",
        "note": ("Approximate dates from Saturn's sidereal sign crossings "
                 "(scan ±1 day); they are rule-level dates only."),
        "last_window": None,
        "next_window": None
    }
    try:
        windows = _sade_sati_windows(natal_moon_sign_idx, current_jd)
    except Exception:
        # Scan failure must never break the dosha payload.
        windows["note"] += " (dates unavailable due to a scan error)"

    # Current Saturn position in DMS for the report card
    saturn_dms_int = int(current_saturn_long % 30.0)
    saturn_min = int(((current_saturn_long % 30.0) - saturn_dms_int) * 60.0)
    saturn_sec = int(round((((current_saturn_long % 30.0) - saturn_dms_int) * 60.0 - saturn_min) * 60.0))
    current_saturn_dms = f"{saturn_dms_int:02d}° {saturn_min:02d}' {saturn_sec:02d}\""

    def _deg_dms(deg: float) -> str:
        d = int(deg % 360.0)
        rem_m = (deg % 360.0 - d) * 60.0
        m = int(rem_m)
        s = int(round((rem_m - m) * 60.0))
        if s == 60:
            m += 1
            s = 0
        return f"{d:02d}° {m:02d}' {s:02d}\""

    return {
        "is_active": is_sade_sati,
        "phase": phase_name,
        "description": phase_desc,
        "current_saturn_sign": SIGNS[saturn_sign_idx],
        "current_saturn_sign_sanskrit": SANSKRIT_SIGNS[saturn_sign_idx],
        "current_saturn_deg_in_sign": current_saturn_dms,
        "current_saturn_total_dms": _deg_dms(current_saturn_long),
        "is_ashtama_shani": is_ashtama_shani,
        "is_ardhastama_shani": is_ardhastama_shani,
        "windows": windows,
        "counsel": "Rule category only: Saturn transits over the 12th, 1st and 2nd from the natal Moon define the 7.5-year Sade Sati window used here (unverified; traditions differ)."
    }


def _saturn_sign_idx_at(jd: float) -> int:
    """Sidereal sign index of Saturn at the given UT Julian day (Moshier fallback)."""
    res, _ = swe.calc_ut(jd, swe.SATURN, swe.FLG_SIDEREAL | swe.FLG_MOSEPH)
    return int((res[0] % 360.0) // 30.0)


def _sade_sati_windows(natal_moon_sign_idx: int, current_jd: Optional[float]) -> Dict[str, Any]:
    """Finds the approximate start/end of the Sade Sati windows around `current_jd`.

    Window start = Saturn's first ingress into the 12th sign from the natal
    Moon; window end = the last time it leaves the 2nd sign from the natal
    Moon ( Saturn stays inside the union of the three signs, merged across
    short retrograde exits of a few weeks).
    """
    if current_jd is None:
        current_jd = swe.julday(2026, 11, 10, 12.0)
    start_sign = (natal_moon_sign_idx - 1) % 12
    end_sign = (natal_moon_sign_idx + 1) % 12

    # ---- scan: union intervals where Saturn's sidereal sign is 12th/1st/2nd ----
    # from 23 years back (long enough to include the previous full window)
    # to 31 years forward. Refined edges are bisected to ~1 s; a retrograde
    # dip shorter than the 15-day step is not detected (merge rule covers
    # the common few-week exits).
    lo = current_jd - 23.0 * 365.25
    hi = current_jd + 31.0 * 365.25
    step = 15.0

    def _inside(t: float) -> bool:
        return _saturn_sign_idx_at(t) in (start_sign, natal_moon_sign_idx, end_sign)

    def _refine_edge(a: float, b: float, inside_at_a: bool) -> float:
        """Transition between a and b is assumed; _inside flips between them.

        Returns the boundary time: the LAST inside moment when Saturn is
        leaving (inside_at_a=True), the FIRST inside moment when entering.
        """
        lo2, hi2 = a, b
        while hi2 - lo2 > 1.0 / 86400.0:
            mid = (lo2 + hi2) / 2.0
            inside_mid = _inside(mid)
            if inside_at_a:
                if inside_mid:
                    lo2 = mid
                else:
                    hi2 = mid
            else:
                if inside_mid:
                    hi2 = mid
                else:
                    lo2 = mid
        return lo2 if inside_at_a else hi2

    intervals = []          # (start_boundary, end_boundary) in JD
    open_start = None       # refined start of a window still in progress
    prev_t = lo
    prev_in = _inside(lo)
    if prev_in:
        # Scan begins inside a window: extrapolate the start to lo - step
        # and refine (rare: only if a window predates the 23y look-back).
        open_start = _refine_edge(prev_t - step, prev_t, False)
    t = lo + step
    while t < hi:
        cur_in = _inside(t)
        if cur_in != prev_in:
            if cur_in:
                # rising edge: outside at prev_t, inside at t
                open_start = _refine_edge(prev_t, t, False)
            else:
                # falling edge: inside at prev_t, outside at t
                intervals.append((open_start, _refine_edge(prev_t, t, True)))
                open_start = None
        prev_t, prev_in = t, cur_in
        t += step
    if open_start is not None:
        intervals.append((open_start, hi))  # window still open at hi

    # Merge intervals separated by short gaps (< ~75 days, brief retro exits)
    merged = []
    for a, b in intervals:
        if merged and (a - merged[-1][1]) < 75.0:
            merged[-1] = (merged[-1][0], b)
        else:
            merged.append((a, b))

    windows: Dict[str, Any] = {
        "rule_label": "unverified rule (whole-sign 7.5-year window; traditions differ)",
        "note": ("Approximate dates from Saturn's sidereal sign crossings "
                 "(15-day scan, edges refined; sub-fortnight retrograde dips are merged)."),
        "last_window": None,
        "next_window": None
    }

    def fmt(jd) -> str:
        y, m, d, _ = swe.revjul(jd)
        return f"{y:04d}-{m:02d}-{d:02d}"

    for a, b in merged:
        if b >= current_jd and windows["next_window"] is None:
            # window overlapping or after "now"
            windows["next_window"] = {"start": fmt(max(a, current_jd - 0)), "end": None if b > hi - 1 else fmt(b), "start_date": fmt(a)}
        elif b < current_jd:
            windows["last_window"] = {"start": fmt(a), "end": fmt(b)}
        if windows["next_window"] and windows["last_window"]:
            break
    return windows
