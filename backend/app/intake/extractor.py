"""Intake Extraction Engine: Extracts biodata fields with confidence badges, date ambiguity handling, and privacy filters."""

import re
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, List
from dateutil import parser as date_parser

from .schemas import ExtractedField, IntakeProfile, ExtractionResponse
from .sanitizer import sanitize_untrusted_text
from .geocoder import GeocodingAdapter

GEOCODER = GeocodingAdapter()

# Rashi & Nakshatra Sanskrit/English/Kannada/Hindi keywords
RASHIS = [
    "Mesha", "Aries", "Vrishabha", "Taurus", "Mithuna", "Gemini",
    "Karka", "Cancer", "Simha", "Leo", "Kanya", "Virgo",
    "Tula", "Libra", "Vrischika", "Scorpio", "Dhanu", "Sagittarius",
    "Makara", "Capricorn", "Kumbha", "Aquarius", "Meena", "Pisces",
    "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ", "ಮೇಷ",
    "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
    "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರ", "ಆರ್ದ್ರ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷ", "ಮಘ", "ಪುಬ್ಬ", "ಉತ್ತರ",
    "ಹಸ್ತ", "ಚಿತ್ತ", "ಸ್ವಾತಿ", "ವಿಶಾಖ", "ಅನುರಾಧ", "ಜ್ಯೇಷ್ಠ", "ಮೂಲ", "ಪೂರ್ವಾಷಾಢ", "ಉತ್ತರಾಷಾಢ", "ಶ್ರವಣ", "ಧನಿಷ್ಠ", "ಶತಭಿಷ", "ಪೂರ್ವಾಭಾದ್ರ", "ಉತ್ತರಾಭಾದ್ರ", "ರೇವತಿ",
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी",
    "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"
]


def parse_date_with_ambiguity(raw_date_str: str) -> ExtractedField:
    """Parses date string, normalizes to ISO 8601 (YYYY-MM-DD), and detects DD/MM vs MM/DD ambiguity."""
    clean = raw_date_str.strip()
    
    # 1. ISO format: YYYY-MM-DD
    iso_match = re.search(r"\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b", clean)
    if iso_match:
        y, m, d = int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3))
        return ExtractedField(
            value=f"{y:04d}-{m:02d}-{d:02d}",
            confidence=0.98,
            source_text=iso_match.group(0),
            is_ambiguous=False
        )

    # 2. Text dates: "1st Nov 1999", "14 July 1995", "October 15, 1993", "15 Oct 1993"
    text_date_patterns = [
        r"\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)[\s,]+(\d{2,4})\b",
        r"\b([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?[\s,]+(\d{2,4})\b"
    ]
    for pat in text_date_patterns:
        m = re.search(pat, clean)
        if m:
            matched_str = m.group(0)
            try:
                parsed = date_parser.parse(matched_str, dayfirst=True)
                return ExtractedField(
                    value=parsed.strftime("%Y-%m-%d"),
                    confidence=0.95,
                    source_text=matched_str,
                    is_ambiguous=False
                )
            except Exception:
                pass

    # 3. Numeric format: DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY or DD.MM.YYYY
    numeric_match = re.search(r"\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b", clean)
    if numeric_match:
        part1 = int(numeric_match.group(1))
        part2 = int(numeric_match.group(2))
        raw_year = int(numeric_match.group(3))
        year = raw_year if raw_year > 100 else (1900 + raw_year if raw_year > 30 else 2000 + raw_year)
        
        # Check ambiguity: both part1 and part2 <= 12 and part1 != part2
        if 1 <= part1 <= 12 and 1 <= part2 <= 12 and part1 != part2:
            # Ambiguous: part1 could be DD or MM
            # For Indian users, default to DD-MM (candidate 1), MM-DD (candidate 2)
            c1 = f"{year:04d}-{part2:02d}-{part1:02d}" # DD-MM
            c2 = f"{year:04d}-{part1:02d}-{part2:02d}" # MM-DD
            return ExtractedField(
                value=c1,
                confidence=0.70, # Under 0.8 triggers review screen confirmation!
                source_text=numeric_match.group(0),
                is_ambiguous=True,
                candidates=[c1, c2],
                needs_confirmation=True
            )
        elif part1 > 12 and part2 <= 12:
            # Clearly DD-MM
            iso_val = f"{year:04d}-{part2:02d}-{part1:02d}"
            return ExtractedField(
                value=iso_val,
                confidence=0.95,
                source_text=numeric_match.group(0),
                is_ambiguous=False
            )
        elif part2 > 12 and part1 <= 12:
            # Clearly MM-DD
            iso_val = f"{year:04d}-{part1:02d}-{part2:02d}"
            return ExtractedField(
                value=iso_val,
                confidence=0.95,
                source_text=numeric_match.group(0),
                is_ambiguous=False
            )
            
    # Try general date_parser fallback
    try:
        parsed = date_parser.parse(clean, dayfirst=True)
        return ExtractedField(
            value=parsed.strftime("%Y-%m-%d"),
            confidence=0.85,
            source_text=clean,
            is_ambiguous=False
        )
    except Exception:
        return ExtractedField(value=None, confidence=0.0, source_text=raw_date_str)


