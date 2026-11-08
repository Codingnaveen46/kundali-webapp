"use client";

import React, { useState } from "react";
import { MarriageMatchResponse } from "@/lib/types";
import {
  Heart, ShieldCheck, Download, AlertTriangle, CheckCircle2,
  Sparkles, Sliders, ChevronDown, ChevronUp, User
} from "lucide-react";

interface MarriageMatchReportProps {
  matchResult: MarriageMatchResponse;
  onReset?: () => void;
  onExportPdf?: () => void;
}

export const MarriageMatchReport: React.FC<MarriageMatchReportProps> = ({
  matchResult,
  onReset,
  onExportPdf
}) => {
  const { groom_summary, bride_summary, ashtakoota, dasa_koota, dosha_samya, boundary_alerts } = matchResult;
  const [minThreshold, setMinThreshold] = useState<number>(ashtakoota.min_score_threshold || 18);
  const [expandedKootaIndex, setExpandedKootaIndex] = useState<number | null>(null);

  const isCompatible = ashtakoota.total_points >= minThreshold && ashtakoota.active_doshas.length === 0;

  return (
    <div className="space-y-6" id="printable-marriage-match">
      {/* Top Banner: Couple Names & Overall Match Verdict */}
      <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-stone-800 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-300 text-rose-300" />
                Ashtakoota Guna Milan & Dasa Koota
              </span>
              <span className="text-xs text-amber-200">
                Classical Parashari & South Indian Porutham Systems
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {groom_summary.name} &amp; {bride_summary.name}
            </h1>
            <p className="text-xs text-rose-100/90 mt-1 max-w-xl leading-relaxed">
              {ashtakoota.summary}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-3xl font-black text-amber-200">
                {ashtakoota.total_points} <span className="text-sm font-normal text-rose-200">/ 36 Gunas</span>
              </div>
              <div className="text-xs font-bold text-white/90">
                {ashtakoota.percentage}% Compatibility
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
                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-950 text-rose-200 text-xs font-semibold rounded-xl border border-rose-500/40 transition-all"
                >
                  New Match
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Configurator Banner ("Score alone is not enough") */}
      <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-stone-800 dark:text-stone-200">
            Configurable Baseline Threshold:
          </span>
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-400 font-bold rounded">
            {minThreshold} / 36 points
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-stone-500">Adjust threshold:</label>
          <input
            type="range"
            min="14"
            max="28"
            step="1"
            value={minThreshold}
            onChange={(e) => setMinThreshold(Number(e.target.value))}
            className="w-32 accent-amber-600"
          />
        </div>
      </div>

      {/* Groom & Bride Two-Panel Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groom Panel */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
            <User className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Groom: {groom_summary.name}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Rashi &amp; Nakshatra</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {groom_summary.rashi} • {groom_summary.nakshatra} (Pada {groom_summary.pada})
              </span>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Gana &amp; Yoni</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {groom_summary.gana} • {groom_summary.yoni}
              </span>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Nadi</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{groom_summary.nadi}</span>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Mangal Dosha</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{groom_summary.mangal_dosha}</span>
            </div>
          </div>
        </div>

        {/* Bride Panel */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
            <User className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Bride: {bride_summary.name}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Rashi &amp; Nakshatra</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {bride_summary.rashi} • {bride_summary.nakshatra} (Pada {bride_summary.pada})
              </span>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Gana &amp; Yoni</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {bride_summary.gana} • {bride_summary.yoni}
              </span>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Nadi</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{bride_summary.nadi}</span>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
              <span className="text-stone-400 block text-[10px]">Mangal Dosha</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{bride_summary.mangal_dosha}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ashtakoota 36 Milan Table with Per-Koota Breakdown & Cancellations */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Ashtakoota Milan (8 Classical Dimensions — 36 Points)
            </h2>
            <p className="text-xs text-stone-500">
              Each koota evaluates a psychological, physical, or spiritual facet with classical cancellation checks.
            </p>
          </div>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
            Total: {ashtakoota.total_points} / 36
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 font-semibold">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Koota</th>
              <th className="py-2.5 px-2 text-center">Max</th>
              <th className="py-2.5 px-2 text-center">Score</th>
              <th className="py-2.5 px-3">Groom Value</th>
              <th className="py-2.5 px-3">Bride Value</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3">Explanation &amp; Cancellations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
            {ashtakoota.kootas.map((k, idx) => (
              <tr key={k.koota} className="hover:bg-stone-50 dark:hover:bg-stone-800/30">
                <td className="py-3 px-3 text-stone-400 font-mono">{idx + 1}</td>
                <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">
                  {k.koota}
                </td>
                <td className="py-3 px-2 text-center text-stone-400">{k.max_points}</td>
                <td className="py-3 px-2 text-center font-bold text-amber-700 dark:text-amber-400 text-sm font-mono">
                  {k.points}
                </td>
                <td className="py-3 px-3 text-stone-600 dark:text-stone-300">{k.groom_value}</td>
                <td className="py-3 px-3 text-stone-600 dark:text-stone-300">{k.bride_value}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    k.status === "Full"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : k.status === "Cancelled"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      : k.status === "Partial" || k.status === "Good" || k.status === "Average"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}>
                    {k.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed max-w-xs">
                  {k.description}
                  {k.cancellations && k.cancellations.length > 0 && (
                    <div className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      ✓ Cancelled: {k.cancellations[0]}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dasa Koota (10 Poruthams) & Dosha Samya */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dasa Koota (10 Poruthams) South Indian Method */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Dasa Koota (10 Poruthams — South Indian)
              </h2>
              <span className="text-xs text-stone-500">
                Primary focus on Rajju (Mangalya) and Vedha (Affliction Immunity)
              </span>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
              {dasa_koota.poruthams_matched} / 10 Agreed
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {dasa_koota.poruthams.map((p) => (
              <div
                key={p.name}
                className="p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    {p.name}
                    <span className="text-[10px] font-normal text-stone-400">({p.dimension})</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">{p.explanation}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  p.is_compatible
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                }`}>
                  {p.rating}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dosha Samya (Mars Dosha Balance) */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Dosha Samya (Mars Dosha Neutralization)
              </h2>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                dosha_samya.is_balanced
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}>
                {dosha_samya.verdict}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-center">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Groom Dosha Points</span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono">
                  {dosha_samya.groom_points.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-center">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Bride Dosha Points</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {dosha_samya.bride_points.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              {dosha_samya.explanation}
            </p>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200/60 dark:border-stone-800 text-xs text-stone-500">
            <strong>Classical Jyotish Insight:</strong> Muhurtha Chintamani advises that true marital compatibility encompasses four pillars: mental harmony (Graha Maitri &amp; Gana), biological affinity (Yoni &amp; Nadi), Mars balance (Dosha Samya), and D9 Navamsa dignity.
          </div>
        </div>
      </div>
    </div>
  );
};
