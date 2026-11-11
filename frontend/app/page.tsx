"use client";

import React, { useState } from "react";
import { fetchBirthChart, fetchMarriageMatch } from "@/lib/api";
import { BirthChartResponse, MarriageMatchResponse, IntakeProfile } from "@/lib/types";
import { IntakePanel } from "@/components/intake/IntakePanel";
import { ManualFormData } from "@/components/intake/ManualForm";
import { BirthChartReport } from "@/components/reports/BirthChartReport";
import { MarriageMatchReport } from "@/components/reports/MarriageMatchReport";
import { ZodiacWheel } from "@/components/charts/ZodiacWheel";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConsentModal } from "@/components/ui/ConsentModal";
import { Footer } from "@/components/ui/Footer";
import { LanguageCode, TRANSLATIONS } from "@/i18n/translations";
import { Moon, Heart, Sparkles, AlertCircle, RefreshCw, Compass } from "lucide-react";

/** Opens the dedicated print layout route (browser print-to-PDF, selectable text). */
function openPrintLayout(path: string): void {
  window.location.assign(path);
}

export default function Home() {
  const [lang, setLang] = useState<LanguageCode>("en");
  const [activeTab, setActiveTab] = useState<"birth_chart" | "marriage_match">("birth_chart");
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
        place_of_birth: formData.place_of_birth,
        latitude: formData.latitude ?? undefined,
        longitude: formData.longitude ?? undefined,
        iana_timezone: formData.iana_timezone,
        ayanamsa: "LAHIRI",
        house_system: "W",
        node_type: "mean",
      });
      setBirthChart(chart);
      // Persist for the dedicated print route (kept in session storage only; never on any server)
      try {
        sessionStorage.setItem("kundli:lastBirthChart", JSON.stringify(chart));
      } catch {
        /* storage unavailable (private mode) — print route refetches */
      }
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
          node_type: "mean",
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
          node_type: "mean",
        },
        node_type: "mean",
      });
      setMatchResult(match);
      // Persist for the dedicated print route (kept in session storage only; never on any server)
      try {
        sessionStorage.setItem("kundli:lastMatch", JSON.stringify(match));
      } catch {
        /* storage unavailable (private mode) — print route refetches */
      }
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
    <div className="min-h-screen dark bg-stone-950 text-stone-100">
      {/* Full-page cosmic background: animated zodiac wheel + stars */}
      <ZodiacWheel variant="ambient" />

      <div className="relative z-10">
      {/* Refined Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-stone-900/85 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800 shadow-sm py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold ring-2 ring-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-stone-50 font-serif-vedic">
                  {t.app_title}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Compass className="w-2.5 h-2.5" /> Swiss Ephemeris
                </span>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                {t.app_subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Primary Feature Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-stone-200/70 dark:bg-stone-800/80 p-1.5 rounded-2xl shadow-inner text-xs sm:text-sm font-bold border border-stone-300/40 dark:border-stone-700/60 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setActiveTab("birth_chart");
                setMatchResult(null);
              }}
              className={`px-5 sm:px-7 py-3 rounded-xl transition-all duration-200 flex items-center gap-2.5 ${
                activeTab === "birth_chart"
                  ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-md shadow-amber-500/5 ring-1 ring-stone-900/5"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="tracking-tight">{t.tab_birth_chart}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("marriage_match");
                setBirthChart(null);
              }}
              className={`px-5 sm:px-7 py-3 rounded-xl transition-all duration-200 flex items-center gap-2.5 ${
                activeTab === "marriage_match"
                  ? "bg-white dark:bg-stone-700 text-rose-700 dark:text-rose-400 shadow-md shadow-rose-500/5 ring-1 ring-stone-900/5"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <span className="tracking-tight">{t.tab_marriage_match}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: JANMA KUNDALI (BIRTH CHART) */}
        {activeTab === "birth_chart" && (
          <div>
            {!birthChart ? (
              <div className="max-w-xl mx-auto space-y-4">
                <div className="relative overflow-hidden rounded-3xl border border-amber-900/20 dark:border-amber-900/40 shadow-xl mb-6 bg-stone-950">
                  <ZodiacWheel />
                  {/* Scrim: keeps the heading readable over the bright wheel */}
                  <div className="absolute inset-0 bg-stone-950/45 pointer-events-none" />
                  <div className="relative z-10 px-6 py-12 sm:py-16 text-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-amber-50 font-serif-vedic drop-shadow-[0_2px_14px_rgba(12,10,9,0.95)]">
                      Generate Your Janma Kundali
                    </h2>
                    <p className="text-xs text-amber-100/85 mt-2 drop-shadow-[0_1px_8px_rgba(12,10,9,0.9)]">
                      Fill in the manual birth details below.
                    </p>
                  </div>
                </div>

                <IntakePanel
                  panelLabel="Birth Details"
                  onProfileConfirmed={handleGenerateBirthChart}
                  onDualProfileDetected={handleDualProfileDetected}
                />

                {isBirthChartLoading && (
                  <div className="p-5 bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl border border-amber-500/30 text-center text-xs text-amber-800 dark:text-amber-300 font-bold animate-pulse flex items-center justify-center gap-2.5 shadow-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Computing high-precision planetary ephemeris, houses, and Vimshottari dasha...</span>
                  </div>
                )}

                {birthChartError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 shadow-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{birthChartError}</span>
                  </div>
                )}
              </div>
            ) : (
              <BirthChartReport
                chart={birthChart}
                onReset={() => {
                  setBirthChart(null);
                  sessionStorage.removeItem("kundli:lastBirthChart");
                }}
                onExportPdf={() => openPrintLayout("/print/janma")}
              />
            )}
          </div>
        )}

        {/* TAB 2: MARRIAGE MATCHING (ASHTAKOOTA & DASA KOOTA) */}
        {activeTab === "marriage_match" && (
          <div>
            {!matchResult ? (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-3xl border border-amber-900/20 dark:border-amber-900/40 shadow-xl mb-2 bg-stone-950">
                  <ZodiacWheel />
                  {/* Scrim: keeps the heading readable over the bright wheel */}
                  <div className="absolute inset-0 bg-stone-950/45 pointer-events-none" />
                  <div className="relative z-10 px-6 py-12 sm:py-16 text-center max-w-xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-black text-amber-50 font-serif-vedic drop-shadow-[0_2px_14px_rgba(12,10,9,0.95)]">
                      Kundali Milan: Ashtakoota &amp; Dasa Koota
                    </h2>
                    <p className="text-xs text-amber-100/85 mt-2 drop-shadow-[0_1px_8px_rgba(12,10,9,0.9)]">
                      Enter the birth details for Groom and Bride independently.
                    </p>
                  </div>
                </div>

                {/* Two Panels: Groom and Bride */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Groom Intake Panel */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        Groom Details (Varana)
                      </span>
                    </div>
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
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between shadow-sm">
                        <span className="font-medium">
                          ✓ Groom confirmed: <strong>{groomData.name}</strong> ({groomData.birth_date})
                        </span>
                        <button
                          type="button"
                          onClick={() => setGroomData(null)}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline hover:no-underline px-2 py-0.5"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bride Intake Panel */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                        Bride Details (Kanya)
                      </span>
                    </div>
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
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between shadow-sm">
                        <span className="font-medium">
                          ✓ Bride confirmed: <strong>{brideData.name}</strong> ({brideData.birth_date})
                        </span>
                        <button
                          type="button"
                          onClick={() => setBrideData(null)}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline hover:no-underline px-2 py-0.5"
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
                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 via-amber-700 to-rose-600 hover:from-amber-700 hover:to-rose-700 disabled:opacity-40 text-white font-extrabold rounded-2xl shadow-xl shadow-amber-600/25 transition-all duration-200 flex items-center justify-center gap-2.5 text-sm active:scale-98"
                  >
                    {isMatchLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Evaluating Ashtakoota, Nadi/Bhakoot Cancellations &amp; Dosha Samya...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 fill-white" />
                        <span>Calculate Ashtakoota &amp; Dasa Koota Match</span>
                      </>
                    )}
                  </button>

                  {(!groomData || !brideData) && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2.5">
                      Please confirm both Groom and Bride details above to calculate compatibility.
                    </p>
                  )}

                  {matchError && (
                    <div className="mt-3.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center gap-2 shadow-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{matchError}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <MarriageMatchReport
                matchResult={matchResult}
                onReset={() => {
                  setMatchResult(null);
                  sessionStorage.removeItem("kundli:lastMatch");
                }}
                onExportPdf={() => openPrintLayout("/print/match")}
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
    </div>
  );
}
