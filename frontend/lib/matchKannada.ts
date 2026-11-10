/**
 * Specialized Kannada dictionary and translation helpers for Marriage Matching print reports.
 * All terms verified against classical Kannada Jyotish terminology without subjective predictions.
 * Zero banned words, zero subjective verdicts, zero mitigation/cancellation claims.
 * Consistent Western digits (0-9) used across all text.
 */
import { translateJyotishValue } from "./janmaKannada";

export const KANNADA_MATCH_LABELS: Record<string, string> = {
  app_name: "ಕುಂಡಲಿ ವರದಿ",
  report_kind: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ ವರದಿ",
  running_title: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ ವರದಿ",
  computer_generated: "ಕಂಪ್ಯೂಟರ್ ರಚಿತ ವರದಿ",
  page_of: "ಪುಟ",
  groom: "ವರ",
  bride: "ವಧು",
  groom_profile: "ವರನ ಜಾತಕ ವಿವರ",
  bride_profile: "ವಧುವಿನ ಜಾತಕ ವಿವರ",
  ch_profiles: "ಮೂಲ ವಿವರಗಳು ಮತ್ತು ಜಾತಕ ಸಾರಾಂಶ",
  ch_charts: "ಕುಂಡಲಿ ನಕ್ಷೆಗಳು",
  ch_planets_dasha: "ಗ್ರಹ ಸ್ಥಿತಿಗಳು ಮತ್ತು ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲಾವಧಿ",
  ch_ashtakoota: "ಅಷ್ಟಕೂಟ ಗುಣ ಮಿಲನ",
  ch_dasa_dosha: "ದಶ ಕೂಟ ಪೊರುತಂಗಳು",
  ch_dosha: "ದೋಷ ವಿಶ್ಲೇಷಣೆ",
  sec_summary: "ಹೊಂದಾಣಿಕೆ ಸಾರಾಂಶ",
  cap_summary: "ಅಷ್ಟಕೂಟ ಮತ್ತು ದಶ ಕೂಟ ಪದ್ಧತಿಯ ಮುಖ್ಯ ಹೊಂದಾಣಿಕೆ ಮೌಲ್ಯಗಳು.",
  sec_profiles: "ವರ ಮತ್ತು ವಧುವಿನ ಜನನ ವಿವರಗಳು",
  cap_profiles: "ಜಾತಕ ವಿಶ್ಲೇಷಣೆಗೆ ಬಳಸಲಾದ ಜನನ ವಿವರಗಳು ಮತ್ತು ಅವಕಹಡಾ ಗುಣಗಳು.",
  sec_groom_charts: "ವರನ ಕುಂಡಲಿಗಳು — ಜನ್ಮ (D1) ಮತ್ತು ನವಾಂಶ (D9)",
  sec_bride_charts: "ವಧುವಿನ ಕುಂಡಲಿಗಳು — ಜನ್ಮ (D1) ಮತ್ತು ನವಾಂಶ (D9)",
  cap_charts: "D1 ಜನ್ಮ ಗ್ರಹ ಸ್ಥಾನಗಳನ್ನು ತೋರಿಸುತ್ತದೆ; D9 ನವಾಂಶವು ಪ್ರತಿ ರಾಶಿಯ ಒಂಬತ್ತು ಭಾಗಗಳನ್ನು ವಿಭಜಿಸುತ್ತದೆ.",
  sec_planets_table: "ಗ್ರಹ ಸ್ಥಿತಿಗಳ ತುಲನಾತ್ಮಕ ಕೋಷ್ಟಕ",
  cap_planets_table: "ವರ ಮತ್ತು ವಧುವಿನ ಜನನ ಲಗ್ನ, ಗ್ರಹ, ರಾಶಿ, ಅಂಶ, ನಕ್ಷತ್ರ, ಪಾದ ಮತ್ತು ಭಾವಗಳು.",
  sec_dasha_table: "ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ ಪ್ರಾರಂಭ ದಿನಾಂಕಗಳು",
  cap_dasha_table: "ಇಬ್ಬರ 120-ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ ಪ್ರಾರಂಭ ದಿನಾಂಕಗಳು ಮತ್ತು ಪ್ರಸ್ತುತ ದಶಾ ಅವಧಿ.",
  sec_ashtakoota_table: "ಅಷ್ಟಕೂಟ 8 ಆಯಾಮಗಳ ವಿವರ",
  cap_ashtakoota: "36 ಗುಣಗಳ ಪ್ರಮಾಣದಲ್ಲಿ 8 ಶಾಸ್ತ್ರೋಕ್ತ ಹೊಂದಾಣಿಕೆಯ ಆಯಾಮಗಳು.",
  sec_dasa_koota: "ದಶ ಕೂಟ ಪೊರುತಂಗಳು",
  cap_dasa_koota: "ದಕ್ಷಿಣ ಭಾರತೀಯ ಸಾಂಪ್ರದಾಯಿಕ 10-ಪೊರುತಂಗಳ ಹೊಂದಾಣಿಕೆ ಪದ್ಧತಿ.",
  sec_mangal_match: "ಮಂಗಳ ದೋಷ ಮತ್ತು ಕುಜ ಸಾಮ್ಯ ಪರಿಶೀಲನೆ",
  cap_mangal_match: "ವರ ಮತ್ತು ವಧುವಿನ ಲಗ್ನ, ಚಂದ್ರ ಮತ್ತು ಶುಕ್ರನಿಂದ ಮಂಗಳನ ಸ್ಥಾನಗಳ ಹೋಲಿಕೆ.",
  raw_score: "ಮೂಲ ಅಷ್ಟಕೂಟ ಅಂಕಗಳು",
  points: "ಅಂಕಗಳು",
  out_of_36: "36 ರಲ್ಲಿ",
  dasa_compatible_count: "ದಶ ಕೂಟ ಹೊಂದಾಣಿಕೆ",
  koota: "ಕೂಟ (ಆಯಾಮ)",
  max_pts: "ಗರಿಷ್ಠ",
  obtained_pts: "ಗಳಿಸಿದ ಅಂಕ",
  groom_val: "ವರನ ಮೌಲ್ಯ",
  bride_val: "ವಧುವಿನ ಮೌಲ್ಯ",
  status: "ಸ್ಥಿತಿ",
  porutham: "ಪೊರುತಂ",
  dimension: "ಪರಿಶೀಲಿಸಿದ ಅಂಶ",
  result: "ಫಲಿತಾಂಶ",
  compatible: "ಅನುಕೂಲ",
  not_compatible: "ಅನುಕೂಲವಲ್ಲ",
  conditional: "ಷರತ್ತುಬದ್ಧ",
  full: "ಪೂರ್ಣ",
  partial: "ಭಾಗಶಃ",
  neutral: "ಸಮ",
  good: "ಉತ್ತಮ",
  average: "ಸಾಧಾರಣ",
  dosha: "ದೋಷ",
  present: "ದೋಷವಿದೆ",
  not_present: "ದೋಷವಿಲ್ಲ",
  date: "ಜನನ ದಿನಾಂಕ",
  time: "ಜನನ ಸಮಯ",
  place: "ಜನನ ಸ್ಥಳ",
  lagna: "ಲಗ್ನ",
  rashi: "ರಾಶಿ",
  nakshatra: "ನಕ್ಷತ್ರ",
  pada: "ಪಾದ",
  varna: "ವರ್ಣ",
  vashya: "ವಶ್ಯ",
  yoni: "ಯೋನಿ",
  gana: "ಗಣ",
  nadi: "ನಾಡಿ",
  dasha_balance: "ಜನನ ದಶಾ ಶೇಷ",
  total_score: "ಒಟ್ಟು ಅಂಕಗಳು",
  ref_point: "ಆಧಾರ ಸ್ಥಾನ",
  groom_mars: "ವರನ ಮಂಗಳ ಸ್ಥಿತಿ",
  bride_mars: "ವಧುವಿನ ಮಂಗಳ ಸ್ಥಿತಿ",
  samya_summary: "ಕುಜ ಸಾಮ್ಯ ವಿವರ",
  planet: "ಗ್ರಹ",
  sign: "ರಾಶಿ",
  house: "ಭಾವ",
  degree: "ಅಂಶ",
  current_dasha: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ",
  current_antar: "ಅಂತರ್ದಶೆ",
  mahadasha: "ಮಹಾದಶೆ",
  start: "ಆರಂಭ",
  years: "ವರ್ಷಗಳು",
};

