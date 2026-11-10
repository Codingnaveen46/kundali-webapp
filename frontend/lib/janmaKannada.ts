/**
 * Specialized Kannada Jyotish dictionary and helper functions for Janma Kundali reports (Phase B).
 * Contains verified standard Kannada astrological terms across classical Panchanga, Grahas,
 * Rashis, Nakshatras, Yogas, Karanas, and Avakahada qualities.
 */

export const KANNADA_PLANETS: Record<string, string> = {
  Sun: "ಸೂರ್ಯ",
  Moon: "ಚಂದ್ರ",
  Mars: "ಕುಜ",
  Mercury: "ಬುಧ",
  Jupiter: "ಗುರು",
  Venus: "ಶುಕ್ರ",
  Saturn: "ಶನಿ",
  Rahu: "ರಾಹು",
  Ketu: "ಕೇತು",
  Lagna: "ಲಗ್ನ",
  Ascendant: "ಲಗ್ನ",
};

export const KANNADA_PLANET_SHORT: Record<string, string> = {
  Sun: "ರ",
  Moon: "ಚಂ",
  Mars: "ಕು",
  Mercury: "ಬು",
  Jupiter: "ಗು",
  Venus: "ಶು",
  Saturn: "ಶ",
  Rahu: "ರಾ",
  Ketu: "ಕೇ",
  Lagna: "ಲ",
  Asc: "ಲ",
};

export const KANNADA_SIGNS: Record<string, string> = {
  Aries: "ಮೇಷ",
  Taurus: "ವೃಷಭ",
  Gemini: "ಮಿಥುನ",
  Cancer: "ಕರ್ಕಾಟಕ",
  Leo: "ಸಿಂಹ",
  Virgo: "ಕನ್ಯಾ",
  Libra: "ತುಲಾ",
  Scorpio: "ವೃಶ್ಚಿಕ",
  Sagittarius: "ಧನು",
  Capricorn: "ಮಕರ",
  Aquarius: "ಕುಂಭ",
  Pisces: "ಮೀನ",
  Mesha: "ಮೇಷ",
  Vrishabha: "ವೃಷಭ",
  Mithuna: "ಮಿಥುನ",
  Karka: "ಕರ್ಕಾಟಕ",
  Simha: "ಸಿಂಹ",
  Kanya: "ಕನ್ಯಾ",
  Tula: "ತುಲಾ",
  Vrischika: "ವೃಶ್ಚಿಕ",
  Dhanu: "ಧನು",
  Makara: "ಮಕರ",
  Kumbha: "ಕುಂಭ",
  Meena: "ಮೀನ",
};

export const KANNADA_WEEKDAYS: Record<string, string> = {
  Sunday: "ಭಾನುವಾರ",
  Monday: "ಸೋಮವಾರ",
  Tuesday: "ಮಂಗಳವಾರ",
  Wednesday: "ಬುಧವಾರ",
  Thursday: "ಗುರುವಾರ",
  Friday: "ಶುಕ್ರವಾರ",
  Saturday: "ಶನಿವಾರ",
};

export const KANNADA_NAKSHATRAS: Record<string, string> = {
  Ashwini: "ಅಶ್ವಿನಿ",
  Bharani: "ಭರಣಿ",
  Krittika: "ಕೃತ್ತಿಕಾ",
  Rohini: "ರೋಹಿಣಿ",
  Mrigashira: "ಮೃಗಶಿರಾ",
  Ardra: "ಆರಿದ್ರಾ",
  Punarvasu: "ಪುನರ್ವಸು",
  Pushya: "ಪುಷ್ಯ",
  Ashlesha: "ಆಶ್ಲೇಷ",
  Magha: "ಮಘಾ",
  "Purva Phalguni": "ಪೂರ್ವ ಫಲ್ಗುಣಿ",
  "Uttara Phalguni": "ಉತ್ತರ ಫಲ್ಗುಣಿ",
  Hasta: "ಹಸ್ತ",
  Chitra: "ಚಿತ್ತಾ",
  Swati: "ಸ್ವಾತಿ",
  Vishakha: "ವಿಶಾಖಾ",
  Anuradha: "ಅನೂರಾಧಾ",
  Jyeshtha: "ಜ್ಯೇಷ್ಠಾ",
  Mula: "ಮೂಲ",
  "Purva Ashadha": "ಪೂರ್ವಾಷಾಢ",
  "Uttara Ashadha": "ಉತ್ತರಾಷಾಢ",
  Shravana: "ಶ್ರವಣ",
  Dhanishta: "ಧನಿಷ್ಠಾ",
  Shatabhisha: "ಶತಭಿಷ",
  "Purva Bhadrapada": "ಪೂರ್ವಾಭಾದ್ರ",
  "Uttara Bhadrapada": "ಉತ್ತರಾಭಾದ್ರ",
  Revati: "ರೇವತಿ",
};

