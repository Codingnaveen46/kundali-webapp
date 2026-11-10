"""Unified chart and matching engine coordinating all pure calculation modules."""

from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Dict, Any, Optional

from .constants import SIGNS, SANSKRIT_SIGNS, SIGN_LORDS, NAKSHATRA_LORDS
import swisseph as swe

from .ephemeris import (
    local_to_utc_jd, calculate_planet_positions, get_nakshatra_and_pada, get_ayanamsa_value, get_nakshatra_working
)


def deg_to_dms(deg: float) -> str:
    """Formats decimal degrees to DD° MM' SS\"."""
    norm = deg % 360.0
    d = int(norm)
    rem_m = (norm - d) * 60.0
    m = int(rem_m)
    s = round((rem_m - m) * 60.0, 1)
    return f"{d:02d}° {m:02d}' {s:04.1f}\""


# Classical dignity table per graha (informational label only; no score impact).
# Rahu/Ketu are deliberately excluded: dignity classification of the nodes varies by school and is unverified here.
DIGNITY_TABLE: Dict[str, Dict[str, set]] = {
    "Sun":     {"own": {"Leo"}, "exalted": {"Aries"}, "debilitated": {"Libra"}},
    "Moon":    {"own": {"Cancer"}, "exalted": {"Taurus"}, "debilitated": {"Scorpio"}},
    "Mars":    {"own": {"Aries", "Scorpio"}, "exalted": {"Capricorn"}, "debilitated": {"Cancer"}},
    "Mercury": {"own": {"Gemini", "Virgo"}, "exalted": {"Virgo"}, "debilitated": {"Pisces"}},
    "Jupiter": {"own": {"Sagittarius", "Pisces"}, "exalted": {"Cancer"}, "debilitated": {"Capricorn"}},
    "Venus":   {"own": {"Taurus", "Libra"}, "exalted": {"Pisces"}, "debilitated": {"Virgo"}},
    "Saturn":  {"own": {"Capricorn", "Aquarius"}, "exalted": {"Libra"}, "debilitated": {"Aries"}},
}


def get_dignity(planet: str, sign: str) -> str:
    """Plain dignity label for a graha (Own Sign / Exalted / Debilitated or empty)."""
    table = DIGNITY_TABLE.get(planet)
    if not table:
        return ""
    if sign in table["exalted"]:
        return "Exalted"
    if sign in table["debilitated"]:
        return "Debilitated"
    if sign in table["own"]:
        return "Own Sign"
    return ""


def _chart_id(name: str, birth_date: str, birth_time: Optional[str], ayanamsa: str,
              node_type: str, house_system: str) -> str:
    """Stable slug identifier for a chart (matches verification-log entries)."""
    import re as _re
    slug = _re.sub(r"[^a-z0-9]+", "-", (name or "unknown").strip().lower()).strip("-")
    t = (birth_time or "unknown").replace(":", "")
    return f"{slug}-{birth_date}-{t}-{ayanamsa.lower()}-{'true' if str(node_type).lower()=='true' else 'mean'}-{house_system.lower()}"


def build_planet_table_rows(chart: Dict[str, Any]) -> list:
    """Flattens a birth chart's planets into display rows for the astrologer table.

    Each row carries the D1 position, the D9 (Navamsa) sign taken from the
    chart's own Navamsa data, and plain flags: combust, vargottama (D1 sign =
    D9 sign) and classical dignity. Flags are labels only; no interpretation.
    """
    rows = []
    for p_name, p in chart["planets"].items():
        nav_sign = p.get("navamsa_sign") or ""
        nav_idx = p.get("navamsa_sign_idx")
        sign_idx = p.get("sign_idx")
        rows.append({
            "planet": p_name,
            "sign": p["sign"],
            "sign_sanskrit": p.get("sign_sanskrit", ""),
            "sign_lord": SIGN_LORDS[sign_idx] if sign_idx is not None else "",
            "house": p.get("house", "-"),
            "deg_in_sign": p.get("dms_in_sign", f"{int(p['degree_in_sign']):02d}° {int(p['minute_in_sign']):02d}' {int(round(p['second_in_sign'])):02d}\""),
            "total_dms": p.get("total_dms", deg_to_dms(p["longitude"])),
            "nakshatra": p["nakshatra"],
            "nakshatra_lord": p.get("nakshatra_lord", ""),
            "pada": p["pada"],
            "navamsa_sign": nav_sign,
            "navamsa_sign_idx": nav_idx,
            "is_retrograde": p.get("is_retrograde", False),
            "is_combust": p.get("is_combust", False),
            "is_vargottama": bool(nav_idx is not None and nav_idx == p.get("sign_idx")),
            "dignity": get_dignity(p_name, p["sign"])
        })
    return rows