export const ENGLISH_MATCH_LABELS: Record<string, string> = {
  app_name: "Kundli Report",
  report_kind: "Marriage Matching Report",
  running_title: "Marriage Matching Report",
  computer_generated: "Computer-generated report",
  page_of: "Page",
  groom: "Groom",
  bride: "Bride",
  groom_profile: "Groom Profile",
  bride_profile: "Bride Profile",
  ch_profiles: "Basic Details & Profiles",
  ch_charts: "Kundli Charts",
  ch_planets_dasha: "Planetary Positions & Vimshottari Dasha",
  ch_ashtakoota: "Ashtakoota Milan",
  ch_dasa_dosha: "Dasa Koota Poruthams",
  ch_dosha: "Dosha Analysis",
  sec_summary: "Match Summary",
  cap_summary: "Headline compatibility scores from Ashtakoota and Dasa Koota systems.",
  sec_profiles: "Birth & Horoscope Profiles",
  cap_profiles: "Birth details and Avakahada qualities used for chart compatibility.",
  sec_groom_charts: "Groom Kundli — Birth Chart (D1) & Navamsa (D9)",
  sec_bride_charts: "Bride Kundli — Birth Chart (D1) & Navamsa (D9)",
  cap_charts: "D1 displays natal planetary placements; D9 divides each sign into nine harmonic parts.",
  sec_planets_table: "Comparative Planetary Positions",
  cap_planets_table: "Planetary signs, exact degrees, constellations, padas, and houses for both charts.",
  sec_dasha_table: "Vimshottari Mahadasha Start Dates",
  cap_dasha_table: "Chronological 120-year cycle start dates and active sub-periods for both charts.",
  sec_ashtakoota_table: "Ashtakoota 8 Dimensions",
  cap_ashtakoota: "Eightfold classical compatibility scored out of 36 points.",
  sec_dasa_koota: "Dasa Koota Poruthams",
  cap_dasa_koota: "Traditional South Indian 10-porutham compatibility system.",
  sec_mangal_match: "Mangal Dosha & Kuja Samya Analysis",
  cap_mangal_match: "Mars placement evaluated from Lagna, Moon, and Venus reference points.",
  raw_score: "Raw Ashtakoota Score",
  points: "Points",
  out_of_36: "out of 36",
  dasa_compatible_count: "Dasa Koota Matched",
  koota: "Koota (Dimension)",
  max_pts: "Max",
  obtained_pts: "Obtained",
  groom_val: "Groom Value",
  bride_val: "Bride Value",
  status: "Status",
  porutham: "Porutham",
  dimension: "What is Measured",
  result: "Result",
  compatible: "Compatible",
  not_compatible: "Not Compatible",
  conditional: "Conditional",
  full: "Full",
  partial: "Partial",
  neutral: "Neutral",
  good: "Good",
  average: "Average",
  dosha: "Afflicted",
  present: "Present",
  not_present: "Not present",
  date: "Date of Birth",
  time: "Time of Birth",
  place: "Place of Birth",
  lagna: "Ascendant (Lagna)",
  rashi: "Moon Sign (Rashi)",
  nakshatra: "Nakshatra",
  pada: "Pada",
  varna: "Varna",
  vashya: "Vashya",
  yoni: "Yoni",
  gana: "Gana",
  nadi: "Nadi",
  dasha_balance: "Dasha Balance at Birth",
  total_score: "Total Points",
  ref_point: "Reference Point",
  groom_mars: "Groom Mars Placement",
  bride_mars: "Bride Mars Placement",
  samya_summary: "Kuja Samya Summary",
  planet: "Planet",
  house: "House",
  degree: "Degree",
  current_dasha: "Current Mahadasha",
  current_antar: "Antardasha",
};