export const KANNADA_TITHIS: Record<string, string> = {
  "Shukla Pratipada": "ಶುಕ್ಲ ಪ್ರತಿಪದೆ",
  "Shukla Dwitiya": "ಶುಕ್ಲ ದ್ವಿತೀಯಾ",
  "Shukla Tritiya": "ಶುಕ್ಲ ತೃತೀಯಾ",
  "Shukla Chaturthi": "ಶುಕ್ಲ ಚತುರ್ಥಿ",
  "Shukla Panchami": "ಶುಕ್ಲ ಪಂಚಮಿ",
  "Shukla Shashthi": "ಶುಕ್ಲ ಷಷ್ಠಿ",
  "Shukla Saptami": "ಶುಕ್ಲ ಸಪ್ತಮಿ",
  "Shukla Ashtami": "ಶುಕ್ಲ ಅಷ್ಟಮಿ",
  "Shukla Navami": "ಶುಕ್ಲ ನವಮಿ",
  "Shukla Dashami": "ಶುಕ್ಲ ದಶಮಿ",
  "Shukla Ekadashi": "ಶುಕ್ಲ ಏಕಾದಶಿ",
  "Shukla Dwadashi": "ಶುಕ್ಲ ದ್ವಾದಶಿ",
  "Shukla Trayodashi": "ಶುಕ್ಲ ತ್ರಯೋದಶಿ",
  "Shukla Chaturdashi": "ಶುಕ್ಲ ಚತುರ್ದಶಿ",
  "Poornima": "ಪೂರ್ಣಿಮಾ",
  "Purnima": "ಪೂರ್ಣಿಮಾ",
  "Krishna Pratipada": "ಕೃಷ್ಣ ಪ್ರತಿಪದೆ",
  "Krishna Dwitiya": "ಕೃಷ್ಣ ದ್ವಿತೀಯಾ",
  "Krishna Tritiya": "ಕೃಷ್ಣ ತೃತೀಯಾ",
  "Krishna Chaturthi": "ಕೃಷ್ಣ ಚತುರ್ಥಿ",
  "Krishna Panchami": "ಕೃಷ್ಣ ಪಂಚಮಿ",
  "Krishna Shashthi": "ಕೃಷ್ಣ ಷಷ್ಠಿ",
  "Krishna Saptami": "ಕೃಷ್ಣ ಸಪ್ತಮಿ",
  "Krishna Ashtami": "ಕೃಷ್ಣ ಅಷ್ಟಮಿ",
  "Krishna Navami": "ಕೃಷ್ಣ ನವಮಿ",
  "Krishna Dashami": "ಕೃಷ್ಣ ದಶಮಿ",
  "Krishna Ekadashi": "ಕೃಷ್ಣ ಏಕಾದಶಿ",
  "Krishna Dwadashi": "ಕೃಷ್ಣ ದ್ವಾದಶಿ",
  "Krishna Trayodashi": "ಕೃಷ್ಣ ತ್ರಯೋದಶಿ",
  "Krishna Chaturdashi": "ಕೃಷ್ಣ ಚತುರ್ದಶಿ",
  "Amavasya": "ಅಮಾವಾಸ್ಯೆ",
};

export const KANNADA_YOGAS: Record<string, string> = {
  Vishkambha: "ವಿಷ್ಕಂಭ",
  Priti: "ಪ್ರೀತಿ",
  Ayushman: "ಆಯುಷ್ಮಾನ್",
  Saubhagya: "ಸೌಭಾಗ್ಯ",
  Shobhana: "ಶೋಭನ",
  Atiganda: "ಅತಿಗಂಡ",
  Sukarma: "ಸುಕರ್ಮ",
  Dhriti: "ಧೃತಿ",
  Shula: "ಶೂಲ",
  Ganda: "ಗಂಡ",
  Vriddhi: "ವೃದ್ಧಿ",
  Dhruva: "ಧ್ರುವ",
  Vyaghata: "ವ್ಯಾಘಾತ",
  Harshana: "ಹರ್ಷಣ",
  Vajra: "ವಜ್ರ",
  Siddhi: "ಸಿದ್ಧಿ",
  Vyatipata: "ವ್ಯತೀಪಾತ",
  Variyan: "ವರೀಯಾನ್",
  Parigha: "ಪರಿಘ",
  Shiva: "ಶಿವ",
  Siddha: "ಸಿದ್ಧ",
  Sadhya: "ಸಾಧ್ಯ",
  Shubha: "ಶುಭ",
  Shukla: "ಶುಕ್ಲ",
  Brahma: "ಬ್ರಹ್ಮ",
  Indra: "ಇಂದ್ರ",
  Vaidhriti: "ವೈಧೃತಿ",
};

