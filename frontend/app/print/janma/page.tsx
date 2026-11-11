"use client";

import React, { useEffect, useRef, useState } from "react";
import { JanmaPrintReport } from "@/components/reports/JanmaPrintReport";
import { BirthChartResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Reference charts used when the report is opened directly (preview / demo). */
const REFERENCE_PERSONS: Record<string, any> = {
  "Sample Person 1": {
    name: "Sample Person 1",
    gender: "Male",
    birth_date: "1998-01-01",
    birth_time: "10:00",
    latitude: 12.9716,
    longitude: 77.5946,
    place_name: "Bengaluru, Karnataka, India",
    iana_timezone: "Asia/Kolkata",
    ayanamsa: "LAHIRI",
    house_system: "W",
    node_type: "mean",
  },
  "Sample Person 2": {
    name: "Sample Person 2",
    gender: "Female",
    birth_date: "1999-01-01",
    birth_time: "16:35",
    latitude: 13.0,
    longitude: 78.0,
    place_name: "Karnataka, India",
    iana_timezone: "Asia/Kolkata",
    ayanamsa: "LAHIRI",
    house_system: "W",
    node_type: "mean",
  },
};
const DEFAULT_PERSON = "Sample Person 1";

/**
 * Dedicated print route for the Janma Kundali report.
 * Same print layout rules as /print/match (user request B1/B11). The full
 * Phase 3 rollout of the birth report is pending; this route already renders
 * the report content only, in print layout, with the browser print-to-PDF.
 */
export default function PrintJanmaPage() {
  const [chart, setChart] = useState<BirthChartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGen, setIsGen] = useState(false);
  const [lang, setLang] = useState<"en" | "kn">("en");
  const [chartStyle, setChartStyle] = useState<"south" | "north">("south");
  const [person, setPerson] = useState<string | null>(null);
  /** A reference person explicitly requested via ?person= (PDF generator) or
   *  chosen in the toolbar. null = no explicit request: the user's own chart
   *  from sessionStorage (or, as a last resort, the default sample) is shown. */
  const [explicitPerson, setExplicitPerson] = useState<string | null>(null);
  const printTriggered = useRef(false);

  // Route flags: an explicit ?person= in the URL always wins (PDF generator
  // flow). Without it the page shows the user's own chart when one was
  // generated, falling back to the default sample only on direct opening.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsGen(params.get("gen") === "1");
    setLang(params.get("lang") === "kn" ? "kn" : "en");
    setChartStyle(params.get("chart") === "north" ? "north" : "south");
    const p = params.get("person");
    if (p && REFERENCE_PERSONS[p]) {
      setExplicitPerson(p);
      setPerson(p);
    } else {
      setExplicitPerson(null);
      setPerson(null);
    }
  }, []);


  useEffect(() => {
    async function loadData() {
      // 1. Explicit reference person (PDF generator ?person= or toolbar choice).
      if (explicitPerson && REFERENCE_PERSONS[explicitPerson]) {
        try {
          const payload = REFERENCE_PERSONS[explicitPerson];
          const res = await fetch(`${API_BASE_URL}/api/birth-chart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Backend error ${res.status}`);
          setChart(await res.json());
          return;
        } catch (err: any) {
          setError(err.message || "Failed to load birth chart data for printing.");
          return;
        }
      }

      // 2. Real user flow: the chart generated in the app this session.
      const stored = sessionStorage.getItem("kundli:lastBirthChart");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setChart(data);
          return;
        } catch {
          /* ignore; fall back to the default sample */
        }
      }

      // 3. Direct opening with no user chart in this session: default sample.
      try {
        const payload = REFERENCE_PERSONS[DEFAULT_PERSON];
        const res = await fetch(`${API_BASE_URL}/api/birth-chart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        setChart(await res.json());
      } catch (err: any) {
        setError(err.message || "Failed to load birth chart data for printing.");
      }
    }
    loadData();
  }, [person, explicitPerson]);

  useEffect(() => {
    if (!chart) return;
    const n = (chart.metadata?.name || "Kundali").replace(/[.\s]+/g, "-").replace(/[^A-Za-z0-9\-]/g, "");
    const today = new Date().toISOString().slice(0, 10);
    document.title = `Kundli_${n}_Janma_${today}`;
  }, [chart]);

  useEffect(() => {
    if (!chart || isGen || printTriggered.current) return;
    printTriggered.current = true;
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, [chart, isGen]);

  return (
    <div className={[
      "print-doc--chapter",
      isGen ? "print-doc--gen" : "",
      lang === "kn" ? "print-doc--kn" : "",
      "print-doc--color"
    ].filter(Boolean).join(" ")}>
      {/* Screen toolbar — never printed, excluded from the print layout rules. */}
      <div className="print-toolbar no-print">
        <div className="print-toolbar-title">
          <span>{lang === "kn" ? "ಜನ್ಮ ಕುಂಡಲಿ" : "Janma Kundali"}</span>
          <span className="print-toolbar-badge">{lang === "kn" ? "ಮುದ್ರಣ ಪೂರ್ವವೀಕ್ಷಣೆ" : "Print Preview"}</span>
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
          <span className="print-toolbar-hint">
            {lang === "kn" ? "ಸಂಭಾಷಣೆಯಲ್ಲಿ \"PDF ಆಗಿ ಉಳಿಸಿ\" ಆಯ್ಕೆಮಾಡಿ" : "Choose “Save as PDF” in the dialog"}
          </span>
          <button
            type="button"
            className="print-toolbar-btn print-toolbar-btn--primary"
            onClick={() => window.print()}
            title="Opens the print dialog — choose Save as PDF to download"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {lang === "kn" ? "PDF ಡೌನ್‌ಲೋಡ್" : "Download PDF"}
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

      {error && <p>Failed to load birth chart data for printing: {error}</p>}

      {chart && (
        <JanmaPrintReport
          chart={chart}
          printLanguage={lang}
          chartStyle={chartStyle}
          placeName={REFERENCE_PERSONS[explicitPerson || ""]?.place_name || (chart.metadata as any)?.place_name || (chart.metadata as any)?.place_of_birth}
        />
      )}
    </div>
  );
}