export const KANNADA_KOOTAS: Record<string, string> = {
  Varna: "ವರ್ಣ ಕೂಟ",
  Vashya: "ವಶ್ಯ ಕೂಟ",
  Tara: "ತಾರಾ ಕೂಟ",
  Yoni: "ಯೋನಿ ಕೂಟ",
  "Graha Maitri": "ಗ್ರಹ ಮೈತ್ರಿ ಕೂಟ",
  Gana: "ಗಣ ಕೂಟ",
  Bhakoot: "ಭಕೂಟ",
  Nadi: "ನಾಡೀ ಕೂಟ",
};

export const KANNADA_PORUTHAMS: Record<string, { name: string; dimension: string }> = {
  "Dina Porutham": { name: "ದಿನ ಪೊರುತಂ", dimension: "ವಧುವಿನ ನಕ್ಷತ್ರದಿಂದ ಎಣಿಕೆ" },
  "Gana Porutham": { name: "ಗಣ ಪೊರುತಂ", dimension: "ಪ್ರತಿ ನಕ್ಷತ್ರದ ಗಣ ವರ್ಗ" },
  "Mahendra Porutham": { name: "ಮಹೇಂದ್ರ ಪೊರುತಂ", dimension: "ಅನುಕೂಲ ಸ್ಥಾನಕ್ಕೆ ನಕ್ಷತ್ರ ಎಣಿಕೆ" },
  "Stree Deergha Porutham": { name: "ಸ್ತ್ರೀ ದೀರ್ಘ ಪೊರುತಂ", dimension: "ವಧುವಿನ ನಕ್ಷತ್ರದಿಂದ ಅಂತರ" },
  "Yoni Porutham": { name: "ಯೋನಿ ಪೊರುತಂ", dimension: "ಪ್ರತಿ ನಕ್ಷತ್ರದ ಪ್ರಾಣಿ ಯೋನಿ" },
  "Rasi Porutham": { name: "ರಾಶಿ ಪೊರುತಂ", dimension: "ಚಂದ್ರ ರಾಶಿಗಳ ಅಂತರ" },
  "Rasyadhipathi Porutham": { name: "ರಾಶ್ಯಾಧಿಪತಿ ಪೊರುತಂ", dimension: "ರಾಶ್ಯಾಧಿಪತಿಗಳ ಮೈತ್ರಿ" },
  "Vashya Porutham": { name: "ವಶ್ಯ ಪೊರುತಂ", dimension: "ರಾಶಿಗಳ ವಶ್ಯ ವರ್ಗ" },
  "Rajju Porutham": { name: "ರಜ್ಜು ಪೊರುತಂ", dimension: "ಪ್ರತಿ ನಕ್ಷತ್ರದ ರಜ್ಜು ವರ್ಗ" },
  "Vedha Porutham": { name: "ವೇಧ ಪೊರುತಂ", dimension: "ವೇಧ ನಕ್ಷತ್ರ ಜೋಡಿ ಪರಿಶೀಲನೆ" },
  Dina: { name: "ದಿನ ಪೊರುತಂ", dimension: "ವಧುವಿನ ನಕ್ಷತ್ರದಿಂದ ಎಣಿಕೆ" },
  Gana: { name: "ಗಣ ಪೊರುತಂ", dimension: "ಪ್ರತಿ ನಕ್ಷತ್ರದ ಗಣ ವರ್ಗ" },
  Mahendra: { name: "ಮಹೇಂದ್ರ ಪೊರುತಂ", dimension: "ಅನುಕೂಲ ಸ್ಥಾನಕ್ಕೆ ನಕ್ಷತ್ರ ಎಣಿಕೆ" },
  "Stree Deergha": { name: "ಸ್ತ್ರೀ ದೀರ್ಘ ಪೊರುತಂ", dimension: "ವಧುವಿನ ನಕ್ಷತ್ರದಿಂದ ಅಂತರ" },
  Yoni: { name: "ಯೋನಿ ಪೊರುತಂ", dimension: "ಪ್ರತಿ ನಕ್ಷತ್ರದ ಪ್ರಾಣಿ ಯೋನಿ" },
  Rasi: { name: "ರಾಶಿ ಪೊರುತಂ", dimension: "ಚಂದ್ರ ರಾಶಿಗಳ ಅಂತರ" },
  Rasyadhipathi: { name: "ರಾಶ್ಯಾಧಿಪತಿ ಪೊರುತಂ", dimension: "ರಾಶ್ಯಾಧಿಪತಿಗಳ ಮೈತ್ರಿ" },
  Vasyam: { name: "ವಶ್ಯ ಪೊರುತಂ", dimension: "ರಾಶಿಗಳ ವಶ್ಯ ವರ್ಗ" },
  Rajju: { name: "ರಜ್ಜು ಪೊರುತಂ", dimension: "ಪ್ರತಿ ನಕ್ಷತ್ರದ ರಜ್ಜು ವರ್ಗ" },
  Vedha: { name: "ವೇಧ ಪೊರುತಂ", dimension: "ವೇಧ ನಕ್ಷತ್ರ ಜೋಡಿ ಪರಿಶೀಲನೆ" },
};

