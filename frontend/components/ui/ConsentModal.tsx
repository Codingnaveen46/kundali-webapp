"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Trash2, Check, X } from "lucide-react";

export const ConsentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("kundli_dpdp_consent");
    if (!consent) {
      setIsOpen(true);
      setHasConsented(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("kundli_dpdp_consent", "accepted");
    setHasConsented(true);
    setIsOpen(false);
  };

  const handleClearSession = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-3 right-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 bg-white/90 dark:bg-stone-900/90 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-full border border-stone-200 dark:border-stone-700 shadow-md flex items-center gap-1.5 backdrop-blur-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero-Storage Mode Active</span>
        </button>

        <button
          type="button"
          onClick={handleClearSession}
          title="One-click clear all memory and reset session"
          className="p-1.5 bg-white/90 dark:bg-stone-900/90 hover:bg-rose-50 text-rose-600 text-xs rounded-full border border-stone-200 dark:border-stone-700 shadow-md backdrop-blur-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Privacy-First &amp; Zero Storage Guarantee
            </h3>
            <p className="text-xs text-stone-500">
              India&apos;s Digital Personal Data Protection (DPDP) Principles
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
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

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Understand &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
