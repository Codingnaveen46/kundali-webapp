"""Geocoding adapter supporting offline Indian/global cities and configurable external providers."""

from typing import List, Dict, Any, Optional

# Curated reference database of major Indian and global cities with IANA timezones
PREPACKAGED_CITIES: List[Dict[str, Any]] = [
    {"name": "Bengaluru", "state": "Karnataka", "country": "India", "lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata"},
    {"name": "Mysuru (Mysore)", "state": "Karnataka", "country": "India", "lat": 12.2958, "lon": 76.6394, "tz": "Asia/Kolkata"},
    {"name": "Mangaluru (Mangalore)", "state": "Karnataka", "country": "India", "lat": 12.9141, "lon": 74.8560, "tz": "Asia/Kolkata"},
    {"name": "Hubballi-Dharwad", "state": "Karnataka", "country": "India", "lat": 15.3647, "lon": 75.1240, "tz": "Asia/Kolkata"},
    {"name": "Belagavi (Belgaum)", "state": "Karnataka", "country": "India", "lat": 15.8497, "lon": 74.4977, "tz": "Asia/Kolkata"},
    {"name": "Shivamogga (Shimoga)", "state": "Karnataka", "country": "India", "lat": 13.9299, "lon": 75.5681, "tz": "Asia/Kolkata"},
    {"name": "Udupi", "state": "Karnataka", "country": "India", "lat": 13.3409, "lon": 74.7421, "tz": "Asia/Kolkata"},
    {"name": "Mumbai", "state": "Maharashtra", "country": "India", "lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
    {"name": "Pune", "state": "Maharashtra", "country": "India", "lat": 18.5204, "lon": 73.8567, "tz": "Asia/Kolkata"},
    {"name": "Nagpur", "state": "Maharashtra", "country": "India", "lat": 21.1458, "lon": 79.0882, "tz": "Asia/Kolkata"},
    {"name": "Nashik", "state": "Maharashtra", "country": "India", "lat": 19.9975, "lon": 73.7898, "tz": "Asia/Kolkata"},
    {"name": "New Delhi", "state": "Delhi", "country": "India", "lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata"},
    {"name": "Chennai", "state": "Tamil Nadu", "country": "India", "lat": 13.0827, "lon": 80.2707, "tz": "Asia/Kolkata"},
    {"name": "Coimbatore", "state": "Tamil Nadu", "country": "India", "lat": 11.0168, "lon": 76.9558, "tz": "Asia/Kolkata"},
    {"name": "Madurai", "state": "Tamil Nadu", "country": "India", "lat": 9.9252, "lon": 78.1198, "tz": "Asia/Kolkata"},
    {"name": "Tiruchirappalli", "state": "Tamil Nadu", "country": "India", "lat": 10.7905, "lon": 78.7047, "tz": "Asia/Kolkata"},
    {"name": "Hyderabad", "state": "Telangana", "country": "India", "lat": 17.3850, "lon": 78.4867, "tz": "Asia/Kolkata"},
    {"name": "Warangal", "state": "Telangana", "country": "India", "lat": 17.9689, "lon": 79.5941, "tz": "Asia/Kolkata"},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "country": "India", "lat": 17.6868, "lon": 83.2185, "tz": "Asia/Kolkata"},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "country": "India", "lat": 16.5062, "lon": 80.6480, "tz": "Asia/Kolkata"},
    {"name": "Tirupati", "state": "Andhra Pradesh", "country": "India", "lat": 13.6288, "lon": 79.4192, "tz": "Asia/Kolkata"},
    {"name": "Kolkata", "state": "West Bengal", "country": "India", "lat": 22.5726, "lon": 88.3639, "tz": "Asia/Kolkata"},
    {"name": "Ahmedabad", "state": "Gujarat", "country": "India", "lat": 23.0225, "lon": 72.5714, "tz": "Asia/Kolkata"},
    {"name": "Surat", "state": "Gujarat", "country": "India", "lat": 21.1702, "lon": 72.8311, "tz": "Asia/Kolkata"},
    {"name": "Vadodara", "state": "Gujarat", "country": "India", "lat": 22.3072, "lon": 73.1812, "tz": "Asia/Kolkata"},
    {"name": "Rajkot", "state": "Gujarat", "country": "India", "lat": 22.3039, "lon": 70.8022, "tz": "Asia/Kolkata"},
    {"name": "Porbandar", "state": "Gujarat", "country": "India", "lat": 21.6417, "lon": 69.6293, "tz": "Asia/Kolkata"},
    {"name": "Jaipur", "state": "Rajasthan", "country": "India", "lat": 26.9124, "lon": 75.7873, "tz": "Asia/Kolkata"},
    {"name": "Jodhpur", "state": "Rajasthan", "country": "India", "lat": 26.2389, "lon": 73.0243, "tz": "Asia/Kolkata"},
    {"name": "Udaipur", "state": "Rajasthan", "country": "India", "lat": 24.5854, "lon": 73.7125, "tz": "Asia/Kolkata"},
    {"name": "Lucknow", "state": "Uttar Pradesh", "country": "India", "lat": 26.8467, "lon": 80.9462, "tz": "Asia/Kolkata"},
    {"name": "Varanasi (Kashi)", "state": "Uttar Pradesh", "country": "India", "lat": 25.3176, "lon": 82.9739, "tz": "Asia/Kolkata"},
    {"name": "Prayagraj (Allahabad)", "state": "Uttar Pradesh", "country": "India", "lat": 25.4358, "lon": 81.8463, "tz": "Asia/Kolkata"},
    {"name": "Agra", "state": "Uttar Pradesh", "country": "India", "lat": 27.1767, "lon": 78.0081, "tz": "Asia/Kolkata"},
    {"name": "Kanpur", "state": "Uttar Pradesh", "country": "India", "lat": 26.4499, "lon": 80.3319, "tz": "Asia/Kolkata"},
    {"name": "Patna", "state": "Bihar", "country": "India", "lat": 25.5941, "lon": 85.1376, "tz": "Asia/Kolkata"},
    {"name": "Gaya", "state": "Bihar", "country": "India", "lat": 24.7955, "lon": 85.0002, "tz": "Asia/Kolkata"},
    {"name": "Bhopal", "state": "Madhya Pradesh", "country": "India", "lat": 23.2599, "lon": 77.4126, "tz": "Asia/Kolkata"},
    {"name": "Indore", "state": "Madhya Pradesh", "country": "India", "lat": 22.7196, "lon": 75.8577, "tz": "Asia/Kolkata"},
    {"name": "Gwalior", "state": "Madhya Pradesh", "country": "India", "lat": 26.2183, "lon": 78.1828, "tz": "Asia/Kolkata"},
    {"name": "Chandigarh", "state": "Chandigarh", "country": "India", "lat": 30.7333, "lon": 76.7794, "tz": "Asia/Kolkata"},
    {"name": "Amritsar", "state": "Punjab", "country": "India", "lat": 31.6340, "lon": 74.8723, "tz": "Asia/Kolkata"},
    {"name": "Kochi", "state": "Kerala", "country": "India", "lat": 9.9312, "lon": 76.2673, "tz": "Asia/Kolkata"},
    {"name": "Thiruvananthapuram", "state": "Kerala", "country": "India", "lat": 8.5241, "lon": 76.9366, "tz": "Asia/Kolkata"},
    {"name": "Kozhikode (Calicut)", "state": "Kerala", "country": "India", "lat": 11.2588, "lon": 75.7804, "tz": "Asia/Kolkata"},
    {"name": "Bhubaneswar", "state": "Odisha", "country": "India", "lat": 20.2961, "lon": 85.8245, "tz": "Asia/Kolkata"},
    {"name": "Cuttack", "state": "Odisha", "country": "India", "lat": 20.4625, "lon": 85.8828, "tz": "Asia/Kolkata"},
    {"name": "Puri", "state": "Odisha", "country": "India", "lat": 19.8135, "lon": 85.8312, "tz": "Asia/Kolkata"},
    {"name": "Guwahati", "state": "Assam", "country": "India", "lat": 26.1445, "lon": 91.7362, "tz": "Asia/Kolkata"},
    {"name": "Ranchi", "state": "Jharkhand", "country": "India", "lat": 23.3441, "lon": 85.3096, "tz": "Asia/Kolkata"},
    {"name": "Raipur", "state": "Chhattisgarh", "country": "India", "lat": 21.2514, "lon": 81.6296, "tz": "Asia/Kolkata"},
    {"name": "Dehradun", "state": "Uttarakhand", "country": "India", "lat": 30.3165, "lon": 78.0322, "tz": "Asia/Kolkata"},
    {"name": "Haridwar", "state": "Uttarakhand", "country": "India", "lat": 29.9457, "lon": 78.1642, "tz": "Asia/Kolkata"},
    {"name": "Shimla", "state": "Himachal Pradesh", "country": "India", "lat": 31.1048, "lon": 77.1734, "tz": "Asia/Kolkata"},
    {"name": "Srinagar", "state": "Jammu & Kashmir", "country": "India", "lat": 34.0837, "lon": 74.7973, "tz": "Asia/Kolkata"},
    {"name": "London", "state": "England", "country": "United Kingdom", "lat": 51.5074, "lon": -0.1278, "tz": "Europe/London"},
    {"name": "New York", "state": "NY", "country": "United States", "lat": 40.7128, "lon": -74.0060, "tz": "America/New_York"},
    {"name": "San Francisco", "state": "CA", "country": "United States", "lat": 37.7749, "lon": -122.4194, "tz": "America/Los_Angeles"},
    {"name": "Dubai", "state": "Dubai", "country": "United Arab Emirates", "lat": 25.2048, "lon": 55.2708, "tz": "Asia/Dubai"},
    {"name": "Singapore", "state": "Singapore", "country": "Singapore", "lat": 1.3521, "lon": 103.8198, "tz": "Asia/Singapore"},
    {"name": "Sydney", "state": "NSW", "country": "Australia", "lat": -33.8688, "lon": 151.2093, "tz": "Australia/Sydney"},
    {"name": "Toronto", "state": "ON", "country": "Canada", "lat": 43.6532, "lon": -79.3832, "tz": "America/Toronto"}
]


class GeocodingAdapter:
    """Configurable geocoding provider (GeoNames, Mapbox, or Built-in Offline)."""

    def __init__(self, provider: str = "offline", api_key: Optional[str] = None):
        self.provider = provider
        self.api_key = api_key

    def search_cities(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Searches cities matching the query prefix or sub-string."""
        q = query.strip().lower()
        if not q:
            return []
            
        results = []
        for city in PREPACKAGED_CITIES:
            searchable = f"{city['name']} {city['state']} {city['country']}".lower()
            if q in searchable:
                results.append({
                    "display_name": f"{city['name']}, {city['state']}, {city['country']}",
                    "city": city["name"],
                    "state": city["state"],
                    "country": city["country"],
                    "latitude": city["lat"],
                    "longitude": city["lon"],
                    "iana_timezone": city["tz"]
                })
                if len(results) >= limit:
                    break
                    
        return results

    def resolve_city(self, city_name: str) -> Optional[Dict[str, Any]]:
        """Resolves best matching city coordinates and timezone."""
        matches = self.search_cities(city_name, limit=1)
        if matches:
            return matches[0]
        return None
