"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle, Shield, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { fetchAIExplanation } from "@/lib/api";
import { AIExplanationResponse } from "@/lib/types";

interface AIExplanationCardProps {
  matchResult: any;
  currentLanguage?: string;
}

export const AIExplanationCard: React.FC<AIExplanationCardProps> = ({
  matchResult,
  currentLanguage = "en",
}) => {
  const [optedIn, setOptedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AIExplanationResponse | null>(null);
  const [showPayload, setShowPayload] = useState(false);

  const handleGenerate = async () => {
    if (!optedIn) return;
    setLoading(true);
    setError(null);
    try {
      // Per spec: Kannada LLM translations failed strict entity guardrails (translated poruthams/kootas flagged as hallucinations).
      // We keep English for AI output to ensure absolute astrological precision.
      const res = await fetchAIExplanation(matchResult, true, "en");
      setResponse(res);
      if (!res.is_available && res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to generate AI explanation. Please rely on the calculated report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="print:hidden mt-8 rounded-3xl border-2 border-dashed border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-stone-50 to-purple-500/5 dark:from-amber-950/20 dark:via-stone-900/40 dark:to-purple-950/20 p-6 sm:p-8 shadow-lg transition-all">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-200/60 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Plain-Language Compatibility Explanation</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Optional AI synthesis grounded strictly in classical calculated metrics.
              {currentLanguage === "kn" && (
                <span className="block mt-1 text-amber-700 dark:text-amber-400 font-medium text-[11px]">
                  (ಗಮನಿಸಿ: ಜ್ಯೋತಿಷ್ಯ ನಿಖರತೆಗಾಗಿ ಎಐ ವಿವರಣೆಯನ್ನು ಮೂಲ ಪರಿಭಾಷೆಯಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾಗಿದೆ)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
          <Shield className="w-3.5 h-3.5" />
          <span>AI-generated, not reviewed by an astrologer</span>
        </div>
      </div>

      {/* Opt-in Controls */}
      <div className="mt-5 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={optedIn}
            onChange={(e) => setOptedIn(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer"
          />
          <span className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
            Send my chart summary, without name, date, time or place, to an AI service for an explanation
          </span>
        </label>

        {optedIn && !response?.explanation && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Compatibility (Under 20s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Explanation</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error / Fallback State */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block mb-0.5">AI Explanation Unavailable</span>
            <p className="text-[11px] text-rose-700 dark:text-rose-400">
              The AI explanation could not be verified ({error}). Please consult the deterministic calculated report above.
            </p>
          </div>
        </div>
      )}

      {/* Render AI Content */}
      {response?.explanation && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-300">
          {/* Summary Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-800/80 border border-amber-500/20 shadow-sm space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Astrological Synthesis</span>
            </div>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
              {response.explanation.summary}
            </p>
          </div>

          {/* Strengths & Concerns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Observed Strengths</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                {response.explanation.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2.5">
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Areas for Consideration</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                {response.explanation.concerns.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Questions for Astrologer */}
          {response.explanation.questions_for_astrologer?.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2.5">
              <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recommended Questions for Your Astrologer</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                {response.explanation.questions_for_astrologer.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Inspected Anonymized Payload Drawer */}
          {response.anonymized_payload_sent && (
            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowPayload(!showPayload)}
                className="text-[11px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1.5 transition-colors"
              >
                <span>Inspect Anonymized JSON Payload (Zero PII Guarantee)</span>
                {showPayload ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showPayload && (
                <div className="mt-3 p-3.5 rounded-2xl bg-stone-900 text-stone-300 font-mono text-[10px] overflow-x-auto border border-stone-800">
                  <pre>{JSON.stringify(response.anonymized_payload_sent, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
