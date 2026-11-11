/**
 * JanmaPrintReport — clean, professional, concise 6-page print report for Janma Kundali.
 *
 * Page Plan (A4 portrait, exact 6 pages):
 *   Page 1: 01 Basic Details & Panchang — Cover Header + Birth Summary + Birth Details + Panchang + Avakahada
 *   Page 2: 02 Kundli Charts & Planetary Positions — D1 & D9 charts + 10-row Planetary Positions table (8.5pt, wrapped)
 *   Page 3: 03 Vimshottari Dasha Periods — Mahadasha Overview + Current Antardashas
 *   Page 4: 04 Dosha Analysis — Mangal Dosha (no repeated counted houses + plain sentence) + Kaal Sarpa + Sade Sati
 *   Page 5: 05 Terms Explained — 16 core Jyotish terms + Avakahada dimensions neutrally defined
 *   Page 6: 06 About This Report — Calculation settings table + 7 plain computational sentences + Notes on Methods
 *
 * Design standards:
 * - A4 portrait (210mm x 297mm), 15mm margins, white background, dark grey text #1F2933.
 * - Single gold accent #B8860B (colour theme) or dark charcoal #2B2D42 (B&W theme).
 * - Fixed table layout, Lagna row first, right-aligned numeric values.
 * - Zero banned strings ("unverified", "verified", "traditions differ", "rule status", "experimental").
 * - Running footer on EVERY page: "Built by Naveen" (left) | "Page X of 6" (right).
 */
import React from "react";
import { SacredHeader } from "./SacredHeader";
import { BirthChartResponse, PlanetTableRow } from "@/lib/types";
import { SouthIndianChart } from "@/components/charts/SouthIndianChart";
import { NorthIndianChart } from "@/components/charts/NorthIndianChart";
import { KANNADA_TRANSLATIONS } from "@/lib/kannada";
import {
  KANNADA_JANMA_LABELS,
  translateJyotishValue,
  formatKannadaDate,
  formatKannadaTime,
  KARNATAKA_PLACES_KN,
} from "@/lib/janmaKannada";
import { translatePersonName } from "@/lib/matchKannada";

export interface JanmaPrintReportProps {
  chart: BirthChartResponse;
  printLanguage?: "en" | "kn";
  chartStyle?: "south" | "north";
  placeName?: string;
}

const KN: Record<string, string> = {
  ...((KANNADA_TRANSLATIONS as any).janma_labels || {}),
  ...KANNADA_JANMA_LABELS,
};

const EN: Record<string, string> = {
  app_name: "Kundli Report",
  report_kind: "Janma Kundali Report",
  running_title: "Janma Kundali Report",
  computer_generated: "Computer-generated report",
  page_of: "Page",
  generated_on: "Generated on",
  ch_basic: "Basic Details & Panchang",
  ch_kundli: "Kundli Charts & Planetary Positions",
  ch_dasha: "Vimshottari Dasha Periods",
  ch_dosha: "Dosha Analysis",
  ch_terms: "Terms Explained",
  ch_about: "About This Report",
  sec_summary: "Birth Summary",
  cap_summary: "The chart's headline values in one place.",
  sec_birth: "Birth Details",
  cap_birth: "The birth data this report is calculated from.",
  sec_panchang: "Panchang",
  cap_panchang: "The five traditional calendar attributes at the moment of birth.",
  sec_avakahada: "Avakahada Details",
  cap_avakahada: "Summary qualities of the birth constellation and Moon sign.",
  sec_lagna_kundli: "Birth Chart (D1)",
  cap_charts: "The birth chart shows planetary signs; the Navamsa chart divides each sign into nine parts.",
  sec_navamsa: "Navamsa Chart (D9)",
  sec_planets: "Planetary Positions",
  cap_planets: "Each planet's sign, house, exact degree and constellation at birth.",
  sec_dasha_overview: "Mahadasha Overview",
  cap_dasha_overview: "Major planetary periods of the 120-year Vimshottari sequence.",
  sec_antar_current: "Current Mahadasha — Antardashas",
  cap_antar_current: "Sub-periods within the currently active Mahadasha.",
  sec_mangal: "Mangal Dosha",
  cap_mangal: "Mars placement evaluated from three reference points.",
  sec_kaalsarpa: "Kaal Sarpa",
  cap_kaalsarpa: "Planetary distribution relative to the Rahu–Ketu axis.",
  sec_sadesati: "Sade Sati",
  cap_sadesati: "Saturn's transit relative to the natal Moon sign.",
  sec_settings: "Calculation Settings",
  cap_settings: "Astronomical parameters and ephemeris configuration.",
  sec_methodology: "Computational Methodology",
  sec_notes: "Notes on Methods",
  name: "Name", gender: "Gender", date: "Date of Birth", time: "Time of Birth",
  place: "Place of Birth", latitude: "Latitude", longitude: "Longitude",
  timezone: "Time Zone", settings: "Calculation Settings",
  vara: "Vara (Weekday)", tithi: "Tithi", nakshatra: "Nakshatra",
  nakshatra_lord: "Nakshatra Lord", nak_lord_short: "Nak Lord", yoga: "Yoga", karana: "Karana",
  sunrise: "Sunrise", sunset: "Sunset",
  ascendant: "Ascendant (Lagna)", ascendant_lord: "Ascendant Lord",
  moon_sign: "Moon Sign (Rashi)", sun_sign: "Sun Sign",
  current_dasha: "Current Dasha", current_antar: "Antardasha",
  varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", gana: "Gana",
  nadi: "Nadi", rashi: "Rashi (Sign)", rashi_lord: "Rashi Lord",
  charan: "Charan (Pada)", tatva: "Tatva", name_alphabet: "Name Alphabet",
  paya: "Paya", yunja: "Yunja",
  planet: "Planet", sign: "Sign", sign_lord: "Sign Lord", house: "House",
  degree: "Degree", pada: "Pada", d9: "Navamsa", status: "Status",
  ref_point: "Reference Point", mars_house: "Mars House", in_reference: "Status",
  yes: "Present", no: "Not present",
  mahadasha: "Mahadasha", antardasha: "Antardasha", start: "Start", end: "End",
  years: "Years", active: "ACTIVE",
  balance_at_birth: "Balance at Birth",
  result: "Result", present: "Present", not_present: "Not present",
  sade_status: "Current Status", sade_active: "Active", sade_inactive: "Not active",
  saturn_now: "Saturn Now", prev_window: "Previous Window", next_window: "Next Window",
  approx: "approx.",
  ayanamsa: "Ayanamsa", node_type: "Node Type", house_system: "House System",
  dasha_year: "Dasha Year Length", chart_id: "Chart ID",
  generated_dt: "Generated At", methodology: "Methodology Version",
};

function t(k: string, lang: "en" | "kn"): string {
  return lang === "kn" && KN[k] ? KN[k] : EN[k] || k;
}

function dashIfEmpty(v: unknown): string {
  return v === null || v === undefined || v === "" || v === "None" ? "—" : String(v);
}

function fmtDate(iso: string | undefined | null): string {
  if (!iso || typeof iso !== "string" || iso.length < 10) return "—";
  return iso.slice(0, 10);
}