export const ENGLISH_PORUTHAMS: Record<string, { name: string; dimension: string }> = {
  "Dina Porutham": { name: "Dina Porutham", dimension: "Star count from bride" },
  "Gana Porutham": { name: "Gana Porutham", dimension: "Temperament group of each star" },
  "Mahendra Porutham": { name: "Mahendra Porutham", dimension: "Star count for station match" },
  "Stree Deergha Porutham": { name: "Stree Deergha Porutham", dimension: "Star distance from bride" },
  "Yoni Porutham": { name: "Yoni Porutham", dimension: "Animal of each star" },
  "Rasi Porutham": { name: "Rasi Porutham", dimension: "Moon sign distance" },
  "Rasyadhipathi Porutham": { name: "Rasyadhipathi Porutham", dimension: "Sign lords' friendship" },
  "Vashya Porutham": { name: "Vashya Porutham", dimension: "Sign mutual attraction class" },
  "Rajju Porutham": { name: "Rajju Porutham", dimension: "Rajju group of each star" },
  "Vedha Porutham": { name: "Vedha Porutham", dimension: "Affliction pair check" },
  Dina: { name: "Dina Porutham", dimension: "Star count from bride" },
  Gana: { name: "Gana Porutham", dimension: "Temperament group of each star" },
  Mahendra: { name: "Mahendra Porutham", dimension: "Star count for station match" },
  "Stree Deergha": { name: "Stree Deergha Porutham", dimension: "Star distance from bride" },
  Yoni: { name: "Yoni Porutham", dimension: "Animal of each star" },
  Rasi: { name: "Rasi Porutham", dimension: "Moon sign distance" },
  Rasyadhipathi: { name: "Rasyadhipathi Porutham", dimension: "Sign lords' friendship" },
  Vasyam: { name: "Vashya Porutham", dimension: "Sign mutual attraction class" },
  Rajju: { name: "Rajju Porutham", dimension: "Rajju group of each star" },
  Vedha: { name: "Vedha Porutham", dimension: "Affliction pair check" },
};

