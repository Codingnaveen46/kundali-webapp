"""Avakahada Chakra details for Vedic birth profile."""

from typing import Dict, Any, Optional
import json
import os

from .constants import SIGNS, SANSKRIT_SIGNS, SIGN_LORDS
from .ephemeris import get_nakshatra_and_pada

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
KOOTA_DIR = os.path.join(CURRENT_DIR, "koota_data")


def load_json(filename: str) -> Dict[str, Any]:
    with open(os.path.join(KOOTA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


VARNA_DATA = load_json("varna.json")
GANA_DATA = load_json("gana.json")
YONI_DATA = load_json("yoni.json")
NADI_DATA = load_json("nadi.json")
VASHYA_DATA = load_json("vashya.json")

# Tatwas for the 12 signs
SIGN_TATWAS = [
    "Agni (Fire)", "Prithvi (Earth)", "Vayu (Air)", "Jala (Water)",
    "Agni (Fire)", "Prithvi (Earth)", "Vayu (Air)", "Jala (Water)",
    "Agni (Fire)", "Prithvi (Earth)", "Vayu (Air)", "Jala (Water)"
]

# Paya (based on Moon's house from Lagna: 1 to 12)
PAYA_MAPPING = {
    1: {"name": "Swarna (Gold)", "result": "Struggles / mixed results initially"},
    6: {"name": "Swarna (Gold)", "result": "Struggles / mixed results initially"},
    11: {"name": "Swarna (Gold)", "result": "Struggles / mixed results initially"},
    2: {"name": "Rajata (Silver)", "result": "Highly auspicious, wealth and comforts"},
    5: {"name": "Rajata (Silver)", "result": "Highly auspicious, wealth and comforts"},
    9: {"name": "Rajata (Silver)", "result": "Highly auspicious, wealth and comforts"},
    3: {"name": "Tamra (Copper)", "result": "Auspicious, courage, gains and success"},
    7: {"name": "Tamra (Copper)", "result": "Auspicious, courage, gains and success"},
    10: {"name": "Tamra (Copper)", "result": "Auspicious, courage, gains and success"},
    4: {"name": "Loha (Iron)", "result": "Hard work, delays, resilience required"},
    8: {"name": "Loha (Iron)", "result": "Hard work, delays, resilience required"},
    12: {"name": "Loha (Iron)", "result": "Hard work, delays, resilience required"}
}


def calculate_avakahada(
    moon_longitude: float,
    lagna_sign_idx: Optional[int] = None
) -> Dict[str, Any]:
    """Calculates all Avakahada Chakra attributes for a given Moon position and optional Lagna."""
    nak_idx, nak_name, pada, _ = get_nakshatra_and_pada(moon_longitude)
    moon_sign_idx = int((moon_longitude % 360.0) // 30.0)
    sign_en = SIGNS[moon_sign_idx]
    sign_sa = SANSKRIT_SIGNS[moon_sign_idx]
    rashi_lord = SIGN_LORDS[moon_sign_idx]
    
    varna = VARNA_DATA["sign_varna_mapping"].get(sign_en, "Unknown")
    gana = GANA_DATA["nakshatra_gana_mapping"].get(nak_name, "Unknown")
    yoni_info = YONI_DATA["nakshatra_yoni_mapping"].get(nak_name, {"animal": "Unknown", "gender": "Unknown"})
    nadi = NADI_DATA["nakshatra_nadi_mapping"].get(nak_name, "Unknown")
    
    # Vashya classification
    vashya = "Unknown"
    for cat, signs in VASHYA_DATA["schools"]["category_matrix"]["categories"].items():
        if isinstance(signs, list) and sign_en in signs:
            vashya = cat
            break
    if vashya == "Unknown":
        if sign_en == "Sagittarius":
            vashya = "Manava (1st half) / Chatushpada (2nd half)"
        elif sign_en == "Capricorn":
            vashya = "Chatushpada (1st half) / Jalachara (2nd half)"
        elif sign_en == "Leo":
            vashya = "Vanachara"
        elif sign_en == "Scorpio":
            vashya = "Keeta"
            
    tatwa = SIGN_TATWAS[moon_sign_idx]
    
    paya_info = None
    if lagna_sign_idx is not None:
        moon_house = ((moon_sign_idx - lagna_sign_idx) % 12) + 1
        paya_info = {
            "house_from_lagna": moon_house,
            "paya": PAYA_MAPPING.get(moon_house, {"name": "Rajata", "result": "Auspicious"})["name"],
            "result": PAYA_MAPPING.get(moon_house, {"name": "Rajata", "result": "Auspicious"})["result"]
        }
        
    return {
        "rashi": sign_en,
        "rashi_sanskrit": sign_sa,
        "rashi_lord": rashi_lord,
        "nakshatra": nak_name,
        "nakshatra_number": nak_idx + 1,
        "pada": pada,
        "varna": varna,
        "vashya": vashya,
        "tara": f"Tara {((nak_idx) % 9) + 1}",
        "yoni": yoni_info["animal"],
        "yoni_gender": yoni_info["gender"],
        "gana": gana,
        "nadi": nadi,
        "tatwa": tatwa,
        "paya": paya_info
    }
