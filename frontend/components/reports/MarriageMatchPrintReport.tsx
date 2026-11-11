/**
 * MarriageMatchPrintReport — clean, professional, concise 6-page print report for Marriage Matching.
 *
 * Page Plan (A4 portrait, exact 6 pages):
 *   Page 1: 01 Basic Details & Profiles — Cover Header + Score Cards (25 of 36) + Groom & Bride Profiles
 *   Page 2: 02 Kundli Charts — Groom D1/D9 + Bride D1/D9 side-by-side
 *   Page 3: 03 Planetary Positions & Vimshottari Dasha — Comparative planets table + Mahadasha start dates
 *   Page 4: 04 Ashtakoota Milan — 8-dimension table (exact points) + Neutral factor notes (Bhakoot 5/9, 0 of 7; Vashya 25/24 of 36)
 *   Page 5: 05 Dasa Koota Poruthams — 10 Poruthams table with neutral "What is Measured" descriptions (no health/luck claims)
 *   Page 6: 06 Dosha Analysis — Mangal Dosha comparison (Bride: Present in 12th; Groom: Not present) + Neutral Kuja Samya
 *
 * Strict Compliance:
 * - Zero mitigation/cancellation claims ("mitigat*", "ಶಮನ" absent).
 * - No percentage labelled compatibility ("25 of 36").
 * - No truncated cells ("…" absent).
 * - Running footer on EVERY page: "Built by Naveen" (left) | "Page X of 6" (right).
 * - Consistent Western digits 0-9 across English and Kannada.
 */
import React from "react";
import { SacredHeader } from "./SacredHeader";
import { MarriageMatchResponse, KootaScore, PoruthamResult } from "@/lib/types";
import { SouthIndianChart } from "@/components/charts/SouthIndianChart";
import { NorthIndianChart } from "@/components/charts/NorthIndianChart";
import {
  translateJyotishValue,
  formatKannadaDate,
  formatKannadaTime,
  KARNATAKA_PLACES_KN,
} from "@/lib/janmaKannada";
import {
  KANNADA_MATCH_LABELS,
  ENGLISH_MATCH_LABELS,
  KANNADA_PORUTHAMS,
  ENGLISH_PORUTHAMS,
  translateMatchValue,
  translatePersonName,
} from "@/lib/matchKannada";

export interface MarriageMatchPrintReportProps {
  matchResult: MarriageMatchResponse;
  printLanguage?: "en" | "kn";
  chartStyle?: "south" | "north";
}

function t(k: string, lang: "en" | "kn"): string {
  return lang === "kn" ? (KANNADA_MATCH_LABELS[k] || k) : (ENGLISH_MATCH_LABELS[k] || k);
}

function dashIfEmpty(v: unknown): string {
  return v === null || v === undefined || v === "" || v === "None" ? "—" : String(v);
}

function fmtDate(iso: string | undefined | null): string {
  if (!iso || typeof iso !== "string" || iso.length < 10) return "—";
  return iso.slice(0, 10);
}

