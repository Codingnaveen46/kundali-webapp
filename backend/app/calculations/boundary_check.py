"""Boundary (Sandhi) checking for Moon and Lagna."""

from typing import Dict, List, Any, Optional
from .constants import SIGNS, NAKSHATRAS


def check_boundary_warnings(
    moon_longitude: float,
    lagna_longitude: Optional[float] = None
) -> Dict[str, Any]:
    """Warns if Moon or Lagna is within 1° of a sign or nakshatra boundary.
    
    A birth time variation of a few minutes near boundaries can shift signs,
    nakshatras, or lagna, making exact birth time critical.
    """
    warnings: List[Dict[str, Any]] = []
    
    # 1. Moon sign boundary check
    deg_in_sign = moon_longitude % 30.0
    sign_idx = int(moon_longitude // 30.0)
    
    if deg_in_sign < 1.0:
        prev_sign = SIGNS[(sign_idx - 1) % 12]
        curr_sign = SIGNS[sign_idx]
        warnings.append({
            "target": "Moon",
            "type": "Rashi Sandhi (Sign Boundary)",
            "severity": "High",
            "current_position": f"{deg_in_sign:.2f}° in {curr_sign}",
            "distance_to_boundary": round(deg_in_sign, 2),
            "boundary": f"{prev_sign} / {curr_sign} boundary (0°)",
            "message": (
                f"The Moon is at {deg_in_sign:.2f}° of {curr_sign}, within 1.0° of the {prev_sign}-{curr_sign} boundary. "
                "Even a minor birth time variance could alter the Moon Rashi, Ashtakoota compatibility, and Dasha sequence."
            )
        })
    elif deg_in_sign > 29.0:
        curr_sign = SIGNS[sign_idx]
        next_sign = SIGNS[(sign_idx + 1) % 12]
        dist = 30.0 - deg_in_sign
        warnings.append({
            "target": "Moon",
            "type": "Rashi Sandhi (Sign Boundary)",
            "severity": "High",
            "current_position": f"{deg_in_sign:.2f}° in {curr_sign}",
            "distance_to_boundary": round(dist, 2),
            "boundary": f"{curr_sign} / {next_sign} boundary (30°)",
            "message": (
                f"The Moon is at {deg_in_sign:.2f}° of {curr_sign}, within {dist:.2f}° of entering {next_sign}. "
                "Exact verification of birth time is strongly recommended."
            )
        })
        
    # 2. Moon nakshatra boundary check
    nak_span = 13.0 + (20.0 / 60.0)  # 13.333333°
    deg_in_nak = moon_longitude % nak_span
    nak_idx = int(moon_longitude // nak_span)
    if nak_idx >= 27:
        nak_idx = 26
        
    if deg_in_nak < 1.0:
        prev_nak = NAKSHATRAS[(nak_idx - 1) % 27]
        curr_nak = NAKSHATRAS[nak_idx]
        warnings.append({
            "target": "Moon",
            "type": "Nakshatra Sandhi",
            "severity": "Medium",
            "current_position": f"{deg_in_nak:.2f}° in {curr_nak}",
            "distance_to_boundary": round(deg_in_nak, 2),
            "boundary": f"{prev_nak} / {curr_nak} boundary",
            "message": (
                f"The Moon is at {deg_in_nak:.2f}° of {curr_nak}, within 1.0° of {prev_nak}. "
                "Birth star (Nakshatra) and Pada balance are sensitive to birth minute accuracy."
            )
        })
    elif deg_in_nak > (nak_span - 1.0):
        curr_nak = NAKSHATRAS[nak_idx]
        next_nak = NAKSHATRAS[(nak_idx + 1) % 27]
        dist = nak_span - deg_in_nak
        warnings.append({
            "target": "Moon",
            "type": "Nakshatra Sandhi",
            "severity": "Medium",
            "current_position": f"{deg_in_nak:.2f}° in {curr_nak}",
            "distance_to_boundary": round(dist, 2),
            "boundary": f"{curr_nak} / {next_nak} boundary",
            "message": (
                f"The Moon is nearing the edge of {curr_nak} (remaining {dist:.2f}°), close to {next_nak}. "
                "Ensure birth time is recorded accurately."
            )
        })
        
    # 3. Lagna sign boundary check
    if lagna_longitude is not None:
        l_deg_in_sign = lagna_longitude % 30.0
        l_sign_idx = int(lagna_longitude // 30.0)
        
        if l_deg_in_sign < 1.0:
            p_sign = SIGNS[(l_sign_idx - 1) % 12]
            c_sign = SIGNS[l_sign_idx]
            warnings.append({
                "target": "Lagna (Ascendant)",
                "type": "Lagna Sandhi",
                "severity": "High",
                "current_position": f"{l_deg_in_sign:.2f}° in {c_sign}",
                "distance_to_boundary": round(l_deg_in_sign, 2),
                "boundary": f"{p_sign} / {c_sign} boundary",
                "message": (
                    f"The Ascendant (Lagna) is at {l_deg_in_sign:.2f}° of {c_sign}, within 1.0° of the sign border. "
                    "Since the Ascendant advances by 1° every ~4 minutes, an error of 4 minutes will flip the entire chart's rising sign and houses."
                )
            })
        elif l_deg_in_sign > 29.0:
            c_sign = SIGNS[l_sign_idx]
            n_sign = SIGNS[(l_sign_idx + 1) % 12]
            dist = 30.0 - l_deg_in_sign
            warnings.append({
                "target": "Lagna (Ascendant)",
                "type": "Lagna Sandhi",
                "severity": "High",
                "current_position": f"{l_deg_in_sign:.2f}° in {c_sign}",
                "distance_to_boundary": round(dist, 2),
                "boundary": f"{c_sign} / {n_sign} boundary",
                "message": (
                    f"The Ascendant (Lagna) is at {l_deg_in_sign:.2f}° of {c_sign}, within {dist:.2f}° of {n_sign}. "
                    "Please verify birth time; a few minutes difference alters the rising sign."
                )
            })
            
    has_critical_warning = any(w["severity"] == "High" for w in warnings)
    
    return {
        "has_warnings": len(warnings) > 0,
        "has_critical_warning": has_critical_warning,
        "count": len(warnings),
        "warnings": warnings
    }