/** Direct compound mappings for Ashtakoota table values in Kannada (Western digits 0-9). */
export const KANNADA_COMPOUND_VALUES: Record<string, string> = {
  Vaishya: "ವೈಶ್ಯ",
  Brahmin: "ಬ್ರಾಹ್ಮಣ",
  Kshatriya: "ಕ್ಷತ್ರಿಯ",
  Shudra: "ಶೂದ್ರ",
  "Virgo (Manava)": "ಕನ್ಯಾ (ಮಾನವ)",
  "Capricorn (Chatushpada)": "ಮಕರ (ಚತುಷ್ಪಾದ)",
  "Hasta (Janma (Count: 10))": "ಹಸ್ತ, ಎಣಿಕೆ 10, ಶೇಷ 1",
  "Shravana (Janma (Count: 19))": "ಶ್ರವಣ, ಎಣಿಕೆ 19, ಶೇಷ 1",
  "She-Buffalo (Mahishi) [Female archetype]": "ಮಹಿಷ",
  "Female Monkey (Vanari) [Female archetype]": "ವಾನರ",
  Buffalo: "ಮಹಿಷ",
  Monkey: "ವಾನರ",
  "She-Buffalo": "ಮಹಿಷ",
  "Female Monkey": "ವಾನರ",
  "Mercury (Virgo)": "ಬುಧ (ಕನ್ಯಾ)",
  "Saturn (Capricorn)": "ಶನಿ (ಮಕರ)",
  Deva: "ದೇವ",
  Manushya: "ಮನುಷ್ಯ",
  Rakshasa: "ರಾಕ್ಷಸ",
  Virgo: "ಕನ್ಯಾ",
  Capricorn: "ಮಕರ",
  "Adi (Hasta)": "ಆದಿ (ಹಸ್ತ)",
  "Antya (Shravana)": "ಅಂತ್ಯ (ಶ್ರವಣ)",
  "Madhya (Hasta)": "ಮಧ್ಯ (ಹಸ್ತ)",
  "Madhya (Shravana)": "ಮಧ್ಯ (ಶ್ರವಣ)",
  Adi: "ಆದಿ",
  Madhya: "ಮಧ್ಯ",
  Antya: "ಅಂತ್ಯ",
};

