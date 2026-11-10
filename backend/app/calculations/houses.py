"""Houses and Ascendant (Lagna) calculations for Vedic Astrology."""

from typing import Dict, List, Any, Optional
import swisseph as swe

from .constants import SIGNS, SANSKRIT_SIGNS
from .ephemeris import set_ayanamsa, get_nakshatra_and_pada


def calculate_lagna(
    jd: float,
    lat: float,
    lon: float,
    ayanamsa_name: str = "LAHIRI",
    hsys: str = "W"  # 'W' for Whole Sign, 'P' for Placidus
) -> Dict[str, Any]:
    """Calculates the Ascendant (Lagna) and Bhavas (Houses).
    
    Defaults to Whole Sign houses as standard in Vedic Jyotish,
    with optional Placidus house cusps.
    """
    set_ayanamsa(ayanamsa_name)
    flags = swe.FLG_SIDEREAL
    
    # swe.houses_ex returns (cusps_tuple, ascmc_tuple)
    # ascmc[0] is Ascendant (Lagna), ascmc[1] is MC
    hsys_code = b'P' if hsys.upper() == 'P' else b'W'
    cusps, ascmc = swe.houses_ex(jd, lat, lon, hsys_code, flags)
    
    lagna_long = ascmc[0] % 360.0
    lagna_sign_idx = int(lagna_long // 30.0)
    deg_in_sign = lagna_long % 30.0
    deg = int(deg_in_sign)
    minute = int((deg_in_sign - deg) * 60.0)
    second = round(((deg_in_sign - deg) * 60.0 - minute) * 60.0, 2)
    
    nak_idx, nak_name, pada, rem_deg = get_nakshatra_and_pada(lagna_long)
    
    # Navamsa calculation for Lagna:
    total_minutes = (lagna_long % 360.0) * 60.0
    navamsa_sign_idx = int((total_minutes + 1e-9) // 200.0) % 12
    
    # Calculate houses
    houses: List[Dict[str, Any]] = []
    if hsys.upper() == 'P':
        # Placidus cusps from Swiss Ephemeris
        for i in range(1, 13):
            cusp_long = cusps[i] % 360.0
            c_sign_idx = int(cusp_long // 30.0)
            houses.append({
                "house_number": i,
                "sign": SIGNS[c_sign_idx],
                "sign_sanskrit": SANSKRIT_SIGNS[c_sign_idx],
                "sign_idx": c_sign_idx,
                "cusp_longitude": round(cusp_long, 4),
                "deg_in_sign": round(cusp_long % 30.0, 4)
            })
    else:
        # Whole Sign Houses: House 1 = Lagna sign, House 2 = (Lagna sign + 1)%12, etc.
        for i in range(1, 13):
            sign_idx = (lagna_sign_idx + i - 1) % 12
            houses.append({
                "house_number": i,
                "sign": SIGNS[sign_idx],
                "sign_sanskrit": SANSKRIT_SIGNS[sign_idx],
                "sign_idx": sign_idx,
                "cusp_longitude": sign_idx * 30.0,
                "deg_in_sign": 0.0
            })
            
    return {
        "longitude": round(lagna_long, 6),
        "sign": SIGNS[lagna_sign_idx],
        "sign_sanskrit": SANSKRIT_SIGNS[lagna_sign_idx],
        "sign_idx": lagna_sign_idx,
        "degree_in_sign": deg,
        "minute_in_sign": minute,
        "second_in_sign": second,
        "total_deg_in_sign": round(deg_in_sign, 4),
        "nakshatra": nak_name,
        "nakshatra_idx": nak_idx,
        "pada": pada,
        "navamsa_sign": SIGNS[navamsa_sign_idx],
        "navamsa_sign_sanskrit": SANSKRIT_SIGNS[navamsa_sign_idx],
        "navamsa_sign_idx": navamsa_sign_idx,
        "houses": houses
    }


def assign_houses_to_planets(
    planets: Dict[str, Dict[str, Any]],
    lagna: Dict[str, Any],
    hsys: str = "W"
) -> Dict[str, Dict[str, Any]]:
    """Assigns house numbers (1-12) to all planets based on Lagna."""
    lagna_sign_idx = lagna["sign_idx"]
    lagna_navamsa_idx = lagna["navamsa_sign_idx"]
    
    for name, p_data in planets.items():
        # D1 Whole-Sign House: ((planet_sign - lagna_sign) % 12) + 1
        p_sign_idx = p_data["sign_idx"]
        house = ((p_sign_idx - lagna_sign_idx) % 12) + 1
        p_data["house"] = house
        
        # D9 Navamsa Sign & House
        p_long = p_data["longitude"]
        p_min = (p_long % 360.0) * 60.0
        navamsa_sign_idx = int((p_min + 1e-9) // 200.0) % 12
        navamsa_house = ((navamsa_sign_idx - lagna_navamsa_idx) % 12) + 1
        
        p_data["navamsa_sign"] = SIGNS[navamsa_sign_idx]
        p_data["navamsa_sign_sanskrit"] = SANSKRIT_SIGNS[navamsa_sign_idx]
        p_data["navamsa_sign_idx"] = navamsa_sign_idx
        p_data["navamsa_house"] = navamsa_house
        
    return planets
