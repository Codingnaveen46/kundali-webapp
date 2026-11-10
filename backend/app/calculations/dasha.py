"""Vimshottari Dasha calculation engine."""

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional

from .constants import (
    VIMSHOTTARI_YEARS, VIMSHOTTARI_ORDER, DAYS_PER_SOLAR_YEAR,
    NAKSHATRAS, NAKSHATRA_LORDS
)
from .ephemeris import get_nakshatra_and_pada


def calculate_vimshottari_dasha(
    moon_longitude: float,
    birth_dt: datetime,
    current_dt: Optional[datetime] = None
) -> Dict[str, Any]:
    """Calculates Vimshottari Dasha (Maha, Antar, Pratyantar) starting with balance at birth.
    
    Uses standard 365.2425-day solar years.
    Highlights current periods relative to current_dt (or UTC now).
    """
    if current_dt is None:
        current_dt = datetime.now(timezone.utc)
    elif current_dt.tzinfo is None:
        current_dt = current_dt.replace(tzinfo=timezone.utc)
        
    nak_idx, nak_name, pada, rem_deg = get_nakshatra_and_pada(moon_longitude)
    nak_span = 13.0 + (20.0 / 60.0)
    
    fraction_elapsed = rem_deg / nak_span
    fraction_remaining = 1.0 - fraction_elapsed
    
    first_lord = NAKSHATRA_LORDS[nak_idx]
    first_lord_total_years = VIMSHOTTARI_YEARS[first_lord]
    balance_years = fraction_remaining * first_lord_total_years
    balance_days = balance_years * DAYS_PER_SOLAR_YEAR
    
    # The nominal beginning of this first Mahadasha before birth
    elapsed_days_before_birth = fraction_elapsed * first_lord_total_years * DAYS_PER_SOLAR_YEAR
    nominal_first_md_start = birth_dt - timedelta(days=elapsed_days_before_birth)
    
    start_lord_idx = VIMSHOTTARI_ORDER.index(first_lord)
    
    mahadashas: List[Dict[str, Any]] = []
    current_cursor = nominal_first_md_start
    
    active_mahadasha: Optional[Dict[str, Any]] = None
    active_antardasha: Optional[Dict[str, Any]] = None
    active_pratyantardasha: Optional[Dict[str, Any]] = None
    
    # 120-year cycle covers 9 Mahadashas
    for i in range(9):
        lord_idx = (start_lord_idx + i) % 9
        lord_name = VIMSHOTTARI_ORDER[lord_idx]
        total_lord_years = VIMSHOTTARI_YEARS[lord_name]
        md_duration_days = total_lord_years * DAYS_PER_SOLAR_YEAR
        
        md_start = current_cursor
        md_end = md_start + timedelta(days=md_duration_days)
        current_cursor = md_end
        
        # Calculate Antardashas (Bhuktis)
        antardashas: List[Dict[str, Any]] = []
        ad_cursor = md_start
        for j in range(9):
            ad_lord_idx = (lord_idx + j) % 9
            ad_lord_name = VIMSHOTTARI_ORDER[ad_lord_idx]
            ad_years = (total_lord_years * VIMSHOTTARI_YEARS[ad_lord_name]) / 120.0
            ad_duration_days = ad_years * DAYS_PER_SOLAR_YEAR
            
            ad_start = ad_cursor
            ad_end = ad_start + timedelta(days=ad_duration_days)
            ad_cursor = ad_end
            
            # Calculate Pratyantardashas
            pratyantardashas: List[Dict[str, Any]] = []
            pd_cursor = ad_start
            for k in range(9):
                pd_lord_idx = (ad_lord_idx + k) % 9
                pd_lord_name = VIMSHOTTARI_ORDER[pd_lord_idx]
                pd_duration_days = (ad_duration_days * VIMSHOTTARI_YEARS[pd_lord_name]) / 120.0
                
                pd_start = pd_cursor
                pd_end = pd_start + timedelta(days=pd_duration_days)
                pd_cursor = pd_end
                
                is_current_pd = pd_start <= current_dt < pd_end
                pd_entry = {
                    "lord": pd_lord_name,
                    "start_date": pd_start.isoformat(),
                    "end_date": pd_end.isoformat(),
                    "is_current": is_current_pd
                }
                pratyantardashas.append(pd_entry)
                if is_current_pd:
                    active_pratyantardasha = pd_entry
                    
            is_current_ad = ad_start <= current_dt < ad_end
            ad_entry = {
                "lord": ad_lord_name,
                "start_date": ad_start.isoformat(),
                "end_date": ad_end.isoformat(),
                "is_current": is_current_ad,
                "pratyantardashas": pratyantardashas
            }
            antardashas.append(ad_entry)
            if is_current_ad:
                active_antardasha = ad_entry
                
        is_current_md = md_start <= current_dt < md_end
        md_entry = {
            "lord": lord_name,
            "total_years": total_lord_years,
            "start_date": md_start.isoformat(),
            "end_date": md_end.isoformat(),
            "is_current": is_current_md,
            "antardashas": antardashas
        }
        mahadashas.append(md_entry)
        if is_current_md:
            active_mahadasha = md_entry
            
    pct = fraction_remaining * 100.0
    working_str = f"Fraction of nakshatra remaining × {first_lord}'s {first_lord_total_years} years: {pct:.1f}% × {first_lord_total_years} = {balance_years:.2f} years"

    balance_at_birth = {
        "lord": first_lord,
        "total_years": first_lord_total_years,
        "balance_years": round(balance_years, 4),
        "balance_days": round(balance_days, 1),
        "fraction_remaining": round(fraction_remaining, 4),
        "percentage_remaining": round(pct, 1),
        "working_str": working_str
    }
    
    return {
        "balance_at_birth": balance_at_birth,
        "current_period": {
            "mahadasha": active_mahadasha["lord"] if active_mahadasha else None,
            "antardasha": active_antardasha["lord"] if active_antardasha else None,
            "pratyantardasha": active_pratyantardasha["lord"] if active_pratyantardasha else None,
            "as_of_date": current_dt.isoformat()
        },
        "mahadashas": mahadashas
    }
