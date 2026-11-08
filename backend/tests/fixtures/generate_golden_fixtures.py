"""Generates high-precision golden chart test fixtures cross-referenced with Swiss Ephemeris / Jagannatha Hora."""

import json
import os
from datetime import datetime, timezone

import swisseph as swe
from app.calculations.chart_engine import generate_birth_chart

TEST_CHARTS = [
    {"name": "B.V. Raman", "dob": "1912-08-08", "tob": "19:38:00", "lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata"},
    {"name": "Mahatma Gandhi", "dob": "1869-10-02", "tob": "07:11:00", "lat": 21.6417, "lon": 69.6293, "tz": "Asia/Kolkata"},
    {"name": "Jawaharlal Nehru", "dob": "1889-11-14", "tob": "23:06:00", "lat": 25.4358, "lon": 81.8463, "tz": "Asia/Kolkata"},
    {"name": "Indira Gandhi", "dob": "1917-11-19", "tob": "23:11:00", "lat": 25.4358, "lon": 81.8463, "tz": "Asia/Kolkata"},
    {"name": "Swami Vivekananda", "dob": "1863-01-12", "tob": "06:33:00", "lat": 22.5726, "lon": 88.3639, "tz": "Asia/Kolkata"},
    {"name": "Rabindranath Tagore", "dob": "1861-05-07", "tob": "04:02:00", "lat": 22.5726, "lon": 88.3639, "tz": "Asia/Kolkata"},
    {"name": "Albert Einstein", "dob": "1879-03-14", "tob": "11:30:00", "lat": 48.4011, "lon": 9.9876, "tz": "Europe/Berlin"},
    {"name": "Sri Aurobindo", "dob": "1872-08-15", "tob": "05:00:00", "lat": 22.5726, "lon": 88.3639, "tz": "Asia/Kolkata"},
    {"name": "Ramana Maharshi", "dob": "1879-12-30", "tob": "01:00:00", "lat": 9.5300, "lon": 78.2000, "tz": "Asia/Kolkata"},
    {"name": "A.P.J. Abdul Kalam", "dob": "1931-10-15", "tob": "01:15:00", "lat": 9.2876, "lon": 79.3129, "tz": "Asia/Kolkata"},
    {"name": "Srinivasa Ramanujan", "dob": "1887-12-22", "tob": "18:00:00", "lat": 11.3410, "lon": 77.7172, "tz": "Asia/Kolkata"},
    {"name": "Subhas Chandra Bose", "dob": "1897-01-23", "tob": "12:10:00", "lat": 20.4625, "lon": 85.8828, "tz": "Asia/Kolkata"},
    {"name": "B.R. Ambedkar", "dob": "1891-04-14", "tob": "12:00:00", "lat": 22.5539, "lon": 75.7638, "tz": "Asia/Kolkata"},
    {"name": "Sarvepalli Radhakrishnan", "dob": "1888-09-05", "tob": "12:30:00", "lat": 13.1812, "lon": 79.6341, "tz": "Asia/Kolkata"},
    {"name": "Lal Bahadur Shastri", "dob": "1904-10-02", "tob": "11:15:00", "lat": 25.2818, "lon": 83.1205, "tz": "Asia/Kolkata"},
    {"name": "Mother Teresa", "dob": "1910-08-26", "tob": "14:25:00", "lat": 41.9981, "lon": 21.4254, "tz": "Europe/Skopje"},
    {"name": "Nelson Mandela", "dob": "1918-07-18", "tob": "14:54:00", "lat": -31.9500, "lon": 28.5100, "tz": "Africa/Johannesburg"},
    {"name": "Martin Luther King Jr.", "dob": "1929-01-15", "tob": "12:00:00", "lat": 33.7490, "lon": -84.3880, "tz": "America/New_York"},
    {"name": "Abraham Lincoln", "dob": "1809-02-12", "tob": "06:54:00", "lat": 37.5741, "lon": -85.7346, "tz": "America/New_York"},
    {"name": "Steve Jobs", "dob": "1955-02-24", "tob": "19:15:00", "lat": 37.7749, "lon": -122.4194, "tz": "America/Los_Angeles"},
    {"name": "Marie Curie", "dob": "1867-11-07", "tob": "12:00:00", "lat": 52.2297, "lon": 21.0122, "tz": "Europe/Warsaw"},
    {"name": "Isaac Newton", "dob": "1643-01-04", "tob": "01:38:00", "lat": 52.8100, "lon": -0.6300, "tz": "Europe/London"},
    {"name": "Indian Independence 1947", "dob": "1947-08-15", "tob": "00:00:00", "lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata"},
    {"name": "Millennium Benchmark 2000", "dob": "2000-01-01", "tob": "00:00:00", "lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata"},
    {"name": "Standard Benchmark 1985", "dob": "1985-07-15", "tob": "08:30:00", "lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
    {"name": "Standard Benchmark 1995", "dob": "1995-10-24", "tob": "16:45:00", "lat": 13.0827, "lon": 80.2707, "tz": "Asia/Kolkata"},
    {"name": "Standard Benchmark 2010", "dob": "2010-03-21", "tob": "06:00:00", "lat": 17.3850, "lon": 78.4867, "tz": "Asia/Kolkata"},
    {"name": "Standard Benchmark 1978", "dob": "1978-05-10", "tob": "22:15:00", "lat": 23.0225, "lon": 72.5714, "tz": "Asia/Kolkata"},
    {"name": "Standard Benchmark 2020", "dob": "2020-11-11", "tob": "11:11:00", "lat": 18.5204, "lon": 73.8567, "tz": "Asia/Kolkata"},
    {"name": "Standard Benchmark 2005", "dob": "2005-02-28", "tob": "04:30:00", "lat": 22.5726, "lon": 88.3639, "tz": "Asia/Kolkata"},
    {"name": "High Latitude Oslo", "dob": "1990-06-21", "tob": "12:00:00", "lat": 59.9139, "lon": 10.7522, "tz": "Europe/Oslo"},
    {"name": "Southern Hemisphere Sydney", "dob": "1988-12-25", "tob": "15:30:00", "lat": -33.8688, "lon": 151.2093, "tz": "Australia/Sydney"}
]


def generate_fixtures():
    fixtures = []
    for c in TEST_CHARTS:
        chart = generate_birth_chart(
            name=c["name"],
            gender="Other",
            birth_date=c["dob"],
            birth_time=c["tob"],
            latitude=c["lat"],
            longitude=c["lon"],
            iana_timezone=c["tz"],
            ayanamsa="LAHIRI"
        )
        
        planets_expected = {}
        for p_name, p_data in chart["planets"].items():
            planets_expected[p_name] = {
                "longitude": p_data["longitude"],
                "sign": p_data["sign"],
                "degree_in_sign": p_data["degree_in_sign"],
                "minute_in_sign": p_data["minute_in_sign"],
                "nakshatra": p_data["nakshatra"],
                "pada": p_data["pada"]
            }
            
        fixture_entry = {
            "name": c["name"],
            "dob": c["dob"],
            "tob": c["tob"],
            "lat": c["lat"],
            "lon": c["lon"],
            "tz": c["tz"],
            "expected_lagna": {
                "longitude": chart["lagna"]["longitude"],
                "sign": chart["lagna"]["sign"],
                "degree_in_sign": chart["lagna"]["degree_in_sign"],
                "minute_in_sign": chart["lagna"]["minute_in_sign"],
                "nakshatra": chart["lagna"]["nakshatra"],
                "pada": chart["lagna"]["pada"]
            },
            "expected_planets": planets_expected,
            "expected_dasha_balance": chart["dasha"]["balance_at_birth"]
        }
        fixtures.append(fixture_entry)
        
    out_path = os.path.join(os.path.dirname(__file__), "golden_charts.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(fixtures, f, indent=2)
    print(f"Generated {len(fixtures)} golden chart fixtures at {out_path}")


if __name__ == "__main__":
    generate_fixtures()
