"""Dosha evaluations: Mangal Dosha, Kaal Sarpa Yoga, and Sade Sati."""

from typing import Dict, List, Any, Optional
import swisseph as swe

from .constants import SIGNS, SANSKRIT_SIGNS

MANGAL_HOUSES = [1, 2, 4, 7, 8, 12]

KAAL_SARPA_TYPES = [
    {"name": "Anant", "rahu_house": 1, "description": "Rahu in 1st, Ketu in 7th - impact on self and partnership"},
    {"name": "Kulik", "rahu_house": 2, "description": "Rahu in 2nd, Ketu in 8th - impact on finances, lineage and speech"},
    {"name": "Vasuki", "rahu_house": 3, "description": "Rahu in 3rd, Ketu in 9th - impact on siblings, courage and fortunes"},
    {"name": "Shankhpal", "rahu_house": 4, "description": "Rahu in 4th, Ketu in 10th - impact on mother, domestic peace, vehicles"},
    {"name": "Padma", "rahu_house": 5, "description": "Rahu in 5th, Ketu in 11th - impact on intellect, education and progeny"},
    {"name": "Mahapadma", "rahu_house": 6, "description": "Rahu in 6th, Ketu in 12th - victory over enemies but hidden debts/stresses"},
    {"name": "Takshak", "rahu_house": 7, "description": "Rahu in 7th, Ketu in 1st - marital friction, partnership challenges"},
    {"name": "Karkotak", "rahu_house": 8, "description": "Rahu in 8th, Ketu in 2nd - sudden transformations, health vigilance"},
    {"name": "Shankhnad", "rahu_house": 9, "description": "Rahu in 9th, Ketu in 3rd - dharma, father and fortune fluctuations"},
    {"name": "Ghatak", "rahu_house": 10, "description": "Rahu in 10th, Ketu in 4th - career ups and downs, public reputation"},
    {"name": "Vishdhar", "rahu_house": 11, "description": "Rahu in 11th, Ketu in 5th - elder siblings, speculative investments"},
    {"name": "Sheshnag", "rahu_house": 12, "description": "Rahu in 12th, Ketu in 6th - expenditures, overseas travels, sleep"}
]