export const KANNADA_KARANAS: Record<string, string> = {
  Bava: "ಬವ",
  Balava: "ಬಾಲವ",
  Kaulava: "ಕೌಲವ",
  Taitila: "ತೈತಿಲ",
  Garaja: "ಗರಜ",
  Vanija: "ವಣಿಜ",
  Vishti: "ವಿಷ್ಟಿ (ಭದ್ರಾ)",
  Bhadra: "ಭದ್ರಾ",
  Shakuni: "ಶಕುನಿ",
  Chatushpada: "ಚತುಷ್ಪಾದ",
  Naga: "ನಾಗ",
  Kimstughna: "ಕಿಂಸ್ತುಘ್ನ",
};

export const KARNATAKA_PLACES_KN: Record<string, string> = {
  "Bengaluru, Karnataka, India": "ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Bangalore, Karnataka, India": "ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Bengaluru": "ಬೆಂಗಳೂರು",
  "Bangalore": "ಬೆಂಗಳೂರು",
  "Chintamani, Karnataka, India": "ಚಿಂತಾಮಣಿ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Chintamani": "ಚಿಂತಾಮಣಿ",
  "Mysuru, Karnataka, India": "ಮೈಸೂರು, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Mysore, Karnataka, India": "ಮೈಸೂರು, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Mysuru": "ಮೈಸೂರು",
  "Mysore": "ಮೈಸೂರು",
  "Mangaluru, Karnataka, India": "ಮಂಗಳೂರು, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Mangalore, Karnataka, India": "ಮಂಗಳೂರು, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Hubballi, Karnataka, India": "ಹುಬ್ಬಳ್ಳಿ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Hubli, Karnataka, India": "ಹುಬ್ಬಳ್ಳಿ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Belagavi, Karnataka, India": "ಬೆಳಗಾವಿ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Belgaum, Karnataka, India": "ಬೆಳಗಾವಿ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Kalaburagi, Karnataka, India": "ಕಲಬುರಗಿ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Davanagere, Karnataka, India": "ದಾವಣಗೆರೆ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Ballari, Karnataka, India": "ಬಳ್ಳಾರಿ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Vijayapura, Karnataka, India": "ವಿಜಯಪುರ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Shivamogga, Karnataka, India": "ಶಿವಮೊಗ್ಗ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Tumakuru, Karnataka, India": "ತುಮಕೂರು, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Udupi, Karnataka, India": "ಉಡುಪಿ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Kolar, Karnataka, India": "ಕೋಲಾರ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Mandya, Karnataka, India": "ಮಂಡ್ಯ, ಕರ್ನಾಟಕ, ಭಾರತ",
  "Hassan, Karnataka, India": "ಹಾಸನ, ಕರ್ನಾಟಕ, ಭಾರತ",
};

export const KANNADA_MONTHS: Record<number, string> = {
  1: "ಜನವರಿ",
  2: "ಫೆಬ್ರವರಿ",
  3: "ಮಾರ್ಚ್",
  4: "ಏಪ್ರಿಲ್",
  5: "ಮೇ",
  6: "ಜೂನ್",
  7: "ಜುಲೈ",
  8: "ಆಗಸ್ಟ್",
  9: "ಸೆಪ್ಟೆಂಬರ್",
  10: "ಅಕ್ಟೋಬರ್",
  11: "ನವೆಂಬರ್",
  12: "ಡಿಸೆಂಬರ್",
};

