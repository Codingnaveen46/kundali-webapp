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


# Name syllable per nakshatra-pada (the 108-syllable Avakahada name table
# most almanacs print for naming-letter suggestions; unchanged for D1 use).
NAME_SYLLABLES = [
    ["Chu", "Che", "Cho", "La"],          # Ashwini
    ["Li", "Lu", "Le", "Lo"],             # Bharani
    ["A", "I", "U", "E"],                 # Krittika
    ["O", "Va", "Vi", "Vu"],              # Rohini
    ["Ve", "Vo", "Ka", "Ki"],             # Mrigashira
    ["Ku", "Gha", "Nga", "Chha"],         # Ardra
    ["Ke", "Ko", "Ha", "Hi"],             # Punarvasu
    ["Hu", "He", "Ho", "Da"],             # Pushya
    ["Di", "Du", "De", "Do"],             # Ashlesha
    ["Ma", "Mi", "Mu", "Me"],             # Magha
    ["Mo", "Ta", "Ti", "Tu"],             # Purva Phalguni
    ["Te", "To", "Pa", "Pi"],             # Uttara Phalguni
    ["Pu", "Sha", "Na", "Tha"],           # Hasta
    ["Pe", "Po", "Ra", "Ri"],             # Chitra
    ["Ru", "Re", "Ro", "Ta"],             # Swati
    ["Ti", "Tu", "Te", "To"],             # Vishakha
    ["Na", "Ni", "Nu", "Ne"],             # Anuradha
    ["No", "Ya", "Yi", "Yu"],             # Jyeshtha
    ["Ye", "Yo", "Bha", "Bhi"],           # Mula
    ["Bhu", "Dha", "Pha", "Dha"],         # Purva Ashadha
    ["Bhe", "Bho", "Ja", "Ji"],           # Uttara Ashadha
    ["Khi", "Khu", "Khe", "Kho"],         # Shravana
    ["Ga", "Gi", "Gu", "Ge"],             # Dhanishta
    ["Go", "Sa", "Si", "Su"],             # Shatabhisha
    ["Se", "So", "Da", "Di"],             # Purva Bhadrapada
    ["Du", "Tha", "Jha", "Na"],           # Uttara Bhadrapada
    ["De", "Do", "Cha", "Chi"],           # Revati
]

# Yunja: classical three-fold nakshatra division (purva / madhya / apara) of
# the Vimshottari star wheel: first part Revati→Mrigashira (6 stars),
# middle Ardra→Anuradha (12), last Jyeshtha→Uttara Bhadrapada (9).
# (Narada Samhita chapter 6, as commonly quoted; traditions differ on the
# exact grouping, and some reports show a half-division instead.)
NAKSHATRA_IDX = list(range(27))
YUNJA_MAPPING = {}
for _i in (26, 0, 1, 2, 3, 4):
    YUNJA_MAPPING[_i] = "Purva (First)"
for _i in range(5, 17):          # Ardra .. Anuradha
    YUNJA_MAPPING[_i] = "Madhya (Middle)"
for _i in range(17, 26):         # Jyeshtha .. Uttara Bhadrapada
    YUNJA_MAPPING[_i] = "Apara (Last)"

# Second Paya school: metal from the birth star itself (almanac practice;
# no single classical rule — the house-from-Lagna method above is the other
# common convention and the two can disagree).
PAYA_NAKSHATRA_GROUPS = {
    "Swarna (Gold)": {26, 0, 1},     # Revati, Ashwini, Bharani
    "Loha (Iron)": {2, 3, 4},        # Krittika, Rohini, Mrigashira
    "Rajata (Silver)": set(range(5, 17)),    # Ardra .. Anuradha
    "Tamra (Copper)": set(range(17, 26)),    # Jyeshtha .. Uttara Bhadrapada
}


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


def get_vashya_category(sign: str, moon_long: Optional[float] = None, capricorn_mode: str = "split") -> str:
    """Resolves Vashya category for a zodiac sign and moon longitude.
    Shared helper used across Ashtakoota, Dasa Koota, and Janma Avakahada.
    """
    if sign in ("Aries", "Taurus"):
        return "Chatushpada"
    elif sign in ("Gemini", "Virgo", "Libra", "Aquarius"):
        return "Manava"
    elif sign in ("Cancer", "Pisces"):
        return "Jalachara"
    elif sign == "Scorpio":
        return "Keeta"
    elif sign == "Leo":
        return "Vanachara"
    elif sign == "Sagittarius":
        if moon_long is not None:
            deg = moon_long % 30.0
            return "Manava" if deg < 15.0 else "Chatushpada"
        return "Manava"
    elif sign == "Capricorn":
        if capricorn_mode == "whole_jalachara":
            return "Jalachara"
        if moon_long is not None:
            deg = moon_long % 30.0
            return "Chatushpada" if deg < 15.0 else "Jalachara"
        return "Chatushpada"
    return "Manava"


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
    
    # Vashya classification (shared helper with Ashtakoota / Dasa Koota)
    vashya = get_vashya_category(sign_en, moon_longitude)
            
    tatwa = SIGN_TATWAS[moon_sign_idx]
    
    paya_info = None
    if lagna_sign_idx is not None:
        moon_house = ((moon_sign_idx - lagna_sign_idx) % 12) + 1
        paya_info = {
            "house_from_lagna": moon_house,
            "paya": PAYA_MAPPING.get(moon_house, {"name": "Rajata", "result": "Auspicious"})["name"],
            "result": PAYA_MAPPING.get(moon_house, {"name": "Rajata", "result": "Auspicious"})["result"]
        }
        
    # Second school: paya by the birth star itself (almanac practice; the two
    # methods can give different metals for the same birth — shown side by
    # side, never averaged or chosen between).
    nakshatra_paya = "Unknown"
    for metal, naks in PAYA_NAKSHATRA_GROUPS.items():
        if nak_idx in naks:
            nakshatra_paya = metal
            break
            
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
        # Name letter suggestion for the birth star / pada (108-syllable table)
        "name_alphabet": NAME_SYLLABLES[nak_idx][pada - 1],
        # Yunja: three-fold nakshatra division (purva / madhya / apara)
        "yunja": YUNJA_MAPPING.get(nak_idx, "Unknown"),
        # Both paya schools, side by side (values only; no good/bad reading)
        "paya": paya_info,
        "nakshatra_paya": nakshatra_paya
    }