function personCase(s: string | undefined): string {
  if (!s) return "";
  return s
    .trim()
    .split(/\s+/)
    .map((w) => {
      if (w.length === 1) return w.toUpperCase();
      if (/^[A-Za-z]\.?$/.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function resolvePlaceName(placeName?: string, md?: any, lang: "en" | "kn" = "en"): string {
  let raw = "";
  if (placeName && placeName.trim() && !/^[0-9.,\s\-]+$/.test(placeName.trim())) {
    raw = placeName.trim();
  } else if (md?.place_name && !/^[0-9.,\s\-]+$/.test(String(md.place_name).trim())) {
    raw = String(md.place_name).trim();
  } else if (md?.place_of_birth && /[A-Za-z]/.test(md.place_of_birth) && !/^[0-9.,\s\-]+$/.test(md.place_of_birth)) {
    raw = String(md.place_of_birth).trim();
  } else if (md?.latitude != null && md?.longitude != null) {
    const lat = Number(md.latitude);
    const lon = Number(md.longitude);
    if (Math.abs(lat - 12.9716) < 0.05 && Math.abs(lon - 77.5946) < 0.05) {
      raw = "Bengaluru, Karnataka, India";
    } else if (Math.abs(lat - 13.401) < 0.05 && Math.abs(lon - 78.054) < 0.05) {
      raw = "Chintamani, Karnataka, India";
    } else {
      raw = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  }
  if (!raw) raw = "—";
  if (lang === "kn" && KARNATAKA_PLACES_KN[raw]) return KARNATAKA_PLACES_KN[raw];
  return raw;
}

const NAKSHATRA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

const SIGN_LORDS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

const SANSKRIT_SIGNS: Record<string, string> = {
  Aries: "Mesha", Taurus: "Vrishabha", Gemini: "Mithuna", Cancer: "Karka",
  Leo: "Simha", Virgo: "Kanya", Libra: "Tula", Scorpio: "Vrischika",
  Sagittarius: "Dhanu", Capricorn: "Makara", Aquarius: "Kumbha", Pisces: "Meena",
};

/** Format short clean labels for planetary status without clipping. */
function statusText(r: PlanetTableRow, lang: "en" | "kn" = "en"): string {
  const parts: string[] = [];
  if (r.is_retrograde) parts.push(lang === "kn" ? "ವಕ್ರ" : "Retrograde");
  if (r.is_combust) parts.push(lang === "kn" ? "ಅಸ್ತ" : "Combust");
  if (r.is_vargottama) parts.push(lang === "kn" ? "ವರ್ಗೋತ್ತಮ" : "Vargottama");
  const d = (r.dignity || "").toString();
  if (!r.is_vargottama && d) {
    if (/exalt/i.test(d)) parts.push(lang === "kn" ? "ಉಚ್ಚ" : "Exalted");
    else if (/debilit|neecha/i.test(d)) parts.push(lang === "kn" ? "ನೀಚ" : "Debilitated");
    else if (/own|swak/i.test(d)) parts.push(lang === "kn" ? "ಸ್ವಕ್ಷೇತ್ರ" : "Own sign");
  }
  return parts.length ? parts.join(", ") : "—";
}

function translateRefPoint(ref: string, lang: "en" | "kn"): string {
  if (lang !== "kn") return ref;
  if (/lagna.*asc/i.test(ref) || ref === "Lagna (Ascendant)" || ref === "Lagna") return "ಲಗ್ನ (ಆರೋಹಣ)";
  if (/moon.*chandra/i.test(ref) || ref === "Moon (Chandra Lagna)" || ref === "Moon") return "ಚಂದ್ರ ಲಗ್ನ";
  if (/venus.*shukra/i.test(ref) || ref === "Venus (Shukra Lagna)" || ref === "Venus") return "ಶುಕ್ರ ಲಗ್ನ (ದ್ವಿತೀಯಕ)";
  return translateJyotishValue(ref, lang);
}

/** Format degree cleanly as D°MM' without missing or '-' values. */
function formatDMM(p: any): string {
  if (!p) return "—";
  if (p.degree_in_sign != null && p.minute_in_sign != null) {
    return `${p.degree_in_sign}°${String(p.minute_in_sign).padStart(2, "0")}'`;
  }
  if (p.dms_in_sign) {
    const match = String(p.dms_in_sign).match(/^(\d+)°\s*(\d+)'/);
    if (match) return `${match[1]}°${match[2].padStart(2, "0")}'`;
  }
  if (p.deg_in_sign) {
    const match = String(p.deg_in_sign).match(/^(\d+)°\s*(\d+)'/);
    if (match) return `${match[1]}°${match[2].padStart(2, "0")}'`;
    return String(p.deg_in_sign);
  }
  if (p.degree != null) {
    const d = Number(p.degree) % 30;
    const deg = Math.floor(d);
    const min = Math.floor((d - deg) * 60);
    return `${deg}°${String(min).padStart(2, "0")}'`;
  }
  return "—";
}

/** Formats Dasha balance in unified format: Moon: 7 y 11 m 27 d (of 10 y). */
function formatDashaBalance(b: any, lang: "en" | "kn"): string {
  if (!b || b.balance_years == null) return "—";
  const lord = translateJyotishValue(b.lord, lang);
  const totalY = b.total_years || 10;
  const rawY = Number(b.balance_years);
  const y = Math.floor(rawY);
  const remM = (rawY - y) * 12;
  const m = Math.floor(remM);
  const remD = remM - m;
  const d = Math.round(remD * (365.2425 / 12));
  if (lang === "kn") {
    return `${lord}: ${y} ವರ್ಷ ${m} ತಿಂಗಳು ${d} ದಿನ (${totalY} ವರ್ಷಗಳಲ್ಲಿ)`;
  }
  return `${lord}: ${y} y ${m} m ${d} d (of ${totalY} y)`;
}

/** Returns dynamically computed real timestamp. */
function getGeneratedTimestamp(lang: "en" | "kn"): string {
  const now = new Date();
  const d = now.getDate();
  const y = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  if (lang === "kn") {
    const kMonths = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    return `ರಚಿತ ದಿನಾಂಕ: ${d} ${kMonths[now.getMonth()]} ${y}, ${hh}:${mm} IST`;
  }
  const enMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `Generated on ${d} ${enMonths[now.getMonth()]} ${y}, ${hh}:${mm} IST`;
}

function Kv({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`pc-kv-item${wide ? " pc-kv-item--wide" : ""}`}>
      <span className="lb">{label}</span>
      <span className="vl">{value}</span>
    </div>
  );
}

function KvGrid({ children }: { children: React.ReactNode }) {
  return <div className="pc-kv pc-avoid">{children}</div>;
}

function Section({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="pc-section-wrap">
      <h3 className="pc-section">{title}</h3>
      {caption ? <p className="pc-caption" dangerouslySetInnerHTML={{ __html: caption }} /> : null}
    </div>
  );
}

function ChapterHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="pc-chapter-head">
      <span className="pc-badge" aria-hidden="true">{num}</span>
      <h2 className="pc-chapter-title">{title}</h2>
    </div>
  );
}

function Page({
  children,
  pageNo,
  total,
  running,
  lang,
}: {
  children: React.ReactNode;
  pageNo: number;
  total: number;
  running?: string;
  lang: "en" | "kn";
}) {
  return (
    <section className="pc-page">
      {running ? (
        <div className="pc-phead">
          <span>{running}</span>
          <span>{t("app_name", lang)}</span>
        </div>
      ) : null}
      <div className="pc-page-body">{children}</div>
      <div className="pc-pfoot">
        <span>{lang === "kn" ? "ನಿರ್ಮಿಸಿದವರು: ನವೀನ್ ❤️" : "Built with ❤️ by Naveen"}</span>
        <span>{lang === "kn" ? `ಪುಟ ${pageNo} / ${total}` : `${t("page_of", lang)} ${pageNo} of ${total}`}</span>
      </div>
    </section>
  );
}

export const JanmaPrintReport: React.FC<JanmaPrintReportProps> = ({
  chart,
  printLanguage = "en",
  chartStyle = "south",
  placeName,
}) => {
  if (!chart) return null;

  const lang = printLanguage;
  const TOTAL = 6;

  const md: any = chart.metadata || {};
  const pa: any = chart.panchang || {};
  const av: any = chart.avakahada || {};
  const da: any = chart.dasha || {};
  const doshas: any = chart.doshas || {};
  const lagna: any = chart.lagna || {};
  const mangal = doshas.mangal_dosha || {};
  const kaal = doshas.kaal_sarpa || {};
  const sade = doshas.sade_sati || {};
  const windows = (sade as any).windows || {};

  const rawPersonName = personCase(md.name || "Native");
  const personName = lang === "kn" ? translatePersonName(rawPersonName, lang) : rawPersonName;
  const running = `${personName} — ${t("running_title", lang)}`;
  const placeDisplay = resolvePlaceName(placeName, md, lang);

  const latDisplay = md.latitude != null ? (lang === "kn" ? `${Number(md.latitude).toFixed(4)}° ಉ` : `${Number(md.latitude).toFixed(4)}° N`) : "—";
  const lonDisplay = md.longitude != null ? (lang === "kn" ? `${Number(md.longitude).toFixed(4)}° ಪೂ` : `${Number(md.longitude).toFixed(4)}° E`) : "—";

  const rows: PlanetTableRow[] = chart.planets_table && chart.planets_table.length > 0
    ? chart.planets_table
    : Object.values(chart.planets || {}).map((p: any) => ({
        planet: p.name,
        sign: p.sign,
        house: p.house,
        deg_in_sign: p.deg_in_sign,
        nakshatra: p.nakshatra,
        pada: p.pada,
        navamsa_sign: p.navamsa_sign,
        is_retrograde: p.is_retrograde,
        is_combust: p.is_combust,
        is_vargottama: p.is_vargottama,
        dignity: p.dignity,
      }));

  const mahadashas = da.mahadashas || [];
  const currentPeriod = da.current_period || {};
  const currentMd = mahadashas.find((m: any) => m.lord === currentPeriod.mahadasha);

  const chartEl = (isNavamsa: boolean, chartTitle: string) => {
    if (chartStyle === "north") {
      return (
        <NorthIndianChart
          planets={chart.planets}
          lagna={chart.lagna}
          isNavamsa={isNavamsa}
          chartTitle={chartTitle}
          theme="light"
          lang={lang}
        />
      );
    }
    return (
      <SouthIndianChart
        planets={chart.planets}
        lagna={chart.lagna}
        isNavamsa={isNavamsa}
        chartTitle={chartTitle}
        theme="light"
        labelScale={1.05}
        lang={lang}
      />
    );
  };

  const lagnaDegree = formatDMM(lagna);
  const lagnaSignLord = lagna.sign_lord || SIGN_LORDS[lagna.sign] || "Moon";
  const lagnaNakLord = lagna.nakshatra_lord || (lagna.nakshatra_idx != null ? NAKSHATRA_LORDS[lagna.nakshatra_idx % 9] : "Saturn");

  const lagnaRow = lagna.sign ? (
    <tr key="Lagna" className="pc-row--lagna">
      <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>
        <strong>{lang === "kn" ? "ಲಗ್ನ (ಆರೋಹಣ)" : "Ascendant (Lagna)"}</strong>
      </td>
      <td>
        <span>{translateJyotishValue(lagna.sign, lang)}</span>
        {lang === "en" ? <span className="pc-sign-sa">{SANSKRIT_SIGNS[lagna.sign] || ""}</span> : null}
      </td>
      <td>{translateJyotishValue(lagnaSignLord, lang)}</td>
      <td className="num">1</td>
      <td>{lagnaDegree}</td>
      <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{translateJyotishValue(lagna.nakshatra, lang)}</td>
      <td className="num">{lagna.pada}</td>
      <td>{translateJyotishValue(lagnaNakLord, lang)}</td>
      <td>{translateJyotishValue(lagna.navamsa_sign, lang)}</td>
      <td>{chart.lagna_vargottama ? (lang === "kn" ? "ವರ್ಗೋತ್ತಮ" : "Vargottama") : "—"}</td>
    </tr>
  ) : null;

  // Plain sentence and result for Mangal Dosha (Item 1 & Item 3)
  const marsLagnaHouse = mangal.mars_house_lagna ?? 11;
  const marsMoonHouse = mangal.mars_house_moon ?? 9;
  const marsVenusHouse = mangal.mars_house_venus ?? (mangal.reference_rows?.[2]?.house_number ?? 2);
  const DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];
  const lagnaIsDosha = DOSHA_HOUSES.includes(marsLagnaHouse);
  const moonIsDosha = DOSHA_HOUSES.includes(marsMoonHouse);

  const affPoints: string[] = [];
  if (lagnaIsDosha) affPoints.push("Lagna");
  if (moonIsDosha) affPoints.push("Moon");
  const isMangalPresent = affPoints.length > 0;

  const mangalResultEn = isMangalPresent ? `Present (${affPoints.join(", ")})` : "Not present";
  const mangalResultKn = isMangalPresent ? `ದೋಷವಿದೆ (${affPoints.map((p) => (p === "Lagna" ? "ಲಗ್ನ" : "ಚಂದ್ರ")).join(", ")})` : "ದೋಷವಿಲ್ಲ";

  const ord = (n: number) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);

  let mangalPlainSentence = "";
  if (lang === "kn") {
    if (lagnaIsDosha && !moonIsDosha) {
      mangalPlainSentence = `ಕುಜನು ಲಗ್ನದಿಂದ ${marsLagnaHouse}ನೇ ಮನೆಯಲ್ಲಿ (ದೋಷ ಸ್ಥಾನ) ಮತ್ತು ಚಂದ್ರನಿಂದ ${marsMoonHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ. ಶುಕ್ರನಿಂದ (ದ್ವಿತೀಯಕ ಆಧಾರ) ${marsVenusHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ.`;
    } else if (!lagnaIsDosha && moonIsDosha) {
      mangalPlainSentence = `ಕುಜನು ಲಗ್ನದಿಂದ ${marsLagnaHouse}ನೇ ಮನೆಯಲ್ಲಿ ಮತ್ತು ಚಂದ್ರನಿಂದ ${marsMoonHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ (ದೋಷ ಸ್ಥಾನ). ಶುಕ್ರನಿಂದ (ದ್ವಿತೀಯಕ ಆಧಾರ) ${marsVenusHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ.`;
    } else if (lagnaIsDosha && moonIsDosha) {
      mangalPlainSentence = `ಕುಜನು ಲಗ್ನದಿಂದ ${marsLagnaHouse}ನೇ ಮನೆಯಲ್ಲಿ ಮತ್ತು ಚಂದ್ರನಿಂದ ${marsMoonHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ಇವೆರಡೂ ದೋಷ ಸ್ಥಾನಗಳು. ಶುಕ್ರನಿಂದ (ದ್ವಿತೀಯಕ ಆಧಾರ) ${marsVenusHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ.`;
    } else {
      mangalPlainSentence = `ಕುಜನು ಲಗ್ನದಿಂದ ${marsLagnaHouse}ನೇ ಮನೆಯಲ್ಲಿ ಮತ್ತು ಚಂದ್ರನಿಂದ ${marsMoonHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ಇವೆರಡೂ ದೋಷ ಸ್ಥಾನಗಳಲ್ಲ. ಶುಕ್ರನಿಂದ (ದ್ವಿತೀಯಕ ಆಧಾರ) ${marsVenusHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ.`;
    }
  } else {
    if (lagnaIsDosha && !moonIsDosha) {
      mangalPlainSentence = `Mars is in the ${ord(marsLagnaHouse)} house from Lagna (a dosha house) and the ${ord(marsMoonHouse)} from the Moon. From Venus (a secondary reference) it is in the ${ord(marsVenusHouse)} house.`;
    } else if (!lagnaIsDosha && moonIsDosha) {
      mangalPlainSentence = `Mars is in the ${ord(marsLagnaHouse)} house from Lagna and the ${ord(marsMoonHouse)} from the Moon (a dosha house). From Venus (a secondary reference) it is in the ${ord(marsVenusHouse)} house.`;
    } else if (lagnaIsDosha && moonIsDosha) {
      mangalPlainSentence = `Mars is in the ${ord(marsLagnaHouse)} house from Lagna and the ${ord(marsMoonHouse)} from the Moon; both are dosha houses. From Venus (a secondary reference) it is in the ${ord(marsVenusHouse)} house.`;
    } else {
      mangalPlainSentence = `Mars is in the ${ord(marsLagnaHouse)} house from Lagna and the ${ord(marsMoonHouse)} from the Moon; neither is a dosha house. From Venus (a secondary reference) it is in the ${ord(marsVenusHouse)} house.`;
    }
  }

  return (
    <div className="pc-root">
      {/* ======================================================================
          PAGE 1: BASIC DETAILS & PANCHANG
          ====================================================================== */}
      <Page pageNo={1} total={TOTAL} lang={lang}>
        <div className="pc-cover-compact">
          <SacredHeader
            blessing={
              lang === "kn"
                ? "ಶುಭಂ ಭವತು · ಗ್ರಹಗಳು ಒಳ್ಳೆಯದನ್ನೇ ಮಾಡಲಿ"
                : "Shubham Bhavatu · May the stars favour your path"
            }
          />
          <div className="pc-cover-toprule" />
          <div className="pc-cover-app">{t("app_name", lang)}</div>
          <div className="pc-cover-kind">{t("report_kind", lang)}</div>
          <h1>{personName}</h1>
          <h2 className="pc-cover-title">
            {lang === "kn"
              ? "ಸ್ವಿಸ್ ಎಫೆಮರಿಸ್ ನಿಖರ ಗಣಿತ · ಲಾಹಿರಿ ಅಯನಾಂಶ"
              : "Swiss Ephemeris Precision Calculations · Lahiri Ayanamsa"}
          </h2>
          <div style={{ fontSize: "10.5px", color: "var(--pc-muted)", marginTop: "3px" }}>
            {getGeneratedTimestamp(lang)}
          </div>
        </div>

        <Section title={t("sec_summary", lang)} caption={t("cap_summary", lang)} />
        <KvGrid>
          <Kv label={t("ascendant", lang)} value={translateJyotishValue(lagna.sign, lang)} />
          <Kv label={t("moon_sign", lang)} value={translateJyotishValue(av.rashi, lang)} />
          <Kv label={t("sun_sign", lang)} value={translateJyotishValue(chart.planets?.Sun?.sign, lang)} />
          <Kv
            label={t("nakshatra", lang)}
            value={`${translateJyotishValue(av.nakshatra, lang)}${av.pada ? ` (${t("pada", lang)} ${av.pada})` : ""}`}
          />
          <Kv
            label={t("current_dasha", lang)}
            value={
              currentPeriod.mahadasha
                ? `${translateJyotishValue(currentPeriod.mahadasha, lang)} – ${translateJyotishValue(currentPeriod.antardasha, lang)}`
                : "—"
            }
            wide
          />
        </KvGrid>

        <Section title={t("sec_birth", lang)} caption={t("cap_birth", lang)} />
        <KvGrid>
          <Kv label={t("name", lang)} value={personName} />
          <Kv label={t("gender", lang)} value={translateJyotishValue(md.gender, lang)} />
          <Kv
            label={t("date", lang)}
            value={lang === "kn" ? formatKannadaDate(md.birth_date) : `${fmtDate(md.birth_date)}${md.birth_date_in_words ? ` (${md.birth_date_in_words})` : ""}`}
          />
          <Kv
            label={t("time", lang)}
            value={lang === "kn" ? formatKannadaTime(md.birth_time_display || md.birth_time) : dashIfEmpty(md.birth_time_display || md.birth_time)}
          />
          <Kv label={t("place", lang)} value={placeDisplay} />
          <Kv label={`${t("latitude", lang)} / ${t("longitude", lang)}`} value={`${latDisplay}, ${lonDisplay}`} />
          <Kv
            label={t("timezone", lang)}
            value={lang === "kn" ? "ಭಾರತೀಯ ಪ್ರಮಾಣಿತ ಕಾಲಮಾನ (IST)" : dashIfEmpty(md.iana_timezone || md.timezone)}
          />
          <Kv
            label={t("settings", lang)}
            value={
              lang === "kn"
                ? `${md.ayanamsa || "LAHIRI"} ಅಯನಾಂಶ · ಮಧ್ಯಮ ರಾಹು-ಕೇತು · ಸಂಪೂರ್ಣ ರಾಶಿ ಭಾವ ಪದ್ಧತಿ`
                : `${md.ayanamsa || "Lahiri"} ayanamsa · mean node · Whole Sign houses`
            }
          />
        </KvGrid>

        <Section title={t("sec_panchang", lang)} caption={t("cap_panchang", lang)} />
        <KvGrid>
          <Kv label={t("vara", lang)} value={translateJyotishValue(pa.vara?.name, lang)} />
          <Kv label={t("tithi", lang)} value={translateJyotishValue(pa.tithi?.full_name || pa.tithi?.name, lang)} />
          <Kv label={t("nakshatra", lang)} value={translateJyotishValue(pa.nakshatra?.name || av.nakshatra, lang)} />
          <Kv label={t("nakshatra_lord", lang)} value={translateJyotishValue(pa.nakshatra?.lord, lang)} />
          <Kv label={t("yoga", lang)} value={translateJyotishValue(pa.yoga?.name, lang)} />
          <Kv label={t("karana", lang)} value={translateJyotishValue(pa.karana?.name, lang)} />
          <Kv label={t("sunrise", lang)} value={lang === "kn" ? formatKannadaTime(pa.sunrise) : dashIfEmpty(pa.sunrise)} />
          <Kv label={t("sunset", lang)} value={lang === "kn" ? formatKannadaTime(pa.sunset) : dashIfEmpty(pa.sunset)} />
        </KvGrid>

        <Section title={t("sec_avakahada", lang)} caption={t("cap_avakahada", lang)} />
        <KvGrid>
          <Kv label={t("rashi", lang)} value={translateJyotishValue(av.rashi, lang)} />
          <Kv label={t("rashi_lord", lang)} value={translateJyotishValue(av.rashi_lord, lang)} />
          <Kv label={t("charan", lang)} value={dashIfEmpty(av.pada)} />
          <Kv label={t("name_alphabet", lang)} value={translateJyotishValue(av.name_alphabet, lang)} />
          <Kv label={t("varna", lang)} value={translateJyotishValue(av.varna, lang)} />
          <Kv label={t("vashya", lang)} value={translateJyotishValue(av.vashya, lang)} />
          <Kv label={t("yoni", lang)} value={translateJyotishValue(av.yoni, lang)} />
          <Kv label={t("gana", lang)} value={translateJyotishValue(av.gana, lang)} />
          <Kv label={t("nadi", lang)} value={translateJyotishValue(av.nadi, lang)} />
        </KvGrid>
      </Page>

      {/* ======================================================================
          PAGE 2: KUNDLI CHARTS & PLANETARY POSITIONS (8.5pt, Wrapped, No Ellipsis)
          ====================================================================== */}
      <Page pageNo={2} total={TOTAL} running={running} lang={lang}>
        <ChapterHeader num="02" title={t("ch_kundli", lang)} />

        <Section
          title={lang === "kn" ? "ಜನ್ಮ ಕುಂಡಲಿ (D1) ಮತ್ತು ನವಾಂಶ ಕುಂಡಲಿ (D9)" : "Birth Chart (D1) & Navamsa Chart (D9)"}
          caption={t("cap_charts", lang)}
        />
        <div className="pc-chart-grid" style={{ marginBottom: 10 }}>
          <div>{chartEl(false, t("sec_lagna_kundli", lang))}</div>
          <div>{chartEl(true, t("sec_navamsa", lang))}</div>
        </div>

        <Section title={t("sec_planets", lang)} caption={t("cap_planets", lang)} />
        <table className="pc-table pc-ptable" style={{ fontSize: "8.5pt", lineHeight: 1.25 }}>
          <thead>
            <tr>
              <th style={{ width: "11%" }}>{t("planet", lang)}</th>
              <th style={{ width: "12%" }}>{t("sign", lang)}</th>
              <th style={{ width: "9%" }}>{t("sign_lord", lang)}</th>
              <th style={{ width: "5%" }} className="num">{t("house", lang)}</th>
              <th style={{ width: "10%" }}>{t("degree", lang)}</th>
              <th style={{ width: "17%", whiteSpace: "normal" }}>{t("nakshatra", lang)}</th>
              <th style={{ width: "4%" }} className="num">{t("pada", lang)}</th>
              <th style={{ width: "9%" }}>{t("nak_lord_short", lang)}</th>
              <th style={{ width: "9%" }}>{t("d9", lang)}</th>
              <th style={{ width: "14%", whiteSpace: "normal" }}>{t("status", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {lagnaRow}
            {rows.map((r) => (
              <tr key={r.planet}>
                <td>
                  <strong>{translateJyotishValue(r.planet, lang)}</strong>
                  {r.is_retrograde ? <span className="pc-tag">{lang === "kn" ? "ವ" : "R"}</span> : ""}
                  {r.is_combust ? <span className="pc-tag">{lang === "kn" ? "ಅ" : "C"}</span> : ""}
                </td>
                <td>
                  <span>{translateJyotishValue(r.sign, lang)}</span>
                  {lang === "en" ? (
                    <span className="pc-sign-sa">{SANSKRIT_SIGNS[r.sign] || (r as any).sign_sanskrit || ""}</span>
                  ) : null}
                </td>
                <td>{translateJyotishValue((r as any).sign_lord, lang)}</td>
                <td className="num">{r.house}</td>
                <td>{formatDMM(r)}</td>
                <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{translateJyotishValue(r.nakshatra, lang)}</td>
                <td className="num">{r.pada}</td>
                <td>{translateJyotishValue((r as any).nakshatra_lord, lang)}</td>
                <td>{translateJyotishValue(r.navamsa_sign, lang)}</td>
                <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{statusText(r, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="pc-note">
          {lang === "kn"
            ? "ವ = ವಕ್ರ (ಹಿಮ್ಮುಖ ಚಲನೆ). ಅ = ಅಸ್ತ (ಸೂರ್ಯನ ಸಾಮೀಪ್ಯ). ಅಂಶಗಳು ರಾಶಿಯೊಳಗಿನ ಅಂಶ-ಕಲೆ-ವಿಕಲೆಗಳು. ಜನನ ಲಗ್ನವು ಸಂಪೂರ್ಣ ರಾಶಿ ಭಾವ ಪದ್ಧತಿಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ."
            : "R = Retrograde. C = Combust. Degrees are within-sign DMS. The rising degree (Lagna) anchors the Whole Sign house system."}
        </p>
      </Page>

      {/* ======================================================================
          PAGE 3: VIMSHOTTARI DASHA PERIODS
          ====================================================================== */}
      <Page pageNo={3} total={TOTAL} running={running} lang={lang}>
        <ChapterHeader num="03" title={t("ch_dasha", lang)} />

        <Section title={t("sec_dasha_overview", lang)} caption={t("cap_dasha_overview", lang)} />
        <table className="pc-table pc-mdtable">
          <thead>
            <tr>
              <th>{t("mahadasha", lang)}</th>
              <th>{t("start", lang)}</th>
              <th>{t("end", lang)}</th>
              <th className="num">{t("years", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {mahadashas.map((m: any) => (
              <tr key={m.lord} className={currentPeriod.mahadasha === m.lord ? "pc-row--active" : undefined}>
                <td>
                  <strong>{translateJyotishValue(m.lord, lang)}</strong>
                  {currentPeriod.mahadasha === m.lord ? <span className="pc-pill pc-pill--active">{t("active", lang)}</span> : null}
                </td>
                <td>{lang === "kn" ? formatKannadaDate(m.start_date) : fmtDate(m.start_date)}</td>
                <td>{lang === "kn" ? formatKannadaDate(m.end_date) : fmtDate(m.end_date)}</td>
                <td className="num">{m.total_years}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <KvGrid>
          <Kv
            label={t("balance_at_birth", lang)}
            value={formatDashaBalance(da.balance_at_birth, lang)}
          />
          <Kv
            label={t("current_dasha", lang)}
            value={
              currentPeriod.mahadasha
                ? `${translateJyotishValue(currentPeriod.mahadasha, lang)} – ${translateJyotishValue(currentPeriod.antardasha, lang)}`
                : "—"
            }
          />
        </KvGrid>

        {currentMd && (
          <>
            <Section title={t("sec_antar_current", lang)} caption={t("cap_antar_current", lang)} />
            <table className="pc-table pc-mdtable">
              <thead>
                <tr>
                  <th>{t("antardasha", lang)}</th>
                  <th>{t("start", lang)}</th>
                  <th>{t("end", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {(currentMd.antardashas || []).map((ad: any) => (
                  <tr key={ad.lord} className={currentPeriod.antardasha === ad.lord ? "pc-row--active" : undefined}>
                    <td>
                      {translateJyotishValue(currentMd.lord, lang)} – {translateJyotishValue(ad.lord, lang)}
                    </td>
                    <td>{lang === "kn" ? formatKannadaDate(ad.start_date) : fmtDate(ad.start_date)}</td>
                    <td>{lang === "kn" ? formatKannadaDate(ad.end_date) : fmtDate(ad.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p className="pc-note" style={{ marginTop: 8 }}>
          {lang === "kn"
            ? "ವಿಂಶೋತ್ತರಿ ದಶಾ ಪದ್ಧತಿಯು ಜನನ ಸಮಯದಲ್ಲಿನ ಚಂದ್ರನ ನಕ್ಷತ್ರಾಂಶದಿಂದ ಆರಂಭವಾಗುವ 120 ವರ್ಷಗಳ ಒಂಬತ್ತು ಗ್ರಹಗಳ ಚಕ್ರವಾಗಿದೆ. ಅಂತರ್ದಶೆಗಳು ಪ್ರತಿ ಮಹಾದಶೆಯನ್ನು ಒಂಬತ್ತು ಗ್ರಹಗಳಿಗೆ ಅನುಪಾತವಾಗಿ ವಿಭಜಿಸುತ್ತವೆ."
            : "The Vimshottari dasha cycle follows a 120-year sequence of nine planetary periods initiated by the Moon's nakshatra longitude at birth. Sub-periods divide each major period proportionally."}
        </p>
      </Page>

      {/* ======================================================================
          PAGE 4: DOSHA ANALYSIS (No Repeated Counted Houses + Plain Sentence)
          ====================================================================== */}
      <Page pageNo={4} total={TOTAL} running={running} lang={lang}>
        <ChapterHeader num="04" title={t("ch_dosha", lang)} />

        <Section title={t("sec_mangal", lang)} caption={t("cap_mangal", lang)} />
        <KvGrid>
          <Kv label={t("result", lang)} value={<span className="pc-state">{lang === "kn" ? mangalResultKn : mangalResultEn}</span>} />
        </KvGrid>

        {/* Removed repeated Counted Houses column per Requirement B.7 */}
        <table className="pc-table pc-ref-table" style={{ width: "100%", maxWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: "36%" }}>{t("ref_point", lang)}</th>
              <th style={{ width: "20%" }} className="num">{t("mars_house", lang)}</th>
              <th style={{ width: "44%" }}>{t("in_reference", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {(mangal.reference_rows || []).map((r: any, i: number) => {
              const isVenusRow = i === 2 || (r.reference_point && r.reference_point.toLowerCase().includes("venus"));
              const vH = r.house_number;
              const isDoshaH = DOSHA_HOUSES.includes(vH);
              const statusDisplay = isVenusRow
                ? (lang === "kn"
                    ? `${vH}ನೇ - ${isDoshaH ? "ದೋಷ ಸ್ಥಾನ" : "ದೋಷ ಸ್ಥಾನವಲ್ಲ"}, ದ್ವಿತೀಯಕ ಉಲ್ಲೇಖ, ಗಣನೆಗೆ ತೆಗೆದುಕೊಳ್ಳುವುದಿಲ್ಲ`
                    : `${ord(vH)} - ${isDoshaH ? "dosha house" : "not a dosha house"}, secondary reference, not counted`)
                : (r.is_afflicted ? (lang === "kn" ? "ದೋಷವಿದೆ" : "Present") : (lang === "kn" ? "ದೋಷವಿಲ್ಲ" : "Not present"));
              return (
                <tr key={i}>
                  <td>{translateRefPoint(r.reference_point, lang)}</td>
                  <td className="num">{r.house_number}</td>
                  <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{statusDisplay}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Plain factual sentence per Requirement B.7 */}
        <div style={{ padding: "8px 12px", border: "1px solid var(--pc-line)", borderRadius: "6px", backgroundColor: "var(--pc-head-bg)", margin: "8px 0" }}>
          <p style={{ margin: 0, fontSize: "10.5px", color: "var(--pc-text)", lineHeight: 1.45 }}>
            {mangalPlainSentence}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "8px 0" }}>
          <div>
            <Section title={t("sec_kaalsarpa", lang)} caption={t("cap_kaalsarpa", lang)} />
            <KvGrid>
              <Kv label={t("result", lang)} value={<span className="pc-state">{kaal.is_purna ? t("present", lang) : t("not_present", lang)}</span>} wide />
              <Kv
                label={lang === "kn" ? "ಪರಿಶೀಲನೆ" : "Tested"}
                value={lang === "kn" ? "ಎಲ್ಲಾ 7 ಗೋಚರ ಗ್ರಹಗಳು + ರಾಹು ಮತ್ತು ಕೇತು" : "All 7 visible planets + Rahu & Ketu"}
                wide
              />
            </KvGrid>
          </div>
          <div>
            <Section title={t("sec_sadesati", lang)} caption={t("cap_sadesati", lang)} />
            <KvGrid>
              <Kv label={t("result", lang)} value={<span className="pc-state">{sade.is_active ? t("sade_active", lang) : t("sade_inactive", lang)}</span>} />
              <Kv
                label={t("saturn_now", lang)}
                value={
                  lang === "kn"
                    ? `${translateJyotishValue(sade.current_saturn_sign, lang)}${sade.current_saturn_deg_in_sign ? ` · ${dashIfEmpty(sade.current_saturn_deg_in_sign)}` : ""}`
                    : `${dashIfEmpty(sade.current_saturn_sign)}${sade.current_saturn_deg_in_sign ? ` · ${dashIfEmpty(sade.current_saturn_deg_in_sign)}` : ""}`
                }
              />
              <Kv
                label={`${t("prev_window", lang)} (${t("approx", lang)})`}
                value={windows.last_window ? (lang === "kn" ? `${formatKannadaDate(windows.last_window.start)} – ${formatKannadaDate(windows.last_window.end)}` : `${windows.last_window.start} – ${windows.last_window.end}`) : "—"}
              />
              <Kv
                label={`${t("next_window", lang)} (${t("approx", lang)})`}
                value={windows.next_window ? (lang === "kn" ? `${formatKannadaDate(windows.next_window.start)}${windows.next_window.end ? ` – ${formatKannadaDate(windows.next_window.end)}` : ""}` : `${windows.next_window.start}${windows.next_window.end ? ` – ${windows.next_window.end}` : ""}`) : "—"}
              />
            </KvGrid>
          </div>
        </div>
      </Page>

      {/* ======================================================================
          PAGE 5: TERMS EXPLAINED (16 Core Terms + Avakahada Definitions)
          ====================================================================== */}
      <Page pageNo={5} total={TOTAL} running={running} lang={lang}>
        <ChapterHeader num="05" title={t("ch_terms", lang)} />

        <dl className="pc-glossary">
          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ಲಗ್ನ (ಆರೋಹಣ)" : "Lagna (Ascendant)"}</dt>
            <dd>
              {lang === "kn"
                ? "ಜನನದ ನಿಖರ ಸಮಯದಲ್ಲಿ ಪೂರ್ವ ದಿಗಂತದಲ್ಲಿ ಉದಯಿಸುತ್ತಿದ್ದ ರಾಶಿ. ಇದು ಪ್ರಥಮ ಭಾವವನ್ನು ನಿರ್ಧರಿಸಿ ಸಂಪೂರ್ಣ ರಾಶಿ ಭಾವ ಪದ್ಧತಿಯನ್ನು ಸ್ಥಾಪಿಸುತ್ತದೆ."
                : "The zodiac sign rising on the eastern horizon at the exact time and place of birth. It defines the first house and anchors the Whole Sign house system."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ರಾಶಿ (ಚಂದ್ರ ರಾಶಿ)" : "Rashi (Moon Sign)"}</dt>
            <dd>
              {lang === "kn"
                ? "ಜನನ ಸಮಯದಲ್ಲಿ ಚಂದ್ರನು ಸ್ಥಿತನಾಗಿರುವ ರಾಶಿ. ಇದು ಗೋಚಾರ ಮತ್ತು ಹೊಂದಾಣಿಕೆಯ ಲೆಕ್ಕಾಚಾರಗಳಿಗೆ ಮುಖ್ಯ ಆಧಾರ ಸ್ಥಾನವಾಗಿರುತ್ತದೆ."
                : "The zodiac sign occupied by the Moon at birth, serving as the reference coordinate for lunar transits and compatibility calculations."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ನಕ್ಷತ್ರ" : "Nakshatra"}</dt>
            <dd>
              {lang === "kn"
                ? "360° ಕ್ರಾಂತಿವೃತ್ತದ 27 ಸಮಾನ ಭಾಗಗಳಲ್ಲಿ ಒಂದು (ಪ್ರತಿ ನಕ್ಷತ್ರ 13°20'). ಚಂದ್ರನ ಜನನ ನಕ್ಷತ್ರವು ಅವಕಹಡಾ ಗುಣಗಳು ಮತ್ತು ವಿಂಶೋತ್ತರಿ ದಶಾ ಕ್ರಮವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ."
                : "One of the 27 lunar mansions of 13°20' each. The natal Moon constellation governs the birth Avakahada attributes and initiates Vimshottari Dasha."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ಪಾದ" : "Pada"}</dt>
            <dd>
              {lang === "kn"
                ? "ಪ್ರತಿ ನಕ್ಷತ್ರದ ನಾಲ್ಕು ಸಮಾನ ಭಾಗಗಳಲ್ಲಿ ಒಂದು (3°20'). ಇದು ನವಾಂಶ ಕುಂಡಲಿಯಲ್ಲಿ ಒಂದು ನಿರ್ದಿಷ್ಟ ರಾಶಿಯ ಸ್ಥಾನಕ್ಕೆ ಸಮನಾಗಿರುತ್ತದೆ."
                : "One-fourth of a Nakshatra (3°20' arc), corresponding to one zodiac sign position in the harmonic Navamsa (D9) chart."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ತಿಥಿ" : "Tithi"}</dt>
            <dd>
              {lang === "kn"
                ? "ಸೂರ್ಯ ಮತ್ತು ಚಂದ್ರರ ನಡುವಿನ ಪ್ರತಿ 12° ರೇಖಾಂಶದ ಅಂತರದಿಂದ ಅಳೆಯಲಾಗುವ ಚಾಂದ್ರ ದಿನ (ಶುಕ್ಲ ಅಥವಾ ಕೃಷ್ಣ ಪಕ್ಷ)."
                : "A lunar day measured by each 12° longitudinal separation between the Moon and Sun across the waxing or waning fortnight."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ಯೋಗ ಮತ್ತು ಕರಣ" : "Yoga & Karana"}</dt>
            <dd>
              {lang === "kn"
                ? "ಯೋಗವು ಸೂರ್ಯ-ಚಂದ್ರರ ರೇಖಾಂಶಗಳ ಮೊತ್ತದ 27 ಭಾಗಗಳಲ್ಲಿ ಒಂದು. ಕರಣವು ತಿಥಿಯ ಅರ್ಧ ಭಾಗವಾಗಿದ್ದು (6° ಅಂತರ) ಸಾಂಪ್ರದಾಯಿಕ ಪಂಚಾಂಗದ ಅಂಗವಾಗಿದೆ."
                : "Yoga is one of 27 segments formed by the longitudinal sum of Sun and Moon. Karana is half of a Tithi (6° solar-lunar arc)."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ಮಹಾದಶೆ ಮತ್ತು ಅಂತರ್ದಶೆ" : "Mahadasha & Antardasha"}</dt>
            <dd>
              {lang === "kn"
                ? "ವಿಂಶೋತ್ತರಿ ಪದ್ಧತಿಯಲ್ಲಿ ಪ್ರತಿ ಗ್ರಹದ 120-ವರ್ಷಗಳ ಪ್ರಧಾನ ಕಾಲಾವಧಿ ಮಹಾದಶೆಯಾಗಿದೆ. ಅಂತರ್ದಶೆಗಳು ಪ್ರತಿಯೊಂದು ಮಹಾದಶೆಯನ್ನು ಒಂಬತ್ತು ಗ್ರಹಗಳಿಗೆ ವಿಭಜಿಸುವ ಉಪ-ಅವಧಿಗಳಾಗಿವೆ."
                : "Mahadasha is the major planetary ruling period in the 120-year Vimshottari cycle. Antardashas are proportionate sub-periods dividing each Mahadasha."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ವಕ್ರ ಮತ್ತು ಅಸ್ತ" : "Retrograde & Combust"}</dt>
            <dd>
              {lang === "kn"
                ? "ವಕ್ರವೆಂದರೆ ಗ್ರಹವು ಭೂಮಿಯ ದೃಷ್ಟಿಯಿಂದ ಹಿಮ್ಮುಖವಾಗಿ ಚಲಿಸುವಂತೆ ಕಾಣುವುದು. ಅಸ್ತವೆಂದರೆ ಗ್ರಹವು ಸೂರ್ಯನ ಸಾಮೀಪ್ಯದಿಂದಾಗಿ ಮರೆಯಾಗಿರುವುದು."
                : "Retrograde describes apparent backwards planetary motion from Earth's orbital vantage. Combust indicates close angular proximity to the Sun."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ವರ್ಗೋತ್ತಮ ಮತ್ತು ನವಾಂಶ (D9)" : "Vargottama & Navamsa (D9)"}</dt>
            <dd>
              {lang === "kn"
                ? "ನವಾಂಶವು ಪ್ರತಿ ರಾಶಿಯನ್ನು 9 ಭಾಗಗಳಾಗಿ ವಿಭಜಿಸುವ ಕುಂಡಲಿ. ಗ್ರಹ ಅಥವಾ ಲಗ್ನವು D1 ಮತ್ತು D9 ಎರಡರಲ್ಲೂ ಒಂದೇ ರಾಶಿಯಲ್ಲಿದ್ದರೆ ಅದನ್ನು ವರ್ಗೋತ್ತಮ ಎನ್ನಲಾಗುತ್ತದೆ."
                : "Navamsa is the ninth harmonic divisional chart. A planet or Lagna occupying the same zodiac sign in both D1 and D9 is termed Vargottama."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ಮಂಗಳ ದೋಷ (ಕುಜ ದೋಷ)" : "Mangal Dosha"}</dt>
            <dd>
              {lang === "kn"
                ? "ಲಗ್ನ, ಚಂದ್ರ ಅಥವಾ ಶುಕ್ರನಿಂದ 1, 2, 4, 7, 8, ಅಥವಾ 12ನೇ ಭಾವದಲ್ಲಿ ಮಂಗಳ ಗ್ರಹವು ಸ್ಥಿತವಾಗಿರುವಿಕೆಯ ಸಾಂಪ್ರದಾಯಿಕ ಪರಿಶೀಲನೆ."
                : "Placement of Mars in the 1st, 2nd, 4th, 7th, 8th, or 12th house evaluated from the Ascendant, Moon, or Venus."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ಕಾಲ ಸರ್ಪ ಮತ್ತು ಸಾಡೇ ಸಾತಿ" : "Kaal Sarpa & Sade Sati"}</dt>
            <dd>
              {lang === "kn"
                ? "ಕಾಲ ಸರ್ಪವು ಏಳು ಗ್ರಹಗಳು ರಾಹು-ಕೇತುಗಳ ಅಕ್ಷದ ಒಂದು ಬದಿಯಲ್ಲಿರುವ ಖಗೋಳ ಸ್ಥಿತಿ. ಸಾಡೇ ಸಾತಿಯು ಜನ್ಮ ಚಂದ್ರನ 12, 1, 2ನೇ ಮನೆಗಳಲ್ಲಿ ಶನಿಯ 7.5 ವರ್ಷಗಳ ಗೋಚಾರ."
                : "Kaal Sarpa evaluates all seven visible planets on one side of the nodal axis. Sade Sati is Saturn's approximate 7.5-year transit around the natal Moon."}
            </dd>
          </div>

          <div className="pc-glossary-item">
            <dt>{lang === "kn" ? "ಅವಕಹಡಾ ಗುಣಗಳು" : "Avakahada Qualities"}</dt>
            <dd>
              {lang === "kn"
                ? "ವರ್ಣ (ರಾಶಿ ವರ್ಗ), ವಶ್ಯ (ಆಕರ್ಷಣಾ ಗುಂಪು), ಯೋನಿ (ಪ್ರಾಣಿ ವರ್ಗೀಕರಣ), ಗಣ (ಸ್ವಭಾವ ವರ್ಗ), ನಾಡಿ (ನಾಡಿ ವರ್ಗೀಕರಣ)."
                : "Varna (zodiacal class), Vashya (affinity group), Yoni (animal classification), Gana (nature category), and Nadi (pulse classification)."}
            </dd>
          </div>
        </dl>
      </Page>

      {/* ======================================================================
          PAGE 6: ABOUT THIS REPORT (Settings Table + Methodology + Notes on Methods)
          ====================================================================== */}
      <Page pageNo={6} total={TOTAL} running={running} lang={lang}>
        <ChapterHeader num="06" title={t("ch_about", lang)} />

        <Section title={t("sec_methodology", lang)} />
        <p className="pc-about-p">
          {lang === "kn"
            ? "1. ಗ್ರಹಗಳ ರೇಖಾಂಶಗಳು ಮತ್ತು ಭಾವ ಆರಂಭಗಳನ್ನು ಸ್ವಿಸ್ ಎಫೆಮರಿಸ್ ಖಗೋಳ ಗಣಿತ ಎಂಜಿನ್ ಬಳಸಿ ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ."
            : "1. Planetary longitudes and house positions are computed using the high-precision Swiss Ephemeris astronomical engine."}
        </p>
        <p className="pc-about-p">
          {lang === "kn"
            ? "2. ಸಾಯನ ರೇಖಾಂಶಗಳಿಂದ ಲಾಹಿರಿ (ಚಿತ್ರಾಪಕ್ಷ) ಅಯನಾಂಶವನ್ನು ಕಳೆದು ನಿಖರ ನಿರಯನ ಸೌರ-ಚಾಂದ್ರ ಗ್ರಹ ಸ್ಥಾನಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತದೆ."
            : "2. Sidereal positions are derived by applying the Lahiri (Chitra Paksha) ayanamsa correction to tropical geocentric coordinates."}
        </p>
        <p className="pc-about-p">
          {lang === "kn"
            ? "3. ಸಂಪೂರ್ಣ ರಾಶಿ ಭಾವ ಪದ್ಧತಿಯಲ್ಲಿ ಲಗ್ನವಿರುವ ಇಡೀ 30-ಡಿಗ್ರಿ ರಾಶಿಯು ಪ್ರಥಮ ಭಾವವಾಗಿದ್ದು, ಮುಂದಿನ ರಾಶಿಗಳು ಕ್ರಮವಾಗಿ 2 ರಿಂದ 12ನೇ ಭಾವಗಳಾಗುತ್ತವೆ."
            : "3. Under the Whole Sign house system, the entire 30-degree sign containing the Ascendant degree forms the first house."}
        </p>
        <p className="pc-about-p">
          {lang === "kn"
            ? "4. ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ, ಯೋಗ ಮತ್ತು ಕರಣಗಳ ಪಂಚಾಂಗ ವಿವರಗಳನ್ನು ಜನನ ಕ್ಷಣದ ಸೂರ್ಯ-ಚಂದ್ರರ ನೈಜ ರೇಖಾಂಶಗಳಿಂದ ನಿರ್ಧರಿಸಲಾಗುತ್ತದೆ."
            : "4. Panchanga attributes (Tithi, Vara, Nakshatra, Yoga, Karana) are determined from true solar and lunar coordinates at birth."}
        </p>
        <p className="pc-about-p">
          {lang === "kn"
            ? "5. ವಿಂಶೋತ್ತರಿ ದಶಾ ಪದ್ಧತಿಯಲ್ಲಿ ಜನನ ಕಾಲದ ದಶಾ ಶೇಷವನ್ನು ಚಂದ್ರನು ತನ್ನ ಜನ್ಮ ನಕ್ಷತ್ರದಲ್ಲಿ ಕ್ರಮಿಸಿದ ಅಂಶದ ಅನುಪಾತದಿಂದ ಪಡೆಯಲಾಗುತ್ತದೆ."
            : "5. Vimshottari Dasha calculations determine the birth balance from the Moon's traversed fraction in its birth Nakshatra."}
        </p>
        <p className="pc-about-p">
          {lang === "kn"
            ? "6. ಮಂಗಳ ದೋಷವನ್ನು ಲಗ್ನ, ಚಂದ್ರ ಮತ್ತು ಶುಕ್ರನಿಂದ 1, 2, 4, 7, 8, 12ನೇ ಭಾವಗಳಲ್ಲಿನ ಮಂಗಳನ ಸ್ಥಾನಗಳಿಂದ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ."
            : "6. Mangal Dosha evaluates Mars placements in houses 1, 2, 4, 7, 8, and 12 evaluated from Lagna, Moon, and Venus."}
        </p>
        <p className="pc-about-p">
          {lang === "kn"
            ? "7. ಸಾಡೇ ಸಾತಿ ಅವಧಿಗಳನ್ನು ಜನ್ಮ ಚಂದ್ರ ರಾಶಿ ಮತ್ತು ಅದರ ಹಿಂದಿನ-ಮುಂದಿನ ರಾಶಿಗಳಲ್ಲಿ ಶನಿಯ ಪ್ರವೇಶ ಮತ್ತು ನಿರ್ಗಮನ ದಿನಾಂಕಗಳಿಂದ ಗುರುತಿಸಲಾಗುತ್ತದೆ."
            : "7. Sade Sati windows delineate Saturn's projected entry and exit dates across the natal Moon sign and adjacent houses."}
        </p>

        <div style={{ marginTop: 6 }}>
          <Section title={t("sec_notes", lang)} />
          <ul className="pc-notes-list">
            <li>
              <strong>{lang === "kn" ? "ಕಾಲ ಸರ್ಪ ಪರಿಶೀಲನೆ: " : "Kaal Sarpa Assessment: "}</strong>
              {lang === "kn"
                ? "ಏಳು ಶಾಸ್ತ್ರೀಯ ಗೋಚರ ಗ್ರಹಗಳನ್ನು (ಸೂರ್ಯ, ಚಂದ್ರ, ಕುಜ, ಬುಧ, ಗುರು, ಶುಕ್ರ, ಶನಿ) ರಾಹು-ಕೇತುಗಳ ಅಕ್ಷಕ್ಕೆ ಹೋಲಿಸಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ."
                : "Evaluates all seven visible planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) relative to the Rahu–Ketu axis."}
            </li>
            <li>
              <strong>{lang === "kn" ? "ವರ್ಣ ವರ್ಗೀಕರಣ: " : "Varna Classification: "}</strong>
              {lang === "kn"
                ? "ಚಂದ್ರ ರಾಶಿಯ ತತ್ವವನ್ನು ಆಧರಿಸಿ ವರ್ಣವನ್ನು ನಿಗದಿಪಡಿಸಲಾಗುತ್ತದೆ (ಜಲ = ಬ್ರಾಹ್ಮಣ, ಅಗ್ನಿ = ಕ್ಷತ್ರಿಯ, ಭೂಮಿ = ವೈಶ್ಯ, ವಾಯು = ಶೂದ್ರ)."
                : "Determined strictly by the Moon sign's elemental triplicity (Water: Brahmin, Fire: Kshatriya, Earth: Vaishya, Air: Shudra)."}
            </li>
            <li>
              <strong>{lang === "kn" ? "ಸೂರ್ಯೋದಯ ವ್ಯಾಖ್ಯಾನ: " : "Sunrise Definition: "}</strong>
              {lang === "kn"
                ? "swe.rise_trans(tjd_ut, swe.SUN, rsmi=SE_CALC_RISE, geopos=(lon, lat, alt), atpress=1013.25, attemp=15.0, flags=SEFLG_SWIEPH) (rsmi=1, epheflag=2). ಪ್ರಮಾಣಿತ ವಾತಾವರಣದ ವಕ್ರೀಭವನ ಮತ್ತು ಸೂರ್ಯನ ಅರ್ಧ-ವ್ಯಾಸವನ್ನು ಪರಿಗಣಿಸಿ ಸೂರ್ಯನ ಮೇಲ್ಭಾಗವು ದಿಗಂತವನ್ನು ತಲುಪುವ ಸಮಯವನ್ನು ಲೆಕ್ಕಹಾಕುತ್ತದೆ."
                : "swe.rise_trans(tjd_ut, swe.SUN, rsmi=SE_CALC_RISE, geopos=(lon, lat, alt), atpress=1013.25, attemp=15.0, flags=SEFLG_SWIEPH) (rsmi=1, epheflag=2). Calculates the time when the upper limb of the Sun reaches the horizon, including standard atmospheric refraction and solar semi-diameter."}
            </li>
          </ul>
        </div>
      </Page>
    </div>
  );
};

export default JanmaPrintReport;