def parse_time_of_birth(raw_time_str: str) -> ExtractedField:
    """Normalizes time to 24-hr HH:MM while preserving original source text."""
    clean = raw_time_str.strip()
    
    # 12-hour AM/PM: "11:55 PM", "5:30 AM", "10 AM", "05:30 am", "5 PM"
    m12 = re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b", clean, re.IGNORECASE)
    if m12:
        hour = int(m12.group(1))
        minute = int(m12.group(2) or 0)
        meridiem = m12.group(3).lower().replace(".", "")
        
        if meridiem == "pm" and hour < 12:
            hour += 12
        elif meridiem == "am" and hour == 12:
            hour = 0
            
        time_24 = f"{hour:02d}:{minute:02d}"
        return ExtractedField(
            value=time_24,
            confidence=0.95,
            source_text=m12.group(0)
        )
        
    # 24-hour time: "23:45", "14:30", "05:30"
    m24 = re.search(r"\b([01]?\d|2[0-3]):([0-5]\d)\b", clean)
    if m24:
        return ExtractedField(
            value=f"{int(m24.group(1)):02d}:{int(m24.group(2)):02d}",
            confidence=0.90,
            source_text=m24.group(0)
        )
        
    return ExtractedField(value=None, confidence=0.0, source_text=raw_time_str)


