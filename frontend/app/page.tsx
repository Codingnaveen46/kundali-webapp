"use client";

import React, { useState } from "react";
import { fetchBirthChart, fetchMarriageMatch } from "@/lib/api";
import { BirthChartResponse, MarriageMatchResponse, IntakeProfile } from "@/lib/types";
import { IntakePanel } from "@/components/intake/IntakePanel";
import { ManualFormData } from "@/components/intake/ManualForm";
import { BirthChartReport } from "@/components/reports/BirthChartReport";
import { MarriageMatchReport } from "@/components/reports/MarriageMatchReport";
import { exportReportToPdf } from "@/components/reports/PdfExporter";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConsentModal } from "@/components/ui/ConsentModal";
import { Footer } from "@/components/ui/Footer";
import { LanguageCode, TRANSLATIONS } from "@/i18n/translations";
import { Moon, Sun, Heart, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const [lang, setLang] = useState<LanguageCode>("en");
  const [activeTab, setActiveTab] = useState<"birth_chart" | "marriage_match">("birth_chart");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Birth Chart States
  const [birthChart, setBirthChart] = useState<BirthChartResponse | null>(null);
  const [isBirthChartLoading, setIsBirthChartLoading] = useState(false);
  const [birthChartError, setBirthChartError] = useState<string | null>(null);

  // Marriage Matching States
  const [groomData, setGroomData] = useState<ManualFormData | null>(null);
  const [brideData, setBrideData] = useState<ManualFormData | null>(null);
  const [groomInitialProfile, setGroomInitialProfile] = useState<IntakeProfile | null>(null);
  const [brideInitialProfile, setBrideInitialProfile] = useState<IntakeProfile | null>(null);
  const [matchResult, setMatchResult] = useState<MarriageMatchResponse | null>(null);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // Handler for single birth chart generation
  const handleGenerateBirthChart = async (formData: ManualFormData) => {
    setIsBirthChartLoading(true);
    setBirthChartError(null);
    try {
      const chart = await fetchBirthChart({
        name: formData.name,
        gender: formData.gender,
        birth_date: formData.birth_date,
        birth_time: formData.is_time_unknown ? undefined : formData.birth_time,
        is_time_unknown: formData.is_time_unknown,
        latitude: formData.latitude ?? undefined,
        longitude: formData.longitude ?? undefined,
        iana_timezone: formData.iana_timezone,
        ayanamsa: "LAHIRI",
        house_system: "W",
      });
      setBirthChart(chart);
    } catch (err: any) {
      setBirthChartError(err.message || "Failed to generate birth chart.");
    } finally {
      setIsBirthChartLoading(false);
    }
  };

  // Handler for marriage match generation
  const handleGenerateMarriageMatch = async () => {
    if (!groomData || !brideData) {
      setMatchError("Please complete and confirm both Groom and Bride profiles.");
      return;
    }
    setIsMatchLoading(true);
    setMatchError(null);
    try {
      const match = await fetchMarriageMatch({
        groom: {
          name: groomData.name,
          gender: groomData.gender,
          birth_date: groomData.birth_date,
          birth_time: groomData.is_time_unknown ? undefined : groomData.birth_time,
          is_time_unknown: groomData.is_time_unknown,
          latitude: groomData.latitude ?? undefined,
          longitude: groomData.longitude ?? undefined,
          iana_timezone: groomData.iana_timezone,
        },
        bride: {
          name: brideData.name,
          gender: brideData.gender,
          birth_date: brideData.birth_date,
          birth_time: brideData.is_time_unknown ? undefined : brideData.birth_time,
          is_time_unknown: brideData.is_time_unknown,
          latitude: brideData.latitude ?? undefined,
          longitude: brideData.longitude ?? undefined,
          iana_timezone: brideData.iana_timezone,
        },
        min_score_threshold: 18.0,
      });
      setMatchResult(match);
    } catch (err: any) {
      setMatchError(err.message || "Failed to generate marriage compatibility report.");
    } finally {
      setIsMatchLoading(false);
    }
  };

  // Handler when dual profiles are detected in a single text/image
  const handleDualProfileDetected = (prof1: IntakeProfile, prof2: IntakeProfile) => {
    setGroomInitialProfile(prof1);
    setBrideInitialProfile(prof2);
    setActiveTab("marriage_match");
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-stone-950 text-stone-100" : "bg-stone-50/60 text-stone-900"}`}>
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-md font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-amber-700 dark:text-amber-400 block leading-tight">
                {t.app_title}
              </span>
              <span className="text-[10px] text-stone-500 hidden sm:block">
                {t.app_subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-amber-600"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Primary Feature Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-stone-200/80 dark:bg-stone-800 p-1.5 rounded-2xl shadow-inner text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("birth_chart");
                setMatchResult(null);
              }}
              className={`px-4 sm:px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === "birth_chart"
                  ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-md"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>{t.tab_birth_chart}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("marriage_match");
                setBirthChart(null);
              }}
              className={`px-4 sm:px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === "marriage_match"
                  ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-md"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{t.tab_marriage_match}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: JANMA KUNDALI (BIRTH CHART) */}
        {activeTab === "birth_chart" && (
          <div>
            {!birthChart ? (
              <div className="max-w-xl mx-auto space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                    Generate Your Janma Kundali
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Upload an existing biodata, paste text/WhatsApp message, or fill in manual birth details.
                  </p>
                </div>

                <IntakePanel
                  panelLabel="Birth Details"
                  onProfileConfirmed={handleGenerateBirthChart}
                  onDualProfileDetected={handleDualProfileDetected}
                />

                {isBirthChartLoading && (
                  <div className="p-4 text-center text-xs text-amber-700 dark:text-amber-400 font-semibold animate-pulse flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Computing high-precision planetary ephemeris, houses, and Vimshottari dasha...
                  </div>
                )}

                {birthChartError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{birthChartError}</span>
                  </div>
                )}
              </div>
            ) : (
              <BirthChartReport
                chart={birthChart}
                onReset={() => setBirthChart(null)}
                onExportPdf={() =>
                  exportReportToPdf(
                    "printable-birth-chart",
                    `${birthChart.metadata.name.replace(/\s+/g, "_")}_Kundali.pdf`
                  )
                }
              />
            )}
          </div>
        )}

        {/* TAB 2: MARRIAGE MATCHING (ASHTAKOOTA & DASA KOOTA) */}
        {activeTab === "marriage_match" && (
          <div>
            {!matchResult ? (
              <div className="space-y-6">
                <div className="text-center max-w-xl mx-auto mb-6">
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                    Kundali Milan: Ashtakoota &amp; Dasa Koota
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Enter or upload details for Groom and Bride independently. Mix and match methods (e.g. upload groom, type bride).
                  </p>
                </div>

                {/* Two Panels: Groom and Bride */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Groom Intake Panel */}
                  <div className="space-y-3">
                    <IntakePanel
                      panelLabel="Groom Details"
                      initialProfile={groomInitialProfile}
                      onProfileConfirmed={(data) => {
                        setGroomData(data);
                        setGroomInitialProfile(null);
                      }}
                      onDualProfileDetected={handleDualProfileDetected}
                    />
                    {groomData && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                        <span>✓ Groom confirmed: <strong>{groomData.name}</strong> ({groomData.birth_date})</span>
                        <button
                          type="button"
                          onClick={() => setGroomData(null)}
                          className="text-[11px] font-semibold text-emerald-700 underline"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bride Intake Panel */}
                  <div className="space-y-3">
                    <IntakePanel
                      panelLabel="Bride Details"
                      initialProfile={brideInitialProfile}
                      onProfileConfirmed={(data) => {
                        setBrideData(data);
                        setBrideInitialProfile(null);
                      }}
                      onDualProfileDetected={handleDualProfileDetected}
                    />
                    {brideData && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                        <span>✓ Bride confirmed: <strong>{brideData.name}</strong> ({brideData.birth_date})</span>
                        <button
                          type="button"
                          onClick={() => setBrideData(null)}
                          className="text-[11px] font-semibold text-emerald-700 underline"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Match Button */}
                <div className="text-center pt-4 max-w-md mx-auto">
                  <button
                    type="button"
                    disabled={!groomData || !brideData || isMatchLoading}
                    onClick={handleGenerateMarriageMatch}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {isMatchLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Evaluating Ashtakoota, Nadi/Bhakoot Cancellations &amp; Dosha Samya...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 fill-white" />
                        Calculate Ashtakoota &amp; Dasa Koota Match
                      </>
                    )}
                  </button>

                  {(!groomData || !brideData) && (
                    <p className="text-[11px] text-stone-500 mt-2">
                      Please confirm both Groom and Bride details above to calculate compatibility.
                    </p>
                  )}

                  {matchError && (
                    <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{matchError}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <MarriageMatchReport
                matchResult={matchResult}
                onReset={() => setMatchResult(null)}
                onExportPdf={() =>
                  exportReportToPdf(
                    "printable-marriage-match",
                    `${matchResult.groom_summary.name}_and_${matchResult.bride_summary.name}_Milan.pdf`
                  )
                }
              />
            )}
          </div>
        )}
      </main>

      {/* DPDP Consent & Session Wipe Button */}
      <ConsentModal />

      {/* Footer with AGPL-3.0 Source Link and Legal Disclaimer */}
      <Footer />
    </div>
  );
}