export const KANNADA_AVAKAHADA: Record<string, string> = {
  // Varna
  "Brahmin": "ಬ್ರಾಹ್ಮಣ",
  "Kshatriya": "ಕ್ಷತ್ರಿಯ",
  "Vaishya": "ವೈಶ್ಯ",
  "Shudra": "ಶೂದ್ರ",
  // Vashya
  "Manava": "ಮಾನವ",
  "Chatushpada": "ಚತುಷ್ಪಾದ",
  "Jalachara": "ಜಲಚರ",
  "Vanachara": "ವನಚರ",
  "Keeta": "ಕೀಟ",
  "Chatushpada (1st half) / Jalachara (2nd half)": "ಚತುಷ್ಪಾದ (ಪ್ರಥಮಾರ್ಧ) / ಜಲಚರ (ದ್ವಿತೀಯಾರ್ಧ)",
  // Gana
  "Deva": "ದೇವ",
  "Manushya": "ಮನುಷ್ಯ",
  "Rakshasa": "ರಾಕ್ಷಸ",
  // Nadi
  "Adi": "ಆದಿ",
  "Madhya": "ಮಧ್ಯ",
  "Antya": "ಅಂತ್ಯ",
  // Tatva
  "Prithvi (Earth)": "ಪೃಥ್ವಿ (ಭೂಮಿ)",
  "Jala (Water)": "ಜಲ (ನೀರು)",
  "Agni (Fire)": "ಅಗ್ನಿ (ಬೆಂಕಿ)",
  "Vayu (Air)": "ವಾಯು (ಗಾಳಿ)",
  "Akasha (Ether)": "ಆಕಾಶ",
  "Prithvi": "ಪೃಥ್ವಿ (ಭೂಮಿ)",
  "Jala": "ಜಲ (ನೀರು)",
  "Agni": "ಅಗ್ನಿ (ಬೆಂಕಿ)",
  "Vayu": "ವಾಯು (ಗಾಳಿ)",
  "Akasha": "ಆಕಾಶ",
  // Yunja
  "Purva (First)": "ಪೂರ್ವ",
  "Madhya (Middle)": "ಮಧ್ಯ",
  "Apara (Last)": "ಅಪರ",
  "Purva": "ಪೂರ್ವ",
  "Apara": "ಅಪರ",
  // Paya
  "Swarna (Gold)": "ಸ್ವರ್ಣ",
  "Rajata (Silver)": "ರಜತ",
  "Tamra (Copper)": "ತಾಮ್ರ",
  "Loha (Iron)": "ಲೋಹ",
  "Swarna": "ಸ್ವರ್ಣ",
  "Rajata": "ರಜತ",
  "Tamra": "ತಾಮ್ರ",
  "Loha": "ಲೋಹ",
  // Gender
  "Male": "ಪುರುಷ",
  "Female": "ಸ್ತ್ರೀ",
  // Individual Yoni animals
  "Horse": "ಅಶ್ವ",
  "Elephant": "ಗಜ",
  "Sheep": "ಮೇಷ",
  "Serpent": "ಸರ್ಪ",
  "Dog": "ಶ್ವಾನ",
  "Cat": "ಮಾರ್ಜಾಲ",
  "Rat": "ಮೂಷಕ",
  "Cow": "ಗೋ",
  "Buffalo": "ಮಹಿಷ",
  "Tiger": "ವ್ಯಾಘ್ರ",
  "Deer": "ಮೃಗ",
  "Monkey": "ವಾನರ",
  "Mongoose": "ನಕುಲ",
  "Lion": "ಸಿಂಹ",
  // Yoni animal pairs
  "Buffalo (Female)": "ಮಹಿಷ (ಸ್ತ್ರೀ)",
  "Buffalo (Male)": "ಮಹಿಷ (ಪುರುಷ)",
  "Monkey (Female)": "ವಾನರ (ಸ್ತ್ರೀ)",
  "Monkey (Male)": "ವಾನರ (ಪುರುಷ)",
  "Horse (Female)": "ಅಶ್ವ (ಸ್ತ್ರೀ)",
  "Horse (Male)": "ಅಶ್ವ (ಪುರುಷ)",
  "Elephant (Female)": "ಗಜ (ಸ್ತ್ರೀ)",
  "Elephant (Male)": "ಗಜ (ಪುರುಷ)",
  "Sheep (Female)": "ಮೇಷ (ಸ್ತ್ರೀ)",
  "Sheep (Male)": "ಮೇಷ (ಪುರುಷ)",
  "Serpent (Female)": "ಸರ್ಪ (ಸ್ತ್ರೀ)",
  "Serpent (Male)": "ಸರ್ಪ (ಪುರುಷ)",
  "Dog (Female)": "ಶ್ವಾನ (ಸ್ತ್ರೀ)",
  "Dog (Male)": "ಶ್ವಾನ (ಪುರುಷ)",
  "Cat (Female)": "ಮಾರ್ಜಾಲ (ಸ್ತ್ರೀ)",
  "Cat (Male)": "ಮಾರ್ಜಾಲ (ಪುರುಷ)",
  "Rat (Female)": "ಮೂಷಕ (ಸ್ತ್ರೀ)",
  "Rat (Male)": "ಮೂಷಕ (ಪುರುಷ)",
  "Cow (Female)": "ಗೋ (ಸ್ತ್ರೀ)",
  "Cow (Male)": "ಗೋ (ಪುರುಷ)",
  "Tiger (Female)": "ವ್ಯಾಘ್ರ (ಸ್ತ್ರೀ)",
  "Tiger (Male)": "ವ್ಯಾಘ್ರ (ಪುರುಷ)",
  "Deer (Female)": "ಮೃಗ (ಸ್ತ್ರೀ)",
  "Deer (Male)": "ಮೃಗ (ಪುರುಷ)",
  "Mongoose (Female)": "ನಕುಲ (ಸ್ತ್ರೀ)",
  "Mongoose (Male)": "ನಕುಲ (ಪುರುಷ)",
  "Lion (Female)": "ಸಿಂಹ (ಸ್ತ್ರೀ)",
  "Lion (Male)": "ಸಿಂಹ (ಪುರುಷ)",
};

