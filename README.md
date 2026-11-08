# Kundli (ಕುಂಡಲಿ)

**Kundli** is a production-grade, privacy-first Vedic Astrology (Jyotish) application designed for Indian users. It generates high-precision **Janma Kundali** (birth charts) and **Marriage Kundali** (Ashtakoota Guna Milan & Dasa Koota) from birth details or uploaded biodatas.

---

## Key Features

### 1. Janma Kundali (Birth Chart)
- **Accurate Astronomical Calculations:** Powered by **Swiss Ephemeris** (`pyswisseph`) with Sidereal zodiac and Lahiri (Chitra Paksha) ayanamsa (plus Krishnamurti, Raman, and Fagan-Bradley alternatives).
- **Chart Styles:** **South Indian chart style as default**, with instant toggles for North Indian (diamond) and East Indian (Surya) styles, rendered via crisp, responsive SVG.
- **Divisional Charts:** Lagna (D1) and Navamsa (D9).
- **Graha Table:** Longitude (sign, degree, minute, second), Nakshatra & Pada, House number, speed, Retrograde (`R`), and Combust (`C`) indicators.
- **Vimshottari Dasha:** 120-year solar cycle (365.2425 days/year) computed from Moon Nakshatra balance at birth. Complete hierarchical view of Mahadashas, Antardashas, and Pratyantardashas with the active current period prominently highlighted.
- **Panchanga at Birth:** Tithi (Paksha, name, elapsed percentage), Vara (day in Sanskrit/English), Nakshatra, Soli-Lunar Yoga (1–27), and Karana (1–60, with Vishti/Bhadra alerts).
- **Avakahada Chakra:** Varna, Vashya, Tara, Yoni, Gana, Nadi, Tatwa, and house-based Paya.
- **Classical Dosha & Yoga Checks:**
  - **Mangal Dosha (Kuja Dosha):** Evaluated from Lagna, Moon, and Venus, with classical cancellation exceptions (own signs, friendly signs, Jupiter conjunction/aspect, Chandra-Mangala yoga).
  - **Kaal Sarpa Yoga:** 12 types (Anant to Sheshnag), classified into Purna (full), Khanda (partial), or None, with Savya (ascending) vs. Apsavya (descending) directions.
  - **Saturn Transit (Sade Sati):** Identifies Rising Phase, Peak Phase (Janma Shani), Setting Phase, and Kantaka/Ashtama Shani, with balanced philosophical counsel.
- **Boundary (Sandhi) Warnings:** Alerts the user whenever the Moon or Lagna is within 1.0° of a sign or nakshatra boundary, advising verification of exact birth minutes.
- **Unknown Time / Place Handling:** Gracefully falls back to Solar Noon Chandra Kundali, explicitly noting all excluded house-dependent features.

---

### 2. Marriage Matching (Ashtakoota Milan & Dasa Koota)
- **Full Ashtakoota (36 Points):**
  1. Varna (1 point)
  2. Vashya (2 points)
  3. Tara / Dina (3 points)
  4. Yoni (4 points, sworn enemy detection)
  5. Graha Maitri (5 points, natural & composite friendship)
  6. Gana (6 points, Deva, Manushya, Rakshasa)
  7. Bhakoot / Rashi (7 points)
  8. Nadi (8 points)
- **Classical Dosha Cancellations:**
  - **Nadi Dosha Cancellations:** Same Rashi with different Nakshatras; same Nakshatra across different Rashis; the 9 classically exempt Nakshatras; different Padas; identical/friendly Moon rulers.
  - **Bhakoot Dosha Cancellations:** Same planetary lord (Aries-Scorpio, Taurus-Libra, Capricorn-Aquarius); mutual natural friends; Navamsa lord harmony.
- **Dasa Koota (10 Poruthams):** Classical South Indian system evaluating Dina, Gana, Mahendra, Stree Deergha, Yoni, Rasi, Rasyadhipathi, Vashya, **Rajju** (vital Mangalya longevity), and **Vedha** (star affliction).
- **Dosha Samya:** Compares Mars dosha points between Groom and Bride to determine mutual neutralization.
- **Plain-Language Summary:** *"Score alone is not enough"* — emphasizes personal values, communication, and longevity alongside numerical scores. Configurable minimum threshold (default 18/36).

---

### 3. Three Intake Methods & Mandatory Review Screen
1. **Upload:** JPG, PNG, WEBP, HEIC, PDF (up to 10 MB, max 2 pages). In-memory processing, EXIF stripped, sanitized against prompt injection.
2. **Paste Text:** Paste copied biodata, WhatsApp forwards, or clipboard images. Preloaded with one-click test samples.
3. **Manual Form:** 12-hour format with AM/PM, "Time Unknown" toggle, and city autocomplete with geographic coordinates and IANA timezones.
- **Two Independent Panels:** Groom and Bride panels can mix methods (e.g., upload for groom, manual entry for bride). Single uploads containing two people are automatically split into two profiles.
- **Review Screen:** Displays confidence badges, date in words ("4 June 1998"), 12-hour AM/PM time, and cross-checks stated Rashi/Nakshatra against computed positions. Nothing is calculated until confirmed.

---

### 4. Privacy, Safety & DPDP Act Compliance
- **Zero Storage by Default:** Stateless backend. Uploaded biodatas are processed in memory and never written to disk or logged.
- **One-Click Session Wipe:** Reset and delete all session data with a single click.
- **No Third-Party Trackers:** No marketing trackers or external analytics.
- **Ethical Astrology:** Traditional symbolic guidance; no fear-based predictions or paid remedy upsells.

---

### 5. Multi-Language (i18n) & Accessibility
Supported languages:
- **English**
- **Kannada (ಕನ್ನಡ)**
- **Hindi (हिन्दी)**
- **Telugu (తెలుగు)**
- **Tamil (தமிழ்)**

WCAG AA compliant, high-contrast typography, and dark mode support.

---

## Licensing & Attribution (AGPL-3.0)

This project uses **Swiss Ephemeris** (`pyswisseph`), developed by Astrodienst AG.

- Unless a commercial license is purchased from Astrodienst AG, this software is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
- See [`LICENSE_NOTE.md`](./LICENSE_NOTE.md) for full licensing details.
- A visible "Source code" link is integrated directly into the application footer.

---

## Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run backend development server
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## Running Tests

### Backend Unit Tests & Golden Chart Benchmarks
```bash
cd backend
PYTHONPATH=. pytest tests/ -v
```
Includes:
- **32 Golden Charts** cross-verified against Swiss Ephemeris / Jagannatha Hora (planet longitudes and Lagna within 1 arcminute, exact nakshatra/pada, Dasha dates within 1 day).
- **10 Koota Edge Case & Cancellation Tests**.
- **7 Intake & Security Tests** (prompt injection sanitization, PII stripping, EXIF removal, PDF safety).
- **FastAPI Endpoint Integration Tests**.

### Automated License Check
```bash
./backend/venv/bin/python backend/scripts/license_check.py
```