def check_mangal_dosha(
    mars_sign_idx: int,
    mars_house: Optional[int],
    moon_sign_idx: int,
    venus_sign_idx: int,
    jupiter_sign_idx: Optional[int] = None,
    saturn_sign_idx: Optional[int] = None
) -> Dict[str, Any]:
    """Evaluates Mangal Dosha (Kuja Dosha) from Lagna, Moon, and Venus with classical cancellations."""
    mars_sign = SIGNS[mars_sign_idx]
    
    # Houses relative to Moon and Venus
    mars_from_moon = ((mars_sign_idx - moon_sign_idx) % 12) + 1
    mars_from_venus = ((mars_sign_idx - venus_sign_idx) % 12) + 1
    
    afflicted_from_lagna = mars_house in MANGAL_HOUSES if mars_house is not None else False
    afflicted_from_moon = mars_from_moon in MANGAL_HOUSES
    afflicted_from_venus = mars_from_venus in MANGAL_HOUSES
    
    is_present_raw = afflicted_from_lagna or afflicted_from_moon or afflicted_from_venus
    
    cancellations: List[Dict[str, str]] = []
    
    # 1. Sign-specific cancellations
    if mars_house == 1 and mars_sign == "Aries":
        cancellations.append({"rule": "Mars in Aries in 1st House", "citation": "BPHS / Muhurtha Chintamani", "desc": "Mars in own sign in Lagna nullifies dosha."})
    elif mars_house == 12 and mars_sign == "Taurus":
        cancellations.append({"rule": "Mars in Taurus in 12th House", "citation": "Muhurtha Chintamani", "desc": "Mars in Taurus in 12th is neutral."})
    elif mars_house == 2 and mars_sign == "Gemini":
        cancellations.append({"rule": "Mars in Gemini in 2nd House", "citation": "Devakeralam", "desc": "Mars in Gemini in 2nd nullifies dosha."})
    elif mars_house == 8 and mars_sign == "Cancer":
        cancellations.append({"rule": "Mars in Cancer in 8th House", "citation": "BPHS", "desc": "Mars debilitated in 8th house loses malefic strength for Kuja dosha."})
    elif mars_house == 4 and mars_sign == "Leo":
        cancellations.append({"rule": "Mars in Leo in 4th House", "citation": "Muhurtha Chintamani", "desc": "Mars in friendly Sun sign Leo in 4th house nullifies dosha."})
    elif mars_house == 7 and mars_sign == "Scorpio":
        cancellations.append({"rule": "Mars in Scorpio in 7th House", "citation": "BPHS", "desc": "Mars in own sign Scorpio in 7th house nullifies dosha."})
    elif mars_house == 12 and mars_sign == "Sagittarius":
        cancellations.append({"rule": "Mars in Sagittarius in 12th House", "citation": "Muhurtha Chintamani", "desc": "Mars in friendly Jupiter sign Sagittarius in 12th nullifies dosha."})
    elif mars_house in (7, 8) and mars_sign == "Capricorn":
        cancellations.append({"rule": "Mars Exalted in Capricorn", "citation": "BPHS", "desc": "Exalted Mars in 7th/8th house loses malefic sting."})
    elif mars_house == 8 and mars_sign == "Aquarius":
        cancellations.append({"rule": "Mars in Aquarius in 8th House", "citation": "Muhurtha Chintamani", "desc": "Mars in Aquarius in 8th nullifies dosha."})
    elif mars_house in (7, 8) and mars_sign == "Pisces":
        cancellations.append({"rule": "Mars in Pisces in 7th/8th House", "citation": "BPHS", "desc": "Mars in friendly Jupiter sign Pisces nullifies dosha."})
        
    # 2. Conjunction with Jupiter or Moon
    if jupiter_sign_idx is not None and mars_sign_idx == jupiter_sign_idx:
        cancellations.append({"rule": "Guru-Mangala Yoga", "citation": "Phaladeepika", "desc": "Mars conjunct benefic Jupiter completely pacifies Kuja dosha."})
    elif jupiter_sign_idx is not None and ((jupiter_sign_idx - mars_sign_idx) % 12 in (4, 6, 8)):  # 5th, 7th, 9th aspects
        cancellations.append({"rule": "Jupiter Aspect on Mars", "citation": "Brihat Jataka", "desc": "Direct aspect of Jupiter on Mars relieves Kuja dosha."})
        
    if mars_sign_idx == moon_sign_idx:
        cancellations.append({"rule": "Chandra-Mangala Yoga", "citation": "Jataka Parijata", "desc": "Conjunction of Moon and Mars neutralizes dosha."})
        
    is_cancelled = len(cancellations) > 0
    
    # Severity assessment
    if not is_present_raw:
        severity = "None"
        status = "No Mangal Dosha"
    elif is_cancelled:
        severity = "Cancelled"
        status = "Mangal Dosha Cancelled by Classical Rules"
    else:
        # Determine intensity
        factor_count = sum([afflicted_from_lagna, afflicted_from_moon, afflicted_from_venus])
        if factor_count >= 2:
            severity = "High"
            status = "Strong Mangal Dosha"
        elif afflicted_from_lagna:
            severity = "Medium"
            status = "Moderate Mangal Dosha (Lagna)"
        else:
            severity = "Low"
            status = "Mild Mangal Dosha (Moon/Venus)"
            
    return {
        "is_present": is_present_raw and not is_cancelled,
        "is_raw_present": is_present_raw,
        "is_cancelled": is_cancelled,
        "severity": severity,
        "status": status,
        "mars_sign": mars_sign,
        "mars_house_lagna": mars_house,
        "mars_house_moon": mars_from_moon,
        "mars_house_venus": mars_from_venus,
        "afflicted_from": {
            "lagna": afflicted_from_lagna,
            "moon": afflicted_from_moon,
            "venus": afflicted_from_venus
        },
        "cancellations": cancellations
    }


