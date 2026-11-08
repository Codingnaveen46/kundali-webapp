"use client";

import React, { useState } from "react";
import { BirthChartResponse } from "@/lib/types";
import { ChartContainer } from "../charts/ChartContainer";
import {
  Calendar, Clock, MapPin, AlertTriangle, ShieldCheck, Download,
  Compass, Activity, Sun, Moon, Sparkles, ChevronDown, ChevronUp, CheckCircle2
} from "lucide-react";

interface BirthChartReportProps {
  chart: BirthChartResponse;
  onReset?: () => void;
  onExportPdf?: () => void;
}

export const BirthChartReport: React.FC<BirthChartReportProps> = ({
  chart,
  onReset,
  onExportPdf
}) => {
  const [expandedMdIndex, setExpandedMdIndex] = useState<number | null>(0);
  const { metadata, lagna, planets, panchang, dasha, avakahada, doshas, boundary_warnings } = chart;

  // Stated vs computed verification
  const computedRashi = avakahada.rashi;
  const computedNakshatra = avakahada.nakshatra;

  return (
    <div className="space-y-6" id="printable-birth-chart">
      {/* Top Banner: Profile Name, Birth Details & Privacy Status */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-stone-800 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                Janma Kundali
              </span>
              <span className="text-xs text-amber-200/80">
                {metadata.ayanamsa} Ayanamsa (Chitra Paksha)
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">{metadata.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-amber-100/90 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                {metadata.birth_date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                {metadata.is_time_unknown ? "Time Unknown (Solar Noon)" : metadata.birth_time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                {metadata.is_place_unknown ? "Geocentric Reference" : `${metadata.latitude.toFixed(2)}°N, ${metadata.longitude.toFixed(2)}°E (${metadata.timezone})`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" /> Export Clean PDF
              </button>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="px-3 py-2 bg-amber-950/60 hover:bg-amber-950 text-amber-200 text-xs font-semibold rounded-xl border border-amber-500/40 transition-all"
              >
                New Chart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Boundary (Sandhi) Warnings (< 1° from border) */}
      {boundary_warnings.has_warnings && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Critical Boundary (Sandhi) Notice — Exact Birth Time Required
          </div>
          {boundary_warnings.warnings.map((w, idx) => (
            <p key={idx} className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed pl-6">
              • <strong>{w.target} ({w.type}):</strong> {w.message}
            </p>
          ))}
        </div>
      )}

      {/* Main Grid: Chart Visualizer & Graha Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: SVG Chart (South Indian Default + Switchers) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <ChartContainer planets={planets} lagna={lagna} defaultStyle="south" />
        </div>

        {/* Right Column: Graha Table & Planetary Positions */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-x-auto">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-600" />
            Graha Table & Planetary Longitudes
          </h2>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 font-semibold">
                <th className="py-2 px-2">Graha</th>
                <th className="py-2 px-2">Rashi (Sign)</th>
                <th className="py-2 px-2">Longitude</th>
                <th className="py-2 px-2">Nakshatra</th>
                <th className="py-2 px-1 text-center">Pada</th>
                <th className="py-2 px-1 text-center">House</th>
                <th className="py-2 px-1 text-center">Navamsa</th>
                <th className="py-2 px-1 text-center">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
              {/* Lagna Row */}
              {lagna && (
                <tr className="bg-amber-50/40 dark:bg-amber-950/20 font-bold text-amber-900 dark:text-amber-300">
                  <td className="py-2.5 px-2">Ascendant (Lagna)</td>
                  <td className="py-2.5 px-2">{lagna.sign} ({lagna.sign_sanskrit})</td>
                  <td className="py-2.5 px-2">{lagna.degree_in_sign}° {lagna.minute_in_sign}&apos;</td>
                  <td className="py-2.5 px-2">{lagna.nakshatra}</td>
                  <td className="py-2.5 px-1 text-center">{lagna.pada}</td>
                  <td className="py-2.5 px-1 text-center">1</td>
                  <td className="py-2.5 px-1 text-center">{lagna.navamsa_sign}</td>
                  <td className="py-2.5 px-1 text-center">—</td>
                </tr>
              )}

              {/* 9 Planets */}
              {Object.values(planets).map((p) => (
                <tr key={p.name} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-800 dark:text-stone-200">
                  <td className="py-2 px-2 font-bold flex items-center gap-1.5">
                    {p.name}
                  </td>
                  <td className="py-2 px-2">{p.sign}</td>
                  <td className="py-2 px-2 font-mono text-[11px]">
                    {p.degree_in_sign}° {String(p.minute_in_sign).padStart(2, "0")}&apos;
                  </td>
                  <td className="py-2 px-2">{p.nakshatra}</td>
                  <td className="py-2 px-1 text-center font-bold text-amber-700 dark:text-amber-400">{p.pada}</td>
                  <td className="py-2 px-1 text-center font-bold">{p.house ?? "—"}</td>
                  <td className="py-2 px-1 text-center text-stone-500">{p.navamsa_sign || "—"}</td>
                  <td className="py-2 px-1 text-center">
                    {p.is_retrograde && (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 mr-1">
                        R
                      </span>
                    )}
                    {p.is_combust && (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        C
                      </span>
                    )}
                    {!p.is_retrograde && !p.is_combust && "Direct"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Avakahada Chakra & Panchanga Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panchanga at Birth */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600" />
            Panchanga at Birth
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Tithi</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{panchang.tithi.full_name}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">({panchang.tithi.elapsed_percent}% elapsed)</span>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Vara (Day)</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{panchang.vara.sanskrit} ({panchang.vara.name})</span>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Nakshatra</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{panchang.nakshatra.name}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">({panchang.nakshatra.elapsed_percent}% elapsed)</span>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Yoga</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{panchang.yoga.name} (#{panchang.yoga.number})</span>
            </div>
            <div className="col-span-2 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Karana</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{panchang.karana.name}</span>
              </div>
              {panchang.karana.is_vishti && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 text-[10px] font-bold rounded-full">
                  Vishti (Bhadra)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Avakahada Chakra */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Avakahada Chakra Details
          </h2>
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Varna</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{avakahada.varna}</span>
            </div>
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Vashya</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{avakahada.vashya}</span>
            </div>
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Yoni</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{avakahada.yoni} ({avakahada.yoni_gender})</span>
            </div>
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Gana</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{avakahada.gana}</span>
            </div>
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Nadi</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{avakahada.nadi}</span>
            </div>
            <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">Tatwa</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{avakahada.tatwa}</span>
            </div>
            <div className="col-span-3 p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Moon Sign & Ruler</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {avakahada.rashi} ({avakahada.rashi_sanskrit}) — Ruled by {avakahada.rashi_lord}
                </span>
              </div>
              {avakahada.paya && (
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Paya</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{avakahada.paya.paya}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vimshottari Dasha Engine */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Vimshottari Dasha Timeline (120-Year Solar Cycle)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Balance at birth: <strong>{dasha.balance_at_birth.lord}</strong> ({dasha.balance_at_birth.balance_years.toFixed(2)} years remaining)
            </p>
          </div>

          {/* Current Period Highlight Badge */}
          {dasha.current_period.mahadasha && (
            <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Current: {dasha.current_period.mahadasha} MD &gt; {dasha.current_period.antardasha} AD &gt; {dasha.current_period.pratyantardasha} PD
            </div>
          )}
        </div>

        {/* Mahadasha Accordion List */}
        <div className="space-y-2">
          {dasha.mahadashas.map((md, idx) => {
            const isExpanded = expandedMdIndex === idx;
            return (
              <div
                key={md.lord}
                className={`border rounded-xl transition-all ${
                  md.is_current
                    ? "border-amber-400 bg-amber-50/20 dark:bg-amber-950/20"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedMdIndex(isExpanded ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-sm text-stone-900 dark:text-stone-100">{md.lord} Mahadasha</span>
                    <span className="text-stone-400 font-normal">({md.total_years} yrs)</span>
                    {md.is_current && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded-full">
                        Active Now
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-stone-500 font-mono text-[11px]">
                    <span>{md.start_date.slice(0, 10)} to {md.end_date.slice(0, 10)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Sub-periods: Antardashas */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-200/60 dark:border-stone-800">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                      Antardashas (Bhuktis) under {md.lord}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {md.antardashas.map((ad) => (
                        <div
                          key={ad.lord}
                          className={`p-2.5 rounded-lg border text-left ${
                            ad.is_current
                              ? "bg-amber-100 dark:bg-amber-900/40 border-amber-400 font-bold"
                              : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{md.lord} - {ad.lord}</span>
                            {ad.is_current && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                          <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">
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
      </div>

      {/* Doshas & Classical Evaluations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mangal Dosha Card */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">
            Mangal Dosha (Kuja Dosha)
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
              !doshas.mangal_dosha.is_present
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}>
              {doshas.mangal_dosha.status}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mb-2">
            Mars in sign <strong>{doshas.mangal_dosha.mars_sign}</strong> (House {doshas.mangal_dosha.mars_house_lagna ?? "—"}).
          </p>
          {doshas.mangal_dosha.cancellations.length > 0 && (
            <div className="mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-300">
              <span className="font-bold block mb-1">Classical Cancellations Active:</span>
              {doshas.mangal_dosha.cancellations.map((c, i) => (
                <div key={i} className="text-[11px]">• {c.desc} ({c.citation})</div>
              ))}
            </div>
          )}
        </div>

        {/* Kaal Sarpa Yoga Card */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">
            Kaal Sarpa Yoga
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
              !doshas.kaal_sarpa.is_present
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}>
              {doshas.kaal_sarpa.is_present ? doshas.kaal_sarpa.yoga_name : "No Kaal Sarpa Yoga"}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {doshas.kaal_sarpa.description}
          </p>
        </div>

        {/* Sade Sati Card */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">
            Saturn Transit (Sade Sati)
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
              !doshas.sade_sati.is_active
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}>
              {doshas.sade_sati.phase}
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mb-2">
            {doshas.sade_sati.description}
          </p>
          <p className="text-[11px] text-stone-500 italic border-t border-stone-100 dark:border-stone-800 pt-2">
            {doshas.sade_sati.counsel}
          </p>
        </div>
      </div>
    </div>
  );
};