export const KANNADA_JANMA_LABELS: Record<string, string> = {
  app_name: "ಕುಂಡಲಿ ವರದಿ",
  report_kind: "ಜನ್ಮ ಕುಂಡಲಿ ವರದಿ",
  running_title: "ಜನ್ಮ ಕುಂಡಲಿ ವರದಿ",
  footer_text: "",
  page_of: "ಪುಟ",
  ch_basic: "ಮೂಲ ವಿವರಗಳು ಮತ್ತು ಪಂಚಾಂಗ",
  ch_kundli: "ಕುಂಡಲಿ ನಕ್ಷೆಗಳು ಮತ್ತು ಗ್ರಹ ಸ್ಥಿತಿಗಳು",
  ch_dasha: "ವಿಂಶೋತ್ತರಿ ದಶಾ ಅವಧಿಗಳು",
  ch_dosha: "ದೋಷ ವಿಶ್ಲೇಷಣೆ",
  ch_terms: "ಪದಕೋಶ ವಿವರಣೆ",
  ch_about: "ಈ ವರದಿಯ ಬಗೆಗಿನ ವಿವರಣೆ",
  sec_settings: "ಖಗೋಳ ಲೆಕ್ಕಾಚಾರದ ನಿಯತಾಂಕಗಳು",
  cap_settings: "ಖಗೋಳ ಸಂರಚನೆ, ಎಫೆಮರಿಸ್ ಮತ್ತು ಗಣಿತ ನಿಯತಾಂಕಗಳು.",
  sec_methodology: "ಗಣಿತ ವಿಧಾನದ ವಿವರಣೆ",
  sec_summary: "ಜನನ ಸಾರಾಂಶ",
  cap_summary: "ಜಾತಕದ ಮುಖ್ಯ ವಿವರಗಳು ಒಂದೆಡೆ.",
  sec_birth: "ಜನನ ವಿವರಗಳು",
  cap_birth: "ಈ ವರದಿಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಲು ಬಳಸಿದ ಜನನ ಮಾಹಿತಿ.",
  sec_panchang: "ಪಂಚಾಂಗ",
  cap_panchang: "ಜನನ ಸಮಯದಲ್ಲಿನ ಪಂಚಾಂಗದ ಐದು ಸಾಂಪ್ರದಾಯಿಕ ಅಂಗಗಳು.",
  sec_avakahada: "ಅವಕಹಡಾ ವಿವರಗಳು",
  cap_avakahada: "ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ಚಂದ್ರ ರಾಶಿಯ ಸಾರಾಂಶ ಗುಣಗಳು.",
  sec_lagna_kundli: "ಜನ್ಮ ಕುಂಡಲಿ (D1)",
  cap_charts: "ಜನ್ಮ ಕುಂಡಲಿಯು ಗ್ರಹಗಳ ರಾಶಿ ಸ್ಥಾನಗಳನ್ನು ತೋರಿಸುತ್ತದೆ; ನವಾಂಶ ಕುಂಡಲಿಯು ಪ್ರತಿ ರಾಶಿಯನ್ನು ಒಂಬತ್ತು ಭಾಗಗಳಾಗಿ ವಿಭಜಿಸುತ್ತದೆ.",
  sec_navamsa: "ನವಾಂಶ ಕುಂಡಲಿ (D9)",
  sec_planets: "ಗ್ರಹ ಸ್ಥಿತಿಗಳು",
  cap_planets: "ಜನನ ಸಮಯದಲ್ಲಿನ ಪ್ರತಿ ಗ್ರಹದ ರಾಶಿ, ಭಾವ, ನಿಖರವಾದ ಅಂಶ ಮತ್ತು ನಕ್ಷತ್ರ.",
  sec_dasha_overview: "ಮಹಾದಶಾ ಅವಲೋಕನ",
  cap_dasha_overview: "120 ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ಚಕ್ರದ ಪ್ರಮುಖ ಗ್ರಹ ಅವಧಿಗಳು.",
  sec_antar_current: "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ — ಅಂತರ್ದಶೆಗಳು",
  cap_antar_current: "ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆಯೊಳಗಿನ ಉಪ-ಅವಧಿಗಳು.",
  sec_mangal: "ಮಂಗಳ ದೋಷ (ಕುಜ ದೋಷ)",
  cap_mangal: "ಮೂರು ಉಲ್ಲೇಖ ಬಿಂದುಗಳಿಂದ ಮಂಗಳನ ಸ್ಥಾನದ ಪರಿಶೀಲನೆ.",
  sec_kaalsarpa: "ಕಾಲ ಸರ್ಪ",
  cap_kaalsarpa: "ರಾಹು-ಕೇತು ಅಕ್ಷಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಗ್ರಹಗಳ ಹರಡುವಿಕೆ.",
  sec_sadesati: "ಸಾಡೇ ಸಾತಿ (ಏಳರೆನಾಡು ಶನಿ)",
  cap_sadesati: "ಜನ್ಮ ಚಂದ್ರ ರಾಶಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಶನಿಯ ಸಂಚಾರ.",
  sec_about: "ಲೆಕ್ಕಾಚಾರದ ಸಿದ್ಧತೆಗಳು ಮತ್ತು ನಿಯಮಗಳು",
  cap_about: "ಖಗೋಳ ಸಂರಚನೆ, ನಿಯತಾಂಕಗಳು ಮತ್ತು ಲೆಕ್ಕಾಚಾರದ ನಿಯಮಗಳು.",
  sec_notes: "ವಿಧಾನಗಳ ಬಗೆಗಿನ ವಿವರಣೆ",
  name: "ಹೆಸರು", gender: "ಲಿಂಗ", date: "ಜನನ ದಿನಾಂಕ", time: "ಜನನ ಸಮಯ",
  place: "ಜನನ ಸ್ಥಳ", latitude: "ಅಕ್ಷಾಂಶ", longitude: "ರೇಖಾಂಶ",
  timezone: "ಸಮಯ ವಲಯ", settings: "ಲೆಕ್ಕಾಚಾರದ ನಿಯಮಗಳು",
  vara: "ವಾರ (ದಿನ)", tithi: "ತಿಥಿ", nakshatra: "ನಕ್ಷತ್ರ",
  nakshatra_lord: "ನಕ್ಷತ್ರಾಧಿಪತಿ", nak_lord_short: "ನಕ್ಷತ್ರಾಧಿಪತಿ", yoga: "ಯೋಗ", karana: "ಕರಣ",
  sunrise: "ಸೂರ್ಯೋದಯ", sunset: "ಸೂರ್ಯಾಸ್ತ",
  ascendant: "ಲಗ್ನ (ಆರೋಹಣ)", ascendant_lord: "ಲಗ್ನಾಧಿಪತಿ",
  moon_sign: "ಚಂದ್ರ ರಾಶಿ", sun_sign: "ಸೂರ್ಯ ರಾಶಿ",
  current_dasha: "ಪ್ರಸ್ತುತ ದಶಾ", current_antar: "ಅಂತರ್ದಶಾ",
  varna: "ವರ್ಣ", vashya: "ವಶ್ಯ", tara: "ತಾರಾ", yoni: "ಯೋನಿ", gana: "ಗಣ",
  nadi: "ನಾಡಿ", rashi: "ರಾಶಿ", rashi_lord: "ರಾಶ್ಯಾಧಿಪತಿ",
  charan: "ಚರಣ (ಪಾದ)", tatva: "ತತ್ವ", name_alphabet: "ನಾಮಾಕ್ಷರ",
  paya: "ಪಾಯ", yunja: "ಯುಂಜ",
  planet: "ಗ್ರಹ", sign: "ರಾಶಿ", sign_lord: "ರಾಶ್ಯಾಧಿಪತಿ", house: "ಭಾವ",
  degree: "ಅಂಶ", pada: "ಪಾದ", d9: "ನವಾಂಶ", status: "ಸ್ಥಿತಿ",
  ref_point: "ಉಲ್ಲೇಖ ಬಿಂದು", mars_house: "ಕುಜ ಭಾವ",
  counted_houses: "ಪರಿಗಣಿತ ಭಾವಗಳು", in_reference: "ಕುಜ ಉಪಸ್ಥಿತಿ",
  yes: "ಹೌದು", no: "ಇಲ್ಲ",
  mahadasha: "ಮಹಾದಶೆ", antardasha: "ಅಂತರ್ದಶೆ", start: "ಆರಂಭ", end: "ಅಂತ್ಯ",
  years: "ವರ್ಷಗಳು", active: "ಸಕ್ರಿಯ",
  balance_at_birth: "ಜನನದಲ್ಲಿ ಉಳಿದಿರುವ ದಶಾ",
  result: "ಫಲಿತಾಂಶ", present: "ಕಂಡುಬಂದಿದೆ", not_present: "ಕಂಡುಬಂದಿಲ್ಲ",
  sade_status: "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ", sade_active: "ಸಕ್ರಿಯ", sade_inactive: "ಸಕ್ರಿಯವಾಗಿಲ್ಲ",
  saturn_now: "ಶನಿಯ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ", prev_window: "ಹಿಂದಿನ ಕಾಲಾವಧಿ", next_window: "ಮುಂದಿನ ಕಾಲಾವಧಿ",
  approx: "ಅಂದಾಜು",
  term_lagna: "ಲಗ್ನ", term_rashi: "ರಾಶಿ", term_nakshatra: "ನಕ್ಷತ್ರ",
  term_pada: "ಪಾದ", term_tithi: "ತಿಥಿ", term_yoga: "ಯೋಗ", term_karana: "ಕರಣ",
  term_mahadasha: "ಮಹಾದಶೆ", term_antardasha: "ಅಂತರ್ದಶೆ",
  term_retrograde: "ವಕ್ರ", term_combust: "ಅಸ್ತ",
  term_vargottama: "ವರ್ಗೋತ್ತಮ", term_navamsa: "ನವಾಂಶ",
  term_mangal: "ಮಂಗಳ ದೋಷ", term_kaalsarpa: "ಕಾಲ ಸರ್ಪ",
  term_sadesati: "ಸಾಡೇ ಸಾತಿ",
  ayanamsa: "ಅಯನಾಂಶ", node_type: "ರಾಹು-ಕೇತು ಲೆಕ್ಕಾಚಾರ", house_system: "ಭಾವ ಪದ್ಧತಿ",
  dasha_year: "ದಶಾ ವರ್ಷ ಪ್ರಮಾಣ", chart_id: "ಜಾತಕ ಗುರುತು ಸಂಖ್ಯೆ",
  generated_dt: "ಸಿದ್ಧಪಡಿಸಿದ ದಿನಾಂಕ", methodology: "ವಿಧಾನ ಆವೃತ್ತಿ",
};

