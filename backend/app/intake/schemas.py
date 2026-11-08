"""Schemas for intake extraction, confidence scoring, and review screen."""

from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict


class ExtractedField(BaseModel):
    value: Optional[str] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    source_text: Optional[str] = None
    is_ambiguous: bool = False
    candidates: Optional[List[str]] = None
    needs_confirmation: bool = False


class IntakeProfile(BaseModel):
    full_name: ExtractedField = Field(default_factory=ExtractedField)
    gender: ExtractedField = Field(default_factory=ExtractedField)
    date_of_birth: ExtractedField = Field(default_factory=ExtractedField) # ISO 8601 YYYY-MM-DD
    time_of_birth: ExtractedField = Field(default_factory=ExtractedField) # 24-hr HH:MM
    place_of_birth: ExtractedField = Field(default_factory=ExtractedField)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    iana_timezone: Optional[str] = None
    stated_rashi: ExtractedField = Field(default_factory=ExtractedField)
    stated_nakshatra: ExtractedField = Field(default_factory=ExtractedField)
    stated_gothra: ExtractedField = Field(default_factory=ExtractedField)
    
    # Metadata
    warnings: List[str] = Field(default_factory=list)


class ExtractionResponse(BaseModel):
    status: str
    is_dual_profile: bool = False
    primary_profile: IntakeProfile
    secondary_profile: Optional[IntakeProfile] = None
    raw_preview: Optional[str] = None
    extraction_notes: List[str] = Field(default_factory=list)


class ReviewConfirmationPayload(BaseModel):
    name: str
    gender: Optional[str] = None
    birth_date: str          # YYYY-MM-DD
    birth_time: Optional[str] = None # HH:MM
    is_time_unknown: bool = False
    place_of_birth: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    iana_timezone: str = "Asia/Kolkata"
    stated_rashi: Optional[str] = None
    stated_nakshatra: Optional[str] = None
    stated_gothra: Optional[str] = None
    confirmed_by_user: bool = True