from .houses import calculate_lagna, assign_houses_to_planets
from .panchang import calculate_panchang
from .sun_events import calculate_sunrise_sunset
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
    as_of_date: Optional[str] = None, # ISO format date for dasha / transit evaluation
    place_assumed: bool = False,
    node_type: str = "mean"
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
        
    is_place_unknown = place_assumed or (latitude is None or longitude is None)
    lat = latitude if not is_place_unknown else None
    lon = longitude if not is_place_unknown else None
    
    # 2. Compute UTC Julian Day
    jd = local_to_utc_jd(year, month, day, hour, minute, second, iana_timezone)
    
    try:
        tz = ZoneInfo(iana_timezone)
    except Exception:
        tz = ZoneInfo("UTC")
    local_dt = datetime(year, month, day, hour, minute, second, tzinfo=tz)
    utc_dt = local_dt.astimezone(timezone.utc)
    birth_dt = utc_dt
    
    month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    birth_date_in_words = f"{day} {month_names[month - 1]} {year}"
    
    if not effective_time_unknown:
        period = "AM" if hour < 12 else "PM"
        h12 = hour % 12
        if h12 == 0:
            h12 = 12
        birth_time_display = f"{h12:02d}:{minute:02d} {period}"
    else:
        birth_time_display = "Time Unknown"
        
    ayan_val = get_ayanamsa_value(jd, ayanamsa)
    ayanamsa_dms = deg_to_dms(ayan_val)
    
    current_dt = None
    if as_of_date:
        try:
            current_dt = datetime.fromisoformat(as_of_date)
        except Exception:
            current_dt = None
            
    # 3. Calculate planetary positions
    planets = calculate_planet_positions(jd, ayanamsa_name=ayanamsa, node_type=node_type)
    for p_name, p in planets.items():
        p["dms_in_sign"] = f"{int(p['degree_in_sign']):02d}° {int(p['minute_in_sign']):02d}' {int(round(p['second_in_sign'])):02d}\""
        p["total_dms"] = deg_to_dms(p["longitude"])
    
    # 4. Calculate Lagna & Houses (if time & place are known)
    lagna_info: Optional[Dict[str, Any]] = None
    if not effective_time_unknown and not is_place_unknown:
        lagna_info = calculate_lagna(jd, lat, lon, ayanamsa_name=ayanamsa, hsys=house_system)
        lagna_info["dms_in_sign"] = f"{int(lagna_info['degree_in_sign']):02d}° {int(lagna_info['minute_in_sign']):02d}' {int(round(lagna_info['second_in_sign'])):02d}\""
        lagna_info["total_dms"] = deg_to_dms(lagna_info["longitude"])
        planets = assign_houses_to_planets(planets, lagna_info, hsys=house_system)
    elif place_assumed or is_place_unknown:
        # Birth place not provided / assumed: Lagna and houses are strictly unavailable
        for p_name, p_data in planets.items():
            p_data["house"] = None
            p_data["is_relative_to_moon"] = False
            p_min = (p_data["longitude"] % 360.0) * 60.0
            nav_idx = int((p_min + 1e-9) // 200.0) % 12
            p_data["navamsa_sign_idx"] = nav_idx
            p_data["navamsa_sign"] = SIGNS[nav_idx]
            p_data["navamsa_sign_sanskrit"] = SANSKRIT_SIGNS[nav_idx]
            p_data["navamsa_house"] = None
    else:
        # Lagna is unavailable because time is unknown (place is known): assign houses relative to Moon (Chandra Lagna)
        moon_sign_idx = planets["Moon"]["sign_idx"]
        moon_min = (planets["Moon"]["longitude"] % 360.0) * 60.0
        moon_nav_idx = int((moon_min + 1e-9) // 200.0) % 12
        for p_name, p_data in planets.items():
            p_data["house"] = ((p_data["sign_idx"] - moon_sign_idx) % 12) + 1
            p_data["is_relative_to_moon"] = True
            p_min = (p_data["longitude"] % 360.0) * 60.0
            nav_idx = int((p_min + 1e-9) // 200.0) % 12
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
    # Nakshatra lord + ascendant / ascendant lord (chapter 1 display fields).
    # Ascendant lord = fixed sign lord of the rising sign (classical table).
    panchang["nakshatra"]["lord"] = NAKSHATRA_LORDS[planets["Moon"]["nakshatra_idx"]]
    # Sunrise & sunset for the local calendar day of birth (standard panchang
    # definition; method string is part of the payload and shown in reports).
    if not effective_time_unknown and not is_place_unknown and lat is not None and lon is not None:
        panchang["sunrise_sunset"] = calculate_sunrise_sunset(
            birth_utc_jd=jd,
            local_hour_of_day=hour + minute / 60.0 + second / 3600.0,
            latitude=lat,
            longitude=lon,
            iana_tz=iana_timezone,
        )
        # Flat aliases for the report tables (None when unavailable).
        if panchang["sunrise_sunset"]:
            panchang["sunrise"] = panchang["sunrise_sunset"]["sunrise"]
            panchang["sunset"] = panchang["sunrise_sunset"]["sunset"]
        else:
            panchang["sunrise"] = None
            panchang["sunset"] = None
    else:
        panchang["sunrise_sunset"] = {
            "sunrise": None, "sunset": None,
            "method": "Sunrise/sunset need both birth time and place.",
            "note": "Time or place unknown; standard panchang sunrise/sunset not computed."
        }
        panchang["sunrise"] = None
        panchang["sunset"] = None

    if lagna_info is not None:
        panchang["ascendant"] = lagna_info["sign"]
        panchang["ascendant_lord"] = SIGN_LORDS[lagna_info["sign_idx"]]
    else:
        panchang["ascendant"] = None
        panchang["ascendant_lord"] = None
    
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
    # Sade Sati is a transiting check: evaluated as of the real current date
    # (or the requested as_of_date), with Saturn's current sidereal position
    # computed inside check_sade_sati. A date-only as_of_date (naive) is
    # taken as that calendar date at 00:00 local IST-like offset — seconds
    # of precision are irrelevant for a slow outer planet's sign.
    sade_sati_current_jd = None
    if current_dt is not None:
        if current_dt.tzinfo is not None:
            current_dt = current_dt.astimezone(timezone.utc)
        sade_sati_current_jd = swe.julday(
            current_dt.year, current_dt.month, current_dt.day,
            current_dt.hour + current_dt.minute / 60.0,
        )
    sade_sati = check_sade_sati(
        natal_moon_sign_idx=planets["Moon"]["sign_idx"],
        current_jd=sade_sati_current_jd,
    )
    
    # 9. Boundary Warnings (< 1° sandhi)
    lagna_long = lagna_info["longitude"] if lagna_info else None
    boundary_warnings = check_boundary_warnings(planets["Moon"]["longitude"], lagna_long)
    
    # Unknown metadata
    unknown_meta = {}
    if effective_time_unknown:
        unknown_meta["time_unknown"] = get_unknown_time_metadata()
    if is_place_unknown:
        unknown_meta["place_unknown"] = get_unknown_place_metadata()
        
    # Astrologer Calculation Details
    astrologer_details = {
        "app_version": "Kundli v1.1.0 (Swiss Ephemeris 2.10.3.2)",
        "methodology_version": "v1.1.0",
        "node_type": "true" if str(node_type).strip().lower() == "true" else "mean",
        "node_type_note": "Differences in Rahu/Ketu longitude between astrologers or software typically arise from Node Type (Mean Node vs. True Node, ~8 arcminutes difference), not calculation error.",
        "utc_datetime": utc_dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "julian_day": round(jd, 6),
        "ayanamsa_name": ayanamsa,
        "ayanamsa_dms": ayanamsa_dms,
        "moon_dms": planets["Moon"]["total_dms"],
        "moon_nakshatra_boundary": {
            "nakshatra": planets["Moon"]["nakshatra"],
            "start_dms": deg_to_dms(planets["Moon"]["nakshatra_idx"] * (360.0 / 27.0)),
            "end_dms": deg_to_dms((planets["Moon"]["nakshatra_idx"] + 1) * (360.0 / 27.0))
        },
        "lagna_dms": lagna_info["total_dms"] if lagna_info else "N/A",
        "lagna_nakshatra_boundary": {
            "nakshatra": lagna_info["nakshatra"],
            "start_dms": deg_to_dms(lagna_info["nakshatra_idx"] * (360.0 / 27.0)),
            "end_dms": deg_to_dms((lagna_info["nakshatra_idx"] + 1) * (360.0 / 27.0))
        } if lagna_info else None
    }
    
    # Longitude DMS, nakshatra boundary distances and warnings
    longitudes_dms = {}
    boundary_distances = {}
    nak_span = 13.0 + (20.0 / 60.0)
    for p_name, p in planets.items():
        longitudes_dms[p_name] = p["total_dms"]
        rem_in_nak = p["longitude"] % nak_span
        dist_to_start = rem_in_nak
        dist_to_end = nak_span - rem_in_nak
        boundary_distances[p_name] = {
            "distance_from_nakshatra_start_deg": round(dist_to_start, 4),
            "distance_to_nakshatra_end_deg": round(dist_to_end, 4),
            "is_within_1_deg_of_boundary": (dist_to_start < 1.0 or dist_to_end < 1.0)
        }
    if lagna_info is not None:
        longitudes_dms["Lagna"] = lagna_info["total_dms"]
        rem_in_nak = lagna_info["longitude"] % nak_span
        dist_to_start = rem_in_nak
        dist_to_end = nak_span - rem_in_nak
        boundary_distances["Lagna"] = {
            "distance_from_nakshatra_start_deg": round(dist_to_start, 4),
            "distance_to_nakshatra_end_deg": round(dist_to_end, 4),
            "is_within_1_deg_of_boundary": (dist_to_start < 1.0 or dist_to_end < 1.0)
        }

    appendix_warnings = []
    if effective_time_unknown:
        appendix_warnings.append("Unknown birth time: Lagna, houses, and precise Moon positions are approximate or omitted.")
    if place_assumed or is_place_unknown:
        appendix_warnings.append("Birth place not provided, Lagna and houses unavailable.")
    if boundary_distances.get("Moon", {}).get("is_within_1_deg_of_boundary"):
        appendix_warnings.append("Moon is within 1° of a Nakshatra boundary; star or pada could shift with small time differences.")
    if boundary_distances.get("Lagna", {}).get("is_within_1_deg_of_boundary"):
        appendix_warnings.append("Lagna is within 1° of a sign/nakshatra boundary; ascendant could shift with small time differences.")
    for bw in boundary_warnings.get("warnings", []):
        if bw.get("message") and bw["message"] not in appendix_warnings:
            appendix_warnings.append(bw["message"])

    moon_nak_working = get_nakshatra_working(planets["Moon"]["longitude"], "Moon")

    calculation_appendix = {
        "local_time": f"{year:04d}-{month:02d}-{day:02d} {hour:02d}:{minute:02d}:{second:02d}",
        "utc_time": utc_dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "timezone": iana_timezone,
        "julian_day": round(jd, 6),
        "ayanamsa_name": ayanamsa,
        "ayanamsa_value": round(ayan_val, 6),
        "ayanamsa_dms": ayanamsa_dms,
        "node_type": "true" if str(node_type).strip().lower() == "true" else "mean",
        "house_system": "Whole Sign (W)" if house_system == "W" else house_system,
        "dasha_year_length": "365.2425 solar days",
        "longitudes_dms": longitudes_dms,
        "nakshatra_boundary_distances": boundary_distances,
        "warnings": appendix_warnings,
        "moon_nakshatra_working": moon_nak_working,
        "dasha_balance_working": dasha.get("balance_at_birth", {}).get("working_str"),
        "combustion_orb_note": "Note: combustion (Asta) orbs vary by school; the orb used here is not a verified classical value."
    }

    return {
        "metadata": {
            "name": name,
            "gender": gender,
            "birth_date": birth_date,
            "birth_date_in_words": birth_date_in_words,
            "birth_time": birth_time if not effective_time_unknown else "Unknown",
            "birth_time_display": birth_time_display,
            "is_time_unknown": effective_time_unknown,
            "is_place_unknown": is_place_unknown,
            "place_assumed": place_assumed,
            "place_of_birth": "Birth place not provided, Lagna and houses unavailable" if place_assumed else ("Unknown" if is_place_unknown else f"{lat}, {lon}"),
            "place_warning": "Birth place not provided, Lagna and houses unavailable" if place_assumed else None,
            "latitude": lat,
            "longitude": lon,
            "timezone": iana_timezone,
            "ayanamsa": ayanamsa,
            "ayanamsa_dms": ayanamsa_dms,
            "node_type": "true" if str(node_type).strip().lower() == "true" else "mean",
            "node_type_note": "Differences in Rahu/Ketu longitude between astrologers or software typically arise from Node Type (Mean Node vs. True Node, ~8 arcminutes difference), not calculation error.",
            "methodology_version": "v1.1.0",
            "house_system": house_system,
            "julian_day": round(jd, 6),
            "utc_time": utc_dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
            # Stable chart identifier (used to match verification-log entries)
            "chart_id": _chart_id(name, birth_date, birth_time, ayanamsa, node_type, house_system),
            "generated_at": datetime.now(timezone.utc).isoformat()
        },
        "lagna": lagna_info,
        "lagna_vargottama": bool(
            lagna_info
            and lagna_info.get("navamsa_sign_idx") is not None
            and lagna_info["navamsa_sign_idx"] == lagna_info.get("sign_idx")
        ),
        "planets_table": build_planet_table_rows({"planets": planets}),
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
        "astrologer_details": astrologer_details,
        "unknown_metadata": unknown_meta,
        "calculation_appendix": calculation_appendix,
        "nakshatra_working": moon_nak_working
    }


def generate_marriage_matching(
    groom: Dict[str, Any],
    bride: Dict[str, Any],
    vashya_school: str = "category_matrix",
    vashya_capricorn: str = "split",
    gana_school: str = "muhurtha_chintamani",
    min_score_threshold: float = 18.0,
    cancellation_config: Optional[Dict[str, Any]] = None,
    node_type: str = "mean"
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
        ayanamsa=groom.get("ayanamsa", "LAHIRI"),
        place_assumed=groom.get("place_assumed", False),
        node_type=groom.get("node_type", node_type)
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
        ayanamsa=bride.get("ayanamsa", "LAHIRI"),
        place_assumed=bride.get("place_assumed", False),
        node_type=bride.get("node_type", node_type)
    )
    
    g_moon_long = groom_chart["planets"]["Moon"]["longitude"]
    b_moon_long = bride_chart["planets"]["Moon"]["longitude"]
    
    g_nav_idx = groom_chart["planets"]["Moon"].get("navamsa_sign_idx")
    b_nav_idx = bride_chart["planets"]["Moon"].get("navamsa_sign_idx")
    
    # 2. Ashtakoota (36 points) with cancellation rules and Vashya school option
    ashtakoota = calculate_ashtakoota(
        groom_moon_long=g_moon_long,
        bride_moon_long=b_moon_long,
        groom_navamsa_idx=g_nav_idx,
        bride_navamsa_idx=b_nav_idx,
        vashya_school=vashya_school,
        vashya_capricorn=vashya_capricorn,
        gana_school=gana_school,
        min_score_threshold=min_score_threshold,
        cancellation_config=cancellation_config
    )
    
    # 3. Dasa Koota (10 Poruthams) South Indian Method
    dasa_koota = calculate_dasa_koota(
        groom_moon_long=g_moon_long,
        bride_moon_long=b_moon_long,
        cancellation_config=cancellation_config
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
    
    g_planets_table = build_planet_table_rows(groom_chart)
    b_planets_table = build_planet_table_rows(bride_chart)

    g_lagna = groom_chart.get("lagna") or {}
    b_lagna = bride_chart.get("lagna") or {}

    # Appendix note (informational only; no score impact): combustion orb thresholds differ between schools
    combustion_orb_note = "Note: combustion (Asta) orbs vary by school; the orb used here is not a verified classical value."

    astrologer_section = {
        "app_version": "Kundli v1.1.0 (Swiss Ephemeris 2.10.3.2)",
        "methodology_version": "v1.1.0",
        "combustion_orb_note": combustion_orb_note,
        "node_type": "true" if str(node_type).strip().lower() == "true" else "mean",
        "node_type_note": "Differences in Rahu/Ketu longitude between astrologers or software typically arise from Node Type (Mean Node vs. True Node, ~8 arcminutes difference), not calculation error.",
        "koota_schools": {
            "varna": "Parashari tradition v1.0",
            "vashya": "Category Matrix tradition v1.0",
            "tara": "Tara count tradition (Paryaya exemption removed) v1.0",
            "yoni": "14-animal matrix v1.0",
            "graha_maitri": "Natural planetary friendship table (Source: unverified; traditions differ) v1.0",
            "gana": "3-gana matrix v1.0",
            "bhakoot": "Disposition matrix (unverified cancellations disabled) v1.0",
            "nadi": "Tridosha matching (unverified cancellations disabled) v1.0",
            "dasa_koota": "South Indian Porutham tradition v1.0"
        },
        "groom": {
            **groom_chart["astrologer_details"],
            "planets_table": g_planets_table
        },
        "bride": {
            **bride_chart["astrologer_details"],
            "planets_table": b_planets_table
        }
    }

    # 6. Dosha Review (Nadi, Bhakoot, Mangal 3-row tables)
    nadi_koota = next(k for k in ashtakoota["kootas"] if k["koota"] == "Nadi")
    bhakoot_koota = next(k for k in ashtakoota["kootas"] if k["koota"] == "Bhakoot")

    b_sign_name = bride_chart["avakahada"]["rashi"]
    g_sign_name = groom_chart["avakahada"]["rashi"]
    g_sign_idx = groom_chart["planets"]["Moon"]["sign_idx"]
    b_sign_idx = bride_chart["planets"]["Moon"]["sign_idx"]
    diff_b_to_g = ((g_sign_idx - b_sign_idx) % 12) + 1
    diff_g_to_b = ((b_sign_idx - g_sign_idx) % 12) + 1
    bhakoot_rel = f"{min(diff_b_to_g, diff_g_to_b)}/{max(diff_b_to_g, diff_g_to_b)}"

    gm_koota = next(k for k in ashtakoota["kootas"] if k["koota"] == "Graha Maitri")
    lords_view = gm_koota.get("relationship", "neutral/neutral")

    dosha_review = {
        "nadi": {
            "is_present": nadi_koota["has_dosha"],
            "status": "Present (Nadi Dosha)" if nadi_koota["has_dosha"] else "Absent",
            "groom_nadi": groom_chart["avakahada"]["nadi"],
            "bride_nadi": bride_chart["avakahada"]["nadi"],
            "is_cancelled": nadi_koota.get("is_cancelled", False),
            "working_str": nadi_koota["working"]["working_str"],
            "cancellations_noted": nadi_koota.get("cancellations", [])
        },
        "bhakoot": {
            "is_present": bhakoot_koota["has_dosha"],
            "status": f"Present (Bhakoot Dosha {bhakoot_rel})" if bhakoot_koota["has_dosha"] else "Absent",
            "relation": bhakoot_rel,
            "groom_sign": g_sign_name,
            "bride_sign": b_sign_name,
            "groom_lord": SIGN_LORDS[g_sign_idx],
            "bride_lord": SIGN_LORDS[b_sign_idx],
            "lords_view": lords_view,
            "is_cancelled": bhakoot_koota.get("is_cancelled", False),
            "working_str": bhakoot_koota["working"]["working_str"],
            "cancellations_noted": bhakoot_koota.get("cancellations", [])
        },
        "mangal": {
            "groom": {
                "name": groom_chart["metadata"]["name"],
                "status": g_mangal["status"],
                "reference_rows": g_mangal.get("reference_rows", []),
                "cancellations_noted": [c["desc"] for c in g_mangal.get("cancellations", [])]
            },
            "bride": {
                "name": bride_chart["metadata"]["name"],
                "status": b_mangal["status"],
                "reference_rows": b_mangal.get("reference_rows", []),
                "cancellations_noted": [c["desc"] for c in b_mangal.get("cancellations", [])]
            }
        }
    }

    # 7. Objections Noted summary (derived by code; NO subjective verdicts)
    objections_noted = []
    if bhakoot_koota["has_dosha"] and not bhakoot_koota.get("is_cancelled", False):
        objections_noted.append(f"Bhakoot dosha {bhakoot_rel}: no relief applied by default")
    if nadi_koota["has_dosha"] and not nadi_koota.get("is_cancelled", False):
        objections_noted.append(f"Nadi dosha: present ({groom_chart['avakahada']['nadi']} Nadi clash; no relief applied by default)")

    yoni_koota = next(k for k in ashtakoota["kootas"] if k["koota"] == "Yoni")
    if yoni_koota.get("is_sworn_enemy", False):
        objections_noted.append(f"Yoni dosha: sworn enemy yonis ({groom_chart['avakahada']['yoni']} vs {bride_chart['avakahada']['yoni']})")

    if g_mangal.get("is_raw_present"):
        if g_mangal.get("cancellations"):
            objections_noted.append(f"Mangal dosha ({groom_chart['metadata']['name']}): possible mitigation noted (unverified; traditions differ)")
        else:
            objections_noted.append(f"Mangal dosha ({groom_chart['metadata']['name']}): {g_mangal['status']}")
    if b_mangal.get("is_raw_present"):
        if b_mangal.get("cancellations"):
            objections_noted.append(f"Mangal dosha ({bride_chart['metadata']['name']}): possible mitigation noted (unverified; traditions differ)")
        else:
            objections_noted.append(f"Mangal dosha ({bride_chart['metadata']['name']}): {b_mangal['status']}")

    for p in dasa_koota.get("poruthams", []):
        if p.get("result") in ("does not pass", "depends on convention"):
            objections_noted.append(f"{p['name']} (experimental): {p['working']['working_str']}")

    return {
        "groom_summary": {
            "name": groom_chart["metadata"]["name"],
            "birth_date": groom_chart["metadata"]["birth_date"],
            "birth_date_in_words": groom_chart["metadata"]["birth_date_in_words"],
            "birth_time": groom_chart["metadata"]["birth_time"],
            "birth_time_display": groom_chart["metadata"]["birth_time_display"],
            "latitude": groom_chart["metadata"]["latitude"],
            "longitude": groom_chart["metadata"]["longitude"],
            "place_assumed": groom_chart["metadata"].get("place_assumed", False),
            "place_of_birth": groom_chart["metadata"].get("place_of_birth"),
            "place_warning": groom_chart["metadata"].get("place_warning"),
            "timezone": groom_chart["metadata"]["timezone"],
            "ayanamsa": groom_chart["metadata"]["ayanamsa"],
            "ayanamsa_dms": groom_chart["metadata"]["ayanamsa_dms"],
            "node_type": groom_chart["metadata"].get("node_type", "mean"),
            "node_type_note": groom_chart["metadata"].get("node_type_note"),
            "methodology_version": "v1.1.0",
            "lagna_sign": groom_chart["lagna"]["sign"] if groom_chart.get("lagna") else "N/A",
            "lagna_dms": groom_chart["lagna"]["dms_in_sign"] if groom_chart.get("lagna") else "N/A",
            "lagna_nakshatra": groom_chart["lagna"]["nakshatra"] if groom_chart.get("lagna") else "N/A",
            "lagna_pada": groom_chart["lagna"]["pada"] if groom_chart.get("lagna") else "N/A",
            "lagna_navamsa_sign": g_lagna.get("navamsa_sign") or "N/A",
            "lagna_vargottama": bool(g_lagna and g_lagna.get("navamsa_sign_idx") is not None and g_lagna["navamsa_sign_idx"] == g_lagna["sign_idx"]),
            "rashi": groom_chart["avakahada"]["rashi"],
            "moon_dms": groom_chart["planets"]["Moon"]["dms_in_sign"],
            "nakshatra": groom_chart["avakahada"]["nakshatra"],
            "pada": groom_chart["avakahada"]["pada"],
            "gana": groom_chart["avakahada"]["gana"],
            "yoni": groom_chart["avakahada"]["yoni"],
            "nadi": groom_chart["avakahada"]["nadi"],
            "vashya": groom_chart["avakahada"]["vashya"],
            "mangal_dosha": g_mangal["status"],
            "mangal_reference_rows": g_mangal.get("reference_rows", []),
            "planets_table": g_planets_table
        },
        "bride_summary": {
            "name": bride_chart["metadata"]["name"],
            "birth_date": bride_chart["metadata"]["birth_date"],
            "birth_date_in_words": bride_chart["metadata"]["birth_date_in_words"],
            "birth_time": bride_chart["metadata"]["birth_time"],
            "birth_time_display": bride_chart["metadata"]["birth_time_display"],
            "latitude": bride_chart["metadata"]["latitude"],
            "longitude": bride_chart["metadata"]["longitude"],
            "place_assumed": bride_chart["metadata"].get("place_assumed", False),
            "place_of_birth": bride_chart["metadata"].get("place_of_birth"),
            "place_warning": bride_chart["metadata"].get("place_warning"),
            "timezone": bride_chart["metadata"]["timezone"],
            "ayanamsa": bride_chart["metadata"]["ayanamsa"],
            "ayanamsa_dms": bride_chart["metadata"]["ayanamsa_dms"],
            "node_type": bride_chart["metadata"].get("node_type", "mean"),
            "node_type_note": bride_chart["metadata"].get("node_type_note"),
            "methodology_version": "v1.1.0",
            "lagna_sign": bride_chart["lagna"]["sign"] if bride_chart.get("lagna") else "N/A",
            "lagna_dms": bride_chart["lagna"]["dms_in_sign"] if bride_chart.get("lagna") else "N/A",
            "lagna_nakshatra": bride_chart["lagna"]["nakshatra"] if bride_chart.get("lagna") else "N/A",
            "lagna_pada": bride_chart["lagna"]["pada"] if bride_chart.get("lagna") else "N/A",
            "lagna_navamsa_sign": b_lagna.get("navamsa_sign") or "N/A",
            "lagna_vargottama": bool(b_lagna and b_lagna.get("navamsa_sign_idx") is not None and b_lagna["navamsa_sign_idx"] == b_lagna["sign_idx"]),
            "rashi": bride_chart["avakahada"]["rashi"],
            "moon_dms": bride_chart["planets"]["Moon"]["dms_in_sign"],
            "nakshatra": bride_chart["avakahada"]["nakshatra"],
            "pada": bride_chart["avakahada"]["pada"],
            "gana": bride_chart["avakahada"]["gana"],
            "yoni": bride_chart["avakahada"]["yoni"],
            "nadi": bride_chart["avakahada"]["nadi"],
            "vashya": bride_chart["avakahada"]["vashya"],
            "mangal_dosha": b_mangal["status"],
            "mangal_reference_rows": b_mangal.get("reference_rows", []),
            "planets_table": b_planets_table
        },
        "ashtakoota": ashtakoota,
        "dasa_koota": dasa_koota,
        "dosha_samya": dosha_samya,
        "dosha_review": dosha_review,
        "objections_noted": objections_noted,
        "vashya_capricorn": vashya_capricorn,
        "calculation_appendix": {
            "groom": groom_chart["calculation_appendix"],
            "bride": bride_chart["calculation_appendix"]
        },
        "boundary_alerts": boundary_alerts,
        "astrologer_details": astrologer_section,
        "groom_chart": groom_chart,
        "bride_chart": bride_chart
    }
