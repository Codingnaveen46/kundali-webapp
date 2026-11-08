"""Golden tests: 32 real charts cross-checked for arcminute precision, exact nakshatra/pada, and dasha balance."""

import json
import os
import pytest
from app.calculations.chart_engine import generate_birth_chart

FIXTURES_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "golden_charts.json")


def load_fixtures():
    with open(FIXTURES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


GOLDEN_CHARTS = load_fixtures()


@pytest.mark.parametrize("chart_data", GOLDEN_CHARTS, ids=[c["name"] for c in GOLDEN_CHARTS])
def test_golden_chart_precision(chart_data):
    """Verifies that computed chart meets strict accuracy benchmarks:
    - Planet longitudes within 1 arcminute (1/60th deg = 0.01667°)
    - Lagna within 1 arcminute
    - Nakshatra and Pada match exact
    - Dasha balance matches within 1 day
    """
    chart = generate_birth_chart(
        name=chart_data["name"],
        gender="Other",
        birth_date=chart_data["dob"],
        birth_time=chart_data["tob"],
        latitude=chart_data["lat"],
        longitude=chart_data["lon"],
        iana_timezone=chart_data["tz"],
        ayanamsa="LAHIRI"
    )
    
    # 1. Verify Lagna precision
    expected_lagna = chart_data["expected_lagna"]
    actual_lagna = chart["lagna"]
    lagna_diff = abs(actual_lagna["longitude"] - expected_lagna["longitude"])
    if lagna_diff > 180.0:
        lagna_diff = 360.0 - lagna_diff
        
    assert lagna_diff < 0.01667, f"Lagna difference {lagna_diff}° exceeds 1 arcminute for {chart_data['name']}"
    assert actual_lagna["sign"] == expected_lagna["sign"], f"Lagna sign mismatch for {chart_data['name']}"
    assert actual_lagna["nakshatra"] == expected_lagna["nakshatra"], f"Lagna nakshatra mismatch for {chart_data['name']}"
    assert actual_lagna["pada"] == expected_lagna["pada"], f"Lagna pada mismatch for {chart_data['name']}"
    
    # 2. Verify all 9 Grahas
    for p_name, exp_p in chart_data["expected_planets"].items():
        act_p = chart["planets"][p_name]
        diff = abs(act_p["longitude"] - exp_p["longitude"])
        if diff > 180.0:
            diff = 360.0 - diff
            
        assert diff < 0.01667, f"{p_name} longitude diff {diff}° exceeds 1 arcminute in {chart_data['name']}"
        assert act_p["sign"] == exp_p["sign"], f"{p_name} sign mismatch in {chart_data['name']}"
        assert act_p["nakshatra"] == exp_p["nakshatra"], f"{p_name} nakshatra mismatch in {chart_data['name']}"
        assert act_p["pada"] == exp_p["pada"], f"{p_name} pada mismatch in {chart_data['name']}"
        
    # 3. Verify Vimshottari Dasha Balance
    exp_dasha = chart_data["expected_dasha_balance"]
    act_dasha = chart["dasha"]["balance_at_birth"]
    assert act_dasha["lord"] == exp_dasha["lord"], f"Dasha lord mismatch in {chart_data['name']}"
    days_diff = abs(act_dasha["balance_days"] - exp_dasha["balance_days"])
    assert days_diff <= 1.0, f"Dasha balance difference {days_diff} days exceeds 1 day threshold in {chart_data['name']}"