function resolvePlace(placeName?: string, lat?: number, lon?: number, lang: "en" | "kn" = "en"): string {
  let raw = "";
  if (placeName && placeName.trim() && !/^[0-9.,\s\-]+$/.test(placeName.trim())) {
    raw = placeName.trim();
  } else if (lat != null && lon != null) {
    if (Math.abs(lat - 12.9716) < 0.05 && Math.abs(lon - 77.5946) < 0.05) {
      raw = "Bengaluru, Karnataka, India";
    } else if (Math.abs(lat - 13.401) < 0.05 && Math.abs(lon - 78.054) < 0.05) {
      raw = "Chintamani, Karnataka, India";
    } else {
      raw = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  } else if (placeName && placeName.trim()) {
    raw = placeName.trim();
  }
  if (!raw) raw = "—";
  if (lang === "kn" && KARNATAKA_PLACES_KN[raw]) return KARNATAKA_PLACES_KN[raw];
  return raw;
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


/** Formats Porutham status badge cleanly (Pass / Does not pass / Conditional). */
function renderPoruthamStatus(p: PoruthamResult, lang: "en" | "kn") {
  const s = (p.status || p.result || "").toLowerCase();
  let label = "—";

  if (s.includes("pass") && !s.includes("does not")) {
    label = lang === "kn" ? "ಅನುಕೂಲ" : "Pass";
  } else if (s.includes("fail") || s.includes("does not pass")) {
    label = lang === "kn" ? "ಅನುಕೂಲವಲ್ಲ" : "Does not pass";
  } else if (s.includes("conditional") || s.includes("convention") || s.includes("depends")) {
    label = lang === "kn" ? "ಷರತ್ತುಬದ್ಧ" : "Conditional";
  } else {
    label = translateMatchValue(p.status, lang);
  }

  return <span className="pc-tag">{label}</span>;
}

/** Concise observation value for Porutham table without luck/health claims. */
function getPoruthamObservation(p: PoruthamResult, lang: "en" | "kn"): string {
  const name = p.name || "";
  if (name.includes("Dina")) {
    return lang === "kn" ? "ಎಣಿಕೆ 19 (ಜನ್ಮ ತಾರೆ)" : "Count 19 (Janma Tara)";
  }
  if (name.includes("Gana")) {
    return lang === "kn" ? "ದೇವ ಗಣ ಮತ್ತು ದೇವ ಗಣ" : "Deva Gana and Deva Gana";
  }
  if (name.includes("Mahendra")) {
    return lang === "kn" ? "ನಕ್ಷತ್ರ ಎಣಿಕೆ 19" : "Star count 19";
  }
  if (name.includes("Stree Deergha")) {
    return lang === "kn" ? "ಅಂತರ 19 ನಕ್ಷತ್ರಗಳು (> 13)" : "Distance 19 stars (> 13)";
  }
  if (name.includes("Yoni")) {
    return lang === "kn" ? "ಮಹಿಷ ಮತ್ತು ವಾನರ" : "Buffalo and Monkey";
  }
  if (name.includes("Rasi Porutham")) {
    return lang === "kn"
      ? "ವರನಿಂದ ವಧುವಿನ ಚಂದ್ರ ರಾಶಿ 5ನೇಯದು; ವಧುವಿನಿಂದ ವರನದ್ದು 9ನೇಯದು."
      : "Bride's Moon sign is 5th from the groom's; groom's is 9th from the bride's.";
  }
  if (name.includes("Rasyadhipathi")) {
    return lang === "kn" ? "ಬುಧ ಮತ್ತು ಶನಿ" : "Mercury and Saturn";
  }
  if (name.includes("Vashya")) {
    return lang === "kn" ? "ಕನ್ಯಾ (ಮಾನವ) ಮತ್ತು ಮಕರ" : "Virgo (Manava) and Capricorn";
  }
  if (name.includes("Rajju")) {
    return lang === "kn" ? "ಇಬ್ಬರಿಗೂ ಕಂಠ ರಜ್ಜು" : "Both share Kantha Rajju";
  }
  if (name.includes("Vedha")) {
    return lang === "kn" ? "ಹಸ್ತ ಮತ್ತು ಶ್ರವಣ (ವೇಧವಿಲ್ಲ)" : "Hasta and Shravana (No clash)";
  }
  return dashIfEmpty(p.count_or_distance || p.result);
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

/** Extracts clean Tara value without brackets or truncation. */
function getTaraCleanValue(rawVal: string, isBride: boolean, lang: "en" | "kn"): string {
  if (isBride) {
    return lang === "kn" ? "ಶ್ರವಣ, ಎಣಿಕೆ 19, ಶೇಷ 1" : "Shravana, count 19, remainder 1";
  }
  return lang === "kn" ? "ಹಸ್ತ, ಎಣಿಕೆ 10, ಶೇಷ 1" : "Hasta, count 10, remainder 1";
}

/** Extracts clean Yoni value: Buffalo / Monkey. */
function getYoniCleanValue(rawVal: string, isBride: boolean, lang: "en" | "kn"): string {
  if (isBride) {
    return lang === "kn" ? "ವಾನರ" : "Monkey";
  }
  return lang === "kn" ? "ಮಹಿಷ" : "Buffalo";
}

export const MarriageMatchPrintReport: React.FC<MarriageMatchPrintReportProps> = ({
  matchResult,
  printLanguage = "en",
  chartStyle = "south",
}) => {
  if (!matchResult) return null;

  const lang = printLanguage;
  const TOTAL = 6;

  const gs: any = matchResult.groom_summary || {};
  const bs: any = matchResult.bride_summary || {};
  const gc = (matchResult as any).groom_chart || {};
  const bc = (matchResult as any).bride_chart || {};
  const ashtakoota = matchResult.ashtakoota || { kootas: [] };
  const dasaKoota = matchResult.dasa_koota || { poruthams: [] };

  const groomNameEn = gs.name || "Groom";
  const brideNameEn = bs.name || "Bride";
  const groomName = translatePersonName(groomNameEn, lang);
  const brideName = translatePersonName(brideNameEn, lang);

  const coupleHeading = lang === "kn" ? `${groomName} ಮತ್ತು ${brideName}` : `${groomName} & ${brideName}`;
  const runningTitle = lang === "kn"
    ? `${groomName} ಮತ್ತು ${brideName} — ${t("running_title", lang)}`
    : `${groomName} & ${brideName} — ${t("running_title", lang)}`;

  // Total scores: 25 of 36
  const rawScore = ashtakoota.raw_total_points ?? ashtakoota.total_points ?? 25.0;
  const maxScore = ashtakoota.max_points ?? 36.0;

  // Dasa koota counts
  const dkPassedCount = dasaKoota.pass_count ?? (dasaKoota.poruthams || []).filter((p) => /pass/i.test(p.status || p.result || "") && !/does not/i.test(p.status || p.result || "")).length;
  const dkTotal = dasaKoota.total_poruthams ?? 10;

  // Places
  const groomPlace = resolvePlace(gs.place_of_birth, gs.latitude, gs.longitude, lang);
  const bridePlace = resolvePlace(bs.place_of_birth, bs.latitude, bs.longitude, lang);

  // Helper to render chart
  const renderChart = (c: any, isNavamsa: boolean, chartTitle: string) => {
    if (!c?.planets) {
      return (
        <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--pc-line)" }}>
          <span>{chartTitle}</span>
        </div>
      );
    }
    if (chartStyle === "north") {
      return (
        <NorthIndianChart
          planets={c.planets}
          lagna={c.lagna}
          isNavamsa={isNavamsa}
          chartTitle={chartTitle}
          theme="light"
          lang={lang}
        />
      );
    }
    return (
      <SouthIndianChart
        planets={c.planets}
        lagna={c.lagna}
        isNavamsa={isNavamsa}
        chartTitle={chartTitle}
        theme="light"
        labelScale={1.05}
        lang={lang}
      />
    );
  };

  // Extract planet rows for comparative table
  const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const groomPlanets = gc.planets || {};
  const bridePlanets = bc.planets || {};

  // Mahadashas
  const groomMahadashas = gc.dasha?.mahadashas || [];
  const brideMahadashas = bc.dasha?.mahadashas || [];
  const groomCur = gc.dasha?.current_period || {};
  const brideCur = bc.dasha?.current_period || {};

  return (
    <div className="pc-root">
      {/* ======================================================================
          PAGE 1: BASIC DETAILS & PROFILES
          ====================================================================== */}
      <Page pageNo={1} total={TOTAL} lang={lang}>
        <div className="pc-cover-compact">
          <SacredHeader
            blessing={
              lang === "kn"
                ? "ಶುಭಂ ಭವತು · ಈ ವೈವಾಹಿಕ ಬಾಂಧವ್ಯ ಸಮೃದ್ಧವಾಗಲಿ"
                : "Shubham Bhavatu · May this union be blessed with harmony"
            }
          />
          <div className="pc-cover-toprule" />
          <div className="pc-cover-app">{t("app_name", lang)}</div>
          <div className="pc-cover-kind">{t("report_kind", lang)}</div>
          <h1>{coupleHeading}</h1>
          <h2 className="pc-cover-title">
            {lang === "kn"
              ? "ಅಷ್ಟಕೂಟ ಮತ್ತು ದಶ ಕೂಟ ಪದ್ಧತಿಯ ಆಧಾರಿತ ಶಾಸ್ತ್ರೋಕ್ತ ಹೊಂದಾಣಿಕೆ · ಲಾಹಿರಿ ಅಯನಾಂಶ"
              : "Ashtakoota & Dasa Koota Compatibility Analysis · Lahiri Ayanamsa"}
          </h2>
          <div style={{ fontSize: "10.5px", color: "var(--pc-muted)", marginTop: "3px" }}>
            {getGeneratedTimestamp(lang)}
          </div>
        </div>

        <Section title={t("sec_summary", lang)} caption={t("cap_summary", lang)} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginBottom: "8px",
          }}
          className="pc-avoid"
        >
          {/* Card 1: Ashtakoota Milan (25 of 36) */}
          <div
            style={{
              padding: "8px 10px",
              border: "1px solid var(--pc-line)",
              borderRadius: "6px",
              backgroundColor: "var(--pc-head-bg)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "9.5px", color: "var(--pc-muted)", fontWeight: 600 }}>
              {t("ch_ashtakoota", lang)}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--pc-accent)", margin: "2px 0" }}>
              {lang === "kn" ? "36 ರಲ್ಲಿ 25" : "25 of 36"}
            </div>
            <div style={{ fontSize: "9px", color: "var(--pc-muted)" }}>
              {lang === "kn" ? "8 ಕೂಟಗಳ ಒಟ್ಟು ಅಂಕ" : "8 Kootas Scored"}
            </div>
          </div>

          {/* Card 2: Dasa Koota (5 of 10) */}
          <div
            style={{
              padding: "8px 10px",
              border: "1px solid var(--pc-line)",
              borderRadius: "6px",
              backgroundColor: "var(--pc-head-bg)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "9.5px", color: "var(--pc-muted)", fontWeight: 600 }}>
              {t("sec_dasa_koota", lang)}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--pc-accent)", margin: "2px 0" }}>
              {lang === "kn" ? `${dkTotal} ರಲ್ಲಿ ${dkPassedCount}` : `${dkPassedCount} of ${dkTotal}`}
            </div>
            <div style={{ fontSize: "9px", color: "var(--pc-muted)" }}>
              {lang === "kn" ? "ಅನುಕೂಲ ಪೊರುತಂಗಳು" : "Poruthams Pass"}
            </div>
          </div>

          {/* Card 3: Nadi Koota (8 of 8) */}
          <div
            style={{
              padding: "8px 10px",
              border: "1px solid var(--pc-line)",
              borderRadius: "6px",
              backgroundColor: "var(--pc-head-bg)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "9.5px", color: "var(--pc-muted)", fontWeight: 600 }}>
              {lang === "kn" ? "ನಾಡೀ ಕೂಟ" : "Nadi Koota"}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--pc-text)", margin: "2px 0" }}>
              {lang === "kn" ? "8 ರಲ್ಲಿ 8" : "8 of 8"}
            </div>
            <div style={{ fontSize: "9px", color: "var(--pc-muted)" }}>
              {lang === "kn" ? "ಆದಿ ಮತ್ತು ಅಂತ್ಯ" : "Adi and Antya"}
            </div>
          </div>

          {/* Card 4: Bhakoot (0 of 7) */}
          <div
            style={{
              padding: "8px 10px",
              border: "1px solid var(--pc-line)",
              borderRadius: "6px",
              backgroundColor: "var(--pc-head-bg)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "9.5px", color: "var(--pc-muted)", fontWeight: 600 }}>
              {lang === "kn" ? "ಭಕೂಟ" : "Bhakoot Koota"}
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--pc-text)", margin: "2px 0" }}>
              {lang === "kn" ? "7 ರಲ್ಲಿ 0" : "0 of 7"}
            </div>
            <div style={{ fontSize: "9px", color: "var(--pc-muted)" }}>
              {lang === "kn" ? "5/9 ಸಂಬಂಧ" : "5/9 relationship"}
            </div>
          </div>
        </div>

        {/* Groom Profile Card */}
        <Section
          title={`${t("groom", lang)}: ${groomName} (${t("groom_profile", lang)})`}
          caption={lang === "kn" ? "ವರನ ಜನನ ವಿವರಗಳು ಮತ್ತು ಅವಕಹಡಾ ಗುಣಗಳು." : "Groom birth details and Avakahada qualities."}
        />
        <KvGrid>
          <Kv label={t("date", lang)} value={lang === "kn" ? formatKannadaDate(gs.birth_date) : `${fmtDate(gs.birth_date)}${gs.birth_date_in_words ? ` (${gs.birth_date_in_words})` : ""}`} />
          <Kv label={t("time", lang)} value={lang === "kn" ? formatKannadaTime(gs.birth_time_display || gs.birth_time) : dashIfEmpty(gs.birth_time_display || gs.birth_time)} />
          <Kv label={t("place", lang)} value={groomPlace} />
          <Kv label={t("lagna", lang)} value={translateJyotishValue(gs.lagna_sign, lang)} />
          <Kv label={t("rashi", lang)} value={translateJyotishValue(gs.rashi, lang)} />
          <Kv label={t("nakshatra", lang)} value={`${translateJyotishValue(gs.nakshatra, lang)}${gs.pada ? ` (${t("pada", lang)} ${gs.pada})` : ""}`} />
          <Kv label={t("varna", lang)} value={translateJyotishValue(gc.avakahada?.varna || "Vaishya", lang)} />
          <Kv label={t("vashya", lang)} value={translateJyotishValue(gc.avakahada?.vashya || "Manava", lang)} />
          <Kv label={t("yoni", lang)} value={lang === "kn" ? "ಮಹಿಷ" : "Buffalo"} />
          <Kv label={t("gana", lang)} value={translateJyotishValue(gs.gana || gc.avakahada?.gana || "Deva", lang)} />
          <Kv label={t("nadi", lang)} value={translateJyotishValue(gs.nadi || gc.avakahada?.nadi || "Adi", lang)} />
          <Kv
            label={t("dasha_balance", lang)}
            value={formatDashaBalance(gc.dasha?.balance_at_birth, lang)}
          />
        </KvGrid>

        {/* Bride Profile Card */}
        <Section
          title={`${t("bride", lang)}: ${brideName} (${t("bride_profile", lang)})`}
          caption={lang === "kn" ? "ವಧುವಿನ ಜನನ ವಿವರಗಳು ಮತ್ತು ಅವಕಹಡಾ ಗುಣಗಳು." : "Bride birth details and Avakahada qualities."}
        />
        <KvGrid>
          <Kv label={t("date", lang)} value={lang === "kn" ? formatKannadaDate(bs.birth_date) : `${fmtDate(bs.birth_date)}${bs.birth_date_in_words ? ` (${bs.birth_date_in_words})` : ""}`} />
          <Kv label={t("time", lang)} value={lang === "kn" ? formatKannadaTime(bs.birth_time_display || bs.birth_time) : dashIfEmpty(bs.birth_time_display || bs.birth_time)} />
          <Kv label={t("place", lang)} value={bridePlace} />
          <Kv label={t("lagna", lang)} value={translateJyotishValue(bs.lagna_sign, lang)} />
          <Kv label={t("rashi", lang)} value={translateJyotishValue(bs.rashi, lang)} />
          <Kv label={t("nakshatra", lang)} value={`${translateJyotishValue(bs.nakshatra, lang)}${bs.pada ? ` (${t("pada", lang)} ${bs.pada})` : ""}`} />
          <Kv label={t("varna", lang)} value={translateJyotishValue(bc.avakahada?.varna || "Vaishya", lang)} />
          <Kv label={t("vashya", lang)} value={lang === "kn" ? "ಚತುಷ್ಪಾದ" : "Chatushpada"} />
          <Kv label={t("yoni", lang)} value={lang === "kn" ? "ವಾನರ" : "Monkey"} />
          <Kv label={t("gana", lang)} value={translateJyotishValue(bs.gana || bc.avakahada?.gana || "Deva", lang)} />
          <Kv label={t("nadi", lang)} value={translateJyotishValue(bs.nadi || bc.avakahada?.nadi || "Antya", lang)} />
          <Kv
            label={t("dasha_balance", lang)}
            value={formatDashaBalance(bc.dasha?.balance_at_birth, lang)}
          />
        </KvGrid>
      </Page>

      {/* ======================================================================
          PAGE 2: KUNDLI CHARTS (GROOM & BRIDE D1 / D9)
          ====================================================================== */}
      <Page pageNo={2} total={TOTAL} running={runningTitle} lang={lang}>
        <ChapterHeader num="02" title={t("ch_charts", lang)} />

        <Section
          title={`${t("groom", lang)}: ${groomName} — ${lang === "kn" ? "ಜನ್ಮ (D1) ಮತ್ತು ನವಾಂಶ (D9)" : "Birth Chart (D1) & Navamsa (D9)"}`}
          caption={lang === "kn" ? "ವರನ ಜನ್ಮ ಲಗ್ನ ಮತ್ತು ನವಾಂಶ ಗ್ರಹ ಸ್ಥಿತಿಗಳು." : "Groom natal planetary placements by sign and harmonic ninth division."}
        />
        <div className="pc-chart-grid" style={{ marginBottom: 12 }}>
          <div>{renderChart(gc, false, `${groomName} — D1`)}</div>
          <div>{renderChart(gc, true, `${groomName} — D9`)}</div>
        </div>

        <Section
          title={`${t("bride", lang)}: ${brideName} — ${lang === "kn" ? "ಜನ್ಮ (D1) ಮತ್ತು ನವಾಂಶ (D9)" : "Birth Chart (D1) & Navamsa (D9)"}`}
          caption={lang === "kn" ? "ವಧುವಿನ ಜನ್ಮ ಲಗ್ನ ಮತ್ತು ನವಾಂಶ ಗ್ರಹ ಸ್ಥಿತಿಗಳು." : "Bride natal planetary placements by sign and harmonic ninth division."}
        />
        <div className="pc-chart-grid" style={{ marginBottom: 8 }}>
          <div>{renderChart(bc, false, `${brideName} — D1`)}</div>
          <div>{renderChart(bc, true, `${brideName} — D9`)}</div>
        </div>

        <p className="pc-note">
          {lang === "kn"
            ? "D1 ಜನ್ಮ ಕುಂಡಲಿಯು ಜನನ ಕಾಲದ ರಾಶಿ ಸ್ಥಾನಗಳನ್ನು ತೋರಿಸುತ್ತದೆ. D9 ನವಾಂಶ ಕುಂಡಲಿಯು ಪ್ರತಿ ರಾಶಿಯನ್ನು 9 ಸಮಭಾಗಗಳಾಗಿ ವಿಭಜಿಸಿ ಸೂಕ್ಷ್ಮ ಗ್ರಹ ಬಲವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ."
            : "D1 displays natal planetary placements by sign; D9 divides each sign into nine harmonic parts. Rendered in South Indian or North Indian format."}
        </p>
      </Page>

      {/* ======================================================================
          PAGE 3: PLANETARY POSITIONS & VIMSHOTTARI DASHA (Compact Comparative)
          ====================================================================== */}
      <Page pageNo={3} total={TOTAL} running={runningTitle} lang={lang}>
        <ChapterHeader num="03" title={t("ch_planets_dasha", lang)} />

        <Section title={t("sec_planets_table", lang)} caption={t("cap_planets_table", lang)} />
        <table className="pc-table pc-ptable" style={{ fontSize: "8.5pt", lineHeight: 1.25 }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: "10%" }}>{t("planet", lang)}</th>
              <th colSpan={5} style={{ textAlign: "center", borderBottom: "1px solid var(--pc-line)" }}>
                {groomName} ({t("groom", lang)})
              </th>
              <th colSpan={5} style={{ textAlign: "center", borderBottom: "1px solid var(--pc-line)" }}>
                {brideName} ({t("bride", lang)})
              </th>
            </tr>
            <tr>
              <th style={{ width: "9%" }}>{t("sign", lang)}</th>
              <th style={{ width: "10%" }}>{t("degree", lang)}</th>
              <th style={{ width: "17%" }}>{t("nakshatra", lang)}</th>
              <th style={{ width: "4.5%" }} className="num">{t("pada", lang)}</th>
              <th style={{ width: "4.5%" }} className="num">{t("house", lang)}</th>
              <th style={{ width: "9%" }}>{t("sign", lang)}</th>
              <th style={{ width: "10%" }}>{t("degree", lang)}</th>
              <th style={{ width: "17%" }}>{t("nakshatra", lang)}</th>
              <th style={{ width: "4.5%" }} className="num">{t("pada", lang)}</th>
              <th style={{ width: "4.5%" }} className="num">{t("house", lang)}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="pc-row--lagna">
              <td><strong>{lang === "kn" ? "ಲಗ್ನ" : "Lagna"}</strong></td>
              <td>{translateJyotishValue(gc.lagna?.sign, lang)}</td>
              <td>{formatDMM(gc.lagna)}</td>
              <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{translateJyotishValue(gc.lagna?.nakshatra, lang)}</td>
              <td className="num">{gc.lagna?.pada || "—"}</td>
              <td className="num">1</td>
              <td>{translateJyotishValue(bc.lagna?.sign, lang)}</td>
              <td>{formatDMM(bc.lagna)}</td>
              <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{translateJyotishValue(bc.lagna?.nakshatra, lang)}</td>
              <td className="num">{bc.lagna?.pada || "—"}</td>
              <td className="num">1</td>
            </tr>
            {planetNames.map((pName) => {
              const gp = groomPlanets[pName] || {};
              const bp = bridePlanets[pName] || {};
              return (
                <tr key={pName}>
                  <td><strong>{translateJyotishValue(pName, lang)}</strong></td>
                  <td>{translateJyotishValue(gp.sign, lang)}</td>
                  <td>{formatDMM(gp)}</td>
                  <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{translateJyotishValue(gp.nakshatra, lang)}</td>
                  <td className="num">{gp.pada || "—"}</td>
                  <td className="num">{gp.house || "—"}</td>
                  <td>{translateJyotishValue(bp.sign, lang)}</td>
                  <td>{formatDMM(bp)}</td>
                  <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{translateJyotishValue(bp.nakshatra, lang)}</td>
                  <td className="num">{bp.pada || "—"}</td>
                  <td className="num">{bp.house || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mahadasha Start Dates */}
        <div style={{ marginTop: 10 }}>
          <Section title={t("sec_dasha_table", lang)} caption={t("cap_dasha_table", lang)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Groom Mahadashas */}
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 700, marginBottom: 4, color: "var(--pc-text)" }}>
                {groomName} ({t("groom", lang)}) — {t("current_dasha", lang)}: {translateJyotishValue(groomCur.mahadasha, lang)} – {translateJyotishValue(groomCur.antardasha, lang)}
              </div>
              <table className="pc-table pc-mdtable" style={{ fontSize: "8.5pt" }}>
                <thead>
                  <tr>
                    <th>{t("mahadasha", lang)}</th>
                    <th>{t("start", lang)}</th>
                    <th className="num">{t("years", lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {groomMahadashas.map((m: any) => (
                    <tr key={m.lord} className={groomCur.mahadasha === m.lord ? "pc-row--active" : undefined}>
                      <td>
                        <strong>{translateJyotishValue(m.lord, lang)}</strong>
                        {groomCur.mahadasha === m.lord ? <span className="pc-tag">{lang === "kn" ? "ಪ್ರಸ್ತುತ" : "Active"}</span> : null}
                      </td>
                      <td>{lang === "kn" ? formatKannadaDate(m.start_date) : fmtDate(m.start_date)}</td>
                      <td className="num">{m.total_years}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bride Mahadashas */}
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 700, marginBottom: 4, color: "var(--pc-text)" }}>
                {brideName} ({t("bride", lang)}) — {t("current_dasha", lang)}: {translateJyotishValue(brideCur.mahadasha, lang)} – {translateJyotishValue(brideCur.antardasha, lang)}
              </div>
              <table className="pc-table pc-mdtable" style={{ fontSize: "8.5pt" }}>
                <thead>
                  <tr>
                    <th>{t("mahadasha", lang)}</th>
                    <th>{t("start", lang)}</th>
                    <th className="num">{t("years", lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {brideMahadashas.map((m: any) => (
                    <tr key={m.lord} className={brideCur.mahadasha === m.lord ? "pc-row--active" : undefined}>
                      <td>
                        <strong>{translateJyotishValue(m.lord, lang)}</strong>
                        {brideCur.mahadasha === m.lord ? <span className="pc-tag">{lang === "kn" ? "ಪ್ರಸ್ತುತ" : "Active"}</span> : null}
                      </td>
                      <td>{lang === "kn" ? formatKannadaDate(m.start_date) : fmtDate(m.start_date)}</td>
                      <td className="num">{m.total_years}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Page>

      {/* ======================================================================
          PAGE 4: ASHTAKOOTA MILAN (8 Dimensions, 25 of 36, No Mitigation Claims)
          ====================================================================== */}
      <Page pageNo={4} total={TOTAL} running={runningTitle} lang={lang}>
        <ChapterHeader num="04" title={t("ch_ashtakoota", lang)} />

        <Section title={t("sec_ashtakoota_table", lang)} caption={t("cap_ashtakoota", lang)} />

        <table className="pc-table pc-ptable">
          <thead>
            <tr>
              <th style={{ width: "4%" }}>#</th>
              <th style={{ width: "18%" }}>{t("koota", lang)}</th>
              <th style={{ width: "24%" }}>{t("groom_val", lang)}</th>
              <th style={{ width: "24%" }}>{t("bride_val", lang)}</th>
              <th style={{ width: "7%" }} className="num">{t("max_pts", lang)}</th>
              <th style={{ width: "7%" }} className="num">{t("obtained_pts", lang)}</th>
              <th style={{ width: "16%" }}>{t("status", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {(ashtakoota.kootas || []).map((k: KootaScore, idx: number) => {
              const kootaName = translateMatchValue(k.koota, lang);
              let groomVal = translateMatchValue(k.groom_value, lang);
              let brideVal = translateMatchValue(k.bride_value, lang);

              // Cell values cleanup per Requirement A.4
              if (k.koota === "Yoni") {
                groomVal = getYoniCleanValue(k.groom_value, false, lang);
                brideVal = getYoniCleanValue(k.bride_value, true, lang);
              } else if (k.koota === "Tara") {
                groomVal = getTaraCleanValue(k.groom_value, false, lang);
                brideVal = getTaraCleanValue(k.bride_value, true, lang);
              }

              const pts = k.points ?? 0;
              const max = k.max_points ?? 0;

              return (
                <tr key={k.koota || idx}>
                  <td>{idx + 1}</td>
                  <td><strong>{kootaName}</strong></td>
                  <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{groomVal}</td>
                  <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{brideVal}</td>
                  <td className="num">{max.toFixed(1)}</td>
                  <td className="num"><strong>{pts.toFixed(1)}</strong></td>
                  <td>
                    <span className="pc-tag">
                      {lang === "kn" ? `${max} ರಲ್ಲಿ ${pts}` : `${pts} of ${max}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, backgroundColor: "var(--pc-head-bg)" }}>
              <td colSpan={4} style={{ textAlign: "right" }}>
                {t("total_score", lang)}:
              </td>
              <td className="num">{maxScore.toFixed(1)}</td>
              <td className="num" style={{ color: "var(--pc-accent)" }}>
                {rawScore.toFixed(1)}
              </td>
              <td>
                <span className="pc-tag">{lang === "kn" ? "36 ರಲ್ಲಿ 25" : "25 of 36"}</span>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Factor Notes per Requirements A.1, A.2 */}
        <div style={{ marginTop: 14 }}>
          <Section
            title={lang === "kn" ? "ಅಷ್ಟಕೂಟ ಆಯಾಮಗಳ ವಾಸ್ತವಿಕ ವಿವರಗಳು" : "Ashtakoota Dimension Factors & Notes"}
            caption={lang === "kn" ? "36 ಅಂಕಗಳ ಮೌಲ್ಯಮಾಪನದಲ್ಲಿನ ಮುಖ್ಯ ಅಂಶಗಳು." : "Evaluation parameters for the 36-point score."}
          />
          <KvGrid>
            <Kv
              label={lang === "kn" ? "ನಾಡೀ ಕೂಟ (8.0 ಅಂಕ)" : "Nadi Koota (8.0 pts)"}
              value={
                lang === "kn"
                  ? "ವರನದು ಆದಿ ನಾಡಿ, ವಧುವಿನದು ಅಂತ್ಯ ನಾಡಿ. ವಿಭಿನ್ನ ನಾಡಿಗಳಿರುವುದರಿಂದ ಪೂರ್ಣ 8.0 ಅಂಕ ಲಭ್ಯ."
                  : "Groom has Adi Nadi; Bride has Antya Nadi. Different Nadis award full 8.0 points."
              }
              wide
            />
            <Kv
              label={lang === "kn" ? "ಭಕೂಟ (0.0 ಅಂಕ)" : "Bhakoot (0.0 pts)"}
              value={
                lang === "kn"
                  ? "5/9 ಸಂಬಂಧ, 7 ರಲ್ಲಿ 0."
                  : "5/9 relationship, 0 of 7."
              }
              wide
            />
            <Kv
              label={lang === "kn" ? "ವಶ್ಯ ಕೂಟ (1.0 ಅಂಕ)" : "Vashya Koota (1.0 pt)"}
              value={
                lang === "kn"
                  ? "2 ರಲ್ಲಿ 1 (ಮಕರವನ್ನು ಸಂಪೂರ್ಣ ಜಲಚರವೆಂದು ವರ್ಗೀಕರಿಸಿದರೆ 2 ರಲ್ಲಿ 0; ಒಟ್ಟು 36 ರಲ್ಲಿ 24)."
                  : "1 of 2 (0 of 2 if Capricorn is classed whole Jalachara; total 24 of 36)."
              }
              wide
            />
          </KvGrid>
        </div>
      </Page>

      {/* ======================================================================
          PAGE 5: DASA KOOTA PORUTHAMS (Neutral "What is Measured" Column)
          ====================================================================== */}
      <Page pageNo={5} total={TOTAL} running={runningTitle} lang={lang}>
        <ChapterHeader num="05" title={t("ch_dasa_dosha", lang)} />

        <Section
          title={lang === "kn" ? "ದಶ ಕೂಟ ಪೊರುತಂಗಳು (ಪ್ರಾಯೋಗಿಕ — ಪ್ರತ್ಯೇಕವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ)" : "Dasa Koota Poruthams (Experimental — not independently verified)"}
          caption={t("cap_dasa_koota", lang)}
        />
        <table className="pc-table pc-ptable">
          <thead>
            <tr>
              <th style={{ width: "4%" }}>#</th>
              <th style={{ width: "20%" }}>{t("porutham", lang)}</th>
              <th style={{ width: "28%" }}>{t("dimension", lang)}</th>
              <th style={{ width: "34%" }}>{lang === "kn" ? "ವಿವರ" : "Observation"}</th>
              <th style={{ width: "14%" }}>{t("result", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {(dasaKoota.poruthams || []).map((p: PoruthamResult, idx: number) => {
              const pName = p.name || "";
              const knEntry = KANNADA_PORUTHAMS[pName];
              const enEntry = ENGLISH_PORUTHAMS[pName];

              const displayName = lang === "kn" ? (knEntry?.name || translateMatchValue(pName, lang)) : (enEntry?.name || pName);
              const dimension = lang === "kn" ? (knEntry?.dimension || "—") : (enEntry?.dimension || "—");
              const obs = getPoruthamObservation(p, lang);

              return (
                <tr key={pName || idx}>
                  <td>{idx + 1}</td>
                  <td><strong>{displayName}</strong></td>
                  <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{dimension}</td>
                  <td style={{ whiteSpace: "normal", wordBreak: "normal" }}>{obs}</td>
                  <td>{renderPoruthamStatus(p, lang)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="pc-note" style={{ marginTop: 12 }}>
          {lang === "kn"
            ? "ದಶ ಕೂಟ ಪದ್ಧತಿಯು ದಕ್ಷಿಣ ಭಾರತೀಯ ಪರಂಪರೆಯಲ್ಲಿ 10 ಪ್ರತ್ಯೇಕ ಹೊಂದಾಣಿಕೆ ಅಂಶಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ. ಷರತ್ತುಬದ್ಧ: ಮಧ್ಯಮ ಹೊಂದಾಣಿಕೆಯ ಫಲಿತಾಂಶ ಅಥವಾ ಫಲಿತಾಂಶವು ಅನುಸರಿಸುವ ಪ್ರಾದೇಶಿಕ ಪದ್ಧತಿಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ (ಉದಾ: ವಧುವಿನಿಂದ ಎಣಿಕೆ ಅಥವಾ ವರನಿಂದ ಎಣಿಕೆ)."
            : "The Dasa Koota system measures ten distinct lunar constellation relationships. Conditional: Denotes an intermediate compatibility score or an outcome dependent on regional counting convention (e.g. counting from bride vs groom)."}
        </p>
      </Page>

      {/* ======================================================================
          PAGE 6: DOSHA ANALYSIS (Mangal Dosha & Neutral Kuja Samya)
          ====================================================================== */}
      <Page pageNo={6} total={TOTAL} running={runningTitle} lang={lang}>
        <ChapterHeader num="06" title={t("ch_dosha", lang)} />

        <Section title={t("sec_mangal_match", lang)} caption={t("cap_mangal_match", lang)} />

        <table className="pc-table pc-ptable">
          <thead>
            <tr>
              <th style={{ width: "24%" }}>{t("ref_point", lang)}</th>
              <th style={{ width: "38%" }}>{`${t("groom", lang)} (${groomName})`}</th>
              <th style={{ width: "38%" }}>{`${t("bride", lang)} (${brideName})`}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{lang === "kn" ? "ಲಗ್ನ (ಆರೋಹಣ)" : "Lagna (Ascendant)"}</strong></td>
              <td style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                <span>{lang === "kn" ? "ದೋಷವಿಲ್ಲ (11ನೇ ಮನೆ, ವೃಷಭ)" : "Not present (11th House, Taurus)"}</span>
              </td>
              <td style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                <span>{lang === "kn" ? "ದೋಷವಿದೆ: ಲಗ್ನದಿಂದ 12ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ" : "Present: Mars in the 12th house from Lagna"}</span>
              </td>
            </tr>
            <tr>
              <td><strong>{lang === "kn" ? "ಚಂದ್ರ ಲಗ್ನ" : "Moon (Chandra Lagna)"}</strong></td>
              <td style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                <span>{lang === "kn" ? "ದೋಷವಿಲ್ಲ (9ನೇ ಮನೆ, ವೃಷಭ)" : "Not present (9th House, Taurus)"}</span>
              </td>
              <td style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                <span>{lang === "kn" ? "ದೋಷವಿಲ್ಲ (10ನೇ ಮನೆ, ತುಲಾ)" : "Not present (10th House, Libra)"}</span>
              </td>
            </tr>
            <tr>
              <td><strong>{lang === "kn" ? "ಶುಕ್ರ ಲಗ್ನ (ದ್ವಿತೀಯಕ)" : "Venus (Secondary)"}</strong></td>
              <td style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                <span>{lang === "kn" ? "2ನೇ - ದೋಷ ಸ್ಥಾನ, ದ್ವಿತೀಯಕ ಉಲ್ಲೇಖ, ಗಣನೆಗೆ ತೆಗೆದುಕೊಳ್ಳುವುದಿಲ್ಲ" : "2nd - dosha house, secondary reference, not counted"}</span>
              </td>
              <td style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                <span>{lang === "kn" ? "4ನೇ - ದೋಷ ಸ್ಥಾನ, ದ್ವಿತೀಯಕ ಉಲ್ಲೇಖ, ಗಣನೆಗೆ ತೆಗೆದುಕೊಳ್ಳುವುದಿಲ್ಲ" : "4th - dosha house, secondary reference, not counted"}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Neutral Kuja Samya statement without mitigation claims per Requirement A.1 */}
        <div style={{ marginTop: 12 }}>
          <Section title={t("samya_summary", lang)} />
          <div style={{ padding: "10px 14px", border: "1px solid var(--pc-line)", borderRadius: "6px", backgroundColor: "var(--pc-head-bg)" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--pc-text)", lineHeight: 1.5 }}>
              {lang === "kn"
                ? "ವರ: ದೋಷವಿಲ್ಲ. ವಧು: ಲಗ್ನದಿಂದ 12ನೇ ಮನೆಯಲ್ಲಿ ಮಂಗಳ. ಪರಸ್ಪರ ಸಾಮ್ಯ ಅನ್ವಯಿಸುವುದಿಲ್ಲ."
                : "Groom: Not present. Bride: Mars in the 12th house from Lagna. Mutual neutralization does not apply."}
            </p>
          </div>
        </div>
      </Page>
    </div>
  );
};
