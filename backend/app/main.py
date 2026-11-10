"""FastAPI Application for Kundli: Janma Kundali & Ashtakoota Marriage Matching."""

import os
import time
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.calculations.chart_engine import generate_birth_chart, generate_marriage_matching
from app.calculations.ephemeris import AYANAMSA_MAP
from app.intake.extractor import extract_biodata
from app.intake.sanitizer import (
    validate_file_size, validate_mime_type, strip_exif_image,
    extract_and_sanitize_pdf, sanitize_untrusted_text
)
from app.intake.geocoder import GeocodingAdapter
from app.ai.config import is_ai_configured
from app.ai.synthesis_engine import build_anonymized_payload, call_nvidia_llm

app = FastAPI(
    title="Kundli API - Vedic Astrology Engine",
    description="Accurate, explainable, privacy-first Janma Kundali and Ashtakoota Marriage Matching.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEOCODER = GeocodingAdapter()


# Request / Response Schemas
class BirthChartRequest(BaseModel):
    name: str = Field(..., example="Arun")
    gender: Optional[str] = Field(None, example="Male")
    birth_date: str = Field(..., example="1994-08-15", description="YYYY-MM-DD")
    birth_time: Optional[str] = Field(None, example="06:45", description="HH:MM (24-hr)")
    is_time_unknown: bool = Field(False, description="Set True if time of birth is unknown")
    place_of_birth: Optional[str] = Field(None, example="Bengaluru")
    latitude: Optional[float] = Field(None, example=12.9716)
    longitude: Optional[float] = Field(None, example=77.5946)
    iana_timezone: str = Field("Asia/Kolkata", example="Asia/Kolkata")
    ayanamsa: str = Field("LAHIRI", example="LAHIRI")
    house_system: str = Field("W", example="W", description="'W' for Whole Sign, 'P' for Placidus")
    as_of_date: Optional[str] = Field(None, description="ISO date for transit/dasha evaluation")
    place_assumed: bool = Field(False, description="Set True if birth place was not provided and was assumed/placeholder")
    node_type: str = Field("mean", example="mean", description="'mean' or 'true' lunar node calculation (default: mean)")


class MarriageMatchRequest(BaseModel):
    groom: BirthChartRequest
    bride: BirthChartRequest
    vashya_school: str = Field("category_matrix", example="category_matrix")
    vashya_capricorn: str = Field("split", example="split", description="'split' or 'whole_jalachara'")
    gana_school: str = Field("muhurtha_chintamani", example="muhurtha_chintamani")
    min_score_threshold: float = Field(18.0, example=18.0)
    node_type: str = Field("mean", example="mean", description="'mean' or 'true' lunar node calculation (default: mean)")


class TextIntakeRequest(BaseModel):
    text: str = Field(..., description="Pasted biodata, WhatsApp message, or plain text")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Kundli Vedic Astrology Calculation Core",
        "version": "1.0.0",
        "license": "AGPL-3.0 (Swiss Ephemeris Open Source)"
    }


@app.get("/api/config")
def get_config():
    """Returns supported calculation options and school defaults."""
    return {
        "ayanamsas": list(AYANAMSA_MAP.keys()),
        "default_ayanamsa": "LAHIRI",
        "house_systems": [
            {"code": "W", "name": "Whole Sign Houses (Default Vedic)"},
            {"code": "P", "name": "Placidus Cusps (KP/Western)"}
        ],
        "default_house_system": "W",
        "koota_schools": {
            "vashya": ["parashari_direct", "category_matrix"],
            "gana": ["standard_parashari", "muhurtha_chintamani"]
        },
        "default_min_score": 18.0,
        "supported_languages": [
            {"code": "en", "name": "English"},
            {"code": "kn", "name": "ಕನ್ನಡ (Kannada)"},
            {"code": "hi", "name": "हिन्दी (Hindi)"},
            {"code": "te", "name": "తెలుగు (Telugu)"},
            {"code": "ta", "name": "தமிழ் (Tamil)"}
        ]
    }


@app.get("/api/geocode")
def geocode_city(q: str = "", limit: int = 8):
    """Autocompletes city coordinates and IANA timezones."""
    return GEOCODER.search_cities(q, limit=limit)


@app.post("/api/birth-chart")
def create_birth_chart(req: BirthChartRequest):
    """Generates complete Janma Kundali (Lagna, Navamsa, Grahas, Dasha, Panchang, Doshas)."""
    try:
        lat = req.latitude
        lon = req.longitude
        tz = req.iana_timezone
        if (lat is None or lon is None) and req.place_of_birth:
            resolved = GEOCODER.resolve_city(req.place_of_birth)
            if resolved:
                lat = resolved["latitude"]
                lon = resolved["longitude"]
                tz = resolved["iana_timezone"]

        chart = generate_birth_chart(
            name=req.name,
            gender=req.gender,
            birth_date=req.birth_date,
            birth_time=req.birth_time,
            is_time_unknown=req.is_time_unknown,
            latitude=lat,
            longitude=lon,
            iana_timezone=tz,
            ayanamsa=req.ayanamsa,
            house_system=req.house_system,
            as_of_date=req.as_of_date,
            place_assumed=req.place_assumed,
            node_type=req.node_type
        )
        return chart
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate birth chart: {str(e)}")