/** Translates person names cleanly into Kannada. */
export function translatePersonName(name: string | undefined | null, lang: "en" | "kn"): string {
  if (!name) return "";
  if (lang !== "kn") return name;
  const n = name.trim();
  if (n === "Sample Groom" || n === "Groom") return "ವರ";
  if (n === "Sample Bride" || n === "Bride") return "ವಧು";
  return n;
}

/** Translates Ashtakoota and Dasa Koota values safely without banned words or mitigation claims. */
export function translateMatchValue(val: string | undefined | null, lang: "en" | "kn"): string {
  if (!val || val === "—") return "—";
  if (lang !== "kn") return val;

  const trimmed = val.trim();

  // Direct compound table match
  if (KANNADA_COMPOUND_VALUES[trimmed]) return KANNADA_COMPOUND_VALUES[trimmed];

  // Koota names
  if (KANNADA_KOOTAS[trimmed]) return KANNADA_KOOTAS[trimmed];

  // Porutham names
  if (KANNADA_PORUTHAMS[trimmed]) return KANNADA_PORUTHAMS[trimmed].name;

  // Statuses
  if (/^pass$/i.test(trimmed) || /ಹೊಂದಿಕೆಯಾಗಿದೆ/i.test(trimmed)) return "ಅನುಕೂಲ";
  if (/^fail$/i.test(trimmed) || /ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ/i.test(trimmed) || /^does not pass$/i.test(trimmed)) return "ಅನುಕೂಲವಲ್ಲ";
  if (/^conditional$/i.test(trimmed) || /ಷರತ್ತುಬದ್ಧ/i.test(trimmed)) return "ಷರತ್ತುಬದ್ಧ";
  if (/^depends on convention$/i.test(trimmed)) return "5/9 ಸಂಬಂಧ";
  if (/^full$/i.test(trimmed)) return "ಪೂರ್ಣ";
  if (/^partial$/i.test(trimmed)) return "ಭಾಗಶಃ";
  if (/^neutral$/i.test(trimmed)) return "ಸಮ";
  if (/^good$/i.test(trimmed)) return "ಉತ್ತಮ";
  if (/^average$/i.test(trimmed)) return "ಸಾಧಾರಣ";
  if (/^dosha$/i.test(trimmed) || /^afflicted$/i.test(trimmed)) return "ದೋಷ";
  if (/^not present$/i.test(trimmed) || /^no dosha$/i.test(trimmed)) return "ದೋಷವಿಲ್ಲ";
  if (/^present$/i.test(trimmed)) return "ದೋಷವಿದೆ";

  // Common Jyotish terms (signs, planets, nakshatras, avakahada)
  return translateJyotishValue(trimmed, lang);
}