/** Converts Western digits 0-9 to Kannada numerals ೦-೯ when requested. */
export function toKannadaDigits(input: string | number): string {
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return String(input).replace(/[0-9]/g, (d) => knDigits[Number(d)]);
}

export const KANNADA_NAME_ALPHABETS: Record<string, string> = {
  Chu: "ಚು", Che: "ಚೇ", Cho: "ಚೋ", La: "ಲಾ",
  Li: "ಲೀ", Lu: "ಲೂ", Le: "ಲೇ", Lo: "ಲೋ",
  A: "ಅ", I: "ಇ", U: "ಉ", E: "ಏ",
  O: "ಓ", Va: "ವಾ", Vi: "ವೀ", Vu: "ವೂ",
  Ve: "ವೇ", Vo: "ವೋ", Ka: "ಕಾ", Ke: "ಕೇ",
  Ko: "ಕೋ", Ha: "ಹಾ", Hi: "ಹೀ", Hu: "ಹೂ",
  He: "ಹೇ", Ho: "ಹೋ", Da: "ಡಾ", Di: "ಡೀ",
  Du: "ಡೂ", De: "ಡೇ", Do: "ಡೋ", Ma: "ಮಾ",
  Mi: "ಮೀ", Mu: "ಮೂ", Me: "ಮೇ", Mo: "ಮೋ",
  Ta: "ಟಾ", Ti: "ಟೀ", Tu: "ಟೂ", Te: "ಟೇ",
  To: "ಟೋ", Pa: "ಪಾ", Pi: "ಪೀ", Pu: "ಪೂ", Poo: "ಪೂ",
  Sha: "ಷ", Na: "ಣ", Tha: "ಠಾ", Pe: "ಪೇ", Po: "ಪೋ",
  Ra: "ರಾ", Ri: "ರೀ", Ru: "ರೂ", Re: "ರೇ", Ro: "ರೋ",
  Ya: "ಯಾ", Yi: "ಯೀ", Yu: "ಯೂ", Ye: "ಯೇ", Yo: "ಯೋ",
  Bha: "ಭಾ", Bhi: "ಭೀ", Bhu: "ಭೂ", Dha: "ಧಾ",
  Bhe: "ಭೇ", Bho: "ಭೋ", Ja: "ಜಾ", Ji: "ಜೀ",
  Khi: "ಖೀ", Khu: "ಖೂ", Khe: "ಖೇ", Kho: "ಖೋ",
  Ga: "ಗಾ", Gi: "ಗೀ", Gu: "ಗೂ", Ge: "ಗೇ", Go: "ಗೋ",
  Sa: "ಸಾ", Si: "ಸೀ", Su: "ಸೂ", Se: "ಸೇ", So: "ಸೋ",
  Cha: "ಚಾ", Chi: "ಚೀ", Daa: "ದಾ", Dee: "ದೀ", Doo: "ದೂ",
};