def check_kaal_sarpa(
    planets: Dict[str, Dict[str, Any]],
    lagna_sign_idx: Optional[int] = None
) -> Dict[str, Any]:
    """Evaluates Kaal Sarpa Yoga (Purna, Khanda/Anshik, or None).
    
    Checks if all 7 classical planets lie on one side of Rahu-Ketu axis.
    """
    rahu_long = planets["Rahu"]["longitude"]
    ketu_long = planets["Ketu"]["longitude"]
    
    classical_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    
    side_1_count = 0  # Between Rahu and Ketu (moving forward from Rahu to Ketu)
    side_2_count = 0  # Between Ketu and Rahu (moving forward from Ketu to Rahu)
    
    for p_name in classical_planets:
        p_long = planets[p_name]["longitude"]
        
        # Check if p_long lies in the arc from Rahu to Ketu (mod 360)
        # Arc length from Rahu to Ketu is exactly 180°
        dist_from_rahu = (p_long - rahu_long) % 360.0
        if 0.0 < dist_from_rahu < 180.0:
            side_1_count += 1
        elif 180.0 < dist_from_rahu < 360.0:
            side_2_count += 1
        else:
            # Exactly conjunct Rahu or Ketu
            side_1_count += 1
            
    total = len(classical_planets)  # 7
    is_purna = (side_1_count == total) or (side_2_count == total)
    is_khanda = (side_1_count == total - 1) or (side_2_count == total - 1)
    
    yoga_present = is_purna or is_khanda
    yoga_type_name = "None"
    rahu_house = None
    direction = "Savya" if side_1_count > side_2_count else "Apsavya"
    
    if lagna_sign_idx is not None:
        rahu_sign_idx = planets["Rahu"]["sign_idx"]
        rahu_house = ((rahu_sign_idx - lagna_sign_idx) % 12) + 1
        if yoga_present and 1 <= rahu_house <= 12:
            yoga_type_name = KAAL_SARPA_TYPES[rahu_house - 1]["name"]
            type_desc = KAAL_SARPA_TYPES[rahu_house - 1]["description"]
        else:
            type_desc = "No Kaal Sarpa Yoga present."
    else:
        type_desc = "Lagna unavailable; house-specific Kaal Sarpa type omitted."
        
    return {
        "is_present": yoga_present,
        "is_purna": is_purna,
        "is_khanda": is_khanda,
        "intensity": "Purna (Full)" if is_purna else ("Khanda (Partial)" if is_khanda else "None"),
        "direction": direction if yoga_present else None,
        "rahu_house": rahu_house,
        "yoga_name": f"{yoga_type_name} Kaal Sarpa Yoga" if yoga_present and yoga_type_name != "None" else "None",
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
            import time
            current_jd = swe.julday(2026, 11, 8, 12.0)
        res, _ = swe.calc_ut(current_jd, swe.SATURN, swe.FLG_SIDEREAL)
        current_saturn_long = res[0] % 360.0
        
    saturn_sign_idx = int(current_saturn_long // 30.0)
    diff_from_moon = (saturn_sign_idx - natal_moon_sign_idx) % 12
    
    is_sade_sati = False
    phase_name = "Not Active"
    phase_desc = "Saturn is not currently transiting the 12th, 1st, or 2nd houses from your natal Moon."
    
    if diff_from_moon == 11:
        is_sade_sati = True
        phase_name = "Rising Phase (First Dhayya)"
        phase_desc = "Saturn is transiting the 12th house from natal Moon. Represents mental re-orientation, foreign travels, or new responsibilities."
    elif diff_from_moon == 0:
        is_sade_sati = True
        phase_name = "Peak Phase (Janma Shani / Second Dhayya)"
        phase_desc = "Saturn is conjunct natal Moon. A period of profound maturity, internal discipline, resilience, and personal restructuring."
    elif diff_from_moon == 1:
        is_sade_sati = True
        phase_name = "Setting Phase (Third Dhayya)"
        phase_desc = "Saturn is transiting the 2nd house from natal Moon. Focus on stabilizing finances, family commitments, and speech."
        
    # Kantaka / Ashtama Shani checks:
    # 4th house from Moon = Ardhastama Shani (Small panoti)
    # 8th house from Moon = Ashtama Shani
    is_ashtama_shani = (diff_from_moon == 7)
    is_ardhastama_shani = (diff_from_moon == 3)
    
    return {
        "is_active": is_sade_sati,
        "phase": phase_name,
        "description": phase_desc,
        "current_saturn_sign": SIGNS[saturn_sign_idx],
        "current_saturn_sign_sanskrit": SANSKRIT_SIGNS[saturn_sign_idx],
        "is_ashtama_shani": is_ashtama_shani,
        "is_ardhastama_shani": is_ardhastama_shani,
        "counsel": "Vedic philosophy views Saturn's transits as periods of purification, discipline, and emotional maturity, not fear."
    }