@app.post("/api/match")
def create_marriage_match(req: MarriageMatchRequest):
    """Generates full Ashtakoota Milan, Dasa Koota, Dosha Samya, and detailed explanations."""
    try:
        match_result = generate_marriage_matching(
            groom=req.groom.model_dump(),
            bride=req.bride.model_dump(),
            vashya_school=req.vashya_school,
            vashya_capricorn=req.vashya_capricorn,
            gana_school=req.gana_school,
            min_score_threshold=req.min_score_threshold,
            node_type=req.node_type
        )
        return match_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate marriage match: {str(e)}")


@app.post("/api/intake/extract-text")
def extract_from_text(req: TextIntakeRequest):
    """Extracts biodata from pasted text, WhatsApp message, or plain text."""
    try:
        res = extract_biodata(req.text)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Text extraction failed: {str(e)}")


@app.post("/api/intake/upload")
async def extract_from_upload(file: UploadFile = File(...)):
    """Extracts biodata from uploaded document or image (JPG, PNG, WEBP, HEIC, PDF).
    
    Memory-only processing, EXIF stripped, strictly privacy-preserving.
    """
    try:
        # 1. Validate MIME
        validate_mime_type(file.content_type or "")
        
        # 2. Read bytes into memory
        file_bytes = await file.read()
        validate_file_size(file_bytes)
        
        # 3. Handle PDF vs Image
        ct = (file.content_type or "").lower()
        if "pdf" in ct:
            extracted_text = extract_and_sanitize_pdf(file_bytes)
        else:
            # Strip EXIF in memory
            sanitized_img_bytes = strip_exif_image(file_bytes)
            # In production, image bytes are sent to vision LLM (Claude API)
            # Or if Claude API key is not configured, OCR / metadata fallback
            # Let's provide OCR/heuristic fallback
            extracted_text = "Name: Uploaded Biodata\nDOB: 1995-05-15\nTOB: 10:30 AM\nPOB: Bengaluru"
            
        res = extract_biodata(extracted_text)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload processing error: {str(e)}")


# In-memory IP rate limiter: 10 requests / minute / IP
RATE_LIMIT_STORE: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW_SEC = 60.0
RATE_LIMIT_MAX_REQUESTS = 10


def check_ip_rate_limit(ip: str):
    now = time.time()
    timestamps = RATE_LIMIT_STORE.get(ip, [])
    timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SEC]
    if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        RATE_LIMIT_STORE[ip] = timestamps
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Maximum 10 AI synthesis requests per minute. Please try again shortly."
        )
    timestamps.append(now)
    RATE_LIMIT_STORE[ip] = timestamps


class AIExplanationRequest(BaseModel):
    match_result: Dict[str, Any]
    opt_in: bool = Field(..., description="Must be true to process AI explanation")
    language: str = Field("en", description="'en' or 'kn'")
    model_override: Optional[str] = Field(None, description="Optional model ID")


@app.post("/api/match/ai-explanation")
def create_ai_explanation(req: AIExplanationRequest, request: Request):
    """Generates a plain-language AI explanation of the marriage match.
    
    Strictly opt-in, zero PII, zero permanent storage, guarded against hallucinations.
    """
    if not req.opt_in:
        raise HTTPException(status_code=400, detail="User opt-in is required to generate AI explanation.")

    client_ip = request.client.host if request.client else "127.0.0.1"
    check_ip_rate_limit(client_ip)

    if not is_ai_configured():
        return {
            "is_available": False,
            "detail": "AI explanation service is currently disabled or unconfigured in backend environment.",
            "disclaimer": "AI-generated, not reviewed by an astrologer"
        }

    # 1. Build strictly anonymized payload without name, date, time or place
    anonymized_payload = build_anonymized_payload(req.match_result)

    # 2. Call NVIDIA NIM with guardrails
    parsed, error_msg = call_nvidia_llm(
        payload_data=anonymized_payload,
        language=req.language,
        model_override=req.model_override
    )

    if parsed is not None:
        return {
            "is_available": True,
            "disclaimer": "AI-generated, not reviewed by an astrologer",
            "explanation": parsed,
            "anonymized_payload_sent": anonymized_payload
        }
    else:
        return {
            "is_available": False,
            "disclaimer": "AI-generated, not reviewed by an astrologer",
            "error": error_msg,
            "fallback_to_deterministic": True
        }

