"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Trash2, Check } from "lucide-react";

export const ConsentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("kundli_dpdp_consent");
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("kundli_dpdp_consent", "accepted");
    setIsOpen(false);
  };

  const handleClearSession = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 no-print">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 bg-white/95 dark:bg-stone-900/95 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-2xl border border-stone-200 dark:border-stone-700/80 shadow-lg flex items-center gap-2 backdrop-blur-md transition-all active:scale-95"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Zero-Storage Mode Active</span>
        </button>

        <button
          type="button"
          onClick={handleClearSession}
          title="One-click clear all memory and reset session"
          className="p-2 bg-white/95 dark:bg-stone-900/95 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs rounded-2xl border border-stone-200 dark:border-stone-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 font-serif-vedic">
              Privacy-First &amp; Zero Storage Guarantee
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              India&apos;s Digital Personal Data Protection (DPDP) Principles
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          <p>
            • <strong>Zero Storage by Default:</strong> We do not store your birth details, biodatas, or reports on our servers. All calculations and PDF renderings occur statelessly or directly in your browser.
          </p>
          <p>
            • <strong>No Tracking or Profiling:</strong> We employ no third-party trackers, advertisements, or telemetry cookies.
          </p>
          <p>
            • <strong>One-Click Clear:</strong> You can completely wipe all local session memory at any time with a single tap.
          </p>
          <p>
            • <strong>No Paid Fear-Based Remedies:</strong> We do not sell gemstones, poojas, or fear-mongering remedies.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>I Understand &amp; Consent</span>
          </button>
        </div>
      </div>
    </div>
  );
};