/** Translates astrological values (Grahas, Rashis, Nakshatras, Avakahada, statuses). */
export function translateJyotishValue(val: string | undefined | null, lang: "en" | "kn"): string {
  if (!val || val === "—") return "—";
  if (lang !== "kn") return val;

  const trimmed = val.trim();

  // Name alphabet
  if (KANNADA_NAME_ALPHABETS[trimmed]) return KANNADA_NAME_ALPHABETS[trimmed];

  // Genders
  if (/^male$/i.test(trimmed)) return "ಪುರುಷ";
  if (/^female$/i.test(trimmed)) return "ಸ್ತ್ರೀ";

  // Planets
  if (KANNADA_PLANETS[trimmed]) return KANNADA_PLANETS[trimmed];

  // Signs
  if (KANNADA_SIGNS[trimmed]) return KANNADA_SIGNS[trimmed];

  // Nakshatras
  if (KANNADA_NAKSHATRAS[trimmed]) return KANNADA_NAKSHATRAS[trimmed];

  // Tithis
  if (KANNADA_TITHIS[trimmed]) return KANNADA_TITHIS[trimmed];

  // Yogas
  if (KANNADA_YOGAS[trimmed]) return KANNADA_YOGAS[trimmed];

  // Karanas
  if (KANNADA_KARANAS[trimmed]) return KANNADA_KARANAS[trimmed];

  // Weekdays
  if (KANNADA_WEEKDAYS[trimmed]) return KANNADA_WEEKDAYS[trimmed];

  // Avakahada qualities
  if (KANNADA_AVAKAHADA[trimmed]) return KANNADA_AVAKAHADA[trimmed];

  // Tara (e.g. "Tara 4")
  if (/^Tara\s*(\d+)$/i.test(trimmed)) {
    const num = trimmed.replace(/^Tara\s*/i, "");
    const taraNames: Record<string, string> = {
      "1": "ಜನ್ಮ", "2": "ಸಂಪತ್", "3": "ವಿಪತ್", "4": "ಕ್ಷೇಮ",
      "5": "ಪ್ರತ್ಯಕ್", "6": "ಸಾಧನ", "7": "ನೈಧನ", "8": "ಮಿತ್ರ", "9": "ಪರಮ ಮಿತ್ರ"
    };
    return `${num} - ${taraNames[num] || "ತಾರಾ"}`;
  }

  // Common dignities / statuses
  if (/own sign/i.test(trimmed)) return "ಸ್ವಕ್ಷೇತ್ರ";
  if (/exalted/i.test(trimmed)) return "ಉಚ್ಚ";
  if (/debilitated/i.test(trimmed)) return "ನೀಚ";
  if (/vargottama/i.test(trimmed)) return "ವರ್ಗೋತ್ತಮ";
  if (trimmed === "R") return "ವ";
  if (trimmed === "C") return "ಅ";

  // Arrow sequences (e.g. Rahu → Venus → Jupiter)
  if (trimmed.includes("→") || trimmed.includes("->")) {
    const parts = trimmed.split(/\s*(?:→|->)\s*/);
    return parts.map(p => translateJyotishValue(p, lang)).join(" → ");
  }

  return trimmed;
}

