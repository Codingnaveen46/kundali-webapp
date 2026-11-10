"use client";

import React, { useState } from "react";
import { BirthChartResponse, PlanetTableRow } from "@/lib/types";
import { ChartContainer } from "../charts/ChartContainer";
import { SouthIndianChart } from "@/components/charts/SouthIndianChart";
import verificationLog from "@/lib/verification_log.json";
import {
  Calendar, Clock, MapPin, AlertTriangle, Download,
  Compass, Sun, Sparkles, ChevronDown, ChevronUp, RotateCcw,
  Shield, CheckCircle2
} from "lucide-react";

interface BirthChartReportProps {
  chart: BirthChartResponse;
  onReset?: () => void;
  onExportPdf?: () => void;
  /** Dedicated print layout: no screen-only controls, all sections expanded. */
  printMode?: boolean;
  /** Language for the print layout (locked; no toggle rendered). */
  printLanguage?: "en" | "kn";
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
  Rahu: "☊",
  Ketu: "☋",
};

export const BirthChartReport: React.FC<BirthChartReportProps> = ({
  chart,
  onReset,
  onExportPdf,
  printMode = false,
  printLanguage = "en"
}) => {
  const [expandedMdIndex, setExpandedMdIndex] = useState<number | null>(0);
  const {
    metadata, lagna, planets, panchang, dasha, avakahada, doshas,
    boundary_warnings, calculation_appendix, planets_table, lagna_vargottama
  } = chart;
  const isKn = printLanguage === "kn";
  const isVerified = process.env.NEXT_PUBLIC_CALCULATIONS_VERIFIED === "true" || (chart as any).is_verified === true;

  // Astrologer table: use the backend planets_table when present, fall back
  // to a locally built table from the planets payload (older responses).
  const tableRows: PlanetTableRow[] = (planets_table && planets_table.length > 0)
    ? planets_table
    : Object.values(planets).map((p) => ({
        planet: p.name,
        sign: p.sign,
        sign_sanskrit: p.sign_sanskrit || "",
        house: p.house ?? "-",
        deg_in_sign: `${p.degree_in_sign}° ${String(p.minute_in_sign).padStart(2, "0")}' ${String(Math.round(p.second_in_sign)).padStart(2, "0")}″`,
        total_dms: "",
        nakshatra: p.nakshatra,
        pada: p.pada,
        navamsa_sign: p.navamsa_sign || "",
        navamsa_sign_idx: undefined,
        is_retrograde: !!p.is_retrograde,
        is_combust: !!p.is_combust,
        is_vargottama: false,
        dignity: "",
      }));

  // Verification log entries for this chart (by name), plus fallback
  const verifiedCharts = (verificationLog as any)?.verified_charts || {};
  const personVerified = verifiedCharts[metadata?.name] || null;

  return (
    <div className={`space-y-6 font-sans ${isKn ? "font-kannada" : ""}`} id="printable-birth-chart">
      {/* =========================================================================
          PRINT-ONLY TITLE BLOCK (light background; the dark screen hero is
          print:hidden below). Title, person, birth details and methodology.
          ========================================================================= */}
      {printMode && (
        <div className="hidden print:block pb-2 border-b-2 border-black">
          <div className="text-[11px] font-bold uppercase tracking-wider">
            {isKn ? "ಜನ್ಮ ಕುಂಡಲಿ ವರದಿ · ವೈದಿಕ ಜನ್ಮ ಚಾರ್ಟ್" : "Janma Kundali Report · Vedic Birth Chart"}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            {metadata.name}
          </h1>
          <div className="text-[11px] mt-1 font-bold">
            {metadata.birth_date} · {metadata.is_time_unknown ? "Time Unknown (Solar Noon)" : metadata.birth_time} · {metadata.is_place_unknown ? "Geocentric Reference" : `${metadata.latitude.toFixed(4)}°, ${metadata.longitude.toFixed(4)}°`} ({metadata.timezone})
          </div>
          <div className="text-[11px] mt-1">
            As of 9 Nov 2026 · Methodology: {metadata.methodology_version || "v1.1.0"} · {metadata.ayanamsa} Ayanamsa ({metadata.ayanamsa_dms || "23° 50'"}) · Node: {metadata.node_type === "true" ? "True Node" : "Mean Node (Default)"} · House system: {metadata.house_system === "W" ? "Whole Sign (W)" : metadata.house_system}
          </div>
          <div className="text-[11px] mt-1">
            Calculated by software, not reviewed by an astrologer. Traditions differ. An aid, not advice.
          </div>
        </div>
      )}

      {/* Verification Banner (screen only: the print layout carries the same
          disclosure line in the title block and the running footer) */}
      {!printMode && !isVerified && (
        <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3.5 text-amber-950 dark:text-amber-200 shadow-sm print-break-inside-avoid">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm sm:text-base tracking-wide">
              Calculations have not yet been independently verified. Please confirm with an astrologer.
            </h3>
            <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              Rules and chart benchmarks remain unverified pending external benchmark entry.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner: Profile Name, Birth Details & Actions — screen only */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-900/30 print-break-inside-avoid ${printMode ? "hidden" : "print:hidden"}`}>
        {/* Subtle Sacred Geometry Watermark Overlay */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-amber-500/10 pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-64 h-64 rounded-full border border-amber-500/15 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold tracking-wide uppercase text-[10px]">
                  Janma Kundali · Vedic Birth Chart
                </span>
                <span className="text-stone-400">·</span>
                <span className="text-[11px] text-stone-300">
                  {metadata.ayanamsa} Ayanamsa ({metadata.ayanamsa_dms || "23° 50'"}) · Node: {metadata.node_type === "true" ? "True Node" : "Mean Node (Default)"}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                Methodology: {metadata.methodology_version || "v1.1.0"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif-vedic">
              {metadata.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-1">
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{metadata.birth_date}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">
                  {metadata.is_time_unknown ? "Time Unknown (Solar Noon)" : metadata.birth_time}
                </span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">
                  {metadata.is_place_unknown
                    ? "Geocentric Reference"
                    : `${metadata.latitude.toFixed(2)}°N, ${metadata.longitude.toFixed(2)}°E (${metadata.timezone})`}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 no-print">
            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export Clean PDF</span>
              </button>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-bold rounded-xl border border-white/15 backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Chart</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Node Calculation Transparency Note (screen only: the print appendix
          carries the node type and the same disclosure) */}
      {!printMode && (
      <div className="p-3.5 bg-stone-100 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-2.5 shadow-sm">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-800 dark:text-stone-200">Astronomical Node Calculation:</span> Rahu and Ketu are computed using the <strong>Mean Lunar Node</strong> (default) or <strong>True Lunar Node</strong>. Differences of ~8 arcminutes between astrology tools arise from this astronomical convention choice, not a calculation error.
        </div>
      </div>
      )}

      {/* Boundary (Sandhi) Warnings (< 1° from Border) */}
      {boundary_warnings.has_warnings && (
        <div className="status-objection p-4 sm:p-5 bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2 shadow-sm print-break-inside-avoid">
          <div className="flex items-center gap-2 font-extrabold text-sm text-amber-900 dark:text-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Critical Boundary (Sandhi) Notice — Exact Birth Time Required</span>
          </div>
          <div className="space-y-1 pl-6">
            {boundary_warnings.warnings.map((w, idx) => (
              <p key={idx} className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-mono">
                • <strong>{w.target} ({w.type}):</strong> {w.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: KUNDALI CHARTS (D1 RASHI & D9 NAVAMSA)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section">
        <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
          <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>1. Kundali Charts (D1 Rashi &amp; D9 Navamsa)</span>
        </h2>

        {printMode ? (
          /* Print layout: both charts as vector SVG, side by side, fixed
             South Indian style, planet abbreviations only on the D9 chart */
          <div className="grid grid-cols-2 gap-4 print-break-inside-avoid">
            <div className="space-y-2">
              <div className="font-bold text-[10px] uppercase tracking-wider text-stone-800">
                {metadata.name} — D1 Rashi Chart
              </div>
              <SouthIndianChart planets={planets} lagna={lagna} isNavamsa={false} theme="light" labelScale={1.7} />
            </div>
            <div className="space-y-2">
              <div className="font-bold text-[10px] uppercase tracking-wider text-stone-800">
                {metadata.name} — D9 Navamsa Chart
              </div>
              <SouthIndianChart planets={planets} lagna={lagna} isNavamsa={true} theme="light" labelScale={1.7} />
            </div>
          </div>
        ) : (
          <ChartContainer planets={planets} lagna={lagna} defaultStyle="south" />
        )}
      </section>

      {/* =========================================================================
          SECTION 2: GRAHA TABLE & PLANETARY LONGITUDES
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md overflow-x-auto print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mb-3.5 pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>2. Graha Table &amp; Planetary Longitudes</span>
          </span>
          <span className={`text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900 ${printMode ? "print:hidden" : ""}`}>
            DMS Precision
          </span>
        </h2>

        {printMode ? (
          /* Print: full astrologer table with D9, flags and dignity columns.
             R/C/Vargottama cells are blank instead of a dash so absence of a
             feature is visibly distinguishable from an uncalculated value. */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 text-[10px] uppercase font-bold bg-stone-50">
                <th className="py-2 px-2">Graha</th>
                <th className="py-2 px-2">Rashi (Sign)</th>
                <th className="py-2 px-2">DMS in Sign</th>
                <th className="py-2 px-2">Total Longitude</th>
                <th className="py-2 px-1.5">Nakshatra</th>
                <th className="py-2 px-1 text-center">Pada</th>
                <th className="py-2 px-1 text-center">House</th>
                <th className="py-2 px-1.5 text-center">D9 Navamsa</th>
                <th className="py-2 px-1.5 text-center">Flags</th>
                <th className="py-2 px-1.5">Dignity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
              {/* Lagna row (D1 row; Lagna vargottama flagged with a V) */}
              {lagna && (
                <tr className="bg-amber-500/10 dark:bg-amber-950/30 font-bold text-amber-950 dark:text-amber-200">
                  <td className="py-2.5 px-2">Lagna (Ascendant)</td>
                  <td className="py-2.5 px-2">{lagna.sign} ({lagna.sign_sanskrit})</td>
                  <td className="py-2.5 px-2 font-mono">{lagna.dms_in_sign || `${lagna.degree_in_sign}° ${String(lagna.minute_in_sign).padStart(2, "0")}'`}</td>
                  <td className="py-2.5 px-2 font-mono">{lagna.total_dms || "—"}</td>
                  <td className="py-2.5 px-1.5">{lagna.nakshatra}</td>
                  <td className="py-2.5 px-1 text-center font-bold">{lagna.pada}</td>
                  <td className="py-2.5 px-1 text-center font-bold">1</td>
                  <td className="py-2.5 px-1.5 text-center">{lagna.navamsa_sign}</td>
                  <td className="py-2.5 px-1.5 text-center">{lagna_vargottama ? "V" : ""}</td>
                  <td className="py-2.5 px-1.5">—</td>
                </tr>
              )}
              {tableRows.map((p) => (
                <tr key={p.planet} className="text-stone-800 dark:text-stone-200">
                  <td className="py-2 px-2 font-bold">{p.planet}</td>
                  <td className="py-2 px-2">{p.sign} {p.sign_sanskrit ? `(${p.sign_sanskrit})` : ""}</td>
                  <td className="py-2 px-2 font-mono text-[11px]">{p.deg_in_sign}</td>
                  <td className="py-2 px-2 font-mono text-[11px]">{p.total_dms || "—"}</td>
                  <td className="py-2 px-1.5">{p.nakshatra}</td>
                  <td className="py-2 px-1 text-center font-bold">{p.pada}</td>
                  <td className="py-2 px-1 text-center font-bold">{p.house ?? "—"}</td>
                  <td className="py-2 px-1.5 text-center">{p.navamsa_sign || "—"}</td>
                  {/* Flags: R (retrograde), C (combust), V (vargottama); blank when absent */}
                  <td className="py-2 px-1.5 text-center font-bold">
                    {[
                      p.is_retrograde ? "R" : "",
                      p.is_combust ? "C" : "",
                      p.is_vargottama ? "V" : "",
                    ].filter(Boolean).join(" ")}
                  </td>
                  <td className="py-2 px-1.5">{p.dignity || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[10px] uppercase font-bold bg-stone-50/50 dark:bg-stone-800/30">
              <th className="py-2.5 px-2">Graha</th>
              <th className="py-2.5 px-2">Rashi (Sign)</th>
              <th className="py-2.5 px-2">Longitude</th>
              <th className="py-2.5 px-2">Nakshatra</th>
              <th className="py-2.5 px-1 text-center">Pada</th>
              <th className="py-2.5 px-1 text-center">House</th>
              <th className="py-2.5 px-1 text-center">Navamsa</th>
              <th className="py-2.5 px-1 text-center">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
            {/* Lagna Row */}
            {lagna && (
              <tr className="bg-amber-500/10 dark:bg-amber-950/30 font-bold text-amber-950 dark:text-amber-200">
                <td className="py-3 px-2 flex items-center gap-1.5">
                  <span className="text-amber-600 font-mono font-bold">L</span>
                  <span>Ascendant (Lagna)</span>
                </td>
                <td className="py-3 px-2">{lagna.sign} ({lagna.sign_sanskrit})</td>
                <td className="py-3 px-2 font-mono">{lagna.degree_in_sign}° {lagna.minute_in_sign}&apos;</td>
                <td className="py-3 px-2">{lagna.nakshatra}</td>
                <td className="py-3 px-1 text-center font-bold text-amber-700 dark:text-amber-400">{lagna.pada}</td>
                <td className="py-3 px-1 text-center font-bold">1</td>
                <td className="py-3 px-1 text-center">{lagna.navamsa_sign}{lagna_vargottama ? " (V)" : ""}</td>
                <td className="py-3 px-1 text-center text-stone-400">—</td>
              </tr>
            )}

            {/* 9 Planets — includes the Dignity flag when the table data is present */}
            {tableRows.map((row) => {
              const p = planets[row.planet];
              if (!p) return null;
              return (
                <tr key={p.name} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 text-stone-800 dark:text-stone-200 transition-colors">
                  <td className="py-2.5 px-2 font-bold flex items-center gap-1.5">
                    <span className="text-stone-400 font-mono">{PLANET_SYMBOLS[p.name] || "•"}</span>
                    <span>{p.name}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    {p.sign} {p.sign_sanskrit ? `(${p.sign_sanskrit})` : ""}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px]">
                    {p.degree_in_sign}° {String(p.minute_in_sign).padStart(2, "0")}&apos;
                  </td>
                  <td className="py-2.5 px-2">{p.nakshatra}</td>
                  <td className="py-2.5 px-1 text-center font-bold text-amber-700 dark:text-amber-400">{p.pada}</td>
                  <td className="py-2.5 px-1 text-center font-bold">{p.house ?? "—"}</td>
                  <td className="py-2.5 px-1 text-center text-stone-500 font-medium">{p.navamsa_sign || "—"}</td>
                  <td className="py-2.5 px-1 text-center">
                    {p.is_retrograde && (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mr-1">
                        R
                      </span>
                    )}
                    {p.is_combust && (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 mr-1">
                        C
                      </span>
                    )}
                    {row.is_vargottama && (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mr-1">
                        V
                      </span>
                    )}
                    {row.dignity && (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                        {row.dignity}
                      </span>
                    )}
                    {!p.is_retrograde && !p.is_combust && !row.is_vargottama && !row.dignity && (
                      <span className="text-stone-400 text-[10px]">Direct</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </section>

      {/* =========================================================================
          SECTION 3: PANCHANGA & AVAKAHADA CHAKRA
          ========================================================================= */}
      <section className="space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panchanga at Birth */}
          <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md">
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mb-3.5 pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>3. Panchanga at Birth (5 Sacred Limbs)</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Tithi</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{panchang.tithi.full_name}</span>
                <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">({panchang.tithi.elapsed_percent}% elapsed)</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Vara (Solar Day)</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{panchang.vara.sanskrit} ({panchang.vara.name})</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Nakshatra</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{panchang.nakshatra.name}</span>
                <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">({panchang.nakshatra.elapsed_percent}% elapsed)</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Yoga</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{panchang.yoga.name} (#{panchang.yoga.number})</span>
              </div>
              <div className="col-span-2 p-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Karana</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{panchang.karana.name}</span>
                </div>
                {panchang.karana.is_vishti && (
                  <span className="px-2.5 py-1 bg-rose-500/15 text-rose-700 dark:text-rose-400 text-[10px] font-bold rounded-full border border-rose-500/30">
                    Vishti (Bhadra Karana)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avakahada Chakra */}
          <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md">
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mb-3.5 pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>4. Avakahada Chakra Details</span>
            </h2>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Varna</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{avakahada.varna}</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Vashya</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{avakahada.vashya}</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Yoni</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{avakahada.yoni} ({avakahada.yoni_gender})</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Gana</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{avakahada.gana}</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Nadi</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{avakahada.nadi}</span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Tatwa</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{avakahada.tatwa}</span>
                <span className="text-[9px] text-stone-500 dark:text-stone-400 block mt-0.5">(unverified rule; traditions differ)</span>
              </div>
              <div className="col-span-3 p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Moon Sign &amp; Ruler</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {avakahada.rashi} ({avakahada.rashi_sanskrit}) — Ruled by {avakahada.rashi_lord}
                  </span>
                </div>
                {avakahada.paya && (
                  <div className="text-right">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Paya</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">{avakahada.paya.paya}</span>
                    <span className="text-[9px] text-stone-500 dark:text-stone-400 block mt-0.5">(unverified rule; traditions differ)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: VIMSHOTTARI DASHA (ACCORDION ON SCREEN, EXPANDED TABLE IN PRINT)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>5. Vimshottari Dasha Timeline (120-Year Solar Cycle)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Balance at birth: <strong>{dasha.balance_at_birth.lord}</strong> ({dasha.balance_at_birth.balance_years.toFixed(2)} years remaining of the {dasha.balance_at_birth.total_years}-year {dasha.balance_at_birth.lord} pot)
            </p>
          </div>

          {/* Current Period Highlight Badge */}
          {dasha.current_period.mahadasha && (
            <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Current: {dasha.current_period.mahadasha} MD &gt; {dasha.current_period.antardasha} AD &gt; {dasha.current_period.pratyantardasha} PD</span>
            </div>
          )}
        </div>

        {printMode ? (
          /* Print: expand every Mahadasha's Antardashas into one flat table */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 text-[10px] uppercase font-bold bg-stone-50">
                <th className="py-2 px-2">Mahadasha</th>
                <th className="py-2 px-2">Antardasha</th>
                <th className="py-2 px-2">Antardasha Start</th>
                <th className="py-2 px-2">Antardasha End</th>
                <th className="py-2 px-2 text-right">MD Total (yrs)</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
              {dasha.mahadashas.map((md) =>
                md.antardashas.map((ad, adIdx) => (
                  <tr
                    key={`${md.lord}-${ad.lord}`}
                    className={`${md.is_current ? "status-current bg-amber-500/10 dark:bg-amber-950/30 font-semibold" : ""} text-stone-800 dark:text-stone-200`}
                  >
                    {adIdx === 0 && (
                      <td className="py-1.5 px-2 font-bold align-top" rowSpan={md.antardashas.length}>
                        {md.lord}
                        <span className="block text-[10px] font-normal text-stone-500">
                          {md.start_date.slice(0, 10)} — {md.end_date.slice(0, 10)}
                        </span>
                      </td>
                    )}
                    <td className="py-1.5 px-2">{md.lord} — {ad.lord}</td>
                    <td className="py-1.5 px-2 font-mono">{ad.start_date.slice(0, 10)}</td>
                    <td className="py-1.5 px-2 font-mono">{ad.end_date.slice(0, 10)}</td>
                    {adIdx === 0 && (
                      <td className="py-1.5 px-2 text-right font-mono align-top" rowSpan={md.antardashas.length}>
                        {md.total_years}
                      </td>
                    )}
                    {adIdx === 0 && (
                      <td className="py-1.5 px-2 align-top" rowSpan={md.antardashas.length}>
                        {md.is_current ? "Current" : ""}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
        /* Mahadasha Accordion List */
        <div className="space-y-2.5">
          {dasha.mahadashas.map((md, idx) => {
            const isExpanded = expandedMdIndex === idx;
            return (
              <div
                key={md.lord}
                className={`border rounded-2xl transition-all ${
                  md.is_current
                    ? "border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/20 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedMdIndex(isExpanded ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${md.is_current ? "bg-amber-500 shadow-sm shadow-amber-500" : "bg-stone-300 dark:bg-stone-700"}`} />
                    <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">{md.lord} Mahadasha</span>
                    <span className="text-stone-400 font-normal">({md.total_years} yrs)</span>
                    {md.is_current && (
                      <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                        Active Now
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                    <span>{md.start_date.slice(0, 10)} to {md.end_date.slice(0, 10)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Sub-periods: Antardashas */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-200/60 dark:border-stone-800">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                      Antardashas (Bhuktis) under {md.lord}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {md.antardashas.map((ad) => (
                        <div
                          key={ad.lord}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            ad.is_current
                              ? "bg-amber-500/15 dark:bg-amber-900/40 border-amber-500/40 font-bold"
                              : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 dark:text-stone-100">{md.lord} - {ad.lord}</span>
                            {ad.is_current && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5 font-mono">
                            {ad.start_date.slice(0, 10)} → {ad.end_date.slice(0, 10)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 6: DOSHAS & CLASSICAL EVALUATIONS
          ========================================================================= */}
      <section className="print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mangal Dosha Card */}
          <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md">
            <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>6. Mangal Dosha (Kuja Dosha)</span>
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <span className={`status-neutral px-2.5 py-1 text-xs font-bold rounded-xl ${
                !doshas.mangal_dosha.is_present
                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
              }`}>
                {doshas.mangal_dosha.status}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-2 leading-relaxed">
              Mars in sign <strong>{doshas.mangal_dosha.mars_sign}</strong> (House {doshas.mangal_dosha.mars_house_lagna ?? "—"} from Lagna). Rule category as stated in the rule list used here (unverified; traditions differ).
            </p>
            {doshas.mangal_dosha.cancellations.length > 0 && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Potential Cancellations Noted:
                </span>
                {doshas.mangal_dosha.cancellations.map((c, i) => (
                  <div key={i} className="text-[11px] leading-snug">
                    • {c.desc} {c.citation ? `(${c.citation})` : "(rule unverified)"}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kaal Sarpa Yoga Card */}
          <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md">
            <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Kaal Sarpa Yoga</span>
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <span className={`status-neutral px-2.5 py-1 text-xs font-bold rounded-xl ${
                !doshas.kaal_sarpa.is_present
                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
              }`}>
                {doshas.kaal_sarpa.is_present ? doshas.kaal_sarpa.yoga_name : "Not a full Kaal Sarpa"}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {doshas.kaal_sarpa.description}
              <span className="block mt-1 text-[10px] text-stone-500 dark:text-stone-400">(unverified rule; traditions differ)</span>
            </p>
          </div>

          {/* Sade Sati Card */}
          <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md">
            <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span>Saturn Transit (Sade Sati)</span>
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <span className={`status-neutral px-2.5 py-1 text-xs font-bold rounded-xl ${
                !doshas.sade_sati.is_active
                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
              }`}>
                {doshas.sade_sati.phase}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-2 leading-relaxed">
              {doshas.sade_sati.description}
            </p>
            <p className="text-[11px] text-stone-500 italic border-t border-stone-100 dark:border-stone-800 pt-2.5">
              {doshas.sade_sati.counsel} <span className="not-italic">(unverified rule; traditions differ)</span>
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: CALCULATION APPENDIX (WHAT WAS COMPUTED AND HOW)
          ========================================================================= */}
      {calculation_appendix && (
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-3 print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>7. Calculation Appendix (What was computed and how)</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
            Full Transparency
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
            <tr><td className="py-1.5 px-2 font-bold w-56 align-top">Local time</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.local_time}</td></tr>
            <tr><td className="py-1.5 px-2 font-bold align-top">UTC time</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.utc_time}</td></tr>
            <tr><td className="py-1.5 px-2 font-bold align-top">Julian Day</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.julian_day}</td></tr>
            <tr><td className="py-1.5 px-2 font-bold align-top">Ayanamsa</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.ayanamsa_name} ({calculation_appendix.ayanamsa_value}) = {calculation_appendix.ayanamsa_dms}</td></tr>
            <tr><td className="py-1.5 px-2 font-bold align-top">Node type</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.node_type}</td></tr>
            <tr><td className="py-1.5 px-2 font-bold align-top">House system</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.house_system}</td></tr>
            <tr><td className="py-1.5 px-2 font-bold align-top">Dasha year length</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.dasha_year_length}</td></tr>
            <tr><td className="py-1.5 px-2 font-bold align-top">Balance at birth (working)</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.dasha_balance_working || "—"}</td></tr>
            <tr><td className="py-1.5 px-2 font-bold align-top">Combustion orb note</td><td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">{calculation_appendix.combustion_orb_note}</td></tr>
            {(calculation_appendix.warnings || []).length > 0 && (
              <tr><td className="py-1.5 px-2 font-bold align-top">Warnings</td>
              <td className="py-1.5 px-2 text-stone-700 dark:text-stone-300">
                <ul className="list-disc pl-4 space-y-0.5">
                  {calculation_appendix.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              </td></tr>
            )}
          </tbody>
        </table>

        {/* Moon nakshatra working (always shown: it drives the dasha balance) */}
        {calculation_appendix.moon_nakshatra_working && (
          <div className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-2">
            <span className="font-bold">Moon nakshatra working: </span>
            {typeof calculation_appendix.moon_nakshatra_working === "string"
              ? calculation_appendix.moon_nakshatra_working
              : calculation_appendix.moon_nakshatra_working.working_str || JSON.stringify(calculation_appendix.moon_nakshatra_working)}
          </div>
        )}
      </section>
      )}

      {/* =========================================================================
          SECTION 8: VERIFICATION LOG (WHAT WAS EXTERNALLY CHECKED)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-3 print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>8. Verification Log (What was externally checked)</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
            Log: compliance/verification_log.json
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 text-[10px] uppercase font-bold bg-stone-50">
              <th className="py-2 px-3.5">Field</th>
              <th className="py-2 px-3.5">Source</th>
              <th className="py-2 px-3.5">Status</th>
              <th className="py-2 px-4">Provenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
            {personVerified ? (
              personVerified.checks.map((c: any, i: number) => (
                <tr key={i} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                  <td className="py-2 px-3.5 font-bold text-stone-900 dark:text-stone-100">{metadata.name} — {c.field}</td>
                  <td className="py-2 px-3.5 font-sans">{c.source}</td>
                  <td className="py-2 px-3.5 font-semibold">
                    <span className="status-verified px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-stone-600 dark:text-stone-400">{c.provenance}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-2 px-3.5 font-bold">{metadata.name}</td>
                <td className="py-2 px-3.5">—</td>
                <td className="py-2 px-3.5 font-semibold text-stone-500">Not yet verified</td>
                <td className="py-2 px-4 text-stone-500">No external check logged</td>
              </tr>
            )}

            {((verificationLog as any)?.unverified_items || []).map((item: string, idx: number) => (
              <tr key={`unverified-${idx}`} className="bg-amber-500/5 dark:bg-amber-950/20">
                <td className="py-2 px-3.5 font-medium text-stone-700 dark:text-stone-300" colSpan={2}>
                  {item}
                </td>
                <td className="py-2 px-3.5 font-semibold">
                  <span className="status-unverified px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                    UNVERIFIED
                  </span>
                </td>
                <td className="py-2 px-4 text-stone-500 dark:text-stone-400">Subject to tradition and regional variance</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
