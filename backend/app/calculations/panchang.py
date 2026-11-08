"""Panchanga (Five Limbs) astronomical calculations."""

from typing import Dict, Any
from .constants import YOGAS, KARANAS, WEEKDAYS, SANSKRIT_WEEKDAYS, NAKSHATRAS

TITHI_NAMES = [
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashti", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashti", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Amavasya"
]


def calculate_tithi(sun_long: float, moon_long: float) -> Dict[str, Any]:
    """Calculates lunar day (Tithi), Paksha, and elapsed percentage."""
    diff = (moon_long - sun_long) % 360.0
    tithi_float = diff / 12.0
    tithi_num = int(tithi_float) + 1  # 1 to 30
    if tithi_num > 30:
        tithi_num = 30
        
    paksha = "Shukla" if tithi_num <= 15 else "Krishna"
    paksha_tithi_num = tithi_num if tithi_num <= 15 else tithi_num - 15
    tithi_name = TITHI_NAMES[tithi_num - 1]
    
    elapsed_pct = (diff % 12.0) / 12.0 * 100.0
    
    return {
        "number": tithi_num,
        "paksha": paksha,
        "paksha_tithi_num": paksha_tithi_num,
        "name": tithi_name,
        "full_name": f"{paksha} {tithi_name}",
        "elapsed_percent": round(elapsed_pct, 2),
        "remaining_percent": round(100.0 - elapsed_pct, 2)
    }


def calculate_yoga(sun_long: float, moon_long: float) -> Dict[str, Any]:
    """Calculates Soli-Lunar Yoga (1-27)."""
    span = 13.0 + (20.0 / 60.0)  # 13°20'
    total = (sun_long + moon_long) % 360.0
    yoga_idx = int(total // span)
    if yoga_idx >= 27:
        yoga_idx = 26
        
    elapsed_deg = total % span
    elapsed_pct = (elapsed_deg / span) * 100.0
    
    return {
        "number": yoga_idx + 1,
        "name": YOGAS[yoga_idx],
        "elapsed_percent": round(elapsed_pct, 2),
        "remaining_percent": round(100.0 - elapsed_pct, 2)
    }


def calculate_karana(sun_long: float, moon_long: float) -> Dict[str, Any]:
    """Calculates Karana (half-tithi, 1 to 60).
    
    Karanas 1 to 60:
    - 1: Kimstughna (Shukla Prathama 1st half)
    - 2-57: 7 repeating karanas (Bava, Balava, Kaulava, Taitila, Garija, Vanija, Vishti)
    - 58: Shakuni (Krishna Chaturdashi 2nd half)
    - 59: Chatushpada (Amavasya 1st half)
    - 60: Naga (Amavasya 2nd half)
    """
    diff = (moon_long - sun_long) % 360.0
    half_tithi = int(diff / 6.0) + 1  # 1 to 60
    if half_tithi > 60:
        half_tithi = 60
        
    if half_tithi == 1:
        karana_name = "Kimstughna"
    elif 2 <= half_tithi <= 57:
        repeating_idx = (half_tithi - 2) % 7
        karana_name = KARANAS[repeating_idx]
    elif half_tithi == 58:
        karana_name = "Shakuni"
    elif half_tithi == 59:
        karana_name = "Chatushpada"
    else:
        karana_name = "Naga"
        
    elapsed_deg = diff % 6.0
    elapsed_pct = (elapsed_deg / 6.0) * 100.0
    
    return {
        "number": half_tithi,
        "name": karana_name,
        "is_vishti": karana_name == "Vishti",  # Bhadra Karana
        "elapsed_percent": round(elapsed_pct, 2),
        "remaining_percent": round(100.0 - elapsed_pct, 2)
    }


def calculate_panchang(
    sun_long: float,
    moon_long: float,
    weekday_idx: int  # 0 = Sunday, ..., 6 = Saturday
) -> Dict[str, Any]:
    """Calculates the complete 5 limbs of Panchang at the given time."""
    tithi = calculate_tithi(sun_long, moon_long)
    yoga = calculate_yoga(sun_long, moon_long)
    karana = calculate_karana(sun_long, moon_long)
    
    nak_span = 13.0 + (20.0 / 60.0)
    nak_idx = int((moon_long % 360.0) // nak_span)
    if nak_idx >= 27:
        nak_idx = 26
    nak_elapsed_deg = (moon_long % 360.0) % nak_span
    nak_elapsed_pct = (nak_elapsed_deg / nak_span) * 100.0
    
    weekday_name = WEEKDAYS[weekday_idx % 7]
    weekday_sanskrit = SANSKRIT_WEEKDAYS[weekday_idx % 7]
    
    return {
        "tithi": tithi,
        "vara": {
            "name": weekday_name,
            "sanskrit": weekday_sanskrit,
            "number": (weekday_idx % 7) + 1
        },
        "nakshatra": {
            "name": NAKSHATRAS[nak_idx],
            "number": nak_idx + 1,
            "elapsed_percent": round(nak_elapsed_pct, 2),
            "remaining_percent": round(100.0 - nak_elapsed_pct, 2)
        },
        "yoga": yoga,
        "karana": karana
    }