def extract_profile_from_text(text: str) -> IntakeProfile:
    """Extracts strictly allowed biodata fields from unstructured text using robust NLP patterns."""
    sanitized = sanitize_untrusted_text(text)
    profile = IntakeProfile()
    
    # 1. Date of Birth
    dob_match = re.search(
        r"(?:dob|date\s+of\s+birth|d\.o\.b|born\s+(?:on|in[^\n]+?on)?|जन्म\s*तिथि|ಜನನ\s*ದಿನಾಂಕ)[:\s]*([^\n]+)",
        sanitized, re.IGNORECASE
    )
    if dob_match:
        profile.date_of_birth = parse_date_with_ambiguity(dob_match.group(1))
    else:
        # Fallback to direct date search in text
        date_pattern = r"\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{2,4})\b"
        raw_date = re.search(date_pattern, sanitized, re.IGNORECASE)
        if raw_date:
            profile.date_of_birth = parse_date_with_ambiguity(raw_date.group(0))
            
    # 2. Time of Birth
    tob_match = re.search(
        r"(?:tob|time\s+of\s+birth|t\.o\.b|time|born\s+at|जन्म\s*समय|ಜನನ\s*ಸಮಯ)[:\s]*([^\n,]+)",
        sanitized, re.IGNORECASE
    )
    if tob_match:
        profile.time_of_birth = parse_time_of_birth(tob_match.group(1))
    else:
        # Direct search for 12hr or 24hr time
        time_pattern = r"\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b|\b(?:[01]?\d|2[0-3]):[0-5]\d\b"
        raw_time = re.search(time_pattern, sanitized, re.IGNORECASE)
        if raw_time:
            profile.time_of_birth = parse_time_of_birth(raw_time.group(0))
            
    # 3. Full Name
    name_match = re.search(
        r"(?:name|full\s+name|candidate|profile\s+of|ಹೆಸರು|नाम)[:\s]*([^\n,]+)",
        sanitized, re.IGNORECASE
    )
    if name_match:
        n_val = name_match.group(1).strip()
        # Clean honorifics / extra noise
        n_clean = re.sub(r"^(mr\.|ms\.|mrs\.|dr\.|shri|smt\.|kum\.)\s*", "", n_val, flags=re.IGNORECASE).strip()
        profile.full_name = ExtractedField(value=n_clean, confidence=0.90, source_text=name_match.group(0))
        
    # 4. Gender
    gender_match = re.search(r"\b(male|female|boy|girl|man|woman|groom|bride|वर|वधू|ಗಂಡು|ಹೆಣ್ಣು)\b", sanitized, re.IGNORECASE)
    if gender_match:
        raw_g = gender_match.group(1).lower()
        if raw_g in ("male", "boy", "man", "groom", "वर", "ಗಂಡು"):
            profile.gender = ExtractedField(value="Male", confidence=0.95, source_text=gender_match.group(0))
        elif raw_g in ("female", "girl", "woman", "bride", "वधू", "ಹೆಣ್ಣು"):
            profile.gender = ExtractedField(value="Female", confidence=0.95, source_text=gender_match.group(0))
            
    # 5. Place of Birth
    pob_match = re.search(
        r"(?:pob|place\s+of\s+birth|p\.o\.b|birth\s+place|born\s+in|city|जन्म\s*स्थान|ಜನನ\s*ಸ್ಥಳ)[:\s]*([^\n,]+)",
        sanitized, re.IGNORECASE
    )
    if pob_match:
        city_raw = pob_match.group(1).strip()
        resolved = GEOCODER.resolve_city(city_raw)
        if resolved:
            profile.place_of_birth = ExtractedField(value=resolved["city"], confidence=0.95, source_text=city_raw)
            profile.latitude = resolved["latitude"]
            profile.longitude = resolved["longitude"]
            profile.iana_timezone = resolved["iana_timezone"]
        else:
            profile.place_of_birth = ExtractedField(value=city_raw, confidence=0.75, source_text=city_raw)
            profile.warnings.append("City coordinates not automatically resolved. Please confirm place.")
    else:
        # Check prepackaged cities directly in text
        for city in GEOCODER.search_cities("", limit=50):
            if re.search(r"\b" + re.escape(city["city"]) + r"\b", sanitized, re.IGNORECASE):
                profile.place_of_birth = ExtractedField(value=city["city"], confidence=0.85, source_text=city["city"])
                profile.latitude = city["latitude"]
                profile.longitude = city["longitude"]
                profile.iana_timezone = city["iana_timezone"]
                break

    # If coordinates were not resolved yet, scan for explicit coordinates in the text
    if profile.latitude is None:
        coord_match = re.search(r"(-?\d+\.?\d*)\s*°?\s*([NSns])?[\s,]+(-?\d+\.?\d*)\s*°?\s*([EWew])?", sanitized)
        if coord_match:
            try:
                lat_v = float(coord_match.group(1))
                if coord_match.group(2) and coord_match.group(2).upper() == "S":
                    lat_v = -lat_v
                lon_v = float(coord_match.group(3))
                if coord_match.group(4) and coord_match.group(4).upper() == "W":
                    lon_v = -lon_v
                if 0 <= abs(lat_v) <= 90 and 0 <= abs(lon_v) <= 180:
                    profile.latitude = lat_v
                    profile.longitude = lon_v
                    profile.iana_timezone = "Asia/Kolkata" if 68 <= lon_v <= 97 and 6 <= lat_v <= 38 else "UTC"
            except Exception:
                pass
                
    # 6. Stated Rashi
    rashi_match = re.search(
        r"(?:rashi|rasi|moon\s*sign|राशी|राशि|ರಾಶಿ)[:\s]*([^\n,]+)",
        sanitized, re.IGNORECASE
    )
    if rashi_match:
        val = rashi_match.group(1).strip()
        for r in RASHIS:
            if r.lower() in val.lower():
                profile.stated_rashi = ExtractedField(value=r, confidence=0.95, source_text=val)
                break
        if not profile.stated_rashi.value:
            profile.stated_rashi = ExtractedField(value=val, confidence=0.75, source_text=val)
            
    # 7. Stated Nakshatra
    nak_match = re.search(
        r"(?:nakshatra|nakshatram|star|birth\s*star|नक्षत्र|ನಕ್ಷತ್ರ)[:\s]*([^\n,]+)",
        sanitized, re.IGNORECASE
    )
    if nak_match:
        val = nak_match.group(1).strip()
        for n in NAKSHATRAS:
            if n.lower() in val.lower():
                profile.stated_nakshatra = ExtractedField(value=n, confidence=0.95, source_text=val)
                break
        if not profile.stated_nakshatra.value:
            profile.stated_nakshatra = ExtractedField(value=val, confidence=0.75, source_text=val)
            
    # 8. Stated Gothra (Display only)
    gothra_match = re.search(
        r"(?:gothra|gotra|gothram|गोत्र|ಗೋತ್ರ)[:\s]*([^\n,]+)",
        sanitized, re.IGNORECASE
    )
    if gothra_match:
        profile.stated_gothra = ExtractedField(
            value=gothra_match.group(1).strip(),
            confidence=0.90,
            source_text=gothra_match.group(0)
        )
        
    return profile


