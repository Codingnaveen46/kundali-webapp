"""Handling scenarios where birth time or birth place is unknown."""

from typing import Dict, List, Any


def get_unknown_time_metadata() -> Dict[str, Any]:
    """Returns metadata when birth time is unknown, specifying exact exclusions."""
    return {
        "is_time_unknown": True,
        "default_time_used": "12:00 PM (Solar Noon Reference)",
        "excluded_features": [
            {
                "feature": "Lagna (Ascendant)",
                "reason": "The Ascendant changes every ~2 hours and requires exact birth time to determine."
            },
            {
                "feature": "Houses (Bhavas 1 to 12)",
                "reason": "House cusps depend strictly on the Ascendant degree at the exact minute of birth."
            },
            {
                "feature": "Navamsa Lagna (D9 Ascendant)",
                "reason": "Navamsa Lagna changes every ~13 minutes and cannot be computed without precise birth time."
            },
            {
                "feature": "Lagna-based Mangal Dosha",
                "reason": "Mars placement relative to Lagna cannot be verified; Moon-based Mars placement is evaluated instead."
            },
            {
                "feature": "House-based Paya",
                "reason": "Requires Moon's house position relative to Lagna."
            },
            {
                "feature": "House-specific Kaal Sarpa Type",
                "reason": "Rahu's house from Lagna determines the specific type (Anant, Kulik, etc.)."
            }
        ],
        "available_features": [
            "Moon Rashi (Chandra Lagna) and Nakshatra",
            "Chandra Kundali (Moon as 1st house)",
            "Navamsa planet placements (excluding Navamsa Lagna)",
            "Vimshottari Dasha sequence (balance approximate to noon Moon)",
            "Panchanga at birth (approximate to noon)",
            "Avakahada Chakra (Varna, Vashya, Yoni, Gana, Nadi)",
            "Full Ashtakoota and Dasa Koota Marriage Milan (Moon-based calculations)"
        ],
        "guidance": (
            "Because Moon-to-Moon compatibility (Ashtakoota Milan) relies predominantly on Moon Nakshatra and Rashi, "
            "marriage compatibility remains largely reliable unless the Moon lies within 1° of a nakshatra border."
        )
    }


def get_unknown_place_metadata() -> Dict[str, Any]:
    """Returns metadata when birth place is unknown."""
    return {
        "is_place_unknown": True,
        "reference_location": "Geocentric 0.0° N, 0.0° E (UTC / Greenwich)",
        "excluded_features": [
            {
                "feature": "Lagna (Ascendant)",
                "reason": "Geographic latitude and longitude determine the eastern horizon."
            },
            {
                "feature": "Topocentric House Cusps",
                "reason": "Requires geographic coordinates."
            }
        ],
        "available_features": [
            "Geocentric Planetary Longitudes",
            "Moon Rashi and Nakshatra",
            "Ashtakoota & Dasa Koota Compatibility",
            "Vimshottari Dasha Timeline",
            "General Panchang"
        ],
        "guidance": "Geocentric Moon position shifts minimally by latitude/longitude. Marriage matching can proceed on Moon-based metrics."
    }
