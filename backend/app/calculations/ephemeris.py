"""Ephemeris calculations using Swiss Ephemeris for Vedic Astrology."""

from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import swisseph as swe
from typing import Dict, List, Any, Optional

from .constants import (
    SIGNS, SANSKRIT_SIGNS, NAKSHATRAS, NAKSHATRA_LORDS, COMBUSTION_DEGREES
)

# Supported Ayanamsas
AYANAMSA_MAP = {
    "LAHIRI": swe.SIDM_LAHIRI,              # Default Chitra Paksha
    "KRISHNAMURTI": swe.SIDM_KRISHNAMURTI,  # KP Ayanamsa
    "RAMAN": swe.SIDM_RAMAN,                # B.V. Raman
    "FAGAN_BRADLEY": swe.SIDM_FAGAN_BRADLEY,
    "YUKTESHWAR": swe.SIDM_YUKTESHWAR,
    "TRUE_CHITRA": swe.SIDM_TRUE_CITRA,
    "SURYASIDDHANTA": swe.SIDM_SURYASIDDHANTA
}

PLANET_IDS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.TRUE_NODE  # True node for Rahu as required
}


def local_to_utc_jd(year: int, month: int, day: int, hour: int, minute: int, second: int, iana_tz: str) -> float:
    """Converts a local datetime to UTC Julian Day using historical IANA timezone offsets."""
    try:
        tz = ZoneInfo(iana_tz)
    except Exception:
        tz = ZoneInfo("UTC")
    
    local_dt = datetime(year, month, day, hour, minute, second, tzinfo=tz)
    utc_dt = local_dt.astimezone(timezone.utc)
    
    dec_hour = utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0 + utc_dt.microsecond / 3600000000.0
    jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, dec_hour)
    return jd


def set_ayanamsa(ayanamsa_name: str = "LAHIRI") -> int:
    """Sets the sidereal ayanamsa mode in Swiss Ephemeris."""
    mode = AYANAMSA_MAP.get(ayanamsa_name.upper(), swe.SIDM_LAHIRI)
    swe.set_sid_mode(mode)
    return mode


def get_ayanamsa_value(jd: float, ayanamsa_name: str = "LAHIRI") -> float:
    """Returns the ayanamsa offset in degrees for the given Julian Day."""
    set_ayanamsa(ayanamsa_name)
    return swe.get_ayanamsa_ut(jd)


def get_nakshatra_and_pada(longitude: float) -> tuple[int, str, int, float]:
    """Calculates Nakshatra index (0-26), name, Pada (1-4), and degrees elapsed in nakshatra.
    
    Moon nakshatra = floor(longitude / 13°20')
    pada = floor((longitude mod 13°20') / 3°20') + 1
    """
    nak_span = 13.0 + (20.0 / 60.0)  # 13.333333333333334 degrees = 13°20'
    pada_span = 3.0 + (20.0 / 60.0)   # 3.3333333333333335 degrees = 3°20'
    
    norm_long = longitude % 360.0
    nak_idx = int(norm_long // nak_span)
    if nak_idx >= 27:
        nak_idx = 26
    
    rem_deg = norm_long % nak_span
    pada = int(rem_deg // pada_span) + 1
    if pada > 4:
        pada = 4
        
    return nak_idx, NAKSHATRAS[nak_idx], pada, rem_deg


def calculate_planet_positions(
    jd: float,
    ayanamsa_name: str = "LAHIRI"
) -> Dict[str, Dict[str, Any]]:
    """Calculates sidereal positions for all 9 Vedic Grahas.
    
    Returns structured dictionary with sign, degree, minute, second,
    nakshatra, pada, retrograde, and speed.
    """
    set_ayanamsa(ayanamsa_name)
    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED
    
    planets: Dict[str, Dict[str, Any]] = {}
    sun_long = 0.0
    
    # 1. Calculate standard 7 planets + Rahu
    for name, pid in PLANET_IDS.items():
        res, ret_flags = swe.calc_ut(jd, pid, flags)
        longitude = res[0] % 360.0
        speed = res[3]
        
        if name == "Sun":
            sun_long = longitude
            
        sign_idx = int(longitude // 30.0)
        deg_in_sign = longitude % 30.0
        deg = int(deg_in_sign)
        minute = int((deg_in_sign - deg) * 60.0)
        second = round(((deg_in_sign - deg) * 60.0 - minute) * 60.0, 2)
        
        nak_idx, nak_name, pada, rem_deg = get_nakshatra_and_pada(longitude)
        
        is_retrograde = speed < 0 and name not in ("Sun", "Moon")
        
        planets[name] = {
            "name": name,
            "longitude": round(longitude, 6),
            "sign": SIGNS[sign_idx],
            "sign_sanskrit": SANSKRIT_SIGNS[sign_idx],
            "sign_idx": sign_idx,
            "degree_in_sign": deg,
            "minute_in_sign": minute,
            "second_in_sign": second,
            "total_deg_in_sign": round(deg_in_sign, 4),
            "nakshatra": nak_name,
            "nakshatra_idx": nak_idx,
            "nakshatra_lord": NAKSHATRA_LORDS[nak_idx],
            "pada": pada,
            "nakshatra_elapsed_deg": round(rem_deg, 4),
            "speed": round(speed, 6),
            "is_retrograde": is_retrograde,
            "is_combust": False  # Evaluated below
        }
    
    # 2. Ketu is exactly 180° opposite to Rahu
    rahu_long = planets["Rahu"]["longitude"]
    ketu_long = (rahu_long + 180.0) % 360.0
    ketu_sign_idx = int(ketu_long // 30.0)
    ketu_deg_in_sign = ketu_long % 30.0
    k_deg = int(ketu_deg_in_sign)
    k_min = int((ketu_deg_in_sign - k_deg) * 60.0)
    k_sec = round(((ketu_deg_in_sign - k_deg) * 60.0 - k_min) * 60.0, 2)
    k_nak_idx, k_nak_name, k_pada, k_rem = get_nakshatra_and_pada(ketu_long)
    
    planets["Ketu"] = {
        "name": "Ketu",
        "longitude": round(ketu_long, 6),
        "sign": SIGNS[ketu_sign_idx],
        "sign_sanskrit": SANSKRIT_SIGNS[ketu_sign_idx],
        "sign_idx": ketu_sign_idx,
        "degree_in_sign": k_deg,
        "minute_in_sign": k_min,
        "second_in_sign": k_sec,
        "total_deg_in_sign": round(ketu_deg_in_sign, 4),
        "nakshatra": k_nak_name,
        "nakshatra_idx": k_nak_idx,
        "nakshatra_lord": NAKSHATRA_LORDS[k_nak_idx],
        "pada": k_pada,
        "nakshatra_elapsed_deg": round(k_rem, 4),
        "speed": round(-planets["Rahu"]["speed"], 6),
        "is_retrograde": True,
        "is_combust": False
    }
    
    # 3. Determine combustion (Asta)
    for name, p_data in planets.items():
        if name in ("Sun", "Rahu", "Ketu"):
            continue
        
        diff = abs(p_data["longitude"] - sun_long)
        if diff > 180.0:
            diff = 360.0 - diff
            
        threshold = COMBUSTION_DEGREES.get(name, 12.0)
        # Special retrograde threshold adjustments
        if name == "Mercury" and p_data["is_retrograde"]:
            threshold = 12.0
        elif name == "Venus" and p_data["is_retrograde"]:
            threshold = 8.0
            
        if diff <= threshold:
            p_data["is_combust"] = True
            
    return planets
