"""Unified chart and matching engine coordinating all pure calculation modules."""

from datetime import datetime, timezone
from typing import Dict, Any, Optional

from .constants import SIGNS, SANSKRIT_SIGNS
from .ephemeris import (
    local_to_utc_jd, calculate_planet_positions, get_nakshatra_and_pada
)
from .houses import calculate_lagna, assign_houses_to_planets
from .panchang import calculate_panchang
from .dasha import calculate_vimshottari_dasha
from .avakahada import calculate_avakahada
from .doshas import check_mangal_dosha, check_kaal_sarpa, check_sade_sati
from .boundary_check import check_boundary_warnings
from .unknown_handler import get_unknown_time_metadata, get_unknown_place_metadata
from .ashtakoota import calculate_ashtakoota
from .dasa_koota import calculate_dasa_koota
from .dosha_samya import calculate_dosha_samya


def generate_birth_chart(
    name: str,
    gender: Optional[str],
    birth_date: str,               # YYYY-MM-DD
    birth_time: Optional[str],     # HH:MM or HH:MM:SS (24-hour)
    is_time_unknown: bool = False,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    iana_timezone: str = "Asia/Kolkata",
    ayanamsa: str = "LAHIRI",
    house_system: str = "W",       # 'W' for Whole Sign, 'P' for Placidus
    as_of_date: Optional[str] = None # ISO format date for dasha / transit evaluation
) -> Dict[str, Any]:
    """Generates complete Janma Kundali (D1, D9, Graha table, Dasha, Panchang, Avakahada, Doshas)."""
    # 1. Parse date and time
    dt_parts = [int(p) for p in birth_date.split("-")]
    year, month, day = dt_parts[0], dt_parts[1], dt_parts[2]
    
    if is_time_unknown or not birth_time:
        hour, minute, second = 12, 0, 0
        effective_time_unknown = True
    else:
        effective_time_unknown = False
        t_parts = [int(p) for p in birth_time.split(":")]
        hour = t_parts[0]
        minute = t_parts[1]
        second = t_parts[2] if len(t_parts) > 2 else 0
        
    is_place_unknown = (latitude is None or longitude is None)
    lat = latitude if not is_place_unknown else 0.0
    lon = longitude if not is_place_unknown else 0.0
    
    # 2. Compute UTC Julian Day
    jd = local_to_utc_jd(year, month, day, hour, minute, second, iana_timezone)
    birth_dt = datetime(year, month, day, hour, minute, second, tzinfo=timezone.utc)
    
    current_dt = None
    if as_of_date:
        try:
            current_dt = datetime.fromisoformat(as_of_date)
        except Exception:
            current_dt = None
            
    # 3. Calculate planetary positions
    planets = calculate_planet_positions(jd, ayanamsa_name=ayanamsa)
    
    # 4. Calculate Lagna & Houses (if time & place are known)
    lagna_info: Optional[Dict[str, Any]] = None
    if not effective_time_unknown and not is_place_unknown:
        lagna_info = calculate_lagna(jd, lat, lon, ayanamsa_name=ayanamsa, hsys=house_system)
        planets = assign_houses_to_planets(planets, lagna_info, hsys=house_system)
    else:
        # Lagna is unavailable: assign houses relative to Moon (Chandra Lagna)
        moon_sign_idx = planets["Moon"]["sign_idx"]
        moon_nav_idx = int(planets["Moon"]["longitude"] // (3.0 + 20.0 / 60.0)) % 12
        for p_name, p_data in planets.items():
            p_data["house"] = ((p_data["sign_idx"] - moon_sign_idx) % 12) + 1
            p_data["is_relative_to_moon"] = True
            nav_idx = int(p_data["longitude"] // (3.0 + 20.0 / 60.0)) % 12
            p_data["navamsa_sign_idx"] = nav_idx
            p_data["navamsa_sign"] = SIGNS[nav_idx]
            p_data["navamsa_sign_sanskrit"] = SANSKRIT_SIGNS[nav_idx]
            p_data["navamsa_house"] = ((nav_idx - moon_nav_idx) % 12) + 1
            
    # 5. Panchanga
    # Determine weekday (0 = Sunday to 6 = Saturday)
    # Python weekday(): Monday is 0, Sunday is 6. Convert to Sunday=0
    py_weekday = datetime(year, month, day).weekday()
    jyotish_weekday = (py_weekday + 1) % 7
    panchang = calculate_panchang(planets["Sun"]["longitude"], planets["Moon"]["longitude"], jyotish_weekday)
    
    # 6. Vimshottari Dasha
    dasha = calculate_vimshottari_dasha(planets["Moon"]["longitude"], birth_dt, current_dt)
    
    # 7. Avakahada Details
    lagna_sign_idx = lagna_info["sign_idx"] if lagna_info else None
    avakahada = calculate_avakahada(planets["Moon"]["longitude"], lagna_sign_idx)
    
    # 8. Doshas
    mars_house = planets["Mars"].get("house") if lagna_info else None
    mangal_dosha = check_mangal_dosha(
        mars_sign_idx=planets["Mars"]["sign_idx"],
        mars_house=mars_house,
        moon_sign_idx=planets["Moon"]["sign_idx"],
        venus_sign_idx=planets["Venus"]["sign_idx"],
        jupiter_sign_idx=planets["Jupiter"]["sign_idx"],
        saturn_sign_idx=planets["Saturn"]["sign_idx"]
    )
    
    kaal_sarpa = check_kaal_sarpa(planets, lagna_sign_idx)
    sade_sati = check_sade_sati(natal_moon_sign_idx=planets["Moon"]["sign_idx"])
    
    # 9. Boundary Warnings (< 1° sandhi)
    lagna_long = lagna_info["longitude"] if lagna_info else None
    boundary_warnings = check_boundary_warnings(planets["Moon"]["longitude"], lagna_long)
    
    # Unknown metadata
    unknown_meta = {}
    if effective_time_unknown:
        unknown_meta["time_unknown"] = get_unknown_time_metadata()
    if is_place_unknown:
        unknown_meta["place_unknown"] = get_unknown_place_metadata()
        
    return {
        "metadata": {
            "name": name,
            "gender": gender,
            "birth_date": birth_date,
            "birth_time": birth_time if not effective_time_unknown else "Unknown",
            "is_time_unknown": effective_time_unknown,
            "is_place_unknown": is_place_unknown,
            "latitude": lat,
            "longitude": lon,
            "timezone": iana_timezone,
            "ayanamsa": ayanamsa,
            "house_system": house_system,
            "julian_day": round(jd, 6),
            "generated_at": datetime.now(timezone.utc).isoformat()
        },
        "lagna": lagna_info,
        "planets": planets,
        "panchang": panchang,
        "dasha": dasha,
        "avakahada": avakahada,
        "doshas": {
            "mangal_dosha": mangal_dosha,
            "kaal_sarpa": kaal_sarpa,
            "sade_sati": sade_sati
        },
        "boundary_warnings": boundary_warnings,
        "unknown_metadata": unknown_meta
    }


def generate_marriage_matching(
    groom: Dict[str, Any],
    bride: Dict[str, Any],
    vashya_school: str = "parashari_direct",
    gana_school: str = "standard_parashari",
    min_score_threshold: float = 18.0
) -> Dict[str, Any]:
    """Generates comprehensive Marriage Kundali matching (Ashtakoota + Dasa Koota + Dosha Samya)."""
    # 1. Generate birth charts for both
    groom_chart = generate_birth_chart(
        name=groom.get("name", "Groom"),
        gender=groom.get("gender", "Male"),
        birth_date=groom["birth_date"],
        birth_time=groom.get("birth_time"),
        is_time_unknown=groom.get("is_time_unknown", False),
        latitude=groom.get("latitude"),
        longitude=groom.get("longitude"),
        iana_timezone=groom.get("iana_timezone", "Asia/Kolkata"),
        ayanamsa=groom.get("ayanamsa", "LAHIRI")
    )
    
    bride_chart = generate_birth_chart(
        name=bride.get("name", "Bride"),
        gender=bride.get("gender", "Female"),
        birth_date=bride["birth_date"],
        birth_time=bride.get("birth_time"),
        is_time_unknown=bride.get("is_time_unknown", False),
        latitude=bride.get("latitude"),
        longitude=bride.get("longitude"),
        iana_timezone=bride.get("iana_timezone", "Asia/Kolkata"),
        ayanamsa=bride.get("ayanamsa", "LAHIRI")
    )
    
    g_moon_long = groom_chart["planets"]["Moon"]["longitude"]
    b_moon_long = bride_chart["planets"]["Moon"]["longitude"]
    
    g_nav_idx = groom_chart["planets"]["Moon"].get("navamsa_sign_idx")
    b_nav_idx = bride_chart["planets"]["Moon"].get("navamsa_sign_idx")
    
    # 2. Ashtakoota (36 points) with cancellation rules
    ashtakoota = calculate_ashtakoota(
        groom_moon_long=g_moon_long,
        bride_moon_long=b_moon_long,
        groom_navamsa_idx=g_nav_idx,
        bride_navamsa_idx=b_nav_idx,
        vashya_school=vashya_school,
        gana_school=gana_school,
        min_score_threshold=min_score_threshold
    )
    
    # 3. Dasa Koota (10 Poruthams) South Indian Method
    dasa_koota = calculate_dasa_koota(
        groom_moon_long=g_moon_long,
        bride_moon_long=b_moon_long
    )
    
    # 4. Mangal Dosha & Dosha Samya
    g_mangal = groom_chart["doshas"]["mangal_dosha"]
    b_mangal = bride_chart["doshas"]["mangal_dosha"]
    dosha_samya = calculate_dosha_samya(g_mangal, b_mangal)
    
    # 5. Moon Boundary checks for both
    boundary_alerts = {
        "groom": groom_chart["boundary_warnings"],
        "bride": bride_chart["boundary_warnings"]
    }
    
    return {
        "groom_summary": {
            "name": groom_chart["metadata"]["name"],
            "rashi": groom_chart["avakahada"]["rashi"],
            "nakshatra": groom_chart["avakahada"]["nakshatra"],
            "pada": groom_chart["avakahada"]["pada"],
            "gana": groom_chart["avakahada"]["gana"],
            "yoni": groom_chart["avakahada"]["yoni"],
            "nadi": groom_chart["avakahada"]["nadi"],
            "mangal_dosha": g_mangal["status"]
        },
        "bride_summary": {
            "name": bride_chart["metadata"]["name"],
            "rashi": bride_chart["avakahada"]["rashi"],
            "nakshatra": bride_chart["avakahada"]["nakshatra"],
            "pada": bride_chart["avakahada"]["pada"],
            "gana": bride_chart["avakahada"]["gana"],
            "yoni": bride_chart["avakahada"]["yoni"],
            "nadi": bride_chart["avakahada"]["nadi"],
            "mangal_dosha": b_mangal["status"]
        },
        "ashtakoota": ashtakoota,
        "dasa_koota": dasa_koota,
        "dosha_samya": dosha_samya,
        "boundary_alerts": boundary_alerts,
        "groom_chart": groom_chart,
        "bride_chart": bride_chart
    }
