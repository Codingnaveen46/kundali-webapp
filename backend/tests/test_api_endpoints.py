"""API Endpoint Integration Tests using FastAPI TestClient."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "AGPL-3.0" in data["license"]


def test_get_config():
    res = client.get("/api/config")
    assert res.status_code == 200
    data = res.json()
    assert "LAHIRI" in data["ayanamsas"]
    assert len(data["supported_languages"]) == 5


def test_geocode_autocomplete():
    res = client.get("/api/geocode?q=Beng")
    assert res.status_code == 200
    results = res.json()
    assert len(results) > 0
    assert results[0]["city"] == "Bengaluru"
    assert results[0]["iana_timezone"] == "Asia/Kolkata"


def test_post_birth_chart():
    payload = {
        "name": "Arun Kumar",
        "gender": "Male",
        "birth_date": "1994-08-15",
        "birth_time": "06:45",
        "is_time_unknown": False,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "iana_timezone": "Asia/Kolkata",
        "ayanamsa": "LAHIRI",
        "house_system": "W"
    }
    res = client.post("/api/birth-chart", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["lagna"]["sign"] == "Leo"
    assert data["planets"]["Sun"]["sign"] == "Cancer"
    assert "dasha" in data
    assert "panchang" in data
    assert "doshas" in data


def test_post_birth_chart_unknown_time():
    payload = {
        "name": "Sunita",
        "gender": "Female",
        "birth_date": "1996-11-24",
        "is_time_unknown": True,
        "latitude": 18.5204,
        "longitude": 73.8567,
        "iana_timezone": "Asia/Kolkata"
    }
    res = client.post("/api/birth-chart", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["lagna"] is None
    assert "time_unknown" in data["unknown_metadata"]
    assert len(data["unknown_metadata"]["time_unknown"]["excluded_features"]) > 0


def test_post_marriage_match():
    payload = {
        "groom": {
            "name": "Karthik",
            "gender": "Male",
            "birth_date": "1992-05-14",
            "birth_time": "10:00",
            "latitude": 28.6139,
            "longitude": 77.2090
        },
        "bride": {
            "name": "Pooja",
            "gender": "Female",
            "birth_date": "1994-08-18",
            "birth_time": "16:15",
            "latitude": 26.9124,
            "longitude": 75.7873
        },
        "min_score_threshold": 18.0
    }
    res = client.post("/api/match", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "ashtakoota" in data
    assert "dasa_koota" in data
    assert "dosha_samya" in data
    assert data["ashtakoota"]["total_points"] >= 0.0


def test_intake_extract_text():
    text = "Name: Suresh\nDOB: 15-08-1994\nTOB: 06:45 AM\nPOB: Bengaluru"
    res = client.post("/api/intake/extract-text", json={"text": text})
    assert res.status_code == 200
    data = res.json()
    assert data["primary_profile"]["date_of_birth"]["value"] == "1994-08-15"
    assert data["primary_profile"]["time_of_birth"]["value"] == "06:45"
    assert data["primary_profile"]["full_name"]["value"] == "Suresh"
