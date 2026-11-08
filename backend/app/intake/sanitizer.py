"""File and text sanitization: EXIF stripping, memory-only processing, and prompt injection defense."""

import io
import re
from typing import Tuple, Optional
from PIL import Image
import pypdf

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_PDF_PAGES = 2
ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "image/heic", "image/heif", "application/pdf"
}

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions?",
    r"system\s+prompt\s+override",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"disregard\s+the\s+above",
    r"new\s+system\s+instructions",
    r"reveal\s+your\s+hidden\s+prompt"
]


def validate_file_size(file_bytes: bytes) -> None:
    """Enforces strict 10 MB size limit."""
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds 10 MB maximum limit (received {len(file_bytes) / (1024*1024):.2f} MB).")


def validate_mime_type(content_type: str) -> None:
    """Validates allowed MIME types."""
    norm = content_type.lower().split(";")[0].strip()
    if norm not in ALLOWED_MIME_TYPES:
        raise ValueError(f"Unsupported file format '{content_type}'. Please upload JPG, PNG, WEBP, HEIC, or PDF.")


def strip_exif_image(image_bytes: bytes) -> bytes:
    """Strips all EXIF and metadata from images in memory and returns clean image bytes."""
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            # Create a clean in-memory buffer without metadata
            clean_io = io.BytesIO()
            # If image has an alpha channel, save as PNG, else JPEG
            if img.mode in ("RGBA", "P"):
                img.save(clean_io, format="PNG")
            else:
                img_rgb = img.convert("RGB")
                img_rgb.save(clean_io, format="JPEG", quality=92)
            clean_io.seek(0)
            return clean_io.getvalue()
    except Exception as e:
        raise ValueError(f"Unable to decode or sanitize image: {str(e)}")


def extract_and_sanitize_pdf(pdf_bytes: bytes) -> str:
    """Safely extracts text from PDF in memory, enforcing max 2 pages limit."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        num_pages = len(reader.pages)
        if num_pages > MAX_PDF_PAGES:
            raise ValueError(f"PDF contains {num_pages} pages. Maximum allowed is {MAX_PDF_PAGES} pages.")
        
        text_parts = []
        for i in range(num_pages):
            page_text = reader.pages[i].extract_text() or ""
            text_parts.append(page_text)
            
        full_text = "\n".join(text_parts)
        if not full_text.strip():
            raise ValueError("The uploaded PDF contains no readable text or is an un-OCR'd scanned document.")
            
        return sanitize_untrusted_text(full_text)
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Corrupted or invalid PDF file: {str(e)}")


def sanitize_untrusted_text(text: str) -> str:
    """Sanitizes text by neutralizing prompt injection patterns and stripping private PII."""
    sanitized = text
    
    # 1. Defend against prompt injections
    for pattern in PROMPT_INJECTION_PATTERNS:
        sanitized = re.sub(pattern, "[UNTRUSTED_INSTRUCTION_REMOVED]", sanitized, flags=re.IGNORECASE)
        
    # 2. Privacy filter: Neutralize phone numbers
    phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    sanitized = re.sub(phone_pattern, "[PHONE_REMOVED]", sanitized)
    
    # 3. Privacy filter: Neutralize email addresses
    email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    sanitized = re.sub(email_pattern, "[EMAIL_REMOVED]", sanitized)
    
    return sanitized