/** Translates date into Kannada with Kannada month name. */
export function formatKannadaDate(isoDate: string | undefined | null, useKnDigits: boolean = false): string {
  if (!isoDate || typeof isoDate !== "string" || isoDate.length < 10) return "—";
  const [yearStr, monthStr, dayStr] = isoDate.slice(0, 10).split("-");
  const monthNum = Number(monthStr);
  const dayNum = Number(dayStr);
  const monthKn = KANNADA_MONTHS[monthNum] || monthStr;

  const formatted = `${dayNum} ${monthKn} ${yearStr}`;
  return useKnDigits ? toKannadaDigits(formatted) : formatted;
}

/** Translates time into Kannada. */
export function formatKannadaTime(timeStr: string | undefined | null, useKnDigits: boolean = false): string {
  if (!timeStr) return "—";
  let res = timeStr.trim();
  if (/am$/i.test(res)) {
    res = `${res.replace(/\s*am$/i, "").trim()} ಬೆಳಗ್ಗೆ`;
  } else if (/pm$/i.test(res)) {
    res = `${res.replace(/\s*pm$/i, "").trim()} ಸಂಜೆ`;
  } else if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(res)) {
    const hour = parseInt(res.split(":")[0], 10);
    if (hour >= 0 && hour < 4) {
      res = `${res} ರಾತ್ರಿ`;
    } else if (hour >= 4 && hour < 12) {
      res = `${res} ಬೆಳಗ್ಗೆ`;
    } else if (hour >= 12 && hour < 16) {
      res = `${res} ಮಧ್ಯಾಹ್ನ`;
    } else if (hour >= 16 && hour < 20) {
      res = `${res} ಸಂಜೆ`;
    } else {
      res = `${res} ರಾತ್ರಿ`;
    }
  }
  return useKnDigits ? toKannadaDigits(res) : res;
}