def detect_and_split_dual_biodata(text: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """Detects if input contains two profiles (Groom & Bride / Boy & Girl)."""
    sanitized = sanitize_untrusted_text(text)
    
    # Common partition patterns
    split_patterns = [
        r"(?:---|\n\s*\n|\b)(?:groom|boy|var|वर|ಗಂಡು)[\s:]+(.*?)(?=(?:bride|girl|vadhu|कन्या|वधू|ಹೆಣ್ಣು)[\s:]+)(.*)",
        r"(?:---|\n\s*\n|\b)(?:bride|girl|vadhu|कन्या|वधू|ಹೆಣ್ಣು)[\s:]+(.*?)(?=(?:groom|boy|var|वर|ಗಂಡು)[\s:]+)(.*)",
        r"(?:person\s*1|profile\s*1)[\s:]+(.*?)(?:person\s*2|profile\s*2)[\s:]+(.*)"
    ]
    
    for pat in split_patterns:
        m = re.search(pat, sanitized, re.IGNORECASE | re.DOTALL)
        if m:
            p1_text = m.group(1).strip()
            p2_text = m.group(2).strip()
            if len(p1_text) > 20 and len(p2_text) > 20:
                return True, p1_text, p2_text
                
    return False, None, None


def extract_biodata(text: str) -> ExtractionResponse:
    """Primary extraction endpoint returning single or dual profiles."""
    is_dual, p1_text, p2_text = detect_and_split_dual_biodata(text)
    
    if is_dual and p1_text and p2_text:
        prof1 = extract_profile_from_text(p1_text)
        prof2 = extract_profile_from_text(p2_text)
        return ExtractionResponse(
            status="success",
            is_dual_profile=True,
            primary_profile=prof1,
            secondary_profile=prof2,
            extraction_notes=["Detected dual profiles in content. Split into Profile 1 and Profile 2."]
        )
    else:
        prof = extract_profile_from_text(text)
        return ExtractionResponse(
            status="success",
            is_dual_profile=False,
            primary_profile=prof,
            extraction_notes=[]
        )
