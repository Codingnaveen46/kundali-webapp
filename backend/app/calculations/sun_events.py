"""Sunrise and sunset (standard panchang definition), isolated from the
existing panchang (tithi/yoga/karana) calculations.

Definition used (stated in every report that shows these values):
The rise/set moment is when the TRUE (refraction-free) altitude of the solar
CENTRE reaches -0°50' (-0.8333°). This is the standard almanac rule that
combines the mean atmospheric refraction at the horizon (~34') with the
mean semi-diameter of the Sun (~16'); i.e., the upper limb of the Sun is
treated as touching the apparent horizon. Some tools use modified local
refraction or different limb conventions and can differ by a few seconds
to a couple of minutes — this is a convention choice, not an error.

Positions come from the same Swiss Ephemeris solar positions used by the
birth-calculator engine (built-in ephemeris, tropical of date checked via
azalt's horizontal conversion). No external data is fetched.
"""
import math
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Any, Dict, Optional

import swisseph as swe

# Standard panchang threshold for the true solar-centre altitude (degrees).
SUN_THRESHOLD_ALT = -(34.0 / 60.0 + 16.0 / 60.0)  # -0°50'
_SUN_FLAGS = swe.FLG_MOSEPH | swe.FLG_SPEED


def _true_solar_altitude(jd_ut: float, lat: float, lon: float, alt_m: float) -> float:
    """True (refraction-free) altitude of the solar centre in degrees."""
    res, _ = swe.calc_ut(jd_ut, swe.SUN, _SUN_FLAGS)
    az, true_alt, app_alt = swe.azalt(
        jd_ut, swe.ECL2HOR, (lon, lat, alt_m), 0.0, 0.0,
        (res[0], res[1], res[2])
    )
    return true_alt


def _jd_to_local_str(jd_ut: float, iana_tz: str) -> str:
    """UT Julian day -> HH:MM:SS string in the given timezone."""
    y, m, d, h = swe.revjul(jd_ut)
    utc_dt = datetime(y, m, d, 0, 0, 0, tzinfo=timezone.utc) + timedelta(seconds=round(h * 3600.0))
    try:
        tz = ZoneInfo(iana_tz)
    except Exception:
        tz = ZoneInfo("UTC")
    local = utc_dt.astimezone(tz)
    return local.strftime("%H:%M:%S")


def _crossing_time(f_lo: float, f_hi: float, lo_jd: float, hi_jd: float, lat, lon, alt_m) -> float:
    """Bisects the altitude threshold crossing between two Julian days."""
    lo, hi = lo_jd, hi_jd
    for _ in range(24):  # ~1e-7 day resolution (< 0.01 s)
        mid = (lo + hi) / 2.0
        f_mid = _true_solar_altitude(mid, lat, lon, alt_m) - SUN_THRESHOLD_ALT
        if (f_lo < 0.0) == (f_mid < 0.0):
            lo, f_lo = mid, f_mid
        else:
            hi, f_hi = mid, f_mid
    return (lo + hi) / 2.0


def calculate_sunrise_sunset(
    birth_utc_jd: float,
    local_hour_of_day: float,
    latitude: float,
    longitude: float,
    iana_tz: str,
    altitude_m: float = 0.0,
) -> Optional[Dict[str, Any]]:
    """Sunrise and sunset for the LOCAL calendar day containing the birth.

    birth_utc_jd: UT Julian day of the birth moment.
    local_hour_of_day: fractional local hour of the birth (used to anchor the
        local day: the search starts at local midnight of that calendar day).
    Returns {"sunrise": "HH:MM:SS", "sunset": "HH:MM:SS", "method": "..."}
    or None when the place is unknown or the Sun is circumpolar (no event).
    """
    if latitude is None or longitude is None:
        return None

    # Start UT Julian day at local midnight of the local calendar day of birth:
    # walk back by the local hour from birth.
    start_jd = birth_utc_jd - local_hour_of_day / 24.0

    # Scan a 30-hour window starting 3 hours before local midnight; covers
    # both events of the local day for all inhabited latitudes.
    lo = start_jd - 3.0 / 24.0
    hi = lo + 30.0 / 24.0
    step = 5.0 / 1440.0  # 5 minutes

    sunrise_jd = None
    sunset_jd = None
    prev_val = _true_solar_altitude(lo, latitude, longitude, altitude_m) - SUN_THRESHOLD_ALT
    t = lo
    while t < hi:
        t_next = t + step
        val = _true_solar_altitude(t_next, latitude, longitude, altitude_m) - SUN_THRESHOLD_ALT
        if prev_val <= 0.0 < val:  # rising shoulder
            candidate = _crossing_time(prev_val, val, t, t_next, latitude, longitude, altitude_m)
            if sunrise_jd is None:
                sunrise_jd = candidate
        elif prev_val > 0.0 >= val:  # setting shoulder
            candidate = _crossing_time(prev_val, val, t, t_next, latitude, longitude, altitude_m)
            if sunset_jd is None:
                sunset_jd = candidate
        prev_val = val
        t = t_next

    method = (
        "Standard panchang sunrise/sunset: true solar-centre altitude -0°50' "
        "(mean refraction 34' + mean solar semi-diameter 16'); Swiss Ephemeris "
        "solar positions. Tools using modified local refraction or different "
        "limb conventions can differ by seconds to minutes (convention, not error)."
    )
    if sunrise_jd is None or sunset_jd is None:
        return {
            "sunrise": None,
            "sunset": None,
            "method": method,
            "note": "Sunrise/sunset not available for this latitude/date (polar day or night, or event outside the scanned window)."
        }
    return {
        "sunrise": _jd_to_local_str(sunrise_jd, iana_tz),
        "sunset": _jd_to_local_str(sunset_jd, iana_tz),
        "method": method,
        "note": "Values for the local calendar day and coordinates of birth; %s." % iana_tz
    }
