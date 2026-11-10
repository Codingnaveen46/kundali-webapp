"use client";

import React, { useEffect, useRef, useState } from "react";
import { MarriageMatchPrintReport } from "@/components/reports/MarriageMatchPrintReport";
import { MarriageMatchResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Reference pair used when the report is opened directly (preview / demo). */
const REFERENCE_GROOM = {
  name: "Sample Groom",
  gender: "Male",
  birth_date: "1998-01-01",
  birth_time: "10:00",
  latitude: 12.9716,
  longitude: 77.5946,
  place_name: "Bengaluru, Karnataka, India",
  iana_timezone: "Asia/Kolkata",
  ayanamsa: "LAHIRI",
  node_type: "mean",
};
const REFERENCE_BRIDE = {
  name: "Sample Bride",
  gender: "Female",
  birth_date: "1999-01-01",
  birth_time: "16:35",
  latitude: 13.0,
  longitude: 78.0,
  place_name: "Karnataka, India",
  iana_timezone: "Asia/Kolkata",
  ayanamsa: "LAHIRI",
  node_type: "mean",
};

function sanitizeNamePart(name: string): string {
  return name.replace(/[.\s]+/g, "-").replace(/-+/g, "-").replace(/[^A-Za-z0-9\-]/g, "");
}

/**
 * Dedicated print route for the Marriage Matching report.
 * Uses exact 4-page layout matching Janma Kundali print standards.
 * Vector text, local fonts, zero banned words, browser print-to-PDF.
 */
export default function PrintMatchPage() {
  const [matchResult, setMatchResult] = useState<MarriageMatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGen, setIsGen] = useState(false);
  const [lang, setLang] = useState<"en" | "kn">("en");
  const [chartStyle, setChartStyle] = useState<"south" | "north">("south");
  const printTriggered = useRef(false);

  // Route flags + data: sessionStorage first (real user flow), then reference pair
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsGen(params.get("gen") === "1");
    setLang(params.get("lang") === "kn" ? "kn" : "en");
    setChartStyle(params.get("chart") === "north" ? "north" : "south");

    async function loadData() {
      const stored = sessionStorage.getItem("kundli:lastMatch");
      if (stored) {
        try {
          setMatchResult(JSON.parse(stored));
          return;
        } catch {
          /* fall through to reference fetch */
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groom: REFERENCE_GROOM,
            bride: REFERENCE_BRIDE,
            node_type: "mean",
            vashya_capricorn: "split",
          }),
        });
        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        setMatchResult(await res.json());
      } catch (err: any) {
        setError(err.message || "Failed to load match data for printing.");
      }
    }
    loadData();
  }, []);

  // File name via document.title
  useEffect(() => {
    if (!matchResult) return;
    const g = sanitizeNamePart(matchResult.groom_summary?.name || "Groom");
    const b = sanitizeNamePart(matchResult.bride_summary?.name || "Bride");
    const today = new Date().toISOString().slice(0, 10);
    document.title = `Kundli_${g}_x_${b}_Match_${today}`;
  }, [matchResult]);

  // Auto-open browser print dialog once rendered (user-driven path)
  useEffect(() => {
    if (!matchResult || isGen || printTriggered.current) return;
    printTriggered.current = true;
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, [matchResult, isGen]);

  return (
    <div
      className={[
        "print-doc--chapter",
        isGen ? "print-doc--gen" : "",
        lang === "kn" ? "print-doc--kn" : "",
        "print-doc--color",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Screen toolbar — never printed, excluded from print layout */}
      <div className="print-toolbar no-print">
        <div className="print-toolbar-title">
          <span>{lang === "kn" ? "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ" : "Marriage Matching"}</span>
          <span className="print-toolbar-badge">
            {lang === "kn" ? "ಮುದ್ರಣ ಪೂರ್ವವೀಕ್ಷಣೆ" : "Print Preview"}
          </span>
        </div>

        <div className="print-toolbar-controls">
          {/* Language Selector */}
          <div className="print-toolbar-item">
            <label htmlFor="tb-lang">{lang === "kn" ? "ಭಾಷೆ:" : "Language:"}</label>
            <select
              id="tb-lang"
              className="print-toolbar-select"
              value={lang}
              onChange={(e) => setLang(e.target.value === "kn" ? "kn" : "en")}
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          {/* Chart Style Selector */}
          <div className="print-toolbar-item">
            <label htmlFor="tb-chart">{lang === "kn" ? "ಕುಂಡಲಿ ಶೈಲಿ:" : "Chart style:"}</label>
            <select
              id="tb-chart"
              className="print-toolbar-select"
              value={chartStyle}
              onChange={(e) => setChartStyle(e.target.value === "north" ? "north" : "south")}
              aria-label="Chart style"
            >
              <option value="south">{lang === "kn" ? "ದಕ್ಷಿಣ ಭಾರತೀಯ" : "South Indian"}</option>
              <option value="north">{lang === "kn" ? "ಉತ್ತರ ಭಾರತೀಯ" : "North Indian"}</option>
            </select>
          </div>
        </div>

        <div className="print-toolbar-actions">
          <button
            type="button"
            className="print-toolbar-btn print-toolbar-btn--primary"
            onClick={() => window.print()}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: 6 }}
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            {lang === "kn" ? "ಮುದ್ರಿಸಿ (Print)" : "Print"}
          </button>
          <button
            type="button"
            className="print-toolbar-btn print-toolbar-btn--secondary"
            onClick={() => window.close()}
          >
            {lang === "kn" ? "ಮುಚ್ಚಿ" : "Close"}
          </button>
        </div>
      </div>

      {error && <p>Failed to load match data for printing: {error}</p>}

      {matchResult && (
        <MarriageMatchPrintReport
          matchResult={matchResult}
          printLanguage={lang}
          chartStyle={chartStyle}
        />
      )}
    </div>
  );
}
