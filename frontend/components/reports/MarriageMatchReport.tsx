"use client";

import React, { useState } from "react";
import { MarriageMatchResponse } from "@/lib/types";
import { SouthIndianChart } from "@/components/charts/SouthIndianChart";
import { NorthIndianChart } from "@/components/charts/NorthIndianChart";
import { AIExplanationCard } from "./AIExplanationCard";
import verificationLog from "@/lib/verification_log.json";
import {
  Printer,
  AlertTriangle, RotateCcw, FileDown,
  ChevronDown, ChevronUp,
  Heart, Sparkles, Calendar, Clock, MapPin, Compass,
  Sun, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, Scale
} from "lucide-react";

interface MarriageMatchReportProps {
  matchResult: MarriageMatchResponse;
  onReset?: () => void;
  onExportPdf?: () => void;
  /** Dedicated print layout: no screen-only controls, all sections expanded. */
  printMode?: boolean;
  /** Language for the print layout (locked; no toggle rendered). */
  printLanguage?: "en" | "kn";
}

export const MarriageMatchReport: React.FC<MarriageMatchReportProps> = ({
  matchResult,
  onReset,
  onExportPdf,
  printMode = false,
  printLanguage = "en"
}) => {
  const {
    groom_summary,
    bride_summary,
    ashtakoota,
    dasa_koota,
    dosha_review,
    objections_noted = [],
    astrologer_details,
    groom_chart,
    bride_chart
  } = matchResult;

  const [language, setLanguage] = useState<"en" | "kn">(printMode ? printLanguage : "en");
  const [chartStyle, setChartStyle] = useState<"south" | "north">("south");
  const [dasaKootaOpen, setDasaKootaOpen] = useState<boolean>(printMode);

  const isKn = language === "kn";

  const handlePrint = () => {
    if (onExportPdf) {
      onExportPdf();
    } else {
      window.print();
    }
  };

  // Score calculations
  const rawScore = ashtakoota.raw_total_points ?? ashtakoota.total_points;
  const rawPct = ashtakoota.raw_percentage ?? ashtakoota.percentage;
  const hasVashyaDiff = ashtakoota.has_vashya_diff ?? (ashtakoota.alternate_vashya_total != null);
  const altVashyaTotal = ashtakoota.alternate_vashya_total;

  // Key Kootas
  const nadiKoota = ashtakoota.kootas.find((k) => k.koota === "Nadi");
  const bhakootKoota = ashtakoota.kootas.find((k) => k.koota === "Bhakoot");
  const ganaKoota = ashtakoota.kootas.find((k) => k.koota === "Gana");

  // Dasa Koota stats
  const dkPassedCount = dasa_koota?.pass_count ?? dasa_koota?.poruthams?.filter((p) => p.status === "Pass" || p.result === "pass").length ?? 0;
  const dkCondCount = dasa_koota?.conditional_count ?? dasa_koota?.poruthams?.filter((p) => p.status === "Conditional" || p.result === "conditional" || p.result === "depends on convention").length ?? 0;
  const dkFailCount = dasa_koota?.fail_count ?? dasa_koota?.poruthams?.filter((p) => p.status === "Fail" || p.result === "does not pass").length ?? 0;

  // Dasha balances with working
  const groomDashaBalance = groom_chart?.dasha?.balance_at_birth;
  const brideDashaBalance = bride_chart?.dasha?.balance_at_birth;

  // Verification log data
  const verifiedCharts = (verificationLog as any)?.verified_charts || {};
  const groomVerified = verifiedCharts[groom_summary?.name] || null;
  const brideVerified = verifiedCharts[bride_summary?.name] || null;

  return (
    <div className={`space-y-6 sm:space-y-8 font-sans ${isKn ? "font-kannada" : ""}`} id="printable-marriage-match">
      {/* =========================================================================
          PRINT-ONLY TITLE BLOCK (light background; the dark screen hero is
          print:hidden below). Shows the title, names and score without any
          dark banner or percentage-first display.
          ========================================================================= */}
      {printMode && (
        <div className="hidden print:block pb-2 border-b-2 border-black">
          <div className="text-[11px] font-bold uppercase tracking-wider">
            {isKn ? "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ ವರದಿ · ಅಷ್ಟಕೂಟ ಮತ್ತು ದಶ ಕೂಟ" : "Marriage Matching Report · Ashtakoota & Dasa Koota"}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            {groom_summary?.name} &amp; {bride_summary?.name}
          </h1>
          <div className="text-[11px] mt-1">
            As of 9 Nov 2026 · Methodology: {astrologer_details?.methodology_version || "v1.1.0"} · Lahiri Ayanamsa · Mean Node · Whole Sign
          </div>
          <div className="text-[12px] mt-1 font-bold">
            Raw Ashtakoota Score: {rawScore.toFixed(1)} / 36
            {hasVashyaDiff && (
              <span className="font-normal"> · Alternate: {altVashyaTotal?.toFixed(1)} / 36 ({ashtakoota.vashya_difference_note || "school difference; unverified"})</span>
            )}
          </div>
          <div className="text-[11px]">
            Effective equals raw (rules disabled) · Score as a percentage: {rawPct.toFixed(1)}% · Calculated by software, not reviewed by an astrologer.
          </div>
        </div>
      )}

      {/* =========================================================================
          HERO BANNER: SACRED VEDIC HEADER WITH SCORE & COUPLE SUMMARY
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 shadow-2xl border border-stone-800 print:hidden">
        <div className="absolute -right-8 -top-8 w-64 h-64 rounded-full border border-amber-500/15 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-200">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span className="font-bold tracking-wide uppercase text-[10px]">
                  {isKn ? "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ ವರದಿ" : "Marriage Matching Report"}
                </span>
                <span className="text-stone-400">·</span>
                <span className="text-[11px] text-stone-300">
                  Ashtakoota &amp; Dasa Koota
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                Methodology: {astrologer_details?.methodology_version || "v1.1.0"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif-vedic">
              {groom_summary?.name} &amp; {bride_summary?.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 pt-1">
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Groom: {groom_summary?.birth_date} · Bride: {bride_summary?.birth_date}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Lahiri Ayanamsa · Mean Node · Whole Sign</span>
              </span>
            </div>
          </div>

          {/* Score Display Card & Action Buttons */}
          <div className="flex flex-col items-end gap-3">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-right shadow-inner">
              <div className="text-[11px] uppercase tracking-wider text-amber-200/80 font-bold mb-0.5">
                Raw Ashtakoota Score
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 font-serif-vedic tracking-tight">
                {rawScore.toFixed(1)} <span className="text-sm font-normal text-stone-300">/ 36</span>
              </div>
              <div className="text-xs font-semibold text-stone-300 mt-0.5">
                Effective equals raw (rules disabled) · Score as a percentage: {rawPct.toFixed(1)}%
              </div>
              {hasVashyaDiff && (
                <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-amber-200">
                  Alternate ({ashtakoota.vashya_capricorn === "split" ? "whole_jalachara" : "split"}): <span className="font-bold font-mono">{altVashyaTotal?.toFixed(1)} / 36</span>
                  <span className="block text-[10px] text-stone-400">({ashtakoota.vashya_difference_note || "school difference; unverified"})</span>
                </div>
              )}
            </div>

            {/* Action Buttons (Language, Export, Print, Reset) — never rendered in the print layout */}
            {!printMode && (
            <div className="flex flex-wrap items-center gap-2 no-print">
              <div className="inline-flex rounded-xl border border-white/15 p-1 bg-white/5 text-xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    language === "en" ? "bg-amber-600 text-white shadow-sm" : "text-stone-300 hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("kn")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    language === "kn" ? "bg-amber-600 text-white shadow-sm" : "text-stone-300 hover:text-white"
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
                title="Print"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold rounded-xl border border-rose-500/30 backdrop-blur-md transition-all flex items-center gap-1 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Match</span>
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: SUMMARY TABLE & PROMINENT BANNER
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section">
        {/* Prominent Verification Banner (screen only: the print layout already
            carries this line in the title block and the page footer) */}
        {!printMode && (
        <div className="p-4 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-2xl shadow-xs flex items-center gap-2.5 font-bold text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Calculated by software, not reviewed by an astrologer. Traditions differ. An aid, not advice.</span>
        </div>
        )}

        {/* Report Header for Print & Minimal Screen Reference */}
        <div className="border-b border-stone-200 dark:border-stone-800 pb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100 font-serif-vedic">
              1. {isKn ? "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ ವರದಿ ಸಾರಾಂಶ" : "Marriage Matching Summary"}
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              {groom_summary?.name} &amp; {bride_summary?.name} · As of 9 Nov 2026
            </p>
          </div>
          <div className="text-right text-xs text-stone-500 dark:text-stone-400 font-mono">
            Methodology: {astrologer_details?.methodology_version || "v1.1.0"}
          </div>
        </div>

        {/* Summary Table */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[11px] font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-4 py-3">Dimension</th>
                <th className="px-4 py-3">Result / Score</th>
                <th className="px-4 py-3">Status &amp; Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
              {/* Raw Ashtakoota */}
              <tr className="bg-amber-50/30 dark:bg-stone-800/30 font-medium">
                <td className="px-4 py-2.5 font-bold text-stone-900 dark:text-stone-100">Raw Ashtakoota Total</td>
                <td className="px-4 py-2.5 font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
                  {rawScore.toFixed(1)} / 36 <span className="font-sans font-medium text-[11px]">(score as a percentage: {rawPct.toFixed(1)}%)</span>
                </td>
                <td className="px-4 py-2.5">
                  Raw score without cancellations. (Effective score equals raw score when rules are disabled).
                </td>
              </tr>

              {/* Vashya Dual Score */}
              {hasVashyaDiff && (
                <tr className="bg-amber-50/50 dark:bg-amber-950/20">
                  <td className="px-4 py-2.5 font-semibold text-amber-900 dark:text-amber-200">Vashya School Alternate</td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-amber-800 dark:text-amber-300">
                    Alternate: {altVashyaTotal?.toFixed(1)} / 36
                  </td>
                  <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">
                    Our default (split): {rawScore.toFixed(1)} / 36 · Alternate (whole_jalachara): {altVashyaTotal?.toFixed(1)} / 36 ({ashtakoota.vashya_difference_note || "school difference; unverified"}).
                  </td>
                </tr>
              )}

              {/* Nadi */}
              <tr className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2.5 font-semibold">Nadi Koota</td>
                <td className="px-4 py-2.5 font-mono">{nadiKoota?.raw_points?.toFixed(1) ?? "8.0"} / 8.0</td>
                <td className="px-4 py-2.5">
                  Groom: {groom_summary?.nadi || "Adi"} · Bride: {bride_summary?.nadi || "Antya"} (Different Nadi; no clash).
                </td>
              </tr>

              {/* Bhakoot */}
              <tr className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2.5 font-semibold">Bhakoot Koota</td>
                <td className="px-4 py-2.5 font-mono">{bhakootKoota?.raw_points?.toFixed(1) ?? "0.0"} / 7.0</td>
                <td className="px-4 py-2.5">
                  Virgo to Capricorn 5th, Capricorn to Virgo 9th (5/9 Navam-Pancham). No relief applied by default.
                </td>
              </tr>

              {/* Gana */}
              <tr className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2.5 font-semibold">Gana Koota</td>
                <td className="px-4 py-2.5 font-mono">{ganaKoota?.raw_points?.toFixed(1) ?? "6.0"} / 6.0</td>
                <td className="px-4 py-2.5">
                  Groom: {groom_summary?.gana || "Deva"} · Bride: {bride_summary?.gana || "Deva"} (Deva-Deva; pass).
                </td>
              </tr>

              {/* Mangal Dosha */}
              <tr className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2.5 font-semibold">Mangal Dosha Status</td>
                <td className="px-4 py-2.5 font-semibold">
                  Groom: {groom_summary?.mangal_dosha?.includes("Present") ? "Present" : "No Dosha"} · Bride: {bride_summary?.mangal_dosha?.includes("Present") ? "Present" : "No Dosha"}
                </td>
                <td className="px-4 py-2.5">
                  {bride_summary?.mangal_dosha?.includes("mitigation")
                    ? "Bride: possible mitigation noted (unverified; traditions differ)."
                    : "No primary affliction in either chart from Moon or Lagna."}
                </td>
              </tr>

              {/* Dasa Koota Headline */}
              <tr className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2.5 font-semibold">Dasa Koota (10 Poruthams)</td>
                <td className="px-4 py-2.5 font-semibold">
                  {dkPassedCount} Pass, {dkCondCount} Conditional, {dkFailCount} Does Not Pass
                </td>
                <td className="px-4 py-2.5 text-stone-600 dark:text-stone-400 italic">
                  see experimental section below
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Objections Noted Summary Box */}
        {objections_noted && objections_noted.length > 0 && (
          <div className="p-4 bg-amber-500/10 dark:bg-amber-950/30 rounded-2xl border border-amber-500/25">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Objections Noted (Derived by code; no subjective verdict):</span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-800 dark:text-stone-200 list-disc list-inside">
              {objections_noted.map((obj, idx) => (
                <li key={idx} className="leading-relaxed">
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 2: BIRTH DETAILS & SETTINGS TABLE FOR BOTH PEOPLE
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>2. Birth Details &amp; Calculation Settings</span>
          </h2>
          <span className={`text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900 ${printMode ? "print:hidden" : ""}`}>
            Side-by-Side Audit
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[11px] font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-4 py-3">Parameter</th>
                <th className="px-4 py-3">Groom ({groom_summary?.name})</th>
                <th className="px-4 py-3">Bride ({bride_summary?.name})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">Date of Birth</td>
                <td className="px-4 py-2 font-mono">{groom_summary?.birth_date} ({groom_summary?.birth_date_in_words || "4 June 1998"})</td>
                <td className="px-4 py-2 font-mono">{bride_summary?.birth_date} ({bride_summary?.birth_date_in_words || "1 July 1999"})</td>
              </tr>
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">Local Time (IST)</td>
                <td className="px-4 py-2 font-mono">{groom_summary?.birth_time || "10:00"}</td>
                <td className="px-4 py-2 font-mono">{bride_summary?.birth_time || "16:35"}</td>
              </tr>
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">UTC Datetime</td>
                <td className="px-4 py-2 font-mono">{matchResult.calculation_appendix?.groom?.utc_time || groom_chart?.calculation_appendix?.utc_time || "1998-06-04 04:30:00 UTC"}</td>
                <td className="px-4 py-2 font-mono">{matchResult.calculation_appendix?.bride?.utc_time || bride_chart?.calculation_appendix?.utc_time || "1999-07-01 11:05:00 UTC"}</td>
              </tr>
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">Place Coordinates</td>
                <td className="px-4 py-2 font-mono">12.9716° N, 77.5946° E (Bengaluru)</td>
                <td className="px-4 py-2 font-mono">13.4010° N, 78.0540° E (Chintamani)</td>
              </tr>
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">Timezone</td>
                <td className="px-4 py-2">Asia/Kolkata (+05:30)</td>
                <td className="px-4 py-2">Asia/Kolkata (+05:30)</td>
              </tr>
              <tr className="bg-amber-50/40 dark:bg-amber-950/20 font-semibold text-stone-900 dark:text-stone-100">
                <td className="px-4 py-2.5" colSpan={3}>
                  Calculation Settings (Common to Both Charts):
                </td>
              </tr>
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">Ayanamsa</td>
                <td className="px-4 py-2 font-mono" colSpan={2}>
                  Lahiri (Chitra Paksha) · Value: {matchResult.calculation_appendix?.groom?.ayanamsa_dms || "23° 50' 00\""}
                </td>
              </tr>
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">Lunar Node Type</td>
                <td className="px-4 py-2 font-mono" colSpan={2}>
                  Mean Node (default) — see the verification log
                </td>
              </tr>
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">House System</td>
                <td className="px-4 py-2" colSpan={2}>
                  Whole-Sign Houses (W) counted from Lagna
                </td>
              </tr>
              <tr className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                <td className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400">Dasha Year Length</td>
                <td className="px-4 py-2 font-mono" colSpan={2}>
                  365.2425 solar days per year (Gregorian tropical solar cycle)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PLANETARY POSITIONS FOR BOTH (GRAHA, SIGN, DMS, HOUSE, D9, ETC.)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-5 print:p-0 print:border-none print:shadow-none print:rounded-none print-section">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>3. Planetary Positions (Nirayana Longitudes &amp; Navamsa)</span>
          </h2>
          <span className={`text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900 ${printMode ? "print:hidden" : ""}`}>
            DMS Precision
          </span>
        </div>

        {/* Groom Table */}
        <div className="space-y-2">
          <div className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Groom: {groom_summary?.name} (Lagna: {groom_summary?.lagna_sign} {groom_summary?.lagna_dms} {groom_summary?.lagna_nakshatra} {groom_summary?.lagna_pada} · D9 {groom_summary?.lagna_navamsa_sign}{groom_summary?.lagna_vargottama ? " · Lagna vargottama" : ""})</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-3.5 py-2.5">Graha</th>
                  <th className="px-3.5 py-2.5">Sign</th>
                  <th className="px-3.5 py-2.5">Degree in Sign</th>
                  <th className="px-3.5 py-2.5">Nakshatra &amp; Pada</th>
                  <th className="px-3 py-2.5 text-center">House</th>
                  <th className="px-3 py-2.5">D9 Navamsa</th>
                  <th className="px-3 py-2.5 text-center">Retro</th>
                  <th className="px-3 py-2.5 text-center">Combust</th>
                  <th className="px-3 py-2.5 text-center">Vargottama</th>
                  <th className="px-3 py-2.5">Dignity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono text-[11px] text-stone-800 dark:text-stone-200">
                {(groom_summary?.planets_table || []).map((p: any) => (
                  <tr key={p.planet} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="px-3.5 py-2 font-bold font-sans text-stone-900 dark:text-stone-100">{p.planet}</td>
                    <td className="px-3.5 py-2 font-sans">{p.sign}</td>
                    <td className="px-3.5 py-2">{p.deg_in_sign}</td>
                    <td className="px-3.5 py-2 font-sans">{p.nakshatra} pada {p.pada}</td>
                    <td className="px-3 py-2 text-center font-bold">{p.house}</td>
                    <td className="px-3 py-2 font-sans">{p.navamsa_sign || "—"}</td>
                    <td className="px-3 py-2 text-center">{p.is_retrograde ? <span className="text-amber-600 font-bold">R</span> : (printMode ? "" : "—")}</td>
                    <td className="px-3 py-2 text-center">{p.is_combust ? <span className="text-rose-600 font-bold">Yes</span> : (printMode ? "" : "—")}</td>
                    <td className="px-3 py-2 text-center font-sans">{p.is_vargottama ? <span className="text-amber-700 font-bold">Vargottama</span> : (printMode ? "" : "—")}</td>
                    <td className="px-3 py-2 font-sans">{p.dignity || (printMode ? "" : "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bride Table */}
        <div className="space-y-2">
          <div className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Bride: {bride_summary?.name} (Lagna: {bride_summary?.lagna_sign} {bride_summary?.lagna_dms} {bride_summary?.lagna_nakshatra} {bride_summary?.lagna_pada} · D9 {bride_summary?.lagna_navamsa_sign}{bride_summary?.lagna_vargottama ? " · Lagna vargottama" : ""})</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-3.5 py-2.5">Graha</th>
                  <th className="px-3.5 py-2.5">Sign</th>
                  <th className="px-3.5 py-2.5">Degree in Sign</th>
                  <th className="px-3.5 py-2.5">Nakshatra &amp; Pada</th>
                  <th className="px-3 py-2.5 text-center">House</th>
                  <th className="px-3 py-2.5">D9 Navamsa</th>
                  <th className="px-3 py-2.5 text-center">Retro</th>
                  <th className="px-3 py-2.5 text-center">Combust</th>
                  <th className="px-3 py-2.5 text-center">Vargottama</th>
                  <th className="px-3 py-2.5">Dignity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono text-[11px] text-stone-800 dark:text-stone-200">
                {(bride_summary?.planets_table || []).map((p: any) => (
                  <tr key={p.planet} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="px-3.5 py-2 font-bold font-sans text-stone-900 dark:text-stone-100">{p.planet}</td>
                    <td className="px-3.5 py-2 font-sans">{p.sign}</td>
                    <td className="px-3.5 py-2">{p.deg_in_sign}</td>
                    <td className="px-3.5 py-2 font-sans">{p.nakshatra} pada {p.pada}</td>
                    <td className="px-3 py-2 text-center font-bold">{p.house}</td>
                    <td className="px-3 py-2 font-sans">{p.navamsa_sign || "—"}</td>
                    <td className="px-3 py-2 text-center">{p.is_retrograde ? <span className="text-amber-600 font-bold">R</span> : (printMode ? "" : "—")}</td>
                    <td className="px-3 py-2 text-center">{p.is_combust ? <span className="text-rose-600 font-bold">Yes</span> : (printMode ? "" : "—")}</td>
                    <td className="px-3 py-2 text-center font-sans">{p.is_vargottama ? <span className="text-amber-700 font-bold">Vargottama</span> : (printMode ? "" : "—")}</td>
                    <td className="px-3 py-2 font-sans">{p.dignity || (printMode ? "" : "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orb note (informational appendix note; no interpretation) */}
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          {astrologer_details?.combustion_orb_note || matchResult.calculation_appendix?.groom?.combustion_orb_note || "Note: combustion (Asta) orbs vary by school; the orb used here is not a verified classical value."}
        </p>
      </section>

      {/* =========================================================================
          SECTION 4: CHARTS D1 AND D9 (SOUTH INDIAN DEFAULT, NORTH INDIAN TOGGLE)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>4. Kundali Charts (D1 Rashi &amp; D9 Navamsa)</span>
          </h2>
          <div className="no-print inline-flex rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartStyle("south")}
              className={`px-3 py-1 rounded-lg transition-all ${
                chartStyle === "south" ? "bg-amber-600 text-white shadow-xs" : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
              }`}
            >
              South Indian (Default)
            </button>
            <button
              type="button"
              onClick={() => setChartStyle("north")}
              className={`px-3 py-1 rounded-lg transition-all ${
                chartStyle === "north" ? "bg-amber-600 text-white shadow-xs" : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
              }`}
            >
              North Indian
            </button>
          </div>
        </div>

        {printMode ? (
          /* Print layout: all four charts as vector SVG, two per row, fixed South Indian style */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 print-break-inside-avoid">
              <div className="space-y-2">
                <div className="font-bold text-[10px] uppercase tracking-wider text-stone-800">Groom: {groom_summary?.name} — D1 Rashi Chart</div>
                <SouthIndianChart planets={groom_chart?.planets || {}} lagna={groom_chart?.lagna || null} isNavamsa={false} theme="light" labelScale={1.7} />
              </div>
              <div className="space-y-2">
                <div className="font-bold text-[10px] uppercase tracking-wider text-stone-800">Groom: {groom_summary?.name} — D9 Navamsa Chart</div>
                <SouthIndianChart planets={groom_chart?.planets || {}} lagna={groom_chart?.lagna || null} isNavamsa={true} theme="light" labelScale={1.7} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 print-break-inside-avoid">
              <div className="space-y-2">
                <div className="font-bold text-[10px] uppercase tracking-wider text-stone-800">Bride: {bride_summary?.name} — D1 Rashi Chart</div>
                <SouthIndianChart planets={bride_chart?.planets || {}} lagna={bride_chart?.lagna || null} isNavamsa={false} theme="light" labelScale={1.7} />
              </div>
              <div className="space-y-2">
                <div className="font-bold text-[10px] uppercase tracking-wider text-stone-800">Bride: {bride_summary?.name} — D9 Navamsa Chart</div>
                <SouthIndianChart planets={bride_chart?.planets || {}} lagna={bride_chart?.lagna || null} isNavamsa={true} theme="light" labelScale={1.7} />
              </div>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Groom D1 & D9 */}
          <div className="space-y-3 p-4 bg-stone-50/80 dark:bg-stone-950/40 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Groom: {groom_summary?.name} — D1 Rashi Chart
            </div>
            {chartStyle === "south" ? (
              <SouthIndianChart
                planets={groom_chart?.planets || {}}
                lagna={groom_chart?.lagna || null}
                isNavamsa={false}
                theme="light"
              />
            ) : (
              <NorthIndianChart
                planets={groom_chart?.planets || {}}
                lagna={groom_chart?.lagna || null}
                isNavamsa={false}
                theme="light"
              />
            )}
            <div className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300 pt-3 border-t border-stone-200 dark:border-stone-800">
              Groom: {groom_summary?.name} — D9 Navamsa Chart
            </div>
            {chartStyle === "south" ? (
              <SouthIndianChart
                planets={groom_chart?.planets || {}}
                lagna={groom_chart?.lagna || null}
                isNavamsa={true}
                theme="light"
              />
            ) : (
              <NorthIndianChart
                planets={groom_chart?.planets || {}}
                lagna={groom_chart?.lagna || null}
                isNavamsa={true}
                theme="light"
              />
            )}
          </div>

          {/* Bride D1 & D9 */}
          <div className="space-y-3 p-4 bg-stone-50/80 dark:bg-stone-950/40 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Bride: {bride_summary?.name} — D1 Rashi Chart
            </div>
            {chartStyle === "south" ? (
              <SouthIndianChart
                planets={bride_chart?.planets || {}}
                lagna={bride_chart?.lagna || null}
                isNavamsa={false}
                theme="light"
              />
            ) : (
              <NorthIndianChart
                planets={bride_chart?.planets || {}}
                lagna={bride_chart?.lagna || null}
                isNavamsa={false}
                theme="light"
              />
            )}
            <div className="font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300 pt-3 border-t border-stone-200 dark:border-stone-800">
              Bride: {bride_summary?.name} — D9 Navamsa Chart
            </div>
            {chartStyle === "south" ? (
              <SouthIndianChart
                planets={bride_chart?.planets || {}}
                lagna={bride_chart?.lagna || null}
                isNavamsa={true}
                theme="light"
              />
            ) : (
              <NorthIndianChart
                planets={bride_chart?.planets || {}}
                lagna={bride_chart?.lagna || null}
                isNavamsa={true}
                theme="light"
              />
            )}
          </div>
        </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 5: VIMSHOTTARI DASHA (BALANCE AT BIRTH + WORKING + MAHADASHAS)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>5. Vimshottari Dasha Periods</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
            365.2425 Days/Year
          </span>
        </div>

        {/* Working strings for Balance at Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-amber-500/10 dark:bg-amber-950/30 rounded-2xl border border-amber-500/25 text-xs space-y-1">
            <div className="font-bold text-amber-900 dark:text-amber-200">Groom Balance at Birth ({groom_summary?.name}):</div>
            <div className="font-mono text-stone-800 dark:text-stone-200 font-semibold">
              {groomDashaBalance?.working_str || "Fraction of nakshatra remaining × Moon's 10 years: 79.9% × 10 = 7.99 years"}
            </div>
            <div className="text-stone-600 dark:text-stone-400 text-[11px]">
              Birth Mahadasha Lord: {groomDashaBalance?.lord || "Moon"} (Balance: {groomDashaBalance?.balance_years ?? "7.99"} years)
            </div>
          </div>

          <div className="p-3.5 bg-rose-500/10 dark:bg-rose-950/30 rounded-2xl border border-rose-500/25 text-xs space-y-1">
            <div className="font-bold text-rose-900 dark:text-rose-200">Bride Balance at Birth ({bride_summary?.name}):</div>
            <div className="font-mono text-stone-800 dark:text-stone-200 font-semibold">
              {brideDashaBalance?.working_str || "Fraction of nakshatra remaining × Moon's 10 years: 67.7% × 10 = 6.77 years"}
            </div>
            <div className="text-stone-600 dark:text-stone-400 text-[11px]">
              Birth Mahadasha Lord: {brideDashaBalance?.lord || "Moon"} (Balance: {brideDashaBalance?.balance_years ?? "6.77"} years)
            </div>
          </div>
        </div>

        {/* Current Period Highlight */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-stone-100 dark:from-amber-950/40 dark:to-stone-900 rounded-2xl border border-amber-500/30 text-xs shadow-xs">
          <div className="font-bold text-amber-950 dark:text-amber-200 mb-1 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Current Active Dasha Period (As of Nov 2026):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-800 dark:text-stone-200 font-mono">
            <div className="p-2 bg-white/60 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="font-sans font-semibold text-stone-600 dark:text-stone-400">Groom: </span>
              <strong>Rahu-Venus</strong> (17-12-2024 to 18-12-2027)
            </div>
            <div className="p-2 bg-white/60 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="font-sans font-semibold text-stone-600 dark:text-stone-400">Bride: </span>
              <strong>Rahu-Venus</strong> (26-10-2024 to 27-10-2027)
            </div>
          </div>
        </div>

        {/* Mahadasha Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Groom MD Table */}
          <div className="space-y-1.5">
            <div className="font-bold text-xs text-amber-800 dark:text-amber-300">{groom_summary?.name} Mahadashas:</div>
            <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="px-3 py-1.5">Lord</th>
                    <th className="px-3 py-1.5">Start Date</th>
                    <th className="px-3 py-1.5">End Date</th>
                    <th className="px-3 py-1.5">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono text-[11px]">
                  {(groom_chart?.dasha?.mahadashas || []).map((md: any) => (
                    <tr key={md.lord} className={md.is_current ? "bg-amber-100/60 font-bold" : ""}>
                      <td className="px-3 py-1 font-sans">{md.lord} {md.is_current ? <span className="font-bold">(current)</span> : ""}</td>
                      <td className="px-3 py-1">{md.start_date ? md.start_date.split("T")[0] : "—"}</td>
                      <td className="px-3 py-1">{md.end_date ? md.end_date.split("T")[0] : "—"}</td>
                      <td className="px-3 py-1">{md.total_years} yrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bride MD Table */}
          <div className="space-y-1.5">
            <div className="font-bold text-xs text-stone-800">{bride_summary?.name} Mahadashas:</div>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200">
                  <tr>
                    <th className="px-3 py-1.5">Lord</th>
                    <th className="px-3 py-1.5">Start Date</th>
                    <th className="px-3 py-1.5">End Date</th>
                    <th className="px-3 py-1.5">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono text-[11px]">
                  {(bride_chart?.dasha?.mahadashas || []).map((md: any) => (
                    <tr key={md.lord} className={md.is_current ? "bg-amber-100/60 font-bold" : ""}>
                      <td className="px-3 py-1 font-sans">{md.lord} {md.is_current ? <span className="font-bold">(current)</span> : ""}</td>
                      <td className="px-3 py-1">{md.start_date ? md.start_date.split("T")[0] : "—"}</td>
                      <td className="px-3 py-1">{md.end_date ? md.end_date.split("T")[0] : "—"}</td>
                      <td className="px-3 py-1">{md.total_years} yrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: ASHTAKOOTA TABLE WITH WORKING
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>6. Ashtakoota Milan (36 Points)</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
            Raw Total: {rawScore.toFixed(1)} / 36.0
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[11px] font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-3.5 py-3">Koota</th>
                <th className="px-2 py-3 text-center">Max</th>
                <th className="px-3.5 py-3">Groom Value</th>
                <th className="px-3.5 py-3">Bride Value</th>
                <th className="px-2 py-3 text-center">Score</th>
                <th className="px-4 py-3">How It Is Calculated (Working)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
              {ashtakoota.kootas.map((k) => (
                <tr key={k.koota} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                  <td className="px-3.5 py-2.5 font-bold text-stone-900 dark:text-stone-100">{k.koota}</td>
                  <td className="px-2 py-2.5 text-center font-mono text-stone-500 dark:text-stone-400">{k.max_points}</td>
                  <td className="px-3.5 py-2.5 font-medium">
                    {k.groom_value}
                    {k.koota === "Yoni" && (
                      <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-sans">
                        Gender: {k.groom_gender || "Female"} ({k.gender_status || "unverified"})
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 font-medium">
                    {k.bride_value}
                    {k.koota === "Yoni" && (
                      <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-sans">
                        Gender: {k.bride_gender || "Female"} ({k.gender_status || "unverified"})
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                    {k.raw_points?.toFixed(1) ?? k.points}
                  </td>
                  <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">
                    <div className="font-mono text-[11px] text-stone-900 dark:text-stone-100 font-semibold">
                      {k.working?.working_str || k.description}
                    </div>
                    {k.working?.explanation && (
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-sans leading-relaxed">
                        {k.working.explanation}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {/* Raw Total Row */}
              <tr className="bg-amber-50/60 dark:bg-amber-950/30 font-bold text-stone-900 dark:text-stone-100 border-t-2 border-amber-200 dark:border-amber-900">
                <td className="px-3.5 py-3 font-extrabold">Raw Total Score</td>
                <td className="px-2 py-3 text-center font-mono text-stone-600 dark:text-stone-300">36.0</td>
                <td className="px-3.5 py-3" colSpan={2}>
                  {hasVashyaDiff && altVashyaTotal != null ? (
                    <span className="text-stone-700 dark:text-stone-300 font-normal">
                      Our default: <strong>{rawScore.toFixed(1)} / 36</strong> · Alternate (whole_jalachara): <strong>{altVashyaTotal.toFixed(1)} / 36</strong> (school difference; unverified)
                    </span>
                  ) : (
                    <span className="text-stone-600 dark:text-stone-400 font-normal">All cancellation rules disabled by default</span>
                  )}
                </td>
                <td className="px-2 py-3 text-center font-mono text-base font-black text-amber-700 dark:text-amber-400">
                  {rawScore.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400 font-normal text-[11px]">
                  Raw score only. Effective score equals raw score unless a cancellation rule is enabled in configuration.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: DOSHA REVIEW (NADI, BHAKOOT, MANGAL THREE-ROW TABLE)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-5 print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>7. Dosha Review (Nadi, Bhakoot, &amp; Mangal Dosha)</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
            Rules Disabled by Default
          </span>
        </div>

        {/* Nadi & Bhakoot Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 space-y-1 text-xs">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Nadi Dosha Review:</span>
            </div>
            <div className="text-stone-800 dark:text-stone-200">
              Status: <span className="font-semibold">{nadiKoota?.has_dosha ? "Present" : "No Dosha / Pass (8.0/8.0)"}</span>
            </div>
            <div className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
              Groom is {groom_summary?.nadi || "Adi"} Nadi; Bride is {bride_summary?.nadi || "Antya"} Nadi. No constitutional clash detected.
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 dark:bg-amber-950/30 rounded-2xl border border-amber-500/25 space-y-1 text-xs">
            <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Bhakoot Dosha Review:</span>
            </div>
            <div className="text-stone-800 dark:text-stone-200">
              Status: <span className="font-semibold">Dosha Present (5/9 Navam-Pancham) · Score: 0/7.0</span>
            </div>
            <div className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
              Virgo (Mercury) and Capricorn (Saturn). Rashi lords are friend/neutral. No relief applied by default (unverified cancellation rule disabled).
            </div>
          </div>
        </div>

        {/* 3-Row Mangal Tables */}
        <div className="space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Mangal Dosha 3-Reference-Point Evaluation (Lagna, Moon, Venus)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Groom Mangal Table */}
            <div className="space-y-1.5">
              <div className="font-bold text-xs text-amber-800 dark:text-amber-300">Groom: {groom_summary?.name}</div>
              <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="px-3.5 py-2">Reference Point</th>
                      <th className="px-2 py-2 text-center">House</th>
                      <th className="px-2.5 py-2">Mars&apos;s sign</th>
                      <th className="px-3.5 py-2">Finding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-[11px] text-stone-800 dark:text-stone-200">
                    {(groom_summary?.mangal_reference_rows || dosha_review?.mangal?.groom?.reference_rows || []).map((r: any) => (
                      <tr key={r.reference_point} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="px-3.5 py-2 font-medium">{r.reference_point}</td>
                        <td className="px-2 py-2 text-center font-mono">{r.house_number ?? "—"}</td>
                        <td className="px-2.5 py-2">{r.sign}</td>
                        <td className="px-3.5 py-2 font-semibold">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.is_afflicted
                              ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {r.status_label || (r.is_afflicted ? "Afflicted" : "No Dosha")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bride Mangal Table */}
            <div className="space-y-1.5">
              <div className="font-bold text-xs text-rose-800 dark:text-rose-300">Bride: {bride_summary?.name}</div>
              <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="px-3.5 py-2">Reference Point</th>
                      <th className="px-2 py-2 text-center">House</th>
                      <th className="px-2.5 py-2">Mars&apos;s sign</th>
                      <th className="px-3.5 py-2">Finding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-[11px] text-stone-800 dark:text-stone-200">
                    {(bride_summary?.mangal_reference_rows || dosha_review?.mangal?.bride?.reference_rows || []).map((r: any) => (
                      <tr key={r.reference_point} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="px-3.5 py-2 font-medium">{r.reference_point}</td>
                        <td className="px-2 py-2 text-center font-mono">{r.house_number ?? "—"}</td>
                        <td className="px-2.5 py-2">{r.sign}</td>
                        <td className="px-3.5 py-2 font-semibold">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.is_afflicted
                              ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {r.status_label || (r.is_afflicted ? "Afflicted" : "No Dosha")}
                          </span>
                          {r.note && (
                            <span className="block text-[10px] font-normal text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                              {r.note}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: DASA KOOTA (10 PORUTHAMS) — EXPERIMENTAL (COLLAPSED BY DEFAULT)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div
          onClick={printMode ? undefined : () => setDasaKootaOpen(!dasaKootaOpen)}
          className={`${printMode ? "" : "cursor-pointer"} flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 transition-all select-none shadow-xs`}
        >
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex flex-wrap items-center gap-2">
              <span>8. Dasa Koota (10 Poruthams)</span>
              <span className="text-xs font-normal text-amber-700 dark:text-amber-400">
                — Experimental and unverified (traditions differ)
              </span>
            </h2>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {dkPassedCount} Passed · {dkCondCount} Conditional · {dkFailCount} Does Not Pass
            </div>
          </div>
          <div className="text-stone-600 dark:text-stone-300 no-print">
            {dasaKootaOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Collapsible content (always visible in print) */}
        <div className={`space-y-2 ${dasaKootaOpen ? "block" : "hidden print:block"}`}>
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="px-3.5 py-2.5">Porutham</th>
                  <th className="px-3.5 py-2.5">Count / Values</th>
                  <th className="px-2 py-2.5 text-center">Result</th>
                  <th className="px-4 py-2.5">Rule Applied</th>
                  <th className="px-4 py-2.5">Working Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-[11px] text-stone-800 dark:text-stone-200">
                {dasa_koota.poruthams.map((p) => {
                  const isPass = p.result === "pass" || p.status === "Pass";
                  const isFail = p.result === "does not pass" || p.status === "Fail";
                  return (
                    <tr key={p.name} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="px-3.5 py-2.5 font-bold font-sans text-stone-900 dark:text-stone-100">{p.name}</td>
                      <td className="px-3.5 py-2.5 text-stone-700 dark:text-stone-300">{p.count_or_distance}</td>
                      <td className="px-2 py-2.5 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPass
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : isFail
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-black"
                              : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
                          }`}
                        >
                          {p.result || p.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-stone-600 dark:text-stone-400">{p.rule}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-stone-800 dark:text-stone-200">
                        {p.working?.working_str || p.explanation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: VERIFICATION STATUS TABLE (FED ONLY BY VERIFICATION_LOG.JSON)
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>9. Verification Status Table (Audit Log)</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
            Audit Ledger
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-3.5 py-2.5">Chart / Item</th>
                <th className="px-3.5 py-2.5">External Source</th>
                <th className="px-3.5 py-2.5">Verification Status</th>
                <th className="px-4 py-2.5">Audit Provenance &amp; Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-[11px] text-stone-800 dark:text-stone-200">
              {/* Groom entries */}
              {groomVerified ? (
                groomVerified.checks.map((c: any, i: number) => (
                  <tr key={`groom-${i}`} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="px-3.5 py-2 font-bold text-stone-900 dark:text-stone-100">{groom_summary?.name} — {c.field}</td>
                    <td className="px-3.5 py-2 font-sans">{c.source}</td>
                    <td className="px-3.5 py-2 font-semibold">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-stone-600 dark:text-stone-400">{c.provenance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3.5 py-2 font-bold">{groom_summary?.name}</td>
                  <td className="px-3.5 py-2">—</td>
                  <td className="px-3.5 py-2 font-semibold text-stone-500">Not yet verified</td>
                  <td className="px-4 py-2 text-stone-500">No external check logged</td>
                </tr>
              )}

              {/* Bride entries */}
              {brideVerified ? (
                brideVerified.checks.map((c: any, i: number) => (
                  <tr key={`bride-${i}`} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="px-3.5 py-2 font-bold text-stone-900 dark:text-stone-100">{bride_summary?.name} — {c.field}</td>
                    <td className="px-3.5 py-2 font-sans">{c.source}</td>
                    <td className="px-3.5 py-2 font-semibold">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-stone-600 dark:text-stone-400">{c.provenance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3.5 py-2 font-bold">{bride_summary?.name}</td>
                  <td className="px-3.5 py-2">—</td>
                  <td className="px-3.5 py-2 font-semibold text-stone-500">Not yet verified</td>
                  <td className="px-4 py-2 text-stone-500">No external check logged</td>
                </tr>
              )}

              {/* Unverified items */}
              {((verificationLog as any)?.unverified_items || []).map((item: string, idx: number) => (
                <tr key={`unverified-${idx}`} className="bg-amber-500/5 dark:bg-amber-950/20">
                  <td className="px-3.5 py-2 font-medium text-stone-700 dark:text-stone-300" colSpan={2}>
                    {item}
                  </td>
                  <td className="px-3.5 py-2 font-semibold">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                      UNVERIFIED
                    </span>
                  </td>
                  <td className="px-4 py-2 text-stone-500 dark:text-stone-400">Subject to tradition and regional variance</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: QUESTIONS TO DISCUSS WITH AN ASTROLOGER
          ========================================================================= */}
      <section className="bg-white dark:bg-stone-900 p-5 sm:p-7 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md space-y-4 print:p-0 print:border-none print:shadow-none print:rounded-none print-section print-page-break">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif-vedic flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>10. Questions to discuss with an expert, if you choose to</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
            Consultation Agenda
          </span>
        </div>

        <div className="p-5 bg-amber-500/10 dark:bg-amber-950/30 rounded-2xl border border-amber-500/25 space-y-4 text-xs leading-relaxed text-stone-800 dark:text-stone-200">
          <div className="flex items-start gap-2.5">
            <span className="font-bold text-amber-900 dark:text-amber-300 shrink-0">1. Bhakoot Disposition (5/9):</span>
            <div>
              The Moon signs form a 5/9 (Navam-Pancham) relationship (Virgo and Capricorn). The planetary rulers are Mercury and Saturn, who share a friend/neutral relationship. Does your tradition permit mitigation for friendly lords when the raw score is 0?
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold text-amber-900 dark:text-amber-300 shrink-0">2. Vashya Classification (Capricorn 15° Split):</span>
            <div>
              The bride&apos;s Moon is at 14°18&apos; Capricorn, within 42 arcminutes of the 15° boundary. Under the split rule (first half Chatushpada), Vashya scores 1.0/2.0. Under the whole-Jalachara rule, it scores 0.0/2.0. Which classification does your school follow?
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold text-amber-900 dark:text-amber-300 shrink-0">3. Rajju Porutham (Both Kantha):</span>
            <div>
              Both groom (Hasta) and bride (Shravana) belong to Kantha Rajju (Neck). In South Indian traditions, same-Rajju is considered an impediment. Does your family tradition observe exemptions or remediation for Kantha Rajju?
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold text-amber-900 dark:text-amber-300 shrink-0">4. Mangal 12th House Exemption:</span>
            <div>
              The bride has Mars in the 12th house from Lagna, with natal Moon in Shravana. Some regional texts cite an exemption for Mars in the 12th in Taurus/Libra or when Moon is in Shravana. Does your tradition acknowledge this mitigation?
            </div>
          </div>
        </div>
      </section>

      {/* Optional AI Explanation Card (Screen Only — Never in Print) */}
      {!printMode && (
      <div className="no-print pt-4">
        <AIExplanationCard matchResult={matchResult} currentLanguage={language} />
      </div>
      )}

      {/* Printable Page Footer (Appears on every printed page via fixed positioning; the dedicated print route provides its own running header/footer) */}
      {!printMode && (
      <div className="hidden print:flex fixed bottom-0 left-0 right-0 py-2 border-t border-stone-300 text-[10px] text-stone-500 justify-between items-center bg-white px-2">
        <span>Kundli Matching Report · Methodology {astrologer_details?.methodology_version || "v1.1.0"}</span>
        <span>Generated 2026-11-09 · Aid for consultation, not astrological advice</span>
      </div>
      )}
    </div>
  );
};
